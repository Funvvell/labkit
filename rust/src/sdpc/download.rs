//! First-run SDPC decoder bootstrap.
//!
//! The vendor DLL cannot be redistributed inside LabKit's installer, so the
//! app fetches the official `sdpc-for-python` wheel from PyPI on first use,
//! verifies its SHA-256 and extracts only `sdpc/WINDOWS/dll/*` into the user
//! cache. After that the slide opens completely offline — no Python, no pip.

use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde::Deserialize;
use sha2::{Digest, Sha256};

use crate::constants::SESSION_DIR_NAME;
use crate::errors::{AppError, Result};
use crate::sdpc::loader;

pub const PACKAGE: &str = "sdpc-for-python";
pub const FALLBACK_VERSION: &str = "1.0.5";
pub const FALLBACK_URL: &str = "https://files.pythonhosted.org/packages/4f/9a/db5c47090285d0072749657ba5e573dc7d5aff946f9552741429de91b550/sdpc_for_python-1.0.5-py3-none-any.whl";
pub const FALLBACK_SHA256: &str = "09c824f28c684828f7894b9fc82ac3e1d31efe989a56196f9fe68f6a970c544c";
pub const FALLBACK_SIZE: u64 = 62_433_674;

static DOWNLOAD_LOCK: Mutex<()> = Mutex::new(());

#[derive(Debug, Clone)]
pub struct Progress {
    pub stage: &'static str,
    pub received: u64,
    pub total: u64,
}

#[derive(Debug, Deserialize)]
struct PypiRoot {
    info: PypiInfo,
    urls: Vec<PypiFile>,
}

#[derive(Debug, Deserialize)]
struct PypiInfo {
    version: String,
}

#[derive(Debug, Deserialize)]
struct PypiFile {
    filename: String,
    url: String,
    packagetype: String,
    size: u64,
    #[serde(default)]
    yanked: bool,
    digests: PypiDigests,
}

#[derive(Debug, Deserialize)]
struct PypiDigests {
    sha256: String,
}

struct RemoteWheel {
    version: String,
    url: String,
    sha256: String,
    size: u64,
}

pub fn cache_root() -> Option<PathBuf> {
    dirs::home_dir().map(|h| {
        h.join(SESSION_DIR_NAME)
            .join("decoders")
            .join("sdpc")
    })
}

/// The extracted `WINDOWS/dll` directory, if a previous bootstrap succeeded.
pub fn cached_dll_dir() -> Option<PathBuf> {
    let root = cache_root()?;
    let entries = fs::read_dir(root).ok()?;
    let mut candidates: Vec<PathBuf> = entries
        .flatten()
        .map(|e| e.path())
        .filter(|p| p.is_dir())
        .collect();
    candidates.sort();
    candidates.reverse();
    for dir in candidates {
        let dll = dir.join("WINDOWS").join("dll").join("DecodeSdpcDll.dll");
        if dll.exists() {
            return Some(dir.join("WINDOWS").join("dll"));
        }
    }
    None
}

/// Ensure the decoder exists, downloading it if needed. Emits coarse progress
/// so the UI can show a determinate 62 MB bar instead of a frozen window.
pub fn ensure<F>(mut on_progress: F) -> Result<PathBuf>
where
    F: FnMut(Progress),
{
    if let Ok(dir) = loader::find_dll_dir() {
        return Ok(dir);
    }
    let _guard = DOWNLOAD_LOCK
        .lock()
        .unwrap_or_else(|e| e.into_inner());
    if let Ok(dir) = loader::find_dll_dir() {
        return Ok(dir);
    }

    on_progress(Progress {
        stage: "checking",
        received: 0,
        total: 0,
    });
    let wheel = resolve_wheel()?;
    let root = cache_root()
        .ok_or_else(|| AppError::Dll("无法定位用户缓存目录（home dir 不可用）".into()))?
        .join(&wheel.version);
    let dll_dir = root.join("WINDOWS").join("dll");
    if dll_dir.join("DecodeSdpcDll.dll").exists() {
        return Ok(dll_dir);
    }
    fs::create_dir_all(&root)?;

    let part = root.join(format!("{PACKAGE}-{}.whl.part", wheel.version));
    download(&wheel, &part, &mut on_progress)?;
    on_progress(Progress {
        stage: "verify",
        received: wheel.size,
        total: wheel.size,
    });
    verify_sha256(&part, &wheel.sha256)?;

    on_progress(Progress {
        stage: "extract",
        received: wheel.size,
        total: wheel.size,
    });
    extract_dlls(&part, &dll_dir)?;
    if !dll_dir.join("DecodeSdpcDll.dll").exists() {
        return Err(AppError::Dll(
            "PyPI 包解压后未找到 DecodeSdpcDll.dll，包结构可能已变更".into(),
        ));
    }
    let _ = fs::remove_file(&part);
    let manifest = serde_json::json!({
        "package": PACKAGE,
        "version": wheel.version,
        "sha256": wheel.sha256,
        "source": wheel.url,
        "dll_dir": dll_dir.to_string_lossy(),
    });
    let _ = fs::write(
        root.join("component.json"),
        serde_json::to_string_pretty(&manifest)?,
    );
    on_progress(Progress {
        stage: "done",
        received: wheel.size,
        total: wheel.size,
    });
    Ok(dll_dir)
}

fn resolve_wheel() -> Result<RemoteWheel> {
    let client = http_client()?;
    let json_url = format!("https://pypi.org/pypi/{PACKAGE}/json");
    if let Ok(resp) = client.get(&json_url).send() {
        if let Ok(root) = resp.json::<PypiRoot>() {
            if let Some(file) = root
                .urls
                .into_iter()
                .filter(|f| {
                    f.packagetype == "bdist_wheel"
                        && f.filename.ends_with(".whl")
                        && !f.yanked
                        && !f.digests.sha256.is_empty()
                })
                .max_by_key(|f| f.size)
            {
                return Ok(RemoteWheel {
                    version: root.info.version,
                    url: file.url,
                    sha256: file.digests.sha256,
                    size: file.size,
                });
            }
        }
    }
    tracing::warn!("PyPI JSON 不可用，使用内置 1.0.5 固定地址回退");
    Ok(RemoteWheel {
        version: FALLBACK_VERSION.into(),
        url: FALLBACK_URL.into(),
        sha256: FALLBACK_SHA256.into(),
        size: FALLBACK_SIZE,
    })
}

fn http_client() -> Result<reqwest::blocking::Client> {
    reqwest::blocking::Client::builder()
        .user_agent(format!("LabKit/{} (+https://github.com/Funvvell/labkit)", env!("CARGO_PKG_VERSION")))
        .connect_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(900))
        .build()
        .map_err(|e| AppError::Other(format!("HTTP 客户端初始化失败: {e}")))
}

fn download<F>(wheel: &RemoteWheel, dest: &Path, on_progress: &mut F) -> Result<()>
where
    F: FnMut(Progress),
{
    let client = http_client()?;
    let mut resp = client
        .get(&wheel.url)
        .send()
        .and_then(|r| r.error_for_status())
        .map_err(|e| {
            AppError::Dll(format!(
                "下载 SDPC 解码组件失败: {e}。可在浏览器打开 {} 手动下载后重试。",
                wheel.url
            ))
        })?;
    let total = resp.content_length().unwrap_or(wheel.size);
    let mut file = File::create(dest)?;
    let mut buf = vec![0u8; 1024 * 256];
    let mut received: u64 = 0;
    let mut last_emit = Instant::now();
    on_progress(Progress {
        stage: "download",
        received: 0,
        total,
    });
    loop {
        let n = resp.read(&mut buf)?;
        if n == 0 {
            break;
        }
        file.write_all(&buf[..n])?;
        received += n as u64;
        if last_emit.elapsed() >= Duration::from_millis(250) {
            last_emit = Instant::now();
            on_progress(Progress {
                stage: "download",
                received,
                total,
            });
        }
    }
    file.flush()?;
    on_progress(Progress {
        stage: "download",
        received,
        total,
    });
    // Cheap guard against a captive-portal HTML page.
    if received < 1024 * 1024 {
        return Err(AppError::Dll(format!(
            "下载内容异常（仅 {received} 字节），可能被网络代理拦截"
        )));
    }
    Ok(())
}

fn verify_sha256(path: &Path, expected: &str) -> Result<()> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buf = vec![0u8; 1024 * 256];
    loop {
        let n = file.read(&mut buf)?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }
    let actual = hex(&hasher.finalize());
    if !actual.eq_ignore_ascii_case(expected) {
        let _ = fs::remove_file(path);
        return Err(AppError::Dll(format!(
            "SHA-256 校验失败：期望 {expected}，实际 {actual}"
        )));
    }
    Ok(())
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

fn extract_dlls(wheel: &Path, out_dir: &Path) -> Result<()> {
    let file = File::open(wheel)?;
    let mut zip =
        zip::ZipArchive::new(file).map_err(|e| AppError::Dll(format!("wheel 不是有效 zip: {e}")))?;
    fs::create_dir_all(out_dir)?;
    let prefix = "sdpc/WINDOWS/dll/";
    let mut extracted = 0usize;
    for i in 0..zip.len() {
        let mut entry = zip
            .by_index(i)
            .map_err(|e| AppError::Dll(format!("读取 wheel 条目失败: {e}")))?;
        let Some(name) = entry.enclosed_name() else {
            continue;
        };
        let name = name.to_string_lossy().replace('\\', "/");
        let Some(rel) = name.strip_prefix(prefix) else {
            continue;
        };
        if rel.is_empty() || entry.is_dir() {
            continue;
        }
        let target = out_dir.join(rel);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)?;
        }
        let mut writer = File::create(&target)?;
        std::io::copy(&mut entry, &mut writer)?;
        extracted += 1;
    }
    if extracted == 0 {
        return Err(AppError::Dll(
            "wheel 中没有 sdpc/WINDOWS/dll 目录，包结构可能已变更".into(),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fallback_hash_is_hex64() {
        assert_eq!(FALLBACK_SHA256.len(), 64);
        assert!(FALLBACK_SHA256.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn cache_root_is_stable() {
        // Not touching the filesystem: only the suffix shape is asserted.
        if let Some(p) = cache_root() {
            assert!(p.ends_with("decoders/sdpc"));
        }
    }

    /// Network test, opt-in: resolves the wheel from PyPI, downloads it, checks
    /// SHA-256 and extracts the vendor DLLs. Run with:
    /// `cargo test sdpc::download::tests::bootstrap_from_pypi -- --ignored --nocapture`
    #[test]
    #[ignore = "downloads ~62 MB from PyPI"]
    fn bootstrap_from_pypi() {
        let wheel = resolve_wheel().expect("resolve wheel");
        println!(
            "wheel {} {} bytes {}",
            wheel.version, wheel.size, wheel.sha256
        );
        let tmp = tempfile::tempdir().expect("temp dir");
        let part = tmp.path().join("sdpc.whl");
        let mut progress = |p: Progress| {
            if p.stage == "download" {
                println!("download {}/{}", p.received, p.total);
            }
        };
        download(&wheel, &part, &mut progress).expect("download");
        verify_sha256(&part, &wheel.sha256).expect("sha256");
        let dll_dir = tmp.path().join("dll");
        extract_dlls(&part, &dll_dir).expect("extract");
        assert!(dll_dir.join("DecodeSdpcDll.dll").exists());
        let count = fs::read_dir(&dll_dir).expect("read dll dir").count();
        println!("extracted {count} files to {}", dll_dir.display());
        assert!(count >= 2);
    }
}

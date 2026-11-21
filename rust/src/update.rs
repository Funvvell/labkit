//! 应用内更新：检查 GitHub Release 的 latest.json、下载校验、重启后自替换 exe。
//!
//! 分发形态是便携单 exe + NSIS 默认 CurrentUser 安装，两者都落在可写目录，
//! 因此不引入 tauri-plugin-updater（需要签名密钥且会把便携版装成安装版），
//! 直接替换当前 exe：下载到同目录 → helper 进程等旧进程退出 → rename 覆盖 → 重启。

use std::collections::HashMap;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::Emitter;

const MANIFEST_URL: &str =
    "https://github.com/Funvvell/labkit/releases/latest/download/latest.json";
const UA: &str = concat!("LabKit-Updater/", env!("CARGO_PKG_VERSION"));
const MAX_MANIFEST_BYTES: u64 = 256 * 1024;
const MAX_EXE_BYTES: u64 = 256 * 1024 * 1024;
const ALLOWED_HOSTS: [&str; 3] = [
    "github.com",
    "objects.githubusercontent.com",
    "release-assets.githubusercontent.com",
];

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformAsset {
    pub url: String,
    pub sha256: String,
    #[serde(default)]
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Manifest {
    pub version: String,
    #[serde(default)]
    pub notes: String,
    #[serde(default)]
    pub pub_date: String,
    pub platforms: HashMap<String, PlatformAsset>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCheck {
    pub available: bool,
    pub current: String,
    pub latest: String,
    pub notes: String,
    pub pub_date: String,
    pub size: u64,
    /// exe 所在目录是否可写（不可写时前端降级为「打开发布页手动安装」）。
    pub writable: bool,
    pub dir: String,
}

/// 调试构建可指向本地 latest.json 做端到端验证；发布构建只认常量，
/// 环境变量在编译期就被剥掉，避免被劫持更新源。
pub fn manifest_url() -> String {
    #[cfg(debug_assertions)]
    if let Ok(v) = std::env::var("LABKIT_UPDATE_MANIFEST") {
        let v = v.trim();
        if !v.is_empty() {
            return v.to_string();
        }
    }
    MANIFEST_URL.to_string()
}

fn debug_loopback(u: &url::Url) -> bool {
    cfg!(debug_assertions) && u.scheme() == "http" && matches!(u.host_str(), Some("127.0.0.1") | Some("localhost"))
}

pub fn validate_url(raw: &str) -> Result<url::Url, String> {
    let u = url::Url::parse(raw).map_err(|e| format!("更新地址解析失败：{e}"))?;
    if debug_loopback(&u) {
        return Ok(u);
    }
    if u.scheme() != "https" {
        return Err(format!("更新地址必须使用 HTTPS：{raw}"));
    }
    let host = u.host_str().unwrap_or("");
    if !ALLOWED_HOSTS.contains(&host) {
        return Err(format!("更新地址主机不在白名单：{host}"));
    }
    Ok(u)
}

pub fn normalize_version(v: &str) -> String {
    v.trim().trim_start_matches(['v', 'V']).to_string()
}

pub fn valid_version(v: &str) -> bool {
    let v = normalize_version(v);
    if v.is_empty() || v.len() > 40 {
        return false;
    }
    if !v.chars().next().map(|c| c.is_ascii_digit()).unwrap_or(false) {
        return false;
    }
    v.chars().all(|c| c.is_ascii_digit() || matches!(c, '.' | '-' | '+' | '_') || c.is_ascii_alphabetic())
}

fn valid_sha256(s: &str) -> bool {
    s.len() == 64 && s.bytes().all(|b| b.is_ascii_hexdigit())
}

pub fn is_newer(latest: &str, current: &str) -> bool {
    crate::plugins::version_at_least(latest, current)
        && !crate::plugins::version_at_least(current, latest)
}

pub fn parse_manifest(bytes: &[u8]) -> Result<Manifest, String> {
    let mut m: Manifest =
        serde_json::from_slice(bytes).map_err(|e| format!("更新清单解析失败：{e}"))?;
    m.version = normalize_version(&m.version);
    if !valid_version(&m.version) {
        return Err(format!("更新清单版本号非法：{}", m.version));
    }
    if m.notes.chars().count() > 4000 {
        m.notes = m.notes.chars().take(4000).collect();
    }
    Ok(m)
}

/// 当前平台对应的资产；同时完成 URL / 哈希 / 大小的合法性检查。
pub fn platform_asset(m: &Manifest) -> Result<&PlatformAsset, String> {
    let key = format!("windows-{}", std::env::consts::ARCH);
    let a = m
        .platforms
        .get(&key)
        .ok_or_else(|| format!("更新清单缺少 {key} 资产"))?;
    validate_url(&a.url)?;
    if !valid_sha256(&a.sha256) {
        return Err("更新清单缺少有效的 SHA-256".into());
    }
    if a.size > MAX_EXE_BYTES {
        return Err("更新包超过大小上限".into());
    }
    Ok(a)
}

fn client(total_secs: u64) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .user_agent(UA)
        .connect_timeout(Duration::from_secs(6))
        .timeout(Duration::from_secs(total_secs))
        .redirect(reqwest::redirect::Policy::limited(5))
        .build()
        .map_err(|e| format!("HTTP 客户端初始化失败：{e}"))
}

async fn fetch_manifest() -> Result<Manifest, String> {
    fetch_manifest_from(&manifest_url()).await
}

async fn fetch_manifest_from(raw_url: &str) -> Result<Manifest, String> {
    let target = validate_url(raw_url)?;
    let cli = client(20)?;
    let r = cli
        .get(target)
        .send()
        .await
        .map_err(|e| format!("检查更新失败（网络不可用或超时）：{e}"))?;
    let status = r.status();
    if status == reqwest::StatusCode::NOT_FOUND {
        return Err("更新服务尚未就绪（当前 Release 还没有 latest.json）".into());
    }
    if !status.is_success() {
        return Err(format!("检查更新失败：HTTP {status}"));
    }
    validate_url(r.url().as_str())?;
    if r.content_length().unwrap_or(0) > MAX_MANIFEST_BYTES {
        return Err("更新清单异常（体积过大）".into());
    }
    let bytes = r
        .bytes()
        .await
        .map_err(|e| format!("读取更新清单失败：{e}"))?;
    if bytes.len() as u64 > MAX_MANIFEST_BYTES {
        return Err("更新清单异常（体积过大）".into());
    }
    parse_manifest(&bytes)
}

fn probe_writable(dir: &Path) -> bool {
    let p = dir.join(format!(".labkit-write-probe-{}", std::process::id()));
    match std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&p)
    {
        Ok(_) => {
            let _ = std::fs::remove_file(&p);
            true
        }
        Err(_) => false,
    }
}

fn updater_dir() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join("LabKit")
        .join("updater")
}

#[tauri::command]
pub async fn update_check() -> Result<UpdateCheck, String> {
    let current = env!("CARGO_PKG_VERSION").to_string();
    let m = fetch_manifest().await?;
    let size = platform_asset(&m)?.size;
    let newer = is_newer(&m.version, &current);
    let exe = std::env::current_exe().map_err(|e| format!("无法定位程序位置：{e}"))?;
    let dir = exe
        .parent()
        .map(Path::to_path_buf)
        .ok_or("无法定位程序目录")?;
    let writable = if newer { probe_writable(&dir) } else { true };
    Ok(UpdateCheck {
        available: newer,
        current,
        latest: m.version,
        notes: m.notes,
        pub_date: m.pub_date,
        size,
        writable,
        dir: dir.to_string_lossy().into_owned(),
    })
}

/// 下载失败 / 校验失败时自动删除半包；成功交给 helper 后才解除。
struct CleanupFile(Option<PathBuf>);

impl Drop for CleanupFile {
    fn drop(&mut self) {
        if let Some(p) = self.0.take() {
            let _ = std::fs::remove_file(p);
        }
    }
}

#[tauri::command]
pub async fn update_install(app: tauri::AppHandle, version: String) -> Result<(), String> {
    let m = fetch_manifest().await?;
    let asset = platform_asset(&m)?.clone();
    let want = normalize_version(&version);
    if m.version != want {
        return Err(format!(
            "Release 最新版本 {} 与请求版本 {version} 不一致",
            m.version
        ));
    }
    if !is_newer(&m.version, env!("CARGO_PKG_VERSION")) {
        return Err("当前已是最新版本".into());
    }

    let exe = std::env::current_exe().map_err(|e| format!("无法定位程序位置：{e}"))?;
    let dir = exe
        .parent()
        .map(Path::to_path_buf)
        .ok_or("无法定位程序目录")?;
    let new_path = dir.join(format!("labkit-update-{}.exe.new", m.version));
    let _ = std::fs::remove_file(&new_path);
    let mut file = std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&new_path)
        .map_err(|e| {
            format!(
                "无法写入程序目录（{}），请改用「查看发布页」手动安装：{e}",
                dir.display()
            )
        })?;
    let mut guard = CleanupFile(Some(new_path.clone()));

    let cli = client(600)?;
    let mut r = cli
        .get(validate_url(&asset.url)?)
        .send()
        .await
        .map_err(|e| format!("下载更新失败：{e}"))?;
    let status = r.status();
    if !status.is_success() {
        return Err(format!("下载更新失败：HTTP {status}"));
    }
    validate_url(r.url().as_str())?;

    let total = if asset.size > 0 {
        asset.size
    } else {
        r.content_length().unwrap_or(0)
    };
    let mut hasher = Sha256::new();
    let mut received: u64 = 0;
    let mut head = [0u8; 2];
    let mut head_len = 0usize;
    let mut last_emit = Instant::now() - Duration::from_secs(1);
    while let Some(chunk) = r
        .chunk()
        .await
        .map_err(|e| format!("下载更新中断：{e}"))?
    {
        received += chunk.len() as u64;
        if received > MAX_EXE_BYTES {
            return Err("更新包超过大小上限，已取消".into());
        }
        hasher.update(&chunk);
        if head_len < 2 {
            let take = (2 - head_len).min(chunk.len());
            head[head_len..head_len + take].copy_from_slice(&chunk[..take]);
            head_len += take;
        }
        file.write_all(&chunk)
            .map_err(|e| format!("写入更新包失败：{e}"))?;
        if last_emit.elapsed() >= Duration::from_millis(150) {
            last_emit = Instant::now();
            let _ = app.emit(
                "labkit-update-progress",
                serde_json::json!({ "received": received, "total": total.max(received) }),
            );
        }
    }
    file.flush().map_err(|e| format!("写入更新包失败：{e}"))?;
    drop(file);
    let _ = app.emit(
        "labkit-update-progress",
        serde_json::json!({ "received": received, "total": total.max(received) }),
    );

    let digest: String = hasher
        .finalize()
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect();
    if digest != asset.sha256.trim().to_ascii_lowercase() {
        return Err("更新包校验失败（SHA-256 不匹配），已取消".into());
    }
    if asset.size > 0 && received != asset.size {
        return Err(format!(
            "更新包大小不一致（期望 {} 字节，实际 {received} 字节），已取消",
            asset.size
        ));
    }
    if head != *b"MZ" {
        return Err("更新包不是有效的 Windows 程序，已取消".into());
    }

    spawn_helper(&exe, &new_path, &m.version, &asset.sha256)?;
    guard.0 = None;
    Ok(())
}

fn spawn_helper(exe: &Path, source: &Path, version: &str, sha256: &str) -> Result<(), String> {
    let dir = updater_dir();
    std::fs::create_dir_all(&dir).map_err(|e| format!("创建更新目录失败：{e}"))?;
    let helper = dir.join(format!("labkit-updater-{version}.exe"));
    let _ = std::fs::remove_file(&helper);
    std::fs::copy(exe, &helper).map_err(|e| format!("准备更新程序失败：{e}"))?;

    let mut cmd = std::process::Command::new(&helper);
    cmd.arg("--apply-update")
        .arg("--target")
        .arg(exe)
        .arg("--source")
        .arg(source)
        .arg("--sha256")
        .arg(sha256)
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    cmd.spawn().map_err(|e| format!("启动更新程序失败：{e}"))?;
    Ok(())
}

fn arg_value(args: &[String], key: &str) -> Option<String> {
    args.iter()
        .position(|a| a == key)
        .and_then(|i| args.get(i + 1))
        .cloned()
}

/// helper 侧复核：读文件重算 SHA-256 与期望值比对（大小写不敏感）。
pub fn file_sha256_matches(path: &Path, want: &str) -> bool {
    let Ok(bytes) = std::fs::read(path) else {
        return false;
    };
    let digest: String = Sha256::digest(&bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect();
    digest == want.trim().to_ascii_lowercase()
}

/// `--apply-update`：helper 进程入口。旧进程退出前 rename 会因映像占用失败，
/// 以 rename 成功作为「旧进程已退出」的判据，直接覆盖目标（MoveFileEx REPLACE_EXISTING），
/// 不做 target→old 预改名，避免中途失败留下「exe 路径为空」的坏状态。
pub fn apply_update(args: &[String]) -> crate::errors::Result<()> {
    use crate::errors::AppError;
    let target = arg_value(args, "--target")
        .map(PathBuf::from)
        .ok_or_else(|| AppError::Other("缺少 --target".into()))?;
    let source = arg_value(args, "--source")
        .map(PathBuf::from)
        .ok_or_else(|| AppError::Other("缺少 --source".into()))?;
    if !source.is_file() {
        return Err(AppError::Other("更新包不存在，已取消".into()));
    }
    // 下载校验与替换之间隔着可写目录里的等待期：helper 复验一次，堵住 TOCTOU 换包。
    if let Some(want) = arg_value(args, "--sha256") {
        if !file_sha256_matches(&source, &want) {
            let _ = std::fs::remove_file(source);
            return Err(AppError::Other("更新包复核失败（SHA-256 不匹配），已取消并删除".into()));
        }
    }

    let deadline = Instant::now() + Duration::from_secs(60);
    loop {
        match std::fs::rename(&source, &target) {
            Ok(_) => break,
            Err(e) => {
                if Instant::now() >= deadline {
                    return Err(AppError::Other(format!(
                        "替换程序失败（旧进程未退出或目录不可写）：{e}"
                    )));
                }
                std::thread::sleep(Duration::from_millis(300));
            }
        }
    }

    std::thread::sleep(Duration::from_millis(800));
    let mut spawned = false;
    for _ in 0..3 {
        match std::process::Command::new(&target).spawn() {
            Ok(_) => {
                spawned = true;
                break;
            }
            Err(_) => std::thread::sleep(Duration::from_millis(600)),
        }
    }
    cleanup_stale();
    if spawned {
        Ok(())
    } else {
        Err(AppError::Other(
            "新版本已安装，但自动重启失败，请手动打开 LabKit".into(),
        ))
    }
}

/// 启动时 best-effort 清理：遗留 .old、过期 .new、7 天前的 helper。
pub fn cleanup_stale() {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let exe_name = exe
                .file_name()
                .map(|s| s.to_string_lossy().into_owned())
                .unwrap_or_else(|| "labkit.exe".into());
            let _ = std::fs::remove_file(dir.join(format!("{exe_name}.old")));
            if let Ok(rd) = std::fs::read_dir(dir) {
                for e in rd.flatten() {
                    let name = e.file_name().to_string_lossy().into_owned();
                    if name.starts_with("labkit-update-") && name.ends_with(".exe.new") {
                        let old = e
                            .metadata()
                            .ok()
                            .and_then(|m| m.modified().ok())
                            .and_then(|t| t.elapsed().ok())
                            .map(|d| d.as_secs() > 86400)
                            .unwrap_or(false);
                        if old {
                            let _ = std::fs::remove_file(e.path());
                        }
                    }
                }
            }
        }
    }
    let dir = updater_dir();
    if let Ok(rd) = std::fs::read_dir(&dir) {
        for e in rd.flatten() {
            let old = e
                .metadata()
                .ok()
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.elapsed().ok())
                .map(|d| d.as_secs() > 7 * 86400)
                .unwrap_or(false);
            if old {
                let _ = std::fs::remove_file(e.path());
            }
        }
    }
}

#[cfg(all(test, debug_assertions))]
mod tests {
    use super::fetch_manifest_from;
    use std::io::{Read, Write};
    use std::net::TcpListener;

    fn serve_once(body: &'static str) -> u16 {
        let l = TcpListener::bind("127.0.0.1:0").expect("bind");
        let port = l.local_addr().expect("addr").port();
        std::thread::spawn(move || {
            if let Ok((mut s, _)) = l.accept() {
                let mut buf = [0u8; 4096];
                let _ = s.read(&mut buf);
                let resp = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                    body.len(),
                    body
                );
                let _ = s.write_all(resp.as_bytes());
            }
        });
        port
    }

    #[test]
    fn fetches_manifest_over_local_http() {
        let body = r#"{"version":"9.9.9","notes":"x","pubDate":"","platforms":{"windows-x86_64":{"url":"http://127.0.0.1:1/LabKit.exe","sha256":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","size":1}}}"#;
        let port = serve_once(body);
        let m = tauri::async_runtime::block_on(fetch_manifest_from(&format!(
            "http://127.0.0.1:{port}/latest.json"
        )))
        .expect("fetch manifest");
        assert_eq!(m.version, "9.9.9");
    }
}

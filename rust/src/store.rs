//! 科研台账（Dashboard 卡片 + 九个子页）的磁盘持久化。
//!
//! 为什么不能只靠 localStorage：WebView2 的 localStorage 会被「清理浏览数据」
//! 一并抹掉，用户拿不到文件、没法备份也没法换机迁移。这里落成一个 JSON 文件，
//! 放在既有会话目录 `~/.liver_portal_crop/` 下，和 ROI / qPCR 会话同一处，
//! 整个目录拷走就等于把全部科研记录带走。
//!
//! 可靠性设计（参考 tauri-plugin-store 的原子写 + eLabFTW 的改动留痕）：
//! * **原子写**：先写同目录临时文件并 `sync_all`，再 `rename` 覆盖。断电/崩溃
//!   只会留下临时文件，主文件要么是旧的要么是新的，不会是半截 JSON。
//! * **滚动备份**：每次覆盖前把旧内容留一份 `.bak`；主文件解析失败时自动回退它。
//! * **写入校验**：只接受 JSON 对象，拒绝数组/标量，避免前端一个 bug 把库清空。

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use serde_json::{json, Value};

use crate::constants::{DB_FILE_NAME, SESSION_DIR_NAME};
use crate::errors::{AppError, Result};

/// 台账库文件路径。`LABKIT_DB_DIR` 可覆盖目录，便于测试与便携模式。
pub fn db_path() -> Result<PathBuf> {
    let dir = match std::env::var_os("LABKIT_DB_DIR") {
        Some(d) => PathBuf::from(d),
        None => dirs::home_dir()
            .ok_or_else(|| AppError::Other("无法确定用户主目录".into()))?
            .join(SESSION_DIR_NAME),
    };
    Ok(dir.join(DB_FILE_NAME))
}

fn bak_path(path: &Path) -> PathBuf {
    path.with_extension("json.bak")
}

fn tmp_path(path: &Path) -> PathBuf {
    path.with_extension("json.tmp")
}

/// 只接受 JSON 对象：台账库的顶层永远是 `{tasks:[...],projects:[...],...}`。
fn validate(data: &Value) -> Result<()> {
    if !data.is_object() {
        return Err(AppError::Other(
            "台账数据必须是 JSON 对象，已拒绝写入以免覆盖现有记录".into(),
        ));
    }
    Ok(())
}

fn parse(text: &str) -> Result<Value> {
    let v: Value = serde_json::from_str(text)?;
    validate(&v)?;
    Ok(v)
}

/// 原子写：临时文件 + fsync + rename。覆盖前保留 `.bak`。
fn atomic_write(path: &Path, text: &str) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let tmp = tmp_path(path);
    {
        let mut f = fs::File::create(&tmp)?;
        f.write_all(text.as_bytes())?;
        f.sync_all()?;
    }
    if path.exists() {
        // 备份失败不该阻断写入，但要留痕：真正的数据是接下来那次 rename。
        if let Err(e) = fs::copy(path, bak_path(path)) {
            tracing::warn!("台账备份失败（继续写入）: {e}");
        }
    }
    if let Err(e) = fs::rename(&tmp, path) {
        let _ = fs::remove_file(&tmp);
        return Err(AppError::Io(e));
    }
    Ok(())
}

pub fn load_at(path: &Path) -> Result<Option<Value>> {
    match fs::read_to_string(path) {
        Ok(text) => match parse(&text) {
            Ok(v) => Ok(Some(v)),
            Err(e) => {
                tracing::warn!("台账主文件不可用（{e}），尝试 .bak 回退");
                recover_from_bak(path)
            }
        },
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => {
            tracing::warn!("台账读取失败（{e}），尝试 .bak 回退");
            recover_from_bak(path)
        }
    }
}

fn recover_from_bak(path: &Path) -> Result<Option<Value>> {
    let bak = bak_path(path);
    if !bak.exists() {
        return Ok(None);
    }
    let text = fs::read_to_string(&bak)?;
    let v = parse(&text)?;
    // 回退成功就把主文件修回来，避免每次启动都走回退分支。
    if let Err(e) = atomic_write(path, &serde_json::to_string_pretty(&v)?) {
        tracing::warn!("台账回退后修复主文件失败: {e}");
    }
    tracing::info!("台账已从 .bak 恢复");
    Ok(Some(v))
}

pub fn save_at(path: &Path, data: &Value) -> Result<()> {
    validate(data)?;
    atomic_write(path, &serde_json::to_string_pretty(data)?)
}

/// 手动备份到 `backups/labkit_db.<时间戳>.json`，返回备份文件路径。
pub fn backup_at(path: &Path) -> Result<PathBuf> {
    let data = load_at(path)?
        .ok_or_else(|| AppError::Other("还没有台账数据，无需备份".into()))?;
    let dir = path
        .parent()
        .ok_or_else(|| AppError::Other("台账路径没有父目录".into()))?
        .join("backups");
    fs::create_dir_all(&dir)?;
    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let dest = dir.join(format!("labkit_db.{stamp}.json"));
    fs::write(&dest, serde_json::to_string_pretty(&data)?)?;
    Ok(dest)
}

pub fn load() -> Result<Option<Value>> {
    load_at(&db_path()?)
}

pub fn save(data: &Value) -> Result<()> {
    save_at(&db_path()?, data)
}

pub fn backup() -> Result<PathBuf> {
    backup_at(&db_path()?)
}

/// 另存一份到用户选定的位置（导出/迁移用）。
pub fn export_at(path: &Path, dest: &Path) -> Result<PathBuf> {
    let data = load_at(path)?
        .ok_or_else(|| AppError::Other("还没有台账数据，无需导出".into()))?;
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(dest, serde_json::to_string_pretty(&data)?)?;
    Ok(dest.to_path_buf())
}

/// 从外部文件导入：先校验再落盘，导入前自动备份现有数据。
pub fn import_at(path: &Path, src: &Path) -> Result<Value> {
    let text = fs::read_to_string(src)?;
    let data = parse(&text)?;
    if path.exists() {
        if let Err(e) = backup_at(path) {
            tracing::warn!("导入前备份失败（继续导入）: {e}");
        }
    }
    save_at(path, &data)?;
    Ok(data)
}

pub fn export_to(dest: &Path) -> Result<PathBuf> {
    export_at(&db_path()?, dest)
}

pub fn import_from(src: &Path) -> Result<Value> {
    import_at(&db_path()?, src)
}

/// 清空台账：先备份再删主文件与 `.bak`，返回备份路径供前端提示。
pub fn reset() -> Result<Option<PathBuf>> {
    let path = db_path()?;
    let bak = backup_at(&path).ok();
    if path.exists() {
        fs::remove_file(&path)?;
    }
    let b = bak_path(&path);
    if b.exists() {
        fs::remove_file(&b)?;
    }
    Ok(bak)
}

/// 给设置页展示：文件在哪、多大、上次什么时候写的。
pub fn info() -> Result<Value> {
    let path = db_path()?;
    let (exists, bytes, modified) = match fs::metadata(&path) {
        Ok(m) => {
            let ts = m
                .modified()
                .ok()
                .map(|t| chrono::DateTime::<chrono::Local>::from(t).format("%Y-%m-%d %H:%M:%S").to_string())
                .unwrap_or_default();
            (true, m.len(), ts)
        }
        Err(_) => (false, 0, String::new()),
    };
    let backups = path
        .parent()
        .map(|p| p.join("backups"))
        .filter(|p| p.exists())
        .map(|p| fs::read_dir(p).map(|d| d.count()).unwrap_or(0))
        .unwrap_or(0);
    Ok(json!({
        "path": path.to_string_lossy(),
        "exists": exists,
        "bytes": bytes,
        "modified": modified,
        "backups": backups,
    }))
}
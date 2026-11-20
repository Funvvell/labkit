//! qPCR session persistence, separate from the ROI-crop session file.

use std::path::{Path, PathBuf};

use crate::constants::{QPPCR_SESSION_FILE_NAME, SESSION_DIR_NAME};
use crate::errors::Result;
use crate::qpcr::model::QpcrRun;

pub fn session_path() -> Result<PathBuf> {
    let home = dirs::home_dir().ok_or_else(|| {
        crate::errors::AppError::Qpcr("无法确定用户主目录".into())
    })?;
    Ok(home.join(SESSION_DIR_NAME).join(QPPCR_SESSION_FILE_NAME))
}

fn load_at(path: &Path) -> Option<QpcrRun> {
    let text = std::fs::read_to_string(path).ok()?;
    match serde_json::from_str::<QpcrRun>(&text) {
        Ok(run) => Some(run),
        Err(e) => {
            tracing::warn!("qPCR 会话解析失败 {}: {e}", path.display());
            None
        }
    }
}

pub fn load() -> Option<QpcrRun> {
    let path = session_path().ok()?;
    if let Some(run) = load_at(&path) {
        return Some(run);
    }
    // 主文件坏时试 .bak，避免「读失败→None→下次保存覆盖」丢光整个 run。
    let bak = path.with_extension("json.bak");
    if bak.exists() {
        if let Some(run) = load_at(&bak) {
            tracing::warn!("qPCR 会话主文件不可用，已从 .bak 回退");
            return Some(run);
        }
    }
    None
}

pub fn save(run: &QpcrRun) -> Result<()> {
    let path = session_path()?;
    // 与台账同标准：原子写 + 覆盖前留 .bak。
    crate::store::atomic_write(&path, &serde_json::to_string_pretty(run)?)
}

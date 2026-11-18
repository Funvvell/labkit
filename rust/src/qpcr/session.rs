//! qPCR session persistence, separate from the ROI-crop session file.

use std::path::PathBuf;

use crate::constants::{QPPCR_SESSION_FILE_NAME, SESSION_DIR_NAME};
use crate::errors::Result;
use crate::qpcr::model::QpcrRun;

pub fn session_path() -> Result<PathBuf> {
    let home = dirs::home_dir().ok_or_else(|| {
        crate::errors::AppError::Qpcr("无法确定用户主目录".into())
    })?;
    Ok(home.join(SESSION_DIR_NAME).join(QPPCR_SESSION_FILE_NAME))
}

pub fn load() -> Option<QpcrRun> {
    let path = session_path().ok()?;
    if !path.exists() {
        return None;
    }
    match std::fs::read_to_string(&path) {
        Ok(text) => match serde_json::from_str::<QpcrRun>(&text) {
            Ok(run) => Some(run),
            Err(e) => {
                tracing::warn!("qPCR 会话解析失败，忽略: {e}");
                None
            }
        },
        Err(e) => {
            tracing::warn!("qPCR 会话读取失败，忽略: {e}");
            None
        }
    }
}

pub fn save(run: &QpcrRun) -> Result<()> {
    let path = session_path()?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, serde_json::to_string_pretty(run)?)?;
    Ok(())
}

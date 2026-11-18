//! Session persistence. Rust writes `session_rust.json` so it cannot clobber
//! the coexisting Python application's `session.json`, but can import it.

use std::path::{Path, PathBuf};

use crate::constants::{LEGACY_SESSION_FILE_NAME, SESSION_DIR_NAME, SESSION_FILE_NAME};
use crate::errors::{AppError, Result};
use crate::model::{Roi, RoiStore};

pub fn session_dir() -> Result<PathBuf> {
    let home = dirs::home_dir().ok_or_else(|| AppError::Other("无法确定用户主目录".into()))?;
    Ok(home.join(SESSION_DIR_NAME))
}

pub fn default_session_path() -> Result<PathBuf> {
    Ok(session_dir()?.join(SESSION_FILE_NAME))
}

pub fn legacy_session_path() -> Result<PathBuf> {
    Ok(session_dir()?.join(LEGACY_SESSION_FILE_NAME))
}

/// Parse `{"rois":[...]}`, accepting the legacy `thumb_x/y/w/h` field names
/// and skipping malformed entries (ported from `ROIManager.from_json`).
pub fn parse_rois(data: &str) -> Result<Vec<Roi>> {
    let value: serde_json::Value = serde_json::from_str(data)?;
    let arr = value
        .get("rois")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();

    let mut out = Vec::new();
    for item in arr {
        let id = match item.get("id").and_then(|v| v.as_str()) {
            Some(s) if !s.is_empty() => s.to_string(),
            _ => {
                tracing::warn!("跳过缺少 id 的 ROI 条目");
                continue;
            }
        };
        let slide_path = match item.get("slide_path").and_then(|v| v.as_str()) {
            Some(s) => PathBuf::from(s),
            None => {
                tracing::warn!("跳过缺少 slide_path 的 ROI 条目: {id}");
                continue;
            }
        };
        let num = |key: &str, legacy: &str| -> i64 {
            item.get(key)
                .and_then(|v| v.as_i64())
                .or_else(|| item.get(legacy).and_then(|v| v.as_i64()))
                .unwrap_or(0)
        };
        out.push(Roi {
            id,
            slide_path,
            x: num("x", "thumb_x"),
            y: num("y", "thumb_y"),
            w: num("w", "thumb_w"),
            h: num("h", "thumb_h"),
            angle: item
                .get("angle")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0),
            created_at: item
                .get("created_at")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
        });
    }
    Ok(out)
}

pub fn load(path: &Path) -> Result<RoiStore> {
    let data = std::fs::read_to_string(path)?;
    let mut store = RoiStore::new();
    for roi in parse_rois(&data)? {
        store.add(roi);
    }
    Ok(store)
}

pub fn load_if_exists(path: &Path) -> RoiStore {
    if !path.exists() {
        return RoiStore::new();
    }
    match load(path) {
        Ok(s) => s,
        Err(e) => {
            tracing::warn!("会话读取失败，忽略: {e}");
            RoiStore::new()
        }
    }
}

pub fn save(path: &Path, store: &RoiStore) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, serde_json::to_string_pretty(&store.to_json())?)?;
    Ok(())
}

pub fn import_legacy(store: &mut RoiStore, path: &Path) -> Result<usize> {
    let rois = parse_rois(&std::fs::read_to_string(path)?)?;
    let n = rois.len();
    for roi in rois {
        store.add(roi);
    }
    Ok(n)
}

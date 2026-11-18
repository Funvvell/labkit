//! Tauri command layer.
//!
//! Everything here delegates to the reused, UI-agnostic core modules:
//!   sdpc / decode / model / export / qpcr / geometry.
//! No algorithm is reimplemented — this file only adapts signatures to values
//! the WebView can serialize (paths as strings, images as PNG data URLs).

use std::path::PathBuf;
use std::sync::Mutex;

use base64::Engine;
use serde::{Deserialize, Serialize};

use crate::decode::{DecodeHandle, Response as DecodeResponse, TileKey};
use crate::errors::AppError;
use crate::model::session as roi_session;
use crate::model::{Roi, RoiStore};
use crate::qpcr::model::{Design, QpcrAnalysis, QpcrRun, Well};
use crate::render::texture::to_data_url;

/// Process-wide decoder handle. The DLL is not thread-safe; a single worker
/// thread owns every FFI call (see `decode::worker`). Tauri commands lock this
/// mutex only to enqueue / drain messages — never to decode pixels.
pub struct AppState {
    pub decode: Mutex<Option<DecodeHandle>>,
    pub generation: Mutex<u64>,
    /// Cancel flag of the most recently submitted export job.
    pub export_cancel: Mutex<Option<std::sync::Arc<std::sync::atomic::AtomicBool>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            decode: Mutex::new(None),
            generation: Mutex::new(0),
            export_cancel: Mutex::new(None),
        }
    }

    fn handle(&self) -> Result<DecodeHandle, String> {
        let guard = self.decode.lock().map_err(|e| e.to_string())?;
        guard
            .as_ref()
            .ok_or_else(|| "解码器未初始化".to_string())
            .cloned()
    }

    fn next_gen(&self) -> u64 {
        let mut g = self.generation.lock().unwrap();
        *g += 1;
        *g
    }
}

// DecodeHandle is Clone (channels only) — verify by deriving at call sites.
// If cloning is unavailable we fall back to locking on each command below.

#[derive(Debug, Serialize, Deserialize)]
pub struct TileResult {
    pub key: TileKey,
    pub url: String,
}

// ---------------------------- lifecycle ----------------------------------

#[tauri::command]
pub fn init_engine(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut guard = state.decode.lock().map_err(|e| e.to_string())?;
    if guard.is_none() {
        *guard = Some(DecodeHandle::spawn().map_err(|e| e.to_string())?);
    }
    Ok("ready".into())
}

// ---------------------------- SDPC slides --------------------------------

/// Read a regular image file and return it as a PNG/JPEG data URL.
/// Implemented in Rust on purpose: it bypasses the fs-plugin permission
/// model entirely (a previous crash source) and handles large files.
#[tauri::command]
pub fn read_file_as_data_url(path: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    let mime = match p
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .as_deref()
    {
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("webp") => "image/webp",
        Some("gif") => "image/gif",
        Some("bmp") => "image/bmp",
        Some("tif") | Some("tiff") => "image/tiff",
        _ => return Err("不支持的图片格式（png/jpg/webp/gif/bmp/tiff）".into()),
    };
    if !p.exists() {
        return Err("文件不存在".into());
    }
    let bytes = std::fs::read(&p).map_err(|e| format!("读取失败: {e}"))?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{mime};base64,{b64}"))
}

/// Queue a slide open on the decoder worker. The worker's `Opened` response
/// (info + thumbnail) arrives via `poll_decoder`; the worker caches the
/// reader, so the DLL handle is opened exactly once per slide.
#[tauri::command]
pub fn enqueue_open(state: tauri::State<'_, AppState>, path: String) -> Result<u64, String> {
    // Guard: only .sdpc files may reach the closed-source decoder DLL.
    if !path.to_lowercase().ends_with(".sdpc") {
        return Err("仅支持 .sdpc 切片文件；普通图片请直接选择图片格式打开".into());
    }
    let h = state.handle()?;
    let gen = state.next_gen();
    h.open(PathBuf::from(&path), gen);
    Ok(gen)
}

#[tauri::command]
pub fn enqueue_tile(
    state: tauri::State<'_, AppState>,
    path: String,
    level: u32,
    x: u32,
    y: u32,
    w: u32,
    h: u32,
    gen: u64,
) -> Result<(), String> {
    let handle = state.handle()?;
    let key = TileKey {
        level,
        x,
        y,
        w,
        h,
    };
    handle.request_tile(PathBuf::from(&path), key, gen);
    Ok(())
}

/// Start a new tile-view generation. The decoder thread only decodes tiles
/// whose gen matches the latest one, so every batch must begin with this
/// (mirrors the egui build's `cancel_tiles(new_gen)` + request sequence).
#[tauri::command]
pub fn begin_tiles(state: tauri::State<'_, AppState>, gen: u64) -> Result<(), String> {
    let handle = state.handle()?;
    handle.cancel_tiles(gen);
    Ok(())
}

/// Drain decoder responses produced since the last call. The front-end polls
/// this on a short interval; images arrive as PNG data URLs.
#[tauri::command]
pub fn poll_decoder(
    state: tauri::State<'_, AppState>,
    max: usize,
) -> Result<Vec<serde_json::Value>, String> {
    let handle = state.handle()?;
    let responses = handle.poll(max.min(64));
    let mut out = Vec::with_capacity(responses.len());
    for r in responses {
        let value = match r {
            DecodeResponse::Opened {
                path,
                info,
                thumb,
                gen,
            } => serde_json::json!({
                "kind": "opened",
                "path": path.to_string_lossy(),
                "info": info,
                "thumb_url": to_data_url(&thumb).ok(),
                "gen": gen,
            }),
            DecodeResponse::TileReady { key, img, gen } => serde_json::json!({
                "kind": "tile",
                "key": key,
                "url": to_data_url(&img).ok(),
                "gen": gen,
            }),
            DecodeResponse::TileFailed { key, err, gen } => serde_json::json!({
                "kind": "tile_failed", "key": key, "err": err, "gen": gen,
            }),
            DecodeResponse::Export(ev) => serde_json::json!({
                "kind": "export", "event": ev,
            }),
            DecodeResponse::Error(err) => serde_json::json!({
                "kind": "error", "err": err,
            }),
        };
        out.push(value);
    }
    Ok(out)
}

// ---------------------------- ROI session --------------------------------

#[tauri::command]
pub fn load_rois() -> Result<Vec<Roi>, String> {
    let path = roi_session::default_session_path().map_err(|e| e.to_string())?;
    Ok(roi_session::load_if_exists(&path).all())
}

#[tauri::command]
pub fn save_rois(rois: Vec<Roi>) -> Result<String, String> {
    let path = roi_session::default_session_path().map_err(|e| e.to_string())?;
    let mut store = RoiStore::new();
    for r in rois {
        store.add(r);
    }
    roi_session::save(&path, &store).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn create_roi(
    slide_path: String,
    x: i64,
    y: i64,
    w: i64,
    h: i64,
    angle: f64,
) -> Result<Roi, String> {
    Ok(Roi::new(
        &PathBuf::from(&slide_path),
        x,
        y,
        w,
        h,
        angle,
    ))
}

#[tauri::command]
pub fn export_rois(
    state: tauri::State<'_, AppState>,
    rois: Vec<Roi>,
    output_dir: String,
    mag_label: Option<String>,
) -> Result<u64, String> {
    let h = state.handle()?;
    let gen = state.next_gen();
    let opts = crate::export::ExportOptions::new(PathBuf::from(&output_dir), mag_label);
    *state.export_cancel.lock().map_err(|e| e.to_string())? = Some(opts.cancel.clone());
    h.start_export(rois, opts, gen);
    Ok(gen)
}

/// Cancel the in-flight export job (checked between ROIs by `export_with`).
#[tauri::command]
pub fn cancel_export(state: tauri::State<'_, AppState>) -> Result<(), String> {
    if let Some(flag) = state
        .export_cancel
        .lock()
        .map_err(|e| e.to_string())?
        .as_ref()
    {
        flag.store(true, std::sync::atomic::Ordering::Relaxed);
    }
    Ok(())
}

#[tauri::command]
pub fn default_output_dir() -> String {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(crate::constants::DEFAULT_OUTPUT_DIR_NAME)
        .to_string_lossy()
        .into_owned()
}

// ---------------------------- qPCR ---------------------------------------

#[tauri::command]
pub fn qpcr_parse_csv_text(text: String, delimiter: String) -> Result<Vec<Well>, String> {
    let d = if delimiter.starts_with('\t') { b'\t' } else { b',' };
    crate::qpcr::io_csv::parse_csv_text(&text, d).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn qpcr_parse_csv_file(path: String) -> Result<Vec<Well>, String> {
    crate::qpcr::io_csv::read_csv(&PathBuf::from(&path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn qpcr_parse_excel(path: String, sheet: Option<String>) -> Result<(Vec<Well>, String), String> {
    crate::qpcr::io_excel::read_excel(&PathBuf::from(&path), sheet.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn qpcr_parse_instrument(path: String) -> Result<(Vec<Well>, String), String> {
    crate::qpcr::io_instrument::read_instrument(&PathBuf::from(&path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn qpcr_parse_pasted(text: String) -> Result<Vec<Well>, String> {
    crate::qpcr::io_manual::parse_pasted(&text).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn qpcr_analyze(run: QpcrRun) -> Result<QpcrAnalysis, String> {
    crate::qpcr::analyze(&run).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn qpcr_new_run(wells: Vec<Well>, source_name: Option<String>) -> QpcrRun {
    use crate::qpcr::model::DataSource;
    let source = source_name.clone().map(|_| DataSource::Manual);
    let mut run = QpcrRun::new(wells, source);
    if let Some(name) = source_name {
        run.name = name;
    }
    run
}

#[tauri::command]
pub fn qpcr_default_design() -> Design {
    Design::default()
}

#[tauri::command]
pub fn qpcr_load_session() -> Option<QpcrRun> {
    crate::qpcr::session::load()
}

#[tauri::command]
pub fn qpcr_save_session(run: QpcrRun) -> Result<String, String> {
    crate::qpcr::session::save(&run).map_err(|e| e.to_string())?;
    Ok(crate::qpcr::session::session_path()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .into_owned())
}

#[tauri::command]
pub fn qpcr_export_csv(path: String, analysis: QpcrAnalysis) -> Result<String, String> {
    crate::qpcr::export_io::write_csv(&PathBuf::from(&path), &analysis).map_err(|e| e.to_string())?;
    Ok(path)
}

// ---------------------------- generic tools ------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub version: String,
    pub name: String,
    pub tool_count: usize,
}

#[tauri::command]
pub fn app_info() -> AppInfo {
    AppInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        name: "工具箱 Toolbox".to_string(),
        tool_count: 12,
    }
}

#[tauri::command]
pub fn error_probe() -> Result<String, String> {
    Err(AppError::Other("probe".into()).to_string())
}

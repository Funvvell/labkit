//! Tauri command layer.
//!
//! Everything here delegates to the reused, UI-agnostic core modules:
//!   sdpc / decode / model / export / qpcr / geometry.
//! No algorithm is reimplemented — this file only adapts signatures to values
//! the WebView can serialize (paths as strings, images as PNG data URLs).

use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Mutex;

use base64::Engine;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager};

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
    /* ---- 多窗口退出握手（主窗 CloseRequested 触发） ---- */
    /// 幂等门：一次退出流程只允许一个握手；失败等待用户决策期间保持 true。
    pub exiting: AtomicBool,
    /// 当前握手的唯一 id，旧回执一律丢弃（防 reload / 重复关闭串台）。
    pub exit_request_id: Mutex<Option<String>>,
    /// 尚未回执的窗口 label 集合。
    pub pending_acks: Mutex<HashSet<String>>,
    /// 回执为失败或超时未回的窗口 label。
    pub exit_failed: Mutex<Vec<String>>,
    /// 每次握手递增，生成 exit-N。
    pub exit_seq: AtomicU64,
    /// 握手等待用的唤醒通道（前端回执时通知，避免轮询 tokio sleep）。
    pub exit_wake: Mutex<Option<std::sync::mpsc::Sender<()>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            decode: Mutex::new(None),
            generation: Mutex::new(0),
            export_cancel: Mutex::new(None),
            exiting: AtomicBool::new(false),
            exit_request_id: Mutex::new(None),
            pending_acks: Mutex::new(HashSet::new()),
            exit_failed: Mutex::new(Vec::new()),
            exit_seq: AtomicU64::new(0),
            exit_wake: Mutex::new(None),
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

/// Decode one preview tile and return **raw RGBA8888 bytes**.
///
/// This is the fast path that replaced `enqueue_tile` + `poll_decoder` +
/// PNG data URLs. Nothing is encoded and nothing is base64'd: Tauri ships the
/// buffer as an `ArrayBuffer` (large payloads bypass JSON entirely) and the
/// WebView wraps it in an `ImageData` without a single pixel conversion.
///
/// `async` keeps the blocking wait off the main thread; the DLL itself stays
/// serialised on the one decoder thread.
#[tauri::command(async)]
pub fn fetch_tile(
    state: tauri::State<'_, AppState>,
    path: String,
    level: u32,
    x: u32,
    y: u32,
    w: u32,
    h: u32,
    gen: u64,
) -> Result<tauri::ipc::Response, String> {
    let handle = state.handle()?;
    let key = TileKey { level, x, y, w, h };
    let img = handle
        .fetch_tile(
            PathBuf::from(&path),
            key,
            gen,
            std::time::Duration::from_secs(30),
        )
        .map_err(|e| e.to_string())?;
    Ok(tauri::ipc::Response::new(img.data))
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
pub fn save_rois(rois: Vec<Roi>, slides: Option<Vec<String>>) -> Result<String, String> {
    let path = roi_session::default_session_path().map_err(|e| e.to_string())?;
    let mut store = RoiStore::new();
    if let Some(slides) = &slides {
        // 多窗口合并：只替换本窗口声明权威的切片，保留其它窗口正在编辑的切片，
        // 避免「各窗口回写自己加载时的全量快照」互相抹掉对方的 ROI。
        let owned: std::collections::HashSet<&str> = slides.iter().map(|s| s.as_str()).collect();
        for r in roi_session::load_if_exists(&path).all() {
            if !owned.contains(r.slide_path.to_string_lossy().as_ref()) {
                store.add(r);
            }
        }
    }
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
        name: "科研工具箱 LabKit".to_string(),
        tool_count: 12,
    }
}

#[tauri::command]
pub fn error_probe() -> Result<String, String> {
    Err(AppError::Other("probe".into()).to_string())
}

/* ===================== 科研台账落盘 =====================
   参数一律单个单词：Tauri 命令宏默认 camelCase，多单词参数名前端极易写错
   （ROI 导出失败就是这么来的）。data / dest / src 两种命名法长得一样，天然安全。 */

#[tauri::command]
pub fn db_load(app: tauri::AppHandle) -> Result<Option<serde_json::Value>, String> {
    let db = crate::store::db_path().map_err(|e| e.to_string())?;
    /* Vault 摄入必须在返回前完成——前端 DB 对象形状不变是硬契约，
       home/entities/dashboard/inventory 全都直接读 DB.xxx 数组。
       启动、dbOnRemote、dbFocusSync 都经过 db_load，所以聚焦即同步。
       摄入失败只记日志，绝不阻断台账读取。 */
    if let Ok(Some(vault)) = crate::vault::active_dir_at(&db) {
        match crate::vault::ingest_at(&db, &vault) {
            Ok(rep) => {
                if rep.ingested > 0 || rep.removed > 0 {
                    let _ = app.emit(
                        "db-changed",
                        serde_json::json!({"rev": rep.rev, "keys": rep.changed, "origin": "vault"}),
                    );
                }
                if rep.ingested > 0 || rep.removed > 0 || !rep.conflicts.is_empty() || !rep.errors.is_empty() {
                    let _ = app.emit("vault-synced", serde_json::json!({"report": rep, "origin": "vault"}));
                }
            }
            Err(e) => tracing::warn!("Vault 摄入失败（台账读取不受影响）: {e}"),
        }
    }
    crate::store::load_at(&db).map_err(|e| e.to_string())
}

/// P1 多窗口合并写：`changed` 为前端 diff 出的顶层键（缺省 = 整库写，旧契约兼容）；
/// `origin` 为发起窗口标识，随 `db-changed` 广播，其它窗口据此重载重渲染。
/// 锁内「读盘 → 仅覆盖 changed 键（_store 二级合并）→ 原子写 → rev+1」见 store::merge_save_at。
#[tauri::command]
pub fn db_save(
    app: tauri::AppHandle,
    data: serde_json::Value,
    changed: Option<Vec<String>>,
    origin: Option<String>,
) -> Result<String, String> {
    let rev = crate::store::merge_save(&data, changed.as_deref()).map_err(|e| e.to_string())?;
    let path = crate::store::db_path()
        .map(|p| p.to_string_lossy().into_owned())
        .map_err(|e| e.to_string())?;
    let origin = origin.unwrap_or_default();
    let _ = app.emit(
        "db-changed",
        serde_json::json!({
            "rev": rev,
            "keys": changed.clone().unwrap_or_default(),
            "origin": origin,
        }),
    );
    /* Vault 投影：merge_save 的写锁已释放，这里读回**已提交**的 JSON 作为投影源
       （不是前端内存态），并发写时后一次投影天然覆盖前一次。
       只投影本次改动的实体键；只改 _store 时跳过。
       Vault 的任何失败都只 emit 上报，绝不改变 db_save 的返回值——台账已落盘。 */
    if let Ok(db) = crate::store::db_path() {
        if let Ok(Some(disk)) = crate::store::load_at(&db) {
            if let Some(vault) = crate::vault::dir_from_data(&disk) {
                let kinds: Option<Vec<String>> = changed.as_ref().map(|ks| {
                    ks.iter().filter(|k| crate::vault::kind_of_key(k).is_some()).cloned().collect()
                });
                if !kinds.as_ref().is_some_and(|k| k.is_empty()) {
                    let out = match crate::vault::project_data_at(&vault, &disk, kinds.as_deref()) {
                        Ok(rep) => serde_json::json!({"report": rep, "rev": rev, "origin": origin}),
                        Err(e) => serde_json::json!({"error": e.to_string(), "rev": rev, "origin": origin}),
                    };
                    let _ = app.emit("vault-synced", out);
                }
            }
        }
    }
    Ok(path)
}

#[tauri::command]
pub fn db_info() -> Result<serde_json::Value, String> {
    crate::store::info().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_backup() -> Result<String, String> {
    crate::store::backup()
        .map(|p| p.to_string_lossy().into_owned())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_export(dest: String) -> Result<String, String> {
    crate::store::export_to(std::path::Path::new(&dest))
        .map(|p| p.to_string_lossy().into_owned())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_import(app: tauri::AppHandle, src: String) -> Result<serde_json::Value, String> {
    let data = crate::store::import_from(std::path::Path::new(&src)).map_err(|e| e.to_string())?;
    // 整库替换：keys 为空 = 通知其它窗口全量重载
    let rev = data.get("_rev").and_then(|v| v.as_u64()).unwrap_or(0);
    let _ = app.emit("db-changed", serde_json::json!({"rev": rev, "keys": [], "origin": ""}));
    Ok(data)
}

#[tauri::command]
pub fn db_reset(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let out = crate::store::reset()
        .map(|p| p.map(|p| p.to_string_lossy().into_owned()))
        .map_err(|e| e.to_string())?;
    // reset:true → 其它窗口清缓存并重启回首次启动态
    let _ = app.emit("db-changed", serde_json::json!({"rev": 0, "keys": [], "origin": "", "reset": true}));
    Ok(out)
}

/* ===================== Markdown Vault =====================
   台账的对外权威存储：一条记录一个 .md（YAML frontmatter），Obsidian 可直接编辑。
   投影永远发生在 merge_save 成功之后，Vault 的任何失败都只上报，不回滚已提交的 JSON。
   参数同样一律单个单词（dir / enable / id / keep）。 */

#[tauri::command]
pub fn vault_status() -> Result<serde_json::Value, String> {
    let db = crate::store::db_path().map_err(|e| e.to_string())?;
    crate::vault::status_at(&db).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn vault_configure(app: tauri::AppHandle, dir: String, enable: bool) -> Result<serde_json::Value, String> {
    let db = crate::store::db_path().map_err(|e| e.to_string())?;
    let rep = crate::vault::configure_at(&db, &dir, enable).map_err(|e| e.to_string())?;
    let _ = app.emit("vault-synced", serde_json::json!({"report": &rep, "dir": dir, "enabled": enable}));
    // 配置写在 _store.vault，其它窗口据此重载设置页状态
    let _ = app.emit("db-changed", serde_json::json!({"rev": rep.rev, "keys": ["_store"], "origin": "vault"}));
    serde_json::to_value(&rep).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn vault_sync(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let db = crate::store::db_path().map_err(|e| e.to_string())?;
    let vault = crate::vault::active_dir_at(&db)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Vault 未启用".to_string())?;
    let rep = crate::vault::sync_at(&db, &vault).map_err(|e| e.to_string())?;
    let _ = app.emit("vault-synced", serde_json::json!({"report": &rep, "dir": vault.to_string_lossy(), "enabled": true}));
    if rep.ingested > 0 || rep.removed > 0 {
        let _ = app.emit("db-changed", serde_json::json!({"rev": rep.rev, "keys": [], "origin": "vault"}));
    }
    serde_json::to_value(&rep).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn vault_resolve(app: tauri::AppHandle, id: String, keep: String) -> Result<serde_json::Value, String> {
    let db = crate::store::db_path().map_err(|e| e.to_string())?;
    let vault = crate::vault::active_dir_at(&db)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Vault 未启用".to_string())?;
    let rep = crate::vault::resolve_at(&db, &vault, &id, &keep).map_err(|e| e.to_string())?;
    let _ = app.emit("vault-synced", serde_json::json!({"report": &rep, "resolved": id, "keep": keep}));
    if keep == "local" {
        let _ = app.emit("db-changed", serde_json::json!({"rev": rep.rev, "keys": [], "origin": "vault"}));
    }
    serde_json::to_value(&rep).map_err(|e| e.to_string())
}

/* ===================== 多窗口退出握手 =====================
   仅主窗 CloseRequested 触发。Rust 不持有 JS 内存态台账，落盘只能由各窗口
   监听 flush-now 后调用 flushDB() 完成；Rust 只负责收集回执并决定何时 exit。
   用 mpsc::recv_timeout 等待而非 tokio::time::sleep（tauri 未启用 tokio/time）。 */

/// 前端每个窗口落盘后回执：仅接受当前 request_id，旧回执丢弃。
#[tauri::command]
pub fn flush_ack(app: tauri::AppHandle, request_id: String, ok: bool, label: String) {
    let st = app.state::<AppState>();
    if st.exit_request_id.lock().unwrap().as_deref() != Some(request_id.as_str()) {
        return;
    }
    if !ok {
        let mut failed = st.exit_failed.lock().unwrap();
        if !failed.contains(&label) {
            failed.push(label.clone());
        }
    }
    st.pending_acks.lock().unwrap().remove(&label);
    // 唤醒等待中的握手线程重新检查（无新依赖、无轮询 sleep）。
    // 先把 Sender 克隆出来，避免 MutexGuard 临时值活过 st。
    let wake = st.exit_wake.lock().unwrap().clone();
    if let Some(tx) = wake {
        let _ = tx.send(());
    }
}

/// 用户在失败弹窗中的决策：force=true 强制退出；false 取消并复位状态。
#[tauri::command]
pub fn exit_decision(app: tauri::AppHandle, request_id: String, force: bool) {
    let st = app.state::<AppState>();
    if st.exit_request_id.lock().unwrap().as_deref() != Some(request_id.as_str()) {
        return;
    }
    if force {
        app.exit(0);
        return;
    }
    st.exiting.store(false, Ordering::SeqCst);
    *st.exit_request_id.lock().unwrap() = None;
    st.pending_acks.lock().unwrap().clear();
    st.exit_failed.lock().unwrap().clear();
    *st.exit_wake.lock().unwrap() = None;
}

/// 在 spawn_blocking 内运行：广播 flush-now → 等各窗回执（3s 上限）→
/// 全成功则 app.exit(0)；失败/超时则 emit flush-failed，保持窗口等用户决策。
pub fn run_exit_handshake(app: tauri::AppHandle) {
    let st = app.state::<AppState>();
    let request_id = format!("exit-{}", st.exit_seq.fetch_add(1, Ordering::SeqCst));
    *st.exit_request_id.lock().unwrap() = Some(request_id.clone());
    st.exit_failed.lock().unwrap().clear();

    let labels: HashSet<String> = app.webview_windows().keys().cloned().collect();
    *st.pending_acks.lock().unwrap() = labels;

    let (tx, rx) = std::sync::mpsc::channel::<()>();
    *st.exit_wake.lock().unwrap() = Some(tx);
    let _ = app.emit("flush-now", serde_json::json!({"requestId": request_id.clone()}));

    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(3);
    loop {
        if st.pending_acks.lock().unwrap().is_empty() || std::time::Instant::now() >= deadline {
            break;
        }
        let _ = rx.recv_timeout(std::time::Duration::from_millis(200));
    }
    *st.exit_wake.lock().unwrap() = None;

    let pending: Vec<String> = {
        let p = st.pending_acks.lock().unwrap();
        p.iter().cloned().collect()
    };
    let failed: Vec<String> = {
        let mut f = st.exit_failed.lock().unwrap().clone();
        for l in pending {
            if !f.contains(&l) {
                f.push(l);
            }
        }
        f
    };
    if failed.is_empty() {
        app.exit(0);
    } else {
        let _ = app.emit(
            "flush-failed",
            serde_json::json!({"requestId": request_id, "labels": failed}),
        );
    }
}

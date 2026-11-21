//! Application entry point.
//!
//! CLI modes (headless parity verification, unchanged from the egui build):
//!   labkit --info <slide.sdpc>
//!   labkit --export --slide <s.sdpc> --session <rois.json> --out <dir>
//! With no arguments the Tauri macOS-style toolbox window starts.

// Release 构建为 GUI 子系统：双击启动不再弹出命令行黑框。
// Debug 保留控制台便于开发；从终端启动时 CLI 模式仍继承父控制台输出。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use tauri::Manager;

use labkit::commands::AppState;
use labkit::sdpc::SlideReader;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();

    // Headless CLI paths keep the reused core independently verifiable.
    if !args.is_empty() && !args[0].starts_with("--tauri") {
        let result = match args[0].as_str() {
            "--info" => cmd_info(&args),
            "--export" => cmd_export(&args),
            "--tileprobe" => cmd_tileprobe(&args),
            "--apply-update" => labkit::update::apply_update(&args),
            "--help" | "-h" => {
                print_usage();
                Ok(())
            }
            _ => {
                println!("提示: 未知参数 {:?}，启动图形界面", args[0]);
                run_tauri();
                return;
            }
        };
        if let Err(e) = result {
            eprintln!("错误: {e}");
            std::process::exit(1);
        }
        return;
    }

    run_tauri();
}

fn run_tauri() {
    labkit::update::cleanup_stale();
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        // P1 多窗口：只记忆尺寸/位置（VISIBLE 不记忆——工具窗口创建时 visible:false，
        // 由前端渲染就绪后 show()，避免恢复出白窗/闪烁）。main 与 tool-* 同样生效。
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(
                    tauri_plugin_window_state::StateFlags::SIZE
                        | tauri_plugin_window_state::StateFlags::POSITION,
                )
                .build(),
        )
        .manage(AppState::new())
        /* 退出编排：仅 main 窗口的 CloseRequested 触发全局退出握手。
           工具窗口（tool-*）放行，只关自己。握手期间 main 的每次关闭请求都
           prevent_close——既防 db.js 二次 close 提前关窗，也保证失败弹窗有宿主。 */
        .on_window_event(|window, event| {
            if window.label() != "main" {
                return;
            }
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let app = window.app_handle().clone();
                let state = app.state::<AppState>();
                if !state.exiting.swap(true, std::sync::atomic::Ordering::SeqCst) {
                    tauri::async_runtime::spawn_blocking(move || {
                        labkit::commands::run_exit_handshake(app);
                    });
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            labkit::commands::init_engine,
            labkit::commands::read_file_as_data_url,
            labkit::commands::enqueue_open,
            labkit::commands::begin_tiles,
            labkit::commands::enqueue_tile,
            labkit::commands::fetch_tile,
            labkit::commands::poll_decoder,
            labkit::commands::load_rois,
            labkit::commands::save_rois,
            labkit::commands::create_roi,
            labkit::commands::export_rois,
            labkit::commands::cancel_export,
            labkit::commands::default_output_dir,
            labkit::commands::qpcr_parse_csv_text,
            labkit::commands::qpcr_parse_csv_file,
            labkit::commands::qpcr_parse_excel,
            labkit::commands::qpcr_parse_instrument,
            labkit::commands::qpcr_parse_pasted,
            labkit::commands::qpcr_analyze,
            labkit::commands::qpcr_new_run,
            labkit::commands::qpcr_default_design,
            labkit::commands::qpcr_load_session,
            labkit::commands::qpcr_save_session,
            labkit::commands::qpcr_export_csv,
            labkit::commands::app_info,
            labkit::update::update_check,
            labkit::update::update_install,
            labkit::commands::db_load,
            labkit::commands::db_save,
            labkit::commands::db_info,
            labkit::commands::db_backup,
            labkit::commands::db_export,
            labkit::commands::db_import,
            labkit::commands::db_reset,
            labkit::commands::vault_status,
            labkit::commands::vault_configure,
            labkit::commands::vault_sync,
            labkit::commands::vault_resolve,
            labkit::commands::flush_ack,
            labkit::commands::exit_decision,
            labkit::imgbatch::img_probe,
            labkit::imgbatch::img_encode,
            labkit::imgbatch::img_batch,
            labkit::imgbatch::img_rename_preview,
            labkit::zotero::zotero_probe,
            labkit::zotero::zotero_list,
            labkit::zotero::zotero_open,
            labkit::zotero::zotero_tag,
            labkit::zotero::zotero_bbt,
            labkit::inventree::inventree_get,
            labkit::plugins::plugins_index,
            labkit::plugins::plugins_resolve,
            labkit::plugins::plugins_install,
            labkit::plugins::plugins_install_local,
            labkit::plugins::plugins_uninstall,
            labkit::plugins::plugins_rollback_available,
            labkit::plugins::plugins_read_asset,
        ])
        /* P4：插件资产经只读自定义协议注入（Windows 为 http://labkit-plugin.localhost/…），
           路径严格限定 ~/.liver_portal_crop/plugins/<id>/<version>/ 下的白名单文件。 */
        .register_uri_scheme_protocol("labkit-plugin", |_ctx, req| {
            use tauri::http::{Response, StatusCode};
            let path = req.uri().path().trim_start_matches('/');
            let seg: Vec<&str> = path.split('/').collect();
            let result = if seg.len() == 3 {
                labkit::plugins::data_base()
                    .and_then(|base| labkit::plugins::read_asset_at(&base, seg[0], seg[1], seg[2]))
            } else {
                Err(format!("非法插件资产路径：{path}"))
            };
            match result {
                Ok(bytes) => {
                    let mime = if path.ends_with(".css") { "text/css" } else { "text/javascript" };
                    Response::builder()
                        .status(StatusCode::OK)
                        .header("Content-Type", format!("{mime}; charset=utf-8"))
                        .body(bytes)
                        .unwrap_or_else(|e| Response::builder().status(500).body(e.to_string().into_bytes()).unwrap())
                }
                Err(e) => Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .header("Content-Type", "text/plain; charset=utf-8")
                    .body(e.into_bytes())
                    .unwrap(),
            }
        })
        .run(tauri::generate_context!())
        .expect("启动工具箱失败");
}

fn print_usage() {
    println!(
        "科研工具箱 LabKit (Rust/Tauri)\n\
         \n\
         用法:\n  \
         labkit                          启动图形界面\n  \
         labkit --info <切片.sdpc>       打印切片元数据\n  \
         labkit --tileprobe <切片.sdpc> [层级]  瓦片接缝/色差诊断\n  \
         labkit --export --slide <s.sdpc> --session <rois.json> --out <目录> [--mag 20]"
    );
}

/// Diagnostics for the "seams / colour patches" question.
///
/// Decodes the same area twice — once as two 1024px tiles, once as a single
/// 2048px region — and compares them pixel by pixel. If the DLL normalised
/// each request independently the two would differ; if they are identical the
/// decoder is geometry-independent and any patchwork must come from rendering.
fn cmd_tileprobe(args: &[String]) -> labkit::errors::Result<()> {
    let path = args
        .get(1)
        .map(PathBuf::from)
        .ok_or_else(|| labkit::errors::AppError::Other("缺少切片路径".into()))?;
    let reader = SlideReader::open(&path)?;
    let info = reader.info();
    let level: u32 = args
        .get(2)
        .and_then(|s| s.parse().ok())
        .unwrap_or((info.levels.len() / 2) as u32);
    let lv = info
        .levels
        .get(level as usize)
        .ok_or_else(|| labkit::errors::AppError::Other("层级不存在".into()))?;
    if lv.width < 2048 || lv.height < 1024 {
        return Err(labkit::errors::AppError::Other(
            "该层级太小，请指定更精细的层级".into(),
        ));
    }
    let x = ((lv.width / 2) / 1024) * 1024;
    let y = ((lv.height / 2) / 1024) * 1024;

    let t0 = std::time::Instant::now();
    let a = reader.read_level_region_rgba(level, x, y, 1024, 1024)?;
    let t_a = t0.elapsed();
    let t1 = std::time::Instant::now();
    let b = reader.read_level_region_rgba(level, x + 1024, y, 1024, 1024)?;
    let t_b = t1.elapsed();
    let t2 = std::time::Instant::now();
    let wide = reader.read_level_region_rgba(level, x, y, 2048, 1024)?;
    let t_wide = t2.elapsed();
    let t3 = std::time::Instant::now();
    for i in 0..4u32 {
        reader.read_level_region_rgba(level, x + 1024 * (i % 2), y, 1024, 1024)?;
    }
    let t_warm = t3.elapsed() / 4;

    let mean = |d: &[u8]| -> [f64; 3] {
        let mut s = [0f64; 3];
        let n = (d.len() / 4) as f64;
        for p in d.chunks_exact(4) {
            s[0] += p[0] as f64;
            s[1] += p[1] as f64;
            s[2] += p[2] as f64;
        }
        [s[0] / n, s[1] / n, s[2] / n]
    };
    println!("level {level}  origin ({x},{y})");
    println!("解码耗时: 首块 {t_a:?} / 次块 {t_b:?} / 2048宽 {t_wide:?} / 稳态均值 {t_warm:?}");
    println!("tile A mean RGB = {:?}", mean(&a.data));
    println!("tile B mean RGB = {:?}", mean(&b.data));
    println!("wide  mean RGB = {:?}", mean(&wide.data));

    // Same pixels? Compare each tile against the corresponding half of `wide`.
    let mut max_diff = 0u8;
    let mut sum_diff = 0u64;
    for row in 0..1024usize {
        for col in 0..2048usize {
            let wi = (row * 2048 + col) * 4;
            let (src, sx) = if col < 1024 { (&a, col) } else { (&b, col - 1024) };
            let ti = (row * 1024 + sx) * 4;
            for c in 0..3 {
                let d = (wide.data[wi + c] as i32 - src.data[ti + c] as i32).unsigned_abs() as u8;
                max_diff = max_diff.max(d);
                sum_diff += d as u64;
            }
        }
    }
    let n = (2048 * 1024 * 3) as f64;
    println!("拼接 vs 整块: mean|Δ| = {:.4}, max|Δ| = {max_diff}", sum_diff as f64 / n);

    // Border continuity: last column of A against first column of B.
    let mut border = 0u64;
    for row in 0..1024usize {
        let pa = &a.data[(row * 1024 + 1023) * 4..][..3];
        let pb = &b.data[(row * 1024) * 4..][..3];
        for c in 0..3 {
            border += (pa[c] as i32 - pb[c] as i32).unsigned_abs() as u64;
        }
    }
    println!("共享边 mean|Δ| = {:.3}（组织内部相邻列的自然差通常 3~15）", border as f64 / (1024.0 * 3.0));
    Ok(())
}

fn arg_value(args: &[String], key: &str) -> Option<String> {
    args.iter()
        .position(|a| a == key)
        .and_then(|i| args.get(i + 1))
        .cloned()
}

fn cmd_info(args: &[String]) -> labkit::errors::Result<()> {
    let path = args
        .get(1)
        .map(PathBuf::from)
        .ok_or_else(|| labkit::errors::AppError::Other("缺少切片路径".into()))?;
    let reader = SlideReader::open(&path)?;
    let info = reader.info();
    println!("path = {}", path.display());
    println!("level_count = {}", info.levels.len());
    println!("full = {} x {}", info.full_w, info.full_h);
    for lv in &info.levels {
        println!(
            "level {} = {} x {} (downsample {})",
            lv.level, lv.width, lv.height, lv.downsample
        );
    }
    Ok(())
}

fn cmd_export(args: &[String]) -> labkit::errors::Result<()> {
    let slide = arg_value(args, "--slide")
        .map(PathBuf::from)
        .ok_or_else(|| labkit::errors::AppError::Other("缺少 --slide".into()))?;
    let out = arg_value(args, "--out")
        .map(PathBuf::from)
        .ok_or_else(|| labkit::errors::AppError::Other("缺少 --out".into()))?;
    let session = arg_value(args, "--session").map(PathBuf::from);
    let mag = arg_value(args, "--mag");
    labkit::cli::export(&slide, session.as_deref(), &out, mag)
}

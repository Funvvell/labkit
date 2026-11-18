//! Application entry point.
//!
//! CLI modes (headless parity verification, unchanged from the egui build):
//!   pathology-crop-rs --info <slide.sdpc>
//!   pathology-crop-rs --export --slide <s.sdpc> --session <rois.json> --out <dir>
//! With no arguments the Tauri macOS-style toolbox window starts.

// Release 构建为 GUI 子系统：双击启动不再弹出命令行黑框。
// Debug 保留控制台便于开发；从终端启动时 CLI 模式仍继承父控制台输出。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use pathology_crop_rs::commands::AppState;
use pathology_crop_rs::sdpc::SlideReader;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();

    // Headless CLI paths keep the reused core independently verifiable.
    if !args.is_empty() && !args[0].starts_with("--tauri") {
        let result = match args[0].as_str() {
            "--info" => cmd_info(&args),
            "--export" => cmd_export(&args),
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
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            pathology_crop_rs::commands::init_engine,
            pathology_crop_rs::commands::read_file_as_data_url,
            pathology_crop_rs::commands::enqueue_open,
            pathology_crop_rs::commands::begin_tiles,
            pathology_crop_rs::commands::enqueue_tile,
            pathology_crop_rs::commands::poll_decoder,
            pathology_crop_rs::commands::load_rois,
            pathology_crop_rs::commands::save_rois,
            pathology_crop_rs::commands::create_roi,
            pathology_crop_rs::commands::export_rois,
            pathology_crop_rs::commands::cancel_export,
            pathology_crop_rs::commands::default_output_dir,
            pathology_crop_rs::commands::qpcr_parse_csv_text,
            pathology_crop_rs::commands::qpcr_parse_csv_file,
            pathology_crop_rs::commands::qpcr_parse_excel,
            pathology_crop_rs::commands::qpcr_parse_instrument,
            pathology_crop_rs::commands::qpcr_parse_pasted,
            pathology_crop_rs::commands::qpcr_analyze,
            pathology_crop_rs::commands::qpcr_new_run,
            pathology_crop_rs::commands::qpcr_default_design,
            pathology_crop_rs::commands::qpcr_load_session,
            pathology_crop_rs::commands::qpcr_save_session,
            pathology_crop_rs::commands::qpcr_export_csv,
            pathology_crop_rs::commands::app_info,
        ])
        .run(tauri::generate_context!())
        .expect("启动工具箱失败");
}

fn print_usage() {
    println!(
        "病理工具箱 (Rust/Tauri)\n\
         \n\
         用法:\n  \
         pathology-crop-rs                          启动图形界面\n  \
         pathology-crop-rs --info <切片.sdpc>       打印切片元数据\n  \
         pathology-crop-rs --export --slide <s.sdpc> --session <rois.json> --out <目录> [--mag 20]"
    );
}

fn arg_value(args: &[String], key: &str) -> Option<String> {
    args.iter()
        .position(|a| a == key)
        .and_then(|i| args.get(i + 1))
        .cloned()
}

fn cmd_info(args: &[String]) -> pathology_crop_rs::errors::Result<()> {
    let path = args
        .get(1)
        .map(PathBuf::from)
        .ok_or_else(|| pathology_crop_rs::errors::AppError::Other("缺少切片路径".into()))?;
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

fn cmd_export(args: &[String]) -> pathology_crop_rs::errors::Result<()> {
    let slide = arg_value(args, "--slide")
        .map(PathBuf::from)
        .ok_or_else(|| pathology_crop_rs::errors::AppError::Other("缺少 --slide".into()))?;
    let out = arg_value(args, "--out")
        .map(PathBuf::from)
        .ok_or_else(|| pathology_crop_rs::errors::AppError::Other("缺少 --out".into()))?;
    let session = arg_value(args, "--session").map(PathBuf::from);
    let mag = arg_value(args, "--mag");
    pathology_crop_rs::cli::export(&slide, session.as_deref(), &out, mag)
}

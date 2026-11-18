//! Application entry point.
//!
//! CLI modes (used for parity verification without a GPU):
//!   `pathology-crop-rs --info <slide.sdpc>`
//!   `pathology-crop-rs --export --slide <slide.sdpc> --session <rois.json> --out <dir> [--mag 20]`
//! With no arguments the egui application starts.

use std::path::PathBuf;

use pathology_crop_rs::sdpc::SlideReader;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.is_empty() {
        // GUI is wired up in a later milestone.
        match pathology_crop_rs::ui::run() {
            Ok(()) => {}
            Err(e) => {
                eprintln!("启动界面失败: {e}");
                std::process::exit(1);
            }
        }
        return;
    }

    let result = match args[0].as_str() {
        "--info" => cmd_info(&args),
        "--export" => cmd_export(&args),
        "--help" | "-h" => {
            print_usage();
            Ok(())
        }
        other => {
            eprintln!("未知参数: {other}");
            print_usage();
            std::process::exit(2);
        }
    };

    if let Err(e) = result {
        eprintln!("错误: {e}");
        std::process::exit(1);
    }
}

fn print_usage() {
    println!(
        "病理裁剪工具 (Rust)\n\
         \n\
         用法:\n  \
         pathology-crop-rs                         启动图形界面\n  \
         pathology-crop-rs --info <切片.sdpc>      打印切片元数据\n  \
         pathology-crop-rs --export --slide <切片.sdpc> --session <rois.json> --out <目录> [--mag 20]"
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
    println!("mpp = {:?}", info.mpp);
    println!("scale = {}", info.scale);
    for lv in &info.levels {
        println!(
            "level {} = {} x {} (downsample {})",
            lv.level, lv.width, lv.height, lv.downsample
        );
    }
    let thumb = reader.thumbnail()?;
    use sha2::{Digest, Sha256};
    let hash = Sha256::digest(&thumb.data);
    let hex: String = hash.iter().map(|b| format!("{b:02x}")).collect();
    println!("thumb = {} x {}", thumb.w, thumb.h);
    println!("thumb_sha256 = {hex}");
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

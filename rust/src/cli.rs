//! Headless CLI export, used for parity verification against the Python app.

use std::cell::RefCell;
use std::path::Path;

use sha2::{Digest, Sha256};

use crate::errors::{AppError, Result};
use crate::export::{export_with, ExportEvent, ExportFormat, ExportOptions};
use crate::geometry::center_crop_rect;
use crate::model::session;
use crate::model::Roi;
use crate::slide::Slide;

fn hex(data: &[u8]) -> String {
    let hash = Sha256::digest(data);
    hash.iter().map(|b| format!("{b:02x}")).collect()
}

/// A few ROIs covering normal, left-edge and top-edge clamping when no
/// session file was supplied.
fn default_rois(slide: &Path, w: i64, h: i64) -> Vec<Roi> {
    let mk = |x: i64, y: i64, rw: i64, rh: i64| Roi::new(slide, x, y, rw, rh, 0.0);
    vec![
        mk((w / 2 - 512).max(0), (h / 2 - 512).max(0), 1024, 1024),
        mk(10, h / 2, 200, 200),
        mk(w / 2, 10, 200, 200),
    ]
}

pub fn export(
    slide: &Path,
    session_path: Option<&Path>,
    out: &Path,
    mag: Option<String>,
    format: ExportFormat,
    quality: u8,
) -> Result<()> {
    let reader = Slide::open(slide)?;
    let (full_w, full_h) = (reader.info().full_w, reader.info().full_h);
    let dpi = reader.info().mpp.and_then(crate::export::mpp_to_dpi);

    let rois: Vec<Roi> = match session_path {
        Some(p) => session::parse_rois(&std::fs::read_to_string(p)?)?,
        None => default_rois(slide, full_w, full_h),
    };
    if rois.is_empty() {
        return Err(AppError::Other("没有可导出的 ROI".into()));
    }

    // Manifest uses the ROI geometry as key, so file numbering differences
    // between the two implementations cannot affect the comparison.
    let manifest: RefCell<Vec<serde_json::Value>> = RefCell::new(Vec::new());
    let opts = ExportOptions::new(out.to_path_buf(), mag).with_format(format, quality);

    let report = export_with(
        &rois,
        &opts,
        |roi| {
            let r = roi.rect();
            let (cx, cy) = r.center();
            let crop = center_crop_rect(cx, cy, r.w, r.h, full_w, full_h);
            let img = reader.extract_region(crop.x, crop.y, crop.w, crop.h, 0)?;
            manifest.borrow_mut().push(serde_json::json!({
                "roi_key": format!("{}|{},{},{},{}", slide.display(), roi.x, roi.y, roi.w, roi.h),
                "w": img.w,
                "h": img.h,
                "sha256_rgb": hex(&img.data),
            }));
            Ok((img, dpi))
        },
        |ev| match ev {
            ExportEvent::Progress { current, total } => {
                println!("[{current}/{total}] 导出中")
            }
            ExportEvent::FileDone { name, result } => match result {
                Ok(()) => println!("  OK  {name}"),
                Err(e) => println!("  ERR {name}: {e}"),
            },
            ExportEvent::Finished { ok, failed, cancelled } => {
                println!("完成: 成功 {ok} / 失败 {failed} / 取消 {cancelled}")
            }
        },
    );

    let manifest = serde_json::json!({ "items": manifest.into_inner() });
    std::fs::write(out.join("manifest.json"), serde_json::to_string_pretty(&manifest)?)?;

    println!("输出目录: {}", out.display());
    if report.failed > 0 {
        return Err(AppError::Other(format!("{} 个 ROI 导出失败", report.failed)));
    }
    Ok(())
}

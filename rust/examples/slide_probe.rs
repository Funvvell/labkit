//! Developer probe for the unified slide layer.
//!
//! ```text
//! cargo run --example slide_probe -- <slide-or-mrxs-folder>
//! ```
//!
//! Prints engine/format/metadata and decodes a 1024 px centre region plus the
//! slide thumbnail, so every supported format can be smoke-tested without the
//! GUI. Exits non-zero on any decode failure.

use std::path::PathBuf;

use labkit::slide::Slide;

fn main() {
    let path = std::env::args()
        .nth(1)
        .map(PathBuf::from)
        .expect("usage: slide_probe <slide>");
    let slide = Slide::open(&path).expect("open slide");
    let info = slide.info();
    let meta = slide.meta();
    println!(
        "engine={} format={} vendor={:?} size={}x{} mpp={:?}/{:?} levels={}",
        meta.engine,
        meta.format,
        meta.vendor,
        info.full_w,
        info.full_h,
        meta.mpp_x,
        meta.mpp_y,
        meta.level_count
    );
    for lv in &info.levels {
        println!(
            "  level {}: {}x{} downsample {:.4}",
            lv.level, lv.width, lv.height, lv.downsample
        );
    }

    let side = 1024u32;
    let x = ((info.full_w.max(0) as u32).saturating_sub(side)) / 2;
    let y = ((info.full_h.max(0) as u32).saturating_sub(side)) / 2;
    let w = side.min(info.full_w.max(0) as u32).max(1);
    let h = side.min(info.full_h.max(0) as u32).max(1);
    let region = slide
        .extract_region(x as i64, y as i64, w as i64, h as i64, 0)
        .expect("decode centre region");
    println!("centre region: {}x{} ({} bytes)", region.w, region.h, region.data.len());

    let thumb = slide.thumbnail().expect("thumbnail");
    println!("thumbnail: {}x{}", thumb.w, thumb.h);

    for name in ["label", "macro"] {
        match slide.associated_image(name) {
            Ok(Some(img)) => println!("{name}: {}x{}", img.w, img.h),
            Ok(None) => println!("{name}: none"),
            Err(e) => println!("{name}: error {e}"),
        }
    }

    if let Ok(dir) = std::env::var("LABKIT_PROBE_EXPORT") {
        use labkit::export::{mpp_to_dpi, write_rgb_image, ExportFormat};
        let dpi = info.mpp.and_then(mpp_to_dpi);
        for fmt in [ExportFormat::Tiff, ExportFormat::Png, ExportFormat::Jpeg] {
            let out = PathBuf::from(&dir).join(format!("probe.{}", fmt.extension()));
            write_rgb_image(&out, &region, fmt, 95, dpi).expect("write export");
            let bytes = std::fs::metadata(&out).expect("export metadata").len();
            println!(
                "export {}: {} bytes (dpi {:?})",
                fmt.label(),
                bytes,
                dpi.map(|d| d.round())
            );
        }
    }
}

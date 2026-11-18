//! RGB888 -> PNG/base64 conversion for the Tauri web front-end.
//!
//! The egui version uploaded an egui::TextureHandle once per decoded tile.
//! In the Tauri build the decoded tile is encoded to a PNG data URL and
//! passed to the WebView, where an <img>/canvas paints it. The expensive
//! encode only happens once per tile response, never per frame.

use base64::Engine;
use image::codecs::png::PngEncoder;
use image::{ExtendedColorType, ImageEncoder};

use crate::errors::{AppError, Result};
use crate::sdpc::RgbImage;

/// Encode an RGB888 image to PNG bytes.
pub fn encode_png(img: &RgbImage) -> Result<Vec<u8>> {
    let mut buf = Vec::with_capacity((img.w as usize) * (img.h as usize) * 3 / 2);
    let encoder = PngEncoder::new(&mut buf);
    encoder
        .write_image(&img.data, img.w, img.h, ExtendedColorType::Rgb8)
        .map_err(|e| AppError::Other(format!("PNG 编码失败: {e}")))?;
    Ok(buf)
}

/// Data URL ready to be assigned to an <img>.src in the WebView.
pub fn to_data_url(img: &RgbImage) -> Result<String> {
    let png = encode_png(img)?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&png);
    Ok(format!("data:image/png;base64,{b64}"))
}

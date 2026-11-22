//! Export encoders. TIFF stays the archival default; PNG/JPEG are for figures
//! and quick sharing. All three carry a physical-resolution tag derived from
//! the slide's mpp when available.

use std::fs::File;
use std::io::BufWriter;
use std::path::Path;

use image::codecs::jpeg::{JpegEncoder, PixelDensity};
use image::ExtendedColorType;
use serde::{Deserialize, Serialize};
use tiff::encoder::{colortype, compression::Deflate, Rational, TiffEncoder};
use tiff::tags::ResolutionUnit;

use crate::errors::{AppError, Result};
use crate::sdpc::RgbImage;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    #[default]
    Tiff,
    Png,
    Jpeg,
}

impl ExportFormat {
    pub fn extension(self) -> &'static str {
        match self {
            Self::Tiff => "tiff",
            Self::Png => "png",
            Self::Jpeg => "jpg",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Self::Tiff => "TIFF",
            Self::Png => "PNG",
            Self::Jpeg => "JPEG",
        }
    }
}

pub fn write_rgb_image(
    path: &Path,
    image: &RgbImage,
    format: ExportFormat,
    quality: u8,
    dpi: Option<f64>,
) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    match format {
        ExportFormat::Tiff => write_tiff(path, image, dpi),
        ExportFormat::Png => write_png(path, image, dpi),
        ExportFormat::Jpeg => write_jpeg(path, image, quality, dpi),
    }
}

fn write_tiff(path: &Path, image: &RgbImage, dpi: Option<f64>) -> Result<()> {
    let file = BufWriter::new(File::create(path)?);
    let mut encoder = TiffEncoder::new(file).map_err(|e| AppError::Tiff(e.to_string()))?;
    let mut out = encoder
        .new_image_with_compression::<colortype::RGB8, Deflate>(
            image.w,
            image.h,
            Deflate::default(),
        )
        .map_err(|e| AppError::Tiff(e.to_string()))?;
    if let Some(dpi) = valid_dpi(dpi) {
        let r = Rational {
            n: dpi.round().max(1.0) as u32,
            d: 1,
        };
        out.resolution(ResolutionUnit::Inch, r);
    }
    out.write_data(&image.data)
        .map_err(|e| AppError::Tiff(e.to_string()))?;
    Ok(())
}

fn write_png(path: &Path, image: &RgbImage, dpi: Option<f64>) -> Result<()> {
    let file = BufWriter::new(File::create(path)?);
    let mut encoder = png::Encoder::new(file, image.w, image.h);
    encoder.set_color(png::ColorType::Rgb);
    encoder.set_depth(png::BitDepth::Eight);
    if let Some(dpi) = valid_dpi(dpi) {
        // PNG pHYs stores pixels per metre.
        let ppu = (dpi / 0.0254).round().clamp(1.0, u32::MAX as f64) as u32;
        encoder.set_pixel_dims(Some(png::PixelDimensions {
            xppu: ppu,
            yppu: ppu,
            unit: png::Unit::Meter,
        }));
    }
    let mut writer = encoder
        .write_header()
        .map_err(|e| AppError::Encode(format!("PNG 头写入失败: {e}")))?;
    writer
        .write_image_data(&image.data)
        .map_err(|e| AppError::Encode(format!("PNG 写入失败: {e}")))?;
    Ok(())
}

fn write_jpeg(path: &Path, image: &RgbImage, quality: u8, dpi: Option<f64>) -> Result<()> {
    if image.w > 65_535 || image.h > 65_535 {
        return Err(AppError::Encode(format!(
            "JPEG 单边不能超过 65535 像素（当前 {}×{}），请改用 TIFF 或 PNG",
            image.w, image.h
        )));
    }
    let file = BufWriter::new(File::create(path)?);
    let mut writer = file;
    let mut encoder = JpegEncoder::new_with_quality(&mut writer, quality.clamp(1, 100));
    if let Some(dpi) = valid_dpi(dpi) {
        encoder.set_pixel_density(PixelDensity::dpi(dpi.round().clamp(1.0, 65535.0) as u16));
    }
    encoder
        .encode(
            &image.data,
            image.w,
            image.h,
            ExtendedColorType::Rgb8,
        )
        .map_err(|e| AppError::Encode(format!("JPEG 写入失败: {e}")))?;
    Ok(())
}

/// Convert mpp (µm/px) to dpi; ignore absurd values instead of writing garbage.
pub fn mpp_to_dpi(mpp: f64) -> Option<f64> {
    if !mpp.is_finite() || mpp <= 0.0 {
        return None;
    }
    let dpi = 25_400.0 / mpp;
    (dpi >= 1.0 && dpi <= 1_000_000.0).then_some(dpi)
}

fn valid_dpi(dpi: Option<f64>) -> Option<f64> {
    dpi.filter(|d| d.is_finite() && *d >= 1.0 && *d <= 1_000_000.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extensions_are_stable() {
        assert_eq!(ExportFormat::Tiff.extension(), "tiff");
        assert_eq!(ExportFormat::Png.extension(), "png");
        assert_eq!(ExportFormat::Jpeg.extension(), "jpg");
    }

    #[test]
    fn mpp_to_dpi_is_sane() {
        assert_eq!(mpp_to_dpi(0.25).map(|d| d.round()), Some(101_600.0));
        assert_eq!(mpp_to_dpi(0.0), None);
        assert_eq!(mpp_to_dpi(f64::NAN), None);
    }
}

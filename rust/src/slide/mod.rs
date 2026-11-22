//! Unified slide layer: SDPC through the vendor DLL, everything else through
//! `wsi-rs` (pure Rust). Callers never see which engine is behind a slide.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::errors::{AppError, Result};
use crate::sdpc::{LevelInfo, RgbImage, RgbaImage, SlideInfo, SlideReader};

/// Extra metadata that is not part of the long-lived `SlideInfo` contract.
/// Keeping it separate means existing ROI/CLI/session code is untouched.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SlideMeta {
    pub engine: String,
    pub format: String,
    pub vendor: Option<String>,
    pub mpp_x: Option<f64>,
    pub mpp_y: Option<f64>,
    pub objective_power: Option<f64>,
    pub level_count: usize,
    /// Curated scanner properties (OpenSlide-compatible key names).
    pub properties: BTreeMap<String, String>,
}

pub struct Slide {
    path: PathBuf,
    info: SlideInfo,
    meta: SlideMeta,
    inner: Inner,
}

enum Inner {
    Sdpc(SlideReader),
    Wsi {
        slide: wsi_rs::Slide,
        scene: usize,
        series: usize,
    },
}

impl Slide {
    pub fn open(path: &Path) -> Result<Self> {
        if !path.exists() {
            return Err(AppError::OpenFailed(path.to_path_buf()));
        }
        let ext = path
            .extension()
            .map(|e| e.to_string_lossy().to_ascii_lowercase())
            .unwrap_or_default();

        if ext == "sdpc" {
            let reader = SlideReader::open(path)?;
            let info = reader.info().clone();
            let mpp = info.mpp;
            let meta = SlideMeta {
                engine: "sdpc".into(),
                format: "SDPC".into(),
                vendor: Some("SDPC".into()),
                mpp_x: mpp,
                mpp_y: mpp,
                objective_power: None,
                level_count: info.levels.len(),
                properties: BTreeMap::new(),
            };
            return Ok(Self {
                path: path.to_path_buf(),
                info,
                meta,
                inner: Inner::Sdpc(reader),
            });
        }

        let slide = wsi_rs::Slide::open(path).map_err(|e| {
            AppError::Wsi(format!("{}（{}）", e, path.display()))
        })?;
        let (scene, series) = pick_pyramid(slide.dataset()).ok_or_else(|| {
            AppError::Wsi(format!("文件中没有可读的图像金字塔：{}", path.display()))
        })?;
        let ds = slide.dataset();
        let series_data = &ds.scenes[scene].series[series];

        let mut levels = Vec::with_capacity(series_data.levels.len());
        for (index, lv) in series_data.levels.iter().enumerate() {
            let w = lv.dimensions.0.min(u32::MAX as u64) as u32;
            let h = lv.dimensions.1.min(u32::MAX as u64) as u32;
            if w == 0 || h == 0 {
                continue;
            }
            levels.push(LevelInfo {
                level: index as u32,
                width: w,
                height: h,
                downsample: lv.downsample,
            });
        }
        if levels.is_empty() {
            return Err(AppError::Wsi(format!(
                "文件中没有可用的分辨率层级：{}",
                path.display()
            )));
        }

        let full_w = levels[0].width as i64;
        let full_h = levels[0].height as i64;
        let scale = levels
            .get(1)
            .map(|l| if l.downsample > 0.0 { 1.0 / l.downsample } else { 1.0 })
            .unwrap_or(1.0);

        let (mpp_x, mpp_y) = properties_mpp(&ds.properties);
        let mpp = mpp_x.or(mpp_y);
        let meta = SlideMeta {
            engine: "wsi-rs".into(),
            format: format_label(ds.properties.vendor(), &ext),
            vendor: ds.properties.vendor().map(|v| v.to_string()),
            mpp_x,
            mpp_y,
            objective_power: ds.properties.objective_power(),
            level_count: levels.len(),
            properties: curated_properties(&ds.properties),
        };

        Ok(Self {
            path: path.to_path_buf(),
            info: SlideInfo {
                levels,
                full_w,
                full_h,
                mpp,
                scale,
            },
            meta,
            inner: Inner::Wsi {
                slide,
                scene,
                series,
            },
        })
    }

    pub fn info(&self) -> &SlideInfo {
        &self.info
    }

    pub fn meta(&self) -> &SlideMeta {
        &self.meta
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    pub fn read_level_region_rgba(
        &self,
        level: u32,
        x: u32,
        y: u32,
        w: u32,
        h: u32,
    ) -> Result<RgbaImage> {
        if w == 0 || h == 0 {
            return Err(AppError::InvalidRegion(format!("{w}x{h}")));
        }
        match &self.inner {
            Inner::Sdpc(reader) => reader.read_level_region_rgba(level, x, y, w, h),
            Inner::Wsi {
                slide,
                scene,
                series,
            } => {
                let req = wsi_rs::RegionRequest::new(
                    *scene,
                    *series,
                    level,
                    (x as i64, y as i64),
                    (w, h),
                );
                let img = slide.read_region_rgba(&req).map_err(wsi_err)?;
                let (w, h) = img.dimensions();
                Ok(RgbaImage {
                    w,
                    h,
                    data: img.into_raw(),
                })
            }
        }
    }

    pub fn read_level_region(
        &self,
        level: u32,
        x: u32,
        y: u32,
        w: u32,
        h: u32,
    ) -> Result<RgbImage> {
        match &self.inner {
            Inner::Sdpc(reader) => reader.read_level_region(level, x, y, w, h),
            Inner::Wsi { .. } => {
                let rgba = self.read_level_region_rgba(level, x, y, w, h)?;
                Ok(RgbImage {
                    w: rgba.w,
                    h: rgba.h,
                    data: rgba_to_rgb_white(&rgba.data),
                })
            }
        }
    }

    /// Level-0 crop used by the exporter. Kept explicit so the SDPC path
    /// remains byte-for-byte identical to the previous implementation.
    pub fn extract_region(&self, x: i64, y: i64, w: i64, h: i64, level: u32) -> Result<RgbImage> {
        match &self.inner {
            Inner::Sdpc(reader) => reader.extract_region(x, y, w, h, level),
            Inner::Wsi { .. } => {
                if x < 0 || y < 0 || w <= 0 || h <= 0 {
                    return Err(AppError::InvalidRegion(format!(
                        "x={x} y={y} w={w} h={h}"
                    )));
                }
                self.read_level_region(level, x as u32, y as u32, w as u32, h as u32)
            }
        }
    }

    pub fn thumbnail(&self) -> Result<RgbImage> {
        match &self.inner {
            Inner::Sdpc(reader) => reader.thumbnail(),
            Inner::Wsi { slide, .. } => {
                if slide.dataset().associated_images.contains_key("thumbnail") {
                    if let Ok(tile) = slide.read_associated("thumbnail") {
                        if let Ok(rgba) = tile_rgba(&tile) {
                            let w = rgba.width();
                            let h = rgba.height();
                            let rgb = RgbImage {
                                w,
                                h,
                                data: rgba_to_rgb_white(rgba.as_raw()),
                            };
                            return Ok(downscale_rgb(rgb, 1200));
                        }
                    }
                }
                let last = self
                    .info
                    .levels
                    .last()
                    .ok_or_else(|| AppError::BadMetadata("没有层级".into()))?;
                let rgba = self.read_level_region_rgba(last.level, 0, 0, last.width, last.height)?;
                let rgb = RgbImage {
                    w: rgba.w,
                    h: rgba.h,
                    data: rgba_to_rgb_white(&rgba.data),
                };
                Ok(downscale_rgb(rgb, 1200))
            }
        }
    }

    /// Label / macro / any scanner-associated image, already white-composited
    /// and capped for preview. `None` means the format simply has no such image.
    pub fn associated_image(&self, name: &str) -> Result<Option<RgbImage>> {
        match &self.inner {
            Inner::Sdpc(_) => Ok(None),
            Inner::Wsi { slide, .. } => {
                if !slide.dataset().associated_images.contains_key(name) {
                    return Ok(None);
                }
                let tile = slide.read_associated(name).map_err(wsi_err)?;
                let rgba = tile_rgba(&tile).map_err(wsi_err)?;
                let w = rgba.width();
                let h = rgba.height();
                let rgb = RgbImage {
                    w,
                    h,
                    data: rgba_to_rgb_white(rgba.as_raw()),
                };
                Ok(Some(downscale_rgb(rgb, 1600)))
            }
        }
    }

    /// A best-effort label for logs / UI; never fails the open path.
    pub fn diagnostic(&self) -> String {
        format!(
            "{} · {} · {}×{} · {} levels",
            self.meta.engine,
            self.meta.format,
            self.info.full_w,
            self.info.full_h,
            self.info.levels.len()
        )
    }
}

fn pick_pyramid(ds: &wsi_rs::Dataset) -> Option<(usize, usize)> {
    let mut best: Option<(usize, usize, u64)> = None;
    for (si, scene) in ds.scenes.iter().enumerate() {
        for (ri, series) in scene.series.iter().enumerate() {
            let Some(first) = series.levels.first() else {
                continue;
            };
            let area = first.dimensions.0.saturating_mul(first.dimensions.1);
            if best.is_none_or(|(_, _, a)| area > a) {
                best = Some((si, ri, area));
            }
        }
    }
    best.map(|(s, r, _)| (s, r))
}

fn properties_mpp(props: &wsi_rs::Properties) -> (Option<f64>, Option<f64>) {
    let parse = |key: &str| {
        props
            .get(key)
            .and_then(|v| v.parse::<f64>().ok())
            .filter(|v| v.is_finite() && *v > 0.0)
    };
    (parse("openslide.mpp-x"), parse("openslide.mpp-y"))
}

fn format_label(vendor: Option<&str>, ext: &str) -> String {
    let v = vendor.unwrap_or("").to_ascii_lowercase();
    let label = match v.as_str() {
        "aperio" => "Aperio SVS",
        "hamamatsu" if ext == "vms" || ext == "vmu" => "Hamamatsu VMS/VMU",
        "hamamatsu" => "Hamamatsu NDPI",
        "mirax" => "3DHISTECH MIRAX",
        "leica" => "Leica SCN",
        "ventana" => "Ventana BIF",
        "philips" => "Philips TIFF",
        "zeiss" if ext == "zvi" => "Zeiss ZVI",
        "zeiss" => "Zeiss CZI",
        "olympus" => "Olympus VSI",
        "trestle" => "Trestle TIFF",
        "huron" => "Huron TIFF",
        "argos" => "ARGOS AVS",
        "dicom" => "DICOM WSI",
        _ => "",
    };
    if !label.is_empty() {
        return label.into();
    }
    if ext.is_empty() {
        "WSI".into()
    } else {
        ext.to_ascii_uppercase()
    }
}

fn curated_properties(props: &wsi_rs::Properties) -> BTreeMap<String, String> {
    let prefixes = [
        "openslide.",
        "aperio.",
        "hamamatsu.",
        "mirax.",
        "leica.",
        "ventana.",
        "philips.",
        "zeiss.",
        "olympus.",
        "dicom.",
    ];
    let mut out = BTreeMap::new();
    for (key, value) in props.iter() {
        if out.len() >= 40 {
            break;
        }
        if prefixes.iter().any(|p| key.starts_with(p)) {
            let clipped: String = value.chars().take(160).collect();
            out.insert(key.to_string(), clipped);
        }
    }
    out
}

fn wsi_err(e: wsi_rs::WsiError) -> AppError {
    AppError::Wsi(e.to_string())
}

/// Composite straight-alpha RGBA over white, dropping the alpha channel.
/// This is what a pathology viewer and a TIFF/PNG export both expect.
pub fn rgba_to_rgb_white(data: &[u8]) -> Vec<u8> {
    let mut out = Vec::with_capacity(data.len() / 4 * 3);
    for px in data.chunks_exact(4) {
        let a = px[3] as u32;
        let inv = 255 - a;
        out.push((px[0] as u32 + inv).min(255) as u8);
        out.push((px[1] as u32 + inv).min(255) as u8);
        out.push((px[2] as u32 + inv).min(255) as u8);
    }
    out
}

/// Convert an associated-image tile to RGBA. Label/macro images are often
/// 16-bit or float even when the pyramid itself is 8-bit (notably Zeiss CZI),
/// so pick a display window from the actual data instead of calling
/// `to_rgba()`, which only accepts Uint8.
fn tile_rgba(tile: &wsi_rs::CpuTile) -> std::result::Result<image::RgbaImage, wsi_rs::WsiError> {
    use wsi_rs::{CpuTileData, DisplayWindow};

    match tile.data() {
        CpuTileData::U8(_) => tile.to_rgba(),
        CpuTileData::U16(values) => {
            let mut lo = u16::MAX;
            let mut hi = 0u16;
            for &v in values.iter() {
                lo = lo.min(v);
                hi = hi.max(v);
            }
            let (min, max) = (lo as f64, hi as f64);
            let window = if max > min {
                DisplayWindow::new(min, max)?
            } else {
                DisplayWindow::new(0.0, 65535.0)?
            };
            tile.to_rgba_windowed(&window)
        }
        CpuTileData::F32(values) => {
            let mut lo = f32::INFINITY;
            let mut hi = f32::NEG_INFINITY;
            for &v in values.iter() {
                if v.is_finite() {
                    lo = lo.min(v);
                    hi = hi.max(v);
                }
            }
            let (min, max) = if lo.is_finite() && hi.is_finite() {
                (lo as f64, hi as f64)
            } else {
                (0.0, 1.0)
            };
            let window = if max > min {
                DisplayWindow::new(min, max)?
            } else {
                DisplayWindow::new(0.0, 1.0)?
            };
            tile.to_rgba_windowed(&window)
        }
        _ => tile.to_rgba(),
    }
}

fn downscale_rgb(mut img: RgbImage, max_side: u32) -> RgbImage {
    if img.w <= max_side && img.h <= max_side {
        return img;
    }
    let scale = max_side as f64 / img.w.max(img.h) as f64;
    let nw = ((img.w as f64 * scale).round() as u32).max(1);
    let nh = ((img.h as f64 * scale).round() as u32).max(1);
    let src: image::RgbImage =
        image::ImageBuffer::from_raw(img.w, img.h, std::mem::take(&mut img.data))
            .unwrap_or_else(|| image::RgbImage::new(img.w, img.h));
    let resized = image::imageops::resize(&src, nw, nh, image::imageops::FilterType::Triangle);
    RgbImage {
        w: nw,
        h: nh,
        data: resized.into_raw(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rgba_composites_on_white() {
        let rgba = [10u8, 20, 30, 255, 10, 20, 30, 0];
        assert_eq!(rgba_to_rgb_white(&rgba), vec![10, 20, 30, 255, 255, 255]);
    }

    #[test]
    fn vendor_labels_are_stable() {
        assert_eq!(format_label(Some("aperio"), "svs"), "Aperio SVS");
        assert_eq!(format_label(Some("zeiss"), "czi"), "Zeiss CZI");
        assert_eq!(format_label(None, "tiff"), "TIFF");
    }
}

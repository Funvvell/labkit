//! Safe `SlideReader` wrapper. Zero unsafe code lives in this file.

use std::path::{Path, PathBuf};
use std::ptr::NonNull;

use serde::{Deserialize, Serialize};

use crate::errors::{AppError, Result};
use crate::geometry::Rect;
use crate::sdpc::ffi::{self, SqSdpcInfo};
use crate::sdpc::structs;

/// Contiguous RGB888 pixels.
#[derive(Debug, Clone)]
pub struct RgbImage {
    pub w: u32,
    pub h: u32,
    pub data: Vec<u8>,
}

impl RgbImage {
    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
}

/// Contiguous RGBA8888 pixels (alpha always 255) — the preview/tile format.
/// Shipped to the WebView as raw bytes, so it needs no image encoder at all.
#[derive(Debug, Clone)]
pub struct RgbaImage {
    pub w: u32,
    pub h: u32,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LevelInfo {
    pub level: u32,
    pub width: u32,
    pub height: u32,
    pub downsample: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlideInfo {
    pub levels: Vec<LevelInfo>,
    pub full_w: i64,
    pub full_h: i64,
    pub mpp: Option<f64>,
    pub scale: f64,
}

impl SlideInfo {
    pub fn best_level(&self, scale: f64) -> u32 {
        let target_downsample = if scale > 0.0 { 1.0 / scale } else { 1.0 };
        let mut best = 0;
        for lv in &self.levels {
            if lv.downsample <= target_downsample {
                best = lv.level;
            } else {
                break;
            }
        }
        best
    }
}

pub struct SlideReader {
    handle: NonNull<SqSdpcInfo>,
    info: SlideInfo,
    path: PathBuf,
    thumb_level_size: (u32, u32),
}

impl SlideReader {
    pub fn open(path: &Path) -> Result<Self> {
        let handle = ffi::open_slide(path)?;
        let head = structs::read_head(handle)?;

        if !(1..=32).contains(&head.hierarchy) {
            return Err(AppError::BadMetadata(format!(
                "hierarchy={} 不合理（可能结构体偏移不匹配）",
                head.hierarchy
            )));
        }
        let scale = if head.scale > 0.0 && head.scale <= 1.0 {
            head.scale
        } else {
            tracing::warn!("scale={} 不合理，回退为 1.0", head.scale);
            1.0
        };

        let mut levels = Vec::with_capacity(head.hierarchy as usize);
        for level in 0..head.hierarchy {
            let raw = ffi::layer_info(handle, level)?;
            let (w, h) = structs::parse_layer_info(&raw)?;
            levels.push(LevelInfo {
                level,
                width: w,
                height: h,
                downsample: (1.0 / scale).powi(level as i32),
            });
        }
        let (full_w, full_h) = (levels[0].width as i64, levels[0].height as i64);
        let thumb_level_size = levels
            .last()
            .map(|l| (l.width, l.height))
            .unwrap_or((full_w as u32, full_h as u32));

        Ok(Self {
            handle,
            info: SlideInfo {
                levels,
                full_w,
                full_h,
                mpp: (head.ruler > 0.0).then_some(head.ruler),
                scale,
            },
            path: path.to_path_buf(),
            thumb_level_size,
        })
    }

    pub fn info(&self) -> &SlideInfo {
        &self.info
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Port of `reader.py::extract_region`: `x/y/w/h` are level-0 coordinates.
    /// The dimensions are NOT divided by the level downsample (matching the
    /// original behaviour); only the origin is, via `int(x / downsample)`.
    pub fn extract_region(&self, x: i64, y: i64, w: i64, h: i64, level: u32) -> Result<RgbImage> {
        let r = ffi::clamp_to_slide(x, y, w, h, self.info.full_w, self.info.full_h);
        self.check_rect(r)?;
        let ds = self
            .info
            .levels
            .get(level as usize)
            .map(|l| l.downsample)
            .ok_or_else(|| AppError::InvalidRegion(format!("无层级 {level}")))?;
        let lx = if ds != 0.0 { (r.x as f64 / ds) as u32 } else { 0 };
        let ly = if ds != 0.0 { (r.y as f64 / ds) as u32 } else { 0 };
        self.read_raw(lx, ly, r.w as u32, r.h as u32, level)
    }

    /// Coordinates and dimensions are in the target level's local space.
    pub fn read_level_region(
        &self,
        level: u32,
        lx: u32,
        ly: u32,
        lw: u32,
        lh: u32,
    ) -> Result<RgbImage> {
        let (lw, lh) = self.clamp_level_rect(level, lx, ly, lw, lh)?;
        self.read_raw(lx, ly, lw, lh, level)
    }

    /// Preview path: identical geometry, RGBA8888 payload.
    pub fn read_level_region_rgba(
        &self,
        level: u32,
        lx: u32,
        ly: u32,
        lw: u32,
        lh: u32,
    ) -> Result<RgbaImage> {
        let (lw, lh) = self.clamp_level_rect(level, lx, ly, lw, lh)?;
        tracing::trace!("decode-rgba lv{level} ({lx},{ly},{lw},{lh}) {:?}", self.path);
        let data = ffi::decode_region_rgba(self.handle, lx, ly, lw, lh, level)?;
        Ok(RgbaImage { w: lw, h: lh, data })
    }

    /// Clamp a level-local rect to the level's real extent.
    fn clamp_level_rect(
        &self,
        level: u32,
        lx: u32,
        ly: u32,
        lw: u32,
        lh: u32,
    ) -> Result<(u32, u32)> {
        let lv = self
            .info
            .levels
            .get(level as usize)
            .ok_or_else(|| AppError::InvalidRegion(format!("无层级 {level}")))?;
        let lw = lw.min(lv.width.saturating_sub(lx));
        let lh = lh.min(lv.height.saturating_sub(ly));
        if lw == 0 || lh == 0 {
            return Err(AppError::InvalidRegion(format!(
                "lv{level} ({lx},{ly},{lw},{lh})"
            )));
        }
        Ok((lw, lh))
    }

    fn read_raw(&self, x: u32, y: u32, w: u32, h: u32, level: u32) -> Result<RgbImage> {
        tracing::trace!("decode lv{level} ({x},{y},{w},{h}) {:?}", self.path);
        let data = ffi::decode_region(self.handle, x, y, w, h, level)?;
        Ok(RgbImage { w, h, data })
    }

    /// Full slide at the lowest-resolution level (used as background + nav).
    pub fn thumbnail(&self) -> Result<RgbImage> {
        let level = (self.info.levels.len() - 1) as u32;
        let (tw, th) = self.thumb_level_size;
        self.read_level_region(level, 0, 0, tw, th)
    }

    fn check_rect(&self, r: Rect) -> Result<()> {
        if r.w <= 0 || r.h <= 0 {
            return Err(AppError::InvalidRegion(format!(
                "({},{},{},{})",
                r.x, r.y, r.w, r.h
            )));
        }
        Ok(())
    }
}

// Intentionally NO `Drop` implementation: `SqCloseSdpc` must never be called.
// `reader.py:585-607` documents that closing and re-opening in the same
// process causes an access violation inside DecodeSdpcDll.dll.

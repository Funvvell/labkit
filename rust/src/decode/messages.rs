//! Messages exchanged between the egui main thread and the single decoder
//! thread. The decoder DLL is not thread-safe, so *all* FFI work happens on
//! that one thread.

use std::path::PathBuf;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

use serde::{Deserialize, Serialize};

use crate::export::{ExportEvent, ExportOptions};
use crate::model::Roi;
use crate::sdpc::{RgbImage, SlideInfo};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TileKey {
    pub level: u32,
    pub x: u32,
    pub y: u32,
    pub w: u32,
    pub h: u32,
}

#[derive(Clone, Debug)]
pub enum Request {
    Open { path: PathBuf, gen: u64 },
    Thumbnail { path: PathBuf, gen: u64 },
    Tile { path: PathBuf, key: TileKey, gen: u64 },
    Export { rois: Vec<Roi>, opts: ExportOptions, gen: u64 },
    /// Invalidate all tile requests belonging to older view generations.
    CancelTiles { gen: u64 },
    Shutdown,
}

#[derive(Clone, Debug)]
pub enum Response {
    Opened {
        path: PathBuf,
        info: SlideInfo,
        thumb: RgbImage,
        gen: u64,
    },
    TileReady { key: TileKey, img: RgbImage, gen: u64 },
    TileFailed { key: TileKey, err: String, gen: u64 },
    Export(ExportEvent),
    Error(String),
}

/// Shared cancellation flag for an in-flight export.
pub type CancelFlag = Arc<AtomicBool>;

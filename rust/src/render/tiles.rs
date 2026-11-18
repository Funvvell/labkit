//! Tile selection for the current viewport, ported from
//! `canvas.py::_get_best_level` / `_render_visible_tiles`.

use std::num::NonZeroUsize;

use egui::TextureHandle;
use lru::LruCache;

pub use crate::decode::messages::TileKey;

use crate::constants::{MAX_TILE_CACHE, PRELOAD_MARGIN, TILE_SIZE};
use crate::render::viewport::Viewport;
use crate::sdpc::SlideInfo;

/// Returns the chosen pyramid level and the list of 1024px tiles covering the
/// visible (plus 30% preload) rectangle.
pub fn visible_tiles(
    info: &SlideInfo,
    vp: &Viewport,
    view_w: f64,
    view_h: f64,
) -> (u32, Vec<TileKey>) {
    let Some(level_info) = info.levels.get(info.best_level(vp.scale) as usize) else {
        return (0, Vec::new());
    };
    let s = level_info.downsample.max(1e-9);
    let (x0, y0, vw, vh) = vp.visible_rect(view_w, view_h, PRELOAD_MARGIN);

    let lx0 = (x0 / s).floor().max(0.0) as u32;
    let ly0 = (y0 / s).floor().max(0.0) as u32;
    let lx1 = ((x0 + vw) / s).ceil() as u32 + 1;
    let ly1 = ((y0 + vh) / s).ceil() as u32 + 1;
    let lx1 = lx1.min(level_info.width);
    let ly1 = ly1.min(level_info.height);
    if lx1 <= lx0 || ly1 <= ly0 {
        return (level_info.level, Vec::new());
    }

    let mut tiles = Vec::new();
    let mut ty = ly0;
    while ty < ly1 {
        let mut tx = lx0;
        let th = TILE_SIZE.min(ly1 - ty);
        while tx < lx1 {
            let tw = TILE_SIZE.min(lx1 - tx);
            tiles.push(TileKey {
                level: level_info.level,
                x: tx,
                y: ty,
                w: tw,
                h: th,
            });
            tx += tw;
        }
        ty += th;
    }
    (level_info.level, tiles)
}

/// GPU texture LRU. Dropping a `TextureHandle` releases the texture.
pub struct TileCache {
    map: LruCache<TileKey, TextureHandle>,
}

impl TileCache {
    pub fn new() -> Self {
        Self {
            map: LruCache::new(NonZeroUsize::new(MAX_TILE_CACHE).unwrap()),
        }
    }

    pub fn get(&mut self, key: &TileKey) -> Option<TextureHandle> {
        self.map.get(key).cloned()
    }

    pub fn insert(&mut self, key: TileKey, tex: TextureHandle) {
        self.map.put(key, tex);
    }

    pub fn retain_level(&mut self, level: u32) {
        let stale: Vec<TileKey> = self
            .map
            .iter()
            .map(|(k, _)| *k)
            .filter(|k| k.level != level)
            .collect();
        for k in stale {
            self.map.pop(&k);
        }
    }

    pub fn clear(&mut self) {
        self.map.clear();
    }

    pub fn len(&self) -> usize {
        self.map.len()
    }
}

impl Default for TileCache {
    fn default() -> Self {
        Self::new()
    }
}

//! ROI model, ported from `liver_portal_crop/roi.py`.
//!
//! `x/y/w/h` are always **level-0 full-resolution** coordinates and denote the
//! axis-aligned bounding box (matching Qt's `mapRectToScene` write-back).
//! `angle` is metadata for the visual rotation and is ignored by the exporter.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::constants::ROI_ID_LENGTH;
use crate::geometry::Rect;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Roi {
    pub id: String,
    pub slide_path: PathBuf,
    pub x: i64,
    pub y: i64,
    pub w: i64,
    pub h: i64,
    #[serde(default)]
    pub angle: f64,
    #[serde(default)]
    pub created_at: String,
}

impl Roi {
    pub fn new(slide_path: &Path, x: i64, y: i64, w: i64, h: i64, angle: f64) -> Self {
        let mut bytes = [0u8; ROI_ID_LENGTH / 2];
        if getrandom::getrandom(&mut bytes).is_err() {
            // Fallback keeps ids unique enough for a single session.
            let t = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or(0);
            bytes.copy_from_slice(&t.to_le_bytes()[..ROI_ID_LENGTH / 2]);
        }
        let id: String = bytes.iter().map(|b| format!("{b:02x}")).collect();
        let created_at = chrono::Local::now().format("%Y-%m-%dT%H:%M:%S%.6f").to_string();
        Self {
            id,
            slide_path: slide_path.to_path_buf(),
            x,
            y,
            w,
            h,
            angle,
            created_at,
        }
    }

    pub fn rect(&self) -> Rect {
        Rect::new(self.x, self.y, self.w, self.h)
    }

    pub fn set_rect(&mut self, r: Rect) {
        self.x = r.x;
        self.y = r.y;
        self.w = r.w;
        self.h = r.h;
    }
}

#[derive(Default, Clone)]
pub struct RoiStore {
    map: HashMap<String, Roi>,
}

impl RoiStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn len(&self) -> usize {
        self.map.len()
    }

    pub fn is_empty(&self) -> bool {
        self.map.is_empty()
    }

    pub fn get(&self, id: &str) -> Option<&Roi> {
        self.map.get(id)
    }

    pub fn add(&mut self, roi: Roi) {
        self.map.insert(roi.id.clone(), roi);
    }

    pub fn remove(&mut self, id: &str) -> Option<Roi> {
        self.map.remove(id)
    }

    pub fn replace(&mut self, roi: Roi) {
        self.map.insert(roi.id.clone(), roi);
    }

    pub fn clear_slide(&mut self, slide_path: &Path) {
        self.map.retain(|_, r| r.slide_path != slide_path);
    }

    pub fn clear(&mut self) {
        self.map.clear();
    }

    /// Stable sort by `(x, y, id)`, shared by the list, navigation and export.
    pub fn sorted_slide_rois(&self, slide_path: &Path) -> Vec<Roi> {
        let mut v: Vec<Roi> = self
            .map
            .values()
            .filter(|r| r.slide_path == slide_path)
            .cloned()
            .collect();
        v.sort_by(|a, b| (a.x, a.y, &a.id).cmp(&(b.x, b.y, &b.id)));
        v
    }

    pub fn all(&self) -> Vec<Roi> {
        self.map.values().cloned().collect()
    }

    pub fn to_json(&self) -> serde_json::Value {
        let mut v: Vec<&Roi> = self.map.values().collect();
        v.sort_by(|a, b| a.id.cmp(&b.id));
        serde_json::json!({ "rois": v })
    }
}

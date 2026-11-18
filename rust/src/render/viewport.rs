//! Viewport transform. `scale` = screen pixels per level-0 pixel, matching
//! Qt's `QGraphicsView.transform().m11()`.

use crate::constants::WHEEL_FACTOR;

#[derive(Clone, Debug)]
pub struct Viewport {
    pub scale: f64,
    pub offset_x: f64,
    pub offset_y: f64,
}

impl Viewport {
    pub fn new() -> Self {
        Self {
            scale: 1.0,
            offset_x: 0.0,
            offset_y: 0.0,
        }
    }

    pub fn screen_to_level0(&self, px: f64, py: f64) -> (f64, f64) {
        (px / self.scale + self.offset_x, py / self.scale + self.offset_y)
    }

    pub fn level0_to_screen(&self, x: f64, y: f64) -> (f64, f64) {
        ((x - self.offset_x) * self.scale, (y - self.offset_y) * self.scale)
    }

    /// Zoom about the mouse position (1.15x per wheel notch).
    pub fn zoom_at(&mut self, mouse_x: f64, mouse_y: f64, zoom_in: bool, min_scale: f64) {
        let (lx, ly) = self.screen_to_level0(mouse_x, mouse_y);
        let factor = if zoom_in { WHEEL_FACTOR } else { 1.0 / WHEEL_FACTOR };
        self.scale = (self.scale * factor).max(min_scale).min(4.0);
        self.offset_x = lx - mouse_x / self.scale;
        self.offset_y = ly - mouse_y / self.scale;
    }

    pub fn pan(&mut self, dx_screen: f64, dy_screen: f64) {
        self.offset_x -= dx_screen / self.scale;
        self.offset_y -= dy_screen / self.scale;
    }

    pub fn fit(&mut self, view_w: f64, view_h: f64, full_w: f64, full_h: f64) {
        if view_w <= 0.0 || view_h <= 0.0 || full_w <= 0.0 || full_h <= 0.0 {
            return;
        }
        self.scale = (view_w / full_w).min(view_h / full_h) * 0.98;
        self.offset_x = (full_w - view_w / self.scale) / 2.0;
        self.offset_y = (full_h - view_h / self.scale) / 2.0;
    }

    /// Centre a level-0 point in the viewport.
    pub fn center_on(&mut self, view_w: f64, view_h: f64, x: f64, y: f64) {
        self.offset_x = x - view_w / (2.0 * self.scale);
        self.offset_y = y - view_h / (2.0 * self.scale);
    }

    /// Visible level-0 rect expanded by `margin` (e.g. 0.30).
    pub fn visible_rect(&self, view_w: f64, view_h: f64, margin: f64) -> (f64, f64, f64, f64) {
        let mx = view_w * margin;
        let my = view_h * margin;
        let (x0, y0) = self.screen_to_level0(-mx, -my);
        let (x1, y1) = self.screen_to_level0(view_w + mx, view_h + my);
        (x0, y0, (x1 - x0).max(0.0), (y1 - y0).max(0.0))
    }
}

impl Default for Viewport {
    fn default() -> Self {
        Self::new()
    }
}

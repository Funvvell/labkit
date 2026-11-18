//! Central WSI canvas: tiled pyramid rendering, ROI overlay and all pointer /
//! keyboard interaction. Scene coordinates are level-0 full-resolution pixels.

use std::time::Duration;

use egui::{Color32, Pos2, Rect, Sense, Stroke, Ui};

use crate::constants::{MAX_TILES_PER_CYCLE, MIN_ROI_SIZE, RENDER_DEBOUNCE_MS};
use crate::model::{Roi, RoiCommand};
use crate::render::{visible_tiles, TileKey};
use crate::ui::app::AppState;
use crate::ui::theme::{self, Tokens};

#[derive(Clone, Debug)]
pub enum Interaction {
    None,
    Pan,
    Move {
        ids: Vec<String>,
        start: (f64, f64),
        originals: Vec<Roi>,
    },
    Resize {
        id: String,
        handle: usize,
        original: Roi,
    },
    Rotate {
        id: String,
        center: (f64, f64),
        original: Roi,
    },
}

impl Default for Interaction {
    fn default() -> Self {
        Self::None
    }
}

const HANDLE_NORM: [(f64, f64); 8] = [
    (0.0, 0.0),
    (0.5, 0.0),
    (1.0, 0.0),
    (0.0, 0.5),
    (1.0, 0.5),
    (0.0, 1.0),
    (0.5, 1.0),
    (1.0, 1.0),
];

pub fn show(ui: &mut Ui, app: &mut AppState, rect: Rect) {
    let t = theme::tokens(app.dark);
    let painter = ui.painter().clone();
    painter.rect_filled(rect, egui::CornerRadius::ZERO, t.viewer_bg);
    app.frame_rect = Some(rect);

    if app.fit_pending {
        if let Some(info) = &app.info {
            app.vp.fit(
                rect.width() as f64,
                rect.height() as f64,
                info.full_w as f64,
                info.full_h as f64,
            );
        }
        app.fit_pending = false;
        app.on_view_changed();
    }

    // 1. Full-slide thumbnail underneath everything.
    if let (Some(tex), Some(info)) = (&app.thumb, &app.info) {
        let (sx, sy) = app.vp.level0_to_screen(0.0, 0.0);
        let r = Rect::from_min_size(
            Pos2::new(rect.min.x + sx as f32, rect.min.y + sy as f32),
            egui::vec2(
                (info.full_w as f64 * app.vp.scale) as f32,
                (info.full_h as f64 * app.vp.scale) as f32,
            ),
        );
        painter.image(tex.id(), r, uv(), Color32::WHITE);
    }

    // 2. Cached high-resolution tiles, then request missing ones.
    if let Some(info) = app.info.clone() {
        let (_level, keys) = visible_tiles(&info, &app.vp, rect.width() as f64, rect.height() as f64);
        let mut missing = Vec::new();
        for key in keys {
            if let Some(tex) = app.tiles.get(&key) {
                draw_tile(&painter, &tex, app, rect, key, &info);
            } else {
                missing.push(key);
            }
        }
        if app.last_change.elapsed() >= Duration::from_millis(RENDER_DEBOUNCE_MS) {
            let path = app.current.clone().unwrap_or_default();
            for key in missing.into_iter().take(MAX_TILES_PER_CYCLE) {
                if app.inflight.insert(key) {
                    app.decode.request_tile(path.clone(), key, app.gen);
                }
            }
        }
    }

    // 3. ROI overlay.
    let rois = app
        .current
        .as_ref()
        .map(|p| app.store.sorted_slide_rois(p))
        .unwrap_or_default();
    for r in &rois {
        draw_roi(&painter, app, rect, r, &t);
    }

    // 4. Floating frame following the mouse in ROI mode.
    if app.roi_mode {
        let (mx, my) = app.mouse_l0;
        let frame = Roi {
            id: String::new(),
            slide_path: app.current.clone().unwrap_or_default(),
            x: (mx - app.frame_w as f64 / 2.0) as i64,
            y: (my - app.frame_h as f64 / 2.0) as i64,
            w: app.frame_w,
            h: app.frame_h,
            angle: app.angle,
            created_at: String::new(),
        };
        draw_rotated_outline(&painter, app, rect, &frame, t.accent, 2.0);
    }

    // 5. Interaction.
    let response = ui.allocate_rect(rect, Sense::click_and_drag());
    if let Some(p) = response.hover_pos() {
        let (lx, ly) = app
            .vp
            .screen_to_level0((p.x - rect.min.x) as f64, (p.y - rect.min.y) as f64);
        app.mouse_l0 = (lx, ly);
    }

    let scroll = ui.input(|i| i.raw_scroll_delta.y);
    if scroll != 0.0 {
        if let Some(p) = response.hover_pos() {
            let min_scale = app
                .info
                .as_ref()
                .map(|info| {
                    (rect.width() as f64 / info.full_w as f64)
                        .min(rect.height() as f64 / info.full_h as f64)
                        * 0.4
                })
                .unwrap_or(1e-6);
            app.vp.zoom_at(
                (p.x - rect.min.x) as f64,
                (p.y - rect.min.y) as f64,
                scroll > 0.0,
                min_scale,
            );
            app.on_view_changed();
        }
    }

    if response.drag_started() {
        let p = response.interact_pointer_pos().unwrap_or(rect.min);
        let local = ((p.x - rect.min.x) as f64, (p.y - rect.min.y) as f64);
        let ctrl = ui.input(|i| i.modifiers.ctrl);
        begin_interaction(app, &rois, rect, local, ctrl);
    }

    if response.dragged() {
        let p = response.interact_pointer_pos().unwrap_or(rect.min);
        let local = ((p.x - rect.min.x) as f64, (p.y - rect.min.y) as f64);
        update_interaction(app, rect, local, response.drag_delta());
    }

    if response.drag_stopped() {
        finish_interaction(app);
    }

    if response.clicked() && matches!(app.interaction, Interaction::None) {
        let p = response.interact_pointer_pos().unwrap_or(rect.min);
        let local = ((p.x - rect.min.x) as f64, (p.y - rect.min.y) as f64);
        if hit_roi(app, &rois, rect, local).is_none() && !ui.input(|i| i.modifiers.ctrl) {
            app.selected.clear();
        }
    }
}

fn uv() -> Rect {
    Rect::from_min_size(Pos2::ZERO, egui::vec2(1.0, 1.0))
}

fn draw_tile(
    painter: &egui::Painter,
    tex: &egui::TextureHandle,
    app: &AppState,
    canvas: Rect,
    key: TileKey,
    info: &crate::sdpc::SlideInfo,
) {
    let s = info
        .levels
        .get(key.level as usize)
        .map(|l| l.downsample)
        .unwrap_or(1.0);
    let (sx, sy) = app.vp.level0_to_screen(key.x as f64 * s, key.y as f64 * s);
    let r = Rect::from_min_size(
        Pos2::new(canvas.min.x + sx as f32, canvas.min.y + sy as f32),
        egui::vec2(
            (key.w as f64 * s * app.vp.scale) as f32,
            (key.h as f64 * s * app.vp.scale) as f32,
        ),
    );
    painter.image(tex.id(), r, uv(), Color32::WHITE);
}

fn screen_corners(app: &AppState, canvas: Rect, r: &Roi) -> [Pos2; 4] {
    let (cx, cy) = (r.x as f64 + r.w as f64 / 2.0, r.y as f64 + r.h as f64 / 2.0);
    let a = r.angle.to_radians();
    let (c, s) = (a.cos(), a.sin());
    let hw = r.w as f64 / 2.0;
    let hh = r.h as f64 / 2.0;
    let local = [(-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh)];
    let mut out = [Pos2::ZERO; 4];
    for (i, (lx, ly)) in local.iter().enumerate() {
        let x = cx + lx * c - ly * s;
        let y = cy + lx * s + ly * c;
        let (sx, sy) = app.vp.level0_to_screen(x, y);
        out[i] = Pos2::new(canvas.min.x + sx as f32, canvas.min.y + sy as f32);
    }
    out
}

fn draw_rotated_outline(painter: &egui::Painter, app: &AppState, canvas: Rect, r: &Roi, colour: Color32, width: f32) {
    let pts = screen_corners(app, canvas, r);
    let stroke = Stroke::new(width, colour);
    for i in 0..4 {
        painter.line_segment([pts[i], pts[(i + 1) % 4]], stroke);
    }
}

fn draw_roi(painter: &egui::Painter, app: &AppState, canvas: Rect, r: &Roi, t: &Tokens) {
    let selected = app.selected.contains(&r.id);
    // Distinct selected state: brand outline + tinted fill + thick stroke.
    let colour = t.accent;
    let width = if selected { 3.5 } else { 1.8 };
    // Soft fill on the axis-aligned bounding box (export always uses this box).
    let (sx, sy) = app.vp.level0_to_screen(r.x as f64, r.y as f64);
    let bbox = Rect::from_min_size(
        Pos2::new(canvas.min.x + sx as f32, canvas.min.y + sy as f32),
        egui::vec2(
            (r.w as f64 * app.vp.scale) as f32,
            (r.h as f64 * app.vp.scale) as f32,
        ),
    );
    painter.rect_filled(
        bbox,
        egui::CornerRadius::ZERO,
        Color32::from_rgba_unmultiplied(
            colour.r(),
            colour.g(),
            colour.b(),
            if selected { 52 } else { 26 },
        ),
    );
    draw_rotated_outline(painter, app, canvas, r, colour, width);

    if !selected {
        return;
    }
    for (nx, ny) in HANDLE_NORM {
        let p = Pos2::new(
            bbox.min.x + (nx * bbox.width() as f64) as f32,
            bbox.min.y + (ny * bbox.height() as f64) as f32,
        );
        painter.circle_filled(p, 4.5, Color32::WHITE);
        painter.circle_stroke(p, 4.5, Stroke::new(1.5, colour));
    }
    // Rotation handle above the top edge.
    let rot = Pos2::new(bbox.center().x, bbox.min.y - 18.0);
    painter.line_segment([Pos2::new(bbox.center().x, bbox.min.y), rot], Stroke::new(1.5, colour));
    painter.circle_filled(rot, 5.0, t.text_2);
}

fn hit_handle(app: &AppState, rois: &[Roi], _canvas: Rect, local: (f64, f64)) -> Option<(String, usize)> {
    for r in rois.iter().rev().filter(|r| app.selected.contains(&r.id)) {
        let (sx, sy) = app.vp.level0_to_screen(r.x as f64, r.y as f64);
        let w = r.w as f64 * app.vp.scale;
        let h = r.h as f64 * app.vp.scale;
        for (i, (nx, ny)) in HANDLE_NORM.iter().enumerate() {
            let px = sx + nx * w;
            let py = sy + ny * h;
            if (local.0 - px).hypot(local.1 - py) < 9.0 {
                return Some((r.id.clone(), i));
            }
        }
    }
    None
}

fn hit_rotate(app: &AppState, rois: &[Roi], canvas: Rect, local: (f64, f64)) -> Option<(String, (f64, f64))> {
    let _ = canvas;
    for r in rois.iter().rev().filter(|r| app.selected.contains(&r.id)) {
        let (sx, sy) = app.vp.level0_to_screen(r.x as f64, r.y as f64);
        let hx = sx + r.w as f64 * app.vp.scale / 2.0;
        let hy = sy - 18.0;
        if (local.0 - hx).hypot(local.1 - hy) < 10.0 {
            return Some((
                r.id.clone(),
                (r.x as f64 + r.w as f64 / 2.0, r.y as f64 + r.h as f64 / 2.0),
            ));
        }
    }
    None
}

fn hit_roi(app: &AppState, rois: &[Roi], canvas: Rect, local: (f64, f64)) -> Option<Roi> {
    let _ = canvas;
    let (lx, ly) = app.vp.screen_to_level0(local.0, local.1);
    for r in rois.iter().rev() {
        let cx = r.x as f64 + r.w as f64 / 2.0;
        let cy = r.y as f64 + r.h as f64 / 2.0;
        let a = -r.angle.to_radians();
        let (c, s) = (a.cos(), a.sin());
        let dx = lx - cx;
        let dy = ly - cy;
        let rx = dx * c - dy * s;
        let ry = dx * s + dy * c;
        if rx.abs() <= r.w as f64 / 2.0 && ry.abs() <= r.h as f64 / 2.0 {
            return Some(r.clone());
        }
    }
    None
}

fn begin_interaction(app: &mut AppState, rois: &[Roi], canvas: Rect, local: (f64, f64), ctrl: bool) {
    if let Some((id, handle)) = hit_handle(app, rois, canvas, local) {
        if let Some(r) = app.store.get(&id).cloned() {
            app.interaction = Interaction::Resize { id, handle, original: r };
            return;
        }
    }
    if let Some((id, center)) = hit_rotate(app, rois, canvas, local) {
        if let Some(original) = app.store.get(&id).cloned() {
            app.interaction = Interaction::Rotate { id, center, original };
            return;
        }
    }
    if let Some(r) = hit_roi(app, rois, canvas, local) {
        if ctrl {
            app.selected.insert(r.id.clone());
        } else if !app.selected.contains(&r.id) {
            app.selected.clear();
            app.selected.insert(r.id.clone());
        }
        let ids: Vec<String> = app.selected.iter().cloned().collect();
        let originals: Vec<Roi> = ids
            .iter()
            .filter_map(|id| app.store.get(id).cloned())
            .collect();
        app.interaction = Interaction::Move { ids, start: local, originals };
        return;
    }
    app.interaction = Interaction::Pan;
}

fn update_interaction(app: &mut AppState, canvas: Rect, local: (f64, f64), delta: egui::Vec2) {
    let scale = app.vp.scale;
    match app.interaction.clone() {
        Interaction::Pan => {
            app.vp.pan(delta.x as f64, delta.y as f64);
            app.on_view_changed();
        }
        Interaction::Move { ids, start, originals } => {
            let dx = (local.0 - start.0) / scale;
            let dy = (local.1 - start.1) / scale;
            for (_id, orig) in ids.iter().zip(originals.iter()) {
                let mut r = orig.clone();
                r.x = orig.x + dx as i64;
                r.y = orig.y + dy as i64;
                app.store.replace(r);
            }
        }
        Interaction::Resize { id: _, handle, original } => {
            let sx = (local.0 - app.vp.level0_to_screen(original.x as f64, original.y as f64).0) / scale;
            let sy = (local.1 - app.vp.level0_to_screen(original.x as f64, original.y as f64).1) / scale;
            let mut r = original.clone();
            let left = handle == 0 || handle == 3 || handle == 5;
            let right = handle == 2 || handle == 4 || handle == 7;
            let top = handle == 0 || handle == 1 || handle == 2;
            let bottom = handle == 5 || handle == 6 || handle == 7;
            if left {
                let nx = original.x + sx as i64;
                r.w = (original.w - (nx - original.x)).max(MIN_ROI_SIZE);
                r.x = original.x + original.w - r.w;
            } else if right {
                r.w = (sx as i64).max(MIN_ROI_SIZE);
            }
            if top {
                let ny = original.y + sy as i64;
                r.h = (original.h - (ny - original.y)).max(MIN_ROI_SIZE);
                r.y = original.y + original.h - r.h;
            } else if bottom {
                r.h = (sy as i64).max(MIN_ROI_SIZE);
            }
            app.store.replace(r);
        }
        Interaction::Rotate { id, center, .. } => {
            let (lx, ly) = app.vp.screen_to_level0(local.0, local.1);
            let a = (ly - center.1).atan2(lx - center.0).to_degrees() + 90.0;
            let a = a.rem_euclid(360.0);
            if let Some(r) = app.store.get(&id).cloned() {
                let mut r = r;
                r.angle = (a * 100.0).round() / 100.0;
                app.store.replace(r);
            }
        }
        Interaction::None => {}
    }
    let _ = canvas;
}

fn finish_interaction(app: &mut AppState) {
    let cmd = match app.interaction.clone() {
        Interaction::Move { originals, .. } => {
            let mut old = Vec::new();
            let mut new = Vec::new();
            for orig in &originals {
                if let Some(cur) = app.store.get(&orig.id).cloned() {
                    if cur != *orig {
                        old.push(orig.clone());
                        new.push(cur);
                    }
                }
            }
            (!old.is_empty()).then_some(RoiCommand::BatchUpdate { old, new })
        }
        Interaction::Resize { id, original, .. } | Interaction::Rotate { id, original, .. } => {
            app.store.get(&id).cloned().and_then(|cur| {
                (cur != original).then_some(RoiCommand::Update { old: original, new: cur })
            })
        }
        _ => None,
    };
    if let Some(c) = cmd {
        app.undo.push(c);
        app.after_change();
    }
    app.interaction = Interaction::None;
}

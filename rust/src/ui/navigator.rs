//! Navigation thumbnail with the brand-tinted viewport rectangle.

use egui::{Color32, Pos2, Rect, Sense, Stroke, Ui};

use crate::ui::app::AppState;
use crate::ui::theme;

pub fn show(ui: &mut Ui, app: &mut AppState, rect: Rect) {
    let t = theme::tokens(app.dark);
    let painter = ui.painter();
    painter.rect_filled(rect, egui::CornerRadius::same(8), t.viewer_bg);

    if let (Some(tex), Some(info)) = (&app.thumb, &app.info) {
        // Fit the thumbnail image inside the navigation rect.
        let k = (rect.width() / tex.size()[0] as f32).min(rect.height() / tex.size()[1] as f32);
        let w = tex.size()[0] as f32 * k;
        let h = tex.size()[1] as f32 * k;
        let img_rect = Rect::from_min_size(
            Pos2::new(rect.center().x - w / 2.0, rect.center().y - h / 2.0),
            egui::vec2(w, h),
        );
        painter.image(
            tex.id(),
            img_rect,
            Rect::from_min_size(Pos2::ZERO, egui::vec2(1.0, 1.0)),
            Color32::WHITE,
        );

        // Current viewport in level-0 coordinates -> thumbnail space.
        let (vx, vy) = app.vp.screen_to_level0(0.0, 0.0);
        let canvas = app.frame_rect.unwrap_or(rect);
        let (vw, vh) = app
            .vp
            .screen_to_level0(canvas.width() as f64, canvas.height() as f64);
        let sx = w as f64 / info.full_w as f64;
        let sy = h as f64 / info.full_h as f64;
        let frame = Rect::from_min_size(
            Pos2::new(
                img_rect.min.x + (vx * sx) as f32,
                img_rect.min.y + (vy * sy) as f32,
            ),
            egui::vec2(((vw - vx) * sx) as f32, ((vh - vy) * sy) as f32),
        );
        painter.rect_stroke(
            frame,
            egui::CornerRadius::ZERO,
            Stroke::new(2.0, t.nav_frame),
            egui::StrokeKind::Middle,
        );
        painter.rect_filled(frame, egui::CornerRadius::ZERO, t.nav_frame_soft);

        let response = ui.interact(rect, egui::Id::new("nav_click"), Sense::click());
        if response.clicked() {
            if let Some(p) = response.interact_pointer_pos() {
                let lx = (p.x - img_rect.min.x) as f64 / sx;
                let ly = (p.y - img_rect.min.y) as f64 / sy;
                app.vp.center_on(canvas.width() as f64, canvas.height() as f64, lx, ly);
                app.on_view_changed();
            }
        }
    } else {
        painter.text(
            rect.center(),
            egui::Align2::CENTER_CENTER,
            "暂无导航图",
            egui::FontId::proportional(12.0),
            t.muted,
        );
    }
}

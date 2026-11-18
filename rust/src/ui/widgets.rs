//! Shared UI primitives, restyled to yetone/magpie: hairline dividers,
//! graphite pills, 12px panel cards, 40px rows and quiet 0.24s fades.

use std::time::Instant;

use egui::{
    Align2, Area, Color32, CornerRadius, Frame, Id, Pos2, Response, RichText, Stroke, Ui,
};
use crate::ui::theme::Tokens;

#[derive(Clone)]
pub struct Toast {
    pub msg: String,
    pub at: Instant,
    pub error: bool,
}

/// Small card: 6px control radius, hairline, near shadow.
pub fn card_frame(t: &Tokens) -> Frame {
    Frame::NONE
        .fill(t.surface)
        .corner_radius(CornerRadius::same(t.radius_control as u8))
        .stroke(Stroke::new(0.5, t.line_weak))
        .inner_margin(t.space as i8 + 2)
        .shadow(quiet_shadow(t))
}

/// Larger panel: 12px radius, hairline, full soft shadow.
pub fn panel_card(t: &Tokens) -> Frame {
    Frame::NONE
        .fill(t.panel)
        .corner_radius(CornerRadius::same(t.radius_panel as u8))
        .stroke(Stroke::new(0.5, t.line))
        .inner_margin(12.0)
        .shadow(egui::epaint::Shadow {
            offset: [0, 16],
            blur: t.shadow_blur,
            spread: 0,
            color: t.shadow_color,
        })
}

fn quiet_shadow(t: &Tokens) -> egui::epaint::Shadow {
    egui::epaint::Shadow {
        offset: [0, 2],
        blur: t.shadow_blur_near,
        spread: 0,
        color: t.shadow_color,
    }
}

pub fn hairline(ui: &mut Ui, t: &Tokens) {
    let rect = ui.available_rect_before_wrap();
    let y = rect.min.y + 0.5;
    ui.painter().line_segment(
        [Pos2::new(rect.min.x, y), Pos2::new(rect.max.x, y)],
        Stroke::new(0.5, t.line),
    );
    ui.add_space(1.0);
}

/// 0.5px vertical divider for toolbars.
pub fn vline(ui: &mut Ui, t: &Tokens) {
    let rect = ui.available_rect_before_wrap();
    let x = rect.min.x + 0.5;
    ui.painter().line_segment(
        [Pos2::new(x, rect.min.y), Pos2::new(x, rect.max.y)],
        Stroke::new(0.5, t.line),
    );
    ui.add_space(1.0);
}

pub fn section_title(ui: &mut Ui, t: &Tokens, text: &str) {
    ui.label(
        RichText::new(text)
            .size(t.font_sub)
            .strong()
            .color(t.text_2),
    );
    ui.add_space(t.space_tight);
}

pub fn chip(ui: &mut Ui, t: &Tokens, text: &str, accent: bool) {
    let (fill, fg) = if accent {
        (t.accent_soft, t.accent)
    } else {
        (t.pill, t.muted)
    };
    Frame::NONE
        .fill(fill)
        .corner_radius(CornerRadius::same(t.radius_pill as u8))
        .inner_margin(egui::vec2(8.0, 2.0))
        .show(ui, |ui| {
            ui.label(RichText::new(text).size(t.font_pill).strong().color(fg));
        });
}

/// Pill button: no border, quiet fill; primary variant uses solid brand color.
pub fn pill_button(
    ui: &mut Ui,
    t: &Tokens,
    label: &str,
    icon: Option<&str>,
    primary: bool,
) -> Response {
    let (fill, fg) = if primary {
        (t.accent, t.accent_fg)
    } else {
        (t.pill, t.ctl_fg)
    };
    let text = match icon {
        Some(i) => format!("{i}  {label}"),
        None => label.to_string(),
    };
    ui.add(
        egui::Button::new(RichText::new(text).size(t.font_pill).color(fg))
            .fill(fill)
            .corner_radius(CornerRadius::same(t.radius_pill as u8)),
    )
}

/// Segmented control; returns true when the selection changed.
pub fn segmented<T: PartialEq + Copy>(
    ui: &mut Ui,
    t: &Tokens,
    current: &mut T,
    options: &[(T, &'static str)],
) -> bool {
    let mut changed = false;
    Frame::NONE
        .fill(t.seg_track)
        .corner_radius(CornerRadius::same(8))
        .inner_margin(2)
        .show(ui, |ui| {
            ui.horizontal(|ui| {
                for (value, label) in options {
                    let selected = *current == *value;
                    let fill = if selected { t.panel } else { Color32::TRANSPARENT };
                    let text = if selected {
                        RichText::new(*label).strong()
                    } else {
                        RichText::new(*label)
                    };
                    // A real Button response is required: `Frame::show` only
                    // allocates the rect with `Sense::hover()`, so its response
                    // never reports clicks.
                    let resp = ui.add(
                        egui::Button::new(
                            text.size(t.font_body)
                                .color(if selected { t.text } else { t.muted }),
                        )
                        .frame(false)
                        .fill(fill)
                        .corner_radius(CornerRadius::same(t.radius_control as u8)),
                    );
                    if resp.clicked() {
                        *current = *value;
                        changed = true;
                    }
                }
            });
        });
    changed
}

/// One 40px list row; selected rows get the brand-tinted background.
///
/// The returned `Response` comes from a real `Sense::click()` interaction.
/// (`Frame::show` only allocates with `Sense::hover()`, so its response can
/// never report clicks — using it here silently broke slide selection.)
pub fn subtle_row<F>(ui: &mut Ui, t: &Tokens, id: egui::Id, selected: bool, add_contents: F) -> Response
where
    F: FnOnce(&mut Ui),
{
    let inner = Frame::NONE
        .fill(if selected { t.sel } else { Color32::TRANSPARENT })
        .corner_radius(CornerRadius::same(t.radius_control as u8))
        .inner_margin(egui::vec2(10.0, t.space_tight))
        .stroke(Stroke::new(0.5, if selected { t.accent } else { t.line_weak }))
        .show(ui, |ui| {
            ui.set_min_height(t.row_h - 8.0);
            add_contents(ui);
        });

    // Allocate the row's full rect as a click target *behind* its children.
    ui.interact(inner.response.rect, id, egui::Sense::click_and_drag())
}

pub fn shortcut_bar(ui: &mut Ui, t: &Tokens) {
    ui.horizontal(|ui| {
        ui.label(RichText::new("快捷键").size(t.font_sub).color(t.muted));
        for k in [
            "Space 放置",
            "Del 删除",
            "Ctrl+Z/Y 撤销重做",
            "N/P 导航",
            "F 适配",
            "滚轮缩放",
            "拖拽平移",
        ] {
            Frame::NONE
                .fill(t.pill)
                .corner_radius(CornerRadius::same(t.radius_control as u8))
                .inner_margin(egui::vec2(6.0, 1.0))
                .show(ui, |ui| {
                    ui.label(RichText::new(k).size(t.font_sub).color(t.muted));
                });
        }
    });
}

/// Ease-out cubic, matching magpie's quiet 0.24s fade.
pub fn enter_opacity(at: Instant, duration: f32) -> f32 {
    let p = (at.elapsed().as_secs_f32() / duration.max(0.001)).clamp(0.0, 1.0);
    1.0 - (1.0 - p).powi(3)
}

pub fn show_toast(ctx: &egui::Context, t: &Tokens, toast: &Toast) {
    if toast.at.elapsed().as_secs_f32() > 3.5 {
        return;
    }
    let dot = if toast.error { t.error } else { t.success };
    let opacity = enter_opacity(toast.at, t.anim_in);
    Area::new(Id::new("app_toast"))
        .anchor(Align2::RIGHT_BOTTOM, egui::vec2(-18.0, -18.0))
        .order(egui::Order::Foreground)
        .show(ctx, |ui| {
            ui.set_opacity(opacity);
            Frame::NONE
                .fill(t.pop_bg)
                .corner_radius(CornerRadius::same(t.radius_panel as u8))
                .stroke(Stroke::new(0.5, t.line))
                .inner_margin(egui::vec2(14.0, 9.0))
                .shadow(egui::epaint::Shadow {
                    offset: [0, 16],
                    blur: t.shadow_blur,
                    spread: 0,
                    color: t.shadow_color,
                })
                .show(ui, |ui| {
                    ui.horizontal(|ui| {
                        let origin = ui.max_rect().min + egui::vec2(5.0, 7.0);
                        ui.painter().circle_filled(origin, 4.0, dot);
                        ui.add_space(10.0);
                        ui.label(RichText::new(&toast.msg).size(t.font_body).color(t.text));
                    });
                });
        });
}

pub fn error_window(ctx: &egui::Context, t: &Tokens, msg: &str, slot: &mut Option<String>) {
    let mut open = true;
    egui::Window::new("错误")
        .collapsible(false)
        .resizable(false)
        .anchor(Align2::CENTER_CENTER, egui::vec2(0.0, 0.0))
        .open(&mut open)
        .show(ctx, |ui| {
            ui.label(RichText::new(msg).size(t.font_body).color(t.error));
            ui.add_space(t.space);
            pill_button(ui, t, "知道了", None, true);
        });
    if !open {
        *slot = None;
    }
}

/// Icons used across toolbars (Phosphor regular, 15–16px).
pub mod icons {
    pub use egui_phosphor::regular::{
        ARROW_CLOCKWISE, ARROW_COUNTER_CLOCKWISE, CROP, DOWNLOAD, FOLDER, FOLDER_OPEN, MONITOR,
        MOON, SUN, WARNING,
    };
    pub const SIZE: f32 = 15.0;
}

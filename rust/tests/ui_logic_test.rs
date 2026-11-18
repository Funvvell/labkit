//! Lightweight UI-logic tests + a real egui click regression for `subtle_row`.
//!
//! The magpie rework passed 71 logic tests while two GUI controls were dead:
//! `Frame::show` allocates only `Sense::hover()`, so `Response::clicked()` on
//! it is always false. These tests guard that specific failure mode.

use std::time::{Duration, Instant};

use egui::{Context, Event, FontDefinitions, Id, PointerButton, Pos2, RawInput};

use pathology_crop_rs::ui::qpcr_panel::{fmt, split_names};
use pathology_crop_rs::ui::theme::{self, ThemeMode};
use pathology_crop_rs::ui::widgets::{enter_opacity, subtle_row};

#[test]
fn theme_mode_cycles_and_labels() {
    assert_eq!(ThemeMode::System.next(), ThemeMode::Light);
    assert_eq!(ThemeMode::Light.next(), ThemeMode::Dark);
    assert_eq!(ThemeMode::Dark.next(), ThemeMode::System);
    assert_eq!(ThemeMode::Light.label(), "浅色");
    assert_eq!(ThemeMode::Dark.label(), "深色");
    assert_eq!(ThemeMode::System.label(), "跟随系统");
}

#[test]
fn tokens_match_magpie_source() {
    let light = theme::tokens(false);
    let dark = theme::tokens(true);
    assert_eq!(light.accent, theme::color("#4F46E5"));
    assert_eq!(dark.accent, theme::color("#A5B4FC"));
    assert_eq!(light.viewer_bg, theme::color("#0F0F11"));
    assert_eq!(dark.viewer_bg, theme::color("#0F0F11"));
    assert_eq!(light.side_w, 212.0);
    assert_eq!(light.top_h, 46.0);
    assert_eq!(light.row_h, 40.0);
    assert_eq!(light.font_body, 13.0);
}

#[test]
fn effective_dark_respects_mode_and_system() {
    let ctx = Context::default();
    ctx.set_fonts(FontDefinitions::empty());
    assert!(!theme::effective_dark(&ctx, ThemeMode::Light));
    assert!(theme::effective_dark(&ctx, ThemeMode::Dark));

    // system_theme is the OS value from RawInput, separate from preference.
    let mut input = RawInput::default();
    input.system_theme = Some(egui::Theme::Light);
    let _ = ctx.run(input, |_| {});
    assert!(!theme::effective_dark(&ctx, ThemeMode::System));
    let mut input = RawInput::default();
    input.system_theme = Some(egui::Theme::Dark);
    let _ = ctx.run(input, |_| {});
    assert!(theme::effective_dark(&ctx, ThemeMode::System));
}

#[test]
fn enter_opacity_is_monotonic_and_clamped() {
    let now = Instant::now();
    assert!(enter_opacity(now - Duration::from_millis(240), 0.24) >= 0.999);
    assert!(enter_opacity(now - Duration::from_millis(10), 0.24) < 0.2);
    assert!(enter_opacity(now, 0.24) <= 0.001);
    let a = enter_opacity(now - Duration::from_millis(60), 0.24);
    let b = enter_opacity(now - Duration::from_millis(120), 0.24);
    assert!(b > a);
}

#[test]
fn qpcr_text_helpers() {
    assert_eq!(split_names("a,b；c\nd"), vec!["a", "b", "c", "d"]);
    assert_eq!(fmt(None), "—");
    assert_eq!(fmt(Some(f64::NAN)), "—");
    assert_eq!(fmt(Some(2.5)), "2.500");
}

/// Regression: `subtle_row` must return a Response that actually reports
/// clicks. Replaces the old Frame-based row whose `clicked()` was always false.
#[test]
fn subtle_row_reports_clicks() {
    let ctx = Context::default();
    ctx.set_fonts(FontDefinitions::empty());

    // Frame 1: lay out the row and remember its rect.
    let mut rect = None;
    let _ = ctx.run(RawInput::default(), |ctx| {
        egui::CentralPanel::default().show(ctx, |ui| {
            let t = theme::tokens(false);
            let resp = subtle_row(ui, &t, Id::new("test_row"), false, |ui| {
                ui.label("click me");
            });
            rect = Some(resp.rect);
        });
    });
    let pos: Pos2 = rect.expect("row was not laid out").center();

    // Frame 2: press then release the primary button over the row.
    let mut input = RawInput::default();
    input.events.push(Event::PointerMoved(pos));
    input.events.push(Event::PointerButton {
        pos,
        button: PointerButton::Primary,
        pressed: true,
        modifiers: Default::default(),
    });
    let _ = ctx.run(input, |ctx| {
        egui::CentralPanel::default().show(ctx, |ui| {
            let t = theme::tokens(false);
            subtle_row(ui, &t, Id::new("test_row"), false, |ui| {
                ui.label("click me");
            });
        });
    });

    let mut input = RawInput::default();
    input.events.push(Event::PointerButton {
        pos,
        button: PointerButton::Primary,
        pressed: false,
        modifiers: Default::default(),
    });
    let mut clicked = false;
    let _ = ctx.run(input, |ctx| {
        egui::CentralPanel::default().show(ctx, |ui| {
            let t = theme::tokens(false);
            let resp = subtle_row(ui, &t, Id::new("test_row"), false, |ui| {
                ui.label("click me");
            });
            clicked = resp.clicked();
        });
    });

    assert!(clicked, "subtle_row click was swallowed (Frame hover regression)");
}

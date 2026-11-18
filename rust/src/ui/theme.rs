//! Design tokens adapted from yetone/magpie (`internal/gui/assets/app.css`
//! and `internal/gui/appearance.go`): a quiet macOS-native tool surface,
//! graphite sidebar, hairline dividers, lightweight pills and compact 13px type.
//!
//! The slide viewer keeps a fixed dark background in both themes so ROI
//! outlines stay legible on H&E slides.

use egui::{Color32, Context, CornerRadius, FontId, TextStyle, Visuals};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ThemeMode {
    Light,
    Dark,
    System,
}

impl ThemeMode {
    pub fn next(self) -> Self {
        match self {
            ThemeMode::System => ThemeMode::Light,
            ThemeMode::Light => ThemeMode::Dark,
            ThemeMode::Dark => ThemeMode::System,
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            ThemeMode::Light => "浅色",
            ThemeMode::Dark => "深色",
            ThemeMode::System => "跟随系统",
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Tokens {
    // Surfaces
    pub window: Color32,
    pub panel: Color32,
    pub surface: Color32,
    pub line: Color32,
    pub line_weak: Color32,
    // Text
    pub text: Color32,
    pub text_2: Color32,
    pub ctl_fg: Color32,
    pub muted: Color32,
    pub faint: Color32,
    // Brand & states
    pub accent: Color32,
    pub accent_soft: Color32,
    pub accent_fg: Color32,
    pub sel: Color32,
    pub success: Color32,
    pub success_soft: Color32,
    pub warning: Color32,
    pub error: Color32,
    pub error_soft: Color32,
    pub drift: Color32,
    // Controls
    pub pill: Color32,
    pub pill_hover: Color32,
    pub seg_track: Color32,
    pub pop_bg: Color32,
    // Shadow
    pub shadow_color: Color32,
    pub shadow_blur: u8,
    pub shadow_blur_near: u8,
    // Viewer
    pub viewer_bg: Color32,
    pub nav_frame: Color32,
    pub nav_frame_soft: Color32,
    // Metrics
    pub radius_panel: f32,
    pub radius_control: f32,
    pub radius_pill: f32,
    pub font_body: f32,
    pub font_sub: f32,
    pub font_nav: f32,
    pub font_pill: f32,
    pub side_w: f32,
    pub top_h: f32,
    pub row_h: f32,
    pub space: f32,
    pub space_tight: f32,
    pub anim_in: f32,
    pub anim_color: f32,
}

pub fn color(hex: &str) -> Color32 {
    let h = hex.trim_start_matches('#');
    let parse = |i: usize| u8::from_str_radix(&h[i * 2..i * 2 + 2], 16).unwrap_or(0);
    Color32::from_rgb(parse(0), parse(1), parse(2))
}

fn rgba(hex: &str, alpha: u8) -> Color32 {
    let c = color(hex);
    Color32::from_rgba_unmultiplied(c.r(), c.g(), c.b(), alpha)
}

pub fn tokens(dark: bool) -> Tokens {
    let base = Tokens {
        radius_panel: 12.0,
        radius_control: 6.0,
        radius_pill: 120.0,
        font_body: 13.0,
        font_sub: 11.5,
        font_nav: 13.0,
        font_pill: 11.5,
        side_w: 212.0,
        top_h: 46.0,
        row_h: 40.0,
        space: 8.0,
        space_tight: 4.0,
        anim_in: 0.24,
        anim_color: 0.18,
        viewer_bg: color("#0F0F11"),
        shadow_blur: 44,
        shadow_blur_near: 8,
        ..empty_tokens()
    };

    if dark {
        Tokens {
            window: color("#1A1A1E"),
            panel: color("#232327"),
            surface: color("#1F1F23"),
            line: color("#333339"),
            line_weak: color("#2C2C32"),
            text: color("#EDEDF1"),
            text_2: color("#B9B9C1"),
            ctl_fg: color("#A1A1AA"),
            muted: color("#8B8B94"),
            faint: color("#56565F"),
            accent: color("#A5B4FC"),
            accent_soft: color("#2B2C47"),
            accent_fg: color("#14142A"),
            sel: color("#33345A"),
            success: color("#6FD99B"),
            success_soft: rgba("#6FD99B", 28),
            warning: color("#F2B544"),
            error: color("#F28B82"),
            error_soft: rgba("#F28B82", 28),
            drift: color("#FF9592"),
            pill: color("#2D2D33"),
            pill_hover: color("#36363D"),
            seg_track: rgba("#FFFFFF", 9),
            pop_bg: rgba("#26262B", 245),
            shadow_color: rgba("#000000", 140),
            nav_frame: color("#A5B4FC"),
            nav_frame_soft: rgba("#A5B4FC", 32),
            ..base
        }
    } else {
        Tokens {
            window: color("#F4F4F6"),
            panel: color("#FFFFFF"),
            surface: color("#F9F9FB"),
            line: color("#E3E3E8"),
            line_weak: color("#ECECF0"),
            text: color("#1C1C21"),
            text_2: color("#4B4B53"),
            ctl_fg: color("#63636B"),
            muted: color("#85858D"),
            faint: color("#B9B9C2"),
            accent: color("#4F46E5"),
            accent_soft: color("#EEEDFD"),
            accent_fg: color("#FFFFFF"),
            sel: color("#ECEBFB"),
            success: color("#189A58"),
            success_soft: color("#E4F6EC"),
            warning: color("#B45309"),
            error: color("#D64545"),
            error_soft: color("#FBE9E9"),
            drift: color("#CE2C31"),
            pill: color("#F1F1F4"),
            pill_hover: color("#E9E9EE"),
            seg_track: color("#E6E6EB"),
            pop_bg: rgba("#FFFFFF", 240),
            shadow_color: rgba("#14161E", 41),
            nav_frame: color("#4F46E5"),
            nav_frame_soft: rgba("#4F46E5", 30),
            ..base
        }
    }
}

fn empty_tokens() -> Tokens {
    Tokens {
        window: Color32::WHITE,
        panel: Color32::WHITE,
        surface: Color32::WHITE,
        line: Color32::GRAY,
        line_weak: Color32::GRAY,
        text: Color32::BLACK,
        text_2: Color32::GRAY,
        ctl_fg: Color32::GRAY,
        muted: Color32::GRAY,
        faint: Color32::GRAY,
        accent: Color32::BLUE,
        accent_soft: Color32::WHITE,
        accent_fg: Color32::WHITE,
        sel: Color32::WHITE,
        success: Color32::GREEN,
        success_soft: Color32::WHITE,
        warning: Color32::YELLOW,
        error: Color32::RED,
        error_soft: Color32::WHITE,
        drift: Color32::RED,
        pill: Color32::WHITE,
        pill_hover: Color32::WHITE,
        seg_track: Color32::WHITE,
        pop_bg: Color32::WHITE,
        shadow_color: Color32::TRANSPARENT,
        shadow_blur: 0,
        shadow_blur_near: 0,
        viewer_bg: Color32::BLACK,
        nav_frame: Color32::RED,
        nav_frame_soft: Color32::RED,
        radius_panel: 12.0,
        radius_control: 6.0,
        radius_pill: 120.0,
        font_body: 13.0,
        font_sub: 11.5,
        font_nav: 13.0,
        font_pill: 11.5,
        side_w: 212.0,
        top_h: 46.0,
        row_h: 40.0,
        space: 8.0,
        space_tight: 4.0,
        anim_in: 0.24,
        anim_color: 0.18,
    }
}

/// Current effective dark mode. First frame `system_theme()` may be None.
pub fn effective_dark(ctx: &Context, mode: ThemeMode) -> bool {
    match mode {
        ThemeMode::Light => false,
        ThemeMode::Dark => true,
        ThemeMode::System => ctx
            .system_theme()
            .map(|t| t == egui::Theme::Dark)
            .unwrap_or(false),
    }
}

pub fn apply(ctx: &Context, mode: ThemeMode) {
    // For System, keep egui's preference as System so native widgets follow
    // Windows at runtime; never freeze it to a concrete theme.
    ctx.set_theme(match mode {
        ThemeMode::System => egui::ThemePreference::System,
        ThemeMode::Light => egui::ThemePreference::Light,
        ThemeMode::Dark => egui::ThemePreference::Dark,
    });

    // Write both light and dark styles so a runtime theme switch is instant
    // and never leaves native widgets on the old palette.
    for theme in [egui::Theme::Light, egui::Theme::Dark] {
        let applied_dark = theme == egui::Theme::Dark;
        let t = tokens(applied_dark);
        let mut v = if applied_dark {
            Visuals::dark()
        } else {
            Visuals::light()
        };

        v.override_text_color = Some(t.text);
        v.window_fill = t.window;
        v.panel_fill = t.panel;
        v.extreme_bg_color = t.viewer_bg;
        v.faint_bg_color = t.surface;
        v.hyperlink_color = t.accent;
        v.warn_fg_color = t.warning;
        v.error_fg_color = t.error;

        let ctl = |bg: Color32, fg: Color32, mut w: egui::style::WidgetVisuals| {
            w.bg_fill = bg;
            w.fg_stroke.color = fg;
            w.bg_stroke.color = t.line;
            w
        };
        v.widgets.noninteractive = ctl(t.surface, t.muted, v.widgets.noninteractive);
        v.widgets.inactive = ctl(t.pill, t.ctl_fg, v.widgets.inactive);
        v.widgets.hovered = ctl(t.pill_hover, t.text, v.widgets.hovered);
        v.widgets.active = ctl(t.accent_soft, t.accent, v.widgets.active);
        v.widgets.open = ctl(t.pill_hover, t.text, v.widgets.open);

        let r = CornerRadius::same(t.radius_control as u8);
        v.widgets.noninteractive.corner_radius = r;
        v.widgets.inactive.corner_radius = r;
        v.widgets.hovered.corner_radius = r;
        v.widgets.active.corner_radius = r;
        v.widgets.open.corner_radius = r;
        v.window_corner_radius = CornerRadius::same(t.radius_panel as u8);

        let shadow = |blur: u8| egui::epaint::Shadow {
            offset: [0, if blur > 20 { 16 } else { 2 }],
            blur,
            spread: 0,
            color: t.shadow_color,
        };
        v.window_shadow = shadow(t.shadow_blur);
        v.popup_shadow = shadow(t.shadow_blur);
        ctx.set_visuals_of(theme, v);

        let mut style = (*ctx.style_of(theme)).clone();
        style.animation_time = t.anim_color;
        style.spacing.item_spacing = egui::vec2(t.space, t.space);
        style.spacing.button_padding = egui::vec2(10.0, 5.0);
        style.spacing.window_margin = egui::Margin::same(12);
        // Keep built-in monospace (numbers/tables must stay aligned).
        style
            .text_styles
            .insert(TextStyle::Small, FontId::proportional(t.font_sub));
        style
            .text_styles
            .insert(TextStyle::Body, FontId::proportional(t.font_body));
        style
            .text_styles
            .insert(TextStyle::Button, FontId::proportional(t.font_body));
        style
            .text_styles
            .insert(TextStyle::Heading, FontId::proportional(17.0));
        ctx.set_style_of(theme, style);
    }
}

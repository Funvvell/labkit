//! Single font registration: Phosphor line icons + embedded CJK fallback.
//! Both must land in the same `ctx.set_fonts()` call or one overwrites the other.

use std::sync::Arc;

use egui::{FontData, FontDefinitions, FontFamily};
use egui_phosphor::Variant;

const CJK: &[u8] = include_bytes!("../../assets/fonts/ui-cjk-subset.ttf");

pub fn configure(ctx: &egui::Context) {
    let mut fonts = FontDefinitions::default();

    // Phosphor inserts itself at proportional index 1 (icon + text mixing).
    egui_phosphor::add_to_fonts(&mut fonts, Variant::Regular);

    fonts.font_data.insert(
        "cjk".to_owned(),
        Arc::new(FontData::from_owned(CJK.to_vec())),
    );
    // CJK stays last so icons and ASCII resolve from earlier fonts.
    for family in [FontFamily::Proportional, FontFamily::Monospace] {
        fonts
            .families
            .entry(family)
            .or_default()
            .push("cjk".to_owned());
    }
    ctx.set_fonts(fonts);
}

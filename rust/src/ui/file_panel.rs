//! Left panel: slide list + navigation thumbnail (magpie-style graphite rail).

use egui::{RichText, Ui};

use crate::ui::app::AppState;
use crate::ui::navigator;
use crate::ui::theme;
use crate::ui::widgets::{chip, icons, pill_button, section_title, subtle_row};

pub fn show(ui: &mut Ui, app: &mut AppState) {
    let t = theme::tokens(app.dark);
    section_title(ui, &t, "切片文件");

    ui.horizontal(|ui| {
        if pill_button(ui, &t, "添加", Some(icons::FOLDER_OPEN), false).clicked() {
            app.open_files();
        }
        if pill_button(ui, &t, "移除", None, false).clicked() {
            app.remove_current();
        }
    });
    ui.add_space(t.space);

    let slides = app.slides.clone();
    let current = app.current.clone();
    egui::ScrollArea::vertical()
        .max_height(190.0)
        .auto_shrink([false, true])
        .show(ui, |ui| {
            if slides.is_empty() {
                ui.label(
                    RichText::new("尚未打开切片")
                        .size(t.font_sub)
                        .color(t.muted),
                );
            }
            for path in &slides {
                let name = path
                    .file_name()
                    .map(|s| s.to_string_lossy().into_owned())
                    .unwrap_or_else(|| path.display().to_string());
                let count = app
                    .store
                    .all()
                    .iter()
                    .filter(|r| &r.slide_path == path)
                    .count();
                let selected = current.as_ref() == Some(path);
                let row_id = egui::Id::new(("slide_row", path.display().to_string()));
                let resp = subtle_row(ui, &t, row_id, selected, |ui| {
                    ui.vertical(|ui| {
                        ui.label(
                            RichText::new(&name)
                                .size(t.font_body)
                                .color(if selected { t.accent } else { t.text }),
                        );
                        ui.horizontal(|ui| {
                            chip(ui, &t, &format!("{count} ROI"), selected);
                            if let Some(info) = app.info.as_ref().filter(|_| selected) {
                                ui.label(
                                    RichText::new(format!("{}×{}", info.full_w, info.full_h))
                                        .size(t.font_sub)
                                        .color(t.muted),
                                );
                            }
                        });
                    });
                });
                if resp.clicked() {
                    app.select_slide(path.clone());
                }
            }
        });

    ui.add_space(t.space + 2.0);
    section_title(ui, &t, "导航缩略图");
    let nav_h = (ui.available_height() - 92.0).max(110.0).min(230.0);
    let (nav_rect, _) = ui.allocate_exact_size(
        egui::vec2(ui.available_width(), nav_h),
        egui::Sense::hover(),
    );
    navigator::show(ui, app, nav_rect);

    ui.add_space(t.space);
    ui.horizontal(|ui| {
        if pill_button(ui, &t, "导入旧会话", None, false).clicked() {
            app.import_legacy_session();
        }
    });
    if let Some(info) = &app.info {
        let mpp = info
            .mpp
            .map(|m| format!("{m:.4} µm/px"))
            .unwrap_or_else(|| "未知 MPP".into());
        ui.label(RichText::new(mpp).size(t.font_sub).color(t.muted));
    }
}

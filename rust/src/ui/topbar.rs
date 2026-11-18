//! Top toolbar in yetone/magpie style: quiet grouped pills, segmented mode
//! switch, linear icons and a three-state theme control.

use egui::RichText;

use crate::constants::FIELD_NUMBER_MM;
use crate::ui::app::AppState;
use crate::ui::qpcr_panel::AppMode;
use crate::ui::theme::{self, ThemeMode};
use crate::ui::widgets::{chip, icons, pill_button, segmented, vline};

pub const MAGS: &[(&str, f64)] = &[
    ("4x", 4.0),
    ("10x", 10.0),
    ("20x", 20.0),
    ("40x", 40.0),
    ("80x", 80.0),
    ("自定义", 0.0),
];

pub const RATIOS: &[(&str, f64, f64)] = &[
    ("Free", 0.0, 0.0),
    ("1:1", 0.707_106_78, 0.707_106_78),
    ("4:3", 0.8, 0.6),
    ("3:2", 0.832_05, 0.554_70),
    ("16:9", 0.871_78, 0.490_26),
];

pub fn mag_label(app: &AppState) -> Option<String> {
    MAGS.get(app.mag_idx)
        .filter(|(name, _)| *name != "自定义")
        .map(|(name, _)| name.trim_end_matches('x').to_string())
}

/// Field-of-view / magnification -> ROI frame size in level-0 pixels.
pub fn auto_frame(app: &mut AppState) {
    let Some(info) = app.info.as_ref() else { return };
    let Some(mpp) = info.mpp else { return };
    let Some((_, mag)) = MAGS.get(app.mag_idx) else { return };
    if *mag <= 0.0 {
        return;
    }
    let Some((_, aw, ah)) = RATIOS.get(app.ratio_idx) else { return };
    if *aw <= 0.0 {
        return;
    }
    let fov_mm = FIELD_NUMBER_MM / mag;
    app.frame_w = (fov_mm * aw * 1000.0 / mpp).round() as i64;
    app.frame_h = (fov_mm * ah * 1000.0 / mpp).round() as i64;
}

pub fn show(ui: &mut egui::Ui, app: &mut AppState) {
    let t = theme::tokens(app.dark);
    ui.horizontal_centered(|ui| {
        // Brand
        ui.label(
            RichText::new("病理裁剪")
                .strong()
                .size(t.font_body + 2.0)
                .color(t.text),
        );
        chip(ui, &t, "Rust", true);
        vline(ui, &t);

        // Mode segmented control
        let mut mode = app.mode;
        if segmented(
            ui,
            &t,
            &mut mode,
            &[(AppMode::Crop, "切片裁剪"), (AppMode::Qpcr, "qPCR 分析")],
        ) {
            app.mode = mode;
            app.reset_enter();
        }
        vline(ui, &t);

        // Crop-only controls: file dialogs and ROI export must not appear in
        // qPCR mode (they would pollute slide state / silently export old ROIs).
        if app.mode == AppMode::Crop {
            vline(ui, &t);
            if pill_button(ui, &t, "打开切片", Some(icons::FOLDER_OPEN), false).clicked() {
                app.open_files();
            }
            if pill_button(ui, &t, "输出目录", Some(icons::FOLDER), false).clicked() {
                if let Some(dir) = rfd::FileDialog::new().pick_folder() {
                    app.output_dir = dir;
                    app.push_toast(format!("输出目录: {}", app.output_dir.display()), false);
                }
            }
            vline(ui, &t);
            ui.toggle_value(
                &mut app.roi_mode,
                RichText::new(format!("{} ROI 绘制", icons::CROP)).size(t.font_pill),
            );

            ui.label(RichText::new("倍率").size(t.font_sub).color(t.muted));
            let mag_changed = egui::ComboBox::from_id_salt("mag")
                .width(62.0)
                .selected_text(MAGS.get(app.mag_idx).map(|m| m.0).unwrap_or("20x"))
                .show_ui(ui, |ui| {
                    let mut changed = false;
                    for (i, (name, _)) in MAGS.iter().enumerate() {
                        if ui.selectable_value(&mut app.mag_idx, i, *name).changed() {
                            changed = true;
                        }
                    }
                    changed
                })
                .inner
                .unwrap_or(false);

            ui.label(RichText::new("比例").size(t.font_sub).color(t.muted));
            let ratio_changed = egui::ComboBox::from_id_salt("ratio")
                .width(62.0)
                .selected_text(RATIOS.get(app.ratio_idx).map(|r| r.0).unwrap_or("16:9"))
                .show_ui(ui, |ui| {
                    let mut changed = false;
                    for (i, (name, _, _)) in RATIOS.iter().enumerate() {
                        if ui.selectable_value(&mut app.ratio_idx, i, *name).changed() {
                            changed = true;
                        }
                    }
                    changed
                })
                .inner
                .unwrap_or(false);
            if mag_changed || ratio_changed {
                auto_frame(app);
            }

            ui.label(RichText::new("W").size(t.font_sub).color(t.muted));
            if ui
                .add(
                    egui::DragValue::new(&mut app.frame_w)
                        .range(20..=200_000)
                        .speed(8.0),
                )
                .changed()
            {
                app.mag_idx = MAGS.len() - 1;
            }
            ui.label(RichText::new("H").size(t.font_sub).color(t.muted));
            if ui
                .add(
                    egui::DragValue::new(&mut app.frame_h)
                        .range(20..=200_000)
                        .speed(8.0),
                )
                .changed()
            {
                app.mag_idx = MAGS.len() - 1;
            }
            ui.label(RichText::new("角度").size(t.font_sub).color(t.muted));
            ui.add(egui::Slider::new(&mut app.angle, 0.0..=359.0).show_value(false));
        }

        // Right-aligned utilities
        ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
            if let Some((cur, total)) = app.progress {
                let p = if total > 0 { cur as f32 / total as f32 } else { 0.0 };
                ui.add(
                    egui::ProgressBar::new(p)
                        .desired_width(90.0)
                        .show_percentage(),
                );
            }

                // Crop-mode only: exporting ROIs
                if app.mode == AppMode::Crop {
                    if app.exporting {
                        if pill_button(ui, &t, "取消导出", Some(icons::WARNING), false).clicked() {
                            app.cancel
                                .store(true, std::sync::atomic::Ordering::Relaxed);
                        }
                    } else {
                        if pill_button(ui, &t, "导出全部", Some(icons::DOWNLOAD), true).clicked() {
                            app.start_export(true);
                        }
                        if pill_button(ui, &t, "导出选中", None, false).clicked() {
                            app.start_export(false);
                        }
                    }
                }

            let theme_icon = match app.theme_mode {
                ThemeMode::System => icons::MONITOR,
                ThemeMode::Light => icons::SUN,
                ThemeMode::Dark => icons::MOON,
            };
            let current_theme = app.theme_mode;
            if pill_button(ui, &t, current_theme.label(), Some(theme_icon), false)
                .on_hover_text(format!("主题：{}（点击切换）", current_theme.label()))
                .clicked()
            {
                // Apply happens next frame in `AppState::update` when the
                // effective dark value changes; calling it mid-frame would
                // give widgets before/after this button different styles.
                app.theme_mode = current_theme.next();
                app.reset_enter();
            }

            if pill_button(ui, &t, "", Some(icons::ARROW_CLOCKWISE), false)
                .on_hover_text("重做 (Ctrl+Y)")
                .clicked()
            {
                app.redo_last();
            }
            if pill_button(ui, &t, "", Some(icons::ARROW_COUNTER_CLOCKWISE), false)
                .on_hover_text("撤销 (Ctrl+Z)")
                .clicked()
            {
                app.undo_last();
            }
        });
    });
}

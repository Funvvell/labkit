//! Right panel: ROI list, selective-export checkboxes and exact geometry edit.

use egui::{RichText, Ui};

use crate::constants::MIN_ROI_SIZE;
use crate::model::RoiCommand;
use crate::ui::app::AppState;
use crate::ui::theme;
use crate::ui::widgets::{chip, pill_button, section_title, subtle_row};

pub fn show(ui: &mut Ui, app: &mut AppState) {
    let t = theme::tokens(app.dark);
    let current = app.current.clone();
    let rois = current
        .as_ref()
        .map(|p| app.store.sorted_slide_rois(p))
        .unwrap_or_default();

    section_title(ui, &t, "ROI 列表");
    ui.horizontal(|ui| {
        chip(ui, &t, &format!("{} 个", rois.len()), true);
        if pill_button(ui, &t, "全选", None, false).clicked() {
            app.export_checked.clear();
            for r in &rois {
                app.export_checked.insert(r.id.clone());
            }
        }
        if pill_button(ui, &t, "反选", None, false).clicked() {
            for r in &rois {
                if app.export_checked.contains(&r.id) {
                    app.export_checked.remove(&r.id);
                } else {
                    app.export_checked.insert(r.id.clone());
                }
            }
        }
    });
    ui.add_space(t.space_tight);

    let mut clicked: Option<String> = None;
    let mut double_clicked: Option<String> = None;
    egui::ScrollArea::vertical()
        .auto_shrink([false, true])
        .max_height(260.0)
        .show(ui, |ui| {
            if rois.is_empty() {
                ui.label(
                    RichText::new("按空格键在切片上放置 ROI")
                        .size(t.font_sub)
                        .color(t.muted),
                );
            }
            for r in &rois {
                let mut checked = app.export_checked.contains(&r.id);
                let selected = app.selected.contains(&r.id);
                let row_id = egui::Id::new(("roi_row", r.id.clone()));
                let resp = subtle_row(ui, &t, row_id, selected, |ui| {
                    ui.horizontal(|ui| {
                        if ui.checkbox(&mut checked, "").changed() {
                            if checked {
                                app.export_checked.insert(r.id.clone());
                            } else {
                                app.export_checked.remove(&r.id);
                            }
                        }
                        let label = format!("({}, {})  {}×{}", r.x, r.y, r.w, r.h);
                        let text = if selected {
                            RichText::new(label).strong()
                        } else {
                            RichText::new(label)
                        };
                        let item = ui.add(
                            egui::Button::new(
                                text.size(t.font_body)
                                    .color(if selected { t.accent } else { t.text }),
                            )
                            .frame(false),
                        );
                        if item.clicked() {
                            clicked = Some(r.id.clone());
                        }
                        if item.double_clicked() {
                            double_clicked = Some(r.id.clone());
                        }
                    });
                });
                let _ = resp;
            }
        });

    if let Some(id) = clicked {
        let ctrl = ui.input(|i| i.modifiers.ctrl);
        if !ctrl {
            app.selected.clear();
        }
        app.selected.insert(id);
    }
    if let Some(id) = double_clicked {
        app.edit_id = Some(id);
    }

    ui.add_space(t.space);
    section_title(ui, &t, "几何属性");
    let edit_id = app.edit_id.clone();
    let draft = edit_id
        .as_ref()
        .and_then(|id| app.store.get(id))
        .cloned();
    match draft {
        Some(mut r) => {
            ui.label(
                RichText::new(format!("ID {}", &r.id[..8.min(r.id.len())]))
                    .size(t.font_sub)
                    .color(t.muted),
            );
            egui::Grid::new("roi_edit_grid").num_columns(2).show(ui, |ui| {
                let field = |ui: &mut Ui, label: &str| {
                    ui.label(RichText::new(label).size(t.font_sub).color(t.text_2));
                };
                field(ui, "X");
                ui.add(egui::DragValue::new(&mut r.x).speed(4.0));
                ui.end_row();
                field(ui, "Y");
                ui.add(egui::DragValue::new(&mut r.y).speed(4.0));
                ui.end_row();
                field(ui, "宽");
                ui.add(
                    egui::DragValue::new(&mut r.w)
                        .range(MIN_ROI_SIZE..=300_000)
                        .speed(4.0),
                );
                ui.end_row();
                field(ui, "高");
                ui.add(
                    egui::DragValue::new(&mut r.h)
                        .range(MIN_ROI_SIZE..=300_000)
                        .speed(4.0),
                );
                ui.end_row();
                field(ui, "角度");
                ui.add(
                    egui::DragValue::new(&mut r.angle)
                        .range(0.0..=359.0)
                        .speed(1.0),
                );
                ui.end_row();
            });
            ui.horizontal(|ui| {
                if pill_button(ui, &t, "应用", None, true).clicked() {
                    let old = app.store.get(&r.id).cloned().unwrap_or_else(|| r.clone());
                    app.undo
                        .push_and_apply(&mut app.store, RoiCommand::Update { old, new: r });
                    app.after_change();
                    app.edit_id = None;
                    app.push_toast("ROI 已更新".into(), false);
                }
                if pill_button(ui, &t, "取消", None, false).clicked() {
                    app.edit_id = None;
                }
            });
        }
        None => {
            if let Some(id) = app.selected.iter().next().cloned() {
                if let Some(r) = app.store.get(&id) {
                    ui.label(
                        RichText::new(format!("X {}  Y {}", r.x, r.y))
                            .size(t.font_body)
                            .color(t.text_2),
                    );
                    ui.label(
                        RichText::new(format!("{} × {} px", r.w, r.h))
                            .size(t.font_body)
                            .color(t.text_2),
                    );
                    if let Some(info) = &app.info {
                        if let Some(mpp) = info.mpp {
                            ui.label(
                                RichText::new(format!(
                                    "{:.1} × {:.1} µm",
                                    r.w as f64 * mpp,
                                    r.h as f64 * mpp
                                ))
                                .size(t.font_sub)
                                .color(t.muted),
                            );
                        }
                    }
                    ui.label(
                        RichText::new("双击列表项可精确编辑")
                            .size(t.font_sub)
                            .color(t.muted),
                    );
                }
            } else {
                ui.label(
                    RichText::new("选中一个 ROI 查看属性")
                        .size(t.font_body)
                        .color(t.muted),
                );
            }
        }
    }

    ui.add_space(t.space);
    ui.horizontal(|ui| {
        if pill_button(ui, &t, "删除", None, false).clicked() {
            app.delete_selected();
        }
        if pill_button(ui, &t, "清空当前", None, false).clicked() {
            app.clear_current_slide();
        }
    });
}

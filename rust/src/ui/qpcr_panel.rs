//! qPCR workspace: import / paste / design (left), results (centre),
//! parameters and QC (right). Uses the same design tokens as the crop mode.

use std::path::{Path, PathBuf};

use egui::{RichText, Ui};

use crate::errors::{AppError, Result};
use crate::qpcr::model::{DataSource, QpcrAnalysis, QpcrRun, RefStrategy, Well};
use crate::qpcr::stats::{one_way_anova, significance, welch_t_test};
use crate::qpcr::{export_io, io_csv, io_excel, io_instrument, io_manual, session};
use crate::qpcr as qpcr;
use crate::ui::theme::Tokens;
use crate::ui::widgets::{
    chip, hairline, icons, panel_card, pill_button, section_title, segmented,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AppMode {
    Crop,
    Qpcr,
}

#[derive(Default)]
pub struct QpcrState {
    pub run: Option<QpcrRun>,
    pub analysis: Option<QpcrAnalysis>,
    pub paste_buffer: String,
    pub calibrator_draft: String,
    pub reference_draft: String,
    pub target_draft: String,
    pub group_draft: String,
    pub status: String,
    pub error: Option<String>,
}

pub fn split_names(s: &str) -> Vec<String> {
    s.split(|c: char| c == ',' || c == '，' || c == ';' || c == '；' || c == '\n')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

fn looks_like_reference(name: &str) -> bool {
    let n = name.to_lowercase();
    n.contains("gapdh") || n.contains("actb") || n.contains("18s") || n.contains("ref") || n.contains("内参")
}

impl QpcrState {
    pub fn load_or_default() -> Self {
        let mut s = Self::default();
        if let Some(run) = session::load() {
            s.sync_drafts(&run);
            s.run = Some(run);
            s.recompute();
            s.status = "已恢复上次 qPCR 会话".into();
        }
        s
    }

    fn sync_drafts(&mut self, run: &QpcrRun) {
        self.calibrator_draft = run.design.calibrator_sample.clone().unwrap_or_default();
        self.reference_draft = run.design.reference_targets.join(", ");
        self.target_draft = run.design.target_ids.join(", ");
        self.group_draft = run
            .design
            .sample_groups
            .iter()
            .map(|(s, g)| format!("{g}: {s}"))
            .collect::<Vec<_>>()
            .join("\n");
    }

    fn set_run(&mut self, wells: Vec<Well>, source: DataSource) {
        if wells.is_empty() {
            self.error = Some("未解析到任何有效孔位".into());
            return;
        }
        let mut run = QpcrRun::new(wells, Some(source));
        let mut targets: Vec<String> = run
            .wells
            .iter()
            .map(|w| w.target_id.clone())
            .filter(|t| !t.is_empty())
            .collect();
        targets.sort();
        targets.dedup();
        let mut samples: Vec<String> = run
            .wells
            .iter()
            .map(|w| w.sample_id.clone())
            .filter(|s| !s.is_empty())
            .collect();
        samples.sort();
        samples.dedup();

        let refs: Vec<String> = targets.iter().filter(|t| looks_like_reference(t)).cloned().collect();
        if targets.len() > 1 {
            let refs = if refs.is_empty() { vec![targets[0].clone()] } else { refs };
            run.design.reference_targets = refs.clone();
            run.design.target_ids = targets.into_iter().filter(|t| !refs.contains(t)).collect();
        } else {
            run.design.target_ids = targets;
        }
        run.design.calibrator_sample = samples.first().cloned();

        self.sync_drafts(&run);
        self.run = Some(run);
        self.recompute();
        self.save();
        self.error = None;
        self.status = format!("已导入 {} 个孔位", self.run.as_ref().map(|r| r.wells.len()).unwrap_or(0));
    }

    pub fn import_csv(&mut self, path: &Path) -> Result<()> {
        let wells = io_csv::read_csv(path)?;
        self.set_run(wells, DataSource::Csv { path: path.display().to_string() });
        Ok(())
    }

    pub fn import_excel(&mut self, path: &Path) -> Result<()> {
        let (wells, sheet) = io_excel::read_excel(path, None)?;
        self.set_run(wells, DataSource::Excel { path: path.display().to_string(), sheet });
        Ok(())
    }

    pub fn import_instrument(&mut self, path: &Path) -> Result<()> {
        // openreadout-qpcr as primary parser, generic table parsers as fallback.
        let (wells, format) = match io_instrument::read_instrument(path) {
            Ok(v) => v,
            Err(first) => {
                let ext = path
                    .extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("")
                    .to_lowercase();
                let fallback = if matches!(ext.as_str(), "xlsx" | "xls") {
                    io_excel::read_excel(path, None).map(|(w, _)| (w, "generic-excel".into()))
                } else {
                    io_csv::read_csv(path).map(|w| (w, "generic-csv".into()))
                };
                match fallback {
                    Ok(v) => {
                        self.status = format!("仪器解析失败，已按通用表回退（{first}）");
                        v
                    }
                    Err(_) => return Err(first),
                }
            }
        };
        self.set_run(wells, DataSource::Instrument { format, path: path.display().to_string() });
        Ok(())
    }

    pub fn import_pasted(&mut self) -> Result<()> {
        let wells = io_manual::parse_pasted(&self.paste_buffer)?;
        self.set_run(wells, DataSource::Manual);
        Ok(())
    }

    pub fn apply_design(&mut self) {
        let Some(run) = self.run.as_mut() else { return };
        run.design.calibrator_sample = {
            let s = self.calibrator_draft.trim();
            (!s.is_empty()).then_some(s.to_string())
        };
        run.design.reference_targets = split_names(&self.reference_draft);
        let targets = split_names(&self.target_draft);
        if !targets.is_empty() {
            run.design.target_ids = targets;
        }
        let mut groups = std::collections::BTreeMap::new();
        for line in self.group_draft.lines() {
            if let Some((group, samples)) = line.split_once(':').or_else(|| line.split_once('=')) {
                for sample in split_names(samples) {
                    groups.insert(sample, group.trim().to_string());
                }
            }
        }
        run.design.sample_groups = groups;
        self.recompute();
        self.save();
    }

    pub fn recompute(&mut self) {
        if let Some(run) = &self.run {
            match qpcr::analyze(run) {
                Ok(a) => {
                    self.analysis = Some(a);
                    self.error = None;
                }
                Err(e) => self.error = Some(e.to_string()),
            }
        }
    }

    pub fn save(&self) {
        if let Some(run) = &self.run {
            if let Err(e) = session::save(run) {
                tracing::warn!("qPCR 会话保存失败: {e}");
            }
        }
    }

    pub fn export_csv(&self, dir: &Path) -> Result<PathBuf> {
        let Some(analysis) = &self.analysis else {
            return Err(AppError::Qpcr("尚无分析结果".into()));
        };
        let name = format!(
            "qpcr_result_{}_{}.csv",
            self.run.as_ref().map(|r| r.name.as_str()).unwrap_or("run"),
            chrono::Local::now().format("%Y%m%d_%H%M%S")
        );
        let path = dir.join(name);
        export_io::write_csv(&path, analysis)?;
        Ok(path)
    }
}

pub fn show_left(ui: &mut Ui, s: &mut QpcrState, t: &Tokens) {
    section_title(ui, t, "导入数据");
    panel_card(t).show(ui, |ui| {
        ui.horizontal(|ui| {
            if pill_button(ui, t, "CSV", Some(icons::FOLDER_OPEN), false).clicked() {
                if let Some(p) = rfd::FileDialog::new().add_filter("Cq 表", &["csv", "tsv"]).pick_file() {
                    if let Err(e) = s.import_csv(&p) { s.error = Some(e.to_string()); }
                }
            }
            if pill_button(ui, t, "Excel", Some(icons::FOLDER), false).clicked() {
                if let Some(p) = rfd::FileDialog::new().add_filter("Excel", &["xlsx", "xls"]).pick_file() {
                    if let Err(e) = s.import_excel(&p) { s.error = Some(e.to_string()); }
                }
            }
        });
        if pill_button(ui, t, "仪器文件 (.eds/.rex/.ixo/.lc96p/.rdml)", None, false).clicked() {
            if let Some(p) = rfd::FileDialog::new()
                .add_filter("仪器文件", &["eds", "rex", "ixo", "lc96p", "rdml", "rdm", "csv", "xlsx", "xls"])
                .pick_file()
            {
                if let Err(e) = s.import_instrument(&p) { s.error = Some(e.to_string()); }
            }
        }
        ui.label(RichText::new(&s.status).size(t.font_sub).color(t.muted));
    });

    ui.add_space(t.space);
    section_title(ui, t, "手动输入 / 粘贴");
    panel_card(t).show(ui, |ui| {
        ui.add(
            egui::TextEdit::multiline(&mut s.paste_buffer)
                .desired_rows(6)
                .hint_text("样本\t基因\tCt\n对照\tGAPDH\t18.0\n对照\t目标基因\t20.0"),
        );
        ui.horizontal(|ui| {
            if pill_button(ui, t, "解析粘贴内容", None, true).clicked() {
                if let Err(e) = s.import_pasted() { s.error = Some(e.to_string()); }
            }
            if pill_button(ui, t, "清空", None, false).clicked() { s.paste_buffer.clear(); }
        });
    });

    ui.add_space(t.space);
    section_title(ui, t, "实验设计");
    panel_card(t).show(ui, |ui| {
        let field = |ui: &mut Ui, label: &str, text: &mut String| {
            ui.label(RichText::new(label).size(t.font_sub).color(t.muted));
            ui.add(egui::TextEdit::singleline(text).desired_width(190.0));
        };
        field(ui, "校准样本", &mut s.calibrator_draft);
        field(ui, "内参基因（逗号分隔）", &mut s.reference_draft);
        field(ui, "目标基因（逗号分隔）", &mut s.target_draft);
        ui.label(RichText::new("分组（每行：组名: 样本1,样本2）").size(t.font_sub).color(t.muted));
        ui.add(egui::TextEdit::multiline(&mut s.group_draft).desired_rows(3));
        if pill_button(ui, t, "应用设计并重新计算", None, false).clicked() {
            s.apply_design();
            s.status = "设计已应用".into();
        }
        if let Some(run) = &s.run {
            ui.add_space(t.space_tight);
            chip(ui, t, &format!("{} 样本", unique_count(run.wells.iter().map(|w| w.sample_id.as_str()))), false);
            chip(ui, t, &format!("{} 基因", unique_count(run.wells.iter().map(|w| w.target_id.as_str()))), false);
        }
    });
}

fn unique_count<'a>(it: impl Iterator<Item = &'a str>) -> usize {
    let mut v: Vec<&str> = it.collect();
    v.sort();
    v.dedup();
    v.len()
}

pub fn show_center(ui: &mut Ui, s: &mut QpcrState, t: &Tokens) {
    let Some(analysis) = s.analysis.clone() else {
        ui.centered_and_justified(|ui| {
            ui.vertical_centered(|ui| {
                ui.add_space(80.0);
                ui.label(RichText::new("qPCR 数据分析").size(t.font_body * 1.3).strong().color(t.text));
                ui.add_space(10.0);
                ui.label(RichText::new("从左侧导入 Cq 表、Excel 或仪器文件，也可直接粘贴数据").color(t.muted));
                ui.add_space(10.0);
                ui.label(RichText::new("ΔΔCt 相对定量 · 多参考基因 · 异常孔过滤 · 统计检验").size(t.font_body).color(t.muted));
            });
        });
        return;
    };

    section_title(ui, t, "相对定量结果");
    hairline(ui, t);
    egui::ScrollArea::vertical().show(ui, |ui| {
        egui::Grid::new("qpcr_results")
            .num_columns(10)
            .spacing([12.0, 6.0])
            .striped(true)
            .show(ui, |ui| {
                for h in ["样本", "基因", "组", "Mean Cq", "n", "CV", "ΔCt", "ΔΔCt", "Fold", "标记"] {
                    ui.label(RichText::new(h).strong().size(t.font_sub).color(t.muted));
                }
                ui.end_row();
                for r in &analysis.results {
                    ui.label(RichText::new(&r.sample_id).size(t.font_body));
                    ui.label(RichText::new(&r.target_id).size(t.font_body));
                    ui.label(RichText::new(r.group.as_deref().unwrap_or("—")).size(t.font_sub).color(t.muted));
                    ui.label(fmt(r.mean_cq));
                    ui.label(r.n_tech.to_string());
                    ui.label(fmt(r.cv));
                    ui.label(fmt(r.delta_ct));
                    ui.label(fmt(r.delta_delta_ct));
                    let fc = fmt(r.fold_change);
                    let fc_color = match r.fold_change {
                        Some(v) if v > 1.0 => t.success,
                        Some(v) if v < 1.0 => t.error,
                        _ => t.text,
                    };
                    ui.label(RichText::new(fc).color(fc_color).strong());
                    ui.label(RichText::new(
                        if r.flags.is_empty() { "—".into() } else { r.flags.iter().map(|f| f.as_str()).collect::<Vec<_>>().join(" ") },
                    ).size(t.font_sub).color(if r.flags.is_empty() { t.muted } else { t.warning }));
                    ui.end_row();
                }
            });

        ui.add_space(12.0);
        section_title(ui, t, "参考基因稳定性");
        ui.horizontal_wrapped(|ui| {
            if analysis.ref_stability.is_empty() {
                ui.label(RichText::new("仅设置一个内参，无需 geNorm 排序").color(t.muted));
            }
            for (name, m) in &analysis.ref_stability {
                chip(ui, t, &format!("{name}  M={m:.4}"), m.is_finite());
            }
        });

        ui.add_space(12.0);
        section_title(ui, t, "统计检验（按组比较 Fold Change）");
        let targets: Vec<String> = {
            let mut v: Vec<String> = analysis.results.iter().map(|r| r.target_id.clone()).collect();
            v.sort();
            v.dedup();
            v
        };
        for target in targets {
            let mut groups: std::collections::BTreeMap<String, Vec<f64>> = std::collections::BTreeMap::new();
            for r in analysis.results.iter().filter(|r| r.target_id == target) {
                if let (Some(g), Some(fc)) = (&r.group, r.fold_change) {
                    if fc.is_finite() { groups.entry(g.clone()).or_default().push(fc); }
                }
            }
            let keys: Vec<String> = groups.keys().cloned().collect();
            let detail = if keys.len() == 2 {
                welch_t_test(&groups[&keys[0]], &groups[&keys[1]])
                    .map(|x| format!("Welch t={:.3}, df={:.1}, p={:.4} ({}), d={:.2}", x.t, x.df, x.p_two_sided, significance(x.p_two_sided), x.cohens_d))
                    .unwrap_or_else(|| "样本不足，无法检验".into())
            } else if keys.len() > 2 {
                let refs: Vec<&[f64]> = groups.values().map(|v| v.as_slice()).collect();
                one_way_anova(&refs)
                    .map(|x| format!("ANOVA F={:.3}, df=({:.0},{:.0}), p={:.4} ({}), η²={:.3}", x.f, x.df1, x.df2, x.p, significance(x.p), x.eta_squared))
                    .unwrap_or_else(|| "样本不足，无法检验".into())
            } else {
                "未设置分组".into()
            };
            ui.horizontal(|ui| {
                ui.label(RichText::new(&target).strong().size(t.font_body));
                ui.label(RichText::new(detail).size(t.font_sub).color(t.muted));
            });
        }
    });
}

pub fn fmt(v: Option<f64>) -> String {
    v.filter(|x| x.is_finite())
        .map(|x| format!("{x:.3}"))
        .unwrap_or_else(|| "—".into())
}

pub fn show_right(ui: &mut Ui, s: &mut QpcrState, t: &Tokens, output_dir: &Path) {
    let mut apply_clicked = false;
    section_title(ui, t, "分析参数");
    panel_card(t).show(ui, |ui| {
        let Some(run) = s.run.as_mut() else {
            ui.label(RichText::new("请先导入数据").size(t.font_body).color(t.muted));
            return;
        };
        ui.horizontal(|ui| {
            ui.label(RichText::new("CV 阈值").size(t.font_sub).color(t.muted));
            ui.add(egui::DragValue::new(&mut run.design.cv_threshold).range(0.0..=1.0).speed(0.005));
        });
        let mut sd_on = run.design.sd_threshold.is_some();
        ui.horizontal(|ui| {
            if ui.checkbox(&mut sd_on, "SD 阈值").changed() {
                run.design.sd_threshold = sd_on.then_some(0.25);
            }
            if let Some(v) = run.design.sd_threshold.as_mut() {
                ui.add(egui::DragValue::new(v).range(0.0..=5.0).speed(0.01));
            }
        });
        ui.add_space(4.0);
        ui.label(RichText::new("内参策略").size(t.font_sub).color(t.muted));
        ui.horizontal(|ui| {
            segmented(
                ui,
                t,
                &mut run.design.ref_strategy,
                &[
                    (RefStrategy::GeometricMean, "几何平均"),
                    (RefStrategy::Genorm, "geNorm"),
                ],
            );
        });
        if pill_button(ui, t, "重新计算", None, false).clicked() {
            apply_clicked = true;
        }
    });
    if apply_clicked {
        s.apply_design();
    }

    ui.add_space(8.0);
    section_title(ui, t, "QC 警告");
    panel_card(t).show(ui, |ui| {
        let warnings = s.analysis.as_ref().map(|a| a.warnings.clone()).unwrap_or_default();
        if warnings.is_empty() {
            ui.label(RichText::new("无警告").size(t.font_body).color(t.success));
        } else {
            for w in warnings.iter().take(12) {
                ui.horizontal(|ui| {
                    ui.label(RichText::new(icons::WARNING).color(t.warning));
                    ui.label(RichText::new(w).size(t.font_sub).color(t.text));
                });
            }
        }
    });

    ui.add_space(8.0);
    panel_card(t).show(ui, |ui| {
        if pill_button(ui, t, "导出结果 CSV", Some(icons::DOWNLOAD), true).clicked() {
            match s.export_csv(output_dir) {
                Ok(p) => s.status = format!("已导出 {}", p.display()),
                Err(e) => s.error = Some(e.to_string()),
            }
        }
        if let Some(e) = &s.error {
            ui.label(RichText::new(e).size(t.font_sub).color(t.error));
        }
    });
}

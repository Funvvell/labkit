//! Application state and the eframe event loop.

use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use egui::Context;

use crate::constants::{DEFAULT_FRAME_H, DEFAULT_FRAME_W, DEFAULT_OUTPUT_DIR_NAME};
use crate::decode::{DecodeHandle, Response as DecoderResponse, TileKey};
use crate::export::{ExportEvent, ExportOptions};
use crate::model::session;
use crate::model::{Roi, RoiCommand, RoiStore, UndoStack};
use crate::render::{texture, TileCache, Viewport};
use crate::sdpc::SlideInfo;
use crate::ui::canvas_view::Interaction;
use crate::ui::theme::ThemeMode;
use crate::ui::qpcr_panel::{self, AppMode, QpcrState};
use crate::ui::widgets::Toast;
use crate::ui::{canvas_view, file_panel, roi_panel, theme, topbar, widgets};

pub struct AppState {
    pub decode: DecodeHandle,
    pub slides: Vec<PathBuf>,
    pub current: Option<PathBuf>,
    pub info: Option<SlideInfo>,
    pub thumb: Option<egui::TextureHandle>,

    pub vp: Viewport,
    pub tiles: TileCache,
    pub inflight: HashSet<TileKey>,
    pub gen: u64,
    pub frame_rect: Option<egui::Rect>,
    pub fit_pending: bool,
    pub last_change: Instant,
    pub mouse_l0: (f64, f64),
    pub interaction: Interaction,

    pub store: RoiStore,
    pub undo: UndoStack,
    pub selected: HashSet<String>,
    pub export_checked: HashSet<String>,
    pub edit_id: Option<String>,

    pub roi_mode: bool,
    pub frame_w: i64,
    pub frame_h: i64,
    pub angle: f64,
    pub mag_idx: usize,
    pub ratio_idx: usize,

    pub dark: bool,
    pub theme_mode: ThemeMode,
    pub ui_enter_at: Instant,
    pub last_applied_dark: bool,
    pub output_dir: PathBuf,
    pub progress: Option<(u32, u32)>,
    pub exporting: bool,
    pub cancel: Arc<AtomicBool>,
    pub toast: Option<Toast>,
    pub error: Option<String>,

    pub mode: AppMode,
    pub qpcr: QpcrState,
}

impl AppState {
    pub fn new(_cc: &eframe::CreationContext<'_>) -> crate::errors::Result<Self> {
        let session_path = session::default_session_path().ok();
        let store = session_path
            .as_ref()
            .map(|p| session::load_if_exists(p))
            .unwrap_or_default();
        let mut export_checked = HashSet::new();
        let mut slides = Vec::new();
        for r in store.all() {
            export_checked.insert(r.id);
            slides.push(r.slide_path);
        }
        slides.sort();
        slides.dedup();

        let output_dir = dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(DEFAULT_OUTPUT_DIR_NAME);

        Ok(Self {
            decode: DecodeHandle::spawn()?,
            slides,
            current: None,
            info: None,
            thumb: None,
            vp: Viewport::new(),
            tiles: TileCache::new(),
            inflight: HashSet::new(),
            gen: 0,
            frame_rect: None,
            fit_pending: false,
            last_change: Instant::now() - Duration::from_secs(1),
            mouse_l0: (0.0, 0.0),
            interaction: Interaction::None,
            store,
            undo: UndoStack::new(crate::constants::UNDO_MAX_DEPTH),
            selected: HashSet::new(),
            export_checked,
            edit_id: None,
            roi_mode: false,
            frame_w: DEFAULT_FRAME_W,
            frame_h: DEFAULT_FRAME_H,
            angle: 0.0,
            mag_idx: 2,
            ratio_idx: 4,
            dark: false,
            theme_mode: ThemeMode::System,
            ui_enter_at: Instant::now(),
            last_applied_dark: false,
            output_dir,
            progress: None,
            exporting: false,
            cancel: Arc::new(AtomicBool::new(false)),
            toast: None,
            error: None,
            mode: AppMode::Crop,
            qpcr: QpcrState::load_or_default(),
        })
    }

    /// Restart the quiet 0.24s fade (used on mode switch).
    pub fn reset_enter(&mut self) {
        self.ui_enter_at = Instant::now();
    }

    pub fn push_toast(&mut self, msg: String, error: bool) {
        self.toast = Some(Toast {
            msg,
            at: Instant::now(),
            error,
        });
    }

    pub fn on_view_changed(&mut self) {
        self.gen = self.gen.wrapping_add(1);
        self.inflight.clear();
        self.decode.cancel_tiles(self.gen);
        self.last_change = Instant::now();
    }

    /// Persist the session after any ROI mutation and prune stale selections.
    pub fn after_change(&mut self) {
        let ids: HashSet<String> = self.store.all().into_iter().map(|r| r.id).collect();
        self.export_checked.retain(|id| ids.contains(id));
        self.selected.retain(|id| ids.contains(id));
        if let Ok(path) = session::default_session_path() {
            if let Err(e) = session::save(&path, &self.store) {
                tracing::warn!("会话保存失败: {e}");
            }
        }
    }

    pub fn open_files(&mut self) {
        if let Some(paths) = rfd::FileDialog::new()
            .add_filter("SDPC 切片", &["sdpc"])
            .pick_files()
        {
            for p in paths {
                if !self.slides.contains(&p) {
                    self.slides.push(p.clone());
                }
                self.select_slide(p);
            }
        }
    }

    pub fn remove_current(&mut self) {
        if let Some(p) = self.current.clone() {
            self.slides.retain(|s| s != &p);
            self.current = None;
            self.info = None;
            self.thumb = None;
            self.tiles.clear();
            self.on_view_changed();
        }
    }

    pub fn select_slide(&mut self, path: PathBuf) {
        self.current = Some(path.clone());
        self.info = None;
        self.thumb = None;
        self.tiles.clear();
        self.on_view_changed();
        self.decode.open(path, self.gen);
    }

    pub fn import_legacy_session(&mut self) {
        match session::legacy_session_path() {
            Ok(p) if p.exists() => match session::import_legacy(&mut self.store, &p) {
                Ok(n) => {
                    self.after_change();
                    for r in self.store.all() {
                        self.export_checked.insert(r.id);
                        if !self.slides.contains(&r.slide_path) {
                            self.slides.push(r.slide_path);
                        }
                    }
                    self.push_toast(format!("已导入 {n} 个旧会话 ROI"), false);
                }
                Err(e) => self.push_toast(format!("导入失败: {e}"), true),
            },
            _ => self.push_toast("未找到旧版 session.json".into(), true),
        }
    }

    pub fn place_roi(&mut self) {
        let Some(slide) = self.current.clone() else {
            self.push_toast("请先打开一张切片".into(), true);
            return;
        };
        let (mx, my) = self.mouse_l0;
        let roi = Roi::new(
            &slide,
            (mx - self.frame_w as f64 / 2.0) as i64,
            (my - self.frame_h as f64 / 2.0) as i64,
            self.frame_w,
            self.frame_h,
            self.angle,
        );
        let id = roi.id.clone();
        self.undo
            .push_and_apply(&mut self.store, RoiCommand::Add(roi));
        self.selected.clear();
        self.selected.insert(id.clone());
        self.export_checked.insert(id);
        self.after_change();
    }

    pub fn delete_selected(&mut self) {
        let ids: Vec<String> = self.selected.iter().cloned().collect();
        let rois: Vec<Roi> = ids
            .iter()
            .filter_map(|id| self.store.get(id).cloned())
            .collect();
        if rois.is_empty() {
            return;
        }
        let cmd = if rois.len() == 1 {
            RoiCommand::Remove(rois[0].clone())
        } else {
            RoiCommand::BatchRemove(rois)
        };
        self.undo.push_and_apply(&mut self.store, cmd);
        self.selected.clear();
        self.after_change();
    }

    pub fn duplicate_selected(&mut self) {
        let Some(slide) = self.current.clone() else { return };
        let off = (self.frame_w / 2).max(16);
        let copies: Vec<Roi> = self
            .selected
            .iter()
            .filter_map(|id| self.store.get(id).cloned())
            .map(|r| Roi::new(&slide, r.x + off, r.y + off, r.w, r.h, r.angle))
            .collect();
        if copies.is_empty() {
            return;
        }
        for r in &copies {
            self.export_checked.insert(r.id.clone());
        }
        self.selected = copies.iter().map(|r| r.id.clone()).collect();
        self.undo
            .push_and_apply(&mut self.store, RoiCommand::BatchAdd(copies));
        self.after_change();
    }

    pub fn clear_current_slide(&mut self) {
        let Some(slide) = self.current.clone() else { return };
        let rois = self.store.sorted_slide_rois(&slide);
        if rois.is_empty() {
            return;
        }
        self.undo.push_and_apply(
            &mut self.store,
            RoiCommand::ClearSlide { path: slide, rois },
        );
        self.selected.clear();
        self.after_change();
        self.push_toast("已清空当前切片的 ROI（可撤销）".into(), false);
    }

    pub fn undo_last(&mut self) {
        if self.undo.undo(&mut self.store) {
            self.after_change();
        }
    }

    pub fn redo_last(&mut self) {
        if self.undo.redo(&mut self.store) {
            self.after_change();
        }
    }

    pub fn start_export(&mut self, all: bool) {
        let rois: Vec<Roi> = if all {
            self.store.all()
        } else {
            self.store
                .all()
                .into_iter()
                .filter(|r| self.export_checked.contains(&r.id))
                .collect()
        };
        if rois.is_empty() {
            self.push_toast("没有可导出的 ROI".into(), true);
            return;
        }
        let opts = ExportOptions::new(self.output_dir.clone(), topbar::mag_label(self));
        self.cancel = opts.cancel.clone();
        self.cancel.store(false, Ordering::Relaxed);
        self.exporting = true;
        let total = rois.len() as u32;
        self.progress = Some((0, total));
        self.decode.start_export(rois, opts, self.gen);
        self.push_toast(format!("开始导出 {total} 个 ROI"), false);
    }

    fn poll_responses(&mut self, ctx: &Context) {
        for r in self.decode.poll(8) {
            match r {
                DecoderResponse::Opened { path, info, thumb, .. } => {
                    if self.current.as_ref() != Some(&path) {
                        continue;
                    }
                    self.info = Some(info);
                    self.thumb = Some(texture::upload(ctx, "slide_thumb", &thumb, true));
                    self.fit_pending = true;
                    self.tiles.clear();
                    topbar::auto_frame(self);
                }
                DecoderResponse::TileReady { key, img, gen } => {
                    self.inflight.remove(&key);
                    if gen == self.gen {
                        let name = format!("tile_{}_{}_{}", key.level, key.x, key.y);
                        let tex = texture::upload(ctx, &name, &img, true);
                        self.tiles.insert(key, tex);
                    }
                }
                DecoderResponse::TileFailed { key, .. } => {
                    self.inflight.remove(&key);
                }
                DecoderResponse::Export(ev) => match ev {
                    ExportEvent::Progress { current, total } => {
                        self.progress = Some((current, total));
                    }
                    ExportEvent::FileDone { result, .. } => {
                        if let Err(e) = result {
                            tracing::warn!("导出失败: {e}");
                        }
                    }
                    ExportEvent::Finished { ok, failed, cancelled } => {
                        self.exporting = false;
                        self.progress = None;
                        self.push_toast(
                            format!("导出完成 · 成功 {ok} / 失败 {failed}{}", if cancelled { " · 已取消" } else { "" }),
                            failed > 0,
                        );
                    }
                },
                DecoderResponse::Error(e) => {
                    self.error = Some(e);
                }
            }
        }
        // Keep polling while background work is in flight.
        if !self.inflight.is_empty() || self.exporting {
            ctx.request_repaint();
        }
    }

    fn handle_shortcuts(&mut self, ctx: &Context) {
        if self.mode == AppMode::Qpcr {
            return;
        }
        if self.edit_id.is_some() {
            return;
        }
        let (space, del, undo, redo, select_all, dup, next, prev, fit, home) = ctx.input(|i| {
            (
                i.key_pressed(egui::Key::Space),
                i.key_pressed(egui::Key::Delete) || i.key_pressed(egui::Key::Backspace),
                i.modifiers.ctrl && !i.modifiers.shift && i.key_pressed(egui::Key::Z),
                (i.modifiers.ctrl && i.key_pressed(egui::Key::Y))
                    || (i.modifiers.ctrl && i.modifiers.shift && i.key_pressed(egui::Key::Z)),
                i.modifiers.ctrl && i.key_pressed(egui::Key::A),
                i.modifiers.ctrl && i.key_pressed(egui::Key::D),
                i.key_pressed(egui::Key::N),
                i.key_pressed(egui::Key::P),
                i.key_pressed(egui::Key::F),
                i.key_pressed(egui::Key::Home),
            )
        });

        if space && self.roi_mode {
            self.place_roi();
        }
        if del {
            self.delete_selected();
        }
        if undo {
            self.undo_last();
        }
        if redo {
            self.redo_last();
        }
        if select_all {
            if let Some(p) = self.current.clone() {
                self.selected = self
                    .store
                    .sorted_slide_rois(&p)
                    .into_iter()
                    .map(|r| r.id)
                    .collect();
            }
        }
        if dup {
            self.duplicate_selected();
        }
        if fit || home {
            self.fit_pending = true;
        }
        if next || prev {
            let Some(p) = self.current.clone() else { return };
            let rois = self.store.sorted_slide_rois(&p);
            if rois.is_empty() {
                return;
            }
            let cur = self
                .selected
                .iter()
                .next()
                .and_then(|id| rois.iter().position(|r| &r.id == id))
                .unwrap_or(0);
            let idx = if next {
                (cur + 1) % rois.len()
            } else {
                (cur + rois.len() - 1) % rois.len()
            };
            let target = rois[idx].clone();
            self.selected.clear();
            self.selected.insert(target.id.clone());
            if let Some(canvas) = self.frame_rect {
                self.vp.center_on(
                    canvas.width() as f64,
                    canvas.height() as f64,
                    target.x as f64 + target.w as f64 / 2.0,
                    target.y as f64 + target.h as f64 / 2.0,
                );
                self.on_view_changed();
            }
        }
    }
}

impl eframe::App for AppState {
    fn update(&mut self, ctx: &Context, _frame: &mut eframe::Frame) {
        self.poll_responses(ctx);
        self.handle_shortcuts(ctx);
        let dark = theme::effective_dark(ctx, self.theme_mode);
        self.dark = dark;
        // System theme can change at runtime without any button press: reapply
        // the full palette (both themes were written by `theme::apply`).
        if dark != self.last_applied_dark {
            theme::apply(ctx, self.theme_mode);
            self.last_applied_dark = dark;
        }
        let t = theme::tokens(dark);
        let opacity = widgets::enter_opacity(self.ui_enter_at, t.anim_in);

        egui::TopBottomPanel::top("topbar")
            .exact_height(t.top_h)
            .frame(egui::Frame::NONE.fill(t.panel).inner_margin(6.0))
            .show(ctx, |ui| topbar::show(ui, self));

        match self.mode {
            AppMode::Crop => {
                egui::SidePanel::left("left_panel")
                    .default_width(t.side_w)
                    .width_range(184.0..=320.0)
                    .resizable(true)
                    .frame(
                        egui::Frame::NONE
                            .fill(t.window)
                            .inner_margin(t.space as i8)
                            .stroke(egui::Stroke::new(0.5, t.line)),
                    )
                    .show(ctx, |ui| {
                        ui.set_opacity(opacity);
                        file_panel::show(ui, self);
                    });

                egui::SidePanel::right("right_panel")
                    .default_width(t.side_w)
                    .width_range(184.0..=320.0)
                    .resizable(true)
                    .frame(
                        egui::Frame::NONE
                            .fill(t.window)
                            .inner_margin(t.space as i8)
                            .stroke(egui::Stroke::new(0.5, t.line)),
                    )
                    .show(ctx, |ui| {
                        ui.set_opacity(opacity);
                        roi_panel::show(ui, self);
                    });

                egui::TopBottomPanel::bottom("statusbar")
                    .exact_height(28.0)
                    .frame(egui::Frame::NONE.fill(t.panel).inner_margin(4.0))
                    .show(ctx, |ui| widgets::shortcut_bar(ui, &t));

                egui::CentralPanel::default()
                    .frame(egui::Frame::NONE.fill(t.viewer_bg))
                    .show(ctx, |ui| {
                        let rect = ui.available_rect_before_wrap();
                        canvas_view::show(ui, self, rect);
                    });
            }
            AppMode::Qpcr => {
                egui::SidePanel::left("qpcr_left")
                    .default_width(t.side_w)
                    .width_range(184.0..=340.0)
                    .resizable(true)
                    .frame(
                        egui::Frame::NONE
                            .fill(t.window)
                            .inner_margin(t.space as i8)
                            .stroke(egui::Stroke::new(0.5, t.line)),
                    )
                    .show(ctx, |ui| {
                        ui.set_opacity(opacity);
                        qpcr_panel::show_left(ui, &mut self.qpcr, &t);
                    });

                egui::SidePanel::right("qpcr_right")
                    .default_width(240.0)
                    .width_range(200.0..=340.0)
                    .resizable(true)
                    .frame(
                        egui::Frame::NONE
                            .fill(t.window)
                            .inner_margin(t.space as i8)
                            .stroke(egui::Stroke::new(0.5, t.line)),
                    )
                    .show(ctx, |ui| {
                        ui.set_opacity(opacity);
                        qpcr_panel::show_right(ui, &mut self.qpcr, &t, &self.output_dir);
                    });

                egui::CentralPanel::default()
                    .frame(egui::Frame::NONE.fill(t.panel))
                    .show(ctx, |ui| {
                        ui.set_opacity(opacity);
                        qpcr_panel::show_center(ui, &mut self.qpcr, &t);
                    });
            }
        }

        if opacity < 1.0 {
            ctx.request_repaint();
        }

        if let Some(msg) = self.error.clone() {
            widgets::error_window(ctx, &t, &msg, &mut self.error);
        }
        if let Some(toast) = self.toast.clone() {
            widgets::show_toast(ctx, &t, &toast);
        }
        ctx.request_repaint_after(Duration::from_millis(60));
    }
}

//! Batch ROI export: deterministic ordering, naming, progress, cancellation
//! and per-ROI error isolation (ported from `BatchExporter.run`).

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use crate::errors::Result;
use crate::export::tiff::write_rgb_tiff;
use crate::model::Roi;
use crate::sdpc::RgbImage;

#[derive(Debug, Clone)]
pub struct ExportOptions {
    pub output_dir: PathBuf,
    pub mag_label: Option<String>,
    pub cancel: Arc<AtomicBool>,
}

impl ExportOptions {
    pub fn new(output_dir: PathBuf, mag_label: Option<String>) -> Self {
        Self {
            output_dir,
            mag_label,
            cancel: Arc::new(AtomicBool::new(false)),
        }
    }
}

#[derive(Debug, Clone)]
pub enum ExportEvent {
    Progress { current: u32, total: u32 },
    FileDone { name: String, result: std::result::Result<(), String> },
    Finished { ok: u32, failed: u32, cancelled: bool },
}

#[derive(Debug, Default)]
pub struct ExportReport {
    pub ok: u32,
    pub failed: u32,
    pub cancelled: bool,
    pub files: Vec<(String, std::result::Result<(), String>)>,
}

/// Stable `(slide_path, x, y, id)` ordering. The Python version relied on
/// dict insertion order; making it explicit removes that ambiguity.
pub fn sorted_for_export(rois: &[Roi]) -> Vec<Roi> {
    let mut v = rois.to_vec();
    v.sort_by(|a, b| {
        (&a.slide_path, a.x, a.y, &a.id).cmp(&(&b.slide_path, b.x, b.y, &b.id))
    });
    v
}

/// `{stem}_ROI_{idx:04d}{_mag}.tiff`
pub fn output_name(stem: &str, idx: usize, mag: Option<&str>) -> String {
    let suffix = mag
        .filter(|m| !m.is_empty())
        .map(|m| format!("_{m}"))
        .unwrap_or_default();
    format!("{stem}_ROI_{idx:04}{suffix}.tiff")
}

/// `decode` performs the full-resolution read (center clamp + level 0).
/// All drawing / decoding stays outside this module so the worker thread and
/// the CLI can share the exact same export semantics.
pub fn export_with<F, P>(
    rois: &[Roi],
    opts: &ExportOptions,
    mut decode: F,
    mut on_event: P,
) -> ExportReport
where
    F: FnMut(&Roi) -> Result<RgbImage>,
    P: FnMut(ExportEvent),
{
    let mut report = ExportReport::default();
    if let Err(e) = std::fs::create_dir_all(&opts.output_dir) {
        on_event(ExportEvent::FileDone {
            name: String::new(),
            result: Err(format!("创建输出目录失败: {e}")),
        });
        report.failed = rois.len() as u32;
        return report;
    }

    let sorted = sorted_for_export(rois);
    let total = sorted.len() as u32;
    let mut local_indices: HashMap<PathBuf, usize> = HashMap::new();

    for (i, roi) in sorted.iter().enumerate() {
        if opts.cancel.load(Ordering::Relaxed) {
            report.cancelled = true;
            break;
        }

        on_event(ExportEvent::Progress {
            current: (i + 1) as u32,
            total,
        });

        let idx = local_indices.entry(roi.slide_path.clone()).or_insert(0);
        let local = *idx;
        *idx += 1;

        let stem = roi
            .slide_path
            .file_stem()
            .map(|s| s.to_string_lossy().into_owned())
            .unwrap_or_else(|| "slide".into());
        let name = output_name(&stem, local, opts.mag_label.as_deref());
        let path = opts.output_dir.join(&name);

        let result = decode(roi)
            .and_then(|img| write_rgb_tiff(&path, &img))
            .map_err(|e| e.to_string());

        match &result {
            Ok(()) => report.ok += 1,
            Err(_) => report.failed += 1,
        }
        report.files.push((name.clone(), result.clone()));
        on_event(ExportEvent::FileDone { name, result });
    }

    on_event(ExportEvent::Finished {
        ok: report.ok,
        failed: report.failed,
        cancelled: report.cancelled,
    });
    report
}

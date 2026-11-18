//! Instrument files via `openreadout-qpcr` (MIT OR Apache-2.0).
//!
//! This is the ONLY module that references that crate. All external types
//! stay inside this file, so a crate upgrade only touches one place.

use std::path::Path;

use openreadout_qpcr::{qpcr_report, QpcrDataset, QpcrReportRequest, CQ_UNDETERMINED};

use crate::errors::{AppError, Result};
use crate::qpcr::model::Well;

/// Returns `(wells, format_id)`.
pub fn read_instrument(path: &Path) -> Result<(Vec<Well>, String)> {
    let ds = QpcrDataset::open(path)
        .map_err(|e| AppError::Qpcr(format!("无法解析仪器文件 {}: {e}", path.display())))?;
    let format = ds.format_id().to_string();
    // `QpcrReportRequest` is #[non_exhaustive]: always start from Default.
    // We only need the normalized records; the crate's own ΔΔCq / standard
    // curves are deliberately ignored so statistics have one single source.
    let req = QpcrReportRequest::default();
    let report = qpcr_report(&ds, &req)
        .map_err(|e| AppError::Qpcr(format!("读取仪器分析结果失败: {e}")))?;

    let mut wells = Vec::new();
    for (i, rec) in report.records.iter().enumerate() {
        let cq = if rec.cq_undetermined || rec.cq_status == CQ_UNDETERMINED {
            None
        } else {
            rec.cq
        };
        let mut w = Well::new(
            rec.sample.clone().unwrap_or_default(),
            rec.target.clone().unwrap_or_default(),
            cq,
        );
        w.plate = rec.run.clone();
        w.well_position = Some(rec.well.clone());
        w.row = Some(rec.row);
        w.col = Some(rec.col);
        w.replicate_group = format!(
            "{}|{}|{}",
            w.plate, w.sample_id, w.target_id
        );
        w.id = format!("{}|{}", w.replicate_group, rec.well);
        w.task = rec.task.clone();
        w.dye = rec.dye.clone();
        w.source_row = i + 1;
        w.excluded = rec.excluded.is_some();
        for f in &rec.flags {
            w.flag(f);
        }
        if cq.is_none() {
            w.flag("Undetermined");
        }
        if w.excluded {
            w.flag("ExcludedBySource");
        }
        wells.push(w);
    }
    Ok((wells, format))
}

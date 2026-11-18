//! Result-table CSV export (first version: CSV only; no Excel writer).

use std::path::Path;

use crate::errors::Result;
use crate::qpcr::model::QpcrAnalysis;

pub fn write_csv(path: &Path, analysis: &QpcrAnalysis) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let mut wtr = csv::Writer::from_path(path)?;
    wtr.write_record([
        "sample_id",
        "target_id",
        "group",
        "mean_cq",
        "n_tech",
        "cv",
        "delta_ct",
        "delta_delta_ct",
        "fold_change",
        "efficiency",
        "flags",
    ])?;
    let fmt = |v: Option<f64>| v.map(|x| format!("{x:.6}")).unwrap_or_default();
    for r in &analysis.results {
        wtr.write_record([
            r.sample_id.as_str(),
            r.target_id.as_str(),
            r.group.as_deref().unwrap_or(""),
            &fmt(r.mean_cq),
            &r.n_tech.to_string(),
            &fmt(r.cv),
            &fmt(r.delta_ct),
            &fmt(r.delta_delta_ct),
            &fmt(r.fold_change),
            &fmt(r.efficiency),
            &r.flags
                .iter()
                .map(|f| f.as_str())
                .collect::<Vec<_>>()
                .join(";"),
        ])?;
    }
    wtr.flush()?;
    Ok(())
}

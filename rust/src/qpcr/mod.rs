//! qPCR data-processing module.
//!
//! Formula sources (formulas only — no source code was copied):
//! - qPCRtools (R, MIT, CRAN): 2^-ΔΔCt, Pfaffl efficiency, outlier handling.
//! - tidyqpcr (R, Apache-2.0, rOpenSci): tidy `sample_id`/`target_id`/`cq`
//!   data model and MIQE naming.
//! - geNorm (Vandesompele et al.): reference-gene stability `M`.
//!
//! All GPL/LGPL projects were used only as reading material for formulas.
//! Instrument files are parsed by `openreadout-qpcr` (MIT OR Apache-2.0).

pub mod delta_ct;
pub mod export_io;
pub mod io_csv;
pub mod io_excel;
pub mod io_instrument;
pub mod io_manual;
pub mod model;
pub mod normalize;
pub mod qc;
pub mod refgene;
pub mod session;
pub mod stats;

pub use delta_ct::{delta_delta_ct, delta_ct, fold_change, pfaffl_ratio};
pub use model::{Design, QpcrAnalysis, QpcrResult, QpcrRun, RefStrategy, Well};
pub use qc::effective_cq;
pub use refgene::geometric_mean_ref;
pub use stats::{one_way_anova, welch_t_test};

use crate::errors::Result;

/// Run QC → reference-gene normalization → ΔΔCt → statistics.
/// Pure computation; no GUI, file or DLL access.
pub fn analyze(run: &QpcrRun) -> Result<QpcrAnalysis> {
    let mut warnings = Vec::new();
    let mut wells = run.wells.clone();
    qc::apply_all(&mut wells, &run.design, &mut warnings);

    let ref_stability = if run.design.reference_targets.len() > 1 {
        refgene::genorm_m(&wells, &run.design.reference_targets, &mut warnings)
    } else {
        Vec::new()
    };
    let ref_used = match run.design.ref_strategy {
        RefStrategy::Genorm if ref_stability.len() > 2 => ref_stability
            .iter()
            .rev()
            .take(ref_stability.len().min(ref_stability.len() - 1))
            .map(|(name, _)| name.clone())
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect(),
        _ => run.design.reference_targets.clone(),
    };

    let results = delta_ct::analyze_wells(run, &wells, &ref_used, &mut warnings);
    Ok(QpcrAnalysis {
        results,
        ref_stability,
        ref_used,
        warnings,
    })
}

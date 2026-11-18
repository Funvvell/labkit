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
        // geNorm: `ref_stability` is ascending in M (smaller = more stable),
        // so stepwise exclusion drops the LAST entry (largest M), keeping the
        // most stable `len - 1` references.
        RefStrategy::Genorm if ref_stability.len() > 2 => ref_stability
            .iter()
            .take(ref_stability.len() - 1)
            .map(|(name, _)| name.clone())
            .collect(),
        _ => run.design.reference_targets.clone(),
    };

    let results = delta_ct::analyze_wells(run, &wells, &ref_used, &mut warnings);
    let stats = group_stats(&results, &run.design.sample_groups);
    Ok(QpcrAnalysis {
        results,
        ref_stability,
        ref_used,
        warnings,
        stats,
    })
}

/// Welch t-test (2 groups) / one-way ANOVA (>=3 groups) on per-sample ΔCt,
/// using the explicit `sample_groups` mapping. Groups need >=2 samples.
fn group_stats(
    results: &[QpcrResult],
    sample_groups: &std::collections::BTreeMap<String, String>,
) -> Vec<model::GroupStat> {
    use std::collections::BTreeMap;

    let mut names: Vec<String> = sample_groups.values().cloned().collect();
    names.sort();
    names.dedup();
    if names.len() < 2 {
        return Vec::new();
    }
    let mut targets: Vec<String> = results.iter().map(|r| r.target_id.clone()).collect();
    targets.sort();
    targets.dedup();

    let mut out = Vec::new();
    for t in targets {
        let mut by_group: BTreeMap<String, Vec<f64>> = BTreeMap::new();
        for r in results.iter().filter(|r| r.target_id == t) {
            if let (Some(g), Some(d)) = (sample_groups.get(&r.sample_id), r.delta_ct) {
                by_group.entry(g.clone()).or_default().push(d);
            }
        }
        let present: Vec<String> = names
            .iter()
            .filter(|g| by_group.get(*g).map(|v| v.len()).unwrap_or(0) >= 2)
            .cloned()
            .collect();
        if present.len() < 2 {
            continue;
        }
        if present.len() == 2 {
            if let Some(tt) = stats::welch_t_test(&by_group[&present[0]], &by_group[&present[1]]) {
                out.push(model::GroupStat {
                    target_id: t.clone(),
                    method: "Welch t-test".into(),
                    groups: present.clone(),
                    statistic: tt.t,
                    p: tt.p_two_sided,
                    detail: format!(
                        "t={:.3}, df={:.1}, Cohen's d={:.3}, {}",
                        tt.t,
                        tt.df,
                        tt.cohens_d,
                        stats::significance(tt.p_two_sided)
                    ),
                });
            }
        } else {
            let slices: Vec<&[f64]> = present.iter().map(|g| by_group[g].as_slice()).collect();
            if let Some(a) = stats::one_way_anova(&slices) {
                out.push(model::GroupStat {
                    target_id: t.clone(),
                    method: "one-way ANOVA".into(),
                    groups: present.clone(),
                    statistic: a.f,
                    p: a.p,
                    detail: format!(
                        "F({:.0},{:.0})={:.3}, η²={:.3}, {}",
                        a.df1,
                        a.df2,
                        a.f,
                        a.eta_squared,
                        stats::significance(a.p)
                    ),
                });
            }
        }
    }
    out
}

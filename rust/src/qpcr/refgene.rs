//! Reference-gene stability (geNorm) and geometric-mean normalization.

use std::collections::BTreeMap;

use crate::qpcr::model::Well;

/// Mean Cq per (target, sample) from wells that pass QC.
fn per_sample_means(wells: &[Well], targets: &[String]) -> BTreeMap<String, Vec<f64>> {
    let mut out: BTreeMap<String, Vec<f64>> = BTreeMap::new();
    for t in targets {
        out.insert(t.clone(), Vec::new());
    }
    let mut grouped: BTreeMap<(String, String), Vec<f64>> = BTreeMap::new();
    for w in wells {
        if !targets.contains(&w.target_id) {
            continue;
        }
        if let Some(cq) = super::qc::effective_cq(w) {
            grouped
                .entry((w.target_id.clone(), w.sample_id.clone()))
                .or_default()
                .push(cq);
        }
    }
    for ((target, _), vals) in grouped {
        let m = vals.iter().sum::<f64>() / vals.len() as f64;
        if let Some(v) = out.get_mut(&target) {
            v.push(m);
        }
    }
    out
}

/// geNorm M: for each reference j, `M_j = mean_k sd_i( -(Cq_ij - Cq_ik) )`.
/// Returns `(target, M)` sorted ascending (smaller = more stable).
pub fn genorm_m(
    wells: &[Well],
    targets: &[String],
    warnings: &mut Vec<String>,
) -> Vec<(String, f64)> {
    let means = per_sample_means(wells, targets);
    let mut out = Vec::new();
    for (j, cq_j) in &means {
        if cq_j.len() < 2 {
            warnings.push(format!("内参 {j} 的有效样本不足 2 个，M 记为无穷大"));
            out.push((j.clone(), f64::INFINITY));
            continue;
        }
        let mut m_sum = 0.0;
        let mut pairs = 0usize;
        for (k, cq_k) in &means {
            if j == k || cq_k.len() != cq_j.len() {
                continue;
            }
            let diffs: Vec<f64> = cq_j
                .iter()
                .zip(cq_k.iter())
                .map(|(a, b)| -(a - b))
                .collect();
            if let Some((_, sd)) = super::stats::mean_sd(&diffs) {
                m_sum += sd;
                pairs += 1;
            }
        }
        out.push((j.clone(), if pairs > 0 { m_sum / pairs as f64 } else { f64::INFINITY }));
    }
    out.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
    out
}

/// Relative quantity for each reference, then geometric mean per sample.
/// `e` = 1 + efficiency (2.0 for ideal 100% efficiency).
pub fn geometric_mean_ref(per_ref_cq: &BTreeMap<String, Vec<f64>>, e: f64) -> Vec<f64> {
    if per_ref_cq.is_empty() {
        return Vec::new();
    }
    let n = per_ref_cq.values().map(|v| v.len()).min().unwrap_or(0);
    if n == 0 {
        return Vec::new();
    }
    (0..n)
        .map(|i| {
            let logs: Vec<f64> = per_ref_cq
                .values()
                .filter_map(|v| v.get(i))
                .map(|cq| -(cq * e.ln()))
                .collect();
            if logs.is_empty() {
                f64::NAN
            } else {
                (logs.iter().sum::<f64>() / logs.len() as f64).exp()
            }
        })
        .collect()
}

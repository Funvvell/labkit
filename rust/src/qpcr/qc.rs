//! Quality control: technical-replicate CV/SD/IQR flags.
//! Wells are never removed — only flagged — so the audit trail is preserved.

use std::collections::BTreeMap;

use crate::qpcr::model::{Design, Well};

pub fn group_stats(cqs: &[f64]) -> Option<(f64, f64, f64)> {
    let (mean, sd) = super::stats::mean_sd(cqs)?;
    if mean == 0.0 {
        return None;
    }
    Some((mean, sd, sd / mean))
}

fn quantile(sorted: &[f64], p: f64) -> f64 {
    if sorted.is_empty() {
        return f64::NAN;
    }
    let h = (sorted.len() - 1) as f64 * p;
    let lo = h.floor() as usize;
    let hi = (lo + 1).min(sorted.len() - 1);
    let g = h - lo as f64;
    sorted[lo] * (1.0 - g) + sorted[hi] * g
}

fn flag_group(wells: &mut [Well], indices: &[usize], design: &Design, warnings: &mut Vec<String>) {
    let values: Vec<(usize, f64)> = indices
        .iter()
        .filter_map(|&i| wells[i].cq.filter(|_| !wells[i].excluded).map(|v| (i, v)))
        .collect();
    if values.len() < 2 {
        return;
    }
    let nums: Vec<f64> = values.iter().map(|(_, v)| *v).collect();
    let Some((_, sd, cv)) = group_stats(&nums) else {
        return;
    };

    if cv > design.cv_threshold {
        for (i, _) in &values {
            wells[*i].flag("HighCv");
        }
        warnings.push(format!(
            "{}: CV={cv:.3} 超过阈值 {:.3}",
            wells[values[0].0].replicate_group, design.cv_threshold
        ));
    }
    if let Some(thr) = design.sd_threshold {
        if sd > thr {
            for (i, _) in &values {
                wells[*i].flag("HighSd");
            }
            warnings.push(format!(
                "{}: SD={sd:.3} 超过阈值 {thr:.3}",
                wells[values[0].0].replicate_group
            ));
        }
    }

    if values.len() >= 4 {
        let mut sorted = nums.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let q1 = quantile(&sorted, 0.25);
        let q3 = quantile(&sorted, 0.75);
        let iqr = q3 - q1;
        if iqr > 0.0 {
            let low = q1 - 1.5 * iqr;
            let high = q3 + 1.5 * iqr;
            for (i, v) in &values {
                if *v < low || *v > high {
                    wells[*i].flag("Outlier");
                }
            }
        }
    }
}

pub fn apply_all(wells: &mut [Well], design: &Design, warnings: &mut Vec<String>) {
    let mut groups: BTreeMap<String, Vec<usize>> = BTreeMap::new();
    for (i, w) in wells.iter().enumerate() {
        groups
            .entry(w.replicate_group.clone())
            .or_default()
            .push(i);
    }
    for indices in groups.values() {
        flag_group(wells, indices, design, warnings);
    }
}

/// A well contributes only if it has a valid Cq and no disqualifying flag.
pub fn effective_cq(w: &Well) -> Option<f64> {
    if w.excluded || w.cq.is_none() {
        return None;
    }
    let blocked = ["Undetermined", "HighCv", "HighSd", "Outlier", "ExcludedByUser", "ExcludedBySource"];
    if w.flags.iter().any(|f| blocked.contains(&f.as_str())) {
        return None;
    }
    w.cq
}

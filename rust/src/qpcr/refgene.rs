//! Reference-gene stability (geNorm) and geometric-mean normalization.

use std::collections::BTreeMap;

use crate::qpcr::model::Well;

/// Mean Cq per (target, sample) from wells that pass QC, keyed by sample id
/// so pairing across targets stays correct when sample sets differ.
fn per_sample_means(
    wells: &[Well],
    targets: &[String],
) -> BTreeMap<String, BTreeMap<String, f64>> {
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
    let mut out: BTreeMap<String, BTreeMap<String, f64>> = BTreeMap::new();
    for t in targets {
        out.insert(t.clone(), BTreeMap::new());
    }
    for ((target, sample), vals) in grouped {
        let m = vals.iter().sum::<f64>() / vals.len() as f64;
        if let Some(v) = out.get_mut(&target) {
            v.insert(sample, m);
        }
    }
    out
}

/// geNorm M: for each reference j, `M_j = mean_k sd_i( -(Cq_ij - Cq_ik) )`.
/// Pairs are matched by sample id (only shared samples contribute).
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
            if j == k {
                continue;
            }
            let diffs: Vec<f64> = cq_j
                .iter()
                .filter_map(|(s, a)| cq_k.get(s).map(|b| -(a - b)))
                .collect();
            if diffs.len() < 2 {
                continue;
            }
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

/// geNorm 逐步剔除 + 配对变异 V 的完整结果。
#[derive(Debug, Clone, Default, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct GenormDetail {
    /// 逐步剔除顺序（最差先剔）。
    pub exclusion_order: Vec<String>,
    /// 稳定度从好到差的完整排名（best → worst）。
    pub ranked: Vec<String>,
    /// (n, Vn/n+1)：n 个最稳定内参相对 n+1 个的配对变异，n 从 2 起。
    pub pairwise_v: Vec<(usize, f64)>,
    /// 推荐内参数：首个 V < 0.15 的 n；若全都 ≥ 0.15 则为全部并给警告。
    pub recommended_n: usize,
}

/// 逐样本对齐的相对表达量 Q_ij = E_j^{-(Cq_ij - min_i Cq_j)}。
/// 只取所有选定内参共有的样本，保证跨基因配对正确。
fn aligned_relative_q(
    wells: &[Well],
    targets: &[String],
    eff: &BTreeMap<String, f64>,
) -> (Vec<String>, BTreeMap<String, Vec<f64>>) {
    use std::collections::BTreeSet;
    let means = per_sample_means(wells, targets);
    let mut common: Option<BTreeSet<String>> = None;
    for t in targets {
        let s: BTreeSet<String> = means.get(t).map(|m| m.keys().cloned().collect()).unwrap_or_default();
        common = Some(match common {
            None => s,
            Some(c) => c.intersection(&s).cloned().collect(),
        });
    }
    let samples: Vec<String> = common.unwrap_or_default().into_iter().collect();
    let mut out = BTreeMap::new();
    for t in targets {
        let e = 1.0 + eff.get(t).copied().unwrap_or(1.0);
        let min = samples
            .iter()
            .filter_map(|s| means.get(t).and_then(|m| m.get(s)).copied())
            .fold(f64::INFINITY, f64::min);
        let q: Vec<f64> = samples
            .iter()
            .map(|s| {
                let cq = means.get(t).and_then(|m| m.get(s)).copied().unwrap_or(f64::NAN);
                e.powf(-(cq - min))
            })
            .collect();
        out.insert(t.clone(), q);
    }
    (samples, out)
}

/// NF：选定内参相对表达量的逐样本几何均值。
pub fn normalization_factor(per_ref_q: &BTreeMap<String, Vec<f64>>) -> Vec<f64> {
    let n = per_ref_q.values().map(|v| v.len()).min().unwrap_or(0);
    (0..n)
        .map(|i| {
            let logs: Vec<f64> = per_ref_q
                .values()
                .filter_map(|v| v.get(i).copied())
                .filter(|q| q.is_finite() && *q > 0.0)
                .map(|q| q.ln())
                .collect();
            if logs.is_empty() || logs.len() != per_ref_q.len() {
                f64::NAN
            } else {
                (logs.iter().sum::<f64>() / logs.len() as f64).exp()
            }
        })
        .collect()
}

/// 完整 geNorm：逐步剔除最差内参并重算 M，直到剩 2 个；再算配对变异 Vn/n+1，
/// 以首个 V < 0.15 的 n 作为推荐内参数（Vandesompele et al. 2002）。
pub fn genorm_stepwise(
    wells: &[Well],
    targets: &[String],
    eff: &BTreeMap<String, f64>,
    warnings: &mut Vec<String>,
) -> GenormDetail {
    let mut detail = GenormDetail::default();
    if targets.len() < 2 {
        detail.ranked = targets.to_vec();
        detail.recommended_n = targets.len();
        return detail;
    }
    let mut current: Vec<String> = targets.to_vec();
    while current.len() > 2 {
        let m = genorm_m(wells, &current, warnings);
        let worst = m.last().map(|(n, _)| n.clone()).unwrap_or_default();
        detail.exclusion_order.push(worst.clone());
        current.retain(|t| t != &worst);
    }
    let final_m = genorm_m(wells, &current, warnings);
    let mut ranked: Vec<String> = final_m.iter().map(|(n, _)| n.clone()).collect();
    ranked.extend(detail.exclusion_order.iter().rev().cloned());
    detail.ranked = ranked.clone();

    let (samples, q) = aligned_relative_q(wells, &ranked, eff);
    let nf: Vec<Vec<f64>> = (2..=ranked.len())
        .map(|n| {
            let sub: BTreeMap<String, Vec<f64>> = ranked[..n]
                .iter()
                .filter_map(|t| q.get(t).map(|v| (t.clone(), v.clone())))
                .collect();
            normalization_factor(&sub)
        })
        .collect();
    for idx in 0..nf.len().saturating_sub(1) {
        let n = idx + 2;
        let ratios: Vec<f64> = samples
            .iter()
            .enumerate()
            .filter_map(|(i, _)| {
                let a = nf[idx].get(i).copied()?;
                let b = nf[idx + 1].get(i).copied()?;
                if a.is_finite() && b.is_finite() && a > 0.0 && b > 0.0 {
                    Some((a / b).log2())
                } else {
                    None
                }
            })
            .collect();
        let v = super::stats::mean_sd(&ratios).map(|(_, sd)| sd).unwrap_or(f64::NAN);
        detail.pairwise_v.push((n, v));
    }
    detail.recommended_n = detail
        .pairwise_v
        .iter()
        .find(|(_, v)| v.is_finite() && *v < 0.15)
        .map(|(n, _)| *n)
        .unwrap_or(ranked.len());
    if detail.recommended_n == ranked.len() && ranked.len() > 2 {
        warnings.push("所有 Vn/n+1 均 ≥ 0.15，建议增加内参基因数量".into());
    }
    detail
}

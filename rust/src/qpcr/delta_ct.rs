//! ΔCt / ΔΔCt / fold-change (Livak) and Pfaffl ratio with efficiencies.
//! Formula sources: qPCRtools (MIT) and the standard Livak/Pfaffl methods.

use std::collections::BTreeMap;

use crate::qpcr::model::{QcFlag, QpcrResult, QpcrRun, Well};
use crate::qpcr::qc;

pub fn mean_cq(wells: &[&Well]) -> Option<f64> {
    let vals: Vec<f64> = wells.iter().filter_map(|w| qc::effective_cq(w)).collect();
    if vals.is_empty() {
        return None;
    }
    Some(vals.iter().sum::<f64>() / vals.len() as f64)
}

pub fn delta_ct(target_mean: f64, reference_mean: f64) -> f64 {
    target_mean - reference_mean
}

pub fn delta_delta_ct(sample_dct: f64, calibrator_dct: f64) -> f64 {
    sample_dct - calibrator_dct
}

pub fn fold_change(ddct: f64) -> f64 {
    2.0_f64.powf(-ddct)
}

/// `e` is 1 + efficiency (2.0 for a perfect assay). `dct_target_ctrl` and
/// `dct_ref_ctrl` are `ΔCt(calibrator) − ΔCt(sample)`.
pub fn pfaffl_ratio(e_target: f64, dct_target_ctrl: f64, e_ref: f64, dct_ref_ctrl: f64) -> f64 {
    e_target.powf(dct_target_ctrl) / e_ref.powf(dct_ref_ctrl)
}

fn to_qc_flags(group: &[&Well], cv: Option<f64>, no_ref: bool, no_cal: bool) -> Vec<QcFlag> {
    let mut out = Vec::new();
    for w in group {
        for tag in &w.flags {
            let flag = match tag.as_str() {
                "Undetermined" => QcFlag::Undetermined,
                "HighCv" => QcFlag::HighCv(cv.unwrap_or(0.0)),
                "HighSd" => QcFlag::HighSd(0.0),
                "Outlier" => QcFlag::Outlier,
                "ExcludedByUser" => QcFlag::ExcludedByUser,
                "ExcludedBySource" => QcFlag::ExcludedBySource,
                _ => continue,
            };
            if !out.contains(&flag) {
                out.push(flag);
            }
        }
    }
    if no_ref {
        out.push(QcFlag::NoReference);
    }
    if no_cal {
        out.push(QcFlag::NoCalibrator);
    }
    out
}

pub fn analyze_wells(
    run: &QpcrRun,
    wells: &[Well],
    ref_used: &[String],
    warnings: &mut Vec<String>,
) -> Vec<QpcrResult> {
    let mut groups: BTreeMap<(String, String), Vec<&Well>> = BTreeMap::new();
    for w in wells {
        if w.sample_id.is_empty() || w.target_id.is_empty() {
            continue;
        }
        groups
            .entry((w.sample_id.clone(), w.target_id.clone()))
            .or_default()
            .push(w);
    }

    let mut means: BTreeMap<(String, String), (f64, usize, Option<f64>)> = BTreeMap::new();
    for ((sample, target), group) in &groups {
        let vals: Vec<f64> = group.iter().filter_map(|w| qc::effective_cq(w)).collect();
        let n = vals.len();
        if n == 0 {
            continue;
        }
        let m = vals.iter().sum::<f64>() / n as f64;
        let (_, sd) = super::stats::mean_sd(&vals).map(|(m, s)| (m, s)).unwrap_or((m, 0.0));
        let cv = if m != 0.0 { Some(sd / m) } else { None };
        means.insert((sample.clone(), target.clone()), (m, n, cv));
    }

    let samples: Vec<String> = {
        let mut v: Vec<String> = groups.keys().map(|(s, _)| s.clone()).collect();
        v.sort();
        v.dedup();
        v
    };
    let targets: Vec<String> = if run.design.target_ids.is_empty() {
        let mut v: Vec<String> = groups
            .keys()
            .map(|(_, t)| t.clone())
            .filter(|t| !ref_used.contains(t))
            .collect();
        v.sort();
        v.dedup();
        v
    } else {
        run.design.target_ids.clone()
    };

    // Reference mean Cq for a sample (geometric mean of quantities == arithmetic
    // mean Cq when all amplicons share the same efficiency).
    let ref_mean = |sample: &str| -> Option<f64> {
        let vals: Vec<f64> = ref_used
            .iter()
            .filter_map(|rt| means.get(&(sample.to_string(), rt.clone())).map(|v| v.0))
            .collect();
        if vals.is_empty() {
            None
        } else {
            Some(vals.iter().sum::<f64>() / vals.len() as f64)
        }
    };

    let calibrator = run.design.calibrator_sample.as_deref();
    if calibrator.is_none() {
        warnings.push("未设置校准样本（calibrator），ΔΔCt 与 Fold Change 不可用".into());
    }

    let mut results = Vec::new();
    for sample in &samples {
        let s_ref = ref_mean(sample);
        for target in &targets {
            let Some(&(t_mean, n, cv)) = means.get(&(sample.clone(), target.clone())) else {
                continue;
            };
            let Some(r_mean) = s_ref else {
                results.push(QpcrResult {
                    sample_id: sample.clone(),
                    target_id: target.clone(),
                    group: run.design.sample_groups.get(sample).cloned(),
                    mean_cq: Some(t_mean),
                    n_tech: n,
                    cv,
                    delta_ct: None,
                    delta_delta_ct: None,
                    fold_change: None,
                    efficiency: run.design.efficiency.get(target).copied(),
                    flags: to_qc_flags(
                        groups.get(&(sample.clone(), target.clone())).map(|v| v.as_slice()).unwrap_or(&[]),
                        cv,
                        true,
                        calibrator.is_none(),
                    ),
                });
                continue;
            };
            let dct = delta_ct(t_mean, r_mean);
            let mut ddct = None;
            let mut fc = None;
            if let Some(cal) = calibrator {
                if let (Some(cal_t), Some(cal_r)) = (
                    means.get(&(cal.to_string(), target.clone())).map(|v| v.0),
                    ref_mean(cal),
                ) {
                    let cal_dct = delta_ct(cal_t, cal_r);
                    let d = delta_delta_ct(dct, cal_dct);
                    ddct = Some(d);
                    fc = Some(match run.design.efficiency.get(target) {
                        Some(&e) if (e - 1.0).abs() > 1e-9 => {
                            let e_ref = run
                                .design
                                .efficiency
                                .get(ref_used.first().map(String::as_str).unwrap_or(""))
                                .copied()
                                .unwrap_or(1.0);
                            pfaffl_ratio(1.0 + e, cal_dct - dct, 1.0 + e_ref, cal_r - r_mean)
                        }
                        _ => fold_change(d),
                    });
                }
            }
            results.push(QpcrResult {
                sample_id: sample.clone(),
                target_id: target.clone(),
                group: run.design.sample_groups.get(sample).cloned(),
                mean_cq: Some(t_mean),
                n_tech: n,
                cv,
                delta_ct: Some(dct),
                delta_delta_ct: ddct,
                fold_change: fc,
                efficiency: run.design.efficiency.get(target).copied(),
                flags: to_qc_flags(
                    groups.get(&(sample.clone(), target.clone())).map(|v| v.as_slice()).unwrap_or(&[]),
                    cv,
                    false,
                    ddct.is_none(),
                ),
            });
        }
    }
    results
}

//! geNorm 逐步剔除 + 配对变异 V + 推荐内参数，以及多参照 Pfaffl 按基因效率的数值回归。

use std::collections::BTreeMap;

use labkit::qpcr::model::{Design, QpcrRun, RefStrategy, Well};
use labkit::qpcr::refgene::genorm_stepwise;

fn unstable_wells() -> Vec<Well> {
    let mut w = Vec::new();
    for (s, gapdh, actb, r18s) in [
        ("S1", 18.0, 20.0, 21.0),
        ("S2", 18.0, 22.0, 21.0),
        ("S3", 18.0, 18.0, 21.0),
    ] {
        w.push(Well::new(s.into(), "GAPDH".into(), Some(gapdh)));
        w.push(Well::new(s.into(), "18S".into(), Some(r18s)));
        w.push(Well::new(s.into(), "ACTB".into(), Some(actb)));
    }
    w
}

fn stable_wells() -> Vec<Well> {
    let mut w = Vec::new();
    for s in ["S1", "S2", "S3"] {
        w.push(Well::new(s.into(), "GAPDH".into(), Some(18.0)));
        w.push(Well::new(s.into(), "18S".into(), Some(21.0)));
        w.push(Well::new(s.into(), "ACTB".into(), Some(20.0)));
    }
    w
}

const REFS: [&str; 3] = ["GAPDH", "18S", "ACTB"];

#[test]
fn stepwise_excludes_worst_and_reports_pairwise_v() {
    let targets: Vec<String> = REFS.iter().map(|s| s.to_string()).collect();
    let mut warnings = Vec::new();
    let d = genorm_stepwise(&unstable_wells(), &targets, &BTreeMap::new(), &mut warnings);
    assert_eq!(d.exclusion_order, vec!["ACTB".to_string()], "应逐步剔除最不稳定的 ACTB");
    assert_eq!(d.ranked.len(), 3);
    assert_eq!(d.ranked.last().unwrap(), "ACTB", "排名最差者应在末位");
    assert_eq!(d.pairwise_v.len(), 1, "3 个内参应有一个 V2/3");
    assert_eq!(d.pairwise_v[0].0, 2);
    assert!(d.pairwise_v[0].1 >= 0.15, "引入不稳定 ACTB 的 V2/3 应较大: {:?}", d.pairwise_v);
    assert_eq!(d.recommended_n, 3, "V 均 ≥0.15 时回退到全部并警告");
    assert!(warnings.iter().any(|w| w.contains("增加内参")), "应提示增加内参: {warnings:?}");
}

#[test]
fn all_stable_references_recommend_two_with_near_zero_v() {
    let targets: Vec<String> = REFS.iter().map(|s| s.to_string()).collect();
    let mut warnings = Vec::new();
    let d = genorm_stepwise(&stable_wells(), &targets, &BTreeMap::new(), &mut warnings);
    assert_eq!(d.pairwise_v.len(), 1);
    assert!(d.pairwise_v[0].1.abs() < 1e-9, "全稳定时 V 应≈0: {:?}", d.pairwise_v);
    assert_eq!(d.recommended_n, 2, "V<0.15 应推荐 2 个内参");
}

#[test]
fn pfaffl_multi_ref_uses_each_reference_own_efficiency() {
    let wells = vec![
        Well::new("S1".into(), "T".into(), Some(20.0)),
        Well::new("S1".into(), "R1".into(), Some(18.0)),
        Well::new("S1".into(), "R2".into(), Some(22.0)),
        Well::new("S2".into(), "T".into(), Some(21.0)),
        Well::new("S2".into(), "R1".into(), Some(19.0)),
        Well::new("S2".into(), "R2".into(), Some(23.0)),
    ];
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("S1".into()),
        reference_targets: vec!["R1".into(), "R2".into()],
        target_ids: vec!["T".into()],
        ref_strategy: RefStrategy::GeometricMean,
        efficiency: BTreeMap::from([
            ("T".to_string(), 0.9),
            ("R1".to_string(), 1.0),
            ("R2".to_string(), 0.8),
        ]),
        ..Default::default()
    };
    let a = labkit::qpcr::analyze(&run).unwrap();
    let r = a.results.iter().find(|r| r.sample_id == "S2" && r.target_id == "T").unwrap();
    let fc = r.fold_change.expect("应有 fold change");
    // 独立公式：分子 E_T^(cal−sample)；分母 = 各内参自身效率项的几何均值。
    let expected = 1.9f64.powi(-1) / (0.5f64 * (1.0f64 / 1.8f64)).sqrt();
    assert!((fc - expected).abs() < 1e-9, "fc={fc} expected={expected}");
    // 旧实现套用首个内参效率会得 1.9^-1/0.5，必须不再等于它。
    let old_wrong = 1.9f64.powi(-1) / 0.5;
    assert!((fc - old_wrong).abs() > 1e-3, "不应再套用首个内参效率");
}

#[test]
fn pfaffl_missing_reference_efficiency_warns() {
    let wells = vec![
        Well::new("S1".into(), "T".into(), Some(20.0)),
        Well::new("S1".into(), "R1".into(), Some(18.0)),
        Well::new("S2".into(), "T".into(), Some(21.0)),
        Well::new("S2".into(), "R1".into(), Some(19.0)),
    ];
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("S1".into()),
        reference_targets: vec!["R1".into()],
        target_ids: vec!["T".into()],
        efficiency: BTreeMap::from([("T".to_string(), 0.9)]),
        ..Default::default()
    };
    let a = labkit::qpcr::analyze(&run).unwrap();
    assert!(
        a.warnings.iter().any(|w| w.contains("未声明效率")),
        "缺内参效率必须警告而非静默: {:?}",
        a.warnings
    );
}
//! Regressions for the whole-project review fixes:
//! geNorm exclusion direction, reference/target separation, Pfaffl exponents,
//! sample-id-aligned geNorm pairing, and group-statistics wiring.

use std::collections::BTreeMap;

use pathology_crop_rs::qpcr::model::{Design, QpcrRun, RefStrategy, Well};
use pathology_crop_rs::qpcr::{self, refgene, stats};

fn well(sample: &str, target: &str, cq: f64) -> Well {
    Well::new(sample.into(), target.into(), Some(cq))
}

#[test]
fn genorm_strategy_drops_least_stable_reference() {
    let mut wells = Vec::new();
    for (s, gapdh, actb, r18s, gene) in [
        ("S1", 18.0, 20.0, 21.0, 25.0),
        ("S2", 18.0, 22.0, 21.0, 26.0),
        ("S3", 18.0, 18.0, 21.0, 24.0),
    ] {
        wells.push(well(s, "GAPDH", gapdh));
        wells.push(well(s, "ACTB", actb));
        wells.push(well(s, "18S", r18s));
        wells.push(well(s, "GeneX", gene));
    }
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("S1".into()),
        reference_targets: vec!["GAPDH".into(), "18S".into(), "ACTB".into()],
        target_ids: vec!["GeneX".into()],
        ref_strategy: RefStrategy::Genorm,
        ..Design::default()
    };
    let a = qpcr::analyze(&run).unwrap();
    assert!(a.ref_used.contains(&"GAPDH".to_string()));
    assert!(a.ref_used.contains(&"18S".to_string()));
    assert!(
        !a.ref_used.contains(&"ACTB".to_string()),
        "geNorm 应剔除最不稳定的 ACTB，实际 ref_used={:?}",
        a.ref_used
    );
}

#[test]
fn explicit_target_list_excludes_references() {
    let mut wells = Vec::new();
    for (sample, gapdh, target) in [("Cal", 18.0, 20.0), ("Treated", 18.0, 19.0)] {
        wells.push(well(sample, "GAPDH", gapdh));
        wells.push(well(sample, "Target", target));
    }
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("Cal".into()),
        reference_targets: vec!["GAPDH".into()],
        // The GUI passes every detected gene here, references included.
        target_ids: vec!["Target".into(), "GAPDH".into()],
        ..Design::default()
    };
    let a = qpcr::analyze(&run).unwrap();
    assert!(!a.results.is_empty());
    assert!(
        a.results.iter().all(|r| r.target_id == "Target"),
        "内参不得作为靶基因输出: {:?}",
        a.results.iter().map(|r| &r.target_id).collect::<Vec<_>>()
    );
    assert!(a.stats.is_empty(), "未配置分组时不应产生统计结果");
}

#[test]
fn pfaffl_uses_per_gene_delta_ct() {
    // Reference Cq differs between calibrator and sample (Δr = -0.5), so the
    // old `cal_dct - dct` numerator exponent produced a wrong ratio.
    let wells = vec![
        well("Cal", "Target", 25.0),
        well("Cal", "Ref", 20.0),
        well("S", "Target", 24.0),
        well("S", "Ref", 20.5),
    ];
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("Cal".into()),
        reference_targets: vec!["Ref".into()],
        target_ids: vec!["Target".into()],
        efficiency: BTreeMap::from([("Target".to_string(), 0.9)]),
        ..Design::default()
    };
    let a = qpcr::analyze(&run).unwrap();
    let s = a.results.iter().find(|r| r.sample_id == "S").unwrap();
    // E_t = 1.9, ΔCt_target(Cal−S) = 1; E_ref defaults to 2.0, ΔCt_ref(Cal−S) = −0.5.
    let expected = 1.9_f64.powf(1.0) / 2.0_f64.powf(-0.5);
    assert!(
        (s.fold_change.unwrap() - expected).abs() < 1e-9,
        "Pfaffl 期望 {expected}，实际 {:?}",
        s.fold_change
    );
    let cal = a.results.iter().find(|r| r.sample_id == "Cal").unwrap();
    assert!((cal.fold_change.unwrap() - 1.0).abs() < 1e-9);
}

#[test]
fn genorm_pairs_by_sample_id_not_position() {
    // A covers {S1,S2}, B covers {S1,S3}: equal lengths but different sample
    // sets. Only S1 is shared, so no valid pair exists and M must be infinite
    // (the old positional zip paired S2 with S3 and produced a finite M).
    let wells = vec![
        well("S1", "A", 10.0),
        well("S2", "A", 100.0),
        well("S1", "B", 12.0),
        well("S3", "B", 0.0),
    ];
    let mut warnings = Vec::new();
    let m = refgene::genorm_m(&wells, &["A".into(), "B".into()], &mut warnings);
    assert!(
        m.iter().all(|(_, v)| v.is_infinite()),
        "共享样本不足 2 个时 M 应为无穷大: {m:?}"
    );
}

#[test]
fn analyze_emits_welch_stats_for_two_groups() {
    let mut wells = Vec::new();
    for (s, tcq) in [("C1", 24.0), ("C2", 24.2), ("T1", 23.0), ("T2", 23.1)] {
        wells.push(well(s, "Ref", 20.0));
        wells.push(well(s, "Gene", tcq));
    }
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("C1".into()),
        reference_targets: vec!["Ref".into()],
        target_ids: vec!["Gene".into()],
        sample_groups: BTreeMap::from([
            ("C1".into(), "Ctrl".into()),
            ("C2".into(), "Ctrl".into()),
            ("T1".into(), "Trt".into()),
            ("T2".into(), "Trt".into()),
        ]),
        ..Design::default()
    };
    let a = qpcr::analyze(&run).unwrap();
    assert_eq!(a.stats.len(), 1);
    let st = &a.stats[0];
    assert_eq!(st.target_id, "Gene");
    assert_eq!(st.method, "Welch t-test");
    let direct = stats::welch_t_test(&[4.0, 4.2], &[3.0, 3.1]).unwrap();
    assert!((st.p - direct.p_two_sided).abs() < 1e-12);
}

#[test]
fn analyze_emits_anova_for_three_groups() {
    let mut wells = Vec::new();
    for (s, tcq) in [
        ("A1", 24.0),
        ("A2", 24.1),
        ("B1", 23.0),
        ("B2", 23.2),
        ("C1", 25.0),
        ("C2", 25.3),
    ] {
        wells.push(well(s, "Ref", 20.0));
        wells.push(well(s, "Gene", tcq));
    }
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("A1".into()),
        reference_targets: vec!["Ref".into()],
        target_ids: vec!["Gene".into()],
        sample_groups: BTreeMap::from([
            ("A1".into(), "G1".into()),
            ("A2".into(), "G1".into()),
            ("B1".into(), "G2".into()),
            ("B2".into(), "G2".into()),
            ("C1".into(), "G3".into()),
            ("C2".into(), "G3".into()),
        ]),
        ..Design::default()
    };
    let a = qpcr::analyze(&run).unwrap();
    assert_eq!(a.stats.len(), 1);
    let st = &a.stats[0];
    assert_eq!(st.method, "one-way ANOVA");
    let direct = stats::one_way_anova(&[&[4.0, 4.1], &[3.0, 3.2], &[5.0, 5.3]]).unwrap();
    assert!((st.p - direct.p).abs() < 1e-12);
}
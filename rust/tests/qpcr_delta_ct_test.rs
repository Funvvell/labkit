use labkit::qpcr::model::{Design, QpcrRun, Well};
use labkit::qpcr::{self, delta_ct, delta_delta_ct, fold_change, pfaffl_ratio};

fn run() -> QpcrRun {
    let mut wells = Vec::new();
    for (sample, gapdh, target) in [
        ("Cal", 18.0, 20.0),
        ("Treated", 18.0, 19.0),
    ] {
        for _ in 0..2 {
            wells.push(Well::new(sample.into(), "GAPDH".into(), Some(gapdh)));
            wells.push(Well::new(sample.into(), "Target".into(), Some(target)));
        }
    }
    let mut run = QpcrRun::new(wells, None);
    run.design = Design {
        calibrator_sample: Some("Cal".into()),
        reference_targets: vec!["GAPDH".into()],
        target_ids: vec!["Target".into()],
        ..Design::default()
    };
    run
}

#[test]
fn basic_formulas() {
    assert!((delta_ct(20.0, 18.0) - 2.0).abs() < 1e-12);
    assert!((delta_delta_ct(1.0, 3.0) + 2.0).abs() < 1e-12);
    assert!((fold_change(-2.0) - 4.0).abs() < 1e-12);
    assert!((fold_change(0.0) - 1.0).abs() < 1e-12);
}

#[test]
fn pfaffl_degenerates_to_livak_at_100_percent_efficiency() {
    // e = 1 + efficiency = 2 for a perfect assay; ΔCt(control − sample) = 2
    // => 2^2 / 2^0 = 4, identical to 2^-ΔΔCt.
    let ratio = pfaffl_ratio(2.0, 2.0, 2.0, 0.0);
    assert!((ratio - 4.0).abs() < 1e-9);
}

#[test]
fn analyze_known_ddct_values() {
    let a = qpcr::analyze(&run()).unwrap();
    let cal = a.results.iter().find(|r| r.sample_id == "Cal").unwrap();
    let treated = a.results.iter().find(|r| r.sample_id == "Treated").unwrap();
    assert!((cal.delta_ct.unwrap() - 2.0).abs() < 1e-9);
    assert!((cal.delta_delta_ct.unwrap() - 0.0).abs() < 1e-9);
    assert!((cal.fold_change.unwrap() - 1.0).abs() < 1e-9);
    assert!((treated.delta_ct.unwrap() - 1.0).abs() < 1e-9);
    assert!((treated.delta_delta_ct.unwrap() + 1.0).abs() < 1e-9);
    assert!((treated.fold_change.unwrap() - 2.0).abs() < 1e-9);
    assert_eq!(treated.n_tech, 2);
}

#[test]
fn technical_replicates_are_averaged() {
    let mut r = run();
    for w in r.wells.iter_mut().filter(|w| w.sample_id == "Treated" && w.target_id == "Target") {
        w.cq = Some(19.1);
    }
    let a = qpcr::analyze(&r).unwrap();
    let t = a.results.iter().find(|x| x.sample_id == "Treated").unwrap();
    assert!((t.mean_cq.unwrap() - 19.1).abs() < 1e-9);
}

#[test]
fn missing_calibrator_is_flagged() {
    let mut r = run();
    r.design.calibrator_sample = None;
    let a = qpcr::analyze(&r).unwrap();
    assert!(a.results.iter().all(|x| x.fold_change.is_none()));
    assert!(a.results.iter().any(|x| x.flags.iter().any(|f| f.as_str().contains("对照"))));
}

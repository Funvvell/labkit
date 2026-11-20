use labkit::qpcr::model::{Design, Well};
use labkit::qpcr::qc::{apply_all, effective_cq, group_stats};

#[test]
fn group_stats_cv_and_sd() {
    let (mean, sd, cv) = group_stats(&[20.0, 20.1, 19.9]).unwrap();
    assert!((mean - 20.0).abs() < 1e-9);
    assert!((sd - 0.1).abs() < 1e-9);
    assert!((cv - 0.005).abs() < 1e-9);
}

#[test]
fn high_cv_flags_all_but_keeps_wells() {
    let mut wells = vec![
        Well::new("S".into(), "T".into(), Some(20.0)),
        Well::new("S".into(), "T".into(), Some(20.1)),
        Well::new("S".into(), "T".into(), Some(25.0)),
    ];
    for w in &mut wells {
        w.replicate_group = "S|T|".into();
    }
    let mut warnings = Vec::new();
    apply_all(&mut wells, &Design::default(), &mut warnings);
    assert_eq!(wells.len(), 3, "QC 不得删除原始数据");
    assert!(wells.iter().all(|w| w.flags.contains(&"HighCv".to_string())));
    assert!(wells.iter().all(|w| effective_cq(w).is_none()));
    assert!(!warnings.is_empty());
}

#[test]
fn undetermined_and_excluded_do_not_enter_mean() {
    let mut a = Well::new("S".into(), "T".into(), None);
    a.flag("Undetermined");
    let mut b = Well::new("S".into(), "T".into(), Some(21.0));
    b.excluded = true;
    b.flag("ExcludedBySource");
    let c = Well::new("S".into(), "T".into(), Some(20.0));
    assert!(effective_cq(&a).is_none());
    assert!(effective_cq(&b).is_none());
    assert_eq!(effective_cq(&c), Some(20.0));
}

#[test]
fn iqr_flags_extreme_well() {
    let mut wells: Vec<Well> = [20.0, 20.1, 19.9, 20.2, 19.8, 30.0]
        .into_iter()
        .map(|cq| Well::new("S".into(), "T".into(), Some(cq)))
        .collect();
    for w in &mut wells {
        w.replicate_group = "S|T|".into();
    }
    let design = Design {
        cv_threshold: 0.9, // disable CV so IQR is the only trigger
        sd_threshold: None,
        ..Default::default()
    };
    let mut warnings = Vec::new();
    apply_all(&mut wells, &design, &mut warnings);
    assert!(wells[5].flags.contains(&"Outlier".to_string()));
    assert!(!wells[0].flags.contains(&"Outlier".to_string()));
}

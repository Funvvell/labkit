use std::collections::BTreeMap;

use pathology_crop_rs::qpcr::model::Well;
use pathology_crop_rs::qpcr::refgene::{genorm_m, geometric_mean_ref};

#[test]
fn stable_reference_has_smaller_m() {
    let mut wells = Vec::new();
    // GAPDH and 18S are stable (their ratio is constant); ACTB varies a lot.
    // geNorm needs >=3 targets: with only two, pairwise M is always equal.
    for (sample, gapdh, actb, ref18s) in [
        ("S1", 18.0, 20.0, 21.0),
        ("S2", 18.0, 22.0, 21.0),
        ("S3", 18.0, 18.0, 21.0),
    ] {
        wells.push(Well::new(sample.into(), "GAPDH".into(), Some(gapdh)));
        wells.push(Well::new(sample.into(), "18S".into(), Some(ref18s)));
        wells.push(Well::new(sample.into(), "ACTB".into(), Some(actb)));
    }
    let targets = vec!["GAPDH".to_string(), "18S".to_string(), "ACTB".to_string()];
    let mut warnings = Vec::new();
    let m = genorm_m(&wells, &targets, &mut warnings);
    assert_eq!(m.len(), 3);
    assert_eq!(m.last().unwrap().0, "ACTB", "波动最大的内参 M 应最大: {m:?}");
    let unstable = m.last().unwrap().1;
    assert!(m[..2].iter().all(|(_, v)| *v < unstable), "M 排序错误: {m:?}");
    assert!((unstable - 2.0).abs() < 1e-9);
}

#[test]
fn geometric_mean_roundtrip() {
    let mut map = BTreeMap::new();
    map.insert("GAPDH".to_string(), vec![18.0, 19.0]);
    map.insert("ACTB".to_string(), vec![20.0, 21.0]);
    let q = geometric_mean_ref(&map, 2.0);
    assert_eq!(q.len(), 2);
    // mean Cq = 19.0 and 20.0 -> 2^-19, 2^-20
    assert!((q[0] - 2f64.powi(-19)).abs() < 1e-9);
    assert!((q[1] - 2f64.powi(-20)).abs() < 1e-9);
}

#[test]
fn too_few_samples_get_infinite_m() {
    let wells = vec![
        Well::new("S1".into(), "GAPDH".into(), Some(18.0)),
        Well::new("S1".into(), "ACTB".into(), Some(20.0)),
    ];
    let mut warnings = Vec::new();
    let m = genorm_m(&wells, &["GAPDH".into(), "ACTB".into()], &mut warnings);
    assert!(m.iter().all(|(_, v)| v.is_infinite()));
    assert!(!warnings.is_empty());
}

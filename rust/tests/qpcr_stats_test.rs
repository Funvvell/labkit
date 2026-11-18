use labkit::qpcr::stats::{
    one_way_anova, regularized_incomplete_beta, significance, welch_t_test,
};

#[test]
fn incomplete_beta_known_values() {
    // I_0.5(2,3) = 0.6875 (exact)
    let v = regularized_incomplete_beta(2.0, 3.0, 0.5);
    assert!((v - 0.6875).abs() < 1e-9, "I_0.5(2,3)={v}");
    assert_eq!(regularized_incomplete_beta(2.0, 3.0, 0.0), 0.0);
    assert_eq!(regularized_incomplete_beta(2.0, 3.0, 1.0), 1.0);
}

#[test]
fn welch_t_test_against_r() {
    // scipy.stats.ttest_ind(..., equal_var=False) / R t.test(var.equal=FALSE):
    // t = -2.190890, df = 6, p = 0.07098765432098758
    let a = [1.0, 2.0, 3.0, 4.0];
    let b = [3.0, 4.0, 5.0, 6.0];
    let r = welch_t_test(&a, &b).unwrap();
    assert!((r.t + 2.1908902300206643).abs() < 1e-9, "t={}", r.t);
    assert!((r.df - 6.0).abs() < 1e-9, "df={}", r.df);
    assert!((r.p_two_sided - 0.07098765432098758).abs() < 1e-9, "p={}", r.p_two_sided);
    assert!((r.mean_diff + 2.0).abs() < 1e-12);
}

#[test]
fn one_way_anova_against_r() {
    // scipy.stats.f_oneway / R aov: F = 27, df = (2,6), p = 0.001
    let g1 = [1.0, 2.0, 3.0];
    let g2 = [4.0, 5.0, 6.0];
    let g3 = [7.0, 8.0, 9.0];
    let r = one_way_anova(&[&g1, &g2, &g3]).unwrap();
    assert!((r.f - 27.0).abs() < 1e-9, "F={}", r.f);
    assert!((r.df1 - 2.0).abs() < 1e-9);
    assert!((r.df2 - 6.0).abs() < 1e-9);
    assert!((r.p - 0.0010000000000000002).abs() < 1e-9, "p={}", r.p);
    assert!((r.eta_squared - 0.9).abs() < 1e-9);
}

#[test]
fn degenerate_inputs_return_none() {
    let a = [1.0];
    let b = [2.0];
    assert!(welch_t_test(&a, &b).is_none());
    let flat1 = [1.0, 1.0, 1.0];
    let flat2 = [2.0, 2.0, 2.0];
    assert!(welch_t_test(&flat1, &flat2).is_none());
    assert!(one_way_anova(&[&flat1, &flat2]).is_none());
}

#[test]
fn significance_labels() {
    assert_eq!(significance(0.0001), "***");
    assert_eq!(significance(0.005), "**");
    assert_eq!(significance(0.02), "*");
    assert_eq!(significance(0.4), "ns");
}

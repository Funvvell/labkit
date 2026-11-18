//! Regularized incomplete beta + Welch t-test + one-way ANOVA.
//!
//! Numerical recipes: Lentz continued fraction for `betacf`, Lanczos for
//! `ln_gamma`. Formula references only; independently implemented.

pub fn mean_sd(values: &[f64]) -> Option<(f64, f64)> {
    let n = values.len();
    if n < 2 {
        return None;
    }
    let mean = values.iter().sum::<f64>() / n as f64;
    let var = values.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / (n - 1) as f64;
    Some((mean, var.sqrt()))
}

const LANCZOS: [f64; 9] = [
    0.999_999_999_999_809_93,
    676.520_368_121_885_1,
    -1259.139_216_722_402_8,
    771.323_428_777_653_1,
    -176.615_029_162_140_59,
    12.507_343_278_686_905,
    -0.138_571_095_265_720_12,
    9.984_369_578_019_571_6e-6,
    1.505_632_735_149_311_6e-7,
];

pub fn ln_gamma(x: f64) -> f64 {
    if x < 0.5 {
        std::f64::consts::PI.ln()
            - (std::f64::consts::PI * x).sin().abs().ln()
            - ln_gamma(1.0 - x)
    } else {
        let z = x - 1.0;
        let mut a = LANCZOS[0];
        for (i, c) in LANCZOS.iter().enumerate().skip(1) {
            a += c / (z + i as f64);
        }
        let t = z + 7.5;
        (2.0 * std::f64::consts::PI).sqrt().ln()
            + (z + 0.5) * t.ln()
            - t
            + a.ln()
    }
}

fn betacf(a: f64, b: f64, x: f64) -> f64 {
    const MAXIT: usize = 300;
    const EPS: f64 = 3e-14;
    const FPMIN: f64 = 1e-300;

    let qab = a + b;
    let qap = a + 1.0;
    let qam = a - 1.0;
    let mut c = 1.0;
    let mut d = 1.0 - qab * x / qap;
    if d.abs() < FPMIN {
        d = FPMIN;
    }
    d = 1.0 / d;
    let mut h = d;

    for m in 1..=MAXIT {
        let m2 = (2 * m) as f64;
        let mut aa = m as f64 * (b - m as f64) * x / ((qam + m2) * (a + m2));
        d = 1.0 + aa * d;
        if d.abs() < FPMIN {
            d = FPMIN;
        }
        c = 1.0 + aa / c;
        if c.abs() < FPMIN {
            c = FPMIN;
        }
        d = 1.0 / d;
        h *= d * c;

        aa = -(a + m as f64) * (qab + m as f64) * x / ((a + m2) * (qap + m2));
        d = 1.0 + aa * d;
        if d.abs() < FPMIN {
            d = FPMIN;
        }
        c = 1.0 + aa / c;
        if c.abs() < FPMIN {
            c = FPMIN;
        }
        d = 1.0 / d;
        let del = d * c;
        h *= del;
        if (del - 1.0).abs() < EPS {
            break;
        }
    }
    h
}

/// I_x(a,b), the regularized incomplete beta function.
pub fn regularized_incomplete_beta(a: f64, b: f64, x: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }
    if a <= 0.0 || b <= 0.0 {
        return f64::NAN;
    }
    let front = (ln_gamma(a + b) - ln_gamma(a) - ln_gamma(b)
        + a * x.ln()
        + b * (1.0 - x).ln())
        .exp();
    if x < (a + 1.0) / (a + b + 2.0) {
        front * betacf(a, b, x) / a
    } else {
        1.0 - front * betacf(b, a, 1.0 - x) / b
    }
}

#[derive(Debug, Clone, Copy)]
pub struct TTest {
    pub t: f64,
    pub df: f64,
    pub p_two_sided: f64,
    pub mean_diff: f64,
    pub cohens_d: f64,
}

pub fn welch_t_test(a: &[f64], b: &[f64]) -> Option<TTest> {
    let (ma, sa) = mean_sd(a)?;
    let (mb, sb) = mean_sd(b)?;
    let na = a.len() as f64;
    let nb = b.len() as f64;
    let va = sa * sa / na;
    let vb = sb * sb / nb;
    if va + vb <= 0.0 {
        return None;
    }
    let t = (ma - mb) / (va + vb).sqrt();
    let denom = va * va / (na - 1.0) + vb * vb / (nb - 1.0);
    if denom <= 0.0 {
        return None;
    }
    let df = (va + vb).powi(2) / denom;
    let p = regularized_incomplete_beta(df / 2.0, 0.5, df / (df + t * t));
    let pooled = (((na - 1.0) * sa * sa + (nb - 1.0) * sb * sb) / (na + nb - 2.0)).sqrt();
    let cohens_d = if pooled > 0.0 { (ma - mb) / pooled } else { f64::NAN };
    Some(TTest {
        t,
        df,
        p_two_sided: p.clamp(0.0, 1.0),
        mean_diff: ma - mb,
        cohens_d,
    })
}

#[derive(Debug, Clone, Copy)]
pub struct Anova {
    pub f: f64,
    pub df1: f64,
    pub df2: f64,
    pub p: f64,
    pub eta_squared: f64,
}

pub fn one_way_anova(groups: &[&[f64]]) -> Option<Anova> {
    let k = groups.len();
    if k < 2 {
        return None;
    }
    let n_total: usize = groups.iter().map(|g| g.len()).sum();
    if n_total <= k {
        return None;
    }
    let grand = groups.iter().flat_map(|g| g.iter()).sum::<f64>() / n_total as f64;
    let ss_between = groups
        .iter()
        .map(|g| {
            let m = g.iter().sum::<f64>() / g.len() as f64;
            g.len() as f64 * (m - grand).powi(2)
        })
        .sum::<f64>();
    let ss_within = groups
        .iter()
        .filter_map(|g| {
            let (_, sd) = mean_sd(g)?;
            Some((g.len() - 1) as f64 * sd * sd)
        })
        .sum::<f64>();
    let df1 = (k - 1) as f64;
    let df2 = (n_total - k) as f64;
    if ss_within <= 0.0 || df1 <= 0.0 || df2 <= 0.0 {
        return None;
    }
    let f = (ss_between / df1) / (ss_within / df2);
    let p = regularized_incomplete_beta(df2 / 2.0, df1 / 2.0, df2 / (df2 + df1 * f));
    Some(Anova {
        f,
        df1,
        df2,
        p: p.clamp(0.0, 1.0),
        eta_squared: ss_between / (ss_between + ss_within),
    })
}

pub fn significance(p: f64) -> &'static str {
    if p < 0.001 {
        "***"
    } else if p < 0.01 {
        "**"
    } else if p < 0.05 {
        "*"
    } else {
        "ns"
    }
}

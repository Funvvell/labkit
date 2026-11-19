// B3 统一统计引擎 —— stdlib-js(Apache-2.0) + simple-statistics(ISC) + scipy MWU 移植(BSD) + Fisher 教科书实现
// Fisher 精确概率法为超几何直接求和（与 OpenEpi/scipy 在 tests/js/stats.test.mjs 中对数）。
// 所有函数返回 {test, statistic, p, ...}；p 缺失时以 null 表示。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  const S = () => W.stdlib;
  const ss = () => W.ss || W.simpleStatistics;

  function nums(arr) {
    const a = arr.map(Number).filter(Number.isFinite);
    if (!a.length) throw new Error('无有效数值');
    return a;
  }
  // Lanczos lgamma（Fisher 用）
  function lgamma(z) {
    const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < 8; i++) x += g[i] / (z + i + 1);
    const t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function factln(n) { return lgamma(n + 1); }

  // R-7 分位数（numpy/pandas 默认 linear 插值；simple-statistics 为 R-5，故自实现）
  function quantile(sorted, p) {
    const n = sorted.length;
    if (!n) return NaN;
    if (p <= 0) return sorted[0];
    if (p >= 1) return sorted[n - 1];
    const h = (n - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
    return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
  }

  function descriptive(x) {
    x = nums(x);
    const s = ss();
    const sorted = x.slice().sort((a, b) => a - b);
    return {
      n: x.length, mean: s.mean(x), sd: s.sampleStandardDeviation(x),
      median: s.median(x), min: sorted[0], max: sorted[sorted.length - 1],
      q1: quantile(sorted, 0.25), q3: quantile(sorted, 0.75),
      se: s.sampleStandardDeviation(x) / Math.sqrt(x.length)
    };
  }

  function ttestOne(x, mu = 0, alternative = 'two-sided') {
    x = nums(x);
    const r = S().ttest(x, { mu, alternative });
    return { test: '单样本 t', statistic: r.statistic, p: r.pValue, df: x.length - 1, ci: r.ci, mean: ss().mean(x), n: x.length };
  }
  function ttestInd(x, y, { equalVar = false, alternative = 'two-sided' } = {}) {
    x = nums(x); y = nums(y);
    if (!equalVar) {
      const r = S().ttest2(x, y, { alternative });
      return { test: 'Welch t', statistic: r.statistic, p: r.pValue, df: r.df, ci: r.ci, mean1: r.xmean, mean2: r.ymean, n1: x.length, n2: y.length };
    }
    const s = ss();
    const n1 = x.length, n2 = y.length, m1 = s.mean(x), m2 = s.mean(y);
    const v1 = s.sampleVariance(x), v2 = s.sampleVariance(y);
    const df = n1 + n2 - 2;
    const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
    const se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    const t = (m1 - m2) / se;
    const p = altP(t, df, alternative);
    const tc = tCrit(df);
    return { test: ' pooled t', statistic: t, p, df, ci: [m1 - m2 - tc * se, m1 - m2 + tc * se], mean1: m1, mean2: m2, n1, n2 };
  }
  function ttestPaired(x, y, alternative = 'two-sided') {
    x = nums(x); y = nums(y);
    if (x.length !== y.length) throw new Error('配对样本长度需一致');
    const d = x.map((v, i) => v - y[i]);
    const r = ttestOne(d, 0, alternative);
    return Object.assign(r, { test: '配对 t', meanDiff: ss().mean(d) });
  }
  function tCrit(df) {
    // 双侧 95% t 临界值：二分求 tCdf(t,df)=0.975
    let lo = 0, hi = 100;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (S().tCdf(mid, df) < 0.975) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  function altP(t, df, alternative) {
    const cdf = S().tCdf(Math.abs(t), df);
    if (alternative === 'two-sided') return 2 * (1 - cdf);
    if (alternative === 'greater') return t > 0 ? 1 - cdf : cdf;
    return t < 0 ? 1 - cdf : cdf;
  }

  function chi2Indep(matrix) {
    const r = S().chi2test(matrix);
    return { test: 'χ² 独立性', statistic: r.statistic, p: r.pValue, df: r.df, expected: r._expected };
  }
  function chi2GOF(observed, expected) {
    observed = nums(observed);
    if (expected) { expected = nums(expected); if (expected.length !== observed.length) throw new Error('期望频数长度需一致'); }
    else { const m = observed.reduce((a, b) => a + b, 0) / observed.length; expected = observed.map(() => m); }
    let chi = 0;
    observed.forEach((o, i) => { if (expected[i] <= 0) throw new Error('期望频数需 > 0'); chi += (o - expected[i]) ** 2 / expected[i]; });
    const df = observed.length - 1;
    return { test: 'χ² 拟合优度', statistic: chi, p: 1 - S().chisquareCdf(chi, df), df };
  }

  // Fisher 精确（双侧：概率 ≤ 观察表概率的所有表求和）
  function fisher(a, b, c, d) {
    [a, b, c, d] = [a, b, c, d].map(Number);
    if ([a, b, c, d].some(v => !Number.isFinite(v) || v < 0 || Math.round(v) !== v)) throw new Error('四格表需为非负整数');
    const n = a + b + c + d, r1 = a + b, r2 = c + d, c1 = a + c;
    if (n === 0) throw new Error('总频数为 0');
    const lo = Math.max(0, c1 - r2), hi = Math.min(r1, c1);
    const constTerm = factln(r1) + factln(r2) + factln(c1) + factln(n - c1) - factln(n);
    const lp = x => constTerm - factln(x) - factln(r1 - x) - factln(c1 - x) - factln(r2 - c1 + x);
    const pObs = Math.exp(lp(a));
    let p = 0;
    for (let x = lo; x <= hi; x++) { const px = Math.exp(lp(x)); if (px <= pObs * (1 + 1e-7)) p += px; }
    const or = (b * c === 0) ? (a * d === 0 ? NaN : Infinity) : (a * d) / (b * c);
    return { test: 'Fisher 精确', statistic: or, p: Math.min(1, p), or, table: [a, b, c, d] };
  }

  function mwu(x, y, opts) {
    x = nums(x); y = nums(y);
    const r = W.scipyMWU.mannwhitneyu(x, y, opts);
    return { test: 'Mann-Whitney U', statistic: r.statistic, p: r.pvalue, method: r.method, z: r.zstatistic, n1: x.length, n2: y.length };
  }
  function wilcoxon(x, y, alternative = 'two-sided') {
    x = nums(x);
    const r = y ? S().wilcoxon(x, nums(y), { alternative }) : S().wilcoxon(x, { alternative });
    return { test: 'Wilcoxon 符号秩', statistic: r.statistic, p: r.pValue };
  }
  function bartlett(groups) {
    const gs = groups.map(nums);
    if (gs.length < 2) throw new Error('至少两组');
    const r = S().bartlettTest(...gs);
    return { test: 'Bartlett 方差齐性', statistic: r.statistic, p: r.pValue, k: gs.length };
  }
  function correlation(x, y, kind = 'pearson') {
    x = nums(x); y = nums(y);
    if (x.length !== y.length || x.length < 3) throw new Error('两变量需等长且 n≥3');
    const s = ss();
    let r;
    if (kind === 'pearson') r = s.sampleCorrelation(x, y);
    else r = s.sampleCorrelation(S().ranks(x), S().ranks(y));
    const n = x.length, df = n - 2;
    const t = r * Math.sqrt(df / (1 - r * r));
    return { test: kind === 'pearson' ? 'Pearson 相关' : 'Spearman 相关', statistic: r, p: altP(t, df, 'two-sided'), df, t, n };
  }

  W.statsEngine = { descriptive, ttestOne, ttestInd, ttestPaired, chi2Indep, chi2GOF, fisher, mwu, wilcoxon, bartlett, correlation, quantile };
})();
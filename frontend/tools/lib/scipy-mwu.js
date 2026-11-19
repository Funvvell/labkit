// Mann-Whitney U 检验 —— 移植自 SciPy scipy/stats/_mannwhitneyu.py
// SciPy: Copyright (c) SciPy Developers, BSD 3-Clause License. https://scipy.org
// 逐式移植：精确分布（Löffler 递推，n≤8 无结）、渐近正态（结校正 + 连续性校正）、auto 选择。
// 基准：上游 doctest males=[19,22,16,29,24] females=[20,11,17,12] → U=17, exact p=0.1111111111, asymptotic p=0.1113468865
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;

  function binom(n, k) {
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  // 平均秩（ ties 取平均）
  function rankdata(a) {
    const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
    const ranks = new Array(a.length);
    let i = 0;
    while (i < idx.length) {
      let j = i;
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      const r = (i + j + 2) / 2; // 平均秩（1-based）
      for (let k = i; k <= j; k++) ranks[idx[k][1]] = r;
      i = j + 1;
    }
    return ranks;
  }
  function tieCounts(a) {
    const m = new Map();
    a.forEach(v => m.set(v, (m.get(v) || 0) + 1));
    return [...m.values()].filter(t => t > 1);
  }

  // 精确零分布：U 的频率数组（上游 build_sigma_array + build_u_freqs_array）
  function uFreqs(n1, n2, maxu) {
    const total = binom(n1 + n2, n1);
    const s = new Array(maxu + 1).fill(0);
    for (let d = 1; d <= n1; d++) for (let i = d; i <= maxu; i += d) s[i] += d;
    for (let d = n2 + 1; d <= n2 + n1; d++) for (let i = d; i <= maxu; i += d) s[i] -= d;
    const conf = new Array(maxu + 1).fill(0);
    conf[0] = 1;
    for (let u = 1; u <= maxu; u++) {
      let dot = 0;
      // 上游 s_array 返回时已去掉 0 号位：coeffs[j] = origS[u-j]
      for (let j = 0; j < u; j++) dot += conf[j] * s[u - j];
      conf[u] = dot / u;
    }
    return conf.map(c => c / total);
  }
  function makeDist(n1, n2) {
    const N = n1 * n2;
    const half = Math.floor(N / 2);
    const pmf = uFreqs(n1, n2, half);
    const cdfArr = [];
    let acc = 0;
    for (let i = 0; i <= half; i++) { acc += pmf[i]; cdfArr[i] = acc; }
    function pmfAt(k) { return k <= half ? pmf[k] : pmf[N - k]; }
    function cdf(k) { return k <= half ? cdfArr[k] : 1 - cdfArr[N - k] + pmf[N - k]; }
    function sf(k) {
      const kc = N - k;
      if (k < kc) return 1 - cdf(k) + pmfAt(k);
      return cdf(kc);
    }
    return { pmfAt, cdf, sf };
  }

  function normSf(z) { return 1 - normCdf(z); }
  function normCdf(z) {
    // Abramowitz-Stegun 7.1.26  erf 近似（精度 ~1.5e-7，足够 p 值报告）
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989422804014327 * Math.exp(-z * z / 2);
    let p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z > 0 ? 1 - p : p;
  }

  function correctionSign(num, alternative) {
    if (alternative === 'less') return -1;
    if (alternative === 'greater') return 1;
    return num > 0 ? 1 : num < 0 ? -1 : 0;
  }

  // 主入口：返回 {statistic(U1), pvalue, method, zstatistic?}
  function mannwhitneyu(x, y, opts = {}) {
    const { useContinuity = true, alternative = 'two-sided', method = 'auto' } = opts;
    if (!x.length || !y.length) throw new Error('两样本均不能为空');
    if (!['two-sided', 'less', 'greater'].includes(alternative)) throw new Error('alternative 无效');
    const n1 = x.length, n2 = y.length;
    const combined = x.concat(y);
    const ranks = rankdata(combined);
    const R1 = ranks.slice(0, n1).reduce((a, b) => a + b, 0);
    const U1 = R1 - n1 * (n1 + 1) / 2;
    const ties = tieCounts(combined);
    let m = method;
    if (m === 'auto') m = (n1 > 8 && n2 > 8) ? 'asymptotic' : (ties.length ? 'asymptotic' : 'exact');
    if (m === 'exact') {
      const dist = makeDist(Math.min(n1, n2), Math.max(n1, n2));
      // 对称化：用较小 U 计算（上游 sf/cdf 已含对称处理）
      let p;
      if (alternative === 'two-sided') p = Math.min(1, 2 * Math.min(dist.cdf(U1), dist.sf(U1)));
      else if (alternative === 'less') p = dist.cdf(U1);
      else p = dist.sf(U1);
      return { statistic: U1, pvalue: p, method: 'exact' };
    }
    // 渐近
    const mu = n1 * n2 / 2, n = n1 + n2;
    const tieTerm = ties.reduce((a, t) => a + t ** 3 - t, 0);
    const s = Math.sqrt(n1 * n2 / 12 * ((n + 1) - tieTerm / (n * (n - 1))));
    let numerator = U1 - mu;
    if (useContinuity) numerator -= 0.5 * correctionSign(numerator, alternative);
    const z = s === 0 ? (numerator > 0 ? Infinity : numerator < 0 ? -Infinity : 0) : numerator / s;
    let p;
    if (alternative === 'two-sided') p = Math.min(1, 2 * normSf(Math.abs(z)));
    else if (alternative === 'less') p = normCdf(z);
    else p = normSf(z);
    return { statistic: U1, pvalue: p, method: 'asymptotic', zstatistic: z };
  }

  W.scipyMWU = { mannwhitneyu, rankdata, normCdf };
})();
// Table 1 基线特征表 —— 移植自 tableone (Python, 单文件版 0.2.7)
// Copyright (c) Tom Pollard / Alistair Johnson, MIT License. https://github.com/alistairewj/tableone
// 语义对齐上游：连续 mean(std)/median[IQR]、分类 n(%)、n 行、isnull 列、
// p 值选择（正态→One_way_ANOVA，非正态→Kruskal-Wallis，分类→Chi-squared，2×2 小格→Fisher exact）。
// ANOVA/Kruskal-Wallis/F-CDF 为配套教科书实现（上游依赖 scipy.stats）。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  const ss = () => W.ss || W.simpleStatistics;

  const isNull = v => v == null || v === '' || (typeof v === 'number' && !Number.isFinite(v));
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const f2 = v => Number.isFinite(v) ? v.toFixed(2) : 'nan';
  const f3 = v => Number.isFinite(v) ? v.toFixed(3) : 'nan';
  // R-7 分位数（对齐 pandas.quantile 默认 linear；ss.quantile 为 R-5 不采用）
  function quantileR7(sorted, p) {
    const n = sorted.length;
    if (!n) return NaN;
    if (p <= 0) return sorted[0];
    if (p >= 1) return sorted[n - 1];
    const h = (n - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
    return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
  }

  // ---- 配套分布函数 ----
  function lgamma(z) {
    const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < 8; i++) x += g[i] / (z + i + 1);
    const t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function betacf(a, b, x) {
    const MAXIT = 200, EPS = 3e-12, FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function betai(a, b, x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function fCdf(f, d1, d2) {
    if (f <= 0) return 0;
    return betai(d1 / 2, d2 / 2, d1 * f / (d1 * f + d2));
  }
  function fOneway(groups) {
    const k = groups.length;
    const all = groups.flat();
    const N = all.length;
    const grand = ss().mean(all);
    let ssb = 0, ssw = 0;
    for (const g of groups) {
      const m = ss().mean(g);
      ssb += g.length * (m - grand) ** 2;
      for (const v of g) ssw += (v - m) ** 2;
    }
    const d1 = k - 1, d2 = N - k;
    const F = (ssb / d1) / (ssw / d2);
    return { statistic: F, p: 1 - fCdf(F, d1, d2) };
  }
  function kruskal(groups) {
    const all = [];
    groups.forEach((g, gi) => g.forEach(v => all.push({ v, gi })));
    all.sort((a, b) => a.v - b.v);
    const N = all.length;
    let i = 0;
    while (i < N) {
      let j = i;
      while (j + 1 < N && all[j + 1].v === all[i].v) j++;
      const r = (i + j + 2) / 2;
      for (let k = i; k <= j; k++) all[k].r = r;
      i = j + 1;
    }
    const R = groups.map(() => 0), n = groups.map(g => g.length);
    all.forEach(o => { R[o.gi] += o.r; });
    let H = 0;
    for (let g = 0; g < groups.length; g++) H += R[g] ** 2 / n[g];
    H = 12 / (N * (N + 1)) * H - 3 * (N + 1);
    const tieMap = new Map();
    all.forEach(o => tieMap.set(o.v, (tieMap.get(o.v) || 0) + 1));
    let tieTerm = 0;
    tieMap.forEach(t => { if (t > 1) tieTerm += t ** 3 - t; });
    if (tieTerm) H /= 1 - tieTerm / (N ** 3 - N);
    const df = groups.length - 1;
    return { statistic: H, p: 1 - W.stdlib.chisquareCdf(H, df) };
  }

  // ---- 主入口（对齐上游 TableOne）----
  // rows: 对象数组；opts: {columns, categorical, groupby, nonnormal, pval, isnull}
  function tableone(rows, opts = {}) {
    const columns = opts.columns && opts.columns.length ? opts.columns : Object.keys(rows[0] || {});
    const categorical = opts.categorical || [];
    const groupby = opts.groupby || '';
    const nonnormal = opts.nonnormal || [];
    const pval = !!opts.pval;
    const isnull = opts.isnull !== false;
    if (pval && !groupby) throw new Error('计算 p 值需指定分组列（groupby）');
    const continuous = columns.filter(c => !categorical.includes(c) && c !== groupby);
    const strata = groupby
      ? [...new Set(rows.map(r => r[groupby]).filter(v => !isNull(v)).map(String))].sort()
      : ['overall'];
    const sub = s => groupby ? rows.filter(r => String(r[groupby]) === s) : rows;

    // 分类水平（全数据排序去重）
    const catLevels = {};
    for (const v of categorical) {
      catLevels[v] = [...new Set(rows.map(r => r[v]).filter(x => !isNull(x)).map(String))].sort();
    }
    // 连续描述
    function contDescribe(data, v) {
      const vals = data.map(r => num(r[v])).filter(x => x != null);
      const s = ss();
      const sorted = vals.slice().sort((a, b) => a - b);
      return {
        n: vals.length, isnull: data.length - vals.length,
        mean: vals.length ? s.mean(vals) : NaN,
        median: vals.length ? s.median(sorted) : NaN,
        std: vals.length > 1 ? s.sampleStandardDeviation(vals) : NaN,
        q25: vals.length ? quantileR7(sorted, 0.25) : NaN,
        q75: vals.length ? quantileR7(sorted, 0.75) : NaN
      };
    }
    // 分类描述
    function catDescribe(data, v) {
      const vals = data.map(r => r[v]).filter(x => !isNull(x)).map(String);
      const freq = {};
      catLevels[v].forEach(l => { freq[l] = 0; });
      vals.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
      const out = {};
      catLevels[v].forEach(l => { out[l] = { freq: freq[l], percent: vals.length ? freq[l] / vals.length * 100 : NaN }; });
      return { n: vals.length, isnull: data.length - vals.length, levels: out };
    }
    // 显著性（对齐上游 __p_test）
    function pTest(v) {
      const grouped = strata.map(s => {
        const data = sub(s);
        if (categorical.includes(v)) return data.map(r => r[v]).filter(x => !isNull(x)).map(String);
        return data.map(r => num(r[v])).filter(x => x != null);
      });
      const minN = Math.min(...grouped.map(g => g.length));
      if (minN === 0) return { pval: NaN, testname: 'Not tested' };
      if (!categorical.includes(v)) {
        if (!nonnormal.includes(v)) { const r = fOneway(grouped); return { pval: r.p, testname: 'One_way_ANOVA' }; }
        const r = kruskal(grouped); return { pval: r.p, testname: 'Kruskal-Wallis' };
      }
      const lvls = catLevels[v];
      const observed = grouped.map(g => lvls.map(l => g.filter(x => x === l).length));
      const minCell = Math.min(...observed.map(r => Math.min(...r)));
      if (minCell < 5) {
        if (observed.length === 2 && observed[0].length === 2) {
          const r = W.statsEngine.fisher(observed[0][0], observed[0][1], observed[1][0], observed[1][1]);
          return { pval: r.p, testname: 'Fisher exact' };
        }
        return { pval: NaN, testname: 'Not tested' };
      }
      const r = W.stdlib.chi2test(observed);
      return { pval: r.pValue, testname: 'Chi-squared' };
    }
    const sig = {};
    if (groupby) for (const v of continuous.concat(categorical)) sig[v] = pval ? pTest(v) : { pval: NaN, testname: '' };

    // n 行
    const nRow = ['n'];
    if (groupby) {
      strata.forEach(s => nRow.push(String(sub(s).length)));
      if (isnull) nRow.push(String(rows.filter(r => isNull(r[groupby])).length));
    } else {
      nRow.push(String(rows.length));
      if (isnull) nRow.push('');
    }
    if (pval) { nRow.push(''); nRow.push(''); }

    // 连续表
    const contTable = continuous.map(v => {
      const row = [nonnormal.includes(v) ? `${v} (median [IQR])` : `${v} (mean (std))`];
      strata.forEach(s => {
        const d = contDescribe(sub(s), v);
        row.push(nonnormal.includes(v) ? `${f2(d.median)} [${f2(d.q25)},${f2(d.q75)}]` : `${f2(d.mean)} (${f2(d.std)})`);
      });
      if (isnull) row.push(String(rows.filter(r => isNull(r[v]) || num(r[v]) == null).length));
      if (pval) { row.push(f3(sig[v].pval)); row.push(sig[v].testname); }
      return row;
    });
    // 分类表
    const catTable = [];
    for (const v of categorical) {
      const head = [`${v} (n (%))`, ...strata.map(() => '')];
      if (isnull) head.push(String(rows.filter(r => isNull(r[v])).length));
      if (pval) { head.push(f3(sig[v].pval)); head.push(sig[v].testname); }
      catTable.push(head);
      for (const level of catLevels[v]) {
        const row = [String(level)];
        strata.forEach(s => {
          const d = catDescribe(sub(s), v).levels[level];
          row.push(`${d.freq.toFixed(0)} (${f2(d.percent)})`);
        });
        if (isnull) row.push('');
        if (pval) { row.push(''); row.push(''); }
        catTable.push(row);
      }
    }
    const headers = ['', ...strata];
    if (isnull) headers.push('isnull');
    if (pval) { headers.push('pval'); headers.push('testname'); }
    return { headers, table: [nRow, ...contTable, ...catTable], strata, groupby };
  }

  // ---- 导出 ----
  const csvCell = c => /[",\n]/.test(String(c)) ? '"' + String(c).replace(/"/g, '""') + '"' : String(c);
  function toCSV(t) { return [t.headers, ...t.table].map(r => r.map(csvCell).join(',')).join('\n'); }
  function toMarkdown(t) {
    const esc = c => String(c).replace(/\|/g, '\\|');
    const lines = [ '| ' + t.headers.map(esc).join(' | ') + ' |', '|' + t.headers.map(() => '---').join('|') + '|' ];
    t.table.forEach(r => lines.push('| ' + r.map(esc).join(' | ') + ' |'));
    return lines.join('\n');
  }
  function toHTML(t) {
    const e = c => String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<table>\n<thead><tr>' + t.headers.map(h => `<th>${e(h)}</th>`).join('') + '</tr></thead>\n<tbody>\n' +
      t.table.map(r => '<tr>' + r.map(c => `<td>${e(c)}</td>`).join('') + '</tr>').join('\n') + '\n</tbody>\n</table>';
  }
  function toLaTeX(t) {
    const e = c => String(c).replace(/([&%$#_{}])/g, '\\$1');
    const n = t.headers.length;
    return '\\begin{tabular}{l' + 'r'.repeat(n - 1) + '}\n\\toprule\n' +
      t.headers.map(e).join(' & ') + ' \\\\\n\\midrule\n' +
      t.table.map(r => r.map(e).join(' & ') + ' \\\\').join('\n') + '\n\\bottomrule\n\\end{tabular}';
  }

  W.tableone = tableone;
  W.tableoneExport = { toCSV, toMarkdown, toHTML, toLaTeX };
  W.tableoneStats = { fOneway, kruskal, fCdf };
})();
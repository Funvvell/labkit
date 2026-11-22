// C7 qPCR 绘图增强 —— Plotly.js (MIT) 期刊样式图表
// 数值全部来自现有 Rust qpcr 分析（analysis.results / analysis.stats），本文件只做可视化。
// 期刊主题：Arial、黑白友好色盲安全配色（Okabe-Ito）、SVG 矢量 + PNG 300/600dpi 导出。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  // Okabe-Ito 色盲安全调色板（单源：tools/lib/colors.js，plotter 读同一份）
  const PALETTE = W.LKColors.JOURNAL;
  // 期刊图字体单一来源：Arial/Helvetica 是投稿的安全默认，plotter 与本文件共用，
  // 不再各自散落字面量。界面 UI 字体（Inter）不用于出版图，避免期刊兼容问题。
  const JOURNAL_FONT = 'Arial, Helvetica, sans-serif';

  // 图表高度跟容器宽度走（容器查询语义），不再依赖 window.innerHeight：
  // 同一工具放进主窗或独立窗口时高度一致，窄容器也不会把页面撑出横向滚动。
  function plotHeight(base, el) {
    const w = (el && el.clientWidth) || (typeof window !== 'undefined' ? window.innerWidth : 0) || 800;
    return Math.round(Math.max(240, Math.min(base, w * 0.62)));
  }

  function journalLayout(extra = {}) {
    return Object.assign({
      font: { family: JOURNAL_FONT, size: 12, color: '#000' },
      paper_bgcolor: '#fff', plot_bgcolor: '#fff',
      margin: { l: 60, r: 20, t: 30, b: 50 },
      showlegend: true,
      legend: { orientation: 'h', y: 1.12, x: 0 },
      xaxis: { linecolor: '#000', linewidth: 1, mirror: true, gridcolor: '#eee', zeroline: false },
      yaxis: { linecolor: '#000', linewidth: 1, mirror: true, gridcolor: '#eee', zeroline: false },
    }, extra);
  }

  // t 分布 CDF（不完全 Beta，Numerical Recipes）—— CI95 误差棒用
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
    const FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d; let h = d;
    for (let m = 1; m <= 200; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 3e-12) break;
    }
    return h;
  }
  function betai(a, b, x) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function tCdf(t, df) {
    const x = df / (df + t * t);
    const p = 0.5 * betai(df / 2, 0.5, x);
    return t > 0 ? 1 - p : p;
  }
  function tCrit95(df) {
    if (df <= 0) return NaN;
    let lo = 0, hi = 100;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (tCdf(mid, df) < 0.975) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  function cellStats(vals, errMode) {
    const n = vals.length, m = mean(vals);
    const sd = n > 1 ? Math.sqrt(vals.reduce((s, v) => s + (v - m) ** 2, 0) / (n - 1)) : 0;
    const sem = n > 0 ? sd / Math.sqrt(n) : 0;
    const err = errMode === 'SEM' ? sem : errMode === 'CI95' ? tCrit95(n - 1) * sem : sd;
    return { n, m, sd, sem, err };
  }
  // log2 轴误差棒变换（y 值取 log2，误差非对称）
  function log2Err(m, err) {
    const y = Math.log2(Math.max(1e-6, m));
    const up = Math.log2(Math.max(1e-6, m + err)) - y;
    const down = y - Math.log2(Math.max(1e-6, m - err));
    return { y, up: Math.max(0, up), down: Math.max(0, down) };
  }
  const starOf = p => p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : 'ns';

  // Fold Change 分组柱状图（log2 轴 + 误差棒 + 显著性）
  function fcChart(el, analysis, opts = {}) {
    const errMode = opts.errMode || 'SD';
    const res = (analysis.results || []).filter(r => r.fold_change != null);
    if (!res.length) { el.innerHTML = '<div class="tempty">无 Fold Change 结果</div>'; return; }
    const targets = [...new Set(res.map(r => r.target_id))];
    const groups = [...new Set(res.map(r => r.group || '未分组'))];
    const stats = {}; (analysis.stats || []).forEach(s => { stats[s.target_id] = s; });
    const traces = groups.map((g, gi) => {
      const y = [], eu = [], ed = [], txt = [];
      targets.forEach(t => {
        const vals = res.filter(r => r.target_id === t && (r.group || '未分组') === g).map(r => r.fold_change);
        if (!vals.length) { y.push(null); eu.push(0); ed.push(0); txt.push(''); return; }
        const c = cellStats(vals, errMode);
        const le = log2Err(c.m, c.err);
        y.push(le.y); eu.push(le.up); ed.push(le.down);
        txt.push(`${t} / ${g}<br>FC=${c.m.toFixed(3)}<br>n=${c.n}, ${errMode}=${c.err.toFixed(3)}`);
      });
      return {
        type: 'bar', name: g, x: targets, y,
        error_y: { type: 'data', symmetric: false, array: eu, arrayminus: ed, color: PALETTE[gi % PALETTE.length], thickness: 1.5, width: 5 },
        marker: { color: PALETTE[gi % PALETTE.length], line: { color: '#000', width: 0.8 } },
        hovertext: txt, hoverinfo: 'text',
      };
    });
    // log2 刻度
    let lo = 0, hi = 1;
    traces.forEach(tr => tr.y.forEach((v, i) => {
      if (v == null) return;
      lo = Math.min(lo, v - (tr.error_y.arrayminus[i] || 0));
      hi = Math.max(hi, v + (tr.error_y.array[i] || 0));
    }));
    lo = Math.floor(lo) - 1; hi = Math.ceil(hi) + 1;
    const tickvals = [], ticktext = [];
    for (let k = lo; k <= hi; k++) { tickvals.push(k); ticktext.push(k === 0 ? '1' : k === 1 ? '2' : k === -1 ? '0.5' : '2^' + k); }
    // 显著性标注
    const annotations = [], shapes = [];
    targets.forEach((t, ti) => {
      const st = stats[t];
      if (!st || st.p == null) return;
      const star = starOf(st.p);
      const topY = Math.max(...traces.map(tr => tr.y[ti] == null ? -Infinity : tr.y[ti] + (tr.error_y.array[ti] || 0)));
      const yBr = topY + 0.35;
      if ((st.groups || []).length === 2 && groups.length === 2) {
        const x0 = ti - 0.2, x1 = ti + 0.2;
        shapes.push({ type: 'line', x0, x1, y0: yBr, y1: yBr, line: { color: '#000', width: 1 } });
        shapes.push({ type: 'line', x0, x0, y0: yBr - 0.1, y1: yBr, line: { color: '#000', width: 1 } });
        shapes.push({ type: 'line', x0: x1, x1, y0: yBr - 0.1, y1: yBr, line: { color: '#000', width: 1 } });
        annotations.push({ x: ti, y: yBr + 0.15, text: `${star} (p=${Number(st.p).toFixed(3)})`, showarrow: false, font: { size: 11, color: star === 'ns' ? '#888' : '#000' } });
      } else {
        annotations.push({ x: ti, y: yBr + 0.15, text: `${star} (p=${Number(st.p).toFixed(3)})`, showarrow: false, font: { size: 11, color: star === 'ns' ? '#888' : '#000' } });
      }
    });
    const layout = journalLayout({
      barmode: 'group', bargap: 0.25, bargroupgap: 0.08,
      height: plotHeight(340, el),
      xaxis: Object.assign(journalLayout().xaxis, { title: { text: '靶基因', font: { size: 13 } }, tickfont: { size: 12 } }),
      yaxis: Object.assign(journalLayout().yaxis, { title: { text: 'Fold Change（log2）', font: { size: 13 } }, tickvals, ticktext, range: [lo, hi + 0.8], zeroline: true, zerolinecolor: '#999', zerolinewidth: 1 }),
      annotations, shapes,
    });
    W.Plotly.newPlot(el, traces, layout, { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] });
  }

  // 标准曲线：散点 + 回归线 + slope/R²/E 标注
  function stdCurve(el, d) {
    const { X, Y, slope, r2, E, gene, raw } = d;
    const xmin = Math.min(...X), xmax = Math.max(...X);
    const fitX = [xmin, xmax], fitY = fitX.map(x => slope * x + (mean(Y) - slope * mean(X)));
    const traces = [
      { type: 'scatter', mode: 'markers', name: '稀释度均值', x: X, y: Y, marker: { color: PALETTE[0], size: 9, line: { color: '#000', width: 1 } }, hovertemplate: 'log10=%{x:.2f}<br>Cq=%{y:.2f}<extra></extra>' },
      { type: 'scatter', mode: 'lines', name: '线性拟合', x: fitX, y: fitY, line: { color: PALETTE[1], width: 2, dash: 'dash' }, hoverinfo: 'skip' },
    ];
    if (raw) {
      const rx = [], ry = [];
      Object.entries(raw).forEach(([dil, cqs]) => cqs.forEach(q => { rx.push(Math.log10(Number(dil))); ry.push(q); }));
      traces.unshift({ type: 'scatter', mode: 'markers', name: '复孔', x: rx, y: ry, marker: { color: '#999', size: 5, symbol: 'circle-open' }, hoverinfo: 'skip' });
    }
    const layout = journalLayout({
      height: plotHeight(300, el), showlegend: true,
      xaxis: Object.assign(journalLayout().xaxis, { title: { text: 'log10(稀释倍数)', font: { size: 13 } } }),
      yaxis: Object.assign(journalLayout().yaxis, { title: { text: 'Cq', font: { size: 13 } } }),
      annotations: [{
        x: 0.02, y: 0.98, xref: 'paper', yref: 'paper', xanchor: 'left', yanchor: 'top', showarrow: false, align: 'left',
        text: `${gene ? gene + '<br>' : ''}slope = ${slope.toFixed(3)}<br>R² = ${r2.toFixed(4)}<br>E = ${(E * 100).toFixed(1)}%`,
        font: { size: 12 }, bgcolor: 'rgba(255,255,255,.85)', bordercolor: '#ccc', borderwidth: 1,
      }],
    });
    W.Plotly.newPlot(el, traces, layout, { responsive: true, displaylogo: false });
  }

  // 导出条：SVG 矢量 / PNG 300dpi / PNG 600dpi（宽度按期刊 mm 预设）
  function exportBar(container, getEl, baseName) {
    container.classList.add('fc-export');
    container.innerHTML = `
      <label class="fc-mmlabel">图宽
        <select id="${baseName}_mm"><option value="85">85mm（单栏）</option><option value="120">120mm</option><option value="170" selected>170mm（双栏）</option></select>
      </label>
      <button class="tbtn sec xs" id="${baseName}_svg">SVG</button>
      <button class="tbtn sec xs" id="${baseName}_png300">PNG 300dpi</button>
      <button class="tbtn sec xs" id="${baseName}_png600">PNG 600dpi</button>`;
    const dl = (href, name) => { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); };
    const mm = () => Number(container.querySelector('#' + baseName + '_mm').value) || 170;
    container.querySelector('#' + baseName + '_svg').onclick = async () => {
      const url = await W.Plotly.toImage(getEl(), { format: 'svg', width: 900, height: 420 });
      dl(url, baseName + '.svg');
    };
    const png = async dpi => {
      const width = Math.round(mm() / 25.4 * dpi);
      const height = Math.round(width * 420 / 900);
      const url = await W.Plotly.toImage(getEl(), { format: 'png', width, height, scale: 1 });
      dl(url, `${baseName}_${dpi}dpi.png`);
    };
    container.querySelector('#' + baseName + '_png300').onclick = () => png(300);
    container.querySelector('#' + baseName + '_png600').onclick = () => png(600);
  }

  W.QpcrPlots = { journalLayout, fcChart, stdCurve, exportBar, plotHeight, PALETTE, JOURNAL_FONT, _internal: { cellStats, log2Err, tCdf, tCrit95, starOf } };
})();
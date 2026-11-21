// D1 数据绘图器 —— Plotly.js (MIT) + arquero (BSD-3) 聚合 + B3 统计引擎显著性
// 期刊预设（Okabe-Ito/灰度、Arial、mm 宽度）+ SVG/PNG 300/600dpi 导出（复用 qpcr-plots.exportBar）。
(function () {
  window.LabKitTools = window.LabKitTools || {};
  const W = window;

  // ---- 纯内核（可测试）----
  function aggregate(rows, xk, yk, gk) {
    const at = aq.from(rows).filter(aq.escape(r => r[yk] != null && r[yk] !== '' && Number.isFinite(Number(r[yk]))));
    const keys = gk ? [xk, gk] : [xk];
    const rolled = at.groupby(...keys).rollup({
      mean: aq.op.mean(yk), sd: aq.op.stdev(yk), n: aq.op.count(),
    }).objects();
    const xs = [...new Set(at.array(xk).map(String))];
    const gs = gk ? [...new Set(at.array(gk).map(String))] : [''];
    const cells = [];
    xs.forEach(x => gs.forEach(g => {
      const hit = rolled.find(r => String(r[xk]) === x && (!gk || String(r[gk]) === g));
      const vals = at.filter(aq.escape(r => String(r[xk]) === x && (!gk || String(r[gk]) === g))).array(yk).map(Number);
      cells.push({ x, g, mean: hit ? hit.mean : NaN, sd: hit && hit.n > 1 ? hit.sd : 0, n: hit ? hit.n : 0, vals });
    }));
    return { xs, gs, cells };
  }
  function errOf(cell, mode) {
    if (mode === 'none') return 0;
    const sem = cell.n > 0 ? cell.sd / Math.sqrt(cell.n) : 0;
    if (mode === 'SEM') return sem;
    if (mode === 'CI95') return W.QpcrPlots._internal.tCrit95(cell.n - 1) * sem;
    return cell.sd;
  }
  function pairwiseP(cells, x, gs, method) {
    const out = [];
    for (let i = 0; i < gs.length; i++) for (let j = i + 1; j < gs.length; j++) {
      const a = cells.find(c => c.x === x && c.g === gs[i]);
      const b = cells.find(c => c.x === x && c.g === gs[j]);
      if (!a || !b || a.vals.length < 2 || b.vals.length < 2) continue;
      try {
        const r = method === 'mwu' ? W.statsEngine.mwu(a.vals, b.vals) : W.statsEngine.ttestInd(a.vals, b.vals);
        out.push({ g1: gs[i], g2: gs[j], p: r.p });
      } catch (e) { /* 跳过不可检验对 */ }
    }
    return out;
  }
  W.PlotterCore = { aggregate, errOf, pairwiseP };

  // ---- UI ----
  window.LabKitTools['plotter'] = function (host) {
    const DEMO = 'group,dose,response\nCtrl,0,1.02\nCtrl,0,0.98\nCtrl,0,1.05\nCtrl,0,0.97\nCtrl,0,1.01\nCtrl,0,1.00\n' +
      'Low,10,1.32\nLow,10,1.28\nLow,10,1.41\nLow,10,1.25\nLow,10,1.36\nLow,10,1.30\n' +
      'High,50,2.10\nHigh,50,2.25\nHigh,50,1.98\nHigh,50,2.31\nHigh,50,2.05\nHigh,50,2.18';
    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <button class="tbtn pri" id="ptParse">解析数据</button>
          <button class="tbtn sec" id="ptDemo">示例数据</button>
          <label class="tbtn sec" style="cursor:pointer">导入 CSV<input id="ptFile" type="file" accept=".csv,.tsv,.txt" style="display:none"></label>
        </div>
        <textarea id="ptData" rows="5" class="tmono" style="width:100%;margin-top:8px" placeholder="粘贴 CSV/TSV（首行列名）"></textarea>
      </div>
      <div class="tool-section" id="ptCfg" style="display:none">
        <div class="trow">
          <label class="tfield">图型<select id="ptType"><option value="bar">柱状（均值±误差）</option><option value="box">箱线</option><option value="scatter">散点</option><option value="line">折线（均值）</option></select></label>
          <label class="tfield">X 列<select id="ptX"></select></label>
          <label class="tfield">Y 列<select id="ptY"></select></label>
          <label class="tfield">分组列<select id="ptG"><option value="">无</option></select></label>
          <label class="tfield">误差棒<select id="ptErr"><option>SD</option><option>SEM</option><option>CI95</option><option value="none">无</option></select></label>
        </div>
        <div class="trow" style="margin-top:6px">
          <label class="tfield"><span>显著性括号</span><input id="ptSig" type="checkbox" checked></label>
          <label class="tfield">检验<select id="ptSigMethod"><option value="t">Welch t</option><option value="mwu">Mann-Whitney</option></select></label>
          <label class="tfield"><span>散点加拟合线</span><input id="ptFit" type="checkbox"></label>
          <label class="tfield">配色<select id="ptPalette"><option value="okabe">Okabe-Ito（色盲安全）</option><option value="gray">灰度（黑白印刷）</option></select></label>
          <label class="tfield">字号<input id="ptFont" type="number" value="12" min="8" max="20" style="width:60px"></label>
        </div>
        <div class="trow" style="margin-top:8px">
          <button class="tbtn pri" id="ptDraw">绘图</button>
          <button class="tbtn sec" id="ptSaveCfg">保存配置</button>
          <button class="tbtn sec" id="ptLoadCfg">载入配置</button>
        </div>
      </div>
      <div class="tool-section" id="ptOutSec" style="display:none">
        <div id="ptBar" style="display:flex;gap:6px;align-items:center;margin-bottom:6px"></div>
        <div id="ptPlot"></div>
        <div class="tnote" id="ptNote"></div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let rows = [], cols = [];
    const GRAY = ['#000000', '#555555', '#888888', '#bbbbbb', '#333333', '#666666', '#999999', '#dddddd'];
    const palette = () => $('ptPalette').value === 'gray' ? GRAY : W.QpcrPlots.PALETTE;

    function parse(text) {
      const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true, dynamicTyping: false });
      if (!res.data.length) throw new Error('未解析到数据');
      rows = res.data; cols = res.meta.fields;
      $('ptCfg').style.display = '';
      const numCols = cols.filter(c => rows.filter(r => Number.isFinite(Number(r[c])) && r[c] !== '').length / rows.length > 0.8);
      const fill = (sel, list, prefer) => { sel.innerHTML = list.map(c => `<option ${c === prefer ? 'selected' : ''}>${esc(c)}</option>`).join(''); };
      fill($('ptX'), cols, cols.find(c => /group|dose|time|浓度|组/i.test(c)) || cols[0]);
      fill($('ptY'), numCols.length ? numCols : cols, numCols[numCols.length - 1] || cols[1]);
      $('ptG').innerHTML = '<option value="">无</option>' + cols.map(c => `<option ${/group|组/i.test(c) ? 'selected' : ''}>${esc(c)}</option>`).join('');
      toast(`已解析 ${rows.length} 行`);
    }
    $('ptParse').onclick = () => { try { parse($('ptData').value); } catch (e) { toast(e.message); } };
    $('ptDemo').onclick = () => { $('ptData').value = DEMO; try { parse(DEMO); } catch (e) { toast(e.message); } };
    $('ptFile').onchange = async ev => {
      const f = ev.target.files[0]; if (!f) return;
      const t = await f.text(); $('ptData').value = t;
      try { parse(t); } catch (e) { toast(e.message); }
      ev.target.value = '';
    };

    function draw() {
      const xk = $('ptX').value, yk = $('ptY').value, gk = $('ptG').value || null;
      const type = $('ptType').value, errMode = $('ptErr').value;
      const { xs, gs, cells } = W.PlotterCore.aggregate(rows, xk, yk, gk);
      const pal = palette();
      const font = Number($('ptFont').value) || 12;
      const traces = [], shapes = [], annotations = [];
      const useG = gk && gs.length > 1;
      const groups = useG ? gs : [''];

      if (type === 'bar' || type === 'line') {
        groups.forEach((g, gi) => {
          const y = [], eu = [], ed = [], txt = [];
          xs.forEach(x => {
            const c = cells.find(cc => cc.x === x && cc.g === g);
            if (!c || !c.n) { y.push(null); eu.push(0); ed.push(0); txt.push(''); return; }
            const e = W.PlotterCore.errOf(c, errMode);
            y.push(c.mean); eu.push(e); ed.push(e);
            txt.push(`${x}${useG ? ' / ' + g : ''}<br>mean=${c.mean.toFixed(3)}<br>n=${c.n}, ${errMode}=${e.toFixed(3)}`);
          });
          const base = {
            name: useG ? g : yk, x: xs, y,
            error_y: { type: 'data', array: eu, arrayminus: ed, color: pal[gi % pal.length], thickness: 1.5, width: 5 },
            hovertext: txt, hoverinfo: 'text',
          };
          traces.push(type === 'bar'
            ? Object.assign(base, { type: 'bar', marker: { color: pal[gi % pal.length], line: { color: '#000', width: 0.6 } } })
            : Object.assign(base, { type: 'scatter', mode: 'lines+markers', line: { color: pal[gi % pal.length], width: 2 }, marker: { size: 7, color: pal[gi % pal.length] } }));
        });
      } else if (type === 'box') {
        groups.forEach((g, gi) => {
          const y = [], x = [];
          cells.filter(c => c.g === g).forEach(c => c.vals.forEach(v => { x.push(c.x); y.push(v); }));
          traces.push({
            type: 'box', name: useG ? g : yk, x, y,
            boxpoints: 'all', jitter: 0.4, pointpos: 0, quartilemethod: 'linear',
            marker: { color: pal[gi % pal.length], size: 4, outliercolor: pal[gi % pal.length] },
            line: { color: pal[gi % pal.length], width: 1.5 }, fillcolor: pal[gi % pal.length] + '33',
          });
        });
      } else { // scatter
        groups.forEach((g, gi) => {
          const pts = [];
          cells.filter(c => c.g === g).forEach(c => c.vals.forEach((v, i) => pts.push([Number(c.x) || xs.indexOf(c.x), v])));
          const x = pts.map(p => p[0]), y = pts.map(p => p[1]);
          traces.push({ type: 'scatter', mode: 'markers', name: useG ? g : yk, x, y, marker: { color: pal[gi % pal.length], size: 7, line: { color: '#000', width: 0.5 } } });
          if ($('ptFit').checked && pts.length >= 3) {
            const lr = ss.linearRegression(pts);
            const line = ss.linearRegressionLine(lr);
            const xmin = Math.min(...x), xmax = Math.max(...x);
            const r = ss.sampleCorrelation(x, y);
            traces.push({ type: 'scatter', mode: 'lines', name: `${useG ? g + ' ' : ''}拟合 (r=${r.toFixed(3)})`, x: [xmin, xmax], y: [line(xmin), line(xmax)], line: { color: pal[gi % pal.length], width: 1.5, dash: 'dash' }, hoverinfo: 'skip' });
          }
        });
      }

      // 显著性括号（每个 x 类别内组间两两）
      if ($('ptSig').checked && useG && (type === 'bar' || type === 'box' || type === 'line')) {
        const method = $('ptSigMethod').value;
        xs.forEach((x, xi) => {
          const pairs = W.PlotterCore.pairwiseP(cells, x, gs, method);
          if (!pairs.length) return;
          const topBase = Math.max(...cells.filter(c => c.x === x).map(c => (c.mean || 0) + W.PlotterCore.errOf(c, errMode)), ...cells.filter(c => c.x === x).flatMap(c => c.vals));
          pairs.forEach((pr, pi) => {
            const i1 = gs.indexOf(pr.g1), i2 = gs.indexOf(pr.g2);
            const off = groups.length > 1 ? 0.32 / groups.length : 0;
            const x0 = xi - 0.32 + (i1 + 0.5) * (0.64 / groups.length);
            const x1 = xi - 0.32 + (i2 + 0.5) * (0.64 / groups.length);
            const yBr = topBase * (1 + 0.12 * (pi + 1)) + 0.05 * (pi + 1);
            shapes.push({ type: 'line', x0, x1, y0: yBr, y1: yBr, line: { color: '#000', width: 1 } });
            shapes.push({ type: 'line', x0, x0, y0: yBr - topBase * 0.03, y1: yBr, line: { color: '#000', width: 1 } });
            shapes.push({ type: 'line', x0: x1, x1, y0: yBr - topBase * 0.03, y1: yBr, line: { color: '#000', width: 1 } });
            annotations.push({ x: (x0 + x1) / 2, y: yBr + topBase * 0.03, text: W.QpcrPlots._internal.starOf(pr.p), showarrow: false, font: { size: font, color: pr.p < 0.05 ? '#000' : '#888' } });
          });
        });
      }

      const layout = W.QpcrPlots.journalLayout({
        height: W.QpcrPlots.plotHeight(400), barmode: 'group', boxmode: 'group',
        font: { family: W.QpcrPlots.JOURNAL_FONT, size: font, color: '#000' },
        xaxis: Object.assign(W.QpcrPlots.journalLayout().xaxis, { title: { text: xk, font: { size: font + 1 } }, type: type === 'scatter' && rows.every(r => Number.isFinite(Number(r[xk]))) ? 'linear' : 'category' }),
        yaxis: Object.assign(W.QpcrPlots.journalLayout().yaxis, { title: { text: yk, font: { size: font + 1 } } }),
        shapes, annotations,
        showlegend: useG || traces.length > 1,
      });
      W.Plotly.newPlot($('ptPlot'), traces, layout, { responsive: true, displaylogo: false });
      $('ptOutSec').style.display = '';
      W.QpcrPlots.exportBar($('ptBar'), () => $('ptPlot'), 'figure');
      const sigCount = annotations.length;
      $('ptNote').textContent = `${xs.length} 个 X 水平 · ${groups.length} 组 · ${sigCount} 个显著性标注。箱线四分位为 linear 法（与 numpy percentile 默认一致）。`;
      try { Store.set('tool:plotter-cfg', JSON.stringify(cfg())); } catch (e) { /* 忽略 */ }
    }
    function cfg() {
      return { type: $('ptType').value, x: $('ptX').value, y: $('ptY').value, g: $('ptG').value, err: $('ptErr').value, sig: $('ptSig').checked, method: $('ptSigMethod').value, fit: $('ptFit').checked, palette: $('ptPalette').value, font: $('ptFont').value };
    }
    function applyCfg(c) {
      if (!c) return;
      const set = (id, v) => { const el = $(id); if (el && v != null) el.value = v; };
      set('ptType', c.type); set('ptX', c.x); set('ptY', c.y); set('ptG', c.g); set('ptErr', c.err);
      set('ptSigMethod', c.method); set('ptPalette', c.palette); set('ptFont', c.font);
      $('ptSig').checked = !!c.sig; $('ptFit').checked = !!c.fit;
    }
    $('ptDraw').onclick = () => { try { draw(); } catch (e) { toast('绘图失败：' + e.message); } };
    $('ptSaveCfg').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(cfg(), null, 2)], { type: 'application/json' }));
      a.download = 'plot_config.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    };
    $('ptLoadCfg').onclick = () => {
      try { applyCfg(JSON.parse(Store.get('tool:plotter-cfg', null) || 'null')); toast('已载入上次配置'); } catch (e) { toast('无已保存配置'); }
    };
    ['ptType', 'ptErr', 'ptSig', 'ptSigMethod', 'ptPalette', 'ptFit'].forEach(id => $(id).addEventListener('change', () => { if (rows.length) draw(); }));
    /* P2：统一壳示例入口 + 接收「数据清洗」数据集 */
    host.__lkExample = () => $('ptDemo').click();
    const sess = Store.get('session:dataset', null);
    if (sess && sess.rows && sess.rows.length && sess.cols) {
      const b = document.createElement('div'); b.className = 'tool-banner';
      b.innerHTML = `<span>检测到「数据清洗」送来的数据（${sess.rows.length} 行 × ${sess.cols.length} 列）</span>`;
      const load = document.createElement('button'); load.className = 'tbtn pri'; load.textContent = '载入为 CSV';
      load.onclick = () => {
        const csv = Papa.unparse([sess.cols, ...sess.rows.map(r => sess.cols.map(c => r[c] ?? ''))]);
        $('ptData').value = csv;
        try { parse(csv); toast('已载入清洗数据'); } catch (e) { toast(e.message); }
        b.remove();
      };
      const dismiss = document.createElement('button'); dismiss.className = 'tbtn sec'; dismiss.textContent = '忽略';
      dismiss.onclick = () => { Store.set('session:dataset', null); b.remove(); };
      b.append(load, dismiss);
      host.querySelector('.tool-section').prepend(b);
    }
  };
})();
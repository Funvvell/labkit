// B3 快速假设检验 UI —— 引擎见 tools/lib/stats-engine.js（stdlib + simple-statistics + scipy MWU 移植 + Fisher）
(function () {
  window.LabKitTools = window.LabKitTools || {};
  window.LabKitTools['tests'] = function (host) {
    const E = window.statsEngine;
    const TESTS = [
      { id: 'ttestInd', name: '两独立样本 t 检验', kind: 'two', opts: ['alternative', 'equalVar'] },
      { id: 'ttestPaired', name: '配对 t 检验', kind: 'two', opts: ['alternative'] },
      { id: 'ttestOne', name: '单样本 t 检验', kind: 'one', opts: ['alternative', 'mu'] },
      { id: 'mwu', name: 'Mann-Whitney U（秩和）', kind: 'two', opts: ['alternative', 'mwumethod', 'continuity'] },
      { id: 'wilcoxon', name: 'Wilcoxon 符号秩', kind: 'two', opts: ['alternative'] },
      { id: 'chi2Indep', name: 'χ² 独立性（列联表）', kind: 'matrix', opts: [] },
      { id: 'chi2GOF', name: 'χ² 拟合优度', kind: 'gof', opts: [] },
      { id: 'fisher', name: 'Fisher 精确（2×2）', kind: 'fisher', opts: [] },
      { id: 'bartlett', name: 'Bartlett 方差齐性', kind: 'groups', opts: [] },
      { id: 'correlation', name: '相关分析', kind: 'two', opts: ['corrkind'] },
      { id: 'descriptive', name: '描述统计', kind: 'one', opts: [] },
    ];
    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <label class="tfield">检验方法
            <select id="stKind">${TESTS.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select>
          </label>
          <label class="tfield" id="stAltWrap">备择假设
            <select id="stAlt"><option value="two-sided">双侧</option><option value="less">小于</option><option value="greater">大于</option></select>
          </label>
          <label class="tfield" id="stMuWrap" style="display:none">总体均数 μ₀<input id="stMu" type="number" value="0" step="any"></label>
          <label class="tfield" id="stEqWrap" style="display:none"><span>等方差（pooled）</span><input id="stEq" type="checkbox"></label>
          <label class="tfield" id="stMwuWrap" style="display:none">p 值方法
            <select id="stMwuMethod"><option value="auto">auto</option><option value="exact">exact</option><option value="asymptotic">asymptotic</option></select>
          </label>
          <label class="tfield" id="stContWrap" style="display:none"><span>连续性校正</span><input id="stCont" type="checkbox" checked></label>
          <label class="tfield" id="stCorrWrap" style="display:none">相关类型
            <select id="stCorr"><option value="pearson">Pearson</option><option value="spearman">Spearman</option></select>
          </label>
        </div>
        <div id="stInputs"></div>
        <div class="trow" style="margin-top:8px">
          <button class="tbtn pri" id="stRun">运行检验</button>
          <button class="tbtn sec" id="stDemo">填入示例</button>
          <button class="tbtn sec" id="stCopy" disabled>复制报告串</button>
        </div>
        <div class="tnote">数值可用空格、逗号、换行分隔。列联表每行一组、行内逗号分隔；方差齐性每行一组。小样本（n≤8）无结时 Mann-Whitney 自动用精确法。</div>
      </div>
      <div class="tool-section"><div id="stOut" class="tout">选择方法并输入数据后运行。</div></div>`;

    const $ = id => host.querySelector('#' + id);
    const parseNums = s => String(s).split(/[\s,;，、]+/).map(Number).filter(Number.isFinite);
    let lastReport = '';

    function inputHTML(kind) {
      const ta = (id, ph) => `<label class="tfield" style="flex:1;min-width:220px"><span>${ph}</span><textarea id="${id}" rows="4" class="tmono" placeholder="如 12.1, 13.4, 11.8"></textarea></label>`;
      if (kind === 'two') return `<div class="trow">${ta('stX', '样本 X')}${ta('stY', '样本 Y')}</div>`;
      if (kind === 'one') return `<div class="trow">${ta('stX', '样本数据')}</div>`;
      if (kind === 'matrix') return `<div class="trow">${ta('stX', '列联表（每行一组，如 10,20 换行 30,40）')}</div>`;
      if (kind === 'gof') return `<div class="trow">${ta('stX', '观察频数')}${ta('stY', '期望频数（留空=均匀）')}</div>`;
      if (kind === 'groups') return `<div class="trow">${ta('stX', '每行一组数据')}</div>`;
      if (kind === 'fisher') return `<div class="trow">
        <label class="tfield">a（暴露+病例）<input id="stA" type="number" min="0" step="1" value="10"></label>
        <label class="tfield">b（暴露+对照）<input id="stB" type="number" min="0" step="1" value="20"></label>
        <label class="tfield">c（非暴露+病例）<input id="stC" type="number" min="0" step="1" value="30"></label>
        <label class="tfield">d（非暴露+对照）<input id="stD" type="number" min="0" step="1" value="40"></label></div>`;
      return '';
    }
    function syncKind() {
      const t = TESTS.find(x => x.id === $('stKind').value);
      $('stInputs').innerHTML = inputHTML(t.kind);
      const show = (id, on) => { $(id).style.display = on ? '' : 'none'; };
      show('stAltWrap', t.opts.includes('alternative'));
      show('stMuWrap', t.opts.includes('mu'));
      show('stEqWrap', t.opts.includes('equalVar'));
      show('stMwuWrap', t.opts.includes('mwumethod'));
      show('stContWrap', t.opts.includes('continuity'));
      show('stCorrWrap', t.opts.includes('corrkind'));
      $('stOut').textContent = '选择方法并输入数据后运行。';
      $('stCopy').disabled = true;
    }
    $('stKind').addEventListener('change', syncKind);
    syncKind();

    function fmt(v, d = 4) {
      if (v == null || !Number.isFinite(v)) return '—';
      if (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e6)) return v.toExponential(3);
      return Number(v.toFixed(d)).toString();
    }
    function pStr(p) { return p < 0.001 ? '< .001' : '= ' + p.toFixed(3).replace(/^0/, ''); }

    function run() {
      const t = TESTS.find(x => x.id === $('stKind').value);
      const alt = $('stAlt').value;
      try {
        let r, extra = '';
        const x = $('stX') ? parseNums($('stX').value) : [];
        const y = $('stY') ? parseNums($('stY').value) : [];
        if (t.id === 'ttestInd') r = E.ttestInd(x, y, { equalVar: $('stEq').checked, alternative: alt });
        else if (t.id === 'ttestPaired') r = E.ttestPaired(x, y, alt);
        else if (t.id === 'ttestOne') r = E.ttestOne(x, Number($('stMu').value) || 0, alt);
        else if (t.id === 'mwu') r = E.mwu(x, y, { alternative: alt, method: $('stMwuMethod').value, useContinuity: $('stCont').checked });
        else if (t.id === 'wilcoxon') r = E.wilcoxon(x, y.length ? y : null, alt);
        else if (t.id === 'chi2Indep') {
          const rows = $('stX').value.trim().split(/\n+/).map(l => parseNums(l));
          if (rows.length < 2 || rows.some(rr => rr.length !== rows[0].length)) throw new Error('列联表需至少 2 行且各行等长');
          r = E.chi2Indep(rows);
        } else if (t.id === 'chi2GOF') r = E.chi2GOF(x, y.length ? y : null);
        else if (t.id === 'fisher') r = E.fisher($('stA').value, $('stB').value, $('stC').value, $('stD').value);
        else if (t.id === 'bartlett') {
          const gs = $('stX').value.trim().split(/\n+/).map(l => parseNums(l)).filter(g => g.length);
          r = E.bartlett(gs);
        } else if (t.id === 'correlation') r = E.correlation(x, y, $('stCorr').value);
        else if (t.id === 'descriptive') {
          const d = E.descriptive(x);
          r = { test: '描述统计', statistic: null, p: null };
          extra = `<table class="ttable"><tr><th>n</th><th>均数</th><th>SD</th><th>SE</th><th>中位数</th><th>Q1</th><th>Q3</th><th>最小</th><th>最大</th></tr>
            <tr class="num"><td>${d.n}</td><td>${fmt(d.mean)}</td><td>${fmt(d.sd)}</td><td>${fmt(d.se)}</td><td>${fmt(d.median)}</td><td>${fmt(d.q1)}</td><td>${fmt(d.q3)}</td><td>${fmt(d.min)}</td><td>${fmt(d.max)}</td></tr></table>`;
        }
        let html = `<div><b>${esc(r.test)}</b></div>`;
        if (r.p != null) {
          html += `<table class="ttable"><tr><th>统计量</th><th>p</th>${r.df != null ? '<th>df</th>' : ''}${r.method ? '<th>方法</th>' : ''}${r.z != null ? '<th>z</th>' : ''}</tr>
            <tr class="num"><td>${fmt(r.statistic)}</td><td>${fmt(r.p, 6)}</td>${r.df != null ? `<td>${fmt(r.df, 2)}</td>` : ''}${r.method ? `<td>${r.method}</td>` : ''}${r.z != null ? `<td>${fmt(r.z)}</td>` : ''}</tr></table>`;
          if (r.ci) html += `<div class="tnote">差值 95% CI：[${fmt(r.ci[0])}, ${fmt(r.ci[1])}]</div>`;
          html += `<div class="${r.p < 0.05 ? 'twarn' : 'tnote'}" style="margin-top:6px">${r.p < 0.05 ? 'p < .05，拒绝原假设（差异有统计学意义）' : 'p ≥ .05，不拒绝原假设'}</div>`;
          lastReport = buildReport(t, r, alt);
        } else { lastReport = ''; }
        html += extra;
        $('stOut').innerHTML = html;
        $('stCopy').disabled = !lastReport;
        window.__labkitLastTest = { id: t.id, r, alt };
      } catch (e) {
        $('stOut').innerHTML = `<div class="terr">${esc(e.message || String(e))}</div>`;
        $('stCopy').disabled = true;
      }
    }
    function buildReport(t, r, alt) {
      const dir = alt === 'two-sided' ? '' : (alt === 'less' ? '（单侧：小于）' : '（单侧：大于）');
      if (t.id === 'mwu') return `Mann-Whitney U 检验示两组分布差异${r.p < 0.05 ? '有' : '无'}统计学意义，U = ${fmt(r.statistic, 2)}，p ${pStr(r.p)}${dir}。`;
      if (t.id === 'wilcoxon') return `Wilcoxon 符号秩检验示差异${r.p < 0.05 ? '有' : '无'}统计学意义，W = ${fmt(r.statistic, 2)}，p ${pStr(r.p)}${dir}。`;
      if (t.id === 'fisher') return `Fisher 精确检验示关联${r.p < 0.05 ? '有' : '无'}统计学意义，OR = ${fmt(r.or, 3)}，p ${pStr(r.p)}。`;
      if (t.id === 'chi2Indep' || t.id === 'chi2GOF') return `χ² 检验示${t.id === 'chi2Indep' ? '变量间关联' : '观察分布与期望分布差异'}${r.p < 0.05 ? '有' : '无'}统计学意义，χ²(${r.df}) = ${fmt(r.statistic, 3)}，p ${pStr(r.p)}。`;
      if (t.id === 'bartlett') return `Bartlett 检验示各组方差${r.p < 0.05 ? '不齐' : '齐'}，χ²(${r.k - 1}) = ${fmt(r.statistic, 3)}，p ${pStr(r.p)}。`;
      if (t.id === 'correlation') return `${r.test}示两变量${r.p < 0.05 ? '存在' : '未见'}显著相关，r(${r.df}) = ${fmt(r.statistic, 3)}，p ${pStr(r.p)}。`;
      const tn = t.id === 'ttestPaired' ? '配对 t 检验' : t.id === 'ttestOne' ? '单样本 t 检验' : (r.test || 't 检验');
      return `${tn}示差异${r.p < 0.05 ? '有' : '无'}统计学意义，t(${fmt(r.df, 2)}) = ${fmt(r.statistic, 3)}，p ${pStr(r.p)}${dir}${r.ci ? `，差值 95% CI [${fmt(r.ci[0], 3)}, ${fmt(r.ci[1], 3)}]` : ''}。`;
    }
    $('stRun').addEventListener('click', run);
    $('stCopy').addEventListener('click', () => {
      if (!lastReport) return;
      navigator.clipboard.writeText(lastReport).then(() => toast('已复制报告串')).catch(() => toast('复制失败'));
    });
    $('stDemo').addEventListener('click', () => {
      const t = TESTS.find(x => x.id === $('stKind').value);
      const set = (id, v) => { const el = $(id); if (el) el.value = v; };
      if (t.kind === 'two') { set('stX', '19, 22, 16, 29, 24'); set('stY', '20, 11, 17, 12'); }
      else if (t.kind === 'one') set('stX', '12.1, 13.4, 11.8, 12.9, 13.1, 12.5');
      else if (t.kind === 'matrix') set('stX', '10, 20\n30, 40');
      else if (t.kind === 'gof') { set('stX', '10, 20, 30'); set('stY', ''); }
      else if (t.kind === 'groups') set('stX', '1, 2, 3, 4\n2, 3, 5, 9');
      else if (t.kind === 'fisher') { set('stA', 1); set('stB', 9); set('stC', 11); set('stD', 3); }
      toast('已填入示例数据');
    });
  };
})();
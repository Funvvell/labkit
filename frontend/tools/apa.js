// B8 统计报告串（APA7 / 中文论文句式）—— 薄胶水，无外部依赖
// 规范依据：APA Publication Manual 7th ed. §6.43 统计符号斜体、p 无前导零、< .001。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;

  const f2 = v => Number(v).toFixed(2);
  function pAPA(p) {
    p = Number(p);
    if (!Number.isFinite(p)) return 'p = NA';
    if (p < 0.001) return 'p < .001';
    return 'p = ' + p.toFixed(3).replace(/^0\./, '.');
  }
  function pZh(p) {
    p = Number(p);
    if (!Number.isFinite(p)) return 'P 值缺失';
    if (p < 0.001) return 'P < 0.001';
    return 'P = ' + p.toFixed(3);
  }
  const ciAPA = (lo, hi) => `95% CI [${f2(lo)}, ${f2(hi)}]`;

  // type: t | F | chi2 | fisher | U | W | r | mean
  // fields: {stat, df, df1, df2, p, n, ci:[lo,hi], es, esName, or}
  function format(type, f) {
    let plain = '', html = '', zh = '';
    const sig = Number(f.p) < 0.05;
    if (type === 't') {
      const core = `t(${f2(f.df)}) = ${f2(f.stat)}, ${pAPA(f.p)}`;
      const es = f.es != null && f.es !== '' ? `, ${f.esName || 'd'} = ${f2(f.es)}` : '';
      const ci = f.ci && f.ci.length === 2 ? `, ${ciAPA(f.ci[0], f.ci[1])}` : '';
      plain = core + es + ci;
      html = `<i>t</i>(${f2(f.df)}) = ${f2(f.stat)}, ${pAPA(f.p).replace(/^p/, '<i>p</i>')}${es}${ci}`;
      zh = `t 检验示差异${sig ? '有' : '无'}统计学意义，t(${f2(f.df)}) = ${f2(f.stat)}，${pZh(f.p)}${f.ci && f.ci.length === 2 ? `，差值 95% CI [${f2(f.ci[0])}, ${f2(f.ci[1])}]` : ''}。`;
    } else if (type === 'F') {
      const es = f.es != null && f.es !== '' ? `, η² = ${f2(f.es)}` : '';
      plain = `F(${f2(f.df1)}, ${f2(f.df2)}) = ${f2(f.stat)}, ${pAPA(f.p)}${es}`;
      html = `<i>F</i>(${f2(f.df1)}, ${f2(f.df2)}) = ${f2(f.stat)}, ${pAPA(f.p).replace(/^p/, '<i>p</i>')}${es}`;
      zh = `方差分析示组间差异${sig ? '有' : '无'}统计学意义，F(${f2(f.df1)}, ${f2(f.df2)}) = ${f2(f.stat)}，${pZh(f.p)}。`;
    } else if (type === 'chi2') {
      const nPart = f.n ? `, N = ${f.n}` : '';
      plain = `χ²(${f.df}${nPart}) = ${f2(f.stat)}, ${pAPA(f.p)}`;
      html = `χ²(${f.df}${nPart}) = ${f2(f.stat)}, ${pAPA(f.p).replace(/^p/, '<i>p</i>')}`;
      zh = `χ² 检验示${sig ? '差异有' : '差异无'}统计学意义，χ²(${f.df}) = ${f2(f.stat)}，${pZh(f.p)}。`;
    } else if (type === 'fisher') {
      const orPart = f.or != null && f.or !== '' ? `OR = ${f2(f.or)}, ` : '';
      const ci = f.ci && f.ci.length === 2 ? `${ciAPA(f.ci[0], f.ci[1])}, ` : '';
      plain = `${orPart}${ci}${pAPA(f.p)} (Fisher's exact test)`;
      html = `${orPart}${ci}${pAPA(f.p).replace(/^p/, '<i>p</i>')} (Fisher's exact test)`;
      zh = `Fisher 精确检验示关联${sig ? '有' : '无'}统计学意义${f.or != null && f.or !== '' ? `，OR = ${f2(f.or)}` : ''}，${pZh(f.p)}。`;
    } else if (type === 'U') {
      plain = `U = ${f2(f.stat)}, ${pAPA(f.p)}`;
      html = `<i>U</i> = ${f2(f.stat)}, ${pAPA(f.p).replace(/^p/, '<i>p</i>')}`;
      zh = `Mann-Whitney U 检验示两组分布差异${sig ? '有' : '无'}统计学意义，U = ${f2(f.stat)}，${pZh(f.p)}。`;
    } else if (type === 'W') {
      plain = `W = ${f2(f.stat)}, ${pAPA(f.p)}`;
      html = `<i>W</i> = ${f2(f.stat)}, ${pAPA(f.p).replace(/^p/, '<i>p</i>')}`;
      zh = `Wilcoxon 符号秩检验示差异${sig ? '有' : '无'}统计学意义，W = ${f2(f.stat)}，${pZh(f.p)}。`;
    } else if (type === 'r') {
      const es = f.ci && f.ci.length === 2 ? `, ${ciAPA(f.ci[0], f.ci[1])}` : '';
      plain = `r(${f.df}) = ${f2(f.stat)}, ${pAPA(f.p)}${es}`;
      html = `<i>r</i>(${f.df}) = ${f2(f.stat)}, ${pAPA(f.p).replace(/^p/, '<i>p</i>')}${es}`;
      zh = `相关分析示两变量${sig ? '存在' : '未见'}显著相关，r(${f.df}) = ${f2(f.stat)}，${pZh(f.p)}。`;
    } else if (type === 'mean') {
      plain = `M = ${f2(f.stat)}, SD = ${f2(f.sd)}`;
      html = `<i>M</i> = ${f2(f.stat)}, <i>SD</i> = ${f2(f.sd)}`;
      zh = `均数 ± 标准差为 ${f2(f.stat)} ± ${f2(f.sd)}。`;
    } else throw new Error('未知报告类型');
    return { plain, html, zh };
  }

  // 从 B3 最近一次结果映射
  function fromLastTest(last) {
    if (!last || !last.r) return null;
    const r = last.r;
    switch (last.id) {
      case 'ttestInd': case 'ttestPaired': case 'ttestOne':
        return { type: 't', fields: { stat: r.statistic, df: r.df, p: r.p, ci: r.ci } };
      case 'mwu': return { type: 'U', fields: { stat: r.statistic, p: r.p } };
      case 'wilcoxon': return { type: 'W', fields: { stat: r.statistic, p: r.p } };
      case 'chi2Indep': case 'chi2GOF': return { type: 'chi2', fields: { stat: r.statistic, df: r.df, p: r.p } };
      case 'bartlett': return { type: 'chi2', fields: { stat: r.statistic, df: r.k - 1, p: r.p } };
      case 'fisher': return { type: 'fisher', fields: { or: r.or, p: r.p } };
      case 'correlation': return { type: 'r', fields: { stat: r.statistic, df: r.df, p: r.p } };
      default: return null;
    }
  }

  W.LabKitAPA = { format, fromLastTest, pAPA };

  W.LabKitTools = W.LabKitTools || {};
  W.LabKitTools['apa'] = function (host) {
    const TYPES = [
      { id: 't', name: 't 检验', fields: ['stat', 'df', 'p', 'ci', 'es'] },
      { id: 'F', name: '方差分析 F', fields: ['stat', 'df1', 'df2', 'p', 'es'] },
      { id: 'chi2', name: 'χ² 检验', fields: ['stat', 'df', 'p', 'n'] },
      { id: 'fisher', name: 'Fisher / OR', fields: ['or', 'p', 'ci'] },
      { id: 'U', name: 'Mann-Whitney U', fields: ['stat', 'p'] },
      { id: 'W', name: 'Wilcoxon W', fields: ['stat', 'p'] },
      { id: 'r', name: '相关 r', fields: ['stat', 'df', 'p'] },
      { id: 'mean', name: '均数 ± SD', fields: ['stat', 'sd'] },
    ];
    const LABELS = { stat: '统计量', df: 'df', df1: 'df1', df2: 'df2', p: 'p 值', n: 'N', ci: '95% CI（lo, hi）', es: '效应量（d/η²）', or: 'OR', sd: 'SD' };
    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <label class="tfield">报告类型<select id="apaType">${TYPES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
          <button class="tbtn sec" id="apaLast">载入最近检验结果</button>
        </div>
        <div class="trow" id="apaFields"></div>
        <div class="trow">
          <button class="tbtn pri" id="apaGen">生成</button>
          <button class="tbtn sec" id="apaCopyEn" disabled>复制 APA（英文）</button>
          <button class="tbtn sec" id="apaCopyZh" disabled>复制中文句式</button>
        </div>
        <div class="tnote">APA7：统计符号斜体、p 无前导零、p &lt; .001 截断。效应量与 CI 可留空。</div>
      </div>
      <div class="tool-section"><div id="apaOut" class="tout">填写数值后生成。</div></div>`;
    const $ = id => host.querySelector('#' + id);
    let cur = { plain: '', zh: '' };
    function renderFields() {
      const t = TYPES.find(x => x.id === $('apaType').value);
      $('apaFields').innerHTML = t.fields.map(f =>
        `<label class="tfield">${LABELS[f]}<input id="apa_${f}" type="text" placeholder="${f === 'ci' ? '0.12, 1.88' : ''}"></label>`).join('');
    }
    $('apaType').addEventListener('change', renderFields);
    renderFields();
    function val(f) { const el = $('apa_' + f); return el ? el.value.trim() : ''; }
    function gen() {
      const type = $('apaType').value;
      const f = {};
      TYPES.find(x => x.id === type).fields.forEach(k => {
        const v = val(k);
        if (v === '') return;
        if (k === 'ci') { const parts = v.split(/[,，\s]+/).map(Number); if (parts.length === 2 && parts.every(Number.isFinite)) f.ci = parts; }
        else { const n = Number(v); if (Number.isFinite(n)) f[k] = n; }
      });
      try {
        const r = W.LabKitAPA.format(type, f);
        cur = r;
        $('apaOut').innerHTML = `<div class="tresult"><b>APA7</b><br>${r.html}</div>
          <div class="tresult"><b>中文论文句式</b><br>${esc(r.zh)}</div>`;
        $('apaCopyEn').disabled = false; $('apaCopyZh').disabled = false;
      } catch (e) { $('apaOut').innerHTML = `<div class="terr">${esc(e.message)}</div>`; }
    }
    $('apaGen').addEventListener('click', gen);
    $('apaLast').addEventListener('click', () => {
      const m = W.LabKitAPA.fromLastTest(W.__labkitLastTest || Store.get('session:lastTest', null));
      if (!m) { toast('暂无最近检验结果（先运行「快速假设检验」）'); return; }
      $('apaType').value = m.type; renderFields();
      Object.entries(m.fields).forEach(([k, v]) => {
        const el = $('apa_' + k);
        if (el) el.value = Array.isArray(v) ? v.join(', ') : v;
      });
      gen();
    });
    $('apaCopyEn').addEventListener('click', () => navigator.clipboard.writeText(cur.plain).then(() => toast('已复制 APA 串')).catch(() => toast('复制失败')));
    $('apaCopyZh').addEventListener('click', () => navigator.clipboard.writeText(cur.zh).then(() => toast('已复制中文句式')).catch(() => toast('复制失败')));
  };
})();
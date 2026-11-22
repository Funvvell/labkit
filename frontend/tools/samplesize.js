// B5 样本量与功效 —— 原样复用 OpenEpi SampleSize/Power 模块（见 NOTICE.md）
(function () {
  // 字段定义：key=IEpiFace 单元格, label, def, step
  const MODULES = {
    SSPropor: { name: '率/描述性研究样本量', fields: [
      { k: 'E0D0', label: '总体大小 N', def: 1000000 },
      { k: 'E1D0', label: '预期率 %', def: 50 },
      { k: 'E2D0', label: '精度 d %', def: 5 },
      { k: 'E3D0', label: '设计效应 DEFF', def: 1, step: 0.1 }] },
    SSCC: { name: '病例对照样本量', fields: [
      { k: 'E0D0', label: '置信水平 %', def: 95 },
      { k: 'E1D0', label: '功效 %', def: 80 },
      { k: 'E2D0', label: '对照:病例 比', def: 1, step: 0.1 },
      { k: 'E3D0', label: '对照暴露率 %', def: 10 },
      { k: 'E6D0', label: '病例暴露率 %', def: 20 }] },
    SSCohort: { name: '队列/横断面样本量', fields: [
      { k: 'E0D0', label: '置信水平 %', def: 95 },
      { k: 'E1D0', label: '功效 %', def: 80 },
      { k: 'E2D0', label: '非暴露:暴露 比', def: 1, step: 0.1 },
      { k: 'E3D0', label: '非暴露结局率 %', def: 10 },
      { k: 'E7D0', label: '假设 RR', def: 2, step: 0.1 }] },
    SSMean: { name: '两均数比较样本量', fields: [
      { k: 'E0D2', label: '置信水平 %', def: 95 },
      { k: 'E1D2', label: '功效 %', def: 80 },
      { k: 'E2D2', label: '组2:组1 比', def: 1, step: 0.1 },
      { k: 'E4D5', label: '均数差值', def: 5, step: 0.1 },
      { k: 'E5D0', label: '组1 标准差', def: 10, step: 0.1 },
      { k: 'E5D2', label: '组2 标准差', def: 10, step: 0.1 }] },
    PowerCC: { name: '病例对照功效', fields: powerFields() },
    PowerCohort: { name: '队列功效', fields: powerFields() },
    PowerRCT: { name: 'RCT 功效', fields: powerFields() },
    PowerCross: { name: '横断面功效', fields: powerFields() },
    PowerMean: { name: '两均数功效', fields: [
      { k: 'E0D2', label: '置信水平 %', def: 95 },
      { k: 'E2D0', label: '组1 均数', def: 0, step: 0.1 },
      { k: 'E2D2', label: '组2 均数', def: 5, step: 0.1 },
      { k: 'E3D0', label: '组1 n', def: 30 },
      { k: 'E3D2', label: '组2 n', def: 30 },
      { k: 'E4D0', label: '组1 标准差', def: 10, step: 0.1 },
      { k: 'E4D2', label: '组2 标准差', def: 10, step: 0.1 }] },
  };
  function powerFields() { return [
    { k: 'E0D0', label: '置信水平 %', def: 95 },
    { k: 'E2D0', label: '组1 n（病例/暴露）', def: 100 },
    { k: 'E2D1', label: '组2 n（对照/非暴露）', def: 100 },
    { k: 'E3D0', label: '组1 率 %', def: 20 },
    { k: 'E3D1', label: '组2 率 %', def: 10 }]; }

  window.LabKitTools['samplesize'] = function (host) {
    const opts = Object.entries(MODULES).map(([k, m]) => `<option value="${k}">${m.name}</option>`).join('');
    host.innerHTML = `
      <div class="tool-section">
        <h3>选择计算类型</h3>
        <div class="trow">
          <div class="tfield"><label>模块</label><select id="ss-mod">${opts}</select></div>
          <button class="tbtn pri" id="ss-run">计算</button>
          <button class="tbtn sec" id="ss-copy">复制结果文本</button>
        </div>
        <div id="ss-fields"></div>
        <div class="tout" id="ss-warn"></div>
        <div class="tout oe-output" id="ss-out"></div>
        <div class="tnote">引擎：OpenEpi SampleSize / Power 模块，源码逐字复用（Kelsey / Fleiss / Schlesselman 公式）。</div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    function renderFields() {
      const m = MODULES[$('ss-mod').value];
      /* label 包裹控件（原生点标签聚焦），比 div>label+input 少一层，且无需 for/id 配对 */
      $('ss-fields').innerHTML = '<div class="trow">' + m.fields.map(f =>
        `<label class="tfield"><span>${f.label}</span><input type="number" data-k="${f.k}" value="${f.def}" step="${f.step || 1}"></label>`).join('') + '</div>';
    }
    $('ss-mod').onchange = renderFields;
    renderFields();
    $('ss-run').onclick = () => {
      const name = $('ss-mod').value;
      const inputs = [...host.querySelectorAll('#ss-fields input')];
      $('ss-warn').innerHTML = '';
      $('ss-out').innerHTML = '';
      /* 空值 / 非数值直接拦下：NaN 送进 OpenEpi 会安静地算出无意义结果 */
      const bad = inputs.filter(inp => inp.value.trim() === '' || !Number.isFinite(Number(inp.value)));
      inputs.forEach(inp => inp.removeAttribute('aria-invalid'));
      if (bad.length) {
        bad.forEach(inp => inp.setAttribute('aria-invalid', 'true'));
        const names = bad.map(inp => inp.closest('label').querySelector('span').textContent).join('、');
        $('ss-warn').innerHTML = '<div class="terr">请填写有效数字：' + esc(names) + '</div>';
        (bad[0] || inputs[0]).focus();
        return;
      }
      const fields = {};
      inputs.forEach(inp => { fields[inp.dataset.k] = Number(inp.value); });
      try {
        OpenEpiAdapter.deriveFields(name, fields);
        $('ss-out').innerHTML = OpenEpiAdapter.runModule(name, fields);
        const alerts = window.__oeLastAlerts || [];
        if (alerts.length) $('ss-warn').innerHTML = alerts.map(a => '<div class="twarn">' + esc(a) + '</div>').join('');
      } catch (e) {
        $('ss-warn').innerHTML = '<div class="terr">' + esc(e.message || String(e)) + '</div>';
      }
    };
    $('ss-copy').onclick = () => {
      const txt = $('ss-out').innerText;
      if (!txt) { toast('先计算'); return; }
      navigator.clipboard.writeText(txt).then(() => toast('已复制'));
    };
  };
})();
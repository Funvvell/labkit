// C1 实验计算器合集 —— Mixology 移植 + 标准实验公式（见 NOTICE.md）
(function () {
  window.LabKitTools['labcalc'] = function (host) {
    const reagents = window.REAGENT_MW || {};
    const rOpts = '<option value="">— 选择试剂（自动填 MW）—</option>' + Object.keys(reagents).map(k => `<option value="${reagents[k]}">${k}（${reagents[k]}）</option>`).join('');
    /* 字段统一用 label 包裹控件（点标签即聚焦，读屏能念出字段名），不依赖 for/id 配对 */
    host.innerHTML = `
      <div class="tool-section">
        <h3>配液计算（Mixology）</h3>
        <div class="hint">称量法：由目标浓度算固体质量；量取法：由母液算吸取体积。浓度单位 g/L 与 mol/L（1 mg/mL = 1 g/L）。</div>
        <div class="trow">
          <label class="tfield w-lg"><span>试剂</span><select id="lc-reagent">${rOpts}</select></label>
          <label class="tfield w-md"><span>分子量 MW</span><input type="number" id="lc-mw" value="58.443" step="0.001"></label>
          <label class="tfield w-sm"><span>终体积</span><input type="number" id="lc-v" value="0.5" step="0.01"></label>
          <label class="tfield w-sm"><span>体积单位</span><select id="lc-vu"><option value="L">L</option><option value="mL" selected>mL</option><option value="uL">µL</option></select></label>
        </div>
        <div class="trow">
          <label class="tfield w-sm"><span>目标浓度</span><input type="number" id="lc-c" value="0.1" step="0.001"></label>
          <label class="tfield w-sm"><span>浓度类型</span><select id="lc-ct"><option value="mol/L">mol/L</option><option value="g/L">g/L</option></select></label>
          <label class="tfield w-sm"><span>母液浓度（量取法）</span><input type="number" id="lc-stock" value="1" step="0.001"></label>
          <label class="tfield w-sm"><span>母液类型</span><select id="lc-st"><option value="mol/L">mol/L</option><option value="g/L">g/L</option></select></label>
        </div>
        <div class="trow">
          <label class="tfield w-sm"><span>输出质量单位</span><select id="lc-mu"><option value="kg">kg</option><option value="g" selected>g</option><option value="mg">mg</option><option value="ug">µg</option><option value="ng">ng</option></select></label>
          <label class="tfield w-sm"><span>输出体积单位</span><select id="lc-vu2"><option value="L">L</option><option value="mL" selected>mL</option><option value="uL">µL</option></select></label>
          <button class="tbtn pri" id="lc-run">计算</button>
        </div>
        <div class="tout" id="lc-out"></div>
      </div>
      <div class="tool-section">
        <h3>稀释 C1V1 = C2V2</h3>
        <div class="trow">
          <label class="tfield w-sm"><span>母液浓度 C1</span><input type="number" id="dl-c1" value="10" step="0.01"></label>
          <label class="tfield w-sm"><span>目标浓度 C2</span><input type="number" id="dl-c2" value="1" step="0.01"></label>
          <label class="tfield w-sm"><span>终体积 V2</span><input type="number" id="dl-v2" value="50" step="0.1"></label>
          <label class="tfield w-sm"><span>体积单位</span><select id="dl-u"><option value="mL" selected>mL</option><option value="uL">µL</option><option value="L">L</option></select></label>
          <button class="tbtn pri" id="dl-run">计算</button>
        </div>
        <div class="tout" id="dl-out"></div>
      </div>
      <div class="tool-section">
        <h3>离心 RCF ↔ rpm</h3>
        <div class="hint">RCF = 1.118×10⁻⁵ × r(cm) × rpm²。r 为转子半径（轴心到管底）。</div>
        <div class="trow">
          <label class="tfield w-sm"><span>半径 r (cm)</span><input type="number" id="cf-r" value="10" step="0.1"></label>
          <label class="tfield w-sm"><span>转速 rpm</span><input type="number" id="cf-rpm" value="10000"></label>
          <label class="tfield w-sm"><span>或 RCF (×g)</span><input type="number" id="cf-rcf" value=""></label>
          <button class="tbtn pri" id="cf-run">换算</button>
        </div>
        <div class="tout" id="cf-out"></div>
      </div>
      <div class="tool-section">
        <h3>铺板密度</h3>
        <div class="trow">
          <label class="tfield w-md"><span>目标细胞数/孔</span><input type="number" id="pl-n" value="100000"></label>
          <label class="tfield w-md"><span>悬液密度 (个/mL)</span><input type="number" id="pl-d" value="1000000"></label>
          <button class="tbtn pri" id="pl-run">计算加样体积</button>
        </div>
        <div class="trow">
          <label class="tfield w-sm"><span>孔面积 (cm²)</span><input type="number" id="pl-a" value="9.6" step="0.1"></label>
          <label class="tfield w-sm"><span>目标融合度 (0-1)</span><input type="number" id="pl-cf" value="0.8" step="0.05"></label>
          <label class="tfield w-md"><span>满底产率 (个/cm²)</span><input type="number" id="pl-y" value="100000"></label>
          <button class="tbtn sec" id="pl-est">估算每孔细胞数</button>
        </div>
        <div class="tout" id="pl-out"></div>
      </div>
      <div class="tool-section">
        <h3>感染 MOI</h3>
        <div class="hint">MOI = PFU/细胞数；病毒体积 = MOI × 细胞数 ÷ 滴度。</div>
        <div class="trow">
          <label class="tfield w-sm"><span>MOI</span><input type="number" id="mo-m" value="0.1" step="0.01"></label>
          <label class="tfield w-md"><span>细胞数</span><input type="number" id="mo-c" value="1000000"></label>
          <label class="tfield w-md"><span>滴度 (PFU/mL)</span><input type="number" id="mo-t" value="100000000"></label>
          <button class="tbtn pri" id="mo-run">计算</button>
        </div>
        <div class="tout" id="mo-out"></div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    const volFactor = { L: 1, mL: 1e-3, uL: 1e-6 };
    const VOL_LABEL = { L: 'L', mL: 'mL', uL: 'µL' };
    function show(id, r, fmt) {
      $(id).innerHTML = r.error ? '<div class="terr">' + esc(r.error) + '</div>' : '<div class="tresult">' + fmt(r) + '</div>';
    }
    $('lc-reagent').onchange = () => { if ($('lc-reagent').value) $('lc-mw').value = $('lc-reagent').value; };
    $('lc-run').onclick = () => {
      const volumeL = parseFloat($('lc-v').value) * volFactor[$('lc-vu').value];
      const mw = parseFloat($('lc-mw').value);
      const conc = parseFloat($('lc-c').value);
      const mass = mixology.neededMass({ volumeL, conc, type: $('lc-ct').value, mw, massUnit: $('lc-mu').value });
      const vol = mixology.neededVolume({ volumeL, desired: { number: conc, type: $('lc-ct').value }, stock: { number: parseFloat($('lc-stock').value), type: $('lc-st').value }, mw, volUnit: $('lc-vu2').value });
      let html = '';
      html += mass.error ? '<div class="terr">称量法：' + esc(mass.error) + '</div>' : '<div class="tresult">称量法：称取 ' + mass.value + ' ' + mass.unit + '，定容至 ' + $('lc-v').value + ' ' + VOL_LABEL[$('lc-vu').value] + '</div>';
      html += vol.error ? '<div class="terr">量取法：' + esc(vol.error) + '</div>' : '<div class="tresult">量取法：吸取母液 ' + vol.value + ' ' + vol.unit + '，定容至 ' + $('lc-v').value + ' ' + VOL_LABEL[$('lc-vu').value] + '</div>';
      $('lc-out').innerHTML = html;
    };
    $('dl-run').onclick = () => {
      const r = mixology.dilution({ c1: parseFloat($('dl-c1').value), c2: parseFloat($('dl-c2').value), v2: parseFloat($('dl-v2').value) });
      const u = $('dl-u').value;
      show('dl-out', r, x => `吸取母液 ${mixology.formatNumber(x.v1)} ${VOL_LABEL[u]} + 稀释液 ${mixology.formatNumber(x.diluent)} ${VOL_LABEL[u]} → 终体积 ${$('dl-v2').value} ${VOL_LABEL[u]}`);
    };
    $('cf-run').onclick = () => {
      const r = parseFloat($('cf-r').value);
      if (!(r > 0)) { $('cf-out').innerHTML = '<div class="terr">半径需 > 0</div>'; return; }
      const rcfIn = $('cf-rcf').value.trim();
      if (rcfIn !== '') {
        const rpm = mixology.rcfToRpm(parseFloat(rcfIn), r);
        $('cf-out').innerHTML = '<div class="tresult">' + mixology.formatNumber(rcfIn) + ' ×g → ' + Math.round(rpm) + ' rpm</div>';
      } else {
        const rpm = parseFloat($('cf-rpm').value);
        $('cf-out').innerHTML = '<div class="tresult">' + rpm + ' rpm → ' + mixology.formatNumber(mixology.rpmToRcf(rpm, r)) + ' ×g</div>';
      }
    };
    $('pl-run').onclick = () => {
      const r = mixology.plating({ cellsPerWell: parseFloat($('pl-n').value), densityPerMl: parseFloat($('pl-d').value) });
      show('pl-out', r, x => `每孔加细胞悬液 ${mixology.formatNumber(x.volumePerWellUl)} µL（含 ${$('pl-n').value} 个细胞），其余补培养基`);
    };
    $('pl-est').onclick = () => {
      const r = mixology.plating({ wellAreaCm2: parseFloat($('pl-a').value), targetConfluence: parseFloat($('pl-cf').value), yieldPerCm2: parseFloat($('pl-y').value) });
      show('pl-out', r, x => `估算每孔需 ${Math.round(x.cellsPerWellEst).toLocaleString()} 个细胞（${$('pl-cf').value * 100}% 融合度）`);
    };
    $('mo-run').onclick = () => {
      const r = mixology.moi({ moi: parseFloat($('mo-m').value), cells: parseFloat($('mo-c').value), titerPfuPerMl: parseFloat($('mo-t').value) });
      show('mo-out', r, x => `需 ${x.pfu.toExponential(3)} PFU → 加病毒液 ${mixology.formatNumber(x.volumeUl)} µL`);
    };
    /* P2：统一壳一键示例（0.1 mol/L NaCl 500 mL + 10× 稀释 + 1000×g 离心 + MOI 0.1） */
    host.__lkExample = () => {
      $('lc-mw').value = '58.443'; $('lc-v').value = '0.5'; $('lc-vu').value = 'L';
      $('lc-c').value = '0.1'; $('lc-ct').value = 'mol/L'; $('lc-stock').value = '1'; $('lc-st').value = 'mol/L';
      $('dl-c1').value = '1'; $('dl-c2').value = '0.1'; $('dl-v2').value = '100';
      $('cf-r').value = '10'; $('cf-rcf').value = '1000';
      $('lc-run').click(); $('dl-run').click(); $('cf-run').click(); $('mo-run').click();
      toast('已载入示例并计算全部模块');
    };
  };
})();

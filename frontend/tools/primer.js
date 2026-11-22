// C2 引物工作台 —— Biopython MeltingTemp 移植（BSD，见 NOTICE.md）
(function () {
  window.LabKitTools['primer'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <h3>引物序列</h3>
        <div class="trow">
          <label class="tfield grow"><span>正向引物 5'→3'（ACGT）</span><input type="text" id="pr-f" value="CGTTCCAAAGATGTGGGCATGAGCTTAC" spellcheck="false" autocapitalize="characters"></label>
        </div>
        <div class="trow">
          <label class="tfield grow"><span>反向引物（可选，用于配对检查）</span><input type="text" id="pr-r" value="" placeholder="5'→3'" spellcheck="false"></label>
        </div>
        <div class="trow">
          <label class="tfield w-md"><span>NN 热力学表</span><select id="pr-table"><option value="NN3" selected>Allawi-SantaLucia 1997</option><option value="NN4">SantaLucia-Hicks 2004</option><option value="NN2">Sugimoto 1996</option><option value="NN1">Breslauer 1986</option></select></label>
          <label class="tfield w-md"><span>盐校正</span><select id="pr-sc"><option value="5" selected>5 SantaLucia1998(ΔS)</option><option value="7">7 Owczarzy2008</option><option value="6">6 Owczarzy2004</option><option value="1">1 Schildkraut</option><option value="2">2 Wetmur</option><option value="3">3 SantaLucia1996</option><option value="4">4 SantaLucia1998(Tm)</option><option value="0">0 不校正</option></select></label>
          <label class="tfield w-sm"><span>Na⁺ mM</span><input type="number" id="pr-na" value="50"></label>
          <label class="tfield w-sm"><span>K⁺ mM</span><input type="number" id="pr-k" value="0"></label>
          <label class="tfield w-sm"><span>Tris mM</span><input type="number" id="pr-tris" value="0"></label>
          <label class="tfield w-sm"><span>Mg²⁺ mM</span><input type="number" id="pr-mg" value="0" step="0.1"></label>
          <label class="tfield w-sm"><span>dNTPs mM</span><input type="number" id="pr-dntp" value="0" step="0.1"></label>
        </div>
        <div class="trow">
          <label class="tfield w-sm"><span>引物浓度 nM (dnac1)</span><input type="number" id="pr-c1" value="25"></label>
          <label class="tfield w-sm"><span>模板浓度 nM (dnac2)</span><input type="number" id="pr-c2" value="25"></label>
          <button class="tbtn pri" id="pr-run">分析</button>
          <button class="tbtn sec" id="pr-copy">复制报告</button>
        </div>
        <div class="tout" id="pr-err"></div>
        <div class="tout" id="pr-out"></div>
        <div class="tnote">Tm_NN 为最近邻热力学法（Biopython 移植，与上游 doctest 基准一致）；Wallace 为 14-20nt 经验规则；Tm_GC 为 Primer3Plus 产物 Tm 公式。二聚体/发夹为启发式提示，非热力学预测。</div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    function opts() {
      return {
        table: $('pr-table').value, saltcorr: parseInt($('pr-sc').value, 10),
        Na: +$('pr-na').value, K: +$('pr-k').value, Tris: +$('pr-tris').value,
        Mg: +$('pr-mg').value, dNTPs: +$('pr-dntp').value,
        dnac1: +$('pr-c1').value, dnac2: +$('pr-c2').value
      };
    }
    function stats(seq) {
      const s = meltingTemp.clean(seq);
      const mw = meltingTemp.primerMW(s);
      return {
        len: s.length, gc: (meltingTemp.gcFraction(s) * 100).toFixed(1),
        mw: mw.toFixed(1), nn: meltingTemp.tmNN(s, opts()).toFixed(2),
        wallace: meltingTemp.tmWallace(s), gcTm: meltingTemp.tmGC(s, { valueset: 7, Na: +$('pr-na').value }).toFixed(2),
        odPmol: (33000 / mw).toFixed(2), seq: s
      };
    }
    // 启发式：3' 端互补 ≥4nt 提示二聚体；反向重复茎≥3 环≥3 提示发夹
    function dimerCheck(a, b) {
      const rc = meltingTemp.revcomp(b);
      let best = 0;
      for (let i = Math.max(0, a.length - 10); i < a.length; i++) {
        for (let j = 0; j < Math.min(10, rc.length); j++) {
          let k = 0;
          while (i + k < a.length && j + k < rc.length && a[i + k] === rc[j + k]) k++;
          if (i + k >= a.length - 1 && k > best) best = k; // 延伸到 3' 末端
        }
      }
      return best;
    }
    function hairpinCheck(s) {
      const rc = meltingTemp.revcomp(s);
      for (let stem = Math.min(8, Math.floor(s.length / 2)); stem >= 3; stem--) {
        for (let i = 0; i + stem <= s.length; i++) {
          const arm = s.slice(i, i + stem);
          const idx = rc.indexOf(arm);
          if (idx >= 0) {
            const j = s.length - idx - stem; // 互补臂在原序列的位置
            const loop = j - (i + stem);
            if (loop >= 3 && j > i) return { stem, loop };
          }
        }
      }
      return null;
    }
    let report = '';
    $('pr-run').onclick = () => {
      $('pr-err').innerHTML = '';
      try {
        /* 空序列会让 Tm_NN 抛错、表格照旧渲染出 NaN；非 ACGT 字符会被 clean() 静默剔除。
           两者都在入口拦下，报错说清是哪个引物、哪个字符。 */
        const checkSeq = (id, name) => {
          const raw = $(id).value;
          if (!raw.trim()) throw new Error(name + '为空：请粘贴 5\'→3\' 序列');
          const bad = raw.toUpperCase().replace(/\s+/g, '').split('').filter(c => !'ACGT'.includes(c));
          if (bad.length) throw new Error(name + '含非 ACGT 字符：' + [...new Set(bad)].join(' '));
          return raw;
        };
        checkSeq('pr-f', '正向引物');
        if ($('pr-r').value.trim()) checkSeq('pr-r', '反向引物');
        const f = stats($('pr-f').value);
        let html = '<table class="ttable"><tr><th>指标</th><th class="num">正向</th>' + ($('pr-r').value.trim() ? '<th class="num">反向</th>' : '') + '</tr>';
        let r = null;
        if ($('pr-r').value.trim()) r = stats($('pr-r').value);
        const row = (name, fv, rv) => `<tr><td>${name}</td><td class="num">${fv}</td>${r ? `<td class="num">${rv}</td>` : ''}</tr>`;
        html += row('长度 nt', f.len, r && r.len);
        html += row('GC %', f.gc, r && r.gc);
        html += row('分子量 g/mol', f.mw, r && r.mw);
        html += row('<b>Tm_NN °C</b>', '<b>' + f.nn + '</b>', r && '<b>' + r.nn + '</b>');
        html += row('Tm_Wallace °C', f.wallace, r && r.wallace);
        html += row('Tm_GC °C', f.gcTm, r && r.gcTm);
        html += row('1 OD260 ≈ pmol/µL', f.odPmol, r && r.odPmol);
        html += '</table>';
        const warns = [];
        const hpF = hairpinCheck(f.seq); if (hpF) warns.push(`正向引物可能存在发夹（茎 ${hpF.stem}bp / 环 ${hpF.loop}nt）`);
        if (r) {
          const hpR = hairpinCheck(r.seq); if (hpR) warns.push(`反向引物可能存在发夹（茎 ${hpR.stem}bp / 环 ${hpR.loop}nt）`);
          const d = dimerCheck(f.seq, r.seq);
          if (d >= 4) warns.push(`正反向 3' 端互补 ${d}nt，存在引物二聚体风险`);
          const dt = Math.abs(parseFloat(f.nn) - parseFloat(r.nn));
          if (dt > 5) warns.push(`两条引物 Tm 差 ${dt.toFixed(1)}°C（>5°C），建议调整`);
          html += `<div class="tnote">Tm 差值 ΔTm = ${dt.toFixed(2)}°C · 1 OD260 ≈ 33 µg/mL（ssDNA）</div>`;
        }
        if (warns.length) html += warns.map(w => '<div class="twarn">' + esc(w) + '</div>').join('');
        $('pr-out').innerHTML = html;
        report = $('pr-out').innerText;
      } catch (e) {
        $('pr-err').innerHTML = '<div class="terr">' + esc(e.message || String(e)) + '</div>';
      }
    };
    $('pr-copy').onclick = () => { if (!report) { toast('先分析'); return; } navigator.clipboard.writeText(report).then(() => toast('已复制')); };
  };
})();
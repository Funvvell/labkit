// B4 2×2 表分析 —— 原样复用 OpenEpi TwobyTwo + MartinStats（见 NOTICE.md）
(function () {
  function h(strings, ...vals) { return strings.reduce((s, str, i) => s + str + (vals[i] ?? ''), ''); }
  function num(v, d) { const x = parseFloat(v); return Number.isFinite(x) ? x : d; }

  window.LabKitTools['epi2x2'] = function (host) {
    host.innerHTML = h`
      <div class="tool-section">
        <h3>四格表输入</h3>
        <div class="hint">行=暴露，列=疾病。a=暴露且患病，b=非暴露患病，c=暴露非病，d=非暴露非病。分层时每行一个层（a b c d，空格分隔）。</div>
        <div class="trow">
          <div class="tfield"><label>a 暴露+患病</label><input type="number" id="oe-a" value="10" min="0"></div>
          <div class="tfield"><label>b 非暴露+患病</label><input type="number" id="oe-b" value="20" min="0"></div>
          <div class="tfield"><label>c 暴露+非病</label><input type="number" id="oe-c" value="30" min="0"></div>
          <div class="tfield"><label>d 非暴露+非病</label><input type="number" id="oe-d" value="40" min="0"></div>
          <div class="tfield"><label>置信水平 %</label><input type="number" id="oe-cl" value="95" min="50" max="99.99" step="0.01"></div>
        </div>
        <div class="trow">
          <div class="tfield" style="flex:1"><label>分层数据（可选，每行 a b c d；填写后忽略上方单表）</label><textarea id="oe-strata" rows="3" placeholder="10 20 30 40&#10;15 25 35 45"></textarea></div>
        </div>
        <div class="trow">
          <label style="font-size:12.5px;display:flex;gap:6px;align-items:center"><input type="checkbox" id="oe-cc"> 病例对照设计（OR 为主）</label>
          <button class="tbtn pri" id="oe-run">计算</button>
          <button class="tbtn sec" id="oe-copy">复制结果文本</button>
        </div>
        <div class="tout" id="oe-warn"></div>
        <div class="tout oe-output" id="oe-out"></div>
        <div class="tnote">引擎：OpenEpi（www.openepi.com）TwobyTwo + Martin 精确法，源码逐字复用。输出含 OR/RR 及 Woolf CI、χ²、Fisher 精确、MH 分层调整、Breslow-Day 齐性检验。</div>
      </div>`;

    const $ = id => host.querySelector('#' + id);
    $('oe-run').onclick = () => {
      const warn = $('oe-warn'); warn.innerHTML = '';
      let tables;
      const raw = $('oe-strata').value.trim();
      if (raw) {
        tables = raw.split(/\n+/).map(line => line.trim().split(/[\s,;]+/).map(Number)).filter(r => r.length === 4 && r.every(Number.isFinite));
        if (!tables.length) { warn.innerHTML = '<div class="terr">分层数据格式错误：每行需 4 个数字</div>'; return; }
      } else {
        tables = [[num($('oe-a').value, 0), num($('oe-b').value, 0), num($('oe-c').value, 0), num($('oe-d').value, 0)]];
      }
      try {
        const html = OpenEpiAdapter.run2x2(tables, { conflevel: num($('oe-cl').value, 95), casecontrol: $('oe-cc').checked });
        $('oe-out').innerHTML = html;
        const alerts = window.__oeLastAlerts || [];
        if (alerts.length) warn.innerHTML = alerts.map(a => '<div class="twarn">' + esc(a) + '</div>').join('');
      } catch (e) {
        warn.innerHTML = '<div class="terr">' + esc(e.message || String(e)) + '</div>';
      }
    };
    $('oe-copy').onclick = () => {
      const txt = $('oe-out').innerText;
      if (!txt) { toast('先计算'); return; }
      navigator.clipboard.writeText(txt).then(() => toast('已复制'));
    };
  };
})();
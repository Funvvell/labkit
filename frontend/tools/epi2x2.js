// B4 2×2 表分析 —— 原样复用 OpenEpi TwobyTwo + MartinStats（见 NOTICE.md）
(function () {
  function h(strings, ...vals) { return strings.reduce((s, str, i) => s + str + (vals[i] ?? ''), ''); }

  window.LabKitTools['epi2x2'] = function (host) {
    host.innerHTML = h`
      <div class="tool-section">
        <h3>四格表输入</h3>
        <div class="hint">行=暴露，列=疾病。a=暴露且患病，b=非暴露患病，c=暴露非病，d=非暴露非病。分层时每行一个层（a b c d，空格分隔）。</div>
        <div class="trow">
          <div class="tfield"><label for="oe-a">a 暴露+患病</label><input type="number" id="oe-a" value="10" min="0"></div>
          <div class="tfield"><label for="oe-b">b 非暴露+患病</label><input type="number" id="oe-b" value="20" min="0"></div>
          <div class="tfield"><label for="oe-c">c 暴露+非病</label><input type="number" id="oe-c" value="30" min="0"></div>
          <div class="tfield"><label for="oe-d">d 非暴露+非病</label><input type="number" id="oe-d" value="40" min="0"></div>
          <div class="tfield"><label for="oe-cl">置信水平 %</label><input type="number" id="oe-cl" value="95" min="50" max="99.99" step="0.01"></div>
        </div>
        <div class="trow">
          <div class="tfield grow"><label for="oe-strata">分层数据（可选，每行 a b c d；填写后忽略上方单表）</label><textarea id="oe-strata" rows="3" placeholder="10 20 30 40&#10;15 25 35 45"></textarea></div>
        </div>
        <div class="trow">
          <label class="tcheck"><input type="checkbox" id="oe-cc"> 病例对照设计（OR 为主）</label>
          <button class="tbtn pri" id="oe-run">计算</button>
          <button class="tbtn sec" id="oe-copy">复制结果文本</button>
        </div>
        <div class="tout" id="oe-warn"></div>
        <div class="tout oe-output" id="oe-out"></div>
        <div class="tnote">引擎：OpenEpi（www.openepi.com）TwobyTwo + Martin 精确法，源码逐字复用。输出含 OR/RR 及 Woolf CI、χ²、Fisher 精确、MH 分层调整、Breslow-Day 齐性检验。</div>
      </div>`;

    const $ = id => host.querySelector('#' + id);

    /* 四格必须齐全且为非负数字：缺一项就报错，不再用 0 静默补位（补位会算出看起来正常的结果）。 */
    function readCells() {
      const ids = ['oe-a', 'oe-b', 'oe-c', 'oe-d'];
      const labels = ['a', 'b', 'c', 'd'];
      const raw = ids.map(id => $(id).value.trim());
      for (let i = 0; i < raw.length; i++) {
        const n = Number(raw[i]);
        if (raw[i] === '' || !Number.isFinite(n) || n < 0)
          throw new Error(`四格表 ${labels[i]} 需为非负数字（当前为「${raw[i] || '空'}」）`);
      }
      return raw.map(Number);
    }

    $('oe-run').onclick = () => {
      const warn = $('oe-warn'); warn.innerHTML = '';
      $('oe-out').innerHTML = '';
      try {
        let tables;
        const raw = $('oe-strata').value.trim();
        if (raw) {
          const lines = raw.split(/\n+/).map(line => line.trim()).filter(Boolean);
          const bad = [];
          tables = lines.map((line, li) => {
            const cells = line.split(/[\s,;]+/).filter(Boolean).map(Number);
            if (cells.length !== 4 || !cells.every(Number.isFinite)) bad.push(li + 1);
            return cells;
          }).filter(c => c.length === 4 && c.every(Number.isFinite));
          if (bad.length) throw new Error('分层数据第 ' + bad.join('、') + ' 行格式错误：每行需 4 个数字');
          if (!tables.length) throw new Error('分层数据为空：每行需 4 个数字');
        } else {
          tables = [readCells()];
        }
        const cl = Number($('oe-cl').value);
        if (!Number.isFinite(cl) || cl < 50) throw new Error('置信水平需 ≥ 50');
        const html = OpenEpiAdapter.run2x2(tables, { conflevel: cl, casecontrol: $('oe-cc').checked });
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
    /* P2：统一壳一键示例（两层分层数据，演示 MH 调整） */
    host.__lkExample = () => {
      $('oe-strata').value = '10 20 30 40\n15 25 35 45';
      $('oe-cc').checked = false;
      $('oe-run').click();
      toast('已载入分层示例并计算');
    };
  };
})();

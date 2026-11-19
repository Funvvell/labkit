// B6 随机化与盲法 —— randomizr 移植 + seedrandom（见 NOTICE.md）
(function () {
  window.LabKitTools['randomize'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <h3>随机分配方案</h3>
        <div class="hint">算法移植自 DeclareDesign/randomizr（MIT）。指定种子可完整复现；区组/整群模式下 m 表示每个区组（或区组内群数）的处理数。</div>
        <div class="trow">
          <div class="tfield"><label>模式</label><select id="rz-mode">
            <option value="complete">完全随机</option>
            <option value="block">区组随机</option>
            <option value="cluster">整群随机</option>
            <option value="blockcluster">区组 + 整群</option>
          </select></div>
          <div class="tfield"><label>单位数 N</label><input type="number" id="rz-n" value="40" min="2"></div>
          <div class="tfield"><label>分组名（逗号分隔）</label><input type="text" id="rz-conds" value="对照,处理" style="width:160px"></div>
          <div class="tfield"><label>随机种子</label><input type="text" id="rz-seed" value="" style="width:130px" placeholder="留空=随机"></div>
        </div>
        <div class="trow">
          <div class="tfield"><label>处理组数量 m（双臂）</label><input type="number" id="rz-m" value="20" min="0"></div>
          <div class="tfield"><label>或处理概率 prob（0-1，优先于 m 留空时）</label><input type="number" id="rz-prob" value="" step="0.01" min="0" max="1" placeholder="如 0.5"></div>
          <div class="tfield"><label>或多臂各组数 mEach（逗号分隔）</label><input type="text" id="rz-meach" value="" style="width:150px" placeholder="如 10,10,20"></div>
        </div>
        <div class="trow" id="rz-blockrow" style="display:none">
          <div class="tfield" style="flex:1"><label>区组标签（每单位一个，逗号/空格/换行分隔；循环使用）</label><textarea id="rz-blocks" rows="2" placeholder="A,A,A,A,B,B,B,B"></textarea></div>
        </div>
        <div class="trow" id="rz-clusterrow" style="display:none">
          <div class="tfield" style="flex:1"><label>群标签（每单位一个；循环使用）</label><textarea id="rz-clusters" rows="2" placeholder="c1,c1,c2,c2,c3,c3"></textarea></div>
        </div>
        <div class="trow">
          <button class="tbtn pri" id="rz-run">生成随机序列</button>
          <button class="tbtn sec" id="rz-copy">复制 CSV</button>
        </div>
        <div class="tout" id="rz-err"></div>
        <div class="tout" id="rz-summary"></div>
        <div class="tout" id="rz-table" style="max-height:340px;overflow:auto"></div>
        <div class="tnote">分配隐藏建议：将序列交由非招募人员保管，按序使用不透光信封/中心随机系统；记录种子与生成时间以备审计。</div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let lastCSV = '';
    function parseLabels(txt, n) {
      const arr = txt.trim().split(/[\s,;，；]+/).filter(Boolean);
      if (!arr.length) return null;
      return Array.from({ length: n }, (_, i) => arr[i % arr.length]);
    }
    function syncRows() {
      const m = $('rz-mode').value;
      $('rz-blockrow').style.display = (m === 'block' || m === 'blockcluster') ? '' : 'none';
      $('rz-clusterrow').style.display = (m === 'cluster' || m === 'blockcluster') ? '' : 'none';
    }
    $('rz-mode').onchange = syncRows; syncRows();
    $('rz-run').onclick = () => {
      $('rz-err').innerHTML = '';
      try {
        const n = parseInt($('rz-n').value, 10);
        if (!(n >= 2)) throw new Error('N 必须 ≥ 2');
        const conditions = $('rz-conds').value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
        if (conditions.length < 2) throw new Error('至少两个分组');
        const seed = $('rz-seed').value.trim() || String(Date.now());
        $('rz-seed').value = seed;
        // seedrandom 3.x：new Math.seedrandom(seed) 返回独立 PRNG 函数（不污染全局 Math.random）
        const rng = Math.seedrandom ? new Math.seedrandom(seed) : Math.random;
        const opts = { conditions, rng };
        const meach = $('rz-meach').value.trim();
        const prob = $('rz-prob').value.trim();
        if (meach) opts.mEach = meach.split(/[,，]/).map(Number);
        else if (prob !== '') opts.prob = parseFloat(prob);
        else opts.m = parseInt($('rz-m').value, 10);
        const mode = $('rz-mode').value;
        const blocks = parseLabels($('rz-blocks').value, n);
        const clusters = parseLabels($('rz-clusters').value, n);
        if ((mode === 'block' || mode === 'blockcluster') && !blocks) throw new Error('请填写区组标签');
        if ((mode === 'cluster' || mode === 'blockcluster') && !clusters) throw new Error('请填写群标签');
        let a;
        if (mode === 'complete') a = randomizr.completeRA(n, opts);
        else if (mode === 'block') a = randomizr.blockRA(blocks, opts);
        else if (mode === 'cluster') a = randomizr.clusterRA(clusters, opts);
        else a = randomizr.blockAndClusterRA(blocks, clusters, opts);
        // 汇总
        const counts = {};
        a.forEach(v => counts[v] = (counts[v] || 0) + 1);
        let sum = `<div class="tnote">种子 <b>${esc(seed)}</b> · 模式 ${esc(mode)} · 各组计数：` +
          Object.entries(counts).map(([k, v]) => `${esc(k)}=${v}`).join('，') + '</div>';
        if (blocks) {
          const bc = {};
          blocks.forEach((b, i) => { bc[b] = bc[b] || {}; bc[b][a[i]] = (bc[b][a[i]] || 0) + 1; });
          sum += '<table class="ttable"><tr><th>区组</th>' + conditions.map(c => `<th class="num">${esc(c)}</th>`).join('') + '</tr>' +
            Object.entries(bc).map(([b, cc]) => `<tr><td>${esc(b)}</td>` + conditions.map(c => `<td class="num">${cc[c] || 0}</td>`).join('') + '</tr>').join('') + '</table>';
        }
        $('rz-summary').innerHTML = sum;
        const rows = a.map((v, i) => [i + 1, blocks ? blocks[i] : '', clusters ? clusters[i] : '', v]);
        $('rz-table').innerHTML = '<table class="ttable"><tr><th class="num">单位</th>' + (blocks ? '<th>区组</th>' : '') + (clusters ? '<th>群</th>' : '') + '<th>分配</th></tr>' +
          rows.map(r => '<tr>' + r.filter((_, j) => j === 0 || (j === 1 && blocks) || (j === 2 && clusters) || j === 3).map((c, j) => `<td class="${j === 0 ? 'num' : ''}">${esc(c)}</td>`).join('') + '</tr>').join('') + '</table>';
        lastCSV = ['unit' + (blocks ? ',block' : '') + (clusters ? ',cluster' : '') + ',assignment',
          ...rows.map(r => r.filter((_, j) => j === 0 || (j === 1 && blocks) || (j === 2 && clusters) || j === 3).join(','))].join('\n');
      } catch (e) {
        $('rz-err').innerHTML = '<div class="terr">' + esc(e.message || String(e)) + '</div>';
      }
    };
    $('rz-copy').onclick = () => {
      if (!lastCSV) { toast('先生成'); return; }
      navigator.clipboard.writeText(lastCSV).then(() => toast('CSV 已复制'));
    };
  };
})();
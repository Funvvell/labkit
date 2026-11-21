// B1+B7 数据清洗与频数/交叉表 —— PapaParse + SheetJS + arquero + Tabulator（见 NOTICE.md）
(function () {
  window.LabKitTools['data-wash'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <h3>导入数据</h3>
        <div class="trow">
          <input type="file" id="dw-file" accept=".csv,.tsv,.txt,.xlsx,.xls" style="font-size:12.5px">
          <button class="tbtn sec" id="dw-paste-btn">粘贴导入</button>
          <button class="tbtn sec" id="dw-demo">载入示例</button>
          <button class="tbtn sec" id="dw-undo">撤销</button>
          <span class="tnote" id="dw-info" style="margin:0"></span>
        </div>
        <div class="trow" id="dw-paste-row" style="display:none">
          <div class="tfield" style="flex:1"><textarea id="dw-paste" rows="4" placeholder="粘贴 CSV/TSV（首行表头）"></textarea></div>
          <button class="tbtn pri" id="dw-paste-go">导入</button>
        </div>
        <div class="tout" id="dw-err"></div>
      </div>
      <div class="tool-section" id="dw-ops" style="display:none">
        <h3>清洗操作</h3>
        <div class="trow">
          <div class="tfield"><label>目标列</label><select id="dw-col"></select></div>
          <div class="tfield"><label>操作</label><select id="dw-op">
            <option value="trim">去首尾空格</option>
            <option value="lower">转小写</option>
            <option value="upper">转大写</option>
            <option value="number">转数值（非数→缺失）</option>
            <option value="fill">填补缺失（指定值）</option>
            <option value="fillmean">填补缺失（均值）</option>
            <option value="fillmedian">填补缺失（中位数）</option>
            <option value="dropmiss">删除该列缺失的行</option>
            <option value="rename">重命名列</option>
            <option value="delcol">删除该列</option>
          </select></div>
          <div class="tfield w-md"><label>参数（填补值/新列名）</label><input type="text" id="dw-arg" value=""></div>
          <button class="tbtn pri" id="dw-apply">应用</button>
          <button class="tbtn sec" id="dw-dedupe">整行去重</button>
        </div>
        <div class="trow">
          <div class="tfield"><label>筛选列</label><select id="dw-fcol"></select></div>
          <div class="tfield"><label>条件</label><select id="dw-fop"><option value="eq">=</option><option value="ne">≠</option><option value="gt">&gt;</option><option value="lt">&lt;</option><option value="contains">包含</option><option value="missing">缺失</option><option value="notmissing">非缺失</option></select></div>
          <div class="tfield w-sm"><label>值</label><input type="text" id="dw-fval" value=""></div>
          <button class="tbtn sec" id="dw-filter">保留满足条件的行</button>
        </div>
      </div>
      <div class="tool-section" id="dw-gridsec" style="display:none">
        <h3>数据表（单元格可编辑）</h3>
        <div id="dw-grid"></div>
        <div class="trow" style="margin-top:10px">
          <button class="tbtn sec" id="dw-csv">导出 CSV</button>
          <button class="tbtn sec" id="dw-xlsx">导出 Excel</button>
          <button class="tbtn sec" id="dw-copy">复制 TSV</button>
        </div>
      </div>
      <div class="tool-section" id="dw-stats" style="display:none">
        <h3>频数与交叉表（arquero）</h3>
        <div class="trow">
          <div class="tfield"><label>频数列</label><select id="dw-freqcol"></select></div>
          <button class="tbtn pri" id="dw-freq">频数表</button>
          <div class="tfield"><label>交叉行变量</label><select id="dw-ctrow"></select></div>
          <div class="tfield"><label>交叉列变量</label><select id="dw-ctcol"></select></div>
          <button class="tbtn pri" id="dw-ct">交叉表</button>
          <button class="tbtn sec" id="dw-stats-copy">复制结果</button>
        </div>
        <div class="tout" id="dw-stats-out"></div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let cols = [], rows = [], history = [], table = null, lastStats = '';
    const isMiss = v => v === '' || v == null || (typeof v === 'number' && !Number.isFinite(v));
    function snapshot() { history.push({ cols: cols.slice(), rows: rows.map(r => Object.assign({}, r)) }); if (history.length > 25) history.shift(); }
    function info() { $('dw-info').textContent = `${rows.length} 行 × ${cols.length} 列`; }
    function colOpts(sel) { sel.innerHTML = cols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join(''); }
    function refresh() {
      ['dw-col', 'dw-fcol', 'dw-freqcol', 'dw-ctrow', 'dw-ctcol'].forEach(id => colOpts($(id)));
      info();
      const show = rows.length > 0;
      ['dw-ops', 'dw-gridsec', 'dw-stats'].forEach(id => $(id).style.display = show ? '' : 'none');
      if (!show) return;
      if (table) table.destroy();
      table = new Tabulator('#dw-grid', {
        data: rows, height: Math.max(220, Math.min(520, Math.round((window.innerHeight || 800) * 0.42))), layout: 'fitDataFill',
        columns: cols.map(c => ({ title: c, field: c, editor: 'input', headerSort: true })),
        cellEdited: () => { snapshot(); },
      });
    }
    function loadRows(newCols, newRows) {
      snapshot();
      cols = newCols; rows = newRows; refresh();
      $('dw-err').innerHTML = '';
    }
    function parseText(text) {
      const res = Papa.parse(text.trim(), { skipEmptyLines: true });
      if (!res.data.length) throw new Error('未解析到数据');
      const header = res.data[0].map((h, i) => String(h).trim() || ('列' + (i + 1)));
      const body = res.data.slice(1).map(r => { const o = {}; header.forEach((h, i) => o[h] = r[i] !== undefined ? r[i] : ''); return o; });
      return { header, body };
    }
    $('dw-file').onchange = async () => {
      const f = $('dw-file').files[0]; if (!f) return;
      try {
        if (/\.(xlsx|xls)$/i.test(f.name)) {
          const wb = XLSX.read(await f.arrayBuffer());
          const arr = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
          if (!arr.length) throw new Error('空表');
          const header = arr[0].map((h, i) => String(h).trim() || ('列' + (i + 1)));
          loadRows(header, arr.slice(1).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] !== undefined ? r[i] : '']))));
        } else {
          const { header, body } = parseText(await f.text());
          loadRows(header, body);
        }
        toast('已导入 ' + f.name);
      } catch (e) { $('dw-err').innerHTML = '<div class="terr">' + esc(e.message) + '</div>'; }
    };
    $('dw-paste-btn').onclick = () => { $('dw-paste-row').style.display = $('dw-paste-row').style.display === 'none' ? '' : 'none'; };
    $('dw-paste-go').onclick = () => { try { const { header, body } = parseText($('dw-paste').value); loadRows(header, body); } catch (e) { $('dw-err').innerHTML = '<div class="terr">' + esc(e.message) + '</div>'; } };
    $('dw-demo').onclick = () => {
      loadRows(['id', 'group', 'sex', 'age', 'score'], [
        { id: 1, group: 'ctrl', sex: 'M', age: 23, score: 78 }, { id: 2, group: 'ctrl', sex: 'F', age: 25, score: 82 },
        { id: 3, group: 'treat', sex: 'F', age: 24, score: 88 }, { id: 4, group: 'treat', sex: 'M', age: 27, score: 91 },
        { id: 5, group: 'ctrl', sex: 'F', age: '', score: 75 }, { id: 6, group: 'treat', sex: 'M', age: 26, score: '' },
        { id: 7, group: 'treat', sex: 'F', age: 25, score: 85 }, { id: 7, group: 'treat', sex: 'F', age: 25, score: 85 },
      ]);
    };
    $('dw-undo').onclick = () => { const h = history.pop(); if (!h) return toast('无可撤销'); cols = h.cols; rows = h.rows; refresh(); };
    $('dw-apply').onclick = () => {
      if (!rows.length) return;
      const c = $('dw-col').value, op = $('dw-op').value, arg = $('dw-arg').value;
      snapshot();
      const nums = rows.map(r => parseFloat(r[c])).filter(Number.isFinite);
      if (op === 'trim') rows.forEach(r => r[c] = String(r[c] ?? '').trim());
      else if (op === 'lower') rows.forEach(r => r[c] = String(r[c] ?? '').toLowerCase());
      else if (op === 'upper') rows.forEach(r => r[c] = String(r[c] ?? '').toUpperCase());
      else if (op === 'number') rows.forEach(r => { const v = parseFloat(r[c]); r[c] = Number.isFinite(v) ? v : ''; });
      else if (op === 'fill') rows.forEach(r => { if (isMiss(r[c])) r[c] = arg; });
      else if (op === 'fillmean') { const m = nums.reduce((a, b) => a + b, 0) / (nums.length || 1); rows.forEach(r => { if (isMiss(r[c])) r[c] = +m.toFixed(4); }); }
      else if (op === 'fillmedian') { const s = nums.slice().sort((a, b) => a - b); const med = s.length ? (s[Math.floor((s.length - 1) / 2)] + s[Math.ceil((s.length - 1) / 2)]) / 2 : 0; rows.forEach(r => { if (isMiss(r[c])) r[c] = med; }); }
      else if (op === 'dropmiss') rows = rows.filter(r => !isMiss(r[c]));
      else if (op === 'rename') { const nn = arg.trim(); if (!nn || cols.includes(nn)) { history.pop(); return toast('新列名无效或重复'); } cols = cols.map(x => x === c ? nn : x); rows.forEach(r => { r[nn] = r[c]; delete r[c]; }); }
      else if (op === 'delcol') { cols = cols.filter(x => x !== c); rows.forEach(r => delete r[c]); }
      refresh(); toast('已应用：' + op);
    };
    $('dw-dedupe').onclick = () => {
      snapshot();
      const seen = new Set(); const before = rows.length;
      rows = rows.filter(r => { const k = JSON.stringify(cols.map(c => r[c])); if (seen.has(k)) return false; seen.add(k); return true; });
      refresh(); toast(`去重：删除 ${before - rows.length} 行`);
    };
    $('dw-filter').onclick = () => {
      const c = $('dw-fcol').value, op = $('dw-fop').value, v = $('dw-fval').value;
      snapshot();
      const test = r => {
        const x = r[c];
        if (op === 'missing') return isMiss(x);
        if (op === 'notmissing') return !isMiss(x);
        if (op === 'contains') return String(x ?? '').includes(v);
        const nx = parseFloat(x), nv = parseFloat(v);
        if (op === 'eq') return String(x) === v || (Number.isFinite(nx) && Number.isFinite(nv) && nx === nv);
        if (op === 'ne') return !(String(x) === v || (Number.isFinite(nx) && Number.isFinite(nv) && nx === nv));
        if (op === 'gt') return Number.isFinite(nx) && nx > nv;
        if (op === 'lt') return Number.isFinite(nx) && nx < nv;
        return true;
      };
      rows = rows.filter(test); refresh();
    };
    function statsTable(headers, body) {
      lastStats = [headers.join('\t'), ...body.map(r => r.join('\t'))].join('\n');
      return '<table class="ttable"><tr>' + headers.map(h => `<th>${esc(h)}</th>`).join('') + '</tr>' +
        body.map(r => '<tr>' + r.map((c, i) => `<td class="${i > 0 ? 'num' : ''}">${esc(c)}</td>`).join('') + '</tr>').join('') + '</table>';
    }
    $('dw-freq').onclick = () => {
      const c = $('dw-freqcol').value;
      const t = aq.from(rows);
      const g = t.groupby(c).count().orderby(aq.desc('count'));
      const total = rows.length;
      const body = g.objects().map(r => [String(r[c] ?? '(缺失)'), r.count, (r.count / total * 100).toFixed(1) + '%']);
      $('dw-stats-out').innerHTML = `<div class="tnote">列「${esc(c)}」频数（n=${total}）</div>` + statsTable(['值', '频数', '占比'], body);
    };
    $('dw-ct').onclick = () => {
      const rc = $('dw-ctrow').value, cc = $('dw-ctcol').value;
      const rvals = [...new Set(rows.map(r => String(r[rc] ?? '(缺失)')))];
      const cvals = [...new Set(rows.map(r => String(r[cc] ?? '(缺失)')))];
      const m = {}; rvals.forEach(rv => { m[rv] = {}; cvals.forEach(cv => m[rv][cv] = 0); });
      rows.forEach(r => { m[String(r[rc] ?? '(缺失)')][String(r[cc] ?? '(缺失)')]++; });
      const body = rvals.map(rv => [rv, ...cvals.map(cv => m[rv][cv]), rvals.reduce((s, x) => s + 0, 0) + cvals.reduce((s, cv) => s + m[rv][cv], 0)]);
      body.push(['合计', ...cvals.map(cv => rvals.reduce((s, rv) => s + m[rv][cv], 0)), rows.length]);
      $('dw-stats-out').innerHTML = `<div class="tnote">交叉表：${esc(rc)} × ${esc(cc)}（n=${rows.length}）</div>` + statsTable([rc + ' \\ ' + cc, ...cvals, '合计'], body);
    };
    $('dw-stats-copy').onclick = () => { if (!lastStats) return toast('先计算'); navigator.clipboard.writeText(lastStats).then(() => toast('已复制')); };
    function exportRows() { return [cols, ...rows.map(r => cols.map(c => r[c] ?? ''))]; }
    $('dw-csv').onclick = () => { if (!rows.length) return; const blob = new Blob(['\ufeff' + Papa.unparse(exportRows())], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cleaned.csv'; a.click(); URL.revokeObjectURL(a.href); };
    $('dw-xlsx').onclick = () => { if (!rows.length) return; const ws = XLSX.utils.aoa_to_sheet(exportRows()); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'cleaned'); XLSX.writeFile(wb, 'cleaned.xlsx'); };
    $('dw-copy').onclick = () => { if (!rows.length) return; navigator.clipboard.writeText(Papa.unparse(exportRows(), { delimiter: '\t' })).then(() => toast('TSV 已复制')); };
    /* P2：统一壳示例入口 + 清洗结果发送到下游工具 */
    host.__lkExample = () => $('dw-demo').click();
    const send = document.createElement('div'); send.className = 'trow'; send.style.marginTop = '8px';
    send.innerHTML = '<span style="font-size:12.5px;color:var(--muted)">发送清洗数据到：</span>';
    [['tests', '快速假设检验'], ['plotter', '数据绘图器'], ['table1', 'Table 1 基线表']].forEach(([id, name]) => {
      const b = document.createElement('button'); b.className = 'tbtn sec'; b.textContent = name;
      b.onclick = () => {
        if (!rows.length) return toast('暂无数据，先导入或载入示例');
        Store.set('session:dataset', { cols, rows, at: Date.now() });
        navigate('tool', id);
        toast('已发送：在目标工具顶部横幅载入');
      };
      send.append(b);
    });
    host.querySelector('.tool-section').append(send);
  };
})();
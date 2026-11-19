// B2 Table 1 基线特征表 UI —— 引擎见 tools/lib/tableone.js（tableone Python 移植）
(function () {
  window.LabKitTools = window.LabKitTools || {};
  window.LabKitTools['table1'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <button class="tbtn pri" id="t1Parse">解析数据</button>
          <button class="tbtn sec" id="t1Demo">示例数据</button>
          <label class="tbtn sec" style="cursor:pointer">导入 CSV<input id="t1File" type="file" accept=".csv,.tsv,.txt" style="display:none"></label>
        </div>
        <textarea id="t1Data" rows="6" class="tmono" style="width:100%;margin-top:8px" placeholder="粘贴 CSV/TSV（首行为列名），如：&#10;group,age,sex&#10;A,23,M&#10;B,45,F"></textarea>
      </div>
      <div class="tool-section" id="t1Cfg" style="display:none">
        <div class="trow">
          <label class="tfield">分组列<select id="t1Group"><option value="">不分组（overall）</option></select></label>
          <label class="tfield"><span>计算 p 值</span><input id="t1Pval" type="checkbox" checked></label>
          <label class="tfield"><span>显示缺失数</span><input id="t1Null" type="checkbox" checked></label>
        </div>
        <div id="t1Cols" style="margin-top:8px"></div>
        <div class="trow" style="margin-top:8px"><button class="tbtn pri" id="t1Run">生成 Table 1</button></div>
        <div class="tnote">连续变量默认 mean (std)；勾选「非正态」改用 median [IQR] 与 Kruskal-Wallis。分类变量 n (%)，p 值自动选 χ²/Fisher（小格）。</div>
      </div>
      <div class="tool-section" id="t1OutSec" style="display:none">
        <div class="trow">
          <button class="tbtn sec" id="t1Csv">下载 CSV</button>
          <button class="tbtn sec" id="t1Md">下载 Markdown</button>
          <button class="tbtn sec" id="t1Html">下载 HTML</button>
          <button class="tbtn sec" id="t1Tex">下载 LaTeX</button>
          <button class="tbtn sec" id="t1Copy">复制 Markdown</button>
        </div>
        <div id="t1Out" style="margin-top:8px;overflow-x:auto"></div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let rows = [], cols = [], last = null;

    const DEMO = 'group,age,bmi,sex,smoke\n' +
      ['A,23,21.4,M,No','A,25,22.1,M,Yes','A,27,23.8,F,No','A,29,24.5,F,No','A,31,25.2,M,Yes','A,33,26.0,F,No',
       'B,40,27.1,F,No','B,42,28.3,F,Yes','B,44,26.8,F,No','B,46,29.0,M,No','B,48,27.5,F,Yes','B,50,28.9,M,No'].join('\n');

    function parse(text) {
      const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
      if (!res.data.length) throw new Error('未解析到数据行');
      rows = res.data;
      cols = res.meta.fields;
      $('t1Cfg').style.display = '';
      $('t1Group').innerHTML = '<option value="">不分组（overall）</option>' + cols.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
      renderCols();
      toast(`已解析 ${rows.length} 行 × ${cols.length} 列`);
    }
    function isNumericCol(c) {
      const vals = rows.map(r => r[c]).filter(v => v != null && v !== '');
      return vals.length > 0 && vals.filter(v => Number.isFinite(Number(v))).length / vals.length > 0.8;
    }
    function renderCols() {
      $('t1Cols').innerHTML = `<table class="ttable"><tr><th>纳入</th><th>变量</th><th>类型</th><th>非正态</th></tr>` +
        cols.map(c => {
          const numeric = isNumericCol(c);
          return `<tr><td><input type="checkbox" class="t1Inc" data-col="${esc(c)}" checked></td>
            <td>${esc(c)}</td>
            <td><select class="t1Type" data-col="${esc(c)}"><option value="cont" ${numeric ? 'selected' : ''}>连续</option><option value="cat" ${numeric ? '' : 'selected'}>分类</option></select></td>
            <td><input type="checkbox" class="t1Nonnorm" data-col="${esc(c)}" ${numeric ? '' : 'disabled'}></td></tr>`;
        }).join('') + '</table>';
    }
    $('t1Parse').addEventListener('click', () => {
      try { parse($('t1Data').value); } catch (e) { toast(e.message); }
    });
    $('t1Demo').addEventListener('click', () => { $('t1Data').value = DEMO; try { parse(DEMO); } catch (e) { toast(e.message); } });
    $('t1File').addEventListener('change', async ev => {
      const f = ev.target.files[0];
      if (!f) return;
      const text = await f.text();
      $('t1Data').value = text;
      try { parse(text); } catch (e) { toast(e.message); }
      ev.target.value = '';
    });

    function download(name, text, mime) {
      const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }
    $('t1Run').addEventListener('click', () => {
      try {
        const columns = [...host.querySelectorAll('.t1Inc')].filter(x => x.checked).map(x => x.dataset.col);
        if (!columns.length) throw new Error('至少纳入一个变量');
        const categorical = [...host.querySelectorAll('.t1Type')].filter(x => x.value === 'cat' && columns.includes(x.dataset.col)).map(x => x.dataset.col);
        const nonnormal = [...host.querySelectorAll('.t1Nonnorm')].filter(x => x.checked && columns.includes(x.dataset.col)).map(x => x.dataset.col);
        const groupby = $('t1Group').value;
        const pval = $('t1Pval').checked;
        if (pval && !groupby) throw new Error('计算 p 值需选择分组列');
        // arquero 复用：按分组列校验层数
        if (groupby) {
          const at = aq.from(rows);
          const levels = at.groupby(groupby).rollup({ n: aq.op.count() }).objects();
          if (levels.length < 2) throw new Error('分组列至少需 2 个水平');
        }
        last = window.tableone(rows, { columns, categorical, groupby, nonnormal, pval, isnull: $('t1Null').checked });
        const X = window.tableoneExport;
        $('t1Out').innerHTML = X.toHTML(last);
        $('t1OutSec').style.display = '';
        $('t1Csv').onclick = () => download('table1.csv', X.toCSV(last), 'text/csv');
        $('t1Md').onclick = () => download('table1.md', X.toMarkdown(last), 'text/markdown');
        $('t1Html').onclick = () => download('table1.html', X.toHTML(last), 'text/html');
        $('t1Tex').onclick = () => download('table1.tex', X.toLaTeX(last), 'application/x-tex');
        $('t1Copy').onclick = () => navigator.clipboard.writeText(X.toMarkdown(last)).then(() => toast('已复制 Markdown')).catch(() => toast('复制失败'));
      } catch (e) {
        toast(e.message || String(e));
      }
    });
    /* P2：统一壳示例入口 + 接收「数据清洗」数据集 */
    host.__lkExample = () => $('t1Demo').click();
    const sess = Store.get('session:dataset', null);
    if (sess && sess.rows && sess.rows.length && sess.cols) {
      const b = document.createElement('div'); b.className = 'tool-banner';
      b.innerHTML = `<span>检测到「数据清洗」送来的数据（${sess.rows.length} 行 × ${sess.cols.length} 列）</span>`;
      const load = document.createElement('button'); load.className = 'tbtn pri'; load.textContent = '载入为 CSV';
      load.onclick = () => {
        const csv = Papa.unparse([sess.cols, ...sess.rows.map(r => sess.cols.map(c => r[c] ?? ''))]);
        $('t1Data').value = csv;
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
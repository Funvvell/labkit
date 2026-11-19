// D7 表格格式互转 —— PapaParse + SheetJS + markdown-table（见 NOTICE.md）
(function () {
  window.LabKitTools['tableconv'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <h3>输入</h3>
        <div class="hint">粘贴 CSV/TSV/Markdown/HTML 表格，或选择 CSV/Excel 文件（自动识别首行为表头）。</div>
        <div class="trow">
          <div class="tfield" style="flex:1"><textarea id="tc-in" rows="7" placeholder="name,group,value&#10;A,ctrl,1.2&#10;B,treat,2.4"></textarea></div>
        </div>
        <div class="trow">
          <input type="file" id="tc-file" accept=".csv,.tsv,.txt,.xlsx,.xls" style="font-size:12.5px">
          <div class="tfield"><label>输入格式</label><select id="tc-fmt"><option value="auto" selected>自动识别</option><option value="csv">CSV</option><option value="tsv">TSV</option><option value="md">Markdown</option><option value="html">HTML</option></select></div>
          <div class="tfield"><label>输出格式</label><select id="tc-out"><option value="md" selected>Markdown</option><option value="csv">CSV</option><option value="tsv">TSV</option><option value="html">HTML</option><option value="latex">LaTeX (booktabs)</option><option value="json">JSON</option></select></div>
          <button class="tbtn pri" id="tc-run">转换</button>
          <button class="tbtn sec" id="tc-copy">复制</button>
          <button class="tbtn sec" id="tc-dl">下载</button>
        </div>
        <div class="tout" id="tc-err"></div>
        <div class="tout"><div class="tmono" id="tc-result" style="max-height:380px;overflow:auto"></div></div>
        <div class="tout" id="tc-preview"></div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let rows = null, result = '';
    function parseInput(text, fmt) {
      text = text.trim();
      if (!text) throw new Error('输入为空');
      if (fmt === 'auto') {
        if (/<table[\s>]/i.test(text)) fmt = 'html';
        else if (/^\s*\|?.+\|/.test(text) && /\|?\s*:?-{2,}/.test(text)) fmt = 'md';
        else if (text.includes('\t') && !text.includes(',')) fmt = 'tsv';
        else fmt = 'csv';
      }
      if (fmt === 'html') {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const trs = [...doc.querySelectorAll('tr')];
        if (!trs.length) throw new Error('HTML 中未找到表格行');
        return trs.map(tr => [...tr.querySelectorAll('th,td')].map(td => td.textContent.trim()));
      }
      if (fmt === 'md') {
        const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.includes('|'));
        const out = [];
        for (const l of lines) {
          if (/^\|?[\s:|-]+\|?$/.test(l)) continue; // 分隔行
          out.push(l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()));
        }
        if (!out.length) throw new Error('Markdown 表格解析失败');
        return out;
      }
      const res = Papa.parse(text, { delimiter: fmt === 'tsv' ? '\t' : '', skipEmptyLines: true });
      if (res.errors.length && !res.data.length) throw new Error('CSV 解析错误：' + res.errors[0].message);
      return res.data;
    }
    function toOutput(rows, fmt) {
      const header = rows[0], body = rows.slice(1);
      if (fmt === 'csv') return Papa.unparse(rows);
      if (fmt === 'tsv') return Papa.unparse(rows, { delimiter: '\t' });
      if (fmt === 'md') return mdtable.markdownTable(rows);
      if (fmt === 'json') return JSON.stringify(body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i]]))), null, 2);
      if (fmt === 'html') {
        const e = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        return '<table>\n<thead>\n<tr>' + header.map(h => `<th>${e(h)}</th>`).join('') + '</tr>\n</thead>\n<tbody>\n' +
          body.map(r => '<tr>' + r.map(c => `<td>${e(c)}</td>`).join('') + '</tr>').join('\n') + '\n</tbody>\n</table>';
      }
      if (fmt === 'latex') {
        const e = s => String(s).replace(/[&%$#_{}~^\\]/g, c => ({ '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_', '{': '\\{', '}': '\\}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}', '\\': '\\textbackslash{}' }[c]));
        const align = header.map(() => 'l').join('');
        return '\\begin{table}[htbp]\n\\centering\n\\caption{Table}\n\\begin{tabular}{' + align + '}\n\\toprule\n' +
          header.map(e).join(' & ') + ' \\\\\n\\midrule\n' +
          body.map(r => r.map(e).join(' & ') + ' \\\\').join('\n') + '\n\\bottomrule\n\\end{tabular}\n\\end{table}';
      }
      throw new Error('未知输出格式');
    }
    $('tc-file').onchange = async () => {
      const f = $('tc-file').files[0];
      if (!f) return;
      try {
        if (/\.(xlsx|xls)$/i.test(f.name)) {
          const wb = XLSX.read(await f.arrayBuffer());
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          $('tc-in').value = Papa.unparse(rows);
          toast('Excel 已载入：' + f.name);
        } else {
          $('tc-in').value = await f.text();
        }
      } catch (e) { $('tc-err').innerHTML = '<div class="terr">' + esc(e.message) + '</div>'; }
    };
    $('tc-run').onclick = () => {
      $('tc-err').innerHTML = '';
      try {
        rows = parseInput($('tc-in').value, $('tc-fmt').value);
        const w = Math.max(...rows.map(r => r.length));
        rows = rows.map(r => { while (r.length < w) r.push(''); return r; });
        result = toOutput(rows, $('tc-out').value);
        $('tc-result').textContent = result;
        const e = s => esc(s);
        $('tc-preview').innerHTML = '<table class="ttable"><tr>' + rows[0].map(h => `<th>${e(h)}</th>`).join('') + '</tr>' +
          rows.slice(1, 11).map(r => '<tr>' + r.map(c => `<td>${e(c)}</td>`).join('') + '</tr>').join('') + '</table>' +
          (rows.length > 11 ? `<div class="tnote">预览前 10 行，共 ${rows.length - 1} 行数据</div>` : '');
      } catch (e) {
        $('tc-err').innerHTML = '<div class="terr">' + esc(e.message || String(e)) + '</div>';
      }
    };
    $('tc-copy').onclick = () => { if (!result) return toast('先转换'); navigator.clipboard.writeText(result).then(() => toast('已复制')); };
    $('tc-dl').onclick = () => {
      if (!result) return toast('先转换');
      const ext = { md: 'md', csv: 'csv', tsv: 'tsv', html: 'html', latex: 'tex', json: 'json' }[$('tc-out').value];
      const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'table.' + ext; a.click(); URL.revokeObjectURL(a.href);
    };
  };
})();
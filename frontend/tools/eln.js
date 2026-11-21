// C5 实验记录 → Markdown（Obsidian 友好）—— markdown-it（MIT）预览 + 模板胶水
(function () {
  const TEMPLATES = {
    general: { name: '通用实验', sections: ['实验目的', '实验材料', '实验步骤', '观察与结果', '结论与讨论', '下一步计划'] },
    cell: { name: '细胞培养', sections: ['细胞系与代次', '培养基与试剂', '操作（传代/铺板/转染）', '密度与活率', '污染检查', '下一步计划'] },
    pcr: { name: 'PCR/qPCR', sections: ['模板与引物', '反应体系（µL）', '循环条件', 'Ct/熔解曲线', '结果分析', '下一步计划'] },
    wb: { name: 'Western Blot', sections: ['样品与上样量', '凝胶与转膜', '抗体（一抗/二抗/稀释比）', '封闭与孵育条件', '曝光与条带', '下一步计划'] },
  };
  window.LabKitTools['eln'] = function (host) {
    const tOpts = Object.entries(TEMPLATES).map(([k, t]) => `<option value="${k}">${t.name}</option>`).join('');
    host.innerHTML = `
      <div class="tool-section">
        <h3>实验记录</h3>
        <div class="trow">
          <div class="tfield"><label>模板</label><select id="eln-tpl">${tOpts}</select></div>
          <div class="tfield w-lg"><label>标题</label><input type="text" id="eln-title" value="" placeholder="如：HEK293T 转染优化"></div>
          <div class="tfield"><label>日期</label><input type="date" id="eln-date"></div>
          <div class="tfield w-sm"><label>操作者</label><input type="text" id="eln-op" value=""></div>
          <div class="tfield w-md"><label>项目标签</label><input type="text" id="eln-proj" value="" placeholder="Obsidian tag"></div>
        </div>
        <div id="eln-sections"></div>
        <div class="trow">
          <button class="tbtn pri" id="eln-gen">生成 Markdown</button>
          <button class="tbtn sec" id="eln-copy">复制</button>
          <button class="tbtn sec" id="eln-dl">下载 .md</button>
        </div>
      </div>
      <div class="tool-section">
        <h3>预览</h3>
        <div class="tsplit">
          <div><div class="tnote" style="margin-top:0">Markdown 源码</div><div class="tmono" id="eln-src" style="max-height:420px;overflow:auto"></div></div>
          <div><div class="tnote" style="margin-top:0">渲染预览</div><div id="eln-preview" style="font-size:13px;line-height:1.6;max-height:420px;overflow:auto"></div></div>
        </div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    const d = new Date();
    $('eln-date').value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let md = '';
    function renderSections() {
      const tpl = TEMPLATES[$('eln-tpl').value];
      $('eln-sections').innerHTML = tpl.sections.map((s, i) =>
        `<div class="trow"><div class="tfield" style="flex:1"><label>${esc(s)}${i === 2 || s.includes('步骤') || s.includes('操作') ? '（每行一条）' : ''}</label><textarea id="eln-s${i}" rows="3" placeholder="${esc(s)}…"></textarea></div></div>`).join('');
    }
    $('eln-tpl').onchange = renderSections; renderSections();
    function buildMD() {
      const tpl = TEMPLATES[$('eln-tpl').value];
      const title = $('eln-title').value.trim() || '未命名实验';
      const date = $('eln-date').value;
      const tags = ['实验记录', tpl.name];
      if ($('eln-proj').value.trim()) tags.push($('eln-proj').value.trim());
      let out = '---\n';
      out += `title: "${title}"\ndate: ${date}\noperator: ${$('eln-op').value.trim() || '—'}\ntags: [${tags.map(t => `"${t}"`).join(', ')}]\n---\n\n`;
      out += `# ${title}\n\n`;
      tpl.sections.forEach((s, i) => {
        const val = ($(`eln-s${i}`) || {}).value || '';
        out += `## ${s}\n\n`;
        if (!val.trim()) { out += '（待补充）\n\n'; return; }
        if (s.includes('步骤') || s.includes('操作') || s.includes('循环')) {
          out += val.trim().split(/\n+/).map((l, j) => `${j + 1}. ${l.trim()}`).join('\n') + '\n\n';
        } else {
          out += val.trim() + '\n\n';
        }
      });
      out += `---\n*记录生成：LabKit 实验记录本 · ${new Date().toLocaleString('zh-CN', { hour12: false })}*\n`;
      return out;
    }
    $('eln-gen').onclick = () => {
      md = buildMD();
      $('eln-src').textContent = md;
      const renderer = window.markdownit ? window.markdownit() : null;
      $('eln-preview').innerHTML = renderer ? renderer.render(md) : '<div class="tnote">markdown-it 未加载</div>';
    };
    $('eln-copy').onclick = () => { if (!md) return toast('先生成'); navigator.clipboard.writeText(md).then(() => toast('Markdown 已复制')); };
    $('eln-dl').onclick = () => {
      if (!md) return toast('先生成');
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = ($('eln-title').value.trim() || '实验记录') + '_' + $('eln-date').value + '.md';
      a.click(); URL.revokeObjectURL(a.href);
    };
  };
})();
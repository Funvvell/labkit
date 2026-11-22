// C5 实验记录 → Markdown（Obsidian 友好）—— markdown-it（MIT）预览 + 模板胶水
(function () {
  const TEMPLATES = {
    general: { name: '通用实验', sections: ['实验目的', '实验材料', '实验步骤', '观察与结果', '结论与讨论', '下一步计划'] },
    cell: { name: '细胞培养', sections: ['细胞系与代次', '培养基与试剂', '操作（传代/铺板/转染）', '密度与活率', '污染检查', '下一步计划'] },
    pcr: { name: 'PCR/qPCR', sections: ['模板与引物', '反应体系（µL）', '循环条件', 'Ct/熔解曲线', '结果分析', '下一步计划'] },
    wb: { name: 'Western Blot', sections: ['样品与上样量', '凝胶与转膜', '抗体（一抗/二抗/稀释比）', '封闭与孵育条件', '曝光与条带', '下一步计划'] },
  };
  /* YAML 双引号串内的转义：不加处理时标题里一个 " 就会让整个 frontmatter 解析失败 */
  const yamlStr = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ').trim();
  window.LabKitTools['eln'] = function (host) {
    const tOpts = Object.entries(TEMPLATES).map(([k, t]) => `<option value="${k}">${t.name}</option>`).join('');
    host.innerHTML = `
      <div class="tool-section">
        <h3>实验记录</h3>
        <div class="trow">
          <label class="tfield"><span>模板</span><select id="eln-tpl">${tOpts}</select></label>
          <label class="tfield w-lg"><span>标题</span><input type="text" id="eln-title" value="" placeholder="如：HEK293T 转染优化"></label>
          <label class="tfield"><span>日期</span><input type="date" id="eln-date"></label>
          <label class="tfield w-sm"><span>操作者</span><input type="text" id="eln-op" value=""></label>
          <label class="tfield w-md"><span>项目标签</span><input type="text" id="eln-proj" value="" placeholder="Obsidian tag"></label>
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
          <div><div class="tnote flat">Markdown 源码</div><div class="tmono tbody-scroll" id="eln-src"></div></div>
          <div><div class="tnote flat">渲染预览</div><div class="eln-preview tbody-scroll" id="eln-preview"></div></div>
        </div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    const d = new Date();
    $('eln-date').value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let md = '';
    function sectionHint(s, i) { return esc(s) + (i === 2 || s.includes('步骤') || s.includes('操作') ? '（每行一条）' : ''); }
    function sectionBoxes(values) {
      const tpl = TEMPLATES[$('eln-tpl').value];
      /* label 包裹 textarea：点标签即聚焦，读屏能念出段落名 */
      $('eln-sections').innerHTML = tpl.sections.map((s, i) =>
        `<label class="tfield"><span>${sectionHint(s, i)}</span><textarea id="eln-s${i}" rows="3" placeholder="${esc(s)}…">${esc(values && values[i] ? values[i] : '')}</textarea></label>`).join('');
    }
    function currentValues() {
      return [...host.querySelectorAll('#eln-sections textarea')].map(t => t.value);
    }
    function applyTemplate(next, values) {
      $('eln-tpl').value = next;
      sectionBoxes(values);
    }
    $('eln-tpl').onchange = () => {
      const prev = $('eln-tpl').dataset.prev || 'general';
      const next = $('eln-tpl').value;
      const values = currentValues();
      const filled = values.filter(v => v.trim()).length;
      const from = TEMPLATES[prev], to = TEMPLATES[next];
      if (!filled) { applyTemplate(next, values); $('eln-tpl').dataset.prev = next; return; }
      /* 切模板会重建全部输入框：已填内容必须迁移，否则等于静默清空（且会被表单快照覆盖） */
      confirmModal('切换模板？',
        `已填 ${filled} 段内容会按顺序迁移到「${to.name}」（${to.sections.length} 段）。` +
        (from.sections.length > to.sections.length ? `原模板多出的 ${from.sections.length - to.sections.length} 段将被丢弃。` : ''),
        () => { applyTemplate(next, values); $('eln-tpl').dataset.prev = next; toast('已切换并迁移内容'); },
        '切换并迁移',
        () => { $('eln-tpl').value = prev; },
        '留在当前模板');
    };
    $('eln-tpl').dataset.prev = 'general';
    sectionBoxes();

    function buildMD() {
      const tpl = TEMPLATES[$('eln-tpl').value];
      const title = $('eln-title').value.trim() || '未命名实验';
      const date = $('eln-date').value;
      const tags = ['实验记录', tpl.name];
      if ($('eln-proj').value.trim()) tags.push($('eln-proj').value.trim());
      let out = '---\n';
      out += `title: "${yamlStr(title)}"\ndate: ${date}\noperator: "${yamlStr($('eln-op').value.trim() || '—')}"\ntags: [${tags.map(t => `"${yamlStr(t)}"`).join(', ')}]\n---\n\n`;
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
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    };
  };
})();

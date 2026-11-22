// C3 孔板布局编辑器 UI —— 模型见 tools/lib/plate-model.js（PlateEditor MIT 移植）
(function () {
  window.LabKitTools = window.LabKitTools || {};
  // 区域配色单源：tools/lib/colors.js 的 PLATE（顺序固定，同一区域多次渲染同色）
  const PALETTE = window.LKColors.PLATE;
  const SIZES = { '96': [8, 12], '384': [16, 24], '48': [6, 8], '24': [4, 6] };

  window.LabKitTools['plate'] = function (host) {
    const PM = window.plateModel;
    let plate = PM.createPlate(8, 12);
    let activeLayer = 0;
    let selection = new Set();
    let selectedArea = null;
    let drag = null;

    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <label class="tfield">板型<select id="plSize"><option value="96">96 孔（8×12）</option><option value="384">384 孔（16×24）</option><option value="48">48 孔（6×8）</option><option value="24">24 孔（4×6）</option></select></label>
          <label class="tfield"><span>锁定已赋样孔</span><input id="plLock" type="checkbox"></label>
          <button class="tbtn sec" id="plClearSel">清除选区</button>
          <button class="tbtn sec" id="plUntag">清除选区标签</button>
          <button class="tbtn sec" id="plReset">重置板</button>
        </div>
        <div class="trow" id="plLayerTabs"></div>
        <div class="tsplit">
          <div class="pl-canvas-box"><canvas id="plCanvas"></canvas>
            <div class="tnote" id="plStatus">拖拽圈选孔位，单击选单孔（Ctrl 加选）。</div></div>
          <div class="pl-side">
            <div class="tool-section pl-side-sec">
              <b>区域（样本/组）</b>
              <div class="trow">
                <label class="tfield grow"><span>名称</span><input id="plAreaName" type="text" placeholder="如 S1"></label>
                <label class="tfield w-sm"><span>类型</span><select id="plAreaType"><option value="Area">Area</option><option value="Range">Range</option></select></label>
              </div>
              <div class="trow">
                <label class="tfield w-sm"><span>颜色</span><input id="plAreaColor" type="color" value="#e6194b"></label>
                <button class="tbtn sec" id="plAddArea">新建区域</button>
              </div>
              <label class="tfield"><span>Range 定义列表（逗号分隔，可选）</span><textarea id="plAreaDef" rows="2" placeholder="0, 1, 10, 100"></textarea></label>
              <div id="plAreaList" class="pl-area-list"></div>
              <div class="trow">
                <button class="tbtn pri" id="plTag">赋样到选区</button>
              </div>
              <div class="trow">
                <label class="tfield w-sm"><span>浓度</span><input id="plConc" type="number" step="any" placeholder="浓度"></label>
                <label class="tfield w-sm"><span>单位</span><input id="plUnit" type="text" placeholder="单位"></label>
                <button class="tbtn sec" id="plTagConc">标浓度</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tool-section">
        <div class="trow">
          <button class="tbtn sec" id="plCsv">导出 CSV</button>
          <button class="tbtn sec" id="plTsv">导出 TSV</button>
          <button class="tbtn sec" id="plPng">导出 PNG</button>
          <button class="tbtn sec" id="plSave">保存布局 JSON</button>
          <span class="tfile"><input id="plLoad" type="file" accept=".json"><span class="tfile-face">导入布局 JSON</span></span>
        </div>
      </div>
      <div class="tool-section">
        <b>板 → qPCR 设计映射</b>
        <div class="trow">
          <label class="tfield">样本层<select id="plSampleLayer"></select></label>
          <label class="tfield">靶标层<select id="plTargetLayer"></select></label>
          <button class="tbtn pri" id="plMap">生成映射</button>
        </div>
        <label class="tfield"><span>样本=组（每行一条）</span><textarea id="plGroups" rows="3" placeholder="示例：&#10;S1=Ctrl&#10;S2=Treat"></textarea></label>
        <div id="plMapOut" class="tout"></div>
        <div class="trow">
          <button class="tbtn sec" id="plCopyGroups" disabled>复制分组文本</button>
          <button class="tbtn sec" id="plApplyQpcr" disabled>写入 qPCR 分组框</button>
        </div>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    const canvas = $('plCanvas');
    const ctx = canvas.getContext('2d');
    // 孔板是 UI 编辑器，画布文字跟随应用字体（Inter + 系统中文），不再写死 sans-serif
    const uiFont = () => ((getComputedStyle(document.documentElement).getPropertyValue('--sans') || '').trim() || 'sans-serif');
    let geom = { size: 34, margin: 6, off: 34 };

    function layer() { return plate.Layers[activeLayer]; }
    function persist() {
      try { Store.set('tool:plate', JSON.stringify({ plate: PM.save(plate), activeLayer })); } catch (e) { /* 忽略 */ }
    }
    function restore() {
      try {
        const raw = Store.get('tool:plate', null);
        if (!raw) return;
        const d = JSON.parse(raw);
        plate = PM.load(d.plate);
        activeLayer = Math.min(d.activeLayer || 0, plate.Layers.length - 1);
        $('plSize').value = plate.Rows === 8 && plate.Cols === 12 ? '96' : plate.Rows === 16 && plate.Cols === 24 ? '384' : plate.Rows === 6 ? '48' : '24';
      } catch (e) { /* 忽略损坏存档 */ }
    }

    function computeGeom() {
      // 量画布自己的容器，而不是 host 减一个写死的侧栏宽度：
      // 侧栏现在是 clamp 的，窄容器下还会堆叠到下方，写死偏移必然算错。
      const box = canvas.parentElement;
      const avail = (box && box.clientWidth) || host.clientWidth || 640;
      const maxW = Math.min(avail, 760);
      // 预留右侧 10px 白边再分格：否则 w = off + Cols*space + 10 会顶出容器，
      // canvas 被 max-width:100% 反向压缩后就会糊（900px 窗口下曾差 8.6px）。
      const space = Math.max(14, Math.min(40, Math.floor((maxW - geom.off - 10) / plate.Cols)));
      geom.size = space - 6; geom.margin = 6;
      const w = geom.off + plate.Cols * space + 10;
      const h = geom.off + plate.Rows * space + 10;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = 'auto';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function wellXY(w) {
      const space = geom.size + geom.margin;
      return { x: geom.off + w.Col * space, y: geom.off + w.Row * space };
    }
    function draw(forExport) {
      computeGeom();
      const space = geom.size + geom.margin;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f7f8fa';
      ctx.fillRect(0, 0, geom.off + plate.Cols * space + 10, geom.off + plate.Rows * space + 10);
      ctx.fillStyle = '#555'; ctx.font = `11px ${uiFont()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let c = 0; c < plate.Cols; c++) ctx.fillText(String(c + 1), geom.off + c * space + geom.size / 2, geom.off / 2);
      for (let r = 0; r < plate.Rows; r++) ctx.fillText(PM.alphabet(r), geom.off / 2, geom.off + r * space + geom.size / 2);
      const l = layer();
      for (const w of l.Wells) {
        const { x, y } = wellXY(w);
        ctx.beginPath();
        ctx.arc(x + geom.size / 2, y + geom.size / 2, geom.size / 2 - 1, 0, Math.PI * 2);
        ctx.fillStyle = w.Area ? w.Area.Color : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 1; ctx.stroke();
        if (w.Area && w.Area.Type === 'Range') {
          ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(8, geom.size / 3)}px ${uiFont()}`;
          ctx.fillText(String(w.RangeIndex), x + geom.size / 2, y + geom.size / 2 - (w.Value !== undefined ? geom.size / 6 : 0));
        }
        if (w.Value !== undefined) {
          ctx.fillStyle = w.Area ? '#fff' : '#333'; ctx.font = `${Math.max(7, geom.size / 4)}px ${uiFont()}`;
          ctx.fillText(String(w.Value) + (w.Unit || ''), x + geom.size / 2, y + geom.size * 0.78);
        }
        if (!forExport && selection.has(w.Index)) {
          ctx.beginPath();
          ctx.arc(x + geom.size / 2, y + geom.size / 2, geom.size / 2 + 1, 0, Math.PI * 2);
          ctx.strokeStyle = '#f5a623'; ctx.lineWidth = 2.5; ctx.stroke();
        }
      }
      if (!forExport && drag && drag.rect) {
        ctx.strokeStyle = '#4363d8'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
        ctx.strokeRect(drag.rect.x, drag.rect.y, drag.rect.w, drag.rect.h);
        ctx.setLineDash([]);
      }
    }
    function hitWell(px, py) {
      const space = geom.size + geom.margin;
      const c = Math.floor((px - geom.off) / space), r = Math.floor((py - geom.off) / space);
      if (r < 0 || r >= plate.Rows || c < 0 || c >= plate.Cols) return null;
      return r * plate.Cols + c;
    }
    function canvasPos(ev) {
      const rect = canvas.getBoundingClientRect();
      // 窄容器下 max-width:100% 会把画布整体缩小显示，但绘制坐标系没变，
      // 命中测试必须按显示缩放比换算回逻辑坐标，否则圈选会偏位。
      const logical = parseFloat(canvas.style.width) || rect.width || 1;
      const k = rect.width ? logical / rect.width : 1;
      return { x: (ev.clientX - rect.left) * k, y: (ev.clientY - rect.top) * k };
    }
    canvas.addEventListener('mousedown', ev => {
      const p = canvasPos(ev);
      drag = { start: p, rect: null, add: ev.ctrlKey || ev.metaKey };
    });
    canvas.addEventListener('mousemove', ev => {
      if (!drag) return;
      const p = canvasPos(ev);
      drag.rect = { x: Math.min(drag.start.x, p.x), y: Math.min(drag.start.y, p.y), w: Math.abs(p.x - drag.start.x), h: Math.abs(p.y - drag.start.y) };
      draw();
    });
    const onUp = ev => {
      if (!drag) return;
      const p = canvasPos(ev);
      const moved = drag.rect && (drag.rect.w > 4 || drag.rect.h > 4);
      if (!drag.add) selection.clear();
      if (moved) {
        const l = layer();
        for (const w of l.Wells) {
          const { x, y } = wellXY(w);
          const cx = x + geom.size / 2, cy = y + geom.size / 2;
          if (cx >= drag.rect.x && cx <= drag.rect.x + drag.rect.w && cy >= drag.rect.y && cy <= drag.rect.y + drag.rect.h) selection.add(w.Index);
        }
      } else {
        const idx = hitWell(p.x, p.y);
        if (idx != null) { if (selection.has(idx) && drag.add) selection.delete(idx); else selection.add(idx); }
      }
      drag = null;
      draw();
      $('plStatus').textContent = `已选 ${selection.size} 孔。` + (selectedArea ? ` 当前区域：${selectedArea}` : '');
    };
    /* 工具页会随标签重渲染：先解绑上一次挂的全局监听，否则每重开一次就多一个引用旧板/旧 canvas 的闭包 */
    if (typeof host.__lkPlateUp === 'function') window.removeEventListener('mouseup', host.__lkPlateUp);
    host.__lkPlateUp = onUp;
    window.addEventListener('mouseup', onUp);

    function renderLayers() {
      $('plLayerTabs').innerHTML = plate.Layers.map((l, i) =>
        `<button class="tbtn ${i === activeLayer ? 'pri' : 'sec'}" data-layer="${i}">层 ${i + 1}</button>`).join('') +
        '<button class="tbtn sec" id="plAddLayer">+ 新层</button>';
      host.querySelectorAll('[data-layer]').forEach(b => b.addEventListener('click', () => {
        activeLayer = Number(b.dataset.layer); selection.clear(); selectedArea = null;
        renderLayers(); renderAreas(); draw(); persist();
      }));
      $('plAddLayer').addEventListener('click', () => { PM.addLayer(plate); activeLayer = plate.Layers.length - 1; renderLayers(); renderAreas(); renderMapSelects(); draw(); persist(); });
      renderMapSelects();
    }
    function renderAreas() {
      const l = layer();
      $('plAreaList').innerHTML = l.Areas.length ? l.Areas.map(a =>
        `<div class="trow pl-area-row">
          <input type="radio" name="plAreaSel" value="${esc(a.Name)}" aria-label="选中区域 ${esc(a.Name)}" ${selectedArea === a.Name ? 'checked' : ''}>
          <span class="pl-color-chip" style="--chip:${cssColor(a.Color, '#8e8e93')}"></span>
          <span class="pl-area-name">${esc(a.Name)} <span class="tnote">${esc(a.Type)}${a.Definition ? '·定义' : ''}</span></span>
          <button class="tbtn sec xs" data-delarea="${esc(a.Name)}" aria-label="删除区域 ${esc(a.Name)}">×</button>
        </div>`).join('') : '<div class="tempty">暂无区域，先新建。</div>';
      host.querySelectorAll('[name=plAreaSel]').forEach(r => r.addEventListener('change', () => { selectedArea = r.value; }));
      host.querySelectorAll('[data-delarea]').forEach(b => b.addEventListener('click', () => {
        const name = b.dataset.delarea;
        const l2 = layer();
        l2.Wells.forEach(w => { if (w.Area && w.Area.Name === name) w.Area = null; });
        l2.Areas = l2.Areas.filter(a => a.Name !== name);
        if (selectedArea === name) selectedArea = null;
        renderAreas(); draw(); persist();
      }));
    }
    function renderMapSelects() {
      const opts = plate.Layers.map((l, i) => `<option value="${i}">层 ${i + 1}</option>`).join('');
      $('plSampleLayer').innerHTML = opts;
      $('plTargetLayer').innerHTML = opts;
      if (plate.Layers.length > 1) $('plTargetLayer').value = '1';
    }

    const sizeValue = p => p.Rows === 8 && p.Cols === 12 ? '96' : p.Rows === 16 && p.Cols === 24 ? '384' : p.Rows === 6 ? '48' : '24';
    const hasWork = () => plate.Layers.some(l => l.Areas.length || l.Wells.some(w => w.Area || w.Conc != null));
    function rebuild(r, c) {
      plate = PM.createPlate(r, c); activeLayer = 0; selection.clear(); selectedArea = null;
      renderLayers(); renderAreas(); draw(); persist();
    }
    $('plSize').addEventListener('change', () => {
      const [r, c] = SIZES[$('plSize').value];
      /* 切板型会重建整块板：有内容时必须确认，否则一次误选就把排布和已赋样全部清掉并落盘 */
      if (!hasWork()) { rebuild(r, c); return; }
      const prev = sizeValue(plate);
      confirmModal('切换板型？', '当前区域的名称、颜色与已赋样的孔位会被清空，并立即写入本机台账。', () => rebuild(r, c), '清空并切换', () => { $('plSize').value = prev; }, '保留当前');
    });
    $('plAddArea').addEventListener('click', () => {
      try {
        const def = $('plAreaDef').value.trim();
        const a = PM.addArea(layer(), {
          Name: $('plAreaName').value.trim(),
          Type: $('plAreaType').value,
          Color: $('plAreaColor').value,
          Definition: def ? def.split(/[,，\s]+/).filter(Boolean) : null
        });
        selectedArea = a.Name;
        $('plAreaName').value = ''; $('plAreaDef').value = '';
        const next = PALETTE[layer().Areas.length % PALETTE.length];
        $('plAreaColor').value = next;
        renderAreas(); persist();
      } catch (e) { toast(e.message); }
    });
    $('plTag').addEventListener('click', () => {
      if (!selectedArea) { toast('先选择或新建一个区域'); return; }
      if (!selection.size) { toast('先圈选孔位'); return; }
      const res = PM.tagWells(layer(), [...selection].sort((a, b) => a - b), selectedArea, { lock: $('plLock').checked });
      const dup = res.filter(r => r.status === 'duplicate').length;
      const err = res.filter(r => r.status === 'error').length;
      $('plStatus').textContent = `赋样完成：${res.filter(r => r.status === 'ok').length} 孔成功` + (dup ? `，${dup} 孔重复` : '') + (err ? `，${err} 孔被锁定` : '');
      draw(); persist();
    });
    $('plTagConc').addEventListener('click', () => {
      const v = Number($('plConc').value);
      if (!selection.size || !Number.isFinite(v)) { toast('选孔并填写浓度'); return; }
      PM.tagConc(layer(), [...selection], v, $('plUnit').value.trim() || undefined);
      draw(); persist();
    });
    $('plUntag').addEventListener('click', () => { PM.untagWells(layer(), [...selection]); draw(); persist(); });
    $('plClearSel').addEventListener('click', () => { selection.clear(); draw(); $('plStatus').textContent = '选区已清除。'; });
    $('plReset').addEventListener('click', () => {
      const [r, c] = SIZES[$('plSize').value];
      if (!hasWork()) { rebuild(r, c); toast('已是空白板'); return; }
      confirmModal('重置整块板？', '所有区域、标签与浓度都会被清空，且立即写入本机台账。', () => rebuild(r, c), '重置');
    });
    /* 统一壳的「重置」走这里：只清工具自有键，不动其它工具状态 */
    host.__lkReset = () => { Store.set('tool:plate', null); return true; };

    function download(name, text, mime) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: mime || 'text/plain;charset=utf-8' }));
      a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }
    $('plCsv').addEventListener('click', () => download('plate_layout.csv', PM.toCSV(layer()), 'text/csv'));
    $('plTsv').addEventListener('click', () => download('plate_layout.tsv', PM.toCSV(layer(), '\t'), 'text/tab-separated-values'));
    $('plSave').addEventListener('click', () => download('plate_layout.json', PM.save(plate), 'application/json'));
    $('plLoad').addEventListener('change', async ev => {
      const f = ev.target.files[0];
      if (!f) return;
      try {
        plate = PM.load(await f.text());
        activeLayer = 0; selection.clear(); selectedArea = null;
        $('plSize').value = plate.Rows === 8 && plate.Cols === 12 ? '96' : plate.Rows === 16 && plate.Cols === 24 ? '384' : plate.Rows === 6 ? '48' : '24';
        renderLayers(); renderAreas(); draw(); persist();
        toast('布局已导入');
      } catch (e) { toast('导入失败：' + e.message); }
      ev.target.value = '';
    });
    $('plPng').addEventListener('click', () => {
      draw(true);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'plate_layout.png'; a.click();
      draw();
    });

    let lastDesign = null, lastGroupText = '';
    $('plMap').addEventListener('click', () => {
      try {
        const groups = {};
        $('plGroups').value.split(/\n+/).forEach(line => {
          const m = line.split(/[=＝]/);
          if (m.length === 2 && m[0].trim()) groups[m[0].trim()] = m[1].trim();
        });
        lastDesign = PM.toQpcrDesign(plate, Number($('plSampleLayer').value), Number($('plTargetLayer').value), groups);
        window.__labkitPlateDesign = lastDesign;
        lastGroupText = Object.entries(lastDesign.sample_groups).map(([s, g]) => `${s}=${g}`).join('\n');
        $('plMapOut').innerHTML = `<div>样本 ${lastDesign.samples.length} 个 · 靶标 ${lastDesign.targets.length} 个 · 有效孔 ${lastDesign.wells.length}</div>
          <div class="tnote">靶标：${esc(lastDesign.targets.join(', '))}</div>
          <div class="tresult pre">${esc(lastGroupText || '（未填写分组）')}</div>`;
        $('plCopyGroups').disabled = !lastGroupText;
        $('plApplyQpcr').disabled = false;
      } catch (e) { $('plMapOut').innerHTML = `<div class="terr">${esc(e.message)}</div>`; }
    });
    $('plCopyGroups').addEventListener('click', () => navigator.clipboard.writeText(lastGroupText).then(() => toast('已复制')).catch(() => toast('复制失败')));
    $('plApplyQpcr').addEventListener('click', () => {
      /* 不直取 qPCR 视图的 DOM（标签共存时可能拿到别的实例），由工作区暴露写入接口 */
      if (typeof window.qpcrSetGroups === 'function') {
        window.qpcrSetGroups(lastGroupText);
        toast('已写入 qPCR 分组框，切换到 qPCR 页分析');
      } else {
        toast('qPCR 工作区未就绪：请先在左侧打开 qPCR');
      }
    });

    restore();
    renderLayers(); renderAreas(); draw();
    // webfont 异步加载：就绪后重绘一次，否则首帧画布文字会落在回退字体上
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw()).catch(() => { /* 忽略 */ });
    /* 窗口/容器尺寸变化时重算孔位几何并重绘。参照 crop.js 的 ResizeObserver 范式；
       工具页会被反复重渲染，先断开上一个观察器，避免观察已脱离文档的旧节点。 */
    if (host.__lkRO) { try { host.__lkRO.disconnect(); } catch (e) { /* 忽略 */ } }
    if (typeof ResizeObserver === 'function') {
      let lastW = 0;
      host.__lkRO = new ResizeObserver(entries => {
        const w = Math.round(entries[0].contentRect.width);
        if (w === lastW) return;   // 画布自身尺寸变化不该再触发一轮
        lastW = w;
        draw();
      });
      host.__lkRO.observe(canvas.parentElement);
    }
  };
})();
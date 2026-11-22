// D2 Figure 拼图器 —— fabric.js (MIT) 交互画布
// 网格模板 + A/B/C/D 面板标签 + 期刊 mm/DPI 预设；PNG 直接导出，TIFF/带 DPI 元数据走 Rust image crate（img_encode）。
(function () {
  window.LabKitTools = window.LabKitTools || {};
  const W = window;
  const PREVIEW_DPI = 96;
  const TEMPLATES = { '1×1': [1, 1], '1×2': [1, 2], '2×1': [2, 1], '2×2': [2, 2], '2×3': [2, 3], '3×2': [3, 2], '3×3': [3, 3] };

  window.LabKitTools['figure'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <span class="tfile"><input id="fgFiles" type="file" accept="image/*" multiple><span class="tfile-face">导入图片（可多选）</span></span>
          <label class="tfield">模板<select id="fgTpl">${Object.keys(TEMPLATES).map(k => `<option ${k === '2×2' ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
          <label class="tfield">图宽 mm<select id="fgMm"><option value="85">85（单栏）</option><option value="120">120</option><option value="170" selected>170（双栏）</option><option value="180">180</option></select></label>
          <button class="tbtn sec" id="fgArrange">自动排布</button>
          <button class="tbtn sec" id="fgLabels">重生成标签</button>
          <button class="tbtn sec" id="fgClear">清空画布</button>
        </div>
        <div class="trow">
          <label class="tfield">标签字体<select id="fgFont"><option>Arial</option><option>Times New Roman</option><option>Helvetica</option></select></label>
          <label class="tfield w-sm">标签字号 px<input id="fgLabelSize" type="number" value="24" min="8" max="96"></label>
          <label class="tfield"><span>标签加粗</span><input id="fgBold" type="checkbox" checked></label>
          <label class="tfield">标签位置<select id="fgLabelPos"><option value="tl">左上</option><option value="tr">右上</option><option value="bl">左下</option></select></label>
          <label class="tfield">导出 DPI<select id="fgDpi"><option>300</option><option>600</option></select></label>
        </div>
        <div class="trow">
          <button class="tbtn pri" id="fgPng">导出 PNG</button>
          <button class="tbtn sec" id="fgTiff">导出 TIFF（300dpi 元数据）</button>
          <button class="tbtn sec" id="fgSave">导出布局 JSON</button>
          <span class="tfile"><input id="fgLoadFile" type="file" accept=".json"><span class="tfile-face">导入布局 JSON</span></span>
          <button class="tbtn sec" id="fgLoad">恢复上次布局</button>
        </div>
        <div class="tnote" id="fgStatus"></div>
        <div class="tnote">图片可拖拽/缩放/旋转；「自动排布」按导入顺序填入网格。TIFF 导出需 Tauri 运行时（Rust image crate 写入分辨率标签）。</div>
      </div>
      <div class="tool-section fg-stage">
        <canvas id="fgCanvas"></canvas>
      </div>`;
    const $ = id => host.querySelector('#' + id);
    let images = []; // 导入顺序的 fabric.Image
    let labels = [];
    /* 传元素而不是全局 id：避免标签重渲染后 fabric 绑到另一个同名节点上 */
    const canvas = new fabric.Canvas($('fgCanvas'), { backgroundColor: '#ffffff', preserveObjectStacking: true });

    function dims() {
      const [rows, cols] = TEMPLATES[$('fgTpl').value];
      const mm = Number($('fgMm').value);
      const w = Math.round(mm / 25.4 * PREVIEW_DPI);
      const h = Math.round(w / cols * rows);
      return { rows, cols, w, h, mm };
    }
    function resize() {
      const d = dims();
      canvas.setDimensions({ width: d.w, height: d.h });
      canvas.requestRenderAll();
    }
    function cells() {
      const d = dims();
      const cw = d.w / d.cols, ch = d.h / d.rows;
      const out = [];
      for (let r = 0; r < d.rows; r++) for (let c = 0; c < d.cols; c++) out.push({ x: c * cw, y: r * ch, w: cw, h: ch, letter: String.fromCharCode(65 + r * d.cols + c) });
      return out;
    }
    function clearLabels() { labels.forEach(l => canvas.remove(l)); labels = []; }
    function makeLabels() {
      clearLabels();
      const size = Number($('fgLabelSize').value) || 24;
      const pos = $('fgLabelPos').value;
      cells().forEach(cell => {
        const t = new fabric.Text(cell.letter, {
          fontFamily: $('fgFont').value, fontSize: size, fontWeight: $('fgBold').checked ? 'bold' : 'normal',
          fill: '#000', selectable: true, evented: true,
        });
        const pad = 8;
        let left = cell.x + pad, top = cell.y + pad;
        if (pos === 'tr') left = cell.x + cell.w - t.width - pad;
        if (pos === 'bl') top = cell.y + cell.h - t.height - pad;
        t.set({ left, top });
        t.panelLabel = true;
        canvas.add(t); labels.push(t);
      });
      canvas.requestRenderAll();
    }
    function arrange() {
      const cs = cells();
      images.forEach((img, i) => {
        const cell = cs[i % cs.length];
        const scale = Math.min(cell.w / img.width, cell.h / img.height) * 0.92;
        img.set({
          scaleX: scale, scaleY: scale,
          left: cell.x + (cell.w - img.width * scale) / 2,
          top: cell.y + (cell.h - img.height * scale) / 2,
        });
        img.setCoords();
      });
      makeLabels();
    }
    $('fgFiles').addEventListener('change', async ev => {
      const files = [...ev.target.files];
      const status = $('fgStatus');
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (status) status.textContent = `读入 ${i + 1}/${files.length}：${f.name}`;
        const url = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
        await new Promise(res => {
          fabric.Image.fromURL(url, img => {
            img.set({ originX: 'left', originY: 'top' });
            canvas.add(img); images.push(img);
            res();
          });
        });
      }
      ev.target.value = '';
      if (status) status.textContent = '';
      arrange();
      toast(`已导入 ${files.length} 张图片`);
    });
    $('fgTpl').addEventListener('change', () => { resize(); arrange(); });
    $('fgMm').addEventListener('change', () => { resize(); arrange(); });
    $('fgArrange').addEventListener('click', arrange);
    $('fgLabels').addEventListener('click', makeLabels);
    ['fgFont', 'fgLabelSize', 'fgBold', 'fgLabelPos'].forEach(id => $(id).addEventListener('change', makeLabels));
    $('fgClear').addEventListener('click', () => {
      if (!canvas.getObjects().length) { toast('画布已为空'); return; }
      confirmModal('清空画布？', '已导入的图片与面板标签都会被移除，无法撤销（可重新导入）。', () => {
        canvas.clear(); canvas.backgroundColor = '#ffffff'; images = []; labels = []; canvas.requestRenderAll();
      }, '清空');
    });

    function exportMultiplier() {
      const dpi = Number($('fgDpi').value) || 300;
      return dpi / PREVIEW_DPI;
    }
    function pngDataURL() {
      // 导出时隐藏选中框
      canvas.discardActiveObject(); canvas.requestRenderAll();
      return canvas.toDataURL({ format: 'png', multiplier: exportMultiplier() });
    }
    function dl(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); }
    $('fgPng').addEventListener('click', () => {
      dl(pngDataURL(), `figure_${$('fgDpi').value}dpi.png`);
      toast('PNG 已导出（像素 = mm × dpi / 25.4）');
    });
    $('fgTiff').addEventListener('click', async () => {
      const dataUrl = pngDataURL();
      if (!W.__TAURI__) { dl(dataUrl, 'figure.png'); toast('浏览器模式：TIFF 需 Tauri 运行时，已改导 PNG'); return; }
      try {
        const p = await W.__TAURI__.dialog.save({ filters: [{ name: 'TIFF', extensions: ['tiff', 'tif'] }], defaultPath: 'figure.tiff' });
        if (!p) return;
        await W.__TAURI__.core.invoke('img_encode', { dataUrl, format: 'tiff', dpi: Number($('fgDpi').value), path: String(p) });
        toast('TIFF 已导出：' + p);
      } catch (e) { toast('TIFF 导出失败：' + e); }
    });
    function applyLayout(d) {
      if (!d || !d.canvas) throw new Error('不是有效的布局文件');
      $('fgTpl').value = d.tpl; $('fgMm').value = d.mm;
      resize();
      canvas.loadFromJSON(d.canvas, () => {
        images = canvas.getObjects().filter(o => o.type === 'image');
        labels = canvas.getObjects().filter(o => o.panelLabel);
        canvas.requestRenderAll();
      });
    }
    $('fgSave').addEventListener('click', () => {
      const json = JSON.stringify({ tpl: $('fgTpl').value, mm: $('fgMm').value, canvas: canvas.toJSON(['panelLabel']) });
      try { Store.set('tool:figure', json); } catch (e) { /* 忽略 */ }
      dl(URL.createObjectURL(new Blob([json], { type: 'application/json' })), 'figure_layout.json');
    });
    /* 导出的 JSON 能再导回来；「恢复上次布局」只读本机台账，两条路径分开 */
    $('fgLoadFile').addEventListener('change', async ev => {
      const f = ev.target.files[0]; if (!f) return;
      try { applyLayout(JSON.parse(await f.text())); toast('布局已导入'); }
      catch (e) { toast('布局导入失败：' + e.message); }
      ev.target.value = '';
    });
    $('fgLoad').addEventListener('click', () => {
      let raw = null;
      try { raw = Store.get('tool:figure', null); } catch (e) { /* 忽略 */ }
      if (!raw) { toast('无已保存布局'); return; }
      try { applyLayout(JSON.parse(raw)); toast('布局已恢复'); } catch (e) { toast('布局解析失败：' + e.message); }
    });
    host.__lkReset = () => { Store.set('tool:figure', null); return true; };

    resize();
    makeLabels();
  };
})();
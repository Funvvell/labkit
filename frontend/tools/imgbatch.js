// D3 图片批处理 UI —— Rust image crate + rayon 并行（img_batch/img_encode/img_rename_preview）
// 期刊体积上限预设、DPI 写入、重命名预览→确认执行、进度事件。
(function () {
  window.LabKitTools = window.LabKitTools || {};
  const W = window;

  window.LabKitTools['imgbatch'] = function (host) {
    host.innerHTML = `
      <div class="tool-section">
        <div class="trow">
          <button class="tbtn pri" id="ibPick">选择图片…</button>
          <button class="tbtn sec" id="ibClear">清空列表</button>
          <span class="tnote" id="ibCount">未选择文件</span>
        </div>
        <div id="ibList" style="margin-top:8px;max-height:180px;overflow-y:auto"></div>
      </div>
      <div class="tool-section">
        <div class="trow">
          <label class="tfield">目标格式<select id="ibFmt"><option value="keep">保持原格式</option><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="tiff">TIFF</option></select></label>
          <label class="tfield">缩放<select id="ibResize"><option value="none">不缩放</option><option value="width">按宽 px</option><option value="height">按高 px</option><option value="percent">按百分比</option><option value="fit">限定边框 px</option></select></label>
          <label class="tfield">数值<input id="ibResizeVal" type="number" value="100" style="width:80px"></label>
          <label class="tfield">JPEG 质量<input id="ibQuality" type="number" value="90" min="1" max="100" style="width:64px"></label>
          <label class="tfield">DPI<input id="ibDpi" type="number" value="300" min="0" style="width:70px"></label>
        </div>
        <div class="trow" style="margin-top:6px">
          <label class="tfield">体积上限<select id="ibCap"><option value="0">不限</option><option value="10485760">10 MB（期刊常见）</option><option value="5242880">5 MB</option><option value="1048576">1 MB</option></select></label>
          <label class="tfield w-lg">重命名模板<input id="ibPattern" type="text" placeholder="留空=原名；如 Fig_{i:03}_{name}"></label>
          <label class="tfield"><span>允许覆盖</span><input id="ibOverwrite" type="checkbox"></label>
        </div>
        <div class="trow" style="margin-top:6px">
          <button class="tbtn sec" id="ibPreview">重命名预览</button>
          <button class="tbtn sec" id="ibOutDir">输出目录…</button>
          <span class="tnote" id="ibOutLabel">未选择（默认源目录旁 labkit_out）</span>
        </div>
        <div id="ibPreviewOut" style="margin-top:6px"></div>
        <div class="trow" style="margin-top:8px">
          <button class="tbtn pri" id="ibRun">开始批处理</button>
        </div>
        <div style="margin-top:8px;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden"><div id="ibBar" style="height:100%;width:0;background:var(--accent,#007AFF);transition:width .2s"></div></div>
        <div class="tnote" id="ibProgress" style="margin-top:4px"></div>
      </div>
      <div class="tool-section"><div id="ibResults"></div></div>`;
    const $ = id => host.querySelector('#' + id);
    let files = []; // {path, probe}
    let outDir = '';
    const invoke = (cmd, args) => W.__TAURI__.core.invoke(cmd, args);
    const requireTauri = () => { if (!W.__TAURI__) { toast('图片批处理需 Tauri 运行时（exe 版）'); return false; } return true; };

    async function renderList() {
      $('ibCount').textContent = `${files.length} 个文件`;
      $('ibList').innerHTML = files.length ? `<table class="ttable"><tr><th>文件</th><th>尺寸</th><th>格式</th><th>大小</th><th></th></tr>` +
        files.map((f, i) => `<tr><td class="tmono" style="max-width:280px;overflow:hidden;text-overflow:ellipsis">${esc(f.path)}</td>
          <td>${f.probe ? f.probe.width + '×' + f.probe.height : '—'}</td><td>${f.probe ? esc(f.probe.format) : '—'}</td>
          <td>${f.probe ? (f.probe.bytes / 1024).toFixed(0) + ' KB' : '—'}</td>
          <td><button class="tbtn sec" data-rm="${i}" style="padding:1px 6px">×</button></td></tr>`).join('') + '</table>' : '<div class="tnote">点击「选择图片」添加文件。</div>';
      host.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { files.splice(Number(b.dataset.rm), 1); renderList(); });
    }
    $('ibPick').onclick = async () => {
      if (!requireTauri()) return;
      try {
        const ps = await W.__TAURI__.dialog.open({ multiple: true, filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'tif', 'tiff', 'bmp', 'gif', 'webp'] }] });
        if (!ps) return;
        const arr = Array.isArray(ps) ? ps : [ps];
        for (const p of arr) {
          let probe = null;
          try { probe = await invoke('img_probe', { path: String(p) }); } catch (e) { /* 保留未知 */ }
          files.push({ path: String(p), probe });
        }
        renderList();
      } catch (e) { toast(e.message || String(e)); }
    };
    $('ibClear').onclick = () => { files = []; renderList(); $('ibResults').innerHTML = ''; };
    $('ibOutDir').onclick = async () => {
      if (!requireTauri()) return;
      const p = await W.__TAURI__.dialog.open({ directory: true });
      if (p) { outDir = String(p); $('ibOutLabel').textContent = outDir; }
    };

    function opts() {
      const dpi = Number($('ibDpi').value);
      return {
        format: $('ibFmt').value,
        resize_mode: $('ibResize').value,
        resize_value: Number($('ibResizeVal').value) || 100,
        quality: Number($('ibQuality').value) || 90,
        dpi: dpi > 0 ? dpi : null,
        max_bytes: Number($('ibCap').value) || null,
        out_dir: outDir || (files[0] ? files[0].path.replace(/[\\/][^\\/]+$/, '') + '/labkit_out' : ''),
        overwrite: $('ibOverwrite').checked,
        rename_pattern: $('ibPattern').value.trim() || null,
      };
    }
    $('ibPreview').onclick = async () => {
      if (!requireTauri() || !files.length) { if (!files.length) toast('先选择图片'); return; }
      try {
        const o = opts();
        const rows = await invoke('img_rename_preview', { jobs: files.map(f => ({ path: f.path, new_name: null })), pattern: o.rename_pattern || '{name}.{ext}', outDir: o.out_dir });
        $('ibPreviewOut').innerHTML = `<table class="ttable"><tr><th>源</th><th>目标</th><th>冲突</th></tr>` +
          rows.map(r => `<tr><td class="tmono">${esc(r.src.split(/[\\/]/).pop())}</td><td class="tmono">${esc(r.target.split(/[\\/]/).pop())}</td>
            <td class="${r.conflict ? 'terr' : ''}">${r.conflict ? esc(r.conflict) : '—'}</td></tr>`).join('') + '</table>';
      } catch (e) { toast('预览失败：' + e); }
    };

    let unlisten = null;
    $('ibRun').onclick = async () => {
      if (!requireTauri() || !files.length) { if (!files.length) toast('先选择图片'); return; }
      const o = opts();
      if (!o.out_dir) { toast('无法确定输出目录'); return; }
      $('ibRun').disabled = true;
      $('ibBar').style.width = '0%';
      $('ibProgress').textContent = '处理中…';
      try {
        if (unlisten) unlisten();
        unlisten = await W.__TAURI__.event.listen('imgbatch-progress', ev => {
          const p = ev.payload;
          $('ibBar').style.width = (p.done / p.total * 100).toFixed(1) + '%';
          $('ibProgress').textContent = `${p.done}/${p.total} · ${p.src.split(/[\\/]/).pop()} ${p.ok ? '✓' : '✗ ' + (p.error || '')}`;
        });
        const results = await invoke('img_batch', { jobs: files.map(f => ({ path: f.path, new_name: null })), opts: o });
        const ok = results.filter(r => r.ok).length;
        $('ibResults').innerHTML = `<div class="tnote">完成：${ok}/${results.length} 成功 · 输出目录 ${esc(o.out_dir)}</div>
          <table class="ttable"><tr><th>源</th><th>输出</th><th>尺寸</th><th>大小</th><th>状态</th></tr>` +
          results.map(r => `<tr><td class="tmono">${esc(r.src.split(/[\\/]/).pop())}</td><td class="tmono">${esc(r.out.split(/[\\/]/).pop())}</td>
            <td>${r.width ? r.width + '×' + r.height : '—'}</td><td>${r.bytes ? (r.bytes / 1024).toFixed(0) + ' KB' : '—'}</td>
            <td class="${r.ok ? '' : 'terr'}">${r.ok ? '成功' : esc(r.error || '失败')}</td></tr>`).join('') + '</table>';
        toast(`批处理完成：${ok}/${results.length}`);
      } catch (e) {
        toast('批处理失败：' + e);
      } finally {
        $('ibRun').disabled = false;
        if (unlisten) { unlisten(); unlisten = null; }
      }
    };
    renderList();
  };
})();
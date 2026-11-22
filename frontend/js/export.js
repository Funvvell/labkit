(function () {
  const API = window.__TAURI__ || {};
  const q = new URLSearchParams(location.search);
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;

  const FMT_LABEL = { tiff: 'TIFF', png: 'PNG', jpeg: 'JPEG' };
  let fmt = String(q.get('format') || 'tiff').toLowerCase();
  if (!FMT_LABEL[fmt]) fmt = 'tiff';
  let quality = parseInt(q.get('quality'), 10);
  if (!Number.isFinite(quality)) quality = 95;
  quality = Math.min(100, Math.max(60, quality));

  const fmtSeg = document.getElementById('fmtSeg');
  const fmtBtns = Array.from(fmtSeg.querySelectorAll('[data-fmt]'));
  const qualityRow = document.getElementById('qualityRow');
  const qualityInput = document.getElementById('quality');
  const qualityVal = document.getElementById('qualityVal');
  const expCount = document.getElementById('expCount');
  const expSlide = document.getElementById('expSlide');
  const dpiNote = document.getElementById('dpiNote');
  const err = document.getElementById('err');
  const btnOk = document.getElementById('btnOk');
  const btnCancel = document.getElementById('btnCancel');
  const btnClose = document.getElementById('btnClose');

  const count = parseInt(q.get('count'), 10);
  expCount.textContent = (Number.isFinite(count) ? count : 0) + ' 个区域';
  expSlide.textContent = q.get('slide') || '当前切片';
  expSlide.title = expSlide.textContent;
  dpiNote.textContent = q.get('dpiNote') || 'DPI 信息不可用。';
  qualityInput.value = String(quality);
  qualityVal.textContent = String(quality);

  function paint() {
    fmtBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.fmt === fmt ? 'true' : 'false'));
    const jpeg = fmt === 'jpeg';
    qualityRow.classList.toggle('disabled', !jpeg);
    qualityInput.disabled = !jpeg;
  }
  paint();

  fmtBtns.forEach(b => {
    b.addEventListener('click', () => {
      fmt = b.dataset.fmt;
      paint();
    });
  });

  qualityInput.addEventListener('input', () => {
    quality = Math.min(100, Math.max(60, parseInt(qualityInput.value, 10) || 95));
    qualityVal.textContent = String(quality);
  });

  function closeWin() {
    try {
      const W = API.window && API.window.getCurrentWindow();
      if (W) {
        W.close().catch(() => {});
        return;
      }
    } catch (e) {}
    try { window.close(); } catch (e) {}
  }

  function showError(msg) {
    err.textContent = msg;
    err.hidden = false;
    btnOk.disabled = false;
  }

  async function submit() {
    if (btnOk.disabled) return;
    err.hidden = true;

    if (!API.dialog || typeof API.dialog.open !== 'function') {
      showError('当前环境无法打开文件夹选择器。');
      return;
    }

    let dir = null;
    try {
      dir = await API.dialog.open({ directory: true, multiple: false, title: '选择导出文件夹' });
    } catch (e) {
      showError('打开文件夹选择器失败：' + (e && e.message ? e.message : e));
      return;
    }
    if (Array.isArray(dir)) dir = dir[0] || null;
    if (!dir) return;

    btnOk.disabled = true;
    btnOk.textContent = '正在导出…';
    try {
      if (!API.event || typeof API.event.emit !== 'function') throw new Error('事件通道不可用');
      await API.event.emit('labkit:export-options', {
        owner: q.get('owner') || '',
        format: fmt,
        quality,
        outputDir: dir,
      });
    } catch (e) {
      btnOk.textContent = '选择文件夹并导出';
      showError('无法把导出设置发送给主窗口：' + (e && e.message ? e.message : e));
      return;
    }
    closeWin();
  }

  btnOk.addEventListener('click', submit);
  btnCancel.addEventListener('click', closeWin);
  btnClose.addEventListener('click', closeWin);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeWin();
    }
  });
})();

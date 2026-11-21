// LabKit · update.js — P6 应用内更新：检查 / 下载进度 / 重启安装
// 网络请求全部在 Rust 侧（CSP 禁止前端直连）；这里只负责交互与状态。
let _updInfo = null, _updBusy = false, _updOff = null, _updCurrent = '';

function updVerText(v) { return v ? 'v' + v : '—'; }

function renderUpdateSettings() {
  const auto = document.getElementById('setUpdateAuto');
  if (auto) auto.checked = Store.settings().updateAutoCheck !== false;
  const status = document.getElementById('updateStatus');
  if (!status) return;
  const last = Store.get('update:lastCheck', '');
  status.textContent = (_updCurrent ? '当前 ' + updVerText(_updCurrent) : '当前版本未知') +
    ' · ' + (last ? '上次检查 ' + last : '尚未检查');
}

async function updateCheckManual() {
  if (!IN_TAURI) { toast('浏览器演示模式不支持检查更新'); return; }
  const btn = document.getElementById('btnUpdateCheck');
  if (btn) { btn.disabled = true; btn.textContent = '检查中…'; }
  try {
    const info = await invoke('update_check');
    Store.set('update:lastCheck', nowStamp().replace('T', ' '));
    _updCurrent = (info && info.current) || _updCurrent;
    renderUpdateSettings();
    if (info && info.available) updateOpenDialog(info);
    else toast('已是最新版本' + (info && info.current ? ' ' + updVerText(info.current) : ''));
  } catch (e) {
    toast('检查更新失败：' + e, 7000);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '检查更新'; }
  }
}

/* 启动静默检查：只在主窗口、失败不打扰；「稍后」跳过的版本不再提醒 */
async function updateAutoCheck() {
  if (!IN_TAURI || WINDOW_MODE) return;
  if (Store.settings().updateAutoCheck === false) return;
  try {
    const info = await invoke('update_check');
    Store.set('update:lastCheck', nowStamp().replace('T', ' '));
    _updCurrent = (info && info.current) || _updCurrent;
    renderUpdateSettings();
    if (!info || !info.available) return;
    if (Store.settings().updateSkip === info.latest) return;
    const msg = '发现新版本 ' + updVerText(info.latest) + '，可在 设置 → 关于 中更新';
    notifyPush(msg, 'settings');
    toast(msg, 6000);
  } catch (e) { /* 启动检查失败静默，不打扰正常使用 */ }
}

function updateOpenDialog(info) {
  _updInfo = info;
  const mask = document.getElementById('updateMask');
  if (!mask) return;
  const title = document.getElementById('updTitle');
  if (title) title.textContent = '发现新版本 ' + updVerText(info.latest);
  const meta = document.getElementById('updMeta');
  if (meta) {
    const parts = ['当前 ' + updVerText(info.current)];
    if (info.size) parts.push((info.size / 1048576).toFixed(1) + ' MB');
    if (info.pubDate) parts.push('发布于 ' + String(info.pubDate).slice(0, 10));
    meta.textContent = parts.join(' · ');
  }
  const notes = document.getElementById('updNotes');
  if (notes) notes.textContent = info.notes || '更新说明见发布页。';
  const bar = document.getElementById('updBar');
  if (bar) bar.hidden = true;
  const fill = document.getElementById('updBarFill');
  if (fill) fill.style.width = '0%';
  const msg = document.getElementById('updMsg');
  if (msg) { msg.hidden = true; msg.textContent = ''; }
  const install = document.getElementById('updInstall');
  if (install) {
    install.disabled = !info.writable;
    install.textContent = info.writable ? '立即更新并重启' : '目录不可写';
  }
  if (msg && !info.writable) {
    msg.hidden = false;
    msg.textContent = '程序所在目录不可写（' + (info.dir || '未知目录') + '）。请点击「查看发布页」下载安装包手动覆盖，台账数据不会丢失。';
  }
  openLayer(mask);
}

function updateLater() {
  if (_updInfo && _updInfo.latest) Store.setSetting('updateSkip', _updInfo.latest);
  closeLayer(document.getElementById('updateMask'));
  toast('已跳过 ' + updVerText(_updInfo && _updInfo.latest) + '，可在「检查更新」中随时重试');
}

function updateOpenRelease() {
  const u = 'https://github.com/Funvvell/labkit/releases/latest';
  if (IN_TAURI) invoke('plugin:opener|open_url', { url: u }).catch(() => toast('打开失败，链接：' + u, 7000));
  else window.open(u, '_blank');
}

async function updateStart() {
  if (!_updInfo || _updBusy) return;
  if (!IN_TAURI) { toast('浏览器演示模式不支持安装更新'); return; }
  if (!_updInfo.writable) { updateOpenRelease(); return; }
  _updBusy = true;
  const install = document.getElementById('updInstall'), later = document.getElementById('updLater');
  const rel = document.getElementById('updRelease'), bar = document.getElementById('updBar');
  const fill = document.getElementById('updBarFill'), msg = document.getElementById('updMsg');
  if (install) { install.disabled = true; install.textContent = '正在下载…'; }
  if (later) later.disabled = true;
  if (rel) rel.disabled = true;
  if (bar) bar.hidden = false;
  if (msg) { msg.hidden = false; msg.textContent = '正在下载更新…'; }
  try {
    if (!_updOff && window.__TAURI__ && window.__TAURI__.event) {
      _updOff = await window.__TAURI__.event.listen('labkit-update-progress', ev => {
        const p = ev.payload || {}, total = +p.total || 0, got = +p.received || 0;
        const pct = total > 0 ? Math.min(100, got / total * 100) : 0;
        if (fill) fill.style.width = pct.toFixed(1) + '%';
        if (msg) msg.textContent = total > 0
          ? '正在下载更新 ' + pct.toFixed(0) + '%'
          : '已下载 ' + (got / 1048576).toFixed(1) + ' MB';
      }).catch(() => null);
    }
    await flushDB();
    await invoke('update_install', { version: _updInfo.latest });
    if (fill) fill.style.width = '100%';
    if (msg) msg.textContent = '下载完成，正在重启安装…';
    toast('正在重启完成更新…', 4000);
    const W = lkWin();
    if (W && W.getCurrentWindow) W.getCurrentWindow().close().catch(() => {});
    /* 主窗关闭会走 Rust 退出握手；只有被取消（落盘失败）时这里才会继续执行 */
    setTimeout(() => {
      _updBusy = false;
      if (later) later.disabled = false;
      if (rel) rel.disabled = false;
      if (install) { install.disabled = false; install.textContent = '重新更新'; }
      if (msg) msg.textContent = '更新未完成：退出被取消或保存失败。可点击「重新更新」重试。';
    }, 8000);
  } catch (e) {
    _updBusy = false;
    if (install) { install.disabled = false; install.textContent = '立即更新并重启'; }
    if (later) later.disabled = false;
    if (rel) rel.disabled = false;
    if (msg) { msg.hidden = false; msg.textContent = '更新失败：' + e; }
    toast('更新失败：' + e, 8000);
  }
}

(function updateInit() {
  const mask = document.getElementById('updateMask');
  if (mask) {
    mask.addEventListener('click', e => { if (e.target === mask && !_updBusy) closeLayer(mask); });
    mask.addEventListener('cancel', e => { if (_updBusy) e.preventDefault(); });
    mask.addEventListener('close', () => { mask.hidden = true; });
  }
  const check = document.getElementById('btnUpdateCheck');
  if (check) check.onclick = updateCheckManual;
  const auto = document.getElementById('setUpdateAuto');
  if (auto) auto.onchange = () => {
    Store.setSetting('updateAutoCheck', !!auto.checked);
    toast(auto.checked ? '启动时将自动检查更新' : '已关闭启动自动检查');
  };
  const install = document.getElementById('updInstall');
  if (install) install.onclick = updateStart;
  const later = document.getElementById('updLater');
  if (later) later.onclick = updateLater;
  const rel = document.getElementById('updRelease');
  if (rel) rel.onclick = updateOpenRelease;
  invoke('app_info').then(info => {
    _updCurrent = (info && info.version) || '';
    renderUpdateSettings();
  }).catch(() => {});
})();

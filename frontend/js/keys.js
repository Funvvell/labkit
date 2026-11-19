// LabKit · keys.js — 全局快捷键注册表 + 「?」帮助浮层（P1）
// 视图级快捷键（crop / 布局编辑）仍在各自模块；这里只管全局层，输入框内不抢键。
const GLOBAL_KEYS = [
  ['Ctrl/⌘ + K', '打开 / 关闭命令面板'],
  ['Ctrl/⌘ + ,', '打开设置'],
  ['Alt + ← / →', '后退 / 前进（路由历史）'],
  ['Ctrl/⌘ + E', '编辑首页布局（首页）'],
  ['?', '打开 / 关闭本帮助'],
  ['Esc', '关闭面板 / 帮助 / 退出布局编辑'],
];
const VIEW_KEYS = {
  crop: [
    ['Space', '在鼠标处创建 ROI'],
    ['Delete / Backspace', '删除选中 ROI（可多选）'],
    ['Ctrl+Z / Ctrl+Y', '撤销 / 重做'],
    ['Ctrl+A / Ctrl+C / Ctrl+D', '全选 / 复制 / 副本'],
    ['F / Home', '适配选中 ROI / 适配整张切片'],
    ['滚轮 / 左键拖拽', '缩放 / 平移'],
    ['右键拖拽', '旋转视图'],
  ],
  home: [
    ['Ctrl/⌘ + E', '进入 / 保存布局编辑'],
    ['编辑态 ←/→', '卡片排序'],
    ['编辑态 Shift+←/→ / Shift+↑/↓', '改宽 / 改高'],
    ['编辑态 Enter / Delete', '精确设置 / 移除卡片'],
  ],
};
function helpIsOpen() { return !document.getElementById('helpMask').hidden; }
function helpRender() {
  const vk = VIEW_KEYS[_route.name] || [];
  document.getElementById('helpBody').innerHTML =
    '<div class="help-sec">全局</div><table class="help-table">' +
    GLOBAL_KEYS.map(([k, d]) => `<tr><td><kbd>${esc(k)}</kbd></td><td>${esc(d)}</td></tr>`).join('') +
    '</table>' +
    (vk.length ? '<div class="help-sec">当前视图 · ' + esc(_route.name) + '</div><table class="help-table">' +
      vk.map(([k, d]) => `<tr><td><kbd>${esc(k)}</kbd></td><td>${esc(d)}</td></tr>`).join('') + '</table>' : '');
}
function helpToggle() {
  const m = document.getElementById('helpMask');
  if (m.hidden) { helpRender(); m.hidden = false; }
  else m.hidden = true;
}
function helpClose() { document.getElementById('helpMask').hidden = true; }
function keysInit() {
  window.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); paletteToggle(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); navigate('settings'); return; }
    if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); history.back(); return; }
    if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); history.forward(); return; }
    if (e.key === 'Escape') {
      if (paletteIsOpen()) { paletteClose(); return; }
      if (helpIsOpen()) { helpClose(); return; }
      return;
    }
    if (typing) return;
    if (e.key === '?') { e.preventDefault(); helpToggle(); return; }
  });
  document.getElementById('helpMask').addEventListener('mousedown', e => { if (e.target.id === 'helpMask') helpClose(); });
  document.getElementById('helpClose').onclick = helpClose;
}
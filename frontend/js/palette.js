// LabKit · palette.js — Ctrl+K 命令面板（P1）
// 索引 = 工具（名称/描述/拼音首字母）+ 页面 + 全局动作；空查询展示最近 / 收藏 / 页面 / 动作。
// 交互参照 IT-Tools / Rubick：↑↓ 选择、Enter 打开、Esc 关闭、点击遮罩关闭。
let _palOpen = false, _palItems = [], _palSel = 0;
/* 页面索引来自 PAGE_META（shell.js）——侧栏固定项 / 工作台菜单 / 命令面板单一来源 */
function palViews() { return Object.entries(PAGE_META).map(([id, m]) => [id, m.name, m.desc, m.py]); }
function paletteIndex() {
  const items = [];
  (window.TOOL_META || []).forEach(t => items.push({
    kind: 'tool', id: t.id, title: t.name, sub: t.group + ' · ' + t.desc,
    hay: (t.id + ' ' + t.name + ' ' + t.desc + ' ' + (t.py || '') + ' ' + (t.keywords || '')).toLowerCase(),
    run: () => openTool(t.id),
  }));
  palViews().forEach(([id, title, sub, py]) => items.push({
    kind: 'page', id, title, sub, hay: (id + ' ' + title + ' ' + sub + ' ' + py).toLowerCase(),
    run: () => navigate(id),
  }));
  const acts = [
    ['new-task', '新建任务', '动作 · 任务中心', 'xjrw xinjian renwu', () => { navigate('tasks'); setTimeout(() => entityModal('task'), 80); }],
    ['new-exp', '新建实验', '动作 · 实验台账', 'xjsy xinjian shiyan', () => { navigate('experiments'); setTimeout(() => entityModal('experiment'), 80); }],
    ['pin-current', '固定 / 取消固定当前页面', '动作 · 侧栏固定区 · Alt+F', 'gd guding dingzhu altf', () => togglePinCurrent()],
    ['tool-new-window', '在新窗口打开当前工具', '动作 · 独立工具窗口', 'xcxck dakai dangqian gongju', () => { if (_route.name === 'tool' && _route.arg) openToolWindow(_route.arg); else toast('当前不在工具页；也可在工具卡上 Ctrl/⌘+点击'); }],
    ['focus-start', '开始专注', '动作 · 首页计时卡片', 'kszz kaishi zhuanzhu', () => { navigate('home'); setTimeout(() => { const c = document.querySelector('#dashGrid [data-w="focus"]'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); else toast('专注计时卡片已被移除，可在「+ 添加卡片」中加回'); }, 80); }],
    ['dash-edit', '编辑首页布局', '动作 · Ctrl+E', 'bjbj bianji buju', () => { navigate('home'); setTimeout(() => document.getElementById('btnDashEdit')?.click(), 80); }],
    ['db-export', '导出台账 JSON', '动作 · 设置页', 'dc daochu taizhang json', () => { navigate('settings'); setTimeout(() => document.getElementById('btnDbExport')?.click(), 80); }],
  ];
  acts.forEach(([id, title, sub, py, run]) => items.push({ kind: 'act', id, title, sub, hay: (id + ' ' + title + ' ' + sub + ' ' + py).toLowerCase(), run }));
  return items;
}
function palFilter(q) {
  const all = paletteIndex();
  const byId = id => all.find(x => x.kind === 'tool' && x.id === id);
  if (!q) {
    return [
      { label: '最近使用', items: Store.recent().map(byId).filter(Boolean) },
      { label: '固定', items: Store.favs().map(byId).filter(Boolean) },
      { label: '页面', items: all.filter(x => x.kind === 'page') },
      { label: '动作', items: all.filter(x => x.kind === 'act') },
    ].filter(s => s.items.length);
  }
  const hit = all.map(x => {
    const i = x.hay.indexOf(q);
    if (i < 0) return null;
    const n = x.title.toLowerCase().indexOf(q);
    return { x, score: (n === 0 ? 0 : n > 0 ? 1 : 2) * 1000 + i };
  }).filter(Boolean).sort((a, b) => a.score - b.score).map(o => o.x);
  return [{ label: '匹配 ' + hit.length + ' 项', items: hit.slice(0, 30) }];
}
function palRender() {
  const q = document.getElementById('palInput').value.trim().toLowerCase();
  const secs = palFilter(q);
  _palItems = secs.flatMap(s => s.items);
  if (_palSel >= _palItems.length) _palSel = Math.max(0, _palItems.length - 1);
  let i = 0;
  const list = document.getElementById('palList');
  list.innerHTML = secs.map(s =>
    `<div class="pal-sec">${esc(s.label)}</div>` + s.items.map(x => {
      const k = i++;
      const ico = x.kind === 'tool' ? toolIcon(x.id) : (x.kind === 'page' ? pageIcon(x.id) : IC.json);
      return `<div class="pal-item${k === _palSel ? ' sel' : ''}" role="option" aria-selected="${k === _palSel}" data-pal="${k}"><span class="pal-ico">${ico}</span><span class="pal-txt"><b>${esc(x.title)}</b><small>${esc(x.sub || '')}</small></span><span class="pal-kind">${x.kind === 'tool' ? '工具' : x.kind === 'page' ? '页面' : '动作'}</span></div>`;
    }).join('')
  ).join('') || '<div class="pal-empty">没有匹配项 — 换个词试试（支持拼音首字母，如 yw / qpcr / sjqx）</div>';
  list.querySelector('.pal-item.sel')?.scrollIntoView({ block: 'nearest' });
}
function paletteIsOpen() { return _palOpen; }
function paletteOpen() {
  _palOpen = true; _palSel = 0;
  document.getElementById('palMask').hidden = false;
  const inp = document.getElementById('palInput');
  inp.value = ''; palRender(); inp.focus();
}
function paletteClose() {
  _palOpen = false;
  document.getElementById('palMask').hidden = true;
}
function paletteToggle() { _palOpen ? paletteClose() : paletteOpen(); }
function palRun(k, newWin) {
  const it = _palItems[k]; if (!it) return;
  paletteClose();
  /* P1：Ctrl/⌘+Enter 把选中工具放到独立窗口 */
  if (newWin && it.kind === 'tool') { openToolWindow(it.id); return; }
  it.run();
}
function paletteInit() {
  const inp = document.getElementById('palInput');
  inp.addEventListener('input', () => { _palSel = 0; palRender(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); _palSel = (_palSel + 1) % Math.max(1, _palItems.length); palRender(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); _palSel = (_palSel - 1 + _palItems.length) % Math.max(1, _palItems.length); palRender(); }
    else if (e.key === 'Enter') { e.preventDefault(); palRun(_palSel, e.ctrlKey || e.metaKey); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); paletteClose(); }
  });
  document.getElementById('palMask').addEventListener('mousedown', e => { if (e.target.id === 'palMask') paletteClose(); });
  document.getElementById('palList').addEventListener('click', e => {
    const it = e.target.closest('[data-pal]'); if (it) palRun(+it.dataset.pal);
  });
}
// LabKit · tabs.js — 工具箱多标签页（零构建，classic script）
// 行为范式参考 VS Code 编辑器标签（一资源一标签 / 关闭激活邻位 / 溢出滚动 /
// 中键关闭 / 拖拽排序 / Ctrl+Tab·Ctrl+W·Ctrl+Shift+T）、Obsidian 固定根标签、
// JupyterLab Lumino TabPanel（tablist + roving tabindex）。仅借鉴交互，不复制代码。
/* ===================== 纯状态模型（可在 node vm 中单测） ===================== */
const TABS_KEY = 'tooltabs';
const TABS_V = 1;

function tabMetaFor(id) {
  const list = (typeof window !== 'undefined' && window.TOOL_META) || [];
  return list.find(t => t.id === id) || null;
}
function tabKeyOf(id) {
  const m = tabMetaFor(id);
  return (m && m.workspace) ? 'ws:' + id : 'tool:' + id;
}
function tabIdOf(key) {
  const i = String(key).indexOf(':');
  return i < 0 ? '' : String(key).slice(i + 1);
}
function tabKindOf(key) {
  return String(key).startsWith('ws:') ? 'workspace' : 'tool';
}
function tabsRouteOf(key) {
  const id = tabIdOf(key);
  const m = tabMetaFor(id);
  if (m && m.workspace) return { name: id, arg: null };
  return { name: 'tool', arg: id };
}
function tabKeyOfRoute(r) {
  if (!r) return null;
  if (r.name === 'tool' && r.arg) return 'tool:' + r.arg;
  if (r.name === 'crop' || r.name === 'qpcr') return 'ws:' + r.name;
  return null;
}
function tabsNormalize(raw) {
  const src = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.list) ? raw.list : []);
  const out = [];
  const seen = new Set();
  for (const key of src) {
    if (typeof key !== 'string' || seen.has(key)) continue;
    const m = /^(tool|ws):(.+)$/.exec(key);
    if (!m) continue;
    const meta = tabMetaFor(m[2]);
    if (!meta) continue;
    if (m[1] === 'ws' && !meta.workspace) continue;
    if (m[1] === 'tool' && meta.workspace) continue;
    seen.add(key); out.push(key);
  }
  return out;
}
function tabsOpen(list, key) {
  const out = tabsNormalize(list);
  if (out.includes(key)) return out;
  const meta = tabMetaFor(tabIdOf(key));
  if (!meta) return out;
  out.push(key);
  return out;
}
function tabsClose(list, key) {
  const out = tabsNormalize(list);
  const i = out.indexOf(key);
  if (i < 0) return { list: out, next: null, refused: false };
  const next = out[i + 1] || out[i - 1] || null;
  out.splice(i, 1);
  return { list: out, next, refused: false, empty: !out.length };
}
/** 把 key 移到「原列表插入点 ins」之前；只在工具标签之间排序。 */
function tabsMove(list, key, ins) {
  const out = tabsNormalize(list);
  const i = out.indexOf(key);
  if (i < 0) return out;
  let to = Number(ins);
  if (!Number.isFinite(to)) return out;
  if (i < to) to--;
  if (to < 0) to = 0;
  if (to > out.length - 1) to = out.length - 1;
  if (to === i) return out;
  out.splice(i, 1);
  out.splice(to, 0, key);
  return out;
}
function tabsNeighbor(list, key, dir) {
  const out = tabsNormalize(list);
  const i = out.indexOf(key);
  if (i < 0) return null;
  const n = out.length;
  return out[(i + (dir < 0 ? -1 : 1) + n) % n];
}
function tabsPayload(list) {
  const clean = tabsNormalize(list);
  return { v: TABS_V, list: clean };
}

/* ===================== 运行时状态 ===================== */
let _tabsList = [];
let _tabsActive = null;
let _tabsBound = false;
let _tabsDragKey = null;
let _tabCtx = null;
let _tabsClosed = [];
const _tabsPanes = new Map();
let _tabsWsReady = { crop: false, qpcr: false };

function tabsMode() { return typeof TAB_MODE !== 'undefined' && TAB_MODE; }
function tabsWin() { return typeof TOOLBOX_WIN !== 'undefined' && TOOLBOX_WIN; }
function tabsTauri() { return typeof IN_TAURI !== 'undefined' && IN_TAURI; }

function tabsPersist() {
  if (!tabsMode()) return;
  try { if (typeof Store !== 'undefined') Store.set(TABS_KEY, tabsPayload(_tabsList)); } catch (e) { }
}
function tabsLabel(key) {
  const m = tabMetaFor(tabIdOf(key));
  return m ? m.name : tabIdOf(key);
}
function tabsIcon(key) {
  const id = tabIdOf(key);
  try {
    const v = typeof toolboxView === 'function' ? toolboxView() : null;
    const it = v && v.items ? v.items[id] : null;
    if (it && it.icon && typeof toolboxIconSVG === 'function') return toolboxIconSVG(it.icon, id);
  } catch (e) { }
  return typeof toolIcon === 'function' ? toolIcon(id) : '';
}
function tabsDomId(key) { return 'tt-' + String(key).replace(/[^a-zA-Z0-9_-]/g, '-'); }

/* ---- pane：一工具一 pane，首激活才渲染，切走保留 DOM ---- */
function tabsPane(key) {
  if (tabKindOf(key) !== 'tool') return null;
  let p = _tabsPanes.get(key);
  if (p) return p;
  const stack = document.getElementById('toolHost');
  if (!stack) return null;
  const id = tabIdOf(key);
  const el = document.createElement('div');
  el.className = 'tool-pane scroll';
  el.id = 'pane-' + tabsDomId(key);
  el.dataset.tabPane = id;
  el.setAttribute('role', 'tabpanel');
  el.setAttribute('aria-labelledby', tabsDomId(key));
  const wrap = document.createElement('div');
  wrap.className = 'tool-wrap';
  const host = document.createElement('div');
  host.className = 'tool-host';
  wrap.appendChild(host); el.appendChild(wrap);
  if (_tabsActive === key) el.classList.add('active');
  stack.appendChild(el);
  p = { key, el, host, rendered: false, token: 0 };
  _tabsPanes.set(key, p);
  return p;
}
function tabsDestroyPane(key) {
  const p = _tabsPanes.get(key);
  if (!p) return;
  try { p.token++; p.el.remove(); } catch (e) { }
  _tabsPanes.delete(key);
}
function tabsActiveHost() {
  const p = _tabsActive ? _tabsPanes.get(_tabsActive) : null;
  return p ? p.host : null;
}
function tabsActiveId() {
  return (_tabsActive && tabKindOf(_tabsActive) === 'tool') ? tabIdOf(_tabsActive) : null;
}

function tabsActivate(key) {
  if (!_tabsList.includes(key)) {
    const l = tabsOpen(_tabsList, key);
    if (!l.includes(key)) return false;
    _tabsList = l; tabsPersist();
  }
  _tabsActive = key;
  _tabsPanes.forEach((p, k) => p.el.classList.toggle('active', k === key));
  tabsRenderBar();
  tabsApplyTitle(key);
  tabsBarSync(tabsRouteOf(key).name);
  if (tabKindOf(key) === 'workspace') {
    tabsEnsureWorkspace(tabIdOf(key));
    setTimeout(() => { try { window.dispatchEvent(new Event('resize')); } catch (e) { } }, 0);
  }
  return true;
}
function tabsEnsure(key) {
  if (!key) return false;
  const l = tabsOpen(_tabsList, key);
  if (!l.includes(key)) return false;
  if (l.length !== _tabsList.length) { _tabsList = l; tabsPersist(); }
  return true;
}
function tabsEnsureWorkspace(id) {
  if (_tabsWsReady[id]) return;
  _tabsWsReady[id] = true;
  try {
    if (id === 'crop' && typeof ensureRoiDb === 'function') ensureRoiDb();
    if (id === 'qpcr' && typeof qpcrRestoreSession === 'function') qpcrRestoreSession();
  } catch (e) { }
}
/** 工具库是工具箱的基底页，不占标签：进入 toolhub 只清掉激活态，不创建标签。 */
function tabsShowLibrary() {
  _tabsActive = null;
  tabsPanesShow();
  tabsRenderBar();
  tabsApplyTitle(null);
  tabsBarSync('toolhub');
}
/** 路由渲染后调用：把 tab 激活（tool 由 renderTool 负责，避免重复建 pane）。 */
function tabsActivateRoute(r) {
  if (!tabsMode()) return;
  if (r && r.name === 'toolhub') { tabsShowLibrary(); return; }
  const key = tabKeyOfRoute(r);
  if (!key) return;
  if (tabKindOf(key) === 'tool') {
    if (tabsEnsure(key)) tabsActivate(key);
    return;
  }
  tabsActivate(key);
}
function tabsBarSync(name) {
  const bar = document.getElementById('toolTabs');
  if (!bar) return;
  const area = name === 'tool' || name === 'toolhub' || name === 'crop' || name === 'qpcr';
  bar.hidden = !(tabsMode() && area && name !== 'toolhub' && _tabsList.length > 0);
}

/* ---- 标签栏 ---- */
function tabsRenderBar() {
  const track = document.getElementById('toolTabsTrack');
  if (!track) return;
  track.innerHTML = _tabsList.map(key => {
    const on = key === _tabsActive;
    const label = tabsLabel(key);
    const route = tabsRouteOf(key);
    const panel = tabKindOf(key) === 'tool' ? 'pane-' + tabsDomId(key) : 'view-' + route.name;
    return `<div class="tt-tab${on ? ' on' : ''}" id="${tabsDomId(key)}" role="tab" aria-selected="${on}" aria-controls="${panel}" tabindex="${on ? 0 : -1}" data-tab-key="${esc(key)}" title="${esc(label)}">` +
      `<span class="tt-ico" aria-hidden="true">${tabsIcon(key)}</span><span class="tt-name">${esc(label)}</span>` +
      `<button type="button" class="tt-x" data-tab-close="${esc(key)}" aria-label="关闭 ${esc(label)}" tabindex="-1">×</button>` +
      '</div>';
  }).join('');
  const active = track.querySelector('.tt-tab.on');
  if (active && active.scrollIntoView) { try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { } }
  track.querySelectorAll('.tt-tab').forEach(el => {
    el.draggable = false;
    el.addEventListener('mousedown', e => { if (!e.target.closest('.tt-x')) el.draggable = true; });
    el.addEventListener('dragstart', e => {
      _tabsDragKey = el.dataset.tabKey;
      el.classList.add('dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', _tabsDragKey); } catch (_) { }
    });
    el.addEventListener('dragend', () => {
      el.draggable = false; el.classList.remove('dragging'); _tabsDragKey = null;
      track.querySelectorAll('.tt-tab').forEach(x => x.classList.remove('drop-before', 'drop-after'));
    });
    el.addEventListener('dragover', e => {
      if (_tabsDragKey == null) return;
      e.preventDefault();
      const r = el.getBoundingClientRect(), before = e.clientX < r.left + r.width / 2;
      el.classList.toggle('drop-before', before);
      el.classList.toggle('drop-after', !before);
    });
    el.addEventListener('dragleave', () => el.classList.remove('drop-before', 'drop-after'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      if (_tabsDragKey == null) return;
      const target = el.dataset.tabKey;
      if (!target) return;
      const idx = _tabsList.indexOf(target), r = el.getBoundingClientRect();
      const ins = (e.clientX < r.left + r.width / 2) ? idx : idx + 1;
      _tabsList = tabsMove(_tabsList, _tabsDragKey, ins);
      tabsPersist(); tabsRenderBar();
    });
  });
}

function tabsBind() {
  if (_tabsBound) return;
  _tabsBound = true;
  const track = document.getElementById('toolTabsTrack');
  const bar = document.getElementById('toolTabs');
  if (!track || !bar) return;
  track.addEventListener('click', e => {
    const x = e.target.closest('[data-tab-close]');
    if (x) { e.stopPropagation(); tabsCloseKey(x.dataset.tabClose); return; }
    const t = e.target.closest('[data-tab-key]');
    if (t) tabsGo(t.dataset.tabKey);
  });
  track.addEventListener('auxclick', e => {
    if (e.button !== 1) return;
    const t = e.target.closest('[data-tab-key]');
    if (t) { e.preventDefault(); tabsCloseKey(t.dataset.tabKey); }
  });
  track.addEventListener('contextmenu', e => {
    const t = e.target.closest('[data-tab-key]');
    if (!t) return;
    e.preventDefault();
    tabsCtxOpen(t.dataset.tabKey, e.clientX, e.clientY);
  });
  track.addEventListener('keydown', e => {
    const t = e.target.closest('.tt-tab');
    if (!t) return;
    const key = t.dataset.tabKey;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tabsGo(key); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); tabsCloseKey(key); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = tabsNeighbor(_tabsList, key, e.key === 'ArrowRight' ? 1 : -1);
      if (next) {
        const el = track.querySelector(`.tt-tab[data-tab-key="${CSS.escape(next)}"]`);
        if (el) el.focus();
      }
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const list = [...track.querySelectorAll('.tt-tab')];
      (e.key === 'Home' ? list[0] : list[list.length - 1])?.focus();
    }
  });
  track.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    if (track.scrollWidth <= track.clientWidth) return;
    e.preventDefault();
    track.scrollLeft += e.deltaY;
  }, { passive: false });
  bar.querySelector('#toolTabsMenu').onclick = e => {
    e.stopPropagation();
    if (!_tabsActive) return;
    const r = e.currentTarget.getBoundingClientRect();
    tabsCtxOpen(_tabsActive, r.right - 8, r.bottom + 6);
  };
}

function tabsGo(key) {
  if (!key) return;
  const r = tabsRouteOf(key);
  if (typeof navigate === 'function') navigate(r.name, r.arg);
}

/* ---- 关闭 / 邻居 / 批量 ---- */
/* 标签清空后的收口：工具库是基底页，回工具库而不是关窗。 */
function tabsAfterEmpty() {
  _tabsActive = null;
  tabsRenderBar();
  if (typeof navigate === 'function') { navigate('toolhub'); return; }
  tabsShowLibrary();
}
function tabsCloseKey(key) {
  const res = tabsClose(_tabsList, key);
  if (res.refused || (res.next == null && res.list.length)) return;
  const wasActive = key === _tabsActive;
  tabsDestroyPane(key);
  _tabsList = res.list;
  if (key) _tabsClosed.push(key);
  if (_tabsClosed.length > 10) _tabsClosed.shift();
  if (!_tabsList.includes(_tabsActive)) _tabsActive = null;
  tabsPersist();
  if (!_tabsList.length) { tabsAfterEmpty(); return; }
  if (wasActive) tabsGo(res.next);
  else tabsRenderBar();
}
function tabsCloseOthers(keep) {
  const keys = _tabsList.filter(k => k !== keep);
  tabsRemoveMany(keys);
}
function tabsCloseRight(key) {
  const i = _tabsList.indexOf(key);
  if (i < 0) return;
  tabsRemoveMany(_tabsList.slice(i + 1));
}
/** 「关闭全部」的纯规划：全部工具标签关闭，工具库不是标签，不再保留。 */
function tabsCloseAllPlan(list) {
  const out = tabsNormalize(list);
  return { list: [], keys: out };
}
/* 关闭全部：清空工具标签，回到工具库基底页；窗口不关。 */
function tabsCloseAll() {
  const plan = tabsCloseAllPlan(_tabsList);
  if (!plan.keys.length) return;
  plan.keys.forEach(k => { tabsDestroyPane(k); _tabsClosed.push(k); });
  while (_tabsClosed.length > 10) _tabsClosed.shift();
  _tabsList = [];
  _tabsActive = null;
  tabsPersist();
  tabsRenderBar();
  tabsAfterEmpty();
}
function tabsRemoveMany(keys) {
  if (!keys || !keys.length) return;
  const active = _tabsActive;
  let next = null;
  if (keys.includes(active)) {
    const i = _tabsList.indexOf(active);
    const remain = _tabsList.filter(k => !keys.includes(k));
    next = remain[i] || remain[i - 1] || null;
    if (next && !remain.includes(next)) next = remain[remain.length - 1] || null;
  }
  keys.forEach(k => { tabsDestroyPane(k); _tabsClosed.push(k); });
  while (_tabsClosed.length > 10) _tabsClosed.shift();
  _tabsList = _tabsList.filter(k => !keys.includes(k));
  if (!_tabsList.includes(_tabsActive)) _tabsActive = null;
  tabsPersist();
  if (!_tabsList.length) { tabsAfterEmpty(); return; }
  if (keys.includes(active) && next) tabsGo(next);
  else tabsRenderBar();
}
function tabsCloseActive() {
  if (!_tabsActive) return;
  tabsCloseKey(_tabsActive);
}
function tabsCycle(dir) {
  if (!_tabsList.length) return;
  const next = tabsNeighbor(_tabsList, _tabsActive || _tabsList[0], dir);
  if (next) tabsGo(next);
}
function tabsJump(n) {
  const key = _tabsList[n - 1];
  if (key) tabsGo(key);
}
function tabsReopen() {
  while (_tabsClosed.length) {
    const key = _tabsClosed.pop();
    if (!key || !_tabsList.includes(key)) {
      if (!tabsEnsure(key)) continue;
      tabsGo(key);
      if (typeof toast === 'function') toast('已重新打开：' + tabsLabel(key));
      return;
    }
  }
  if (typeof toast === 'function') toast('没有可重新打开的标签');
}

/* ---- 右键菜单（复用 pin-ctx 视觉） ---- */
function tabCtxClose() {
  if (_tabCtx) { _tabCtx.remove(); _tabCtx = null; }
  document.removeEventListener('mousedown', tabCtxOutside);
}
function tabCtxOutside(e) { if (_tabCtx && !_tabCtx.contains(e.target)) tabCtxClose(); }
function tabsCtxOpen(key, x, y) {
  tabCtxClose();
  if (!key) return;
  const m = document.createElement('div');
  m.className = 'pin-ctx';
  const item = (act, label, dis) => `<button type="button" data-tctx="${act}"${dis ? ' disabled' : ''}>${esc(label)}</button>`;
  m.innerHTML = item('close', '关闭', false) +
    item('others', '关闭其他', false) + item('right', '关闭右侧', false) +
    item('all', '关闭全部', false) + item('reopen', '重新打开已关闭', false) +
    item('newwin', '在新窗口打开', false) + item('pin', '固定到侧栏', false);
  document.body.appendChild(m);
  m.style.left = Math.max(8, Math.min(x, window.innerWidth - 200)) + 'px';
  m.style.top = Math.min(y, window.innerHeight - 260) + 'px';
  m.addEventListener('click', ev => {
    const b = ev.target.closest('[data-tctx]'); if (!b || b.disabled) return;
    const act = b.dataset.tctx;
    tabCtxClose();
    if (act === 'close') tabsCloseKey(key);
    else if (act === 'others') tabsCloseOthers(key);
    else if (act === 'right') tabsCloseRight(key);
    else if (act === 'all') tabsCloseAll();
    else if (act === 'reopen') tabsReopen();
    else if (act === 'newwin') { if (typeof openToolWindow === 'function') openToolWindow(tabIdOf(key)); }
    else if (act === 'pin') {
      if (typeof togglePinFromUI === 'function') togglePinFromUI('tool', tabIdOf(key));
    }
  });
  _tabCtx = m;
  document.addEventListener('mousedown', tabCtxOutside);
}

/* ---- 标题 ---- */
function tabsApplyTitle(key) {
  const name = key ? tabsLabel(key) : '工具库';
  const title = name + ' · 科研工具箱 LabKit';
  document.title = title;
  const wt = document.querySelector('.win-title');
  if (wt && wt.lastChild && wt.lastChild.nodeType === 3) wt.lastChild.textContent = ' ' + name + ' · LabKit';
  if (tabsTauri() && typeof WINDOW_MODE !== 'undefined' && WINDOW_MODE) {
    try { lkWin().getCurrentWindow().setTitle(title).catch(() => { }); } catch (e) { }
  }
}

/* ---- 启动 ---- */
function tabsBoot(startRoute) {
  if (!tabsMode() && !(typeof DETACHED_WIN !== 'undefined' && DETACHED_WIN)) return;   // 主窗无页内标签
  if (tabsMode()) {
    document.body.classList.add('tab-mode');
    if (tabsWin()) document.body.classList.add('toolbox-mode');
    let raw = null;
    try { raw = Store.settings().restoreTabs === false ? null : Store.get(TABS_KEY, null); } catch (e) { }
    _tabsList = tabsNormalize(raw);
    tabsBind();
    if (tabsWin()) tabsListenToolbox();
    tabsRenderBar();
    tabsActivateRoute(startRoute || { name: 'toolhub', arg: null });
    tabsBarSync((startRoute && startRoute.name) || 'home');
  } else {
    const key = tabKeyOfRoute(startRoute);
    _tabsList = key ? [key] : [];
    _tabsActive = key || null;
    tabsPanesShow();
    if (key) tabsApplyTitle(key);
  }
}
function tabsPanesShow() {
  _tabsPanes.forEach((p, k) => p.el.classList.toggle('active', k === _tabsActive));
}

/* ---- 跨窗口：主窗唤工具箱（事件 + 回执，零 IPC 改动） ---- */
function tabsListenToolbox() {
  try {
    if (!window.__TAURI__ || !window.__TAURI__.event) return;
    window.__TAURI__.event.listen('labkit:toolbox-open', ev => {
      const p = (ev && ev.payload) || {};
      try {
        if (p.id && typeof openTool === 'function') openTool(p.id);
        else if (p.route === 'toolhub' && typeof navigate === 'function') navigate('toolhub');
      } finally {
        if (p.nonce) { try { window.__TAURI__.event.emit('labkit:toolbox-ack', { nonce: p.nonce }); } catch (e) { } }
      }
    }).catch(() => { });
  } catch (e) { }
}
function tabsEmitOnce(id) {
  return new Promise(resolve => {
    const ev = window.__TAURI__ && window.__TAURI__.event;
    if (!ev || !ev.emit) { resolve(false); return; }
    const nonce = 'tb' + Date.now() + Math.random().toString(36).slice(2, 8);
    let done = false, un = null;
    const finish = ok => {
      if (done) return; done = true;
      try { if (un) un(); } catch (e) { }
      resolve(ok);
    };
    try {
      Promise.resolve(ev.listen('labkit:toolbox-ack', e => {
        if (e && e.payload && e.payload.nonce === nonce) finish(true);
      })).then(f => { un = f; if (done) { try { f(); } catch (e) { } } }).catch(() => { });
      Promise.resolve(ev.emit('labkit:toolbox-open', { id: id || null, route: id ? null : 'toolhub', nonce })).catch(() => { });
    } catch (e) { finish(false); return; }
    setTimeout(() => finish(false), 350);
  });
}
async function tabsEmitToToolbox(id) {
  for (let i = 0; i < 3; i++) { if (await tabsEmitOnce(id)) return true; }
  return false;
}
function tabsToolboxUrl(id) {
  const m = id ? tabMetaFor(id) : null;
  if (!m) return 'index.html#/toolhub';
  return 'index.html#' + (m.workspace ? '/' + m.id : '/tool/' + m.id);
}
/** 主窗：唤起/聚焦工具窗口；已存在则通过事件让它打开指定标签。 */
async function openToolboxWindow(id) {
  if (!tabsTauri()) {
    if (typeof toast === 'function') toast('浏览器演示模式没有独立窗口，已在页内打开');
    if (id && typeof openTool === 'function') openTool(id);
    return;
  }
  const WW = window.__TAURI__ && window.__TAURI__.webviewWindow;
  if (!WW) return;
  const focusExisting = async () => {
    let w = null;
    try { w = await WW.WebviewWindow.getByLabel('tools'); } catch (e) { }
    if (!w) return false;
    try { await w.show(); } catch (e) { }
    try { await w.unminimize(); } catch (e) { }
    try { await w.setFocus(); } catch (e) { }
    const ok = await tabsEmitToToolbox(id || null);
    if (!ok && typeof toast === 'function') toast('已聚焦工具窗口；请在窗口内切换标签');
    return true;
  };
  if (await focusExisting()) return;
  try {
    const win = new WW.WebviewWindow('tools', {
      url: tabsToolboxUrl(id), title: '工具窗口 · 科研工具箱 LabKit',
      width: 1240, height: 820, minWidth: 900, minHeight: 620,
      visible: false, center: true, decorations: false, dragDropEnabled: false, shadow: true,
    });
    win.once('tauri://error', async () => {
      if (await focusExisting()) return;
      if (typeof toast === 'function') toast('工具窗口打开失败');
    });
  } catch (e) {
    if (await focusExisting()) return;
    if (typeof toast === 'function') toast('工具窗口打开失败');
  }
}

/* ---- 窗口就绪后再 show（visible:false 防闪烁；失败即销毁防白窗） ---- */
function tabWindowShowWhenReady() {
  if (!tabsTauri() || typeof WINDOW_MODE === 'undefined' || !WINDOW_MODE) return;
  const W = lkWin().getCurrentWindow();
  const show = () => { W.show().catch(() => { W.destroy().catch(() => { }); }); };
  const p = _tabsActive ? _tabsPanes.get(_tabsActive) : null;
  if (!p) { setTimeout(show, 120); return; }
  const ready = () => {
    const h = p.host;
    if (!h) return false;
    if (h.querySelector('.terr')) return true;
    return [...h.children].some(n => !(n.classList && n.classList.contains('tnote')));
  };
  if (ready()) { setTimeout(show, 80); return; }
  const mo = new MutationObserver(() => { if (ready()) { mo.disconnect(); show(); } });
  mo.observe(p.host, { childList: true });
  setTimeout(() => { mo.disconnect(); show(); }, 2500);
}

/* ---- 工具页渲染辅助 ---- */
function tabsRerender(id) {
  const key = tabKeyOf(id);
  const p = _tabsPanes.get(key);
  if (p) { p.token++; p.rendered = false; p.host.innerHTML = ''; }
  if (typeof renderTool === 'function') renderTool(id);
}

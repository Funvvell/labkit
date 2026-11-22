// LabKit · shell.js — 外壳交互：侧栏导航 / 固定区（pins）/ 工具分组 / 命令面板入口
// P0 侧栏改造：工作台子页按钮收敛进 Dashboard「工作台 ▾」菜单；侧栏「固定」区
// 由用户自定义（页头 ☆ / 菜单 / 工具星标 / Ctrl+K / Alt+F 固定，拖拽排序，右键重命名）。
// 范式参考 Obsidian Bookmarks / Trigger.dev Favorites；数据底座复用 Store（pins）。

/* ---- 页面元数据单一来源：侧栏固定项 / 工作台菜单 / 命令面板共用 ----
   pin:true 的页面可被固定到侧栏；home/toolhub/settings 侧栏常驻，无需固定。 */
const PAGE_META = {
  home:        { name: '首页',       desc: '仪表盘卡片与总览',        py: 'gz home shouye gongzuotai', pin: false,
    icon: '<path d="M4 11L12 4L20 11M6 9.5V19C6 19.6 6.4 20 7 20H17C17.6 20 18 19.6 18 19V9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20V14H14V20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
  tasks:       { name: '任务中心',   desc: '看板 / 清单 / 日 / 周',   py: 'rw renwu kanban qingdan', pin: true,
    icon: '<rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 12L11 14.5L15.5 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' },
  focus:       { name: '专注记录',   desc: '计时统计与 CSV 导出',     py: 'zz zhuanzhu jishi tongji', pin: true,
    icon: '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12L15 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' },
  projects:    { name: '项目管理',   desc: '课题 · 阶段 · 里程碑',    py: 'xm xiangmu keti lichengbei', pin: true,
    icon: '<path d="M3.5 7C3.5 5.9 4.4 5 5.5 5H9L11 7.5H18.5C19.6 7.5 20.5 8.4 20.5 9.5V17C20.5 18.1 19.6 19 18.5 19H5.5C4.4 19 3.5 18.1 3.5 17V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
  experiments: { name: '实验台账',   desc: '模板复用 · 失败复盘',     py: 'sy shiyan taizhang fupan', pin: true,
    icon: '<path d="M9.5 3.5H14.5M10.5 3.5V9L5.4 18.2C4.8 19.3 5.6 20.5 6.8 20.5H17.2C18.4 20.5 19.2 19.3 18.6 18.2L13.5 9V3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 15H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
  literature:  { name: '文献库',     desc: '轻量管理 · DOI 直达',     py: 'wx wenxian doi', pin: true,
    icon: '<path d="M5 4.5C5 3.9 5.4 3.5 6 3.5H19V18.5H6.5C5.7 18.5 5 19.2 5 20V4.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 20C5 19.2 5.7 18.5 6.5 18.5H19V20.5H6.5C5.7 20.5 5 20.8 5 20Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
  labres:      { name: '仪器 / 试剂', desc: '效期 · 余量 · 机时预约', py: 'yq shiji yiqi yuyue', pin: true,
    icon: '<path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 8L12 13L21 8M12 13V21" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
  reports:     { name: '统计报表',   desc: '工作量趋势与导出',        py: 'bb baobiao tongji qushi', pin: true,
    icon: '<path d="M4 20H20M7 20V12M12 20V6M17 20V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
  toolhub:     { name: '工具库',     desc: '全部科研小工具',          py: 'gjk gongjuku gongju', pin: false,
    icon: '<path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="18.5" cy="17" r="2.6" stroke="currentColor" stroke-width="1.6"/>' },
  plugins:     { name: '扩展管理',   desc: '工具扩展与卡片扩展',      py: 'kz kuozhan cj plugin market', pin: false,
    icon: '<path d="M9.5 3.5h5l.7 3.2 2.5 1.5 3-1.3 2.3 4-2.5 2v3l2.5 2-2.3 4-3-1.3-2.5 1.5-.7 3.2h-5l-.7-3.2-2.5-1.5-3 1.3-2.3-4 2.5-2v-3l-2.5-2 2.3-4 3 1.3 2.5-1.5.7-3.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.5"/>' },
  settings:    { name: '设置',       desc: '密度 · 数据备份 · 关于',  py: 'sz shezhi beifen', pin: false,
    icon: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M12 3V5.5M12 18.5V21M3 12H5.5M18.5 12H21M5.6 5.6L7.4 7.4M16.6 16.6L18.4 18.4M18.4 5.6L16.6 7.4M7.4 16.6L5.6 18.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' },
};
function pageIcon(id) {
  const m = PAGE_META[id];
  return `<svg viewBox="0 0 24 24" fill="none">${m ? m.icon : '<rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/>'}</svg>`;
}
/* 可固定页面清单（工作台菜单顺序） */
const WB_PAGES = ['tasks', 'projects', 'experiments', 'literature', 'labres', 'reports', 'focus'];
/* 未固定子页 → 侧栏高亮映射回首页，避免"死"状态；文献库已是侧栏一级入口，不再回退首页 */
const NAV_HOME_MAP = WB_PAGES.filter(id => id !== 'literature');
function navKeyFor(name) { return name === 'tool' ? 'toolhub' : name; }

function shellSyncNav(name) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-nav="${navKeyFor(name)}"]`)?.classList.add('active');
  const kind = name === 'tool' ? 'tool' : 'page', id = name === 'tool' ? _route.arg : name;
  document.querySelector(`.pin-item[data-pin-kind="${kind}"][data-pin-id="${id}"]`)?.classList.add('active');
  if (NAV_HOME_MAP.includes(name) && !Store.isPinned('page', name))
    document.querySelector('.nav-item[data-nav="home"]')?.classList.add('active');
  document.querySelectorAll('[data-tool-link]').forEach(b => b.classList.toggle('active', name === 'tool' && b.dataset.toolLink === _route.arg));
  syncPinButtons();
}

/* ---- 固定区渲染（替代旧收藏区；页面 + 工具混排，用户自定义顺序） ---- */
function pinLabel(p) {
  if (p.label) return p.label;
  if (p.kind === 'tool') { const t = (window.TOOL_META || []).find(t => t.id === p.id); return t ? t.name : p.id; }
  const m = PAGE_META[p.id]; return m ? m.name : p.id;
}
function pinIcon(p) { return p.kind === 'tool' ? toolIcon(p.id) : pageIcon(p.id); }
function shellRenderPins() {
  const host = document.getElementById('sideFavs'); if (!host) return;
  const pins = Store.pins().filter(p => p.kind === 'tool'
    ? (window.TOOL_META || []).some(t => t.id === p.id)
    : !!PAGE_META[p.id]);
  host.innerHTML = '<div class="side-group">固定</div>' + (pins.length
    ? pins.map((p, i) => `<div class="nav-item sub pin-item" data-pin-kind="${p.kind}" data-pin-id="${esc(p.id)}" data-pin-idx="${i}" role="button" tabindex="0" aria-label="打开 ${esc(pinLabel(p))}" title="${esc(pinLabel(p))}（右键重命名）"><span class="pin-grip" title="拖动排序">⠿</span>${pinIcon(p)}<span class="label">${esc(pinLabel(p))}</span><button class="pin-x" title="取消固定" aria-label="取消固定 ${esc(pinLabel(p))}">×</button></div>`).join('')
    : '<div class="pin-empty">从「工作台 ▾」菜单或页头 ☆ 固定常用入口</div>');
  bindPinDnD(host);
}

/* 拖拽排序：把手按下才可拖（避免与点击导航冲突），复用 dashboard 卡片 DnD 模式 */
let _pinDrag = null;
function bindPinDnD(host) {
  host.querySelectorAll('.pin-item').forEach(it => {
    const grip = it.querySelector('.pin-grip');
    grip.addEventListener('mousedown', () => { it.draggable = true; });
    it.addEventListener('dragstart', e => {
      _pinDrag = +it.dataset.pinIdx;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', it.dataset.pinId); } catch (_) { }
      it.classList.add('dragging');
    });
    it.addEventListener('dragend', () => {
      it.draggable = false; it.classList.remove('dragging'); _pinDrag = null;
      host.querySelectorAll('.pin-item').forEach(x => x.classList.remove('drop-before', 'drop-after'));
    });
    it.addEventListener('dragover', e => {
      if (_pinDrag == null) return;
      e.preventDefault();
      const r = it.getBoundingClientRect(), before = e.clientY < r.top + r.height / 2;
      it.classList.toggle('drop-before', before);
      it.classList.toggle('drop-after', !before);
    });
    it.addEventListener('dragleave', () => it.classList.remove('drop-before', 'drop-after'));
    it.addEventListener('drop', e => {
      e.preventDefault();
      if (_pinDrag == null) return;
      const to = +it.dataset.pinIdx, r = it.getBoundingClientRect();
      let idx = (e.clientY < r.top + r.height / 2) ? to : to + 1;
      if (_pinDrag < idx) idx--;
      Store.movePin(_pinDrag, idx);
      shellRenderPins();
    });
  });
}

/* 页头 ☆ / 菜单 ☆ 状态同步 */
function syncPinButtons() {
  document.querySelectorAll('[data-pin-toggle]').forEach(b => {
    const kind = b.dataset.pinToggleKind || 'page', id = b.dataset.pinToggle;
    const on = Store.isPinned(kind, id);
    b.classList.toggle('on', on);
    b.textContent = on ? '★' : '☆';
    b.title = on ? '取消固定' : '固定到侧栏';
    b.setAttribute('aria-label', b.title);
  });
}
function togglePinFromUI(kind, id) {
  const on = Store.togglePin(kind, id);
  shellRenderPins(); syncPinButtons(); shellSyncNav(_route.name);
  if (typeof renderToolHub === 'function') renderToolHub();
  if (typeof syncToolFav === 'function') syncToolFav();
  toast(on ? '已固定到侧栏' : '已取消固定');
}
function togglePinCurrent() {
  if (_route.name === 'tool' && _route.arg) { togglePinFromUI('tool', _route.arg); return; }
  const m = PAGE_META[_route.name];
  if (m && m.pin) { togglePinFromUI('page', _route.name); return; }
  toast('当前页面已在侧栏常驻，无需固定');
}

/* 右键菜单：重命名 / 取消固定（Trigger.dev Customize 同款能力） */
let _pinCtx = null;
function pinCtxClose() {
  if (_pinCtx) { _pinCtx.remove(); _pinCtx = null; }
  document.removeEventListener('mousedown', pinCtxOutside);
}
function pinCtxOutside(e) { if (_pinCtx && !_pinCtx.contains(e.target)) pinCtxClose(); }
function pinCtxOpen(e, item) {
  e.preventDefault(); pinCtxClose();
  const kind = item.dataset.pinKind, id = item.dataset.pinId;
  const m = document.createElement('div'); m.className = 'pin-ctx';
  m.innerHTML = '<button data-ctx="rename">重命名…</button><button data-ctx="unpin">取消固定</button>';
  document.body.appendChild(m);
  const r = item.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 170)) + 'px';
  m.style.top = Math.min(r.bottom + 4, window.innerHeight - 92) + 'px';
  m.addEventListener('click', ev => {
    const b = ev.target.closest('[data-ctx]'); if (!b) return;
    pinCtxClose();
    if (b.dataset.ctx === 'unpin') {
      Store.unpin(kind, id); shellRenderPins(); syncPinButtons(); shellSyncNav(_route.name);
      if (typeof renderToolHub === 'function') renderToolHub();
      if (typeof syncToolFav === 'function') syncToolFav();
      toast('已取消固定');
    } else {
      const cur = pinLabel(Store.pins().find(p => p.kind === kind && p.id === id) || { kind, id });
      formModal('重命名固定项', [{ k: 'label', label: '显示名称（留空恢复默认）', value: cur }], v => {
        Store.renamePin(kind, id, v.label); shellRenderPins();
      }, '保存');
    }
  });
  _pinCtx = m;
  /* 右键的 mousedown 先于 contextmenu 触发，同步注册不会误关刚打开的菜单 */
  document.addEventListener('mousedown', pinCtxOutside);
}

function shellRenderCats() {
  const host = document.getElementById('sideCats');
  if (!host) return;
  /* P5：侧栏分组跟工具箱配置同源（可改名 / 改序 / 隐藏）。
     toolboxView 不可用时回退旧的按 meta.group 分组——脚本顺序出问题也不至于白屏。 */
  let groups = [];
  if (typeof toolboxView === 'function') {
    groups = toolboxView().groups
      .filter(g => g.count > 0)
      .map(g => ({ id: g.id, name: g.name, color: g.color, tools: g.tools }));
  } else {
    const bag = {};
    (window.TOOL_META || []).forEach(t => { (bag[t.group] = bag[t.group] || []).push(t); });
    groups = Object.entries(bag).map(([g, ts]) => ({ id: g, name: g, color: '#007aff', tools: ts }));
  }
  /* 侧栏的折叠交给原生 <details>（每个用户自己展开），这里只回显分组名与数量；
     toolhub 页的「折叠分组」是另一层语义（整组收起），两者互不干扰。 */
  host.innerHTML = groups.map(g =>
    `<details class="side-cat" data-tb-cat="${esc(g.id)}"><summary><span class="cat-dot" style="background:${g.color}"></span>${esc(g.name)}<span class="cat-n">${g.tools.length}</span></summary>` +
    g.tools.map(t => `<button class="nav-item sub" data-tool-link="${esc(t.id)}">${toolIcon(t.id)}<span class="label">${esc(t.name)}</span></button>`).join('') +
    '</details>'
  ).join('');
}
function shellInit() {
  shellRenderCats(); shellRenderPins();
  document.addEventListener('click', e => {
    const px = e.target.closest('.pin-x');
    if (px) {
      const it = px.closest('[data-pin-id]');
      Store.unpin(it.dataset.pinKind, it.dataset.pinId);
      shellRenderPins(); syncPinButtons(); shellSyncNav(_route.name); renderToolHub(); syncToolFav();
      toast('已取消固定'); return;
    }
    const pt = e.target.closest('[data-pin-toggle]');
    if (pt) { togglePinFromUI(pt.dataset.pinToggleKind || 'page', pt.dataset.pinToggle); return; }
    const pi = e.target.closest('.pin-item');
    if (pi && !e.target.closest('.pin-grip')) {
      if (pi.dataset.pinKind === 'tool') (e.ctrlKey || e.metaKey) ? openToolWindow(pi.dataset.pinId) : openTool(pi.dataset.pinId);
      else navigate(pi.dataset.pinId);
      return;
    }
    const fav = e.target.closest('[data-fav-toggle]');
    if (fav) {
      const on = Store.toggleFav(fav.dataset.favToggle);
      shellRenderPins(); renderToolHub(); syncToolFav(); syncPinButtons(); shellSyncNav(_route.name);
      toast(on ? '已固定到侧栏' : '已取消固定');
      return;
    }
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      /* 「全部工具」是主窗里的普通页面（侧栏保留、无标签栏）；
         只有具体工具/工作区才由 openTool 交给工具窗口承载。 */
      navigate(nav.dataset.nav); return;
    }
    const tw = e.target.closest('[data-tool-window]');
    if (tw) { e.preventDefault(); openToolWindow(tw.dataset.toolWindow); return; }
    const tl = e.target.closest('[data-tool-link]');
    if (tl) { (e.ctrlKey || e.metaKey) ? openToolWindow(tl.dataset.toolLink) : openTool(tl.dataset.toolLink); return; }
    /* 工具卡点击（P0 重写时曾遗漏，P1 恢复）；Ctrl/⌘+点击 → 新窗口 */
    const tc = e.target.closest('[data-tool-id]');
    if (tc) { (e.ctrlKey || e.metaKey) ? openToolWindow(tc.dataset.toolId) : openTool(tc.dataset.toolId); return; }
  });
  /* 中键点击工具卡 / 侧栏工具 / 固定工具 → 新窗口（浏览器惯例） */
  document.addEventListener('auxclick', e => {
    if (e.button !== 1) return;
    const t = e.target.closest('[data-tool-id],[data-tool-link]');
    const pi = e.target.closest('.pin-item[data-pin-kind="tool"]');
    const id = t ? (t.dataset.toolId || t.dataset.toolLink) : (pi ? pi.dataset.pinId : null);
    if (id) { e.preventDefault(); openToolWindow(id); }
  });
  document.addEventListener('contextmenu', e => {
    const it = e.target.closest('.pin-item');
    if (it) pinCtxOpen(e, it);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const pi = e.target.closest && e.target.closest('.pin-item');
    if (!pi || e.target.closest('.pin-x,.pin-grip')) return;
    e.preventDefault(); pi.click();
  });
  document.getElementById('sideSearch').onclick = paletteOpen;
  const bs = document.getElementById('btnSearch'); if (bs) bs.onclick = paletteOpen;   // 标题栏搜索（P0 重写时曾遗漏，P1 恢复）
}
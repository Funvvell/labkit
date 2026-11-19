// LabKit · shell.js — 持久侧栏（P1）：工作台组 + 工具库分组 + 收藏 + 搜索入口 + 导航高亮
// 侧栏静态骨架在 index.html；分类与收藏由 TOOL_META / Store 渲染。
function shellSyncNav(name) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const key = (name === 'tool') ? 'toolhub' : name;
  document.querySelector(`.nav-item[data-nav="${key}"]`)?.classList.add('active');
  document.querySelectorAll('[data-tool-link]').forEach(b => b.classList.toggle('active', name === 'tool' && b.dataset.toolLink === _route.arg));
}
function shellRenderFavs() {
  const host = document.getElementById('sideFavs'); if (!host) return;
  const favs = Store.favs().map(id => (window.TOOL_META || []).find(t => t.id === id)).filter(Boolean);
  host.innerHTML = favs.length
    ? '<div class="side-group">收藏</div>' + favs.map(t => `<button class="nav-item sub" data-tool-link="${t.id}">${toolIcon(t.id)}<span class="label">${esc(t.name)}</span></button>`).join('')
    : '';
}
function shellRenderCats() {
  const host = document.getElementById('sideCats'); if (!host) return;
  const groups = {};
  (window.TOOL_META || []).forEach(t => { (groups[t.group] = groups[t.group] || []).push(t); });
  host.innerHTML = Object.entries(groups).map(([g, ts]) =>
    `<details class="side-cat"><summary>${esc(g)}<span class="cat-n">${ts.length}</span></summary>` +
    ts.map(t => `<button class="nav-item sub" data-tool-link="${t.id}">${toolIcon(t.id)}<span class="label">${esc(t.name)}</span></button>`).join('') +
    '</details>').join('');
}
function shellInit() {
  shellRenderCats(); shellRenderFavs();
  document.getElementById('sideSearch').onclick = () => paletteOpen();
  const bs = document.getElementById('btnSearch'); if (bs) bs.onclick = () => paletteOpen();
  /* 统一委托：导航 / 工具直达 / 收藏切换 / 工具卡（含卡内星标，避免嵌套 button） */
  document.addEventListener('click', e => {
    const fv = e.target.closest('[data-fav-toggle]');
    if (fv) {
      e.preventDefault(); e.stopPropagation();
      const on = Store.toggleFav(fv.dataset.favToggle);
      shellRenderFavs(); renderToolHub(); syncToolFav();
      toast(on ? '已加入收藏（侧栏可见）' : '已取消收藏');
      return;
    }
    const nv = e.target.closest('[data-nav]');
    if (nv) { navigate(nv.dataset.nav); return; }
    const tl = e.target.closest('[data-tool-link]');
    if (tl) { openTool(tl.dataset.toolLink); return; }
    const tc = e.target.closest('[data-tool-id]');
    if (tc) { openTool(tc.dataset.toolId); return; }
  });
}
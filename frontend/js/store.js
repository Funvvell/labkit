// LabKit · store.js — 统一持久化门面（P1）
// 偏好 / 收藏 / 最近 / 工具状态全部进 DB._store，随台账落盘（原子写 + .bak + 备份）；
// 浏览器演示模式随 DB 的 localStorage 缓存。工具不再各自散写 localStorage（P2 迁移）。
const Store = {
  bag() { if (!DB._store || typeof DB._store !== 'object') DB._store = {}; return DB._store; },
  get(k, d) { const b = this.bag(); return Object.prototype.hasOwnProperty.call(b, k) ? b[k] : d; },
  set(k, v) { this.bag()[k] = v; saveDB(); },
  settings() { const s = this.get('settings', {}); return (s && typeof s === 'object') ? s : {}; },
  setSetting(k, v) { const s = { ...this.settings(), [k]: v }; this.set('settings', s); return s; },
  favs() { const a = this.get('favs', []); return Array.isArray(a) ? a : []; },
  isFav(id) { return this.favs().includes(id); },
  toggleFav(id) {
    const a = this.favs(); const i = a.indexOf(id);
    if (i >= 0) a.splice(i, 1); else a.unshift(id);
    this.set('favs', a); return i < 0;
  },
  recent() { const a = this.get('recent', []); return Array.isArray(a) ? a : []; },
  pushRecent(id) { const a = this.recent().filter(x => x !== id); a.unshift(id); this.set('recent', a.slice(0, 8)); },
  /* P2：把 P0 时代散落在 localStorage 的工具状态一次性搬进台账（搬完即删旧键）。
     工具侧已改读 Store，旧键仅作迁移来源。 */
  migrateLegacy() {
    let moved = false;
    const put = (nw, raw) => { if (raw == null) return; try { if (this.get(nw) == null) { this.bag()[nw] = JSON.parse(raw); moved = true; } } catch (e) { } };
    const map = { 'labkit-figure': 'tool:figure', 'labkit-plate': 'tool:plate', 'labkit-plotter-cfg': 'tool:plotter-cfg', 'labkit-inv-api': 'tool:inv-api', 'labkit-inv-notify': 'tool:inv-notify' };
    try {
      for (const [old, nw] of Object.entries(map)) { put(nw, localStorage.getItem(old)); localStorage.removeItem(old); }
      for (const k of Object.keys(localStorage).filter(k => k.startsWith('labkit-checklist-'))) {
        put('tool:' + k.slice('labkit-'.length), localStorage.getItem(k)); localStorage.removeItem(k);
      }
    } catch (e) { /* 浏览器隐私模式等场景忽略 */ }
    if (moved) saveDB();
    return moved;
  },
};
/* P3：问候与新建记录默认负责人用的称呼（设置可改，未设置时为「研究者」） */
function userName(){return ((Store.settings().name||'').trim())||'研究者';}
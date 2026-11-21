// LabKit · store.js — 统一持久化门面（P1）
// 偏好 / 收藏 / 最近 / 工具状态全部进 DB._store，随台账落盘（原子写 + .bak + 备份）；
// 浏览器演示模式随 DB 的 localStorage 缓存。工具不再各自散写 localStorage（P2 迁移）。
const Store = {
  bag() { if (!DB._store || typeof DB._store !== 'object') DB._store = {}; return DB._store; },
  get(k, d) { const b = this.bag(); return Object.prototype.hasOwnProperty.call(b, k) ? b[k] : d; },
  set(k, v) { this.bag()[k] = v; saveDB(); },
  settings() { const s = this.get('settings', {}); return (s && typeof s === 'object') ? s : {}; },
  setSetting(k, v) { const s = { ...this.settings(), [k]: v }; this.set('settings', s); return s; },
  /* ---- 固定入口（pins）：页面 + 工具统一模型，自定义排序/重命名 ----
     条目 {kind:'page'|'tool', id, label?, at}；favs/isFav/toggleFav 保留为
     kind:'tool' 的门面，工具星标等既有调用方零改动。 */
  pins() { const a = this.get('pins', null); return Array.isArray(a) ? a.filter(p => p && (p.kind === 'page' || p.kind === 'tool') && p.id) : []; },
  isPinned(kind, id) { return this.pins().some(p => p.kind === kind && p.id === id); },
  pin(kind, id, label) {
    const a = this.pins();
    if (a.some(p => p.kind === kind && p.id === id)) return false;
    a.unshift({ kind, id, label: String(label || '').trim(), at: Date.now() });
    this.set('pins', a); return true;
  },
  unpin(kind, id) {
    const a = this.pins(); const i = a.findIndex(p => p.kind === kind && p.id === id);
    if (i < 0) return false;
    a.splice(i, 1); this.set('pins', a); return true;
  },
  togglePin(kind, id) { return this.isPinned(kind, id) ? (this.unpin(kind, id), false) : (this.pin(kind, id), true); },
  movePin(from, to) {
    const a = this.pins(); if (from < 0 || from >= a.length || from === to) return;
    const [it] = a.splice(from, 1);
    a.splice(Math.max(0, Math.min(a.length, to)), 0, it);
    this.set('pins', a);
  },
  renamePin(kind, id, label) {
    const a = this.pins(); const p = a.find(x => x.kind === kind && x.id === id);
    if (!p) return false;
    p.label = String(label || '').trim(); this.set('pins', a); return true;
  },
  /* ---- 收藏门面（兼容旧调用方；语义 = 固定工具） ---- */
  favs() { return this.pins().filter(p => p.kind === 'tool').map(p => p.id); },
  isFav(id) { return this.isPinned('tool', id); },
  toggleFav(id) { return this.togglePin('tool', id); },
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
    /* 收藏 → 固定：老 favs 数组一次性迁移为 pins（保序）；迁移成功才清旧键。
       P1：置 null 而非 delete——多窗口合并写里 null 是删除墓碑，Rust 侧据此移除盘上旧键 */
    try {
      const oldFavs = this.get('favs', null);
      if (Array.isArray(oldFavs) && this.get('pins', null) == null) {
        this.bag().pins = oldFavs.filter(id => typeof id === 'string' && id)
          .map(id => ({ kind: 'tool', id, label: '', at: Date.now() }));
        this.bag().favs = null;
        moved = true;
      }
    } catch (e) { /* 迁移失败保留旧 favs，不删键 */ }
    /* P7 工具打开方式：所有工具统一进「工具箱」窗口的标签页，旧开关下线。
       toolOpenInPage / toolNewWindow 置 null 墓碑（null 是多窗口合并写的删除标记），
       不保留任何「默认页内 / 默认新窗」分支。 */
    try {
      const s = this.settings();
      if (Object.prototype.hasOwnProperty.call(s, 'toolNewWindow')
        || Object.prototype.hasOwnProperty.call(s, 'toolOpenInPage')) {
        this.set('settings', Object.assign({}, s, { toolNewWindow: null, toolOpenInPage: null }));
        moved = true;
      }
    } catch (e) { /* 迁移失败保留旧键，不影响标签页默认 */ }
    if (moved) saveDB();
    return moved;
  },
};
/* P3：问候与新建记录默认负责人用的称呼（设置可改，未设置时为「研究者」） */
function userName(){return ((Store.settings().name||'').trim())||'研究者';}
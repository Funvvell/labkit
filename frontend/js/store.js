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
};
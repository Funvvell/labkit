// LabKit · toolbox.js — 工具箱个性化数据层（覆盖层 overlay，纯函数，node 可测）
//
// 设计参考：
//   * Dashy 的 section schema（name / icon / color / displayData.collapsed）——
//     分组就是 section，工具就是 item，组色与图标 1:1 对应；
//   * VS Code 的 Activity Bar（拖拽重排 + Hide + Reset）与「隐藏的视图仍能被命令面板打开」；
//   * Obsidian Bookmarks 的「拖拽归档 + F2 重命名 + 删除可恢复」。
//
// 关键取舍：**只存用户改动**。默认视图完全由 window.TOOL_META 派生，
// 所以插件装卸、内置新增工具都不需要重写用户配置；升级也不会丢布局。
//
// 依赖：store.js(Store) / stats.js(esc) / tools/registry.js(window.TOOL_META)
// 不依赖 toolhub.js 的任何 const —— 它在 toolhub.js 之前求值，避免 TDZ。

const TOOLBOX_V = 1;
const TOOLBOX_UNGROUPED = 'b:未分类';

/* 默认分组：沿用现有三个内置中文组名，保证老用户视觉零变化。
   id 用 'b:' 前缀（builtin）+ 组名，中文名直接可读，迁移时无需映射表。 */
const TOOLBOX_DEFAULT_GROUPS = [
  { id: 'b:统计与数据', name: '统计与数据', color: '#7b5cff', icon: 'chart' },
  { id: 'b:实验计算', name: '实验计算', color: '#2fa96b', icon: 'flask' },
  { id: 'b:写作与图', name: '写作与图', color: '#f0832a', icon: 'pen' },
  { id: 'b:社区插件', name: '社区插件', color: '#007aff', icon: 'grid' },
  { id: TOOLBOX_UNGROUPED, name: '未分类', color: '#8e8e93', icon: 'box' },
];
/* 8 色板：与 app.css 的语义色对齐，深色模式靠 color-mix 着色，不写死背景。 */
const TOOLBOX_COLORS = ['#007aff', '#7b5cff', '#2fa96b', '#f0832a', '#ff3b30', '#1fa5b8', '#8e8e93', '#c86dd7'];
const TOOLBOX_ICONS = {
  chart: '<path d="M4 19V9M10 19V5M16 19V11M22 19V7"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/>',
  pen: '<path d="M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4"/>',
  grid: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v18H5.5A1.5 1.5 0 0 1 4 19.5v-15zM4 19.5A1.5 1.5 0 0 1 5.5 18H19"/>',
  bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>',
  dna: '<path d="M8 3c0 6 8 12 8 18M16 3c0 6-8 12-8 18M7 8h10M7 16h10"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="1.6"/><path d="M3 16l5-5 4 4 3-3 6 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/>',
  code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
};
const TOOLBOX_ICON_KEYS = Object.keys(TOOLBOX_ICONS);
const TOOLBOX_ICON_LABELS = {
  chart: '图表', flask: '实验', pen: '写作', grid: '网格', box: '归档', star: '星标', book: '文献',
  bolt: '快捷', dna: '序列', image: '图像', clock: '计时', layers: '层级', code: '代码', database: '数据',
};
/** 分组图标（或工具自定义图标）→ SVG；不是预设图标时回退到工具自己的图标。 */
function toolboxIconSVG(key, fallbackId) {
  const p = TOOLBOX_ICONS[key];
  if (p) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  if (typeof TOOL_ICONS !== 'undefined' && TOOL_ICONS) {
    const inner = TOOL_ICONS[key] || TOOL_ICONS[fallbackId] || TOOL_ICONS._default || '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  return '';
}

/* ===================== 基础工具 ===================== */

/** 默认分组 id：'b:' + 组名；空组名落「未分类」。 */
function toolboxGroupId(name) {
  const n = String(name == null ? '' : name).trim();
  return n ? 'b:' + n : TOOLBOX_UNGROUPED;
}
function toolboxNewGroupId(seed) {
  const s = (seed || Date.now().toString(36) + Math.random().toString(36).slice(2, 6))
    .replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'g';
  return 'u:' + s;
}
function toolboxIsUserGroup(gid) { return typeof gid === 'string' && gid.indexOf('u:') === 0; }
function toolboxColor(v) {
  const s = String(v == null ? '' : v).trim();
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : '';
}
function toolboxIconKey(v) {
  const s = String(v == null ? '' : v).trim();
  return TOOLBOX_ICONS[s] ? s : '';
}
function toolboxDefault() { return { v: TOOLBOX_V, groups: {}, order: [], items: {} }; }

/** 归一化：脏输入一律兜底成空覆盖层，绝不让一处坏数据把工具箱变空。 */
function toolboxNormalize(raw) {
  const out = toolboxDefault();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const groups = raw.groups && typeof raw.groups === 'object' && !Array.isArray(raw.groups) ? raw.groups : {};
  Object.keys(groups).forEach(gid => {
    if (typeof gid !== 'string' || !gid) return;
    const g = groups[gid];
    if (!g || typeof g !== 'object' || Array.isArray(g)) return;
    const rec = {};
    if (typeof g.name === 'string' && g.name.trim()) rec.name = g.name.trim().slice(0, 24);
    const c = toolboxColor(g.color); if (c) rec.color = c;
    const i = toolboxIconKey(g.icon); if (i) rec.icon = i;
    if (g.collapsed === true) rec.collapsed = true;
    if (g.deleted === true) rec.deleted = true;
    if (g.created === true) rec.created = true;
    if (typeof g.sort === 'string' && /^(manual|recent|name)$/.test(g.sort)) rec.sort = g.sort;
    if (!Object.keys(rec).length) return;
    out.groups[gid] = rec;
  });
  if (Array.isArray(raw.order)) {
    const seen = new Set();
    raw.order.forEach(gid => {
      if (typeof gid !== 'string' || !gid || seen.has(gid)) return;
      seen.add(gid); out.order.push(gid);
    });
  }
  const items = raw.items && typeof raw.items === 'object' && !Array.isArray(raw.items) ? raw.items : {};
  Object.keys(items).forEach(id => {
    if (typeof id !== 'string' || !id) return;
    const it = items[id];
    if (!it || typeof it !== 'object' || Array.isArray(it)) return;
    const rec = {};
    if (typeof it.g === 'string' && it.g) rec.g = it.g;
    if (typeof it.i === 'number' && isFinite(it.i) && it.i >= 0) rec.i = Math.floor(it.i);
    if (it.hidden === true) rec.hidden = true;
    const c = toolboxColor(it.color); if (c) rec.color = c;
    const k = toolboxIconKey(it.icon); if (k) rec.icon = k;
    if (!Object.keys(rec).length) return;
    out.items[id] = rec;
  });
  return out;
}

/* ===================== 派生视图 ===================== */

function toolboxMetaColors() {
  const m = {};
  TOOLBOX_DEFAULT_GROUPS.forEach(g => { m[g.id] = g.color; });
  return m;
}

/** 分组定义表：默认组 + 用户新建组，剔除已删除的；返回 Map<gid, group>。 */
function toolboxGroupTable(ov) {
  const table = new Map();
  TOOLBOX_DEFAULT_GROUPS.forEach(d => {
    const o = ov.groups[d.id] || {};
    if (o.deleted) return;
    table.set(d.id, {
      id: d.id, name: o.name || d.name, color: o.color || d.color, icon: o.icon || d.icon,
      collapsed: !!o.collapsed, created: false, sort: o.sort || 'manual',
    });
  });
  Object.keys(ov.groups).forEach(gid => {
    const o = ov.groups[gid];
    if (!o || o.deleted) return;
    if (table.has(gid)) return;
    /* 默认组被改名后仍以默认 id 存在；用户组只认 created 标记，避免脏 id 造出幽灵组。 */
    table.set(gid, {
      id: gid,
      name: o.name || '未命名分组',
      color: o.color || TOOLBOX_COLORS[0],
      icon: o.icon || 'grid',
      collapsed: !!o.collapsed,
      created: !!o.created || toolboxIsUserGroup(gid),
      sort: o.sort || 'manual',
    });
  });
  return table;
}

/** 完整分组顺序：显式 order → 默认组（声明序）→ 用户组（创建序）→ 未分类永远最后。 */
function toolboxGroupIds(ov) {
  const table = toolboxGroupTable(ov);
  const out = [];
  const seen = new Set();
  const push = gid => {
    if (!table.has(gid) || seen.has(gid)) return;
    seen.add(gid); out.push(gid);
  };
  ov.order.forEach(push);
  TOOLBOX_DEFAULT_GROUPS.forEach(g => push(g.id));
  table.forEach((g, gid) => { if (g.created) push(gid); });
  // 未分类置底（如果它存在）
  const ui = out.indexOf(TOOLBOX_UNGROUPED);
  if (ui >= 0) { out.splice(ui, 1); out.push(TOOLBOX_UNGROUPED); }
  return out;
}

/**
 * 派生视图。纯函数：不读写 Store、不碰 DOM。
 * @param {Array} metas window.TOOL_META
 * @param {Object} raw   DB._store.toolbox（可为 null）
 * @returns {{groups:Array, items:Object, hidden:Array, orphans:Array, totals:Object}}
 */
function toolboxDerive(metas, raw) {
  const ov = toolboxNormalize(raw);
  const table = toolboxGroupTable(ov);
  const order = toolboxGroupIds(ov);
  const list = Array.isArray(metas) ? metas.filter(t => t && t.id) : [];
  const byId = new Map();
  const items = {};
  const buckets = new Map();
  order.forEach(gid => buckets.set(gid, []));
  const hidden = [];

  list.forEach((meta, idx) => {
    byId.set(meta.id, meta);
    const o = ov.items[meta.id] || {};
    /* 归属：显式 g > meta.group 映射 > 未分类；显式指向已删组时回落到未分类。 */
    let gid = '';
    if (o.g) {
      gid = table.has(o.g) ? o.g : TOOLBOX_UNGROUPED;
    } else {
      const guess = toolboxGroupId(meta.group);
      gid = table.has(guess) ? guess : TOOLBOX_UNGROUPED;
    }
    if (!table.has(gid)) gid = TOOLBOX_UNGROUPED;
    if (!buckets.has(gid)) { buckets.set(gid, []); order.push(gid); }
    const g = table.get(gid);
    const rec = {
      id: meta.id,
      meta,
      gid,
      gname: g ? g.name : '未分类',
      gcolor: g ? g.color : '#8e8e93',
      hidden: o.hidden === true,
      order: typeof o.i === 'number' ? o.i : 1e6 + idx,
      icon: o.icon || '',
      color: o.color || '',
      resolvedIcon: o.icon || meta.id,
      resolvedColor: o.color || (g ? g.color : '#8e8e93'),
    };
    items[meta.id] = rec;
    if (rec.hidden) hidden.push(meta); else buckets.get(gid).push(rec);
  });

  const groups = order.map(gid => {
    const def = table.get(gid) || { id: gid, name: '未分类', color: '#8e8e93', icon: 'box', collapsed: false, created: false };
    const rows = (buckets.get(gid) || []).slice().sort((a, b) => a.order - b.order);
    return {
      id: gid, name: def.name, color: def.color, icon: def.icon,
      collapsed: !!def.collapsed, created: !!def.created, sort: def.sort || 'manual',
      tools: rows.map(r => r.meta),
      rows,
      count: rows.length,
    };
  }).filter(g => g.count > 0 || g.created || table.has(g.id));

  /* 编辑态要能看见空的内置组（否则删空后再也放不回去）；非编辑态由调用方按 count 过滤。
     这里保留全部组，让消费点自行决定。 */
  const orphans = Object.keys(ov.items).filter(id => !byId.has(id));
  return {
    groups,
    items,
    hidden,
    orphans,
    totals: {
      tools: list.length,
      visible: list.length - hidden.length,
      hidden: hidden.length,
      groups: groups.filter(g => g.count > 0).length,
    },
  };
}

/* ===================== 变更操作（全部返回新覆盖层） ===================== */

function toolboxClone(ov) {
  const n = toolboxNormalize(ov);
  return {
    v: TOOLBOX_V,
    groups: JSON.parse(JSON.stringify(n.groups)),
    order: n.order.slice(),
    items: JSON.parse(JSON.stringify(n.items)),
  };
}
function tbItem(ov, id) {
  if (!ov.items[id]) ov.items[id] = {};
  return ov.items[id];
}
function tbTouchOrder(ov) {
  const table = toolboxGroupTable(ov);
  ov.order = toolboxGroupIds(ov).filter(gid => table.has(gid));
  return ov;
}

/** 新建分组：返回 {ov, gid}。同名直接复用已有组（不做重名歧义）。 */
function toolboxCreateGroup(ov, opts) {
  const next = toolboxClone(ov);
  const o = opts || {};
  const name = String(o.name == null ? '' : o.name).trim().slice(0, 24) || '新分组';
  const existing = toolboxGroupIds(next).find(gid => {
    const t = toolboxGroupTable(next).get(gid);
    return t && t.name === name;
  });
  if (existing) return { ov: next, gid: existing };
  const gid = toolboxNewGroupId();
  next.groups[gid] = {
    name,
    color: toolboxColor(o.color) || TOOLBOX_COLORS[0],
    icon: toolboxIconKey(o.icon) || 'grid',
    created: true,
    sort: 'manual',
  };
  next.order.push(gid);
  return { ov: next, gid };
}

function toolboxRenameGroup(ov, gid, name) {
  const next = toolboxClone(ov);
  if (!toolboxGroupTable(next).has(gid)) return next;
  const n = String(name == null ? '' : name).trim().slice(0, 24);
  const base = toolboxGroupTable(next).get(gid);
  const rec = next.groups[gid] || (next.groups[gid] = {});
  if (n && n !== base.name) rec.name = n; else delete rec.name;
  if (!Object.keys(rec).length) delete next.groups[gid];
  return next;
}

function toolboxStyleGroup(ov, gid, patch) {
  const next = toolboxClone(ov);
  if (!toolboxGroupTable(next).has(gid)) return next;
  const p = patch || {};
  const rec = next.groups[gid] || (next.groups[gid] = {});
  if (Object.prototype.hasOwnProperty.call(p, 'color')) {
    const c = toolboxColor(p.color); if (c) rec.color = c; else delete rec.color;
  }
  if (Object.prototype.hasOwnProperty.call(p, 'icon')) {
    const i = toolboxIconKey(p.icon); if (i) rec.icon = i; else delete rec.icon;
  }
  if (!Object.keys(rec).length) delete next.groups[gid];
  return next;
}

function toolboxCollapseGroup(ov, gid, on) {
  const next = toolboxClone(ov);
  if (!toolboxGroupTable(next).has(gid)) return next;
  const rec = next.groups[gid] || (next.groups[gid] = {});
  if (on) rec.collapsed = true; else delete rec.collapsed;
  if (!Object.keys(rec).length) delete next.groups[gid];
  return next;
}

/** 删除分组：组内工具显式写入「未分类」，内置组留 deleted 墓碑防再次派生。 */
function toolboxDeleteGroup(ov, gid, metas) {
  const next = toolboxClone(ov);
  if (!toolboxGroupTable(next).has(gid)) return next;
  if (gid === TOOLBOX_UNGROUPED) return next;   // 系统组不可删
  const view = toolboxDerive(metas, next);
  view.groups.forEach(g => {
    if (g.id !== gid) return;
    g.tools.forEach(t => { tbItem(next, t.id).g = TOOLBOX_UNGROUPED; });
  });
  const rec = next.groups[gid] || (next.groups[gid] = {});
  if (toolboxIsUserGroup(gid)) {
    delete next.groups[gid];                      // 用户组直接移除
  } else {
    rec.deleted = true;                           // 内置组留墓碑
    delete rec.name; delete rec.color; delete rec.icon; delete rec.collapsed;
  }
  next.order = next.order.filter(x => x !== gid);
  return next;
}

/** 组间排序：toIndex 为在完整分组序列中的目标位置（未分类始终最后）。 */
function toolboxMoveGroup(ov, gid, toIndex) {
  const next = toolboxClone(ov);
  const ids = toolboxGroupIds(next).filter(x => x !== gid);
  const clamped = Math.max(0, Math.min(ids.length, toIndex | 0));
  ids.splice(clamped, 0, gid);
  const ui = ids.indexOf(TOOLBOX_UNGROUPED);
  if (ui >= 0) { ids.splice(ui, 1); ids.push(TOOLBOX_UNGROUPED); }
  next.order = ids;
  return next;
}

/** 移动工具：beforeId 为空 → 落到目标组末尾。同时重排两组序号，保持 0..n-1 连续。 */
function toolboxMoveItem(ov, id, toGid, beforeId, metas) {
  const next = toolboxClone(ov);
  if (!id || !toGid) return next;
  const table = toolboxGroupTable(next);
  if (!table.has(toGid)) return next;
  const before = toolboxDerive(metas, next);
  const item = before.items[id];
  if (!item) return next;
  const fromGid = item.gid;
  const target = (before.groups.find(g => g.id === toGid) || { tools: [] }).tools
    .map(t => t.id).filter(x => x !== id);
  let at = target.length;
  if (beforeId) {
    const i = target.indexOf(beforeId);
    if (i >= 0) at = i;
  }
  target.splice(at, 0, id);
  target.forEach((tid, i) => { tbItem(next, tid).g = toGid; tbItem(next, tid).i = i; });
  if (fromGid !== toGid) {
    const rest = (before.groups.find(g => g.id === fromGid) || { tools: [] }).tools
      .map(t => t.id).filter(x => x !== id);
    rest.forEach((tid, i) => { tbItem(next, tid).i = i; });
  }
  return next;
}

function toolboxSetHidden(ov, id, hidden) {
  const next = toolboxClone(ov);
  if (!id) return next;
  const rec = tbItem(next, id);
  if (hidden) rec.hidden = true; else delete rec.hidden;
  if (!Object.keys(rec).length) delete next.items[id];
  return next;
}

function toolboxStyleItem(ov, id, patch) {
  const next = toolboxClone(ov);
  if (!id) return next;
  const p = patch || {};
  const rec = tbItem(next, id);
  if (Object.prototype.hasOwnProperty.call(p, 'color')) {
    const c = toolboxColor(p.color); if (c) rec.color = c; else delete rec.color;
  }
  if (Object.prototype.hasOwnProperty.call(p, 'icon')) {
    const i = toolboxIconKey(p.icon); if (i) rec.icon = i; else delete rec.icon;
  }
  if (!Object.keys(rec).length) delete next.items[id];
  return next;
}

/** 清理失效配置（插件卸载后的残留 id）：只删孤儿条目，不动分组。 */
function toolboxPruneOrphans(ov, metas) {
  const next = toolboxClone(ov);
  const alive = new Set((Array.isArray(metas) ? metas : []).filter(t => t && t.id).map(t => t.id));
  Object.keys(next.items).forEach(id => { if (!alive.has(id)) delete next.items[id]; });
  return next;
}

function toolboxIsDefault(ov) {
  const n = toolboxNormalize(ov);
  return Object.keys(n.groups).length === 0 && n.order.length === 0 && Object.keys(n.items).length === 0;
}
function toolboxReset() { return toolboxDefault(); }

/**
 * 挑 n 个工具给「科研工具」Dashboard 卡片：固定 → 最近 → 工具箱顺序补足，跳过隐藏。
 * 纯函数，供 dashboard.js 调用；不再硬编码 6 个入口。
 */
function toolboxPickEntries(metas, overlay, pins, recent, n) {
  const list = Array.isArray(metas) ? metas.filter(t => t && t.id) : [];
  const view = toolboxDerive(list, overlay);
  const limit = Math.max(0, n | 0) || 6;
  const out = [];
  const has = id => list.some(t => t.id === id);
  const push = id => {
    if (out.length >= limit || out.indexOf(id) >= 0 || !has(id)) return;
    if (toolboxIsHiddenById(view, id)) return;
    out.push(id);
  };
  (Array.isArray(pins) ? pins : []).forEach(push);
  (Array.isArray(recent) ? recent : []).forEach(push);
  view.groups.forEach(g => g.tools.forEach(t => push(t.id)));
  list.forEach(t => push(t.id));
  return out.map(id => list.find(t => t.id === id));
}
function toolboxIsHiddenById(view, id) {
  return !!(view && view.items[id] && view.items[id].hidden);
}

/* ===================== 与 Store 的桥接（运行时，不参与纯函数测试） ===================== */
let _toolboxMemo = null;
function toolboxMetas() { return (typeof window !== 'undefined' && window.TOOL_META) || []; }
function toolboxRaw() {
  try {
    if (typeof Store !== 'undefined' && Store && typeof Store.get === 'function') return Store.get('toolbox', null);
  } catch (_) { }
  return null;
}
/** 派生视图 + 记忆化：键 = 工具数 + 覆盖层 JSON，装卸插件/保存配置后自动失效。
    编辑态优先读 window.__LK_TOOLBOX_DRAFT（toolhub.js 设置的草稿，未保存不落盘）。 */
function toolboxView() {
  const metas = toolboxMetas();
  const draft = (typeof window !== 'undefined' && window.__LK_TOOLBOX_DRAFT) || null;
  const raw = draft || toolboxRaw();
  const key = metas.length + '|' + (draft ? 'd' : 's') + '|' + JSON.stringify(raw || null);
  if (_toolboxMemo && _toolboxMemo.key === key) return _toolboxMemo.view;
  const view = toolboxDerive(metas, raw);
  _toolboxMemo = { key, view };
  return view;
}
function toolboxInvalidate() { _toolboxMemo = null; }
function toolboxSave(ov) {
  const next = toolboxNormalize(ov);
  try {
    if (typeof Store !== 'undefined' && Store && typeof Store.set === 'function') {
      Store.set('toolbox', toolboxIsDefault(next) ? null : next);
    }
  } catch (_) { }
  toolboxInvalidate();
  return next;
}
/** 供快捷键/命令面板判断：这个工具被用户隐藏了吗。 */
function toolboxIsHidden(id) {
  try { const it = toolboxView().items[id]; return !!(it && it.hidden); } catch (_) { return false; }
}

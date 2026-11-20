// LabKit · plugins.js — P5 双市场扩展（工具扩展 / 卡片扩展）
// 前端只做 UI 与注册 API；所有 HTTP / 落盘 / 哈希校验走 Rust IPC（单一信任边界）。
// 参考 HACS 的 HacsCategory 与 Directus 的 extension type：一个包只能属于一个类型。
// 工具市场挂在「工具库」里，卡片市场挂在 Dashboard「+ 添加卡片」里，
// 安装/更新/卸载/开发载入统一在侧栏「扩展管理」。
// 安全模型：扩展与内置同权限（无硬沙箱），默认关闭、显式安装、不自动更新。

const PLUGIN_MARKET_LABEL = { tool: '工具扩展', widget: '卡片扩展' };
const PLUGIN_MARKET_HINT = {
  tool: '只注册工具库里的工具；装完在「工具库」出现。',
  widget: '只注册 Dashboard 卡片；装完在「+ 添加卡片」里出现。',
};

/* 每个市场一份独立状态（索引、搜索词、加载态）；缓存落 DB._store.pluginIndex 的分槽。 */
const PluginMarkets = { tool: pluginMarketSlot(), widget: pluginMarketSlot() };
function pluginMarketSlot() {
  return { items: [], loading: false, loaded: false, query: '', url: '', legacy: false, error: '' };
}
/* 已挂载的市场面板：hostEl → { kind, opts }。动作完成后按 kind 重绘已打开的入口。 */
const PLUGIN_MOUNTS = new Map();

function pluginCfg() {
  const p = Store.settings().plugins;
  return Object.assign({ enabled: false, indexUrl: '', token: '' }, p && typeof p === 'object' ? p : {});
}
function pluginSetCfg(patch) {
  Store.setSetting('plugins', Object.assign(pluginCfg(), patch));
  saveDB();
}
function pluginRecords() {
  const p = Store.get('plugins', {});
  return p && typeof p === 'object' && !Array.isArray(p) ? p : {};
}
function pluginSaveRecord(id, rec) {
  const all = pluginRecords(); all[id] = rec;
  Store.set('plugins', all); saveDB();
}
function pluginDelRecord(id) {
  const all = pluginRecords(); delete all[id];
  Store.set('plugins', all); saveDB();
}
function pluginRecsOfKind(kind) {
  return Object.values(pluginRecords()).filter(r => r && r.id && pluginRecKind(r) === kind);
}

/* ---------------- 公开注册 API（扩展 main.js 调用） ---------------- */
window.LabKit = window.LabKit || {};
function pluginCurKind() { return pluginNormalizeKind(window.__LK_CURRENT_PLUGIN_KIND) || PLUGIN_KIND_ANY; }
function pluginNoteBlocked(api) {
  if (!Array.isArray(window.__LK_BLOCKED)) window.__LK_BLOCKED = [];
  if (window.__LK_BLOCKED.indexOf(api) < 0) window.__LK_BLOCKED.push(api);
}
/** 已注册内容计数：注入前后取差，用来发现「工具包偷偷注册卡片」。 */
function pluginCounts() {
  const tool = (window.TOOL_META || []).filter(t => t.plugin).length;
  const widget = typeof WIDGETS !== 'undefined' && WIDGETS
    ? Object.keys(WIDGETS).filter(k => WIDGETS[k] && WIDGETS[k].plugin).length
    : 0;
  return { tool, widget };
}
LabKit.registerTool = function (meta, fn) {
  const pid = window.__LK_CURRENT_PLUGIN;
  if (!pid) { console.warn('LabKit.registerTool 只能在扩展脚本内调用'); return null; }
  if (!pluginKindAccepts(pluginCurKind(), 'tool')) {
    pluginNoteBlocked('tool');
    console.warn('当前扩展类型为「' + pluginCurKind() + '」，不允许注册工具');
    return null;
  }
  const id = pluginFullId(pid, meta && meta.id);
  if (!id) { console.warn('扩展工具 id 非法：', meta && meta.id); return null; }
  if ((window.TOOL_META || []).some(t => t.id === id)) return id;  // 撞名去重
  const impl = typeof fn === 'function' ? fn : (meta && meta.fn);
  if (typeof impl !== 'function') { console.warn('扩展工具缺少渲染函数：' + id); return null; }
  window.LabKitTools[id] = impl;
  window.TOOL_META.push(Object.assign({}, meta, {
    id, plugin: pid, scripts: [], group: (meta && meta.group) || '社区插件',
    py: ((meta && meta.py) || '') + ' ' + id,
  }));
  return id;
};
LabKit.registerWidget = function (def) {
  const pid = window.__LK_CURRENT_PLUGIN;
  if (!pid) { console.warn('LabKit.registerWidget 只能在扩展脚本内调用'); return null; }
  if (!pluginKindAccepts(pluginCurKind(), 'widget')) {
    pluginNoteBlocked('widget');
    console.warn('当前扩展类型为「' + pluginCurKind() + '」，不允许注册卡片');
    return null;
  }
  const id = pluginFullId(pid, def && def.id);
  if (!id) { console.warn('扩展卡片 id 非法：', def && def.id); return null; }
  if (typeof WIDGETS !== 'undefined' && WIDGETS[id]) return id;  // 撞名去重
  if (typeof WIDGETS === 'undefined') return null;
  WIDGETS[id] = Object.assign({}, def, {
    id, plugin: pid,
    title: (def && def.title) || id,
    sizes: (def && Array.isArray(def.sizes) && def.sizes.length) ? def.sizes : ['2x2', '4x2'],
    size: (def && def.size) || '2x2',
  });
  return id;
};
LabKit.version = PLUGIN_APP_VERSION;

/* ---------------- 加载 / 卸载 ---------------- */
function pluginStyleTag(id) { return document.querySelector('link[data-plugin-style="' + CSS.escape(id) + '"]'); }
async function pluginInject(rec) {
  if (!IN_TAURI) return false;
  const mainUrl = pluginAssetPath(rec.id, rec.version, 'main.js');
  if (!mainUrl) throw new Error('扩展 id / 版本非法，拒绝加载');
  const before = pluginCounts();
  window.__LK_CURRENT_PLUGIN = rec.id;
  window.__LK_CURRENT_PLUGIN_KIND = pluginRecKind(rec);
  window.__LK_BLOCKED = [];
  let ok = false;
  try {
    try {
      await loadScript(mainUrl);
    } catch (_) {
      /* 自定义协议失败：IPC 读文本 + eval（CSP 已含 unsafe-eval） */
      const code = await invoke('plugins_read_asset', { id: rec.id, version: rec.version, file: 'main.js' });
      (0, eval)(code);
    }
    const style = rec.manifest && rec.manifest.styles;
    if (style && style !== 'main.js' && !pluginStyleTag(rec.id)) {
      const href = pluginAssetPath(rec.id, rec.version, style);
      if (href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet'; link.href = href; link.dataset.pluginStyle = rec.id;
        document.head.appendChild(link);
      }
    }
    ok = true;
  } finally {
    window.__LK_CURRENT_PLUGIN = null;
    window.__LK_CURRENT_PLUGIN_KIND = null;
    const after = pluginCounts();
    const blocked = Array.isArray(window.__LK_BLOCKED) ? window.__LK_BLOCKED.slice() : [];
    window.__LK_BLOCKED = [];
    /* 记录本次实际注册了什么：扩展管理页据此标红「工具包注册了卡片」。
       写记录本身要防抖失败，不能因为记账把注入结果吞掉。 */
    try {
      const cur = pluginRecords()[rec.id];
      if (cur) {
        const reg = {
          tool: Math.max(0, after.tool - before.tool),
          widget: Math.max(0, after.widget - before.widget),
        };
        const prevBlocked = Array.isArray(cur.blocked) ? cur.blocked : [];
        if (!cur.reg || cur.reg.tool !== reg.tool || cur.reg.widget !== reg.widget
          || prevBlocked.join(',') !== blocked.join(',')) {
          cur.reg = reg; cur.blocked = blocked;
          pluginSaveRecord(rec.id, cur);
        }
      }
    } catch (_) { /* 记账失败不影响扩展本身 */ }
  }
  return ok;
}
function pluginRemoveFromRegistries(id) {
  if (window.TOOL_META) {
    for (let i = window.TOOL_META.length - 1; i >= 0; i--) {
      if (window.TOOL_META[i].plugin === id) {
        delete window.LabKitTools[window.TOOL_META[i].id];
        window.TOOL_META.splice(i, 1);
      }
    }
  }
  if (typeof WIDGETS !== 'undefined') {
    Object.keys(WIDGETS).forEach(k => { if (WIDGETS[k].plugin === id) delete WIDGETS[k]; });
  }
  const tag = pluginStyleTag(id); if (tag) tag.remove();
}
function pluginRefreshShell() {
  if (typeof toolboxInvalidate === 'function') toolboxInvalidate();
  if (typeof shellRenderCats === 'function') shellRenderCats();
  if (typeof renderToolHub === 'function') renderToolHub();
  if (typeof shellRenderPins === 'function') shellRenderPins();
  if (typeof buildDash === 'function') buildDash();
}
/* 启动：仅注入已启用扩展；单个失败隔离并标记，不拖垮主程序。 */
async function pluginBoot() {
  if (!IN_TAURI || !pluginCfg().enabled) return;
  const recs = pluginRecords();
  for (const [id, rec] of Object.entries(recs)) {
    if (!rec || !rec.enabled) continue;
    try {
      await pluginInject(rec);
    } catch (e) {
      console.warn('扩展加载失败：' + id, e);
      const cur = pluginRecords()[id] || rec;
      cur.error = String(e && e.message || e);
      pluginSaveRecord(id, cur);
      toast('扩展「' + id + '」加载失败：' + cur.error, 6000);
    }
  }
}

/* ---------------- 市场数据 ---------------- */
function pluginIndexSlot(kind) {
  const bag = pluginIndexStore(DB._store && DB._store.pluginIndex);
  return bag[kind] || null;
}
function pluginIndexSave(kind, slot) {
  const bag = pluginIndexStore(DB._store && DB._store.pluginIndex);
  bag[kind] = slot;
  DB._store.pluginIndex = bag;
  saveDB();
}
/** 拉一个市场的索引。raw 条目整份落缓存（两份索引可能指向同一个 plugins.json），
    过滤留给 pluginFilterIndex，避免把 both 条目二次污染。 */
async function pluginFetchIndex(kind, refresh) {
  const k = pluginNormalizeKind(kind);
  if (k !== 'tool' && k !== 'widget') return null;
  const m = PluginMarkets[k];
  if (!IN_TAURI) {
    m.error = '浏览器演示模式不联网；扩展安装与市场浏览需桌面版';
    m.loaded = true;
    pluginRefreshMounts(k);
    if (typeof renderExtPage === 'function') renderExtPage();
    return m.items;
  }
  const cached = pluginIndexSlot(k);
  if (!refresh && pluginIndexFresh(cached)) {
    m.items = pluginFilterIndex(cached.items, k);
    m.url = cached.url || '';
    m.legacy = !!cached.legacy;
    m.loaded = true; m.error = '';
    pluginRefreshMounts(k);
    return m.items;
  }
  m.loading = true; m.error = '';
  pluginRefreshMounts(k);
  try {
    const cfg = pluginCfg();
    const r = await invoke('plugins_index', { kind: k, source: cfg.indexUrl || null, refresh: !!refresh });
    const raw = (r && Array.isArray(r.items)) ? r.items : [];
    m.items = pluginFilterIndex(raw, k);
    m.url = (r && r.url) || '';
    m.legacy = !!(r && r.legacy);
    m.loaded = true;
    pluginIndexSave(k, { at: Date.now(), items: raw, url: m.url, legacy: m.legacy });
    if (refresh) toast(PLUGIN_MARKET_LABEL[k] + '索引已刷新：' + m.items.length + ' 项');
  } catch (e) {
    m.error = String(e && e.message || e);
    if (cached) {
      m.items = pluginFilterIndex(cached.items, k);
      m.url = cached.url || '';
      m.legacy = !!cached.legacy;
      m.loaded = true;
    }
    toast('索引加载失败：' + m.error + (cached ? '（显示上次缓存）' : ''), 6000);
  } finally {
    m.loading = false;
    pluginRefreshMounts(k);
    if (_route.name === 'plugins') renderExtPage();
  }
  return m.items;
}
async function pluginFetchAll(refresh) {
  await Promise.all(['tool', 'widget'].map(k => pluginFetchIndex(k, refresh)));
}

/* ---------------- 安装 / 管理动作 ---------------- */
async function pluginDoInstall(entry, kind, opts) {
  opts = opts || {};
  if (!IN_TAURI) { toast('扩展安装仅在桌面版可用'); return; }
  const k = pluginNormalizeKind(kind) || 'tool';
  const label = PLUGIN_MARKET_LABEL[k] || '扩展';
  const cfg = pluginCfg();
  confirmModal('安装' + label,
    '即将从 ' + entry.repo + ' 安装「' + entry.name + '」。\n\n扩展与内置工具拥有相同权限（可读写本地台账、打开文件），请确认来源可信。安装不会自动更新，可随时禁用或卸载。',
    async () => {
      try {
        const r = await invoke('plugins_resolve', {
          repo: entry.repo, minAppVersion: entry.minAppVersion || null, token: cfg.token || null,
        });
        if (!r.compatible) { toast('当前 LabKit 版本低于扩展要求（' + entry.minAppVersion + '）'); return; }
        const mkind = (r.manifest && r.manifest.kind) || '';
        if (pluginKindConflict(k, mkind)) {
          toast('这个包的类型是「' + mkind + '」，不能装到' + label + '市场', 6500);
          return;
        }
        const inst = await invoke('plugins_install', {
          id: entry.id, repo: entry.repo, version: r.version, kind: k,
          minAppVersion: entry.minAppVersion || null, token: cfg.token || null,
        });
        const resolved = pluginResolveKind(k, entry.kind, mkind);
        pluginSaveRecord(entry.id, {
          id: entry.id, version: r.version, enabled: true, repo: entry.repo,
          kind: resolved.kind, kindSource: resolved.source,
          legacy: resolved.legacy || !!(inst && inst.legacy),
          installedAt: nowStamp(), manifest: r.manifest, previousVersion: null, error: null,
        });
        await pluginInject({ id: entry.id, version: r.version, kind: resolved.kind, manifest: r.manifest });
        pluginRefreshShell();
        toast('已安装' + label + '「' + entry.name + '」v' + r.version);
        if (typeof opts.onInstalled === 'function') opts.onInstalled(entry.id);
      } catch (e) { toast('安装失败：' + e, 7000); }
      pluginRefreshAll();
    }, '确认安装');
}
async function pluginToggle(id) {
  const rec = pluginRecords()[id]; if (!rec) return;
  rec.enabled = !rec.enabled;
  pluginSaveRecord(id, rec);
  if (rec.enabled) {
    try { await pluginInject(rec); toast('已启用扩展（本次会话生效）'); }
    catch (e) { toast('启用失败：' + e, 6000); }
  } else {
    pluginRemoveFromRegistries(id);
    toast('已禁用扩展（重启后彻底移除）');
  }
  pluginRefreshShell(); pluginRefreshAll();
}
async function pluginUpdate(id) {
  const rec = pluginRecords()[id]; if (!rec) return;
  const cfg = pluginCfg();
  const k = pluginRecKind(rec);
  try {
    const r = await invoke('plugins_resolve', {
      repo: rec.repo, minAppVersion: rec.manifest && rec.manifest.minAppVersion, token: cfg.token || null,
    });
    if (r.version === rec.version) { toast('已是最新版本 ' + r.version); return; }
    /* kind 必须是显式键：both 包升级时传 null，让 Rust 走宽松分支。
       别写成内联三元 —— ipc_args 契约测试按 `key:` 扫参数，会误判。 */
    const kindArg = (k === 'both') ? null : k;
    await invoke('plugins_install', {
      id: id, repo: rec.repo, version: r.version, kind: kindArg,
      minAppVersion: rec.manifest && rec.manifest.minAppVersion, token: cfg.token || null,
    });
    const next = Object.assign({}, rec, {
      version: r.version, manifest: r.manifest, previousVersion: rec.version, error: null,
    });
    pluginSaveRecord(id, next);
    if (next.enabled) { pluginRemoveFromRegistries(id); await pluginInject(next); }
    pluginRefreshShell(); toast('已更新到 v' + r.version + '，旧版本保留可回退');
  } catch (e) { toast('更新失败（旧版本保留）：' + e, 7000); }
  pluginRefreshAll();
}
async function pluginRollback(id) {
  const rec = pluginRecords()[id]; if (!rec || !rec.previousVersion) return;
  try {
    const ok = await invoke('plugins_rollback_available', { id: id, version: rec.previousVersion });
    if (!ok) { toast('旧版本目录已不存在'); return; }
    const next = Object.assign({}, rec, { version: rec.previousVersion, previousVersion: rec.version, error: null });
    pluginSaveRecord(id, next);
    if (next.enabled) { pluginRemoveFromRegistries(id); await pluginInject(next); }
    pluginRefreshShell(); toast('已回退到 v' + next.version);
  } catch (e) { toast('回退失败：' + e, 6000); }
  pluginRefreshAll();
}
function pluginUninstall(id) {
  const rec = pluginRecords()[id]; if (!rec) return;
  const label = PLUGIN_MARKET_LABEL[pluginRecKind(rec)] || '扩展';
  confirmModal('卸载' + label,
    '确定卸载「' + id + '」？扩展文件与启用记录都会删除，可随时从市场重装。',
    async () => {
      try {
        if (IN_TAURI) await invoke('plugins_uninstall', { id: id });
        pluginDelRecord(id); pluginRemoveFromRegistries(id);
        pluginRefreshShell(); toast('已卸载 ' + id);
      } catch (e) { toast('卸载失败：' + e, 6000); }
      pluginRefreshAll();
    }, '卸载');
}
/** 本地开发载入：必须指定类型（目录里没写 kind 时靠这个推断）。 */
async function pluginLocalLoad(kind) {
  if (!IN_TAURI) { toast('浏览器模式不支持载入本地扩展'); return; }
  const k = pluginNormalizeKind(kind) || 'tool';
  try {
    const dir = await invoke('plugin:dialog|open', {
      options: { title: '选择扩展目录（含 manifest.json / main.js）', directory: true, multiple: false },
    });
    if (!dir) return;
    const inst = await invoke('plugins_install_local', { dir: String(dir), kind: k });
    const declared = inst && inst.manifest && inst.manifest.kind;
    const resolved = pluginResolveKind(k, '', declared);
    pluginSaveRecord(inst.id, {
      id: inst.id, version: inst.version, enabled: true, repo: '（本地目录）',
      kind: resolved.kind, kindSource: resolved.source,
      legacy: resolved.legacy || !!(inst && inst.legacy),
      installedAt: nowStamp(), manifest: inst.manifest,
      previousVersion: null, error: null, localPath: String(dir),
    });
    await pluginInject({ id: inst.id, version: inst.version, kind: resolved.kind, manifest: inst.manifest });
    pluginRefreshShell(); toast('已载入本地' + PLUGIN_MARKET_LABEL[k] + ' ' + inst.id + ' v' + inst.version);
  } catch (e) { toast('载入失败：' + e, 7000); }
  pluginRefreshAll();
}
function pluginSourceModal() {
  const cfg = pluginCfg();
  formModal('扩展索引源与 GitHub 令牌', [
    { k: 'indexUrl', label: '索引目录 / URL（留空用官方目录）', value: cfg.indexUrl || '', ph: 'https://raw.githubusercontent.com/…/main/' },
    { k: 'token', label: 'GitHub PAT（可选，仅用于提额；不上传）', value: cfg.token || '' },
  ], v => {
    pluginSetCfg({ indexUrl: (v.indexUrl || '').trim(), token: (v.token || '').trim() });
    PluginMarkets.tool.items = []; PluginMarkets.widget.items = [];
    PluginMarkets.tool.loaded = false; PluginMarkets.widget.loaded = false;
    pluginFetchAll(true);
    toast('索引源已保存');
  }, '保存');
}
function pluginRefreshAll() {
  if (typeof renderExtPage === 'function') renderExtPage();
  renderPluginSettings();
  pluginRefreshMounts();
}

/* ---------------- 渲染：市场面板（工具库 / Dashboard 共用） ---------------- */
function pluginMarketPanelHTML(kind) {
  const label = PLUGIN_MARKET_LABEL[kind] || '扩展';
  const m = PluginMarkets[kind];
  return `<div class="pm-panel" data-pmk="${kind}">
    <div class="pm-bar">
      <label class="pm-search">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2" stroke="currentColor" stroke-width="1.9"/><path d="M15.4 15.4L20 20" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
        <input type="search" class="pm-input" placeholder="搜索${label}（名称 / 作者 / 描述）…" value="${esc(m.query || '')}" autocomplete="off" spellcheck="false" aria-label="搜索${label}">
      </label>
      <button class="btn sec" type="button" data-pa="refresh">刷新索引</button>
      <button class="btn sec" type="button" data-pa="local">载入本地目录</button>
    </div>
    <div class="pm-note"></div>
    <div class="plugin-grid pm-list"></div>
  </div>`;
}
function pluginMarketCard(e, kind) {
  const rec = pluginRecords()[e.id];
  const legacy = !!(e._legacy || (rec && pluginRecKind(rec) === 'both'));
  const tags = [PLUGIN_MARKET_LABEL[kind] || '扩展'];
  if (legacy) tags.push('双包遗留');
  if (e.author) tags.push(e.author);
  if (e.minAppVersion) tags.push('≥ ' + e.minAppVersion);
  const acts = rec
    ? `<span class="pc-state${rec.enabled ? ' on' : ''}">${rec.enabled ? '已安装' : '已禁用'} v${esc(rec.version || '')}</span>`
    : `<button class="btn pri" type="button" data-pa="install" data-pid="${esc(e.id)}" data-pkind="${esc(kind)}">安装</button>`;
  return `<div class="plugin-card${rec && !rec.enabled ? ' disabled' : ''}">
    <div class="pc-head"><span class="pc-ico">${toolIcon(e.id)}</span><div style="min-width:0"><div class="pc-name">${esc(e.name)}</div>
    <div class="pc-meta">${esc(e.id)}</div></div></div>
    <div class="pc-desc">${esc(e.description || '（无描述）')}</div>
    <div class="pc-tags">${tags.map(t => '<span class="pc-tag">' + esc(t) + '</span>').join('')}</div>
    <div class="pc-acts">${acts}</div></div>`;
}
function pluginPaintMarket(host, kind) {
  const m = PluginMarkets[kind];
  const note = host.querySelector('.pm-note');
  const list = host.querySelector('.pm-list');
  if (!note || !list) return;
  if (m.loading) {
    note.innerHTML = '<span class="pm-src">正在读取索引…</span>';
    list.innerHTML = '';
    return;
  }
  if (m.error) {
    note.innerHTML = '<span class="pm-err">' + esc(m.error) + '</span>';
  } else if (m.legacy) {
    note.innerHTML = '<span class="pm-legacy">索引来自存量合并文件（plugins.json），已按扩展类型过滤。作者应迁移到 tools.json / widgets.json。</span>';
  } else if (m.url) {
    note.innerHTML = '<span class="pm-src">索引：' + esc(m.url) + '</span>';
  } else {
    note.innerHTML = '<span class="pm-src">' + esc(PLUGIN_MARKET_HINT[kind] || '') + '</span>';
  }
  const q = (m.query || '').trim().toLowerCase();
  const items = m.items.filter(e => !q
    || [e.id, e.name, e.author, e.description, e.repo].join(' ').toLowerCase().includes(q));
  list.innerHTML = items.length
    ? items.map(e => pluginMarketCard(e, kind)).join('')
    : '<div class="plugin-empty">' + (q ? '没有匹配的扩展' : (m.loaded ? '索引为空 · 点「刷新索引」重试' : '尚未加载索引')) + '</div>';
}
function pluginBindMarket(host, kind) {
  const input = host.querySelector('.pm-input');
  if (input) {
    let t = 0;
    input.oninput = () => {
      PluginMarkets[kind].query = input.value;
      clearTimeout(t);
      t = setTimeout(() => pluginPaintMarket(host, kind), 90);
    };
    input.onkeydown = e => {
      if (e.key === 'Escape' && input.value) {
        e.preventDefault(); input.value = ''; PluginMarkets[kind].query = ''; pluginPaintMarket(host, kind);
      }
    };
  }
  host.addEventListener('click', e => {
    const b = e.target.closest('[data-pa]'); if (!b) return;
    const act = b.dataset.pa;
    if (act === 'refresh') { pluginFetchIndex(kind, true); return; }
    if (act === 'local') { pluginLocalLoad(kind); return; }
    if (act === 'install') {
      const entry = PluginMarkets[kind].items.find(x => x.id === b.dataset.pid);
      if (entry) pluginDoInstall(entry, kind, PLUGIN_MOUNTS.get(host) && PLUGIN_MOUNTS.get(host).opts);
    }
  });
}
/** 把市场面板挂到任意容器：工具库 tab 与「+ 添加卡片」共用。 */
function pluginMountMarket(host, kind, opts) {
  if (!host) return;
  const k = pluginNormalizeKind(kind);
  if (k !== 'tool' && k !== 'widget') return;
  host.innerHTML = pluginMarketPanelHTML(k);
  PLUGIN_MOUNTS.set(host, { kind: k, opts: opts || {} });
  pluginBindMarket(host, k);
  pluginPaintMarket(host, k);
  pluginFetchIndex(k, false);
}
function pluginRefreshMounts(kind) {
  const k = pluginNormalizeKind(kind);
  PLUGIN_MOUNTS.forEach((v, host) => {
    if (!host || !host.isConnected) { PLUGIN_MOUNTS.delete(host); return; }
    if (k && v.kind !== k) return;
    pluginPaintMarket(host, v.kind);
  });
}

/* ---------------- 渲染：扩展管理页 ---------------- */
function pluginInstalledCard(rec) {
  const mf = rec.manifest || {};
  const kind = pluginRecKind(rec);
  const health = pluginHealth(rec);
  const reg = rec.reg || null;
  const tags = [PLUGIN_MARKET_LABEL[kind] || '双包遗留', 'v' + (rec.version || '?')];
  if (rec.legacy || kind === 'both') tags.push('旧式合并包');
  if (rec.localPath) tags.push('本地目录');
  if (rec.kindSource === 'market' || rec.kindSource === 'index') tags.push('类型随市场推断');
  const acts = '<button class="btn sec" type="button" data-pa="toggle" data-pid="' + esc(rec.id) + '">' + (rec.enabled ? '禁用' : '启用') + '</button>'
    + '<button class="btn sec" type="button" data-pa="update" data-pid="' + esc(rec.id) + '">检查更新</button>'
    + (rec.previousVersion ? '<button class="btn sec" type="button" data-pa="rollback" data-pid="' + esc(rec.id) + '">回退 ' + esc(rec.previousVersion) + '</button>' : '')
    + '<button class="btn danger" type="button" data-pa="uninstall" data-pid="' + esc(rec.id) + '">卸载</button>';
  const regLine = reg
    ? '<span class="pc-reg">已注册：工具 ' + (+reg.tool || 0) + ' · 卡片 ' + (+reg.widget || 0) + '</span>'
    : '';
  const healthHTML = health.length
    ? '<div class="pc-health">' + health.map(h => '<span class="pc-h ' + h.level + '">' + esc(h.text) + '</span>').join('') + '</div>'
    : '';
  return `<div class="plugin-card${rec.enabled ? '' : ' disabled'}">
    <div class="pc-head"><span class="pc-ico">${kind === 'widget' ? toolIcon('') : toolIcon('')}</span><div style="min-width:0"><div class="pc-name">${esc(mf.name || rec.id)}</div>
    <div class="pc-meta">${esc(rec.id)}${rec.repo ? ' · ' + esc(rec.repo) : ''}</div></div></div>
    <div class="pc-desc">${esc(mf.description || '（无描述）')}</div>
    <div class="pc-tags">${tags.map(t => '<span class="pc-tag">' + esc(t) + '</span>').join('')}</div>
    ${healthHTML}
    <div class="pc-foot">${regLine}<span class="pc-when">${esc(rec.installedAt || '')}</span></div>
    <div class="pc-acts">${acts}</div></div>`;
}
function renderExtPage() {
  const recs = pluginRecords();
  const buckets = { tool: [], widget: [], both: [] };
  Object.values(recs).forEach(r => {
    if (!r || !r.id) return;
    const k = pluginRecKind(r);
    (buckets[k === 'tool' ? 'tool' : k === 'widget' ? 'widget' : 'both']).push(r);
  });
  const paint = (hostId, countId, list, empty) => {
    const host = document.getElementById(hostId); if (!host) return;
    host.innerHTML = list.length ? list.map(pluginInstalledCard).join('') : '<div class="plugin-empty">' + esc(empty) + '</div>';
    const n = document.getElementById(countId); if (n) n.textContent = String(list.length);
  };
  paint('extToolList', 'extToolCount', buckets.tool, '还没有工具扩展。到「工具库 → 获取更多工具」安装，或用下方「载入本地目录」。');
  paint('extWidgetList', 'extWidgetCount', buckets.widget, '还没有卡片扩展。到「首页 → + 添加卡片 → 获取卡片」安装。');
  paint('extLegacyList', 'extLegacyCount', buckets.both, '没有双包遗留。');
  const leg = document.getElementById('extLegacySec');
  if (leg) leg.hidden = buckets.both.length === 0;
  const cfg = pluginCfg();
  const iu = document.getElementById('extIndexUrl');
  if (iu && document.activeElement !== iu) iu.value = cfg.indexUrl || '';
  const tk = document.getElementById('extToken');
  if (tk && document.activeElement !== tk) tk.value = cfg.token || '';
  renderPluginStatus();
}
function renderPluginStatus() {
  const el = document.getElementById('pluginMarketStatus'); if (!el) return;
  const cfg = pluginCfg();
  const recs = Object.values(pluginRecords()).filter(r => r && r.id);
  const n = { tool: 0, widget: 0, both: 0 };
  recs.forEach(r => { const k = pluginRecKind(r); n[k === 'tool' ? 'tool' : k === 'widget' ? 'widget' : 'both'] += 1; });
  const dot = !IN_TAURI ? 'var(--muted)' : (cfg.enabled ? 'var(--green)' : 'var(--orange)');
  el.innerHTML = '<span class="ps-dot" style="background:' + dot + '"></span>'
    + '<b>社区扩展' + (!IN_TAURI ? '（浏览器演示）' : cfg.enabled ? '已开启' : '未开启') + '</b>'
    + '<span class="sub">工具 ' + n.tool + ' · 卡片 ' + n.widget + (n.both ? ' · 双包 ' + n.both : '')
    + (IN_TAURI ? ' · 索引缓存 30 分钟 · 不自动更新' : ' · 安装与市场操作需桌面版') + '</span>'
    + '<span style="flex:1"></span>'
    + (IN_TAURI ? '<button class="btn sec" type="button" id="psToggle">' + (cfg.enabled ? '关闭社区扩展' : '开启社区扩展') + '</button>' : '');
  const b = el.querySelector('#psToggle');
  if (b) b.onclick = () => {
    pluginSetCfg({ enabled: !cfg.enabled });
    toast(cfg.enabled ? '已关闭社区扩展（重启后不再加载）' : '已开启社区扩展，可在设置页随时关闭');
    renderPluginStatus(); renderPluginSettings();
  };
}
function renderPluginSettings() {
  const en = document.getElementById('setCommunityPlugins'); if (!en) return;
  const cfg = pluginCfg(); en.checked = !!cfg.enabled;
  const st = document.getElementById('pluginStatus');
  if (st) {
    const list = Object.values(pluginRecords()).filter(r => r && r.id);
    const t = list.filter(r => pluginRecKind(r) === 'tool').length;
    const w = list.filter(r => pluginRecKind(r) === 'widget').length;
    st.textContent = !IN_TAURI ? '浏览器模式不可用'
      : (cfg.enabled ? '已开启 · 工具 ' + t + ' / 卡片 ' + w : '未开启（默认）');
    st.className = 'db-pill ' + (cfg.enabled ? '' : 'browser');
  }
}

/* ---------------- 事件绑定 ---------------- */
(function bindPluginUI() {
  /* 扩展管理页：单一委托，覆盖启用/更新/回退/卸载/本地载入/索引源 */
  const view = document.getElementById('view-plugins');
  if (view) {
    view.addEventListener('click', e => {
      const b = e.target.closest('[data-pa]');
      if (b && !b.closest('.pm-panel')) {
        const id = b.dataset.pid, act = b.dataset.pa;
        if (act === 'toggle') pluginToggle(id);
        else if (act === 'update') pluginUpdate(id);
        else if (act === 'rollback') pluginRollback(id);
        else if (act === 'uninstall') pluginUninstall(id);
        else if (act === 'local') {
          const sel = document.getElementById('extDevKind');
          pluginLocalLoad(sel ? sel.value : 'tool');
        } else if (act === 'save-source') {
          const iu = document.getElementById('extIndexUrl');
          const tk = document.getElementById('extToken');
          pluginSetCfg({ indexUrl: ((iu && iu.value) || '').trim(), token: ((tk && tk.value) || '').trim() });
          PluginMarkets.tool.items = []; PluginMarkets.widget.items = [];
          PluginMarkets.tool.loaded = false; PluginMarkets.widget.loaded = false;
          pluginFetchAll(true);
          toast('索引源已保存');
        }
        return;
      }
      /* 兼容旧按钮 id：本地载入 / 索引源 */
      const local = e.target.closest('#btnPluginLocal');
      if (local) {
        const sel = document.getElementById('extDevKind');
        pluginLocalLoad(sel ? sel.value : 'tool');
      }
    });
  }
  const src = document.getElementById('btnPluginSource');
  if (src) src.onclick = pluginSourceModal;
  const en = document.getElementById('setCommunityPlugins');
  if (en) en.onchange = () => {
    pluginSetCfg({ enabled: en.checked });
    toast(en.checked ? '已开启社区扩展（请确认来源可信）' : '已关闭社区扩展（重启后不再加载）');
    renderPluginSettings(); renderPluginStatus();
  };
})();

// LabKit · plugins.js — P4 GitHub 插件市场（Obsidian 式索引 + Release 分发）。
// 前端只做 UI 与注册 API；所有 HTTP / 落盘 / 哈希校验走 Rust IPC（单一信任边界）。
// 插件 main.js 经 labkit-plugin 自定义协议注入，失败回退 IPC 读文本 + eval。
// 安全模型：插件与内置同权限（无硬沙箱），默认关闭、显式安装、不自动更新。

const PluginState = { index: [], tab: 'market', query: '', loading: false };

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

/* ---------------- 公开注册 API（插件 main.js 调用） ---------------- */
window.LabKit = window.LabKit || {};
LabKit.registerTool = function (meta, fn) {
  const pid = window.__LK_CURRENT_PLUGIN;
  if (!pid) { console.warn('LabKit.registerTool 只能在插件脚本内调用'); return null; }
  const id = pluginFullId(pid, meta && meta.id);
  if (!id) { console.warn('插件工具 id 非法：', meta && meta.id); return null; }
  if ((window.TOOL_META || []).some(t => t.id === id)) return id;  // 撞名去重
  const impl = typeof fn === 'function' ? fn : (meta && meta.fn);
  if (typeof impl !== 'function') { console.warn('插件工具缺少渲染函数：' + id); return null; }
  window.LabKitTools[id] = impl;
  window.TOOL_META.push(Object.assign({}, meta, {
    id, plugin: pid, scripts: [], group: (meta && meta.group) || '社区插件',
    py: ((meta && meta.py) || '') + ' ' + id,
  }));
  return id;
};
LabKit.registerWidget = function (def) {
  const pid = window.__LK_CURRENT_PLUGIN;
  if (!pid) { console.warn('LabKit.registerWidget 只能在插件脚本内调用'); return null; }
  const id = pluginFullId(pid, def && def.id);
  if (!id) { console.warn('插件卡片 id 非法：', def && def.id); return null; }
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
  if (!mainUrl) throw new Error('插件 id / 版本非法，拒绝加载');
  window.__LK_CURRENT_PLUGIN = rec.id;
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
    return true;
  } finally {
    window.__LK_CURRENT_PLUGIN = null;
  }
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
  if (typeof shellRenderCats === 'function') shellRenderCats();
  if (typeof renderToolHub === 'function') renderToolHub();
  if (typeof shellRenderPins === 'function') shellRenderPins();
  if (typeof buildDash === 'function') buildDash();
}
/* 启动：仅注入已启用插件；单个失败隔离并标记，不拖垮主程序。 */
async function pluginBoot() {
  if (!IN_TAURI || !pluginCfg().enabled) return;
  const recs = pluginRecords();
  for (const [id, rec] of Object.entries(recs)) {
    if (!rec || !rec.enabled) continue;
    try {
      await pluginInject(rec);
    } catch (e) {
      console.warn('插件加载失败：' + id, e);
      rec.error = String(e && e.message || e);
      pluginSaveRecord(id, rec);
      toast('插件「' + id + '」加载失败：' + rec.error, 6000);
    }
  }
}

/* ---------------- 市场数据 ---------------- */
async function pluginFetchIndex(refresh) {
  if (!IN_TAURI) { toast('插件市场浏览与安装需桌面版；浏览器模式可查看本地开发说明', 4200); return; }
  const cached = DB._store && DB._store.pluginIndex;
  if (!refresh && cached && cached.at && Date.now() - cached.at < 30 * 60 * 1000) {
    PluginState.index = pluginValidateIndex(cached.items || []);
    renderPluginMarket(); return;
  }
  PluginState.loading = true; renderPluginMarket();
  try {
    const cfg = pluginCfg();
    const raw = await invoke('plugins_index', { source: cfg.indexUrl || null, refresh: !!refresh });
    PluginState.index = pluginValidateIndex(raw);
    DB._store.pluginIndex = { at: Date.now(), items: PluginState.index };
    saveDB();
    if (refresh) toast('索引已刷新：' + PluginState.index.length + ' 个插件');
  } catch (e) {
    toast('插件索引加载失败：' + e + (cached ? '（显示上次缓存）' : ''), 6000);
    if (cached) PluginState.index = pluginValidateIndex(cached.items || []);
  } finally {
    PluginState.loading = false; renderPluginMarket();
  }
}

/* ---------------- 安装 / 管理动作 ---------------- */
async function pluginDoInstall(entry) {
  if (!IN_TAURI) { toast('插件安装仅在桌面版可用'); return; }
  const cfg = pluginCfg();
  confirmModal('安装社区插件',
    '即将从 ' + entry.repo + ' 安装「' + entry.name + '」。\n\n插件与内置工具拥有相同权限（可读写本地台账、打开文件），请确认来源可信。安装不会自动更新，可随时禁用或卸载。',
    async () => {
      try {
        const r = await invoke('plugins_resolve', {
          repo: entry.repo, minAppVersion: entry.minAppVersion || null, token: cfg.token || null,
        });
        if (!r.compatible) { toast('当前 LabKit 版本低于插件要求（' + entry.minAppVersion + '）'); return; }
        const inst = await invoke('plugins_install', {
          id: entry.id, repo: entry.repo, version: r.version,
          minAppVersion: entry.minAppVersion || null, token: cfg.token || null,
        });
        pluginSaveRecord(entry.id, {
          id: entry.id, version: r.version, enabled: true, repo: entry.repo,
          kind: entry.kind || 'tool', installedAt: nowStamp(), manifest: r.manifest,
          previousVersion: null, error: null,
        });
        await pluginInject({ id: entry.id, version: r.version, manifest: r.manifest });
        pluginRefreshShell();
        toast('已安装并启用「' + entry.name + '」v' + r.version);
      } catch (e) { toast('安装失败：' + e, 7000); }
      renderPluginMarket(); renderPluginSettings();
    }, '确认安装');
}
async function pluginToggle(id) {
  const rec = pluginRecords()[id]; if (!rec) return;
  rec.enabled = !rec.enabled;
  pluginSaveRecord(id, rec);
  if (rec.enabled) {
    try { await pluginInject(rec); toast('已启用插件（本次会话生效）'); }
    catch (e) { toast('启用失败：' + e, 6000); }
  } else {
    pluginRemoveFromRegistries(id);
    toast('已禁用插件（重启后彻底移除）');
  }
  pluginRefreshShell(); renderPluginMarket(); renderPluginSettings();
}
async function pluginUpdate(id) {
  const rec = pluginRecords()[id]; if (!rec) return;
  const cfg = pluginCfg();
  try {
    const r = await invoke('plugins_resolve', {
      repo: rec.repo, minAppVersion: rec.manifest && rec.manifest.minAppVersion, token: cfg.token || null,
    });
    if (r.version === rec.version) { toast('已是最新版本 ' + r.version); return; }
    await invoke('plugins_install', {
      id: id, repo: rec.repo, version: r.version,
      minAppVersion: rec.manifest && rec.manifest.minAppVersion, token: cfg.token || null,
    });
    const next = Object.assign({}, rec, {
      version: r.version, manifest: r.manifest, previousVersion: rec.version, error: null,
    });
    pluginSaveRecord(id, next);
    if (next.enabled) { pluginRemoveFromRegistries(id); await pluginInject(next); }
    pluginRefreshShell(); toast('已更新到 v' + r.version + '，旧版本保留可回退');
  } catch (e) { toast('更新失败（旧版本保留）：' + e, 7000); }
  renderPluginMarket();
}
async function pluginRollback(id) {
  const rec = pluginRecords()[id]; if (!rec || !rec.previousVersion) return;
  try {
    const ok = await invoke('plugins_rollback_available', { id, version: rec.previousVersion });
    if (!ok) { toast('旧版本目录已不存在'); return; }
    const next = Object.assign({}, rec, { version: rec.previousVersion, previousVersion: rec.version, error: null });
    pluginSaveRecord(id, next);
    if (next.enabled) { pluginRemoveFromRegistries(id); await pluginInject(next); }
    pluginRefreshShell(); toast('已回退到 v' + next.version);
  } catch (e) { toast('回退失败：' + e, 6000); }
  renderPluginMarket();
}
function pluginUninstall(id) {
  const rec = pluginRecords()[id]; if (!rec) return;
  confirmModal('卸载插件', '确定卸载「' + id + '」？插件文件与启用记录都会删除，可随时从市场重装。', async () => {
    try {
      if (IN_TAURI) await invoke('plugins_uninstall', { id });
      pluginDelRecord(id); pluginRemoveFromRegistries(id);
      pluginRefreshShell(); toast('已卸载 ' + id);
    } catch (e) { toast('卸载失败：' + e, 6000); }
    renderPluginMarket(); renderPluginSettings();
  }, '卸载');
}
async function pluginLocalLoad() {
  if (!IN_TAURI) { toast('浏览器模式不支持载入本地插件文件'); return; }
  try {
    const dir = await invoke('plugin:dialog|open', {
      options: { title: '选择插件目录（含 manifest.json / main.js）', directory: true, multiple: false },
    });
    if (!dir) return;
    const inst = await invoke('plugins_install_local', { dir: String(dir) });
    pluginSaveRecord(inst.id, {
      id: inst.id, version: inst.version, enabled: true, repo: '（本地目录）',
      kind: inst.manifest.kind || 'tool', installedAt: nowStamp(), manifest: inst.manifest,
      previousVersion: null, error: null, localPath: String(dir),
    });
    await pluginInject(inst);
    pluginRefreshShell(); toast('已载入本地插件 ' + inst.id + ' v' + inst.version);
  } catch (e) { toast('载入失败：' + e, 7000); }
  renderPluginMarket(); renderPluginSettings();
}
function pluginSourceModal() {
  const cfg = pluginCfg();
  formModal('插件索引源与 GitHub 令牌', [
    { k: 'indexUrl', label: '索引 URL（留空用官方索引）', value: cfg.indexUrl || '' },
    { k: 'token', label: 'GitHub PAT（可选，仅用于提額；不上传）', value: cfg.token || '' },
  ], v => {
    pluginSetCfg({ indexUrl: (v.indexUrl || '').trim(), token: (v.token || '').trim() });
    PluginState.index = [];
    pluginFetchIndex(true);
    toast('索引源已保存');
  }, '保存');
}

/* ---------------- 视图渲染 ---------------- */
function renderPluginStatus() {
  const el = document.getElementById('pluginMarketStatus'); if (!el) return;
  const cfg = pluginCfg();
  const count = Object.keys(pluginRecords()).length;
  const dot = !IN_TAURI ? 'var(--muted)' : (cfg.enabled ? 'var(--green)' : 'var(--orange)');
  el.innerHTML = '<span class="ps-dot" style="background:' + dot + '"></span>'
    + '<b>社区插件' + (!IN_TAURI ? '（浏览器演示）' : cfg.enabled ? '已开启' : '未开启') + '</b>'
    + '<span class="sub">' + (IN_TAURI ? '已安装 ' + count + ' 个 · 索引缓存 30 分钟 · 不自动更新' : '安装与市场操作需桌面版') + '</span>'
    + '<span style="flex:1"></span>'
    + (IN_TAURI ? '<button class="btn sec" id="psToggle">' + (cfg.enabled ? '关闭社区插件' : '开启社区插件') + '</button>' : '');
  const b = el.querySelector('#psToggle');
  if (b) b.onclick = () => {
    pluginSetCfg({ enabled: !cfg.enabled });
    toast(cfg.enabled ? '已关闭社区插件（重启后不再加载）' : '已开启社区插件，可在设置页随时关闭');
    renderPluginStatus(); renderPluginSettings();
  };
}
function pluginCard(entry, installed) {
  const kind = entry.kind || 'tool';
  const tags = [kind === 'widget' ? '仪表盘卡片' : kind === 'both' ? '工具 + 卡片' : '工具',
    entry.author || '社区', entry.minAppVersion ? '≥ ' + entry.minAppVersion : ''].filter(Boolean);
  let acts = '';
  if (installed) {
    acts = '<button class="btn sec" data-pa="toggle" data-pid="' + esc(entry.id) + '">' + (installed.enabled ? '禁用' : '启用') + '</button>'
      + '<button class="btn sec" data-pa="update" data-pid="' + esc(entry.id) + '">检查更新</button>'
      + (installed.previousVersion ? '<button class="btn sec" data-pa="rollback" data-pid="' + esc(entry.id) + '">回退 ' + esc(installed.previousVersion) + '</button>' : '')
      + '<button class="btn danger" data-pa="uninstall" data-pid="' + esc(entry.id) + '">卸载</button>';
  } else {
    acts = '<button class="btn pri" data-pa="install" data-pid="' + esc(entry.id) + '">安装</button>';
  }
  return '<div class="plugin-card' + (installed && !installed.enabled ? ' disabled' : '') + '">'
    + '<div class="pc-head"><span class="pc-ico">' + toolIcon('') + '</span><div style="min-width:0"><div class="pc-name">' + esc(entry.name) + '</div>'
    + '<div class="pc-meta">' + esc(entry.id) + (installed ? ' · 已装 v' + esc(installed.version) : '') + '</div></div></div>'
    + '<div class="pc-desc">' + esc(entry.description || '（无描述）') + '</div>'
    + '<div class="pc-tags">' + tags.map(t => '<span class="pc-tag">' + esc(t) + '</span>').join('') + '</div>'
    + '<div class="pc-acts">' + acts + '</div></div>';
}
function renderPluginMarket() {
  const host = document.getElementById('pluginList'); if (!host) return;
  renderPluginStatus();
  document.querySelectorAll('[data-ptab]').forEach(b => b.classList.toggle('active', b.dataset.ptab === PluginState.tab));
  const recs = pluginRecords();
  if (PluginState.tab === 'dev') {
    host.innerHTML = '<div class="plugin-help"><b>本地开发载入</b><br>插件目录需含 manifest.json、main.js（可选 styles.css）。main.js 是 classic script，调用 '
      + 'LabKit.registerTool(meta, fn) / LabKit.registerWidget(def) 注册工具与卡片；工具 id 自动加前缀 x-&lt;插件id&gt;-。'
      + '载入后无需发布到 GitHub 即可调试。<br>完整契约见仓库 docs/PLUGIN_DEV.md；视觉规范见 docs/DESIGN_SYSTEM.md。</div>';
    return;
  }
  if (PluginState.tab === 'installed') {
    const items = Object.values(recs).filter(r => r && r.id).map(r => ({
      id: r.id, name: (r.manifest && r.manifest.name) || r.id, author: (r.manifest && r.manifest.author) || '',
      description: (r.manifest && r.manifest.description) || r.repo || '', kind: r.kind || 'tool',
    }));
    host.innerHTML = items.length ? items.map(e => pluginCard(e, recs[e.id])).join('')
      : '<div class="plugin-empty">还没有安装插件。到「市场」页从索引安装，或在「开发」页载入本地目录。</div>';
    return;
  }
  const q = PluginState.query.trim().toLowerCase();
  const items = PluginState.index.filter(e => !q
    || [e.id, e.name, e.author, e.description, e.repo].join(' ').toLowerCase().includes(q));
  host.innerHTML = PluginState.loading ? '<div class="plugin-empty">正在读取索引…</div>'
    : items.length ? items.map(e => pluginCard(e, recs[e.id])).join('')
      : '<div class="plugin-empty">' + (q ? '没有匹配的插件' : '索引为空或尚未加载 · 点右上「刷新索引」') + '</div>';
}
function renderPluginSettings() {
  const en = document.getElementById('setCommunityPlugins'); if (!en) return;
  const cfg = pluginCfg(); en.checked = !!cfg.enabled;
  const st = document.getElementById('pluginStatus');
  if (st) {
    const n = Object.keys(pluginRecords()).length;
    st.textContent = !IN_TAURI ? '浏览器模式不可用' : (cfg.enabled ? '已开启 · ' + n + ' 个已安装' : '未开启（默认）');
    st.className = 'db-pill ' + (cfg.enabled ? '' : 'browser');
  }
}

/* ---------------- 事件绑定 ---------------- */
(function bindPluginUI() {
  const refresh = document.getElementById('btnPluginRefresh');
  if (refresh) refresh.onclick = () => pluginFetchIndex(true);
  const local = document.getElementById('btnPluginLocal');
  if (local) local.onclick = pluginLocalLoad;
  const search = document.getElementById('pluginSearch');
  if (search) search.oninput = () => { PluginState.query = search.value || ''; renderPluginMarket(); };
  const tabs = document.getElementById('pluginTabs');
  if (tabs) tabs.addEventListener('click', e => {
    const b = e.target.closest('[data-ptab]'); if (!b) return;
    PluginState.tab = b.dataset.ptab; renderPluginMarket();
  });
  const host = document.getElementById('pluginList');
  if (host) host.addEventListener('click', e => {
    const b = e.target.closest('[data-pa]'); if (!b) return;
    const id = b.dataset.pid, act = b.dataset.pa;
    if (act === 'install') {
      const entry = PluginState.index.find(x => x.id === id); if (entry) pluginDoInstall(entry);
    } else if (act === 'toggle') pluginToggle(id);
    else if (act === 'update') pluginUpdate(id);
    else if (act === 'rollback') pluginRollback(id);
    else if (act === 'uninstall') pluginUninstall(id);
  });
  const en = document.getElementById('setCommunityPlugins');
  if (en) en.onchange = () => {
    pluginSetCfg({ enabled: en.checked });
    toast(en.checked ? '已开启社区插件（请确认来源可信）' : '已关闭社区插件（重启后不再加载）');
    renderPluginSettings(); renderPluginStatus();
  };
  const src = document.getElementById('btnPluginSource');
  if (src) src.onclick = pluginSourceModal;
})();

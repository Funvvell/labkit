// LabKit · plugin-contract.js — P4 插件契约的纯函数（无 DOM / 无 IPC，node 可测）。
// 与 rust/src/plugins.rs 的白名单语义保持一致：id/版本/资产名只接受安全字符；
// 前缀隔离 x-<pluginId>-<toolId>，撞名拒绝。
//
// P5（市场拆分）：扩展分两类 market —— 'tool'（工具扩展，只注册工具）与
// 'widget'（卡片扩展，只注册 Dashboard 卡片）。一个包只能属于一类，'both' 仅为存量兼容。
// 参考 HACS 的 HacsCategory 与 Directus 的 extension type：类型是硬约束，安装期即校验。

const PLUGIN_APP_VERSION = '0.4.0';
const PLUGIN_ASSETS = ['manifest.json', 'main.js', 'styles.css'];

/* 扩展类型：tool=工具扩展 / widget=卡片扩展 / both=存量合并包（新包禁止） */
const PLUGIN_KINDS = ['tool', 'widget'];
const PLUGIN_KIND_ANY = 'both';

function pluginValidId(id) {
  return typeof id === 'string' && id.length > 0 && id.length <= 64
    && /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id) && !id.includes('..');
}
function pluginValidVersion(v) {
  return typeof v === 'string' && v.length > 0 && v.length <= 64
    && /^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(v);
}
function pluginValidAsset(name) { return PLUGIN_ASSETS.includes(name); }
function pluginFullId(pluginId, id) {
  return pluginValidId(pluginId) && typeof id === 'string' ? 'x-' + pluginId + '-' + id : null;
}
function pluginAssetPath(pluginId, version, file) {
  if (!pluginValidId(pluginId) || !pluginValidVersion(version) || !pluginValidAsset(file)) return null;
  return (IN_TAURI ? 'http://labkit-plugin.localhost/' : '') + pluginId + '/' + version + '/' + file;
}
function pluginVersionAtLeast(have, need) {
  const nums = s => String(s || '').trim().replace(/^[vV]/, '').split(/[^0-9]+/).filter(Boolean).map(Number);
  const a = nums(have), b = nums(need);
  if (!a.length || !b.length) return String(have) >= String(need);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0, y = b[i] || 0;
    if (x !== y) return x > y;
  }
  return true;
}
/** manifest 校验：返回 {ok, manifest, error}；expectedId 用于与索引条目比对。 */
function pluginValidateManifest(raw, expectedId) {
  let m;
  try { m = typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch (e) { return { ok: false, error: 'manifest.json 不是合法 JSON' }; }
  if (!m || typeof m !== 'object' || Array.isArray(m)) return { ok: false, error: 'manifest 必须是对象' };
  if (!pluginValidId(m.id)) return { ok: false, error: 'manifest id 非法：' + m.id };
  if (expectedId && m.id !== expectedId) return { ok: false, error: 'manifest id 与索引不一致' };
  if (typeof m.name !== 'string' || !m.name.trim()) return { ok: false, error: 'manifest 缺少 name' };
  if (m.main && !pluginValidAsset(m.main)) return { ok: false, error: 'main 资产名非法' };
  if (m.styles && !pluginValidAsset(m.styles)) return { ok: false, error: 'styles 资产名非法' };
  if (m.minAppVersion && !pluginVersionAtLeast(PLUGIN_APP_VERSION, m.minAppVersion)) {
    return { ok: false, error: '需要 LabKit >= ' + m.minAppVersion };
  }
  /* kind 归一化：缺省保留 ''（= 未声明，由安装来源推断）；未知值拒绝，避免
     「写错 kind 就静默降级成工具包」这类难查的问题。 */
  const declared = m.kind == null ? '' : String(m.kind).trim();
  const kind = declared === '' ? '' : pluginNormalizeKind(declared);
  if (declared !== '' && !kind) return { ok: false, error: 'manifest kind 非法：' + m.kind + '（只允许 tool / widget）' };
  return { ok: true, manifest: Object.assign({ main: 'main.js', version: 'dev' }, m, { kind }) };
}
/** 索引条目校验：跳过坏条目，不让单个坏数据拖垮整个市场。 */
function pluginValidateIndex(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(e => e && pluginValidId(e.id) && typeof e.name === 'string'
    && typeof e.repo === 'string' && e.repo.split('/').length === 2
    && !e.repo.includes(' ') && !e.repo.includes('..'));
}

/* ===================== 市场拆分：类型语义 =====================
   两个市场各自一份索引（tools.json / widgets.json），包内 kind 是硬约束。
   存量 'both' 包两侧都可见，但会带 _legacy 标记，扩展管理页持续提示迁移。 */

/** 归一化：只认 tool / widget / both，其余返回 ''（调用方决定默认值）。 */
function pluginNormalizeKind(k) {
  const s = String(k == null ? '' : k).trim().toLowerCase();
  return (s === 'tool' || s === 'widget' || s === 'both') ? s : '';
}
/** 索引条目缺省 → 'tool'（与 Rust 侧一致）；未知值原样保留，由 pluginFilterIndex 丢弃。 */
function pluginEntryKind(entry) {
  const raw = entry && entry.kind;
  const k = pluginNormalizeKind(raw);
  if (k) return k;
  return raw == null || raw === '' ? 'tool' : String(raw);
}
/** 已安装记录缺省 → 'both'（宽松）：老记录没有 kind 字段，若默认 tool 会把已注册的
    卡片静默丢弃，用户会以为插件坏了。宁可宽松，也不要静默降级。 */
function pluginRecKind(rec) {
  return pluginNormalizeKind(rec && rec.kind) || PLUGIN_KIND_ANY;
}
/** 注册 API 门禁：both 放行全部；单一类型只放行自己。 */
function pluginKindAccepts(recKind, apiKind) {
  const r = pluginNormalizeKind(recKind) || PLUGIN_KIND_ANY;
  if (r === PLUGIN_KIND_ANY) return true;
  return r === (apiKind === 'widget' ? 'widget' : 'tool');
}
/** 市场与包类型是否互斥：只有「明确单一类型」对「明确单一类型」且不同才算冲突。 */
function pluginKindConflict(market, pkg) {
  const m = pluginNormalizeKind(market), p = pluginNormalizeKind(pkg);
  if (!m || !p || m === PLUGIN_KIND_ANY || p === PLUGIN_KIND_ANY) return false;
  return m !== p;
}
/** 安装来源推断类型（HACS 的 category 来自索引条目，不来自包本身）：
    manifest 声明 > 市场 > 索引条目 > 'tool'。legacy = 包内未声明单一类型。 */
function pluginResolveKind(marketKind, indexKind, manifestKind) {
  const mf = pluginNormalizeKind(manifestKind);
  if (mf === 'tool' || mf === 'widget') return { kind: mf, legacy: false, source: 'manifest' };
  if (mf === 'both') return { kind: 'both', legacy: true, source: 'manifest' };
  const mk = pluginNormalizeKind(marketKind);
  if (mk === 'tool' || mk === 'widget') return { kind: mk, legacy: true, source: 'market' };
  const ik = pluginNormalizeKind(indexKind);
  if (ik === 'tool' || ik === 'widget') return { kind: ik, legacy: true, source: 'index' };
  return { kind: 'tool', legacy: true, source: 'default' };
}
/** 索引按市场过滤：命中本类 + both（both 标 _legacy，UI 显示「双包遗留」）。 */
function pluginFilterIndex(items, kind) {
  const want = pluginNormalizeKind(kind);
  if (!want || want === PLUGIN_KIND_ANY) return [];
  const out = [];
  (Array.isArray(items) ? items : []).forEach(e => {
    if (!e || typeof e !== 'object') return;
    const k = pluginEntryKind(e);
    if (k === want) out.push(Object.assign({}, e, { kind: want }));
    else if (k === PLUGIN_KIND_ANY) out.push(Object.assign({}, e, { kind: want, _legacy: true }));
  });
  return out;
}

/* ===================== 索引缓存分槽 =====================
   v1 是单份 {at,items}（两个市场共用），v2 变 {v:2,tool:{at,items},widget:{...}}。
   旧缓存整体迁到 tool 槽：宁可让卡片市场冷启动一次，也不重复下载同一份索引。 */
const PLUGIN_INDEX_TTL = 30 * 60 * 1000;
function pluginIndexStore(raw) {
  const empty = () => ({ v: 2, tool: null, widget: null });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return empty();
  if (raw.v === 2) return { v: 2, tool: raw.tool || null, widget: raw.widget || null };
  if (Array.isArray(raw.items)) return { v: 2, tool: { at: raw.at || 0, items: raw.items }, widget: null };
  return empty();
}
function pluginIndexFresh(slot, now) {
  if (!slot || !slot.at || !Array.isArray(slot.items)) return false;
  const t = typeof now === 'number' ? now : Date.now();
  const age = t - slot.at;
  return age >= 0 && age < PLUGIN_INDEX_TTL;
}

/* ===================== 运行健康 =====================
   扩展管理页据此显示红/橙字：越界注册、加载失败、遗留双包。
   门槛来自「一类包只能做一件事」——越界不是错误但必须可见。 */
function pluginHealth(rec) {
  const out = [];
  if (!rec || typeof rec !== 'object') return out;
  const kind = pluginNormalizeKind(rec.kind);
  if (rec.error) out.push({ level: 'bad', text: '加载失败：' + String(rec.error) });
  if (!kind) out.push({ level: 'warn', text: '未声明类型（按旧式合并包处理）' });
  else if (kind === PLUGIN_KIND_ANY) out.push({ level: 'warn', text: '旧式合并包：同时提供工具与卡片，建议迁移为单类型包' });
  const reg = rec.reg && typeof rec.reg === 'object' ? rec.reg : null;
  if (reg) {
    const t = +reg.tool || 0, w = +reg.widget || 0;
    if (kind === 'tool' && w > 0) out.push({ level: 'bad', text: '工具包注册了 ' + w + ' 张卡片（已被类型门禁拦截）' });
    if (kind === 'widget' && t > 0) out.push({ level: 'bad', text: '卡片包注册了 ' + t + ' 个工具（已被类型门禁拦截）' });
    if (!t && !w) out.push({ level: 'warn', text: '未注册任何内容（检查 main.js 是否调用 LabKit API）' });
  }
  const blocked = Array.isArray(rec.blocked) ? rec.blocked : [];
  if (blocked.length) out.push({ level: 'warn', text: '本次加载拦截了：' + blocked.join(' / ') });
  return out;
}

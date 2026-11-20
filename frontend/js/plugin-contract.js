// LabKit · plugin-contract.js — P4 插件契约的纯函数（无 DOM / 无 IPC，node 可测）。
// 与 rust/src/plugins.rs 的白名单语义保持一致：id/版本/资产名只接受安全字符；
// 前缀隔离 x-<pluginId>-<toolId>，撞名拒绝。

const PLUGIN_APP_VERSION = '0.3.0';
const PLUGIN_ASSETS = ['manifest.json', 'main.js', 'styles.css'];

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
  return { ok: true, manifest: Object.assign({ main: 'main.js', version: 'dev', kind: 'tool' }, m) };
}
/** 索引条目校验：跳过坏条目，不让单个坏数据拖垮整个市场。 */
function pluginValidateIndex(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(e => e && pluginValidId(e.id) && typeof e.name === 'string'
    && typeof e.repo === 'string' && e.repo.split('/').length === 2
    && !e.repo.includes(' ') && !e.repo.includes('..'));
}

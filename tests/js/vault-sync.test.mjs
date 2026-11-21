// Markdown Vault 的前端契约单测：
//   1) 浏览器演示模式整卡禁用（直开 index.html 不得抛错）
//   2) 冲突裁决行渲染与 vault_resolve 参数
//   3) 远端事件到达时本地有未落盘改动 → 先补写再采纳，不丢编辑
//   4) vault-synced 只做提示，绝不触碰 dbOnRemote 的排队机制
// Rust 侧投影/摄入语义见 rust/tests/vault_project.rs 与 vault_sync.rs。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

function el(id) {
  return {
    id, onclick: null, onchange: null, disabled: false, checked: false, hidden: false,
    className: '', innerHTML: '', textContent: '', value: '', title: '', style: {}, dataset: {},
    classList: { toggle() { }, add() { }, remove() { } },
    setAttribute() { }, removeAttribute() { }, appendChild() { }, addEventListener() { },
    querySelector: () => null, querySelectorAll: () => [], focus() { },
  };
}

/** 每个测试独立 context：classic script 顶层 const 不能在同一 global 里重复声明。 */
function ctx({ inTauri = false, disk = null } = {}) {
  const elements = {};
  const listeners = {};
  const calls = [];
  const sandbox = {
    console, setTimeout, clearTimeout, Promise, Date, Math, JSON, Object, Array, String, Number,
    Set, Map, RegExp, Error, parseInt, parseFloat, isNaN,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = {
    getElementById: id => elements[id] || (elements[id] = el(id)),
    querySelectorAll: () => [], querySelector: () => null,
    addEventListener() { }, createElement: () => el('tmp'),
    documentElement: { dataset: {}, style: { setProperty() { } } },
    body: el('body'), head: el('head'),
  };
  sandbox.location = { hash: '', reload() { } };
  sandbox.history = { replaceState() { }, back() { } };
  sandbox.addEventListener = () => { };
  sandbox.matchMedia = () => ({ matches: false, addEventListener() { } });
  const ls = {};
  sandbox.localStorage = {
    getItem: k => (k in ls ? ls[k] : null),
    setItem: (k, v) => { ls[k] = String(v); },
    removeItem: k => { delete ls[k]; },
  };
  sandbox.MutationObserver = class { observe() { } disconnect() { } };
  sandbox.ResizeObserver = class { observe() { } disconnect() { } };
  sandbox.requestAnimationFrame = fn => setTimeout(fn, 0);
  sandbox.esc = s => String(s == null ? '' : s);
  sandbox.toast = (m) => { sandbox.__toasts.push(String(m)); };
  sandbox.__toasts = [];
  sandbox.renderDbStatus = () => { };
  sandbox.refreshHome = () => { };
  sandbox.buildDash = () => { };
  sandbox.renderTasks = () => { };
  sandbox.renderLiterature = () => { };
  sandbox.renderLab = () => { };
  sandbox.renderFocusPage = () => { };
  sandbox.renderReports = () => { };
  sandbox.renderExperiments = () => { };
  sandbox.renderToolHub = () => { };
  sandbox.applyDensity = () => { };
  sandbox.queueResize = () => { };
  sandbox.dashApplyMetrics = () => { };
  sandbox.entityModal = () => { };
  sandbox.confirmModal = (t, m, ok) => { sandbox.__confirm = { t, m, ok }; };
  sandbox._route = { name: 'settings', arg: null };
  sandbox.labTab = 'reagent';
  sandbox.reportRange = 7;

  /* 模拟桌面：db_save 按 changed 键合并进「磁盘」，db_load 返回磁盘快照。
     磁盘与内存不同源，才能如实暴露「adopt 抹掉未落盘改动」这类竞态。 */
  const state = { disk: disk ? JSON.parse(JSON.stringify(disk)) : null };
  const invoke = (cmd, args = {}) => {
    calls.push({ cmd, args });
    if (cmd === 'db_load') return Promise.resolve(state.disk ? JSON.parse(JSON.stringify(state.disk)) : null);
    if (cmd === 'db_save') {
      if (!state.disk) state.disk = {};
      const keys = args.changed || Object.keys(args.data || {});
      for (const k of keys) {
        if (k === '_rev') continue;
        if (args.data[k] === undefined) delete state.disk[k];
        else state.disk[k] = JSON.parse(JSON.stringify(args.data[k]));
      }
      state.disk._rev = (state.disk._rev || 0) + 1;
      return Promise.resolve('/tmp/labkit_db.json');
    }
    if (cmd === 'db_info') return Promise.resolve({ path: '/tmp/labkit_db.json', exists: true, bytes: 1, modified: '', backups: 0 });
    if (cmd === 'vault_status') return Promise.resolve(sandbox.__vaultStatus || { enabled: false, dir: '', files: 0, errors: [], lastSync: '', conflicts: 0, conflictList: [] });
    if (cmd === 'vault_configure' || cmd === 'vault_sync') return Promise.resolve({ projected: { written: 3, skipped: 0, trashed: 0, errors: [] }, ingested: 0, conflicts: [], removed: 0, rev: 1 });
    if (cmd === 'vault_resolve') return Promise.resolve({ rev: 2 });
    if (cmd === 'plugin:dialog|open') return Promise.resolve(sandbox.__pickDir || null);
    return Promise.resolve(null);
  };
  if (inTauri) {
    sandbox.__TAURI_INTERNALS__ = { invoke };
    sandbox.__TAURI__ = {
      invoke,
      window: { getCurrentWindow: () => ({ label: 'main', onCloseRequested: () => Promise.resolve(), setTitle: () => Promise.resolve(), show: () => Promise.resolve() }) },
      webviewWindow: { WebviewWindow: class { static getByLabel() { return null; } } },
      event: { listen: (name, cb) => { listeners[name] = cb; return Promise.resolve(); } },
    };
  }
  const c = vm.createContext(sandbox);
  for (const f of ['frontend/js/bridge.js', 'frontend/js/util.js', 'frontend/js/db.js', 'frontend/js/store.js']) {
    vm.runInContext(read(f), c, { filename: f });
  }
  return {
    c, elements, listeners, calls, state,
    run: f => vm.runInContext(read(f), c, { filename: f }),
    eval: e => vm.runInContext(e, c),
    fire: (name, payload) => listeners[name] && listeners[name]({ payload }),
  };
}

const SEED = {
  tasks: [{ id: 't1', name: '原有任务', done: false, state: 'todo' }],
  projects: [], notes: [], reagents: [], instruments: [], reminders: [],
  budget: [], bookings: [], literatures: [], experiments: [], focusRecords: [],
  recentSlides: [], _store: {}, ui: { density: 'normal' }, _rev: 1, isDemo: false, budgetTotal: 30000,
};

/* ---------------- 浏览器降级 ---------------- */

test('浏览器模式：Vault 整卡禁用且不抛错', async () => {
  const h = ctx({ inTauri: false });
  h.run('frontend/js/settings.js');
  await h.eval('renderVaultSettings()');
  assert.equal(h.elements.setVaultEnabled.disabled, true);
  assert.equal(h.elements.setVaultEnabled.checked, false);
  for (const id of ['btnVaultDir', 'btnVaultSync', 'btnVaultOpen']) {
    assert.equal(h.elements[id].disabled, true, `${id} 应禁用`);
  }
  assert.equal(h.elements.vaultPill.textContent, '浏览器模式');
  assert.ok(h.elements.vaultInfo.innerHTML.includes('仅桌面版可用'));
  assert.equal(h.elements.vaultConflicts.innerHTML, '');
});

test('浏览器模式：点启用开关会被拒并复位，不发起 IPC', async () => {
  const h = ctx({ inTauri: false });
  h.run('frontend/js/settings.js');
  h.elements.setVaultEnabled.checked = true;
  await h.elements.setVaultEnabled.onchange({ target: h.elements.setVaultEnabled });
  assert.equal(h.elements.setVaultEnabled.checked, false, '必须复位');
  assert.ok(h.c.__toasts.some(t => t.includes('浏览器演示模式')));
  assert.equal(h.calls.filter(c => c.cmd === 'vault_configure').length, 0);
});

test('bridge mock：vault_status 返回未启用，其余 vault_* 安全返回 null', async () => {
  const h = ctx({ inTauri: false });
  const st = await h.eval("invoke('vault_status')");
  assert.equal(st.enabled, false);
  assert.equal(st.conflictList.length, 0);
  assert.equal(await h.eval("invoke('vault_sync')"), null);
  assert.equal(await h.eval("invoke('vault_resolve',{id:'x',keep:'local'})"), null);
});

/* ---------------- 桌面：状态与冲突 UI ---------------- */

test('桌面模式：启用后展示目录/文件数，冲突行带两个裁决按钮', async () => {
  const h = ctx({ inTauri: true, disk: SEED });
  h.c.__vaultStatus = {
    enabled: true, dir: '/vault', files: 11, errors: [], lastSync: '2026-11-21 10:00:00',
    conflicts: 1, conflictList: [{ id: 'n1', label: '排查思路', local: { text: '本地' }, vault: { text: '外部' } }],
  };
  h.run('frontend/js/settings.js');
  await h.eval('renderVaultSettings()');
  assert.equal(h.elements.setVaultEnabled.checked, true);
  assert.equal(h.elements.setVaultEnabled.disabled, false);
  assert.equal(h.elements.vaultPill.textContent, '1 处冲突待裁决');
  assert.ok(h.elements.vaultInfo.innerHTML.includes('/vault'));
  const html = h.elements.vaultConflicts.innerHTML;
  assert.ok(html.includes('排查思路'), '应显示可读标签而非裸 id');
  assert.ok(html.includes('data-vault-keep="local"') && html.includes('data-vault-keep="vault"'));
});

test('同步错误展示在状态区，不静默吞掉', async () => {
  const h = ctx({ inTauri: true, disk: SEED });
  h.c.__vaultStatus = { enabled: true, dir: '/vault', files: 0, errors: ['写入 试剂/x.md 失败：权限不足'], lastSync: '', conflicts: 0, conflictList: [] };
  h.run('frontend/js/settings.js');
  await h.eval('renderVaultSettings()');
  assert.ok(h.elements.vaultInfo.innerHTML.includes('权限不足'));
});

test('启用前先把本地改动落盘，再发 vault_configure', async () => {
  const h = ctx({ inTauri: true, disk: SEED });
  h.run('frontend/js/settings.js');
  h.c.__pickDir = '/chosen/vault';
  h.eval("DB.tasks.push({id:'t-new',name:'新任务',done:false,state:'todo'});saveDB()");
  assert.equal(h.eval('_dbDirty'), true);
  h.elements.setVaultEnabled.checked = true;
  await h.elements.setVaultEnabled.onchange({ target: h.elements.setVaultEnabled });
  const iSave = h.calls.findIndex(c => c.cmd === 'db_save');
  const iCfg = h.calls.findIndex(c => c.cmd === 'vault_configure');
  assert.ok(iSave >= 0 && iCfg > iSave, '必须先 flushDB 再 configure，否则投影源是旧台账');
  assert.equal(h.calls[iCfg].args.dir, '/chosen/vault');
  assert.equal(h.calls[iCfg].args.enable, true);
  h.eval('clearTimeout(_dbT)');
});

/* ---------------- 数据保护：dirty 时先补写再采纳 ---------------- */

test('远端事件到达时本地有未落盘改动：先补写再采纳，编辑不丢', async () => {
  const h = ctx({ inTauri: true, disk: SEED });
  await h.eval('loadDBFromDisk()');
  // 本地在 400ms 防抖窗口里改了任务，磁盘还没有
  h.eval("DB.tasks.push({id:'t-dirty',name:'防抖窗口里的编辑',done:false,state:'todo'});saveDB()");
  assert.equal(h.eval('_dbDirty'), true);
  assert.ok(!h.state.disk.tasks.some(t => t.id === 't-dirty'), '前置条件：磁盘尚未含该编辑');

  // Vault 摄入广播的事件到达（origin 不是本窗口）
  await h.eval("dbOnRemote({origin:'vault',rev:9,keys:['tasks']})");
  assert.ok(h.state.disk.tasks.some(t => t.id === 't-dirty'), '本地编辑必须已补写进磁盘');
  assert.ok(h.eval("DB.tasks.some(t=>t.id==='t-dirty')"), 'adopt 后本地编辑仍在');
  assert.equal(h.eval('_dbDirty'), false);
  h.eval('clearTimeout(_dbT)');
});

test('vault-synced 只做提示，不触碰 dbOnRemote 的排队机制', async () => {
  const h = ctx({ inTauri: true, disk: SEED });
  await h.eval('loadDBFromDisk()');
  h.eval('_dbFlushing=true');
  h.fire('vault-synced', { report: { projected: { written: 2, errors: [] }, ingested: 1, conflicts: [] } });
  assert.equal(h.eval('_dbPendingRemote'), null, '不得把同步提示塞进远端重载队列');
  assert.equal(h.eval('_dbApplying'), false);
  h.eval('_dbFlushing=false');
});

test('vault-synced 的投影失败会提示「台账不受影响」，且按内容去重不刷屏', () => {
  const h = ctx({ inTauri: true, disk: SEED });
  const payload = { report: { projected: { written: 0, errors: ['写入 试剂/x.md 失败：磁盘满'] } } };
  h.fire('vault-synced', payload);
  h.fire('vault-synced', payload);
  h.fire('vault-synced', payload);
  const warns = h.c.__toasts.filter(t => t.includes('磁盘满'));
  assert.equal(warns.length, 1, '同样的错误只提示一次');
  assert.ok(warns[0].includes('台账已保存'), '必须说清台账不受影响');
  // 错误消失后再次出现应重新提示
  h.fire('vault-synced', { report: { projected: { written: 1, errors: [] } } });
  h.fire('vault-synced', payload);
  assert.equal(h.c.__toasts.filter(t => t.includes('磁盘满')).length, 2);
});

test('vault-synced 的冲突提示引导用户去设置页还原', () => {
  const h = ctx({ inTauri: true, disk: SEED });
  h.fire('vault-synced', { report: { conflicts: ['n1', 'n2'], projected: { errors: [] } } });
  const t = h.c.__toasts.find(x => x.includes('冲突'));
  assert.ok(t && t.includes('2 处'), '应报冲突数量');
  assert.ok(t.includes('保留本地'), '应指明还原入口');
});
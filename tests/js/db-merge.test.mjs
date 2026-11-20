// P1 跨窗口台账同步（前端侧）单测：changed 差分、_rev 排除、远端重载 adopt、
// 模态/编辑态延迟刷新、浏览器模式基线维护。Rust 侧合并语义见 rust/tests/store_merge.rs。
// DOM 以最小桩替代；invoke 走 bridge.js 浏览器 mock（db_load = localStorage 缓存）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;

/* ---- 最小 DOM / BOM 桩 ---- */
const el = () => ({ onclick: null, hidden: false, classList: { toggle() { }, add() { }, remove() { } }, style: {}, textContent: '' });
const elements = {};
let modalMask = null;               // 非 null 时模拟「有模态打开」
globalThis.document = {
  getElementById: id => elements[id] || (elements[id] = el()),
  querySelectorAll: () => [],
  querySelector: sel => (sel === '.modal-mask' ? modalMask : null),
  addEventListener() { },
  createElement: () => el(),
  documentElement: { dataset: {}, style: { setProperty() { } } },
};
globalThis.location = { hash: '', reload() { globalThis.__reloaded = (globalThis.__reloaded || 0) + 1; } };
globalThis.history = { replaceState() { }, back() { }, forward() { } };
globalThis.addEventListener = () => { };
const lsBag = {};
globalThis.localStorage = {
  getItem(k) { return k in lsBag ? lsBag[k] : null; },
  setItem(k, v) { lsBag[k] = String(v); },
  removeItem(k) { delete lsBag[k]; },
};
/* MutationObserver 桩：记录回调，测试手动触发（模拟模态关闭后的 DOM 变化） */
let moCallback = null, moObserving = false;
globalThis.MutationObserver = class {
  constructor(cb) { moCallback = cb; }
  observe() { moObserving = true; }
  disconnect() { moObserving = false; }
};
/* db.js 依赖的工具函数桩（真实实现在 stats.js / util，数据层测试不需要） */
globalThis.uid = p => p + Math.random().toString(36).slice(2, 8);
globalThis.daysAgoISO = () => '2026-11-20';
globalThis.pad2 = n => String(n).padStart(2, '0');
globalThis.todayStr = () => '2026-11-20';
globalThis.nowStamp = () => '2026-11-20T12:00:00';
globalThis.toast = () => { };
globalThis.renderDbStatus = () => { };
/* 视图渲染桩：计数验证「刷新了当前视图」 */
let homeRenders = 0, taskRenders = 0;
globalThis.refreshHome = () => { homeRenders++; };
globalThis.buildDash = () => { };
globalThis.renderTasks = () => { taskRenders++; };
globalThis._route = { name: 'home', arg: null };

for (const f of ['frontend/js/bridge.js', 'frontend/js/db.js', 'frontend/js/store.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
}

test('浏览器模式启动：建立基线快照，状态 browser', async () => {
  await loadDBFromDisk();
  assert.equal(dbStatus, 'browser');
  assert.ok(_dbBase, '加载后必须有基线');
  assert.deepEqual(dbChangedKeys(), [], '刚加载完无改动');
});

test('changed 差分：只列改动键，_rev 永不参与', () => {
  DB.tasks.push({ id: 'tx', name: '新任务', done: false, state: 'todo' });
  assert.deepEqual(dbChangedKeys(), ['tasks']);
  DB._rev = 99;                       // 前端误改 _rev 也不应进 changed
  assert.deepEqual(dbChangedKeys(), ['tasks']);
  Store.set('toolform:primer', { v: 1 });
  const ch = dbChangedKeys();
  assert.ok(ch.includes('_store') && ch.includes('tasks'));
  assert.ok(!ch.includes('_rev'));
});

test('flushDB（浏览器）：写缓存、清 dirty、重建基线', async () => {
  saveDB();
  assert.equal(_dbDirty, true);
  await flushDB();
  assert.equal(_dbDirty, false);
  assert.deepEqual(dbChangedKeys(), []);
  const cached = JSON.parse(localStorage.getItem('labkit.db.v1'));
  assert.ok(cached.tasks.some(t => t.id === 'tx'), '缓存包含新任务');
});

test('无改动 flush 跳过写入（不产生事件噪音）', async () => {
  const before = localStorage.getItem('labkit.db.v1');
  await flushDB();
  assert.equal(localStorage.getItem('labkit.db.v1'), before);
});

test('dbOnRemote：自己的事件只更新 rev，不重载', async () => {
  const revBefore = _dbRev;
  const tasksBefore = JSON.stringify(DB.tasks);
  await dbOnRemote({ origin: _dbOrigin, rev: revBefore + 5, keys: ['tasks'] });
  assert.equal(_dbRev, revBefore + 5);
  assert.equal(JSON.stringify(DB.tasks), tasksBefore, '本窗口数据不动');
});

test('dbOnRemote：远端事件 → 重载磁盘（mock=缓存）→ adopt + 刷新当前视图', async () => {
  /* 模拟另一个窗口写入：直接改缓存（db_load mock 读它） */
  const remote = JSON.parse(localStorage.getItem('labkit.db.v1'));
  remote.projects = [{ id: 'p-remote', name: '远端项目' }];
  remote._rev = 42;
  localStorage.setItem('labkit.db.v1', JSON.stringify(remote));
  const n0 = homeRenders;
  await dbOnRemote({ origin: 'other-window', rev: 42, keys: ['projects'] });
  assert.equal(DB.projects[0].id, 'p-remote', '远端键被采纳');
  assert.equal(_dbRev, 42);
  assert.deepEqual(dbChangedKeys(), [], 'adopt 后基线同步');
  assert.ok(homeRenders > n0, '当前视图（home）被刷新');
});

test('模态打开时延迟刷新：关闭后（DOM 变化）补渲染', async () => {
  const remote = JSON.parse(localStorage.getItem('labkit.db.v1'));
  remote.tasks = remote.tasks.concat([{ id: 't-modal', name: '模态期间到达', done: false, state: 'todo' }]);
  remote._rev = 43;
  localStorage.setItem('labkit.db.v1', JSON.stringify(remote));
  modalMask = el();                    // 模拟 formModal 打开
  const n0 = homeRenders;
  await dbOnRemote({ origin: 'other-window', rev: 43, keys: ['tasks'] });
  assert.ok(DB.tasks.some(t => t.id === 't-modal'), '数据层立即采纳');
  assert.equal(homeRenders, n0, '模态打开期间不重渲染视图');
  assert.equal(_dbViewPending, true);
  assert.equal(moObserving, true, '挂载了 DOM 观察等待模态关闭');
  modalMask = null;                    // 模态关闭
  moCallback();                        // MutationObserver 触发
  assert.ok(homeRenders > n0, '关闭后补刷新');
  assert.equal(_dbViewPending, false);
  assert.equal(moObserving, false, '观察器已卸载');
});

test('reset 事件：清缓存并重启（浏览器 mock 路径）', async () => {
  const n0 = globalThis.__reloaded || 0;
  await dbOnRemote({ origin: 'other-window', reset: true });
  assert.equal(localStorage.getItem('labkit.db.v1'), null);
  assert.equal((globalThis.__reloaded || 0), n0 + 1);
});

test('顶层键删除进入 changed（盘上同步删除语义）', async () => {
  await loadDBFromDisk();              // reset 后重建基线（种子数据）
  delete DB.notes;
  assert.ok(dbChangedKeys().includes('notes'));
  DB.notes = [];                       // 还原，避免污染后续
});

test('写盘在途的远端事件被暂存，落地后补处理（真机冒烟发现的竞态回归）', async () => {
  /* 场景：本窗口 db_save 在途（盘上还没有本地刚提交的键），对端事件先到。
     若立即 db_load+adopt，会读到旧快照抹掉本地改动；必须暂存到写盘落地后。
     桌面语义里 db_load 读磁盘、writeCache 写 localStorage，两者不同源——
     这里 mock invoke('db_load') 返回独立的「磁盘」快照来如实模拟。 */
  await loadDBFromDisk();
  const remoteDisk = JSON.parse(JSON.stringify(DB));
  remoteDisk.projects = [{ id: 'p-race', name: '竞态项目' }];
  remoteDisk._rev = 50;
  const origInvoke = globalThis.invoke;
  globalThis.invoke = (cmd, args) => cmd === 'db_load' ? Promise.resolve(remoteDisk) : origInvoke(cmd, args);
  try {
    _dbFlushing = true;                  // 模拟 invoke('db_save') 在途
    const tasksBefore = JSON.stringify(DB.tasks);
    await dbOnRemote({ origin: 'other-window', rev: 50, keys: ['projects'] });
    assert.ok(_dbPendingRemote, '事件被暂存而非立即 adopt');
    assert.equal(JSON.stringify(DB.tasks), tasksBefore, '在途期间本地数据不被触碰');
    assert.equal(DB.projects.some(p => p.id === 'p-race'), false);
    _dbFlushing = false;
    await flushDB();                     // 写盘落地 → drain 暂存事件（db_load 读「磁盘」）
    assert.equal(_dbPendingRemote, null);
    assert.equal(DB.projects[0].id, 'p-race', '落地后采纳远端改动');
    assert.equal(_dbRev, 50);
  } finally { globalThis.invoke = origInvoke; }
});

test('读盘期间本地又落新写：过时快照不采纳，自动重读新盘', async () => {
  /* 竞态变体：dbOnRemote 的 db_load 在途时，本窗口 flushDB 成功（写序号递增）。
     先读到的快照缺少本地刚提交的键 → 必须丢弃并重读，而不是 adopt 抹键。 */
  await loadDBFromDisk();
  await flushDB();
  const staleDisk = JSON.parse(JSON.stringify(DB));
  staleDisk.projects = [{ id: 'p-stale' }]; staleDisk._rev = 60;
  const freshDisk = JSON.parse(JSON.stringify(staleDisk));
  freshDisk.projects = [{ id: 'p-fresh' }]; freshDisk._rev = 61;
  let loadCalls = 0;
  const origInvoke = globalThis.invoke;
  globalThis.invoke = (cmd, args) => {
    if (cmd === 'db_load') { loadCalls++; return Promise.resolve(loadCalls === 1 ? staleDisk : freshDisk); }
    return origInvoke(cmd, args);
  };
  try {
    const applying = dbOnRemote({ origin: 'other-window', rev: 60, keys: ['projects'] });
    _dbWriteSeq++;                     // 读盘在途时本地写盘落地（flushDB 成功路径的同步递增）
    await applying;
    for (let i = 0; i < 20 && (_dbApplying || loadCalls < 2); i++) await new Promise(r => setTimeout(r, 5));
    assert.equal(loadCalls, 2, '过时快照触发了重读');
    assert.equal(DB.projects[0].id, 'p-fresh', '采纳的是重读后的新盘');
    assert.equal(DB.projects.some(p => p.id === 'p-stale'), false);
  } finally { globalThis.invoke = origInvoke; }
});

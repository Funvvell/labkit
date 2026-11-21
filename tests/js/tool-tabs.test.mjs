// 工具箱标签状态模型单测（纯函数，vm 隔离；不依赖 DOM / Tauri）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tabsSrc = fs.readFileSync(path.join(root, 'frontend/js/tabs.js'), 'utf8');

function model(metas) {
  const sandbox = { console, Set, Map, Array, Object, String, Number, Math, JSON, RegExp, Error };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.TOOL_META = metas || [
    { id: 'primer', name: '引物' },
    { id: 'crop', name: '裁剪', workspace: true },
    { id: 'qpcr', name: 'qPCR', workspace: true },
    { id: 'plate', name: '孔板' },
  ];
  vm.createContext(sandbox);
  vm.runInContext(tabsSrc, sandbox, { filename: 'tabs.js' });
  return sandbox;
}

test('归一化：保留工具顺序、去重、丢弃工具库与非法项', () => {
  const m = model();
  const list = m.tabsNormalize({ v: 1, list: ['tool:plate', 'tool:primer', 'tool:plate', 'ws:crop', 'tool:crop', 'tool:nope', 'ws:plate', 'lib:toolhub', 'lib:toolhub'] });
  assert.deepEqual([...list], ['tool:plate', 'tool:primer', 'ws:crop']);
});

test('归一化：空/脏数据返回空列表，不抛错', () => {
  const m = model();
  for (const raw of [null, undefined, 'x', [], {}, { list: 'x' }]) {
    assert.deepEqual([...m.tabsNormalize(raw)], []);
  }
});

test('打开：已存在不重复、未知工具不追加、工具库不进入标签', () => {
  const m = model();
  const a = m.tabsOpen(['tool:primer'], 'tool:primer');
  assert.deepEqual([...a], ['tool:primer']);
  const b = m.tabsOpen(['tool:primer'], 'tool:plate');
  assert.deepEqual([...b], ['tool:primer', 'tool:plate']);
  const c = m.tabsOpen(['tool:primer'], 'tool:nope');
  assert.deepEqual([...c], ['tool:primer']);
  const d = m.tabsOpen(['tool:primer'], 'lib:toolhub');
  assert.deepEqual([...d], ['tool:primer']);
});

test('关闭：右邻 → 左邻 → 空；工具库不参与关闭', () => {
  const m = model();
  const r1 = m.tabsClose(['tool:primer', 'tool:plate'], 'tool:primer');
  assert.equal(r1.next, 'tool:plate');
  assert.deepEqual([...r1.list], ['tool:plate']);
  const r2 = m.tabsClose(['tool:primer', 'tool:plate'], 'tool:plate');
  assert.equal(r2.next, 'tool:primer');
  const r3 = m.tabsClose(['tool:primer'], 'tool:primer');
  assert.equal(r3.next, null);
  assert.equal(r3.empty, true);
  assert.deepEqual([...r3.list], []);
});

test('排序：只在工具之间排序，插值越界被收敛', () => {
  const m = model();
  assert.deepEqual([...m.tabsMove(['tool:primer', 'tool:plate'], 'tool:primer', 3)], ['tool:plate', 'tool:primer']);
  assert.deepEqual([...m.tabsMove(['tool:primer', 'tool:plate'], 'tool:primer', 2)], ['tool:plate', 'tool:primer']);
  assert.deepEqual([...m.tabsMove(['tool:primer', 'tool:plate'], 'tool:plate', -1)], ['tool:plate', 'tool:primer']);
});

test('关闭全部：清空工具标签，工具库不作为标签保留', () => {
  const m = model();
  const p = m.tabsCloseAllPlan(['tool:primer', 'lib:toolhub', 'ws:crop']);
  assert.deepEqual([...p.keys], ['tool:primer', 'ws:crop']);
  assert.deepEqual([...p.list], []);
  const onlyLib = m.tabsCloseAllPlan(['lib:toolhub']);
  assert.deepEqual([...onlyLib.keys], []);
  assert.deepEqual([...onlyLib.list], []);
  const empty = m.tabsCloseAllPlan([]);
  assert.deepEqual([...empty.list], []);
});

test('循环切换：工具首尾环绕', () => {
  const m = model();
  const list = ['tool:primer', 'tool:plate'];
  assert.equal(m.tabsNeighbor(list, 'tool:plate', 1), 'tool:primer');
  assert.equal(m.tabsNeighbor(list, 'tool:primer', -1), 'tool:plate');
  assert.equal(m.tabsNeighbor(list, 'tool:primer', 1), 'tool:plate');
});

test('路由映射：工具库不产生标签；普通工具 / 工作区正常', () => {
  const m = model();
  const t = m.tabsRouteOf('tool:primer');
  assert.equal(t.name, 'tool');
  assert.equal(t.arg, 'primer');
  const w = m.tabsRouteOf('ws:crop');
  assert.equal(w.name, 'crop');
  assert.equal(w.arg, null);
  assert.equal(m.tabKeyOfRoute({ name: 'toolhub' }), null);
  assert.equal(m.tabKeyOfRoute({ name: 'tool', arg: 'primer' }), 'tool:primer');
  assert.equal(m.tabKeyOfRoute({ name: 'qpcr' }), 'ws:qpcr');
  assert.equal(m.tabKeyOfRoute({ name: 'home' }), null);
  assert.equal(m.tabKindOf('tool:primer'), 'tool');
  assert.equal(m.tabKindOf('ws:crop'), 'workspace');
});

test('持久化载荷：版本号 + 归一化后的工具列表（不含工具库）', () => {
  const m = model();
  const p = m.tabsPayload(['tool:plate', 'tool:nope', 'lib:toolhub']);
  assert.equal(p.v, 1);
  assert.deepEqual([...p.list], ['tool:plate']);
});

test('关闭最后一个工具：回到工具库基底页，不关窗', () => {
  const m = model();
  m.document = { getElementById: id => (id === 'toolTabsTrack' ? { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] } : null) };
  m.navigate = name => { m.__nav = { name }; };
  vm.runInContext("_tabsList = ['tool:primer']; _tabsActive = 'tool:primer'; tabsCloseKey('tool:primer')", m);
  assert.deepEqual(m.__nav, { name: 'toolhub' });
  assert.equal(vm.runInContext('_tabsList.length', m), 0);
  assert.equal(vm.runInContext('_tabsActive', m), null);
});

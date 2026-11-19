// P1/P2 外壳单测：hash 路由解析/导航/返回、Store 门面与旧键迁移、命令面板索引与拼音匹配。
// DOM 以最小桩替代（classic script 顶层只绑定事件，不渲染）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;

/* ---- 最小 DOM / BOM 桩 ---- */
const el = () => ({ onclick: null, classList: { toggle() { }, add() { }, remove() { } }, style: {} });
const elements = { cropBack: el(), qpcrBack: el(), dsBack: el(), toolBack: el() };
globalThis.document = {
  getElementById: id => elements[id] || (elements[id] = el()),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener() { },
};
globalThis.location = { hash: '' };
const hist = { pushes: 0, backs: 0, forwards: 0 };
globalThis.history = {
  replaceState() { }, back() { hist.backs++; }, forward() { hist.forwards++; },
};
globalThis.addEventListener = () => { };
globalThis.DB = { _store: {} };
let saves = 0;
globalThis.saveDB = () => { saves++; };
const lsBag = {};
/* 浏览器语义：存储键即 localStorage 对象自身可枚举键（Object.keys 能列出来） */
globalThis.localStorage = {
  getItem(k) { return k in lsBag ? lsBag[k] : null; },
  setItem(k, v) { lsBag[k] = String(v); this[k] = String(v); },
  removeItem(k) { delete lsBag[k]; delete this[k]; },
};
globalThis.renderTool = id => { globalThis.__renderedTool = id; };
globalThis.esc = s => String(s);
globalThis.toolIcon = () => '<svg></svg>';
globalThis.IC = { system: '<svg></svg>', json: '<svg></svg>' };
globalThis.TOOL_META = [
  { id: 'primer', name: '引物工作台', group: '实验计算', desc: 'Tm GC', py: 'yw yinwu tm gc primer' },
  { id: 'data-wash', name: '数据清洗与交叉表', group: '统计与数据', desc: 'CSV 治理', py: 'sjqx shujuqingxi csv' },
  { id: 'qpcr', name: 'qPCR 分析', group: '实验计算', desc: 'ΔΔCt', py: 'qpcr dct ddct', workspace: true },
];

for (const f of ['frontend/js/store.js', 'frontend/js/router.js', 'frontend/js/palette.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
}

/* ---- 路由 ---- */
test('parseHash：视图/工具深链/非法回落', () => {
  assert.deepEqual(parseHash('#/tasks'), { name: 'tasks', arg: null });
  assert.deepEqual(parseHash('#/tool/epi2x2'), { name: 'tool', arg: 'epi2x2' });
  assert.deepEqual(parseHash('#/nope'), { name: 'home', arg: null });
  assert.deepEqual(parseHash(''), { name: 'home', arg: null });
  assert.deepEqual(parseHash('#/'), { name: 'home', arg: null });
});
test('routeHash 与 parseHash 往返一致', () => {
  for (const h of ['#/home', '#/toolhub', '#/crop', '#/tool/primer', '#/tool/data-wash']) {
    assert.equal(routeHash(parseHash(h)), h);
  }
});
test('navigate 写 hash；同 hash 不重复 push；renderRoute 触发工具渲染', () => {
  location.hash = '#/home';
  navigate('tasks');
  assert.equal(location.hash, '#/tasks');
  navigate('tasks');           // 同 hash：直接 renderRoute，不 push
  navigate('tool', 'primer');
  assert.equal(location.hash, '#/tool/primer');
  renderRoute(parseHash(location.hash));
  assert.equal(globalThis.__renderedTool, 'primer');
});
test('routerBack：有历史走 history.back，无历史回落 fallback', () => {
  const b0 = hist.backs;
  routerBack('home');          // 前面 navigate 过 → back
  assert.equal(hist.backs, b0 + 1);
});

/* ---- Store ---- */
test('Store 收藏/最近/设置：读写与上限', () => {
  assert.equal(Store.isFav('primer'), false);
  assert.equal(Store.toggleFav('primer'), true);
  assert.equal(Store.isFav('primer'), true);
  assert.equal(Store.toggleFav('primer'), false);
  for (let i = 0; i < 12; i++) Store.pushRecent('t' + i);
  assert.equal(Store.recent().length, 8);
  assert.equal(Store.recent()[0], 't11');
  Store.setSetting('name', '测试');
  assert.equal(Store.settings().name, '测试');
  assert.ok(saves > 0);
});
test('Store.migrateLegacy：旧 localStorage 键搬进台账并删除', () => {
  localStorage.setItem('labkit-plate', JSON.stringify({ plate: 'x', activeLayer: 0 }));
  localStorage.setItem('labkit-checklist-prisma', JSON.stringify({ a: 1 }));
  localStorage.setItem('labkit-inv-api', JSON.stringify({ url: 'http://x' }));
  const moved = Store.migrateLegacy();
  assert.equal(moved, true);
  assert.deepEqual(Store.get('tool:plate'), { plate: 'x', activeLayer: 0 });
  assert.deepEqual(Store.get('tool:checklist-prisma'), { a: 1 });
  assert.deepEqual(Store.get('tool:inv-api'), { url: 'http://x' });
  assert.equal(localStorage.getItem('labkit-plate'), null);
  assert.equal(localStorage.getItem('labkit-checklist-prisma'), null);
});

/* ---- 命令面板 ---- */
test('paletteIndex：工具/页面/动作三类齐全', () => {
  const idx = paletteIndex();
  assert.ok(idx.some(x => x.kind === 'tool' && x.id === 'primer'));
  assert.ok(idx.some(x => x.kind === 'page' && x.id === 'tasks'));
  assert.ok(idx.some(x => x.kind === 'act' && x.id === 'new-task'));
});
test('palFilter：拼音首字母与名称匹配、排序', () => {
  const yw = palFilter('yw')[0].items;
  assert.equal(yw[0].id, 'primer');
  const sj = palFilter('sjqx')[0].items;
  assert.equal(sj[0].id, 'data-wash');
  const name = palFilter('引物')[0].items;
  assert.equal(name[0].id, 'primer');
  assert.equal(palFilter('zzzz不存在')[0].items.length, 0);
});
test('palFilter：空查询返回最近/收藏/页面/动作分区', () => {
  Store.toggleFav('data-wash');
  Store.pushRecent('primer');
  const secs = palFilter('');
  const labels = secs.map(s => s.label);
  assert.ok(labels.includes('最近使用'));
  assert.ok(labels.includes('收藏'));
  assert.ok(labels.includes('页面'));
  assert.ok(labels.includes('动作'));
  assert.equal(secs.find(s => s.label === '最近使用').items[0].id, 'primer');
});
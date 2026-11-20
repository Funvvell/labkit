// P0 侧栏导航单测：工作台菜单完整性、固定区渲染/过滤、子页高亮映射（未固定→首页，已固定→固定项）、
// 页头 ☆ 状态同步。加载 store.js + shell.js + dashboard.js（classic script，vm 共享全局）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;

/* ---- 可观察的最小 DOM 桩 ---- */
function mkEl(extra = {}) {
  const s = new Set();
  return Object.assign({
    onclick: null, style: {}, dataset: {}, innerHTML: '', textContent: '', title: '',
    classList: {
      add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
      toggle(c, f) { const on = f === undefined ? !s.has(c) : !!f; on ? s.add(c) : s.delete(c); return on; },
    },
    setAttribute() { }, addEventListener() { }, appendChild() { }, remove() { }, focus() { },
    querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, right: 100, top: 0, bottom: 30, width: 100, height: 30 }),
    contains: () => false,
  }, extra);
}
const navItems = [mkEl({ dataset: { nav: 'home' } }), mkEl({ dataset: { nav: 'toolhub' } }), mkEl({ dataset: { nav: 'settings' } })];
const pinItems = [];      // 模拟侧栏已渲染的固定项
const pinBtns = [];       // 模拟页头/菜单里的 ☆ 按钮
const elements = {};
globalThis.document = {
  getElementById: id => elements[id] || (elements[id] = mkEl()),
  querySelectorAll(sel) {
    if (sel === '.nav-item') return [...navItems, ...pinItems];
    if (sel === '[data-pin-toggle]') return pinBtns;
    return [];
  },
  querySelector(sel) {
    let m = sel.match(/\.nav-item\[data-nav="([^"]+)"\]/);
    if (m) return navItems.find(n => n.dataset.nav === m[1]) || null;
    m = sel.match(/\.pin-item\[data-pin-kind="([^"]+)"\]\[data-pin-id="([^"]+)"\]/);
    if (m) return pinItems.find(p => p.dataset.pinKind === m[1] && p.dataset.pinId === m[2]) || null;
    return null;
  },
  addEventListener() { }, createElement: () => mkEl(), body: mkEl(),
};
globalThis.location = { hash: '' };
globalThis.history = { replaceState() { }, back() { }, forward() { } };
globalThis.addEventListener = () => { };
globalThis.DB = { _store: {} };
globalThis.saveDB = () => { };
const lsBag = {};
globalThis.localStorage = {
  getItem(k) { return k in lsBag ? lsBag[k] : null; },
  setItem(k, v) { lsBag[k] = String(v); this[k] = String(v); },
  removeItem(k) { delete lsBag[k]; delete this[k]; },
};
globalThis.esc = s => String(s);
globalThis.toolIcon = () => '<svg></svg>';
globalThis.IC = { system: '<svg></svg>', json: '<svg></svg>' };
globalThis.TOOL_META = [
  { id: 'primer', name: '引物工作台', group: '实验计算', desc: 'Tm GC', py: 'yw' },
  { id: 'qpcr', name: 'qPCR 分析', group: '实验计算', desc: 'ΔΔCt', py: 'qpcr', workspace: true },
];
const toasts = [];
globalThis.toast = m => toasts.push(m);
globalThis.navigate = (n, a) => { globalThis.__nav = [n, a]; };
globalThis.openTool = id => { globalThis.__nav = ['tool', id]; };
globalThis.renderToolHub = () => { };
globalThis.syncToolFav = () => { };
globalThis.formModal = () => { };
globalThis._route = { name: 'home', arg: null };

for (const f of ['frontend/js/store.js', 'frontend/js/shell.js', 'frontend/js/dashboard.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
}

test('PAGE_META / WB_PAGES：7 个可固定子页齐全，常驻页不可固定', () => {
  assert.deepEqual(WB_PAGES, ['tasks', 'projects', 'experiments', 'literature', 'labres', 'reports', 'focus']);
  for (const id of WB_PAGES) assert.equal(PAGE_META[id].pin, true, id);
  for (const id of ['home', 'toolhub', 'settings']) assert.equal(PAGE_META[id].pin, false, id);
});
test('workbenchMenuHTML：包含全部子页与固定切换；已固定显示 ★', () => {
  DB._store = {};
  let html = workbenchMenuHTML();
  for (const id of WB_PAGES) assert.ok(html.includes(`data-wb="${id}"`), id);
  assert.ok(html.includes('data-pin-toggle="tasks"'));
  Store.pin('page', 'tasks');
  html = workbenchMenuHTML();
  assert.ok(html.includes('wb-pin on'));
  assert.ok(html.includes('★'));
});
test('navKeyFor：工具路由映射到工具库导航', () => {
  assert.equal(navKeyFor('tool'), 'toolhub');
  assert.equal(navKeyFor('tasks'), 'tasks');
});
test('shellSyncNav：未固定子页高亮映射回首页', () => {
  DB._store = {}; pinItems.length = 0;
  shellSyncNav('tasks');
  assert.equal(navItems[0].classList.contains('active'), true);   // home
  assert.equal(navItems[1].classList.contains('active'), false);  // toolhub
});
test('shellSyncNav：已固定子页高亮固定项，不再点亮首页', () => {
  DB._store = {};
  Store.pin('page', 'tasks');
  pinItems.length = 0;
  pinItems.push(mkEl({ dataset: { pinKind: 'page', pinId: 'tasks' } }));
  shellSyncNav('tasks');
  assert.equal(pinItems[0].classList.contains('active'), true);
  assert.equal(navItems[0].classList.contains('active'), false);
});
test('shellSyncNav：工具页点亮工具库 + 对应固定项', () => {
  DB._store = {};
  Store.pin('tool', 'primer');
  pinItems.length = 0;
  pinItems.push(mkEl({ dataset: { pinKind: 'tool', pinId: 'primer' } }));
  globalThis._route = { name: 'tool', arg: 'primer' };
  shellSyncNav('tool');
  assert.equal(navItems[1].classList.contains('active'), true);
  assert.equal(pinItems[0].classList.contains('active'), true);
  globalThis._route = { name: 'home', arg: null };
});
test('shellRenderPins：渲染固定组、过滤失效 id、空态引导', () => {
  DB._store = {};
  Store.pin('page', 'tasks');
  Store.pin('tool', 'primer');
  Store.pin('tool', 'ghost-tool');        // 不在 TOOL_META → 渲染时过滤
  shellRenderPins();
  const html = elements.sideFavs.innerHTML;
  assert.ok(html.includes('固定'));
  assert.ok(html.includes('data-pin-id="tasks"'));
  assert.ok(html.includes('data-pin-id="primer"'));
  assert.ok(!html.includes('ghost-tool'));
  DB._store = {};
  shellRenderPins();
  assert.ok(elements.sideFavs.innerHTML.includes('pin-empty'));
});
test('syncPinButtons：☆/★ 与 title 随固定状态同步', () => {
  DB._store = {};
  pinBtns.length = 0;
  pinBtns.push(mkEl({ dataset: { pinToggle: 'tasks', pinToggleKind: 'page' } }));
  syncPinButtons();
  assert.equal(pinBtns[0].textContent, '☆');
  Store.pin('page', 'tasks');
  syncPinButtons();
  assert.equal(pinBtns[0].textContent, '★');
  assert.equal(pinBtns[0].title, '取消固定');
});
test('togglePinFromUI：固定后 toast 提示并刷新固定区', () => {
  DB._store = {}; toasts.length = 0;
  togglePinFromUI('page', 'reports');
  assert.equal(Store.isPinned('page', 'reports'), true);
  assert.ok(toasts.some(t => t.includes('已固定')));
  togglePinFromUI('page', 'reports');
  assert.equal(Store.isPinned('page', 'reports'), false);
  assert.ok(toasts.some(t => t.includes('已取消固定')));
});
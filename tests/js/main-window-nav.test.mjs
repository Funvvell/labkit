// 主窗导航回归：侧栏「全部工具」必须在主窗页内路由，只有具体工具/工作区才唤起工具窗口。
// 覆盖 shell.js 的点击委托 + router.js 的 mainDesktopToolId / renderRoute 收口。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

function mkEl(extra = {}) {
  const s = new Set();
  return Object.assign({
    onclick: null, hidden: false, style: {}, dataset: {}, innerHTML: '', textContent: '', title: '',
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

/** shell.js 点击委托 harness：捕获 document click，按 selector 返回目标元素。 */
function shellHarness() {
  const elements = {};
  const handlers = {};
  const navCalls = [];
  const toolCalls = [];
  const windowCalls = [];
  const sandbox = {
    console, setTimeout, clearTimeout, Promise, Date, Math, JSON, Object, Array, String, Number, Set, Map, RegExp, Error,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = {
    title: '',
    body: mkEl({ dataset: {} }),
    getElementById: id => elements[id] || (elements[id] = mkEl()),
    querySelectorAll: () => [],
    addEventListener: (type, fn) => { handlers[type] = fn; },
    createElement: () => mkEl(),
  };
  sandbox.location = { hash: '' };
  sandbox.history = { replaceState() { }, back() { } };
  sandbox.addEventListener = () => { };
  sandbox.localStorage = { getItem: () => null, setItem() { }, removeItem() { } };
  sandbox.DB = { _store: {} };
  sandbox.saveDB = () => { };
  sandbox.esc = s => String(s == null ? '' : s);
  sandbox.toolIcon = () => '<svg></svg>';
  sandbox.IC = { system: '<svg></svg>', json: '<svg></svg>' };
  sandbox.TOOL_META = [];
  sandbox.toast = () => { };
  sandbox.paletteOpen = () => { };
  sandbox.navigate = name => { navCalls.push(name); };
  sandbox.openTool = id => { toolCalls.push(id); };
  sandbox.openToolWindow = id => { windowCalls.push(id); };
  sandbox.openToolboxWindow = id => { windowCalls.push(id); };
  const c = vm.createContext(sandbox);
  vm.runInContext(read('frontend/js/store.js'), c, { filename: 'frontend/js/store.js' });
  vm.runInContext(read('frontend/js/shell.js'), c, { filename: 'frontend/js/shell.js' });
  vm.runInContext('shellInit()', c);
  const click = map => handlers.click({
    target: { closest: sel => map[sel] || null },
    preventDefault() { }, ctrlKey: false, metaKey: false,
  });
  return { navCalls, toolCalls, windowCalls, click, elements };
}

/** router.js harness：不加载 bridge，直接注入 MAIN_DESKTOP / TOOLBOX_WIN。 */
function routerHarness({ mainDesktop = true } = {}) {
  const elements = {};
  const views = [];
  const sandbox = {
    console, setTimeout, clearTimeout, Promise, Date, Math, JSON, Object, Array, String, Number, Set, Map, RegExp, Error,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  for (const id of ['view-home', 'view-toolhub', 'view-tool', 'view-crop', 'view-qpcr']) {
    elements[id] = mkEl();
    views.push(elements[id]);
  }
  sandbox.document = {
    title: '',
    body: mkEl({ dataset: {} }),
    getElementById: id => elements[id] || (elements[id] = mkEl()),
    querySelectorAll: sel => (sel === '.view' ? views : []),
    addEventListener() { },
    querySelector: () => null,
  };
  sandbox.location = { hash: '#/home' };
  sandbox.history = {
    replaceState(state, title, url) { sandbox.__replace = url; },
    back() { },
  };
  sandbox.addEventListener = () => { };
  sandbox.MAIN_DESKTOP = mainDesktop;
  sandbox.TOOLBOX_WIN = false;
  sandbox.__winCalls = [];
  sandbox.openToolboxWindow = id => { sandbox.__winCalls.push(id); };
  sandbox.__rendered = [];
  sandbox.renderTool = id => { sandbox.__rendered.push(id); };
  const c = vm.createContext(sandbox);
  vm.runInContext(read('frontend/js/router.js'), c, { filename: 'frontend/js/router.js' });
  return { sandbox, elements, eval: expr => vm.runInContext(expr, c) };
}

test('主窗点击「全部工具」：只走页内路由，不唤起工具窗口', () => {
  const h = shellHarness();
  h.click({ '[data-nav]': mkEl({ dataset: { nav: 'toolhub' } }) });
  assert.deepEqual(h.navCalls, ['toolhub']);
  assert.deepEqual(h.windowCalls, []);
});

test('主窗点工具卡：仍交给 openTool（具体工具才进工具窗口）', () => {
  const h = shellHarness();
  h.click({ '[data-tool-id]': mkEl({ dataset: { toolId: 'primer' } }) });
  assert.deepEqual(h.toolCalls, ['primer']);
  assert.deepEqual(h.navCalls, []);
});

test('mainDesktopToolId：工具库不外弹，具体工具/工作区才给窗口', () => {
  const h = routerHarness({ mainDesktop: true });
  assert.equal(h.eval("mainDesktopToolId({name:'toolhub',arg:null})"), null);
  assert.equal(h.eval("mainDesktopToolId({name:'home',arg:null})"), null);
  assert.equal(h.eval("mainDesktopToolId({name:'tool',arg:'primer'})"), 'primer');
  assert.equal(h.eval("mainDesktopToolId({name:'tool'})"), null);
  assert.equal(h.eval("mainDesktopToolId({name:'crop'})"), 'crop');
  assert.equal(h.eval("mainDesktopToolId({name:'qpcr'})"), 'qpcr');
  const b = routerHarness({ mainDesktop: false });
  assert.equal(b.eval("mainDesktopToolId({name:'tool',arg:'primer'})"), null);
});

test('renderRoute：主窗工具库留在页内，不唤窗、不跳首页', () => {
  const h = routerHarness({ mainDesktop: true });
  h.eval("renderRoute({name:'toolhub',arg:null})");
  assert.deepEqual(h.sandbox.__winCalls, []);
  assert.equal(h.eval('_route.name'), 'toolhub');
  assert.equal(h.elements['view-toolhub'].classList.contains('active'), true);
  assert.equal(h.elements['sidebar'].classList.contains('hidden'), false);
});

test('renderRoute：主窗具体工具/工作区唤窗后落在工具库页', () => {
  const h = routerHarness({ mainDesktop: true });
  h.eval("renderRoute({name:'tool',arg:'primer'})");
  assert.deepEqual(h.sandbox.__winCalls, ['primer']);
  assert.equal(h.sandbox.__replace, '#/toolhub');
  assert.equal(h.eval('_route.name'), 'toolhub');
  assert.equal(h.elements['view-toolhub'].classList.contains('active'), true);
  h.eval("renderRoute({name:'crop',arg:null})");
  assert.deepEqual(h.sandbox.__winCalls, ['primer', 'crop']);
});

test('非主窗（浏览器演示 / 工具窗口）：工具路由保持原样', () => {
  const h = routerHarness({ mainDesktop: false });
  h.eval("renderRoute({name:'tool',arg:'primer'})");
  assert.deepEqual(h.sandbox.__winCalls, []);
  assert.deepEqual(h.sandbox.__rendered, ['primer']);
});

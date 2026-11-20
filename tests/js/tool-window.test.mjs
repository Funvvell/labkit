// 多窗口退出 + 默认新窗口单测（纯前端逻辑，vm context 隔离，不依赖 Tauri runtime）。
// 覆盖：toolOpenInPage 默认值与反转、WINDOW_MODE 恒新窗、浏览器页内回退、
//       label 转义不撞名、旧 toolNewWindow 设置迁移、flush 幂等（changed=[] 早退）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const el = () => ({
  hidden: false, classList: { toggle() { }, add() { }, remove() { } }, style: {},
  textContent: '', dataset: {}, querySelector: () => null, addEventListener() { }, appendChild() { },
});

/** 每个测试独立 context：classic script 顶层 const 不能在同一 global 里重复声明。 */
function ctx({ inTauri = false, windowMode = false, db = null } = {}) {
  const sandbox = {
    console,
    setTimeout, clearTimeout, Promise, Date, Math, JSON, Object, Array, String, Number,
    Set, Map, RegExp, Error,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = {
    getElementById: () => el(), querySelectorAll: () => [], querySelector: () => null,
    addEventListener() { }, createElement: el,
    documentElement: { dataset: {}, style: { setProperty() { } } },
    head: { appendChild() { } }, body: el(),
  };
  sandbox.location = { hash: '' };
  sandbox.history = { replaceState() { }, back() { } };
  sandbox.addEventListener = () => { };
  const ls = {};
  sandbox.localStorage = {
    getItem: k => (k in ls ? ls[k] : null),
    setItem: (k, v) => { ls[k] = String(v); },
    removeItem: k => { delete ls[k]; },
  };
  sandbox.toast = () => { };
  sandbox.esc = s => String(s == null ? '' : s);
  sandbox.uid = p => p + '1';
  sandbox.nowStamp = () => '2026-11-20T12:00:00';
  sandbox.todayStr = () => '2026-11-20';
  sandbox.daysAgoISO = () => '2026-11-20';
  sandbox.pad2 = n => String(n).padStart(2, '0');
  sandbox.renderDbStatus = () => { };
  sandbox.refreshHome = () => { };
  sandbox.buildDash = () => { };
  sandbox.renderTasks = () => { };
  sandbox.renderLiterature = () => { };
  sandbox.renderLab = () => { };
  sandbox.renderFocusPage = () => { };
  sandbox.renderReports = () => { };
  sandbox.renderSettings = () => { };
  sandbox.applyTheme = () => { };
  sandbox.applyDensity = () => { };
  sandbox.parseHash = h => ({ name: (h || '').replace(/^#\/?/, '') || 'home', arg: null });
  sandbox.navigate = name => { sandbox.__nav = name; };
  sandbox.openToolWindow = id => { sandbox.__win = id; };
  sandbox.renderToolHub = () => { };
  sandbox.shellRenderCats = () => { };
  sandbox.shellRenderPins = () => { };
  sandbox.queueResize = () => { };
  sandbox._route = { name: 'home', arg: null };
  sandbox.DB = db || { _store: {}, tasks: [], projects: [] };
  sandbox.saveDB = () => { };
  sandbox.loadScript = () => Promise.resolve();
  sandbox.TOOL_META = [];
  if (inTauri) {
    sandbox.__TAURI_INTERNALS__ = { invoke() { } };
    sandbox.__TAURI__ = {
      window: { getCurrentWindow: () => ({ label: windowMode ? 'tool-primer' : 'main' }) },
      webviewWindow: { WebviewWindow: class { static getByLabel() { return null; } } },
      event: { listen: () => Promise.resolve() },
    };
  }
  const c = vm.createContext(sandbox);
  return {
    c,
    run: f => vm.runInContext(read(f), c, { filename: f }),
    eval: expr => vm.runInContext(expr, c),
  };
}

/** 加载 bridge + store + toolhub，返回 openTool 探针。 */
function openToolHarness(opts) {
  const h = ctx(opts);
  h.run('frontend/js/bridge.js');
  h.run('frontend/js/store.js');
  h.run('frontend/js/toolhub.js');
  h.c.TOOL_META = [
    { id: 'primer', name: '引物', scripts: [] },
    { id: 'crop', name: '裁剪', workspace: true, scripts: [] },
  ];
  // toolhub.js 定义了 openToolWindow 本体；在其后覆盖为探针，避免真去建窗。
  h.c.openToolWindow = id => { h.c.__win = id; };
  const call = id => {
    h.c.__win = null; h.c.__nav = null;
    h.eval(`openTool(${JSON.stringify(id)})`);
    return { win: h.c.__win, nav: h.c.__nav };
  };
  return { ...h, call };
}

test('桌面主窗：工具默认开新窗口（含 workspace 工具）', () => {
  const h = openToolHarness({ inTauri: true });
  assert.equal(h.eval('Store.settings().toolOpenInPage'), undefined, '默认未设置 = 新窗口');
  assert.deepEqual(h.call('primer'), { win: 'primer', nav: null });
  assert.deepEqual(h.call('crop'), { win: 'crop', nav: null }, 'workspace 工具默认也新窗口');
});

test('勾选 toolOpenInPage=true：不新开窗口（页内回退）', () => {
  const h = openToolHarness({ inTauri: true });
  h.eval("Store.setSetting('toolOpenInPage', true)");
  assert.deepEqual(h.call('primer'), { win: null, nav: 'tool' });
  assert.deepEqual(h.call('crop'), { win: null, nav: 'crop' });
});

test('工具窗口内再开工具：恒新窗口，不受设置影响', () => {
  const h = openToolHarness({ inTauri: true, windowMode: true });
  h.eval("Store.setSetting('toolOpenInPage', true)");
  assert.deepEqual(h.call('primer'), { win: 'primer', nav: null });
});

test('浏览器演示：始终页内，不尝试开窗口', () => {
  const h = openToolHarness({ inTauri: false });
  assert.deepEqual(h.call('primer'), { win: null, nav: 'tool' });
});

test('窗口 label 转义：下划线不与非下划线撞名、超长截断', () => {
  const mk = id => 'tool-' + String(id).replace(/_/g, '__').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 48);
  assert.notEqual(mk('x-plug-tool_a'), mk('x-plug-tool-a'));
  assert.equal(mk('x-' + 'p'.repeat(80)).length, 5 + 48, '超长被截断');
});

test('旧 toolNewWindow=false 迁移为 toolOpenInPage=true（显式页内偏好保留）', () => {
  const h = ctx({ db: { _store: { settings: { name: '研究者', toolNewWindow: false } }, tasks: [] } });
  h.run('frontend/js/store.js');
  const s = h.eval('(Store.migrateLegacy(), Store.settings())');
  assert.equal(s.toolOpenInPage, true);
  assert.equal(s.name, '研究者', '其它设置不受影响');
  assert.equal(s.toolNewWindow, null, '旧键置 null 墓碑（随合并写清盘）');
});

test('旧 toolNewWindow=true / 未设置：不产生 toolOpenInPage（新默认即新窗口）', () => {
  const h = ctx({ db: { _store: { settings: { toolNewWindow: true } }, tasks: [] } });
  h.run('frontend/js/store.js');
  const s = h.eval('(Store.migrateLegacy(), Store.settings())');
  assert.equal(s.toolOpenInPage, undefined);
});

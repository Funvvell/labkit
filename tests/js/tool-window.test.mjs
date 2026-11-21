// 工具箱多标签页 + 多窗口单测（纯前端逻辑，vm context 隔离，不依赖 Tauri runtime）。
// 覆盖：主窗只唤起 tools 窗口、工具箱/浏览器页内路由、分离窗口保留、
//       label 转义、旧 toolOpenInPage / toolNewWindow 设置墓碑迁移。
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
function ctx({ inTauri = false, label = 'main', db = null } = {}) {
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
  sandbox.navigate = (name, arg) => { sandbox.__nav = { name, arg: arg || null }; };
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
    const wins = [];
    const registry = new Map();
    let ackCb = null;
    class WebviewWindow {
      constructor(id, opts) {
        wins.push({ id, opts }); this._id = id; registry.set(id, this);
        this.focused = 0;
      }
      static async getByLabel(label) { return registry.get(label) || null; }
      once() { }
      async show() { }
      async unminimize() { }
      async setFocus() { this.focused++; }
    }
    sandbox.__TAURI__ = {
      window: { getCurrentWindow: () => ({ label, close: () => Promise.resolve() }) },
      webviewWindow: { WebviewWindow },
      event: {
        listen: (name, cb) => { if (name === 'labkit:toolbox-ack') ackCb = cb; return Promise.resolve(() => { }); },
        emit: (name, payload) => {
          sandbox.__emit = { name, payload };
          if (name === 'labkit:toolbox-open' && ackCb) ackCb({ payload: { nonce: payload.nonce } });
          return Promise.resolve();
        },
      },
    };
    sandbox.__wins = wins;
    sandbox.__registry = registry;
  }
  const c = vm.createContext(sandbox);
  return {
    c,
    run: f => vm.runInContext(read(f), c, { filename: f }),
    eval: expr => vm.runInContext(expr, c),
  };
}

/** 加载 bridge + store + toolbox + toolhub + tabs，返回 openTool 探针。 */
function harness(opts) {
  const h = ctx(opts);
  h.run('frontend/js/bridge.js');
  h.run('frontend/js/store.js');
  h.run('frontend/js/toolbox.js');
  h.run('frontend/js/toolhub.js');
  h.run('frontend/js/tabs.js');
  h.c.TOOL_META = [
    { id: 'primer', name: '引物', scripts: [] },
    { id: 'crop', name: '裁剪', workspace: true, scripts: [] },
  ];
  h.c.__openToolboxWindow = h.c.openToolboxWindow;
  h.c.openToolboxWindow = id => { h.c.__box = id === undefined ? null : id; };
  const call = id => {
    h.c.__box = '__none__'; h.c.__nav = null;
    h.eval(`openTool(${JSON.stringify(id)})`);
    return { box: h.c.__box === '__none__' ? null : h.c.__box, nav: h.c.__nav };
  };
  return { ...h, call };
}

test('桌面主窗：所有工具（含 workspace）都唤起工具箱窗口，不直接建工具窗', () => {
  const h = harness({ inTauri: true });
  assert.deepEqual(h.call('primer'), { box: 'primer', nav: null });
  assert.deepEqual(h.call('crop'), { box: 'crop', nav: null });
});

test('工具箱窗口：工具与工作区都在页内标签路由打开', () => {
  const h = harness({ inTauri: true, label: 'tools' });
  assert.equal(h.eval('TOOLBOX_WIN'), true);
  assert.deepEqual(h.call('primer'), { box: null, nav: { name: 'tool', arg: 'primer' } });
  assert.deepEqual(h.call('crop'), { box: null, nav: { name: 'crop', arg: null } });
});

test('浏览器演示：页内标签路由，不尝试建窗', () => {
  const h = harness({ inTauri: false });
  assert.deepEqual(h.call('primer'), { box: null, nav: { name: 'tool', arg: 'primer' } });
  assert.deepEqual(h.call('crop'), { box: null, nav: { name: 'crop', arg: null } });
});

test('分离工具窗口内再开工具：回到工具箱，不叠加第二个分离窗', () => {
  const h = harness({ inTauri: true, label: 'tool-primer' });
  assert.equal(h.eval('DETACHED_WIN'), true);
  assert.deepEqual(h.call('crop'), { box: 'crop', nav: null });
});

test('openToolWindow 仍创建 tool-* 分离窗口，label 转义不撞名', async () => {
  const h = harness({ inTauri: true });
  h.c.TOOL_META = [{ id: 'x_plug-tool/a', name: '插件工具', scripts: [] }];
  await h.eval("openToolWindow('x_plug-tool/a')");
  const w = h.c.__wins[h.c.__wins.length - 1];
  assert.equal(w.id, 'tool-x__plug-tool-a');
  assert.equal(w.opts.url, 'index.html#/tool/x_plug-tool/a');
  assert.equal(w.opts.visible, false, 'visible:false 防白窗');
});

test('openToolboxWindow：首次为工具建 tools 窗口，第二次复用并只发标签事件', async () => {
  const h = harness({ inTauri: true });
  await h.eval("__openToolboxWindow('primer')");
  assert.equal(h.c.__wins.length, 1, '首次只建一个窗口');
  assert.equal(h.c.__wins[0].id, 'tools');
  assert.equal(h.c.__wins[0].opts.url, 'index.html#/tool/primer', 'url 直达该工具');
  assert.equal(h.c.__wins[0].opts.visible, false);
  const w = h.c.__registry.get('tools');
  await h.eval("__openToolboxWindow('crop')");
  assert.equal(h.c.__wins.length, 1, '第二次不得再建窗');
  assert.equal(h.c.__emit.name, 'labkit:toolbox-open');
  assert.equal(h.c.__emit.payload.id, 'crop', '复用窗口只发标签事件');
  assert.equal(w.focused, 1, '复用前先聚焦已有窗口');
});

test('旧 toolOpenInPage / toolNewWindow 均置 null 墓碑，其它设置保留', () => {
  const h = ctx({ db: { _store: { settings: { name: '研究者', toolOpenInPage: true, toolNewWindow: false } }, tasks: [] } });
  h.run('frontend/js/store.js');
  const s = h.eval('(Store.migrateLegacy(), Store.settings())');
  assert.equal(s.toolOpenInPage, null);
  assert.equal(s.toolNewWindow, null);
  assert.equal(s.name, '研究者', '其它设置不受影响');
});

test('新默认：restoreTabs 未设置时视为恢复（!== false）', () => {
  const h = ctx({ db: { _store: {}, tasks: [] } });
  h.run('frontend/js/store.js');
  assert.equal(h.eval('Store.settings().restoreTabs'), undefined);
});

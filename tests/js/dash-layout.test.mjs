// P2 Dashboard 布局单测：v2 迁移保序保尺寸 / 非法回退 / 序列化往返 / 尺寸吸附 / 自动落位 / 尺寸档。
// dashboard.js 是 classic script，用 vm 共享全局加载；这里只测纯布局逻辑，不触 GridStack/DOM 渲染。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
globalThis.addEventListener = () => { };
const mkEl = () => ({
  onclick: null, style: {}, dataset: {},
  classList: { toggle() { }, add() { }, remove() { }, contains: () => false },
  addEventListener() { }, setAttribute() { }, querySelector: () => null, querySelectorAll: () => [],
});
const elements = {};
globalThis.document = {
  getElementById: id => elements[id] || (elements[id] = mkEl()),
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener() { }, createElement: () => mkEl(),
};
const lsBag = {};
globalThis.localStorage = {
  getItem: k => (k in lsBag ? lsBag[k] : null),
  setItem(k, v) { lsBag[k] = String(v); },
  removeItem(k) { delete lsBag[k]; },
};
// 布局现在随台账落盘：给 Store 一个内存桩，验证 saveDash 写台账而非 localStorage。
const storeBag = {};
globalThis.Store = {
  get(k, d) { return Object.prototype.hasOwnProperty.call(storeBag, k) ? storeBag[k] : d; },
  set(k, v) { storeBag[k] = v; },
};
vm.runInThisContext(fs.readFileSync(path.join(root, 'frontend/js/dashboard.js'), 'utf8'), { filename: 'frontend/js/dashboard.js' });

/* 矩形两两相交检测（网格坐标） */
function hasOverlap(nodes) {
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) return true;
  }
  return false;
}
function inBounds(nodes) {
  return nodes.every(n => n.x >= 0 && n.y >= 0 && n.x + n.w <= 4 && n.w >= 1 && n.h >= 1);
}

test('老数组布局迁移：保序、保尺寸、无重叠、不越界', () => {
  const legacy = [
    { id: 'kpi', size: '4x2' }, { id: 'tasks', size: '2x4' }, { id: 'focus', size: '2x2' },
    { id: 'deadlines', size: '1x2' }, { id: 'reagents', size: '1x2' },
  ];
  const nodes = migrateLayout(legacy);
  assert.deepEqual(nodes.map(n => n.id), legacy.map(x => x.id));
  nodes.forEach((n, i) => {
    const p = parseSize(legacy[i].size);
    assert.equal(n.w, p.w); assert.equal(n.h, p.h);
  });
  assert.equal(hasOverlap(nodes), false);
  assert.equal(inBounds(nodes), true);
});

test('更老的 s/m/l 三档：映射到 1x2 / 2x2 / 4x2 后落位', () => {
  const nodes = migrateLayout([{ id: 'reagents', size: 's' }, { id: 'budget', size: 'm' }, { id: 'kpi', size: 'l' }]);
  assert.deepEqual(nodes.map(n => [n.w, n.h]), [[1, 2], [2, 2], [4, 2]]);
  assert.equal(hasOverlap(nodes), false);
});

test('v2 布局往返：序列化 → 迁移后节点一致；非法坐标被夹回网格', () => {
  const v2 = { v: 2, nodes: [{ id: 'kpi', x: 0, y: 0, w: 4, h: 2 }, { id: 'qpcr', x: 0, y: 2, w: 1, h: 1 }] };
  const nodes = migrateLayout(JSON.parse(JSON.stringify(v2)));
  assert.deepEqual(nodes, v2.nodes);
  const clamped = migrateLayout({ v: 2, nodes: [{ id: 'kpi', x: 9, y: -3, w: 4, h: 2 }] });
  assert.deepEqual(clamped, [{ id: 'kpi', x: 0, y: 0, w: 4, h: 2 }]);
});

test('非法 / 未知数据回退 null（交由默认布局兜底）', () => {
  assert.equal(migrateLayout(null), null);
  assert.equal(migrateLayout('oops'), null);
  assert.equal(migrateLayout({ foo: 1 }), null);
  assert.equal(migrateLayout({ v: 2, nodes: 'x' }), null);
});

test('老格式过滤未知 id；v2 保留未知 id 占位（插件停用再启用不丢布局），重复 id 去重', () => {
  const a = migrateLayout([{ id: 'kpi', size: '4x2' }, { id: 'ghost', size: '2x2' }, { id: 'kpi', size: '2x2' }]);
  assert.deepEqual(a.map(n => n.id), ['kpi']);
  const b = migrateLayout({ v: 2, nodes: [{ id: 'qpcr', x: 0, y: 0, w: 1, h: 1 }, { id: 'ghost', x: 1, y: 0, w: 1, h: 1 }, { id: 'qpcr', x: 2, y: 0, w: 1, h: 1 }] });
  assert.deepEqual(b.map(n => n.id), ['qpcr', 'ghost'], 'v2 应保留未知插件节点占位');
  assert.ok(WCOLS.includes(b[1].w) && HROWS.includes(b[1].h), '未知节点尺寸夹回规范格');
});

test('空 v2 布局是合法状态（用户删光卡片），不回退默认', () => {
  assert.deepEqual(migrateLayout({ v: 2, nodes: [] }), []);
});

test('DEFAULT_LAYOUT 自动落位：11 张卡、无重叠、不越界', () => {
  const nodes = autoPlace(DEFAULT_LAYOUT);
  assert.equal(nodes.length, 11);
  assert.equal(hasOverlap(nodes), false);
  assert.equal(inBounds(nodes), true);
});

test('findSpot：行扫描找第一个空位', () => {
  const nodes = [{ id: 'kpi', x: 0, y: 0, w: 4, h: 2 }];
  assert.deepEqual(findSpot(nodes, 2, 2), { x: 0, y: 2 });
  assert.deepEqual(findSpot(nodes, 4, 2), { x: 0, y: 2 });
  const half = [{ id: 'tasks', x: 0, y: 0, w: 2, h: 4 }];
  assert.deepEqual(findSpot(half, 2, 2), { x: 2, y: 0 });
});

test('snapSize：声明档直通；未声明 / 越界吸附到最近声明档', () => {
  assert.deepEqual(snapSize('reagents', 1, 2), { w: 1, h: 2 });
  assert.deepEqual(snapSize('kpi', 4, 4), { w: 4, h: 4 });
  /* kpi 只声明 4xN：宽 2 应吸到 4 */
  assert.deepEqual(snapSize('kpi', 2, 2), { w: 4, h: 2 });
  /* reagents 没有 4x4：吸到最近声明档 */
  const s = snapSize('reagents', 4, 4);
  assert.ok((WIDGETS.reagents.sizes || []).includes(s.w + 'x' + s.h));
  /* 越界宽 3 → 规范格 2 或 4，再吸附 */
  const t = snapSize('budget', 3, 9);
  assert.ok(WCOLS.includes(t.w) && HROWS.includes(t.h));
});

test('sizeTier：mini/small/medium/large 边界；无参按 medium', () => {
  assert.equal(sizeTier({ w: 1, h: 1 }), 'mini');
  assert.equal(sizeTier({ w: 1, h: 2 }), 'small');
  assert.equal(sizeTier({ w: 2, h: 1 }), 'small');
  assert.equal(sizeTier({ w: 2, h: 2 }), 'medium');
  assert.equal(sizeTier({ w: 2, h: 3 }), 'medium');
  assert.equal(sizeTier({ w: 4, h: 2 }), 'large');
  assert.equal(sizeTier({ w: 2, h: 4 }), 'large');
  assert.equal(sizeTier(), 'medium');
});

test('WIDGETS 自洽：sizes 含默认尺寸、全部可解析；body(size) 每档都输出字符串', () => {
  for (const [id, d] of Object.entries(WIDGETS)) {
    assert.ok(Array.isArray(d.sizes) && d.sizes.length >= 1, id + ' sizes');
    assert.ok(d.sizes.includes(d.size), id + ' 默认尺寸必须在 sizes 内');
    for (const s of d.sizes) {
      const p = parseSize(s);
      assert.ok(p, id + ' ' + s + ' 可解析');
      assert.ok(WCOLS.includes(p.w) && HROWS.includes(p.h), id + ' ' + s + ' 在规范格内');
      const html = d.body(p);
      assert.equal(typeof html, 'string', id + ' body(' + s + ')');
      assert.ok(html.length > 0, id + ' body(' + s + ') 非空');
    }
  }
});

test('saveDash：布局写入台账（Store）并清除旧 localStorage 键，读回迁移后一致', () => {
  lsBag[DASH_KEY] = JSON.stringify({ v: 2, nodes: [{ id: 'kpi', x: 0, y: 0, w: 4, h: 2 }] });
  saveDash();
  const raw = Store.get('dashLayout', null);
  assert.ok(raw, '布局必须进台账而非只留 localStorage');
  assert.equal(raw.v, 2);
  assert.ok(Array.isArray(raw.nodes));
  assert.deepEqual(migrateLayout(raw), dashLayout);
  assert.equal(lsBag[DASH_KEY], undefined, '迁移完成后旧键应清除');
});

test('坏卡片注册被拒：registerWidget 缺 body 函数不得进入 WIDGETS', () => {
  // 渲染侧对无 body 的卡片跳过；注册侧直接拒绝，双保险防整页 Dashboard 崩溃。
  const src = fs.readFileSync(path.join(root, 'frontend/js/plugins.js'), 'utf8');
  assert.ok(src.includes("typeof def.body !== 'function'"), 'registerWidget 必须校验 body');
  const dash = fs.readFileSync(path.join(root, 'frontend/js/dashboard.js'), 'utf8');
  assert.ok(dash.includes("typeof def.body!=='function'"), '渲染器必须跳过无 body 卡片');
});

/* ---------------- 响应式列数：布局永远以 4 列规范坐标存储 ---------------- */

const CANON = [
  { id: 'kpi', x: 0, y: 0, w: 4, h: 2 },
  { id: 'tasks', x: 0, y: 2, w: 2, h: 4 },
  { id: 'focus', x: 2, y: 2, w: 2, h: 2 },
  { id: 'deadlines', x: 2, y: 4, w: 1, h: 2 },
  { id: 'reagents', x: 3, y: 4, w: 1, h: 2 },
  { id: 'notes', x: 0, y: 6, w: 2, h: 1 },
];

function overlapIn(nodes, cols) {
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) return `${a.id}/${b.id}`;
  }
  return null;
}

test('dashColsFor：按容器宽度分档，阈值与 CSS 断点一致', () => {
  assert.equal(dashColsFor(1200), 4);
  assert.equal(dashColsFor(900), 4);
  assert.equal(dashColsFor(899), 2);
  assert.equal(dashColsFor(560), 2);
  assert.equal(dashColsFor(559), 1);
  assert.equal(dashColsFor(320), 1);
});

test('renderCoords 4 列：原样返回规范坐标', () => {
  const m = renderCoords(CANON, 4);
  CANON.forEach(n => assert.deepEqual(m.get(n.id), { x: n.x, y: n.y, w: n.w, h: n.h }));
});

test('renderCoords 降列：不越界、不重叠、保持阅读顺序', () => {
  for (const cols of [2, 1]) {
    const m = renderCoords(CANON, cols);
    const arr = [...m.values()];
    assert.equal(arr.length, CANON.length, `${cols} 列不得丢卡片`);
    arr.forEach(n => {
      assert.ok(n.x >= 0 && n.y >= 0, `${cols} 列坐标非负`);
      assert.ok(n.x + n.w <= cols, `${cols} 列不得越界：${JSON.stringify(n)}`);
      assert.ok(n.w >= 1 && n.h >= 1);
    });
    assert.equal(overlapIn(arr, cols), null, `${cols} 列不得重叠`);
    // 只往下落位，y 单调不减 = 阅读顺序不被打乱
    for (let i = 1; i < arr.length; i++) assert.ok(arr[i].y >= arr[i - 1].y, `${cols} 列顺序被打乱`);
  }
});

test('renderCoords 是纯函数：绝不改写规范布局（降列回写会毁掉用户布局）', () => {
  const before = JSON.stringify(CANON);
  renderCoords(CANON, 2); renderCoords(CANON, 1); renderCoords(CANON, 4);
  assert.equal(JSON.stringify(CANON), before);
});

test('窄→宽往返：规范坐标逐字节复原，用户布局不因 resize 变形', () => {
  const saved = JSON.stringify(CANON);
  // 模拟渲染期降列再升列：存储侧始终是同一份规范坐标
  renderCoords(CANON, 1);
  renderCoords(CANON, 2);
  const back = renderCoords(CANON, 4);
  assert.equal(JSON.stringify(CANON), saved);
  CANON.forEach(n => assert.deepEqual(back.get(n.id), { x: n.x, y: n.y, w: n.w, h: n.h }));
});

test('降列模式下禁止拖拽/改尺寸回写，且编辑入口被拦住', () => {
  const src = fs.readFileSync(path.join(root, 'frontend/js/dashboard.js'), 'utf8');
  assert.ok(/function onGsChange\(ev,items\)\{\s*\n\s*if\(!_gsReady\|\|!_gs\|\|_gsCols<4\)return/.test(src),
    'onGsChange 必须在降列时跳过回写');
  assert.ok(/function onGsResizeStop\(ev,el\)\{\s*\n\s*if\(_gsCols<4\)return/.test(src),
    'onGsResizeStop 必须在降列时跳过回写');
  assert.ok(src.includes('const editable=dashEdit&&_gsCols>=4'), '降列时引擎必须禁用拖拽/缩放');
  assert.ok(/function enterDashEdit\(\)\{[\s\S]{0,120}_gsCols<4/.test(src), '窄容器下进入编辑必须被拦住并提示');
});

test('1 列时所有卡片归一为单列宽，但规范宽度仍是 1/2/4', () => {
  const m = renderCoords(CANON, 1);
  [...m.values()].forEach(n => assert.equal(n.w, 1));
  assert.deepEqual(CANON.map(n => n.w), [4, 2, 2, 1, 1, 2], '规范宽度不得被降列改写');
});
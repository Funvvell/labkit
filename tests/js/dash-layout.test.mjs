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

test('未知卡片 id 过滤、重复 id 去重（v2 与老格式都适用）', () => {
  const a = migrateLayout([{ id: 'kpi', size: '4x2' }, { id: 'ghost', size: '2x2' }, { id: 'kpi', size: '2x2' }]);
  assert.deepEqual(a.map(n => n.id), ['kpi']);
  const b = migrateLayout({ v: 2, nodes: [{ id: 'qpcr', x: 0, y: 0, w: 1, h: 1 }, { id: 'ghost', x: 1, y: 0, w: 1, h: 1 }, { id: 'qpcr', x: 2, y: 0, w: 1, h: 1 }] });
  assert.deepEqual(b.map(n => n.id), ['qpcr']);
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

test('saveDash：写入 {v:2,nodes}，读回迁移后与当前布局一致', () => {
  saveDash();
  const raw = JSON.parse(lsBag[DASH_KEY]);
  assert.equal(raw.v, 2);
  assert.ok(Array.isArray(raw.nodes));
  assert.deepEqual(migrateLayout(raw), dashLayout);
});
// D1 绘图器内核对数测试（arquero 聚合 + 误差棒 + 显著性 + 四分位 linear 法）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
for (const f of [
  'vendor/arquero.min.js',
  'vendor/stdlib-stats.bundle.js',
  'vendor/simple-statistics.min.js',
  'tools/lib/scipy-mwu.js',
  'tools/lib/stats-engine.js',
  'tools/lib/colors.js',
  'tools/qpcr-plots.js',
  'tools/plotter.js',
].map(x => 'frontend/' + x)) vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
const C = globalThis.PlotterCore;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

const rows = [];
[[0, 'Ctrl', [1.02, 0.98, 1.05, 0.97, 1.01, 1.00]], [10, 'Low', [1.32, 1.28, 1.41, 1.25, 1.36, 1.30]], [50, 'High', [2.10, 2.25, 1.98, 2.31, 2.05, 2.18]]]
  .forEach(([d, g, vs]) => vs.forEach(v => rows.push({ dose: String(d), group: g, response: v })));

test('arquero 聚合：均值/SD/n 与手算一致', () => {
  const { xs, gs, cells } = C.aggregate(rows, 'dose', 'response', 'group');
  assert.deepEqual(xs, ['0', '10', '50']);
  assert.deepEqual(gs, ['Ctrl', 'Low', 'High']);
  assert.equal(cells.length, 9);
  const c = cells.find(c => c.x === '0' && c.g === 'Ctrl');
  near(c.mean, 1.005, 1e-9, 'mean');
  assert.equal(c.n, 6);
  near(c.sd, 0.028809720581775878, 1e-9, 'sd'); // numpy ddof=1
});
test('误差棒 SD/SEM/CI95/none', () => {
  const { cells } = C.aggregate(rows, 'dose', 'response', 'group');
  const c = cells.find(c => c.x === '0' && c.g === 'Ctrl');
  near(C.errOf(c, 'SD'), c.sd, 1e-12, 'SD');
  near(C.errOf(c, 'SEM'), c.sd / Math.sqrt(6), 1e-12, 'SEM');
  near(C.errOf(c, 'CI95'), globalThis.QpcrPlots._internal.tCrit95(5) * c.sd / Math.sqrt(6), 1e-9, 'CI95');
  assert.equal(C.errOf(c, 'none'), 0);
});
test('显著性两两 p 与 B3 引擎一致', () => {
  const r2 = [];
  ['A', 'B'].forEach(g => [1, 2, 3, 4, 5].forEach(v => r2.push({ time: '1', group: g, y: v + (g === 'B' ? 3 : 0) })));
  const { cells, gs } = C.aggregate(r2, 'time', 'y', 'group');
  const pairs = C.pairwiseP(cells, '1', gs, 't');
  assert.equal(pairs.length, 1);
  const direct = globalThis.statsEngine.ttestInd([1, 2, 3, 4, 5], [4, 5, 6, 7, 8]);
  near(pairs[0].p, direct.p, 1e-12, 'p');
  const mw = C.pairwiseP(cells, '1', gs, 'mwu');
  near(mw[0].p, globalThis.statsEngine.mwu([1, 2, 3, 4, 5], [4, 5, 6, 7, 8]).p, 1e-12, 'mwu p');
});
test('四分位 linear 法与 numpy percentile 默认一致（R-7）', () => {
  const q = globalThis.statsEngine.quantile;
  near(q([1, 2, 3, 4], 0.25), 1.75, 1e-12, 'q25');
  near(q([1, 2, 3, 4], 0.75), 3.25, 1e-12, 'q75');
  near(q([1, 2, 3, 4, 5], 0.5), 3, 1e-12, 'median');
});
test('无分组聚合', () => {
  const { gs, cells } = C.aggregate(rows, 'dose', 'response', null);
  assert.deepEqual(gs, ['']);
  assert.equal(cells.length, 3);
  assert.equal(cells[0].n, 6);
});
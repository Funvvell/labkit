// C7 qpcr-plots 纯函数对数测试（Plotly 渲染需 DOM，此处验证统计/变换内核）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(root, 'frontend/tools/qpcr-plots.js'), 'utf8'));
const I = globalThis.QpcrPlots._internal;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test('tCrit95：df=24 → 2.0639（scipy t.ppf(.975,24)）', () => {
  near(I.tCrit95(24), 2.0638985616280205, 1e-5, 'tcrit');
  near(I.tCrit95(1), 12.706204736432095, 1e-3, 'tcrit df1');
});
test('tCdf 对称性与已知值', () => {
  near(I.tCdf(0, 10), 0.5, 1e-9, 'tCdf(0)');
  near(I.tCdf(2.228, 10), 0.975, 1e-3, 'tCdf 临界');
});
test('cellStats：SD/SEM/CI95', () => {
  const v = [2, 4, 4, 4, 5, 5, 7, 9];
  const sd = I.cellStats(v, 'SD');
  near(sd.m, 5, 1e-12, 'mean');
  near(sd.sd, 2.138089935299395, 1e-9, 'sd'); // numpy std ddof=1
  const sem = I.cellStats(v, 'SEM');
  near(sem.err, sd.sd / Math.sqrt(8), 1e-12, 'sem');
  const ci = I.cellStats(v, 'CI95');
  near(ci.err, I.tCrit95(7) * sem.err, 1e-9, 'ci');
});
test('log2Err 非对称误差棒', () => {
  const r = I.log2Err(2, 1); // FC=2±1 → log2: 1, 上 log2(3)-1, 下 1-log2(1)=1
  near(r.y, 1, 1e-12, 'y');
  near(r.up, Math.log2(3) - 1, 1e-12, 'up');
  near(r.down, 1, 1e-12, 'down');
  const z = I.log2Err(0.2, 0.5); // 下界截断到 1e-6
  assert.ok(z.down > 0 && Number.isFinite(z.down));
});
test('星号阈值', () => {
  assert.equal(I.starOf(0.0005), '***');
  assert.equal(I.starOf(0.005), '**');
  assert.equal(I.starOf(0.04), '*');
  assert.equal(I.starOf(0.2), 'ns');
});
test('期刊布局：Arial + 白底 + Okabe-Ito', () => {
  const L = globalThis.QpcrPlots.journalLayout();
  assert.ok(L.font.family.includes('Arial'));
  assert.equal(L.paper_bgcolor, '#fff');
  assert.equal(globalThis.QpcrPlots.PALETTE[0], '#0072B2');
});
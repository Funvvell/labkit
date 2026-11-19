// OpenEpi 复用层回归测试：node --test tests/js/openepi.test.mjs
// 基准向量来自 OpenEpi 模块自带 Demo（SSPropor 384）与解析解（OR/RR）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const oe = path.join(root, 'frontend/vendor/openepi');
globalThis.window = globalThis;
const files = [
  path.join(oe, 'openepi-shim.js'),
  path.join(oe, 'StatFunctions1.js'),
  path.join(oe, 'OECommands.js'),
  path.join(oe, 'MartinStats.js'),
  ...['TwobyTwo', 'SSPropor', 'SSCC', 'SSCohort', 'SSMean', 'PowerCC', 'PowerCohort', 'PowerRCT', 'PowerCross', 'PowerMean']
    .map(n => path.join(oe, 'modules', n + '.js')),
  path.join(root, 'frontend/tools/lib/openepi-adapter.js'),
];
for (const f of files) vm.runInThisContext(readFileSync(f, 'utf8'), { filename: f });
const A = globalThis.OpenEpiAdapter;

test('SSPropor：50%±5%，95%CI，大人群 → 384（上游 Demo 基准）', () => {
  const html = A.runModule('SSPropor', { E0D0: 1000000, E1D0: 50, E2D0: 5, E3D0: 1 });
  assert.match(html, /384/);
});

test('SSPropor：设计效应 1.8 → 384*1.8 向上取整 692', () => {
  const html = A.runModule('SSPropor', { E0D0: 1000000, E1D0: 50, E2D0: 5, E3D0: 1.8 });
  assert.match(html, /692/);
});

test('TwobyTwo：a10 b20 c30 d40 → OR=0.6667，RR=0.75', () => {
  const html = A.run2x2([[10, 20, 30, 40]]);
  assert.match(html, /0\.6667/);
  assert.match(html, /0\.75/);
});

test('TwobyTwo：分层两相同层 → MH 调整 OR 等于粗 OR', () => {
  const html = A.run2x2([[10, 20, 30, 40], [10, 20, 30, 40]]);
  assert.match(html, /Mantel-Haenszel/i);
  assert.match(html, /0\.6667/);
});

test('TwobyTwo：零单元格触发 Fisher 精确', () => {
  const html = A.run2x2([[0, 5, 10, 15]]);
  assert.match(html, /Fisher/i);
});

test('SSCC：p0=10% p1=20% 95/80 1:1 → 含样本量输出', () => {
  const html = A.runModule('SSCC', { E0D0: 95, E1D0: 80, E2D0: 1, E3D0: 10, E5D0: 2.25, E6D0: 20 });
  assert.match(html, /Sample Size/i);
  assert.match(html, /\d{2,4}/);
});

test('PowerRCT：n1=n2=100，20% vs 10% → 输出 power 百分数', () => {
  const html = A.runModule('PowerRCT', { E0D0: 95, E2D0: 100, E2D1: 100, E3D0: 20, E3D1: 10 });
  assert.match(html, /Power based on/i);
  assert.match(html, /%/);
});

test('SSMean：两均数差值法输出样本量', () => {
  const html = A.runModule('SSMean', { E0D2: 95, E1D2: 80, E2D2: 1, E4D5: 5, E4D0: 0, E4D2: 0, E5D0: 10, E6D0: 100, E5D2: 10, E6D2: 100 });
  assert.match(html, /Sample size/i);
});

test('SSCohort：p0=10% RR=2 95/80 → 含样本量', () => {
  const html = A.runModule('SSCohort', { E0D0: 95, E1D0: 80, E2D0: 1, E5D0: 10, E7D0: 2 });
  assert.match(html, /Sample Size/i);
});

test('PowerMean：n=30/30 差值5 SD10 → 输出 power', () => {
  const html = A.runModule('PowerMean', { E0D2: 95, E2D0: 0, E2D2: 5, E2D5: -5, E3D0: 30, E3D2: 30, E4D0: 10, E4D2: 10, E5D0: 100, E5D2: 100 });
  assert.match(html, /Power/i);
  assert.match(html, /%/);
});

test('PowerCC：n1=n2=100，20% vs 10% → 输出 power', () => {
  const html = A.runModule('PowerCC', { E0D0: 95, E2D0: 100, E2D1: 100, E3D0: 20, E3D1: 10 });
  assert.match(html, /Power based on/i);
});
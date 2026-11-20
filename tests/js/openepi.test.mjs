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
// 上游输出是 HTML 表格；断言数值前先归一化成纯文本，避免正则被标签/空格切碎。
const text = h => h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

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

test('SSCohort：p0=10% RR=2 95/80 → Kelsey 201 / Fleiss 199 / Fleiss-CC 219（总 402/398/438）', () => {
  const t = text(A.runModule('SSCohort', A.deriveFields('SSCohort', { E0D0: 95, E1D0: 80, E2D0: 1, E3D0: 10, E7D0: 2 })));
  assert.doesNotMatch(t, /NaN/, '不得输出 NaN');
  assert.doesNotMatch(t, /\?/, '回显行不得为未知值');
  assert.match(t, /Percent of Unexposed with Outcome: 10/);
  assert.match(t, /Percent of Exposed with Outcome: 20/);
  assert.match(t, /Risk\/Prevalence Ratio: 2/);
  assert.match(t, /Risk\/Prevalence difference: 10/);
  assert.match(t, /Sample Size - Exposed 201 199 219/);
  assert.match(t, /Total sample size: 402 398 438/);
});

test('SSCohort 与 SSCC 交叉一致：同一 p0/p1 与 1:1 比必须给出相同样本量', () => {
  const cohort = text(A.runModule('SSCohort', A.deriveFields('SSCohort', { E0D0: 95, E1D0: 80, E2D0: 1, E3D0: 10, E7D0: 2 })));
  const cc = text(A.runModule('SSCC', A.deriveFields('SSCC', { E0D0: 95, E1D0: 80, E2D0: 1, E3D0: 10, E6D0: 20 })));
  const nums = s => (s.match(/Sample Size - (?:Exposed|Cases) (\d+) (\d+) (\d+)/) || []).slice(1);
  assert.deepEqual(nums(cohort), ['201', '199', '219']);
  assert.deepEqual(nums(cohort), nums(cc), '两模块在等价输入下必须一致');
});

test('SSCohort 非法输入必须报错，而不是产出 NaN/Infinity', () => {
  const base = { E0D0: 95, E1D0: 80, E2D0: 1, E3D0: 10, E7D0: 2 };
  assert.throws(() => A.deriveFields('SSCohort', { ...base, E7D0: 1 }), /RR = 1/);
  assert.throws(() => A.deriveFields('SSCohort', { ...base, E3D0: 60 }), /需小于 100%/);
  assert.throws(() => A.deriveFields('SSCohort', { ...base, E3D0: 0 }), /非暴露结局率/);
  assert.throws(() => A.deriveFields('SSCohort', { ...base, E3D0: NaN }), /非暴露结局率/);
});

test('SSCohort UI 字段必须接到上游真正读取的单元格（防回归）', () => {
  const src = readFileSync(path.join(root, 'frontend/tools/samplesize.js'), 'utf8');
  const block = src.slice(src.indexOf('SSCohort: {'), src.indexOf('SSMean: {'));
  const keys = [...block.matchAll(/k: '(E\dD\d)'/g)].map(m => m[1]);
  assert.ok(keys.includes('E3D0'), 'UI 必须提供 E3D0=非暴露结局率');
  assert.ok(keys.includes('E7D0'), 'UI 必须提供 E7D0=假设 RR');
  assert.ok(!keys.includes('E5D0'), 'E5D0 是上游的 OR 单元格，不能拿来当结局率');
  assert.ok(!keys.includes('E6D0'), 'E6D0 由 deriveFields 派生，不该让用户直接填');
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
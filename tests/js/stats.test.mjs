// B3 统计引擎对数测试：scipy doctest / scipy fisher_exact 文档例 / stdlib 探针 / numpy 相关系数例
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
for (const f of [
  'frontend/vendor/stdlib-stats.bundle.js',
  'frontend/vendor/simple-statistics.min.js',
  'frontend/tools/lib/scipy-mwu.js',
  'frontend/tools/lib/stats-engine.js',
]) vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
const E = globalThis.statsEngine;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (tol ${tol})`);

test('MWU 精确：scipy doctest U=17 p=0.1111111111', () => {
  const r = E.mwu([19, 22, 16, 29, 24], [20, 11, 17, 12], { method: 'exact' });
  assert.equal(r.statistic, 17);
  near(r.p, 0.1111111111111111, 1e-10, 'exact p');
  assert.equal(r.method, 'exact');
});
test('MWU 渐近：scipy doctest p=0.1113468865', () => {
  const r = E.mwu([19, 22, 16, 29, 24], [20, 11, 17, 12], { method: 'asymptotic' });
  assert.equal(r.statistic, 17);
  near(r.p, 0.11134688653314041, 1e-5, 'asymptotic p');
});
test('MWU auto 小样本无结→exact；有结→asymptotic', () => {
  assert.equal(E.mwu([19, 22, 16, 29, 24], [20, 11, 17, 12]).method, 'exact');
  const r = E.mwu([1, 2, 3, 4], [2, 3, 4, 5]);
  assert.equal(r.method, 'asymptotic');
  assert.equal(r.statistic, 4.5);
  near(r.p, 0.3779, 2e-3, 'ties p');
});
test('MWU 单侧方向', () => {
  const g = E.mwu([10, 11, 12], [1, 2, 3], { alternative: 'greater', method: 'exact' });
  const l = E.mwu([10, 11, 12], [1, 2, 3], { alternative: 'less', method: 'exact' });
  assert.ok(g.p < 0.1 && l.p > 0.9);
});
test('Fisher：[[1,9],[11,3]] 概率序双侧 p=7462/2704156 OR=0.0303', () => {
  const r = E.fisher(1, 9, 11, 3);
  near(r.p, 7462 / 2704156, 1e-12, 'fisher p');
  near(r.or, 3 / 99, 1e-12, 'OR');
});
test('Fisher：零单元格不崩溃', () => {
  const r = E.fisher(0, 5, 5, 0);
  assert.ok(r.p > 0 && r.p <= 1);
  assert.equal(r.or, 0);
});
test('Welch t：探针基准 t=-1.1677484 p=0.2903336 df=5.5846', () => {
  const r = E.ttestInd([1, 2, 3, 4], [2, 3, 4, 6]);
  near(r.statistic, -1.1677484162422844, 1e-9, 't');
  near(r.p, 0.2903335690497174, 1e-9, 'p');
  near(r.df, 5.584615384615386, 1e-9, 'df');
});
test('pooled t：n1=n2 时 t 与 Welch 同值，df=6', () => {
  const r = E.ttestInd([1, 2, 3, 4], [2, 3, 4, 6], { equalVar: true });
  assert.equal(r.df, 6);
  near(r.statistic, -1.25 / Math.sqrt(2.2916666666666665 * 0.5), 1e-9, 'pooled t');
  assert.ok(r.p > 0.2 && r.p < 0.4);
});
test('配对 t 与单样本 t', () => {
  const r = E.ttestPaired([5, 6, 7, 8], [4, 5, 6, 7]);
  assert.equal(r.df, 3);
  near(r.meanDiff, 1, 1e-12, 'meanDiff');
  assert.ok(r.p < 0.01);
  const o = E.ttestOne([1, 2, 3], 2);
  assert.equal(o.p, 1);
});
test('χ² 独立性：[[10,20],[30,40]] χ²=0.4464286 p=0.5040359', () => {
  const r = E.chi2Indep([[10, 20], [30, 40]]);
  near(r.statistic, 0.4464285714285714, 1e-9, 'chi2');
  near(r.p, 0.5040358664525048, 1e-9, 'p');
  assert.equal(r.df, 1);
});
test('χ² 拟合优度：[10,20,30] vs 均匀 → χ²=10 p=0.006738', () => {
  const r = E.chi2GOF([10, 20, 30]);
  near(r.statistic, 10, 1e-9, 'chi2');
  near(r.p, 0.006737946999085467, 1e-6, 'p');
});
test('Pearson：numpy 例 r=0.7745966692', () => {
  const r = E.correlation([1, 2, 3, 4, 5], [2, 4, 5, 4, 5], 'pearson');
  near(r.statistic, 0.7745966692414834, 1e-9, 'r');
  assert.ok(r.p < 0.15);
});
test('Spearman：scipy 例 rho=0.8207826817', () => {
  const r = E.correlation([1, 2, 3, 4, 5], [5, 6, 7, 8, 7], 'spearman');
  near(r.statistic, 0.8207826816681233, 1e-9, 'rho');
});
test('Bartlett：探针基准', () => {
  const r = E.bartlett([[1, 2, 3], [2, 3, 5]]);
  near(r.statistic, 0.27896541943164443, 1e-9, 'stat');
  near(r.p, 0.5973801205246071, 1e-9, 'p');
});
test('Wilcoxon 符号秩：探针基准 p=0.0477149', () => {
  const r = E.wilcoxon([1, 2, 3, 4, 5], [2, 3, 4, 5, 7]);
  near(r.p, 0.047714880237351265, 1e-9, 'p');
});
test('描述统计', () => {
  const d = E.descriptive([1, 2, 3, 4, 5]);
  assert.equal(d.n, 5); assert.equal(d.mean, 3); assert.equal(d.median, 3);
  near(d.sd, 1.5811388300841898, 1e-9, 'sd');
});
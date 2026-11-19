// B2 tableone 移植对数测试：ANOVA/Kruskal-Wallis 解析基准 + 上游语义（格式/n行/isnull/p值选择）
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
  'frontend/tools/lib/tableone.js',
]) vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
const T = globalThis.tableone;
const TS = globalThis.tableoneStats;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

const rows = [];
const A = { ages: [23, 25, 27, 29, 31, 33], sex: ['M', 'M', 'F', 'F', 'M', 'F'] };
const B = { ages: [40, 42, 44, 46, 48, 50], sex: ['F', 'F', 'F', 'M', 'F', 'M'] };
A.ages.forEach((a, i) => rows.push({ group: 'A', age: a, sex: A.sex[i] }));
B.ages.forEach((a, i) => rows.push({ group: 'B', age: a, sex: B.sex[i] }));

test('ANOVA 解析基准：F=3 p=0.125', () => {
  const r = TS.fOneway([[1, 2, 3], [2, 3, 4], [3, 4, 5]]);
  near(r.statistic, 3, 1e-9, 'F');
  near(r.p, 0.125, 1e-6, 'p');
});
test('Kruskal-Wallis 解析基准：H=7.2 p=exp(-3.6)', () => {
  const r = TS.kruskal([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  near(r.statistic, 7.2, 1e-9, 'H');
  near(r.p, Math.exp(-3.6), 1e-6, 'p');
});
test('分组 Table 1：n 行 / mean(std) / 分类 n(%) / Fisher 选择', () => {
  const t = T(rows, { columns: ['age', 'sex'], categorical: ['sex'], groupby: 'group', pval: true, isnull: true });
  assert.deepEqual(t.headers, ['', 'A', 'B', 'isnull', 'pval', 'testname']);
  assert.deepEqual(t.table[0], ['n', '6', '6', '0', '', '']);
  const age = t.table[1];
  assert.equal(age[0], 'age (mean (std))');
  assert.equal(age[1], '28.00 (3.74)');
  assert.equal(age[2], '45.00 (3.74)');
  assert.equal(age[5], 'One_way_ANOVA');
  assert.ok(Number(age[4]) < 0.001);
  const sexHead = t.table[2];
  assert.equal(sexHead[0], 'sex (n (%))');
  assert.equal(sexHead[5], 'Fisher exact'); // 最小格 2 < 5 且 2×2
  const fRow = t.table[3], mRow = t.table[4];
  assert.equal(fRow[0], 'F'); assert.equal(fRow[1], '3 (50.00)'); assert.equal(fRow[2], '4 (66.67)');
  assert.equal(mRow[0], 'M'); assert.equal(mRow[1], '3 (50.00)'); assert.equal(mRow[2], '2 (33.33)');
});
test('nonnormal → median[IQR] + Kruskal-Wallis', () => {
  const t = T(rows, { columns: ['age'], groupby: 'group', nonnormal: ['age'], pval: true, isnull: false });
  assert.equal(t.table[1][0], 'age (median [IQR])');
  assert.equal(t.table[1][1], '28.00 [25.50,30.50]');
  assert.equal(t.table[1][4], 'Kruskal-Wallis');
});
test('无分组 overall + isnull 计数', () => {
  const r2 = rows.concat([{ group: 'A', age: null, sex: 'M' }]);
  const t = T(r2, { columns: ['age', 'sex'], categorical: ['sex'], isnull: true });
  assert.deepEqual(t.strata, ['overall']);
  assert.equal(t.table[0][1], '13');
  assert.equal(t.table[1][2], '1'); // age 缺失 1
});
test('分类大样本 → Chi-squared', () => {
  const big = [];
  for (let i = 0; i < 30; i++) big.push({ g: 'A', s: i % 2 ? 'M' : 'F' });
  for (let i = 0; i < 30; i++) big.push({ g: 'B', s: i % 3 ? 'M' : 'F' });
  const t = T(big, { columns: ['s'], categorical: ['s'], groupby: 'g', pval: true, isnull: false });
  assert.equal(t.table[1][4], 'Chi-squared');
});
test('导出四格式', () => {
  const t = T(rows, { columns: ['age', 'sex'], categorical: ['sex'], groupby: 'group' });
  const X = globalThis.tableoneExport;
  assert.ok(X.toCSV(t).includes('age (mean (std))'));
  assert.ok(X.toMarkdown(t).startsWith('|'));
  assert.ok(X.toHTML(t).includes('<table>'));
  assert.ok(X.toLaTeX(t).includes('\\toprule'));
});
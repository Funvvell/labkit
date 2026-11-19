// B8 APA7 报告串对数测试
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(root, 'frontend/tools/apa.js'), 'utf8'));
const A = globalThis.LabKitAPA;

test('t 检验 APA 全要素', () => {
  const r = A.format('t', { stat: 2.45, df: 24, p: 0.022, es: 0.62, ci: [0.12, 1.88] });
  assert.equal(r.plain, 't(24.00) = 2.45, p = .022, d = 0.62, 95% CI [0.12, 1.88]');
  assert.ok(r.html.includes('<i>t</i>') && r.html.includes('<i>p</i>'));
  assert.ok(r.zh.includes('P = 0.022'));
});
test('p < .001 截断与无前导零', () => {
  assert.equal(A.format('U', { stat: 17, p: 0.0004 }).plain, 'U = 17.00, p < .001');
  assert.equal(A.pAPA(0.1111), 'p = .111');
});
test('χ² 带 N', () => {
  assert.equal(A.format('chi2', { stat: 8.45, df: 2, p: 0.015, n: 120 }).plain, 'χ²(2, N = 120) = 8.45, p = .015');
});
test('相关 r', () => {
  assert.equal(A.format('r', { stat: 0.34, df: 48, p: 0.016 }).plain, 'r(48) = 0.34, p = .016');
});
test('Fisher OR', () => {
  assert.equal(A.format('fisher', { or: 0.67, p: 0.55 }).plain, "OR = 0.67, p = .550 (Fisher's exact test)");
});
test('F 与 η²', () => {
  assert.equal(A.format('F', { stat: 5.2, df1: 2, df2: 27, p: 0.012, es: 0.28 }).plain, 'F(2.00, 27.00) = 5.20, p = .012, η² = 0.28');
});
test('fromLastTest 映射 B3 结果', () => {
  const m = A.fromLastTest({ id: 'mwu', r: { statistic: 17, p: 0.1111 } });
  assert.equal(m.type, 'U');
  assert.equal(A.format(m.type, m.fields).plain, 'U = 17.00, p = .111');
  const c = A.fromLastTest({ id: 'bartlett', r: { statistic: 0.28, p: 0.6, k: 3 } });
  assert.equal(c.fields.df, 2);
});
// Biopython MeltingTemp 移植对数：基准向量取自上游模块 doctest
// node --test tests/js/melting-temp.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
vm.runInThisContext(readFileSync(path.join(root, 'frontend/tools/lib/melting-temp.js'), 'utf8'));
const MT = globalThis.meltingTemp;
const SEQ = 'CGTTCCAAAGATGTGGGCATGAGCTTAC'; // 上游 doctest myseq
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.005, `${a.toFixed(4)} != ${b}`);

test('Tm_NN 默认（NN3, Na50, saltcorr5, 25/25nM）→ 60.32', () => close(MT.tmNN(SEQ), 60.32));
test('Tm_NN Breslauer NN1 → 72.19', () => close(MT.tmNN(SEQ, { table: 'NN1' }), 72.19));
test('Tm_NN Sugimoto NN2 → 65.47', () => close(MT.tmNN(SEQ, { table: 'NN2' }), 65.47));

test('盐校正 1-7 全谱对数', () => {
  const expect = [54.27, 54.02, 59.60, 60.64, 60.32, 59.78, 59.78];
  for (let i = 1; i <= 7; i++) close(MT.tmNN(SEQ, { saltcorr: i }), expect[i - 1]);
});

test('von Ahsen 离子等效：Tris/Mg/dNTPs', () => {
  close(MT.tmNN(SEQ, { Na: 50, Tris: 10 }), 60.79);
  close(MT.tmNN(SEQ, { Na: 50, Tris: 10, Mg: 1.5 }), 67.39);
  close(MT.tmNN(SEQ, { Na: 50, Tris: 10, Mg: 1.5, saltcorr: 7 }), 66.81);
  close(MT.tmNN(SEQ, { Na: 50, Tris: 10, Mg: 1.5, dNTPs: 0.6, saltcorr: 7 }), 66.04);
});

test('Tm_Wallace → 48', () => assert.equal(MT.tmWallace('ACGTTGCAATGCCGTA'), 48));
test('Tm_GC valueset2 含错配 X → 69.20', () => close(MT.tmGC('CTGCTGATXGCACGAGGTTATGG', { valueset: 2 }), 69.20));

test('自互补 sym 修正改变 Tm', () => {
  const s = 'GCGCGCGC';
  assert.ok(Math.abs(MT.tmNN(s, { selfcomp: true }) - MT.tmNN(s)) > 1e-4);
});

test('GC% / 反向互补 / 分子量', () => {
  assert.equal(MT.gcFraction('GGCCATAT'), 0.5);
  assert.equal(MT.revcomp('ATGC'), 'GCAT');
  close(MT.primerMW('ATGC'), 313.21 + 304.2 + 329.21 + 289.18 - 61.96);
});

test('非法碱基报错', () => {
  assert.throws(() => MT.tmNN('ATGN'), /仅支持/);
});
// randomizr 移植回归：node --test tests/js/randomizr.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
// seedrandom UMD：以 module shim 取导出
const srMod = { exports: {} };
vm.runInThisContext('(function(module,exports){' + readFileSync(path.join(root, 'frontend/vendor/seedrandom.min.js'), 'utf8') + '\n})')(srMod, srMod.exports);
const seedrandom = srMod.exports;
vm.runInThisContext(readFileSync(path.join(root, 'frontend/tools/lib/randomizr.js'), 'utf8'));
const R = globalThis.randomizr;
const rng = s => seedrandom(s);
const count = (a, v) => a.filter(x => x === v).length;

test('同种子可复现', () => {
  const a = R.completeRA(100, { m: 30, rng: rng('labkit') });
  const b = R.completeRA(100, { m: 30, rng: rng('labkit') });
  assert.deepEqual(a, b);
});

test('completeRA 指定 m：恰好 30 个处理', () => {
  const a = R.completeRA(100, { m: 30, rng: rng('x') });
  assert.equal(count(a, '1'), 30);
  assert.equal(a.length, 100);
});

test('completeRA prob=0.35：m 只取 3 或 4，均值≈3.5', () => {
  let sum = 0; const seen = new Set();
  for (let i = 0; i < 2000; i++) {
    const a = R.completeRA(10, { prob: 0.35, rng: rng('s' + i) });
    const m = count(a, '1');
    seen.add(m); sum += m;
  }
  assert.deepEqual([...seen].sort(), [3, 4]);
  assert.ok(Math.abs(sum / 2000 - 3.5) < 0.1);
});

test('多臂 mEach 精确计数', () => {
  const a = R.completeRA(10, { conditions: ['A', 'B', 'C'], mEach: [2, 3, 5], rng: rng('m') });
  assert.equal(count(a, 'A'), 2); assert.equal(count(a, 'B'), 3); assert.equal(count(a, 'C'), 5);
});

test('blockRA：每区组内平衡', () => {
  const blocks = [...Array(6).fill('A'), ...Array(4).fill('B')];
  const a = R.blockRA(blocks, { m: 2, rng: rng('b') });
  assert.equal(count(a.slice(0, 6), '1'), 2);
  assert.equal(count(a.slice(6), '1'), 2);
});

test('clusterRA：同群同分配', () => {
  const clusters = ['c1', 'c1', 'c1', 'c2', 'c2', 'c3', 'c3', 'c3', 'c3'];
  const a = R.clusterRA(clusters, { m: 1, rng: rng('c') });
  for (const c of ['c1', 'c2', 'c3']) {
    const vals = clusters.map((x, i) => x === c ? a[i] : null).filter(v => v !== null);
    assert.equal(new Set(vals).size, 1);
  }
  assert.equal(count(a, '1'), [3, 2, 4][['c1', 'c2', 'c3'].findIndex(c => a[clusters.indexOf(c)] === '1')]);
});

test('blockAndClusterRA：区组内整群一致', () => {
  const blocks = ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B'];
  const clusters = ['a1', 'a1', 'a2', 'a2', 'b1', 'b1', 'b2', 'b2'];
  const a = R.blockAndClusterRA(blocks, clusters, { m: 1, rng: rng('bc') });
  assert.equal(a[0], a[1]); assert.equal(a[2], a[3]);
  assert.equal(a[4], a[5]); assert.equal(a[6], a[7]);
  assert.equal(count(a.slice(0, 4), '1'), 2);
  assert.equal(count(a.slice(4), '1'), 2);
});
// Mixology 移植 + 实验公式回归：node --test tests/js/mixology.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
vm.runInThisContext(readFileSync(path.join(root, 'frontend/tools/lib/mixology.js'), 'utf8'));
const M = globalThis.mixology;
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} !≈ ${b}`);

test('称量：0.5L 0.1mol/L NaCl(MW58.4425) → 2.922 g', () => {
  const r = M.neededMass({ volumeL: 0.5, conc: 0.1, type: 'mol/L', mw: 58.4425, massUnit: 'g' });
  assert.equal(r.value, '2.922');
});

test('称量：1L 10g/L → 10000 mg', () => {
  const r = M.neededMass({ volumeL: 1, conc: 10, type: 'g/L', massUnit: 'mg' });
  assert.equal(r.value, '10000');
});

test('量取：1L 0.1mol/L 用 1mol/L 母液 → 100.0 mL', () => {
  const r = M.neededVolume({ volumeL: 1, desired: { number: 0.1, type: 'mol/L' }, stock: { number: 1, type: 'mol/L' }, volUnit: 'mL' });
  assert.equal(r.value, '100.0');
});

test('跨类型：1L 0.1mol/L 用 100g/L 母液(MW58.4425) → 58.44 mL', () => {
  const r = M.neededVolume({ volumeL: 1, desired: { number: 0.1, type: 'mol/L' }, stock: { number: 100, type: 'g/L' }, mw: 58.4425, volUnit: 'mL' });
  assert.equal(r.value, '58.44');
});

test('缺 MW 时报错而非 NaN', () => {
  const r = M.neededMass({ volumeL: 1, conc: 0.1, type: 'mol/L', massUnit: 'g' });
  assert.ok(r.error);
});

test('C1V1：10×→1× 50mL → 取 5mL + 45mL 稀释液', () => {
  const r = M.dilution({ c1: 10, c2: 1, v2: 50 });
  near(r.v1, 5); near(r.diluent, 45);
});

test('RCF：r=10cm 10000rpm → 11180×g；反算一致', () => {
  near(M.rpmToRcf(10000, 10), 11180, 1e-9);
  near(M.rcfToRpm(11180, 10), 10000, 1e-9);
});

test('MOI 0.1 × 1e6 细胞 / 1e8 PFU·mL⁻¹ → 1 µL', () => {
  const r = M.moi({ moi: 0.1, cells: 1e6, titerPfuPerMl: 1e8 });
  near(r.pfu, 1e5); near(r.volumeUl, 1);
});

test('铺板：1e5 细胞/孔，1e6/mL 悬液 → 100 µL/孔', () => {
  const r = M.plating({ cellsPerWell: 1e5, densityPerMl: 1e6 });
  near(r.volumePerWellUl, 100);
});
// C3 孔板模型对数测试（PlateEditor 语义）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(root, 'frontend/tools/lib/plate-model.js'), 'utf8'));
const P = globalThis.plateModel;

test('孔名解析往返：A1/H12/P24', () => {
  assert.equal(P.alphabet(0), 'A'); assert.equal(P.alphabet(15), 'P');
  const a1 = P.parseIndex('A1', 8, 12);
  assert.deepEqual(a1, { Index: 0, Row: 0, Col: 0, Name: 'A1' });
  const h12 = P.parseIndex('H12', 8, 12);
  assert.equal(h12.Index, 95);
  const p24 = P.parseIndex('P24', 16, 24);
  assert.equal(p24.Index, 383);
  assert.equal(P.parseIndex('I1', 8, 12), undefined); // 越界
  assert.equal(P.parseIndex('A01', 8, 12).Index, 0); // A0X 格式
});
test('赋样：重复标记 / 锁定报错', () => {
  const plate = P.createPlate(8, 12);
  const l = plate.Layers[0];
  P.addArea(l, { Name: 'S1', Color: '#e6194b' });
  P.addArea(l, { Name: 'S2' });
  let r = P.tagWells(l, [0, 1, 2], 'S1');
  assert.deepEqual(r.map(x => x.status), ['ok', 'ok', 'ok']);
  r = P.tagWells(l, [0], 'S1');
  assert.equal(r[0].status, 'duplicate');
  r = P.tagWells(l, [0], 'S2', { lock: true });
  assert.equal(r[0].status, 'error');
  r = P.tagWells(l, [0], 'S2');
  assert.equal(r[0].status, 'ok');
  assert.equal(l.Wells[0].Area.Name, 'S2');
});
test('Range 顺序编号 + Definition 解析', () => {
  const plate = P.createPlate(8, 12);
  const l = plate.Layers[0];
  P.addArea(l, { Name: 'Dose', Type: 'Range', Definition: ['0', '1', '10', '100'] });
  P.tagWells(l, [0, 1, 2, 3], 'Dose');
  assert.deepEqual(l.Wells.slice(0, 4).map(w => w.RangeIndex), [1, 2, 3, 4]);
  assert.deepEqual(l.Wells.slice(0, 4).map(w => P.resolvedName(w)), ['0', '1', '10', '100']);
  P.addArea(l, { Name: 'Rep', Type: 'Range' });
  P.tagWells(l, [12, 13], 'Rep');
  assert.equal(P.resolvedName(l.Wells[12]), 'Rep #1');
  assert.equal(P.resolvedName(l.Wells[13]), 'Rep #2');
});
test('导出列序与浓度', () => {
  const plate = P.createPlate(8, 12);
  const l = plate.Layers[0];
  P.addArea(l, { Name: 'S1' });
  P.tagWells(l, [0], 'S1');
  P.tagConc(l, [0], 10, 'uM');
  const { header, rows } = P.exportRows(l);
  assert.deepEqual(header, ['Well', 'Row', 'Col', 'Index', 'Area', 'Value', 'Unit', 'Resolved']);
  assert.deepEqual(rows[0], ['A1', 1, 1, 0, 'S1', 10, 'uM', 'S1']);
  assert.ok(P.toCSV(l).startsWith('Well,Row,Col'));
});
test('保存/加载往返', () => {
  const plate = P.createPlate(8, 12);
  const l = plate.Layers[0];
  P.addArea(l, { Name: 'S1', Color: '#123456' });
  P.addArea(l, { Name: 'R', Type: 'Range' });
  P.tagWells(l, [0, 1], 'S1');
  P.tagWells(l, [2, 3], 'R');
  P.tagConc(l, [2], 5, 'ng');
  P.addLayer(plate);
  const json = P.save(plate);
  const p2 = P.load(json);
  assert.equal(p2.Layers.length, 2);
  assert.equal(p2.Layers[0].Wells[0].Area.Name, 'S1');
  assert.equal(p2.Layers[0].Wells[0].Area.Color, '#123456');
  assert.equal(P.resolvedName(p2.Layers[0].Wells[3]), 'R #2');
  assert.equal(p2.Layers[0].Wells[2].Value, 5);
});
test('板 → qPCR design 映射', () => {
  const plate = P.createPlate(8, 12);
  const sl = plate.Layers[0];
  P.addArea(sl, { Name: 'S1' }); P.addArea(sl, { Name: 'S2' });
  P.tagWells(sl, [0, 1, 2], 'S1');      // A1 A2 A3
  P.tagWells(sl, [12, 13, 14], 'S2');   // B1 B2 B3
  const tl = P.addLayer(plate);
  P.addArea(tl, { Name: 'G1' }); P.addArea(tl, { Name: 'G2' }); P.addArea(tl, { Name: 'REF' });
  P.tagWells(tl, [0, 12], 'G1');
  P.tagWells(tl, [1, 13], 'G2');
  P.tagWells(tl, [2, 14], 'REF');
  const d = P.toQpcrDesign(plate, 0, 1, { S1: 'Ctrl', S2: 'Treat' });
  assert.deepEqual(d.samples, ['S1', 'S2']);
  assert.deepEqual(d.targets, ['G1', 'G2', 'REF']);
  assert.deepEqual(d.sample_groups, { S1: 'Ctrl', S2: 'Treat' });
  assert.equal(d.wells.length, 6);
  assert.deepEqual(d.wells[0], { well_position: 'A1', row: 1, col: 1, sample_id: 'S1', target_id: 'G1' });
});
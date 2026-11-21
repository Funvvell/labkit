// 台账主键与试剂余量归一化单测（Markdown Vault 的前置契约）。
// Vault 靠稳定 id 而非文件名映射记录，且 left 与 quantity+unit 必须有单一真相，
// 否则投影/摄入会在两个字段之间来回打架。Rust 侧往返见 rust/tests/vault_roundtrip.rs。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;

/* ---- 最小 DOM 桩：够 formModal 建 dialog、查控件、点确定 ---- */
const controls = new Map();
function makeEl(tag) {
  return {
    tag, className: '', innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    attrs: {}, children: [], parentNode: null, hidden: false, open: false, onclick: null,
    setAttribute(k, v) { this.attrs[k] = v; },
    removeAttribute(k) { delete this.attrs[k]; },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    addEventListener() { }, remove() { }, focus() { },
    showModal() { this.open = true; }, close() { this.open = false; },
    querySelector(sel) { return sel.startsWith('#') ? ctl(sel) : null; },
    querySelectorAll() { return []; },
  };
}
const ctl = sel => { if (!controls.has(sel)) controls.set(sel, makeEl('ctl')); return controls.get(sel); };
const elements = {};
globalThis.document = {
  getElementById: id => elements[id] || (elements[id] = makeEl('div')),
  querySelectorAll: () => [], querySelector: () => null,
  addEventListener() { }, createElement: makeEl,
  documentElement: { dataset: {}, style: { setProperty() { } } },
  body: makeEl('body'), head: makeEl('head'),
};
globalThis.location = { hash: '', reload() { } };
globalThis.history = { replaceState() { }, back() { } };
globalThis.addEventListener = () => { };
const lsBag = {};
globalThis.localStorage = {
  getItem: k => (k in lsBag ? lsBag[k] : null),
  setItem: (k, v) => { lsBag[k] = String(v); },
  removeItem: k => { delete lsBag[k]; },
};
globalThis.MutationObserver = class { observe() { } disconnect() { } };
globalThis.esc = s => String(s == null ? '' : s);
globalThis.toast = () => { };
globalThis.renderDbStatus = () => { };
globalThis.refreshHome = () => { };
globalThis._route = { name: 'home', arg: null };

for (const f of ['frontend/js/bridge.js', 'frontend/js/util.js', 'frontend/js/db.js',
  'frontend/js/store.js', 'frontend/js/entities.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
}

/* 11 类实体 + 各自的 id 前缀（与 ENT.*.apply 和 migrateDB 的 IDP 表一致） */
const KINDS = {
  projects: 'p', tasks: 't', focusRecords: 'f', experiments: 'e', literatures: 'l',
  reagents: 'r', instruments: 'i', reminders: 'm', budget: 'b', bookings: 'k', notes: 'n',
};

test('migrateDB 给全部 11 类实体补 id（reminders 历史上一直没有）', () => {
  for (const k of Object.keys(KINDS)) DB[k] = [{ name: '无 id 记录' }];
  migrateDB();
  for (const [k, prefix] of Object.entries(KINDS)) {
    assert.ok(DB[k][0].id, `${k} 必须有 id`);
    assert.equal(DB[k][0].id[0], prefix, `${k} 的 id 前缀应为 ${prefix}`);
  }
});

test('migrateDB 幂等：已有 id 不被覆盖，重复跑不产生新 id', () => {
  DB.reminders = [{ id: 'm-keep', text: '已有 id', date: '2026-11-20', color: 'var(--red)' }];
  migrateDB(); migrateDB();
  assert.equal(DB.reminders[0].id, 'm-keep');
});

test('ENT.reminder.apply：新建生成 id，编辑保留原 id', () => {
  const made = ENT.reminder.apply({ text: '基金结题', date: '2026-12-01', color: '紧急' }, null);
  assert.ok(made.id, '新建提醒必须有 id');
  assert.equal(made.color, 'var(--red)');
  const edited = ENT.reminder.apply({ text: '改过了', date: '2026-12-02', color: '一般' }, made);
  assert.equal(edited.id, made.id, '编辑不得换 id（否则 Vault 会产生孤儿文件）');
});

test('reagentSyncLeft：计量时 left 由 quantity+unit 派生，不计量时不动 left', () => {
  assert.equal(reagentSyncLeft({ quantity: 80, unit: '%', left: '旧值' }).left, '80%');
  assert.equal(reagentSyncLeft({ quantity: 2, unit: '支', left: '' }).left, '2支');
  assert.equal(reagentSyncLeft({ quantity: 0, unit: 'mL', left: 'x' }).left, '0mL', '0 是有效存量，不是未计量');
  assert.equal(reagentSyncLeft({ quantity: null, unit: '%', left: '2 支' }).left, '2 支');
  assert.equal(reagentSyncLeft({ left: '—' }).left, '—');
});

test('reagentApplyLeft：自由文本余量解析回 quantity+unit，两个表单不再打架', () => {
  const a = reagentApplyLeft({ quantity: 80, unit: '%' }, '50%');
  assert.equal(a.quantity, 50); assert.equal(a.unit, '%'); assert.equal(a.left, '50%');
  const b = reagentApplyLeft({}, '2 支');
  assert.equal(b.quantity, 2); assert.equal(b.unit, '支'); assert.equal(b.left, '2支');
  const c = reagentApplyLeft({ quantity: 80, unit: '%' }, '—');
  assert.equal(c.quantity, null, '非数值余量 → 退回不计量');
  assert.equal(c.left, '—');
  const d = reagentApplyLeft({}, '0');
  assert.equal(d.quantity, 0); assert.equal(d.left, '0');
});

test('migrateDB 归一化：quantity 存在时修正过期的 left', () => {
  DB.reagents = [{ id: 'r1', name: '试剂', quantity: 30, unit: 'mL', left: '80%' }];
  migrateDB();
  assert.equal(DB.reagents[0].left, '30mL');
});

test('migrateDB 不把历史自由文本 left 强行计量（只在用户编辑时转换）', () => {
  DB.reagents = [{ id: 'r2', name: '老记录', left: '80%' }];
  migrateDB();
  assert.equal(DB.reagents[0].quantity, undefined);
  assert.equal(DB.reagents[0].left, '80%');
});

test('ENT.reagent.apply：labres 表单改余量后 quantity 与 left 一致', () => {
  const rec = { id: 'r3', name: '一抗', quantity: 80, unit: '%' };
  const out = ENT.reagent.apply({ name: '一抗', no: 'AB1', lot: 'L1', loc: '4°C', open: '10-02', exp: '2026-12-02', left: '50%' }, rec);
  assert.equal(out.quantity, 50);
  assert.equal(out.left, '50%');
  assert.equal(out.id, 'r3');
});

test('formModal：nullable 数字字段留空 → null，普通数字字段留空仍 → 0', () => {
  controls.clear();
  ctl('#fm_0').value = '';   // quantity，nullable
  ctl('#fm_1').value = '';   // amount，非 nullable
  let got = null;
  formModal('测试', [
    { k: 'quantity', label: '存量', type: 'number', nullable: 1 },
    { k: 'amount', label: '金额', type: 'number' },
  ], out => { got = out; });
  ctl('#fm_ok').onclick();
  assert.ok(got, '确定回调应被触发');
  assert.equal(got.quantity, null, '留空的存量 = 不计量，不能被强转成 0');
  assert.equal(got.amount, 0, '既有数字字段行为不变');
});

test('formModal：nullable 数字字段填 0 仍是 0，不被当成留空', () => {
  controls.clear();
  ctl('#fm_0').value = '0';
  let got = null;
  formModal('测试', [{ k: 'quantity', label: '存量', type: 'number', nullable: 1 }], out => { got = out; });
  ctl('#fm_ok').onclick();
  assert.equal(got.quantity, 0);
});
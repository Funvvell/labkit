// P0 固定入口（pins）单测：favs→pins 保序迁移、pin/unpin 去重、排序/重命名、
// 失效条目过滤、favs/isFav/toggleFav 门面兼容。仅加载 store.js（数据层无 DOM 依赖）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
globalThis.DB = { _store: {} };
let saves = 0;
globalThis.saveDB = () => { saves++; };
globalThis.localStorage = { getItem: () => null, setItem() { }, removeItem() { } };
vm.runInThisContext(fs.readFileSync(path.join(root, 'frontend/js/store.js'), 'utf8'), { filename: 'store.js' });

test('favs→pins 迁移：保序、旧键置 null 墓碑（P1 合并写语义）、门面一致', () => {
  DB._store = { favs: ['primer', 'data-wash', 'epi2x2'] };
  const moved = Store.migrateLegacy();
  assert.equal(moved, true);
  assert.deepEqual(Store.pins().map(p => [p.kind, p.id]), [['tool', 'primer'], ['tool', 'data-wash'], ['tool', 'epi2x2']]);
  assert.equal(DB._store.favs, null);
  assert.deepEqual(Store.favs(), ['primer', 'data-wash', 'epi2x2']);
  assert.equal(Store.isFav('primer'), true);
  assert.ok(saves > 0);
});
test('迁移幂等：已有 pins 时不重复迁移、不丢数据', () => {
  const before = JSON.stringify(Store.pins());
  Store.migrateLegacy();
  assert.equal(JSON.stringify(Store.pins()), before);
});
test('迁移安全：pins 已存在时旧 favs 键保留（不删键）', () => {
  DB._store = { favs: ['x'], pins: [{ kind: 'tool', id: 'y', label: '', at: 1 }] };
  Store.migrateLegacy();
  assert.deepEqual(DB._store.favs, ['x']);
  assert.deepEqual(Store.favs(), ['y']);
});
test('pin/unpin：去重、返回值、页面与工具互不干扰', () => {
  DB._store = {};
  assert.equal(Store.pin('page', 'tasks'), true);
  assert.equal(Store.pin('page', 'tasks'), false);          // 重复固定拒绝
  assert.equal(Store.pin('tool', 'tasks'), true);           // 同 id 不同 kind 独立
  assert.equal(Store.pins().length, 2);
  assert.equal(Store.isPinned('page', 'tasks'), true);
  assert.equal(Store.unpin('page', 'tasks'), true);
  assert.equal(Store.unpin('page', 'tasks'), false);        // 不存在返回 false
  assert.equal(Store.isPinned('tool', 'tasks'), true);
});
test('togglePin：新固定排最前（与旧 toggleFav 语义一致）', () => {
  DB._store = {};
  Store.togglePin('tool', 'a');
  Store.togglePin('tool', 'b');
  assert.deepEqual(Store.favs(), ['b', 'a']);
  assert.equal(Store.togglePin('tool', 'b'), false);
  assert.deepEqual(Store.favs(), ['a']);
});
test('movePin：排序与边界', () => {
  DB._store = {};
  ['a', 'b', 'c'].forEach(id => Store.pin('tool', id));     // 顺序 c,b,a
  Store.movePin(0, 2);                                       // c 移到末尾 → b,a,c
  assert.deepEqual(Store.favs(), ['b', 'a', 'c']);
  Store.movePin(2, 0);                                       // c 移回最前 → c,b,a
  assert.deepEqual(Store.favs(), ['c', 'b', 'a']);
  Store.movePin(-1, 0);                                      // from 越界 → 不动
  assert.deepEqual(Store.favs(), ['c', 'b', 'a']);
  Store.movePin(0, 99);                                      // to 越界 → 钳制到末尾
  assert.deepEqual(Store.favs(), ['b', 'a', 'c']);
});
test('renamePin：自定义名 / 留空恢复默认 / trim', () => {
  DB._store = {};
  Store.pin('page', 'literature');
  assert.equal(Store.renamePin('page', 'literature', '  我的文献  '), true);
  assert.equal(Store.pins()[0].label, '我的文献');
  Store.renamePin('page', 'literature', '');
  assert.equal(Store.pins()[0].label, '');
  assert.equal(Store.renamePin('page', 'nope', 'x'), false);
});
test('pins 读取：非法条目过滤（缺 kind/id、错误 kind）', () => {
  DB._store = { pins: [null, { kind: 'page' }, { kind: 'tool', id: '' }, { kind: 'widget', id: 'w' }, { kind: 'page', id: 'tasks' }] };
  assert.deepEqual(Store.pins(), [{ kind: 'page', id: 'tasks' }]);
});
test('favs 门面：页面固定不影响工具收藏列表', () => {
  DB._store = {};
  Store.pin('page', 'tasks');
  Store.toggleFav('primer');
  assert.deepEqual(Store.favs(), ['primer']);
  assert.equal(Store.isFav('tasks'), false);
  assert.equal(Store.isPinned('page', 'tasks'), true);
});
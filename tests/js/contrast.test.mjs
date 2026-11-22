// LabKit · 对比度契约（WCAG 2.x）
// 暗色能不能看清不该靠主观判断：把关键配对算成比值，低于阈值即失败。
// 正文 ≥ 4.5:1；大字（≥18.66px 或 ≥14px 粗体）与非文本 ≥ 3:1。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const app = readFileSync(path.join(ROOT, 'frontend', 'css', 'app.css'), 'utf8');

function block(selector) {
  const at = app.indexOf(selector);
  const open = app.indexOf('{', at);
  const close = app.indexOf('}', open);
  return app.slice(open + 1, close);
}
function tokens(text) {
  const map = {};
  for (const m of text.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) map[m[1].toLowerCase()] = m[2];
  return map;
}
const light = tokens(block(':root{'));
const dark = { ...light, ...tokens(block(':root[data-theme="dark"]')) };

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const lum = hex => {
  const p = rgb(hex).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
};
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
};

/* 界面上真实存在的组合；阈值按文字级别保守取 4.5（正文多为 12–13px） */
const PAIRS = [
  ['ink', 'bg', 4.5, '正文/页面底'],
  ['ink', 'card', 4.5, '正文/卡片底'],
  ['ink-2', 'card', 4.5, '次文字/卡片底'],
  ['muted', 'bg', 4.5, '弱化文字/页面底'],
  ['muted', 'card', 4.5, '弱化文字/卡片底'],
  ['accent-text', 'card', 4.5, '链接与主色文字/卡片底'],
  ['accent-text', 'bg', 4.5, '链接与主色文字/页面底'],
  ['accent-hover', 'card', 4.5, '主色悬停/卡片底'],
];

/* 白字压在语义色底上：按钮多为 12px/600 的「大字」级别，按 3:1 兜住 */
const ON_SOLID = [
  ['white', 'accent', 3.0, '白字/主色底（主按钮）'],
];

for (const theme of ['light', 'dark']) {
  const t = theme === 'light' ? light : dark;
  for (const [fg, bg, min, label] of PAIRS) {
    test(`${theme} · ${label} ≥ ${min}`, () => {
      assert.ok(t[fg] && t[bg], `缺少 token --${fg} 或 --${bg}`);
      const r = ratio(t[fg], t[bg]);
      assert.ok(r >= min, `${theme}: ${label} 只有 ${r.toFixed(2)}:1（需要 ${min}）`);
    });
  }
  for (const [fg, bg, min, label] of ON_SOLID) {
    const fgHex = fg === 'white' ? '#FFFFFF' : t[fg];
    test(`${theme} · ${label} ≥ ${min}`, () => {
      assert.ok(fgHex && t[bg], `缺少 token --${bg}`);
      const r = ratio(fgHex, t[bg]);
      assert.ok(r >= min, `${theme}: ${label} 只有 ${r.toFixed(2)}:1（需要 ${min}）`);
    });
  }
}

// LabKit · 主题一致性契约
// 1) 任何 var(--token) 引用都必须在 CSS 里有定义（避免拼错或改了名没改全）
// 2) 深色块只能重定义浅色里已存在的 token（不能凭空造）
// 3) 承载背景/文字的语义 token 必须在深色里重定义（否则暗色直接落到浅色值）
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CSS_DIR = path.join(ROOT, 'frontend', 'css');
const TOOLS_CSS = path.join(ROOT, 'frontend', 'tools', 'tools.css');

function cssFiles(dir) {
  return readdirSync(dir)
    .filter(f => f.endsWith('.css'))
    .map(f => path.join(dir, f))
    .filter(p => statSync(p).isFile());
}

const files = [...cssFiles(CSS_DIR), TOOLS_CSS];
const sources = files.map(f => ({ name: path.relative(ROOT, f), text: readFileSync(f, 'utf8') }));

/** 取 :root{…} 与 :root[data-theme="dark"]{…} 的声明体（app.css 里是扁平块，无嵌套） */
function rootBlock(text, selector) {
  const at = text.indexOf(selector);
  if (at < 0) return '';
  const open = text.indexOf('{', at);
  const close = text.indexOf('}', open);
  return text.slice(open + 1, close);
}
const appCss = sources.find(s => s.name.endsWith('app.css')).text;
const lightBlock = rootBlock(appCss, ':root{');
const darkBlock = rootBlock(appCss, ':root[data-theme="dark"]');

const names = block => [...block.matchAll(/--([a-z0-9-]+)\s*:/gi)].map(m => m[1]);

test('浅色 :root 与深色块都能解析到 token', () => {
  assert.ok(names(lightBlock).length > 20, '浅色 token 太少，解析可能失败');
  assert.ok(names(darkBlock).length > 5, '深色 token 太少，解析可能失败');
});

test('深色块只重定义浅色里已存在的 token', () => {
  const light = new Set(names(lightBlock));
  const extra = names(darkBlock).filter(n => !light.has(n));
  assert.deepEqual(extra, [], `深色块出现浅色没有的 token：${extra.join(', ')}`);
});

test('背景/文字/分隔线语义 token 必须在深色里重定义', () => {
  const required = ['ink', 'ink-2', 'muted', 'line', 'bg', 'card', 'accent-text'];
  const dark = new Set(names(darkBlock));
  const missing = required.filter(n => !dark.has(n));
  assert.deepEqual(missing, [], `深色缺这些 token，暗色会退回浅色值：${missing.join(', ')}`);
});

test('所有 var(--token) 引用都有定义', () => {
  // 定义来自任意 CSS 文件（组件层允许在本地定义局部 token）；
  // 例外：由 JS 在运行时写在元素 style 上的自定义属性（分组色/状态色/画布色）
  const RUNTIME_ONLY = new Set(['rok', 'dot', 'tg', 'sw', 'tc', 'chip']);
  const defined = new Set();
  sources.forEach(s => names(s.text).forEach(n => defined.add(n)));
  const missing = [];
  sources.forEach(s => {
    for (const m of s.text.matchAll(/var\(\s*--([a-z0-9-]+)/gi)) {
      if (!defined.has(m[1]) && !RUNTIME_ONLY.has(m[1])) missing.push(`${s.name}: --${m[1]}`);
    }
  });
  assert.deepEqual([...new Set(missing)], [], `引用了未定义的 token：${[...new Set(missing)].join(' | ')}`);
});

// 字体与排版契约单测：本地打包字体真实存在且校验和一致、无在线 CDN、
// 半像素清零、字号阶梯与等宽数字生效、期刊字体单一来源。
// 真机渲染（双主题 / 希腊字母 / 导出）见 tests/smoke_resize.mjs 与人工目视。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const cssFiles = ['frontend/css/app.css', 'frontend/css/lab.css', 'frontend/css/toolbox.css',
  'frontend/css/tabs.css', 'frontend/css/adaptive.css', 'frontend/css/type.css', 'frontend/css/crop.css', 'frontend/tools/tools.css'];
const allCss = cssFiles.map(read).join('\n');
const typeCss = read('frontend/css/type.css');
const appCss = read('frontend/css/app.css');
const toolsCss = read('frontend/tools/tools.css');

test('半像素字号清零：半像素在不同 DPI 下渲染不一致', () => {
  for (const f of cssFiles) {
    const m = read(f).match(/font-size:\s*\d+\.5px/g);
    assert.equal(m, null, `${f} 仍有半像素字号: ${m}`);
  }
});

test('字号阶梯 token 齐全，组件引用 token 而非新造字面量', () => {
  for (const t of ['--text-3xs', '--text-2xs', '--text-xs', '--text-sm', '--text-md', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl']) {
    assert.ok(typeCss.includes(t + ':'), `缺少 ${t}`);
  }
  for (const t of ['--leading-tight', '--leading-normal', '--leading-relaxed']) {
    assert.ok(typeCss.includes(t + ':'), `缺少 ${t}`);
  }
  // 阶梯必须单调递增
  const vals = [...typeCss.matchAll(/--text-[a-z0-9]+:(\d+)px/g)].map(m => +m[1]);
  const sorted = [...vals].sort((a, b) => a - b);
  assert.deepEqual(vals, sorted, '字号阶梯应递增');
});

test('@font-face 指向真实存在的本地 woff2，且校验和与 manifest 一致', () => {
  const faces = [...typeCss.matchAll(/url\("(\.\.\/fonts\/[^"]+)"\)/g)].map(m => m[1]);
  assert.ok(faces.length >= 3, '至少 Inter + JBM Regular + JBM Bold 三个 face');
  const manifest = JSON.parse(read('frontend/fonts/manifest.json'));
  for (const rel of faces) {
    const p = path.join(root, 'frontend/css', rel);
    assert.ok(fs.existsSync(p), `字体文件不存在: ${rel}`);
    const buf = fs.readFileSync(p);
    assert.equal(buf.subarray(0, 4).toString('ascii'), 'wOF2', `${rel} 不是 woff2`);
    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    const entry = manifest.fonts.find(f => rel.endsWith(f.file));
    assert.ok(entry, `manifest 缺少 ${rel}`);
    assert.equal(sha, entry.sha256, `${rel} 校验和与 manifest 不符（产物被改过？）`);
  }
});

test('OFL 许可原文随字体分发（OFL 再分发要求）', () => {
  for (const f of ['frontend/fonts/Inter-OFL.txt', 'frontend/fonts/JetBrainsMono-OFL.txt']) {
    const t = read(f);
    assert.ok(t.includes('SIL OPEN FONT LICENSE'), `${f} 不是 OFL 全文`);
  }
  const notice = read('NOTICE.md');
  assert.ok(notice.includes('Inter') && notice.includes('JetBrains Mono'), 'NOTICE 需署名');
  assert.ok(read('frontend/vendor/LICENSES.md').includes('OFL-1.1'), 'LICENSES 需登记');
});

test('无在线字体 CDN：CSP font-src 只放行 self/data，联网字体会被拦', () => {
  assert.ok(!/fonts\.googleapis|fonts\.gstatic|@import\s+url\(\s*['"]?https?:/i.test(allCss), '不得引用在线字体');
  const html = read('frontend/index.html');
  assert.ok(!/fonts\.googleapis|fonts\.gstatic/i.test(html), 'index.html 不得引在线字体');
  const conf = read('rust/tauri.conf.json');
  assert.ok(/font-src\s+'self'/.test(conf), 'CSP font-src 应含 self');
});

test('字体栈：Inter 优先拉丁、中文落系统 YaHei UI；等宽 JetBrains Mono 优先', () => {
  const sans = (appCss.match(/--sans:([^;]+);/) || [])[1] || '';
  const mono = (appCss.match(/--mono:([^;]+);/) || [])[1] || '';
  assert.ok(sans.trim().startsWith('"Inter"'), 'Inter 应在栈首接管拉丁/数字');
  assert.ok(sans.includes('"Microsoft YaHei UI"'), 'Windows 中文应优先 YaHei UI（UI 优化版）');
  assert.ok(sans.includes('"PingFang SC"'), 'macOS 中文回退');
  assert.ok(mono.trim().startsWith('"JetBrains Mono"'), '等宽栈首应为 JetBrains Mono');
  // 不得再出现写坏的栈：var(--mono,ui-monospace),Consolas,monospace
  assert.ok(!/var\(--mono,\s*ui-monospace\)\s*,/.test(toolsCss), 'tools.css 字体栈逗号位置错误');
});

test('等宽数字与斜杠零：表格/批号列不再跳动、0 与 O 可区分', () => {
  assert.ok(/body\{font-variant-numeric:tabular-nums/.test(typeCss), 'body 应开 tabular-nums');
  assert.ok(/"tnum" 1,\s*"zero" 1/.test(typeCss), '等宽上下文应开斜杠零');
  assert.ok(/-webkit-font-smoothing:antialiased/.test(typeCss), '应开抗锯齿');
});

test('期刊图字体单一来源：Arial 全栈字面量只允许出现在 qpcr-plots 的常量里', () => {
  const toolFiles = fs.readdirSync(path.join(root, 'frontend/tools')).filter(f => f.endsWith('.js'));
  const hits = [];
  for (const f of toolFiles) {
    const n = (read('frontend/tools/' + f).match(/Arial, Helvetica, sans-serif/g) || []).length;
    if (n) hits.push([f, n]);
  }
  assert.deepEqual(hits, [['qpcr-plots.js', 1]], `Arial 全栈应只在 qpcr-plots 常量出现一次，实际 ${JSON.stringify(hits)}`);
  const qp = read('frontend/tools/qpcr-plots.js');
  assert.ok(qp.includes('JOURNAL_FONT'), '应有单一常量');
  assert.ok(read('frontend/tools/plotter.js').includes('W.QpcrPlots.JOURNAL_FONT'), 'plotter 应引用常量而非自写字面量');
  // figure.js 的期刊字体下拉是投稿要求，保留
  assert.ok(read('frontend/tools/figure.js').includes('<option>Arial</option>'), 'figure 期刊字体下拉应保留');
});

test('孔板画布文字跟随应用字体，不再写死 sans-serif', () => {
  const plate = read('frontend/tools/plate.js');
  assert.ok(!/ctx\.font = ['`][^'`]*sans-serif['`]/.test(plate), '画布不得写死 sans-serif');
  assert.ok(plate.includes('uiFont()'), '应读 CSS --sans');
  assert.ok(plate.includes('document.fonts.ready'), 'webfont 就绪后应重绘');
});

test('字体总体积受控：子集合计不超过 400KB（离线桌面应用）', () => {
  const manifest = JSON.parse(read('frontend/fonts/manifest.json'));
  const total = manifest.fonts.reduce((s, f) => s + f.bytes, 0);
  assert.ok(total <= 400 * 1024, `字体合计 ${(total / 1024).toFixed(1)}KB 超预算`);
  assert.ok(!manifest.fonts.some(f => /cjk|han|sc\.woff/i.test(f.file)), '不应打包 CJK');
});
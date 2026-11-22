// LabKit · 工具 UI 真机矩阵走查（Phase 7 批 0）
// 通过 WebView2 远程调试端口（CDP）在真实 Tauri CSP 环境里，对 20 个工具单元 ×
// 3 档宽度（1280 / 900 / 680）× 亮/暗两主题逐格测量。
//
// 关键结构事实（上一版探针踩过的坑）：
//   桌面主窗点工具不会在页内渲染，而是唤起单实例「工具窗口」（label=tools，
//   `index.html#/tool/<id>`），标签页在那边；crop / qpcr 两个工作区才在主窗渲染。
//   所以 18 个脚本工具在工具窗口里量，2 个工作区在主窗里量，不能都量主窗。
//
// 断言（全部数值化，可自动判定）：
//   1) 宿主横向溢出 ≤ 2px
//   2) 宿主直接子元素右/左边界不越界
//   3) 文本裁切（overflow:hidden 且 scrollWidth > clientWidth + 2）为 0
//   4) 可见文本最小字号 ≥ 9px（token 地板 --text-3xs；< 11px 另计为提示项）
//   5) 可点目标高度 ≥ 28px（.xs / 复选框白名单）
//   6) 文本对比度：硬失败 < 3.0；AA（< 4.5）单独统计
//   7) 画布后备尺寸 = CSS 宽 × devicePixelRatio（±2px）
//
// 用法：
//   1) 隔离数据目录 + 调试端口启动 exe（不要用真实台账）：
//      $env:LABKIT_DB_DIR="$env:TEMP\labkit-ui-audit"
//      $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
//      Start-Process rust\target\release\labkit.exe
//   2) node tests/smoke_tools_ui.mjs [port]
// 产出：docs/ui-audit.json（全量矩阵）、docs/ui-fail-*.png（仅失败格）
// Node ≥ 21（自带 WebSocket）。
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = process.argv[2] || '9222';
const DPR = parseFloat(process.argv[3] || '1');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
mkdirSync(DOCS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* 1280 / 900 是窗口级（工具窗口最小宽 900），680 只能靠视口覆盖模拟（容器级） */
const WIDTHS = [[1280, 800], [900, 620], [680, 560]];
const THEMES = ['light', 'dark'];

async function connect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0; const pending = new Map(); const errs = []; let closed = false;
  // 窗口被关闭时挂起请求必须立刻失败，否则 Node 会以 unsettled top-level await 退出（exit 13）
  ws.onclose = () => {
    closed = true;
    for (const [, res] of pending) res({ __closed: true });
    pending.clear();
    errs.push('cdp: socket closed');
  };
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown')
      errs.push('pageerror: ' + String(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 160));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      errs.push('console: ' + (m.params.args || []).map(a => a.value || a.description || '').slice(0, 160));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error')
      errs.push('log: ' + m.params.entry.text.slice(0, 160));
  };
  const send = (method, params = {}) => new Promise(res => {
    if (closed) { res({ __closed: true }); return; }
    const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r?.__closed) return { EXC: 'cdp closed' };
    if (r.result?.exceptionDetails) return { EXC: String(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).slice(0, 200) };
    return r.result?.result?.value;
  };
  const shot = async name => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    if (r.result?.data) writeFileSync(path.join(DOCS, name), Buffer.from(r.result.data, 'base64'));
  };
  const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: DPR, mobile: false });
  return { ev, send, viewport, shot, errs, close: () => ws.close(), isClosed: () => closed };
}

/* ---------------- 单格探针（页面内算，只回数值） ---------------- */
const PROBE = `(() => {
  const view = document.querySelector('.view.active') || document.body;
  let host = view;
  if (view.id === 'view-tool') {
    host = document.querySelector('#toolHost .tool-pane.active')
        || [...document.querySelectorAll('#toolHost .tool-pane')].find(p => p.getBoundingClientRect().width > 0)
        || document.getElementById('toolHost');
  } else if (view.id === 'view-crop' || view.id === 'view-qpcr') {
    host = view.querySelector('.ws-body') || view;
  }
  if (!host) return { missing: true };
  const rect = e => e.getBoundingClientRect();
  const vis = e => {
    const s = getComputedStyle(e);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false;
    const r = rect(e); return r.width > 1 && r.height > 1;
  };
  const lum = c => {
    const p = c.map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  };
  const parse = s => {
    const m = /rgba?\\(([^)]+)\\)/.exec(s || '');
    if (!m) return null;
    const parts = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const bgOf = el => {
    const stack = []; let cur = el;
    while (cur && cur !== document.documentElement) {
      const c = parse(getComputedStyle(cur).backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; }
      cur = cur.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };
  const ratio = (a, b) => {
    const l1 = lum([a.r, a.g, a.b]), l2 = lum([b.r, b.g, b.b]);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05);
  };

  const hostOverflow = Math.max(0, host.scrollWidth - host.clientWidth);
  const hostOverflowY = Math.max(0, host.scrollHeight - host.clientHeight);

  let outOfBounds = 0;
  const hr = rect(host);
  [...host.children].forEach(ch => {
    if (!vis(ch)) return;
    const r = rect(ch);
    if (r.right > hr.right + 2 || r.left < hr.left - 2) outOfBounds++;
  });

  let clipped = 0, clippedSample = [], minFont = 99, smallTexts = 0;
  let aaUnder = 0, hardFail = 0, contrastSample = [], aaSample = [], texts = 0;
  const scrollable = el => {
    let cur = el;
    while (cur && cur !== host) {
      const s = getComputedStyle(cur);
      if (/(auto|scroll)/.test(s.overflowX + s.overflowY)) return true;
      cur = cur.parentElement;
    }
    return false;
  };
  [...host.querySelectorAll('*')].forEach(el => {
    if (!vis(el)) return;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    texts++;
    const s = getComputedStyle(el);
    const fs = parseFloat(s.fontSize) || 0;
    if (fs < minFont) minFont = fs;
    if (fs < 11) smallTexts++;
    if (/hidden|clip/.test(s.overflowX) && el.scrollWidth > el.clientWidth + 2 && !scrollable(el)) {
      clipped++;
      if (clippedSample.length < 3) clippedSample.push((el.textContent || '').trim().slice(0, 24));
    }
    const fg = parse(s.color); if (!fg) return;
    const bg = bgOf(el);
    const r = ratio(fg.a >= 1 ? fg : over(fg, bg), bg);
    if (r < 3) { hardFail++; if (contrastSample.length < 3) contrastSample.push({ t: (el.textContent || '').trim().slice(0, 18), r: +r.toFixed(2), fs }); }
    else if (r < 4.5 && fs < 18.66) { aaUnder++; if (aaSample.length < 3) aaSample.push({ t: (el.textContent || '').trim().slice(0, 18), r: +r.toFixed(2), fs, cls: (el.className || '').toString().slice(0, 20) }); }
  });

  let smallTargets = 0, smallSample = [];
  [...host.querySelectorAll('button, select, input, textarea, .tbtn, .tfile-face')].forEach(el => {
    if (!vis(el)) return;
    if (el.closest('.xs') || el.classList.contains('xs')) return;
    if (/(checkbox|radio|hidden|file)/.test(el.type || '')) return;
    const h = rect(el).height;
    if (h < 27.5) { smallTargets++; if (smallSample.length < 3) smallSample.push({ id: (el.id || el.className || '').toString().slice(0, 24), h: +h.toFixed(1) }); }
  });

  const dpr = window.devicePixelRatio || 1;
  const canvases = [...host.querySelectorAll('canvas')].filter(vis).map(c => ({
    w: c.width, cssW: +rect(c).width.toFixed(1), want: Math.round(rect(c).width * dpr), ratio: +(dpr).toFixed(2)
  }));
  const badCanvas = canvases.filter(c => Math.abs(c.w - c.want) > 2);

  return {
    view: view.id, hostId: host.id || host.className, hostW: Math.round(hr.width),
    hostOverflow, hostOverflowY, outOfBounds, texts, clipped, clippedSample,
    minFont, smallTexts, aaUnder, hardFail, contrastSample, aaSample, smallTargets, smallSample,
    canvases, badCanvas,
  };
})()`;

/* ---------------- 连接 ---------------- */
const list = async () => (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json());
const targets0 = await list();
const mainT = targets0.find(t => t.type === 'page' && /LabKit/.test(t.title) && !/#\/tool\//.test(t.url)) || targets0.find(t => t.type === 'page');
if (!mainT) { console.error('no CDP page target；先带 --remote-debugging-port 启动 exe'); process.exit(1); }
const main = await connect(mainT);
const { ev } = main;

let ready = false;
for (let i = 0; i < 40; i++) {
  if (await ev(`!!(window.TOOL_META && document.getElementById('toolHost'))`)) { ready = true; break; }
  await sleep(500);
}
if (!ready) { console.error('app not ready'); process.exit(1); }

// 首次启动的欢迎弹层：选「空白开始」，避免遮罩影响测量
await ev(`(()=>{const m=document.getElementById('welcomeMask'); if(m&&!m.hidden){const b=document.getElementById('welcomeBlank'); if(b)b.click(); return 'closed';} return 'none';})()`);
await sleep(700);
// 关掉动画，保证采样稳定
const noAnim = `(()=>{if(document.getElementById('__audit_css'))return true;const s=document.createElement('style');s.id='__audit_css';s.textContent='*{animation:none!important;transition:none!important}';document.head.appendChild(s);return true;})()`;

const units = await ev(`(window.TOOL_META||[]).map(t=>({id:t.id,name:t.name,workspace:!!t.workspace}))`);
if (!units || !units.length) { console.error('TOOL_META missing'); process.exit(1); }

/* 打开工具窗口（单实例，label=tools），后续 18 个脚本工具都在里面量 */
await ev(`(async()=>{ if(typeof openTool==='function'){openTool('epi2x2');} return true; })()`);
let toolWin = null;
for (let i = 0; i < 40; i++) {
  await sleep(500);
  const ts = await list();
  const cand = ts.find(t => t.type === 'page' && /#\/tool\//.test(t.url));
  if (cand) { toolWin = cand; break; }
}
if (!toolWin) { console.error('tool window not created'); process.exit(1); }
const tw = await connect(toolWin);
await tw.ev(noAnim);
await tw.ev(`document.fonts && document.fonts.ready.then(()=>true)`);
await sleep(600);

const rows = []; const fails = [];
const route = u => u.workspace ? '#/' + u.id : '#/tool/' + u.id;
const now = () => new Date().toISOString().slice(11, 19);

/* 工作区（crop / qpcr）在桌面端起独立窗口（label=tool-<id>，URL #/<id>），
   主窗点卡片走的是「工具窗口 + 路由」，实测那个窗口的 active view 仍是 view-home，
   所以这里显式开工作区窗口，和用户点「新窗口」看到的是同一个东西。 */
async function ensureWorkspaceWin(id) {
  await main.ev(`(typeof openToolWindow==='function') ? (openToolWindow(${JSON.stringify(id)}),'ok') : 'no'`);
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    const c = (await list()).find(t => t.type === 'page' && new RegExp('#/?' + id + '($|[?&])').test(t.url));
    if (c) return c;
  }
  return null;
}

for (const u of units) {
  if (tw.isClosed()) { fails.push(`cdp closed at ${u.id}`); break; }
  let target = tw, wsConn = null;
  if (u.workspace) {
    const cand = await ensureWorkspaceWin(u.id);
    if (!cand) { fails.push(`${u.id}: 工作区窗口未创建`); continue; }
    wsConn = await connect(cand);
    await wsConn.ev(noAnim);
    target = wsConn;
    for (let i = 0; i < 24; i++) {
      const v = await wsConn.ev(`(document.querySelector('.view.active')||{}).id`);
      if (v === `view-${u.id}`) break;
      await sleep(300);
    }
    await sleep(600);
  } else {
    await target.ev(`location.hash=${JSON.stringify(route(u))}`);
    await sleep(1100);
  }
  target.errs.length = 0;
  await target.ev(`document.fonts && document.fonts.ready.then(()=>true)`);
  await sleep(350);
  await target.ev(noAnim);
  const viewNow = await target.ev(`(document.querySelector('.view.active')||{}).id`);
  const wantView = u.workspace ? `view-${u.id}` : 'view-tool';
  if (viewNow && viewNow !== wantView) fails.push(`${u.id}: 视图未切换（实际 ${viewNow}，期望 ${wantView}）`);
  console.error(`[${now()}] ${u.id}${u.workspace ? ' (工作区窗口)' : ''} view=${viewNow}`);

  for (const theme of THEMES) {
    await target.ev(`(()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};return true})()`);
    await sleep(300);
    for (const [w, h] of WIDTHS) {
      await target.viewport(w, h);
      await sleep(450);
      const p = await target.ev(PROBE);
      if (!p || p.EXC || p.missing) {
        rows.push({ unit: u.id, theme, w, error: String((p && (p.EXC || 'missing host'))).slice(0, 120) });
        fails.push(`${u.id}@${w}/${theme}: 探针失败 ${(p && (p.EXC || 'no host'))}`);
        continue;
      }
      rows.push({ unit: u.id, theme, w, ...p });
      if (p.hostOverflow > 2) fails.push(`${u.id}@${w}/${theme}: 横向溢出 ${p.hostOverflow}px（host=${p.hostId} ${p.hostW}px）`);
      if (p.outOfBounds > 0) fails.push(`${u.id}@${w}/${theme}: ${p.outOfBounds} 个子元素越界`);
      if (p.clipped > 0) fails.push(`${u.id}@${w}/${theme}: ${p.clipped} 处文本裁切 ${JSON.stringify(p.clippedSample)}`);
      if (p.minFont < 9) fails.push(`${u.id}@${w}/${theme}: 最小字号 ${p.minFont}px < 9`);
      if (p.smallTargets > 0) fails.push(`${u.id}@${w}/${theme}: ${p.smallTargets} 个可点目标 <28px ${JSON.stringify(p.smallSample)}`);
      if (p.hardFail > 0) fails.push(`${u.id}@${w}/${theme}: ${p.hardFail} 处对比度 <3.0 ${JSON.stringify(p.contrastSample)}`);
      if (p.badCanvas && p.badCanvas.length) fails.push(`${u.id}@${w}/${theme}: 画布后备尺寸不符 ${JSON.stringify(p.badCanvas)}`);
      if (theme === 'dark' && w === 900 && (p.hardFail > 0 || p.hostOverflow > 2 || p.clipped > 0))
        await target.shot(`ui-fail-${u.id}-900-dark.png`);
    }
  }
  if (wsConn) {
    try { await wsConn.ev(`(()=>{const W=window.__TAURI__.window; W.getCurrentWindow().close(); return true})()`); } catch (e) { /* 忽略 */ }
    wsConn.close();
    await sleep(500);
  }
}

const reportedErrs = [...new Set(tw.errs.map(String).concat(main.errs.map(String)))].slice(0, 10);
if (reportedErrs.length) fails.push('consoleErrors: ' + reportedErrs.join(' | '));

const summary = {
  generatedAt: new Date().toISOString(),
  cells: rows.length,
  units: units.length,
  widths: WIDTHS.map(x => x[0]),
  themes: THEMES,
  failCount: fails.length,
  aaUnderTotal: rows.reduce((s, r) => s + (r.aaUnder || 0), 0),
  smallTextTotal: rows.reduce((s, r) => s + (r.smallTexts || 0), 0),
  fails, rows,
};
writeFileSync(path.join(DOCS, DPR === 1 ? 'ui-audit.json' : 'ui-audit-dpr' + String(DPR).replace('.', '') + '.json'), JSON.stringify(summary, null, 1));

const byUnit = {};
fails.forEach(f => { const k = f.split('@')[0].split(':')[0]; byUnit[k] = (byUnit[k] || 0) + 1; });
console.log(JSON.stringify({ cells: rows.length, fail: fails.length, aaUnder: summary.aaUnderTotal, smallText: summary.smallTextTotal, byUnit }, null, 1));
if (fails.length) console.log(fails.slice(0, 60).join('\n'));

await tw.send('Emulation.clearDeviceMetricsOverride');
await main.send('Emulation.clearDeviceMetricsOverride');
tw.close(); main.close();
process.exit(fails.length ? 1 : 0);

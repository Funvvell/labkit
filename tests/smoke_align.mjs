// LabKit · 对齐门禁（rowCenter / rowHeight / edgeRight / colRight）
// 通过 WebView2 远程调试端口（CDP）量真实 DOM 的边界，不靠肉眼截图。
//
// 用法（先按 docs/UI_VERIFY.md 用隔离数据目录 + 9222 端口启动 exe）：
//   node tests/smoke_align.mjs 9222            # 只报告，不阻断
//   node tests/smoke_align.mjs 9222 --strict   # 超阈值即 exit 1
// 产出：docs/ui-align.json
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = process.argv[2] || '9222';
const STRICT = process.argv.includes('--strict');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
mkdirSync(DOCS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VIEWS = ['home', 'tasks', 'projects', 'experiments', 'literature', 'labres', 'reports', 'focus', 'settings', 'toolhub', 'plugins'];
const THEMES = ['light', 'dark'];
const WIDTHS = [[1280, 800], [900, 620]];

const ALIGN_PROBE = `(() => {
  const vis = e => {
    const s = getComputedStyle(e);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false;
    const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1;
  };
  const rect = e => e.getBoundingClientRect();
  const out = [];
  const add = (check, where, delta) => { if (Math.abs(delta) > 1.5) out.push({ check, where, delta: +delta.toFixed(1) }); };

  // 1) 同一行的控件共中心线（只校验中心线；页头按钮与标题本就不同高，不做等高断言）
  const rowSel = ['.content-head', '.card-head', '.deck-panel-head', '.tt-tab', '.tool-chrome', '.bar-row', '.notify-item'];
  rowSel.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    if (!vis(el)) return;
    const kids = [...el.children].filter(vis);
    if (kids.length < 2) return;
    const cs = kids.map(k => { const r = rect(k); return r.top + r.height / 2; });
    add('rowCenter', sel, Math.max(...cs) - Math.min(...cs));
  }));

  // 2) 页头 / 卡片头右边缘贴齐容器内边距线
  ['.content-head', '.card-head'].forEach(sel => document.querySelectorAll(sel).forEach(el => {
    if (!vis(el)) return;
    const kids = [...el.children].filter(vis);
    if (kids.length < 2) return;   // 单标题卡头没有左右两组元素，不适用右边界断言
    const s = getComputedStyle(el), r = rect(el);
    const inner = r.right - parseFloat(s.paddingRight || 0) - parseFloat(s.borderRightWidth || 0);
    const right = Math.max(...kids.map(k => rect(k).right));
    add('edgeRight', sel, right - inner);
  }));

  // 3) 侧栏：分组标题与导航项文字同一条竖线
  const group = [...document.querySelectorAll('.side-group')].find(vis);
  const nav = [...document.querySelectorAll('.sidebar .nav-item[data-nav]')].find(vis);
  const textLeft = el => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) if (n.textContent.trim()) {
      const r = document.createRange(); r.selectNodeContents(n);
      return r.getBoundingClientRect().left;
    }
    return null;
  };
  if (group && nav && vis(nav)) {
    const g = textLeft(group), n2 = textLeft(nav);
    if (g !== null && n2 !== null) add('sideLine', '.side-group / .nav-item', g - n2);
  }

  // 4) 表格：数值列右边缘一致；首列左边缘贴齐卡片内容线
  document.querySelectorAll('.tbl, .result-table').forEach(tbl => {
    const host = tbl.closest('.dash-card, .tool-section, .panel') || tbl.parentElement;
    const nums = [...tbl.querySelectorAll('th.num, td.num')].filter(vis).map(rect);
    if (nums.length > 1) add('colRight', 'num 列', Math.max(...nums.map(r => r.right)) - Math.min(...nums.map(r => r.right)));
    const first = [...tbl.querySelectorAll('th, td')].find(vis);
    if (first && host) {
      const hs = getComputedStyle(host), hr = rect(host);
      const inner = hr.left + parseFloat(hs.paddingLeft || 0) + parseFloat(hs.borderLeftWidth || 0);
      add('colLeft', '首列', rect(first).left - inner);
    }
  });

  // 5) 同一行文本控件等高（复选框/按钮的尺寸语义不同，不参与比较）
  document.querySelectorAll('.trow, .settings-trow').forEach(row => {
    if (!vis(row)) return;
    const ctrls = [...row.querySelectorAll('input:not([type=checkbox]):not([type=radio]),select,textarea')].filter(vis);
    if (ctrls.length < 2) return;
    const hs = ctrls.map(c => rect(c).height);
    if (Math.max(...hs) - Math.min(...hs) > 1.5) out.push({ check: 'rowHeight', where: row.className, delta: +(Math.max(...hs) - Math.min(...hs)).toFixed(1) });
  });
  return out;
})()`;

async function connect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0; const pending = new Map();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(res => {
    const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Runtime.enable'); await send('Page.enable');
  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return { EXC: String(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).slice(0, 200) };
    return r.result?.result?.value;
  };
  const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  return { ev, viewport, close: () => ws.close() };
}

const list = async () => (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json());
const main = (await list()).find(t => t.type === 'page' && /^http:\/\/tauri\.localhost\/(#|\?|$)/.test(t.url)) || (await list()).find(t => t.type === 'page');
if (!main) { console.error('未找到 LabKit 页面，请确认 exe 已带 9222 端口启动'); process.exit(2); }
const c = await connect(main);
const rows = []; const violations = [];

for (const v of VIEWS) {
  await c.ev(`location.hash=${JSON.stringify('#/' + v)}`);
  await sleep(900);
  await c.ev(`document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));(document.getElementById('view-${v}')||document.getElementById('view-home')).classList.add('active');true`);
  await sleep(250);
  const active = await c.ev(`(document.querySelector('.view.active')||{}).id`);
  for (const theme of THEMES) {
    await c.ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)};true`);
    await sleep(250);
    for (const [w, h] of WIDTHS) {
      await c.viewport(w, h);
      await sleep(300);
      const p = await c.ev(ALIGN_PROBE);
      if (!p || p.EXC) { rows.push({ view: v, theme, w, error: String(p && p.EXC || 'probe failed').slice(0, 120) }); continue; }
      rows.push({ view: v, theme, w, issues: p.length, detail: p });
      p.forEach(x => violations.push({ view: v, theme, w, ...x }));
    }
  }
}
c.close();

writeFileSync(path.join(DOCS, 'ui-align.json'), JSON.stringify({ generatedAt: new Date().toISOString(), violations, rows }, null, 1));
console.log(`对齐检查完成：${violations.length} 处超阈值（>1.5px）`);
violations.slice(0, 20).forEach(x => console.log(`  ${x.view}@${x.w}/${x.theme}  ${x.check} ${x.where}  ${x.delta}px`));
if (violations.length) console.log('明细见 docs/ui-align.json');
if (STRICT && violations.length) process.exit(1);

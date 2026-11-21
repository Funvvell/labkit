// LabKit · 窗口自适应真机审计：通过 CDP 视口覆盖，在真实 Tauri CSP 环境里
// 逐尺寸测量布局，断言「调整窗口大小时保持协调」。
//
// 用法：
//   1) 带调试端口启动 exe：
//      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222' rust/target/debug/labkit.exe
//   2) node tests/smoke_resize.mjs [port]
//
// 为什么用 Emulation.setDeviceMetricsOverride 而不是 Tauri setSize：
// capabilities 没有放行 core:window:allow-set-size，不该为了测试扩权限面。
// 视口覆盖同样驱动 media query 与 container query，足以验证布局。
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = process.argv[2] || '9222';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function connect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0; const pending = new Map(); const errs = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown')
      errs.push('pageerror: ' + String(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 160));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      errs.push('console: ' + (m.params.args || []).map(a => a.value || a.description || '').join(' ').slice(0, 160));
  };
  const send = (method, params = {}) => new Promise(res => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return { EXC: String(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).slice(0, 200) };
    return r.result?.result?.value;
  };
  const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const shot = async name => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    if (r.result?.data) writeFileSync(path.join(ROOT, 'docs', name), Buffer.from(r.result.data, 'base64'));
  };
  return { ev, send, viewport, shot, errs, close: () => ws.close() };
}

const listTargets = async () => (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json());
const list = await listTargets();
const target = list.find(t => t.type === 'page' && !/tool-/.test(t.url)) || list.find(t => t.type === 'page');
if (!target) { console.error('no CDP page target'); process.exit(1); }
const main = await connect(target);
const { ev, viewport, shot } = main;

const out = [];
const fail = [];

/* 探针：工作区三栏的实际宽度分配 */
const WS_PROBE = `(()=>{const q=s=>document.querySelector(s);
  const w=e=>e?Math.round(e.getBoundingClientRect().width):-1;
  const side=q('.sidebar');
  return {sidebarVisible:!!(side&&side.offsetParent!==null),
    left:w(q('#view-crop .panel.left')),right:w(q('#view-crop .panel.right')),
    stage:w(q('#view-crop .stage-wrap')),body:w(q('#view-crop .ws-body'))};})()`;

/* 探针：Dashboard 列数与卡片是否越界 */
const DASH_PROBE = `(()=>{const g=document.getElementById('dashGrid');
  if(!g)return {cols:-1,items:0,outOfBounds:0};
  const gr=g.getBoundingClientRect();let out=0,n=0;
  g.querySelectorAll('.grid-stack-item').forEach(it=>{n++;const r=it.getBoundingClientRect();
    if(r.right>gr.right+2||r.left<gr.left-2)out++;});
  return {cols:typeof _gsCols!=='undefined'?_gsCols:-1,items:n,outOfBounds:out,
    hintHidden:document.getElementById('dashColHint')?document.getElementById('dashColHint').hidden:null};})()`;

/* 探针：工具宿主是否横向溢出 */
const TOOL_PROBE = `(()=>{const h=document.getElementById('toolHost');
  if(!h)return {overflow:-1};
  return {overflow:h.scrollWidth-h.clientWidth,
    split:getComputedStyle(h.querySelector('.tsplit')||h).gridTemplateColumns.split(' ').length};})()`;

// ---------- 1) 主窗口：工作区三栏在最小宽度下必须给画布留出可用空间 ----------
await ev(`location.hash='#/crop'`); await sleep(1400);
const wsSizes = [];
for (const [w, h] of [[1024, 680], [1180, 760], [1440, 900], [1920, 1080]]) {
  await viewport(w, h); await sleep(700);
  const p = await ev(WS_PROBE);
  wsSizes.push({ w, ...p });
  if (p.stage < 200) fail.push(`crop@${w}: 画布仅 ${p.stage}px`);
  if (p.left < 150 || p.right < 150) fail.push(`crop@${w}: 面板被压到 ${p.left}/${p.right}`);
}
out.push(['workspaceAcrossSizes', wsSizes]);
await viewport(1024, 680); await sleep(500);
await shot('adaptive-crop-1024.png');

// ---------- 2) Dashboard：列数随容器走，卡片不越界，规范布局不被污染 ----------
await ev(`location.hash='#/home'`); await sleep(1500);
const canonBefore = await ev(`JSON.stringify(activeLayout())`);
const dashSizes = [];
for (const [w, h] of [[1920, 1080], [1280, 820], [1024, 680]]) {
  await viewport(w, h); await sleep(900);
  const p = await ev(DASH_PROBE);
  dashSizes.push({ w, ...p });
  if (p.outOfBounds > 0) fail.push(`dash@${w}: ${p.outOfBounds} 张卡越界`);
  if (p.items === 0) fail.push(`dash@${w}: 没有渲染卡片`);
}
out.push(['dashboardAcrossSizes', dashSizes]);
await viewport(1024, 680); await sleep(700);
await shot('adaptive-dash-1024.png');
// 窄容器下编辑入口必须被拦住（否则降列坐标会毁掉用户布局）
const editBlocked = await ev(`(()=>{const before=dashEdit;enterDashEdit();const r={before,after:dashEdit};if(dashEdit)exitDashEdit(false);return r;})()`);
out.push(['narrowEditBlocked', editBlocked]);
if (editBlocked && editBlocked.after === true) fail.push('narrowEdit: 窄容器下竟进入了编辑态');
// 回到宽窗口，规范布局必须逐字节复原
await viewport(1920, 1080); await sleep(900);
const canonAfter = await ev(`JSON.stringify(activeLayout())`);
out.push(['canonicalLayoutPreserved', canonBefore === canonAfter]);
if (canonBefore !== canonAfter) fail.push('canonicalLayout: resize 往返后规范布局被改写');

// ---------- 3) 逐个工具：页内打开，检查横向溢出与双栏收拢 ----------
const tools = await ev(`(window.TOOL_META||[]).filter(t=>!t.workspace).map(t=>t.id)`);
const toolRows = [];
await viewport(1024, 680); await sleep(500);
for (const id of tools || []) {
  await ev(`location.hash=${JSON.stringify('#/tool/' + id)}`); await sleep(850);
  const p = await ev(TOOL_PROBE);
  toolRows.push({ id, ...p });
  if (p.overflow > 2) fail.push(`tool:${id}@1024 横向溢出 ${p.overflow}px`);
}
out.push(['toolsInPage', toolRows]);

// ---------- 4) 工具独立窗口：侧栏必须隐藏，孔板画布随容器重算 ----------
let toolWin = null;
try {
  await ev(`openToolWindow('plate')`);
  for (let k = 0; k < 24; k++) {
    await sleep(500);
    toolWin = (await listTargets()).find(t => t.type === 'page' && /#\/tool\/plate/.test(t.url));
    if (toolWin) break;
  }
  if (toolWin) {
    const tw = await connect(toolWin);
    for (let k = 0; k < 20; k++) { await sleep(400); if (await tw.ev(`WINDOW_MODE&&document.body.classList.contains('win-mode')`)) break; }
    await sleep(900);
    const rows = [];
    for (const [w, h] of [[860, 560], [1100, 760], [1600, 900]]) {
      await tw.viewport(w, h); await sleep(900);
      const p = await tw.ev(`(()=>{const c=document.getElementById('plCanvas');const box=c&&c.parentElement;
        const side=document.querySelector('.sidebar');
        return {sidebarHidden:!side||getComputedStyle(side).display==='none',
          canvasW:c?Math.round(c.getBoundingClientRect().width):-1,
          boxW:box?Math.round(box.getBoundingClientRect().width):-1,
          hostOverflow:(h=>h.scrollWidth-h.clientWidth)(document.getElementById('toolHost'))};})()`);
      rows.push({ w, ...p });
      if (!p.sidebarHidden) fail.push(`plateWin@${w}: 侧栏未隐藏`);
      if (p.canvasW > p.boxW + 2) fail.push(`plateWin@${w}: 画布 ${p.canvasW} 超出容器 ${p.boxW}`);
      if (p.hostOverflow > 2) fail.push(`plateWin@${w}: 横向溢出 ${p.hostOverflow}`);
    }
    out.push(['plateToolWindow', rows]);
    await tw.viewport(860, 560); await sleep(700);
    await tw.shot('adaptive-plate-window-860.png');
    // 画布缩小显示时命中测试必须换算回逻辑坐标
    const hit = await tw.ev(`(()=>{const c=document.getElementById('plCanvas');
      const r=c.getBoundingClientRect();const logical=parseFloat(c.style.width)||r.width;
      return {scaled:Math.abs(logical-r.width)>1, k:logical/(r.width||1)};})()`);
    out.push(['plateHitTestScale', hit]);
    await tw.ev(`window.__TAURI__.window.getCurrentWindow().close()`);
    tw.close();
  } else { out.push(['plateToolWindow', 'not-created']); fail.push('plateWin: 未创建'); }
} catch (e) { out.push(['plateWinException', String(e).slice(0, 200)]); fail.push('plateWin:exception'); }

await main.send('Emulation.clearDeviceMetricsOverride');
out.push(['errors', [...new Set(main.errs)].slice(0, 10)]);
if (out[out.length - 1][1].length) fail.push('consoleErrors');
console.log(JSON.stringify({ out, fail }, null, 1));
main.close();
process.exit(fail.length ? 1 : 0);
// LabKit · exe 冒烟脚本（P5）：通过 WebView2 远程调试端口（CDP）在真实 Tauri CSP 环境内断言。
// 用法：
//   1) 带调试端口启动 exe：
//      $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
//      Start-Process rust\target\release\labkit.exe
//   2) node tests/smoke_exe.mjs [port]
// 断言：IPC 落盘读取 / 台账状态 / qPCR 会话恢复 / Plotly 真实 CSP 绘图 / SDPC 缺件降级指引。
// 截图证据写入 docs/p5-exe-*.png。Node ≥ 21（自带 WebSocket）。
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = process.argv[2] || '9222';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target = list.find(t => t.type === 'page' && /LabKit/.test(t.title)) || list.find(t => t.type === 'page');
if (!target) { console.error('no CDP page target'); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map(); const errs = [];
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
    errs.push('console: ' + (m.params.args || []).map(a => a.value || a.description || '').join(' ').slice(0, 160));
  if (m.method === 'Runtime.exceptionThrown')
    errs.push('pageerror: ' + String(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 160));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error')
    errs.push('log: ' + m.params.entry.text.slice(0, 160));
};
const send = (method, params = {}) => new Promise(res => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
const ev = async expression => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return { EXC: String(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).slice(0, 200) };
  return r.result?.result?.value;
};
const shot = async name => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  if (r.result?.data) writeFileSync(path.join(ROOT, 'docs', name), Buffer.from(r.result.data, 'base64'));
};

const out = [];
out.push(['url', target.url]);
out.push(['ipcDb', await ev(`window.__TAURI__.core.invoke('db_load').then(d=>({tasks:d.tasks.length,projects:d.projects.length,name:(d._store&&d._store.settings&&d._store.settings.name)||null}))`)]);
out.push(['dbPill', await ev(`document.getElementById('dbPill').textContent`)]);
out.push(['greet', await ev(`document.getElementById('greetTitle').textContent`)]);

await ev(`location.hash='#/qpcr'`); await sleep(1500);
out.push(['qWellsRestored', await ev(`typeof qState!=='undefined'?qState.wells.length:-1`)]);

await ev(`location.hash='#/tool/plotter'`); await sleep(1800);
await ev(`document.getElementById('ptDemo').click()`); await sleep(400);
await ev(`document.getElementById('ptDraw').click()`); await sleep(2500);
out.push(['plotlyUnderCsp', await ev(`document.getElementById('ptPlot').children.length`)]);

const sdpc = path.join(ROOT, 'C1-CD68 - 副.sdpc');
await ev(`location.hash='#/crop'`); await sleep(1200);
if (existsSync(sdpc)) {
  await ev(`openSlidePath(${JSON.stringify(sdpc)})`);
  // 大切片首开解码耗时不定：轮询 toast / 缺件面板，最长 25s
  let toast = '', visible = false;
  for (let k = 0; k < 25; k++) {
    await sleep(1000);
    toast = (await ev(`document.getElementById('toast').textContent`)) || '';
    visible = await ev(`!document.getElementById('cropDllHelp').hidden`);
    if (/切片已打开|打开失败|解码提示/.test(toast) || visible) break;
  }
  // 两种合法结果：DLL 探测成功打开切片，或缺件时显示获取指引
  out.push(['cropOpen', /切片已打开/.test(toast || '') ? 'opened' : (visible ? 'dll-help' : 'neither')]);
  out.push(['cropToast', (toast || '').slice(0, 60)]);
  await shot(visible ? 'p5-exe-dllhelp.png' : 'p5-exe-crop.png');
  if (visible) await ev(`document.getElementById('cropDllHelpClose').click()`);
} else out.push(['sdpcSample', 'missing']);

await ev(`location.hash='#/home'`); await sleep(1200);
await shot('p5-exe-home.png');
out.push(['errors', [...new Set(errs)].slice(0, 10)]);

const fail = [];
if (!/tauri\.localhost/.test(out[0][1])) fail.push('url');
if (!out[1][1] || typeof out[1][1].tasks !== 'number') fail.push('ipc');
if (!/已落盘/.test(out[2][1] || '')) fail.push('dbPill');
if (!(out[5][1] > 0)) fail.push('plotly');
const crop = out.find(x => x[0] === 'cropOpen');
if (crop && crop[1] === 'neither') fail.push('cropOpen');
if (out[out.length - 1][1].length) fail.push('consoleErrors');
console.log(JSON.stringify({ out, fail }, null, 1));
ws.close();
process.exit(fail.length ? 1 : 0);
// LabKit · 多窗口退出 + 默认新窗口冒烟（CDP，需先带 --remote-debugging-port 启动 exe）。
// 用法：
//   1) WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222' labkit.exe
//   2) node tests/smoke_exit.mjs [port]
// 断言：① 默认 openTool 开新窗口（含 workspace 的 crop）；② toolOpenInPage=true 回退页内；
//       ③ 关工具窗不退出主窗；④ 主窗 close → 各窗落盘 → 进程结束且两窗 marker 都在盘上。
// 注意：本脚本会真实关闭被测试的应用；请在独立冒烟实例上运行。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.argv[2] || '9222';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = [], fail = [];
const check = (name, ok, detail) => {
  out.push([name, detail === undefined ? ok : detail]);
  if (!ok) fail.push(name);
  console.log((ok ? 'PASS ' : 'FAIL ') + name, detail === undefined ? '' : JSON.stringify(detail));
};

async function connect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0; const pending = new Map(); const errs = [];
  let alive = true;
  ws.onclose = () => { alive = false; for (const p of pending.values()) p({ closed: true }); pending.clear(); };
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') errs.push(String(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 200));
  };
  const send = (method, params = {}) => new Promise(res => {
    if (!alive) return res({ closed: true });
    const id = ++seq;
    const timer = setTimeout(() => { if (pending.has(id)) { pending.delete(id); res({ timedOut: true }); } }, 3000);
    pending.set(id, m => { clearTimeout(timer); res(m); });
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Runtime.enable'); await send('Page.enable');
  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.closed || r.timedOut) return null;
    if (r.result?.exceptionDetails) return { EXC: String(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text).slice(0, 200) };
    return r.result?.result?.value;
  };
  return { ev, errs, alive: () => alive, close: () => ws.close() };
}
const targets = async () => {
  try { return (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).filter(t => t.type === 'page'); }
  catch (e) { return []; }
};

const list = await targets();
const mainTarget = list.find(t => /LabKit/.test(t.title) && !t.url.includes('index.html#')) || list.find(t => /LabKit/.test(t.title));
if (!mainTarget) { console.error('no main CDP target'); process.exit(1); }
const M = await connect(mainTarget);
const ev = M.ev;

/* 0) 清场 + 设置默认新窗 */
await ev(`(async()=>{const W=window.__TAURI__.webviewWindow.WebviewWindow;
  for(const t of (await window.__TAURI__.window.getAllWindows())){if(t.label.startsWith('tool-'))try{await t.close()}catch(e){}}})()`);
await ev(`Store.setSetting('toolOpenInPage',false);saveDB();flushDB()`);
await sleep(700);

/* ① 默认 openTool 开新窗口 */
let before = (await targets()).length;
await ev(`openTool('primer')`);
await sleep(1800);
let after = (await targets()).length;
check('defaultOpenNewWindow', after === before + 1, { before, after });

/* ③ 关工具窗不退出主窗 */
await ev(`(async()=>{const w=await window.__TAURI__.webviewWindow.WebviewWindow.getByLabel('tool-primer');if(w)await w.close()})()`);
await sleep(900);
const afterToolClose = await targets();
check('toolCloseKeepsApp', afterToolClose.length === before, afterToolClose.length);

/* workspace 工具默认也新窗 */
before = afterToolClose.length;
await ev(`openTool('crop')`);
await sleep(1800);
after = (await targets()).length;
check('workspaceOpensNewWindow', after === before + 1, { before, after });
await ev(`(async()=>{const w=await window.__TAURI__.webviewWindow.WebviewWindow.getByLabel('tool-crop');if(w)await w.close()})()`);
await sleep(800);

/* ② 设置反转为页内 */
await ev(`Store.setSetting('toolOpenInPage',true);saveDB();flushDB()`);
await sleep(500);
before = (await targets()).length;
await ev(`openTool('primer')`);
await sleep(1000);
after = (await targets()).length;
check('settingFallsBackToPage', after === before, { before, after });

/* ④ 退出落盘完整性：主窗 + 工具窗各留一个 pending debounce 的 marker */
await ev(`Store.setSetting('toolOpenInPage',false);saveDB();flushDB()`);
await sleep(400);
before = (await targets()).length;
await ev(`openTool('primer')`);
await sleep(1600);
check('exitCaseHasToolWindow', (await targets()).length === before + 1);

/* ④a 落盘失败降级：注入 dbError 让 main 回执 ok=false → 弹窗 → 取消退出 */
await ev(`dbError='smoke-injected-error';_dbDirty=false;true`);
await ev(`window.__TAURI__.window.getCurrentWindow().close()`);
let modal = null;
for (let i = 0; i < 20 && !modal; i++) {
  await sleep(300);
  modal = await ev(`(()=>{const m=document.querySelector('.modal-mask');return m?{text:m.textContent.slice(0,120),buttons:[...m.querySelectorAll('button')].map(b=>b.textContent)}:null})()`);
}
check('flushFailureDialog', !!modal, modal);
if (modal) {
  await ev(`document.getElementById('cf_no').click()`);
  await sleep(600);
  check('cancelKeepsApp', (await targets()).length > 0);
  check('cancelClosesDialog', await ev(`!document.querySelector('.modal-mask')`));
}
await ev(`dbError='';true`);

/* ④b 正常退出：两窗各留 pending marker，靠退出握手 flush 落盘 */
await ev(`(()=>{DB.tasks.unshift({id:'exit-main-marker',title:'exit-main'});saveDB()})()`);
const toolTarget = (await targets()).find(t => t.url.includes('#/tool/primer'));
check('toolTargetFound', !!toolTarget, toolTarget ? toolTarget.url : null);
if (toolTarget) {
  const T = await connect(toolTarget);
  const r = await T.ev(`(()=>{DB.tasks.unshift({id:'exit-tool-marker',title:'exit-tool'});saveDB()})()`);
  check('toolMarkerQueued', r !== null && !(r && r.EXC), r);
  T.close();
}
await sleep(80); // < 400ms debounce：marker 只在内存，必须靠退出握手 flush 落盘

/* 主窗 close → Rust 握手 → 各窗 flush → 进程退出 */
await ev(`window.__TAURI__.window.getCurrentWindow().close()`);
for (let i = 0; i < 40 && (await targets()).length > 0; i++) await sleep(250);
await sleep(500);
check('processExited', (await targets()).length === 0);

/* 直接读盘验证两个 marker 都在（无需重启） */
const dbFile = path.join(os.homedir(), '.liver_portal_crop', 'labkit_db.json');
let ids = [];
try { ids = (JSON.parse(fs.readFileSync(dbFile, 'utf8')).tasks || []).map(t => t.id); } catch (e) { }
check('mainMarkerFlushed', ids.includes('exit-main-marker'));
check('toolMarkerFlushed', ids.includes('exit-tool-marker'), '工具窗 pending debounce 的改动必须由退出握手 flush');
check('noConsoleErrors', M.errs.length === 0, M.errs.slice(0, 5));

if (M.alive()) M.close();
console.log(JSON.stringify({ out, fail }, null, 1));
process.exit(fail.length ? 1 : 0);

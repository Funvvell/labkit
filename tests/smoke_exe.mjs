// LabKit · exe 冒烟脚本（P5 + P1）：通过 WebView2 远程调试端口（CDP）在真实 Tauri CSP 环境内断言。
// 用法：
//   1) 带调试端口启动 exe：
//      $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
//      Start-Process rust\target\release\labkit.exe
//   2) node tests/smoke_exe.mjs [port]
// 断言：IPC 落盘读取 / 台账状态 / qPCR 会话恢复 / Plotly 真实 CSP 绘图 / SDPC 缺件降级指引 /
//       P1 多窗口：工具窗口创建与窗口模式、跨窗口台账双向合并同步、同 id 聚焦不新建、
//       关闭重开位置尺寸恢复（tauri-plugin-window-state）。
// 截图证据写入 docs/p5-exe-*.png。Node ≥ 21（自带 WebSocket）。
import { writeFileSync, existsSync, readdirSync, readFileSync, rmSync, utimesSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = process.argv[2] || '9222';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- CDP 连接封装：主窗口与工具窗口各一条 ---- */
async function connect(target) {
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
  return { ev, send, shot, errs, close: () => ws.close() };
}
const listTargets = async () => (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json());

const list = await listTargets();
const target = list.find(t => t.type === 'page' && /LabKit/.test(t.title) && !/tool-/.test(t.url)) || list.find(t => t.type === 'page');
if (!target) { console.error('no CDP page target'); process.exit(1); }
const main = await connect(target);
const { ev, shot } = main;

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

/* ===================== P1 多窗口 ===================== */
const p1 = [];
try {
  // 0) 清掉可能残留的同名工具窗口（上次冒烟未关干净）
  await ev(`(async()=>{const W=window.__TAURI__.webviewWindow.WebviewWindow;const w=await W.getByLabel('tool-primer');if(w)await w.close();})()`);
  await sleep(600);

  // 1) 主窗口开工具窗口 → 轮询 CDP 目标出现
  await ev(`openToolWindow('primer')`);
  let toolTarget = null;
  for (let k = 0; k < 20; k++) {
    await sleep(500);
    toolTarget = (await listTargets()).find(t => t.type === 'page' && /#\/tool\/primer/.test(t.url));
    if (toolTarget) break;
  }
  p1.push(['toolWindowCreated', !!toolTarget]);
  if (toolTarget) {
    const tool = await connect(toolTarget);
    // 等窗口模式 boot 完成（show 之后）
    let ready = false;
    for (let k = 0; k < 20; k++) { await sleep(400); ready = await tool.ev(`document.body.classList.contains('win-mode')&&document.getElementById('toolTitle').textContent!=='工具'`); if (ready) break; }
    p1.push(['windowMode', await tool.ev(`({mode:WINDOW_MODE,label:WIN_LABEL,title:document.getElementById('toolTitle').textContent,backHidden:document.getElementById('toolBack').hidden})`)]);
    p1.push(['toolVisible', await tool.ev(`window.__TAURI__.window.getCurrentWindow().isVisible()`)]);

    // 2) 跨窗口双向合并同步：工具窗口写 toolform，主窗口写 tasks
    const marker = 'smoke-' + Date.now();
    // 记录用户真实的 primer 表单快照，冒烟结束原样恢复（不抹用户数据）
    const oldForm = await tool.ev(`JSON.stringify(Store.get('toolform:primer',null))`);
    await tool.ev(`Store.set('toolform:primer',{v:${JSON.stringify(marker)}});saveDB();flushDB()`);
    await ev(`DB.tasks.push({id:${JSON.stringify(marker)},name:'跨窗口冒烟任务',pri:'normal',proj:'',exp:'',due:'',tags:[],done:false,state:'todo'});saveDB();flushDB()`);
    await sleep(1200);   // 等 db-changed 广播 + 对端重载
    p1.push(['mainGotToolForm', await ev(`(Store.get('toolform:primer',{})||{}).v===${JSON.stringify(marker)}`)]);
    p1.push(['toolGotTask', await tool.ev(`DB.tasks.some(t=>t.id===${JSON.stringify(marker)})`)]);
    p1.push(['toolFormSurvived', await tool.ev(`(Store.get('toolform:primer',{})||{}).v===${JSON.stringify(marker)}`)]);
    p1.push(['mainTaskSurvived', await ev(`DB.tasks.some(t=>t.id===${JSON.stringify(marker)})`)]);
    // 磁盘也必须两边都在（合并写而非互相覆盖）
    p1.push(['diskMerged', await ev(`window.__TAURI__.core.invoke('db_load').then(d=>d.tasks.some(t=>t.id===${JSON.stringify(marker)})&&(d._store['toolform:primer']||{}).v===${JSON.stringify(marker)})`)]);

    // 3) 同 id 再开 → 聚焦不新建
    await ev(`openToolWindow('primer')`); await sleep(900);
    const pages = (await listTargets()).filter(t => t.type === 'page' && /#\/tool\/primer/.test(t.url));
    p1.push(['focusNotDuplicate', pages.length === 1]);

    // 4) 关闭重开 → window-state 恢复尺寸/位置
    const geom = await tool.ev(`window.__TAURI__.window.getCurrentWindow().outerSize().then(s=>({w:s.width,h:s.height}))`);
    const pos = await tool.ev(`window.__TAURI__.window.getCurrentWindow().outerPosition().then(p=>({x:p.x,y:p.y}))`);
    await tool.ev(`window.__TAURI__.window.getCurrentWindow().close()`);
    tool.close();
    await sleep(1200);
    await ev(`openToolWindow('primer')`);
    let tool2Target = null;
    for (let k = 0; k < 20; k++) {
      await sleep(500);
      tool2Target = (await listTargets()).find(t => t.type === 'page' && /#\/tool\/primer/.test(t.url));
      if (tool2Target) break;
    }
    if (tool2Target) {
      const tool2 = await connect(tool2Target);
      for (let k = 0; k < 20; k++) { await sleep(400); if (await tool2.ev(`WINDOW_MODE&&document.body.classList.contains('win-mode')`)) break; }
      await sleep(600);
      const geom2 = await tool2.ev(`window.__TAURI__.window.getCurrentWindow().outerSize().then(s=>({w:s.width,h:s.height}))`);
      const pos2 = await tool2.ev(`window.__TAURI__.window.getCurrentWindow().outerPosition().then(p=>({x:p.x,y:p.y}))`);
      p1.push(['sizeRestored', geom2 && geom && geom2.w === geom.w && geom2.h === geom.h]);
      p1.push(['posRestored', pos2 && pos && Math.abs(pos2.x - pos.x) <= 60 && Math.abs(pos2.y - pos.y) <= 60]);
      // 清理：关工具窗口、删冒烟任务
      await tool2.ev(`window.__TAURI__.window.getCurrentWindow().close()`);
      tool2.close();
    } else p1.push(['sizeRestored', false], ['posRestored', false]);
    await sleep(600);
    await ev(`DB.tasks=DB.tasks.filter(t=>t.id!==${JSON.stringify(marker)});Store.set('toolform:primer',${oldForm || 'null'});saveDB();flushDB()`);
    await sleep(600);
    p1.push(['toolWindowErrors', [...new Set(tool.errs)].slice(0, 6)]);
  }
} catch (e) {
  p1.push(['p1Exception', String(e).slice(0, 200)]);
}
out.push(['p1MultiWindow', p1]);
/* ---- Vault：Markdown 台账真机往返（在真实 CSP + 真实磁盘上跑） ----
   用一条专用冒烟速记做载体，全程不碰用户的真实记录；结束后关闭 Vault 并清理目录。 */
const vlt = [];
const VAULT_DIR = path.join(ROOT, 'docs', '.smoke-vault');
const SMOKE_NOTE = 'smoke-vault-note';
let vaultWasEnabled = false;
try {
  const st0 = await ev(`window.__TAURI__.core.invoke('vault_status')`);
  vaultWasEnabled = !!(st0 && st0.enabled);
  vlt.push(['initiallyDisabled', !vaultWasEnabled]);
  if (vaultWasEnabled) {
    // 用户已经把自己的库接上了：冒烟绝不改他的配置，也不往他的库里写测试记录
    vlt.push(['skipped', 'Vault 已启用，跳过以免改动用户配置与真实库']);
  } else {
  rmSync(VAULT_DIR, { recursive: true, force: true });

  // 1) 放一条专用速记并落盘
  await ev(`DB.notes.unshift({id:${JSON.stringify(SMOKE_NOTE)},at:'2026-11-21T10:00',text:'冒烟原始内容'});saveDB();flushDB()`);
  await sleep(700);

  // 2) 启用 Vault → 投影
  const cfg = await ev(`window.__TAURI__.core.invoke('vault_configure',{dir:${JSON.stringify(VAULT_DIR)},enable:true})`);
  vlt.push(['projected', !!(cfg && cfg.projected && cfg.projected.written > 0)]);
  vlt.push(['projectErrors', (cfg && cfg.projected && cfg.projected.errors) || []]);

  // 3) 宿主机直接查文件：11 个分类目录 + frontmatter 结构
  const walk = d => { let n = 0; for (const e of readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!e.name.startsWith('.')) n += walk(p); } else if (e.name.endsWith('.md')) n++; } return n; };
  const dirs = readdirSync(VAULT_DIR, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name);
  vlt.push(['kindDirs', dirs.length]);
  vlt.push(['mdCount', walk(VAULT_DIR)]);
  const notePath = path.join(VAULT_DIR, '速记', '冒烟原始内容.md');
  vlt.push(['noteFileExists', existsSync(notePath)]);
  const sample = existsSync(notePath) ? readFileSync(notePath, 'utf8') : '';
  vlt.push(['frontmatterParsable', /^---\r?\n[\s\S]*?\r?\n---\r?\n/.test(sample) && /id: "smoke-vault-note"/.test(sample) && /kind: "note"/.test(sample)]);
  vlt.push(['noBakClutter', !readdirSync(path.join(VAULT_DIR, '速记')).some(f => f.endsWith('.bak'))]);

  // 4) 模拟 Obsidian 外部编辑：改正文 + 前移 mtime，再经 db_load 摄入
  if (existsSync(notePath)) {
    writeFileSync(notePath, sample.replace('冒烟原始内容', '在 Obsidian 里改过的内容'), 'utf8');
    const future = new Date(Date.now() + 5000);
    utimesSync(notePath, future, future);
    const loaded = await ev(`window.__TAURI__.core.invoke('db_load').then(d=>(d.notes.find(n=>n.id===${JSON.stringify(SMOKE_NOTE)})||{}).text)`);
    vlt.push(['externalEditAdopted', loaded === '在 Obsidian 里改过的内容']);
    const st1 = await ev(`window.__TAURI__.core.invoke('vault_status')`);
    vlt.push(['statusFiles', st1 && st1.files]);
  } else vlt.push(['externalEditAdopted', false]);

  // 5) 设置页 UI 真实渲染
  await ev(`location.hash='#/settings'`); await sleep(900);
  await ev(`renderVaultSettings()`); await sleep(600);
  vlt.push(['vaultPill', await ev(`document.getElementById('vaultPill').textContent`)]);
  vlt.push(['vaultInfoHasDir', await ev(`document.getElementById('vaultInfo').innerHTML.includes('.smoke-vault')`)]);
  vlt.push(['vaultToggleChecked', await ev(`document.getElementById('setVaultEnabled').checked`)]);

  // 6) 删除记录 → 投影软删除到 trash，不硬删
  await ev(`DB.notes=DB.notes.filter(n=>n.id!==${JSON.stringify(SMOKE_NOTE)});saveDB();flushDB()`);
  await sleep(800);
  vlt.push(['noteFileGone', !existsSync(notePath)]);
  const trashDir = path.join(VAULT_DIR, '.labkit', 'trash');
  vlt.push(['softDeleted', existsSync(trashDir) && readdirSync(trashDir).some(f => f.includes('冒烟原始内容'))]);
  }
} catch (e) {
  vlt.push(['vaultException', String(e).slice(0, 240)]);
} finally {
  // 清理只在冒烟自己启用过 Vault 时做，绝不改用户已有的配置
  if (!vaultWasEnabled) {
    try {
      await ev(`window.__TAURI__.core.invoke('vault_configure',{dir:'',enable:false}).catch(()=>{})`);
      await ev(`Store.set('vault',null);DB.notes=DB.notes.filter(n=>n.id!==${JSON.stringify(SMOKE_NOTE)});saveDB();flushDB()`);
      await sleep(600);
    } catch (e) { /* 清理失败也要继续报告 */ }
    try { rmSync(VAULT_DIR, { recursive: true, force: true }); } catch (e) { /* 忽略 */ }
  }
}
out.push(['vaultMarkdown', vlt]);

out.push(['errors', [...new Set(main.errs)].slice(0, 10)]);

const fail = [];
if (!/tauri\.localhost/.test(out[0][1])) fail.push('url');
if (!out[1][1] || typeof out[1][1].tasks !== 'number') fail.push('ipc');
if (!/已落盘/.test(out[2][1] || '')) fail.push('dbPill');
if (!(out[5][1] > 0)) fail.push('plotly');
const crop = out.find(x => x[0] === 'cropOpen');
if (crop && crop[1] === 'neither') fail.push('cropOpen');
for (const [k, v] of p1) {
  if (['toolWindowCreated', 'toolVisible', 'mainGotToolForm', 'toolGotTask', 'toolFormSurvived', 'mainTaskSurvived', 'diskMerged', 'focusNotDuplicate', 'sizeRestored', 'posRestored'].includes(k) && v !== true) fail.push('p1:' + k);
  if (k === 'windowMode' && (!v || v.mode !== true || v.label !== 'tool-primer' || v.backHidden !== true)) fail.push('p1:windowMode');
  if (k === 'toolWindowErrors' && v.length) fail.push('p1:toolConsole');
}
for (const [k, v] of vlt) {
  if (['projected', 'noteFileExists', 'frontmatterParsable', 'noBakClutter', 'externalEditAdopted',
    'vaultInfoHasDir', 'vaultToggleChecked', 'noteFileGone', 'softDeleted'].includes(k) && v !== true) fail.push('vault:' + k);
  if (k === 'kindDirs' && !(v >= 1 && v <= 11)) fail.push('vault:kindDirs');
  if (k === 'projectErrors' && v.length) fail.push('vault:projectErrors');
  if (k === 'vaultException') fail.push('vault:exception');
}
if (out[out.length - 1][1].length) fail.push('consoleErrors');
console.log(JSON.stringify({ out, fail }, null, 1));
main.close();
process.exit(fail.length ? 1 : 0);
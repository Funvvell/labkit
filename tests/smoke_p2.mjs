// LabKit · P2 exe 冒烟：真实 WebView2 CSP 下断言 gridstack 自由网格全链路。
// 用法：
//   1) $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
//      Start-Process rust\target\debug\labkit.exe
//   2) node tests/smoke_p2.mjs [port]
// 断言：GridStack 可用 / v2 节点布局 / 非编辑静态 / 编辑态引擎移动标脏 /
//       真实鼠标拖拽右下角改尺寸→吸附声明档→正文重渲染 / 保存落盘 v2 / 取消还原 /
//       键盘移动 / 密度联动 cellHeight / GridStack 缺失回退顺序网格 / picker 与精确对话框 /
//       首页渲染与导航回归。结束恢复用户原布局（localStorage 原样写回 + reload）。
// 截图证据 docs/p2-exe-*.png。Node ≥ 21（自带 WebSocket）。
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
  const mouse = async (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', ...extra });
  return { ev, send, shot, mouse, errs, close: () => ws.close() };
}

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target = list.find(t => t.type === 'page' && /LabKit/.test(t.title) && !/tool-/.test(t.url)) || list.find(t => t.type === 'page');
if (!target) { console.error('no CDP page target'); process.exit(1); }
const main = await connect(target);
const { ev, shot, mouse } = main;

const out = [];
const fail = [];
const check = (name, cond, detail) => { out.push([name, detail !== undefined ? detail : cond]); if (!cond) fail.push(name); };

/* 用户原布局快照：结束时原样写回，冒烟不留痕 */
const origRaw = await ev(`localStorage.getItem('labkit.dash.v1')`);
const origDensity = await ev(`(DB.ui&&DB.ui.density)||'normal'`);

await ev(`location.hash='#/home'`); await sleep(1200);

/* 1) GridStack 与 v2 布局 */
check('gsAvailable', await ev(`typeof window.GridStack==='function'&&typeof window.GridStack.init==='function'`));
out.push(['gsVersion', await ev(`window.GridStack&&window.GridStack.GDRev||null`)]);
check('gridClass', await ev(`document.getElementById('dashGrid').classList.contains('grid-stack')`));
const n0 = await ev(`activeLayout().length`);
check('itemCount', await ev(`document.querySelectorAll('#dashGrid .grid-stack-item').length`) === n0 && n0 > 0, n0);
check('v2Nodes', await ev(`Array.isArray(dashLayout)&&dashLayout.length>0&&dashLayout.every(n=>typeof n.x==='number'&&typeof n.y==='number'&&n.w>=1&&n.h>=1)`));
check('staticWhenIdle', await ev(`_gs.opts.disableDrag===true&&_gs.opts.disableResize===true`));
await shot('p2-exe-grid.png');

/* 2) 编辑态：引擎移动 → change 事件同步草稿 → 标脏 */
await ev(`enterDashEdit()`); await sleep(500);
check('editEnablesDrag', await ev(`dashEdit===true&&_gs.opts.disableDrag===false&&_gs.opts.disableResize===false`));
const moved = await ev(`(()=>{
  const L=dashDraft,n=L[L.length-1];
  const el=document.querySelector('#dashGrid .grid-stack-item[gs-id="'+n.id+'"]');
  const before={x:n.x,y:n.y};
  _gs.update(el,{y:n.y+1});
  return {id:n.id,before,after:{x:n.x,y:n.y},dirty:layoutDirty()};
})()`);
check('engineMoveSyncsDraft', moved && moved.after.y === moved.before.y + 1 && moved.dirty === true, moved);
await shot('p2-exe-edit.png');

/* 3) 真实鼠标拖右下角改尺寸：reagents 1x2 → 期望吸附到声明档（如 2x3） */
await ev(`(()=>{if(!dashDraft.some(x=>x.id==='reagents')){addWidget('reagents');touchDraft()}})()`); await sleep(400);
const rz = await ev(`(()=>{
  const el=document.querySelector('#dashGrid .grid-stack-item[gs-id="reagents"]');
  const h=el.querySelector('.ui-resizable-se');
  const r=h.getBoundingClientRect(),g=document.getElementById('dashGrid').getBoundingClientRect();
  const n=dashDraft.find(x=>x.id==='reagents');
  return {cx:r.left+r.width/2,cy:r.top+r.height/2,dx:g.width/4,dy:_gs.opts.cellHeight,before:{w:n.w,h:n.h}};
})()`);
if (rz && !rz.EXC) {
  await mouse('mousePressed', rz.cx, rz.cy, { clickCount: 1 });
  for (let i = 1; i <= 6; i++) { await mouse('mouseMoved', rz.cx + rz.dx * i / 6, rz.cy + rz.dy * i / 6); await sleep(60); }
  await mouse('mouseReleased', rz.cx + rz.dx, rz.cy + rz.dy, { clickCount: 1 });
  await sleep(600);
  const after = await ev(`(()=>{
    const n=dashDraft.find(x=>x.id==='reagents');
    const card=document.querySelector('#dashGrid .wcard[data-w="reagents"]');
    return {w:n.w,h:n.h,declared:(WIDGETS.reagents.sizes||[]).includes(n.w+'x'+n.h),
      tag:card.dataset.size,body:!!card.querySelector('#reagentCard'),dirty:layoutDirty()};
  })()`);
  check('mouseResizeSnaps', after && after.declared && (after.w !== rz.before.w || after.h !== rz.before.h), { before: rz.before, after });
  check('resizeRerendersBody', after && after.tag === after.w + 'x' + after.h && after.body === true);
} else { check('mouseResizeSnaps', false, rz); check('resizeRerendersBody', false, 'no-handle'); }

/* 4) 键盘移动（编辑态焦点卡片 ArrowDown） */
const kb = await ev(`(()=>{
  const n=dashDraft[dashDraft.length-1];
  const card=document.querySelector('#dashGrid .wcard[data-w="'+n.id+'"]');
  card.focus();
  const y0=n.y;
  card.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
  const n2=dashDraft.find(x=>x.id===n.id);
  return {y0,y1:n2?n2.y:-1};
})()`);
check('keyboardMove', kb && kb.y1 === kb.y0 + 1, kb);

/* 5) 保存 → localStorage v2；非编辑恢复静态 */
await ev(`exitDashEdit(true)`); await sleep(500);
const saved = await ev(`(()=>{try{const r=JSON.parse(localStorage.getItem('labkit.dash.v1'));return {v:r.v,same:JSON.stringify(r.nodes)===JSON.stringify(dashLayout)}}catch(e){return {EXC:String(e)}}})()`);
check('saveV2', saved && saved.v === 2 && saved.same === true, saved);
check('staticAfterSave', await ev(`dashEdit===false&&_gs.opts.disableDrag===true`));

/* 6) 取消还原 */
const cancel = await ev(`(()=>{
  const snap=JSON.stringify(dashLayout);
  enterDashEdit();
  const n=dashDraft[dashDraft.length-1];
  const el=document.querySelector('#dashGrid .grid-stack-item[gs-id="'+n.id+'"]');
  _gs.update(el,{y:n.y+2});
  const dirty=layoutDirty();
  exitDashEdit(false);
  return {dirty,restored:JSON.stringify(dashLayout)===snap};
})()`);
check('cancelRestores', cancel && cancel.dirty === true && cancel.restored === true, cancel);

/* 7) 密度联动：compact → cellHeight 128，恢复 normal → 152（不落盘） */
const dens = await ev(`(()=>{
  DB.ui=Object.assign({},DB.ui,{density:'compact'});applyDensity();
  const compact=_gs.opts.cellHeight;
  DB.ui=Object.assign({},DB.ui,{density:${JSON.stringify(origDensity)}});applyDensity();
  return {compact,restored:_gs.opts.cellHeight};
})()`);
check('densityCellHeight', dens && dens.compact === 128 && dens.restored === (origDensity === 'compact' ? 128 : origDensity === 'cozy' ? 176 : 152), dens);

/* 8) GridStack 缺失 → 回退顺序网格；恢复后回到自由网格 */
const fb = await ev(`(()=>{
  const GS=window.GridStack;window.GridStack=undefined;
  buildDash();refreshHome();
  const g=document.getElementById('dashGrid');
  const fallback=!g.classList.contains('grid-stack')&&!!g.querySelector('.wcard.w2,.wcard.w4')&&!_gs;
  window.GridStack=GS;buildDash();refreshHome();
  return {fallback,back:g.classList.contains('grid-stack')&&!!_gs};
})()`);
check('fallbackGrid', fb && fb.fallback === true && fb.back === true, fb);

/* 9) picker 与精确对话框能开能关 */
const dialogs = await ev(`(()=>{
  openPicker();
  const picker=!!document.querySelector('.modal-mask .picker-grid');
  document.getElementById('pk_done').click();
  widgetDialog('kpi');
  const cfg=!!document.querySelector('.modal-mask');
  const m=document.querySelector('.modal-mask');if(m)m.remove();
  return {picker,cfg};
})()`);
check('pickerAndDialog', dialogs && dialogs.picker === true && dialogs.cfg === true, dialogs);

/* 10) 首页渲染与导航回归 */
check('homeCardsRendered', await ev(`!!document.querySelector('#dashGrid .card-body')&&document.querySelectorAll('#dashGrid .wcard').length>0`));
await ev(`navigate('tasks')`); await sleep(600);
check('navTasks', await ev(`_route.name==='tasks'`));
await ev(`navigate('home')`); await sleep(600);
check('navHome', await ev(`_route.name==='home'`));

/* 11) 恢复用户原布局并 reload 验证 */
await ev(origRaw === null
  ? `localStorage.removeItem('labkit.dash.v1')`
  : `localStorage.setItem('labkit.dash.v1',${JSON.stringify(origRaw)})`);
await ev(`location.reload()`); await sleep(2500);
const restored = await ev(`(()=>{
  const raw=localStorage.getItem('labkit.dash.v1');
  if(raw===null)return {noLayout:true,ok:Array.isArray(dashLayout)&&dashLayout.length===11};
  return {ok:JSON.stringify(migrateLayout(JSON.parse(raw)))===JSON.stringify(dashLayout)};
})()`);
check('userLayoutRestored', restored && restored.ok === true, restored);

check('noConsoleErrors', main.errs.length === 0, main.errs.slice(0, 5));

console.log(JSON.stringify({ out, fail }, null, 1));
main.close();
process.exit(fail.length ? 1 : 0);
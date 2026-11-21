// LabKit · 字体真机验证：在真实 Tauri CSP 环境里确认本地 woff2 真的加载、
// 子集覆盖界面用到的希腊/数学符号、等宽数字生效、双主题渲染正常。
//
// 用法：带 --remote-debugging-port=9222 启动 exe 后 node tests/smoke_fonts.mjs [port]
// 静态契约（文件存在 / sha256 / 无 CDN / 半像素清零）见 tests/js/typography.test.mjs。
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = process.argv[2] || '9222';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target = list.find(t => t.type === 'page' && !/tool-/.test(t.url)) || list.find(t => t.type === 'page');
if (!target) { console.error('no CDP page target'); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map(); const errs = [];
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') errs.push('pageerror: ' + String(m.params.exceptionDetails.exception?.description || '').slice(0, 160));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push('console: ' + (m.params.args || []).map(a => a.value || a.description || '').join(' ').slice(0, 160));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errs.push('log: ' + m.params.entry.text.slice(0, 160));
};
const send = (method, params = {}) => new Promise(res => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
const ev = async x => {
  const r = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return { EXC: String(r.result.exceptionDetails.exception?.description || '').slice(0, 200) };
  return r.result?.result?.value;
};
const shot = async name => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  if (r.result?.data) writeFileSync(path.join(ROOT, 'docs', name), Buffer.from(r.result.data, 'base64'));
};

const out = []; const fail = [];
await ev(`location.hash='#/home'`); await sleep(1500);
await ev(`document.fonts.ready.then(()=>true)`); await sleep(600);

// 1) 本地字体真的加载成功（而不是静默回退到系统字体）
const loaded = await ev(`(()=>{const f=[...document.fonts].map(x=>({fam:x.family,status:x.status,weight:x.weight}));
  return {faces:f, interReady:document.fonts.check('13px Inter'), monoReady:document.fonts.check('13px "JetBrains Mono"')};})()`);
out.push(['fontFaces', loaded]);
if (!loaded.interReady) fail.push('Inter 未加载');
if (!loaded.monoReady) fail.push('JetBrains Mono 未加载');
if (!(loaded.faces || []).some(f => /Inter/.test(f.fam) && f.status === 'loaded')) fail.push('Inter FontFace 状态非 loaded');

// 2) 子集覆盖界面用到的希腊字母 / 数学符号 / 箭头 / 温度
const coverage = await ev(`(()=>{const t='αβχΔµ×÷±≤≥≈≠∑√−℃→′″–—…²³';
  return {inter:document.fonts.check('13px Inter',t), mono:document.fonts.check('13px "JetBrains Mono"',t)};})()`);
out.push(['glyphCoverage', coverage]);
if (!coverage.inter) fail.push('Inter 子集缺希腊/数学符号');
if (!coverage.mono) fail.push('JetBrains Mono 子集缺希腊/数学符号');

// 3) 计算样式：栈首 Inter、等宽数字、抗锯齿
const styles = await ev(`(()=>{const b=getComputedStyle(document.body);
  const td=document.querySelector('.tbl td')||document.querySelector('.kpi .num')||document.body;
  const cs=getComputedStyle(td);
  return {bodyFamily:b.fontFamily.slice(0,40), bodyNumeric:b.fontVariantNumeric,
    smoothing:b.webkitFontSmoothing||b.getPropertyValue('-webkit-font-smoothing'),
    numFamily:cs.fontFamily.slice(0,30), numFeature:cs.fontFeatureSettings};})()`);
out.push(['computedStyles', styles]);
if (!/^"?Inter/.test(styles.bodyFamily)) fail.push('body 栈首不是 Inter');
if (!/tabular-nums/.test(styles.bodyNumeric)) fail.push('body 未开 tabular-nums');

// 4) 中文仍由系统字体承担：Inter 无 CJK，canvas 会回退到系统默认中文字体，
//    因此「Inter 量出的中文宽度」应等于「雅黑量出的宽度」（同一字体）。
//    若 Inter 真含 CJK，两者宽度才会不同。
const cjk = await ev(`(()=>{const c=document.createElement('canvas').getContext('2d');
  c.font='13px Inter';const a=c.measureText('科研台账').width;
  c.font='13px "Microsoft YaHei UI"';const b=c.measureText('科研台账').width;
  c.font='13px Inter';const la=c.measureText('LabKit').width;
  c.font='13px "Segoe UI"';const lb=c.measureText('LabKit').width;
  return {cjkInter:a,cjkYaHei:b,cjkUsesSystem:Math.abs(a-b)<0.5,latinInter:la,latinSegoe:lb,latinDiffers:Math.abs(la-lb)>0.5};})()`);
out.push(['cjkFallback', cjk]);
if (!cjk.cjkUsesSystem) fail.push('中文未回退到系统字体（Inter 不应含 CJK）');
if (!cjk.latinDiffers) fail.push('拉丁未用 Inter（与 Segoe 宽度相同）');

// 5) 双主题截图（结束后恢复用户原主题）
const origTheme = await ev(`Store.settings().theme||'system'`);
await shot('fonts-home-light.png');
await ev(`Store.setSetting('theme','dark');applyTheme()`); await sleep(700);
out.push(['darkTheme', await ev(`document.documentElement.dataset.theme`)]);
await shot('fonts-home-dark.png');
await ev(`Store.setSetting('theme',${JSON.stringify(origTheme)});applyTheme()`); await sleep(500);

// 6) 孔板画布文字用应用字体；期刊图常量需先加载 plotter（qpcr-plots 按需注入）
await ev(`location.hash='#/tool/plate'`); await sleep(1400);
const plate = await ev(`(()=>{const c=document.getElementById('plCanvas');return c?{present:true}:{present:false};})()`);
out.push(['plateCanvas', plate]);
await ev(`location.hash='#/tool/plotter'`); await sleep(1600);
const journal = await ev(`window.QpcrPlots?window.QpcrPlots.JOURNAL_FONT:null`);
out.push(['journalFont', journal]);
if (journal !== 'Arial, Helvetica, sans-serif') fail.push('期刊字体常量不符');
// 等宽上下文（.tmono）应带斜杠零
const monoFeat = await ev(`(()=>{const e=document.querySelector('.tmono');return e?getComputedStyle(e).fontFeatureSettings:null;})()`);
out.push(['monoFeature', monoFeat]);
if (!/zero/.test(monoFeat || '')) fail.push('.tmono 未开斜杠零');

out.push(['errors', [...new Set(errs)].slice(0, 10)]);
if (out[out.length - 1][1].length) fail.push('consoleErrors');
console.log(JSON.stringify({ out, fail }, null, 1));
ws.close();
process.exit(fail.length ? 1 : 0);
// LabKit · toolhub.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 科研小工具库：按需加载 ===================== */
const _loadedScripts=new Set();
function loadScript(src){
  if(_loadedScripts.has(src))return Promise.resolve();
  return new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=()=>{_loadedScripts.add(src);res();};
    s.onerror=()=>rej(new Error('加载失败 '+src));
    document.head.appendChild(s);
  });
}
/* 工具卡图标：沿用侧栏线性风格（1.8px 描边），底色按分组低饱和着色 */
const TOOL_GROUP_COLOR={'统计与数据':'#7B5CFF','实验计算':'#2FA96B','写作与图':'#F0832A'};
const TOOL_ICONS={
  crop:'<path d="M6 3v14a2 2 0 0 0 2 2h13M3 6h14a2 2 0 0 1 2 2v13"/>',
  qpcr:'<path d="M4 19V9M10 19V5M16 19V11M22 19V7"/>',
  epi2x2:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/>',
  samplesize:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1M16 4.6a3.4 3.4 0 0 1 0 6.8M18.5 14.4a5 5 0 0 1 3 4.6v1"/>',
  tests:'<path d="M9 3h6M10 3v6l-5.2 9.1A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9V3M7.5 15h9"/>',
  table1:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 5v14"/>',
  randomize:'<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  'data-wash':'<path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/>',
  apa:'<path d="M4 6h16M4 12h10M4 18h7M17 15l3 3-3 3"/>',
  labcalc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  primer:'<path d="M8 3v3.5a4 4 0 0 0 8 0V3M8 21v-3.5a4 4 0 0 1 8 0V21M7 12h10"/>',
  plate:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.7"/><circle cx="15.5" cy="8.5" r="1.7"/><circle cx="8.5" cy="15.5" r="1.7"/><circle cx="15.5" cy="15.5" r="1.7"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9.5V13l2.5 2.5M9.5 2h5"/>',
  eln:'<path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zM8 2v20M12 7h5M12 11h5"/>',
  inventory:'<path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8"/>',
  plotter:'<path d="M3 3v18h18M7 14l4-4 3 3 5-6"/>',
  figure:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
  imgbatch:'<rect x="3" y="5" width="13" height="13" rx="2"/><path d="M16 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-3M3 15l4-4 5 5M7.5 9h.01"/>',
  checklists:'<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  tableconv:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  _default:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 12h6M12 9v6"/>'
};
function toolIcon(id){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${TOOL_ICONS[id]||TOOL_ICONS._default}</svg>`}
function renderToolHub(){
  const groups={};
  (window.TOOL_META||[]).forEach(t=>{(groups[t.group]=groups[t.group]||[]).push(t)});
  const host=document.getElementById('toolhubGrid');
  host.innerHTML=Object.entries(groups).map(([g,ts])=>`<div class="toolhub-group"><h3>${esc(g)}</h3><div class="toolhub-grid">${ts.map(t=>`<button class="tool-card" data-tool-id="${t.id}" style="--tc:${TOOL_GROUP_COLOR[g]||'#007AFF'}"><span class="tc-ico">${toolIcon(t.id)}</span><span class="tc-body"><span class="tc-name">${esc(t.name)}</span><span class="tc-desc">${esc(t.desc)}</span></span></button>`).join('')}</div></div>`).join('');
  host.querySelectorAll('[data-tool-id]').forEach(b=>b.onclick=()=>openTool(b.dataset.toolId));
}
async function openTool(id){
  const meta=(window.TOOL_META||[]).find(t=>t.id===id);
  if(!meta){toast('工具不存在');return}
  /* 内置工作区（图像裁剪 / qPCR）：直接打开对应视图，返回键回到工具库 */
  if(meta.workspace){_wsBackNext='toolhub';openView(meta.id);return}
  openView('tool');
  setText('toolTitle',meta.name);
  setText('toolSub',meta.desc);
  const src=document.getElementById('toolSource');
  if(meta.source){src.innerHTML='<b>技术来源</b> · '+esc(meta.source);src.hidden=false;}
  else{src.hidden=true;src.textContent='';}
  const host=document.getElementById('toolHost');
  host.innerHTML='<div class="tnote">加载中…</div>';
  try{
    for(const s of meta.scripts)await loadScript(s);
    const fn=window.LabKitTools[id];
    if(typeof fn!=='function')throw new Error('工具未注册：'+id);
    host.innerHTML='';
    fn(host);
  }catch(err){
    host.innerHTML='<div class="terr">'+esc(err.message||String(err))+'</div>';
  }
}
document.getElementById('toolBack').onclick=()=>openView('toolhub');
renderToolHub();
/* 工作区顶栏下方的技术来源小字，与工具库注册表同源 */
(function(){
  const byId=Object.fromEntries((window.TOOL_META||[]).map(t=>[t.id,t]));
  [['cropSource','crop'],['qpcrSource','qpcr']].forEach(([el,id])=>{
    const n=document.getElementById(el),m=byId[id];
    if(n&&m&&m.source)n.innerHTML='<b>技术来源</b> · '+esc(m.source);
  });
})();


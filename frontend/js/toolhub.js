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
  host.innerHTML=Object.entries(groups).map(([g,ts])=>`<div class="toolhub-group"><h3>${esc(g)}</h3><div class="toolhub-grid">${ts.map(t=>`<button class="tool-card" data-tool-id="${t.id}" style="--tc:${TOOL_GROUP_COLOR[g]||'#007AFF'}"><span class="tc-ico">${toolIcon(t.id)}</span><span class="tc-body"><span class="tc-name">${esc(t.name)}</span><span class="tc-desc">${esc(t.desc)}</span></span>${IN_TAURI?`<span class="tc-win" data-tool-window="${t.id}" role="button" aria-label="在新窗口打开 ${esc(t.name)}" title="在新窗口打开（也可 Ctrl/⌘+点击或中键）">↗</span>`:''}<span class="tc-fav${Store.isFav(t.id)?' on':''}" data-fav-toggle="${t.id}" role="button" aria-label="固定 ${esc(t.name)}" title="固定 / 取消固定">${Store.isFav(t.id)?'★':'☆'}</span></button>`).join('')}</div></div>`).join('');
  /* 点击统一由 shell.js 委托处理（含卡内星标，避免嵌套 button 与双触发） */
}
/* P1：openTool 只改路由；渲染由 renderRoute → renderTool 完成（深链/刷新/前进后退同路径）。
   设置「工具默认在新窗口打开」或工具窗口内再开工具 → 走独立窗口（保持窗口身份稳定）。 */
function openTool(id){
  const meta=(window.TOOL_META||[]).find(t=>t.id===id);
  if(!meta){toast('工具不存在');return}
  /* 桌面版默认所有工具开独立窗口；设置 toolOpenInPage=true 才回退页内。
     工具窗口内再开工具恒新窗；浏览器模式无 Tauri 仍走页内（file:// 可演示）。 */
  if(IN_TAURI&&(WINDOW_MODE||!Store.settings().toolOpenInPage)){openToolWindow(id);return}
  /* 内置工作区（图像裁剪 / qPCR）：直接打开对应视图，返回键走真实历史 */
  if(meta.workspace){navigate(meta.id);return}
  navigate('tool',id);
}
/* P1：工具独立窗口（Tauri 2 WebviewWindow，官方多窗口能力，零构建可用）。
   同 id 已存在 → 聚焦不新建；创建失败 → toast + 回退页内打开（浏览器模式永远页内）。
   visible:false 防闪烁：window-state 插件先恢复尺寸/位置，boot 渲染就绪后 show()。 */
async function openToolWindow(id){
  if(!IN_TAURI){openTool(id);return}
  const meta=(window.TOOL_META||[]).find(t=>t.id===id);
  if(!meta){toast('工具不存在');return}
  /* 先转义 _ 为 __ 再替换其它非法字符，避免 a_b 与 a-b 撞名；截断防超长 label。
     内置 crop/qpcr 不含下划线，boot.js 的 WIN_LABEL==='tool-crop' 判断不受影响。 */
  const label='tool-'+String(id).replace(/_/g,'__').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,48);
  const url='index.html#/'+(meta.workspace?meta.id:'tool/'+id);
  const WW=window.__TAURI__.webviewWindow;
  /* 回退必须直接页内导航：openTool 在窗口模式/默认新窗口设置下会再调 openToolWindow，形成递归 */
  const fallback=()=>{toast('新窗口打开失败，已在页内打开');meta.workspace?navigate(meta.id):navigate('tool',id)};
  const focusExisting=async()=>{
    const w=await WW.WebviewWindow.getByLabel(label);
    if(w){try{await w.setFocus();return true}catch(e){}}
    return false;
  };
  try{
    if(await focusExisting())return;
    const win=new WW.WebviewWindow(label,{
      url,title:meta.name+' · 科研工具箱 LabKit',
      width:1100,height:760,minWidth:860,minHeight:560,
      visible:false,center:true,decorations:false,dragDropEnabled:false,shadow:true,
    });
    win.once('tauri://error',async e=>{
      /* label 竞态（双击连开）：第二次创建报已存在 → 聚焦既有窗口 */
      if(await focusExisting())return;
      fallback();
    });
  }catch(e){
    if(await focusExisting())return;
    fallback();
  }
}
let _renderSeq=0;
async function renderTool(id){
  const meta=(window.TOOL_META||[]).find(t=>t.id===id);
  if(!meta){toast('工具不存在');navigate('toolhub');return}
  const seq=++_renderSeq;
  setText('toolTitle',meta.name);
  setText('toolSub',meta.desc);
  const src=document.getElementById('toolSource');
  if(meta.source){src.innerHTML='<b>技术来源</b> · '+esc(meta.source)+' · <b>仅供科研使用，不用于临床诊断</b>';src.hidden=false;}
  else{src.hidden=true;src.textContent='';}
  Store.pushRecent(id);
  syncToolFav();
  const host=document.getElementById('toolHost');
  host.innerHTML='<div class="tnote">加载中…</div>';
  try{
    for(const s of meta.scripts)await loadScript(s);
    if(seq!==_renderSeq)return;   // 快速切换时丢弃过期渲染
    const fn=window.LabKitTools[id];
    if(typeof fn!=='function')throw new Error('工具未注册：'+id);
    host.innerHTML='';
    fn(host);
    /* P2 统一壳：示例 / 导出指向 / 帮助抽屉 + 表单状态持久化 */
    setupToolChrome(meta,host);
    if(meta.persist!==false){formRestore(host,Store.get('toolform:'+id,null));_formId=id;}
    else _formId=null;
  }catch(err){
    if(seq!==_renderSeq)return;
    host.innerHTML='<div class="terr">'+esc(err.message||String(err))+'</div>';
  }
}
function syncToolFav(){
  const b=document.getElementById('toolFav');if(!b)return;
  const on=!!(_route.arg&&Store.isFav(_route.arg));
  b.classList.toggle('on',on);
  b.textContent=on?'★ 已固定':'☆ 固定';
}
document.getElementById('toolFav').onclick=()=>{
  if(!_route.arg)return;
  const on=Store.toggleFav(_route.arg);
  shellRenderPins();renderToolHub();syncToolFav();
  toast(on?'已固定到侧栏':'已取消固定');
};
/* P1：工具页头「↗ 新窗口」；浏览器模式与工具窗口内隐藏（窗口身份保持稳定） */
(function(){
  const b=document.getElementById('toolNewWin');if(!b)return;
  b.hidden=!IN_TAURI||WINDOW_MODE;
  b.onclick=()=>{if(_route.arg)openToolWindow(_route.arg)};
})();
/* ---- P2：统一壳控件与表单持久化 ----
   表单快照按 id/name/序号 键控；恢复时派发 input/change 让工具自行重算。
   动态行类工具（figure/plate/checklists/plotter/timer/imgbatch/inventory）在 registry 声明 persist:false，
   用自己的模型持久化（已迁移到 Store）。 */
let _formId=null,_formT=0;
const _toolHostEl=document.getElementById('toolHost');
function formSnapshot(host){
  const m={};
  host.querySelectorAll('input,select,textarea').forEach((el,i)=>{
    if(el.type==='file'||el.type==='button'||el.type==='submit')return;
    const k=el.id||el.name||('idx:'+i);
    m[k]=el.type==='checkbox'?{c:el.checked}:{v:el.value};
  });
  return m;
}
function formRestore(host,map){
  if(!map||typeof map!=='object')return;
  /* 按快照键遍历（而非捕获的节点列表）：select 的 change 可能重建动态输入区
     （如 tests 切方法后 stX/stY → stA..stD），每个键派发前实时重取存活节点。 */
  const cur=()=>[...host.querySelectorAll('input,select,textarea')].filter(el=>el.type!=='file'&&el.type!=='button'&&el.type!=='submit');
  for(const [k,s] of Object.entries(map)){
    if(!s||typeof s!=='object')continue;
    let live=null;
    if(k.startsWith('idx:'))live=cur()[+k.slice(4)]||null;
    else live=host.querySelector('#'+CSS.escape(k))||host.querySelector('[name="'+CSS.escape(k)+'"]');
    if(!live||!live.isConnected)continue;
    if(live.type==='checkbox')live.checked=!!s.c;else live.value=s.v??'';
    if(live.type==='checkbox')live.dispatchEvent(new Event('change',{bubbles:true}));
    else{live.dispatchEvent(new Event('input',{bubbles:true}));live.dispatchEvent(new Event('change',{bubbles:true}));}
  }
}
function _onFormEvt(){
  if(!_formId)return;
  clearTimeout(_formT);
  _formT=setTimeout(()=>{if(_formId)Store.set('toolform:'+_formId,formSnapshot(_toolHostEl))},600);
}
_toolHostEl.addEventListener('input',_onFormEvt);
_toolHostEl.addEventListener('change',_onFormEvt);
function setupToolChrome(meta,host){
  document.getElementById('toolExample').hidden=!meta.example;
  document.getElementById('toolExports').innerHTML=(meta.exports||[]).map((x,i)=>`<button class="tbtn sec" data-texport="${i}">${esc(x.label)}</button>`).join('');
  document.getElementById('toolHelp').hidden=true;
  document.getElementById('toolHelpBody').innerHTML='<h3>'+esc(meta.name)+'</h3><p>'+esc(meta.help||meta.desc)+'</p>'+(meta.source?'<div class="tnote"><b>技术来源</b> · '+esc(meta.source)+' · <b>仅供科研使用，不用于临床诊断</b></div>':'');
}
document.getElementById('toolExample').onclick=()=>{
  const f=_toolHostEl.__lkExample;
  if(typeof f==='function')f();else toast('该工具未提供一键示例');
};
document.getElementById('toolReset').onclick=()=>{
  if(!_route.arg)return;
  Store.set('toolform:'+_route.arg,null);
  renderTool(_route.arg);
  toast('已重置为初始状态');
};
document.getElementById('toolHelpBtn').onclick=()=>{
  const h=document.getElementById('toolHelp');h.hidden=!h.hidden;
};
document.getElementById('toolExports').addEventListener('click',e=>{
  const b=e.target.closest('[data-texport]');if(!b)return;
  const meta=(window.TOOL_META||[]).find(t=>t.id===_route.arg);
  const x=meta&&meta.exports&&meta.exports[+b.dataset.texport];if(!x)return;
  const btn=_toolHostEl.querySelector('#'+x.btn);
  if(btn)btn.click();else toast('导出按钮未就绪，请先运行计算');
});
renderToolHub();
/* 工作区顶栏下方的技术来源小字，与工具库注册表同源 */
(function(){
  const byId=Object.fromEntries((window.TOOL_META||[]).map(t=>[t.id,t]));
  [['cropSource','crop'],['qpcrSource','qpcr']].forEach(([el,id])=>{
    const n=document.getElementById(el),m=byId[id];
    if(n&&m&&m.source)n.innerHTML='<b>技术来源</b> · '+esc(m.source)+' · <b>仅供科研使用，不用于临床诊断</b>';
  });
})();


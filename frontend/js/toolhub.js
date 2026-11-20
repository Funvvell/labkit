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
/* 工具卡图标：沿用侧栏线性风格（1.8px 描边）。
   卡片配色不再写死分组色 —— 走 toolbox.js 的 derive 结果（组色可被用户改）。 */
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
let toolhubGroup='all',toolhubQ='',toolhubPane='tools';
/* 整理模式：草稿放 window 上，toolboxView() 优先读它（未保存不落盘）。
   范式与 dashboard 的 dashEdit/dashDraft 一致：改动先攒在草稿里，显式保存才写台账。 */
let toolboxEdit=false,toolboxDraft=null,toolboxDraftBase='';
let _tbDrag=null;

function toolboxGroupOf(id){const v=toolboxView();return v.items[id]||null;}
function toolhubMatchQ(t){
  const q=toolhubQ.trim().toLowerCase();
  if(!q)return true;
  return [t.id,t.name,t.desc,t.py,t.keywords,t.group].filter(Boolean).join(' ').toLowerCase().includes(q);
}
function toolhubCardHTML(t,gid){
  const v=toolboxView();
  const it=v.items[t.id]||{};
  const g=gid?(v.groups.find(x=>x.id===gid)||null):null;
  const color=it.color||(g&&g.color)||it.gcolor||'#007aff';
  const id=esc(t.id);
  const win=(IN_TAURI&&!toolboxEdit)?`<button type="button" class="tc-win" data-tool-window="${id}" aria-label="在新窗口打开 ${esc(t.name)}" title="在新窗口打开（也可 Ctrl/⌘+点击或中键）">↗</button>`:'';
  const fav=Store.isFav(t.id);
  const favBtn=toolboxEdit?'':`<button type="button" class="tc-fav${fav?' on':''}" data-fav-toggle="${id}" aria-label="${fav?'取消固定':'固定'} ${esc(t.name)}" title="${fav?'取消固定':'固定到侧栏'}">${fav?'★':'☆'}</button>`;
  const grip=toolboxEdit?`<span class="tb-grip" data-tb-grip="${id}" title="拖动排序 / 换组" aria-hidden="true">⠿</span>`:'';
  const hide=toolboxEdit?`<button type="button" class="tb-mini tb-hide" data-tb-hide="${id}" title="隐藏（可在「已隐藏」恢复）" aria-label="隐藏 ${esc(t.name)}">⦸</button>`:'';
  const styleBt=toolboxEdit?`<button type="button" class="tb-mini" data-tb-style="${id}" title="图标与配色" aria-label="设置 ${esc(t.name)} 的图标与配色">⋯</button>`:'';
  const ico=it.icon?toolboxIconSVG(it.icon,t.id):toolIcon(t.id);
  return `<div class="tool-card${toolboxEdit?' tb-editing':''}" style="--tc:${color}" data-tb-tool="${id}" data-tb-gid="${esc(gid||'')}">
    ${grip}
    <button type="button" class="tc-open" data-tool-id="${id}" title="打开 ${esc(t.name)}">
      <span class="tc-ico">${ico}</span>
      <span class="tc-body"><span class="tc-name">${esc(t.name)}</span><span class="tc-desc">${esc(t.desc)}</span>${t.workspace?'<span class="tc-kind">工作区</span>':''}</span>
    </button>
    ${win}${favBtn}${hide}${styleBt}
  </div>`;
}
function toolhubEmptyTail(gid){
  return toolboxEdit?`<div class="tb-tail" data-tb-tail="${esc(gid)}">拖到这里</div>`:'';
}
function toolhubGroupHTML(label,items,gid,opts){
  opts=opts||{};
  if(!items.length&&!opts.keepEmpty)return '';
  return `<div class="toolhub-group" data-tb-group="${esc(gid||'all')}" style="--tg:${opts.color||'#007aff'}">
    <h3>${esc(label)} <span>${items.length}</span></h3>
    <div class="toolhub-grid">${items.map(t=>toolhubCardHTML(t,gid)).join('')}${toolhubEmptyTail(gid)}</div>
  </div>`;
}
function toolboxGroupHeadHTML(g){
  const icons=TOOLBOX_ICON_KEYS.map(k=>`<option value="${k}"${k===g.icon?' selected':''}>${esc(TOOLBOX_ICON_LABELS[k]||k)}</option>`).join('');
  return `<div class="tb-ghead" data-tb-gh="${esc(g.id)}">
    <span class="tb-grip2" data-tb-gmove="${esc(g.id)}" title="拖动排序分组" aria-hidden="true">⠿</span>
    <span class="tb-gico">${toolboxIconSVG(g.icon)}</span>
    <input class="tb-gname" type="text" value="${esc(g.name)}" data-tb-grename="${esc(g.id)}" maxlength="24" aria-label="分组名称">
    <span class="tb-gn">${g.count}</span>
    <input class="tb-gcolor" type="color" value="${g.color}" data-tb-gcolor="${esc(g.id)}" title="分组配色" aria-label="分组配色">
    <select class="tb-gicon" data-tb-gicon="${esc(g.id)}" title="分组图标" aria-label="分组图标">${icons}</select>
    <button type="button" class="tb-mini tb-gfold" data-tb-gfold="${esc(g.id)}" title="${g.collapsed?'展开':'折叠'}">${g.collapsed?'▸':'▾'}</button>
    ${g.id===TOOLBOX_UNGROUPED?'':`<button type="button" class="tb-mini tb-gdel" data-tb-gdel="${esc(g.id)}" title="删除分组" aria-label="删除分组 ${esc(g.name)}">×</button>`}
  </div>`;
}
function toolhubGroupBlock(g,list){
  return `<div class="toolhub-group${g.collapsed?' tb-collapsed':''}" data-tb-group="${esc(g.id)}" style="--tg:${g.color}">
    ${toolboxEdit?toolboxGroupHeadHTML(g)
      :`<h3><button type="button" class="tb-fold" data-tb-fold="${esc(g.id)}" title="${g.collapsed?'展开':'折叠'} ${esc(g.name)}"><span class="tb-dot" style="background:${g.color}"></span>${esc(g.name)} <span>${g.count}</span><span class="tb-caret">${g.collapsed?'▸':'▾'}</span></button></h3>`}
    <div class="toolhub-grid">${list.map(t=>toolhubCardHTML(t,g.id)).join('')}${toolhubEmptyTail(g.id)}</div>
  </div>`;
}
function renderToolHubBar(){
  const host=document.getElementById('toolhubChips');
  if(!host)return;
  const metas=window.TOOL_META||[];
  const v=toolboxView();
  const n=s=>`<span class="n">${s}</span>`;
  let chips=`<button type="button" class="th-chip${toolhubGroup==='all'?' active':''}" data-th-group="all">全部${n(v.totals.visible)}</button>`;
  v.groups.forEach(g=>{
    if(!g.count)return;
    chips+=`<button type="button" class="th-chip${toolhubGroup===g.id?' active':''}" data-th-group="${esc(g.id)}"><span class="tb-dot" style="background:${g.color}"></span>${esc(g.name)}${n(g.count)}</button>`;
  });
  const favs=Store.favs().filter(id=>metas.some(t=>t.id===id));
  if(favs.length)chips+=`<button type="button" class="th-chip${toolhubGroup==='pinned'?' active':''}" data-th-group="pinned">固定${n(favs.length)}</button>`;
  if(v.hidden.length)chips+=`<button type="button" class="th-chip${toolhubGroup==='hidden'?' active':''}" data-th-group="hidden">已隐藏${n(v.hidden.length)}</button>`;
  host.innerHTML=chips;
  host.querySelectorAll?.('[data-th-group]')?.forEach(b=>b.onclick=()=>{
    toolhubGroup=b.dataset.thGroup||'all';
    renderToolHub();
  });
  const recent=document.getElementById('toolhubRecent');
  if(recent){
    const items=(Store.recent()||[]).map(id=>metas.find(t=>t.id===id))
      .filter(t=>t&&!(v.items[t.id]&&v.items[t.id].hidden)).slice(0,4);
    recent.innerHTML=items.length?`<span class="lbl">最近使用</span>${items.map(t=>`<button type="button" class="th-recent" data-tool-id="${esc(t.id)}">${toolIcon(t.id)}${esc(t.name)}</button>`).join('')}`:'';
  }
}
function thEmptyHTML(msg,withReset){
  return `<div class="th-empty"><b>${esc(msg)}</b>${withReset?'换个关键词，或清空筛选后再看一次。<br><button type="button" class="btn sec" data-th-reset>清空筛选</button>':''}</div>`;
}
function renderToolHub(){
  const host=document.getElementById('toolhubGrid');
  if(!host)return;
  const metas=window.TOOL_META||[];
  const v=toolboxView();
  const pinnedIds=Store.pins().filter(p=>p.kind==='tool').map(p=>p.id);
  const hiddenIds=new Set(v.hidden.map(t=>t.id));
  const pass=t=>!hiddenIds.has(t.id)&&toolhubMatchQ(t);
  const q=toolhubQ.trim();
  let html='';
  if(toolhubGroup==='pinned'){
    html=toolhubGroupHTML('固定工具',metas.filter(t=>pinnedIds.includes(t.id)&&pass(t)),'pinned',{color:'#8e8e93'});
    if(!html)html=thEmptyHTML('还没有固定工具','');
  }else if(toolhubGroup==='hidden'){
    const list=v.hidden.filter(toolhubMatchQ);
    html=toolboxEdit?toolhubGroupHTML('已隐藏',list,'hidden',{color:'#8e8e93',keepEmpty:true}):'';
    if(!html)html=thEmptyHTML(toolboxEdit?'没有隐藏的工具':'「已隐藏」只在整理模式可见','');
  }else if(q){
    html=toolhubGroupHTML('搜索结果',metas.filter(pass),'all');
  }else if(toolhubGroup!=='all'){
    const g=v.groups.find(x=>x.id===toolhubGroup);
    if(g)html=toolhubGroupBlock(g,metas.filter(t=>v.items[t.id].gid===g.id&&pass(t)));
  }else{
    const pinned=metas.filter(t=>pinnedIds.includes(t.id)&&pass(t));
    if(pinned.length)html+=toolhubGroupHTML('固定工具',pinned,'pinned',{color:'#8e8e93'});
    v.groups.forEach(g=>{
      if(!g.count&&!toolboxEdit)return;
      html+=toolhubGroupBlock(g,g.tools.filter(toolhubMatchQ));
    });
    if(toolboxEdit)html+=`<button type="button" class="tb-newgroup" data-tb-newgroup>＋ 新建分组</button>`;
  }
  host.innerHTML=html||thEmptyHTML('没有匹配的工具',true);
  host.querySelector?.('[data-th-reset]')?.addEventListener('click',()=>{
    toolhubQ='';toolhubGroup='all';
    const inp=document.getElementById('toolhubSearch');if(inp)inp.value='';
    renderToolHub();
  });
  const count=document.getElementById('toolhubCount');
  if(count)count.textContent=String(metas.filter(pass).length);
  renderToolHubBar();
  const inp=document.getElementById('toolhubSearch');
  if(inp&&inp.value!==toolhubQ)inp.value=toolhubQ;
  syncToolboxEditBar();
  bindToolboxDnD(host);
}
(function bindToolhubSearch(){
  const inp=document.getElementById('toolhubSearch');
  if(!inp)return;
  let timer=0;
  inp.addEventListener('input',()=>{
    toolhubQ=inp.value;
    clearTimeout(timer);
    timer=setTimeout(()=>renderToolHub(),90);
  });
  inp.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&inp.value){e.preventDefault();inp.value='';toolhubQ='';renderToolHub()}
  });
})();
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
  const crumb=document.getElementById('toolCrumb');
  if(crumb)crumb.textContent='工具库 › '+(meta.group||'工具');
  if(!WINDOW_MODE&&_route.name==='tool'&&_route.arg===id)document.title=meta.name+' · 科研工具箱 LabKit';
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
/* ===================== 工具箱整理模式 =====================
   范式同 dashboard 的布局编辑：草稿 → 保存/取消；不同点是这里没有网格引擎，
   拖拽用原生 HTML5 DnD（把手按下才可拖，避免与点击打开工具冲突）。 */
function toolboxDirtyNow(){return !!(toolboxEdit&&JSON.stringify(toolboxDraft||{})!==toolboxDraftBase)}
/** db.js 用：整理模式下别重渲染工具库（会把正在拖的卡片换掉）。函数声明无 TDZ 风险。 */
function toolboxIsEditing(){return !!toolboxEdit}
function syncToolboxEditBar(){
  const bar=document.getElementById('toolboxEditBar');if(bar)bar.hidden=!toolboxEdit;
  const st=document.getElementById('toolboxEditState');
  if(st&&toolboxEdit){const d=toolboxDirtyNow();st.textContent=d?'有未保存改动':'整理中';st.classList.toggle('dirty',d)}
  const btn=document.getElementById('btnToolboxEdit');
  if(btn){btn.textContent=toolboxEdit?'完成整理':'整理分组';btn.classList.toggle('pri',toolboxEdit)}
  const tabs=document.getElementById('toolhubTabs');if(tabs)tabs.hidden=toolboxEdit;
}
/** 草稿上的一次改动：只重绘，不落盘。 */
function toolboxApply(fn){
  if(!toolboxEdit)return;
  toolboxDraft=fn(toolboxDraft||toolboxClone(toolboxRaw()));
  window.__LK_TOOLBOX_DRAFT=toolboxDraft;
  toolboxInvalidate();
  renderToolHub();
  if(typeof shellRenderCats==='function')shellRenderCats();
}
function enterToolboxEdit(){
  if(toolboxEdit)return;
  if(toolhubPane!=='tools')toolhubSetPane('tools');
  toolboxDraft=toolboxClone(toolboxRaw());
  window.__LK_TOOLBOX_DRAFT=toolboxDraft;
  toolboxDraftBase=JSON.stringify(toolboxDraft);
  toolboxEdit=true;
  renderToolHub();
  toast('整理模式：拖 ⠿ 排序 / 换组，⦸ 隐藏，⋯ 改图标配色；改动要点「保存」才生效，Esc 取消',5600);
}
function finishToolboxEdit(saved){
  toolboxEdit=false;toolboxDraft=null;toolboxDraftBase='';
  window.__LK_TOOLBOX_DRAFT=null;
  toolboxInvalidate();
  renderToolHub();
  if(typeof shellRenderCats==='function')shellRenderCats();
  toast(saved?'工具箱已保存':'已退出整理');
}
function exitToolboxEdit(commit){
  if(!toolboxEdit)return;
  const dirty=toolboxDirtyNow();
  if(commit&&dirty){
    /* 多窗口：_store.toolbox 是整键 LWW，保存前比对盘上值，冲突让用户决定 */
    const onDisk=JSON.stringify(toolboxNormalize(toolboxRaw()));
    if(onDisk!==toolboxDraftBase){
      confirmModal('保存工具箱布局',
        '另一个窗口已经修改过工具箱配置。继续保存会用当前草稿覆盖对方的改动。',
        ()=>{toolboxSave(toolboxDraft);finishToolboxEdit(true);},'仍然保存');
      return;
    }
    toolboxSave(toolboxDraft);
    finishToolboxEdit(true);
    return;
  }
  finishToolboxEdit(false);
}
function toolboxFoldGroup(gid){
  const v=toolboxView();const g=v.groups.find(x=>x.id===gid);if(!g)return;
  toolboxSave(toolboxCollapseGroup(toolboxRaw(),gid,!g.collapsed));
  renderToolHub();
  if(typeof shellRenderCats==='function')shellRenderCats();
}
/* ---- 图标与配色选择器（预设色板 + 预设图标，避免深色模式与任意值破版） ---- */
function tbSwatchesHTML(cur){
  return TOOLBOX_COLORS.map(c=>`<button type="button" class="tb-swatch${c===cur?' on':''}" data-tb-color="${c}" style="--sw:${c}" aria-label="配色 ${c}"></button>`).join('');
}
function tbIconsHTML(cur){
  return TOOLBOX_ICON_KEYS.map(k=>`<button type="button" class="tb-icopt${k===cur?' on':''}" data-tb-icon="${k}" title="${esc(TOOLBOX_ICON_LABELS[k]||k)}" aria-label="${esc(TOOLBOX_ICON_LABELS[k]||k)}">${toolboxIconSVG(k)}</button>`).join('');
}
function tbDialog(html,onMount){
  const dlg=document.createElement('dialog');dlg.className='modal-mask';
  dlg.innerHTML='<div class="roi-modal tb-dialog">'+html+'</div>';
  const close=()=>{closeLayer(dlg);if(dlg.parentNode)dlg.remove()};
  dlg.addEventListener('close',()=>{if(dlg.parentNode)dlg.remove()});
  dlg.addEventListener('click',e=>{if(e.target===dlg)close()});
  dlg.querySelectorAll('[data-tb-close]').forEach(b=>{b.onclick=close});
  document.body.appendChild(dlg);openLayer(dlg);
  if(typeof onMount==='function')onMount(dlg,close);
  return {dlg,close};
}
function toolboxGroupDialog(){
  tbDialog(`<h4>新建分组</h4>
    <label class="tfield">分组名称<input type="text" id="tbNewName" maxlength="24" placeholder="例如：我的常用" autocomplete="off"></label>
    <div class="field-title">配色</div><div class="tb-swatches" id="tbNewColors">${tbSwatchesHTML(TOOLBOX_COLORS[0])}</div>
    <div class="field-title">图标</div><div class="tb-icons" id="tbNewIcons">${tbIconsHTML('grid')}</div>
    <div class="btn-row"><button class="btn pri" type="button" id="tbNewOK">创建</button><button class="btn sec" type="button" data-tb-close>取消</button></div>`,
  (dlg,close)=>{
    let color=TOOLBOX_COLORS[0],icon='grid';
    dlg.querySelectorAll('[data-tb-color]').forEach(b=>b.onclick=()=>{
      color=b.dataset.tbColor;
      dlg.querySelectorAll('[data-tb-color]').forEach(x=>x.classList.toggle('on',x===b));
    });
    dlg.querySelectorAll('[data-tb-icon]').forEach(b=>b.onclick=()=>{
      icon=b.dataset.tbIcon;
      dlg.querySelectorAll('[data-tb-icon]').forEach(x=>x.classList.toggle('on',x===b));
    });
    const inp=dlg.querySelector('#tbNewName');
    if(inp)setTimeout(()=>inp.focus(),30);
    dlg.querySelector('#tbNewOK').onclick=()=>{
      const name=((inp&&inp.value)||'').trim();
      if(!name){toast('给分组起个名字');if(inp)inp.focus();return}
      close();
      toolboxApply(ov=>toolboxCreateGroup(ov,{name,color,icon}).ov);
      toast('已新建分组「'+name+'」，把工具拖进去即可');
    };
  });
}
function toolboxItemDialog(id){
  const meta=(window.TOOL_META||[]).find(t=>t.id===id);if(!meta)return;
  const v=toolboxView();const it=v.items[id]||{};
  tbDialog(`<h4>${esc(meta.name)} · 图标与配色</h4>
    <div class="sub">留空则跟随所属分组「${esc(it.gname||'未分类')}」的配色与工具自身图标。</div>
    <div class="field-title">配色</div><div class="tb-swatches" id="tbItemColors">${tbSwatchesHTML(it.color||'')}</div>
    <div class="field-title">图标</div><div class="tb-icons" id="tbItemIcons">${tbIconsHTML(it.icon||'')}</div>
    <div class="btn-row"><button class="btn pri" type="button" id="tbItemOK">应用</button><button class="btn sec" type="button" data-tb-close>取消</button></div>`,
  (dlg,close)=>{
    let color=it.color||'',icon=it.icon||'';
    dlg.querySelectorAll('[data-tb-color]').forEach(b=>b.onclick=()=>{
      color=(color===b.dataset.tbColor)?'':b.dataset.tbColor;
      dlg.querySelectorAll('[data-tb-color]').forEach(x=>x.classList.toggle('on',x.dataset.tbColor===color));
    });
    dlg.querySelectorAll('[data-tb-icon]').forEach(b=>b.onclick=()=>{
      icon=(icon===b.dataset.tbIcon)?'':b.dataset.tbIcon;
      dlg.querySelectorAll('[data-tb-icon]').forEach(x=>x.classList.toggle('on',x.dataset.tbIcon===icon));
    });
    dlg.querySelector('#tbItemOK').onclick=()=>{
      close();
      toolboxApply(ov=>toolboxStyleItem(ov,id,{color,icon}));
    };
  });
}
function toolboxDeleteGroupConfirm(gid){
  const v=toolboxView();const g=v.groups.find(x=>x.id===gid);if(!g)return;
  confirmModal('删除分组',
    g.count?('「'+g.name+'」里有 '+g.count+' 个工具，删除后它们会移到「未分类」，随时可以再拖回去。')
      :('确定删除空分组「'+g.name+'」？'),
    ()=>{toolboxApply(ov=>toolboxDeleteGroup(ov,gid,(window.TOOL_META||[])));toast('已删除分组「'+g.name+'」')},
    '删除');
}
function openToolboxHidden(){
  const build=()=>{
    const v=toolboxView();
    return `<h4>已隐藏的工具</h4>
      <div class="sub">隐藏的工具在侧栏与工具库不出现，但仍可用 Ctrl+K 搜到并打开。</div>
      <div class="tb-hidden-list">${v.hidden.length
        ? v.hidden.map(t=>`<div class="tb-hrow"><span class="tb-hname">${toolIcon(t.id)}<b>${esc(t.name)}</b></span><button type="button" class="btn sec" data-tb-unhide="${esc(t.id)}">恢复</button></div>`).join('')
        : '<div class="plugin-empty">没有隐藏的工具</div>'}</div>
      <div class="btn-row"><button type="button" class="btn pri" data-tb-close>完成</button>${v.hidden.length?'<button type="button" class="btn sec" id="tbUnhideAll">全部恢复</button>':''}</div>`;
  };
  const box=document.createElement('dialog');box.className='modal-mask';box.setAttribute('aria-label','已隐藏的工具');
  const close=()=>{closeLayer(box);if(box.parentNode)box.remove()};
  const draw=()=>{
    box.innerHTML='<div class="roi-modal tb-dialog">'+build()+'</div>';
    box.querySelectorAll('[data-tb-close]').forEach(b=>{b.onclick=close});
    box.querySelectorAll('[data-tb-unhide]').forEach(b=>{
      b.onclick=()=>{toolboxApply(ov=>toolboxSetHidden(ov,b.dataset.tbUnhide,false));draw()};
    });
    const all=box.querySelector('#tbUnhideAll');
    if(all)all.onclick=()=>{
      toolboxApply(ov=>{
        let next=ov;
        toolboxView().hidden.forEach(t=>{next=toolboxSetHidden(next,t.id,false)});
        return next;
      });
      draw();
    };
  };
  box.addEventListener('close',()=>{if(box.parentNode)box.remove()});
  box.addEventListener('click',e=>{if(e.target===box)close()});
  document.body.appendChild(box);openLayer(box);draw();
}
/* ---- 拖拽（原生 HTML5 DnD） ---- */
function clearTbMarks(root){
  if(!root)return;
  root.querySelectorAll('.tb-before,.tb-after,.tb-over').forEach(el=>el.classList.remove('tb-before','tb-after','tb-over'));
}
function bindToolboxDnD(root){
  if(!toolboxEdit||!root)return;
  root.querySelectorAll('[data-tb-grip]').forEach(g=>{
    g.addEventListener('mousedown',()=>{const card=g.closest('[data-tb-tool]');if(card)card.draggable=true});
  });
  root.querySelectorAll('[data-tb-gmove]').forEach(g=>{
    g.addEventListener('mousedown',()=>{const grp=g.closest('[data-tb-group]');if(grp)grp.draggable=true});
  });
  root.querySelectorAll('[data-tb-tool]').forEach(card=>{
    card.addEventListener('dragstart',e=>{
      _tbDrag={type:'tool',id:card.dataset.tbTool,gid:card.dataset.tbGid};
      e.dataTransfer.effectAllowed='move';
      try{e.dataTransfer.setData('text/plain',card.dataset.tbTool)}catch(_){}
      card.classList.add('tb-dragging');
    });
    card.addEventListener('dragend',()=>{
      card.draggable=false;card.classList.remove('tb-dragging');_tbDrag=null;clearTbMarks(root);
    });
    card.addEventListener('dragover',e=>{
      if(!_tbDrag||_tbDrag.type!=='tool'||_tbDrag.id===card.dataset.tbTool)return;
      e.preventDefault();e.stopPropagation();
      clearTbMarks(root);
      const r=card.getBoundingClientRect();
      card.classList.add(e.clientX<r.left+r.width/2?'tb-before':'tb-after');
    });
    card.addEventListener('drop',e=>{
      if(!_tbDrag||_tbDrag.type!=='tool'||_tbDrag.id===card.dataset.tbTool)return;
      e.preventDefault();e.stopPropagation();
      const r=card.getBoundingClientRect();
      const before=e.clientX<r.left+r.width/2;
      const target=card.dataset.tbTool,gid=card.dataset.tbGid;
      const drag=_tbDrag;_tbDrag=null;clearTbMarks(root);
      toolboxApply(ov=>toolboxMoveItem(ov,drag.id,gid,before?target:null,(window.TOOL_META||[])));
    });
  });
  root.querySelectorAll('[data-tb-tail],[data-tb-group]').forEach(el=>{
    el.addEventListener('dragover',e=>{
      if(!_tbDrag)return;
      if(_tbDrag.type==='tool'){e.preventDefault();el.classList.add('tb-over')}
    });
    el.addEventListener('dragleave',()=>el.classList.remove('tb-over'));
    el.addEventListener('drop',e=>{
      if(!_tbDrag||_tbDrag.type!=='tool')return;
      const gid=el.dataset.tbTail||el.dataset.tbGroup;
      if(!gid||gid==='all'||gid==='pinned'||gid==='hidden')return;
      e.preventDefault();e.stopPropagation();
      const drag=_tbDrag;_tbDrag=null;clearTbMarks(root);
      toolboxApply(ov=>toolboxMoveItem(ov,drag.id,gid,null,(window.TOOL_META||[])));
    });
  });
  root.querySelectorAll('[data-tb-group]').forEach(grp=>{
    grp.addEventListener('dragstart',e=>{
      if(!grp.draggable)return;
      _tbDrag={type:'group',gid:grp.dataset.tbGroup};
      e.dataTransfer.effectAllowed='move';
      try{e.dataTransfer.setData('text/plain',grp.dataset.tbGroup)}catch(_){}
      grp.classList.add('tb-dragging');
    });
    grp.addEventListener('dragend',()=>{
      grp.draggable=false;grp.classList.remove('tb-dragging');_tbDrag=null;clearTbMarks(root);
    });
    grp.addEventListener('dragover',e=>{
      if(!_tbDrag||_tbDrag.type!=='group'||_tbDrag.gid===grp.dataset.tbGroup)return;
      e.preventDefault();e.stopPropagation();
      clearTbMarks(root);
      const r=grp.getBoundingClientRect();
      grp.classList.add(e.clientY<r.top+r.height/2?'tb-before':'tb-after');
    });
    grp.addEventListener('drop',e=>{
      if(!_tbDrag||_tbDrag.type!=='group'||_tbDrag.gid===grp.dataset.tbGroup)return;
      e.preventDefault();e.stopPropagation();
      const r=grp.getBoundingClientRect();
      const before=e.clientY<r.top+r.height/2;
      const target=grp.dataset.tbGroup;
      const drag=_tbDrag;_tbDrag=null;clearTbMarks(root);
      toolboxApply(ov=>{
        const ids=toolboxGroupIds(ov).filter(x=>x!==drag.gid);
        let at=ids.indexOf(target);
        if(at<0)at=ids.length;
        else if(!before)at++;
        return toolboxMoveGroup(ov,drag.gid,at);
      });
    });
  });
}
/* ---- 工具库 tab：我的工具 / 获取更多工具 ---- */
function toolhubSetPane(pane){
  toolhubPane=pane==='market'?'market':'tools';
  const pt=document.getElementById('paneTools'),pm=document.getElementById('paneMarket');
  if(pt)pt.hidden=toolhubPane!=='tools';
  if(pm)pm.hidden=toolhubPane!=='market';
  document.querySelectorAll('#toolhubTabs [data-thtab]').forEach(b=>b.classList.toggle('active',b.dataset.thtab===toolhubPane));
  const edit=document.getElementById('btnToolboxEdit');if(edit)edit.hidden=toolhubPane!=='tools';
  if(toolhubPane==='market'){
    if(toolboxEdit)exitToolboxEdit(false);
    const host=document.getElementById('toolMarketHost');
    if(host&&typeof pluginMountMarket==='function')pluginMountMarket(host,'tool');
  }else{
    renderToolHub();
  }
  syncToolboxEditBar();
}
/* ---- 整理模式事件（单一委托） ---- */
(function bindToolboxUI(){
  const view=document.getElementById('view-toolhub');if(!view)return;
  view.addEventListener('click',e=>{
    const bar=e.target.closest('[data-tb]');
    if(bar){
      const act=bar.dataset.tb;
      if(act==='save')exitToolboxEdit(true);
      else if(act==='cancel')exitToolboxEdit(false);
      else if(act==='newgroup')toolboxGroupDialog();
      else if(act==='hidden')openToolboxHidden();
      else if(act==='reset')confirmModal('恢复默认工具箱','分组、配色、排序与隐藏都会回到初始状态。已保存的当前布局会被覆盖。',()=>{
        toolboxDraft=toolboxReset();window.__LK_TOOLBOX_DRAFT=toolboxDraft;toolboxInvalidate();renderToolHub();
        toast('已套用默认布局，仍需点「保存」');
      },'恢复默认');
      return;
    }
    const ng=e.target.closest('[data-tb-newgroup]');
    if(ng){toolboxGroupDialog();return}
    const fold=e.target.closest('[data-tb-fold]');
    if(fold){toolboxFoldGroup(fold.dataset.tbFold);return}
    const hide=e.target.closest('[data-tb-hide]');
    if(hide){
      toolboxApply(ov=>toolboxSetHidden(ov,hide.dataset.tbHide,true));
      toast('已隐藏，可在「已隐藏」里恢复');
      return;
    }
    const sty=e.target.closest('[data-tb-style]');
    if(sty){toolboxItemDialog(sty.dataset.tbStyle);return}
    const del=e.target.closest('[data-tb-gdel]');
    if(del){toolboxDeleteGroupConfirm(del.dataset.tbGdel);return}
    const gf=e.target.closest('[data-tb-gfold]');
    if(gf){
      const g=toolboxView().groups.find(x=>x.id===gf.dataset.tbGfold);
      if(g)toolboxApply(ov=>toolboxCollapseGroup(ov,g.id,!g.collapsed));
      return;
    }
  });
  view.addEventListener('change',e=>{
    const rn=e.target.closest('[data-tb-grename]');
    if(rn){toolboxApply(ov=>toolboxRenameGroup(ov,rn.dataset.tbGrename,rn.value));return}
    const cl=e.target.closest('[data-tb-gcolor]');
    if(cl){toolboxApply(ov=>toolboxStyleGroup(ov,cl.dataset.tbGcolor,{color:cl.value}));return}
    const ic=e.target.closest('[data-tb-gicon]');
    if(ic){toolboxApply(ov=>toolboxStyleGroup(ov,ic.dataset.tbGicon,{icon:ic.value}));return}
  });
  const editBtn=document.getElementById('btnToolboxEdit');
  if(editBtn)editBtn.onclick=()=>{toolboxEdit?exitToolboxEdit(true):enterToolboxEdit()};
  const tabs=document.getElementById('toolhubTabs');
  if(tabs)tabs.addEventListener('click',e=>{
    const b=e.target.closest('[data-thtab]');if(!b)return;
    toolhubSetPane(b.dataset.thtab);
  });
  document.addEventListener('keydown',e=>{
    if(!toolboxEdit)return;
    if(e.key==='Escape'&&!document.querySelector('.modal-mask')){
      e.preventDefault();exitToolboxEdit(false);return;
    }
    /* 键盘等价（VS Code 的 View: Move View 同款）：Alt+方向键移动 */
    const card=e.target.closest&&e.target.closest('[data-tb-tool]');
    if(!card||!e.altKey)return;
    const id=card.dataset.tbTool;
    const v=toolboxView();const it=v.items[id];if(!it)return;
    const gid=it.gid;
    const list=(v.groups.find(g=>g.id===gid)||{tools:[]}).tools.map(t=>t.id);
    const idx=list.indexOf(id);
    if(e.key==='ArrowUp'||e.key==='ArrowDown'){
      if(idx<0)return;
      const to=e.key==='ArrowUp'?idx-1:idx+1;
      if(to<0||to>=list.length)return;
      e.preventDefault();
      toolboxApply(ov=>toolboxMoveItem(ov,id,gid,list[to],(window.TOOL_META||[])));
      return;
    }
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
      const gids=v.groups.map(g=>g.id);
      const gi=gids.indexOf(gid);
      const to=e.key==='ArrowLeft'?gi-1:gi+1;
      if(to<0||to>=gids.length)return;
      e.preventDefault();
      toolboxApply(ov=>toolboxMoveItem(ov,id,gids[to],null,(window.TOOL_META||[])));
    }
  });
})();
renderToolHub();
/* 工作区顶栏下方的技术来源小字，与工具库注册表同源 */
(function(){
  const byId=Object.fromEntries((window.TOOL_META||[]).map(t=>[t.id,t]));
  [['cropSource','crop'],['qpcrSource','qpcr']].forEach(([el,id])=>{
    const n=document.getElementById(el),m=byId[id];
    if(n&&m&&m.source)n.innerHTML='<b>技术来源</b> · '+esc(m.source)+' · <b>仅供科研使用，不用于临床诊断</b>';
  });
})();


// LabKit · zotero.js — P3 Zotero 本地 API 前端桥（classic script，零构建）
/* 所有 HTTP 请求经 Rust invoke（Zotero 本地服务器丢弃浏览器形态请求，前端 fetch 必被拦）。
   本文件只做：视图模型映射（zoteroMapItem，node 可测）、按 Server-ID 分区的缓存、UI。
   阅读状态与笔记始终存 LabKit 本地；Zotero 10+ 且开启写回时才镜像 tag，失败不影响本地。 */

/* ---- API JSON → 视图模型（纯函数） ---- */
function zoteroMapItem(raw){
  const d=(raw&&raw.data)||raw||{};
  const key=(raw&&raw.key)||d.key||'';
  const title=d.title||d.caseName||d.subject||d.name||d.shortTitle||'（无标题）';
  const creators=(d.creators||[]).map(c=>c.name||[c.firstName,c.lastName].filter(Boolean).join(' ')).filter(Boolean);
  const dateSrc=d.date||d.issueDate||d.filingDate||d.decidedDate||'';
  const ym=String(dateSrc).match(/(\d{4})/);
  const year=ym?ym[1]:'';
  const publication=d.publicationTitle||d.proceedingsTitle||d.bookTitle||d.websiteTitle||d.blogTitle
    ||d.encyclopediaTitle||d.dictionaryTitle||d.programTitle||d.institution||d.publisher||d.label||'';
  return {
    key, title, creators, year, publication,
    doi:d.DOI||'', itemType:d.itemType||'',
    tags:(d.tags||[]).map(t=>t&&t.tag).filter(Boolean),
    collections:d.collections||[],
    dateAdded:d.dateAdded||'',
  };
}
function zoteroAuthors(it,max){
  const a=it.creators||[];
  if(!a.length)return '';
  return a.slice(0,max||3).join('，')+(a.length>(max||3)?' 等':'');
}
function zoteroMeta(it){return [it.publication,it.year].filter(Boolean).join(' · ')||'—'}

/* ---- 配置与缓存 ---- */
function zoteroCfg(){return Object.assign({enabled:false,port:23119,writeBack:false},Store.settings().zotero||{})}
function zoteroSetCfg(patch){Store.setSetting('zotero',Object.assign(zoteroCfg(),patch));saveDB()}
function zoteroCache(){const z=DB._store&&DB._store.zotero;return (z&&typeof z==='object')?z:null}
const Zotero={probe:null,syncing:false};

async function zoteroCall(cmd,args){
  if(!IN_TAURI){toast('Zotero 对接仅在桌面版可用（浏览器演示不回归）',4200);return null}
  try{return await invoke(cmd,Object.assign({port:zoteroCfg().port},args))}
  catch(e){toast('Zotero：'+e,5200);return null}
}

/* ---- 探测 / 同步 ---- */
async function zoteroProbe(){
  const p=await zoteroCall('zotero_probe',{});
  if(p){Zotero.probe=p;renderZoteroBar();renderZoteroSettings()}
  return p;
}
async function zoteroSync(){
  const cfg=zoteroCfg();
  if(!cfg.enabled){toast('先在设置页开启 Zotero 对接',4200);return}
  if(Zotero.syncing)return;
  Zotero.syncing=true;renderZoteroBar();
  try{
    const p=await zoteroProbe();
    if(!p||p.state==='offline'||p.state==='disabled'){toast(p?p.detail:'Zotero 探测失败',5600);return}
    const raw=await zoteroCall('zotero_list',{scope:'items',limit:500});
    if(!raw)return;
    const items=raw.map(zoteroMapItem);
    // 官方要求按 Server-ID 分区：服务器实例变更（重启/换库）时整体替换缓存
    DB._store.zotero={serverId:p.serverId||'',lastSync:nowStamp(),items};
    DB.isDemo=false;
    saveDB();renderLiterature();refreshHome();
    toast('已同步 Zotero 文献 '+items.length+' 条（只读镜像，笔记存本地）',4200);
  }finally{Zotero.syncing=false;renderZoteroBar()}
}

/* ---- 导入：搜索弹窗（quicksearch），离线时浏览上次同步 ---- */
function zoteroImportModal(){
  const mask=document.createElement('div');mask.className='modal-mask';
  const box=document.createElement('div');box.className='roi-modal wide';
  let timer=0,lastQ='';
  const draw=list=>{
    box.innerHTML=`<h4>从 Zotero 导入文献</h4>
      <div class="sub">输入标题 / 作者关键词搜索 Zotero 库；空关键词显示上次同步的最近条目。导入后阅读状态与笔记保存在 LabKit 本地。</div>
      <input type="text" id="zi_q" class="native-select" style="width:100%;margin-top:10px;padding:9px 11px" placeholder="搜索 Zotero 库（标题 / 作者 / 年份）…" autocomplete="off">
      <div id="zi_list" style="max-height:46vh;overflow-y:auto;margin-top:10px"></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn sec" id="zi_close">关闭</button></div>`;
    const q=box.querySelector('#zi_q');
    q.value=lastQ;
    const renderRows=items=>{
      box.querySelector('#zi_list').innerHTML=items.length?items.map(it=>{
        const imported=DB.literatures.some(l=>l.zoteroKey===it.key);
        return `<div class="mini-row" style="align-items:flex-start;padding:8px 4px">
          <span class="nm" style="white-space:normal;flex:1"><b>${esc(it.title)}</b>
            <span class="sub" style="display:block;margin-top:2px">${esc(zoteroAuthors(it))}${it.creators&&it.creators.length?' · ':''}${esc(zoteroMeta(it))}</span></span>
          <button class="card-act${imported?'':' pri'}" data-zi="${esc(it.key)}"${imported?' disabled':''}>${imported?'已导入':'导入'}</button>
        </div>`;
      }).join(''):'<div class="sub">没有匹配条目</div>';
      box.querySelectorAll('[data-zi]').forEach(b=>b.onclick=()=>{
        const it=items.find(x=>x.key===b.dataset.zi);if(!it)return;
        if(DB.literatures.some(l=>l.zoteroKey===it.key)){toast('该条目已在文献库');return}
        DB.literatures.unshift({id:uid('l'),title:it.title,meta:zoteroMeta(it),status:'待精读',doi:it.doi,note:'',
          zoteroKey:it.key,zoteroUrl:'zotero://select/library/items/'+it.key});
        DB.isDemo=false;saveDB();renderLiterature();refreshHome();
        toast('已导入：'+it.title.slice(0,40));
        renderRows(items);
      });
    };
    const search=async()=>{
      const v=q.value.trim();lastQ=v;
      if(!v){
        const c=zoteroCache();
        const items=c?(c.items||[]).slice().sort((a,b)=>String(b.dateAdded).localeCompare(String(a.dateAdded))).slice(0,20):[];
        renderRows(items);
        if(!items.length)box.querySelector('#zi_list').innerHTML='<div class="sub">还没有同步缓存：先点文献页「同步 Zotero」，或直接输入关键词在线搜索</div>';
        return;
      }
      const raw=await zoteroCall('zotero_list',{scope:'quicksearch',query:v,limit:25});
      if(raw)renderRows(raw.map(zoteroMapItem));
    };
    q.oninput=()=>{clearTimeout(timer);timer=setTimeout(search,350)};
    box.querySelector('#zi_close').onclick=()=>mask.remove();
    search();
    setTimeout(()=>q.focus(),50);
  };
  draw();
  mask.appendChild(box);document.getElementById('win').appendChild(mask);
  mask.onclick=e=>{if(e.target===mask)mask.remove()};
}

/* ---- 打开条目 / PDF / 状态镜像 ---- */
async function zoteroOpen(key,file){
  const out=await zoteroCall('zotero_open',{key,file:!!file});
  if(out&&!file)toast('已在 Zotero 中定位条目');
}
function zoteroMirrorStatus(l){
  const cfg=zoteroCfg();
  if(!cfg.writeBack||!l||!l.zoteroKey)return;
  if(!Zotero.probe||Zotero.probe.state!=='writable')return;
  // 镜像失败只提示，不影响本地状态（本地为准）
  invoke('zotero_tag',{port:cfg.port,key:l.zoteroKey,tag:'labkit/'+l.status})
    .catch(e=>toast('Zotero 状态镜像失败（本地已保存）：'+e,5200));
}

/* ---- 文献页状态条 ---- */
function renderZoteroBar(){
  const bar=document.getElementById('zoteroBar');if(!bar)return;
  const cfg=zoteroCfg(),c=zoteroCache(),p=Zotero.probe;
  if(!IN_TAURI){bar.innerHTML='<span class="sub">Zotero 对接仅在桌面版可用 · 本地文献管理不受影响</span>';return}
  if(!cfg.enabled){bar.innerHTML='<span class="sub">Zotero 对接未开启 · 在设置页启用后可同步文献库（只读镜像，笔记存本地）</span>';return}
  const state=p?p.state:'unknown';
  const dot=state==='writable'?'var(--green)':state==='readonly'?'var(--accent)':state==='unknown'?'var(--muted)':'var(--orange)';
  const txt=p?p.detail:'尚未探测连接';
  const sync=c&&c.lastSync?' · 上次同步 '+esc(c.lastSync)+' · '+(c.items||[]).length+' 条':'';
  bar.innerHTML=`<span class="z-dot" style="background:${dot}"></span><span class="sub" style="flex:1">${esc(txt)}${sync}</span>
    <button class="btn sec" id="zb_sync"${Zotero.syncing?' disabled':''}>${Zotero.syncing?'同步中…':'同步 Zotero'}</button>
    <button class="btn sec" id="zb_import">从 Zotero 导入</button>`;
  bar.querySelector('#zb_sync').onclick=zoteroSync;
  bar.querySelector('#zb_import').onclick=zoteroImportModal;
}

/* ---- 设置页 Zotero 区 ---- */
function renderZoteroSettings(){
  const en=document.getElementById('setZoteroEnabled');if(!en)return;
  const cfg=zoteroCfg();
  en.checked=!!cfg.enabled;
  const port=document.getElementById('setZoteroPort');if(port)port.value=cfg.port;
  const wr=document.getElementById('setZoteroWrite');
  const wrWrap=document.getElementById('zoteroWriteWrap');
  const writable=Zotero.probe&&Zotero.probe.state==='writable';
  if(wrWrap)wrWrap.style.display=writable?'':'none';
  if(wr)wr.checked=!!cfg.writeBack;
  const st=document.getElementById('zoteroStatus');
  if(st)st.textContent=Zotero.probe?Zotero.probe.detail:'点「测试连接」探测 Zotero 本地 API';
}
function bindZoteroSettings(){
  const en=document.getElementById('setZoteroEnabled');if(!en)return;
  en.onchange=()=>{zoteroSetCfg({enabled:en.checked});renderZoteroBar();if(en.checked)zoteroProbe();toast(en.checked?'Zotero 对接已开启':'Zotero 对接已关闭')};
  const port=document.getElementById('setZoteroPort');
  if(port)port.onchange=()=>{const v=Math.max(1,Math.min(65535,parseInt(port.value,10)||23119));port.value=v;zoteroSetCfg({port:v});Zotero.probe=null;renderZoteroSettings()};
  const test=document.getElementById('btnZoteroTest');
  if(test)test.onclick=async()=>{test.disabled=true;try{await zoteroProbe()}finally{test.disabled=false}};
  const wr=document.getElementById('setZoteroWrite');
  if(wr)wr.onchange=()=>{zoteroSetCfg({writeBack:wr.checked});toast(wr.checked?'已开启状态镜像：阅读状态变化时写回 Zotero tag（需 Zotero 10+ 授权弹窗）':'已关闭状态镜像')};
}
bindZoteroSettings();
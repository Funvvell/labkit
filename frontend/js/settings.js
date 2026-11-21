// LabKit · settings.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 设置页：真实落盘状态 / 备份 / 导入导出 ===================== */
const DENSITY={compact:[128,10],normal:[152,13],cozy:[176,16]};
function applyDensity(){
  const d=(DB.ui&&DB.ui.density)||'normal';
  const [row,gap]=DENSITY[d]||DENSITY.normal;
  document.documentElement.style.setProperty('--row',row+'px');
  document.documentElement.style.setProperty('--gap',gap+'px');
  document.querySelectorAll('[data-density]').forEach(b=>b.classList.toggle('active',b.dataset.density===d));
  /* P2：gridstack 的行高/间距用数值像素，密度切换时同步给引擎 */
  if(typeof dashApplyMetrics==='function')dashApplyMetrics();
  queueResize();
}
function renderDbStatus(){
  const pill=document.getElementById('dbPill');if(!pill)return;
  const map={init:['读取中…','saving'],saving:['保存中…','saving'],saved:['已落盘','' ],error:['保存失败','error'],browser:['浏览器模式','browser']};
  const [txt,cls]=map[dbStatus]||['—','browser'];
  pill.textContent=txt+(dbStatus==='saved'&&dbSavedAt?' · '+dbSavedAt.slice(11):'');
  pill.className='db-pill '+cls;
  pill.title=dbStatus==='error'?dbError:(dbPath||'');
}
async function renderSettings(){
  renderDbStatus();
  const box=document.getElementById('dbInfo');if(!box)return;
  let info=null;
  if(IN_TAURI){try{info=await invoke('db_info');if(info&&info.path)dbPath=info.path}catch(e){}}
  const counts=[['任务',DB.tasks.length],['项目',DB.projects.length],['实验',DB.experiments.length],['文献',DB.literatures.length],
    ['试剂',DB.reagents.length],['仪器',DB.instruments.length],['预约',DB.bookings.length],['专注',DB.focusRecords.length],
    ['经费',DB.budget.length],['速记',DB.notes.length],['提醒',DB.reminders.length]];
  const kv=[
    ['数据文件',dbPath||'（浏览器 localStorage，不落盘）'],
    ['文件大小',info?((info.bytes/1024).toFixed(1)+' KB'):'—'],
    ['最后修改',info&&info.modified?info.modified:(dbSavedAt||'—')],
    ['备份份数',info?String(info.backups):'—'],
    ['记录总数',counts.map(([k,n])=>k+' '+n).join(' · ')],
    ['数据来源',DB.isDemo?'仍含首次启动的示例数据':'已全部是你自己的记录'],
    ['使用范围','仅供科研使用，不用于临床诊断'],
  ];
  if(dbStatus==='error')kv.push(['错误',dbError]);
  box.innerHTML=kv.map(([k,v])=>`<div class="k">${esc(k)}</div><div class="v">${esc(v)}</div>`).join('');
  const tnw=document.getElementById('setToolOpenInPage');if(tnw)tnw.checked=!!Store.settings().toolOpenInPage;
  if(typeof renderZoteroSettings==='function')renderZoteroSettings();
  if(typeof renderPluginSettings==='function')renderPluginSettings();
  if(typeof renderVaultSettings==='function')renderVaultSettings();
  applyDensity();
}
document.querySelectorAll('[data-density]').forEach(b=>b.onclick=()=>{
  DB.ui=Object.assign({},DB.ui,{density:b.dataset.density});
  saveDB();applyDensity();toast('界面密度：'+b.textContent);
});
document.getElementById('btnDbSave').onclick=async()=>{await flushDB();if(dbStatus==='saved')toast('已写入磁盘');renderSettings()};
document.getElementById('btnDbBackup').onclick=async()=>{
  if(!IN_TAURI){toast('浏览器模式不支持磁盘备份');return}
  try{const p=await invoke('db_backup');toast('已备份：'+p,5000);renderSettings()}catch(e){toast('备份失败：'+e,6000)}
};
document.getElementById('btnDbExport').onclick=async()=>{
  if(!IN_TAURI){dlJSON('labkit-'+todayStr()+'.json',DB);return}
  try{
    const dest=await invoke('plugin:dialog|save',{options:{title:'导出台账 JSON',defaultPath:'labkit-'+todayStr()+'.json',filters:[{name:'JSON',extensions:['json']}]}});
    if(!dest)return;
    const p=await invoke('db_export',{dest:String(dest)});
    toast('已导出：'+p,5000);
  }catch(e){toast('导出失败：'+e,6000)}
};
document.getElementById('btnDbImport').onclick=async()=>{
  if(!IN_TAURI){toast('浏览器模式请用桌面版导入');return}
  try{
    const src=await invoke('plugin:dialog|open',{options:{title:'选择台账 JSON',multiple:false,filters:[{name:'JSON',extensions:['json']}]}});
    if(!src)return;
    const data=await invoke('db_import',{src:String(src)});
    if(data&&typeof data==='object'){
      Object.keys(data).forEach(k=>{if(k in DB)DB[k]=data[k]});
      migrateDB();writeCache();refreshHome();renderLiterature();renderLab();renderFocusPage();renderReports();renderSettings();
      toast('已导入并覆盖当前台账（导入前已自动备份）',5200);
    }
  }catch(e){toast('导入失败：'+e+'（原数据未被改动）',7000)}
};
document.getElementById('btnDbFolder').onclick=async()=>{
  if(!IN_TAURI||!dbPath){toast('数据目录：'+(dbPath||'浏览器模式无目录'),6000);return}
  try{await invoke('plugin:opener|reveal_item_in_dir',{paths:[dbPath]})}
  catch(e){toast('打开失败，路径：'+dbPath,7000)}
};
const EMPTY_DB={tasks:[],projects:[],focusRecords:[],experiments:[],literatures:[],reagents:[],instruments:[],reminders:[],budget:[],bookings:[],notes:[],recentSlides:[]};
document.getElementById('btnDbClearDemo').onclick=()=>{
  if(!DB.isDemo){toast('当前已经没有示例数据了');return}
  confirmModal('清空示例数据','把首次启动自带的示例任务、项目、实验等全部清空，从零开始记你自己的数据。清空前会自动备份。',async()=>{
    if(IN_TAURI){try{await invoke('db_backup')}catch(e){}}
    Object.keys(EMPTY_DB).forEach(k=>DB[k]=[]);
    DB.isDemo=false;saveDB();await flushDB();
    refreshHome();renderLiterature();renderLab();renderFocusPage();renderReports();renderSettings();
    toast('已清空示例数据，可以开始记自己的了',4600);
  },'清空');
};
document.getElementById('btnDbReset').onclick=()=>{
  confirmModal('重置全部台账','删除磁盘上的台账文件与滚动备份，回到首次启动状态。backups/ 里的历史备份会保留，可用「导入 JSON」找回。',async()=>{
    try{
      if(IN_TAURI)await invoke('db_reset');
      try{localStorage.removeItem(DB_KEY)}catch(e){}
      location.reload();
    }catch(e){toast('重置失败：'+e,6000)}
  },'重置');
};
document.querySelectorAll('#reportRange [data-range]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#reportRange [data-range]').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');reportRange=+b.dataset.range;renderReports();
});
document.getElementById('btnNewFocus').onclick=()=>entityModal('focus');
document.getElementById('btnLabNew').onclick=()=>entityModal(labTab==='reagent'?'reagent':labTab==='instrument'?'instrument':'booking');

/* ===================== Markdown 台账 Vault =====================
   一条记录一个 .md，Obsidian 可直接编辑；外部改动聚焦时读回，外部编辑优先。
   投影/摄入全在 Rust 侧，这里只负责配置与状态展示。 */
let _vaultSt=null;
async function pickVaultDir(){
  try{
    const d=await invoke('plugin:dialog|open',{options:{title:'选择 Markdown Vault 目录（可直接选已有的 Obsidian 库）',directory:true,multiple:false}});
    return d?String(d):'';
  }catch(e){toast('选择目录失败：'+e,6000);return ''}
}
async function renderVaultSettings(){
  const pill=document.getElementById('vaultPill');if(!pill)return;
  const en=document.getElementById('setVaultEnabled'),info=document.getElementById('vaultInfo'),cbox=document.getElementById('vaultConflicts');
  const btns=['btnVaultDir','btnVaultSync','btnVaultOpen'].map(id=>document.getElementById(id));
  if(!IN_TAURI){
    pill.textContent='浏览器模式';pill.className='db-pill browser';
    if(en){en.checked=false;en.disabled=true}
    btns.forEach(b=>{if(b)b.disabled=true});
    if(info)info.innerHTML='<div class="k">说明</div><div class="v">浏览器演示模式无磁盘访问，Markdown Vault 仅桌面版可用。</div>';
    if(cbox)cbox.innerHTML='';
    return;
  }
  try{_vaultSt=await invoke('vault_status')}catch(e){_vaultSt=null}
  const st=_vaultSt||{enabled:false,dir:'',files:0,errors:[],lastSync:'',conflicts:0,conflictList:[]};
  if(en){en.disabled=false;en.checked=!!st.enabled}
  btns.forEach(b=>{if(b)b.disabled=false});
  const nConflict=st.conflicts||0;
  pill.textContent=st.enabled?(nConflict?nConflict+' 处冲突待裁决':'已启用'):'未启用';
  pill.className='db-pill '+(st.enabled?(nConflict?'error':''):'browser');
  pill.title=st.dir||'';
  const kv=[['Vault 目录',st.dir||'（未选择）'],['记录文件',String(st.files||0)],
    ['上次同步',st.lastSync||'—'],['待裁决冲突',String(nConflict)]];
  const errs=st.errors||[];
  if(errs.length)kv.push(['同步错误',errs.slice(0,2).join('；')+(errs.length>2?' 等 '+errs.length+' 条':'')]);
  if(info)info.innerHTML=kv.map(([k,v])=>`<div class="k">${esc(k)}</div><div class="v">${esc(v)}</div>`).join('');
  if(cbox){
    cbox.innerHTML=(st.conflictList||[]).map(c=>`<div class="vault-conflict">
      <span class="nm" title="${esc(c.id)}">${esc(c.label||c.id)}</span>
      <button class="btn sec" data-vault-keep="local" data-vault-id="${esc(c.id)}">保留本地</button>
      <button class="btn sec" data-vault-keep="vault" data-vault-id="${esc(c.id)}">采用 Vault</button>
    </div>`).join('');
    cbox.querySelectorAll('[data-vault-keep]').forEach(b=>b.onclick=async()=>{
      const keep=b.dataset.vaultKeep;
      try{
        await invoke('vault_resolve',{id:b.dataset.vaultId,keep});
        toast(keep==='local'?'已还原本地版本，并覆盖 Vault 里的文件':'已采用 Vault 版本');
      }catch(e){toast('裁决失败：'+e,6000)}
      renderVaultSettings();
    });
  }
}
const _vaultEn=document.getElementById('setVaultEnabled');
if(_vaultEn)_vaultEn.onchange=async e=>{
  if(!IN_TAURI){toast('浏览器演示模式不支持 Markdown Vault');e.target.checked=false;return}
  const want=e.target.checked;
  let dir=(_vaultSt&&_vaultSt.dir)||'';
  if(want&&!dir){
    dir=await pickVaultDir();
    if(!dir){e.target.checked=false;return}
  }
  try{
    // 启用/换目录前先把本地改动落盘：投影源必须是已提交的最新台账
    await flushDB();
    const rep=await invoke('vault_configure',{dir,enable:want});
    const n=(rep&&rep.projected&&rep.projected.written)||0;
    toast(want?'已启用 Markdown Vault，生成 '+n+' 个记录文件（启用前已自动备份）':'已关闭 Vault，markdown 文件原样保留',5600);
  }catch(err){toast('配置失败：'+err,7000);e.target.checked=!want}
  renderVaultSettings();
};
const _vaultDirBtn=document.getElementById('btnVaultDir');
if(_vaultDirBtn)_vaultDirBtn.onclick=async()=>{
  if(!IN_TAURI){toast('浏览器演示模式不支持磁盘目录');return}
  const dir=await pickVaultDir();if(!dir)return;
  const apply=async()=>{
    try{
      await flushDB();
      const rep=await invoke('vault_configure',{dir,enable:true});
      toast('Vault 目录已设为：'+dir+'（生成 '+((rep&&rep.projected&&rep.projected.written)||0)+' 个文件）',6500);
    }catch(e){toast('设置失败：'+e,7000)}
    renderVaultSettings();
  };
  if(_vaultSt&&_vaultSt.enabled&&_vaultSt.dir&&_vaultSt.dir!==dir){
    confirmModal('更换 Vault 目录','当前 Vault 里的 markdown 文件会原样保留但不再同步；新目录将重新生成全部记录文件。确定更换？',apply,'更换');
  }else await apply();
};
const _vaultSyncBtn=document.getElementById('btnVaultSync');
if(_vaultSyncBtn)_vaultSyncBtn.onclick=async()=>{
  if(!IN_TAURI){toast('浏览器演示模式不支持 Vault 同步');return}
  try{
    await flushDB();
    const rep=await invoke('vault_sync');
    const p=(rep&&rep.projected)||{},nc=(rep&&rep.conflicts||[]).length;
    toast('同步完成：读回 '+(rep.ingested||0)+' 条外部改动，写出 '+(p.written||0)+' 个文件'+(nc?'，'+nc+' 处冲突待裁决':''),6000);
  }catch(e){toast('同步失败：'+e,7000)}
  renderVaultSettings();
};
const _vaultOpenBtn=document.getElementById('btnVaultOpen');
if(_vaultOpenBtn)_vaultOpenBtn.onclick=async()=>{
  const dir=_vaultSt&&_vaultSt.dir;
  if(!IN_TAURI||!dir){toast('还没有选择 Vault 目录',5000);return}
  try{await invoke('plugin:opener|reveal_item_in_dir',{paths:[dir]})}
  catch(e){toast('打开失败，路径：'+dir,7000)}
};

/* ===================== P3：称呼与主题 ===================== */
function applyTheme(){
  const t=Store.settings().theme||'system';
  const dark=t==='dark'||(t==='system'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
  document.querySelectorAll('#themeSeg [data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===t));
}
document.querySelectorAll('#themeSeg [data-theme]').forEach(b=>b.onclick=()=>{
  Store.setSetting('theme',b.dataset.theme);applyTheme();toast('主题：'+b.textContent);
});
if(window.matchMedia)matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{
  if((Store.settings().theme||'system')==='system')applyTheme();
});
const setNameEl=document.getElementById('setName');
if(setNameEl){
  setNameEl.value=Store.settings().name||'';
  setNameEl.onchange=()=>{Store.setSetting('name',setNameEl.value.trim());if(typeof setGreet==='function')setGreet();toast('称呼已更新');};
}
/* 工具默认新窗口；勾选本项则改为页内打开（仅桌面版；浏览器模式恒页内） */
const setToolOpenInPageEl=document.getElementById('setToolOpenInPage');
if(setToolOpenInPageEl){
  setToolOpenInPageEl.checked=!!Store.settings().toolOpenInPage;
  setToolOpenInPageEl.disabled=!IN_TAURI;
  setToolOpenInPageEl.title=IN_TAURI?'默认所有工具在新窗口打开；开启后改为页内打开。工具卡 ↗ / Ctrl+点击 / 中键仍可随时开新窗口':'浏览器演示模式无多窗口，恒为页内打开';
  setToolOpenInPageEl.onchange=()=>{Store.setSetting('toolOpenInPage',setToolOpenInPageEl.checked);toast(setToolOpenInPageEl.checked?'工具将默认在页内打开':'工具将默认在新窗口打开');};
}
applyTheme();

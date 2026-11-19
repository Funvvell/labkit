// LabKit · settings.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 设置页：真实落盘状态 / 备份 / 导入导出 ===================== */
const DENSITY={compact:[128,10],normal:[152,13],cozy:[176,16]};
function applyDensity(){
  const d=(DB.ui&&DB.ui.density)||'normal';
  const [row,gap]=DENSITY[d]||DENSITY.normal;
  document.documentElement.style.setProperty('--row',row+'px');
  document.documentElement.style.setProperty('--gap',gap+'px');
  document.querySelectorAll('[data-density]').forEach(b=>b.classList.toggle('active',b.dataset.density===d));
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
applyTheme();

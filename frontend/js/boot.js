// LabKit · boot.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== Boot =====================
   必须先把磁盘上的台账读回来再渲染，否则首屏会闪一下示例数据。 */
/* P3：问候称呼来自设置（Store.settings().name），不再硬编码用户名 */
function setGreet(){
  const h=new Date().getHours();
  const g=h<6?'夜深了':h<11?'早安':h<14?'午安':h<18?'下午好':'晚上好';
  const el=document.getElementById('greetTitle');if(el)el.textContent=g+'，'+userName();
}
/* P3：首启欢迎 —— 示例数据 / 空白开始 二选一，选择后写入本地台账 */
function showWelcome(){
  const m=document.getElementById('welcomeMask');if(!m)return;
  m.hidden=false;
  const nameEl=document.getElementById('welcomeName');
  nameEl.value=Store.settings().name||'';
  const finish=async blank=>{
    Store.setSetting('name',nameEl.value.trim());
    if(blank){Object.keys(EMPTY_DB).forEach(k=>DB[k]=[]);DB.isDemo=false;}
    m.hidden=true;
    saveDB();await flushDB();
    refreshHome();renderLiterature();renderLab();renderFocusPage();renderReports();renderSettings();
    setGreet();if(typeof notifyBadge==='function')notifyBadge();
    toast(blank?'已空白开始，记录你自己的数据吧':'已载入示例数据，可在设置中随时清空');
  };
  document.getElementById('welcomeDemo').onclick=()=>finish(false);
  document.getElementById('welcomeBlank').onclick=()=>finish(true);
}
(async function initHome(){
  const d=new Date();
  document.getElementById('homeDate').textContent=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · 星期${'日一二三四五六'[d.getDay()]}`;
  setGreet();
  await loadDBFromDisk();
  Store.migrateLegacy();   // P2：旧 localStorage 工具状态搬进台账
  applyTheme();            // P3：主题（浅色/深色/跟随系统）
  setGreet();              // 磁盘读回后用真实称呼重设问候
  if(window.__labkitFirstRun)showWelcome();
  if(typeof notifyBadge==='function')notifyBadge();
  if(typeof shellRenderFavs==='function')shellRenderFavs();   // 磁盘读回后刷新收藏侧栏
  applyDensity();
  buildDash(true);
  refreshHome();
  renderLiterature();renderLab();renderFocusPage();renderReports();renderSettings();
})();
invoke('init_engine').catch(()=>{});
invoke('app_info').then(info=>{if(info&&info.version)document.querySelector('.side-foot').textContent='v'+info.version+' · Rust + Tauri'}).catch(()=>{});
ensureRoiDb();
/* Restore the last qPCR run (wells + design) from the independent session file. */
if(IN_TAURI){
  invoke('qpcr_load_session').then(run=>{
    if(!run||!run.wells||!run.wells.length)return;
    afterWells(run.wells);
    const d=run.design||{};
    if(d.reference_targets&&d.reference_targets.length)qState.refSet=new Set(d.reference_targets);
    if(d.calibrator_sample)qState.calibrator=d.calibrator_sample;
    if(d.ref_strategy)qState.refStrategy=d.ref_strategy;
    if(d.efficiency)qState.eff={...d.efficiency};
    document.getElementById('groupInput').value=Object.entries(d.sample_groups||{}).map(([k,v])=>k+'='+v).join('\n');
    document.querySelectorAll('#refSeg button').forEach(b=>b.classList.toggle('active',b.dataset.ref===qState.refStrategy));
    renderQConfig();
    scheduleQ();
  }).catch(()=>{});
}
/* P1：外壳 / 命令面板 / 全局快捷键 / 路由初始化。
   路由放最后：深链（#/tool/x）渲染时侧栏与面板已就绪。 */
shellInit();
paletteInit();
keysInit();
routerInit();

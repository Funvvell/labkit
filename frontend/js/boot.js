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
  /* P4：先注入已启用插件（注册工具/卡片），再渲染侧栏与 Dashboard；
     单个插件失败隔离，不拖垮主程序。浏览器模式无桌面插件，直接跳过。 */
  if(typeof pluginBoot==='function'){try{await pluginBoot()}catch(e){console.warn('插件加载失败：',e)}}
  if(WINDOW_MODE){
    /* P1 工具窗口模式：只保留目标视图所需初始化——跳过欢迎遮罩 / 首页 Dashboard /
       子页渲染 / 通知轮询（这些只属于主窗口）。路由随后直达 #/tool/<id>。 */
    document.body.classList.add('win-mode');
    applyDensity();
    return;
  }
  if(window.__labkitFirstRun)showWelcome();
  if(typeof notifyBadge==='function')notifyBadge();
  if(typeof shellRenderPins==='function')shellRenderPins();   // 磁盘读回后刷新侧栏固定区
  if(typeof shellRenderCats==='function')shellRenderCats();   // 插件工具注册后刷新工具分组
  if(typeof renderToolHub==='function')renderToolHub();       // 工具库卡片同步插件工具
  if(typeof renderZoteroBar==='function')renderZoteroBar();   // P3：文献页连接状态条
  if(typeof zoteroProbe==='function'&&zoteroCfg().enabled)zoteroProbe();  // 开启对接时后台探测
  if(typeof pluginFetchIndex==='function'&&_route.name==='plugins')pluginFetchIndex();  // 深链直达市场时磁盘已就绪
  applyDensity();
  buildDash(true);
  refreshHome();
  renderLiterature();renderLab();renderFocusPage();renderReports();renderSettings();
})();
invoke('init_engine').catch(()=>{});
invoke('app_info').then(info=>{if(info&&info.version)document.querySelector('.side-foot').textContent='v'+info.version+' · Rust + Tauri'}).catch(()=>{});
if(!WINDOW_MODE||WIN_LABEL==='tool-crop')ensureRoiDb();
/* Restore the last qPCR run (wells + design) from the independent session file. */
if(IN_TAURI&&(!WINDOW_MODE||WIN_LABEL==='tool-qpcr')){
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
/* P1 工具窗口收尾：标题栏显示工具名、隐藏返回键（窗口内无首页可回）、
   内容就绪后 show()（创建时 visible:false，window-state 已先恢复尺寸/位置，防闪烁）。 */
if(WINDOW_MODE){
  const r=parseHash(location.hash);
  const meta=r.name==='tool'?(window.TOOL_META||[]).find(t=>t.id===r.arg):null;
  const title=(meta&&meta.name)||(PAGE_META[r.name]&&PAGE_META[r.name].name)||'工具';
  const wt=document.querySelector('.win-title');
  if(wt&&wt.lastChild&&wt.lastChild.nodeType===3)wt.lastChild.textContent=' '+title+' · LabKit';
  ['toolBack','cropBack','qpcrBack'].forEach(id=>{const b=document.getElementById(id);if(b)b.hidden=true});
  const W=lkWin().getCurrentWindow();
  W.setTitle(title+' · 科研工具箱 LabKit').catch(()=>{});
  /* show 失败就销毁窗口：visible:false 的失败窗会一直留在进程里，
     导致「关不掉/退不出」。destroy 不发 CloseRequested，不触发握手。 */
  const showWin=()=>{W.show().catch(()=>{W.destroy().catch(()=>{})})};
  if(r.name==='tool'){
    /* 等工具脚本注入并渲染出首个非占位节点再显示；2.5s 兜底防卡白窗 */
    const host=document.getElementById('toolHost');
    const mo=new MutationObserver(()=>{if(host.querySelector(':not(.tnote)')){mo.disconnect();showWin()}});
    mo.observe(host,{childList:true});
    setTimeout(()=>{mo.disconnect();showWin()},2500);
  }else setTimeout(showWin,80);
}

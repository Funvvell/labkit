// LabKit · boot.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== Boot =====================
   必须先把磁盘上的台账读回来再渲染，否则首屏会闪一下示例数据。 */
/* P3：问候称呼来自设置（Store.settings().name），不再硬编码用户名 */
function setGreet(){
  const h=new Date().getHours();
  const g=h<6?'夜深了':h<11?'早安':h<14?'午安':h<18?'下午好':'晚上好';
  const el=document.getElementById('greetTitle');if(el)el.textContent=g+'，'+userName();
  refreshAvatar();
}
/* 顶栏头像必须是真实 button：原先是 div，落在 Tauri 拖拽区里 mousedown 会触发
   窗口拖动而非点击（表现为「点不动」），且无任何 handler。字母取称呼首字，点击进设置。 */
function refreshAvatar(){
  const el=document.getElementById('btnAvatar');if(!el)return;
  const n=userName();
  el.textContent=Array.from(n)[0]||'研';
  el.title=n+' · 设置';
  el.setAttribute('aria-label',n+' · 打开设置');
}
/* P3：首启欢迎 —— 示例数据 / 空白开始 二选一，选择后写入本地台账 */
function showWelcome(){
  const m=document.getElementById('welcomeMask');if(!m)return;
  m.addEventListener('cancel',e=>e.preventDefault());
  m.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();}},true);
  m.addEventListener('close',()=>{m.hidden=true;});
  openLayer(m);
  const nameEl=document.getElementById('welcomeName');
  nameEl.value=Store.settings().name||'';
  const finish=async blank=>{
    Store.setSetting('name',nameEl.value.trim());
    if(blank){Object.keys(EMPTY_DB).forEach(k=>DB[k]=[]);DB.isDemo=false;}
    closeLayer(m);
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
  /* P7：标签页恢复必须等台账与插件工具都就绪（TOOL_META 完整），
     否则已装的插件工具会被归一化误删。 */
  if(typeof tabsBoot==='function'){try{tabsBoot(parseHash(location.hash))}catch(e){console.warn('标签页初始化失败：',e)}}
  if(WINDOW_MODE){
    /* P1 工具窗口模式：只保留目标视图所需初始化——跳过欢迎遮罩 / 首页 Dashboard /
       子页渲染 / 通知轮询（这些只属于主窗口）。路由随后直达 #/tool/<id>。
       P7：tools 窗口承载全部工具/工作区标签，是完整的标签宿主；tool-* 是单工具分离窗。 */
    document.body.classList.add('win-mode');
    applyDensity();
    if(TOOLBOX_WIN){
      const bell=document.getElementById('btnBell');if(bell)bell.hidden=true;
      const avatar=document.getElementById('btnAvatar');if(avatar)avatar.hidden=true;
    }
    ['toolBack','cropBack','qpcrBack'].forEach(id=>{const b=document.getElementById(id);if(b)b.hidden=true});
    routerInit();
    if(typeof tabWindowShowWhenReady==='function')tabWindowShowWhenReady();
    return;
  }
  if(window.__labkitFirstRun)showWelcome();
  if(typeof notifyBadge==='function')notifyBadge();
  if(typeof shellRenderPins==='function')shellRenderPins();   // 磁盘读回后刷新侧栏固定区
  if(typeof shellRenderCats==='function')shellRenderCats();   // 插件工具注册后刷新工具分组
  if(typeof renderToolHub==='function')renderToolHub();       // 工具库卡片同步插件工具
  if(typeof renderZoteroBar==='function')renderZoteroBar();   // P3：文献页连接状态条
  if(typeof zoteroProbe==='function'&&zoteroCfg().enabled)zoteroProbe();  // 开启对接时后台探测
  if(typeof pluginFetchAll==='function'&&parseHash(location.hash).name==='plugins')pluginFetchAll();  // 深链直达扩展管理时磁盘已就绪
  applyDensity();
  buildDash(true);
  refreshHome();
  renderLiterature();renderLab();renderFocusPage();renderReports();renderSettings();
  routerInit();
})();
invoke('init_engine').catch(()=>{});
invoke('app_info').then(info=>{
  if(!info||!info.version)return;
  document.querySelectorAll('.side-foot').forEach(el=>{el.textContent='v'+info.version+' · Rust + Tauri'});
  const about=document.getElementById('aboutLine');
  if(about)about.textContent='科研工具箱 LabKit v'+info.version+' · Rust + Tauri · SDPC 解码 & qPCR 核心复用自 Rust 重构版';
}).catch(()=>{});
/* P6：主窗口启动 5s 后静默检查更新（失败不打扰；设置页可关闭） */
if(IN_TAURI&&!WINDOW_MODE&&typeof updateAutoCheck==='function')setTimeout(()=>{updateAutoCheck()},5000);
if(!WINDOW_MODE||WIN_LABEL==='tool-crop')ensureRoiDb();
/* qPCR 会话：专用窗口启动即恢复；工具箱窗口由首次激活 qPCR 标签时懒加载
   （隐藏视图里直接渲染 Plotly 会拿到 0 尺寸）。 */
if(IN_TAURI&&(!WINDOW_MODE||WIN_LABEL==='tool-qpcr')&&typeof qpcrRestoreSession==='function')qpcrRestoreSession();
/* P1：外壳 / 命令面板 / 全局快捷键。
   路由初始化已移入异步 initHome 末尾：必须等台账与插件就绪，
   否则深链工具页会在 TOOL_META 不完整时渲染（P7 标签恢复同理）。 */
shellInit();
paletteInit();
keysInit();
const avBtn=document.getElementById('btnAvatar');
if(avBtn&&!WINDOW_MODE)avBtn.onclick=()=>navigate('settings');

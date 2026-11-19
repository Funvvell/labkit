// LabKit · router.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== 页面路由 ===================== */
const VIEW_MAP={home:'view-home',tasks:'view-tasks',focus:'view-focus',projects:'view-projects',experiments:'view-experiments',literature:'view-literature',labres:'view-labres',reports:'view-reports',settings:'view-settings',ds:'view-ds',crop:'view-crop',qpcr:'view-qpcr',toolhub:'view-toolhub',tool:'view-tool'};
/* 工作区返回目标：默认回首页；从工具库卡片进入时回工具库 */
const wsBack={crop:'home',qpcr:'home'};
let _wsBackNext=null;
const _reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
function openView(name){
  const apply=()=>{
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById(VIEW_MAP[name]||'view-home').classList.add('active');
    // 仅三个工具工作区收起侧栏；其余子页保持侧栏便于切换
    const isWorkspace = (name==='crop'||name==='qpcr'||name==='ds'||name==='tool');
    document.getElementById('sidebar').classList.toggle('hidden', isWorkspace);
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    const navKey = (name==='crop'||name==='qpcr'||name==='tool') ? null : (name==='ds'?'ds':name);
    if(navKey)document.querySelector(`.nav-item[data-nav="${navKey}"], .nav-item[data-tool-open="${name}"]`)?.classList.add('active');
    if(name==='crop'||name==='qpcr'){wsBack[name]=_wsBackNext||'home';_wsBackNext=null;}
  };
  /* View Transitions API：原生跨视图淡切；不支持或用户偏好减少动效时直接切换 */
  if(document.startViewTransition&&!_reduceMotion.matches){document.startViewTransition(apply);}
  else apply();
}
document.getElementById('cropBack').onclick=()=>openView(wsBack.crop);
document.getElementById('qpcrBack').onclick=()=>openView(wsBack.qpcr);
document.getElementById('dsBack').onclick=()=>openView('home');
document.querySelectorAll('.nav-item[data-nav]').forEach(n=>n.addEventListener('click',()=>{
  openView(n.dataset.nav);
  if(n.dataset.nav==='ds')toast('设计规范页 — 新增工具时对照使用');
}));
document.querySelectorAll('.nav-item[data-tool-open]').forEach(n=>n.addEventListener('click',()=>openView(n.dataset.toolOpen)));
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-goto]');
  if(g)openView(g.dataset.goto);
  const bk=e.target.closest('[data-back]');
  if(bk)openView('home');
});


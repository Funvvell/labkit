// LabKit · router.js — hash 路由（P1 重写）
// 深链（#/tool/epi2x2）、前进/后退、刷新恢复；openView 保留为兼容入口。
/* ===================== 页面路由 ===================== */
const VIEW_MAP = { home: 'view-home', tasks: 'view-tasks', focus: 'view-focus', projects: 'view-projects', experiments: 'view-experiments', literature: 'view-literature', labres: 'view-labres', reports: 'view-reports', settings: 'view-settings', crop: 'view-crop', qpcr: 'view-qpcr', toolhub: 'view-toolhub', plugins: 'view-plugins', tool: 'view-tool' };
let _route = { name: 'home', arg: null };
let _navDepth = 0;       // 本会话 push 过的次数：决定返回键能否 history.back()

function parseHash(h) {
  const s = (h || '').replace(/^#\/?/, '');
  if (!s) return { name: 'home', arg: null };
  const [name, ...rest] = s.split('/');
  if (name === 'tool' && rest[0]) return { name: 'tool', arg: rest.join('/') };
  return VIEW_MAP[name] ? { name, arg: null } : { name: 'home', arg: null };
}
function routeHash(r) { return r.name === 'tool' ? '#/tool/' + r.arg : '#/' + r.name; }

function applyView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  (document.getElementById(VIEW_MAP[name]) || document.getElementById('view-home')).classList.add('active');
  // 工作区收起侧栏（顶部面包屑返回）；其余视图保持持久侧栏
  const isWorkspace = (name === 'crop' || name === 'qpcr' || name === 'tool');
  document.getElementById('sidebar').classList.toggle('hidden', isWorkspace);
  if (typeof shellSyncNav === 'function') shellSyncNav(name);
}
/* 视图切换同步生效；淡入由 CSS .view.active 动画承担（reduced-motion 全局已关动画）。
   不用 View Transitions API：其更新回调异步等渲染帧，低帧率/无头环境下视图会卡在半路，
   且并发 skipTransition 会取消 DOM 更新回调（P1 实测踩坑）。 */
function renderRoute(r) {
  _route = r;
  applyView(r.name);
  if (r.name === 'tool' && r.arg) renderTool(r.arg);   // toolhub.js：注入脚本并渲染，不再改路由
  if (r.name === 'plugins' && typeof pluginFetchIndex === 'function') pluginFetchIndex();
}
function navigate(name, arg) {
  const r = (name === 'tool') ? { name: 'tool', arg } : parseHash('#/' + name);
  const h = routeHash(r);
  if (location.hash === h) { renderRoute(r); return; }
  _navDepth++;
  location.hash = h;   // hashchange → renderRoute
}
/* 兼容旧调用（home / dashboard / entities / crop / qpcr 里大量 openView） */
function openView(name) { navigate(name); }
function routerBack(fallback) {
  if (_navDepth > 0) { _navDepth--; history.back(); }
  else navigate(fallback || 'home');
}
window.addEventListener('hashchange', () => renderRoute(parseHash(location.hash)));

/* 工作区返回键：走真实历史（从工具库进就回工具库，从首页进就回首页） */
document.getElementById('cropBack').onclick = () => routerBack('home');
document.getElementById('qpcrBack').onclick = () => routerBack('home');
document.getElementById('toolBack').onclick = () => routerBack('toolhub');
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]');
  if (g) { navigate(g.dataset.goto); return; }
  const bk = e.target.closest('[data-back]');
  if (bk) navigate('home');
});
function routerInit() {
  const r = parseHash(location.hash);
  if (!location.hash) history.replaceState(null, '', '#/home');
  renderRoute(r);
}
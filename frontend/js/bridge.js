// LabKit · bridge.js — P0 由 index.html 机械拆分，保持原顺序与语义（classic script，零构建）
/* ===================== Bridge to Tauri core ===================== */
const IN_TAURI = !!(window.__TAURI_INTERNALS__ || window.__TAURI__);
/* P1 多窗口：当前窗口标签与「工具窗口模式」。
   工具窗口复用同一 index.html，URL 带 #/tool/<id>（工作区为 #/crop、#/qpcr）；
   label !== 'main' 即窗口模式：精简初始化、隐藏返回键、标题栏显示工具名。 */
const WIN_LABEL = IN_TAURI ? (window.__TAURI__.window.getCurrentWindow().label) : 'main';
const WINDOW_MODE = IN_TAURI && WIN_LABEL !== 'main';
function lkWin() { return window.__TAURI__ && window.__TAURI__.window; }
async function invoke(cmd, args = {}) {
  if (IN_TAURI) {
    if (window.__TAURI__ && window.__TAURI__.invoke) return window.__TAURI__.invoke(cmd, args);
    return window.__TAURI_INTERNALS__.invoke(cmd, args);
  }
  return mockInvoke(cmd, args);
}
// Browser fallback: keeps the UI fully demoable without the Rust backend.
function mockInvoke(cmd, args) {
  const ok = (v) => Promise.resolve(v);
  switch (cmd) {
    case 'app_info': return ok({version:'0.2.0', name:'科研工具箱 LabKit', tool_count:12});
    /* 浏览器里没有磁盘，用 localStorage 顶一下，保证纯前端也能演示增删改 */
    case 'db_load': return ok(readCache());
    case 'db_save': writeCache();return ok('（浏览器缓存，非磁盘文件）');
    case 'db_info': return ok({path:'（浏览器 localStorage）',exists:!!readCache(),bytes:JSON.stringify(DB).length,modified:'',backups:0});
    case 'db_backup': return ok('（浏览器模式不支持备份）');
    case 'db_export': return ok('（浏览器模式请用导出 CSV）');
    case 'db_import': return ok(null);
    case 'db_reset': try{localStorage.removeItem(DB_KEY)}catch(e){};return ok(null);
    case 'init_engine': return ok('ready');
    case 'default_output_dir': return ok('~/LabKit_Export');
    case 'load_rois': return ok([]);
    case 'save_rois': return ok('');
    case 'cancel_export': return ok(null);
    case 'qpcr_default_design': return ok({});
    case 'qpcr_save_session': return ok('');
    case 'qpcr_load_session': return ok(null);
    case 'qpcr_parse_pasted': return ok(parsePasteLocal(args.text));
    case 'qpcr_new_run': return ok({id:'mock', name:args.sourceName||'手动输入', wells:args.wells, design:{}, created_at:''});
    case 'qpcr_analyze': return ok(analyzeLocal(args.run));
    default: return ok(null);
  }
}


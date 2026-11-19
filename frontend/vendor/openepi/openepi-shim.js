// OpenEpi 运行垫片（LabKit 新增，MIT）：补齐上游框架依赖的最小浏览器全局。
// 必须在 StatFunctions1.js / OECommands.js / MartinStats.js 之前加载。
window.currConfig = function () { return 'desktop'; };
window.t = function (s) { return s; }; // 翻译函数：中文界面下恒等返回
window.__oe = window.__oe || {};
// 上游在零单元格等场景调 alert；无 DOM 环境（node 测试）补桩，浏览器内由适配器临时接管
if (typeof window.alert !== 'function') {
  window.alert = function (m) { (window.__oeAlerts = window.__oeAlerts || []).push(String(m)); };
}
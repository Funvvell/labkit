# 贡献指南 · Contributing to LabKit

感谢愿意让 LabKit 更好！本文说明开发环境、测试与「新增一个工具」的标准流程。
Thanks for helping! This doc covers setup, tests, and the standard flow for adding a tool.

## 开发环境 / Setup

- Windows 10/11 x64（桌面版 Tauri 2 目前只发布 Windows）
- Rust stable（≥1.91）：`cd rust && cargo test`
- Node 18+：`node --test tests/js/*.test.mjs`
- 前端**零构建**：不要引入 Vite/webpack/框架；`frontend/` 是 classic script 顺序加载的原生 HTML/CSS/JS，
  必须保持浏览器直开 `frontend/index.html` 与 GitHub Pages 演示可用。
- Python 3.10+ 仅 SDPC 解码组件需要（`pip install sdpc-for-python`，可选；legacy Python 版已于 v0.3.0 移除）。

## 硬性约定 / Ground rules

1. **不动 Rust 算法层与 IPC 契约**，除非同步更新 `rust/tests/ipc_args.rs` 并通过。
2. **不复制 GPLv3 代码**（IT-Tools / QuPath 等仅交互参考）。新增依赖必须许可兼容 MIT，
   并在 `NOTICE.md` + `frontend/vendor/LICENSES.md` 署名。
3. classic script 共享全局作用域：**新增全局函数/变量前先全仓 grep 重名**（历史教训：`applyView` 撞名）。
4. 统计类改动必须带**对数测试**（与 OpenEpi / scipy / tableone 口径对齐），放 `tests/js/`。
5. 界面文案默认中文；保持「仅供科研使用，不用于临床诊断」免责声明出现在新工具来源行。
6. 提交信息用中文或英文均可，但请说明「改了什么 + 为什么 + 如何验证」。

## 新增一个工具 / Adding a tool（三步）

参照 IT-Tools 的脚手架思路，但保持零构建：

1. **注册表条目** `frontend/tools/registry.js`：
   ```js
   { id: 'mytool', name: '我的工具', group: '统计与数据',   // 或 实验计算 / 写作与图
     desc: '一句话描述', py: 'wdgj wodegongju mytool',     // 全拼+首字母，供 Ctrl+K
     help: '公式 / 输入约定 / 参考文献', example: true,
     exports: [{ label: '复制结果', btn: 'mt-copy' }],    // 指向工具内既有按钮 id，零侵入
     source: '上游项目（许可）· 自研部分说明',
     scripts: ['tools/mytool.js'] },
   ```
2. **工具脚本** `frontend/tools/mytool.js`：注册 `window.LabKitTools.mytool = function(host){...}`；
   输入控件带 `id`（通用表单快照按 id/name 持久化）；示例挂 `host.__lkExample = ()=>{...}`；
   动态行/画布类工具设 `persist:false` 并自管模型持久化（`Store.set('tool:mytool', ...)`）。
3. **对数测试** `tests/js/mytool.test.mjs`：沿用 vm 加载模式，与权威口径（scipy/OpenEpi/教科书公式）对数。

完成后自检：`node --test tests/js/*.test.mjs`、`cd rust && cargo test --test ipc_args`、
浏览器打开工具页确认 壳层按钮 / 持久化 / 导出条 / 帮助抽屉 正常。
桌面改动另跑 exe 冒烟：`node tests/smoke_exe.mjs`（CDP 直连 WebView2，真实 CSP 环境断言 IPC / 绘图 / 切片打开）。

## 发布流程 / Releasing

1. 同步 bump `rust/Cargo.toml` 与 `rust/tauri.conf.json` 的 version（单一版本源）。
2. 更新 `CHANGELOG.md`。
3. 打 tag `vX.Y.Z` 推送 → `Release LabKit` 工作流出 NSIS 安装包 + portable zip。
4. 安装包**不含** SDPC 闭源 DLL（许可未覆盖再分发）；不要把它提交进仓库或塞进 bundle。

## 报告问题 / Issues

用 issue 模板（bug / feature）。安全漏洞请走 [SECURITY.md](SECURITY.md) 的私密渠道，不要开公开 issue。

## 行为准则 / Code of Conduct

参与本项目即同意遵守 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。
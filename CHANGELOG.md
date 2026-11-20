# 更新日志 · Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。
版本单一来源：`rust/Cargo.toml` 与 `rust/tauri.conf.json`。

## [Unreleased] — 多窗口 / 尺寸化 Dashboard / Zotero / 插件市场

### 交互
- **变更** 侧栏「工作台」七个子页按钮收敛到首页「工作台 ▾」单一入口；设计规范移出应用，成为 `docs/DESIGN_SYSTEM.md`
- **新增** 侧栏「固定」区：页头 ☆ / 工作台菜单 / 工具星标 / Ctrl+K / Alt+F 固定任意页面或工具，拖拽排序、右键重命名；老收藏保序迁移
- **变更** 桌面版**所有工具（含裁剪 / qPCR）默认在新窗口打开**；设置项反转为「默认在页内打开」（默认关），`toolNewWindow` 旧值自动迁移为 `toolOpenInPage`
- **修复** **打开多个窗口后无法退出**：关闭主窗口现在触发应用级退出——Rust `on_window_event` 独占编排（`prevent_close` → 广播 `flush-now` 收集各窗回执 → `app.exit(0)`）；工具窗口关闭仍只关自己；落盘失败/超时弹窗让用户选「强制退出 / 取消退出」
- **修复** 工具窗口 `show()` 失败时自动 `destroy()`，杜绝 `visible:false` 幽灵窗残留阻止退出
- **修复** 主窗口不再注册 JS `onCloseRequested`，避免其 "allow" 回执与 Rust `prevent_close` 竞争导致主窗提前关闭
- **新增** 工具独立窗口（官方 `WebviewWindow` + window-state），跨窗口台账合并写 + `db-changed` 事件广播
- **新增** Dashboard gridstack v14 真 2D 拖拽/缩放，卡片契约 v2 多尺寸形态，老布局自动迁移且保留顺序网格回退
- **新增** Zotero 本地 API 对接（只读同步 / 导入 / 10+ 授权后状态镜像）+ 文献页来源筛选 + 设置页连接测试
- **新增** GitHub 插件市场（Obsidian 式索引 + Release 分发）：显式安装确认、禁用/更新/回退/卸载、本地开发载入；默认关闭、不自动更新

### 工程
- **新增** `reqwest` / `tauri-plugin-window-state` 依赖与 `rust/src/zotero.rs` / `rust/src/plugins.rs`；插件资产走只读自定义协议 `labkit-plugin`
- **新增** 测试：`pins` / `db-merge` / `dash-layout` / `shell-nav` / `zotero-map` / `plugin-manifest` / `store_merge` / `zotero_state` / `plugins_install`
- **文档** `docs/DESIGN_SYSTEM.md`、`docs/PLUGIN_DEV.md`、`ecosystem/` 索引与模板仓库本地副本；NOTICE 补署名

## [0.3.0] - 2026-11-19

### 交互重构（参照 IT-Tools / DevToys / Rubick 范式，仅借鉴交互）
- **新增** hash 路由与深链（`#/view`、`#/tool/id`）：前进后退、刷新恢复、分享链接
- **新增** 持久侧栏：工作台 7 页 + 工具库分组 + 收藏 + 设置/设计规范，任何页面可达
- **新增** Ctrl+K 命令面板：工具/页面/动作索引，拼音首字母模糊匹配，最近使用与收藏
- **新增** 全局快捷键注册表与 `?` 帮助浮层（Ctrl+K / Ctrl+, / Alt+←→ / Esc）
- **新增** 工具统一壳：载入示例 / 重置 / 帮助与来源抽屉 / 导出条（19+ 工具全覆盖）
- **新增** 通用表单快照持久化（随台账磁盘落盘，切页/重启不丢）；旧 localStorage 键自动迁移
- **新增** 跨工具数据流：数据清洗 → 检验/绘图/Table 1；检验结果 → APA 报告串（跨重启）
- **新增** 首启欢迎（空白开始 / 载入示例二选一）；称呼可设置，去除硬编码用户名
- **新增** 通知中心：任务截止 / 试剂效期 / 仪器校准 / 提醒 / 系统事件，紧急红点与跳转
- **新增** 暗色模式（浅色 / 深色 / 跟随系统）；图表与画布保持纸面白
- **新增** 收藏与最近使用侧栏区；空态统一修饰

### 工程与上线
- **重构** 单文件 index.html（约 3580 行内联）机械拆分为 `css/app.css` + `js/` 14 个 classic script，保持零构建与 file:// 可演示
- **修复** release 流水线改打 LabKit（tauri-action：NSIS + portable zip）；旧 Python 打包拆为手动工作流
- **新增** GitHub Pages Web 演示工作流（frontend 静态部署）
- **加固** Tauri CSP（script-src 'self' + Plotly 必需的 'unsafe-eval'，其余白名单收紧）；补 favicon
- **合规** 免责声明「仅供科研使用，不用于临床诊断」进入 README / 设置 / 全部工具来源行；
  NOTICE 明确 OpenEpi 为 MIT；SDPC 闭源 DLL 不再分发，缺件时裁剪页显示 pip 获取指引
- **新增** README 重写（LabKit 为主角）+ README.en.md + CONTRIBUTING / SECURITY / CODE_OF_CONDUCT / issue 与 PR 模板
- **移除** legacy Python/PySide6 实现（liver_portal_crop/、main.py、build.spec、pyproject、requirements、旧 Python 测试与打包工作流）、
  旧版设计文档与过期截图、缓存/构建残留与遗留 worktree；仓库仅保留 LabKit 本体
- **测试** 新增外壳单测 9 用例；JS 93/93、Rust 96/96、IPC 契约 3/3、浏览器断言全过

### 修复
- tests 工具 select 空值崩溃（syncKind 回落首项）
- 动态输入区重建导致的表单恢复丢值（按快照键实时重取存活节点）
- 视图切换在低帧率环境卡死（移除 View Transitions，改同步切换 + CSS 淡入）

## [0.2.0] - 2026-10

- Tauri 2 + Rust 桌面版取代 PySide6 UI：SDPC FFI 解码、TIFF 导出、qPCR 解析复用
- 台账磁盘化（原子写 + 滚动备份 + 损坏自愈）、Dashboard 布局编辑器
- 19 工具注册表按需注入；vendor 开源库集成与署名

## [0.8.1] - legacy Python 版（已于 v0.3.0 从仓库移除，仅存历史）

- PySide6 病理裁剪工具最后版本；代码与打包配置已删除，历史提交中仍可追溯
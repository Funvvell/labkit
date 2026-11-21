<div align="center">

<img src="icon.svg" width="96" height="96" alt="LabKit Logo" />

# 科研工具箱 LabKit

**本地优先的科研工作台 · Local-first research toolbox**

台账工作台 · 20 个科研工具 · SDPC 全切片浏览与 ROI 裁剪 · qPCR ΔΔCt 分析

[![Release](https://img.shields.io/github/v/release/Funvvell/labkit?style=flat-square&label=Latest)](https://github.com/Funvvell/labkit/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows)](#-快速开始)
[![Web Demo](https://img.shields.io/badge/Web%20Demo-GitHub%20Pages-2ea44f?style=flat-square)](https://funvvell.github.io/labkit/)

[快速开始](#-快速开始) · [功能特性](#-功能特性) · [快捷键](#-快捷键) · [开发指南](#-开发指南) · [English](README.en.md)

</div>

> **免责声明**：本软件全部计算与图像结果**仅供科研使用，不用于临床诊断**。
> **隐私**：全部本地计算，无遥测、无账号、无上传；台账只存在你自己的电脑上。
> 仓库内不含任何真实课题、样本或切片数据；首次启动的示例数据均为虚构。

---

## ✨ 功能特性

### 工作台（科研台账）

- **任务 / 项目 / 实验 / 文献 / 仪器 / 试剂 / 预约 / 经费 / 速记 / 提醒** 十一类记录，看板 + 表格双视图
- **今日科研指挥台 + 可编辑 Dashboard**：首页先汇总今日重点、临近节点、最近工具与快速动作；16 张卡片各声明多档尺寸（mini 摘要 / small 精简 / medium 标准 / large 全量），gridstack 自由网格拖拽摆放、右下角拖拽改尺寸（自动吸附到卡片支持的档位）；⇔⇕ 快速切档、⚙ 精确坐标、键盘方向键移动 / Shift+方向键改尺寸；布局 v2 随台账保存，老布局自动迁移保序保尺寸
- **专注计时**与近 7 天趋势、任务完成率报表
- **通知中心**：任务截止、试剂效期、仪器校准到期、导出完成等汇总提醒（标题栏铃铛）
- 数据磁盘化：`~/.liver_portal_crop/labkit_db.json`，原子写 + 滚动备份 + 损坏自愈；浏览器模式降级 localStorage
- **通用格式导出**：可选 Markdown Vault，一条台账记录一个 `.md`（YAML frontmatter），Obsidian 等软件可直接打开编辑并回读，换软件不丢数据

### 工具库（20 个工具 / 工作区）

| 分组 | 工具 |
| --- | --- |
| 统计与数据 | 2×2 表分析（OpenEpi）· 样本量与功效（OpenEpi）· 快速假设检验（t/χ²/Fisher/MWU/Wilcoxon/方差齐性/相关）· Table 1 基线表 · 随机化与盲法 · 数据清洗与交叉表 · APA7 统计报告串 |
| 实验计算 | 实验计算器（配液/离心/铺板/MOI）· 引物工作台（NN 热力学 Tm）· **qPCR 分析工作区**（ΔΔCt/Pfaffl/geNorm）· 孔板布局编辑器 · Protocol 计时器 · 实验记录→Markdown · 试剂/仪器台账 |
| 写作与图 | 数据绘图器（期刊预设 300/600dpi）· Figure 拼图器 · 图片批处理（Rust 并行）· **图像裁剪工作区**（SDPC WSI + ROI + TIFF）· 报告规范清单（PRISMA/STROBE/CONSORT/MIQE）· 表格格式互转 |

每个工具统一壳层：**载入示例 / 重置 / 帮助与来源抽屉 / 导出条**；输入与配置**自动持久化**（切页、重启不丢）；
**跨工具数据流**：数据清洗 → 检验 / 绘图 / Table 1，检验结果 → APA 报告串（跨重启可载入）。

**工具箱个性化**（参照 VS Code 的 Activity Bar 与 Dashy 的 section 配置）：

- 工具库页「整理分组」进入草稿模式（Ctrl+K 搜「分组 / 分类 / 自定义」同样可直达）——分组可新建 / 重命名 / 改色改图标 / 删除 / 拖拽排序，
  工具可跨组拖动、组内排序、隐藏；改动点「保存」才落盘，`Esc` 原样还原
- 隐藏的工具在侧栏与工具库消失，但 **Ctrl+K 仍可搜到并标注「已隐藏」**（VS Code 的
  `View: Open View` 同款，藏起来不等于失联）
- 分组与顺序**同源生效**于工具库页、侧栏工具分类、Ctrl+K 三处；只存用户改动（覆盖层），
  插件装卸与内置新增工具都不会打乱你的布局
- 键盘等价：`Alt+←/→` 换组，`Alt+↑/↓` 组内移动

### 交互（参照 IT-Tools / DevToys / Rubick / Obsidian Bookmarks 的成熟范式）

- **Ctrl+K 命令面板**：20 工具 + 全部页面 + 全局动作，支持**拼音首字母**模糊匹配（如 `yw`→引物、`sjqx`→数据清洗）
- **工具库发现层**：搜索、最近使用、分组筛选、固定工具置顶；工具页提供面包屑与统一壳（示例 / 重置 / 导出 / 帮助）
- **三线侧栏 + 工作台二级导航**：侧栏收敛为「工作台 / 工具库 / 资料与设置」；进入工作台后用「今日 · 任务 · 项目 · 实验 · 文献 · 试剂 · 报表 · 专注」tabs 切换。常用页面或工具可**固定到侧栏**（页头 ☆ / 工作台菜单 / 工具星标 / Alt+F），支持拖拽排序、右键重命名（范式同 Obsidian Bookmarks / Trigger.dev Favorites）
- **不失联保障**：首页卡片删光后，「工作台 ▾」菜单 + Ctrl+K + hash 深链仍可到达每个页面
- **工具独立多窗口**：桌面版所有工具（含裁剪 / qPCR）**默认在独立窗口打开**，同工具再开即聚焦，窗口尺寸位置自动记忆（官方 window-state 插件）；设置里可勾选「默认在页内打开」切回页内，工具卡「↗」/ Ctrl/⌘+点击 / 中键随时可临时开新窗口。关闭主窗口即退出整个应用：退出前广播 `flush-now` 收集各窗口落盘回执，失败/超时弹窗让用户选「强制退出」或「取消退出」。多窗口台账**合并写 + 事件广播**同步：各窗口写各自的键互不覆盖，改动实时互见（同键并发编辑为后写覆盖）
- **hash 路由深链**：`#/tool/tests` 可分享、刷新恢复、前进后退可用
- **固定与最近使用**、全局快捷键注册表 + `?` 帮助浮层
- **暗色模式**（浅色 / 深色 / 跟随系统）；图表与裁图画布保持纸面白色，符合期刊投稿要求
- 首启欢迎：空白开始 / 载入示例二选一；称呼可自定义
- **Zotero 对接**：本机 Zotero 7+ 只读同步（条目 / 分类 / 保存搜索）、文献页来源筛选与一键导入；Zotero 10+ 授权后可把阅读状态镜像为 tag（本地台账始终为准）；Better BibTeX 可选探测
- **扩展：工具扩展 / 卡片扩展分开安装**：仿 HACS 的 `category` 与 Directus 的 extension `type`——一个包只能是一类，`kind` 不符在安装前就拒绝。工具扩展入口在**工具库 →「获取更多工具」**，卡片扩展入口在**首页 →「＋ 卡片」→「获取卡片」**；安装/更新/回退/卸载集中在侧栏「扩展管理」。索引按类型拆成 `tools.json` / `widgets.json`，默认关闭、不自动更新，工具与卡片统一注册表开放给社区（`x-<扩展id>-` 前缀隔离），开发见 [`docs/PLUGIN_DEV.md`](docs/PLUGIN_DEV.md)
- 设计规范不再内置于软件，见 [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)（新增工具 / 插件的视觉契约）

### 病理图像工作区

- SDPC 全切片金字塔浏览（LRU tile 缓存、导航缩略图、滚轮切层），支持 120,000×80,000+ px 切片
- ROI 框选 / 组织检测辅助 / 全分辨率 TIFF 批量导出（DPI 标签保留）
- 普通图片（png/jpg/tif）裁剪**无需**任何额外组件

## 🚀 快速开始

### 方式一：下载安装包（推荐）

[Releases](https://github.com/Funvvell/labkit/releases) 下载 `LabKit_*.exe`（NSIS 安装包）或 `LabKit-portable-win-x64.zip`（免安装）。

**SDPC 解码组件（可选）**：出于许可考虑，安装包**不含**厂商闭源 `DecodeSdpcDll.dll`。
需要浏览 `.sdpc` 切片时执行：

```bash
pip install sdpc-for-python
```

应用会自动探测解码目录（随包目录 → `SDPC_DLL_DIR` 环境变量 → Python site-packages）。
缺失时裁剪页会显示获取指引；其余 19 个工具与台账功能不受影响。

### 方式二：Web 演示（零安装）

<https://funvvell.github.io/labkit/> —— 浏览器降级模式：台账存 localStorage，
统计/绘图/写作类工具完整可用；SDPC 解码与磁盘备份需桌面版。

### 方式三：源码运行

```bash
git clone https://github.com/Funvvell/labkit.git
cd labkit/rust
cargo install tauri-cli --locked   # 首次
cargo tauri dev                    # 开发运行
cargo tauri build                  # 出安装包
```

前端**零构建**：`frontend/` 为原生 HTML/CSS/JS（classic script 顺序加载），
直接用浏览器打开 `frontend/index.html` 即可演示，无需 Node/Vite。

## ⌨️ 快捷键

| 按键 | 作用 |
| --- | --- |
| `Ctrl+K` | 命令面板（工具 / 页面 / 动作，拼音首字母可搜） |
| `Ctrl+,` | 设置 |
| `Alt+F` | 固定 / 取消固定当前页面或工具到侧栏 |
| `Alt+←` / `Alt+→` | 后退 / 前进 |
| `?` | 快捷键帮助浮层 |
| `Esc` | 关闭面板 / 菜单 / 抽屉 |
| 裁剪工作区 | 滚轮缩放、拖拽平移、ROI 手柄调整（见 `?` 浮层视图段） |

## 🔒 数据与隐私

- 台账：`~/.liver_portal_crop/labkit_db.json`（设置页可查看路径 / 备份 / 导入导出 / 重置）
- **Markdown 台账（Vault）**：设置页可把 11 类台账记录各落成一个 `.md`（YAML frontmatter + 正文），
  目录可直接指向已有的 Obsidian 库。在 Obsidian 里改动会在 LabKit 聚焦时读回，**外部编辑优先**；
  两边同时改同一条会留冲突副本，可在设置页一键「保留本地」。记录靠 frontmatter 里的稳定 `id` 匹配，
  重命名文件不会产生孤儿；删除走 `.labkit/trash/` 软删除。JSON 仍保留为内部索引与崩溃快照，
  Vault 写失败只提示、绝不影响已落盘的台账。默认关闭。
- 工具输入快照、固定入口、最近使用、主题与称呼同随台账落盘
- **无遥测**；默认不联网。仅在你主动操作时产生网络请求：打开扩展市场拉取 GitHub 索引、
  Zotero 同步访问本机 `127.0.0.1`、可选 InvenTree API、以及你点击的文献 DOI 链接
- **扩展与内置同权限、无硬沙箱**：只安装信任的来源；默认关闭、显式同意安装、不自动更新；
  远程安装强制校验 sha256（详见 [SECURITY.md](SECURITY.md)）
- 浏览器演示模式数据仅存本机 localStorage

## 🧱 架构

```
frontend/            零构建前端（index.html 壳 + css/ + js/ 模块 + tools/ 20 工具 + vendor/ 开源库）
  js/toolbox.js      工具箱个性化数据层（分组/排序/隐藏/图标配色的覆盖层，纯函数可测）
  js/plugins.js      双市场扩展（工具扩展 / 卡片扩展）+ 类型门禁 + 扩展管理页
rust/                Tauri 2 + Rust：SDPC FFI 解码、TIFF 导出、qPCR 解析、台账磁盘化、77+ 单测
tests/js/            node:test 对数测试（统计口径与 OpenEpi/scipy/tableone 对齐）+ 外壳单测
rust/tests/          IPC 命名契约测试（保护前后端接口）
```

- Rust 算法层与 IPC 契约稳定，前端交互迭代不触碰（契约测试保护）
- 统计实现均与上游对数：`tests/js/stats.test.mjs` 等 153 个 node 用例 + 108 个 cargo 用例

## 🛠️ 开发指南

```bash
# Rust 全量测试
cd rust && cargo test
# 前端对数 / 外壳测试（Node 18+）
node --test tests/js/*.test.mjs
# 桌面 exe 冒烟（Node 21+；先带 --remote-debugging-port=9222 启动 exe，见脚本头注释）
node tests/smoke_exe.mjs
```

新增一个工具只需三步（注册表条目 + 脚本 + 对数测试），详见 [CONTRIBUTING.md](CONTRIBUTING.md)；视觉契约见 [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)。
交互范式参考 [Raycast](https://www.raycast.com/)、[Linear](https://linear.app/)、[IT-Tools](https://github.com/CorentinTh/it-tools)、[DevToys](https://github.com/DevToys-app/DevToys)、[Obsidian Bookmarks](https://obsidian.md/help/plugins/bookmarks)（仅借鉴交互，未复制其代码）；病理工作区以 [QuPath](https://github.com/qupath/qupath) 为领域基准；现代 Web 交互与可访问性参考 [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)。

## 📄 许可与署名

- 本项目 [MIT](LICENSE)
- 第三方组件署名见 [NOTICE.md](NOTICE.md) 与 [frontend/vendor/LICENSES.md](frontend/vendor/LICENSES.md)
  （OpenEpi MIT、stdlib-js Apache-2.0、SciPy/Biopython BSD-3、Plotly/fabric MIT 等）
- PRISMA 2020 清单 CC-BY 4.0；SDPC 解码 DLL 为厂商专有二进制，**不在本仓库与安装包中再分发**
- 社区：[贡献指引](CONTRIBUTING.md) · [安全策略](SECURITY.md) · [行为准则](CODE_OF_CONDUCT.md) · [更新日志](CHANGELOG.md)

> **仅供科研使用，不用于临床诊断。** Research use only; not for clinical diagnostic use.
# LabKit 设计规范（Design System）

> 本文档由应用内「设计规范」页面迁出（v0.3 起不再内置于软件）。
> 所有内置工具与社区插件共享这套 token —— 新增功能时直接复用，保证全局一致。
> token 的运行时定义在 `frontend/css/app.css` 的 `:root` 与 `:root[data-theme="dark"]`，本文与其保持同步。

## 1. 色彩

### 品牌主色（仅用于激活态、主按钮与关键强调）

| 用途 | 色值（浅色） | 色值（深色） | CSS 变量 |
| --- | --- | --- | --- |
| 主色 | `#007AFF` | `#0A84FF` | `--accent` |
| 主色 hover | `#0062CC` | `#3D9BFF` | `--accent-hover` |
| 主色浅底 | `#E8F1FF` | `#0E2C4F` | `--accent-soft` |

### 中性色阶

| 用途 | 浅色 | 深色 | CSS 变量 |
| --- | --- | --- | --- |
| 主文字 | `#1D1D1F` | `#F5F5F7` | `--ink` |
| 次文字 | `#3A3A3C` | `#D1D1D6` | `--ink-2` |
| 弱化文字 | `#8E8E93` | `#98989D` | `--muted` |
| 禁用 | `#AEAEB2` | `#636366` | `--disabled` |
| 分隔线 | `#E5E5EA` | `#3A3A3C` | `--line` |
| 页面底 | `#F5F5F7` | `#1C1C1E` | `--bg` |
| 卡片底 | `#FFFFFF` | `#2C2C2E` | `--card` / `--surface` |
| 毛玻璃 | `rgba(255,255,255,.56)` | `rgba(30,30,32,.62)` | `--glass` |
| 悬停底 | `rgba(0,0,0,.05)` | `rgba(255,255,255,.08)` | `--hover` |
| 细线 | `rgba(0,0,0,.07)` | `rgba(255,255,255,.1)` | `--hairline` |

### 语义色

| 语义 | 色值 | CSS 变量 |
| --- | --- | --- |
| 成功 | `#30D158` | `--green` |
| 警告 | `#FF9F0A` | `--orange` |
| 危险 | `#FF453A` | `--red` |

深色模式下徽章/状态文字另有提亮变体（见 `app.css` `:root[data-theme="dark"]` 段）。

## 2. 字体

字体栈：`-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif`（`--sans`）；
数字与代码：`ui-monospace, "SF Mono", "JetBrains Mono", Consolas, monospace`（`--mono`）。

| 层级 | 字号 / 字重 | 典型用途 |
| --- | --- | --- |
| 页面标题 | 22–26px / Bold | `content-head h1` |
| 分区标题 | 15px / Bold | `section-head h2`、卡片标题 |
| 正文 | 13px / Regular | 表格、列表、表单 |
| 辅助信息 | 11px / Regular | 描述、时间戳、spec 标注 |
| 数字 | 13px / `--mono` | 统计值、计数、金额（等宽对齐） |

## 3. 按钮与状态

- 按钮基类 `.btn`：高 38px、圆角 8px、12px/600。
  - `.btn.pri` 主按钮：`--accent` 底 + 白字
  - `.btn.sec` 次按钮：`--bg` 底 + `--ink-2` 字
  - `.btn.dan` 删除：`rgba(255,69,58,.1)` 底 + `--red` 字
  - `.btn.dis` 禁用：`--line` 底 + `--disabled` 字
- 输入框：`.input` / `.tfield`，占位文字用 `--disabled`。
- 状态标签 `.tag`：进行中 `rgba(0,122,255,.12)` + `--accent`；已完成 `rgba(48,209,88,.13)` + `#248A3D`。

## 4. 间距 · 圆角 · 阴影

- 间距基数：**4 / 8 / 12 / 16 / 24**（卡片内边距 14–18，分区间距 26）。
- 圆角：按钮 **8px**（`--r-btn`）· 控件 **12px**（`--r-ctl`）· 卡片 **16px**（`--r-card`）。
- 卡片阴影：`0 4px 12px rgba(0,0,0,.10)`（运行时 `--shadow-card: 0 3px 10px rgba(0,0,0,.06)`，深色 `.45`）。
- 窗口浮层阴影：`--shadow-win`。
- 首页网格：行高 `--row: 152px`、间距 `--gap: 13px`（设置页密度切换只改这两个变量）。

## 5. 图标

- 线性风格，描边 **1.7–2px**，`viewBox="0 0 24 24"`，`stroke="currentColor"`。
- 工具图标底色用低饱和色（`TOOL_GROUP_COLOR` / `--tc`），避免与主色冲突。
- 侧栏/菜单图标 18px，工具卡图标 20–24px。

## 6. 布局范式

- 工作台子页：`content-head`（返回键 + 标题 + 主操作）+ `scroll` 内容区。
- 工具工作区：「左参数 / 中画布 / 右列表」三栏（crop / qpcr 范式）。
- 普通工具：统一壳层 `toolChrome`（返回 + 图标 + 标题 + 收藏/帮助）+ 输入区 + 结果区。
- 工具卡：16px 圆角 + 柔和阴影 + 悬停上浮 2px。

## 7. 新增工具 / 插件检查清单

- [ ] 分类图标沿用侧栏线性风格（1.7–2px 描边）
- [ ] 工具卡统一 16px 圆角 + 柔和阴影
- [ ] 图标底色用低饱和色，避免与主色冲突
- [ ] 工作区沿用「左参数 / 中画布 / 右列表」三栏
- [ ] 颜色/圆角/阴影一律取 CSS 变量，不写死色值（深色模式自动适配）
- [ ] 数字用 `--mono` 等宽；状态用 `.tag` / `.twarn` / `.terr`
- [ ] 空态用 `.empty-state`；表格用 `.tbl`
- [ ] 插件视觉契约同上（见 `docs/PLUGIN_DEV.md`）

## 8. 交互惯例

- 命令面板 Ctrl/⌘+K（拼音首字母可搜）；`?` 快捷键帮助；Esc 逐层关闭浮层。
- 破坏性操作先 `confirmModal`，并提示自动备份位置。
- 侧栏「固定」区：页头 ☆ / 工作台菜单 / 工具星标固定入口，拖拽排序、右键重命名。
- 布局编辑：Homarr 式草稿 → 保存 / Esc 取消；卡片尺寸 1/2/4 列 × 1–4 行整数格。
# LabKit 设计规范（Design System）

> 本文档由应用内「设计规范」页面迁出（v0.3 起不再内置于软件）。
> 所有内置工具与社区插件共享这套 token —— 新增功能时直接复用，保证全局一致。
> token 的运行时定义在 `frontend/css/app.css` 的 `:root` 与 `:root[data-theme="dark"]`，本文与其保持同步。

## 1. 色彩

### 品牌主色（仅用于激活态、主按钮与关键强调）

| 用途 | 色值（浅色） | 色值（深色） | CSS 变量 |
| --- | --- | --- | --- |
| 主色（填充） | `#0066CC` | `#0A6FE0` | `--accent` |
| 主色 hover | `#0062CC` | `#3D9BFF` | `--accent-hover` |
| 主色浅底 | `#E8F1FF` | `#0E2C4F` | `--accent-soft` |
| 主色文字（链接/强调字） | `#0062CC` | `#5FB0FF` | `--accent-text` |

### 中性色阶

| 用途 | 浅色 | 深色 | CSS 变量 |
| --- | --- | --- | --- |
| 主文字 | `#1D1D1F` | `#F5F5F7` | `--ink` |
| 次文字 | `#3A3A3C` | `#D1D1D6` | `--ink-2` |
| 弱化文字 | `#6E6E73` | `#98989D` | `--muted` |
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

**本地打包 + 系统中文**：拉丁/数字/希腊/数学符号用本地 woff2（`frontend/fonts/`，OFL 1.1，
由 `tools/font-build/build_fonts.py` 子集化，来源与 sha256 见 `fonts/manifest.json`）；
中文不打包，走系统字体。CSP `font-src 'self' data:` 下完全离线，无在线字体 CDN。

字体栈（`app.css` `:root`）：
`--sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif`；
`--mono: "JetBrains Mono", ui-monospace, "SF Mono", Consolas, monospace`。
Inter 为变量字体（`font-weight: 100 900` 单文件覆盖全字重）。

字号阶梯与行三档在 `css/type.css`（最后加载）：`--text-3xs:9 / 2xs:10 / xs:11 / sm:12 / md:13 /
lg:15 / xl:18 / 2xl:22 / 3xl:26`（px），`--leading-tight:1.25 / normal:1.5 / relaxed:1.7`。
**禁止半像素字号**（不同 DPI 渲染不一致），组件引用 token，不写新字面量。

| 层级 | token / 字重 | 典型用途 |
| --- | --- | --- |
| 页面标题 | `--text-2xl`–`--text-3xl` / Bold | `content-head h1` |
| 分区标题 | `--text-lg` / Bold | `section-head h2`、卡片标题 |
| 正文 | `--text-md` / Regular | 表格、列表、表单 |
| 辅助信息 | `--text-xs` / Regular | 描述、时间戳、spec 标注 |
| 数字 | `--text-md` / `--mono` | 统计值、计数、金额 |

数字排版：`body` 开 `tabular-nums lining-nums`（列对齐不跳动）；等宽上下文
（`.tmono` / `.tbl td` / `.ttable td` / `.result-table td` / `kbd` 等）再加 `"zero" 1`
斜杠零，批号里的 0 与 O 可区分。全局 `-webkit-font-smoothing: antialiased`。

**期刊图例外**：出版图（plotter / qpcr-plots / figure）默认 Arial/Helvetica，
单一来源 `QpcrPlots.JOURNAL_FONT`；figure 提供字体下拉。界面 UI 字体不用于出版图。
孔板画布是 UI 编辑器，文字读 `--sans`，并在 `document.fonts.ready` 后重绘。

## 3. 按钮与状态

- 按钮基类 `.btn`：高 32px、圆角 8px、12px/600；紧凑操作 28px，主要操作 36–40px。
  - `.btn.pri` 主按钮：`--accent` 底 + 白字
  - `.btn.sec` 次按钮：`--bg` 底 + `--ink-2` 字
  - `.btn.dan` 删除：`rgba(255,69,58,.1)` 底 + `--red` 字
  - `.btn.dis` 禁用：`--line` 底 + `--disabled` 字
- 输入框：`.input` / `.tfield`，占位文字用 `--disabled`；必填错误使用 `aria-invalid` + 行内错误文本。
- 状态标签 `.tag`：进行中 `rgba(0,122,255,.12)` + `--accent`；已完成 `rgba(48,209,88,.13)` + `#248A3D`。

## 4. 间距 · 圆角 · 阴影

- 间距基数：**4 / 8 / 12 / 16 / 24**（卡片内边距 14–18，分区间距 22）。
- 页头 `--head-h: 64px`；侧栏 `--sidebar-w: 220px`；内容左右留白 `--pad-x: clamp(20px, 2.4vw, 32px)`。
- 圆角：按钮 **8px**（`--r-btn`）· 控件 **12px**（`--r-ctl`）· 卡片 **16px**（`--r-card`）。
- 卡片阴影：`0 4px 12px rgba(0,0,0,.10)`（运行时 `--shadow-card: 0 3px 10px rgba(0,0,0,.06)`，深色 `.45`）。
- 窗口浮层阴影：`--shadow-win`。
- 首页网格：行高 `--row: 152px`、间距 `--gap: 13px`（设置页密度切换只改这两个变量）。

## 5. 图标

- 线性风格，描边 **1.7–2px**，`viewBox="0 0 24 24"`，`stroke="currentColor"`。
- 工具图标底色用低饱和色（`TOOL_GROUP_COLOR` / `--tc`），避免与主色冲突。
- 侧栏图标 16px，菜单/页头图标 18px，工具卡图标 18–20px。

## 6. 布局范式

- 侧栏三组：`工作台 / 工具库 / 资料与设置`；固定区在搜索框下方，空时不占位。
- 工作台页：不再使用顶部二级 tabs；直接 `64px content-head` + `scroll`，子页入口走侧栏 /「工作台 ▾」/ 固定区 / Ctrl+K。
- 首页：`home-deck` 今日科研指挥台（摘要 + 今日重点 + 临近节点 + 最近工具），下方保留可编辑 Dashboard。
- 工具库：`toolhub-bar` 搜索/筛选/最近 + 3 列工具卡（窄窗 2 列）；工具页 = 标签栏（工具窗口）+ 共享来源条 + 面包屑 + 紧凑标题 + sticky 工具壳。
- 工具工作区：「左参数 / 中画布 / 右列表」三栏（crop / qpcr 范式）。三栏宽度按容器
  `clamp()` 收拢（`.ws-body` 是查询宿主），极窄容器（<680px）纵向堆叠、画布在上。
- 自适应收口层 `css/adaptive.css` 最后加载：组件断点一律容器查询
  （`.tool-wrap` / `.ws-body` / `#view-home` 为查询宿主），不绑窗口宽度；
  固定列数网格改 `auto-fit`；台账表格外层横向滚动。
- Dashboard 布局以 **4 列规范坐标**存储；渲染列数随容器宽度降为 4 / 2 / 1（阈值 900 / 560px）。
  降列时禁止拖拽与改尺寸、编辑入口给出提示——1 列下宽度会归一，回写会毁掉用户布局。
- 设置页：≥1080px 两栏，窄窗单栏；危险操作与普通数据操作分区。
- 普通工具：统一壳层 `toolChrome`（返回 + 图标 + 标题 + 收藏/帮助）+ 输入区 + 结果区。
- 工具卡：12px 圆角 + 轻边框；悬停只改边框/背景，不做大幅位移。

## 7. 新增工具 / 扩展检查清单

- [ ] 分类图标沿用侧栏线性风格（1.7–2px 描边）
- [ ] 工具卡统一 12px 圆角 + 轻边框
- [ ] 图标底色用低饱和色，避免与主色冲突
- [ ] 工作区沿用「左参数 / 中画布 / 右列表」三栏
- [ ] 颜色/圆角/阴影一律取 CSS 变量，不写死色值（深色模式自动适配）
- [ ] 数字用 `--mono` 等宽；状态用 `.tag` / `.twarn` / `.terr`
- [ ] 空态用 `.empty-state`；表格用 `.tbl`
- [ ] 扩展声明 `manifest.kind`（`tool` / `widget`），只调用对应的注册 API（见 `docs/PLUGIN_DEV.md`）
- [ ] 扩展视觉契约同上

## 8. 工具箱个性化层（toolbox）

新组件全部在 `frontend/css/toolbox.css`（`app.css` / `lab.css` 有字节预算，见 `tests/js/ui-contract.test.mjs`）。

- **分组色**：`--tg` 自定义属性，只用于 `color-mix()` 着色与圆点，绝不写死背景色；
  8 色板 `TOOLBOX_COLORS` 与语义色对齐（`#007aff / #7b5cff / #2fa96b / #f0832a / #ff3b30 / #1fa5b8 / #8e8e93 / #c86dd7`）。
- **分组图标**：`TOOLBOX_ICONS` 14 个线性图标（24×24，1.8px 描边），与工具卡图标同风格；
  工具卡自定义图标复用同一套 key，未命中时回退工具自身图标。
- **整理态**：`.tb-editbar` 顶部提示条（`--accent` 浅底 + 22% 边框），未保存时 `.tb-state.dirty` 用 `--orange`。
- **拖拽指示**：卡片左右插入线用 `::before/::after` 3px `--accent` 竖线；分组上下插入线用 2px 边框；
  拖拽中 `.tb-dragging` 降到 45% 不透明度。空组用 `.tb-tail` 虚线投放区（88px 高，与卡片同高）。
- **扩展市场面板**：`.pm-*` 单列自适应网格（`minmax(300px,1fr)`），索引来源用小字灰色，错误用 `--red`，
  存量合并索引提示用 `--orange`。
- **扩展管理页**：`.ext-grid` 两栏自适应；健康提示 `.pc-h.warn/.bad` 用 12% 淡底 + 语义色文字，不加大图标。

## 9. 工具窗口标签页（tabs）

新组件全部在 `frontend/css/tabs.css`（独立预算，≤12000 bytes，见 `tests/js/ui-contract.test.mjs`）。
范式参考 VS Code 编辑器标签 / JupyterLab Lumino：**首个工具建窗、一工具一标签、单例、切走不销毁**；
工具库是工具箱的基底页，不是标签；只有打开工具/工作区后才出现标签栏。

- **标签栏**：`.tool-tabs` 固定 40px 高、`--bg` 底 + 1px `--hairline` 下边线；标签不换行，
  `overflow-x:auto` 横向滚动（隐藏滚动条），溢出时右侧 `⋯` 菜单兜底。滚轮在标签栏上横滚。
  工具库视图与无工具状态不显示标签栏。
- **标签卡**：`.tt-tab` 高 32px、`min-width:88px` / `max-width:190px`、8px 上圆角；
  激活态 `.on` 用 `--card` 同底 + 2px `--accent` 顶线（`::before`），非激活用 `--muted` 文字，
  悬停只换 `--hover` 底，不位移。
- **图标与关闭**：`.tt-ico` 15px（激活转 `--accent`），`.tt-x` 18px 独立按钮，悬停 16% `--red` 淡底；
  **每个工具标签都可关闭**。
- **拖拽指示**：`.drop-before` / `.drop-after` 用 `inset 2px 0` 的 `--accent` 竖线，拖拽中 `.dragging` 降到 55%；
  工具标签之间同等可拖拽。
- **键盘**：`role="tab"` + `aria-selected` + roving `tabindex`（仅激活标签为 0）；`←/→` 移动焦点，
  `Enter/Space` 激活，`Delete` / `Backspace` 关闭；`Ctrl+Tab` / `Ctrl+1…9` / `Ctrl+W` / `Ctrl+Shift+T` 全局等价。
- **pane 栈**：`#toolHost.tab-panes` > `.tool-pane[role="tabpanel"]`（一工具一个，含独立滚动），
  首激活才渲染、切走保留 DOM / 输入 / 滚动位置、关闭即销毁；`#toolSource` 由所有标签共享。
- **空态收口**：关闭最后一个工具时回到工具库基底页，工具窗口不关；浏览器演示同样回工具库。
  右键「关闭全部」清空全部工具标签后也回到工具库，窗口继续存在。
- **窗口**：工具窗口 `body.tab-mode` 下页头收紧（`min-height:56px`，标题 19px，副标题隐藏）；
  `body.toolbox-mode` 横向内边距 24px。900px 最小宽下标签栏保持单行滚动。

## 10. 交互惯例

- 命令面板 Ctrl/⌘+K（拼音首字母可搜）；`?` 快捷键帮助；Esc 逐层关闭浮层。
- 阻塞式浮层使用原生 `<dialog>` + `showModal()`：焦点限制、Esc、焦点返回和 top layer 交给浏览器；不要手写 `role="dialog"`、`aria-modal` 或焦点陷阱。
- 任务勾选、工具收藏/新窗口使用真实 `checkbox` / `button`；键盘 Enter/Space 必须可达。
- 组件重排优先容器查询（Deck/工具网格），不把组件断点绑死在窗口宽度。
- 破坏性操作先 `confirmModal`，并提示自动备份位置。
- 侧栏「固定」区：页头 ☆ / 工作台菜单 / 工具星标固定入口，拖拽排序、右键重命名。
- **两种编辑模式共用「草稿 → 保存 / 取消」**：Dashboard 布局（`Ctrl+E`）与工具箱整理（`Esc` 取消）。
  改动只在点「保存」时落盘；保存前若盘上已被其他窗口改过，弹 `confirmModal` 让用户决定。
- **隐藏 ≠ 失联**：隐藏的工具仍可被 Ctrl+K 搜到并打开，并标注「已隐藏」（对齐 VS Code `View: Open View`）。
- **拖拽必须可键盘替代**：工具箱 `Alt+方向键`，Dashboard 卡片方向键 / `Shift+方向键`，标签栏 `←/→` 移动焦点 + `Ctrl+Tab` 循环。
- **标签单例**：同一工具只允许一个标签，重复打开只聚焦、不重建 DOM；关闭后重新打开按需重新挂载（输入由 `toolform:<id>` 恢复）。
- 布局编辑：Homarr 式草稿 → 保存 / Esc 取消；卡片尺寸 1/2/4 列 × 1–4 行整数格。
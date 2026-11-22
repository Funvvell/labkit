# Phase 7 · 工具 UI 真机闭环（工程师版）

> 面向读者：工程师。只保留设计（design）与测试（testing）两节，风险一节按约定省略。
> 每一条都是可执行、可验收的条款；口径与 `docs/UI_VERIFY.md` 一致。

## 背景与目标

上一轮已完成 20 个工具单元的代码修复（`node --test "tests/js/*.test.mjs"` 275 项全绿），
但没有真实渲染证据：暗色与窄窗结论来自静态推导。

本轮目标：把「UI 是否真的适配」变成**可复跑的数值证据**，并收掉三项遗留
（调色板三份副本、高分屏画布、`index.html` 内联样式）。

## Design（设计条款）

1. **观测优先**：先交付观测器，不先改业务代码。任何 UI 改动都必须有对应的数值断言。
2. **零新增依赖**：不引入 npm / Playwright / stylelint。测试继续用 `node:test` +
   Node 原生 `WebSocket` 驱动 WebView2 的 CDP 端口（Node ≥ 21）。
3. **隔离数据**：真机走查固定使用 `LABKIT_DB_DIR=%TEMP%\labkit-ui-audit`，
   不读写用户真实台账。
4. **门禁看数值，截图只作证据**：像素基线不做门禁（WebView2 小版本升级即整屏变红），
   截图只保留失败格。
5. **调色板单源**：`frontend/tools/lib/colors.js` 是唯一来源，导出
   `JOURNAL`（Okabe-Ito 8 色）、`GRAY`、`SERIES_UI`、`PLATE`；
   `qpcr-plots.js` / `plotter.js` / `plate.js` / `js/qpcr.js` 只读不抄，且不保留回退数组。
6. **文字用主色要过 AA**：新增 `--accent-text`（浅 `#0062CC` / 深 `#5FB0FF`），
   所有 `color:var(--accent)` 改为 `--accent-text`；`--muted` 浅色由 `#8E8E93` 调至 `#6E6E73`
   （原值对页面底只有 2.98:1）。
7. **高分屏**：画布后备尺寸必须等于 CSS 尺寸 × `devicePixelRatio`；
   `plate` 的 `computeGeom` 分格时要预留右侧 10px 白边，避免 `canvas` 被 `max-width:100%`
   反向压缩（900px 窗口下曾差 8.6px）。
8. **视图标记不写内联样式**：`index.html` 的 `style="…"` 清零，收敛为
   `lab.css` 的工具类 + `crop.css` 的视图类；`display:none` 一律改 `hidden`，
   并为带 `display` 的容器补 `[hidden]` 规则。
9. **重复 id 不得出现在浮层里**：crop 预览改用 `data-act="close"`，宽度交给
   `.roi-modal.preview`，同时开两个预览不撞。

## Testing（测试条款）

1. **真机矩阵**：`node tests/smoke_tools_ui.mjs 9222` 覆盖 20 单元 × 1280/900/680 × 亮/暗 = 120 格；
   退出码非 0 即失败。18 个脚本工具在「工具窗口」（label=`tools`）里量，
   `crop` / `qpcr` 在各自工作区窗口（label=`tool-<id>`）里量 —— 量错窗口会得到假数据。
2. **每格断言**：宿主横向溢出 ≤ 2px；直接子元素不越界；文本裁切为 0；
   最小字号 ≥ 9px；可点目标 ≥ 28px；正文对比度 ≥ 4.5（硬失败 < 3.0 才拦）；
   画布后备尺寸与 CSS × DPR 差 ≤ 2px。
3. **静态契约**：`node --test "tests/js/*.test.mjs"` 全绿，包含
   - `theme-parity.test.mjs`：`var(--token)` 引用必须有定义；深色不得凭空造 token；
     `ink / ink-2 / muted / line / bg / card / accent-text` 必须在深色重定义；
   - `contrast.test.mjs`：7 组正文配对 ≥ 4.5、白字/主色底 ≥ 3（双主题）；
   - `palette.test.mjs`：JOURNAL 等于 Okabe-Ito、各板无重复、除 colors.js 外无第二份定义、
     两条加载路径都注入 colors.js；
   - `tool-ui-contract.test.mjs` 新增：`index.html` 无 `style="…"`、无 `style.display`。
4. **构建前置**：改过 `frontend/` 必须 `cargo build --release` 再跑矩阵，
   否则 exe 内嵌的还是旧资源（本轮曾因此得到一整轮无效数据）。
5. **验收门槛**：矩阵 0 fail；单测全绿（本轮 305 项）；`docs/ui-audit.json` 留档；
   报告 `docs/TOOL_AUDIT.md` 不再出现「未走查」。

## 关于提问机制

本文件所描述的确认与提问机制，在**普通对话**与**计划模式（plan mode）**下同样适用：
计划模式下仍需先确认关键决策再执行，执行中遇到阻塞性问题也应先提问而不是猜。

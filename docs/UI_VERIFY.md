# LabKit · 真机 UI 走查手册

本文件是「20 个工具 × 3 档宽度 × 双主题」走查的唯一入口。
所有结论必须是脚本跑出来的数值，不写「看起来没问题」。

## 为什么需要它

工具页做出效果，不等于渲染正确。字体回退、容器查询、暗色 token、画布 DPR 这四类问题
只有真实渲染才暴露：静态契约测试只能证明「没有内联色值」，证明不了「暗色下这行字看得清」。

同时这是最容易踩坑的地方 —— **桌面主窗点工具不会在页内渲染**，而是唤起单实例「工具窗口」
（label=`tools`，`index.html#/tool/<id>`）；`crop` / `qpcr` 两个工作区才各自开窗口
（label=`tool-<id>`，`index.html#/<id>`）。量错窗口会得到一整屏假数据（曾经的教训：
20 个单元都报同样的三个失败，实际量的是工具库首页）。

## 三条命令

```powershell
# 0) 改过 frontend/ 之后必须重新构建，否则 exe 里还是旧资源
cd rust; cargo build --release

# 1) 用隔离台账 + 调试端口启动（绝不碰用户真实数据）
$env:LABKIT_DB_DIR="$env:TEMP\labkit-ui-audit"
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
Start-Process rust\target\release\labkit.exe

# 2) 跑矩阵（20 单元 × 1280/900/680 × 亮/暗 = 120 格）
node tests/smoke_tools_ui.mjs 9222
```

`LABKIT_DB_DIR` 由 `rust/src/store.rs` 支持，会把台账写到临时目录；脚本只读页面、不改数据，
但启动的是真实 exe，所以必须隔离。

## 断言口径

| # | 断言 | 阈值 | 失败含义 |
| --- | --- | --- | --- |
| 1 | 宿主横向溢出 | ≤ 2px | 窄窗被撑出横向滚动 |
| 2 | 直接子元素越界 | 0 | 面板/画布盖到容器外 |
| 3 | 文本裁切（`overflow:hidden` 且 `scrollWidth > clientWidth`） | 0 | 文字被切掉一半 |
| 4 | 可见文本最小字号 | ≥ 9px（`--text-3xs` 地板） | 出现规范外的小字 |
| 5 | 可点目标高度 | ≥ 28px | 点不准（复选框、`.xs` 行内操作白名单） |
| 6 | 正文对比度 | ≥ 4.5（硬失败 < 3.0 才拦） | 暗色或弱化文字不可读 |
| 7 | 画布后备尺寸 | = CSS 宽 × DPR（±2px） | 高分屏发糊、命中偏移 |

宽度档位的性质要分清：1280 / 900 是**窗口级**（工具窗口最小宽 900）；
680 只能靠 `Emulation.setDeviceMetricsOverride` 模拟，属于**容器级**结论。

## 最新一次结果（2026-11-22）

| 运行 | 结果 |
| --- | --- |
| `node tests/smoke_tools_ui.mjs 9222` | 120 格 / fail 0 / AA 欠账 0 / <11px 文本 0 |
| `node tests/smoke_tools_ui.mjs 9222 1.5` | 120 格 / fail 0（画布后备尺寸全部匹配 CSS × 1.5） |
| `node --test "tests/js/*.test.mjs"` | 308 pass / 0 fail |

AA 欠账从 159 降到 0，靠两个改动：`--accent` 填充降到 `#0066CC` / `#0A6FE0`（白字 5.6 / 4.8），
`crop` 空台面提示从 `--muted` 改 `--ink-2`。`--accent-text` 仍只用于文字，不复用作填充。

## 产物

- `docs/ui-audit.json`：120 格全量数值（含每格字号/对比度/画布明细），可直接当工作清单。
- `docs/ui-fail-<id>-900-dark.png`：仅失败格截图，作证据，不作门禁。
- 控制台摘要：`cells / fail / aaUnder / byUnit`，`byUnit` 即按单元聚合的待修数量。

## 与静态契约的分工

| 层 | 工具 | 管什么 |
| --- | --- | --- |
| 静态 | `node --test "tests/js/*.test.mjs"` | 内联样式/内联色/写死尺寸/调色板单源/主题 token 齐备/契约按钮存在 |
| 数值 | `tests/js/contrast.test.mjs` | WCAG 比值（双主题，算 token 值） |
| 渲染 | `tests/smoke_tools_ui.mjs` | 真实 WebView2 里的溢出/裁切/字号/对比度/DPR |

三层都通过，才算「适配完成」。像素基线（截图 diff）刻意不做门禁：WebView2 小版本升级
就会整屏变红，维护成本高于收益。

## 已知限制

- 脚本只覆盖 3 档宽度。超宽（≥1920）与 125% / 150% 系统缩放的组合尚未纳入矩阵，
  后者可用 `Emulation.setDeviceMetricsOverride({ deviceScaleFactor })` 扩展。
- 对比度取样遇到 `color-mix()` 未解析值或半透明叠加会记「无法判定」单列输出，不静默放行。
- 工具内部的 canvas 命中测试（孔板圈选）只校验几何比例，不模拟真实鼠标轨迹。

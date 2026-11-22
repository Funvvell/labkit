# LabKit 全工具审核报告

> 审核日期：2026-11-22 · 范围：`frontend/tools/*.js` + `frontend/js/crop.js` / `qpcr.js` + 共享库 `qpcr-plots.js` + 壳层 `toolhub.js`
> 方法：静态审查（逐文件通读）+ 契约测试口径比对（`docs/DESIGN_SYSTEM.md` / `tests/js/ui-contract.test.mjs` / `tests/js/typography.test.mjs`）+ 计数扫描
> 本报告只做判定与改法建议，未改动任何代码。

## 0. 先修正一个计数

工具箱实际是 **20 个单元**：18 个脚本工具 + 2 个工作区（`crop` / `qpcr`）。
此前计划里写的 22 是把两个工作区重复计入，工作项本身不变（7 + 7 + 6 = 20）。
`qpcr-plots.js` 不是独立工具，是 `plotter` 与 `qpcr` 共用的期刊绘图库，单独列为第 21 行。

## 1. 结论摘要

- **P0：2 处**（都是数据丢失，且都会立刻落盘）
- **P1：21 处**（暗色不可读、可复现性失效、重置无效、导入按钮不可聚焦等）
- **P2：30+ 处**（一致性打磨、代码质量）
- 20 个单元**没有一个坏到不能用**；问题高度集中，约 70% 来自 4 类共性缺陷：

| # | 共性缺陷 | 规模 | 影响 |
| --- | --- | --- | --- |
| A | 内联 `style="…"` 绕过 token | 123 处 / 18 文件 | 暗色模式错色、窄窗溢出、改一处要改十处 |
| B | 双按钮体系 `.btn` / `.tbtn` 度量不同 | 全局 | 工具内按钮比页头按钮高、圆角与字号不一致 |
| C | 用 `.style.display` 代替 `hidden` / 类切换 | 40+ 处 | 显隐逻辑与 `hidden` 属性、`[hidden]` CSS 打架 |
| D | 文件导入有 4 种写法（`<label class="tbtn">`、裸 `<input type=file>`…） | 7 处 | 「按钮」不可键盘聚焦，样式各成一派 |

另外两处系统性问题：

- **工具目录 `aria-label` 出现 0 次**，图标按钮与画布没有可访问名称。
- **`重置` 对 7 个 `persist:false` 工具完全无效**：`toolhub.js` 的 `toolReset` 只清 `toolform:<id>` 快照，而这些工具的状态存在自己的 `tool:*` 键（`plate` / `figure` / `plotter` / `checklists` / `inventory`…），点重置什么都不发生，还不给提示。

## 1.2 Phase 7 真机闭环结果（2026-11-22，最终）

**结论：20 个工具单元 × 3 档宽度 × 亮/暗 = 120 格全部通过，AA 欠账归零。**

```
node tests/smoke_tools_ui.mjs 9222        → cells 120 / fail 0 / aaUnder 0 / smallText 0
node tests/smoke_tools_ui.mjs 9222 1.5    → cells 120 / fail 0（高分屏 1.5× 画布后备尺寸全对）
node --test "tests/js/*.test.mjs"         → 308 pass / 0 fail
```

三条口径必须记牢，否则会得到看似正确实则无效的数据：

1. **exe 里的前端是编译进去的**。改 `frontend/` 后不 `cargo build --release`，测到的仍是旧 UI
   （曾用诊断脚本实证：旧 exe 里 `#ivSearch` 还是 `trow` 直系、`font-family=Arial`）。
2. **桌面端点工具不渲染在页内，而是开「工具窗口」**（label=`tools`，`index.html#/tool/<id>`）；
   `crop` / `qpcr` 各自再开独立窗口（label=`tool-<id>`，`index.html#/<id>`）。量主窗只会得到壳层噪声。
3. **窗口最小宽度 900 / 860**。680 档只能靠 CDP `Emulation.setDeviceMetricsOverride` 模拟，
   属于容器级结论，不代表用户能把窗口拖这么窄。

本轮真机查出的、静态推导没发现的四类问题：

| 现象（真机数值） | 根因 | 修法 |
| --- | --- | --- |
| 12px 弱化文字 2.98:1 | 浅色 `--muted #8E8E93` 对页面底不够 | 改 `#6E6E73`；另设 `--accent-text`（浅 `#0062CC` / 深 `#5FB0FF`）承接正文级蓝色 |
| 主按钮白字 4.02:1、暗色 3.65:1 | `--accent` 直接当填充+白字 | 填充色降到 `#0066CC` / `#0A6FE0`（白字 5.6 / 4.8）；`--accent-text` 只用于文字 |
| `crop`/`qpcr` 680 宽横向溢出 347 / 412px | 堆叠规则写在 `@container` 里，而 `.ws-body` 自己是容器——容器查询作用不到容器自身 | 移到 `@media (max-width:859px)`；面板 100% 宽、画布区固定 380px |
| `crop` 暗色拖入提示 2.28:1 | 台面底色写死 `#E3E5EA` | 新增 `--stage-bg` token（深色 `#1B1B1E`），提示字改 `--ink-2` |
| 数字输入框 16px 高（点不准） | `.native-input` 无内边距/边框 | `min-height:28px` |
| `plate` 画布 404 vs 395.4 | `computeGeom` 分格顶出容器后被 `max-width:100%` 反向压缩 | 预留右侧 10px 白边 |

## 1.1 本轮修复结果（2026-11-22）

20/20 单元已按上面结论改完，`node --test "tests/js/*.test.mjs"` **308 项全绿**（275 + 新增 33 条：主题 4 / 对比度 18 / 调色板 7 / 自适应 3 + 契约 2）。

**P0（数据丢失）**
- `plate`：切板型 / 重置板前走 `confirmModal` 并说明「会立即落盘」；板为空时免确认。
- `eln`：切模板时比对已填段落，非空则确认，并按顺序把内容迁移到新模板（多出段落提示会丢弃）。

**P1（功能与可复现）**
- 统一壳「重置」：`toolhub.js` 改为调用工具自报的 `host.__lkReset`；`plate` / `figure` / `plotter` / `checklists` / `timer` / `inventory` / `imgbatch` 七处补齐，台账只清筛选不动数据。
- `timer`：预设不再丢弃 0 秒的「循环 35×」标记步（改为手动步）；提示音复用单个 `AudioContext`，不再连续到点后失效。
- `randomize`：`seedrandom` 缺失时明确报错，不再静默退化为不可复现；`m` / `prob` / `mEach` 全部校验。
- `epi2x2`：四格空值不再补 0；分层行格式错误给出具体行号。
- `samplesize`：空值/非数值拦下并标 `aria-invalid`，不再把 `NaN` 送进 OpenEpi。
- `primer`：空序列与非 ACGT 字符在入口报错（指明哪个引物、哪个字符）。
- `table1`：重新解析即收起上一份结果；导出按钮改为绑定一次、读当前结果，避免旧闭包导出过期数据。
- `data-wash` / `inventory`：CSV/TSV 导出对 `=`、`+`、`-`、`@` 开头单元格加前导单引号，防 Excel 公式注入。
- `plotter` / `figure`：导出的配置/布局 JSON 现在能再导回来（新增 `导入配置/布局 JSON`）；`恢复上次` 与 `导入文件` 语义分开。
- `tableconv`：Excel 载入后同步把「输入格式」设为 CSV，避免自动识别猜错。
- `tableconv` / `eln` / `inventory`：下载后延迟释放 ObjectURL，避免个别环境取消下载。

**UI 统一**
- `.tbtn` 度量对齐主壳 `.btn`（32px / 8px / 12px 600），新增 `.tbtn.xs` 供表格行内操作；`qpcr-plots` 导出条不再混用 `.btn` + 内联压缩。
- 内联样式 **123 → 1**（只剩 plate 的动态 `--chip`），新增共享组件：`.tcheck`、`.tfile`、`.tresult`、`.tbody-scroll`、`.tbody-frames`、`.tone`、`.tsc`、`.tempty`、`.tnote.flat`、`.tpre`。
- 文件导入 7 处全部换成 `.tfile`（真按钮外观 + 可聚焦的 file input，Tab 可达、Enter 触发）。
- 显隐统一 `hidden` 属性，移除全部 `.style.display`。
- 暗色修复：`inventory` 状态色（改 `data-tone` + `color-mix`）、`checklists` 进度与备注框、`imgbatch` 进度条、`figure` 台面、`qpcr` 回退折线图（刻度/标签/网格改 token）、`eln` 预览。
- 语义色纠正：`tests` 的「p<.05」从警告色改为成功色；`qpcr` 的 geNorm/稳定性/组间统计改 `tone`；`imgbatch` 表格错误改 `.tsc`，不再用 `.terr` 撑行。
- 可访问性：`labcalc` / `primer` / `timer` / `inventory` / `eln` / `tableconv` / `data-wash` / `plotter` / `figure` 的字段统一 `label` 包裹（点标签聚焦、读屏念字段名）；图标按钮补 `aria-label`；`timer` 进度区 `aria-live="polite"`；`plate` 区域单选与删除补名称。

**新增回归闸门** `tests/js/tool-ui-contract.test.mjs`（8 条）：禁止 `document.getElementById`、`.style.display`、内联颜色/字号、白名单外写死色值、写死滚动高度；要求每个 `persist:false` 工具有 `__lkReset`、registry 声明的导出按钮真实存在、`tools.css ≤ 20 KB`。



- **P0**：结果错误、数据丢失、可注入 —— 必须在本轮修
- **P1**：破版、暗色不可读、窄窗溢出、可复现性/重置等「看起来能用其实不对」
- **P2**：一致性、可维护性、可访问性打磨

## 3. 逐单元判定表

图例：`✓` 达标 · `△` 需打磨（P2）· `✕` 需修（P0/P1）
维度缩写：壳=壳层接入，视=视觉 token，暗=暗色，响=响应式/容器查询，障=无障碍，态=状态与持久化，健=健壮性，安=安全，码=代码质量

| # | 单元 | 壳 | 视 | 暗 | 响 | 障 | 态 | 健 | 安 | 码 | 问题数 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `epi2x2` 2×2 表 | ✓ | △ | ✓ | ✓ | ✕ | ✓ | ✕ | ✓ | △ | P1×2 · P2×2 |
| 2 | `samplesize` 样本量 | ✓ | ✓ | ✓ | ✓ | ✕ | △ | ✕ | ✓ | △ | P1×1 · P2×2 |
| 3 | `tests` 假设检验 | ✓ | △ | ✓ | ✓ | △ | ✓ | △ | ✓ | △ | P2×5 |
| 4 | `table1` 基线表 | ✓ | ✕ | ✓ | △ | ✕ | ✕ | △ | △ | △ | P1×3 · P2×3 |
| 5 | `randomize` 随机化 | ✓ | △ | ✓ | ✓ | △ | ✓ | ✕ | ✓ | △ | P1×2 · P2×3 |
| 6 | `data-wash` 数据清洗 | ✓ | △ | ✓ | ✕ | ✕ | ✓ | △ | ✕ | △ | P1×1 · P2×6 |
| 7 | `apa` 报告串 | ✓ | △ | ✓ | ✓ | △ | ✓ | ✓ | ✓ | △ | P2×4 |
| 8 | `labcalc` 实验计算 | ✓ | △ | ✓ | △ | ✕ | ✓ | ✓ | ✓ | △ | P2×5 |
| 9 | `primer` 引物 | ✓ | △ | ✓ | ✓ | ✕ | ✓ | ✕ | ✓ | ✓ | P1×1 · P2×2 |
| 10 | `plate` 孔板 | ✓ | ✕ | △ | ✓ | ✕ | ✕ | ✕ | ✓ | ✕ | **P0×1** · P1×2 · P2×4 |
| 11 | `timer` 计时器 | ✓ | ✕ | ✓ | ✓ | ✕ | △ | ✕ | ✓ | ✕ | P1×2 · P2×4 |
| 12 | `eln` 实验记录 | ✓ | △ | ✓ | ✓ | ✕ | ✕ | ✕ | △ | △ | **P0×1** · P1×1 · P2×3 |
| 13 | `inventory` 试剂台账 | ✓ | ✕ | ✕ | ✓ | ✕ | ✓ | △ | △ | △ | P1×3 · P2×4 |
| 14 | `plotter` 绘图器 | ✓ | △ | ✓ | △ | ✕ | ✕ | △ | ✓ | △ | P1×1 · P2×5 |
| 15 | `figure` 拼图 | ✓ | ✕ | ✕ | ✓ | ✕ | ✕ | ✕ | ✓ | △ | P1×3 · P2×3 |
| 16 | `imgbatch` 批处理 | ✓ | ✕ | ✕ | ✓ | △ | △ | △ | ✓ | △ | P1×1 · P2×4 |
| 17 | `checklists` 规范清单 | ✓ | ✕ | ✕ | ✓ | ✕ | ✓ | ✓ | ✓ | △ | P1×1 · P2×4 |
| 18 | `tableconv` 表格互转 | ✓ | △ | ✓ | ✓ | ✕ | ✓ | △ | ✓ | △ | P2×5 |
| 19 | `crop` 工作区 | ✓ | ✓ | ✓ | ✓ | △ | ✓ | ✓ | ✓ | △ | P2×4 |
| 20 | `qpcr` 工作区 | ✓ | ✕ | ✕ | ✓ | △ | ✓ | △ | ✓ | △ | P1×2 · P2×4 |
| 21 | `qpcr-plots` 共享库 | — | △ | ✓ | ✕ | △ | — | ✓ | ✓ | △ | P2×4 |

## 4. P0 / P1 明细与改法

### P0-1 · `plate`：切板型直接丢弃全部布局并落盘

`frontend/tools/plate.js:236` 的 `plSize` change 与 `:274` 的 `plReset` 都是「新建板 → `persist()`」，没有确认、没有撤销栈。
用户手上有 96 孔排布做了一半、误碰板型下拉，全部区域与孔位立刻消失，且已写进 `Store('tool:plate')`，重启也回不来。

改法：两个入口都走既有 `confirmModal`（台账页同款），文案说明「当前布局将丢弃」；`plSize` 仅在旧板为空时才免确认。

### P0-2 · `eln`：切模板静默清空已填正文

`frontend/tools/eln.js:44` `eln-tpl.onchange → renderSections()` 会重建整组 textarea，已输入内容直接消失；紧接着 `toolhub.js:343` 的表单快照把空值写回 `toolform:eln`，等于把旧内容也覆盖掉。

改法：切模板前比对各段是否非空 → 非空时 `confirmModal` 询问「保留现有内容 / 按新模板重排」；选择保留时把旧文本按序号迁移到新模板同名段落。

### P1 明细（按单元）

**1. `epi2x2`**
- `:12-16` 四格数字框空值时被 `num(v, 0)`（`:4`）静默补 0，仍照常算 OR/CI → 空表也能出结果，用户看不出数据是假的。改为空值即报错。
- `:37` 分层文本按「每行 4 个数」过滤，3 个数或 5 个数的行被静默丢弃，剩几层照算 → 统计偏差无提示。改为逐行报错并列出错误行号。

**2. `samplesize`**
- `:75` `parseFloat(inp.value)` 不做有限性检查，空值 → `NaN` 直接送入 OpenEpi，页面仍渲染结果区。改为空/非数值即标红并拦下。

**3. `table1`**
- `:10` `<label class="tbtn sec">导入 CSV` —— label 不可聚焦，Tab 与回车都进不去。改为 `<button>` + 隐藏 input（或 `role="button"` + 键盘处理）。
- `:65-68` 重新解析后 `t1OutSec` 仍显示上一次结果的表，与新数据不一致却无任何标记。解析成功时清空结果区。
- `:105-109` 用 `xxx.onclick =` 在每次运行时重绑；切标签重挂载后旧闭包仍持有旧 `last`，导出会用过期数据。改 `addEventListener` 并绑定一次。

**4. `randomize`**
- `:65` `Math.seedrandom ? new Math.seedrandom(seed) : Math.random` —— 若 `seedrandom.min.js` 未加载，静默退化为真随机，但界面已把种子回填到输入框（`:63`），用户以为可复现。改为缺库时明确报错。
- `:71` `parseInt($('rz-m').value, 10)` 为空时 `NaN` 进入 `randomizr`，可能产出不符合预期的分组。补 `Number.isFinite` 校验。

**5. `data-wash`**
- 导出 CSV/TSV 未防公式注入：`:191` `Papa.unparse(exportRows())` 原样输出以 `=`、`+`、`-`、`@` 开头的单元格，Excel 打开会当公式求值。导出前对这些首字符加前导 `'`（或前缀制表符）。

**6. `primer`**
- `:46` 空序列时 `tmNN('')` 与后续 `toFixed` 会抛断或产出 `NaN`，但表格照旧渲染「长度 0 / Tm NaN」。入口处拦空序列。

**7. `plate`**（除 P0）
- `:178` `window.addEventListener('mouseup', …)` 每次挂载新增一条，从不移除。工具页被反复重渲染后，一次 `mouseup` 会执行 N 个旧闭包（引用已脱离文档的 canvas 与旧 `plate`）→ 内存只增不减。改挂到 `host` 或记录引用并在下次挂载前解绑（`host.__lkRO` 已有这种范式）。
- `:329` `document.getElementById('groupInput')` 直取 qPCR 视图的 DOM。跨标签/多窗口时应由 `qpcr` 暴露一个写入函数，否则拿到的是另一个实例的输入框。

**8. `timer`**
- `:102` `.filter(s => s.seconds > 0)` 把预设里 `seconds: 0` 的「循环 35×」步骤直接删掉 —— 示例流程本身就少一步。
- `:55` 每次 `beep()` 新建 `AudioContext` 且从不 `close()`，两个振荡器也挂在同一个 gain 上。连续几步后浏览器会顶到 context 上限，提示音开始失效（且不可恢复）。改为复用一个 context，或 `stop` 后 `close()`。

**9. `inventory`**
- `:17-20` 状态色写死 `#FF453A / #FF9F0A / #AF52DE / #30D158`，`:77` 内联到 `<td style="color:…">`。深色卡片上 `#FF453A` 与底色对比过低，`#AF52DE` 几乎不可辨。改为 `.ist-expired / .ist-expiring / .ist-low / .ist-ok`，颜色用 `color-mix()` 派生。
- `:43` `border:1px dashed #ccc` —— 深色模式下这条虚线在白底假设上成立，实际在 `#2C2C2E` 卡片上发灰。改用 `var(--line)`。
- `:87` 用原生 `confirm()` 删除条目，与项目「破坏性操作先 `confirmModal`」相冲突，且不可样式化。改 `confirmModal`。

**10. `figure`**
- `:35` 画布容器写死 `background:#e9ebee` —— 暗色下整块变浅灰台面，与页面风格断层。改用 `var(--bg)` 派生色；画布内部白底属于「纸面白」例外，保留。
- `:143` 「保存布局」既写 `Store('tool:figure')` 又下载 JSON；`:148` 「载入布局」只读 `Store`，用户手里下载的 JSON 永远载不回去。二选一：要么加文件选择，要么把按钮改为「恢复上次布局」。
- `:96-107` 多图 `await` 串行读取 + `fabric.Image.fromURL` 逐个回调，导入 12 张图时界面完全无进度反馈。加一个「读入 i/n」的 `tnote`。

**11. `imgbatch`**
- `:39` 进度条底 `#e5e7eb` 写死，暗色下像一条白带。改用 `var(--line)`。
- `:100` 用 `<td class="terr">` 表示冲突单元格 —— `.terr` 是带 padding 与底色的错误块，塞进表格会撑高行、颜色也不对。改为 `.tcell-bad`（仅文字色）。

**12. `checklists`**
- `:185` 进度文字写死 `color:#007AFF`；`:202` 备注输入框写死 `border:1px solid rgba(0,0,0,.1)` —— 暗色下输入框边框消失、进度色偏亮。全部换成 token 或共享类。
- `:202` 每条备注 input 无 `id`/`aria-label`，读屏只念「编辑框」。补 `aria-label="条目 N 页码/备注"`。

**13. `plotter`**
- `:215` 「保存配置」下载 JSON，`:221` 「载入配置」只读 Store 上次配置，文件名对不上。同上，统一语义。

**14. `qpcr`**
- `:209` `fcChartSvg` 回退图表把刻度文字写死 `#8e8e93`、靶标标签 `#3a3a3c`、组名 `#636366`，而 `.fc-chart` 没有独立底色（`:225` app.css 只有 `margin`）——深色卡片上 `#3a3a3c` 对比约 1.2:1，**等于看不见**。改为读取 `getComputedStyle` 的 `--muted` / `--ink-2`，或给 `.fc-chart` 显式白底（与期刊图一致）。
- `:318-325` 用 `.warn` + 内联 `background:rgba(...)` 模拟「稳定/可接受/偏不稳定」「geNorm 提示」等语义色，与 `.twarn` / `.terr` 体系重复。改成语义类（`data-tone="ok|warn|bad"`）。

**15. `qpcr-plots`**
- `:188-193` `exportBar` 混用 `.btn sec` 与内联 `font-size:11px;padding:3px 8px` —— 这正是 `.btn` / `.tbtn` 双体系的缝：同一个导出条里的按钮比工具内按钮矮一档。统一到同一套按钮度量。

## 5. P2 汇总（按类合并，逐条可查）

**视觉与 token**
- 内联 `font-size`：`12.5px`（`epi2x2:22`、`data-wash:8/197`、`timer:31/44`、`imgbatch` 等）—— 设计规范明令禁止半像素字号。
- 内联宽高：`table1:10/12/32`、`plotter:73`、`figure:22`、`imgbatch:21-23`、`plate:36/45/46`、`tableconv:9/20`。统一走 `.tfield.grow / w-sm / w-md / w-lg` 与 `.t-body-scroll`。
- `.tmono` 被当「通用文本块」用：`tests:53` 把输入 textarea 套等宽输出样式；`table1:12`、`plotter:58`、`plate:39/69` 同类；`apa:139` 用等宽渲染整句 APA。等宽只该给数值/代码/批号。
- `randomize:34`、`timer:31`、`tests:29/33`、`plate:19`、`imgbatch:28` 的复选框都是内联 flex 包裹，应统一 `.tcheck`。

**组件语义**
- `tests:123` 用 `.twarn`（警告）表示「p<.05 显著」，语义反了。显著是结果不是警告。
- `imgbatch:100`、`checklists:202`、`qpcr:318-325` 各自造错误/状态块，应收敛到 `.terr` / `.twarn` / 新增 `.tok`。
- `table1` / `figure` / `plotter` / `data-wash` 出错只 `toast`，同目录其它工具用行内 `.terr` → 两套反馈。

**交互与状态**
- `samplesize:65` 切模块重建输入；`apa:119` 切类型重建输入 —— 已填值静默丢失（可接受但应提示）。
- `data-wash:82` Tabulator 高度取 `window.innerHeight * 0.42`，窄窗里表格比容器还矮/还高；应改容器查询或 `100%` + `min-height`。
- `qpcr-plots:14` `plotHeight` 依赖 `window.innerHeight`，同一工具在主窗与独立窗口里高度不一致。
- `plate:26` 画布 `max-width:100%` + JS 里 `canvas.style.width` 双写，窄窗靠 `canvasPos` 反算缩放比修命中 —— 能跑，但脆。
- `figure:41` `new fabric.Canvas('fgCanvas')` 用全局 id 初始化；当前靠「工具标签单例」兜住，一旦允许两实例就绑错。
- `crop:78` 预览弹窗每次 `id="pv_close"`，同时开两个预览会重 id；`:77` 内联 `width/maxWidth`。

**可访问性**
- 工具目录 `aria-label` 0 处；`timer` 倒计时无 `aria-live`；`plate` 孔位只能鼠标圈选；`crop` ROI 列表只有 click/dblclick。
- 所有 `<div class="tfield"><label>文本</label><input>` 都没有 `for`/`id` 关联（`epi2x2`、`labcalc`、`primer`、`eln`、`inventory`、`tableconv`、`data-wash`），点标签不聚焦输入框，读屏不念字段名。

**代码质量**
- `plate:178` 全局监听泄漏（见 P1）。
- `data-wash:185` `rvals.reduce((s, x) => s + 0, 0)` 是死表达式。
- `plate:1-5` 常量 `PALETTE` 16 色与 `qpcr:181` `GROUP_COLORS` 8 色、`qpcr-plots:7` `PALETTE` 8 色是三套调色板，同一份「分组着色」在三处不同。
- `tools/*.js` 共 81 处 `x.onclick =`，15 处 `x.onchange =`，没有统一解绑路径；重挂载依赖「节点被替换」自然失效。

## 6. 壳层与共享层问题（不属于某个工具，但影响全部 20 个）

1. **重置无效**（见 §1）：`toolhub.js:369` 只清 `toolform`。7 个 `persist:false` 工具需要各自登记「重置钩子」，例如 `host.__lkReset`，由工具自己清 `tool:*` 与内存状态。
2. **导出条依赖元素 id**：`toolhub.js:383` `activeToolHost().querySelector('#' + x.btn)`，若工具把导出按钮改名/未挂载就只 toast「导出按钮未就绪」。可接受，但 7 个工具里 `exports` 声明了不存在的按钮时不会在测试期暴露（建议加契约测试比对）。
3. **按钮双体系**：`app.css:249` `.btn`（32px / 8px / 12px 600）vs `tools.css:67` `.tbtn`（8px padding / 9px / 13px 600）。页头用 `.btn`，工具壳与工具内用 `.tbtn`，视觉上差一档。
4. **样式预算**：`app.css` 58170 / 60000，只剩 **1830 bytes**。本轮所有新增样式只能进 `tools.css`（现 9906 bytes，无预算断言）。

## 7. 建议的统一改法（批 A 设计稿，给工程师）

在 `frontend/tools/tools.css` 增加/收敛以下组件，之后 20 个单元只改 markup，不再各写各样：

| 组件 | 用途 | 替代现状 |
| --- | --- | --- |
| `.tfield` + `.tlabel`（`<label for>` 强制关联） | 表单字段 | 当前 7 个工具的 div>label>input |
| `.tcheck` | 复选框行（含说明文字） | 内联 flex 包裹 ×6 |
| `.tfile`（`<button>` + 隐藏 input） | 文件导入 | label-as-button ×4、裸 input ×3 |
| `.tresult` | 结果句块（正文语气） | `.tmono` 滥用 ×6 |
| `.tbody` / `.tbody-scroll` | 结果滚动容器 | 内联 `max-height`/`overflow` ×8 |
| `.tbtn` 度量对齐 `.btn` | 32px / 8px / 12px 600 | 两套按钮体系 |
| `.tok` / `.terr` / `.twarn` 三态 | 语义状态 | `.warn` + 内联背景 ×5 |
| `.tok-cell` / `.terr-cell` | 表格单元格状态（不撑行） | `<td class="terr">` |
| `.t-hide` → 统一用 `hidden` 属性 | 显隐 | `.style.display` ×40 |
| `data-tone="ok\|warn\|bad"` | qPCR/台账的状态着色 | 三套硬编码 hex |

约束：新样式零 `!important`、零半像素字号、颜色全部 `color-mix()` 派生、暗色自动跟随。

## 8. 回归闸门（Phase 6 新增 `tests/js/tool-ui-contract.test.mjs`）

1. `frontend/tools/*.js` 不得出现 `document.getElementById(`（白名单：`crop.js`/`qpcr.js` 属主文档视图，不在本条）
2. 不得出现写死六位色值 `#[0-9a-fA-F]{6}`，白名单：`qpcr-plots.js`（期刊配色）、`plotter.js`（灰度表）、`plate.js`（画布）、`figure.js`（标签黑）
3. 不得出现 `font-size:\d+\.?\d*px`（内联半像素/字面量）
4. 不得出现 `.style.display =`
5. `registry.js` 每条 `exports[].btn` 必须能在对应工具源码里找到该 id
6. 每个 `persist:false` 工具必须提供 `host.__lkReset`（或等价重置入口），`toolReset` 调用它
7. `tools.css` 体积上限（建议 ≤16000 bytes）—— 防止新组件层无限膨胀

## 9. 修复分批（对应已有任务）

| 批次 | 范围 | 修什么 | 验收 |
| --- | --- | --- | --- |
| A 共享层 | `tools.css` / `index.html` 壳 / `toolhub.js` | 按钮度量统一、`.tfield`/`.tcheck`/`.tfile`/`.tresult`/`.tbody`、重置钩子、语义三态 | 契约 7 条全绿；壳层 4 个动作在 7 个 `persist:false` 工具上真实生效 |
| B 统计与数据（7） | `epi2x2` `samplesize` `tests` `table1` `randomize` `data-wash` `apa` | P1 校验、导入按钮、结果清理、CSV 注入、`tmono` 误用 | `node --test tests/js/stats*.test.mjs openepi.test.mjs tableone.test.mjs randomizr.test.mjs apa.test.mjs` |
| C 实验计算（6） | `labcalc` `primer` `plate` `timer` `eln` `inventory` | P0×2、监听泄漏、音频 context、状态色、模板迁移 | 手动走查孔板/计时器/实验记录三处主流程 + JS 全量测试 |
| D 写作与图 + 工作区（6+2） | `plotter` `figure` `imgbatch` `checklists` `tableconv` `crop` `qpcr`（+`qpcr-plots`） | 暗色、保存/载入语义、`.btn` 混用、SVG 配色 | 暗色逐页走查 + `plotter`/`qpcr-plots` 已有单测 |

## 10. 剩余未覆盖（下一步）

真机矩阵已覆盖「布局 / 字号 / 对比度 / 画布 DPR」四类，以下是不在矩阵里的部分：

- `epi2x2` / `samplesize` 的 OpenEpi 输出只做了 UI 层拦截，未逐题重算数值（引擎层有 `openepi.test.mjs`）。
- `crop` 的导出 / 批量 / 错误路径只通读关键段，仍建议补一次整文件细读。
- `qpcr` 的分组颜色（`SERIES_UI`）与图表配色（`JOURNAL`）已合并到 `tools/lib/colors.js` 单源，
  但「分组色是否要跟界面色完全一致」属于产品选择，UI 上未暴露开关。
- 矩阵的 680 档是模拟宽度（窗口最小 900 / 860），**操作系统缩放 125% / 150%** 只验了
  CDP `deviceScaleFactor=1.5` 的画布后备尺寸，未验真实 Windows 缩放下的窗口边框与菜单栏。
- `figure` 的 fabric 对象命中测试（点选/多选）只校验几何，不模拟真实鼠标轨迹。
- 像素基线（截图 diff）刻意不做门禁：WebView2 小版本升级会整屏变红，维护成本高于收益；
  失败截图仍保存在 `docs/ui-fail-<id>-900-dark.png` 作证据。

## 11. 复现与验证命令

```powershell
# 1) 单测（含 UI 契约 / 主题 token / 对比度 / 调色板单源 / 自适应层）
node --test "tests/js/*.test.mjs"          # 308 项

# 2) 真机矩阵（改过 frontend/ 必须先重建，否则测的是旧 UI）
cd rust; cargo build --release
$env:LABKIT_DB_DIR="$env:TEMP\labkit-ui-audit"
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9222'
Start-Process rust\target\release\labkit.exe
node tests/smoke_tools_ui.mjs 9222         # 120 格，退出码 0 = 全过
node tests/smoke_tools_ui.mjs 9222 1.5     # 高分屏 1.5×，产物 ui-audit-dpr15.json

# 3) 语法
node --check frontend/tools/*.js
```

产物：`docs/ui-audit.json`（DPR 1 全量）、`docs/ui-audit-dpr15.json`（DPR 1.5 全量）、
`docs/ui-fail-*.png`（仅失败格）。走查口径与断言明细见 `docs/UI_VERIFY.md`。



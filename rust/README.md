# 科研工具箱 LabKit · Rust/Tauri 版

科研工作台（v0.2.0）：病理切片浏览裁剪 + qPCR 分析 + 科研任务/实验/文献管理。
由 egui 版重写而来：**UI 全部推翻重做，核心算法层原样复用**。
Python 源码原样保留在仓库根目录，可作为行为参照与回退；本目录不修改任何 Python 文件。

- 产品名：科研工具箱 LabKit　·　crate / 可执行文件：`labkit`　·　标识符：`com.labkit.research`

## 技术栈

- **GUI**：`Tauri 2` + WebView2，前端为单文件 `frontend/index.html`（内联 CSS/JS，macOS Big Sur 玻璃质感，无边框窗口 + 自绘交通灯）
- **核心（复用自 egui 版，算法零改动）**：SDPC FFI 解码、ROI 模型/撤销栈、TIFF 导出、qPCR 全套分析
- **解码**：FFI 调用 `DecodeSdpcDll.dll`（来自 `sdpc-for-python`，Windows x64 专有闭源库）
- **导出**：`tiff` + `flate2`（RGB8 / Deflate TIFF，与 Python 版 `tifffile` 像素一致）
- **线程**：单个后台解码线程独占所有 DLL 调用（DLL 非线程安全），Tauri 命令只投递/拉取消息

## 目录

```
src/sdpc/       唯一 unsafe 区：DLL 加载、GBK 路径、结构体偏移、区域解码（复用）
src/decode/     后台解码线程 + 消息通道 + 取消（复用）
src/render/     视口变换、金字塔瓦片选择、缩略图 PNG 编码（瓦片走原始 RGBA，见下）
src/model/      ROI、会话 JSON、撤销栈（复用）
src/export/     居中裁剪、命名、TIFF 写入（复用）
src/qpcr/       qPCR 算法：ΔCt/ΔΔCt/geNorm/QC/统计（复用）
src/commands.rs Tauri 命令层：把核心能力桥接给前端（新增）
src/store.rs    台账落盘：原子写 / 备份 / 损坏回退 / 导入导出（新增）
src/main.rs     Tauri 入口 + 无头 CLI（--info / --export 保留）
frontend/       macOS 风格工具箱前端（单文件 index.html，新增）
tools/          字体子集、图标、结构体偏移 dump 脚本
tests/          单元测试（77 个全部通过，含 review 修复回归测试）
```

## 设计系统（前端 token）

主色 `#007AFF`（悬停 `#0062CC` / 浅色 `#E8F1FF`）；中性阶 `#1D1D1F → #3A3A3C → #8E8E93 → #AEAEB2 → #E5E5EA → #F5F5F7`；
语义色 成功 `#30D158` / 警告 `#FF9F0A` / 危险 `#FF453A`；圆角 按钮 8 / 控件 12 / 卡片 16；
间距基数 4/8/12/16/24；字体 系统栈（PingFang SC / Microsoft YaHei）+ 数字等宽 mono。
完整规范见应用内「设计系统」页（侧栏 → 系统工具）。

## 切片预览瓦片管线（v0.2.0 重写）

参照 Python 版 `QGraphicsScene` 的思路——**所有瓦片画进同一个绘图表面**——把 WebView 端从
「一堆被 CSS `scale()` 的 `<img>`」改成「一张按设备像素绘制的 `<canvas>`」。

**传输**：`fetch_tile(level,x,y,w,h,gen)` 直接返回 **RGBA8888 原始字节**。Tauri 对 >1KB 的原始响应走
fetch 通道，前端拿到 `ArrayBuffer` → `ImageData` → `createImageBitmap`，全程**零图像编码、零 base64、
零 JSON 序列化、零轮询**。旧管线是 `enqueue_tile` → PNG 编码 → base64 → JSON → 250ms 轮询 → `<img>` 解码。

**渲染**：level-0 → 设备像素的变换与 `viewport` 的 CSS 变换同源。相邻瓦片的共享边由**同一个 level-0
边界坐标取整**得到，整数边严格相等；再向右/下多铺 1 设备像素并由后绘制的邻居覆盖，补掉双线性重采样
在边界少采一列源像素造成的发丝线。粗层 → 细层依次覆盖，无淡入动画，因此不会出现跨图层混色。

**色彩**：删除了逐瓦片白点均衡（每块独立算 P90 增益）。`--tileprobe` 实测证明解码器与请求几何无关：
同一区域「两块 1024 拼接」与「一次 2048 整块」的像素 **max|Δ| = 0**，共享边 mean|Δ| ≈ 1.6（自然图像连续性）。
也就是说色块拼布完全来自应用层的逐块增益，而非切片文件或 DLL。现在所有瓦片受完全相同的处理。

**调度**：视图变化 → rAF 合帧重绘（不再是 200ms 重置式防抖，手势期间一块瓦片都不请求）；
按距视口中心排序、最多 6 个并发请求；只有**金字塔层级切换**才递增 epoch 作废在途请求，同层平移不作废；
手势中预加载边距 6%，静止后恢复原版 30%；`ImageBitmap` 按 4000 万像素 LRU 预算释放。

```powershell
# 接缝 / 色差诊断：对比拼接与整块解码，并给出稳态单瓦片解码耗时
# release 版是 GUI 子系统（双击不弹黑框），CLI 输出需要重定向才能看到：
Start-Process -Wait -NoNewWindow -FilePath .\labkit.exe `
  -ArgumentList '--tileprobe','D:/文件/切片.sdpc','3' -RedirectStandardOutput probe.txt
# 或直接用 debug 版：cargo build; .\target\debug\labkit.exe --tileprobe "切片.sdpc" 3
```

## Dashboard（可自定义卡片工作台）

首页是一个 **规范化的 4 列 × 152px 行单位网格**。每张卡片的尺寸都是「宽×高」的整数格：

| 宽度 | 高度 | 例 |
| --- | --- | --- |
| 1 / 2 / 4 列 | 1 / 2 / 3 / 4 行 | `4×2` 通栏两行高（数据总览）、`2×4` 半栏四行高（今日任务）、`2×1` 半栏一行高（仪器预约）、`1×2` 四分之一栏两行高（试剂耗材） |

卡片外框尺寸由网格规格决定，**不再按内容自动量高**，所以整页永远是整齐的网格。
正文 `.card-body` 是卡片内唯一可滚动的区域，标题与按钮固定在顶部；内容装不下时底部出现渐隐提示，
鼠标移上去恢复清晰并可滚动。正文里的块设了 `flex-shrink:0`，宁可滚动也不会被压扁变形。

- **交互按钮**：每张卡片右上角带自己的快捷动作（今日任务→新建任务、试剂耗材→入库、仪器预约→预约、
  经费台账→记一笔、实验速记→新建、实验台账→新建实验、文献→添加文献、项目→新建项目、截止倒计时→添加提醒）。
  子页里原本「开发中」的四个按钮也一并接上了真实表单。
- **自定义**：布局调整全部收进「编辑布局」按钮，见下一节「专门的布局编辑器」。
- **新增台账**：试剂效期与余量预警、仪器机时预约（带时段冲突检测）、经费支出与预算超支预警、
  截止倒计时（合并手动提醒 + 试剂效期 + 项目结题，按名称与剩余天数去重）、实验速记、最近切片。
- 卡片可被移除，因此所有写首页卡片的渲染都走 `setHTML/setText`（元素不存在时安静跳过），
  计时器 UI 的绑定改成可重复执行的 `bindTimerUI()`，由卡片 `after()` 调用。

## 数据落盘（台账不再是 mock）

以前 `DB` 只写 `localStorage`：WebView2 清一次浏览数据就全没了，也拿不到文件、无法备份迁移。
现在**磁盘为准，localStorage 只当缓存与老数据迁移来源**。

- 文件：`~/.liver_portal_crop/labkit_db.json`（与 ROI / qPCR 会话同目录，整个目录拷走即迁移；
  环境变量 `LABKIT_DB_DIR` 可覆盖目录，便于测试与便携版）。实现在 `src/store.rs`。
- **原子写**：同目录写 `.json.tmp` → `write_all` + `sync_all` → 覆盖前 `fs::copy` 留 `.json.bak` → `fs::rename`。
  中途断电或写入失败，主文件仍是上一版完整内容。
- **只接受 JSON 对象**：数组 / 标量 / null 一律拒绝，防止前端 bug 把库清空。
- **损坏自愈**：主文件解析失败自动回退 `.bak`，并把主文件修回来，不会每次启动都走回退。
- **备份**：`backups/labkit_db.<YYYYmmdd-HHMMSS>.json`；导入前、清空示例数据前都会自动备份。
- 命令：`db_load / db_save / db_info / db_backup / db_export / db_import / db_reset`（参数全用单个单词，天然避开 camelCase 坑）。
- 前端启动顺序：`await loadDBFromDisk()` → 迁移老数据 → 渲染。改动 400ms 防抖落盘，
  `beforeunload` 与页面切走时补写最后一次编辑。设置页实时显示落盘状态、路径、大小、备份份数。
- `tests/store.rs` 10 个用例覆盖：缺文件、往返、无残留 tmp、覆盖留 bak、损坏自愈、
  非法载荷拒绝、手动备份、导入先校验后落盘、导出可读、默认路径。

### 统计全部来自真实记录

删掉了写死的 `weeklyFocus / weeklyTasks` 两个数组。现在：

- `focusRecords.at` 是真实本地时间戳 `YYYY-MM-DDTHH:MM`（老数据的「今天 09:00-10:15」「周一 …」在迁移时换算）。
- `seriesFocus(n) / seriesTasks(n)` 按真实日期聚合；KPI、趋势图、热力图、报表页、CSV 导出全部由它推导。
- 任务有真实 `state`（待办 / 进行中 / 完成）与 `doneAt`；看板三列不再是硬编码「进行中 · 1」。
- 日 / 周视图按 `taskOnDay()` 分组：`每天` 天天出现，`每周五` 只在周五，普通任务按解析出的日期落位。
- 报表页不再抄 `kpiRow.innerHTML`（卡片被移除时会空白），改为独立计算，并支持 14 / 30 / 90 天切换。

### 九个子页的完整增删改

`ENT` 实体注册表统一描述 11 类记录（任务 / 项目 / 实验 / 文献 / 试剂 / 仪器 / 预约 / 经费 / 速记 / 提醒 / 专注）的
字段、落库规则与刷新动作。`entityModal(kind,i)`：`i` 为空是新建、否则编辑第 `i` 条；`entityDelete` 带二次确认。
所有表格行内都有「编辑 / 删除」，不再是只能从首页卡片新建的只读表。
项目笔记支持极简 Markdown（先转义再套标签，不当 HTML 执行）；文献可一键打开 DOI。

## 专门的布局编辑器

参考 Homarr 的 board edit mode 与 gridstack.js 的 save/restore 模型（原生实现，未引入依赖）。

- **入口**：首页工具栏「编辑布局」（快捷键 `Ctrl/Cmd + E`）。非编辑态看不到任何尺寸/移除控件。
- **事务化**：进入编辑时把布局拷成草稿 `dashDraft`，所有改动只落在草稿上并实时预览；
  必须点「保存布局」才写入 `localStorage['labkit.dash.v1']`。工具栏实时显示「编辑中 / 有未保存改动」。
- **取消**：点「取消」或按 `Esc` 原样还原到编辑前，误操作不会留在盘上。
- **添加卡片**、**恢复默认** 都在编辑态里，同样只改草稿。
- **精确设置**：每张卡片的 `⚙` 打开数值对话框（位置序号 + 宽度 + 高度），拖不准时用它。
- **键盘**：卡片可聚焦；`←/→` 排序，`Shift+←/→` 改宽，`Shift+↑/↓` 改高，`Enter` 打开精确设置，`Delete` 移除。
- **界面密度**：设置页可切紧凑 / 标准 / 宽松（行单位 128 / 152 / 176px，间距 10 / 13 / 16px），
  通过 CSS 变量 `--row / --gap` 生效，格子数不变，随台账一起落盘。

布局仍存 `localStorage['labkit.dash.v1']`，形如 `[{id,size:'2x3'}]`；
读到旧的 `s/m/l` 三档会自动映射为 `1x2 / 2x2 / 4x2`，不会丢用户已有布局。

### IPC 参数名契约（导出失败的根因）

Tauri v2 的命令宏默认 `rename_all = "camelCase"`，运行时用 `serde_json::Value::get(key)`
**精确匹配**取参，**没有 snake_case 回退**。前端曾写 `invoke('export_rois',{output_dir,mag_label})`，
命令直接报 `missing required key outputDir` —— 这就是 ROI 导出一直失败的原因。
其它命令的参数恰好都是单个单词，两种命名法长得一样，掩盖了这个坑。

`tests/ipc_args.rs` 会扫描前端所有 `invoke` 调用的**顶层**参数名，出现 snake_case 即测试失败。
（只查顶层：嵌套的 `slide_path` / `created_at` 是 serde 结构体字段，本来就该用 snake_case。）

## 构建与运行

```powershell
cd rust
cargo build --release
.\target\release\labkit.exe
```

开发时 DLL 查找顺序：环境变量 `SDPC_DLL_DIR` → exe 同目录的 `sdpc/WINDOWS/dll/` →
自动执行 `python -c "import sdpc..."` 定位 `sdpc-for-python` 安装目录。

发布时把 `<python>/Lib/site-packages/sdpc/WINDOWS/dll/` **整个目录**（含 9 个 FFmpeg 依赖 DLL）
复制到 exe 同级的 `sdpc/WINDOWS/dll/`，或运行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package.ps1
```

## 命令行（无 GPU 的验证入口）

```powershell
# 打印金字塔元数据
labkit.exe --info "D:/文件/切片.sdpc"

# 瓦片接缝 / 色差诊断 + 解码耗时基准
labkit.exe --tileprobe "D:/文件/切片.sdpc" 3

# 按 ROI JSON 批量裁切，并写出 manifest.json 供像素对比
labkit.exe --export --slide "D:/文件/切片.sdpc" --session out/rois.json --out out/rust --mag 20
```

## 导出 parity 验证

Python 参照实现已于 v0.3.0 从仓库移除（见 CHANGELOG），parity 基线改由以下方式保留：

- `cargo test` 中导出 / TIFF / 会话相关单测；
- 无头 CLI `labkit.exe --export --slide S --session rois.json --out dir --mag 20`
  逐 ROI 输出 `sha256_rgb`（`src/cli.rs`），可与任何参照实现离线对比；
- qPCR 可选 R 对数：`rust/tests/qpcr_parity/compare.R`。

对比的是解码后的 RGB 字节 SHA256，不比较 TIFF 容器字节（不同实现 Deflate 流/tag 顺序不同）。

## 行为契约

- ROI 坐标恒为 level-0 全分辨率；导出固定 `level=0`；越界时 clamp 后**缩小**裁剪框。
- 输出 `{切片名}_ROI_{文件内序号:04d}{_倍率}.tiff`，Deflate 压缩；不输出标注文件。
- 会话写 `~/.liver_portal_crop/session_rust.json`，可导入旧版 `session.json`（含 `thumb_*` 字段）。
- ROI 旋转仅作为视觉与元数据；导出按轴对齐包围盒裁切（与 Python 版一致）。
- DLL 一旦打开不调用 `SqCloseSdpc`（该 DLL 同进程关闭后重开会访问冲突）。

## qPCR 数据处理

主界面点「qPCR 分析」进入工作区（该模式不加载 SDPC DLL）。三种输入：

- 通用 CSV/TSV、Excel Cq 表：支持中英文列名（`样本/样品/sample_id`、`基因/target`、`Ct值/cq` 等），长表与宽表均可
- 仪器原始文件：ABI/Thermo `.eds`、Qiagen `.rex`、Roche `.ixo/.lc96p`、RDML（由 `openreadout-qpcr` 解析，失败时自动回退通用表解析）
- 界面内手动粘贴表格（从 Excel 直接复制即可）

算法：技术重复取均值 → ΔCt / ΔΔCt / `2^-ΔΔCt`（可选 Pfaffl 效率）→ 多参考基因 geNorm 稳定性与几何平均 → CV/SD/IQR 异常孔**标记而非删除** → 按「样本分组」输入（每行 `样本名=组名`）做 Welch t-test（2 组）与单因素 ANOVA（≥3 组），基于 ΔCt。结果导出 CSV，会话独立存于 `~/.liver_portal_crop/qpcr_session_rust.json`（分析后自动保存，启动时恢复）。ROI 标注同样自动持久化到 `session_rust.json`，导出进行中可再次点击导出按钮取消。

许可证说明：`openreadout-qpcr`（MIT OR Apache-2.0）只用于仪器文件解析；统计公式借鉴 qPCRtools（MIT）与 tidyqpcr（Apache-2.0），均为独立实现，不引入 GPL/LGPL 代码。

## 界面结构

三屏，与设计稿一致：

1. **工具箱主窗口** — 交通灯标题栏 + 毛玻璃侧边栏（工作台 / 分类导航 / 添加工具）+ 最近使用四卡 + Bento 工具宫格
2. **工具工作区** — 「左参数 / 中画布 / 右列表」三栏范式；图像裁剪与 qPCR 各一套，均接通真实 Tauri 命令
3. **设计系统页** — 色彩 / 字体 / 组件 / 间距规范 + 新增工具清单

其余工具卡（格式转换 / 批量重命名 / 正则测试 等）为扩展占位：按设计系统页的「新增工具清单」接入即可。前端在无 Tauri 运行时（直接用浏览器打开 index.html）会自动降级为本地演示模式。

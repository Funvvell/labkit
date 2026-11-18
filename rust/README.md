# 工具箱 Toolbox · Rust/Tauri 版

macOS 风格多功能工具箱（v0.2.0），由 egui 版重写而来：**UI 全部推翻重做，核心算法层原样复用**。
Python 源码原样保留在仓库根目录，可作为行为参照与回退；本目录不修改任何 Python 文件。

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
src/render/     视口变换、金字塔瓦片选择、PNG data-URL 编码（texture/tiles 去 egui 化）
src/model/      ROI、会话 JSON、撤销栈（复用）
src/export/     居中裁剪、命名、TIFF 写入（复用）
src/qpcr/       qPCR 算法：ΔCt/ΔΔCt/geNorm/QC/统计（复用）
src/commands.rs Tauri 命令层：把核心能力桥接给前端（新增）
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

## 构建与运行

```powershell
cd rust
cargo build --release
.\target\release\pathology-crop-rs.exe
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
# 打印金字塔元数据 + 缩略图 SHA256
pathology-crop-rs.exe --info "D:/文件/切片.sdpc"

# 按 ROI JSON 批量裁切，并写出 manifest.json 供像素对比
pathology-crop-rs.exe --export --slide "D:/文件/切片.sdpc" --session out/rois.json --out out/rust --mag 20
```

## 与 Python 版逐像素对比

```bash
python tests/parity/generate_rois.py --slide "D:/文件/切片.sdpc" --out out/rois.json
python tests/parity/reference_export.py --slide "D:/文件/切片.sdpc" --session out/rois.json --out out/ref --mag 20
pathology-crop-rs.exe --export --slide "D:/文件/切片.sdpc" --session out/rois.json --out out/rust --mag 20
python tests/parity/compare.py out/ref/manifest.json out/rust/manifest.json
```

对比的是解码后的 RGB 字节 SHA256，不比较 TIFF 容器字节（两版 Deflate 流/tag 顺序不同）。

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

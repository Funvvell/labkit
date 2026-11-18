# 病理裁剪工具 · Rust 版

与 Python/PySide6 版并存的 Rust 重构，仅保留 **SDPC 切片浏览 + 矩形 ROI 裁切导出**。
Python 源码原样保留在仓库根目录，可作为行为参照与回退；本目录不修改任何 Python 文件。

## 技术栈

- **GUI**：`egui 0.31` + `eframe`（Glow/OpenGL 后端，单二进制，无 Node/WebView）
- **解码**：FFI 调用 `DecodeSdpcDll.dll`（来自 `sdpc-for-python`，Windows x64 专有闭源库）
- **导出**：`tiff` + `flate2`（RGB8 / Deflate TIFF，与 Python 版 `tifffile` 像素一致）
- **线程**：单个后台解码线程独占所有 DLL 调用（DLL 非线程安全），主线程只做 UI

## 目录

```
src/sdpc/     唯一 unsafe 区：DLL 加载、GBK 路径、结构体偏移、区域解码
src/decode/   后台解码线程 + 消息通道 + 取消
src/render/   视口变换、金字塔瓦片选择、纹理 LRU
src/model/    ROI、会话 JSON、撤销栈
src/export/   居中裁剪、命名、TIFF 写入
src/ui/       egui 界面（浅色默认 + 深色切换）
tools/        字体子集、图标、结构体偏移 dump 脚本
tests/        单元测试 + parity 对比脚本
```

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

在顶栏切换到「qPCR 分析」模式即可使用（该模式不加载 SDPC DLL）。三种输入：

- 通用 CSV/TSV、Excel Cq 表：支持中英文列名（`样本/样品/sample_id`、`基因/target`、`Ct值/cq` 等），长表与宽表均可
- 仪器原始文件：ABI/Thermo `.eds`、Qiagen `.rex`、Roche `.ixo/.lc96p`、RDML（由 `openreadout-qpcr` 解析，失败时自动回退通用表解析）
- 界面内手动粘贴表格（从 Excel 直接复制即可）

算法：技术重复取均值 → ΔCt / ΔΔCt / `2^-ΔΔCt`（可选 Pfaffl 效率）→ 多参考基因 geNorm 稳定性与几何平均 → CV/SD/IQR 异常孔**标记而非删除** → Welch t-test 与单因素 ANOVA。结果表支持按fold change条件着色，右栏显示 QC 警告；结果导出 CSV 到输出目录，会话独立存于 `~/.liver_portal_crop/qpcr_session_rust.json`（不覆盖切片裁剪会话）。

许可证说明：`openreadout-qpcr`（MIT OR Apache-2.0）只用于仪器文件解析；统计公式借鉴 qPCRtools（MIT）与 tidyqpcr（Apache-2.0），均为独立实现，不引入 GPL/LGPL 代码。R 对照脚本见 `tests/qpcr_parity/compare.R`。

## 界面风格

UI 按 `yetone/magpie` 的视觉语言重构：石墨色 212px 侧栏、46px 顶栏、40px 列表行、靛蓝强调色（浅 `#4F46E5` / 深 `#A5B4FC`）、0.5px 发丝分隔线、药丸按钮与分段切换、线性 Phosphor 图标、13px 紧凑排版。主题支持浅色 / 深色 / 跟随系统三态（顶栏按钮循环切换，默认跟随系统）；切片画布保持固定深底以确保 ROI 在 H&E 图像上清晰。面板与 Toast 有 0.24s 淡入，画布交互不加动画。

## 快捷键

`Space` 放置 ROI · `Del` 删除 · `Ctrl+Z/Y` 撤销重做 · `Ctrl+A` 全选 · `Ctrl+D` 复制 ·
`N/P` 切换 ROI · `F/Home` 适配 · 滚轮以鼠标为中心缩放 · 左键拖拽平移 / 拖动 ROI ·
`Ctrl+点击` 多选 · 双击列表精确编辑。

<div align="center">

<img src="icon.svg" width="96" height="96" alt="Logo" />

# 科研工具箱 LabKit

**LabKit · Research Toolbox**

科研工作台 · SDPC 全切片浏览与 ROI 裁剪 · qPCR ΔΔCt 分析 · 任务/实验/文献管理

> 桌面版为 `rust/` 下的 Tauri + Rust 应用（产品名「科研工具箱 LabKit」，可执行文件 `labkit.exe`）。
> 根目录的 `liver_portal_crop/` 是功能等价的 Python/PySide6 实现，作为算法参照与备用版本保留。

[![Release](https://img.shields.io/github/v/release/Funvvell/pathology-crop-tool?style=flat-square&label=Latest)](https://github.com/Funvvell/pathology-crop-tool/releases)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python&logoColor=white)](pyproject.toml)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows)](#)

[快速开始](#-快速开始) · [功能特性](#-功能特性) · [架构设计](#-架构设计) · [开发指南](#-开发指南)

</div>

---

## ✨ 功能特性

<table>
<tr>
<td width="50%" valign="top">

### 🔬 WSI 金字塔浏览

- 基于 QGraphicsView 的金字塔渲染引擎
- 支持超大切片（120,000 × 80,000+ px）
- LRU Tile 缓存（512 张），按需加载
- 导航缩略图实时定位 + 点击跳转
- 滚轮自动切换金字塔层级

</td>
<td width="50%" valign="top">

### ✏️ ROI 标注与管理

- 浮动框跟随鼠标，空格键快速创建
- 八方向缩放手柄拖拽调整
- 倍率 / 视野比例自动计算像素尺寸
- 右侧面板实时同步坐标，精确编辑
- ROI 角度旋转支持

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🧬 组织区域检测

- HistoKit 三通道 Otsu 阈值算法
- 形态学处理：开/闭运算、孔洞填充、碎片移除
- **网格模式** — 组织区域内均匀生成 ROI
- **连通域模式** — 按区域大小排序生成
- 实时参数预览

</td>
<td width="50%" valign="top">

### 🎯 IHC 阳性热点检测

- Ruifrok & Johnston 色彩反卷积（H-DAB / H-AEC / H-E）
- OD 查找表预计算加速
- 分块 tile 读取，峰值内存 ~100 MB
- 滑动窗口密度图 + Top-N 峰值提取
- 组织覆盖率 ≥ 50% 自动过滤

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🤖 DeepLIIF AI 分析

- 本地 PyTorch + 云端 API 双模式推理
- GPU (CUDA) 自动检测与加速
- 交互式阈值调整 + 评分表格
- ROI 选择与参数配置对话框

</td>
<td width="50%" valign="top">

### 🔗 ImageJ / Fiji 桥接

- numpy ↔ ImageJ2 双向无损转换
- GUI 可视化调参 + 参数自动捕获
- 无头批处理复现操作流程
- 测量结果批量导出 CSV

</td>
</tr>
</table>

### 📦 批量导出

- 全分辨率坐标映射 → 居中裁剪 → TIFF（zlib 压缩）
- QThread 后台运行，实时进度条，支持中断
- 复用已有 reader 对象，避免 DLL 死锁
- ROI 预览对话框 — 缩略图网格 + 选择性导出

### 🏷️ 标签图 OCR 重命名

- 菜单「文件 → 按标签图 OCR 重命名...」批量读取内嵌标签图文字
- 可配置正则提取病例号等字段 → 预览表勾选确认后改磁盘文件名
- 基于开源 [RapidOCR](https://github.com/RapidAI/RapidOCR)（Apache-2.0，ONNX 离线）
- 可选依赖：`pip install -e ".[ocr]"`（或 `pip install -r requirements-ocr.txt`）

### 🧪 NASH / NAS 定量评分

- 内置 Boehringer Ingelheim 公开权重的推理管线：气球样变 / 炎症 / 脂肪变 / 纤维化四项连续分 → Kleiner 离散分 → NAS
- **按物理分辨率取 tile**（NAS 三项 299×299 @ 0.44 µm/px，纤维化 @ 1.32 µm/px），自动选最省时的金字塔层级，误差 < 1%
- 阈值滑杆实时改离散分级（只重算映射，不重跑推理，~40ms）
- Grad-CAM 激活热图叠加到 WSI 画布；tile 级空间分布表
- 模型槽位可插拔：换染色 / 换物种只需放一套权重 + `model.json`，不改代码
- **一键安装**：从 OSF 下载权重（断点续传 + MD5 校验）→ 解压 → 转 ONNX → 校验登记；也可只用命令行 `cli install`
- 导出上游兼容 CSV（可直接与论文表格对照）+ 扩展 CSV + 逐 tile 明细 + manifest
- 可选依赖：`pip install -e ".[nash]"`（权重需另配，见 [docs/nash-model-setup.md](docs/nash-model-setup.md)）

> ⚠️ 内置权重训练于**小鼠/大鼠肝 + Masson 三色**，在人肝或 H&E / IHC 切片上分数不具可解释性。结果仅供研究用定量参考，不构成诊断依据。

### 🎨 专业 UI

- 「临床仪器面板」v3 主题：深色 / 浅色一键切换
- 五级表面层级（window → panel → raised → surface → line）+ 完整 hover / pressed / focus / disabled 状态
- 系统蓝 `#0A84FF` 为主强调；H&E 玫瑰 `#FF4D6D` 用于区块刻度与 ROI 列表选中
- 表格 / 表头 / 进度胶囊 / 危险软填充按钮统一 token，对比度满足正文 4.5:1
- 参考 [PyQt-Fluent-Widgets](https://github.com/zhiyiYo/PyQt-Fluent-Widgets) / [napari](https://github.com/napari/napari) / [qt-material](https://github.com/dunderlab/qt-material) 开源项目优化
- PyInstaller 单文件打包（~200 MB）
- 自定义 SVG 图标，多分辨率渲染

---

## 🚀 快速开始

### 环境要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10 / 11 |
| Python | ≥ 3.10 |
| VC++ Runtime | [下载](https://aka.ms/vs/17/release/vc_redist.x64.exe) |

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/Funvvell/pathology-crop-tool.git
cd pathology-crop-tool

# 安装核心依赖（浏览 / 裁剪 / 组织检测 / IHC 热点）
pip install -e .

# [可选] 安装 AI 功能依赖（DeepLIIF 推理，~5GB）
pip install -e ".[ai]"

# [可选] 安装标签图 OCR 重命名依赖（RapidOCR + ONNX Runtime）
pip install -e ".[ocr]"

# [可选] 安装 NASH/NAS 评分依赖（ONNX Runtime，~50MB；权重需另配）
pip install -e ".[nash]"

# 启动
python main.py
```

### 打包为独立 exe

```bash
pip install pyinstaller
pyinstaller build.spec
# → dist/病理裁剪工具.exe
```

> [!TIP]
> 也可以直接从 [Releases](https://github.com/Funvvell/pathology-crop-tool/releases) 下载预编译的 exe 文件。

### 基本操作

```
打开 SDPC 文件 → 滚轮缩放浏览 → 空格键创建 ROI → 批量/队列导出 TIFF
```

| 快捷键 | 功能 |
|:------:|------|
| `Space` | 创建 ROI / 切换 ROI 模式 |
| `Delete` | 删除选中的 ROI（可多选） |
| `Ctrl+Z` / `Ctrl+Y` | ROI 撤销 / 重做 |
| `Ctrl+C` / `Ctrl+D` | 复制选中 ROI |
| `Ctrl+A` | 全选当前切片 ROI |
| `N` / `Ctrl+→` | 下一个 ROI（居中显示） |
| `P` / `Ctrl+←` | 上一个 ROI |
| `Ctrl+PgDn` / `Ctrl+↓` | 下一个切片文件 |
| `Ctrl+PgUp` / `Ctrl+↑` | 上一个切片文件 |
| `F` | 适配选中 ROI 视野 |
| `Home` | 适配整张切片 |
| 滚轮 | 缩放 WSI 视图 |
| 左键拖拽 | 平移浏览 / 拖拽 ROI |
| `Ctrl+点击` | 多选 ROI |
| 右键拖拽 | 旋转视图角度 |
| 双击 ROI 列表项 | 精确编辑 x/y/w/h/角度 |

### 导出队列

工具栏「导出队列」可将各切片的 ROI 按文件排队导出：逐任务进度、取消、失败重试、结束汇总。原有「批量导出」一键全量路径保持不变。

---

## 🏗️ 架构设计

### 项目结构

```
pathology-crop-tool/
├── main.py                            # 入口点 · 日志 · 主题加载
├── build.spec                         # PyInstaller 打包配置
├── pyproject.toml                     # 元数据与依赖
│
├── liver_portal_crop/
│   ├── app.py                         # MainWindow — 主窗口编排
│   ├── canvas.py                      # WSICanvas — 金字塔渲染 + ROI
│   ├── reader.py                      # SDPCReader — ctypes DLL 封装
│   ├── roi.py                         # ROIModel + ROIManager
│   ├── roi_undo.py                    # ROI 撤销/重做命令栈
│   ├── roi_edit_dialog.py             # ROI 坐标精确编辑
│   ├── exporter.py                    # BatchExporter — 批量 TIFF 导出
│   ├── export_queue.py                # 按文件导出队列（进度/重试）
│   ├── export_queue_dialog.py         # 导出队列 UI
│   ├── label_ocr_rename.py            # 标签 OCR → 重命名计划（纯逻辑）
│   ├── label_ocr_rename_dialog.py     # OCR 重命名预览确认 UI
│   ├── tissue_detect.py               # HistoKit Otsu 组织检测
│   ├── ihc_hotspot.py                 # IHC 热点检测算法 + UI
│   ├── deepliif_runner.py             # DeepLIIF 推理引擎
│   ├── analysis_dialog.py             # DeepLIIF 参数对话框
│   ├── results_viewer.py              # DeepLIIF 结果浏览器
│   ├── preview_dialog.py              # ROI 预览 · 选择性导出
│   ├── imagej_bridge.py               # ImageJ/Fiji 桥接
│   ├── navigator.py                   # 缩略图导航
│   ├── utils.py                       # 坐标映射工具
│   ├── constants.py                   # 全局常量
│   ├── theme.py / theme.qss           # 主题系统
│   │
│   └── controllers/
│       ├── base.py                    # BaseController 基类
│       ├── file_controller.py         # 文件管理
│       ├── roi_controller.py          # ROI 生命周期
│       ├── preset_controller.py       # 预设存储
│       └── export_controller.py       # 导出编排
│
└── tests/
    ├── test_roi.py                    # ROI 数据模型测试
    ├── test_roi_undo.py               # 撤销/重做栈测试
    ├── test_utils.py                  # 坐标映射测试
    ├── test_exporter.py               # 导出功能测试
    ├── test_export_queue.py           # 导出队列状态机测试
    └── test_ihc_hotspot.py            # IHC 算法完整测试
```

### 控制器架构

主窗口采用 **Controller 模式**，将领域逻辑委托给独立控制器：

```
                    ┌─────────────┐
                    │  MainWindow │  中央协调器
                    │   (app.py)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──┐  ┌─────▼──────┐  ┌──▼───────────┐
    │     File   │  │    ROI     │  │   Export     │
    │ Controller │  │ Controller │  │  Controller  │
    └────────────┘  └────────────┘  └──────────────┘
                           │
                  ┌────────▼────────┐
                  │    Preset       │
                  │   Controller    │
                  └─────────────────┘
```

各控制器共享 `app` / `canvas` / `roi_manager` / `readers` 等属性，实现松耦合协作。

### 关键流程

<details>
<summary><strong>ROI 生成 → 导出</strong></summary>

```
用户操作                          代码路径
──────────────────────────────────────────────────────────────
打开 SDPC 文件        →   app._add_files → SDPCReader
浏览切片              →   WSICanvas.load_slide → 金字塔 tile 渲染
切换 ROI 模式         →   set_roi_mode(True) → 浮动框
空格创建 ROI          →   _place_roi_at_frame → ROIController → ROIManager
组织检测自动生成      →   TissueDialog → detect_tissue → ROIManager
IHC 热点检测          →   IHCHotspotDialog → detect_ihc_hotspots_tiled
预览选择性导出        →   ROIPreviewDialog → ExportController.run_export
批量导出 TIFF         →   BatchExporter → QThread → tifffile.imwrite
```

</details>

<details>
<summary><strong>IHC 热点检测流水线</strong></summary>

```
IHCHotspotDialog（参数配置）
  │
  ▼ detect_ihc_hotspots_tiled（QThread 后台）
  │
  ├─ Phase 0  _get_tissue_tile_set
  │           组织区域 tile 集合 + 缩略图掩膜
  │
  ├─ Phase 1  Tile-by-tile 色彩反卷积
  │           OD LUT 预计算 → DAB 通道提取 → 阳性掩膜
  │
  ├─ Phase 2  阳性信号累积
  │           逐 tile 阳性像素 → 全局降采样掩膜（~17 MB）
  │
  ├─ Phase 3  compute_density_map + find_hotspots
  │           滑动窗口密度图 → Top-N 峰值检测
  │
  └─ Phase 4  _filter_hotspots_by_tissue_coverage
              组织覆盖率 ≥ 50% → 生成 ROI
```

</details>

<details>
<summary><strong>金字塔渲染</strong></summary>

```
_resizeEvent / _mouseRelease
  │
  ▼ _render_timer (200ms debounce)
  │
  ▼ _render_visible_tiles
    ├─ _get_best_level  →  根据缩放比选金字塔层级
    ├─ 分 tile (1024×1024) 读取
    └─ LRU Cache  →  QGraphicsPixmapItem 放置场景
```

</details>

---

## 📊 技术栈

| 组件 | 版本 | 用途 |
|------|:----:|------|
| **PySide6** | ≥ 6.6 | Qt6 GUI 框架 |
| **sdpc-for-python** | ≥ 1.0 | SDPC 格式解析（ctypes → DecodeSdpcDll.dll） |
| **numpy** | ≥ 1.24 | 图像数据处理 |
| **scipy** | ≥ 1.10 | 形态学运算 · 峰值检测 |
| **scikit-image** | ≥ 0.21 | 图像 resize · 连通域分析 |
| **tifffile** | ≥ 2024 | BigTIFF 写入（zlib） |
| **Pillow** | ≥ 10 | 图像格式转换 |
| **opencv-python** | — | 连通域标记 · 图像缩放 |
| **torch** | ≥ 2.0 | DeepLIIF 深度学习推理 |
| **deepliif** | ≥ 1.2.6 | DeepLIIF 模型推理引擎 |

---

## 🧪 开发指南

### 运行测试

```bash
# 基础单元测试
pytest tests/test_roi.py tests/test_utils.py tests/test_exporter.py

# IHC 热点检测算法测试（mock DLL，无需实际 SDPC 文件）
python tests/test_ihc_hotspot.py
```

IHC 测试覆盖：色彩反卷积正确性 · 阈值判定 · 密度图计算 · Top-N 热点提取 · 分块处理流水线 · 组织覆盖率过滤 · 染色矩阵标签。

### 模块可测试性

| 模块 | 职责 | 独立测试 |
|------|------|:--------:|
| `reader.py` | ctypes DLL 读取 SDPC 金字塔 | ⚠️ 需 DLL |
| `canvas.py` | WSI 渲染 + ROI 标注 | ⚠️ 需 Qt |
| `app.py` | 主窗口编排 | ⚠️ 需 Qt |
| `roi.py` | ROI 数据模型 + JSON 序列化 | ✅ |
| `exporter.py` | 批量 TIFF 导出 | ✅ |
| `tissue_detect.py` | HistoKit Otsu 组织检测 | ✅ |
| `ihc_hotspot.py` | IHC 热点检测算法 | ✅ mock DLL |
| `deepliif_runner.py` | DeepLIIF 推理 | ⚠️ 需模型 |
| `nash/tiling.py` / `sampler.py` / `scoring.py` | tile 采样与评分（纯逻辑） | ✅ |
| `nash/engine.py` | ONNX 推理 | ⚠️ 需模型 |
| `nash/gradcam.py` | 激活热图 | ✅ |
| `imagej_bridge.py` | ImageJ/Fiji 桥接 | ⚠️ 需 JVM |
| `utils.py` | 坐标映射 | ✅ |

### 日志

打包后的 exe 运行日志写入用户主目录：

```
%USERPROFILE%\pathology-crop-tool.log
```

如遇问题可查看该文件进行诊断。

---

## 📋 更新日志

### v0.9.1 — NASH 权重一键安装

**新增**

- `分析 → NASH 一键安装…`：官方权重从 OSF 自动下载（支持 Range 断点续传、MD5 逐字节校验）、解压、转 ONNX、校验登记
- 按评分项自由勾选（全选约 6.5 GB，例如只做纤维化仅 1.2 GB）；实时显示磁盘可用与预计占用，空间不足时禁用开始
- 转换依赖（TensorFlow）缺失时会先询问；选「只下载」可稍后在有 TF 的机器上补转换
- 复用当前解释器执行 `pip install onnxruntime`（多 Python 环境不会装错位置）
- 命令行：`python -m liver_portal_crop.nash.cli install [--yes] [--scores ...] [--skip-convert] [--purge]`
- `nash/convert.py`：`.h5 → ONNX` 转换逻辑抽出复用，`tools/export_onnx.py` 改为调用它（不再有第二份实现）

**修复**

- `NASHEnvDialog` 的键值表格原先只分到 30px 高，模型目录与缺失文件被藏进滚动区；改用表单布局
- 依赖缺失时按钮不再禁用变灰，改为可点击并弹出环境自检（含绑定当前解释器的安装命令）

### v0.9.0 — NASH/NAS 定量评分 + 分析叠加层修复

**新增：NASH / NAS 评分**

- `liver_portal_crop/nash/` 子包：模型槽位注册表、tile 几何采样、ONNX 推理、评分后处理、Grad-CAM、Worker 线程、配置对话框、结果查看器、导出
- 按物理分辨率采样（0.44 / 1.32 µm/px），自动选金字塔层级，精度自检误差 < 1%，mpp 缺失时降级为假设值并全程标注
- 四项评分 → 切片级聚合（合并 tile 后 `nanmean`，与上游一致）→ 阈值映射离散分 → NAS
- 阈值滑杆实时重算（不重跑推理）+ 用户阈值持久化到 `*_thresholds.user.json`
- 导出：上游兼容 CSV / 扩展 CSV / 逐 tile 明细 / manifest，编码 `utf-8-sig`
- 无 GUI 入口 `python -m liver_portal_crop.nash.cli {verify,info,tiles,score}`
- 新增可选 extra `[nash]`（onnxruntime）

**修复**

- `canvas.py` 补齐 `add_overlay` / `set_overlay_opacity` / `clear_overlays` 三个方法 —— 此前 `app.py` 调用它们却不存在，点「叠加到画布」必崩 `AttributeError`
- 换片时叠加层清理移到 `_scene.clear()` 之前，消除悬垂包装器导致的崩溃
- 小块测试结果窗口漏接 `overlay_requested` 信号，导致「叠加到画布」无反应
- 「清除分析叠加」按钮可见性改由 `canvas.overlays_changed` 驱动，不再手动同步

**依赖与工程**

- `opencv-python` 由隐式依赖改为显式核心依赖（组织检测与 IHC 热点在模块级 import cv2）
- `tests/test_ihc_hotspot.py` 的模块 mock 改为用完即恢复，不再污染同进程后续测试
- 新增 145 个测试（总计 226）

### Unreleased — 导出队列 + 标注体验 + 标签 OCR 重命名

**标签 OCR 重命名**

- 「文件 → 按标签图 OCR 重命名」：批量 OCR 标签图，正则提取后预览确认改名
- 可选依赖 extra `[ocr]`；批内交换名两阶段落盘；与手工重命名共用状态同步语义
- 打包限制：PyInstaller 单文件需自行验证 rapidocr 模型随包路径（源码/pip 运行为准）

**导出队列**

- 新增 GUI 内导出队列：按切片文件排队、逐项进度、取消、失败重试、结果汇总
- 原「批量导出」一键全量路径保留

**ROI 标注体验**

- 撤销/重做（Ctrl+Z / Ctrl+Y），批量删除/复制/清空作为单步
- ROI 列表多选与画布 Ctrl+点击双向同步；批量删除/复制
- 快捷键扩展：N/P 导航 ROI、切换文件、F/Home 适配视野、Ctrl+A/C/D
- 双击列表精确编辑坐标；选中 ROI 信息面板（坐标/尺寸/µm）

**代码质量**

- 导航缩略图 QImage `.copy()`，避免悬垂引用
- 预设读写失败写入诊断日志
- 主题资源 `package-data` 随包分发；AI 依赖拆分为可选 extra

### v0.8.1 — Code Review 修复版

**线程安全**

- 导出取消标志改用 `threading.Event`，消除跨线程竞态
- IHC 热点检测取消标志同步改用 `threading.Event`

**异常处理**

- `reader.py` 8 处静默 `except: pass` 添加诊断日志
- `canvas.py` tile 加载失败添加 `logger.debug`
- `roi.py` `from_json` 添加容错处理，损坏 JSON 不再崩溃

**性能与健壮性**

- `QImage` 构造后添加 `.copy()`，防止 numpy 缓冲区释放后崩溃
- IHC 热点 NMS 改用欧氏距离（圆形排除区），替代切比雪夫距离
- 导出 `local_idx` 改用预计算 dict，O(N²) → O(1)
- `closeEvent` 添加 `wait(3000)` 等待线程退出

**依赖管理**

- `torch` / `torchvision` / `deepliif` 改为可选依赖（`pip install -e ".[ai]"`）
- 核心安装减少约 5GB 下载量

### v0.8.0

- 新增标签图（macrograph）常驻显示 + 旋转控制
- 新增切片元数据对话框（PicHead / PersonInfo / ExtraInfo）
- `reader.py` 扩展：metadata 属性、macrograph 读取
- 主题系统升级（v2 圆角 / 配色 / hover 状态）

---

## 🧭 Rust / Tauri 版（活跃开发）

仓库根的 Python/PySide6 版本保留作行为参照与回退；当前活跃开发的是 **Rust + Tauri 工具箱**（`rust/` + `frontend/index.html`）：

- SDPC 解码 / ROI 裁剪 / TIFF 导出与 Python 版逐像素一致（parity 验证工具链见 `rust/tests/parity/`）
- 内置 qPCR 数据分析工作区（ΔΔCt / geNorm / QC / Welch t / ANOVA）
- 构建运行：`cd rust && cargo build --release`，详见 [`rust/README.md`](rust/README.md)

---

## 📄 许可

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star！**

[Report Bug](https://github.com/Funvvell/pathology-crop-tool/issues) · [Request Feature](https://github.com/Funvvell/pathology-crop-tool/issues) · [Download Latest](https://github.com/Funvvell/pathology-crop-tool/releases)

</div>

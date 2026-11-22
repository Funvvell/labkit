# NOTICE — 第三方开源组件署名

LabKit（MIT）复用以下成熟开源项目。除注明外均以原样或最小适配形式集成，源码见 `frontend/vendor/`、`frontend/tools/lib/` 与 `tools/upstream/`。

## Apache License 2.0
- **stdlib-js**（统计子集：ttest/ttest2/chi2test/bartlett-test/wilcoxon/ranks/分布 CDF）
  Copyright (c) The Stdlib Authors. https://github.com/stdlib-js/stdlib
  打包产物 `frontend/vendor/stdlib-stats.bundle.js` 内保留原始许可注释（esbuild legalComments:inline）。
- **HistomicsTK**（病理图像算法参考，Apache-2.0）https://github.com/DigitalSlideArchive/HistomicsTK

## BSD License
- **Biopython**（Bio.SeqUtils.MeltingTemp，BSD 3-Clause）
  Copyright (c) Biopython contributors. https://biopython.org
  移植：`frontend/tools/lib/melting-temp.js`，保留原始版权头。
- **SciPy**（scipy.stats._mannwhitneyu，BSD 3-Clause）
  Copyright (c) SciPy Developers. https://scipy.org
  移植：`frontend/tools/lib/scipy-mwu.js`，保留原始版权头。
- **arquero**（BSD 3-Clause）Copyright (c) UW Interactive Data Lab. https://github.com/uwdata/arquero

## MIT License
- **PapaParse** Copyright (c) Matthew Holt. https://github.com/mholt/PapaParse
- **SheetJS (xlsx)** Copyright (c) SheetJS LLC. https://github.com/SheetJS/sheetjs
- **Tabulator** Copyright (c) Oli Folkerd. https://github.com/olifolkerd/tabulator
- **markdown-it** Copyright (c) Vitaly Puzrin, Alex Kocharin. https://github.com/markdown-it/markdown-it
- **markdown-table** Copyright (c) Titus Wormer. https://github.com/wooorm/markdown-table
- **easytimer.js** Copyright (c) Albert González. https://github.com/albert-gonzalez/easytimer.js
- **Plotly.js** Copyright (c) Plotly, Inc. https://github.com/plotly/plotly.js
- **fabric.js** Copyright (c) Juriy Zaytsev (kangax). https://github.com/fabricjs/fabric.js
- **seedrandom** Copyright (c) David Bau. https://github.com/davidbau/seedrandom
- **tableone (Python)** Copyright (c) Alistair Johnson. https://github.com/alistairewj/tableone
  移植：`frontend/tools/lib/tableone.js`
- **randomizr (R)** Copyright (c) DeclareDesign. https://github.com/DeclareDesign/randomizr
  移植：`frontend/tools/lib/randomizr.js`
- **Mixology** Copyright (c) Theo Sanderson. https://github.com/theosanderson/mixology
  移植：`frontend/tools/lib/mixology.js`（常用试剂摩尔质量子集）
- **PlateEditor** Copyright (c) vindelorme. https://github.com/vindelorme/PlateEditor
  纯数据模型移植：`frontend/tools/lib/plate-model.js`（Plate/Layer/Well/Area/Range/Definition），上游源码存 `tools/upstream/plateeditor/`。
- **InvenTree** Copyright (c) InvenTree. https://github.com/inventree/InvenTree
  台账 schema 参照 + 可选 REST API 对接（`frontend/tools/inventory.js`），不内嵌其代码。
- **gridstack.js** Copyright (c) 2019-2026 Alain Dumesny（v0.4.0 及更早 (c) 2014-2018 Pavel Reznikov, Dylan Weiss）. https://github.com/gridstack/gridstack.js
  P2 Dashboard 自由拼接网格：`frontend/vendor/gridstack-all.js` + `gridstack.min.css`（v14.1.1，UMD 原样引入），许可文本 `frontend/vendor/gridstack-LICENSE.txt`。

## MIT / Apache-2.0 双许可（Rust crates）
- **wsi-rs** Copyright (c) wsi-rs contributors. https://github.com/wsi-rs/wsi-rs — 纯 Rust 全切片读取器
  （SVS / NDPI / MRXS / SCN / BIF / AVS / VMS / VSI / CZI / DICOM / OME-TIFF），`rust/src/slide/mod.rs` 的统一读取层。
- **png** Copyright (c) png-rs contributors. https://github.com/image-rs/image-png — 导出 PNG 与 pHYs（DPI）标签。
- **j2k / j2k-native** (MIT OR Apache-2.0) — NDPI / DICOM 的 JPEG 2000 码流解码（经 wsi-rs 调用）。
- **jxr / jxr-native** (MIT OR Apache-2.0) — Zeiss CZI 的 JPEG XR 码流解码（经 wsi-rs 调用）。
- **zip** Copyright (c) zip-rs contributors. https://github.com/zip-rs/zip2 — 解包 SDPC wheel（仅首次下载时使用）。
- **image** Copyright (c) PistonDevelopers. https://github.com/image-rs/image — D3 图片批处理编解码/缩放。
- **rayon** Copyright (c) Niko Matsakis. https://github.com/rayon-rs/rayon — D3 并行批处理。
- **tiff** Copyright (c) PistonDevelopers. https://github.com/image-rs/image-tiff — TIFF IFD/DPI 标签读写。
- **tauri-plugin-notification** Copyright (c) Tauri Programme. https://github.com/tauri-apps/plugins-workspace — C6 效期系统通知。
- **tauri-plugin-window-state** Copyright (c) Tauri Programme. https://github.com/tauri-apps/plugins-workspace — P1 工具窗口尺寸/位置记忆。
- **reqwest** Copyright (c) Sean McArthur. https://github.com/seanmonstar/reqwest — P3 Zotero 本地 API / P4 插件市场的 Rust 侧 HTTP 客户端（rustls）。
- **url** Copyright (c) Servo contributors. https://github.com/servo/rust-url — P3 附件 file:// 重定向解析。
- **yaml-rust2** Copyright (c) Ethiraric, David Aguilar 等. https://github.com/Ethiraric/yaml-rust2
  — Markdown Vault 的 YAML frontmatter 解析（`rust/src/vault.rs`）。选它是因为 serde_yaml 上游已归档、
  serde_yaml_ng / serde_norway 停更于 2024 年、serde_yml 因 unsoundness 废弃，yaml-rust2 是唯一活跃维护的
  YAML 1.2 实现。传递依赖 **arraydeque**（MIT/Apache-2.0）、**hashlink**（MIT/Apache-2.0）、
  **encoding_rs**（Apache-2.0/MIT，本项目已直接依赖）。
- **calamine** Copyright (c) Thomas Jarosch 等. https://github.com/tafia/calamine
  — qPCR Excel（xlsx/xls）读取（`rust/src/qpcr/io_excel.rs`）。
- **openreadout-qpcr / openreadout-core** Copyright (c) OpenReadout contributors.
  https://github.com/openreadout/openreadout — qPCR 仪器文件解析（.eds/.rex/.ixo/RDML，`rust/src/qpcr/io_instrument.rs`）。
  **本地补丁副本** `rust/vendor/openreadout-qpcr/`（v0.4.0，仅把 calamine 0.36 → 0.38 以修复 zip 安全公告），
  双许可原文随源码保留；上游发布含同等升级的新版后应删除该补丁并回归 crates.io。

## SIL Open Font License 1.1（本地打包字体）
- **Inter** Copyright (c) The Inter Project Authors (rsms). https://github.com/rsms/inter
  变量字体子集 `frontend/fonts/InterVariable.woff2`（v4.1.0，经官方 npm 包 `inter-ui` 获取）。
- **JetBrains Mono** Copyright (c) JetBrains s.r.o. https://github.com/JetBrains/JetBrainsMono
  子集 `frontend/fonts/JetBrainsMono-{Regular,Bold}.woff2`（v2.304）。
  两者由 `tools/font-build/build_fonts.py` 子集化（拉丁/希腊/数学符号，不含 CJK），
  许可原文随附 `frontend/fonts/*-OFL.txt`，来源与 sha256 见 `frontend/fonts/manifest.json`。
  中文不打包，走系统字体（Microsoft YaHei UI / PingFang SC），避开微软字体再分发限制。

## ISC License
- **simple-statistics** Copyright (c) Tom MacWright. https://github.com/simple-statistics/simple-statistics

## 公有领域 / Public Domain
- **OpenEpi MartinStats**（David O. Martin）— 源码声明 released to the public domain。
- **ImageJ**（Wayne Rasband）— 公有领域（算法参考）。
- **Fisher 精确概率法（B3）** — 教科书超几何分布直接求和实现（`frontend/tools/lib/stats-engine.js`），
  在 `tests/js/stats.test.mjs` 中与精确组合分数及 OpenEpi/scipy 口径对数。
- **F 分布 CDF / 不完全 Beta 函数（B2）** — Numerical Recipes 标准连分式算法实现（`frontend/tools/lib/tableone.js`）。

## 其他许可
- **OpenEpi**（www.openepi.com，Kevin M. Sullivan / Andrew G. Dean 等）— **MIT License**（官方许可声明：
  https://openepi.com/Documentation/ToolkitDoc.htm ）；
  `frontend/vendor/openepi/` 逐字保留上游源码，仅外包 IIFE 隔离（`tools/vendor-build/wrap-openepi.mjs`）。
  其中 MartinStats 模块另声明公有领域（见上）。
  引用：Dean AG, Sullivan KM, Soe MM. OpenEpi: Open Source Epidemiologic Statistics for Public Health. www.openepi.com.
- **sdpc-for-python / sdpc-win**（JWonderLand / Jiawen Li 等，https://pypi.org/project/sdpc-for-python/ ）—
  Python 包装层 PyPI 元数据声明 MIT；**其内嵌的 `DecodeSdpcDll.dll` 为扫描仪厂商专有闭源二进制，
  无独立开源许可文本覆盖，本仓库与 Release 安装包均不分发该 DLL**。
  应用在首次打开 `.sdpc` 时从 PyPI 官方包自动下载 wheel、校验 SHA-256，仅解出 `WINDOWS/dll`
  到用户缓存（`rust/src/sdpc/download.rs`）；也可用 `SDPC_DLL_DIR` 指向本地副本。不再需要 `pip install`。
- **PRISMA 2020** 清单 — CC-BY 4.0。Page MJ, et al. BMJ 2021;372:n71. https://www.prisma-statement.org
- **STROBE / CONSORT / MIQE** 清单条目 — 依各自声明用于学术自查工具，保留出处链接。

完整许可文本见 `frontend/vendor/LICENSES.md`。
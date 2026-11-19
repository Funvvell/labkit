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

## MIT / Apache-2.0 双许可（Rust crates）
- **image** Copyright (c) PistonDevelopers. https://github.com/image-rs/image — D3 图片批处理编解码/缩放。
- **rayon** Copyright (c) Niko Matsakis. https://github.com/rayon-rs/rayon — D3 并行批处理。
- **tiff** Copyright (c) PistonDevelopers. https://github.com/image-rs/image-tiff — TIFF IFD/DPI 标签读写。
- **tauri-plugin-notification** Copyright (c) Tauri Programme. https://github.com/tauri-apps/plugins-workspace — C6 效期系统通知。

## ISC License
- **simple-statistics** Copyright (c) Tom MacWright. https://github.com/simple-statistics/simple-statistics

## 公有领域 / Public Domain
- **OpenEpi MartinStats**（David O. Martin）— 源码声明 released to the public domain。
- **ImageJ**（Wayne Rasband）— 公有领域（算法参考）。
- **Fisher 精确概率法（B3）** — 教科书超几何分布直接求和实现（`frontend/tools/lib/stats-engine.js`），
  在 `tests/js/stats.test.mjs` 中与精确组合分数及 OpenEpi/scipy 口径对数。
- **F 分布 CDF / 不完全 Beta 函数（B2）** — Numerical Recipes 标准连分式算法实现（`frontend/tools/lib/tableone.js`）。

## 其他许可
- **OpenEpi**（www.openepi.com，Kevin M. Sullivan / Andrew G. Dean 等）— 开源发布；
  `frontend/vendor/openepi/` 逐字保留上游源码，仅外包 IIFE 隔离（`tools/vendor-build/wrap-openepi.mjs`）。
  引用：Dean AG, Sullivan KM, Soe MM. OpenEpi: Open Source Epidemiologic Statistics for Public Health. www.openepi.com.
- **PRISMA 2020** 清单 — CC-BY 4.0。Page MJ, et al. BMJ 2021;372:n71. https://www.prisma-statement.org
- **STROBE / CONSORT / MIQE** 清单条目 — 依各自声明用于学术自查工具，保留出处链接。

完整许可文本见 `frontend/vendor/LICENSES.md`。
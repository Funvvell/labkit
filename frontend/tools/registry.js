// LabKit 工具注册表：工具库页面与按需加载器读取此表。
// scripts 按顺序动态注入（相对 frontend/ 根）；工具脚本加载后须注册 window.LabKitTools[id] = function(host){...}
window.TOOL_META = [
  // ---- B 统计与数据 ----
  { id: 'epi2x2', name: '2×2 表分析', tag: 'B4', group: '统计与数据', desc: 'OR/RR、Woolf CI、Fisher 精确、MH 分层、趋势检验（OpenEpi 原样复用）',
    scripts: ['vendor/openepi/openepi-shim.js','vendor/openepi/StatFunctions1.js','vendor/openepi/OECommands.js','vendor/openepi/MartinStats.js','vendor/openepi/modules/TwobyTwo.js','tools/lib/openepi-adapter.js','tools/epi2x2.js'] },
  { id: 'samplesize', name: '样本量与功效', tag: 'B5', group: '统计与数据', desc: '率/均数/病例对照/队列样本量，RCT/交叉/队列功效（OpenEpi 原样复用）',
    scripts: ['vendor/openepi/openepi-shim.js','vendor/openepi/StatFunctions1.js','vendor/openepi/OECommands.js','vendor/openepi/MartinStats.js','vendor/openepi/modules/SSPropor.js','vendor/openepi/modules/SSCC.js','vendor/openepi/modules/SSCohort.js','vendor/openepi/modules/SSMean.js','vendor/openepi/modules/PowerCC.js','vendor/openepi/modules/PowerCohort.js','vendor/openepi/modules/PowerRCT.js','vendor/openepi/modules/PowerCross.js','vendor/openepi/modules/PowerMean.js','tools/lib/openepi-adapter.js','tools/samplesize.js'] },
  { id: 'tests', name: '快速假设检验', tag: 'B3', group: '统计与数据', desc: 't/χ²/Fisher/Mann-Whitney/Wilcoxon/方差齐性/相关（stdlib + scipy 移植）',
    scripts: ['vendor/stdlib-stats.bundle.js','vendor/simple-statistics.min.js','tools/lib/scipy-mwu.js','tools/lib/stats-engine.js','tools/tests.js'] },
  { id: 'table1', name: 'Table 1 基线表', tag: 'B2', group: '统计与数据', desc: '按分组生成基线特征表，连续/分类变量自动汇总（tableone 移植）',
    scripts: ['vendor/papaparse.min.js','vendor/arquero.min.js','vendor/stdlib-stats.bundle.js','vendor/simple-statistics.min.js','tools/lib/scipy-mwu.js','tools/lib/stats-engine.js','tools/lib/tableone.js','tools/table1.js'] },
  { id: 'randomize', name: '随机化与盲法', tag: 'B6', group: '统计与数据', desc: '完全/区组/分层随机、分配隐藏序列、可复现种子（randomizr 移植）',
    scripts: ['vendor/seedrandom.min.js','tools/lib/randomizr.js','tools/randomize.js'] },
  { id: 'data-wash', name: '数据清洗与交叉表', tag: 'B1+B7', group: '统计与数据', desc: 'CSV/Excel 导入、缺失/重复/类型治理、频数与交叉表（PapaParse+SheetJS+arquero+Tabulator）',
    scripts: ['vendor/papaparse.min.js','vendor/xlsx.full.min.js','vendor/arquero.min.js','vendor/tabulator.min.js','tools/data-wash.js'] },
  { id: 'apa', name: '统计报告串', tag: 'B8', group: '统计与数据', desc: '把检验结果一键转 APA7 / 论文句式（薄胶水）',
    scripts: ['tools/apa.js'] },
  // ---- C 实验计算 ----
  { id: 'labcalc', name: '实验计算器', tag: 'C1', group: '实验计算', desc: '稀释配液 C1V1=C2V2、质量/体积换算、RCF↔rpm、铺板密度、MOI（Mixology 移植）',
    scripts: ['tools/lib/reagent-mw.js','tools/lib/mixology.js','tools/labcalc.js'] },
  { id: 'primer', name: '引物工作台', tag: 'C2', group: '实验计算', desc: 'Tm（NN 热力学）、GC%、长度、互补检查（Biopython MeltingTemp 移植）',
    scripts: ['tools/lib/melting-temp.js','tools/primer.js'] },
  { id: 'plate', name: '孔板布局编辑器', tag: 'C3', group: '实验计算', desc: '96/384 孔板可视化排布、分组着色、导出 CSV（PlateEditor 思路）',
    scripts: ['tools/lib/plate-model.js','tools/plate.js'] },
  { id: 'timer', name: 'Protocol 计时器', tag: 'C4', group: '实验计算', desc: '多步实验流程计时、到点提醒、步骤记录（easytimer.js）',
    scripts: ['vendor/easytimer.min.js','tools/timer.js'] },
  { id: 'eln', name: '实验记录 → Markdown', tag: 'C5', group: '实验计算', desc: '结构化实验记录模板，导出 Obsidian 友好 Markdown（markdown-it）',
    scripts: ['vendor/markdown-it.min.js','tools/eln.js'] },
  { id: 'inventory', name: '试剂/仪器台账', tag: 'C6', group: '实验计算', desc: '本地台账、效期/存量提醒、出入库记录（InvenTree schema 参照）',
    scripts: ['vendor/papaparse.min.js','tools/inventory.js'] },
  // ---- D 写作与图 ----
  { id: 'plotter', name: '数据绘图器', tag: 'D1', group: '写作与图', desc: 'CSV→散点/箱线/柱状/回归图， publication 级导出（Plotly.js）',
    scripts: ['vendor/papaparse.min.js','vendor/arquero.min.js','vendor/plotly.min.js','vendor/stdlib-stats.bundle.js','vendor/simple-statistics.min.js','tools/lib/scipy-mwu.js','tools/lib/stats-engine.js','tools/qpcr-plots.js','tools/plotter.js'] },
  { id: 'figure', name: 'Figure 拼图器', tag: 'D2', group: '写作与图', desc: '多面板拼图、对齐、标注、300dpi 导出（fabric.js）',
    scripts: ['vendor/fabric.min.js','tools/figure.js'] },
  { id: 'imgbatch', name: '图片批处理', tag: 'D3', group: '写作与图', desc: '批量缩放/格式转换/重命名（Rust image crate）',
    scripts: ['tools/imgbatch.js'] },
  { id: 'checklists', name: '报告规范清单', tag: 'D5', group: '写作与图', desc: 'PRISMA/STROBE/CONSORT/MIQE 逐条自查与导出',
    scripts: ['tools/checklists.js'] },
  { id: 'tableconv', name: '表格格式互转', tag: 'D7', group: '写作与图', desc: 'CSV/Excel/Markdown/HTML/LaTeX 互转（PapaParse+SheetJS+markdown-table）',
    scripts: ['vendor/papaparse.min.js','vendor/xlsx.full.min.js','vendor/markdown-table.bundle.js','tools/tableconv.js'] },
];
window.LabKitTools = window.LabKitTools || {};
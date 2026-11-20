// OpenEpi 适配器（LabKit 新增，MIT）
// 构造 IEpiFace 数据数组，原样调用上游 Calc / doStatistics，捕获 Commandclass 生成的 HTML。
// 依赖加载顺序：openepi-shim.js → StatFunctions1.js → OECommands.js → MartinStats.js → modules/*.js
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;

  function meta(numE, numD, strata, conflevel) {
    return {
      numE: numE, numD: numD, strata: strata, conflevel: conflevel || 95,
      nohighlight: 0, datarmin: 2, datacmin: 1,
      // TableAsHTML 显示元数据（OECommands.js:274-277）：暴露为行、疾病为列
      usetablesettings: false, expleft: true, maxatleft: false, maxattop: false,
      varE: 'Exposure', varD: 'Disease',
      Evals: ['Unexposed', 'Exposed'], Dvals: ['Non-diseased', 'Diseased']
    };
  }
  // 上游约定（TwobyTwo.js:509-515）：a=E1D1 暴露+患病, b=E0D1 非暴露+患病, c=E1D0 暴露+非病, d=E0D0 非暴露+非病
  function cellRow(a, b, c, d) { return { E1D1: a, E0D1: b, E1D0: c, E0D0: d }; }

  // 上游用 alert 提示零单元格等警告：调用期间临时接管，收集到 __oeLastAlerts，避免阻塞弹窗
  function captureAlerts(fn) {
    const prev = W.alert; const msgs = [];
    W.alert = function (m) { msgs.push(String(m)); };
    try { return fn(); } finally { W.alert = prev; W.__oeLastAlerts = msgs; }
  }

  // tables: [[a,b,c,d], ...]；opts: {conflevel, casecontrol}
  function run2x2(tables, opts) {
    opts = opts || {};
    const data = [meta(2, 2, tables.length, opts.conflevel)];
    for (const t of tables) data.push(cellRow(t[0], t[1], t[2], t[3]));
    const cmdObj = new W.Output(data);
    W.outTable = cmdObj;
    captureAlerts(function () {
      W.__oe.TwobyTwo.doStatistics(cmdObj, true, tables.length > 1, !!opts.casecontrol);
    });
    return cmdObj.s;
  }

  // name: SSPropor/SSCC/SSCohort/SSMean/PowerCC/PowerCohort/PowerRCT/PowerCross/PowerMean
  // fields: {E0D0:..., E1D0:...}（字段含义见各模块上游源码注释）
  function runModule(name, fields, conflevel) {
    const data = [meta(1, 1, 1, conflevel), fields];
    const outTable = new W.Output(data);
    W.outTable = outTable;
    const mod = W.__oe[name];
    const fn = mod.Calc || mod.CalcPower;
    captureAlerts(function () { fn(data); });
    return outTable.s;
  }

  /**
   * 把用户-facing 输入补齐成上游真正读取的单元格。纯函数（就地补 fields 并返回），node 可测。
   * 上游各模块读的单元格与 UI 想让用户填的量并不一一对应，缺一个就整片 NaN。
   */
  function deriveFields(name, fields) {
    if (name === 'SSCC') {
      const p0 = fields.E3D0 / 100, p1 = fields.E6D0 / 100;
      fields.E5D0 = (p1 / (1 - p1)) / (p0 / (1 - p0)); // OR
    }
    if (name === 'SSCohort') {
      // 上游读 E3D0=非暴露结局率、E6D0=暴露结局率；E5D0(OR)/E7D0(RR)/E8D0(率差) 仅用于回显，
      // 且 OR 非 0 时会用它反推暴露率，故三者必须与 p0×RR 自洽，否则回显与计算口径不一致。
      const p0 = fields.E3D0, rr = fields.E7D0, p1 = p0 * rr;
      if (!(p0 > 0 && p0 < 100)) throw new Error('非暴露结局率需大于 0 且小于 100%');
      if (!(rr > 0)) throw new Error('假设 RR 需大于 0');
      if (rr === 1) throw new Error('RR = 1 表示两组无效应差异，样本量无定义');
      if (!(p1 < 100)) throw new Error('暴露结局率 = 非暴露结局率 × RR = ' + p1.toFixed(2) + '%，需小于 100%');
      fields.E6D0 = p1;
      fields.E5D0 = (p1 / (100 - p1)) / (p0 / (100 - p0));
      fields.E8D0 = p1 - p0;
    }
    if (name === 'SSMean') {
      fields.E4D0 = 0; fields.E4D2 = 0;
      fields.E6D0 = fields.E5D0 * fields.E5D0; fields.E6D2 = fields.E5D2 * fields.E5D2;
    }
    if (name === 'PowerMean') {
      fields.E2D5 = fields.E2D0 - fields.E2D2;
      fields.E5D0 = fields.E4D0 * fields.E4D0; fields.E5D2 = fields.E4D2 * fields.E4D2;
    }
    return fields;
  }

  W.OpenEpiAdapter = { run2x2: run2x2, runModule: runModule, deriveFields: deriveFields };
})();
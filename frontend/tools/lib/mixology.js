// 配液计算核心 —— 移植自 Mixology NeededAmount.vue（MIT, Copyright (c) Theo Sanderson）
// https://github.com/theosanderson/mixology — 保留上游公式语义与 4 位有效数字格式化。
// 浓度类型：'g/L'（克/升，含 mg/mL 等等价换算）与 'mol/L'（摩尔/升）。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  const MASS = { kg: 1000, g: 1, mg: 1e-3, ug: 1e-6, 'µg': 1e-6, ng: 1e-9 };
  const VOL = { L: 1, mL: 1e-3, 'µL': 1e-6, uL: 1e-6 };
  const PRECISION = 4;

  function round(p, x) { return parseFloat(x.toPrecision(p)); }
  function formatNumber(x) {
    if (x == null || !Number.isFinite(x)) return '';
    if (x === 0) return '0';
    const r = round(PRECISION, x);
    const f = Math.floor(r);
    const isInt = Math.abs(f - r) < Number.EPSILON;
    const fd = String(f).length, nd = String(r).length;
    if (fd > PRECISION) return String(f);
    const pad = isInt ? PRECISION - fd : PRECISION - nd + 1;
    if (pad > 0) return isInt ? String(f) + '.' + '0'.repeat(pad) : String(r) + '0'.repeat(pad);
    return String(r);
  }

  // 称量法：配 volumeL 升、浓度 conc（type: g/L | mol/L）所需质量（massUnit 单位）
  function neededMass({ volumeL, conc, type, mw, massUnit }) {
    if (!(volumeL > 0)) return { error: '请输入有效终体积' };
    if (MASS[massUnit] == null) return { error: '质量单位无效（kg/g/mg/ug/ng）' };
    if (!(conc > 0)) return { error: '请输入有效目标浓度' };
    if (type === 'g/L') return { value: formatNumber(volumeL * conc / MASS[massUnit]), unit: massUnit };
    if (type === 'mol/L') {
      if (!(mw > 0)) return { error: '摩尔浓度换算需要分子量：选择试剂或手动输入 MW' };
      return { value: formatNumber(volumeL * conc * mw / MASS[massUnit]), unit: massUnit };
    }
    return { error: '浓度类型无效' };
  }

  // 量取法：用 stock 母液配 volumeL 升目标浓度，所需母液体积（volUnit 单位）
  function neededVolume({ volumeL, desired, stock, mw, volUnit }) {
    if (!(volumeL > 0)) return { error: '请输入有效终体积' };
    if (VOL[volUnit] == null) return { error: '体积单位无效（L/mL/uL）' };
    if (!(desired.number > 0)) return { error: '请输入有效目标浓度' };
    if (!(stock.number > 0)) return { error: '请输入有效母液浓度' };
    const vf = VOL[volUnit];
    if (desired.type === stock.type) {
      return { value: formatNumber(volumeL * desired.number / (stock.number * vf)), unit: volUnit };
    }
    if (desired.type === 'mol/L' && stock.type === 'g/L') {
      if (!(mw > 0)) return { error: '跨类型换算需要分子量' };
      return { value: formatNumber(volumeL * desired.number / (stock.number * vf / mw)), unit: volUnit };
    }
    if (desired.type === 'g/L' && stock.type === 'mol/L') {
      if (!(mw > 0)) return { error: '跨类型换算需要分子量' };
      return { value: formatNumber(volumeL * desired.number / (stock.number * vf * mw)), unit: volUnit };
    }
    return { error: '浓度类型不兼容' };
  }

  // C1V1 = C2V2（同单位浓度）
  function dilution({ c1, c2, v2 }) {
    if (!(c1 > 0) || !(c2 > 0) || !(v2 > 0)) return { error: 'C1、C2、V2 均需 > 0' };
    if (c2 > c1) return { error: '目标浓度不能高于母液浓度' };
    return { v1: c2 * v2 / c1, diluent: v2 - c2 * v2 / c1 };
  }

  // 相对离心力 RCF = 1.118e-5 × r(cm) × rpm²
  function rcfToRpm(rcf, rCm) { return Math.sqrt(rcf / (1.118e-5 * rCm)); }
  function rpmToRcf(rpm, rCm) { return 1.118e-5 * rCm * rpm * rpm; }

  // 铺板：目标每孔细胞数 / 悬液密度 → 每孔加样体积；或按融合度估算
  function plating({ cellsPerWell, densityPerMl, wellAreaCm2, targetConfluence, yieldPerCm2 }) {
    const out = {};
    if (cellsPerWell > 0 && densityPerMl > 0) out.volumePerWellUl = cellsPerWell / densityPerMl * 1000;
    if (wellAreaCm2 > 0 && targetConfluence > 0 && yieldPerCm2 > 0) out.cellsPerWellEst = wellAreaCm2 * targetConfluence * yieldPerCm2;
    if (!Object.keys(out).length) return { error: '请输入（每孔细胞数+密度）或（面积+融合度+产率）' };
    return out;
  }

  // MOI = PFU / 细胞数；病毒加样体积 = MOI × 细胞数 / 滴度
  function moi({ moi, cells, titerPfuPerMl }) {
    if (!(moi >= 0) || !(cells > 0) || !(titerPfuPerMl > 0)) return { error: 'MOI、细胞数、滴度均需有效' };
    const pfu = moi * cells;
    return { pfu, volumeUl: pfu / titerPfuPerMl * 1000 };
  }

  W.mixology = { neededMass, neededVolume, dilution, rcfToRpm, rpmToRcf, plating, moi, formatNumber, MASS, VOL };
})();
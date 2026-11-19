// 引物熔解温度计算 —— 移植自 Biopython Bio.SeqUtils.MeltingTemp
// Biopython: Copyright (c) Biopython contributors, BSD 3-Clause License. https://biopython.org
// 上游源码：tools/upstream/biopython_MeltingTemp.py（逐式移植，保留参数表与盐校正决策树）
// 范围：完美配对 DNA/DNA 双链（引物场景）；不支持悬垂末端/错配（上游中这些需 c_seq/shift）。
// 热力学表：DNA_NN1 Breslauer'86 / DNA_NN2 Sugimoto'96 / DNA_NN3 Allawi&SantaLucia'97(默认) / DNA_NN4 SantaLucia&Hicks'04
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;

  const DNA_NN1 = {
    init: [0, 0], 'init_A/T': [0, 0], 'init_G/C': [0, 0],
    init_oneG_C: [0, -16.8], init_allA_T: [0, -20.1], init_5T_A: [0, 0], sym: [0, -1.3],
    'AA/TT': [-9.1, -24.0], 'AT/TA': [-8.6, -23.9], 'TA/AT': [-6.0, -16.9],
    'CA/GT': [-5.8, -12.9], 'GT/CA': [-6.5, -17.3], 'CT/GA': [-7.8, -20.8],
    'GA/CT': [-5.6, -13.5], 'CG/GC': [-11.9, -27.8], 'GC/CG': [-11.1, -26.7], 'GG/CC': [-11.0, -26.6]
  };
  const DNA_NN2 = {
    init: [0.6, -9.0], 'init_A/T': [0, 0], 'init_G/C': [0, 0],
    init_oneG_C: [0, 0], init_allA_T: [0, 0], init_5T_A: [0, 0], sym: [0, -1.4],
    'AA/TT': [-8.0, -21.9], 'AT/TA': [-5.6, -15.2], 'TA/AT': [-6.6, -18.4],
    'CA/GT': [-8.2, -21.0], 'GT/CA': [-9.4, -25.5], 'CT/GA': [-6.6, -16.4],
    'GA/CT': [-8.8, -23.5], 'CG/GC': [-11.8, -29.0], 'GC/CG': [-10.5, -26.4], 'GG/CC': [-10.9, -28.4]
  };
  const DNA_NN3 = {
    init: [0, 0], 'init_A/T': [2.3, 4.1], 'init_G/C': [0.1, -2.8],
    init_oneG_C: [0, 0], init_allA_T: [0, 0], init_5T_A: [0, 0], sym: [0, -1.4],
    'AA/TT': [-7.9, -22.2], 'AT/TA': [-7.2, -20.4], 'TA/AT': [-7.2, -21.3],
    'CA/GT': [-8.5, -22.7], 'GT/CA': [-8.4, -22.4], 'CT/GA': [-7.8, -21.0],
    'GA/CT': [-8.2, -22.2], 'CG/GC': [-10.6, -27.2], 'GC/CG': [-9.8, -24.4], 'GG/CC': [-8.0, -19.9]
  };
  const DNA_NN4 = {
    init: [0.2, -5.7], 'init_A/T': [2.2, 6.9], 'init_G/C': [0, 0],
    init_oneG_C: [0, 0], init_allA_T: [0, 0], init_5T_A: [0, 0], sym: [0, -1.4],
    'AA/TT': [-7.6, -21.3], 'AT/TA': [-7.2, -20.4], 'TA/AT': [-7.2, -21.3],
    'CA/GT': [-8.5, -22.7], 'GT/CA': [-8.4, -22.4], 'CT/GA': [-7.8, -21.0],
    'GA/CT': [-8.2, -22.2], 'CG/GC': [-10.6, -27.2], 'GC/CG': [-9.8, -24.4], 'GG/CC': [-8.0, -19.9]
  };
  const TABLES = { NN1: DNA_NN1, NN2: DNA_NN2, NN3: DNA_NN3, NN4: DNA_NN4 };

  const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
  function clean(seq) { return String(seq).toUpperCase().replace(/\s+/g, ''); }
  function complement(seq) { return seq.split('').map(b => COMP[b] || '').join(''); }
  function revcomp(seq) { return complement(seq).split('').reverse().join(''); }
  function gcFraction(seq) {
    let gc = 0, n = 0;
    for (const b of seq) { if ('ACGT'.includes(b)) { n++; if (b === 'G' || b === 'C') gc++; } }
    return n ? gc / n : 0;
  }
  function checkDNA(seq) {
    if (!seq.length) throw new Error('序列为空');
    if (!/^[ACGT]+$/.test(seq)) throw new Error('Tm_NN 仅支持 A/C/G/T（请先去除简并碱基/修饰）');
    if (seq.length < 2) throw new Error('序列至少 2 nt');
  }

  // 盐校正（上游 salt_correction，方法 1-7；离子浓度 mM）
  function saltCorrection({ Na = 0, K = 0, Tris = 0, Mg = 0, dNTPs = 0, method = 1, seq = '' }) {
    if ([5, 6, 7].includes(method) && !seq) throw new Error('方法 5/6/7 需要序列');
    if (!method) return 0;
    let Mon = Na + K + Tris / 2.0;
    let mg = Mg * 1e-3;
    if ((K + Mg + Tris + dNTPs) > 0 && method !== 7 && dNTPs < Mg) Mon += 120 * Math.sqrt(Mg - dNTPs);
    const mon = Mon * 1e-3;
    if (method >= 1 && method <= 6 && !mon) throw new Error('该方法不允许总离子浓度为零');
    const ln = Math.log, log10 = Math.log10;
    const gc = gcFraction(seq);
    let corr = 0;
    if (method === 1) corr = 16.6 * log10(mon);
    if (method === 2) corr = 16.6 * log10(mon / (1.0 + 0.7 * mon));
    if (method === 3) corr = 12.5 * log10(mon);
    if (method === 4) corr = 11.7 * log10(mon);
    if (method === 5) corr = 0.368 * (seq.length - 1) * ln(mon);
    if (method === 6) corr = (4.29 * gc - 3.95) * 1e-5 * ln(mon) + 9.40e-6 * ln(mon) ** 2;
    if (method === 7) {
      let a = 3.92, b = -0.911, c = 6.26, d = 1.42, e = -48.2, f = 52.5, g = 8.31;
      if (dNTPs > 0) {
        const dntps = dNTPs * 1e-3, ka = 3e4;
        mg = (-(ka * dntps - ka * mg + 1.0) + Math.sqrt((ka * dntps - ka * mg + 1.0) ** 2 + 4.0 * ka * mg)) / (2.0 * ka);
      }
      if (Mon > 0) {
        const R = Math.sqrt(mg) / mon;
        if (R < 0.22) return (4.29 * gc - 3.95) * 1e-5 * ln(mon) + 9.40e-6 * ln(mon) ** 2;
        if (R < 6.0) {
          a = 3.92 * (0.843 - 0.352 * Math.sqrt(mon) * ln(mon));
          d = 1.42 * (1.279 - 4.03e-3 * ln(mon) - 8.03e-3 * ln(mon) ** 2);
          g = 8.31 * (0.486 - 0.258 * ln(mon) + 5.25e-3 * ln(mon) ** 3);
        }
      }
      corr = (a + b * ln(mg) + gc * (c + d * ln(mg)) + (1 / (2.0 * (seq.length - 1))) * (e + f * ln(mg) + g * ln(mg) ** 2)) * 1e-5;
    }
    if (method > 7) throw new Error('盐校正方法仅支持 1-7');
    return corr;
  }

  // 最近邻法 Tm（上游 Tm_NN 完美配对路径）
  function tmNN(seq, opts = {}) {
    seq = clean(seq);
    checkDNA(seq);
    const {
      table = 'NN3', dnac1 = 25, dnac2 = 25, selfcomp = false,
      Na = 50, K = 0, Tris = 0, Mg = 0, dNTPs = 0, saltcorr = 5
    } = opts;
    const nn = TABLES[table] || DNA_NN3;
    const cseq = complement(seq);
    let dH = 0, dS = 0;
    // 起始项
    dH += nn.init[0]; dS += nn.init[1];
    if (gcFraction(seq) === 0) { dH += nn.init_allA_T[0]; dS += nn.init_allA_T[1]; }
    else { dH += nn.init_oneG_C[0]; dS += nn.init_oneG_C[1]; }
    if (seq.startsWith('T')) { dH += nn.init_5T_A[0]; dS += nn.init_5T_A[1]; }
    if (seq.endsWith('A')) { dH += nn.init_5T_A[0]; dS += nn.init_5T_A[1]; }
    const ends = seq[0] + seq[seq.length - 1];
    const AT = (ends.match(/[AT]/g) || []).length, GC = (ends.match(/[GC]/g) || []).length;
    dH += nn['init_A/T'][0] * AT; dS += nn['init_A/T'][1] * AT;
    dH += nn['init_G/C'][0] * GC; dS += nn['init_G/C'][1] * GC;
    // 拉链式最近邻加和
    for (let i = 0; i < seq.length - 1; i++) {
      const nb = seq.slice(i, i + 2) + '/' + cseq.slice(i, i + 2);
      const rev = nb.split('').reverse().join('');
      const v = nn[nb] || nn[rev];
      if (!v) throw new Error('未识别的最近邻对：' + nb);
      dH += v[0]; dS += v[1];
    }
    let k = (dnac1 - dnac2 / 2.0) * 1e-9;
    if (selfcomp) { k = dnac1 * 1e-9; dH += nn.sym[0]; dS += nn.sym[1]; }
    const R = 1.987;
    let corr = 0;
    if (saltcorr) corr = saltCorrection({ Na, K, Tris, Mg, dNTPs, method: saltcorr, seq });
    if (saltcorr === 5) dS += corr;
    let tm = (1000 * dH) / (dS + R * Math.log(k)) - 273.15;
    if ([1, 2, 3, 4].includes(saltcorr)) tm += corr;
    if ([6, 7].includes(saltcorr)) tm = 1 / (1 / (tm + 273.15) + corr) - 273.15;
    return tm;
  }

  // Wallace 规则（14-20nt 经验）
  function tmWallace(seq) {
    seq = clean(seq);
    const c = b => (seq.match(new RegExp(b, 'g')) || []).length;
    return 2 * (c('A') + c('T')) + 4 * (c('G') + c('C'));
  }

  // GC 经验公式（上游 Tm_GC，valueset 1-8；X 记为错配）
  const VALUESETS = {
    1: [69.3, 0.41, 650, 1, 0], 2: [81.5, 0.41, 675, 1, 0], 3: [81.5, 0.41, 675, 1, 1],
    4: [81.5, 0.41, 500, 1, 2], 5: [78.0, 0.7, 500, 1, 2], 6: [67.0, 0.8, 500, 1, 2],
    7: [81.5, 0.41, 600, 1, 1], 8: [77.1, 0.41, 528, 1, 4]
  };
  function tmGC(seq, opts = {}) {
    seq = clean(seq);
    if (!seq.length) throw new Error('序列为空');
    const { valueset = 7, Na = 50, K = 0, Tris = 0, Mg = 0, dNTPs = 0 } = opts;
    const vs = VALUESETS[valueset];
    if (!vs) throw new Error('valueset 仅支持 1-8');
    const [A, B, C, D, saltcorr] = vs;
    const nX = (seq.match(/X/g) || []).length;
    // 上游 gc_fraction("weighted") 把 X 按 0.5 计入再扣除 X*50/len，净效应 = G+C 数 / 全长
    const gcCount = (seq.match(/[GC]/g) || []).length;
    const percentGC = gcCount / seq.length * 100;
    let tm = A + B * percentGC - C / seq.length;
    if (saltcorr) tm += saltCorrection({ Na, K, Tris, Mg, dNTPs, seq, method: saltcorr });
    tm -= D * (nX * 100.0 / seq.length);
    return tm;
  }

  // ssDNA 分子量（各核苷酸残基质量加和，减去 5' 端水）与 OD260 换算
  const NT_MW = { A: 313.21, T: 304.2, C: 289.18, G: 329.21 };
  function primerMW(seq) {
    seq = clean(seq);
    let mw = -61.96;
    for (const b of seq) { if (!NT_MW[b]) throw new Error('分子量计算仅支持 ACGT'); mw += NT_MW[b]; }
    return mw;
  }

  W.meltingTemp = { tmNN, tmWallace, tmGC, saltCorrection, gcFraction, complement, revcomp, primerMW, clean, TABLES };
})();
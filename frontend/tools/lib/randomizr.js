// randomizr 核心算法 JS 移植（B6 随机化）
// 上游：DeclareDesign/randomizr（MIT License, Copyright (c) DeclareDesign）
// https://github.com/DeclareDesign/randomizr — R/randomizr_complete_ra.R / block_ra.R / block_and_cluster_ra.R
// 移植保留上游语义：完全随机（含 prob 的随机取整 fix-up）、区组内完全随机、整群随机、区组+整群。
// 随机源可注入（seedrandom），保证可复现。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;

  function rep(values, times) {
    const out = [];
    values.forEach((v, i) => { for (let j = 0; j < times[i]; j++) out.push(v); });
    return out;
  }
  // Fisher-Yates，等价 R sample(x) 的均匀排列
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // R sample(x, k, prob, replace=FALSE)：逐次按归一化权重抽取
  function weightedSampleWOR(items, k, probs, rng) {
    const pool = items.slice(), w = probs.slice(), out = [];
    for (let n = 0; n < k && pool.length; n++) {
      const total = w.reduce((a, b) => a + b, 0);
      let u = rng() * total, idx = 0;
      for (; idx < pool.length - 1; idx++) { if (u < w[idx]) break; u -= w[idx]; }
      out.push(pool[idx]);
      pool.splice(idx, 1); w.splice(idx, 1);
    }
    return out;
  }

  // 完全随机分配。opts: {m, prob, mEach, probEach, conditions, rng}
  function completeRA(N, opts) {
    opts = opts || {};
    const rng = opts.rng || Math.random;
    const conditions = opts.conditions || ['0', '1'];
    const arms = conditions.length;
    if (arms < 2) throw new Error('至少两个分组');
    if (N < 1) throw new Error('N 必须 ≥ 1');

    if (arms > 2) {
      if (opts.mEach) {
        if (opts.mEach.reduce((a, b) => a + b, 0) !== N) throw new Error('mEach 之和必须等于 N');
        return shuffle(rep(conditions, opts.mEach), rng);
      }
      const probEach = opts.probEach || Array(arms).fill(1 / arms);
      const floors = probEach.map(p => Math.floor(N * p));
      const remainder = N - floors.reduce((a, b) => a + b, 0);
      const vec = rep(conditions, floors);
      if (remainder > 0) {
        const fix = probEach.map((p, i) => (p * N - floors[i]) / remainder);
        vec.push(...weightedSampleWOR(conditions, remainder, fix, rng));
      }
      return shuffle(vec, rng);
    }

    // 双臂
    let m = opts.m;
    if (m == null) {
      const prob = opts.prob != null ? opts.prob : 0.5;
      const mf = Math.floor(N * prob), mc = Math.ceil(N * prob);
      if (mc === N) {
        m = mf;
        const a = shuffle(rep(conditions, [N - m, m]), rng);
        if (N === 1 && mf < N * prob && rng() < prob) a[0] = conditions[1];
        return a;
      }
      const fix = mc > mf ? (N * prob - mf) / (mc - mf) : 0.5;
      m = rng() < fix ? mc : mf;
    }
    if (m < 0 || m > N) throw new Error('m 必须在 0..N 之间');
    if (m === N) return Array(N).fill(conditions[1]);
    return shuffle(rep(conditions, [N - m, m]), rng);
  }

  function uniqueSorted(labels) { return [...new Set(labels)].sort(); }
  function groupIndices(labels) {
    const map = new Map();
    labels.forEach((l, i) => { if (!map.has(l)) map.set(l, []); map.get(l).push(i); });
    return map;
  }

  // 区组随机：每个区组内做完全随机。opts 同 completeRA；m/prob/mEach/probEach 为每区组标量，
  // 或 blockMEach/blockProbEach = {区组名: 数组} 按区组指定。
  function blockRA(blocks, opts) {
    opts = opts || {};
    const rng = opts.rng || Math.random;
    const conditions = opts.conditions || ['0', '1'];
    const groups = groupIndices(blocks);
    const out = new Array(blocks.length);
    for (const name of uniqueSorted(blocks)) {
      const idx = groups.get(name);
      const local = Object.assign({}, opts, { rng, conditions });
      if (opts.blockMEach) local.mEach = opts.blockMEach[name];
      if (opts.blockProbEach) local.probEach = opts.blockProbEach[name];
      const a = completeRA(idx.length, local);
      idx.forEach((unit, j) => { out[unit] = a[j]; });
    }
    return out;
  }

  // 整群随机：以群为单位分配，再展开到个体
  function clusterRA(clusters, opts) {
    opts = opts || {};
    const rng = opts.rng || Math.random;
    const conditions = opts.conditions || ['0', '1'];
    const names = uniqueSorted(clusters);
    const local = Object.assign({}, opts, { rng, conditions });
    const clusterAssign = completeRA(names.length, local);
    const map = new Map(names.map((n, i) => [n, clusterAssign[i]]));
    return clusters.map(c => map.get(c));
  }

  // 区组 + 整群：每个区组内对其群做整群随机
  function blockAndClusterRA(blocks, clusters, opts) {
    opts = opts || {};
    const rng = opts.rng || Math.random;
    const conditions = opts.conditions || ['0', '1'];
    const groups = groupIndices(blocks);
    const out = new Array(blocks.length);
    for (const name of uniqueSorted(blocks)) {
      const idx = groups.get(name);
      const local = Object.assign({}, opts, { rng, conditions });
      if (opts.blockMEach) local.mEach = opts.blockMEach[name];
      if (opts.blockProbEach) local.probEach = opts.blockProbEach[name];
      const a = clusterRA(idx.map(i => clusters[i]), local);
      idx.forEach((unit, j) => { out[unit] = a[j]; });
    }
    return out;
  }

  W.randomizr = { completeRA, blockRA, clusterRA, blockAndClusterRA, shuffle };
})();
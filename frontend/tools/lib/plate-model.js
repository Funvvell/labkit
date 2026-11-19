// 孔板布局模型 —— 移植自 PlateEditor (MIT) 的纯数据模型与赋样语义
// Copyright (c) vindelorme. https://github.com/vindelorme/PlateEditor
// 上游 Plate.js / Well.js / Area.js / Layer.js 与 DOM 耦合，此处抽出其板模型：
// Plate{Rows,Cols,Layers[]} → Layer{Wells[],Areas[]} → Well{Index,Row,Col,Area,Value,Unit,RangeIndex}；
// Area/Range 两类标签、Range 按赋样顺序自增编号、Definition 解析、重复/锁定标记、
// 孔名解析（A1…P24）、导出列序（Well/Row/Col/Index/Area/Value/Unit/Resolved）均对齐上游。
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  function alphabet(r) { return r < 26 ? ALPHA[r] : 'A' + ALPHA[r - 26]; }
  function rowIndex(a) {
    a = String(a).toUpperCase();
    if (a.length === 1) return parseInt(a, 36) - 10;
    if (a.length === 2) return (parseInt(a.charAt(0), 36) - 9) * 26 + parseInt(a.charAt(1), 36) - 10;
    return undefined;
  }
  function parseIndex(name, rows, cols) {
    const m = String(name).toUpperCase().match(/^([A-Z]{1,2})(\d{1,3})$/);
    if (!m) return undefined;
    const col = parseInt(m[2], 10) - 1;
    const row = rowIndex(m[1]);
    if (col < 0 || col >= cols || row === undefined || row < 0 || row >= rows) return undefined;
    return { Index: row * cols + col, Row: row, Col: col, Name: alphabet(row) + (col + 1) };
  }
  const wellName = w => alphabet(w.Row) + (w.Col + 1);

  function createLayer(index, rows, cols) {
    const wells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      wells.push({ Index: r * cols + c, Row: r, Col: c, Area: null, Value: undefined, Unit: undefined, RangeIndex: 1 });
    }
    return { Index: index, Wells: wells, Areas: [] };
  }
  function createPlate(rows, cols) {
    return { Rows: rows, Cols: cols, Layers: [createLayer(0, rows, cols)] };
  }
  function addLayer(plate) {
    const l = createLayer(plate.Layers.length, plate.Rows, plate.Cols);
    plate.Layers.push(l);
    return l;
  }
  function addArea(layer, { Name, Type = 'Area', Color = '#4c9be8', Definition = null }) {
    if (!Name) throw new Error('区域名不能为空');
    if (layer.Areas.some(a => a.Name === Name)) throw new Error('区域名已存在：' + Name);
    if (!['Area', 'Range'].includes(Type)) throw new Error('类型需为 Area 或 Range');
    const a = { Name, Type, Color, Definition: Definition && Definition.length ? Definition : null, NextIndex: 1 };
    layer.Areas.push(a);
    return a;
  }
  const findArea = (layer, name) => layer.Areas.find(a => a.Name === name);

  // 赋样（对齐 Well.tag 语义：重复标记 / 锁定报错 / Range 顺序编号）
  function tagWells(layer, indices, areaName, opts = {}) {
    const a = findArea(layer, areaName);
    if (!a) throw new Error('区域不存在：' + areaName);
    const out = [];
    for (const idx of indices) {
      const w = layer.Wells[idx];
      if (!w) { out.push({ Index: idx, status: 'error' }); continue; }
      if (w.Area && w.Area.Name === a.Name) { out.push({ Index: idx, status: 'duplicate' }); continue; }
      if (opts.lock && w.Area) { out.push({ Index: idx, status: 'error' }); continue; }
      if (a.Type === 'Range') w.RangeIndex = a.NextIndex++;
      w.Area = a;
      out.push({ Index: idx, status: 'ok' });
    }
    return out;
  }
  function untagWells(layer, indices) {
    indices.forEach(idx => { const w = layer.Wells[idx]; if (w) w.Area = null; });
  }
  function tagConc(layer, indices, value, unit) {
    indices.forEach(idx => { const w = layer.Wells[idx]; if (w) { w.Value = value; w.Unit = unit; } });
  }
  function untagConc(layer, indices) {
    indices.forEach(idx => { const w = layer.Wells[idx]; if (w) { w.Value = undefined; w.Unit = undefined; } });
  }

  // 解析名（对齐 Well.layoutData：Range → Definition[RangeIndex-1] 或 "Name #i"）
  function resolvedName(w) {
    if (!w.Area) return '';
    const a = w.Area;
    if (a.Type === 'Range') {
      if (a.Definition) return a.Definition[w.RangeIndex - 1] != null ? String(a.Definition[w.RangeIndex - 1]) : `${a.Name} #${w.RangeIndex}`;
      return `${a.Name} #${w.RangeIndex}`;
    }
    return a.Name;
  }
  function rawAreaName(w) {
    if (!w.Area) return '';
    return w.Area.Type === 'Range' ? `${w.Area.Name} #${w.RangeIndex}` : w.Area.Name;
  }

  // 导出（对齐 Layer 导出列序）
  function exportRows(layer) {
    const header = ['Well', 'Row', 'Col', 'Index', 'Area', 'Value', 'Unit', 'Resolved'];
    const rows = layer.Wells.map(w => [
      wellName(w), w.Row + 1, w.Col + 1, w.Index, rawAreaName(w),
      w.Value !== undefined ? w.Value : '', w.Unit !== undefined ? w.Unit : '', resolvedName(w)
    ]);
    return { header, rows };
  }
  function toCSV(layer, delim = ',') {
    const { header, rows } = exportRows(layer);
    const cell = c => { const s = String(c); return /[",\n]/.test(s) || (delim === ',' && s.includes(',')) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return [header, ...rows].map(r => r.map(cell).join(delim)).join('\n');
  }

  // 保存/加载（对齐 Plate.save 的 JSON 形状，Area 以名引用）
  function save(plate) {
    return JSON.stringify({
      Rows: plate.Rows, Cols: plate.Cols,
      Layers: plate.Layers.map(l => ({
        Index: l.Index,
        Areas: l.Areas.map(a => ({ Name: a.Name, Type: a.Type, Color: a.Color, Definition: a.Definition, NextIndex: a.NextIndex })),
        Wells: l.Wells.map(w => ({ Index: w.Index, Area: w.Area ? w.Area.Name : null, Value: w.Value, Unit: w.Unit, RangeIndex: w.RangeIndex }))
      }))
    });
  }
  function load(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const plate = createPlate(data.Rows, data.Cols);
    plate.Layers = [];
    data.Layers.forEach((ld, i) => {
      const l = createLayer(ld.Index != null ? ld.Index : i, data.Rows, data.Cols);
      (ld.Areas || []).forEach(ad => {
        const a = addArea(l, ad);
        if (ad.NextIndex) a.NextIndex = ad.NextIndex;
      });
      (ld.Wells || []).forEach(wd => {
        const w = l.Wells[wd.Index];
        if (!w) return;
        w.Area = wd.Area ? findArea(l, wd.Area) || null : null;
        w.Value = wd.Value; w.Unit = wd.Unit;
        w.RangeIndex = wd.RangeIndex || 1;
      });
      plate.Layers.push(l);
    });
    return plate;
  }

  // 板 → qPCR design 映射：样本层 × 靶标层 → 孔位清单 + sample_groups + targets
  function toQpcrDesign(plate, sampleLayerIdx, targetLayerIdx, groupsMap = {}) {
    const sl = plate.Layers[sampleLayerIdx], tl = plate.Layers[targetLayerIdx];
    if (!sl || !tl) throw new Error('层索引无效');
    const wells = [], samples = new Set(), targets = new Set();
    for (let i = 0; i < sl.Wells.length; i++) {
      const sample = resolvedName(sl.Wells[i]);
      const target = resolvedName(tl.Wells[i]);
      if (!sample || !target) continue;
      samples.add(sample); targets.add(target);
      wells.push({ well_position: wellName(sl.Wells[i]), row: sl.Wells[i].Row + 1, col: sl.Wells[i].Col + 1, sample_id: sample, target_id: target });
    }
    const sample_groups = {};
    samples.forEach(s => { if (groupsMap[s]) sample_groups[s] = groupsMap[s]; });
    return { wells, samples: [...samples].sort(), targets: [...targets].sort(), sample_groups };
  }

  W.plateModel = {
    alphabet, rowIndex, parseIndex, wellName,
    createPlate, createLayer, addLayer, addArea, findArea,
    tagWells, untagWells, tagConc, untagConc,
    resolvedName, rawAreaName, exportRows, toCSV, save, load, toQpcrDesign
  };
})();
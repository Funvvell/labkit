// 从 Mixology masses.json（MIT, Theo Sanderson）抽取常用试剂分子量子集 → frontend/tools/lib/reagent-mw.js
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const db = JSON.parse(readFileSync(path.join(here, '../upstream/mixology_masses.json'), 'utf8'));
const lower = new Map(Object.keys(db).map(k => [k.toLowerCase(), k]));

// 显示名 → 候选数据库键
const wanted = {
  'NaCl 氯化钠': ['nacl', 'sodium chloride'], 'KCl 氯化钾': ['kcl', 'potassium chloride'],
  'CaCl2 氯化钙': ['cacl2', 'calcium chloride'], 'MgCl2 氯化镁': ['mgcl2', 'magnesium chloride'],
  'MgSO4 硫酸镁': ['mgso4', 'magnesium sulfate'], 'NaH2PO4 磷酸二氢钠': ['nah2po4', 'sodium dihydrogen phosphate', 'monosodium phosphate'],
  'Na2HPO4 磷酸氢二钠': ['na2hpo4', 'disodium hydrogen phosphate', 'disodium phosphate'],
  'KH2PO4 磷酸二氢钾': ['kh2po4', 'potassium dihydrogen phosphate', 'monopotassium phosphate'],
  'K2HPO4 磷酸氢二钾': ['k2hpo4', 'dipotassium phosphate', 'dipotassium hydrogen phosphate'],
  'Tris 碱': ['tris', 'tris base', 'tromethamine'], 'Tris-HCl': ['tris-hcl', 'tris hydrochloride', 'tromethamine hydrochloride'],
  'EDTA 酸': ['edta', 'ethylenediaminetetraacetic acid'], 'EDTA 二钠二水': ['edta disodium salt dihydrate', 'disodium edta dihydrate'],
  'EGTA': ['egta'], 'HEPES': ['hepes'], '葡萄糖': ['glucose', 'd-glucose', 'dextrose'],
  '蔗糖': ['sucrose'], '甘氨酸': ['glycine'], 'SDS 十二烷基硫酸钠': ['sds', 'sodium dodecyl sulfate', 'sodium lauryl sulfate'],
  'DTT 二硫苏糖醇': ['dtt', 'dithiothreitol', "1,4-dithiothreitol"], 'β-巯基乙醇': ['2-mercaptoethanol', 'beta-mercaptoethanol', 'β-mercaptoethanol'],
  '尿素': ['urea'], '盐酸胍': ['guanidine hydrochloride', 'guanidinium chloride'], '咪唑': ['imidazole'],
  'NaOH 氢氧化钠': ['naoh', 'sodium hydroxide'], 'KOH 氢氧化钾': ['koh', 'potassium hydroxide'],
  'HCl 盐酸': ['hcl', 'hydrochloric acid'], 'H2SO4 硫酸': ['h2so4', 'sulfuric acid'],
  '乙酸': ['acetic acid'], '乙酸钠': ['sodium acetate'], '硫酸铵': ['ammonium sulfate'],
  'NaHCO3 碳酸氢钠': ['nahco3', 'sodium bicarbonate'], 'Na2CO3 碳酸钠': ['na2co3', 'sodium carbonate'],
  '柠檬酸': ['citric acid'], '柠檬酸钠': ['sodium citrate', 'trisodium citrate'],
  'Triton X-100': ['triton x-100', 'triton-x-100'], 'Tween 20': ['tween 20', 'polysorbate 20', 'tween-20'],
  '脱氧胆酸钠': ['sodium deoxycholate', 'deoxycholic acid sodium salt'], 'Sarkosyl': ['sarkosyl', 'n-lauroylsarcosine', 'sodium lauroyl sarcosinate'],
  'PMSF': ['pmsf', 'phenylmethylsulfonyl fluoride'], '叠氮钠': ['sodium azide'],
  '甲醛': ['formaldehyde'], '多聚甲醛': ['paraformaldehyde'],
  '甲醇': ['methanol'], '乙醇': ['ethanol'], '异丙醇': ['isopropanol', '2-propanol', 'isopropyl alcohol'],
  '丙酮': ['acetone'], 'DMSO': ['dmso', 'dimethyl sulfoxide'], '甘油': ['glycerol', 'glycerin'],
  '甲酰胺': ['formamide'], '丙烯酰胺': ['acrylamide'], 'Bis 甲叉双丙烯酰胺': ["n,n'-methylenebisacrylamide", 'bis-acrylamide', 'methylenebisacrylamide'],
  'APS 过硫酸铵': ['ammonium persulfate', 'aps'], 'TEMED': ['temed', "n,n,n',n'-tetramethylethylenediamine"],
  '溴酚蓝': ['bromophenol blue'], '二甲苯青 FF': ['xylene cyanol', 'xylene cyanol ff'],
  '硼酸': ['boric acid'], '氨苄青霉素': ['ampicillin', 'ampicillin sodium'],
  '卡那霉素': ['kanamycin', 'kanamycin sulfate'], '氯霉素': ['chloramphenicol'], '四环素': ['tetracycline'],
  'IPTG': ['iptg', 'isopropyl β-d-1-thiogalactopyranoside', 'isopropyl beta-d-thiogalactoside'],
  'X-gal': ['x-gal', '5-bromo-4-chloro-3-indolyl β-d-galactopyranoside'],
  'EB 溴化乙锭': ['ethidium bromide'], 'ATP': ['atp', 'adenosine triphosphate', 'adenosine 5\'-triphosphate'],
  'ADP': ['adp', 'adenosine diphosphate'], 'GTP': ['gtp', 'guanosine triphosphate'],
  'dATP': ['datp', 'deoxyadenosine triphosphate'], 'dTTP': ['dttp', 'deoxythymidine triphosphate'],
  'dGTP': ['dgtp', 'deoxyguanosine triphosphate'], 'dCTP': ['dctp', 'deoxycytidine triphosphate'],
  'NADH': ['nadh'], 'NADPH': ['nadph'], 'FAD': ['fad', 'flavin adenine dinucleotide'],
  '辅酶A': ['coenzyme a', 'coa'], 'cAMP': ['camp', 'cyclic amp', 'adenosine 3\',5\'-cyclic monophosphate'],
  '肌酸': ['creatine'], '肌酐': ['creatinine'], '尿酸': ['uric acid'],
  '乳酸': ['lactic acid', 'lactate'], '丙酮酸钠': ['sodium pyruvate', 'pyruvic acid sodium salt'],
  'BSA 牛血清白蛋白': ['bovine serum albumin', 'bsa'], '溶菌酶': ['lysozyme'], '胰岛素': ['insulin'],
  '亚精胺': ['spermidine'], '精胺': ['spermine'], '腐胺': ['putrescine'],
  '甜菜碱': ['betaine'], '牛磺酸': ['taurine'], '肉碱': ['carnitine', 'l-carnitine'],
  '肌醇': ['inositol', 'myo-inositol'], '山梨醇': ['sorbitol'], '甘露醇': ['mannitol'],
  '海藻糖': ['trehalose'], '麦芽糖': ['maltose'], '乳糖': ['lactose'],
  '果糖': ['fructose'], '半乳糖': ['galactose'], '核糖': ['ribose', 'd-ribose'],
  '丙氨酸': ['alanine', 'l-alanine'], '精氨酸': ['arginine', 'l-arginine'], '天冬酰胺': ['asparagine', 'l-asparagine'],
  '天冬氨酸': ['aspartic acid', 'l-aspartic acid'], '半胱氨酸': ['cysteine', 'l-cysteine'],
  '谷氨酰胺': ['glutamine', 'l-glutamine'], '谷氨酸': ['glutamic acid', 'l-glutamic acid'],
  '组氨酸': ['histidine', 'l-histidine'], '异亮氨酸': ['isoleucine', 'l-isoleucine'],
  '亮氨酸': ['leucine', 'l-leucine'], '赖氨酸': ['lysine', 'l-lysine'], '甲硫氨酸': ['methionine', 'l-methionine'],
  '苯丙氨酸': ['phenylalanine', 'l-phenylalanine'], '脯氨酸': ['proline', 'l-proline'],
  '丝氨酸': ['serine', 'l-serine'], '苏氨酸': ['threonine', 'l-threonine'], '色氨酸': ['tryptophan', 'l-tryptophan'],
  '酪氨酸': ['tyrosine', 'l-tyrosine'], '缬氨酸': ['valine', 'l-valine'],
};
// 数据库缺项时的手工基准值（常见水合物/盐形式，g/mol）
const fallback = {
  'Tris-HCl': 157.6, 'EDTA 二钠二水': 372.24, 'EGTA': 380.35, 'HEPES': 238.3,
  'SDS 十二烷基硫酸钠': 288.38, 'DTT 二硫苏糖醇': 154.25, 'β-巯基乙醇': 78.13,
  'IPTG': 238.3, 'X-gal': 408.6, 'EB 溴化乙锭': 394.3, '氨苄青霉素': 349.4,
  '卡那霉素': 484.5, '氯霉素': 323.1, '四环素': 444.4, 'PMSF': 174.2, '叠氮钠': 65.01,
  'TEMED': 116.21, 'APS 过硫酸铵': 228.2, '丙烯酰胺': 71.08, 'Bis 甲叉双丙烯酰胺': 154.17,
  '硼酸': 61.83, '脱氧胆酸钠': 414.55, 'Sarkosyl': 293.38, 'Triton X-100': 647,
  'Tween 20': 1227.7, 'BSA 牛血清白蛋白': 66430, '溶菌酶': 14300, '胰岛素': 5808,
  'ATP': 507.18, 'ADP': 427.2, 'GTP': 523.18, 'dATP': 491.18, 'dTTP': 482.17,
  'dGTP': 507.18, 'dCTP': 467.16, 'NADH': 663.43, 'NADPH': 743.4, 'FAD': 785.55,
  '辅酶A': 767.53, 'cAMP': 329.21, '肌酸': 131.13, '肌酐': 113.12, '尿酸': 168.11,
  '乳酸': 90.08, '丙酮酸钠': 110.04, '亚精胺': 145.25, '精胺': 202.34, '腐胺': 88.15,
  '甜菜碱': 117.15, '牛磺酸': 125.15, '肉碱': 161.2, '肌醇': 180.16, '山梨醇': 182.17,
  '甘露醇': 182.17, '海藻糖': 342.3, '麦芽糖': 342.3, '乳糖': 342.3, '果糖': 180.16,
  '半乳糖': 180.16, '核糖': 150.13, '多聚甲醛': 30.03, '甲醛': 30.03,
};
const out = {};
let fromDb = 0;
for (const [display, candidates] of Object.entries(wanted)) {
  let val = null;
  for (const c of candidates) { const k = lower.get(c.toLowerCase()); if (k != null && typeof db[k] === 'number') { val = db[k]; fromDb++; break; } }
  if (val == null && fallback[display] != null) val = fallback[display];
  if (val != null) out[display] = Math.round(val * 1000) / 1000;
}
const header = `// 常用试剂分子量（g/mol）—— 子集抽自 Mixology masses.json
// Mixology: Copyright (c) Theo Sanderson, MIT License. https://github.com/theosanderson/mixology
// 缺项以常见水合物/盐形式基准值补齐；聚合物/混合物（Triton X-100、Tween 20、BSA 等）为平均分子量。
`;
writeFileSync(path.join(here, '../../frontend/tools/lib/reagent-mw.js'),
  header + 'window.REAGENT_MW = ' + JSON.stringify(out, null, 1) + ';\n');
console.log('reagents:', Object.keys(out).length, 'from db:', fromDb);
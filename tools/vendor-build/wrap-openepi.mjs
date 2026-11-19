// 一次性把 OpenEpi 模块源码包进 IIFE，避免多模块全局变量（Calc/Pi/e/Title）互相覆盖。
// 上游文件逐字保留，仅外包一层隔离；产物提交进 frontend/vendor/openepi/modules/。
// 用法：node wrap-openepi.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../upstream/openepi');
const out = path.resolve(here, '../../frontend/vendor/openepi/modules');

const modules = ['TwobyTwo', 'SSPropor', 'SSCC', 'SSCohort', 'SSMean',
  'PowerCC', 'PowerCohort', 'PowerRCT', 'PowerCross', 'PowerMean'];

for (const name of modules) {
  const code = readFileSync(path.join(src, name + '.js'), 'utf8');
  const wrapped =
`// ${name}.js — OpenEpi 上游源码逐字保留（www.openepi.com，开源许可；MartinStats 部分公有领域）
// 由 tools/vendor-build/wrap-openepi.mjs 外包 IIFE 隔离全局，勿手改。
(function(){
${code}
window.__oe = window.__oe || {};
window.__oe[${JSON.stringify(name)}] = {
  Calc: typeof Calc !== 'undefined' ? Calc : null,
  CalcPower: typeof CalcPower !== 'undefined' ? CalcPower : null,
  doStatistics: typeof doStatistics !== 'undefined' ? doStatistics : null,
  Title: typeof Title !== 'undefined' ? Title : ''
};
})();
`;
  writeFileSync(path.join(out, name + '.js'), wrapped);
  console.log('wrapped', name);
}
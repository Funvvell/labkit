// 一次性 vendor 打包：stdlib 统计子集 + markdown-table → frontend/vendor/*.bundle.js
// 用法：npm install && npm run build（产物提交进仓库，前端无需构建链）
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../../frontend/vendor');

await build({
  entryPoints: [path.join(here, 'entry-stdlib.js')],
  bundle: true, format: 'iife', globalName: 'stdlib',
  outfile: path.join(out, 'stdlib-stats.bundle.js'),
  minify: true, legalComments: 'inline', target: 'es2020',
});
await build({
  entryPoints: [path.join(here, 'entry-mdtable.js')],
  bundle: true, format: 'iife', globalName: 'mdtable',
  outfile: path.join(out, 'markdown-table.bundle.js'),
  minify: true, legalComments: 'inline', target: 'es2020',
});
console.log('vendor bundles written to', out);
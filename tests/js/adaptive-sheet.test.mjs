// 自适应层契约（Phase 7 新增）：工作区窄窗堆叠必须真正生效
// 踩坑记录：把 .ws-body 的 flex-direction 写进 @container 是无效的——
// 容器查询规则只作用于容器的后代，容器自身不会被自己的查询命中，
// 结果 680px 下三栏仍是横排，横向溢出 347px（真机实测）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(f, 'utf8');
const css = read(path.join(root, 'frontend/css/adaptive.css'));
const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
const media = bare.match(/@media \(max-width:859px\)\{[\s\S]*?\n\}/);

test('adaptive.css：ws-body 的纵排切换放在 @media，不在 @container 里自引用', () => {
  assert.ok(media, '缺少 @media (max-width:859px) 工作区堆叠块');
  assert.match(media[0], /\.ws-body\{flex-direction:column/, '堆叠块必须直接切换 .ws-body 的 flex-direction');
  const cqs = [...bare.matchAll(/@container[^{]*\{([^}]*)\}/g)].map(m => m[1]);
  assert.ok(cqs.every(b => !/\.ws-body\{/.test(b)), '@container 内不得再写 .ws-body（容器无法作用于自身）');
});

test('adaptive.css：堆叠时两侧面板宽度 100%，不保留固定像素', () => {
  assert.match(media[0], /\.panel\.left,\.panel\.right\{[^}]*width:100%/);
});

test('adaptive.css：堆叠时画布区与结果区给出高度下限，避免塌成 0', () => {
  assert.match(media[0], /\.stage-wrap\{[^}]*height:380px/);
  assert.match(media[0], /#qpcrResult\{[^}]*min-height:320px/);
});

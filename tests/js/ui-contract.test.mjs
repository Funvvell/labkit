// UI 契约：保护零构建壳、关键 id、原生 dialog 与工作台信息架构。
// 仅读取静态文件，不启动浏览器；给重设计期间的 DOM/资源重构兜底。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('frontend/index.html');
const appCss = read('frontend/css/app.css');
const labCss = read('frontend/css/lab.css');
const toolboxCss = read('frontend/css/toolbox.css');
const toolhubJs = read('frontend/js/toolhub.js');
const homeJs = read('frontend/js/home.js');
const allJs = fs.readdirSync(path.join(root, 'frontend/js'))
  .filter(f => f.endsWith('.js'))
  .map(f => read('frontend/js/' + f))
  .join('\n');

test('关键 id 与零构建资源顺序完整', () => {
  const ids = [
    'win', 'sidebar', 'sideSearch', 'sideFavs', 'sideCats', 'workbenchTabs', 'wbCommand',
    'greetTitle', 'homeDate', 'homeDeck', 'deckFocus', 'deckDeadlines', 'deckRecent',
    'btnWorkbench', 'btnQuickFocus', 'dashGrid', 'toolhubGrid', 'toolhubSearch',
    'toolTitle', 'toolCrumb', 'toolHost', 'cropFile', 'cropSource',
    /* P5：工具箱个性化 + 双市场 */
    'toolhubTabs', 'paneTools', 'paneMarket', 'toolMarketHost', 'btnToolboxEdit', 'toolboxEditBar',
    'extToolList', 'extWidgetList', 'btnDashAddCard',
  ];
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  const order = ['css/app.css', 'tools/tools.css', 'vendor/gridstack.min.css', 'css/lab.css', 'css/toolbox.css'];
  const positions = order.map(s => html.indexOf(s));
  assert.ok(positions.every(p => p >= 0), 'stylesheet missing');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'stylesheet order changed');
  const scripts = ['js/store.js', 'js/toolbox.js', 'js/toolhub.js', 'js/shell.js'];
  const sp = scripts.map(s => html.indexOf(s));
  assert.ok(sp.every(p => p >= 0), 'script missing');
  assert.deepEqual([...sp].sort((a, b) => a - b), sp, 'toolbox.js 必须在 toolhub.js 之前加载（toolhub 求值期即渲染）');
  const home = ['js/dashboard.js', 'js/home-deck.js', 'js/settings.js'];
  const hp = home.map(s => html.indexOf(s));
  assert.ok(hp.every(p => p >= 0), 'script missing');
  assert.deepEqual([...hp].sort((a, b) => a - b), hp, 'home-deck must load after dashboard and before settings');
});

test('侧栏三组与 8 个工作台 tab 仍在', () => {
  for (const label of ['工作台', '工具库', '资料与设置']) assert.ok(html.includes(`>${label}<`) || html.includes(`>${label}\n`), label);
  const tabs = [...html.matchAll(/class="wb-tab[^"]*"[^>]*data-nav="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(tabs, ['home', 'tasks', 'projects', 'experiments', 'literature', 'labres', 'reports', 'focus']);
});

test('阻塞浮层使用原生 dialog，没有手写 modal ARIA', () => {
  const ids = ['palMask', 'helpMask', 'notifyMask', 'welcomeMask'];
  for (const id of ids) {
    const re = new RegExp(`<dialog[^>]*id="${id}"[^>]*>`);
    assert.ok(re.test(html), `#${id} must be a native dialog`);
  }
  assert.ok(!/role="dialog"/.test(html + allJs), 'do not hand-roll role=dialog');
  assert.ok(!/aria-modal/.test(html + allJs), 'do not hand-roll aria-modal');
  assert.ok(allJs.includes("addEventListener('cancel'"), 'welcome cancel guard should prevent accidental close');
});

test('任务与工具卡采用真实控件语义', () => {
  assert.ok(homeJs.includes('class="task-check" data-check=') && homeJs.includes('type="checkbox"'));
  assert.ok(toolhubJs.includes('class="tc-open" data-tool-id='));
  assert.ok(/<div class="tool-card/.test(toolhubJs), 'tool card must be a div');
  assert.ok(!toolhubJs.includes('<button class="tool-card"'), 'tool cards must not nest action buttons');
});

test('样式预算与级联保护', () => {
  assert.ok(Buffer.byteLength(appCss) <= 60000, 'app.css over budget');
  assert.ok(Buffer.byteLength(labCss) <= 15000, 'lab.css over budget');
  assert.ok(Buffer.byteLength(toolboxCss) <= 12000, 'toolbox.css over budget');
  assert.ok(!/!important/.test(labCss), 'new component layer must not use !important');
  assert.ok(!/!important/.test(toolboxCss), 'toolbox.css must not use !important');
  assert.ok(!/<style\b/i.test(html), 'no inline style block in the app shell');
});

test('重设计新增的组件层已加载', () => {
  for (const cls of ['home-deck', 'deck-panels', 'workbench-tabs', 'toolhub-bar', 'settings-grid']) assert.ok(labCss.includes('.' + cls), cls);
  assert.ok(html.includes('css/lab.css'));
  assert.ok(html.includes('id="toolhubChips"'));
});

test('扩展管理：工具与卡片分成两个市场入口', () => {
  assert.ok(html.includes('扩展管理'), '侧栏与页面应改名为「扩展管理」');
  assert.ok(html.includes('data-thtab="market"'), '工具库应有「获取更多工具」tab');
  assert.ok(html.includes('data-ptab') === false, '旧的三个市场 tab 应移除');
  assert.ok(!/id="view-plugins"[\s\S]{0,600}?id="pluginSearch"/.test(html), '扩展管理页不再内置搜索（市场视图已下沉）');
  assert.ok(html.includes('id="btnPluginLocal"') && html.includes('id="btnPluginSource"'), '开发载入与索引源入口仍可用');
});

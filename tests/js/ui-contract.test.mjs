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
const tabsCss = read('frontend/css/tabs.css');
const adaptiveCss = read('frontend/css/adaptive.css');
const typeCss = read('frontend/css/type.css');
const visualCss = read('frontend/css/visual.css');
const toolhubJs = read('frontend/js/toolhub.js');
const tabsJs = read('frontend/js/tabs.js');
const homeJs = read('frontend/js/home.js');
const allJs = fs.readdirSync(path.join(root, 'frontend/js'))
  .filter(f => f.endsWith('.js'))
  .map(f => read('frontend/js/' + f))
  .join('\n');

test('关键 id 与零构建资源顺序完整', () => {
  const ids = [
    'win', 'sidebar', 'sideSearch', 'sideFavs', 'sideCats',
    'greetTitle', 'homeDate', 'homeDeck', 'deckFocus', 'deckDeadlines', 'deckRecent',
    'btnWorkbench', 'btnQuickFocus', 'dashGrid', 'toolhubGrid', 'toolhubSearch',
    'toolTitle', 'toolCrumb', 'toolHost', 'cropFile', 'cropSource',
    /* P7：工具箱标签页 */
    'toolTabs', 'toolTabsTrack', 'toolTabsMenu', 'toolSource',
    /* P5：工具箱个性化 + 双市场 */
    'toolhubTabs', 'paneTools', 'paneMarket', 'toolMarketHost', 'btnToolboxEdit', 'toolboxEditBar',
    'extToolList', 'extWidgetList', 'btnDashAddCard',
  ];
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  const order = ['css/app.css', 'tools/tools.css', 'vendor/gridstack.min.css', 'css/lab.css', 'css/toolbox.css', 'css/tabs.css', 'css/adaptive.css', 'css/type.css', 'css/visual.css'];
  const positions = order.map(s => html.indexOf(s));
  assert.ok(positions.every(p => p >= 0), 'stylesheet missing');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'stylesheet order changed');
  const scripts = ['js/store.js', 'js/toolbox.js', 'js/toolhub.js', 'js/tabs.js', 'js/shell.js'];
  const sp = scripts.map(s => html.indexOf(s));
  assert.ok(sp.every(p => p >= 0), 'script missing');
  assert.deepEqual([...sp].sort((a, b) => a - b), sp, 'toolbox.js → toolhub.js → tabs.js → shell.js 顺序不可变');
  const home = ['js/dashboard.js', 'js/home-deck.js', 'js/settings.js'];
  const hp = home.map(s => html.indexOf(s));
  assert.ok(hp.every(p => p >= 0), 'script missing');
  assert.deepEqual([...hp].sort((a, b) => a - b), hp, 'home-deck must load after dashboard and before settings');
});

test('工具标签页：tablist 语义 + 每工具独立 pane + 工具库不占标签', () => {
  assert.ok(/id="toolTabsTrack"[^>]*role="tablist"/.test(html), '标签轨道必须是 tablist');
  assert.ok(/<div id="toolHost" class="tab-panes"><\/div>/.test(html), '#toolHost 是 pane 栈');
  assert.ok(tabsJs.includes('role="tab"') && tabsJs.includes('aria-selected'), '标签需 tab 语义与选中态');
  assert.ok(!tabsJs.includes('TAB_LIB'), '工具库不得作为标签进入状态模型');
  assert.ok(tabsJs.includes('data-tab-close=') && tabsJs.includes('class="tt-x"'), '每个标签都要有关闭钮');
  assert.ok(tabsJs.includes('tabsAfterEmpty') && tabsJs.includes("navigate('toolhub')"), '最后一个工具关闭后必须回工具库');
  assert.ok(!tabsJs.includes('getCurrentWindow().close()'), '关闭最后一个工具标签不得关掉工具箱窗口');
  assert.ok(tabsJs.includes('tabpanel'), 'pane 需 tabpanel 语义');
  assert.ok(!/role="dialog"/.test(tabsJs), '不得手写 dialog 语义');
  const router = read('frontend/js/router.js');
  const shell = read('frontend/js/shell.js');
  assert.ok(router.includes('function mainDesktopToolId'), '主窗工具路由必须收口到单一判定函数');
  assert.ok(router.includes('openToolboxWindow(id)'), '主窗具体工具/工作区深链需唤起工具窗口');
  assert.ok(!router.includes('MAIN_DESKTOP && isToolArea(r.name)'), '「全部工具」不得被整段重定向到独立窗口');
  assert.ok(router.includes("r.name === 'tool' && r.arg"), '仅具体工具才唤窗');
  assert.ok(router.includes("r.name === 'crop' || r.name === 'qpcr'"), '工作区仍由工具窗口承载');
  assert.ok(router.includes("history.replaceState(null, '', '#/toolhub')"), '唤窗后主窗落回工具库');
  assert.ok(!shell.includes('openToolboxWindow'), '侧栏「全部工具」必须留在主窗页内');
  assert.ok(router.includes('tabsBarSync(name)'), '标签栏显隐需跟随视图');
});

test('工作台导航去重：顶部不再有重复 tabs，入口保留在侧栏与工作台菜单', () => {
  for (const label of ['工作台', '工具库', '资料与设置']) assert.ok(html.includes(`>${label}<`) || html.includes(`>${label}\n`), label);
  assert.ok(!html.includes('workbenchTabs') && !html.includes('class="wb-tab'), '顶部重复工作台 tabs 应已移除');
  assert.ok(html.includes('id="btnWorkbench"'), '工作台子页总入口必须保留');
  assert.ok(html.includes('data-nav="home"') && html.includes('data-nav="literature"'), '侧栏一级入口必须保留');
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
  assert.ok(Buffer.byteLength(tabsCss) <= 12000, 'tabs.css over budget');
  assert.ok(Buffer.byteLength(adaptiveCss) <= 14000, 'adaptive.css over budget');
  assert.ok(Buffer.byteLength(typeCss) <= 6000, 'type.css over budget');
  assert.ok(Buffer.byteLength(visualCss) <= 30000, 'visual.css over budget');
  assert.ok(!/!important/.test(visualCss), 'visual.css must not use !important');
  assert.ok(!/!important/.test(labCss), 'new component layer must not use !important');
  assert.ok(!/!important/.test(toolboxCss), 'toolbox.css must not use !important');
  assert.ok(!/!important/.test(tabsCss), 'tabs.css must not use !important');
  assert.ok(!/!important/.test(adaptiveCss), 'adaptive.css must not use !important');
  assert.ok(!/!important/.test(typeCss), 'type.css must not use !important');
  assert.ok(!/<style\b/i.test(html), 'no inline style block in the app shell');
});

test('自适应层：工具窗口隐藏侧栏 + 组件用容器查询而非窗口断点', () => {
  // 工具独立窗口是单一用途窗口，220px 侧栏在最小宽度下会把工作区画布挤到几十像素
  assert.ok(/body\.win-mode \.sidebar\{display:none\}/.test(adaptiveCss), '工具窗口必须隐藏侧栏');
  assert.ok(adaptiveCss.includes('.ws-body{container-type:inline-size}'), '工作区三栏应按容器收拢');
  assert.ok(!/\.panel\.left\{width:268px/.test(adaptiveCss), '不得再写死面板宽度');
  const toolsCss = read('frontend/tools/tools.css');
  assert.ok(toolsCss.includes('.tool-wrap{container-type:inline-size}') || adaptiveCss.includes('.tool-wrap{container-type:inline-size}'),
    '工具页需要容器查询宿主');
  assert.ok(/@container \(max-width:700px\)\{\.tsplit/.test(toolsCss), 'tsplit 必须改容器查询');
  assert.ok(!/@media\(max-width:900px\)\{\.tsplit/.test(toolsCss), '不得保留绑窗口宽度的旧断点');
});

test('重设计新增的组件层已加载', () => {
  for (const cls of ['home-deck', 'deck-panels', 'toolhub-bar', 'settings-grid']) assert.ok(labCss.includes('.' + cls), cls);
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

test('插件索引串行：启动/刷新不得并发拉两个市场', () => {
  const src = fs.readFileSync(path.join(root, 'frontend/js/plugins.js'), 'utf8');
  assert.ok(!src.includes("Promise.all(['tool', 'widget']"), '不得用 Promise.all 并发拉取索引');
  assert.ok(src.includes('_pluginIndexChain'), '索引请求必须走串行队列');
  assert.ok(src.includes('await pluginFetchIndex(k, refresh)'), 'pluginFetchAll 必须逐市场 await');
});

test('index.html 无重复 id（重复 id 会让 getElementById 只绑到第一个，另一个成死按钮）', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const seen = new Set(), dup = new Set();
  for (const id of ids) { if (seen.has(id)) dup.add(id); seen.add(id); }
  assert.deepEqual([...dup], [], '重复 id：' + [...dup].join(', '));
});

test('扩展管理页与设置页的「管理索引源」两个入口都被绑定', () => {
  assert.ok(html.includes('id="btnPluginSourceSettings"'), '设置页入口需独立 id');
  assert.ok(allJs.includes('#btnPluginSource,#btnPluginSourceSettings'), '两个入口都要绑 onclick');
});

test('分类自定义入口可发现：按钮语义化 + 页头文案指向 + Ctrl+K 可搜', () => {
  assert.ok(html.includes('>整理分组</button>'), '入口按钮需说明是「整理分组」而非含糊的「整理」');
  assert.ok(html.includes('分组可自定义'), '页头文案需明说分组可自定义并指向该按钮');
  assert.ok(toolhubJs.includes("'完成整理':'整理分组'"), 'JS 切换标签不得退回含糊的「整理」');
  const pal = read('frontend/js/palette.js');
  assert.ok(pal.includes("'toolbox-edit'") && pal.includes('自定义工具分组'), 'Ctrl+K 必须能搜到分组自定义');
});

test('顶栏头像是真实按钮且绑定点击（不得是拖拽区里的死 div）', () => {
  assert.ok(html.includes('<button class="avatar" id="btnAvatar"'), '头像必须是 button 而非 div');
  assert.ok(!/<div class="avatar"/.test(html), '不得残留装饰 div');
  const boot = read('frontend/js/boot.js');
  assert.ok(boot.includes("avBtn.onclick=()=>navigate('settings')"), '头像需绑定点击进设置');
  assert.ok(boot.includes('function refreshAvatar'), '字母取称呼首字而非硬编码 V');
  const css = read('frontend/css/app.css');
  assert.ok(/\.avatar\{width:30px;height:30px/.test(css), '头像与同组 icon-btn 等高 30px');
});

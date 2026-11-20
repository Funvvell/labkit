# LabKit 插件开发指南

LabKit 的社区插件机制参照 [Obsidian 社区插件](https://obsidian.md/help/community-plugins)：
**审核制索引仓库 + 开发者仓库 GitHub Release 分发 + 用户显式开启**。插件不是沙箱环境——
它与内置工具共享全局作用域、IPC 与本地台账权限，**请只安装来源可信的插件**。

视觉契约见 [docs/DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)；内置工具开发流程见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 1. 机制一览

```
索引仓库 Funvvell/labkit-plugins/plugins.json   （PR 审核合入 = 上架）
        │  {id,name,author,description,repo,kind,minAppVersion}
        ▼
开发者仓库 GitHub Release 资产
        │  manifest.json + main.js + [styles.css]
        ▼
LabKit 市场页「安装」→ Rust 校验/下载/原子落盘
        │  ~/.liver_portal_crop/plugins/<id>/<version>/
        ▼
自定义协议 http://labkit-plugin.localhost/<id>/<version>/main.js 注入
```

- 不自动更新：安装后需手动「检查更新」；更新保留旧版本目录，可一键回退。
- 默认关闭：设置 → 插件市场 → 「允许社区插件」，与 Obsidian 受限模式同款。
- 安装确认弹窗展示来源仓库、版本、类型与权限说明。
- 索引走 `raw.githubusercontent.com`（无 API 限速），Release 解析缓存 30 分钟；可选 PAT 提额。

## 2. 插件包格式

### `manifest.json`

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | `[A-Za-z0-9][A-Za-z0-9_-]{0,63}`，与索引条目一致 |
| `name` | 是 | 市场显示名 |
| `version` | 否 | 与 Release tag 一致；不一致会拒绝安装 |
| `description` / `author` / `repo` | 否 | 市场展示 |
| `minAppVersion` | 否 | 低于该版本拒绝安装 |
| `kind` | 否 | `tool` / `widget` / `both` |
| `main` | 否 | 默认 `main.js`，只允许白名单文件名 |
| `styles` | 否 | 默认无，只允许 `styles.css` |
| `sha256` | 否 | main.js 的 sha256；声明后逐字节校验 |

### `main.js`（classic script，零构建）

不要用 `import` / `export`，不要依赖打包器。脚本在 LabKit 全局作用域执行，通过 `LabKit` API 注册：

```js
// 注册工具：id 自动加前缀 x-<pluginId>-，与内置工具隔离
LabKit.registerTool(
  { id: 'hello', name: '示例工具', group: '社区插件', desc: '一句话描述', py: 'slgj',
    help: '公式 / 输入约定 / 参考文献', source: '作者/许可', persist: false },
  function (host) {
    host.innerHTML = '<input id="x" type="number"><button id="go">计算</button><pre id="out"></pre>';
    host.querySelector('#go').onclick = () => {
      host.querySelector('#out').textContent = String(Number(host.querySelector('#x').value) * 2);
    };
  }
);

// 注册卡片：同一组件提供多尺寸形态（mini/small/medium/large）
LabKit.registerWidget({
  id: 'hello-card', title: '示例卡片', size: '2x2',
  sizes: ['1x1', '1x2', '2x2', '4x2'],
  body(size) {
    return size.w <= 1 && size.h <= 1 ? '<div id="hcMini"></div>' : '<div id="hcFull"></div>';
  },
  render(el, size) {
    const n = (window.TOOL_META || []).filter(t => t.plugin).length;
    const mini = el.querySelector('#hcMini'), full = el.querySelector('#hcFull');
    if (mini) mini.innerHTML = '<div class="big-num">' + n + '</div><div class="sub">插件工具数</div>';
    if (full) full.innerHTML = '<div class="sub">已安装 ' + n + ' 个插件工具</div>';
  },
});
```

注册 API 细节：

- `LabKit.registerTool(meta, fn)` 返回带前缀的 id；撞名会拒绝（返回已有 id，不覆盖）。
- `LabKit.registerWidget(def)` 同上；`def.body(size)` 接收 `{w,h}`，`render(el,size)` 负责数据刷新。
- 插件工具自动获得统一壳层（示例 / 重置 / 帮助 / 导出条）与表单持久化；不需要自己写这些。
- 前缀规则：插件 id `demo` + 工具 id `hello` → `x-demo-hello`。窗口标签 `tool-x-demo-hello`（只含字母数字与 `-`）。
- 可用 CSS 变量与组件类名见 `docs/DESIGN_SYSTEM.md`；**不要写死色值**，否则深色模式会破。

### `styles.css`（可选）

仅用于插件专属样式，用 `x-<pluginId>-` 类名前缀避免污染；加载时自动注入，禁用/卸载时移除。

## 3. 本地调试（免发布）

市场页 → 「载入本地插件」→ 选择包含 `manifest.json` / `main.js` 的目录。
文件会被复制到 `~/.liver_portal_crop/plugins/<id>/<version>/` 并立即注入，改完代码重新载入即可。
`manifest.json` 省略 `version` 时按 `dev` 版本目录存放。

## 4. 发布与上架

1. 在开发者仓库打 tag `vX.Y.Z`，创建 Release，上传三个资产：`manifest.json`、`main.js`、`styles.css`（可选）。
   资产文件名必须与 manifest 一致；`.js` / `.css` 以 UTF-8 编码。
2. Fork `Funvvell/labkit-plugins`，在 `plugins.json` 追加条目后发 PR：

   ```json
   {
     "id": "demo",
     "name": "示例插件",
     "author": "your-name",
     "description": "一句话说明",
     "repo": "your-name/labkit-plugin-demo",
     "kind": "both",
     "minAppVersion": "0.3.0"
   }
   ```

3. PR 审核清单：id 未占用；repo 公开且 Release 资产齐全；无混淆/远控/遥测代码；
   无 GPLv3 代码（许可需 MIT 兼容）；UI 文案中文；`minAppVersion` 合理；描述不涉及临床诊断用途。
4. 合入即上架。索引缓存 30 分钟，市场页「刷新索引」可立即生效。

模板仓库 `Funvvell/labkit-plugin-template` 含可运行示例与 Release Action，
本地副本在 `ecosystem/labkit-plugin-template/`；索引仓库本地副本在 `ecosystem/labkit-plugins/`。

## 5. 安全与限制（明示）

- 插件是**受信 JS**，与内置工具同权限（可读/写台账、触发 IPC、操作文件）。没有硬沙箱。
  iframe + postMessage 沙箱会改变 API 形态，列为远期独立设计。
- 默认关闭、显式安装、不自动更新；Rust 侧校验 manifest、id、资产名、sha256 与路径越界。
- 插件脚本运行抛错时只隔离该插件并提示禁用建议，不影响内置功能。
- 插件市场不可达时使用 30 分钟索引缓存 + 离线提示。
- 视觉规范与新增工具检查清单：[docs/DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)。

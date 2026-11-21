# LabKit 扩展开发指南

LabKit 的社区扩展机制参照 [Obsidian 社区插件](https://obsidian.md/help/community-plugins) 的
「审核制索引仓库 + 开发者仓库 GitHub Release 分发 + 用户显式开启」，并按
[HACS](https://hacs.xyz/) 的 `category` 与 [Directus](https://directus.io/docs/guides/extensions/overview)
的 extension `type` 做了**类型硬约束**：一个包只能属于一类。

| 类型 | `manifest.kind` | 只能调用 | 用户下载入口 | 装完出现在 |
| --- | --- | --- | --- | --- |
| 工具扩展 | `tool` | `LabKit.registerTool()` | 工具库 →「获取更多工具」 | 工具库 + 侧栏分类 + Ctrl+K |
| 卡片扩展 | `widget` | `LabKit.registerWidget()` | 首页 →「＋ 卡片」→「获取卡片」 | 「+ 添加卡片」列表 |

扩展不是沙箱环境——它与内置工具共享全局作用域、IPC 与本地台账权限，**请只安装来源可信的扩展**。
视觉契约见 [docs/DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)；内置工具开发流程见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 1. 机制一览

```
索引仓库 Funvvell/labkit-plugins
  ├─ tools.json      {id,name,author,description,repo,kind:"tool",minAppVersion}
  └─ widgets.json    {id,name,author,description,repo,kind:"widget",minAppVersion}
        │  PR 审核合入 = 上架
        ▼
开发者仓库 GitHub Release 资产
        │  manifest.json + main.js + [styles.css]
        ▼
LabKit 对应市场的「安装」→ Rust 校验类型/下载/原子落盘
        │  ~/.liver_portal_crop/plugins/<id>/<version>/
        ▼
自定义协议 http://labkit-plugin.localhost/<id>/<version>/main.js 注入
        │  注入期设置 __LK_CURRENT_PLUGIN_KIND，注册 API 按类型放行/拦截
        ▼
tool → TOOL_META + LabKitTools ／ widget → WIDGETS
```

- **不自动更新**：安装后需手动「检查更新」；更新保留旧版本目录，可一键回退。
- **默认关闭**：设置 →「扩展」→「允许社区扩展」，与 Obsidian 受限模式同款。
- **安装前校验类型**：市场与包类型不符时直接拒绝（不是装完再拦），Rust 与前端各校验一次。
- 索引走 `raw.githubusercontent.com`（无 API 限速），Release 解析与索引各缓存 30 分钟；可选 PAT 提额。
- 两个市场的索引**各自缓存、各自刷新**，互不影响。

## 2. 扩展包格式

### `manifest.json`

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | `[A-Za-z0-9][A-Za-z0-9_-]{0,63}`，与索引条目一致 |
| `name` | 是 | 市场显示名 |
| `kind` | **是** | `tool` 或 `widget`。`both` 仅为存量兼容，新包禁止 |
| `version` | 否 | 与 Release tag 一致；不一致会拒绝安装 |
| `description` / `author` / `repo` | 否 | 市场展示 |
| `minAppVersion` | 否 | 低于该版本拒绝安装 |
| `main` | 否 | 默认 `main.js`，只允许白名单文件名 |
| `styles` | 否 | 默认无，只允许 `styles.css` |
| `sha256` | **远程必填** | `main.js` 的 sha256（`sha256sum main.js`）。远程安装缺失即拒绝；本地开发载入可免，便于改一行装一次 |

> `kind` 缺失时按安装来源推断（市场类型），并标 `legacy`；扩展管理页会提示补声明。
> 写错成其他值会被直接拒绝，避免「静默降级成工具包」这类难查问题。

### 工具扩展 `main.js`（classic script，零构建）

不要用 `import` / `export`，不要依赖打包器。脚本在 LabKit 全局作用域执行：

```js
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
```

工具自动获得统一壳层（示例 / 重置 / 帮助 / 导出条）与表单状态持久化，无需自己实现。

### 卡片扩展 `main.js`

```js
LabKit.registerWidget({
  id: 'hello-card', title: '示例卡片', size: '2x2',
  sizes: ['1x1', '1x2', '2x2', '4x2'],   // 必须与 gridstack 的 1/2/4 列 × 1~4 行对齐
  body(size) {
    return size.w <= 1 && size.h <= 1 ? '<div id="hcMini"></div>' : '<div id="hcFull"></div>';
  },
  render(el, size) {
    const mini = el.querySelector('#hcMini'), full = el.querySelector('#hcFull');
    if (mini) mini.innerHTML = '<div class="big-num">0</div><div class="sub">摘要</div>';
    if (full) full.innerHTML = '<div class="sub">展开态</div>';
  },
});
```

- `sizes` 里没声明的宽高会被吸附到最近的声明档，所以每档都必须能渲染。
- `render(el, size)` 在卡片尺寸变化、数据刷新、主题切换后都会被调用；`el` 就是卡片正文容器。
- 需要 DOM 事件时只绑在 `el` 内部，不要用全局 id（同一张卡在多个窗口各渲染一份）。

### `styles.css`（可选）

仅用于扩展专属样式，用 `x-<扩展id>-` 类名前缀避免污染；加载时自动注入，禁用/卸载时移除。
颜色必须走 CSS 变量（`var(--ink)` / `var(--card)` / `var(--accent)` …），否则深色模式会破。

## 3. 本地调试（免发布）

「扩展管理」→ 选择「载入为：工具扩展 / 卡片扩展」→「选择目录并载入」。
文件会被复制到 `~/.liver_portal_crop/plugins/<id>/<version>/` 并立即注入；改完重新载入即可。
目录里没写 `kind` 时按你选的类型推断（并标 legacy）。

调试时可从三个地方验证：
1. 工具库页对应分组出现新工具（或「获取更多工具」里显示已安装）；
2. 首页「+ 添加卡片」里出现新卡片（卡片扩展）；
3. 「扩展管理」里能看到「已注册：工具 N · 卡片 M」——越界注册会标红。

## 4. 发布与上架

1. 在开发者仓库打 tag `vX.Y.Z`，创建 Release，上传资产：`manifest.json`、`main.js`、`styles.css`（可选）。
   资产文件名必须与 manifest 一致；`.js` / `.css` 以 UTF-8 编码。
2. Fork `Funvvell/labkit-plugins`，**按类型**在 `tools.json` 或 `widgets.json` 追加条目后发 PR：

   ```json
   { "id": "demo", "name": "示例工具扩展", "author": "your-name",
     "description": "一句话说明", "repo": "your-name/labkit-tool-demo",
     "kind": "tool", "minAppVersion": "0.4.0" }
   ```

3. PR 审核清单：id 未占用；repo 公开且 Release 资产齐全；`kind` 与索引文件一致；
   只调用对应注册 API；无混淆/远控/遥测代码；无 GPLv3 代码（许可需 MIT 兼容）；
   UI 文案中文；`minAppVersion` 合理；描述不涉及临床诊断用途。
4. 合入即上架。索引缓存 30 分钟，对应市场面板「刷新索引」可立即生效。

模板仓库：工具扩展 `Funvvell/labkit-plugin-template`、卡片扩展 `Funvvell/labkit-plugin-template-widget`
（本地副本在 `ecosystem/`）。索引仓库本地副本在 `ecosystem/labkit-plugins/`。

## 5. 索引源与类型推断

「扩展管理 → 索引源」三种填法：

| 填法 | 客户端请求 |
| --- | --- |
| 留空 | `<官方目录>/tools.json`、`<官方目录>/widgets.json` |
| 目录（可带/不带结尾 `/`） | `<目录>/tools.json`、`<目录>/widgets.json` |
| 单个 `.json` | 只读这一份，按条目 `kind` 过滤 |

- 只允许 `https://raw.githubusercontent.com/` 域。
- `<目录>/tools.json` 返回 **404** 才回退到 `<目录>/plugins.json`（存量合并索引）；
  网络错误、限流、JSON 解析失败直接报错，不静默降级成空市场。
- 回退命中时市场面板会显示「索引来自存量合并文件」。
- 客户端会读取 Windows 系统代理，并使用 Windows 证书库校验 HTTPS。Steam++ / 代理若用自签根证书解密 `raw.githubusercontent.com`，必须把该根证书加入 Windows「受信任的根证书颁发机构」，否则会报 TLS `UnknownIssuer`；这与索引 404 不是同一类错误。

类型推断顺序：`manifest.kind` > 安装市场 > 索引条目 `kind` > `tool`。
包内没有声明单一类型时记为 `legacy`，扩展管理页显示「旧式合并包」。

## 6. 安全与限制（明示）

- 扩展是**受信 JS**，与内置工具同权限（可读/写台账、触发 IPC、操作文件）。没有硬沙箱。
  iframe + postMessage 沙箱会改变 API 形态，列为远期独立设计。
- 默认关闭、显式安装、不自动更新；Rust 侧校验 manifest、id、资产名、sha256、路径越界与**类型冲突**。
- 类型门禁是运行时的第二道闸：即使包里写了两类注册，不匹配的那一侧会被拦下并记入
  `blocked`，扩展管理页可见，不影响另一侧。
- 扩展脚本抛错时只隔离该扩展并提示禁用建议，不影响内置功能。
- 市场不可达时使用 30 分钟索引缓存 + 离线提示。
- 视觉规范与新增工具检查清单：[docs/DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)。

# LabKit 社区扩展索引（本地副本）

本目录是索引仓库 `Funvvell/labkit-plugins` 的本地副本。

## 两份索引，两种类型

| 文件 | 类型 | 客户端入口 | 装完出现在 |
| --- | --- | --- | --- |
| [`tools.json`](tools.json) | `kind: "tool"` | 工具库 →「获取更多工具」 | 工具库 / 侧栏工具分类 |
| [`widgets.json`](widgets.json) | `kind: "widget"` | 首页 →「＋ 卡片」→「获取卡片」 | 「+ 添加卡片」列表 |
| [`plugins.json`](plugins.json) | 存量合并索引 | 仅作 404 回退 | 按条目 `kind` 过滤后进两个市场 |

一个包只能属于一类：`manifest.kind` 必须与所投的索引文件一致。
`kind: "both"` 仍可安装（旧式合并包），但客户端会标「旧式合并包」并记录两侧实际注册数。

## 上架流程

1. 开发者在自己的仓库发布 GitHub Release，资产含 `manifest.json` + `main.js` + 可选 `styles.css`；
2. Fork 本仓库，按类型在 `tools.json` 或 `widgets.json` 追加一条记录，发 PR；
3. 按 [审核清单](PULL_REQUEST_TEMPLATE.md) 审核，合入即上架；
4. 客户端缓存 30 分钟，市场面板「刷新索引」立即生效。

模板：工具扩展见 `Funvvell/labkit-plugin-template`，卡片扩展见 `Funvvell/labkit-plugin-template-widget`
（本地副本在同级目录）。开发文档见主仓库 `docs/PLUGIN_DEV.md`。

## 自定义索引源

客户端「扩展管理 → 索引源」支持三种填法：

- 留空：官方目录 `…/labkit-plugins/main/`，客户端拼 `<base>/tools.json` 与 `<base>/widgets.json`；
- 目录：任意 `raw.githubusercontent.com` 上的目录，同样拼两个文件名；
- 单个 `.json`：老配置继续可用，客户端读这一份并按条目 `kind` 过滤。

只允许 `https://raw.githubusercontent.com/` 域；`<base>/tools.json` 返回 404 时才回退到
`<base>/plugins.json`，网络错误与限流直接报错（不静默降级成空市场）。

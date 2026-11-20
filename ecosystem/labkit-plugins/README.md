# LabKit 社区插件索引（本地副本）

本目录是索引仓库 `Funvvell/labkit-plugins` 的本地副本。上架流程：

1. 开发者在自己的仓库发布 GitHub Release，资产含 `manifest.json` + `main.js` + 可选 `styles.css`；
2. Fork 本仓库，在 [`plugins.json`](plugins.json) 追加一条记录，发 PR；
3. 按 [审核清单](PULL_REQUEST_TEMPLATE.md) 审核，合入即上架；
4. 客户端缓存 30 分钟，市场页「刷新索引」立即生效。

索引条目字段见 [`plugins.json`](plugins.json)，开发文档见主仓库 `docs/PLUGIN_DEV.md`。
仓库创建与首次 PR 需要用户 GitHub 账号操作（本目录供推送前审阅）。

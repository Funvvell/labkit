## 插件上架审核清单

- [ ] `id` 符合 `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` 且未被占用
- [ ] `repo` 为公开 GitHub 仓库，格式 `owner/name`
- [ ] Release 资产齐全：`manifest.json`、`main.js`（+ 可选 `styles.css`）
- [ ] manifest 的 `id` 与索引条目一致；`minAppVersion` 合理
- [ ] 无混淆代码、无遥测、无远程控制；网络请求（如有）在描述中说明
- [ ] 代码许可 MIT 兼容，未复制 GPLv3 项目代码
- [ ] UI 中文，使用 `docs/DESIGN_SYSTEM.md` 的 CSS 变量，深色模式可用
- [ ] 描述不涉及临床诊断用途

插件作者：
索引条目：
审核人备注：

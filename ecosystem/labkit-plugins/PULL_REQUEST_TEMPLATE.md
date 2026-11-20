## 扩展上架审核清单

- [ ] 提交目标文件与类型一致：工具扩展改 `tools.json`，卡片扩展改 `widgets.json`
- [ ] `id` 符合 `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` 且未被占用（两个索引共享命名空间）
- [ ] `repo` 为公开 GitHub 仓库，格式 `owner/name`
- [ ] Release 资产齐全：`manifest.json`、`main.js`（+ 可选 `styles.css`）
- [ ] `manifest.kind` 与索引文件一致，**不得为 `both`**（存量包除外，需在描述注明「待拆分」）
- [ ] manifest 的 `id` 与索引条目一致；`minAppVersion` 合理
- [ ] 只调用对应注册 API：工具包只用 `registerTool`，卡片包只用 `registerWidget`
- [ ] 无混淆代码、无遥测、无远程控制；网络请求（如有）在描述中说明
- [ ] 代码许可 MIT 兼容，未复制 GPLv3 项目代码
- [ ] UI 中文，使用 `docs/DESIGN_SYSTEM.md` 的 CSS 变量，深色模式可用
- [ ] 卡片包声明了 `sizes`（至少一档），且 `body(size)` 在每档都能渲染
- [ ] 描述不涉及临床诊断用途

扩展作者：
索引条目（文件 + 行）：
审核人备注：

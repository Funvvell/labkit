# LabKit 插件模板（本地副本）

这是社区插件仓库 `Funvvell/labkit-plugin-template` 的本地副本，含：

- `manifest.json`：插件元数据；
- `main.js`：一个示例工具 + 一个多尺寸示例卡片（classic script）；
- `styles.css`：带 `x-starter-` 前缀的插件专属样式；
- `.github/workflows/release.yml`：打 tag 自动创建 Release 并上传三个资产。

## 调试

1. 把本目录复制到任意位置，改 `manifest.json` 的 `id` / `name`。
2. LabKit 市场页 → 「载入本地插件」→ 选该目录。
3. 改完 `main.js` 后重新载入即可（相同版本会原子替换）。

## 发布

```bash
git tag v1.0.0 && git push origin v1.0.0
```

Release 生成后，到索引仓库 `Funvvell/labkit-plugins` 发 PR 追加条目。
详见主仓库 `docs/PLUGIN_DEV.md`。

<!-- 感谢贡献！请确认以下清单 / Thanks! Please confirm the checklist -->

## 改了什么 / What changed

<!-- 一句话说明 + 关联 issue / One-line summary + linked issue -->

## 为什么 / Why

<!-- 动机与取舍 / Motivation and trade-offs -->

## 如何验证 / How verified

- [ ] `cd rust && cargo test` 通过 / passes
- [ ] `node --test tests/js/*.test.mjs` 通过 / passes
- [ ] 浏览器直开 frontend/index.html 相关页面手测 / manual check in browser
- [ ] 统计类改动附对数测试 / parity test added for statistics changes

## 合规清单 / Compliance checklist

- [ ] 未复制 GPLv3 代码 / no GPLv3 code copied
- [ ] 新依赖许可兼容 MIT 且已署名 NOTICE.md + vendor/LICENSES.md / new deps MIT-compatible and attributed
- [ ] 未提交 SDPC 闭源 DLL / no proprietary SDPC DLL committed
- [ ] 新工具来源行含「仅供科研使用，不用于临床诊断」/ research-only disclaimer present
- [ ] 新增全局函数名已 grep 查重 / global names checked for collisions
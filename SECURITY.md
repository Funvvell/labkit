# 安全策略 · Security Policy

## 支持版本 / Supported versions

| 版本 | 支持 |
| --- | --- |
| 0.3.x（最新 Release） | ✅ |
| 0.2.x 及更早 | ❌（请升级） |
| legacy Python 版 | 已移除（v0.3.0 清理仓库，不再存在） |

## 报告漏洞 / Reporting a vulnerability

请**不要**开公开 issue。使用 GitHub 私密漏洞报告：
仓库页 → **Security → Report a vulnerability**（Private vulnerability reporting）。

维护者会在 7 天内确认收到，并协调修复与披露时间。
Please do not open public issues for vulnerabilities; use GitHub private vulnerability reporting
(Security tab → Report a vulnerability). We aim to acknowledge within 7 days.

## 范围与已知边界 / Scope & known boundaries

- **扩展信任模型（重要）**：社区扩展（工具 / 卡片）与内置代码**同权限、无硬沙箱**——可读写本地台账、
  调用文件 IPC。因此**只安装你信任的来源**；扩展默认关闭、需显式同意安装、不自动更新。
  远程安装强制校验 manifest 声明的 `main.js` sha256（防 Release 资产在传输/存储侧被替换），
  索引源仅接受 HTTPS `raw.githubusercontent.com`。注意：sha256 与索引限制保护的是**传输与资产完整性**，
  **不构成对恶意扩展本身的防护**——恶意扩展一旦安装即等同恶意内置代码。
- LabKit 全本地运行、无遥测；台账文件含个人科研记录，**分享台账 JSON 前请自行脱敏**。
- SDPC 解码 DLL 为第三方闭源二进制，由用户自行安装；其安全性不在本项目控制范围。
- 可选 InvenTree API Token 仅存本机台账；请勿把含 Token 的台账提交到公开仓库。
- Web 演示模式数据存浏览器 localStorage，清缓存即丢；敏感数据请用桌面版。
- 本软件仅供科研使用，不用于临床诊断；不构成任何医疗建议。
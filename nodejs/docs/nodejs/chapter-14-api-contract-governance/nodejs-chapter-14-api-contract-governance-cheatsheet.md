# Node.js 第 14 章 API 契约治理速查表

## 核心判断

| 问题 | 判断规则 |
| --- | --- |
| 这是文档变化还是契约变化 | 如果客户端、测试、SDK 或发布门禁依赖它，就是契约变化 |
| TypeScript 能否验证 HTTP 输入 | 不能；需要 Zod 或等价 runtime validator |
| OpenAPI version 如何选 | 官方最新是 3.2.0；本项目使用 3.1.1，因为本地只做 YAML 解析与结构检查 |
| breaking change 如何识别 | 删除字段、改类型、改状态码、改错误码、必填字段新增通常 breaking |
| deprecated endpoint 如何暴露 | OpenAPI `deprecated: true`，响应带 `Deprecation`、`Sunset`、`Link` |
| SDK 边界如何检查 | 不导入 Prisma、Express、server-only 模块；返回 discriminated union |

## 命令

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run openapi:check
npm run contract:check
npm run compatibility:check
npm run sdk:check
```
</div>

## 记忆句

API contract 是从 HTTP request 到 OpenAPI operation、runtime validator、response schema、Problem Details、version policy、contract tests、typed client 和 governance metrics 的证据链。

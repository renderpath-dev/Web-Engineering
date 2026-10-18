# Node.js 第 14 章：API 契约、OpenAPI、版本治理、向后兼容、契约测试、类型化客户端、弃用策略与 API 治理边界

<style>
.macos-code-window {
  margin: 1rem 0;
  border: 1px solid #2f3440;
  border-radius: 12px;
  overflow: hidden;
  background: #0f1117;
}
.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  background: #1f2430;
  color: #d7dce8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
}
.macos-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.macos-code-dot-red { background: #ff5f57; }
.macos-code-dot-yellow { background: #ffbd2e; }
.macos-code-dot-green { background: #28c840; }
.macos-code-title {
  margin-left: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.macos-code-titlebar + pre {
  margin: 0;
  border-radius: 0;
}
.macos-code-titlebar + pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
</style>

## 目录

- [本章代码定位索引](#本章代码定位索引)
- [0. 章前定位](#0-章前定位)
- [1. 学习目标](#1-学习目标)
- [2. 前置知识](#2-前置知识)
- [3. 环境与运行基线](#3-环境与运行基线)
- [4. 第一性原理](#4-第一性原理)
- [5. 技术边界模型](#5-技术边界模型)
- [6. 底层机制模型](#6-底层机制模型)
- [7. 核心术语](#7-核心术语)
- [8. 本章实践路线](#8-本章实践路线)
- [9. 核心教学](#9-核心教学)
  - [9.1 API contract 不是“写一份接口文档”](#section-9-1)
  - [9.2 Route implementation 与 public contract 的边界](#section-9-2)
  - [9.3 OpenAPI mental model：info、servers、paths、operations、components](#section-9-3)
  - [9.4 OpenAPI version choice：3.2.0、3.1.1、tooling compatibility](#section-9-4)
  - [9.5 HTTP resource model：collection、resource、nested resource、action endpoint](#section-9-5)
  - [9.6 Request boundary：path params、query、headers、cookies、body](#section-9-6)
  - [9.7 Runtime validation、TypeScript type 与 OpenAPI schema 的 ownership](#section-9-7)
  - [9.8 Response boundary：status、headers、body、empty response、pagination](#section-9-8)
  - [9.9 Problem Details schema：RFC 9457 错误契约复用](#section-9-9)
  - [9.10 API versioning：/v1 path version、header version、media type version](#section-9-10)
  - [9.11 Backward compatibility：additive、breaking、nullable、enum、status code](#section-9-11)
  - [9.12 Deprecation and sunset：OpenAPI deprecated、Deprecation header、Sunset header](#section-9-12)
  - [9.13 Pagination、filtering、sorting 与 search query contract](#section-9-13)
  - [9.14 Auth/session/CSRF contract：cookie、token endpoint、protected route responses](#section-9-14)
  - [9.15 Contract tests：OpenAPI spec、Express route、response schema 的一致性](#section-9-15)
  - [9.16 Typed client boundary：fetch wrapper、request builder、response parser](#section-9-16)
  - [9.17 SDK boundary：no Prisma leak、no server-only imports、problem parser](#section-9-17)
  - [9.18 Contract drift detection：route inventory、operationId、schema mapping](#section-9-18)
  - [9.19 Examples and fixtures：request、response、problem、non-secret examples](#section-9-19)
  - [9.20 Compatibility report 与 release gate](#section-9-20)
  - [9.21 API governance metrics：operationId、version、deprecated usage、contract violation](#section-9-21)
  - [9.22 Chapter integration: contract-governed-notes-api](#section-9-22)
- [10. API 与规则索引](#10-api-与规则索引)
- [11. 常见错误对照表](#11-常见错误对照表)
- [12. 调试与验证方法](#12-调试与验证方法)
- [13. 分项练习说明](#13-分项练习说明)
- [14. 最终迷你项目](#14-最终迷你项目)
  - [14.1 项目目标](#141-项目目标)
  - [14.2 项目结构与职责](#142-项目结构与职责)
  - [14.3 完整项目代码](#143-完整项目代码)
  - [14.4 运行与验证](#144-运行与验证)
- [15. 知识迁移与真实项目场景](#15-知识迁移与真实项目场景)
- [16. 本章复盘任务](#16-本章复盘任务)
- [17. 最终心智模型](#17-最终心智模型)
- [18. 官方资料](#18-官方资料)

## 本章代码定位索引

| 学习目标 | 文件或片段 | 可观察证据 |
| --- | --- | --- |
| 9.1 API contract 不是“写一份接口文档” | `practices/14-api-contract-governance/01-contract-model/api-contract-vs-docs.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.2 Route implementation 与 public contract 的边界 | `practices/14-api-contract-governance/01-contract-model/route-contract-boundary.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.3 OpenAPI mental model：info、servers、paths、operations、components | `practices/14-api-contract-governance/02-openapi-model/openapi-root-model.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.4 OpenAPI version choice：3.2.0、3.1.1、tooling compatibility | `practices/14-api-contract-governance/02-openapi-model/openapi-version-choice.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.5 HTTP resource model：collection、resource、nested resource、action endpoint | `practices/14-api-contract-governance/01-contract-model/operation-id-model.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.6 Request boundary：path params、query、headers、cookies、body | `practices/14-api-contract-governance/03-request-boundary/path-param-contract.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.7 Runtime validation、TypeScript type 与 OpenAPI schema 的 ownership | `practices/14-api-contract-governance/04-schema-ownership/zod-vs-typescript-vs-openapi.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.8 Response boundary：status、headers、body、empty response、pagination | `practices/14-api-contract-governance/05-response-contract/paginated-response-contract.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.9 Problem Details schema：RFC 9457 错误契约复用 | `practices/14-api-contract-governance/05-response-contract/problem-details-openapi-schema.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.10 API versioning：/v1 path version、header version、media type version | `practices/14-api-contract-governance/06-versioning-compatibility/api-version-strategy.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.11 Backward compatibility：additive、breaking、nullable、enum、status code | `practices/14-api-contract-governance/06-versioning-compatibility/compatibility-change-classifier.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.12 Deprecation and sunset：OpenAPI deprecated、Deprecation header、Sunset header | `practices/14-api-contract-governance/06-versioning-compatibility/deprecated-operation-model.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.13 Pagination、filtering、sorting 与 search query contract | `practices/14-api-contract-governance/03-request-boundary/query-contract.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.14 Auth/session/CSRF contract：cookie、token endpoint、protected route responses | `practices/14-api-contract-governance/03-request-boundary/cookie-contract.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.15 Contract tests：OpenAPI spec、Express route、response schema 的一致性 | `practices/14-api-contract-governance/07-contract-testing/contract-test-case.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.16 Typed client boundary：fetch wrapper、request builder、response parser | `practices/14-api-contract-governance/08-client-sdk/typed-fetch-result.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.17 SDK boundary：no Prisma leak、no server-only imports、problem parser | `practices/14-api-contract-governance/08-client-sdk/server-type-leak-mistake.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.18 Contract drift detection：route inventory、operationId、schema mapping | `practices/14-api-contract-governance/07-contract-testing/route-inventory.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.19 Examples and fixtures：request、response、problem、non-secret examples | `practices/14-api-contract-governance/09-governance-gates/example-fixture-safety.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.20 Compatibility report 与 release gate | `practices/14-api-contract-governance/09-governance-gates/contract-release-gate.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.21 API governance metrics：operationId、version、deprecated usage、contract violation | `practices/14-api-contract-governance/09-governance-gates/api-governance-metrics.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 9.22 Chapter integration: contract-governed-notes-api | `practices/14-api-contract-governance/09-governance-gates/compatibility-report.ts` | 函数返回值、抛错、测试脚本或 OpenAPI inventory 能观察该边界 |
| 最终项目 API 契约治理 | `mini-projects/contract-governed-notes-api/openapi/openapi.yaml` | `openapi: 3.1.1`、`operationId`、`ProblemDetails` 和 `/v1` paths 可被脚本读取 |
| 最终项目运行入口 | `mini-projects/contract-governed-notes-api/compose.yaml` | NGINX 暴露 `http://localhost:8080`，PostgreSQL 18 volume target 为 `/var/lib/postgresql` |

## 0. 章前定位

本章位于 Phase 9：API contract governance and integration boundary foundation。你已经在前面章节学习了 Express 路由、TypeScript 后端工程、数据库持久化、认证安全、观测、部署、性能和可靠性。本章不重新讲可靠性重试、熔断或部署基础，而是回答另一个问题：当后端 API 被客户端、测试、文档、SDK 和发布流程共同依赖时，哪些形状必须被明确治理？

## 1. 学习目标

- 解释 API contract 与普通接口说明的差异。
- 用 OpenAPI 描述 `/v1` 路径版本、请求、响应、错误和弃用信息。
- 区分 TypeScript type、Zod runtime validation、OpenAPI schema 和 Prisma schema 的所有权。
- 使用 route inventory、operationId、contract tests 和 compatibility report 发现契约漂移。
- 编写不泄露 Prisma、Express 或服务端-only 依赖的 typed client。
- 使用低基数 metrics 观察 deprecated usage、contract violation 和 compatibility result。

## 2. 前置知识

你需要知道 HTTP method 与 status code、Express middleware 顺序、TypeScript type erasure、Zod 运行时解析、Prisma model 与 DTO 的差异、Docker Compose 基础、Node built-in test runner 的失败机制。

## 3. 环境与运行基线

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
cd D:/node.js/mini-projects/contract-governed-notes-api
npm install
npm run prisma:generate
npm run typecheck
npm run build
```
</div>


运行时基线是 Node.js 26、TypeScript `NodeNext`、Express 5、Prisma v7 `prisma-client` generator、PostgreSQL 18、Redis、NGINX、Docker Compose、OpenAPI YAML、Zod、Pino、prom-client、Node built-in test runner 和 Supertest。

## 4. 第一性原理

API contract 的第一性原理是：跨进程边界不能依赖调用方和被调用方共享内存、共享 TypeScript 编译器或共享 ORM 类型。HTTP 只传输 method、URL、headers、body bytes 和响应。契约治理就是把这些跨进程事实显式写入可解析 artifact，并让实现、测试和发布门禁引用同一个事实集合。

## 5. 技术边界模型

| 边界 | 负责内容 | 不负责内容 |
| --- | --- | --- |
| TypeScript | 开发期类型检查与分支收窄 | 验证 HTTP JSON 是否可信 |
| Zod | 运行时解析 path、query、headers、body | 自动生成数据库 schema |
| OpenAPI | 公共 API 形状、operationId、示例和错误契约 | 执行 handler 逻辑 |
| Express | 路由匹配、中间件顺序、响应发送 | 证明向后兼容 |
| Prisma | 数据模型与持久化查询 | 决定公开 DTO |
| Contract tests | 比较 route inventory 与 OpenAPI inventory | 替代人工语义评审 |

## 6. 底层机制模型

请求进入 NGINX 后转发到 Express；Express 通过 `/v1` 路径分派到 route owner；validator 解析不可信输入；controller 调用 Prisma 或返回 contract artifact；响应写入 status、headers 和 body；metrics middleware 在 `finish` 事件中记录低基数标签；contract scripts 读取 OpenAPI YAML、route inventory、示例 fixtures 和 compatibility classifier，把漂移转换为进程退出码。

## 7. 核心术语

| 术语 | 含义 |
| --- | --- |
| API contract | method、path、参数、状态码、headers、body schema、错误 schema、示例、版本和弃用承诺 |
| operationId | 一个 operation 的稳定机器可读身份 |
| Problem Details | RFC 9457 定义的错误响应模型 |
| Deprecation | 表示 endpoint 已进入弃用期的契约和响应信号 |
| Sunset | 表示资源可能停止响应的 HTTP 时间信号 |
| Contract drift | 实现、OpenAPI、validator、测试或 SDK 之间出现不一致 |

## 8. 本章实践路线

先用 practice files 分别练习 contract model、OpenAPI root、请求边界、schema ownership、响应契约、版本兼容、契约测试、typed client 和 governance gates；再进入最终迷你项目，把这些边界连接到一个可运行的 Express API。

## 9. 核心教学

<a id="section-9-1"></a>

### 9.1 API contract 不是“写一份接口文档”

**结论**：API contract 是可被机器读取、测试和发布门禁消费的公共承诺；接口文档只是其中一个人类阅读视图。

**本节解决的问题**：这节修正“把 README 写详细就等于有契约”的误解。`ContractArtifact` 把 `method`、`route`、`operationId`、request schema、response schema 和 error schema 放到同一个对象里，说明契约的最小单位是可比较事实，而不是解释性段落。

**技术意义**：`compareContractToDocs()` 返回的是稳定字段名，而不是自然语言说明。测试可以比较这些字段是否存在，SDK generator 可以依赖 `operationId`，发布脚本可以发现 schema 缺失；普通文档没有这种稳定机器接口。

**概念解释**：文档回答“人应该怎样理解这个 endpoint”，contract 回答“调用方可以依赖哪些输入输出”。当两者冲突时，真实消费者会受 contract 影响，因为 HTTP 客户端只收到 status、headers 和 body，不会读取开发者意图。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：syntax 层只要求对象属性名合法；TypeScript 层确认 `ContractArtifact` 字段被引用；Node runtime 层实际创建数组并返回字符串；HTTP 层尚未发生请求；OpenAPI 层对应可解析 artifact；testing boundary 能断言字段是否遗漏；security boundary 要确保 artifact 中没有 secret 或内部路径。

**底层机制**：触发点是测试或脚本导入 `api-contract-vs-docs.ts`；ESM loader 解析模块后创建 `compareContractToDocs()`；调用时 JavaScript runtime 读取对象属性并生成字符串数组；没有文件 I/O、socket 或数据库资源参与，所以观察点集中在返回值和缺失属性造成的 TypeScript/测试失败。

**API / 配置 / 命令规则**：`operationId` 必须稳定；request、response、error schema 必须能被脚本定位；文档可以补充语义，但不能替代 OpenAPI、runtime validator 和测试对齐。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/01-contract-model/api-contract-vs-docs.ts</span>
  </div>

```ts
export type ContractArtifact = {
  route: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  operationId: string;
  requestSchema: string;
  responseSchema: string;
  errorSchema: string;
};

export function compareContractToDocs(artifact: ContractArtifact): string[] {
  return [
    artifact.operationId,
    artifact.requestSchema,
    artifact.responseSchema,
    artifact.errorSchema
  ];
}
```
</div>

**逐行解释**：`ContractArtifact` 声明 contract 事实；`method` 限制 HTTP 动词集合；`compareContractToDocs()` 故意只返回机器字段，显示契约检查关心的是可比较身份，不是说明文字。

**运行方式**：把该函数导入一个 Node test，传入完整 artifact 时应该返回四个 contract 名称；删掉 `errorSchema` 时，类型检查或测试应暴露缺口。

**预期输出**：正确输出是包含 `operationId`、request schema、response schema 和 error schema 的数组；错误输出不是 500 response，而是测试或 typecheck 在发布前失败。

**执行过程**：模块加载发生在 Node ESM evaluation；函数调用同步执行；数组元素是字符串引用，不会连接数据库，也不会读取 OpenAPI 文件。

**为什么会得到这个结果**：结果可预测，因为输入对象的字段名就是契约事实来源。文档段落无法被这种函数稳定读取，所以文档变化不能自动证明 contract 变化安全。

**对比情况**：接口文档可以写“返回笔记列表”，但 contract 必须说清楚 endpoint 是 `GET /v1/notebooks`、响应字段是 `items`、`nextCursor` 和 `limit`，错误复用 `ProblemDetails`。

**常见错误为什么错**：常见错误是把 swagger 页面截图或 README 表格当契约证据。它错在截图和自由文本不能被 Node test runner 稳定解析，也不能触发 CI 失败。

**与真实项目的关系**：真实项目中，移动端、第三方调用方和后端测试依赖的是稳定 artifact。合同字段缺失通常表现为 SDK 方法丢失、mock server 与真实 route 不一致、发布评审无法判断 breaking change。

**与当前学习路径的关系**：本节是 Chapter 14 的入口，把后面 OpenAPI、route inventory、Zod schema、typed client 和 release gate 都归入同一条 contract 证据链。

**最终记忆模型**：记住：文档解释 contract，contract 约束系统；能被脚本读取和测试失败的事实，才是 API 治理的硬边界。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/contracts/openapi.yaml |
| route owner | getOpenApiYaml |
| contract artifact | openapi/openapi.yaml |
| runtime validator | not applicable for static artifact |
| response schema | YAML document |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | missing schema is release-blocking |
| test evidence | npm run openapi:check |
| drift signal | field exists in docs but not in artifact |

<a id="section-9-2"></a>

### 9.2 Route implementation 与 public contract 的边界

**结论**：Express route 是请求到达服务端后的实现入口，public contract 是外部调用方在进程外能依赖的 method、path 和 operationId。

**本节解决的问题**：这节区分 `expressPattern` 和 `publicPath`。实现可以从一个 controller 拆成多个 service，但 `GET /v1/notebooks/:notebookId` 的公开含义不能因为内部重构而漂移。

**技术意义**：`routeMatchesPublicContract()` 用等值比较说明边界：route table 与 contract artifact 必须对齐。只要 public path 改了，调用方的 URL、缓存规则、监控 dashboard 和 SDK 方法都会受影响。

**概念解释**：Express 的 `app.use()` 和 `router.get()` 决定运行时匹配；OpenAPI 的 path item 决定外部契约；route owner 把二者连接起来。二者不是同一个文件，也不自动同步。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：syntax 层是字符串和对象字段；Express behavior 是按注册顺序匹配 middleware stack；OpenAPI behavior 是用 path template 暴露公共路径；TypeScript 只能检查 `RouteBoundary` 字段存在；testing boundary 比较两个来源；security boundary 避免把内部 mount path 或 debug route 暴露给 public contract。

**底层机制**：触发点通常是 `npm run contract:check`。脚本读取 `src/contracts/route-inventory.ts` 与 OpenAPI inventory，用 method + path 建立 key；如果 Express route 仍在 `/v1/notebooks`，但 OpenAPI 写成 `/notebooks`，比较表缺少同一 key，检查失败。

**API / 配置 / 命令规则**：route implementation 可以重构文件名；public path、HTTP method、operationId 和 deprecated flag 必须通过契约变更流程更新。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/01-contract-model/route-contract-boundary.ts</span>
  </div>

```ts
export type RouteBoundary = {
  method: string;
  expressPattern: string;
  publicPath: string;
  operationId: string;
};

export function routeMatchesPublicContract(route: RouteBoundary): boolean {
  return route.expressPattern === route.publicPath && route.operationId.length > 0;
}
```
</div>

**逐行解释**：`expressPattern` 表示 Express 看到的 pattern；`publicPath` 表示 OpenAPI 暴露的路径；函数返回布尔值，而不是尝试调用 handler，强调这一步是 contract alignment，不是业务测试。

**运行方式**：给函数传入 `{ expressPattern: '/v1/notebooks', publicPath: '/v1/notebooks' }` 返回 true；把 public path 改成 `/notebooks` 返回 false。

**预期输出**：预期信号是布尔结果或 contract test failure。它不需要启动 HTTP server，因为对齐检查可以在静态 inventory 层完成。

**执行过程**：Node 加载模块后同步比较两个字符串；没有 Express request object 被创建。真正项目中，contract script 会先从 route inventory 构建静态视图，再与 YAML paths 对齐。

**为什么会得到这个结果**：结果由字符串完全相等决定。Express 能处理请求不代表 OpenAPI 也声明了该请求，OpenAPI 声明了路径也不代表 Express 实际注册了它。

**对比情况**：route implementation 测试验证 handler 返回什么；public contract 测试验证这个 handler 是否以约定路径、方法和 operationId 对外出现。

**常见错误为什么错**：常见错误是只跑 Supertest happy path，却不比较 OpenAPI。它错在 Supertest 可以命中实现路径，但生成客户端仍可能找不到对应 operation。

**与真实项目的关系**：真实项目里，API gateway、client SDK、监控 route pattern 和文档门户通常读取 public contract；controller 文件迁移不该迫使消费者升级。

**与当前学习路径的关系**：本节连接 Chapter 3 的 Express route 知识与本章的 route inventory，后面 9.18 会把这个比较扩展成 drift detection。

**最终记忆模型**：记住：route 是实现位置，contract 是进程外承诺；二者需要测试绑定，不能靠开发者记忆同步。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/notebooks/:notebookId |
| route owner | getNotebookById |
| contract artifact | OpenAPI path item |
| runtime validator | notebookParamsSchema |
| response schema | Notebook |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | path rename is breaking |
| test evidence | contract drift test |
| drift signal | method+path key mismatch |

<a id="section-9-3"></a>

### 9.3 OpenAPI mental model：info、servers、paths、operations、components

**结论**：OpenAPI 根对象不是一个大 JSON dump；`info`、`servers`、`paths`、operation 和 `components` 分别承担 API 身份、入口、行为和复用模型。

**本节解决的问题**：这节解决“OpenAPI 只是 paths 列表”的误解。`OpenApiRoot` 明确要求根对象同时包含版本、标题、服务器入口、路径集合和 components registry。

**技术意义**：`components` 让 `ProblemDetails`、共享 parameters、headers 和 schemas 只定义一次。没有复用组件时，每个 operation 都复制错误结构，任何字段修正都可能漏掉一个 endpoint。

**概念解释**：`info` 告诉工具这个 API 是谁；`servers` 告诉客户端默认 base URL；`paths` 把 URL template 映射到 operation；operation 用 method、operationId、parameters、requestBody 和 responses 描述行为；`components` 存放可复用 schema、response、parameter、header 和 security scheme。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：OpenAPI behavior 是声明式对象模型；Node runtime 不执行 YAML；TypeScript 类型只描述脚本里期望的对象形状；`yaml` 包把文件内容解析为普通 JavaScript object；testing boundary 检查对象是否有根字段；security boundary 确认 examples 与 servers 不泄露本机路径或 secret。

**底层机制**：触发点是 `npm run openapi:check`。Node 使用 `fs/promises.readFile()` 打开 `openapi/openapi.yaml`，`yaml` 包解析字符串，脚本读取 `document.openapi`、`document.info`、`document.paths` 和 `document.components.schemas.ProblemDetails`；缺字段时 `assert` 抛错，Node test/脚本以非零退出码结束。

**API / 配置 / 命令规则**：根对象必须有 `openapi`、`info`、`paths`；项目约定 `servers[0].url` 指向 `http://localhost:8080`；复用错误结构走 `components.responses.ProblemResponse`。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/02-openapi-model/openapi-root-model.ts</span>
  </div>

```ts
export type OpenApiRoot = {
  openapi: string;
  info: { title: string; version: string };
  servers: Array<{ url: string }>;
  paths: Record<string, unknown>;
  components: Record<string, unknown>;
};

export function hasRequiredOpenApiRoot(document: OpenApiRoot): boolean {
  return Boolean(document.openapi && document.info.title && document.paths && document.components);
}
```
</div>

**逐行解释**：`OpenApiRoot` 把根字段拆开；`hasRequiredOpenApiRoot()` 用布尔判断暴露最小完整性规则；它不验证全部 OpenAPI 语义，只证明文件具备可治理骨架。

**运行方式**：读取项目 YAML 后调用类似检查；删除 `components` 或 `info.title` 会让 structural check 失败。

**预期输出**：预期信号是 `openapi check passed with 23 operations`；错误信号通常是 YAML parse error、missing root object 或 missing component。

**执行过程**：文件读取是异步 I/O；解析在 JavaScript 线程完成；对象检查同步执行；失败通过 thrown AssertionError 传播到脚本入口。

**为什么会得到这个结果**：结果发生是因为 YAML 文本被转成对象后，固定 key 可以被脚本确定读取；如果把 schema 分散进自由文本，脚本就没有稳定读取位置。

**对比情况**：`paths` 关注 endpoint；`components` 关注可复用类型。把所有 schema inline 到 operation 能运行，但会让 Problem Details、pagination 和 headers 难以统一修正。

**常见错误为什么错**：常见错误是只检查 YAML 能 parse，不检查 components 是否包含错误响应。它错在语法正确的 OpenAPI 仍可能缺少项目治理需要的复用契约。

**与真实项目的关系**：真实项目中，文档站、mock server、client generator 和 contract tests 通常从根对象进入；components 设计差会直接提高版本升级成本。

**与当前学习路径的关系**：本节为 9.9 Problem Details、9.12 deprecation headers 和 9.15 contract tests 提供 OpenAPI 对象模型基础。

**最终记忆模型**：记住：OpenAPI 根对象是 contract registry；`paths` 描述入口，`components` 稳定复用边界。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/contracts/openapi.yaml |
| route owner | getOpenApiYaml |
| contract artifact | OpenAPI root object |
| runtime validator | YAML parser plus assertions |
| response schema | OpenApiDocument |
| error schema | ProblemDetails component |
| version boundary | servers url + /v1 paths |
| compatibility rule | shared component changes affect all referencing operations |
| test evidence | openapi:check |
| drift signal | inline schema diverges from component |

<a id="section-9-4"></a>

### 9.4 OpenAPI version choice：3.2.0、3.1.1、tooling compatibility

**结论**：本章保留两个事实：官方最新参考是 OpenAPI 3.2.0；当前项目文件使用 `openapi: 3.1.1`，因为本地只用 `yaml` 和内部结构检查，不引入 3.2 专用 validator。

**本节解决的问题**：这节处理版本选择的工程约束。学习材料要承认规范演进，但项目验证必须落到真实工具能解析、能检查、能在本地通过的版本。

**技术意义**：如果写成 3.2.0 却没有 3.2-aware validator，团队可能误以为所有 3.2 语义都被验证。使用 3.1.1 是一个显式兼容选择，不是说 3.2.0 不存在。

**概念解释**：OpenAPI version 是 contract artifact 自身的语义版本；npm 包版本、API `/v1` 版本和 OpenAPI 版本是三件事。`/v1` 面向消费者 URL，`openapi: 3.1.1` 面向契约解析工具。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：syntax 层是 YAML scalar；tooling behavior 是 `yaml` 解析加自写 structural checker；OpenAPI behavior 受规范版本约束；Node runtime 只读取字符串；TypeScript 通过 literal union 记录决策；security boundary 是不要用未验证工具链给出虚假安全感。

**底层机制**：`versionDecision` 把 `officialLatest` 和 `projectVersion` 分开。脚本读取 `openapi/openapi.yaml` 的 `openapi` 字段并断言等于 `3.1.1`；官方 3.2.0 作为阅读资料和未来迁移方向，而不是当前 CI 通过条件。

**API / 配置 / 命令规则**：项目文件保持 `openapi: 3.1.1`；最终资料说明 3.2.0 是官方最新参考；只有在本地 validator 明确支持并加入验证后，才把项目 artifact 升到 3.2.x。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/02-openapi-model/openapi-version-choice.ts</span>
  </div>

```ts
export type OpenApiVersionDecision = {
  officialLatest: "3.2.0";
  projectVersion: "3.1.1";
  reason: string;
};

export const versionDecision: OpenApiVersionDecision = {
  officialLatest: "3.2.0",
  projectVersion: "3.1.1",
  reason: "Use an official 3.1 patch version with broad local parser compatibility."
};
```
</div>

**逐行解释**：`officialLatest: '3.2.0'` 是外部规范事实；`projectVersion: '3.1.1'` 是本地 artifact 决策；`reason` 说明工具兼容性，防止读者把版本差异误读为遗漏。

**运行方式**：`npm run openapi:check` 会读取 YAML 并检查 `document.openapi === '3.1.1'`。如果你把文件改成 3.2.0，当前检查会失败，这是有意的门禁。

**预期输出**：预期信号不是“使用最高版本”，而是“项目选择与验证脚本一致”。输出仍是 23 operations passed。

**执行过程**：文件 I/O 读取 YAML；解析产生 `document.openapi` 字符串；assert 同步比较；失败抛出 AssertionError 并使脚本退出码为 1。

**为什么会得到这个结果**：结果来自工具链声明与 artifact 声明一致。规范最新性不等于本地验证能力，版本治理必须同时记录二者。

**对比情况**：盲目使用 3.2.0 可能让新字段未被检查；停留在 Swagger 2.0 又会错过现代 JSON Schema 与 OpenAPI 3 系列组件模型。本项目选 3.1.1 是中间的可验证点。

**常见错误为什么错**：常见错误是把 API `/v1` 与 OpenAPI `3.1.1` 混为一谈。前者是消费者 URL 版本，后者是契约文档规范版本。

**与真实项目的关系**：真实项目升级 OpenAPI 版本时，要同时升级 parser、validator、lint rules、generator 和 contract tests，否则只是改了文件头。

**与当前学习路径的关系**：本节保护 Chapter 14 当前成功 validation chain，不因为追求最新规范而破坏本地可运行验证。

**最终记忆模型**：记住：官方最新与项目可验证版本可以不同；写清原因比假装工具支持更工程化。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/contracts/openapi.yaml |
| route owner | getOpenApiYaml |
| contract artifact | openapi field |
| runtime validator | yaml parser and structural check |
| response schema | OpenApiDocument |
| error schema | script assertion error |
| version boundary | OpenAPI 3.1.1 plus API /v1 |
| compatibility rule | spec-version upgrade is a tooling migration |
| test evidence | npm run openapi:check |
| drift signal | YAML openapi field differs from script expectation |

<a id="section-9-5"></a>

### 9.5 HTTP resource model：collection、resource、nested resource、action endpoint

**结论**：HTTP resource model 用名词路径和 method 表达集合、单个资源、嵌套资源和少量 action endpoint；它不应由 controller 文件名随意决定。

**本节解决的问题**：这节解释为什么 `GET /v1/notebooks`、`GET /v1/notebooks/:notebookId`、`GET /v1/notebooks/:notebookId/notes` 和 `POST /v1/auth/login` 属于不同建模类别。

**技术意义**：稳定 resource model 能让 operationId 有一致命名：`listNotebooks`、`getNotebookById`、`listNotebookNotes`、`loginUser`。如果路径建模混乱，OpenAPI、SDK 和 metrics 都会出现语义噪声。

**概念解释**：collection 是资源集合；resource 是集合中的单项；nested resource 表示所有权或查询范围；action endpoint 表示不能自然映射到 CRUD 的过程，例如 login/logout。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：HTTP behavior 由 method + path 表示意图；Express behavior 只是匹配 pattern；OpenAPI behavior 用 operationId 固定语义；TypeScript 不能证明 URL 设计合理；testing boundary 能发现重复 operationId；security boundary 要避免在路径中放 token 或 raw search text。

**底层机制**：`registerOperationId()` 使用 Set 记录已见 operationId。测试或 OpenAPI inventory 遍历 operation 时，每个 id 都进入 Set；如果两个 endpoint 都叫 `getNotebook`，函数抛出 duplicate error。

**API / 配置 / 命令规则**：collection 用复数名词；单资源使用 path parameter；nested resource 只在父资源决定访问范围时使用；action endpoint 要少且命名清楚；operationId 在整个 API 内唯一。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/01-contract-model/operation-id-model.ts</span>
  </div>

```ts
const operationIds = new Set<string>();

export function registerOperationId(operationId: string): void {
  if (operationIds.has(operationId)) {
    throw new Error(`Duplicate operationId: ${operationId}`);
  }

  operationIds.add(operationId);
}
```
</div>

**逐行解释**：`operationIds` 是模块级 Set，随模块实例保留；`registerOperationId()` 先查重再 add；抛错发生在 duplicate 被加入前，防止错误状态继续扩散。

**运行方式**：连续注册 `listNotebooks` 和 `getNotebookById` 正常；第二次注册 `listNotebooks` 会抛出 `Duplicate operationId`。

**预期输出**：预期观察是重复 id 立即失败；这比生成 SDK 后出现方法覆盖更早暴露问题。

**执行过程**：Node ESM cache 让模块级 Set 在同一进程内保持状态；函数同步读写 Set；重复时创建 Error 并中断当前测试。

**为什么会得到这个结果**：结果来自 Set 的唯一性语义。resource model 不是只为美观，它最终影响 operationId 唯一性和客户端方法命名。

**对比情况**：`POST /v1/notebooks/:id/delete` 把 method 语义塞进路径；`DELETE /v1/notebooks/:notebookId` 使用 HTTP method 表达删除，更容易被 OpenAPI、缓存和监控理解。

**常见错误为什么错**：常见错误是把嵌套路径无限加深。它错在 URL 开始表达数据库 join，而不是消费者视角的资源边界。

**与真实项目的关系**：真实项目中，resource model 会影响权限、pagination、SDK 方法、cache key 和 analytics route pattern。命名不稳定会让长期兼容成本上升。

**与当前学习路径的关系**：本节为 9.10 `/v1` versioning 和 9.18 inventory drift 提供 method/path/operationId 的语义基础。

**最终记忆模型**：记住：path 先表达资源，method 表达动作，operationId 表达稳定程序身份。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/notebooks/:notebookId/notes |
| route owner | listNotebookNotes |
| contract artifact | path item plus operationId |
| runtime validator | notebookNoteParamsSchema |
| response schema | NoteList |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | resource path reshaping is breaking |
| test evidence | operation-id.unit.test.ts |
| drift signal | duplicate or misleading operationId |

<a id="section-9-6"></a>

### 9.6 Request boundary：path params、query、headers、cookies、body

**结论**：一个 HTTP request 不是只有 JSON body；path params、query、headers、cookies 和 body 都是不可信输入来源，必须分别建模。

**本节解决的问题**：这节防止把 `request.body` 当成唯一请求契约。`notebookId` 来自 URL path，`limit` 来自 query，`x-csrf-token` 来自 header，session 来自 cookie，note 内容来自 body。

**技术意义**：不同来源的解析时机、错误状态和安全含义不同。path param 错误通常是 400，缺 session cookie 是 401，CSRF header 不匹配是 403，body schema 失败也是 Problem Details。

**概念解释**：path params 是路由模板变量；query 是 URL search 参数；headers 是元数据和安全信号；cookies 是浏览器携带的状态；body 是请求负载。TypeScript 的 `Request` 类型不能证明这些外部值已经可信。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：HTTP behavior 把输入拆进 URL、headers 和 body bytes；Express behavior 把 path params 写入 `request.params` 并由 `express.json()` 解析 body；Zod behavior 在 middleware 中 parse；TypeScript 只在 parse 后帮助开发；security boundary 特别关注 cookie 和 CSRF header。

**底层机制**：`notebookParamsSchema` 使用 `z.string().uuid()` 约束 `notebookId`。请求命中 `/v1/notebooks/:notebookId` 后，Express 把 segment 放入 `request.params`；`validateRequest()` 调用 Zod parse；失败会进入 error middleware 并返回 Problem Details。

**API / 配置 / 命令规则**：每个来源单独 schema；query 使用 `z.coerce` 处理字符串转数字；headers 不区分大小写但约定读取小写 key；cookie 只暴露必要名称，不把 session token 写入日志或 OpenAPI 示例。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/03-request-boundary/path-param-contract.ts</span>
  </div>

```ts
import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export function parseNotebookParams(input: unknown) {
  return notebookParamsSchema.parse(input);
}
```
</div>

**逐行解释**：`notebookParamsSchema` 只有一个字段，说明 path contract 应该窄；`parseNotebookParams()` 接受 `unknown`，强调 HTTP 输入在 parse 前没有运行时类型保证。

**运行方式**：传入 `{ notebookId: '11111111-1111-4111-8111-111111111111' }` 通过；传入 `{ notebookId: 'abc' }` 抛出 ZodError。

**预期输出**：正确请求继续进入 controller；错误请求产生 `validation_failed` Problem Details，而不是让 Prisma 收到非法 UUID。

**执行过程**：URL segment 先由 Express router 提取；Zod 同步解析对象；成功时返回新值；失败时抛出异常，Express 5 会把 async handler rejection 或 next(error) 交给错误中间件。

**为什么会得到这个结果**：结果发生是因为外部字符串在进入数据库查询前被 runtime validator 截断。TypeScript 类型不能保护来自网络的 `request.params`。

**对比情况**：body validation 防止 JSON 字段错误；path validation 防止资源 ID 错误；header/cookie validation 处理安全状态。把它们合并成一个 body schema 会漏掉 URL 和认证边界。

**常见错误为什么错**：常见错误是直接把 `request.params.notebookId` 交给 Prisma。它错在 Express 类型允许复杂值，且运行时字符串可能不是 UUID。

**与真实项目的关系**：真实项目里，很多 500 和数据库错误其实是 request boundary 没有在 route 层验证导致的。识别方法是看错误是否来自 ORM，而不是来自 request validation。

**与当前学习路径的关系**：本节连接认证、notebook、note 路由；后面 9.13 会细化 query contract，9.14 会细化 cookie/header 安全契约。

**最终记忆模型**：记住：HTTP request 有五个输入口；每个入口都要先从 `unknown` 变成已解析值。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/notebooks/:notebookId |
| route owner | getNotebookById |
| contract artifact | path parameter schema |
| runtime validator | notebookParamsSchema |
| response schema | Notebook |
| error schema | ProblemDetails validation_failed |
| version boundary | /v1 |
| compatibility rule | changing param name is breaking |
| test evidence | route validation behavior |
| drift signal | OpenAPI param exists but route schema missing |

<a id="section-9-7"></a>

### 9.7 Runtime validation、TypeScript type 与 OpenAPI schema 的 ownership

**结论**：Zod、TypeScript 和 OpenAPI 不是同一个边界：Zod 解析运行时输入，TypeScript约束开发期代码，OpenAPI 描述公共契约。

**本节解决的问题**：这节解决“已经有 TypeScript type，就不需要 runtime validation 或 OpenAPI schema”的错误。HTTP JSON 在 parse 前是外部数据，TypeScript 不会在生产运行时检查字段。

**技术意义**：`CreateNotebookInput = z.infer<typeof createNotebookSchema>` 显示推荐方向：先由 runtime schema 拥有不可信输入，再推导开发期类型；OpenAPI 仍需表达给外部消费者。

**概念解释**：schema ownership 要回答哪个系统拥有哪类事实。Zod 拥有输入解析规则；TypeScript 拥有服务端代码内部的静态约束；OpenAPI 拥有跨进程公共描述；Prisma 拥有数据库持久化模型。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：TypeScript type-system behavior 在 `tsc --noEmit` 时运行并被擦除；Zod behavior 在 Node runtime 中执行 parse；OpenAPI behavior 在文件和工具中表达；Prisma/database behavior 发生在已验证数据之后；testing boundary 检查这些 owner 是否互相漂移。

**底层机制**：请求 body 进入 Express 后是普通 JavaScript object；`createNotebookSchema.parse()` 检查 `title` 长度并返回 typed value；`z.infer` 让 controller 获得 TypeScript 类型；OpenAPI 的 `NotebookWrite` schema 需要与 Zod 规则保持一致。

**API / 配置 / 命令规则**：不要声称 TypeScript 验证 HTTP body；不要让 Prisma model 自动成为 public schema；输入 schema 变更时同步 contract check 和 OpenAPI schema。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/04-schema-ownership/zod-vs-typescript-vs-openapi.ts</span>
  </div>

```ts
import { z } from "zod";

export const createNotebookSchema = z.object({
  title: z.string().min(1).max(120)
});

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;

export function parseCreateNotebook(input: unknown): CreateNotebookInput {
  return createNotebookSchema.parse(input);
}
```
</div>

**逐行解释**：`z.object()` 创建运行时 parser；`z.infer` 读取 parser 的静态类型；`parseCreateNotebook(input: unknown)` 的参数故意是 unknown，说明外部输入在解析前不可信。

**运行方式**：传入 `{ title: 'Work' }` 返回 typed object；传入 `{ title: '' }` 抛出 ZodError；删除 `z.infer` 不会改变运行时行为，只会影响开发期类型。

**预期输出**：正确输出是已解析 object；错误输出是 validation failure。OpenAPI check 不执行 Zod，但能检查 public schema 是否存在。

**执行过程**：JSON parser 先把 bytes 变成 object；Zod 同步遍历字段；TypeScript 在构建前检查函数调用；生产 JavaScript 只执行 Zod，不执行 TypeScript type。

**为什么会得到这个结果**：结果来自 TypeScript type erasure。运行时只有 JavaScript object 和 Zod parser，type alias 不会出现在生产进程里。

**对比情况**：只有 TypeScript type：编译器满意但恶意 JSON 可进入 controller。只有 Zod：服务端安全但外部消费者看不到契约。只有 OpenAPI：文档完整但运行时不会自动拒绝坏输入。

**常见错误为什么错**：常见错误是从 OpenAPI 复制一个 interface，然后把 `request.body as CreateNotebookInput` 当验证。它错在 type assertion 不检查任何运行时字段。

**与真实项目的关系**：真实项目中，schema owner 不清会表现为 OpenAPI 文档允许字段、Zod 拒绝字段、数据库又存了第三种形状。识别方法是比较 validator、DTO 和 contract artifact。

**与当前学习路径的关系**：本节是 Chapter 14 的类型边界核心，后面的 typed client 和 contract tests 都依赖这个区分。

**最终记忆模型**：记住：Zod 负责进门检查，TypeScript 负责写代码时的约束，OpenAPI 负责告诉门外的人怎么进门。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/notebooks |
| route owner | createNotebook |
| contract artifact | NotebookWrite schema |
| runtime validator | createNotebookBodySchema |
| response schema | Notebook |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | required input field addition is breaking |
| test evidence | typecheck plus contract check |
| drift signal | Zod min/max differs from OpenAPI |

<a id="section-9-8"></a>

### 9.8 Response boundary：status、headers、body、empty response、pagination

**结论**：响应契约同时包含 status code、headers、body shape、empty response 规则和 pagination 元数据；只描述 JSON 字段是不完整的。

**本节解决的问题**：这节补齐成功响应的边界。`GET /v1/notebooks` 返回 page object，`DELETE /v1/notebooks/:id` 返回 204 empty response，deprecated endpoint 还要返回 headers。

**技术意义**：客户端分支首先看 status，再决定是否读 body；pagination 客户端依赖 `items`、`nextCursor` 和 `limit`；header contract 影响缓存、弃用、安全和追踪。

**概念解释**：response boundary 是服务端最后一次对外承诺：status 表示结果类别，headers 携带元信息，body 携带资源表示，empty response 明确没有 body，pagination 明确列表窗口。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：HTTP behavior 定义 status/header/body；Express behavior 通过 `response.status().json()` 或 `response.status(204).end()` 完成响应；TypeScript 只检查 helper 调用；OpenAPI behavior 要列出 responses；testing boundary 应确认 204 不发送 JSON body。

**底层机制**：`createPage()` 接收 items、limit 和 nextCursor，返回稳定 page envelope。controller 查询 Prisma 后不直接返回数组，而是包进 `items`，这样以后添加 `nextCursor` 不破坏已有字段读取。

**API / 配置 / 命令规则**：列表响应使用 page envelope；204 使用 `end()`，不使用 `json({})`；成功和错误响应分离；pagination 字段新增应保持 additive。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/05-response-contract/paginated-response-contract.ts</span>
  </div>

```ts
export type Page<T> = {
  items: T[];
  nextCursor: string | null;
  limit: number;
};

export function createPage<T>(items: T[], limit: number, nextCursor: string | null): Page<T> {
  return { items, limit, nextCursor };
}
```
</div>

**逐行解释**：`Page<T>` 让 items 类型泛化；`nextCursor: string | null` 明确没有下一页时的值；`createPage()` 不读取数据库，只固定 response shape。

**运行方式**：传入两个 note 和 `nextCursor=null` 返回 `{ items, limit, nextCursor }`；客户端可以只读 `items`，也可以读取分页状态。

**预期输出**：正确输出是 envelope object。删除 `limit` 或把 `nextCursor` 改成 undefined 会让契约测试或客户端 parser 发现不一致。

**执行过程**：controller 获得数据库 rows 后同步创建 plain object；Express 序列化 JSON；response finish 后 metrics 记录 route pattern 和 status class。

**为什么会得到这个结果**：结果稳定是因为数组没有直接暴露为顶层响应；envelope 给兼容新增字段留下空间，同时让分页状态位置固定。

**对比情况**：直接返回 `Note[]` 简单但难以添加 cursor；返回 `{ data: [...] }` 也可以，但必须被 OpenAPI 和 SDK 共同记录。关键不是名字，而是一致且可测试。

**常见错误为什么错**：常见错误是 `DELETE` 返回 200 和 deleted object，同时 OpenAPI 写 204。它错在 status/body 组合和 contract artifact 不一致。

**与真实项目的关系**：真实项目中，响应契约漂移会表现为移动端空状态异常、分页重复加载、SDK parse branch 走错或监控 status class 统计异常。

**与当前学习路径的关系**：本节为 9.11 兼容性分类提供具体 response change 示例，也为 9.16 typed client 的 success parser 提供输入形状。

**最终记忆模型**：记住：响应不是 JSON 一件事；先 status，再 headers，再 body，再决定 empty 或 paginated。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/notebooks |
| route owner | listNotebooks |
| contract artifact | NotebookList schema |
| runtime validator | response helper and controller shape |
| response schema | Page<Notebook> |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | adding optional envelope field is compatible |
| test evidence | SDK parser and OpenAPI check |
| drift signal | OpenAPI says 204 but handler sends body |

<a id="section-9-9"></a>

### 9.9 Problem Details schema：RFC 9457 错误契约复用

**结论**：错误响应必须像成功响应一样契约化；RFC 9457 Problem Details 提供了可复用的错误对象结构。

**本节解决的问题**：这节避免每个 controller 随手返回 `{ error: '...' }`。本项目用 `type`、`title`、`status`、`detail`、`instance` 和 `code` 统一错误读取方式。

**技术意义**：客户端不应该猜测错误字段叫 `message`、`error` 还是 `reason`。Problem Details 让 typed client 在失败分支稳定读取 `problem.code` 和 `problem.status`。

**概念解释**：Problem Details 是 HTTP API 的错误表示模型。它不是异常对象，也不是日志；它是发送给客户端的 public error contract。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：JavaScript Error 属于服务端运行时；HttpError 映射业务状态；error middleware 创建 Problem Details response；OpenAPI components 复用 schema；security boundary 阻止 stack trace、SQL、token 或 request body 进入 `detail`。

**底层机制**：`createProblem()` 根据 status、code 和 detail 组装 problem object。真实项目中，`errorMiddleware` 捕获 error，调用 `createProblemDetails()`，设置 `application/problem+json`，再通过 Express response 发送。

**API / 配置 / 命令规则**：`status` 字段应与 HTTP status code 一致；`code` 是低基数、稳定、可分支的业务错误码；`detail` 不包含 secret 或内部异常栈。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/05-response-contract/problem-details-openapi-schema.ts</span>
  </div>

```ts
export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code: string;
};

export function createProblem(status: number, code: string, detail: string): ProblemDetails {
  return {
    type: `https://example.test/problems/${code}`,
    title: code,
    status,
    detail,
    code
  };
}
```
</div>

**逐行解释**：`ProblemDetails` 类型列出客户端可依赖字段；`type` 生成 URI；`createProblem()` 不接收 raw Error，避免直接泄露内部异常。

**运行方式**：传入 `400, 'validation_failed', 'Invalid field'` 返回 RFC 9457 风格对象；SDK 失败分支可以解析为 `problem.code === 'validation_failed'`。

**预期输出**：错误响应 content type 是 `application/problem+json`；body 含稳定 `code`，而不是任意字符串。

**执行过程**：handler 抛出 HttpError；Express 错误中间件接收四参函数；problem object 被 JSON 序列化；metrics 记录 problem code 和 status class。

**为什么会得到这个结果**：结果发生是因为错误对象在一个中间件统一转换。统一出口比每个 route 自己写错误 JSON 更容易保持 OpenAPI components 一致。

**对比情况**：日志错误面向开发者，可含 stack 和上下文；Problem Details 面向消费者，只给安全、稳定、可处理的信息。

**常见错误为什么错**：常见错误是把 `error.message` 原样返回。它错在 message 可能包含内部实现、数据库字段或第三方服务细节。

**与真实项目的关系**：真实项目中，错误契约不稳定会让客户端无法区分验证失败、未登录、资源不存在和冲突。识别方式是搜索多个 controller 是否返回不同错误 shape。

**与当前学习路径的关系**：本节连接 9.6 request validation、9.14 auth failure 和 9.16 typed client 的 failure branch。

**最终记忆模型**：记住：异常是服务端事件，Problem Details 是客户端契约；不要把二者混为一谈。

| evidence link | section-specific value |
| --- | --- |
| request path | any /v1 route |
| route owner | errorMiddleware |
| contract artifact | components.schemas.ProblemDetails |
| runtime validator | createProblemDetails |
| response schema | ProblemDetails |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | changing error code can be breaking |
| test evidence | problem-details.unit.test.ts |
| drift signal | route returns ad hoc error shape |

<a id="section-9-10"></a>

### 9.10 API versioning：/v1 path version、header version、media type version

**结论**：本项目选择 `/v1` path versioning，因为它能被路由、OpenAPI、日志、NGINX 和 smoke test 直接观察；header/media type version 是替代策略，不是本章默认。

**本节解决的问题**：这节解释版本入口为何放在 path。`extractPathVersion()` 只从 URL 头部取 `v1`，说明版本是路由空间的一部分。

**技术意义**：路径版本让新旧版本可以并存，也让 contract scripts 用简单规则检查所有 public route 是否以 `/v1` 开头。对学习项目来说，它比 header negotiation 更可见。

**概念解释**：path version 把版本写入 URL；header version 把版本写入自定义 header；media type version 把版本写入 `Accept` 或 `Content-Type`。三者都能用，但可观察性和复杂度不同。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：HTTP behavior 可以在 URL、headers 或 media type 中携带版本；Express behavior 对 path version 最直接；OpenAPI behavior 可为 `/v1` paths 生成清晰 contract；TypeScript 不决定版本策略；NGINX 和 metrics 更容易按 path pattern 聚合。

**底层机制**：`extractPathVersion()` 用正则匹配 `^/(v\d+)`。请求 `/v1/version` 返回 `v1`；请求 `/version` 返回 null；contract release gate 遍历 route inventory，发现不以 `/v1/` 开头的 route 就失败。

**API / 配置 / 命令规则**：当前 public endpoint 都在 `/v1` 下；不把 OpenAPI 3.1.1 当 API version；添加 `/v2` 时需要新的 compatibility plan，而不是直接改掉 `/v1`。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/06-versioning-compatibility/api-version-strategy.ts</span>
  </div>

```ts
export function extractPathVersion(path: string): string | null {
  const [, version] = path.match(/^\/(v\d+)(?:\/|$)/) ?? [];
  return version ?? null;
}
```
</div>

**逐行解释**：正则的锚点要求版本必须在 path 开头；`(?:/|$)` 防止 `/v10x` 被误识别；返回 null 表示该 URL 不在已知 path version 空间内。

**运行方式**：`extractPathVersion('/v1/notebooks')` 返回 `v1`；`extractPathVersion('/internal/health')` 返回 null。

**预期输出**：正确 signal 是 `v1` 被提取并通过 supported version check；错误 signal 是 route inventory 中出现无版本 public path。

**执行过程**：URL 字符串进入纯函数；JavaScript RegExp 同步匹配；没有网络 I/O。真实请求中，Express 先按 `/v1` mount 分派，再进入具体 router。

**为什么会得到这个结果**：结果来自路径前缀规则。版本放在 path 里后，OpenAPI paths、NGINX route、logs 和 smoke target 都能看到同一个版本边界。

**对比情况**：header version 保持 URL 简洁，但 smoke/curl/缓存和文档示例更容易漏 header；media type version 适合成熟 API negotiation，但学习成本更高。

**常见错误为什么错**：常见错误是把 breaking response change 直接塞进 `/v1`。它错在 path version 承诺没有改变，老客户端仍会按旧 contract 解析。

**与真实项目的关系**：真实项目中，版本策略影响 API gateway、SDK package、监控面板和迁移文档。识别版本混乱的方法是搜索是否有 public route 不带 `/v1`。

**与当前学习路径的关系**：本节保护 Chapter 14 所有 endpoint 的公共入口，也为 9.11 backward compatibility 提供版本承诺上下文。

**最终记忆模型**：记住：`/v1` 是消费者选择的 API 空间；OpenAPI 版本是文档规范，二者不能混用。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/version |
| route owner | getVersion |
| contract artifact | /v1 path prefix |
| runtime validator | version-policy extractVersionFamily |
| response schema | VersionResponse |
| error schema | ProblemDetails for unsupported future version |
| version boundary | /v1 |
| compatibility rule | breaking changes require new version or migration window |
| test evidence | version-policy.unit.test.ts |
| drift signal | public route missing /v1 |

<a id="section-9-11"></a>

### 9.11 Backward compatibility：additive、breaking、nullable、enum、status code

**结论**：向后兼容不是主观感觉；本章把变更分类为 `compatible`、`potentially_compatible` 和 `breaking`，并明确每类风险。

**本节解决的问题**：这节处理字段新增、必填新增、字段删除、改名、类型变化、enum 改动、status code 和 error code 变化。不同变化对客户端解析分支的影响不同。

**技术意义**：`classifyChange()` 是简化练习，最终项目的 classifier 覆盖 11 类 case。它让 release gate 能先给出机器分类，再让人评审语义风险。

**概念解释**：additive field 通常兼容，因为老客户端会忽略未知字段；required field added 通常 breaking，因为老请求缺字段；enum value added 可能兼容也可能破坏 exhaustive switch；status code changed 会改变客户端分支。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：TypeScript 客户端可能在编译期覆盖已知 enum，但运行时仍会收到新字符串；OpenAPI diff 给出结构变化；Node script 执行分类规则；testing boundary 证明分类器稳定；business semantics 仍需要人工评审。

**底层机制**：compatibility check 遍历预设 change kind，调用 classifier，更新 summary。脚本用 assert 检查 compatible=2、potentially_compatible=2、breaking=7；任何分类规则改动都会改变 summary 并失败。

**API / 配置 / 命令规则**：删除、改名、改类型、改状态码、改错误码和新增必填字段默认 breaking；新增可选字段默认 compatible；新增 enum 和 nullable change 默认 potentially compatible。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/06-versioning-compatibility/compatibility-change-classifier.ts</span>
  </div>

```ts
export type CompatibilityResult = "compatible" | "potentially_compatible" | "breaking";

export function classifyChange(change: string): CompatibilityResult {
  if (change.includes("removed") || change.includes("required")) return "breaking";
  if (change.includes("enum value added") || change.includes("nullable")) return "potentially_compatible";
  return "compatible";
}
```
</div>

**逐行解释**：`CompatibilityResult` 限定三个结果；`classifyChange()` 根据字符串模式返回结果；练习文件展示思想，最终项目用 explicit union 避免拼写漂移。

**运行方式**：`classifyChange('field removed')` 返回 breaking；`classifyChange('enum value added')` 返回 potentially compatible。

**预期输出**：预期 signal 是 compatibility summary 稳定；如果新增 case 未分类，测试应失败或报告 `unclassified_change`，而不是默认通过。

**执行过程**：脚本进程同步运行分类函数；没有 HTTP 请求；结果写入 console；assert 失败会让 Node 退出码为 1。

**为什么会得到这个结果**：结果来自消费者解析假设：老客户端知道旧字段、旧 enum、旧 status 分支。破坏这些假设时，不改客户端就可能失败。

**对比情况**：添加 response 可选字段通常安全；把 `body` 从 string 改成 object 会破坏 parser；把 404 改成 200+error body 会破坏错误分支。

**常见错误为什么错**：常见错误是把“服务端仍能运行”当作兼容。它错在兼容性讨论的是现有消费者是否能不变更继续正确解析。

**与真实项目的关系**：真实项目中，兼容性报告用于 release review。识别风险的方法是把 OpenAPI diff 映射到客户端解析代码和 SDK discriminated union。

**与当前学习路径的关系**：本节支撑 9.20 release gate，也约束 Chapter 14 不在 `/v1` 内随意改变公开字段。

**最终记忆模型**：记住：兼容性看消费者假设，不看服务端是否能启动。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/contracts/compatibility-report |
| route owner | getCompatibilityReport |
| contract artifact | compatibility report |
| runtime validator | compatibility classifier |
| response schema | CompatibilityReport |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | classifier result controls release gate |
| test evidence | compatibility-classifier.unit.test.ts |
| drift signal | unclassified change kind |

<a id="section-9-12"></a>

### 9.12 Deprecation and sunset：OpenAPI deprecated、Deprecation header、Sunset header

**结论**：弃用是生命周期信号，不是删除；OpenAPI `deprecated` 标记、`Deprecation` header 和 `Sunset` header 分别覆盖契约视图与运行时视图。

**本节解决的问题**：这节解释 `/v1/deprecated-demo` 为什么仍存在。它在 contract 中标记 deprecated，在响应中发送迁移信号，同时保持旧调用可用。

**技术意义**：消费者不一定每天阅读文档，但运行时 header 可以被客户端、日志、proxy 或治理指标捕获。Sunset 给出未来可能停止服务的时间点。

**概念解释**：`deprecated: true` 告诉 OpenAPI 读者 operation 不推荐继续使用；`Deprecation` header 告诉本次响应对应资源已弃用；`Sunset` header 告诉消费者资源未来可能不可用；`Link` header 指向替代信息。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：OpenAPI behavior 是静态标记；HTTP behavior 是每次响应 header；Express controller 设置 header 后发送 JSON；metrics 记录 deprecated operationId；security boundary 只暴露替代路径，不暴露内部计划或用户数据。

**底层机制**：`DeprecatedOperation` 固定 operationId 和 replacement。最终项目的 `getDeprecatedDemo` 调用 `recordDeprecatedUsage()`，设置 `Deprecation`、`Sunset`、`Link`，再返回 synthetic body。

**API / 配置 / 命令规则**：弃用 endpoint 不能静默删除；OpenAPI deprecated flag 与 route inventory deprecated flag 必须一致；Sunset 值使用 HTTP-date；replacement 不应包含 secret 或内部 URL。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/06-versioning-compatibility/deprecated-operation-model.ts</span>
  </div>

```ts
export type DeprecatedOperation = {
  operationId: string;
  deprecated: true;
  replacement: string;
};

export function describeDeprecation(operation: DeprecatedOperation): string {
  return `${operation.operationId} -> ${operation.replacement}`;
}
```
</div>

**逐行解释**：`DeprecatedOperation` 要求 `deprecated: true`，防止把普通 operation 当弃用项；`describeDeprecation()` 返回迁移关系，适合用于报告或日志。

**运行方式**：请求 `/v1/deprecated-demo` 应收到 200、Deprecation header、Sunset header、Link header 和安全示例 body。

**预期输出**：正确 signal 是 endpoint 仍可用但可观察为 deprecated；错误 signal 是 OpenAPI 标记弃用但运行时没有 headers，或运行时有 headers 但 OpenAPI 未标记。

**执行过程**：Express route 命中 controller；controller 同步设置 headers；response JSON 发送；finish 后 metrics middleware 记录 status class，deprecated counter 记录 operationId。

**为什么会得到这个结果**：结果发生是因为弃用不是 handler failure。服务器仍履行旧 contract，同时给消费者迁移时间和可观测信号。

**对比情况**：删除 endpoint 会导致 404；弃用 endpoint 仍返回成功但带迁移信号。二者对客户端和 SLA 的影响完全不同。

**常见错误为什么错**：常见错误是只在发布公告里说弃用。它错在自动化客户端和监控系统无法从公告中识别实际调用仍在发生。

**与真实项目的关系**：真实项目中，弃用治理常用于移动端长版本周期和第三方集成。识别方式是按 operationId 统计 deprecated usage，而不是按 raw URL。

**与当前学习路径的关系**：本节连接 9.11 compatibility、9.19 examples 和 9.21 governance metrics，让生命周期变化可见但不泄露内部计划。

**最终记忆模型**：记住：deprecated 是“请迁移但仍服务”，sunset 是“未来可能停止服务”。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/deprecated-demo |
| route owner | getDeprecatedDemo |
| contract artifact | deprecated operation and headers |
| runtime validator | deprecation policy |
| response schema | deprecated demo response |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | removal requires migration window |
| test evidence | deprecation-policy.unit.test.ts |
| drift signal | OpenAPI deprecated flag differs from runtime headers |

<a id="section-9-13"></a>

### 9.13 Pagination、filtering、sorting 与 search query contract

**结论**：列表 query contract 决定客户端如何分页、过滤、排序和搜索；它必须有类型、默认值、上限和稳定语义。

**本节解决的问题**：这节专门处理 URL search 参数。`limit` 是字符串输入但要转成 bounded integer，`cursor` 是可选 UUID，`sort` 只能在允许字段内选择。

**技术意义**：query 参数直接影响数据库负载和返回顺序。没有上限的 `limit` 会形成资源风险；不稳定排序会让 pagination 重复或漏项；未约束 search 可能泄露查询复杂度。

**概念解释**：pagination contract 定义页面大小和后续位置；filtering contract 定义筛选字段；sorting contract 定义顺序字段；search contract 定义搜索语义和限制。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：HTTP query 原始值都是字符串；Zod `coerce.number()` 执行运行时转换；TypeScript 在 parse 后看到 number；Prisma/database 根据已解析 query 构造查询；OpenAPI parameters 需要同步默认值和范围。

**底层机制**：`noteQuerySchema` 接收 unknown query object；`limit` 通过 coercion 从 `'20'` 变成 `20`，再检查 min/max；`sort` 默认 `updatedAt`；controller 用解析后的值决定 `take` 和 `orderBy`。

**API / 配置 / 命令规则**：分页 limit 必须有最大值；cursor 应有格式约束；sort 字段白名单；search query 不应直接拼 SQL；默认值必须在 Zod 与 OpenAPI 中一致。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/03-request-boundary/query-contract.ts</span>
  </div>

```ts
import { z } from "zod";

export const noteQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  sort: z.enum(["createdAt", "updatedAt"]).default("updatedAt")
});

export function parseNoteQuery(input: unknown) {
  return noteQuerySchema.parse(input);
}
```
</div>

**逐行解释**：`z.coerce.number()` 是 query contract 的关键，因为 URL 不携带 number 类型；`.max(100)` 是资源边界；`z.enum()` 防止任意字段进入 orderBy。

**运行方式**：传入 `{ limit: '10', sort: 'createdAt' }` 得到 number limit；传入 `{ limit: '10000' }` 抛出 validation error。

**预期输出**：正确 signal 是 controller 收到 bounded number；错误 signal 是 400 Problem Details，而不是数据库慢查询。

**执行过程**：Express 解析 query string；Zod 同步转换和检查；成功值进入 Prisma query；响应 envelope 返回 `items`、`nextCursor` 和 `limit`。

**为什么会得到这个结果**：结果来自 query 的字符串本质。没有 runtime coercion，TypeScript 以为是 number 也无法改变 URL search 参数实际是字符串。

**对比情况**：path param 标识资源身份；query param 调整集合视图。把 filter 写进 path 会让 route 爆炸，把 resource id 写进 query 会模糊所有权。

**常见错误为什么错**：常见错误是接受任意 `sort` 并传给 ORM。它错在消费者可以触发未索引排序或访问非公开字段名。

**与真实项目的关系**：真实项目中，query contract 问题表现为慢查询、分页重复、缓存 key 爆炸或客户端列表闪烁。识别方法是对比 OpenAPI parameters 与 runtime query schema。

**与当前学习路径的关系**：本节扩展 9.6 的 request boundary，专注集合 endpoint 的 URL search 语义。

**最终记忆模型**：记住：query 是字符串入口，先 coerce，再 bound，再进入数据库。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/notebooks/:notebookId/notes?limit=20&sort=updatedAt |
| route owner | listNotebookNotes |
| contract artifact | query parameters |
| runtime validator | noteQuerySchema |
| response schema | NoteList |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | changing default sort can be breaking |
| test evidence | request boundary tests or contract check |
| drift signal | OpenAPI default differs from Zod default |

<a id="section-9-14"></a>

### 9.14 Auth/session/CSRF contract：cookie、token endpoint、protected route responses

**结论**：认证契约要告诉客户端何时带 cookie、何时拿 CSRF token、失败时收到什么响应，但不能泄露 session token、secret、password hash 或 cookie 示例值。

**本节解决的问题**：这节解释 auth public contract 的边界。OpenAPI 可以说明 `sessionCookie` 和 `csrfHeader`，但不能把真实 cookie、token 或 password 放进 examples。

**技术意义**：受保护 route 的 401、403 和 CSRF failure 是客户端必须处理的公共行为。安全实现细节属于服务端内部，公开契约只暴露必要交互规则。

**概念解释**：session cookie 表示登录状态；CSRF header 证明 mutating request 来自授权页面流程；`GET /v1/auth/csrf` 是 token 获取入口；protected route responses 必须统一为 Problem Details。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：HTTP headers/cookies 携带认证状态；Express controller 解析 cookie；Zod 可检查 header presence；Prisma 存 session hash；OpenAPI securitySchemes 只描述机制；security boundary 禁止公开 token/hash/secret。

**底层机制**：`parseCookieHeader()` 把 `Cookie` header 拆成 Map。真实项目的 `authenticateSession` 读取 session cookie，hash 后查 Prisma Session；`requireCsrfToken` 比较 header token hash；失败进入 Problem Details。

**API / 配置 / 命令规则**：cookie 名称可公开，cookie 值不可公开；CSRF token 通过 header 发送；logout、create、patch、delete 等 mutating protected routes 需要 CSRF；auth failure 不返回 password 相关细节。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/03-request-boundary/cookie-contract.ts</span>
  </div>

```ts
export function parseCookieHeader(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of header?.split(";") ?? []) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName || rawValue.length === 0) continue;
    cookies.set(rawName, decodeURIComponent(rawValue.join("=")));
  }

  return cookies;
}
```
</div>

**逐行解释**：函数按分号拆 cookie header；`decodeURIComponent` 只处理值；缺 name 或 value 的片段被跳过，避免把 malformed cookie 当有效状态。

**运行方式**：传入 `contract_notes_session=abc; contract_notes_csrf=def` 得到 Map；没有 session cookie 时 protected route 返回 401 Problem Details。

**预期输出**：正确 signal 是客户端能获得 csrfToken 字段和 cookie；错误 signal 是 `missing_session` 或 `csrf_required` Problem Details。

**执行过程**：浏览器随请求发送 Cookie header；Express handler 读取 header 字符串；服务端只存 hash 比较；响应用 Set-Cookie 更新状态，不把 session token 放入 JSON body。

**为什么会得到这个结果**：结果来自安全分层：客户端需要交互协议，不需要服务端 secret。hash lookup 让数据库泄露时也不直接暴露原始 session token。

**对比情况**：Bearer token API 会把 token 放在 Authorization header；cookie session API 依赖浏览器 cookie jar 和 CSRF 防护。两者 contract 不同，不能混写。

**常见错误为什么错**：常见错误是在 OpenAPI examples 中放真实 cookie 或 token。它错在 examples 会进入文档站、仓库和测试 fixture，扩大泄露面。

**与真实项目的关系**：真实项目中，auth contract 不清会导致前端不知道什么时候刷新 CSRF、移动端误用 cookie flow、监控中出现 secret。识别方法是扫描 examples 和 logs。

**与当前学习路径的关系**：本节承接 Chapter 6 auth security，并把安全行为转为 Chapter 14 可测试公共契约。

**最终记忆模型**：记住：认证契约公开流程，不公开秘密；失败响应也必须稳定。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/auth/csrf |
| route owner | getCsrfToken |
| contract artifact | securitySchemes and auth paths |
| runtime validator | cookie parser and csrf header check |
| response schema | csrf token response |
| error schema | ProblemDetails missing_session/csrf_required |
| version boundary | /v1 |
| compatibility rule | changing cookie/header names can break clients |
| test evidence | contract check and safe example scan |
| drift signal | OpenAPI exposes secret-like example |

<a id="section-9-15"></a>

### 9.15 Contract tests：OpenAPI spec、Express route、response schema 的一致性

**结论**：契约测试不是只请求一个 endpoint 看 200；它要比较 OpenAPI spec、Express route inventory、response schema 和错误 schema 是否表达同一件事。

**本节解决的问题**：这节解释为什么需要 `contract:check`。一个 route 可以运行，但 OpenAPI 没有 operationId；一个 schema 可以存在，但 controller 返回了另一种 envelope。

**技术意义**：`ContractTestCase` 把 method、path、expected status 和 expected schema 放在一起，让测试能覆盖“哪个请求应该产生哪个 contract shape”。

**概念解释**：contract test 的目标是公开边界一致性。它不替代业务测试，也不需要验证每个数据库状态；它验证消费者依赖的 shape 没有漂移。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：Node test runner 负责执行测试和退出码；OpenAPI loader 读取 YAML；Express route inventory 提供实现侧视图；Supertest 可验证实际 response；TypeScript 只保证测试代码类型；security boundary 避免测试 fixture 带 secret。

**底层机制**：脚本先构建 OpenAPI inventory，再读取 route inventory；单元测试也可用 `ContractTestCase` 表达 expected status/schema。缺少 operationId、重复 operationId、deprecated flag 不一致都会在发布前失败。

**API / 配置 / 命令规则**：每个 public route 必须有 operationId；每个 operation 必须有 responses；错误响应复用 ProblemDetails；测试 fixture 不包含 token/password/cookie。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/07-contract-testing/contract-test-case.ts</span>
  </div>

```ts
export type ContractTestCase = {
  name: string;
  method: string;
  path: string;
  expectedStatus: number;
  expectedSchema: string;
};

export function testCaseName(testCase: ContractTestCase): string {
  return `${testCase.method} ${testCase.path} -> ${testCase.expectedStatus}`;
}
```
</div>

**逐行解释**：`expectedStatus` 捕获 HTTP 分支；`expectedSchema` 捕获 body shape；`testCaseName()` 生成可读失败名称，便于在 Node test output 中定位 route。

**运行方式**：运行 `npm run contract:check` 或 `npm test -- --test-concurrency=1`。当 `/v1/contracts/route-inventory` 缺少 OpenAPI operation 时，测试失败并显示 drift check 名称。

**预期输出**：正确 signal 是 `contract check passed`；错误 signal 是 `missing_openapi_operation`、`operation_id_mismatch` 或 `deprecated_flag_mismatch`。

**执行过程**：Node 进程启动测试；ESM imports 加载 contract modules；文件 I/O 读取 YAML；assert 比较数组和对象；失败抛出 AssertionError 并设置非零退出码。

**为什么会得到这个结果**：结果发生是因为测试把两套来源投影成相同 key。只要 key 不一致，就说明实现或契约有一侧没同步。

**对比情况**：业务测试问“创建 notebook 是否写入数据库”；契约测试问“创建 notebook 是否仍然是 `POST /v1/notebooks`、`createNotebook`、201/ProblemDetails 组合”。

**常见错误为什么错**：常见错误是只用 curl 验证 ready endpoint。它错在 curl 无法证明所有 OpenAPI operation 与 Express route 对齐。

**与真实项目的关系**：真实项目中，contract tests 是 CI release gate 的一部分。识别缺口的方法是看新增 route 是否同时改 route inventory、OpenAPI 和测试。

**与当前学习路径的关系**：本节把前面 request/response/error/version 的教学变成可执行检查，为 9.20 release gate 铺路。

**最终记忆模型**：记住：contract test 比较公共事实，不是复述 controller 代码。

| evidence link | section-specific value |
| --- | --- |
| request path | all /v1 routes |
| route owner | routeInventory entries |
| contract artifact | openapi/openapi.yaml |
| runtime validator | OpenAPI loader and drift checker |
| response schema | expectedSchema |
| error schema | ProblemDetails |
| version boundary | /v1 |
| compatibility rule | missing route contract blocks release |
| test evidence | contract.integration.test.ts |
| drift signal | operationId mismatch |

<a id="section-9-16"></a>

### 9.16 Typed client boundary：fetch wrapper、request builder、response parser

**结论**：typed fetch client 的核心不是把 `fetch()` 包一层，而是把 success 和 Problem Details 解析成可收窄的 discriminated union。

**本节解决的问题**：这节解决客户端把所有 response 都当成功 JSON 的问题。`ApiResult<T>` 用 `ok: true` 和 `ok: false` 强制调用方处理错误分支。

**技术意义**：HTTP status 决定响应分支；TypeScript discriminated union 让 `if (result.ok)` 内获得 data 类型，失败分支获得 problem 类型。这样 SDK 不需要抛出所有业务错误。

**概念解释**：fetch wrapper 负责请求执行；request builder 负责 base URL、path、query、headers 和 body；response parser 负责根据 status/content type 转成 success 或 Problem Details。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：Node/Web Fetch 返回 Response；JavaScript runtime 执行 async promise；TypeScript narrowing 基于 `ok` 字段；OpenAPI 提供 expected schema；Zod/parser 可在客户端验证未知 JSON；security boundary 不自动附加 secret，除非调用方显式配置。

**底层机制**：`unwrapResult()` 展示 union 的使用：成功分支返回 `data`，失败分支抛出 `problem.code`。最终项目的 `ContractNotesClient.request()` 读取 `response.ok`，失败时调用 `parseProblemResponse()`。

**API / 配置 / 命令规则**：SDK 返回 `ApiResult<T>`；不要公开 raw `any`；不要默认吞掉非 2xx；Problem Details parse 失败也要返回稳定 fallback problem。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/08-client-sdk/typed-fetch-result.ts</span>
  </div>

```ts
export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; problem: { title: string; status: number; code: string } };

export function unwrapResult<T>(result: ApiResult<T>): T {
  if (!result.ok) throw new Error(result.problem.code);
  return result.data;
}
```
</div>

**逐行解释**：`ApiResult<T>` 的两个成员都包含 status；成功成员有 data；失败成员有 problem；`unwrapResult()` 先检查 `ok`，让 TypeScript 在分支内正确收窄。

**运行方式**：mock fetch 返回 200 JSON 时，`getVersion()` 得到 `{ ok: true, data }`；mock fetch 返回 404 Problem Details 时，得到 `{ ok: false, problem }`。

**预期输出**：正确 signal 是 unit/integration SDK tests 同时覆盖 success 和 problem；调用方不会在失败 response 上读取 `data`。

**执行过程**：fetch 返回 Promise；await 后获得 Response；SDK 根据 `response.ok` 分支；JSON parse 是异步；结果对象返回给调用方，TypeScript 在调用点执行控制流收窄。

**为什么会得到这个结果**：结果来自 discriminant 字段 `ok`。它把 HTTP 分支变成 TypeScript 可理解的类型分支，但 JSON 内容仍需要运行时 parse。

**对比情况**：抛异常式 SDK 适合 transport failure；union 式 SDK 适合业务错误显式处理。两者可共存，但不能让 404 看起来像成功 data。

**常见错误为什么错**：常见错误是 `return await response.json() as T`。它错在非 2xx Problem Details 会被伪装成成功类型。

**与真实项目的关系**：真实项目中，typed client 能降低前端重复写 fetch 分支的成本。识别 SDK 质量的方法是看它是否同时测试 success/problem，而不是只测 200。

**与当前学习路径的关系**：本节把 OpenAPI response 和 Problem Details 带到消费者侧，为 9.17 SDK import boundary 做铺垫。

**最终记忆模型**：记住：typed client 的类型安全从 HTTP status 分支开始，不从 `as T` 开始。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/version |
| route owner | ContractNotesClient.getVersion |
| contract artifact | VersionResponse schema |
| runtime validator | response.ok and problem parser |
| response schema | VersionResponse |
| error schema | ProblemDetails |
| version boundary | baseUrl + /v1 |
| compatibility rule | response shape change breaks client parser |
| test evidence | client-sdk.unit.test.ts and sdk.integration.test.ts |
| drift signal | SDK success type lacks OpenAPI field |

<a id="section-9-17"></a>

### 9.17 SDK boundary：no Prisma leak、no server-only imports、problem parser

**结论**：SDK 是消费者包边界，不能导入 Prisma、Express、server config、数据库 client 或服务端-only 类型；它只能暴露公共 DTO 和 request/response parser。

**本节解决的问题**：这节解释为什么 `PublicNoteDto` 只包含公开字段。Prisma model 可能有 password hash、relations、internal timestamps 或数据库专用类型，不应成为客户端 contract。

**技术意义**：一旦 SDK 导入 server-only 模块，前端 bundler 可能打包失败，秘密配置可能被误引用，数据库 schema 也会变成公共 API。

**概念解释**：SDK boundary 是发布给消费者的 TypeScript 表面。它应该从 OpenAPI/public DTO 派生，而不是从 server implementation 派生。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：package/module boundary 阻止 server imports；TypeScript type-system 可以检查 public DTO；Node resolution 会尝试加载 import；bundler 可能无法解析 `node:fs`、Prisma native client 或 Express；security boundary 防止内部字段泄露。

**底层机制**：`acceptsOnlyPublicDto()` 接收 `PublicNoteDto`，不接收 Prisma `Note`。最终项目审计 `src/client` imports，确认没有 `Prisma`、`express` 或 server-only import。

**API / 配置 / 命令规则**：SDK 目录只允许 fetch、URL、public types、problem parser 和 request builder；不要从 `src/generated/prisma` 导入；不要导入 Express Request/Response；不要暴露 cookie/session token 值。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/08-client-sdk/server-type-leak-mistake.ts</span>
  </div>

```ts
export type PublicNoteDto = {
  id: string;
  notebookId: string;
  title: string;
  body: string;
  updatedAt: string;
};

export function acceptsOnlyPublicDto(note: PublicNoteDto): string {
  return `${note.id}:${note.title}`;
}
```
</div>

**逐行解释**：`PublicNoteDto` 显式列出 id、notebookId、title、body、createdAt、updatedAt；函数只读公开字段，说明 SDK 依赖的是 contract DTO，不是数据库 relation。

**运行方式**：扫描 `src/client` import；如果出现 `../generated/prisma` 或 `express`，SDK boundary audit 应失败。

**预期输出**：正确 signal 是 `npm run sdk:check` 通过，静态扫描没有 server imports；错误 signal 是 bundler/module resolution failure 或 security review failure。

**执行过程**：TypeScript 编译解析 import graph；Node 或 bundler 根据 module specifier 找依赖；server-only import 可能触发 native dependency 或环境变量读取。

**为什么会得到这个结果**：结果来自模块边界。类型只在开发期存在，但 import specifier 会影响真实打包和运行环境。

**对比情况**：server DTO 可以包含 internal relation 和 database constraints；public DTO 只包含客户端需要且 contract 声明的字段。

**常见错误为什么错**：常见错误是为了“复用类型”从 Prisma client 导出 SDK 类型。它错在短期省代码，长期把数据库迁移变成 breaking API change。

**与真实项目的关系**：真实项目中，SDK boundary 泄露常表现为前端构建报 Prisma/Node core module 错误，或 API 客户端类型突然随数据库迁移变化。

**与当前学习路径的关系**：本节保护 Chapter 14 的 typed client，让它成为 contract consumer，而不是 server source tree 的延伸。

**最终记忆模型**：记住：SDK 复用 contract，不复用 server internals。

| evidence link | section-specific value |
| --- | --- |
| request path | SDK call to /v1/notes/:noteId |
| route owner | ContractNotesClient |
| contract artifact | public Note schema |
| runtime validator | problem parser |
| response schema | PublicNoteDto |
| error schema | ProblemDetails |
| version boundary | /v1 base path |
| compatibility rule | leaking server field creates accidental public API |
| test evidence | sdk:check plus import scan |
| drift signal | client imports Prisma or Express |

<a id="section-9-18"></a>

### 9.18 Contract drift detection：route inventory、operationId、schema mapping

**结论**：drift detection 把 Express route inventory 与 OpenAPI inventory 投影成同一种 key，然后比较 method、path、operationId 和 deprecated flag。

**本节解决的问题**：这节解释 contract drift 的具体识别方法。route 能运行但 OpenAPI 漏写，或 OpenAPI 写了 operation 但 Express 没有 route，都是漂移。

**技术意义**：人工 review 很容易漏 route/schema 同步。inventory 比较把“有没有同步”变成 deterministic check，适合放在 release gate。

**概念解释**：route inventory 是实现侧公开路由表；OpenAPI inventory 是契约侧公开 operation 表；schema mapping 是 operationId 到 request/response/error schema 的关系。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：Express behavior 提供实际 mount pattern；OpenAPI behavior 提供 path template；Node script 用普通数组和 Map 比较；TypeScript 检查 inventory item 字段；security boundary 使用 pattern 而不是 raw URL。

**底层机制**：`routeKey()` 用 method + path 生成比较 key。最终项目 `findContractDrift()` 遍历 routeInventory，在 OpenAPI map 中找同 key，再比较 operationId 和 deprecated flag。

**API / 配置 / 命令规则**：route inventory 不记录真实资源 ID；OpenAPI `{notebookId}` 要标准化成 `:notebookId` 再比较；operationId 必须唯一；deprecated flag 双侧一致。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/07-contract-testing/route-inventory.ts</span>
  </div>

```ts
export type RouteInventoryItem = {
  method: string;
  path: string;
  operationId: string;
};

export function routeKey(route: RouteInventoryItem): string {
  return `${route.method.toUpperCase()} ${route.path}`;
}
```
</div>

**逐行解释**：`RouteInventoryItem` 固定 method、path、operationId；`routeKey()` uppercases method，避免 `get` 和 `GET` 造成假漂移。

**运行方式**：把 OpenAPI 中 `getVersion` 改名为 `readVersion`，contract drift test 应报告 operation_id_mismatch。

**预期输出**：正确 signal 是 drift array 为空；错误 signal 是包含 `missing_openapi_operation` 或 `operation_id_mismatch` 的数组。

**执行过程**：YAML 文件先被读取解析；inventory arrays 进入 Map；每条 route 同步查找；发现差异时 push drift object；测试 assert drift 等于空数组。

**为什么会得到这个结果**：结果来自两个来源的 key 对齐。实现和契约只要有一侧变化未同步，key 或 operationId 就不再一致。

**对比情况**：日志中的 route pattern 是运行时观测；route inventory 是静态治理输入。二者都用 pattern，但用途不同。

**常见错误为什么错**：常见错误是用 `request.originalUrl` 构建 inventory。它错在 raw URL 包含真实 ID/query，既高基数又无法稳定映射 OpenAPI path template。

**与真实项目的关系**：真实项目中，drift 表现为文档 endpoint 404、SDK 方法调用不存在、deprecated 页面和实际 header 不一致。

**与当前学习路径的关系**：本节是 9.15 contract tests 的核心算法，也喂给 9.20 release gate。

**最终记忆模型**：记住：drift detection 不是跑业务流程，而是比较公开路由事实表。

| evidence link | section-specific value |
| --- | --- |
| request path | all route inventory paths |
| route owner | routeInventory |
| contract artifact | OpenAPI inventory |
| runtime validator | findContractDrift |
| response schema | ContractDrift[] |
| error schema | script assertion error |
| version boundary | /v1 |
| compatibility rule | missing operation blocks release |
| test evidence | contract-drift.unit.test.ts |
| drift signal | non-empty drift array |

<a id="section-9-19"></a>

### 9.19 Examples and fixtures：request、response、problem、non-secret examples

**结论**：examples 和 fixtures 是 contract 资产；它们必须是 synthetic、non-secret、可复用的请求、响应和 Problem Details 样本。

**本节解决的问题**：这节解释为什么 `openapi/examples` 不能放真实 token、cookie、password、authorization header、数据库 URL 或生产账号。

**技术意义**：示例会被文档站、测试、mock、SDK README 和代码评审复制。一个真实 secret 进入 fixture，就可能长期留在仓库和生成文档里。

**概念解释**：request example 展示客户端发送的 public fields；response example 展示服务端公开 DTO；problem example 展示错误 contract；fixture safety 确保它们不携带敏感信息。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：filesystem boundary 是 `openapi/examples` 文件；Node script 读取文件内容；regex 是浅层安全扫描；OpenAPI behavior 引用 examples；security boundary 要人工 review 语义，不能只依赖正则。

**底层机制**：`fixtureContainsSecret()` 用 pattern 查找 password、token、secret、cookie、authorization。最终项目的 release gate 遍历 examples 目录，文件名和内容命中 unsafe pattern 时失败。

**API / 配置 / 命令规则**：示例使用 `.example.test`、固定 UUID 和虚构文本；不要包含真实 session、hash、cookie、JWT、API key、DB URL 或 Redis URL；problem example 不含 stack trace。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/09-governance-gates/example-fixture-safety.ts</span>
  </div>

```ts
const secretPattern = /(password|token|secret|cookie|authorization)/i;

export function fixtureContainsSecret(value: string): boolean {
  return secretPattern.test(value);
}
```
</div>

**逐行解释**：`secretPattern` 是 case-insensitive regex；`fixtureContainsSecret()` 接收字符串并返回布尔值，适合用于文件名和文件内容两层检查。

**运行方式**：扫描 `problem.response.json` 应返回 false；扫描包含 `Authorization: Bearer` 的字符串应返回 true。

**预期输出**：正确 signal 是 example safety check 无 failure；错误 signal 是 `unsafe_example:<file>` 进入 release gate failures。

**执行过程**：Node 使用 `readdir()` 枚举 examples；`readFile()` 读取 UTF-8 文本；regex 同步测试；失败被收集进 release gate result。

**为什么会得到这个结果**：结果来自字符串模式命中。它不能证明示例一定安全，但能拦截常见 secret 类词汇，降低明显泄露风险。

**对比情况**：测试 fixture 可以是 synthetic yet realistic；生产抓包不是安全示例来源。真实响应即使脱敏，也要先评估是否含用户语义数据。

**常见错误为什么错**：常见错误是把 Postman 中的真实请求导出到仓库。它错在 cookie、token 和账号通常会随导出文件进入版本控制。

**与真实项目的关系**：真实项目中，example 泄露常通过文档门户、SDK sample 和 issue 截图传播。识别方法是 secret scanner 加人工 review。

**与当前学习路径的关系**：本节把安全边界引入 contract governance，支撑 9.20 release gate 的 example safety 检查。

**最终记忆模型**：记住：fixture 不是日志摘录；它是公开、合成、可长期保留的 contract 样本。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/contracts/openapi.yaml examples |
| route owner | getOpenApiYaml |
| contract artifact | openapi/examples/*.json |
| runtime validator | exampleLooksSafe |
| response schema | request/response/problem examples |
| error schema | release gate failure |
| version boundary | /v1 examples |
| compatibility rule | examples must track schema without secrets |
| test evidence | contract release gate |
| drift signal | example fields no longer match schema or contain secret words |

<a id="section-9-20"></a>

### 9.20 Compatibility report 与 release gate

**结论**：compatibility report 给出变更风险分类，release gate 把 OpenAPI version、Problem Details、route drift、examples safety 和 `/v1` policy 汇总成可失败检查。

**本节解决的问题**：这节说明为什么治理不能只靠人工 checklist。发布前需要一个 Node script 把 contract artifact 的关键规则转成退出码。

**技术意义**：release gate 不证明业务绝对正确，但能阻止已知 contract 破坏进入交付链。它把 review 从“你记得改文档了吗”变成“脚本发现了哪些 failure”。

**概念解释**：compatibility report 面向变更解释；release gate 面向 go/no-go。前者可以包含 limitations，后者必须给出 passed/failures。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：Node process 运行脚本；filesystem 读取 YAML 和 examples；OpenAPI/drift/checker 产生 failures；metrics 记录 violation；TypeScript 检查 gate result shape；deployment boundary 是构建或发布前停止。

**底层机制**：`runContractReleaseGate()` 加载 OpenAPI document，检查 `openapi === '3.1.1'`、Problem Details component、drift array、所有 route 是否 `/v1/`、example safety；failure 被 record 到 metrics 并返回 result。

**API / 配置 / 命令规则**：gate 不做 `npm audit fix`、不改文件、不删除 volume；它只检查并失败。semantic compatibility 仍需人工 review，limitations 必须诚实保留。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/09-governance-gates/contract-release-gate.ts</span>
  </div>

```ts
export type ReleaseGateResult = {
  passed: boolean;
  failures: string[];
};

export function assertReleaseGate(result: ReleaseGateResult): void {
  if (!result.passed) throw new Error(result.failures.join("; "));
}
```
</div>

**逐行解释**：`ReleaseGateResult` 明确 `passed` 和 `failures`；检查顺序从 artifact root 到 drift 到 examples；`recordContractViolation()` 用 failure 名称记录低基数指标。

**运行方式**：`npm run contract:check` 调用 gate 并 assert `failures` 为空；人为删除 `ProblemDetails` component 会让 gate 返回 failure。

**预期输出**：正确 signal 是 `contract check passed`；错误 signal 是 failures 列表，例如 `problem_details_schema` 或 `version_path:createNotebook`。

**执行过程**：脚本进程启动；async 文件读取进入事件循环 I/O；解析完成后同步规则检查；failure 数组决定 assert；退出码反馈给终端或 CI。

**为什么会得到这个结果**：结果来自门禁把多个独立 contract 风险压缩成一个发布判定。任何风险非空都说明当前 artifact 不满足本章治理规则。

**对比情况**：compatibility report 可以说某项 potentially compatible；release gate 可以决定 breaking 不允许进入 `/v1`。报告解释风险，门禁执行策略。

**常见错误为什么错**：常见错误是把 release gate 做成只打印 warning。它错在 CI 仍会继续，破坏性 contract 变化会进入后续环境。

**与真实项目的关系**：真实项目中，release gate 常接入 CI。识别质量的方法是看它是否有明确退出码、可读 failure 名称和安全 limitations。

**与当前学习路径的关系**：本节汇总 9.3、9.4、9.11、9.18、9.19 的机制，是 Chapter 14 的发布边界核心。

**最终记忆模型**：记住：report 解释变化，gate 阻断风险；没有退出码的门禁不是门禁。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/contracts/compatibility-report |
| route owner | getCompatibilityReport and contract:check script |
| contract artifact | OpenAPI plus route inventory plus examples |
| runtime validator | runContractReleaseGate |
| response schema | ReleaseGateResult/CompatibilityReport |
| error schema | script assertion failure |
| version boundary | /v1 and openapi 3.1.1 |
| compatibility rule | non-empty failures block release |
| test evidence | contract.integration.test.ts |
| drift signal | release gate failure item |

<a id="section-9-21"></a>

### 9.21 API governance metrics：operationId、version、deprecated usage、contract violation

**结论**：API governance metrics 只能使用低基数（low-cardinality）标签，例如 route pattern、operationId、version family、status class、check name 和 result。

**本节解决的问题**：这节防止把 raw URL、userId、noteId、token 或 query string 放进 metrics labels。治理指标要能聚合，不要按每个资源实例爆炸。

**技术意义**：prom-client Counter 会按 label 组合生成时间序列。高基数标签会增加内存、存储和查询成本，也可能泄露用户数据。

**概念解释**：低基数标签是值集合有限且可预期的标签；高基数标签是用户、资源、搜索词或原始 URL 这类不断增长的值。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：Express response finish 提供 status code；route inventory 提供 pattern；prom-client registry 存储 metrics；TypeScript 只能检查 label object shape；security boundary 禁止敏感值进入 metrics。

**底层机制**：`hasHighCardinalityLabel()` 用 key 检查 userId、noteId、rawUrl。最终项目 metrics 使用 `route`、`operation_id`、`version_family`、`status_class`、`check_name`、`result`，不记录真实 ID。

**API / 配置 / 命令规则**：HTTP request count 使用 method/route pattern/status class；deprecated usage 使用 operationId；contract violation 使用 check name；compatibility 使用 result；SDK parse failure 使用 operationId。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/09-governance-gates/api-governance-metrics.ts</span>
  </div>

```ts
export type MetricLabelSet = {
  operationId?: string;
  route?: string;
  statusClass?: string;
  result?: string;
};

export function hasHighCardinalityLabel(labels: MetricLabelSet): boolean {
  return Object.keys(labels).some((key) => key === "userId" || key === "noteId" || key === "rawUrl");
}
```
</div>

**逐行解释**：`MetricLabelSet` 列出允许的治理标签形态；函数只检查危险 key，说明 label key 本身就是治理边界，不等到值进入 registry 再处理。

**运行方式**：传入 `{ route: '/v1/notes/:noteId', statusClass: '2xx' }` 返回 false；传入 `{ rawUrl: '/v1/notes/real-id' }` 返回 true。

**预期输出**：正确 signal 是 `/v1/metrics` 暴露有限 label 集；错误 signal 是 metrics 中出现真实 UUID、email、query 或 userId label。

**执行过程**：请求完成触发 response `finish`；middleware 调用 `getRoutePattern()`；Counter `inc()` 按低基数 labels 更新 registry；metrics route 序列化当前 registry。

**为什么会得到这个结果**：结果来自 label cardinality。pattern 把无限资源 ID 压缩成有限 route，operationId 把 endpoint 身份压缩成稳定字符串。

**对比情况**：`/v1/notes/:noteId` 是安全 pattern；`/v1/notes/22222222-2222-4222-8222-222222222222` 是 raw resource instance，不适合 label。

**常见错误为什么错**：常见错误是用 `request.originalUrl` 作为 label。它错在 query 和资源 ID 会创建无限序列，并可能泄露搜索内容。

**与真实项目的关系**：真实项目中，高基数 metrics 会表现为 Prometheus 内存升高、dashboard 慢、账单异常或隐私审计失败。识别方法是按 label value 数量排序。

**与当前学习路径的关系**：本节连接 Chapter 10 observability 与 Chapter 14 governance，把 contract violation 和 deprecated usage 变成可观察低基数信号。

**最终记忆模型**：记住：metrics label 记录类别，不记录实例。

| evidence link | section-specific value |
| --- | --- |
| request path | /v1/metrics |
| route owner | getMetrics |
| contract artifact | metrics label policy |
| runtime validator | getRoutePattern and metric wrappers |
| response schema | Prometheus text |
| error schema | ProblemDetails for route errors |
| version boundary | route pattern includes /v1 |
| compatibility rule | label shape changes affect dashboards |
| test evidence | static metrics audit |
| drift signal | rawUrl or resource id appears in labels |

<a id="section-9-22"></a>

### 9.22 Chapter integration: contract-governed-notes-api

**结论**：`contract-governed-notes-api` 把本章所有边界串成一条证据链：HTTP request、Express route、Zod validator、Prisma persistence、OpenAPI operation、Problem Details、typed client、metrics 和 release gate。

**本节解决的问题**：这节不是重新介绍项目文件，而是解释一个请求如何穿过整条 contract chain，并在哪里被不同检查观察。

**技术意义**：单独学习 OpenAPI、Zod 或 SDK 都容易局部正确；集成项目要求每个 endpoint 同时满足 runtime、contract、client、metrics 和 deployment 入口。

**概念解释**：整合链从 `http://localhost:8080/v1/...` 开始，经 NGINX 转发到 API 容器，Express mount `/v1` routes，Zod 解析输入，controller 访问 Prisma/Redis，response 走 Problem Details 或 success schema，测试和脚本比较 contract artifact。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, OpenAPI behavior, Zod/runtime validation behavior, Prisma/database behavior, testing boundary, security boundary**：deployment boundary 是 NGINX 8080；Express boundary 是 `/v1` router；validation boundary 是 Zod；database boundary 是 Prisma/PostgreSQL；OpenAPI boundary 是 YAML；client boundary 是 fetch SDK；observability boundary 是 prom-client；release boundary 是 contract scripts。

**底层机制**：`buildCompatibilityReport()` 汇总分类结果；`runContractReleaseGate()` 检查 artifact；`smoke-test.ts` 通过 NGINX 验证 `/v1/health/live` 与 `/v1/health/ready`；测试覆盖 operationId、drift、Problem Details 和 SDK parse。

**API / 配置 / 命令规则**：不要绕过 NGINX 把 smoke 默认改回 3020；不要把 PostgreSQL 18 volume target 改回 `/var/lib/postgresql/data`；不要让 SDK import server internals；不要把 OpenAPI project version 改成未经本地 validator 支持的版本。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/14-api-contract-governance/09-governance-gates/compatibility-report.ts</span>
  </div>

```ts
export type CompatibilityReport = {
  compatible: number;
  potentiallyCompatible: number;
  breaking: number;
};

export function reportHasBreakingChanges(report: CompatibilityReport): boolean {
  return report.breaking > 0;
}
```
</div>

**逐行解释**：`CompatibilityReport` 统计 compatible、potentially compatible 和 breaking；它不访问数据库，说明治理报告可以在 artifact 层运行；真实 runtime validation 由 routes/controllers 负责。

**运行方式**：完整链条是 `npm install`、`prisma:generate`、`typecheck`、`build`、`npm test`、contract scripts、Compose config/build/up、migration、seed、smoke、compose down。

**预期输出**：正确 signal 是本地 tests 和 contract scripts 通过，Docker stack healthy，smoke 通过 `http://localhost:8080`。

**执行过程**：本地脚本先验证静态 artifact；Docker build 复制 package-lock 并执行 `npm ci`；Compose 先等 Postgres/Redis healthy，再启动 API 和 NGINX；smoke 从 host 访问 NGINX，不直接访问 API 内部端口。

**为什么会得到这个结果**：结果发生是因为每个层只承担自己的责任：OpenAPI 描述，Zod 解析，Express 分派，Prisma 持久化，SDK 消费，metrics 观察，release gate 阻断。

**对比情况**：只运行 Express app 能证明 server 可启动；完整 contract-governed project 还要证明 OpenAPI、tests、SDK、Docker 和 smoke 入口一致。

**常见错误为什么错**：常见错误是为了让 smoke 通过而暴露 API 3020。它错在生产模拟入口是 NGINX 8080，绕过 proxy 会漏掉真实部署边界。

**与真实项目的关系**：真实项目中，API governance 成功的标志不是文档漂亮，而是每次变更都能被 route、contract、client、metrics 和 release gate 同时解释。

**与当前学习路径的关系**：本节把 Chapter 14 从单点知识合并为运行链，随后 14.2 按责任组解释项目文件而不是逐文件填充。

**最终记忆模型**：记住：最终项目是一条可运行证据链，不是文件清单；每个文件组都必须拥有一个清晰边界和一个可观察信号。

| evidence link | section-specific value |
| --- | --- |
| request path | http://localhost:8080/v1/health/ready |
| route owner | healthRoutes through NGINX |
| contract artifact | openapi/openapi.yaml and route inventory |
| runtime validator | Zod schemas and health checks |
| response schema | health/version/contract schemas |
| error schema | ProblemDetails |
| version boundary | /v1 plus OpenAPI 3.1.1 |
| compatibility rule | release gate blocks known drift |
| test evidence | tests plus smoke |
| drift signal | any chain link changes without matching artifact |

## 10. API 与规则索引

| 规则 | 具体约束 |
| --- | --- |
| OpenAPI version | 本章最终项目使用 `openapi: 3.1.1`；官方资料确认 3.2.0 存在，但本地不引入 3.2 专用 validator |
| Version path | 所有公共 endpoint 以 `/v1` 开头 |
| Error schema | 错误响应复用 `ProblemDetails` 和 `ProblemResponse` |
| CSRF | mutating protected routes 使用 `x-csrf-token` |
| Metrics | 标签只允许 route pattern、operationId、version family、status class、rule name 或 result |
| Client SDK | 不导入 Prisma、Express 或服务端-only 模块 |

## 11. 常见错误对照表

| 错误 | 为什么错 | 正确识别方式 |
| --- | --- | --- |
| 把 OpenAPI 当 README | README 不会被测试稳定解析 | 检查 `operationId`、schema 和 responses 是否能被脚本读取 |
| 用 Prisma model 作为 SDK 类型 | 泄露数据库关系和服务端实现 | SDK 目录中不应出现 `Prisma` 或 `express` import |
| metrics label 使用 raw URL | raw ID 会产生高基数 | 搜索 `originalUrl`、`userId`、`noteId` 标签 |
| 删除字段但不改版本 | 已有客户端可能解析失败 | compatibility report 应标记 `breaking` |
| 弃用 endpoint 不发 header | 消费者无法在运行时观察迁移窗口 | 响应包含 `Deprecation` 与 `Sunset` |

## 12. 调试与验证方法

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
npm test -- --test-concurrency=1
```
</div>


如果 `openapi:check` 失败，先检查 YAML 根对象、`paths`、`components.schemas.ProblemDetails` 和每个 operation 的 `operationId`。如果 `contract:check` 失败，先比较 `src/contracts/route-inventory.ts` 与 `openapi/openapi.yaml` 的 method/path/operationId/deprecated flag。如果 `sdk:check` 失败，先确认 client 解析 success 与 Problem Details 都走 `ok` discriminated union。

## 13. 分项练习说明

练习目录按责任层分组：`01-contract-model` 建立契约证据链；`02-openapi-model` 建立 OpenAPI 对象模型；`03-request-boundary` 解析 HTTP 输入来源；`04-schema-ownership` 区分 schema owner；`05-response-contract` 处理 status、empty response、pagination 和 Problem Details；`06-versioning-compatibility` 分类版本与兼容性；`07-contract-testing` 做 inventory 对齐；`08-client-sdk` 建立 typed client 边界；`09-governance-gates` 汇总 release gate 和 metrics。

## 14. 最终迷你项目

最终项目把本章机制整合到一个 contract-governed notes API 中；它不替代前面逐节教学，而是把每个边界放到同一条可运行证据链里。

### 14.1 项目目标

项目目标是构建一个通过 NGINX 暴露 `http://localhost:8080` 的 `/v1` API，提供认证、notebook、note、contract endpoints、version endpoint、deprecated demo、metrics、contract checks、compatibility checks 和 typed client checks。

### 14.2 项目结构与职责

本节按责任组解释最终项目，而不是逐文件堆清单。判断一个文件属于哪一组，要看它拥有哪条边界、产生什么运行时或验证信号、阻止哪类常见错误。

#### contract artifact

- **负责边界**：这一组拥有 public contract 的静态表达：OpenAPI 版本、servers、paths、operationId、parameters、requestBody、responses、components、headers、安全 schemes 和 non-secret examples。
- **包含文件**：`openapi/openapi.yaml`、`openapi/examples/create-note.request.json`、`openapi/examples/note.response.json`、`openapi/examples/problem.response.json`、`README.md`
- **可观察信号**：`npm run openapi:check` 能读取 YAML 并确认 `openapi: 3.1.1`、23 个 operationId、Problem Details component 和 deprecated operation；`GET /v1/contracts/openapi.yaml` 通过运行时入口暴露同一 artifact。
- **防止的错误**：它防止把契约散落在 README 或 controller 注释中，避免客户端、mock、测试和文档各自读取不同事实。

#### route implementation

- **负责边界**：这一组拥有 Express 5 route mount、middleware 顺序、handler 分派和响应发送。它决定真实 HTTP request 会命中哪个 controller。
- **包含文件**：`src/app.ts`、`src/health/health.routes.ts`、`src/observability/metrics.routes.ts`、`src/modules/auth/auth.routes.ts`、`src/modules/notebooks/notebooks.routes.ts`、`src/modules/notes/notes.routes.ts`、`src/modules/contracts/contracts.routes.ts`、`src/modules/versioning/versioning.routes.ts` 以及对应 controller 文件
- **可观察信号**：`npm run contract:check` 通过 route inventory 与 OpenAPI inventory 对齐；`npm run smoke` 通过 NGINX 访问 `/v1/health/live` 和 `/v1/health/ready` 证明 route 在运行栈中可达。
- **防止的错误**：它防止 OpenAPI 声明一个不存在的 endpoint，也防止 Express 新增 public route 却没有 contract artifact。

#### runtime validation

- **负责边界**：这一组拥有不可信 HTTP 输入进入 controller 前的 runtime parsing：path params、query、headers、cookies 和 body 都要从 unknown 变成已验证值。
- **包含文件**：`src/shared/validation/validate-request.ts`、`src/shared/validation/schema-registry.ts`、`src/modules/auth/auth.schema.ts`、`src/modules/notebooks/notebooks.schema.ts`、`src/modules/notes/notes.schema.ts`
- **可观察信号**：`npm run typecheck` 证明 TypeScript 调用边界一致；测试和 contract check 证明 validator 与 public parameters/requestBody 没有明显漂移。
- **防止的错误**：它防止用 `as SomeType` 假装验证，也防止非法 UUID 或无限 limit 直接进入 Prisma 查询。

#### error contract

- **负责边界**：这一组拥有失败响应的 public shape。内部 Error、HttpError 和外部 Problem Details 在这里转换，客户端只依赖安全、稳定、低泄露的错误字段。
- **包含文件**：`src/shared/errors/http-error.ts`、`src/shared/errors/problem-details.ts`、`src/shared/errors/error-middleware.ts`、`openapi/openapi.yaml` 的 `ProblemDetails` 与 `ProblemResponse`
- **可观察信号**：`tests/problem-details.unit.test.ts` 验证 query-stripped `instance`；OpenAPI check 验证 reusable Problem Details component；SDK tests 验证失败分支解析 Problem Details。
- **防止的错误**：它防止 controller 随手返回不同错误 shape，也防止 stack trace、SQL、token 或 request body 泄露给消费者。

#### compatibility and drift detection

- **负责边界**：这一组拥有 contract governance 的比较逻辑：operationId 唯一性、route/OpenAPI 对齐、兼容性分类、safe example 扫描、弃用策略和 release gate。
- **包含文件**：`src/contracts/operation-id.ts`、`src/contracts/route-inventory.ts`、`src/contracts/openapi-loader.ts`、`src/contracts/openapi-inventory.ts`、`src/contracts/contract-drift.ts`、`src/contracts/compatibility-classifier.ts`、`src/contracts/compatibility-report.ts`、`src/contracts/example-fixtures.ts`、`src/contracts/deprecation-policy.ts`、`src/contracts/version-policy.ts`、`src/contracts/contract-release-gate.ts`
- **可观察信号**：`npm run contract:check`、`npm run compatibility:check`、`tests/contract-drift.unit.test.ts` 和 `tests/contract.integration.test.ts` 证明这些规则能转成失败信号。
- **防止的错误**：它防止变更只改实现不改契约，也防止 breaking change 没有被分类就进入 `/v1`。

#### typed client

- **负责边界**：这一组拥有消费者侧调用边界：base URL、path、query、headers、body、fetch 执行、success/problem discriminated union 和 fallback problem parser。
- **包含文件**：`src/client/api-client.ts`、`src/client/api-client.types.ts`、`src/client/problem-parser.ts`、`src/client/request-builder.ts`
- **可观察信号**：`npm run sdk:check`、`tests/client-sdk.unit.test.ts`、`tests/sdk.integration.test.ts` 验证 success 和 Problem Details 两条路径；静态扫描确认没有 Prisma/Express/server-only imports。
- **防止的错误**：它防止 SDK 用 `as T` 把错误响应伪装成成功，也防止把 server implementation 当 public client API。

#### observability

- **负责边界**：这一组拥有低基数治理信号：method、route pattern、status class、operationId、version family、check name、compatibility result 和 SDK parse failure。
- **包含文件**：`src/observability/logger.ts`、`src/observability/metrics.ts`、`src/observability/http-metrics.ts`、`src/observability/contract-metrics.ts`、`src/observability/metrics.routes.ts`
- **可观察信号**：`GET /v1/metrics` 暴露 Prometheus text；内容审计确认 labels 没有 `rawUrl`、`userId` 或 `noteId` 这类高基数/敏感边界。
- **防止的错误**：它防止把真实资源 ID、搜索词、cookie 或用户标识写进 metrics label，避免观测系统和隐私边界被污染。

#### persistence

- **负责边界**：这一组拥有数据持久化和依赖健康检查。Prisma schema 是数据库模型，不是 public DTO；Redis 在本章主要承担运行连续性和 readiness 依赖。
- **包含文件**：`prisma/schema.prisma`、`prisma.config.ts`、`prisma/migrations/0001_init/migration.sql`、`prisma/seed.ts`、`src/db/prisma.ts`、`src/db/db-health.ts`、`src/redis/redis-client.ts`、`src/redis/redis-health.ts`
- **可观察信号**：`npm run prisma:generate`、`npm run prisma:migrate:deploy`、`npm run seed` 和 `/v1/health/ready` 证明数据库/Redis 依赖可达。
- **防止的错误**：它防止把 Prisma model 泄露到 SDK/OpenAPI，也防止 readiness 把未连接依赖误报为可服务。

#### runtime/deployment

- **负责边界**：这一组拥有本地生产模拟：Node built output、Docker image、PostgreSQL 18 volume layout、Redis、API container、NGINX reverse proxy、timeouts、shutdown 和 environment parsing。
- **包含文件**：`Dockerfile`、`compose.yaml`、`nginx/nginx.conf`、`.dockerignore`、`.env.example`、`src/server.ts`、`src/config/env.ts`、`src/config/production.ts`
- **可观察信号**：`docker compose config` 渲染 PostgreSQL target 为 `/var/lib/postgresql`；`docker compose build --no-cache --progress=plain api` 构建镜像；`npm run smoke` 从 `http://localhost:8080` 通过 NGINX 验证入口。
- **防止的错误**：它防止绕过 NGINX 直接测 3020，也防止 PostgreSQL 18 被错误挂载到旧的 `/var/lib/postgresql/data`。

#### validation scripts

- **负责边界**：这一组拥有可重复命令入口，把人工检查转换为 npm scripts、退出码和可读输出。
- **包含文件**：`scripts/smoke-test.ts`、`scripts/wait-for-ready.ts`、`scripts/openapi-check.ts`、`scripts/contract-check.ts`、`scripts/compatibility-check.ts`、`scripts/sdk-check.ts`
- **可观察信号**：`npm run smoke` 默认使用 `http://localhost:8080`；`openapi:check`、`contract:check`、`compatibility:check`、`sdk:check` 分别覆盖 artifact、drift、变更分类和 client boundary。
- **防止的错误**：它防止只靠一次手工 curl 或开发者口头确认来判断 contract 是否健康。

#### tests

- **负责边界**：这一组拥有回归证据：环境默认值、Problem Details、operationId、兼容性分类、弃用策略、版本提取、drift detection、SDK success/problem 和 OpenAPI artifact。
- **包含文件**：`tests/env.unit.test.ts`、`tests/problem-details.unit.test.ts`、`tests/operation-id.unit.test.ts`、`tests/compatibility-classifier.unit.test.ts`、`tests/deprecation-policy.unit.test.ts`、`tests/version-policy.unit.test.ts`、`tests/contract-drift.unit.test.ts`、`tests/client-sdk.unit.test.ts`、`tests/openapi.integration.test.ts`、`tests/contract.integration.test.ts`、`tests/sdk.integration.test.ts`
- **可观察信号**：`npm test -- --test-concurrency=1` 以 Node built-in test runner 执行 11 个测试文件，任何 assertion/rejection 都会转成失败退出码。
- **防止的错误**：它防止只测试 happy path，也防止 guide 中讲到的治理规则没有对应可执行证据。

### 14.3 完整项目代码

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/.dockerignore</span>
  </div>

```txt
node_modules
dist
npm-debug.log
.env
.git
.DS_Store
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/.env.example</span>
  </div>

```txt
NODE_ENV=development
PORT=3020
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/contract_governed_notes_api
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=contract_notes_session
SESSION_SECRET=local-development-session-secret-32chars
SESSION_TTL_SECONDS=604800
CSRF_COOKIE_NAME=contract_notes_csrf
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
TRUST_PROXY=0
COOKIE_SECURE=false
LOG_LEVEL=info
SHUTDOWN_TIMEOUT_MS=10000
HTTP_REQUEST_TIMEOUT_MS=30000
HTTP_HEADERS_TIMEOUT_MS=10000
HTTP_KEEP_ALIVE_TIMEOUT_MS=5000
DEPENDENCY_TIMEOUT_MS=500
REDIS_CONNECT_TIMEOUT_MS=1000
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/Dockerfile</span>
  </div>

```txt
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/openapi ./openapi
COPY --from=build /app/prisma ./prisma
EXPOSE 3020
CMD ["node", "dist/src/server.js"]
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/README.md</span>
  </div>

````txt
# Contract Governed Notes API

This mini project demonstrates a contract-governed Express 5 API.

## Requirements

- Node.js 26 or newer
- Docker Desktop
- npm

## Local setup

```bash
npm install
npm run prisma:generate
```

## Docker runtime

```bash
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
```

The public base URL is `http://localhost:8080`.

## Validation

```bash
npm run typecheck
npm run build
npm test -- --test-concurrency=1
npm run smoke
npm run openapi:check
npm run contract:check
npm run compatibility:check
npm run sdk:check
```

PowerShell override:

```bash
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
Remove-Item Env:\SMOKE_BASE_URL
```

macOS and Linux override:

```bash
SMOKE_BASE_URL=http://localhost:8080 npm run smoke
```

## Contract endpoints

- `GET /v1/contracts/openapi.yaml`
- `GET /v1/contracts/route-inventory`
- `GET /v1/contracts/compatibility-report`
- `GET /v1/version`
- `GET /v1/deprecated-demo`

## Versioning and deprecation policy

The API uses `/v1` path versioning. The deprecated demo endpoint sets `Deprecation`, `Sunset`, and `Link` headers.

## Metrics

`GET /v1/metrics` exposes low-cardinality Prometheus metrics. Labels use route patterns, operation IDs, status classes, and rule names only.

## Limitations

- The compatibility report is rule-based and does not replace human review.
- This project does not publish an SDK package.
- This project does not include GraphQL, gRPC, AsyncAPI, Kubernetes, or cloud gateway configuration.
````
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/compose.yaml</span>
  </div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: contract_governed_notes_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - contract-postgres-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d contract_governed_notes_api"]
      interval: 5s
      timeout: 5s
      retries: 20

  redis:
    image: redis:8-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 20

  api:
    build:
      context: .
    environment:
      NODE_ENV: production
      PORT: 3020
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/contract_governed_notes_api
      REDIS_URL: redis://redis:6379
      SESSION_COOKIE_NAME: contract_notes_session
      SESSION_SECRET: local-compose-session-secret-32chars
      SESSION_TTL_SECONDS: 604800
      CSRF_COOKIE_NAME: contract_notes_csrf
      ALLOWED_ORIGINS: http://localhost:8080,http://127.0.0.1:8080
      TRUST_PROXY: "1"
      COOKIE_SECURE: "false"
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
      HTTP_REQUEST_TIMEOUT_MS: 30000
      HTTP_HEADERS_TIMEOUT_MS: 10000
      HTTP_KEEP_ALIVE_TIMEOUT_MS: 5000
      DEPENDENCY_TIMEOUT_MS: 500
      REDIS_CONNECT_TIMEOUT_MS: 1000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3020/v1/health/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 10

  nginx:
    image: nginx:1.29-alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      api:
        condition: service_healthy

volumes:
  contract-postgres-data:
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/nginx/nginx.conf</span>
  </div>

```txt
server {
  listen 80;
  server_name _;

  location / {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://api:3020;
  }
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/openapi/examples/create-note.request.json</span>
  </div>

```json
{
  "title": "Contract note",
  "body": "This request body contains only public fields."
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/openapi/examples/note.response.json</span>
  </div>

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "notebookId": "11111111-1111-4111-8111-111111111111",
  "title": "Contract note",
  "body": "This response contains public data only.",
  "createdAt": "2026-07-30T00:00:00.000Z",
  "updatedAt": "2026-07-30T00:00:00.000Z"
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/openapi/examples/problem.response.json</span>
  </div>

```json
{
  "type": "https://api.example.test/problems/validation_failed",
  "title": "Validation failed",
  "status": 400,
  "detail": "Request did not match the public contract.",
  "code": "validation_failed"
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/openapi/openapi.yaml</span>
  </div>

```txt
openapi: 3.1.1
info:
  title: Contract Governed Notes API
  version: 1.0.0
servers:
  - url: http://localhost:8080
tags:
  - name: Health
  - name: Observability
  - name: Auth
  - name: Notebooks
  - name: Notes
  - name: Contracts
  - name: Version
paths:
  /v1/health/live:
    get:
      operationId: getLiveHealth
      tags: [Health]
      summary: Live health
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/health/ready:
    get:
      operationId: getReadyHealth
      tags: [Health]
      summary: Ready health
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/metrics:
    get:
      operationId: getMetrics
      tags: [Observability]
      summary: Prometheus metrics
      responses:
        '200':
          description: Metrics payload
          content:
            text/plain:
              schema:
                type: string
  /v1/auth/register:
    post:
      operationId: registerUser
      tags: [Auth]
      summary: Register user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthRequest'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/auth/login:
    post:
      operationId: loginUser
      tags: [Auth]
      summary: Login user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthRequest'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/auth/logout:
    post:
      operationId: logoutUser
      tags: [Auth]
      summary: Logout user
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/auth/me:
    get:
      operationId: getCurrentUser
      tags: [Auth]
      summary: Current user
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/auth/csrf:
    get:
      operationId: getCsrfToken
      tags: [Auth]
      summary: CSRF token
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/notebooks:
    get:
      operationId: listNotebooks
      tags: [Notebooks]
      summary: List notebooks
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
    post:
      operationId: createNotebook
      tags: [Notebooks]
      summary: Create notebook
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NotebookWrite'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/notebooks/{notebookId}:
    get:
      operationId: getNotebookById
      tags: [Notebooks]
      summary: Get notebook
      parameters:
        - $ref: '#/components/parameters/NotebookId'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
    patch:
      operationId: updateNotebookById
      tags: [Notebooks]
      summary: Update notebook
      parameters:
        - $ref: '#/components/parameters/NotebookId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NotebookWrite'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
    delete:
      operationId: deleteNotebookById
      tags: [Notebooks]
      summary: Delete notebook
      parameters:
        - $ref: '#/components/parameters/NotebookId'
      responses:
        '204':
          description: No content
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/notebooks/{notebookId}/notes:
    get:
      operationId: listNotebookNotes
      tags: [Notes]
      summary: List notes
      parameters:
        - $ref: '#/components/parameters/NotebookId'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
    post:
      operationId: createNotebookNote
      tags: [Notes]
      summary: Create note
      parameters:
        - $ref: '#/components/parameters/NotebookId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NotebookWrite'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/notes/{noteId}:
    get:
      operationId: getNoteById
      tags: [Notes]
      summary: Get note
      parameters:
        - $ref: '#/components/parameters/NoteId'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
    patch:
      operationId: updateNoteById
      tags: [Notes]
      summary: Update note
      parameters:
        - $ref: '#/components/parameters/NoteId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NoteWrite'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
    delete:
      operationId: deleteNoteById
      tags: [Notes]
      summary: Delete note
      parameters:
        - $ref: '#/components/parameters/NoteId'
      responses:
        '204':
          description: No content
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/contracts/openapi.yaml:
    get:
      operationId: getOpenApiYaml
      tags: [Contracts]
      summary: OpenAPI YAML
      responses:
        '200':
          description: OpenAPI YAML
          content:
            application/yaml:
              schema:
                type: string
  /v1/contracts/route-inventory:
    get:
      operationId: getRouteInventory
      tags: [Contracts]
      summary: Route inventory
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/contracts/compatibility-report:
    get:
      operationId: getCompatibilityReport
      tags: [Contracts]
      summary: Compatibility report
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/version:
    get:
      operationId: getVersion
      tags: [Version]
      summary: Version metadata
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
        '400':
          $ref: '#/components/responses/ProblemResponse'
        '401':
          $ref: '#/components/responses/ProblemResponse'
        '404':
          $ref: '#/components/responses/ProblemResponse'
  /v1/deprecated-demo:
    get:
      operationId: getDeprecatedDemo
      tags: [Version]
      summary: Deprecated demo
      deprecated: true
      responses:
        '200':
          description: Deprecated response
          headers:
            Deprecation:
              $ref: '#/components/headers/Deprecation'
            Sunset:
              $ref: '#/components/headers/Sunset'
            Link:
              $ref: '#/components/headers/Link'
          content:
            application/json:
              schema:
                type: object
components:
  securitySchemes:
    sessionCookie:
      type: apiKey
      in: cookie
      name: contract_notes_session
    csrfHeader:
      type: apiKey
      in: header
      name: x-csrf-token
  parameters:
    NotebookId:
      name: notebookId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    NoteId:
      name: noteId
      in: path
      required: true
      schema:
        type: string
        format: uuid
  headers:
    Deprecation:
      description: Signals that an operation is deprecated.
      schema:
        type: string
    Sunset:
      description: HTTP-date after which the operation may stop responding.
      schema:
        type: string
    Link:
      description: Link relation for replacement or successor information.
      schema:
        type: string
  responses:
    ProblemResponse:
      description: RFC 9457 problem response
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
          examples:
            validation:
              value:
                type: https://api.example.test/problems/validation_failed
                title: Validation failed
                status: 400
                detail: Request did not match the public contract.
                code: validation_failed
  schemas:
    AuthRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
    NotebookWrite:
      type: object
      required: [title]
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 120
    NoteWrite:
      type: object
      required: [title]
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 120
        body:
          type: string
          maxLength: 20000
    ProblemDetails:
      type: object
      required: [type, title, status, code]
      properties:
        type:
          type: string
          format: uri
        title:
          type: string
        status:
          type: integer
          minimum: 100
          maximum: 599
        detail:
          type: string
        instance:
          type: string
        code:
          type: string
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
    Notebook:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    Note:
      type: object
      properties:
        id:
          type: string
          format: uuid
        notebookId:
          type: string
          format: uuid
        title:
          type: string
        body:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    NotebookList:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Notebook'
        nextCursor:
          type: [string, 'null']
        limit:
          type: integer
    NoteList:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Note'
        nextCursor:
          type: [string, 'null']
        limit:
          type: integer
    CompatibilityReport:
      type: object
      properties:
        cases:
          type: array
          items:
            type: object
        summary:
          type: object
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/package.json</span>
  </div>

```json
{
  "name": "contract-governed-notes-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/server.js",
    "typecheck": "tsc --noEmit",
    "test": "node --import tsx --test tests/env.unit.test.ts tests/problem-details.unit.test.ts tests/operation-id.unit.test.ts tests/compatibility-classifier.unit.test.ts tests/deprecation-policy.unit.test.ts tests/version-policy.unit.test.ts tests/contract-drift.unit.test.ts tests/client-sdk.unit.test.ts tests/openapi.integration.test.ts tests/contract.integration.test.ts tests/sdk.integration.test.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "seed": "prisma db seed",
    "smoke": "tsx scripts/smoke-test.ts",
    "openapi:check": "tsx scripts/openapi-check.ts",
    "contract:check": "tsx scripts/contract-check.ts",
    "compatibility:check": "tsx scripts/compatibility-check.ts",
    "sdk:check": "tsx scripts/sdk-check.ts"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.6.0",
    "helmet": "^8.3.0",
    "pg": "^8.22.0",
    "pino": "^10.3.1",
    "prom-client": "^15.1.3",
    "redis": "^6.1.0",
    "yaml": "^2.8.2",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^26.1.1",
    "@types/pg": "^8.20.0",
    "@types/supertest": "^7.2.1",
    "prisma": "^7.8.0",
    "supertest": "^7.2.2",
    "tsx": "^4.23.1",
    "typescript": "^7.0.2"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "engines": {
    "node": ">=26"
  }
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/prisma.config.ts</span>
  </div>

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/contract_governed_notes_api"
  }
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/prisma/migrations/0001_init/migration.sql</span>
  </div>

```txt
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Session" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionTokenHash" TEXT NOT NULL UNIQUE,
  "csrfTokenHash" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Session_userId_idx" ON "Session"("userId");

CREATE TABLE "Notebook" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notebook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Notebook_userId_idx" ON "Notebook"("userId");

CREATE TABLE "Note" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "notebookId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Note_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "Notebook"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Note_notebookId_idx" ON "Note"("notebookId");
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/prisma/schema.prisma</span>
  </div>

```txt
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           String     @id @default(uuid()) @db.Uuid
  email        String     @unique
  passwordHash String
  createdAt    DateTime   @default(now())
  sessions     Session[]
  notebooks    Notebook[]
}

model Session {
  id               String   @id @default(uuid()) @db.Uuid
  sessionTokenHash String   @unique
  csrfTokenHash    String
  userId           String   @db.Uuid
  expiresAt        DateTime
  createdAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Notebook {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  notes     Note[]

  @@index([userId])
}

model Note {
  id         String   @id @default(uuid()) @db.Uuid
  notebookId String   @db.Uuid
  title      String
  body       String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  notebook   Notebook @relation(fields: [notebookId], references: [id], onDelete: Cascade)

  @@index([notebookId])
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/prisma/seed.ts</span>
  </div>

```ts
import { createHash, randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/contract_governed_notes_api";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl })
});

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function main(): Promise<void> {
  const email = "learner@example.test";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hashValue("correct horse battery staple")
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: { id: "11111111-1111-4111-8111-111111111111" },
    update: { title: "Contract examples" },
    create: {
      id: "11111111-1111-4111-8111-111111111111",
      userId: user.id,
      title: "Contract examples"
    }
  });

  await prisma.note.upsert({
    where: { id: "22222222-2222-4222-8222-222222222222" },
    update: { title: "OpenAPI boundary", body: "A public contract is not an ORM model." },
    create: {
      id: "22222222-2222-4222-8222-222222222222",
      notebookId: notebook.id,
      title: "OpenAPI boundary",
      body: "A public contract is not an ORM model."
    }
  });

  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.session.create({
    data: {
      sessionTokenHash: hashValue(randomUUID()),
      csrfTokenHash: hashValue(randomUUID()),
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/scripts/compatibility-check.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import { buildCompatibilityReport } from "../src/contracts/compatibility-report.js";

const report = buildCompatibilityReport();
assert.equal(report.summary.compatible, 2);
assert.equal(report.summary.potentially_compatible, 2);
assert.equal(report.summary.breaking, 7);
console.log("compatibility check passed");
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/scripts/contract-check.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import { runContractReleaseGate } from "../src/contracts/contract-release-gate.js";

const result = await runContractReleaseGate();
assert.deepEqual(result.failures, []);
assert.equal(result.passed, true);
console.log("contract check passed");
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/scripts/openapi-check.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import { loadOpenApiDocument } from "../src/contracts/openapi-loader.js";
import { buildOpenApiInventory } from "../src/contracts/openapi-inventory.js";

const document = await loadOpenApiDocument();
assert.equal(document.openapi, "3.1.1");
assert.ok(document.info?.title);
assert.ok(document.components?.schemas?.ProblemDetails);
assert.ok(document.components?.responses?.ProblemResponse);

const inventory = buildOpenApiInventory(document);
assert.ok(inventory.length >= 23);
for (const operation of inventory) {
  assert.ok(operation.operationId, `${operation.method} ${operation.path} is missing operationId`);
}

console.log(`openapi check passed with ${inventory.length} operations`);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/scripts/sdk-check.ts</span>
  </div>

```ts
import assert from "node:assert/strict";
import { ContractNotesClient } from "../src/client/api-client.js";

const client = new ContractNotesClient({
  baseUrl: "http://localhost:8080",
  fetch: async () =>
    new Response(JSON.stringify({ apiVersion: "v1", openapi: "3.1.1", deprecatedOperations: ["getDeprecatedDemo"] }), {
      status: 200,
      headers: { "content-type": "application/json" }
    })
});

const result = await client.getVersion();
assert.equal(result.ok, true);
if (result.ok) assert.equal(result.data.openapi, "3.1.1");
console.log("sdk check passed");
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/scripts/smoke-test.ts</span>
  </div>

```ts
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function check(path: string): Promise<void> {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
}

await check("/v1/health/live");
await check("/v1/health/ready");
console.log(`smoke passed for ${baseUrl}`);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/scripts/wait-for-ready.ts</span>
  </div>

```ts
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const deadline = Date.now() + 30_000;

while (Date.now() < deadline) {
  const response = await fetch(new URL("/v1/health/ready", baseUrl)).catch(() => undefined);
  if (response?.ok) {
    console.log(`ready at ${baseUrl}`);
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

throw new Error(`ready endpoint timed out for ${baseUrl}`);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/app.ts</span>
  </div>

```ts
import express, { type Express } from "express";
import type { AppConfig } from "./config/env.js";
import { config } from "./config/env.js";
import { createProductionRuntimePolicy } from "./config/production.js";
import { contractsRoutes } from "./modules/contracts/contracts.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { authenticateSession } from "./modules/auth/auth.controller.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notebookNotesRoutes, notesRoutes } from "./modules/notes/notes.routes.js";
import { versioningRoutes } from "./modules/versioning/versioning.routes.js";
import { httpMetrics } from "./observability/http-metrics.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { notFound } from "./shared/middleware/not-found.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";

export function createApp(appConfig: AppConfig = config): Express {
  const runtimePolicy = createProductionRuntimePolicy(appConfig);
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", runtimePolicy.trustProxy);
  app.use(requestId);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(apiRateLimit);
  app.use(express.json({ limit: "1mb" }));
  app.use(httpMetrics);

  app.use("/v1/health", healthRoutes);
  app.use("/v1/metrics", metricsRoutes);
  app.use("/v1/auth", authRoutes);
  app.use("/v1/notebooks/:notebookId/notes", authenticateSession, notebookNotesRoutes);
  app.use("/v1/notebooks", authenticateSession, notebookRoutes);
  app.use("/v1/notes", authenticateSession, notesRoutes);
  app.use("/v1/contracts", contractsRoutes);
  app.use("/v1", versioningRoutes);

  app.use(notFound);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/client/api-client.ts</span>
  </div>

```ts
import type { ApiClientConfig, ApiResult, FetchLike, VersionResponse } from "./api-client.types.js";
import { parseProblemResponse } from "./problem-parser.js";
import { buildRequest, type RequestOptions } from "./request-builder.js";

export class ContractNotesClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly csrfToken: string | undefined;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchImpl = config.fetch ?? fetch;
    this.csrfToken = config.csrfToken;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const request = buildRequest(this.baseUrl, path, {
      ...options,
      csrfToken: options.csrfToken ?? this.csrfToken
    });
    const response = await this.fetchImpl(request.url, request.init);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        problem: await parseProblemResponse(response)
      };
    }

    return {
      ok: true,
      status: response.status,
      data: (await response.json()) as T
    };
  }

  getVersion(): Promise<ApiResult<VersionResponse>> {
    return this.request<VersionResponse>("/v1/version");
  }
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/client/api-client.types.ts</span>
  </div>

```ts
export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code: string;
};

export type ApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

export type ApiFailure = {
  ok: false;
  status: number;
  problem: ProblemDetails;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export type ApiClientConfig = {
  baseUrl: string;
  fetch?: FetchLike;
  csrfToken?: string;
};

export type VersionResponse = {
  apiVersion: string;
  openapi: string;
  deprecatedOperations: string[];
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/client/problem-parser.ts</span>
  </div>

```ts
import type { ProblemDetails } from "./api-client.types.js";

export function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "title" in value &&
    "status" in value &&
    "code" in value
  );
}

export async function parseProblemResponse(response: Response): Promise<ProblemDetails> {
  const parsed = (await response.json().catch(() => undefined)) as unknown;
  if (isProblemDetails(parsed)) return parsed;
  return {
    type: "https://api.example.test/problems/unparseable_problem",
    title: "Unparseable problem",
    status: response.status,
    detail: "The response did not match Problem Details.",
    code: "unparseable_problem"
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/client/request-builder.ts</span>
  </div>

```ts
export type RequestOptions = {
  method?: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  csrfToken?: string;
};

export function buildRequest(baseUrl: string, path: string, options: RequestOptions = {}): { url: URL; init: RequestInit } {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers = new Headers();
  headers.set("accept", "application/json");
  if (options.body !== undefined) headers.set("content-type", "application/json");
  if (options.csrfToken) headers.set("x-csrf-token", options.csrfToken);

  return {
    url,
    init: {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

const booleanFromEnv = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value ?? defaultValue;
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }, z.boolean()).default(defaultValue);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3020),
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/contract_governed_notes_api"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("contract_notes_session"),
  SESSION_SECRET: z.string().min(16).default("local-development-session-secret-32chars"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(604_800),
  CSRF_COOKIE_NAME: z.string().min(1).default("contract_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(1).default(0),
  COOKIE_SECURE: booleanFromEnv(false),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  HTTP_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  HTTP_HEADERS_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  HTTP_KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
  DEPENDENCY_TIMEOUT_MS: z.coerce.number().int().positive().default(500),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(1_000)
});

export type AppConfig = z.infer<typeof envSchema>;
export const config: AppConfig = envSchema.parse(process.env);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/config/production.ts</span>
  </div>

```ts
import type { AppConfig } from "./env.js";

export type ProductionRuntimePolicy = {
  trustProxy: number;
  secureCookies: boolean;
  allowedOrigins: string[];
  requestTimeoutMs: number;
  headersTimeoutMs: number;
  keepAliveTimeoutMs: number;
  shutdownTimeoutMs: number;
};

export function createProductionRuntimePolicy(config: AppConfig): ProductionRuntimePolicy {
  return {
    trustProxy: config.TRUST_PROXY,
    secureCookies: config.COOKIE_SECURE,
    allowedOrigins: config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
    requestTimeoutMs: config.HTTP_REQUEST_TIMEOUT_MS,
    headersTimeoutMs: config.HTTP_HEADERS_TIMEOUT_MS,
    keepAliveTimeoutMs: config.HTTP_KEEP_ALIVE_TIMEOUT_MS,
    shutdownTimeoutMs: config.SHUTDOWN_TIMEOUT_MS
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/compatibility-classifier.ts</span>
  </div>

```ts
export type CompatibilityResult = "compatible" | "potentially_compatible" | "breaking";

export type CompatibilityChangeKind =
  | "additive_field"
  | "optional_field_added"
  | "required_field_added"
  | "field_removed"
  | "field_renamed"
  | "type_changed"
  | "enum_value_added"
  | "enum_value_removed"
  | "status_code_changed"
  | "error_code_changed"
  | "nullable_changed";

export type CompatibilityCase = {
  kind: CompatibilityChangeKind;
  target: string;
  result: CompatibilityResult;
  reason: string;
};

export function classifyCompatibilityChange(kind: CompatibilityChangeKind, target = "response"): CompatibilityCase {
  const resultByKind: Record<CompatibilityChangeKind, CompatibilityResult> = {
    additive_field: "compatible",
    optional_field_added: "compatible",
    required_field_added: "breaking",
    field_removed: "breaking",
    field_renamed: "breaking",
    type_changed: "breaking",
    enum_value_added: "potentially_compatible",
    enum_value_removed: "breaking",
    status_code_changed: "breaking",
    error_code_changed: "breaking",
    nullable_changed: "potentially_compatible"
  };

  const result = resultByKind[kind];
  return {
    kind,
    target,
    result,
    reason: `${kind} is classified as ${result} for ${target}`
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/compatibility-report.ts</span>
  </div>

```ts
import { classifyCompatibilityChange, type CompatibilityCase, type CompatibilityResult } from "./compatibility-classifier.js";
import { recordCompatibilityCheck } from "../observability/contract-metrics.js";

const compatibilityKinds = [
  "additive_field",
  "optional_field_added",
  "required_field_added",
  "field_removed",
  "field_renamed",
  "type_changed",
  "enum_value_added",
  "enum_value_removed",
  "status_code_changed",
  "error_code_changed",
  "nullable_changed"
] as const;

export type CompatibilityReport = {
  cases: CompatibilityCase[];
  summary: Record<CompatibilityResult, number>;
  limitations: string[];
};

export function buildCompatibilityReport(): CompatibilityReport {
  const cases = compatibilityKinds.map((kind) => classifyCompatibilityChange(kind));
  const summary: Record<CompatibilityResult, number> = {
    compatible: 0,
    potentially_compatible: 0,
    breaking: 0
  };

  for (const compatibilityCase of cases) {
    summary[compatibilityCase.result] += 1;
    recordCompatibilityCheck(compatibilityCase.result);
  }

  return {
    cases,
    summary,
    limitations: [
      "The classifier is rule-based and does not prove semantic compatibility.",
      "A release gate still needs reviewed fixtures and consumer feedback."
    ]
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/contract-drift.ts</span>
  </div>

```ts
import { routeInventory, routeKey } from "./route-inventory.js";
import { buildOpenApiInventory } from "./openapi-inventory.js";
import type { OpenApiDocument } from "./openapi-loader.js";

export type ContractDrift = {
  check: string;
  message: string;
};

export function findContractDrift(document: OpenApiDocument): ContractDrift[] {
  const drift: ContractDrift[] = [];
  const openApiInventory = buildOpenApiInventory(document);
  const openApiByRoute = new Map(openApiInventory.map((item) => [`${item.method} ${item.path}`, item]));

  for (const route of routeInventory) {
    const openApiRoute = openApiByRoute.get(routeKey(route));
    if (!openApiRoute) {
      drift.push({ check: "missing_openapi_operation", message: routeKey(route) });
      continue;
    }
    if (openApiRoute.operationId !== route.operationId) {
      drift.push({ check: "operation_id_mismatch", message: `${routeKey(route)} ${openApiRoute.operationId} ${route.operationId}` });
    }
    if (openApiRoute.deprecated !== route.deprecated) {
      drift.push({ check: "deprecated_flag_mismatch", message: route.operationId });
    }
  }

  const seen = new Set<string>();
  for (const item of openApiInventory) {
    if (seen.has(item.operationId)) drift.push({ check: "duplicate_operation_id", message: item.operationId });
    seen.add(item.operationId);
  }

  return drift;
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/contract-release-gate.ts</span>
  </div>

```ts
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { findContractDrift } from "./contract-drift.js";
import { exampleLooksSafe } from "./example-fixtures.js";
import { loadOpenApiDocument } from "./openapi-loader.js";
import { routeInventory } from "./route-inventory.js";
import { recordContractViolation } from "../observability/contract-metrics.js";

export type ReleaseGateResult = {
  passed: boolean;
  failures: string[];
};

export async function runContractReleaseGate(): Promise<ReleaseGateResult> {
  const document = await loadOpenApiDocument();
  const failures: string[] = [];

  if (document.openapi !== "3.1.1") failures.push("openapi_version");
  if (!document.components?.schemas?.ProblemDetails) failures.push("problem_details_schema");
  if (!document.components?.responses?.ProblemResponse) failures.push("problem_response_component");

  const drift = findContractDrift(document);
  failures.push(...drift.map((item) => item.check));

  for (const route of routeInventory) {
    if (!route.path.startsWith("/v1/")) failures.push(`version_path:${route.operationId}`);
  }

  const examplesDir = join(process.cwd(), "openapi", "examples");
  for (const fileName of await readdir(examplesDir)) {
    const content = await readFile(join(examplesDir, fileName), "utf8");
    if (!exampleLooksSafe(fileName, content)) failures.push(`unsafe_example:${fileName}`);
  }

  for (const failure of failures) recordContractViolation(failure);
  return {
    passed: failures.length === 0,
    failures
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/deprecation-policy.ts</span>
  </div>

```ts
export type DeprecationPolicy = {
  operationId: string;
  deprecation: string;
  sunset: string;
  link: string;
};

export const deprecatedDemoPolicy: DeprecationPolicy = {
  operationId: "getDeprecatedDemo",
  deprecation: "true",
  sunset: "Fri, 01 Jan 2027 00:00:00 GMT",
  link: "</v1/version>; rel=\"successor-version\""
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/example-fixtures.ts</span>
  </div>

```ts
const unsafeExamplePattern = /(password|secret|token|cookie|authorization|database_url|redis_url)/i;

export function exampleLooksSafe(name: string, content: string): boolean {
  if (unsafeExamplePattern.test(name)) return false;
  return !unsafeExamplePattern.test(content);
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/openapi-inventory.ts</span>
  </div>

```ts
import type { OpenApiDocument } from "./openapi-loader.js";

export type OpenApiInventoryItem = {
  method: string;
  path: string;
  operationId: string;
  deprecated: boolean;
};

const httpMethods = new Set(["get", "post", "patch", "delete", "put", "head", "options"]);

export function buildOpenApiInventory(document: OpenApiDocument): OpenApiInventoryItem[] {
  const items: OpenApiInventoryItem[] = [];
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!httpMethods.has(method)) continue;
      items.push({
        method: method.toUpperCase(),
        path: path.replaceAll("{notebookId}", ":notebookId").replaceAll("{noteId}", ":noteId"),
        operationId: operation.operationId ?? "",
        deprecated: operation.deprecated === true
      });
    }
  }

  return items;
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/openapi-loader.ts</span>
  </div>

```ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import YAML from "yaml";

export type OpenApiOperation = {
  operationId?: string;
  deprecated?: boolean;
  responses?: Record<string, unknown>;
};

export type OpenApiDocument = {
  openapi?: string;
  info?: { title?: string; version?: string };
  servers?: Array<{ url?: string }>;
  paths?: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, unknown>;
    responses?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
};

export const openApiPath = resolve(process.cwd(), "openapi", "openapi.yaml");

export async function readOpenApiYaml(): Promise<string> {
  return readFile(openApiPath, "utf8");
}

export async function loadOpenApiDocument(): Promise<OpenApiDocument> {
  return YAML.parse(await readOpenApiYaml()) as OpenApiDocument;
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/operation-id.ts</span>
  </div>

```ts
export const operationIds = [
  "getLiveHealth",
  "getReadyHealth",
  "getMetrics",
  "registerUser",
  "loginUser",
  "logoutUser",
  "getCurrentUser",
  "getCsrfToken",
  "listNotebooks",
  "createNotebook",
  "getNotebookById",
  "updateNotebookById",
  "deleteNotebookById",
  "listNotebookNotes",
  "createNotebookNote",
  "getNoteById",
  "updateNoteById",
  "deleteNoteById",
  "getOpenApiYaml",
  "getRouteInventory",
  "getCompatibilityReport",
  "getVersion",
  "getDeprecatedDemo"
] as const;

export type OperationId = (typeof operationIds)[number];

export function isOperationId(value: string): value is OperationId {
  return (operationIds as readonly string[]).includes(value);
}

export function assertUniqueOperationIds(values: readonly string[]): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate operationId: ${value}`);
    seen.add(value);
  }
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/route-inventory.ts</span>
  </div>

```ts
import type { Request } from "express";
import type { OperationId } from "./operation-id.js";

export type RouteInventoryItem = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  operationId: OperationId;
  protected: boolean;
  deprecated: boolean;
};

export const routeInventory: RouteInventoryItem[] = [
  { method: "GET", path: "/v1/health/live", operationId: "getLiveHealth", protected: false, deprecated: false },
  { method: "GET", path: "/v1/health/ready", operationId: "getReadyHealth", protected: false, deprecated: false },
  { method: "GET", path: "/v1/metrics", operationId: "getMetrics", protected: false, deprecated: false },
  { method: "POST", path: "/v1/auth/register", operationId: "registerUser", protected: false, deprecated: false },
  { method: "POST", path: "/v1/auth/login", operationId: "loginUser", protected: false, deprecated: false },
  { method: "POST", path: "/v1/auth/logout", operationId: "logoutUser", protected: true, deprecated: false },
  { method: "GET", path: "/v1/auth/me", operationId: "getCurrentUser", protected: true, deprecated: false },
  { method: "GET", path: "/v1/auth/csrf", operationId: "getCsrfToken", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notebooks", operationId: "listNotebooks", protected: true, deprecated: false },
  { method: "POST", path: "/v1/notebooks", operationId: "createNotebook", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notebooks/:notebookId", operationId: "getNotebookById", protected: true, deprecated: false },
  { method: "PATCH", path: "/v1/notebooks/:notebookId", operationId: "updateNotebookById", protected: true, deprecated: false },
  { method: "DELETE", path: "/v1/notebooks/:notebookId", operationId: "deleteNotebookById", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notebooks/:notebookId/notes", operationId: "listNotebookNotes", protected: true, deprecated: false },
  { method: "POST", path: "/v1/notebooks/:notebookId/notes", operationId: "createNotebookNote", protected: true, deprecated: false },
  { method: "GET", path: "/v1/notes/:noteId", operationId: "getNoteById", protected: true, deprecated: false },
  { method: "PATCH", path: "/v1/notes/:noteId", operationId: "updateNoteById", protected: true, deprecated: false },
  { method: "DELETE", path: "/v1/notes/:noteId", operationId: "deleteNoteById", protected: true, deprecated: false },
  { method: "GET", path: "/v1/contracts/openapi.yaml", operationId: "getOpenApiYaml", protected: false, deprecated: false },
  { method: "GET", path: "/v1/contracts/route-inventory", operationId: "getRouteInventory", protected: false, deprecated: false },
  { method: "GET", path: "/v1/contracts/compatibility-report", operationId: "getCompatibilityReport", protected: false, deprecated: false },
  { method: "GET", path: "/v1/version", operationId: "getVersion", protected: false, deprecated: false },
  { method: "GET", path: "/v1/deprecated-demo", operationId: "getDeprecatedDemo", protected: false, deprecated: true }
];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function scrubPattern(path: string): string {
  const [pathname] = path.split("?");
  return pathname
    .split("/")
    .map((segment) => (uuidPattern.test(segment) ? ":id" : segment))
    .join("/")
    .replace(/\/$/, "") || "/";
}

export function getRoutePattern(request: Request): string {
  const routePath = typeof request.route?.path === "string" ? request.route.path : "";
  const pattern = `${request.baseUrl}${routePath}`.replace(/\/$/, "");
  return pattern || scrubPattern(request.path);
}

export function routeKey(route: Pick<RouteInventoryItem, "method" | "path">): string {
  return `${route.method.toUpperCase()} ${route.path}`;
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/contracts/version-policy.ts</span>
  </div>

```ts
export const supportedApiVersions = ["v1"] as const;
export type SupportedApiVersion = (typeof supportedApiVersions)[number];

export function extractVersionFamily(path: string): string | null {
  const [, version] = path.match(/^\/(v\d+)(?:\/|$)/) ?? [];
  return version ?? null;
}

export function isSupportedApiVersion(version: string): version is SupportedApiVersion {
  return (supportedApiVersions as readonly string[]).includes(version);
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/db/db-health.ts</span>
  </div>

```ts
import { prisma } from "./prisma.js";

export async function checkDatabaseHealth(): Promise<boolean> {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/db/prisma.ts</span>
  </div>

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/env.js";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL
});

export const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"]
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/health/health.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { liveHealth, readyHealth } from "./health.service.js";

export const healthRoutes = Router();

healthRoutes.get("/live", (_request, response) => {
  response.status(200).json(liveHealth());
});

healthRoutes.get("/ready", async (_request, response) => {
  const body = await readyHealth();
  response.status(body.status === "ready" ? 200 : 503).json(body);
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/health/health.service.ts</span>
  </div>

```ts
import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";

export function liveHealth() {
  return {
    status: "ok",
    service: "contract-governed-notes-api"
  };
}

export async function readyHealth() {
  const [database, redis] = await Promise.allSettled([checkDatabaseHealth(), checkRedisHealth()]);
  const checks = {
    database: database.status === "fulfilled" && database.value,
    redis: redis.status === "fulfilled" && redis.value
  };

  return {
    status: checks.database && checks.redis ? "ready" : "not_ready",
    checks
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/auth/auth.controller.ts</span>
  </div>

```ts
import { createHash, randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { sendJson, sendNoContent } from "../../shared/responses/send-response.js";
import type { AuthenticatedRequest } from "./auth.schema.js";

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseCookies(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const item of header?.split(";") ?? []) {
    const [rawName, ...rawValue] = item.trim().split("=");
    if (!rawName || rawValue.length === 0) continue;
    cookies.set(rawName, decodeURIComponent(rawValue.join("=")));
  }
  return cookies;
}

function setSessionCookies(response: import("express").Response, sessionToken: string, csrfToken: string): void {
  const common = {
    sameSite: "lax" as const,
    secure: config.COOKIE_SECURE,
    maxAge: config.SESSION_TTL_SECONDS * 1000
  };
  response.cookie(config.SESSION_COOKIE_NAME, sessionToken, { ...common, httpOnly: true });
  response.cookie(config.CSRF_COOKIE_NAME, csrfToken, { ...common, httpOnly: false });
}

export const register: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body as { email: string; password: string };
    const user = await prisma.user.create({
      data: { email, passwordHash: hashValue(password) },
      select: { id: true, email: true, createdAt: true }
    });
    sendJson(response, 201, { user });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordHash !== hashValue(password)) {
      throw new HttpError(401, "invalid_credentials", "Invalid email or password");
    }

    const sessionToken = randomUUID();
    const csrfToken = randomUUID();
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionTokenHash: hashValue(sessionToken),
        csrfTokenHash: hashValue(csrfToken),
        expiresAt: new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000)
      }
    });

    setSessionCookies(response, sessionToken, csrfToken);
    sendJson(response, 200, { user: { id: user.id, email: user.email }, sessionId: session.id, csrfToken });
  } catch (error) {
    next(error);
  }
};

export const authenticateSession: RequestHandler = async (request: AuthenticatedRequest, _response, next) => {
  try {
    const cookies = parseCookies(request.header("cookie"));
    const token = cookies.get(config.SESSION_COOKIE_NAME);
    if (!token) throw new HttpError(401, "missing_session", "Session cookie is required");

    const session = await prisma.session.findUnique({
      where: { sessionTokenHash: hashValue(token) },
      include: { user: true }
    });
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(401, "invalid_session", "Session is invalid or expired");
    }

    request.auth = {
      userId: session.userId,
      email: session.user.email,
      sessionId: session.id,
      csrfTokenHash: session.csrfTokenHash
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCsrfToken: RequestHandler = (request: AuthenticatedRequest, _response, next) => {
  const header = request.header("x-csrf-token");
  if (!header || hashValue(header) !== request.auth?.csrfTokenHash) {
    next(new HttpError(403, "csrf_required", "A valid CSRF token is required"));
    return;
  }
  next();
};

export const logout: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    if (request.auth) await prisma.session.deleteMany({ where: { id: request.auth.sessionId } });
    response.clearCookie(config.SESSION_COOKIE_NAME);
    response.clearCookie(config.CSRF_COOKIE_NAME);
    sendNoContent(response);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser: RequestHandler = (request: AuthenticatedRequest, response) => {
  sendJson(response, 200, { user: { id: request.auth?.userId, email: request.auth?.email } });
};

export const getCsrfToken: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const csrfToken = randomUUID();
    await prisma.session.update({
      where: { id: request.auth?.sessionId },
      data: { csrfTokenHash: hashValue(csrfToken) }
    });
    response.cookie(config.CSRF_COOKIE_NAME, csrfToken, {
      sameSite: "lax",
      secure: config.COOKIE_SECURE,
      httpOnly: false,
      maxAge: config.SESSION_TTL_SECONDS * 1000
    });
    sendJson(response, 200, { csrfToken });
  } catch (error) {
    next(error);
  }
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/auth/auth.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { authenticateSession, getCsrfToken, getCurrentUser, login, logout, register, requireCsrfToken } from "./auth.controller.js";
import { authBodySchema } from "./auth.schema.js";
import { validateRequest } from "../../shared/validation/validate-request.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: authBodySchema }), register);
authRoutes.post("/login", validateRequest({ body: authBodySchema }), login);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, logout);
authRoutes.get("/me", authenticateSession, getCurrentUser);
authRoutes.get("/csrf", authenticateSession, getCsrfToken);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/auth/auth.schema.ts</span>
  </div>

```ts
import type { Request } from "express";
import { z } from "zod";

export const authBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export const csrfHeaderSchema = z.object({
  "x-csrf-token": z.string().min(16)
});

export type AuthContext = {
  userId: string;
  email: string;
  sessionId: string;
  csrfTokenHash: string;
};

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/contracts/contracts.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { buildCompatibilityReport } from "../../contracts/compatibility-report.js";
import { readOpenApiYaml } from "../../contracts/openapi-loader.js";
import { routeInventory } from "../../contracts/route-inventory.js";
import { sendJson } from "../../shared/responses/send-response.js";

export const getOpenApiYaml: RequestHandler = async (_request, response, next) => {
  try {
    response.type("application/yaml").send(await readOpenApiYaml());
  } catch (error) {
    next(error);
  }
};

export const getRouteInventory: RequestHandler = (_request, response) => {
  sendJson(response, 200, { items: routeInventory });
};

export const getCompatibilityReport: RequestHandler = (_request, response) => {
  sendJson(response, 200, buildCompatibilityReport());
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/contracts/contracts.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { getCompatibilityReport, getOpenApiYaml, getRouteInventory } from "./contracts.controller.js";

export const contractsRoutes = Router();

contractsRoutes.get("/openapi.yaml", getOpenApiYaml);
contractsRoutes.get("/route-inventory", getRouteInventory);
contractsRoutes.get("/compatibility-report", getCompatibilityReport);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/notebooks/notebooks.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { sendJson, sendNoContent } from "../../shared/responses/send-response.js";
import type { AuthenticatedRequest } from "../auth/auth.schema.js";

function requireUserId(request: AuthenticatedRequest): string {
  if (!request.auth?.userId) throw new HttpError(401, "missing_session", "Session is required");
  return request.auth.userId;
}

function paramValue(request: AuthenticatedRequest, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string") throw new HttpError(400, "invalid_path_param", `${name} must be a string`);
  return value;
}

export const list: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      where: { userId: requireUserId(request) },
      orderBy: { updatedAt: "desc" }
    });
    sendJson(response, 200, { items: notebooks, nextCursor: null, limit: notebooks.length });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebook = await prisma.notebook.create({
      data: { userId: requireUserId(request), title: (request.body as { title: string }).title }
    });
    sendJson(response, 201, notebook);
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    const notebook = await prisma.notebook.findFirst({
      where: { id: notebookId, userId: requireUserId(request) }
    });
    if (!notebook) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
    sendJson(response, 200, notebook);
  } catch (error) {
    next(error);
  }
};

export const updateById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    const existing = await prisma.notebook.findFirst({
      where: { id: notebookId, userId: requireUserId(request) }
    });
    if (!existing) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
    const notebook = await prisma.notebook.update({
      where: { id: existing.id },
      data: request.body as { title?: string }
    });
    sendJson(response, 200, notebook);
  } catch (error) {
    next(error);
  }
};

export const removeById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    const existing = await prisma.notebook.findFirst({
      where: { id: notebookId, userId: requireUserId(request) }
    });
    if (!existing) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
    await prisma.notebook.delete({ where: { id: existing.id } });
    sendNoContent(response);
  } catch (error) {
    next(error);
  }
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/notebooks/notebooks.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../auth/auth.controller.js";
import { create, getById, list, removeById, updateById } from "./notebooks.controller.js";
import { createNotebookBodySchema, notebookParamsSchema, updateNotebookBodySchema } from "./notebooks.schema.js";
import { validateRequest } from "../../shared/validation/validate-request.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookBodySchema }), create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), getById);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookBodySchema }), updateById);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), removeById);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/notebooks/notebooks.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNotebookBodySchema = z.object({
  title: z.string().min(1).max(120)
});

export const updateNotebookBodySchema = createNotebookBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/notes/notes.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { sendJson, sendNoContent } from "../../shared/responses/send-response.js";
import type { AuthenticatedRequest } from "../auth/auth.schema.js";

function requireUserId(request: AuthenticatedRequest): string {
  if (!request.auth?.userId) throw new HttpError(401, "missing_session", "Session is required");
  return request.auth.userId;
}

function paramValue(request: AuthenticatedRequest, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string") throw new HttpError(400, "invalid_path_param", `${name} must be a string`);
  return value;
}

async function assertNotebookOwner(notebookId: string, userId: string): Promise<void> {
  const notebook = await prisma.notebook.findFirst({ where: { id: notebookId, userId } });
  if (!notebook) throw new HttpError(404, "notebook_not_found", "Notebook was not found");
}

export const listForNotebook: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    await assertNotebookOwner(notebookId, requireUserId(request));
    const query = request.query as unknown as { limit: number; cursor?: string; sort: "createdAt" | "updatedAt" };
    const notes = await prisma.note.findMany({
      where: { notebookId },
      orderBy: { [query.sort]: "desc" },
      take: query.limit
    });
    sendJson(response, 200, { items: notes, nextCursor: null, limit: query.limit });
  } catch (error) {
    next(error);
  }
};

export const createForNotebook: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const notebookId = paramValue(request, "notebookId");
    await assertNotebookOwner(notebookId, requireUserId(request));
    const body = request.body as { title: string; body: string };
    const note = await prisma.note.create({
      data: { notebookId, title: body.title, body: body.body }
    });
    sendJson(response, 201, note);
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const noteId = paramValue(request, "noteId");
    const note = await prisma.note.findFirst({
      where: { id: noteId, notebook: { userId: requireUserId(request) } }
    });
    if (!note) throw new HttpError(404, "note_not_found", "Note was not found");
    sendJson(response, 200, note);
  } catch (error) {
    next(error);
  }
};

export const updateById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const noteId = paramValue(request, "noteId");
    const existing = await prisma.note.findFirst({
      where: { id: noteId, notebook: { userId: requireUserId(request) } }
    });
    if (!existing) throw new HttpError(404, "note_not_found", "Note was not found");
    const note = await prisma.note.update({
      where: { id: existing.id },
      data: request.body as { title?: string; body?: string }
    });
    sendJson(response, 200, note);
  } catch (error) {
    next(error);
  }
};

export const removeById: RequestHandler = async (request: AuthenticatedRequest, response, next) => {
  try {
    const noteId = paramValue(request, "noteId");
    const existing = await prisma.note.findFirst({
      where: { id: noteId, notebook: { userId: requireUserId(request) } }
    });
    if (!existing) throw new HttpError(404, "note_not_found", "Note was not found");
    await prisma.note.delete({ where: { id: existing.id } });
    sendNoContent(response);
  } catch (error) {
    next(error);
  }
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/notes/notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../auth/auth.controller.js";
import { createForNotebook, getById, listForNotebook, removeById, updateById } from "./notes.controller.js";
import { createNoteBodySchema, notebookNoteParamsSchema, noteParamsSchema, noteQuerySchema, updateNoteBodySchema } from "./notes.schema.js";
import { validateRequest } from "../../shared/validation/validate-request.js";

export const notebookNotesRoutes = Router({ mergeParams: true });
export const notesRoutes = Router();

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema, query: noteQuerySchema }), listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteBodySchema }), createForNotebook);

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), getById);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteBodySchema }), updateById);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), removeById);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/notes/notes.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const noteQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  sort: z.enum(["createdAt", "updatedAt"]).default("updatedAt")
});

export const createNoteBodySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default("")
});

export const updateNoteBodySchema = createNoteBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/versioning/versioning.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { deprecatedDemoPolicy } from "../../contracts/deprecation-policy.js";
import { recordDeprecatedUsage } from "../../observability/contract-metrics.js";
import { sendJson } from "../../shared/responses/send-response.js";

export const getVersion: RequestHandler = (_request, response) => {
  sendJson(response, 200, {
    apiVersion: "v1",
    openapi: "3.1.1",
    deprecatedOperations: [deprecatedDemoPolicy.operationId]
  });
};

export const getDeprecatedDemo: RequestHandler = (_request, response) => {
  recordDeprecatedUsage(deprecatedDemoPolicy.operationId);
  response.setHeader("Deprecation", deprecatedDemoPolicy.deprecation);
  response.setHeader("Sunset", deprecatedDemoPolicy.sunset);
  response.setHeader("Link", deprecatedDemoPolicy.link);
  sendJson(response, 200, {
    message: "This endpoint is deprecated.",
    replacement: "/v1/version"
  });
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/modules/versioning/versioning.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { getDeprecatedDemo, getVersion } from "./versioning.controller.js";

export const versioningRoutes = Router();

versioningRoutes.get("/version", getVersion);
versioningRoutes.get("/deprecated-demo", getDeprecatedDemo);
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/observability/contract-metrics.ts</span>
  </div>

```ts
import {
  compatibilityCheckCounter,
  contractViolationCounter,
  deprecatedUsageCounter,
  problemResponseCounter,
  sdkParseFailureCounter,
  unsupportedVersionCounter
} from "./metrics.js";

export function recordContractViolation(checkName: string): void {
  contractViolationCounter.inc({ check_name: checkName });
}

export function recordUnsupportedVersion(versionFamily: string): void {
  unsupportedVersionCounter.inc({ version_family: versionFamily });
}

export function recordDeprecatedUsage(operationId: string): void {
  deprecatedUsageCounter.inc({ operation_id: operationId });
}

export function recordProblemResponse(code: string, statusCode: number): void {
  problemResponseCounter.inc({ code, status_class: `${Math.floor(statusCode / 100)}xx` });
}

export function recordCompatibilityCheck(result: string): void {
  compatibilityCheckCounter.inc({ result });
}

export function recordSdkParseFailure(operationId: string): void {
  sdkParseFailureCounter.inc({ operation_id: operationId });
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/observability/http-metrics.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { getRoutePattern } from "../contracts/route-inventory.js";
import { httpRequestCounter } from "./metrics.js";

function statusClass(statusCode: number): string {
  return `${Math.floor(statusCode / 100)}xx`;
}

export function recordHttpRequest(method: string, route: string, statusCode: number): void {
  httpRequestCounter.inc({
    method: method.toUpperCase(),
    route,
    status_class: statusClass(statusCode)
  });
}

export const httpMetrics: RequestHandler = (request, response, next) => {
  response.on("finish", () => {
    recordHttpRequest(request.method, getRoutePattern(request), response.statusCode);
  });
  next();
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/observability/logger.ts</span>
  </div>

```ts
import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: ["req.headers.cookie", "req.headers.authorization", "password", "token", "session"]
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/observability/metrics.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response) => {
  response.type(metricsRegistry.contentType);
  response.send(await metricsRegistry.metrics());
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/observability/metrics.ts</span>
  </div>

```ts
import { collectDefaultMetrics, Counter, Registry } from "prom-client";

export const metricsRegistry = new Registry();
metricsRegistry.setDefaultLabels({ app: "contract_governed_notes_api" });
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "HTTP requests by method, route pattern, and status class",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const contractViolationCounter = new Counter({
  name: "api_contract_violations_total",
  help: "Contract violations by check name",
  labelNames: ["check_name"] as const,
  registers: [metricsRegistry]
});

export const unsupportedVersionCounter = new Counter({
  name: "api_unsupported_versions_total",
  help: "Unsupported API versions by version family",
  labelNames: ["version_family"] as const,
  registers: [metricsRegistry]
});

export const deprecatedUsageCounter = new Counter({
  name: "api_deprecated_endpoint_usage_total",
  help: "Deprecated endpoint usage by operationId",
  labelNames: ["operation_id"] as const,
  registers: [metricsRegistry]
});

export const problemResponseCounter = new Counter({
  name: "api_problem_responses_total",
  help: "Problem responses by code and status class",
  labelNames: ["code", "status_class"] as const,
  registers: [metricsRegistry]
});

export const compatibilityCheckCounter = new Counter({
  name: "api_compatibility_checks_total",
  help: "Compatibility checks by result",
  labelNames: ["result"] as const,
  registers: [metricsRegistry]
});

export const sdkParseFailureCounter = new Counter({
  name: "api_sdk_parse_failures_total",
  help: "SDK parse failures by operationId",
  labelNames: ["operation_id"] as const,
  registers: [metricsRegistry]
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/redis/redis-client.ts</span>
  </div>

```ts
import { createClient, type RedisClientType } from "redis";
import { config } from "../config/env.js";

let client: RedisClientType | undefined;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: config.REDIS_URL,
      socket: {
        connectTimeout: config.REDIS_CONNECT_TIMEOUT_MS
      }
    });
    client.on("error", () => undefined);
  }

  if (!client.isOpen) await client.connect();
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client?.isOpen) await client.quit();
  client = undefined;
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/redis/redis-health.ts</span>
  </div>

```ts
import { getRedisClient } from "./redis-client.js";

export async function checkRedisHealth(): Promise<boolean> {
  const client = await getRedisClient();
  const result = await client.ping();
  return result === "PONG";
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/server.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import { app } from "./app.js";
import { config } from "./config/env.js";
import { createProductionRuntimePolicy } from "./config/production.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedis } from "./redis/redis-client.js";
import { logger } from "./observability/logger.js";

const policy = createProductionRuntimePolicy(config);
const server = createServer(app);

server.requestTimeout = policy.requestTimeoutMs;
server.headersTimeout = policy.headersTimeoutMs;
server.keepAliveTimeout = policy.keepAliveTimeoutMs;

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "api listening");
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "shutdown started");
  const forceTimer = setTimeout(() => {
    logger.error("shutdown timeout exceeded");
    process.exit(1);
  }, policy.shutdownTimeoutMs);
  forceTimer.unref();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
  await Promise.allSettled([disconnectPrisma(), closeRedis()]);
  clearTimeout(forceTimer);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    shutdown(signal).catch((error: unknown) => {
      logger.error({ error }, "shutdown failed");
      process.exitCode = 1;
    });
  });
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/errors/error-middleware.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { recordProblemResponse } from "../../observability/contract-metrics.js";
import { createProblemDetails } from "./problem-details.js";

export const errorMiddleware: ErrorRequestHandler = (error, request, response, _next) => {
  const problem = createProblemDetails(error, request);
  recordProblemResponse(problem.code, problem.status);
  response.status(problem.status).type("application/problem+json").json(problem);
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/errors/http-error.ts</span>
  </div>

```ts
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/errors/problem-details.ts</span>
  </div>

```ts
import type { Request } from "express";
import { HttpError } from "./http-error.js";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
};

const titlesByStatus = new Map<number, string>([
  [400, "Bad Request"],
  [401, "Unauthorized"],
  [403, "Forbidden"],
  [404, "Not Found"],
  [409, "Conflict"],
  [500, "Internal Server Error"]
]);

export function createProblemDetails(error: unknown, request: Request): ProblemDetails {
  const status = error instanceof HttpError ? error.status : 500;
  const code = error instanceof HttpError ? error.code : "internal_error";
  const detail = error instanceof Error ? error.message : "Unexpected error";

  return {
    type: `https://api.example.test/problems/${code}`,
    title: titlesByStatus.get(status) ?? "Error",
    status,
    detail,
    instance: request.path,
    code
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/middleware/cors.ts</span>
  </div>

```ts
import cors from "cors";
import { config } from "../../config/env.js";

const allowedOrigins = new Set(config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean));

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/middleware/not-found.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "not_found", `No route matches ${request.method} ${request.path}`));
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/middleware/rate-limit.ts</span>
  </div>

```ts
import rateLimit from "express-rate-limit";

export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/middleware/request-id.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (request, response, next) => {
  const value = request.header("x-request-id") ?? randomUUID();
  response.setHeader("x-request-id", value);
  next();
};
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/middleware/security-headers.ts</span>
  </div>

```ts
import helmet from "helmet";

export const securityHeaders = helmet({
  contentSecurityPolicy: false
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/responses/send-response.ts</span>
  </div>

```ts
import type { Response } from "express";

export function sendJson<T>(response: Response, status: number, body: T): void {
  response.status(status).json(body);
}

export function sendNoContent(response: Response): void {
  response.status(204).end();
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/validation/schema-registry.ts</span>
  </div>

```ts
export const publicSchemaNames = [
  "ProblemDetails",
  "User",
  "Notebook",
  "Note",
  "NotebookList",
  "NoteList",
  "CompatibilityReport"
] as const;

export function hasPublicSchema(name: string): boolean {
  return (publicSchemaNames as readonly string[]).includes(name);
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/src/shared/validation/validate-request.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ZodError } from "zod";
import { HttpError } from "../errors/http-error.js";

export type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
  headers?: ZodType;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    try {
      if (schemas.body) request.body = schemas.body.parse(request.body);
  if (schemas.params) Object.assign(request.params, schemas.params.parse(request.params) as Record<string, string>);
      if (schemas.query) request.query = schemas.query.parse(request.query) as typeof request.query;
      if (schemas.headers) schemas.headers.parse(request.headers);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new HttpError(400, "validation_failed", error.issues.map((issue) => issue.message).join("; ")));
        return;
      }
      next(error);
    }
  };
}
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/client-sdk.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { ContractNotesClient } from "../src/client/api-client.js";

test("typed client parses success result", async () => {
  const client = new ContractNotesClient({
    baseUrl: "http://localhost:8080",
    fetch: async () => new Response(JSON.stringify({ apiVersion: "v1", openapi: "3.1.1", deprecatedOperations: [] }), { status: 200 })
  });

  const result = await client.getVersion();
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.apiVersion, "v1");
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/compatibility-classifier.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { classifyCompatibilityChange } from "../src/contracts/compatibility-classifier.js";

test("compatibility classifier handles representative cases", () => {
  assert.equal(classifyCompatibilityChange("additive_field").result, "compatible");
  assert.equal(classifyCompatibilityChange("enum_value_added").result, "potentially_compatible");
  assert.equal(classifyCompatibilityChange("field_removed").result, "breaking");
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/contract-drift.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { findContractDrift } from "../src/contracts/contract-drift.js";
import { loadOpenApiDocument } from "../src/contracts/openapi-loader.js";

test("route inventory matches openapi operations", async () => {
  const drift = findContractDrift(await loadOpenApiDocument());
  assert.deepEqual(drift, []);
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/contract.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { runContractReleaseGate } from "../src/contracts/contract-release-gate.js";

test("contract release gate has no local drift", async () => {
  const result = await runContractReleaseGate();
  assert.equal(result.passed, true);
  assert.deepEqual(result.failures, []);
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/deprecation-policy.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { deprecatedDemoPolicy } from "../src/contracts/deprecation-policy.js";

test("deprecated operation has deprecation and sunset evidence", () => {
  assert.equal(deprecatedDemoPolicy.operationId, "getDeprecatedDemo");
  assert.equal(deprecatedDemoPolicy.deprecation, "true");
  assert.match(deprecatedDemoPolicy.sunset, /GMT$/);
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/env.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { envSchema } from "../src/config/env.js";

test("env schema supplies runtime defaults", () => {
  const parsed = envSchema.parse({});
  assert.equal(parsed.PORT, 3020);
  assert.equal(parsed.ALLOWED_ORIGINS.includes("localhost:8080"), true);
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/openapi.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildOpenApiInventory } from "../src/contracts/openapi-inventory.js";
import { loadOpenApiDocument } from "../src/contracts/openapi-loader.js";

test("openapi file exposes required governance objects", async () => {
  const document = await loadOpenApiDocument();
  const inventory = buildOpenApiInventory(document);
  assert.equal(document.openapi, "3.1.1");
  assert.ok(document.components?.schemas?.ProblemDetails);
  assert.ok(inventory.some((operation) => operation.operationId === "getDeprecatedDemo" && operation.deprecated));
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/operation-id.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { assertUniqueOperationIds, isOperationId, operationIds } from "../src/contracts/operation-id.js";

test("operation ids are unique and typed", () => {
  assert.doesNotThrow(() => assertUniqueOperationIds(operationIds));
  assert.equal(isOperationId("getVersion"), true);
  assert.equal(isOperationId("unknownOperation"), false);
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/problem-details.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { createProblemDetails } from "../src/shared/errors/problem-details.js";
import { HttpError } from "../src/shared/errors/http-error.js";

test("problem details uses query-stripped request path", () => {
  const request = { path: "/v1/notebooks" } as Parameters<typeof createProblemDetails>[1];
  const problem = createProblemDetails(new HttpError(400, "validation_failed", "Invalid field"), request);
  assert.equal(problem.status, 400);
  assert.equal(problem.code, "validation_failed");
  assert.equal(problem.instance, "/v1/notebooks");
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/sdk.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { ContractNotesClient } from "../src/client/api-client.js";

test("typed client parses problem result without throwing", async () => {
  const client = new ContractNotesClient({
    baseUrl: "http://localhost:8080",
    fetch: async () =>
      new Response(JSON.stringify({
        type: "https://api.example.test/problems/not_found",
        title: "Not Found",
        status: 404,
        detail: "Missing resource",
        code: "not_found"
      }), { status: 404, headers: { "content-type": "application/problem+json" } })
  });

  const result = await client.getVersion();
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.problem.code, "not_found");
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tests/version-policy.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { extractVersionFamily, isSupportedApiVersion } from "../src/contracts/version-policy.js";

test("path version is extracted and checked", () => {
  assert.equal(extractVersionFamily("/v1/notebooks"), "v1");
  assert.equal(isSupportedApiVersion("v1"), true);
  assert.equal(isSupportedApiVersion("v2"), false);
});
```
</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/contract-governed-notes-api/tsconfig.json</span>
  </div>

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "rootDir": ".",
    "outDir": "dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src", "scripts", "tests", "prisma.config.ts", "prisma"],
  "exclude": ["node_modules", "dist"]
}
```
</div>


### 14.4 运行与验证

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm run smoke
npm run openapi:check
npm run contract:check
npm run compatibility:check
npm run sdk:check
docker compose down
```
</div>


预期行为：NGINX 8080 入口能访问 `/v1/health/live` 和 `/v1/health/ready`；OpenAPI endpoint 返回 YAML；contract check 报告无 drift；compatibility check 输出分类统计；SDK check 证明 success/problem 两条路径都能被类型化结果表示。

## 15. 知识迁移与真实项目场景

真实项目中，API contract governance 会出现在移动端发版、第三方集成、内部服务调用、灰度发布、SDK 更新和长期兼容策略里。你需要先判断变更影响的是请求输入、响应输出、错误模型、版本入口、弃用策略还是观测标签，再决定是 patch、minor、major、deprecation window 还是 release block。

## 16. 本章复盘任务

- 任选一个 endpoint，从 route inventory 追踪到 OpenAPI operation、Zod schema、controller 响应和测试证据。
- 解释为什么 TypeScript type 不能替代 Zod runtime validation。
- 把一个字段删除变更分类为 breaking，并说明客户端为什么会失败。
- 检查 SDK 是否导入服务端-only 模块。
- 设计一个 deprecated endpoint 的迁移说明，包含 OpenAPI flag、Deprecation header、Sunset header 和 Link header。

## 17. 最终心智模型

把 API contract 想成跨进程承诺的证据链：`HTTP request -> Express route -> runtime validator -> OpenAPI operation -> response schema -> Problem Details -> version policy -> compatibility classifier -> contract tests -> typed client -> governance metrics`。任何节点改变，都要判断它是内部实现变化还是公共契约变化。

## 18. 官方资料

- OpenAPI Specification 3.2.0：`https://spec.openapis.org/oas/v3.2.0.html`。
- OpenAPI Specification 3.1.1：`https://spec.openapis.org/oas/v3.1.1.html`。
- RFC 9457 Problem Details for HTTP APIs：`https://www.rfc-editor.org/rfc/rfc9457.html`。
- RFC 9745 The Deprecation HTTP Header Field：`https://datatracker.ietf.org/doc/html/rfc9745`。
- RFC 8594 The Sunset HTTP Header Field：`https://www.rfc-editor.org/info/rfc8594/`。
- RFC 9110 HTTP Semantics：`https://httpwg.org/specs/rfc9110.html`。
- Express 5 error handling：`https://expressjs.com/en/5x/guide/error-handling/`。
- Node.js test runner：`https://nodejs.org/api/test.html`。
- TypeScript narrowing：`https://www.typescriptlang.org/docs/handbook/2/narrowing.html`。
- Docker Compose startup order：`https://docs.docker.com/compose/how-tos/startup-order/`。
- NGINX official documentation：`https://nginx.org/`。

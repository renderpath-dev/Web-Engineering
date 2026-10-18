# Node.js 第 15 章：模块化单体、服务边界、Worker Service、任务队列、后台任务、缓存一致性与多服务运行边界

<style>
.macos-code-window {
  overflow: hidden;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #0d1117;
  margin: 16px 0;
}

.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.macos-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  flex: 0 0 auto;
}

.macos-code-dot-red {
  background: #ff5f57;
}

.macos-code-dot-yellow {
  background: #ffbd2e;
}

.macos-code-dot-green {
  background: #28c840;
}

.macos-code-title {
  margin-left: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  color: #c9d1d9;
}

.macos-code-titlebar + pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background: transparent;
  border-radius: 0 0 12px 12px;
}

.macos-code-titlebar + pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
}
</style>

> 适用版本：Node.js v26.3.0；npm 11.16.0；TypeScript 7.0.2；Express 5.2.1；Prisma 7.9.1；BullMQ 6.0.0；Redis 6.1.0 client；PostgreSQL 18；Docker Compose 本地生产模拟。
>
> 本章英文身份：Node.js Chapter 15: Modular Monolith, Service Boundaries, Worker Services, Queues, Background Jobs, Cache Consistency, and Multi-Service Runtime Boundaries。
>
> 本章属于 Phase 9：高级后端架构、消息系统与平台化部署基础。它承接 Chapter 14 的 API contract governance，但不重新教学 OpenAPI；本章把 contract 思维迁移到 worker service、queue payload、idempotency、cache consistency 和 Compose runtime。

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
  - [9.1 Modular monolith 不是“低级架构”](#section-9-1)
  - [9.2 Service boundary：business、data、runtime、deployment、team、trust](#section-9-2)
  - [9.3 Monolith to worker：什么时候拆 worker，什么时候不要拆](#section-9-3)
  - [9.4 HTTP request 与 background job 的边界](#section-9-4)
  - [9.5 Queue mental model：producer、queue、job、worker、processor](#section-9-5)
  - [9.6 BullMQ and Redis：Queue、Worker、attempts、backoff、stalled job](#section-9-6)
  - [9.7 Job payload contract：name、version、schema、idempotencyKey、correlationId](#section-9-7)
  - [9.8 Job state machine：queued、active、completed、failed、retrying、stalled](#section-9-8)
  - [9.9 Idempotent job handler：duplicate delivery、retry、unique constraint](#section-9-9)
  - [9.10 Retry、backoff、poison job 与 dead-letter boundary](#section-9-10)
  - [9.11 Timeout and cancellation：API timeout、job timeout、dependency timeout](#section-9-11)
  - [9.12 Transaction boundary：DB write、queue enqueue、outbox concept](#section-9-12)
  - [9.13 Cache consistency：cache-aside、TTL、invalidation、stale data](#section-9-13)
  - [9.14 Redis as queue vs Redis as cache：same infrastructure, different ownership](#section-9-14)
  - [9.15 API service runtime：enqueue job、return job id、query job status](#section-9-15)
  - [9.16 Worker service runtime：process job、update result、invalidate cache](#section-9-16)
  - [9.17 Multi-service Docker Compose：api、worker、postgres、redis、nginx](#section-9-17)
  - [9.18 Health and readiness：API readiness、worker readiness、dependency checks](#section-9-18)
  - [9.19 Observability：job metrics、queue depth、cache hit/miss、correlation id](#section-9-19)
  - [9.20 Contract continuity：OpenAPI for HTTP, job contract for queue](#section-9-20)
  - [9.21 Migration plan：modular monolith 到 worker service](#section-9-21)
  - [9.22 Chapter integration: distributed-task-platform-lab](#section-9-22)
- [10. API 与规则索引](#10-api-与规则索引)
- [11. 常见错误对照表](#11-常见错误对照表)
- [12. 调试与验证方法](#12-调试与验证方法)
- [13. 分项练习说明](#13-分项练习说明)
- [14. 最终迷你项目](#14-最终迷你项目)
  - [14.1 项目目标](#141-项目目标)
  - [14.2 项目结构与职责](#142-项目结构与职责)
  - [14.3 完整项目代码](#143-完整项目代码)
  - [14.4 运行与测试](#144-运行与测试)
  - [14.5 执行与生命周期](#145-执行与生命周期)
  - [14.6 常见错误](#146-常见错误)
- [15. 知识迁移与真实项目场景](#15-知识迁移与真实项目场景)
- [16. 本章复盘任务](#16-本章复盘任务)
- [17. 最终心智模型](#17-最终心智模型)
- [18. 官方资料](#18-官方资料)

## 本章代码定位索引

| 学习目标 | 文件或片段 | 可观察证据 |
| --- | --- | --- |
| 判断 modular monolith 是否仍然清晰 | `practices/15-architecture-messaging-platform/01-service-boundary/modular-monolith-boundary.ts` | 模块名、owned data、public use cases 和 forbidden imports 能被函数直接检查 |
| 定义 queue payload contract | `practices/15-architecture-messaging-platform/02-job-contract/job-payload-schema.ts` | `name`、`version`、`idempotencyKey`、`correlationId` 和 `tasks` 是固定字段 |
| 观察 worker 与 cache 的边界 | `mini-projects/distributed-task-platform-lab/src/worker/processor.ts` | worker 完成 DB 写入后调用 cache invalidation |
| 验证 Compose 多服务入口 | `mini-projects/distributed-task-platform-lab/compose.yaml` | `api`、`worker`、`postgres`、`redis`、`nginx` 以及 `service_healthy` 可被 `docker compose config` 展开 |
| 验证 NGINX 公共入口 | `mini-projects/distributed-task-platform-lab/nginx/nginx.conf` | `proxy_pass` 指向内部 `api:3030`，宿主入口由 Compose 暴露到 `http://localhost:8080` |
| 验证 job/cache/idempotency | `mini-projects/distributed-task-platform-lab/scripts/consistency-check.ts` | 重复 idempotency key 返回同一 job id，最终 task 数量保持一条 |

## 0. 章前定位

Chapter 14 已经建立 public HTTP contract、OpenAPI 和 API governance 的边界。本章继续往后端架构推进：一个功能什么时候保持在 modular monolith，什么时候拆成 worker service，HTTP request 什么时候只返回 job id，queue payload 为什么是 contract，Redis 为什么既可以支撑 queue 又可以支撑 cache 但不能共享所有权规则。

本章不把 microservices 当目标，也不引入 Kafka、RabbitMQ、Kubernetes runtime、Terraform、cloud vendor、frontend、GraphQL、gRPC 或 tRPC。所有代码都围绕一个本地 architecture lab，让你观察 API service、worker service、PostgreSQL、Redis、BullMQ、NGINX 和 Docker Compose 之间的真实边界。

## 1. 学习目标

- 能解释 modular monolith 与 microservices 的真正差别：不是文件夹数量，而是 runtime、deployment、data ownership、team ownership 和 failure mode。
- 能设计一个 queue job payload contract，并说明 TypeScript type、Zod schema、PostgreSQL unique constraint 和 BullMQ options 各自证明什么。
- 能区分 HTTP request lifecycle 与 background job lifecycle，知道为什么 job payload 不能携带 Express Request、Response、Prisma Client 或 secret。
- 能实现 idempotent worker handler，解释 duplicate delivery、retry、partial success 和 unique constraint 的关系。
- 能解释 cache-aside、TTL、explicit invalidation、stale data 和 stampede guard 的运行机制。
- 能用 Docker Compose 模拟 `api`、`worker`、`postgres`、`redis`、`nginx`，并区分 `depends_on` 与 `condition: service_healthy`。
- 能用 smoke、queue、worker、cache、consistency checks 和 low-cardinality metrics 证明系统边界，而不是只相信架构图。

## 2. 前置知识

你需要已经理解 Express route/middleware/error flow、Zod runtime validation、Prisma Client 与 migrations、Redis 基础 key/value/TTL、Docker Compose、HTTP status/headers/body、Node process signals、`AbortController`、`node:test`、TypeScript strict mode 与 `NodeNext` module resolution。Chapter 14 的 OpenAPI 和 compatibility 概念只作为公共 HTTP contract 背景。

## 3. 环境与运行基线

本章工作目录是 `D:\node.js`。最终项目目录是 `mini-projects/distributed-task-platform-lab`。本地 Node.js 基线来自 `node --version` 和 `npm --version`；本章选择当前本地项目已验证的 `type: "module"`、TypeScript `module: "NodeNext"`、Express 5 async handler、Prisma v7 driver adapter、PostgreSQL 18 Compose volume target `/var/lib/postgresql`，以及 NGINX `http://localhost:8080` 公共入口。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
cd D:\\node.js\\mini-projects\\distributed-task-platform-lab\nnpm install\nnpm run prisma:generate\nnpm run typecheck\nnpm run build\ndocker compose config
```
</div>

这些命令的学习意义是建立工具链和 runtime 边界：`npm install` 解析 dependency graph 并写入 lockfile，`prisma:generate` 从 schema 生成 Prisma Client，`typecheck` 只做静态检查，`build` 输出 JavaScript，`docker compose config` 展开多服务配置但不启动业务逻辑。

## 4. 第一性原理

后端架构的第一性问题不是“要不要微服务”，而是“哪个 owner 能独立负责这个状态变化，并在失败后恢复”。同步 HTTP owner 只能负责一次 request/response；queue owner 负责 delivery attempt；worker owner 负责长任务 side effect；PostgreSQL owner 负责 durable business state；Redis cache owner 负责可丢弃的派生读模型；Docker runtime owner 负责进程、网络、health 和 shutdown。

如果一个动作不能被重试，就不要无脑放进 queue；如果一个写入不能幂等，就不要把 retry 当可靠性；如果 cache invalidation 没有明确写路径，就不要把 cache 当事实来源；如果 readiness 只检查进程活着，就不要让 NGINX 接流量。

## 5. 技术边界模型

| Boundary | Owner | Observable signal | Typical failure |
| --- | --- | --- | --- |
| HTTP request | Express API service | status, headers, body, request id | socket timeout or wrong status contract |
| Job payload | producer and worker source contract | Zod parse result, job id, version | worker rejects unversioned or unserializable data |
| Queue delivery | BullMQ over Redis | waiting/active/completed/failed counts | stalled job, duplicate delivery, retry exhaustion |
| Business state | PostgreSQL through Prisma | rows, constraints, migrations | duplicate rows or partial writes |
| Cache state | Redis cache namespace | cacheStatus, TTL, invalidation metric | stale data or accidental key deletion |
| Runtime service | Docker Compose | healthcheck, logs, exit status | startup order mistaken for readiness |
| Public entrance | NGINX | `http://localhost:8080` response | bypassing proxy or exposing worker port |

## 6. 底层机制模型

```mermaid
flowchart LR
  Client["Client HTTP request"] --> Nginx["NGINX :8080"]
  Nginx --> Api["API service :3030"]
  Api --> Db1["PostgreSQL JobRecord"]
  Api --> Queue["BullMQ Queue in Redis"]
  Queue --> Worker["Worker service"]
  Worker --> Db2["PostgreSQL Task rows"]
  Worker --> Cache["Redis project summary cache"]
  Api --> Metrics["/v1/metrics"]
  Worker --> Metrics
```

这条链里有两个关键事实：第一，API service 和 worker service 是两个进程，所以不能共享 JavaScript object reference；第二，PostgreSQL transaction 和 Redis enqueue 是两个外部系统，所以本章只讲 outbox concept 和可恢复边界，不声称真实 distributed transaction 或 exactly-once processing。

## 7. 核心术语

| Concept | Layer | Meaning | Common Mistake |
| --- | --- | --- | --- |
| Modular monolith | architecture | 一个 deployment unit 内有清晰 module/data/use-case ownership | 以为“未拆服务”就是低级 |
| Worker service | runtime | 独立进程处理 queue job 和长任务 side effect | 让 worker 依赖 Express Request |
| Job payload contract | queue contract | producer 与 worker 之间可序列化、可版本化、可验证的数据承诺 | 只写 TypeScript type 不做 runtime parse |
| Idempotency key | data consistency | 把重复提交或 retry 映射到同一个业务结果 | 重试非幂等写入 |
| Stalled job | queue lifecycle | worker 失去 job lock 或停止续约后的恢复信号 | 把 stalled 当普通失败忽略 |
| Cache-aside | cache pattern | miss 后从 DB 读 fresh data 并写 cache | 把 TTL 当一致性证明 |
| Readiness | runtime signal | 依赖可用且服务可接流量 | 只检查进程 liveness |

## 8. 本章实践路线

先用 `practices/15-architecture-messaging-platform` 里的小文件观察单一机制，再进入 `distributed-task-platform-lab` 连接完整链路。学习顺序是：service boundary → job contract → queue/worker → idempotency/retry/timeout → transaction/outbox boundary → cache consistency → observability → Compose runtime → final checks。

## 9. 核心教学


<a id="section-9-1"></a>

### 9.1 Modular monolith 不是“低级架构”

**结论：**  
模块化单体先证明业务模块边界，再决定是否需要运行时拆分。

**本节解决的问题：**  
它解决把 monolith 误判为低级架构的问题；真正要检查的是模块 owner、公开 use case、数据表 owner 和 import 方向。

**技术意义：**  
技术意义在于把架构判断从服务数量转成边界证据，避免把模糊 owner 直接搬进 worker 或 microservice。

**概念解释：**  
模块化单体先证明业务模块边界，再决定是否需要运行时拆分。 它解决把 monolith 误判为低级架构的问题；真正要检查的是模块 owner、公开 use case、数据表 owner 和 import 方向。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是读取模块边界声明；值是 moduleName、ownedTables、publicUseCases 和 forbiddenImports；资源边界仍是一个 Node process；观察信号是边界报告是否指出可拆分或泄漏。

**底层机制：**  
触发点是读取模块边界声明；值是 moduleName、ownedTables、publicUseCases 和 forbiddenImports；资源边界仍是一个 Node process；观察信号是边界报告是否指出可拆分或泄漏。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是模块只能通过公开 use case 交接，不能跨目录读取另一个模块的私有表或内部函数。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/01-service-boundary/modular-monolith-boundary.ts</span>
  </div>

```ts
export type ModuleOwnership = {
  moduleName: string;
  ownsData: string[];
  publicUseCases: string[];
  forbiddenImports: string[];
};

export function describeModularMonolith(modules: ModuleOwnership[]): string[] {
  return modules.map((module) => {
    const data = module.ownsData.join(",");
    const useCases = module.publicUseCases.join(",");
    return `${module.moduleName}:data=${data}:useCases=${useCases}`;
  });
}

export function hasBoundaryLeak(module: ModuleOwnership, importedName: string): boolean {
  return module.forbiddenImports.includes(importedName);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const result = describeModularMonolith([
    {
      moduleName: "tasks",
      ownsData: ["Task"],
      publicUseCases: ["createTask", "listTasks"],
      forbiddenImports: ["Express.Request"]
    }
  ]);
  console.log(result.join("\n"));
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/01-service-boundary/modular-monolith-boundary.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/01-service-boundary/modular-monolith-boundary.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：模块化单体先证明业务模块边界，再决定是否需要运行时拆分。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是读取模块边界声明；值是 moduleName、ownedTables、publicUseCases 和 forbiddenImports；资源边界仍是一个 Node process；观察信号是边界报告是否指出可拆分或泄漏。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果来自字段组合：如果 owner、use case 或 forbidden import 不完整，拆 worker 会把本地耦合变成跨进程耦合。

**contrast：**  
对比 microservice：microservice 用网络隔离，modular monolith 先用代码和数据 owner 隔离。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 microservice：microservice 用网络隔离，modular monolith 先用代码和数据 owner 隔离。 这违反的规则是：模块只能通过公开 use case 交接，不能跨目录读取另一个模块的私有表或内部函数。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/01-service-boundary/modular-monolith-boundary.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它承接 Chapter 14 的 contract 思维，但本节的 contract 是模块边界，不是 OpenAPI。

**final memory model：**  
模块化单体先证明业务模块边界，再决定是否需要运行时拆分。

<a id="section-9-2"></a>

### 9.2 Service boundary：business、data、runtime、deployment、team、trust

**结论：**  
服务边界必须同时回答 business、data、runtime、deployment、team、trust。

**本节解决的问题：**  
它解决只凭代码量或部署愿望拆服务的问题；缺少 data 或 trust 边界时，服务拆分会继续共享内部状态。

**技术意义：**  
技术意义在于让拆分理由可审核，每个维度都对应一种运行、发布、值守或安全失败。

**概念解释：**  
服务边界必须同时回答 business、data、runtime、deployment、team、trust。 它解决只凭代码量或部署愿望拆服务的问题；缺少 data 或 trust 边界时，服务拆分会继续共享内部状态。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是评估候选能力；值是六个维度和风险说明；资源边界可能仍是单进程，也可能演进为 worker process；观察信号是每个维度都有证据。

**底层机制：**  
触发点是评估候选能力；值是六个维度和风险说明；资源边界可能仍是单进程，也可能演进为 worker process；观察信号是每个维度都有证据。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 runtime split 不能单独成立；data owner 不清楚时，不要把网络边界当修复手段。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/01-service-boundary/service-boundary-dimensions.ts</span>
  </div>

```ts
export type BoundaryDimension = "business" | "data" | "runtime" | "deployment" | "team" | "trust";

export type BoundaryDecision = {
  dimension: BoundaryDimension;
  signal: string;
  splitPressure: number;
};

export function calculateSplitPressure(decisions: BoundaryDecision[]): number {
  return decisions.reduce((total, decision) => total + decision.splitPressure, 0);
}

export function needsSeparateService(decisions: BoundaryDecision[]): boolean {
  const runtimePressure = decisions.some((decision) => decision.dimension === "runtime" && decision.splitPressure >= 3);
  return runtimePressure && calculateSplitPressure(decisions) >= 8;
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/01-service-boundary/service-boundary-dimensions.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/01-service-boundary/service-boundary-dimensions.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：服务边界必须同时回答 business、data、runtime、deployment、team、trust。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是评估候选能力；值是六个维度和风险说明；资源边界可能仍是单进程，也可能演进为 worker process；观察信号是每个维度都有证据。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果取决于六个维度是否同时支撑独立恢复；只有 runtime 价值而没有 data/team/trust 证据时，拆分会制造新耦合。

**contrast：**  
对比按技术栈拆服务：按维度拆分解释 owner，按技术栈拆分只改变调用方式。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比按技术栈拆服务：按维度拆分解释 owner，按技术栈拆分只改变调用方式。 这违反的规则是：runtime split 不能单独成立；data owner 不清楚时，不要把网络边界当修复手段。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/01-service-boundary/service-boundary-dimensions.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 Chapter 14 的 public contract 扩展成服务 owner contract。

**final memory model：**  
服务边界必须同时回答 business、data、runtime、deployment、team、trust。

<a id="section-9-3"></a>

### 9.3 Monolith to worker：什么时候拆 worker，什么时候不要拆

**结论：**  
只有可异步完成、可幂等、可观察的工作才适合拆到 worker。

**本节解决的问题：**  
它解决“慢就拆 worker”的误判；worker 会改变用户契约、状态查询和 retry 模型。

**技术意义：**  
技术意义在于明确何时把 request/response lifecycle 切换成 job lifecycle。

**概念解释：**  
只有可异步完成、可幂等、可观察的工作才适合拆到 worker。 它解决“慢就拆 worker”的误判；worker 会改变用户契约、状态查询和 retry 模型。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是一个候选 use case；值是 duration、immediate result、retry、idempotency；资源边界从 HTTP socket 转到 queue job；观察信号是是否能轮询状态。

**底层机制：**  
触发点是一个候选 use case；值是 duration、immediate result、retry、idempotency；资源边界从 HTTP socket 转到 queue job；观察信号是是否能轮询状态。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是必须立即返回业务结果的操作不要拆，不能幂等的操作不要自动重试。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/01-service-boundary/monolith-to-worker-decision.ts</span>
  </div>

```ts
export type WorkloadShape = {
  userWaitsForResult: boolean;
  durationMs: number;
  retryable: boolean;
  requiresHttpResponse: boolean;
  ownsLargeSideEffect: boolean;
};

export function chooseRuntime(workload: WorkloadShape): "http-handler" | "worker-service" {
  if (workload.requiresHttpResponse || workload.userWaitsForResult) return "http-handler";
  if (workload.retryable && workload.ownsLargeSideEffect) return "worker-service";
  if (workload.durationMs > 1000 && workload.retryable) return "worker-service";
  return "http-handler";
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/01-service-boundary/monolith-to-worker-decision.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/01-service-boundary/monolith-to-worker-decision.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：只有可异步完成、可幂等、可观察的工作才适合拆到 worker。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是一个候选 use case；值是 duration、immediate result、retry、idempotency；资源边界从 HTTP socket 转到 queue job；观察信号是是否能轮询状态。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果来自用户契约：如果调用方需要最终结果，返回 job id 就是错误 contract；如果任务不可幂等，retry 会重复副作用。

**contrast：**  
对比 cron job：worker 响应用户触发的异步任务，cron 按时间触发且不一定有 HTTP 起点。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 cron job：worker 响应用户触发的异步任务，cron 按时间触发且不一定有 HTTP 起点。 这违反的规则是：必须立即返回业务结果的操作不要拆，不能幂等的操作不要自动重试。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/01-service-boundary/monolith-to-worker-decision.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它是从 modular monolith 进入 queue 的第一个判断门。

**final memory model：**  
只有可异步完成、可幂等、可观察的工作才适合拆到 worker。

<a id="section-9-4"></a>

### 9.4 HTTP request 与 background job 的边界

**结论：**  
HTTP request 负责接受和回应，background job 负责完成和恢复。

**本节解决的问题：**  
它解决把 202 response 当作任务完成、或让 HTTP handler 等完整后台任务的问题。

**技术意义：**  
技术意义在于分离客户端连接生命周期与后台任务生命周期。

**概念解释：**  
HTTP request 负责接受和回应，background job 负责完成和恢复。 它解决把 202 response 当作任务完成、或让 HTTP handler 等完整后台任务的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 POST request；值是 request body、job payload、job id；API 是 Express route 和 Queue.add；资源从 socket 转到 Redis job；观察信号是 202 与后续 status 查询。

**底层机制：**  
触发点是 POST request；值是 request body、job payload、job id；API 是 Express route 和 Queue.add；资源从 socket 转到 Redis job；观察信号是 202 与后续 status 查询。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是进入后台任务时返回 acceptance，不返回 final result；payload 必须可序列化；job status 必须可查询。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/01-service-boundary/sync-vs-async-boundary.ts</span>
  </div>

```ts
export type RequestWork = {
  needsImmediateBody: boolean;
  canReturnJobId: boolean;
  touchesExternalDependency: boolean;
};

export function classifyRequestWork(work: RequestWork): "synchronous-http" | "asynchronous-job" {
  if (work.needsImmediateBody) return "synchronous-http";
  if (work.canReturnJobId && work.touchesExternalDependency) return "asynchronous-job";
  return "synchronous-http";
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/01-service-boundary/sync-vs-async-boundary.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/01-service-boundary/sync-vs-async-boundary.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：HTTP request 负责接受和回应，background job 负责完成和恢复。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 POST request；值是 request body、job payload、job id；API 是 Express route 和 Queue.add；资源从 socket 转到 Redis job；观察信号是 202 与后续 status 查询。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果不同是因为 HTTP response completed 只表示服务已回应，job completed 才表示业务副作用完成。

**contrast：**  
对比同步 create task：短写入可以返回 201 DTO，bulk import 返回 202 job id。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比同步 create task：短写入可以返回 201 DTO，bulk import 返回 202 job id。 这违反的规则是：进入后台任务时返回 acceptance，不返回 final result；payload 必须可序列化；job status 必须可查询。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/01-service-boundary/sync-vs-async-boundary.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 Chapter 14 的 response contract 推进到 Chapter 15 的 job status contract。

**final memory model：**  
HTTP request 负责接受和回应，background job 负责完成和恢复。

<a id="section-9-5"></a>

### 9.5 Queue mental model：producer、queue、job、worker、processor

**结论：**  
queue 链路由 producer、queue、job、worker、processor 五个角色组成。

**本节解决的问题：**  
它解决把 queue 当成异步函数调用的问题；异步函数没有 durable delivery state。

**技术意义：**  
技术意义在于明确每个角色拥有的资源，避免 controller、queue 和 processor 互相越权。

**概念解释：**  
queue 链路由 producer、queue、job、worker、processor 五个角色组成。 它解决把 queue 当成异步函数调用的问题；异步函数没有 durable delivery state。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 producer 调用 Queue.add；值是 jobName、payload、options；资源是 Redis keys 和 worker process；转换是 queued 到 active；观察信号是 queue depth 或 job id。

**底层机制：**  
触发点是 producer 调用 Queue.add；值是 jobName、payload、options；资源是 Redis keys 和 worker process；转换是 queued 到 active；观察信号是 queue depth 或 job id。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 producer 不执行业务导入，processor 不依赖 Request/Response，payload 只能包含 JSON-like 数据。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/03-queue-worker/bullmq-queue-producer.ts</span>
  </div>

```ts
export type QueueAddOptions = {
  jobId: string;
  attempts: number;
  backoffDelayMs: number;
};

export function buildQueueAddOptions(idempotencyKey: string): QueueAddOptions {
  return {
    jobId: `tasks.import:${idempotencyKey}`,
    attempts: 3,
    backoffDelayMs: 1000
  };
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/03-queue-worker/bullmq-queue-producer.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/03-queue-worker/bullmq-queue-producer.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：queue 链路由 producer、queue、job、worker、processor 五个角色组成。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 producer 调用 Queue.add；值是 jobName、payload、options；资源是 Redis keys 和 worker process；转换是 queued 到 active；观察信号是 queue depth 或 job id。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果是 queued，因为 producer 只完成交接，processor 尚未运行。

**contrast：**  
对比 Promise.then：Promise 只在当前进程调度微任务，queue 能跨进程和重启保存 delivery state。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 Promise.then：Promise 只在当前进程调度微任务，queue 能跨进程和重启保存 delivery state。 这违反的规则是：producer 不执行业务导入，processor 不依赖 Request/Response，payload 只能包含 JSON-like 数据。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/03-queue-worker/bullmq-queue-producer.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它为后续 BullMQ、payload contract 和 worker service 建立词汇。

**final memory model：**  
queue 链路由 producer、queue、job、worker、processor 五个角色组成。

<a id="section-9-6"></a>

### 9.6 BullMQ and Redis：Queue、Worker、attempts、backoff、stalled job

**结论：**  
BullMQ 管理 delivery，不保证业务 exactly once。

**本节解决的问题：**  
它解决把 attempts、backoff、stalled job 误解为完整业务可靠性的错误。

**技术意义：**  
技术意义在于把 Redis/BullMQ delivery guarantee 与数据库幂等边界分开。

**概念解释：**  
BullMQ 管理 delivery，不保证业务 exactly once。 它解决把 attempts、backoff、stalled job 误解为完整业务可靠性的错误。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 Worker 监听 queue；值是 job.data、attemptsMade、backoff config；资源是 Redis connection 和 lock；观察信号是 event 或 job status。

**底层机制：**  
触发点是 Worker 监听 queue；值是 job.data、attemptsMade、backoff config；资源是 Redis connection 和 lock；观察信号是 event 或 job status。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 attempts 是 retry 上限，backoff 是 retry delay，stalled 是 worker 失联恢复；业务重复写入必须靠 idempotency。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/03-queue-worker/bullmq-worker-handler.ts</span>
  </div>

```ts
export type WorkerHandlerInput = {
  payloadValid: boolean;
  idempotencyKey: string;
  taskCount: number;
};

export function summarizeWorkerHandler(input: WorkerHandlerInput): string {
  if (!input.payloadValid) return "reject-invalid-payload";
  if (input.taskCount === 0) return "complete-empty-import";
  return `apply-idempotent-import:${input.idempotencyKey}`;
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/03-queue-worker/bullmq-worker-handler.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/03-queue-worker/bullmq-worker-handler.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：BullMQ 管理 delivery，不保证业务 exactly once。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 Worker 监听 queue；值是 job.data、attemptsMade、backoff config；资源是 Redis connection 和 lock；观察信号是 event 或 job status。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
retry 发生是因为 BullMQ 根据 delivery options 重新排队；重复业务结果发生是因为 handler 没有幂等保护。

**contrast：**  
对比 database transaction：BullMQ 保存投递状态，PostgreSQL constraint 才能证明业务事实不重复。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 database transaction：BullMQ 保存投递状态，PostgreSQL constraint 才能证明业务事实不重复。 这违反的规则是：attempts 是 retry 上限，backoff 是 retry delay，stalled 是 worker 失联恢复；业务重复写入必须靠 idempotency。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/03-queue-worker/bullmq-worker-handler.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它连接 queue mental model 和 idempotent handler。

**final memory model：**  
BullMQ 管理 delivery，不保证业务 exactly once。

<a id="section-9-7"></a>

### 9.7 Job payload contract：name、version、schema、idempotencyKey、correlationId

**结论：**  
job payload 是内部 contract，需要版本化和运行时验证。

**本节解决的问题：**  
它解决把 TypeScript 类型当作 Redis 中 JSON 数据验证的问题。

**技术意义：**  
技术意义在于让 API producer 与 worker consumer 在独立进程中仍能对齐输入语义。

**概念解释：**  
job payload 是内部 contract，需要版本化和运行时验证。 它解决把 TypeScript 类型当作 Redis 中 JSON 数据验证的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 API 构造 payload 或 worker parse payload；值是 name/version/tasks/idempotencyKey；API 是 Zod parse；资源是 Redis job data；观察信号是 parse success 或 validation error。

**底层机制：**  
触发点是 API 构造 payload 或 worker parse payload；值是 name/version/tasks/idempotencyKey；API 是 Zod parse；资源是 Redis job data；观察信号是 parse success 或 validation error。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 job name 和 version 必须固定；payload 必须重新 parse；idempotencyKey 与 correlationId 不能省略。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/02-job-contract/job-payload-schema.ts</span>
  </div>

```ts
export type ImportTasksPayload = {
  name: "tasks.import";
  version: "1";
  projectId: string;
  idempotencyKey: string;
  correlationId: string;
  tasks: Array<{ title: string; completed: boolean }>;
};

export function isImportTasksPayload(payload: ImportTasksPayload): boolean {
  return payload.name === "tasks.import" && payload.version === "1" && payload.tasks.length > 0;
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/02-job-contract/job-payload-schema.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/02-job-contract/job-payload-schema.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：job payload 是内部 contract，需要版本化和运行时验证。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 API 构造 payload 或 worker parse payload；值是 name/version/tasks/idempotencyKey；API 是 Zod parse；资源是 Redis job data；观察信号是 parse success 或 validation error。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
错误发生是因为外部 JSON 不会自动继承 TypeScript 类型；schema 是 unknown 到可信 payload 的入口。

**contrast：**  
对比 OpenAPI schema：OpenAPI 面向 HTTP 调用方，job schema 面向内部 API/worker 消费者。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 OpenAPI schema：OpenAPI 面向 HTTP 调用方，job schema 面向内部 API/worker 消费者。 这违反的规则是：job name 和 version 必须固定；payload 必须重新 parse；idempotencyKey 与 correlationId 不能省略。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/02-job-contract/job-payload-schema.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它承接 Chapter 14 的 runtime validation，只是对象从 HTTP body 变成 queue payload。

**final memory model：**  
job payload 是内部 contract，需要版本化和运行时验证。

<a id="section-9-8"></a>

### 9.8 Job state machine：queued、active、completed、failed、retrying、stalled

**结论：**  
公共 job status 应是安全业务投影，不是 BullMQ 内部对象。

**本节解决的问题：**  
它解决直接暴露 BullMQ job 导致实现细节泄漏和 API contract 不稳定的问题。

**技术意义：**  
技术意义在于让用户和运维看到稳定状态，同时保留内部 delivery 机制的可替换性。

**概念解释：**  
公共 job status 应是安全业务投影，不是 BullMQ 内部对象。 它解决直接暴露 BullMQ job 导致实现细节泄漏和 API contract 不稳定的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 API accept 或 worker event；值是 status、attemptCount、events；资源是 PostgreSQL row；转换是 internal event 到 public DTO；观察信号是 GET job status。

**底层机制：**  
触发点是 API accept 或 worker event；值是 status、attemptCount、events；资源是 PostgreSQL row；转换是 internal event 到 public DTO；观察信号是 GET job status。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 public DTO 不暴露 Redis key；completed 只能在业务 commit 后写入；failed/retrying/stalled 要有不同含义。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/02-job-contract/job-state-machine.ts</span>
  </div>

```ts
export type JobState = "queued" | "active" | "retrying" | "completed" | "failed" | "stalled";

const allowedTransitions = new Map<JobState, JobState[]>([
  ["queued", ["active", "failed"]],
  ["active", ["completed", "failed", "retrying", "stalled"]],
  ["retrying", ["queued", "failed"]],
  ["stalled", ["queued", "failed"]],
  ["completed", []],
  ["failed", ["queued"]]
]);

export function canTransitionJob(from: JobState, to: JobState): boolean {
  return allowedTransitions.get(from)?.includes(to) ?? false;
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/02-job-contract/job-state-machine.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/02-job-contract/job-state-machine.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：公共 job status 应是安全业务投影，不是 BullMQ 内部对象。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 API accept 或 worker event；值是 status、attemptCount、events；资源是 PostgreSQL row；转换是 internal event 到 public DTO；观察信号是 GET job status。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果由状态转换规则决定：业务事务未提交时，写 completed 就会制造假成功。

**contrast：**  
对比 raw BullMQ state：raw state 适合内部 diagnostics，public status 适合 API consumer。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 raw BullMQ state：raw state 适合内部 diagnostics，public status 适合 API consumer。 这违反的规则是：public DTO 不暴露 Redis key；completed 只能在业务 commit 后写入；failed/retrying/stalled 要有不同含义。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/02-job-contract/job-state-machine.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它连接 queue delivery 与 Chapter 14 的 response shape。

**final memory model：**  
公共 job status 应是安全业务投影，不是 BullMQ 内部对象。

<a id="section-9-9"></a>

### 9.9 Idempotent job handler：duplicate delivery、retry、unique constraint

**结论：**  
worker handler 必须按重复投递设计。

**本节解决的问题：**  
它解决 queue retry、worker crash 或用户重复请求导致重复业务事实的问题。

**技术意义：**  
技术意义在于把可能重复执行转成重复执行不改变最终事实。

**概念解释：**  
worker handler 必须按重复投递设计。 它解决 queue retry、worker crash 或用户重复请求导致重复业务事实的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是同一个 job 或 duplicate request；值是 idempotencyKey、task title、unique index；资源是 PostgreSQL unique constraint；观察信号是 matchingTasks=1。

**底层机制：**  
触发点是同一个 job 或 duplicate request；值是 idempotencyKey、task title、unique index；资源是 PostgreSQL unique constraint；观察信号是 matchingTasks=1。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是重复投递必须返回已有结果、skip 或 upsert；唯一约束要落到数据库。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/06-consistency/duplicate-message-handler.ts</span>
  </div>

```ts
const processedKeys = new Set<string>();

export function handleDuplicateMessage(idempotencyKey: string): "apply" | "skip" {
  if (processedKeys.has(idempotencyKey)) return "skip";
  processedKeys.add(idempotencyKey);
  return "apply";
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/06-consistency/duplicate-message-handler.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/06-consistency/duplicate-message-handler.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：worker handler 必须按重复投递设计。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是同一个 job 或 duplicate request；值是 idempotencyKey、task title、unique index；资源是 PostgreSQL unique constraint；观察信号是 matchingTasks=1。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果稳定是因为 PostgreSQL constraint 在进程重启后仍存在，内存标志不会丢失事实。

**contrast：**  
对比 mutex：mutex 保护当前进程临界区，unique constraint 保护持久业务事实。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 mutex：mutex 保护当前进程临界区，unique constraint 保护持久业务事实。 这违反的规则是：重复投递必须返回已有结果、skip 或 upsert；唯一约束要落到数据库。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/06-consistency/duplicate-message-handler.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 at-least-once delivery 转成安全业务处理。

**final memory model：**  
worker handler 必须按重复投递设计。

<a id="section-9-10"></a>

### 9.10 Retry、backoff、poison job 与 dead-letter boundary

**结论：**  
retry 只适合 transient failure，poison job 要隔离。

**本节解决的问题：**  
它解决所有错误都 retry 导致永久错误反复占用 worker 的问题。

**技术意义：**  
技术意义在于保护队列吞吐和可恢复性：临时错误等待，永久错误快速失败。

**概念解释：**  
retry 只适合 transient failure，poison job 要隔离。 它解决所有错误都 retry 导致永久错误反复占用 worker 的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 processor throw；值是 error class、attemptsMade、maxAttempts；资源是 delayed/failed queue state；观察信号是 failureClass。

**底层机制：**  
触发点是 processor throw；值是 error class、attemptsMade、maxAttempts；资源是 delayed/failed queue state；观察信号是 failureClass。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 permanent 不 retry，transient 按上限和 backoff retry，超过上限进入 failed/dead-letter 观察边界。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/03-queue-worker/retry-backoff-policy.ts</span>
  </div>

```ts
export type FailureClass = "transient" | "permanent" | "unknown";

export function shouldRetryJob(failureClass: FailureClass, attemptsMade: number, maxAttempts: number): boolean {
  if (failureClass === "permanent") return false;
  return attemptsMade < maxAttempts;
}

export function exponentialBackoffDelay(attemptNumber: number, baseDelayMs: number): number {
  return baseDelayMs * 2 ** Math.max(0, attemptNumber - 1);
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/03-queue-worker/retry-backoff-policy.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/03-queue-worker/retry-backoff-policy.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：retry 只适合 transient failure，poison job 要隔离。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 processor throw；值是 error class、attemptsMade、maxAttempts；资源是 delayed/failed queue state；观察信号是 failureClass。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果不同是因为永久错误重试不会改变输入，而临时错误可能在依赖恢复后成功。

**contrast：**  
对比 timeout：timeout 可能是 transient，也可能是容量问题，不能默认永久或临时。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 timeout：timeout 可能是 transient，也可能是容量问题，不能默认永久或临时。 这违反的规则是：permanent 不 retry，transient 按上限和 backoff retry，超过上限进入 failed/dead-letter 观察边界。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/03-queue-worker/retry-backoff-policy.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它承接 retry 配置，并为 timeout 分类做准备。

**final memory model：**  
retry 只适合 transient failure，poison job 要隔离。

<a id="section-9-11"></a>

### 9.11 Timeout and cancellation：API timeout、job timeout、dependency timeout

**结论：**  
timeout 是资源边界，不是业务补偿。

**本节解决的问题：**  
它解决 API、worker 或依赖调用无限占用 socket、worker slot 或连接池的问题。

**技术意义：**  
技术意义在于给 HTTP request、job processor、dependency call 和 shutdown 独立上限。

**概念解释：**  
timeout 是资源边界，不是业务补偿。 它解决 API、worker 或依赖调用无限占用 socket、worker slot 或连接池的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是开始一次 operation；值是 timeoutMs、AbortSignal、timer handle；API 是 node timers 和支持 signal 的 I/O；观察信号是 timeout error 与无悬挂 handle。

**底层机制：**  
触发点是开始一次 operation；值是 timeoutMs、AbortSignal、timer handle；API 是 node timers 和支持 signal 的 I/O；观察信号是 timeout error 与无悬挂 handle。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是每个 timeout 要有清理；dependency call 要接收 signal 或自身 timeout；job timeout 后要写状态或让 queue 失败。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/04-background-jobs/job-timeout-abort.ts</span>
  </div>

```ts
export async function runWithAbortSignal<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/04-background-jobs/job-timeout-abort.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/04-background-jobs/job-timeout-abort.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：timeout 是资源边界，不是业务补偿。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是开始一次 operation；值是 timeoutMs、AbortSignal、timer handle；API 是 node timers 和支持 signal 的 I/O；观察信号是 timeout error 与无悬挂 handle。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果发生是因为 abort 只通知协作式 API；已经 commit 的数据库事实不能被 AbortSignal 撤销。

**contrast：**  
对比 process.kill：kill 终止进程，AbortSignal 只请求取消当前操作。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 process.kill：kill 终止进程，AbortSignal 只请求取消当前操作。 这违反的规则是：每个 timeout 要有清理；dependency call 要接收 signal 或自身 timeout；job timeout 后要写状态或让 queue 失败。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/04-background-jobs/job-timeout-abort.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 request、queue 和 dependency 生命周期连接到 resource cleanup。

**final memory model：**  
timeout 是资源边界，不是业务补偿。

<a id="section-9-12"></a>

### 9.12 Transaction boundary：DB write、queue enqueue、outbox concept

**结论：**  
DB transaction 与 queue enqueue 不是同一个原子边界。

**本节解决的问题：**  
它解决先写 DB 后 enqueue 或先 enqueue 后写 DB 的 crash window。

**技术意义：**  
技术意义在于让跨资源交接可恢复，outbox row 记录需要投递的事实。

**概念解释：**  
DB transaction 与 queue enqueue 不是同一个原子边界。 它解决先写 DB 后 enqueue 或先 enqueue 后写 DB 的 crash window。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是业务写入需要发布 job；值是 business row、outbox row、queue job；资源是 PostgreSQL WAL 与 Redis key；观察信号是可扫描未投递 row。

**底层机制：**  
触发点是业务写入需要发布 job；值是 business row、outbox row、queue job；资源是 PostgreSQL WAL 与 Redis key；观察信号是可扫描未投递 row。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是不要声称 DB + Redis 自动原子；需要可靠交接时，把待投递事实写进数据库。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/06-consistency/transaction-outbox-model.ts</span>
  </div>

```ts
export type OutboxRecord = {
  id: string;
  aggregateId: string;
  eventName: string;
  publishedAt: Date | null;
};

export function isPendingOutboxRecord(record: OutboxRecord): boolean {
  return record.publishedAt === null;
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/06-consistency/transaction-outbox-model.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/06-consistency/transaction-outbox-model.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：DB transaction 与 queue enqueue 不是同一个原子边界。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是业务写入需要发布 job；值是 business row、outbox row、queue job；资源是 PostgreSQL WAL 与 Redis key；观察信号是可扫描未投递 row。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果来自资源边界：PostgreSQL WAL 和 Redis key 不共享 transaction coordinator。

**contrast：**  
对比 distributed transaction：outbox 用最终一致性和重试换取可操作性。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 distributed transaction：outbox 用最终一致性和重试换取可操作性。 这违反的规则是：不要声称 DB + Redis 自动原子；需要可靠交接时，把待投递事实写进数据库。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/06-consistency/transaction-outbox-model.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它连接 API enqueue 与 persistence 一致性。

**final memory model：**  
DB transaction 与 queue enqueue 不是同一个原子边界。

<a id="section-9-13"></a>

### 9.13 Cache consistency：cache-aside、TTL、invalidation、stale data

**结论：**  
cache 是可重建派生值，数据库才是事实来源。

**本节解决的问题：**  
它解决只靠 TTL 或只靠手动删除解释缓存一致性的问题。

**技术意义：**  
技术意义在于分离读性能优化和一致性责任：read path load/fill，write path invalidation。

**概念解释：**  
cache 是可重建派生值，数据库才是事实来源。 它解决只靠 TTL 或只靠手动删除解释缓存一致性的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是读取 summary 或写 task；值是 cache key、TTL、loader Promise；资源是 Redis key 和 PostgreSQL row；观察信号是 cacheStatus。

**底层机制：**  
触发点是读取 summary 或写 task；值是 cache key、TTL、loader Promise；资源是 Redis key 和 PostgreSQL row；观察信号是 cacheStatus。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 key 必须 namespace/version；loader 从事实源重建；写路径先提交事实再 invalidation；TTL 不替代 invalidation。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/05-cache-consistency/cache-aside-read.ts</span>
  </div>

```ts
export type CacheAsideRead<T> = {
  cacheValue: T | null;
  loadFreshValue(): Promise<T>;
  storeFreshValue(value: T): Promise<void>;
};

export async function readThroughCacheAside<T>(read: CacheAsideRead<T>): Promise<{ value: T; cacheStatus: "hit" | "miss" }> {
  if (read.cacheValue !== null) return { value: read.cacheValue, cacheStatus: "hit" };
  const value = await read.loadFreshValue();
  await read.storeFreshValue(value);
  return { value, cacheStatus: "miss" };
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/05-cache-consistency/cache-aside-read.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/05-cache-consistency/cache-aside-read.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：cache 是可重建派生值，数据库才是事实来源。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是读取 summary 或写 task；值是 cache key、TTL、loader Promise；资源是 Redis key 和 PostgreSQL row；观察信号是 cacheStatus。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果发生是因为 Redis 保存派生副本，不会自动知道 PostgreSQL row 变化。

**contrast：**  
对比 write-through cache：cache-aside 更简单，但写路径必须显式处理失效。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 write-through cache：cache-aside 更简单，但写路径必须显式处理失效。 这违反的规则是：key 必须 namespace/version；loader 从事实源重建；写路径先提交事实再 invalidation；TTL 不替代 invalidation。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/05-cache-consistency/cache-aside-read.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 Redis 从 queue delivery 扩展到 read model，但强调 owner 不同。

**final memory model：**  
cache 是可重建派生值，数据库才是事实来源。

<a id="section-9-14"></a>

### 9.14 Redis as queue vs Redis as cache：same infrastructure, different ownership

**结论：**  
同一个 Redis 可以承载 queue 和 cache，但不能共享删除和生命周期规则。

**本节解决的问题：**  
它解决为了清理缓存而误删 queue job 的问题。

**技术意义：**  
技术意义在于把基础设施复用与数据 owner 分开。

**概念解释：**  
同一个 Redis 可以承载 queue 和 cache，但不能共享删除和生命周期规则。 它解决为了清理缓存而误删 queue job 的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点可能是 enqueue、cache read 或 invalidation；值是 queue key prefix 和 cache key；资源是 Redis database；观察信号是 queue check 与 cache check 独立通过。

**底层机制：**  
触发点可能是 enqueue、cache read 或 invalidation；值是 queue key prefix 和 cache key；资源是 Redis database；观察信号是 queue check 与 cache check 独立通过。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 cache invalidation 不得删除 BullMQ namespace；queue cleanup 必须使用 BullMQ API；cache key 由 cache module 命名。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/15-architecture-messaging-platform/05-cache-consistency/cache-invalidation.ts</span>
  </div>

```ts
export type CacheInvalidationEvent = {
  resource: "project-summary";
  resourceId: string;
  reason: "task-created" | "task-imported" | "manual";
};

export function buildInvalidationKey(event: CacheInvalidationEvent): string {
  return `cache:v1:${event.resource}:${event.resourceId}`;
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `practices/15-architecture-messaging-platform/05-cache-consistency/cache-invalidation.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
在 `D:\node.js` 下可用 `npx tsx practices/15-architecture-messaging-platform/05-cache-consistency/cache-invalidation.ts` 运行练习；如果练习依赖 Redis、PostgreSQL 或 Compose，就先阅读本节机制，再通过最终项目脚本观察。

**预期输出：**  
可观察输出应证明：同一个 Redis 可以承载 queue 和 cache，但不能共享删除和生命周期规则。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点可能是 enqueue、cache read 或 invalidation；值是 queue key prefix 和 cache key；资源是 Redis database；观察信号是 queue check 与 cache check 独立通过。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
flushdb 导致任务丢失，是因为命令越过 owner boundary，删除了不属于 cache 模块的数据。

**contrast：**  
对比两个 Redis 实例：分实例能加强隔离，但同实例也必须分 namespace 和 owner。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比两个 Redis 实例：分实例能加强隔离，但同实例也必须分 namespace 和 owner。 这违反的规则是：cache invalidation 不得删除 BullMQ namespace；queue cleanup 必须使用 BullMQ API；cache key 由 cache module 命名。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `practices/15-architecture-messaging-platform/05-cache-consistency/cache-invalidation.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它是 queue 与 cache 同基础设施不同语义的分水岭。

**final memory model：**  
同一个 Redis 可以承载 queue 和 cache，但不能共享删除和生命周期规则。

<a id="section-9-15"></a>

### 9.15 API service runtime：enqueue job、return job id、query job status

**结论：**  
API service 只承诺接受任务并返回可查询 job id。

**本节解决的问题：**  
它解决 API 等 worker 完成或向 public contract 暴露 queue internals 的问题。

**技术意义：**  
技术意义在于把 HTTP contract 固定为 acceptance/status，而不是后台业务结果。

**概念解释：**  
API service 只承诺接受任务并返回可查询 job id。 它解决 API 等 worker 完成或向 public contract 暴露 queue internals 的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 POST import；值是 params、body、requestId、payload；资源是 HTTP socket、DB connection、Redis socket；观察信号是 202/jobId。

**底层机制：**  
触发点是 POST import；值是 params、body、requestId、payload；资源是 HTTP socket、DB connection、Redis socket；观察信号是 202/jobId。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 body 先 parse；JobRecord 先写入；Queue.add 使用固定 jobId；duplicate idempotencyKey 返回已有 job；response 不承诺 completed。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.service.ts</span>
  </div>

```ts
import type { Prisma } from "../../generated/prisma/client.js";
import { chooseCorrelationId } from "../../observability/correlation-id.js";
import { recordJobQueued } from "../../observability/job-metrics.js";
import { buildImportJobOptions, buildImportJobPayload, IMPORT_TASKS_JOB_NAME, IMPORT_TASKS_PAYLOAD_VERSION } from "../../queue/job-contract.js";
import { taskQueue } from "../../queue/task-queue.js";
import { invalidateProjectSummary } from "../../cache/cache-invalidation.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { getProjectById } from "../projects/projects.service.js";
import type { CreateTaskInput, ImportTasksRequest } from "./tasks.schema.js";

export type TaskDto = {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

function toTaskDto(task: { id: string; projectId: string; title: string; completed: boolean; createdAt: Date; updatedAt: Date }): TaskDto {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}

export async function listTasks(projectId: string): Promise<TaskDto[]> {
  await getProjectById(projectId);
  const tasks = await prisma.task.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } });
  return tasks.map(toTaskDto);
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<TaskDto> {
  await getProjectById(projectId);
  const task = await prisma.task.create({
    data: {
      projectId,
      title: input.title,
      completed: input.completed
    }
  });
  await invalidateProjectSummary(projectId);
  return toTaskDto(task);
}

export async function enqueueTaskImport(projectId: string, body: ImportTasksRequest, requestId: string | undefined): Promise<{ jobId: string; status: string; duplicate: boolean }> {
  await getProjectById(projectId);
  const correlationId = chooseCorrelationId(body.correlationId ?? requestId);
  const payload = buildImportJobPayload({
    projectId,
    idempotencyKey: body.idempotencyKey,
    correlationId,
    tasks: body.tasks,
    metadata: { source: "api" },
    failureMode: body.failureMode
  });
  const options = buildImportJobOptions(body.idempotencyKey);
  const publicJobId = String(options.jobId);

  try {
    await prisma.jobRecord.create({
      data: {
        jobId: publicJobId,
        jobName: IMPORT_TASKS_JOB_NAME,
        payloadVersion: IMPORT_TASKS_PAYLOAD_VERSION,
        idempotencyKey: body.idempotencyKey,
        correlationId,
        status: "queued",
        projectId,
        payload: payload as unknown as Prisma.InputJsonValue,
        events: {
          create: {
            status: "queued",
            message: "Job accepted",
            metadata: { source: "api" }
          }
        }
      }
    });
  } catch (error: unknown) {
    const existing = await prisma.jobRecord.findUnique({ where: { idempotencyKey: body.idempotencyKey } });
    if (existing) return { jobId: existing.jobId, status: existing.status, duplicate: true };
    throw error;
  }

  await taskQueue.add(IMPORT_TASKS_JOB_NAME, payload, options);
  recordJobQueued(IMPORT_TASKS_JOB_NAME);
  return { jobId: publicJobId, status: "queued", duplicate: false };
}

export function assertProjectExists(projectId: string): Promise<unknown> {
  return getProjectById(projectId).catch((error: unknown) => {
    if (error instanceof HttpError) throw error;
    throw new HttpError(404, "project_not_found", "Project not found");
  });
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.service.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
`mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.service.ts` 属于最终项目，不建议脱离项目依赖直接运行；通过 `npm run typecheck`、`npm test -- --test-concurrency=1` 或与该边界对应的 runtime check script 观察。

**预期输出：**  
可观察输出应证明：API service 只承诺接受任务并返回可查询 job id。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 POST import；值是 params、body、requestId、payload；资源是 HTTP socket、DB connection、Redis socket；观察信号是 202/jobId。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果是 queued 而非 completed，因为 API service 的 owner 是 acceptance，不是 processor side effect。

**contrast：**  
对比同步 create task：create task 可以返回 201 task DTO，import 返回 202 job DTO。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比同步 create task：create task 可以返回 201 task DTO，import 返回 202 job DTO。 这违反的规则是：body 先 parse；JobRecord 先写入；Queue.add 使用固定 jobId；duplicate idempotencyKey 返回已有 job；response 不承诺 completed。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.service.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 Chapter 14 的 route contract 扩展到异步 job acceptance。

**final memory model：**  
API service 只承诺接受任务并返回可查询 job id。

<a id="section-9-16"></a>

### 9.16 Worker service runtime：process job、update result、invalidate cache

**结论：**  
Worker service 拥有后台副作用、状态推进和 cache invalidation。

**本节解决的问题：**  
它解决 worker 复用 API controller 或信任未验证 payload 的问题。

**技术意义：**  
技术意义在于让后台任务能独立启动、失败、重试、关闭，并在完成后更新 durable status。

**概念解释：**  
Worker service 拥有后台副作用、状态推进和 cache invalidation。 它解决 worker 复用 API controller 或信任未验证 payload 的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 BullMQ 把 job 交给 processor；值是 job.data、attemptsMade、payload、result；资源是 worker process、Redis connection、DB connection；观察信号是 worker:check completed。

**底层机制：**  
触发点是 BullMQ 把 job 交给 processor；值是 job.data、attemptsMade、payload、result；资源是 worker process、Redis connection、DB connection；观察信号是 worker:check completed。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 processor 入口必须重新验证 payload；invalid payload 是 permanent failure；成功 commit 后再 invalidation；shutdown 要关闭 worker 和连接。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/worker/processor.ts</span>
  </div>

```ts
import type { Job } from "bullmq";
import type { Prisma } from "../generated/prisma/client.js";
import { invalidateProjectSummary } from "../cache/cache-invalidation.js";
import { prisma } from "../db/prisma.js";
import { recordJobCompleted, recordJobFailed, recordJobStarted } from "../observability/job-metrics.js";
import { IMPORT_TASKS_JOB_NAME } from "../queue/job-contract.js";
import { type ImportTasksJobPayload, type ImportTasksJobResult, parseImportTasksPayload } from "../queue/job-schemas.js";
import { classifyJobFailure, PermanentJobError, TransientJobError } from "../queue/retry-policy.js";

function readFailureIdempotencyKey(input: unknown): string | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const rawIdempotencyKey = (input as { idempotencyKey?: unknown }).idempotencyKey;
  return typeof rawIdempotencyKey === "string" && rawIdempotencyKey.length > 0 ? rawIdempotencyKey : undefined;
}

function parsePayloadForWorker(input: unknown): ImportTasksJobPayload {
  try {
    return parseImportTasksPayload(input);
  } catch (error: unknown) {
    throw new PermanentJobError("Invalid import job payload", { cause: error });
  }
}

export async function processImportTasksJob(job: Job<ImportTasksJobPayload, ImportTasksJobResult, string>): Promise<ImportTasksJobResult> {
  const startedAt = Date.now();
  let payload: ImportTasksJobPayload | undefined;
  try {
    const validPayload = parsePayloadForWorker(job.data);
    payload = validPayload;
    if (validPayload.failureMode === "permanent") throw new PermanentJobError("Permanent failure requested");
    if (validPayload.failureMode === "transient" && job.attemptsMade === 0) throw new TransientJobError("Transient failure requested");

    recordJobStarted(IMPORT_TASKS_JOB_NAME);

    const existingCompleted = await prisma.jobRecord.findUnique({
      where: { idempotencyKey: validPayload.idempotencyKey }
    });

    if (existingCompleted?.status === "completed" && existingCompleted.result) {
      return existingCompleted.result as ImportTasksJobResult;
    }

    const result = await prisma.$transaction(async (transaction) => {
      const record = await transaction.jobRecord.update({
        where: { idempotencyKey: validPayload.idempotencyKey },
        data: {
          status: "active",
          attemptCount: job.attemptsMade + 1,
          events: {
            create: {
              status: "active",
              message: "Worker started job",
              metadata: { attempt: job.attemptsMade + 1 }
            }
          }
        }
      });

      const beforeCount = await transaction.task.count({
        where: {
          projectId: validPayload.projectId,
          importBatchId: validPayload.idempotencyKey
        }
      });

      for (const task of validPayload.tasks) {
        await transaction.task.upsert({
          where: {
            projectId_importBatchId_title: {
              projectId: validPayload.projectId,
              importBatchId: validPayload.idempotencyKey,
              title: task.title
            }
          },
          update: {
            completed: task.completed
          },
          create: {
            projectId: validPayload.projectId,
            title: task.title,
            completed: task.completed,
            importBatchId: validPayload.idempotencyKey
          }
        });
      }

      const afterCount = await transaction.task.count({
        where: {
          projectId: validPayload.projectId,
          importBatchId: validPayload.idempotencyKey
        }
      });

      const importResult: ImportTasksJobResult = {
        projectId: validPayload.projectId,
        imported: Math.max(0, afterCount - beforeCount),
        skipped: validPayload.tasks.length - Math.max(0, afterCount - beforeCount),
        total: validPayload.tasks.length
      };

      await transaction.jobRecord.update({
        where: { id: record.id },
        data: {
          status: "completed",
          result: importResult as unknown as Prisma.InputJsonValue,
          events: {
            create: {
              status: "completed",
              message: "Worker completed job",
              metadata: importResult as unknown as Prisma.InputJsonValue
            }
          }
        }
      });

      return importResult;
    });

    await invalidateProjectSummary(validPayload.projectId);
    recordJobCompleted(IMPORT_TASKS_JOB_NAME, Date.now() - startedAt);
    return result;
  } catch (error: unknown) {
    const failureClass = classifyJobFailure(error);
    const failureIdempotencyKey = payload?.idempotencyKey ?? readFailureIdempotencyKey(job.data);

    if (failureIdempotencyKey) {
      const existingRecord = await prisma.jobRecord.findUnique({
        where: { idempotencyKey: failureIdempotencyKey },
        select: { id: true }
      });

      if (existingRecord) {
        await prisma.jobRecord.update({
          where: { id: existingRecord.id },
          data: {
            status: "failed",
            attemptCount: job.attemptsMade + 1,
            failureClass,
            failureCode: error instanceof Error ? error.constructor.name : "UnknownError",
            events: {
              create: {
                status: "failed",
                message: "Worker failed job",
                metadata: { failureClass }
              }
            }
          }
        });
      }
    }

    recordJobFailed(IMPORT_TASKS_JOB_NAME, failureClass, Date.now() - startedAt);
    throw error;
  }
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/src/worker/processor.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
`mini-projects/distributed-task-platform-lab/src/worker/processor.ts` 属于最终项目，不建议脱离项目依赖直接运行；通过 `npm run typecheck`、`npm test -- --test-concurrency=1` 或与该边界对应的 runtime check script 观察。

**预期输出：**  
可观察输出应证明：Worker service 拥有后台副作用、状态推进和 cache invalidation。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 BullMQ 把 job 交给 processor；值是 job.data、attemptsMade、payload、result；资源是 worker process、Redis connection、DB connection；观察信号是 worker:check completed。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
completed 来自 DB transaction 成功提交；invalid payload 会 permanent fail，catch 不能二次 parse 覆盖原始错误。

**contrast：**  
对比 API service：API 拥有 request/response，worker 拥有 job side effect 和 cleanup。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 API service：API 拥有 request/response，worker 拥有 job side effect 和 cleanup。 这违反的规则是：processor 入口必须重新验证 payload；invalid payload 是 permanent failure；成功 commit 后再 invalidation；shutdown 要关闭 worker 和连接。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/src/worker/processor.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 payload contract、idempotency 和 cache consistency 合在一个 runtime。

**final memory model：**  
Worker service 拥有后台副作用、状态推进和 cache invalidation。

<a id="section-9-17"></a>

### 9.17 Multi-service Docker Compose：api、worker、postgres、redis、nginx

**结论：**  
Compose 本地模拟 api、worker、postgres、redis、nginx 的运行拓扑。

**本节解决的问题：**  
它解决只看容器启动、却没有证明服务 readiness 和公共代理入口的问题。

**技术意义：**  
技术意义在于用本地 Compose 观察进程、网络、volume、proxy 和 healthcheck。

**概念解释：**  
Compose 本地模拟 api、worker、postgres、redis、nginx 的运行拓扑。 它解决只看容器启动、却没有证明服务 readiness 和公共代理入口的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 docker compose up；值是 service definitions、env、healthcheck command；资源是 containers/network/volume；观察信号是 docker compose ps。

**底层机制：**  
触发点是 docker compose up；值是 service definitions、env、healthcheck command；资源是 containers/network/volume；观察信号是 docker compose ps。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 PostgreSQL 18 volume target 使用 /var/lib/postgresql；api healthcheck 使用 /v1/health/ready；nginx 只等待 healthy api；public traffic 走 8080。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/compose.yaml</span>
  </div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: distributed_task_platform_lab
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - task-postgres-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d distributed_task_platform_lab"]
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
    command: ["node", "dist/src/api/server.js"]
    environment:
      NODE_ENV: production
      PORT: 3030
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/distributed_task_platform_lab
      REDIS_URL: redis://redis:6379
      ALLOWED_ORIGINS: http://localhost:8080,http://127.0.0.1:8080
      TRUST_PROXY: "1"
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
      HTTP_REQUEST_TIMEOUT_MS: 30000
      HTTP_HEADERS_TIMEOUT_MS: 10000
      HTTP_KEEP_ALIVE_TIMEOUT_MS: 5000
      DEPENDENCY_TIMEOUT_MS: 1000
      REDIS_CONNECT_TIMEOUT_MS: 1000
      JOB_TIMEOUT_MS: 15000
      WORKER_CONCURRENCY: 2
      CACHE_TTL_SECONDS: 60
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3030/v1/health/ready').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 12

  worker:
    build:
      context: .
    command: ["node", "dist/src/worker/worker.js"]
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/distributed_task_platform_lab
      REDIS_URL: redis://redis:6379
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
      DEPENDENCY_TIMEOUT_MS: 1000
      REDIS_CONNECT_TIMEOUT_MS: 1000
      JOB_TIMEOUT_MS: 15000
      WORKER_CONCURRENCY: 2
      CACHE_TTL_SECONDS: 60
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "test -f /tmp/distributed-task-worker-ready"]
      interval: 10s
      timeout: 5s
      retries: 12

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
  task-postgres-data:
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/compose.yaml` 不是文件清单，而是机制观察点。

**运行方式：**  
在最终项目目录运行 `docker compose config` 和后续 Compose validation；本节重点观察 services、healthcheck、ports 与 volume target。

**预期输出：**  
可观察输出应证明：Compose 本地模拟 api、worker、postgres、redis、nginx 的运行拓扑。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 docker compose up；值是 service definitions、env、healthcheck command；资源是 containers/network/volume；观察信号是 docker compose ps。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
如果 nginx 依赖 liveness，可能在 DB/Redis 未就绪时接流量；ready 能证明依赖检查已经通过。

**contrast：**  
对比直接 npm start：单进程启动验证不了 proxy、container DNS、volume 和 service health。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比直接 npm start：单进程启动验证不了 proxy、container DNS、volume 和 service health。 这违反的规则是：PostgreSQL 18 volume target 使用 /var/lib/postgresql；api healthcheck 使用 /v1/health/ready；nginx 只等待 healthy api；public traffic 走 8080。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/compose.yaml` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把前面所有 runtime owner 放进同一个可运行拓扑。

**final memory model：**  
Compose 本地模拟 api、worker、postgres、redis、nginx 的运行拓扑。

<a id="section-9-18"></a>

### 9.18 Health and readiness：API readiness、worker readiness、dependency checks

**结论：**  
liveness 看进程是否活着，readiness 看服务是否能接流量。

**本节解决的问题：**  
它解决单一 health endpoint 永远返回 200 隐藏依赖不可用的问题。

**技术意义：**  
技术意义在于让 Compose、NGINX 或 orchestrator 根据正确信号转发流量。

**概念解释：**  
liveness 看进程是否活着，readiness 看服务是否能接流量。 它解决单一 health endpoint 永远返回 200 隐藏依赖不可用的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 GET /v1/health/ready 或 container healthcheck；值是 dependency status；资源是 HTTP socket、DB/Redis socket、worker process；观察信号是 200/503。

**底层机制：**  
触发点是 GET /v1/health/ready 或 container healthcheck；值是 dependency status；资源是 HTTP socket、DB/Redis socket、worker process；观察信号是 200/503。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 live 不应深度依赖外部系统；ready 必须有 dependency timeout；worker readiness 要在 processor ready 后成立。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/health/health.service.ts</span>
  </div>

```ts
import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";
import { taskQueue } from "../queue/task-queue.js";
import { queueDepthGauge } from "../observability/metrics.js";
import { TASK_IMPORT_QUEUE_NAME } from "../queue/queue-names.js";

export async function liveStatus(): Promise<{ status: "live" }> {
  return { status: "live" };
}

export async function readyStatus(): Promise<{ status: "ready" | "not_ready"; dependencies: Record<string, boolean> }> {
  const [database, redis] = await Promise.all([checkDatabaseHealth(), checkRedisHealth()]);
  let queue = false;
  try {
    const counts = await taskQueue.getJobCounts("waiting", "active", "delayed", "failed");
    const depth = counts.waiting + counts.active + counts.delayed;
    queueDepthGauge.set({ queue_name: TASK_IMPORT_QUEUE_NAME }, depth);
    queue = true;
  } catch {
    queue = false;
  }

  const dependencies = { database, redis, queue };
  return {
    status: Object.values(dependencies).every(Boolean) ? "ready" : "not_ready",
    dependencies
  };
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/src/health/health.service.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
`mini-projects/distributed-task-platform-lab/src/health/health.service.ts` 属于最终项目，不建议脱离项目依赖直接运行；通过 `npm run typecheck`、`npm test -- --test-concurrency=1` 或与该边界对应的 runtime check script 观察。

**预期输出：**  
可观察输出应证明：liveness 看进程是否活着，readiness 看服务是否能接流量。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 GET /v1/health/ready 或 container healthcheck；值是 dependency status；资源是 HTTP socket、DB/Redis socket、worker process；观察信号是 200/503。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
ready=200 是因为 DB、Redis 和 queue 都可访问；只检查 live 会放行未准备好的 API。

**contrast：**  
对比 liveness：liveness 适合重启判断，readiness 适合流量接入判断。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 liveness：liveness 适合重启判断，readiness 适合流量接入判断。 这违反的规则是：live 不应深度依赖外部系统；ready 必须有 dependency timeout；worker readiness 要在 processor ready 后成立。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/src/health/health.service.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它解释 Compose healthcheck 为什么使用 ready。

**final memory model：**  
liveness 看进程是否活着，readiness 看服务是否能接流量。

<a id="section-9-19"></a>

### 9.19 Observability：job metrics、queue depth、cache hit/miss、correlation id

**结论：**  
metrics 聚合低基数趋势，logs/events 追踪单次请求或 job。

**本节解决的问题：**  
它解决把 jobId、userId、raw URL 或 correlationId 放进 metric label 的高基数问题。

**技术意义：**  
技术意义在于观察 queue depth、duration、failure class、cache hit/miss，同时保留单次故障追踪。

**概念解释：**  
metrics 聚合低基数趋势，logs/events 追踪单次请求或 job。 它解决把 jobId、userId、raw URL 或 correlationId 放进 metric label 的高基数问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是 request、enqueue、worker complete/fail、cache read；值是 route pattern、status class、job name、cache name；资源是 in-memory metrics registry；观察信号是 /v1/metrics。

**底层机制：**  
触发点是 request、enqueue、worker complete/fail、cache read；值是 route pattern、status class、job name、cache name；资源是 in-memory metrics registry；观察信号是 /v1/metrics。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 metric label 只能使用低基数字段；correlationId 留在 logs/events。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/metrics.ts</span>
  </div>

```ts
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from "prom-client";

export const metricsRegistry = new Registry();
metricsRegistry.setDefaultLabels({ app: "distributed_task_platform_lab" });
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "HTTP requests by method, route pattern, and status class",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const problemResponseCounter = new Counter({
  name: "api_problem_responses_total",
  help: "Problem responses by code and status class",
  labelNames: ["code", "status_class"] as const,
  registers: [metricsRegistry]
});

export const jobQueuedCounter = new Counter({
  name: "jobs_queued_total",
  help: "Jobs queued by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobStartedCounter = new Counter({
  name: "jobs_started_total",
  help: "Jobs started by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobCompletedCounter = new Counter({
  name: "jobs_completed_total",
  help: "Jobs completed by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobFailedCounter = new Counter({
  name: "jobs_failed_total",
  help: "Jobs failed by job name and failure class",
  labelNames: ["job_name", "failure_class"] as const,
  registers: [metricsRegistry]
});

export const jobRetryCounter = new Counter({
  name: "jobs_retried_total",
  help: "Job retries by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobDurationHistogram = new Histogram({
  name: "job_duration_seconds",
  help: "Job duration by job name and result",
  labelNames: ["job_name", "result"] as const,
  buckets: [0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry]
});

export const queueDepthGauge = new Gauge({
  name: "queue_depth",
  help: "Queue depth by queue name",
  labelNames: ["queue_name"] as const,
  registers: [metricsRegistry]
});

export const cacheHitCounter = new Counter({
  name: "cache_hits_total",
  help: "Cache hits by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const cacheMissCounter = new Counter({
  name: "cache_misses_total",
  help: "Cache misses by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const cacheInvalidationCounter = new Counter({
  name: "cache_invalidations_total",
  help: "Cache invalidations by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const workerReadinessGauge = new Gauge({
  name: "worker_readiness",
  help: "Worker readiness signal",
  labelNames: ["worker_name"] as const,
  registers: [metricsRegistry]
});

export function statusClass(statusCode: number): string {
  return `${Math.trunc(statusCode / 100)}xx`;
}

export function recordProblemResponse(code: string, status: number): void {
  problemResponseCounter.inc({ code, status_class: statusClass(status) });
}
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/src/observability/metrics.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
`mini-projects/distributed-task-platform-lab/src/observability/metrics.ts` 属于最终项目，不建议脱离项目依赖直接运行；通过 `npm run typecheck`、`npm test -- --test-concurrency=1` 或与该边界对应的 runtime check script 观察。

**预期输出：**  
可观察输出应证明：metrics 聚合低基数趋势，logs/events 追踪单次请求或 job。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是 request、enqueue、worker complete/fail、cache read；值是 route pattern、status class、job name、cache name；资源是 in-memory metrics registry；观察信号是 /v1/metrics。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果可聚合是因为 label 值集合有限；raw URL 或 job id 会为每次请求创建新序列。

**contrast：**  
对比 tracing：tracing/logs 适合单次链路，metrics 适合系统趋势和告警。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 tracing：tracing/logs 适合单次链路，metrics 适合系统趋势和告警。 这违反的规则是：metric label 只能使用低基数字段；correlationId 留在 logs/events。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/src/observability/metrics.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 queue、worker、cache 的可观察结果连到平台治理。

**final memory model：**  
metrics 聚合低基数趋势，logs/events 追踪单次请求或 job。

<a id="section-9-20"></a>

### 9.20 Contract continuity：OpenAPI for HTTP, job contract for queue

**结论：**  
OpenAPI 描述 public HTTP，job contract 描述内部 queue payload。

**本节解决的问题：**  
它解决把 BullMQ delivery 细节写进 OpenAPI 或只写 job contract 却无法指导 HTTP 调用方的问题。

**技术意义：**  
技术意义在于保持 Chapter 14 的 contract governance，同时把 contract 思维迁移到 queue consumer。

**概念解释：**  
OpenAPI 描述 public HTTP，job contract 描述内部 queue payload。 它解决把 BullMQ delivery 细节写进 OpenAPI 或只写 job contract 却无法指导 HTTP 调用方的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是客户端按 OpenAPI 调 POST，API 按 job contract 构造 payload；值是 request body、response body、job payload；资源是 HTTP socket 与 Redis job；观察信号是 OpenAPI path 与 job schema 各自存在。

**底层机制：**  
触发点是客户端按 OpenAPI 调 POST，API 按 job contract 构造 payload；值是 request body、response body、job payload；资源是 HTTP socket 与 Redis job；观察信号是 OpenAPI path 与 job schema 各自存在。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 project 保留 openapi: 3.1.1 以兼容本地 YAML 工具；官方最新参考为 OpenAPI 3.2.0；OpenAPI 不暴露 Redis key、attempts 或 stack trace。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/openapi/openapi.yaml</span>
  </div>

```txt
openapi: 3.1.1
info:
  title: Distributed Task Platform Lab API
  version: 1.0.0
servers:
  - url: http://localhost:8080
paths:
  /v1/health/live:
    get:
      operationId: getHealthLive
      responses:
        "200":
          description: Live status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthStatus"
  /v1/health/ready:
    get:
      operationId: getHealthReady
      responses:
        "200":
          description: Ready status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadinessStatus"
        "503":
          $ref: "#/components/responses/ProblemResponse"
  /v1/metrics:
    get:
      operationId: getMetrics
      responses:
        "200":
          description: Prometheus metrics
  /v1/projects:
    get:
      operationId: listProjects
      responses:
        "200":
          description: Project list
          content:
            application/json:
              schema:
                type: object
                properties:
                  projects:
                    type: array
                    items:
                      $ref: "#/components/schemas/Project"
    post:
      operationId: createProject
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateProjectRequest"
      responses:
        "201":
          description: Created project
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Project"
        "400":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}:
    get:
      operationId: getProjectById
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Project
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Project"
        "404":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}/summary:
    get:
      operationId: getProjectSummary
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Cached project summary
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProjectSummary"
        "404":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}/tasks:
    get:
      operationId: listProjectTasks
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Task list
          content:
            application/json:
              schema:
                type: object
                properties:
                  tasks:
                    type: array
                    items:
                      $ref: "#/components/schemas/Task"
    post:
      operationId: createProjectTask
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "201":
          description: Created task
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Task"
        "400":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}/tasks/import:
    post:
      operationId: importProjectTasks
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "202":
          description: Import job accepted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobStatus"
        "400":
          $ref: "#/components/responses/ProblemResponse"
  /v1/jobs/{jobId}:
    get:
      operationId: getJobStatus
      parameters:
        - $ref: "#/components/parameters/JobId"
      responses:
        "200":
          description: Job status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobStatus"
        "404":
          $ref: "#/components/responses/ProblemResponse"
  /v1/jobs/{jobId}/events:
    get:
      operationId: getJobEvents
      parameters:
        - $ref: "#/components/parameters/JobId"
      responses:
        "200":
          description: Safe job events
          content:
            application/json:
              schema:
                type: object
                properties:
                  events:
                    type: array
                    items:
                      $ref: "#/components/schemas/JobEvent"
  /v1/jobs/{jobId}/retry:
    post:
      operationId: retryJob
      parameters:
        - $ref: "#/components/parameters/JobId"
      responses:
        "202":
          description: Job retry accepted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobStatus"
        "409":
          $ref: "#/components/responses/ProblemResponse"
  /v1/architecture/service-boundary:
    get:
      operationId: getServiceBoundary
      responses:
        "200":
          description: Service boundary notes
  /v1/architecture/migration-plan:
    get:
      operationId: getMigrationPlan
      responses:
        "200":
          description: Migration plan
  /v1/cache-demo/projects/{projectId}/summary:
    get:
      operationId: getCacheDemoProjectSummary
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Cache demo summary
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProjectSummary"
  /v1/cache-demo/projects/{projectId}/invalidate:
    post:
      operationId: invalidateCacheDemoProjectSummary
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Cache invalidation result
          content:
            application/json:
              schema:
                type: object
                properties:
                  invalidated:
                    type: boolean
components:
  parameters:
    ProjectId:
      name: projectId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    JobId:
      name: jobId
      in: path
      required: true
      schema:
        type: string
  responses:
    ProblemResponse:
      description: Problem Details response
      content:
        application/problem+json:
          schema:
            $ref: "#/components/schemas/ProblemDetails"
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
    ReadinessStatus:
      type: object
      properties:
        status:
          type: string
        dependencies:
          type: object
    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        title:
          type: string
        completed:
          type: boolean
    CreateProjectRequest:
      type: object
      required: [name]
      properties:
        name:
          type: string
        description:
          type: string
    JobStatus:
      type: object
      properties:
        jobId:
          type: string
        jobName:
          type: string
        payloadVersion:
          type: string
        status:
          type: string
        attemptCount:
          type: integer
        failureClass:
          type: string
          nullable: true
        result:
          type: object
          nullable: true
    JobEvent:
      type: object
      properties:
        id:
          type: string
          format: uuid
        status:
          type: string
        message:
          type: string
        createdAt:
          type: string
          format: date-time
    ProjectSummary:
      type: object
      properties:
        projectId:
          type: string
          format: uuid
        taskCount:
          type: integer
        completedTaskCount:
          type: integer
        cacheStatus:
          type: string
          enum: [hit, miss]
    ProblemDetails:
      type: object
      required: [type, title, status, detail, instance, code]
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
        code:
          type: string
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/openapi/openapi.yaml` 不是文件清单，而是机制观察点。

**运行方式：**  
在最终项目目录用 YAML 解析或 contract test 检查 OpenAPI；本节重点确认 HTTP contract 不包含内部 queue delivery 字段。

**预期输出：**  
可观察输出应证明：OpenAPI 描述 public HTTP，job contract 描述内部 queue payload。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是客户端按 OpenAPI 调 POST，API 按 job contract 构造 payload；值是 request body、response body、job payload；资源是 HTTP socket 与 Redis job；观察信号是 OpenAPI path 与 job schema 各自存在。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果正确是因为 public contract 和 internal contract 各自有 owner；混用会泄漏实现并阻塞后续换 queue。

**contrast：**  
对比 gRPC/protobuf：也能描述内部消息，但本项目选择 TypeScript/Zod job contract，OpenAPI 只留给 HTTP。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 gRPC/protobuf：也能描述内部消息，但本项目选择 TypeScript/Zod job contract，OpenAPI 只留给 HTTP。 这违反的规则是：project 保留 openapi: 3.1.1 以兼容本地 YAML 工具；官方最新参考为 OpenAPI 3.2.0；OpenAPI 不暴露 Redis key、attempts 或 stack trace。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/openapi/openapi.yaml` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它直接承接 Chapter 14 的 API governance，但扩展到 worker 消息边界。

**final memory model：**  
OpenAPI 描述 public HTTP，job contract 描述内部 queue payload。

<a id="section-9-21"></a>

### 9.21 Migration plan：modular monolith 到 worker service

**结论：**  
迁移应按可验证步骤推进，不是一次性追求 microservices。

**本节解决的问题：**  
它解决先创建新服务再回头找 owner、表和同步契约的问题。

**技术意义：**  
技术意义在于降低演进风险：每一步都有 signal、rollback 和兼容策略。

**概念解释：**  
迁移应按可验证步骤推进，不是一次性追求 microservices。 它解决先创建新服务再回头找 owner、表和同步契约的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是决定迁移一个长任务；值是 step、owner、rollbackSignal、validationCommand；资源从单进程逐步扩展到 worker process；观察信号是每步命令通过。

**底层机制：**  
触发点是决定迁移一个长任务；值是 step、owner、rollbackSignal、validationCommand；资源从单进程逐步扩展到 worker process；观察信号是每步命令通过。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是每步必须有验证命令和回滚信号；payload contract 先于 worker；idempotency 先于 retry；监控先于扩大流量。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/architecture/migration-plan.ts</span>
  </div>

```ts
export const migrationPlan = [
  {
    step: "Keep domain modules inside one deployable API",
    signal: "Imports cross modules only through service functions"
  },
  {
    step: "Move slow retryable side effects behind a job contract",
    signal: "HTTP returns a job id instead of waiting for task import completion"
  },
  {
    step: "Run worker as a separate service",
    signal: "Compose has api and worker services sharing PostgreSQL and Redis"
  },
  {
    step: "Observe idempotency, retries, and cache invalidation",
    signal: "Checks prove duplicate imports do not create duplicate rows"
  }
] as const;
```
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/src/architecture/migration-plan.ts` 不是文件清单，而是机制观察点。

**运行方式：**  
`mini-projects/distributed-task-platform-lab/src/architecture/migration-plan.ts` 属于最终项目，不建议脱离项目依赖直接运行；通过 `npm run typecheck`、`npm test -- --test-concurrency=1` 或与该边界对应的 runtime check script 观察。

**预期输出：**  
可观察输出应证明：迁移应按可验证步骤推进，不是一次性追求 microservices。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是决定迁移一个长任务；值是 step、owner、rollbackSignal、validationCommand；资源从单进程逐步扩展到 worker process；观察信号是每步命令通过。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果安全是因为每一步都能停止或回滚；没有 signal 的迁移无法判断是否可以继续。

**contrast：**  
对比 big bang rewrite：阶段迁移保留旧入口和验证信号，big bang 把风险集中到发布日。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比 big bang rewrite：阶段迁移保留旧入口和验证信号，big bang 把风险集中到发布日。 这违反的规则是：每步必须有验证命令和回滚信号；payload contract 先于 worker；idempotency 先于 retry；监控先于扩大流量。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/src/architecture/migration-plan.ts` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它把 modular monolith 到 contract continuity 串成演进路线。

**final memory model：**  
迁移应按可验证步骤推进，不是一次性追求 microservices。

<a id="section-9-22"></a>

### 9.22 Chapter integration: distributed-task-platform-lab

**结论：**  
最终项目把 HTTP、queue、worker、DB、cache、proxy、health、metrics 串成可验证链。

**本节解决的问题：**  
它解决只看文件结构却没有运行时信号证明架构边界的问题。

**技术意义：**  
技术意义在于把本章机制落到 learning-oriented production simulation。

**概念解释：**  
最终项目把 HTTP、queue、worker、DB、cache、proxy、health、metrics 串成可验证链。 它解决只看文件结构却没有运行时信号证明架构边界的问题。

**边界：**  
本节边界按语法、JavaScript runtime、Node/API resource、TypeScript checker、tooling validation 和 project owner 来划分；核心证据是：触发点是完整 validation chain；值是 HTTP request、job payload、DB rows、Redis keys、metrics samples；资源是 Express、BullMQ、Prisma、Redis、Compose；观察信号是 smoke/check scripts。

**底层机制：**  
触发点是完整 validation chain；值是 HTTP request、job payload、DB rows、Redis keys、metrics samples；资源是 Express、BullMQ、Prisma、Redis、Compose；观察信号是 smoke/check scripts。 TypeScript 只检查源码形状，外部输入、queue message、database row、Redis key 和 Compose health 都必须靠运行时信号证明。

**API / 配置 / 命令规则：**  
规则是 public URL 默认 8080；worker 不暴露公共端口；PostgreSQL 18 volume target 正确；scripts 每个观察一个边界。

**示例代码 or config：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/README.md</span>
  </div>

````txt
# Distributed Task Platform Lab

This mini project demonstrates a local Node.js architecture lab with an API service, a worker service, PostgreSQL persistence, Redis-backed BullMQ jobs, cache-aside reads, explicit cache invalidation, low-cardinality metrics, and Docker Compose runtime boundaries.

It is not a full microservices platform. The API and worker are split only to expose queue, job, cache, readiness, shutdown, and idempotency mechanisms without adding service discovery, cloud infrastructure, Kafka, RabbitMQ, Kubernetes, or a frontend.

## Local setup

Windows PowerShell:

```powershell
npm install
npm run prisma:generate
npm run typecheck
npm run build
```

macOS/Linux:

```bash
npm install
npm run prisma:generate
npm run typecheck
npm run build
```

## Docker Compose runtime

```powershell
docker compose config
docker compose build --no-cache --progress=plain api worker
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api worker nginx
```

The public base URL is `http://localhost:8080`. The API container listens internally on port `3030`. The worker service does not expose a public host port.

## API and worker commands

```powershell
npm run dev:api
npm run dev:worker
npm run start:api
npm run start:worker
```

Production start scripts run built JavaScript from `dist`, not `tsx watch`.

## Validation commands

```powershell
npm test -- --test-concurrency=1
npm run smoke
npm run queue:check
npm run worker:check
npm run cache:check
npm run consistency:check
```

macOS/Linux environment override:

```bash
SMOKE_BASE_URL=http://localhost:8080 npm run smoke
```

Windows PowerShell environment override:

```powershell
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
Remove-Item Env:\SMOKE_BASE_URL
```

## Runtime endpoints

- `GET /v1/health/live`
- `GET /v1/health/ready`
- `GET /v1/metrics`
- `GET /v1/projects`
- `POST /v1/projects`
- `GET /v1/projects/:projectId`
- `GET /v1/projects/:projectId/summary`
- `GET /v1/projects/:projectId/tasks`
- `POST /v1/projects/:projectId/tasks`
- `POST /v1/projects/:projectId/tasks/import`
- `GET /v1/jobs/:jobId`
- `GET /v1/jobs/:jobId/events`
- `POST /v1/jobs/:jobId/retry`
- `GET /v1/architecture/service-boundary`
- `GET /v1/architecture/migration-plan`
- `GET /v1/cache-demo/projects/:projectId/summary`
- `POST /v1/cache-demo/projects/:projectId/invalidate`

## Job, retry, and idempotency

The import endpoint creates a `JobRecord`, enqueues a BullMQ job, and returns a public job id. The worker validates the job payload, writes task rows with an idempotency key, updates the job record, stores safe job events, and invalidates the project summary cache. A duplicate idempotency key returns the existing job record and does not create duplicate task rows.

Retries are bounded. Transient failures can be retried with exponential backoff. Permanent validation failures are not treated as safe retry candidates. The project does not claim perfect exactly-once processing.

## Cache consistency

Project summaries use cache-aside reads. The first read can miss and fill Redis, the second read can hit Redis, worker imports invalidate the summary key, and TTL is a fallback rather than the main correctness mechanism.

## Stalled job and graceful shutdown

A stalled job means the worker lost the processing lock or stopped renewing it. This can happen when the process crashes or when the event loop is blocked for too long. Worker shutdown listens for process signals, closes the BullMQ Worker, Queue, QueueEvents, Redis client, and Prisma client, then lets Node exit when no active handles remain.

## Metrics

Prometheus-style metrics are exposed at `GET /v1/metrics`. Labels use route patterns, status classes, job names, failure classes, queue names, and cache names. They do not use user ids, project ids, job ids, raw URLs, query strings, tokens, Redis keys, or request bodies.

## Migration note

The migration path is modular monolith first, then worker extraction for slow retryable side effects, then a queue-backed worker service only when the boundary has a stable job contract and observable idempotency.

## Known limitations

- No authentication or authorization layer.
- No Kubernetes runtime files.
- No Kafka, RabbitMQ, service mesh, cloud provider SDK, GraphQL, gRPC, tRPC, or frontend.
- The OpenAPI file documents public HTTP only, not BullMQ internal delivery semantics.
````
</div>

**逐行解释：**  
按标题栏文件的 exported constants、input values、owner boundary 和 return shape 阅读。 逐行阅读时，先找触发输入，再找被创建的 JavaScript 值和外部资源，最后找输出或错误如何成为本节证据；标题栏 `mini-projects/distributed-task-platform-lab/README.md` 不是文件清单，而是机制观察点。

**运行方式：**  
`mini-projects/distributed-task-platform-lab/README.md` 属于最终项目，不建议脱离项目依赖直接运行；通过 `npm run typecheck`、`npm test -- --test-concurrency=1` 或与该边界对应的 runtime check script 观察。

**预期输出：**  
可观察输出应证明：最终项目把 HTTP、queue、worker、DB、cache、proxy、health、metrics 串成可验证链。 它可以是函数返回值、HTTP status、job status、metric、cacheStatus、Compose health 或测试断言，但不能只证明文件存在。

**执行过程：**  
执行顺序是：触发点是完整 validation chain；值是 HTTP request、job payload、DB rows、Redis keys、metrics samples；资源是 Express、BullMQ、Prisma、Redis、Compose；观察信号是 smoke/check scripts。 之后再把输出映射回本节的 owner boundary。

**why the result/error happens：**  
结果通过说明每个边界都被观察到；只 docker compose up 成功不能证明 worker、cache 或幂等正确。

**contrast：**  
对比单一 smoke：health endpoint 只能证明入口可达，专项脚本证明消息和一致性链路。

**common mistake and violated rule：**  
错误形式通常会落到本节的反例：对比单一 smoke：health endpoint 只能证明入口可达，专项脚本证明消息和一致性链路。 这违反的规则是：public URL 默认 8080；worker 不暴露公共端口；PostgreSQL 18 volume target 正确；scripts 每个观察一个边界。 真实项目中可通过对应的 status、metric、cacheStatus、healthcheck、日志或测试断言识别。

**real-project relationship：**  
在 `distributed-task-platform-lab` 中，本节机制对应 `mini-projects/distributed-task-platform-lab/README.md` 或同一 owner 下的相邻文件；验证时要看真实运行信号，而不是只看目录结构。

**current learning-path relationship：**  
它是 Chapter 15 的整合点，回扣 Chapter 14 的 API contract 并引出后续平台化学习。

**final memory model：**  
最终项目把 HTTP、queue、worker、DB、cache、proxy、health、metrics 串成可验证链。

## 10. API 与规则索引

| Rule | Owner | Fixed names or commands | Violation signal |
| --- | --- | --- | --- |
| Public HTTP base URL | NGINX and Compose | `http://localhost:8080` | smoke target bypasses NGINX |
| Job name | queue contract | `tasks.import` | worker rejects unknown job name |
| Payload version | queue contract | `version: "1"` | incompatible worker/parser behavior |
| Idempotency | PostgreSQL | unique `JobRecord.idempotencyKey`, unique task import batch title | duplicate task rows |
| Retry policy | BullMQ and processor | `attempts: 3`, exponential backoff | infinite retry or poison job loop |
| Cache key | Redis cache | `cache:v1:project-summary:<projectId>` | stale data or unbounded key labels |
| Metrics labels | observability | method, route pattern, status class, job name, failure class, queue/cache name | high-cardinality time series |
| Readiness | health service and Compose | `condition: service_healthy` | traffic reaches unready service |

## 11. 常见错误对照表

| Symptom | Violated Rule | Mechanism Cause | Evidence | Correction |
| --- | --- | --- | --- | --- |
| Duplicate imported tasks | retry must be idempotent | worker reapplies side effect without unique key | two rows share same import batch/title | add idempotency key and durable unique constraint |
| Smoke passes only on API port | production simulation must enter through NGINX | script bypasses proxy headers and runtime topology | base URL is `localhost:3030` | default checks to `http://localhost:8080` |
| Worker hangs during shutdown | process must close active handles | Worker, Queue, QueueEvents, Redis or Prisma stays open | container does not stop after signal | close all resources in signal handler |
| Readiness reports ready too early | startup order is not readiness | `depends_on` starts container but dependency is not healthy | logs show connection refused after startup | use healthcheck and `condition: service_healthy` |
| Metrics explode | labels must be low cardinality | job id or project id becomes a metric label | many unique series per request | use job name, route pattern and status class |
| Cache returns old summary | writes must invalidate derived reads | TTL has not expired after DB change | first/second read stays hit after import | invalidate cache in worker after commit |

## 12. 调试与验证方法

调试本章系统时，不要从“哪个文件有 bug”开始，而要从 owner 和 signal 开始：HTTP 问 status/body/header；queue 问 waiting/active/failed；worker 问 JobRecord 和 JobEvent；database 问 rows 和 constraints；cache 问 hit/miss/invalidation；runtime 问 healthcheck/logs/exit status。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
docker compose ps\ndocker compose logs --tail=120 api\ndocker compose logs --tail=120 worker\nnpm run queue:check\nnpm run worker:check\nnpm run cache:check\nnpm run consistency:check
```
</div>

这些命令分别观察不同边界。`docker compose ps` 只能说明 container state；`logs` 给出进程和 dependency 错误；check scripts 通过公共 HTTP 入口触发实际业务链路；`consistency:check` 专门证明 duplicate idempotency key 不会重复写 task。

## 13. 分项练习说明

| Practice area | Focus | Observation |
| --- | --- | --- |
| `01-service-boundary` | modular monolith、boundary dimension、worker decision、sync/async | 能解释为什么不是所有慢代码都拆服务 |
| `02-job-contract` | payload schema、version、idempotency、state machine | 能说清 TypeScript 与 runtime validation 的差别 |
| `03-queue-worker` | BullMQ producer/worker、retry、failed、stalled | 能识别 stalled、poison job 与 failed job 的不同 |
| `04-background-jobs` | CPU/I/O、report/import job、timeout、shutdown | 能解释 worker service 与 worker thread 的边界 |
| `05-cache-consistency` | cache-aside、invalidation、TTL、stale、stampede | 能证明 cache 是 derived state |
| `06-consistency` | transaction/outbox、eventual consistency、duplicate message | 能说明 DB transaction 不包含 Redis enqueue |
| `07-observability` | queue depth、duration、failure rate、hit/miss、correlation | 能设计低基数 metrics |
| `08-testing` | queue/worker/producer/cache test harness | 能把架构主张变成测试信号 |
| `09-integration` | Compose service map、readiness、runbook、migration | 能解释本地多服务运行边界 |

## 14. 最终迷你项目

最终小项目只用于整合本章机制，不替代前面的分节教学。它把一个 task platform 的批量导入能力拆成 API service 和 worker service：API 只负责验证 HTTP input、创建 job record、enqueue job 并返回 job id；worker 负责验证 queue payload、幂等写入 PostgreSQL、更新 job status、记录 safe events、失效 cache；NGINX 作为唯一公共入口暴露 `http://localhost:8080`。

### 14.1 项目目标

项目目标是构建 `distributed-task-platform-lab`：一个本地多服务 Node.js 后端实验。它不是完整 microservices 平台；它只保留本章需要观察的服务边界、queue、worker、PostgreSQL、Redis cache、metrics、readiness、graceful shutdown、NGINX 和 Docker Compose。

### 14.2 项目结构与职责

| Responsibility group | What it owns | Files | Runtime or validation signal | Common mistake prevented |
| --- | --- | --- | --- | --- |
| architecture boundary | 模块化单体到 worker service 的 owner、边界和迁移判断 | `src/architecture/service-boundary.ts`, `src/architecture/migration-plan.ts`, `README.md` | boundary tests can explain API, worker and data ownership | 把 microservices 当默认目标 |
| API service | HTTP request validation, project/task/job routes, enqueue and public status DTO | `src/api/app.ts`, `src/api/server.ts`, `src/modules/projects/*`, `src/modules/tasks/*`, `src/modules/jobs/*`, `src/modules/cache-demo/*` | POST import returns 202/job id; GET job status returns safe DTO | 在 HTTP handler 中执行长导入 |
| worker service | BullMQ worker startup, processor side effects, graceful shutdown and worker readiness | `src/worker/worker.ts`, `src/worker/processor.ts`, `src/worker/worker-health.ts`, `src/worker/worker-shutdown.ts` | worker health file, JobRecord status and `worker:check` prove completion | 让 worker 依赖 Express Request |
| queue/job contract | Internal queue payload name, version, schema, idempotency and correlation contract | `src/queue/job-contract.ts`, `src/queue/job-schemas.ts`, `src/queue/task-queue.ts`, `src/queue/queue-events.ts` | job name/version/schema/idempotencyKey/correlationId are fixed and tested | 把 unvalidated JSON 当 trusted payload |
| runtime validation | Untrusted params/body/env parsing before business logic | `src/shared/validation/validate-request.ts`, `src/config/env.ts`, `src/modules/*/*.schema.ts` | Zod parses body/params/env before handlers use values | 误以为 TypeScript 会验证 HTTP body |
| idempotency and retry | Duplicate delivery safety, retry classification and permanent/transient failure handling | `src/queue/retry-policy.ts`, `src/worker/processor.ts`, `prisma/schema.prisma`, `tests/idempotency.unit.test.ts`, `tests/retry-policy.unit.test.ts` | unique idempotency key and task composite unique constraint stop duplicates | retry non-idempotent side effects |
| cache consistency | Cache-aside read model, namespace keys, TTL and invalidation | `src/cache/cache-keys.ts`, `src/cache/cache-aside.ts`, `src/cache/cache-invalidation.ts`, `src/cache/stampede-guard.ts`, `src/modules/cache-demo/*` | `cache:check` observes miss, hit and invalidation | 只靠 TTL 解释正确性 |
| persistence | Durable facts, migrations, seed data and Prisma client boundary | `prisma/schema.prisma`, `prisma/migrations/0001_init/migration.sql`, `prisma/seed.ts`, `src/db/prisma.ts` | migrate deploy creates Project/Task/JobRecord/JobEvent and unique indexes | 把 Redis 当业务事实来源 |
| observability | Low-cardinality metrics, request/job/cache signals and correlation-safe logs | `src/observability/*.ts`, `src/health/*.ts` | `/v1/metrics`, requestId/correlationId logs and health/readiness checks | 使用 user id、job id、raw URL 作为 metric label |
| runtime/deployment | Container image, Compose topology, PostgreSQL 18 volume target and public NGINX proxy | `Dockerfile`, `compose.yaml`, `nginx/nginx.conf`, `.dockerignore` | Compose has api/worker/postgres/redis/nginx; api healthcheck uses readiness; NGINX exposes port 8080 | 把 `depends_on` 当 readiness 或绕过 NGINX smoke |
| validation scripts | Boundary-specific local runtime checks through the public base URL | `scripts/smoke-test.ts`, `scripts/wait-for-ready.ts`, `scripts/queue-check.ts`, `scripts/worker-check.ts`, `scripts/cache-check.ts`, `scripts/consistency-check.ts` | scripts each observe one boundary through `http://localhost:8080` | 只跑 build 就宣称运行时正确 |
| tests | Fast unit/integration verification of contracts, failure paths and open handles | `tests/*.test.ts` | `npm test -- --test-concurrency=1` covers boundary, contract, idempotency, retry, cache, API, queue, Redis and invalid worker payload | 删除断言或扩大 timeout 掩盖资源泄漏 |

### 14.3 完整项目代码

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/package.json</span>
  </div>

```json
{
  "name": "distributed-task-platform-lab",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev:api": "tsx watch src/api/server.ts",
    "dev:worker": "tsx watch src/worker/worker.ts",
    "build": "tsc -p tsconfig.json",
    "start:api": "node dist/src/api/server.js",
    "start:worker": "node dist/src/worker/worker.js",
    "typecheck": "tsc --noEmit",
    "test": "node --import tsx --test tests/env.unit.test.ts tests/service-boundary.unit.test.ts tests/job-contract.unit.test.ts tests/idempotency.unit.test.ts tests/retry-policy.unit.test.ts tests/cache-consistency.unit.test.ts tests/worker.unit.test.ts tests/api.integration.test.ts tests/queue.integration.test.ts tests/cache.integration.test.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "seed": "prisma db seed",
    "smoke": "tsx scripts/smoke-test.ts",
    "queue:check": "tsx scripts/queue-check.ts",
    "worker:check": "tsx scripts/worker-check.ts",
    "cache:check": "tsx scripts/cache-check.ts",
    "consistency:check": "tsx scripts/consistency-check.ts"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.9.1",
    "@prisma/client": "^7.9.1",
    "bullmq": "^6.0.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.6.1",
    "helmet": "^8.3.0",
    "ioredis": "^5.11.1",
    "pg": "^8.22.0",
    "pino": "^10.3.1",
    "prom-client": "^15.1.3",
    "redis": "^6.1.0",
    "yaml": "^2.9.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^26.1.1",
    "@types/pg": "^8.20.0",
    "@types/supertest": "^7.2.1",
    "prisma": "^7.9.1",
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
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tsconfig.json</span>
  </div>

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "lib": ["ES2024"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": ".",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts", "prisma/**/*.ts", "prisma.config.ts"]
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/.env.example</span>
  </div>

```txt
NODE_ENV=development
PORT=3030
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/distributed_task_platform_lab
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
TRUST_PROXY=1
LOG_LEVEL=info
SHUTDOWN_TIMEOUT_MS=10000
HTTP_REQUEST_TIMEOUT_MS=30000
HTTP_HEADERS_TIMEOUT_MS=10000
HTTP_KEEP_ALIVE_TIMEOUT_MS=5000
DEPENDENCY_TIMEOUT_MS=1000
REDIS_CONNECT_TIMEOUT_MS=1000
JOB_TIMEOUT_MS=15000
WORKER_CONCURRENCY=2
CACHE_TTL_SECONDS=60
SMOKE_BASE_URL=http://localhost:8080
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/.dockerignore</span>
  </div>

```txt
node_modules
dist
npm-debug.log
.env
.git
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/Dockerfile</span>
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
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/openapi ./openapi
EXPOSE 3030
CMD ["node", "dist/src/api/server.js"]
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/compose.yaml</span>
  </div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: distributed_task_platform_lab
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - task-postgres-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d distributed_task_platform_lab"]
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
    command: ["node", "dist/src/api/server.js"]
    environment:
      NODE_ENV: production
      PORT: 3030
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/distributed_task_platform_lab
      REDIS_URL: redis://redis:6379
      ALLOWED_ORIGINS: http://localhost:8080,http://127.0.0.1:8080
      TRUST_PROXY: "1"
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
      HTTP_REQUEST_TIMEOUT_MS: 30000
      HTTP_HEADERS_TIMEOUT_MS: 10000
      HTTP_KEEP_ALIVE_TIMEOUT_MS: 5000
      DEPENDENCY_TIMEOUT_MS: 1000
      REDIS_CONNECT_TIMEOUT_MS: 1000
      JOB_TIMEOUT_MS: 15000
      WORKER_CONCURRENCY: 2
      CACHE_TTL_SECONDS: 60
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3030/v1/health/ready').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 12

  worker:
    build:
      context: .
    command: ["node", "dist/src/worker/worker.js"]
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/distributed_task_platform_lab
      REDIS_URL: redis://redis:6379
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
      DEPENDENCY_TIMEOUT_MS: 1000
      REDIS_CONNECT_TIMEOUT_MS: 1000
      JOB_TIMEOUT_MS: 15000
      WORKER_CONCURRENCY: 2
      CACHE_TTL_SECONDS: 60
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "test -f /tmp/distributed-task-worker-ready"]
      interval: 10s
      timeout: 5s
      retries: 12

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
  task-postgres-data:
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/nginx/nginx.conf</span>
  </div>

```txt
upstream distributed_task_api {
  server api:3030;
}

server {
  listen 80;
  server_name localhost;

  location / {
    proxy_pass http://distributed_task_api;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Request-Id $request_id;
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/README.md</span>
  </div>

````txt
# Distributed Task Platform Lab

This mini project demonstrates a local Node.js architecture lab with an API service, a worker service, PostgreSQL persistence, Redis-backed BullMQ jobs, cache-aside reads, explicit cache invalidation, low-cardinality metrics, and Docker Compose runtime boundaries.

It is not a full microservices platform. The API and worker are split only to expose queue, job, cache, readiness, shutdown, and idempotency mechanisms without adding service discovery, cloud infrastructure, Kafka, RabbitMQ, Kubernetes, or a frontend.

## Local setup

Windows PowerShell:

```powershell
npm install
npm run prisma:generate
npm run typecheck
npm run build
```

macOS/Linux:

```bash
npm install
npm run prisma:generate
npm run typecheck
npm run build
```

## Docker Compose runtime

```powershell
docker compose config
docker compose build --no-cache --progress=plain api worker
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api worker nginx
```

The public base URL is `http://localhost:8080`. The API container listens internally on port `3030`. The worker service does not expose a public host port.

## API and worker commands

```powershell
npm run dev:api
npm run dev:worker
npm run start:api
npm run start:worker
```

Production start scripts run built JavaScript from `dist`, not `tsx watch`.

## Validation commands

```powershell
npm test -- --test-concurrency=1
npm run smoke
npm run queue:check
npm run worker:check
npm run cache:check
npm run consistency:check
```

macOS/Linux environment override:

```bash
SMOKE_BASE_URL=http://localhost:8080 npm run smoke
```

Windows PowerShell environment override:

```powershell
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
Remove-Item Env:\SMOKE_BASE_URL
```

## Runtime endpoints

- `GET /v1/health/live`
- `GET /v1/health/ready`
- `GET /v1/metrics`
- `GET /v1/projects`
- `POST /v1/projects`
- `GET /v1/projects/:projectId`
- `GET /v1/projects/:projectId/summary`
- `GET /v1/projects/:projectId/tasks`
- `POST /v1/projects/:projectId/tasks`
- `POST /v1/projects/:projectId/tasks/import`
- `GET /v1/jobs/:jobId`
- `GET /v1/jobs/:jobId/events`
- `POST /v1/jobs/:jobId/retry`
- `GET /v1/architecture/service-boundary`
- `GET /v1/architecture/migration-plan`
- `GET /v1/cache-demo/projects/:projectId/summary`
- `POST /v1/cache-demo/projects/:projectId/invalidate`

## Job, retry, and idempotency

The import endpoint creates a `JobRecord`, enqueues a BullMQ job, and returns a public job id. The worker validates the job payload, writes task rows with an idempotency key, updates the job record, stores safe job events, and invalidates the project summary cache. A duplicate idempotency key returns the existing job record and does not create duplicate task rows.

Retries are bounded. Transient failures can be retried with exponential backoff. Permanent validation failures are not treated as safe retry candidates. The project does not claim perfect exactly-once processing.

## Cache consistency

Project summaries use cache-aside reads. The first read can miss and fill Redis, the second read can hit Redis, worker imports invalidate the summary key, and TTL is a fallback rather than the main correctness mechanism.

## Stalled job and graceful shutdown

A stalled job means the worker lost the processing lock or stopped renewing it. This can happen when the process crashes or when the event loop is blocked for too long. Worker shutdown listens for process signals, closes the BullMQ Worker, Queue, QueueEvents, Redis client, and Prisma client, then lets Node exit when no active handles remain.

## Metrics

Prometheus-style metrics are exposed at `GET /v1/metrics`. Labels use route patterns, status classes, job names, failure classes, queue names, and cache names. They do not use user ids, project ids, job ids, raw URLs, query strings, tokens, Redis keys, or request bodies.

## Migration note

The migration path is modular monolith first, then worker extraction for slow retryable side effects, then a queue-backed worker service only when the boundary has a stable job contract and observable idempotency.

## Known limitations

- No authentication or authorization layer.
- No Kubernetes runtime files.
- No Kafka, RabbitMQ, service mesh, cloud provider SDK, GraphQL, gRPC, tRPC, or frontend.
- The OpenAPI file documents public HTTP only, not BullMQ internal delivery semantics.
````
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/prisma.config.ts</span>
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
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/distributed_task_platform_lab"
  }
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/prisma/schema.prisma</span>
  </div>

```txt
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Project {
  id          String      @id @default(uuid()) @db.Uuid
  name        String
  description String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  tasks       Task[]
  jobRecords  JobRecord[]
}

model Task {
  id            String   @id @default(uuid()) @db.Uuid
  projectId     String   @db.Uuid
  title         String
  completed     Boolean  @default(false)
  importBatchId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@unique([projectId, importBatchId, title])
}

model JobRecord {
  id             String     @id @default(uuid()) @db.Uuid
  jobId          String     @unique
  jobName        String
  payloadVersion String
  idempotencyKey String     @unique
  correlationId  String
  status         String
  attemptCount   Int        @default(0)
  failureClass   String?
  failureCode    String?
  payload        Json
  result         Json?
  projectId      String?    @db.Uuid
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  project        Project?   @relation(fields: [projectId], references: [id], onDelete: SetNull)
  events         JobEvent[]

  @@index([status])
  @@index([projectId])
}

model JobEvent {
  id          String    @id @default(uuid()) @db.Uuid
  jobRecordId String    @db.Uuid
  status      String
  message     String
  metadata    Json?
  createdAt   DateTime  @default(now())
  jobRecord   JobRecord @relation(fields: [jobRecordId], references: [id], onDelete: Cascade)

  @@index([jobRecordId, createdAt])
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/prisma/seed.ts</span>
  </div>

```ts
import { prisma, disconnectPrisma } from "../src/db/prisma.js";

async function seed(): Promise<void> {
  const project = await prisma.project.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {
      name: "Architecture Lab",
      description: "Seed project for task import and cache checks"
    },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Architecture Lab",
      description: "Seed project for task import and cache checks"
    }
  });

  await prisma.task.upsert({
    where: {
      projectId_importBatchId_title: {
        projectId: project.id,
        importBatchId: "seed",
        title: "Map API and worker boundary"
      }
    },
    update: { completed: false },
    create: {
      projectId: project.id,
      title: "Map API and worker boundary",
      importBatchId: "seed"
    }
  });
}

seed()
  .then(async () => {
    await disconnectPrisma();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await disconnectPrisma();
    process.exit(1);
  });
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/prisma/migrations/0001_init/migration.sql</span>
  </div>

```txt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "Project" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "importBatchId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobRecord" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jobId" TEXT NOT NULL,
  "jobName" TEXT NOT NULL,
  "payloadVersion" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "failureClass" TEXT,
  "failureCode" TEXT,
  "payload" JSONB NOT NULL,
  "result" JSONB,
  "projectId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jobRecordId" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Task_projectId_importBatchId_title_key" ON "Task"("projectId", "importBatchId", "title");
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE UNIQUE INDEX "JobRecord_jobId_key" ON "JobRecord"("jobId");
CREATE UNIQUE INDEX "JobRecord_idempotencyKey_key" ON "JobRecord"("idempotencyKey");
CREATE INDEX "JobRecord_status_idx" ON "JobRecord"("status");
CREATE INDEX "JobRecord_projectId_idx" ON "JobRecord"("projectId");
CREATE INDEX "JobEvent_jobRecordId_createdAt_idx" ON "JobEvent"("jobRecordId", "createdAt");

ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobRecord" ADD CONSTRAINT "JobRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobEvent" ADD CONSTRAINT "JobEvent_jobRecordId_fkey" FOREIGN KEY ("jobRecordId") REFERENCES "JobRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/openapi/openapi.yaml</span>
  </div>

```txt
openapi: 3.1.1
info:
  title: Distributed Task Platform Lab API
  version: 1.0.0
servers:
  - url: http://localhost:8080
paths:
  /v1/health/live:
    get:
      operationId: getHealthLive
      responses:
        "200":
          description: Live status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthStatus"
  /v1/health/ready:
    get:
      operationId: getHealthReady
      responses:
        "200":
          description: Ready status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadinessStatus"
        "503":
          $ref: "#/components/responses/ProblemResponse"
  /v1/metrics:
    get:
      operationId: getMetrics
      responses:
        "200":
          description: Prometheus metrics
  /v1/projects:
    get:
      operationId: listProjects
      responses:
        "200":
          description: Project list
          content:
            application/json:
              schema:
                type: object
                properties:
                  projects:
                    type: array
                    items:
                      $ref: "#/components/schemas/Project"
    post:
      operationId: createProject
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateProjectRequest"
      responses:
        "201":
          description: Created project
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Project"
        "400":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}:
    get:
      operationId: getProjectById
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Project
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Project"
        "404":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}/summary:
    get:
      operationId: getProjectSummary
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Cached project summary
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProjectSummary"
        "404":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}/tasks:
    get:
      operationId: listProjectTasks
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Task list
          content:
            application/json:
              schema:
                type: object
                properties:
                  tasks:
                    type: array
                    items:
                      $ref: "#/components/schemas/Task"
    post:
      operationId: createProjectTask
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "201":
          description: Created task
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Task"
        "400":
          $ref: "#/components/responses/ProblemResponse"
  /v1/projects/{projectId}/tasks/import:
    post:
      operationId: importProjectTasks
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "202":
          description: Import job accepted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobStatus"
        "400":
          $ref: "#/components/responses/ProblemResponse"
  /v1/jobs/{jobId}:
    get:
      operationId: getJobStatus
      parameters:
        - $ref: "#/components/parameters/JobId"
      responses:
        "200":
          description: Job status
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobStatus"
        "404":
          $ref: "#/components/responses/ProblemResponse"
  /v1/jobs/{jobId}/events:
    get:
      operationId: getJobEvents
      parameters:
        - $ref: "#/components/parameters/JobId"
      responses:
        "200":
          description: Safe job events
          content:
            application/json:
              schema:
                type: object
                properties:
                  events:
                    type: array
                    items:
                      $ref: "#/components/schemas/JobEvent"
  /v1/jobs/{jobId}/retry:
    post:
      operationId: retryJob
      parameters:
        - $ref: "#/components/parameters/JobId"
      responses:
        "202":
          description: Job retry accepted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobStatus"
        "409":
          $ref: "#/components/responses/ProblemResponse"
  /v1/architecture/service-boundary:
    get:
      operationId: getServiceBoundary
      responses:
        "200":
          description: Service boundary notes
  /v1/architecture/migration-plan:
    get:
      operationId: getMigrationPlan
      responses:
        "200":
          description: Migration plan
  /v1/cache-demo/projects/{projectId}/summary:
    get:
      operationId: getCacheDemoProjectSummary
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Cache demo summary
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProjectSummary"
  /v1/cache-demo/projects/{projectId}/invalidate:
    post:
      operationId: invalidateCacheDemoProjectSummary
      parameters:
        - $ref: "#/components/parameters/ProjectId"
      responses:
        "200":
          description: Cache invalidation result
          content:
            application/json:
              schema:
                type: object
                properties:
                  invalidated:
                    type: boolean
components:
  parameters:
    ProjectId:
      name: projectId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    JobId:
      name: jobId
      in: path
      required: true
      schema:
        type: string
  responses:
    ProblemResponse:
      description: Problem Details response
      content:
        application/problem+json:
          schema:
            $ref: "#/components/schemas/ProblemDetails"
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
    ReadinessStatus:
      type: object
      properties:
        status:
          type: string
        dependencies:
          type: object
    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        title:
          type: string
        completed:
          type: boolean
    CreateProjectRequest:
      type: object
      required: [name]
      properties:
        name:
          type: string
        description:
          type: string
    JobStatus:
      type: object
      properties:
        jobId:
          type: string
        jobName:
          type: string
        payloadVersion:
          type: string
        status:
          type: string
        attemptCount:
          type: integer
        failureClass:
          type: string
          nullable: true
        result:
          type: object
          nullable: true
    JobEvent:
      type: object
      properties:
        id:
          type: string
          format: uuid
        status:
          type: string
        message:
          type: string
        createdAt:
          type: string
          format: date-time
    ProjectSummary:
      type: object
      properties:
        projectId:
          type: string
          format: uuid
        taskCount:
          type: integer
        completedTaskCount:
          type: integer
        cacheStatus:
          type: string
          enum: [hit, miss]
    ProblemDetails:
      type: object
      required: [type, title, status, detail, instance, code]
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
        code:
          type: string
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/api/app.ts</span>
  </div>

```ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config, parseAllowedOrigins } from "../config/env.js";
import { serviceBoundaryModel } from "../architecture/service-boundary.js";
import { migrationPlan } from "../architecture/migration-plan.js";
import { cacheDemoRoutes } from "../modules/cache-demo/cache-demo.routes.js";
import { jobsRoutes } from "../modules/jobs/jobs.routes.js";
import { projectsRoutes } from "../modules/projects/projects.routes.js";
import { tasksRoutes } from "../modules/tasks/tasks.routes.js";
import { healthRoutes } from "../health/health.routes.js";
import { metricsRoutes } from "../observability/metrics.routes.js";
import { httpMetricsMiddleware } from "../observability/http-metrics.js";
import { errorMiddleware } from "../shared/errors/error-middleware.js";
import { notFoundMiddleware } from "../shared/middleware/not-found.js";
import { requestIdMiddleware } from "../shared/middleware/request-id.js";

export const app = express();

app.set("trust proxy", config.TRUST_PROXY);
app.use(helmet());
app.use(cors({ origin: parseAllowedOrigins(config.ALLOWED_ORIGINS) }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "256kb" }));
app.use(requestIdMiddleware);
app.use(httpMetricsMiddleware);

app.use("/v1/health", healthRoutes);
app.use("/v1/metrics", metricsRoutes);
app.use("/v1/projects", projectsRoutes);
app.use("/v1/projects/:projectId/tasks", tasksRoutes);
app.use("/v1/jobs", jobsRoutes);
app.use("/v1/cache-demo", cacheDemoRoutes);

app.get("/v1/architecture/service-boundary", (_request, response) => {
  response.json(serviceBoundaryModel);
});

app.get("/v1/architecture/migration-plan", (_request, response) => {
  response.json({ steps: migrationPlan });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/api/server.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import { app } from "./app.js";
import { config } from "../config/env.js";
import { createRuntimePolicy } from "../config/runtime-policy.js";
import { disconnectPrisma } from "../db/prisma.js";
import { closeTaskQueue } from "../queue/task-queue.js";
import { closeRedis } from "../redis/redis-client.js";
import { logger } from "../observability/logger.js";

const policy = createRuntimePolicy(config);
const server = createServer(app);

server.requestTimeout = policy.requestTimeoutMs;
server.headersTimeout = policy.headersTimeoutMs;
server.keepAliveTimeout = policy.keepAliveTimeoutMs;

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "api listening");
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "api shutdown started");
  const forceTimer = setTimeout(() => {
    logger.error("api shutdown timeout exceeded");
    process.exit(1);
  }, policy.shutdownTimeoutMs);
  forceTimer.unref();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  await Promise.allSettled([closeTaskQueue(), closeRedis(), disconnectPrisma()]);
  clearTimeout(forceTimer);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    shutdown(signal).catch((error: unknown) => {
      logger.error({ error }, "api shutdown failed");
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
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/worker/worker.ts</span>
  </div>

```ts
import { Worker } from "bullmq";
import { config } from "../config/env.js";
import { createRuntimePolicy } from "../config/runtime-policy.js";
import { logger } from "../observability/logger.js";
import { workerReadinessGauge } from "../observability/metrics.js";
import { createTaskQueueEvents } from "../queue/queue-events.js";
import { TASK_IMPORT_QUEUE_NAME } from "../queue/queue-names.js";
import { redisConnection, taskQueue } from "../queue/task-queue.js";
import { processImportTasksJob } from "./processor.js";
import { markWorkerReady } from "./worker-health.js";
import { registerWorkerShutdown } from "./worker-shutdown.js";

const policy = createRuntimePolicy(config);
const queueEvents = createTaskQueueEvents();
const worker = new Worker(TASK_IMPORT_QUEUE_NAME, processImportTasksJob, {
  connection: redisConnection,
  concurrency: policy.workerConcurrency
});

worker.on("completed", (job) => {
  logger.info({ jobName: job.name }, "job completed");
});

worker.on("failed", (job, error) => {
  logger.warn({ jobName: job?.name, error }, "job failed");
});

await Promise.all([queueEvents.waitUntilReady(), worker.waitUntilReady()]);
await markWorkerReady();
workerReadinessGauge.set({ worker_name: "task-import-worker" }, 1);
logger.info({ queue: TASK_IMPORT_QUEUE_NAME, concurrency: policy.workerConcurrency }, "worker ready");

registerWorkerShutdown({
  worker,
  queue: taskQueue,
  queueEvents,
  shutdownTimeoutMs: policy.shutdownTimeoutMs
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/worker/processor.ts</span>
  </div>

```ts
import type { Job } from "bullmq";
import type { Prisma } from "../generated/prisma/client.js";
import { invalidateProjectSummary } from "../cache/cache-invalidation.js";
import { prisma } from "../db/prisma.js";
import { recordJobCompleted, recordJobFailed, recordJobStarted } from "../observability/job-metrics.js";
import { IMPORT_TASKS_JOB_NAME } from "../queue/job-contract.js";
import { type ImportTasksJobPayload, type ImportTasksJobResult, parseImportTasksPayload } from "../queue/job-schemas.js";
import { classifyJobFailure, PermanentJobError, TransientJobError } from "../queue/retry-policy.js";

function readFailureIdempotencyKey(input: unknown): string | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const rawIdempotencyKey = (input as { idempotencyKey?: unknown }).idempotencyKey;
  return typeof rawIdempotencyKey === "string" && rawIdempotencyKey.length > 0 ? rawIdempotencyKey : undefined;
}

function parsePayloadForWorker(input: unknown): ImportTasksJobPayload {
  try {
    return parseImportTasksPayload(input);
  } catch (error: unknown) {
    throw new PermanentJobError("Invalid import job payload", { cause: error });
  }
}

export async function processImportTasksJob(job: Job<ImportTasksJobPayload, ImportTasksJobResult, string>): Promise<ImportTasksJobResult> {
  const startedAt = Date.now();
  let payload: ImportTasksJobPayload | undefined;
  try {
    const validPayload = parsePayloadForWorker(job.data);
    payload = validPayload;
    if (validPayload.failureMode === "permanent") throw new PermanentJobError("Permanent failure requested");
    if (validPayload.failureMode === "transient" && job.attemptsMade === 0) throw new TransientJobError("Transient failure requested");

    recordJobStarted(IMPORT_TASKS_JOB_NAME);

    const existingCompleted = await prisma.jobRecord.findUnique({
      where: { idempotencyKey: validPayload.idempotencyKey }
    });

    if (existingCompleted?.status === "completed" && existingCompleted.result) {
      return existingCompleted.result as ImportTasksJobResult;
    }

    const result = await prisma.$transaction(async (transaction) => {
      const record = await transaction.jobRecord.update({
        where: { idempotencyKey: validPayload.idempotencyKey },
        data: {
          status: "active",
          attemptCount: job.attemptsMade + 1,
          events: {
            create: {
              status: "active",
              message: "Worker started job",
              metadata: { attempt: job.attemptsMade + 1 }
            }
          }
        }
      });

      const beforeCount = await transaction.task.count({
        where: {
          projectId: validPayload.projectId,
          importBatchId: validPayload.idempotencyKey
        }
      });

      for (const task of validPayload.tasks) {
        await transaction.task.upsert({
          where: {
            projectId_importBatchId_title: {
              projectId: validPayload.projectId,
              importBatchId: validPayload.idempotencyKey,
              title: task.title
            }
          },
          update: {
            completed: task.completed
          },
          create: {
            projectId: validPayload.projectId,
            title: task.title,
            completed: task.completed,
            importBatchId: validPayload.idempotencyKey
          }
        });
      }

      const afterCount = await transaction.task.count({
        where: {
          projectId: validPayload.projectId,
          importBatchId: validPayload.idempotencyKey
        }
      });

      const importResult: ImportTasksJobResult = {
        projectId: validPayload.projectId,
        imported: Math.max(0, afterCount - beforeCount),
        skipped: validPayload.tasks.length - Math.max(0, afterCount - beforeCount),
        total: validPayload.tasks.length
      };

      await transaction.jobRecord.update({
        where: { id: record.id },
        data: {
          status: "completed",
          result: importResult as unknown as Prisma.InputJsonValue,
          events: {
            create: {
              status: "completed",
              message: "Worker completed job",
              metadata: importResult as unknown as Prisma.InputJsonValue
            }
          }
        }
      });

      return importResult;
    });

    await invalidateProjectSummary(validPayload.projectId);
    recordJobCompleted(IMPORT_TASKS_JOB_NAME, Date.now() - startedAt);
    return result;
  } catch (error: unknown) {
    const failureClass = classifyJobFailure(error);
    const failureIdempotencyKey = payload?.idempotencyKey ?? readFailureIdempotencyKey(job.data);

    if (failureIdempotencyKey) {
      const existingRecord = await prisma.jobRecord.findUnique({
        where: { idempotencyKey: failureIdempotencyKey },
        select: { id: true }
      });

      if (existingRecord) {
        await prisma.jobRecord.update({
          where: { id: existingRecord.id },
          data: {
            status: "failed",
            attemptCount: job.attemptsMade + 1,
            failureClass,
            failureCode: error instanceof Error ? error.constructor.name : "UnknownError",
            events: {
              create: {
                status: "failed",
                message: "Worker failed job",
                metadata: { failureClass }
              }
            }
          }
        });
      }
    }

    recordJobFailed(IMPORT_TASKS_JOB_NAME, failureClass, Date.now() - startedAt);
    throw error;
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/worker/worker-health.ts</span>
  </div>

```ts
import { rm, writeFile } from "node:fs/promises";

export const workerReadyFile = "/tmp/distributed-task-worker-ready";

export async function markWorkerReady(): Promise<void> {
  await writeFile(workerReadyFile, "ready", "utf8");
}

export async function clearWorkerReady(): Promise<void> {
  await rm(workerReadyFile, { force: true });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/worker/worker-shutdown.ts</span>
  </div>

```ts
import type { Queue, QueueEvents, Worker } from "bullmq";
import { disconnectPrisma } from "../db/prisma.js";
import { closeRedis } from "../redis/redis-client.js";
import { logger } from "../observability/logger.js";
import { clearWorkerReady } from "./worker-health.js";

export function registerWorkerShutdown(resources: {
  worker: Worker;
  queue: Queue;
  queueEvents: QueueEvents;
  shutdownTimeoutMs: number;
}): void {
  async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, "worker shutdown started");
    await clearWorkerReady();
    const forceTimer = setTimeout(() => {
      logger.error("worker shutdown timeout exceeded");
      process.exit(1);
    }, resources.shutdownTimeoutMs);
    forceTimer.unref();

    await resources.worker.close();
    await resources.queue.close();
    await resources.queueEvents.close();
    await Promise.allSettled([closeRedis(), disconnectPrisma()]);
    clearTimeout(forceTimer);
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      shutdown(signal).catch((error: unknown) => {
        logger.error({ error }, "worker shutdown failed");
        process.exitCode = 1;
      });
    });
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3030),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/distributed_task_platform_lab"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  LOG_LEVEL: z.string().default("info"),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  HTTP_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  HTTP_HEADERS_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  HTTP_KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  DEPENDENCY_TIMEOUT_MS: z.coerce.number().int().positive().default(1000),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(1000),
  JOB_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(16).default(2),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  SMOKE_BASE_URL: z.string().url().default("http://localhost:8080")
});

export const config = envSchema.parse(process.env);
export type AppConfig = z.infer<typeof envSchema>;

export function parseAllowedOrigins(rawOrigins: string): string[] {
  return rawOrigins.split(",").map((origin) => origin.trim()).filter(Boolean);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/config/runtime-policy.ts</span>
  </div>

```ts
import type { AppConfig } from "./env.js";

export type RuntimePolicy = {
  shutdownTimeoutMs: number;
  requestTimeoutMs: number;
  headersTimeoutMs: number;
  keepAliveTimeoutMs: number;
  dependencyTimeoutMs: number;
  jobTimeoutMs: number;
  workerConcurrency: number;
  cacheTtlSeconds: number;
};

export function createRuntimePolicy(config: AppConfig): RuntimePolicy {
  return {
    shutdownTimeoutMs: config.SHUTDOWN_TIMEOUT_MS,
    requestTimeoutMs: config.HTTP_REQUEST_TIMEOUT_MS,
    headersTimeoutMs: config.HTTP_HEADERS_TIMEOUT_MS,
    keepAliveTimeoutMs: config.HTTP_KEEP_ALIVE_TIMEOUT_MS,
    dependencyTimeoutMs: config.DEPENDENCY_TIMEOUT_MS,
    jobTimeoutMs: config.JOB_TIMEOUT_MS,
    workerConcurrency: config.WORKER_CONCURRENCY,
    cacheTtlSeconds: config.CACHE_TTL_SECONDS
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/db/prisma.ts</span>
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
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/db/db-health.ts</span>
  </div>

```ts
import { prisma } from "./prisma.js";

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/redis/redis-client.ts</span>
  </div>

```ts
import { createClient } from "redis";
import { config } from "../config/env.js";

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | undefined;

export async function getRedisClient(): Promise<RedisClient> {
  if (!redisClient) {
    redisClient = createClient({
      url: config.REDIS_URL,
      socket: {
        connectTimeout: config.REDIS_CONNECT_TIMEOUT_MS
      }
    });
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
  redisClient = undefined;
}

export function parseRedisUrl(redisUrl: string): { host: string; port: number } {
  const parsed = new URL(redisUrl);
  return {
    host: parsed.hostname,
    port: Number.parseInt(parsed.port || "6379", 10)
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/redis/redis-health.ts</span>
  </div>

```ts
import { getRedisClient } from "./redis-client.js";

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/queue/queue-names.ts</span>
  </div>

```ts
export const TASK_IMPORT_QUEUE_NAME = "task-import";
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/queue/job-contract.ts</span>
  </div>

```ts
import type { JobsOptions } from "bullmq";
import { config } from "../config/env.js";
import type { ImportTasksJobPayload } from "./job-schemas.js";

export const IMPORT_TASKS_JOB_NAME = "tasks.import";
export const IMPORT_TASKS_PAYLOAD_VERSION = "1";

export function buildImportJobId(idempotencyKey: string): string {
  return `${IMPORT_TASKS_JOB_NAME}:${idempotencyKey}`;
}

export function buildImportJobPayload(input: Omit<ImportTasksJobPayload, "name" | "version">): ImportTasksJobPayload {
  return {
    ...input,
    name: IMPORT_TASKS_JOB_NAME,
    version: IMPORT_TASKS_PAYLOAD_VERSION
  };
}

export function buildImportJobOptions(idempotencyKey: string): JobsOptions {
  return {
    jobId: buildImportJobId(idempotencyKey),
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/queue/job-schemas.ts</span>
  </div>

```ts
import { z } from "zod";

export const importTaskItemSchema = z.object({
  title: z.string().trim().min(1).max(160),
  completed: z.boolean().default(false)
});

export const importTasksPayloadSchema = z.object({
  name: z.literal("tasks.import"),
  version: z.literal("1"),
  projectId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/),
  correlationId: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/),
  tasks: z.array(importTaskItemSchema).min(1).max(50),
  metadata: z.object({
    source: z.string().min(1).max(80)
  }).default({ source: "api" }),
  failureMode: z.enum(["none", "transient", "permanent"]).default("none")
}).refine((payload) => new Set(payload.tasks.map((task) => task.title)).size === payload.tasks.length, {
  message: "Task titles must be unique within one import payload"
});

export const importTasksResultSchema = z.object({
  projectId: z.string().uuid(),
  imported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  total: z.number().int().nonnegative()
});

export type ImportTasksJobPayload = z.infer<typeof importTasksPayloadSchema>;
export type ImportTasksJobResult = z.infer<typeof importTasksResultSchema>;

export function parseImportTasksPayload(input: unknown): ImportTasksJobPayload {
  return importTasksPayloadSchema.parse(input);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/queue/job-state.ts</span>
  </div>

```ts
export const jobStates = ["queued", "active", "retrying", "completed", "failed", "stalled"] as const;
export type JobState = (typeof jobStates)[number];

const allowedTransitions = new Map<JobState, JobState[]>([
  ["queued", ["active", "failed"]],
  ["active", ["completed", "failed", "retrying", "stalled"]],
  ["retrying", ["queued", "failed"]],
  ["stalled", ["queued", "failed"]],
  ["completed", []],
  ["failed", ["queued"]]
]);

export function canTransitionJob(from: JobState, to: JobState): boolean {
  return allowedTransitions.get(from)?.includes(to) ?? false;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/queue/task-queue.ts</span>
  </div>

```ts
import { Queue } from "bullmq";
import { config } from "../config/env.js";
import { parseRedisUrl } from "../redis/redis-client.js";
import type { ImportTasksJobPayload, ImportTasksJobResult } from "./job-schemas.js";
import { TASK_IMPORT_QUEUE_NAME } from "./queue-names.js";

const redisConnection = {
  ...parseRedisUrl(config.REDIS_URL),
  maxRetriesPerRequest: null
};

export function createTaskQueue(): Queue<ImportTasksJobPayload, ImportTasksJobResult, string> {
  return new Queue<ImportTasksJobPayload, ImportTasksJobResult, string>(TASK_IMPORT_QUEUE_NAME, {
    connection: redisConnection
  });
}

export const taskQueue = createTaskQueue();
taskQueue.on("error", () => undefined);

export async function closeTaskQueue(): Promise<void> {
  await taskQueue.close();
}

export { redisConnection };
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/queue/queue-events.ts</span>
  </div>

```ts
import { QueueEvents } from "bullmq";
import { redisConnection } from "./task-queue.js";
import { TASK_IMPORT_QUEUE_NAME } from "./queue-names.js";

export function createTaskQueueEvents(): QueueEvents {
  return new QueueEvents(TASK_IMPORT_QUEUE_NAME, {
    connection: redisConnection
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/queue/retry-policy.ts</span>
  </div>

```ts
export type FailureClass = "transient" | "permanent" | "unknown";

export class TransientJobError extends Error {
  readonly failureClass = "transient" as const;
}

export class PermanentJobError extends Error {
  readonly failureClass = "permanent" as const;
}

export function classifyJobFailure(error: unknown): FailureClass {
  if (error instanceof PermanentJobError) return "permanent";
  if (error instanceof TransientJobError) return "transient";
  return "unknown";
}

export function shouldRetryJob(failureClass: FailureClass, attemptsMade: number, maxAttempts: number): boolean {
  if (failureClass === "permanent") return false;
  return attemptsMade < maxAttempts;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/projects/projects.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createProjectSchema, projectParamsSchema } from "./projects.schema.js";
import * as controller from "./projects.controller.js";

export const projectsRoutes = Router();

projectsRoutes.get("/", controller.list);
projectsRoutes.post("/", validateRequest({ body: createProjectSchema }), controller.create);
projectsRoutes.get("/:projectId", validateRequest({ params: projectParamsSchema }), controller.getById);
projectsRoutes.get("/:projectId/summary", validateRequest({ params: projectParamsSchema }), controller.summary);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/projects/projects.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { createProject, getProjectById, getProjectSummary, listProjects } from "./projects.service.js";

export const list: RequestHandler = async (_request, response) => {
  response.json({ projects: await listProjects() });
};

export const create: RequestHandler = async (request, response) => {
  response.status(201).json(await createProject(request.body));
};

export const getById: RequestHandler = async (request, response) => {
  response.json(await getProjectById(String(request.params.projectId)));
};

export const summary: RequestHandler = async (request, response) => {
  response.json(await getProjectSummary(String(request.params.projectId)));
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/projects/projects.service.ts</span>
  </div>

```ts
import { readCacheAside } from "../../cache/cache-aside.js";
import { invalidateProjectSummary } from "../../cache/cache-invalidation.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import type { CreateProjectInput } from "./projects.schema.js";

export type ProjectDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSummaryDto = {
  projectId: string;
  taskCount: number;
  completedTaskCount: number;
  cacheStatus: "hit" | "miss";
};

function toProjectDto(project: { id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date }): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
}

export async function listProjects(): Promise<ProjectDto[]> {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  return projects.map(toProjectDto);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectDto> {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description
    }
  });
  return toProjectDto(project);
}

export async function getProjectById(projectId: string): Promise<ProjectDto> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new HttpError(404, "project_not_found", "Project not found");
  return toProjectDto(project);
}

export async function getProjectSummary(projectId: string): Promise<ProjectSummaryDto> {
  await getProjectById(projectId);
  const cached = await readCacheAside(projectId, async () => {
    const [taskCount, completedTaskCount] = await Promise.all([
      prisma.task.count({ where: { projectId } }),
      prisma.task.count({ where: { projectId, completed: true } })
    ]);
    return { projectId, taskCount, completedTaskCount };
  });

  return {
    ...cached.value,
    cacheStatus: cached.cacheStatus
  };
}

export async function invalidateSummary(projectId: string): Promise<boolean> {
  await getProjectById(projectId);
  return invalidateProjectSummary(projectId);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/projects/projects.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const projectParamsSchema = z.object({
  projectId: z.string().uuid()
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createTaskSchema, importTasksRequestSchema, taskParamsSchema } from "./tasks.schema.js";
import * as controller from "./tasks.controller.js";

export const tasksRoutes = Router({ mergeParams: true });

tasksRoutes.get("/", validateRequest({ params: taskParamsSchema }), controller.list);
tasksRoutes.post("/", validateRequest({ params: taskParamsSchema, body: createTaskSchema }), controller.create);
tasksRoutes.post("/import", validateRequest({ params: taskParamsSchema, body: importTasksRequestSchema }), controller.importTasks);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { createTask, enqueueTaskImport, listTasks } from "./tasks.service.js";

export const list: RequestHandler = async (request, response) => {
  response.json({ tasks: await listTasks(String(request.params.projectId)) });
};

export const create: RequestHandler = async (request, response) => {
  response.status(201).json(await createTask(String(request.params.projectId), request.body));
};

export const importTasks: RequestHandler = async (request, response) => {
  response.status(202).json(await enqueueTaskImport(String(request.params.projectId), request.body, request.id));
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.service.ts</span>
  </div>

```ts
import type { Prisma } from "../../generated/prisma/client.js";
import { chooseCorrelationId } from "../../observability/correlation-id.js";
import { recordJobQueued } from "../../observability/job-metrics.js";
import { buildImportJobOptions, buildImportJobPayload, IMPORT_TASKS_JOB_NAME, IMPORT_TASKS_PAYLOAD_VERSION } from "../../queue/job-contract.js";
import { taskQueue } from "../../queue/task-queue.js";
import { invalidateProjectSummary } from "../../cache/cache-invalidation.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { getProjectById } from "../projects/projects.service.js";
import type { CreateTaskInput, ImportTasksRequest } from "./tasks.schema.js";

export type TaskDto = {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

function toTaskDto(task: { id: string; projectId: string; title: string; completed: boolean; createdAt: Date; updatedAt: Date }): TaskDto {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}

export async function listTasks(projectId: string): Promise<TaskDto[]> {
  await getProjectById(projectId);
  const tasks = await prisma.task.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } });
  return tasks.map(toTaskDto);
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<TaskDto> {
  await getProjectById(projectId);
  const task = await prisma.task.create({
    data: {
      projectId,
      title: input.title,
      completed: input.completed
    }
  });
  await invalidateProjectSummary(projectId);
  return toTaskDto(task);
}

export async function enqueueTaskImport(projectId: string, body: ImportTasksRequest, requestId: string | undefined): Promise<{ jobId: string; status: string; duplicate: boolean }> {
  await getProjectById(projectId);
  const correlationId = chooseCorrelationId(body.correlationId ?? requestId);
  const payload = buildImportJobPayload({
    projectId,
    idempotencyKey: body.idempotencyKey,
    correlationId,
    tasks: body.tasks,
    metadata: { source: "api" },
    failureMode: body.failureMode
  });
  const options = buildImportJobOptions(body.idempotencyKey);
  const publicJobId = String(options.jobId);

  try {
    await prisma.jobRecord.create({
      data: {
        jobId: publicJobId,
        jobName: IMPORT_TASKS_JOB_NAME,
        payloadVersion: IMPORT_TASKS_PAYLOAD_VERSION,
        idempotencyKey: body.idempotencyKey,
        correlationId,
        status: "queued",
        projectId,
        payload: payload as unknown as Prisma.InputJsonValue,
        events: {
          create: {
            status: "queued",
            message: "Job accepted",
            metadata: { source: "api" }
          }
        }
      }
    });
  } catch (error: unknown) {
    const existing = await prisma.jobRecord.findUnique({ where: { idempotencyKey: body.idempotencyKey } });
    if (existing) return { jobId: existing.jobId, status: existing.status, duplicate: true };
    throw error;
  }

  await taskQueue.add(IMPORT_TASKS_JOB_NAME, payload, options);
  recordJobQueued(IMPORT_TASKS_JOB_NAME);
  return { jobId: publicJobId, status: "queued", duplicate: false };
}

export function assertProjectExists(projectId: string): Promise<unknown> {
  return getProjectById(projectId).catch((error: unknown) => {
    if (error instanceof HttpError) throw error;
    throw new HttpError(404, "project_not_found", "Project not found");
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/tasks/tasks.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const taskParamsSchema = z.object({
  projectId: z.string().uuid()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  completed: z.boolean().default(false)
});

export const importTasksRequestSchema = z.object({
  idempotencyKey: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/),
  correlationId: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/).optional(),
  tasks: z.array(createTaskSchema).min(1).max(50),
  failureMode: z.enum(["none", "transient", "permanent"]).default("none")
}).refine((body) => new Set(body.tasks.map((task) => task.title)).size === body.tasks.length, {
  message: "Task titles must be unique within one import request"
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ImportTasksRequest = z.infer<typeof importTasksRequestSchema>;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/jobs/jobs.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { jobParamsSchema } from "./jobs.schema.js";
import * as controller from "./jobs.controller.js";

export const jobsRoutes = Router();

jobsRoutes.get("/:jobId", validateRequest({ params: jobParamsSchema }), controller.getById);
jobsRoutes.get("/:jobId/events", validateRequest({ params: jobParamsSchema }), controller.events);
jobsRoutes.post("/:jobId/retry", validateRequest({ params: jobParamsSchema }), controller.retry);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/jobs/jobs.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { getJobEvents, getJobStatus, retryJob } from "./jobs.service.js";

export const getById: RequestHandler = async (request, response) => {
  response.json(await getJobStatus(String(request.params.jobId)));
};

export const events: RequestHandler = async (request, response) => {
  response.json({ events: await getJobEvents(String(request.params.jobId)) });
};

export const retry: RequestHandler = async (request, response) => {
  response.status(202).json(await retryJob(String(request.params.jobId)));
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/jobs/jobs.service.ts</span>
  </div>

```ts
import type { Prisma } from "../../generated/prisma/client.js";
import { recordJobRetry } from "../../observability/job-metrics.js";
import { buildImportJobOptions, IMPORT_TASKS_JOB_NAME } from "../../queue/job-contract.js";
import { parseImportTasksPayload } from "../../queue/job-schemas.js";
import { taskQueue } from "../../queue/task-queue.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";

export type JobStatusDto = {
  jobId: string;
  jobName: string;
  payloadVersion: string;
  status: string;
  attemptCount: number;
  failureClass: string | null;
  failureCode: string | null;
  result: unknown;
  createdAt: string;
  updatedAt: string;
};

export type JobEventDto = {
  id: string;
  status: string;
  message: string;
  metadata: unknown;
  createdAt: string;
};

function toJobStatusDto(record: {
  jobId: string;
  jobName: string;
  payloadVersion: string;
  status: string;
  attemptCount: number;
  failureClass: string | null;
  failureCode: string | null;
  result: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}): JobStatusDto {
  return {
    jobId: record.jobId,
    jobName: record.jobName,
    payloadVersion: record.payloadVersion,
    status: record.status,
    attemptCount: record.attemptCount,
    failureClass: record.failureClass,
    failureCode: record.failureCode,
    result: record.result,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export async function getJobStatus(jobId: string): Promise<JobStatusDto> {
  const record = await prisma.jobRecord.findUnique({ where: { jobId } });
  if (!record) throw new HttpError(404, "job_not_found", "Job not found");
  return toJobStatusDto(record);
}

export async function getJobEvents(jobId: string): Promise<JobEventDto[]> {
  const record = await prisma.jobRecord.findUnique({
    where: { jobId },
    include: { events: { orderBy: { createdAt: "asc" } } }
  });
  if (!record) throw new HttpError(404, "job_not_found", "Job not found");
  return record.events.map((event) => ({
    id: event.id,
    status: event.status,
    message: event.message,
    metadata: event.metadata,
    createdAt: event.createdAt.toISOString()
  }));
}

export async function retryJob(jobId: string): Promise<JobStatusDto> {
  const record = await prisma.jobRecord.findUnique({ where: { jobId } });
  if (!record) throw new HttpError(404, "job_not_found", "Job not found");
  if (record.status !== "failed") throw new HttpError(409, "job_not_retryable", "Only failed jobs can be retried");

  const payload = parseImportTasksPayload(record.payload);
  await prisma.jobRecord.update({
    where: { jobId },
    data: {
      status: "queued",
      failureClass: null,
      failureCode: null,
      events: {
        create: {
          status: "queued",
          message: "Manual retry accepted",
          metadata: { source: "api" }
        }
      }
    }
  });
  await taskQueue.add(IMPORT_TASKS_JOB_NAME, payload, {
    ...buildImportJobOptions(payload.idempotencyKey),
    jobId: `${jobId}:retry:${Date.now()}`
  });
  recordJobRetry(IMPORT_TASKS_JOB_NAME);
  return getJobStatus(jobId);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/jobs/jobs.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const jobParamsSchema = z.object({
  jobId: z.string().min(1).max(180)
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/cache-demo/cache-demo.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { projectParamsSchema } from "../projects/projects.schema.js";
import * as controller from "./cache-demo.controller.js";

export const cacheDemoRoutes = Router();

cacheDemoRoutes.get("/projects/:projectId/summary", validateRequest({ params: projectParamsSchema }), controller.summary);
cacheDemoRoutes.post("/projects/:projectId/invalidate", validateRequest({ params: projectParamsSchema }), controller.invalidate);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/cache-demo/cache-demo.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { getCacheDemoSummary, invalidateCacheDemoSummary } from "./cache-demo.service.js";

export const summary: RequestHandler = async (request, response) => {
  response.json(await getCacheDemoSummary(String(request.params.projectId)));
};

export const invalidate: RequestHandler = async (request, response) => {
  response.json(await invalidateCacheDemoSummary(String(request.params.projectId)));
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/modules/cache-demo/cache-demo.service.ts</span>
  </div>

```ts
import { invalidateSummary, getProjectSummary } from "../projects/projects.service.js";

export async function getCacheDemoSummary(projectId: string) {
  return getProjectSummary(projectId);
}

export async function invalidateCacheDemoSummary(projectId: string): Promise<{ invalidated: boolean }> {
  return { invalidated: await invalidateSummary(projectId) };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/cache/cache-keys.ts</span>
  </div>

```ts
export const PROJECT_SUMMARY_CACHE_NAME = "project_summary";

export function projectSummaryCacheKey(projectId: string): string {
  return `cache:v1:project-summary:${projectId}`;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/cache/cache-aside.ts</span>
  </div>

```ts
import { config } from "../config/env.js";
import { recordCacheHit, recordCacheMiss } from "../observability/cache-metrics.js";
import { getRedisClient } from "../redis/redis-client.js";
import { PROJECT_SUMMARY_CACHE_NAME, projectSummaryCacheKey } from "./cache-keys.js";
import { loadOncePerKey } from "./stampede-guard.js";

export type CacheAsideResult<T> = {
  value: T;
  cacheStatus: "hit" | "miss";
};

export async function readCacheAside<T>(projectId: string, loader: () => Promise<T>): Promise<CacheAsideResult<T>> {
  const client = await getRedisClient();
  const key = projectSummaryCacheKey(projectId);
  const cached = await client.get(key);

  if (cached) {
    recordCacheHit(PROJECT_SUMMARY_CACHE_NAME);
    return { value: JSON.parse(cached) as T, cacheStatus: "hit" };
  }

  const value = await loadOncePerKey(key, loader);
  await client.set(key, JSON.stringify(value), { EX: config.CACHE_TTL_SECONDS });
  recordCacheMiss(PROJECT_SUMMARY_CACHE_NAME);
  return { value, cacheStatus: "miss" };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/cache/cache-invalidation.ts</span>
  </div>

```ts
import { getRedisClient } from "../redis/redis-client.js";
import { recordCacheInvalidation } from "../observability/cache-metrics.js";
import { PROJECT_SUMMARY_CACHE_NAME, projectSummaryCacheKey } from "./cache-keys.js";

export async function invalidateProjectSummary(projectId: string): Promise<boolean> {
  const client = await getRedisClient();
  const deleted = await client.del(projectSummaryCacheKey(projectId));
  recordCacheInvalidation(PROJECT_SUMMARY_CACHE_NAME);
  return deleted > 0;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/cache/stampede-guard.ts</span>
  </div>

```ts
const inFlightLoads = new Map<string, Promise<unknown>>();

export async function loadOncePerKey<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = inFlightLoads.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const pending = loader().finally(() => {
    inFlightLoads.delete(key);
  });
  inFlightLoads.set(key, pending);
  return pending;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/health/health.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { liveStatus, readyStatus } from "./health.service.js";

export const healthRoutes = Router();

healthRoutes.get("/live", async (_request, response) => {
  response.json(await liveStatus());
});

healthRoutes.get("/ready", async (_request, response) => {
  const result = await readyStatus();
  response.status(result.status === "ready" ? 200 : 503).json(result);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/health/health.service.ts</span>
  </div>

```ts
import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";
import { taskQueue } from "../queue/task-queue.js";
import { queueDepthGauge } from "../observability/metrics.js";
import { TASK_IMPORT_QUEUE_NAME } from "../queue/queue-names.js";

export async function liveStatus(): Promise<{ status: "live" }> {
  return { status: "live" };
}

export async function readyStatus(): Promise<{ status: "ready" | "not_ready"; dependencies: Record<string, boolean> }> {
  const [database, redis] = await Promise.all([checkDatabaseHealth(), checkRedisHealth()]);
  let queue = false;
  try {
    const counts = await taskQueue.getJobCounts("waiting", "active", "delayed", "failed");
    const depth = counts.waiting + counts.active + counts.delayed;
    queueDepthGauge.set({ queue_name: TASK_IMPORT_QUEUE_NAME }, depth);
    queue = true;
  } catch {
    queue = false;
  }

  const dependencies = { database, redis, queue };
  return {
    status: Object.values(dependencies).every(Boolean) ? "ready" : "not_ready",
    dependencies
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/logger.ts</span>
  </div>

```ts
import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: ["req.headers.authorization", "password", "token", "secret"]
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/metrics.ts</span>
  </div>

```ts
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from "prom-client";

export const metricsRegistry = new Registry();
metricsRegistry.setDefaultLabels({ app: "distributed_task_platform_lab" });
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "HTTP requests by method, route pattern, and status class",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const problemResponseCounter = new Counter({
  name: "api_problem_responses_total",
  help: "Problem responses by code and status class",
  labelNames: ["code", "status_class"] as const,
  registers: [metricsRegistry]
});

export const jobQueuedCounter = new Counter({
  name: "jobs_queued_total",
  help: "Jobs queued by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobStartedCounter = new Counter({
  name: "jobs_started_total",
  help: "Jobs started by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobCompletedCounter = new Counter({
  name: "jobs_completed_total",
  help: "Jobs completed by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobFailedCounter = new Counter({
  name: "jobs_failed_total",
  help: "Jobs failed by job name and failure class",
  labelNames: ["job_name", "failure_class"] as const,
  registers: [metricsRegistry]
});

export const jobRetryCounter = new Counter({
  name: "jobs_retried_total",
  help: "Job retries by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobDurationHistogram = new Histogram({
  name: "job_duration_seconds",
  help: "Job duration by job name and result",
  labelNames: ["job_name", "result"] as const,
  buckets: [0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry]
});

export const queueDepthGauge = new Gauge({
  name: "queue_depth",
  help: "Queue depth by queue name",
  labelNames: ["queue_name"] as const,
  registers: [metricsRegistry]
});

export const cacheHitCounter = new Counter({
  name: "cache_hits_total",
  help: "Cache hits by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const cacheMissCounter = new Counter({
  name: "cache_misses_total",
  help: "Cache misses by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const cacheInvalidationCounter = new Counter({
  name: "cache_invalidations_total",
  help: "Cache invalidations by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const workerReadinessGauge = new Gauge({
  name: "worker_readiness",
  help: "Worker readiness signal",
  labelNames: ["worker_name"] as const,
  registers: [metricsRegistry]
});

export function statusClass(statusCode: number): string {
  return `${Math.trunc(statusCode / 100)}xx`;
}

export function recordProblemResponse(code: string, status: number): void {
  problemResponseCounter.inc({ code, status_class: statusClass(status) });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/http-metrics.ts</span>
  </div>

```ts
import type { Request, RequestHandler } from "express";
import { httpRequestCounter, statusClass } from "./metrics.js";

export function getRoutePattern(request: Request): string {
  const routePath = typeof request.route?.path === "string" ? request.route.path : request.path.replace(/[0-9a-fA-F-]{36}/g, ":id");
  return `${request.baseUrl}${routePath}` || "unmatched";
}

export const httpMetricsMiddleware: RequestHandler = (request, response, next) => {
  response.on("finish", () => {
    httpRequestCounter.inc({
      method: request.method,
      route: getRoutePattern(request),
      status_class: statusClass(response.statusCode)
    });
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
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/job-metrics.ts</span>
  </div>

```ts
import { jobCompletedCounter, jobDurationHistogram, jobFailedCounter, jobQueuedCounter, jobRetryCounter, jobStartedCounter } from "./metrics.js";

export function recordJobQueued(jobName: string): void {
  jobQueuedCounter.inc({ job_name: jobName });
}

export function recordJobStarted(jobName: string): void {
  jobStartedCounter.inc({ job_name: jobName });
}

export function recordJobCompleted(jobName: string, durationMs: number): void {
  jobCompletedCounter.inc({ job_name: jobName });
  jobDurationHistogram.observe({ job_name: jobName, result: "completed" }, durationMs / 1000);
}

export function recordJobFailed(jobName: string, failureClass: string, durationMs: number): void {
  jobFailedCounter.inc({ job_name: jobName, failure_class: failureClass });
  jobDurationHistogram.observe({ job_name: jobName, result: "failed" }, durationMs / 1000);
}

export function recordJobRetry(jobName: string): void {
  jobRetryCounter.inc({ job_name: jobName });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/cache-metrics.ts</span>
  </div>

```ts
import { cacheHitCounter, cacheInvalidationCounter, cacheMissCounter } from "./metrics.js";

export function recordCacheHit(cacheName: string): void {
  cacheHitCounter.inc({ cache_name: cacheName });
}

export function recordCacheMiss(cacheName: string): void {
  cacheMissCounter.inc({ cache_name: cacheName });
}

export function recordCacheInvalidation(cacheName: string): void {
  cacheInvalidationCounter.inc({ cache_name: cacheName });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/metrics.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response) => {
  response.type(metricsRegistry.contentType).send(await metricsRegistry.metrics());
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/observability/correlation-id.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";

export function chooseCorrelationId(headerValue: string | undefined): string {
  if (headerValue && /^[a-zA-Z0-9_.:-]{8,128}$/.test(headerValue)) return headerValue;
  return randomUUID();
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/shared/errors/http-error.ts</span>
  </div>

```ts
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/shared/errors/problem-details.ts</span>
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
  [404, "Not Found"],
  [409, "Conflict"],
  [500, "Internal Server Error"],
  [503, "Service Unavailable"]
]);

export function createProblemDetails(error: unknown, request: Request): ProblemDetails {
  const status = error instanceof HttpError ? error.status : 500;
  const code = error instanceof HttpError ? error.code : "internal_error";
  const detail = error instanceof Error && status < 500 ? error.message : "Unexpected error";

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
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/shared/errors/error-middleware.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { recordProblemResponse } from "../../observability/metrics.js";
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
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/shared/middleware/request-id.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestIdMiddleware: RequestHandler = (request, response, next) => {
  const incoming = request.header("x-request-id");
  const requestId = incoming && /^[a-zA-Z0-9_.:-]{8,128}$/.test(incoming) ? incoming : randomUUID();
  request.id = requestId;
  response.setHeader("x-request-id", requestId);
  next();
};

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/shared/middleware/not-found.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "route_not_found", `No route for ${request.method} ${request.path}`));
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/shared/validation/validate-request.ts</span>
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
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/architecture/service-boundary.ts</span>
  </div>

```ts
export const serviceBoundaryModel = {
  architecture: "modular-monolith-with-worker-boundary",
  apiService: {
    owns: ["HTTP routing", "request validation", "job creation", "job status responses"],
    mustNotOwn: ["long-running import execution", "BullMQ internal keys", "worker process lifecycle"]
  },
  workerService: {
    owns: ["job processing", "payload validation", "idempotent task writes", "cache invalidation"],
    mustNotOwn: ["public HTTP contract", "Express Request objects", "client-facing DTO versioning"]
  },
  dataOwners: ["PostgreSQL is business state", "Redis queue is delivery state", "Redis cache is derived state"]
} as const;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/src/architecture/migration-plan.ts</span>
  </div>

```ts
export const migrationPlan = [
  {
    step: "Keep domain modules inside one deployable API",
    signal: "Imports cross modules only through service functions"
  },
  {
    step: "Move slow retryable side effects behind a job contract",
    signal: "HTTP returns a job id instead of waiting for task import completion"
  },
  {
    step: "Run worker as a separate service",
    signal: "Compose has api and worker services sharing PostgreSQL and Redis"
  },
  {
    step: "Observe idempotency, retries, and cache invalidation",
    signal: "Checks prove duplicate imports do not create duplicate rows"
  }
] as const;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/scripts/smoke-test.ts</span>
  </div>

```ts
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

await waitForReady(baseUrl);

const live = await fetch(`${baseUrl}/v1/health/live`);
const ready = await fetch(`${baseUrl}/v1/health/ready`);

if (!live.ok) throw new Error(`live check failed: ${live.status}`);
if (!ready.ok) throw new Error(`ready check failed: ${ready.status}`);

console.log(JSON.stringify({ baseUrl, live: live.status, ready: ready.status }));
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/scripts/wait-for-ready.ts</span>
  </div>

```ts
export async function waitForReady(baseUrl: string, timeoutMs = 30000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/v1/health/ready`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseUrl}/v1/health/ready`);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/scripts/queue-check.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({ name: `Queue Check ${Date.now()}` })
});
if (!projectResponse.ok) throw new Error(`project create failed: ${projectResponse.status}`);
const project = await projectResponse.json() as { id: string };

const importResponse = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({
    idempotencyKey: `queue-check:${randomUUID()}`,
    tasks: [{ title: "queued task" }]
  })
});
if (importResponse.status !== 202) throw new Error(`queue check failed: ${importResponse.status}`);
const accepted = await importResponse.json() as { jobId: string; status: string };
if (!accepted.jobId || accepted.status !== "queued") throw new Error("queue check did not return queued job");
console.log(JSON.stringify({ queue: "task-import", jobId: accepted.jobId, status: accepted.status }));
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/scripts/worker-check.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

async function waitForJob(jobId: string): Promise<{ status: string }> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}`);
    const body = await response.json() as { status: string };
    if (body.status === "completed" || body.status === "failed") return body;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("worker check timed out");
}

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({ name: `Worker Check ${Date.now()}` })
});
const project = await projectResponse.json() as { id: string };

const importResponse = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({
    idempotencyKey: `worker-check:${randomUUID()}`,
    tasks: [{ title: "worker processed task" }]
  })
});
const accepted = await importResponse.json() as { jobId: string };
const result = await waitForJob(accepted.jobId);
if (result.status !== "completed") throw new Error(`worker check ended as ${result.status}`);
console.log(JSON.stringify({ worker: "task-import-worker", status: result.status }));
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/scripts/cache-check.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: `Cache Check ${Date.now()}` })
});
const project = await projectResponse.json() as { id: string };

await fetch(`${baseUrl}/v1/projects/${project.id}/tasks`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ title: `cache-task-${randomUUID()}` })
});

await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/invalidate`, { method: "POST" });

const first = await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/summary`);
const firstBody = await first.json() as { cacheStatus: string };
const second = await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/summary`);
const secondBody = await second.json() as { cacheStatus: string };
const invalidate = await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/invalidate`, { method: "POST" });
const invalidateBody = await invalidate.json() as { invalidated: boolean };

if (firstBody.cacheStatus !== "miss") throw new Error(`expected miss, got ${firstBody.cacheStatus}`);
if (secondBody.cacheStatus !== "hit") throw new Error(`expected hit, got ${secondBody.cacheStatus}`);
if (!invalidateBody.invalidated) throw new Error("expected invalidation to delete cached value");

console.log(JSON.stringify({ first: firstBody.cacheStatus, second: secondBody.cacheStatus, invalidated: invalidateBody.invalidated }));
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/scripts/consistency-check.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

async function waitForJob(jobId: string): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}`);
    const body = await response.json() as { status: string };
    if (body.status === "completed") return;
    if (body.status === "failed") throw new Error("job failed during consistency check");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("consistency check timed out");
}

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: `Consistency Check ${Date.now()}` })
});
const project = await projectResponse.json() as { id: string };
const idempotencyKey = `consistency-check:${randomUUID()}`;
const payload = {
  idempotencyKey,
  tasks: [{ title: "idempotent task" }]
};

const first = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});
const second = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});
const firstBody = await first.json() as { jobId: string };
const secondBody = await second.json() as { jobId: string; duplicate: boolean };
if (firstBody.jobId !== secondBody.jobId || !secondBody.duplicate) throw new Error("duplicate idempotency key did not return existing job");

await waitForJob(firstBody.jobId);
const tasksResponse = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks`);
const tasksBody = await tasksResponse.json() as { tasks: Array<{ title: string }> };
const matching = tasksBody.tasks.filter((task) => task.title === "idempotent task");
if (matching.length !== 1) throw new Error(`expected one imported task, got ${matching.length}`);

console.log(JSON.stringify({ duplicate: secondBody.duplicate, matchingTasks: matching.length }));
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/env.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { config, parseAllowedOrigins } from "../src/config/env.js";

test("config has a safe default public base URL for checks", () => {
  assert.equal(config.SMOKE_BASE_URL, process.env.SMOKE_BASE_URL ?? "http://localhost:8080");
  assert.deepEqual(parseAllowedOrigins("http://localhost:8080,http://127.0.0.1:8080"), ["http://localhost:8080", "http://127.0.0.1:8080"]);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/service-boundary.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { migrationPlan } from "../src/architecture/migration-plan.js";
import { serviceBoundaryModel } from "../src/architecture/service-boundary.js";

test("api and worker service responsibilities are separated", () => {
  assert.ok(serviceBoundaryModel.apiService.owns.includes("job creation"));
  assert.ok(serviceBoundaryModel.workerService.owns.includes("job processing"));
  assert.ok(migrationPlan.some((step) => step.step.includes("worker")));
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/job-contract.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildImportJobId, buildImportJobPayload, IMPORT_TASKS_JOB_NAME, IMPORT_TASKS_PAYLOAD_VERSION } from "../src/queue/job-contract.js";
import { parseImportTasksPayload } from "../src/queue/job-schemas.js";

test("import job contract fixes name, version, and idempotency identity", () => {
  const payload = buildImportJobPayload({
    projectId: "00000000-0000-4000-8000-000000000001",
    idempotencyKey: "job-contract:case-1",
    correlationId: "correlation-case-1",
    tasks: [{ title: "contract task", completed: false }],
    metadata: { source: "test" },
    failureMode: "none"
  });

  assert.equal(payload.name, IMPORT_TASKS_JOB_NAME);
  assert.equal(payload.version, IMPORT_TASKS_PAYLOAD_VERSION);
  assert.equal(buildImportJobId(payload.idempotencyKey), "tasks.import:job-contract:case-1");
  assert.equal(parseImportTasksPayload(payload).tasks.length, 1);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/idempotency.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildImportJobId } from "../src/queue/job-contract.js";

test("same idempotency key maps to same public job identity", () => {
  const first = buildImportJobId("same-key");
  const second = buildImportJobId("same-key");
  assert.equal(first, second);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/retry-policy.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { PermanentJobError, TransientJobError, classifyJobFailure, shouldRetryJob } from "../src/queue/retry-policy.js";

test("retry policy separates transient and permanent failures", () => {
  assert.equal(classifyJobFailure(new TransientJobError("temporary")), "transient");
  assert.equal(classifyJobFailure(new PermanentJobError("bad payload")), "permanent");
  assert.equal(shouldRetryJob("transient", 1, 3), true);
  assert.equal(shouldRetryJob("permanent", 1, 3), false);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/cache-consistency.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { projectSummaryCacheKey } from "../src/cache/cache-keys.js";
import { loadOncePerKey } from "../src/cache/stampede-guard.js";

test("cache keys are namespaced and stampede guard shares one loader", async () => {
  const key = projectSummaryCacheKey("00000000-0000-4000-8000-000000000001");
  assert.equal(key, "cache:v1:project-summary:00000000-0000-4000-8000-000000000001");

  let calls = 0;
  const [first, second] = await Promise.all([
    loadOncePerKey("guard:test", async () => {
      calls += 1;
      return "value";
    }),
    loadOncePerKey("guard:test", async () => {
      calls += 1;
      return "value";
    })
  ]);

  assert.equal(first, "value");
  assert.equal(second, "value");
  assert.equal(calls, 1);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/worker.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { parseImportTasksPayload } from "../src/queue/job-schemas.js";

test("worker payload validation rejects duplicate titles before processing", () => {
  assert.throws(() => parseImportTasksPayload({
    name: "tasks.import",
    version: "1",
    projectId: "00000000-0000-4000-8000-000000000001",
    idempotencyKey: "worker-unit:1",
    correlationId: "worker-unit-correlation",
    tasks: [{ title: "duplicate" }, { title: "duplicate" }]
  }));
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/api.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/api/app.js";
import { disconnectPrisma } from "../src/db/prisma.js";
import { closeTaskQueue } from "../src/queue/task-queue.js";
import { closeRedis } from "../src/redis/redis-client.js";

test("api exposes liveness and architecture boundary without database access", async (t) => {
  t.after(async () => {
    await Promise.allSettled([closeTaskQueue(), closeRedis(), disconnectPrisma()]);
  });

  const live = await request(app).get("/v1/health/live").expect(200);
  assert.equal(live.body.status, "live");

  const boundary = await request(app).get("/v1/architecture/service-boundary").expect(200);
  assert.equal(boundary.body.architecture, "modular-monolith-with-worker-boundary");
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/queue.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { taskQueue, closeTaskQueue } from "../src/queue/task-queue.js";

test("queue integration can read BullMQ queue counts", async (t) => {
  t.after(async () => {
    await closeTaskQueue();
  });

  const counts = await taskQueue.getJobCounts("waiting", "active", "completed", "failed");
  assert.ok(Object.prototype.hasOwnProperty.call(counts, "waiting"));
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/distributed-task-platform-lab/tests/cache.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { getRedisClient, closeRedis } from "../src/redis/redis-client.js";

test("cache integration can set and delete a namespaced Redis key", async (t) => {
  t.after(async () => {
    await closeRedis();
  });

  const client = await getRedisClient();
  const key = "cache:v1:test:integration";
  await client.set(key, "ok", { EX: 10 });
  assert.equal(await client.get(key), "ok");
  await client.del(key);
});
```
</div>

### 14.4 运行与测试

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
cd D:\\node.js\\mini-projects\\distributed-task-platform-lab\nnpm install\nnpm run prisma:generate\nnpm run typecheck\nnpm run build\ndocker compose config\ndocker compose build --no-cache --progress=plain api worker\ndocker compose up -d postgres redis\nnpm run prisma:migrate:deploy\nnpm run seed\ndocker compose up -d api worker nginx\nnpm test -- --test-concurrency=1\nnpm run smoke\nnpm run queue:check\nnpm run worker:check\nnpm run cache:check\nnpm run consistency:check\ndocker compose down
```
</div>

预期行为是：NGINX 入口 `http://localhost:8080` 返回 live/ready；POST import 返回 job id；worker 完成 job 后 job status 变成 `completed`；cache demo 先 miss 后 hit，写入或显式 invalidation 后重新 miss；duplicate idempotency key 返回同一 job id 且不产生重复 task。

### 14.5 执行与生命周期

请求从 client 到 NGINX，再到 API service。API service 解析 JSON body，Zod 验证 params/body，Prisma 创建 JobRecord，BullMQ Queue 将 job data 写入 Redis，然后 API 结束 response。Worker service 是另一个 Node process，它通过 BullMQ Worker 取 job，重新用 Zod 解析 payload，用 Prisma transaction upsert task rows 并更新 JobRecord/JobEvent，commit 后删除 Redis summary cache key。进程收到 `SIGINT` 或 `SIGTERM` 时，API 关闭 HTTP server、Queue、Redis、Prisma；worker 清理 readiness file，关闭 Worker、Queue、QueueEvents、Redis、Prisma。

### 14.6 常见错误

- 如果 `docker compose config` 中 PostgreSQL volume target 是 `/var/lib/postgresql/data`，PostgreSQL 18 可能因 data layout 不匹配启动失败；本项目使用 `/var/lib/postgresql`。
- 如果 smoke 默认访问 `localhost:3030`，它绕过了 NGINX；本项目默认 `http://localhost:8080`。
- 如果 worker payload 包含 Express Request 或 Prisma Client，对象无法跨进程序列化，也无法在 worker 重启后恢复。
- 如果 retry 没有 idempotency key 和 unique constraint，同一 job 的重复执行会产生重复业务行。
- 如果 metric label 使用 job id、project id、raw URL 或 query string，Prometheus series 会随请求增长。

## 15. 知识迁移与真实项目场景

把本章机制迁移到真实系统时，先保留 modular monolith 的模块边界，再把慢、可重试、可幂等、可观察的 side effect 放到 worker service。邮件、批量导入、报表生成、外部系统同步和 cache rebuild 是常见候选；认证、权限判断、必须同步返回的读取和强一致写入通常不应因为“架构升级”被强行放进 queue。

如果未来引入 Kubernetes，本章的 liveness/readiness、signals、resource limits 和 worker shutdown 模型仍然适用；但具体 manifest、resource requests/limits、rollout、service discovery 和 autoscaling 属于后续章节或真实平台验证，不在本地 lab 中生成。

## 16. 本章复盘任务

1. 解释为什么 queue 不自动带来可靠性，并指出 BullMQ/Redis、worker、PostgreSQL 各自负责什么。
2. 画出 POST import 到 worker completed 的链路，标明哪些状态是 durable，哪些状态是 derived。
3. 制造同一个 idempotency key 的重复请求，说明为什么最终只有一条 task。
4. 解释 `depends_on` 与 `condition: service_healthy` 的差别，并说明哪个信号来自 container，哪个信号来自应用。
5. 设计一个错误 metric label，然后解释为什么它是高基数风险。
6. 说明 OpenAPI 为什么只描述公共 HTTP，不描述 BullMQ 内部 delivery semantics。

## 17. 最终心智模型

本章的稳定模型是：API service 接受请求并创建可观察 job；queue 存储 delivery attempt；worker 独立处理 side effect；PostgreSQL 保存事实；Redis cache 保存可丢弃派生读；NGINX 是公共入口；Compose 是本地 runtime 边界；metrics、JobRecord、JobEvent、health/readiness 和 check scripts 是证据。架构设计不是追求拆分，而是让 owner、contract、idempotency、retry、timeout、cache 和 observable signal 对齐。

## 18. 官方资料

- [Node.js process](https://nodejs.org/api/process.html)：signals、exit、process lifecycle。
- [Node.js timers](https://nodejs.org/api/timers.html)：timer handle、timeout cleanup。
- [Node.js AbortController](https://nodejs.org/api/globals.html#class-abortcontroller)：cancellation signal。
- [Node.js test runner](https://nodejs.org/api/test.html)：`node --test` 和低并发验证。
- [Node.js worker_threads](https://nodejs.org/api/worker_threads.html)：CPU worker 与 worker service 的边界参考。
- [Node.js packages](https://nodejs.org/api/packages.html)：`type: "module"` 与 package boundary。
- [Express routing](https://expressjs.com/en/guide/routing/) 与 [Express error handling](https://expressjs.com/en/guide/error-handling/)：route、middleware、async error flow。
- [TypeScript TSConfig](https://www.typescriptlang.org/tsconfig/) 与 [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)：strict、NodeNext、module resolution。
- [Zod basics](https://zod.dev/basics)：runtime schema、parse、safeParse、inferred types。
- [Prisma ORM v7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)、[seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)、[database connections](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections)：driver adapter、seed、connection ownership。
- [PostgreSQL 18 transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)、[constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)、[indexes](https://www.postgresql.org/docs/current/indexes.html)：transaction、unique constraint、index。
- [BullMQ Queues](https://docs.bullmq.io/guide/queues)、[Workers](https://docs.bullmq.io/guide/workers)、[retrying failing jobs](https://docs.bullmq.io/guide/retrying-failing-jobs)、[stalled jobs](https://docs.bullmq.io/guide/jobs/stalled)、[graceful shutdown](https://docs.bullmq.io/guide/workers/graceful-shutdown)：Queue、Worker、attempts、backoff、stalled、shutdown。
- [Redis EXPIRE](https://redis.io/docs/latest/commands/expire/) 与 [TTL](https://redis.io/docs/latest/commands/ttl/)：cache TTL 和 key lifecycle。
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)、[Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)、[Compose services reference](https://docs.docker.com/reference/compose-file/services/)：build、healthcheck、service_healthy、services。
- [NGINX proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)：`proxy_pass`、`proxy_set_header`。
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)、[npm install](https://docs.npmjs.com/cli/v11/commands/npm-install)、[npm run-script](https://docs.npmjs.com/cli/v11/commands/npm-run-script)：scripts、install、run lifecycle。
- [OpenAPI Specification latest](https://spec.openapis.org/oas/latest.html)：Chapter 14 continuity；本章项目保留 tooling-compatible `openapi: 3.1.1`，官方最新参考为 OpenAPI 3.2.0。

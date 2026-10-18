# Node.js 第 10 章：生产可观测性、结构化日志、指标、Tracing、健康检查与诊断边界

<style>
.macos-code-window { overflow: hidden; border: 1px solid #30363d; border-radius: 12px; background: #0d1117; margin: 16px 0; }
.macos-code-titlebar { display: flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 12px; background: #161b22; border-bottom: 1px solid #30363d; }
.macos-code-dot { width: 12px; height: 12px; border-radius: 999px; display: inline-block; flex: 0 0 auto; }
.macos-code-dot-red { background: #ff5f57; }
.macos-code-dot-yellow { background: #ffbd2e; }
.macos-code-dot-green { background: #28c840; }
.macos-code-title { margin-left: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #c9d1d9; }
.macos-code-titlebar + pre { margin: 0; padding: 16px; overflow-x: auto; background: transparent; border-radius: 0 0 12px 12px; }
.macos-code-titlebar + pre code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; }
</style>

> 适用版本：Node.js 26.x；npm 11.x；TypeScript 7.x；Express 5.x；Prisma 7.x；Redis node-redis 6.x。
>
> 本章边界：本章只讲单个 Node.js API 服务内的生产可观测性基础，包括结构化日志、redaction、AsyncLocalStorage、metrics、health checks、OpenTelemetry manual spans、Prisma/Redis dependency diagnostics、process diagnostics 与可测试边界；不实现 Docker、Kubernetes、cloud vendor、dashboard、alerting、collector 或前端 RUM。

## 目录

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
  - [9.1 Observability versus debugging](#section-9-1)
  - [9.2 Logs, metrics, traces, health checks, and diagnostic reports](#section-9-2)
  - [9.3 Structured JSON logging and log levels](#section-9-3)
  - [9.4 Sensitive-data redaction and log injection defense](#section-9-4)
  - [9.5 Request ID, correlation ID, and AsyncLocalStorage](#section-9-5)
  - [9.6 Express request logging middleware](#section-9-6)
  - [9.7 Express error logging and safe client responses](#section-9-7)
  - [9.8 Health checks：liveness versus readiness](#section-9-8)
  - [9.9 Dependency readiness：PostgreSQL and Redis](#section-9-9)
  - [9.10 Metrics model：counter、gauge、histogram](#section-9-10)
  - [9.11 HTTP request metrics：count、duration、status class](#section-9-11)
  - [9.12 Event loop delay and process resource metrics](#section-9-12)
  - [9.13 Metrics label cardinality and safety boundary](#section-9-13)
  - [9.14 `/metrics` endpoint and Prometheus scrape boundary](#section-9-14)
  - [9.15 Tracing model：trace、span、attributes、context](#section-9-15)
  - [9.16 OpenTelemetry NodeSDK setup and initialization order](#section-9-16)
  - [9.17 Manual spans around service, database, and Redis work](#section-9-17)
  - [9.18 Log and trace correlation：requestId、traceId、spanId](#section-9-18)
  - [9.19 Prisma and Redis observability boundaries](#section-9-19)
  - [9.20 Node diagnostics：diagnostics_channel、process warnings、diagnostic report](#section-9-20)
  - [9.21 Testing observability：logs、metrics、health、traces](#section-9-21)
  - [9.22 Chapter integration: observable-notes-api](#section-9-22)
- [10. API 与规则索引](#10-api-与规则索引)
- [11. 常见错误对照表](#11-常见错误对照表)
- [12. 调试与验证方法](#12-调试与验证方法)
- [13. 分项练习说明](#13-分项练习说明)
- [14. 最终迷你项目](#14-最终迷你项目)
  - [14.1 项目目标](#141-项目目标)
  - [14.2 最终迷你项目结构](#142-最终迷你项目结构)
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
| 区分可观测信号 | `practices/10-observability-diagnostics/01-observability-model/logs-metrics-traces-health.ts` | 输出每类 signal 回答的问题 |
| 建立结构化日志 | `practices/10-observability-diagnostics/02-structured-logging/json-log-shape.ts` | JSON 字段包含 level、time、requestId、route、statusCode、durationMs |
| 验证 redaction | `mini-projects/observable-notes-api/src/observability/log-redaction.ts` | 敏感键输出为 `[REDACTED]` |
| 传播 requestId | `mini-projects/observable-notes-api/src/observability/request-context.ts` | await 之后仍读取同一 store |
| 记录 HTTP metrics | `mini-projects/observable-notes-api/src/observability/http-metrics.ts` | counter 与 histogram 使用 method、route、status_class |
| 检查 readiness | `mini-projects/observable-notes-api/src/health/health.service.ts` | PostgreSQL 与 Redis 只返回 ready/unavailable |
| 公开 metrics | `mini-projects/observable-notes-api/src/observability/metrics.routes.ts` | HTTP 响应为 Prometheus text |
| 创建 manual span | `mini-projects/observable-notes-api/src/observability/spans.ts` | service/dependency operation 被包进 span |
| 保护诊断报告 | `mini-projects/observable-notes-api/src/observability/diagnostic-report.ts` | helper 返回私有文件路径且没有 public route |

## 0. 章前定位

前九章已经建立 Node.js runtime、core I/O、Express、TypeScript 分层、Prisma/PostgreSQL、auth、Redis、文件上传和 realtime lifecycle。第 10 章只回答生产运行时的问题：服务在线时，如何知道请求变慢、错误率升高、依赖不可用、event loop 被阻塞或进程进入异常状态。

## 1. 学习目标

- 设计 structured JSON logs，并使用 Pino redaction 控制敏感字段。
- 用 AsyncLocalStorage 传播 requestId，并识别 context loss 边界。
- 用 prom-client 记录 HTTP counter、duration histogram、event loop delay、process memory 和 uptime。
- 区分 liveness 与 readiness，并安全检查 PostgreSQL/Redis。
- 用 OpenTelemetry NodeSDK 与 manual spans 表达 service/database/Redis 工作边界。
- 用 tests 验证 redaction、request context、metrics labels、health semantics 和 safe error response。

## 2. 前置知识

需要已经理解 Express middleware/error middleware、TypeScript strict mode、Zod runtime validation、Prisma repository、Redis client lifecycle、session cookie/CSRF、Node process events、timers 和 async/await。

## 3. 环境与运行基线

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
$env:NODE_ENV = "test"
npm test
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
NODE_ENV=test npm test
```
</div>

## 4. 第一性原理

可观测性不是临时打印字符串，而是为运行中的系统预先设计可查询证据。日志说明单次事件，指标说明数量和分布，trace 说明路径和耗时，health check 说明接流量能力，diagnostic report 说明严重故障时的进程状态。官方资料确认的关键边界是：AsyncLocalStorage 负责 async context；perf_hooks 能测量 event loop delay；process events 与 report 属于诊断边界；Express middleware 决定 request pipeline；Prometheus labels 必须低基数；OpenTelemetry 初始化顺序会影响 instrumentation。

## 5. 技术边界模型

| 层 | 本章责任 | 不负责 |
| --- | --- | --- |
| TypeScript | 约束本地函数和 DTO 形状 | 验证 HTTP body 真实值 |
| Node runtime | process events、AsyncLocalStorage、perf_hooks、diagnostic report | 业务授权 |
| Express | middleware 顺序、response finish、error middleware | 自动保护敏感日志 |
| Pino | JSON log 与 redaction 配置 | 决定业务错误语义 |
| prom-client | registry、counter、gauge、histogram、metrics text | 保存高基数字段 |
| OpenTelemetry | trace、span、context 与 instrumentation | 替代日志或指标 |
| Prisma | database call 与错误边界 | 暴露原始连接串 |
| Redis | readiness、connection events、PING boundary | 作为日志系统 |

## 6. 底层机制模型

```txt
HTTP request -> requestId middleware -> AsyncLocalStorage store -> route/service/repository -> response finish -> log + metric + trace correlation
health probe -> live process check or ready dependency checks -> safe status response
process event -> warning/rejection/exception handler -> redacted log or private diagnostic report
```

## 7. 核心术语

| Concept | Layer | Meaning | Common Mistake |
| --- | --- | --- | --- |
| log | logging | 单次事件的结构化记录 | 记录 password 或 raw body |
| metric | metrics | 可聚合数值时间序列 | label 放 userId、requestId |
| trace | tracing | 一次操作路径中的 span 关系 | SDK 启动晚于 app import |
| health check | HTTP/runtime | 判断进程或依赖是否可接流量 | liveness 查询数据库 |
| diagnostic report | Node diagnostics | 严重故障进程状态快照 | 做成 public HTTP endpoint |
| cardinality | metrics | label value 数量规模 | label 放 email、noteId、traceId |

## 8. 本章实践路线

先建立 signal model，再实现 structured logging、redaction、request context、request/error logging、metrics、health、tracing、diagnostics 和 tests。实践入口如下：

- `practices/10-observability-diagnostics/01-observability-model/debugging-versus-observability.ts`
- `practices/10-observability-diagnostics/01-observability-model/logs-metrics-traces-health.ts`
- `practices/10-observability-diagnostics/01-observability-model/production-signal-map.ts`
- `practices/10-observability-diagnostics/02-structured-logging/json-log-shape.ts`
- `practices/10-observability-diagnostics/02-structured-logging/log-injection-sanitization.ts`
- `practices/10-observability-diagnostics/02-structured-logging/log-level-boundary.ts`
- `practices/10-observability-diagnostics/02-structured-logging/log-redaction.ts`
- `practices/10-observability-diagnostics/02-structured-logging/request-id-async-local-storage.ts`
- `practices/10-observability-diagnostics/02-structured-logging/trace-log-correlation.ts`
- `practices/10-observability-diagnostics/03-metrics/event-loop-delay.ts`
- `practices/10-observability-diagnostics/03-metrics/http-request-duration.ts`
- `practices/10-observability-diagnostics/03-metrics/low-cardinality-labels.ts`
- `practices/10-observability-diagnostics/03-metrics/metric-types-counter-gauge-histogram.ts`
- `practices/10-observability-diagnostics/03-metrics/metrics-endpoint-boundary.ts`
- `practices/10-observability-diagnostics/03-metrics/process-resource-metrics.ts`
- `practices/10-observability-diagnostics/04-health-diagnostics/diagnostic-report-privacy.ts`
- `practices/10-observability-diagnostics/04-health-diagnostics/liveness-readiness.ts`
- `practices/10-observability-diagnostics/04-health-diagnostics/postgres-readiness-check.ts`
- `practices/10-observability-diagnostics/04-health-diagnostics/process-warnings.ts`
- `practices/10-observability-diagnostics/04-health-diagnostics/redis-readiness-check.ts`
- `practices/10-observability-diagnostics/04-health-diagnostics/unhandled-rejection-boundary.ts`
- `practices/10-observability-diagnostics/05-tracing/async-context-boundary.ts`
- `practices/10-observability-diagnostics/05-tracing/manual-span.ts`
- `practices/10-observability-diagnostics/05-tracing/otel-initialization-order.ts`
- `practices/10-observability-diagnostics/05-tracing/redis-span-boundary.ts`
- `practices/10-observability-diagnostics/05-tracing/service-database-span.ts`
- `practices/10-observability-diagnostics/06-testing-observability/healthcheck-test.ts`
- `practices/10-observability-diagnostics/06-testing-observability/log-redaction-test.ts`
- `practices/10-observability-diagnostics/06-testing-observability/metrics-registry-test.ts`
- `practices/10-observability-diagnostics/06-testing-observability/request-context-test.ts`
- `practices/10-observability-diagnostics/06-testing-observability/safe-error-log-test.ts`

## 9. 核心教学

<a id="section-9-1"></a>

### 9.1 Observability versus debugging

**结论：** 本节聚焦 debugging pauses or prints one local execution, while observability records production signals after the execution already happened。

**本节解决的问题：** 当 incoming request, dependency check, process event, or background operation 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 signal objects with requestId, route pattern, status, duration, dependency state, and private report path 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 signal objects with requestId, route pattern, status, duration, dependency state, and private report path。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `AsyncLocalStorage.run()`, Express middleware, logger, metrics registry, span API, health route, and process report API 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：incoming request, dependency check, process event, or background operation。值：signal objects with requestId, route pattern, status, duration, dependency state, and private report path。API: `AsyncLocalStorage.run()`, Express middleware, logger, metrics registry, span API, health route, and process report API。调度/资源边界：request context, HTTP response, metric registry, trace span, dependency socket, and private file。生命周期转移：request start, response finish, dependency ready or unavailable, span end, and report write。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：structured log, Prometheus sample, trace waterfall, health response, or private diagnostic report。失败规则：using ad hoc console output as the production evidence model。

**API / 语法规则：** 本节应直接识别 `AsyncLocalStorage.run()`, Express middleware, logger, metrics registry, span API, health route, and process report API 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/01-observability-model/logs-metrics-traces-health.ts</span>
  </div>

```ts
type Signal = { name: string; question: string; example: Record<string, string | number | boolean> };
const signals: Signal[] = [
  { name: "log", question: "What happened for one operation?", example: { requestId: "req_123", route: "/notes/:noteId" } },
  { name: "metric", question: "How often or how much is it happening?", example: { name: "http_requests_total", status_class: "2xx" } },
  { name: "trace", question: "Where did time go across steps?", example: { traceId: "trace_123", span: "notes.list" } },
  { name: "health", question: "Can this service receive traffic?", example: { endpoint: "/health/ready", postgres: "ready" } },
  { name: "diagnostic-report", question: "What process state existed during severe failure?", example: { publicEndpoint: false } }
];
for (const signal of signals) console.log(JSON.stringify(signal));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 signal objects with requestId, route pattern, status, duration, dependency state, and private report path 固定在 `AsyncLocalStorage.run()`, Express middleware, logger, metrics registry, span API, health route, and process report API 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 structured log, Prometheus sample, trace waterfall, health response, or private diagnostic report。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/01-observability-model/logs-metrics-traces-health.ts
```
</div>

**预期输出：** 输出应能证明 request start, response finish, dependency ready or unavailable, span end, and report write 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 incoming request, dependency check, process event, or background operation 开始，代码把 signal objects with requestId, route pattern, status, duration, dependency state, and private report path 交给 `AsyncLocalStorage.run()`, Express middleware, logger, metrics registry, span API, health route, and process report API；Node/Express 在 request context, HTTP response, metric registry, trace span, dependency socket, and private file 上推进生命周期，最后产生 structured log, Prometheus sample, trace waterfall, health response, or private diagnostic report。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 request context, HTTP response, metric registry, trace span, dependency socket, and private file；生命周期转移是 request start, response finish, dependency ready or unavailable, span end, and report write；转移完成后，测试或运维系统只能看到 structured log, Prometheus sample, trace waterfall, health response, or private diagnostic report。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 using ad hoc console output as the production evidence model，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 signal objects with requestId, route pattern, status, duration, dependency state, and private report path 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 using ad hoc console output as the production evidence model。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** `observable-notes-api` keeps business behavior stable and adds request logs, metrics, traces, health checks, and reports as observation layers。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-2"></a>

### 9.2 Logs, metrics, traces, health checks, and diagnostic reports

**结论：** 本节聚焦 each signal answers a different production question instead of being a different spelling of the same debug dump。

**本节解决的问题：** 当 slow route, high error rate, unavailable dependency, memory growth, or event-loop delay 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 symptom names mapped to log searches, metric names, traces, readiness probes, and reports 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 symptom names mapped to log searches, metric names, traces, readiness probes, and reports。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 Pino logging, prom-client metrics, OpenTelemetry spans, Express health routes, and Node process reports 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：slow route, high error rate, unavailable dependency, memory growth, or event-loop delay。值：symptom names mapped to log searches, metric names, traces, readiness probes, and reports。API: Pino logging, prom-client metrics, OpenTelemetry spans, Express health routes, and Node process reports。调度/资源边界：log storage, metric registry, trace backend, readiness route, and private filesystem。生命周期转移：event captured, number aggregated, path timed, traffic accepted or rejected, report generated。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：queryable signal set for each symptom。失败规则：using one `/health` or one log line to represent every failure mode。

**API / 语法规则：** 本节应直接识别 Pino logging, prom-client metrics, OpenTelemetry spans, Express health routes, and Node process reports 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/01-observability-model/production-signal-map.ts</span>
  </div>

```ts
const signalMap = new Map<string, string[]>([
  ["slow request", ["http_request_duration_seconds", "trace spans", "request logs"]],
  ["high error rate", ["http_requests_total", "error logs"]],
  ["database unavailable", ["readiness", "Prisma error log", "database span"]],
  ["Redis unavailable", ["readiness", "Redis client event", "Redis span"]],
  ["memory growth", ["process_resident_memory_bytes", "private diagnostic report"]],
  ["event loop delay", ["nodejs_event_loop_delay_seconds"]]
]);
for (const [symptom, signals] of signalMap) console.log(`${symptom}: ${signals.join(", ")}`);
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 symptom names mapped to log searches, metric names, traces, readiness probes, and reports 固定在 Pino logging, prom-client metrics, OpenTelemetry spans, Express health routes, and Node process reports 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 queryable signal set for each symptom。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/01-observability-model/production-signal-map.ts
```
</div>

**预期输出：** 输出应能证明 event captured, number aggregated, path timed, traffic accepted or rejected, report generated 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 slow route, high error rate, unavailable dependency, memory growth, or event-loop delay 开始，代码把 symptom names mapped to log searches, metric names, traces, readiness probes, and reports 交给 Pino logging, prom-client metrics, OpenTelemetry spans, Express health routes, and Node process reports；Node/Express 在 log storage, metric registry, trace backend, readiness route, and private filesystem 上推进生命周期，最后产生 queryable signal set for each symptom。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 log storage, metric registry, trace backend, readiness route, and private filesystem；生命周期转移是 event captured, number aggregated, path timed, traffic accepted or rejected, report generated；转移完成后，测试或运维系统只能看到 queryable signal set for each symptom。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 using one `/health` or one log line to represent every failure mode，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 symptom names mapped to log searches, metric names, traces, readiness probes, and reports 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 using one `/health` or one log line to represent every failure mode。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** the project separates `/health/live`, `/health/ready`, `/metrics`, logs, traces, and local diagnostic reports。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-3"></a>

### 9.3 Structured JSON logging and log levels

**结论：** 本节聚焦 a log line is a stable event object plus severity, not a sentence that humans later regex by hand。

**本节解决的问题：** 当 request completion, warning condition, or server error 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 level, message, requestId, method, route, statusCode, durationMs, traceId, and safe error fields 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 level, message, requestId, method, route, statusCode, durationMs, traceId, and safe error fields。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `logger.info()`, `logger.warn()`, `logger.error()`, redaction helper, and sanitization helper 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：request completion, warning condition, or server error。值：level, message, requestId, method, route, statusCode, durationMs, traceId, and safe error fields。API: `logger.info()`, `logger.warn()`, `logger.error()`, redaction helper, and sanitization helper。调度/资源边界：stdout stream or logging transport plus the current request context。生命周期转移：object creation, redaction, serialization, and log line write。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：single-line JSON that can be indexed by field。失败规则：hiding business failures in info logs or putting secrets in structured fields。

**API / 语法规则：** 本节应直接识别 `logger.info()`, `logger.warn()`, `logger.error()`, redaction helper, and sanitization helper 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/02-structured-logging/json-log-shape.ts</span>
  </div>

```ts
type RequestLog = { level: "info"; time: string; message: string; requestId: string; route: string; statusCode: number; durationMs: number };
const log: RequestLog = { level: "info", time: new Date("2026-01-01T00:00:00.000Z").toISOString(), message: "request completed", requestId: "req_01", route: "/notes/:noteId", statusCode: 200, durationMs: 18.4 };
console.log(JSON.stringify(log));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 level, message, requestId, method, route, statusCode, durationMs, traceId, and safe error fields 固定在 `logger.info()`, `logger.warn()`, `logger.error()`, redaction helper, and sanitization helper 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 single-line JSON that can be indexed by field。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/02-structured-logging/json-log-shape.ts
```
</div>

**预期输出：** 输出应能证明 object creation, redaction, serialization, and log line write 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 request completion, warning condition, or server error 开始，代码把 level, message, requestId, method, route, statusCode, durationMs, traceId, and safe error fields 交给 `logger.info()`, `logger.warn()`, `logger.error()`, redaction helper, and sanitization helper；Node/Express 在 stdout stream or logging transport plus the current request context 上推进生命周期，最后产生 single-line JSON that can be indexed by field。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 stdout stream or logging transport plus the current request context；生命周期转移是 object creation, redaction, serialization, and log line write；转移完成后，测试或运维系统只能看到 single-line JSON that can be indexed by field。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 hiding business failures in info logs or putting secrets in structured fields，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 level, message, requestId, method, route, statusCode, durationMs, traceId, and safe error fields 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 hiding business failures in info logs or putting secrets in structured fields。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** request and error logs use objects so fields can be tested and correlated。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-4"></a>

### 9.4 Sensitive-data redaction and log injection defense

**结论：** 本节聚焦 redaction removes secrets and sanitization prevents attacker-controlled text from changing log structure。

**本节解决的问题：** 当 external headers, cookies, request body, thrown error, or environment-derived value entering a log field 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 password, token, cookie, authorization, database URL, Redis URL, stack, and multiline message values 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 password, token, cookie, authorization, database URL, Redis URL, stack, and multiline message values。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `redactSensitiveData()` and `sanitizeLogField()` before the logger receives payloads 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：external headers, cookies, request body, thrown error, or environment-derived value entering a log field。值：password, token, cookie, authorization, database URL, Redis URL, stack, and multiline message values。API: `redactSensitiveData()` and `sanitizeLogField()` before the logger receives payloads。调度/资源边界：untrusted request data and the long-lived log sink。生命周期转移：unknown value received, sensitive keys replaced, control characters normalized, safe payload serialized。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：log line with diagnostic shape but without secrets or forged lines。失败规则：assuming the JSON logger knows which application fields are secret。

**API / 语法规则：** 本节应直接识别 `redactSensitiveData()` and `sanitizeLogField()` before the logger receives payloads 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/02-structured-logging/log-redaction.ts</span>
  </div>

```ts
const sensitiveKeyPattern = /password|cookie|authorization|csrf|session|token|database_url|redis_url|databaseUrl|redisUrl/i;
export function redactLogValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactLogValue);
  if (!value || typeof value !== "object") return value;
  const output: Record<string, unknown> = {};
  for (const [key, childValue] of Object.entries(value)) output[key] = sensitiveKeyPattern.test(key) ? "[REDACTED]" : redactLogValue(childValue);
  return output;
}
console.log(JSON.stringify(redactLogValue({ password: "secret", nested: { cookie: "sid=1" } })));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 password, token, cookie, authorization, database URL, Redis URL, stack, and multiline message values 固定在 `redactSensitiveData()` and `sanitizeLogField()` before the logger receives payloads 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 log line with diagnostic shape but without secrets or forged lines。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/02-structured-logging/log-redaction.ts
```
</div>

**预期输出：** 输出应能证明 unknown value received, sensitive keys replaced, control characters normalized, safe payload serialized 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 external headers, cookies, request body, thrown error, or environment-derived value entering a log field 开始，代码把 password, token, cookie, authorization, database URL, Redis URL, stack, and multiline message values 交给 `redactSensitiveData()` and `sanitizeLogField()` before the logger receives payloads；Node/Express 在 untrusted request data and the long-lived log sink 上推进生命周期，最后产生 log line with diagnostic shape but without secrets or forged lines。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 untrusted request data and the long-lived log sink；生命周期转移是 unknown value received, sensitive keys replaced, control characters normalized, safe payload serialized；转移完成后，测试或运维系统只能看到 log line with diagnostic shape but without secrets or forged lines。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 assuming the JSON logger knows which application fields are secret，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 password, token, cookie, authorization, database URL, Redis URL, stack, and multiline message values 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 assuming the JSON logger knows which application fields are secret。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** redaction and sanitization are shared by request/error logging and validated by tests。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-5"></a>

### 9.5 Request ID, correlation ID, and AsyncLocalStorage

**结论：** 本节聚焦 request-scoped identity follows the async resource chain instead of living in a process-wide variable。

**本节解决的问题：** 当 Express request entering middleware before handlers await service, Prisma, or Redis work 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 requestId and optional correlation metadata stored in a typed request context 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 requestId and optional correlation metadata stored in a typed request context。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `AsyncLocalStorage.run()`, `getStore()`, Express `next()`, and project request context helpers 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：Express request entering middleware before handlers await service, Prisma, or Redis work。值：requestId and optional correlation metadata stored in a typed request context。API: `AsyncLocalStorage.run()`, `getStore()`, Express `next()`, and project request context helpers。调度/资源边界：Node async resource chain, promise continuations, timers, and request context store。生命周期转移：context created, callback entered, async work continues, context read by logger or span helper。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：same requestId on related logs and different requestIds for concurrent requests。失败规则：using a module-level variable for per-request identity。

**API / 语法规则：** 本节应直接识别 `AsyncLocalStorage.run()`, `getStore()`, Express `next()`, and project request context helpers 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/02-structured-logging/request-id-async-local-storage.ts</span>
  </div>

```ts
import { AsyncLocalStorage } from "node:async_hooks";
const requestContext = new AsyncLocalStorage<{ requestId: string }>();
async function loadNoteTitle(): Promise<string> {
  await Promise.resolve();
  return `request=${requestContext.getStore()?.requestId ?? "missing"}`;
}
await requestContext.run({ requestId: "req_123" }, async () => console.log(await loadNoteTitle()));
const detachedCallback = () => requestContext.getStore()?.requestId ?? "missing";
console.log(detachedCallback());
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 requestId and optional correlation metadata stored in a typed request context 固定在 `AsyncLocalStorage.run()`, `getStore()`, Express `next()`, and project request context helpers 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 same requestId on related logs and different requestIds for concurrent requests。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/02-structured-logging/request-id-async-local-storage.ts
```
</div>

**预期输出：** 输出应能证明 context created, callback entered, async work continues, context read by logger or span helper 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 Express request entering middleware before handlers await service, Prisma, or Redis work 开始，代码把 requestId and optional correlation metadata stored in a typed request context 交给 `AsyncLocalStorage.run()`, `getStore()`, Express `next()`, and project request context helpers；Node/Express 在 Node async resource chain, promise continuations, timers, and request context store 上推进生命周期，最后产生 same requestId on related logs and different requestIds for concurrent requests。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 Node async resource chain, promise continuations, timers, and request context store；生命周期转移是 context created, callback entered, async work continues, context read by logger or span helper；转移完成后，测试或运维系统只能看到 same requestId on related logs and different requestIds for concurrent requests。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 using a module-level variable for per-request identity，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 requestId and optional correlation metadata stored in a typed request context 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 using a module-level variable for per-request identity。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** request logger, error logger, and trace correlation read the same context。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-6"></a>

### 9.6 Express request logging middleware

**结论：** 本节聚焦 completion logging belongs on `response.finish` because status and duration are not final at request entry。

**本节解决的问题：** 当 incoming HTTP request passing through middleware and later finishing or failing 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 method, route pattern, statusCode, durationSeconds, requestId, traceId, and spanId 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 method, route pattern, statusCode, durationSeconds, requestId, traceId, and spanId。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 Express `RequestHandler`, `response.on('finish')`, `performance.now()`, `getRoutePattern()`, and `observeHttpRequest()` 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：incoming HTTP request passing through middleware and later finishing or failing。值：method, route pattern, statusCode, durationSeconds, requestId, traceId, and spanId。API: Express `RequestHandler`, `response.on('finish')`, `performance.now()`, `getRoutePattern()`, and `observeHttpRequest()`。调度/资源边界：HTTP response object, socket lifecycle, request context, metric registry, and log stream。生命周期转移：middleware entered, listener registered, handler delegated, response finished, log and metric written。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：request completed log and HTTP counter/histogram observation。失败规则：logging raw URL or final status before the response finishes。

**API / 语法规则：** 本节应直接识别 Express `RequestHandler`, `response.on('finish')`, `performance.now()`, `getRoutePattern()`, and `observeHttpRequest()` 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/request-logger.ts</span>
  </div>

```ts
import { performance } from "node:perf_hooks";
import type { Request, RequestHandler } from "express";
import { logger } from "./logger.js";
import { sanitizeLogField, sanitizeRoutePattern } from "./log-sanitization.js";
import { observeHttpRequest } from "./http-metrics.js";
import { getActiveTraceFields } from "./tracing.js";
import { getRequestContext } from "./request-context.js";

export function getRoutePattern(request: Request): string {
  const routePath = typeof request.route?.path === "string" ? request.route.path : "unmatched";
  if (routePath === "unmatched") return "unmatched";
  return sanitizeRoutePattern(`${request.baseUrl}${routePath}` || "/");
}

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();

  response.on("finish", () => {
    const durationSeconds = (performance.now() - startedAt) / 1000;
    const route = getRoutePattern(request);
    const traceFields = getActiveTraceFields();
    const context = getRequestContext();

    observeHttpRequest(request.method, route, response.statusCode, durationSeconds);

    logger.info({
      requestId: context?.requestId,
      traceId: traceFields.traceId,
      spanId: traceFields.spanId,
      method: sanitizeLogField(request.method),
      route,
      statusCode: response.statusCode,
      durationMs: Number((durationSeconds * 1000).toFixed(2))
    }, "request completed");
  });

  next();
};
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 method, route pattern, statusCode, durationSeconds, requestId, traceId, and spanId 固定在 Express `RequestHandler`, `response.on('finish')`, `performance.now()`, `getRoutePattern()`, and `observeHttpRequest()` 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 request completed log and HTTP counter/histogram observation。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx mini-projects/observable-notes-api/src/observability/request-logger.ts
```
</div>

**预期输出：** 输出应能证明 middleware entered, listener registered, handler delegated, response finished, log and metric written 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 incoming HTTP request passing through middleware and later finishing or failing 开始，代码把 method, route pattern, statusCode, durationSeconds, requestId, traceId, and spanId 交给 Express `RequestHandler`, `response.on('finish')`, `performance.now()`, `getRoutePattern()`, and `observeHttpRequest()`；Node/Express 在 HTTP response object, socket lifecycle, request context, metric registry, and log stream 上推进生命周期，最后产生 request completed log and HTTP counter/histogram observation。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 HTTP response object, socket lifecycle, request context, metric registry, and log stream；生命周期转移是 middleware entered, listener registered, handler delegated, response finished, log and metric written；转移完成后，测试或运维系统只能看到 request completed log and HTTP counter/histogram observation。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 logging raw URL or final status before the response finishes，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 method, route pattern, statusCode, durationSeconds, requestId, traceId, and spanId 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 logging raw URL or final status before the response finishes。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** `request-logger.ts` owns the shared route-pattern rule for logs and metrics。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-7"></a>

### 9.7 Express error logging and safe client responses

**结论：** 本节聚焦 server error logs keep diagnostic fields while client responses keep only safe public error shape。

**本节解决的问题：** 当 thrown or rejected route handler value entering Express error middleware 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 unknown error, requestId, method, route pattern or query-stripped path, and redacted error details 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 unknown error, requestId, method, route pattern or query-stripped path, and redacted error details。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 Express `ErrorRequestHandler`, `getRoutePattern()`, `request.path`, `sanitizeLogField()`, `redactSensitiveData()`, and `next(error)` 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：thrown or rejected route handler value entering Express error middleware。值：unknown error, requestId, method, route pattern or query-stripped path, and redacted error details。API: Express `ErrorRequestHandler`, `getRoutePattern()`, `request.path`, `sanitizeLogField()`, `redactSensitiveData()`, and `next(error)`。调度/资源边界：Express request/response pair, server log sink, and downstream error response middleware。生命周期转移：error received, safe route selected, error serialized, server log written, error delegated。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：redacted error log and safe HTTP error response。失败规则：logging raw original URLs with query strings or returning stack traces to clients。

**API / 语法规则：** 本节应直接识别 Express `ErrorRequestHandler`, `getRoutePattern()`, `request.path`, `sanitizeLogField()`, `redactSensitiveData()`, and `next(error)` 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/error-logger.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { getRequestContext } from "./request-context.js";
import { logger } from "./logger.js";
import { redactSensitiveData } from "./log-redaction.js";
import { sanitizeLogField } from "./log-sanitization.js";
import { getRoutePattern } from "./request-logger.js";

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return redactSensitiveData({
      name: error.name,
      message: error.message,
      stack: error.stack
    }) as Record<string, unknown>;
  }

  return { message: sanitizeLogField(error) };
}

export const errorLogger: ErrorRequestHandler = (error, request, _response, next) => {
  const context = getRequestContext();
  const routePattern = getRoutePattern(request);
  const safeRoute = routePattern === "unmatched" ? sanitizeLogField(request.path || "unmatched") : routePattern;

  logger.error({
    requestId: context?.requestId,
    method: sanitizeLogField(request.method),
    route: safeRoute,
    error: serializeError(error)
  }, "request failed");

  next(error);
};
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 unknown error, requestId, method, route pattern or query-stripped path, and redacted error details 固定在 Express `ErrorRequestHandler`, `getRoutePattern()`, `request.path`, `sanitizeLogField()`, `redactSensitiveData()`, and `next(error)` 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 redacted error log and safe HTTP error response。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx mini-projects/observable-notes-api/src/observability/error-logger.ts
```
</div>

**预期输出：** 输出应能证明 error received, safe route selected, error serialized, server log written, error delegated 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 thrown or rejected route handler value entering Express error middleware 开始，代码把 unknown error, requestId, method, route pattern or query-stripped path, and redacted error details 交给 Express `ErrorRequestHandler`, `getRoutePattern()`, `request.path`, `sanitizeLogField()`, `redactSensitiveData()`, and `next(error)`；Node/Express 在 Express request/response pair, server log sink, and downstream error response middleware 上推进生命周期，最后产生 redacted error log and safe HTTP error response。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 Express request/response pair, server log sink, and downstream error response middleware；生命周期转移是 error received, safe route selected, error serialized, server log written, error delegated；转移完成后，测试或运维系统只能看到 redacted error log and safe HTTP error response。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要记录带 query string 的 raw original URL，或者把 stack trace 返回给 client，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 unknown error, requestId, method, route pattern or query-stripped path, and redacted error details 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是记录带 query string 的 raw original URL，或者把 stack trace 返回给 client。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** `error-logger.ts` 使用 route pattern；无法取得 route pattern 时退回到 query-stripped `request.path`。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-8"></a>

### 9.8 Health checks：liveness versus readiness

**结论：** 本节聚焦 liveness protects the process lifecycle and readiness protects the traffic-routing lifecycle。

**本节解决的问题：** 当 health probe hitting the service while PostgreSQL or Redis may be down 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 process-alive status, dependency status, safe reason, and HTTP status code 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 process-alive status, dependency status, safe reason, and HTTP status code。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 Express health routes, `getLiveness()`, `getReadiness()`, database check, and Redis check 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：health probe hitting the service while PostgreSQL or Redis may be down。值：process-alive status, dependency status, safe reason, and HTTP status code。API: Express health routes, `getLiveness()`, `getReadiness()`, database check, and Redis check。调度/资源边界：Node process, HTTP server, database connection, Redis connection, and orchestrator probe。生命周期转移：probe received, local or dependency check executed, safe status payload returned。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：`/health/live` and `/health/ready` responses with different dependency behavior。失败规则：making liveness depend on external services and causing restart loops。

**API / 语法规则：** 本节应直接识别 Express health routes, `getLiveness()`, `getReadiness()`, database check, and Redis check 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/04-health-diagnostics/liveness-readiness.ts</span>
  </div>

```ts
export function live() { return { ok: true, data: { status: "live", uptimeSeconds: process.uptime() } }; }
export function ready(postgresReady: boolean, redisReady: boolean) {
  const ok = postgresReady && redisReady;
  return { ok, data: { status: ok ? "ready" : "not_ready", dependencies: { postgres: postgresReady ? "ready" : "unavailable", redis: redisReady ? "ready" : "unavailable" } } };
}
console.log(live());
console.log(ready(true, false));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 process-alive status, dependency status, safe reason, and HTTP status code 固定在 Express health routes, `getLiveness()`, `getReadiness()`, database check, and Redis check 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 `/health/live` and `/health/ready` responses with different dependency behavior。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/04-health-diagnostics/liveness-readiness.ts
```
</div>

**预期输出：** 输出应能证明 probe received, local or dependency check executed, safe status payload returned 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 health probe hitting the service while PostgreSQL or Redis may be down 开始，代码把 process-alive status, dependency status, safe reason, and HTTP status code 交给 Express health routes, `getLiveness()`, `getReadiness()`, database check, and Redis check；Node/Express 在 Node process, HTTP server, database connection, Redis connection, and orchestrator probe 上推进生命周期，最后产生 `/health/live` and `/health/ready` responses with different dependency behavior。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 Node process, HTTP server, database connection, Redis connection, and orchestrator probe；生命周期转移是 probe received, local or dependency check executed, safe status payload returned；转移完成后，测试或运维系统只能看到 `/health/live` and `/health/ready` responses with different dependency behavior。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 making liveness depend on external services and causing restart loops，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 process-alive status, dependency status, safe reason, and HTTP status code 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 making liveness depend on external services and causing restart loops。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** the final project exposes live and ready routes separately。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-9"></a>

### 9.9 Dependency readiness：PostgreSQL and Redis

**结论：** 本节聚焦 readiness probes prove a minimal external path works without reading business data or exposing connection details。

**本节解决的问题：** 当 ready endpoint asking PostgreSQL and Redis whether they can accept minimal commands 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 dependency name, readiness status, safe error category, and probe timing 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 dependency name, readiness status, safe error category, and probe timing。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 Prisma readiness query, Redis `PING`, `checkDatabaseHealth()`, and `checkRedisHealth()` 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：ready endpoint asking PostgreSQL and Redis whether they can accept minimal commands。值：dependency name, readiness status, safe error category, and probe timing。API: Prisma readiness query, Redis `PING`, `checkDatabaseHealth()`, and `checkRedisHealth()`。调度/资源边界：database socket, Redis socket, client pool, and readiness response。生命周期转移：checking started, async command awaited, success or failure classified, response finalized。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：ready or unavailable dependency state without DSN or raw driver details。失败规则：checking only environment variables or returning connection strings in health output。

**API / 语法规则：** 本节应直接识别 Prisma readiness query, Redis `PING`, `checkDatabaseHealth()`, and `checkRedisHealth()` 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/04-health-diagnostics/postgres-readiness-check.ts</span>
  </div>

```ts
type QueryRunner = { query(sql: string): Promise<unknown> };
export async function checkPostgresReadiness(database: QueryRunner): Promise<"ready" | "unavailable"> {
  try { await database.query("SELECT 1"); return "ready"; } catch { return "unavailable"; }
}
console.log(await checkPostgresReadiness({ query: async () => 1 }));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 dependency name, readiness status, safe error category, and probe timing 固定在 Prisma readiness query, Redis `PING`, `checkDatabaseHealth()`, and `checkRedisHealth()` 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 ready or unavailable dependency state without DSN or raw driver details。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/04-health-diagnostics/postgres-readiness-check.ts
```
</div>

**预期输出：** 输出应能证明 checking started, async command awaited, success or failure classified, response finalized 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 ready endpoint asking PostgreSQL and Redis whether they can accept minimal commands 开始，代码把 dependency name, readiness status, safe error category, and probe timing 交给 Prisma readiness query, Redis `PING`, `checkDatabaseHealth()`, and `checkRedisHealth()`；Node/Express 在 database socket, Redis socket, client pool, and readiness response 上推进生命周期，最后产生 ready or unavailable dependency state without DSN or raw driver details。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 database socket, Redis socket, client pool, and readiness response；生命周期转移是 checking started, async command awaited, success or failure classified, response finalized；转移完成后，测试或运维系统只能看到 ready or unavailable dependency state without DSN or raw driver details。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 checking only environment variables or returning connection strings in health output，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 dependency name, readiness status, safe error category, and probe timing 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 checking only environment variables or returning connection strings in health output。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** readiness service aggregates PostgreSQL and Redis results for traffic decisions。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-10"></a>

### 9.10 Metrics model：counter、gauge、histogram

**结论：** 本节聚焦 metric type is chosen from value lifecycle: monotonically increasing events, current state, or observed distribution。

**本节解决的问题：** 当 request count, process memory sample, or request duration observation 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 counter increment, gauge value, histogram bucket, count, sum, and labels 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 counter increment, gauge value, histogram bucket, count, sum, and labels。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 prom-client `Counter`, `Gauge`, `Histogram`, `inc()`, `set()`, `observe()`, and registry serialization 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：request count, process memory sample, or request duration observation。值：counter increment, gauge value, histogram bucket, count, sum, and labels。API: prom-client `Counter`, `Gauge`, `Histogram`, `inc()`, `set()`, `observe()`, and registry serialization。调度/资源边界：in-memory metric registry and Prometheus scrape response。生命周期转移：event observed, registry state updated, scrape serializes current metric family。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：counter total, gauge sample, or histogram bucket lines。失败规则：using gauge for request totals or putting per-request IDs in labels。

**API / 语法规则：** 本节应直接识别 prom-client `Counter`, `Gauge`, `Histogram`, `inc()`, `set()`, `observe()`, and registry serialization 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/03-metrics/metric-types-counter-gauge-histogram.ts</span>
  </div>

```ts
type Rule = { kind: "counter" | "gauge" | "histogram"; validUse: string; invalidUse: string };
const rules: Rule[] = [
  { kind: "counter", validUse: "monotonic event count", invalidUse: "current memory" },
  { kind: "gauge", validUse: "value that can go up and down", invalidUse: "request total" },
  { kind: "histogram", validUse: "duration distribution", invalidUse: "unique request id" }
];
console.table(rules);
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 counter increment, gauge value, histogram bucket, count, sum, and labels 固定在 prom-client `Counter`, `Gauge`, `Histogram`, `inc()`, `set()`, `observe()`, and registry serialization 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 counter total, gauge sample, or histogram bucket lines。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/03-metrics/metric-types-counter-gauge-histogram.ts
```
</div>

**预期输出：** 输出应能证明 event observed, registry state updated, scrape serializes current metric family 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 request count, process memory sample, or request duration observation 开始，代码把 counter increment, gauge value, histogram bucket, count, sum, and labels 交给 prom-client `Counter`, `Gauge`, `Histogram`, `inc()`, `set()`, `observe()`, and registry serialization；Node/Express 在 in-memory metric registry and Prometheus scrape response 上推进生命周期，最后产生 counter total, gauge sample, or histogram bucket lines。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 in-memory metric registry and Prometheus scrape response；生命周期转移是 event observed, registry state updated, scrape serializes current metric family；转移完成后，测试或运维系统只能看到 counter total, gauge sample, or histogram bucket lines。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 using gauge for request totals or putting per-request IDs in labels，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 counter increment, gauge value, histogram bucket, count, sum, and labels 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 using gauge for request totals or putting per-request IDs in labels。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** metrics modules define separate families for HTTP, event-loop, and process resources。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-11"></a>

### 9.11 HTTP request metrics：count、duration、status class

**结论：** 本节聚焦 HTTP metrics are observed once per completed response with low-cardinality route and status labels。

**本节解决的问题：** 当 response finish after an Express route handles a request 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 method, route pattern, status class, duration seconds, counter label set, and histogram observation 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 method, route pattern, status class, duration seconds, counter label set, and histogram observation。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `response.on('finish')`, `performance.now()`, `Counter.inc()`, `Histogram.observe()`, and `observeHttpRequest()` 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：response finish after an Express route handles a request。值：method, route pattern, status class, duration seconds, counter label set, and histogram observation。API: `response.on('finish')`, `performance.now()`, `Counter.inc()`, `Histogram.observe()`, and `observeHttpRequest()`。调度/资源边界：HTTP response, metric registry, event-loop callback, and Prometheus time series。生命周期转移：request entered, duration timer started, response finished, counter incremented, histogram observed。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：bounded series for route/status latency and volume。失败规则：using raw URL, noteId, userId, email, or query string as metric labels。

**API / 语法规则：** 本节应直接识别 `response.on('finish')`, `performance.now()`, `Counter.inc()`, `Histogram.observe()`, and `observeHttpRequest()` 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/03-metrics/http-request-duration.ts</span>
  </div>

```ts
import { performance } from "node:perf_hooks";
export function recordHttpDuration(startedAt: number, statusCode: number) {
  return { method: "GET", route: "/notes/:noteId", statusClass: `${Math.trunc(statusCode / 100)}xx`, durationSeconds: (performance.now() - startedAt) / 1000 };
}
console.log(recordHttpDuration(performance.now() - 24, 200));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 method, route pattern, status class, duration seconds, counter label set, and histogram observation 固定在 `response.on('finish')`, `performance.now()`, `Counter.inc()`, `Histogram.observe()`, and `observeHttpRequest()` 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 bounded series for route/status latency and volume。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/03-metrics/http-request-duration.ts
```
</div>

**预期输出：** 输出应能证明 request entered, duration timer started, response finished, counter incremented, histogram observed 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 response finish after an Express route handles a request 开始，代码把 method, route pattern, status class, duration seconds, counter label set, and histogram observation 交给 `response.on('finish')`, `performance.now()`, `Counter.inc()`, `Histogram.observe()`, and `observeHttpRequest()`；Node/Express 在 HTTP response, metric registry, event-loop callback, and Prometheus time series 上推进生命周期，最后产生 bounded series for route/status latency and volume。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 HTTP response, metric registry, event-loop callback, and Prometheus time series；生命周期转移是 request entered, duration timer started, response finished, counter incremented, histogram observed；转移完成后，测试或运维系统只能看到 bounded series for route/status latency and volume。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 using raw URL, noteId, userId, email, or query string as metric labels，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 method, route pattern, status class, duration seconds, counter label set, and histogram observation 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 using raw URL, noteId, userId, email, or query string as metric labels。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** request logging middleware writes HTTP metrics from the same finish boundary。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-12"></a>

### 9.12 Event loop delay and process resource metrics

**结论：** 本节聚焦 process metrics explain runtime pressure that may slow every request without producing a route-specific error。

**本节解决的问题：** 当 monitor interval or scrape reading Node process state 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 event loop delay histogram values, RSS, heap, uptime, and CPU/resource measurements 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 event loop delay histogram values, RSS, heap, uptime, and CPU/resource measurements。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `monitorEventLoopDelay()`, `process.memoryUsage()`, `process.uptime()`, and gauge setters 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：monitor interval or scrape reading Node process state。值：event loop delay histogram values, RSS, heap, uptime, and CPU/resource measurements。API: `monitorEventLoopDelay()`, `process.memoryUsage()`, `process.uptime()`, and gauge setters。调度/资源边界：Node event loop, process memory, OS scheduler, and metric registry。生命周期转移：monitor enabled, runtime sampled, values read, gauges updated, scrape exposes values。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：event-loop and process resource samples。失败规则：treating event-loop delay as network latency or business duration。

**API / 语法规则：** 本节应直接识别 `monitorEventLoopDelay()`, `process.memoryUsage()`, `process.uptime()`, and gauge setters 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/03-metrics/event-loop-delay.ts</span>
  </div>

```ts
import { monitorEventLoopDelay } from "node:perf_hooks";
const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();
setTimeout(() => {
  histogram.disable();
  console.log({ meanSeconds: histogram.mean / 1_000_000_000 });
}, 25);
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 event loop delay histogram values, RSS, heap, uptime, and CPU/resource measurements 固定在 `monitorEventLoopDelay()`, `process.memoryUsage()`, `process.uptime()`, and gauge setters 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 event-loop and process resource samples。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/03-metrics/event-loop-delay.ts
```
</div>

**预期输出：** 输出应能证明 monitor enabled, runtime sampled, values read, gauges updated, scrape exposes values 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 monitor interval or scrape reading Node process state 开始，代码把 event loop delay histogram values, RSS, heap, uptime, and CPU/resource measurements 交给 `monitorEventLoopDelay()`, `process.memoryUsage()`, `process.uptime()`, and gauge setters；Node/Express 在 Node event loop, process memory, OS scheduler, and metric registry 上推进生命周期，最后产生 event-loop and process resource samples。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 Node event loop, process memory, OS scheduler, and metric registry；生命周期转移是 monitor enabled, runtime sampled, values read, gauges updated, scrape exposes values；转移完成后，测试或运维系统只能看到 event-loop and process resource samples。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 treating event-loop delay as network latency or business duration，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 event loop delay histogram values, RSS, heap, uptime, and CPU/resource measurements 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 treating event-loop delay as network latency or business duration。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** event-loop and process resource modules expose runtime health signals。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-13"></a>

### 9.13 Metrics label cardinality and safety boundary

**结论：** 本节聚焦 metric labels are indexes with bounded values, not containers for request-specific debug data。

**本节解决的问题：** 当 metric observation receiving label values from a request or dependency operation 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 method, route pattern, status class, dependency name, and unsafe contrasting IDs or secrets 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 method, route pattern, status class, dependency name, and unsafe contrasting IDs or secrets。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 prom-client label objects, `sanitizeRoutePattern()`, and status-class helpers 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：metric observation receiving label values from a request or dependency operation。值：method, route pattern, status class, dependency name, and unsafe contrasting IDs or secrets。API: prom-client label objects, `sanitizeRoutePattern()`, and status-class helpers。调度/资源边界：metric registry series set and long-lived monitoring storage。生命周期转移：label set built, existing series reused or new series created, scrape exposes all series。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：small bounded time-series set。失败规则：adding userId, email, noteId, token, raw path, or error message as labels。

**API / 语法规则：** 本节应直接识别 prom-client label objects, `sanitizeRoutePattern()`, and status-class helpers 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/03-metrics/low-cardinality-labels.ts</span>
  </div>

```ts
const unsafeMetricLabels = new Set(["userId", "email", "requestId", "noteId", "sessionId", "traceId", "rawUrl", "errorMessage"]);
export function assertSafeMetricLabel(labelName: string): void {
  if (unsafeMetricLabels.has(labelName)) throw new Error(`Unsafe metric label: ${labelName}`);
}
for (const label of ["method", "route", "status_class", "requestId"]) {
  try { assertSafeMetricLabel(label); console.log(`${label}: safe`); } catch (error) { console.log((error as Error).message); }
}
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 method, route pattern, status class, dependency name, and unsafe contrasting IDs or secrets 固定在 prom-client label objects, `sanitizeRoutePattern()`, and status-class helpers 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 small bounded time-series set。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/03-metrics/low-cardinality-labels.ts
```
</div>

**预期输出：** 输出应能证明 label set built, existing series reused or new series created, scrape exposes all series 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 metric observation receiving label values from a request or dependency operation 开始，代码把 method, route pattern, status class, dependency name, and unsafe contrasting IDs or secrets 交给 prom-client label objects, `sanitizeRoutePattern()`, and status-class helpers；Node/Express 在 metric registry series set and long-lived monitoring storage 上推进生命周期，最后产生 small bounded time-series set。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 metric registry series set and long-lived monitoring storage；生命周期转移是 label set built, existing series reused or new series created, scrape exposes all series；转移完成后，测试或运维系统只能看到 small bounded time-series set。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 adding userId, email, noteId, token, raw path, or error message as labels，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 method, route pattern, status class, dependency name, and unsafe contrasting IDs or secrets 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 adding userId, email, noteId, token, raw path, or error message as labels。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** HTTP metrics only accept low-cardinality labels and tests reject sensitive values。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-14"></a>

### 9.14 `/metrics` endpoint and Prometheus scrape boundary

**结论：** 本节聚焦 `/metrics` is a machine scrape endpoint for text exposition, not a JSON diagnostics route。

**本节解决的问题：** 当 Prometheus or a browser requesting the metrics route 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 HELP line, TYPE line, metric sample, content type, and newline-delimited body 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 HELP line, TYPE line, metric sample, content type, and newline-delimited body。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 Express route, prom-client `register.metrics()`, `register.contentType`, and `join("\n")` for practice output 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：Prometheus or a browser requesting the metrics route。值：HELP line, TYPE line, metric sample, content type, and newline-delimited body。API: Express route, prom-client `register.metrics()`, `register.contentType`, and `join("\n")` for practice output。调度/资源边界：metric registry, HTTP response body, and scrape client。生命周期转移：route entered, registry serialized, content type set, text body sent。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：Prometheus text without secrets, raw requests, reports, or user-specific values。失败规则：mixing diagnostic reports or request dumps into `/metrics`。

**API / 语法规则：** 本节应直接识别 Express route, prom-client `register.metrics()`, `register.contentType`, and `join("\n")` for practice output 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/03-metrics/metrics-endpoint-boundary.ts</span>
  </div>

```ts
const metricsText = ["# HELP http_requests_total Total HTTP requests", "# TYPE http_requests_total counter", 'http_requests_total{method="GET",route="/notes/:noteId",status_class="2xx"} 12'].join("\n");
export function createMetricsResponse() { return { contentType: "text/plain; version=0.0.4; charset=utf-8", body: metricsText }; }
console.log(createMetricsResponse().body);
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 HELP line, TYPE line, metric sample, content type, and newline-delimited body 固定在 Express route, prom-client `register.metrics()`, `register.contentType`, and `join("\n")` for practice output 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 Prometheus text without secrets, raw requests, reports, or user-specific values。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/03-metrics/metrics-endpoint-boundary.ts
```
</div>

**预期输出：** 输出应能证明 route entered, registry serialized, content type set, text body sent 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 Prometheus or a browser requesting the metrics route 开始，代码把 HELP line, TYPE line, metric sample, content type, and newline-delimited body 交给 Express route, prom-client `register.metrics()`, `register.contentType`, and `join("\n")` for practice output；Node/Express 在 metric registry, HTTP response body, and scrape client 上推进生命周期，最后产生 Prometheus text without secrets, raw requests, reports, or user-specific values。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 metric registry, HTTP response body, and scrape client；生命周期转移是 route entered, registry serialized, content type set, text body sent；转移完成后，测试或运维系统只能看到 Prometheus text without secrets, raw requests, reports, or user-specific values。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 mixing diagnostic reports or request dumps into `/metrics`，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 HELP line, TYPE line, metric sample, content type, and newline-delimited body 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 mixing diagnostic reports or request dumps into `/metrics`。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** metrics route returns registry text and the practice file now uses valid `join("\n")` syntax。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-15"></a>

### 9.15 Tracing model：trace、span、attributes、context

**结论：** 本节聚焦 traces model request paths as nested timed spans with safe attributes and propagated context。

**本节解决的问题：** 当 request or service operation starting child work across auth, database, Redis, or business services 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 traceId, spanId, span name, attributes, status, exception, start time, and end time 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 traceId, spanId, span name, attributes, status, exception, start time, and end time。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 OpenTelemetry `trace.getTracer()`, `startActiveSpan()`, `setAttribute()`, `recordException()`, `setStatus()`, and `end()` 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：request or service operation starting child work across auth, database, Redis, or business services。值：traceId, spanId, span name, attributes, status, exception, start time, and end time。API: OpenTelemetry `trace.getTracer()`, `startActiveSpan()`, `setAttribute()`, `recordException()`, `setStatus()`, and `end()`。调度/资源边界：active context, async resource chain, span processor, and telemetry exporter。生命周期转移：span started, async work awaited, status recorded, span ended, trace exported。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：waterfall showing where time was spent。失败规则：leaving spans open or adding request bodies and SQL parameters as attributes。

**API / 语法规则：** 本节应直接识别 OpenTelemetry `trace.getTracer()`, `startActiveSpan()`, `setAttribute()`, `recordException()`, `setStatus()`, and `end()` 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/05-tracing/manual-span.ts</span>
  </div>

```ts
type Span = { setAttribute(name: string, value: string | number | boolean): void; recordException(error: Error): void; end(): void };
export async function runWithManualSpan<T>(span: Span, operation: () => Promise<T>): Promise<T> {
  try { span.setAttribute("app.operation", "notes.list"); return await operation(); }
  catch (error) { span.recordException(error as Error); throw error; }
  finally { span.end(); }
}
await runWithManualSpan({ setAttribute() {}, recordException() {}, end() { console.log("span ended"); } }, async () => "ok");
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 traceId, spanId, span name, attributes, status, exception, start time, and end time 固定在 OpenTelemetry `trace.getTracer()`, `startActiveSpan()`, `setAttribute()`, `recordException()`, `setStatus()`, and `end()` 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 waterfall showing where time was spent。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/05-tracing/manual-span.ts
```
</div>

**预期输出：** 输出应能证明 span started, async work awaited, status recorded, span ended, trace exported 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 request or service operation starting child work across auth, database, Redis, or business services 开始，代码把 traceId, spanId, span name, attributes, status, exception, start time, and end time 交给 OpenTelemetry `trace.getTracer()`, `startActiveSpan()`, `setAttribute()`, `recordException()`, `setStatus()`, and `end()`；Node/Express 在 active context, async resource chain, span processor, and telemetry exporter 上推进生命周期，最后产生 waterfall showing where time was spent。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 active context, async resource chain, span processor, and telemetry exporter；生命周期转移是 span started, async work awaited, status recorded, span ended, trace exported；转移完成后，测试或运维系统只能看到 waterfall showing where time was spent。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 leaving spans open or adding request bodies and SQL parameters as attributes，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 traceId, spanId, span name, attributes, status, exception, start time, and end time 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 leaving spans open or adding request bodies and SQL parameters as attributes。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** service/database/Redis helpers use spans without changing business return values。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-16"></a>

### 9.16 OpenTelemetry NodeSDK setup and initialization order

**结论：** 本节聚焦 instrumentation must load before the modules it observes so Node module evaluation and patching happen in the correct order。

**本节解决的问题：** 当 process startup importing instrumentation and then server/app modules 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 SDK resource, instrumentations, span processors, metric readers, Express module, and HTTP module 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 SDK resource, instrumentations, span processors, metric readers, Express module, and HTTP module。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 OpenTelemetry `NodeSDK`, HTTP instrumentation, Express instrumentation, `sdk.start()`, and `sdk.shutdown()` 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：process startup importing instrumentation and then server/app modules。值：SDK resource, instrumentations, span processors, metric readers, Express module, and HTTP module。API: OpenTelemetry `NodeSDK`, HTTP instrumentation, Express instrumentation, `sdk.start()`, and `sdk.shutdown()`。调度/资源边界：Node module cache, process startup lifecycle, exporter resources, and shutdown signal。生命周期转移：instrumentation imported, SDK started, observed modules loaded, app handles requests, SDK flushes on shutdown。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：automatic spans appearing for HTTP/Express boundaries。失败规则：starting telemetry after app routes and HTTP modules are already loaded。

**API / 语法规则：** 本节应直接识别 OpenTelemetry `NodeSDK`, HTTP instrumentation, Express instrumentation, `sdk.start()`, and `sdk.shutdown()` 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/05-tracing/otel-initialization-order.ts</span>
  </div>

```ts
const initializationOrder = ["import instrumentation first", "start NodeSDK", "import app modules", "start HTTP server"];
for (const step of initializationOrder) console.log(step);
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 SDK resource, instrumentations, span processors, metric readers, Express module, and HTTP module 固定在 OpenTelemetry `NodeSDK`, HTTP instrumentation, Express instrumentation, `sdk.start()`, and `sdk.shutdown()` 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 automatic spans appearing for HTTP/Express boundaries。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/05-tracing/otel-initialization-order.ts
```
</div>

**预期输出：** 输出应能证明 instrumentation imported, SDK started, observed modules loaded, app handles requests, SDK flushes on shutdown 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 process startup importing instrumentation and then server/app modules 开始，代码把 SDK resource, instrumentations, span processors, metric readers, Express module, and HTTP module 交给 OpenTelemetry `NodeSDK`, HTTP instrumentation, Express instrumentation, `sdk.start()`, and `sdk.shutdown()`；Node/Express 在 Node module cache, process startup lifecycle, exporter resources, and shutdown signal 上推进生命周期，最后产生 automatic spans appearing for HTTP/Express boundaries。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 Node module cache, process startup lifecycle, exporter resources, and shutdown signal；生命周期转移是 instrumentation imported, SDK started, observed modules loaded, app handles requests, SDK flushes on shutdown；转移完成后，测试或运维系统只能看到 automatic spans appearing for HTTP/Express boundaries。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 starting telemetry after app routes and HTTP modules are already loaded，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 SDK resource, instrumentations, span processors, metric readers, Express module, and HTTP module 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 starting telemetry after app routes and HTTP modules are already loaded。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** `src/instrumentation.ts` is loaded from process entry before the app is created。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-17"></a>

### 9.17 Manual spans around service, database, and Redis work

**结论：** 本节聚焦 manual spans describe application-owned work units that automatic instrumentation cannot name semantically。

**本节解决的问题：** 当 service method entering database or Redis work 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 operation name, dependency name, safe attributes, exception category, result status, and duration 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 operation name, dependency name, safe attributes, exception category, result status, and duration。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `withSpan()`, OpenTelemetry span APIs, Prisma repository calls, and Redis client calls 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：service method entering database or Redis work。值：operation name, dependency name, safe attributes, exception category, result status, and duration。API: `withSpan()`, OpenTelemetry span APIs, Prisma repository calls, and Redis client calls。调度/资源边界：current trace context, external dependency socket, promise continuation, and span object。生命周期转移：span started, safe attributes set, dependency awaited, error recorded or result returned, span ended。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：named business/dependency spans in the trace。失败规则：swallowing business errors or omitting `span.end()` in failure paths。

**API / 语法规则：** 本节应直接识别 `withSpan()`, OpenTelemetry span APIs, Prisma repository calls, and Redis client calls 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/05-tracing/service-database-span.ts</span>
  </div>

```ts
type SpanEvent = { name: string; attributes: Record<string, string> };
const events: SpanEvent[] = [];
async function withDatabaseSpan<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
  events.push({ name: "span.start", attributes: { operationName } });
  try { return await operation(); } finally { events.push({ name: "span.end", attributes: { operationName } }); }
}
await withDatabaseSpan("notes.repository.findMany", async () => [{ title: "First note" }]);
console.log(events);
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 operation name, dependency name, safe attributes, exception category, result status, and duration 固定在 `withSpan()`, OpenTelemetry span APIs, Prisma repository calls, and Redis client calls 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 named business/dependency spans in the trace。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/05-tracing/service-database-span.ts
```
</div>

**预期输出：** 输出应能证明 span started, safe attributes set, dependency awaited, error recorded or result returned, span ended 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 service method entering database or Redis work 开始，代码把 operation name, dependency name, safe attributes, exception category, result status, and duration 交给 `withSpan()`, OpenTelemetry span APIs, Prisma repository calls, and Redis client calls；Node/Express 在 current trace context, external dependency socket, promise continuation, and span object 上推进生命周期，最后产生 named business/dependency spans in the trace。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 current trace context, external dependency socket, promise continuation, and span object；生命周期转移是 span started, safe attributes set, dependency awaited, error recorded or result returned, span ended；转移完成后，测试或运维系统只能看到 named business/dependency spans in the trace。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 swallowing business errors or omitting `span.end()` in failure paths，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 operation name, dependency name, safe attributes, exception category, result status, and duration 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 swallowing business errors or omitting `span.end()` in failure paths。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** service and dependency helpers wrap work without changing controller contracts。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-18"></a>

### 9.18 Log and trace correlation：requestId、traceId、spanId

**结论：** 本节聚焦 correlation puts request and trace identity into logs while keeping those IDs out of metric labels。

**本节解决的问题：** 当 logger writing during a request with an active OpenTelemetry context 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 requestId from app context, traceId and spanId from active span context 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 requestId from app context, traceId and spanId from active span context。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `getRequestContext()`, OpenTelemetry active context helpers, `getActiveTraceFields()`, and Pino logger 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：logger writing during a request with an active OpenTelemetry context。值：requestId from app context, traceId and spanId from active span context。API: `getRequestContext()`, OpenTelemetry active context helpers, `getActiveTraceFields()`, and Pino logger。调度/资源边界：AsyncLocalStorage store, trace context, and log stream。生命周期转移：request context created, span active, logger reads IDs, JSON log written。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：log line that can jump to a trace and group request events。失败规则：using traceId/spanId/requestId as Prometheus labels。

**API / 语法规则：** 本节应直接识别 `getRequestContext()`, OpenTelemetry active context helpers, `getActiveTraceFields()`, and Pino logger 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/02-structured-logging/trace-log-correlation.ts</span>
  </div>

```ts
type TraceContext = { traceId?: string; spanId?: string };
export function buildCorrelatedLog(requestId: string, traceContext: TraceContext) {
  return { level: "info", message: "request completed", requestId, traceId: traceContext.traceId, spanId: traceContext.spanId };
}
console.log(JSON.stringify(buildCorrelatedLog("req_123", { traceId: "abc", spanId: "def" })));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 requestId from app context, traceId and spanId from active span context 固定在 `getRequestContext()`, OpenTelemetry active context helpers, `getActiveTraceFields()`, and Pino logger 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 log line that can jump to a trace and group request events。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/02-structured-logging/trace-log-correlation.ts
```
</div>

**预期输出：** 输出应能证明 request context created, span active, logger reads IDs, JSON log written 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 logger writing during a request with an active OpenTelemetry context 开始，代码把 requestId from app context, traceId and spanId from active span context 交给 `getRequestContext()`, OpenTelemetry active context helpers, `getActiveTraceFields()`, and Pino logger；Node/Express 在 AsyncLocalStorage store, trace context, and log stream 上推进生命周期，最后产生 log line that can jump to a trace and group request events。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 AsyncLocalStorage store, trace context, and log stream；生命周期转移是 request context created, span active, logger reads IDs, JSON log written；转移完成后，测试或运维系统只能看到 log line that can jump to a trace and group request events。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 using traceId/spanId/requestId as Prometheus labels，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 requestId from app context, traceId and spanId from active span context 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 using traceId/spanId/requestId as Prometheus labels。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** request logger includes trace fields for completion logs。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-19"></a>

### 9.19 Prisma and Redis observability boundaries

**结论：** 本节聚焦 dependency observability records operation and safe status, not raw data-layer secrets。

**本节解决的问题：** 当 repository or cache helper awaiting PostgreSQL or Redis 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 dependency, operation, safe error code, duration, and redacted error fields 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 dependency, operation, safe error code, duration, and redacted error fields。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 Prisma client calls, Redis `PING` or commands, Prisma error mapping, and span helpers 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：repository or cache helper awaiting PostgreSQL or Redis。值：dependency, operation, safe error code, duration, and redacted error fields。API: Prisma client calls, Redis `PING` or commands, Prisma error mapping, and span helpers。调度/资源边界：database connection, Redis connection, client pool, and promise lifecycle。生命周期转移：call started, external I/O awaited, success or failure classified, span/log/health state written。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：safe dependency logs, spans, and readiness results。失败规则：returning ORM/driver errors or connection strings to clients。

**API / 语法规则：** 本节应直接识别 Prisma client calls, Redis `PING` or commands, Prisma error mapping, and span helpers 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/05-tracing/redis-span-boundary.ts</span>
  </div>

```ts
type RedisLike = { ping(): Promise<string> };
export async function pingWithSpan(redis: RedisLike): Promise<string> {
  const attributes = { component: "redis", operation: "PING" };
  console.log({ event: "span.start", attributes });
  try { return await redis.ping(); } finally { console.log({ event: "span.end", attributes }); }
}
console.log(await pingWithSpan({ ping: async () => "PONG" }));
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 dependency, operation, safe error code, duration, and redacted error fields 固定在 Prisma client calls, Redis `PING` or commands, Prisma error mapping, and span helpers 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 safe dependency logs, spans, and readiness results。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/05-tracing/redis-span-boundary.ts
```
</div>

**预期输出：** 输出应能证明 call started, external I/O awaited, success or failure classified, span/log/health state written 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 repository or cache helper awaiting PostgreSQL or Redis 开始，代码把 dependency, operation, safe error code, duration, and redacted error fields 交给 Prisma client calls, Redis `PING` or commands, Prisma error mapping, and span helpers；Node/Express 在 database connection, Redis connection, client pool, and promise lifecycle 上推进生命周期，最后产生 safe dependency logs, spans, and readiness results。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 database connection, Redis connection, client pool, and promise lifecycle；生命周期转移是 call started, external I/O awaited, success or failure classified, span/log/health state written；转移完成后，测试或运维系统只能看到 safe dependency logs, spans, and readiness results。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 returning ORM/driver errors or connection strings to clients，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 dependency, operation, safe error code, duration, and redacted error fields 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 returning ORM/driver errors or connection strings to clients。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** Prisma and Redis checks feed readiness, spans, and safe logging。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-20"></a>

### 9.20 Node diagnostics：diagnostics_channel、process warnings、diagnostic report

**结论：** 本节聚焦 Node diagnostics expose runtime/process events and private process snapshots beyond request-level signals。

**本节解决的问题：** 当 diagnostic channel publish, process warning, unhandled rejection, or report generation trigger 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 channel name, warning name/message, safe summary, report filename, and private path 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 channel name, warning name/message, safe summary, report filename, and private path。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `diagnostics_channel.channel()`, `channel.publish()`, `process.on()`, and `process.report.writeReport()` 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：diagnostic channel publish, process warning, unhandled rejection, or report generation trigger。值：channel name, warning name/message, safe summary, report filename, and private path。API: `diagnostics_channel.channel()`, `channel.publish()`, `process.on()`, and `process.report.writeReport()`。调度/资源边界：Node process, event emitter, diagnostics channel subscriber, and filesystem。生命周期转移：event published, handler receives payload, summary logged, optional report file written。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：safe process log or private report file。失败规则：serving diagnostic reports from a public endpoint。

**API / 语法规则：** 本节应直接识别 `diagnostics_channel.channel()`, `channel.publish()`, `process.on()`, and `process.report.writeReport()` 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/04-health-diagnostics/process-warnings.ts</span>
  </div>

```ts
process.on("warning", (warning) => {
  console.warn(JSON.stringify({ level: "warn", message: "process warning observed", warningName: warning.name, warningMessage: warning.message }));
});
process.emitWarning("Deprecated option used", { code: "APP_DEPRECATED_OPTION" });
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 channel name, warning name/message, safe summary, report filename, and private path 固定在 `diagnostics_channel.channel()`, `channel.publish()`, `process.on()`, and `process.report.writeReport()` 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 safe process log or private report file。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/04-health-diagnostics/process-warnings.ts
```
</div>

**预期输出：** 输出应能证明 event published, handler receives payload, summary logged, optional report file written 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 diagnostic channel publish, process warning, unhandled rejection, or report generation trigger 开始，代码把 channel name, warning name/message, safe summary, report filename, and private path 交给 `diagnostics_channel.channel()`, `channel.publish()`, `process.on()`, and `process.report.writeReport()`；Node/Express 在 Node process, event emitter, diagnostics channel subscriber, and filesystem 上推进生命周期，最后产生 safe process log or private report file。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 Node process, event emitter, diagnostics channel subscriber, and filesystem；生命周期转移是 event published, handler receives payload, summary logged, optional report file written；转移完成后，测试或运维系统只能看到 safe process log or private report file。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 serving diagnostic reports from a public endpoint，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 channel name, warning name/message, safe summary, report filename, and private path 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 serving diagnostic reports from a public endpoint。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** process diagnostics remain local/private while logs expose only safe summaries。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-21"></a>

### 9.21 Testing observability：logs、metrics、health、traces

**结论：** 本节聚焦 observability tests assert both required evidence and forbidden leakage at runtime。

**本节解决的问题：** 当 Node test runner or Supertest triggering app behavior 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 response status/body, captured log line, metrics text, requestId, route pattern, and forbidden secret strings 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 response status/body, captured log line, metrics text, requestId, route pattern, and forbidden secret strings。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `node:test`, `node:assert/strict`, Supertest, log capture helpers, and metrics/health endpoints 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：Node test runner or Supertest triggering app behavior。值：response status/body, captured log line, metrics text, requestId, route pattern, and forbidden secret strings。API: `node:test`, `node:assert/strict`, Supertest, log capture helpers, and metrics/health endpoints。调度/资源边界：test process, in-memory Express app, captured streams, and optional PostgreSQL/Redis dependencies。生命周期转移：test starts, request/helper runs, signal generated, assertion checks presence and absence。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：passing or failing test result tied to actual output。失败规则：only asserting HTTP 200 and ignoring logs, labels, and secret absence。

**API / 语法规则：** 本节应直接识别 `node:test`, `node:assert/strict`, Supertest, log capture helpers, and metrics/health endpoints 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/10-observability-diagnostics/06-testing-observability/request-context-test.ts</span>
  </div>

```ts
import { AsyncLocalStorage } from "node:async_hooks";
import test from "node:test";
import assert from "node:assert/strict";
const storage = new AsyncLocalStorage<{ requestId: string }>();
test("request id survives across await", async () => {
  await storage.run({ requestId: "req_test" }, async () => { await Promise.resolve(); assert.equal(storage.getStore()?.requestId, "req_test"); });
});
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 response status/body, captured log line, metrics text, requestId, route pattern, and forbidden secret strings 固定在 `node:test`, `node:assert/strict`, Supertest, log capture helpers, and metrics/health endpoints 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 passing or failing test result tied to actual output。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx practices/10-observability-diagnostics/06-testing-observability/request-context-test.ts
```
</div>

**预期输出：** 输出应能证明 test starts, request/helper runs, signal generated, assertion checks presence and absence 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 Node test runner or Supertest triggering app behavior 开始，代码把 response status/body, captured log line, metrics text, requestId, route pattern, and forbidden secret strings 交给 `node:test`, `node:assert/strict`, Supertest, log capture helpers, and metrics/health endpoints；Node/Express 在 test process, in-memory Express app, captured streams, and optional PostgreSQL/Redis dependencies 上推进生命周期，最后产生 passing or failing test result tied to actual output。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 test process, in-memory Express app, captured streams, and optional PostgreSQL/Redis dependencies；生命周期转移是 test starts, request/helper runs, signal generated, assertion checks presence and absence；转移完成后，测试或运维系统只能看到 passing or failing test result tied to actual output。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 only asserting HTTP 200 and ignoring logs, labels, and secret absence，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 response status/body, captured log line, metrics text, requestId, route pattern, and forbidden secret strings 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 only asserting HTTP 200 and ignoring logs, labels, and secret absence。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** integration/unit tests cover health, metrics, request context, logging, and redaction。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
<a id="section-9-22"></a>

### 9.22 Chapter integration: observable-notes-api

**结论：** 本节聚焦 the final project integrates the section mechanisms without making observability change business API semantics。

**本节解决的问题：** 当 server startup and authenticated notes requests flowing through middleware, services, dependencies, and shutdown 时，学习目标是判断哪些值应被记录、哪些资源发生变化、哪个输出通道可以公开，以及哪个错误会破坏诊断边界。

**技术意义：** 这个主题把 middleware order, request context, logs, metrics, spans, health states, diagnostic hooks, and tests 变成可查询证据；如果边界不清，故障复盘会混淆业务错误、依赖错误、进程压力和安全泄漏。

**概念解释：** 本节的核心对象不是泛泛的 output，而是 middleware order, request context, logs, metrics, spans, health states, diagnostic hooks, and tests。这些值必须有稳定名称、有限值域和明确 owner，才能被日志系统、metrics scrape、trace backend、health probe 或测试可靠消费。

**边界：语法、JavaScript 运行时、Node 平台 API、类型系统、工具链与框架约定：** TypeScript 只检查本地类型；JavaScript runtime 执行对象创建、异常和 promise continuation；Node 或 Express API 通过 `createApp()`, instrumentation startup, Express routes, Prisma/Redis clients, observability modules, and Node tests 接收这些值；运行时外部输入仍必须经过 redaction、sanitization、validation 或 low-cardinality policy。

**底层机制：** 触发：server startup and authenticated notes requests flowing through middleware, services, dependencies, and shutdown。值：middleware order, request context, logs, metrics, spans, health states, diagnostic hooks, and tests。API: `createApp()`, instrumentation startup, Express routes, Prisma/Redis clients, observability modules, and Node tests。调度/资源边界：process, HTTP socket, session store, database, Redis, metric registry, trace SDK, and log sink。生命周期转移：startup initialized, request handled, signals emitted, errors delegated, dependencies closed during shutdown。TypeScript 边界：只检查静态形状，不能证明外部输入在运行时安全。可观察结果：typecheck/runtime output plus safe observable signals。失败规则：hiding shallow teaching in the final project or changing response shapes for observability。

**API / 语法规则：** 本节应直接识别 `createApp()`, instrumentation startup, Express routes, Prisma/Redis clients, observability modules, and Node tests 的调用位置、参数值和完成事件；如果代码只出现 console output，而没有绑定这些 API 和资源边界，就不是本节机制。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/app.ts</span>
  </div>

```ts
import express from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { requestLogger } from "./observability/request-logger.js";
import { startEventLoopMetrics } from "./observability/event-loop-metrics.js";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { notFound } from "./shared/middleware/not-found.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";

startEventLoopMetrics();

export const app = express();

app.disable("x-powered-by");
app.use(requestId);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(apiRateLimit);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.use("/health", healthRoutes);
app.use("/metrics", metricsRoutes);
app.use("/auth", authRoutes);
app.use("/notebooks", authenticateSession, notebookRoutes);
app.use("/notes", authenticateSession, notesRoutes);

app.use(notFound);
app.use(errorLogger);
app.use(errorMiddleware);
```
</div>

**逐行解释：** 示例代码的关键不是文件数量，而是把 middleware order, request context, logs, metrics, spans, health states, diagnostic hooks, and tests 固定在 `createApp()`, instrumentation startup, Express routes, Prisma/Redis clients, observability modules, and Node tests 能观察到的位置。先创建或读取稳定值，再穿过运行时或框架 API，最后写入 typecheck/runtime output plus safe observable signals。

**运行方式：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npx tsx mini-projects/observable-notes-api/src/app.ts
```
</div>

**预期输出：** 输出应能证明 startup initialized, request handled, signals emitted, errors delegated, dependencies closed during shutdown 已发生，并且只包含本节允许的安全字段；如果出现 secret、raw URL query、request body、connection string、stack trace to client、或高基数字段，应视为失败。

**执行过程：** 执行从 server startup and authenticated notes requests flowing through middleware, services, dependencies, and shutdown 开始，代码把 middleware order, request context, logs, metrics, spans, health states, diagnostic hooks, and tests 交给 `createApp()`, instrumentation startup, Express routes, Prisma/Redis clients, observability modules, and Node tests；Node/Express 在 process, HTTP socket, session store, database, Redis, metric registry, trace SDK, and log sink 上推进生命周期，最后产生 typecheck/runtime output plus safe observable signals。

**变量、引用、资源与生命周期变化：** 变量从普通 JavaScript 值进入运行时/框架对象；资源边界是 process, HTTP socket, session store, database, Redis, metric registry, trace SDK, and log sink；生命周期转移是 startup initialized, request handled, signals emitted, errors delegated, dependencies closed during shutdown；转移完成后，测试或运维系统只能看到 typecheck/runtime output plus safe observable signals。

**为什么会得到这个结果：** 结果来自触发点、值、API 和资源边界的组合，而不是来自注释或类型声明。只要 hiding shallow teaching in the final project or changing response shapes for observability，同样的代码就会在生产中留下错误或不可用的证据。

**对比情况：** 正确做法让 middleware order, request context, logs, metrics, spans, health states, diagnostic hooks, and tests 进入有限且安全的字段；错误做法把临时 debug 字符串、raw external input、per-request identity 或 private diagnostic material 放进不合适的输出通道。

**常见错误为什么错：** 常见错误是 hiding shallow teaching in the final project or changing response shapes for observability。它违反的不是格式偏好，而是 observability signal 必须可聚合、可关联、可安全暴露、可由测试复现的机制规则。

**与真实项目的关系：** Section 14.3 remains the complete code reference for the integrated mini project。

**与当前学习路径的关系：** 本节承接前面章节的 Express pipeline、TypeScript boundary、Prisma/Redis dependency、auth/session 安全和 shutdown lifecycle，只增加如何在不改变业务语义的情况下观察它们。

**最终记忆模型：** 先定位 trigger，再固定 values，再选择 API/resource boundary，最后验证 observation；任何跳过这条链的解释都是泛化描述。
## 10. API 与规则索引

| API / rule | Layer | Rule | Mistake |
| --- | --- | --- | --- |
| `AsyncLocalStorage.run()` | Node runtime | 建立 request-local store | 用全局变量保存 requestId |
| `monitorEventLoopDelay()` | Node runtime | 测量 event loop scheduling delay | 等同 HTTP duration |
| `process.on("warning")` | Node runtime | 观察 runtime warning | 当成业务恢复入口 |
| `process.report.writeReport()` | Node diagnostics | 写私有诊断文件 | 通过 public route 返回 |
| Express request middleware | Express | response finish 后记录最终状态 | 在 route 前使用 raw URL label |
| Pino redaction | logging | 输出前 censor 敏感字段 | 只保护 client response |
| `Counter` / `Gauge` / `Histogram` | metrics | 分别表示累计、当前值、分布 | 混用 metric type |
| route pattern label | metrics | 使用 `/notes/:noteId` | 使用 raw URL 或 noteId |
| OpenTelemetry NodeSDK | tracing | 先启动再导入被 instrumentation 模块 | app 已加载后启动 |

## 11. 常见错误对照表

| Symptom | Violated Rule | Mechanism Cause | Evidence | Correction |
| --- | --- | --- | --- | --- |
| 日志出现 `authorization` | sensitive data boundary | header 被直接序列化 | captured log contains token | 添加 Pino redaction 与递归 redaction |
| metrics series 激增 | low-cardinality metric rule | label 使用 requestId 或 raw URL | series count 随请求增长 | 使用 method、route pattern、status_class |
| 请求日志没有 requestId | async context boundary | middleware 顺序错误 | `getStore()` returns `undefined` | requestId middleware 放在前面 |
| readiness 暴露连接串 | health boundary | 返回 raw error | response body contains URL | 只返回 ready/unavailable |
| client 看到 stack | safe error response | 返回内部 error object | response body contains stack | server log detail, client safe response |

## 12. 调试与验证方法

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
$env:NODE_ENV = "test"; npm test
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run prisma:generate
npm run typecheck
NODE_ENV=test npm test
```
</div>

## 13. 分项练习说明

`01-observability-model` 建立 signal 问题边界；`02-structured-logging` 练习 JSON logs、log levels、redaction、log injection、requestId 和 trace correlation；`03-metrics` 练习 counter、gauge、histogram、HTTP duration、event loop delay、process resources、safe labels 和 `/metrics`；`04-health-diagnostics` 练习 liveness/readiness、PostgreSQL/Redis readiness、process warning、unhandled rejection 和 report privacy；`05-tracing` 练习 manual spans、SDK 初始化顺序和 dependency spans；`06-testing-observability` 固化安全与机制行为。

## 14. 最终迷你项目

### 14.1 项目目标

`observable-notes-api` 是一个 session/CSRF protected notes API。它继承前面章节的 auth/notebook/note 形状，只新增本章关注的 structured logs、request context、redaction、metrics、health checks、manual spans、Prisma/Redis diagnostics、process diagnostics 和 observability tests。

### 14.2 最终迷你项目结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```txt
observable-notes-api/
  package.json
  tsconfig.json
  .env.example
  prisma.config.ts
  prisma/schema.prisma
  src/app.ts
  src/server.ts
  src/observability/
  src/health/
  src/modules/
  src/shared/
  openapi/openapi.yaml
  tests/
  README.md
```
</div>

### 14.3 完整项目代码

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/package.json</span>
  </div>

```json
{
  "name": "observable-notes-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "typecheck": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "seed": "prisma db seed",
    "test": "node --import tsx --test tests/health.integration.test.ts tests/metrics.integration.test.ts tests/logging.integration.test.ts tests/request-context.integration.test.ts tests/redaction.unit.test.ts"
  },
  "dependencies": {
    "@opentelemetry/api": "^1.9.1",
    "@opentelemetry/instrumentation-express": "^0.69.0",
    "@opentelemetry/instrumentation-http": "^0.221.0",
    "@opentelemetry/resources": "^2.10.0",
    "@opentelemetry/sdk-metrics": "^2.10.0",
    "@opentelemetry/sdk-node": "^0.221.0",
    "@opentelemetry/sdk-trace-node": "^2.10.0",
    "@opentelemetry/semantic-conventions": "^1.43.0",
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.6.0",
    "helmet": "^8.3.0",
    "pg": "^8.22.0",
    "pino": "^10.3.1",
    "pino-http": "^11.0.0",
    "prom-client": "^15.1.3",
    "redis": "^6.1.0",
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
    <span class="macos-code-title">mini-projects/observable-notes-api/tsconfig.json</span>
  </div>

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src", "prisma", "tests"]
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/.env.example</span>
  </div>

```txt
NODE_ENV=development
PORT=3010
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/observable_notes_api
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=observable_notes_session
SESSION_TTL_SECONDS=604800
CSRF_COOKIE_NAME=observable_notes_csrf
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=info
OTEL_SERVICE_NAME=observable-notes-api
METRICS_ENABLED=true
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/prisma.config.ts</span>
  </div>

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/prisma/schema.prisma</span>
  </div>

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  USER
  ADMIN
}

enum NoteStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

model User {
  id           String     @id @default(uuid()) @db.Uuid
  email        String     @unique @db.VarChar(320)
  passwordHash String     @db.Text
  role         Role       @default(USER)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  sessions     Session[]
  notebooks    Notebook[]
  notes        Note[]
}

model Session {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @db.Uuid
  tokenHash     String    @unique @db.VarChar(96)
  csrfTokenHash String?   @db.VarChar(96)
  userAgent     String?   @db.VarChar(512)
  ipHash        String?   @db.VarChar(96)
  createdAt     DateTime  @default(now())
  expiresAt     DateTime
  revokedAt     DateTime?
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model Notebook {
  id        String   @id @default(uuid()) @db.Uuid
  ownerId   String   @db.Uuid
  name      String   @db.VarChar(120)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notes     Note[]

  @@index([ownerId])
  @@unique([ownerId, name])
}

model Note {
  id         String     @id @default(uuid()) @db.Uuid
  ownerId    String     @db.Uuid
  notebookId String     @db.Uuid
  title      String     @db.VarChar(160)
  body       String     @default("")
  status     NoteStatus @default(ACTIVE)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  owner      User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notebook   Notebook   @relation(fields: [notebookId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@index([notebookId])
  @@index([status, createdAt])
  @@unique([notebookId, title])
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/prisma/seed.ts</span>
  </div>

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { NoteStatus, PrismaClient, Role } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      passwordHash: hashPassword("password-12345"),
      role: Role.USER
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: { ownerId_name: { ownerId: owner.id, name: "Observable notes" } },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Observable notes"
    }
  });

  await prisma.note.upsert({
    where: { notebookId_title: { notebookId: notebook.id, title: "First observable note" } },
    update: {},
    create: {
      ownerId: owner.id,
      notebookId: notebook.id,
      title: "First observable note",
      body: "This note is used for logging, metrics, tracing, and health check examples.",
      status: NoteStatus.ACTIVE
    }
  });
}

await main();
await prisma.$disconnect();
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/instrumentation.ts</span>
  </div>

```ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { config } from "./config/env.js";

let sdk: NodeSDK | undefined;

export function startInstrumentation(): void {
  if (sdk) return;

  sdk = new NodeSDK({
    serviceName: config.OTEL_SERVICE_NAME,
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()]
  });

  sdk.start();
}

export async function stopInstrumentation(): Promise<void> {
  await sdk?.shutdown();
  sdk = undefined;
}

startInstrumentation();
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/app.ts</span>
  </div>

```ts
import express from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { requestLogger } from "./observability/request-logger.js";
import { startEventLoopMetrics } from "./observability/event-loop-metrics.js";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { notFound } from "./shared/middleware/not-found.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";

startEventLoopMetrics();

export const app = express();

app.disable("x-powered-by");
app.use(requestId);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(apiRateLimit);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.use("/health", healthRoutes);
app.use("/metrics", metricsRoutes);
app.use("/auth", authRoutes);
app.use("/notebooks", authenticateSession, notebookRoutes);
app.use("/notes", authenticateSession, notesRoutes);

app.use(notFound);
app.use(errorLogger);
app.use(errorMiddleware);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/server.ts</span>
  </div>

```ts
import "./instrumentation.js";
import { createServer } from "node:http";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedisClient } from "./redis/redis-client.js";
import { app } from "./app.js";
import { logger } from "./observability/logger.js";
import { registerProcessEventHandlers } from "./observability/process-events.js";
import { stopEventLoopMetrics } from "./observability/event-loop-metrics.js";
import { stopInstrumentation } from "./instrumentation.js";

registerProcessEventHandlers();

const server = createServer(app);
let shuttingDown = false;

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "HTTP server started");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "shutdown signal received");

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  stopEventLoopMetrics();
  await closeRedisClient();
  await disconnectPrisma();
  await stopInstrumentation();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal).then(() => process.exit(0));
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

function numberFromEnv(defaultValue: number): z.ZodType<number> {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    return Number(value);
  }, z.number().int().positive());
}

function splitOrigins(value: string): string[] {
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: numberFromEnv(3010),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/observable_notes_api"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("observable_notes_session"),
  SESSION_TTL_SECONDS: numberFromEnv(604800),
  CSRF_COOKIE_NAME: z.string().min(1).default("observable_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://127.0.0.1:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  OTEL_SERVICE_NAME: z.string().min(1).default("observable-notes-api"),
  METRICS_ENABLED: z.preprocess((value) => {
    if (value === undefined || value === "") return true;
    return value === "true" || value === true;
  }, z.boolean())
});

const parsed = envSchema.parse(process.env);

export const config = {
  ...parsed,
  ALLOWED_ORIGINS: splitOrigins(parsed.ALLOWED_ORIGINS),
  COOKIE_SECURE: parsed.NODE_ENV === "production"
} as const;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/db/prisma.ts</span>
  </div>

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/env.js";
import { logger } from "../observability/logger.js";
import { redactSensitiveData } from "../observability/log-redaction.js";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL
});

export const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"]
});

process.on("warning", (warning) => {
  logger.warn({
    warning: redactSensitiveData({
      name: warning.name,
      message: warning.message
    })
  }, "process warning observed near database client");
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/db/prisma-errors.ts</span>
  </div>

```ts
import { Prisma } from "../generated/prisma/client.js";

export function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function toSafePrismaErrorCode(error: unknown): string | undefined {
  if (!isPrismaKnownRequestError(error)) return undefined;
  return error.code;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/db/db-health.ts</span>
  </div>

```ts
import { prisma } from "./prisma.js";
import { withDependencySpan } from "../observability/spans.js";

export type DependencyStatus = "ready" | "unavailable";

export async function checkPostgresReadiness(): Promise<DependencyStatus> {
  try {
    await withDependencySpan("postgres", "SELECT 1", () => prisma.$queryRaw`SELECT 1`);
    return "ready";
  } catch {
    return "unavailable";
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/redis/redis-client.ts</span>
  </div>

```ts
import { createClient } from "redis";
import { config } from "../config/env.js";
import { logger } from "../observability/logger.js";
import { redactSensitiveData } from "../observability/log-redaction.js";

export type AppRedisClient = ReturnType<typeof createClient>;

let client: AppRedisClient | undefined;

export function getRedisClient(): AppRedisClient {
  if (!client) {
    client = createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: false,
        connectTimeout: 500
      }
    });

    client.on("error", (error) => {
      logger.error({ error: redactSensitiveData(error) }, "redis client error");
    });

    client.on("ready", () => {
      logger.info({ dependency: "redis" }, "redis client ready");
    });

    client.on("end", () => {
      logger.warn({ dependency: "redis" }, "redis client ended");
    });
  }

  return client;
}

export async function connectRedisClient(): Promise<AppRedisClient> {
  const redis = getRedisClient();
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function closeRedisClient(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/redis/redis-health.ts</span>
  </div>

```ts
import { connectRedisClient } from "./redis-client.js";
import { withDependencySpan } from "../observability/spans.js";

export type RedisStatus = "ready" | "unavailable";

export async function checkRedisReadiness(): Promise<RedisStatus> {
  try {
    const redis = await connectRedisClient();
    const response = await withDependencySpan("redis", "PING", () => redis.ping());
    return response === "PONG" ? "ready" : "unavailable";
  } catch {
    return "unavailable";
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/logger.ts</span>
  </div>

```ts
import pino from "pino";
import { config } from "../config/env.js";
import { pinoRedactionPaths } from "./log-redaction.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  base: {
    service: config.OTEL_SERVICE_NAME
  },
  messageKey: "message",
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: pinoRedactionPaths,
    censor: "[REDACTED]"
  }
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/log-redaction.ts</span>
  </div>

```ts
const sensitiveKeyPattern = /password|cookie|authorization|csrf|session|token|database_url|redis_url|databaseUrl|redisUrl|secret/i;
const sensitiveValuePattern = /(postgresql|postgres|redis):\/\/[^\s]+|Bearer\s+[^\s]+|sid=[^\s;]+/gi;

export const pinoRedactionPaths = [
  "password",
  "body.password",
  "headers.cookie",
  "headers.authorization",
  "headers.x-csrf-token",
  "cookie",
  "authorization",
  "csrfToken",
  "sessionToken",
  "DATABASE_URL",
  "REDIS_URL",
  "databaseUrl",
  "redisUrl"
];

export function redactString(value: string): string {
  return value.replace(sensitiveValuePattern, "[REDACTED]");
}

export function redactSensitiveData(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redactSensitiveData);
  if (!value || typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, childValue] of Object.entries(value)) {
    output[key] = sensitiveKeyPattern.test(key) ? "[REDACTED]" : redactSensitiveData(childValue);
  }
  return output;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/log-sanitization.ts</span>
  </div>

```ts
export function sanitizeLogField(value: unknown): string {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(/[\r\n\t|]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeRoutePattern(route: string): string {
  if (!route || route === "unmatched") return "unmatched";
  return sanitizeLogField(route);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/request-context.ts</span>
  </div>

```ts
import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  requestId: string;
  startedAt: number;
  traceId?: string;
  spanId?: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function getRequestId(): string | undefined {
  return getRequestContext()?.requestId;
}

export function attachTraceContext(traceId?: string, spanId?: string): void {
  const context = getRequestContext();
  if (!context) return;
  context.traceId = traceId;
  context.spanId = spanId;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/request-logger.ts</span>
  </div>

```ts
import { performance } from "node:perf_hooks";
import type { Request, RequestHandler } from "express";
import { logger } from "./logger.js";
import { sanitizeLogField, sanitizeRoutePattern } from "./log-sanitization.js";
import { observeHttpRequest } from "./http-metrics.js";
import { getActiveTraceFields } from "./tracing.js";
import { getRequestContext } from "./request-context.js";

export function getRoutePattern(request: Request): string {
  const routePath = typeof request.route?.path === "string" ? request.route.path : "unmatched";
  if (routePath === "unmatched") return "unmatched";
  return sanitizeRoutePattern(`${request.baseUrl}${routePath}` || "/");
}

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();

  response.on("finish", () => {
    const durationSeconds = (performance.now() - startedAt) / 1000;
    const route = getRoutePattern(request);
    const traceFields = getActiveTraceFields();
    const context = getRequestContext();

    observeHttpRequest(request.method, route, response.statusCode, durationSeconds);

    logger.info({
      requestId: context?.requestId,
      traceId: traceFields.traceId,
      spanId: traceFields.spanId,
      method: sanitizeLogField(request.method),
      route,
      statusCode: response.statusCode,
      durationMs: Number((durationSeconds * 1000).toFixed(2))
    }, "request completed");
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/error-logger.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { getRequestContext } from "./request-context.js";
import { logger } from "./logger.js";
import { redactSensitiveData } from "./log-redaction.js";
import { sanitizeLogField } from "./log-sanitization.js";
import { getRoutePattern } from "./request-logger.js";

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return redactSensitiveData({
      name: error.name,
      message: error.message,
      stack: error.stack
    }) as Record<string, unknown>;
  }

  return { message: sanitizeLogField(error) };
}

export const errorLogger: ErrorRequestHandler = (error, request, _response, next) => {
  const context = getRequestContext();
  const routePattern = getRoutePattern(request);
  const safeRoute = routePattern === "unmatched" ? sanitizeLogField(request.path || "unmatched") : routePattern;

  logger.error({
    requestId: context?.requestId,
    method: sanitizeLogField(request.method),
    route: safeRoute,
    error: serializeError(error)
  }, "request failed");

  next(error);
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/metrics.ts</span>
  </div>

```ts
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from "prom-client";
import { config } from "../config/env.js";

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: config.OTEL_SERVICE_NAME
});

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "nodejs_"
});

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry]
});

export const processUptimeSeconds = new Gauge({
  name: "app_process_uptime_seconds",
  help: "Current process uptime in seconds.",
  collect() {
    this.set(process.uptime());
  },
  registers: [metricsRegistry]
});

export const processResidentMemoryBytes = new Gauge({
  name: "app_process_resident_memory_bytes",
  help: "Current resident set size in bytes.",
  collect() {
    this.set(process.memoryUsage().rss);
  },
  registers: [metricsRegistry]
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/http-metrics.ts</span>
  </div>

```ts
import { httpRequestDurationSeconds, httpRequestsTotal } from "./metrics.js";
import { sanitizeRoutePattern } from "./log-sanitization.js";

const unsafeLabelNames = new Set([
  "userId",
  "email",
  "requestId",
  "sessionId",
  "noteId",
  "traceId",
  "rawUrl",
  "errorMessage",
  "authorization",
  "cookie"
]);

export function toStatusClass(statusCode: number): string {
  return `${Math.trunc(statusCode / 100)}xx`;
}

export function assertSafeMetricLabelName(labelName: string): void {
  if (unsafeLabelNames.has(labelName)) {
    throw new Error(`Unsafe metric label name: ${labelName}`);
  }
}

export function observeHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number): void {
  const labels = {
    method,
    route: sanitizeRoutePattern(route),
    status_class: toStatusClass(statusCode)
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationSeconds);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/event-loop-metrics.ts</span>
  </div>

```ts
import { monitorEventLoopDelay } from "node:perf_hooks";
import { Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

const eventLoopDelay = monitorEventLoopDelay({ resolution: 20 });
let enabled = false;

export function startEventLoopMetrics(): void {
  if (enabled) return;
  eventLoopDelay.enable();
  enabled = true;
}

export function stopEventLoopMetrics(): void {
  if (!enabled) return;
  eventLoopDelay.disable();
  enabled = false;
}

export const eventLoopDelaySeconds = new Gauge({
  name: "nodejs_event_loop_delay_seconds",
  help: "Mean event loop delay in seconds since the previous scrape.",
  collect() {
    this.set(Number.isFinite(eventLoopDelay.mean) ? eventLoopDelay.mean / 1_000_000_000 : 0);
    eventLoopDelay.reset();
  },
  registers: [metricsRegistry]
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/metrics.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response) => {
  response.setHeader("content-type", metricsRegistry.contentType);
  response.status(200).send(await metricsRegistry.metrics());
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/tracing.ts</span>
  </div>

```ts
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { attachTraceContext } from "./request-context.js";

const tracer = trace.getTracer("observable-notes-api");

type SpanAttributeValue = string | number | boolean;
type SpanAttributes = Record<string, SpanAttributeValue>;

export function getActiveTraceFields(): { traceId?: string; spanId?: string } {
  const activeSpan = trace.getActiveSpan();
  const spanContext = activeSpan?.spanContext();
  if (!spanContext) return {};

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId
  };
}

export async function runWithSpan<T>(name: string, attributes: SpanAttributes, operation: () => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    const spanContext = span.spanContext();
    attachTraceContext(spanContext.traceId, spanContext.spanId);

    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/spans.ts</span>
  </div>

```ts
import { runWithSpan } from "./tracing.js";

type ServiceOperation = "notebooks.list" | "notebooks.write" | "notes.list" | "notes.write";
type DependencyName = "postgres" | "redis";

export function withServiceSpan<T>(operation: ServiceOperation, callback: () => Promise<T>): Promise<T> {
  return runWithSpan(`service.${operation}`, { "app.operation": operation }, callback);
}

export function withDependencySpan<T>(dependency: DependencyName, operation: string, callback: () => Promise<T>): Promise<T> {
  return runWithSpan(`dependency.${dependency}.${operation}`, {
    "dependency.system": dependency,
    "dependency.operation": operation
  }, callback);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/diagnostics-channel.ts</span>
  </div>

```ts
import diagnosticsChannel from "node:diagnostics_channel";
import { getRequestContext } from "./request-context.js";
import { redactSensitiveData } from "./log-redaction.js";

const appChannel = diagnosticsChannel.channel("observable-notes-api.lifecycle");

export function publishDiagnosticEvent(name: string, payload: Record<string, unknown>): void {
  appChannel.publish({
    name,
    requestId: getRequestContext()?.requestId,
    payload: redactSensitiveData(payload),
    time: new Date().toISOString()
  });
}

export function subscribeDiagnosticEvents(listener: (message: unknown) => void): () => void {
  const subscriber = (message: unknown) => listener(message);
  appChannel.subscribe(subscriber);
  return () => appChannel.unsubscribe(subscriber);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/diagnostic-report.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import { join } from "node:path";

export function writePrivateDiagnosticReport(directory = process.cwd()): string | undefined {
  if (!process.report?.writeReport) return undefined;

  const filename = join(directory, `node-report-${randomUUID()}.json`);
  return process.report.writeReport(filename);
}

export function diagnosticReportsArePublic(): false {
  return false;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/observability/process-events.ts</span>
  </div>

```ts
import { logger } from "./logger.js";
import { redactSensitiveData } from "./log-redaction.js";

let registered = false;

export function registerProcessEventHandlers(options: { exitOnUncaughtException?: boolean } = {}): void {
  if (registered) return;
  registered = true;

  process.on("warning", (warning) => {
    logger.warn({
      warning: redactSensitiveData({
        name: warning.name,
        message: warning.message,
        stack: warning.stack
      })
    }, "process warning observed");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({
      reason: redactSensitiveData(reason)
    }, "unhandled rejection observed");
    process.exitCode = 1;
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({
      error: redactSensitiveData({
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }, "uncaught exception observed");

    if (options.exitOnUncaughtException !== false) {
      process.exit(1);
    }
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/health/health.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import * as controller from "./health.controller.js";

export const healthRoutes = Router();

healthRoutes.get("/live", controller.live);
healthRoutes.get("/ready", controller.ready);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/health/health.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { sendSuccess } from "../shared/responses/send-response.js";
import * as service from "./health.service.js";

export const live: RequestHandler = (_request, response) => {
  sendSuccess(response, 200, service.getLiveHealth());
};

export const ready: RequestHandler = async (_request, response, next) => {
  try {
    const health = await service.getReadyHealth();
    sendSuccess(response, health.status === "ready" ? 200 : 503, health);
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/health/health.service.ts</span>
  </div>

```ts
import { checkPostgresReadiness } from "../db/db-health.js";
import { checkRedisReadiness } from "../redis/redis-health.js";
import type { LiveHealth, ReadyHealth } from "./health.types.js";

export function getLiveHealth(): LiveHealth {
  return {
    status: "live",
    uptimeSeconds: Number(process.uptime().toFixed(3))
  };
}

export async function getReadyHealth(): Promise<ReadyHealth> {
  const [postgres, redis] = await Promise.all([
    checkPostgresReadiness(),
    checkRedisReadiness()
  ]);

  return {
    status: postgres === "ready" && redis === "ready" ? "ready" : "not_ready",
    dependencies: {
      postgres,
      redis
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/health/health.types.ts</span>
  </div>

```ts
export type DependencyHealth = "ready" | "unavailable";

export type LiveHealth = {
  status: "live";
  uptimeSeconds: number;
};

export type ReadyHealth = {
  status: "ready" | "not_ready";
  dependencies: {
    postgres: DependencyHealth;
    redis: DependencyHealth;
  };
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/auth/auth.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { authenticateSession } from "../../shared/auth/authenticate-session.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { csrfController, loginController, logoutController, meController, registerController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: registerSchema }), registerController);
authRoutes.post("/login", validateRequest({ body: loginSchema }), loginController);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, logoutController);
authRoutes.get("/me", authenticateSession, meController);
authRoutes.get("/csrf", authenticateSession, csrfController);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/auth/auth.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { issueCsrfTokenForSession } from "../../shared/auth/csrf.js";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { setSessionCookie, clearSessionCookie, setCsrfCookie } from "../../shared/cookies/session-cookie.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { login, logout, register } from "./auth.service.js";

const requestMeta = (request: Parameters<RequestHandler>[0]) => ({
  userAgent: request.header("user-agent") ?? undefined,
  ip: request.ip
});

export const registerController: RequestHandler = async (request, response, next) => {
  try {
    const result = await register(request.body, requestMeta(request));
    setSessionCookie(response, result.sessionToken, result.expiresAt);
    sendSuccess(response, 201, { user: result.user });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const result = await login(request.body, requestMeta(request));
    setSessionCookie(response, result.sessionToken, result.expiresAt);
    sendSuccess(response, 200, { user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    await logout(auth.sessionId);
    clearSessionCookie(response);
    sendSuccess(response, 200, { loggedOut: true });
  } catch (error) {
    next(error);
  }
};

export const meController: RequestHandler = (_request, response) => {
  const auth = requireAuthContext(response);
  sendSuccess(response, 200, { user: { id: auth.userId, email: auth.email, role: auth.role } });
};

export const csrfController: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const csrfToken = await issueCsrfTokenForSession(auth.sessionId);
    setCsrfCookie(response, csrfToken);
    sendSuccess(response, 200, { csrfToken });
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/auth/auth.service.ts</span>
  </div>

```ts
import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashSessionToken } from "../../shared/auth/session-token.js";
import { createSession, createUser, findUserByEmail, revokeSession } from "./auth.repository.js";
import type { AuthResult, PublicUserDto } from "./auth.types.js";

function toPublicUser(user: { id: string; email: string; role: PublicUserDto["role"] }): PublicUserDto {
  return { id: user.id, email: user.email, role: user.role };
}

async function createAuthResult(user: { id: string; email: string; role: PublicUserDto["role"] }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const sessionToken = createSessionToken();
  const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000);
  await createSession({
    userId: user.id,
    tokenHash: hashSessionToken(sessionToken),
    userAgent: requestMeta.userAgent,
    ip: requestMeta.ip,
    expiresAt
  });

  return { user: toPublicUser(user), sessionToken, expiresAt };
}

export async function register(input: { email: string; password: string }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new HttpError(409, "Email is already registered.", "EMAIL_REGISTERED");
  }

  const user = await createUser({
    email: input.email,
    passwordHash: hashPassword(input.password)
  });

  return createAuthResult(user, requestMeta);
}

export async function login(input: { email: string; password: string }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new HttpError(401, "Email or password is invalid.", "INVALID_CREDENTIALS");
  }

  return createAuthResult(user, requestMeta);
}

export async function logout(sessionId: string): Promise<void> {
  await revokeSession(sessionId);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/auth/auth.repository.ts</span>
  </div>

```ts
import { createHash } from "node:crypto";
import { prisma } from "../../db/prisma.js";
import { Role } from "../../generated/prisma/client.js";

export async function createUser(input: { email: string; passwordHash: string }) {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      role: Role.USER
    }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createSession(input: { userId: string; tokenHash: string; userAgent?: string; ip?: string; expiresAt: Date }) {
  return prisma.session.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      userAgent: input.userAgent,
      ipHash: input.ip ? createHash("sha256").update(input.ip).digest("base64url") : undefined,
      expiresAt: input.expiresAt
    }
  });
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() }
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/auth/auth.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(128)
});

export const loginSchema = registerSchema;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/auth/auth.types.ts</span>
  </div>

```ts
import type { Role } from "../../generated/prisma/client.js";

export type PublicUserDto = {
  id: string;
  email: string;
  role: Role;
};

export type AuthResult = {
  user: PublicUserDto;
  sessionToken: string;
  expiresAt: Date;
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/users/users.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/users/users.types.ts</span>
  </div>

```ts
import type { Role } from "../../generated/prisma/client.js";

export type UserRecord = {
  id: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notebooks/notebooks.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createNotebookSchema, notebookParamsSchema, updateNotebookSchema } from "./notebooks.schema.js";
import * as controller from "./notebooks.controller.js";
import { notebookNotesRoutes } from "../notes/notebook-notes.routes.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", controller.list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookSchema }), controller.create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), controller.getById);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookSchema }), controller.update);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), controller.remove);
notebookRoutes.use("/:notebookId/notes", notebookNotesRoutes);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notebooks/notebooks.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { createUserNotebook, deleteUserNotebook, getNotebook, listUserNotebooks, updateUserNotebook } from "./notebooks.service.js";

export const list: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    sendSuccess(response, 200, { notebooks: await listUserNotebooks(auth.userId) });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notebook: await getNotebook(auth.userId, notebookId) });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    sendSuccess(response, 201, { notebook: await createUserNotebook(auth.userId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notebook: await updateUserNotebook(auth.userId, notebookId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    await deleteUserNotebook(auth.userId, notebookId);
    sendSuccess(response, 200, { deleted: true });
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notebooks/notebooks.service.ts</span>
  </div>

```ts
import { requireOwner } from "../../shared/auth/authorize-owner.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { withServiceSpan } from "../../observability/spans.js";
import { createNotebook, deleteNotebook, findNotebookById, listNotebooks, toNotebookDto, updateNotebook } from "./notebooks.repository.js";
import type { NotebookDto } from "./notebooks.types.js";

export async function listUserNotebooks(ownerId: string): Promise<NotebookDto[]> {
  const notebooks = await withServiceSpan("notebooks.list", () => listNotebooks(ownerId));
  return notebooks.map(toNotebookDto);
}

export async function getNotebook(ownerId: string, notebookId: string): Promise<NotebookDto> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);
  return toNotebookDto(notebook);
}

export async function createUserNotebook(ownerId: string, input: { name: string }): Promise<NotebookDto> {
  return toNotebookDto(await withServiceSpan("notebooks.write", () => createNotebook({ ownerId, name: input.name })));
}

export async function updateUserNotebook(ownerId: string, notebookId: string, input: { name: string }): Promise<NotebookDto> {
  await getNotebook(ownerId, notebookId);
  return toNotebookDto(await withServiceSpan("notebooks.write", () => updateNotebook(notebookId, input)));
}

export async function deleteUserNotebook(ownerId: string, notebookId: string): Promise<void> {
  await getNotebook(ownerId, notebookId);
  await withServiceSpan("notebooks.write", () => deleteNotebook(notebookId));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notebooks/notebooks.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import type { NotebookDto, NotebookRecord } from "./notebooks.types.js";

export function toNotebookDto(notebook: NotebookRecord): NotebookDto {
  return {
    id: notebook.id,
    name: notebook.name,
    createdAt: notebook.createdAt.toISOString(),
    updatedAt: notebook.updatedAt.toISOString()
  };
}

export async function listNotebooks(ownerId: string): Promise<NotebookRecord[]> {
  return prisma.notebook.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" }
  });
}

export async function findNotebookById(id: string): Promise<NotebookRecord | null> {
  return prisma.notebook.findUnique({ where: { id } });
}

export async function createNotebook(input: { ownerId: string; name: string }): Promise<NotebookRecord> {
  return prisma.notebook.create({ data: input });
}

export async function updateNotebook(id: string, input: { name: string }): Promise<NotebookRecord> {
  return prisma.notebook.update({
    where: { id },
    data: input
  });
}

export async function deleteNotebook(id: string): Promise<void> {
  await prisma.notebook.delete({ where: { id } });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notebooks/notebooks.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNotebookSchema = z.object({
  name: z.string().min(1).max(120)
});

export const updateNotebookSchema = createNotebookSchema;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notebooks/notebooks.types.ts</span>
  </div>

```ts
import type { Notebook } from "../../generated/prisma/client.js";

export type NotebookRecord = Notebook;

export type NotebookDto = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notes/notebook-notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createNoteSchema, listNotesQuerySchema, notebookNoteParamsSchema } from "./notes.schema.js";
import * as controller from "./notes.controller.js";

export const notebookNotesRoutes = Router({ mergeParams: true });

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema, query: listNotesQuerySchema }), controller.listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteSchema }), controller.createForNotebook);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notes/notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { noteParamsSchema, updateNoteSchema } from "./notes.schema.js";
import * as controller from "./notes.controller.js";

export const notesRoutes = Router();

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), controller.getById);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteSchema }), controller.updateById);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), controller.removeById);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notes/notes.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { createNotebookNote, deleteUserNote, getNote, listNotebookNotes, updateUserNote } from "./notes.service.js";

export const listForNotebook: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notes: await listNotebookNotes(auth.userId, notebookId, request.query as never) });
  } catch (error) {
    next(error);
  }
};

export const createForNotebook: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 201, { note: await createNotebookNote(auth.userId, notebookId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    sendSuccess(response, 200, { note: await getNote(auth.userId, noteId) });
  } catch (error) {
    next(error);
  }
};

export const updateById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    sendSuccess(response, 200, { note: await updateUserNote(auth.userId, noteId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const removeById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    await deleteUserNote(auth.userId, noteId);
    sendSuccess(response, 200, { deleted: true });
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notes/notes.service.ts</span>
  </div>

```ts
import { HttpError } from "../../shared/errors/http-error.js";
import { requireOwner } from "../../shared/auth/authorize-owner.js";
import { withServiceSpan } from "../../observability/spans.js";
import { findNotebookById } from "../notebooks/notebooks.repository.js";
import { createNote, deleteNote, findNoteById, listNotes, toNoteDto, updateNote } from "./notes.repository.js";
import type { NoteDto, NoteStatus } from "./notes.types.js";

export async function listNotebookNotes(ownerId: string, notebookId: string, query: { status?: NoteStatus; limit: number; offset: number }): Promise<NoteDto[]> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);

  const notes = await withServiceSpan("notes.list", () => listNotes({ ownerId, notebookId, ...query }));
  return notes.map(toNoteDto);
}

export async function createNotebookNote(ownerId: string, notebookId: string, input: { title: string; body: string; status: NoteStatus }): Promise<NoteDto> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);

  const note = await withServiceSpan("notes.write", () => createNote({ ownerId, notebookId, ...input }));
  return toNoteDto(note);
}

export async function getNote(ownerId: string, noteId: string): Promise<NoteDto> {
  const note = await findNoteById(noteId);
  if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(note.ownerId, ownerId);
  return toNoteDto(note);
}

export async function updateUserNote(ownerId: string, noteId: string, input: Partial<{ title: string; body: string; status: NoteStatus }>): Promise<NoteDto> {
  const existing = await findNoteById(noteId);
  if (!existing) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(existing.ownerId, ownerId);

  const note = await withServiceSpan("notes.write", () => updateNote(noteId, input));
  return toNoteDto(note);
}

export async function deleteUserNote(ownerId: string, noteId: string): Promise<void> {
  const note = await findNoteById(noteId);
  if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(note.ownerId, ownerId);
  await withServiceSpan("notes.write", () => deleteNote(noteId));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notes/notes.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import type { NoteDto, NoteRecord, NoteStatus } from "./notes.types.js";

export function toNoteDto(note: NoteRecord): NoteDto {
  return {
    id: note.id,
    notebookId: note.notebookId,
    title: note.title,
    body: note.body,
    status: note.status,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  };
}

export async function listNotes(input: {
  ownerId: string;
  notebookId: string;
  status?: NoteStatus;
  limit: number;
  offset: number;
}): Promise<NoteRecord[]> {
  return prisma.note.findMany({
    where: {
      ownerId: input.ownerId,
      notebookId: input.notebookId,
      status: input.status
    },
    orderBy: { createdAt: "desc" },
    take: input.limit,
    skip: input.offset
  });
}

export async function findNoteById(id: string): Promise<NoteRecord | null> {
  return prisma.note.findUnique({ where: { id } });
}

export async function createNote(input: {
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
}): Promise<NoteRecord> {
  return prisma.note.create({ data: input });
}

export async function updateNote(id: string, input: Partial<Pick<NoteRecord, "title" | "body" | "status">>): Promise<NoteRecord> {
  return prisma.note.update({
    where: { id },
    data: input
  });
}

export async function deleteNote(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notes/notes.schema.ts</span>
  </div>

```ts
import { z } from "zod";

const noteStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const listNotesQuerySchema = z.object({
  status: noteStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export const createNoteSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().max(20000).default(""),
  status: noteStatusSchema.default("ACTIVE")
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  body: z.string().max(20000).optional(),
  status: noteStatusSchema.optional()
}).refine((input) => Object.keys(input).length > 0, {
  message: "At least one note field is required."
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/modules/notes/notes.types.ts</span>
  </div>

```ts
import type { Note, NoteStatus } from "../../generated/prisma/client.js";

export type NoteRecord = Note;
export type { NoteStatus };

export type NoteDto = {
  id: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/auth/auth-context.ts</span>
  </div>

```ts
import type { Response } from "express";
import type { Role } from "../../generated/prisma/client.js";

export type AuthContext = {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
};

export function attachAuthContext(response: Response, context: AuthContext): void {
  response.locals.auth = context;
}

export function requireAuthContext(response: Response): AuthContext {
  const context = response.locals.auth as AuthContext | undefined;
  if (!context) {
    throw new Error("Auth context is missing.");
  }

  return context;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/auth/authenticate-session.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { parseCookieHeader } from "../cookies/cookie-parser.js";
import { attachAuthContext } from "./auth-context.js";
import { hashSessionToken } from "./session-token.js";

export const authenticateSession: RequestHandler = async (request, response, next) => {
  try {
    const cookies = parseCookieHeader(request.headers.cookie);
    const token = cookies.get(config.SESSION_COOKIE_NAME);

    if (!token) {
      throw new HttpError(401, "Authentication is required.", "AUTH_REQUIRED");
    }

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(401, "Authentication is required.", "AUTH_REQUIRED");
    }

    attachAuthContext(response, {
      userId: session.userId,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id
    });

    next();
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/auth/authorize-owner.ts</span>
  </div>

```ts
import { HttpError } from "../errors/http-error.js";

export function requireOwner(resourceOwnerId: string, authenticatedUserId: string): void {
  if (resourceOwnerId !== authenticatedUserId) {
    throw new HttpError(403, "The resource does not belong to the authenticated user.", "OWNER_REQUIRED");
  }
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/auth/csrf.ts</span>
  </div>

```ts
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { requireAuthContext } from "./auth-context.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCsrfToken(token: string): string {
  return createHash("sha256").update("csrf:" + token, "utf8").digest("base64url");
}

export async function issueCsrfTokenForSession(sessionId: string): Promise<string> {
  const token = createCsrfToken();
  await prisma.session.update({
    where: { id: sessionId },
    data: { csrfTokenHash: hashCsrfToken(token) }
  });
  return token;
}

export const requireCsrfToken: RequestHandler = async (request, response, next) => {
  try {
    if (SAFE_METHODS.has(request.method)) {
      next();
      return;
    }

    const auth = requireAuthContext(response);
    const token = request.header("x-csrf-token");
    if (!token) {
      throw new HttpError(403, "CSRF token is required.", "CSRF_REQUIRED");
    }

    const session = await prisma.session.findUnique({
      where: { id: auth.sessionId },
      select: { csrfTokenHash: true }
    });

    if (!session?.csrfTokenHash || !isHashMatch(hashCsrfToken(token), session.csrfTokenHash)) {
      throw new HttpError(403, "CSRF token is invalid.", "CSRF_INVALID");
    }

    next();
  } catch (error) {
    next(error);
  }
};

function isHashMatch(candidateHash: string, expectedHash: string): boolean {
  const candidate = Buffer.from(candidateHash, "base64url");
  const expected = Buffer.from(expectedHash, "base64url");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/auth/password-hashing.ts</span>
  </div>

```ts
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("base64url");
  return `${salt}.${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(".");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/auth/session-token.ts</span>
  </div>

```ts
import { createHash, randomBytes } from "node:crypto";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update("session:" + token, "utf8").digest("base64url");
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/cookies/session-cookie.ts</span>
  </div>

```ts
import type { Response } from "express";
import { config } from "../../config/env.js";

export function setSessionCookie(response: Response, token: string, expiresAt: Date): void {
  response.cookie(config.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.COOKIE_SECURE,
    expires: expiresAt,
    path: "/"
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(config.SESSION_COOKIE_NAME, { path: "/" });
}

export function setCsrfCookie(response: Response, token: string): void {
  response.cookie(config.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: config.COOKIE_SECURE,
    path: "/"
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/cookies/cookie-parser.ts</span>
  </div>

```ts
export function parseCookieHeader(cookieHeader: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name) continue;
    cookies.set(name, decodeURIComponent(valueParts.join("=")));
  }

  return cookies;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/errors/http-error.ts</span>
  </div>

```ts
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/errors/error-middleware.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { getRequestId } from "../../observability/request-context.js";
import { toSafePrismaErrorCode } from "../../db/prisma-errors.js";
import { isHttpError } from "./http-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isHttpError(error)) {
    response.status(error.status).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? []
      },
      meta: { requestId: getRequestId() }
    });
    return;
  }

  const prismaCode = toSafePrismaErrorCode(error);
  if (prismaCode) {
    response.status(409).json({
      ok: false,
      error: {
        code: prismaCode,
        message: "Database constraint violation.",
        details: []
      },
      meta: { requestId: getRequestId() }
    });
    return;
  }

  response.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error.",
      details: []
    },
    meta: { requestId: getRequestId() }
  });
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/middleware/not-found.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFound: RequestHandler = () => {
  throw new HttpError(404, "Route was not found.", "ROUTE_NOT_FOUND");
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/middleware/request-id.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { runWithRequestContext } from "../../observability/request-context.js";
import { sanitizeLogField } from "../../observability/log-sanitization.js";

export const requestId: RequestHandler = (request, response, next) => {
  const incomingRequestId = request.header("x-request-id");
  const id = incomingRequestId ? sanitizeLogField(incomingRequestId).slice(0, 128) : randomUUID();

  response.setHeader("x-request-id", id);
  response.locals.requestId = id;

  runWithRequestContext({ requestId: id, startedAt: performance.now() }, () => {
    next();
  });
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/middleware/security-headers.ts</span>
  </div>

```ts
import helmet from "helmet";

export const securityHeaders = helmet();
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/middleware/cors.ts</span>
  </div>

```ts
import cors from "cors";
import { config } from "../../config/env.js";

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin is not allowed."));
  },
  allowedHeaders: ["content-type", "x-csrf-token", "last-event-id"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/middleware/rate-limit.ts</span>
  </div>

```ts
import { rateLimit } from "express-rate-limit";

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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/validation/validate-request.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../errors/http-error.js";

type RequestSchemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    try {
      if (schemas.params) request.params = schemas.params.parse(request.params) as typeof request.params;
      if (schemas.query) request.query = schemas.query.parse(request.query) as typeof request.query;
      if (schemas.body) request.body = schemas.body.parse(request.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(400, "Request validation failed.", "VALIDATION_FAILED", error.issues));
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
    <span class="macos-code-title">mini-projects/observable-notes-api/src/shared/responses/send-response.ts</span>
  </div>

```ts
import type { Response } from "express";

export function sendSuccess(response: Response, status: number, data: unknown): void {
  response.status(status).json({ ok: true, data });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/openapi/openapi.yaml</span>
  </div>

```yaml
openapi: 3.1.0
info:
  title: Observable Notes API
  version: 1.0.0
paths:
  /auth/register:
    post:
      summary: Register a user and create a session
      responses:
        "201":
          description: Registered
  /auth/login:
    post:
      summary: Create a session
      responses:
        "200":
          description: Logged in
  /auth/logout:
    post:
      summary: Delete the current session
      responses:
        "200":
          description: Logged out
  /auth/me:
    get:
      summary: Read the current user
      responses:
        "200":
          description: Current user
  /auth/csrf:
    get:
      summary: Rotate and return a CSRF token
      responses:
        "200":
          description: CSRF token
  /notebooks:
    get:
      summary: List notebooks
      responses:
        "200":
          description: Notebook list
    post:
      summary: Create a notebook
      responses:
        "201":
          description: Notebook created
  /notebooks/{notebookId}:
    get:
      summary: Read one notebook
      responses:
        "200":
          description: Notebook
    patch:
      summary: Update one notebook
      responses:
        "200":
          description: Notebook updated
    delete:
      summary: Delete one notebook
      responses:
        "200":
          description: Notebook deleted
  /notebooks/{notebookId}/notes:
    get:
      summary: List notes in a notebook
      responses:
        "200":
          description: Note list
    post:
      summary: Create a note in a notebook
      responses:
        "201":
          description: Note created
  /notes/{noteId}:
    get:
      summary: Read one note
      responses:
        "200":
          description: Note
    patch:
      summary: Update one note
      responses:
        "200":
          description: Note updated
    delete:
      summary: Delete one note
      responses:
        "200":
          description: Note deleted
  /health/live:
    get:
      summary: Check process liveness
      responses:
        "200":
          description: Process is live
  /health/ready:
    get:
      summary: Check dependency readiness
      responses:
        "200":
          description: Dependencies are ready
        "503":
          description: One or more dependencies are unavailable
  /metrics:
    get:
      summary: Expose Prometheus metrics text
      responses:
        "200":
          description: Metrics text
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/helpers/database.ts</span>
  </div>

```ts
export function databaseUrlConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/helpers/redis.ts</span>
  </div>

```ts
export function redisUrlConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/helpers/logs.ts</span>
  </div>

```ts
import { Writable } from "node:stream";

export function createLogCapture() {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    }
  });

  return {
    stream,
    read() {
      return chunks.join("");
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
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/health.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

test("live health does not require dependencies", async () => {
  const response = await request(app).get("/health/live").expect(200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.data.status, "live");
});

test("ready health returns safe dependency status", async () => {
  const response = await request(app).get("/health/ready");
  assert.ok([200, 503].includes(response.status));
  const body = JSON.stringify(response.body);
  assert.equal(body.includes("DATABASE_URL"), false);
  assert.equal(body.includes("REDIS_URL"), false);
  assert.equal(body.includes("postgresql://"), false);
  assert.equal(body.includes("redis://"), false);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/metrics.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { metricsRegistry } from "../src/observability/metrics.js";
import { observeHttpRequest } from "../src/observability/http-metrics.js";

test("metrics expose expected names and safe labels", async () => {
  observeHttpRequest("GET", "/notes/:noteId", 200, 0.02);
  const metrics = await metricsRegistry.metrics();

  assert.match(metrics, /http_requests_total/);
  assert.match(metrics, /http_request_duration_seconds/);
  assert.match(metrics, /route="\/notes\/:noteId"/);
  assert.equal(metrics.includes("requestId"), false);
  assert.equal(metrics.includes("email"), false);
  assert.equal(metrics.includes("rawUrl"), false);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/logging.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeLogField } from "../src/observability/log-sanitization.js";
import { redactSensitiveData } from "../src/observability/log-redaction.js";

test("log fields are sanitized before output", () => {
  assert.equal(sanitizeLogField("first\nsecond|third"), "first second third");
});

test("server log payloads can be redacted", () => {
  const payload = JSON.stringify(redactSensitiveData({ authorization: "Bearer token", message: "failed" }));
  assert.equal(payload.includes("Bearer token"), false);
  assert.match(payload, /failed/);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/request-context.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { getRequestContext, runWithRequestContext } from "../src/observability/request-context.js";

test("request context survives across awaited work", async () => {
  await runWithRequestContext({ requestId: "req_test", startedAt: performance.now() }, async () => {
    await Promise.resolve();
    assert.equal(getRequestContext()?.requestId, "req_test");
  });
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/tests/redaction.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { redactSensitiveData } from "../src/observability/log-redaction.js";

test("redactSensitiveData removes sensitive values", () => {
  const redacted = JSON.stringify(redactSensitiveData({
    password: "secret-password",
    headers: {
      cookie: "sid=123",
      authorization: "Bearer token"
    },
    csrfToken: "csrf-value",
    sessionToken: "session-value",
    databaseUrl: "postgresql://user:pass@localhost:5432/app",
    redisUrl: "redis://:pass@localhost:6379"
  }));

  assert.equal(redacted.includes("secret-password"), false);
  assert.equal(redacted.includes("sid=123"), false);
  assert.equal(redacted.includes("Bearer token"), false);
  assert.equal(redacted.includes("csrf-value"), false);
  assert.equal(redacted.includes("session-value"), false);
  assert.equal(redacted.includes("user:pass"), false);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/observable-notes-api/README.md</span>
  </div>

````md
# Observable Notes API

A learning mini project for production observability boundaries in a Node.js, Express 5, TypeScript, Prisma, Redis, Pino, prom-client, and OpenTelemetry service.

## Environment

Create `.env` from the project-local sample file.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

## Install

```powershell
npm install
npm run prisma:generate
npm run typecheck
```

## Run

```powershell
npm run dev
```

## Health and metrics

```powershell
Invoke-RestMethod http://localhost:3010/health/live
Invoke-RestMethod http://localhost:3010/health/ready
Invoke-WebRequest http://localhost:3010/metrics
```

## Boundary

`/health/live` does not depend on PostgreSQL or Redis. `/health/ready` checks both dependencies and returns only safe status values. `/metrics` exposes Prometheus text and does not expose request bodies, cookies, authorization headers, CSRF tokens, session tokens, diagnostic reports, database URLs, or Redis URLs.
````
</div>

### 14.4 运行与测试

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
Set-Location D:\node.js\mini-projects\observable-notes-api
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run typecheck
$env:NODE_ENV = "test"; npm test
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
cd mini-projects/observable-notes-api
cp .env.example .env
npm install
npm run prisma:generate
npm run typecheck
NODE_ENV=test npm test
```
</div>

### 14.5 执行与生命周期

请求进入 Express 后先经过 requestId middleware，AsyncLocalStorage 保存 requestId 和 start time。业务 route 进入 service，service 用 `withServiceSpan()` 或 `withDependencySpan()` 包裹关键操作。response finish 时 request logger 读取 route pattern、statusCode、duration 和 trace fields，写 Pino JSON log 并调用 prom-client 记录 counter/histogram。错误路径先进入 errorLogger 写 redacted server log，再由 errorMiddleware 返回 stable safe response。shutdown signal 到来时关闭 HTTP server、event loop metrics、Redis、Prisma 和 OpenTelemetry SDK。

### 14.6 常见错误

不要把 `userId`、`email`、`requestId`、`sessionId`、`noteId`、`traceId`、`rawUrl`、`errorMessage` 放进 metric label。不要把 diagnostic report 暴露为 public HTTP route。不要让 `/health/live` 查询数据库或 Redis。不要在 client error response 返回 stack。不要在 app import 之后才初始化 OpenTelemetry SDK。

## 15. 知识迁移与真实项目场景

本章机制可以迁移到 Express、Fastify 或 NestJS 后端，但 route pattern 获取、error filter、dependency lifecycle 和 instrumentation hook 需要分别验证。Docker、Kubernetes、Prometheus server、Grafana dashboard、OpenTelemetry Collector、cloud logging vendors、alert routing 和 frontend RUM 是后续生产边界。

## 16. 本章复盘任务

- 解释一次 slow request 如何同时出现在 request log、duration histogram 和 trace span 中。
- 说明为什么 requestId 适合日志字段但不适合 metric label。
- 证明 `/health/live` 不依赖 PostgreSQL 或 Redis。
- 设计测试确认 password、cookie、authorization、CSRF token、session token、database URL 和 Redis URL 不出现在日志中。
- 解释 `unhandledRejection` 与 `uncaughtException` 为什么是诊断/退出策略边界。

## 17. 最终心智模型

生产可观测性从触发边界开始：HTTP request、dependency check、background operation 或 process event。然后选择合适 signal：log 记录事件，metric 记录可聚合数值，trace 记录路径，health check 记录接流量能力，diagnostic report 记录私有进程状态。最后控制输出边界：redaction、sanitization、safe response、low-cardinality labels、private report file 和测试断言。

## 18. 官方资料

本章写作先按以下官方资料确认机制，再生成本地 practice、mini project 与文档：

- [Node.js process](https://nodejs.org/api/process.html)
- [Node.js AsyncLocalStorage](https://nodejs.org/api/async_context.html)
- [Node.js diagnostics_channel](https://nodejs.org/api/diagnostics_channel.html)
- [Node.js perf_hooks](https://nodejs.org/api/perf_hooks.html)
- [Node.js diagnostic report](https://nodejs.org/api/report.html)
- [Node.js CLI](https://nodejs.org/api/cli.html)
- [Node.js test runner](https://nodejs.org/api/test.html)
- [Node.js assert](https://nodejs.org/api/assert.html)
- [Node.js events](https://nodejs.org/api/events.html)
- [Node.js timers](https://nodejs.org/api/timers.html)
- [Express 5 API](https://expressjs.com/en/5x/api/)
- [Express middleware](https://expressjs.com/en/guide/using-middleware/)
- [Express error handling](https://expressjs.com/en/guide/error-handling/)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/)
- [OpenTelemetry instrumentation](https://opentelemetry.io/docs/languages/js/instrumentation/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)
- [OpenTelemetry context](https://opentelemetry.io/docs/languages/js/context/)
- [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/http/)
- [Pino](https://getpino.io/)
- [Pino redaction](https://github.com/pinojs/pino/blob/main/docs/redaction.md)
- [prom-client](https://github.com/prometheus/client_js)
- [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/)
- [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Prisma logging](https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging)
- [Prisma tracing](https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/opentelemetry-tracing)
- [Prisma connection management](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management)
- [Prisma error reference](https://www.prisma.io/docs/orm/reference/error-reference)
- [Redis node-redis guide](https://redis.io/docs/latest/develop/clients/nodejs/)
- [Zod](https://zod.dev/)
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/)
- [npm run-script](https://docs.npmjs.com/cli/v11/commands/npm-run-script/)
- [TypeScript TSConfig](https://www.typescriptlang.org/tsconfig/)
- [TypeScript modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)

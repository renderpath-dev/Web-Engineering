# Node.js 第 16 章：生产级可观测性、SLO、告警、OpenTelemetry、Kubernetes 基础与容器运行边界

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
  - [9.1 Observability 不是 console.log](#section-9-1)
  - [9.2 Logs、metrics、traces、alerts、SLO 的信号边界](#section-9-2)
  - [9.3 Structured logging：Pino、requestId、traceId、redaction](#section-9-3)
  - [9.4 Metrics model：Counter、Gauge、Histogram、label cardinality](#section-9-4)
  - [9.5 RED / USE method：API、worker、dependency 的可观测指标](#section-9-5)
  - [9.6 Trace model：trace、span、context propagation、parent-child relation](#section-9-6)
  - [9.7 OpenTelemetry JavaScript：API、SDK、resource、instrumentation、exporter](#section-9-7)
  - [9.8 Manual instrumentation vs auto instrumentation](#section-9-8)
  - [9.9 Context propagation：HTTP、async boundary、background work continuity](#section-9-9)
  - [9.10 SLI、SLO、error budget 与 release decision](#section-9-10)
  - [9.11 Alerting rule design：symptom、threshold、duration、severity、runbook](#section-9-11)
  - [9.12 Prometheus alert rules 与 Alertmanager boundary](#section-9-12)
  - [9.13 Node process/container signals：SIGTERM、event loop delay、memory、CPU](#section-9-13)
  - [9.14 Kubernetes mental model：container、Pod、Deployment、ReplicaSet、Service](#section-9-14)
  - [9.15 Kubernetes probes：liveness、readiness、startup](#section-9-15)
  - [9.16 Kubernetes resources：requests、limits、Node CPU/memory behavior](#section-9-16)
  - [9.17 ConfigMap、Secret、environment 与 runtime config boundary](#section-9-17)
  - [9.18 Deployment rollout、terminationGracePeriodSeconds 与 graceful shutdown](#section-9-18)
  - [9.19 Docker Compose vs Kubernetes：local simulation 与 orchestrator boundary](#section-9-19)
  - [9.20 SLO release gate、operational runbook 与 incident evidence](#section-9-20)
  - [9.21 Telemetry safety：secret redaction、PII、high-cardinality labels](#section-9-21)
  - [9.22 Chapter integration: platform-observability-kubernetes-lab](#section-9-22)
- [10. API 与规则索引](#10-api-与规则索引)
- [11. 常见错误对照表](#11-常见错误对照表)
- [12. 调试与验证方法](#12-调试与验证方法)
- [13. 分项练习说明](#13-分项练习说明)
- [14. 最终迷你项目](#14-最终迷你项目)
  - [14.1 项目目标与边界](#141-项目目标与边界)
  - [14.2 项目结构责任分组](#142-项目结构责任分组)
  - [14.3 完整项目代码](#143-完整项目代码)
- [15. 知识迁移与真实项目场景](#15-知识迁移与真实项目场景)
- [16. 本章复盘任务](#16-本章复盘任务)
- [17. 最终心智模型](#17-最终心智模型)
- [18. 官方资料](#18-官方资料)

## 本章代码定位索引

| 学习目标 | 文件或片段 | 可观察证据 |
| --- | --- | --- |
| 区分 observability signals | `practices/16-platform-observability-kubernetes/01-observability-signals/telemetry-signal-classifier.ts` | `signal kind decision` |
| 验证 structured logging redaction | `src/observability/log-redaction.ts` | `logging.unit.test.ts` |
| 约束 Prometheus metric labels | `src/observability/metrics.ts` | `metrics.unit.test.ts` |
| 验证 trace context and manual span | `src/observability/otel.ts` | `trace:check` |
| 计算 SLI/SLO/error budget | `src/slo/slo.service.ts` | `slo:check` |
| 验证 alert rules and runbook boundary | `prometheus/alert-rules.yml` | `alert:check` |
| 修正 startup/liveness/readiness model | `src/health/health.service.ts` | `api.integration.test.ts and health.unit.test.ts` |
| 映射 Kubernetes probes/resources | `k8s/deployment.yaml` | `k8s:check` |
| 验证 Docker Compose and NGINX runtime | `compose.yaml` | `docker:check and docker compose config` |

## 0. 章前定位

Chapter 15 已经完成 API、worker、queue、cache、PostgreSQL、Redis、Docker Compose、NGINX、基础 health 和 metrics 的运行边界。本章只接住这个 handoff：不重新讲 service boundary、BullMQ、job payload、idempotency 或 cache consistency，而是把可运行系统修炼成能被观察、能被告警、能被 SLO 约束、能被 Kubernetes probe 和 resource model 描述的服务。

## 1. 学习目标

- 区分 logs、metrics、traces、alerts、SLO 的信号职责。
- 写出带 requestId、correlationId、traceId、spanId 和 redaction 的 structured logs。
- 用 Counter、Gauge、Histogram 建立低基数 Prometheus metrics。
- 用 OpenTelemetry JavaScript 建立 API、SDK、resource、instrumentation、exporter 的边界。
- 用 SLI、SLO、error budget 和 release decision 描述用户可见可靠性。
- 用 Prometheus alert rules 和 runbook 避免 alert fatigue。
- 用 Kubernetes probes、requests、limits 和 terminationGracePeriodSeconds 描述容器运行边界。

## 2. 前置知识

需要理解 Express request/response lifecycle、TypeScript NodeNext、runtime validation、PostgreSQL/Redis readiness、Docker Compose、NGINX 入口、event loop delay、timeout/retry/idempotency、OpenAPI public contract，以及 Chapter 15 的 API/worker/queue/cache handoff。

## 3. 环境与运行基线

本章 mini project 使用 Node.js v26.3.0、npm 11.16.0、TypeScript 7.0.2、Express 5.2.1、Pino 10.3.1、prom-client 15.1.3、Redis client 6.1.0、Docker Compose、PostgreSQL 18、NGINX host port 8080。`start` 必须运行 emitted JavaScript。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">package.json</span>
  </div>

```json
{
  "name": "platform-observability-kubernetes-lab",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "engines": {
    "node": ">=26"
  },
  "scripts": {
    "dev": "tsx watch src/api/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/api/server.js",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "node --import tsx --test --test-concurrency=1 tests/*.test.ts",
    "smoke": "tsx scripts/smoke-test.ts",
    "metrics:check": "tsx scripts/metrics-check.ts",
    "trace:check": "tsx scripts/trace-check.ts",
    "slo:check": "tsx scripts/slo-check.ts",
    "alert:check": "tsx scripts/alert-check.ts",
    "k8s:check": "tsx scripts/k8s-check.ts",
    "docker:check": "tsx scripts/docker-check.ts"
  },
  "dependencies": {
    "@opentelemetry/api": "1.9.1",
    "@opentelemetry/resources": "2.10.0",
    "@opentelemetry/sdk-node": "0.221.0",
    "@opentelemetry/sdk-trace-node": "2.10.0",
    "@opentelemetry/semantic-conventions": "1.43.0",
    "cors": "2.8.6",
    "dotenv": "17.4.2",
    "express": "5.2.1",
    "express-rate-limit": "8.6.1",
    "helmet": "8.3.0",
    "pg": "8.22.0",
    "pino": "10.3.1",
    "prom-client": "15.1.3",
    "redis": "6.1.0",
    "yaml": "2.9.0",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@types/cors": "2.8.19",
    "@types/express": "5.0.6",
    "@types/node": "26.1.2",
    "@types/pg": "8.20.0",
    "@types/supertest": "7.2.1",
    "supertest": "7.2.2",
    "tsx": "4.23.1",
    "typescript": "7.0.2"
  }
}
```
</div>

## 4. 第一性原理

生产服务的核心问题不是“程序有没有输出”，而是“用户是否拿到了可靠结果，如果没有，证据是否能解释原因，并且是否需要人行动”。Observability 把外部可见 telemetry 组织成证据；SLO 把证据变成目标；error budget 把目标变成发布决策；Kubernetes probes 和 resources 把进程状态变成平台行为。

## 5. 技术边界模型

| 边界 | 本章实现 | 不实现 |
| --- | --- | --- |
| Observability | logs、metrics、manual traces、SLO report、local alert rules | SaaS vendor、Grafana dashboard、full tracing backend |
| Runtime | Express API、PostgreSQL/Redis readiness、SIGTERM shutdown、event loop delay | auto-remediation、multi-region、real paging |
| Platform | Docker Compose、NGINX、Prometheus scrape、static Kubernetes manifests | real cloud deploy、Helm、Terraform、service mesh、Ingress controller |
| Safety | redaction、low-cardinality labels、fake Secret placeholders | real secrets、PII exposure、cluster deployment claim |

## 6. 底层机制模型

一次 HTTP request 进入 NGINX 后被 proxy 到 Express。Express middleware 创建 request context、解析 body、记录 HTTP duration，在 handler 中更新 SLO samples 或创建 manual span。Prometheus scrape `/v1/metrics` 读取 registry 文本；Kubernetes probe 只通过 HTTP status 决定 traffic 或 restart；SIGTERM 由 process listener 接住，然后 `server.close()` 停止接收新连接，dependency clients 和 telemetry SDK 在 grace window 内关闭。

## 7. 核心术语

| 术语 | 精确定义 | 错误用法 |
| --- | --- | --- |
| requestId | 单个入口请求的定位字段 | 作为 metric label |
| correlationId | 跨服务或跨步骤关联字段 | 替代 trace context |
| traceId/spanId | trace 与 span 的传播标识 | 放进 Prometheus label |
| SLI/SLO | 测量值与目标 | 用内部愿望替代用户可见可靠性 |
| error budget | SLO 允许失败的空间 | 只做报表，不影响 release |
| liveness/readiness/startup | restart、traffic、startup protection 三种 probe | 用 liveness 检查数据库 |

## 8. 本章实践路线

实践顺序是 signals -> logging -> metrics -> tracing -> SLO/alerting -> Node container runtime -> Kubernetes basics -> runtime validation -> lab checks。每个练习先建一个小模型，再在 mini project 中看到同一机制的集成版本。

| 阶段 | 练习目录 | 目标 |
| --- | --- | --- |
| observability signals | `practices/16-platform-observability-kubernetes/01-observability-signals/` | 建立 observability signals 的最小可解释模型 |
| structured logging | `practices/16-platform-observability-kubernetes/02-logging/` | 建立 structured logging 的最小可解释模型 |
| metrics | `practices/16-platform-observability-kubernetes/03-metrics/` | 建立 metrics 的最小可解释模型 |
| tracing | `practices/16-platform-observability-kubernetes/04-tracing/` | 建立 tracing 的最小可解释模型 |
| SLO and alerting | `practices/16-platform-observability-kubernetes/05-slo-alerting/` | 建立 SLO and alerting 的最小可解释模型 |
| Node container runtime | `practices/16-platform-observability-kubernetes/06-node-container-runtime/` | 建立 Node container runtime 的最小可解释模型 |
| Kubernetes basics | `practices/16-platform-observability-kubernetes/07-kubernetes-basics/` | 建立 Kubernetes basics 的最小可解释模型 |
| runtime validation | `practices/16-platform-observability-kubernetes/08-runtime-validation/` | 建立 runtime validation 的最小可解释模型 |
| lab checks | `practices/16-platform-observability-kubernetes/09-lab-checks/` | 建立 lab checks 的最小可解释模型 |

## 9. 核心教学

这一部分按 `9.1` 到 `9.22` 把本章的可观测性、运行时信号、容器边界和 Kubernetes 部署模型拆开讲。每节都先给出结论，再把真实项目中的 owner file、信号和失败模式连接起来。

<a id="section-9-1"></a>

### 9.1 Observability 不是 console.log

**结论**

`console.log` 只能把一个时间点的文本写到标准输出；observability 要把请求、依赖、进程、容器和发布状态变成可查询、可聚合、可关联、可告警、可决策的信号。对这个 mini project 来说，`logger.ts` 负责日志事件，`metrics.ts` 与 `http-metrics.ts` 负责 Prometheus 样本，`tracing.ts` 负责 trace/span，`slo.service.ts` 把样本转成 release decision。

**本节解决的问题**

本节解决的是“为什么线上服务不能靠多打几行日志判断健康”。当用户请求 `/v1/simulate/*` 变慢时，单行文本只能告诉你某个 handler 曾经执行；指标告诉你慢请求占比，trace 告诉你时间落在哪个 span，SLO 报告告诉你这是否已经影响发布门禁。

**技术意义**

生产故障通常跨越 HTTP handler、dependency check、event loop、container lifecycle 和 platform routing。observability 的意义是让这些边界在不同工具里共享稳定标识和可计算语义，而不是把所有信息堆进无法聚合的字符串。

**概念解释**

日志回答“某次发生了什么”，metrics 回答“某类事情的数量、当前值或分布”，traces 回答“一个请求或任务沿途经过哪些 span”，alerts 回答“是否应该让人介入”，SLO 回答“这个服务承诺的可靠性目标是否还被满足”。`console.log` 属于事件输出，不等于这五类信号的组合。

**边界**

语法层只决定调用 `logger.info(...)`、`response.json(...)` 或 `metric.inc(...)` 的形式；JavaScript runtime 负责执行 handler、对象属性访问和回调；Node 平台负责 HTTP socket、process signal、stdout/stderr 和 `perf_hooks`；Prometheus、OpenTelemetry、Docker Compose 和 Kubernetes 才处理采集、导出、容器健康与流量调度。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/api/app.ts`; signal: HTTP route plus telemetry middleware; failure mode: a service can print successful text while `/v1/metrics`, `/v1/slo/report`, or readiness evidence shows degraded behavior. 请求进入 Express 后先经过 context 和 metrics middleware，再进入 health、metrics、simulation、SLO、platform routers，任何一个环节缺失都会让后续排障只能看到局部事件。

**API / 配置 / 命令规则**

`app.use(requestContextMiddleware)` 必须早于业务路由，否则后续日志没有 request context；`app.use(httpMetricsMiddleware)` 必须覆盖业务路由，否则 duration 和 status class 不会被记录；`/v1/metrics` 和 `/v1/slo/report` 是机器可读接口，不能用人工阅读日志替代。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/api/app.ts</span>
  </div>

```ts
app.use(requestContextMiddleware);
app.use(httpMetricsMiddleware);

app.use("/v1/health", createHealthRouter(healthService));
app.use("/v1", createMetricsRouter());
app.use("/v1/simulate", createSimulationRouter(sloStore));
app.use("/v1/slo", createSloRouter(sloStore));
app.use("/v1/platform", createPlatformRouter());
```
</div>

**逐行解释**

第一行给 request 增加 `requestId`、`correlationId` 和 trace context；第二行在 response `finish` 时记录请求总数和耗时分布；health router 暴露 probes 所需状态；metrics router 暴露 Prometheus exposition；simulation router 产生可观察的学习信号；SLO router 把样本转成可靠性报告；platform router 暴露 runbook 和 manifest 检查入口。

**运行方式**

学习时先启动 API，再访问业务接口、`/v1/metrics`、`/v1/slo/report` 和 health endpoints。这里的重点不是运行某个命令本身，而是比较同一个请求在日志、指标、trace 和 SLO 里的不同证据形态。

**预期输出**

你应该能看到 HTTP response、Prometheus 文本样本、SLO JSON 报告以及结构化日志事件。它们描述的是同一个系统的不同侧面，而不是四份互相替代的输出。

**执行过程**

HTTP request 到达 Node 的 server socket 后进入 Express middleware chain；middleware 把 context 挂到 request 上并注册 response finish listener；业务路由产生结果；response 结束时 metrics 被记录；SLO store 从样本计算比例；logger 把事件写到 stdout，容器平台再收集这些输出。

**why the result/error happens**

只写 `console.log("slow")` 时，存储系统只能看到一段文本，无法知道 route pattern、status class、duration bucket、traceId 或 release gate。observability 可用，是因为每类信号都保留了后续查询所需的字段和生命周期位置。

**contrast**

`console.log` 适合本地临时观察某个分支是否执行；structured log 适合追一笔请求；Counter/Histogram 适合看趋势和分布；trace 适合定位链路耗时；alert 和 SLO 适合决定是否升级、回滚或暂停发布。

**common mistake and violated rule**

常见错误是把 `request.url`、用户 ID 或完整请求体直接打印并认为已经可观测。违反的规则是：生产信号必须可聚合、可关联、受限且不泄露敏感信息；随机长字符串和隐私数据既难查询，也会扩大存储与安全风险。

**real-project relationship**

真实后端服务会同时接入日志平台、metrics backend、trace backend、alert manager 和发布门禁。这个 mini project 用本地 API、Prometheus 文件和静态 Kubernetes manifest 缩小规模，但保留了这些系统之间的职责边界。

**current learning-path relationship**

前面章节已经学过 HTTP、middleware、TypeScript runtime validation、worker/background concept 和错误处理。本节把这些能力放到“上线后如何证明服务状态”的问题里，为后面的 metrics、trace、probe、rollout 做铺垫。

**final memory model**

记住一句话：`console.log` 是事件文本；observability 是日志、指标、trace、alert 和 SLO 共同形成的运行证据系统。

<a id="section-9-2"></a>

### 9.2 Logs、metrics、traces、alerts、SLO 的信号边界

**结论**

五类信号要回答五个不同问题：logs 问“what happened”，metrics 问“how often / how much / how slow”，traces 问“where time went”，alerts 问“should humans act”，SLO 问“what reliability target was promised”。把问题分清楚，才能选对字段、采集点和判断规则。

**本节解决的问题**

本节解决的是信号误用：用日志算错误率会很慢，用 metrics 查单个 request 会丢上下文，用 trace 做总体趋势会成本过高，用 alert 代替 SLO 会让发布决策没有预算边界。

**技术意义**

信号边界决定数据模型。日志可以接受 `requestId`、`traceId`、错误类和少量业务字段；metrics 只能保留低基数字段；trace span 可以记录 parent-child 关系；alert rule 需要阈值、持续时间和 runbook；SLO 需要目标、窗口和预算计算。

**概念解释**

`classifySignal` 这个练习函数把提问方式映射成信号类型：想让人行动就是 alert，想确认目标就是 SLO，想看路径就是 trace，想看趋势就是 metric，其余单次事实才是 log。这个映射比“所有内容都记录下来”更接近真实工程。

**边界**

TypeScript 可以限制 `SignalKind` 的字符串联合类型，但不能判断现实中的问题是否真的应该报警；Prometheus 可以评估时间序列表达式，但不保存完整请求上下文；OpenTelemetry 可以传播 trace context，但不会替你定义 SLO 目标。

**底层机制**

Owner file: `practices/16-platform-observability-kubernetes/01-observability-signals/telemetry-signal-classifier.ts`; signal: signal selection input flags; failure mode: choosing log for a trend question hides rate and latency behavior from aggregation. 这个练习把布尔输入压缩成一个信号类别，展示的是“问题先于工具”的边界。

**API / 配置 / 命令规则**

`asksForAction` 应优先映射 alert，因为人工介入是最高成本动作；`asksForTarget` 映射 SLO，因为目标先于数据解释；`asksForPath` 映射 trace，因为路径需要 span graph；`asksForTrend` 映射 metric，因为趋势需要聚合样本。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/16-platform-observability-kubernetes/01-observability-signals/telemetry-signal-classifier.ts</span>
  </div>

```ts
export type SignalKind = "log" | "metric" | "trace" | "alert" | "slo";

export function classifySignal(input: { asksForAction: boolean; asksForTarget: boolean; asksForPath: boolean; asksForTrend: boolean }): SignalKind {
  if (input.asksForAction) return "alert";
  if (input.asksForTarget) return "slo";
  if (input.asksForPath) return "trace";
  if (input.asksForTrend) return "metric";
  return "log";
}
```
</div>

**逐行解释**

第一行把允许的信号类别固定为联合类型；函数参数描述提问者真正想知道什么；action 优先级最高，因为它会打扰人；target 次之，因为目标定义评价标准；path 需要 trace；trend 需要 metric；最后的 log 是单次事实的默认归宿。

**运行方式**

运行对应练习文件或在测试中传入不同布尔组合，观察返回的 `SignalKind`。不要把这个函数理解成生产库，它是用极小代码训练信号选择。

**预期输出**

当 `asksForTrend` 为 true 且其他字段为 false 时返回 `metric`；当 `asksForAction` 为 true 时返回 `alert`；当所有字段为 false 时返回 `log`。

**执行过程**

JavaScript 按顺序执行 `if` 分支，命中第一个条件就返回。没有异步调度，也没有 Node 平台资源；这里的机制重点是决策优先级，而不是 I/O。

**why the result/error happens**

如果一个问题同时要求行动和趋势，函数返回 alert，因为报警会引用 metrics 结果，但报警本身回答的是“是否要人处理”。这种优先级避免把报警规则降级成普通图表。

**contrast**

“刚才哪笔请求失败了”适合 log；“过去 5 分钟失败率是多少”适合 metric；“这笔请求耗时落在哪个步骤”适合 trace；“失败率超过窗口是否要通知值班”适合 alert；“这个月还能不能继续发布”适合 SLO 和 error budget。

**common mistake and violated rule**

常见错误是把 alert 当作更响亮的 log。违反的规则是：alert 必须绑定可行动症状、持续时间和 runbook；单次异常事件没有达到这个门槛时不应该直接打扰人。

**real-project relationship**

真实项目里，日志平台、Prometheus、trace backend 和 Alertmanager 通常由不同系统承担。信号边界清晰时，团队可以减少跨系统字段膨胀，也能更快说明某个现象应该由哪个系统回答。

**current learning-path relationship**

本节把前面 HTTP 和错误处理章节里的“单次请求事实”，推进到平台章节里的“窗口、趋势、路径和可靠性目标”。后续 9.3 到 9.12 会分别展开这些信号。

**final memory model**

先问问题，再选信号：事件用 log，趋势用 metric，路径用 trace，行动用 alert，承诺用 SLO。

<a id="section-9-3"></a>

### 9.3 Structured logging：Pino、requestId、traceId、redaction

**结论**

Structured logging 的价值不是换一个日志库，而是让每条日志成为稳定字段组成的事件对象。这个项目用 Pino 输出 JSON，用 request context 给事件绑定 `requestId`、`correlationId`、`traceId` 和 `spanId`，并在进入存储前删除 `authorization`、`cookie`、`token`、`email`、`requestBody` 等敏感字段。

**本节解决的问题**

本节解决的是“日志能不能被可靠查询和安全保存”。如果日志只是一段拼接字符串，排障时很难按 `requestId` 过滤；如果敏感字段在写出前没有 redaction，日志平台、备份和转储都会扩散秘密。

**技术意义**

Pino 的 `redact.paths` 是写出前的保护层，`redactLogFields` 是项目内部对象进入 logger 前的防线，`requestContextMiddleware` 是把 HTTP request 和 trace context 连接起来的入口。三者组合后，日志既能关联请求，又不会把常见秘密当成普通字段保存。

**概念解释**

`requestId` 是服务内定位一笔请求的 ID；`correlationId` 可以跨入口系统延续；`traceId` 和 `spanId` 来自 OpenTelemetry active span，用来把日志和 trace backend 对齐。redaction 不是显示层遮盖，而是写入日志事件前就替换字段值。

**边界**

TypeScript 可以说明 `RequestContext` 的字段形状，却不能保证 header 里的 ID 值可信，也不能保证调用方不会传入 `requestBody`。Node 的 `crypto.randomUUID()` 负责生成默认 request ID；Express middleware 负责挂载 context；Pino 负责 JSON 序列化和 redact；日志存储系统只接收已经处理过的输出。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/logger.ts` and `mini-projects/platform-observability-kubernetes-lab/src/observability/request-context.ts`; signal: structured log event with request correlation fields; failure mode: missing redaction can store credentials, while missing request context makes one request impossible to follow across logs and traces. 请求进入 middleware 时生成或读取 ID，active span 存在时同步 trace 字段，logger 写出时再按固定路径和字段模式替换敏感值。

**API / 配置 / 命令规则**

`pino({ redact: { paths, censor } })` 使用固定路径匹配对象字段；`trace.getActiveSpan()` 从 OpenTelemetry context 取当前 span；`response.setHeader("traceparent", ...)` 使用 W3C trace context 字符串形状；`declare module "express-serve-static-core"` 只扩展 TypeScript 类型，不会在运行时自动创建 `request.context`。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/logger.ts</span>
  </div>

```ts
const sensitiveFieldPattern = /(authorization|cookie|token|secret|password|database_url|redis_url|email|request_body)/i;

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "authorization",
      "cookie",
      "token",
      "secret",
      "password",
      "databaseUrl",
      "redisUrl",
      "email",
      "requestBody"
    ],
    censor: "[Redacted]"
  }
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/request-context.ts</span>
  </div>

```ts
export function requestContextMiddleware(request: Request, response: Response, next: NextFunction): void {
  const requestId = headerValue(request.headers["x-request-id"]) ?? randomUUID();
  const correlationId = headerValue(request.headers["x-correlation-id"]) ?? requestId;
  const activeSpan = trace.getActiveSpan();
  const activeSpanContext = activeSpan?.spanContext();

  request.context = {
    requestId,
    correlationId,
    traceId: activeSpanContext?.traceId,
    spanId: activeSpanContext?.spanId
  };

  response.setHeader("x-request-id", requestId);
  response.setHeader("x-correlation-id", correlationId);
  if (activeSpanContext?.traceId) {
    response.setHeader("traceparent", "00-" + activeSpanContext.traceId + "-" + activeSpanContext.spanId + "-01");
  }
  next();
}
```
</div>

**逐行解释**

`sensitiveFieldPattern` 覆盖常见秘密和 PII 字段名；`level` 从环境读取但默认 `info`；`redact.paths` 处理 Pino 知道的嵌套路径和顶层字段；`censor` 把值替换成固定文本；middleware 从 header 读取传入 ID，没有时生成 UUID；active span 存在时取 `traceId` 和 `spanId`；response header 回传这些 ID，调用方可以把下一跳请求继续关联。

**运行方式**

启动 API 后发送带 `x-request-id` 的请求，再观察 stdout 中的 JSON 日志和 response header。学习目标是确认字段存在、字段名稳定、敏感值被替换，而不是只确认有文本输出。

**预期输出**

日志事件应包含稳定的 request correlation 字段；如果对象里包含 `token`、`password`、`email` 或 `requestBody`，输出值应变成 `[Redacted]`；response 应返回 `x-request-id` 和 `x-correlation-id`。

**执行过程**

HTTP header 是外部输入，Express 把它放在 `request.headers`；middleware 读取字符串或数组的第一个值；JavaScript 对象 `request.context` 在同一 request 生命周期内被后续 handler 引用；Pino 序列化对象时应用 redact 规则；容器 runtime 收集 stdout。

**why the result/error happens**

如果没有 `requestContextMiddleware`，TypeScript 扩展声明仍然存在，但运行时 `request.context` 不会被赋值，后续访问会得到 `undefined` 或错误。类型声明只改变编译期可见形状，不创建运行时属性。

**contrast**

字符串日志 `user login failed: alice@example.com token=...` 对人短期可读，但泄露隐私且难以按字段聚合；结构化日志 `{ requestId, traceId, errorClass }` 能被索引；redacted 事件保留诊断上下文，同时去掉不该进入日志系统的值。

**common mistake and violated rule**

常见错误是在 logger 外层再写一个只 re-export 的 `log-redaction.ts`，却不解释 Pino 配置和 request context。违反的规则是：教学必须指向产生行为的 owner file；wrapper 只改变导入路径，不拥有 redaction 或 correlation 机制。

**real-project relationship**

真实项目通常把 logs 送到 Loki、Elasticsearch、Cloud Logging 或其他平台。无论后端是哪一个，字段稳定、低敏感面、可关联 ID 都是日志能跨团队使用的前提。

**current learning-path relationship**

前面章节学过 Express middleware 和错误处理；这里把 middleware 用作观测边界，让每个后续错误、业务响应和 trace 都能回到同一个 request identity。

**final memory model**

结构化日志 = 稳定字段 + request correlation + 写出前 redaction；三者缺一个，日志就会在排障或安全上失效。

<a id="section-9-4"></a>

### 9.4 Metrics model：Counter、Gauge、Histogram、label cardinality

**结论**

Metrics 是时间序列，不是事件明细。Counter 记录只增的总量，Gauge 记录可上可下的当前状态，Histogram 把观测值放进 bucket 以便计算分位数；label 只能使用低基数字段，否则 Prometheus 会为每个不同值创建新的时间序列。

**本节解决的问题**

本节解决的是“为什么 traceId 可以进入日志，却不该进入 metric label”。traceId 在日志里是单次事件的检索键；放进 metric label 会把每个请求变成一条新时间序列，使存储、查询和 alert 评估成本失控。

**技术意义**

HTTP request count、duration histogram、dependency readiness、event loop delay 和 SLO ratio 都适合 metrics，因为它们要按窗口聚合。用户邮箱、URL query、request body、traceId、spanId 不适合 label，因为它们不是稳定的小集合。

**概念解释**

Prometheus exposition 暴露的是多行文本，每个 metric name 加 label set 形成一组 time series。Histogram 会生成 `_bucket`、`_sum`、`_count` 系列，`le` 是 bucket 上界；Counter 适合 `rate(...)`；Gauge 适合当前 readiness、remaining budget 或 event loop delay snapshot。

**边界**

`prom-client` 在 Node 进程内维护 registry 和 instruments；Prometheus server 按 `scrape_configs` 拉取 `/v1/metrics`；TypeScript 能限制函数入参是 `Record<string, string>`，但 label 名和值仍必须由运行时代码检查。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/metrics.ts`; signal: Prometheus metric sample with bounded labels; failure mode: adding `trace_id` or `request_id` as labels creates high-cardinality time series and can make scrape storage or alert queries unusable. `assertSafeMetricLabels` 在 `inc` 和 `observe` 前拦截 label 名和值，是这个项目的 metric safety gate。

**API / 配置 / 命令规则**

`new client.Counter(...)` 用于累计事件；`new client.Gauge(...)` 用于当前状态；`new client.Histogram(...)` 用于分布；`labelNames` 是允许的 label schema；`registry.metrics()` 生成 Prometheus 文本；`le` 是 histogram bucket 自动使用的固定 label。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/metrics.ts</span>
  </div>

```ts
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"],
  registers: [registry]
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry]
});
```
</div>

**逐行解释**

`http_requests_total` 的 `_total` 后缀表达累计语义；`method`、`route`、`status_class` 是低基数字段；duration histogram 使用同一组 label 记录耗时分布；bucket 数值决定分辨率，太粗会看不出 SLO 临界点，太细会增加样本量。

**运行方式**

请求业务接口后读取 `/v1/metrics`，查看 `http_requests_total`、`http_request_duration_seconds_bucket`、`dependency_readiness`、`event_loop_delay_seconds` 和 SLO 相关 gauge。

**预期输出**

Prometheus 文本中应出现 metric name、label set 和数值。Histogram 会出现多个 `le` bucket，同一个 route 的请求会累计到不同 bucket 上，而不会为每个 request 创建新 metric name。

**执行过程**

HTTP middleware 在 response finish 时计算耗时；`assertSafeMetricLabels` 检查 label；Counter 增加请求数；Histogram 记录 duration；registry 在 scrape 时把当前 instrument 状态序列化为 exposition 文本。

**why the result/error happens**

`traceId` 每个请求都不同，作为 label 会让 `metric name + labels` 的组合不断增长。Prometheus 的存储模型按时间序列保存这些组合，所以错误 label 会从代码级字段选择变成平台级资源问题。

**contrast**

日志里的 `traceId` 帮你找到一次请求；metric label 里的 `route="/v1/simulate/:kind"` 帮你聚合同类请求。一个用于定位个体，一个用于计算群体，边界不能互换。

**common mistake and violated rule**

常见错误是把 `request.path`、完整 URL、用户邮箱或 `trace_id` 加到 `labelNames`。违反的规则是：metric label 必须来自有限集合，且每个 label 都要服务于聚合查询。

**real-project relationship**

真实项目的 Prometheus、Mimir、VictoriaMetrics 或云监控系统都会受到 cardinality 影响。高基数 label 会让账单、查询速度和报警稳定性同时变差。

**current learning-path relationship**

你已经学过 HTTP middleware 和响应生命周期；本节把 response finish 这个时机变成 metrics 采样点，为后面的 RED、USE、SLO 和 alert rules 提供数据基础。

**final memory model**

Counter 记总数，Gauge 记当前状态，Histogram 记分布；label 是时间序列维度，不是日志字段仓库。

<a id="section-9-5"></a>

### 9.5 RED / USE method：API、worker、dependency 的可观测指标

**结论**

RED 面向 request-serving path：Rate、Errors、Duration；USE 面向资源：Utilization、Saturation、Errors。这个项目的 API path 用 HTTP Counter 和 Histogram 看 RED，依赖 readiness 和 event loop delay 体现 USE 思路；worker 指标属于 Chapter 15 的延续概念，因为 background work 也需要 rate、failure 和 queue/latency 证据。

**本节解决的问题**

本节解决的是“该给 API、dependency、event loop 和 worker-like work 分别看什么指标”。同一个慢请求既可能是 route handler 慢，也可能是 PostgreSQL/Redis 不 ready，也可能是 CPU 阻塞 event loop；RED 和 USE 帮你分开观察对象。

**技术意义**

RED 直接服务用户体验和 SLO；USE 解释底层资源压力。API 的 5xx 率升高但 event loop 正常，优先查 dependency 或业务错误；event loop p99 升高但 dependency ready，优先查同步 CPU 或过高 CPU quota pressure。

**概念解释**

Rate 是单位时间请求数，Errors 是失败请求比例或计数，Duration 是响应耗时分布。Utilization 是资源使用程度，Saturation 是排队或延迟迹象，Errors 是资源层失败。Node 的 event loop delay 是 saturation 信号，不是普通业务错误。

**边界**

Express middleware 可以测 HTTP request；`node:perf_hooks` 可以测 event loop delay；dependency probe 可以测 PostgreSQL/Redis readiness；worker_threads 或 job queue 指标需要 Chapter 15 那类后台任务 owner file，不应该硬塞进 HTTP middleware。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/http-metrics.ts`; signal: RED metrics from response finish; failure mode: measuring only request count hides latency burn, while measuring only liveness hides dependency readiness degradation. middleware 把 method、route pattern、status class 和 duration 绑定到 response lifecycle 上，因此比 handler 内部手写计数更接近真实结果。

**API / 配置 / 命令规则**

`response.on("finish", ...)` 是 HTTP response 完成点；`process.hrtime.bigint()` 适合测短时间间隔；`httpRequestsTotal.inc(labels)` 记录 rate 的基础样本；`httpRequestDurationSeconds.observe(labels, durationSeconds)` 记录 duration 分布；dependency readiness 使用 Gauge。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/http-metrics.ts</span>
  </div>

```ts
export function httpMetricsMiddleware(request: Request, response: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    const labels = {
      method: request.method,
      route: routePattern(request),
      status_class: statusClass(response.statusCode)
    };
    assertSafeMetricLabels(labels);
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });
  next();
}
```
</div>

**逐行解释**

进入 middleware 时记录高精度起点；`finish` 只在响应真正写完时触发；duration 用纳秒差转秒；label 来自 method、route pattern 和 status class；安全检查阻止高基数字段；Counter 记录请求次数；Histogram 记录耗时；`next()` 让请求继续进入后续 handler。

**运行方式**

访问不同 API route，然后读取 `/v1/metrics` 或 Prometheus 查询。观察 `http_requests_total` 的 rate、`http_request_duration_seconds_bucket` 的分位数、`dependency_readiness` 的 0/1 变化和 `event_loop_delay_seconds` 的 p99。

**预期输出**

成功和失败请求都应进入 `http_requests_total`，只是 `status_class` 不同；慢请求应改变 histogram bucket，而不是只在日志里出现一行 slow 文本。

**执行过程**

请求先进入 middleware，起点时间被保存在闭包里；业务 handler 完成 response；Node 触发 `finish` 事件；闭包读取结束时间；metrics registry 更新内存里的 instrument；Prometheus scrape 时再拉取这些累计值。

**why the result/error happens**

如果在 handler 开头就记录 duration，得到的是处理开始时间而不是响应完成时间。RED 的 duration 应覆盖 middleware、handler、序列化和响应结束前的主要路径，否则 latency SLO 会被低估。

**contrast**

RED 看 `/v1/simulate` 这类用户请求；USE 看 event loop、CPU、memory、dependency readiness。worker 场景则要看 job rate、queue depth、worker error 和 processing duration，这与 Chapter 15 的 worker 机制相连。

**common mistake and violated rule**

常见错误是把 dependency failure 放进 liveness 或只看 HTTP 200 比例。违反的规则是：用户路径和资源状态要分开建模；dependency 不 ready 应影响 readiness 和 SLO，不一定代表进程必须重启。

**real-project relationship**

线上 dashboard 通常一屏放 RED，一屏放 USE。前者回答用户是否受影响，后者回答为什么受影响；把两者混在一个总分里会让排障路径变慢。

**current learning-path relationship**

这一节把 Chapter 15 的后台任务思路和本章 API 运行路径连接起来：无论 request 还是 worker，都需要 rate、error、duration 和资源压力，只是 owner file 和采样点不同。

**final memory model**

RED 看服务路径，USE 看资源压力；先知道你在观察对象，才知道该用哪个指标。

<a id="section-9-6"></a>

### 9.6 Trace model：trace、span、context propagation、parent-child relation

**结论**

Trace 是一次请求或任务的整棵调用树，span 是树上的一个节点，parent span 和 child span 表达调用关系，active context 决定新 span 挂到谁下面。manual trace work 的意义是把业务步骤显式放进这棵树，而不是只依赖框架自动生成的入口 span。

**本节解决的问题**

本节解决的是“为什么只看 duration metric 还不知道慢在哪里”。Histogram 可以告诉你 p95 超过 500ms，却不能告诉你时间花在 validation、dependency call、CPU loop 还是 background step；trace span tree 才能表达路径。

**技术意义**

Trace model 把同一次操作中的多个异步边界连在一起。对于 Node.js，Promise、callback、middleware 和 background work 都可能跨执行上下文；active context 正确时，child span 才能自动继承 parent trace。

**概念解释**

traceId 标识整条链路，spanId 标识一个节点，parent-child relation 标识调用层级，span attribute 存放低基数上下文，span event 存放节点内部发生的关键事件。active context 是当前执行流中 OpenTelemetry 用来查找 parent span 的上下文。

**边界**

OpenTelemetry API 提供 `trace.getTracer` 和 `startActiveSpan` 这样的接口；SDK 提供具体 context manager、processor 和 exporter；业务代码决定哪些操作需要手动 span；TypeScript 只检查 `TraceWorkInput` 的字段，不能证明真实任务已经被完整覆盖。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/tracing.ts`; signal: manual span tree with traceparent output; failure mode: starting child spans without active context can produce disconnected spans that cannot explain where request time went. `startActiveSpan` 建立 parent，循环里的 `startSpan(..., context.active())` 把 step span 接到当前上下文下。

**API / 配置 / 命令规则**

`trace.getTracer(name)` 返回 tracer；`tracer.startActiveSpan(name, callback)` 创建并激活 span；`span.setAttribute` 记录可检索属性；`span.addEvent` 记录节点内事件；`span.end()` 结束生命周期；`span.spanContext()` 读取 traceId 和 spanId。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/tracing.ts</span>
  </div>

```ts
export function runManualTraceWork(input: TraceWorkInput): TraceWorkResult {
  const tracer = trace.getTracer("platform-observability-kubernetes-lab");
  return tracer.startActiveSpan("simulate.trace_work", (span) => {
    span.setAttribute("operation.name", input.operationName);
    span.setAttribute("signal.kind", "trace");
    span.addEvent("trace_work.started");
    for (let step = 0; step < input.steps; step += 1) {
      const childSpan = tracer.startSpan("simulate.trace_work.step", undefined, context.active());
      childSpan.setAttribute("operation.name", "trace_work_step");
      childSpan.setAttribute("step.index", step);
      childSpan.end();
    }
    span.setStatus({ code: SpanStatusCode.OK });
    const spanContext = span.spanContext();
    const traceparent = "00-" + spanContext.traceId + "-" + spanContext.spanId + "-01";
    span.end();
    traceWorkTotal.inc({ operation_name: input.operationName, result: "ok" });
    return { operationName: input.operationName, traceId: spanContext.traceId, spanId: spanContext.spanId, traceparent, steps: input.steps };
  });
}
```
</div>

**逐行解释**

第一行取服务专属 tracer；`startActiveSpan` 创建 root business span 并在 callback 内激活它；attributes 让 span 可以按 operation 查询；event 标记工作开始；循环创建 step child spans；`context.active()` 决定 parent；`setStatus` 标记成功；`spanContext` 取出传播所需 ID；`span.end()` 结束 root span；Counter 记录 manual trace work 的数量。

**运行方式**

访问触发 manual trace work 的 endpoint 或运行 trace 检查脚本时，观察返回的 `traceparent` 字符串和 ConsoleSpanExporter 输出。学习重点是 parent span 先存在，child span 才有树形归属。

**预期输出**

返回结果应包含 32 位十六进制 traceId、16 位 spanId、符合 `00-traceId-spanId-flags` 形状的 traceparent，以及与输入一致的 steps。

**执行过程**

JavaScript 同步进入 callback；OpenTelemetry 在 callback 执行期间把 span 放入 active context；每个 step span 从 active context 读取 parent；span 结束后 exporter 处理 finished span；函数返回给 HTTP handler。

**why the result/error happens**

如果 child span 没有传入 active context 或创建在 parent span callback 外，trace backend 可能看到多个孤立 span。孤立 span 仍有时间戳，却无法回答“这一段属于哪次业务操作”。

**contrast**

Metric histogram 是扁平统计，适合发现“慢了”；trace span tree 是结构化路径，适合定位“慢在哪里”。两者互补，不能互相替代。

**common mistake and violated rule**

常见错误是只创建一个 root span，然后把所有信息塞进 attribute。违反的规则是：耗时路径应该用 span 层级表达，attribute 只描述节点，不应该代替调用结构。

**real-project relationship**

真实服务会把 HTTP ingress、database query、cache call、queue publish 和 background job 放进同一 trace。manual span 用来补足自动 instrumentation 不理解的业务阶段。

**current learning-path relationship**

你已经在 Chapter 15 接触过后台任务和异步边界；trace context 把这些分散执行点重新串成一条可读路径。

**final memory model**

Trace 是树，span 是节点，active context 决定新节点接到哪里，manual instrumentation 决定业务步骤是否出现在树上。

<a id="section-9-7"></a>

### 9.7 OpenTelemetry JavaScript：API、SDK、resource、instrumentation、exporter

**结论**

OpenTelemetry JavaScript 要区分 API 和 SDK：API 是业务代码调用的稳定接口，SDK 是运行时安装的具体实现；resource 描述服务身份，instrumentation 产生或补充 span，exporter 把 finished span 送到目标后端。这个项目的实际 setup 在 `tracing.ts`，不是只 re-export 的 `otel.ts`。

**本节解决的问题**

本节解决的是“为什么导入 `@opentelemetry/api` 不等于已经有 telemetry backend”。API 没有 SDK 时可以是 no-op；SDK 启动后才有 resource、processor/exporter 和上下文管理，span 才能被处理和输出。

**技术意义**

清楚 API/SDK/resource/exporter 边界后，你能判断一个 trace 丢失是业务没有建 span、SDK 没启动、resource service name 错、exporter 没连上、还是 context propagation 断了。

**概念解释**

API 层如 `trace.getTracer` 被业务代码使用；SDK 层如 `new NodeSDK(...)` 绑定 Node 运行时；resource attributes 如 `service.name` 让后端知道 span 属于哪个服务；exporter 如 `ConsoleSpanExporter` 决定 span 输出到哪里。

**边界**

`src/observability/otel.ts` 如果只是重新导出，不拥有 NodeSDK 生命周期；`src/observability/tracing.ts` 才启动 SDK、设置 resource、选择 exporter、关闭 SDK。TypeScript 可以确认 `SERVICE_NAME` 存在于 config 类型，但实际环境变量仍由 `loadConfig` 解析。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/tracing.ts`; signal: OpenTelemetry SDK startup and exported spans; failure mode: using only the API wrapper leaves spans unexported or service identity missing. `startTelemetrySdk` 用 guard 防止重复启动，`shutdownTelemetrySdk` 在进程关闭时 flush/cleanup exporter。

**API / 配置 / 命令规则**

`new NodeSDK({ resource, traceExporter })` 组装 SDK；`resourceFromAttributes({ "service.name": ... })` 设置服务身份；`ConsoleSpanExporter` 把 span 输出到 console；`telemetrySdk.start()` 必须在业务 trace work 前运行；`telemetrySdk.shutdown()` 应在 graceful shutdown 中等待完成。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/tracing.ts</span>
  </div>

```ts
let sdkStarted = false;
let telemetrySdk: NodeSDK | undefined;

export function startTelemetrySdk(config: Pick<AppConfig, "SERVICE_NAME">): void {
  if (sdkStarted) {
    return;
  }
  telemetrySdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": config.SERVICE_NAME,
      "service.version": "1.0.0"
    }),
    traceExporter: new ConsoleSpanExporter()
  });
  telemetrySdk.start();
  sdkStarted = true;
}

export async function shutdownTelemetrySdk(): Promise<void> {
  if (!telemetrySdk) {
    return;
  }
  await telemetrySdk.shutdown();
}
```
</div>

**逐行解释**

`sdkStarted` 是进程内 guard，防止测试或重复 import 多次启动 SDK；`telemetrySdk` 保存 SDK 实例用于关闭；函数参数只要求 `SERVICE_NAME`，避免把全部 config 泄露到 observability 模块；`resourceFromAttributes` 写入服务身份；`ConsoleSpanExporter` 是本地学习输出；`start()` 安装 SDK；`shutdown()` 等待 exporter 完成清理。

**运行方式**

服务启动时 `server.ts` 调用 `startTelemetrySdk(config)`，关闭时调用 `shutdownTelemetrySdk()`。学习时检查 span 是否带有 `service.name`，并确认关闭路径等待 telemetry shutdown。

**预期输出**

manual trace work 结束后，应有可导出的 span；span resource 中应包含 `platform-observability-kubernetes-lab` 作为 service name；重复调用启动函数不应创建多个 SDK 实例。

**执行过程**

Node 加载模块后保留模块级变量；server startup 解析 config；SDK 根据 resource 和 exporter 初始化；业务代码通过 API 创建 span；finished span 交给 SDK/exporter；SIGTERM 路径等待 shutdown。

**why the result/error happens**

如果只 import API 而没有启动 SDK，业务代码仍能调用 `trace.getTracer`，但 span 可能不会被真实导出。API 提供调用面，SDK 提供运行时行为，这是 OpenTelemetry JavaScript 最容易混淆的分层。

**contrast**

`otel.ts` 这类 wrapper 可以改善导入路径，但它不拥有 exporter、resource 或 lifecycle。`tracing.ts` 里的 NodeSDK setup 才是实际机制代码。

**common mistake and violated rule**

常见错误是把 `@opentelemetry/api` 当成完整配置。违反的规则是：API package 不等于 SDK runtime；没有 SDK startup 和 exporter，trace 信号无法离开进程。

**real-project relationship**

真实项目会把 ConsoleSpanExporter 换成 OTLP exporter，并配置 collector endpoint、sampling 和 resource attributes。即使后端变化，API/SDK/resource/exporter 的分层仍然是定位问题的主线。

**current learning-path relationship**

前面学习过模块作用域和进程生命周期；这里的 `sdkStarted`、`telemetrySdk` 和 shutdown path 正好把模块缓存、进程信号和异步清理连接起来。

**final memory model**

OpenTelemetry API 是调用面，SDK 是运行时，resource 是服务身份，exporter 是出口；wrapper 不是 setup。

<a id="section-9-8"></a>

### 9.8 Manual instrumentation vs auto instrumentation

**结论**

Auto instrumentation 适合框架、HTTP client、database driver 这类库边界；manual instrumentation 适合业务语义，例如 `simulate.trace_work`、每个 step、operation name 和业务结果。库能看到调用发生，业务代码才知道这次调用代表什么。

**本节解决的问题**

本节解决的是“为什么有自动 trace 还要手写 span”。自动 span 可能告诉你 Express 收到了请求，但不会知道一次 simulation 有几个 step、哪个 operation 重要、成功条件是什么。

**技术意义**

manual span 让 trace tree 从技术路径变成业务路径。没有它，trace 只能解释框架和库耗时；有它，incident review 可以看到业务阶段、输入规模、结果状态和失败点。

**概念解释**

Auto instrumentation 通过 patch 或 hook 已知库来创建 span；manual instrumentation 由你在业务代码里调用 tracer。前者覆盖通用边界，后者表达领域语义，二者应该互补。

**边界**

自动 instrumentation 不应该被期待理解 `operationName` 或 `steps`；manual span 不应该重复记录每个底层 HTTP socket 细节。TypeScript 能检查 `steps` 是 number，却不能决定多少 step 应作为 span 或 event。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/tracing.ts`; signal: manually named business span and child step spans; failure mode: relying only on auto instrumentation hides operation-level latency and keeps trace value at the framework boundary. manual code 把业务名称和 step index 放入 span attributes，让 trace backend 能按业务阶段检索。

**API / 配置 / 命令规则**

`tracer.startActiveSpan("simulate.trace_work", callback)` 适合拥有完整生命周期的业务操作；`tracer.startSpan("simulate.trace_work.step", undefined, context.active())` 适合内部子步骤；span attribute 使用低基数字段；大量唯一值仍应留给日志或事件。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/tracing.ts</span>
  </div>

```ts
span.setAttribute("operation.name", input.operationName);
span.setAttribute("signal.kind", "trace");
span.addEvent("trace_work.started");
for (let step = 0; step < input.steps; step += 1) {
  const childSpan = tracer.startSpan("simulate.trace_work.step", undefined, context.active());
  childSpan.setAttribute("operation.name", "trace_work_step");
  childSpan.setAttribute("step.index", step);
  childSpan.end();
}
```
</div>

**逐行解释**

第一个 attribute 记录业务操作名称；第二个 attribute 标明这是 trace 学习信号；event 标记业务工作开始；循环为每个 step 创建 child span；`context.active()` 让 child span 继承当前 parent；`step.index` 是可解释的步骤序号；`childSpan.end()` 关闭子节点。

**运行方式**

触发 trace simulation 后检查 span 输出，确认 root span 名称和 child span 名称不同，并且 step 数量与输入一致。

**预期输出**

trace 应包含一个 `simulate.trace_work` parent span 和若干 `simulate.trace_work.step` child spans。operation name 应作为 attribute 出现，而不是只出现在日志文本里。

**执行过程**

业务函数进入 active span callback；每轮循环同步创建和结束 child span；root span 最后设置状态、生成 traceparent 并结束；Counter 记录这次 trace work 成功。

**why the result/error happens**

自动 instrumentation 只能围绕已知库调用建立 span，无法推断你的 for loop 表示业务步骤。manual instrumentation 把开发者的语义选择写进 trace，因此结果比纯自动 span 更能解释业务耗时。

**contrast**

HTTP auto span 可能叫 `GET /v1/simulate/trace`；manual span 可以叫 `simulate.trace_work` 并包含 `operation.name`。前者描述入口，后者描述业务动作。

**common mistake and violated rule**

常见错误是为每个用户 ID 或每个数据库 row 创建 span。违反的规则是：span 表达有诊断意义的操作边界，不是高基数事件流或数据明细表。

**real-project relationship**

真实 checkout、import、payment、render、export 等业务流程都需要 manual spans；库 instrumentation 只能补足数据库、HTTP client、queue client 等通用环节。

**current learning-path relationship**

这节延续你前面对函数边界、循环、异步任务和 worker 的理解：不是所有执行步骤都值得观测，值得观测的是能解释故障和耗时的业务边界。

**final memory model**

Auto span 发现库边界，manual span 表达业务边界；trace 好不好用，取决于这两类边界是否各司其职。

<a id="section-9-9"></a>

### 9.9 Context propagation：HTTP、async boundary、background work continuity

**结论**

Context propagation 的目标是让同一次请求跨 HTTP header、middleware、Promise/callback 和 background work 时仍保持同一个 trace identity。`traceparent` 是跨进程传播的字符串，active context 是进程内异步执行流里的当前上下文。

**本节解决的问题**

本节解决的是“为什么日志里有 requestId，但 trace 还是断开”。requestId 是项目级相关 ID；traceparent 是跨服务 trace 协议；active context 是 OpenTelemetry 在 Node 异步边界中找到 parent span 的机制。

**技术意义**

没有 propagation，前端请求、API handler、数据库调用、queue job 和 worker step 会在不同工具里变成孤立事件。传播正确时，日志可以按 requestId 查，trace 可以按 traceId 看树，metrics 仍保持低基数聚合。

**概念解释**

`traceparent` 形如 `00-traceId-spanId-flags`，放在 HTTP header 中传给下一跳。进程内 child span 不靠 header，而靠 active context 找 parent。background work 如果从 request 派生，需要显式保存或传递 trace context，否则任务执行时可能没有 parent。

**边界**

HTTP header 属于外部输入，必须按字符串形状处理；OpenTelemetry active context 属于进程内状态，依赖 SDK/context manager；Chapter 15 的 worker/background work 需要额外传播任务 payload 中的 correlation 或 trace metadata，不能假设自动延续。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/request-context.ts`; signal: `traceparent` response header plus request context fields; failure mode: dropping traceparent at HTTP or async boundaries creates orphan logs and disconnected spans. middleware 在请求入口读取 active span，再把 traceId/spanId 写入 request context 和 response header。

**API / 配置 / 命令规则**

`trace.getActiveSpan()` 只能读取当前 active context；`spanContext()` 返回 trace identifiers；`response.setHeader("traceparent", value)` 只写响应头，不会自动让下游请求继承；后台任务要把 context 信息放入任务 metadata 或通过 instrumentation 显式绑定。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/request-context.ts</span>
  </div>

```ts
const activeSpan = trace.getActiveSpan();
const activeSpanContext = activeSpan?.spanContext();

request.context = {
  requestId,
  correlationId,
  traceId: activeSpanContext?.traceId,
  spanId: activeSpanContext?.spanId
};

if (activeSpanContext?.traceId) {
  response.setHeader("traceparent", "00-" + activeSpanContext.traceId + "-" + activeSpanContext.spanId + "-01");
}
```
</div>

**逐行解释**

第一行尝试从 active context 读取当前 span；第二行取出标准 span context；`request.context` 保存业务代码后续可用的 ID；trace 字段用 optional chaining，因为没有 active span 时它们可以为空；最后按 W3C 形状写出 `traceparent`。

**运行方式**

触发带 trace 的请求后查看 response header、日志字段和 span 输出。若接入下游 HTTP client，下一跳请求应继续发送 `traceparent`，但本章 mini project 只演示本服务边界。

**预期输出**

有 active span 时 response 中应出现 `traceparent`；没有 SDK 或没有 active span 时 request context 仍应有 requestId 和 correlationId，但 traceId/spanId 可能为空。

**执行过程**

OpenTelemetry SDK 在异步执行流中维护 context；middleware 读取当前 span；Express request 对象携带 context 进入后续路由；response header 把 trace identity 暴露给调用方；background work 若另起任务，需要显式延续。

**why the result/error happens**

异步边界会让“当前执行点”发生变化。没有正确 context manager 或没有把 context metadata 带入 background task 时，新 span 找不到 parent，trace graph 就会断开。

**contrast**

`x-request-id` 是服务和日志友好的相关 ID；`traceparent` 是跨工具和跨服务的 trace protocol。前者便于 grep 和日志过滤，后者便于构建 span tree。

**common mistake and violated rule**

常见错误是把 `traceparent` 当作 metric label。违反的规则是：propagation ID 是单次链路标识，应进入日志和 header，不应进入高聚合指标维度。

**real-project relationship**

真实系统里，API 把 trace context 传给 payment、email、queue 和 worker。断点常出现在手动创建 Promise、setTimeout、message queue payload 或非标准 HTTP client 上。

**current learning-path relationship**

这一节把 Chapter 15 的 background work continuity 接到本章 trace：异步任务不是自动“记得”请求来源，必须有 context 传播策略。

**final memory model**

跨进程靠 `traceparent`，进程内靠 active context，跨后台任务靠显式 metadata；传播断了，trace 就断了。

<a id="section-9-10"></a>

### 9.10 SLI、SLO、error budget 与 release decision

**结论**

SLI 是测量值，SLO 是目标，error budget 是目标允许的失败空间，release decision 是把剩余预算转成工程动作。这个项目用 availability ratio、latency compliance、allowed failure ratio、actual failure ratio、budget spent、budget remaining 和 `releaseDecision` 展示这个链路。

**本节解决的问题**

本节解决的是“为什么不能只看当前有没有错误”。一个服务允许极少量失败，关键是失败是否已经超过承诺的窗口和预算；发布是否继续，应该由剩余 error budget 与门槛比较，而不是由最近一条日志决定。

**技术意义**

SLO 把观测数据变成决策规则。availability SLO 让 HTTP success count 有意义，latency target 让 histogram 有用户体验边界，release gate budget 让部署策略有可解释的停止条件。

**概念解释**

availability ratio = successful / total；latency compliance ratio = requests under target / total；allowed failure ratio = 1 - availabilityTarget；actual failure ratio = 1 - availabilityRatio；error budget spent = actual / allowed；remaining budget = 1 - spent；releaseDecision 根据 remaining 是否低于门槛决定 `continue` 或 `investigate`。

**边界**

SLO store 是本地学习窗口，不代表真实长期 SLO 平台；TypeScript 能检查返回对象字段，但不能证明样本窗口代表生产流量；Prometheus gauge 可以暴露当前 ratio，却不替代 SLO policy 的业务含义。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/slo/slo.service.ts`; signal: SLO report and SLO gauge metrics; failure mode: using raw error count without denominator can block safe releases or miss real budget burn. `calculateSloReport` 把 request samples 转成比例，再把比例写入 Prometheus gauge 和 JSON report。

**API / 配置 / 命令规则**

`ratio(numerator, denominator)` 在 denominator 为 0 时返回 1，避免空样本把服务判为失败；`Math.min(1, actualFailureRatio / allowedFailureRatio)` 限制 spent 上界；`releaseGateBudgetRemainingRatio` 是发布门槛；`sloComplianceRatio.set` 和 `sloBudgetRemainingRatio.set` 暴露机器可读指标。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/slo/slo.service.ts</span>
  </div>

```ts
const availabilityRatio = ratio(successful, total);
const latencyComplianceRatio = ratio(latencyGood, total);
const allowedFailureRatio = 1 - policy.availabilityTarget;
const actualFailureRatio = 1 - availabilityRatio;
const errorBudgetSpentRatio = allowedFailureRatio === 0 ? 1 : Math.min(1, actualFailureRatio / allowedFailureRatio);
const errorBudgetRemainingRatio = Math.max(0, 1 - errorBudgetSpentRatio);
const releaseDecision = errorBudgetRemainingRatio < policy.releaseGateBudgetRemainingRatio ? "investigate" : "continue";

sloComplianceRatio.set({ slo_name: policy.name }, availabilityRatio);
sloBudgetRemainingRatio.set({ slo_name: policy.name }, errorBudgetRemainingRatio);
```
</div>

**逐行解释**

前两行计算可用性和延迟达标比例；`allowedFailureRatio` 来自 SLO 目标；`actualFailureRatio` 来自当前样本；spent ratio 表示预算消耗程度；remaining ratio 不能低于 0；releaseDecision 把数字变成动作；最后两行把结果写成 Prometheus gauge。

**运行方式**

访问 `/v1/slo/report` 查看 JSON 报告，或查看 `/v1/metrics` 中的 `slo_compliance_ratio` 和 `slo_budget_remaining_ratio`。学习时比较样本变化如何影响 release decision。

**预期输出**

样本全部成功时 availability ratio 接近 1，remaining budget 高，decision 为 `continue`；失败比例超过目标允许空间时，remaining budget 下降，decision 变为 `investigate`。

**执行过程**

请求样本进入 store；report 调用计算函数；JavaScript 数组过滤成功样本和 latency-good 样本；比例被计算并写入 metrics registry；Express route 把 report 序列化为 JSON。

**why the result/error happens**

错误数量没有分母就无法判断严重程度。10 个错误可能是百万请求中的小波动，也可能是 20 个请求中的灾难；SLO 用比例和窗口把这个判断固定下来。

**contrast**

Alert rule 负责实时通知，SLO 负责承诺和预算，release gate 负责工程决策。三者相连，但不能把 alert fired 直接等同于发布必须停止。

**common mistake and violated rule**

常见错误是用 `errors > 0` 作为发布门禁。违反的规则是：SLO gate 应基于窗口、目标和预算，而不是单次异常。

**real-project relationship**

真实团队会把 SLO 放进 deploy pipeline、incident review 和 product reliability reporting。预算充足时允许小步发布，预算不足时先修可靠性。

**current learning-path relationship**

本节把 metrics 的聚合值推进到平台决策层，让你看到从 HTTP response 到 Prometheus sample 再到 release decision 的完整转化。

**final memory model**

SLI 是测量，SLO 是承诺，error budget 是可消耗空间，release decision 是预算低于门槛时的动作。

<a id="section-9-11"></a>

### 9.11 Alerting rule design：symptom、threshold、duration、severity、runbook

**结论**

好的 alert rule 必须绑定用户可感知 symptom、明确 threshold、持续时间窗口、severity 和 runbook。原始错误事件适合日志，不适合直接报警；否则短暂抖动和已知无影响错误会制造 alert fatigue。

**本节解决的问题**

本节解决的是“什么时候该叫人，什么时候只该记录”。如果 Redis 一次 ping 抖动就分页，会让人忽略报警；如果 p95 latency 持续超过 SLO 却没人知道，用户体验会继续恶化。

**技术意义**

Alert 是人力调度机制，不只是查询结果。它应该用聚合信号判断症状，并给出第一步检查路径。runbook 把报警从“有问题”变成“先查哪里、不要做什么”。

**概念解释**

Symptom 是外部可见现象，例如 5xx burn、p95 latency、dependency readiness、event loop delay；threshold 是触发边界；duration window 是稳定性过滤器；severity 表示处理优先级；runbook 给出 first checks 和 avoid list。

**边界**

Prometheus 负责评估表达式和 `for` 持续时间；Alertmanager 负责分组、路由、静默和通知；项目内的 `runbook.ts` 只提供学习用的处理建议，不替代真实值班系统。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/platform/runbook.ts`; signal: alert runbook entry linked from Prometheus annotations; failure mode: raw-error alerts without symptom window page people for non-actionable events. runbook 把 alert name 映射到 symptom、firstChecks 和 avoid，避免报警触发后仍不知道下一步。

**API / 配置 / 命令规则**

`alertName` 应与 Prometheus rule 的 `alert` 字段一致；`symptom` 描述用户或系统层现象；`firstChecks` 必须是可执行检查；`avoid` 写出常见错误动作；Prometheus annotations 中的 `runbook` 指向查询这个信息的入口。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/platform/runbook.ts</span>
  </div>

```ts
export const runbook: RunbookEntry[] = [
  {
    alertName: "HighLatencyP95",
    symptom: "The p95 request duration is above the demo latency SLO.",
    firstChecks: ["Check route pattern histogram buckets", "Check event loop delay", "Check upstream dependency latency"],
    avoid: ["Do not use raw URLs as labels", "Do not hide slow requests behind liveness"]
  }
];
```
</div>

**逐行解释**

`alertName` 是 Prometheus rule 和 runbook 的连接键；`symptom` 说明为什么这不是普通日志；`firstChecks` 给出指标、runtime 和 dependency 的检查顺序；`avoid` 明确不要把 URL 做 label，也不要用 liveness 掩盖慢请求。

**运行方式**

在学习环境里访问 platform runbook endpoint 或读取 `runbook.ts`，再对照 `prometheus/alert-rules.yml` 中的 annotations。重点是报警触发后能不能立刻定位第一组证据。

**预期输出**

每条 alert 都应能找到相同名称的 runbook entry；entry 应说明 symptom、first checks 和 avoid，而不是只有一句“check logs”。

**执行过程**

Prometheus 评估规则；表达式持续满足 `for` 窗口后产生 alert；annotation 给出 runbook 路径；值班者按 runbook 检查 SLO report、metrics、dependency readiness 或 event loop delay。

**why the result/error happens**

原始错误可能已经被重试、被用户无感知路径吸收，或只影响内部任务。没有 symptom、threshold 和 duration 的报警不能区分噪声与行动点。

**contrast**

日志保存单次异常；alert 汇总足够持续的症状；SLO 决定目标是否被破坏。用日志直接报警，是把事件处理误当成运营决策。

**common mistake and violated rule**

常见错误是给每个 exception type 建一个 page 级报警。违反的规则是：报警必须可行动，并且应该绑定用户影响或明确资源风险。

**real-project relationship**

成熟项目会把 alert rule、dashboard、runbook、owner 和 escalation policy 放在一起管理。没有 runbook 的报警会把认知负担留给半夜被叫醒的人。

**current learning-path relationship**

前面你学过错误处理中 `errorClass` 的作用；这里把错误类放进更大的 alert 设计里：错误类是证据，不是自动报警理由。

**final memory model**

Alert = symptom + threshold + duration + severity + runbook；没有行动路径的报警只是更吵的日志。

<a id="section-9-12"></a>

### 9.12 Prometheus alert rules 与 Alertmanager boundary

**结论**

Prometheus alert rules 由 scrape 数据、rule files、PromQL expression、`for` 持续时间、labels 和 annotations 组成；Alertmanager 的边界是接收 Prometheus 产生的 alert，再负责通知路由、分组、静默和抑制。本章配置只定义 Prometheus 规则，不声明真实 Alertmanager 部署。

**本节解决的问题**

本节解决的是“Prometheus 配置里的每个字段到底负责什么”。`scrape_configs` 决定采样来源，`rule_files` 决定规则入口，`expr` 决定触发条件，`for` 防止瞬时波动，labels 决定分类，annotations 提供人读上下文。

**技术意义**

Alert rule 是从 metrics 到运营动作的转换层。表达式写错会漏报或误报；持续时间太短会放大抖动；annotation 缺少 runbook 会让报警不可操作；把 Alertmanager 的职责混进 Prometheus 配置会误解系统边界。

**概念解释**

Prometheus 周期性 scrape `/v1/metrics`，按 evaluation interval 评估 alert rules。表达式为 true 且超过 `for` 窗口后，Prometheus 生成 alert instance；Alertmanager 是否存在、如何通知，是另一个系统的职责。

**边界**

`prometheus.yml` 只配置 Prometheus server；`alert-rules.yml` 只定义规则；Alertmanager route 不在本项目中实现；TypeScript 不参与 YAML 解析，manifest 或配置检查只能作为学习验证，不会让 Prometheus 自动接受错误 YAML。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/prometheus/alert-rules.yml`; signal: Prometheus alert expression over scraped time series; failure mode: missing `for` or wrong label grouping can create flapping alerts or hide route-level latency. `HighLatencyP95` 通过 histogram bucket 计算 p95，而不是从单条日志推断慢请求。

**API / 配置 / 命令规则**

`rule_files` 引入规则文件；`scrape_configs` 指向 API 的 `/v1/metrics`；`expr` 必须是 PromQL；`for` 是持续满足时间；`labels.severity` 用于分类；`annotations.runbook` 用于人读处理路径；Alertmanager 配置不应伪装成 Prometheus rule。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/prometheus/prometheus.yml</span>
  </div>

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/alert-rules.yml

scrape_configs:
  - job_name: platform-observability-kubernetes-lab-api
    metrics_path: /v1/metrics
    static_configs:
      - targets:
          - api:3040
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/prometheus/alert-rules.yml</span>
  </div>

```yaml
- alert: HighLatencyP95
  expr: histogram_quantile(0.95, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m]))) > 0.5
  for: 10m
  labels:
    severity: warning
    service_name: platform-observability-kubernetes-lab
  annotations:
    summary: HTTP p95 latency is above the demo SLO
    runbook: /v1/platform/runbook
```
</div>

**逐行解释**

`scrape_interval` 控制拉取频率；`evaluation_interval` 控制规则评估频率；`rule_files` 装载 alert rules；`metrics_path` 指向 API 暴露的 exposition；`targets` 使用 Compose service DNS；`expr` 用 histogram bucket 算 p95；`for: 10m` 要求持续超标；labels 和 annotations 分别服务机器分类和人读诊断。

**运行方式**

在本地 Compose 学习环境中，Prometheus 读取挂载的配置并 scrape API。这里不运行命令也能理解配置边界：Prometheus 只看到 `/v1/metrics`，看不到请求体、日志全文或 trace span tree。

**预期输出**

Prometheus 应生成以规则名命名的 alert instance；如果表达式没有持续满足 `for`，alert 不应进入 firing 状态；annotation 中应能找到 runbook 路径。

**执行过程**

API 在内存 registry 维护 metrics；Prometheus 按 target 拉取文本；rule engine 按 PromQL 计算时间窗口；满足条件后创建 alert；如果接了 Alertmanager，alert 再进入通知路由。

**why the result/error happens**

`histogram_quantile` 需要 bucket 时间序列和 `le` label。如果聚合时丢掉 `le`，Prometheus 无法还原分布；如果丢掉 `route`，就只能看到全局 p95，定位不到慢 route。

**contrast**

Prometheus rule 负责判断“条件是否成立”；Alertmanager 负责“通知谁、如何合并、何时静默”。把两者分清，才能知道配置错误应该在哪个文件查。

**common mistake and violated rule**

常见错误是把 runbook 当成 labels，或者把 notification route 写进 rule file。违反的规则是：labels 是机器分类维度，annotations 是人读说明，通知路由属于 Alertmanager。

**real-project relationship**

真实集群里 Prometheus 通常通过 ServiceMonitor 或 scrape config 发现 targets，Alertmanager 连接 Slack、PagerDuty 或邮件。这个项目用静态 YAML 保留规则结构，但不假装已经部署通知系统。

**current learning-path relationship**

你已经学过 metrics 的 label 和 histogram；这里把它们放进 PromQL 表达式，说明指标如何变成报警条件。

**final memory model**

Prometheus scrape 指标并评估规则；Alertmanager 处理通知。rule file 写条件，不写值班组织结构。

<a id="section-9-13"></a>

### 9.13 Node process/container signals：SIGTERM、event loop delay、memory、CPU

**结论**

容器里的 Node 进程必须把 SIGTERM、HTTP server close、dependency close、telemetry shutdown、event loop delay、CPU pressure 和 memory pressure 当成运行时信号来处理。容器停止不是“进程突然消失”，而是一段有时间限制的关闭协议。

**本节解决的问题**

本节解决的是“为什么本地 Ctrl+C 或容器停止时服务要优雅关闭”。如果 SIGTERM 后立刻 `process.exit(0)`，未完成请求、依赖连接和 telemetry export 都可能丢失；如果 event loop 被 CPU 阻塞，关闭回调和健康检查也会延迟。

**技术意义**

Node 是单主线程执行 JavaScript 的 runtime。CPU 同步阻塞会推迟 timers、I/O callbacks 和 signal handler 后续逻辑；memory pressure 会触发 GC 或 OOM；container grace period 给服务有限时间排空请求和清理资源。

**概念解释**

SIGTERM 是平台请求进程退出的信号；`server.close` 停止接受新连接并等待已有连接结束；dependency close 释放数据库和 Redis 资源；telemetry shutdown flush exporter；event loop delay 是 runtime 是否被阻塞的指标；CPU/memory pressure 是容器资源限制下的常见根因。

**边界**

Node 的 `process.on` 监听 OS signal；`http.Server` 管理 socket；Express app 自身不拥有 TCP server；Docker/Kubernetes 发送 stop signal 并执行 grace period；TypeScript 只限制 `signal` 参数是 `NodeJS.Signals`，不能保证关闭过程一定完成。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/api/server.ts`; signal: SIGTERM/SIGINT plus shutdown logs and telemetry shutdown; failure mode: exceeding `SHUTDOWN_GRACE_MS` exits with code 1 after logging grace period exceeded. shutdown 函数先停止 server，再关闭 app dependencies 和 telemetry，超时 timer 负责失败出口。

**API / 配置 / 命令规则**

`process.on("SIGTERM", handler)` 注册信号处理；`server.close(callback)` 不再接收新连接；`clearInterval(eventLoopTimer)` 停止采样 timer；`await application.close()` 关闭 dependencies；`await shutdownTelemetrySdk()` 等待 telemetry；`setTimeout(...).unref()` 设置 grace period 失败路径。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/api/server.ts</span>
  </div>

```ts
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "Shutdown started");
  server.close(async () => {
    clearInterval(eventLoopTimer);
    await application.close();
    await shutdownTelemetrySdk();
    logger.info({ signal }, "Shutdown completed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error({ signal }, "Shutdown grace period exceeded");
    process.exit(1);
  }, config.SHUTDOWN_GRACE_MS).unref();
}
```
</div>

**逐行解释**

函数记录收到的 signal；`server.close` 开始优雅停止 HTTP server；callback 内清理 event loop sampling timer；`application.close` 释放 dependency probes；`shutdownTelemetrySdk` flush/关闭 telemetry；完成后退出 0；另一个 timer 到期时记录失败并退出 1；`unref` 避免 timer 单独保持进程存活。

**运行方式**

学习时可阅读 server lifecycle，不需要在本次修复中重跑容器。真实验证通常通过发送 SIGTERM 或停止容器，观察日志是否出现 started/completed 或 grace exceeded。

**预期输出**

正常关闭应产生 `Shutdown started` 和 `Shutdown completed`；超出 `SHUTDOWN_GRACE_MS` 应产生 `Shutdown grace period exceeded` 并以失败码退出。

**执行过程**

OS 或 container runtime 发送 signal；Node 把 signal 交给注册 handler；handler 调用 shutdown；HTTP server 停止接收新连接；未完成资源完成或关闭；telemetry exporter shutdown；进程退出。

**why the result/error happens**

如果 event loop 被同步 CPU 代码占住，signal handler 内部的 timer、server close callback 和 async shutdown 都可能延后。CPU pressure 不只是“请求变慢”，也会影响关闭协议。

**contrast**

`process.exit(0)` 是立即终止倾向的动作；`server.close` 是先停止入口再清理资源。容器平台期望后者在 grace period 内完成，否则会进入强制终止。

**common mistake and violated rule**

常见错误是只监听 SIGTERM 但不关闭 dependencies 和 telemetry。违反的规则是：graceful shutdown 必须覆盖入口、内部资源和观测出口，而不是只写退出日志。

**real-project relationship**

Kubernetes rollout、Docker stop、node replacement 和 autoscaling 都会触发类似关闭路径。关闭不完整会导致请求中断、连接泄漏和 trace/log 丢失。

**current learning-path relationship**

你已经学过 process、timer、HTTP server 和 async cleanup；本节把这些机制放到 container lifecycle 下，解释为什么平台信号也是 Node 程序的一部分。

**final memory model**

SIGTERM 是退出请求，不是瞬间死亡；先停止入口，再排空资源，再关闭 telemetry，超时才失败退出。

<a id="section-9-14"></a>

### 9.14 Kubernetes mental model：container、Pod、Deployment、ReplicaSet、Service

**结论**

Kubernetes 的基本模型要分层记：container 运行镜像进程，Pod 是最小调度单元，Deployment 声明期望副本和滚动更新，ReplicaSet 维持实际 Pod 数量，Service 通过 selector 给匹配 Pod 提供稳定网络入口。Service 不运行容器。

**本节解决的问题**

本节解决的是“为什么有 Deployment 还要 Service，为什么 Service 坏了不等于容器没跑”。Deployment 管生命周期和副本；Service 管网络发现和负载均衡；selector 匹配错时，Pod 可以健康运行，但 Service 没有 endpoint。

**技术意义**

理解资源职责后，排障路径会更短。镜像启动失败查 Pod/container；副本数不对查 Deployment/ReplicaSet；流量打不到查 Service selector 和 Pod labels；配置不生效查 envFrom、ConfigMap 和 Secret。

**概念解释**

container 是镜像运行实例；Pod 包装一个或多个紧密协作的 container；Deployment 管 rollout strategy 和 replica count；ReplicaSet 是 Deployment 创建的副本控制器；Service 用 label selector 找 Pod，并把稳定 DNS/ClusterIP 指向它们。

**边界**

YAML 是期望状态声明；API server 存储对象；controller 负责调谐；kubelet 在节点上启动 container；Service 只提供网络抽象，不包含 image、command 或 process。TypeScript 项目文件不会改变 Kubernetes controller 行为。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/k8s/service.yaml`; signal: Service selector matching Pod template labels; failure mode: mismatched labels produce an empty Service endpoint even when Deployment replicas are running. 这个项目的 Service selector 必须与 Deployment template labels 一致，流量才能到达 API Pod。

**API / 配置 / 命令规则**

Deployment 的 `spec.selector.matchLabels` 必须匹配 Pod template labels；Service 的 `spec.selector` 必须匹配目标 Pod labels；`targetPort: http` 引用 container port name；`replicas: 2` 是期望副本，不是手写两个 Pod。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/k8s/service.yaml</span>
  </div>

```yaml
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: platform-observability-kubernetes-lab
    app.kubernetes.io/component: api
  ports:
    - name: http
      port: 80
      targetPort: http
```
</div>

**逐行解释**

`ClusterIP` 表示集群内部入口；selector 用两个 label 找目标 Pod；`name: http` 给 Service port 命名；`port: 80` 是 Service 暴露端口；`targetPort: http` 指向 Pod container 中名为 `http` 的端口。

**运行方式**

学习时对照 `deployment.yaml` 和 `service.yaml`，检查 selector 与 Pod template labels 是否一致。无需部署到真实集群也能理解对象边界。

**预期输出**

匹配正确时，Service 会选择 API Pods 作为 endpoints；匹配错误时，Service 仍存在，但没有后端 Pod，访问会失败或超时。

**执行过程**

Deployment controller 创建 ReplicaSet；ReplicaSet 创建带 labels 的 Pod；kubelet 运行 container；Service controller 根据 selector 维护 endpoint 列表；集群 DNS 和 kube-proxy 把流量导向 endpoints。

**why the result/error happens**

Service 不检查 image，也不启动进程。它只按 label 选择 Pod，所以 label 错误会造成“Pod running but Service unreachable”的典型现象。

**contrast**

Deployment 解决“要运行几个版本的 Pod”；Service 解决“客户端用什么稳定地址访问这些 Pod”。两者互相配合，但职责不同。

**common mistake and violated rule**

常见错误是把 Service 当作应用容器。违反的规则是：Kubernetes 资源按 controller 和网络职责分层，只有 Pod/container 承载进程。

**real-project relationship**

线上排障会经常看到 Deployment ready、Pod healthy，但 Service endpoint 为空。第一反应应是检查 labels 和 selector，而不是重启应用。

**current learning-path relationship**

本节把前面容器里的 Node process 放进 Kubernetes 对象模型，为 probes、resources、ConfigMap/Secret 和 rollout 做结构准备。

**final memory model**

Container 跑进程，Pod 被调度，Deployment 管期望，ReplicaSet 管副本，Service 按 selector 提供稳定入口。

<a id="section-9-15"></a>

### 9.15 Kubernetes probes：liveness、readiness、startup

**结论**

Liveness、readiness 和 startup 是三个不同问题：liveness 问进程是否该重启，readiness 问 Pod 是否能接流量，startup 问启动期是否还应被保护。这个项目用固定的 `startup()` 代码和 Kubernetes probe YAML 展示三者边界。

**本节解决的问题**

本节解决的是“为什么不能把所有 health check 都指向一个 endpoint”。依赖临时失败不一定要重启进程；启动期慢不该被 liveness 杀死；进程活着也不代表能接用户流量。

**技术意义**

Probe 配错会直接改变平台行为。liveness 误报会导致重启循环；readiness 误报会把坏 Pod 放进流量；startup 缺失会让慢启动服务在完成初始化前被杀。

**概念解释**

`/live` 应该只证明进程基本存活；`/ready` 应检查必要 dependency；`/startup` 应表达初始化窗口。Kubernetes 根据 probe 结果做不同动作：liveness 失败重启 container，readiness 失败移出 endpoints，startup 未成功前保护 liveness/readiness 的早期判断。

**边界**

Node health service 只返回状态；Kubernetes kubelet 执行 HTTP probe 并决定重启或流量状态；Service 根据 readiness 更新 endpoints；TypeScript 不能证明真实 Kubernetes 会按预期调度，只能保证本地函数形状。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/health/health.service.ts` and `mini-projects/platform-observability-kubernetes-lab/k8s/deployment.yaml`; signal: health endpoint response consumed by Kubernetes probes; failure mode: putting dependency checks in liveness can restart a healthy process during PostgreSQL or Redis outage. `startup()` 使用 `STARTUP_GRACE_MS` 区分 starting/started，YAML 的 startupProbe 给它足够窗口。

**API / 配置 / 命令规则**

`livenessProbe.httpGet.path` 指向 `/v1/health/live`；`readinessProbe.httpGet.path` 指向 `/v1/health/ready`；`startupProbe.httpGet.path` 指向 `/v1/health/startup`；`failureThreshold * periodSeconds` 决定容忍窗口；readiness 的失败影响 Service endpoints，不等于重启。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/health/health.service.ts</span>
  </div>

```ts
startup(): HealthSnapshot {
  const startupElapsed = Date.now() - startedAt;
  return {
    status: startupElapsed >= config.STARTUP_GRACE_MS ? "started" : "starting",
    uptimeSeconds: process.uptime()
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/k8s/deployment.yaml</span>
  </div>

```yaml
livenessProbe:
  httpGet:
    path: /v1/health/live
    port: http
readinessProbe:
  httpGet:
    path: /v1/health/ready
    port: http
startupProbe:
  httpGet:
    path: /v1/health/startup
    port: http
  periodSeconds: 5
  failureThreshold: 12
```
</div>

**逐行解释**

`startupElapsed` 计算当前进程启动以来的毫秒数；达到 `STARTUP_GRACE_MS` 后返回 `started`，否则返回 `starting`；YAML 中 liveness、readiness、startup 指向三个 endpoint；`port: http` 引用 container port name；startup 的 5 秒周期和 12 次失败阈值给启动期最多约 60 秒保护。

**运行方式**

学习时分别请求三个 health endpoint，或阅读 Kubernetes manifest 推导 kubelet 的动作。当前任务不需要运行集群或容器。

**预期输出**

启动早期 `/startup` 可能返回 `starting`；超过 grace 后返回 `started`；`/ready` 会根据 dependency checks 返回 ready 或 degraded；`/live` 只表达进程基本活着。

**执行过程**

kubelet 周期性请求 probe path；startup 成功前保护容器不被 liveness 过早重启；readiness 失败时 Pod 从 Service endpoints 移除；liveness 失败超过阈值时 kubelet 重启 container。

**why the result/error happens**

依赖失败是流量可用性问题，不一定是进程存活问题。把 dependency check 放进 liveness 会让平台用重启解决外部依赖故障，结果可能形成重启风暴。

**contrast**

Live = should restart；Ready = should receive traffic；Startup = should still be allowed to boot。三个 endpoint 名字相似，但平台动作完全不同。

**common mistake and violated rule**

常见错误是所有 probe 都指向 `/health`。违反的规则是：health endpoint 必须按平台动作拆分，不能让一个状态同时决定重启、流量和启动保护。

**real-project relationship**

线上 Node 服务常因 cold start、migration、cache warmup 或依赖短暂抖动而被错误 probe 放大故障。probe 设计是应用代码和平台控制器的契约。

**current learning-path relationship**

前面学过 HTTP route 和 dependency check；这里把它们接入 Kubernetes 的控制动作，说明 response status 会影响 Pod 生命周期。

**final memory model**

liveness 管重启，readiness 管流量，startup 管启动保护；不要用一个 endpoint 回答三个问题。

<a id="section-9-16"></a>

### 9.16 Kubernetes resources：requests、limits、Node CPU/memory behavior

**结论**

`requests` 是调度时声明需要的资源，`limits` 是运行时允许的上限。对 Node.js 来说，CPU limit 会影响 event loop 可获得的执行时间，memory limit 可能触发 GC 压力或 OOM；这些现象要和 `event_loop_delay_seconds`、错误率和 readiness 一起看。

**本节解决的问题**

本节解决的是“为什么 Pod 没有代码错误也会变慢或退出”。CPU 被限流时，JavaScript 主线程执行、timers 和 I/O callback 都会延迟；memory 接近 limit 时，GC 变频繁，超过限制时容器会被杀死。

**技术意义**

资源配置既影响调度，也影响 runtime 行为。requests 太低会让 Pod 被放到资源紧张节点；limits 太紧会让突发 CPU 或内存需求变成延迟、OOM 或重启。

**概念解释**

CPU `100m` 表示 0.1 CPU request，`500m` 表示半个 CPU limit；memory `128Mi` 是调度 request，`512Mi` 是运行上限。Node 的 V8 heap、native memory、Buffer、依赖库和 telemetry 都会消耗内存。

**边界**

Kubernetes scheduler 使用 requests 做放置决策；container runtime/cgroup 执行 limits；Node runtime 只感受到 CPU 时间变少或内存压力变大；TypeScript 类型和 Express route 不知道 cgroup 限额。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/k8s/deployment.yaml`; signal: resource request/limit plus event loop delay metric; failure mode: CPU throttling or memory OOM can make a healthy route fail readiness or miss shutdown grace. 资源 YAML 设置平台边界，`event-loop-delay.ts` 提供 Node 侧观察信号。

**API / 配置 / 命令规则**

`resources.requests.cpu` 和 `resources.requests.memory` 给 scheduler 使用；`resources.limits.cpu` 和 `resources.limits.memory` 给 runtime 使用；Node 侧用 `monitorEventLoopDelay` 观察主线程延迟；Prometheus 用 `event_loop_delay_seconds{statistic="p99"}` 报告高延迟。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/k8s/deployment.yaml</span>
  </div>

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/event-loop-delay.ts</span>
  </div>

```ts
const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

eventLoopDelaySeconds.set({ statistic: "p99" }, snapshot.p99);
```
</div>

**逐行解释**

YAML 的 requests 声明期望资源；limits 声明上限；`monitorEventLoopDelay` 在 Node runtime 内建立延迟直方图；`histogram.enable()` 开始采样；p99 被写入 Gauge，供 Prometheus 和 alert rule 观察。

**运行方式**

阅读 manifest 和 event loop metric 代码即可理解资源边界。真实验证要在集群或容器资源限制下观察 p99 delay、latency histogram、restart reason 和 OOM 事件，本次修复不执行这些 runtime 命令。

**预期输出**

资源 YAML 应显示 CPU/memory requests 和 limits；metrics 中应有 `event_loop_delay_seconds{statistic="p99"}`。当同步 CPU 压力上升时，event loop delay 也会升高。

**执行过程**

scheduler 根据 requests 选择节点；container runtime 按 limits 约束 CPU/memory；Node 主线程在可获得 CPU 时间内执行 JavaScript；perf_hooks 采样 event loop delay；metrics registry 暴露 snapshot。

**why the result/error happens**

CPU limit 不会让 JavaScript 变成多线程，它只是减少主线程可运行时间；memory limit 不会被 TypeScript 类型提前检查，超过容器限制时平台可能直接终止进程。

**contrast**

requests 影响“放在哪里”，limits 影响“运行时最多能用多少”。把两者都设成同一个小值可能让调度看起来可控，但运行时延迟和 OOM 风险会更高。

**common mistake and violated rule**

常见错误是只给 liveness 和 readiness，不给 resources。违反的规则是：平台需要资源契约才能调度和保护节点；应用也需要 runtime metrics 才能解释限流后的症状。

**real-project relationship**

真实 Node 服务经常在 traffic spike、JSON 大对象、Buffer、compression、PDF/export 任务或同步加密代码下触发 CPU/memory 问题。资源配置和 runtime 指标要一起看。

**current learning-path relationship**

这节把前面 event loop 和 performance 观察接到 Kubernetes resources，说明平台配置会改变 JavaScript runtime 的可见行为。

**final memory model**

requests 是调度承诺，limits 是运行上限；CPU 影响 event loop，memory 影响 GC/OOM，metrics 负责把影响暴露出来。

<a id="section-9-17"></a>

### 9.17 ConfigMap、Secret、environment 与 runtime config boundary

**结论**

ConfigMap 适合非敏感运行配置，Secret 适合敏感值引用，environment 是容器启动后 Node 进程读取配置的边界。这个项目的 Secret 文件是 placeholder example，真实 `DATABASE_URL` 和 `REDIS_URL` 不能提交到仓库。

**本节解决的问题**

本节解决的是“配置归谁所有、在哪里验证、什么不能提交”。Kubernetes 管注入，Node 进程管解析，Zod 管 runtime validation，Git 仓库不能保存真实秘密。

**技术意义**

配置边界清楚时，部署变更不需要改源码，服务启动时能快速失败，日志不会泄露连接串，学习项目也不会把本地密码当成示例数据传播。

**概念解释**

ConfigMap 的 `data` 是普通 key/value；Secret 的 `stringData` 在示例中只是占位；Deployment 的 `envFrom` 把这些值注入 container environment；Node 的 `process.env` 是字符串集合；`loadConfig` 把字符串解析成 typed runtime config。

**边界**

TypeScript 的 `AppConfig` 来自 Zod 推断，只在 `loadConfig` 成功后可信；Kubernetes Secret 不等于自动安全，权限、加密、轮换和外部 secret manager 是更大的平台问题；示例 Secret 只能包含假值。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/config/env.ts` and `mini-projects/platform-observability-kubernetes-lab/k8s/secret.example.yaml`; signal: environment parsing result; failure mode: committing real database URLs or skipping runtime parsing can leak secrets or start the service with invalid config. `EnvSchema.parse` 是 Node 进程启动时的配置验证边界。

**API / 配置 / 命令规则**

`z.coerce.number()` 把字符串端口转成 number；`z.enum(...)` 限制 `NODE_ENV`；`z.string().min(1)` 阻止空连接串；`envFrom.configMapRef` 和 `envFrom.secretRef` 注入环境变量；真实 secrets 应由部署环境创建，而不是写进代码库。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/config/env.ts</span>
  </div>

```ts
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3040),
  SERVICE_NAME: z.string().min(1).default("platform-observability-kubernetes-lab"),
  DATABASE_URL: z.string().min(1).default("postgresql://app:app@localhost:5432/platform_observability_kubernetes_lab"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  STARTUP_GRACE_MS: z.coerce.number().int().positive().default(1000),
  SHUTDOWN_GRACE_MS: z.coerce.number().int().positive().default(8000)
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/k8s/secret.example.yaml</span>
  </div>

```yaml
stringData:
  DATABASE_URL: postgresql://placeholder:placeholder@postgres:5432/platform_observability_kubernetes_lab
  REDIS_URL: redis://placeholder-redis:6379
```
</div>

**逐行解释**

`NODE_ENV` 限制运行模式集合；`PORT` 从环境字符串转成正整数；`SERVICE_NAME` 用于 resource 和日志身份；数据库和 Redis URL 要求非空；startup 和 shutdown grace 也从字符串转成正整数；Secret 示例使用 placeholder，表达字段名而不是泄露真实凭据。

**运行方式**

阅读 `configmap.yaml`、`secret.example.yaml` 和 `deployment.yaml` 的 `envFrom`，再对照 `loadConfig` 的解析规则。真实部署时由平台注入真实 secret，本章文件只保留示例占位。

**预期输出**

配置有效时 `loadConfig` 返回 `AppConfig`；环境变量缺失时使用默认值；必填字符串为空或数字无效时，Zod 会在启动阶段抛出解析错误。

**执行过程**

Kubernetes 创建 Pod 时把 ConfigMap/Secret key 注入环境；Node 进程启动后读取 `process.env`; `EnvSchema.parse` 转换和校验；成功后 config 传给 app、health、telemetry 和 dependency probes。

**why the result/error happens**

环境变量进入 Node 时都是字符串或 undefined。TypeScript 不能在编译期知道运行环境内容，所以必须用 runtime schema 把字符串解析成可用类型。

**contrast**

ConfigMap 保存 `PORT`、`SERVICE_NAME`、`CORS_ORIGIN` 这类非敏感值；Secret 保存连接串、密码、token 引用。示例 Secret 只保留字段结构，真实值由环境管理。

**common mistake and violated rule**

常见错误是把真实 `.env` 或 Secret YAML 提交。违反的规则是：秘密属于部署环境，不属于源代码仓库；文档只能展示占位和字段名。

**real-project relationship**

真实系统会接 Vault、External Secrets、cloud secret manager 或 CI/CD secret store。无论工具是什么，应用边界仍是读取 environment 并做 runtime validation。

**current learning-path relationship**

你已经学过 `.env` 和 TypeScript 类型；本节把它放到 Kubernetes 注入和安全边界下，强调外部输入永远要 runtime validation。

**final memory model**

ConfigMap 放普通配置，Secret 放敏感引用，environment 是进程入口，Zod 是 runtime config gate，真实秘密不进 Git。

<a id="section-9-18"></a>

### 9.18 Deployment rollout、terminationGracePeriodSeconds 与 graceful shutdown

**结论**

Rollout 是新旧 Pod 的受控替换过程；旧 Pod 被终止时，Kubernetes 会移除 readiness、发送 SIGTERM，并等待 `terminationGracePeriodSeconds`。Node 服务必须在这个窗口内停止接新请求、排空已有请求、关闭依赖和 telemetry。

**本节解决的问题**

本节解决的是“为什么发布时偶发 502、trace 丢失或连接错误”。如果旧 Pod 还在接流量就被杀，或者 Node 关闭超出 grace period，请求会中断；如果 readiness 没及时失败，Service 还可能继续把流量发给正在退出的 Pod。

**技术意义**

优雅关闭是 Deployment rollout 的应用侧协议。Kubernetes 负责调度和发送信号，Node 进程负责响应信号并清理资源；两边的时间预算必须匹配。

**概念解释**

Deployment 创建新 ReplicaSet 并逐步替换旧 Pods；readiness 决定 Pod 是否接流量；SIGTERM 是退出通知；`terminationGracePeriodSeconds` 是平台等待窗口；`SHUTDOWN_GRACE_MS` 是应用内部超时，两者应该协调。

**边界**

Kubernetes 不知道 Express 内部是否有未完成请求；Express 不知道 Service endpoints 何时更新；Node 的 `server.close` 只控制当前进程的 HTTP server；telemetry exporter shutdown 需要应用显式等待。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/k8s/deployment.yaml` and `mini-projects/platform-observability-kubernetes-lab/src/api/server.ts`; signal: Pod termination plus Node SIGTERM handler; failure mode: grace period mismatch can kill the process before server close and telemetry shutdown finish. `terminationGracePeriodSeconds: 30` 给平台窗口，`SHUTDOWN_GRACE_MS` 给应用内部失败出口。

**API / 配置 / 命令规则**

Kubernetes 使用 `terminationGracePeriodSeconds` 控制等待时间；Docker Compose 使用 `stop_grace_period` 做本地近似；Node 使用 `process.on("SIGTERM")` 响应；应用内部 `setTimeout` 不应超过平台 grace period，否则平台可能先强制杀死。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/k8s/deployment.yaml</span>
  </div>

```yaml
spec:
  terminationGracePeriodSeconds: 30
  containers:
    - name: api
      ports:
        - name: http
          containerPort: 3040
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/api/server.ts</span>
  </div>

```ts
process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
```
</div>

**逐行解释**

`terminationGracePeriodSeconds: 30` 声明 Pod 终止窗口；container port 让 Service 和 probes 引用 `http`；SIGTERM listener 把平台信号交给应用 shutdown；`void` 表示不等待 Promise 返回给 signal callback，但 shutdown 内部仍执行 async cleanup。

**运行方式**

真实验证通常通过 rollout restart 或删除 Pod 观察 readiness、SIGTERM 日志和退出码。本次修复仅更新指南，不运行 Kubernetes 或 Docker 命令。

**预期输出**

健康 rollout 应先让新 Pod ready，再逐步移除旧 Pod；旧 Pod 日志中应出现 shutdown started/completed；如果超时，应出现 grace period exceeded。

**执行过程**

Deployment controller 创建新 Pod；Service 根据 readiness 选择 endpoints；旧 Pod 进入 terminating；kubelet 发送 SIGTERM；Node handler 执行 graceful shutdown；窗口到期前成功退出则 rollout 平滑完成。

**why the result/error happens**

发布故障常发生在平台和应用时间线不一致时。Kubernetes 只能等待有限秒数，应用如果仍接受新请求或等待无限依赖，最终会被强制终止。

**contrast**

Rolling update 是逐步替换；restart storm 是反复失败重启；graceful shutdown 是应用对终止信号的响应。它们会同时出现，但不是同一层机制。

**common mistake and violated rule**

常见错误是只设置 Kubernetes grace period，不写 Node SIGTERM handler。违反的规则是：平台给时间，应用必须使用这段时间完成关闭。

**real-project relationship**

真实部署里的 502、连接重置、重复 job 和丢 trace，经常来自 rollout 与 graceful shutdown 没对齐。发布稳定性需要平台 YAML 和 Node 代码共同设计。

**current learning-path relationship**

这节把 process signal、HTTP server close、dependency cleanup 和 Kubernetes rollout 连接起来，是本章从单进程走向平台运行的关键桥梁。

**final memory model**

Rollout 替换 Pod；readiness 控流量；SIGTERM 通知退出；grace period 给时间；Node 必须在时间内关闭入口、资源和 telemetry。

<a id="section-9-19"></a>

### 9.19 Docker Compose vs Kubernetes：local simulation 与 orchestrator boundary

**结论**

Docker Compose 是本地多服务模拟工具，Kubernetes 是集群编排系统。Compose service、healthcheck 和 `depends_on: service_healthy` 可以模拟依赖启动顺序；Kubernetes 用 Pod、Service、probes、Deployment 和 controller 调谐期望状态。

**本节解决的问题**

本节解决的是“为什么 Compose 跑通不等于 Kubernetes 部署成立”。Compose 能验证 API、PostgreSQL、Redis、Prometheus、NGINX 的本地互联，但不验证 Kubernetes selector、ReplicaSet rollout、Service endpoint、node scheduling 或集群 Secret 管理。

**技术意义**

本地 simulation 能降低学习成本，但不能越界声明生产能力。理解 Compose 和 Kubernetes 的差异，可以避免把 `depends_on` 当成 readiness，把 Compose network DNS 当成 cluster Service，把本地 healthcheck 当成 kubelet probe。

**概念解释**

Compose service 是本地容器定义；Compose healthcheck 决定本地服务健康状态；`depends_on.condition: service_healthy` 控制启动依赖；Kubernetes Pod 是调度单元，Service 是网络入口，probe 是 kubelet 周期检查，Deployment 是 rollout controller。

**边界**

Compose YAML 由 Docker Compose CLI 解释；Kubernetes YAML 由 API server 和 controllers 解释；二者字段名和行为不能互相套用。TypeScript 和 Node app 只暴露 endpoints，不知道自己被 Compose 还是 Kubernetes 调度。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/compose.yaml`; signal: Compose healthcheck and service dependency status; failure mode: treating local `depends_on: service_healthy` as Kubernetes readiness can hide selector or probe mistakes. Compose 确认本机容器顺序，Kubernetes 确认集群对象和控制器状态。

**API / 配置 / 命令规则**

Compose 的 `services.api.depends_on.postgres.condition: service_healthy` 只影响本地启动顺序；`healthcheck.test` 是容器内命令；Kubernetes 的 readinessProbe 是 kubelet HTTP check；Service selector 和 Deployment labels 才决定集群流量路径。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/compose.yaml</span>
  </div>

```yaml
api:
  build:
    context: .
    dockerfile: Dockerfile
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:3040/v1/health/ready').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\""]
  stop_signal: SIGTERM
  stop_grace_period: 30s
```
</div>

**逐行解释**

`build` 指向本地 Dockerfile；`depends_on` 等 PostgreSQL 和 Redis healthcheck 成功后再启动 API；API healthcheck 在容器内请求 readiness endpoint；`stop_signal` 让 Compose 停止时发送 SIGTERM；`stop_grace_period` 模拟平台给应用的关闭窗口。

**运行方式**

Compose 的学习路径是本地启动多个容器并观察互联；Kubernetes 的学习路径是静态检查 manifests 和理解控制器动作。本次只改指南，不运行 Compose。

**预期输出**

Compose 成功时，本地服务应按健康依赖顺序启动，Prometheus scrape API，NGINX 转发流量；Kubernetes YAML 正确时，应能从对象关系上看出 Deployment、Service、probes 和 resources 的职责。

**执行过程**

Compose CLI 创建本地网络和容器；healthcheck 命令在容器内执行；depends_on 根据健康状态启动后续服务；Kubernetes 则由 controllers 根据期望状态创建 Pods、维护 endpoints、执行 rollout。

**why the result/error happens**

Compose 没有 ReplicaSet controller、Service endpoint controller 或 kubelet probe 动作。它能证明本地容器组合可运行，不能证明集群控制器会按 manifest 正确调谐。

**contrast**

Compose 是 local simulation；Kubernetes 是 orchestrator。前者适合学习和开发验证，后者负责多节点调度、滚动更新、service discovery 和自愈。

**common mistake and violated rule**

常见错误是把 Compose healthcheck 成功写成 Kubernetes 部署成功。违反的规则是：本地容器验证不能替代集群上下文验证。

**real-project relationship**

真实团队经常用 Compose 做开发栈，用 Kubernetes 做生产部署。两边配置可以相互启发，但不能认为字段语义一一对应。

**current learning-path relationship**

本节把 Dockerfile/Compose 学习结果连接到 Kubernetes manifest 阅读，帮助你知道哪些证据只属于本地，哪些证据才属于集群。

**final memory model**

Compose 证明本地服务组合，Kubernetes 证明集群期望状态；healthcheck 类似 probe，但不是同一个控制器语义。

<a id="section-9-20"></a>

### 9.20 SLO release gate、operational runbook 与 incident evidence

**结论**

SLO release gate 用 error budget 决定发布是否继续，runbook 用 first checks 指导 incident 初始动作，incident evidence 用日志、metrics、traces、health 和 platform state 说明事实。三者合在一起，才能把“感觉不稳”变成可解释的工程决策。

**本节解决的问题**

本节解决的是“出事故或发布前先看什么”。如果 release gate 只看测试通过，会忽略线上预算；如果 incident 只看日志，会漏掉 latency histogram、dependency readiness 和 event loop delay。

**技术意义**

发布和事故处理都是高风险动作，需要统一的证据顺序。SLO 决定是否需要暂停发布，runbook 决定先查哪些信号，incident evidence 决定复盘时能否解释根因和影响范围。

**概念解释**

Release gate 是自动或人工的发布边界；error budget 是可靠性剩余额度；runbook 是报警后的操作路线；incident evidence 是从不同信号收集到的事实集合。它们不是文档装饰，而是减少临场猜测的工程机制。

**边界**

`slo.service.ts` 计算本地样本窗口；`runbook.ts` 提供学习 runbook；Prometheus rules 触发症状报警；真实 CI/CD gate、on-call 平台和 incident system 不在本章运行范围内。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/slo/slo.service.ts` and `mini-projects/platform-observability-kubernetes-lab/src/platform/runbook.ts`; signal: releaseDecision plus runbook firstChecks; failure mode: ignoring budget can continue releases during reliability burn, while missing runbook can delay the first useful check. releaseDecision 把 ratio 转成 `continue` 或 `investigate`，runbook 把 alert 转成检查列表。

**API / 配置 / 命令规则**

`releaseGateBudgetRemainingRatio` 是 release gate 门槛；`releaseDecision` 是 gate 输出；`firstChecks` 要引用可验证端点或指标；`avoid` 要写出危险动作；incident evidence 不应包含 secrets 或高基数 metric labels。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/slo/slo-policy.ts</span>
  </div>

```ts
export const defaultSloPolicy: SloPolicy = {
  name: "api-user-visible-reliability",
  window: "rolling-local-demo",
  availabilityTarget: 0.99,
  latencyTargetMs: 500,
  releaseGateBudgetRemainingRatio: 0.25
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/platform/runbook.ts</span>
  </div>

```ts
firstChecks: ["Check /v1/slo/report", "Check recent 5xx route patterns", "Inspect dependency readiness"],
avoid: ["Do not page on each raw error", "Do not add user identifiers to metric labels"]
```
</div>

**逐行解释**

SLO policy 命名用户可见可靠性目标；window 标明本地学习窗口；availability target 是 99%；latency target 是 500ms；budget remaining 低于 25% 时进入 investigate；runbook first checks 从 SLO report、5xx route pattern 和 dependency readiness 开始；avoid 阻止 raw-error paging 和用户 ID label。

**运行方式**

学习时读取 `/v1/slo/report` 和 `/v1/platform/runbook`，再对照 Prometheus alert names。当前修复不运行服务，只确保指南解释与现有文件一致。

**预期输出**

SLO report 应给出 `releaseDecision`；runbook 应给出 first checks；alert annotations 应能指向 runbook 路径。三者合起来构成 incident 初始证据链。

**执行过程**

业务请求产生样本；SLO service 计算预算；Prometheus 评估 metrics 规则；alert 关联 runbook；人按 first checks 收集指标、日志、trace、health 和 platform evidence。

**why the result/error happens**

发布风险不是由最近一次请求决定，而是由目标窗口内预算是否仍充足决定。预算不足时继续发布会把可恢复故障变成更大事故。

**contrast**

测试通过说明代码在测试条件下满足断言；release gate 说明当前服务可靠性是否允许继续变更；runbook 说明事故发生时先查哪组证据。

**common mistake and violated rule**

常见错误是 incident 时先扩容或重启，再补证据。违反的规则是：高风险操作前应先确认 symptom、scope、budget 和第一组可验证事实。

**real-project relationship**

真实发布系统会把 SLO gate 接到 CI/CD、feature flag 或 progressive delivery。runbook 则连接 dashboard、logs、trace query 和 owner。

**current learning-path relationship**

这一节把本章前面的信号合并成运营流程：不是学完 metrics 就结束，而是要用 metrics 支持发布和事故判断。

**final memory model**

SLO gate 决定能否继续发布，runbook 决定先查什么，incident evidence 决定能否解释和复盘。

<a id="section-9-21"></a>

### 9.21 Telemetry safety：secret redaction、PII、high-cardinality labels

**结论**

Telemetry safety 要同时处理 secret redaction、PII 边界和 high-cardinality labels。日志、metrics 和 traces 都可能泄露或放大数据；安全设计必须发生在写出、采样和 label 选择之前。

**本节解决的问题**

本节解决的是“为什么可观测性本身也会造成事故”。日志可能泄露 token，metrics 可能因为用户 ID label 爆炸，trace attributes 可能保存 PII，Prometheus 可能因为无界 time series 变慢或存储膨胀。

**技术意义**

观测数据会被复制到日志平台、metrics backend、trace backend、备份、告警消息和 incident 文档。一个敏感字段一旦写入，删除成本远高于在应用边界 redaction。

**概念解释**

Secret 是 credential、token、password、connection string；PII 是可识别个人的信息；high-cardinality label 是取值集合无限或接近无限的维度。日志可以包含单次 ID 但要 redact；metrics 只能用有限维度；traces attributes 也要避免隐私和高基数字段。

**边界**

Pino redaction 保护日志写出；`assertSafeMetricLabels` 保护 metrics label；trace attributes 由 instrumentation 选择；Kubernetes Secret 保护部署注入但不保护你手动写入日志的值。TypeScript 类型不等于安全策略。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/observability/logger.ts` and `mini-projects/platform-observability-kubernetes-lab/src/observability/metrics.ts`; signal: telemetry field and label filtering; failure mode: secret exposure or unbounded labels can make telemetry storage unsafe or unavailable. logger 的 redact paths 和 metrics 的 forbidden label names 是两个不同的安全闸口。

**API / 配置 / 命令规则**

`redact.paths` 处理日志对象路径；`redactLogFields` 处理传入对象的敏感字段名；`allowedMetricLabelNames` 是 metric label allow list；`forbiddenMetricLabelNames` 捕获高风险名称；label value 长度限制阻止把长 payload 塞进 metric。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/observability/metrics.ts</span>
  </div>

```ts
const forbiddenMetricLabelNames = [
  "user",
  "user_id",
  "request_id",
  "trace_id",
  "span_id",
  "email",
  "ip",
  "url",
  "query",
  "token",
  "database_url",
  "request_body"
];

if (value.length > 120) {
  throw new Error("Metric label value is too long: " + name);
}
```
</div>

**逐行解释**

Forbidden list 覆盖用户标识、请求标识、trace/span ID、网络地址、URL、query、token、数据库 URL 和请求体；这些字段要么敏感，要么高基数；长度限制阻止用很长字符串绕过名称检查；抛错让错误 label 在开发和测试阶段暴露。

**运行方式**

阅读 logging 和 metrics unit tests，或在学习练习中传入危险 label 名，观察 `assertSafeMetricLabels` 抛错。当前任务不改测试，也不运行项目命令。

**预期输出**

安全 label 应通过检查；`trace_id`、`email`、`database_url`、`request_body` 或超长 label value 应被拒绝；日志敏感字段应输出 `[Redacted]`。

**执行过程**

调用方准备 telemetry 对象；logger 或 metrics 模块在写出前检查字段；敏感日志值被替换；危险 metric label 直接抛错；只有通过 gate 的信号进入 stdout 或 registry。

**why the result/error happens**

metrics backend 按 label set 建时间序列，用户级字段会持续制造新序列；日志平台会保存原始事件，secret 一旦写出就进入多个存储位置。这就是安全检查必须前置的原因。

**contrast**

日志可以保存 redacted request context；metrics 保存低基数聚合维度；trace 保存路径和少量属性。把三者都当作“随便放字段的 JSON”会同时破坏安全和成本。

**common mistake and violated rule**

常见错误是认为内部学习项目可以写真实 token 或邮箱。违反的规则是：学习材料也会被复制和发布，真实秘密和 PII 不应进入仓库、日志、metric label 或示例输出。

**real-project relationship**

真实组织会有 data retention、privacy review、secret scanning、observability cost control 和 incident export。应用层 telemetry safety 是这些平台控制之前的第一道防线。

**current learning-path relationship**

前面你学过 validation 和 error handling；这里把同样思路用于观测数据：外部输入、内部字段和输出系统都需要边界检查。

**final memory model**

先过滤再观测：日志 redact，metrics 限 label，traces 控 attribute，真实秘密永远不进 telemetry。

<a id="section-9-22"></a>

### 9.22 Chapter integration: platform-observability-kubernetes-lab

**结论**

`platform-observability-kubernetes-lab` 把本章机制整合成一个小型平台练习：API 提供请求路径，health endpoints 服务 probes，logs 保存结构化事件，metrics 暴露 Prometheus 样本，traces 建立 span tree，SLO 产生 release decision，alert rules 定义症状，Docker Compose 做本地 simulation，Prometheus 抓取指标，NGINX 代理入口，Kubernetes manifests 表达集群期望状态。

**本节解决的问题**

本节解决的是“这些文件为什么属于同一个章节，而不是散乱工具清单”。每个文件对应一个运行边界：Node HTTP、dependency readiness、observability signal、SLO decision、container orchestration 或 platform routing。

**技术意义**

集成项目让你从单个 API handler 看到完整后端上线路径：请求进入 Express，被 middleware 加 context 和 metrics，业务 route 产生信号，Prometheus scrape，alert rules 评估，Kubernetes probes 和 rollout 读取 health，Compose 和 NGINX 模拟本地网络。

**概念解释**

API 是业务和观测的入口；health 是平台控制信号；logs、metrics、traces 是诊断信号；SLO 和 alerts 是决策信号；Compose 是本地多容器运行模型；Kubernetes manifests 是集群期望状态；NGINX 是反向代理边界。

**边界**

这个项目可以验证本地 TypeScript、Express、Prometheus config 和 Compose 关系；它不声明真实 Kubernetes deployment 已完成。静态 manifest 检查和集群运行是两个不同层级，最终指南必须如实区分。

**底层机制**

Owner file: `mini-projects/platform-observability-kubernetes-lab/src/api/app.ts` plus `compose.yaml` and `k8s/deployment.yaml`; signal: integrated API, telemetry, health, local container, and manifest evidence; failure mode: treating one successful local route as full platform readiness ignores metrics scrape, probe behavior, SLO budget, and Kubernetes selector/resource boundaries. 集成学习要从入口一路追到平台对象，而不是停在 HTTP 200。

**API / 配置 / 命令规则**

Express `app.use` 决定 middleware 和 router 顺序；Prometheus `scrape_configs` 决定指标来源；alert rules 决定症状判断；Compose `depends_on` 决定本地启动关系；Kubernetes Deployment/Service/probes/resources 决定集群期望状态；Secret example 只表达字段，不保存真实值。

**示例代码 or config**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/src/api/app.ts</span>
  </div>

```ts
app.use(requestContextMiddleware);
app.use(httpMetricsMiddleware);
app.use("/v1/health", createHealthRouter(healthService));
app.use("/v1", createMetricsRouter());
app.use("/v1/simulate", createSimulationRouter(sloStore));
app.use("/v1/slo", createSloRouter(sloStore));
app.use("/v1/platform", createPlatformRouter());
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/platform-observability-kubernetes-lab/compose.yaml</span>
  </div>

```yaml
prometheus:
  image: prom/prometheus:latest
  command:
    - --config.file=/etc/prometheus/prometheus.yml
  depends_on:
    api:
      condition: service_healthy
```
</div>

**逐行解释**

API 代码先安装 context 和 metrics middleware；health router 给 probes 使用；metrics router 给 Prometheus scrape；simulate router 产生学习信号；SLO router 产出 release report；platform router 暴露 runbook 和平台模型；Compose 中 Prometheus 读取配置并等 API healthy 后启动。

**运行方式**

完整学习路径是先读 API 和 observability owner files，再读 SLO、runbook、Prometheus、Compose、NGINX 和 Kubernetes manifests。运行验证属于项目阶段，本次修复按用户要求不重跑 runtime。

**预期输出**

指南应能让你解释：一个请求如何产生 log、metric 和 trace；readiness 如何影响 Compose/Kubernetes；SLO 如何变成 release decision；Prometheus rule 如何连接 runbook；Kubernetes manifest 如何表达 Pod、Service、probe、resources 和 termination。

**执行过程**

请求进入 API；middleware 写入 context 和 metrics listener；业务 route 产生 simulation 或 SLO 样本；logger、metrics registry 和 tracing SDK 输出不同信号；Prometheus scrape registry；alert rules 评估；Compose 或 Kubernetes 根据 health/probe/manifest 控制容器入口和生命周期。

**why the result/error happens**

集成项目的价值来自边界连接。只证明 `GET /v1/health/live` 成功，不能证明 metrics 正确、trace 连通、SLO 预算充足、Prometheus rule 可用或 Kubernetes selector 匹配。

**contrast**

单节练习训练一个概念，例如 label cardinality 或 startup probe；mini project 训练多个概念如何互相约束。前者适合理解机制，后者适合练习真实项目阅读路径。

**common mistake and violated rule**

常见错误是把最终项目当成替代前面 `9.x` 教学的代码清单。违反的规则是：集成项目只负责串联机制，不能代替每个概念的机制解释。

**real-project relationship**

真实平台项目通常还有 CI/CD、Ingress、service mesh、OTLP collector、managed secrets 和 production cluster policy。本章 mini project 没有扩展到那些系统，但建立了进入它们之前必须理解的本地模型。

**current learning-path relationship**

这一节收束 Chapter 16，同时回连前面章节的 HTTP、middleware、validation、process、async/background 和 TypeScript 边界。下一步学习生产部署或平台工程时，可以沿着这些 owner files 找证据。

**final memory model**

Chapter 16 的整体模型是：API 产生日志、指标和 trace；health/probes 控制流量；SLO/alerts 支持决策；Compose 模拟本地；Kubernetes 表达集群期望状态。

## 10. API 与规则索引

| 类别 | API / 配置 / 命令 | 规则 |
| --- | --- | --- |
| Health | `GET /v1/health/live` | 只证明进程能响应最小请求 |
| Health | `GET /v1/health/ready` | 检查 PostgreSQL/Redis dependency readiness |
| Health | `GET /v1/health/startup` | grace 期内 `starting`，之后 `started` |
| Metrics | `GET /v1/metrics` | 使用 Prometheus exposition text 和低基数 labels |
| Tracing | `POST /v1/simulate/trace-work` | 返回 traceId、spanId、traceparent shape |
| SLO | `GET /v1/slo/report` | 返回 availability、latency compliance、budget remaining、releaseDecision |
| Docker | `docker compose config` | 解析 Compose 结构，不等于 runtime healthy |
| Kubernetes | `npm run k8s:check` | 静态验证 probes、resources、selector、fake Secret |

## 11. 常见错误对照表

| 错误 | 违反的规则 | 结果 | 修正 |
| --- | --- | --- | --- |
| 把 observability 当 console.log | signal boundary | 只能看到事件文本，不能判断趋势和 SLO | 拆分 logs、metrics、traces、alerts、SLO |
| 用 traceId 做 metric label | low-cardinality label rule | time series 爆炸 | traceId 只进 logs/traces |
| liveness 检查 PostgreSQL | probe ownership | 依赖短暂失败触发 restart | dependency check 放 readiness |
| startup 总是返回 started | startup state rule | slow init 无法被 probe 区分 | grace 期内返回 starting |
| Secret 示例写真实值 | secret safety rule | 训练材料泄漏 secret | 只使用 placeholder |
| YAML 被当作生产部署 | deployment evidence rule | 没有 cluster evidence 却宣称部署 | 只声明 static manifest validation |

## 12. 调试与验证方法

调试顺序应从信号边界开始：先确认 endpoint 或 script 是否触发，再确认值是否被正确 parse、validate、record、export 或 close。`typecheck` 只能证明 TypeScript 形状，不能证明 PostgreSQL、Redis、NGINX、Prometheus 或 Kubernetes runtime 可用；这些必须用对应 command 或 endpoint 验证。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```txt
npm install
npm run typecheck
npm run build
npm test -- --test-concurrency=1
npm run alert:check
npm run k8s:check
npm run docker:check
docker compose config
docker compose build --no-cache --progress=plain api
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```txt
docker compose up -d postgres redis api prometheus nginx
npm run smoke
npm run metrics:check
npm run trace:check
npm run slo:check
docker compose down
```
</div>

## 13. 分项练习说明

练习文件是本章概念的最小模型。不要把它们当成生产库；它们用于训练信号分类、redaction、label safety、trace propagation、SLO decision、probe decision 和 manifest review。

| 练习路径 | 训练点 |
| --- | --- |
| `practices/16-platform-observability-kubernetes/01-observability-signals/cardinality-risk-model.ts` | cardinality risk model |
| `practices/16-platform-observability-kubernetes/01-observability-signals/logs-vs-metrics-vs-traces.ts` | logs vs metrics vs traces |
| `practices/16-platform-observability-kubernetes/01-observability-signals/symptom-vs-cause-model.ts` | symptom vs cause model |
| `practices/16-platform-observability-kubernetes/01-observability-signals/telemetry-signal-classifier.ts` | telemetry signal classifier |
| `practices/16-platform-observability-kubernetes/02-logging/correlation-id-model.ts` | correlation id model |
| `practices/16-platform-observability-kubernetes/02-logging/log-redaction-boundary.ts` | log redaction boundary |
| `practices/16-platform-observability-kubernetes/02-logging/pino-level-model.ts` | pino level model |
| `practices/16-platform-observability-kubernetes/02-logging/structured-log-event.ts` | structured log event |
| `practices/16-platform-observability-kubernetes/03-metrics/counter-gauge-histogram.ts` | counter gauge histogram |
| `practices/16-platform-observability-kubernetes/03-metrics/histogram-bucket-budget.ts` | histogram bucket budget |
| `practices/16-platform-observability-kubernetes/03-metrics/low-cardinality-labels.ts` | low cardinality labels |
| `practices/16-platform-observability-kubernetes/03-metrics/red-use-metrics.ts` | red use metrics |
| `practices/16-platform-observability-kubernetes/04-tracing/auto-instrumentation-boundary.ts` | auto instrumentation boundary |
| `practices/16-platform-observability-kubernetes/04-tracing/manual-span-model.ts` | manual span model |
| `practices/16-platform-observability-kubernetes/04-tracing/propagation-headers.ts` | propagation headers |
| `practices/16-platform-observability-kubernetes/04-tracing/trace-span-context.ts` | trace span context |
| `practices/16-platform-observability-kubernetes/05-slo-alerting/alert-rule-window.ts` | alert rule window |
| `practices/16-platform-observability-kubernetes/05-slo-alerting/burn-rate-model.ts` | burn rate model |
| `practices/16-platform-observability-kubernetes/05-slo-alerting/runbook-link-model.ts` | runbook link model |
| `practices/16-platform-observability-kubernetes/05-slo-alerting/sli-slo-error-budget.ts` | sli slo error budget |
| `practices/16-platform-observability-kubernetes/06-node-container-runtime/cpu-quota-event-loop.ts` | cpu quota event loop |
| `practices/16-platform-observability-kubernetes/06-node-container-runtime/event-loop-delay-metric.ts` | event loop delay metric |
| `practices/16-platform-observability-kubernetes/06-node-container-runtime/memory-limit-model.ts` | memory limit model |
| `practices/16-platform-observability-kubernetes/06-node-container-runtime/sigterm-shutdown.ts` | sigterm shutdown |
| `practices/16-platform-observability-kubernetes/07-kubernetes-basics/configmap-secret-boundary.ts` | configmap secret boundary |
| `practices/16-platform-observability-kubernetes/07-kubernetes-basics/pod-deployment-service-model.ts` | pod deployment service model |
| `practices/16-platform-observability-kubernetes/07-kubernetes-basics/probe-decision-model.ts` | probe decision model |
| `practices/16-platform-observability-kubernetes/07-kubernetes-basics/resource-request-limit-model.ts` | resource request limit model |
| `practices/16-platform-observability-kubernetes/08-runtime-validation/compose-to-kubernetes-map.ts` | compose to kubernetes map |
| `practices/16-platform-observability-kubernetes/08-runtime-validation/deployment-rollout-check.ts` | deployment rollout check |
| `practices/16-platform-observability-kubernetes/08-runtime-validation/dockerfile-healthcheck-review.ts` | dockerfile healthcheck review |
| `practices/16-platform-observability-kubernetes/08-runtime-validation/kubernetes-manifest-check.ts` | kubernetes manifest check |
| `practices/16-platform-observability-kubernetes/09-lab-checks/incident-runbook-check.ts` | incident runbook check |
| `practices/16-platform-observability-kubernetes/09-lab-checks/prometheus-rule-check.ts` | prometheus rule check |
| `practices/16-platform-observability-kubernetes/09-lab-checks/slo-gate-check.ts` | slo gate check |
| `practices/16-platform-observability-kubernetes/09-lab-checks/telemetry-contract-check.ts` | telemetry contract check |

## 14. 最终迷你项目

本项目整合本章机制，但不替代前面逐节教学。它把 Express API、structured logs、Prometheus metrics、manual trace work、SLO report、alert rules、Docker Compose、NGINX、PostgreSQL/Redis readiness 和 static Kubernetes manifests 放在同一个可验证 runtime 中。

### 14.1 项目目标与边界

目标是回答：当本地多服务系统可以运行时，如何证明它在生产术语下可观察、可告警、可被 SLO 约束，并能被 Kubernetes 的 probe/resource/shutdown 模型描述。边界是：不做 real cloud deployment、Helm、Terraform、service mesh、real Ingress、Grafana、real tracing backend、real paging 或 real secrets。

### 14.2 项目结构责任分组

| responsibility group | owns | files | signal | mistake prevented |
| --- | --- | --- | --- | --- |
| observability signal boundary | 区分 logs、metrics、traces、alerts、SLO 的职责 | `src/observability/*、src/slo/*、prometheus/alert-rules.yml` | `/v1/metrics、/v1/slo/report、alert-check` | 把 console output 当成完整 observability |
| structured logging | 生成稳定字段并执行 redaction | `src/observability/logger.ts、src/observability/log-redaction.ts、src/shared/middleware/request-id.ts` | `logging.unit.test.ts` | 把 token、email、request body 写进日志 |
| metrics | 暴露 Prometheus metrics 并限制 labels | `src/observability/metrics.ts、src/observability/runtime-metrics.ts` | `metrics.unit.test.ts、metrics:check` | 使用 high-cardinality labels |
| tracing | 初始化 OTel SDK 并创建 manual spans | `src/observability/tracing.ts、src/observability/otel.ts` | `tracing.unit.test.ts、trace:check` | 只有 requestId 没有 trace propagation |
| SLO and error budget | 计算 availability、latency compliance、budget remaining | `src/slo/*` | `slo.unit.test.ts、slo:check` | 把内部 health check 当用户可见 SLO |
| alerting and runbooks | 定义 Prometheus rules 与 runbook 入口 | `prometheus/alert-rules.yml、src/platform/runbook.ts、src/platform/alert-rule-check.ts` | `alert-rules.unit.test.ts、alert:check` | 每个 raw error 都告警 |
| Node container runtime | 处理 SIGTERM、HTTP close、dependency close、telemetry shutdown | `src/api/server.ts、src/observability/event-loop-delay.ts` | `build、smoke` | 忽略 orchestrator grace period |
| Kubernetes manifests | 提供 Namespace、ConfigMap、fake Secret、Deployment、Service | `k8s/*.yaml、src/platform/manifest-check.ts` | `k8s:check` | 把 YAML 当真实 cluster deployment |
| runtime validation | 用脚本验证 metrics、trace、SLO、alerts、k8s、docker | `scripts/*.ts` | `npm run *:check` | 只运行 build 就宣称可运维 |
| API simulation routes | 提供 ok、error、slow、event-loop-delay、trace-work signals | `src/modules/simulate/*、src/simulation/simulate.routes.ts` | `api.integration.test.ts、smoke` | 无界暴露故障注入 |
| persistence/dependency readiness | 检查 PostgreSQL 和 Redis 是否可服务 traffic | `src/db/*、src/redis/*、src/dependencies/*、src/health/*` | `readiness.integration.test.ts` | 用 liveness 承担 dependency readiness |
| runtime/deployment | 用 Dockerfile、Compose、NGINX、Prometheus 描述本地 runtime | `Dockerfile、compose.yaml、nginx/nginx.conf、prometheus/prometheus.yml` | `docker:check、docker compose config` | 把 startup order 当 readiness |
| validation scripts | 把静态结构检查变成可重复命令 | `scripts/docker-check.ts、scripts/k8s-check.ts` | `npm run docker:check、npm run k8s:check` | 手工目测 YAML |
| tests | 覆盖 redaction、metrics、tracing、SLO、alerts、k8s、API、readiness、startup | `tests/*.test.ts` | `npm test` | 只有 happy path smoke |

### 14.3 完整项目代码

#### `.dockerignore`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">.dockerignore</span>
  </div>

```txt
node_modules
dist
npm-debug.log
.env
.env.*
coverage
```
</div>

#### `compose.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">compose.yaml</span>
  </div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: platform_observability_kubernetes_lab
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d platform_observability_kubernetes_lab"]
      interval: 5s
      timeout: 5s
      retries: 20
    volumes:
      - postgres-data:/var/lib/postgresql
    networks:
      - platform-lab

  redis:
    image: redis:8-alpine
    command: ["redis-server", "--appendonly", "yes"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 20
    volumes:
      - redis-data:/data
    networks:
      - platform-lab

  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      PORT: "3040"
      SERVICE_NAME: platform-observability-kubernetes-lab
      DATABASE_URL: postgresql://app:app@postgres:5432/platform_observability_kubernetes_lab
      REDIS_URL: redis://redis:6379
      CORS_ORIGIN: http://localhost:8080
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:3040/v1/health/ready').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\""]
      interval: 10s
      timeout: 5s
      retries: 12
      start_period: 20s
    expose:
      - "3040"
    stop_signal: SIGTERM
    stop_grace_period: 30s
    networks:
      - platform-lab

  prometheus:
    image: prom/prometheus:latest
    command:
      - --config.file=/etc/prometheus/prometheus.yml
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/alert-rules.yml:/etc/prometheus/alert-rules.yml:ro
    depends_on:
      api:
        condition: service_healthy
    ports:
      - "9090:9090"
    networks:
      - platform-lab

  nginx:
    image: nginx:1.27-alpine
    depends_on:
      api:
        condition: service_healthy
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8080:80"
    networks:
      - platform-lab

networks:
  platform-lab:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```
</div>

#### `Dockerfile`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Dockerfile</span>
  </div>

```txt
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build
RUN npm prune --omit=dev

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
EXPOSE 3040
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3040/v1/health/live').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/src/api/server.js"]
```
</div>

#### `k8s/configmap.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">k8s/configmap.yaml</span>
  </div>

```txt
apiVersion: v1
kind: ConfigMap
metadata:
  name: platform-observability-kubernetes-lab-config
  namespace: platform-observability-kubernetes-lab
data:
  NODE_ENV: production
  PORT: "3040"
  SERVICE_NAME: platform-observability-kubernetes-lab
  CORS_ORIGIN: http://localhost:8080
```
</div>

#### `k8s/deployment.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">k8s/deployment.yaml</span>
  </div>

```txt
apiVersion: apps/v1
kind: Deployment
metadata:
  name: platform-observability-kubernetes-lab-api
  namespace: platform-observability-kubernetes-lab
  labels:
    app.kubernetes.io/name: platform-observability-kubernetes-lab
    app.kubernetes.io/component: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: platform-observability-kubernetes-lab
      app.kubernetes.io/component: api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: platform-observability-kubernetes-lab
        app.kubernetes.io/component: api
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: example.com/platform-observability-kubernetes-lab-api:replace-me
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 3040
          envFrom:
            - configMapRef:
                name: platform-observability-kubernetes-lab-config
            - secretRef:
                name: platform-observability-kubernetes-lab-secret
          livenessProbe:
            httpGet:
              path: /v1/health/live
              port: http
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /v1/health/ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2
          startupProbe:
            httpGet:
              path: /v1/health/startup
              port: http
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 12
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```
</div>

#### `k8s/namespace.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">k8s/namespace.yaml</span>
  </div>

```txt
apiVersion: v1
kind: Namespace
metadata:
  name: platform-observability-kubernetes-lab
  labels:
    app.kubernetes.io/name: platform-observability-kubernetes-lab
```
</div>

#### `k8s/secret.example.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">k8s/secret.example.yaml</span>
  </div>

```txt
apiVersion: v1
kind: Secret
metadata:
  name: platform-observability-kubernetes-lab-secret
  namespace: platform-observability-kubernetes-lab
type: Opaque
stringData:
  DATABASE_URL: postgresql://placeholder:placeholder@postgres:5432/platform_observability_kubernetes_lab
  REDIS_URL: redis://placeholder-redis:6379
```
</div>

#### `k8s/service.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">k8s/service.yaml</span>
  </div>

```txt
apiVersion: v1
kind: Service
metadata:
  name: platform-observability-kubernetes-lab-api
  namespace: platform-observability-kubernetes-lab
  labels:
    app.kubernetes.io/name: platform-observability-kubernetes-lab
    app.kubernetes.io/component: api
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: platform-observability-kubernetes-lab
    app.kubernetes.io/component: api
  ports:
    - name: http
      port: 80
      targetPort: http
```
</div>

#### `nginx/nginx.conf`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nginx/nginx.conf</span>
  </div>

```txt
events {}

http {
  upstream platform_api {
    server api:3040;
  }

  server {
    listen 80;

    location / {
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Request-Id $request_id;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_pass http://platform_api;
    }
  }
}
```
</div>

#### `openapi/openapi.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">openapi/openapi.yaml</span>
  </div>

```txt
openapi: 3.1.0
info:
  title: Platform Observability Kubernetes Lab API
  version: 1.0.0
paths:
  /v1/health/live:
    get:
      operationId: getLiveHealth
      responses:
        "200":
          description: Live process status
  /v1/health/ready:
    get:
      operationId: getReadyHealth
      responses:
        "200":
          description: Dependency readiness passed
        "503":
          description: Dependency readiness failed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/health/startup:
    get:
      operationId: getStartupHealth
      responses:
        "200":
          description: Startup probe status
  /v1/metrics:
    get:
      operationId: getPrometheusMetrics
      responses:
        "200":
          description: Prometheus exposition text
  /v1/simulate/ok:
    get:
      operationId: simulateOk
      responses:
        "200":
          description: Successful signal
  /v1/simulate/error:
    get:
      operationId: simulateError
      responses:
        "503":
          description: Simulated error signal
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/simulate/slow:
    get:
      operationId: simulateSlow
      responses:
        "200":
          description: Slow request signal
  /v1/simulate/event-loop-delay:
    get:
      operationId: simulateEventLoopDelay
      responses:
        "200":
          description: Event loop delay signal
  /v1/simulate/trace-work:
    post:
      operationId: simulateTraceWork
      responses:
        "200":
          description: Manual trace work result
  /v1/slo/policy:
    get:
      operationId: getSloPolicy
      responses:
        "200":
          description: Local SLO policy
  /v1/slo/report:
    get:
      operationId: getSloReport
      responses:
        "200":
          description: Local SLO report
  /v1/platform/runbook:
    get:
      operationId: getPlatformRunbook
      responses:
        "200":
          description: Runbook entries
  /v1/platform/kubernetes-model:
    get:
      operationId: getKubernetesModel
      responses:
        "200":
          description: Static Kubernetes model
components:
  schemas:
    ProblemDetails:
      type: object
      required:
        - type
        - title
        - status
        - detail
        - code
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

#### `package.json`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">package.json</span>
  </div>

```json
{
  "name": "platform-observability-kubernetes-lab",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "engines": {
    "node": ">=26"
  },
  "scripts": {
    "dev": "tsx watch src/api/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/api/server.js",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "node --import tsx --test --test-concurrency=1 tests/*.test.ts",
    "smoke": "tsx scripts/smoke-test.ts",
    "metrics:check": "tsx scripts/metrics-check.ts",
    "trace:check": "tsx scripts/trace-check.ts",
    "slo:check": "tsx scripts/slo-check.ts",
    "alert:check": "tsx scripts/alert-check.ts",
    "k8s:check": "tsx scripts/k8s-check.ts",
    "docker:check": "tsx scripts/docker-check.ts"
  },
  "dependencies": {
    "@opentelemetry/api": "1.9.1",
    "@opentelemetry/resources": "2.10.0",
    "@opentelemetry/sdk-node": "0.221.0",
    "@opentelemetry/sdk-trace-node": "2.10.0",
    "@opentelemetry/semantic-conventions": "1.43.0",
    "cors": "2.8.6",
    "dotenv": "17.4.2",
    "express": "5.2.1",
    "express-rate-limit": "8.6.1",
    "helmet": "8.3.0",
    "pg": "8.22.0",
    "pino": "10.3.1",
    "prom-client": "15.1.3",
    "redis": "6.1.0",
    "yaml": "2.9.0",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@types/cors": "2.8.19",
    "@types/express": "5.0.6",
    "@types/node": "26.1.2",
    "@types/pg": "8.20.0",
    "@types/supertest": "7.2.1",
    "supertest": "7.2.2",
    "tsx": "4.23.1",
    "typescript": "7.0.2"
  }
}
```
</div>

#### `prometheus/alert-rules.yml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">prometheus/alert-rules.yml</span>
  </div>

```txt
groups:
  - name: platform-observability-kubernetes-lab
    rules:
      - alert: HighHttpErrorBudgetBurn
        expr: sum(rate(http_requests_total{status_class=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.02
        for: 10m
        labels:
          severity: warning
          service_name: platform-observability-kubernetes-lab
        annotations:
          summary: HTTP error budget burn is above the demo threshold
          runbook: /v1/platform/runbook

      - alert: HighLatencyP95
        expr: histogram_quantile(0.95, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m]))) > 0.5
        for: 10m
        labels:
          severity: warning
          service_name: platform-observability-kubernetes-lab
        annotations:
          summary: HTTP p95 latency is above the demo SLO
          runbook: /v1/platform/runbook

      - alert: DependencyReadinessFailing
        expr: min by (dependency_name) (dependency_readiness) == 0
        for: 5m
        labels:
          severity: warning
          service_name: platform-observability-kubernetes-lab
        annotations:
          summary: A required dependency is not ready
          runbook: /v1/platform/runbook

      - alert: HighEventLoopDelay
        expr: event_loop_delay_seconds{statistic="p99"} > 0.2
        for: 5m
        labels:
          severity: warning
          service_name: platform-observability-kubernetes-lab
        annotations:
          summary: Event loop delay is above the demo threshold
          runbook: /v1/platform/runbook
```
</div>

#### `prometheus/prometheus.yml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">prometheus/prometheus.yml</span>
  </div>

```txt
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/alert-rules.yml

scrape_configs:
  - job_name: platform-observability-kubernetes-lab-api
    metrics_path: /v1/metrics
    static_configs:
      - targets:
          - api:3040
```
</div>

#### `README.md`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">README.md</span>
  </div>

```txt
# Platform Observability Kubernetes Lab

Purpose:

- Demonstrates production observability boundaries for a local Node.js API.
- Includes structured logs, Prometheus metrics, manual trace work, SLO reports, alert rules, Docker Compose, NGINX, PostgreSQL readiness, Redis readiness, and static Kubernetes manifests.

Boundary:

- This is not a full Kubernetes production platform.
- It does not include cloud deployment, Helm, Terraform, service mesh, real Ingress, certificate automation, a tracing backend, Grafana dashboards, paging integrations, or real secrets.

Local setup:

- Windows PowerShell: npm install; npm run typecheck; npm run build; npm test -- --test-concurrency=1
- macOS or Linux: npm install; npm run typecheck; npm run build; npm test -- --test-concurrency=1

Docker Compose:

- docker compose config
- docker compose build --no-cache --progress=plain api
- docker compose up -d postgres redis api prometheus nginx
- npm run smoke
- docker compose down

Checks:

- npm run smoke
- npm run metrics:check
- npm run trace:check
- npm run slo:check
- npm run alert:check
- npm run k8s:check
- npm run docker:check

Endpoints:

- GET /v1/health/live
- GET /v1/health/ready
- GET /v1/health/startup
- GET /v1/metrics
- GET /v1/simulate/ok
- GET /v1/simulate/error
- GET /v1/simulate/slow
- GET /v1/simulate/event-loop-delay
- POST /v1/simulate/trace-work
- GET /v1/slo/policy
- GET /v1/slo/report
- GET /v1/platform/runbook
- GET /v1/platform/kubernetes-model

Runtime boundaries:

- Liveness proves the process can answer a minimal request.
- Readiness proves required dependencies are available for traffic.
- Startup protects slow initialization before liveness restarts become useful.
- Metrics avoid request ids, trace ids, span ids, user ids, raw URLs, tokens, emails, Redis keys, database URLs, and request bodies as labels.
- Kubernetes manifests are static learning artifacts and do not claim a real cluster deployment.
```
</div>

#### `scripts/alert-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/alert-check.ts</span>
  </div>

```ts
import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { assertCondition } from "./check-utils.js";

type AlertRule = {
  alert?: string;
  expr?: string;
  for?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

const doc = YAML.parse(await readFile(new URL("../prometheus/alert-rules.yml", import.meta.url), "utf8")) as { groups?: Array<{ rules?: AlertRule[] }> };
assertCondition(Array.isArray(doc.groups) && doc.groups.length > 0, "Alert groups are missing");

const forbiddenLabelNames = ["user_id", "request_id", "trace_id", "span_id", "email", "raw_url", "token", "redis_key", "database_url"];

for (const group of doc.groups) {
  assertCondition(Array.isArray(group.rules), "Alert group rules are missing");
  for (const rule of group.rules ?? []) {
    assertCondition(typeof rule.alert === "string" && rule.alert.length > 0, "Alert name is missing");
    assertCondition(typeof rule.expr === "string" && rule.expr.length > 0, "Alert expression is missing");
    assertCondition(typeof rule.for === "string" && rule.for.length > 0, "Alert duration is missing");
    assertCondition(rule.labels?.severity !== undefined, "Alert severity label is missing");
    assertCondition(rule.annotations?.summary !== undefined, "Alert summary annotation is missing");
    assertCondition(rule.annotations?.runbook !== undefined, "Alert runbook annotation is missing");
    for (const labelName of Object.keys(rule.labels ?? {})) {
      assertCondition(!forbiddenLabelNames.includes(labelName), "Forbidden alert label: " + labelName);
    }
  }
}

console.log("alerts ok");
```
</div>

#### `scripts/check-utils.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/check-utils.ts</span>
  </div>

```ts
export function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error("Request failed: " + response.status + " " + url);
  }
  return await response.json() as T;
}

export function baseUrl(): string {
  return process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
}
```
</div>

#### `scripts/docker-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/docker-check.ts</span>
  </div>

```ts
import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { assertCondition } from "./check-utils.js";

const compose = YAML.parse(await readFile(new URL("../compose.yaml", import.meta.url), "utf8")) as any;
const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");

for (const service of ["api", "postgres", "redis", "prometheus", "nginx"]) {
  assertCondition(compose.services?.[service], "Missing Compose service: " + service);
}

assertCondition(JSON.stringify(compose.services.nginx.ports).includes("8080:80"), "NGINX must expose host port 8080");
assertCondition(JSON.stringify(compose.services.postgres.volumes).includes("/var/lib/postgresql"), "PostgreSQL 18 volume target is invalid");
assertCondition(compose.services.api.depends_on.postgres.condition === "service_healthy", "API must wait for PostgreSQL health");
assertCondition(compose.services.api.depends_on.redis.condition === "service_healthy", "API must wait for Redis health");
assertCondition(compose.services.prometheus.volumes.some((value: string) => value.includes("prometheus.yml")), "Prometheus config volume is missing");
assertCondition((dockerfile.match(/^FROM /gm) ?? []).length >= 2, "Dockerfile is not multi-stage");
assertCondition(dockerfile.includes("CMD [\"node\", \"dist/src/api/server.js\"]"), "Runtime start must use built JavaScript");

console.log("docker config ok");
```
</div>

#### `scripts/k8s-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/k8s-check.ts</span>
  </div>

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { assertCondition } from "./check-utils.js";

export type KubernetesCheckResult = {
  resources: string[];
};

const root = new URL("../k8s/", import.meta.url);
const manifestFiles = ["namespace.yaml", "configmap.yaml", "secret.example.yaml", "deployment.yaml", "service.yaml"];

async function readManifest(fileName: string): Promise<unknown> {
  return YAML.parse(await readFile(new URL(fileName, root), "utf8"));
}

function labelsFromDeployment(deployment: any): Record<string, string> {
  return deployment.spec.template.metadata.labels as Record<string, string>;
}

function selectorMatches(selector: Record<string, string>, labels: Record<string, string>): boolean {
  return Object.entries(selector).every(([key, value]) => labels[key] === value);
}

export async function validateKubernetesManifests(): Promise<KubernetesCheckResult> {
  const manifests = new Map<string, any>();
  for (const fileName of manifestFiles) {
    const manifest = await readManifest(fileName);
    assertCondition(typeof manifest === "object" && manifest !== null, "Manifest is empty: " + fileName);
    manifests.set(fileName, manifest);
  }

  const namespace = manifests.get("namespace.yaml");
  const configMap = manifests.get("configmap.yaml");
  const secret = manifests.get("secret.example.yaml");
  const deployment = manifests.get("deployment.yaml");
  const service = manifests.get("service.yaml");

  assertCondition(namespace.kind === "Namespace", "Namespace manifest is invalid");
  assertCondition(configMap.kind === "ConfigMap", "ConfigMap manifest is invalid");
  assertCondition(secret.kind === "Secret", "Secret example manifest is invalid");
  assertCondition(deployment.kind === "Deployment", "Deployment manifest is invalid");
  assertCondition(service.kind === "Service", "Service manifest is invalid");

  const container = deployment.spec.template.spec.containers[0];
  assertCondition(container.image.includes("replace-me"), "Deployment image must be a placeholder");
  assertCondition(container.livenessProbe?.httpGet?.path === "/v1/health/live", "Liveness probe is invalid");
  assertCondition(container.readinessProbe?.httpGet?.path === "/v1/health/ready", "Readiness probe is invalid");
  assertCondition(container.startupProbe?.httpGet?.path === "/v1/health/startup", "Startup probe is invalid");
  assertCondition(container.resources?.requests?.cpu, "CPU request is missing");
  assertCondition(container.resources?.requests?.memory, "Memory request is missing");
  assertCondition(container.resources?.limits?.cpu, "CPU limit is missing");
  assertCondition(container.resources?.limits?.memory, "Memory limit is missing");
  assertCondition(deployment.spec.template.spec.terminationGracePeriodSeconds >= 30, "Termination grace period is too short");

  const labels = labelsFromDeployment(deployment);
  assertCondition(selectorMatches(service.spec.selector, labels), "Service selector does not match Deployment labels");
  assertCondition(service.spec.type === "ClusterIP", "Service type must be ClusterIP");

  const secretText = JSON.stringify(secret.stringData ?? {});
  assertCondition(secretText.includes("placeholder"), "Secret example must use placeholder values");
  assertCondition(!/AKIA|BEGIN PRIVATE KEY|sk_live|xoxb-|ghp_/i.test(secretText), "Secret example contains a secret-looking value");

  const allText = JSON.stringify([...manifests.values()]);
  assertCondition(!/cloud\.google\.com|service\.beta\.kubernetes\.io|ingress\.kubernetes\.io/i.test(allText), "Cloud provider annotation found");

  return { resources: [...manifests.values()].map((manifest) => manifest.kind) };
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
  await validateKubernetesManifests();
  console.log("k8s ok");
}
```
</div>

#### `scripts/metrics-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/metrics-check.ts</span>
  </div>

```ts
import { assertCondition, baseUrl } from "./check-utils.js";

const response = await fetch(baseUrl() + "/v1/metrics");
assertCondition(response.ok, "Metrics endpoint did not return success");
const text = await response.text();

const required = [
  "http_requests_total",
  "http_request_duration_seconds",
  "dependency_readiness",
  "event_loop_delay_seconds",
  "slo_budget_remaining_ratio"
];

for (const metric of required) {
  assertCondition(text.includes(metric), "Missing metric: " + metric);
}

const forbiddenLabelNames = ["user_id", "job_id", "request_id", "trace_id", "span_id", "email", "raw_url", "query_string", "token", "redis_key", "database_url", "request_body"];
for (const labelName of forbiddenLabelNames) {
  assertCondition(!text.includes(labelName + "="), "Forbidden metric label found: " + labelName);
}

console.log("metrics ok");
```
</div>

#### `scripts/slo-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/slo-check.ts</span>
  </div>

```ts
import { assertCondition, baseUrl, fetchJson } from "./check-utils.js";

const policy = await fetchJson<{ availabilityTarget: number }>(baseUrl() + "/v1/slo/policy");
assertCondition(policy.availabilityTarget > 0 && policy.availabilityTarget < 1, "SLO policy availability target is invalid");

const report = await fetchJson<{ availabilityRatio: number; errorBudgetRemainingRatio: number; releaseDecision: string }>(baseUrl() + "/v1/slo/report");
assertCondition(report.availabilityRatio >= 0 && report.availabilityRatio <= 1, "Availability ratio is outside range");
assertCondition(report.errorBudgetRemainingRatio >= 0 && report.errorBudgetRemainingRatio <= 1, "Error budget ratio is outside range");
assertCondition(["continue", "investigate"].includes(report.releaseDecision), "Release decision is invalid");

console.log("slo ok");
```
</div>

#### `scripts/smoke-test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/smoke-test.ts</span>
  </div>

```ts
import { assertCondition, baseUrl, fetchJson } from "./check-utils.js";

const url = baseUrl();
const live = await fetchJson<{ status: string }>(url + "/v1/health/live");
assertCondition(live.status === "live", "Live check did not return live");

const readyResponse = await fetch(url + "/v1/health/ready");
assertCondition(readyResponse.ok, "Ready check did not return success");

const ok = await fetchJson<{ signal: string }>(url + "/v1/simulate/ok");
assertCondition(ok.signal === "ok", "Simulation ok route failed");

const report = await fetchJson<{ errorBudgetRemainingRatio: number }>(url + "/v1/slo/report");
assertCondition(typeof report.errorBudgetRemainingRatio === "number", "SLO report is missing budget data");

console.log("smoke ok");
```
</div>

#### `scripts/trace-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/trace-check.ts</span>
  </div>

```ts
import { assertCondition, baseUrl, fetchJson } from "./check-utils.js";

const result = await fetchJson<{ traceId: string; spanId: string; traceparent: string }>(baseUrl() + "/v1/simulate/trace-work", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ operationName: "check-trace-work", steps: 2 })
});

assertCondition(/^[0-9a-f]{32}$/.test(result.traceId), "traceId shape is invalid");
assertCondition(/^[0-9a-f]{16}$/.test(result.spanId), "spanId shape is invalid");
assertCondition(/^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(result.traceparent), "traceparent shape is invalid");
assertCondition(!result.traceparent.includes("00000000000000000000000000000000"), "traceparent trace id is empty");

console.log("trace ok");
```
</div>

#### `scripts/wait-for-ready.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">scripts/wait-for-ready.ts</span>
  </div>

```ts
import { baseUrl } from "./check-utils.js";

const target = baseUrl() + "/v1/health/ready";
const deadline = Date.now() + Number(process.env.READY_TIMEOUT_MS ?? 30_000);

while (Date.now() < deadline) {
  try {
    const response = await fetch(target);
    if (response.ok) {
      console.log("ready");
      process.exit(0);
    }
  } catch {
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

throw new Error("Service did not become ready: " + target);
```
</div>

#### `src/api/app.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/api/app.ts</span>
  </div>

```ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { AppConfig } from "../config/env.js";
import { loadConfig } from "../config/env.js";
import { createDependencyProbes } from "../dependencies/index.js";
import type { DependencyProbe } from "../dependencies/postgres.js";
import { createHealthRouter } from "../health/health.routes.js";
import { createHealthService } from "../health/health.service.js";
import { createSimulationRouter } from "../modules/simulate/simulate.routes.js";
import { createMetricsRouter } from "../observability/metrics.routes.js";
import { httpMetricsMiddleware } from "../observability/http-metrics.js";
import { requestContextMiddleware } from "../observability/request-context.js";
import { createPlatformRouter } from "../platform/platform.routes.js";
import { createSloRouter } from "../slo/slo.routes.js";
import { createSloStore } from "../slo/slo.service.js";
import { errorHandler, notFoundHandler } from "../shared/problem.js";

export type AppDependencies = {
  config?: AppConfig;
  probes?: DependencyProbe[];
};

export function createApp(options: AppDependencies = {}) {
  const config = options.config ?? loadConfig();
  const probes = options.probes ?? createDependencyProbes(config);
  const sloStore = createSloStore();
  const healthService = createHealthService(config, probes);
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
  app.use(express.json({ limit: "32kb" }));
  app.use(requestContextMiddleware);
  app.use(httpMetricsMiddleware);

  app.use("/v1/health", createHealthRouter(healthService));
  app.use("/v1", createMetricsRouter());
  app.use("/v1/simulate", createSimulationRouter(sloStore));
  app.use("/v1/slo", createSloRouter(sloStore));
  app.use("/v1/platform", createPlatformRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return {
    app,
    close: async () => {
      await healthService.close();
    }
  };
}
```
</div>

#### `src/api/server.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/api/server.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import { createApp } from "./app.js";
import { loadConfig } from "../config/env.js";
import { collectEventLoopDelaySnapshot } from "../observability/event-loop-delay.js";
import { logger } from "../observability/logger.js";
import { shutdownTelemetrySdk, startTelemetrySdk } from "../observability/tracing.js";

const config = loadConfig();
startTelemetrySdk(config);

const application = createApp({ config });
const server = createServer(application.app);
server.requestTimeout = 300_000;
server.headersTimeout = 65_000;

const eventLoopTimer = setInterval(() => {
  collectEventLoopDelaySnapshot();
}, 10_000);
eventLoopTimer.unref();

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT, serviceName: config.SERVICE_NAME }, "API server started");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "Shutdown started");
  server.close(async () => {
    clearInterval(eventLoopTimer);
    await application.close();
    await shutdownTelemetrySdk();
    logger.info({ signal }, "Shutdown completed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error({ signal }, "Shutdown grace period exceeded");
    process.exit(1);
  }, config.SHUTDOWN_GRACE_MS).unref();
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
```
</div>

#### `src/config/env.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

const BooleanEnv = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }
  return value;
}, z.boolean()).default(false);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3040),
  SERVICE_NAME: z.string().min(1).default("platform-observability-kubernetes-lab"),
  DATABASE_URL: z.string().min(1).default("postgresql://app:app@localhost:5432/platform_observability_kubernetes_lab"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:8080"),
  READINESS_TIMEOUT_MS: z.coerce.number().int().positive().default(800),
  STARTUP_GRACE_MS: z.coerce.number().int().positive().default(1000),
  SHUTDOWN_GRACE_MS: z.coerce.number().int().positive().default(8000),
  SKIP_DEPENDENCY_CHECKS: BooleanEnv
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(input: NodeJS.ProcessEnv = process.env): AppConfig {
  return EnvSchema.parse(input);
}
```
</div>

#### `src/db/db-health.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/db/db-health.ts</span>
  </div>

```ts
export { createPostgresProbe } from "../dependencies/postgres.js";
export type { DependencyProbe, DependencyStatus } from "../dependencies/postgres.js";
```
</div>

#### `src/db/pg-client.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/db/pg-client.ts</span>
  </div>

```ts
import { Pool } from "pg";
import type { AppConfig } from "../config/env.js";

export function createPgPool(config: Pick<AppConfig, "DATABASE_URL" | "READINESS_TIMEOUT_MS">): Pool {
  return new Pool({
    connectionString: config.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: config.READINESS_TIMEOUT_MS
  });
}
```
</div>

#### `src/dependencies/index.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/dependencies/index.ts</span>
  </div>

```ts
import type { AppConfig } from "../config/env.js";
import type { DependencyProbe } from "./postgres.js";
import { createPostgresProbe } from "./postgres.js";
import { createRedisProbe } from "./redis.js";

export function createDependencyProbes(config: AppConfig): DependencyProbe[] {
  return [
    createPostgresProbe(config),
    createRedisProbe(config)
  ];
}
```
</div>

#### `src/dependencies/postgres.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/dependencies/postgres.ts</span>
  </div>

```ts
import { Pool } from "pg";
import type { AppConfig } from "../config/env.js";

export type DependencyStatus = {
  name: string;
  ready: boolean;
  latencyMs: number;
  message: string;
};

export type DependencyProbe = {
  name: string;
  check: () => Promise<DependencyStatus>;
  close: () => Promise<void>;
};

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Dependency readiness timeout")), timeoutMs);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export function createPostgresProbe(config: AppConfig): DependencyProbe {
  if (config.SKIP_DEPENDENCY_CHECKS) {
    return {
      name: "postgres",
      check: async () => ({ name: "postgres", ready: true, latencyMs: 0, message: "Skipped by local validation mode" }),
      close: async () => {}
    };
  }

  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: config.READINESS_TIMEOUT_MS
  });

  return {
    name: "postgres",
    check: async () => {
      const start = Date.now();
      try {
        const client = await withTimeout(pool.connect(), config.READINESS_TIMEOUT_MS);
        try {
          await withTimeout(client.query("select 1 as ok"), config.READINESS_TIMEOUT_MS);
          return { name: "postgres", ready: true, latencyMs: Date.now() - start, message: "Connection accepted" };
        } finally {
          client.release();
        }
      } catch {
        return { name: "postgres", ready: false, latencyMs: Date.now() - start, message: "Connection unavailable" };
      }
    },
    close: async () => {
      await pool.end();
    }
  };
}
```
</div>

#### `src/dependencies/redis.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/dependencies/redis.ts</span>
  </div>

```ts
import { createClient } from "redis";
import type { AppConfig } from "../config/env.js";
import type { DependencyProbe } from "./postgres.js";

export function createRedisProbe(config: AppConfig): DependencyProbe {
  if (config.SKIP_DEPENDENCY_CHECKS) {
    return {
      name: "redis",
      check: async () => ({ name: "redis", ready: true, latencyMs: 0, message: "Skipped by local validation mode" }),
      close: async () => {}
    };
  }

  const client = createClient({ url: config.REDIS_URL });

  return {
    name: "redis",
    check: async () => {
      const start = Date.now();
      try {
        if (!client.isOpen) {
          await client.connect();
        }
        const response = await client.ping();
        return { name: "redis", ready: response === "PONG", latencyMs: Date.now() - start, message: "PING accepted" };
      } catch {
        return { name: "redis", ready: false, latencyMs: Date.now() - start, message: "PING unavailable" };
      }
    },
    close: async () => {
      if (client.isOpen) {
        await client.quit();
      }
    }
  };
}
```
</div>

#### `src/health/health.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/health/health.routes.ts</span>
  </div>

```ts
import type { Router } from "express";
import { Router as createRouter } from "express";
import type { createHealthService } from "./health.service.js";

export function createHealthRouter(healthService: ReturnType<typeof createHealthService>): Router {
  const router = createRouter();

  router.get("/live", (_request, response) => {
    response.json(healthService.live());
  });

  router.get("/startup", (_request, response) => {
    response.json(healthService.startup());
  });

  router.get("/ready", async (_request, response) => {
    const snapshot = await healthService.ready();
    response.status(snapshot.status === "ready" ? 200 : 503).json(snapshot);
  });

  return router;
}
```
</div>

#### `src/health/health.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/health/health.service.ts</span>
  </div>

```ts
import type { AppConfig } from "../config/env.js";
import type { DependencyProbe, DependencyStatus } from "../dependencies/postgres.js";
import { dependencyReadiness } from "../observability/metrics.js";

export type HealthSnapshot = {
  status: "live" | "starting" | "started" | "ready" | "degraded";
  uptimeSeconds: number;
  checks?: DependencyStatus[];
};

export function createHealthService(config: Pick<AppConfig, "STARTUP_GRACE_MS">, dependencies: DependencyProbe[]) {
  const startedAt = Date.now();

  return {
    live(): HealthSnapshot {
      return {
        status: "live",
        uptimeSeconds: process.uptime()
      };
    },

    startup(): HealthSnapshot {
      const startupElapsed = Date.now() - startedAt;
      return {
        status: startupElapsed >= config.STARTUP_GRACE_MS ? "started" : "starting",
        uptimeSeconds: process.uptime()
      };
    },

    async ready(): Promise<HealthSnapshot> {
      const checks = await Promise.all(dependencies.map((dependency) => dependency.check()));
      for (const check of checks) {
        dependencyReadiness.set({ dependency_name: check.name }, check.ready ? 1 : 0);
      }
      const allReady = checks.every((check) => check.ready);
      return {
        status: allReady ? "ready" : "degraded",
        uptimeSeconds: process.uptime(),
        checks
      };
    },

    async close(): Promise<void> {
      await Promise.all(dependencies.map((dependency) => dependency.close()));
    }
  };
}
```
</div>

#### `src/modules/simulate/simulate.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/modules/simulate/simulate.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import type { createSloStore } from "../../slo/slo.service.js";
import { TraceWorkSchema } from "./simulate.schema.js";
import { createSimulationService } from "./simulate.service.js";

export function createSimulationController(sloStore: ReturnType<typeof createSloStore>) {
  const service = createSimulationService(sloStore);

  return {
    ok: ((_request, response) => response.json(service.ok())) satisfies RequestHandler,
    error: (() => service.error()) satisfies RequestHandler,
    slow: (async (_request, response) => response.json(await service.slow())) satisfies RequestHandler,
    eventLoopDelay: ((_request, response) => response.json(service.eventLoopDelay())) satisfies RequestHandler,
    traceWork: ((request, response) => {
      const input = TraceWorkSchema.parse(request.body ?? {});
      response.json(service.traceWork(input));
    }) satisfies RequestHandler
  };
}
```
</div>

#### `src/modules/simulate/simulate.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/modules/simulate/simulate.routes.ts</span>
  </div>

```ts
import type { Router } from "express";
import { Router as createRouter } from "express";
import type { createSloStore } from "../../slo/slo.service.js";
import { createSimulationController } from "./simulate.controller.js";

export function createSimulationRouter(sloStore: ReturnType<typeof createSloStore>): Router {
  const router = createRouter();
  const controller = createSimulationController(sloStore);

  router.get("/ok", controller.ok);
  router.get("/error", controller.error);
  router.get("/slow", controller.slow);
  router.get("/event-loop-delay", controller.eventLoopDelay);
  router.post("/trace-work", controller.traceWork);

  return router;
}
```
</div>

#### `src/modules/simulate/simulate.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/modules/simulate/simulate.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const TraceWorkSchema = z.object({
  operationName: z.string().min(1).max(64).default("demo-trace-work"),
  steps: z.coerce.number().int().min(1).max(5).default(2)
});

export type TraceWorkInput = z.infer<typeof TraceWorkSchema>;
```
</div>

#### `src/modules/simulate/simulate.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/modules/simulate/simulate.service.ts</span>
  </div>

```ts
import { collectEventLoopDelaySnapshot, blockEventLoop } from "../../observability/event-loop-delay.js";
import { simulationSignalsTotal } from "../../observability/metrics.js";
import { runManualTraceWork } from "../../observability/tracing.js";
import { PublicProblem } from "../../shared/problem.js";
import type { createSloStore } from "../../slo/slo.service.js";
import type { TraceWorkInput } from "./simulate.schema.js";

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function createSimulationService(sloStore: ReturnType<typeof createSloStore>) {
  return {
    ok() {
      simulationSignalsTotal.inc({ signal_kind: "ok" });
      sloStore.record({ ok: true, durationMs: 20 });
      return { signal: "ok" };
    },
    error(): never {
      simulationSignalsTotal.inc({ signal_kind: "error" });
      sloStore.record({ ok: false, durationMs: 30 });
      throw new PublicProblem(503, "simulated_error", "Simulated dependency error");
    },
    async slow() {
      const start = Date.now();
      await wait(250);
      const durationMs = Date.now() - start;
      simulationSignalsTotal.inc({ signal_kind: "slow" });
      sloStore.record({ ok: true, durationMs });
      return { signal: "slow", durationMs };
    },
    eventLoopDelay() {
      blockEventLoop(60);
      simulationSignalsTotal.inc({ signal_kind: "event_loop_delay" });
      return { signal: "event_loop_delay", eventLoopDelay: collectEventLoopDelaySnapshot() };
    },
    traceWork(input: TraceWorkInput) {
      const result = runManualTraceWork(input);
      simulationSignalsTotal.inc({ signal_kind: "trace" });
      sloStore.record({ ok: true, durationMs: 35 });
      return result;
    }
  };
}
```
</div>

#### `src/observability/event-loop-delay.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/event-loop-delay.ts</span>
  </div>

```ts
import { monitorEventLoopDelay } from "node:perf_hooks";
import { eventLoopDelaySeconds } from "./metrics.js";

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

function nanosecondsToSeconds(value: number): number {
  return value / 1_000_000_000;
}

export type EventLoopDelaySnapshot = {
  mean: number;
  max: number;
  p99: number;
};

export function collectEventLoopDelaySnapshot(): EventLoopDelaySnapshot {
  const snapshot = {
    mean: nanosecondsToSeconds(histogram.mean),
    max: nanosecondsToSeconds(histogram.max),
    p99: nanosecondsToSeconds(histogram.percentile(99))
  };
  eventLoopDelaySeconds.set({ statistic: "mean" }, Number.isFinite(snapshot.mean) ? snapshot.mean : 0);
  eventLoopDelaySeconds.set({ statistic: "max" }, snapshot.max);
  eventLoopDelaySeconds.set({ statistic: "p99" }, snapshot.p99);
  return snapshot;
}

export function blockEventLoop(milliseconds: number): void {
  const end = Date.now() + milliseconds;
  while (Date.now() < end) {
    Math.sqrt(Date.now());
  }
}
```
</div>

#### `src/observability/http-metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/http-metrics.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { httpRequestDurationSeconds, httpRequestsTotal, assertSafeMetricLabels } from "./metrics.js";

function statusClass(statusCode: number): string {
  return Math.floor(statusCode / 100) + "xx";
}

export function routePattern(request: Request): string {
  if (request.route?.path) {
    const baseUrl = request.baseUrl || "";
    const routePath = Array.isArray(request.route.path) ? request.route.path[0] : String(request.route.path);
    return baseUrl + routePath;
  }
  return request.path === "/" ? "/" : "/unmatched";
}

export function httpMetricsMiddleware(request: Request, response: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    const labels = {
      method: request.method,
      route: routePattern(request),
      status_class: statusClass(response.statusCode)
    };
    assertSafeMetricLabels(labels);
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });
  next();
}
```
</div>

#### `src/observability/log-redaction.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/log-redaction.ts</span>
  </div>

```ts
export { redactLogFields } from "./logger.js";
```
</div>

#### `src/observability/logger.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/logger.ts</span>
  </div>

```ts
import pino from "pino";

const sensitiveFieldPattern = /(authorization|cookie|token|secret|password|database_url|redis_url|email|request_body)/i;

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "authorization",
      "cookie",
      "token",
      "secret",
      "password",
      "databaseUrl",
      "redisUrl",
      "email",
      "requestBody"
    ],
    censor: "[Redacted]"
  }
});

export function redactLogFields(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (sensitiveFieldPattern.test(key)) {
      output[key] = "[Redacted]";
      continue;
    }
    output[key] = value;
  }
  return output;
}
```
</div>

#### `src/observability/metrics.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/metrics.routes.ts</span>
  </div>

```ts
import type { Router } from "express";
import { Router as createRouter } from "express";
import { registry } from "./metrics.js";

export function createMetricsRouter(): Router {
  const router = createRouter();

  router.get("/metrics", async (_request, response) => {
    response.setHeader("content-type", registry.contentType);
    response.send(await registry.metrics());
  });

  return router;
}
```
</div>

#### `src/observability/metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/metrics.ts</span>
  </div>

```ts
import client from "prom-client";

export const registry = new client.Registry();

registry.setDefaultLabels({
  service_name: "platform-observability-kubernetes-lab"
});

client.collectDefaultMetrics({ register: registry });

const allowedMetricLabelNames = new Set([
  "method",
  "route",
  "status_class",
  "dependency_name",
  "operation_name",
  "error_class",
  "signal_kind",
  "slo_name",
  "alert_name",
  "service_name",
  "pod_role",
  "statistic",
  "result",
  "le"
]);

const forbiddenMetricLabelNames = [
  "user",
  "user_id",
  "project",
  "project_id",
  "job",
  "job_id",
  "request",
  "request_id",
  "trace",
  "trace_id",
  "span",
  "span_id",
  "email",
  "ip",
  "url",
  "query",
  "token",
  "redis_key",
  "database_url",
  "request_body",
  "body_hash"
];

export function assertSafeMetricLabels(labels: Record<string, string>): void {
  for (const [name, value] of Object.entries(labels)) {
    const normalizedName = name.toLowerCase();
    if (!allowedMetricLabelNames.has(normalizedName)) {
      throw new Error("Metric label is not in the allow list: " + name);
    }
    if (forbiddenMetricLabelNames.some((forbidden) => normalizedName === forbidden || normalizedName.includes(forbidden))) {
      throw new Error("Metric label is forbidden: " + name);
    }
    if (value.length > 120) {
      throw new Error("Metric label value is too long: " + name);
    }
  }
}

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"],
  registers: [registry]
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry]
});

export const dependencyReadiness = new client.Gauge({
  name: "dependency_readiness",
  help: "Dependency readiness status using 1 for ready and 0 for not ready.",
  labelNames: ["dependency_name"],
  registers: [registry]
});

export const eventLoopDelaySeconds = new client.Gauge({
  name: "event_loop_delay_seconds",
  help: "Event loop delay in seconds from Node perf_hooks monitorEventLoopDelay.",
  labelNames: ["statistic"],
  registers: [registry]
});

export const simulationSignalsTotal = new client.Counter({
  name: "simulation_signals_total",
  help: "Bounded simulation signals produced by demo endpoints.",
  labelNames: ["signal_kind"],
  registers: [registry]
});

export const traceWorkTotal = new client.Counter({
  name: "trace_work_total",
  help: "Manual trace work outcomes.",
  labelNames: ["operation_name", "result"],
  registers: [registry]
});

export const sloComplianceRatio = new client.Gauge({
  name: "slo_compliance_ratio",
  help: "Current SLO compliance ratio in the local sample window.",
  labelNames: ["slo_name"],
  registers: [registry]
});

export const sloBudgetRemainingRatio = new client.Gauge({
  name: "slo_budget_remaining_ratio",
  help: "Remaining error budget ratio in the local sample window.",
  labelNames: ["slo_name"],
  registers: [registry]
});
```
</div>

#### `src/observability/otel.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/otel.ts</span>
  </div>

```ts
export { startTelemetrySdk, shutdownTelemetrySdk, isTraceContextShape, runManualTraceWork } from "./tracing.js";
export type { TraceWorkInput, TraceWorkResult } from "./tracing.js";
```
</div>

#### `src/observability/request-context.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/request-context.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { trace } from "@opentelemetry/api";

export type RequestContext = {
  requestId: string;
  correlationId: string;
  traceId?: string;
  spanId?: string;
};

declare module "express-serve-static-core" {
  interface Request {
    context: RequestContext;
  }
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function requestContextMiddleware(request: Request, response: Response, next: NextFunction): void {
  const requestId = headerValue(request.headers["x-request-id"]) ?? randomUUID();
  const correlationId = headerValue(request.headers["x-correlation-id"]) ?? requestId;
  const activeSpan = trace.getActiveSpan();
  const activeSpanContext = activeSpan?.spanContext();

  request.context = {
    requestId,
    correlationId,
    traceId: activeSpanContext?.traceId,
    spanId: activeSpanContext?.spanId
  };

  response.setHeader("x-request-id", requestId);
  response.setHeader("x-correlation-id", correlationId);
  if (activeSpanContext?.traceId) {
    response.setHeader("traceparent", "00-" + activeSpanContext.traceId + "-" + activeSpanContext.spanId + "-01");
  }
  next();
}
```
</div>

#### `src/observability/runtime-metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/runtime-metrics.ts</span>
  </div>

```ts
export { collectEventLoopDelaySnapshot, blockEventLoop } from "./event-loop-delay.js";
export { eventLoopDelaySeconds } from "./metrics.js";
```
</div>

#### `src/observability/tracing.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/observability/tracing.ts</span>
  </div>

```ts
import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import type { AppConfig } from "../config/env.js";
import { traceWorkTotal } from "./metrics.js";

let sdkStarted = false;
let telemetrySdk: NodeSDK | undefined;

export type TraceWorkInput = {
  operationName: string;
  steps: number;
};

export type TraceWorkResult = {
  operationName: string;
  traceId: string;
  spanId: string;
  traceparent: string;
  steps: number;
};

export function startTelemetrySdk(config: Pick<AppConfig, "SERVICE_NAME">): void {
  if (sdkStarted) {
    return;
  }
  telemetrySdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": config.SERVICE_NAME,
      "service.version": "1.0.0"
    }),
    traceExporter: new ConsoleSpanExporter()
  });
  telemetrySdk.start();
  sdkStarted = true;
}

export async function shutdownTelemetrySdk(): Promise<void> {
  if (!telemetrySdk) {
    return;
  }
  await telemetrySdk.shutdown();
}

export function isTraceContextShape(value: string): boolean {
  return /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(value) &&
    !value.includes("00000000000000000000000000000000") &&
    !value.includes("0000000000000000");
}

export function runManualTraceWork(input: TraceWorkInput): TraceWorkResult {
  const tracer = trace.getTracer("platform-observability-kubernetes-lab");
  return tracer.startActiveSpan("simulate.trace_work", (span) => {
    span.setAttribute("operation.name", input.operationName);
    span.setAttribute("signal.kind", "trace");
    span.addEvent("trace_work.started");
    for (let step = 0; step < input.steps; step += 1) {
      const childSpan = tracer.startSpan("simulate.trace_work.step", undefined, context.active());
      childSpan.setAttribute("operation.name", "trace_work_step");
      childSpan.setAttribute("step.index", step);
      childSpan.end();
    }
    span.setStatus({ code: SpanStatusCode.OK });
    const spanContext = span.spanContext();
    const traceparent = "00-" + spanContext.traceId + "-" + spanContext.spanId + "-01";
    span.end();
    traceWorkTotal.inc({ operation_name: input.operationName, result: "ok" });
    return {
      operationName: input.operationName,
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceparent,
      steps: input.steps
    };
  });
}
```
</div>

#### `src/platform/alert-rule-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/platform/alert-rule-check.ts</span>
  </div>

```ts
export type AlertRuleShape = {
  alert?: string;
  expr?: string;
  for?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

export function alertRuleHasRunbook(rule: AlertRuleShape): boolean {
  return Boolean(rule.alert && rule.expr && rule.for && rule.annotations?.runbook);
}
```
</div>

#### `src/platform/kubernetes-model.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/platform/kubernetes-model.ts</span>
  </div>

```ts
export const kubernetesModel = {
  namespace: "platform-observability-kubernetes-lab",
  workload: "Deployment",
  podRole: "api",
  serviceType: "ClusterIP",
  probes: {
    liveness: "/v1/health/live",
    readiness: "/v1/health/ready",
    startup: "/v1/health/startup"
  },
  resources: {
    requests: {
      cpu: "100m",
      memory: "128Mi"
    },
    limits: {
      cpu: "500m",
      memory: "512Mi"
    }
  },
  boundaries: [
    "Static manifests are learning artifacts",
    "No real cluster deployment is claimed",
    "Secret values are placeholders",
    "Ingress is a future boundary"
  ]
};
```
</div>

#### `src/platform/manifest-check.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/platform/manifest-check.ts</span>
  </div>

```ts
export type ManifestCheck = {
  hasProbes: boolean;
  hasResourceRequests: boolean;
  hasResourceLimits: boolean;
  serviceSelectorMatches: boolean;
};

export function manifestCheckPassed(check: ManifestCheck): boolean {
  return check.hasProbes && check.hasResourceRequests && check.hasResourceLimits && check.serviceSelectorMatches;
}
```
</div>

#### `src/platform/platform.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/platform/platform.routes.ts</span>
  </div>

```ts
import type { Router } from "express";
import { Router as createRouter } from "express";
import { kubernetesModel } from "./kubernetes-model.js";
import { runbook } from "./runbook.js";

export function createPlatformRouter(): Router {
  const router = createRouter();

  router.get("/runbook", (_request, response) => {
    response.json({ runbook });
  });

  router.get("/kubernetes-model", (_request, response) => {
    response.json(kubernetesModel);
  });

  return router;
}
```
</div>

#### `src/platform/runbook.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/platform/runbook.ts</span>
  </div>

```ts
export type RunbookEntry = {
  alertName: string;
  symptom: string;
  firstChecks: string[];
  avoid: string[];
};

export const runbook: RunbookEntry[] = [
  {
    alertName: "HighHttpErrorBudgetBurn",
    symptom: "User-visible HTTP failures are consuming the error budget.",
    firstChecks: ["Check /v1/slo/report", "Check recent 5xx route patterns", "Inspect dependency readiness"],
    avoid: ["Do not page on each raw error", "Do not add user identifiers to metric labels"]
  },
  {
    alertName: "HighLatencyP95",
    symptom: "The p95 request duration is above the demo latency SLO.",
    firstChecks: ["Check route pattern histogram buckets", "Check event loop delay", "Check upstream dependency latency"],
    avoid: ["Do not use raw URLs as labels", "Do not hide slow requests behind liveness"]
  },
  {
    alertName: "DependencyReadinessFailing",
    symptom: "A required dependency is failing readiness checks.",
    firstChecks: ["Check PostgreSQL readiness", "Check Redis readiness", "Check network service names"],
    avoid: ["Do not move dependency checks into liveness", "Do not restart on external dependency failure"]
  },
  {
    alertName: "HighEventLoopDelay",
    symptom: "The Node event loop is delayed by CPU pressure or synchronous work.",
    firstChecks: ["Check CPU limits", "Inspect synchronous handlers", "Reduce blocking simulation load"],
    avoid: ["Do not assume more replicas fix blocking code", "Do not use worker_threads for ordinary I/O"]
  }
];
```
</div>

#### `src/redis/redis-client.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/redis/redis-client.ts</span>
  </div>

```ts
import { createClient } from "redis";
import type { AppConfig } from "../config/env.js";

export function createRedisClient(config: Pick<AppConfig, "REDIS_URL">) {
  return createClient({ url: config.REDIS_URL });
}
```
</div>

#### `src/redis/redis-health.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/redis/redis-health.ts</span>
  </div>

```ts
export { createRedisProbe } from "../dependencies/redis.js";
```
</div>

#### `src/shared/errors/error-middleware.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/shared/errors/error-middleware.ts</span>
  </div>

```ts
export { errorHandler } from "../problem.js";
```
</div>

#### `src/shared/errors/http-error.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/shared/errors/http-error.ts</span>
  </div>

```ts
export { PublicProblem as HttpError } from "../problem.js";
```
</div>

#### `src/shared/errors/problem-details.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/shared/errors/problem-details.ts</span>
  </div>

```ts
export type { ProblemDetails } from "../problem.js";
export { problemResponse } from "../problem.js";
```
</div>

#### `src/shared/middleware/not-found.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/shared/middleware/not-found.ts</span>
  </div>

```ts
export { notFoundHandler } from "../problem.js";
```
</div>

#### `src/shared/middleware/request-id.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/shared/middleware/request-id.ts</span>
  </div>

```ts
export { requestContextMiddleware } from "../../observability/request-context.js";
```
</div>

#### `src/shared/problem.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/shared/problem.ts</span>
  </div>

```ts
import type { ErrorRequestHandler, Request, Response } from "express";
import { ZodError } from "zod";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
};

export class PublicProblem extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function problemResponse(request: Request, problem: PublicProblem): ProblemDetails {
  return {
    type: "about:blank",
    title: problem.code,
    status: problem.status,
    detail: problem.message,
    instance: request.originalUrl,
    code: problem.code
  };
}

export function notFoundHandler(request: Request, response: Response): void {
  const problem = new PublicProblem(404, "not_found", "Route not found");
  response.status(problem.status).json(problemResponse(request, problem));
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (response.headersSent) {
    return;
  }
  if (error instanceof ZodError) {
    const problem = new PublicProblem(400, "invalid_request", "Request validation failed");
    response.status(problem.status).json(problemResponse(request, problem));
    return;
  }
  if (error instanceof PublicProblem) {
    response.status(error.status).json(problemResponse(request, error));
    return;
  }
  const problem = new PublicProblem(500, "internal_error", "Unexpected server error");
  response.status(problem.status).json(problemResponse(request, problem));
};
```
</div>

#### `src/shared/validation/validate-request.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/shared/validation/validate-request.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (request, _response, next) => {
    request.body = schema.parse(request.body ?? {});
    next();
  };
}
```
</div>

#### `src/simulation/simulate.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/simulation/simulate.routes.ts</span>
  </div>

```ts
export { createSimulationRouter } from "../modules/simulate/simulate.routes.js";
```
</div>

#### `src/slo/slo-policy.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/slo/slo-policy.ts</span>
  </div>

```ts
export type SloPolicy = {
  name: string;
  window: string;
  availabilityTarget: number;
  latencyTargetMs: number;
  releaseGateBudgetRemainingRatio: number;
};

export const defaultSloPolicy: SloPolicy = {
  name: "api-user-visible-reliability",
  window: "rolling-local-demo",
  availabilityTarget: 0.99,
  latencyTargetMs: 500,
  releaseGateBudgetRemainingRatio: 0.25
};
```
</div>

#### `src/slo/slo.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/slo/slo.routes.ts</span>
  </div>

```ts
import type { Router } from "express";
import { Router as createRouter } from "express";
import type { createSloStore } from "./slo.service.js";

export function createSloRouter(sloStore: ReturnType<typeof createSloStore>): Router {
  const router = createRouter();

  router.get("/policy", (_request, response) => {
    response.json(sloStore.policy);
  });

  router.get("/report", (_request, response) => {
    response.json(sloStore.report());
  });

  return router;
}
```
</div>

#### `src/slo/slo.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/slo/slo.service.ts</span>
  </div>

```ts
import { sloBudgetRemainingRatio, sloComplianceRatio } from "../observability/metrics.js";
import { defaultSloPolicy, type SloPolicy } from "./slo-policy.js";

export type RequestSample = {
  ok: boolean;
  durationMs: number;
  observedAt: string;
};

export type SloReport = {
  policy: SloPolicy;
  sampleCount: number;
  availabilityRatio: number;
  latencyComplianceRatio: number;
  errorBudgetSpentRatio: number;
  errorBudgetRemainingRatio: number;
  releaseDecision: "continue" | "investigate";
};

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 1;
  }
  return numerator / denominator;
}

export function calculateSloReport(samples: RequestSample[], policy: SloPolicy = defaultSloPolicy): SloReport {
  const total = samples.length;
  const successful = samples.filter((sample) => sample.ok).length;
  const latencyGood = samples.filter((sample) => sample.durationMs <= policy.latencyTargetMs).length;
  const availabilityRatio = ratio(successful, total);
  const latencyComplianceRatio = ratio(latencyGood, total);
  const allowedFailureRatio = 1 - policy.availabilityTarget;
  const actualFailureRatio = 1 - availabilityRatio;
  const errorBudgetSpentRatio = allowedFailureRatio === 0 ? 1 : Math.min(1, actualFailureRatio / allowedFailureRatio);
  const errorBudgetRemainingRatio = Math.max(0, 1 - errorBudgetSpentRatio);
  const releaseDecision = errorBudgetRemainingRatio < policy.releaseGateBudgetRemainingRatio ? "investigate" : "continue";

  sloComplianceRatio.set({ slo_name: policy.name }, availabilityRatio);
  sloBudgetRemainingRatio.set({ slo_name: policy.name }, errorBudgetRemainingRatio);

  return {
    policy,
    sampleCount: total,
    availabilityRatio,
    latencyComplianceRatio,
    errorBudgetSpentRatio,
    errorBudgetRemainingRatio,
    releaseDecision
  };
}

export function createSloStore(policy: SloPolicy = defaultSloPolicy) {
  const samples: RequestSample[] = [
    { ok: true, durationMs: 42, observedAt: new Date(0).toISOString() },
    { ok: true, durationMs: 80, observedAt: new Date(1).toISOString() },
    { ok: true, durationMs: 220, observedAt: new Date(2).toISOString() }
  ];

  return {
    policy,
    record(sample: Omit<RequestSample, "observedAt">): void {
      samples.push({ ...sample, observedAt: new Date().toISOString() });
      if (samples.length > 200) {
        samples.splice(0, samples.length - 200);
      }
    },
    report(): SloReport {
      return calculateSloReport(samples, policy);
    }
  };
}
```
</div>

#### `tests/alert-rules.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/alert-rules.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import YAML from "yaml";

test("alert rules are parseable and include runbooks", async () => {
  const doc = YAML.parse(await readFile(new URL("../prometheus/alert-rules.yml", import.meta.url), "utf8")) as any;
  assert.ok(Array.isArray(doc.groups));
  const rules = doc.groups.flatMap((group: any) => group.rules);
  assert.ok(rules.length >= 4);
  for (const rule of rules) {
    assert.ok(rule.alert);
    assert.ok(rule.expr);
    assert.ok(rule.annotations.runbook);
  }
});
```
</div>

#### `tests/api.integration.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/api.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/api/app.js";
import { loadConfig } from "../src/config/env.js";

function readyProbe(name: string) {
  return {
    name,
    check: async () => ({ name, ready: true, latencyMs: 0, message: "ok" }),
    close: async () => {}
  };
}

test("serves public platform endpoints", async () => {
  const application = createApp({
    config: loadConfig({ NODE_ENV: "test", SKIP_DEPENDENCY_CHECKS: "true" }),
    probes: [readyProbe("postgres"), readyProbe("redis")]
  });

  await request(application.app).get("/v1/health/live").expect(200);
  await request(application.app).get("/v1/health/startup").expect(200);
  await request(application.app).get("/v1/simulate/ok").expect(200);
  await request(application.app).get("/v1/simulate/error").expect(503).expect((response) => {
    assert.equal(response.body.code, "simulated_error");
    assert.equal(Object.prototype.hasOwnProperty.call(response.body, "stack"), false);
  });
  await request(application.app).get("/v1/platform/runbook").expect(200);
  await application.close();
});
```
</div>

#### `tests/env.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/env.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config/env.js";

test("loads default platform config", () => {
  const config = loadConfig({});
  assert.equal(config.PORT, 3040);
  assert.equal(config.CORS_ORIGIN, "http://localhost:8080");
  assert.equal(config.SKIP_DEPENDENCY_CHECKS, false);
});
```
</div>

#### `tests/health.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/health.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import { createHealthService } from "../src/health/health.service.js";

test("startup health moves from starting to started after grace period", async () => {
  const healthService = createHealthService({ STARTUP_GRACE_MS: 30 }, []);
  assert.equal(healthService.startup().status, "starting");
  await wait(40);
  assert.equal(healthService.startup().status, "started");
});
```
</div>

#### `tests/kubernetes-manifest.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/kubernetes-manifest.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { validateKubernetesManifests } from "../scripts/k8s-check.js";

test("validates static Kubernetes manifests", async () => {
  const result = await validateKubernetesManifests();
  assert.deepEqual(result.resources.sort(), ["ConfigMap", "Deployment", "Namespace", "Secret", "Service"].sort());
});
```
</div>

#### `tests/logging.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/logging.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { redactLogFields } from "../src/observability/logger.js";

test("redacts sensitive structured log fields", () => {
  const output = redactLogFields({
    requestId: "req-1",
    authorization: "Bearer token",
    password: "secret",
    email: "person@example.test"
  });
  assert.equal(output.requestId, "req-1");
  assert.equal(output.authorization, "[Redacted]");
  assert.equal(output.password, "[Redacted]");
  assert.equal(output.email, "[Redacted]");
});
```
</div>

#### `tests/metrics.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/metrics.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeMetricLabels, registry } from "../src/observability/metrics.js";

test("accepts low-cardinality metric labels", () => {
  assert.doesNotThrow(() => assertSafeMetricLabels({
    method: "GET",
    route: "/v1/health/ready",
    status_class: "2xx"
  }));
});

test("rejects high-cardinality metric labels", () => {
  assert.throws(() => assertSafeMetricLabels({ trace_id: "abc" }));
  assert.throws(() => assertSafeMetricLabels({ request_id: "abc" }));
});

test("exports Prometheus text", async () => {
  const text = await registry.metrics();
  assert.match(text, /http_requests_total/);
});
```
</div>

#### `tests/readiness.integration.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/readiness.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/api/app.js";
import { loadConfig } from "../src/config/env.js";

function probe(name: string, ready: boolean) {
  return {
    name,
    check: async () => ({ name, ready, latencyMs: 0, message: ready ? "ok" : "unavailable" }),
    close: async () => {}
  };
}

test("ready endpoint succeeds when dependencies are ready", async () => {
  const application = createApp({
    config: loadConfig({ NODE_ENV: "test", SKIP_DEPENDENCY_CHECKS: "true" }),
    probes: [probe("postgres", true), probe("redis", true)]
  });
  await request(application.app).get("/v1/health/ready").expect(200);
  await application.close();
});

test("ready endpoint fails when a dependency is unavailable", async () => {
  const application = createApp({
    config: loadConfig({ NODE_ENV: "test", SKIP_DEPENDENCY_CHECKS: "true" }),
    probes: [probe("postgres", false), probe("redis", true)]
  });
  await request(application.app).get("/v1/health/ready").expect(503);
  await application.close();
});
```
</div>

#### `tests/slo.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/slo.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { calculateSloReport } from "../src/slo/slo.service.js";
import { defaultSloPolicy } from "../src/slo/slo-policy.js";

test("calculates error budget decision", () => {
  const report = calculateSloReport([
    { ok: true, durationMs: 20, observedAt: new Date(0).toISOString() },
    { ok: true, durationMs: 30, observedAt: new Date(1).toISOString() },
    { ok: false, durationMs: 40, observedAt: new Date(2).toISOString() }
  ], defaultSloPolicy);
  assert.equal(report.sampleCount, 3);
  assert.equal(report.releaseDecision, "investigate");
  assert.ok(report.errorBudgetRemainingRatio >= 0);
});
```
</div>

#### `tests/tracing.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tests/tracing.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { isTraceContextShape, runManualTraceWork, startTelemetrySdk } from "../src/observability/tracing.js";

test("validates traceparent shape", () => {
  assert.equal(isTraceContextShape("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"), true);
  assert.equal(isTraceContextShape("00-00000000000000000000000000000000-00f067aa0ba902b7-01"), false);
});

test("creates manual trace work result", () => {
  startTelemetrySdk({ SERVICE_NAME: "platform-observability-kubernetes-lab-test" });
  const result = runManualTraceWork({ operationName: "unit-trace-work", steps: 2 });
  assert.match(result.traceId, /^[0-9a-f]{32}$/);
  assert.match(result.spanId, /^[0-9a-f]{16}$/);
  assert.equal(isTraceContextShape(result.traceparent), true);
});
```
</div>

#### `tsconfig.json`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">tsconfig.json</span>
  </div>

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "rootDir": ".",
    "outDir": "dist",
    "types": [
      "node"
    ]
  },
  "include": [
    "src/**/*.ts",
    "scripts/**/*.ts",
    "tests/**/*.ts"
  ]
}
```
</div>

## 15. 知识迁移与真实项目场景

在真实项目里，Chapter 16 的知识会进入 pull request review、release checklist、incident triage、dashboard design 和 platform handoff。迁移时不要先问“用哪个平台”，先问用户可见 SLI 是什么、trace context 如何传播、metric labels 是否可控、Secret 是否泄漏、shutdown 是否在 orchestrator grace window 内完成。

## 16. 本章复盘任务

1. 解释为什么 observability 不等于 logging。
2. 用一个请求说明 requestId、correlationId、traceId、spanId 的不同职责。
3. 说明为什么 readiness 可以检查 PostgreSQL/Redis，而 liveness 不应该。
4. 写出一个会造成 high-cardinality 的 metric label，并说明违反的规则。
5. 根据 SLO report 判断 release decision 应该是 continue 还是 investigate。
6. 读 `k8s/deployment.yaml`，说明 requests、limits、startupProbe、terminationGracePeriodSeconds 分别影响什么。

## 17. 最终心智模型

生产级 Node.js 服务不是“能启动”的程序，而是一个可被证据解释的 runtime：请求进入 Express，middleware 建立 context，metrics 聚合低基数事实，traces 连接路径，logs 保存安全事件，SLO 给出目标，alerts 决定行动，probes 控制 traffic 和 restart，resources 改变 CPU/memory 行为，SIGTERM 驱动 graceful shutdown。

## 18. 官方资料

- https://nodejs.org/api/process.html
- https://nodejs.org/api/perf_hooks.html
- https://nodejs.org/api/http.html
- https://nodejs.org/api/test.html
- https://opentelemetry.io/docs/concepts/observability-primer/
- https://opentelemetry.io/docs/languages/js/instrumentation/
- https://prometheus.io/docs/practices/naming/
- https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
- https://prometheus.io/docs/alerting/latest/alertmanager/
- https://sre.google/sre-book/service-level-objectives/
- https://sre.google/sre-book/embracing-risk/
- https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- https://kubernetes.io/docs/concepts/services-networking/service/
- https://docs.docker.com/compose/how-tos/startup-order/
- https://docs.docker.com/reference/dockerfile/
- https://nginx.org/en/docs/http/ngx_http_proxy_module.html
- https://expressjs.com/en/guide/error-handling.html
- https://docs.npmjs.com/cli/v11/configuring-npm/package-json

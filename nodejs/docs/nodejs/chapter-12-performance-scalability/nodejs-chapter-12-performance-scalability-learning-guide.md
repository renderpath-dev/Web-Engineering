# Node.js 第 12 章：性能工程、负载测试、事件循环延迟、内存、CPU 密集任务、连接池、背压、Worker Threads、Cluster 与容量边界

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

> 适用版本：Node.js 26.x；npm 11.x；TypeScript 7.x；Express 5.x；Prisma 7.x；Redis node-redis 6.x；Docker Compose v5.x。Chapter 12 承接 Chapter 11 已验证的 Docker Compose、PostgreSQL、Redis、API、NGINX 与 smoke test 基线。
>
> 本章边界：本章讨论性能工程与容量判断，不重新教学 Docker Desktop、WSL、PostgreSQL、Redis、NGINX 安装，也不引入 Kubernetes、Terraform、service mesh、vendor APM 或 frontend performance。

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
  - [9.1 性能工程不是随机优化](#section-9-1)
  - [9.2 延迟、吞吐量、并发、饱和度、容量与百分位指标](#section-9-2)
  - [9.3 Smoke test、integration test、benchmark、load test、stress test、soak test](#section-9-3)
  - [9.4 通过 NGINX 做基线压测，而不是绕过生产入口](#section-9-4)
  - [9.5 `perf_hooks`：event loop delay 与 event loop utilization](#section-9-5)
  - [9.6 CPU-bound work 为什么会阻塞 Node request handler](#section-9-6)
  - [9.7 Worker Threads：把 CPU 密集任务移出主事件循环](#section-9-7)
  - [9.8 Worker pool、message passing、structured clone 与 transfer boundary](#section-9-8)
  - [9.9 Cluster：多进程 HTTP 扩展边界](#section-9-9)
  - [9.10 Worker Threads vs Cluster vs child_process](#section-9-10)
  - [9.11 内存使用：RSS、heapUsed、external、arrayBuffers](#section-9-11)
  - [9.12 V8 heap statistics、heap snapshot 与 heap profiling 边界](#section-9-12)
  - [9.13 Express hot path、middleware overhead 与同步代码风险](#section-9-13)
  - [9.14 JSON payload、body parser、request size 与 CPU/内存压力](#section-9-14)
  - [9.15 Streams 与 backpressure 在性能中的作用](#section-9-15)
  - [9.16 Prisma Client reuse、connection pool 与 database saturation](#section-9-16)
  - [9.17 Query count、N+1、query duration 与 repository performance](#section-9-17)
  - [9.18 Redis pipelining、round-trip cost 与 cache hit/miss interpretation](#section-9-18)
  - [9.19 Rate limiting、auth/session hot path 与 load behavior](#section-9-19)
  - [9.20 Container CPU/memory limit、Docker stats 与 runtime capacity](#section-9-20)
  - [9.21 Regression benchmark、performance budget 与 capacity checklist](#section-9-21)
  - [9.22 Chapter integration: performance-notes-api](#section-9-22)
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
| 建立 NGINX 压测入口 | `practices/12-performance-scalability/02-load-testing/nginx-load-target.ts` | target defaults to localhost:8080 |
| 采样 event loop delay | `practices/12-performance-scalability/03-event-loop-cpu/event-loop-delay-monitor.ts` | monitorEventLoopDelay signal |
| 对比 sync CPU 与 worker CPU | `mini-projects/performance-notes-api/src/modules/performance/cpu-task.service.ts` | mode is sync or worker |
| 观察 stream backpressure | `mini-projects/performance-notes-api/src/modules/performance/stream-report.service.ts` | drains and bytesWritten |
| 观察 Prisma query duration | `mini-projects/performance-notes-api/src/db/query-metrics.ts` | db_query_duration_seconds |
| 观察 Redis pipeline RTT | `mini-projects/performance-notes-api/src/redis/redis-performance.ts` | sequentialDurationMs vs pipelineDurationMs |
| 验证生产式入口 | `mini-projects/performance-notes-api/scripts/smoke-test.ts` | live and ready through localhost:8080 |

## 0. 章前定位

Chapter 12 的主问题是：API 能运行，但负载一上来就变慢或不稳定，如何不猜测地找出瓶颈、修复正确层，并证明改善。前 11 章已经给出 runtime、streams、HTTP、TypeScript、Prisma、auth、Redis、uploads、realtime、observability 与 Docker runtime 基线；本章只把这些机制组合成性能工程流程。

## 1. 学习目标

- 能区分 smoke test、integration test、benchmark、load test、stress test 与 soak test。
- 能通过 NGINX 入口建立 baseline，而不是直接打内部 API port。
- 能读 event loop delay、event loop utilization、memoryUsage、V8 heap statistics、HTTP latency、query duration、Redis RTT 和 Docker stats。
- 能判断 CPU、heap、stream、database pool、Redis round trip、middleware hot path 与 container capacity 的负责层。
- 能把 CPU-bound work 移入 Worker Threads，并解释 Worker Threads 与 Cluster 的边界。
- 能用 regression benchmark 和 performance budget 防止性能退化。

## 2. 前置知识

你需要已经理解 JavaScript 同步执行、Promise、Node event loop、Express middleware、Stream backpressure、TypeScript 编译边界、Prisma repository、Redis cache、Pino logs、Prometheus metrics、Docker Compose 和 NGINX reverse proxy。本章只在性能上下文中连接这些知识。

## 3. 环境与运行基线

本章默认本地有 Node.js 26、npm 11、Docker Desktop、Docker Compose、PostgreSQL 18、Redis 8 和 NGINX Compose 服务。Chapter 11 已验证 runtime stack；Chapter 12 的 baseline 命令围绕 `mini-projects/performance-notes-api`。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm install
npm run prisma:generate
npm run typecheck
npm run build
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm run smoke
npm run load:baseline
```
</div>

这些命令不是部署教程，而是建立同一入口、同一依赖、同一测量窗口的学习基线。

## 4. 第一性原理

性能工程先回答“慢在哪里”，再回答“改什么”。请求变慢一定有资源边界：主线程、event loop、V8 heap、socket、stream buffer、database connection、Redis RTT、proxy upstream、container CPU/memory 或测试入口本身。随机优化的问题是它跳过了测量与归因，所以不能证明改善。

## 5. 技术边界模型

| Layer | 本章责任 | 常见误解 |
| --- | --- | --- |
| TypeScript | 检查输入输出类型、脚本编译与测试类型 | 以为类型能证明运行时容量 |
| Node runtime / V8 | 执行 JavaScript、heap、Worker Threads | 把异步 I/O 和 CPU parallelism 混为一谈 |
| libuv / event loop | 调度 I/O 回调并暴露主线程阻塞症状 | 只看 CPU 而忽略 event loop delay |
| Express | middleware hot path、body parser、route completion | 把每个 middleware 当成免费 |
| Prisma / database | query count、pool saturation、query duration | 每个请求新建 Prisma Client |
| Redis | command RTT、pipeline、cache hit/miss | 认为 pipeline 永远有通用加速 |
| Docker / NGINX | 入口、upstream、container resource signals | 绕过 NGINX 做容量结论 |

## 6. 底层机制模型

请求从 load source 到 NGINX，再到 API container。Express middleware 写入 request id、security headers、rate limit、body parse、request log 和 metrics。业务 handler 可能访问 Prisma、Redis、Worker 或 Stream。性能证据必须绑定同一条链：入口、负载、信号、候选瓶颈、修复、复测。

## 7. 核心术语

| Concept | Layer | Meaning | Common Mistake |
| --- | --- | --- | --- |
| latency | client/proxy/API | 单个请求完成时间 | 只看 average |
| throughput | system capacity | 单位时间完成请求数 | 忽略 error 与 timeout |
| saturation | resource boundary | 资源接近上限 | 不看 queue 或 tail latency |
| event loop delay | Node runtime | callback 被延迟执行的时间 | 把它等同于 CPU percentage |
| pool saturation | database/client | 连接不足导致排队 | 无限增加 pool size |
| backpressure | stream model | 写入方必须等待下游消化 | 忽略 `write()` 返回值 |

## 8. 本章实践路线

先用小 practice 文件建立概念模型，再用 `performance-notes-api` 把 HTTP、metrics、Prisma、Redis、Worker、Stream、Docker signals 串起来。每个练习都要求先观察信号，再判断负责层。

## 9. 核心教学

本章的 22 个核心小节只保留 section-specific code、section-specific command 和 section-specific mechanism chain。每个代码块要么来自真实 practice 文件，要么来自最终 mini project 的真实文件；如果一个段落不能点名本节的函数、字段、API、资源或观察信号，就不放进核心教学。

<a id="section-9-1"></a>

### 9.1 性能工程不是随机优化

**结论：** 性能优化的第一步不是改代码，而是把 route、loadProfile、measuredSignal、hypothesis、changedLayer 和 verificationSignal 固定下来。

**本节解决的问题：** 没有 baseline 时，缓存、Worker、SQL、NGINX timeout 或 container limit 的任何变化都会混在一起，无法证明因果。

**技术意义：** 本节把性能工作建模为一次可复验实验：先观察，后假设，再只改一个层，最后用同一信号验证。

**概念解释：** `BaselineExperiment` 把入口、负载、信号和假设放进同一个对象；`changedLayer: "none"` 表示当前只建立基线。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查字段是否存在；真正的延迟、吞吐量和错误率由 NGINX、Express、Node runtime、数据库、Redis 和容器共同产生。

**底层机制：** 请求从 `route` 进入，`loadProfile` 决定施压形态，`measuredSignal` 决定观察点，`changedLayer` 限制修改面，`verificationSignal` 规定验收条件。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/01-performance-model/performance-engineering-vs-random-optimization.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 ``latencyP95``，入口或触发点是 ``/health/ready``，负载或执行来源是 ``npm run load:baseline``。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/01-performance-model/performance-engineering-vs-random-optimization.ts`，围绕 `BaselineExperiment`、`loadProfile`、`measuredSignal`、`planBaselineExperiment()` 说明 baseline experiment object 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/01-performance-model/performance-engineering-vs-random-optimization.ts</span>
  </div>

```ts

export interface BaselineExperiment {
  route: string;
  loadProfile: {
    concurrency: number;
    totalRequests: number;
  };
  measuredSignal: "latencyP95" | "requestsPerSecond" | "errors" | "eventLoopDelay";
  hypothesis: string;
  changedLayer: "none" | "nginx" | "express" | "node-runtime" | "database" | "redis" | "container";
  verificationSignal: string;
}

export function planBaselineExperiment(route: string): BaselineExperiment {
  return {
    route,
    loadProfile: {
      concurrency: 5,
      totalRequests: 80
    },
    measuredSignal: "latencyP95",
    hypothesis: "ready check should stay below the local budget through nginx",
    changedLayer: "none",
    verificationSignal: "same route, same load profile, no errors"
  };
}
```
</div>

**逐行解释：** `BaselineExperiment` 定义实验字段；`loadProfile` 固定 concurrency 和 totalRequests；`measuredSignal` 限定只能观察一个主信号；`planBaselineExperiment()` 生成未改动前的 baseline；`verificationSignal` 说明复测必须保持相同入口和负载。

**运行方式：** 在 `D:\node.js` 运行 `node --import tsx practices/12-performance-scalability/01-performance-model/performance-engineering-vs-random-optimization.ts` 阅读导出结构；在 mini project 中用 `npm run load:baseline` 产生实际 baseline。

**预期输出：** 得到包含 `route`、`loadProfile`、`measuredSignal`、`hypothesis`、`changedLayer` 和 `verificationSignal` 的 baseline 模型。

**执行过程：** 先调用 `planBaselineExperiment('/health/ready')`，再把返回对象作为后续 benchmark 的前置说明；此时不打开数据库连接、不改代码、不改变 Docker 配置。

**变量、引用、资源与生命周期变化：** `route` 和 `loadProfile` 是实验输入；`changedLayer` 从 `none` 变为具体层时才代表一次修复尝试；`verificationSignal` 在复测后被用来判断变化是否成立。

**为什么会得到这个结果：** 同一入口和同一负载让 measuredSignal 可比较；如果同时改多个层，任何结果都无法归因。

**对比情况：** 正确做法是一次只改 `nginx`、`express`、`database` 等一个层；错误做法是还没测 baseline 就同时调 pool、加 cache、加 worker。

**常见错误为什么错：** 把“感觉变快”当成证据，违反了性能结论必须绑定可重复测量窗口的规则。

**与真实项目的关系：** 真实后端的发布门禁会保存 baseline，并要求同一脚本在同一入口下复测。

**与当前学习路径的关系：** 连接 Chapter 10 observability 的信号思维和 Chapter 11 Compose/NGINX 的生产式入口。

**最终记忆模型：** 先锁定实验边界，再讨论优化手段。

**机制证据链：** The table connects the ready-check route to the unchanged baseline layer and the later verification signal.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``/health/ready`` | ``npm run load:baseline`` | `latencyP95` | NGINX -> Express -> dependency check | unknown before hypothesis | change one layer only | same signal improves | change several layers together | baseline object cannot name the responsible layer |

<a id="section-9-2"></a>

### 9.2 延迟、吞吐量、并发、饱和度、容量与百分位指标

**结论：** 平均值不能代表尾部请求；p95 和 p99 通过排序样本保留了排队和饱和造成的尾部延迟。

**本节解决的问题：** 如果只看 average，少量慢请求会被大量快请求稀释，容量边界会被隐藏。

**技术意义：** 本节把 latency samples 转成 `average`、`p50`、`p95`、`p99`，让吞吐量和尾延迟分开讨论。

**概念解释：** `summarizeLatency()` 先排序，再用 `percentile()` 取分位点；`averageHidesTail()` 用 p95 与 average 的比例识别尾部风险。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** 排序和计算是 JavaScript runtime 行为；样本来源可能是 NGINX、fetch loop、autocannon 或日志，TypeScript 不证明样本是否代表真实流量。

**底层机制：** 每个请求完成后产生一个 latency number；数组排序后，p95 取靠近尾部的位置，因此排队请求不会被平均值抹掉。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/01-performance-model/percentile-latency-model.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 ``average`, `p95`, `p99``，入口或触发点是 ``/health/ready``，负载或执行来源是 `sampled fetch loop`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/01-performance-model/percentile-latency-model.ts`，围绕 `samples`、`sorted`、`percentile(sorted, 95)`、`total / sorted.length` 说明 percentile latency calculation 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/01-performance-model/percentile-latency-model.ts</span>
  </div>

```ts

export interface LatencySummary {
  average: number;
  p50: number;
  p95: number;
  p99: number;
}

function percentile(sortedValues: number[], percentileValue: number): number {
  const index = Math.ceil((percentileValue / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

export function summarizeLatency(samples: number[]): LatencySummary {
  if (samples.length === 0) {
    throw new RangeError("At least one latency sample is required");
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const total = sorted.reduce((sum, value) => sum + value, 0);

  return {
    average: Number((total / sorted.length).toFixed(3)),
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99)
  };
}

export function averageHidesTail(summary: LatencySummary): boolean {
  return summary.p95 > summary.average * 2;
}
```
</div>

**逐行解释：** `samples` 是原始延迟；`sorted` 避免改变调用方数组；`percentile(sorted, 95)` 读取尾部常见延迟；`total / sorted.length` 只计算平均值；`averageHidesTail()` 明确比较 p95 和 average。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/01-performance-model/percentile-latency-model.ts`，或在 `scripts/load-baseline.ts` 中查看 `summarizeLatencies()` 的实际调用。

**预期输出：** 输出包含 `average`、`p50`、`p95`、`p99`；当 p95 明显高于 average，说明尾部请求正在排队。

**执行过程：** 先收集每个请求 duration，再排序，再计算分位点；没有真实样本时抛出 `RangeError`，避免空结果被误读。

**变量、引用、资源与生命周期变化：** latency sample 从请求结果变成数组元素；排序数组只在函数内部存在；summary 是后续预算判断的不可变输入。

**为什么会得到这个结果：** 饱和会让一部分请求等待更久，p95/p99 直接落在这些等待请求附近。

**对比情况：** 平均值适合看整体趋势；p95/p99 适合看用户尾部体验。二者不能互相替代。

**常见错误为什么错：** 把 RPS 上升等同于容量变好，违反了吞吐量和尾延迟必须一起看的规则。

**与真实项目的关系：** 真实 SLO 常用 p95/p99，因为用户看到的是自己的请求等待时间，不是系统平均值。

**与当前学习路径的关系：** 连接 Chapter 10 metrics histogram 和 Chapter 11 runtime readiness。

**最终记忆模型：** 吞吐量回答“每秒多少”，p95 回答“大多数慢请求有多慢”。

**机制证据链：** The table follows a request duration from raw sample to percentile summary and tail-latency recognition.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``/health/ready`` | `sampled fetch loop` | `average`, `p95`, `p99` | request completion -> JS array sort | queueing at saturated layer | reduce work at saturated layer | tail latency drops | use average only | p99 climbs while average stays acceptable |

<a id="section-9-3"></a>

### 9.3 Smoke test、integration test、benchmark、load test、stress test、soak test

**结论：** 每种测试只能支持自己的结论；smoke 证明入口可用，不证明容量。

**本节解决的问题：** 把测试类型混用会让报告夸大证据，例如 `npm run smoke` 通过后就声称性能安全。

**技术意义：** `TestType` 是 discriminated union；`testDecision()` 把每种测试映射到唯一 `allowedConclusion`。

**概念解释：** 同一项目可以有 smoke、integration、benchmark、load、stress、soak，但它们的负载窗口、依赖范围和结论不同。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** Node test runner 负责 correctness；load generator 负责并发压力；长期 soak 才观察 handle、heap、pool 和 Redis 连接漂移。

**底层机制：** `type` 作为 key 进入 `decisions`；返回的 `command` 告诉你运行什么，`allowedConclusion` 限制最终能写什么结论。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/01-performance-model/test-type-boundary.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 ``allowedConclusion``，入口或触发点是 `test command`，负载或执行来源是 ``testDecision(type)``。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/01-performance-model/test-type-boundary.ts`，围绕 `TestType`、`TestDecision`、`decisions.smoke`、`decisions.benchmark` 说明 test-type conclusion boundary 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/01-performance-model/test-type-boundary.ts</span>
  </div>

```ts

export type TestType = "smoke" | "integration" | "benchmark" | "load" | "stress" | "soak";

export interface TestDecision {
  type: TestType;
  command: string;
  allowedConclusion: string;
}

export function testDecision(type: TestType): TestDecision {
  const decisions: Record<TestType, TestDecision> = {
    smoke: {
      type,
      command: "npm run smoke",
      allowedConclusion: "the public entry can answer live and ready checks"
    },
    integration: {
      type,
      command: "npm test",
      allowedConclusion: "the app can talk to required dependencies for tested paths"
    },
    benchmark: {
      type,
      command: "npm run benchmark:budget",
      allowedConclusion: "the same workload stays inside the configured budget"
    },
    load: {
      type,
      command: "npm run load:baseline",
      allowedConclusion: "the entry handles the selected concurrency and request count"
    },
    stress: {
      type,
      command: "increase concurrency until the first bottleneck appears",
      allowedConclusion: "the first saturated layer was found"
    },
    soak: {
      type,
      command: "hold a stable load window for a long duration",
      allowedConclusion: "memory, handles, and dependency usage do not drift over time"
    }
  };

  return decisions[type];
}
```
</div>

**逐行解释：** `TestType` 限定六种合法测试；`TestDecision` 固定 command 和 allowedConclusion；`decisions.smoke` 只允许 live/ready 结论；`decisions.benchmark` 才能绑定 budget；`return decisions[type]` 防止未知测试名。

**运行方式：** 在 `D:\node.js` 查看 practice；在 mini project 中分别运行 `npm run smoke`、`npm test -- --test-concurrency=1`、`npm run benchmark:budget`。

**预期输出：** 每个输入 type 返回一个 command 和一个受限结论，不会把 smoke 误写成 capacity proof。

**执行过程：** 调用者先选择测试类型；函数返回对应命令；报告层只能使用 `allowedConclusion` 字段写结果。

**变量、引用、资源与生命周期变化：** 测试类型是输入；决策对象是解释边界；真正的测试结果来自后续命令输出。

**为什么会得到这个结果：** 不同测试的时间窗口和负载形态不同，不能证明彼此的结论。

**对比情况：** integration test 可以证明依赖路径可用；load test 才能说明某个并发窗口内延迟和错误率。

**常见错误为什么错：** 用 benchmark 替代业务断言，违反了 correctness 和 capacity 分层规则。

**与真实项目的关系：** 真实 CI 会把 smoke、integration 和 performance gate 分开失败，便于定位。

**与当前学习路径的关系：** 连接 Chapter 03 HTTP smoke、Chapter 05 database integration、Chapter 11 deployment validation。

**最终记忆模型：** 先问测试类型能证明什么，再读命令结果。

**机制证据链：** The table maps each test command to the only performance or correctness conclusion it can support.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `test command` | ``testDecision(type)`` | `allowedConclusion` | Node test runner or load process | wrong test selected | run matching test type | reported conclusion matches command | smoke used as load test | report claims more than command measured |

<a id="section-9-4"></a>

### 9.4 通过 NGINX 做基线压测，而不是绕过生产入口

**结论：** 生产式本地入口是 `http://localhost:8080`，直接打 `localhost:3020` 会绕过 NGINX。

**本节解决的问题：** 本节解决压测入口错误的问题：如果脚本直接请求 `localhost:3020`，测试会绕过 NGINX，容量结论不能代表 production-like Compose 入口。

**技术意义：** 这个入口选择决定压测是否覆盖 proxy headers、NGINX timeout、container network 和 API handler；绕过其中任何一层，报告只能证明局部路径。

**概念解释：** `chooseLoadTarget()` 默认读取 `LOAD_BASE_URL` 或 `http://localhost:8080`；它显式拒绝 `3020`，并把 `boundary` 标成 `api-container`。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `chooseLoadTarget()` parses a URL string; the production-like network boundary is host -> NGINX -> API, so targeting `3020` bypasses proxy behavior.

**底层机制：** `chooseLoadTarget()` 默认读取 `LOAD_BASE_URL` 或 `http://localhost:8080`；它显式拒绝 `3020`，并把 `boundary` 标成 `api-container`。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/02-load-testing/nginx-load-target.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `target boundary`，入口或触发点是 ``http://localhost:8080/health/ready``，负载或执行来源是 ``npm run load:baseline``。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/02-load-testing/nginx-load-target.ts`，围绕 `normalized`、`if`、`localhost:3020`、`127.0.0.1:3020` 说明 NGINX load target selection 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/02-load-testing/nginx-load-target.ts</span>
  </div>

```ts

export interface LoadTargetDecision {
  baseUrl: string;
  accepted: boolean;
  boundary: "nginx" | "api-container" | "unknown";
  message: string;
}

export function chooseLoadTarget(baseUrl = process.env.LOAD_BASE_URL ?? "http://localhost:8080"): LoadTargetDecision {
  const normalized = baseUrl.replace(/\/$/, "");

  if (normalized === "http://localhost:3020" || normalized === "http://127.0.0.1:3020") {
    return {
      baseUrl: normalized,
      accepted: false,
      boundary: "api-container",
      message: "Load tests must use the nginx entry at http://localhost:8080"
    };
  }

  return {
    baseUrl: normalized,
    accepted: normalized === "http://localhost:8080" || normalized === "http://127.0.0.1:8080",
    boundary: normalized.includes(":8080") ? "nginx" : "unknown",
    message: "The selected target should represent the production entry boundary"
  };
}
```
</div>

**逐行解释：** `normalized` 去掉尾部 slash；`if` 分支识别 `localhost:3020` 和 `127.0.0.1:3020`；返回对象的 `accepted:false` 阻止错误入口；`boundary:"nginx"` 表示 8080 经过代理层。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/02-load-testing/nginx-load-target.ts` 阅读导出函数；实际验证用 `npm run smoke` 和 `npm run load:baseline`。

**预期输出：** `chooseLoadTarget()` accepts `http://localhost:8080`, rejects `http://localhost:3020`, and returns a decision object with `boundary` and `message`.

**执行过程：** Read `LOAD_BASE_URL` or the default, normalize the trailing slash, reject the API container port, and mark the accepted path as `nginx`.

**变量、引用、资源与生命周期变化：** The base URL starts as an environment value; `normalized` becomes the comparison key; the returned decision controls whether the load command is valid.

**为什么会得到这个结果：** The result follows from the deployment boundary: the host port `8080` includes NGINX headers, buffering, timeout, and upstream behavior.

**对比情况：** Testing `8080` validates the composed stack; testing `3020` validates only the API process and hides proxy mistakes.

**常见错误为什么错：** Pointing load scripts at `3020` violates the rule that production simulation traffic must enter through the reverse proxy.

**与真实项目的关系：** Teams use the same externally exposed URL in smoke and load checks so proxy regressions are visible before release.

**与当前学习路径的关系：** Chapter 11 建立 NGINX/Compose 入口，本节把它作为性能实验入口。

**最终记忆模型：** 外部压测入口看 8080；内部 API port 3020 只能证明 handler，不能证明 proxy boundary。

**机制证据链：** The table traces a load target from environment input to proxy boundary acceptance or rejection.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``http://localhost:8080/health/ready`` | ``npm run load:baseline`` | target boundary | host -> NGINX -> API | proxy bypass | reject 3020 target | scripts use 8080 | load API port directly | Compose exposes 3020 or script target is 3020 |

<a id="section-9-5"></a>

### 9.5 `perf_hooks`：event loop delay 与 event loop utilization

**结论：** `monitorEventLoopDelay` 给出纳秒级 delay histogram，`performance.eventLoopUtilization()` 给出采样窗口内 event loop busy ratio。

**本节解决的问题：** 本节解决如何区分 event loop delay 和 event loop utilization 的问题：delay 说明 callback 被推迟多久，ELU 说明采样窗口内 event loop 有多忙。

**技术意义：** 这两个信号分别解释“callback 被推迟”和“loop 时间被占用”，能把 CPU 压力、同步阻塞和普通 I/O 等待区分开。

**概念解释：** 本节使用 `performance.eventLoopUtilization()`，它从 Node v12.19/v14.10 起可用；Node v24.12/v25.2 起还提供 `perf_hooks.eventLoopUtilization` alias。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `monitorEventLoopDelay()` and `performance.eventLoopUtilization()` are Node `perf_hooks` APIs; histogram values are numbers in nanoseconds, while utilization is a delta over event-loop active time.

**底层机制：** 本节使用 `performance.eventLoopUtilization()`，它从 Node v12.19/v14.10 起可用；Node v24.12/v25.2 起还提供 `perf_hooks.eventLoopUtilization` alias。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/03-event-loop-cpu/event-loop-delay-monitor.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `delay p95 and utilization`，入口或触发点是 ``/performance/event-loop``，负载或执行来源是 `HTTP request under load`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/03-event-loop-cpu/event-loop-delay-monitor.ts`，围绕 `histogram`、`histogram.enable()`、`performance.eventLoopUtilization(previous)`、`histogram.mean / 1_000_000` 说明 event-loop delay and utilization sampling 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/03-event-loop-cpu/event-loop-delay-monitor.ts</span>
  </div>

```ts

import { performance, monitorEventLoopDelay } from "node:perf_hooks";

const histogram = monitorEventLoopDelay({ resolution: 20 });
let previous = performance.eventLoopUtilization();

export function startEventLoopSample(): void {
  histogram.enable();
}

export function readEventLoopSample() {
  const utilization = performance.eventLoopUtilization(previous);
  previous = performance.eventLoopUtilization();

  return {
    meanMs: Number(histogram.mean) / 1_000_000,
    maxMs: Number(histogram.max) / 1_000_000,
    p95Ms: histogram.percentile(95) / 1_000_000,
    utilization: utilization.utilization
  };
}

export function resetEventLoopSample(): void {
  histogram.reset();
}
```
</div>

**逐行解释：** `histogram` 保存 event loop delay；`histogram.enable()` 开始采样；`performance.eventLoopUtilization(previous)` 读取窗口差值；`histogram.mean / 1_000_000`、`histogram.max / 1_000_000`、`histogram.percentile(95) / 1_000_000` 把 nanoseconds 转为 milliseconds；`histogram.reset()` 开启新窗口。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/03-event-loop-cpu/event-loop-delay-monitor.ts`，项目内请求 `GET /performance/event-loop`。

**预期输出：** `readEventLoopSample()` returns delay mean/max/p95 in milliseconds and an ELU utilization ratio without mixing `number` and `bigint`.

**执行过程：** Create the delay histogram, call `startEventLoopSample()` to enable sampling, read number-valued histogram fields through `readEventLoopSample()`, and call `resetEventLoopSample()` before the next measurement window.

**变量、引用、资源与生命周期变化：** `histogram` owns a sampling timer while enabled; `previous` stores the last ELU baseline; the returned object is a point-in-time event-loop signal.

**为什么会得到这个结果：** The conversion works because `mean`, `max`, and `percentile(95)` return `number` nanoseconds, so dividing by `1_000_000` produces milliseconds.

**对比情况：** Delay shows how late callbacks run; ELU shows how much the loop was active instead of idle. They answer different questions.

**常见错误为什么错：** Dividing `histogram.mean` by `1_000_000n` violates JavaScript's rule against mixing `number` and `bigint` arithmetic.

**与真实项目的关系：** Production dashboards combine event-loop delay with route latency to distinguish CPU blocking from downstream dependency latency.

**与当前学习路径的关系：** Chapter 01 event loop 概念和 Chapter 10 metrics 采样在这里合并。

**最终记忆模型：** event loop delay 看“晚了多久”，ELU 看“忙了多少”；二者一起判断主线程压力。

**机制证据链：** The table connects `perf_hooks` sampling to nanosecond histogram values and the safe millisecond conversion.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``/performance/event-loop`` | `HTTP request under load` | delay p95 and utilization | Express -> perf_hooks -> event loop | main thread saturation | remove sync work or use Worker | delay/utilization drop | divide number by bigint | typecheck fails or delay value is invalid |

<a id="section-9-6"></a>

### 9.6 CPU-bound work 为什么会阻塞 Node request handler

**结论：** CPU loop 在 JavaScript 主线程同步执行；`async function` 不会把 CPU work 自动移出事件循环。

**本节解决的问题：** 本节解决为什么 CPU-heavy JavaScript 会拖慢所有请求的问题：同步 call stack 未结束前，event loop 无法调度其他 socket callback。

**技术意义：** 这个机制解释了为什么一个看似局部的 expensive calculation 会拖慢无关 route：同一 process 的 request callbacks 共享主线程。

**概念解释：** `boundedCpuLoop()` 限制 iterations，`asyncWrapperStillBlocks()` 返回 Promise 但仍先执行同步 CPU loop。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `boundedCpuLoop()` performs synchronous JavaScript arithmetic on the main thread; `asyncWrapperStillBlocks()` only wraps the already-computed return value in a promise and does not move CPU work to libuv or another thread.

**底层机制：** `boundedCpuLoop()` 限制 iterations，`asyncWrapperStillBlocks()` 返回 Promise 但仍先执行同步 CPU loop。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/03-event-loop-cpu/cpu-bound-handler-mistake.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `handler duration and ready p95`，入口或触发点是 ``/performance/cpu-sync``，负载或执行来源是 `small HTTP load`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/03-event-loop-cpu/cpu-bound-handler-mistake.ts`，围绕 `safeIterations`、`for`、`Math.sqrt()`、`asyncWrapperStillBlocks()` 说明 CPU-bound handler blocking 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/03-event-loop-cpu/cpu-bound-handler-mistake.ts</span>
  </div>

```ts

export function boundedCpuLoop(iterations: number): number {
  const safeIterations = Math.max(1, Math.min(iterations, 5_000_000));
  let total = 0;
  for (let index = 0; index < safeIterations; index += 1) {
    total = (total + Math.sqrt(index + 1)) % 1_000_000;
  }
  return Number(total.toFixed(3));
}

export async function asyncWrapperStillBlocks(iterations: number): Promise<number> {
  return boundedCpuLoop(iterations);
}
```
</div>

**逐行解释：** `safeIterations` 防止无限 work；`for` 循环占用 V8 主线程；`Math.sqrt()` 是 CPU work；`asyncWrapperStillBlocks()` 没有 `await` I/O，因此同步计算完成前事件循环不能处理其他请求。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/03-event-loop-cpu/cpu-bound-handler-mistake.ts`；项目内比较 `/performance/cpu-sync` 和 `/health/ready`。

**预期输出：** `boundedCpuLoop()` returns a rounded numeric `total`; `asyncWrapperStillBlocks()` resolves the same value only after the synchronous `for` loop has finished.

**执行过程：** Clamp `iterations` into `safeIterations`, run the `for` loop on the JavaScript main thread, update `total` with `Math.sqrt(index + 1)`, then return `Number(total.toFixed(3))`.

**变量、引用、资源与生命周期变化：** `safeIterations`, `index`, and `total` stay inside one synchronous call stack; no socket or worker resource is created; pending requests wait until the stack unwinds.

**为什么会得到这个结果：** The event loop cannot dispatch other callbacks while the CPU loop holds the JavaScript thread.

**对比情况：** An async database call yields to the event loop while I/O is pending; an async wrapper around CPU math still blocks.

**常见错误为什么错：** Adding `async` to a CPU-heavy function violates the boundary between promise syntax and actual parallel execution.

**与真实项目的关系：** Slow JSON transforms, password-like loops, and report generation can raise latency for unrelated endpoints when left on the main thread.

**与当前学习路径的关系：** Chapter 01 event loop 和 Chapter 03 request handler 在这里连接。

**最终记忆模型：** `async` changes return shape, not CPU ownership; CPU loop still blocks until call stack ends.

**机制证据链：** The table follows a CPU request from Express handler entry through the synchronous loop and the delayed callback symptom.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``/performance/cpu-sync`` | `small HTTP load` | handler duration and ready p95 | Express -> V8 CPU loop | blocking JavaScript | bound or offload CPU | ready p95 recovers | wrap loop in async | all routes slow during CPU route |

<a id="section-9-7"></a>

### 9.7 Worker Threads：把 CPU 密集任务移出主事件循环

**结论：** Worker Thread 把 CPU JavaScript 放进另一个 thread；主线程通过 message/error/exit 管理结果和失败。

**本节解决的问题：** 本节解决如何把 CPU-heavy 函数迁移到 Worker Thread 的问题：主线程只负责 dispatch、timeout、message/error/exit 归并。

**技术意义：** Worker Thread 让 CPU 时间从 request handler 的 call stack 转移到独立 V8 isolate，但结果、错误和超时仍要回到主线程完成 HTTP response。

**概念解释：** `runCpuTaskInWorker()` 创建 Worker、监听 `message`、`error` 和 `exit`，最后 `postMessage()` 发送 iterations。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `new Worker()` starts another V8 isolate and thread; data crosses by structured clone or transfer, not by shared JavaScript object identity.

**底层机制：** `runCpuTaskInWorker()` 创建 Worker、监听 `message`、`error` 和 `exit`，最后 `postMessage()` 发送 iterations。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/04-workers-cluster/worker-thread-cpu-task.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `worker duration`，入口或触发点是 ``/performance/cpu-worker``，负载或执行来源是 `HTTP request`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/04-workers-cluster/worker-thread-cpu-task.ts`，围绕 `new Worker()`、`worker.once("message")`、`worker.once("error")`、`worker.once("exit")` 说明 Worker creation and message result flow 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/04-workers-cluster/worker-thread-cpu-task.ts</span>
  </div>

```ts

import { Worker } from "node:worker_threads";

export function runCpuTaskInWorker(workerUrl: URL, iterations: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl, { execArgv: [] });

    worker.once("message", (message: { result: number }) => {
      resolve(message.result);
    });

    worker.once("error", reject);

    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error("Worker exited with code " + code));
      }
    });

    worker.postMessage({ iterations });
  });
}
```
</div>

**逐行解释：** `new Worker()` 打开 worker 线程；`worker.once("message")` 解析成功结果；`worker.once("error")` 接管启动或运行错误；`worker.once("exit")` 处理非零退出；`postMessage()` 触发跨线程 structured clone。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/04-workers-cluster/worker-thread-cpu-task.ts` 阅读模式；项目内请求 `/performance/cpu-worker`。

**预期输出：** `runCpuTaskInWorker()` resolves with the worker result, rejects on `error`, and rejects on non-zero `exit` without blocking the main thread.

**执行过程：** Create a Worker, attach `message`, `error`, and `exit` listeners, then send iterations through `postMessage()`.

**变量、引用、资源与生命周期变化：** The worker thread owns its CPU loop; the parent owns listeners and the promise; the worker exits after posting the result.

**为什么会得到这个结果：** The main event loop remains available because CPU work runs in the worker isolate instead of the parent isolate.

**对比情况：** Worker Threads are useful for CPU work; they do not improve ordinary database I/O that already waits outside the JavaScript thread.

**常见错误为什么错：** Ignoring `error` or non-zero `exit` violates the worker lifecycle contract and can convert failed CPU work into a hung request.

**与真实项目的关系：** APIs offload image transforms, report calculations, and expensive JSON processing to workers while keeping HTTP routing responsive.

**与当前学习路径的关系：** Chapter 01 主线程模型和 Chapter 12 CPU offload 在这里相连。

**最终记忆模型：** Worker 负责算，主线程负责调度、超时、错误归属和 response 完成。

**机制证据链：** The table traces Worker construction, message delivery, error ownership, and final promise resolution.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``/performance/cpu-worker`` | `HTTP request` | worker duration | main thread -> Worker thread | worker queue or error | reuse bounded worker | main loop delay lower | spawn unlimited workers | thread count and memory rise |

<a id="section-9-8"></a>

### 9.8 Worker pool、message passing、structured clone 与 transfer boundary

**结论：** Worker pool 的核心是 idle worker、active task、pending queue 和 close cleanup；message 不是共享普通对象引用。

**本节解决的问题：** 本节解决 Worker 从单次创建变成可复用池时的资源边界：任务排队、idle worker、message serialization 和 shutdown 必须有所有者。

**技术意义：** 池化决定系统在高并发 CPU work 下是排队还是爆线程；message boundary 决定 payload 是 clone、transfer 还是共享内存视图。

**概念解释：** 实际项目的 `WorkerPool` lazy 创建 worker location，用 queue 控制 pending task，并在 `close()` 中 reject 未执行任务和 terminate worker。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `WorkerPool` owns worker state, active task references, and a pending queue; structured-cloned messages cross the thread boundary.

**底层机制：** 实际项目的 `WorkerPool` lazy 创建 worker location，用 queue 控制 pending task，并在 `close()` 中 reject 未执行任务和 terminate worker。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/src/modules/performance/worker-pool.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `pendingCount`，入口或触发点是 `WorkerPool.run`，负载或执行来源是 `unit test`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/src/modules/performance/worker-pool.ts`，围绕 `queue`、`activeTask`、`dispatch()`、`postMessage()` 说明 worker-pool queue ownership 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/worker-pool.ts</span>
  </div>

```ts
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

export interface WorkerTask {
  iterations: number;
}

interface PendingTask {
  id: number;
  task: WorkerTask;
  resolve: (value: number) => void;
  reject: (error: Error) => void;
}

interface WorkerState {
  worker: Worker;
  activeTask?: PendingTask;
}

interface WorkerLocation {
  url: URL;
  execArgv: string[];
}

function resolveWorkerLocation(workerUrl?: URL): WorkerLocation {
  if (workerUrl) {
    return { url: workerUrl, execArgv: [] };
  }

  const compiledWorkerUrl = new URL("./cpu-worker.js", import.meta.url);
  if (existsSync(fileURLToPath(compiledWorkerUrl))) {
    return { url: compiledWorkerUrl, execArgv: [] };
  }

  return {
    url: new URL("./cpu-worker.ts", import.meta.url),
    execArgv: ["--import", "tsx"]
  };
}

export class WorkerPool {
  private nextId = 1;
  private readonly queue: PendingTask[] = [];
  private readonly workers: WorkerState[];
  private readonly workerLocation: WorkerLocation;

  constructor(size = 2, workerUrl?: URL) {
    this.workerLocation = resolveWorkerLocation(workerUrl);
    this.workers = Array.from({ length: size }, () => this.createWorker());
  }

  get size(): number {
    return this.workers.length;
  }

  get pendingCount(): number {
    return this.queue.length + this.workers.filter((state) => state.activeTask).length;
  }

  run(task: WorkerTask): Promise<number> {
    return new Promise((resolve, reject) => {
      const pendingTask = {
        id: this.nextId,
        task,
        resolve,
        reject
      };
      this.nextId += 1;
      this.queue.push(pendingTask);
      this.dispatch();
    });
  }

  async close(): Promise<void> {
    for (const pending of this.queue.splice(0)) {
      pending.reject(new Error("Worker pool closed before task execution"));
    }
    await Promise.all(this.workers.map((state) => state.worker.terminate()));
  }

  private createWorker(): WorkerState {
    const state: WorkerState = {
      worker: new Worker(this.workerLocation.url, { execArgv: this.workerLocation.execArgv })
    };

    state.worker.on("message", (message: { id: number; result?: number; error?: string }) => {
      const activeTask = state.activeTask;
      if (!activeTask || activeTask.id !== message.id) return;
      state.activeTask = undefined;
      if (message.error) {
        activeTask.reject(new Error(message.error));
      } else {
        activeTask.resolve(message.result ?? 0);
      }
      this.dispatch();
    });

    state.worker.on("error", (error) => {
      const activeTask = state.activeTask;
      state.activeTask = undefined;
      activeTask?.reject(error instanceof Error ? error : new Error("Worker failed"));
      this.dispatch();
    });

    return state;
  }

  private dispatch(): void {
    for (const state of this.workers) {
      if (state.activeTask || this.queue.length === 0) continue;
      const nextTask = this.queue.shift();
      if (!nextTask) return;
      state.activeTask = nextTask;
      state.worker.postMessage({
        id: nextTask.id,
        iterations: nextTask.task.iterations
      });
    }
  }
}
```
</div>

**逐行解释：** `queue` 保存等待任务；`activeTask` 标记正在运行的 task；`dispatch()` 只给 idle worker 发 `postMessage()`；`resolveWorkerLocation()` 区分 built JS 和 tsx 测试；`close()` 清空 queue 并 terminate worker。

**运行方式：** 在 mini project 中运行 `node --import tsx --test --test-concurrency=1 tests/worker-pool.unit.test.ts`。

**预期输出：** `run()` either assigns a task to an idle worker or queues it, and `close()` terminates workers after pending ownership is settled.

**执行过程：** Find an idle state, assign `activeTask`, post the payload, or push the task into `queue`; on completion, drain the next queued task.

**变量、引用、资源与生命周期变化：** `queue` grows under load; `activeTask` belongs to one worker; `close()` stops workers so no task promise is left without an owner.

**为什么会得到这个结果：** The pool bounds CPU parallelism to the worker count, so request concurrency does not create unlimited threads.

**对比情况：** A single Worker per request is simple but expensive; a pool reuses workers and makes queueing visible.

**常见错误为什么错：** Forgetting to clear `activeTask` or terminate workers violates the pool ownership contract and leaves open handles.

**与真实项目的关系：** Production services use bounded pools to protect memory and CPU when many clients trigger expensive calculations.

**与当前学习路径的关系：** Chapter 12 9.7 的单个 Worker 扩展成可复用 pool；也连接 Chapter 11 graceful shutdown。

**最终记忆模型：** Worker pool 管 worker 数量和任务队列；message boundary 管数据复制、转移和失败归属。

**机制证据链：** The table follows a task from pending queue to idle worker, active execution, completion, and cleanup.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `WorkerPool.run` | `unit test` | pendingCount | main isolate -> worker isolate | queue saturation | bound pool size | pendingCount returns to zero | forget close | test process hangs |

<a id="section-9-9"></a>

### 9.9 Cluster：多进程 HTTP 扩展边界

**结论：** Cluster 扩展的是 Node HTTP 进程数，每个 worker process 有自己的 heap 和连接池。

**本节解决的问题：** 本节解决 HTTP 服务何时需要多进程扩展的问题：Cluster 扩大监听同一端口的 Node process 数量，但不会共享 heap、cache 或 database pool。

**技术意义：** 多进程可以利用多个 CPU core，但每个 worker 都会复制进程级资源，因此 capacity 需要同时计算 CPU、memory 和 external connection budget。

**概念解释：** `createClusterPlan()` 读取 `cluster.isPrimary` 和 `os.availableParallelism()`，把 worker count 限制在本机可用并行度内。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `node:cluster` creates OS processes, not threads; each worker has its own event loop, heap, sockets, Prisma pool, and Redis client.

**底层机制：** `createClusterPlan()` 读取 `cluster.isPrimary` 和 `os.availableParallelism()`，把 worker count 限制在本机可用并行度内。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/04-workers-cluster/cluster-http-scaling-model.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `worker count`，入口或触发点是 `cluster plan`，负载或执行来源是 `process scaling model`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/04-workers-cluster/cluster-http-scaling-model.ts`，围绕 `cluster.isPrimary`、`os.availableParallelism()`、`Math.min()`、`perProcessPools:true` 说明 cluster process scaling 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/04-workers-cluster/cluster-http-scaling-model.ts</span>
  </div>

```ts

import cluster from "node:cluster";
import os from "node:os";

export interface ClusterPlan {
  primary: boolean;
  workers: number;
  perProcessPools: boolean;
}

export function createClusterPlan(maxWorkers = os.availableParallelism()): ClusterPlan {
  return {
    primary: cluster.isPrimary,
    workers: Math.max(1, Math.min(maxWorkers, os.availableParallelism())),
    perProcessPools: true
  };
}
```
</div>

**逐行解释：** `cluster.isPrimary` 表示当前是否 primary process；`os.availableParallelism()` 读取可用并行度；`Math.min()` 防止计划超过机器容量；`perProcessPools:true` 提醒每个进程会放大外部连接。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/04-workers-cluster/cluster-http-scaling-model.ts` 阅读模型；不要把它接入本章 mini project runtime。

**预期输出：** `createClusterPlan()` reports a primary process, worker count, and per-process resource multiplication.

**执行过程：** Read CPU count, choose a bounded worker count, and describe how the primary distributes HTTP connections to workers.

**变量、引用、资源与生命周期变化：** Each worker process owns separate memory and connections; restarting one worker does not clear resources in another.

**为什么会得到这个结果：** More processes can use more CPU cores, but every process multiplies heap, connection pools, and startup cost.

**对比情况：** Cluster helps with multi-core HTTP serving; Worker Threads are narrower CPU offload inside one process.

**常见错误为什么错：** Treating cluster as a free speedup violates the resource multiplication rule for database and Redis connections.

**与真实项目的关系：** Container platforms often scale processes or pods, so pool sizing must account for every running Node process.

**与当前学习路径的关系：** 连接 Chapter 11 container capacity；多进程会改变数据库连接预算。

**最终记忆模型：** Cluster 扩展 process，不扩展共享内存；每个 worker 都要重新计算 heap、cache 和 pool。

**机制证据链：** The table connects primary process startup to worker processes and multiplied downstream resources.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cluster plan` | `process scaling model` | worker count | primary process -> worker processes | pool multiplication | budget per process | connections match plan | fork many workers blindly | database saturates after scaling |

<a id="section-9-10"></a>

### 9.10 Worker Threads vs Cluster vs child_process

**结论：** 先判断 workload，再选择 thread、Node process 或 external process 边界。

**本节解决的问题：** 本节解决三种隔离边界的选择问题：CPU JavaScript、HTTP 进程扩容和外部命令分别对应不同的资源、通信和故障模型。

**技术意义：** 选错边界会把瓶颈从 event loop 转移成 serialization cost、process memory、stdio blockage 或 orphan process cleanup。

**概念解释：** `chooseRuntimeBoundary()` 把 `cpu-js` 映射到 `worker_threads`，把 `http-scale` 映射到 `cluster`，把 `external-program` 映射到 `child_process`。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `chooseExecutionBoundary()` is a decision function; the runtime choices map to a thread, a process, or an external command boundary.

**底层机制：** `chooseRuntimeBoundary()` 把 `cpu-js` 映射到 `worker_threads`，把 `http-scale` 映射到 `cluster`，把 `external-program` 映射到 `child_process`。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/04-workers-cluster/worker-vs-cluster-boundary.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `primitive and boundary`，入口或触发点是 `decision function`，负载或执行来源是 `workload input`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/04-workers-cluster/worker-vs-cluster-boundary.ts`，围绕 `WorkloadKind`、`boundary` 说明 worker_threads versus cluster versus child_process decision 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/04-workers-cluster/worker-vs-cluster-boundary.ts</span>
  </div>

```ts

export type WorkloadKind = "cpu-js" | "http-scale" | "external-program";

export interface RuntimeBoundaryDecision {
  workload: WorkloadKind;
  primitive: "worker_threads" | "cluster" | "child_process";
  boundary: "thread" | "node-process" | "external-process";
}

export function chooseRuntimeBoundary(workload: WorkloadKind): RuntimeBoundaryDecision {
  if (workload === "cpu-js") {
    return { workload, primitive: "worker_threads", boundary: "thread" };
  }
  if (workload === "http-scale") {
    return { workload, primitive: "cluster", boundary: "node-process" };
  }
  return { workload, primitive: "child_process", boundary: "external-process" };
}
```
</div>

**逐行解释：** `WorkloadKind` 限定输入；第一个分支选择 Worker thread；第二个分支选择 Cluster Node process；默认分支选择 child_process；返回的 `boundary` 说明隔离成本。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/04-workers-cluster/worker-vs-cluster-boundary.ts`。

**预期输出：** The decision matrix returns `worker_threads`, `cluster`, or `child_process` with the matching ownership and cleanup rule.

**执行过程：** Inspect the workload shape, select the execution boundary, and return the reason that limits where the code should run.

**变量、引用、资源与生命周期变化：** A CPU task may become a Worker job; HTTP serving may become multiple processes; shell-like work may become a child process with stdio ownership.

**为什么会得到这个结果：** Each API crosses a different resource boundary, so the correct answer depends on the workload rather than a universal performance preference.

**对比情况：** Worker Threads share a process; Cluster duplicates the server process; Child processes run separate programs.

**常见错误为什么错：** Using Cluster to solve one CPU-heavy route violates the boundary because it scales all process resources rather than isolating the task.

**与真实项目的关系：** Architecture reviews use this decision to avoid solving a local CPU hotspot with broad process-level scaling.

**与当前学习路径的关系：** 连接 Chapter 12 Worker、Cluster 和 Chapter 11 process lifecycle。

**最终记忆模型：** CPU 算法优先 Worker；HTTP 横向扩容看 Cluster/process；外部工具和隔离执行才看 child_process。

**机制证据链：** The table maps workload evidence to the smallest runtime boundary that owns the work.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `decision function` | `workload input` | primitive and boundary | thread/process/external boundary | wrong primitive | choose smallest boundary | target signal improves | use cluster for one CPU task | complexity rises but delay remains high |

<a id="section-9-11"></a>

### 9.11 内存使用：RSS、heapUsed、external、arrayBuffers

**结论：** `process.memoryUsage()` 把进程 RSS、V8 heap 和 external/ArrayBuffer 分开报告。

**本节解决的问题：** 本节解决如何读懂 Node process memory 信号的问题：RSS、heapUsed、external 和 arrayBuffers 对应不同资源，不能互相替代。

**技术意义：** 这些字段帮助判断压力来自 JavaScript objects、Buffer/native memory 还是整个 process footprint，从而避免只调 V8 heap 却忽略 external memory。

**概念解释：** 代码读取 `process.memoryUsage()`，返回 `rss`、`heapTotal`、`heapUsed`、`external` 和 `arrayBuffers`。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `process.memoryUsage()` reads Node process memory counters; V8 heap fields do not include every RSS byte owned by native buffers or the OS.

**底层机制：** 代码读取 `process.memoryUsage()`，返回 `rss`、`heapTotal`、`heapUsed`、`external` 和 `arrayBuffers`。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/05-memory-v8/process-memory-usage.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `rss/heapUsed/external`，入口或触发点是 ``/performance/memory``，负载或执行来源是 `HTTP request`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/05-memory-v8/process-memory-usage.ts`，围绕 `memoryUsage()`、`rss`、`heapUsed`、`external` 说明 process memory usage fields 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/05-memory-v8/process-memory-usage.ts</span>
  </div>

```ts
export function readProcessMemory() {
  const memory = process.memoryUsage();
  return {
    rss: memory.rss,
    heapTotal: memory.heapTotal,
    heapUsed: memory.heapUsed,
    external: memory.external,
    arrayBuffers: memory.arrayBuffers
  };
}

console.log(readProcessMemory());
```
</div>

**逐行解释：** `memoryUsage()` 从当前 Node process 读取内存；`rss` 是常驻进程内存；`heapTotal` 是 V8 已分配 heap；`heapUsed` 是 V8 heap 已用；`external` 和 `arrayBuffers` 解释 Buffer/native 压力；这些值不是数据库或 Redis 内存。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/05-memory-v8/process-memory-usage.ts`；项目内请求 `/performance/memory`。

**预期输出：** `readProcessMemory()` returns `rss`, `heapTotal`, `heapUsed`, `external`, and `arrayBuffers`.

**执行过程：** Call `process.memoryUsage()`, copy the numeric fields, and compare heap growth against RSS growth.

**变量、引用、资源与生命周期变化：** Heap objects belong to V8; `Buffer` and `ArrayBuffer` storage may affect external memory; RSS includes process memory visible to the OS.

**为什么会得到这个结果：** Different counters grow for different resource types, so the same memory graph can indicate heap retention or native buffer pressure.

**对比情况：** A heap leak raises `heapUsed`; large buffers may raise `external` and RSS without the same heap shape.

**常见错误为什么错：** Reading only RSS violates the rule that Node process memory has V8 and non-V8 components.

**与真实项目的关系：** Incident triage compares these fields before deciding whether to inspect heap snapshots, buffers, streams, or container limits.

**与当前学习路径的关系：** 连接 Chapter 08 file/upload Buffer 边界和 Chapter 10 diagnostics。

**最终记忆模型：** heapUsed 看 JS object heap；external/arrayBuffers 看 Buffer/native backing store；RSS 看整个 process footprint。

**机制证据链：** The table traces memory allocation evidence from V8 heap and native storage to process-level RSS.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``/performance/memory`` | `HTTP request` | rss/heapUsed/external | Express -> process memory | heap or external pressure | stream or release references | memory trend stabilizes | inspect heapUsed only | RSS climbs while heapUsed is flat |

<a id="section-9-12"></a>

### 9.12 V8 heap statistics、heap snapshot 与 heap profiling 边界

**结论：** V8 heap statistics 可以安全数值化；heap snapshot 只能作为本地诊断，不应暴露为 HTTP route。

**本节解决的问题：** 本节解决 V8 诊断信号和 heap snapshot 使用边界的问题：数值指标适合持续暴露，snapshot/profiling 属于本地或受控诊断。

**技术意义：** heap statistics 能进 metrics；heap snapshot 会包含大量对象图和潜在敏感数据，错误暴露会把诊断能力变成安全风险。

**概念解释：** `readSafeHeapDiagnostics()` 调用 `v8.getHeapStatistics()`；`localOnlyDiagnostic` 只把 `v8.writeHeapSnapshot()` 作为本地边界提示。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `v8.getHeapStatistics()` and `v8.writeHeapSnapshot()` are local diagnostics APIs; heap snapshots can contain sensitive object data and must not be exposed over HTTP.

**底层机制：** `readSafeHeapDiagnostics()` 调用 `v8.getHeapStatistics()`；`localOnlyDiagnostic` 只把 `v8.writeHeapSnapshot()` 作为本地边界提示。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/05-memory-v8/heap-snapshot-boundary.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `heap statistics`，入口或触发点是 `heap diagnostics`，负载或执行来源是 `source audit`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/05-memory-v8/heap-snapshot-boundary.ts`，围绕 `v8.getHeapStatistics()`、`heap_size_limit`、`used_heap_size`、`localOnlyDiagnostic` 说明 V8 heap statistics and snapshot boundary 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/05-memory-v8/heap-snapshot-boundary.ts</span>
  </div>

```ts

import v8 from "node:v8";

export function readSafeHeapDiagnostics() {
  const statistics = v8.getHeapStatistics();
  return {
    heapSizeLimit: statistics.heap_size_limit,
    totalHeapSize: statistics.total_heap_size,
    usedHeapSize: statistics.used_heap_size,
    externalMemory: statistics.external_memory
  };
}

export const localOnlyDiagnostic = "v8.writeHeapSnapshot() must stay outside public HTTP routes";
```
</div>

**逐行解释：** `v8.getHeapStatistics()` 返回 heap limit 和 used size；`heap_size_limit` 是 V8 上限；`used_heap_size` 是已用 heap；字符串 `localOnlyDiagnostic` 不调用 snapshot API，因此不会写文件或泄露对象图。

**运行方式：** 运行 `node --import tsx practices/12-performance-scalability/05-memory-v8/heap-snapshot-boundary.ts`；扫描 `src` 确认没有 HTTP snapshot route。

**预期输出：** `readSafeHeapDiagnostics()` returns heap limit and used-size fields while `writeHeapSnapshot` remains a local-only diagnostic action.

**执行过程：** Read V8 statistics in-process, interpret the numeric limits, and only write snapshots during controlled local diagnosis.

**变量、引用、资源与生命周期变化：** The statistics object is transient; a heap snapshot writes a file that can outlive the process and may include application data.

**为什么会得到这个结果：** The diagnostic output is useful because it observes V8's heap boundary rather than total container memory.

**对比情况：** Metrics are safe to expose when low-cardinality and redacted; heap snapshots are artifacts for local secure analysis.

**常见错误为什么错：** Serving heap snapshots from an endpoint violates both security and diagnostic ownership rules.

**与真实项目的关系：** On-call debugging uses heap statistics for live dashboards and reserves snapshots for restricted incident workstations.

**与当前学习路径的关系：** 连接 Chapter 10 diagnostics 与 Chapter 06 secrets/logging 边界。

**最终记忆模型：** 统计值可长期采集；snapshot 是高成本诊断 artefact，必须受控生成和保存。

**机制证据链：** The table connects V8 heap counters to the local-file snapshot boundary and its security risk.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `heap diagnostics` | `source audit` | heap statistics | Node -> V8 diagnostics | heap growth | metrics only over HTTP | no snapshot route | expose heap dump endpoint | route can download object graph |

<a id="section-9-13"></a>

### 9.13 Express hot path、middleware overhead 与同步代码风险

**结论：** Express hot path 上的 logger 和 metrics 必须使用 route pattern 和 status class，不能用 raw URL 或高基数字段作 label。

**本节解决的问题：** 本节解决 Express hot path 上观测代码本身制造性能问题的问题：logger、metrics label 和同步 work 都会进入每个 request 的关键路径。

**技术意义：** 稳定 route pattern 和 status class 降低 metrics cardinality；避免 raw URL label 可以防止监控系统在高基数字段上耗尽资源。

**概念解释：** 实际 `requestLogger` 使用 `response.on("finish")`、`getRoutePattern()` 和 `recordHttpRequest()`。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `getRoutePattern()` receives Express request data; labels must use route patterns or query-stripped paths, not user-specific raw URLs.

**底层机制：** 实际 `requestLogger` 使用 `response.on("finish")`、`getRoutePattern()` 和 `recordHttpRequest()`。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/src/observability/request-logger.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `HTTP duration labels`，入口或触发点是 `Express request`，负载或执行来源是 `supertest or NGINX traffic`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/src/observability/request-logger.ts`，围绕 `scrubPattern()`、`getRoutePattern()`、`request.route.path`、`response.on("finish")` 说明 route-pattern metric labels 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/request-logger.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { recordHttpRequest } from "./http-metrics.js";

function scrubPattern(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ":id")
    .replace(/\d+/g, ":number");
}

function getRoutePattern(request: Request): string {
  if (request.route?.path) return scrubPattern(request.baseUrl + String(request.route.path));
  return scrubPattern(request.path);
}

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const route = getRoutePattern(request);

    recordHttpRequest({
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationSeconds
    });

    logger.info({
      requestId: response.getHeader("x-request-id"),
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationSeconds
    }, "request completed");
  });

  next();
}
```
</div>

**逐行解释：** `scrubPattern()` 把 UUID 和数字替换成占位符；`getRoutePattern()` 优先使用 `request.route.path`；`response.on("finish")` 等响应完成后记录 duration；`recordHttpRequest()` 只接收 method、route、statusCode、durationSeconds。

**运行方式：** 运行 `node --import tsx --test --test-concurrency=1 tests/metrics.integration.test.ts`，再查看 `/metrics`。

**预期输出：** The logger emits low-cardinality route labels and excludes query strings, email, IP, user id, and request id from metric labels.

**执行过程：** Read `request.route?.path` or sanitize the path, build a stable label, and pass that label to the metric recorder.

**变量、引用、资源与生命周期变化：** The HTTP request contains untrusted URL data; the metric label survives in the registry, so high-cardinality or sensitive values must be removed first.

**为什么会得到这个结果：** Metrics stores multiply time series by label values; raw URLs and identifiers can create unbounded cardinality and privacy leakage.

**对比情况：** Logs may carry a redacted request id for tracing; metrics should aggregate by route pattern and status class.

**常见错误为什么错：** Using `request.originalUrl` as a metric label violates low-cardinality and query-string privacy rules.

**与真实项目的关系：** Observability systems stay affordable and useful only when route metrics aggregate repeated requests under stable labels.

**与当前学习路径的关系：** 连接 Chapter 03 Express middleware 和 Chapter 10 metrics label 设计。

**最终记忆模型：** Hot path 上每个 middleware 都按请求次数付费；metrics label 必须稳定、低基数、可聚合。

**机制证据链：** The table traces request URL input to a safe metric label and the cardinality failure mode.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Express request` | `supertest or NGINX traffic` | HTTP duration labels | middleware -> finish event -> metrics | synchronous logger or high cardinality | route pattern labels | bounded series count | label originalUrl/email/id | metrics series grow with users |

<a id="section-9-14"></a>

### 9.14 JSON payload、body parser、request size 与 CPU/内存压力

**结论：** `express.json({ limit: "1mb" })` 同时是 CPU、heap 和 security boundary。

**本节解决的问题：** 本节解决 request body 解析边界的问题：JSON payload 进入 handler 前已经消耗 CPU 和 memory，size limit 是性能和安全共同边界。

**技术意义：** Body parser 会把 bytes 转成 JavaScript values；limit 决定解析前的拒绝点，避免 oversized request 占满 heap 和 event loop。

**概念解释：** `boundedJsonParser` 是真实 Express JSON parser；`estimateJsonParseCost()` 用 `JSON.parse()` 和 `Buffer.byteLength()` 展示 payload 成本。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `express.json({ limit: "1mb" })` parses request bodies before route handlers; TypeScript types do not validate body size or shape at runtime.

**底层机制：** `boundedJsonParser` 是真实 Express JSON parser；`estimateJsonParseCost()` 用 `JSON.parse()` 和 `Buffer.byteLength()` 展示 payload 成本。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/03-event-loop-cpu/sync-json-work-risk.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `parse duration and bytes`，入口或触发点是 `POST JSON body`，负载或执行来源是 `bounded payload sample`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/03-event-loop-cpu/sync-json-work-risk.ts`，围绕 `express.json({ limit:"1mb" })`、`process.hrtime.bigint()`、`JSON.parse(payload)`、`Buffer.byteLength()` 说明 JSON body size boundary 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/03-event-loop-cpu/sync-json-work-risk.ts</span>
  </div>

```ts

import express from "express";

export const boundedJsonParser = express.json({ limit: "1mb" });

export function estimateJsonParseCost(payload: string) {
  const startedAt = process.hrtime.bigint();
  const parsed = JSON.parse(payload) as unknown;
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

  return {
    bytes: Buffer.byteLength(payload),
    durationMs: Number(durationMs.toFixed(3)),
    valueType: Array.isArray(parsed) ? "array" : typeof parsed
  };
}
```
</div>

**逐行解释：** `express.json({ limit:"1mb" })` 在 request body 边界限制大小；`process.hrtime.bigint()` 记录 parse 起点；`JSON.parse(payload)` 同步消耗 CPU 和 heap；`Buffer.byteLength()` 把字符输入转成 byte 预算。

**运行方式：** 在 mini project 中检查 `src/app.ts` 的 `express.json({ limit: "1mb" })`；practice 可用 `node --import tsx` 阅读。

**预期输出：** The parser accepts bounded JSON, rejects oversized input, and leaves route validation to the schema layer.

**执行过程：** Express receives body chunks, the JSON parser accumulates within the configured limit, parses the value, and passes control to the next middleware.

**变量、引用、资源与生命周期变化：** Request bytes become buffered parser input, then a JavaScript value on `request.body`; oversized input terminates before business logic.

**为什么会得到这个结果：** The limit protects CPU, heap, and security boundaries because parsing arbitrary JSON can allocate memory and block the event loop.

**对比情况：** A small JSON limit is appropriate for note metadata; large uploads should use streaming upload logic instead.

**常见错误为什么错：** Raising the body limit to fix upload failures violates the boundary between JSON APIs and stream/file upload paths.

**与真实项目的关系：** APIs set explicit body limits so traffic spikes or malicious payloads cannot turn parsing into a memory incident.

**与当前学习路径的关系：** 连接 Chapter 03 request body 和 Chapter 06 input/security boundary。

**最终记忆模型：** `express.json({ limit })` 是进入业务逻辑前的 bytes-to-object 闸门。

**机制证据链：** The table follows request bytes through Express JSON parsing and the oversized-body rejection boundary.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST JSON body` | `bounded payload sample` | parse duration and bytes | HTTP body -> Express parser -> V8 heap | large JSON parse | limit size or stream | duration and heap bounded | raise limit blindly | CPU spikes on large POST |

<a id="section-9-15"></a>

### 9.15 Streams 与 backpressure 在性能中的作用

**结论：** `writable.write()` 返回 `false` 是 producer 必须暂停的信号，`drain` 表示 consumer 追上了。

**本节解决的问题：** 本节解决 producer 比 consumer 更快时如何避免内存堆积的问题：backpressure 要求代码把 `false` 和 `drain` 当作生命周期信号。

**技术意义：** Streams 把吞吐控制放在 writable buffer 状态上，让大文件和长响应按 consumer 速度前进，而不是一次性堆进内存。

**概念解释：** `writeWithBackpressure()` 使用 Writable、highWaterMark、write() 和 once(drain) 形成 producer-consumer 协议。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `write()`, `drain`, and `pipeline()` are Node stream APIs; they coordinate producer speed with writable buffer capacity.

**底层机制：** `writeWithBackpressure()` 使用 Writable、highWaterMark、write() 和 once(drain) 形成 producer-consumer 协议。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/06-stream-backpressure/write-return-value.ts` 和 `practices/12-performance-scalability/06-stream-backpressure/pipeline-error-boundary.ts`，必须按这些文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `drains and bytesWritten`，入口或触发点是 `stream write`，负载或执行来源是 `unit test`。

**示例结构：** 本节示例先绑定 `practices/12-performance-scalability/06-stream-backpressure/write-return-value.ts`，围绕 `new Writable()`、`highWaterMark`、`writable.write(chunk)`、`once(writable,"drain")` 说明 backpressure；再绑定 `practices/12-performance-scalability/06-stream-backpressure/pipeline-error-boundary.ts`，围绕 `pipeline(readable, writable)` 说明 completion and error cleanup。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/06-stream-backpressure/write-return-value.ts</span>
  </div>

```ts
import { Writable } from "node:stream";
import { once } from "node:events";

export async function writeWithBackpressure(chunks: Buffer[]): Promise<number> {
  const writable = new Writable({
    highWaterMark: 16,
    write(_chunk, _encoding, callback) {
      setImmediate(callback);
    }
  });

  let drains = 0;
  for (const chunk of chunks) {
    if (!writable.write(chunk)) {
      drains += 1;
      await once(writable, "drain");
    }
  }
  writable.end();
  return drains;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/06-stream-backpressure/pipeline-error-boundary.ts</span>
  </div>

```ts
import { pipeline } from "node:stream/promises";
import { Readable, Writable } from "node:stream";

export async function writeChunksWithPipeline(chunks: Buffer[]): Promise<number> {
  let bytesWritten = 0;
  const readable = Readable.from(chunks);
  const writable = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      bytesWritten += chunk.length;
      callback();
    }
  });

  await pipeline(readable, writable);
  return bytesWritten;
}
```
</div>

**逐行解释：** 第一段代码中，`new Writable()` 创建 consumer；`highWaterMark` 设定 buffer 阈值；`writable.write(chunk)` 返回 false 时 producer 等 `once(writable,"drain")`；`writable.end()` 结束写入。第二段代码中，`Readable.from(chunks)` 把数组变成 readable source；`pipeline(readable, writable)` 统一等待完成并传播 stream error。

**运行方式：** 运行 `node --import tsx --test --test-concurrency=1 tests/stream-backpressure.unit.test.ts`；项目内请求 `/performance/stream-report`。

**预期输出：** The example pauses production when `write()` returns false and resumes after `drain`, while `pipeline()` centralizes error cleanup.

**执行过程：** Write chunks until the writable reports pressure, wait for `drain`, continue production, and let `pipeline()` propagate failure or completion.

**变量、引用、资源与生命周期变化：** Chunks move from producer memory into the writable buffer; a false return means ownership must wait; `pipeline()` closes resources on error.

**为什么会得到这个结果：** Backpressure works because the writable stream tells the producer when its internal queue is saturated.

**对比情况：** Ignoring `write()` return values may fill memory; honoring `drain` bounds buffered data.

**常见错误为什么错：** Looping over `write()` without checking false violates the stream backpressure contract.

**与真实项目的关系：** Large exports, uploads, and report downloads rely on backpressure to avoid memory spikes.

**与当前学习路径的关系：** 连接 Chapter 02 streams 和 Chapter 08 upload/download。

**最终记忆模型：** write false 就停，drain 再继续；pipeline 负责把完成、错误和 cleanup 串起来。

**机制证据链：** The table traces a chunk from producer write to buffer pressure, drain, and pipeline cleanup.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `stream write` | `unit test` | drains and bytesWritten | producer -> Writable buffer -> sink | slow consumer | await drain or pipeline | memory bounded | ignore false return | RSS rises during stream |

<a id="section-9-16"></a>

### 9.16 Prisma Client reuse、connection pool 与 database saturation

**结论：** 复用 Prisma Client 是连接池预算的前提；多进程会按进程数放大 pool。

**本节解决的问题：** 本节解决数据库连接所有权的问题：Prisma Client 应该按 process 复用，否则每个 request 或每个 worker 都可能放大 connection pool 压力。

**技术意义：** 这个机制决定了数据库容量不是只看单个 request，而是要按 Node process count、Prisma Client count、driver pool count 和 PostgreSQL max connections 一起计算。

**概念解释：** 实际 `prisma.ts` 通过 `new PrismaPg({ connectionString: config.DATABASE_URL })` 创建 PostgreSQL adapter，再把 adapter 交给单例 `PrismaClient`，并用 `disconnectPrisma()` 在 shutdown 时调用 `$disconnect()`。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `prisma` is a process-level singleton; each Node process or cluster worker owns a separate Prisma Client and therefore a separate database pool.

**底层机制：** `new PrismaPg({ connectionString })` 根据配置的 database URL 建立 Prisma PostgreSQL driver adapter；`new PrismaClient({ adapter })` 成为 process-level resource owner；repository import 复用同一个 client。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/src/db/prisma.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `query duration and readiness`，入口或触发点是 `repository query`，负载或执行来源是 `integration test`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/src/db/prisma.ts`，围绕 `new PrismaPg({ connectionString })`、`new PrismaClient({ adapter })`、`disconnectPrisma()` 说明 Prisma singleton and pool multiplication 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/db/prisma.ts</span>
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

**逐行解释：** `new PrismaPg({ connectionString: config.DATABASE_URL })` 从配置创建 Prisma PostgreSQL adapter；`new PrismaClient({ adapter })` 创建 process-level client；`disconnectPrisma()` 在 shutdown cleanup 中调用 `$disconnect()`。

**运行方式：** 运行 `npm run prisma:migrate:deploy` 和 `npm run seed` 前必须保证 PostgreSQL container healthy。

**预期输出：** The project reuses one `PrismaClient` per process and disconnects it during shutdown.

**执行过程：** Create one `PrismaPg` adapter, construct one `PrismaClient`, import that singleton in repositories, and call `$disconnect()` on shutdown.

**变量、引用、资源与生命周期变化：** The adapter stores the connection string; the Prisma client owns the pool; repository calls borrow connections and return them to the pool.

**为什么会得到这个结果：** Singleton reuse prevents creating a new connection pool per request, while process scaling still multiplies pools by process count.

**对比情况：** One client per process is healthy; one client per request exhausts database connections under load.

**常见错误为什么错：** Instantiating Prisma inside every handler violates the resource ownership rule for database pools.

**与真实项目的关系：** Capacity planning multiplies pool size by API process count before comparing it with PostgreSQL limits.

**与当前学习路径的关系：** 连接 Chapter 05 Prisma 和 Chapter 11 PostgreSQL Compose runtime。

**最终记忆模型：** Prisma Client 是 process-level resource owner；process count multiplied by pool size becomes database connection pressure。

**机制证据链：** The table follows a repository query through the process singleton to the database pool and shutdown cleanup.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `repository query` | `integration test` | query duration and readiness | Prisma -> pg Pool -> PostgreSQL | pool saturation | reuse client and reduce query count | duration and errors drop | new client per request | many idle connections or pool waits |

<a id="section-9-17"></a>

### 9.17 Query count、N+1、query duration 与 repository performance

**结论：** N+1 的症状是 query count 随结果数量增长；单条 SQL 不慢也会让请求总耗时变大。

**本节解决的问题：** 本节解决数据库查询数量如何放大 request latency 的问题：N+1 让 query count 随结果集增长，即使单条 query 很快也会累积尾延迟。

**技术意义：** Repository 层是把业务读取映射成 SQL 的位置；记录 query count 和 duration 能把 handler 慢定位到数据库访问模式，而不是盲目改 Express。

**概念解释：** `measureQuery()` 在 repository 调用外层记录 model、operation、count、totalDurationMs 和 maxDurationMs。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `measureQuery()` wraps Prisma calls and records duration metrics; it does not change SQL semantics or make slow queries faster.

**底层机制：** `measureQuery()` 在 repository 调用外层记录 model、operation、count、totalDurationMs 和 maxDurationMs。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/src/db/query-metrics.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `count/total/max duration`，入口或触发点是 `repository call`，负载或执行来源是 `API traffic`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/src/db/query-metrics.ts`，围绕 `summaries`、`process.hrtime.bigint()`、`finally`、`queryDurationSeconds.observe()` 说明 query measurement and N+1 detection 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/db/query-metrics.ts</span>
  </div>

```ts
import { Histogram } from "prom-client";
import { metricsRegistry } from "../observability/metrics.js";

export interface QueryMetricSummary {
  model: string;
  operation: string;
  count: number;
  totalDurationMs: number;
  maxDurationMs: number;
}

const summaries = new Map<string, QueryMetricSummary>();

export const queryDurationSeconds = new Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration by model and operation.",
  labelNames: ["model", "operation"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [metricsRegistry]
});

export async function measureQuery<T>(model: string, operation: string, action: () => Promise<T>): Promise<T> {
  const startedAt = process.hrtime.bigint();
  try {
    return await action();
  } finally {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const key = model + "." + operation;
    const existing = summaries.get(key) ?? {
      model,
      operation,
      count: 0,
      totalDurationMs: 0,
      maxDurationMs: 0
    };
    existing.count += 1;
    existing.totalDurationMs += durationMs;
    existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
    summaries.set(key, existing);
    queryDurationSeconds.observe({ model, operation }, durationMs / 1000);
  }
}

export function getQueryMetricSummary(): QueryMetricSummary[] {
  return Array.from(summaries.values()).map((summary) => ({
    ...summary,
    totalDurationMs: Number(summary.totalDurationMs.toFixed(3)),
    maxDurationMs: Number(summary.maxDurationMs.toFixed(3))
  }));
}
```
</div>

**逐行解释：** `summaries` 保存低基数统计；`process.hrtime.bigint()` 记录开始时间；`finally` 保证成功或失败都记录 duration；`queryDurationSeconds.observe()` 写 Prometheus histogram；`getQueryMetricSummary()` 导出 count/total/max。

**运行方式：** 运行 `npm test -- --test-concurrency=1` 后请求 `/performance/query-summary` 观察统计。

**预期输出：** The wrapper accumulates query count, total duration, max duration, and histogram samples by model and operation.

**执行过程：** Record `startedAt`, await the query action, calculate duration in milliseconds, update the in-memory summary, and observe the histogram.

**变量、引用、资源与生命周期变化：** Each query call creates one timing window; summaries persist in a map; metrics registry exposes aggregated observations.

**为什么会得到这个结果：** N+1 appears as high query count with repeated small durations, while one slow query appears as a high max duration.

**对比情况：** Optimizing an index addresses slow single queries; changing include/select shape addresses repeated query count.

**常见错误为什么错：** Looking only at total duration violates the diagnostic rule that count and max duration distinguish different database bottlenecks.

**与真实项目的关系：** Repository-level metrics reveal whether a slow endpoint needs SQL tuning, relation batching, or request-level caching.

**与当前学习路径的关系：** 连接 Chapter 05 repository pattern 和 Chapter 10 metrics。

**最终记忆模型：** 慢不只来自单条 SQL；query count 随 N 增长就是 N+1 的核心信号。

**机制证据链：** The table traces one Prisma action through timing, aggregation, histogram observation, and N+1 recognition.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `repository call` | `API traffic` | count/total/max duration | service -> repository -> database | N+1 | batch/include/reshape query | query count stops scaling | optimize one SQL only | rows increase and query count increases |

<a id="section-9-18"></a>

### 9.18 Redis pipelining、round-trip cost 与 cache hit/miss interpretation

**结论：** Redis pipeline 减少 round trip；cache hit/miss 解释缓存策略，二者不能混为一个指标。

**本节解决的问题：** 本节解决 Redis round trip 与缓存解释分离的问题：pipeline 改变网络往返次数，hit/miss 改变是否需要回源。

**技术意义：** 这能避免把 pipeline 后的低 latency 误读为 cache strategy 变好，也避免把 hit rate 问题误修成 Redis 命令批处理问题。

**概念解释：** `runRedisPipelineDemo()` 对比 sequential set 和 pipeline set，并记录 hit/miss demo counter。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `client.multi().exec()` batches Redis commands over one connection; cache hit and miss interpretation is a separate application-level signal.

**底层机制：** `runRedisPipelineDemo()` 对比 sequential set 和 pipeline set，并记录 hit/miss demo counter。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/src/redis/redis-performance.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `sequentialDurationMs vs pipelineDurationMs`，入口或触发点是 ``/performance/redis-pipeline-demo``，负载或执行来源是 `HTTP request`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/src/redis/redis-performance.ts`，围绕 `connectRedisClient()`、`await client.set()`、`client.multi()`、`execAsPipeline()` 说明 Redis pipeline RTT and cache interpretation 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/redis/redis-performance.ts</span>
  </div>

```ts
import { Counter } from "prom-client";
import { metricsRegistry } from "../observability/metrics.js";
import { connectRedisClient } from "./redis-client.js";

export interface RedisPipelineDemoResult {
  commandCount: number;
  sequentialDurationMs: number;
  pipelineDurationMs: number;
}

export const redisCacheDemoTotal = new Counter({
  name: "redis_cache_demo_total",
  help: "Redis demo cache observations by result.",
  labelNames: ["result"] as const,
  registers: [metricsRegistry]
});

export async function runRedisPipelineDemo(commandCount = 20): Promise<RedisPipelineDemoResult> {
  const safeCount = Math.max(1, Math.min(commandCount, 50));
  const client = await connectRedisClient();
  const baseKey = "performance-demo:" + Date.now();

  const sequentialStart = process.hrtime.bigint();
  for (let index = 0; index < safeCount; index += 1) {
    await client.set(baseKey + ":sequential:" + index, String(index), { EX: 60 });
  }
  const sequentialDurationMs = Number(process.hrtime.bigint() - sequentialStart) / 1_000_000;

  const pipeline = client.multi();
  for (let index = 0; index < safeCount; index += 1) {
    pipeline.set(baseKey + ":pipeline:" + index, String(index), { EX: 60 });
  }
  const pipelineStart = process.hrtime.bigint();
  await (pipeline as unknown as { execAsPipeline: () => Promise<unknown> }).execAsPipeline();
  const pipelineDurationMs = Number(process.hrtime.bigint() - pipelineStart) / 1_000_000;

  redisCacheDemoTotal.inc({ result: "hit" }, safeCount);
  redisCacheDemoTotal.inc({ result: "miss" }, 0);

  return {
    commandCount: safeCount,
    sequentialDurationMs: Number(sequentialDurationMs.toFixed(3)),
    pipelineDurationMs: Number(pipelineDurationMs.toFixed(3))
  };
}
```
</div>

**逐行解释：** `connectRedisClient()` 复用 client；sequential loop 每次 `await client.set()`；`client.multi()` 创建 pipeline；`execAsPipeline()` 批量发送；duration 分别用 `process.hrtime.bigint()` 测量。

**运行方式：** 运行 `npm run smoke` 确认 Redis ready，再请求 `/performance/redis-pipeline-demo`。

**预期输出：** The sequential demo reports multiple round trips, while the pipeline demo sends commands together and reduces RTT overhead.

**执行过程：** Issue sequential commands one after another, then issue the same logical commands through a pipeline and compare measured duration.

**变量、引用、资源与生命周期变化：** Command strings enter the Redis client; the socket carries either multiple request/response cycles or one batched cycle; results return as ordered replies.

**为什么会得到这个结果：** Pipeline improves latency when network round trips dominate; it does not make Redis computation or cache design automatically correct.

**对比情况：** A cache hit avoids database work; a pipeline reduces command round trips. These are different performance mechanisms.

**常见错误为什么错：** Calling pipeline a universal speedup violates the rule that RTT, cache hit rate, and data freshness must be interpreted separately.

**与真实项目的关系：** High-volume endpoints often combine cache hit metrics with Redis command timing before changing cache keys or batching behavior.

**与当前学习路径的关系：** 连接 Chapter 07 Redis cache/session 和 Chapter 10 metrics。

**最终记忆模型：** Pipeline 优化 RTT；cache hit/miss 解释是否回源；两个指标回答不同问题。

**机制证据链：** The table follows Redis commands through sequential RTT, pipelined RTT, and cache hit/miss diagnosis.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``/performance/redis-pipeline-demo`` | `HTTP request` | sequentialDurationMs vs pipelineDurationMs | Node Redis client -> socket -> Redis | RTT or miss pattern | pipeline small batches | pipeline duration lower | pipeline unrelated misses | many small Redis round trips |

<a id="section-9-19"></a>

### 9.19 Rate limiting、auth/session hot path 与 load behavior

**结论：** 安全 middleware 在 hot path 上，负载验证不能为了 RPS 关闭 rate limit、auth 或 session。

**本节解决的问题：** 本节解决安全 middleware 对压测结果的影响问题：auth、session 和 rate limit 是 production path 的一部分，不能为追求 RPS 随意关闭。

**技术意义：** Hot path 上的安全检查会消耗 Redis、cookie parsing 和 validation 时间；压测必须保留这些成本才能代表真实请求。

**概念解释：** `apiRateLimit` 用 `express-rate-limit` 设置 `windowMs`、`limit`、standard headers 和 legacy headers。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** Authentication, CSRF, cookie parsing, and rate limits are security middleware; they execute on the hot path but must remain enabled during performance validation.

**底层机制：** `apiRateLimit` 用 `express-rate-limit` 设置 `windowMs`、`limit`、standard headers 和 legacy headers。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/src/shared/middleware/rate-limit.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `401/429 and latency`，入口或触发点是 `protected route`，负载或执行来源是 `small repeated load`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/src/shared/middleware/rate-limit.ts`，围绕 `rateLimit()`、`windowMs`、`limit`、`standardHeaders:true` 说明 auth and rate-limit hot path 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/middleware/rate-limit.ts</span>
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

**逐行解释：** `rateLimit()` 返回 Express middleware；`windowMs` 定义计数窗口；`limit` 控制窗口内最大请求；`standardHeaders:true` 暴露标准限流头；`legacyHeaders:false` 避免旧头；该 middleware 在 `src/app.ts` 中早于业务 routes 执行。

**运行方式：** 运行 `npm run load:baseline` 时总请求数保持在限流预算内；认证路径用 Chapter 06 的 session/cookie 规则验证。

**预期输出：** The route keeps session authentication, CSRF where required, secure cookies, and rate limiting while measuring overhead.

**执行过程：** Parse cookies, resolve the session, attach auth context, enforce CSRF for mutating routes, and apply rate limits before controller logic.

**变量、引用、资源与生命周期变化：** Cookie values become session lookup inputs; auth context lives on the request; Redis or in-memory limiter state records request counts.

**为什么会得到这个结果：** Security middleware consumes CPU and I/O, so disabling it makes the benchmark unrepresentative and can hide real bottlenecks.

**对比情况：** Optimizing password or session code is valid; removing authentication from a benchmark invalidates the measured route.

**常见错误为什么错：** Bypassing auth for a faster benchmark violates the production-equivalence rule for performance validation.

**与真实项目的关系：** Release gates measure the same middleware stack users hit, then optimize the expensive layer without weakening security.

**与当前学习路径的关系：** 连接 Chapter 06 auth/session 和 Chapter 07 Redis/session storage。

**最终记忆模型：** 性能验证要包含安全路径；关闭 auth/rate limit 得到的是实验捷径，不是生产容量。

**机制证据链：** The table traces a request through auth, CSRF, rate limit, controller execution, and safe optimization boundaries.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `protected route` | `small repeated load` | 401/429 and latency | middleware -> auth/session -> route | security hot path | optimize without disabling security | latency improves and protection remains | remove limiter/auth for tests | authenticated routes slow or 429 appears |

<a id="section-9-20"></a>

### 9.20 Container CPU/memory limit、Docker stats 与 runtime capacity

**结论：** `docker stats --no-stream` 是容器层信号；它不能替代 Node heap 或 query profiling。

**本节解决的问题：** 本节解决 Node 内部指标和容器外部指标如何合并判断容量的问题：process memory、event loop、Docker CPU/memory 分属不同边界。

**技术意义：** 容器 limit 决定进程能用的外层资源，Node metrics 决定资源在 V8、Buffer、I/O 和业务代码中的消耗位置。

**概念解释：** `parseDockerStatsRow()` 解析 stats 行，`containerMemoryRatio()` 计算 memory usage/limit ratio。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `docker stats --no-stream` reports container CPU and memory from the Docker runtime; the parser converts text-like stats into budget evidence.

**底层机制：** `parseDockerStatsRow()` 解析 stats 行，`containerMemoryRatio()` 计算 memory usage/limit ratio。

**API / 语法规则：** 本节核心 API 或命令来自 `practices/12-performance-scalability/08-container-capacity/docker-stats-interpretation.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `CPU and memory ratio`，入口或触发点是 `docker stats`，负载或执行来源是 `capacity report`。

**示例结构：** 本节示例绑定 `practices/12-performance-scalability/08-container-capacity/docker-stats-interpretation.ts`，围绕 `line.trim().split(/\s{2,}/)`、`cpuRaw.replace("%","")`、`memoryRaw.split(" / ")`、`containerMemoryRatio()` 说明 Docker stats and capacity checklist 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/12-performance-scalability/08-container-capacity/docker-stats-interpretation.ts</span>
  </div>

```ts

export interface DockerStatsRow {
  name: string;
  cpuPercent: number;
  memoryUsageMiB: number;
  memoryLimitMiB: number;
}

export function parseDockerStatsRow(line: string): DockerStatsRow {
  const [name, cpuRaw, memoryRaw] = line.trim().split(/\s{2,}/);
  const [usageRaw, limitRaw] = memoryRaw.split(" / ");
  return {
    name,
    cpuPercent: Number(cpuRaw.replace("%", "")),
    memoryUsageMiB: Number(usageRaw.replace("MiB", "")),
    memoryLimitMiB: Number(limitRaw.replace("MiB", ""))
  };
}

export function containerMemoryRatio(row: DockerStatsRow): number {
  return Number((row.memoryUsageMiB / row.memoryLimitMiB).toFixed(3));
}
```
</div>

**逐行解释：** `line.trim().split(/\s{2,}/)` 按多空格拆列；`cpuRaw.replace("%","")` 转成 CPU number；`memoryRaw.split(" / ")` 拆 usage 和 limit；`containerMemoryRatio()` 得到容量比例。

**运行方式：** 运行 `docker stats --no-stream performance-notes-api-api-1 ...` 或 `npm run capacity:report`。

**预期输出：** The capacity check reads CPU percent, memory usage, and memory limit, then uses those values for container capacity judgment.

**执行过程：** Collect one stats snapshot, parse the relevant fields, compare them with the capacity checklist, and keep the result tied to the Compose stack.

**变量、引用、资源与生命周期变化：** Container runtime counters become text fields; the parser creates numeric budget inputs; the checklist decides whether capacity is acceptable.

**为什么会得到这个结果：** The result is meaningful only when the API, NGINX, PostgreSQL, and Redis containers are running under the same load window.

**对比情况：** A local process memory sample describes one Node process; Docker stats describes the container resource boundary.

**常见错误为什么错：** Reading host CPU alone violates the container-capacity boundary because Compose services may have different limits and pressure.

**与真实项目的关系：** Capacity reviews use container counters together with route metrics to decide whether to tune code, pools, or deployment size.

**与当前学习路径的关系：** 连接 Chapter 11 Docker runtime 和本章 Node/process metrics。

**最终记忆模型：** Node memory explains process internals; Docker stats explains container boundary; capacity judgment needs both.

**机制证据链：** The table follows a Docker stats snapshot through parsing, threshold comparison, and capacity interpretation.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `docker stats` | `capacity report` | CPU and memory ratio | Docker runtime -> containers | container limit | reduce work or adjust capacity | stats below budget | debug only heap | container restarts while heap looks normal |

<a id="section-9-21"></a>

### 9.21 Regression benchmark、performance budget 与 capacity checklist

**结论：** 性能预算必须可执行：低于最小 RPS、高于最大 p95、errors 或 timeouts 超标都让脚本非零退出。

**本节解决的问题：** 本节解决如何把性能要求变成可失败命令的问题：budget script 必须读取 baseline 信号，并在 RPS、p95、errors 或 timeouts 超界时退出非零。

**技术意义：** 可执行预算让性能回归进入 CI/发布闸门；同一脚本重复运行才能比较改动前后的容量信号。

**概念解释：** `checkBenchmarkBudget()` 调用 `runLoadBaseline()`，比较 `requestsPerSecond`、`latencyP95`、`errors` 和 `timeouts`。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** `checkBenchmarkBudget()` is a release gate; it reads benchmark output and exits non-zero when throughput, p95, errors, or timeouts violate the budget.

**底层机制：** `checkBenchmarkBudget()` 调用 `runLoadBaseline()`，比较 `requestsPerSecond`、`latencyP95`、`errors` 和 `timeouts`。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/scripts/benchmark-budget.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `RPS/p95/errors/timeouts`，入口或触发点是 ``npm run benchmark:budget``，负载或执行来源是 `sampled load baseline`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/scripts/benchmark-budget.ts`，围绕 `defaultBudget`、`violations`、`filter(Boolean)`、`throw new Error()` 说明 benchmark budget enforcement 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/scripts/benchmark-budget.ts</span>
  </div>

```ts
import { pathToFileURL } from "node:url";
import { runLoadBaseline } from "./load-baseline.js";

export interface PerformanceBudget {
  minRequestsPerSecond: number;
  maxLatencyP95: number;
  maxErrors: number;
  maxTimeouts: number;
}

export const defaultBudget: PerformanceBudget = {
  minRequestsPerSecond: 20,
  maxLatencyP95: 500,
  maxErrors: 0,
  maxTimeouts: 0
};

export async function checkBenchmarkBudget(budget = defaultBudget): Promise<void> {
  const result = await runLoadBaseline();
  const violations = [
    result.requestsPerSecond < budget.minRequestsPerSecond ? "requestsPerSecond" : undefined,
    result.latencyP95 > budget.maxLatencyP95 ? "latencyP95" : undefined,
    result.errors > budget.maxErrors ? "errors" : undefined,
    result.timeouts > budget.maxTimeouts ? "timeouts" : undefined
  ].filter(Boolean);

  if (violations.length > 0) {
    throw new Error("Budget violated: " + violations.join(", "));
  }

  console.log(JSON.stringify({ ok: true, result, budget }));
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  checkBenchmarkBudget().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
```
</div>

**逐行解释：** `defaultBudget` 固定阈值；`violations` 数组逐项检查；`filter(Boolean)` 移除未违规项；`throw new Error()` 让 npm script 非零退出；成功时输出 `{ ok:true, result, budget }`。

**运行方式：** 在 stack 运行时执行 `npm run benchmark:budget`；失败时先读错误字段，不直接调宽预算。

**预期输出：** The script accepts results that meet `minRequestsPerSecond`, `maxLatencyP95`, `maxErrors`, and `maxTimeouts`, and rejects violating results.

**执行过程：** Load the baseline result, compare each metric with its configured threshold, collect violations, and set process failure when any violation exists.

**变量、引用、资源与生命周期变化：** Benchmark JSON becomes budget input; violation strings become terminal evidence; the process exit status becomes CI gate state.

**为什么会得到这个结果：** A non-zero exit code makes performance regression visible to scripts and CI instead of leaving it as prose.

**对比情况：** A warning-only report informs humans; an enforced budget blocks a release when the threshold is crossed.

**常见错误为什么错：** Checking only RPS violates the budget rule because latency, errors, and timeouts can regress while throughput stays high.

**与真实项目的关系：** CI pipelines use this pattern to prevent a merge from silently increasing p95 or timeout counts.

**与当前学习路径的关系：** 连接 Chapter 10 regression metrics 和 Chapter 11 release validation。

**最终记忆模型：** 性能预算不是建议值；它是能让 build 失败的容量契约。

**机制证据链：** The table traces benchmark output through budget thresholds to process exit status.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``npm run benchmark:budget`` | `sampled load baseline` | RPS/p95/errors/timeouts | script -> NGINX -> API | performance regression | fix responsible layer | command exits 0 | widen budget to hide failure | error names violated metric |

<a id="section-9-22"></a>

### 9.22 Chapter integration: performance-notes-api

**结论：** `performance-notes-api` 把 event loop、CPU、Worker、memory、stream、Redis、query metrics 和 NGINX entry 合成一个验证闭环。

**本节解决的问题：** 本节解决如何把本章分散机制合成一个 production-like 学习项目的问题：同一 API 同时暴露 CPU、Worker、memory、stream、Redis、query metrics 和 NGINX entry。

**技术意义：** 集成项目让每个性能信号在同一 request lifecycle 中相互印证，避免只用孤立 snippet 讨论真实 backend capacity。

**概念解释：** `performanceRoutes` 映射 `/event-loop`、`/memory`、`/cpu-sync`、`/cpu-worker`、`/stream-report`、`/redis-pipeline-demo` 和 `/query-summary`。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** The route map crosses host, NGINX, Express, Worker Threads, Prisma/PostgreSQL, Redis, streams, metrics, and Docker lifecycle boundaries.

**底层机制：** `performanceRoutes` 映射 `/event-loop`、`/memory`、`/cpu-sync`、`/cpu-worker`、`/stream-report`、`/redis-pipeline-demo` 和 `/query-summary`。

**API / 语法规则：** 本节核心 API 或命令来自 `mini-projects/performance-notes-api/src/modules/performance/performance.routes.ts`，必须按该文件中的真实字段、函数和资源边界解释。

**固定属性名 / 固定方法名 / 参数签名：** 本节固定观察 `combined runtime signals`，入口或触发点是 ``http://localhost:8080/performance/*``，负载或执行来源是 `README validation commands`。

**示例结构：** 本节示例绑定 `mini-projects/performance-notes-api/src/modules/performance/performance.routes.ts`，围绕 `performanceRoutes.get()`、`http://localhost:8080` 说明 integrated runtime validation route map 的可观察边界。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/performance.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import * as controller from "./performance.controller.js";

export const performanceRoutes = Router();

performanceRoutes.get("/event-loop", controller.eventLoop);
performanceRoutes.get("/memory", controller.memory);
performanceRoutes.get("/cpu-sync", controller.cpuSync);
performanceRoutes.get("/cpu-worker", controller.cpuWorker);
performanceRoutes.get("/stream-report", controller.streamReport);
performanceRoutes.get("/redis-pipeline-demo", controller.redisPipelineDemo);
performanceRoutes.get("/query-summary", controller.querySummary);
```
</div>

**逐行解释：** `performanceRoutes.get()` 把每个 path 绑定到 controller；CPU sync 和 worker route 使用同一 schema；Redis 和 query route 通过真实依赖产生信号；所有外部验证仍走 `http://localhost:8080`。

**运行方式：** 运行 `docker compose up -d postgres redis api nginx` 后执行 `npm run smoke && npm run load:baseline && npm run benchmark:budget && npm run capacity:report`。

**预期输出：** Validation reaches `/health/*`, `/metrics`, and `/performance/*` through `http://localhost:8080`, then confirms each runtime layer emits its expected signal.

**执行过程：** Start Compose dependencies, apply migrations and seed data, start API and NGINX, run smoke/load/budget/capacity commands, then shut the stack down.

**变量、引用、资源与生命周期变化：** Containers own network services; the API process owns workers, Prisma, Redis clients, and metrics; shutdown closes those resources in order.

**为什么会得到这个结果：** Traffic through NGINX exercises the same entry path as the production simulation, so proxy, API, dependency, and capacity failures remain visible.

**对比情况：** Direct API-port testing can prove handler behavior; it cannot prove reverse-proxy headers, upstream routing, or exposed-port behavior.

**常见错误为什么错：** Calling the mini project complete after source typecheck violates the runtime-validation rule because database, Redis, NGINX, and Docker are untested.

**与真实项目的关系：** Production readiness requires a chain of source validation, dependency validation, route smoke, load baseline, budget enforcement, and capacity interpretation.

**与当前学习路径的关系：** 整合 Chapter 01 event loop、Chapter 02 streams、Chapter 05 Prisma、Chapter 07 Redis、Chapter 10 observability、Chapter 11 deployment。

**最终记忆模型：** Chapter 12 的闭环是：从 8080 进来，经过 NGINX/API/DB/Redis，再用 metrics、load 和 budget 验证。

**机制证据链：** The table connects every validation command to the runtime layer it actually proves.

| request path | load source | measured signal | runtime boundary crossed | bottleneck candidate | safe fix | verification signal | mistake case | how to recognize |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ``http://localhost:8080/performance/*`` | `README validation commands` | combined runtime signals | NGINX -> API -> Worker/DB/Redis | first failing layer | patch one layer | full chain passes | bypass NGINX | smoke/load target is 3020 |

## 10. API 与规则索引

| API / 命令 | 负责层 | 规则 |
| --- | --- | --- |
| `monitorEventLoopDelay()` | Node perf_hooks | 采样 event loop callback delay，需要 enable/disable |
| `eventLoopUtilization()` | Node perf_hooks | 比较两个采样窗口，不等同于 host CPU |
| `process.memoryUsage()` | Node process | 返回 rss、heapTotal、heapUsed、external、arrayBuffers |
| `v8.getHeapStatistics()` | V8 | 读取 heap limit 与 used heap 等统计 |
| `v8.writeHeapSnapshot()` | V8 diagnostics | 写本地 snapshot 文件，不能暴露为 public route |
| `new Worker()` | worker_threads | 适合 CPU JavaScript，不适合普通 database I/O |
| `cluster.fork()` | process scaling | 创建进程，不共享普通内存 |
| `writable.write()` | stream model | 返回 false 后等待 drain |
| `docker stats --no-stream` | container runtime | 读取 container CPU/memory/PIDs 信号 |
| `autocannon()` | load testing | 固定入口、connections、duration、pipelining 才能比较 |

## 11. 常见错误对照表

| Symptom | Violated Rule | Mechanism Cause | Evidence | Correction |
| --- | --- | --- | --- | --- |
| smoke 通过但 load 慢 | smoke 不证明容量 | 只检查两个 health endpoint | p95/p99 未测 | 建立 baseline load |
| CPU endpoint 拖慢所有请求 | CPU work 不能占主线程 | 同步循环阻塞 event loop | event loop delay 上升 | 用 Worker Threads 或缩小任务 |
| database ready 但 API 慢 | pool 不是无限资源 | query 排队或 N+1 | query count/duration 上升 | 复用 Prisma Client 并减少 query count |
| metrics label 爆炸 | label 必须低基数 | raw URL、id、email 进入 label | metrics cardinality 上升 | 使用 route pattern 和 status class |
| heap snapshot 泄露 | diagnostics 文件不是 public API | snapshot 包含对象图 | 文件可能含敏感数据 | 只写本地受控路径 |

## 12. 调试与验证方法

调试顺序是：确认入口、固定负载、读 health、读 metrics、读 logs、读 dependency status、读 Docker stats、只改一个层、复测同一命令。若测试挂起，先逐文件运行 `node --import tsx --test --test-concurrency=1 <test-file-path>`，再检查 server、Prisma、Redis、Worker 和 timer 是否关闭。

## 13. 分项练习说明

practice 目录分为 performance model、load testing、event loop CPU、workers cluster、memory V8、stream backpressure、database Redis performance、container capacity。每个文件都对应一个可观察问题：入口是否一致、信号是什么、候选瓶颈是哪一层、如何复测。

## 14. 最终迷你项目

最终小项目把本章机制整合到一个 production-like API 中，但不替代前面的分节教学。你应先掌握 9.x 的判断链，再阅读完整项目。

### 14.1 项目目标

`performance-notes-api` 在 Chapter 11 的 deployable notes API 基础上增加 performance routes、Prometheus metrics、event loop/memory/query/Redis/stream/worker signals、autocannon scripts 和 capacity report。它不包含 Kubernetes、Terraform、cloud load balancer、vendor APM 或 Redis Cluster。

### 14.2 最终迷你项目结构

| Area | Responsibility | Boundary |
| --- | --- | --- |
| `src/observability` | metrics、logs、event loop、memory、HTTP duration | low-cardinality measurement |
| `src/modules/performance` | CPU、Worker、memory、stream、Redis/query demos | bounded demo endpoints |
| `src/db` | Prisma Client reuse and query duration | database pool boundary |
| `src/redis` | Redis health and pipeline demo | command RTT boundary |
| `scripts` | smoke、load baseline、budget、capacity | validation and regression |
| `compose.yaml` | api/postgres/redis/nginx | production-like runtime |

### 14.3 完整项目代码

#### `mini-projects/performance-notes-api/package.json`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/package.json</span>
  </div>

```json
{
  "name": "performance-notes-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/server.js",
    "typecheck": "tsc --noEmit",
    "test": "node --import tsx --test tests/env.unit.test.ts tests/health.integration.test.ts tests/metrics.integration.test.ts tests/performance.unit.test.ts tests/worker-pool.unit.test.ts tests/stream-backpressure.unit.test.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "seed": "prisma db seed",
    "smoke": "tsx scripts/smoke-test.ts",
    "load:baseline": "tsx scripts/load-baseline.ts",
    "benchmark:budget": "tsx scripts/benchmark-budget.ts",
    "capacity:report": "tsx scripts/capacity-report.ts"
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
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^26.1.1",
    "@types/pg": "^8.20.0",
    "@types/supertest": "^7.2.1",
    "autocannon": "^8.0.0",
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

#### `mini-projects/performance-notes-api/tsconfig.json`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tsconfig.json</span>
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

#### `mini-projects/performance-notes-api/.env.example`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/.env.example</span>
  </div>

```txt
NODE_ENV=development
PORT=3020
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/performance_notes_api
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=performance_notes_session
SESSION_SECRET=development-session-secret-change-me-32
SESSION_TTL_SECONDS=604800
CSRF_COOKIE_NAME=performance_notes_csrf
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
TRUST_PROXY=1
COOKIE_SECURE=false
LOG_LEVEL=info
SHUTDOWN_TIMEOUT_MS=10000
```
</div>

#### `mini-projects/performance-notes-api/.dockerignore`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/.dockerignore</span>
  </div>

```txt
node_modules
npm-debug.log
*.log
logs
.env
.env.*
coverage
docs
dist
.git
.github
secrets
*.pem
*.key
diagnostic-reports
tmp
```
</div>

#### `mini-projects/performance-notes-api/Dockerfile`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/Dockerfile</span>
  </div>

```txt
# syntax=docker/dockerfile:1
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
EXPOSE 3020
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3020/health/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/src/server.js"]
```
</div>

#### `mini-projects/performance-notes-api/compose.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/compose.yaml</span>
  </div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: performance_notes_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - performance-postgres-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d performance_notes_api"]
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
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/performance_notes_api
      REDIS_URL: redis://redis:6379
      SESSION_COOKIE_NAME: performance_notes_session
      SESSION_SECRET: local-compose-session-secret-32chars
      SESSION_TTL_SECONDS: 604800
      CSRF_COOKIE_NAME: performance_notes_csrf
      ALLOWED_ORIGINS: http://localhost:8080,http://127.0.0.1:8080
      TRUST_PROXY: "1"
      COOKIE_SECURE: "false"
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3020/health/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]
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
  performance-postgres-data:
```
</div>

#### `mini-projects/performance-notes-api/nginx/nginx.conf`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/nginx/nginx.conf</span>
  </div>

```txt
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

upstream performance_notes_api {
  server api:3020;
}

server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://performance_notes_api;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_buffering off;
    proxy_read_timeout 60s;
  }
}
```
</div>
#### `mini-projects/performance-notes-api/prisma.config.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/prisma.config.ts</span>
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
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/performance_notes_api"
  }
});
```
</div>
#### `mini-projects/performance-notes-api/prisma/schema.prisma`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/prisma/schema.prisma</span>
  </div>

```txt
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

  @@unique([ownerId, name])
  @@index([ownerId])
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

  @@unique([notebookId, title])
  @@index([ownerId])
  @@index([notebookId])
  @@index([status, createdAt])
}
```
</div>

#### `mini-projects/performance-notes-api/prisma/seed.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/prisma/seed.ts</span>
  </div>

```ts
import { prisma } from "../src/db/prisma.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

async function seed(): Promise<void> {
  const passwordHash = await hashPassword("ChangeMe123!45");

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
      role: "USER"
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: "Release Notes"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      name: "Release Notes"
    }
  });

  await prisma.note.upsert({
    where: {
      notebookId_title: {
        notebookId: notebook.id,
        title: "Deployment checklist"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      notebookId: notebook.id,
      title: "Deployment checklist",
      body: "Run install, generate, typecheck, test, build, migrate deploy, and smoke."
    }
  });
}

await seed();
await prisma.$disconnect();
```
</div>

#### `mini-projects/performance-notes-api/prisma/migrations/0001_init/migration.sql`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/prisma/migrations/0001_init/migration.sql</span>
  </div>

```txt
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(320) NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" VARCHAR(96) NOT NULL,
  "csrfTokenHash" VARCHAR(96),
  "userAgent" VARCHAR(512),
  "ipHash" VARCHAR(96),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notebook" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notebook_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Note" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL,
  "notebookId" UUID NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "body" TEXT NOT NULL DEFAULT '',
  "status" "NoteStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "Notebook_ownerId_name_key" ON "Notebook"("ownerId", "name");
CREATE INDEX "Notebook_ownerId_idx" ON "Notebook"("ownerId");
CREATE UNIQUE INDEX "Note_notebookId_title_key" ON "Note"("notebookId", "title");
CREATE INDEX "Note_ownerId_idx" ON "Note"("ownerId");
CREATE INDEX "Note_notebookId_idx" ON "Note"("notebookId");
CREATE INDEX "Note_status_createdAt_idx" ON "Note"("status", "createdAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notebook" ADD CONSTRAINT "Notebook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "Notebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
</div>

#### `mini-projects/performance-notes-api/src/app.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/app.ts</span>
  </div>

```ts
import express, { type Express } from "express";
import type { AppConfig } from "./config/env.js";
import { config } from "./config/env.js";
import { createProductionRuntimePolicy } from "./config/production.js";
import { healthRoutes } from "./health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notebookNotesRoutes } from "./modules/notes/notebook-notes.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { performanceRoutes } from "./modules/performance/performance.routes.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { requestLogger } from "./observability/request-logger.js";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
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
  app.use(requestLogger);

  app.use("/health", healthRoutes);
  app.use("/metrics", metricsRoutes);
  app.use("/performance", performanceRoutes);
  app.use("/auth", authRoutes);
  app.use("/notebooks/:notebookId/notes", authenticateSession, notebookNotesRoutes);
  app.use("/notebooks", authenticateSession, notebookRoutes);
  app.use("/notes", authenticateSession, notesRoutes);

  app.use(notFound);
  app.use(errorLogger);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
```
</div>

#### `mini-projects/performance-notes-api/src/server.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/server.ts</span>
  </div>

```ts
import { createServer, type Server } from "node:http";
import { config } from "./config/env.js";
import { createApp } from "./app.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeCpuWorkerPool } from "./modules/performance/cpu-task.service.js";
import { logger } from "./observability/logger.js";
import { startEventLoopMetrics, stopEventLoopMetrics } from "./observability/event-loop-metrics.js";
import { closeRedisClient } from "./redis/redis-client.js";

export interface ShutdownResource {
  name: string;
  close: () => Promise<void> | void;
}

export interface GracefulShutdownOptions {
  server: Server;
  timeoutMs: number;
  resources: ShutdownResource[];
}

async function closeHttpServer(server: Server, timeoutMs: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.closeAllConnections();
      reject(new Error("HTTP server shutdown timed out."));
    }, timeoutMs);
    timeout.unref();

    server.close((error) => {
      clearTimeout(timeout);
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function createGracefulShutdown(options: GracefulShutdownOptions) {
  let closing = false;

  return async (signal: NodeJS.Signals): Promise<void> => {
    if (closing) return;
    closing = true;
    logger.info({ signal }, "shutdown signal received");

    try {
      await closeHttpServer(options.server, options.timeoutMs);

      for (const resource of options.resources) {
        try {
          await resource.close();
          logger.info({ resource: resource.name }, "shutdown resource closed");
        } catch (error) {
          logger.error({ resource: resource.name, error }, "shutdown resource close failed");
        }
      }
    } finally {
      process.exitCode = 0;
    }
  };
}

export function startServer(): Server {
  startEventLoopMetrics();
  const server = createServer(createApp(config));
  const shutdown = createGracefulShutdown({
    server,
    timeoutMs: config.SHUTDOWN_TIMEOUT_MS,
    resources: [
      { name: "worker-pool", close: closeCpuWorkerPool },
      { name: "event-loop-metrics", close: stopEventLoopMetrics },
      { name: "redis", close: closeRedisClient },
      { name: "prisma", close: disconnectPrisma }
    ]
  });

  server.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, "HTTP server started");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  return server;
}

if (process.env.NODE_ENV !== "test") {
  try {
    startServer();
  } catch (error) {
    logger.error({ error }, "server startup failed");
    process.exitCode = 1;
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/config/env.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

export type TrustProxyValue = boolean | number;

function numberFromEnv(defaultValue: number) {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    return Number(value);
  }, z.number().int().positive());
}

function optionalBooleanFromEnv() {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return undefined;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean().optional());
}

function trustProxyFromEnv(defaultValue: TrustProxyValue) {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    if (typeof value === "boolean" || typeof value === "number") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    const numericValue = Number(value);
    if (Number.isInteger(numericValue) && numericValue >= 0) return numericValue;
    return value;
  }, z.union([z.boolean(), z.number().int().nonnegative()]));
}

function splitOrigins(value: string): string[] {
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: numberFromEnv(3020),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/performance_notes_api"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("performance_notes_session"),
  SESSION_SECRET: z.string().min(32).default("development-session-secret-change-me-32"),
  SESSION_TTL_SECONDS: numberFromEnv(604800),
  CSRF_COOKIE_NAME: z.string().min(1).default("performance_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  TRUST_PROXY: trustProxyFromEnv(1),
  COOKIE_SECURE: optionalBooleanFromEnv(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  SHUTDOWN_TIMEOUT_MS: numberFromEnv(10000)
});

export type RawAppConfig = z.infer<typeof envSchema>;

export interface AppConfig extends Omit<RawAppConfig, "ALLOWED_ORIGINS" | "COOKIE_SECURE"> {
  ALLOWED_ORIGINS: string[];
  COOKIE_SECURE: boolean;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(source);

  if (parsed.NODE_ENV === "production" && parsed.SESSION_SECRET.includes("development")) {
    throw new Error("SESSION_SECRET must be replaced before production startup.");
  }

  return {
    ...parsed,
    ALLOWED_ORIGINS: splitOrigins(parsed.ALLOWED_ORIGINS),
    COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production"
  };
}

export const config = loadEnv();
```
</div>

#### `mini-projects/performance-notes-api/src/db/prisma.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/db/prisma.ts</span>
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

`../generated/prisma/client.js` 是 `npm run prisma:generate` 产生的 Prisma Client 入口，不属于本章手写源码。手写边界在 `src/db/prisma.ts`：它负责创建 adapter、复用单个 `PrismaClient`，并在进程关闭时调用 `$disconnect()`。

#### `mini-projects/performance-notes-api/src/db/prisma-errors.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/db/prisma-errors.ts</span>
  </div>

```ts
import { HttpError } from "../shared/errors/http-error.js";

interface PrismaLikeError {
  code?: string;
}

export function mapPrismaError(error: unknown): HttpError | undefined {
  const candidate = error as PrismaLikeError;

  if (candidate.code === "P2002") {
    return new HttpError(409, "CONFLICT", "Resource already exists.");
  }

  if (candidate.code === "P2025") {
    return new HttpError(404, "NOT_FOUND", "Resource was not found.");
  }

  return undefined;
}
```
</div>

#### `mini-projects/performance-notes-api/src/db/query-metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/db/query-metrics.ts</span>
  </div>

```ts
import { Histogram } from "prom-client";
import { metricsRegistry } from "../observability/metrics.js";

export interface QueryMetricSummary {
  model: string;
  operation: string;
  count: number;
  totalDurationMs: number;
  maxDurationMs: number;
}

const summaries = new Map<string, QueryMetricSummary>();

export const queryDurationSeconds = new Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration by model and operation.",
  labelNames: ["model", "operation"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [metricsRegistry]
});

export async function measureQuery<T>(model: string, operation: string, action: () => Promise<T>): Promise<T> {
  const startedAt = process.hrtime.bigint();
  try {
    return await action();
  } finally {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const key = model + "." + operation;
    const existing = summaries.get(key) ?? {
      model,
      operation,
      count: 0,
      totalDurationMs: 0,
      maxDurationMs: 0
    };
    existing.count += 1;
    existing.totalDurationMs += durationMs;
    existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
    summaries.set(key, existing);
    queryDurationSeconds.observe({ model, operation }, durationMs / 1000);
  }
}

export function getQueryMetricSummary(): QueryMetricSummary[] {
  return Array.from(summaries.values()).map((summary) => ({
    ...summary,
    totalDurationMs: Number(summary.totalDurationMs.toFixed(3)),
    maxDurationMs: Number(summary.maxDurationMs.toFixed(3))
  }));
}
```
</div>
#### `mini-projects/performance-notes-api/src/db/db-health.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/db/db-health.ts</span>
  </div>

```ts
import { prisma } from "./prisma.js";

export async function checkDatabase(): Promise<"ready" | "unavailable"> {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return "ready";
  } catch {
    return "unavailable";
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/redis/redis-client.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/redis/redis-client.ts</span>
  </div>

```ts
import { createClient } from "redis";
import { config } from "../config/env.js";

let redisClient: ReturnType<typeof createClient> | undefined;

export function getRedisClient(): ReturnType<typeof createClient> {
  if (!redisClient) {
    redisClient = createClient({
      url: config.REDIS_URL
    });
  }

  return redisClient;
}

export async function connectRedisClient(): Promise<ReturnType<typeof createClient>> {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function closeRedisClient(): Promise<void> {
  if (!redisClient) return;
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  redisClient = undefined;
}
```
</div>

#### `mini-projects/performance-notes-api/src/redis/redis-health.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/redis/redis-health.ts</span>
  </div>

```ts
import { connectRedisClient } from "./redis-client.js";

export async function checkRedis(): Promise<"ready" | "unavailable"> {
  try {
    const client = await connectRedisClient();
    const pong = await client.ping();
    return pong === "PONG" ? "ready" : "unavailable";
  } catch {
    return "unavailable";
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/redis/redis-performance.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/redis/redis-performance.ts</span>
  </div>

```ts
import { Counter } from "prom-client";
import { metricsRegistry } from "../observability/metrics.js";
import { connectRedisClient } from "./redis-client.js";

export interface RedisPipelineDemoResult {
  commandCount: number;
  sequentialDurationMs: number;
  pipelineDurationMs: number;
}

export const redisCacheDemoTotal = new Counter({
  name: "redis_cache_demo_total",
  help: "Redis demo cache observations by result.",
  labelNames: ["result"] as const,
  registers: [metricsRegistry]
});

export async function runRedisPipelineDemo(commandCount = 20): Promise<RedisPipelineDemoResult> {
  const safeCount = Math.max(1, Math.min(commandCount, 50));
  const client = await connectRedisClient();
  const baseKey = "performance-demo:" + Date.now();

  const sequentialStart = process.hrtime.bigint();
  for (let index = 0; index < safeCount; index += 1) {
    await client.set(baseKey + ":sequential:" + index, String(index), { EX: 60 });
  }
  const sequentialDurationMs = Number(process.hrtime.bigint() - sequentialStart) / 1_000_000;

  const pipeline = client.multi();
  for (let index = 0; index < safeCount; index += 1) {
    pipeline.set(baseKey + ":pipeline:" + index, String(index), { EX: 60 });
  }
  const pipelineStart = process.hrtime.bigint();
  await (pipeline as unknown as { execAsPipeline: () => Promise<unknown> }).execAsPipeline();
  const pipelineDurationMs = Number(process.hrtime.bigint() - pipelineStart) / 1_000_000;

  redisCacheDemoTotal.inc({ result: "hit" }, safeCount);
  redisCacheDemoTotal.inc({ result: "miss" }, 0);

  return {
    commandCount: safeCount,
    sequentialDurationMs: Number(sequentialDurationMs.toFixed(3)),
    pipelineDurationMs: Number(pipelineDurationMs.toFixed(3))
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/observability/logger.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/logger.ts</span>
  </div>

```ts
import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: [
      "password",
      "passwordHash",
      "sessionToken",
      "csrfToken",
      "req.headers.authorization",
      "req.headers.cookie",
      "request.headers.authorization",
      "request.headers.cookie"
    ],
    censor: "[Redacted]"
  }
});
```
</div>

#### `mini-projects/performance-notes-api/src/observability/request-context.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/request-context.ts</span>
  </div>

```ts
import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}
```
</div>

#### `mini-projects/performance-notes-api/src/observability/request-logger.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/request-logger.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { recordHttpRequest } from "./http-metrics.js";

function scrubPattern(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ":id")
    .replace(/\d+/g, ":number");
}

function getRoutePattern(request: Request): string {
  if (request.route?.path) return scrubPattern(request.baseUrl + String(request.route.path));
  return scrubPattern(request.path);
}

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const route = getRoutePattern(request);

    recordHttpRequest({
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationSeconds
    });

    logger.info({
      requestId: response.getHeader("x-request-id"),
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationSeconds
    }, "request completed");
  });

  next();
}
```
</div>

#### `mini-projects/performance-notes-api/src/observability/error-logger.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/error-logger.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { logger } from "./logger.js";

function scrubPattern(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ":id")
    .replace(/\d+/g, ":number");
}

function getSafeRoutePattern(request: Parameters<ErrorRequestHandler>[1]): string {
  if (request.route?.path) return scrubPattern(request.baseUrl + String(request.route.path));
  return scrubPattern(request.path);
}

export const errorLogger: ErrorRequestHandler = (error, request, response, next) => {
  logger.error({
    requestId: response.getHeader("x-request-id"),
    method: request.method,
    route: getSafeRoutePattern(request),
    error
  }, "request failed");

  next(error);
};
```
</div>

#### `mini-projects/performance-notes-api/src/observability/metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/metrics.ts</span>
  </div>

```ts
import { Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: "performance-notes-api"
});

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "nodejs_"
});
```
</div>

#### `mini-projects/performance-notes-api/src/observability/event-loop-metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/event-loop-metrics.ts</span>
  </div>

```ts
import { eventLoopUtilization, monitorEventLoopDelay } from "node:perf_hooks";
import { Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

const delayHistogram = monitorEventLoopDelay({ resolution: 20 });
let interval: NodeJS.Timeout | undefined;
let previousUtilization = eventLoopUtilization();
let lastSnapshot = {
  delayMeanMs: 0,
  delayP95Ms: 0,
  delayMaxMs: 0,
  utilization: 0
};

export const eventLoopDelaySeconds = new Gauge({
  name: "node_event_loop_delay_seconds",
  help: "Event loop delay summary in seconds.",
  labelNames: ["quantile"] as const,
  registers: [metricsRegistry]
});

export const eventLoopUtilizationRatio = new Gauge({
  name: "node_event_loop_utilization_ratio",
  help: "Event loop utilization ratio for the last sample window.",
  registers: [metricsRegistry]
});

export function sampleEventLoopMetrics(): typeof lastSnapshot {
  const delayMeanMs = Number(delayHistogram.mean) / 1_000_000;
  const delayP95Ms = delayHistogram.percentile(95) / 1_000_000;
  const delayMaxMs = Number(delayHistogram.max) / 1_000_000;

  const current = eventLoopUtilization(previousUtilization);
  previousUtilization = eventLoopUtilization();
  lastSnapshot = {
    delayMeanMs,
    delayP95Ms,
    delayMaxMs,
    utilization: current.utilization
  };

  eventLoopDelaySeconds.set({ quantile: "mean" }, delayMeanMs / 1000);
  eventLoopDelaySeconds.set({ quantile: "p95" }, delayP95Ms / 1000);
  eventLoopDelaySeconds.set({ quantile: "max" }, delayMaxMs / 1000);
  eventLoopUtilizationRatio.set(current.utilization);
  delayHistogram.reset();
  return lastSnapshot;
}

export function startEventLoopMetrics(): void {
  if (interval) return;
  delayHistogram.enable();
  interval = setInterval(sampleEventLoopMetrics, 5000);
  interval.unref();
}

export function stopEventLoopMetrics(): void {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }
  delayHistogram.disable();
}

export function readEventLoopSnapshot() {
  return sampleEventLoopMetrics();
}
```
</div>

#### `mini-projects/performance-notes-api/src/observability/memory-metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/memory-metrics.ts</span>
  </div>

```ts
import v8 from "node:v8";
import { Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const processMemoryBytes = new Gauge({
  name: "node_process_memory_bytes",
  help: "Process memory usage by field.",
  labelNames: ["field"] as const,
  registers: [metricsRegistry]
});

export const v8HeapBytes = new Gauge({
  name: "node_v8_heap_bytes",
  help: "V8 heap statistics by field.",
  labelNames: ["field"] as const,
  registers: [metricsRegistry]
});

export function refreshMemoryMetrics() {
  const memory = process.memoryUsage();
  processMemoryBytes.set({ field: "rss" }, memory.rss);
  processMemoryBytes.set({ field: "heapTotal" }, memory.heapTotal);
  processMemoryBytes.set({ field: "heapUsed" }, memory.heapUsed);
  processMemoryBytes.set({ field: "external" }, memory.external);
  processMemoryBytes.set({ field: "arrayBuffers" }, memory.arrayBuffers);

  const heap = v8.getHeapStatistics();
  v8HeapBytes.set({ field: "heap_size_limit" }, heap.heap_size_limit);
  v8HeapBytes.set({ field: "total_heap_size" }, heap.total_heap_size);
  v8HeapBytes.set({ field: "used_heap_size" }, heap.used_heap_size);

  return {
    process: memory,
    heap
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/observability/http-metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/http-metrics.ts</span>
  </div>

```ts
import { Counter, Histogram } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds by method, route, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry]
});

export function recordHttpRequest(input: {
  method: string;
  route: string;
  statusCode: number;
  durationSeconds: number;
}): void {
  const statusClass = String(Math.trunc(input.statusCode / 100)) + "xx";
  const labels = {
    method: input.method,
    route: input.route,
    status_class: statusClass
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, input.durationSeconds);
}
```
</div>

#### `mini-projects/performance-notes-api/src/observability/metrics.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/observability/metrics.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { metricsRegistry } from "./metrics.js";
import { sampleEventLoopMetrics } from "./event-loop-metrics.js";
import { refreshMemoryMetrics } from "./memory-metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response, next) => {
  try {
    sampleEventLoopMetrics();
    refreshMemoryMetrics();
    response.type(metricsRegistry.contentType);
    response.send(await metricsRegistry.metrics());
  } catch (error) {
    next(error);
  }
});
```
</div>

#### `mini-projects/performance-notes-api/src/health/health.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/health/health.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import * as controller from "./health.controller.js";

export const healthRoutes = Router();

healthRoutes.get("/live", controller.live);
healthRoutes.get("/ready", controller.ready);
```
</div>

#### `mini-projects/performance-notes-api/src/health/health.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/health/health.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getLiveness, getReadiness } from "./health.service.js";
import { sendOk } from "../shared/responses/send-response.js";

export async function live(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, getLiveness());
  } catch (error) {
    next(error);
  }
}

export async function ready(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const readiness = await getReadiness();
    const statusCode = readiness.status === "ready" ? 200 : 503;
    sendOk(response.status(statusCode), readiness);
  } catch (error) {
    next(error);
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/health/health.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/health/health.service.ts</span>
  </div>

```ts
import { checkDatabase } from "../db/db-health.js";
import { checkRedis } from "../redis/redis-health.js";
import type { LiveHealth, ReadyHealth } from "./health.types.js";

export function getLiveness(): LiveHealth {
  return {
    status: "live",
    uptimeSeconds: Math.round(process.uptime())
  };
}

export async function getReadiness(): Promise<ReadyHealth> {
  const [postgres, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const ready = postgres === "ready" && redis === "ready";

  return {
    status: ready ? "ready" : "not_ready",
    dependencies: {
      postgres,
      redis
    }
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/health/health.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/health/health.types.ts</span>
  </div>

```ts
export type DependencyStatus = "ready" | "unavailable";

export interface LiveHealth {
  status: "live";
  uptimeSeconds: number;
}

export interface ReadyHealth {
  status: "ready" | "not_ready";
  dependencies: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/auth/auth.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/auth/auth.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { authenticateSession } from "../../shared/auth/authenticate-session.js";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: registerSchema }), controller.register);
authRoutes.post("/login", validateRequest({ body: loginSchema }), controller.login);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, controller.logout);
authRoutes.get("/me", authenticateSession, controller.me);
authRoutes.get("/csrf", authenticateSession, controller.csrf);
```
</div>

#### `mini-projects/performance-notes-api/src/modules/auth/auth.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/auth/auth.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { clearSessionCookies, serializeCsrfCookie, serializeSessionCookie } from "../../shared/cookies/session-cookie.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

function setSessionCookies(response: Response, result: { sessionToken: string; csrfToken: string }): void {
  response.setHeader("Set-Cookie", [
    serializeSessionCookie(result.sessionToken),
    serializeCsrfCookie(result.csrfToken)
  ]);
}

export async function register(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.register(request.body, {
      userAgent: request.get("user-agent"),
      ip: request.ip
    });
    setSessionCookies(response, result);
    sendCreated(response, { user: result.user, csrfToken: result.csrfToken });
  } catch (error) {
    next(error);
  }
}

export async function login(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.login(request.body, {
      userAgent: request.get("user-agent"),
      ip: request.ip
    });
    setSessionCookies(response, result);
    sendOk(response, { user: result.user, csrfToken: result.csrfToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.logout(getAuthContext(request));
    response.setHeader("Set-Cookie", clearSessionCookies());
    sendOk(response, result);
  } catch (error) {
    next(error);
  }
}

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { user: await service.me(getAuthContext(request)) });
  } catch (error) {
    next(error);
  }
}

export async function csrf(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.rotateCsrf(getAuthContext(request));
    response.setHeader("Set-Cookie", serializeCsrfCookie(result.csrfToken));
    sendOk(response, result);
  } catch (error) {
    next(error);
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/auth/auth.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/auth/auth.service.ts</span>
  </div>

```ts
import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { createCsrfToken, hashCsrfToken } from "../../shared/auth/csrf.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashSessionToken } from "../../shared/auth/session-token.js";
import type { AuthContext } from "../../shared/auth/auth-context.js";
import { AuthRepository } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import type { AuthSessionResult, PublicUser, SessionRequestMeta } from "./auth.types.js";

function toPublicUser(user: { id: string; email: string; role: "USER" | "ADMIN"; createdAt: Date }): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  };
}

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {}

  async register(input: RegisterInput, meta: SessionRequestMeta): Promise<AuthSessionResult> {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) throw new HttpError(409, "EMAIL_ALREADY_REGISTERED", "Email is already registered.");

    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.createUser(input.email, passwordHash);
    return this.createSessionForUser(user, meta);
  }

  async login(input: LoginInput, meta: SessionRequestMeta): Promise<AuthSessionResult> {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user || !await verifyPassword(input.password, user.passwordHash)) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    return this.createSessionForUser(user, meta);
  }

  async me(auth: AuthContext): Promise<PublicUser> {
    const user = await this.repository.findUserById(auth.userId);
    if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User was not found.");
    return toPublicUser(user);
  }

  async rotateCsrf(auth: AuthContext): Promise<{ csrfToken: string }> {
    const csrfToken = createCsrfToken();
    await this.repository.updateCsrfToken(auth.sessionId, hashCsrfToken(csrfToken));
    return { csrfToken };
  }

  async logout(auth: AuthContext): Promise<{ loggedOut: true }> {
    await this.repository.revokeSession(auth.sessionId);
    return { loggedOut: true };
  }

  private async createSessionForUser(
    user: { id: string; email: string; role: "USER" | "ADMIN"; createdAt: Date },
    meta: SessionRequestMeta
  ): Promise<AuthSessionResult> {
    const sessionToken = createSessionToken();
    const csrfToken = createCsrfToken();
    const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000);

    await this.repository.createSession({
      userId: user.id,
      tokenHash: hashSessionToken(sessionToken),
      csrfTokenHash: hashCsrfToken(csrfToken),
      userAgent: meta.userAgent,
      ipHash: meta.ip ? hashSessionToken(meta.ip) : undefined,
      expiresAt
    });

    return {
      user: toPublicUser(user),
      sessionToken,
      csrfToken,
      expiresAt
    };
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/auth/auth.repository.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/auth/auth.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import { measureQuery } from "../../db/query-metrics.js";

export class AuthRepository {
  findUserByEmail(email: string) {
    return measureQuery("User", "findUnique", () => prisma.user.findUnique({ where: { email } }));
  }

  findUserById(userId: string) {
    return measureQuery("User", "findUnique", () => prisma.user.findUnique({ where: { id: userId } }));
  }

  createUser(email: string, passwordHash: string) {
    return measureQuery("User", "create", () => prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER"
      }
    }));
  }

  createSession(input: {
    userId: string;
    tokenHash: string;
    csrfTokenHash: string;
    userAgent?: string;
    ipHash?: string;
    expiresAt: Date;
  }) {
    return measureQuery("Session", "create", () => prisma.session.create({ data: input }));
  }

  findActiveSessionByHash(tokenHash: string, now: Date) {
    return measureQuery("Session", "findFirst", () => prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now }
      },
      include: { user: true }
    }));
  }

  updateCsrfToken(sessionId: string, csrfTokenHash: string) {
    return measureQuery("Session", "update", () => prisma.session.update({
      where: { id: sessionId },
      data: { csrfTokenHash }
    }));
  }

  revokeSession(sessionId: string) {
    return measureQuery("Session", "update", () => prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    }));
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/auth/auth.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/auth/auth.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(128)
});

export const loginSchema = registerSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```
</div>

#### `mini-projects/performance-notes-api/src/modules/auth/auth.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/auth/auth.types.ts</span>
  </div>

```ts
export interface PublicUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface AuthSessionResult {
  user: PublicUser;
  sessionToken: string;
  csrfToken: string;
  expiresAt: Date;
}

export interface SessionRequestMeta {
  userAgent?: string;
  ip?: string;
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notebooks/notebooks.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notebooks/notebooks.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./notebooks.controller.js";
import { createNotebookSchema, notebookParamsSchema, updateNotebookSchema } from "./notebooks.schema.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", controller.list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookSchema }), controller.create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), controller.get);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookSchema }), controller.update);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), controller.remove);
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notebooks/notebooks.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notebooks/notebooks.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { NotebooksService } from "./notebooks.service.js";

const service = new NotebooksService();

function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export async function list(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebooks: await service.list(getAuthContext(request).userId) });
  } catch (error) {
    next(error);
  }
}

export async function create(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendCreated(response, { notebook: await service.create(getAuthContext(request).userId, request.body) });
  } catch (error) {
    next(error);
  }
}

export async function get(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebook: await service.get(getAuthContext(request).userId, routeParam(request, "notebookId")) });
  } catch (error) {
    next(error);
  }
}

export async function update(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebook: await service.update(getAuthContext(request).userId, routeParam(request, "notebookId"), request.body) });
  } catch (error) {
    next(error);
  }
}

export async function remove(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await service.remove(getAuthContext(request).userId, routeParam(request, "notebookId")));
  } catch (error) {
    next(error);
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notebooks/notebooks.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notebooks/notebooks.service.ts</span>
  </div>

```ts
import { HttpError } from "../../shared/errors/http-error.js";
import { NotebooksRepository } from "./notebooks.repository.js";
import type { CreateNotebookInput, UpdateNotebookInput } from "./notebooks.schema.js";
import type { NotebookDto } from "./notebooks.types.js";

function toNotebookDto(notebook: { id: string; ownerId: string; name: string; createdAt: Date; updatedAt: Date }): NotebookDto {
  return {
    id: notebook.id,
    ownerId: notebook.ownerId,
    name: notebook.name,
    createdAt: notebook.createdAt.toISOString(),
    updatedAt: notebook.updatedAt.toISOString()
  };
}

export class NotebooksService {
  constructor(private readonly repository = new NotebooksRepository()) {}

  async list(ownerId: string): Promise<NotebookDto[]> {
    return (await this.repository.list(ownerId)).map(toNotebookDto);
  }

  async get(ownerId: string, notebookId: string): Promise<NotebookDto> {
    const notebook = await this.repository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return toNotebookDto(notebook);
  }

  async create(ownerId: string, input: CreateNotebookInput): Promise<NotebookDto> {
    return toNotebookDto(await this.repository.create(ownerId, input.name));
  }

  async update(ownerId: string, notebookId: string, input: UpdateNotebookInput): Promise<NotebookDto> {
    return toNotebookDto(await this.repository.update(ownerId, notebookId, input.name));
  }

  async remove(ownerId: string, notebookId: string): Promise<{ deleted: true }> {
    await this.repository.remove(ownerId, notebookId);
    return { deleted: true };
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notebooks/notebooks.repository.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notebooks/notebooks.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import { measureQuery } from "../../db/query-metrics.js";

export class NotebooksRepository {
  list(ownerId: string) {
    return measureQuery("Notebook", "findMany", () => prisma.notebook.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" }
    }));
  }

  findOwned(ownerId: string, notebookId: string) {
    return measureQuery("Notebook", "findFirst", () => prisma.notebook.findFirst({
      where: { id: notebookId, ownerId }
    }));
  }

  create(ownerId: string, name: string) {
    return measureQuery("Notebook", "create", () => prisma.notebook.create({
      data: { ownerId, name }
    }));
  }

  update(ownerId: string, notebookId: string, name: string) {
    return measureQuery("Notebook", "update", () => prisma.notebook.update({
      where: { id: notebookId, ownerId },
      data: { name }
    }));
  }

  remove(ownerId: string, notebookId: string) {
    return measureQuery("Notebook", "delete", () => prisma.notebook.delete({
      where: { id: notebookId, ownerId }
    }));
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notebooks/notebooks.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notebooks/notebooks.schema.ts</span>
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

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>;
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notebooks/notebooks.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notebooks/notebooks.types.ts</span>
  </div>

```ts
export interface NotebookDto {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notes/notes.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notes/notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./notes.controller.js";
import { noteParamsSchema, updateNoteSchema } from "./notes.schema.js";

export const notesRoutes = Router();

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), controller.get);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteSchema }), controller.update);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), controller.remove);
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notes/notes.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notes/notes.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { NotesService } from "./notes.service.js";

const service = new NotesService();

function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export async function listForNotebook(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, {
      notes: await service.listForNotebook(getAuthContext(request).userId, routeParam(request, "notebookId"))
    });
  } catch (error) {
    next(error);
  }
}

export async function create(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendCreated(response, {
      note: await service.create(getAuthContext(request).userId, routeParam(request, "notebookId"), request.body)
    });
  } catch (error) {
    next(error);
  }
}

export async function get(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { note: await service.get(getAuthContext(request).userId, routeParam(request, "noteId")) });
  } catch (error) {
    next(error);
  }
}

export async function update(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { note: await service.update(getAuthContext(request).userId, routeParam(request, "noteId"), request.body) });
  } catch (error) {
    next(error);
  }
}

export async function remove(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await service.remove(getAuthContext(request).userId, routeParam(request, "noteId")));
  } catch (error) {
    next(error);
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notes/notes.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notes/notes.service.ts</span>
  </div>

```ts
import { HttpError } from "../../shared/errors/http-error.js";
import { NotebooksRepository } from "../notebooks/notebooks.repository.js";
import { NotesRepository } from "./notes.repository.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";
import type { NoteDto } from "./notes.types.js";

function toNoteDto(note: {
  id: string;
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}): NoteDto {
  return {
    id: note.id,
    ownerId: note.ownerId,
    notebookId: note.notebookId,
    title: note.title,
    body: note.body,
    status: note.status,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  };
}

export class NotesService {
  constructor(
    private readonly notesRepository = new NotesRepository(),
    private readonly notebooksRepository = new NotebooksRepository()
  ) {}

  async listForNotebook(ownerId: string, notebookId: string): Promise<NoteDto[]> {
    const notebook = await this.notebooksRepository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return (await this.notesRepository.listForNotebook(ownerId, notebookId)).map(toNoteDto);
  }

  async create(ownerId: string, notebookId: string, input: CreateNoteInput): Promise<NoteDto> {
    const notebook = await this.notebooksRepository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return toNoteDto(await this.notesRepository.create(ownerId, notebookId, input));
  }

  async get(ownerId: string, noteId: string): Promise<NoteDto> {
    const note = await this.notesRepository.findOwned(ownerId, noteId);
    if (!note) throw new HttpError(404, "NOTE_NOT_FOUND", "Note was not found.");
    return toNoteDto(note);
  }

  async update(ownerId: string, noteId: string, input: UpdateNoteInput): Promise<NoteDto> {
    return toNoteDto(await this.notesRepository.update(ownerId, noteId, input));
  }

  async remove(ownerId: string, noteId: string): Promise<{ deleted: true }> {
    await this.notesRepository.remove(ownerId, noteId);
    return { deleted: true };
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notes/notes.repository.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notes/notes.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import { measureQuery } from "../../db/query-metrics.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";

export class NotesRepository {
  async listForNotebook(ownerId: string, notebookId: string) {
    return measureQuery("Note", "findMany", () => prisma.note.findMany({
      where: { ownerId, notebookId },
      orderBy: { updatedAt: "desc" }
    }));
  }

  async findOwned(ownerId: string, noteId: string) {
    return measureQuery("Note", "findFirst", () => prisma.note.findFirst({
      where: { id: noteId, ownerId }
    }));
  }

  async create(ownerId: string, notebookId: string, input: CreateNoteInput) {
    return measureQuery("Note", "create", () => prisma.note.create({
      data: {
        ownerId,
        notebookId,
        title: input.title,
        body: input.body,
        status: input.status
      }
    }));
  }

  async update(ownerId: string, noteId: string, input: UpdateNoteInput) {
    return measureQuery("Note", "update", () => prisma.note.update({
      where: { id: noteId, ownerId },
      data: input
    }));
  }

  async remove(ownerId: string, noteId: string) {
    return measureQuery("Note", "delete", () => prisma.note.delete({
      where: { id: noteId, ownerId }
    }));
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notes/notes.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notes/notes.schema.ts</span>
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

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notes/notes.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notes/notes.types.ts</span>
  </div>

```ts
export type NoteStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface NoteDto {
  id: string;
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/performance/performance.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/performance.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import * as controller from "./performance.controller.js";

export const performanceRoutes = Router();

performanceRoutes.get("/event-loop", controller.eventLoop);
performanceRoutes.get("/memory", controller.memory);
performanceRoutes.get("/cpu-sync", controller.cpuSync);
performanceRoutes.get("/cpu-worker", controller.cpuWorker);
performanceRoutes.get("/stream-report", controller.streamReport);
performanceRoutes.get("/redis-pipeline-demo", controller.redisPipelineDemo);
performanceRoutes.get("/query-summary", controller.querySummary);
```
</div>

#### `mini-projects/performance-notes-api/src/modules/performance/performance.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/performance.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getQueryMetricSummary } from "../../db/query-metrics.js";
import { readEventLoopSnapshot } from "../../observability/event-loop-metrics.js";
import { runRedisPipelineDemo } from "../../redis/redis-performance.js";
import { sendOk } from "../../shared/responses/send-response.js";
import { runCpuTaskInWorker, runCpuTaskSync } from "./cpu-task.service.js";
import { readMemorySample } from "./memory-sample.service.js";
import { workSizeSchema } from "./performance.schema.js";
import { createStreamBackpressureReport } from "./stream-report.service.js";

export function eventLoop(_request: Request, response: Response): void {
  sendOk(response, readEventLoopSnapshot());
}

export function memory(_request: Request, response: Response): void {
  sendOk(response, readMemorySample());
}

export function cpuSync(request: Request, response: Response): void {
  const query = workSizeSchema.parse(request.query);
  sendOk(response, runCpuTaskSync(query.size));
}

export async function cpuWorker(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const query = workSizeSchema.parse(request.query);
    sendOk(response, await runCpuTaskInWorker(query.size));
  } catch (error) {
    next(error);
  }
}

export async function streamReport(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await createStreamBackpressureReport());
  } catch (error) {
    next(error);
  }
}

export async function redisPipelineDemo(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await runRedisPipelineDemo());
  } catch (error) {
    next(error);
  }
}

export function querySummary(_request: Request, response: Response): void {
  sendOk(response, {
    queries: getQueryMetricSummary()
  });
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/performance/cpu-task.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/cpu-task.service.ts</span>
  </div>

```ts
import { WorkerPool } from "./worker-pool.js";
import type { CpuTaskResult, WorkSize } from "./performance.types.js";

let cpuWorkerPool: WorkerPool | undefined;

function getCpuWorkerPool(): WorkerPool {
  cpuWorkerPool ??= new WorkerPool(2);
  return cpuWorkerPool;
}

export function iterationsForSize(size: WorkSize): number {
  return size === "medium" ? 90_000 : 25_000;
}

export function runBoundedCpuWork(iterations: number): number {
  let total = 0;
  for (let index = 1; index <= iterations; index += 1) {
    total += Math.sqrt(index) % 7;
  }
  return Number(total.toFixed(3));
}

export function runCpuTaskSync(size: WorkSize): CpuTaskResult {
  const iterations = iterationsForSize(size);
  const startedAt = process.hrtime.bigint();
  const result = runBoundedCpuWork(iterations);
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  return {
    size,
    iterations,
    result,
    durationMs: Number(durationMs.toFixed(3)),
    mode: "sync"
  };
}

export async function runCpuTaskInWorker(size: WorkSize): Promise<CpuTaskResult> {
  const iterations = iterationsForSize(size);
  const startedAt = process.hrtime.bigint();
  const result = await getCpuWorkerPool().run({ iterations });
  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  return {
    size,
    iterations,
    result,
    durationMs: Number(durationMs.toFixed(3)),
    mode: "worker"
  };
}

export async function closeCpuWorkerPool(): Promise<void> {
  await cpuWorkerPool?.close();
  cpuWorkerPool = undefined;
}
```
</div>
#### `mini-projects/performance-notes-api/src/modules/performance/worker-pool.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/worker-pool.ts</span>
  </div>

```ts
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

export interface WorkerTask {
  iterations: number;
}

interface PendingTask {
  id: number;
  task: WorkerTask;
  resolve: (value: number) => void;
  reject: (error: Error) => void;
}

interface WorkerState {
  worker: Worker;
  activeTask?: PendingTask;
}

interface WorkerLocation {
  url: URL;
  execArgv: string[];
}

function resolveWorkerLocation(workerUrl?: URL): WorkerLocation {
  if (workerUrl) {
    return { url: workerUrl, execArgv: [] };
  }

  const compiledWorkerUrl = new URL("./cpu-worker.js", import.meta.url);
  if (existsSync(fileURLToPath(compiledWorkerUrl))) {
    return { url: compiledWorkerUrl, execArgv: [] };
  }

  return {
    url: new URL("./cpu-worker.ts", import.meta.url),
    execArgv: ["--import", "tsx"]
  };
}

export class WorkerPool {
  private nextId = 1;
  private readonly queue: PendingTask[] = [];
  private readonly workers: WorkerState[];
  private readonly workerLocation: WorkerLocation;

  constructor(size = 2, workerUrl?: URL) {
    this.workerLocation = resolveWorkerLocation(workerUrl);
    this.workers = Array.from({ length: size }, () => this.createWorker());
  }

  get size(): number {
    return this.workers.length;
  }

  get pendingCount(): number {
    return this.queue.length + this.workers.filter((state) => state.activeTask).length;
  }

  run(task: WorkerTask): Promise<number> {
    return new Promise((resolve, reject) => {
      const pendingTask = {
        id: this.nextId,
        task,
        resolve,
        reject
      };
      this.nextId += 1;
      this.queue.push(pendingTask);
      this.dispatch();
    });
  }

  async close(): Promise<void> {
    for (const pending of this.queue.splice(0)) {
      pending.reject(new Error("Worker pool closed before task execution"));
    }
    await Promise.all(this.workers.map((state) => state.worker.terminate()));
  }

  private createWorker(): WorkerState {
    const state: WorkerState = {
      worker: new Worker(this.workerLocation.url, { execArgv: this.workerLocation.execArgv })
    };

    state.worker.on("message", (message: { id: number; result?: number; error?: string }) => {
      const activeTask = state.activeTask;
      if (!activeTask || activeTask.id !== message.id) return;
      state.activeTask = undefined;
      if (message.error) {
        activeTask.reject(new Error(message.error));
      } else {
        activeTask.resolve(message.result ?? 0);
      }
      this.dispatch();
    });

    state.worker.on("error", (error) => {
      const activeTask = state.activeTask;
      state.activeTask = undefined;
      activeTask?.reject(error instanceof Error ? error : new Error("Worker failed"));
      this.dispatch();
    });

    return state;
  }

  private dispatch(): void {
    for (const state of this.workers) {
      if (state.activeTask || this.queue.length === 0) continue;
      const nextTask = this.queue.shift();
      if (!nextTask) return;
      state.activeTask = nextTask;
      state.worker.postMessage({
        id: nextTask.id,
        iterations: nextTask.task.iterations
      });
    }
  }
}
```
</div>
#### `mini-projects/performance-notes-api/src/modules/performance/cpu-worker.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/cpu-worker.ts</span>
  </div>

```ts
import { parentPort } from "node:worker_threads";

function runBoundedCpuWork(iterations: number): number {
  const safeIterations = Math.max(1, Math.min(iterations, 5_000_000));
  let value = 0;
  for (let index = 0; index < safeIterations; index += 1) {
    value = (value + Math.sqrt(index + 1)) % 1_000_000;
  }
  return Number(value.toFixed(3));
}

if (!parentPort) {
  throw new Error("cpu-worker requires parentPort");
}

parentPort.on("message", (message: { id: number; iterations: number }) => {
  try {
    parentPort?.postMessage({
      id: message.id,
      result: runBoundedCpuWork(message.iterations)
    });
  } catch (error) {
    parentPort?.postMessage({
      id: message.id,
      error: error instanceof Error ? error.message : "Worker task failed"
    });
  }
});
```
</div>

#### `mini-projects/performance-notes-api/src/modules/performance/memory-sample.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/memory-sample.service.ts</span>
  </div>

```ts
import { refreshMemoryMetrics } from "../../observability/memory-metrics.js";

export function readMemorySample() {
  const sample = refreshMemoryMetrics();
  return {
    process: {
      rss: sample.process.rss,
      heapTotal: sample.process.heapTotal,
      heapUsed: sample.process.heapUsed,
      external: sample.process.external,
      arrayBuffers: sample.process.arrayBuffers
    },
    heap: {
      heapSizeLimit: sample.heap.heap_size_limit,
      totalHeapSize: sample.heap.total_heap_size,
      usedHeapSize: sample.heap.used_heap_size
    }
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/performance/stream-report.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/stream-report.service.ts</span>
  </div>

```ts
import { once } from "node:events";
import { Writable } from "node:stream";
import { finished } from "node:stream/promises";

export interface StreamBackpressureReport {
  chunks: number;
  chunkSize: number;
  drains: number;
  bytesWritten: number;
}

export async function createStreamBackpressureReport(): Promise<StreamBackpressureReport> {
  const chunks = 40;
  const chunkSize = 1024;
  const writable = new Writable({
    highWaterMark: 4096,
    write(_chunk, _encoding, callback) {
      setImmediate(callback);
    }
  });

  let drains = 0;
  let bytesWritten = 0;

  for (let index = 0; index < chunks; index += 1) {
    const chunk = Buffer.alloc(chunkSize, "x");
    bytesWritten += chunk.byteLength;
    if (!writable.write(chunk)) {
      drains += 1;
      await once(writable, "drain");
    }
  }

  writable.end();
  await finished(writable);

  return {
    chunks,
    chunkSize,
    drains,
    bytesWritten
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/performance/performance.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/performance.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const workSizeSchema = z.object({
  size: z.enum(["small", "medium"]).default("small")
});

export type WorkSizeQuery = z.infer<typeof workSizeSchema>;
```
</div>

#### `mini-projects/performance-notes-api/src/modules/performance/performance.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/performance/performance.types.ts</span>
  </div>

```ts
export type WorkSize = "small" | "medium";

export interface CpuTaskResult {
  size: WorkSize;
  iterations: number;
  result: number;
  durationMs: number;
  mode: "sync" | "worker";
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/auth/authenticate-session.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/auth/authenticate-session.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { config } from "../../config/env.js";
import { AuthRepository } from "../../modules/auth/auth.repository.js";
import { parseCookies } from "../cookies/cookie-parser.js";
import { HttpError } from "../errors/http-error.js";
import { setAuthContext } from "./auth-context.js";
import { hashSessionToken } from "./session-token.js";

const repository = new AuthRepository();

export const authenticateSession: RequestHandler = async (request, _response, next) => {
  try {
    const cookies = parseCookies(request.get("cookie"));
    const sessionToken = cookies[config.SESSION_COOKIE_NAME];
    if (!sessionToken) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");

    const session = await repository.findActiveSessionByHash(hashSessionToken(sessionToken), new Date());
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");

    setAuthContext(request, {
      userId: session.userId,
      sessionId: session.id,
      role: session.user.role,
      csrfTokenHash: session.csrfTokenHash
    });

    next();
  } catch (error) {
    next(error);
  }
};
```
</div>

#### `mini-projects/performance-notes-api/src/shared/auth/csrf.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/auth/csrf.ts</span>
  </div>

```ts
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { getAuthContext } from "./auth-context.js";
import { HttpError } from "../errors/http-error.js";

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCsrfToken(csrfToken: string): string {
  return createHash("sha256").update(csrfToken).digest("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export const requireCsrfToken: RequestHandler = (request, _response, next) => {
  const auth = getAuthContext(request);
  const csrfToken = request.get("x-csrf-token");

  if (!csrfToken || !auth.csrfTokenHash) {
    next(new HttpError(403, "CSRF_REQUIRED", "A CSRF token is required."));
    return;
  }

  if (!safeEqualHex(hashCsrfToken(csrfToken), auth.csrfTokenHash)) {
    next(new HttpError(403, "CSRF_INVALID", "The CSRF token is invalid."));
    return;
  }

next();
};
```
</div>

#### `mini-projects/performance-notes-api/src/shared/cookies/cookie-parser.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/cookies/cookie-parser.ts</span>
  </div>

```ts
export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};

  return Object.fromEntries(
    header.split(";").map((part) => {
      const [name, ...value] = part.trim().split("=");
      return [name, decodeURIComponent(value.join("="))];
    }).filter(([name]) => Boolean(name))
  );
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/cookies/session-cookie.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/cookies/session-cookie.ts</span>
  </div>

```ts
import { config } from "../../config/env.js";

function serializeCookie(name: string, value: string, options: Record<string, string | number | boolean>): string {
  const attributes = Object.entries(options).flatMap(([key, optionValue]) => {
    if (optionValue === false) return [];
    if (optionValue === true) return [key];
    return [`${key}=${optionValue}`];
  });

  return [`${name}=${encodeURIComponent(value)}`, ...attributes].join("; ");
}

export function serializeSessionCookie(sessionToken: string): string {
  return serializeCookie(config.SESSION_COOKIE_NAME, sessionToken, {
    HttpOnly: true,
    Secure: config.COOKIE_SECURE,
    SameSite: "Lax",
    Path: "/",
    "Max-Age": config.SESSION_TTL_SECONDS
  });
}

export function serializeCsrfCookie(csrfToken: string): string {
  return serializeCookie(config.CSRF_COOKIE_NAME, csrfToken, {
    Secure: config.COOKIE_SECURE,
    SameSite: "Lax",
    Path: "/",
    "Max-Age": config.SESSION_TTL_SECONDS
  });
}

export function clearSessionCookies(): string[] {
  return [
    serializeCookie(config.SESSION_COOKIE_NAME, "", { HttpOnly: true, Path: "/", "Max-Age": 0 }),
    serializeCookie(config.CSRF_COOKIE_NAME, "", { Path: "/", "Max-Age": 0 })
  ];
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/errors/http-error.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/errors/http-error.ts</span>
  </div>

```ts
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown[] = []
  ) {
    super(message);
    this.name = "HttpError";
  }
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/errors/error-middleware.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/errors/error-middleware.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "./http-error.js";
import { mapPrismaError } from "../../db/prisma-errors.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const prismaError = mapPrismaError(error);
  const normalized = prismaError ?? error;

  if (normalized instanceof HttpError) {
    response.status(normalized.statusCode).json({
      ok: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details
      }
    });
    return;
  }

  if (normalized instanceof ZodError) {
    response.status(422).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: normalized.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    });
    return;
  }

  response.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error.",
      details: []
    }
  });
};
```
</div>

#### `mini-projects/performance-notes-api/src/shared/middleware/request-id.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/middleware/request-id.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { runWithRequestContext } from "../../observability/request-context.js";

export const requestId: RequestHandler = (request, response, next) => {
  const existing = request.get("x-request-id");
  const id = existing && existing.length <= 128 ? existing : randomUUID();
  response.setHeader("x-request-id", id);
  runWithRequestContext({ requestId: id }, next);
};
```
</div>

#### `mini-projects/performance-notes-api/src/shared/middleware/security-headers.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/middleware/security-headers.ts</span>
  </div>

```ts
import helmet from "helmet";

export const securityHeaders = helmet({
  crossOriginResourcePolicy: {
    policy: "same-site"
  }
});
```
</div>

#### `mini-projects/performance-notes-api/src/shared/middleware/cors.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/middleware/cors.ts</span>
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
  allowedHeaders: ["content-type", "x-csrf-token", "x-request-id"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
});
```
</div>

#### `mini-projects/performance-notes-api/src/shared/middleware/rate-limit.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/middleware/rate-limit.ts</span>
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
#### `mini-projects/performance-notes-api/src/shared/validation/validate-request.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/validation/validate-request.ts</span>
  </div>

```ts
import type { NextFunction, Request, RequestHandler, Response } from "express";

interface RuntimeSchema {
  parse(input: unknown): unknown;
}

export interface RequestSchemas {
  body?: RuntimeSchema;
  params?: RuntimeSchema;
  query?: RuntimeSchema;
}

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (schemas.body) request.body = schemas.body.parse(request.body);
    if (schemas.params) request.params = schemas.params.parse(request.params) as Request["params"];
    if (schemas.query) {
      Object.defineProperty(request, "query", {
        value: schemas.query.parse(request.query),
        configurable: true
      });
    }
    next();
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/responses/send-response.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/responses/send-response.ts</span>
  </div>

```ts
import type { Response } from "express";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export function sendOk<T>(response: Response, data: T): void {
  response.json({ ok: true, data } satisfies ApiSuccess<T>);
}

export function sendCreated<T>(response: Response, data: T): void {
  response.status(201).json({ ok: true, data } satisfies ApiSuccess<T>);
}
```
</div>

#### `mini-projects/performance-notes-api/openapi/openapi.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/openapi/openapi.yaml</span>
  </div>

```txt
openapi: 3.1.0
info:
  title: Performance Notes API
  version: 1.0.0
paths:
  /health/live:
    get:
      responses:
        "200":
          description: Live process signal
  /health/ready:
    get:
      responses:
        "200":
          description: Ready dependency signal
        "503":
          description: Dependency unavailable
  /metrics:
    get:
      responses:
        "200":
          description: Prometheus metrics
  /performance/event-loop:
    get:
      responses:
        "200":
          description: Event loop performance snapshot
  /performance/memory:
    get:
      responses:
        "200":
          description: Safe memory snapshot
  /performance/cpu-sync:
    get:
      responses:
        "200":
          description: Bounded sync CPU demo
  /performance/cpu-worker:
    get:
      responses:
        "200":
          description: Bounded worker CPU demo
  /performance/stream-report:
    get:
      responses:
        "200":
          description: Stream backpressure report
  /performance/redis-pipeline-demo:
    get:
      responses:
        "200":
          description: Redis pipeline demo
  /performance/query-summary:
    get:
      responses:
        "200":
          description: Query metrics summary
```
</div>

#### `mini-projects/performance-notes-api/scripts/smoke-test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/scripts/smoke-test.ts</span>
  </div>

```ts
import { pathToFileURL } from "node:url";

export interface SmokeTarget {
  name: "live" | "ready";
  url: string;
}

export interface SmokeResult {
  name: string;
  status: number;
  ok: boolean;
}

export function createSmokeTargets(baseUrl: string): SmokeTarget[] {
  const normalized = baseUrl.replace(/\/$/, "");
  return [
    { name: "live", url: normalized + "/health/live" },
    { name: "ready", url: normalized + "/health/ready" }
  ];
}

export function evaluateSmokeResults(results: SmokeResult[]): boolean {
  return results.every((result) => result.ok && result.status === 200);
}

export async function runSmokeTest(baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080"): Promise<SmokeResult[]> {
  const results: SmokeResult[] = [];

  for (const target of createSmokeTargets(baseUrl)) {
    const response = await fetch(target.url);
    results.push({
      name: target.name,
      status: response.status,
      ok: response.ok
    });
  }

  if (!evaluateSmokeResults(results)) {
    throw new Error("Smoke test failed: " + JSON.stringify(results));
  }

  return results;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  runSmokeTest()
    .then((results) => {
      console.log(JSON.stringify({ ok: true, results }));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```
</div>

#### `mini-projects/performance-notes-api/scripts/wait-for-ready.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/scripts/wait-for-ready.ts</span>
  </div>

```ts
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

export async function waitForReady(baseUrl: string, attempts = 30, intervalMs = 1000): Promise<void> {
  const url = baseUrl.replace(/\/$/, "") + "/health/ready";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await delay(intervalMs);
      continue;
    }

    await delay(intervalMs);
  }

  throw new Error("Service did not become ready at " + url);
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  waitForReady(process.env.SMOKE_BASE_URL ?? "http://localhost:8080")
    .then(() => console.log("ready"))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```
</div>

#### `mini-projects/performance-notes-api/scripts/load-baseline.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/scripts/load-baseline.ts</span>
  </div>

```ts
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";

export interface LoadProfile {
  totalRequests: number;
  concurrency: number;
}

export interface RequestSample {
  status: number;
  latencyMs: number;
  timedOut: boolean;
}

export interface PercentileSummary {
  p50: number;
  p95: number;
  p99: number;
}

export interface LoadBaselineResult {
  url: string;
  loadProfile: LoadProfile;
  requestsPerSecond: number;
  latencyP95: number;
  errors: number;
  timeouts: number;
}

export function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export function summarizeLatencies(samples: RequestSample[]): PercentileSummary {
  const latencies = samples.map((sample) => sample.latencyMs);
  return {
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99)
  };
}

async function runOneRequest(url: string): Promise<RequestSample> {
  const startedAt = performance.now();
  try {
    const response = await fetch(url);
    return {
      status: response.status,
      latencyMs: Number((performance.now() - startedAt).toFixed(3)),
      timedOut: false
    };
  } catch {
    return {
      status: 0,
      latencyMs: Number((performance.now() - startedAt).toFixed(3)),
      timedOut: true
    };
  }
}

async function runBoundedLoad(url: string, profile: LoadProfile): Promise<RequestSample[]> {
  const samples: RequestSample[] = [];
  let nextRequest = 0;

  async function worker(): Promise<void> {
    while (nextRequest < profile.totalRequests) {
      nextRequest += 1;
      samples.push(await runOneRequest(url));
    }
  }

  await Promise.all(Array.from({ length: profile.concurrency }, () => worker()));
  return samples;
}

export async function runLoadBaseline(url = process.env.LOAD_BASE_URL ?? "http://localhost:8080"): Promise<LoadBaselineResult> {
  const normalizedUrl = url.replace(/\/$/, "");
  const targetUrl = normalizedUrl + "/health/ready";
  const loadProfile = {
    totalRequests: 80,
    concurrency: 5
  };
  const startedAt = performance.now();
  const samples = await runBoundedLoad(targetUrl, loadProfile);
  const durationSeconds = Math.max((performance.now() - startedAt) / 1000, 0.001);
  const summary = summarizeLatencies(samples);
  const errors = samples.filter((sample) => sample.status >= 400 || sample.status === 0).length;
  const timeouts = samples.filter((sample) => sample.timedOut).length;

  return {
    url: normalizedUrl,
    loadProfile,
    requestsPerSecond: Number((samples.length / durationSeconds).toFixed(3)),
    latencyP95: summary.p95,
    errors,
    timeouts
  };
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  runLoadBaseline()
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```
</div>
#### `mini-projects/performance-notes-api/scripts/benchmark-budget.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/scripts/benchmark-budget.ts</span>
  </div>

```ts
import { pathToFileURL } from "node:url";
import { runLoadBaseline } from "./load-baseline.js";

export interface PerformanceBudget {
  minRequestsPerSecond: number;
  maxLatencyP95: number;
  maxErrors: number;
  maxTimeouts: number;
}

export const defaultBudget: PerformanceBudget = {
  minRequestsPerSecond: 20,
  maxLatencyP95: 500,
  maxErrors: 0,
  maxTimeouts: 0
};

export async function checkBenchmarkBudget(budget = defaultBudget): Promise<void> {
  const result = await runLoadBaseline();
  const violations = [
    result.requestsPerSecond < budget.minRequestsPerSecond ? "requestsPerSecond" : undefined,
    result.latencyP95 > budget.maxLatencyP95 ? "latencyP95" : undefined,
    result.errors > budget.maxErrors ? "errors" : undefined,
    result.timeouts > budget.maxTimeouts ? "timeouts" : undefined
  ].filter(Boolean);

  if (violations.length > 0) {
    throw new Error("Budget violated: " + violations.join(", "));
  }

  console.log(JSON.stringify({ ok: true, result, budget }));
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  checkBenchmarkBudget().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
```
</div>
#### `mini-projects/performance-notes-api/scripts/capacity-report.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/scripts/capacity-report.ts</span>
  </div>

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { runLoadBaseline } from "./load-baseline.js";

const execFileAsync = promisify(execFile);

export async function readDockerStats(): Promise<string> {
  try {
    const { stdout } = await execFileAsync("docker", [
      "stats",
      "--no-stream",
      "--format",
      "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}",
      "performance-notes-api-api-1",
      "performance-notes-api-postgres-1",
      "performance-notes-api-redis-1",
      "performance-notes-api-nginx-1"
    ]);
    return stdout.trim();
  } catch {
    return "docker stats unavailable";
  }
}

export async function createCapacityReport() {
  const baseline = await runLoadBaseline();
  const dockerStats = await readDockerStats();
  return {
    baseline,
    dockerStats,
    observations: [
      "Compare latency p95 with request rate.",
      "Use sampled request durations as the executable p95 budget input.",
      "Check whether errors or timeouts appear before raising concurrency.",
      "Read container CPU and memory as capacity signals, not root cause proof."
    ]
  };
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  createCapacityReport()
    .then((report) => console.log(JSON.stringify(report, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```
</div>
#### `mini-projects/performance-notes-api/tests/env.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/env.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { loadEnv } from "../src/config/env.js";

test("loadEnv parses boolean and numeric deployment configuration", () => {
  const config = loadEnv({
    NODE_ENV: "test",
    PORT: "4999",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/performance_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "test-session-secret-with-32-characters",
    ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",
    TRUST_PROXY: "true",
    COOKIE_SECURE: "false"
  });

  assert.equal(config.PORT, 4999);
  assert.equal(config.TRUST_PROXY, true);
  assert.equal(config.COOKIE_SECURE, false);
  assert.deepEqual(config.ALLOWED_ORIGINS, ["http://localhost:3000", "http://127.0.0.1:3000"]);
});

test("loadEnv rejects the development secret in production", () => {
  assert.throws(() => loadEnv({
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/performance_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "development-session-secret-change-me-32"
  }), /SESSION_SECRET/);
});
```
</div>
#### `mini-projects/performance-notes-api/tests/health.integration.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/health.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { disconnectPrisma } from "../src/db/prisma.js";
import { stopEventLoopMetrics } from "../src/observability/event-loop-metrics.js";
import { closeRedisClient } from "../src/redis/redis-client.js";

test.after(async () => {
  stopEventLoopMetrics();
  await closeRedisClient();
  await disconnectPrisma();
});

test("GET /health/live does not require PostgreSQL or Redis", async () => {
  const response = await request(createApp()).get("/health/live").expect(200);

  assert.equal(response.body.ok, true);
  assert.equal(response.body.data.status, "live");
  assert.equal(typeof response.body.data.uptimeSeconds, "number");
});

test("GET /health/ready reports dependency state", async () => {
  const response = await request(createApp()).get("/health/ready");

  assert.ok([200, 503].includes(response.status));
  assert.ok(["ready", "not_ready"].includes(response.body.data.status));
  assert.ok(["ready", "unavailable"].includes(response.body.data.dependencies.postgres));
  assert.ok(["ready", "unavailable"].includes(response.body.data.dependencies.redis));
});
```
</div>

#### `mini-projects/performance-notes-api/tests/metrics.integration.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/metrics.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

test("GET /metrics exposes low-cardinality performance metrics", async () => {
  await request(createApp()).get("/health/live").expect(200);
  const response = await request(createApp()).get("/metrics").expect(200);

  assert.match(response.text, /http_requests_total/);
  assert.match(response.text, /node_event_loop_delay_seconds/);
  assert.doesNotMatch(response.text, /user_id|note_id|session_id|email|request_id/);
});
```
</div>

#### `mini-projects/performance-notes-api/tests/performance.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/performance.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { iterationsForSize, runCpuTaskSync } from "../src/modules/performance/cpu-task.service.js";
import { readMemorySample } from "../src/modules/performance/memory-sample.service.js";

test("CPU demo uses bounded input sizes", () => {
  assert.equal(iterationsForSize("small") < iterationsForSize("medium"), true);
  const result = runCpuTaskSync("small");
  assert.equal(result.mode, "sync");
  assert.equal(result.size, "small");
});

test("memory sample does not expose secrets or heap snapshot files", () => {
  const sample = readMemorySample();
  assert.equal(typeof sample.process.rss, "number");
  assert.equal("DATABASE_URL" in sample, false);
});
```
</div>

#### `mini-projects/performance-notes-api/tests/worker-pool.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/worker-pool.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { WorkerPool } from "../src/modules/performance/worker-pool.js";

test("WorkerPool exposes bounded size and pending count", async () => {
  const pool = new WorkerPool(1);
  try {
    assert.equal(pool.size, 1);
    const result = await pool.run({ iterations: 1000 });
    assert.equal(typeof result, "number");
    assert.equal(pool.pendingCount, 0);
  } finally {
    await pool.close();
  }
});
```
</div>

#### `mini-projects/performance-notes-api/tests/stream-backpressure.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/stream-backpressure.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { createStreamBackpressureReport } from "../src/modules/performance/stream-report.service.js";

test("stream report observes write backpressure without unbounded output", async () => {
  const report = await createStreamBackpressureReport();
  assert.equal(report.chunks, 40);
  assert.equal(report.chunkSize, 1024);
  assert.equal(report.bytesWritten, 40 * 1024);
  assert.equal(report.drains >= 0, true);
});
```
</div>

#### `mini-projects/performance-notes-api/tests/helpers/database.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/helpers/database.ts</span>
  </div>

```ts
import { connect } from "node:net";

export async function canReachTcpPort(host: string, port: number, timeoutMs = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.once("connect", () => {
      clearTimeout(timer);
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

export function databaseUrlForTests(): string {
  return process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/performance_notes_api";
}
```
</div>
#### `mini-projects/performance-notes-api/tests/helpers/redis.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/helpers/redis.ts</span>
  </div>

```ts
import { canReachTcpPort } from "./database.js";

export async function canReachRedis(): Promise<boolean> {
  return canReachTcpPort("127.0.0.1", 6379);
}
```
</div>

#### `mini-projects/performance-notes-api/README.md`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/README.md</span>
  </div>

```txt
# Performance Notes API

This mini project demonstrates Node.js performance engineering on top of a production-like Express API. It measures request latency, event loop delay, memory, database query duration, Redis round-trip cost, stream backpressure, and container capacity signals.

## What is included

- Express 5 API behind NGINX on `http://localhost:8080`
- PostgreSQL 18 and Redis through Docker Compose
- Prisma v7 style generated client and PostgreSQL driver adapter
- Prometheus metrics at `/metrics`
- Bounded CPU sync and Worker Thread demos
- Redis pipeline demo
- autocannon baseline and budget scripts

## Windows PowerShell

```powershell
npm install
npm run prisma:generate
npm run typecheck
npm run build
docker compose config
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm test -- --test-concurrency=1
npm run smoke
npm run load:baseline
npm run benchmark:budget
npm run capacity:report
docker compose down
```

## macOS and Linux

```bash
npm install
npm run prisma:generate
npm run typecheck
npm run build
docker compose config
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm test -- --test-concurrency=1
npm run smoke
npm run load:baseline
npm run benchmark:budget
npm run capacity:report
docker compose down
```

## Runtime endpoints

- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`
- `GET /performance/event-loop`
- `GET /performance/memory`
- `GET /performance/cpu-sync?size=small`
- `GET /performance/cpu-worker?size=small`
- `GET /performance/stream-report`
- `GET /performance/redis-pipeline-demo`
- `GET /performance/query-summary`

## Load and budget

`load:baseline` targets `http://localhost:8080` by default. Set `LOAD_BASE_URL` only when testing another compatible reverse-proxy entry.

`benchmark:budget` runs the same baseline and exits with an error when request rate, p95 latency, errors, or timeouts violate the configured budget.

## Known limitations

- This is a local learning project, not a cloud deployment.
- It does not expose heap snapshots over HTTP.
- It does not include Kubernetes, Terraform, service mesh, Redis Cluster, or vendor APM.
- The CPU endpoints are demo-scoped and hard limited.
```
</div>

#### `mini-projects/performance-notes-api/src/config/production.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/config/production.ts</span>
  </div>

```ts
import type { AppConfig, TrustProxyValue } from "./env.js";

export interface ProductionRuntimePolicy {
  trustProxy: TrustProxyValue;
  secureCookies: boolean;
  exposeDebugErrors: boolean;
}

export function createProductionRuntimePolicy(config: AppConfig): ProductionRuntimePolicy {
  return {
    trustProxy: config.TRUST_PROXY,
    secureCookies: config.COOKIE_SECURE,
    exposeDebugErrors: config.NODE_ENV !== "production"
  };
}
```
</div>

#### `mini-projects/performance-notes-api/src/modules/notes/notebook-notes.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/modules/notes/notebook-notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./notes.controller.js";
import { createNoteSchema, notebookNoteParamsSchema } from "./notes.schema.js";

export const notebookNotesRoutes = Router({ mergeParams: true });

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema }), controller.listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteSchema }), controller.create);
```
</div>

#### `mini-projects/performance-notes-api/src/shared/auth/auth-context.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/auth/auth-context.ts</span>
  </div>

```ts
import type { Request } from "express";
import { HttpError } from "../errors/http-error.js";

export interface AuthContext {
  userId: string;
  sessionId: string;
  role: "USER" | "ADMIN";
  csrfTokenHash?: string | null;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

export function setAuthContext(request: Request, auth: AuthContext): void {
  (request as AuthenticatedRequest).auth = auth;
}

export function getAuthContext(request: Request): AuthContext {
  const auth = (request as Partial<AuthenticatedRequest>).auth;
  if (!auth) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");
  return auth;
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/auth/password-hashing.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/auth/password-hashing.ts</span>
  </div>

```ts
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, keyLength) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [salt, storedKey] = passwordHash.split(":");
  if (!salt || !storedKey) return false;
  const derivedKey = await scrypt(password, salt, keyLength) as Buffer;
  const storedBuffer = Buffer.from(storedKey, "hex");
  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/auth/session-token.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/auth/session-token.ts</span>
  </div>

```ts
import { createHash, randomBytes } from "node:crypto";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken).digest("hex");
}
```
</div>

#### `mini-projects/performance-notes-api/src/shared/middleware/not-found.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/src/shared/middleware/not-found.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "NOT_FOUND", `Route ${request.method} ${request.path} was not found.`));
};
```
</div>

#### `mini-projects/performance-notes-api/tests/proxy-config.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/proxy-config.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";

test("createApp applies trust proxy from runtime configuration", () => {
  const app = createApp(loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/performance_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "test-session-secret-with-32-characters",
    TRUST_PROXY: "true"
  }));

  assert.equal(app.get("trust proxy"), true);
});
```
</div>

#### `mini-projects/performance-notes-api/tests/shutdown.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/shutdown.unit.test.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import test from "node:test";
import assert from "node:assert/strict";

test("createGracefulShutdown closes the HTTP server and resources", async () => {
  process.env.NODE_ENV = "test";
  const { createGracefulShutdown } = await import("../src/server.js");
  const server = createServer((_request, response) => {
    response.end("ok");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  let resourceClosed = false;
  const shutdown = createGracefulShutdown({
    server,
    timeoutMs: 1000,
    resources: [
      {
        name: "test-resource",
        close: () => {
          resourceClosed = true;
        }
      }
    ]
  });

  await shutdown("SIGTERM");
  assert.equal(resourceClosed, true);
  assert.equal(server.listening, false);
});
```
</div>

#### `mini-projects/performance-notes-api/tests/smoke.integration.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/performance-notes-api/tests/smoke.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { createSmokeTargets, evaluateSmokeResults } from "../scripts/smoke-test.js";

test("createSmokeTargets checks live and ready endpoints", () => {
  assert.deepEqual(createSmokeTargets("http://localhost:8080"), [
    { name: "live", url: "http://localhost:8080/health/live" },
    { name: "ready", url: "http://localhost:8080/health/ready" }
  ]);
});

test("evaluateSmokeResults requires successful live and ready responses", () => {
  assert.equal(evaluateSmokeResults([
    { name: "live", status: 200, ok: true },
    { name: "ready", status: 200, ok: true }
  ]), true);

  assert.equal(evaluateSmokeResults([
    { name: "live", status: 200, ok: true },
    { name: "ready", status: 503, ok: false }
  ]), false);
});
```
</div>

## 15. 知识迁移与真实项目场景

真实项目中，性能工程会迁移到更多实例、更多数据库、更多缓存层和更多 observability 信号。但方法不变：固定入口，读低基数 metrics，按层分类，保留安全边界，复测同一负载。云厂商 dashboard 可以补充证据，但不能替代你对 Node runtime、database pool、Redis RTT、stream backpressure 和 container capacity 的机制判断。

## 16. 本章复盘任务

1. 解释为什么 `npm run smoke` 不能证明 API 的容量。
2. 对比 event loop delay 和 eventLoopUtilization。
3. 说明为什么 CPU-bound handler 会拖慢无关请求。
4. 解释 Worker Threads 与 Cluster 的资源边界。
5. 说明为什么 heap snapshot 不应该通过 HTTP 暴露。
6. 用 query duration 与 query count 判断 N+1。
7. 用 Redis pipeline demo 解释 RTT。
8. 写出一个 performance budget，并说明验证命令。

## 17. 最终心智模型

性能工程的最终模型是：生产入口固定为 NGINX；负载源固定；每个请求穿过 Express hot path；CPU、heap、stream、database、Redis、container 都有自己的饱和信号；修复只能针对一个负责层；复测必须使用同一入口、同一负载和同一指标。

## 18. 官方资料

本章资料分析摘要：Node.js 官方文档用于 event loop、memory、V8、Worker、Cluster、Stream、HTTP timeout、test runner 和 assert；Express 官方文档用于 production performance、middleware 和 error flow；Prisma 官方文档用于 connection pool、Client reuse、query optimization 与 driver adapter 边界；node-postgres 官方文档用于 pool size 与 idle lifecycle；Redis 官方文档用于 node-redis pipeline 和 RTT；Docker 官方文档用于 stats、Compose resources、logs；autocannon repository 用于 load API；TypeScript TSConfig 文档用于 build/source map 边界。

版本敏感点：Node 26 的 `perf_hooks.eventLoopUtilization` alias、HTTP timeout 默认值、V8 heap flags、Prisma v7 driver adapter pooling、PostgreSQL 18 volume target、Docker Desktop Compose behavior、autocannon result shape。

避免的旧假设：不把 Cluster 当成唯一扩展方案；不把 Worker Threads 用于普通 I/O；不把 `localhost:3020` 当成生产入口；不把 heap snapshot 暴露为 HTTP API；不为每个请求创建 Prisma Client；不把平均延迟当容量结论；不把 Redis pipeline 当 universal speedup。

- Node.js Performance hooks: https://nodejs.org/api/perf_hooks.html
- Node.js Process: https://nodejs.org/api/process.html
- Node.js V8: https://nodejs.org/api/v8.html
- Node.js CLI: https://nodejs.org/api/cli.html
- Node.js Worker threads: https://nodejs.org/api/worker_threads.html
- Node.js Cluster: https://nodejs.org/api/cluster.html
- Node.js Stream: https://nodejs.org/api/stream.html
- Node.js HTTP: https://nodejs.org/api/http.html
- Node.js Test runner: https://nodejs.org/api/test.html
- Node.js Assert: https://nodejs.org/api/assert.html
- Express production performance: https://expressjs.com/en/advanced/best-practice-performance/
- Express middleware: https://expressjs.com/en/guide/using-middleware/
- Express error handling: https://expressjs.com/en/guide/error-handling/
- Prisma connection pool: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
- Prisma query optimization: https://www.prisma.io/docs/orm/prisma-client/queries/advanced/query-optimization-performance
- node-postgres pool: https://node-postgres.com/apis/pool
- Redis node-redis pipelines: https://redis.io/docs/latest/develop/clients/nodejs/transpipe/
- Redis pipelining: https://redis.io/docs/latest/develop/using-commands/pipelining/
- Docker stats: https://docs.docker.com/reference/cli/docker/container/stats/
- Docker Compose deploy resources: https://docs.docker.com/reference/compose-file/deploy/
- Docker Compose logs: https://docs.docker.com/reference/cli/docker/compose/logs/
- autocannon: https://github.com/mcollina/autocannon
- TypeScript TSConfig: https://www.typescriptlang.org/tsconfig/

# Node.js 第 13 章：可靠性工程、超时、取消、重试、幂等性、错误契约、事务冲突恢复、熔断、降级与故障注入边界

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

- [0. 章前定位](#0)
- [1. 学习目标](#1)
- [2. 前置知识](#2)
- [3. 环境与运行基线](#3)
- [4. 第一性原理](#4)
- [5. 技术边界模型](#5)
- [6. 底层机制模型](#6)
- [7. 核心术语](#7)
- [8. 本章实践路线](#8)
- [9. 核心教学](#9)
- [9.1 可靠性工程不是“try/catch 越多越安全”](#section-9-1)
- [9.2 失败分类：timeout、abort、transient、permanent、conflict、duplicate、overload](#section-9-2)
- [9.3 HTTP timeout 边界：requestTimeout、headersTimeout、keepAliveTimeout](#section-9-3)
- [9.4 `AbortController` 与 `AbortSignal.timeout()`：取消异步操作](#section-9-4)
- [9.5 timeout、abort、retry、fallback 的区别](#section-9-5)
- [9.6 Retry policy：max attempts、backoff、jitter 与 retry budget](#section-9-6)
- [9.7 Retry safety：safe method、idempotent method 与 side effect](#section-9-7)
- [9.8 Idempotency key：让 unsafe POST 支持安全重放](#section-9-8)
- [9.9 RFC 9457 Problem Details：稳定错误响应契约](#section-9-9)
- [9.10 Error mapping：validation、auth、conflict、timeout、dependency、rate limit](#section-9-10)
- [9.11 Prisma transaction conflict recovery：P2034 与完整事务重试](#section-9-11)
- [9.12 Transaction boundary：maxWait、timeout、isolation 与 retry placement](#section-9-12)
- [9.13 Database failure taxonomy：unavailable、pool timeout、statement conflict、serialization failure](#section-9-13)
- [9.14 Redis failure handling：error event、reconnect strategy、command timeout](#section-9-14)
- [9.15 Cache fallback 与 stale response 边界](#section-9-15)
- [9.16 Circuit breaker：closed、open、half-open 与 recovery window](#section-9-16)
- [9.17 Bulkhead / concurrency limit：保护慢依赖而不是扩大排队](#section-9-17)
- [9.18 Graceful degradation：required dependency 与 optional dependency](#section-9-18)
- [9.19 Health semantics：live、ready、degraded 与 dependency health](#section-9-19)
- [9.20 Fault injection：模拟 timeout、Redis outage、DB conflict 与 slow dependency](#section-9-20)
- [9.21 Reliability metrics：retry、timeout、abort、idempotency replay、circuit state](#section-9-21)
- [9.22 Chapter integration: resilient-notes-api](#section-9-22)
- [10. API 与规则索引](#10)
- [11. 常见错误对照表](#11)
- [12. 调试与验证方法](#12)
- [13. 分项练习说明](#13)
- [14. 最终迷你项目](#14)
- [14.1 项目目标](#section-14-1)
- [14.2 运行与验证路径](#section-14-2)
- [14.3 完整项目代码](#section-14-3)
- [15. 知识迁移与真实项目场景](#15)
- [16. 本章复盘任务](#16)
- [17. 最终心智模型](#17)
- [18. 官方资料](#18)


## 本章代码定位索引

| 学习目标 | 文件或片段 | 可观察证据 |
| --- | --- | --- |
| 区分失败类型和安全策略 | `practices/13-reliability-fault-tolerance/01-failure-model/failure-taxonomy.ts` | failure kind maps to retry, replay, fallback, or reject |
| 设置 HTTP 超时边界 | `practices/13-reliability-fault-tolerance/02-timeout-abort/http-server-timeouts.ts` | requestTimeout, headersTimeout, keepAliveTimeout are explicit |
| 实现可取消的异步操作 | `practices/13-reliability-fault-tolerance/02-timeout-abort/abortable-delay.ts` | timer promise receives AbortSignal |
| 执行有预算的 retry | `practices/13-reliability-fault-tolerance/03-retry-policy/retry-policy-executor.ts` | attempt loop stops at maxAttempts |
| 判断 unsafe POST 是否可重放 | `practices/13-reliability-fault-tolerance/04-idempotency/idempotency-replay-decision.ts` | same fingerprint replays, different fingerprint conflicts |
| 输出稳定错误契约 | `practices/13-reliability-fault-tolerance/05-error-contracts/problem-details-model.ts` | Problem Details fields are stable |
| 重试完整事务 | `practices/13-reliability-fault-tolerance/06-database-recovery/retry-whole-transaction.ts` | operation closure reruns as one unit |
| 处理 Redis 失败 | `practices/13-reliability-fault-tolerance/07-redis-failure/redis-error-listener.ts` | error listener observes connection failures |
| 应用熔断和隔舱 | `practices/13-reliability-fault-tolerance/08-resilience-patterns/circuit-breaker-state-machine.ts` | state transition protects dependency |
| 集成本章机制 | `mini-projects/resilient-notes-api/src/app.ts` | routes pass through middleware and problem details |


## 0. 章前定位

本章进入 Phase 8：reliability engineering and failure-handling foundation。前面章节已经建立 HTTP、Express、TypeScript、Prisma、Redis、observability、Docker Compose、NGINX、smoke test 和 performance budget；本章只处理运行过程中依赖变慢、不可用、冲突、重复、过载时如何安全响应。

## 1. 学习目标

学完本章后，你应该能回答：API 已经能跑，也有基本性能，但依赖偶尔慢、不可用、冲突或返回不一致时，怎样使用 timeout、cancellation、retry、idempotency、Problem Details、transaction retry、circuit breaker、bulkhead、graceful degradation 和 fault injection，而不破坏数据一致性、不隐藏失败、不制造 retry amplification。

## 2. 前置知识

需要已掌握 Node.js event loop、Express middleware、TypeScript strict mode、Prisma repository 和 transaction、Redis cache/session、structured logging、Prometheus metrics、Docker Compose 与 NGINX 入口。本章不会重新讲 Docker Desktop、PostgreSQL、Redis、NGINX 或 performance tuning。

## 3. 环境与运行基线

本章 mini project 使用 Node.js 26+、TypeScript `NodeNext`、Express 5、Prisma 7 driver adapter、PostgreSQL 18、Redis 8、Pino、prom-client、Node built-in test runner、Supertest、Docker Compose 和 NGINX。外部验证默认入口是 `http://localhost:8080`。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
npm install
npm run prisma:generate
npm run typecheck
npm run build
```
</div>


## 4. 第一性原理

可靠性不是让错误消失，而是让错误在正确边界被限制、分类、响应和观测。timeout 限制等待时间，abort 尝试取消底层操作，retry 只适用于可重试且安全的失败，fallback 只适用于可降级的路径，idempotency 让 unsafe POST 在重复请求时仍可证明不会重复副作用。

## 5. 技术边界模型

- Node runtime boundary：timer、AbortSignal、HTTP server、socket 和 process lifecycle。
- HTTP boundary：method safety、idempotency、status semantics、Problem Details。
- Express boundary：middleware order、async error propagation、response completion。
- Database boundary：Prisma Client reuse、interactive transaction、P2034、pool timeout。
- Redis boundary：error listener、reconnect strategy、command timeout、cache fallback。
- Runtime deployment boundary：Compose health、NGINX entrance、container network。
- Testing boundary：unit tests verify local mechanisms; runtime scripts verify dependency-backed behavior.

## 6. 底层机制模型

请求从 NGINX 到 API container，再进入 Express middleware。每个 handler 创建 JavaScript object、Promise、timer 或 client command。Node 把 timer 和 socket 交给 runtime/libuv 管理；Prisma 和 Redis 把请求推进外部进程。失败返回后，应用必须在 error mapping、retry executor、idempotency store、transaction helper、circuit breaker 或 health service 中做出可证明的策略选择。

## 7. 核心术语

| 术语 | 本章含义 |
| --- | --- |
| timeout | 超过策略允许等待时间后的失败结果 |
| abort | 调用方通过 `AbortSignal` 请求取消底层操作 |
| retry | 对可重试失败执行有上限、有 backoff、有 budget 的再次尝试 |
| idempotency key | unsafe POST 的客户端重放标识和服务端指纹记录 |
| Problem Details | RFC 9457 风格的稳定错误响应对象 |
| circuit breaker | repeated failure 后 fail fast，并在 recovery window 后半开探测 |
| bulkhead | 限制慢依赖并发或队列，保护其他请求 |
| degraded | 可选依赖失败时明确标记的降级响应 |

## 8. 本章实践路线

先做 failure taxonomy 和 timeout/abort 小练习，再做 retry、idempotency、Problem Details 和 transaction retry；随后进入 Redis fallback、circuit breaker、bulkhead、health 和 fault injection；最后用 `resilient-notes-api` 把这些边界接到真实 Express/Prisma/Redis/Compose 项目里。

## 9. 核心教学

<a id="section-9-1"></a>

### 9.1 可靠性工程不是“try/catch 越多越安全”

**结论**

`ReliabilityExperiment` 把一次故障演练拆成 `failureSource`、`policyBoundary`、`observableSignal`、`allowedRecovery` 和 `verificationCommand`。可靠性不是增加 catch 数量，而是让每个失败都有策略和证据。

**本节解决的问题**

没有 experiment model 时，团队只知道某个请求失败了，却不知道失败来自慢依赖、策略边界在 timeout 还是 retry、应该允许哪种恢复、用什么命令证明没有重复副作用。

**技术意义**

这一节把可靠性从“异常处理风格”提升为工程协议：故障源由实验描述，恢复动作由 policy boundary 限制，观察结果由 metric、Problem Details 或脚本输出证明。

**概念解释**

`planReliabilityExperiment()` 返回的是运行前的实验计划，不是运行后的交付状态。它让 learner 先写清楚要注入什么失败，再决定哪个边界负责停止或恢复。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

experiment policy boundary

- syntax: the experiment object uses fixed keys for failureSource, policyBoundary, observableSignal, allowedRecovery, and verificationCommand.
- TypeScript: the interface proves each experiment record carries a trigger, boundary, signal, recovery policy, and verification command.
- Node runtime: importing the practice file evaluates data structures only; no dependency call or network side effect starts.
- testing boundary: the verificationCommand field ties the model to an executable command instead of a narrative claim.
- mistake boundary: a reliability note without a signal or verification command cannot be distinguished from an operational slogan.

**底层机制**

调用 `planReliabilityExperiment('slow dependency')` 时，JavaScript 创建一个普通对象。对象字段把 slow dependency 映射到 timeout policy，`observableSignal` 指向 `timeout_total`，`allowedRecovery` 明确响应必须结束且不能产生重复副作用。

**API / 配置 / 命令规则**

`failureSource` 命名故障来源；`policyBoundary` 只能选择允许的策略；`observableSignal` 必须能在 logs、metrics、response 或 test 中找到；`verificationCommand` 必须是本地可执行命令。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/01-failure-model/reliability-experiment.ts</span>
</div>

```ts
export interface ReliabilityExperiment {
  name: string;
  failureSource: string;
  policyBoundary: "timeout" | "retry" | "fallback" | "reject";
  observableSignal: string;
  allowedRecovery: string;
  verificationCommand: string;
}

export function planReliabilityExperiment(name: string): ReliabilityExperiment {
  return {
    name,
    failureSource: "slow dependency",
    policyBoundary: "timeout",
    observableSignal: "timeout_total increments",
    allowedRecovery: "return problem details without duplicate side effects",
    verificationCommand: "npm run reliability:check"
  };
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/01-failure-model/failure-classification.ts</span>
</div>

```ts
export type FailureClassification = "retryable" | "non_retryable" | "conflict" | "duplicate";

export function classifyStatus(status: number): FailureClassification {
  if (status === 409) return "conflict";
  if (status === 408 || status === 429 || status >= 500) return "retryable";
  return "non_retryable";
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/01-failure-model/retryable-vs-nonretryable.ts</span>
</div>

```ts
export interface RetryDecision {
  retryable: boolean;
  reason: string;
}

export function decideRetry(errorCode: string): RetryDecision {
  if (["ETIMEDOUT", "ECONNRESET", "P2034"].includes(errorCode)) {
    return { retryable: true, reason: "temporary dependency boundary" };
  }
  return { retryable: false, reason: "permanent caller or data boundary" };
}
```
</div>

**逐行解释**

`ReliabilityExperiment` 是实验契约；`failureSource` 标记慢依赖；`policyBoundary: 'timeout'` 表示先限制等待；`allowedRecovery` 禁止 duplicate side effect；`verificationCommand` 绑定到 `npm run reliability:check`。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/01-failure-model/reliability-experiment.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

命令导入 practice module 后，tsx 先转译 TypeScript，再由 Node 执行 ESM import。没有顶层副作用，因此只由 `-e` wrapper 打印 `module import ok`，真实实验由 mini project 脚本执行。

**为什么会得到这个结果**

结果不会来自 catch 块，因为该文件不捕获错误；它只建立故障演练的字段边界。后续脚本能按这些字段检查 timeout metric、problem response 和 no duplicate write。

**对比情况**

正确路径：一次 reliability experiment 同时声明 failureSource、policyBoundary、observableSignal、allowedRecovery 和 verificationCommand。错误路径：只写“系统要可靠”，但没有可触发的失败源、可观察 signal 或验证命令。

**常见错误为什么错**

把 catch 写在最外层然后返回 200 会违反“故障必须有分类和可观察信号”的规则。调用方看似成功，指标和测试却无法证明恢复是安全的。

**与真实项目的关系**

真实项目识别规则：如果团队无法回答某个失败由哪个 dependency 触发、在哪个 policy boundary 被处理、用哪个 command 验证，这通常不是可靠性设计，而是事故后的口头约定。

**与当前学习路径的关系**

本节连接 Chapter 10 的 metrics、Chapter 11 的 smoke path 和 Chapter 12 的 capacity signal，但这里只关注故障策略是否可证明。

**最终记忆模型**

可靠性实验的最小单元是 source、policy、signal、recovery、verification；少任何一个字段，演练都不能证明系统在失败时安全。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/retry-demo` | slow dependency experiment | `timeout_total increments` | experiment policy boundary | transient | timeout before recovery | `npm run reliability:check` | catching and hiding the failure | experiment records do not identify policy, signal, or recovery command |


<a id="section-9-2"></a>

### 9.2 失败分类：timeout、abort、transient、permanent、conflict、duplicate、overload

**结论**

`FailureEvent` 是 discriminated union；`chooseSafePolicy()` 的 `switch` 让每种 `kind` 必须落到明确 recovery action。

**本节解决的问题**

如果 timeout、abort、duplicate 和 overload 都被塞进同一个 `Error`，retry executor 无法知道应该重试、拒绝、回放还是 shed load。

**技术意义**

TypeScript 在这里用于约束策略表，而不是验证真实网络。它能让新增 failure kind 时暴露未处理分支，从而减少“默认重试一切”的风险。

**概念解释**

`kind` 是判别字段；`signal` 是运行时观察；`retryable` 是策略输入；`SafePolicy` 限制输出动作。`duplicate` 被映射到 `replay`，不是 `retry`。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

TypeScript policy mapping boundary

- syntax: the discriminated union uses kind as the switch discriminator and fixed signal values for observed failures.
- TypeScript: chooseSafePolicy(event) must handle every FailureEvent variant or the switch becomes incomplete.
- JavaScript runtime: at runtime the switch receives plain objects; TypeScript types are erased before Node executes the function.
- testing boundary: tests should assert duplicate maps to replay, overload maps to shed, and abort maps to reject.
- mistake boundary: retryable alone is not a safe policy because duplicate replay and overload shedding have different side-effect rules.

**底层机制**

当调用方传入 `{ kind: 'overload', signal: '429', retryable: true }`，`switch` 命中 overload case 并返回 `shed`。这个结果把 overload 从 dependency retry 中分离出来。

**API / 配置 / 命令规则**

`timeout/transient/conflict` 可以进入 retry；`abort/permanent` 必须 reject；`duplicate` 进入 replay；`overload` 进入 shed。新增 kind 时必须同步安全策略。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/01-failure-model/failure-taxonomy.ts</span>
</div>

```ts
export type FailureKind =
  | "timeout"
  | "abort"
  | "transient"
  | "permanent"
  | "conflict"
  | "duplicate"
  | "overload";

export type SafePolicy = "reject" | "retry" | "replay" | "fallback" | "shed";

export type FailureEvent =
  | { kind: "timeout"; signal: "AbortError"; retryable: true }
  | { kind: "abort"; signal: "AbortSignal"; retryable: false }
  | { kind: "transient"; signal: "ECONNRESET"; retryable: true }
  | { kind: "permanent"; signal: "ZodError"; retryable: false }
  | { kind: "conflict"; signal: "P2034"; retryable: true }
  | { kind: "duplicate"; signal: "Idempotency-Key"; retryable: false }
  | { kind: "overload"; signal: "429"; retryable: true };

export interface FailureExample {
  kind: FailureKind;
  retryable: boolean;
  safePolicy: SafePolicy;
  signal: string;
}

export const failureTaxonomy: FailureExample[] = [
  { kind: "timeout", retryable: true, safePolicy: "retry", signal: "AbortError" },
  { kind: "permanent", retryable: false, safePolicy: "reject", signal: "ZodError" },
  { kind: "duplicate", retryable: false, safePolicy: "replay", signal: "Idempotency-Key" },
  { kind: "overload", retryable: true, safePolicy: "shed", signal: "429" }
];

export function chooseSafePolicy(event: FailureEvent): SafePolicy {
  switch (event.kind) {
    case "timeout":
    case "transient":
    case "conflict":
      return "retry";
    case "abort":
    case "permanent":
      return "reject";
    case "duplicate":
      return "replay";
    case "overload":
      return "shed";
  }
}
```
</div>


**逐行解释**

`FailureKind` 枚举所有分类；`FailureEvent` 绑定每个分类的 signal；`failureTaxonomy` 是可被测试读取的运行时表；`chooseSafePolicy()` 是 policy router。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/01-failure-model/failure-taxonomy.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

导入文件时，Node 只求值类型擦除后的 `failureTaxonomy` array 和 `chooseSafePolicy` function。没有顶层请求或 I/O，因此 wrapper 输出 import 成功。

**为什么会得到这个结果**

TypeScript 不能证明真实 Redis 是否掉线，但能证明代码没有把 `duplicate` 当成普通 retryable timeout。分类到策略的函数是后续 retry/idempotency/error mapping 的入口。

**对比情况**

正确路径：每个 FailureEvent kind 都通过 discriminated union 映射到唯一 safe policy。错误路径：只用 retryable boolean 会把 duplicate、overload、abort 混进同一个处理分支。

**常见错误为什么错**

把 `retryable: true` 当作唯一判断条件会违反 HTTP 和 side-effect 边界：overload 可能需要 shed，duplicate 需要 replay，abort 需要停止。

**与真实项目的关系**

真实项目识别规则：如果日志里只有 error message 而没有 failure kind 和 policy，排障时会在 retry、reject、replay、shed 之间反复猜测。

**与当前学习路径的关系**

本节复用 Chapter 04 的 discriminated union 思路，但它服务于后端可靠性策略，而不是普通业务枚举。

**最终记忆模型**

失败分类不是标签；它是 TypeScript union、运行时 signal 和安全策略之间的映射表。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /reliability/idempotent-operation` | duplicate request | `Idempotency-Key` | TypeScript policy mapping boundary | duplicate | replay stored response | `chooseSafePolicy({ kind: 'duplicate', ... })` returns `replay` | using one retryable boolean for every failure | logs show retry attempts for duplicate writes instead of idempotency replay |


<a id="section-9-3"></a>

### 9.3 HTTP timeout 边界：requestTimeout、headersTimeout、keepAliveTimeout

**结论**

`server.requestTimeout` 保护完整请求接收窗口，`headersTimeout` 保护 header 接收，`keepAliveTimeout` 保护 idle keep-alive socket；这些是 `node:http` server 属性，不是 Express catch 能控制的边界。

**本节解决的问题**

慢客户端、半开连接和 idle keep-alive 会占用 socket；如果只在 Express handler 内 catch error，headers 尚未完整到达时 handler 根本不会运行。

**技术意义**

HTTP timeout 是连接资源治理。它限制 socket 在 server 内停留的时间，避免慢请求把进程的连接容量耗尽。

**概念解释**

`applyHttpTimeouts(server)` 接收真实 `http.Server` 实例并写入三个属性。Express app 只是 request listener；socket lifecycle 仍由 Node HTTP server 管。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

node:http socket boundary

- syntax: assigning server.requestTimeout, server.headersTimeout, and server.keepAliveTimeout configures concrete http.Server properties.
- Node runtime: the http server owns socket and request parsing before Express sees a Request object.
- HTTP behavior: headersTimeout protects header arrival, requestTimeout protects full request receipt, and keepAliveTimeout protects idle socket reuse.
- Express boundary: Express middleware cannot catch failures that occur before a route is selected.
- Docker/runtime boundary: NGINX and container health checks may add outer timeouts, but they do not replace Node server timeout ownership.

**底层机制**

server 创建后，Node 在 socket 上接收 bytes。headers 未完成时，`headersTimeout` 到期会终止等待；body 或完整 request 超过 `requestTimeout` 会触发请求级超时；响应完成后的 keep-alive idle 超过 `keepAliveTimeout` 会关闭复用窗口。

**API / 配置 / 命令规则**

server timeout 保护接收和连接资源；它不替代 handler 内 dependency timeout，不取消 Prisma/Redis 命令，也不证明 POST 可安全重试。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/02-timeout-abort/http-server-timeouts.ts</span>
</div>

```ts
import http from "node:http";

export function applyHttpTimeouts(server: http.Server): void {
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
}
```
</div>


**逐行解释**

`import http` 提供 server 类型；`server.requestTimeout = 30_000` 限制 request；`headersTimeout = 10_000` 限制 headers；`keepAliveTimeout = 5_000` 限制 idle socket。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/02-timeout-abort/http-server-timeouts.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

导入 practice file 时没有 server 被创建；mini project 在 `src/server.ts` 中把这些属性写到实际 server 上。直接 import 只证明示例 API 可以被加载。

**为什么会得到这个结果**

这些属性生效的位置早于 Express middleware，所以 Express 的 try/catch 无法补救 header-level slow client。正确位置是 `http.createServer(app)` 返回后的 server object。

**对比情况**

正确路径：Node HTTP server 的 requestTimeout、headersTimeout 和 keepAliveTimeout 在 socket/request 边界生效。错误路径：把所有慢请求都放到 Express try/catch，导致 header 尚未到达时没有 route log。

**常见错误为什么错**

把所有 timeout 都写成 handler 内的 `Promise.race` 会遗漏 header 和 keep-alive socket，占用连接的问题仍然存在。

**与真实项目的关系**

真实项目识别规则：如果 socket 数增长但 route log 不出现，失败发生在 Express middleware 之前，应检查 Node HTTP server 或 NGINX 边界。

**与当前学习路径的关系**

本节连接 Chapter 03 的 HTTP server 创建，但新增 socket-level resource policy；它不是重新讲 routing。

**最终记忆模型**

HTTP server timeout 保护 socket 和 request parser；handler timeout 保护业务依赖，两者不能互相替代。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /health/ready` | slow client or idle connection | `server timeout property` | node:http socket boundary | timeout | close request or idle connection | `server.ts` sets requestTimeout, headersTimeout, keepAliveTimeout | assuming Express catch controls socket timeout | connections stay open before any route log appears |


<a id="section-9-4"></a>

### 9.4 `AbortController` 与 `AbortSignal.timeout()`：取消异步操作

**结论**

`AbortSignal.timeout(ms)` 创建 deadline signal；`timers/promises.setTimeout(..., { signal })` 注册可取消 timer；到期后 Promise 以 AbortError/TimeoutError 类信号拒绝并清理 timer handle。

**本节解决的问题**

`Promise.race([work, timer])` 只能让调用方先得到 timeout 结果，不能让底层 fetch、timer 或 socket 自动停止。

**技术意义**

取消必须传入底层 API。Node timers/promises 支持 `signal`，所以 abort 能真正结束等待；不支持 signal 的 API 只能由调用方额外 cleanup。

**概念解释**

`runBoundedDelay()` 创建 signal，再把它交给 `delay()`。当 delay 长于 signal deadline，timer promise 观察 abort 并 reject。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

Node timer promise signal boundary

- syntax: AbortSignal.timeout(timeoutMs) creates a signal value that can be passed into APIs supporting cancellation.
- Node runtime: node:timers/promises observes the signal and rejects the timer promise when the signal aborts.
- JavaScript behavior: a rejected promise travels through await and must be caught by the caller or test runner.
- testing boundary: the test must assert rejection and verify the timer-backed operation leaves no open handles.
- mistake boundary: Promise.race changes only the returned promise result and does not cancel unsupported underlying work.

**底层机制**

Node 设置两个时间相关资源：一个是 timeout signal 的内部 deadline，一个是 `delay()` 的 timer。deadline 先到时 signal 变为 aborted，timer promise 收到 abort event 后拒绝，并避免长 timer 继续占用 handle。

**API / 配置 / 命令规则**

需要取消的 API 必须接收 `signal`；timeout policy 应该给出明确 `timeoutMs`；测试应验证 rejection，而不是只验证函数返回了某个字符串。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/02-timeout-abort/abort-signal-timeout.ts</span>
</div>

```ts
import { setTimeout as delay } from "node:timers/promises";

export async function runBoundedDelay(timeoutMs: number): Promise<string> {
  const signal = AbortSignal.timeout(timeoutMs);
  await delay(timeoutMs + 20, undefined, { signal });
  return "completed";
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/02-timeout-abort/abortable-delay.ts</span>
</div>

```ts
import { setTimeout as delay } from "node:timers/promises";

export async function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  await delay(ms, undefined, { signal });
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/02-timeout-abort/fetch-timeout-wrapper.ts</span>
</div>

```ts
export async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
}
```
</div>

**逐行解释**

`signal` 是 cancellation carrier；`delay(timeoutMs + 20, undefined, { signal })` 故意比 deadline 长；`return 'completed'` 只在没有 timeout 时可达。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx --test --test-concurrency=1 tests/timeout-abort.unit.test.ts
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
pass 1
fail 0
```
</div>


**执行过程**

测试文件调用 timeout wrapper，Node built-in test runner 等待 Promise rejection；成功路径是测试捕获 TimeoutError，而不是进程输出业务结果。

**为什么会得到这个结果**

会得到 rejection，是因为支持 signal 的 `delay()` 订阅了 abort event。单纯 race 不会触发这个 event，也不会告诉原始 operation 停止。

**对比情况**

正确路径：AbortSignal.timeout() 到达底层 timer promise，timer-backed operation 通过 signal reject。错误路径：只用 Promise.race 改变返回结果，但不支持 abort 的底层 work 可能继续运行。

**常见错误为什么错**

只用 `Promise.race` 返回 timeout 响应违反 cancellation ownership：调用者停止等待了，底层工作仍可能继续执行和写入。

**与真实项目的关系**

真实项目识别规则：如果请求已经返回 timeout 但数据库、Redis 或 timer 仍继续工作，说明返回层 timeout 没有传播到实际工作资源。

**与当前学习路径的关系**

本节把 Chapter 01 的 timer/event loop 知识接到后端依赖 timeout；它是 retry 和 fallback 之前的资源停止机制。

**最终记忆模型**

Timeout 是期限；AbortSignal 是取消载体；底层 API 支持 signal 时，工作才会被要求停止。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/abort-demo` | caller cancellation or deadline | `AbortError` | Node timer promise signal boundary | abort | stop waiting and cleanup | `tests/timeout-abort.unit.test.ts` passes | racing without aborting the underlying operation | open handles remain after the caller already received a timeout |


<a id="section-9-5"></a>

### 9.5 timeout、abort、retry、fallback 的区别

**结论**

`chooseNextAction()` 把 operation result 转换成下一步动作：success 返回、aborted 拒绝、retryable failure 重试、optional dependency error 才 fallback。

**本节解决的问题**

timeout、abort、retry、fallback 经常被混成一个“失败恢复”词。混用会导致 abort 后继续 retry，或 dependency error 未分类就返回 stale data。

**技术意义**

这些动作属于不同层：timeout 是 deadline result；abort 是 cancellation mechanism；retry 是再次尝试策略；fallback 是替代响应策略。

**概念解释**

`OperationResult` 描述已经观察到的结果；`NextAction` 描述策略选择。函数先处理 success 和 abort，再看 retryable，最后才看 fallback 是否可用。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

result-to-action policy boundary

- syntax: OperationResult carries a discriminant outcome that chooseNextAction can switch on deterministically.
- TypeScript: the union separates timed_out, aborted, failed, and succeeded outcomes before policy is chosen.
- Node runtime: timeout and abort are promise outcomes; retry and fallback are application policy choices after classification.
- HTTP boundary: a route should turn the chosen action into a status, response body, retry header, or fallback marker.
- mistake boundary: treating fallback as another timeout hides whether the dependency was cancelled, retried, or intentionally degraded.

**底层机制**

当结果是 `{ outcome: 'dependency_error', retryable: false }` 且 fallbackAvailable 为 true，函数返回 `fallback`。当结果是 `aborted`，即使 fallbackAvailable 为 true 也返回 `reject`，因为调用方已经取消。

**API / 配置 / 命令规则**

abort 优先于 retry；retry 只看 retryable；fallback 只在可选依赖且有安全替代数据时使用；validation error 永远不应该 retry。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/02-timeout-abort/timeout-vs-abort-vs-retry.ts</span>
</div>

```ts
export type OperationResult =
  | { outcome: "success" }
  | { outcome: "timeout"; retryable: true }
  | { outcome: "aborted"; retryable: false }
  | { outcome: "dependency_error"; retryable: boolean }
  | { outcome: "validation_error"; retryable: false };

export type NextAction = "return_success" | "retry" | "fallback" | "reject";

export function chooseNextAction(result: OperationResult, fallbackAvailable: boolean): NextAction {
  if (result.outcome === "success") return "return_success";
  if (result.outcome === "aborted") return "reject";
  if (result.retryable) return "retry";
  if (fallbackAvailable && result.outcome === "dependency_error") return "fallback";
  return "reject";
}
```
</div>


**逐行解释**

`OperationResult` 的每个分支表达一个已观察结果；`NextAction` 限定策略输出；`result.retryable` 只在非 success/aborted 分支中参与判断。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/02-timeout-abort/timeout-vs-abort-vs-retry.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

直接导入文件没有 stdout；wrapper 输出 import 成功。真正行为应由调用方用不同 `OperationResult` 输入断言返回 action。

**为什么会得到这个结果**

结果由分支顺序决定：abort 是 caller ownership，必须停止；retry 是 dependency ownership，需要预算；fallback 是 response ownership，必须标记 degraded。

**对比情况**

正确路径：timeout、abort、retry 和 fallback 先分类成 OperationResult，再转换为 next action。错误路径：把超时直接等同于 fallback，会让可重试的 transient failure 被静默降级。

**常见错误为什么错**

把 fallback 放在 retry 前会违反 failure classification：系统可能在暂时失败时直接返回陈旧数据，绕过 retry budget 和 metric。

**与真实项目的关系**

真实项目识别规则：如果同一类 dependency timeout 有时 retry、有时 fallback、有时 500，说明 result-to-action policy 没有集中建模。

**与当前学习路径的关系**

本节为后续 9.6 retry、9.15 cache fallback、9.18 graceful degradation 提供动作分层。

**最终记忆模型**

先识别结果，再选择动作；timeout、abort、retry、fallback 不是同一个层的词。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/timeout-demo` | slow dependency | `504 problem response` | result-to-action policy boundary | timeout | retry or reject before fallback | `chooseNextAction()` action output | fallback before classification | responses do not say whether the operation timed out, was aborted, retried, or degraded |


<a id="section-9-6"></a>

### 9.6 Retry policy：max attempts、backoff、jitter 与 retry budget

**结论**

`retryOperation()` 用 `maxAttempts` 限制循环，用 `retryBudget` 限制额外请求量，用 `calculateBackoffWithJitter()` 拉开重试时间，并在 `signal.aborted` 时停止。

**本节解决的问题**

没有预算的 retry 会在依赖过载时放大流量；所有客户端同步 sleep 后再重试，会形成第二波尖峰。

**技术意义**

retry 是负载敏感策略，不是错误兜底。max attempts 限制单请求，budget 限制额外尝试，jitter 降低同步重试概率。

**概念解释**

`RetryPolicy` 是调用方传入的限制。`remainingBudget` 是运行时状态；每次失败后先检查 attempts 和 budget，再决定是否 delay。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

timer and retry-budget boundary

- syntax: RetryPolicy exposes maxAttempts, baseDelayMs, maxDelayMs, retryBudget, and jitterRatio as explicit limits.
- Node runtime: node:timers/promises delay schedules backoff and can be cancelled through AbortSignal.
- JavaScript behavior: each await creates a new attempt boundary and either returns success or stores the last failure.
- testing/metrics boundary: retry count, budget consumption, and final outcome prove whether retry recovered or amplified load.
- mistake boundary: unbounded retry violates dependency protection because every caller can multiply downstream traffic.

**底层机制**

第一次失败保存到 `lastError`，如果还有 attempts 和 budget，就减少 budget 并等待 jittered backoff。`signal` 在循环开始和 delay 内都能中断 retry。

**API / 配置 / 命令规则**

retry 只应用于已分类 retryable failure；不要 retry validation/auth；不要 retry unsafe POST，除非 idempotency key 已建立 replay boundary。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/03-retry-policy/retry-policy-executor.ts</span>
</div>

```ts
import { setTimeout as delay } from "node:timers/promises";

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryBudget: number;
}

export function calculateBackoffWithJitter(attempt: number, policy: RetryPolicy): number {
  const exponential = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * Math.max(1, exponential * 0.2));
  return exponential + jitter;
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  signal?: AbortSignal
): Promise<T> {
  let remainingBudget = policy.retryBudget;
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    if (signal?.aborted) {
      throw signal.reason ?? new Error("Retry aborted");
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === policy.maxAttempts || remainingBudget <= 0) break;
      remainingBudget -= 1;
      await delay(calculateBackoffWithJitter(attempt, policy), undefined, { signal });
    }
  }

  throw lastError;
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/03-retry-policy/exponential-backoff-jitter.ts</span>
</div>

```ts
export function backoffWithJitter(attempt: number, baseMs: number, capMs: number): number {
  const exponential = Math.min(capMs, baseMs * 2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * Math.max(1, exponential * 0.2));
  return exponential + jitter;
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/03-retry-policy/retry-budget.ts</span>
</div>

```ts
export interface RetryBudget {
  remaining: number;
}

export function consumeRetryBudget(budget: RetryBudget): boolean {
  if (budget.remaining <= 0) return false;
  budget.remaining -= 1;
  return true;
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/03-retry-policy/retry-safe-classifier.ts</span>
</div>

```ts
export function isRetrySafe(method: string, hasIdempotencyKey: boolean): boolean {
  const normalized = method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(normalized)) return true;
  if (["PUT", "DELETE"].includes(normalized)) return true;
  return normalized === "POST" && hasIdempotencyKey;
}
```
</div>

**逐行解释**

`maxAttempts` 控制循环次数；`retryBudget` 控制失败后能增加多少请求；`calculateBackoffWithJitter` 组合 exponential delay 和 random jitter；`delay(..., { signal })` 让等待也可取消。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx --test --test-concurrency=1 tests/retry-policy.unit.test.ts
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
pass 3
fail 0
```
</div>


**执行过程**

unit test 构造一个先失败后成功的 operation。第一次 rejection 进入 catch，第二次 attempt 返回 `ok`，test runner 观察到 attempts 为 2。

**为什么会得到这个结果**

测试通过是因为 executor 在成功时立即 return，没有继续消耗 budget。过载场景下，如果所有层都无界 retry，依赖收到的请求量会超过原始流量。

**对比情况**

正确路径：retry executor 同时受 maxAttempts、retryBudget、backoff、jitter 和 AbortSignal 限制。错误路径：无界 retry 在依赖变慢时扩大请求量，制造 retry storm。

**常见错误为什么错**

无限 retry 违反 retry budget；固定 sleep 无 jitter 会让大量请求同时重试；忽略 AbortSignal 会在 caller 放弃后继续打依赖。

**与真实项目的关系**

真实项目识别规则：如果 retry attempts 上升的同时 dependency latency 也上升，retry 可能正在放大过载，而不是从 transient failure 中恢复。

**与当前学习路径的关系**

本节把 Chapter 12 的 overload 风险接到 failure recovery；性能预算之外还需要 retry budget。

**最终记忆模型**

Retry 必须同时有次数、时间间隔、随机扰动、预算和取消边界。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/retry-demo` | temporary timeout | `retry attempt counter` | timer and retry-budget boundary | transient | bounded backoff retry | `tests/retry-policy.unit.test.ts` passes | infinite retry loop | latency and dependency traffic climb after the first failure |


<a id="section-9-7"></a>

### 9.7 Retry safety：safe method、idempotent method 与 side effect

**结论**

`describeHttpMethod()` 区分 safe 和 idempotent；`POST` 默认既不 safe 也不 idempotent，只有配合 idempotency key 和服务器记录才可安全重放。

**本节解决的问题**

网络 timeout 后客户端不知道服务端是否已经写入。盲目 retry POST 可能创建重复订单、重复 note 或重复外部 side effect。

**技术意义**

retry safety 来自 HTTP method semantics 和应用级幂等记录的组合，不来自 retry executor 本身。

**概念解释**

`safe` 表示请求语义不应改变服务器状态；`idempotent` 表示重复执行的最终效果相同。`POST` 可以通过 `Idempotency-Key` 被应用层包装成 replayable operation。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

HTTP method semantics boundary

- syntax: method strings must be normalized before classification because HTTP method input is runtime data.
- HTTP behavior: safe and idempotent describe protocol semantics, not whether a specific handler is implemented correctly.
- TypeScript: the classifier can return a boolean policy, but it cannot prove a handler has no side effects.
- security boundary: unsafe POST requires Idempotency-Key before automatic replay is allowed.
- mistake boundary: putting side effects behind GET violates safe-method expectations even if the TypeScript function returns true.

**底层机制**

当输入 `POST`，函数返回 `{ safe: false, idempotent: false }`。retry layer 看到这个结果后，必须要求 idempotency key 或拒绝自动 retry。

**API / 配置 / 命令规则**

`GET/HEAD/OPTIONS/TRACE` safe；`PUT/DELETE` idempotent 但不 safe；`POST` unsafe，只有建立 key、fingerprint、stored result 后才 replay。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/04-idempotency/http-method-safety.ts</span>
</div>

```ts
export interface MethodSafety {
  safe: boolean;
  idempotent: boolean;
}

export function describeHttpMethod(method: string): MethodSafety {
  const normalized = method.toUpperCase();
  return {
    safe: ["GET", "HEAD", "OPTIONS", "TRACE"].includes(normalized),
    idempotent: ["GET", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE"].includes(normalized)
  };
}
```
</div>


**逐行解释**

`normalized` 避免大小写差异；safe array 和 idempotent array 分开；返回对象让调用方独立判断 read safety 和 replay safety。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/04-idempotency/http-method-safety.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

practice file 没有顶层输出；import 命令只证明 module 可加载。实际 retry safety 由 idempotency endpoint 和 tests 验证。

**为什么会得到这个结果**

POST 不可盲目 retry，是因为 timeout 无法告诉客户端服务端是否已经提交副作用；idempotency store 才能回答是否返回同一个结果。

**对比情况**

正确路径：GET/HEAD/OPTIONS 依赖 HTTP safe semantics，PUT/DELETE 依赖 idempotent semantics，POST 只有带 Idempotency-Key 才能重放。错误路径：看到 5xx 就重试所有 method，可能重复创建资源。

**常见错误为什么错**

把所有 5xx/timeout POST 都交给 retry executor，违反 side-effect ownership；一旦第一次请求已提交，第二次请求会制造重复写入。

**与真实项目的关系**

真实项目识别规则：如果 POST endpoint 没有 Idempotency-Key 却被 gateway、client 或 worker 自动重试，重复 side effect 风险高于短暂失败本身。

**与当前学习路径的关系**

本节把 Chapter 03 HTTP 方法语义接到 Chapter 05 持久化副作用；后续 9.8 负责实现 POST 的 replay boundary。

**最终记忆模型**

安全重试先问 method，再问 side effect，最后问 idempotency record。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /reliability/idempotent-operation` | lost response after write | `Idempotency-Key` | HTTP method semantics boundary | duplicate | retry only when replayable | same operation id on replay | retrying POST without a key | duplicate records appear after timeout retries |


<a id="section-9-8"></a>

### 9.8 Idempotency key：让 unsafe POST 支持安全重放

**结论**

`decideReplay()` 同时检查 key、request fingerprint、stored status/response 的记录和 `expiresAt`；key 相同但 fingerprint 不同必须进入 conflict。

**本节解决的问题**

只存 key 不存 fingerprint 时，客户端可以用同一个 key 提交不同 body；服务端无法判断应该 replay 旧结果还是执行新副作用。

**技术意义**

Idempotency 是 key + fingerprint + stored result + expiration 的持久化协议。它让 unsafe POST 在 retry 后返回同一个结果，而不是再次执行操作。

**概念解释**

`StoredIdempotencyRecord` 保存 key、fingerprint、statusCode、responseBody、expiresAt。`decideReplay()` 对 missing key、missing record、expired record、same fingerprint、different fingerprint 分别给出结果。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

PostgreSQL idempotency record boundary

- syntax: the record carries key, requestFingerprint, stored statusCode, responseBody, and expiresAt.
- Prisma/database behavior: a unique key lookup owns replay identity, while fingerprint comparison prevents cross-body replay.
- HTTP boundary: missing or conflicting keys should become stable client errors before the side effect runs.
- security boundary: the stored response must not replay sensitive data for a different authenticated user or different request body.
- testing boundary: same key plus same fingerprint replays, while same key plus different fingerprint conflicts.

**底层机制**

same key + same fingerprint 命中 replay；same key + different fingerprint 返回 conflict；expired record 允许重新创建；missing key 在 demo POST 中由 endpoint 映射为 400。

**API / 配置 / 命令规则**

unsafe POST 缺 key 不执行 demo operation；冲突返回 409；replay 返回原 status 和 response body；过期记录可以被清理但不应泄露敏感字段。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/04-idempotency/idempotency-replay-decision.ts</span>
</div>

```ts
export type ReplayDecision = "replay" | "create" | "conflict" | "expired";

export interface StoredIdempotencyRecord {
  key: string;
  requestFingerprint: string;
  statusCode: number;
  responseBody: unknown;
  expiresAt: Date;
}

export function decideReplay(
  record: StoredIdempotencyRecord | null,
  incomingKey: string | undefined,
  incomingFingerprint: string,
  now = new Date()
): ReplayDecision {
  if (!incomingKey) return "conflict";
  if (!record) return "create";
  if (record.expiresAt <= now) return "expired";
  if (record.key === incomingKey && record.requestFingerprint === incomingFingerprint) return "replay";
  return "conflict";
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/04-idempotency/duplicate-post-mistake.ts</span>
</div>

```ts
export function duplicatePostMistake(hasIdempotencyKey: boolean): string {
  return hasIdempotencyKey
    ? "safe replay boundary is present"
    : "duplicate side effect risk is present";
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/04-idempotency/idempotency-key-model.ts</span>
</div>

```ts
export interface IdempotencyRecord {
  key: string;
  requestFingerprint: string;
  statusCode: number;
  responseBody: unknown;
  expiresAt: Date;
}
```
</div>

**逐行解释**

`incomingKey` 是 header 边界；`record.expiresAt <= now` 先处理过期；`record.key === incomingKey && record.requestFingerprint === incomingFingerprint` 是唯一 replay 条件。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx --test --test-concurrency=1 tests/idempotency.unit.test.ts
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
pass 2
fail 0
```
</div>


**执行过程**

unit test 验证 fingerprint 稳定和短 key rejection；integration test 对同一 key/body 发两次请求，并比较 `operationId` 是否相同。

**为什么会得到这个结果**

replay 返回同一结果，是因为服务端没有再次执行业务操作，而是读取 stored response body。不同 fingerprint 返回 409 是为了阻止 key 被复用到不同副作用。

**对比情况**

正确路径：只有 idempotency key 和 request fingerprint 同时匹配时才允许 replay。错误路径：只存 key 会让不同 request body 复用同一个 idempotency key。

**常见错误为什么错**

把 idempotency key 当作普通去重字符串，违反 request identity 规则；没有 fingerprint 就不能证明两次 POST 语义相同。

**与真实项目的关系**

真实项目识别规则：如果重复请求返回了旧响应但 request body 不同，应检查 idempotency record 是否保存并比较 fingerprint。

**与当前学习路径的关系**

本节把 Chapter 06 的安全输入边界和 Chapter 05 的数据库记录结合起来，解决 retry safety 的写入侧证据。

**最终记忆模型**

Idempotency 的安全性来自 key、fingerprint、stored result、expiration；key alone is not replay safety。

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /reliability/idempotent-operation` | client retry after lost response | `stored response body` | PostgreSQL idempotency record boundary | duplicate | same fingerprint replays; different fingerprint conflicts | `tests/idempotency.integration.test.ts` compares operation ids | storing only the key | same idempotency key accepts different request bodies |


<a id="section-9-9"></a>

### 9.9 RFC 9457 Problem Details：稳定错误响应契约

**结论**

Problem Details 用 `type/title/status/detail/instance/code` 固定错误响应；安全扩展可以包含 `retryable`、`retryAfterSeconds`、`requestId`、`validationErrors`。

**本节解决的问题**

自由文本错误让客户端解析困难，raw Error 又容易泄露 stack、SQL、database URL、Redis URL、password hash、token 或 cookie。

**技术意义**

错误契约是客户端和服务端之间的稳定协议。它说明失败类型、HTTP status、实例路径和可重试性，而不是暴露内部实现。

**概念解释**

`ProblemDetails` interface 是响应 shape；`code` 是应用稳定枚举；`type` 是可文档化的问题 URI；`detail` 是安全说明，不是 raw stack。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

Express error response boundary

- syntax: Problem Details fields use fixed response property names such as type, title, status, detail, instance, and requestId.
- Express behavior: the error middleware owns the final status code and JSON body once control reaches the error boundary.
- HTTP behavior: status and response content must describe the client-visible contract, not the internal exception class.
- security boundary: stack traces, tokens, cookies, database URLs, and Redis URLs stay out of the response body.
- testing boundary: tests should assert stable fields and absence of unsafe internal fields.

**底层机制**

handler 抛出 TimeoutError 后，error middleware 映射为 504，构造 Problem Details，设置 content type，再结束 response。客户端根据 `code` 和 `retryable` 判断下一步。

**API / 配置 / 命令规则**

`status` 必须匹配 HTTP status；`instance` 使用安全路径；`requestId` 可以帮助查日志；不要输出 raw stack、SQL、env dump、token、cookie。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/05-error-contracts/problem-details-model.ts</span>
</div>

```ts
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/05-error-contracts/retry-after-header.ts</span>
</div>

```ts
export function retryAfterHeader(seconds: number): Record<string, string> {
  return { "Retry-After": String(Math.max(1, Math.floor(seconds))) };
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/05-error-contracts/safe-error-response.ts</span>
</div>

```ts
export function removeUnsafeErrorFields(error: Record<string, unknown>): Record<string, unknown> {
  const { stack, password, token, cookie, databaseUrl, redisUrl, ...safeFields } = error;
  return safeFields;
}
```
</div>

**逐行解释**

`type` 定位问题类别；`title` 给短标题；`status` 是 HTTP 数字；`detail` 是安全解释；`instance` 是请求实例；`code` 是应用稳定判断键。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx --test --test-concurrency=1 tests/problem-details.unit.test.ts
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
pass 1
fail 0
```
</div>


**执行过程**

unit test 构造 504 problem，断言字段存在且没有 `stack`。这比检查错误字符串更稳定。

**为什么会得到这个结果**

测试通过说明响应模型只包含允许字段。真实请求失败时，error middleware 复用同一模型，避免每个 handler 自己拼错误。

**对比情况**

正确路径：Problem Details 输出稳定 type、title、status、detail、instance 和 requestId，并隐藏内部 stack。错误路径：把原始 Error 对象序列化给客户端，暴露数据库、token 或 stack 信息。

**常见错误为什么错**

把 `error.stack` 返回给客户端违反安全边界，也会把内部路径和依赖细节暴露给不可信调用方。

**与真实项目的关系**

真实项目识别规则：如果客户端依赖 stack、SQL message 或内部 exception class 做判断，错误契约已经泄漏实现细节。

**与当前学习路径的关系**

本节建立后续 error mapping、timeout、dependency unavailable、rate limit 的统一响应格式。

**最终记忆模型**

Problem Details 是错误响应协议；debug detail belongs in logs, not in public response.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/timeout-demo` | dependency timeout | `application/problem+json` | Express error response boundary | timeout | safe problem details | `tests/problem-details.unit.test.ts` passes | returning raw Error | clients parse strings or responses contain stack traces |


<a id="section-9-10"></a>

### 9.10 Error mapping：validation、auth、conflict、timeout、dependency、rate limit

**结论**

`mapErrorCode()` 把 validation/auth/forbidden/not found/conflict/timeout/dependency unavailable/rate limited/internal error 转成 status、retryable 和 title。

**本节解决的问题**

如果所有错误都返回 500，客户端无法区分表单错误、认证失败、资源不存在、可重试依赖失败和限流。

**技术意义**

Error mapping 是稳定错误契约的策略层。它决定 HTTP status，也决定 retry policy 是否允许继续。

**概念解释**

`ErrorCode` 是应用内部分类；`ErrorMapping` 是公开响应策略。`TIMEOUT`、`DEPENDENCY_UNAVAILABLE`、`RATE_LIMITED` retryable；validation/auth/conflict/not found 通常不可 retry。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

error middleware mapping boundary

- syntax: error codes are stable string inputs to the mapping function, while raw Error objects remain runtime data.
- TypeScript: the mapping table checks known codes but cannot guarantee every thrown value has a safe shape.
- Express behavior: error middleware converts classification into status, retryable flag, headers, and safe message.
- HTTP boundary: conflict, validation, timeout, and unavailable states need different status codes and client policies.
- mistake boundary: a catch-all 500 loses retryability and user-action information.

**底层机制**

错误进入 middleware 后先被分类为 code，再由 mapping function 输出 status。Problem Details 使用这个 status 和 code，metrics 使用低基数 code/statusClass 计数。

**API / 配置 / 命令规则**

不要把 validation 设为 retryable；不要把 auth failure 当 transient；dependency unavailable 和 timeout 可以建议 retry；internal error 默认不泄露细节。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/05-error-contracts/error-mapping-table.ts</span>
</div>

```ts
export const errorStatusByCode = {
  VALIDATION_ERROR: 400,
  AUTHENTICATION_REQUIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TIMEOUT: 504,
  DEPENDENCY_UNAVAILABLE: 503,
  RATE_LIMITED: 429
} as const;

export type ErrorCode = keyof typeof errorStatusByCode | "INTERNAL_ERROR";

export interface ErrorMapping {
  status: number;
  retryable: boolean;
  title: string;
}

export function mapErrorCode(code: ErrorCode): ErrorMapping {
  switch (code) {
    case "VALIDATION_ERROR":
      return { status: 400, retryable: false, title: "Validation failed" };
    case "AUTHENTICATION_REQUIRED":
      return { status: 401, retryable: false, title: "Authentication required" };
    case "FORBIDDEN":
      return { status: 403, retryable: false, title: "Forbidden" };
    case "NOT_FOUND":
      return { status: 404, retryable: false, title: "Not found" };
    case "CONFLICT":
      return { status: 409, retryable: false, title: "Conflict" };
    case "TIMEOUT":
      return { status: 504, retryable: true, title: "Dependency timeout" };
    case "DEPENDENCY_UNAVAILABLE":
      return { status: 503, retryable: true, title: "Dependency unavailable" };
    case "RATE_LIMITED":
      return { status: 429, retryable: true, title: "Rate limited" };
    case "INTERNAL_ERROR":
      return { status: 500, retryable: false, title: "Internal server error" };
  }
}
```
</div>


**逐行解释**

`errorStatusByCode` 是快速索引；`ErrorCode` 扩展 `INTERNAL_ERROR`；`mapErrorCode()` 的每个 case 返回固定 status 和 retryable flag。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/05-error-contracts/error-mapping-table.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

导入 practice module 无 stdout；wrapper 输出 import 成功。真实映射在 mini project 的 `error-middleware.ts` 和 tests 中体现。

**为什么会得到这个结果**

同一 Problem Details 格式可以承载不同策略，是因为 code/status/retryable 三者分离。客户端无需猜测 500 是否可重试。

**对比情况**

正确路径：error mapping 按稳定 code 产生 HTTP status、retryable 和 safe message。错误路径：所有异常都返回 500，使客户端无法区分 validation、conflict、timeout 和 dependency unavailable。

**常见错误为什么错**

把 conflict 和 dependency unavailable 都映射成 500，违反 HTTP semantics；调用方会重试永久业务冲突或放弃临时依赖失败。

**与真实项目的关系**

真实项目识别规则：如果所有 dependency、validation 和 conflict 错误都在 dashboards 中表现为 500，说明 error mapper 没有输出稳定分类。

**与当前学习路径的关系**

本节把 Chapter 06 auth/security、Chapter 05 database conflict 和本章 timeout/dependency failure 接到一个响应出口。

**最终记忆模型**

Error mapping answers two questions: what status should client see, and may client retry?

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /notebooks` | validation or dependency error | `Problem Details code` | error middleware mapping boundary | permanent or transient | reject permanent errors; retry transient dependency errors | `mapErrorCode()` returns status and retryable flag | mapping every error to 500 | clients cannot distinguish retryable and non-retryable responses |


<a id="section-9-11"></a>

### 9.11 Prisma transaction conflict recovery：P2034 与完整事务重试

**结论**

`withTransactionRetry()` 把 transaction callback 当成 retry unit；`P2034` 只允许在 helper 外层重新运行完整 closure，不允许只重试失败的某一条语句。

**本节解决的问题**

事务里的读和写共享一致性快照。只重试最后失败的 statement，可能基于过期读取继续写入，破坏冲突恢复语义。

**技术意义**

数据库冲突恢复必须尊重 transaction boundary。Prisma 的 `$transaction(operation, options)` 让整个 closure 可以被重新执行。

**概念解释**

`operation(transaction)` 是完整事务单元；catch 到 P2034 时 helper 记录 metric、delay，然后重新调用 `$transaction`。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

Prisma interactive transaction boundary

- TypeScript: operation(transaction) types the transaction client and prevents accidental use of the root client in the retry body.
- Prisma/database: $transaction owns the full transaction attempt, including all reads and writes in the closure.
- retry placement: retry is outside the transaction callback so a P2034 conflict reruns the entire unit of work.
- testing/metrics: recordTransactionRetry("p2034") or an equivalent test signal proves conflict retry happened.
- mistake boundary: retrying only one query inside the callback can commit a different sequence than the original transaction.

**底层机制**

第一次 `$transaction` 如果抛出 P2034，helper 不继续使用旧 transaction client，而是退出 catch，等待 delay，再用新的 `$transaction` 调用重新执行 closure。

**API / 配置 / 命令规则**

P2034 retry 必须有 maxAttempts；retry placement 在 transaction 外；非冲突错误不 retry；AbortSignal aborted 时停止。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/db/transaction-retry.ts</span>
</div>

```ts
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";
import { config } from "../config/env.js";
import { recordTransactionRetry } from "../observability/reliability-metrics.js";
import { abortableDelay } from "../reliability/abortable.js";
import { isRetryableTransactionConflict } from "./db-error-classifier.js";

export interface TransactionRetryOptions {
  maxAttempts?: number;
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
  signal?: AbortSignal;
}

export async function withTransactionRetry<T>(
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  options: TransactionRetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? Math.max(1, config.RETRY_BUDGET + 1);
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new Error("Transaction retry aborted");
    }

    try {
      return await prisma.$transaction(operation, {
        isolationLevel: options.isolationLevel ?? Prisma.TransactionIsolationLevel.Serializable,
        maxWait: options.maxWait ?? 2_000,
        timeout: options.timeout ?? 5_000
      });
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionConflict(error) || attempt === maxAttempts) break;
      recordTransactionRetry("p2034");
      await abortableDelay(25 * attempt, options.signal);
    }
  }

  throw lastError;
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/06-database-recovery/prisma-p2034-retry.ts</span>
</div>

```ts
export function isPrismaTransactionConflict(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/06-database-recovery/retry-whole-transaction.ts</span>
</div>

```ts
export async function retryWholeTransaction<T>(operation: () => Promise<T>, maxAttempts: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
    }
  }
  throw lastError;
}
```
</div>

**逐行解释**

`maxAttempts` 限制次数；`prisma.$transaction(operation, options)` 包住完整 closure；`isRetryableTransactionConflict(error)` 只允许 P2034 进入 retry；`recordTransactionRetry('p2034')` 提供观测。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
npm run typecheck
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
tsc --noEmit exits 0
```
</div>


**执行过程**

typecheck 验证 transaction callback、Prisma enum 和 helper types 一致；依赖运行时 migration/test 验证数据库路径。

**为什么会得到这个结果**

结果正确是因为每次 retry 都创建新的 transaction attempt。旧 transaction 的局部状态不会被继续复用。

**对比情况**

正确路径：P2034 被分类为 transaction conflict，整个 $transaction operation 作为一个 attempt 重新执行。错误路径：只重试 transaction callback 内的某一条 query，可能破坏事务原子性。

**常见错误为什么错**

在 transaction callback 内 catch P2034 并只重跑一条 create/update 语句，违反 whole transaction retry rule。

**与真实项目的关系**

真实项目识别规则：如果 PostgreSQL serialization conflict 之后只重放部分写入逻辑，应检查 retry 是否包住完整 transaction closure。

**与当前学习路径的关系**

本节扩展 Chapter 05 的 transaction 概念，加入冲突恢复和可靠性指标。

**最终记忆模型**

Transaction retry unit is the whole closure, not the failed SQL statement.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /notebooks/:notebookId/notes` | serialization conflict | `P2034` | Prisma interactive transaction boundary | conflict | retry whole transaction | transaction retry metric and typecheck | retrying only the failed statement | partial writes or stale reads appear after conflict recovery |


<a id="section-9-12"></a>

### 9.12 Transaction boundary：maxWait、timeout、isolation 与 retry placement

**结论**

`maxWait` 限制等待 transaction slot 的时间，`timeout` 限制事务执行时间，`isolationLevel` 决定冲突检测强度；retry 应包在 `$transaction` 外面。

**本节解决的问题**

pool wait timeout 和 transaction execution timeout 经常被混淆。前者是拿不到连接/事务资源，后者是拿到后执行太久。

**技术意义**

事务边界配置决定失败发生在进入事务前、事务执行中，还是提交冲突时。不同阶段需要不同分类和响应。

**概念解释**

`transactionBoundary` 用 `Serializable`、`maxWait: 2000`、`timeout: 5000` 表示高一致性但有明确等待上限。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

Prisma transaction option boundary

- syntax: maxWait, timeout, and isolationLevel are transaction options, not arbitrary retry configuration.
- Prisma/database behavior: maxWait controls connection acquisition, timeout controls transaction duration, and isolationLevel controls conflict semantics.
- retry placement: retry remains outside the callback because the callback represents one database attempt.
- TypeScript: option names are checked, but the database still decides lock waits and serialization conflicts at runtime.
- testing boundary: tests should distinguish option validation from real database conflict behavior.

**底层机制**

请求进入 create note service 后，helper 调用 `$transaction`。如果等待资源超过 maxWait，失败属于 pool/wait 边界；如果 closure 执行超过 timeout，失败属于 transaction runtime；如果提交冲突，P2034 进入 whole closure retry。

**API / 配置 / 命令规则**

不要在 callback 内 retry；不要让 transaction 无限等待；不要把 unique constraint conflict 当作 serialization retry。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/06-database-recovery/transaction-boundary.ts</span>
</div>

```ts
export interface TransactionBoundary {
  maxWait: number;
  timeout: number;
  isolationLevel: "Serializable";
}

export const transactionBoundary: TransactionBoundary = {
  maxWait: 2_000,
  timeout: 5_000,
  isolationLevel: "Serializable"
};
```
</div>


**逐行解释**

`maxWait` 是进入事务前等待；`timeout` 是事务执行窗口；`isolationLevel: 'Serializable'` 让数据库发现更多并发冲突。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/06-database-recovery/transaction-boundary.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

practice file 被导入时只暴露配置对象。真实行为在 mini project transaction helper 中通过 Prisma client 执行。

**为什么会得到这个结果**

retry 放在外层，是因为失败后旧 transaction client 已不再是安全执行上下文。外层 helper 能重新创建整个 attempt。

**对比情况**

正确路径：maxWait、timeout 和 isolationLevel 描述单次 transaction attempt 的数据库边界，retry 包在 transaction 外层。错误路径：在 callback 内捕获并继续执行，导致锁等待或冲突状态被隐藏。

**常见错误为什么错**

把 retry 写进 callback 违反 transaction ownership；callback 内部无法安全重置已经失败的事务上下文。

**与真实项目的关系**

真实项目识别规则：如果 transaction 经常卡在连接等待或锁等待，应分别检查 maxWait、timeout、isolationLevel 和外层 retry budget。

**与当前学习路径的关系**

本节把 Chapter 05 transaction API 与 Chapter 13 conflict recovery 组合起来。

**最终记忆模型**

maxWait asks how long to wait for a transaction; timeout asks how long the transaction may run.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /notebooks/:notebookId/notes` | pool wait or long transaction | `maxWait or timeout` | Prisma transaction option boundary | timeout or conflict | bound transaction and retry outside callback | `transactionBoundary` exposes maxWait, timeout, isolationLevel | placing retry inside the transaction callback | logs show retries inside a transaction that already failed |


<a id="section-9-13"></a>

### 9.13 Database failure taxonomy：unavailable、pool timeout、statement conflict、serialization failure

**结论**

`classifyDatabaseCode()` 把 `P1001/P1002` 归为 unavailable，`P2024` 归为 pool timeout，`P2034` 归为 transaction conflict；unique conflict 和 not found 不应进入 dependency retry。

**本节解决的问题**

数据库错误都叫“DB down”会导致错误响应和运维判断错位：唯一约束冲突是业务冲突，不是数据库不可用。

**技术意义**

数据库 failure taxonomy 决定 readiness、Problem Details 和 retry helper 的分工。

**概念解释**

unavailable 表示连接边界失败；pool timeout 表示等待连接资源失败；transaction conflict 表示并发写冲突；unique conflict 表示数据规则冲突；not found 是资源不存在。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

Prisma client and PostgreSQL boundary

- syntax: database classifiers should inspect stable codes such as Prisma code or SQLSTATE-like fields rather than free-form messages.
- Prisma/database behavior: pool timeout, conflict, unavailable connection, and permanent data errors originate from different resource boundaries.
- HTTP behavior: conflict can map to 409, unavailable can map to 503, and permanent data errors can map to 400 or 422.
- metrics boundary: failureKind should be low-cardinality and based on classification, not the full error message.
- mistake boundary: message substring matching breaks when driver wording, locale, or Prisma version changes.

**底层机制**

当 Prisma 抛出带 `code` 的 error，classifier 读取 code 字符串并返回稳定分类。上层不再直接依赖 raw error message。

**API / 配置 / 命令规则**

`P2034` only in transaction retry helper；`P2024` 可以映射为 pool timeout；`P2002` unique conflict 映射 409；`P2025` not found 映射 404。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/06-database-recovery/pool-timeout-classification.ts</span>
</div>

```ts
export function classifyDatabaseCode(code: string): string {
  if (code === "P2024") return "pool_timeout";
  if (code === "P2034") return "transaction_conflict";
  if (code === "P1001" || code === "P1002") return "database_unavailable";
  return "database_error";
}
```
</div>


**逐行解释**

函数按 code 精确匹配：`P2024` 返回 `pool_timeout`；`P2034` 返回 `transaction_conflict`；未知 code 返回 `database_error`。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/06-database-recovery/pool-timeout-classification.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

import 命令验证分类模块可加载。依赖可用性通过 `/health/ready` 和 migration/test 验证。

**为什么会得到这个结果**

不同 HTTP mapping 是必要的，因为客户端对 404、409、503、504 的行为不同。把所有数据库错误合并会破坏 retry safety。

**对比情况**

正确路径：数据库错误按 conflict、pool timeout、connection unavailable 和 permanent data error 分类。错误路径：只匹配 message 文本，驱动或 Prisma 文案变化后分类失效。

**常见错误为什么错**

把 unique constraint conflict 当 dependency unavailable，违反 data-rule boundary；客户端会错误重试永久业务冲突。

**与真实项目的关系**

真实项目识别规则：如果连接耗尽、序列化冲突和唯一约束冲突都被同一个 alert 捕获，数据库故障分类不足。

**与当前学习路径的关系**

本节把 Chapter 05 repository error 和 Chapter 10 health/metrics 汇合到可靠性分类。

**最终记忆模型**

Database failure code first decides category; category then decides HTTP mapping and retry eligibility.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /health/ready` | database unavailable | `P1001 or P1002` | Prisma client and PostgreSQL boundary | dependency | mark required dependency not ready | readiness returns dependency detail | reporting every DB error as conflict | readiness status and response code disagree with Prisma code |


<a id="section-9-14"></a>

### 9.14 Redis failure handling：error event、reconnect strategy、command timeout

**结论**

`getRedisClient()` 注册 `error` listener，配置 bounded reconnect strategy，并由 health/cache code 对命令套 timeout。Redis 失败必须被观察，不能让 socket error 变成隐形故障。

**本节解决的问题**

node-redis 连接失败如果没有 listener，应用无法把错误写入日志、health 或 metrics；无限重连也会隐藏 Redis 长时间不可用。

**技术意义**

Redis reliability 不是“缓存失败就忽略”。required Redis 路径影响 readiness，optional cache 路径才能降级。

**概念解释**

client 单例负责连接生命周期；`socket.connectTimeout` 限制连接；`reconnectStrategy` 限制重连预算；`client.on('error')` 把错误转为结构化日志。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

node-redis socket boundary

- syntax: createClient({ url }) creates a Redis client object and client.on("error") registers an error observer.
- Node runtime: Redis connectivity lives on sockets and timers outside normal Express handler control flow.
- Redis behavior: reconnect strategy and command timeout decide whether the application waits, retries, or fails fast.
- testing boundary: tests should simulate timeout or error events without requiring Redis to crash the process.
- mistake boundary: treating cache failure as a normal miss hides dependency outage and prevents alerting.

**底层机制**

第一次调用 `connectRedis()` 时创建 client 并 connect。后续 socket error 触发 listener，而不是由 Express route 直接捕获。health check 再把 ping timeout 分类为 unhealthy。

**API / 配置 / 命令规则**

必须监听 `error`；reconnect 不能无限无观测；Redis command 要有 timeout；optional fallback 必须标记 degraded；required Redis failure 影响 readiness。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/redis/redis-client.ts</span>
</div>

```ts
import { createClient } from "redis";
import { config } from "../config/env.js";
import { logger } from "../observability/logger.js";

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: config.REDIS_URL,
    socket: {
      connectTimeout: config.REDIS_CONNECT_TIMEOUT_MS,
      reconnectStrategy(retries) {
        if (retries > 10) return new Error("Redis reconnect budget exceeded");
        return Math.min(retries * 100, 2_000);
      }
    }
  });

  redisClient.on("error", (error) => {
    logger.warn({ dependency: "redis", error: error.message }, "Redis client error");
  });

  return redisClient;
}

export async function connectRedis(): Promise<RedisClient> {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
  redisClient = null;
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/07-redis-failure/redis-command-timeout.ts</span>
</div>

```ts
export async function runRedisCommandWithTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Redis command timed out")), timeoutMs).unref();
  });
  return Promise.race([operation, timeout]);
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/07-redis-failure/redis-error-listener.ts</span>
</div>

```ts
import { createClient } from "redis";

export function createObservedRedisClient(url: string) {
  const client = createClient({ url });
  client.on("error", (error) => {
    console.error({ dependency: "redis", message: error.message });
  });
  return client;
}
```
</div>

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/07-redis-failure/redis-reconnect-strategy.ts</span>
</div>

```ts
export function reconnectDelay(retries: number): number | Error {
  if (retries > 10) return new Error("Redis reconnect budget exceeded");
  return Math.min(retries * 100, 2_000);
}
```
</div>

**逐行解释**

`redisClient` 保存单例；`connectTimeout` 保护连接建立；`reconnectStrategy` 在 retries > 10 时返回 Error；`logger.warn` 只记录 dependency 和 message。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
npm run typecheck
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
tsc --noEmit exits 0
```
</div>


**执行过程**

typecheck 证明 Redis client 类型、config 和 logger import 正确。运行时通过 Compose Redis health、`/health/ready`、`npm run reliability:check` 验证。

**为什么会得到这个结果**

错误会被日志观察，是因为 `client.on('error')` 提前注册。没有 listener，应用层很难把 Redis failure 映射到 readiness 或 degraded response。

**对比情况**

正确路径：Redis client 有 error listener、reconnect strategy 和 command timeout，失败会变成受控 signal。错误路径：没有 error listener 时连接错误可能变成未观察异常或静默 cache miss。

**常见错误为什么错**

不监听 Redis error 违反 event ownership；把错误吞掉又违反 observability boundary。

**与真实项目的关系**

真实项目识别规则：如果 Redis outage 后进程崩溃或所有请求同步变慢，应检查 client error listener、reconnect budget 和 command timeout。

**与当前学习路径的关系**

本节建立 Chapter 07 Redis cache/session 基线上的 failure handling，不重讲 Redis 数据结构。

**最终记忆模型**

Redis failure must be observed at the client event boundary before it can become health, fallback, or metrics evidence.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /health/ready` | Redis connection error | `error event` | node-redis socket boundary | dependency | listener, bounded reconnect, command timeout | `docker compose ps` shows Redis healthy; readiness checks ping | no error listener | process logs miss Redis socket errors or readiness never changes |


<a id="section-9-15"></a>

### 9.15 Cache fallback 与 stale response 边界

**结论**

`readThroughCache()` 区分 cache hit、cache miss、cache failure、stale return 和 origin fallback；任何 fallback 都必须返回 `degraded` 和 `stale` 标记。

**本节解决的问题**

缓存失败时直接从 origin 返回可能是安全的，但如果不标记 degraded，调用方和运维系统会误以为 Redis 正常。

**技术意义**

cache fallback 是可选依赖策略，不是数据正确性的遮羞布。stale response 必须告诉客户端它不是新鲜数据。

**概念解释**

`source` 可以是 `cache`、`origin` 或 `stale`；`degraded` 表示路径发生降级；`stale` 表示返回值不是最新 origin read。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

cache-to-origin fallback boundary

- syntax: fallback functions return a result object that can explicitly include degraded and stale flags.
- Redis behavior: cache get failures are dependency failures, while cache misses are valid data absence.
- Prisma/database behavior: origin reads are allowed only when the data is safe to serve without Redis.
- HTTP boundary: responses should expose degraded or stale state through body, header, log, or metric signal.
- security boundary: required authentication, authorization, and write consistency must not be treated as optional cache data.

**底层机制**

先尝试 `readCache()`；命中则返回 cache。miss 则读 origin。cache throw 后先尝试 stale；有 stale 就返回 degraded stale，没有 stale 才读 origin 并标记 degraded。

**API / 配置 / 命令规则**

不要静默返回 stale；不要用 cache fallback 掩盖 required dependency；不要把 stale 数据当最新写入依据。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/07-redis-failure/cache-fallback-boundary.ts</span>
</div>

```ts
export interface CacheFallbackResult<T> {
  value: T;
  source: "cache" | "origin" | "stale";
  degraded: boolean;
  stale: boolean;
  detail: string;
}

export async function readThroughCache<T>(
  readCache: () => Promise<T | null>,
  readStale: () => Promise<T | null>,
  readOrigin: () => Promise<T>
): Promise<CacheFallbackResult<T>> {
  try {
    const cached = await readCache();
    if (cached !== null) {
      return { value: cached, source: "cache", degraded: false, stale: false, detail: "cache hit" };
    }

    return { value: await readOrigin(), source: "origin", degraded: false, stale: false, detail: "cache miss" };
  } catch (error) {
    const stale = await readStale();
    if (stale !== null) {
      return { value: stale, source: "stale", degraded: true, stale: true, detail: "cache failed; stale value returned" };
    }

    return { value: await readOrigin(), source: "origin", degraded: true, stale: false, detail: "cache failed; origin fallback used" };
  }
}
```
</div>


**逐行解释**

`try` 块处理 hit/miss；`catch` 块处理 cache failure；`readStale()` 是第二选择；所有 fallback response 都写 `degraded: true`。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/07-redis-failure/cache-fallback-boundary.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

practice module import 没有 stdout；调用方可注入三个 async 函数分别模拟 cache hit、miss、failure，并断言 result flags。

**为什么会得到这个结果**

结果能表达降级，是因为 fallback function 的返回类型包含 `source/degraded/stale/detail`，不是只返回裸 value。

**对比情况**

正确路径：cache 失败后只对可降级数据读取 origin 或 stale value，并显式标记 degraded/stale。错误路径：把 cache miss、Redis outage 和 required data failure 都当成空结果。

**常见错误为什么错**

返回旧数据却不设置 stale/degraded 违反 response honesty；客户端会把旧结果当成当前状态。

**与真实项目的关系**

真实项目识别规则：如果页面显示旧数据但 response/header/log 没有 degraded 或 stale signal，用户和运维都无法判断结果可信度。

**与当前学习路径的关系**

本节把 Chapter 07 cache 与 Chapter 10 metrics 接到 graceful degradation。

**最终记忆模型**

Fallback may preserve availability; degraded and stale flags preserve truth.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/degraded-cache` | optional Redis cache failure | `degraded true` | cache-to-origin fallback boundary | dependency | explicit origin or stale fallback | Redis fallback metric and response flags | silent stale data | users see old data while health and metrics still look normal |


<a id="section-9-16"></a>

### 9.16 Circuit breaker：closed、open、half-open 与 recovery window

**结论**

`CircuitBreaker` 在 closed 状态允许调用，失败达到 threshold 后 open，recovery window 到期后 half-open 探测；half-open 成功关闭，失败重新打开。

**本节解决的问题**

依赖已经连续失败时，继续让每个请求都打过去只会增加排队和 timeout。retry 解决单次暂时失败，breaker 解决连续失败期间的 fail fast。

**技术意义**

Circuit breaker 是依赖保护状态机，不是 retry 替代品。它减少新调用，给依赖恢复窗口。

**概念解释**

`state` 是当前门控；`failures` 计数连续失败；`openedAt` 记录 open 时间；`recoveryTimeoutMs` 决定何时进入 half-open。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

in-memory dependency gate boundary

- syntax: the breaker state machine uses closed, open, and half-open as explicit states.
- JavaScript runtime: state is stored in memory and checked before the dependency callback is invoked.
- Node runtime: recovery timers or timestamps decide when a half-open probe may run.
- testing boundary: tests must prove open state fails fast before touching the dependency.
- mistake boundary: recording open state after the dependency call does not protect the dependency from load.

**底层机制**

closed 调用失败两次后 `recordFailure()` 打开 breaker。后续 `execute()` 先 `getState()`，若仍 open 直接抛 `CircuitBreakerOpenError`，不会调用 dependency。

**API / 配置 / 命令规则**

breaker 不修复依赖；不要把 open 状态当成功；half-open probe 要受限；成功后重置 failures，失败后重新 open。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/circuit-breaker.ts</span>
</div>

```ts
import { circuitBreakerOpenTotal, circuitBreakerState } from "../observability/reliability-metrics.js";

export type CircuitBreakerState = "closed" | "open" | "half-open";

export class CircuitBreakerOpenError extends Error {
  readonly status = 503;

  constructor() {
    super("Circuit breaker is open");
    this.name = "CircuitBreakerOpenError";
  }
}

export interface CircuitBreakerOptions {
  dependency: string;
  failureThreshold: number;
  recoveryTimeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = "closed";
  private failures = 0;
  private openedAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.publishState();
  }

  getState(): CircuitBreakerState {
    if (this.state === "open" && Date.now() - this.openedAt >= this.options.recoveryTimeoutMs) {
      this.state = "half-open";
      this.publishState();
    }
    return this.state;
  }

  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.openedAt = 0;
    this.publishState();
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const currentState = this.getState();
    if (currentState === "open") {
      throw new CircuitBreakerOpenError();
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    this.failures = 0;
    this.state = "closed";
    this.publishState();
  }

  private recordFailure(): void {
    this.failures += 1;
    if (this.state === "half-open" || this.failures >= this.options.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
      circuitBreakerOpenTotal.inc({ dependency: this.options.dependency });
    }
    this.publishState();
  }

  private publishState(): void {
    for (const state of ["closed", "open", "half-open"] as const) {
      circuitBreakerState.set({ dependency: this.options.dependency, state }, this.state === state ? 1 : 0);
    }
  }
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/08-resilience-patterns/circuit-breaker-state-machine.ts</span>
</div>

```ts
export type CircuitState = "closed" | "open" | "half-open";

export function nextCircuitState(state: CircuitState, success: boolean): CircuitState {
  if (state === "closed") return success ? "closed" : "open";
  if (state === "half-open") return success ? "closed" : "open";
  return success ? "half-open" : "open";
}
```
</div>

**逐行解释**

`getState()` 在 recovery timeout 后切 half-open；`execute()` 是唯一受保护入口；`recordSuccess()` close；`recordFailure()` 根据 threshold/openedAt 更新状态。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx --test --test-concurrency=1 tests/circuit-breaker.unit.test.ts
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
pass 1
fail 0
```
</div>


**执行过程**

unit test 连续注入两次失败，断言 state 为 open，再断言新调用抛 `CircuitBreakerOpenError`。

**为什么会得到这个结果**

第三次调用没有触达 operation，是因为 breaker 在执行前检查 open state。这就是 fail fast 与 retry 的区别。

**对比情况**

正确路径：circuit breaker open 时新 dependency call 在触碰依赖前 fail fast。错误路径：breaker 状态显示 open，但应用仍继续调用下游依赖。

**常见错误为什么错**

把 circuit breaker 当作 retry executor 违反状态机边界；breaker 应停止新调用，不应在 open 时继续打依赖。

**与真实项目的关系**

真实项目识别规则：如果下游已经不可用但调用量没有下降，说明 circuit breaker 没有在 dependency call 之前拦截。

**与当前学习路径的关系**

本节建立在 9.6 retry 之后：先理解单请求 retry，再理解连续失败的 dependency gate。

**最终记忆模型**

Circuit breaker stops new calls after repeated failure; it does not repair the dependency.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/circuit-breaker` | repeated dependency failure | `open state` | in-memory dependency gate boundary | overload | fail fast until recovery window | `tests/circuit-breaker.unit.test.ts` passes | using breaker as retry replacement | dependency calls continue even while circuit state reports open |


<a id="section-9-17"></a>

### 9.17 Bulkhead / concurrency limit：保护慢依赖而不是扩大排队

**结论**

`PracticeBulkhead` 持有 `active` count 和 bounded `queue`；达到 `maxConcurrency` 后只允许有限排队，队列满则拒绝。

**本节解决的问题**

慢依赖会让请求堆积。如果队列无界，应用不是更可靠，而是把 latency 和 memory 一起推高。

**技术意义**

Bulkhead 隔离某个慢依赖的并发损害。Rate limit 控制入口请求速率；bulkhead 控制内部依赖并发和等待队列。

**概念解释**

`active` 表示正在占用依赖槽位的 operation；`queue` 是等待进入的 bounded list；`snapshot()` 提供调试观察。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

Promise queue boundary

- syntax: queue and activeTask make concurrency ownership explicit instead of relying on hidden promise accumulation.
- JavaScript runtime: queued callbacks are scheduled after active promises settle; they are not separate CPU threads.
- Node runtime: the event loop remains single-threaded for JavaScript even while I/O work is concurrent.
- HTTP behavior: when queue capacity is exhausted, the route should reject with overload rather than hang.
- testing boundary: tests must assert both accepted queued work and rejected overflow work.

**底层机制**

第一个 operation 增加 active。第二个在 active 已满时，如果 queue 未满就等待；若 queue 已满，立即抛 rejection，避免无限排队。

**API / 配置 / 命令规则**

queue 必须有上限；finally 必须减少 active 并唤醒 next；不要用入口 rate limit 替代 dependency bulkhead。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/08-resilience-patterns/bulkhead-concurrency-limit.ts</span>
</div>

```ts
export class PracticeBulkhead {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly maxConcurrency: number,
    private readonly maxQueue: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrency) {
      if (this.queue.length >= this.maxQueue) {
        throw new Error("Bulkhead rejected operation");
      }
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.active += 1;
    try {
      return await operation();
    } finally {
      this.active -= 1;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  snapshot(): { active: number; queued: number; maxConcurrency: number; maxQueue: number } {
    return {
      active: this.active,
      queued: this.queue.length,
      maxConcurrency: this.maxConcurrency,
      maxQueue: this.maxQueue
    };
  }
}
```
</div>


**逐行解释**

`execute()` 是进入 bulkhead 的唯一入口；`this.active += 1` 占槽；`finally` 释放槽；`this.queue.shift()` 唤醒一个等待者。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx --test --test-concurrency=1 tests/bulkhead.unit.test.ts
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
pass 1
fail 0
```
</div>


**执行过程**

unit test 先启动一个延迟 operation，占满并发槽；第二个 operation 因 queue limit 为 0 被拒绝；第一个最终完成。

**为什么会得到这个结果**

拒绝路径是正确结果，因为系统选择保护慢依赖和其他请求，而不是制造无限等待。

**对比情况**

正确路径：bulkhead 限制 activeTask 并只允许有限 queue，满载时拒绝新任务。错误路径：无限 pending promise 堆积，最终把 event loop、内存或连接池拖垮。

**常见错误为什么错**

用数组无限 push 等待任务违反 bounded queue rule；故障时内存增长和尾延迟会一起失控。

**与真实项目的关系**

真实项目识别规则：如果 pending promise、event-loop delay 或 connection checkout time 随流量持续增长，应检查是否缺少 bulkhead 或 queue 上限。

**与当前学习路径的关系**

本节把 Chapter 12 的 capacity 思维用于故障隔离：不是扩大排队，而是限制损害范围。

**最终记忆模型**

Bulkhead protects capacity by bounding active work and waiting work.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /reliability/bulkhead` | slow dependency saturation | `bulkhead rejection` | Promise queue boundary | overload | bounded queue or reject | `tests/bulkhead.unit.test.ts` passes | unbounded queue | memory and latency rise while dependency throughput stays flat |


<a id="section-9-18"></a>

### 9.18 Graceful degradation：required dependency 与 optional dependency

**结论**

`chooseDegradation()` 把 required dependency failure 映射为 `not_ready`，把 optional dependency failure 映射为 `degraded`，健康路径映射为 `ready`。

**本节解决的问题**

有些依赖失败时 API 不能服务，有些只是功能降级。把两者都返回 200 或都标 not ready 都会误导调用方。

**技术意义**

Graceful degradation 是诚实响应：可选失败可以继续服务，但必须说明降级内容；必需失败不能假装 ready。

**概念解释**

`required` 表示没有该依赖就不能安全处理请求；`healthy` 表示当前检查结果；返回值决定 readiness 或 response marker。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

dependency role policy boundary

- syntax: required and optional dependency roles must be represented before fallback is selected.
- HTTP behavior: required dependency failure should produce an explicit error status, while optional failure can produce degraded data.
- security boundary: authentication, authorization, payment, and writes are not optional display features.
- metrics boundary: degraded responses should emit a classification so successful-but-degraded traffic is visible.
- mistake boundary: graceful degradation becomes data corruption when it hides required consistency failures.

**底层机制**

如果 required 为 true 且 healthy 为 false，函数返回 `not_ready`。如果 required 为 false 且 unhealthy，返回 `degraded`。healthy 总是 ready。

**API / 配置 / 命令规则**

required failure affects readiness；optional failure may degrade；degraded response must name what is degraded；silent fallback is not graceful.

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/08-resilience-patterns/graceful-degradation-decision.ts</span>
</div>

```ts
export function chooseDegradation(required: boolean, healthy: boolean): "ready" | "degraded" | "not_ready" {
  if (healthy) return "ready";
  return required ? "not_ready" : "degraded";
}
```
</div>


**逐行解释**

函数先判断健康；不健康时根据 `required` 二分，避免把 optional Redis cache 和 required database 混为一类。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx -e "import('../../practices/13-reliability-fault-tolerance/08-resilience-patterns/graceful-degradation-decision.ts').then(() => console.log('module import ok'))"
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
module import ok
```
</div>


**执行过程**

practice module import 无 stdout；调用方可通过三组输入断言 ready/degraded/not_ready。

**为什么会得到这个结果**

不同结果来自 dependency role，而不是错误严重程度。Redis cache 可以 optional，PostgreSQL writes 通常 required。

**对比情况**

正确路径：required dependency 失败时拒绝请求，optional dependency 失败时降级并暴露 degraded signal。错误路径：对身份、写入或一致性边界做“优雅降级”，产生错误授权或数据丢失。

**常见错误为什么错**

在 optional Redis 挂掉时静默返回 origin 数据，违反 response honesty；在 required DB 挂掉时返回 ready，违反 traffic safety。

**与真实项目的关系**

真实项目识别规则：如果 optional recommendation 服务失败导致整个核心写请求失败，dependency role policy 过于保守；如果 auth 失败仍放行，则过于宽松。

**与当前学习路径的关系**

本节连接 9.15 cache fallback 和 9.19 health semantics。

**最终记忆模型**

Degradation starts with dependency role: required failure blocks readiness, optional failure must be labeled.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /health/ready` | optional dependency failure | `degraded response` | dependency role policy boundary | dependency | mark degraded explicitly | dependency status field | returning 200 without a marker | operators cannot tell which dependency failed |


<a id="section-9-19"></a>

### 9.19 Health semantics：live、ready、degraded 与 dependency health

**结论**

`getLiveness()` 只回答进程是否能响应；`getReadiness()` 调 `checkDatabaseHealth()` 和 `checkRedisHealth()`，再用 `requiredFailures` 与 `optionalFailures` 决定 ready/degraded/not_ready。

**本节解决的问题**

把 liveness 绑定数据库会让健康进程因为依赖短暂失败被反复重启；把 readiness 不检查 required dependency 又会把流量送到不能服务的实例。

**技术意义**

Health endpoints 是 runtime traffic contract。liveness belongs to process; readiness belongs to serviceability; degraded belongs to optional dependency honesty.

**概念解释**

`dependencies` 是依赖健康数组；`requiredFailures` 过滤 required unhealthy；`optionalFailures` 过滤 optional unhealthy。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

health endpoint boundary

- syntax: /health/live and /health/ready are separate route paths with different dependency contracts.
- Express behavior: liveness should only prove the process can answer, while readiness may call dependency check services.
- Docker/runtime behavior: container health checks and load balancers use these endpoints to restart or route traffic.
- Redis/Prisma boundary: readiness can report dependency status without making liveness depend on those services.
- mistake boundary: a liveness check that queries PostgreSQL can restart healthy processes during a database incident.

**底层机制**

`getLiveness()` 不访问数据库或 Redis，因此依赖故障不会杀进程。`getReadiness()` 并发检查依赖，required failure 返回 503/not_ready，optional failure 返回 200/degraded。

**API / 配置 / 命令规则**

liveness should not depend on database readiness；readiness must include required dependency health；degraded must include dependency details without secret values。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/health/health.service.ts</span>
</div>

```ts
import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";
import type { HealthStatus } from "./health.types.js";

export function getLiveness(): HealthStatus {
  return { status: "live", dependencies: [] };
}

export async function getReadiness(): Promise<HealthStatus> {
  const dependencies = await Promise.all([checkDatabaseHealth(), checkRedisHealth()]);
  const requiredFailures = dependencies.filter((dependency) => dependency.required && !dependency.healthy);
  const optionalFailures = dependencies.filter((dependency) => !dependency.required && !dependency.healthy);

  if (requiredFailures.length > 0) {
    return { status: "not_ready", dependencies };
  }

  if (optionalFailures.length > 0) {
    return { status: "degraded", dependencies };
  }

  return { status: "ready", dependencies };
}
```
</div>


**逐行解释**

`Promise.all` 并行检查 DB/Redis；`requiredFailures.length > 0` 先返回 not_ready；`optionalFailures.length > 0` 返回 degraded；否则 ready。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
node --import tsx --test --test-concurrency=1 tests/health.integration.test.ts
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
pass 2
fail 0
```
</div>


**执行过程**

integration test 用 Supertest 调 `/health/live` 和 `/health/ready`。live 期望 200；ready 可根据依赖返回 200 或 503，但 body 必须包含 dependencies。

**为什么会得到这个结果**

liveness 不依赖 DB，所以进程能在数据库短暂失败时保持可观测；readiness 依赖 DB/Redis，所以 traffic safety 不被牺牲。

**对比情况**

正确路径：/health/live 证明进程可响应，/health/ready 才检查 PostgreSQL 和 Redis。错误路径：liveness 依赖数据库，数据库短暂抖动会让 orchestrator 重启健康进程。

**常见错误为什么错**

让 `/health/live` 查询数据库违反 process health boundary；依赖抖动会导致容器重启而不是等待依赖恢复。

**与真实项目的关系**

真实项目识别规则：如果部署平台频繁重启容器但应用线程本身可响应，应检查 liveness 是否错误地依赖外部服务。

**与当前学习路径的关系**

本节把 Chapter 10 observability health checks 接到 Chapter 11 Compose health 和本章 dependency policy。

**最终记忆模型**

Liveness asks whether this process is alive; readiness asks whether this instance can serve traffic now.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /health/ready` | required dependency down | `not_ready` | health endpoint boundary | dependency | readiness fails while liveness stays live | `tests/health.integration.test.ts` passes | making liveness depend on DB | containers restart when only the database is unavailable |


<a id="section-9-20"></a>

### 9.20 Fault injection：模拟 timeout、Redis outage、DB conflict 与 slow dependency

**结论**

`FaultScenario` 限定可模拟场景；`assertFaultInjectionAllowed()` 用 production guard 控制入口；`resetFaultScenario()` 确保测试后恢复无故障状态。

**本节解决的问题**

没有受控 fault injection，团队只能等真实事故；但不受控的 fault injection 可能 crash process、泄露 secret 或破坏数据库。

**技术意义**

故障注入是边界测试工具，不是 chaos platform。Chapter 13 只实现 demo-scoped、flag-guarded、bounded scenarios。

**概念解释**

`activeScenario` 是本地状态；`setFaultScenario()` 写入状态；`shouldSimulate()` 给业务路径查询当前场景；`none` 用于 reset。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

test-only runtime flag boundary

- syntax: fault scenarios are accepted only through a closed enum or guard function.
- Express behavior: the endpoint activates faults through a controlled route and should offer reset semantics.
- Docker/runtime behavior: FAULT_INJECTION_ENABLED or an equivalent environment flag keeps the feature out of normal production behavior.
- security boundary: arbitrary strings must not choose file, network, process, or database-destructive behavior.
- testing boundary: tests assert slow, timeout, Redis outage, or db conflict simulation without corrupting real data.

**底层机制**

脚本依次 POST `none/slow_dependency/timeout/redis_outage/db_conflict/circuit_open/none`。每个请求只改变 demo state 或触发安全分类，不退出进程。

**API / 配置 / 命令规则**

scenario 必须白名单；production 默认 disabled；reset 必须可用；不能输出 env、heap、token、cookie；不能故意 corrupt data。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/fault-injection.ts</span>
</div>

```ts
import { config } from "../config/env.js";

export type FaultScenario = "none" | "slow_dependency" | "timeout" | "redis_outage" | "db_conflict" | "circuit_open";

let activeScenario: FaultScenario = "none";

export function assertFaultInjectionAllowed(): void {
  if (config.NODE_ENV === "production" && !config.FAULT_INJECTION_ENABLED) {
    throw new Error("Fault injection is disabled");
  }
}

export function setFaultScenario(scenario: FaultScenario): FaultScenario {
  assertFaultInjectionAllowed();
  activeScenario = scenario;
  return activeScenario;
}

export function resetFaultScenario(): void {
  activeScenario = "none";
}

export function getFaultScenario(): FaultScenario {
  return activeScenario;
}

export function shouldSimulate(scenario: FaultScenario): boolean {
  return activeScenario === scenario;
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/08-resilience-patterns/fault-injection-scenario.ts</span>
</div>

```ts
export type FaultScenario = "slow_dependency" | "timeout" | "redis_outage" | "db_conflict";

export function isSafeFaultScenario(value: string): value is FaultScenario {
  return ["slow_dependency", "timeout", "redis_outage", "db_conflict"].includes(value);
}
```
</div>

**逐行解释**

`activeScenario` 初始为 `none`；`assertFaultInjectionAllowed()` 在 production 且未显式允许时 throw；`setFaultScenario()` 返回当前状态；`resetFaultScenario()` 清空状态。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
npm run fault:check
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
fault injection check ok http://localhost:8080
```
</div>


**执行过程**

`npm run fault:check` 通过 NGINX `localhost:8080` 调 endpoint，验证每个 scenario 返回 2xx，并最终 reset。

**为什么会得到这个结果**

脚本能安全通过，是因为 endpoint 只切换 demo state，不执行 `process.exit()`，也不直接改数据库。

**对比情况**

正确路径：fault injection 只允许枚举场景、受环境开关保护，并且可 reset。错误路径：把任意 fault 参数直连到 runtime 行为，造成真实 crash、数据破坏或生产暴露。

**常见错误为什么错**

用 crash process 测可靠性违反 observability boundary；进程消失后你失去日志、metrics 和 Problem Details。

**与真实项目的关系**

真实项目识别规则：如果 fault endpoint 能在生产环境启用，或接受未枚举字符串，测试工具已经越过安全边界。

**与当前学习路径的关系**

本节把前面 timeout、Redis fallback、DB conflict、circuit breaker 的机制变成可复跑场景。

**最终记忆模型**

Fault injection must be scoped, guarded, bounded, resettable, and non-destructive.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /reliability/fault-injection` | demo fault | `scenario field` | test-only runtime flag boundary | transient | bounded safe simulation | `npm run fault:check` | crashing the process to test reliability | diagnostic evidence disappears with the failed process |


<a id="section-9-21"></a>

### 9.21 Reliability metrics：retry、timeout、abort、idempotency replay、circuit state

**结论**

`reliability-metrics.ts` 暴露 retry、timeout、abort、idempotency replay/conflict、problem response、circuit state、bulkhead reject、dependency health、Redis fallback 和 transaction retry 指标。

**本节解决的问题**

没有低基数 metrics，可靠性策略只能靠日志猜测；如果 label 带 userId、key 或 raw URL，Prometheus series 会爆炸。

**技术意义**

指标是策略证据。每个 retry、timeout、fallback、breaker state 都要能被观察，但 label 必须只描述稳定分类。

**概念解释**

Counter 记录事件次数；Gauge 记录当前状态；labelNames 固定为 operation、failureKind、dependency、status、state、code、statusClass 等低基数字段。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

metrics registry boundary

- syntax: metric labels must be chosen from fixed low-cardinality sets such as dependency, outcome, and failureKind.
- Node runtime: prom-client stores metric series in a registry in process memory.
- HTTP behavior: /metrics serializes the registry for Prometheus scraping.
- security boundary: user IDs, tokens, request IDs, raw URLs, and idempotency keys must not become labels.
- testing boundary: tests should assert label names and series count behavior rather than only checking that /metrics returns text.

**底层机制**

retry executor 调 `recordRetryAttempt`；transaction helper 调 `recordTransactionRetry`；Redis fallback 调 `recordRedisFallback`；circuit breaker 更新 gauge；error middleware 增加 problem response counter。

**API / 配置 / 命令规则**

labels describe class, not identity；route pattern allowed, raw URL forbidden；dependency name allowed, Redis key forbidden；requestId belongs logs, not metric label。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/reliability-metrics.ts</span>
</div>

```ts
import { Counter, Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const retryAttemptTotal = new Counter({
  name: "resilient_notes_retry_attempt_total",
  help: "Retry attempts by operation and failure kind",
  labelNames: ["operation", "failureKind"],
  registers: [metricsRegistry]
});

export const retryExhaustedTotal = new Counter({
  name: "resilient_notes_retry_exhausted_total",
  help: "Retry policies that exhausted all attempts",
  labelNames: ["operation", "failureKind"],
  registers: [metricsRegistry]
});

export const timeoutTotal = new Counter({
  name: "resilient_notes_timeout_total",
  help: "Timeout count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const abortTotal = new Counter({
  name: "resilient_notes_abort_total",
  help: "Abort count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const idempotencyReplayTotal = new Counter({
  name: "resilient_notes_idempotency_replay_total",
  help: "Stored idempotency responses replayed",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const idempotencyConflictTotal = new Counter({
  name: "resilient_notes_idempotency_conflict_total",
  help: "Idempotency key conflicts by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const problemResponseTotal = new Counter({
  name: "resilient_notes_problem_response_total",
  help: "Problem details responses by problem code and status class",
  labelNames: ["code", "statusClass"],
  registers: [metricsRegistry]
});

export const circuitBreakerState = new Gauge({
  name: "resilient_notes_circuit_breaker_state",
  help: "Circuit breaker state gauge by dependency and state",
  labelNames: ["dependency", "state"],
  registers: [metricsRegistry]
});

export const circuitBreakerOpenTotal = new Counter({
  name: "resilient_notes_circuit_breaker_open_total",
  help: "Circuit breaker open events by dependency",
  labelNames: ["dependency"],
  registers: [metricsRegistry]
});

export const bulkheadRejectedTotal = new Counter({
  name: "resilient_notes_bulkhead_rejected_total",
  help: "Bulkhead rejections by dependency",
  labelNames: ["dependency"],
  registers: [metricsRegistry]
});

export const dependencyHealthStatus = new Gauge({
  name: "resilient_notes_dependency_health_status",
  help: "Dependency health as 1 for healthy and 0 for unhealthy",
  labelNames: ["dependency", "status"],
  registers: [metricsRegistry]
});

export const redisFallbackTotal = new Counter({
  name: "resilient_notes_redis_fallback_total",
  help: "Redis fallback count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const transactionRetryTotal = new Counter({
  name: "resilient_notes_transaction_retry_total",
  help: "Transaction retry count by reason",
  labelNames: ["reason"],
  registers: [metricsRegistry]
});

export function recordRetryAttempt(operation: string, failureKind: string): void {
  retryAttemptTotal.inc({ operation, failureKind });
}

export function recordRetryExhausted(operation: string, failureKind: string): void {
  retryExhaustedTotal.inc({ operation, failureKind });
}

export function recordTransactionRetry(reason: string): void {
  transactionRetryTotal.inc({ reason });
}

export function recordRedisFallback(operation: string): void {
  redisFallbackTotal.inc({ operation });
}

export function recordDependencyHealth(dependency: string, status: "healthy" | "unhealthy"): void {
  dependencyHealthStatus.set({ dependency, status }, status === "healthy" ? 1 : 0);
}
```
</div>


**相关练习文件**

这些文件补齐本节相邻机制边界，便于把主示例拆成可单独验证的小单元。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">practices/13-reliability-fault-tolerance/08-resilience-patterns/reliability-metrics-model.ts</span>
</div>

```ts
export interface ReliabilityMetricLabels {
  dependency: "api" | "postgres" | "redis";
  outcome: "success" | "failure" | "fallback";
  failureKind: "timeout" | "conflict" | "unavailable" | "none";
}
```
</div>

**逐行解释**

`retryAttemptTotal` label 是 operation/failureKind；`problemResponseTotal` label 是 code/statusClass；`circuitBreakerState` label 是 dependency/state；`dependencyHealthStatus` label 是 dependency/status。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
npm run smoke
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
smoke ok http://localhost:8080
```
</div>


**执行过程**

`npm run smoke` 通过 NGINX 访问 `/metrics`，确认 endpoint 可用。具体 metric series 随请求路径增加。

**为什么会得到这个结果**

低基数 label 能长期保留趋势；高基数 label 会让每个用户、请求或 key 变成新 time series，拖垮监控系统。

**对比情况**

正确路径：metrics 只使用 dependency、outcome、failureKind 等低基数 label。错误路径：把 userId、requestId、URL query 或 idempotency key 放入 label，导致 series 爆炸。

**常见错误为什么错**

把 idempotency key 或 userId 放入 metrics label 违反 cardinality boundary；这既是性能问题也是隐私风险。

**与真实项目的关系**

真实项目识别规则：如果 Prometheus series count 随 user count 增长，metric label 包含身份数据而不是低基数分类数据。

**与当前学习路径的关系**

本节扩展 Chapter 10 metrics：从 HTTP duration 进入 reliability policy events。

**最终记忆模型**

Reliability metrics count policy outcomes; labels must classify, never identify.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /metrics` | reliability policy event | `Prometheus metric` | metrics registry boundary | dependency | low-cardinality labels | `npm run smoke` checks `/metrics` | labeling with userId, raw URL, or idempotency key | time series count grows with traffic identity values |


<a id="section-9-22"></a>

### 9.22 Chapter integration: resilient-notes-api

**结论**

`createApp()` 的 middleware order 把 request id、context、security、rate limit、body limit、logging、HTTP metrics、health、metrics、reliability routes、auth/app routes、not found、error logger、error middleware 串成一个可验证入口。

**本节解决的问题**

可靠性机制分散在 timeout/retry/idempotency/Redis/DB/metrics 文件中；如果 Express 装配顺序错，错误可能绕过 request id、metrics 或 Problem Details。

**技术意义**

集成层证明前面 21 节不是孤立片段。所有请求必须经过同一个 runtime pipeline，并且外部验证必须通过 NGINX `localhost:8080`。

**概念解释**

早期 middleware 设置上下文和安全边界；业务 route 执行策略；末尾 not-found 和 error middleware 保证每个失败都有稳定出口。

**边界：syntax, TypeScript type-system behavior, Node runtime behavior, HTTP behavior, Express behavior, Prisma/database behavior, Redis behavior, Docker/runtime behavior, testing boundary, security boundary**

Express and NGINX integration boundary

- syntax: app.use order determines parser, request context, routes, metrics, and error middleware flow.
- Express behavior: a route must either send a response, delegate to next(), or throw into the error middleware.
- Docker/runtime behavior: Compose starts PostgreSQL, Redis, API, and NGINX with health dependencies.
- NGINX/HTTP boundary: external validation must reach localhost:8080 so proxy behavior is included.
- mistake boundary: testing only the internal API port skips proxy headers, CORS, and the production simulation entrypoint.

**底层机制**

请求先获得 `requestId` 和 AsyncLocalStorage context，再经过 helmet/cors/rate-limit/json parser。之后 request logger 和 http metrics 订阅 response finish。routes 执行后，未匹配请求进入 notFound，错误进入 logger 和 Problem Details middleware。

**API / 配置 / 命令规则**

request id must be before logging；body limit before routes；metrics before routes to observe finish；error middleware last；validation scripts must target `http://localhost:8080` to include NGINX。

**示例代码**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/app.ts</span>
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
import { reliabilityRoutes } from "./modules/reliability/reliability.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { httpMetrics } from "./observability/http-metrics.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { requestContext } from "./observability/request-context.js";
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
  app.use(requestContext);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(apiRateLimit);
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);
  app.use(httpMetrics);

  app.use("/health", healthRoutes);
  app.use("/metrics", metricsRoutes);
  app.use("/reliability", reliabilityRoutes);
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


**逐行解释**

`app.disable('x-powered-by')` 减少指纹；`app.use(requestId)` 建立 correlation；`app.use(httpMetrics)` 订阅完成事件；`/reliability` 暴露 demo；`notFound/errorLogger/errorMiddleware` 收束失败。

**运行方式**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
npm run smoke
npm run reliability:check
npm run idempotency:check
```
</div>


**预期输出**

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Output</span>
</div>

```txt
smoke ok http://localhost:8080
reliability check ok http://localhost:8080
idempotency check ok http://localhost:8080
```
</div>


**执行过程**

runtime scripts 通过 NGINX host port 8080 访问 API。这样验证覆盖容器网络、NGINX proxy、Express app 和依赖健康，而不是只测裸 API port。

**为什么会得到这个结果**

脚本输出成功，是因为 Compose 中 NGINX 代理到 API internal 3020，而外部只依赖 8080。若直接测 3020，会绕过生产式入口。

**对比情况**

正确路径：Express middleware order、error boundary、Docker Compose 和 NGINX 8080 入口形成同一条验证链。错误路径：只验证容器内 3020，绕过生产模拟的 NGINX 入口。

**常见错误为什么错**

把 runtime validation 指向 `localhost:3020` 违反 deployment boundary；NGINX 配置、proxy headers 和入口 timeout 都没有被验证。

**与真实项目的关系**

真实项目识别规则：如果 npm run smoke 通过但浏览器或 gateway 失败，应确认 smoke 是否真的经过 NGINX、proxy headers、CORS 和 production-like port。

**与当前学习路径的关系**

本节整合 Chapter 03 Express、Chapter 05 Prisma、Chapter 07 Redis、Chapter 10 observability、Chapter 11 Compose/NGINX 和本章 reliability modules。

**最终记忆模型**

The app pipeline is the reliability boundary: observe first, route next, map errors last, validate through NGINX.

**Reliability evidence chain**

| request path | failure source | observed signal | runtime boundary crossed | failure classification | safe policy | verification signal | mistake case | how to recognize the same failure in a real backend project |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET /health/live` | runtime integration drift | `script output through localhost:8080` | Express and NGINX integration boundary | dependency | validate production-like path | `npm run smoke` and reliability scripts | validating only internal API port | NGINX failures are missed while direct API tests pass |


## 10. API 与规则索引

| 规则 | 负责边界 | 应用位置 |
| --- | --- | --- |
| `AbortSignal.timeout(ms)` | Node runtime cancellation signal | timeout wrapper and timer-backed demos |
| `server.requestTimeout` | `node:http` request lifecycle | `src/server.ts` |
| `server.headersTimeout` | HTTP header receive window | `src/server.ts` |
| `server.keepAliveTimeout` | idle keep-alive socket window | `src/server.ts` |
| RFC 9110 safe/idempotent methods | HTTP semantics | retry safety and idempotency |
| RFC 9457 Problem Details | HTTP error contract | error middleware |
| Prisma `P2034` | transaction conflict | `src/db/transaction-retry.ts` |
| node-redis `error` event | Redis client lifecycle | `src/redis/redis-client.ts` |
| Compose `service_healthy` | runtime orchestration | `compose.yaml` |

## 11. 常见错误对照表

| 错误 | 违反的规则 | 可观察后果 |
| --- | --- | --- |
| 对所有异常都 retry | retry must be classified and bounded | overload amplification |
| `Promise.race` timeout 后不取消 | timeout result is not cancellation by itself | orphan work continues |
| POST 没有 idempotency key 却 retry | unsafe side effects need replay proof | duplicate writes |
| Redis fallback 不标记 degraded | fallback must be observable | stale or origin data is hidden |
| liveness 检查依赖数据库 | liveness is process health, not dependency readiness | healthy process gets restarted |
| metrics 使用 user id 或 idempotency key label | labels must be low cardinality | time series explosion |

## 12. 调试与验证方法

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
docker compose config
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm run smoke
npm run reliability:check
npm run fault:check
npm run idempotency:check
```
</div>


调试顺序是先看 `/health/live` 是否说明进程可响应，再看 `/health/ready` 是否说明 required dependency 可用，然后看 `/metrics` 中 retry、timeout、idempotency、circuit、bulkhead、Redis fallback 和 problem response 指标是否与请求现象一致。

## 13. 分项练习说明

每个 practice 文件都对应一个最小机制：分类、timeout、abort、retry budget、HTTP method safety、idempotency replay、Problem Details、P2034 whole transaction retry、Redis error listener、cache fallback、circuit state、bulkhead 和 fault scenario。练习的目标不是背 API，而是确认 trigger、boundary、signal、classification、policy、verification 是否闭合。

## 14. 最终迷你项目

<a id="section-14-1"></a>

### 14.1 项目目标

`resilient-notes-api` 把本章所有机制接到一个生产式本地 API：Express 路由负责请求生命周期，Prisma 负责持久化和事务冲突，Redis 负责 cache/session 类依赖，error middleware 负责 Problem Details，metrics 暴露低基数可靠性信号，Compose 和 NGINX 验证外部入口。

<a id="section-14-2"></a>

### 14.2 运行与验证路径

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">Terminal</span>
</div>

```txt
D:
Set-Location -LiteralPath (Join-Path (Get-Location).Drive.Root "node.js\mini-projects\resilient-notes-api")
npm install
npm run prisma:generate
npm run typecheck
npm run build
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm test -- --test-concurrency=1
npm run smoke
npm run reliability:check
npm run fault:check
npm run idempotency:check
docker compose down
```
</div>


<a id="section-14-3"></a>

### 14.3 完整项目代码

这一节展示 mini project 的完整配置和源码。阅读时重点看资源所有权：`server.ts` 拥有 HTTP server timeout 和 shutdown；`app.ts` 拥有 middleware order；`reliability/*` 拥有 timeout、retry、idempotency、breaker、bulkhead 和 fault injection；`db/*` 与 `redis/*` 拥有外部依赖分类；`observability/*` 只记录低基数信号。

<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/package.json</span>
</div>

```json
{
  "name": "resilient-notes-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/server.js",
    "typecheck": "tsc --noEmit",
    "test": "node --import tsx --test tests/env.unit.test.ts tests/problem-details.unit.test.ts tests/retry-policy.unit.test.ts tests/timeout-abort.unit.test.ts tests/idempotency.unit.test.ts tests/circuit-breaker.unit.test.ts tests/bulkhead.unit.test.ts tests/health.integration.test.ts tests/idempotency.integration.test.ts tests/reliability.integration.test.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "seed": "prisma db seed",
    "smoke": "tsx scripts/smoke-test.ts",
    "reliability:check": "tsx scripts/reliability-check.ts",
    "fault:check": "tsx scripts/fault-injection-check.ts",
    "idempotency:check": "tsx scripts/idempotency-check.ts"
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
<span class="macos-code-title">mini-projects/resilient-notes-api/tsconfig.json</span>
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
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/.env.example</span>
</div>

```txt
NODE_ENV=development
PORT=3020
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resilient_notes_api
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=resilient_notes_session
SESSION_SECRET=local-development-session-secret-32chars
SESSION_TTL_SECONDS=604800
CSRF_COOKIE_NAME=resilient_notes_csrf
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
TRUST_PROXY=0
COOKIE_SECURE=false
LOG_LEVEL=info
SHUTDOWN_TIMEOUT_MS=10000
HTTP_REQUEST_TIMEOUT_MS=30000
HTTP_HEADERS_TIMEOUT_MS=10000
HTTP_KEEP_ALIVE_TIMEOUT_MS=5000
DEPENDENCY_TIMEOUT_MS=500
REDIS_COMMAND_TIMEOUT_MS=250
REDIS_CONNECT_TIMEOUT_MS=1000
RETRY_BUDGET=2
FAULT_INJECTION_ENABLED=false
BULKHEAD_CONCURRENCY=2
BULKHEAD_QUEUE=2
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/.dockerignore</span>
</div>

```txt
node_modules
dist
npm-debug.log
.env
.DS_Store
coverage
.git
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/Dockerfile</span>
</div>

```txt
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
EXPOSE 3020
CMD ["node", "dist/src/server.js"]
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/compose.yaml</span>
</div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: resilient_notes_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - resilient-postgres-data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d resilient_notes_api"]
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
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/resilient_notes_api
      REDIS_URL: redis://redis:6379
      SESSION_COOKIE_NAME: resilient_notes_session
      SESSION_SECRET: local-compose-session-secret-32chars
      SESSION_TTL_SECONDS: 604800
      CSRF_COOKIE_NAME: resilient_notes_csrf
      ALLOWED_ORIGINS: http://localhost:8080,http://127.0.0.1:8080
      TRUST_PROXY: "1"
      COOKIE_SECURE: "false"
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
      HTTP_REQUEST_TIMEOUT_MS: 30000
      HTTP_HEADERS_TIMEOUT_MS: 10000
      HTTP_KEEP_ALIVE_TIMEOUT_MS: 5000
      DEPENDENCY_TIMEOUT_MS: 500
      REDIS_COMMAND_TIMEOUT_MS: 250
      REDIS_CONNECT_TIMEOUT_MS: 1000
      RETRY_BUDGET: 2
      FAULT_INJECTION_ENABLED: "true"
      BULKHEAD_CONCURRENCY: 2
      BULKHEAD_QUEUE: 2
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
  resilient-postgres-data:
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/nginx/nginx.conf</span>
</div>

```txt
server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://api:3020;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 5s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
  }
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/prisma.config.ts</span>
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
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/resilient_notes_api"
  }
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/prisma/schema.prisma</span>
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

model IdempotencyRecord {
  key                String   @id @db.VarChar(128)
  requestFingerprint String   @db.VarChar(128)
  statusCode         Int
  responseBody       Json
  expiresAt          DateTime
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  userId             String?  @db.Uuid

  @@index([expiresAt])
  @@index([userId])
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/prisma/migrations/0001_init/migration.sql</span>
</div>

```txt
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE "IdempotencyRecord" (
  "key" VARCHAR(128) NOT NULL,
  "requestFingerprint" VARCHAR(128) NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "responseBody" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" UUID,
  CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("key")
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
CREATE INDEX "IdempotencyRecord_expiresAt_idx" ON "IdempotencyRecord"("expiresAt");
CREATE INDEX "IdempotencyRecord_userId_idx" ON "IdempotencyRecord"("userId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notebook" ADD CONSTRAINT "Notebook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "Notebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/config/env.ts</span>
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
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/resilient_notes_api"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("resilient_notes_session"),
  SESSION_SECRET: z.string().min(16).default("local-development-session-secret-32chars"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(604_800),
  CSRF_COOKIE_NAME: z.string().min(1).default("resilient_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8080,http://127.0.0.1:8080"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(1).default(0),
  COOKIE_SECURE: booleanFromEnv(false),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  HTTP_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  HTTP_HEADERS_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  HTTP_KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
  DEPENDENCY_TIMEOUT_MS: z.coerce.number().int().positive().default(500),
  REDIS_COMMAND_TIMEOUT_MS: z.coerce.number().int().positive().default(250),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(1_000),
  RETRY_BUDGET: z.coerce.number().int().min(0).default(2),
  FAULT_INJECTION_ENABLED: booleanFromEnv(false),
  BULKHEAD_CONCURRENCY: z.coerce.number().int().positive().default(2),
  BULKHEAD_QUEUE: z.coerce.number().int().min(0).default(2)
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
<span class="macos-code-title">mini-projects/resilient-notes-api/src/config/production.ts</span>
</div>

```ts
import type { AppConfig } from "./env.js";

export interface ProductionRuntimePolicy {
  trustProxy: number | boolean;
  cookieSecure: boolean;
}

export function createProductionRuntimePolicy(appConfig: AppConfig): ProductionRuntimePolicy {
  if (appConfig.NODE_ENV === "production" && appConfig.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters in production");
  }

  return {
    trustProxy: appConfig.TRUST_PROXY === 1 ? 1 : false,
    cookieSecure: appConfig.COOKIE_SECURE
  };
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/db/prisma.ts</span>
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
<span class="macos-code-title">mini-projects/resilient-notes-api/src/db/db-error-classifier.ts</span>
</div>

```ts
export type DatabaseFailureKind =
  | "database_unavailable"
  | "pool_timeout"
  | "transaction_conflict"
  | "unique_conflict"
  | "not_found"
  | "unknown_database_error";

export interface DatabaseFailureClassification {
  kind: DatabaseFailureKind;
  retryable: boolean;
  code?: string;
}

export function getDatabaseErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export function classifyDatabaseError(error: unknown): DatabaseFailureClassification {
  const code = getDatabaseErrorCode(error);
  if (code === "P1001" || code === "P1002") return { kind: "database_unavailable", retryable: true, code };
  if (code === "P2024") return { kind: "pool_timeout", retryable: true, code };
  if (code === "P2034") return { kind: "transaction_conflict", retryable: true, code };
  if (code === "P2002") return { kind: "unique_conflict", retryable: false, code };
  if (code === "P2025") return { kind: "not_found", retryable: false, code };
  return { kind: "unknown_database_error", retryable: false, code };
}

export function isRetryableTransactionConflict(error: unknown): boolean {
  return classifyDatabaseError(error).kind === "transaction_conflict";
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/db/transaction-retry.ts</span>
</div>

```ts
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";
import { config } from "../config/env.js";
import { recordTransactionRetry } from "../observability/reliability-metrics.js";
import { abortableDelay } from "../reliability/abortable.js";
import { isRetryableTransactionConflict } from "./db-error-classifier.js";

export interface TransactionRetryOptions {
  maxAttempts?: number;
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
  signal?: AbortSignal;
}

export async function withTransactionRetry<T>(
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  options: TransactionRetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? Math.max(1, config.RETRY_BUDGET + 1);
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new Error("Transaction retry aborted");
    }

    try {
      return await prisma.$transaction(operation, {
        isolationLevel: options.isolationLevel ?? Prisma.TransactionIsolationLevel.Serializable,
        maxWait: options.maxWait ?? 2_000,
        timeout: options.timeout ?? 5_000
      });
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionConflict(error) || attempt === maxAttempts) break;
      recordTransactionRetry("p2034");
      await abortableDelay(25 * attempt, options.signal);
    }
  }

  throw lastError;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/db/db-health.ts</span>
</div>

```ts
import { prisma } from "./prisma.js";
import { classifyDatabaseError } from "./db-error-classifier.js";

export interface DependencyHealth {
  name: "postgres" | "redis";
  healthy: boolean;
  required: boolean;
  detail: string;
}

export async function checkDatabaseHealth(): Promise<DependencyHealth> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { name: "postgres", healthy: true, required: true, detail: "ok" };
  } catch (error) {
    const classification = classifyDatabaseError(error);
    return { name: "postgres", healthy: false, required: true, detail: classification.kind };
  }
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/redis/redis-error-classifier.ts</span>
</div>

```ts
export type RedisFailureKind = "connect_timeout" | "command_timeout" | "connection_error" | "unknown_redis_error";

export function classifyRedisError(error: unknown): RedisFailureKind {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("connect") && message.includes("timeout")) return "connect_timeout";
  if (message.includes("timed out")) return "command_timeout";
  if (message.includes("econnrefused") || message.includes("socket")) return "connection_error";
  return "unknown_redis_error";
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/redis/redis-client.ts</span>
</div>

```ts
import { createClient } from "redis";
import { config } from "../config/env.js";
import { logger } from "../observability/logger.js";

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: config.REDIS_URL,
    socket: {
      connectTimeout: config.REDIS_CONNECT_TIMEOUT_MS,
      reconnectStrategy(retries) {
        if (retries > 10) return new Error("Redis reconnect budget exceeded");
        return Math.min(retries * 100, 2_000);
      }
    }
  });

  redisClient.on("error", (error) => {
    logger.warn({ dependency: "redis", error: error.message }, "Redis client error");
  });

  return redisClient;
}

export async function connectRedis(): Promise<RedisClient> {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
  redisClient = null;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/redis/redis-health.ts</span>
</div>

```ts
import type { DependencyHealth } from "../db/db-health.js";
import { recordDependencyHealth } from "../observability/reliability-metrics.js";
import { raceWithTimeout } from "../reliability/timeout.js";
import { classifyRedisError } from "./redis-error-classifier.js";
import { connectRedis } from "./redis-client.js";
import { config } from "../config/env.js";

export async function checkRedisHealth(): Promise<DependencyHealth> {
  try {
    const client = await connectRedis();
    await raceWithTimeout(client.ping(), config.REDIS_COMMAND_TIMEOUT_MS, "Redis health check timed out");
    recordDependencyHealth("redis", "healthy");
    return { name: "redis", healthy: true, required: true, detail: "ok" };
  } catch (error) {
    const kind = classifyRedisError(error);
    recordDependencyHealth("redis", "unhealthy");
    return { name: "redis", healthy: false, required: true, detail: kind };
  }
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/redis/redis-cache.ts</span>
</div>

```ts
import { config } from "../config/env.js";
import { recordRedisFallback } from "../observability/reliability-metrics.js";
import { raceWithTimeout } from "../reliability/timeout.js";
import { connectRedis } from "./redis-client.js";

export interface CacheResult<T> {
  value: T;
  source: "cache" | "origin";
  degraded: boolean;
  detail?: string;
}

export async function getJsonWithFallback<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<CacheResult<T>> {
  try {
    const client = await connectRedis();
    const cached = await raceWithTimeout(client.get(key), config.REDIS_COMMAND_TIMEOUT_MS, "Redis get timed out");
    if (cached) {
      return { value: JSON.parse(cached) as T, source: "cache", degraded: false };
    }

    const value = await loader();
    await raceWithTimeout(
      client.setEx(key, ttlSeconds, JSON.stringify(value)),
      config.REDIS_COMMAND_TIMEOUT_MS,
      "Redis set timed out"
    );
    return { value, source: "origin", degraded: false };
  } catch (error) {
    recordRedisFallback("optional_cache");
    const value = await loader();
    return {
      value,
      source: "origin",
      degraded: true,
      detail: error instanceof Error ? error.message : "cache unavailable"
    };
  }
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/logger.ts</span>
</div>

```ts
import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "databaseUrl", "redisUrl"],
    remove: true
  }
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/metrics.ts</span>
</div>

```ts
import { collectDefaultMetrics, Registry } from "prom-client";

export const metricsRegistry = new Registry();

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "resilient_notes_"
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/http-metrics.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { Counter, Histogram } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const httpRequestTotal = new Counter({
  name: "resilient_notes_http_request_total",
  help: "HTTP request count by low-cardinality route pattern and status class",
  labelNames: ["method", "route", "statusClass"],
  registers: [metricsRegistry]
});

export const httpRequestDurationSeconds = new Histogram({
  name: "resilient_notes_http_request_duration_seconds",
  help: "HTTP request duration by low-cardinality route pattern and status class",
  labelNames: ["method", "route", "statusClass"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry]
});

export function scrubPattern(pathname: string): string {
  return pathname
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ":id")
    .replace(/\d+/g, ":id")
    .split("?")[0] || "/";
}

export function getRoutePattern(request: Request): string {
  const routePath = request.route?.path;
  const pathPart = typeof routePath === "string" ? routePath : request.path;
  return scrubPattern(`${request.baseUrl}${pathPart}`);
}

export function httpMetrics(request: Request, response: Response, next: NextFunction): void {
  const started = process.hrtime.bigint();
  response.on("finish", () => {
    const statusClass = `${Math.floor(response.statusCode / 100)}xx`;
    const labels = {
      method: request.method,
      route: getRoutePattern(request),
      statusClass
    };
    const seconds = Number(process.hrtime.bigint() - started) / 1_000_000_000;
    httpRequestTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, seconds);
  });
  next();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/reliability-metrics.ts</span>
</div>

```ts
import { Counter, Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const retryAttemptTotal = new Counter({
  name: "resilient_notes_retry_attempt_total",
  help: "Retry attempts by operation and failure kind",
  labelNames: ["operation", "failureKind"],
  registers: [metricsRegistry]
});

export const retryExhaustedTotal = new Counter({
  name: "resilient_notes_retry_exhausted_total",
  help: "Retry policies that exhausted all attempts",
  labelNames: ["operation", "failureKind"],
  registers: [metricsRegistry]
});

export const timeoutTotal = new Counter({
  name: "resilient_notes_timeout_total",
  help: "Timeout count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const abortTotal = new Counter({
  name: "resilient_notes_abort_total",
  help: "Abort count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const idempotencyReplayTotal = new Counter({
  name: "resilient_notes_idempotency_replay_total",
  help: "Stored idempotency responses replayed",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const idempotencyConflictTotal = new Counter({
  name: "resilient_notes_idempotency_conflict_total",
  help: "Idempotency key conflicts by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const problemResponseTotal = new Counter({
  name: "resilient_notes_problem_response_total",
  help: "Problem details responses by problem code and status class",
  labelNames: ["code", "statusClass"],
  registers: [metricsRegistry]
});

export const circuitBreakerState = new Gauge({
  name: "resilient_notes_circuit_breaker_state",
  help: "Circuit breaker state gauge by dependency and state",
  labelNames: ["dependency", "state"],
  registers: [metricsRegistry]
});

export const circuitBreakerOpenTotal = new Counter({
  name: "resilient_notes_circuit_breaker_open_total",
  help: "Circuit breaker open events by dependency",
  labelNames: ["dependency"],
  registers: [metricsRegistry]
});

export const bulkheadRejectedTotal = new Counter({
  name: "resilient_notes_bulkhead_rejected_total",
  help: "Bulkhead rejections by dependency",
  labelNames: ["dependency"],
  registers: [metricsRegistry]
});

export const dependencyHealthStatus = new Gauge({
  name: "resilient_notes_dependency_health_status",
  help: "Dependency health as 1 for healthy and 0 for unhealthy",
  labelNames: ["dependency", "status"],
  registers: [metricsRegistry]
});

export const redisFallbackTotal = new Counter({
  name: "resilient_notes_redis_fallback_total",
  help: "Redis fallback count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const transactionRetryTotal = new Counter({
  name: "resilient_notes_transaction_retry_total",
  help: "Transaction retry count by reason",
  labelNames: ["reason"],
  registers: [metricsRegistry]
});

export function recordRetryAttempt(operation: string, failureKind: string): void {
  retryAttemptTotal.inc({ operation, failureKind });
}

export function recordRetryExhausted(operation: string, failureKind: string): void {
  retryExhaustedTotal.inc({ operation, failureKind });
}

export function recordTransactionRetry(reason: string): void {
  transactionRetryTotal.inc({ reason });
}

export function recordRedisFallback(operation: string): void {
  redisFallbackTotal.inc({ operation });
}

export function recordDependencyHealth(dependency: string, status: "healthy" | "unhealthy"): void {
  dependencyHealthStatus.set({ dependency, status }, status === "healthy" ? 1 : 0);
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/request-context.ts</span>
</div>

```ts
import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";

export interface RequestContext {
  requestId: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function requestContext(request: Request, _response: Response, next: NextFunction): void {
  requestContextStorage.run({ requestId: request.id }, next);
}

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/request-logger.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { getRoutePattern } from "./http-metrics.js";

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const started = process.hrtime.bigint();
  response.on("finish", () => {
    logger.info(
      {
        requestId: request.id,
        method: request.method,
        route: getRoutePattern(request),
        statusCode: response.statusCode,
        durationMs: Number(process.hrtime.bigint() - started) / 1_000_000
      },
      "HTTP request completed"
    );
  });
  next();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/error-logger.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { getRoutePattern } from "./http-metrics.js";

export function errorLogger(error: unknown, request: Request, _response: Response, next: NextFunction): void {
  logger.error(
    {
      requestId: request.id,
      method: request.method,
      route: getRoutePattern(request),
      error: error instanceof Error ? error.message : "Unknown error"
    },
    "HTTP request failed"
  );
  next(error);
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/observability/metrics.routes.ts</span>
</div>

```ts
import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response) => {
  response.setHeader("content-type", metricsRegistry.contentType);
  response.end(await metricsRegistry.metrics());
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/abortable.ts</span>
</div>

```ts
import { setTimeout as delay } from "node:timers/promises";
import { abortTotal } from "../observability/reliability-metrics.js";

export async function abortableDelay(ms: number, signal?: AbortSignal, operation = "delay"): Promise<void> {
  try {
    await delay(ms, undefined, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      abortTotal.inc({ operation });
    }
    throw error;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/timeout.ts</span>
</div>

```ts
import { timeoutTotal } from "../observability/reliability-metrics.js";
import { isAbortError } from "./abortable.js";

export class TimeoutError extends Error {
  readonly code = "TIMEOUT";

  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    return await operation(signal);
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      timeoutTotal.inc({ operation: operationName });
      throw new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export async function raceWithTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => reject(new TimeoutError(message)), timeoutMs);
    timeout.unref();
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/retry-policy.ts</span>
</div>

```ts
export interface RetryPolicy {
  operation: string;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryBudget: number;
}

export interface RetryBudget {
  remaining: number;
}

export function createRetryBudget(retryBudget: number): RetryBudget {
  return { remaining: retryBudget };
}

export function consumeRetryBudget(budget: RetryBudget): boolean {
  if (budget.remaining <= 0) return false;
  budget.remaining -= 1;
  return true;
}

export function calculateBackoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * Math.max(1, exponential * 0.2));
  return exponential + jitter;
}

export function isRetrySafeMethod(method: string, hasIdempotencyKey: boolean): boolean {
  const normalized = method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(normalized)) return true;
  if (["PUT", "DELETE"].includes(normalized)) return true;
  return normalized === "POST" && hasIdempotencyKey;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/error-classifier.ts</span>
</div>

```ts
import { TimeoutError } from "./timeout.js";

export type FailureKind =
  | "timeout"
  | "abort"
  | "transient"
  | "permanent"
  | "conflict"
  | "duplicate"
  | "overload"
  | "dependency";

export interface FailureClassification {
  kind: FailureKind;
  retryable: boolean;
}

export function classifyFailure(error: unknown): FailureClassification {
  if (error instanceof TimeoutError) return { kind: "timeout", retryable: true };
  if (error instanceof Error && error.name === "AbortError") return { kind: "abort", retryable: false };
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (status === 408 || status === 429 || status >= 500) return { kind: "transient", retryable: true };
    if (status === 409) return { kind: "conflict", retryable: false };
  }
  return { kind: "permanent", retryable: false };
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/retry-executor.ts</span>
</div>

```ts
import { abortableDelay } from "./abortable.js";
import { classifyFailure } from "./error-classifier.js";
import { calculateBackoffDelay, consumeRetryBudget, createRetryBudget, type RetryPolicy } from "./retry-policy.js";
import { recordRetryAttempt, recordRetryExhausted } from "../observability/reliability-metrics.js";

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  signal?: AbortSignal
): Promise<T> {
  const budget = createRetryBudget(policy.retryBudget);
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    if (signal?.aborted) throw signal.reason ?? new Error("Retry aborted");
    try {
      return await operation();
    } catch (error) {
      const classification = classifyFailure(error);
      lastError = error;
      if (!classification.retryable || attempt === policy.maxAttempts || !consumeRetryBudget(budget)) {
        recordRetryExhausted(policy.operation, classification.kind);
        break;
      }

      recordRetryAttempt(policy.operation, classification.kind);
      await abortableDelay(
        calculateBackoffDelay(attempt, policy.baseDelayMs, policy.maxDelayMs),
        signal,
        policy.operation
      );
    }
  }

  throw lastError;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/idempotency-key.ts</span>
</div>

```ts
import { createHash } from "node:crypto";

export function validateIdempotencyKey(value: string | undefined): string {
  if (!value || value.length < 8 || value.length > 128) {
    throw new Error("Idempotency-Key must be between 8 and 128 characters");
  }
  return value;
}

export function buildRequestFingerprint(method: string, path: string, body: unknown): string {
  const normalizedBody = JSON.stringify(sortJson(body));
  return createHash("sha256")
    .update(`${method.toUpperCase()} ${path}\n${normalizedBody}`)
    .digest("hex");
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJson(child)])
    );
  }
  return value;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/idempotency-store.ts</span>
</div>

```ts
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { idempotencyConflictTotal, idempotencyReplayTotal } from "../observability/reliability-metrics.js";
import { HttpError } from "../shared/errors/http-error.js";

export interface StoredIdempotencyResult {
  replayed: boolean;
  statusCode: number;
  body: unknown;
}

export async function executeIdempotentOperation(
  key: string,
  requestFingerprint: string,
  operation: () => Promise<{ statusCode: number; body: unknown }>,
  ttlSeconds = 86_400
): Promise<StoredIdempotencyResult> {
  const existing = await prisma.idempotencyRecord.findUnique({ where: { key } });
  const now = new Date();

  if (existing && existing.expiresAt > now) {
    if (existing.requestFingerprint !== requestFingerprint) {
      idempotencyConflictTotal.inc({ operation: "idempotent_operation" });
      throw new HttpError(409, "Idempotency key conflict", "IDEMPOTENCY_CONFLICT");
    }

    idempotencyReplayTotal.inc({ operation: "idempotent_operation" });
    return { replayed: true, statusCode: existing.statusCode, body: existing.responseBody };
  }

  const result = await operation();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1_000);

  await prisma.idempotencyRecord.upsert({
    where: { key },
    update: {
      requestFingerprint,
      statusCode: result.statusCode,
              responseBody: result.body as Prisma.InputJsonValue,
      expiresAt
    },
    create: {
      key,
      requestFingerprint,
      statusCode: result.statusCode,
              responseBody: result.body as Prisma.InputJsonValue,
      expiresAt
    }
  });

  return { replayed: false, statusCode: result.statusCode, body: result.body };
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/problem-details.ts</span>
</div>

```ts
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  requestId?: string;
  validationErrors?: unknown;
}

export interface ProblemDetailsInput {
  status: number;
  title: string;
  detail: string;
  instance: string;
  code: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  requestId?: string;
  validationErrors?: unknown;
}

export function buildProblemDetails(input: ProblemDetailsInput): ProblemDetails {
  return {
    type: `https://example.com/problems/${input.code.toLowerCase().replaceAll("_", "-")}`,
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    code: input.code,
    retryable: input.retryable,
    retryAfterSeconds: input.retryAfterSeconds,
    requestId: input.requestId,
    validationErrors: input.validationErrors
  };
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/circuit-breaker.ts</span>
</div>

```ts
import { circuitBreakerOpenTotal, circuitBreakerState } from "../observability/reliability-metrics.js";

export type CircuitBreakerState = "closed" | "open" | "half-open";

export class CircuitBreakerOpenError extends Error {
  readonly status = 503;

  constructor() {
    super("Circuit breaker is open");
    this.name = "CircuitBreakerOpenError";
  }
}

export interface CircuitBreakerOptions {
  dependency: string;
  failureThreshold: number;
  recoveryTimeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = "closed";
  private failures = 0;
  private openedAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.publishState();
  }

  getState(): CircuitBreakerState {
    if (this.state === "open" && Date.now() - this.openedAt >= this.options.recoveryTimeoutMs) {
      this.state = "half-open";
      this.publishState();
    }
    return this.state;
  }

  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.openedAt = 0;
    this.publishState();
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const currentState = this.getState();
    if (currentState === "open") {
      throw new CircuitBreakerOpenError();
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    this.failures = 0;
    this.state = "closed";
    this.publishState();
  }

  private recordFailure(): void {
    this.failures += 1;
    if (this.state === "half-open" || this.failures >= this.options.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
      circuitBreakerOpenTotal.inc({ dependency: this.options.dependency });
    }
    this.publishState();
  }

  private publishState(): void {
    for (const state of ["closed", "open", "half-open"] as const) {
      circuitBreakerState.set({ dependency: this.options.dependency, state }, this.state === state ? 1 : 0);
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
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/bulkhead.ts</span>
</div>

```ts
import { bulkheadRejectedTotal } from "../observability/reliability-metrics.js";

export class BulkheadRejectedError extends Error {
  readonly status = 503;

  constructor() {
    super("Bulkhead capacity exceeded");
    this.name = "BulkheadRejectedError";
  }
}

export class Bulkhead {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly dependency: string,
    private readonly concurrencyLimit: number,
    private readonly queueLimit: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active >= this.concurrencyLimit) {
      if (this.queue.length >= this.queueLimit) {
        bulkheadRejectedTotal.inc({ dependency: this.dependency });
        throw new BulkheadRejectedError();
      }
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.active += 1;
    try {
      return await operation();
    } finally {
      this.active -= 1;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  snapshot(): { active: number; queued: number; concurrencyLimit: number; queueLimit: number } {
    return {
      active: this.active,
      queued: this.queue.length,
      concurrencyLimit: this.concurrencyLimit,
      queueLimit: this.queueLimit
    };
  }

  close(): void {
    this.queue.splice(0).forEach((next) => next());
  }
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/degradation-policy.ts</span>
</div>

```ts
export interface DegradationDecision {
  status: "ready" | "degraded" | "not_ready";
  dependency: string;
  reason: string;
}

export function chooseDegradationPolicy(
  dependency: string,
  required: boolean,
  healthy: boolean,
  reason: string
): DegradationDecision {
  if (healthy) return { status: "ready", dependency, reason: "ok" };
  return {
    status: required ? "not_ready" : "degraded",
    dependency,
    reason
  };
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/reliability/fault-injection.ts</span>
</div>

```ts
import { config } from "../config/env.js";

export type FaultScenario = "none" | "slow_dependency" | "timeout" | "redis_outage" | "db_conflict" | "circuit_open";

let activeScenario: FaultScenario = "none";

export function assertFaultInjectionAllowed(): void {
  if (config.NODE_ENV === "production" && !config.FAULT_INJECTION_ENABLED) {
    throw new Error("Fault injection is disabled");
  }
}

export function setFaultScenario(scenario: FaultScenario): FaultScenario {
  assertFaultInjectionAllowed();
  activeScenario = scenario;
  return activeScenario;
}

export function resetFaultScenario(): void {
  activeScenario = "none";
}

export function getFaultScenario(): FaultScenario {
  return activeScenario;
}

export function shouldSimulate(scenario: FaultScenario): boolean {
  return activeScenario === scenario;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/errors/http-error.ts</span>
</div>

```ts
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string,
    readonly details?: unknown,
    readonly retryable = false,
    readonly retryAfterSeconds?: number
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
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/errors/error-middleware.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { TimeoutError } from "../../reliability/timeout.js";
import { buildProblemDetails } from "../../reliability/problem-details.js";
import { problemResponseTotal } from "../../observability/reliability-metrics.js";
import { HttpError } from "./http-error.js";

export function errorMiddleware(error: unknown, request: Request, response: Response, _next: NextFunction): void {
  const mapped = mapError(error);
  const statusClass = `${Math.floor(mapped.status / 100)}xx`;
  problemResponseTotal.inc({ code: mapped.code, statusClass });
  response
    .status(mapped.status)
    .type("application/problem+json")
    .json(
      buildProblemDetails({
        status: mapped.status,
        title: mapped.title,
        detail: mapped.detail,
        code: mapped.code,
        instance: request.path,
        requestId: request.id,
        retryable: mapped.retryable,
        retryAfterSeconds: mapped.retryAfterSeconds,
        validationErrors: mapped.validationErrors
      })
    );
}

function mapError(error: unknown): {
  status: number;
  title: string;
  detail: string;
  code: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  validationErrors?: unknown;
} {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      title: error.message,
      detail: error.message,
      code: error.code,
      retryable: error.retryable,
      retryAfterSeconds: error.retryAfterSeconds,
      validationErrors: error.details
    };
  }
  if (error instanceof ZodError) {
    return {
      status: 400,
      title: "Validation failed",
      detail: "Request validation failed",
      code: "VALIDATION_ERROR",
      validationErrors: error.issues
    };
  }
  if (error instanceof TimeoutError) {
    return {
      status: 504,
      title: "Dependency timeout",
      detail: error.message,
      code: "TIMEOUT",
      retryable: true
    };
  }
  return {
    status: 500,
    title: "Internal server error",
    detail: "The request failed at an internal boundary",
    code: "INTERNAL_ERROR"
  };
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/middleware/request-id.ts</span>
</div>

```ts
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(request: Request, response: Response, next: NextFunction): void {
  request.id = request.get("x-request-id") ?? randomUUID();
  response.setHeader("x-request-id", request.id);
  next();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/middleware/security-headers.ts</span>
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
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/middleware/cors.ts</span>
</div>

```ts
import cors from "cors";
import { config } from "../../config/env.js";

const allowedOrigins = config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("CORS origin is not allowed"));
  }
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/middleware/rate-limit.ts</span>
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
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/middleware/not-found.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error.js";

export function notFound(request: Request, _response: Response, next: NextFunction): void {
  next(new HttpError(404, `Route ${request.method} ${request.path} was not found`, "NOT_FOUND"));
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/responses/send-response.ts</span>
</div>

```ts
import type { Response } from "express";

export function sendResponse<T>(response: Response, statusCode: number, body: T): void {
  response.status(statusCode).json(body);
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/validation/validate-request.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export interface RequestSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export function validateRequest(schemas: RequestSchemas) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    try {
      if (schemas.body) request.body = schemas.body.parse(request.body);
      if (schemas.params) request.params = schemas.params.parse(request.params) as Request["params"];
      if (schemas.query) request.query = schemas.query.parse(request.query) as Request["query"];
      next();
    } catch (error) {
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
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/auth/auth-context.ts</span>
</div>

```ts
import type { Request } from "express";

export interface AuthContext {
  userId: string;
  sessionId: string;
  role: "USER" | "ADMIN";
}

export type AuthenticatedRequest = Request & {
  auth: AuthContext;
};

export function requireAuthContext(request: Request): AuthContext {
  const auth = (request as Request & { auth?: AuthContext }).auth;
  if (!auth) throw new Error("Authentication context is missing");
  return auth;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/cookies/session-cookie.ts</span>
</div>

```ts
import { config } from "../../config/env.js";

export function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      return [name, decodeURIComponent(rest.join("="))];
    })
  );
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  return parseCookieHeader(header)[name];
}

export function createSessionCookie(token: string, expiresAt: Date): string {
  return serializeCookie(config.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.COOKIE_SECURE,
    expires: expiresAt
  });
}

export function createCsrfCookie(token: string): string {
  return serializeCookie(config.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "Lax",
    secure: config.COOKIE_SECURE
  });
}

export function clearSessionCookie(): string {
  return serializeCookie(config.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.COOKIE_SECURE,
    expires: new Date(0)
  });
}

function serializeCookie(
  name: string,
  value: string,
  options: { httpOnly: boolean; sameSite: "Lax"; secure: boolean; expires?: Date }
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", `SameSite=${options.sameSite}`];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  return parts.join("; ");
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/auth/session-token.ts</span>
</div>

```ts
import { createHash, randomBytes } from "node:crypto";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/auth/password-hashing.ts</span>
</div>

```ts
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/auth/authenticate-session.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { readCookie } from "../cookies/session-cookie.js";
import { hashToken } from "./session-token.js";

export async function authenticateSession(request: Request, _response: Response, next: NextFunction): Promise<void> {
  const token = readCookie(request.headers.cookie, config.SESSION_COOKIE_NAME);
  if (!token) {
    next(new HttpError(401, "Authentication required", "AUTHENTICATION_REQUIRED"));
    return;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true }
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    next(new HttpError(401, "Authentication required", "AUTHENTICATION_REQUIRED"));
    return;
  }

  (request as Request & { auth: { userId: string; sessionId: string; role: "USER" | "ADMIN" } }).auth = {
    userId: session.userId,
    sessionId: session.id,
    role: session.user.role
  };
  next();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/shared/auth/csrf.ts</span>
</div>

```ts
import type { NextFunction, Request, Response } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { readCookie } from "../cookies/session-cookie.js";
import { HttpError } from "../errors/http-error.js";
import { requireAuthContext } from "./auth-context.js";
import { hashToken } from "./session-token.js";

export async function requireCsrfToken(request: Request, _response: Response, next: NextFunction): Promise<void> {
  try {
    const auth = requireAuthContext(request);
    const headerToken = request.get("x-csrf-token");
    const cookieToken = readCookie(request.headers.cookie, config.CSRF_COOKIE_NAME);
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      next(new HttpError(403, "CSRF token is invalid", "FORBIDDEN"));
      return;
    }

    const session = await prisma.session.findUnique({ where: { id: auth.sessionId } });
    if (!session?.csrfTokenHash || session.csrfTokenHash !== hashToken(headerToken)) {
      next(new HttpError(403, "CSRF token is invalid", "FORBIDDEN"));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/health/health.types.ts</span>
</div>

```ts
export interface DependencyStatus {
  name: "postgres" | "redis";
  required: boolean;
  healthy: boolean;
  detail: string;
}

export interface HealthStatus {
  status: "live" | "ready" | "degraded" | "not_ready";
  dependencies: DependencyStatus[];
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/health/health.service.ts</span>
</div>

```ts
import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";
import type { HealthStatus } from "./health.types.js";

export function getLiveness(): HealthStatus {
  return { status: "live", dependencies: [] };
}

export async function getReadiness(): Promise<HealthStatus> {
  const dependencies = await Promise.all([checkDatabaseHealth(), checkRedisHealth()]);
  const requiredFailures = dependencies.filter((dependency) => dependency.required && !dependency.healthy);
  const optionalFailures = dependencies.filter((dependency) => !dependency.required && !dependency.healthy);

  if (requiredFailures.length > 0) {
    return { status: "not_ready", dependencies };
  }

  if (optionalFailures.length > 0) {
    return { status: "degraded", dependencies };
  }

  return { status: "ready", dependencies };
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/health/health.controller.ts</span>
</div>

```ts
import type { Request, Response } from "express";
import { getLiveness, getReadiness } from "./health.service.js";

export const healthController = {
  live(_request: Request, response: Response) {
    response.json(getLiveness());
  },

  async ready(_request: Request, response: Response) {
    const readiness = await getReadiness();
    response.status(readiness.status === "not_ready" ? 503 : 200).json(readiness);
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/health/health.routes.ts</span>
</div>

```ts
import { Router } from "express";
import { healthController } from "./health.controller.js";

export const healthRoutes = Router();

healthRoutes.get("/live", healthController.live);
healthRoutes.get("/ready", healthController.ready);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/auth/auth.types.ts</span>
</div>

```ts
export interface AuthUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthSessionResult {
  user: AuthUser;
  sessionToken: string;
  csrfToken: string;
  expiresAt: Date;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/auth/auth.schema.ts</span>
</div>

```ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128)
});

export const loginSchema = registerSchema;
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/auth/auth.repository.ts</span>
</div>

```ts
import { prisma } from "../../db/prisma.js";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  createUser(email: string, passwordHash: string) {
    return prisma.user.create({ data: { email, passwordHash } });
  },

  createSession(data: {
    userId: string;
    tokenHash: string;
    csrfTokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipHash?: string;
  }) {
    return prisma.session.create({ data });
  },

  revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/auth/auth.service.ts</span>
</div>

```ts
import { randomBytes } from "node:crypto";
import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashToken } from "../../shared/auth/session-token.js";
import { authRepository } from "./auth.repository.js";
import type { AuthSessionResult } from "./auth.types.js";

function toAuthUser(user: { id: string; email: string; role: "USER" | "ADMIN" }) {
  return { id: user.id, email: user.email, role: user.role };
}

export const authService = {
  async register(email: string, password: string): Promise<AuthSessionResult> {
    const existing = await authRepository.findUserByEmail(email);
    if (existing) throw new HttpError(409, "Email is already registered", "CONFLICT");
    const user = await authRepository.createUser(email, await hashPassword(password));
    return this.createSessionForUser(user);
  },

  async login(email: string, password: string): Promise<AuthSessionResult> {
    const user = await authRepository.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, "Invalid credentials", "AUTHENTICATION_REQUIRED");
    }
    return this.createSessionForUser(user);
  },

  async logout(sessionId: string): Promise<void> {
    await authRepository.revokeSession(sessionId);
  },

  async createSessionForUser(user: { id: string; email: string; role: "USER" | "ADMIN" }): Promise<AuthSessionResult> {
    const sessionToken = createSessionToken();
    const csrfToken = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1_000);
    await authRepository.createSession({
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      csrfTokenHash: hashToken(csrfToken),
      expiresAt
    });
    return { user: toAuthUser(user), sessionToken, csrfToken, expiresAt };
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/auth/auth.controller.ts</span>
</div>

```ts
import type { Request, Response } from "express";
import { createCsrfCookie, createSessionCookie, clearSessionCookie } from "../../shared/cookies/session-cookie.js";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendResponse } from "../../shared/responses/send-response.js";
import { authService } from "./auth.service.js";

export const authController = {
  async register(request: Request, response: Response) {
    const result = await authService.register(request.body.email, request.body.password);
    response.setHeader("set-cookie", [createSessionCookie(result.sessionToken, result.expiresAt), createCsrfCookie(result.csrfToken)]);
    sendResponse(response, 201, { user: result.user, csrfToken: result.csrfToken });
  },

  async login(request: Request, response: Response) {
    const result = await authService.login(request.body.email, request.body.password);
    response.setHeader("set-cookie", [createSessionCookie(result.sessionToken, result.expiresAt), createCsrfCookie(result.csrfToken)]);
    sendResponse(response, 200, { user: result.user, csrfToken: result.csrfToken });
  },

  async logout(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    await authService.logout(auth.sessionId);
    response.setHeader("set-cookie", clearSessionCookie());
    sendResponse(response, 204, {});
  },

  me(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 200, { userId: auth.userId, role: auth.role });
  },

  csrf(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 200, { sessionId: auth.sessionId });
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/auth/auth.routes.ts</span>
</div>

```ts
import { Router } from "express";
import { authenticateSession } from "../../shared/auth/authenticate-session.js";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: registerSchema }), authController.register);
authRoutes.post("/login", validateRequest({ body: loginSchema }), authController.login);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, authController.logout);
authRoutes.get("/me", authenticateSession, authController.me);
authRoutes.get("/csrf", authenticateSession, authController.csrf);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notebooks/notebooks.types.ts</span>
</div>

```ts
export interface NotebookView {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notebooks/notebooks.schema.ts</span>
</div>

```ts
import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNotebookSchema = z.object({
  name: z.string().min(1).max(120)
});

export const updateNotebookSchema = createNotebookSchema.partial();
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notebooks/notebooks.repository.ts</span>
</div>

```ts
import { prisma } from "../../db/prisma.js";

export const notebooksRepository = {
  list(ownerId: string) {
    return prisma.notebook.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" }
    });
  },

  findById(ownerId: string, notebookId: string) {
    return prisma.notebook.findFirst({ where: { id: notebookId, ownerId } });
  },

  create(ownerId: string, name: string) {
    return prisma.notebook.create({ data: { ownerId, name } });
  },

  update(ownerId: string, notebookId: string, data: { name?: string }) {
    return prisma.notebook.update({ where: { id: notebookId, ownerId }, data });
  },

  remove(ownerId: string, notebookId: string) {
    return prisma.notebook.delete({ where: { id: notebookId, ownerId } });
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notebooks/notebooks.service.ts</span>
</div>

```ts
import { classifyDatabaseError } from "../../db/db-error-classifier.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { notebooksRepository } from "./notebooks.repository.js";

function mapDatabaseError(error: unknown): never {
  const classification = classifyDatabaseError(error);
  if (classification.kind === "unique_conflict") throw new HttpError(409, "Notebook already exists", "CONFLICT");
  if (classification.kind === "not_found") throw new HttpError(404, "Notebook not found", "NOT_FOUND");
  throw error;
}

export const notebooksService = {
  list(ownerId: string) {
    return notebooksRepository.list(ownerId);
  },

  async find(ownerId: string, notebookId: string) {
    const notebook = await notebooksRepository.findById(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "Notebook not found", "NOT_FOUND");
    return notebook;
  },

  async create(ownerId: string, name: string) {
    try {
      return await notebooksRepository.create(ownerId, name);
    } catch (error) {
      mapDatabaseError(error);
    }
  },

  async update(ownerId: string, notebookId: string, data: { name?: string }) {
    try {
      return await notebooksRepository.update(ownerId, notebookId, data);
    } catch (error) {
      mapDatabaseError(error);
    }
  },

  async remove(ownerId: string, notebookId: string) {
    try {
      await notebooksRepository.remove(ownerId, notebookId);
    } catch (error) {
      mapDatabaseError(error);
    }
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notebooks/notebooks.controller.ts</span>
</div>

```ts
import type { Request, Response } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendResponse } from "../../shared/responses/send-response.js";
import { notebooksService } from "./notebooks.service.js";

export const notebooksController = {
  async list(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 200, { notebooks: await notebooksService.list(auth.userId) });
  },

  async create(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    sendResponse(response, 201, { notebook: await notebooksService.create(auth.userId, request.body.name) });
  },

  async get(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 200, { notebook: await notebooksService.find(auth.userId, notebookId) });
  },

  async update(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 200, { notebook: await notebooksService.update(auth.userId, notebookId, request.body) });
  },

  async remove(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    await notebooksService.remove(auth.userId, notebookId);
    sendResponse(response, 204, {});
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notebooks/notebooks.routes.ts</span>
</div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { notebooksController } from "./notebooks.controller.js";
import { createNotebookSchema, notebookParamsSchema, updateNotebookSchema } from "./notebooks.schema.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", notebooksController.list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookSchema }), notebooksController.create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), notebooksController.get);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookSchema }), notebooksController.update);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), notebooksController.remove);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notes/notes.types.ts</span>
</div>

```ts
export interface NoteView {
  id: string;
  notebookId: string;
  title: string;
  body: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notes/notes.schema.ts</span>
</div>

```ts
import { z } from "zod";

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNoteSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().max(10_000).default("")
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  body: z.string().max(10_000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional()
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notes/notes.repository.ts</span>
</div>

```ts
import { prisma } from "../../db/prisma.js";

export const notesRepository = {
  listForNotebook(ownerId: string, notebookId: string) {
    return prisma.note.findMany({
      where: { ownerId, notebookId },
      orderBy: { updatedAt: "desc" }
    });
  },

  findById(ownerId: string, noteId: string) {
    return prisma.note.findFirst({ where: { id: noteId, ownerId } });
  },

  create(ownerId: string, notebookId: string, data: { title: string; body: string }) {
    return prisma.note.create({ data: { ownerId, notebookId, title: data.title, body: data.body } });
  },

  update(ownerId: string, noteId: string, data: { title?: string; body?: string; status?: "DRAFT" | "ACTIVE" | "ARCHIVED" }) {
    return prisma.note.update({ where: { id: noteId, ownerId }, data });
  },

  remove(ownerId: string, noteId: string) {
    return prisma.note.delete({ where: { id: noteId, ownerId } });
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notes/notes.service.ts</span>
</div>

```ts
import { classifyDatabaseError } from "../../db/db-error-classifier.js";
import { withTransactionRetry } from "../../db/transaction-retry.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { notesRepository } from "./notes.repository.js";

function mapNoteError(error: unknown): never {
  const classification = classifyDatabaseError(error);
  if (classification.kind === "unique_conflict") throw new HttpError(409, "Note title already exists", "CONFLICT");
  if (classification.kind === "not_found") throw new HttpError(404, "Note not found", "NOT_FOUND");
  throw error;
}

export const notesService = {
  listForNotebook(ownerId: string, notebookId: string) {
    return notesRepository.listForNotebook(ownerId, notebookId);
  },

  async find(ownerId: string, noteId: string) {
    const note = await notesRepository.findById(ownerId, noteId);
    if (!note) throw new HttpError(404, "Note not found", "NOT_FOUND");
    return note;
  },

  async create(ownerId: string, notebookId: string, data: { title: string; body: string }) {
    try {
      return await withTransactionRetry(async (transaction) => {
        const notebook = await transaction.notebook.findFirst({ where: { id: notebookId, ownerId } });
        if (!notebook) throw new HttpError(404, "Notebook not found", "NOT_FOUND");
        return transaction.note.create({ data: { ownerId, notebookId, title: data.title, body: data.body } });
      });
    } catch (error) {
      mapNoteError(error);
    }
  },

  async update(ownerId: string, noteId: string, data: { title?: string; body?: string; status?: "DRAFT" | "ACTIVE" | "ARCHIVED" }) {
    try {
      return await notesRepository.update(ownerId, noteId, data);
    } catch (error) {
      mapNoteError(error);
    }
  },

  async remove(ownerId: string, noteId: string) {
    try {
      await notesRepository.remove(ownerId, noteId);
    } catch (error) {
      mapNoteError(error);
    }
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notes/notes.controller.ts</span>
</div>

```ts
import type { Request, Response } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendResponse } from "../../shared/responses/send-response.js";
import { notesService } from "./notes.service.js";

export const notesController = {
  async listForNotebook(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 200, {
      notes: await notesService.listForNotebook(auth.userId, notebookId)
    });
  },

  async createForNotebook(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const notebookId = request.params.notebookId as string;
    sendResponse(response, 201, {
      note: await notesService.create(auth.userId, notebookId, request.body)
    });
  },

  async get(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const noteId = request.params.noteId as string;
    sendResponse(response, 200, { note: await notesService.find(auth.userId, noteId) });
  },

  async update(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const noteId = request.params.noteId as string;
    sendResponse(response, 200, { note: await notesService.update(auth.userId, noteId, request.body) });
  },

  async remove(request: Request, response: Response) {
    const auth = requireAuthContext(request);
    const noteId = request.params.noteId as string;
    await notesService.remove(auth.userId, noteId);
    sendResponse(response, 204, {});
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notes/notebook-notes.routes.ts</span>
</div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { notesController } from "./notes.controller.js";
import { createNoteSchema, notebookNoteParamsSchema } from "./notes.schema.js";

export const notebookNotesRoutes = Router({ mergeParams: true });

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema }), notesController.listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteSchema }), notesController.createForNotebook);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/notes/notes.routes.ts</span>
</div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { notesController } from "./notes.controller.js";
import { noteParamsSchema, updateNoteSchema } from "./notes.schema.js";

export const notesRoutes = Router();

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), notesController.get);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteSchema }), notesController.update);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), notesController.remove);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/reliability/reliability.types.ts</span>
</div>

```ts
export interface ReliabilityDemoResult {
  ok: boolean;
  mechanism: string;
  detail: string;
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/reliability/reliability.schema.ts</span>
</div>

```ts
import { z } from "zod";

export const idempotentOperationSchema = z.object({
  name: z.string().min(1).max(80),
  amount: z.number().int().positive().max(1_000)
});

export const faultInjectionSchema = z.object({
  scenario: z.enum(["none", "slow_dependency", "timeout", "redis_outage", "db_conflict", "circuit_open"])
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/reliability/reliability.service.ts</span>
</div>

```ts
import { randomUUID } from "node:crypto";
import { config } from "../../config/env.js";
import { abortableDelay } from "../../reliability/abortable.js";
import { Bulkhead } from "../../reliability/bulkhead.js";
import { CircuitBreaker } from "../../reliability/circuit-breaker.js";
import { executeIdempotentOperation } from "../../reliability/idempotency-store.js";
import { buildRequestFingerprint, validateIdempotencyKey } from "../../reliability/idempotency-key.js";
import { executeWithRetry } from "../../reliability/retry-executor.js";
import { type RetryPolicy } from "../../reliability/retry-policy.js";
import { TimeoutError, withTimeout } from "../../reliability/timeout.js";
import { getJsonWithFallback } from "../../redis/redis-cache.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { getFaultScenario, resetFaultScenario, setFaultScenario, type FaultScenario } from "../../reliability/fault-injection.js";

const dependencyBreaker = new CircuitBreaker({
  dependency: "demo_dependency",
  failureThreshold: 2,
  recoveryTimeoutMs: 250
});

const dependencyBulkhead = new Bulkhead("demo_dependency", config.BULKHEAD_CONCURRENCY, config.BULKHEAD_QUEUE);

export const reliabilityService = {
  async timeoutDemo() {
    return withTimeout(async (signal) => {
      await abortableDelay(config.DEPENDENCY_TIMEOUT_MS + 50, signal, "timeout_demo");
      return { ok: true, mechanism: "timeout", detail: "completed within timeout" };
    }, config.DEPENDENCY_TIMEOUT_MS, "timeout_demo");
  },

  async abortDemo() {
    const controller = new AbortController();
    controller.abort(new Error("caller cancelled operation"));
    try {
      await abortableDelay(100, controller.signal, "abort_demo");
    } catch (error) {
      if (error instanceof Error) {
        return { ok: true, mechanism: "abort", detail: error.message };
      }
    }
    return { ok: false, mechanism: "abort", detail: "abort was not observed" };
  },

  async retryDemo() {
    let attempts = 0;
    const policy: RetryPolicy = {
      operation: "retry_demo",
      maxAttempts: 3,
      baseDelayMs: 10,
      maxDelayMs: 50,
      retryBudget: 2
    };

    const result = await executeWithRetry(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new TimeoutError("temporary demo failure");
      }
      return { ok: true, mechanism: "retry", detail: `succeeded after ${attempts} attempts` };
    }, policy);

    return result;
  },

  async circuitBreakerDemo() {
    return {
      ok: true,
      mechanism: "circuit_breaker",
      detail: dependencyBreaker.getState()
    };
  },

  async bulkheadDemo() {
    const started = [
      dependencyBulkhead.execute(async () => {
        await abortableDelay(25);
        return "first";
      }),
      dependencyBulkhead.execute(async () => "second")
    ];
    const results = await Promise.allSettled(started);
    return {
      ok: true,
      mechanism: "bulkhead",
      detail: JSON.stringify({ results: results.map((result) => result.status), snapshot: dependencyBulkhead.snapshot() })
    };
  },

  async degradedCacheDemo() {
    const result = await getJsonWithFallback("reliability:demo", 30, async () => ({
      generatedAt: new Date().toISOString(),
      source: "origin"
    }));
    return {
      ok: true,
      mechanism: "cache_fallback",
      detail: JSON.stringify({ source: result.source, degraded: result.degraded })
    };
  },

  async idempotentOperation(method: string, path: string, idempotencyKey: string | undefined, body: unknown) {
    const key = validateIdempotencyKey(idempotencyKey);
    const fingerprint = buildRequestFingerprint(method, path, body);
    return executeIdempotentOperation(key, fingerprint, async () => ({
      statusCode: 201,
      body: {
        operationId: randomUUID(),
        accepted: true,
        input: body
      }
    }));
  },

  applyFaultScenario(scenario: FaultScenario) {
    if (scenario === "none") {
      resetFaultScenario();
      dependencyBreaker.reset();
      return { ok: true, mechanism: "fault_injection", detail: "reset" };
    }

    const active = setFaultScenario(scenario);
    if (active === "circuit_open") {
      void dependencyBreaker.execute(async () => {
        throw new Error("forced breaker failure");
      }).catch(() => undefined);
      void dependencyBreaker.execute(async () => {
        throw new Error("forced breaker failure");
      }).catch(() => undefined);
    }
    return { ok: true, mechanism: "fault_injection", detail: getFaultScenario() };
  },

  async assertNoUnsafeFaultCrash() {
    if (getFaultScenario() === "timeout") throw new TimeoutError("Injected timeout");
    if (getFaultScenario() === "db_conflict") throw new HttpError(409, "Injected database conflict", "CONFLICT");
    if (getFaultScenario() === "redis_outage") {
      return { ok: true, mechanism: "fault_injection", detail: "simulated redis outage handled as optional fallback" };
    }
    return { ok: true, mechanism: "fault_injection", detail: "no active fault" };
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/reliability/reliability.controller.ts</span>
</div>

```ts
import type { Request, Response } from "express";
import { sendResponse } from "../../shared/responses/send-response.js";
import { reliabilityService } from "./reliability.service.js";

export const reliabilityController = {
  async timeoutDemo(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.timeoutDemo());
  },

  async abortDemo(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.abortDemo());
  },

  async retryDemo(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.retryDemo());
  },

  async circuitBreaker(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.circuitBreakerDemo());
  },

  async bulkhead(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.bulkheadDemo());
  },

  async degradedCache(_request: Request, response: Response) {
    sendResponse(response, 200, await reliabilityService.degradedCacheDemo());
  },

  async idempotentOperation(request: Request, response: Response) {
    const result = await reliabilityService.idempotentOperation(
      request.method,
      request.path,
      request.get("idempotency-key"),
      request.body
    );
    response.setHeader("idempotency-replayed", String(result.replayed));
    sendResponse(response, result.statusCode, result.body);
  },

  async faultInjection(request: Request, response: Response) {
    const result = reliabilityService.applyFaultScenario(request.body.scenario);
    sendResponse(response, 200, result);
  }
};
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/modules/reliability/reliability.routes.ts</span>
</div>

```ts
import { Router } from "express";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { reliabilityController } from "./reliability.controller.js";
import { faultInjectionSchema, idempotentOperationSchema } from "./reliability.schema.js";

export const reliabilityRoutes = Router();

reliabilityRoutes.get("/timeout-demo", reliabilityController.timeoutDemo);
reliabilityRoutes.get("/abort-demo", reliabilityController.abortDemo);
reliabilityRoutes.get("/retry-demo", reliabilityController.retryDemo);
reliabilityRoutes.get("/circuit-breaker", reliabilityController.circuitBreaker);
reliabilityRoutes.get("/bulkhead", reliabilityController.bulkhead);
reliabilityRoutes.get("/degraded-cache", reliabilityController.degradedCache);
reliabilityRoutes.post("/idempotent-operation", validateRequest({ body: idempotentOperationSchema }), reliabilityController.idempotentOperation);
reliabilityRoutes.post("/fault-injection", validateRequest({ body: faultInjectionSchema }), reliabilityController.faultInjection);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/app.ts</span>
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
import { reliabilityRoutes } from "./modules/reliability/reliability.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { httpMetrics } from "./observability/http-metrics.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { requestContext } from "./observability/request-context.js";
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
  app.use(requestContext);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(apiRateLimit);
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);
  app.use(httpMetrics);

  app.use("/health", healthRoutes);
  app.use("/metrics", metricsRoutes);
  app.use("/reliability", reliabilityRoutes);
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
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/src/server.ts</span>
</div>

```ts
import http from "node:http";
import { app } from "./app.js";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { disconnectRedis } from "./redis/redis-client.js";
import { logger } from "./observability/logger.js";

const server = http.createServer(app);

server.requestTimeout = config.HTTP_REQUEST_TIMEOUT_MS;
server.headersTimeout = config.HTTP_HEADERS_TIMEOUT_MS;
server.keepAliveTimeout = config.HTTP_KEEP_ALIVE_TIMEOUT_MS;

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "Resilient Notes API is listening");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "Shutdown signal received");
  server.close(async () => {
    await disconnectRedis();
    await disconnectPrisma();
    process.exit(0);
  });

  setTimeout(() => {
    server.closeAllConnections();
    process.exit(1);
  }, config.SHUTDOWN_TIMEOUT_MS).unref();
}

process.once("SIGTERM", (signal) => void shutdown(signal));
process.once("SIGINT", (signal) => void shutdown(signal));
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/prisma/seed.ts</span>
</div>

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/resilient_notes_api"
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const email = "learner@example.com";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await hashPassword("Password123!")
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: "Reliability Lab"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      name: "Reliability Lab"
    }
  });

  await prisma.note.upsert({
    where: {
      notebookId_title: {
        notebookId: notebook.id,
        title: "Retry boundaries"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      notebookId: notebook.id,
      title: "Retry boundaries",
      body: "Retries must be bounded, classified, and safe."
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
<span class="macos-code-title">mini-projects/resilient-notes-api/openapi/openapi.yaml</span>
</div>

```txt
openapi: 3.1.0
info:
  title: Resilient Notes API
  version: 1.0.0
paths:
  /health/live:
    get:
      responses:
        "200":
          description: Liveness response
  /health/ready:
    get:
      responses:
        "200":
          description: Readiness response
        "503":
          description: Not ready response
  /reliability/idempotent-operation:
    post:
      parameters:
        - in: header
          name: Idempotency-Key
          required: true
          schema:
            type: string
      responses:
        "201":
          description: Created or replayed operation
        "409":
          description: Idempotency conflict
  /metrics:
    get:
      responses:
        "200":
          description: Prometheus metrics
components:
  schemas:
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
<span class="macos-code-title">mini-projects/resilient-notes-api/scripts/wait-for-ready.ts</span>
</div>

```ts
const defaultBaseUrl = "http://localhost:8080";

export async function waitForReady(baseUrl = process.env.SMOKE_BASE_URL ?? defaultBaseUrl): Promise<void> {
  const deadline = Date.now() + 30_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health/ready`);
      if (response.ok) return;
      lastError = new Error(`Ready check returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError instanceof Error ? lastError : new Error("Readiness check timed out");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await waitForReady();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/scripts/smoke-test.ts</span>
</div>

```ts
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function requireOk(path: string): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
}

await requireOk("/health/live");
await waitForReady(baseUrl);
await requireOk("/metrics");
console.log(`smoke ok ${baseUrl}`);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/scripts/reliability-check.ts</span>
</div>

```ts
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function readJson(path: string): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

await readJson("/reliability/abort-demo");
await readJson("/reliability/retry-demo");
await readJson("/reliability/circuit-breaker");
await readJson("/reliability/bulkhead");
await readJson("/reliability/degraded-cache");
console.log(`reliability check ok ${baseUrl}`);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/scripts/fault-injection-check.ts</span>
</div>

```ts
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function postScenario(scenario: string): Promise<void> {
  const response = await fetch(`${baseUrl}/reliability/fault-injection`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ scenario })
  });
  if (!response.ok) throw new Error(`${scenario} returned ${response.status}`);
}

for (const scenario of ["none", "slow_dependency", "timeout", "redis_outage", "db_conflict", "circuit_open", "none"]) {
  await postScenario(scenario);
}

console.log(`fault injection check ok ${baseUrl}`);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/scripts/idempotency-check.ts</span>
</div>

```ts
import { randomUUID } from "node:crypto";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const key = `check-${randomUUID()}`;
const body = { name: "demo-operation", amount: 1 };

async function post(bodyValue: unknown): Promise<Response> {
  return fetch(`${baseUrl}/reliability/idempotent-operation`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": key
    },
    body: JSON.stringify(bodyValue)
  });
}

const first = await post(body);
if (first.status !== 201) throw new Error(`first request returned ${first.status}`);
const firstBody = (await first.json()) as { operationId: string };

const replay = await post(body);
if (replay.status !== 201) throw new Error(`replay request returned ${replay.status}`);
const replayBody = (await replay.json()) as { operationId: string };
if (firstBody.operationId !== replayBody.operationId) throw new Error("replay returned a different operation id");

const conflict = await post({ name: "changed-operation", amount: 1 });
if (conflict.status !== 409) throw new Error(`conflict request returned ${conflict.status}`);

console.log(`idempotency check ok ${baseUrl}`);
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/helpers/database.ts</span>
</div>

```ts
import { prisma } from "../../src/db/prisma.js";

export async function resetReliabilityTables(): Promise<void> {
  await prisma.idempotencyRecord.deleteMany();
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/helpers/redis.ts</span>
</div>

```ts
import { disconnectRedis } from "../../src/redis/redis-client.js";

export async function closeRedis(): Promise<void> {
  await disconnectRedis();
}
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/env.unit.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { envSchema } from "../src/config/env.js";

test("env schema provides local reliability defaults", () => {
  const parsed = envSchema.parse({});
  assert.equal(parsed.PORT, 3020);
  assert.equal(parsed.HTTP_REQUEST_TIMEOUT_MS, 30_000);
  assert.equal(parsed.FAULT_INJECTION_ENABLED, false);
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/problem-details.unit.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildProblemDetails } from "../src/reliability/problem-details.js";

test("problem details include safe stable fields", () => {
  const problem = buildProblemDetails({
    status: 504,
    title: "Dependency timeout",
    detail: "Redis command timed out",
    instance: "/health/ready",
    code: "TIMEOUT",
    retryable: true,
    requestId: "request-1"
  });
  assert.equal(problem.type, "https://example.com/problems/timeout");
  assert.equal(problem.status, 504);
  assert.equal(problem.retryable, true);
  assert.equal("stack" in problem, false);
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/retry-policy.unit.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { calculateBackoffDelay, createRetryBudget, consumeRetryBudget, isRetrySafeMethod } from "../src/reliability/retry-policy.js";
import { executeWithRetry } from "../src/reliability/retry-executor.js";
import { TimeoutError } from "../src/reliability/timeout.js";

test("retry policy uses a bounded budget", () => {
  const budget = createRetryBudget(1);
  assert.equal(consumeRetryBudget(budget), true);
  assert.equal(consumeRetryBudget(budget), false);
});

test("unsafe post requires idempotency key before retry", () => {
  assert.equal(isRetrySafeMethod("POST", false), false);
  assert.equal(isRetrySafeMethod("POST", true), true);
});

test("retry executor stops after success", async () => {
  let attempts = 0;
  const result = await executeWithRetry(async () => {
    attempts += 1;
    if (attempts < 2) throw new TimeoutError("temporary");
    return "ok";
  }, { operation: "unit", maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 1, retryBudget: 2 });
  assert.equal(result, "ok");
  assert.equal(attempts, 2);
  assert.ok(calculateBackoffDelay(1, 1, 5) >= 1);
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/timeout-abort.unit.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { abortableDelay } from "../src/reliability/abortable.js";
import { TimeoutError, withTimeout } from "../src/reliability/timeout.js";

test("AbortSignal.timeout cancels a timer-backed operation", async () => {
  await assert.rejects(
    () => withTimeout((signal) => abortableDelay(50, signal, "unit_delay"), 5, "unit_delay"),
    TimeoutError
  );
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/idempotency.unit.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildRequestFingerprint, validateIdempotencyKey } from "../src/reliability/idempotency-key.js";

test("fingerprint is stable for object key order", () => {
  const left = buildRequestFingerprint("POST", "/resource", { b: 2, a: 1 });
  const right = buildRequestFingerprint("POST", "/resource", { a: 1, b: 2 });
  assert.equal(left, right);
});

test("short idempotency key is rejected", () => {
  assert.throws(() => validateIdempotencyKey("short"));
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/circuit-breaker.unit.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { CircuitBreaker, CircuitBreakerOpenError } from "../src/reliability/circuit-breaker.js";

test("circuit opens after threshold failures", async () => {
  const breaker = new CircuitBreaker({ dependency: "unit", failureThreshold: 2, recoveryTimeoutMs: 5 });
  await assert.rejects(() => breaker.execute(async () => { throw new Error("first"); }));
  await assert.rejects(() => breaker.execute(async () => { throw new Error("second"); }));
  assert.equal(breaker.getState(), "open");
  await assert.rejects(() => breaker.execute(async () => "ok"), CircuitBreakerOpenError);
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/bulkhead.unit.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { Bulkhead, BulkheadRejectedError } from "../src/reliability/bulkhead.js";

test("bulkhead rejects after active and queued slots are full", async () => {
  const bulkhead = new Bulkhead("unit", 1, 0);
  const blocker = bulkhead.execute(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
    return "done";
  });
  await assert.rejects(() => bulkhead.execute(async () => "rejected"), BulkheadRejectedError);
  assert.equal(await blocker, "done");
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/health.integration.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test, { after } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { closeDatabase } from "./helpers/database.js";
import { closeRedis } from "./helpers/redis.js";

after(async () => {
  await closeRedis();
  await closeDatabase();
});

test("liveness endpoint responds without dependency checks", async () => {
  const response = await request(app).get("/health/live").expect(200);
  assert.equal(response.body.status, "live");
});

test("readiness endpoint returns a dependency status document", async () => {
  const response = await request(app).get("/health/ready");
  assert.ok([200, 503].includes(response.status));
  assert.ok(Array.isArray(response.body.dependencies));
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/idempotency.integration.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { closeDatabase, resetReliabilityTables } from "./helpers/database.js";
import { closeRedis } from "./helpers/redis.js";

before(async () => {
  await resetReliabilityTables();
});

after(async () => {
  await resetReliabilityTables();
  await closeRedis();
  await closeDatabase();
});

test("unsafe post replays the same result for the same idempotency key", async () => {
  const key = "integration-key-123";
  const body = { name: "integration", amount: 1 };
  const first = await request(app)
    .post("/reliability/idempotent-operation")
    .set("idempotency-key", key)
    .send(body)
    .expect(201);
  const replay = await request(app)
    .post("/reliability/idempotent-operation")
    .set("idempotency-key", key)
    .send(body)
    .expect(201);

  assert.equal(first.body.operationId, replay.body.operationId);
  assert.equal(replay.headers["idempotency-replayed"], "true");
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/tests/reliability.integration.test.ts</span>
</div>

```ts
import assert from "node:assert/strict";
import test, { after } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { closeDatabase } from "./helpers/database.js";
import { closeRedis } from "./helpers/redis.js";

after(async () => {
  await closeRedis();
  await closeDatabase();
});

test("retry demo reaches success through bounded retry", async () => {
  const response = await request(app).get("/reliability/retry-demo").expect(200);
  assert.equal(response.body.mechanism, "retry");
});

test("timeout demo returns problem details instead of hanging", async () => {
  const response = await request(app).get("/reliability/timeout-demo").expect(504);
  assert.equal(response.type, "application/problem+json");
  assert.equal(response.body.code, "TIMEOUT");
});

test("fault injection endpoint is bounded", async () => {
  const response = await request(app)
    .post("/reliability/fault-injection")
    .send({ scenario: "none" })
    .expect(200);
  assert.equal(response.body.mechanism, "fault_injection");
});
```
</div>
<div class="macos-code-window">
<div class="macos-code-titlebar">
<span class="macos-code-dot macos-code-dot-red"></span>
<span class="macos-code-dot macos-code-dot-yellow"></span>
<span class="macos-code-dot macos-code-dot-green"></span>
<span class="macos-code-title">mini-projects/resilient-notes-api/README.md</span>
</div>

````txt
# Resilient Notes API

This mini project demonstrates reliability boundaries for a Node.js API:
timeouts, cancellation, retry policy, idempotency keys, RFC 9457 problem details,
Prisma transaction conflict retry, Redis failure handling, cache fallback,
circuit breakers, bulkheads, degraded health, fault injection, and low-cardinality metrics.

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

Windows PowerShell:

```powershell
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm run smoke
npm run reliability:check
npm run fault:check
npm run idempotency:check
docker compose down
```

macOS/Linux:

```bash
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm run smoke
npm run reliability:check
npm run fault:check
npm run idempotency:check
docker compose down
```

The default external base URL is `http://localhost:8080`.
Override it with `SMOKE_BASE_URL` when needed.

## Endpoints

- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`
- `GET /reliability/timeout-demo`
- `GET /reliability/abort-demo`
- `GET /reliability/retry-demo`
- `GET /reliability/circuit-breaker`
- `GET /reliability/bulkhead`
- `GET /reliability/degraded-cache`
- `POST /reliability/idempotent-operation`
- `POST /reliability/fault-injection`

## Known limitations

This project intentionally excludes Kubernetes, Terraform, service mesh,
Redis Cluster, PostgreSQL failover administration, Kafka, RabbitMQ,
cloud-provider SDKs, and frontend reliability code.
````
</div>


## 15. 知识迁移与真实项目场景

在真实项目中，先把每个外部依赖标为 required 或 optional；再给 required dependency 设计 readiness，给 optional dependency 设计明确 degraded 响应；最后对每个 retryable failure 检查 retry 是否安全、是否有 budget、是否有指标。Kubernetes、service mesh、cloud load balancer、Kafka、RabbitMQ、多区域和完整 SRE incident response 都是后续边界，不属于本章实现范围。

## 16. 本章复盘任务

- 解释为什么 timeout 结果不等于底层操作已经取消。
- 说明为什么 unsafe POST 需要 idempotency key 才能安全 retry。
- 画出 P2034 whole transaction retry 的边界，不要只 retry 某一条 SQL。
- 说明 Redis failure 什么时候影响 readiness，什么时候只产生 degraded cache response。
- 用 `/metrics` 找到 retry、timeout、abort、idempotency replay、circuit state 和 bulkhead reject 的低基数信号。

## 17. 最终心智模型

可靠性不是“到处 catch”，而是把失败变成稳定协议：每个请求都要知道自己的资源边界、失败信号、分类、策略和验证证据。不能分类的失败不要重试，不能证明幂等的副作用不要重放，不能安全降级的依赖不要假装成功。

## 18. 官方资料

- Node.js API: `AbortController`, `AbortSignal.timeout()`, `AbortSignal.any()`, `fetch`, `node:timers/promises`, `node:http`, `node:test`, `assert`
- Node.js Learn: do not block the event loop
- Express official docs: error handling, middleware order, production best practices
- RFC 9110: HTTP Semantics, safe methods, idempotent methods, status semantics
- RFC 9457: Problem Details for HTTP APIs
- Prisma official docs: transactions, interactive transactions, transaction options, P2034 retry guidance, connection pool behavior
- PostgreSQL official docs: transaction isolation and serialization failure retry rule
- Redis official docs: node-redis connect, reconnect strategy, error handling, production usage
- Docker official docs: Compose healthcheck and service startup order
- OpenAPI 3.1.0 specification: reusable response schemas
- TypeScript official docs: strict checking and discriminated unions

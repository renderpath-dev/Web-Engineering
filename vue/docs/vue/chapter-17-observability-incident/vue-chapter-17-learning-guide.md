# Vue 第 17 章：Observability、Error Recovery、Performance Telemetry 与 Incident Evidence

<style>
.macos-code-window {
  margin: 1rem 0;
  border: 1px solid #d8dee4;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #0f172a;
}

.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  background: #1f2937;
  color: #e5e7eb;
  font-size: 0.85rem;
}

.macos-code-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.macos-code-titlebar + pre {
  margin: 0;
  border-radius: 0;
}

.macos-code-titlebar + pre code {
  display: block;
  padding: 1rem;
}
</style>

## 目录

- [本章代码定位索引](#本章代码定位索引)
- [0. 本章机制边界](#0-本章机制边界)
- [1. 本章解决的问题](#1-本章解决的问题)
- [2. 前置概念](#2-前置概念)
- [3. 学习目标](#3-学习目标)
- [4. 核心机制证据链总览](#4-核心机制证据链总览)
- [5. 核心术语表](#5-核心术语表)
- [6. 底层心智模型](#6-底层心智模型)
- [7. 推荐目录结构](#7-推荐目录结构)
- [8. 示例运行方式](#8-示例运行方式)
- [9. 分节教学与练习](#9-分节教学与练习)
  - [9.1 Observability mental model：signal、source、collector、redaction、sampling、dashboard and incident evidence](#section-9-1)
  - [9.2 Vue app-level error handler：app.config.errorHandler, reporting boundary and user fallback separation](#section-9-2)
  - [9.3 Component error boundary：onErrorCaptured, propagation, fallback UI and infinite-loop risk](#section-9-3)
  - [9.4 Global browser errors：window error, unhandledrejection and framework-vs-platform boundary](#section-9-4)
  - [9.5 Async component recovery：loading state, timeout, error state, retry and user-facing recovery](#section-9-5)
  - [9.6 API failure telemetry：request id, endpoint class, status family, retry decision and privacy-safe error shape](#section-9-6)
  - [9.7 Route and navigation telemetry：route name, navigation duration, failure reason and user task context](#section-9-7)
  - [9.8 User Timing API：performance.mark, performance.measure, local code-path measurement and cleanup](#section-9-8)
  - [9.9 Navigation Timing：navigation type, load milestones, reload/back-forward evidence and bfcache notes](#section-9-9)
  - [9.10 Resource Timing：resource duration, initiator type, cross-origin timing limits and bundle asset review](#section-9-10)
  - [9.11 Core Web Vitals budget：LCP, CLS, INP, lab-vs-field boundary and release budget model](#section-9-11)
  - [9.12 Telemetry event schema：event name, severity, timestamp, route, release, session-safe context and unknown fields](#section-9-12)
  - [9.13 Telemetry redaction and privacy：PII removal, token masking, URL query stripping and safe error messages](#section-9-13)
  - [9.14 Sampling and rate limiting：noise control, high-severity always-on, low-severity sampling and burst protection](#section-9-14)
  - [9.15 Beacon / visibility flush boundary：sendBeacon model, keepalive alternative, page lifecycle and delivery UNKNOWN](#section-9-15)
  - [9.16 Offline telemetry queue：local queue, retry window, drop policy and storage/privacy boundary](#section-9-16)
  - [9.17 Source maps and stack trace boundary：debuggability, source exposure risk, release id and deployment evidence](#section-9-17)
  - [9.18 Release health dashboard：error rate, failed API rate, performance budget, incident status and rollback gate](#section-9-18)
  - [9.19 Incident response workflow：severity, owner, timeline, mitigation, rollback and post-incident review](#section-9-19)
  - [9.20 Chapter integration：how Chapter 17 connects tests, production, security, accessibility and migration](#section-9-20)
  - [9.21 Final integration：vue-observability-incident-lab 如何形成 observability evidence workspace](#section-9-21)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 文件职责](#122-文件职责)
  - [12.3 运行与验证](#123-运行与验证)
  - [12.4 完整核心代码](#124-完整核心代码)
  - [12.5 代码执行链路](#125-代码执行链路)
  - [12.6 验证命令与失败定位](#126-验证命令与失败定位)
  - [12.7 Observability review checklist](#127-observability-review-checklist)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 学习目标 | 真实路径 | 位置 |
| --- | --- | --- |
| telemetry schema、unknown fields、redaction 和 sampling | `src/learning/vue/chapter-17-observability-incident/models/telemetryEventModel.ts`、`models/telemetryRedactionModel.ts`、`models/telemetrySamplingModel.ts`、`components/TelemetryRedactionPanel.vue`、`components/SamplingRateLimitPanel.vue` | 9.1、9.12–9.14 |
| app-level error handler 与 component fallback boundary | `models/errorTelemetryModel.ts`、`models/vueErrorBoundaryModel.ts`、`components/AppErrorHandlerPanel.vue`、`components/ComponentErrorBoundaryDemo.vue`、`components/ErrorFallbackPanel.vue`、`composables/useVueErrorBoundary.ts` | 9.2、9.3 |
| browser global error、unhandled rejection 和 async component recovery | `models/globalErrorModel.ts`、`models/asyncComponentRecoveryModel.ts`、`components/GlobalErrorListenerPanel.vue`、`components/AsyncComponentRecoveryPanel.vue`、`composables/useGlobalErrorListeners.ts` | 9.4、9.5 |
| API、route、performance、navigation、resource 和 web-vital telemetry | `models/apiFailureTelemetryModel.ts`、`models/routeTelemetryModel.ts`、`models/performanceMarkModel.ts`、`models/navigationTimingModel.ts`、`models/resourceTimingModel.ts`、`models/webVitalsBudgetModel.ts` | 9.6–9.11 |
| beacon flush、offline queue、source map、release health、incident 和 rollback | `models/beaconFlushModel.ts`、`models/offlineTelemetryQueueModel.ts`、`models/sourceMapBoundaryModel.ts`、`models/releaseHealthModel.ts`、`models/incidentSeverityModel.ts`、`models/rollbackDecisionModel.ts`、`models/postIncidentReviewModel.ts` | 9.15–9.19 |
| final lab entry and shell integration | `src/learning/vue/chapter-17-observability-incident/ObservabilityIncidentChapterApp.vue`、`src/learning/vue/chapter-01-application-boundary/App.vue` | 9.20、9.21、12 |

## 0. 本章机制边界

本章不是真实 production monitoring setup，不安装或配置 vendor SDK，不发送 telemetry 到外部服务器，不包含真实 user tracking、real PII、real production endpoint、real incident claim 或 conformance claim。它只在本地用 typed models、Vue panels、tests 和 scans 建立 observability evidence workspace。

Vue error handling 与 browser global error listeners 是不同层：`app.config.errorHandler` 和 `onErrorCaptured` 属于 Vue runtime；`window` 的 `error` 与 `unhandledrejection` 属于 browser platform。user fallback 和 error reporting 也不同：fallback 让用户继续操作，report event 让团队知道发生了什么。

TypeScript 可以检查 `TelemetryEvent`、`ErrorTelemetryRecord`、`ReleaseHealthSignal` 和 `RollbackDecision` 的 shape，但不能证明 production reliability、collector delivery、field performance、source map deployment safety 或 incident resolution。Core Web Vitals model values 不是 field RUM data；`sendBeacon` queued 不等于 delivered；source maps、collector ingestion、dashboards、alerting 与 on-call process 都需要外部证据。

本地 roadmap 没有详细 Phase 17，只在 Phase 11 与能力总览中提到错误处理、性能分析、部署、rollback 和 production optimization。因此本章使用任务给定的 fallback Chapter 17 scope，并连接 Chapter 09 API boundary、Chapter 10 tests、Chapter 11 production evidence、Chapter 14 release evidence、Chapter 15 accessibility verification 与 Chapter 16 security release gate。

## 1. 本章解决的问题

Observability 不是 `console.log`。真实项目需要知道：错误来自 Vue component、browser global listener、API、route navigation、resource timing、Core Web Vitals、release dashboard 还是 incident record；哪些字段可以保留；哪些字段必须 redacted；哪些事件需要 sampling；哪些信号会 block release；发生事故时谁 owns mitigation and rollback。

本章把这些问题落到本地可运行文件：`ObservabilityIncidentChapterApp.vue` 展示 panels，`models/*.ts` 固化 signal model，`tests/*.test.ts` 提供 regression evidence，最终 guide 记录哪些生产事实仍是 UNKNOWN。

## 2. 前置概念

- 已理解 Vue app instance、component lifecycle、`ref`、`computed` 与 SFC boundary。
- 已理解 Chapter 09 的 API error normalization 和 front-back boundary。
- 已理解 Chapter 10 的 model tests 与 command evidence。
- 已理解 Chapter 11 的 performance、deployment、rollback 和 release health 思维。
- 已理解 Chapter 16 的 security evidence 不等于真实 backend/deployment verification。

## 3. 学习目标

1. 区分 Vue error handler、component error boundary、browser global errors 与 unhandled promise rejection。
2. 解释 fallback UI、report event、sampling、redaction、queueing、dashboard 和 rollback 的不同责任。
3. 用 Performance API、Navigation Timing、Resource Timing 与 Core Web Vitals budget 建立 local performance evidence。
4. 说明 local lab metrics 与 field RUM data 的边界。
5. 用 release health dashboard、incident severity、rollback decision 和 post-incident review 形成 incident evidence。

## 4. 核心机制证据链总览

| Chain | Collector / model | Safe fields | External proof still needed | Failure signal |
| --- | --- | --- | --- | --- |
| Vue render/event error -> onErrorCaptured -> fallback state -> app error report | `vueErrorBoundaryModel.ts` | component name, safe message, propagation | real production handler wiring | fallback crashes again |
| App-level error -> app.config.errorHandler -> normalized telemetry event | `errorTelemetryModel.ts` | redacted message, component, release id | collector ingestion | unredacted message |
| Browser error -> window error listener -> global error signal | `globalErrorModel.ts` | kind, message, source class | browser runtime check | listener not cleaned |
| Promise rejection -> unhandledrejection -> async failure signal | `globalErrorModel.ts` | reason message, promise source | production listener evidence | rejection ignored |
| Async component load -> loading/timeout/error/retry state | `asyncComponentRecoveryModel.ts` | phase, retry count, timeout | route chunk failure evidence | no retry path |
| API failure -> status family/request id/retry decision -> privacy-safe telemetry | `apiFailureTelemetryModel.ts` | endpoint label, family, request id | backend logs | raw payload sent |
| Route navigation -> route name/duration/failure -> redacted route telemetry | `routeTelemetryModel.ts` | route name, redacted path, duration | Router integration | full query sent |
| User timing mark -> measure -> local duration evidence | `performanceMarkModel.ts` | safe mark, duration | browser profile/RUM | marks not cleared |
| Navigation timing entry -> navigation type/load milestones -> page-load evidence | `navigationTimingModel.ts` | type, interactive, complete | field data | local-only claim |
| Resource timing entry -> resource duration/initiator -> asset timing evidence | `resourceTimingModel.ts` | resource label, initiator, duration | cross-origin TAO evidence | query leak |
| LCP/CLS/INP sample -> budget status -> release gate | `webVitalsBudgetModel.ts` | name, value, status | real RUM data | blocked budget |
| Raw telemetry context -> redaction -> safe event payload | `telemetryRedactionModel.ts` | masked values | privacy review | unmasked token/email |
| Event severity -> sampling/rate limit -> queue decision | `telemetrySamplingModel.ts` | severity, sample slot | production sampling config | critical dropped |
| Visibility hidden -> beacon flush model -> delivery UNKNOWN | `beaconFlushModel.ts` | size, method, queued flag | collector receipt | delivery claimed |
| Offline event -> local queue -> drop/retry policy | `offlineTelemetryQueueModel.ts` | event name, severity, release | storage/privacy review | unbounded queue |
| Stack trace/source map -> debug value/exposure risk -> deployment evidence required | `sourceMapBoundaryModel.ts` | release id, exposure decision | source-map upload policy | public map unreviewed |
| Release signals -> health gate -> rollback decision | `releaseHealthModel.ts` | rates, blocked vitals, incidents | dashboard alerting | gate ignored |
| Incident record -> severity/owner/timeline -> post-incident action items | `incidentSeverityModel.ts` | severity, owner, action item | on-call process | no mitigation |

## 5. 核心术语表

| Term | 本章含义 |
| --- | --- |
| signal | error、API failure、route duration、performance entry、release health 或 incident event |
| collector | 本地 model、Vue panel、queue 或真实生产 collector |
| redaction | telemetry 持久化或发送前移除敏感字段 |
| sampling | 控制低价值事件量，高严重度事件通常 bypass |
| field data | 真实用户环境数据，不等于 local model value |
| release gate | 根据 error rate、API failure、web-vital budget 和 incident status block release |

## 6. 底层心智模型

观察性工作是一条 evidence pipeline：signal 产生，source 标明 owner，collector 接收，redaction 清洗，sampling 决定 keep/drop，queue 暂存，dashboard 聚合，release gate 决策，incident workflow 记录 owner、timeline、mitigation、rollback 和 post-incident action。

## 7. 推荐目录结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```text
src/learning/vue/chapter-17-observability-incident/
  ObservabilityIncidentChapterApp.vue
  observability-incident.css
  components/
  composables/
  models/
  tests/
```
</div>

## 8. 示例运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run dev
npm run typecheck
npm run test:unit
npm run build
```
</div>

`npm run dev` 只能观察本地 UI；`npm run typecheck` 只能证明类型关系；`npm run test:unit` 只能证明已写 model tests；`npm run build` 只能证明 bundle 能生成。collector ingestion、dashboard、alert rule、field RUM、source-map deployment safety 和 incident process 仍然是 UNKNOWN，除非单独验证。

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Observability mental model：signal、source、collector、redaction、sampling、dashboard and incident evidence

**结论：**

Observability 的最小单位不是 log line，而是 `TelemetryEvent`：它把 signal、source、severity、route、release、context、redacted flag 放进一个可测试结构。

**本节解决的问题：**

本节解决“错误、性能和 incident evidence 到底记录什么”的问题。`telemetryEventModel.ts` 规定 event shape，`telemetrySamplingModel.test.ts` 证明 high severity 不被 sampling 丢掉。

**技术意义：**

统一 schema 让 Chapter 17 后续的 error、API、route、performance、queue、release health 都能进入同一个 evidence pipeline。

**概念解释：**

signal 是发生的事实，source 说明 owner，collector 接收，redaction 清洗，sampling 控量，dashboard 聚合，incident record 产生 owner、timeline、rollback。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节只建立 telemetry schema；具体 error handler、browser event、Performance API、beacon 和 incident gate 在后续小节展开。

**Observability 机制证据链：**

signal 从 `createTelemetryEvent` 开始，source 是 `"release"` 或 `"performance"`，collector 是本地 model，safe fields 是 eventName、severity、routeName、releaseId，context 后续必须 redacted，sampling 由 severity 决定，TypeScript 检查字段，生产 collector delivery 仍不能证明，测试 failure 会 block release。

**TypeScript / vue-tsc 编译期过程：**

`TelemetrySeverity` 与 `TelemetrySource` 是 union types；`vue-tsc` 能发现拼写错误，但不能证明 telemetry 真的送达 collector。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

Vue panel 读取 event model 并显示；browser 不发送网络请求；collector 和 incident runtime 在本章保持本地模型。

**API / 语法规则：**

使用 `Readonly<Record<string, string>>` 存 context，避免未审查对象直接进入 telemetry。

**文件结构：**

`models/telemetryEventModel.ts`、`models/telemetrySamplingModel.ts`、`tests/telemetrySamplingModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/telemetryEventModel.ts</span>
  </div>

```ts
export interface TelemetryEvent {
  readonly eventName: string;
  readonly source: TelemetrySource;
  readonly severity: TelemetrySeverity;
  readonly timestamp: number;
  readonly routeName: string;
  readonly releaseId: string;
  readonly context: Readonly<Record<string, string>>;
  readonly redacted: boolean;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/telemetrySamplingModel.test.ts</span>
  </div>

```ts
expect(shouldSampleTelemetryEvent(event, 0, 1).keep).toBe(true);
```
</div>

**逐行解释：**

`eventName` 命名 signal，`source` 说明 owner，`severity` 影响 sampling，`context` 必须是 string map，`redacted` 记录清洗状态。

**执行过程：**

调用 `createTelemetryEvent` 创建本地 event；sampling model 读取 severity；critical event bypass sampling；test 验证 keep 为 true。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

signal 变成 telemetry payload；redaction result 仍未完成；sampling decision keep；queue/dashboard/rollback 在后续小节接管；failure signal 是 unknown context 或 high severity 被丢弃。

**为什么得到这个结果：**

因为 high severity 的 incident evidence 不能被 sampling 随机丢掉。

**对比写法：**

`console.log` 只是一行输出；`TelemetryEvent` 才有 source、severity、release 和 context boundary。

**常见错误为什么错：**

把 console output 当 observability 会丢失 redaction、sampling、owner、dashboard 和 rollback evidence。

**与真实项目的关系：**

真实 collector 也需要 schema contract，否则 dashboard 无法稳定聚合。

**与当前学习主线的关系：**

它复用 Chapter 10 的 test evidence、Chapter 11 的 release evidence、Chapter 16 的 release gate。

**最终记忆模型：**

先定义 signal schema，再谈 collector。

<a id="section-9-2"></a>

### 9.2 Vue app-level error handler：app.config.errorHandler, reporting boundary and user fallback separation

**结论：**

`app.config.errorHandler` 是 centralized reporting boundary，不是 user-facing fallback UI。`errorTelemetryModel.ts` 只创建 redacted report record。

**本节解决的问题：**

本节解决“捕获错误”和“用户恢复”混在一起的问题。app handler 能记录错误，但 component subtree 的 fallback 仍要由 component boundary 或 UI state 负责。

**技术意义：**

错误报告与用户恢复分离后，report pipeline 不会把同一个 crashing subtree 再渲染一次。

**概念解释：**

`createErrorTelemetryRecord` 接收 unknown error，调用 `normalizeErrorMessage`，再用 `redactTelemetryValue` 清洗 message。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节只处理 Vue app-level report；component fallback 在 9.3，global browser error 在 9.4。

**Observability 机制证据链：**

signal 是 Vue runtime error；source 是 app handler；collector 是 `createErrorTelemetryRecord`；safe fields 是 redacted message、componentName、info、releaseId；email/token-like text 必须 masked；sampling 由 severity layer 决定；test 证明 redaction；collector delivery 仍 UNKNOWN。

**TypeScript / vue-tsc 编译期过程：**

`error: unknown` 强迫 normalize；TypeScript 不允许直接假设 error 是 `Error`，也不能证明生产 handler 已注册。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

Vue app handler 会接到 runtime error、component instance 和 info；本地 panel 只展示 model record，不真实注册 production collector。

**API / 语法规则：**

官方 Application API 中 `app.config.errorHandler` 是 app config hook；本章用 model 解释 reporting shape。

**文件结构：**

`models/errorTelemetryModel.ts`、`components/AppErrorHandlerPanel.vue`、`tests/errorTelemetryModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/errorTelemetryModel.ts</span>
  </div>

```ts
export function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/errorTelemetryModel.test.ts</span>
  </div>

```ts
expect(record.message).toContain("[redacted-email]");
expect(record.redacted).toBe(true);
```
</div>

**逐行解释：**

`instanceof Error` 处理真实 Error；string branch 处理 thrown string；fallback 避免 unsafe object serialization；test 验证 message 清洗。

**执行过程：**

error object 进入 normalize；message 进入 redaction；record 显示在 `AppErrorHandlerPanel.vue`；没有外部发送。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

error object 变成 telemetry payload；fallback state 未改变；redaction result 为 true；queue/dashboard 未接管；failure signal 是 raw sensitive message 出现在 record。

**为什么得到这个结果：**

因为 app-level handler只能报告错误，不能替 component 自动设计 recovery UI。

**对比写法：**

把 app handler 当 fallback UI 会让用户看到空白页；把 fallback state 放到 component boundary 更明确。

**常见错误为什么错：**

捕获错误但不报告，或报告错误但不给用户可用 fallback，都不是完整 recovery。

**与真实项目的关系：**

真实 app 要在 `main.ts` 注册 handler，并把 report 交给 collector；本章不做外部 collector。

**与当前学习主线的关系：**

它连接 Chapter 01 app boundary 与 Chapter 10 test evidence。

**最终记忆模型：**

App handler reports; component UI recovers。

<a id="section-9-3"></a>

### 9.3 Component error boundary：onErrorCaptured, propagation, fallback UI and infinite-loop risk

**结论：**

`onErrorCaptured` 是 component subtree recovery boundary。返回 false 可停止向上传播，但必须理解这会改变 app-level reporting path。

**本节解决的问题：**

本节解决“局部组件失败是否应该继续传到 app handler”的问题，也避免 fallback 再渲染同一个 crashing subtree。

**技术意义：**

component boundary 让错误影响限制在局部，同时保留 reportCreated 和 propagation evidence。

**概念解释：**

`createComponentFallbackState` 用 `stopPropagation` 生成 `stop-at-boundary` 或 `propagate-to-app`。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节覆盖 component boundary；app-level report 在 9.2，async fallback 在 9.5。

**Observability 机制证据链：**

signal 是 child component error；source 是 component subtree；collector 是 `useVueErrorBoundary`；safe fields 是 message、reportCreated、propagation；redaction 在 error record layer；test 证明 propagation；runtime loop avoidance 需要 component review。

**TypeScript / vue-tsc 编译期过程：**

`ComponentFallbackState` 固定 fallback shape；TypeScript 不会证明 fallback template 不会再次 crash。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

Vue lifecycle hook 捕获 descendant error；本地 demo button 只更新 state，不抛真实 runtime error。

**API / 语法规则：**

官方 lifecycle `onErrorCaptured` 可捕获 descendant errors；返回 false 会阻止继续传播。

**文件结构：**

`models/vueErrorBoundaryModel.ts`、`composables/useVueErrorBoundary.ts`、`components/ComponentErrorBoundaryDemo.vue`、`tests/vueErrorBoundaryModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/composables/useVueErrorBoundary.ts</span>
  </div>

```ts
function captureError(error: unknown, stopPropagation: boolean): void {
  fallbackState.value = createComponentFallbackState({
    message: normalizeErrorMessage(error),
    reportCreated: true,
    stopPropagation,
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/vueErrorBoundaryModel.test.ts</span>
  </div>

```ts
expect(state.hasError).toBe(true);
expect(shouldPropagateError(state)).toBe(false);
```
</div>

**逐行解释：**

`captureError` 把 unknown error normalize；更新 `fallbackState` 触发 Vue render；`stopPropagation` 映射到 propagation decision。

**执行过程：**

button 模拟 failure state；`ref` 写入 fallback；component render effect 读取 `fallbackState.hasError`；DOM 显示 fallback message。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

error object 变 fallback state；reportCreated true；propagation decision 可能 stop；failure signal 是 fallback 重复渲染 crash subtree。

**为什么得到这个结果：**

因为 local boundary 可以控制 subtree recovery，但不能自动保证全局 report。

**对比写法：**

只在 child component try/catch 中吞错会丢失 report；只依赖 app handler会缺少局部 fallback。

**常见错误为什么错：**

在 fallback 中继续渲染失败组件会形成 infinite-loop risk。

**与真实项目的关系：**

复杂 chart、editor、map、async widget 适合局部 boundary。

**与当前学习主线的关系：**

它连接 component lifecycle 与 release evidence。

**最终记忆模型：**

Boundary catches locally; report intentionally。

<a id="section-9-4"></a>

### 9.4 Global browser errors：window error, unhandledrejection and framework-vs-platform boundary

**结论：**

`window` 的 `error` 和 `unhandledrejection` 是 browser platform signals，不等同于 Vue component error handler。

**本节解决的问题：**

同步 script error、resource error、promise rejection、Vue render error 可能进入不同通道；只接一个 handler 会漏信号。

**技术意义：**

global listener 是 platform safety net；必须 cleanup，并且不能替代 Vue component recovery。

**概念解释：**

`normalizeGlobalErrorSignal` 把 `window-error` 与 `unhandled-rejection` 统一成 `GlobalErrorSignal`。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节覆盖 browser global layer；Vue-specific error boundary 仍由 9.2 和 9.3 负责。

**Observability 机制证据链：**

signal 从 browser window 或 promise rejection 来；source 是 browser platform；collector 是 global listener composable；safe fields 是 kind、message、source class；redaction 后续处理；test 验证 normalization；production listener registration 仍需 manual/browser evidence。

**TypeScript / vue-tsc 编译期过程：**

`GlobalErrorKind` 限制 kind；`PromiseRejectionEvent.reason` 仍是 runtime value，TypeScript 不能证明它安全。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

browser dispatches event；composable appends signal to `ref` array；component displays local examples。

**API / 语法规则：**

使用 `addEventListener("error", ...)` 和 `addEventListener("unhandledrejection", ...)`，并返回 cleanup function。

**文件结构：**

`models/globalErrorModel.ts`、`composables/useGlobalErrorListeners.ts`、`components/GlobalErrorListenerPanel.vue`、`tests/globalErrorModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/globalErrorModel.ts</span>
  </div>

```ts
return {
  kind: input.kind,
  message: input.message ?? reasonMessage ?? "Unknown global error",
  source: input.source ?? "browser-window",
  userVisible: input.kind === "window-error",
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/globalErrorModel.test.ts</span>
  </div>

```ts
expect(signal.kind).toBe("unhandled-rejection");
expect(signal.userVisible).toBe(false);
```
</div>

**逐行解释：**

model 优先使用 explicit message，再使用 rejection reason，最后使用 fallback；`userVisible` 区分 platform event class。

**执行过程：**

global listener 收到 event；normalizer 生成 signal；Vue `ref` array 更新；panel 显示 signal list。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

browser event 变 global signal；fallback state 未改变；failure signal 是 listener 不 cleanup 或 promise rejection 被忽略。

**为什么得到这个结果：**

Promise rejection 没有 attached rejection handler 时走 `unhandledrejection`，不是普通 synchronous error。

**对比写法：**

只在 Vue app handler 里处理错误会漏掉 platform-level rejection 和 resource-like failure。

**常见错误为什么错：**

把 `unhandledrejection` 当 Vue-only error 会错过 browser/platform boundary。

**与真实项目的关系：**

生产 app 通常同时需要 framework handler、global listener、API failure pipeline 和 collector integration。

**与当前学习主线的关系：**

它连接 Vue runtime 与 browser platform API。

**最终记忆模型：**

Vue catches framework errors; browser catches platform signals。

<a id="section-9-5"></a>

### 9.5 Async component recovery：loading state, timeout, error state, retry and user-facing recovery

**结论：**

Async component failure 需要 loading、timeout、error、retry 四类状态；retry 和 report 是不同动作。

**本节解决的问题：**

chunk load failure、network delay、deployment cache mismatch 和 timeout 都可能让 lazy UI 空白。如果没有 local recovery state，用户只能刷新页面。

**技术意义：**

async recovery 把用户体验和 telemetry 分开：UI 给 retry，report 给 release evidence。

**概念解释：**

`AsyncComponentState` 保存 phase、retryCount、timeoutMs、reportCreated；`retryAsyncComponent` 增加 retry count 并回到 loading。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节只建模 async component recovery，不故意 import missing file。

**Observability 机制证据链：**

signal 是 async load timeout/error；source 是 async component loader；collector 是 `asyncComponentRecoveryModel.ts`；safe fields 是 phase、retryCount、timeoutMs；sampling 可由 severity 决定；test 证明 transition；real chunk failure evidence 仍需 browser/deployment logs。

**TypeScript / vue-tsc 编译期过程：**

`AsyncComponentPhase` 限制状态；TypeScript 不会证明 chunk URL 可达或 cache 正确。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel button 更新 local state；Vue render updates phase badge；没有真实 dynamic import failure。

**API / 语法规则：**

Vue async components support loading/error/timeout options；本章使用 model 表达状态，不制造 missing import。

**文件结构：**

`models/asyncComponentRecoveryModel.ts`、`components/AsyncComponentRecoveryPanel.vue`、`tests/asyncComponentRecoveryModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/asyncComponentRecoveryModel.ts</span>
  </div>

```ts
export function retryAsyncComponent(state: AsyncComponentState): AsyncComponentState {
  return {
    ...state,
    phase: "loading",
    retryCount: state.retryCount + 1,
    reportCreated: false,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/asyncComponentRecoveryModel.test.ts</span>
  </div>

```ts
expect(retrying.phase).toBe("loading");
expect(retrying.retryCount).toBe(1);
expect(retrying.reportCreated).toBe(false);
```
</div>

**逐行解释：**

retry keeps previous state fields, switches phase to loading, increments retryCount, and clears reportCreated because a new attempt starts.

**执行过程：**

user clicks retry；state ref receives new object；component render reads `state.phase` and `state.retryCount`；badge updates。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

timeout/error signal becomes report state；retry resets report state；failure signal is no retry or endless retry without rate limit。

**为什么得到这个结果：**

Retry is recovery attempt, while the previous error report remains separate evidence.

**对比写法：**

Repeatedly reloading the entire page hides whether async chunk failure was network, cache or deployment related.

**常见错误为什么错：**

Intentionally importing a missing file to demo failure breaks the final app and is not safe learning evidence.

**与真实项目的关系：**

Route lazy chunks, dashboard widgets and large editors need user-visible recovery.

**与当前学习主线的关系：**

It connects Chapter 06 lazy routes and Chapter 11 deployment rollback.

**最终记忆模型：**

Async failure needs fallback plus retry plus report.

<a id="section-9-6"></a>

### 9.6 API failure telemetry：request id, endpoint class, status family, retry decision and privacy-safe error shape

**结论：**

API failure telemetry 应记录 endpoint class、status family、request id、retry decision，不记录 raw payload。

**本节解决的问题：**

本节解决 API error report 泄露敏感请求参数的问题。`apiFailureTelemetryModel.ts` 会去掉 query string，只保留 `/api/orders` 这种 endpoint label。

**技术意义：**

API 失败是 production health signal，但它必须 privacy-safe，且不能声称 backend 成功或失败原因已完整定位。

**概念解释：**

`classifyStatusFamily` 把 status 分成 network、4xx、5xx、unknown；`createApiFailureSignal` 决定 retry-later 或 do-not-retry。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 API failure signal；route telemetry 在 9.7，release gate 在 9.18。

**Observability 机制证据链：**

signal 是 failed API response 或 network failure；source 是 API client；collector 是 `createApiFailureSignal`；safe fields 是 endpointLabel、statusFamily、requestId；query 和 payload dropped；retry decision 由 status family 决定；test 验证 query stripping。

**TypeScript / vue-tsc 编译期过程：**

`StatusFamily` 与 `RetryDecision` 限制输出；TypeScript 不能证明 backend logs、request id correlation 或 retry safety。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel 选择 status，computed 生成 signal；没有真实 network request。

**API / 语法规则：**

只用 endpoint class，不用 full URL query 或 raw request body。

**文件结构：**

`models/apiFailureTelemetryModel.ts`、`components/ApiFailureTelemetryPanel.vue`、`tests/apiFailureTelemetryModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/apiFailureTelemetryModel.ts</span>
  </div>

```ts
const endpointLabel = input.endpointPath.split("?")[0] || "/api/unknown";
const retryDecision: RetryDecision =
  statusFamily === "5xx" || statusFamily === "network" ? "retry-later" : "do-not-retry";
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/apiFailureTelemetryModel.test.ts</span>
  </div>

```ts
expect(signal.endpointLabel).toBe("/api/orders");
expect(signal.retryDecision).toBe("retry-later");
```
</div>

**逐行解释：**

第一行去掉 query；第二行只对 network/5xx 建议 later retry；test 保证 telemetry 不保留 query。

**执行过程：**

status ref 改变；computed 创建 signal；Vue patch safe message；request id 只是 local sample。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

API failure 变 privacy-safe payload；redaction result 是 stripped endpoint；dashboard 可统计 failed API rate；failure signal 是 raw payload 出现在 telemetry。

**为什么得到这个结果：**

5xx/network 通常可 later retry；4xx 往往需要用户或业务修正，不应盲目重试。

**对比写法：**

发送完整 request body 到 telemetry collector 会扩大隐私和安全风险。

**常见错误为什么错：**

把 full endpoint query 当 harmless metric 会泄露 account、search 和 task context。

**与真实项目的关系：**

真实项目需要 request id 和 backend log correlation。

**与当前学习主线的关系：**

它连接 Chapter 09 的 API error normalization。

**最终记忆模型：**

API telemetry records class, not payload。

<a id="section-9-7"></a>

### 9.7 Route and navigation telemetry：route name, navigation duration, failure reason and user task context

**结论：**

Route telemetry 应记录 route name、redacted path、duration、failure reason 和 task context，不记录完整 query。

**本节解决的问题：**

route query 常包含 search、filter、account 或 privacy-sensitive value；直接上报 fullPath 会泄露用户上下文。

**技术意义：**

navigation duration 是用户任务体验信号，但不证明 API 数据加载成功。

**概念解释：**

`createRouteNavigationSignal` 使用 `fullPath.split("?")[0]` 生成 redactedPath，`isSlowNavigation` 用 budget 判断 slow route。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 Router navigation signal；Performance API timing 在 9.8–9.10。

**Observability 机制证据链：**

signal 是 navigation completion/failure；source 是 Router layer；collector 是 route telemetry model；safe fields 是 routeName、redactedPath、durationMs；query dropped；test 证明 stripping and slow budget。

**TypeScript / vue-tsc 编译期过程：**

`NavigationFailureReason` 限制 failure reason；TypeScript 不能证明 Router hook 实际注册。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel 修改 duration ref；computed signal 更新；no actual navigation hook runs。

**API / 语法规则：**

用 route name 和 redacted path；不要上传 full query。

**文件结构：**

`models/routeTelemetryModel.ts`、`components/RouteTelemetryPanel.vue`、`tests/routeTelemetryModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/routeTelemetryModel.ts</span>
  </div>

```ts
return {
  routeName: input.routeName,
  redactedPath: input.fullPath.split("?")[0],
  durationMs: input.durationMs,
  failureReason: input.failureReason,
  taskContext: input.taskContext,
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/routeTelemetryModel.test.ts</span>
  </div>

```ts
expect(signal.redactedPath).toBe("/orders/preview");
expect(isSlowNavigation(signal, 800)).toBe(true);
```
</div>

**逐行解释：**

model 保留 routeName 和 duration，删除 query；test 同时验证 privacy 和 performance budget。

**执行过程：**

duration input 写入 ref；computed 重新生成 signal；badge 显示 slow 状态。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

navigation signal 变 payload；redaction result 是 path without query；failure signal 是 full query 出现在 route telemetry。

**为什么得到这个结果：**

Route name 足够聚合，query 对 dashboard 价值低但泄露风险高。

**对比写法：**

上报 `/orders?customer=...` 比上报 `orders-list` 风险更高且难聚合。

**常见错误为什么错：**

frontend route success 不等于 API success，二者要分开记录。

**与真实项目的关系：**

真实 Router hooks 可在 afterEach 中记录 duration and failure reason。

**与当前学习主线的关系：**

它连接 Chapter 06 Router 与 Chapter 16 privacy boundary。

**最终记忆模型：**

Route telemetry keeps task signal, drops query detail。

<a id="section-9-8"></a>

### 9.8 User Timing API：performance.mark, performance.measure, local code-path measurement and cleanup

**结论：**

`performance.mark` 和 `performance.measure` 测量 local code path，不等于真实用户体验全貌。

**本节解决的问题：**

本节解决“我测了一个函数耗时，所以性能没问题”的误解。local measure 只证明本地路径时间。

**技术意义：**

User Timing 对调试具体 interaction useful，但 release health 仍需要 budget、field data 和 dashboard evidence。

**概念解释：**

`createSafeMarkName` 规范 mark name，`reviewMeasureDuration` 把 duration 分成 pass/warning/blocked。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节覆盖 User Timing；Navigation and Resource Timing 在后两节。

**Observability 机制证据链：**

signal 是 mark/measure entry；source 是 browser Performance API；collector 是 `usePerformanceMarks` 或 model；safe fields 是 mark name and duration；test proves threshold classification；field RUM remains external。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 可以检查 function signature；不能证明 mark 被实际调用或 duration 代表真实用户。

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

component 可触发 performance mark/measure；browser stores entries；model reviews duration；cleanup clears marks/measures。

**API / 语法规则：**

使用 `performance.mark(name)`、`performance.measure(name, start, end)`，并清理 chapter marks。

**文件结构：**

`models/performanceMarkModel.ts`、`composables/usePerformanceMarks.ts`、`components/PerformanceMarksPanel.vue`、`tests/performanceMarkModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/performanceMarkModel.ts</span>
  </div>

```ts
export function createSafeMarkName(featureName: string, phase: string): string {
  const safeFeature = featureName.replace(/[^a-z0-9-]/giu, "-").toLowerCase();
  const safePhase = phase.replace(/[^a-z0-9-]/giu, "-").toLowerCase();

  return `chapter-17:${safeFeature}:${safePhase}`;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/performanceMarkModel.test.ts</span>
  </div>

```ts
expect(reviewMeasureDuration("measure", 180).status).toBe("warning");
expect(reviewMeasureDuration("measure", 360).status).toBe("blocked");
```
</div>

**逐行解释：**

mark name 只允许 safe characters；duration review 使用 thresholds；tests 锁定边界。

**执行过程：**

mark start/end；measure duration；Vue stores review in ref；panel displays status。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

measurement entry 变 review payload；dashboard gate later consumes blocked status；failure signal 是 duration over budget or stale marks。

**为什么得到这个结果：**

Local mark measures code region, not network, rendering, field device distribution or user-perceived interaction fully。

**对比写法：**

Using Date timestamps manually gives less standardized browser timeline evidence。

**常见错误为什么错：**

Treating local measure as RUM ignores device, network and user population differences。

**与真实项目的关系：**

Use user timing for key interactions and correlate with field metrics.

**与当前学习主线的关系：**

It extends Chapter 11 performance evidence.

**最终记忆模型：**

User Timing measures a path, not the whole user experience.

<a id="section-9-9"></a>

### 9.9 Navigation Timing：navigation type, load milestones, reload/back-forward evidence and bfcache notes

**结论：**

Navigation Timing describes document navigation milestones such as interactive and load completion.

**本节解决的问题：**

本节区分 page navigation evidence 与 route navigation evidence。SPA route telemetry 不等于 document load telemetry。

**技术意义：**

Navigation type helps identify reload/back-forward behavior, but local sample is not field RUM.

**概念解释：**

`reviewNavigationTiming` computes interactiveMs and completeMs from a `NavigationTimingSample`.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节只覆盖 document navigation; route navigation 在 9.7。

**Observability 机制证据链：**

signal 是 navigation timing entry；source 是 browser Performance API；collector 是 `navigationTimingModel.ts`；safe fields are type and milestone durations；test verifies duration math；field evidence remains UNKNOWN。

**TypeScript / vue-tsc 编译期过程：**

`NavigationTimingSample` checks shape; TypeScript cannot prove browser provided a full entry or bfcache behavior.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

browser creates navigation entry; model reviews sample; panel displays local sample only.

**API / 语法规则：**

Use navigation timing entries for document-level page load analysis.

**文件结构：**

`models/navigationTimingModel.ts`、`components/NavigationTimingPanel.vue`、`tests/navigationTimingModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/navigationTimingModel.ts</span>
  </div>

```ts
const interactiveMs = Math.max(0, sample.domInteractive - sample.startTime);
const completeMs = Math.max(0, sample.loadEventEnd - sample.startTime);
const status =
  completeMs > 3000 ? "blocked" : completeMs > 1800 ? "warning" : "pass";
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/navigationTimingModel.test.ts</span>
  </div>

```ts
expect(review.interactiveMs).toBe(800);
expect(review.completeMs).toBe(2000);
expect(review.status).toBe("warning");
```
</div>

**逐行解释：**

duration uses startTime baseline; status thresholds turn timing into release signal; test fixes expected math.

**执行过程：**

sample object enters model; computed durations return; panel renders values.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

navigation entry becomes timing review; dashboard may consume blocked status; failure signal is local-only data claimed as field evidence.

**为什么得到这个结果：**

Document navigation has distinct milestones from SPA route transitions.

**对比写法：**

Using route duration to explain reload performance mixes two different layers.

**常见错误为什么错：**

Lab navigation timing on one machine cannot represent user population.

**与真实项目的关系：**

Use Navigation Timing with field collection and release dashboards.

**与当前学习主线的关系：**

It connects Vite build/deployment evidence to browser performance.

**最终记忆模型：**

Navigation Timing measures the document load path.

<a id="section-9-10"></a>

### 9.10 Resource Timing：resource duration, initiator type, cross-origin timing limits and bundle asset review

**结论：**

Resource Timing describes fetched resources and initiator types, but cross-origin detail can be limited.

**本节解决的问题：**

本节解决 asset timing 与 app code timing 混淆的问题，也避免 resource URL query 泄露。

**技术意义：**

bundle asset review needs resource label, initiator type, duration and cross-origin limitation flag.

**概念解释：**

`reviewResourceTiming` strips query, computes response duration, and classifies pass/warning/blocked.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 resource entries；Core Web Vitals user signals 在 9.11。

**Observability 机制证据链：**

signal 是 resource timing entry；source 是 browser Performance API；collector 是 resource model；safe fields are stripped resource label, initiator, duration, crossOriginLimited; tests verify query stripping.

**TypeScript / vue-tsc 编译期过程：**

`ResourceTimingSample` shape is checked; TypeScript cannot prove browser exposes full cross-origin timing.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

browser records resource timing; model reviews sample; panel renders local sample.

**API / 语法规则：**

Use resource name without query and record cross-origin limitation.

**文件结构：**

`models/resourceTimingModel.ts`、`components/ResourceTimingPanel.vue`、`tests/resourceTimingModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/resourceTimingModel.ts</span>
  </div>

```ts
const resourceLabel = sample.name.split("?")[0];
const durationMs = Math.max(0, sample.responseEnd - sample.startTime);
const status =
  durationMs > 1200 ? "blocked" : durationMs > 600 ? "warning" : "pass";
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/resourceTimingModel.test.ts</span>
  </div>

```ts
expect(review.resourceLabel).toBe("/assets/app.js");
expect(review.status).toBe("warning");
```
</div>

**逐行解释：**

query stripped first; duration computed from entry timing; threshold maps duration to status.

**执行过程：**

resource entry enters model; review object displays resource label and duration.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

resource entry becomes asset review; redaction removes query; failure signal is slow asset or leaked query.

**为什么得到这个结果：**

Resource URLs can include cache or user context; label must be safe before telemetry.

**对比写法：**

Full resource URL in telemetry makes asset dashboard harder to aggregate and easier to leak.

**常见错误为什么错：**

Ignoring cross-origin timing limitations can make missing values look like fast resources.

**与真实项目的关系：**

Bundle split and CDN assets need Resource Timing plus server headers.

**与当前学习主线的关系：**

It connects Chapter 11 bundle performance and deployment evidence.

**最终记忆模型：**

Resource Timing measures assets, with privacy and origin limits.

<a id="section-9-11"></a>

### 9.11 Core Web Vitals budget：LCP, CLS, INP, lab-vs-field boundary and release budget model

**结论：**

LCP、CLS、INP are user-experience signals, but local model values are not field RUM data.

**本节解决的问题：**

本节解决把 lab budget、local sample 和 real-user field metrics 混为一谈的问题。

**技术意义：**

Budget model can block local release, but field Core Web Vitals need real user data.

**概念解释：**

`reviewWebVital` maps LCP/CLS/INP values to pass/warning/blocked and keeps `fieldData` explicit.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节只建模 budgets，不安装 `web-vitals` package。

**Observability 机制证据链：**

signal is vital sample; source is lab model or field RUM; collector is `webVitalsBudgetModel.ts`; safe fields are name/value/status/fieldData; test verifies threshold edges; failure signal is blocked budget or fieldData falsely claimed.

**TypeScript / vue-tsc 编译期过程：**

`WebVitalName` restricts metrics to LCP/CLS/INP; TypeScript cannot prove real-user measurement.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel selects vital and value; computed review updates; no RUM collection occurs.

**API / 语法规则：**

Use thresholds as release model; use external field data before claiming RUM.

**文件结构：**

`models/webVitalsBudgetModel.ts`、`components/WebVitalsBudgetPanel.vue`、`tests/webVitalsBudgetModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/webVitalsBudgetModel.ts</span>
  </div>

```ts
export const webVitalBudgets: ReadonlyArray<WebVitalBudget> = [
  { name: "LCP", warningThreshold: 2500, blockedThreshold: 4000 },
  { name: "CLS", warningThreshold: 0.1, blockedThreshold: 0.25 },
  { name: "INP", warningThreshold: 200, blockedThreshold: 500 },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/webVitalsBudgetModel.test.ts</span>
  </div>

```ts
expect(reviewWebVital("LCP", 2400).status).toBe("pass");
expect(reviewWebVital("LCP", 2500).status).toBe("warning");
expect(reviewWebVital("LCP", 4000).status).toBe("blocked");
```
</div>

**逐行解释：**

budget array defines local thresholds; test verifies exact edges; `fieldData` remains explicit.

**执行过程：**

input value changes; computed review returns status; dashboard can later count blocked vitals.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

vital sample becomes budget review; release dashboard consumes blocked count; failure signal is blocked status or false RUM claim.

**为什么得到这个结果：**

The same metric name can come from local model, lab run, or field RUM; source must be explicit.

**对比写法：**

Installing a package without collector and privacy strategy does not create meaningful field data.

**常见错误为什么错：**

Lab Core Web Vitals values are not field Core Web Vitals values.

**与真实项目的关系：**

Real dashboards need percentile, route grouping, device class and release id.

**与当前学习主线的关系：**

It extends Chapter 11 production performance.

**最终记忆模型：**

Vitals are user signals; source decides evidence strength.

<a id="section-9-12"></a>

### 9.12 Telemetry event schema：event name, severity, timestamp, route, release, session-safe context and unknown fields

**结论：**

Telemetry schema 必须限制字段。`hasUnknownTelemetryFields` 用 allowlist 阻止未审查 context 扩散。

**本节解决的问题：**

本节解决 telemetry context 任意扩张的问题；unknown fields 往往是 PII、debug object 或不稳定 schema 的入口。

**技术意义：**

Schema gate 让 dashboards、sampling、queue 和 incident review 能稳定消费事件。

**概念解释：**

`TelemetryEvent` 把 eventName、source、severity、timestamp、routeName、releaseId、context、redacted 固定下来。

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 schema；redaction 在 9.13，sampling 在 9.14。

**Observability 机制证据链：**

signal becomes `TelemetryEvent`; source owns category; collector receives typed payload; safe fields are allowlisted context keys; unknown fields fail review; TypeScript helps shape; runtime cannot prove semantic safety.

**TypeScript / vue-tsc 编译期过程：**

`TelemetryEvent` fields are required; context values are strings; TypeScript cannot know whether a field is safe unless model checks allowlist.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel or model creates event; downstream sampling reads severity; queue stores event if kept.

**API / 语法规则：**

Use typed event creation instead of ad-hoc object literals.

**文件结构：**

`models/telemetryEventModel.ts`、`components/SamplingRateLimitPanel.vue`、`tests/telemetrySamplingModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/telemetryEventModel.ts</span>
  </div>

```ts
export function hasUnknownTelemetryFields(
  event: TelemetryEvent,
  allowedFields: ReadonlyArray<string>,
): boolean {
  const allowed = new Set(allowedFields);

  return Object.keys(event.context).some((field) => !allowed.has(field));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/SamplingRateLimitPanel.vue</span>
  </div>

```vue
const event = createTelemetryEvent({
  eventName: "panel-opened",
  source: "performance",
  severity: "info",
  routeName: "chapter-17",
  releaseId: "release-17-local",
});
```
</div>

**逐行解释：**

allowlist set 定义可保留字段；`some` 找到 unknown context；component 创建 event 时只使用 safe fields。

**执行过程：**

event object 创建；unknown-field gate 可在 redaction 前阻止 payload；sampling 再决定 keep/drop。

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

raw signal 变 typed payload；unknown context 是 failure signal；redaction 和 sampling 接续处理。

**为什么得到这个结果：**

没有 schema 的 telemetry 很快变成不可搜索且不可审计的数据湖。

**对比写法：**

直接 spread arbitrary object into telemetry context 会绕过 privacy review。

**常见错误为什么错：**

未知字段不是灵活性，而是未审查的数据出口。

**与真实项目的关系：**

真实 collector 需要 event registry 和 schema versioning。

**与当前学习主线的关系：**

It extends Chapter 16 privacy evidence.

**最终记忆模型：**

Schema before signal volume.

<a id="section-9-13"></a>

### 9.13 Telemetry redaction and privacy：PII removal, token masking, URL query stripping and safe error messages

**结论：**

Redaction must happen before persistence, queueing, or sending. `telemetryRedactionModel.ts` masks email/token-like values and strips query strings.

**本节解决的问题：**

Telemetry often leaks more than product UI: route query, error message, API context and stack context can expose sensitive values.

**技术意义：**

Redaction is observability safety boundary; it is not optional logging polish.

**概念解释：**

`redactTelemetryValue` applies email masking, token-like masking and query stripping. Tests use inert example values only.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 redaction；source-map stack exposure 在 9.17。

**Observability 机制证据链：**

signal contains sensitive context; source is error/API/route; collector is redaction model; safe fields are masked values; sampling and queue receive only redacted payload; tests prove masking; failure signal is raw token/email in output.

**TypeScript / vue-tsc 编译期过程：**

TypeScript checks `Record<string,string>` but cannot infer a string contains PII.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

TelemetryRedactionPanel renders redacted local result; no external collector receives data.

**API / 语法规则：**

Run redaction before queue and beacon model.

**文件结构：**

`models/telemetryRedactionModel.ts`、`components/TelemetryRedactionPanel.vue`、`tests/telemetryRedactionModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/telemetryRedactionModel.ts</span>
  </div>

```ts
export function redactTelemetryValue(value: string): string {
  return value
    .replace(emailPattern, "[redacted-email]")
    .replace(tokenPattern, "$1=[redacted]")
    .replace(queryPattern, "?[redacted]");
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/telemetryRedactionModel.test.ts</span>
  </div>

```ts
expect(redacted).toContain("[redacted-email]");
expect(redacted).toContain("token=[redacted]");
```
</div>

**逐行解释：**

first replace masks email-like text; second masks token-like query part; third strips remaining query.

**执行过程：**

context enters redaction; changed values add field names to redactedFields; panel displays redacted path.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

raw context becomes redacted context; failure signal is unmasked contact or secret-like value.

**为什么得到这个结果：**

Telemetry has wider retention and access than UI, so privacy boundary must run early.

**对比写法：**

Redacting after collector ingestion is too late for client-side privacy control.

**常见错误为什么错：**

Sending raw stack or query context can expose user data even if app UI is safe.

**与真实项目的关系：**

Privacy review should define allowed context keys and masking rules.

**与当前学习主线的关系：**

It continues Chapter 16 privacy boundary.

**最终记忆模型：**

Redact before retain.

<a id="section-9-14"></a>

### 9.14 Sampling and rate limiting：noise control, high-severity always-on, low-severity sampling and burst protection

**结论：**

Sampling controls noise, but high-severity events should bypass sampling. Rate limiting prevents bursts from overwhelming local queue or collector.

**本节解决的问题：**

本节解决“全量上报一切”和“随机丢掉关键事故”两个极端。

**技术意义：**

Sampling is reliability and cost control; it must be severity-aware.

**概念解释：**

`shouldSampleTelemetryEvent` keeps `error` and `critical` events, then applies sample slot logic to lower severity events.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 sampling and rate limiting；queue policy 在 9.16。

**Observability 机制证据链：**

signal enters sampling; source severity controls decision; collector receives kept event; safe fields already redacted; tests verify critical kept and bursts limited; failure signal is critical event dropped.

**TypeScript / vue-tsc 编译期过程：**

`TelemetrySeverity` ensures severity values; TypeScript cannot prove production sample rate is correct.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel changes sequenceNumber; computed decision updates keep/drop badge.

**API / 语法规则：**

Use severity-aware sampling and explicit rate limit window.

**文件结构：**

`models/telemetrySamplingModel.ts`、`components/SamplingRateLimitPanel.vue`、`composables/useTelemetrySampling.ts`、`tests/telemetrySamplingModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/telemetrySamplingModel.ts</span>
  </div>

```ts
if (alwaysKeepSeverities.has(event.severity)) {
  return {
    keep: true,
    reason: "High severity events bypass sampling.",
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/telemetrySamplingModel.test.ts</span>
  </div>

```ts
expect(shouldSampleTelemetryEvent(event, 0, 1).keep).toBe(true);
expect(isRateLimited(10, 10)).toBe(true);
```
</div>

**逐行解释：**

critical/error branch returns keep before sampleRate; rate limit helper blocks bursts at limit.

**执行过程：**

event severity enters model; high severity bypasses sampling; low severity uses sequence slot.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

redacted payload gets keep/drop decision; queue receives only kept event; failure signal is high severity sampled away.

**为什么得到这个结果：**

High severity events are rare but important; sampling them damages incident evidence.

**对比写法：**

One global sample rate for every event treats incident evidence like debug noise.

**常见错误为什么错：**

Sending every low-value event with no rate limit can create telemetry outages.

**与真实项目的关系：**

Production sampling policy must be owned and documented.

**与当前学习主线的关系：**

It connects telemetry to release health gates.

**最终记忆模型：**

Sample noise, not incidents.

<a id="section-9-15"></a>

### 9.15 Beacon / visibility flush boundary：sendBeacon model, keepalive alternative, page lifecycle and delivery UNKNOWN

**结论：**

`sendBeacon` is useful for page-leave diagnostics, but queued does not mean delivered.

**本节解决的问题：**

本节解决“sendBeacon 返回 true 就代表服务器收到”的误解。本章只做 local flush decision，不发送网络请求。

**技术意义：**

Page visibility and leave-time flush need small payloads, delivery uncertainty, and fallback plan.

**概念解释：**

`decideBeaconFlush` uses payload size and pageHidden to choose send-beacon, fetch-keepalive or drop.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 flush model；delivery verification remains UNKNOWN without collector response.

**Observability 机制证据链：**

signal is queued telemetry; source is page visibility; collector is beacon model; safe fields are payload size and method; deliveryVerified remains false; test checks large payload drop.

**TypeScript / vue-tsc 编译期过程：**

`FlushMethod` limits decisions; TypeScript cannot prove browser sent or server received data.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel toggles hidden state; computed decision updates; no `navigator.sendBeacon` call is made.

**API / 语法规则：**

Use `sendBeacon` concept for small fire-and-forget payloads only; keep delivery UNKNOWN.

**文件结构：**

`models/beaconFlushModel.ts`、`components/BeaconFlushPanel.vue`、`composables/useVisibilityFlush.ts`、`tests/beaconFlushModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/beaconFlushModel.ts</span>
  </div>

```ts
if (payloadBytes > 64000) {
  return {
    method: "drop",
    queued: false,
    deliveryVerified: false,
    reason: "Payload is too large for a page-leave beacon model.",
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/beaconFlushModel.test.ts</span>
  </div>

```ts
expect(decision.method).toBe("send-beacon");
expect(decision.deliveryVerified).toBe(false);
```
</div>

**逐行解释：**

large payload branch drops before queueing; all decisions keep deliveryVerified false because local code cannot prove server receipt.

**执行过程：**

payloadBytes ref changes; decision recomputes; panel displays method and delivery flag.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

queue state proposes flush method; delivery stays UNKNOWN; failure signal is claimed delivery without collector evidence.

**为什么得到这个结果：**

Browser API can queue a beacon but does not expose production collector acceptance.

**对比写法：**

Replacing API client with beacon is wrong; beacon is not a general request/response workflow.

**常见错误为什么错：**

Assuming sendBeacon success means server received event overclaims evidence.

**与真实项目的关系：**

Collectors need receipt metrics and drop monitoring.

**与当前学习主线的关系：**

It extends Chapter 11 unload/deployment evidence boundaries.

**最终记忆模型：**

Beacon queued is not beacon delivered.

<a id="section-9-16"></a>

### 9.16 Offline telemetry queue：local queue, retry window, drop policy and storage/privacy boundary

**结论：**

Offline queue must have max length and drop policy. This chapter uses memory-only queue, not browser persistent storage.

**本节解决的问题：**

本节解决 telemetry queue 无限增长、隐私数据持久化、低价值事件挤掉 incident signal 的问题。

**技术意义：**

Queueing improves resilience but creates privacy and storage risk.

**概念解释：**

`enqueueTelemetryEvent` appends event and drops oldest when `maxLength` is exceeded.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节只用 memory queue；persistent storage needs privacy review and is not used here.

**Observability 机制证据链：**

signal is sampled redacted event; source is telemetry pipeline; collector is memory queue; safe fields are typed event fields; queue state tracks droppedCount; test verifies oldest drop; failure signal is unbounded queue.

**TypeScript / vue-tsc 编译期过程：**

`TelemetryQueueState` fixes queue shape; TypeScript cannot prove memory pressure or persistence risk.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

button enqueues local event; Vue ref updates queueState; no browser storage or network used.

**API / 语法规则：**

Use bounded queue and explicit drain.

**文件结构：**

`models/offlineTelemetryQueueModel.ts`、`components/OfflineTelemetryQueuePanel.vue`、`composables/useTelemetryQueue.ts`、`tests/offlineTelemetryQueueModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/offlineTelemetryQueueModel.ts</span>
  </div>

```ts
return {
  ...state,
  events: nextEvents.slice(1),
  droppedCount: state.droppedCount + 1,
  dropReason: "Queue limit reached; oldest event dropped.",
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/offlineTelemetryQueueModel.test.ts</span>
  </div>

```ts
expect(third.events.map((event) => event.eventName)).toEqual(["event-2", "event-3"]);
expect(third.droppedCount).toBe(1);
```
</div>

**逐行解释：**

when queue exceeds maxLength, model removes first event, increments droppedCount and records dropReason.

**执行过程：**

enqueue button creates event; composable updates ref; panel shows queue length and dropped count.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

kept event enters queue; queue may drop oldest; failure signal is dropped critical event or unbounded storage.

**为什么得到这个结果：**

Bounded queue prevents memory and privacy growth.

**对比写法：**

Persistent queue without privacy review changes data retention guarantees.

**常见错误为什么错：**

Writing telemetry queue to persistent browser storage can retain sensitive context beyond user session.

**与真实项目的关系：**

Production offline queue needs retention, encryption, consent and drain guarantees.

**与当前学习主线的关系：**

It extends Chapter 16 client storage boundary.

**最终记忆模型：**

Queue with limits, or do not queue.

<a id="section-9-17"></a>

### 9.17 Source maps and stack trace boundary：debuggability, source exposure risk, release id and deployment evidence

**结论：**

Source maps improve debugging but can expose source if deployed publicly without review.

**本节解决的问题：**

本节解决“打开 source maps 就等于更好 observability”的误解。debuggability and source exposure must be balanced.

**技术意义：**

Stack trace usefulness depends on release id and private source-map handling; local config alone does not prove deployment safety.

**概念解释：**

`reviewSourceMapBoundary` returns upload-private、disable-public-map or requires-review based on enabled/public/release flags.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 source map boundary；Vite build source map config and deployment policy require external verification.

**Observability 机制证据链：**

signal is stack trace; source is error record; collector needs source map and release id; safe fields are release id and private upload decision; test verifies public map requires review; failure signal is public map without evidence.

**TypeScript / vue-tsc 编译期过程：**

TypeScript emits source relation but cannot prove source map storage safety.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel displays local decision; no source map upload or deployment check occurs.

**API / 语法规则：**

Use release id and private upload path before claiming safe source map debugging.

**文件结构：**

`models/sourceMapBoundaryModel.ts`、`components/SourceMapBoundaryPanel.vue`、`tests/sourceMapBoundaryModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/sourceMapBoundaryModel.ts</span>
  </div>

```ts
if (input.sourceMapEnabled && input.publicAsset) {
  return {
    ...input,
    decision: "requires-review",
    reason: "Public source maps need deployment and exposure review.",
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/sourceMapBoundaryModel.test.ts</span>
  </div>

```ts
expect(review.decision).toBe("requires-review");
```
</div>

**逐行解释：**

enabled + public asset branch blocks automatic trust; test ensures public maps need review.

**执行过程：**

review input changes; computed review updates decision; no deployment config is changed.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

stack trace need becomes source-map decision; failure signal is public map without policy; rollback is disable public map or upload privately.

**为什么得到这个结果：**

Source maps can improve trace readability while exposing original source.

**对比写法：**

Claiming source-map safety from local build config ignores hosting and collector policy.

**常见错误为什么错：**

Source maps are deployment artifacts, not just TypeScript tooling.

**与真实项目的关系：**

Production needs release id, private upload, retention and access control.

**与当前学习主线的关系：**

It connects Chapter 11 build evidence and Chapter 16 security boundary.

**最终记忆模型：**

Debug value must be balanced with source exposure.

<a id="section-9-18"></a>

### 9.18 Release health dashboard：error rate, failed API rate, performance budget, incident status and rollback gate

**结论：**

Release health combines error rate, failed API rate, blocked vitals and open incidents into a gate.

**本节解决的问题：**

本节解决“build passed 所以可以发布”的误解。build success does not cover runtime error rate or incident state.

**技术意义：**

Release gate turns telemetry into decision: allowed, blocked, rollback review, or incident escalation.

**概念解释：**

`reviewReleaseHealth` blocks release when errorRatePercent >= 1, failedApiRatePercent >= 2, blockedVitalCount > 0, or openIncidentCount > 0.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 local dashboard gate; real dashboard and alert rules remain UNKNOWN.

**Observability 机制证据链：**

signal comes from aggregated telemetry; source is release dashboard; collector is `releaseHealthModel.ts`; safe fields are rates and counts; tests verify block/pass; rollback decision follows 9.19.

**TypeScript / vue-tsc 编译期过程：**

`ReleaseHealthSignal` checks numeric shape; TypeScript cannot prove thresholds are product-correct or dashboard real.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel renders local review; no production dashboard exists.

**API / 语法规则：**

Use explicit thresholds and reason text.

**文件结构：**

`models/releaseHealthModel.ts`、`components/ReleaseHealthDashboard.vue`、`composables/useReleaseHealthGate.ts`、`tests/releaseHealthModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/releaseHealthModel.ts</span>
  </div>

```ts
const releaseAllowed =
  signal.errorRatePercent < 1 &&
  signal.failedApiRatePercent < 2 &&
  signal.blockedVitalCount === 0 &&
  signal.openIncidentCount === 0;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/releaseHealthModel.test.ts</span>
  </div>

```ts
expect(review.releaseAllowed).toBe(false);
```
</div>

**逐行解释：**

all thresholds must pass; one blocked signal makes releaseAllowed false; test proves high error rate blocks.

**执行过程：**

release signal enters review; boolean gate returns; dashboard badge changes.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

aggregated telemetry becomes dashboard gate; failure signal is blocked release; rollback path comes from incident model.

**为什么得到这个结果：**

Release health is multi-signal; build alone is insufficient.

**对比写法：**

Only checking `npm run build` ignores runtime user impact.

**常见错误为什么错：**

Claiming monitoring exists without dashboard and alert evidence overclaims.

**与真实项目的关系：**

Production release needs thresholds, owners, alerting and rollback authority.

**与当前学习主线的关系：**

It extends Chapter 11 deployment gate.

**最终记忆模型：**

Release health is runtime evidence, not build output.

<a id="section-9-19"></a>

### 9.19 Incident response workflow：severity, owner, timeline, mitigation, rollback and post-incident review

**结论：**

Incident response needs severity, owner, timeline, mitigation, rollback decision and post-incident action items.

**本节解决的问题：**

本节解决“事故已解决”没有 owner、timeline、rollback or mitigation evidence 的问题。

**技术意义：**

Incident evidence transforms observability signals into operational decisions.

**概念解释：**

`classifyIncidentSeverity` grades impact; `decideRollback` recommends rollback; `isPostIncidentReviewComplete` checks review completeness.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 incident runtime; real on-call process remains UNKNOWN.

**Observability 机制证据链：**

signal is release health failure; source is dashboard/incident; collector is incident model; safe fields are severity, owner, action evidence; rollback decision uses severity and mitigation; tests prove severity and rollback decisions.

**TypeScript / vue-tsc 编译期过程：**

`IncidentSeverity` values are typed; TypeScript cannot prove incident resolved.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

panel computes severity and rollback; post-incident panel displays action item; no real on-call workflow exists.

**API / 语法规则：**

Use explicit severity and rollback decision model.

**文件结构：**

`models/incidentSeverityModel.ts`、`models/rollbackDecisionModel.ts`、`models/postIncidentReviewModel.ts`、`components/IncidentRollbackPanel.vue`、`components/PostIncidentReviewPanel.vue`、`tests/incidentSeverityModel.test.ts`、`tests/rollbackDecisionModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/rollbackDecisionModel.ts</span>
  </div>

```ts
const severe = input.severity === "sev1" || input.severity === "sev2";
const recommended = input.releaseHealthBlocked && (severe || !input.mitigationAvailable);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/rollbackDecisionModel.test.ts</span>
  </div>

```ts
expect(decision.recommended).toBe(true);
expect(decision.owner).toBe("release-owner");
```
</div>

**逐行解释：**

severity and releaseHealthBlocked combine into rollback recommendation; owner changes to release-owner when rollback is recommended.

**执行过程：**

incident signal classifies severity; rollback model evaluates mitigation; panel renders recommendation.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

dashboard failure becomes incident severity; rollback path becomes recommended; failure signal is no owner or no mitigation.

**为什么得到这个结果：**

Severe blocked release with no mitigation needs fast rollback path.

**对比写法：**

Marking incident resolved because UI appears better ignores evidence and action items.

**常见错误为什么错：**

Incident closure without timeline and action items prevents learning.

**与真实项目的关系：**

On-call teams need severity definitions, escalation, rollback drills and blameless review.

**与当前学习主线的关系：**

It connects Chapter 14 migration release evidence and Chapter 16 release gates.

**最终记忆模型：**

Incident resolution requires evidence, not optimism.

<a id="section-9-20"></a>

### 9.20 Chapter integration：how Chapter 17 connects tests, production, security, accessibility and migration

**结论：**

Chapter 17 connects prior chapters: tests prove model behavior, production build proves bundle output, security/privacy controls telemetry, accessibility affects fallback usability, migration requires release evidence.

**本节解决的问题：**

本节解决 observability 被当成 isolated SDK install 的问题。

**技术意义：**

Root shell appends Chapter 17 after Chapter 16, preserving all previous chapters and making observability another local evidence layer.

**概念解释：**

`ObservabilityIncidentChapterApp.vue` imports panels; `App.vue` adds one import and one render block.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

本节处理 integration boundary only; no previous chapter guide is rewritten.

**Observability 机制证据链：**

signal source is Chapter 17 app; collector is root shell; safe integration is static component import; tests/typecheck/build prove local integration; failure signal is editing unrelated chapters.

**TypeScript / vue-tsc 编译期过程：**

Static import path is checked; Vue template component use is checked by SFC compiler.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

root app renders Chapter 16 then divider then Chapter 17; browser displays local panels.

**API / 语法规则：**

Use existing divider pattern and append only.

**文件结构：**

`src/learning/vue/chapter-17-observability-incident/ObservabilityIncidentChapterApp.vue` and `src/learning/vue/chapter-01-application-boundary/App.vue`.

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-01-application-boundary/App.vue</span>
  </div>

```vue
<SecurityBoundaryChapterApp />

<div class="chapter-divider" role="separator"></div>

<ObservabilityIncidentChapterApp />
```
</div>

**逐行解释：**

Chapter 16 stays rendered; divider preserves shell style; Chapter 17 is appended without removing prior panels.

**执行过程：**

Vite imports SFC; Vue renders root tree; Chapter 17 subtree mounts.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

integration signal becomes renderable chapter panel; validation commands prove compile/build; failure signal is root shell breakage.

**为什么得到这个结果：**

Static shell integration is small and reviewable.

**对比写法：**

Creating a separate app would hide how Chapter 17 relates to prior learning panels.

**常见错误为什么错：**

Installing an SDK without understanding schema, redaction and release gates is not observability.

**与真实项目的关系：**

Observability should integrate into the existing app lifecycle and release process.

**与当前学习主线的关系：**

It connects Chapter 09–16 into a production evidence chain.

**最终记忆模型：**

Observability is a layer across the app, not a side project.

<a id="section-9-21"></a>

### 9.21 Final integration：vue-observability-incident-lab 如何形成 observability evidence workspace

**结论：**

`vue-observability-incident-lab` forms a local evidence workspace: signals are modeled, sensitive context is redacted, events are sampled/queued, dashboards gate release, incidents produce rollback and review records.

**本节解决的问题：**

本节解决只写 panels 没有 evidence chain 的问题。

**技术意义：**

Final workspace shows how local Vue code can teach observability while not overclaiming production monitoring.

**概念解释：**

The chapter app composes error, async, global, API, route, performance, redaction, sampling, queue, source-map, release and incident panels.

**边界：Vue error handler、component error boundary、browser global error、unhandled rejection、async component fallback、API failure signal、route telemetry、Performance API、User Timing、Navigation Timing、Resource Timing、Core Web Vitals、telemetry schema、redaction、sampling、beacon flush、offline queue、source map、release health、incident rollback：**

This final integration still does not send telemetry or claim production monitoring.

**Observability 机制证据链：**

signals enter local models; panels render safe state; tests assert model behavior; scans enforce no vendor secret/logging sink; release dashboard and incident model form final evidence.

**TypeScript / vue-tsc 编译期过程：**

All imports, union types and SFC templates are checked by `vue-tsc`; delivery and RUM remain external.

**Vue / Browser / API / Telemetry Collector / Incident Runtime 运行时过程：**

Vue renders panels; browser APIs are represented by safe local models; collector/incident runtime remains conceptual.

**API / 语法规则：**

Use local typed models, no real endpoint, no vendor SDK, no external send.

**文件结构：**

`src/learning/vue/chapter-17-observability-incident/`.

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/ObservabilityIncidentChapterApp.vue</span>
  </div>

```vue
<AppErrorHandlerPanel />
<ComponentErrorBoundaryDemo />
<GlobalErrorListenerPanel />
<PerformanceMarksPanel />
<ReleaseHealthDashboard />
<IncidentRollbackPanel />
<PostIncidentReviewPanel />
```
</div>

**逐行解释：**

The final app starts with errors, moves through performance and telemetry controls, then ends with release and incident evidence.

**执行过程：**

root app mounts Chapter 17; each panel reads a typed model; tests and scans validate local evidence.

**signal source、error object、fallback state、measurement entry、telemetry payload、redaction result、sampling decision、queue state、dashboard gate、incident owner、rollback path 与 failure signal 的变化：**

local signals become typed payloads; redaction/sampling/queue/dashboard/rollback form the evidence chain; failure signals are command failures, scan matches or UNKNOWN production claims.

**为什么得到这个结果：**

The lab treats observability as controlled data flow, not external SDK magic.

**对比写法：**

A vendor SDK without schema and privacy model can create more risk than evidence.

**常见错误为什么错：**

Claiming production monitoring exists from local panels is false.

**与真实项目的关系：**

Production needs collector ingestion, dashboard, alerting, RUM, source map policy and incident process.

**与当前学习主线的关系：**

It completes the local learning arc from API boundary to release evidence.

**最终记忆模型：**

Observe, redact, sample, queue, dashboard, decide, review.

## 10. API / 语法索引

| API / syntax | 层级 | 本章用途 | 不能证明什么 |
| --- | --- | --- | --- |
| `app.config.errorHandler` | Vue app runtime | centralized report boundary | user fallback or collector delivery |
| `app.config.warnHandler` | Vue app runtime | warning observation boundary | production reliability |
| `onErrorCaptured` | Vue lifecycle | component subtree recovery | global reporting completeness |
| async component options | Vue component runtime | loading/error/timeout/retry model | real chunk availability |
| `window` `error` | Browser platform | synchronous/global error signal | Vue-specific fallback |
| `unhandledrejection` | Browser platform | promise rejection signal | user-visible failure |
| `performance.mark` | Performance API | local code path mark | field UX |
| `performance.measure` | Performance API | local duration measure | RUM data |
| Navigation Timing | Performance API | document navigation milestones | SPA route success |
| Resource Timing | Performance API | asset duration review | cross-origin full detail |
| `sendBeacon` | Browser API | page-leave flush model | server receipt |
| `build.sourcemap` | Vite build option | source-map boundary | deployment safety |

## 11. 常见错误表

| # | Common mistake | Why wrong | Correction |
| --- | --- | --- | --- |
| 1 | Treating console.log as observability. | It lacks schema, redaction, sampling and owner. | Use typed telemetry events. |
| 2 | Catching an error but not reporting it. | Recovery hides release evidence. | Separate fallback and report. |
| 3 | Reporting an error but not showing a usable fallback. | Users still get a broken task. | Add component fallback state. |
| 4 | Rendering the same crashing subtree inside an error fallback. | It can crash again. | Render a stable fallback. |
| 5 | Returning false from onErrorCaptured without understanding propagation. | It can stop app-level reporting. | Decide propagation explicitly. |
| 6 | Treating app.config.errorHandler as user recovery UI. | It is reporting boundary. | Use component state for UI. |
| 7 | Treating global unhandledrejection as a Vue-only error. | It is browser platform signal. | Keep framework and platform layers separate. |
| 8 | Sending full API payloads as telemetry. | It leaks sensitive context. | Send endpoint class and request id. |
| 9 | Sending PII, tokens, route query strings or raw stack context without redaction. | It creates privacy risk. | Redact before queue/send. |
| 10 | Treating local performance marks as real-user performance data. | Local path is not field distribution. | Label source as local/lab/field. |
| 11 | Treating lab Core Web Vitals values as field RUM data. | Lab values do not represent users. | Use RUM before field claims. |
| 12 | Ignoring cross-origin Resource Timing limitations. | Missing detail can be misread. | Record crossOriginLimited. |
| 13 | Sampling high-severity errors away. | It destroys incident evidence. | Bypass sampling for high severity. |
| 14 | Sending every low-value event with no rate limit. | It creates noise and cost. | Apply sampling and burst limits. |
| 15 | Assuming sendBeacon success means server received the event. | It only indicates queueing. | Keep delivery UNKNOWN without collector proof. |
| 16 | Writing telemetry queue to localStorage without privacy review. | It changes retention. | Use bounded memory queue here. |
| 17 | Claiming source maps are safe without deployment evidence. | Hosting can expose source. | Verify private upload or disable public maps. |
| 18 | Claiming monitoring exists without collector/dashboard/alert evidence. | Local panels are not monitoring. | Require external evidence. |
| 19 | Marking incident resolved without rollback or mitigation evidence. | It hides operational risk. | Add owner, timeline, action items. |
| 20 | Adding observability SDKs without understanding privacy and bundle impact. | SDKs add runtime and privacy boundaries. | Design schema and redaction first. |

## 12. 最终小项目

最终小项目 `vue-observability-incident-lab` 只整合本章机制，不替代分节教学。它把 signal、source、collector、redaction、sampling、queue、dashboard、incident 和 rollback 连接成本地 evidence workspace。

### 12.1 项目目标

- 用 local models 表示 Vue errors、browser errors、API failure、route telemetry 和 performance signals。
- 用 redaction、sampling、queue 和 release gate 约束 telemetry。
- 明确 real collector、dashboard、RUM、source-map deployment 和 incident process 都不是本地 app 可证明的事实。

### 12.2 文件职责

| 文件 | 职责 |
| --- | --- |
| `ObservabilityIncidentChapterApp.vue` | 组合 Chapter 17 panels |
| `components/*.vue` | 展示本地 signal/recovery/dashboard panels |
| `models/*.ts` | 纯函数 observability decisions |
| `composables/*.ts` | Vue reactivity wrapper |
| `tests/*.test.ts` | model evidence |
| `observability-incident.css` | chapter-local style |

### 12.3 运行与验证

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run typecheck
npm run test:unit
npm run build
```
</div>

### 12.4 完整核心代码

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/ObservabilityIncidentChapterApp.vue</span>
  </div>

```vue
<AppErrorHandlerPanel />
<ComponentErrorBoundaryDemo />
<ErrorFallbackPanel />
<GlobalErrorListenerPanel />
<AsyncComponentRecoveryPanel />
<ApiFailureTelemetryPanel />
<RouteTelemetryPanel />
<PerformanceMarksPanel />
<NavigationTimingPanel />
<ResourceTimingPanel />
<WebVitalsBudgetPanel />
<TelemetryRedactionPanel />
<SamplingRateLimitPanel />
<BeaconFlushPanel />
<OfflineTelemetryQueuePanel />
<SourceMapBoundaryPanel />
<ReleaseHealthDashboard />
<IncidentRollbackPanel />
<PostIncidentReviewPanel />
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/AppErrorHandlerPanel.vue</span>
  </div>

```vue
<p class="observability-output">{{ record.message }}</p>
<span class="observability-badge">{{ record.redacted }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/ComponentErrorBoundaryDemo.vue</span>
  </div>

```vue
<button class="observability-button" type="button" @click="simulateComponentFailure">
  Simulate boundary state
</button>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/ErrorFallbackPanel.vue</span>
  </div>

```vue
<p class="observability-output">{{ fallback.message }}</p>
<span class="observability-badge">{{ fallback.reportCreated }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/GlobalErrorListenerPanel.vue</span>
  </div>

```vue
<li v-for="signal in signals" :key="signal.kind">
  <h4>{{ signal.kind }}</h4>
  <p>{{ signal.message }}</p>
</li>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/AsyncComponentRecoveryPanel.vue</span>
  </div>

```vue
<span class="observability-badge warning">{{ state.phase }}</span>
<span class="observability-badge">{{ state.retryCount }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/ApiFailureTelemetryPanel.vue</span>
  </div>

```vue
<p class="observability-output">{{ signal.safeMessage }}</p>
<p>Retry: {{ signal.retryDecision }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/RouteTelemetryPanel.vue</span>
  </div>

```vue
<p class="observability-output">{{ signal.redactedPath }}</p>
<span class="observability-badge">{{ isSlowNavigation(signal) }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/PerformanceMarksPanel.vue</span>
  </div>

```vue
<p class="observability-output">{{ review.name }}</p>
<span class="observability-badge">{{ review.durationMs }}ms / {{ review.status }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/NavigationTimingPanel.vue</span>
  </div>

```vue
<p>Type: {{ review.navigationType }}</p>
<p>Interactive: {{ review.interactiveMs }}ms</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/ResourceTimingPanel.vue</span>
  </div>

```vue
<p class="observability-output">{{ review.resourceLabel }}</p>
<span class="observability-badge warning">{{ review.durationMs }}ms</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/WebVitalsBudgetPanel.vue</span>
  </div>

```vue
<select v-model="vitalName">
  <option value="LCP">LCP</option>
  <option value="CLS">CLS</option>
  <option value="INP">INP</option>
</select>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/TelemetryRedactionPanel.vue</span>
  </div>

```vue
<p class="observability-output">{{ result.context.path }}</p>
<span class="observability-badge">{{ result.redactedFields.join(", ") }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/SamplingRateLimitPanel.vue</span>
  </div>

```vue
<span class="observability-badge" :class="{ warning: !decision.keep }">
  {{ decision.keep }}
</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/BeaconFlushPanel.vue</span>
  </div>

```vue
<span class="observability-badge">{{ decision.method }}</span>
<p>Delivery verified: {{ decision.deliveryVerified }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/OfflineTelemetryQueuePanel.vue</span>
  </div>

```vue
<p>Queued: {{ queueState.events.length }}</p>
<p>Dropped: {{ queueState.droppedCount }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/SourceMapBoundaryPanel.vue</span>
  </div>

```vue
<span class="observability-badge warning">{{ review.decision }}</span>
<p>{{ review.reason }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/ReleaseHealthDashboard.vue</span>
  </div>

```vue
<span class="observability-badge" :class="{ blocked: !review.releaseAllowed }">
  {{ review.releaseAllowed }}
</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/components/IncidentRollbackPanel.vue</span>
  </div>

```vue
<span class="observability-badge warning">{{ severity }}</span>
<span class="observability-badge">{{ decision.recommended }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/composables/useVueErrorBoundary.ts</span>
  </div>

```ts
const propagationRequired = computed(() => shouldPropagateError(fallbackState.value));
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/composables/useGlobalErrorListeners.ts</span>
  </div>

```ts
target.addEventListener("error", handleError);
target.addEventListener("unhandledrejection", handleRejection);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/composables/usePerformanceMarks.ts</span>
  </div>

```ts
performanceSource.mark(markName);
performanceSource.measure(name, startMark, endMark);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/composables/useTelemetryQueue.ts</span>
  </div>

```ts
queueState.value = enqueueTelemetryEvent(queueState.value, event);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/errorTelemetryModel.ts</span>
  </div>

```ts
const message = redactTelemetryValue(rawMessage);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/telemetryRedactionModel.ts</span>
  </div>

```ts
const redactedFields = redactedEntries
  .filter(([key, value]) => context[key] !== value)
  .map(([key]) => key);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/webVitalsBudgetModel.ts</span>
  </div>

```ts
export type WebVitalName = "LCP" | "CLS" | "INP";
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/models/releaseHealthModel.ts</span>
  </div>

```ts
reason: releaseAllowed
  ? "Release health model is within local thresholds."
  : "Release health model has blocking signals.",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-17-observability-incident/tests/telemetryRedactionModel.test.ts</span>
  </div>

```ts
expect(result.context.path).toBe("/account?[redacted]");
expect(result.redactedFields).toEqual(["path"]);
```
</div>

### 12.5 代码执行链路

1. `App.vue` imports and renders `ObservabilityIncidentChapterApp.vue`.
2. Chapter app imports CSS and panels.
3. Panels read local models or composables.
4. User input updates `ref` state.
5. `computed` reviews update model decisions.
6. Tests validate model edge cases.
7. Scans enforce no vendor secret, no unreviewed telemetry sink, no source-level `any`.
8. Release health and incident panels show local gates without claiming production monitoring.

### 12.6 验证命令与失败定位

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run typecheck
npm run test:unit
npm run build
rg -n --fixed-strings "console.log" src/learning/vue/chapter-17-observability-incident
rg -n --pcre2 "\bany\b" src/learning/vue/chapter-17-observability-incident
```
</div>

If typecheck fails, inspect imports and union values. If tests fail, inspect the named model. If scans match vendor secret or logging sink, treat it as release blocker until removed or documented as an inert redaction example.

### 12.7 Observability review checklist

| Check | Expected evidence |
| --- | --- |
| no real telemetry endpoint | source scan |
| no vendor secret or DSN | source scan |
| no raw PII retained | redaction tests |
| no high severity sampled away | sampling tests |
| no unbounded queue | queue tests |
| no RUM claim | final validation UNKNOWN |
| no source-map safety claim | final validation UNKNOWN |
| no incident resolved claim | final validation UNKNOWN |

## 13. 额外速查表

| Situation | Use | Avoid |
| --- | --- | --- |
| Vue runtime error | app handler report + component fallback | reporting only |
| Component subtree failure | `onErrorCaptured` boundary | crashing fallback subtree |
| Browser rejection | global listener | Vue-only assumption |
| API failure | endpoint class + status family | raw payload |
| Route telemetry | route name + redacted path | full query |
| Local interaction timing | User Timing marks | field claim |
| Page leave flush | beacon model with delivery UNKNOWN | receipt claim |
| Offline events | bounded memory queue | persistent queue without review |
| Source maps | private upload decision | public safety claim |
| Incident | severity + owner + rollback | optimistic closure |

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Template: observability-event.ts</span>
  </div>

```ts
interface LocalSignalEvidence {
  readonly source: string;
  readonly safeFields: ReadonlyArray<string>;
  readonly redactionRequired: boolean;
  readonly productionEvidence: "unknown" | "verified";
}
```
</div>

## 14. 真实项目判断模型

Use Chapter 17 when a Vue feature needs runtime error recovery, API/route telemetry, performance measurement, release-health gates, source-map debugging, or incident workflow.

Do not use this chapter as proof of production monitoring. Real projects still need collector ingestion, dashboard creation, alert rules, RUM, source-map upload/deployment policy, privacy review, on-call process and incident ownership.

| Decision question | Required evidence |
| --- | --- |
| What signal starts the issue? | error/API/route/performance/release/incident source |
| Which collector receives it? | local model or external collector evidence |
| Which fields are safe? | schema and redaction test |
| What is sampled or rate-limited? | severity-aware sampling policy |
| What blocks release? | release health thresholds |
| What rolls back? | rollback decision and owner |
| What remains UNKNOWN? | RUM, delivery, alerts, source-map safety, incident process unless verified |

## 15. 如何转换成个人笔记

把每个 observability 机制写成六行：

1. Signal：发生了什么。
2. Source：Vue、browser、API、route、performance、release or incident。
3. Safe fields：保留哪些。
4. Redaction / sampling：丢掉或保留什么。
5. Evidence：test、scan、dashboard、collector or manual check。
6. Action：fallback、retry、rollback or post-incident item。

## 16. 必须能回答的问题

- 为什么 observability 不是 `console.log`？
- 为什么 fallback UI 和 error report 是两件事？
- 为什么 `onErrorCaptured` 的 propagation decision 会影响 app-level report？
- 为什么 `window` `error` 和 `unhandledrejection` 是不同 failure classes？
- 为什么 local marks 不等于 field performance？
- 为什么 LCP/CLS/INP 是 user-experience signals？
- 为什么 telemetry 要先 redaction 后 queue/send？
- 为什么 high severity 不能被 sampling 丢掉？
- 为什么 sendBeacon queued 不等于 delivered？
- 为什么 source maps 需要 deployment evidence？
- 为什么 incident resolved 需要 owner、timeline、mitigation and rollback evidence？

## 17. 最终记忆模型

Observability is a controlled evidence pipeline:

1. capture signal;
2. identify source and owner;
3. normalize into typed event;
4. redact sensitive context;
5. sample and rate-limit;
6. queue or flush with delivery limits;
7. aggregate into release health;
8. decide mitigation or rollback;
9. complete post-incident review.

## 18. 官方文档阅读清单

- Vue Application API: `https://vuejs.org/api/application.html`
- Vue Composition API lifecycle hooks: `https://vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured`
- Vue async components: `https://vuejs.org/guide/components/async.html`
- Vue Suspense: `https://vuejs.org/guide/built-ins/suspense.html`
- MDN Performance API: `https://developer.mozilla.org/en-US/docs/Web/API/Performance`
- MDN Performance mark: `https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark`
- MDN Performance measure: `https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure`
- MDN Navigation Timing: `https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming`
- MDN Resource Timing: `https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming`
- MDN PerformanceObserver: `https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver`
- MDN Window error event: `https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event`
- MDN Window unhandledrejection event: `https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event`
- MDN Beacon API: `https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon`
- MDN Page Visibility API: `https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API`
- web.dev Core Web Vitals: `https://web.dev/articles/vitals`
- OpenTelemetry JavaScript docs: `https://opentelemetry.io/docs/languages/js/`
- Vite build source maps: `https://vite.dev/config/build-options.html#build-sourcemap`

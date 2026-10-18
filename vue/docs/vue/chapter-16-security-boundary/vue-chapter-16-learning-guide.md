# Vue 第 16 章：Security、Trusted Boundary、XSS / CSRF / CSP 与 Privacy Evidence

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
  - [9.1 Security mental model：trusted code、untrusted data、browser policy、backend authority and evidence](#section-9-1)
  - [9.2 Vue trusted template boundary：never compile untrusted templates, template expression execution and SSR risk](#section-9-2)
  - [9.3 Escaped rendering boundary：text interpolation, attribute binding and safe preview model](#section-9-3)
  - [9.4 Dangerous HTML boundary：v-html, innerHTML, rich text, sanitizer model and sandbox decision](#section-9-4)
  - [9.5 URL injection boundary：href/src validation, protocol allowlist, backend-before-persistence rule](#section-9-5)
  - [9.6 Style injection boundary：style binding allowlist, clickjacking-like UI risk and safe design tokens](#section-9-6)
  - [9.7 JavaScript injection boundary：inline handlers, script strings, eval-like sinks and dangerous context review](#section-9-7)
  - [9.8 CSP defense-in-depth：script-src, object-src, base-uri, frame-ancestors and report-only rollout](#section-9-8)
  - [9.9 API security boundary：credentials, SameSite, CORS misconception, Fetch Metadata and custom headers](#section-9-9)
  - [9.10 CSRF request boundary：token/header submission, session binding and backend coordination](#section-9-10)
  - [9.11 Auth and token storage boundary：cookie, localStorage, sessionStorage, memory state and XSS impact](#section-9-11)
  - [9.12 Route guard vs backend authorization：frontend UX guard, backend authority and API response evidence](#section-9-12)
  - [9.13 Privacy data boundary：PII classification, URL/log/localStorage/error-report leakage and data minimization](#section-9-13)
  - [9.14 Environment exposure boundary：VITE_ client values, runtime config, secret leakage and build evidence](#section-9-14)
  - [9.15 Dependency and supply-chain risk：package trust, lockfile review, dangerous DOM libraries and update policy](#section-9-15)
  - [9.16 Security tests and dangerous pattern scans：model tests, grep checks, review gates and command evidence](#section-9-16)
  - [9.17 Security issue dashboard：severity, owner, evidence, backend dependency, release gate and rollback](#section-9-17)
  - [9.18 Chapter integration：how Chapter 16 connects API, tests, production, Nuxt, migration and accessibility](#section-9-18)
  - [9.19 Final integration：vue-security-boundary-lab 如何形成 security evidence workspace](#section-9-19)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 文件职责](#122-文件职责)
  - [12.3 运行与验证](#123-运行与验证)
  - [12.4 完整核心代码](#124-完整核心代码)
  - [12.5 代码执行链路](#125-代码执行链路)
  - [12.6 验证命令与失败定位](#126-验证命令与失败定位)
  - [12.7 Security review checklist](#127-security-review-checklist)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 学习目标 | 真实路径 | 位置 |
| --- | --- | --- |
| trusted code、untrusted data、server policy 的边界分类 | `src/learning/vue/chapter-16-security-boundary/models/trustedBoundaryModel.ts`、`components/TrustedRenderingPanel.vue` | 9.1、9.2 |
| Vue 默认 text interpolation 与 attribute display 的安全预览 | `models/escapedRenderingModel.ts`、`components/EscapedTextRenderingDemo.vue`、`tests/escapedRenderingModel.test.ts` | 9.3 |
| rich text allowlist、blocked tag、blocked attribute 的学习模型 | `models/htmlSanitizationModel.ts`、`components/RichTextRiskPanel.vue`、`tests/htmlSanitizationModel.test.ts` | 9.4 |
| URL protocol allowlist 与 backend-before-persistence 规则 | `models/safeUrlModel.ts`、`components/SafeUrlReviewPanel.vue`、`tests/safeUrlModel.test.ts` | 9.5 |
| style token allowlist 与 raw style 拒绝模型 | `models/safeStyleModel.ts`、`components/SafeStyleAllowlistPanel.vue`、`tests/safeStyleModel.test.ts` | 9.6 |
| dangerous sink inventory 与源码扫描证据 | `models/dangerousSinkModel.ts`、`components/DangerousSinkPanel.vue` | 9.7、9.16 |
| CSP、report-only、frame-ancestors 与 clickjacking policy model | `models/cspPolicyModel.ts`、`models/clickjackingPolicyModel.ts`、`components/CspPolicyBuilderPanel.vue`、`tests/cspPolicyModel.test.ts` | 9.8 |
| credentials、custom headers、CSRF token/header 与 backend session protocol | `models/apiSecurityBoundaryModel.ts`、`models/csrfRequestModel.ts`、`components/ApiSecurityBoundaryPanel.vue`、`components/CsrfRequestBoundaryPanel.vue`、`tests/csrfRequestModel.test.ts` | 9.9、9.10 |
| auth storage、route guard UX 与 backend authorization authority | `models/authStorageRiskModel.ts`、`models/routeAuthorizationBoundaryModel.ts`、`components/AuthStorageRiskPanel.vue`、`components/RouteAuthorizationBoundaryPanel.vue`、`tests/authStorageRiskModel.test.ts`、`tests/routeAuthorizationBoundaryModel.test.ts` | 9.11、9.12 |
| PII、client env、dependency trust 与 supply-chain review | `models/privacyDataClassificationModel.ts`、`models/envExposureModel.ts`、`models/dependencyRiskModel.ts`、`components/PrivacyDataClassificationPanel.vue`、`components/EnvExposurePanel.vue`、`components/DependencyRiskPanel.vue` | 9.13–9.15 |
| release gate、security issue、rollback 与 final lab entry | `models/securityIssueModel.ts`、`composables/useSecurityIssueGate.ts`、`components/SecurityVerificationDashboard.vue`、`SecurityBoundaryChapterApp.vue` | 9.16–9.19、12 |

## 0. 本章机制边界

本章不是 exploit-development 章节，也不教如何攻击 live system。所有危险模式都用 inert strings、枚举、allowlist、blocked/requires-review 状态和测试断言建模；练习代码不渲染恶意 HTML，不执行危险 JavaScript，不创建真实攻击 payload。

Vue 对普通 text interpolation 与 attribute binding 提供默认 escaping，但这不等于“整个应用安全”。模板必须是 trusted application source；`v-html`、URL sinks、style sinks、JavaScript sinks、storage sinks、API request sinks、client env exposure 和 dependency trust 都需要明确 review。TypeScript 可以检查 `TrustedBoundaryItem`、`UrlReviewResult`、`SecurityIssue` 等数据形状，却不能证明 runtime security、backend authorization、CSP header deployment、cookie flags、CSRF session validation 或不存在 XSS。

本章把 backend coordination 明确放在 URL persistence、HTML sanitization、CSRF、auth/session、authorization、CSP headers、server-only secrets 与 supply-chain policy 上。前端练习只提供可观察的 learning evidence：model tests、dangerous pattern scans、code review checklist、backend dependency flag、release gate 和 rollback path。

本地 roadmap 没有单独列出 Phase 16 的完整小节清单，只在 production topics 中提到 security、CSP，并在 Router 权限章节强调真正安全必须在后端接口鉴权。因此本章使用任务给定的 fallback Phase 16 scope，把 Chapter 09–15 的 API boundary、test evidence、deployment evidence、Nuxt boundary、migration release gate 与 accessibility verification 连接到 security evidence workspace。

## 1. 本章解决的问题

Chapter 09 已经把 API client、runtime validation 和 front-back boundary 分开；Chapter 10 建立了测试质量；Chapter 11 讨论 build、deployment 和 rollback；Chapter 12–13 讨论 Nuxt server/browser boundary；Chapter 14 强调 migration evidence；Chapter 15 强调 accessibility verification evidence。Chapter 16 继续回答一个更高风险的问题：当值从 user input、API response、route query、client storage、env、dependency 或 backend policy 进入 Vue app 时，它到底是 trusted code、untrusted data、browser policy、backend authority、client-only convenience，还是 release evidence？

本章的核心不是写“更复杂的前端安全库”，而是把每个 security decision 落到可检查的 source file、model function、component sink、test assertion、scan command、backend coordination point 和 rollback path。

## 2. 前置概念

- 已理解 Vue SFC、`<script setup>`、template interpolation、attribute binding、event binding、`ref`、`computed` 和 component render update。
- 已理解 Chapter 06 的 route guard 只是前端导航体验，不等于 API authorization。
- 已理解 Chapter 09 的 API response validation 与 backend boundary。
- 已理解 Chapter 10 的 unit test、model test 和 validation command evidence。
- 已理解 Chapter 11 的 release gate、rollback 和 production build evidence。
- 已理解 Chapter 12–13 的 SSR/server/browser 执行边界。
- 已理解 Chapter 15 的 verification evidence 不等于 conformance claim。

## 3. 学习目标

完成本章后，你应该能：

1. 解释为什么 Vue template 必须是 trusted code。
2. 区分 Vue 默认 escaping、HTML allowlist、URL allowlist、style token allowlist、CSP、backend authorization、CSRF session protocol 和 privacy review。
3. 说明 TypeScript 能检查 policy model 的 shape，但不能证明 security outcome。
4. 为 route guard、auth storage、client env、dependency risk、privacy sink 和 security issue 建立 release evidence。
5. 在最终项目 `vue-security-boundary-lab` 中定位每个 security boundary 的 source file、test file、scan command 和 rollback path。

## 4. 核心机制证据链总览

| Chain | Source / Sink | Protection that applies | Protection that does not apply | Evidence / failure signal |
| --- | --- | --- | --- | --- |
| Trusted template -> compiler boundary -> arbitrary JS execution risk if untrusted | `trustedBoundaryModel.ts` -> compiled component template | source review、Vue SFC compiler | TypeScript cannot prove author trust | untrusted item blocked from compiler |
| Text interpolation -> browser textContent / escaping -> safe text preview | `escapedRenderingModel.ts` -> template text node | Vue escaping and browser text rendering | does not allow HTML | `escapedRenderingModel.test.ts` |
| Attribute binding -> setAttribute escaping -> safe attribute display | `EscapedTextRenderingDemo.vue` -> text/attribute display | Vue binding path | does not validate URL protocol | code review and URL model separation |
| v-html -> trusted HTML sink -> sanitizer/sandbox/backend authority | `htmlSanitizationModel.ts` -> rich text decision | allowlist classification | frontend model is not backend sanitizer | blocked tag/attribute tests |
| URL value -> href/src sink -> protocol allowlist and backend-before-persistence rule | `safeUrlModel.ts` -> URL review | `new URL` parsing and protocol allowlist | TypeScript cannot prove destination safety | relative/HTTPS/blocked protocol tests |
| Style value -> style binding sink -> property allowlist and design tokens | `safeStyleModel.ts` -> style object | token mapping | arbitrary CSS string is rejected | raw style blocked test |
| JavaScript string -> dangerous sink -> blocked pattern review | `dangerousSinkModel.ts` -> sink inventory | scan and review action | no runtime execution proof from TS | `rg` dangerous patterns |
| CSP policy -> browser enforcement/report-only -> defense-in-depth evidence | `cspPolicyModel.ts` -> response header model | browser policy when deployed | no header deployment in this lab | CSP model tests |
| frame-ancestors -> embedding policy -> clickjacking protection model | `clickjackingPolicyModel.ts` -> policy row | browser frame policy when header exists | CSS alone cannot block embedding | strict policy model |
| API request -> credentials/custom headers -> backend CSRF/session protocol | `apiSecurityBoundaryModel.ts` -> request metadata | request header model | frontend cannot validate session | CSRF header tests |
| Route guard -> UX visibility -> backend authorization requirement | `routeAuthorizationBoundaryModel.ts` -> route decision | client UX hiding | not API authorization | backend authority flag |
| Token storage -> XSS impact model -> storage risk decision | `authStorageRiskModel.ts` -> storage table | risk ranking | no real auth/session exists | risk sorted tests |
| VITE_ env -> client bundle exposure -> secret leakage gate | `envExposureModel.ts` -> env review | Vite prefix model | TS cannot hide bundled secret | secret client key blocked test |
| PII value -> URL/log/storage/error sink -> privacy release gate | `privacyDataClassificationModel.ts` -> privacy sink | classification model | no legal compliance claim | PII URL blocked test |
| Dependency change -> DOM/security surface -> supply-chain review | `dependencyRiskModel.ts` -> dependency review | category risk model | no scanner claim | lockfile/scanner UNKNOWN unless run |
| Security test -> model assertion/grep check -> release evidence | `tests/*.test.ts` and `rg` -> release record | automated evidence | not a perfect security proof | failed test or matched pattern |
| Security issue -> severity/owner/evidence -> release block/rollback | `securityIssueModel.ts` -> dashboard | release gate model | no production certification | open high issue blocks release |

## 5. 核心术语表

| Term | 本章含义 | 典型文件 |
| --- | --- | --- |
| trusted code | 由项目开发者审查、提交、编译的 Vue template、component、model 和 test code | `SecurityBoundaryChapterApp.vue` |
| untrusted data | user input、API response、CMS content、route query、storage value、env-like value 或 dependency metadata | `trustedBoundaryModel.ts` |
| sink | 值进入 browser、DOM、URL、style、storage、API、policy 或 log 的位置 | `safeUrlModel.ts`、`safeStyleModel.ts` |
| backend authority | 只有后端/API/session/header 才能最终确认的安全事实 | `apiSecurityBoundaryModel.ts` |
| browser policy | 浏览器根据 response header 或 platform rule 执行的限制 | `cspPolicyModel.ts` |
| release evidence | 测试、scan、review、backend coordination、rollback 和 issue gate 的组合 | `securityIssueModel.ts` |

## 6. 底层心智模型

把 Vue security 想成一条 value pipeline：

1. 值从 source 出现：template source、form input、API response、route query、storage、env、dependency metadata。
2. model function 给值分类：trusted、untrusted、allowed、blocked、requires-review。
3. component 只把允许的值送到对应 sink：text、attribute、style object、policy preview、request headers、dashboard。
4. browser/Vue 提供某些默认保护：text escaping、attribute binding、CSP enforcement when deployed。
5. backend/server policy 拥有最终 authority：authorization、CSRF validation、cookie flags、HTML sanitization、CSP headers、server-only secrets。
6. release gate 只根据 evidence 决策：tests、pattern scans、backend dependency、owner、rollback。

## 7. 推荐目录结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```text
src/learning/vue/chapter-16-security-boundary/
  SecurityBoundaryChapterApp.vue
  security-boundary.css
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

`npm run dev` 只用于本地浏览器观察；它不证明安全。`npm run typecheck` 只证明 TypeScript/SFC 类型关系；`npm run test:unit` 只证明已写测试覆盖的 model behavior；`npm run build` 只证明 production bundle 能生成；CSP header、CSRF backend validation、backend authorization、dependency scan 和 privacy/legal review 仍是独立证据。

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Security mental model：trusted code、untrusted data、browser policy、backend authority and evidence

**结论：**

Chapter 16 的安全模型先分类，再进入 sink。`trustedBoundaryItems` 把 template source、API display name、response header policy 分成 trusted-code、untrusted-data、server-policy，避免把所有值都当成“可以直接渲染”。

**本节解决的问题：**

同一个 Vue component 可能同时处理 template、API 字段、URL、style、storage 和 server policy。没有分类时，开发者容易把 escaping、CSP、route guard、CORS 和 backend authorization 混成一个模糊安全概念。

**技术意义：**

安全决策必须能回答：值是谁创建的、进入哪个 sink、谁有 authority、什么证据能 release、失败时怎样 rollback。

**概念解释：**

`TrustedBoundaryItem` 是本章所有模型的起点。它不证明生产安全，而是给学习代码一个稳定 vocabulary：trusted source 能进入 compiler；untrusted value 只能进入文本或已审核 sink；server policy 需要 response header 或 backend code。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节只建立分类表。HTML、URL、style、CSP、CSRF、route guard、env、dependency 和 release gate 在后续小节分别收窄。

**Security 机制证据链：**

untrusted value 是 `api-display-name`；source 是 API data；sink 只能是 `text interpolation`；browser protection 是 Vue escaping；backend authority 是 API validation；test evidence 来自后续 text model；failure signal 是它被送入 compiler 或 HTML execution sink；rollback 是改回 plain text display。

**TypeScript / vue-tsc 编译期过程：**

`TrustLevel` 联合类型限制 `trustLevel` 只能是三个值，`TrustedBoundaryItem` 要求每条记录都有 allowed sink、blocked sink 和 evidence。`vue-tsc` 能检查字段拼写，却不能证明某个 API response 真实可信。

**Vue / Browser / API / Backend Authority 运行时过程：**

`TrustedRenderingPanel.vue` 在 render 时读取 `trustedBoundaryItems`，Vue 创建表格 DOM。浏览器只显示文本；API 与 backend authority 没有在这个练习中真实存在。

**API / 语法规则：**

使用 `ReadonlyArray`、union type、pure function 和 template interpolation，不使用 runtime template compilation。

**文件结构：**

`models/trustedBoundaryModel.ts` 提供分类，`components/TrustedRenderingPanel.vue` 展示分类。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/trustedBoundaryModel.ts</span>
  </div>

```ts
export type TrustLevel = "trusted-code" | "untrusted-data" | "server-policy";

export interface TrustedBoundaryItem {
  readonly id: string;
  readonly label: string;
  readonly trustLevel: TrustLevel;
  readonly allowedSink: string;
  readonly blockedSink: string;
  readonly evidence: string;
}

export function canEnterTemplateCompiler(item: TrustedBoundaryItem): boolean {
  return item.trustLevel === "trusted-code";
}
```
</div>

**逐行解释：**

`TrustLevel` 固定 source classification；`TrustedBoundaryItem` 要求每条记录同时写出 allowed sink 和 blocked sink；`canEnterTemplateCompiler` 只允许 trusted-code，避免 untrusted-data 被误当 template source。

**执行过程：**

模块加载时创建 `trustedBoundaryItems`；component render 遍历数组；每一行调用 `canEnterTemplateCompiler` 决定 badge class 和 failure signal。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

trusted source 保持在 compiler；untrusted value 只进 text sink；server policy 只做 header model；client state 没有持久化；failure signal 是 untrusted item 试图进入 compiler；rollback 是移除 dynamic template path。

**为什么得到这个结果：**

因为 `canEnterTemplateCompiler` 只检查 `trusted-code`，所以 API display name 和 response header policy 都不会被当成 template source。

**对比写法：**

把 API field 直接拼进 template string 是错误 mental model；把 API field 当作 text interpolation value 才符合本章边界。

**常见错误为什么错：**

“Vue 会 escape，所以可以信任所有输入”是错的。escaping 只覆盖普通 text/attribute rendering，不覆盖 HTML execution、URL protocol、style string、storage、API authorization 或 backend policy。

**与真实项目的关系：**

真实项目应在 PR、API schema、CMS content、dependency review 和 release checklist 中保留同类边界记录。

**与当前学习主线的关系：**

它把 Chapter 09 的 front-back boundary、Chapter 10 的 test evidence、Chapter 11 的 release gate 连接成 security vocabulary。

**最终记忆模型：**

先问“这个值是谁信任的”，再问“它进入哪个 sink”，最后问“什么证据允许 release”。

<a id="section-9-2"></a>

### 9.2 Vue trusted template boundary：never compile untrusted templates, template expression execution and SSR risk

**结论：**

Vue template 是 trusted application code。不要把 user input、CMS text 或 API response 当成 template 编译；SSR 场景中 untrusted template 更危险，因为 server runtime 也可能被影响。

**本节解决的问题：**

很多安全错误来自把“模板看起来像 HTML 字符串”误解成“用户字符串也可以当模板”。Vue 官方 security 指南强调 template 必须可信。

**技术意义：**

template expression 能访问 component scope 并参与 render function；如果 untrusted string 进入 compiler，就不是显示数据，而是执行逻辑。

**概念解释：**

本章没有 runtime template compiler 示例，只用 `TrustedRenderingPanel.vue` 告诉你哪些值能进 compiler。API display name 被允许进入 text interpolation，不被允许进入 template compiler。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

trusted template 是最高优先级边界；后续 escaping、CSP 和 tests 都不能补救 untrusted template compilation 的设计错误。

**Security 机制证据链：**

untrusted value 是 API display label；source 是 API；sink 若是 compiler 就失败；Vue protection 不适用于编译前的信任错误；backend authority 是 API/content review；evidence 是没有 dynamic compile path；failure signal 是 source scan 发现 runtime compile 或 template string path。

**TypeScript / vue-tsc 编译期过程：**

`vue-tsc` 能检查 `.vue` 文件中 template 与 script binding 的类型关系；它不能证明某个 string template 来自 trusted author。

**Vue / Browser / API / Backend Authority 运行时过程：**

`TrustedRenderingPanel.vue` 只把 `item.label` 和 `item.evidence` 用 interpolation 显示，Vue 将它们作为 text child 处理，而不是编译成 template。

**API / 语法规则：**

使用 SFC template；不调用 runtime template compiler；不把字符串传给 compiler。

**文件结构：**

`TrustedRenderingPanel.vue` 是可视化边界，`trustedBoundaryModel.ts` 是分类来源。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/TrustedRenderingPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  canEnterTemplateCompiler,
  trustedBoundaryItems,
} from "../models/trustedBoundaryModel";
</script>

<template>
  <tr v-for="item in trustedBoundaryItems" :key="item.id">
    <td>{{ item.label }}</td>
    <td>{{ item.allowedSink }}</td>
    <td>{{ item.blockedSink }}</td>
    <td>{{ canEnterTemplateCompiler(item) }}</td>
  </tr>
</template>
```
</div>

**逐行解释：**

import 读取 trusted model；`v-for` 只遍历已审查数组；`{{ item.label }}` 是 text interpolation；`canEnterTemplateCompiler(item)` 只是布尔判断，不创建 template。

**执行过程：**

component setup 获取模块 binding；render effect 读取数组；DOM patch 创建 table rows；用户不会输入 template source。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

trusted source 是 SFC 文件；untrusted value 只是 table text；sink 是 text node；browser policy 未参与；backend authority 是内容来源 review；failure signal 是出现 runtime compile；rollback 是删除 compile path。

**为什么得到这个结果：**

因为 template 本身在构建时来自 `.vue` source，API label 只是运行时数据，二者没有共享 compiler boundary。

**对比写法：**

错误是允许用户填写 template string 并编译；正确是把用户值作为 data 传入 trusted template。

**常见错误为什么错：**

把 SSR 当成“更安全的服务端渲染”也会错。SSR 中 untrusted template 可能影响 server runtime，因此 template trust boundary 更严格。

**与真实项目的关系：**

CMS page builder、marketing template、email template、low-code builder 都必须明确区分 authoring trust 与 end-user content。

**与当前学习主线的关系：**

它复用 Chapter 12 的 server/browser boundary：SSR 不改变 template 必须可信的规则。

**最终记忆模型：**

template 是 code，不是 content。

<a id="section-9-3"></a>

### 9.3 Escaped rendering boundary：text interpolation, attribute binding and safe preview model

**结论：**

普通 text interpolation 可以安全显示 untrusted text，但这只表示“按文本显示”，不表示“允许 HTML”。

**本节解决的问题：**

用户输入中可能包含 `<strong>Label</strong>` 这种字符。正确结果是浏览器显示这些字符本身，而不是把它们当标签执行。

**技术意义：**

Escaping 是 Vue/browser rendering path 的默认保护；它不能替代 HTML sanitizer、URL protocol validation 或 backend validation。

**概念解释：**

`createEscapedPreview` 保存 `rawValue` 和 `renderedText`。`EscapedTextRenderingDemo.vue` 用 `v-model` 收集字符串，再用 `{{ preview.renderedText }}` 显示。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节只覆盖 text/attribute rendering，不覆盖 HTML rendering、URL sink、style sink 或 storage sink。

**Security 机制证据链：**

untrusted value 是 textarea 的 raw string；source 是 component state；sink 是 text interpolation；Vue/browser protection 是 escaping/text node；不适用的是 HTML sanitizer；backend authority 是 API persistence 前 validation；test assertion 是 `renderedText` 保持为原字符串；failure signal 是值进入 HTML sink。

**TypeScript / vue-tsc 编译期过程：**

`EscapedPreview["sink"]` 限制 sink 为 `text` 或 `attribute`。TS 不知道浏览器最终 DOM 是否由别的代码改写。

**Vue / Browser / API / Backend Authority 运行时过程：**

`v-model` 写入 `rawValue`；`computed` 重新运行；template 读取 `preview.renderedText`；Vue patch text node；API/backend 不参与。

**API / 语法规则：**

使用 `ref`、`computed`、`v-model`、text interpolation 和 pure model function。

**文件结构：**

`models/escapedRenderingModel.ts`、`components/EscapedTextRenderingDemo.vue`、`tests/escapedRenderingModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/escapedRenderingModel.ts</span>
  </div>

```ts
export interface EscapedPreview {
  readonly rawValue: string;
  readonly renderedText: string;
  readonly sink: "text" | "attribute";
  readonly safeForHtmlExecution: false;
}

export function createEscapedPreview(
  rawValue: string,
  sink: EscapedPreview["sink"] = "text",
): EscapedPreview {
  return {
    rawValue,
    renderedText: rawValue,
    sink,
    safeForHtmlExecution: false,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/escapedRenderingModel.test.ts</span>
  </div>

```ts
it("keeps raw input as text preview data", () => {
  const preview = createEscapedPreview("Guest <student>");

  expect(preview.rawValue).toBe("Guest <student>");
  expect(preview.renderedText).toBe("Guest <student>");
  expect(preview.safeForHtmlExecution).toBe(false);
});
```
</div>

**逐行解释：**

interface 明确 `safeForHtmlExecution` 永远是 `false`；function 返回同一字符串用于 text preview；test 断言尖括号仍只是字符串。

**执行过程：**

用户输入更新 `rawValue`；computed 调用 `createEscapedPreview`；template 读取 `preview.renderedText`；Vue 更新 text node。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

untrusted value 留在 component state；sink 是 text；没有 storage；test assertion 保证 model 不声称 HTML safe；failure signal 是 `safeForHtmlExecution` 变成 true；rollback 是恢复 text-only preview。

**为什么得到这个结果：**

因为函数没有解析标签，也没有把字符串送入 HTML sink，只把它当 text value。

**对比写法：**

把同一字符串交给 HTML rendering escape hatch 是另一类 sink，必须进入 9.4 的 rich text review。

**常见错误为什么错：**

“看起来没执行，所以它是 sanitizer”是错的。escaping text 和 sanitizing HTML 是不同机制。

**与真实项目的关系：**

评论、昵称、搜索关键词、订单备注默认应走 text rendering；需要富文本时必须升级到 sanitizer/backend review。

**与当前学习主线的关系：**

它连接 Chapter 01 template binding 与 Chapter 10 model tests。

**最终记忆模型：**

显示文本不是允许 HTML。

<a id="section-9-4"></a>

### 9.4 Dangerous HTML boundary：v-html, innerHTML, rich text, sanitizer model and sandbox decision

**结论：**

HTML rendering 是 escape hatch，只能用于 trusted content、后端 sanitizer、sandbox 或 reviewed sanitizer 后的结果。本章只做 allowlist classification，不渲染 blocked HTML。

**本节解决的问题：**

CMS、markdown、rich text editor 经常需要保留标签，但未审查的 tag/attribute 可能变成 HTML injection sink。

**技术意义：**

Frontend-only allowlist 是 learning model，不是 production authority。生产环境需要后端 sanitizer、content policy、sandbox 或经过维护的 sanitizer package review。

**概念解释：**

`classifyRichTextInput` 对 tag 和 attribute 做 lowercase normalization，然后返回 allowed、blocked 或 requires-backend-review。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节覆盖 untrusted HTML sink；URL、style、script、CSP 和 backend authorization 仍是后续边界。

**Security 机制证据链：**

untrusted value 是 CMS tag/attribute metadata；source 是 content API；sink 是 rich text rendering decision；protection 是 allowlist classification；不适用的是 Vue text escaping；backend authority 是 sanitizer；test assertion 是 blocked tag 和 unknown attribute；failure signal 是 blocked input 被渲染；rollback 是禁用 rich text display。

**TypeScript / vue-tsc 编译期过程：**

`RichTextDecision` 联合类型限制返回值；TS 不能证明 allowlist 完整，也不能替代 sanitizer correctness。

**Vue / Browser / API / Backend Authority 运行时过程：**

component 只渲染 `review.decision` 和 `review.reason`，不渲染 HTML content。浏览器只看到文本和表单控件。

**API / 语法规则：**

使用 `Set`、string normalization、pure function、`computed` 和 select input，不使用 HTML rendering sink。

**文件结构：**

`models/htmlSanitizationModel.ts`、`components/RichTextRiskPanel.vue`、`tests/htmlSanitizationModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/htmlSanitizationModel.ts</span>
  </div>

```ts
const allowedTags = new Set(["strong", "em", "p", "ul", "ol", "li"]);
const allowedAttributes = new Set(["class"]);
const blockedTags = new Set(["script", "iframe", "object", "embed"]);
const blockedAttributes = new Set(["onclick", "onerror", "style"]);

export function classifyRichTextInput(
  sourceLabel: string,
  tagName: string,
  attributeNames: ReadonlyArray<string>,
): RichTextReview {
  const normalizedTag = tagName.toLowerCase();
  const normalizedAttributes = attributeNames.map((name) => name.toLowerCase());
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/htmlSanitizationModel.test.ts</span>
  </div>

```ts
it("blocks risky tags", () => {
  const review = classifyRichTextInput("cms-preview", "script", ["class"]);

  expect(review.decision).toBe("blocked");
});
```
</div>

**逐行解释：**

allowed set 表示学习 allowlist；blocked set 表示不进入 rendering path 的危险类别；function 先 normalize 再 classify；test 验证 risky tag 被 blocked。

**执行过程：**

select 更新 tag/attribute；computed 重新分类；template 只显示 decision；没有 HTML 被插入 DOM。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

untrusted value 是 rich text metadata；sink 是 decision output；backend sanitizer 是 authority；test assertion 是 blocked；failure signal 是 blocked tag 被显示为 HTML；rollback 是 plain text display。

**为什么得到这个结果：**

blocked tag 命中 `blockedTags`，函数立即返回 `blocked`。

**对比写法：**

错误是把 API rich text 直接渲染；正确是先分类、后端 sanitizer、reviewed sink，再决定是否展示。

**常见错误为什么错：**

“前端 allowlist 通过，所以生产安全”是错的。前端 model 可被绕过，API persistence 与 sanitizer authority 应在后端。

**与真实项目的关系：**

markdown renderer、rich text editor、CMS slot、user profile bio 都属于 high-risk surface。

**与当前学习主线的关系：**

它延续 Chapter 09 的 API response boundary 和 Chapter 10 的 model test pattern。

**最终记忆模型：**

富文本不是文本；它需要独立 authority。

<a id="section-9-5"></a>

### 9.5 URL injection boundary：href/src validation, protocol allowlist, backend-before-persistence rule

**结论：**

`href`、`src`、redirect target 和 persisted URL 都是 URL sinks。允许 same-origin relative path 或 reviewed `https:`，其他 protocol 进入 blocked/requires-review。

**本节解决的问题：**

URL 看起来只是字符串，但浏览器会按 protocol 解释。错误的 protocol allowlist 会把显示值变成 navigation/action sink。

**技术意义：**

URL validation 应在 persistence 和 API return 之前完成；前端 review 只是最后一道 UI evidence。

**概念解释：**

`reviewUrlValue` 使用 `new URL(input, baseUrl)` 解析，同源相对路径 allowed，外部 HTTPS requires-backend-review，其他 protocol blocked。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节只处理 URL protocol；它不处理 auth、CORS、privacy query leakage 或 server redirect validation。

**Security 机制证据链：**

untrusted value 是 URL input；source 是 form/API；sink 是 href/src candidate；browser protection 是 URL parser but not authorization；backend authority 是 persistence validation；test assertion 覆盖 relative、HTTPS、blocked protocol；failure signal 是 blocked protocol 输出为 clickable link；rollback 是显示为 plain text 或移除 link。

**TypeScript / vue-tsc 编译期过程：**

`UrlReviewStatus` 限制结果状态；TS 不能证明远程 URL 目的地可信，也不能验证未来 API 返回。

**Vue / Browser / API / Backend Authority 运行时过程：**

component 输入更新 `urlInput`；computed 调用 model；template 显示 normalized URL as text；不创建危险 clickable link。

**API / 语法规则：**

使用 `new URL`、same-origin check、protocol allowlist 和 explicit status。

**文件结构：**

`models/safeUrlModel.ts`、`components/SafeUrlReviewPanel.vue`、`tests/safeUrlModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/safeUrlModel.ts</span>
  </div>

```ts
const defaultBaseUrl = "https://app.example";
const allowedProtocols = new Set(["https:"]);

export function reviewUrlValue(
  input: string,
  baseUrl = defaultBaseUrl,
): UrlReviewResult {
  const parsed = new URL(input, baseUrl);
  const base = new URL(baseUrl);
  const isSameOriginRelative = !input.includes("://") && parsed.origin === base.origin;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/safeUrlModel.test.ts</span>
  </div>

```ts
it("blocks protocols outside the allowlist", () => {
  const blockedUrl = ["java", "script:blocked-action"].join("");
  const review = reviewUrlValue(blockedUrl);

  expect(review.status).toBe("blocked");
});
```
</div>

**逐行解释：**

base URL 提供相对路径解析上下文；allowedProtocols 只包含 HTTPS；test 用 inert string 组装 blocked protocol，不创建可点击链接。

**执行过程：**

input 改变后 computed review；same-origin relative 直接 allowed；external HTTPS requires backend review；protocol 不在 allowlist 时 blocked。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

untrusted URL 留在 client state；sink 是 text preview；backend authority 是保存前验证；test assertion 是 blocked status；failure signal 是 dangerous protocol 进入 href/src；rollback 是移除 URL action。

**为什么得到这个结果：**

`new URL` 解析 protocol 后，allowlist 不包含该 protocol，所以 model 返回 blocked。

**对比写法：**

只用 string prefix 检查容易漏掉 encoding、base URL 和 protocol normalization；`new URL` 至少让 parser 行为显式。

**常见错误为什么错：**

“CORS 会阻止危险 URL”是错的。CORS 是跨源读取策略，不是 URL sink 安全策略。

**与真实项目的关系：**

avatar URL、download URL、return URL、external docs link、image CDN URL 都需要此类 validation。

**与当前学习主线的关系：**

它连接 Chapter 06 route query、Chapter 09 API return 和 Chapter 13 external service boundary。

**最终记忆模型：**

URL 是 browser action，不只是字符串。

<a id="section-9-6"></a>

### 9.6 Style injection boundary：style binding allowlist, clickjacking-like UI risk and safe design tokens

**结论：**

不要把 user-controlled raw CSS string 直接应用到 style sink。用 design token 和 property allowlist 生成 style object。

**本节解决的问题：**

样式注入不一定执行脚本，但可能隐藏警告、覆盖按钮、伪造 UI 或制造 clickjacking-like 交互风险。

**技术意义：**

style binding 是 DOM sink；它需要和 text rendering、URL validation 一样被 review。

**概念解释：**

`createSafeStyle` 只接受 `ColorToken`、`DensityToken`，把 token 转为固定 CSS values；`reviewRawStyleString` 永远 blocked。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节只允许 reviewed design tokens；clickjacking response header 和 CSP frame policy 在 9.8 处理。

**Security 机制证据链：**

untrusted value 是 desired style choice；source 是 UI input；sink 是 `:style`; protection 是 token allowlist；不适用的是 text escaping；backend authority 通常是 design system/policy review；test assertion 覆盖 token allowed/raw blocked；failure signal 是 arbitrary CSS string applied；rollback 是 default style。

**TypeScript / vue-tsc 编译期过程：**

`ColorToken` 和 `DensityToken` 联合类型限制 input；TS 不能证明颜色 contrast 或视觉欺骗风险。

**Vue / Browser / API / Backend Authority 运行时过程：**

select 更新 token；computed 生成 style object；Vue patch style；browser 应用固定属性值。

**API / 语法规则：**

使用 `:style="styleReview.style"`，但 style object 只来自 model allowlist。

**文件结构：**

`models/safeStyleModel.ts`、`components/SafeStyleAllowlistPanel.vue`、`tests/safeStyleModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/safeStyleModel.ts</span>
  </div>

```ts
export type ColorToken = "default" | "success" | "warning";
export type DensityToken = "comfortable" | "compact";

export function createSafeStyle(input: SafeStyleInput): StyleReview {
  return {
    status: "allowed",
    style: {
      color: colorValues[input.colorToken],
      backgroundColor: backgroundValues[input.backgroundToken],
      padding: input.density === "compact" ? "0.5rem" : "0.85rem",
    },
    reason: "Only reviewed design tokens are converted to inline style values.",
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/safeStyleModel.test.ts</span>
  </div>

```ts
it("blocks raw style strings", () => {
  const review = reviewRawStyleString("color: red");

  expect(review.status).toBe("blocked");
  expect(review.style).toEqual({});
});
```
</div>

**逐行解释：**

union type 限制 token；model 只读取 token map；raw style function 返回 empty style object；test 断言 raw string 不进入 DOM style。

**执行过程：**

用户选择 token；computed 生成 style object；template 将固定 object 交给 `:style`；raw style review 只显示 blocked 文本。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

untrusted style intent 被 token 化；sink 是 style object；client state 不持久化；test assertion 是 raw blocked；failure signal 是 arbitrary style applied；rollback 是删除 custom style control。

**为什么得到这个结果：**

因为 raw CSS string 从未进入 `styleReview.style`，Vue 只 patch reviewed object。

**对比写法：**

错误是保存用户 CSS 并直接绑定；正确是保存 token id，并由 trusted model 映射。

**常见错误为什么错：**

“CSS 不执行脚本所以没风险”是错的。UI redress、overlay、hidden warning 都是安全风险。

**与真实项目的关系：**

theme editor、white-label branding、CMS layout、admin dashboard column style 都需要 property allowlist。

**与当前学习主线的关系：**

它把 Chapter 08 的 theme UI 和 Chapter 15 的 visual/focus evidence 连接到 security risk。

**最终记忆模型：**

用户控制 style 时，只给 token，不给 CSS。

<a id="section-9-7"></a>

### 9.7 JavaScript injection boundary：inline handlers, script strings, eval-like sinks and dangerous context review

**结论：**

字符串形式的 JavaScript、inline handler text、dynamic script node 和 runtime code construction 都是 dangerous sink。本章只把它们列成 inventory，不执行。

**本节解决的问题：**

Vue 的 `@click="handler"` 是 trusted template code；但 user-controlled handler string、script text 或 timer string 是另一类 sink。

**技术意义：**

dangerous sink inventory 能让 code review 和 scan command 有明确目标。

**概念解释：**

`dangerousSinkReviews` 使用 `DangerousSinkKind` 枚举危险类别，`getSinkReviewAction` 返回 review action。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节覆盖 JavaScript execution sink；CSP 只能作为 defense-in-depth，不能替代移除 sink。

**Security 机制证据链：**

untrusted value 是 script-like string；source 是 API/user/CMS；sink 是 code execution path；protection 是 source ban and scan；不适用的是 Vue escaping；backend authority 是 content policy；evidence 是 source scan no matches；failure signal 是 forbidden pattern matched；rollback 是 revert feature or use trusted function reference。

**TypeScript / vue-tsc 编译期过程：**

`DangerousSinkKind` 限制 inventory item；TS 不会自动发现 runtime string execution unless code pattern exists and is scanned/reviewed。

**Vue / Browser / API / Backend Authority 运行时过程：**

`DangerousSinkPanel.vue` 只显示 label/risk/action；browser 不执行 inventory text；API/backend 不参与。

**API / 语法规则：**

Vue trusted event binding 使用 function reference；不使用 string execution sink。

**文件结构：**

`models/dangerousSinkModel.ts`、`components/DangerousSinkPanel.vue`，并用 `rg` 做 source pattern scan。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/dangerousSinkModel.ts</span>
  </div>

```ts
export type DangerousSinkKind =
  | "html-rendering"
  | "script-string"
  | "function-constructor"
  | "string-timer"
  | "inline-event-attribute"
  | "dynamic-script-node";

export function isDangerousSink(kind: DangerousSinkKind): boolean {
  return dangerousSinkReviews.some((sink) => sink.kind === kind);
}
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
rg -n --fixed-strings "eval(" src/learning/vue/chapter-16-security-boundary
rg -n --fixed-strings "new Function" src/learning/vue/chapter-16-security-boundary
rg -n --fixed-strings "onclick=" src/learning/vue/chapter-16-security-boundary
```
</div>

**逐行解释：**

union type 只命名 sink category；`isDangerousSink` 在 inventory 中查找；terminal commands 搜索 forbidden pattern，不运行 payload。

**执行过程：**

component 显示 inventory；validation 阶段运行 scan；如果 scan 有匹配，release gate blocked。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

trusted source 是 inventory file；untrusted script-like value 不进入 runtime；failure signal 是 scan match；rollback 是删除 sink or replace with trusted callback。

**为什么得到这个结果：**

因为练习只保存 category text，没有创建 execution path。

**对比写法：**

`@click="saveSettings"` 是 trusted SFC expression；user-provided handler text 是 untrusted code string。

**常见错误为什么错：**

“只在 admin 页面使用所以可以执行字符串”是错的。admin content often has broader permissions and higher impact。

**与真实项目的关系：**

广告 tag manager、CMS custom code、analytics snippets、workflow rule builder 都需要单独 architecture review。

**与当前学习主线的关系：**

它连接 Chapter 10 的 scan evidence 和 Chapter 11 的 release gate。

**最终记忆模型：**

函数引用可以 review；代码字符串不能信任。

<a id="section-9-8"></a>

### 9.8 CSP defense-in-depth：script-src, object-src, base-uri, frame-ancestors and report-only rollout

**结论：**

CSP 是 defense-in-depth。它能在浏览器收到 response header 后限制资源加载、script execution 和 embedding，但不能替代 safe rendering、backend validation 或 sink removal。

**本节解决的问题：**

团队常把 CSP report-only 当成已部署防护，或者以为有 CSP 就可以放松 HTML/JS sink review。

**技术意义：**

本章只构建 policy preview；没有配置 server response header，因此不能声称 CSP deployed。

**概念解释：**

`buildCspPolicy` 生成 `Content-Security-Policy` 或 `Content-Security-Policy-Report-Only` header name，以及 `default-src`、`script-src`、`object-src`、`base-uri`、`frame-ancestors`、`img-src` directives。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

CSP 属于 browser policy sink；server response header 是 authority。本地 component 只显示 preview。

**Security 机制证据链：**

untrusted value 是 policy config toggle；source 是 client state；sink 是 header preview string；browser protection only applies if server sends header；backend authority 是 deployment config；test assertion checks directives; failure signal 是 claiming deployment without header evidence；rollback 是 report-only or remove risky resource.

**TypeScript / vue-tsc 编译期过程：**

`CspMode` 限制 mode；`CspPolicyPreview` 要求 headerName/directives/serialized；TS 不能证明 header actually sent。

**Vue / Browser / API / Backend Authority 运行时过程：**

checkbox 更新 policy config；computed rebuilds policy；component renders serialized string；browser does not enforce it in this lab。

**API / 语法规则：**

使用 object model 生成 directive string，不动态修改 document header。

**文件结构：**

`models/cspPolicyModel.ts`、`models/clickjackingPolicyModel.ts`、`components/CspPolicyBuilderPanel.vue`、`tests/cspPolicyModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/cspPolicyModel.ts</span>
  </div>

```ts
const directives: Record<string, ReadonlyArray<string>> = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'none'"],
  "frame-ancestors": [config.blockEmbedding ? "'none'" : "'self'"],
  "img-src": config.allowImagesFromDataSource ? ["'self'", "data:"] : ["'self'"],
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/cspPolicyModel.test.ts</span>
  </div>

```ts
expect(policy.headerName).toBe("Content-Security-Policy-Report-Only");
expect(policy.directives["frame-ancestors"]).toEqual(["'none'"]);
expect(policy.serialized).toContain("script-src 'self'");
```
</div>

**逐行解释：**

directive map 固定 policy surface；report-only/enforce 决定 header name；test 验证关键 directive presence。

**执行过程：**

toggle 变更 config；computed calls `buildCspPolicy`；preview string 更新；没有 HTTP response header。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

client state 只是 preview input；sink 是 string display；browser policy 未部署；backend authority 是 server config；failure signal 是缺少 header evidence；rollback 是 report-only rollout。

**为什么得到这个结果：**

model 只返回 header text；浏览器只有在 response header 存在时才执行 CSP。

**对比写法：**

错误是把 UI preview 当 deployed header；正确是要求 network response evidence。

**常见错误为什么错：**

“CSP 能替代 sanitizer”是错的。CSP 可降低某些 exploit impact，但不能让 unsafe sink 变安全。

**与真实项目的关系：**

production deployment 需要 server/framework config、report endpoint、violation triage、third-party script inventory 和 staged rollout。

**与当前学习主线的关系：**

它连接 Chapter 11 的 deployment evidence 与 Chapter 13 的 production pattern。

**最终记忆模型：**

CSP 是安全带，不是驾驶员。

<a id="section-9-9"></a>

### 9.9 API security boundary：credentials, SameSite, CORS misconception, Fetch Metadata and custom headers

**结论：**

前端可以选择 credentials mode、发送 custom header、按 backend protocol 组织 request；但 SameSite、session validation、Fetch Metadata handling 和 authorization authority 都在 backend/server policy。

**本节解决的问题：**

CORS 经常被误认为 authorization。实际上 CORS 控制 browser 是否允许 frontend 读取跨源 response，不证明用户有权限。

**技术意义：**

API request security 需要 client metadata + backend enforcement。只改 Vue component 不会创建 auth system。

**概念解释：**

`SecurityRequestPolicy` 记录 endpoint、method、credentialsMode、requiresCsrfHeader、requiresBackendAuthorization。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节覆盖 request metadata；CSRF token/header 在 9.10，route guard authority 在 9.12。

**Security 机制证据链：**

sensitive value 是 session-bound request; source 是 UI action; sink is API request metadata; browser applies credential rules and CORS read policy; backend must validate session/role/CSRF; test evidence is policy model; failure signal is frontend-only authorization claim; rollback is disable API action or backend check.

**TypeScript / vue-tsc 编译期过程：**

`SecurityRequestPolicy` 限制 method and credentials values；TS cannot prove server validates session or Fetch Metadata。

**Vue / Browser / API / Backend Authority 运行时过程：**

component renders policy list；no network request is sent；browser has no CORS decision to make in this lab。

**API / 语法规则：**

使用 typed policy model，避免在 UI copy 中声称 backend exists。

**文件结构：**

`models/apiSecurityBoundaryModel.ts`、`components/ApiSecurityBoundaryPanel.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/apiSecurityBoundaryModel.ts</span>
  </div>

```ts
export interface SecurityRequestPolicy {
  readonly endpoint: string;
  readonly method: "GET" | "POST" | "PUT" | "DELETE";
  readonly credentialsMode: "same-origin" | "include" | "omit";
  readonly requiresCsrfHeader: boolean;
  readonly requiresBackendAuthorization: boolean;
}
```
</div>

**逐行解释：**

endpoint/method define request surface；credentialsMode models browser credential behavior；requiresBackendAuthorization prevents frontend-only authority claim。

**执行过程：**

component lists policies；developer sees backend dependency; no request leaves browser。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

sensitive request does not execute; sink is policy display; backend authority flag is true; failure signal is code/comment claiming CORS as authorization; rollback is remove claim and add backend requirement。

**为什么得到这个结果：**

Because CORS and credentials are browser request/response mechanics, not user permission proof。

**对比写法：**

错误是“route visible + CORS allowed = authorized”；正确是“backend verifies session/role and returns allowed data”。

**常见错误为什么错：**

Treating CORS as authentication ignores same-origin scripts and server-side requests, and ignores whether the backend checked identity。

**与真实项目的关系：**

每个 protected API action 都需要 backend owner、session protocol、CSRF story、authorization story 和 logging/privacy story。

**与当前学习主线的关系：**

它直接延续 Chapter 09 front-back boundary。

**最终记忆模型：**

CORS controls reading; backend controls permission。

<a id="section-9-10"></a>

### 9.10 CSRF request boundary：token/header submission, session binding and backend coordination

**结论：**

前端可以按 protocol 发送 CSRF token/header，但 CSRF 是否有效取决于 backend session binding and validation。

**本节解决的问题：**

很多代码只添加 header 就声称“CSRF solved”。如果 backend 不验证 token/session/header，前端 header 没有安全意义。

**技术意义：**

CSRF 是 browser credential + server session protocol 问题，不是 Vue state problem。

**概念解释：**

`createSecureRequestHeaders` 根据 `requiresCsrfHeader` 加 `X-CSRF-Token`，`requiresServerCsrfValidation` 明确非 GET 且需要 header 时 backend validation required。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节只模拟 header construction，不创建 backend CSRF validation。

**Security 机制证据链：**

sensitive value is CSRF token placeholder; source is backend/session protocol; sink is request header; browser sends request; backend must validate; TS checks header shape; test asserts header inclusion; failure signal is CSRF solved claim without backend evidence; rollback is disable mutation request until backend protocol exists。

**TypeScript / vue-tsc 编译期过程：**

`CsrfHeaderInput` requires policy and token string；TS cannot prove token authenticity or session binding。

**Vue / Browser / API / Backend Authority 运行时过程：**

component selects endpoint and token text; computed creates header object; no real fetch occurs; backend validation remains UNKNOWN。

**API / 语法规则：**

Use custom header model only when backend expects and validates it。

**文件结构：**

`models/csrfRequestModel.ts`、`components/CsrfRequestBoundaryPanel.vue`、`tests/csrfRequestModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/csrfRequestModel.ts</span>
  </div>

```ts
export function createSecureRequestHeaders(
  input: CsrfHeaderInput,
): Readonly<Record<string, string>> {
  const headers: Record<string, string> = {
    "X-Requested-With": "XMLHttpRequest",
  };

  if (input.policy.requiresCsrfHeader) {
    headers["X-CSRF-Token"] = input.csrfToken;
  }

  return headers;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/csrfRequestModel.test.ts</span>
  </div>

```ts
expect(headers["X-CSRF-Token"]).toBe("demo-token");
expect(headers["X-Requested-With"]).toBe("XMLHttpRequest");
```
</div>

**逐行解释：**

headers object starts with AJAX marker；CSRF header only appears when policy requires it；test checks construction, not backend validation。

**执行过程：**

select endpoint; computed selected policy; header model rebuilds; component displays JSON。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

token placeholder exists only in client state; sink is header object; backend authority remains required; test assertion proves inclusion; failure signal is missing backend validation evidence; rollback is disable mutation UI。

**为什么得到这个结果：**

Because policy for `/api/settings` requires CSRF header and method is POST。

**对比写法：**

Adding header without server validation is ceremony, not protection。

**常见错误为什么错：**

SameSite cookie policy is set by server cookie header, not by Vue component state。

**与真实项目的关系：**

Mutation APIs need backend contract docs, token source, rotation/retry story and failure UX。

**与当前学习主线的关系：**

It connects API boundary, auth/session and release evidence。

**最终记忆模型：**

前端提交 token；后端验证 token。

<a id="section-9-11"></a>

### 9.11 Auth and token storage boundary：cookie, localStorage, sessionStorage, memory state and XSS impact

**结论：**

Token storage 是 XSS impact decision。HttpOnly cookie、memory state、sessionStorage、localStorage 的 persistence and JavaScript readability 不同。

**本节解决的问题：**

把 token 放进 localStorage 简单，但一旦发生 XSS，JS-readable token 的影响更大。

**技术意义：**

Storage choice 不是 Vue convenience; 它需要 session architecture、backend cookie flags、refresh strategy and privacy review。

**概念解释：**

`AuthStorageOption` 记录 persistence、readableByJavaScript、riskScore 和 coordination。`rankAuthStorageRisk` 按 risk 排序。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

本节不实现 auth；只比较 storage risk。

**Security 机制证据链：**

sensitive value is auth credential; source is backend auth flow; sink is storage location; browser applies cookie/storage mechanics; backend owns session validation; TS checks option shape; test checks risk order; failure signal is token persisted without XSS impact review; rollback is remove persistent storage and re-auth。

**TypeScript / vue-tsc 编译期过程：**

`AuthStorageKind` restricts listed storage choices；TS cannot verify cookie flags or XSS absence。

**Vue / Browser / API / Backend Authority 运行时过程：**

component renders risk table; no token is written to storage; browser storage APIs are not called。

**API / 语法规则：**

Use readonly model array and sorting copy; do not mutate global option list。

**文件结构：**

`models/authStorageRiskModel.ts`、`components/AuthStorageRiskPanel.vue`、`tests/authStorageRiskModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/authStorageRiskModel.ts</span>
  </div>

```ts
export interface AuthStorageOption {
  readonly kind: AuthStorageKind;
  readonly persistence: "none" | "tab" | "browser";
  readonly readableByJavaScript: boolean;
  readonly riskScore: number;
  readonly coordination: string;
}

export function rankAuthStorageRisk(
  options: ReadonlyArray<AuthStorageOption> = authStorageOptions,
): ReadonlyArray<AuthStorageOption> {
  return [...options].sort((left, right) => left.riskScore - right.riskScore);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/authStorageRiskModel.test.ts</span>
  </div>

```ts
const ranked = rankAuthStorageRisk();

expect(ranked[0].kind).toBe("http-only-cookie");
expect(ranked.at(-1)?.kind).toBe("local-storage");
```
</div>

**逐行解释：**

interface records storage attributes; ranking copies input before sorting; test proves lower-risk option appears before local-storage。

**执行过程：**

module exports options; component calls rank; table renders values; no credential exists。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

sensitive token is theoretical; storage location is model data; backend authority is session validation; failure signal is real token written to localStorage in demo; rollback is delete storage write。

**为什么得到这个结果：**

Risk score encodes JS readability and persistence impact。

**对比写法：**

“Use localStorage because it survives reload” ignores XSS impact and logout/session invalidation behavior。

**常见错误为什么错：**

HttpOnly cookies reduce JS token theft but require backend cookie flags and CSRF/session design。

**与真实项目的关系：**

Auth storage decision must involve backend, security review, product UX and incident response。

**与当前学习主线的关系：**

It connects Chapter 09 API auth boundary and Chapter 11 production risk。

**最终记忆模型：**

Storage convenience changes breach impact。

<a id="section-9-12"></a>

### 9.12 Route guard vs backend authorization：frontend UX guard, backend authority and API response evidence

**结论：**

Route guard controls UX visibility and navigation flow. API authorization belongs to backend.

**本节解决的问题：**

隐藏菜单或阻止 route navigation 经常被误写成“权限安全”。用户仍可能 call API directly, change client state, or inspect bundled code。

**技术意义：**

Route guard should improve UX, not become authority boundary。

**概念解释：**

`reviewRouteAuthorization` returns `hide-ux-route`, `require-backend-check`, or `allow-ux-route`, but always keeps `backendAuthorityRequired` true。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers route guard UX and backend authorization; it does not implement real Router guard or backend API。

**Security 机制证据链：**

sensitive value is role claim; source is client state/API; sink is route visibility; frontend guard hides UX; backend must authorize data; TS checks decision shape; test asserts backend authority flag; failure signal is API returns protected data without backend role check; rollback is hide feature and block endpoint。

**TypeScript / vue-tsc 编译期过程：**

`RouteAccessDecision` union controls status strings；TS cannot prove role source authentic。

**Vue / Browser / API / Backend Authority 运行时过程：**

component toggles role flags; computed review updates decision text; no real route navigation or API call occurs。

**API / 语法规则：**

Keep route guard language separate from API authorization language。

**文件结构：**

`models/routeAuthorizationBoundaryModel.ts`、`components/RouteAuthorizationBoundaryPanel.vue`、`tests/routeAuthorizationBoundaryModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/routeAuthorizationBoundaryModel.ts</span>
  </div>

```ts
export function reviewRouteAuthorization(
  input: RouteAuthorizationInput,
): RouteAuthorizationReview {
  if (!input.hasClientRole) {
    return {
      routeName: input.routeName,
      decision: "hide-ux-route",
      backendAuthorityRequired: true,
      reason: "Client route guard can hide navigation but cannot authorize data.",
    };
  }
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/routeAuthorizationBoundaryModel.test.ts</span>
  </div>

```ts
expect(review.decision).toBe("hide-ux-route");
expect(review.backendAuthorityRequired).toBe(true);
```
</div>

**逐行解释：**

Absent client role hides UX route; backendAuthorityRequired stays true; test prevents future change that claims frontend authority。

**执行过程：**

checkbox changes `hasClientRole`; computed review re-runs; badge updates decision。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

role claim is client state and not authority; sink is UX visibility; backend authority flag true; failure signal is protected API without backend check; rollback is server denial and hidden route。

**为什么得到这个结果：**

Because frontend state can be modified and bundled code can be inspected; backend alone can enforce data access。

**对比写法：**

Route guard is acceptable for navigation UX; API middleware/server handler is required for authorization。

**常见错误为什么错：**

Treating a hidden menu as secure ignores direct API access。

**与真实项目的关系：**

Admin pages need both Router UX guards and backend role checks with test/evidence。

**与当前学习主线的关系：**

It repairs the common misunderstanding from Chapter 06 permission routing。

**最终记忆模型：**

Route guard hides doors; backend locks data。

<a id="section-9-13"></a>

### 9.13 Privacy data boundary：PII classification, URL/log/localStorage/error-report leakage and data minimization

**结论：**

Personal and secret data should not flow into URL、logs、localStorage、analytics or error reports without review。

**本节解决的问题：**

UI code often leaks email, token, account id, internal label, or error detail through route query, console logs, analytics events, or persisted state。

**技术意义：**

Privacy boundary is part of frontend security evidence; it is not solved by escaping or type checking。

**概念解释：**

`reviewPrivacySink` combines `classification` and `sink` and returns allowed/blocked/requires-review。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers privacy sinks; env exposure has its own gate in 9.14。

**Security 机制证据链：**

sensitive value is personal data; source is user/API; sink is URL/log/storage/error-report; browser may persist URL/history/storage; backend/privacy review required; TS checks classification; test blocks PII URL; failure signal is sensitive data in observable sink; rollback is remove field/minimize data。

**TypeScript / vue-tsc 编译期过程：**

`DataClassification` and `DataSink` restrict categories; TS cannot detect actual personal data content automatically。

**Vue / Browser / API / Backend Authority 运行时过程：**

component selects classification and sink; computed review updates status; no browser storage or log write occurs。

**API / 语法规则：**

Use explicit classification before persistence or telemetry。

**文件结构：**

`models/privacyDataClassificationModel.ts`、`components/PrivacyDataClassificationPanel.vue`、`tests/privacyDataClassificationModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/privacyDataClassificationModel.ts</span>
  </div>

```ts
if (input.classification === "personal" && input.sink !== "screen") {
  return {
    ...input,
    status: "blocked",
    reason: "Personal data needs minimization before URL, storage, log, analytics, or error sinks.",
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/privacyDataClassificationModel.test.ts</span>
  </div>

```ts
const review = reviewPrivacySink({
  label: "profile-email",
  classification: "personal",
  sink: "url",
});

expect(review.status).toBe("blocked");
```
</div>

**逐行解释：**

personal data allowed only on screen in this learning model; URL sink blocked; test ties profile-email example to blocked status。

**执行过程：**

select changes classification/sink; computed model returns result; UI renders status; no URL/log/storage write happens。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

PII value stays in review model; sink blocked; backend/privacy authority required; test assertion blocks URL; rollback is remove from query/log/storage。

**为什么得到这个结果：**

Because URLs are copied, logged, cached, stored in history and often sent through referrers。

**对比写法：**

Use opaque IDs or server-side lookup instead of putting personal fields in query strings。

**常见错误为什么错：**

“It is only in browser console” is wrong; logs and error reports can be exported, retained and shared。

**与真实项目的关系：**

Analytics, monitoring, customer support tools and bug reports need privacy field review。

**与当前学习主线的关系：**

It connects Chapter 09 API data and Chapter 11 production evidence。

**最终记忆模型：**

Sensitive data has travel history。

<a id="section-9-14"></a>

### 9.14 Environment exposure boundary：VITE_ client values, runtime config, secret leakage and build evidence

**结论：**

`VITE_` prefixed env values are exposed to client bundle and must not contain secrets。

**本节解决的问题：**

前端项目常把 token、private endpoint、internal config 放进 client env，然后误以为 `.env` 文件没有提交就安全。

**技术意义：**

Build-time exposure 是 tooling boundary；不是 Vue runtime state。

**概念解释：**

`reviewEnvExposure` checks whether key starts with `VITE_` and blocks secret values when exposed。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers client env exposure; server-only runtime config is outside this runnable Vue app。

**Security 机制证据链：**

sensitive value is env secret; source is build environment; sink is client bundle; Vite exposes prefixed keys; backend/server-only config required for secrets; TS checks input shape; test blocks secret client key; failure signal is secret in bundle; rollback is remove prefix and rotate secret。

**TypeScript / vue-tsc 编译期过程：**

TS can type `EnvExposureInput`; it cannot prevent operator from setting real secret in `.env` or prove bundled content absent unless build artifact checked。

**Vue / Browser / API / Backend Authority 运行时过程：**

component uses sample key text only; no real env file is read; browser displays model result。

**API / 语法规则：**

Use `import.meta.env` only for public client configuration; keep secrets server-side。

**文件结构：**

`models/envExposureModel.ts`、`components/EnvExposurePanel.vue`、`tests/envExposureModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/envExposureModel.ts</span>
  </div>

```ts
export function reviewEnvExposure(input: EnvExposureInput): EnvExposureReview {
  const exposedToClient = input.key.startsWith("VITE_");

  if (exposedToClient && input.valueClassification === "secret") {
    return {
      ...input,
      exposedToClient,
      status: "blocked",
      reason: "Client-exposed env keys must not contain secrets.",
    };
  }
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/envExposureModel.test.ts</span>
  </div>

```ts
const review = reviewEnvExposure({
  key: "VITE_PRIVATE_TOKEN",
  valueClassification: "secret",
});

expect(review.exposedToClient).toBe(true);
expect(review.status).toBe("blocked");
```
</div>

**逐行解释：**

prefix check models Vite client exposure; secret classification blocks client exposure; test prevents accidental allowed status。

**执行过程：**

input key changes; computed review updates; UI shows exposedToClient and status; no real secret read。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

secret-like value is model data; sink is client bundle concept; backend/server config owns real secret; failure signal is prefixed secret; rollback is remove prefix and rotate。

**为什么得到这个结果：**

Vite statically replaces client-exposed env values into code reachable by browser。

**对比写法：**

Public feature flag can use prefix; secret API key must stay server-side。

**常见错误为什么错：**

“The repo is private” does not prevent client bundle inspection after deployment。

**与真实项目的关系：**

Env review belongs in deployment checklist and secret management policy。

**与当前学习主线的关系：**

It connects Chapter 11 build evidence and Chapter 13 runtime config boundary。

**最终记忆模型：**

If it is in the client bundle, it is public。

<a id="section-9-15"></a>

### 9.15 Dependency and supply-chain risk：package trust, lockfile review, dangerous DOM libraries and update policy

**结论：**

DOM rendering、rich text、auth、routing、storage 相关依赖是 security-relevant。Lockfile changes need review; scanner results cannot be invented。

**本节解决的问题：**

依赖增加看起来像普通 feature work，但 package 可以改变 DOM sink、routing behavior、storage behavior、build output and transitive code。

**技术意义：**

Supply-chain review is evidence, not TypeScript behavior。

**概念解释：**

`classifyDependencyRisk` maps category and lockfile change to low/medium/high review action。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers dependency trust; no dependency is installed in this chapter。

**Security 机制证据链：**

sensitive value is dependency code; source is package registry/lockfile; sink is app bundle/DOM/storage; browser executes bundled code; backend cannot fix client supply-chain issue alone; TS checks types only; evidence is lockfile review and scanner output if run; failure signal is high-risk dependency without owner; rollback is remove package or pin version。

**TypeScript / vue-tsc 编译期过程：**

Types may compile even if package behavior is unsafe or maintainer trust is weak。

**Vue / Browser / API / Backend Authority 运行时过程：**

component only classifies metadata; no package is installed or executed。

**API / 语法规则：**

Use category model and review action; do not add scanner package by default。

**文件结构：**

`models/dependencyRiskModel.ts`、`components/DependencyRiskPanel.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/dependencyRiskModel.ts</span>
  </div>

```ts
const highRiskCategories = new Set<DependencyRiskCategory>([
  "dom-rendering",
  "rich-text",
  "auth",
  "storage",
]);

export function classifyDependencyRisk(
  input: DependencyRiskInput,
): DependencyRiskReview {
  if (highRiskCategories.has(input.category)) {
    return {
      ...input,
      risk: "high",
      reviewAction: "Require owner review, changelog review, and security evidence.",
    };
  }
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/dependencyRiskModel.test.ts</span>
  </div>

```ts
const review = classifyDependencyRisk({
  packageName: "@scope/rich-text",
  category: "rich-text",
  changesLockfile: false,
});

expect(review.risk).toBe("high");
```
</div>

**逐行解释：**

high-risk set names sensitive package surfaces; function escalates category before lockfile convenience; test verifies rich-text dependency is high risk。

**执行过程：**

component input changes package/category; computed review updates action; no install command runs。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

dependency metadata is untrusted until reviewed; sink is bundle; test assertion only proves model; failure signal is high-risk package without evidence; rollback is remove dependency。

**为什么得到这个结果：**

Rich text package can influence HTML rendering boundary, so model marks it high risk。

**对比写法：**

Blindly adding DOM sanitizer package without understanding its trust boundary can increase risk。

**常见错误为什么错：**

Claiming `npm audit` passed without running it is false evidence。

**与真实项目的关系：**

PR review should include lockfile diff, maintainer signal, changelog, package purpose, alternatives and scanner output when available。

**与当前学习主线的关系：**

It connects Chapter 14 migration dependency review and Chapter 11 release evidence。

**最终记忆模型：**

Dependencies are code you ship。

<a id="section-9-16"></a>

### 9.16 Security tests and dangerous pattern scans：model tests, grep checks, review gates and command evidence

**结论：**

Tests and scans are evidence, not proof of perfect security. They catch known model behavior and banned patterns。

**本节解决的问题：**

Without command evidence, security statements become opinions. Without scope, scans can overclaim。

**技术意义：**

This chapter validates pure models with Vitest and scans source for forbidden sinks。

**概念解释：**

Model tests assert blocked/allowed/requires-review outcomes. Pattern scans search source for dangerous execution or rendering paths。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers evidence generation; backend security remains UNKNOWN unless separately verified。

**Security 机制证据链：**

untrusted value enters model tests; sink is assertion result; protection is regression test and pattern scan; TypeScript helps compile tests; runtime security not proven; failure signal is failing test or matched forbidden pattern; rollback is revert change and reopen issue。

**TypeScript / vue-tsc 编译期过程：**

`vue-tsc` checks source and test imports when included; Vitest executes model functions。

**Vue / Browser / API / Backend Authority 运行时过程：**

Tests run in Node/jsdom environment; browser manual review is separate。

**API / 语法规则：**

Use project scripts from `package.json`; use `rg` when `grep` is unavailable on Windows。

**文件结构：**

`tests/*.test.ts` and `models/securityIssueModel.ts` provide local evidence points。

**示例代码：**

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
rg -n --fixed-strings "v-html" src/learning/vue/chapter-16-security-boundary
rg -n --fixed-strings "innerHTML" src/learning/vue/chapter-16-security-boundary
rg -n --fixed-strings "@ts-ignore" src/learning/vue/chapter-16-security-boundary
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/securityIssueModel.test.ts</span>
  </div>

```ts
const blockingIssues = getBlockingSecurityIssues(securityIssues);

expect(blockingIssues.map((issue) => issue.id)).toEqual(["sec-html-001"]);
expect(canReleaseSecurityWork(securityIssues)).toBe(false);
```
</div>

**逐行解释：**

commands run type/test/build/scan evidence; test asserts known open issue blocks release。

**执行过程：**

CI/local command executes; failed test or scan match returns non-zero/visible output; release table records result。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

evidence becomes release input; failure signal is command failure or scan match; rollback is revert or mitigation。

**为什么得到这个结果：**

Known high open issue remains in model, so releaseAllowed false。

**对比写法：**

Manual confidence without command output is UNKNOWN, not PASS。

**常见错误为什么错：**

Running `npm run build` does not prove dependency scan, CSP deployment, CSRF validation or backend authorization。

**与真实项目的关系：**

Security review should store command output, reviewer, backend ticket and release decision。

**与当前学习主线的关系：**

It reuses Chapter 10 testing and Chapter 11 deployment evidence habits。

**最终记忆模型：**

Security evidence must be reproducible。

<a id="section-9-17"></a>

### 9.17 Security issue dashboard：severity, owner, evidence, backend dependency, release gate and rollback

**结论：**

Known high/critical open security issues block release unless mitigated or explicitly accepted with owner and evidence。

**本节解决的问题：**

Security work often fails not because no issue was found, but because issue status、owner、rollback and backend dependency were unclear。

**技术意义：**

Dashboard turns security findings into release decisions。

**概念解释：**

`SecurityIssue` records severity, owner, evidence, backendDependency, status and rollbackPath。`getBlockingSecurityIssues` filters high/critical open issues。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers release gate, not vulnerability remediation implementation。

**Security 机制证据链：**

issue source is test/scan/review/backend ticket; sink is release gate; protection is blocking logic; TypeScript checks issue shape; runtime security not proven; failure signal is open high/critical issue; rollback is issue.rollbackPath。

**TypeScript / vue-tsc 编译期过程：**

`SecuritySeverity` and `SecurityIssueStatus` restrict status values; TS cannot judge whether evidence is sufficient。

**Vue / Browser / API / Backend Authority 运行时过程：**

dashboard reads issue list and computed gate; browser displays block state; no deployment action occurs。

**API / 语法规则：**

Use pure filter and boolean gate; do not hide known issues in UI。

**文件结构：**

`models/securityIssueModel.ts`、`components/SecurityVerificationDashboard.vue`、`composables/useSecurityIssueGate.ts`、`tests/securityIssueModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/securityIssueModel.ts</span>
  </div>

```ts
export function getBlockingSecurityIssues(
  issues: ReadonlyArray<SecurityIssue>,
): ReadonlyArray<SecurityIssue> {
  return issues.filter((issue) => {
    const severe = issue.severity === "high" || issue.severity === "critical";

    return severe && issue.status === "open";
  });
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/composables/useSecurityIssueGate.ts</span>
  </div>

```ts
const blockingIssues = computed(() => getBlockingSecurityIssues(issues));
const releaseAllowed = computed(() => canReleaseSecurityWork(issues));
```
</div>

**逐行解释：**

filter checks severity and status; composable exposes computed gate; dashboard renders false when open high issue exists。

**执行过程：**

module loads issue list; composable computes blockers; component reads computed values; UI displays blocking count。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

issue evidence becomes trusted release input; sink is dashboard; failure signal is open high issue; rollback path is stored per issue。

**为什么得到这个结果：**

`sec-html-001` is high and open, so release gate false。

**对比写法：**

Marking issue fixed without test/scan/backend evidence removes the gate without reducing risk。

**常见错误为什么错：**

Shipping known high-risk issue with no rollback leaves product and incident team without control。

**与真实项目的关系：**

Security dashboard should link to ticket, owner, evidence, mitigation, backend dependency and rollback。

**与当前学习主线的关系：**

It connects Chapter 11 rollback and Chapter 15 evidence dashboard。

**最终记忆模型：**

Open severe issue blocks release until evidence changes。

<a id="section-9-18"></a>

### 9.18 Chapter integration：how Chapter 16 connects API, tests, production, Nuxt, migration and accessibility

**结论：**

Chapter 16 is an integration chapter: API boundary, tests, production rollout, SSR/Nuxt boundary, migration dependency review and accessibility evidence all become security inputs。

**本节解决的问题：**

Security is often isolated as a checklist. In Vue projects it crosses Router, API, storage, build, SSR, UI, tests and deployment。

**技术意义：**

The root shell integration lets you inspect Chapter 16 beside previous chapters without rewriting them。

**概念解释：**

`SecurityBoundaryChapterApp.vue` imports the Chapter 16 panels and CSS。`App.vue` only adds one import and one divider/panel pair after Chapter 15。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers integration boundary; it does not modify Chapter 01–15 guides。

**Security 机制证据链：**

source is Chapter 16 app component; sink is learning shell; Vue render protection is standard component rendering; backend authority unchanged; evidence is file import and successful type/build; failure signal is package/source broad rewrite; rollback is remove Chapter 16 import and panel。

**TypeScript / vue-tsc 编译期过程：**

Import path and component template are checked by `vue-tsc`; it cannot prove runtime security claims。

**Vue / Browser / API / Backend Authority 运行时过程：**

root app renders existing chapters, divider, then Chapter 16 panel; browser displays all panels; no API/backend integration added。

**API / 语法规则：**

Use static component import and existing shell pattern。

**文件结构：**

`SecurityBoundaryChapterApp.vue` and `src/learning/vue/chapter-01-application-boundary/App.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/SecurityBoundaryChapterApp.vue</span>
  </div>

```vue
<template>
  <section class="chapter-section chapter-16" aria-labelledby="chapter-16-title">
    <header class="hero">
      <p class="eyebrow">Chapter 16</p>
      <h2 id="chapter-16-title">
        Security, Trusted Boundary, XSS, CSRF, CSP, and Privacy Evidence
      </h2>
    </header>

    <TrustedRenderingPanel />
    <SecurityVerificationDashboard />
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-01-application-boundary/App.vue</span>
  </div>

```vue
<AccessibilityResponsiveChapterApp />

<div class="chapter-divider" role="separator"></div>

<SecurityBoundaryChapterApp />
```
</div>

**逐行解释：**

Chapter app owns its own panels；root shell preserves Chapter 15 and appends Chapter 16；divider follows existing visual structure。

**执行过程：**

Vite imports SFC modules；Vue renders root app；Chapter 16 subtree mounts after Chapter 15。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

trusted source is new chapter app; sink is local learning shell; no backend authority changed; test/build evidence required; rollback is remove import/render block。

**为什么得到这个结果：**

Static SFC import keeps integration explicit and type-checkable。

**对比写法：**

Creating a separate app or rewriting prior chapters would widen scope and lose continuity。

**常见错误为什么错：**

Adding security chapter by changing package dependencies or global architecture violates this local learning task boundary。

**与真实项目的关系：**

Security work should integrate into existing app shell with minimal, reviewable changes。

**与当前学习主线的关系：**

It keeps Chapter 01–15 available for comparison and review。

**最终记忆模型：**

Integrate security evidence without rewriting the learning system。

<a id="section-9-19"></a>

### 9.19 Final integration：vue-security-boundary-lab 如何形成 security evidence workspace

**结论：**

`vue-security-boundary-lab` is a local security evidence workspace: models classify values, components show decisions, tests assert rules, scans check forbidden patterns, and issue dashboard blocks risky release。

**本节解决的问题：**

单个安全片段很容易变成孤立示例；最终 workspace 把 trusted boundary、sinks、backend authority 和 evidence 串成一个 release story。

**技术意义：**

Security learning should leave reproducible artifacts: file paths, tests, command output, known UNKNOWN items and rollback paths。

**概念解释：**

Final app composes all panels: rendering, rich text, URL, style, dangerous sinks, CSP, API, CSRF, auth storage, route authorization, privacy, env, dependency and release gate。

**边界：trusted template、escaped rendering、untrusted HTML、URL protocol、style allowlist、dangerous sink、browser CSP、cookie/session、CSRF token/header、CORS boundary、route guard UX、backend authorization、client storage、env exposure、privacy data、dependency trust、test evidence、release gate：**

This section covers final evidence workspace; it still does not claim production security。

**Security 机制证据链：**

values enter models; sinks are reviewed components; protection differs per sink; backend authority remains explicit; TS and tests check local model; scans check forbidden patterns; failure signal blocks release; rollback path exists per issue or feature。

**TypeScript / vue-tsc 编译期过程：**

The whole chapter compiles through SFC imports and TypeScript models; compile success is necessary but not sufficient。

**Vue / Browser / API / Backend Authority 运行时过程：**

Vue renders local panels; browser displays safe text and policy previews; no real backend auth/CSRF/CSP/dependency scan exists。

**API / 语法规则：**

Use small pure models, typed components, computed previews and local tests。

**文件结构：**

`src/learning/vue/chapter-16-security-boundary/` contains the final workspace。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/SecurityBoundaryChapterApp.vue</span>
  </div>

```vue
<TrustedRenderingPanel />

<div class="security-grid">
  <EscapedTextRenderingDemo />
  <RichTextRiskPanel />
  <SafeUrlReviewPanel />
  <SafeStyleAllowlistPanel />
  <DangerousSinkPanel />
  <CspPolicyBuilderPanel />
  <ApiSecurityBoundaryPanel />
  <CsrfRequestBoundaryPanel />
  <AuthStorageRiskPanel />
  <RouteAuthorizationBoundaryPanel />
  <PrivacyDataClassificationPanel />
  <EnvExposurePanel />
  <DependencyRiskPanel />
</div>

<SecurityVerificationDashboard />
```
</div>

**逐行解释：**

The app starts with trust classification, then reviews each sink, then ends with release evidence。

**执行过程：**

Vite loads the module graph; Vue mounts each panel; computed models respond to local input; tests and scans provide offline evidence。

**trusted source、untrusted value、sink、browser policy、backend authority、client state、storage location、test assertion、failure signal 与 rollback path 的变化：**

All risky values stay in models and visible text; no unsafe storage/write/rendering path is created; release gate records failure signals and rollback paths。

**为什么得到这个结果：**

The lab treats every security concept as a boundary with owner and evidence, not as a one-line API trick。

**对比写法：**

A checklist without runnable files cannot show value flow; a runnable app without tests/scans cannot produce evidence。

**常见错误为什么错：**

Calling the lab “secure” would overclaim; it is a training workspace with known UNKNOWN external checks。

**与真实项目的关系：**

Real projects need the same structure plus backend code, response headers, scanner output, monitoring and privacy/legal review。

**与当前学习主线的关系：**

It consolidates Chapter 09–15 into a security release model。

**最终记忆模型：**

Security work is boundary classification plus reproducible evidence。

## 10. API / 语法索引

| API / syntax | 层级 | 本章用途 | 不能证明什么 |
| --- | --- | --- | --- |
| `{{ value }}` | Vue template/runtime | text display with escaping | HTML sanitizer, URL safety, authorization |
| `v-model` | Vue template/runtime | local input state for review panels | input is trusted |
| `computed` | Vue reactivity | recompute policy/review objects | security outcome correctness |
| `new URL(value, baseUrl)` | Browser platform API | parse and normalize URL candidates | destination trust or backend persistence |
| `ReadonlyArray<T>` | TypeScript | prevent accidental model mutation shape | runtime security |
| union types | TypeScript | restrict status/kind/mode values | real backend behavior |
| `Content-Security-Policy` | HTTP/browser policy | enforcement when response header exists | safe code or backend validation |
| `Content-Security-Policy-Report-Only` | HTTP/browser policy | rollout telemetry without blocking | enforcement |
| `frame-ancestors` | CSP directive | embedding/clickjacking policy | UI integrity by itself |
| `credentialsMode` | Fetch/request concept | model cookie/session request behavior | authorization |
| `X-CSRF-Token` | request header concept | submit token to backend protocol | backend validation |
| `VITE_` prefix | Vite tooling | client bundle exposure boundary | secrecy |

## 11. 常见错误表

| # | Common mistake | Why wrong | Correction |
| --- | --- | --- | --- |
| 1 | Treating Vue escaping as total security. | Escaping covers normal text/attribute rendering only. | Classify every sink separately. |
| 2 | Rendering user content with `v-html` without trusted source or sanitizer. | HTML sink can execute browser behaviors. | Use backend sanitizer or plain text. |
| 3 | Compiling user-provided templates. | Template is executable code. | Keep templates trusted source. |
| 4 | Treating frontend sanitizer as backend authority. | Client code can be bypassed. | Validate/sanitize before persistence and API return. |
| 5 | Allowing `javascript:` or unreviewed protocols in href/src. | Browser interprets URL protocols. | Use URL parser and protocol allowlist. |
| 6 | Storing secrets in `VITE_` env variables. | Vite exposes prefixed values to client bundle. | Keep secrets server-side. |
| 7 | Storing access tokens in localStorage without XSS impact review. | JS-readable persistent token increases impact. | Review storage risk and backend session design. |
| 8 | Treating route guards as API authorization. | Client state can be changed. | Enforce authorization on backend. |
| 9 | Treating CORS as authentication or authorization. | CORS controls browser cross-origin reading. | Validate identity and role on server. |
| 10 | Treating CSP as a replacement for safe code. | CSP is defense-in-depth. | Remove unsafe sinks and deploy CSP separately. |
| 11 | Enabling report-only CSP and claiming enforcement. | Report-only does not block. | Verify enforcement header before claim. |
| 12 | Allowing arbitrary style strings from users. | CSS can alter UI trust. | Use style tokens and allowlists. |
| 13 | Binding user-controlled inline event handler strings. | Handler string is code. | Use trusted function references. |
| 14 | Using `eval`, `new Function`, or string timers. | String execution sinks bypass code review. | Use typed functions and data models. |
| 15 | Logging PII or tokens in browser console/error reports. | Logs can persist and be shared. | Minimize and classify data. |
| 16 | Putting sensitive data in route query strings. | URLs leak through history, logs and referrers. | Use server-side lookup or opaque ids. |
| 17 | Persisting sensitive Pinia state without classification. | Storage persistence changes privacy and XSS impact. | Classify before persistence. |
| 18 | Sending CSRF headers that backend does not validate. | Header alone is not protection. | Coordinate with backend session validation. |
| 19 | Assuming SameSite cookie config is controlled by Vue. | Cookie attributes are response header policy. | Set and verify server cookie flags. |
| 20 | Claiming dependency scan passed without running it. | Evidence was not produced. | Run scanner or mark UNKNOWN. |
| 21 | Ignoring markdown/rich-text dependency risk. | Renderer affects HTML sink. | Review dependency trust and sanitizer boundary. |
| 22 | Overlooking SSR template/security boundary. | Server runtime may be affected. | Keep SSR templates trusted. |
| 23 | Marking security issue fixed without evidence. | Release gate loses meaning. | Attach test/scan/backend evidence. |
| 24 | Adding security packages without understanding trust boundary. | Package adds supply-chain risk. | Review purpose, maintainer, lockfile and config. |
| 25 | Shipping known high-risk issue with no rollback. | Incident response lacks control. | Define owner, mitigation and rollback path. |

## 12. 最终小项目

最终小项目 `vue-security-boundary-lab` 只整合本章机制，不替代前面的分节教学。它把每个 risky value 都变成 typed model、safe component preview、test or scan evidence、release gate input。

### 12.1 项目目标

- 用 trusted/untrusted/server-policy 分类开始。
- 用 plain text、allowlist、protocol review、style token、CSP preview、API/CSRF/storage/route/privacy/env/dependency model 展示边界。
- 用 tests、scans、issue dashboard 记录 evidence。
- 明确 CSP deployed、CSRF backend validation、backend authorization、dependency scan 都不是本地 Vue component 能直接证明的事实。

### 12.2 文件职责

| 文件 | 职责 |
| --- | --- |
| `SecurityBoundaryChapterApp.vue` | 组合所有 Chapter 16 panels |
| `components/*Panel.vue` | 展示某个 boundary 的 local UI |
| `models/*.ts` | 纯函数和 typed security decision models |
| `composables/*.ts` | 连接 model 与 Vue reactivity |
| `tests/*.test.ts` | 验证 model behavior |
| `security-boundary.css` | 本章局部样式 |

### 12.3 运行与验证

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

### 12.4 完整核心代码

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/SecurityBoundaryChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import "./security-boundary.css";
import TrustedRenderingPanel from "./components/TrustedRenderingPanel.vue";
import SecurityVerificationDashboard from "./components/SecurityVerificationDashboard.vue";
</script>

<template>
  <section class="chapter-section chapter-16" aria-labelledby="chapter-16-title">
    <TrustedRenderingPanel />
    <SecurityVerificationDashboard />
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/TrustedRenderingPanel.vue</span>
  </div>

```vue
<td>{{ item.label }}</td>
<td>{{ item.allowedSink }}</td>
<td>{{ item.blockedSink }}</td>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/EscapedTextRenderingDemo.vue</span>
  </div>

```vue
<textarea v-model="rawValue" />
<span>{{ preview.renderedText }}</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/RichTextRiskPanel.vue</span>
  </div>

```vue
<span>{{ review.decision }}</span>
<p>{{ review.reason }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/SafeUrlReviewPanel.vue</span>
  </div>

```vue
<input v-model="urlInput" />
<p class="security-output">{{ review.normalizedUrl || "No safe URL output" }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/SafeStyleAllowlistPanel.vue</span>
  </div>

```vue
<p class="security-output" :style="styleReview.style">
  Reviewed style object rendered from tokens.
</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/DangerousSinkPanel.vue</span>
  </div>

```vue
<li v-for="sink in dangerousSinkReviews" :key="sink.id">
  <h4>{{ sink.label }}</h4>
  <p>{{ getSinkReviewAction(sink.kind) }}</p>
</li>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/CspPolicyBuilderPanel.vue</span>
  </div>

```vue
<p><strong>{{ policy.headerName }}</strong></p>
<p class="security-output">{{ policy.serialized }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/ApiSecurityBoundaryPanel.vue</span>
  </div>

```vue
<h4>{{ policy.method }} {{ policy.endpoint }}</h4>
<p>{{ describeApiSecurityBoundary(policy) }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/CsrfRequestBoundaryPanel.vue</span>
  </div>

```vue
<pre class="security-output">{{ JSON.stringify(headers, null, 2) }}</pre>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/AuthStorageRiskPanel.vue</span>
  </div>

```vue
<td>{{ option.kind }}</td>
<td>{{ option.readableByJavaScript }}</td>
<td>{{ option.coordination }}</td>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/RouteAuthorizationBoundaryPanel.vue</span>
  </div>

```vue
<span class="security-badge review">{{ review.decision }}</span>
<p>{{ review.reason }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/PrivacyDataClassificationPanel.vue</span>
  </div>

```vue
<select v-model="classification">
  <option value="public">public</option>
  <option value="personal">personal</option>
  <option value="secret">secret</option>
</select>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/EnvExposurePanel.vue</span>
  </div>

```vue
<p>
  Exposed to client:
  <span class="security-badge">{{ review.exposedToClient }}</span>
</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/components/SecurityVerificationDashboard.vue</span>
  </div>

```vue
<span class="security-badge" :class="{ blocked: !releaseAllowed }">
  {{ releaseAllowed }}
</span>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/escapedRenderingModel.ts</span>
  </div>

```ts
export function createEscapedPreview(
  rawValue: string,
  sink: EscapedPreview["sink"] = "text",
): EscapedPreview {
  return {
    rawValue,
    renderedText: rawValue,
    sink,
    safeForHtmlExecution: false,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/htmlSanitizationModel.ts</span>
  </div>

```ts
const allowedTags = new Set(["strong", "em", "p", "ul", "ol", "li"]);
const blockedTags = new Set(["script", "iframe", "object", "embed"]);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/safeUrlModel.ts</span>
  </div>

```ts
const parsed = new URL(input, baseUrl);
const base = new URL(baseUrl);
const isSameOriginRelative = !input.includes("://") && parsed.origin === base.origin;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/safeStyleModel.ts</span>
  </div>

```ts
style: {
  color: colorValues[input.colorToken],
  backgroundColor: backgroundValues[input.backgroundToken],
  padding: input.density === "compact" ? "0.5rem" : "0.85rem",
},
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/cspPolicyModel.ts</span>
  </div>

```ts
headerName:
  config.mode === "report-only"
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/csrfRequestModel.ts</span>
  </div>

```ts
if (input.policy.requiresCsrfHeader) {
  headers["X-CSRF-Token"] = input.csrfToken;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/authStorageRiskModel.ts</span>
  </div>

```ts
export function rankAuthStorageRisk(
  options: ReadonlyArray<AuthStorageOption> = authStorageOptions,
): ReadonlyArray<AuthStorageOption> {
  return [...options].sort((left, right) => left.riskScore - right.riskScore);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/models/privacyDataClassificationModel.ts</span>
  </div>

```ts
if (input.classification === "secret") {
  return {
    ...input,
    status: "blocked",
    reason: "Secrets must not enter client-visible sinks.",
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/safeUrlModel.test.ts</span>
  </div>

```ts
const blockedUrl = ["java", "script:blocked-action"].join("");
const review = reviewUrlValue(blockedUrl);

expect(review.status).toBe("blocked");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-16-security-boundary/tests/securityIssueModel.test.ts</span>
  </div>

```ts
expect(blockingIssues.map((issue) => issue.id)).toEqual(["sec-html-001"]);
expect(canReleaseSecurityWork(securityIssues)).toBe(false);
```
</div>

### 12.5 代码执行链路

1. `App.vue` imports `SecurityBoundaryChapterApp.vue` and renders it after Chapter 15.
2. `SecurityBoundaryChapterApp.vue` imports Chapter 16 CSS and all panels.
3. Each panel reads a model or composable.
4. User input changes local `ref` state.
5. `computed` functions re-run model review functions.
6. Template renders only text, select values, style objects from tokens, or policy preview strings.
7. Tests assert model behavior; scans check forbidden source patterns.
8. `SecurityVerificationDashboard.vue` blocks release when high open issues remain.

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
rg -n --pcre2 "\bany\b" src/learning/vue/chapter-16-security-boundary
```
</div>

If typecheck fails, inspect imports and union type assignments. If tests fail, inspect the model function named in the failing test. If a scan matches, treat it as release blocker until reviewed or removed.

### 12.7 Security review checklist

| Check | Expected evidence |
| --- | --- |
| no unsafe HTML rendered | source scan and component review |
| no dangerous URL rendered as clickable link | URL component review |
| no arbitrary style string applied | style model test |
| no real secret in client env | env model plus manual env review |
| no token written to localStorage | source scan/manual review |
| route guard not described as backend authorization | route model and guide wording |
| CSP deployed claim absent unless headers verified | network/header evidence required |
| CSRF solved claim absent unless backend verified | backend evidence required |
| dependency scan claim absent unless command ran | scanner output required |

## 13. 额外速查表

| Situation | Use | Avoid |
| --- | --- | --- |
| Display user text | text interpolation | HTML sink |
| Display rich text | trusted source or backend sanitizer | frontend-only authority claim |
| Bind URL | same-origin relative or reviewed HTTPS | unreviewed protocols |
| Bind style | design tokens | raw CSS strings |
| Handle API mutation | backend CSRF/session protocol | frontend-only protection claim |
| Store auth state | reviewed session strategy | default localStorage token |
| Route permission | UX guard plus backend API check | menu hiding as security |
| Client env | public values only | secrets in prefixed keys |
| Dependency addition | lockfile and trust review | blind package install |
| Release security work | tests, scans, owners, rollback | undocumented confidence |

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Template: security-review-minimum.ts</span>
  </div>

```ts
interface ReviewGate {
  readonly source: string;
  readonly sink: string;
  readonly owner: string;
  readonly evidence: ReadonlyArray<string>;
  readonly rollbackPath: string;
}
```
</div>

## 14. 真实项目判断模型

Use this chapter when a Vue feature touches untrusted content, rich text, external URLs, custom styles, script-like extensibility, auth/session state, route permissions, privacy-sensitive fields, client env, dependency changes or release security claims.

Do not use this chapter as a replacement for backend authorization, backend validation/sanitization, response headers, cookie flags, CSRF middleware, scanner output, penetration testing, privacy/legal review or production security certification.

Decision criteria:

| Question | Required evidence |
| --- | --- |
| Is the source trusted code or untrusted data? | model classification and owner |
| Which sink receives the value? | component/template/API/storage/policy path |
| Which framework/browser protection applies? | Vue escaping, URL parser, style allowlist, CSP header evidence |
| Which protection does not apply? | explicit UNKNOWN or backend dependency |
| Who is the authority? | backend, deployment, privacy, dependency owner or code owner |
| What blocks release? | failing test, scan match, high open issue, missing backend evidence |
| What is rollback? | remove feature, plain text fallback, disable link, report-only rollout, remove dependency |

## 15. 如何转换成个人笔记

把每个安全点记录成五行：

1. Source：值从哪里来。
2. Sink：值进入哪里。
3. Protection：Vue/browser/TypeScript/backend 哪一层提供了什么。
4. Gap：哪一层没有提供保护。
5. Evidence：哪个 test、scan、backend ticket、header check 或 rollback 证明当前状态。

## 16. 必须能回答的问题

- 为什么 Vue templates 必须可信？
- 为什么 text interpolation escaping 不等于允许 HTML？
- 为什么 URL sink 需要 protocol allowlist？
- 为什么 style binding 也可能有 security risk？
- 为什么 route guard 不是 backend authorization？
- 为什么 CORS 不是 authorization？
- 为什么 CSRF 需要 backend session validation？
- 为什么 token storage choice changes XSS impact？
- 为什么 `VITE_` client env values are public？
- 为什么 CSP report-only 不能声称 enforcement？
- 为什么 dependency scan PASS 不能凭空声明？
- 为什么 security dashboard needs owner/evidence/rollback？

## 17. 最终记忆模型

Security in Vue is not one API. It is a boundary workflow:

1. classify source trust;
2. choose the allowed sink;
3. name the protection that applies;
4. name the protection that does not apply;
5. assign backend/browser/deployment/privacy/dependency authority;
6. collect reproducible evidence;
7. block release when severe risk remains open;
8. keep a rollback path.

## 18. 官方文档阅读清单

- Vue official Security guide: `https://vuejs.org/guide/best-practices/security`
- OWASP Cross Site Scripting Prevention Cheat Sheet: `https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html`
- OWASP Cross-Site Request Forgery Prevention Cheat Sheet: `https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html`
- MDN Content Security Policy guide: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP`
- MDN CSP `frame-ancestors`: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors`
- MDN CSP Report-Only: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only`
- MDN Same-Origin Policy: `https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy`
- MDN CORS guide: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS`
- MDN Web Storage API: `https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API`
- MDN localStorage: `https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage`
- MDN Set-Cookie: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie`
- Vite env and mode docs: `https://vite.dev/guide/env-and-mode`
- Vue Router navigation guards: `https://router.vuejs.org/guide/advanced/navigation-guards.html`
- Pinia state docs: `https://pinia.vuejs.org/core-concepts/state.html`

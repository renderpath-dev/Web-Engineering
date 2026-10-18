# Vue 第 19 章：Monorepo、Workspace Packages、Internal Consumer App、Release Automation 与 CI Evidence

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
  - [9.1 Monorepo mental model：workspace graph、package boundary、consumer evidence、CI gate and release ownership](#section-9-1)
  - [9.2 Workspace package graph：app package、library package、tooling package、dependency edge and ownership](#section-9-2)
  - [9.3 Workspace linking boundary：npm/pnpm workspace link、local symlink、published package difference and install evidence](#section-9-3)
  - [9.4 App package vs library package：entry point、build target、runtime owner and consumer contract](#section-9-4)
  - [9.5 Internal import gate：public entry、internal module ban、path policy and breaking-change prevention](#section-9-5)
  - [9.6 Package export surface：root export、subpath export、CSS export、type declaration and consumer import proof](#section-9-6)
  - [9.7 CSS and asset export boundary：style contract、asset path、side effects and consumer stylesheet evidence](#section-9-7)
  - [9.8 Peer dependency and external Vue：shared Vue runtime、duplicate Vue risk、library externalization and package model](#section-9-8)
  - [9.9 Build order and affected packages：topological order、changed package set、dependent package rebuild and cache boundary](#section-9-9)
  - [9.10 TypeScript project boundary：project reference model、declaration boundary、vue-tsc evidence and runtime UNKNOWN](#section-9-10)
  - [9.11 Consumer app smoke test：internal package consumption、render proof、CSS proof and package compatibility evidence](#section-9-11)
  - [9.12 Workspace scripts：per-package script、root orchestration、parallel vs sequential execution and failure aggregation](#section-9-12)
  - [9.13 Dependency and lockfile policy：version ranges、lockfile review、workspace protocol and reproducible install evidence](#section-9-13)
  - [9.14 CI pipeline evidence：checkout、install、typecheck、test、build、artifact and environment boundary](#section-9-14)
  - [9.15 Test/build matrix：package-level PASS/FAIL/SKIPPED/UNKNOWN, required checks and release blocking](#section-9-15)
  - [9.16 Release candidate model：changed packages、version plan、changelog entry、migration note and approval evidence](#section-9-16)
  - [9.17 Version plan and migration notes：semver impact、consumer risk、deprecation window and upgrade path](#section-9-17)
  - [9.18 Publish boundary and provenance：npm publish boundary、registry access、tokens、provenance and claim UNKNOWN](#section-9-18)
  - [9.19 Rollback and hotfix workflow：failed release、consumer breakage、patch branch、rollback gate and communication](#section-9-19)
  - [9.20 Ownership and review model：package owner、required reviewer、risk area and approval gate](#section-9-20)
  - [9.21 Monorepo release dashboard：workspace graph、CI matrix、consumer proof、open issues and release decision](#section-9-21)
  - [9.22 Chapter integration：how Chapter 19 connects design system, tests, production, security, observability and migration](#section-9-22)
  - [9.23 Final integration：vue-monorepo-release-lab 如何形成 workspace release evidence workspace](#section-9-23)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 文件职责](#122-文件职责)
  - [12.3 运行与验证](#123-运行与验证)
  - [12.4 完整核心代码](#124-完整核心代码)
  - [12.5 代码执行链路](#125-代码执行链路)
  - [12.6 验证命令与失败定位](#126-验证命令与失败定位)
  - [12.7 Monorepo release review checklist](#127-monorepo-release-review-checklist)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 学习目标 | 真实路径 | 位置 |
| --- | --- | --- |
| workspace graph、package kind、owner 和 dependency edge | `src/learning/vue/chapter-19-monorepo-release/models/workspacePackageModel.ts`、`src/learning/vue/chapter-19-monorepo-release/components/WorkspaceGraphPanel.vue` | 9.1-9.2 |
| workspace linking、本地 symlink 证据和 published compatibility UNKNOWN | `src/learning/vue/chapter-19-monorepo-release/models/workspaceLinkingModel.ts`、`src/learning/vue/chapter-19-monorepo-release/components/WorkspaceLinkingPanel.vue` | 9.3 |
| app package 与 library package build goal 边界 | `src/learning/vue/chapter-19-monorepo-release/models/packageBoundaryModel.ts`、`src/learning/vue/chapter-19-monorepo-release/components/PackageBoundaryPanel.vue` | 9.4 |
| public import gate、exports、CSS entry 和 type declaration surface | `src/learning/vue/chapter-19-monorepo-release/models/importGateModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/packageExportSurfaceModel.ts`、`src/learning/vue/chapter-19-monorepo-release/components/PackageExportSurfacePanel.vue` | 9.5-9.7 |
| peer dependency、external Vue、build order 和 affected package set | `src/learning/vue/chapter-19-monorepo-release/models/peerDependencyModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/buildOrderModel.ts`、`src/learning/vue/chapter-19-monorepo-release/composables/useAffectedPackageSet.ts` | 9.8-9.9 |
| TypeScript project boundary、consumer smoke、workspace script 和 lockfile evidence | `src/learning/vue/chapter-19-monorepo-release/models/typescriptProjectBoundaryModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/consumerSmokeTestModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/workspaceScriptModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/lockfilePolicyModel.ts` | 9.10-9.13 |
| CI evidence、test/build matrix、release candidate、version plan 和 migration note | `src/learning/vue/chapter-19-monorepo-release/models/ciPipelineEvidenceModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/testBuildMatrixModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/releaseCandidateModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/versionPlanModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/migrationNoteModel.ts` | 9.14-9.17 |
| publish boundary、provenance UNKNOWN、rollback、ownership 和 release dashboard | `src/learning/vue/chapter-19-monorepo-release/models/publishBoundaryModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/provenanceBoundaryModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/rollbackHotfixModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/ownershipReviewModel.ts`、`src/learning/vue/chapter-19-monorepo-release/models/monorepoReleaseGateModel.ts` | 9.18-9.23 |

## 0. 本章机制边界

本章不是把当前仓库改成真实 monorepo。`package.json`、`package-lock.json`、`vite.config.ts`、`vitest.config.ts` 和 CI workflow 文件保持不改；新代码只在 `src/learning/vue/chapter-19-monorepo-release/` 建立 local evidence lab，并在 `src/learning/vue/chapter-01-application-boundary/App.vue` 中追加 Chapter 19 渲染入口。

本章建模 workspace graph、package boundary、workspace linking、public import gate、exports/CSS/type declaration surface、peer/external Vue decision、build order、affected package set、TypeScript project boundary、consumer smoke result、workspace script orchestration、lockfile review、CI matrix、release candidate、version plan、migration note、publish boundary、provenance UNKNOWN、rollback/hotfix 和 owner approval。它不创建真实 workspace package config，不执行 package publishing，不写 token 或 registry config，不创建 real CI workflow。

TypeScript 和 `vue-tsc` 可以检查 `WorkspacePackage`、`PackageExportSurfaceEntry`、`CiPipelineCheck` 等模型字段，也可以检查新增 SFC import 是否连通；它不能证明 install、consumer render、CSS computed style、CI artifact、npm package publish、provenance/signing 或 rollback drill。凡是没有真实命令输出、外部平台输出或 consumer smoke 输出的项目，本章都标为 UNKNOWN。

本地 roadmap 的 Phase 19 仍显示旧的性能、部署与生产优化主题；本章遵循当前任务附件提供的 Chapter 19 monorepo/release scope，因此与 roadmap entry 存在主题差异。

## 1. 本章解决的问题

前 18 章已经覆盖 TypeScript、testing、production build、migration、security、observability 和 design-system package boundary。第 19 章解决的是更大的工程问题：当一个 Vue app 演变为多个 package 时，团队如何知道哪个 package 依赖哪个 package、哪个路径可以被 consumer import、哪个 build/test/CI 结果能阻塞 release、哪个 owner 必须批准，以及 publish/provenance/rollback 为什么不能凭口头声明。

## 2. 前置概念

- Chapter 05：理解 `vue-tsc`、SFC 类型检查、type erasure 和 compiler macro 边界。
- Chapter 10：理解 Vitest、unit tests、component tests、CI quality gate 和 UNKNOWN status。
- Chapter 11：理解 Vite app build、production output 和 deployment evidence。
- Chapter 14：理解 migration note、semver impact、rollback adapter 和 review risk。
- Chapter 16：理解 dependency/lockfile review、secret boundary 和 supply-chain risk。
- Chapter 17：理解 observability evidence、incident owner、rollback signal 和 UNKNOWN discipline。
- Chapter 18：理解 package export surface、library build boundary、CSS export、external Vue 和 release gate。

## 3. 学习目标

- 能解释 monorepo 为什么是 package graph、ownership model 和 release evidence model，而不是多文件夹集合。
- 能区分 workspace linking、本地 symlink、published package install、consumer smoke test 和 CI run。
- 能用 typed model 表达 public export、internal import ban、CSS entry、peer dependency、affected package 和 build order。
- 能判断 typecheck、unit test、build、consumer smoke、CI artifact、changelog、migration note、owner approval 和 rollback plan 各自证明什么。
- 能把 publish、provenance、npm token、registry access、signing 和 external CI output 保持在 UNKNOWN，直到真实执行并拿到证据。

## 4. 核心机制证据链总览

| 机制链 | 本地 owner | 可观察 evidence | 仍是 UNKNOWN 的外部证据 | failure signal |
| --- | --- | --- | --- | --- |
| Workspace package -> dependency edge -> build order -> affected package evidence | `workspacePackageModel.ts` / `buildOrderModel.ts` | owner、kind、edge、order | real workspace package config | cycle or missing edge |
| Workspace link -> local symlink/install -> published package UNKNOWN | `workspaceLinkingModel.ts` | proof scope local-consumption | published install | local link treated as publish proof |
| App package -> browser entry -> app build evidence | `packageBoundaryModel.ts` | buildGoal browser-app | deployed app smoke | app build used as library proof |
| Library package -> public entry -> library build/type evidence | `packageExportSurfaceModel.ts` | root/subpath/type entries | real library output | missing declaration |
| Import path -> public/internal gate -> breaking-change prevention | `importGateModel.ts` | blocked internal path | Node resolver rejection | internal import |
| Export surface -> root/subpath/CSS/type entries -> consumer import proof | `packageExportSurfaceModel.ts` | allowed paths | package exports map | missing CSS entry |
| CSS export -> stylesheet entry -> consumer style evidence | `cssExportContractModel.ts` | cssEntry and status | computed style check | missing-consumer-style-evidence |
| Vue dependency -> peer/external decision -> duplicate runtime risk | `peerDependencyModel.ts` | placement peer | real bundle inspection | duplicate runtime |
| Changed package -> dependent package set -> rebuild/test matrix | `affectedPackageModel.ts` | affected package list | cache correctness | skipped dependent app |
| TS project boundary -> declaration/reference model -> runtime consumer UNKNOWN | `typescriptProjectBoundaryModel.ts` | composite/declaration fields | runtime render | declaration-only proof |
| Consumer smoke app -> import/render/CSS result -> compatibility evidence | `consumerSmokeTestModel.ts` | import/render/CSS status | installed consumer app | css-result unknown |
| Root script -> package scripts -> orchestration result | `workspaceScriptModel.ts` | missing required script | real workspace command | missing package script |
| Dependency policy -> version range/lockfile change -> install reproducibility review | `dependencyPolicyModel.ts` / `lockfilePolicyModel.ts` | workspace protocol and lockfile change | fresh install output | lockfile ignored |
| CI stage -> check status -> required gate result | `ciPipelineEvidenceModel.ts` | status pass/fail/skipped/unknown | hosted runner log | unknown required check |
| Release candidate -> version/changelog/migration -> approval evidence | `releaseCandidateModel.ts` | candidate fields | signed approval system | migration note missing |
| Publish boundary -> registry/token/provenance -> claim UNKNOWN | `publishBoundaryModel.ts` / `provenanceBoundaryModel.ts` | gaps list | npm publish/provenance output | external claim without proof |
| Rollback/hotfix -> affected consumer -> mitigation evidence | `rollbackHotfixModel.ts` | rollback readiness | production drill | communication missing |
| Ownership review -> required reviewer -> approval gate | `ownershipReviewModel.ts` | approved flag | code-owner platform | reviewer missing |
| Release dashboard -> CI/consumer/issues/owner evidence -> final decision | `monorepoReleaseGateModel.ts` | failureSignals | real release workflow | blocked true |

## 5. 核心术语表

| Concept | Layer | Meaning | Common Misunderstanding |
| --- | --- | --- | --- |
| workspace graph | package architecture | packages and dependency edges with owners | folders are enough |
| app package | browser runtime | owns user entry and app build | same as library package |
| library package | package consumer contract | owns exports, types, CSS and peer dependency policy | component folder |
| workspace link | package manager resolution | local package resolution evidence | publish proof |
| export surface | package API | paths consumers may import | all source files are public |
| peer dependency | package contract | consumer owns shared dependency version | library should bundle every dependency |
| affected package | release planning | changed package plus dependents | only changed files matter |
| CI evidence | external automation | runner output for required checks | local command result |
| release candidate | governance object | changed packages plus version/changelog/migration/approval | tag name only |
| provenance | publish trust evidence | verified build-publish link | local boolean |

## 6. 底层心智模型

把 Chapter 19 想成一条证据管线：workspace package 先成为 graph node，dependency edge 决定 build order，public export 和 import gate 决定 consumer 能用什么，CSS/peer dependency 决定运行时能否正确共享样式和 Vue runtime，typecheck/test/build matrix 给出本地证据，consumer smoke 与 CI artifact 给出更强证据，release candidate 把 version、changelog、migration、owner approval 和 open issues 聚合成 final decision。

Vue runtime 只负责渲染 `MonorepoReleaseChapterApp.vue` 的 panels；TypeScript 只负责检查 model shape；Vite build 只证明当前 app 能打包；真实 workspace install、library bundle、CI workflow、publish/provenance 和 rollback drill 都必须由外部系统提供证据。

## 7. 推荐目录结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release</span>
  </div>

```txt
chapter-19-monorepo-release/
  MonorepoReleaseChapterApp.vue
  monorepo-release.css
  components/
    WorkspaceGraphPanel.vue
    PackageBoundaryPanel.vue
    WorkspaceLinkingPanel.vue
    ImportGatePanel.vue
    PackageExportSurfacePanel.vue
    CssExportContractPanel.vue
    PeerDependencyPanel.vue
    BuildOrderPanel.vue
    TypeScriptProjectBoundaryPanel.vue
    ConsumerSmokeTestPanel.vue
    WorkspaceScriptsPanel.vue
    DependencyPolicyPanel.vue
    CiPipelineEvidencePanel.vue
    TestBuildMatrixPanel.vue
    ReleaseCandidatePanel.vue
    VersionMigrationPanel.vue
    PublishBoundaryPanel.vue
    RollbackHotfixPanel.vue
    OwnershipReviewPanel.vue
    MonorepoReleaseDashboard.vue
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
npm run typecheck
npm run test:unit
npm run build
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Output</span>
  </div>

```txt
Do not mark a command PASS until its actual output is captured.
Real workspace install: UNKNOWN
Real CI run: UNKNOWN
Package publish readiness: UNKNOWN
```
</div>

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Monorepo mental model：workspace graph、package boundary、consumer evidence、CI gate and release ownership

**结论：**

monorepo 在本章被建模为 package graph，而不是把多个目录放进同一个仓库。

**本节解决的问题：**

学习者容易把 `packages/` 目录数量当成 monorepo 成熟度；9.1 通过 `workspacePackages` 和 `workspaceDependencyEdges` 要求先说清 package kind、owner、risk area 和 edge。

**技术意义：**

`WorkspaceGraphPanel.vue` 读取 `useWorkspaceGraph()` 的 computed rows，证明 UI 看到的是模型产物；没有 owner 和 dependency edge 时，release reviewer 只能看到文件夹，不能看到责任链。

**概念解释：**

`@vue-lab/admin-app` 是 app package，`@vue-lab/design-system` 是 library package，`@vue-lab/release-tools` 是 tooling package；三者通过 named edge 表达依赖，而不是靠相邻目录表达关系。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.1 的边界停在 `WorkspacePackage` 和 `WorkspaceDependencyEdge`：它关心 package kind、owner、riskArea 与 dependency edge 是否可读，不讨论 install、exports map 或发布平台。`WorkspaceGraphPanel.vue` 是 consumer，它只展示 graph rows，不替 owner 做审批。

**Monorepo / Release 机制证据链：**

`@vue-lab/admin-app` 依赖 `@vue-lab/design-system` 时，问题从 edge 产生；`findPackageOwner()` 找到 `Design Systems`，测试确认 owner lookup 可重复，缺少 owner 或 edge 就成为 folder-only graph 的失败信号。

**TypeScript / vue-tsc 编译期过程：**

`WorkspacePackageKind` 限定 app、library、tooling，`WorkspaceRiskArea` 限定 release 风险分类；`vue-tsc` 能发现拼错的 kind，却不能证明这些 owner 真的完成 review。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

Vue runtime 只渲染 graph rows；workspace linking、install、CI gate 和 owner approval 都没有在浏览器里真实执行。

**API / 语法规则：**

`WorkspacePackage` 定义 node，`WorkspaceDependencyEdge` 定义 directed edge，`findPackageOwner()` 把 package name 变成 review owner；这些规则用于建立 graph literacy，不承担 package manager 行为。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/workspacePackageModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/WorkspaceGraphPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/workspacePackageModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/workspacePackageModel.ts</span>
  </div>

```ts
export type WorkspacePackageKind = "app" | "library" | "tooling";

export type WorkspaceRiskArea =
  | "runtime"
  | "ui-contract"
  | "build-system"
  | "release";

export interface WorkspacePackage {
  readonly name: string;
  readonly kind: WorkspacePackageKind;
  readonly owner: string;
  readonly riskArea: WorkspaceRiskArea;
  readonly publicEntry: string;
}

export interface WorkspaceDependencyEdge {
  readonly sourcePackage: string;
  readonly targetPackage: string;
  readonly reason: string;
}

export const workspacePackages: readonly WorkspacePackage[] = [
  {
    name: "@vue-lab/admin-app",
    kind: "app",
    owner: "App Experience",
    riskArea: "runtime",
    publicEntry: "src/main.ts",
  },
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/workspacePackageModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  findPackageOwner,
  listPackageDependencies,
  workspaceDependencyEdges,
  workspacePackages,
} from "../models/workspacePackageModel";

describe("workspacePackageModel", () => {
  it("looks up dependencies in the workspace graph", () => {
    expect(
      listPackageDependencies(workspaceDependencyEdges, "@vue-lab/admin-app"),
    ).toContain("@vue-lab/design-system");
  });

  it("looks up the package owner", () => {
    expect(findPackageOwner(workspacePackages, "@vue-lab/design-system")).toBe(
      "Design Systems",
    );
  });
});
```
</div>

**逐行解释：**

`workspacePackages` 的每个元素都是一个 package node；`workspaceDependencyEdges` 表示谁消费谁；测试先查 `@vue-lab/admin-app` 的依赖，再查 `@vue-lab/design-system` 的 owner。

**执行过程：**

Vue 渲染 graph panel 时读取 computed rows；Vitest 调用 `listPackageDependencies()` 后得到 design-system edge，再调用 `findPackageOwner()` 得到 owner 字符串。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

当新增 package node 时，package count 会变化；当新增 edge 时，admin app 的 dependencies 列表变化；当 owner 缺失时，review signal 从 named owner 退回 unknown owner。

**为什么得到这个结果：**

结果来自显式 graph data：目录名没有参与判断，只有 package node 和 edge record 被函数读取，所以 folder pile 不能产生 owner evidence。

**对比写法：**

对比只建目录的写法，本节要求先写出 `workspacePackages`、owner 和 edge；没有这些字段，release reviewer 无法判断谁负责 `@vue-lab/design-system` 的变更。

**常见错误为什么错：**

常见错误是先建许多目录再补文档；错在 release reviewer 仍不知道哪个 package 由谁拥有、哪个 edge 会影响构建顺序。

**与真实项目的关系：**

真实 monorepo review 会先问 graph node 是否有 owner 和 risk area；`WorkspaceGraphPanel.vue` 让这个问题在学习 UI 中可见。

**与当前学习主线的关系：**

本节把 Chapter 18 的 package boundary 推进到 workspace graph 层，为后面的 build order、CI matrix 和 owner approval 提供起点。

**最终记忆模型：**

Monorepo graph = package node + dependency edge + owner lookup。

<a id="section-9-2"></a>

### 9.2 Workspace package graph：app package、library package、tooling package、dependency edge and ownership

**结论：**

package graph 的节点必须带着职责进入 review，否则 app、library 和 tooling 会被错误地当成同一种 build target。

**本节解决的问题：**

9.2 处理的是 package 节点含义：`packageBoundaries` 把 `entryPoint`、`buildGoal`、`runtimeOwner` 和 evidence 放在同一条记录中。

**技术意义：**

`PackageBoundaryPanel.vue` 对每个 boundary 调用 `isLibraryPackageBoundary()`，让学习者看到 library package 的证据要求不同于 browser app。

**概念解释：**

app package 负责浏览器入口和 DOM 结果，library package 负责 public exports/types/CSS，tooling package 负责 release gate payload；同名 package 不能复用同一个验收标准。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.2 只处理 package kind 和 build goal 的职责分配：app、library、tooling 的 entry point、runtime owner 与 evidenceRequired 被放在 `PackageBoundary` 中；真实 package manifest 仍不在本节生成。

**Monorepo / Release 机制证据链：**

边界判断从 `packageBoundaries` 的 `packageKind` 与 `buildGoal` 开始；`isLibraryPackageBoundary()` 只在 kind 为 library 且 goal 为 reusable-library 时返回 true，防止 app package 借用 library readiness 语言。

**TypeScript / vue-tsc 编译期过程：**

`PackageBuildGoal` 把 browser app、reusable library 和 release tooling 分开；类型能约束字段值，但不会运行 Vite app build 或 library build。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

面板只展示 boundary 决策；真实 workspace package 的 `package.json`、build output 和 consumer install 本章保持 UNKNOWN。

**API / 语法规则：**

`PackageBoundary` 绑定 entryPoint、buildGoal、runtimeOwner、consumerContract；`listRequiredBoundaryEvidence()` 返回该 kind 对应的证据清单。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/packageBoundaryModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/PackageBoundaryPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/workspacePackageModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/packageBoundaryModel.ts</span>
  </div>

```ts
import type { WorkspacePackageKind } from "./workspacePackageModel";

export type PackageBuildGoal =
  | "browser-app"
  | "reusable-library"
  | "release-tooling";

export interface PackageBoundary {
  readonly packageName: string;
  readonly packageKind: WorkspacePackageKind;
  readonly entryPoint: string;
  readonly buildGoal: PackageBuildGoal;
  readonly runtimeOwner: string;
  readonly consumerContract: string;
  readonly evidenceRequired: readonly string[];
}

export const packageBoundaries: readonly PackageBoundary[] = [
  {
    packageName: "@vue-lab/admin-app",
    packageKind: "app",
    entryPoint: "src/main.ts",
    buildGoal: "browser-app",
    runtimeOwner: "Browser shell",
    consumerContract: "route and rendered DOM",
    evidenceRequired: ["app build", "consumer smoke"],
  },
  {
    packageName: "@vue-lab/design-system",
    packageKind: "library",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/workspacePackageModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  findPackageOwner,
  listPackageDependencies,
  workspaceDependencyEdges,
  workspacePackages,
} from "../models/workspacePackageModel";

describe("workspacePackageModel", () => {
  it("looks up dependencies in the workspace graph", () => {
    expect(
      listPackageDependencies(workspaceDependencyEdges, "@vue-lab/admin-app"),
    ).toContain("@vue-lab/design-system");
  });

  it("looks up the package owner", () => {
    expect(findPackageOwner(workspacePackages, "@vue-lab/design-system")).toBe(
      "Design Systems",
    );
  });
});
```
</div>

**逐行解释：**

模型先列出 admin app、design system 和 release tools；panel 逐条展示 build goal；测试借 graph lookup 证明 owner 信息仍可追踪到 package 层。

**执行过程：**

渲染时，template 对每个 boundary 调用 `isLibraryPackageBoundary()`；该函数只读当前 boundary，不扫描目录，也不推断 package manager 配置。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

app package 的 build result 指向 browser bundle，library package 的 result 指向 exports/types/CSS，tooling package 的 result 指向 gate payload；kind 改变会直接改变 evidenceRequired。

**为什么得到这个结果：**

因为 build goal 是显式字段，design-system 会被识别为 reusable library；如果把它标成 app，library evidence 会在模型层丢失。

**对比写法：**

对比把所有 package 都当 app 的写法，本节通过 `buildGoal` 拆开 browser app、reusable library 和 release tooling。

**常见错误为什么错：**

常见错误是用同一组检查验收所有 package；错在 browser app、reusable library 和 release tooling 的 consumer contract 不同。

**与真实项目的关系：**

真实项目里的 package owner 会按 build goal 准备证据；library owner 不能只提交浏览器页面截图。

**与当前学习主线的关系：**

本节承接 Chapter 11 的 build 讨论，并把 Chapter 18 的 library package 概念放进多 package graph。

**最终记忆模型：**

Package kind 决定 build goal，build goal 决定 required evidence。

<a id="section-9-3"></a>

### 9.3 Workspace linking boundary：npm/pnpm workspace link、local symlink、published package difference and install evidence

**结论：**

workspace link 只能说明本地 dependency resolution 走通，不能替代发布后安装测试。

**本节解决的问题：**

9.3 针对 `workspaceLinks`：`@vue-lab/admin-app -> @vue-lab/design-system` 有 install evidence，但 proof scope 仍是 `local-consumption`。

**技术意义：**

`workspaceLinkingModel.test.ts` 明确断言 local link 不等于 published compatibility，防止把 symlink 当成远端包可用证据。

**概念解释：**

npm workspace、pnpm workspace 和 manual link 都是 package-manager-specific 的本地解析模型；它们不会证明 tarball 内容、exports map 或 consumer install。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.3 的边界是 local workspace resolution：`WorkspaceLink` 可以记录 npm/pnpm/manual link 与 lockfile signal，但没有 tarball、registry install 或 external consumer proof。

**Monorepo / Release 机制证据链：**

`getWorkspaceLinkProofScope()` 读取 link kind 和 install status 后返回 `local-consumption`；`provesPublishedPackageCompatibility()` 对同一 link 返回 false，专门阻止 symlink 被当作发布证明。

**TypeScript / vue-tsc 编译期过程：**

`WorkspaceLinkKind` 能限制 link kind 字符串，`InstallEvidenceStatus` 能表达 present/missing/unknown；类型不会创建 symlink，也不会更新 lockfile。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

组件渲染 link kind、proof scope 和 review flag；实际 `npm install` 没有在章节代码中触发。

**API / 语法规则：**

`WorkspaceLink` 描述 sourcePackage、targetPackage、linkKind、installEvidenceStatus、lockfileChanged；`requiresInstallEvidenceReview()` 用这些字段判断是否需要安装证据复核。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/workspaceLinkingModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/WorkspaceLinkingPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/workspaceLinkingModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/workspaceLinkingModel.ts</span>
  </div>

```ts
export type WorkspaceLinkKind = "npm-workspace" | "pnpm-workspace" | "manual-link";

export type InstallEvidenceStatus = "present" | "missing" | "unknown";

export type LinkProofScope = "local-consumption" | "published-consumption" | "unknown";

export interface WorkspaceLink {
  readonly sourcePackage: string;
  readonly targetPackage: string;
  readonly linkKind: WorkspaceLinkKind;
  readonly installEvidenceStatus: InstallEvidenceStatus;
  readonly lockfileChanged: boolean;
}

export const workspaceLinks: readonly WorkspaceLink[] = [
  {
    sourcePackage: "@vue-lab/admin-app",
    targetPackage: "@vue-lab/design-system",
    linkKind: "npm-workspace",
    installEvidenceStatus: "present",
    lockfileChanged: true,
  },
  {
    sourcePackage: "@vue-lab/admin-app",
    targetPackage: "@vue-lab/theme-tools",
    linkKind: "manual-link",
    installEvidenceStatus: "unknown",
    lockfileChanged: false,
  },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/workspaceLinkingModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  getWorkspaceLinkProofScope,
  provesPublishedPackageCompatibility,
  workspaceLinks,
} from "../models/workspaceLinkingModel";

describe("workspaceLinkingModel", () => {
  it("treats workspace links as local consumption evidence", () => {
    expect(getWorkspaceLinkProofScope(workspaceLinks[0])).toBe("local-consumption");
  });

  it("does not treat local links as published compatibility proof", () => {
    expect(provesPublishedPackageCompatibility(workspaceLinks[0])).toBe(false);
  });
});
```
</div>

**逐行解释：**

第一条 link 表示 admin app 通过 npm workspace 消费 design system；第二条 manual link 保持 unknown install evidence；测试直接断言本地 link 不证明 published compatibility。

**执行过程：**

Vitest 取 `workspaceLinks[0]`，先计算 proof scope，再检查 published compatibility；两次调用读的是同一个 link record，但得出不同证据级别。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

linkKind 从 npm-workspace 变成 manual-link 时仍只代表 local consumption；installEvidenceStatus 从 present 变 missing 时，review flag 会升高。

**为什么得到这个结果：**

workspace link 的输入没有包含 published package artifact，所以函数不能构造远端安装结论；这就是 local proof 与 publish proof 的差异来源。

**对比写法：**

对比把 local symlink 当发布证明的写法，本节让 `provesPublishedPackageCompatibility()` 永远不从 workspace link 返回 true。

**常见错误为什么错：**

常见错误是看到 `workspace:*` 或 symlink 成功就宣布 package 可发布；错在发布后的 resolver、包内容和 export map 都没被验证。

**与真实项目的关系：**

真实团队可以把此模型接到 install log 和 lockfile review；没有 tarball 或 external install 时只保留 local evidence。

**与当前学习主线的关系：**

本节连接 npm workspace docs 与 Chapter 16 的 lockfile caution，训练 package manager boundary。

**最终记忆模型：**

Workspace link proves local resolution, not published installation。

<a id="section-9-4"></a>

### 9.4 App package vs library package：entry point、build target、runtime owner and consumer contract

**结论：**

app build 和 library build 的目标不同，不能用一个 `vite build` 结果覆盖两种 package readiness。

**本节解决的问题：**

9.4 用 `buildGoal` 区分 `browser-app` 与 `reusable-library`，避免把 root shell 构建成功误读成 design-system 包可发布。

**技术意义：**

`PackageBoundaryPanel.vue` 展示每个 package 的 runtime owner；app owner 是 browser shell，library owner 是 package consumer。

**概念解释：**

app entry `src/main.ts` 面向浏览器挂载，library entry `src/index.ts` 面向 consumer import；前者关心 route/render，后者关心 exports/types/CSS。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.4 的边界是 build target：app entry 面向 browser mount，library entry 面向 consumer import；本节不改 Vite config，也不声称生成 library bundle。

**Monorepo / Release 机制证据链：**

`entryPoint`、`buildGoal` 与 `runtimeOwner` 共同决定证据类型；admin app 的 browser-app goal 需要 app build，design-system 的 reusable-library goal 需要 library build、types 和 CSS import。

**TypeScript / vue-tsc 编译期过程：**

`PackageBoundary` 的字段能让缺少 entry 或 build goal 的模型无法通过 strict checking；运行时 consumer contract 仍需 smoke test。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

Vite app build 会打包 SPA，Vite library mode 会生成 library-oriented bundle；本章只建模差异，不改 `vite.config.ts`。

**API / 语法规则：**

`entryPoint` 指向 package 启动文件，`buildGoal` 说明构建产物用途，`runtimeOwner` 说明谁执行产物；三者一起阻止 app build 被误用为 library proof。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/packageBoundaryModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/PackageBoundaryPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/buildOrderModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/packageBoundaryModel.ts</span>
  </div>

```ts
import type { WorkspacePackageKind } from "./workspacePackageModel";

export type PackageBuildGoal =
  | "browser-app"
  | "reusable-library"
  | "release-tooling";

export interface PackageBoundary {
  readonly packageName: string;
  readonly packageKind: WorkspacePackageKind;
  readonly entryPoint: string;
  readonly buildGoal: PackageBuildGoal;
  readonly runtimeOwner: string;
  readonly consumerContract: string;
  readonly evidenceRequired: readonly string[];
}

export const packageBoundaries: readonly PackageBoundary[] = [
  {
    packageName: "@vue-lab/admin-app",
    packageKind: "app",
    entryPoint: "src/main.ts",
    buildGoal: "browser-app",
    runtimeOwner: "Browser shell",
    consumerContract: "route and rendered DOM",
    evidenceRequired: ["app build", "consumer smoke"],
  },
  {
    packageName: "@vue-lab/design-system",
    packageKind: "library",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/buildOrderModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  buildGraphEdges,
  buildPackages,
  createBuildOrder,
  mustBuildBefore,
} from "../models/buildOrderModel";

describe("buildOrderModel", () => {
  it("builds library package before consuming app package", () => {
    const order = createBuildOrder(buildPackages, buildGraphEdges);

    expect(mustBuildBefore("@vue-lab/design-system", "@vue-lab/admin-app", order)).toBe(
      true,
    );
  });
});
```
</div>

**逐行解释：**

代码列出 app 与 library 的不同 boundary；panel 把 build goal 显示出来；测试通过 build order 确认 consuming app 不能早于 design-system。

**执行过程：**

当页面渲染 package boundary panel 时，app 和 library 的不同 goal 被直接展示；运行测试时，build order assertion 把 library-before-app 固定下来。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

build result 对 app 意味着 SPA assets，对 library 意味着 importable package output；如果 runtimeOwner 从 browser shell 变成 package consumer，验收标准必须切换。

**为什么得到这个结果：**

结果不同是因为构建目标不同：browser app 关心入口挂载，library 关心可导入 surface；一个产物不能同时证明两种 consumer contract。

**对比写法：**

对比用 root `vite build` 覆盖所有结论的写法，本节要求先看 `PackageBoundary.buildGoal` 再选择证据。

**常见错误为什么错：**

常见错误是看到 root `vite build` 成功就宣布组件库 ready；错在没有 library mode output、declaration 和 consumer import proof。

**与真实项目的关系：**

真实 design-system package 需要 library output、exports、types 和 consumer proof；admin app build 只能证明 SPA 打包。

**与当前学习主线的关系：**

本节把 Chapter 11 的 app build 与 Chapter 18 的 library mode boundary 分开。

**最终记忆模型：**

App build serves the browser; library build serves package consumers。

<a id="section-9-5"></a>

### 9.5 Internal import gate：public entry、internal module ban、path policy and breaking-change prevention

**结论：**

consumer 只能依赖 public entry；internal path 一旦被外部使用，就把私有实现变成 breaking-change surface。

**本节解决的问题：**

9.5 检查 `designSystemImportPolicy.allowedPaths` 与 blocked patterns，说明 `./internal/*` 不是可承诺 API。

**技术意义：**

`ImportGatePanel.vue` 同时渲染 `.`、`./css` 和 `./internal/token-resolver`，让 forbidden path 的 failure signal 可见。

**概念解释：**

public entry 是 consumer contract，internal module 是 package owner 的实现细节；禁止 internal import 可以保留重构空间。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.5 聚焦 import path contract：`allowedPaths` 是承诺给 consumer 的路径，`./internal/*` 与 `./src/*` 是 package owner 保留的实现空间。

**Monorepo / Release 机制证据链：**

consumer 写入 import path 后，`isInternalImportPath()` 先识别私有前缀，`isImportPathAllowed()` 再检查 allowlist；`./internal/token-resolver` 被拒绝就是 breaking-change prevention 的证据。

**TypeScript / vue-tsc 编译期过程：**

`ImportPathPolicy` 能给检查函数提供 typed list；TypeScript 不能自动知道 package exports 里是否真的屏蔽了同一路径。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

浏览器只展示 allow/block result；真实 Node/package resolver 的拒绝行为需要 package exports 和 consumer install 证明。

**API / 语法规则：**

`ImportPathPolicy` 保存 allowedPaths 和 blockedPatterns；`listBlockedImportSignals()` 把一组 consumer paths 转成违规清单。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/importGateModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/ImportGatePanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/importGateModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/importGateModel.ts</span>
  </div>

```ts
export interface ImportPathPolicy {
  readonly packageName: string;
  readonly allowedPaths: readonly string[];
  readonly blockedPatterns: readonly string[];
}

export const designSystemImportPolicy: ImportPathPolicy = {
  packageName: "@vue-lab/design-system",
  allowedPaths: [".", "./css", "./button", "./use-theme"],
  blockedPatterns: ["./internal/*", "./src/*"],
};

export function isInternalImportPath(importPath: string): boolean {
  return importPath.startsWith("./internal/") || importPath.startsWith("./src/");
}

export function isImportPathAllowed(policy: ImportPathPolicy, importPath: string): boolean {
  if (isInternalImportPath(importPath)) {
    return false;
  }

  return policy.allowedPaths.includes(importPath);
}

export function listBlockedImportSignals(
  policy: ImportPathPolicy,
  importPaths: readonly string[],
): readonly string[] {
  return importPaths.filter((importPath) => !isImportPathAllowed(policy, importPath));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/importGateModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  designSystemImportPolicy,
  isImportPathAllowed,
  listBlockedImportSignals,
} from "../models/importGateModel";

describe("importGateModel", () => {
  it("allows public package entry paths", () => {
    expect(isImportPathAllowed(designSystemImportPolicy, "./css")).toBe(true);
  });

  it("blocks internal module imports", () => {
    expect(isImportPathAllowed(designSystemImportPolicy, "./internal/token-resolver")).toBe(
      false,
    );
    expect(
      listBlockedImportSignals(designSystemImportPolicy, [
        ".",
        "./internal/token-resolver",
      ]),
    ).toEqual(["./internal/token-resolver"]);
  });
});
```
</div>

**逐行解释：**

示例路径包含 `.`, `./css`, `./internal/token-resolver`；panel 显示每条路径是否 allowed；测试要求 internal path 进入 blocked list。

**执行过程：**

template 循环渲染 checked paths，每次调用 allow 函数；Vitest 用同一 policy 检查 public CSS path 和 internal path 的相反结果。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

当 import path 从 `./css` 变为 `./internal/token-resolver`，allowed result 从 true 变 false；blockedPaths 列表随之出现 failure signal。

**为什么得到这个结果：**

结果来自前缀规则和 allowlist 的组合：internal prefix 先被拒绝，即使文件本地存在，也不能成为 consumer contract。

**对比写法：**

对比 consumer 直接 import `./src/*` 的写法，本节把 `./internal/*` 和 `./src/*` 都列入 blocked patterns。

**常见错误为什么错：**

常见错误是 consumer 为了方便直接引用 source file；错在以后改内部目录会破坏外部 app，等于把私有实现发布成 API。

**与真实项目的关系：**

真实组件库一旦允许 consumer 依赖 internal path，后续重构就会变成 breaking change。

**与当前学习主线的关系：**

本节把 Chapter 18 的 package export surface 收紧为 import gate，准备进入 exports map。

**最终记忆模型：**

Public path is contract; internal path is implementation。

<a id="section-9-6"></a>

### 9.6 Package export surface：root export、subpath export、CSS export、type declaration and consumer import proof

**结论：**

exports surface 同时包含 JS entry、CSS entry 和 declaration evidence，少一项都会削弱 consumer proof。

**本节解决的问题：**

9.6 把 `.`, `./button`, `./css`, `./types` 和 internal entry 放进同一个 surface 表，避免只检查 root export。

**技术意义：**

`packageExportSurfaceModel.test.ts` 同时验证 internal path 被拒绝、CSS export 存在、declaration entry 存在。

**概念解释：**

root export 解决默认入口，subpath export 解决可控拆分，CSS export 解决样式入口，type declaration 解决 TypeScript consumer 诊断。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.6 处理 exports surface：root export、subpath export、CSS export 和 declaration entry 是 package usability 的四个面；真实 `package.json#exports` 仍未改动。

**Monorepo / Release 机制证据链：**

`packageExportSurface` 同时列出 `.`, `./button`, `./css`, `./types` 和 internal entry；测试要求 CSS export 与 declaration entry 存在，并拒绝 internal import。

**TypeScript / vue-tsc 编译期过程：**

`declarationPath` 是静态 metadata；`vue-tsc` 可以生成声明的前提需要真实 config，本模型只表达是否记录了 declaration target。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

Vite library output 和 package exports map 未实际生成；面板只把 consumer import proof 拆成可审查字段。

**API / 语法规则：**

`PackageExportSurfaceEntry` 用 path、kind、public、declarationPath 表示导出；`hasPublicCssExport()` 与 `hasTypeDeclarationEntry()` 分别检查样式入口和类型入口。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/packageExportSurfaceModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/PackageExportSurfacePanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/packageExportSurfaceModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/packageExportSurfaceModel.ts</span>
  </div>

```ts
export type PackageExportKind = "component" | "composable" | "style" | "type" | "internal";

export interface PackageExportSurfaceEntry {
  readonly path: string;
  readonly kind: PackageExportKind;
  readonly public: boolean;
  readonly declarationPath?: string;
}

export const packageExportSurface: readonly PackageExportSurfaceEntry[] = [
  { path: ".", kind: "component", public: true, declarationPath: "dist/index.d.ts" },
  {
    path: "./button",
    kind: "component",
    public: true,
    declarationPath: "dist/button.d.ts",
  },
  { path: "./css", kind: "style", public: true },
  { path: "./types", kind: "type", public: true, declarationPath: "dist/types.d.ts" },
  { path: "./internal/token-resolver", kind: "internal", public: false },
];

export function canConsumerImportPath(
  entries: readonly PackageExportSurfaceEntry[],
  importPath: string,
): boolean {
  return entries.some((entry) => entry.path === importPath && entry.public);
}

export function hasPublicCssExport(entries: readonly PackageExportSurfaceEntry[]): boolean {
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/packageExportSurfaceModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  canConsumerImportPath,
  hasPublicCssExport,
  hasTypeDeclarationEntry,
  packageExportSurface,
} from "../models/packageExportSurfaceModel";

describe("packageExportSurfaceModel", () => {
  it("blocks internal import paths", () => {
    expect(canConsumerImportPath(packageExportSurface, "./internal/token-resolver")).toBe(
      false,
    );
  });

  it("requires CSS and type declaration entries", () => {
    expect(hasPublicCssExport(packageExportSurface)).toBe(true);
    expect(hasTypeDeclarationEntry(packageExportSurface)).toBe(true);
  });
});
```
</div>

**逐行解释：**

模型中的 public entries 是 consumer 可见面；internal entry 的 public 为 false；panel 同时展示 CSS export、type declarations 和 internal import result。

**执行过程：**

Vue 读取 export surface 数组后显示三个布尔值；Vitest 分别调用 import check、CSS check 和 declaration check，避免只覆盖 root export。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

新增 `./css` 会让 CSS readiness 变 true；移除 declarationPath 会让 type evidence 变弱；internal public 被误设 true 会扩大 breaking surface。

**为什么得到这个结果：**

consumer import proof 需要路径存在且 public；CSS 和 declaration 是不同 kind，所以 JavaScript entry 存在不能推导样式或类型可用。

**对比写法：**

对比只暴露 root export 的写法，本节同时检查 `./button`、`./css`、`./types` 和 internal path。

**常见错误为什么错：**

常见错误是只导出组件入口忘记 CSS 或 types；错在 consumer 能编译但样式或 IDE/typecheck 体验仍会失败。

**与真实项目的关系：**

真实 package release 需要证明 JS import、CSS import 和 declaration import 都有可用入口。

**与当前学习主线的关系：**

本节直接延伸 Chapter 18 的 PackageExportPanel，并为 Chapter 19 consumer smoke 提供 import surface。

**最终记忆模型：**

Export surface = JS path + CSS path + type declaration path。

<a id="section-9-7"></a>

### 9.7 CSS and asset export boundary：style contract、asset path、side effects and consumer stylesheet evidence

**结论：**

CSS export 是 package contract 的一部分，不是组件内部实现细节。

**本节解决的问题：**

9.7 让 `cssEntry`、asset paths、side-effect safety 和 consumer style evidence 同时进入 release gate。

**技术意义：**

`CssExportContractPanel.vue` 展示 `./css` 是否 ready，并把 missing style evidence 转成可读 failure list。

**概念解释：**

consumer 能 import 组件不代表样式可用；CSS entry 需要出现在 export surface，并且要有 consumer stylesheet evidence。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.7 的边界是 style contract：`CssExportContract` 只回答 CSS entry、asset path、sideEffectSafe 和 consumer style status，不回答组件功能测试是否通过。

**Monorepo / Release 机制证据链：**

`isCssExportReady()` 要求 cssEntry 非空、side effects 安全且 consumer style evidence 为 pass；`listCssContractFailures()` 把缺失项拆成可定位字符串。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 可以约束 `CssEvidenceStatus`，不能加载 CSS 文件，也不能证明浏览器最终 computed style 正确。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

本地 Vue 面板渲染 `cssResult`，但真实 CSS proof 需要 consumer app 渲染和样式检查。

**API / 语法规则：**

`CssExportContract` 存储 cssEntry 和 assetPaths；`isCssExportReady()` 给出总判断，`listCssContractFailures()` 给出缺口明细。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/cssExportContractModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/CssExportContractPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/cssExportContractModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/cssExportContractModel.ts</span>
  </div>

```ts
export type CssEvidenceStatus = "pass" | "fail" | "unknown";

export interface CssExportContract {
  readonly packageName: string;
  readonly cssEntry: string;
  readonly assetPaths: readonly string[];
  readonly sideEffectSafe: boolean;
  readonly consumerEvidenceStatus: CssEvidenceStatus;
}

export const cssExportContract: CssExportContract = {
  packageName: "@vue-lab/design-system",
  cssEntry: "./css",
  assetPaths: ["dist/assets/button-focus.css"],
  sideEffectSafe: true,
  consumerEvidenceStatus: "pass",
};

export function isCssExportReady(contract: CssExportContract): boolean {
  return (
    contract.cssEntry.length > 0 &&
    contract.sideEffectSafe &&
    contract.consumerEvidenceStatus === "pass"
  );
}

export function listCssContractFailures(contract: CssExportContract): readonly string[] {
  const failures: string[] = [];

  if (contract.cssEntry.length === 0) {
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/cssExportContractModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  isCssExportReady,
  listCssContractFailures,
} from "../models/cssExportContractModel";

describe("cssExportContractModel", () => {
  it("detects a complete CSS export contract", () => {
    expect(
      isCssExportReady({
        packageName: "@vue-lab/design-system",
        cssEntry: "./css",
        assetPaths: [],
        sideEffectSafe: true,
        consumerEvidenceStatus: "pass",
      }),
    ).toBe(true);
  });

  it("detects missing CSS export evidence", () => {
    expect(
      listCssContractFailures({
        packageName: "@vue-lab/design-system",
        cssEntry: "",
        assetPaths: [],
        sideEffectSafe: true,
        consumerEvidenceStatus: "unknown",
      }),
```
</div>

**逐行解释：**

代码先声明 design-system 的 `./css` 入口，再定义 ready 函数；测试构造空 cssEntry 与 unknown evidence 来检查两个 failure。

**执行过程：**

panel 读取 contract 后显示 CSS entry、ready 状态和 failure list；测试直接传入不完整 contract，验证 missing-css-entry 不会被忽略。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

cssEntry 为空会产生 missing-css-entry；consumerEvidenceStatus 从 pass 变 unknown 会产生 missing-consumer-style-evidence；assetPaths 只记录样式依赖位置。

**为什么得到这个结果：**

ready 必须同时满足入口、side effect 和 consumer evidence；任一字段不足都说明 consumer app 可能渲染出无样式组件。

**对比写法：**

对比组件能渲染就算成功的写法，本节要求 `cssEntry` 和 `consumerEvidenceStatus` 同时为 release 提供信号。

**常见错误为什么错：**

常见错误是把组件 render pass 当作 CSS pass；错在 DOM 存在不代表 stylesheet 已被 consumer 正确导入。

**与真实项目的关系：**

真实 consumer app 常见失败是组件 DOM 存在但样式缺失；CSS export review 必须单独记录。

**与当前学习主线的关系：**

本节连接 Chapter 15 的可访问 UI 结果和 Chapter 18 的 CSS export contract。

**最终记忆模型：**

CSS export readiness needs entry plus consumer style evidence。

<a id="section-9-8"></a>

### 9.8 Peer dependency and external Vue：shared Vue runtime、duplicate Vue risk、library externalization and package model

**结论：**

可复用 Vue library 通常应该让 consumer 拥有 Vue runtime，而不是把另一份 Vue 打进 library bundle。

**本节解决的问题：**

9.8 用 `vuePeerDependencyDecision` 表达 placement、externalized flag 和 duplicate runtime risk。

**技术意义：**

`peerDependencyModel.test.ts` 对比 peer/externalized 和 bundled dependency，直接把 duplicate runtime risk 转成 blocked result。

**概念解释：**

peer dependency 是 package contract，externalization 是 bundler output 决策；两者配合才能降低多个 Vue runtime 的应用级风险。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.8 只讨论 reusable Vue library 的 dependency placement：Vue 应由 consumer 共享，externalization 需要 bundle evidence；本节不检查真实 bundle。

**Monorepo / Release 机制证据链：**

`PeerDependencyDecision` 把 placement、externalizedInLibraryBuild 和 duplicateRuntimeRisk 放在一起；测试用 bundled Vue risk 反例证明 dependency 位置会影响 release gate。

**TypeScript / vue-tsc 编译期过程：**

`DependencyPlacement` 限定 dependency/peer/external 的模型值；实际 bundle 是否 external Vue 需要 Vite/Rollup output 证明。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

组件只显示 model decision；本章没有生成 library bundle，因此 externalization 证据保持概念层。

**API / 语法规则：**

`isReusableVueLibraryDependencySafe()` 要求 dependencyName 为 vue、placement 为 peer、library build externalized 且 duplicate risk 为 false。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/peerDependencyModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/PeerDependencyPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/peerDependencyModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/peerDependencyModel.ts</span>
  </div>

```ts
export type DependencyPlacement = "dependency" | "peer" | "external";

export interface PeerDependencyDecision {
  readonly packageName: string;
  readonly dependencyName: string;
  readonly placement: DependencyPlacement;
  readonly externalizedInLibraryBuild: boolean;
  readonly duplicateRuntimeRisk: boolean;
}

export const vuePeerDependencyDecision: PeerDependencyDecision = {
  packageName: "@vue-lab/design-system",
  dependencyName: "vue",
  placement: "peer",
  externalizedInLibraryBuild: true,
  duplicateRuntimeRisk: false,
};

export function isReusableVueLibraryDependencySafe(
  decision: PeerDependencyDecision,
): boolean {
  return (
    decision.dependencyName === "vue" &&
    decision.placement === "peer" &&
    decision.externalizedInLibraryBuild &&
    !decision.duplicateRuntimeRisk
  );
}

export function explainDuplicateVueRisk(decision: PeerDependencyDecision): string {
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/peerDependencyModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { isReusableVueLibraryDependencySafe } from "../models/peerDependencyModel";

describe("peerDependencyModel", () => {
  it("accepts peer Vue with external library output", () => {
    expect(
      isReusableVueLibraryDependencySafe({
        packageName: "@vue-lab/design-system",
        dependencyName: "vue",
        placement: "peer",
        externalizedInLibraryBuild: true,
        duplicateRuntimeRisk: false,
      }),
    ).toBe(true);
  });

  it("blocks bundled Vue risk", () => {
    expect(
      isReusableVueLibraryDependencySafe({
        packageName: "@vue-lab/design-system",
        dependencyName: "vue",
        placement: "dependency",
        externalizedInLibraryBuild: false,
        duplicateRuntimeRisk: true,
      }),
    ).toBe(false);
  });
});
```
</div>

**逐行解释：**

模型中的安全决策使用 peer + externalized；测试构造 dependency + non-externalized + duplicateRuntimeRisk 的对象，期望函数返回 false。

**执行过程：**

panel 显示 dependency name、安全判断和风险解释；Vitest 不需要 Vue runtime，只验证 package model 是否拒绝重复 runtime 风险。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

placement 从 peer 变 dependency 会让 safety 失败；externalizedInLibraryBuild 为 false 会暴露 bundle 风险；duplicateRuntimeRisk 为 true 直接阻塞。

**为什么得到这个结果：**

Vue library 的 consumer 已经有 Vue app runtime；如果 library 再打入另一份 Vue，组件实例、reactivity 和 plugin context 都可能出现应用级风险。

**对比写法：**

对比把 Vue 放进普通 dependency 的写法，本节把 peer placement、externalized flag 和 duplicate runtime risk 拆开。

**常见错误为什么错：**

常见错误是把 Vue 放进普通 dependency 后打包进 library；错在 reusable package 抢走了 consumer 对 runtime version 的控制权。

**与真实项目的关系：**

真实 library bundle 需要检查 Vue 是否 external；本地 `PeerDependencyDecision` 只记录期望状态。

**与当前学习主线的关系：**

本节复用 Chapter 18 的 external Vue 主题，并把它纳入 monorepo release gate。

**最终记忆模型：**

Reusable Vue library should share consumer-owned Vue runtime。

<a id="section-9-9"></a>

### 9.9 Build order and affected packages：topological order、changed package set、dependent package rebuild and cache boundary

**结论：**

build order 来自 dependency graph；changed library package 会把 dependent app 带入 affected set。

**本节解决的问题：**

9.9 处理 `@vue-lab/design-system` 变化后哪些 package 必须重新验证，避免 app 在 library 之前构建。

**技术意义：**

`BuildOrderPanel.vue` 展示 topological order，并通过 `useAffectedPackageSet()` 让 changed package 变成 affected list。

**概念解释：**

topological order 先构建 dependency，再构建 consumer；affected package 计算从 changed node 反向寻找 dependent node。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.9 聚焦 graph algorithm：`BuildGraphEdge` 决定 topological order，`findAffectedPackages()` 决定 changed package 扩散；cache correctness 不在本节证明。

**Monorepo / Release 机制证据链：**

design-system 作为 dependency 先进入 build order；当它变化时，affected set 扩散到 admin app 和 release tools，说明 dependent package 也要进入验证矩阵。

**TypeScript / vue-tsc 编译期过程：**

`BuildGraphEdge` 能约束 `packageName` 和 `dependsOn`，但不会检查 cache hit 是否可信，也不会运行构建命令。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

按钮只切换 `changedPackageName` 的 ref；真实 workspace cache、incremental build 和 artifact reuse 都不在本章执行。

**API / 语法规则：**

`createBuildOrder()` 产出拓扑顺序，`mustBuildBefore()` 检查两个 package 的相对位置，`findAffectedPackages()` 从 changed node 找 dependents。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/buildOrderModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/composables/useAffectedPackageSet.ts`
- `src/learning/vue/chapter-19-monorepo-release/tests/buildOrderModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/buildOrderModel.ts</span>
  </div>

```ts
export interface BuildGraphEdge {
  readonly packageName: string;
  readonly dependsOn: string;
}

export const buildPackages: readonly string[] = [
  "@vue-lab/design-system",
  "@vue-lab/admin-app",
  "@vue-lab/release-tools",
];

export const buildGraphEdges: readonly BuildGraphEdge[] = [
  { packageName: "@vue-lab/admin-app", dependsOn: "@vue-lab/design-system" },
  { packageName: "@vue-lab/release-tools", dependsOn: "@vue-lab/design-system" },
];

export function createBuildOrder(
  packageNames: readonly string[],
  edges: readonly BuildGraphEdge[],
): readonly string[] {
  const pending = new Set(packageNames);
  const order: string[] = [];

  while (pending.size > 0) {
    const readyPackages = packageNames.filter(
      (packageName) =>
        pending.has(packageName) &&
        edges
          .filter((edge) => edge.packageName === packageName)
          .every((edge) => !pending.has(edge.dependsOn)),
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/buildOrderModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  buildGraphEdges,
  buildPackages,
  createBuildOrder,
  mustBuildBefore,
} from "../models/buildOrderModel";

describe("buildOrderModel", () => {
  it("builds library package before consuming app package", () => {
    const order = createBuildOrder(buildPackages, buildGraphEdges);

    expect(mustBuildBefore("@vue-lab/design-system", "@vue-lab/admin-app", order)).toBe(
      true,
    );
  });
});
```
</div>

**逐行解释：**

build graph 先声明 admin app 和 release tools 都 dependsOn design-system；测试计算 order 后断言 design-system 位于 admin app 之前。

**执行过程：**

panel 在 setup 阶段计算 buildOrder；按钮改变 `changedPackageName` 后，computed affectedPackageNames 重新计算 dependent package set。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

changed package 为 design-system 时，affected set 包含 consumers；changed package 为 admin app 时，影响范围收窄到 app package 本身。

**为什么得到这个结果：**

拓扑排序基于 dependsOn 关系，先处理没有待构建 dependency 的节点；affected calculation 则沿相反方向寻找消费者。

**对比写法：**

对比随意并行跑 build 的写法，本节先用 `createBuildOrder()` 确认 dependency package 已排在 consumer 前面。

**常见错误为什么错：**

常见错误是只测试改动文件所在 package；错在 library change 会影响 consuming app 的 build、render 和 CSS proof。

**与真实项目的关系：**

真实 workspace cache 只有在 graph 和 affected set 正确时才有意义；否则会跳过 dependent app 验证。

**与当前学习主线的关系：**

本节把 Chapter 10 的测试矩阵和 Chapter 11 的构建顺序统一到 package graph。

**最终记忆模型：**

Build dependencies forward; affected packages flow to consumers。

<a id="section-9-10"></a>

### 9.10 TypeScript project boundary：project reference model、declaration boundary、vue-tsc evidence and runtime UNKNOWN

**结论：**

TypeScript project boundary 能改善 declaration 和 reference 组织，但不能证明 consumer app 运行成功。

**本节解决的问题：**

9.10 使用 composite、declaration、references 和 vueSfcIncluded 四个字段描述 TS project boundary。

**技术意义：**

`TypeScriptProjectBoundaryPanel.vue` 同时显示 declaration readiness 与 runtime proof false，避免把 `vue-tsc` 当 smoke test。

**概念解释：**

project reference 解决编译期边界和输出定位；consumer compatibility 还需要 import/render/CSS evidence。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.10 的边界是 TypeScript project metadata：composite、declaration、references 和 vueSfcIncluded 能描述编译关系，但 runtime render 仍由 consumer smoke 证明。

**Monorepo / Release 机制证据链：**

`isDeclarationBoundaryReady()` 检查 declaration boundary，`canTypeScriptProveRuntimeRender()` 保持 false；测试强调 project reference 不是浏览器执行证据。

**TypeScript / vue-tsc 编译期过程：**

`composite` 和 declaration 是 TypeScript project reference 的核心字段；`vue-tsc` 能检查 SFC 类型，不能执行浏览器渲染。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

本章根 `tsconfig.json` 没有为真实 workspace 拆项目；模型仅说明未来 monorepo 可如何分层。

**API / 语法规则：**

`TypeScriptProjectBoundary` 保存 project reference 所需字段；`isDeclarationBoundaryReady()` 只回答 declaration readiness，不回答 install 或 render。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/typescriptProjectBoundaryModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/TypeScriptProjectBoundaryPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/typescriptProjectBoundaryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/typescriptProjectBoundaryModel.ts</span>
  </div>

```ts
export interface TypeScriptProjectBoundary {
  readonly packageName: string;
  readonly composite: boolean;
  readonly declaration: boolean;
  readonly references: readonly string[];
  readonly vueSfcIncluded: boolean;
}

export const typeScriptProjectBoundaries: readonly TypeScriptProjectBoundary[] = [
  {
    packageName: "@vue-lab/design-system",
    composite: true,
    declaration: true,
    references: [],
    vueSfcIncluded: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    composite: true,
    declaration: false,
    references: ["@vue-lab/design-system"],
    vueSfcIncluded: true,
  },
];

export function isDeclarationBoundaryReady(boundary: TypeScriptProjectBoundary): boolean {
  return boundary.composite && boundary.declaration && boundary.vueSfcIncluded;
}

export function canTypeScriptProveRuntimeRender(
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/typescriptProjectBoundaryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  canTypeScriptProveRuntimeRender,
  isDeclarationBoundaryReady,
} from "../models/typescriptProjectBoundaryModel";

describe("typescriptProjectBoundaryModel", () => {
  it("accepts declaration boundary fields", () => {
    expect(
      isDeclarationBoundaryReady({
        packageName: "@vue-lab/design-system",
        composite: true,
        declaration: true,
        references: [],
        vueSfcIncluded: true,
      }),
    ).toBe(true);
  });

  it("does not claim runtime render proof", () => {
    expect(
      canTypeScriptProveRuntimeRender({
        packageName: "@vue-lab/admin-app",
        composite: true,
        declaration: false,
        references: ["@vue-lab/design-system"],
        vueSfcIncluded: true,
      }),
```
</div>

**逐行解释：**

模型分别给 design-system 和 admin-app 建立 boundary；admin-app references design-system，但 declaration 为 false；测试断言 runtime proof 不能由 TS 返回。

**执行过程：**

panel 渲染 declarations 与 runtime proof 两列；Vitest 构造带 references 的 admin app boundary，仍得到 runtime proof false。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

composite/declaration 变 true 会增强 declaration boundary；references 增加会改变编译依赖；runtime UNKNOWN 不随这些字段自动变 PASS。

**为什么得到这个结果：**

TypeScript 会擦除类型，不执行 package consumer app；因此 declaration shape 正确，也无法证明 DOM、CSS 或 shared Vue runtime 正常。

**对比写法：**

对比把 declaration 文件当 runtime proof 的写法，本节让 `canTypeScriptProveRuntimeRender()` 明确返回 false。

**常见错误为什么错：**

常见错误是把 `vue-tsc` success 当作 consumer compatibility；错在 type system 没有运行浏览器、CSS loader 或 package resolver。

**与真实项目的关系：**

真实 package consumer 需要 declaration 加 smoke test；TS project reference 只解决编译组织。

**与当前学习主线的关系：**

本节回到 Chapter 05 的 type/runtime boundary，并把它放进 package-level project model。

**最终记忆模型：**

Project references help compilation; smoke tests prove runtime consumption。

<a id="section-9-11"></a>

### 9.11 Consumer app smoke test：internal package consumption、render proof、CSS proof and package compatibility evidence

**结论：**

consumer smoke test 比 library build 更接近真实兼容性，因为它让 app package 实际消费 library package。

**本节解决的问题：**

9.11 区分 importResult、renderResult 和 cssResult，说明 render pass 不能覆盖 style contract。

**技术意义：**

`consumerSmokeTestModel.test.ts` 故意让 CSS evidence unknown，验证 release 必须继续 blocked。

**概念解释：**

consumer app smoke test 需要检查 import、render 和 stylesheet；其中 CSS proof 是独立信号。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.11 的边界是 consumer smoke proof：importResult、renderResult、cssResult 三个信号缺一不可；它不代表真实发布安装已发生。

**Monorepo / Release 机制证据链：**

`ConsumerSmokeResult` 将 admin app consuming design-system 的过程拆成 import、render、CSS；`isConsumerSmokeReady()` 只有三个状态都 pass 才允许 readiness。

**TypeScript / vue-tsc 编译期过程：**

`ConsumerSmokeStatus` 允许 pass/fail/unknown；TypeScript 不会检查 CSS 结果，也不会证明浏览器已经呈现组件。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

面板展示 local model 的 unknown；真实 consumer install/smoke 没有在此章执行，所以 compatibility 不能声称 PASS。

**API / 语法规则：**

`isConsumerSmokeReady()` 聚合 smoke status，`listMissingConsumerSmokeEvidence()` 返回缺失的 import/render/CSS 证据名。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/consumerSmokeTestModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/ConsumerSmokeTestPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/consumerSmokeTestModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/consumerSmokeTestModel.ts</span>
  </div>

```ts
export type ConsumerSmokeStatus = "pass" | "fail" | "unknown";

export interface ConsumerSmokeResult {
  readonly consumerPackage: string;
  readonly libraryPackage: string;
  readonly importResult: ConsumerSmokeStatus;
  readonly renderResult: ConsumerSmokeStatus;
  readonly cssResult: ConsumerSmokeStatus;
}

export const consumerSmokeResult: ConsumerSmokeResult = {
  consumerPackage: "@vue-lab/admin-app",
  libraryPackage: "@vue-lab/design-system",
  importResult: "pass",
  renderResult: "pass",
  cssResult: "unknown",
};

export function isConsumerSmokeReady(result: ConsumerSmokeResult): boolean {
  return (
    result.importResult === "pass" &&
    result.renderResult === "pass" &&
    result.cssResult === "pass"
  );
}

export function listMissingConsumerSmokeEvidence(
  result: ConsumerSmokeResult,
): readonly string[] {
  const missing: string[] = [];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/consumerSmokeTestModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  isConsumerSmokeReady,
  listMissingConsumerSmokeEvidence,
} from "../models/consumerSmokeTestModel";

describe("consumerSmokeTestModel", () => {
  it("blocks release when CSS evidence is missing", () => {
    const result = {
      consumerPackage: "@vue-lab/admin-app",
      libraryPackage: "@vue-lab/design-system",
      importResult: "pass" as const,
      renderResult: "pass" as const,
      cssResult: "unknown" as const,
    };

    expect(isConsumerSmokeReady(result)).toBe(false);
    expect(listMissingConsumerSmokeEvidence(result)).toEqual(["css-result"]);
  });
});
```
</div>

**逐行解释：**

默认 smoke result 让 import 和 render 为 pass，CSS 为 unknown；测试复用这个风险形状，期望 missing list 只包含 css-result。

**执行过程：**

panel 直接显示 consumerPackage 与 libraryPackage；测试把 render pass 和 CSS unknown 组合在一起，验证 UI 成功不能替代样式证据。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

importResult 失败说明路径或 resolver 有问题；renderResult 失败说明组件运行失败；cssResult unknown 说明样式链路还没验收。

**为什么得到这个结果：**

三个 proof 属于不同层：模块解析、Vue render、stylesheet loading；其中一个 pass 不能推导另外两个 pass。

**对比写法：**

对比只跑 library unit test 的写法，本节要求 consumer import、render 和 CSS 三个结果都进入 `ConsumerSmokeResult`。

**常见错误为什么错：**

常见错误是截图里组件出现就算 package 兼容；错在截图可能没有覆盖 CSS entry、subpath export 或 fresh install。

**与真实项目的关系：**

真实发布前的 consumer smoke test 能捕获 package exports 和 stylesheet 组合问题。

**与当前学习主线的关系：**

本节把 Chapter 10 的测试证据与 Chapter 18 的 consumer compatibility UNKNOWN 连接起来。

**最终记忆模型：**

Consumer smoke = import proof + render proof + CSS proof。

<a id="section-9-12"></a>

### 9.12 Workspace scripts：per-package script、root orchestration、parallel vs sequential execution and failure aggregation

**结论：**

root orchestration 不能只看脚本名；还要知道每个 package 是否有 required script，以及 build 是否需要顺序。

**本节解决的问题：**

9.12 让 `@vue-lab/admin-app` 缺少 required test script，从而演示 failure aggregation。

**技术意义：**

`WorkspaceScriptsPanel.vue` 展示 missing test script 和 build sequential decision，说明 parallel 速度不等于正确顺序。

**概念解释：**

per-package script 是 package owner 的局部能力，root orchestration 是把这些能力按 dependency order 聚合。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.12 限定在 script orchestration model：它记录 per-package script、commandType、required flag 和 sequential decision，不修改 root scripts。

**Monorepo / Release 机制证据链：**

`findMissingRequiredScripts()` 对 package list 和 command type 做交叉检查；admin app 缺少 required test script 时，CI aggregation 必须看到这个缺口。

**TypeScript / vue-tsc 编译期过程：**

`WorkspaceScriptCommandType` 限定 command kind；它不会验证 `package.json` 中真的存在这些 npm scripts。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

本章不创建 root workspace scripts；现有 `npm run typecheck/test:unit/build` 只验证当前单应用仓库。

**API / 语法规则：**

`WorkspaceScript` 描述一个 package script；`shouldRunSequentially()` 将 build/typecheck 与 test/lint 区分，避免依赖顺序被 parallel execution 掩盖。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/workspaceScriptModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/WorkspaceScriptsPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/workspaceScriptModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/workspaceScriptModel.ts</span>
  </div>

```ts
export type WorkspaceScriptCommandType = "typecheck" | "test" | "build" | "lint";

export interface WorkspaceScript {
  readonly packageName: string;
  readonly scriptName: string;
  readonly commandType: WorkspaceScriptCommandType;
  readonly required: boolean;
}

export const workspaceScripts: readonly WorkspaceScript[] = [
  {
    packageName: "@vue-lab/design-system",
    scriptName: "typecheck",
    commandType: "typecheck",
    required: true,
  },
  {
    packageName: "@vue-lab/design-system",
    scriptName: "test",
    commandType: "test",
    required: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    scriptName: "build",
    commandType: "build",
    required: true,
  },
];

```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/workspaceScriptModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  findMissingRequiredScripts,
  shouldRunSequentially,
  workspaceScripts,
} from "../models/workspaceScriptModel";

describe("workspaceScriptModel", () => {
  it("blocks CI when required package script is missing", () => {
    expect(
      findMissingRequiredScripts(
        workspaceScripts,
        ["@vue-lab/design-system", "@vue-lab/admin-app"],
        "test",
      ),
    ).toEqual(["@vue-lab/admin-app"]);
  });

  it("marks build orchestration as ordered", () => {
    expect(shouldRunSequentially("build")).toBe(true);
  });
});
```
</div>

**逐行解释：**

模型声明 design-system 有 typecheck 和 test，admin app 有 build；panel 检查两个 package 的 test requirement，因此 admin app 被列为 missing。

**执行过程：**

Vue setup 先计算 missingTestScripts；template 渲染缺失列表；Vitest 对同一函数传入 packageNames 后期望返回 admin app。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

新增 admin app test script 会清空 missing list；commandType 为 build 时 sequential 为 true；commandType 为 lint 时可单独考虑并行。

**为什么得到这个结果：**

orchestration 的结果来自 package-script matrix，而不是 root command 字符串；没有 per-package required script 就无法保证每个 package 被检查。

**对比写法：**

对比 root script 盲目并行的写法，本节先找 missing required script，再判断 build 是否应顺序执行。

**常见错误为什么错：**

常见错误是用一个 root test 掩盖 package 缺口；错在某个 consumer app 可能完全没进入 required script 集合。

**与真实项目的关系：**

真实 CI orchestration 会把 per-package scripts 聚合；缺少 required script 不能用 `--if-present` 轻易掩盖。

**与当前学习主线的关系：**

本节将 Chapter 10 的 CI command pipeline 推进到 workspace package 粒度。

**最终记忆模型：**

Root orchestration must know every required package script。

<a id="section-9-13"></a>

### 9.13 Dependency and lockfile policy：version ranges、lockfile review、workspace protocol and reproducible install evidence

**结论：**

dependency range 和 lockfile movement 都是 release evidence，不是无害噪音。

**本节解决的问题：**

9.13 把 `workspace:*`、peer policy、added packages 和 versionChanged 放进模型，解释 install reproducibility 为什么需要 review。

**技术意义：**

`DependencyPolicyPanel.vue` 从 composable 读取 reviewRequired、workspaceProtocolRows 和 lockfileReviewRequired。

**概念解释：**

version range 表示允许解析的范围，lockfile 记录实际解析结果；二者一起决定可复现 install 的证据强度。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.13 的边界是 dependency policy 与 lockfile review：versionRange、policyKind、addedPackages、removedPackages 和 versionChanged 都是 install reproducibility signals。

**Monorepo / Release 机制证据链：**

`dependencyPolicies` 标记 peer 和 workspace policy；`lockfileChange` 标记 package movement；测试要求 lockfile movement 触发 review。

**TypeScript / vue-tsc 编译期过程：**

`VersionPolicyKind` 能防止拼错 exact/caret/workspace/peer；真实 lockfile diff 仍需要文件审查。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

本章不修改 `package-lock.json`，只在模型中展示 lockfile change risk。

**API / 语法规则：**

`isDependencyPolicyReviewRequired()` 判断 dependency policy 是否要审查，`isWorkspaceProtocol()` 识别 workspace range，`requiresLockfileReview()` 读取 lockfile change。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/dependencyPolicyModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/models/lockfilePolicyModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/tests/lockfilePolicyModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/dependencyPolicyModel.ts</span>
  </div>

```ts
export type VersionPolicyKind = "exact" | "caret" | "workspace" | "peer";

export interface DependencyPolicy {
  readonly packageName: string;
  readonly dependencyName: string;
  readonly versionRange: string;
  readonly policyKind: VersionPolicyKind;
  readonly requiredReview: boolean;
}

export const dependencyPolicies: readonly DependencyPolicy[] = [
  {
    packageName: "@vue-lab/design-system",
    dependencyName: "vue",
    versionRange: "^3.5.0",
    policyKind: "peer",
    requiredReview: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    dependencyName: "@vue-lab/design-system",
    versionRange: "workspace:*",
    policyKind: "workspace",
    requiredReview: true,
  },
];

export function isDependencyPolicyReviewRequired(policy: DependencyPolicy): boolean {
  return policy.requiredReview || policy.policyKind === "caret";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/lockfilePolicyModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  countLockfilePackageMovement,
  requiresLockfileReview,
} from "../models/lockfilePolicyModel";

describe("lockfilePolicyModel", () => {
  it("requires review for lockfile package movement", () => {
    const change = {
      filePath: "package-lock.json",
      packageName: "@vue-lab/admin-app",
      addedPackages: ["@vue-lab/design-system"],
      removedPackages: [],
      versionChanged: true,
    };

    expect(requiresLockfileReview(change)).toBe(true);
    expect(countLockfilePackageMovement(change)).toBe(1);
  });
});
```
</div>

**逐行解释：**

dependency model 包含 Vue peer policy 和 design-system workspace policy；lockfile model 记录 package-lock movement；测试确认 added package 数量会进入风险计算。

**执行过程：**

DependencyPolicyPanel 通过 composable 统计 reviewRequired 与 workspaceProtocolRows；Vitest 直接传入 lockfile change 对象并验证 review true。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

versionRange 变成 `workspace:*` 会进入 workspace protocol rows；addedPackages 增加会提高 package movement；versionChanged true 会触发 review。

**为什么得到这个结果：**

可复现安装由 range 和 lockfile 共同决定；只看 package source 无法知道安装树是否发生变动。

**对比写法：**

对比忽略 lockfile diff 的写法，本节把 added package、removed package 和 versionChanged 都变成 review trigger。

**常见错误为什么错：**

常见错误是跳过 lockfile diff；错在 dependency tree 变化可能引入 runtime、security 或 bundle-size 风险。

**与真实项目的关系：**

真实 supply-chain review 依赖 package file 与 lockfile 一起看；单看 source diff 不够。

**与当前学习主线的关系：**

本节连接 Chapter 16 的 dependency risk 与本章 workspace protocol 规则。

**最终记忆模型：**

Version policy says allowed; lockfile says resolved。

<a id="section-9-14"></a>

### 9.14 CI pipeline evidence：checkout、install、typecheck、test、build、artifact and environment boundary

**结论：**

CI evidence 必须携带 stage、package、status 和 evidence id；本地命令输出不能自动变成 CI result。

**本节解决的问题：**

9.14 把 checkout/install/typecheck/test/build/artifact 拆成 stage，让 UNKNOWN required check 阻塞 release。

**技术意义：**

`ciPipelineEvidenceModel.test.ts` 用 required unknown artifact 证明 release gate 不能把未知当通过。

**概念解释：**

CI pipeline 是独立运行环境；每个 job/stage 的 output 才能作为 CI evidence。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.14 只建模 CI stage evidence：checkout、install、typecheck、test、build、artifact 的 status 必须独立记录；本节不创建 workflow file。

**Monorepo / Release 机制证据链：**

`CiPipelineCheck` 把 packageName、stage、status、required 和 evidenceId 绑定；`listBlockingCiChecks()` 把 required unknown artifact 转成 blocker。

**TypeScript / vue-tsc 编译期过程：**

`CiCheckStatus` 把 pass/fail/skipped/unknown 固定为可枚举值；类型不能验证 GitHub runner 是否真的执行。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

本章没有创建 `.github/workflows`，所以真实 CI workflow run、artifact upload 和 runner log 都是 UNKNOWN。

**API / 语法规则：**

`CiCheckStatus` 只允许 pass/fail/skipped/unknown；`isRequiredCiCheckBlocking()` 的规则是 required 且 status 不是 pass 就阻塞。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/ciPipelineEvidenceModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/CiPipelineEvidencePanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/ciPipelineEvidenceModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/ciPipelineEvidenceModel.ts</span>
  </div>

```ts
export type CiCheckStatus = "pass" | "fail" | "skipped" | "unknown";

export type CiStage = "checkout" | "install" | "typecheck" | "test" | "build" | "artifact";

export interface CiPipelineCheck {
  readonly packageName: string;
  readonly stage: CiStage;
  readonly status: CiCheckStatus;
  readonly required: boolean;
  readonly evidenceId: string;
}

export const ciPipelineChecks: readonly CiPipelineCheck[] = [
  {
    packageName: "@vue-lab/design-system",
    stage: "typecheck",
    status: "pass",
    required: true,
    evidenceId: "local-typecheck-model",
  },
  {
    packageName: "@vue-lab/design-system",
    stage: "test",
    status: "pass",
    required: true,
    evidenceId: "local-unit-model",
  },
  {
    packageName: "@vue-lab/admin-app",
    stage: "artifact",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/ciPipelineEvidenceModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  isRequiredCiCheckBlocking,
  listBlockingCiChecks,
} from "../models/ciPipelineEvidenceModel";

describe("ciPipelineEvidenceModel", () => {
  it("blocks required unknown CI check", () => {
    const check = {
      packageName: "@vue-lab/admin-app",
      stage: "artifact" as const,
      status: "unknown" as const,
      required: true,
      evidenceId: "missing-artifact",
    };

    expect(isRequiredCiCheckBlocking(check)).toBe(true);
    expect(listBlockingCiChecks([check])).toEqual([check]);
  });
});
```
</div>

**逐行解释：**

默认 checks 中 design-system typecheck/test 为 pass，admin app artifact 为 unknown；测试构造 required unknown artifact 并期望它 blocking。

**执行过程：**

panel 统计 blockingChecks.length 并渲染每个 CI row；Vitest 不访问 CI 平台，只验证 unknown required stage 的 gate 语义。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

status 从 unknown 改 pass 会解除该 row blocker；required 从 false 改 true 会让同样的 unknown 进入 release gate。

**为什么得到这个结果：**

CI evidence 需要 stage 与 evidenceId，因为同一个 package 的 local test pass 不能说明 artifact upload stage 已完成。

**对比写法：**

对比把本地命令贴到 CI 表格的写法，本节要求 `CiPipelineCheck.evidenceId` 和 stage status。

**常见错误为什么错：**

常见错误是把本地 command output 复制成 CI pass；错在 runner environment、checkout、install 和 artifact 都没有实际发生。

**与真实项目的关系：**

真实 CI output 来自 runner 环境；本地 pass 可以参考，但不能替代 hosted job log。

**与当前学习主线的关系：**

本节承接 Chapter 10 CI gate 和 Chapter 17 evidence discipline，明确 UNKNOWN 处理。

**最终记忆模型：**

CI row = package + stage + status + evidence id。

<a id="section-9-15"></a>

### 9.15 Test/build matrix：package-level PASS/FAIL/SKIPPED/UNKNOWN, required checks and release blocking

**结论：**

matrix 的价值是按 package 和 check 记录状态；required UNKNOWN 与 FAIL 一样会阻塞 release。

**本节解决的问题：**

9.15 用 `consumer-css` unknown 行说明 PASS/FAIL/SKIPPED/UNKNOWN 不能混成一句 “CI passed”。

**技术意义：**

`TestBuildMatrixPanel.vue` 显示 pass count、unknown count 和 blocked state，适合学习 release dashboard 聚合。

**概念解释：**

matrix row 是 package-level evidence；required flag 决定 unknown 是否能进入 release candidate。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.15 的边界是 package-level matrix：每一行都有 packageName、checkName、status、required；它不合并成单一绿色结论。

**Monorepo / Release 机制证据链：**

`testBuildMatrixRows` 记录 design-system typecheck/unit pass 和 admin-app consumer-css unknown；`isMatrixReleaseBlocked()` 让 required unknown 阻塞 release。

**TypeScript / vue-tsc 编译期过程：**

matrix 复用 `CiCheckStatus`，保持 CI stage 与 dashboard status 同一类型来源。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

Vue computed 只统计本地数组；真实 test/build matrix 需要 CI 输出或 workspace command output。

**API / 语法规则：**

`TestBuildMatrixRow` 定义 matrix row；`countRowsByStatus()` 用同一个 status union 统计 pass/unknown；`isMatrixReleaseBlocked()` 执行 required gate。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/testBuildMatrixModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/TestBuildMatrixPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/testBuildMatrixModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/testBuildMatrixModel.ts</span>
  </div>

```ts
import type { CiCheckStatus } from "./ciPipelineEvidenceModel";

export interface TestBuildMatrixRow {
  readonly packageName: string;
  readonly checkName: string;
  readonly status: CiCheckStatus;
  readonly required: boolean;
}

export const testBuildMatrixRows: readonly TestBuildMatrixRow[] = [
  {
    packageName: "@vue-lab/design-system",
    checkName: "typecheck",
    status: "pass",
    required: true,
  },
  {
    packageName: "@vue-lab/design-system",
    checkName: "unit",
    status: "pass",
    required: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    checkName: "consumer-css",
    status: "unknown",
    required: true,
  },
];

```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/testBuildMatrixModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  countRowsByStatus,
  isMatrixReleaseBlocked,
} from "../models/testBuildMatrixModel";

describe("testBuildMatrixModel", () => {
  it("blocks required unknown matrix rows", () => {
    const rows = [
      {
        packageName: "@vue-lab/admin-app",
        checkName: "consumer-css",
        status: "unknown" as const,
        required: true,
      },
    ];

    expect(isMatrixReleaseBlocked(rows)).toBe(true);
    expect(countRowsByStatus(rows, "unknown")).toBe(1);
  });
});
```
</div>

**逐行解释：**

模型中的第三行是 consumer-css unknown；panel 显示 pass count 与 unknown count；测试只用一个 unknown required row 就能证明 blocking。

**执行过程：**

composable 读取 matrix rows 后生成三个 computed：passCount、unknownCount、blocked；template 展示这些值，Vitest 验证核心判定函数。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

consumer-css 从 unknown 改 pass 会减少 unknownCount 并可能解除 blocked；新增 required fail row 会让 release 继续 blocked。

**为什么得到这个结果：**

矩阵按 package 和 check 拆分，所以 design-system unit pass 不能覆盖 admin-app CSS unknown。

**对比写法：**

对比只写 “tests passed” 的写法，本节把 package、checkName、status 和 required 放在 matrix row 中。

**常见错误为什么错：**

常见错误是报告 “all tests passed” 却没列 package-level matrix；错在 required unknown row 被隐藏。

**与真实项目的关系：**

真实 release review 会逐行看 required matrix；UNKNOWN consumer-css 必须阻塞。

**与当前学习主线的关系：**

本节把 Chapter 10 quality table 扩展为 package-level release dashboard。

**最终记忆模型：**

Matrix readiness is per package, per check, per required flag。

<a id="section-9-16"></a>

### 9.16 Release candidate model：changed packages、version plan、changelog entry、migration note and approval evidence

**结论：**

release candidate 是 changed packages、version plan、changelog、migration note 和 approvals 的证据集合。

**本节解决的问题：**

9.16 使用 `rc-19-local` 演示 migrationNoteComplete false 与 missing approval 如何阻塞 release。

**技术意义：**

`ReleaseCandidatePanel.vue` 同时读取 candidate 和 changelog model，说明 changelog 不是发布后的装饰。

**概念解释：**

candidate 把技术检查转成 release decision；每个 changed package 都需要对应 version 和 reviewer evidence。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.16 聚焦 release candidate completeness：changedPackages、versionPlanComplete、changelogComplete、migrationNoteComplete 和 approvals 都必须进入 candidate。

**Monorepo / Release 机制证据链：**

`isReleaseCandidateBlocked()` 按 changed package、version plan、changelog、migration note 和 approval 顺序检查；任何缺口都会让 candidate 停在 review。

**TypeScript / vue-tsc 编译期过程：**

`ReleaseCandidateApproval` 能表达 owner approval；它不会证明 reviewer 本人真的审查了 diff。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

本章只显示 local candidate；真实 release automation、tag、artifact 和 approval system 都不运行。

**API / 语法规则：**

`ReleaseCandidate` 表示一个可审查发布对象；`ReleaseCandidateApproval` 把 owner 与 approved flag 绑定，而不是只写自然语言。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/releaseCandidateModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/ReleaseCandidatePanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/releaseCandidateModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/releaseCandidateModel.ts</span>
  </div>

```ts
export interface ReleaseCandidateApproval {
  readonly owner: string;
  readonly approved: boolean;
}

export interface ReleaseCandidate {
  readonly id: string;
  readonly changedPackages: readonly string[];
  readonly versionPlanComplete: boolean;
  readonly changelogComplete: boolean;
  readonly migrationNoteComplete: boolean;
  readonly approvals: readonly ReleaseCandidateApproval[];
}

export const releaseCandidate: ReleaseCandidate = {
  id: "rc-19-local",
  changedPackages: ["@vue-lab/design-system", "@vue-lab/admin-app"],
  versionPlanComplete: true,
  changelogComplete: true,
  migrationNoteComplete: false,
  approvals: [
    { owner: "Design Systems", approved: true },
    { owner: "App Experience", approved: false },
  ],
};

export function isReleaseCandidateBlocked(candidate: ReleaseCandidate): boolean {
  return (
    candidate.changedPackages.length === 0 ||
    !candidate.versionPlanComplete ||
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/releaseCandidateModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { isReleaseCandidateBlocked } from "../models/releaseCandidateModel";

describe("releaseCandidateModel", () => {
  it("blocks major candidate without migration note", () => {
    expect(
      isReleaseCandidateBlocked({
        id: "rc-19-local",
        changedPackages: ["@vue-lab/design-system"],
        versionPlanComplete: true,
        changelogComplete: true,
        migrationNoteComplete: false,
        approvals: [{ owner: "Design Systems", approved: true }],
      }),
    ).toBe(true);
  });
});
```
</div>

**逐行解释：**

默认 candidate 包含 design-system 与 admin-app；migrationNoteComplete 为 false，App Experience approval 为 false；测试构造 major candidate 缺 migration note 的情况。

**执行过程：**

ReleaseCandidatePanel 在 setup 中读取 candidate 和 changelog；template 显示 blocked 与 changelog ready，Vitest 直接检查 blocking 函数。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

changedPackages 为空会阻塞；migrationNoteComplete 从 false 变 true 只解决一类缺口；approval false 仍会保持 blocked。

**为什么得到这个结果：**

release candidate 是多证据对象，不是版本号；缺少 migration note 或 approval 时，consumer 无法安全评估升级。

**对比写法：**

对比先 tag 后补文档的写法，本节让 version plan、changelog、migration note 和 approvals 都在 candidate 内部完成。

**常见错误为什么错：**

常见错误是先 tag 再补 changelog；错在 reviewer 在批准前看不到 breaking impact 和 migration path。

**与真实项目的关系：**

真实 release candidate 是可审查对象；缺少 migration note 或 owner approval 不应进入 publish stage。

**与当前学习主线的关系：**

本节连接 Chapter 14 migration method 和 Chapter 18 release gate。

**最终记忆模型：**

Release candidate needs changed packages, version, changelog, migration, approvals。

<a id="section-9-17"></a>

### 9.17 Version plan and migration notes：semver impact、consumer risk、deprecation window and upgrade path

**结论：**

semver impact 必须由 public API change 推导，breaking change 必须带 migration note。

**本节解决的问题：**

9.17 把 removedExport 映射到 major，把 migration steps 映射到 upgrade path，防止只改 version number。

**技术意义：**

`VersionMigrationPanel.vue` 展示 1.4.2 -> 2.0.0 与 inferred major impact 是否匹配。

**概念解释：**

version plan 说明发布号码，migration note 说明 consumer 要做什么；deprecation window 则说明何时移除旧 API。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.17 的边界是 semver 与 migration note：public API impact 决定 patch/minor/major，breaking change 必须有 upgrade steps。

**Monorepo / Release 机制证据链：**

`inferSemverImpact()` 从 removedExport 推导 major；`doesVersionPlanMatchImpact()` 比对计划版本；`isMigrationNoteComplete()` 检查 breaking steps 和 owner。

**TypeScript / vue-tsc 编译期过程：**

`SemverImpact` 限定 patch/minor/major；真实 consumer risk 需要 usage audit 和 migration test。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

面板不会修改 package version；本章不运行 release tool，也不写 changelog 文件。

**API / 语法规则：**

`PublicApiChange` 表示 API 变更形状，`VersionPlan` 表示版本计划，`MigrationNote` 表示 consumer upgrade instructions。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/versionPlanModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/models/migrationNoteModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/tests/versionPlanModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/versionPlanModel.ts</span>
  </div>

```ts
export type SemverImpact = "patch" | "minor" | "major";

export interface PublicApiChange {
  readonly removedExport: boolean;
  readonly addedExport: boolean;
  readonly behaviorChanged: boolean;
}

export interface VersionPlan {
  readonly packageName: string;
  readonly currentVersion: string;
  readonly nextVersion: string;
  readonly impact: SemverImpact;
}

export const versionPlan: VersionPlan = {
  packageName: "@vue-lab/design-system",
  currentVersion: "1.4.2",
  nextVersion: "2.0.0",
  impact: "major",
};

export function inferSemverImpact(change: PublicApiChange): SemverImpact {
  if (change.removedExport) {
    return "major";
  }

  if (change.addedExport) {
    return "minor";
  }
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/versionPlanModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { doesVersionPlanMatchImpact, inferSemverImpact } from "../models/versionPlanModel";

describe("versionPlanModel", () => {
  it("infers major impact for removed public export", () => {
    const impact = inferSemverImpact({
      removedExport: true,
      addedExport: false,
      behaviorChanged: false,
    });

    expect(impact).toBe("major");
    expect(
      doesVersionPlanMatchImpact(
        {
          packageName: "@vue-lab/design-system",
          currentVersion: "1.4.2",
          nextVersion: "2.0.0",
          impact: "major",
        },
        impact,
      ),
    ).toBe(true);
  });
});
```
</div>

**逐行解释：**

panel 构造 removedExport true 的 change，所以 inferredImpact 为 major；测试也从 removed export 推导 major 并要求 version plan 匹配。

**执行过程：**

VersionMigrationPanel 先推导 impact，再显示 currentVersion 到 nextVersion；Vitest 验证 removed public export 不会被降级成 minor。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

removedExport true 使 impact 变 major；steps 为空会让 migration note incomplete；owner 缺失会让 consumer 没有升级责任人。

**为什么得到这个结果：**

semver 由 public contract 变化决定；删除 export 会破坏现有 consumer import，因此 major 与 migration note 同时必要。

**对比写法：**

对比只改 version number 的写法，本节从 removedExport 推导 major，再检查 migration steps。

**常见错误为什么错：**

常见错误是只写 `2.0.0` 不写迁移步骤；错在 consumer 知道有 breaking change，却不知道如何替换旧 import。

**与真实项目的关系：**

真实 consumer upgrade 需要知道替换路径；semver 没有 migration note 会让 breaking change 难以落地。

**与当前学习主线的关系：**

本节把 Chapter 14 的迁移说明变成 monorepo package release evidence。

**最终记忆模型：**

Removed public export -> major impact -> migration note。

<a id="section-9-18"></a>

### 9.18 Publish boundary and provenance：npm publish boundary、registry access、tokens、provenance and claim UNKNOWN

**结论：**

publishing 是外部边界；没有 verified access、secret state、CI evidence 和 provenance output 时只能标 UNKNOWN。

**本节解决的问题：**

9.18 通过 `publishReadiness` 和 `provenanceBoundary` 显示为什么本章不能声称 publish readiness。

**技术意义：**

`PublishBoundaryPanel.vue` 展示 publish gaps，不包含 runnable publish command、token placeholder 或 registry config。

**概念解释：**

package metadata、access、secret、CI evidence 和 provenance 都属于 release platform；本地 model 只记录缺口。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.18 明确停在 external publish boundary：package metadata、remote access、secret state、CI evidence 和 provenance 都需要外部系统证明。

**Monorepo / Release 机制证据链：**

`isPublishBoundaryReady()` 同时要求 metadata、access、verified secret 和 CI pass；`listPublishBoundaryGaps()` 把 remote-access、secret-state、ci-evidence 列出来。

**TypeScript / vue-tsc 编译期过程：**

`PublishReadiness` 能阻止把 unknown secretState 当 verified；它不能验证 npm account、OIDC 或 signing result。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

本章不调用 network API，不写 registry URL，不运行 publish；所有外部 publish claim 保持 UNKNOWN。

**API / 语法规则：**

`PublishReadiness` 记录 publish prerequisites，`ProvenanceBoundary` 记录 provider support、claimStatus 和 public build link。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/publishBoundaryModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/PublishBoundaryPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/publishBoundaryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/publishBoundaryModel.ts</span>
  </div>

```ts
import type { CiCheckStatus } from "./ciPipelineEvidenceModel";

export interface PublishReadiness {
  readonly packageName: string;
  readonly packageMetadataReady: boolean;
  readonly remoteAccessKnown: boolean;
  readonly secretState: "missing" | "unknown" | "verified";
  readonly ciEvidenceStatus: CiCheckStatus;
}

export const publishReadiness: PublishReadiness = {
  packageName: "@vue-lab/design-system",
  packageMetadataReady: true,
  remoteAccessKnown: false,
  secretState: "unknown",
  ciEvidenceStatus: "unknown",
};

export function isPublishBoundaryReady(readiness: PublishReadiness): boolean {
  return (
    readiness.packageMetadataReady &&
    readiness.remoteAccessKnown &&
    readiness.secretState === "verified" &&
    readiness.ciEvidenceStatus === "pass"
  );
}

export function listPublishBoundaryGaps(readiness: PublishReadiness): readonly string[] {
  const gaps: string[] = [];

```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/publishBoundaryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  isPublishBoundaryReady,
  listPublishBoundaryGaps,
} from "../models/publishBoundaryModel";

describe("publishBoundaryModel", () => {
  it("blocks publish when provenance or CI evidence is unknown", () => {
    const readiness = {
      packageName: "@vue-lab/design-system",
      packageMetadataReady: true,
      remoteAccessKnown: false,
      secretState: "unknown" as const,
      ciEvidenceStatus: "unknown" as const,
    };

    expect(isPublishBoundaryReady(readiness)).toBe(false);
    expect(listPublishBoundaryGaps(readiness)).toEqual([
      "remote-access",
      "secret-state",
      "ci-evidence",
    ]);
  });
});
```
</div>

**逐行解释：**

默认 publish readiness 让 remoteAccessKnown false、secretState unknown、ciEvidenceStatus unknown；测试确认这些 gaps 阻塞 publish。

**执行过程：**

panel 显示 publish ready false、gaps list 和 provenance verified false；Vitest 只验证 gap calculation，不触碰 registry 或 token。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

secretState 从 unknown 变 verified 只解决一个 gap；remoteAccessKnown 和 ciEvidenceStatus 仍必须分别变成有效证据。

**为什么得到这个结果：**

publish/provenance 涉及 registry、credential、CI runner 和 build-publish link；本地 Markdown 或 model boolean 不能替代这些外部输出。

**对比写法：**

对比在示例里放 publish command 或 token placeholder 的写法，本节只记录 gaps，且保持 publish readiness false。

**常见错误为什么错：**

常见错误是在学习示例里加入 token placeholder 或 publish config；错在把外部凭证边界混进本地练习文件。

**与真实项目的关系：**

真实 publish 需要 account/access/secret/provenance/CI output；本地学习文件不能制造这些证据。

**与当前学习主线的关系：**

本节连接 Chapter 16 secret boundary、Chapter 17 UNKNOWN discipline 和 Chapter 18 package readiness。

**最终记忆模型：**

Publish readiness stays blocked until access, secret, CI, provenance are verified externally。

<a id="section-9-19"></a>

### 9.19 Rollback and hotfix workflow：failed release、consumer breakage、patch branch、rollback gate and communication

**结论：**

rollback 不是简单 revert；它需要 affected package、consumer impact、owner、patch branch 和沟通证据。

**本节解决的问题：**

9.19 用 `consumer-break` 场景说明 style/API failure 进入 release 后如何定位 rollback owner。

**技术意义：**

`rollbackHotfixModel.test.ts` 让 communicationReady false，证明缺少 consumer notice 时 rollback path 不完整。

**概念解释：**

hotfix 处理新补丁，rollback 降低当前影响；两者都必须知道哪个 consumer 受影响。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.19 的边界是 post-release failure response：failureKind、affectedPackage、affectedConsumer、rollbackOwner、patchBranchNeeded 和 communicationReady 决定 rollback path。

**Monorepo / Release 机制证据链：**

`RollbackHotfixDecision` 从 consumer-break 开始，指向 design-system 与 admin-app；`isRollbackPathReady()` 要求 patch branch 和 communication 都准备好。

**TypeScript / vue-tsc 编译期过程：**

`ReleaseFailureKind` 限定 consumer-break、ci-failure、style-break；真实 incident decision 需要生产证据。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

面板不会创建 patch branch；它只把 rollback readiness 显示成本地 decision state。

**API / 语法规则：**

`ReleaseFailureKind` 限定 failure class，`getRollbackBlockingReason()` 把缺失沟通转成 reviewer 可读原因。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/rollbackHotfixModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/RollbackHotfixPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/rollbackHotfixModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/rollbackHotfixModel.ts</span>
  </div>

```ts
export type ReleaseFailureKind = "consumer-break" | "ci-failure" | "style-break";

export interface RollbackHotfixDecision {
  readonly failureKind: ReleaseFailureKind;
  readonly affectedPackage: string;
  readonly affectedConsumer: string;
  readonly rollbackOwner: string;
  readonly patchBranchNeeded: boolean;
  readonly communicationReady: boolean;
}

export const rollbackHotfixDecision: RollbackHotfixDecision = {
  failureKind: "consumer-break",
  affectedPackage: "@vue-lab/design-system",
  affectedConsumer: "@vue-lab/admin-app",
  rollbackOwner: "Release Engineering",
  patchBranchNeeded: true,
  communicationReady: false,
};

export function isRollbackPathReady(decision: RollbackHotfixDecision): boolean {
  return decision.patchBranchNeeded && decision.communicationReady;
}

export function getRollbackBlockingReason(decision: RollbackHotfixDecision): string {
  if (!decision.communicationReady) {
    return "consumer notice missing";
  }

  return "rollback path ready";
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/rollbackHotfixModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  getRollbackBlockingReason,
  isRollbackPathReady,
} from "../models/rollbackHotfixModel";

describe("rollbackHotfixModel", () => {
  it("requires communication before rollback path is ready", () => {
    const decision = {
      failureKind: "consumer-break" as const,
      affectedPackage: "@vue-lab/design-system",
      affectedConsumer: "@vue-lab/admin-app",
      rollbackOwner: "Release Engineering",
      patchBranchNeeded: true,
      communicationReady: false,
    };

    expect(isRollbackPathReady(decision)).toBe(false);
    expect(getRollbackBlockingReason(decision)).toBe("consumer notice missing");
  });
});
```
</div>

**逐行解释：**

模型默认 communicationReady 为 false；panel 展示 affected package、consumer 和 ready 状态；测试要求返回 consumer notice missing。

**执行过程：**

RollbackHotfixPanel 读取 decision 后显示 blocked reason；Vitest 构造同样的 missing communication 场景并检查 rollback readiness。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

communicationReady 从 false 变 true 会解除 notice gap；patchBranchNeeded false 会让 hotfix path 不完整；affectedConsumer 决定通知范围。

**为什么得到这个结果：**

rollback 要降低 consumer impact，而不是只撤销代码；没有 consumer communication，受影响 app owner 不知道如何应对。

**对比写法：**

对比把 rollback 简化成 revert 的写法，本节要求 affected consumer、rollback owner、patch branch 和 notice 状态。

**常见错误为什么错：**

常见错误是把 rollback 简化成 revert commit；错在 patch branch、consumer notice 和 owner coordination 都被跳过。

**与真实项目的关系：**

真实 incident 中 consumer breakage 需要沟通窗口和 hotfix owner；缺少 notice 会扩大影响。

**与当前学习主线的关系：**

本节把 Chapter 17 incident workflow 放进 package release failure path。

**最终记忆模型：**

Rollback path = failure class + affected consumer + patch branch + communication。

<a id="section-9-20"></a>

### 9.20 Ownership and review model：package owner、required reviewer、risk area and approval gate

**结论：**

package owner 和 required reviewer 是 release gate 的一等数据，不应该藏在聊天记录里。

**本节解决的问题：**

9.20 把 `@vue-lab/admin-app` 的 approved false 留在模型中，说明 consumer owner 没批准时 release 仍 blocked。

**技术意义：**

`OwnershipReviewPanel.vue` 展示 missing approvals count，给 dashboard 提供明确 failure signal。

**概念解释：**

owner 负责 package，required reviewer 负责风险区域；approval gate 把职责转成可验证字段。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.20 聚焦 ownership gate：package owner、requiredReviewer、riskArea 和 approved flag 是 release decision 的输入，不是注释。

**Monorepo / Release 机制证据链：**

`ownershipReviewRules` 中 design-system 已批准，admin-app 未批准；`listMissingOwnerApprovals()` 返回未批准规则，dashboard 由此继续 blocked。

**TypeScript / vue-tsc 编译期过程：**

`OwnershipReviewRule` 能要求 packageName、owner、reviewer、riskArea 和 approved 字段；它不能证明审查质量。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

点击 dashboard 的 reviewer override 只改变本地 ref；真实 code owner review 没有执行。

**API / 语法规则：**

`OwnershipReviewRule` 描述谁拥有 package、谁必须 review、风险区域是什么；`isOwnershipApproved()` 只在缺口为零时返回 true。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/ownershipReviewModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/OwnershipReviewPanel.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/ownershipReviewModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/ownershipReviewModel.ts</span>
  </div>

```ts
export interface OwnershipReviewRule {
  readonly packageName: string;
  readonly owner: string;
  readonly requiredReviewer: string;
  readonly riskArea: string;
  readonly approved: boolean;
}

export const ownershipReviewRules: readonly OwnershipReviewRule[] = [
  {
    packageName: "@vue-lab/design-system",
    owner: "Design Systems",
    requiredReviewer: "UI Platform Lead",
    riskArea: "public export surface",
    approved: true,
  },
  {
    packageName: "@vue-lab/admin-app",
    owner: "App Experience",
    requiredReviewer: "Product Surface Lead",
    riskArea: "consumer rendering",
    approved: false,
  },
];

export function listMissingOwnerApprovals(
  rules: readonly OwnershipReviewRule[],
): readonly OwnershipReviewRule[] {
  return rules.filter((rule) => !rule.approved);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/ownershipReviewModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  isOwnershipApproved,
  listMissingOwnerApprovals,
} from "../models/ownershipReviewModel";

describe("ownershipReviewModel", () => {
  it("detects missing required owner approval", () => {
    const rules = [
      {
        packageName: "@vue-lab/admin-app",
        owner: "App Experience",
        requiredReviewer: "Product Surface Lead",
        riskArea: "consumer rendering",
        approved: false,
      },
    ];

    expect(isOwnershipApproved(rules)).toBe(false);
    expect(listMissingOwnerApprovals(rules)).toEqual(rules);
  });
});
```
</div>

**逐行解释：**

模型列出 UI Platform Lead 与 Product Surface Lead 两个 reviewer；panel 显示 ownership approved false 和 missing approvals count。

**执行过程：**

template 调用 ownership functions 时读取 approved flags；Vitest 构造单条 approved false rule，确认 missing approvals 原样返回。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

approved 从 false 变 true 会减少 missing list；riskArea 改变会改变 reviewer 关注点；requiredReviewer 缺失会让审批不可追踪。

**为什么得到这个结果：**

release gate 需要明确人和风险区域；只有 owner 名称，没有 required reviewer，就无法判断 public export 或 consumer rendering 谁签字。

**对比写法：**

对比口头说 “owner approved” 的写法，本节用 `OwnershipReviewRule.approved` 和 requiredReviewer 暴露缺口。

**常见错误为什么错：**

常见错误是在 PR 文本里写 “approved by team”；错在 gate 不能从自由文本可靠提取 reviewer 和 risk area。

**与真实项目的关系：**

真实 code owner policy 可以接入此模型；本地按钮只模拟 reviewer evidence，不替代平台审批。

**与当前学习主线的关系：**

本节把 governance 明确为 release gate 输入，而不是隐藏在 PR 描述里。

**最终记忆模型：**

Owner approval is structured data, not chat history。

<a id="section-9-21"></a>

### 9.21 Monorepo release dashboard：workspace graph、CI matrix、consumer proof、open issues and release decision

**结论：**

release dashboard 的职责是聚合证据，而不是把单个 local PASS 放大成整体 readiness。

**本节解决的问题：**

9.21 聚合 CI、consumer smoke、candidate、ownership 和 high issues，形成最终 blocked decision。

**技术意义：**

`monorepoReleaseGateModel.test.ts` 期望五个 failure signal 同时出现，证明 dashboard 没有吞掉 UNKNOWN。

**概念解释：**

dashboard 是 evidence aggregator；每个上游模型保留自己的 owner 和 failure signal。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.21 的边界是 dashboard aggregation：它读取 CI、consumer smoke、candidate、ownership 和 issue models，不重写任何上游判断。

**Monorepo / Release 机制证据链：**

`evaluateMonorepoReleaseGate()` 依次聚合 blocking CI、incomplete smoke、blocked candidate、missing owner approval 和 high open issue，返回 failureSignals。

**TypeScript / vue-tsc 编译期过程：**

`MonorepoReleaseGateInput` 把多个 model 类型组合起来；它不会验证外部平台是否产生了真实 evidence。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

`MonorepoReleaseDashboard.vue` 通过 computed gate result 更新 UI；这只是本地 lab state。

**API / 语法规则：**

`MonorepoReleaseGateInput` 是聚合输入，`MonorepoReleaseGateResult` 只输出 blocked 与 failureSignals；dashboard 不把 unknown 压平成 pass。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/models/monorepoReleaseGateModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/components/MonorepoReleaseDashboard.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/monorepoReleaseGateModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/monorepoReleaseGateModel.ts</span>
  </div>

```ts
import type { ConsumerSmokeResult } from "./consumerSmokeTestModel";
import { isConsumerSmokeReady } from "./consumerSmokeTestModel";
import type { CiPipelineCheck } from "./ciPipelineEvidenceModel";
import { listBlockingCiChecks } from "./ciPipelineEvidenceModel";
import type { MonorepoIssue } from "./monorepoIssueModel";
import { listOpenHighIssues } from "./monorepoIssueModel";
import type { OwnershipReviewRule } from "./ownershipReviewModel";
import { isOwnershipApproved } from "./ownershipReviewModel";
import type { ReleaseCandidate } from "./releaseCandidateModel";
import { isReleaseCandidateBlocked } from "./releaseCandidateModel";

export interface MonorepoReleaseGateInput {
  readonly ciChecks: readonly CiPipelineCheck[];
  readonly consumerSmoke: ConsumerSmokeResult;
  readonly releaseCandidate: ReleaseCandidate;
  readonly ownershipRules: readonly OwnershipReviewRule[];
  readonly issues: readonly MonorepoIssue[];
}

export interface MonorepoReleaseGateResult {
  readonly blocked: boolean;
  readonly failureSignals: readonly string[];
}

export function evaluateMonorepoReleaseGate(
  input: MonorepoReleaseGateInput,
): MonorepoReleaseGateResult {
  const failureSignals: string[] = [];

  if (listBlockingCiChecks(input.ciChecks).length > 0) {
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/monorepoReleaseGateModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { evaluateMonorepoReleaseGate } from "../models/monorepoReleaseGateModel";

describe("monorepoReleaseGateModel", () => {
  it("aggregates CI, consumer, candidate, owner, and issue blockers", () => {
    const result = evaluateMonorepoReleaseGate({
      ciChecks: [
        {
          packageName: "@vue-lab/admin-app",
          stage: "build",
          status: "unknown",
          required: true,
          evidenceId: "missing-build-output",
        },
      ],
      consumerSmoke: {
        consumerPackage: "@vue-lab/admin-app",
        libraryPackage: "@vue-lab/design-system",
        importResult: "pass",
        renderResult: "pass",
        cssResult: "unknown",
      },
      releaseCandidate: {
        id: "rc-19-local",
        changedPackages: ["@vue-lab/design-system"],
        versionPlanComplete: true,
        changelogComplete: true,
        migrationNoteComplete: false,
```
</div>

**逐行解释：**

模型函数每检查一种输入就可能 push 一个 signal；测试期望五个 signal 按顺序出现，说明聚合器保留来源。

**执行过程：**

dashboard computed 读取 gate input 后更新 blocked 文案；点击 reviewer 按钮只影响 owner approval override，不会消除 CI、smoke 或 issue blockers。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

CI unknown 会产生 ci-check-blocked；CSS smoke unknown 会产生 consumer-smoke-incomplete；high issue open 会产生 high-issue-open。

**为什么得到这个结果：**

dashboard 的结果来自多个独立 gate，而不是单个总分；只要 failureSignals 非空，blocked 就必须保持 true。

**对比写法：**

对比 dashboard 只显示绿色总数的写法，本节保留五类 failure signal，并让 blocked 由 signals 推导。

**常见错误为什么错：**

常见错误是 dashboard 只显示最终绿色/红色；错在 reviewer 无法知道 blocker 来自 CI、consumer、candidate、owner 还是 issue。

**与真实项目的关系：**

真实 release dashboard 应展示 CI、consumer、candidate、owner 和 issue 的分来源状态。

**与当前学习主线的关系：**

本节把 Chapter 17 dashboard mindset 与 Chapter 18 release gate 合并为 monorepo decision。

**最终记忆模型：**

Release dashboard aggregates signals; it does not erase signal sources。

<a id="section-9-22"></a>

### 9.22 Chapter integration：how Chapter 19 connects design system, tests, production, security, observability and migration

**结论：**

Chapter 19 只整合一次前面章节：Chapter 18 package boundary、Chapter 10 tests、Chapter 11 build、Chapter 16 security、Chapter 17 evidence、Chapter 14 migration。

**本节解决的问题：**

9.22 说明 root shell 渲染 Chapter 19 时，旧章节仍保留，新章节只新增 monorepo release evidence lab。

**技术意义：**

`App.vue` import `MonorepoReleaseChapterApp.vue` 后在 Chapter 18 后面渲染，保持学习路径连续。

**概念解释：**

章节集成不是新 architecture；它把已学质量门禁、发布证据和迁移说明放进一个 release decision model。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.22 只处理 chapter integration：root shell import Chapter 19 app 并在 Chapter 18 后渲染；它不重排旧章节、不创建新架构。

**Monorepo / Release 机制证据链：**

`MonorepoReleaseChapterApp` 被加入 root learning shell 后，Chapter 19 panels 进入学习页面；failure signal 是 chapter panel missing from root app。

**TypeScript / vue-tsc 编译期过程：**

SFC import 能被 `vue-tsc` 检查路径和组件类型；它不能证明用户在浏览器里看到了所有 panel。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

Vite dev/build 会处理新增 SFC import；真实 monorepo conversion 未发生。

**API / 语法规则：**

`MonorepoReleaseChapterApp` 是 SFC integration point；imported panels 是章节内部组合；chapter divider 只是页面分隔结构。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/MonorepoReleaseChapterApp.vue`
- `src/learning/vue/chapter-19-monorepo-release/components/MonorepoReleaseDashboard.vue`
- `src/learning/vue/chapter-19-monorepo-release/tests/monorepoReleaseGateModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/MonorepoReleaseChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import "./monorepo-release.css";
import BuildOrderPanel from "./components/BuildOrderPanel.vue";
import CiPipelineEvidencePanel from "./components/CiPipelineEvidencePanel.vue";
import ConsumerSmokeTestPanel from "./components/ConsumerSmokeTestPanel.vue";
import CssExportContractPanel from "./components/CssExportContractPanel.vue";
import DependencyPolicyPanel from "./components/DependencyPolicyPanel.vue";
import ImportGatePanel from "./components/ImportGatePanel.vue";
import MonorepoReleaseDashboard from "./components/MonorepoReleaseDashboard.vue";
import OwnershipReviewPanel from "./components/OwnershipReviewPanel.vue";
import PackageBoundaryPanel from "./components/PackageBoundaryPanel.vue";
import PackageExportSurfacePanel from "./components/PackageExportSurfacePanel.vue";
import PeerDependencyPanel from "./components/PeerDependencyPanel.vue";
import PublishBoundaryPanel from "./components/PublishBoundaryPanel.vue";
import ReleaseCandidatePanel from "./components/ReleaseCandidatePanel.vue";
import RollbackHotfixPanel from "./components/RollbackHotfixPanel.vue";
import TestBuildMatrixPanel from "./components/TestBuildMatrixPanel.vue";
import TypeScriptProjectBoundaryPanel from "./components/TypeScriptProjectBoundaryPanel.vue";
import VersionMigrationPanel from "./components/VersionMigrationPanel.vue";
import WorkspaceGraphPanel from "./components/WorkspaceGraphPanel.vue";
import WorkspaceLinkingPanel from "./components/WorkspaceLinkingPanel.vue";
import WorkspaceScriptsPanel from "./components/WorkspaceScriptsPanel.vue";
</script>

<template>
  <section class="chapter-section chapter-19" aria-labelledby="chapter-19-title">
    <header class="hero">
      <p class="eyebrow">Chapter 19</p>
      <h2 id="chapter-19-title">
        Monorepo, Workspace Packages, Internal Consumer App, Release Automation,
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/monorepoReleaseGateModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { evaluateMonorepoReleaseGate } from "../models/monorepoReleaseGateModel";

describe("monorepoReleaseGateModel", () => {
  it("aggregates CI, consumer, candidate, owner, and issue blockers", () => {
    const result = evaluateMonorepoReleaseGate({
      ciChecks: [
        {
          packageName: "@vue-lab/admin-app",
          stage: "build",
          status: "unknown",
          required: true,
          evidenceId: "missing-build-output",
        },
      ],
      consumerSmoke: {
        consumerPackage: "@vue-lab/admin-app",
        libraryPackage: "@vue-lab/design-system",
        importResult: "pass",
        renderResult: "pass",
        cssResult: "unknown",
      },
      releaseCandidate: {
        id: "rc-19-local",
        changedPackages: ["@vue-lab/design-system"],
        versionPlanComplete: true,
        changelogComplete: true,
        migrationNoteComplete: false,
```
</div>

**逐行解释：**

代码窗口展示 Chapter 19 app shell 的 imports；root shell 只新增一个 import 和一个 render位置；测试仍用 release gate model 代表章节核心逻辑。

**执行过程：**

Vite 解析新增 SFC import，Vue runtime 在 Chapter 18 后创建 Chapter 19 component instance；旧章节 component tree 不被替换。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

root shell 多一个 component import 和 render node；chapter order 增加 Chapter 19；release model 的 status 不因集成动作自动改变。

**为什么得到这个结果：**

集成成功的原因是 Vue SFC import 连通且 template 渲染新组件；它只证明页面包含本章 lab，不证明 monorepo conversion。

**对比写法：**

对比把 chapter integration 写成新架构的做法，本节只追加 root shell render，不改变旧章节 panel。

**常见错误为什么错：**

常见错误是借章节集成顺手重构 root shell；错在当前任务只需要追加 Chapter 19，不应改变 Chapter 01-18 展示。

**与真实项目的关系：**

真实课程仓库集成新章节时，最小安全改动是 import 新 chapter app 并保留已有章节顺序。

**与当前学习主线的关系：**

本节只做一次跨章节总结，防止 Chapter 19 重复讲解前 18 章。

**最终记忆模型：**

Chapter integration means append the chapter app, not redesign the shell。

<a id="section-9-23"></a>

### 9.23 Final integration：vue-monorepo-release-lab 如何形成 workspace release evidence workspace

**结论：**

`vue-monorepo-release-lab` 的结论是 evidence workspace：每个发布判断都必须能回到模型、测试、命令或外部证据。

**本节解决的问题：**

9.23 把 20 个 panels、5 个 composables、26 个 models 和 23 个 tests 合成最终 lab，但仍不创建真实 workspace config。

**技术意义：**

`MonorepoReleaseChapterApp.vue` 是可运行 UI 汇总，`monorepoReleaseGateModel.test.ts` 是 release gate 汇总测试。

**概念解释：**

final integration 训练的是证据边界：local model 可证明逻辑，project commands 可证明当前 app，external systems 才能证明 publish/CI/provenance。

**边界：workspace graph、workspace linking、app package、library package、internal import gate、package export、CSS export、peer dependency、external Vue、build order、affected package、TypeScript project boundary、consumer smoke test、workspace scripts、lockfile policy、CI evidence、test/build matrix、release candidate、version plan、migration note、publish boundary、provenance、rollback、ownership、release gate：**

9.23 收束为 final lab evidence workspace：本地 UI、models、composables 和 tests 能证明规则连通；real workspace config、library output、consumer install、CI run、publish 和 provenance 仍需要外部检查。

**Monorepo / Release 机制证据链：**

`vue-monorepo-release-lab` 汇总 20 个 panels、5 个 composables、26 个 models 和 23 个 tests；它的核心失败是把没有外部输出的 CI/publish readiness 写成已通过。

**TypeScript / vue-tsc 编译期过程：**

`vue-tsc --noEmit` 能检查新增 SFC、models 和 tests 的类型连通；它不会生成 npm package declaration output。

**Workspace / Vite / Package Consumer / CI / Release Runtime 运行时过程：**

当前 Vite app 只渲染本地 dashboard；real workspace config、library build output、consumer install 和 CI run 都保持 UNKNOWN。

**API / 语法规则：**

`MonorepoReleaseChapterApp` 汇总可观察 UI，`evaluateMonorepoReleaseGate()` 汇总 release blockers，validation commands 只验证当前学习 app。

**文件结构：**

- `src/learning/vue/chapter-19-monorepo-release/MonorepoReleaseChapterApp.vue`
- `src/learning/vue/chapter-19-monorepo-release/models/monorepoReleaseGateModel.ts`
- `src/learning/vue/chapter-19-monorepo-release/tests/monorepoReleaseGateModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/MonorepoReleaseChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import "./monorepo-release.css";
import BuildOrderPanel from "./components/BuildOrderPanel.vue";
import CiPipelineEvidencePanel from "./components/CiPipelineEvidencePanel.vue";
import ConsumerSmokeTestPanel from "./components/ConsumerSmokeTestPanel.vue";
import CssExportContractPanel from "./components/CssExportContractPanel.vue";
import DependencyPolicyPanel from "./components/DependencyPolicyPanel.vue";
import ImportGatePanel from "./components/ImportGatePanel.vue";
import MonorepoReleaseDashboard from "./components/MonorepoReleaseDashboard.vue";
import OwnershipReviewPanel from "./components/OwnershipReviewPanel.vue";
import PackageBoundaryPanel from "./components/PackageBoundaryPanel.vue";
import PackageExportSurfacePanel from "./components/PackageExportSurfacePanel.vue";
import PeerDependencyPanel from "./components/PeerDependencyPanel.vue";
import PublishBoundaryPanel from "./components/PublishBoundaryPanel.vue";
import ReleaseCandidatePanel from "./components/ReleaseCandidatePanel.vue";
import RollbackHotfixPanel from "./components/RollbackHotfixPanel.vue";
import TestBuildMatrixPanel from "./components/TestBuildMatrixPanel.vue";
import TypeScriptProjectBoundaryPanel from "./components/TypeScriptProjectBoundaryPanel.vue";
import VersionMigrationPanel from "./components/VersionMigrationPanel.vue";
import WorkspaceGraphPanel from "./components/WorkspaceGraphPanel.vue";
import WorkspaceLinkingPanel from "./components/WorkspaceLinkingPanel.vue";
import WorkspaceScriptsPanel from "./components/WorkspaceScriptsPanel.vue";
</script>

<template>
  <section class="chapter-section chapter-19" aria-labelledby="chapter-19-title">
    <header class="hero">
      <p class="eyebrow">Chapter 19</p>
      <h2 id="chapter-19-title">
        Monorepo, Workspace Packages, Internal Consumer App, Release Automation,
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/monorepoReleaseGateModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { evaluateMonorepoReleaseGate } from "../models/monorepoReleaseGateModel";

describe("monorepoReleaseGateModel", () => {
  it("aggregates CI, consumer, candidate, owner, and issue blockers", () => {
    const result = evaluateMonorepoReleaseGate({
      ciChecks: [
        {
          packageName: "@vue-lab/admin-app",
          stage: "build",
          status: "unknown",
          required: true,
          evidenceId: "missing-build-output",
        },
      ],
      consumerSmoke: {
        consumerPackage: "@vue-lab/admin-app",
        libraryPackage: "@vue-lab/design-system",
        importResult: "pass",
        renderResult: "pass",
        cssResult: "unknown",
      },
      releaseCandidate: {
        id: "rc-19-local",
        changedPackages: ["@vue-lab/design-system"],
        versionPlanComplete: true,
        changelogComplete: true,
        migrationNoteComplete: false,
```
</div>

**逐行解释：**

final integration 的代码窗口展示 app shell、release gate model 和代表性测试；这些片段说明 lab 如何从 UI 走到 blocker assertion。

**执行过程：**

页面运行时渲染所有 panels；unit tests 运行 pure model assertions；build 命令只打包当前 Vite app，不产出 workspace package。

**workspace package、dependency edge、import path、export entry、CSS entry、peer dependency、build result、test result、CI status、version decision、release candidate、owner approval、rollback path 与 failure signal 的变化：**

local model/test/build 可变成 local PASS；external CI、published install、provenance 和 rollback drill 在未执行时保持 UNKNOWN；release decision 必须保留这种差异。

**为什么得到这个结果：**

final lab 的目标是训练证据边界：本地文件证明本地规则，外部系统证明外部事实，二者不能互相替代。

**对比写法：**

对比最终项目声称真实发布能力的写法，本节明确 local lab 只能证明 model/test/build，不能证明 external publish。

**常见错误为什么错：**

常见错误是把最终小项目描述成真实发布流水线；错在它没有 package files、workflow logs、registry output 或 consumer install artifact。

**与真实项目的关系：**

真实 monorepo release workspace 要继续接入 package files、CI logs、consumer install 和 publish evidence。

**与当前学习主线的关系：**

本节作为 Chapter 19 收束点，把所有 package/release signals 归入一个 evidence workspace。

**最终记忆模型：**

Final lab evidence is local unless an external check actually ran。

## 10. API / 语法索引

| API / Syntax | Layer | Input | Output | Runtime Effect | TypeScript Boundary |
| --- | --- | --- | --- | --- | --- |
| `WorkspacePackage` | model | package name, kind, owner, riskArea | graph node | rendered by `WorkspaceGraphPanel.vue` | checks field names, not owner truth |
| `WorkspaceLink` | package manager model | source, target, linkKind, install status | proof scope | displayed as local-consumption | cannot prove publish install |
| `ImportPathPolicy` | package API policy | allowedPaths and blockedPatterns | allow/block import result | rendered by import gate panel | cannot enforce Node resolver |
| `PackageExportSurfaceEntry` | package surface | path, kind, public, declarationPath | import proof model | dashboard reads availability | cannot generate declarations |
| `PeerDependencyDecision` | package contract | dependency placement and externalized flag | duplicate runtime risk | panel displays safe/blocked | cannot inspect bundle |
| `createBuildOrder()` | graph algorithm | package names and dependency edges | topological order | panel displays order | cannot verify cache |
| `findAffectedPackages()` | release planning | changed packages and edges | affected package set | composable recalculates list | cannot decide risk alone |
| `ConsumerSmokeResult` | consumer evidence | import/render/CSS statuses | smoke readiness | panel displays missing evidence | cannot run browser install |
| `CiPipelineCheck` | CI evidence | package, stage, status, required | blocking check list | dashboard aggregates | cannot claim real CI |
| `ReleaseCandidate` | release governance | changed packages, version, changelog, approvals | blocked decision | release panel displays status | cannot prove human review |
| `PublishReadiness` | external publish boundary | metadata, access, secret state, CI evidence | publish gaps | panel displays UNKNOWN | cannot verify registry or provenance |
| `evaluateMonorepoReleaseGate()` | release gate | CI, smoke, candidate, owner, issues | failureSignals | dashboard updates | input truth still needs evidence |

## 11. 常见错误表

| Wrong Form | Error Type | Violated Rule | Correction | Recognition Method |
| --- | --- | --- | --- | --- |
| Treating monorepo as only folders | architecture model error | missing package graph | model nodes and edges in `workspacePackageModel.ts` | no owner or dependency edge |
| Treating workspace linking as published package proof | evidence error | local symlink is not publish install | keep proof scope local-consumption | no tarball/install output |
| Importing internal modules from consumer apps | package API violation | public entry contract ignored | block `./internal/*` with import gate | internal path in consumer import |
| Forgetting CSS export | consumer style failure | style contract omitted | require CSS entry and smoke evidence | component renders unstyled |
| Treating app build as library build | build target confusion | browser bundle differs from library bundle | separate app and library build goals | `buildGoal` mismatch |
| Bundling Vue into reusable library accidentally | runtime sharing risk | consumer should own Vue runtime | peer/external decision | duplicate runtime risk |
| Claiming readiness without declarations | type evidence gap | consumer needs type surface | require declarationPath evidence | missing d.ts entry |
| Claiming compatibility without smoke test | consumer proof gap | build is not consumption | require import/render/CSS statuses | smoke result unknown |
| Ignoring dependent package rebuilds | graph failure | changed dependency affects consumer | compute affected packages | dependent app absent |
| Running packages in parallel without order | orchestration failure | dependencies must build first | use topological order | consumer before dependency |
| Treating local output as CI evidence | evidence boundary error | CI runner is separate environment | keep CI status UNKNOWN | no CI evidence id |
| Marking UNKNOWN required checks as PASS | release gate error | unknown cannot pass required gate | block required unknown | matrix row unknown |
| Ignoring lockfile changes | reproducibility failure | install output changed | require lockfile review | added/removed packages |
| Treating dependency version changes as harmless | supply-chain risk | range can change install result | review version policy | changed version range |
| Making breaking change without migration note | release governance failure | consumer upgrade path missing | require migration steps | major impact with empty note |
| Writing changelog after release | release evidence gap | reviewer needs change summary before approval | require changelogComplete | candidate blocked |
| Publishing without owner approval | ownership failure | required reviewer missing | block approval gate | missing owner approval |
| Adding tokens or registry config to examples | secret boundary failure | examples must not carry secrets | keep external publish UNKNOWN | secret placeholder found |
| Claiming provenance without workflow output | provenance boundary failure | build-publish link must be verified | require provider output | provenance UNKNOWN |
| Treating rollback as one-file revert | incident response error | consumer impact and comms matter | model affected consumer and notice | communication missing |
| Creating real workspace configs too early | architecture expansion | package boundary not confirmed | model first, ask before config changes | package files changed |
| Installing orchestration tools before graph model | tool-first error | graph drives tooling choice | build model with local data | tool added with no owner map |

## 12. 最终小项目

最终小项目 `vue-monorepo-release-lab` 只整合本章机制，不替代前面的分节教学。它把本地 typed data、Vue panels、composables 和 tests 组织成 release evidence workspace，但不把当前仓库转换成真实 monorepo。

### 12.1 项目目标

- 展示 workspace package graph、owner、risk area 和 dependency edge。
- 区分 app package、library package 和 tooling package 的 build goal。
- 证明 public import gate、CSS export、peer/external Vue、build order、affected set、consumer smoke、CI matrix、release candidate、publish boundary、rollback 和 ownership gate 的本地模型。
- 保持 real workspace config、real CI run、package publish、provenance/signing 和 rollback drill 为 UNKNOWN。

### 12.2 文件职责

| 文件组 | 职责 | 主要 evidence |
| --- | --- | --- |
| `models/` | 定义 package/release/CI/publish/rollback typed data 和 pure functions | Vitest model assertions |
| `composables/` | 把 model 转成 Vue computed state | panel reactive rendering |
| `components/` | 展示每个 release mechanism 的可观察 UI | root learning shell render |
| `tests/` | 固定 release blockers 和 boundary rules | `npm run test:unit` |
| `MonorepoReleaseChapterApp.vue` | 汇总 20 个 panels | Chapter 19 app integration |
| `monorepo-release.css` | 提供局部样式 | UI readability |

### 12.3 运行与验证

运行当前项目已有命令；这些命令验证当前单应用学习仓库，不等于真实 monorepo CI 或 package publish proof。

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

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Output</span>
  </div>

```txt
Do not mark a command PASS until its actual output is captured.
Real workspace install: UNKNOWN
Real CI run: UNKNOWN
Package publish readiness: UNKNOWN
```
</div>

### 12.4 完整核心代码

以下是核心代码窗口的 curated excerpts；完整文件位于标题栏路径。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/MonorepoReleaseChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import "./monorepo-release.css";
import BuildOrderPanel from "./components/BuildOrderPanel.vue";
import CiPipelineEvidencePanel from "./components/CiPipelineEvidencePanel.vue";
import ConsumerSmokeTestPanel from "./components/ConsumerSmokeTestPanel.vue";
import CssExportContractPanel from "./components/CssExportContractPanel.vue";
import DependencyPolicyPanel from "./components/DependencyPolicyPanel.vue";
import ImportGatePanel from "./components/ImportGatePanel.vue";
import MonorepoReleaseDashboard from "./components/MonorepoReleaseDashboard.vue";
import OwnershipReviewPanel from "./components/OwnershipReviewPanel.vue";
import PackageBoundaryPanel from "./components/PackageBoundaryPanel.vue";
import PackageExportSurfacePanel from "./components/PackageExportSurfacePanel.vue";
import PeerDependencyPanel from "./components/PeerDependencyPanel.vue";
import PublishBoundaryPanel from "./components/PublishBoundaryPanel.vue";
import ReleaseCandidatePanel from "./components/ReleaseCandidatePanel.vue";
import RollbackHotfixPanel from "./components/RollbackHotfixPanel.vue";
import TestBuildMatrixPanel from "./components/TestBuildMatrixPanel.vue";
import TypeScriptProjectBoundaryPanel from "./components/TypeScriptProjectBoundaryPanel.vue";
import VersionMigrationPanel from "./components/VersionMigrationPanel.vue";
import WorkspaceGraphPanel from "./components/WorkspaceGraphPanel.vue";
import WorkspaceLinkingPanel from "./components/WorkspaceLinkingPanel.vue";
import WorkspaceScriptsPanel from "./components/WorkspaceScriptsPanel.vue";
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/WorkspaceGraphPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useWorkspaceGraph } from "../composables/useWorkspaceGraph";

const { appCount, libraryCount, graphRows } = useWorkspaceGraph();
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace graph overview</h3>
    <p>Apps: {{ appCount }} | Libraries: {{ libraryCount }}</p>
    <ul class="monorepo-list">
      <li v-for="row in graphRows" :key="row.packageName">
        <span>{{ row.packageName }}</span>
        <span>{{ row.owner }}</span>
        <span>{{ row.dependencies }}</span>
      </li>
    </ul>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/PackageBoundaryPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { isLibraryPackageBoundary, packageBoundaries } from "../models/packageBoundaryModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Package boundary panel</h3>
    <ul class="monorepo-list">
      <li v-for="boundary in packageBoundaries" :key="boundary.packageName">
        <span>{{ boundary.packageName }}</span>
        <span>{{ boundary.buildGoal }}</span>
        <span>Library: {{ isLibraryPackageBoundary(boundary) }}</span>
      </li>
    </ul>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/WorkspaceLinkingPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  getWorkspaceLinkProofScope,
  requiresInstallEvidenceReview,
  workspaceLinks,
} from "../models/workspaceLinkingModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace linking model</h3>
    <ul class="monorepo-list">
      <li v-for="link in workspaceLinks" :key="`${link.sourcePackage}-${link.targetPackage}`">
        <span>{{ link.sourcePackage }} -> {{ link.targetPackage }}</span>
        <span>{{ getWorkspaceLinkProofScope(link) }}</span>
        <span>Review: {{ requiresInstallEvidenceReview(link) }}</span>
      </li>
    </ul>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/ImportGatePanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  designSystemImportPolicy,
  isImportPathAllowed,
  listBlockedImportSignals,
} from "../models/importGateModel";

const checkedPaths = [".", "./css", "./internal/token-resolver"];
const blockedPaths = listBlockedImportSignals(designSystemImportPolicy, checkedPaths);
</script>

<template>
  <section class="monorepo-card">
    <h3>Internal package import gate</h3>
    <p>Blocked paths: {{ blockedPaths.join(", ") }}</p>
    <ul class="monorepo-list">
      <li v-for="pathValue in checkedPaths" :key="pathValue">
        <span>{{ pathValue }}</span>
        <span>Allowed: {{ isImportPathAllowed(designSystemImportPolicy, pathValue) }}</span>
      </li>
    </ul>
  </section>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/PackageExportSurfacePanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  canConsumerImportPath,
  hasPublicCssExport,
  hasTypeDeclarationEntry,
  packageExportSurface,
} from "../models/packageExportSurfaceModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Package export surface model</h3>
    <p>CSS export: {{ hasPublicCssExport(packageExportSurface) }}</p>
    <p>Type declarations: {{ hasTypeDeclarationEntry(packageExportSurface) }}</p>
    <p>
      Internal import allowed:
      {{ canConsumerImportPath(packageExportSurface, "./internal/token-resolver") }}
    </p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/CssExportContractPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  cssExportContract,
  isCssExportReady,
  listCssContractFailures,
} from "../models/cssExportContractModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>CSS export and style contract panel</h3>
    <p>CSS entry: {{ cssExportContract.cssEntry }}</p>
    <p>Ready: {{ isCssExportReady(cssExportContract) }}</p>
    <p>Failures: {{ listCssContractFailures(cssExportContract).join(", ") || "none" }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/PeerDependencyPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  explainDuplicateVueRisk,
  isReusableVueLibraryDependencySafe,
  vuePeerDependencyDecision,
} from "../models/peerDependencyModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Peer dependency and external Vue model</h3>
    <p>Dependency: {{ vuePeerDependencyDecision.dependencyName }}</p>
    <p>Safe for reuse: {{ isReusableVueLibraryDependencySafe(vuePeerDependencyDecision) }}</p>
    <p>{{ explainDuplicateVueRisk(vuePeerDependencyDecision) }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/BuildOrderPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useAffectedPackageSet } from "../composables/useAffectedPackageSet";
import { buildGraphEdges, buildPackages, createBuildOrder } from "../models/buildOrderModel";

const buildOrder = createBuildOrder(buildPackages, buildGraphEdges);
const { affectedPackageNames, changedPackageName, setChangedPackage } = useAffectedPackageSet();
</script>

<template>
  <section class="monorepo-card">
    <h3>Build order and affected package model</h3>
    <p>Build order: {{ buildOrder.join(" -> ") }}</p>
    <p>Changed: {{ changedPackageName }}</p>
    <p>Affected: {{ affectedPackageNames.join(", ") }}</p>
    <button type="button" class="monorepo-button" @click="setChangedPackage('@vue-lab/admin-app')">
      Select app change
    </button>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/TypeScriptProjectBoundaryPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  canTypeScriptProveRuntimeRender,
  isDeclarationBoundaryReady,
  typeScriptProjectBoundaries,
} from "../models/typescriptProjectBoundaryModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>TypeScript project boundary panel</h3>
    <ul class="monorepo-list">
      <li v-for="boundary in typeScriptProjectBoundaries" :key="boundary.packageName">
        <span>{{ boundary.packageName }}</span>
        <span>Declarations: {{ isDeclarationBoundaryReady(boundary) }}</span>
        <span>Runtime proof: {{ canTypeScriptProveRuntimeRender(boundary) }}</span>
      </li>
    </ul>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/ConsumerSmokeTestPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  consumerSmokeResult,
  isConsumerSmokeReady,
  listMissingConsumerSmokeEvidence,
} from "../models/consumerSmokeTestModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Consumer app smoke-test model</h3>
    <p>{{ consumerSmokeResult.consumerPackage }} consumes {{ consumerSmokeResult.libraryPackage }}</p>
    <p>Ready: {{ isConsumerSmokeReady(consumerSmokeResult) }}</p>
    <p>Missing: {{ listMissingConsumerSmokeEvidence(consumerSmokeResult).join(", ") }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/WorkspaceScriptsPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  findMissingRequiredScripts,
  shouldRunSequentially,
  workspaceScripts,
} from "../models/workspaceScriptModel";

const packageNames = ["@vue-lab/design-system", "@vue-lab/admin-app"];
const missingTestScripts = findMissingRequiredScripts(workspaceScripts, packageNames, "test");
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace script orchestration panel</h3>
    <p>Missing required test scripts: {{ missingTestScripts.join(", ") || "none" }}</p>
    <p>Build should be sequential: {{ shouldRunSequentially("build") }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/DependencyPolicyPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useDependencyPolicy } from "../composables/useDependencyPolicy";
import { dependencyPolicies } from "../models/dependencyPolicyModel";

const { lockfileReviewRequired, reviewRequired, workspaceProtocolRows } = useDependencyPolicy();
</script>

<template>
  <section class="monorepo-card">
    <h3>Dependency and lockfile policy panel</h3>
    <p>Policies: {{ dependencyPolicies.length }}</p>
    <p>Review required: {{ reviewRequired.length }}</p>
    <p>Workspace protocol rows: {{ workspaceProtocolRows.length }}</p>
    <p>Lockfile review: {{ lockfileReviewRequired }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/CiPipelineEvidencePanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { ciPipelineChecks, listBlockingCiChecks } from "../models/ciPipelineEvidenceModel";

const blockingChecks = listBlockingCiChecks(ciPipelineChecks);
</script>

<template>
  <section class="monorepo-card">
    <h3>CI pipeline evidence panel</h3>
    <p>Blocking CI checks: {{ blockingChecks.length }}</p>
    <ul class="monorepo-list">
      <li v-for="check in ciPipelineChecks" :key="`${check.packageName}-${check.stage}`">
        <span>{{ check.packageName }}</span>
        <span>{{ check.stage }}</span>
        <span>{{ check.status }}</span>
      </li>
    </ul>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/TestBuildMatrixPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useCiEvidenceMatrix } from "../composables/useCiEvidenceMatrix";

const { blocked, passCount, rows, unknownCount } = useCiEvidenceMatrix();
</script>

<template>
  <section class="monorepo-card">
    <h3>Test and build matrix dashboard</h3>
    <p>Release blocked: {{ blocked }}</p>
    <p>Pass: {{ passCount }} | Unknown: {{ unknownCount }}</p>
    <ul class="monorepo-list">
      <li v-for="row in rows" :key="`${row.packageName}-${row.checkName}`">
        <span>{{ row.packageName }}</span>
        <span>{{ row.checkName }}</span>
        <span>{{ row.status }}</span>
      </li>
    </ul>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/ReleaseCandidatePanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { changelogEntry, isChangelogEntryComplete } from "../models/changelogModel";
import { isReleaseCandidateBlocked, releaseCandidate } from "../models/releaseCandidateModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Release candidate and changelog model</h3>
    <p>Candidate: {{ releaseCandidate.id }}</p>
    <p>Blocked: {{ isReleaseCandidateBlocked(releaseCandidate) }}</p>
    <p>Changelog ready: {{ isChangelogEntryComplete(changelogEntry) }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/VersionMigrationPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { isMigrationNoteComplete, migrationNote } from "../models/migrationNoteModel";
import {
  doesVersionPlanMatchImpact,
  inferSemverImpact,
  versionPlan,
} from "../models/versionPlanModel";

const inferredImpact = inferSemverImpact({
  removedExport: true,
  addedExport: false,
  behaviorChanged: false,
});
</script>

<template>
  <section class="monorepo-card">
    <h3>Version plan and migration-note panel</h3>
    <p>Version plan: {{ versionPlan.currentVersion }} -> {{ versionPlan.nextVersion }}</p>
    <p>Impact match: {{ doesVersionPlanMatchImpact(versionPlan, inferredImpact) }}</p>
    <p>Migration note ready: {{ isMigrationNoteComplete(migrationNote) }}</p>
  </section>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/PublishBoundaryPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { isProvenanceVerified, provenanceBoundary } from "../models/provenanceBoundaryModel";
import {
  isPublishBoundaryReady,
  listPublishBoundaryGaps,
  publishReadiness,
} from "../models/publishBoundaryModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Publish boundary and provenance panel</h3>
    <p>Publish ready: {{ isPublishBoundaryReady(publishReadiness) }}</p>
    <p>Gaps: {{ listPublishBoundaryGaps(publishReadiness).join(", ") }}</p>
    <p>Provenance verified: {{ isProvenanceVerified(provenanceBoundary) }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/RollbackHotfixPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  getRollbackBlockingReason,
  isRollbackPathReady,
  rollbackHotfixDecision,
} from "../models/rollbackHotfixModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Rollback and hotfix decision panel</h3>
    <p>Affected package: {{ rollbackHotfixDecision.affectedPackage }}</p>
    <p>Affected consumer: {{ rollbackHotfixDecision.affectedConsumer }}</p>
    <p>Ready: {{ isRollbackPathReady(rollbackHotfixDecision) }}</p>
    <p>{{ getRollbackBlockingReason(rollbackHotfixDecision) }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/OwnershipReviewPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  isOwnershipApproved,
  listMissingOwnerApprovals,
  ownershipReviewRules,
} from "../models/ownershipReviewModel";
</script>

<template>
  <section class="monorepo-card">
    <h3>Workspace ownership and review panel</h3>
    <p>Ownership approved: {{ isOwnershipApproved(ownershipReviewRules) }}</p>
    <p>Missing approvals: {{ listMissingOwnerApprovals(ownershipReviewRules).length }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/components/MonorepoReleaseDashboard.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useReleaseCandidateGate } from "../composables/useReleaseCandidateGate";

const { approveReviewerGate, gateResult, reviewerOverride } = useReleaseCandidateGate();
</script>

<template>
  <section class="monorepo-card monorepo-dashboard">
    <h3>Monorepo release dashboard</h3>
    <p>Release blocked: {{ gateResult.blocked }}</p>
    <p>Failure signals: {{ gateResult.failureSignals.join(", ") }}</p>
    <p>Reviewer override: {{ reviewerOverride }}</p>
    <button type="button" class="monorepo-button" @click="approveReviewerGate">
      Mark reviewer evidence
    </button>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/composables/useWorkspaceGraph.ts</span>
  </div>

```ts
import { computed } from "vue";
import {
  countPackagesByKind,
  listPackageDependencies,
  workspaceDependencyEdges,
  workspacePackages,
} from "../models/workspacePackageModel";

export function useWorkspaceGraph() {
  const appCount = computed(() => countPackagesByKind(workspacePackages, "app"));
  const libraryCount = computed(() => countPackagesByKind(workspacePackages, "library"));
  const graphRows = computed(() =>
    workspacePackages.map((workspacePackage) => ({
      packageName: workspacePackage.name,
      owner: workspacePackage.owner,
      dependencies:
        listPackageDependencies(workspaceDependencyEdges, workspacePackage.name).join(", ") ||
        "none",
    })),
  );

  return {
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/composables/useAffectedPackageSet.ts</span>
  </div>

```ts
import { computed, ref } from "vue";
import { findAffectedPackages } from "../models/affectedPackageModel";
import { buildGraphEdges } from "../models/buildOrderModel";

export function useAffectedPackageSet() {
  const changedPackageName = ref("@vue-lab/design-system");
  const affectedPackageNames = computed(() =>
    findAffectedPackages([changedPackageName.value], buildGraphEdges),
  );

  function setChangedPackage(packageName: string): void {
    changedPackageName.value = packageName;
  }

  return {
    changedPackageName,
    affectedPackageNames,
    setChangedPackage,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/composables/useReleaseCandidateGate.ts</span>
  </div>

```ts
import { computed, ref } from "vue";
import { ciPipelineChecks } from "../models/ciPipelineEvidenceModel";
import { consumerSmokeResult } from "../models/consumerSmokeTestModel";
import { monorepoIssues } from "../models/monorepoIssueModel";
import { evaluateMonorepoReleaseGate } from "../models/monorepoReleaseGateModel";
import { ownershipReviewRules } from "../models/ownershipReviewModel";
import { releaseCandidate } from "../models/releaseCandidateModel";

export function useReleaseCandidateGate() {
  const reviewerOverride = ref(false);
  const gateInput = computed(() => ({
    ciChecks: ciPipelineChecks,
    consumerSmoke: consumerSmokeResult,
    releaseCandidate,
    ownershipRules: ownershipReviewRules.map((rule) => ({
      ...rule,
      approved: rule.approved || reviewerOverride.value,
    })),
    issues: monorepoIssues,
  }));
  const gateResult = computed(() => evaluateMonorepoReleaseGate(gateInput.value));

```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/workspacePackageModel.ts</span>
  </div>

```ts
export type WorkspacePackageKind = "app" | "library" | "tooling";

export type WorkspaceRiskArea =
  | "runtime"
  | "ui-contract"
  | "build-system"
  | "release";

export interface WorkspacePackage {
  readonly name: string;
  readonly kind: WorkspacePackageKind;
  readonly owner: string;
  readonly riskArea: WorkspaceRiskArea;
  readonly publicEntry: string;
}

export interface WorkspaceDependencyEdge {
  readonly sourcePackage: string;
  readonly targetPackage: string;
  readonly reason: string;
}

```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/workspaceLinkingModel.ts</span>
  </div>

```ts
export type WorkspaceLinkKind = "npm-workspace" | "pnpm-workspace" | "manual-link";

export type InstallEvidenceStatus = "present" | "missing" | "unknown";

export type LinkProofScope = "local-consumption" | "published-consumption" | "unknown";

export interface WorkspaceLink {
  readonly sourcePackage: string;
  readonly targetPackage: string;
  readonly linkKind: WorkspaceLinkKind;
  readonly installEvidenceStatus: InstallEvidenceStatus;
  readonly lockfileChanged: boolean;
}

export const workspaceLinks: readonly WorkspaceLink[] = [
  {
    sourcePackage: "@vue-lab/admin-app",
    targetPackage: "@vue-lab/design-system",
    linkKind: "npm-workspace",
    installEvidenceStatus: "present",
    lockfileChanged: true,
  },
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/importGateModel.ts</span>
  </div>

```ts
export interface ImportPathPolicy {
  readonly packageName: string;
  readonly allowedPaths: readonly string[];
  readonly blockedPatterns: readonly string[];
}

export const designSystemImportPolicy: ImportPathPolicy = {
  packageName: "@vue-lab/design-system",
  allowedPaths: [".", "./css", "./button", "./use-theme"],
  blockedPatterns: ["./internal/*", "./src/*"],
};

export function isInternalImportPath(importPath: string): boolean {
  return importPath.startsWith("./internal/") || importPath.startsWith("./src/");
}

export function isImportPathAllowed(policy: ImportPathPolicy, importPath: string): boolean {
  if (isInternalImportPath(importPath)) {
    return false;
  }

  return policy.allowedPaths.includes(importPath);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/packageExportSurfaceModel.ts</span>
  </div>

```ts
export type PackageExportKind = "component" | "composable" | "style" | "type" | "internal";

export interface PackageExportSurfaceEntry {
  readonly path: string;
  readonly kind: PackageExportKind;
  readonly public: boolean;
  readonly declarationPath?: string;
}

export const packageExportSurface: readonly PackageExportSurfaceEntry[] = [
  { path: ".", kind: "component", public: true, declarationPath: "dist/index.d.ts" },
  {
    path: "./button",
    kind: "component",
    public: true,
    declarationPath: "dist/button.d.ts",
  },
  { path: "./css", kind: "style", public: true },
  { path: "./types", kind: "type", public: true, declarationPath: "dist/types.d.ts" },
  { path: "./internal/token-resolver", kind: "internal", public: false },
];

```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/peerDependencyModel.ts</span>
  </div>

```ts
export type DependencyPlacement = "dependency" | "peer" | "external";

export interface PeerDependencyDecision {
  readonly packageName: string;
  readonly dependencyName: string;
  readonly placement: DependencyPlacement;
  readonly externalizedInLibraryBuild: boolean;
  readonly duplicateRuntimeRisk: boolean;
}

export const vuePeerDependencyDecision: PeerDependencyDecision = {
  packageName: "@vue-lab/design-system",
  dependencyName: "vue",
  placement: "peer",
  externalizedInLibraryBuild: true,
  duplicateRuntimeRisk: false,
};

export function isReusableVueLibraryDependencySafe(
  decision: PeerDependencyDecision,
): boolean {
  return (
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/buildOrderModel.ts</span>
  </div>

```ts
export interface BuildGraphEdge {
  readonly packageName: string;
  readonly dependsOn: string;
}

export const buildPackages: readonly string[] = [
  "@vue-lab/design-system",
  "@vue-lab/admin-app",
  "@vue-lab/release-tools",
];

export const buildGraphEdges: readonly BuildGraphEdge[] = [
  { packageName: "@vue-lab/admin-app", dependsOn: "@vue-lab/design-system" },
  { packageName: "@vue-lab/release-tools", dependsOn: "@vue-lab/design-system" },
];

export function createBuildOrder(
  packageNames: readonly string[],
  edges: readonly BuildGraphEdge[],
): readonly string[] {
  const pending = new Set(packageNames);
  const order: string[] = [];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/consumerSmokeTestModel.ts</span>
  </div>

```ts
export type ConsumerSmokeStatus = "pass" | "fail" | "unknown";

export interface ConsumerSmokeResult {
  readonly consumerPackage: string;
  readonly libraryPackage: string;
  readonly importResult: ConsumerSmokeStatus;
  readonly renderResult: ConsumerSmokeStatus;
  readonly cssResult: ConsumerSmokeStatus;
}

export const consumerSmokeResult: ConsumerSmokeResult = {
  consumerPackage: "@vue-lab/admin-app",
  libraryPackage: "@vue-lab/design-system",
  importResult: "pass",
  renderResult: "pass",
  cssResult: "unknown",
};

export function isConsumerSmokeReady(result: ConsumerSmokeResult): boolean {
  return (
    result.importResult === "pass" &&
    result.renderResult === "pass" &&
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/ciPipelineEvidenceModel.ts</span>
  </div>

```ts
export type CiCheckStatus = "pass" | "fail" | "skipped" | "unknown";

export type CiStage = "checkout" | "install" | "typecheck" | "test" | "build" | "artifact";

export interface CiPipelineCheck {
  readonly packageName: string;
  readonly stage: CiStage;
  readonly status: CiCheckStatus;
  readonly required: boolean;
  readonly evidenceId: string;
}

export const ciPipelineChecks: readonly CiPipelineCheck[] = [
  {
    packageName: "@vue-lab/design-system",
    stage: "typecheck",
    status: "pass",
    required: true,
    evidenceId: "local-typecheck-model",
  },
  {
    packageName: "@vue-lab/design-system",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/testBuildMatrixModel.ts</span>
  </div>

```ts
import type { CiCheckStatus } from "./ciPipelineEvidenceModel";

export interface TestBuildMatrixRow {
  readonly packageName: string;
  readonly checkName: string;
  readonly status: CiCheckStatus;
  readonly required: boolean;
}

export const testBuildMatrixRows: readonly TestBuildMatrixRow[] = [
  {
    packageName: "@vue-lab/design-system",
    checkName: "typecheck",
    status: "pass",
    required: true,
  },
  {
    packageName: "@vue-lab/design-system",
    checkName: "unit",
    status: "pass",
    required: true,
  },
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/releaseCandidateModel.ts</span>
  </div>

```ts
export interface ReleaseCandidateApproval {
  readonly owner: string;
  readonly approved: boolean;
}

export interface ReleaseCandidate {
  readonly id: string;
  readonly changedPackages: readonly string[];
  readonly versionPlanComplete: boolean;
  readonly changelogComplete: boolean;
  readonly migrationNoteComplete: boolean;
  readonly approvals: readonly ReleaseCandidateApproval[];
}

export const releaseCandidate: ReleaseCandidate = {
  id: "rc-19-local",
  changedPackages: ["@vue-lab/design-system", "@vue-lab/admin-app"],
  versionPlanComplete: true,
  changelogComplete: true,
  migrationNoteComplete: false,
  approvals: [
    { owner: "Design Systems", approved: true },
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/publishBoundaryModel.ts</span>
  </div>

```ts
import type { CiCheckStatus } from "./ciPipelineEvidenceModel";

export interface PublishReadiness {
  readonly packageName: string;
  readonly packageMetadataReady: boolean;
  readonly remoteAccessKnown: boolean;
  readonly secretState: "missing" | "unknown" | "verified";
  readonly ciEvidenceStatus: CiCheckStatus;
}

export const publishReadiness: PublishReadiness = {
  packageName: "@vue-lab/design-system",
  packageMetadataReady: true,
  remoteAccessKnown: false,
  secretState: "unknown",
  ciEvidenceStatus: "unknown",
};

export function isPublishBoundaryReady(readiness: PublishReadiness): boolean {
  return (
    readiness.packageMetadataReady &&
    readiness.remoteAccessKnown &&
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/models/rollbackHotfixModel.ts</span>
  </div>

```ts
export type ReleaseFailureKind = "consumer-break" | "ci-failure" | "style-break";

export interface RollbackHotfixDecision {
  readonly failureKind: ReleaseFailureKind;
  readonly affectedPackage: string;
  readonly affectedConsumer: string;
  readonly rollbackOwner: string;
  readonly patchBranchNeeded: boolean;
  readonly communicationReady: boolean;
}

export const rollbackHotfixDecision: RollbackHotfixDecision = {
  failureKind: "consumer-break",
  affectedPackage: "@vue-lab/design-system",
  affectedConsumer: "@vue-lab/admin-app",
  rollbackOwner: "Release Engineering",
  patchBranchNeeded: true,
  communicationReady: false,
};

export function isRollbackPathReady(decision: RollbackHotfixDecision): boolean {
  return decision.patchBranchNeeded && decision.communicationReady;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/workspacePackageModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  findPackageOwner,
  listPackageDependencies,
  workspaceDependencyEdges,
  workspacePackages,
} from "../models/workspacePackageModel";

describe("workspacePackageModel", () => {
  it("looks up dependencies in the workspace graph", () => {
    expect(
      listPackageDependencies(workspaceDependencyEdges, "@vue-lab/admin-app"),
    ).toContain("@vue-lab/design-system");
  });

  it("looks up the package owner", () => {
    expect(findPackageOwner(workspacePackages, "@vue-lab/design-system")).toBe(
      "Design Systems",
    );
  });
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-19-monorepo-release/tests/monorepoReleaseGateModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { evaluateMonorepoReleaseGate } from "../models/monorepoReleaseGateModel";

describe("monorepoReleaseGateModel", () => {
  it("aggregates CI, consumer, candidate, owner, and issue blockers", () => {
    const result = evaluateMonorepoReleaseGate({
      ciChecks: [
        {
          packageName: "@vue-lab/admin-app",
          stage: "build",
          status: "unknown",
          required: true,
          evidenceId: "missing-build-output",
        },
      ],
      consumerSmoke: {
        consumerPackage: "@vue-lab/admin-app",
        libraryPackage: "@vue-lab/design-system",
        importResult: "pass",
        renderResult: "pass",
        cssResult: "unknown",
      },
```
</div>

### 12.5 代码执行链路

1. `App.vue` import `MonorepoReleaseChapterApp.vue`，并在 Chapter 18 后追加渲染。
2. `MonorepoReleaseChapterApp.vue` import 20 个 panel 和 `monorepo-release.css`。
3. 每个 panel 读取 model 或 composable；Vue render effect 跟踪 computed/ref。
4. model tests 用 pure functions 断言 blocked/ready/UNKNOWN 规则。
5. release dashboard 通过 `evaluateMonorepoReleaseGate()` 聚合 CI、consumer smoke、candidate、ownership 和 issue signals。

### 12.6 验证命令与失败定位

| 命令 | 证明内容 | 不能证明 |
| --- | --- | --- |
| `npm run typecheck` | 当前 Vue/TS/SFC 类型连通 | real workspace declaration output |
| `npm run test:unit` | model rules and release blockers | real CI run |
| `npm run build` | current app production bundle | library mode package build |

如果 `consumer-css`、CI artifact、publish access 或 provenance status 是 UNKNOWN，release dashboard 必须保持 blocked。

### 12.7 Monorepo release review checklist

- Workspace graph 是否列出 package kind、owner、risk area 和 dependency edge？
- Consumer app 是否只 import public entry？
- CSS export 是否有 consumer style evidence？
- Vue 是否保持 peer/external decision？
- Changed package 是否触发 dependent package rebuild/test？
- Required matrix row 是否存在 UNKNOWN 或 FAIL？
- Breaking change 是否有 migration note？
- Owner approval 是否完整？
- Publish/provenance 是否有真实外部输出？
- Rollback/hotfix 是否有 affected consumer 和 communication path？

## 13. 额外速查表

| 复习点 | 一句话 |
| --- | --- |
| Monorepo | package graph + owner + release evidence，不是文件夹数量 |
| Workspace linking | local-consumption proof，不是 published package proof |
| Public import gate | consumer 只能依赖 exports surface |
| CSS export | style contract 需要独立 evidence |
| Peer Vue | reusable Vue library 通常让 consumer 拥有 Vue runtime |
| Build order | dependency 先于 consumer |
| Affected package | changed node 会扩散到 dependent node |
| CI evidence | required UNKNOWN 必须 block |
| Release candidate | version、changelog、migration、approval 一起评审 |
| Publish boundary | access、secret、provenance、CI output 没验证就 UNKNOWN |

可安全复制的最小模板：

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Snippet: release gate status model</span>
  </div>

```ts
type GateStatus = "pass" | "fail" | "unknown";

interface RequiredGate {
  readonly name: string;
  readonly status: GateStatus;
  readonly required: boolean;
}

function isGateBlocked(gates: readonly RequiredGate[]): boolean {
  return gates.some((gate) => gate.required && gate.status !== "pass");
}
```
</div>

## 14. 真实项目判断模型

| Decision | When to use | When not to use | Evidence that proves it works | Excluded concern owner |
| --- | --- | --- | --- | --- |
| Local model first | 团队还没确认 package graph、owner、exports 和 release gate | 已经有成熟 workspace 和 CI output | model tests + reviewer agreement | external CI platform |
| Real workspace config | package boundaries 已清楚，需要真实 install/link | 只是为了学习概念 | package files, lockfile diff, fresh install | package manager docs |
| Library build | package 要被 consumer import | 只是 SPA 页面 | Vite library output, exports, declarations | Vite/Rollup config |
| Consumer smoke | 需要证明 app 消费 library | 只有 pure model 函数 | import/render/CSS result | browser test harness |
| CI matrix | release 要求外部 runner evidence | 只有本地练习 | CI log and artifact id | GitHub Actions or chosen CI |
| Publish readiness | package 已经具备 build/export/type/consumer/CI evidence | access、secret、provenance 未验证 | pack output, publish workflow, provenance output | npm and CI provider |
| Rollback plan | release 影响多个 consumer | 纯本地 demo | affected consumer, owner, patch path, communication | incident process owner |

## 15. 如何转换成个人笔记

保留三类内容：package graph 如何定义 owner 和 dependency edge；release gate 如何把 UNKNOWN 转成 blocker；外部边界为什么不能靠 local model 声称 PASS。可以删减大段代码窗口，只保留 `evaluateMonorepoReleaseGate()`、`isConsumerSmokeReady()`、`createBuildOrder()` 和 `isPublishBoundaryReady()` 四条核心链路。

## 16. 必须能回答的问题

1. 为什么 monorepo 不是许多文件夹，而是 package graph、owner 和 release evidence？
2. 为什么 workspace linking 不能证明 published package compatibility？
3. 为什么 app build、library build、consumer smoke、CI run 和 publish output 是不同证据？
4. 为什么 internal import、missing CSS export、bundled Vue、UNKNOWN CI check、missing migration note 和 missing owner approval 都能阻塞 release？
5. TypeScript project references 能帮助什么，又不能证明哪些 runtime/package/CI 行为？
6. 为什么 publish、provenance、registry access、npm token 和 rollback drill 必须保持外部 evidence boundary？

## 17. 最终记忆模型

Chapter 19 的最终链路是：

workspace package -> dependency edge -> public export/import gate -> CSS/peer/build/type/smoke evidence -> CI matrix -> release candidate -> owner approval -> publish/provenance UNKNOWN -> rollback path -> dashboard decision。

只要某一段没有真实证据，就不能把它写成 PASS；本章的 local lab 训练的是如何诚实记录边界。

## 18. 官方文档阅读清单

- [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces/)
- [npm package.json exports](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#exports)
- [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
- [Vite build guide and library mode](https://vite.dev/guide/build.html)
- [Vue TypeScript with Composition API](https://vuejs.org/guide/typescript/composition-api.html)
- [Vue and Web Components](https://vuejs.org/guide/extras/web-components.html)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Vitest Test Projects](https://vitest.dev/guide/projects)
- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)

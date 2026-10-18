# Vue 第 14 章：Migration、Modernization、Legacy Refactoring 与 Architecture Evolution

<style>
.macos-code-window {
  margin: 1.25rem 0;
  overflow: hidden;
  border: 1px solid #30363d;
  border-radius: 10px;
  background: #0d1117;
}

.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  background: #21262d;
}

.macos-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.macos-code-dot-red {
  background: #ff5f57;
}

.macos-code-dot-yellow {
  background: #febc2e;
}

.macos-code-dot-green {
  background: #28c840;
}

.macos-code-title {
  margin-left: 6px;
  color: #c9d1d9;
  font: 600 0.82rem/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.macos-code-titlebar + pre {
  margin: 0;
  border: 0;
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
  - [9.1 Migration mental model：inventory、risk、compatibility、tests、incremental refactor 与 rollback](#section-9-1)
  - [9.2 Migration inventory：legacy APIs、runtime behavior、build tooling、state、router、tests 与 ownership map](#section-9-2)
  - [9.3 Vue 2 to Vue 3 boundary：createApp、global API、mount、emits、attrs、removed APIs 与 migration build](#section-9-3)
  - [9.4 Options API to Composition API：same runtime component、different organization boundary](#section-9-4)
  - [9.5 script setup modernization：compiler macro、top-level binding、props/emits/model/expose 与 migration risk](#section-9-5)
  - [9.6 Mixins to composables：hidden merge behavior、source ownership、cleanup 与 explicit return contract](#section-9-6)
  - [9.7 Filters and event bus removal：pure formatting functions、computed values、props/emits/provide-inject alternatives](#section-9-7)
  - [9.8 Component communication migration：v-model、emits option、fallthrough attrs、.native removal 与 public contract](#section-9-8)
  - [9.9 Vue Router migration：new Router -> createRouter、mode -> history、guards、meta、typed route opportunity](#section-9-9)
  - [9.10 Vuex to Pinia migration：modules to stores、mutations to actions/direct assignment、namespace to store id](#section-9-10)
  - [9.11 Build tooling migration：Vue CLI / webpack assumptions to Vite ESM、env、assets、HMR、build output](#section-9-11)
  - [9.12 TypeScript adoption during migration：allowJs boundary、strictness ramp、vue-tsc、unknown runtime data](#section-9-12)
  - [9.13 Test safety net before refactor：characterization tests、component smoke、store tests、router tests、build checks](#section-9-13)
  - [9.14 Incremental migration strategy：strangler pattern、parallel components、adapter layer、feature flags 与 rollback](#section-9-14)
  - [9.15 Migration risk dashboard：risk scoring、owner、impact、evidence、blocked state 与 acceptance gate](#section-9-15)
  - [9.16 Legacy-modern diff reading：how to review PRs without rubber-stamping mechanical rewrites](#section-9-16)
  - [9.17 Production migration readiness：build/preview/regression/performance/error monitoring boundary](#section-9-17)
  - [9.18 Chapter integration：how migration connects Chapters 01-13](#section-9-18)
  - [9.19 Final integration：vue-migration-modernization-lab 如何形成真实迁移方法论](#section-9-19)
  - [9.20 Template directive migration：v-model、key、v-if / v-for、v-bind、keyCode 与 DOM identity](#section-9-20)
  - [9.21 Removed instance APIs：events API、$children、propsData、$destroy、$set / $delete 与 owner replacement](#section-9-21)
  - [9.22 Functional components and async components：functional shape、defineAsyncComponent 与 route lazy loading boundary](#section-9-22)
  - [9.23 Render function, slots unification and VNode lifecycle：h、slot functions、onVnode hooks 与 review risk](#section-9-23)
  - [9.24 Custom directives, custom elements and attribute coercion：hook rename、compiler boundary 与 DOM contract](#section-9-24)
  - [9.25 Transition and TransitionGroup migration：class phase rename、stable keys 与 visual smoke evidence](#section-9-25)
  - [9.26 Watch array behavior and deep option migration：replacement trigger、mutation trigger 与 rollback adapter](#section-9-26)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 文件职责](#122-文件职责)
  - [12.3 运行与验证](#123-运行与验证)
  - [12.4 完整核心代码](#124-完整核心代码)
  - [12.5 代码执行链路](#125-代码执行链路)
  - [12.6 验证命令与失败定位](#126-验证命令与失败定位)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 机制 | 路径 | 证据 |
| --- | --- | --- |
| Chapter 14 root panel | `src/learning/vue/chapter-14-migration-modernization/MigrationModernizationChapterApp.vue` | 在 Vite learning shell 中展示迁移 dashboard、diff、router、store、build、test、rollback |
| Root shell integration | `src/learning/vue/chapter-01-application-boundary/App.vue` | 只新增 Chapter 14 panel，不删除旧章节 |
| Migration inventory | `src/learning/vue/chapter-14-migration-modernization/models/migrationInventoryModel.ts` | risk score、blocked state、rollback path |
| Compatibility risks | `src/learning/vue/chapter-14-migration-modernization/models/compatibilityRiskModel.ts` | migration build、filters、event bus、router mode 风险 |
| Options to Composition | `src/learning/vue/chapter-14-migration-modernization/legacy-shaped/LegacyOptionsProfile.vue` 和 `modernized/ModernProfileComposition.vue` | 行为保持，组织方式变化 |
| Mixin to composable | `legacy-shaped/LegacyMixinUsage.vue` 和 `modernized/useProfileForm.ts` | 隐式 merge 变成显式 return contract |
| Filter removal | `legacy-shaped/legacyFormattingFilter.ts` 和 `modernized/formatProfileValue.ts` | template filter 迁移为可测试 pure function |
| Event bus removal | `legacy-shaped/legacyEventBus.ts` 和 `modernized/ProfileEventContract.vue` | hidden listener 迁移为 props/emits/provide owner |
| Router migration | `legacy-shaped/legacyRouterConfig.ts` 和 `modernized/modernRouterConfig.ts` | `mode` / route record 迁移为 explicit history 与 typed record |
| Vuex to Pinia model | `legacy-shaped/legacyVuexModuleModel.ts` 和 `modernized/useProfileStore.ts` | namespace 映射 store id，mutation 映射 action/direct assignment |
| Vite migration | `legacy-shaped/legacyWebpackEnvModel.ts` 和 `modernized/viteEnvBoundary.ts` | `process.env` / asset assumption 迁移到 `import.meta.env` 与 ESM asset 思路 |
| Test safety net | `src/learning/vue/chapter-14-migration-modernization/tests/` | formatting、inventory、store、router 行为回归证据 |
| Vue breaking-change inventory | `models/vueBreakingChangeInventoryModel.ts` | global API、template directive、component contract、removed API、render、directive、transition、watch array 统一风险清单 |
| Template directive migration | `legacy-shaped/legacyTemplateDirectiveExamples.ts`、`modernized/templateDirectiveMigration.ts`、`tests/templateDirectiveMigration.test.ts` | `v-model`、`key`、`v-if` / `v-for`、`v-bind`、`keyCode` 的 legacy pattern、modern replacement 与测试证据 |
| Component contract migration | `models/componentContractMigrationModel.ts` 和 `modernized/componentContractMigration.ts` | `emits`、`.native`、`$listeners`、`$attrs`、class/style fallthrough owner |
| Removed instance API migration | `legacy-shaped/legacyRemovedApisModel.ts`、`models/removedApiMigrationModel.ts`、`modernized/removedApiReplacement.ts`、`tests/removedApiReplacement.test.ts` | `$children`、`$set`、`$delete`、`$destroy`、events API、`propsData` 替代模型 |
| Router advanced migration | `models/routerAdvancedMigrationModel.ts` | `createRouter`、history factory、catch-all、`router.isReady`、navigation failure |
| Pinia advanced migration | `models/piniaAdvancedMigrationModel.ts` | module to store id、state function、getter/action、mutation removal、coexistence |
| Vite env and asset migration | `models/viteAssetMigrationModel.ts`、`modernized/viteAssetBoundary.ts`、`tests/viteAssetBoundary.test.ts` | `VITE_`、mode、public directory、source import、`new URL`、worker query |
| Render/directive/transition/watch migration | `legacy-shaped/legacyRenderFunctionModel.ts`、`legacy-shaped/legacyDirectiveModel.ts`、`legacy-shaped/legacyTransitionClassModel.ts`、`modernized/renderFunctionMigration.ts`、`modernized/directiveMigration.ts`、`modernized/transitionMigration.ts`、`modernized/watchArrayMigration.ts`、`tests/watchArrayMigration.test.ts` | render function、slots、VNode lifecycle、custom directive hooks、TransitionGroup、watch array trigger 证据 |

## 0. 本章机制边界

本章不是“重写旧项目”的章节。迁移从 inventory 开始，先确认旧代码的行为、owner、风险和回滚路径，再决定哪些地方需要现代化。`LegacyOptionsProfile.vue`、`LegacyMixinUsage.vue`、`legacyRouterConfig.ts`、`legacyVuexModuleModel.ts` 和 `legacyWebpackEnvModel.ts` 是 legacy-shaped teaching examples，它们运行在当前 Vue 3 + Vite 项目中，不引入 Vue 2、Vuex、webpack 或 Vue CLI。

本章的 runtime owner 会跨越 Vue runtime、Router runtime、Pinia store ownership、Vite dev/build tooling、TypeScript diagnostics、Vitest safety net 和 rollback artifact。TypeScript 能定位 `defineEmits` payload、Pinia state、route record 和 env boundary 的静态漂移，但不能证明旧页面和新页面运行时行为等价；等价性需要 `tests/formatProfileValue.test.ts`、`tests/useProfileStore.test.ts`、`tests/routerMigrationModel.test.ts`、`npm run typecheck`、`npm run test:unit`、`npm run build` 与必要的 preview smoke。

本地 roadmap 的 Phase 13 是“迁移、维护与架构重构”，主题包含 Vue 2 to Vue 3、Options API to Composition API、Vuex to Pinia、webpack to Vite、JavaScript to TypeScript、legacy router guards 和 global mixins。本仓库已有 Chapter 12/13 用于 Nuxt，因此本任务按用户要求把该 roadmap migration scope 实作成 Chapter 14。

## 1. 本章解决的问题

旧 Vue 项目最危险的迁移方式是“看到旧语法就批量替换”。`MigrationRiskDashboard.vue` 展示的做法相反：先列出 legacy pattern、preserved behavior、modern owner、test evidence、risk score 和 rollback path。只有当旧行为被 characterization test 或 smoke evidence 捕获后，`ModernProfileComposition.vue`、`useProfileForm.ts`、`modernRouterConfig.ts`、`useProfileStore.ts` 和 `viteEnvBoundary.ts` 才有资格替换旧 owner。

## 2. 前置概念

你需要已理解：Chapter 01 的 `createApp` 与 root component；Chapter 04 的 composable ownership；Chapter 06 的 route record、history 与 guard；Chapter 07 的 Pinia state/getters/actions；Chapter 10 的 Vitest 与 Vue Test Utils safety net；Chapter 11 的 build/preview/deployment evidence；Chapter 12/13 的 Nuxt 边界帮助你识别 SSR 或 module 迁移不属于当前根 Vite app。

## 3. 学习目标

- 能解释 migration 不是 rewrite，而是 behavior preservation 加 ownership move。
- 能判断 compatibility build 是临时诊断工具，不是最终架构。
- 能区分 runtime change、compile-time macro change、build-tooling change 和 API-surface change。
- 能把 Options API、mixins、filters、event bus、Router 3、Vuex、Vue CLI/webpack 和 JavaScript codebase 分别映射到 Vue 3、Composition API、pure function、explicit component contract、Router 4、Pinia、Vite 和 TypeScript boundary。
- 能用 tests、typecheck、build、preview 和 rollback artifact 证明迁移风险被控制。

## 4. 核心机制证据链总览

| Migration chain | Legacy start | Modern owner | Evidence | Failure signal |
| --- | --- | --- | --- | --- |
| Legacy Options component -> behavior characterization -> Composition component | `LegacyOptionsProfile.vue` | `ModernProfileComposition.vue` + `useProfileForm.ts` | profile form behavior visible in app, future component test target | save payload changes before behavior is captured |
| Mixin -> composable -> explicit return contract | `LegacyMixinUsage.vue` | `useProfileForm.ts` | `isDirty` and `resetForm` are explicit returned values | lifecycle cleanup or naming collision is lost |
| Filter -> pure function/computed -> unit test | `legacyFormattingFilter.ts` | `formatProfileValue.ts` | `tests/formatProfileValue.test.ts` | visible label changes after filter removal |
| Event bus -> props/emits or provide/inject -> ownership proof | `legacyEventBus.ts` | `ProfileEventContract.vue` | typed `save` emit and provider owner | hidden listener receives mutation with no parent contract |
| Router 3 config -> Router 4 config -> navigation behavior proof | `legacyRouterConfig.ts` | `modernRouterConfig.ts` | `tests/routerMigrationModel.test.ts` | path, meta, guard, or fallback semantics drift |
| Vuex module -> Pinia store -> state ownership proof | `legacyVuexModuleModel.ts` | `useProfileStore.ts` | `tests/useProfileStore.test.ts` | state is merged into one oversized store |
| Vue CLI/webpack env -> Vite env/import.meta.env -> build proof | `legacyWebpackEnvModel.ts` | `viteEnvBoundary.ts` | `npm run build` plus env review | dev works but production env/asset path fails |
| JS codebase -> TS boundary -> vue-tsc diagnostics | untyped payloads | typed models and emits | `npm run typecheck` | TS passes but runtime input remains unvalidated |
| Refactor PR -> test safety net -> rollback decision | mechanical edit | risk dashboard and rollback map | `MigrationInventoryPanel.vue` + tests | blocked item is shipped with no restore path |

## 5. 核心术语表

| Term | Meaning in this chapter |
| --- | --- |
| Migration inventory | 一个按 legacy pattern、runtime behavior、modern owner、test evidence、risk 和 rollback 组织的迁移清单 |
| Compatibility build | Vue 3 的临时兼容诊断工具，用于暴露 Vue 2 API usage，不是最终架构 |
| Characterization test | 在重构前先锁定旧行为的测试 |
| Adapter layer | 让旧 caller 与新 owner 暂时共存的边界 |
| Strangler pattern | 新旧实现并行，逐步把流量或入口迁到新实现 |
| Rollback artifact | 可恢复旧行为的文件、branch、flag、route 或 release 证据 |

## 6. 底层心智模型

迁移时不要先问“怎么把所有语法换成新写法”，而要追踪这条链：legacy source 创建了什么值，用户依赖哪个 runtime behavior，新的 API 或 tooling 改变了哪个假设，哪个 modern file 拥有新行为，TypeScript 能检查哪个 contract，测试能证明哪个行为没退化，build/preview 能证明哪个输出可发布，risk signal 是否阻塞，rollback path 是否可执行。

## 7. 推荐目录结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization</span>
  </div>

```txt
chapter-14-migration-modernization/
  MigrationModernizationChapterApp.vue
  models/
  legacy-shaped/
  modernized/
  migration-lab/
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

`npm run test:unit` 会发现 `src/**/*.test.ts`，因此本章新增的四个 tests 不需要改 `vitest.config.ts`。

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Migration mental model：inventory、risk、compatibility、tests、incremental refactor 与 rollback

**结论：** Chapter 14 的第一步是 `migrationInventoryItems`，不是打开全局替换。

**本节解决的问题：** `migrationInventoryModel.ts` 把 Options API、mixin、router、Vuex-style module 和 Vite env 假设变成可排序的迁移项目。

**技术意义：** 迁移前先记录 preserved behavior，否则 `ModernProfileComposition.vue` 看起来更现代也可能破坏旧 UI contract。

**概念解释：** inventory item 同时保存 `legacyPattern`、`modernOwner`、`evidenceFile`、`riskScore`、`status` 和 `rollbackPath`。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** 本节只决定迁移门禁，不改变 Vue runtime 或 Router runtime。

**Migration 机制证据链：** `LegacyOptionsProfile.vue` 是 legacy source；profile submit behavior 必须保留；modern owner 是 `ModernProfileComposition.vue`；`tests/migrationInventory.test.ts` 证明 blocked item 会阻塞 gate。

**TypeScript / vue-tsc 编译期过程：** `MigrationInventoryItem` 限定 status 只能是 `ready`、`blocked` 或 `watch`，但不能证明真实页面可点击。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** `MigrationInventoryPanel.vue` 读取数组并渲染 risk 和 blocked state；浏览器只展示结果，不决定是否安全发布。

**API / 语法规则：** 使用 readonly interface、`ReadonlyArray`、`filter`、`reduce` 和 literal union。

**文件结构：** `models/migrationInventoryModel.ts` 与 `migration-lab/MigrationInventoryPanel.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/migrationInventoryModel.ts</span>
  </div>

```ts
export type MigrationStatus = "ready" | "blocked" | "watch";

export interface MigrationInventoryItem {
  readonly id: string;
  readonly riskScore: number;
  readonly status: MigrationStatus;
  readonly rollbackPath: string;
}

export function calculateMigrationRisk(
  items: ReadonlyArray<MigrationInventoryItem>,
): number {
  return items.reduce((total, item) => total + item.riskScore, 0);
}

export function getMigrationGateState(
  items: ReadonlyArray<MigrationInventoryItem>,
): MigrationStatus {
  if (items.some((item) => item.status === "blocked")) {
    return "blocked";
  }

  if (items.some((item) => item.status === "watch")) {
    return "watch";
  }

  return "ready";
}
```
</div>

**逐行解释：** `MigrationStatus` 限制 gate 只能落在三种状态；`MigrationInventoryItem.riskScore` 是可累加的迁移风险；`rollbackPath` 保留失败恢复入口；`calculateMigrationRisk` 用 `reduce` 把每个 row 的风险累加；`getMigrationGateState` 先检查 `blocked`，再检查 `watch`，最后才允许 `ready`。

**执行过程：** App 渲染 panel，setup 计算 total risk，template 显示第一个 blocked item。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** legacy source 从散落文件变成 inventory row；risk score 可见；rollback path 不再藏在口头约定中。

**为什么得到这个结果：** 迁移风险需要可排序数据结构，否则 PR review 只能靠直觉。

**对比写法：** 直接删除旧文件会丢失 behavior baseline 和 rollback artifact。

**常见错误为什么错：** “先改完再测”会让 failure signal 无法定位到具体 owner。

**与真实项目的关系：** 大项目迁移通常跨多个 sprint，inventory 是排期和验收共同语言。

**与当前学习主线的关系：** Chapter 10 的 tests 和 Chapter 11 的 build evidence 在这里变成迁移门禁。

**最终记忆模型：** 没有 inventory 的迁移只是大规模编辑。

<a id="section-9-2"></a>

### 9.2 Migration inventory：legacy APIs、runtime behavior、build tooling、state、router、tests 与 ownership map

**结论：** inventory 必须按 owner 分类，而不是按文件数量分类。

**本节解决的问题：** `migrationInventoryItems` 把 component、state、router、build、test 和 rollback 区分开，避免把所有 legacy code 都交给同一个 refactor PR。

**技术意义：** Router path regression、Pinia state regression、Vite env regression 和 component emit regression 的验证方式完全不同。

**概念解释：** `area` 表示迁移层，`evidenceFile` 指向测试或检查，`modernOwner` 指向新实现。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** router item 归 Router runtime，store item 归 Pinia ownership，build item 归 Vite output。

**Migration 机制证据链：** `legacyRouterConfig.ts` 开始迁移；URL behavior 必须保留；`modernRouterConfig.ts` 拥有新 route records；router test 捕获 path/meta regression。

**TypeScript / vue-tsc 编译期过程：** union type 能防止写错 `area`，但不能知道某个 URL 在部署服务器是否 fallback 正确。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** panel 只读模型；真实运行时变化分别在 Router、Pinia、Vite build 中发生。

**API / 语法规则：** `ReadonlyArray<MigrationInventoryItem>` 防止 panel 直接改 inventory。

**文件结构：** `models/migrationInventoryModel.ts`、`migration-lab/MigrationRiskDashboard.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/migrationInventoryModel.ts</span>
  </div>

```ts
export function getBlockedMigrationItems(
  items: ReadonlyArray<MigrationInventoryItem>,
): ReadonlyArray<MigrationInventoryItem> {
  return items.filter((item) => item.status === "blocked");
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/migration-lab/MigrationInventoryPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  getBlockedMigrationItems,
  migrationInventoryItems,
} from "../models/migrationInventoryModel";

const blockedItems = getBlockedMigrationItems(migrationInventoryItems);
</script>

<template>
  <li v-for="item in migrationInventoryItems" :key="item.id">
    <strong>{{ item.legacyPattern }}</strong>
    <span>{{ item.modernOwner }}</span>
    <span>Risk {{ item.riskScore }} / {{ item.status }}</span>
  </li>
</template>
```
</div>

**逐行解释：** `getBlockedMigrationItems` 接收 readonly inventory，不修改原数组；`filter` 只返回 `status === "blocked"` 的 row；panel import 原始 inventory 和筛选函数；`blockedItems` 是派生值；template 用 `v-for` 渲染 rows，只读展示 `legacyPattern`、`modernOwner`、`riskScore` 和 `status`，不在 panel 内修改 inventory。

**执行过程：** dashboard 汇总 risk，inventory panel 展示 blocked route item。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** legacy APIs 被映射为 rows，adapter 和 target 被显式命名，risk 不再靠“感觉”。

**为什么得到这个结果：** 不同 owner 需要不同证据；同一张表强制你说清楚证据在哪里。

**对比写法：** 只列 `src/components` 文件清单无法说明哪个 runtime 行为会被破坏。

**常见错误为什么错：** 把 “component old” 当成唯一风险会漏掉 Router history fallback 和 env prefix。

**与真实项目的关系：** 技术负责人通常先要求 migration inventory，再允许拆分 PR。

**与当前学习主线的关系：** 它复用 Chapter 06/07/10/11 的 runtime owner 分类。

**最终记忆模型：** inventory 是 migration 的 architecture map。

<a id="section-9-3"></a>

### 9.3 Vue 2 to Vue 3 boundary：createApp、global API、mount、emits、attrs、removed APIs 与 migration build

**结论：** Vue 2 to Vue 3 的核心变化是 app instance 和 public contract，不是简单版本号。

**本节解决的问题：** `compatibilityRiskModel.ts` 把 global API、filters、event bus 和 router mode 标为风险。

**技术意义：** Vue 3 migration build 可以暴露旧 API warning，但本项目不安装它，因为当前任务只做 Vue 3 内的 teaching lab。

**概念解释：** `createApp(App).use(...).mount(...)` 让 plugin、mixin、directive 等配置归 app instance，而不是污染全局 Vue constructor。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** migration build 属于临时 runtime diagnostic；最终 owner 仍应是 Vue 3 app instance 和组件 contract。

**Migration 机制证据链：** legacy global API 是起点；plugin order behavior 要保留；modern owner 是 `chapter-01-application-boundary/main.ts` 的 app instance；typecheck 检查 imports；runtime plugin order 仍需 smoke。

**TypeScript / vue-tsc 编译期过程：** `vue-tsc` 能检查 `defineEmits` payload，但不会运行 migration build warning。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** Browser 只看到 mounted app；Vue runtime 根据 app instance 挂载 plugin、router 和 root component。

**API / 语法规则：** `createApp`、`app.use`、`app.mount`、`emits`、`$attrs`、removed filters、removed events API。

**文件结构：** `models/compatibilityRiskModel.ts` 与 `chapter-01-application-boundary/main.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/compatWarningWorkflowModel.ts</span>
  </div>

```ts
export interface CompatWarningWorkflowStep {
  readonly id: string;
  readonly affectedComponentOrRoute: string;
  readonly officialBreakingChangeTopic: string;
  readonly owner: string;
  readonly severity: CompatWarningSeverity;
  readonly action: string;
  readonly evidencePath: string;
  readonly rollbackPath: string;
}

export function getBlockingCompatSteps(
  steps: ReadonlyArray<CompatWarningWorkflowStep>,
): ReadonlyArray<CompatWarningWorkflowStep> {
  return steps.filter((step) => step.severity === "blocker");
}
```
</div>

**逐行解释：** `id` 让 compat warning 可追踪；`affectedComponentOrRoute` 指向受影响的 route 或 component；`officialBreakingChangeTopic` 连接官方 breaking-change topic；`owner` 告诉 reviewer 谁负责修复；`severity` 决定是否阻塞；`action` 是修复动作；`evidencePath` 指向 test 或 model；`rollbackPath` 是失败恢复入口；`getBlockingCompatSteps` 只筛出 blocker，不安装 `@vue/compat`。

**执行过程：** dashboard 读取 compatibility rows 并显示 tracked risks。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** global mutation 被迁到 app-level install；event/filter removed API 被迁到显式文件。

**为什么得到这个结果：** Vue 3 让多个 app 可以共存，旧的 global mutation 会破坏隔离。

**对比写法：** 在 Vue 3 项目里模拟 `Vue.use(...)` 只会制造不存在的 legacy dependency。

**常见错误为什么错：** 把 migration build 当最终架构会长期保留兼容开销和旧 API 心智模型。

**与真实项目的关系：** 真实迁移可用 migration build 诊断，但最后要消除 warning 并回到标准 Vue 3 build。

**与当前学习主线的关系：** Chapter 01 的 createApp 边界在本章变成迁移入口。

**最终记忆模型：** Vue 3 migration 是 app boundary 迁移，不是只改 import。

<a id="section-9-4"></a>

### 9.4 Options API to Composition API：same runtime component、different organization boundary

**结论：** Options API 不是坏代码；迁移目标是让 state owner、computed owner 和 emit contract 更清楚。

**本节解决的问题：** `LegacyOptionsProfile.vue` 与 `ModernProfileComposition.vue` 展示相同行为如何换组织边界。

**技术意义：** 先保留 display name、role、label 和 save payload，再考虑 `useProfileForm.ts` 是否值得抽取。

**概念解释：** Options API 把 data、computed、methods 分栏；Composition API 把同一业务流程放在函数作用域和 composable return contract 中。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** 本节只迁移 component organization，不改变 Router、Pinia 或 Vite。

**Migration 机制证据链：** legacy component 创建 `displayName` 和 `role`；runtime label 必须一致；modern owner 是 `useProfileForm.ts`；future component test 可验证 save emit；rollback 是保留 legacy component。

**TypeScript / vue-tsc 编译期过程：** `defineEmits` payload 类型能检查 save payload shape；它不能证明用户点击后的 UI 文案与旧组件一致。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** `v-model` 写入 refs，computed `profileLabel` 重新求值，component render effect patch 文本。

**API / 语法规则：** Options API `data`、`computed`、`methods`；Composition API `ref`、`computed`、`defineEmits`。

**文件结构：** `legacy-shaped/LegacyOptionsProfile.vue`、`modernized/ModernProfileComposition.vue`、`modernized/useProfileForm.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/useProfileForm.ts</span>
  </div>

```ts
const displayName = ref(initialProfile.displayName);
const role = ref(initialProfile.role);
const profileLabel = computed(
  () => `${displayName.value.trim()} - ${role.value.trim()}`,
);
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/LegacyOptionsProfile.vue</span>
  </div>

```vue
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      displayName: "Ada Lovelace",
      role: "Analyst",
    };
  },
  computed: {
    profileLabel(): string {
      return `${this.displayName} - ${this.role}`;
    },
  },
});
</script>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/migrationInventory.test.ts</span>
  </div>

```ts
it("sums migration risk scores", () => {
  expect(calculateMigrationRisk(inventory)).toBe(7);
});

it("blocks approval when a blocked item exists", () => {
  expect(getMigrationGateState(inventory)).toBe("blocked");
  expect(getBlockedMigrationItems(inventory)).toHaveLength(1);
});
```
</div>

**逐行解释：** legacy snippet 的 `data()` 创建 instance-local `displayName` 和 `role`；`profileLabel()` 通过 `this` 读取 Options API state；modern snippet 的 `ref` 把两个字段改为 composable-owned reactive sources；`computed` 读取 `.value` 并保留 label 行为；test snippet 证明迁移 gate 的 shared behavior 没有因为组织方式变化而变成 `ready`。

**执行过程：** 用户输入触发 `v-model` 写 ref；computed 读取 ref；Vue render effect 读取 computed；DOM patch 更新 label。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** legacy source 是 Options component；modern target 是 composable + SFC；rollback path 是保留旧 component 并切回 panel。

**为什么得到这个结果：** 两种 API 最终都创建 Vue component instance；差异是逻辑组织和类型推断边界。

**对比写法：** 为了“现代化”把所有 state 提到 Pinia 会错误扩大 ownership。

**常见错误为什么错：** 删除 Options API 只因为它旧，会把稳定低风险组件变成无必要风险。

**与真实项目的关系：** 真实迁移通常允许 Options API 和 Composition API 长期共存。

**与当前学习主线的关系：** Chapter 04 composable 规则在本节用于迁移，不用于炫技抽象。

**最终记忆模型：** Options to Composition 是 ownership refactor，不是价值评判。

<a id="section-9-5"></a>

### 9.5 script setup modernization：compiler macro、top-level binding、props/emits/model/expose 与 migration risk

**结论：** `<script setup>` 是 SFC compiler 语法糖，不是浏览器 runtime API。

**本节解决的问题：** `ModernProfileComposition.vue` 用 top-level bindings 和 `defineEmits` 暴露 save contract。

**技术意义：** 迁移到 `<script setup>` 后，template 能直接读取 top-level refs，但 public contract 必须显式声明。

**概念解释：** compiler 把 `<script setup>` 内容编译进 setup function；每个 component instance 执行一次 setup。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** macro 属于 compiler boundary；emit payload 属于 component public contract。

**Migration 机制证据链：** legacy `methods.saveProfile` 是起点；save payload behavior 要保留；`defineEmits` 拥有新 event type；`vue-tsc` 检查 payload；runtime click 仍需 component smoke。

**TypeScript / vue-tsc 编译期过程：** `defineEmits<{ save: [...] }>()` 检查 emit 调用参数，但不验证 parent 是否处理 event。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** Vite Vue plugin 编译 SFC；Vue runtime 创建 component；browser click 调用 handler。

**API / 语法规则：** `<script setup>`、`defineProps`、`defineEmits`、`defineModel`、`defineExpose`、top-level template exposure。

**文件结构：** `modernized/ModernProfileComposition.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/ModernProfileComposition.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useProfileForm } from "./useProfileForm";

const emit = defineEmits<{
  save: [
    payload: {
      readonly displayName: string;
      readonly role: string;
    },
  ];
}>();

const { displayName, role, createSnapshot } = useProfileForm({
  displayName: "Ada Lovelace",
  role: "Analyst",
});

function saveProfile(): void {
  emit("save", createSnapshot());
}
</script>
```
</div>

**逐行解释：** `script setup` 告诉 SFC compiler 把 top-level binding 暴露给 template；`useProfileForm` 是普通 module import；`defineEmits` 是 compile-time macro，类型参数约束 `save` payload；destructuring 接收 composable 返回的 refs 和 snapshot 函数；`saveProfile` 在 runtime click 时调用 `emit`，但 macro 本身不是浏览器里的长期业务函数。

**执行过程：** 编译阶段处理 macro；运行阶段 handler 调用 `emit`；parent 可监听 `save`。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** methods option 迁移到 setup function，event contract 从隐式变显式。

**为什么得到这个结果：** macro 在编译期消失，真正运行的是生成后的 setup 和 emit 调用。

**对比写法：** 在普通函数内调用 `defineEmits` 违反 macro 必须位于 setup 顶层的规则。

**常见错误为什么错：** 把 macro 当 runtime function 会误判它能根据分支动态声明 contract。

**与真实项目的关系：** 大项目迁移时可以先保留 Options component，再为高变更组件引入 `<script setup>`。

**与当前学习主线的关系：** Chapter 05 的 TypeScript boundary 在这里检查 emit payload。

**最终记忆模型：** `<script setup>` 改的是 SFC 编译边界和组织方式。

<a id="section-9-6"></a>

### 9.6 Mixins to composables：hidden merge behavior、source ownership、cleanup 与 explicit return contract

**结论：** mixin 迁移必须先找出隐式 merge 的 state、computed、methods 和 lifecycle cleanup。

**本节解决的问题：** `LegacyMixinUsage.vue` 把 `draftName`、`isDirty` 和 `resetDraft` 隐式合入 component；`useProfileForm.ts` 显式返回这些 owner。

**技术意义：** composable 降低命名冲突，但只有在 state owner 清楚时才安全。

**概念解释：** mixin merge 让 component template 能读取来源不明显的值；composable return 让 caller 显式选择暴露值。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** 本节只处理 component-local state，不迁移到 global store。

**Migration 机制证据链：** legacy mixin 是起点；dirty/reset behavior 要保留；modern owner 是 `useProfileForm.ts`；TypeScript 检查 returned refs；runtime cleanup 需要跟随 composable。

**TypeScript / vue-tsc 编译期过程：** composable return object 有明确属性；TypeScript 不会证明旧 mixin 的所有 lifecycle hook 已迁移。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** refs 被 template 读取；computed 追踪 refs；button click 调用 reset function。

**API / 语法规则：** mixins、`ref`、`computed`、composable naming convention。

**文件结构：** `legacy-shaped/LegacyMixinUsage.vue`、`modernized/useProfileForm.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/LegacyMixinUsage.vue</span>
  </div>

```vue
<script lang="ts">
const profileDraftMixin = defineComponent({
  data() {
    return {
      draftName: "Grace Hopper",
      initialName: "Grace Hopper",
    };
  },
  computed: {
    isDirty(): boolean {
      return this.draftName !== this.initialName;
    },
  },
});
</script>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/useProfileForm.ts</span>
  </div>

```ts
export function useProfileForm(initialProfile: ProfileFormSnapshot) {
  const displayName = ref(initialProfile.displayName);
  const role = ref(initialProfile.role);
  const isDirty = computed(
    () =>
      displayName.value !== initialProfile.displayName ||
      role.value !== initialProfile.role,
  );

  return { displayName, role, isDirty };
}
```
</div>

**逐行解释：** legacy mixin 的 `data()` 和 `computed` 会被合并到 consuming component，caller 只看到最终 instance；modern composable 先创建 `displayName` 与 `role` refs，再用 `computed` 读取它们，最后通过 return object 明确暴露 contract。

**执行过程：** 用户输入改变 draft；computed dirty state 更新；reset button 恢复旧值。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** mixin 的隐式来源被替换为 explicit return contract；rollback 是保留 mixin-shaped component。

**为什么得到这个结果：** Vue 对 mixin option 做合并，而 composable 是普通 JavaScript function composition。

**对比写法：** 把多个 mixin 合并成一个大 composable 仍然会隐藏 ownership。

**常见错误为什么错：** 忘记 lifecycle cleanup 会让旧 mixin 的 event listener 或 timer 泄漏。

**与真实项目的关系：** 迁移 global mixin 前应先列出每个 consumer，否则会误删行为。

**与当前学习主线的关系：** Chapter 04 的 composable 复用原则在这里变成 migration safety rule。

**最终记忆模型：** mixin to composable 是隐式 merge 到显式 contract 的迁移。

<a id="section-9-7"></a>

### 9.7 Filters and event bus removal：pure formatting functions、computed values、props/emits/provide-inject alternatives

**结论：** filters 和 event bus 的共同问题是 ownership 隐藏。

**本节解决的问题：** `legacyFormattingFilter.ts` 迁移到 `formatProfileValue.ts`；`legacyEventBus.ts` 迁移到 `ProfileEventContract.vue` 的 typed emit 和 provider owner。

**技术意义：** formatting 应是 pure function 或 computed；跨组件事件应由 props/emits、provide/inject 或确实全局的 store 承担。

**概念解释：** filter 隐藏函数调用位置；event bus 隐藏 listener owner；现代写法让依赖路径可测试。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** formatting 是 pure function boundary；event 是 component public contract。

**Migration 机制证据链：** legacy filter/event bus 是起点；visible label 和 save payload 要保留；modern owner 是 `formatProfileValue.ts` 和 `ProfileEventContract.vue`；tests 验证 formatting。

**TypeScript / vue-tsc 编译期过程：** TypeScript 检查 `ProfileSavePayload`，但不能证明 parent listener 做了正确业务处理。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** input 更新 ref；button click emits payload；format function 可在 computed 或 test 中复用。

**API / 语法规则：** removed filters、removed events API、`defineEmits`、`provide`、computed values。

**文件结构：** `legacy-shaped/legacyFormattingFilter.ts`、`modernized/formatProfileValue.ts`、`legacy-shaped/legacyEventBus.ts`、`modernized/ProfileEventContract.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyFormattingFilter.ts</span>
  </div>

```ts
export function legacyProfileLabelFilter(
  input: LegacyProfileLabelInput,
): string {
  return `${input.displayName.trim()} - ${input.role.trim().toUpperCase()}`;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/formatProfileValue.ts</span>
  </div>

```ts
export function formatProfileLabel(input: ProfileLabelParts): string {
  return `${input.displayName.trim()} - ${input.role.trim().toUpperCase()}`;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/formatProfileValue.test.ts</span>
  </div>

```ts
it("preserves visible profile label output", () => {
  expect(
    formatProfileLabel({
      displayName: " Ada Lovelace ",
      role: " analyst ",
    }),
  ).toBe("Ada Lovelace - ANALYST");
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/ProfileEventContract.vue</span>
  </div>

```vue
<script setup lang="ts">
export interface ProfileSavePayload {
  readonly profileId: string;
  readonly displayName: string;
}

const emit = defineEmits<{
  save: [payload: ProfileSavePayload];
}>();
</script>
```
</div>

**逐行解释：** legacy filter 和 modern formatter 都 trim `displayName`、uppercase `role`，所以 visible text 保持一致；unit test 用带空格的小写 role 证明格式没有漂移；event contract snippet 把 event bus 的 hidden payload 改成 `defineEmits` payload type。

**执行过程：** 函数接收对象，返回字符串；Vitest 比较精确输出。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** pipe/filter 与 bus emit 变成可导入函数和 typed emit。

**为什么得到这个结果：** pure function 没有 component instance 依赖，测试成本低。

**对比写法：** 用 Pinia 替代所有 event bus 会把短距离事件错误升级成 global state。

**常见错误为什么错：** 未测试格式化输出会在迁移后悄悄改变用户可见文案。

**与真实项目的关系：** 旧项目里 filters 常被财务、日期和权限文案复用，必须先锁定输出。

**与当前学习主线的关系：** Chapter 03 的 emits/provide-inject 和 Chapter 07 的 Pinia 边界在这里帮助选择替代方案。

**最终记忆模型：** 先找 owner，再替换 filters 和 event bus。

<a id="section-9-8"></a>

### 9.8 Component communication migration：v-model、emits option、fallthrough attrs、.native removal 与 public contract

**结论：** communication migration 的重点是 public contract，不是事件名字机械替换。

**本节解决的问题：** `ProfileEventContract.vue` 用 typed `save` event 表示父子 contract，避免旧 event bus 和 `.native` 误用。

**技术意义：** Vue 3 的 `emits` 声明让 listener、fallthrough attrs 和 component event 边界更清晰。

**概念解释：** 未声明的 listener 可能作为 fallthrough attrs；声明 event 能让组件 public API 可审查。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** 本节只处理 component public contract，不负责 server authorization。

**Migration 机制证据链：** legacy `.native` 或 event bus 是起点；click/save behavior 要保留；modern owner 是 `defineEmits`；TypeScript 检查 payload；runtime listener 行为需 component smoke。

**TypeScript / vue-tsc 编译期过程：** emits payload type 可检查 `profileId` 和 `displayName`，但不验证 DOM native event 是否仍从正确元素发出。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** browser click 触发 method；Vue 调用 component emit；parent listener 接收 payload。

**API / 语法规则：** `emits` option、`defineEmits`、`v-model` `modelValue` / `update:modelValue`、fallthrough attrs、removed `.native`。

**文件结构：** `modernized/ProfileEventContract.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyEventBus.ts</span>
  </div>

```ts
type ProfileSavedHandler = (payload: ProfileSavedPayload) => void;

const profileSavedHandlers = new Set<ProfileSavedHandler>();

export const legacyProfileEventBus = {
  onProfileSaved(handler: ProfileSavedHandler): void {
    profileSavedHandlers.add(handler);
  },
  emitProfileSaved(payload: ProfileSavedPayload): void {
    profileSavedHandlers.forEach((handler) => {
      handler(payload);
    });
  },
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/componentContractMigration.ts</span>
  </div>

```ts
export function migrateNativeClickPayload(
  payload: LegacyClickPayload,
): ModernClickPayload {
  if (payload.nativeType !== "click") {
    throw new Error("Unsupported native event");
  }

  return {
    eventName: "activate",
    targetId: payload.targetId,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/ProfileEventContract.vue</span>
  </div>

```vue
<script setup lang="ts">
const emit = defineEmits<{
  save: [payload: ProfileSavePayload];
}>();

function saveProfile(): void {
  const payload: ProfileSavePayload = {
    profileId,
    displayName: displayName.value,
  };

  emit("save", payload);
}
</script>
```
</div>

**逐行解释：** legacy bus stores handlers outside the component tree; `emitProfileSaved` broadcasts to every registered handler; `migrateNativeClickPayload` rejects non-click DOM events and returns a component event payload; `ProfileEventContract.vue` declares the `save` event and emits exactly one typed payload from the component boundary.

**执行过程：** input 改 displayName，click save，component emit payload，parent 可以记录保存。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** `.native` 或 bus listener 被替换为明确 event contract。

**为什么得到这个结果：** Vue 3 把 component event 和 DOM event 边界分得更清楚。

**对比写法：** 让 parent 直接访问 child internal ref 会破坏 public contract。

**常见错误为什么错：** 删除 `.native` 却不声明 emits，会让旧 listener 行为不清楚。

**与真实项目的关系：** 设计系统组件迁移尤其需要把 public emits 文档化。

**与当前学习主线的关系：** Chapter 03 的组件通信规则成为 migration review checklist。

**最终记忆模型：** communication migration 要保留 contract，而不是保留旧事件形状。

<a id="section-9-9"></a>

### 9.9 Vue Router migration：new Router -> createRouter、mode -> history、guards、meta、typed route opportunity

**结论：** Router 迁移的验收标准是 URL semantics 和 guard behavior 保持一致。

**本节解决的问题：** `legacyRouterConfig.ts` 的 `mode: "history"` 和 routes 迁移为 `modernRouterConfig.ts` 的 route records 与 explicit history。

**技术意义：** `createRouter` / `createWebHistory` 是 API 变化；guard redirect 和 backend fallback 是 runtime 行为风险。

**概念解释：** Router 4 创建 router instance 时显式传入 history implementation；route meta 仍然需要运行时 guard 使用。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** Router runtime 拥有 navigation state；server history fallback 不属于 Router package。

**Migration 机制证据链：** legacy config 是起点；`/profiles/:id` path 和 `requiresAuth` meta 必须保留；modern owner 是 `modernRouterConfig.ts`；router test 验证 mapping。

**TypeScript / vue-tsc 编译期过程：** route record interface 能检查 `path` 和 `meta` shape，不能证明真实 redirect 顺序。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** browser URL 进入 Router；Router 匹配 record；guard 读取 meta；component 渲染或 redirect。

**API / 语法规则：** `new Router` -> `createRouter`，`mode: "history"` -> `history: createWebHistory()`，guards 仍需测试。

**文件结构：** `legacy-shaped/legacyRouterConfig.ts`、`modernized/modernRouterConfig.ts`、`tests/routerMigrationModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/modernRouterConfig.ts</span>
  </div>

```ts
export const modernRouteRecords: ReadonlyArray<ModernRouteRecord> =
  legacyRouterConfig.routes.map((route) => migrateLegacyRoute(route));
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyRouterConfig.ts</span>
  </div>

```ts
export const legacyRouterConfig: LegacyRouterConfig = {
  mode: "history",
  routes: [
    {
      name: "profile-detail",
      path: "/profiles/:id",
      component: "LegacyProfilePage",
      meta: {
        requiresAuth: true,
      },
    },
  ],
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/routerAdvancedMigrationModel.ts</span>
  </div>

```ts
export const routerAdvancedMigrationItems: ReadonlyArray<RouterAdvancedMigrationItem> =
  [
    {
      topic: "is-ready",
      legacyPattern: "Initial navigation is assumed complete after mount",
      modernReplacement: "Wait for router.isReady before assertions or hydration-sensitive checks",
      runtimeBehaviorPreserved: "The first rendered route still matches the requested URL.",
      typeBoundary: "router.isReady returns a Promise that TypeScript can enforce at call sites.",
      evidence: "models/routerAdvancedMigrationModel.ts",
      failureSignal: "Tests assert the previous route or hydration starts too early.",
      rollbackStrategy: "Keep startup assertions behind an explicit ready gate.",
    },
  ];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/routerMigrationModel.test.ts</span>
  </div>

```ts
it("preserves route path and auth metadata", () => {
  expect(migrateLegacyRoute(legacyRoute)).toEqual({
    name: "profile-detail",
    path: "/profiles/:id",
    componentPath: "LegacyProfilePage",
    meta: {
      requiresAuth: true,
    },
  });
});
```
</div>

**逐行解释：** legacy route block shows `mode: "history"` and the user-visible path; modern block maps each legacy route through `migrateLegacyRoute`; advanced model keeps `router.isReady`, catch-all, base and navigation-failure risks visible; test asserts path and auth meta stay unchanged.

**执行过程：** test 构造 legacy route，调用 mapper，断言 path 和 meta 未漂移。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** adapter 是 `migrateLegacyRoute`；target 是 modern records；rollback 是恢复 old route table。

**为什么得到这个结果：** Router API 变了，但 URL contract 是用户可见行为。

**对比写法：** 只让 TypeScript 通过但不测 redirect，会漏掉 auth flow regression。

**常见错误为什么错：** 把 frontend route guard 当 backend authorization 会泄露 API 数据。

**与真实项目的关系：** SPA history fallback 还要结合 Chapter 11 的 nginx/static hosting 检查。

**与当前学习主线的关系：** Chapter 06 的 route record、query、guard 和 meta 是本节迁移对象。

**最终记忆模型：** Router migration 以 URL 和 guard evidence 为准。

<a id="section-9-10"></a>

### 9.10 Vuex to Pinia migration：modules to stores、mutations to actions/direct assignment、namespace to store id

**结论：** Vuex module 不能机械合并成一个巨大 Pinia store。

**本节解决的问题：** `legacyVuexModuleModel.ts` 把 namespaced profile module 表达为 legacy shape；`useProfileStore.ts` 用 Pinia store id 表示现代 owner。

**技术意义：** namespace 映射 store id，mutation 可以变成 action 或 direct assignment，但 state ownership 必须保持清楚。

**概念解释：** Pinia store 同时拥有 state、getter 和 action；mutation layer 不再是必需中间层。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** Pinia store owns global client state；component-local form draft 不应迁到 store。

**Migration 机制证据链：** legacy module 是起点；displayName/revision behavior 要保留；modern owner 是 `useProfileStore.ts`; test 验证 update/reset。

**TypeScript / vue-tsc 编译期过程：** `ProfileStoreState` 检查 state shape；不能证明 caller 是否应该拥有这份 global state。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** component 调用 store action；Pinia mutation 更新 reactive store；render effect 读取 storeToRefs 后 patch DOM。

**API / 语法规则：** `defineStore`、state function、getters、actions、store id、direct assignment。

**文件结构：** `legacy-shaped/legacyVuexModuleModel.ts`、`modernized/useProfileStore.ts`、`migration-lab/StoreMigrationPanel.vue`、`tests/useProfileStore.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/useProfileStore.ts</span>
  </div>

```ts
export const useProfileStore = defineStore("chapter14Profile", {
  state: (): ProfileStoreState => ({
    profileId: "profile-001",
    displayName: "Ada Lovelace",
    revision: 1,
  }),
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyVuexModuleModel.ts</span>
  </div>

```ts
export const legacyVuexProfileModule: LegacyVuexProfileModule = {
  namespaced: true,
  state: {
    profileId: "profile-001",
    displayName: "Ada Lovelace",
    revision: 1,
  },
  mutations: {
    setDisplayName: "profile/setDisplayName",
  },
};
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/useProfileStore.test.ts</span>
  </div>

```ts
it("updates display name and revision through a Pinia action", () => {
  const store = useProfileStore();

  store.updateDisplayName(" Grace Hopper ");

  expect(store.displayName).toBe("Grace Hopper");
  expect(store.revision).toBe(2);
});
```
</div>

**逐行解释：** legacy module uses namespace and mutation names as ownership markers; Pinia store id replaces namespace; state function creates baseline state; action trims and writes `displayName`, then increments `revision`; test proves the migrated write path preserves the state transition.

**执行过程：** test 激活 Pinia，创建 store，调用 `updateDisplayName`，断言 revision 增加。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** Vuex module model 变成 Pinia store；rollback 是保留 adapter 或 old module until callers migrated。

**为什么得到这个结果：** Pinia 没有 mutation 概念，action/direct assignment 是不同写入边界。

**对比写法：** 把所有 Vuex modules 放进一个 Pinia store 会失去 domain owner。

**常见错误为什么错：** 只保留旧 namespace 名字不等于保留 state lifecycle。

**与真实项目的关系：** 可让 Vuex 与 Pinia 短期共存，但每个 caller 的 ownership 要被迁移记录覆盖。

**与当前学习主线的关系：** Chapter 07 的 state classification 是 Vuex to Pinia 的前置判断。

**最终记忆模型：** Vuex to Pinia 是 state ownership migration。

<a id="section-9-11"></a>

### 9.11 Build tooling migration：Vue CLI / webpack assumptions to Vite ESM、env、assets、HMR、build output

**结论：** Vite migration 必须同时验证 dev、build 和 preview，不是 dev server 可见就结束。

**本节解决的问题：** `legacyWebpackEnvModel.ts` 记录 `process.env.VUE_APP_*` 和 `require(asset)` 假设；`viteEnvBoundary.ts` 使用 `import.meta.env`。

**技术意义：** Vite dev server 基于 native ESM 和 HMR；production build 仍会 bundle 和优化，因此 dev success 不等于 production success。

**概念解释：** Vite 只暴露 `VITE_` prefix client env；asset import 在 build 后可能变成 hashed URL。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** Vite owns module transform、env replacement 和 production build output。

**Migration 机制证据链：** legacy webpack env read 是起点；public API URL behavior 要保留；modern owner 是 `viteEnvBoundary.ts`; `npm run build` 验证 production output。

**TypeScript / vue-tsc 编译期过程：** `ImportMetaEnv` type 能检查 known env access；不能证明部署 env 值存在或不是 secret。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** Vite dev 按请求转换模块；browser 读取 `import.meta.env`; build 阶段静态替换 env。

**API / 语法规则：** `import.meta.env`、`VITE_` prefix、ESM asset imports、HMR、production build。

**文件结构：** `legacy-shaped/legacyWebpackEnvModel.ts`、`modernized/viteEnvBoundary.ts`、`migration-lab/BuildToolMigrationPanel.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyWebpackEnvModel.ts</span>
  </div>

```ts
export const legacyWebpackEnvReads: ReadonlyArray<LegacyWebpackEnvRead> = [
  {
    expression: "process.env.VUE_APP_API_BASE_URL",
    expectedValue: "client public API base URL",
    migrationRisk: "Vite only exposes VITE-prefixed client env values.",
  },
  {
    expression: "require('./profile.svg')",
    expectedValue: "bundled asset URL",
    migrationRisk: "Vite prefers ESM asset imports and production build proof.",
  },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/viteEnvBoundary.ts</span>
  </div>

```ts
export function readViteEnvBoundary(
  env: ImportMetaEnv = import.meta.env,
): ViteEnvBoundaryResult {
  return {
    apiBaseUrl: env.VITE_API_BASE_URL ?? "/api",
    mode: env.MODE,
    isProduction: env.PROD,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/viteAssetBoundary.ts</span>
  </div>

```ts
export function classifyViteAssetReference(value: string): ViteAssetReference {
  if (value.startsWith("/")) {
    return { value, kind: "public-root" };
  }

  if (value.includes("new URL(") && value.includes("import.meta.url")) {
    return { value, kind: "new-url" };
  }

  return { value, kind: "unsupported-dynamic" };
}
```
</div>

**逐行解释：** legacy model records `process.env.VUE_APP_API_BASE_URL` and `require` as old assumptions; `readViteEnvBoundary` reads `import.meta.env`, falls back to `/api`, and exposes mode/prod state; `classifyViteAssetReference` separates public-root URLs, `new URL` static asset references, and unsupported dynamic strings.

**执行过程：** panel setup 读取 env boundary，template 显示 mode 和 API URL。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** `process.env` 假设迁移到 Vite env boundary；build output 成为验收证据。

**为什么得到这个结果：** Vite 的 dev 与 build pipeline 不等同于 webpack dev server。

**对比写法：** 继续在 client code 读 `process.env` 会在 Vite browser runtime 中失败或被错误 polyfill。

**常见错误为什么错：** 把 secret 加上 `VITE_` prefix 会把值打进 client bundle。

**与真实项目的关系：** 迁移部署前必须检查 env、asset URL、base path 和 preview。

**与当前学习主线的关系：** Chapter 11 的 production build evidence 在这里用于 migration acceptance。

**最终记忆模型：** Vite migration 是 module/env/asset/output assumption migration。

<a id="section-9-12"></a>

### 9.12 TypeScript adoption during migration：allowJs boundary、strictness ramp、vue-tsc、unknown runtime data

**结论：** TypeScript adoption 是逐步缩小 unknown boundary，不是一次性把所有旧 JS 改成 TS。

**本节解决的问题：** 本章模型文件用 interfaces 描述 route、store、inventory 和 rollback，展示 TS 如何帮助 migration review。

**技术意义：** `vue-tsc` 可以检查 SFC props/emits/store imports，但 runtime payload 和 user input 仍需 Zod 或手写验证。

**概念解释：** 类型系统检查代码声明之间的关系；它不执行旧项目行为，也不代表新旧 runtime 等价。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** TS diagnostic 是 static boundary；test/build 才是 evidence boundary。

**Migration 机制证据链：** untyped legacy payload 是起点；payload behavior 要保留；modern owner 是 interface + typed emit/store；typecheck 报 API drift；tests 报 behavior drift。

**TypeScript / vue-tsc 编译期过程：** `npm run typecheck` 调用 `vue-tsc --noEmit`，检查 `.vue` 和 `.ts` source。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** 类型擦除后 browser 只运行 JavaScript；bad runtime data 仍可能出现。

**API / 语法规则：** interface、literal union、readonly property、`unknown` runtime data policy、`vue-tsc --noEmit`。

**文件结构：** `models/*.ts`、`modernized/*.ts`、`tests/*.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/runtimeUnknownBoundaryModel.ts</span>
  </div>

```ts
export function parseUnknownProfilePayload(input: unknown): ParsedProfilePayload {
  if (typeof input !== "object" || input === null) {
    throw new Error("Profile payload must be an object");
  }

  const record = input as Record<string, unknown>;

  if (typeof record.displayName !== "string") {
    throw new Error("Profile displayName must be a string");
  }

  if (typeof record.role !== "string") {
    throw new Error("Profile role must be a string");
  }

  return {
    displayName: record.displayName,
    role: record.role,
  };
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
npm run typecheck
```
</div>

**逐行解释：** `input: unknown` forces runtime validation before property reads; object/null guard protects JavaScript runtime access; `Record<string, unknown>` keeps fields untrusted; each `typeof` check narrows one field; the return statement is safe only after both checks; `npm run typecheck` runs `vue-tsc --noEmit`, so it checks SFC/TS types but does not execute migration behavior.

**执行过程：** `vue-tsc` 读取 tsconfig include；检查源文件；不输出 JS。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** JS tolerance 逐步收紧为 typed owner，但 runtime evidence 仍来自 tests。

**为什么得到这个结果：** TypeScript 是 static analysis，不是 migration oracle。

**对比写法：** 一次性打开所有 strict flags 且无 adapter，可能阻塞业务修复。

**常见错误为什么错：** “typecheck pass” 不代表 old UI behavior preserved。

**与真实项目的关系：** 真实 JS-to-TS 迁移常用 allowJs、checkJs 或目录级 ramp。

**与当前学习主线的关系：** Chapter 05 的 TS 边界在这里服务 migration。

**最终记忆模型：** TypeScript 帮你发现 drift，不替你证明 equivalence。

<a id="section-9-13"></a>

### 9.13 Test safety net before refactor：characterization tests、component smoke、store tests、router tests、build checks

**结论：** 没有 safety net 的 refactor 只是高风险编辑。

**本节解决的问题：** 本章新增 `migrationInventory.test.ts`、`formatProfileValue.test.ts`、`useProfileStore.test.ts` 和 `routerMigrationModel.test.ts`。

**技术意义：** tests 在迁移前锁定行为；typecheck 和 build 在迁移后验证现代目标能编译和打包。

**概念解释：** characterization test 不评价旧代码美不美，只锁定用户依赖的行为。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** test safety net 证明 behavior；build 证明 output；二者不能互相替代。

**Migration 机制证据链：** legacy filter/store/router 是起点；visible output/state/path/meta 要保留；modern owner 被测试导入；Vitest 断言结果。

**TypeScript / vue-tsc 编译期过程：** tests 也是 TS 文件，typecheck 会检查 imports 和 type-only boundaries。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** Vitest 在 jsdom 环境运行；Pinia test 激活 store；pure function test 不需要 DOM。

**API / 语法规则：** `describe`、`it`、`expect`、`setActivePinia(createPinia())`。

**文件结构：** `tests/migrationInventory.test.ts`、`tests/formatProfileValue.test.ts`、`tests/useProfileStore.test.ts`、`tests/routerMigrationModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/migrationInventory.test.ts</span>
  </div>

```ts
it("blocks approval when a blocked item exists", () => {
  expect(getMigrationGateState(inventory)).toBe("blocked");
  expect(getBlockedMigrationItems(inventory)).toHaveLength(1);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/formatProfileValue.test.ts</span>
  </div>

```ts
it("preserves visible profile label output", () => {
  expect(
    formatProfileLabel({
      displayName: " Ada Lovelace ",
      role: " analyst ",
    }),
  ).toBe("Ada Lovelace - ANALYST");
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/useProfileStore.test.ts</span>
  </div>

```ts
it("restores the known baseline state", () => {
  const store = useProfileStore();

  store.updateDisplayName("Grace Hopper");
  store.resetProfile();

  expect(store.displayName).toBe("Ada Lovelace");
  expect(store.revision).toBe(1);
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/routerMigrationModel.test.ts</span>
  </div>

```ts
it("exposes migrated route auth requirement", () => {
  expect(modernRouteRecords).toHaveLength(2);
  expect(getRouteAuthRequirement("profile-detail")).toBe(true);
  expect(getRouteAuthRequirement("missing-route")).toBe(false);
});
```
</div>

**逐行解释：** inventory test proves blocked risk prevents approval; store test mutates then resets state to prove baseline recovery; formatting test locks visible text output; router test proves auth lookup returns true for a migrated route and false for a missing route; these tests catch behavior drift before a refactor is accepted.

**执行过程：** `npm run test:unit` 触发 Vitest，匹配 `src/**/*.test.ts`，运行 Chapter 14 tests。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** 行为从口头假设变成 test evidence；risk dashboard 可引用 test file。

**为什么得到这个结果：** 测试是迁移中最小的可复现证据单位。

**对比写法：** 只跑 dev server 会漏掉 store action 和 pure formatting regression。

**常见错误为什么错：** 迁移后才补测试会把 bug 固化成“新预期”。

**与真实项目的关系：** 先补 characterization tests 再 refactor 是维护旧系统的常规手段。

**与当前学习主线的关系：** Chapter 10 的 testing quality 变成本章 gate。

**最终记忆模型：** 先证明旧行为，再替换实现。

<a id="section-9-14"></a>

### 9.14 Incremental migration strategy：strangler pattern、parallel components、adapter layer、feature flags 与 rollback

**结论：** 增量迁移允许 legacy 和 modern target 暂时并行。

**本节解决的问题：** `LegacyModernDiffPanel.vue` 同时展示 legacy-shaped 和 modernized examples，说明并行对比比一次性替换安全。

**技术意义：** adapter layer、feature flag 或 route split 能降低 blast radius。

**概念解释：** strangler pattern 让新实现逐步接管入口，旧实现作为 rollback artifact 保留。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** adapter 只桥接入口，不应长期复制业务逻辑。

**Migration 机制证据链：** legacy component 是起点；behavior test 保留；modern target 并行；risk dashboard 决定何时切换；rollback 保留旧入口。

**TypeScript / vue-tsc 编译期过程：** TS 可检查 adapter props/emits，不证明 feature flag rollout 安全。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** browser 可以同时渲染 legacy and modern panels；真实项目可通过 route/flag 控制。

**API / 语法规则：** component parallel render、adapter function、feature flag policy、rollback path。

**文件结构：** `migration-lab/LegacyModernDiffPanel.vue`、`models/rollbackModel.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/rollbackModel.ts</span>
  </div>

```ts
export const rollbackItems: ReadonlyArray<RollbackItem> = [
  {
    artifact: "LegacyOptionsProfile.vue",
    owner: "component owner",
    state: "verified",
    restoreSignal: "Modern profile form fails characterization.",
  },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/incrementalMigrationAdapterModel.ts</span>
  </div>

```ts
export function chooseMigrationEntry(flag: MigrationFeatureFlag): MigrationEntry {
  if (flag.enabled) {
    return "modern";
  }

  return flag.fallbackEntry;
}
```
</div>

**逐行解释：** `rollbackItems` names the artifact, owner, current recovery state and restore trigger; `chooseMigrationEntry` sends enabled flags to the modern entry and disabled flags back to the declared fallback, so rollback is represented as data instead of a verbal promise.

**执行过程：** dashboard 显示旧新并行；风险未清零前不删除旧文件。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** 旧入口由生产入口变为 rollback artifact；现代入口逐步获得流量。

**为什么得到这个结果：** 大迁移失败通常来自同时改变太多入口。

**对比写法：** 一次性改所有 route、store、component 让 failure root cause 不可定位。

**常见错误为什么错：** 没有 rollback path 的 feature flag 只是开关，不是安全机制。

**与真实项目的关系：** 业务系统迁移要考虑 release train、QA 窗口和快速恢复。

**与当前学习主线的关系：** Chapter 11 的 rollback/deployment 思维进入源码迁移。

**最终记忆模型：** 增量迁移靠并行、证据和可回退入口。

<a id="section-9-15"></a>

### 9.15 Migration risk dashboard：risk scoring、owner、impact、evidence、blocked state 与 acceptance gate

**结论：** risk dashboard 把迁移是否可合并变成数据问题。

**本节解决的问题：** `MigrationRiskDashboard.vue` 汇总 compatibility、component、router、store 和 build checks。

**技术意义：** reviewer 不应该只看 diff 大小，而要看每个 owner 是否有 evidence。

**概念解释：** risk score 表示迁移影响面，blocked state 表示缺少证据或 rollback。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** dashboard 是 review artifact，不是 runtime source of truth。

**Migration 机制证据链：** legacy risk rows 是起点；behavior evidence 绑定 test/build；modern owner 明确；blocked item 阻止 acceptance。

**TypeScript / vue-tsc 编译期过程：** model types 保证 dashboard imports 结构正确，不能判断风险分数是否合理。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** Vue 渲染 dashboard cards；user 读取 risk summary。

**API / 语法规则：** readonly arrays、computed counts、v-for rendering。

**文件结构：** `migration-lab/MigrationRiskDashboard.vue`、`models/*Model.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/migration-lab/MigrationRiskDashboard.vue</span>
  </div>

```vue
<script setup lang="ts">
import { compatibilityRisks } from "../models/compatibilityRiskModel";
import { routerMigrationSummaries } from "../models/routerMigrationModel";
import { viteMigrationChecks } from "../models/viteMigrationModel";
</script>

<template>
  <article>
    <h4>Compatibility risks</h4>
    <p>{{ compatibilityRisks.length }} tracked risks</p>
  </article>
  <article>
    <h4>Router paths</h4>
    <p>{{ routerMigrationSummaries.length }} route checks</p>
  </article>
  <article>
    <h4>Build checks</h4>
    <p>{{ viteMigrationChecks.length }} Vite checks</p>
  </article>
</template>
```
</div>

**逐行解释：** each import represents one migration owner; each card renders a count derived from readonly model data; the dashboard does not mutate migration state, it exposes review evidence and points the reader back to the owner model.

**执行过程：** setup 导入数据，template 渲染 cards。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** migration state 从文档段落变成可运行 UI。

**为什么得到这个结果：** 可视化风险能减少 rubber-stamp PR。

**对比写法：** 只写“已完成迁移”没有 evidence path。

**常见错误为什么错：** 风险分数没有 owner 和 failure signal 就不可执行。

**与真实项目的关系：** 大团队迁移可用 dashboard 跟踪 feature owner 和 blockers。

**与当前学习主线的关系：** 它整合 Chapter 06/07/10/11 的 evidence vocabulary。

**最终记忆模型：** dashboard 是 migration review 的 evidence index。

<a id="section-9-16"></a>

### 9.16 Legacy-modern diff reading：how to review PRs without rubber-stamping mechanical rewrites

**结论：** review migration PR 时先读 behavior evidence，再读 syntax diff。

**本节解决的问题：** `optionsToCompositionSteps` 给出从 characterization、state move 到 event contract 的 review path。

**技术意义：** mechanical rewrite 容易把 Options API、mixin、filter、router、store 和 env 同时改掉，导致 review 失效。

**概念解释：** diff reading 要问：旧行为是什么，谁拥有新行为，哪条测试证明未退化，失败时如何回滚。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** review 不执行 runtime，但必须要求 runtime evidence。

**Migration 机制证据链：** legacy diff 是起点；preserved behavior 逐项核对；modern owner 和 test evidence 必须同 PR 出现。

**TypeScript / vue-tsc 编译期过程：** typecheck failure 是 hard stop；typecheck pass 仍需行为证据。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** reviewer 需要知道哪些行为只能在 browser/router/store/build 中观察。

**API / 语法规则：** PR checklist、diff-by-owner、test-before-refactor。

**文件结构：** `models/optionsToCompositionModel.ts`、`migration-lab/LegacyModernDiffPanel.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/optionsToCompositionModel.ts</span>
  </div>

```ts
export const optionsToCompositionSteps: ReadonlyArray<ComponentMigrationStep> = [
  {
    step: "Characterize current behavior",
    legacyOwner: "legacy-shaped/LegacyOptionsProfile.vue",
    modernOwner: "tests/migrationInventory.test.ts",
    preservedBehavior: "Profile form starts with the same display name.",
    reviewSignal: "A PR changes behavior before a test captures it.",
  },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/migration-lab/LegacyModernDiffPanel.vue</span>
  </div>

```vue
<template>
  <div class="diff-grid">
    <LegacyOptionsProfile />
    <ModernProfileComposition />
    <LegacyMixinUsage />
    <ProfileEventContract />
  </div>
</template>
```
</div>

**逐行解释：** `step` names the review phase; `legacyOwner` points to the old behavior source; `modernOwner` points to the evidence or new owner; `preservedBehavior` is the review target; `reviewSignal` tells when to block; the diff panel renders old and modern examples side by side for behavior-first review.

**执行过程：** reviewer 按 step 检查 PR，而不是按文件名顺序阅读。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** PR 从“大量改动”拆成一组可验证 ownership moves。

**为什么得到这个结果：** migration PR 的风险来自行为漂移，不是 diff 本身。

**对比写法：** “所有 Options API 都改成 setup”不是合格 PR 描述。

**常见错误为什么错：** rubber-stamp 会让错误 owner 进入主线后难以回滚。

**与真实项目的关系：** 旧项目重构的 code review 标准必须比新功能更严。

**与当前学习主线的关系：** Chapter 14 把前 13 章知识转成 review 能力。

**最终记忆模型：** 读 migration diff 时先问 evidence，再看 syntax。

<a id="section-9-17"></a>

### 9.17 Production migration readiness：build/preview/regression/performance/error monitoring boundary

**结论：** migration readiness 必须覆盖 production output，不止本地 dev。

**本节解决的问题：** `viteMigrationChecks` 和 `testSafetyNetItems` 把 dev、build、preview、test 和 failure signal 分开。

**技术意义：** Vite dev、typecheck、unit tests、production build、preview smoke 和 monitoring 各自发现不同问题。

**概念解释：** build output 验证 bundling/env/asset；preview 验证部署后访问；regression tests 验证行为；monitoring 验证真实用户路径。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** production output 属于 build/deployment boundary，不属于 IDE 或 dev server。

**Migration 机制证据链：** legacy build assumption 是起点；old public path behavior 要保留；modern owner 是 Vite config/source; build/preview 是 output evidence。

**TypeScript / vue-tsc 编译期过程：** typecheck 先阻止 type drift；build 才验证 emitted bundle。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** production bundle 在 browser 运行；Router fallback 和 assets 要在 preview/deployment 中观察。

**API / 语法规则：** `npm run typecheck`、`npm run test:unit`、`npm run build`、`npm run preview`。

**文件结构：** `models/viteMigrationModel.ts`、`models/testSafetyNetModel.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/viteMigrationModel.ts</span>
  </div>

```ts
export const viteMigrationChecks: ReadonlyArray<ViteMigrationCheck> = [
  {
    legacyAssumption: "process.env exposes client config",
    viteBoundary: "import.meta.env exposes VITE-prefixed client values",
    requiredEvidence: "typecheck and production build",
    failureSignal: "Public value is undefined or a secret is exposed.",
  },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/models/testSafetyNetModel.ts</span>
  </div>

```ts
export const testSafetyNetItems: ReadonlyArray<TestSafetyNetItem> = [
  {
    target: "Store migration",
    behaviorUnderTest: "Profile update keeps the same state transition.",
    testFile: "tests/useProfileStore.test.ts",
    blockedSignal: "Pinia write path loses the profile id.",
  },
];
```
</div>

**逐行解释：** `legacyAssumption` records the old build behavior; `viteBoundary` names the modern tool boundary; `requiredEvidence` names the command or smoke check; `failureSignal` says what blocks readiness; `testSafetyNetItems` connects behavior to a concrete test file and blocked signal.

**执行过程：** 完成源码迁移后先 typecheck/test，再 build，再 preview smoke。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** build proof 从“本地能跑”升级为 production artifact evidence。

**为什么得到这个结果：** dev server 不等于 production bundle。

**对比写法：** 只截图页面可见不能证明 chunks、env、assets 和 fallback 正常。

**常见错误为什么错：** 忽略 monitoring 会让低频路由或 env 问题上线后才暴露。

**与真实项目的关系：** 迁移发布需要 error monitoring、performance baseline 和 rollback release。

**与当前学习主线的关系：** Chapter 11 的 deployment readiness 在这里成为迁移验收。

**最终记忆模型：** migration done means verified output, not edited source.

<a id="section-9-18"></a>

### 9.18 Chapter integration：how migration connects Chapters 01-13

**结论：** Chapter 14 是前 13 章能力的综合使用场景。

**本节解决的问题：** `MigrationModernizationChapterApp.vue` 把 component、Router、Pinia、Vite、TypeScript、testing、deployment 和 Nuxt boundary 都放进一个 migration lab。

**技术意义：** 迁移旧项目时，你会同时遇到 root app、SFC、composables、router、store、forms、API、tests、build 和 SSR/Nuxt 决策。

**概念解释：** Chapter 14 不再学习单点 API，而是学习如何判断哪个前置知识拥有某个迁移风险。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** 每个 boundary 都对应前面章节的 owner。

**Migration 机制证据链：** Chapter 01 createApp、Chapter 04 composables、Chapter 06 router、Chapter 07 Pinia、Chapter 10 tests、Chapter 11 build 都成为 migration evidence。

**TypeScript / vue-tsc 编译期过程：** Chapter 05 的 `vue-tsc` 在本章检查所有新增 `.vue` 和 `.ts` 文件。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** Root shell 渲染 Chapter 14 panel；Pinia store 被 root app install 后可运行；Vite 编译所有 imports。

**API / 语法规则：** `createApp`、`ref`、`computed`、`defineEmits`、`createWebHistory`、`defineStore`、`import.meta.env`、Vitest APIs。

**文件结构：** `chapter-01-application-boundary/App.vue` 新增 Chapter 14 import and render。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-01-application-boundary/App.vue</span>
  </div>

```vue
<script setup lang="ts">
import MigrationModernizationChapterApp from "../chapter-14-migration-modernization/MigrationModernizationChapterApp.vue";
</script>

<template>
  <div class="chapter-divider" role="separator"></div>
  <MigrationModernizationChapterApp />
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/MigrationModernizationChapterApp.vue</span>
  </div>

```vue
<template>
  <MigrationRiskDashboard />
  <MigrationInventoryPanel />
  <LegacyModernDiffPanel />
</template>
```
</div>

**逐行解释：** root shell import creates the component binding; divider preserves chapter order; `<MigrationModernizationChapterApp />` mounts Chapter 14 without replacing earlier chapters; Chapter 14 app then renders dashboard, inventory and diff panels as its local children.

**执行过程：** Vite 加载 root app，Vue render Chapter 01-14，Chapter 14 子 panels 读取模型和 store。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** 前置章节从学习材料变成迁移判断工具。

**为什么得到这个结果：** 真实迁移不是单 API 题，而是跨边界综合题。

**对比写法：** 只学习 Vue 3 syntax 不足以安全接手 Vue 2/Vuex/webpack 项目。

**常见错误为什么错：** 跳过 Chapter 10/11 会导致“改完能跑”但不能证明可发布。

**与真实项目的关系：** 架构迁移通常需要多人协作和跨层证据。

**与当前学习主线的关系：** 这是 Vue 路线从实现能力进入维护能力的转折点。

**最终记忆模型：** Chapter 14 把知识点变成迁移决策。

<a id="section-9-19"></a>

### 9.19 Final integration：vue-migration-modernization-lab 如何形成真实迁移方法论

**结论：** `vue-migration-modernization-lab` 的产出是方法论：inventory、modern target、tests、dashboard、rollback。

**本节解决的问题：** 最终 lab 把所有 Chapter 14 文件组合成可运行的 migration rehearsal。

**技术意义：** 你不是记住“旧 API -> 新 API”，而是学会证明“旧行为 -> 新 owner”没有退化。

**概念解释：** lab 中每个 legacy-shaped file 都有 modernized file、panel 和至少一个 evidence path。

**边界：legacy runtime、modern Vue runtime、compiler macro、component public contract、router runtime、store ownership、build tooling、TypeScript diagnostic、test safety net、production output、rollback artifact：** final integration 覆盖所有边界，但不安装 legacy dependencies。

**Migration 机制证据链：** legacy source 在 `legacy-shaped/`；modern target 在 `modernized/`；evidence 在 `tests/` 和 `migration-lab/`；rollback 在 `rollbackModel.ts`。

**TypeScript / vue-tsc 编译期过程：** typecheck 验证 all source imports、SFC bindings、Pinia store 和 Router model types。

**Vue / Router / Pinia / Vite / Browser 运行时过程：** Browser 展示 app；Vue 更新 forms；Pinia 更新 store；Vite dev/build 验证 module graph。

**API / 语法规则：** Vue 3 SFC、Composition API、Pinia、Router model、Vitest、Vite env。

**文件结构：** `src/learning/vue/chapter-14-migration-modernization/`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/MigrationModernizationChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import BuildToolMigrationPanel from "./migration-lab/BuildToolMigrationPanel.vue";
import LegacyModernDiffPanel from "./migration-lab/LegacyModernDiffPanel.vue";
import MigrationInventoryPanel from "./migration-lab/MigrationInventoryPanel.vue";
import MigrationRiskDashboard from "./migration-lab/MigrationRiskDashboard.vue";
import RollbackPlanPanel from "./migration-lab/RollbackPlanPanel.vue";
import RouterMigrationPanel from "./migration-lab/RouterMigrationPanel.vue";
import StoreMigrationPanel from "./migration-lab/StoreMigrationPanel.vue";
import TestSafetyNetPanel from "./migration-lab/TestSafetyNetPanel.vue";
</script>
```
</div>

**逐行解释：** each import names one final lab panel; dashboard owns risk summary, inventory owns approval gate, diff owns behavior comparison, router/store/build/test/rollback panels own their specific evidence; the app component composes these panels but does not mutate the model files directly.

**执行过程：** 用户打开 learning shell，看到 migration dashboard，修改 forms，触发 store update，运行 tests 和 build。

**legacy source、migration adapter、modern target、test evidence、runtime behavior、build output、risk score 与 rollback path 的变化：** 旧概念被保留为 teaching source，新实现拥有 runtime，tests 证明行为，rollback map 保留恢复路径。

**为什么得到这个结果：** 方法论能迁移到真实项目，孤立 API 对照表不能。

**对比写法：** 创建真实 Vue 2 app 会扩大本章范围并引入无关依赖。

**常见错误为什么错：** 为教学安装 Vuex/webpack 会把练习变成旧工具搭建，而不是现代迁移判断。

**与真实项目的关系：** lab 对应真实项目的 migration rehearsal 和 PR template。

**与当前学习主线的关系：** 它把 Vue 3 学习项目提升为 legacy modernization practice。

**最终记忆模型：** 每次迁移都要回答：保留什么行为，由谁接管，用什么证明，失败怎么回退。

<a id="section-9-20"></a>

### 9.20 Template directive migration：v-model、key、v-if / v-for、v-bind、keyCode 与 DOM identity

**结论：** template directive 迁移不是替换模板字符串，而是重新确认“数据 owner、DOM identity、事件 owner、attribute override order”。`v-model` 影响 parent-child 数据同步，`key` 影响 vnode identity，`v-if` / `v-for` 影响 render scope，`v-bind` 影响最终 attribute owner，`keyCode` 影响 keyboard event 触发条件。

**Legacy pattern：** `value` + `input` 或 `model` option、复用 key、同一元素同时承担 `v-if` 和 `v-for`、依赖旧 `v-bind` merge order、使用 numeric `keyCode` modifier。

**Modern replacement：** 使用 `modelValue` + `update:modelValue`；每个 branch 和 list item 使用稳定唯一 key；把过滤逻辑移到 computed / named predicate；显式决定 static attributes 与 object `v-bind` 的覆盖顺序；把 numeric `keyCode` 迁移为 named key modifier 或 `KeyboardEvent.key` predicate。

**Runtime behavior preserved：** parent 仍然拥有 source value；DOM node 仍然跟随 data identity 而不是 index；条件列表仍然显示同一组业务数据；最终 DOM attribute 仍然由预期 owner 决定；键盘快捷键仍然触发同一业务动作。

**TypeScript boundary：** `defineEmits` 可以检查 `update:modelValue` payload，但不能证明 DOM reuse 正确；filtered list 的 item type 可以被检查，但 `v-if` / `v-for` priority 是 template runtime/compiler 语义；`KeyboardEvent.key` 是 platform API，不是 Vue type guarantee。

**Test / validation evidence：** `legacy-shaped/legacyTemplateDirectiveExamples.ts` 保留旧 pattern；`modernized/templateDirectiveMigration.ts` 展示 modern mapping；`tests/templateDirectiveMigration.test.ts` 检查 model contract、filtered list、`v-bind` merge order 和 keyboard predicate。

**代码证据：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyTemplateDirectiveExamples.ts</span>
  </div>

```ts
export const legacyModelContract: LegacyModelContract = {
  prop: "value",
  event: "input",
};

export const legacyIndexKeyExamples: ReadonlyArray<LegacyKeyExample> = [
  {
    index: 0,
    reusedKey: "row",
    label: "Primary row",
  },
  {
    index: 1,
    reusedKey: "row",
    label: "Secondary row",
  },
];

export const legacyTemplateDirectiveExamples: ReadonlyArray<LegacyDirectiveExample> =
  [
    { topic: "v-if-v-for", legacyPattern: "Filter and iterate on the same element" },
    { topic: "v-bind", legacyPattern: "Static attrs rely on old merge priority" },
    { topic: "keyCode", legacyPattern: "Numeric keyCode modifier controls shortcut behavior" },
  ];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/templateDirectiveMigration.ts</span>
  </div>

```ts
export function createModernModelContract(contract: LegacyModelContract): ModelContract {
  if (contract.prop !== "value" || contract.event !== "input") {
    throw new Error("Unsupported legacy model contract");
  }

  return {
    prop: "modelValue",
    event: "update:modelValue",
  };
}

export function filterVisibleItems(items: ReadonlyArray<ListItem>): ReadonlyArray<ListItem> {
  return items.filter((item) => item.visible);
}

export function createStableKeyMap(
  items: ReadonlyArray<ListItem>,
): ReadonlyArray<string> {
  return items.map((item) => item.id);
}

export function mergeAttributesInVue3Order(input: AttributeMergeInput): string {
  const values =
    input.order === "static-first"
      ? [input.staticValue, input.boundValue]
      : [input.boundValue, input.staticValue];

  return values.filter((value) => value.length > 0).join(" ");
}

export function isSubmitKeyboardEvent(eventKey: string): boolean {
  return eventKey === "Enter";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/templateDirectiveMigration.test.ts</span>
  </div>

```ts
it("maps the legacy model contract to the modern event contract", () => {
  expect(createModernModelContract(legacyModelContract)).toEqual({
    prop: "modelValue",
    event: "update:modelValue",
  });
});

it("moves v-if and v-for behavior into a filtered collection owner", () => {
  expect(filterVisibleItems(items).map((item) => item.id)).toEqual(["active"]);
  expect(createStableKeyMap(items)).toEqual(["active", "hidden"]);
});

it("makes v-bind merge order explicit", () => {
  expect(
    mergeAttributesInVue3Order({
      staticValue: "card",
      boundValue: "selected",
      order: "static-first",
    }),
  ).toBe("card selected");
});

it("uses named keyboard values instead of numeric keyCode checks", () => {
  expect(isSubmitKeyboardEvent("Enter")).toBe(true);
  expect(isSubmitKeyboardEvent("Escape")).toBe(false);
});
```
</div>

**代码逐行解释：** legacy `value` / `input` contract marks the old `v-model` owner; repeated `reusedKey` rows model unsafe DOM identity; `createModernModelContract` rejects unsupported legacy contracts before returning `modelValue` / `update:modelValue`; `filterVisibleItems` moves `v-if` / `v-for` filtering into JavaScript; `mergeAttributesInVue3Order` makes `v-bind` override order explicit; the test replaces numeric `keyCode` with named keyboard values.

**Failure signal：** input 修改后 parent state 不变；重排列表后 input state 出现在错误行；`aria-*`、class 或 id 被意外覆盖；快捷键在一个浏览器有效、另一个浏览器失效。

**Rollback / compatibility strategy：** 先保留 wrapper 同时发出 legacy event 与 modern event；每次只迁移一个 directive family；保留旧 predicate 名称作为测试输入，等 caller 全部迁移后删除 adapter。

<a id="section-9-21"></a>

### 9.21 Removed instance APIs：events API、$children、propsData、$destroy、$set / $delete 与 owner replacement

**结论：** removed instance APIs 的迁移重点是把“隐式 instance capability”改成“显式 owner”。`$children`、`$set`、`$delete`、`$destroy`、events API 和 `propsData` 在旧项目里经常不是孤立 API，而是隐藏了 parent-child lookup、dynamic object shape、teardown ownership、event ownership 和 test setup ownership。

**Legacy pattern：** parent 用 `$children` 按渲染顺序找 child；动态字段用 `$set` / `$delete` 保持 Vue 2 reactivity；imperative flow 调 `$destroy`；component instance 当 event bus 使用 `$on` / `$off` / `$once`；Vue Test Utils v1 用 `propsData`。

**Modern replacement：** 使用 template refs、explicit child registration 或 prop-driven state；在 reactive proxy 上 assignment / delete，或用 immutable replacement；用 conditional rendering、app unmount 或 effect cleanup 接管 teardown；用 props/emits、provide/inject、scoped emitter 或 Pinia action 接管 event owner；测试使用 `props`。

**Runtime behavior preserved：** parent 仍能调用正确 child capability；新增和删除字段仍能影响渲染输出；外部 listener/timer 仍会在 owner teardown 时清理；publisher/subscriber 仍能传递同一 domain event；测试仍用同一 initial prop values mount component。

**TypeScript boundary：** TypeScript 可以约束 `Record<string, string | undefined>` 或 props shape，但不能证明 `$children` 旧顺序稳定，也不能证明 cleanup 实际执行；event bus 需要显式 event map 才能获得 payload typing。

**Test / validation evidence：** `legacy-shaped/legacyRemovedApisModel.ts` 保存 removed API risk；`models/removedApiMigrationModel.ts` 建立 replacement map；`modernized/removedApiReplacement.ts` 提供 record operation、explicit child lookup 与 `props` test input；`tests/removedApiReplacement.test.ts` 锁定行为。

**代码证据：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyRemovedApisModel.ts</span>
  </div>

```ts
export const legacyRemovedApiUsages: ReadonlyArray<LegacyRemovedApiUsage> = [
  {
    api: "$children",
    legacyIntent: "Reach a child instance by render order.",
    hiddenRisk: "The target changes when conditional rendering or fragments are introduced.",
  },
  {
    api: "$set",
    legacyIntent: "Add a dynamic reactive field.",
    hiddenRisk: "The object shape stays unclear to TypeScript and reviewers.",
  },
  {
    api: "$delete",
    legacyIntent: "Remove a dynamic reactive field.",
    hiddenRisk: "Derived output may keep stale optional-field assumptions.",
  },
  {
    api: "$destroy",
    legacyIntent: "Force component teardown from imperative code.",
    hiddenRisk: "Cleanup ownership is detached from render ownership.",
  },
  {
    api: "events-api",
    legacyIntent: "Use $on and $off on an instance event bus.",
    hiddenRisk: "Publisher and subscriber ownership is hidden from the component tree.",
  },
  {
    api: "propsData",
    legacyIntent: "Mount tests with initial props.",
    hiddenRisk: "Test helpers drift from current Vue Test Utils options.",
  },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/removedApiReplacement.ts</span>
  </div>

```ts
export function setReactiveField(
  record: DynamicRecord,
  key: string,
  value: string,
): DynamicRecord {
  return {
    ...record,
    [key]: value,
  };
}

export function deleteReactiveField(record: DynamicRecord, key: string): DynamicRecord {
  const nextRecord: Record<string, string | undefined> = { ...record };
  delete nextRecord[key];
  return nextRecord;
}

export function createChildRegistry(
  children: ReadonlyArray<ChildCapability>,
): ChildRegistry {
  return {
    children,
    findById(id: string): ChildCapability {
      return selectChildById(children, id);
    },
  };
}

export function createCleanupOwner(
  registeredLabels: ReadonlyArray<string> = [],
): CleanupOwner {
  return {
    registeredLabels,
    registerCleanup(label: string): CleanupOwner {
      return createCleanupOwner([...registeredLabels, label]);
    },
  };
}

export function createTestMountProps<TProps extends Record<string, unknown>>(
  props: TProps,
): { readonly props: TProps } {
  return { props };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/removedApiReplacement.test.ts</span>
  </div>

```ts
it("replaces set and delete helpers with explicit record operations", () => {
  const initialRecord: DynamicRecord = { name: "Ada" };
  const withRole = setReactiveField(initialRecord, "role", "admin");
  const withoutName = deleteReactiveField(withRole, "name");

  expect(withRole).toEqual({ name: "Ada", role: "admin" });
  expect(withoutName).toEqual({ role: "admin" });
});

it("selects child capability by explicit id instead of render order", () => {
  const children: ReadonlyArray<ChildCapability> = [
    { id: "search", canFocus: true },
    { id: "submit", canFocus: false },
  ];

  expect(createChildRegistry(children).findById("submit")).toEqual({
    id: "submit",
    canFocus: false,
  });
});

it("registers cleanup ownership without manual destroy", () => {
  const cleanupOwner = createCleanupOwner().registerCleanup("profile-listener");

  expect(cleanupOwner.registeredLabels).toEqual(["profile-listener"]);
});
```
</div>

**代码逐行解释：** legacy model names the removed APIs and their hidden risk; `createChildRegistry` replaces `$children` order lookup with id lookup; `createCleanupOwner` replaces manual `$destroy` cleanup with explicit cleanup ownership; the test proves cleanup registration is visible and does not depend on imperative component destruction.

**Failure signal：** conditional branch 改变后 parent 调错 child；新增字段在 UI 中不可见；删除字段仍出现在 derived output；navigation 后旧 timer 继续运行；测试 mount 后 props 为空。

**Rollback / compatibility strategy：** 先建立 adapter 层，把旧 API caller 收敛到少数函数；每删除一个 removed API，都要求有明确 owner、test evidence 和恢复路径。

<a id="section-9-22"></a>

### 9.22 Functional components and async components：functional shape、defineAsyncComponent 与 route lazy loading boundary

**结论：** functional component 和 async component 迁移要区分“组件 render ownership”和“模块加载 ownership”。`defineAsyncComponent` 用于异步组件 wrapper；route lazy loading 是 Router 的 component loader，不需要再包一层 `defineAsyncComponent`。

**Legacy pattern：** Vue 2 functional SFC 使用 `functional` 标记和特殊 render context；async component 可能直接返回 Promise、带 legacy options，或者和 route lazy loading 混在一起。

**Modern replacement：** 函数式组件改成普通函数组件或普通 SFC；异步组件使用 `defineAsyncComponent` 包装 loader；Router route record 的 `component: () => import(...)` 保持 Router-owned lazy loading。

**Runtime behavior preserved：** 无状态展示组件仍然只根据 props / slots 输出 UI；异步组件仍然在需要时加载；route chunk 仍然按 navigation 分割。

**TypeScript boundary：** functional props、slot 函数和 async loader result 需要显式类型；TypeScript 能检查 Promise 返回值，但不能证明 loading/error UI 对用户体验足够。

**Test / validation evidence：** 本章不引入 Vue 2 async dependency；official API 记录在 `## 10`；需要真实迁移时应增加 component smoke 和 route chunk smoke。

**代码证据：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyFunctionalAsyncModel.ts</span>
  </div>

```ts
export const legacyFunctionalAsyncShapes: ReadonlyArray<LegacyFunctionalAsyncShape> =
  [
    {
      kind: "functional",
      legacyPattern: "Functional SFC flag with render context",
      migrationRisk: "Props and slots can drift when the context object is removed.",
    },
    {
      kind: "async",
      legacyPattern: "Async component loader mixed with route lazy loading",
      migrationRisk: "Component loading and route chunk loading get the same owner by mistake.",
    },
  ];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/functionalAsyncMigration.ts</span>
  </div>

```ts
export function createGeneralAsyncComponent(loader: ComponentLoader): Component {
  return defineAsyncComponent(loader);
}

export function createRouteLazyComponent(loader: ComponentLoader): ComponentLoader {
  return loader;
}

export function describeAsyncMigrationTarget(
  target: "general" | "route",
): "defineAsyncComponent" | "route-lazy-loader" {
  return target === "general" ? "defineAsyncComponent" : "route-lazy-loader";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/functionalAsyncMigration.test.ts</span>
  </div>

```ts
it("keeps route lazy loading as a router-owned loader", () => {
  const loader: ComponentLoader = async () => ({ default: loadedComponent });

  expect(createRouteLazyComponent(loader)).toBe(loader);
  expect(describeAsyncMigrationTarget("general")).toBe("defineAsyncComponent");
  expect(describeAsyncMigrationTarget("route")).toBe("route-lazy-loader");
});
```
</div>

**代码逐行解释：** legacy model separates functional SFC risk from async loader risk; `createGeneralAsyncComponent` wraps a general component loader with `defineAsyncComponent`; `createRouteLazyComponent` returns the loader unchanged because Router owns route lazy loading; the test proves the route loader reference is preserved while the general async target is named separately.

**Failure signal：** async component 永远停留在 loading 状态；route lazy component 被额外 wrapper 破坏 props / route meta；functional slot payload 变成 `unknown` 或渲染为空。

**Rollback / compatibility strategy：** 先迁移 leaf display components；route lazy loading 与 general async component 分开 review；保留原 route record mapping，直到 `router.isReady` 后的初始 route smoke 通过。

<a id="section-9-23"></a>

### 9.23 Render function, slots unification and VNode lifecycle：h、slot functions、onVnode hooks 与 review risk

**结论：** render function 迁移风险高，因为它绕开 template 的可读约束，直接操作 VNode shape。Vue 3 中 `h` 从 Vue import，slots 统一为函数，VNode lifecycle event 变成 `onVnodeMounted` / `onVnodeUnmounted` 这类 prop。

**Legacy pattern：** render 函数接收 `h` 参数；`scopedSlots`、`slot`、`attrs`、`domProps`、`on` 等 VNode data shape 混在一起；VNode lifecycle 用 legacy hook names。

**Modern replacement：** 显式 import `h`；children 使用 slot functions；props / attrs / event listeners 归一到新的 VNode prop shape；VNode lifecycle 使用 `onVnode...` props。

**Runtime behavior preserved：** 手写 render 仍然创建同一层级的 DOM；slot caller 仍然收到同一 payload；mount/unmount side effect 仍然发生在同一生命周期阶段。

**TypeScript boundary：** VNode props、slot function parameter 和 return type 需要 typed helper；TypeScript 能限制 prop shape，但不能判断手写 VNode tree 是否表达了原模板意图。

**Test / validation evidence：** `legacy-shaped/legacyRenderFunctionModel.ts` 保存 legacy shape；`modernized/renderFunctionMigration.ts` 输出 `h`、slot function 和 VNode lifecycle mapping。真实项目中还应加 snapshot-free DOM assertion，避免把实现细节固定死。

**代码证据：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyRenderFunctionModel.ts</span>
  </div>

```ts
export const legacyRenderFunctionShapes: ReadonlyArray<LegacyRenderFunctionShape> = [
  {
    topic: "h-argument",
    legacyPattern: "render receives h as an argument",
    modernTarget: "import h from vue in the render owner",
  },
  {
    topic: "vnode-lifecycle",
    legacyPattern: "hook insert and destroy are nested in VNode data",
    modernTarget: "onVnodeMounted and onVnodeUnmounted props",
  },
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/renderFunctionMigration.ts</span>
  </div>

```ts
export function migrateRenderFunctionShape(input: SlotInput): RenderMigrationResult {
  return {
    importedHelper: "h",
    slotMode: "function",
    mountedHook: "onVnodeMounted",
    unmountedHook: "onVnodeUnmounted",
    slotText: input.title,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/renderFunctionMigration.test.ts</span>
  </div>

```ts
it("maps slot text and vnode lifecycle ownership", () => {
  expect(migrateRenderFunctionShape({ title: "Profile" })).toEqual({
    importedHelper: "h",
    slotMode: "function",
    mountedHook: "onVnodeMounted",
    unmountedHook: "onVnodeUnmounted",
    slotText: "Profile",
  });
});
```
</div>

**代码逐行解释：** legacy model records the `h` argument and VNode hook shape; modern function returns imported helper ownership, slot function mode and VNode lifecycle prop names; the test verifies slot text and lifecycle hook mapping together.

**Failure signal：** slot 内容渲染成 `[object Object]`；listener 没有绑定；VNode lifecycle hook 不执行；reviewer 无法从 diff 看出 DOM tree 是否等价。

**Rollback / compatibility strategy：** 优先把 render function 改回 template 或小型 wrapper；无法改回 template 时，先建立 typed helper，保持 legacy adapter 到所有 callers 迁移完成。

<a id="section-9-24"></a>

### 9.24 Custom directives, custom elements and attribute coercion：hook rename、compiler boundary 与 DOM contract

**结论：** custom directive 迁移是 DOM lifecycle contract 迁移；custom elements 是 compiler/runtime boundary 迁移；attribute coercion 是 DOM output 语义迁移。三者都不能只靠 typecheck 判断成功。

**Legacy pattern：** directive 使用 `bind`、`inserted`、`update`、`componentUpdated`、`unbind`；custom element 识别依赖旧配置；boolean / enumerated attribute 依赖旧 coercion 输出。

**Modern replacement：** directive hook 映射到 `beforeMount`、`mounted`、`updated`、`unmounted`；custom elements 通过 compiler option / Vite Vue plugin 配置识别；attribute coercion 以 Vue 3 DOM output 规则为准并加 smoke evidence。

**Runtime behavior preserved：** DOM integration 仍在元素插入后初始化、更新后同步、卸载时清理；web component 不被误当成 Vue component；最终 DOM attribute 仍满足浏览器和第三方库要求。

**TypeScript boundary：** directive binding value 可以 typed；custom elements 配置属于 compiler/tooling；attribute coercion 是 browser-visible DOM 行为，不能只靠 TypeScript。

**Test / validation evidence：** `legacy-shaped/legacyDirectiveModel.ts` 和 `modernized/directiveMigration.ts` 提供 hook mapping；真实项目需要 DOM assertion 或 visual smoke 确认第三方 DOM integration 没有泄漏。

**代码证据：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyDirectiveModel.ts</span>
  </div>

```ts
export const legacyDirectiveHookMappings: ReadonlyArray<LegacyDirectiveHookMapping> =
  [
    {
      legacyHook: "bind",
      modernHook: "beforeMount",
      lifecycleMeaning: "Prepare DOM integration before the element is inserted.",
    },
    {
      legacyHook: "inserted",
      modernHook: "mounted",
      lifecycleMeaning: "Run DOM integration after the element is in the document.",
    },
    {
      legacyHook: "unbind",
      modernHook: "unmounted",
      lifecycleMeaning: "Clean up external DOM integration.",
    },
  ];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/directiveMigration.ts</span>
  </div>

```ts
export function createCustomElementCompilerConfig(
  rules: ReadonlyArray<LegacyCustomElementRule> = legacyCustomElementRules,
): CustomElementCompilerConfig {
  return {
    customElementTags: rules
      .filter((rule) => rule.shouldBeCustomElement)
      .map((rule) => rule.tagName),
  };
}

export function findAttributeCoercionCheck(
  attributeName: string,
  checks: ReadonlyArray<LegacyAttributeCoercionCheck> = legacyAttributeCoercionChecks,
): LegacyAttributeCoercionCheck {
  const check = checks.find((entry) => entry.attributeName === attributeName);

  if (!check) {
    throw new Error(`Missing attribute coercion check: ${attributeName}`);
  }

  return check;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/directiveMigration.test.ts</span>
  </div>

```ts
it("maps legacy directive hooks to modern hooks", () => {
  expect(mapLegacyDirectiveHook("bind").modernHook).toBe("beforeMount");
  expect(mapLegacyDirectiveHook("inserted").modernHook).toBe("mounted");
  expect(mapLegacyDirectiveHook("unbind").modernHook).toBe("unmounted");
});

it("builds custom element compiler config from review rules", () => {
  expect(createCustomElementCompilerConfig().customElementTags).toEqual([
    "design-card",
  ]);
});

it("keeps attribute coercion checks explicit", () => {
  expect(findAttributeCoercionCheck("aria-hidden").expectedDomValue).toBe(
    "false",
  );
});
```
</div>

**代码逐行解释：** legacy mapping keeps `bind`, `inserted` and `unbind` visible; modern config derives compiler custom-element tags from review rules; attribute coercion lookup fails loudly when a DOM-output check is missing; the test proves old hook names map to the expected modern lifecycle hooks.

**Failure signal：** directive 在元素插入前读取不到 DOM；cleanup 不执行；web component 被 Vue warning；attribute 被移除或字符串化后第三方库失效。

**Rollback / compatibility strategy：** 对 directive 使用小型 hook translation map；custom elements 先在 build config 中隔离配置；attribute coercion 改动必须附带浏览器 DOM evidence。

<a id="section-9-25"></a>

### 9.25 Transition and TransitionGroup migration：class phase rename、stable keys 与 visual smoke evidence

**结论：** Transition 迁移的核心是 class phase 语义变化；`TransitionGroup` 迁移的核心是 list identity 和 move phase。动画属于用户可见 runtime behavior，需要 visual 或 DOM smoke evidence。

**Legacy pattern：** 旧 enter/leave class 使用 `*-enter`、`*-leave`；list transition 假设 item key 足够稳定；CSS 可能只覆盖旧 phase name。

**Modern replacement：** 使用 `*-enter-from`、`*-enter-active`、`*-enter-to`、`*-leave-from`、`*-leave-active`、`*-leave-to`；`TransitionGroup` item 必须有稳定 key；move class 与 layout 变化一起验证。

**Runtime behavior preserved：** 元素进入、离开和列表移动仍然保持同一视觉节奏；用户不会看到闪烁、跳帧或错位。

**TypeScript boundary：** class names 是字符串和 CSS contract，TypeScript 只能检查引用位置，不能证明动画阶段正确。

**Test / validation evidence：** `legacy-shaped/legacyTransitionClassModel.ts` 与 `modernized/transitionMigration.ts` 保存 class mapping；真实项目应配合 visual smoke、DOM class assertion 或关键路径人工验收。

**代码证据：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyTransitionClassModel.ts</span>
  </div>

```ts
export const legacyTransitionClassMappings: ReadonlyArray<LegacyTransitionClassMapping> =
  [
    {
      legacyClass: "fade-enter",
      modernClass: "fade-enter-from",
      phase: "Initial enter state before the first frame.",
    },
    {
      legacyClass: "list-move",
      modernClass: "list-move",
      phase: "TransitionGroup movement phase that still needs stable item keys.",
    },
  ];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/transitionMigration.ts</span>
  </div>

```ts
export function mapLegacyTransitionClass(legacyClass: string): string {
  const mapping = legacyTransitionClassMappings.find(
    (entry) => entry.legacyClass === legacyClass,
  );

  if (!mapping) {
    throw new Error(`Missing transition class mapping: ${legacyClass}`);
  }

  return mapping.modernClass;
}

export function hasStableTransitionGroupKeys(
  keys: ReadonlyArray<string>,
): boolean {
  return new Set(keys).size === keys.length && keys.every((key) => key.length > 0);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/transitionMigration.test.ts</span>
  </div>

```ts
it("maps legacy transition class phases", () => {
  expect(mapLegacyTransitionClass("fade-enter")).toBe("fade-enter-from");
  expect(mapLegacyTransitionClass("fade-leave")).toBe("fade-leave-from");
});

it("requires stable keys for transition group movement", () => {
  expect(requiresStableTransitionGroupKey("move")).toBe(true);
  expect(hasStableTransitionGroupKeys(["profile-1", "profile-2"])).toBe(true);
  expect(hasStableTransitionGroupKeys(["profile-1", "profile-1"])).toBe(false);
});
```
</div>

**代码逐行解释：** legacy mapping records old and new class names; `mapLegacyTransitionClass` fails when a class is not reviewed; `hasStableTransitionGroupKeys` rejects empty or duplicate keys; the test proves `TransitionGroup` movement requires stable item identity.

**Failure signal：** enter 动画从最终状态开始；leave 动画不执行；`TransitionGroup` reorder 时元素跳动；旧 class 被保留但现代 class 缺失。

**Rollback / compatibility strategy：** 临时保留 dual class alias；先验证最重要的 route/page transition，再迁移小型 list transition。

<a id="section-9-26"></a>

### 9.26 Watch array behavior and deep option migration：replacement trigger、mutation trigger 与 rollback adapter

**结论：** Vue 3 的 `watch array` 默认更偏向 replacement trigger；如果旧代码依赖 array mutation 触发 watcher，需要显式 `deep` 或重写为更清晰的 derived state / domain action。

**Legacy pattern：** watcher 监听数组，并期待 `push`、`splice`、index assignment 这类 mutation 自动触发 callback。

**Modern replacement：** 如果业务只关心整体替换，保持默认 replacement-only；如果业务确实关心内部 mutation，显式配置 deep watch；如果 callback 实际是在同步派生数据，优先改成 computed 或 action owner。

**Runtime behavior preserved：** replacement、mutation、derived side effect 三种意图被拆开；旧 callback 只有在真实业务需要时继续触发。

**TypeScript boundary：** TypeScript 能检查 array item shape，但不能说明 watcher 何时触发；trigger timing 是 Vue reactivity runtime behavior。

**Test / validation evidence：** `modernized/watchArrayMigration.ts` 用 `shouldArrayWatcherRun` 表达 replacement 和 deep mutation 边界；`tests/watchArrayMigration.test.ts` 验证 replacement-only 与 deep-mutation 两种模式。

**代码证据：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/legacy-shaped/legacyWatchArrayModel.ts</span>
  </div>

```ts
export const legacyWatchArrayAssumptions: ReadonlyArray<LegacyWatchArrayAssumption> =
  [
    {
      sourceName: "selectedProfiles",
      mutationName: "push",
      expectedTrigger: true,
    },
    {
      sourceName: "selectedProfiles",
      mutationName: "splice",
      expectedTrigger: true,
    },
  ];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/watchArrayMigration.ts</span>
  </div>

```ts
export function shouldArrayWatcherRun(change: ArrayWatchChange): boolean {
  if (change.replaced) {
    return true;
  }

  return change.mutated && change.deep;
}

export function describeArrayWatchMode(deep: boolean): "replacement-only" | "deep-mutation" {
  return deep ? "deep-mutation" : "replacement-only";
}

export function calculateVisibleItemCount(
  items: ReadonlyArray<{ readonly visible: boolean }>,
): number {
  return items.filter((item) => item.visible).length;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/tests/watchArrayMigration.test.ts</span>
  </div>

```ts
it("runs for replacement without deep tracking", () => {
  expect(
    shouldArrayWatcherRun({
      replaced: true,
      mutated: false,
      deep: false,
    }),
  ).toBe(true);
});

it("requires deep tracking for mutation-only changes", () => {
  expect(
    shouldArrayWatcherRun({
      replaced: false,
      mutated: true,
      deep: false,
    }),
  ).toBe(false);
});

it("uses derived computation when a watcher is only calculating state", () => {
  expect(
    calculateVisibleItemCount([
      { visible: true },
      { visible: false },
      { visible: true },
    ]),
  ).toBe(2);
});
```
</div>

**代码逐行解释：** legacy model records old `push` and `splice` trigger assumptions; `shouldArrayWatcherRun` returns true for replacement and only returns true for mutation when `deep` is explicit; `calculateVisibleItemCount` shows the computed/action alternative when a watcher only derives state; the test proves mutation does not trigger without deep intent.

**Failure signal：** `push` 后统计数字不更新；深层 mutation 导致过度 callback 和性能回退；callback 顺序变化导致 UI 显示旧值。

**Rollback / compatibility strategy：** 先把旧 watcher 包成 named adapter，记录它依赖 replacement 还是 mutation；只有当对应 tests 通过后，才移除 adapter 或改为 computed/action。

## 10. API / 语法索引

| API / syntax | Migration meaning |
| --- | --- |
| `createApp` | App instance boundary replaces global `new Vue` mutation |
| `app.use` / `app.component` / `app.directive` / `app.mixin` | Plugin, component, directive and mixin registration become app-local |
| `app.config.globalProperties` | Replaces broad prototype mutation with app-owned globals |
| `app.provide` | App-level dependency injection replaces global plugin side effects when appropriate |
| `app.mount` | Mount no longer replaces the mount element in the same way as Vue 2 |
| `data()` | Component data must be a function to preserve instance isolation |
| `modelValue` / `update:modelValue` | Component `v-model` default contract replaces `value` / `input` |
| Multiple `v-model` bindings | Replaces legacy `model` option and `.sync` style owner confusion |
| `emits` / `defineEmits` | Declares public component event contract and removes ambiguity with fallthrough listeners |
| `.native` removal | Parent DOM listener must become an explicit component event or owned DOM target |
| `$attrs` listener inclusion | `$listeners` is removed; listeners not declared in `emits` fall through through `$attrs` |
| `class` / `style` fallthrough | Public wrapper styling must be assigned to the intended element |
| `key` | Branch and list identity must be stable and unique |
| `v-if` with `v-for` | Priority changed enough that filtering should move to computed data or wrapper conditions |
| `v-bind` merge order | Attribute override behavior follows order and must be reviewed explicitly |
| `keyCode` removal | Numeric keyboard modifiers migrate to named key modifiers or `KeyboardEvent.key` predicates |
| Filters removal | Template pipes migrate to computed values, methods or imported pure functions |
| Inline template removal | Markup ownership moves into SFC/template source instead of parent inline strings |
| Events API removal | `$on` / `$off` / `$once` migrate to props/emits, provide/inject, scoped emitter or store action |
| `$children` removal | Parent-child access migrates to template refs or explicit registration |
| `$set` / `$delete` removal | Dynamic reactive fields use proxy assignment/delete or object replacement |
| `$destroy` removal | Teardown becomes render/app/effect ownership instead of imperative instance destroy |
| `propsData` removal in tests | Vue Test Utils migration uses `props` in mount options |
| Functional component migration | Legacy `functional` component shape becomes a function component or ordinary SFC |
| `defineAsyncComponent` | Async component wrapper for component loading, not a route lazy-loading requirement |
| `h` import | Render functions import `h` instead of receiving it as a render argument |
| Slots unification | Slots are functions and should be treated as callable render inputs |
| VNode lifecycle props | Legacy VNode hooks migrate to `onVnodeMounted`, `onVnodeUpdated`, `onVnodeUnmounted` style props |
| Directive hook names | `bind` / `inserted` / `unbind` migrate to `beforeMount` / `mounted` / `unmounted` and related hooks |
| Custom elements compiler option | Custom element recognition moves to compiler/tooling configuration |
| Attribute coercion changes | DOM output for false / enumerated attributes must be verified with browser-visible evidence |
| Transition class names | `*-enter` and `*-leave` phase assumptions migrate to `*-enter-from` and `*-leave-from` |
| `TransitionGroup` stable keys | List movement animation depends on stable item identity and move-class evidence |
| `watch` array behavior | Replacement and mutation triggers must be separated; mutation tracking needs explicit `deep` intent |
| `<script setup>` | Compiler macro syntax modernizes Composition API components without changing runtime owner by itself |
| `defineProps` / `defineExpose` | Public props and exposed instance surface become explicit compile-time contracts |
| `ref` / `computed` | Local reactive draft and derived state support Options-to-Composition migration |
| `watch` / `watchEffect` | Side-effect migration requires cleanup ownership and trigger semantics review |
| `createRouter` | Router 4 instance replaces `new Router` |
| `createWebHistory` / `createWebHashHistory` | Router history factory replaces `mode` and owns `base` |
| Catch-all route regexp | Star catch-all route migrates to custom regexp param syntax |
| `router.isReady` | Initial navigation readiness must be awaited in tests, SSR-sensitive startup or smoke checks |
| Navigation failure promise | `router.push` / `router.replace` return promises that expose abort, redirect and duplicate outcomes |
| `<RouterView v-slot>` | RouterView slot owns `Component`, `route`, `Transition` and `KeepAlive` composition |
| `defineStore` | Pinia store id and state owner replace Vuex module namespace |
| Pinia state function | Store state isolation comes from returning fresh state |
| Pinia getters/actions | Derived values and writes use store instance ownership instead of Vuex context/mutations |
| Pinia outside-component use | Store access must happen after Pinia is installed or receive an explicit Pinia instance |
| `import.meta.env` | Vite env boundary replaces client `process.env` assumptions |
| `VITE_` | Only intentionally public client env values should use this prefix |
| `import.meta.env.MODE` | Vite mode should be modeled separately from raw Node environment assumptions |
| Static asset import | Source assets should be imported so Vite can fingerprint them |
| `public/` root path | Public assets keep stable root URLs and bypass fingerprinting |
| `new URL(..., import.meta.url)` | Nearby static assets can be resolved through bundler-analyzable URLs |
| `?worker` / worker constructor | Worker migration uses Vite-supported worker loading patterns |
| `vue-tsc --noEmit` | SFC type diagnostic gate; it does not prove runtime equivalence |
| `vitest run` | Migration safety-net execution for pure and component-level behavior |

## 11. 常见错误表

| # | Mistake | Why it fails | Safer correction |
| --- | --- | --- | --- |
| 1 | Treating migration as full rewrite | behavior baseline disappears | create inventory and characterization tests |
| 2 | Migrating syntax before preserving behavior | new code can encode regressions | test visible output first |
| 3 | Removing Options API only because it is old | stable components gain needless risk | keep Options API when owner is clear |
| 4 | Starting with migration build warnings but not grouping them by owner | warning volume becomes noise | group by route, component owner and breaking-change topic |
| 5 | Treating compatibility build as the final runtime | temporary flags become architecture | use it only as a diagnostic bridge |
| 6 | Mutating global app APIs as if `Vue.use` still owned every root | plugin behavior leaks or disappears | move registration to `createApp` owner |
| 7 | Forgetting that `app.mount` has different mount-element behavior | selectors and CSS hooks drift | check the rendered root in a smoke test |
| 8 | Changing `v-model` without updating emitted event names | parent state stops syncing | migrate to `modelValue` and `update:modelValue` |
| 9 | Reusing keys across conditional branches | DOM state moves to the wrong branch | use stable unique keys |
| 10 | Leaving `v-if` and `v-for` on the same element | loop scope and filtering intent become unclear | move filtering to computed data or wrapper condition |
| 11 | Changing `v-bind` order without review | attributes are overridden by the wrong owner | document the intended merge order |
| 12 | Keeping numeric `keyCode` modifiers | keyboard behavior becomes platform-fragile | use named key modifiers or `KeyboardEvent.key` |
| 13 | Removing `.native` without defining emits/public contract | listener ownership becomes unclear | declare emits and test interaction |
| 14 | Ignoring `$attrs` / `$listeners` merge behavior | fallthrough behavior changes | review public component boundary |
| 15 | Assuming undeclared events are harmless | listeners may fall through as attrs | declare the public event list |
| 16 | Reading `$children` by order | fragments or conditions change child order | use template refs or explicit registration |
| 17 | Translating `$set` mechanically to assignment without modeling object shape | dynamic fields stay unclear | define a record shape or replacement function |
| 18 | Translating `$delete` without optional-field semantics | derived output keeps stale data | model deletion as a domain operation |
| 19 | Replacing `$destroy` with no cleanup owner | listeners and timers leak | move cleanup into unmount/effect ownership |
| 20 | Updating tests from `propsData` late | old test factories hide prop drift | migrate test input to `props` first |
| 21 | Removing filters without testing formatting output | user-visible text changes | move to pure function and unit test exact output |
| 22 | Keeping inline templates as string ownership | template source remains unreviewable | move markup into SFC or owned render source |
| 23 | Converting mixins without lifecycle cleanup | listeners and timers can leak | move cleanup with composable |
| 24 | Ignoring data merge changes when replacing mixins | local state silently overrides shared state | list merged keys before extraction |
| 25 | Treating functional components as performance magic | runtime shape changed and props/slots drift | use a normal SFC unless a function component is clearly simpler |
| 26 | Wrapping route lazy imports in `defineAsyncComponent` by default | Router loading ownership becomes confused | keep route lazy loading as route record import |
| 27 | Migrating render functions without slot function tests | slots render empty or as objects | create typed slot helpers and DOM assertions |
| 28 | Ignoring VNode lifecycle event renames | mount/unmount side effects disappear | migrate to `onVnode...` props |
| 29 | Renaming directive hooks without checking DOM timing | third-party DOM integration initializes too early | test inserted/mounted behavior |
| 30 | Moving custom element config to runtime code only | compiler still treats the tag as a component | configure the compiler/Vite plugin boundary |
| 31 | Ignoring attribute coercion output | browser-visible DOM changes | check the final DOM attribute |
| 32 | Keeping old transition class names only | animations start or leave in the wrong phase | add modern class names and visual smoke |
| 33 | Using unstable keys inside `TransitionGroup` | movement animation jumps | use stable item identity |
| 34 | Assuming array mutation still triggers watchers by default | mutation-only side effects stop running | add explicit deep intent or redesign the owner |
| 35 | Replacing Router `mode` without deployment fallback checks | deep links fail after refresh | test history/hash and static fallback |
| 36 | Forgetting `router.isReady` in initial-route tests | assertions run before navigation settles | await readiness before route assertions |
| 37 | Ignoring Router navigation promise failures | aborts or duplicate navigation become unhandled | await push/replace and inspect failures |
| 38 | Converting Vuex modules to one giant Pinia store | domain ownership is lost | map namespace to store id by domain |
| 39 | Calling a Pinia store before installation | active Pinia is missing | call `useStore` after install or pass the Pinia instance |
| 40 | Replacing all mutations with scattered direct assignment | auditability disappears | keep domain actions for important writes |
| 41 | Assuming TypeScript pass means runtime equivalence | TS does not execute behavior | add behavior tests |
| 42 | Assuming Vite dev works means production migration is complete | build output can differ | run build and preview smoke |
| 43 | Ignoring env variable prefix changes | client config becomes undefined or leaked | use `VITE_` only for public values |
| 44 | Ignoring asset path changes | production asset URL can fail | validate asset import in build output |
| 45 | Using `new URL` for arbitrary runtime strings | bundler cannot statically analyze the path | keep dynamic asset names behind an import map |
| 46 | Migrating guards without testing redirect behavior | auth UX can regress | test route meta and redirect cases |
| 47 | Replacing event bus with Pinia for every event | short-distance events become global state | use props/emits or provide/inject first |
| 48 | Skipping test safety net | failures have no baseline | write tests before refactor |
| 49 | No rollback plan | failed migration becomes forward-only | preserve rollback artifact |
| 50 | Claiming migration passed without typecheck/build/test evidence | result is unverifiable | report only commands actually run |

## 12. 最终小项目

最终小项目 `vue-migration-modernization-lab` 只整合本章机制，不替代 9.x 分节教学。

### 12.1 项目目标

目标是在当前 Vite learning shell 中运行一个 migration rehearsal：同屏看到 legacy-shaped component、modern component、router mapping、Pinia store mapping、Vite env boundary、test safety net 和 rollback artifact。

### 12.2 文件职责

| File group | Responsibility |
| --- | --- |
| `legacy-shaped/` | 保存旧写法形状，作为 behavior baseline |
| `modernized/` | 保存现代 owner，不引入 legacy dependency |
| `models/` | 保存 inventory、risk、route、store、build、test、rollback 数据 |
| `migration-lab/` | 把迁移证据渲染成可读面板 |
| `tests/` | 用 Vitest 锁定 formatting、inventory、store、router behavior |

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

预期交互：Chapter 14 panel 显示 risk dashboard；legacy and modern profile cards 可以编辑；store panel 可以触发 Pinia update；router panel 显示 migrated paths；rollback panel 显示恢复 artifact。

### 12.4 完整核心代码

下面不是把所有源码复制一遍，而是选择最终 lab 的关键执行链路：入口组件、风险 dashboard、现代组件、composable、directive migration、removed API replacement、Router、Pinia、Vite env 和 watch array migration。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/MigrationModernizationChapterApp.vue</span>
  </div>

```vue
<template>
  <MigrationRiskDashboard />
  <MigrationInventoryPanel />
  <LegacyModernDiffPanel />

  <div class="chapter-grid">
    <RouterMigrationPanel />
    <StoreMigrationPanel />
    <BuildToolMigrationPanel />
    <TestSafetyNetPanel />
    <RollbackPlanPanel />
  </div>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/migration-lab/MigrationRiskDashboard.vue</span>
  </div>

```vue
<template>
  <article>
    <h4>Store mappings</h4>
    <p>{{ vuexToPiniaMappings.length }} ownership rules</p>
  </article>
  <article>
    <h4>Build checks</h4>
    <p>{{ viteMigrationChecks.length }} Vite checks</p>
  </article>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/ModernProfileComposition.vue</span>
  </div>

```vue
<script setup lang="ts">
const { displayName, role, profileLabel, isDirty, resetForm, createSnapshot } =
  useProfileForm({
    displayName: "Ada Lovelace",
    role: "Analyst",
  });

function saveProfile(): void {
  emit("save", createSnapshot());
}
</script>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/useProfileForm.ts</span>
  </div>

```ts
function createSnapshot(): ProfileFormSnapshot {
  return {
    displayName: displayName.value,
    role: role.value,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/templateDirectiveMigration.ts</span>
  </div>

```ts
export function isSubmitKeyboardEvent(eventKey: string): boolean {
  return eventKey === "Enter";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/removedApiReplacement.ts</span>
  </div>

```ts
export function createTestMountProps<TProps extends Record<string, unknown>>(
  props: TProps,
): { readonly props: TProps } {
  return { props };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/modernRouterConfig.ts</span>
  </div>

```ts
export function getRouteAuthRequirement(routeName: string): boolean {
  return (
    modernRouteRecords.find((route) => route.name === routeName)?.meta
      .requiresAuth ?? false
  );
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/useProfileStore.ts</span>
  </div>

```ts
actions: {
  updateDisplayName(displayName: string): void {
    this.displayName = displayName.trim();
    this.revision += 1;
  },
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/viteEnvBoundary.ts</span>
  </div>

```ts
export function describeAssetImport(assetUrl: string): string {
  return assetUrl.startsWith("/") ? "root-relative asset" : "module asset";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-14-migration-modernization/modernized/watchArrayMigration.ts</span>
  </div>

```ts
export function shouldArrayWatcherRun(change: ArrayWatchChange): boolean {
  if (change.replaced) {
    return true;
  }

  return change.mutated && change.deep;
}
```
</div>

### 12.5 代码执行链路

执行链路从 root app render 开始：Chapter 01 shell render `MigrationModernizationChapterApp`；Chapter 14 app render dashboard、inventory、diff、router、store、build、test 和 rollback panels；panels 只读取 `models/`、`legacy-shaped/` 和 `modernized/` 中的 evidence；Pinia store 由 root app 安装后可被 store panel 使用；Router migration 在 model/test 中验证 route record 与 meta；Vite env model 只说明 client env/asset 边界；risk dashboard 把这些 evidence 变成 reviewer 可读的 risk summary。

状态所有权必须保持分层：component draft 留在 `useProfileForm.ts`；global profile state 留在 `useProfileStore.ts`；route behavior 留在 Router model；build/env behavior 留在 Vite model；rollback 保留在 `rollbackModel.ts`；tests 只证明行为，不替代 production preview。

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
```
</div>

`npm run typecheck` 证明 `.vue` / `.ts` 类型边界可通过 `vue-tsc --noEmit`，但不执行用户交互。`npm run test:unit` 证明 Vitest 覆盖的 model、formatter、store、router、directive、transition 和 watcher behavior 没有回归，但不证明真实浏览器视觉动画。`npm run build` 证明 production bundle 可以生成，但仍不等于部署后的 preview smoke、history fallback 或 monitoring 结果。

## 13. 额外速查表

### 13.1 Vue 2 -> Vue 3 compact map

| Legacy area | Modern owner | Evidence |
| --- | --- | --- |
| Global API | `createApp` and app-local registration | bootstrap smoke and plugin inventory |
| Component `v-model` | `modelValue` / `update:modelValue` | interaction test |
| Template identity | stable `key`, extracted `v-if` / `v-for`, reviewed `v-bind` order | DOM identity or unit model test |
| Component events | `emits`, no `.native`, reviewed `$attrs` | parent interaction test |
| Removed instance APIs | refs, record operations, cleanup owner, `props` test option | removed API replacement tests |
| Filters / inline templates | pure functions, computed values, SFC templates | formatting tests and component smoke |
| Render / directives / transition / watch | new VNode shape, directive hooks, class phases, explicit deep watch | DOM, visual, or model tests |

### 13.2 Router 3 -> Router 4 compact map

| Legacy area | Modern owner | Evidence |
| --- | --- | --- |
| `new Router` | `createRouter` | route table mapping |
| `mode` / `base` | history factory with base | deep-link and deployment-base smoke |
| `*` catch-all | custom regexp catch-all param | not-found route test |
| initial navigation assumption | `router.isReady` | startup and test readiness gate |
| callback-style navigation | navigation promise / failure inspection | redirect, abort and duplicate navigation tests |
| RouterView composition | `<RouterView v-slot>` with `Transition` / `KeepAlive` | rendered component smoke |

### 13.3 Vuex -> Pinia compact map

| Legacy area | Modern owner | Evidence |
| --- | --- | --- |
| namespaced module | store id | one domain store per namespace |
| module state object | state function | reset/isolation test |
| getters with root context | same-store getter or explicit cross-store read | derived-value test |
| actions with context | Pinia action using `this` | async action test |
| mutations | direct assignment or named domain action | audit policy plus store test |
| plugin/dynamic module | Pinia plugin or staged coexistence | adapter and rollout evidence |

### 13.4 Vue CLI / webpack -> Vite compact map

| Legacy area | Modern owner | Evidence |
| --- | --- | --- |
| `process.env` client reads | `import.meta.env` | env adapter test |
| public client env | `VITE_` prefix only | exposure audit |
| loader asset paths | source imports or `new URL(..., import.meta.url)` | production build output |
| static public files | `public/` root path | direct URL smoke |
| webpack worker loader | Vite worker query or Worker constructor | build and worker smoke |
| dev-server success | build and preview evidence | `npm run build` plus route smoke |

### 13.5 Test evidence per migration type

| Migration type | Minimum evidence | Stronger evidence |
| --- | --- | --- |
| Pure formatter / mapping | Vitest unit test | edge-case table test |
| Component contract | Vue Test Utils interaction test | visual or accessibility smoke |
| Router migration | route mapping test | real navigation and deploy fallback smoke |
| Store migration | Pinia action/getter test | coexistence adapter test |
| Build tooling | typecheck and build | preview smoke and asset audit |
| Transition / directive | DOM assertion | visual smoke on the target browser |

## 14. 真实项目判断模型

| Decision | Prefer first option when | Prefer second option when | Required evidence |
| --- | --- | --- | --- |
| incremental migration vs rewrite | behavior is business-critical and system still runs | old system blocks all safe change and rewrite is funded | inventory, staged rollout, rollback |
| compatibility build vs direct migration | app has broad Vue 2 public API usage | legacy usage is small and easy to replace | compat warnings or direct tests |
| migration build triage vs direct fix | warning source is broad or owner is unclear | warning maps to one obvious local file | grouped warning list, owner and behavior test |
| compat warning close vs defer | warning changes user-visible runtime behavior | warning is isolated to dead or unowned code | warning id, affected route and acceptance gate |
| global API app-owner migration vs temporary adapter | plugin registration is localized | multiple app roots still share legacy plugin assumptions | bootstrap smoke and plugin inventory |
| template directive direct edit vs wrapper migration | caller count is small and tests cover input/list behavior | component is shared and caller event contracts differ | `v-model`, key, `v-if` / `v-for`, `v-bind` tests |
| render function migration vs template rewrite | render logic is small and typed | render logic encodes layout that template can express better | DOM assertion and slot payload check |
| custom directive migration vs replacement | directive owns real DOM integration | directive only wraps simple styling | hook mapping and cleanup evidence |
| transition migration vs visual freeze | animation is user-visible and still needed | transition is cosmetic and can be removed safely | visual smoke or DOM class assertion |
| array watcher deep option vs owner redesign | mutation side effect is required behavior | watcher only maintains derived data | watcher trigger test or computed replacement |
| Options API retention vs Composition API refactor | owner is clear and stable | logic is reused or type inference improves materially | behavior test and reviewer approval |
| mixin retention vs composable extraction | mixin is isolated and low risk | implicit merge causes collisions or reuse confusion | source owner list and cleanup check |
| event bus adapter vs props/emits/provide-inject/Pinia | many subscribers need temporary bridge | owner is local, subtree, or global state respectively | event map and tests |
| Vuex coexistence vs full Pinia migration | caller set is large and risky | state owner is small and tests cover it | store transition test |
| router guard migration vs route table freeze | guard behavior has test coverage | auth redirect behavior is high-risk and untested | `router.isReady`, redirect and abort evidence |
| Vue CLI/webpack retention vs Vite migration | release pipeline is stable and migration risk is high | dev/build speed or ecosystem requires Vite | build and preview proof |
| env/asset adapter vs direct Vite rewrite | env keys and asset paths are spread across the app | reads are centralized | `VITE_`, `new URL` and public path evidence |
| JavaScript tolerance vs TypeScript strictness ramp | legacy area has weak test coverage | payload contracts are clear and owned | typecheck plus runtime tests |
| unit/component tests vs E2E tests | pure behavior or component contract changed | route, auth, or browser flow changed | relevant test level |
| store coexistence vs immediate Pinia-only state | Vuex caller set is broad | one module has clear domain tests | adapter, store id map and rollback |
| rollback branch vs forward-only migration | behavior regression is plausible | migration is tiny and fully reversible in one commit | rollback artifact and restore signal |

## 15. 如何转换成个人笔记

把本章笔记整理成四列：legacy pattern、preserved behavior、modern owner、evidence。每迁移一个旧项目文件，都先写出 rollback path，再写 code diff。不要把“换成新 API”当成笔记标题。

## 16. 必须能回答的问题

- 为什么 migration 不是 rewrite？
- 为什么 compatibility build 是临时诊断工具？
- 如何把 compatibility warning 按 route、component owner 和 breaking-change topic 分组？
- 什么时候应该使用 migration build，什么时候应该直接修复？
- Vue 2 global API 迁移到 `createApp` 后，plugin、mixin、component registration 的 owner 发生了什么变化？
- `v-model` 从 `value` / `input` 迁移到 `modelValue` / `update:modelValue` 时，runtime 行为必须保持什么？
- 为什么 `v-if` / `v-for`、`key` 和 `v-bind` merge order 不能只做机械替换？
- 为什么 numeric `keyCode` modifier 迁移需要考虑 browser platform API？
- `.native`、`$listeners`、`$attrs` 和 `emits` 的关系是什么？
- 为什么 `$children` 迁移必须建立 explicit child owner？
- `$set` / `$delete` 迁移时，TypeScript 可以帮你证明什么，不能证明什么？
- `propsData` 迁移到 `props` 为什么属于 test boundary，而不是 runtime feature？
- Options API 和 Composition API 可以怎样共存？
- `<script setup>` 是 compiler macro 还是 runtime API？它本身是否证明行为等价？
- mixin 迁移前要找哪些隐式 owner？
- filters 和 inline-template 移除后，格式化逻辑和 template ownership 应该放在哪里？
- `defineAsyncComponent` 和 Router route lazy loading 的 owner 有什么不同？
- render function 迁移为什么必须检查 slot function 和 VNode lifecycle hooks？
- custom directive hook rename 为什么需要 DOM timing evidence？
- custom elements 配置为什么属于 compiler/tooling boundary？
- attribute coercion 改动为什么必须查看最终 DOM？
- Transition class phase rename 为什么不能只靠 typecheck？
- `TransitionGroup` 为什么必须依赖 stable item keys？
- Vue 3 `watch array` 默认 trigger 与 Vue 2 mutation 预期有什么差异？
- event bus 迁移时为什么不能默认用 Pinia？
- Router 迁移为什么必须测试 URL 与 guard？
- Router 迁移中为什么常见需要等待 `router.isReady`？
- Router `push` / `replace` promise failure 应该怎样进入测试证据？
- Vuex module 到 Pinia store 如何保持 state ownership？
- 为什么 Vuex mutation 不一定要一律迁移成 Pinia action？
- 什么时候 Vuex 和 Pinia 可以短期 coexist？
- Vite migration 为什么必须验证 env、asset、build 和 preview？
- `VITE_` prefix 解决什么问题，又不能解决什么问题？
- `new URL(..., import.meta.url)` 适合什么资产路径，不适合什么路径？
- TypeScript pass 为什么不等于 runtime equivalence？
- 每类迁移至少需要哪一种 test evidence？
- rollback artifact 应该放在哪里、由谁负责、何时触发？

## 17. 最终记忆模型

真实迁移可以压缩成一句话：先 inventory，锁定旧行为，选择最小 modern owner，用 TypeScript 找 API drift，用 tests 证明 behavior，用 build/preview 证明 output，用 risk dashboard 阻塞不安全项，用 rollback artifact 保留恢复路径。

## 18. 官方文档阅读清单

- Vue 3 Migration Guide: https://v3-migration.vuejs.org/
- Vue 3 Migration Build: https://v3-migration.vuejs.org/migration-build.html
- Vue 3 Breaking Changes: https://v3-migration.vuejs.org/breaking-changes/
- Vue Composition API FAQ: https://vuejs.org/guide/extras/composition-api-faq
- Vue `<script setup>`: https://vuejs.org/api/sfc-script-setup
- Vue Router migrating from Vue 2: https://router.vuejs.org/guide/migration/
- Pinia migrating from Vuex: https://pinia.vuejs.org/cookbook/migration-vuex.html
- Vite Why Vite: https://vite.dev/guide/why.html
- Vite Features: https://vite.dev/guide/features.html
- Vite Env Variables and Modes: https://vite.dev/guide/env-and-mode.html
- Vite Static Asset Handling: https://vite.dev/guide/assets
- Vitest Migration Guide: https://vitest.dev/guide/migration.html
- Vue Test Utils v1 migration: https://test-utils.vuejs.org/migration/

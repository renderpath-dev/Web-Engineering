# Vue 第 18 章：Design System、Reusable Component Library、Design Tokens、Documentation 与 Package Boundary

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
  - [9.1 Design system mental model：token、component contract、state matrix、documentation、package boundary and release evidence](#section-9-1)
  - [9.2 Design tokens：primitive token、semantic token、alias、theme variant and CSS variable output](#section-9-2)
  - [9.3 Theme runtime boundary：CSS custom properties、scoped style、SFC CSS v-bind and safe token switching](#section-9-3)
  - [9.4 Component public API：props、emits、slots、attrs、expose boundary and TypeScript contract](#section-9-4)
  - [9.5 Base button component：native button ownership、variant/size/status props、loading/disabled and emit contract](#section-9-5)
  - [9.6 Form control component：defineModel、label、description、error、aria relationship and validation boundary](#section-9-6)
  - [9.7 Alert and feedback component：status semantics、icon boundary、dismiss event and live-region decision](#section-9-7)
  - [9.8 Dialog shell contract：trigger/content/footer slots、controlled open state and focus-management delegation](#section-9-8)
  - [9.9 Slots and compound components：card、stack、header/body/footer slots and layout composition](#section-9-9)
  - [9.10 Fallthrough attributes and wrapper boundary：inheritAttrs、useAttrs、native element forwarding and multi-root risk](#section-9-10)
  - [9.11 Component state matrix：default、hover、focus、disabled、loading、error、selected and empty states](#section-9-11)
  - [9.12 Accessibility contract：keyboard、focus visible、name/description、role/state and manual verification evidence](#section-9-12)
  - [9.13 Security and customization boundary：token allowlist、no arbitrary CSS string, no unsafe HTML and safe icon/content slots](#section-9-13)
  - [9.14 Documentation stories：component state stories, controls model, usage notes and anti-example documentation](#section-9-14)
  - [9.15 Component playground：controlled inputs, safe controls, state preview and no production telemetry claim](#section-9-15)
  - [9.16 Component testing：model tests、component tests、role/name assertions、contract tests and visual regression boundary](#section-9-16)
  - [9.17 Package export surface：public entry, internal modules, CSS export, type declaration and breaking-change boundary](#section-9-17)
  - [9.18 Vite library mode boundary：build.lib, external Vue, peer dependency model and app-build vs library-build distinction](#section-9-18)
  - [9.19 Versioning and deprecation：semver impact、deprecated props、migration notes、changelog and removal schedule](#section-9-19)
  - [9.20 Design system release dashboard：coverage、a11y evidence、security token review、package boundary and release gate](#section-9-20)
  - [9.21 Chapter integration：how Chapter 18 connects UI, tests, accessibility, security, observability and migration](#section-9-21)
  - [9.22 Final integration：vue-design-system-library-lab 如何形成 reusable UI system evidence workspace](#section-9-22)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 文件职责](#122-文件职责)
  - [12.3 运行与验证](#123-运行与验证)
  - [12.4 完整核心代码](#124-完整核心代码)
  - [12.5 代码执行链路](#125-代码执行链路)
  - [12.6 验证命令与失败定位](#126-验证命令与失败定位)
  - [12.7 Design system review checklist](#127-design-system-review-checklist)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 学习目标 | 真实路径 | 位置 |
| --- | --- | --- |
| token、semantic token、theme 和 CSS variable | `src/learning/vue/chapter-18-design-system-library/models/designTokenModel.ts`、`src/learning/vue/chapter-18-design-system-library/models/semanticTokenModel.ts`、`src/learning/vue/chapter-18-design-system-library/components/ThemePreviewPanel.vue` | 9.1–9.3 |
| component props、emits、slots、attrs 和 defineModel contract | `src/learning/vue/chapter-18-design-system-library/models/componentContractModel.ts`、`src/learning/vue/chapter-18-design-system-library/library/DsButton.vue`、`src/learning/vue/chapter-18-design-system-library/library/DsTextField.vue`、`src/learning/vue/chapter-18-design-system-library/models/fallthroughAttrsModel.ts` | 9.4–9.10 |
| state matrix、a11y、security、docs 和 playground | `src/learning/vue/chapter-18-design-system-library/models/componentStateMatrixModel.ts`、`src/learning/vue/chapter-18-design-system-library/models/accessibilityContractModel.ts`、`src/learning/vue/chapter-18-design-system-library/models/securityTokenBoundaryModel.ts`、`src/learning/vue/chapter-18-design-system-library/components/ComponentPlaygroundPanel.vue` | 9.11–9.15 |
| component test、package export、library build、versioning 和 release gate | `src/learning/vue/chapter-18-design-system-library/models/componentTestEvidenceModel.ts`、`src/learning/vue/chapter-18-design-system-library/models/packageExportModel.ts`、`src/learning/vue/chapter-18-design-system-library/models/libraryBuildBoundaryModel.ts`、`src/learning/vue/chapter-18-design-system-library/models/versioningModel.ts`、`src/learning/vue/chapter-18-design-system-library/models/designSystemIssueModel.ts` | 9.16–9.22 |

## 0. 本章机制边界

本章不是视觉改版，也不是只写 CSS variable。`DesignSystemLibraryChapterApp.vue` 把 token explorer、theme preview、library components、contract panels、package export model 和 release dashboard 放在同一个本地 lab 中，但它不发布 npm package，不安装 Storybook，不安装 visual regression 工具，也不声明完整 DTCG conformance。

本章的 included mechanisms 是：primitive token、semantic token、CSS custom property、SFC scoped CSS、props/emits/slots/attrs contract、`defineModel` contract、native button/input ownership、accessibility/security contract、documentation story、state matrix、package export surface、library build model、semver/deprecation 和 release gate。Excluded mechanisms 是真实 package publishing、registry config、production token pipeline、Storybook deployment、visual regression result、DTCG validator 和 consumer app installation。

Vue 能在 runtime 处理 props、emits、slots、attrs 与 DOM patch；TypeScript 和 `vue-tsc` 能检查组件 contract shape；但真实 consumer compatibility、CSS export availability、type declaration generation、package export map correctness、visual screenshot stability 和 design-token standard conformance 都需要额外证据。

## 1. 本章解决的问题

学习者已经能写 Vue UI，但还需要解释为什么组件库不是复制组件文件：token 决策要有语义层，组件 public API 要有 versioning，slot/attrs 要有边界，a11y/security 要进入 contract，package export 要定义 consumer 能导入什么，release gate 要阻止缺少证据的发布。

## 2. 前置概念

- Chapter 05：理解 TypeScript、`defineProps`、`defineEmits`、`defineModel` 和 `vue-tsc` 边界。
- Chapter 08：理解 UI/forms/admin dashboard 中的组件状态和表单控件。
- Chapter 10：理解 Vitest model tests 与 component contract tests。
- Chapter 15：理解 accessibility name、description、keyboard 和 focus evidence。
- Chapter 16–17：理解 security boundary、observability evidence 和 release gate。

## 3. 学习目标

- 能解释 design system 为什么是 token、component contract、docs、tests、package boundary 和 release governance 的组合。
- 能追踪 primitive token -> semantic token -> CSS variable -> Vue component style 的值流动。
- 能用 props、emits、slots、attrs 与 `defineModel` 描述 component public API。
- 能判断 package readiness、visual regression、DTCG conformance 和 consumer compatibility 为什么不能被本地模型自动证明。

## 4. 核心机制证据链总览

| 机制链 | 本地 owner | 可保留证据 | 仍是 UNKNOWN 的外部证据 | failure signal |
| --- | --- | --- | --- | --- |
| Primitive token -> semantic token -> CSS variable -> theme preview evidence | `designTokenModel.ts / semanticTokenModel.ts` | token name, alias, CSS variable | DTCG validator | deprecated token |
| Token alias -> resolver -> deprecated token warning -> release gate | `resolveSemanticToken` | primitiveTokenName | token governance approval | unknown alias |
| Component prop -> public API contract -> type/runtime validation -> consumer boundary | `componentContractModel.ts` | prop name and default | real consumer install | removed prop |
| Emit event -> payload model -> parent handler contract -> breaking-change risk | `emitContractModel.ts` | press MouseEvent | consumer handler audit | undocumented emit |
| Slot contract -> content composition -> required/optional slot evidence | `slotContractModel.ts` | required slot names | docs site coverage | missing slot |
| defineModel -> model prop/update event -> form control contract | `modelValueContractModel.ts / DsTextField.vue` | update:modelValue | manual form QA | wrong update event |
| Fallthrough attrs -> native element forwarding -> wrapper boundary | `fallthroughAttrsModel.ts` | native-control target | browser interaction audit | wrapper target |
| Native button -> keyboard behavior -> no clickable div evidence | `nativeElementOwnershipModel.ts / DsButton.vue` | actualElement button | manual keyboard pass | interactive div |
| Text field -> label/description/error IDs -> accessibility evidence | `DsTextField.vue` | aria-describedby | screen reader review | missing relation |
| Alert status -> semantic feedback -> live-region decision | `DsAlert.vue` | announce flag | assistive tech review | visual-only status |
| State matrix -> required states -> missing-state failure signal | `componentStateMatrixModel.ts` | required states | visual screenshot | missing state |
| Story model -> documented state -> docs coverage evidence | `documentationStoryModel.ts` | story state | Storybook deployment | missing story |
| Playground control -> finite safe args -> no unsafe raw customization | `playgroundControlModel.ts` | select options | production telemetry | raw CSS control |
| Security customization -> token allowlist -> raw CSS/HTML blocked | `securityTokenBoundaryModel.ts` | unsafe input kind | security review signoff | raw-html |
| Component tests -> role/name/emit assertions -> contract evidence | `componentTestEvidenceModel.ts` | status pass/fail/unknown | visual tool output | unknown required evidence |
| Visual regression boundary -> screenshot evidence -> semantics still UNKNOWN | `visualRegressionBoundaryModel.ts` | toolConfigured flag | real screenshots | coverage claim without tool |
| Package export -> public/internal path split -> consumer import gate | `packageExportModel.ts` | public export entries | package export map | internal import |
| Vite library mode -> build.lib/external Vue -> library-build boundary | `libraryBuildBoundaryModel.ts` | externalVue flag | real lib output | missing type declarations |
| Version change -> semver impact -> migration note/deprecation evidence | `versioningModel.ts / deprecationModel.ts` | semver impact | published changelog | empty migration note |
| Release dashboard -> tests/docs/a11y/security/package issues -> release gate | `designSystemIssueModel.ts` | blocked boolean | real release workflow | high open issue |

## 5. 核心术语表

| Concept | Layer | Meaning | Common Misunderstanding |
| --- | --- | --- | --- |
| primitive token | design decision | raw reusable value such as color.blue.600 | random CSS variable |
| semantic token | intent layer | maps component intent to primitive token | same thing as primitive token |
| component contract | Vue public API | props, emits, slots, attrs and model surface | only props |
| fallthrough attrs | Vue runtime | undeclared attrs passed to component root or chosen element | safe automatically |
| library build boundary | Vite/package | separate app build from reusable package build | same as vite build app |
| release gate | governance | blocks missing evidence before release | manual checklist only |

## 6. 底层心智模型

Design system 的底层链路是：token file 创建 design decision，semantic resolver 把 intent 转成 CSS custom property，Vue component 通过 props/emits/slots/attrs/model 暴露 public contract，Browser 执行 native element 和 CSS cascade，test runner 固化 contract evidence，package consumer 只依赖 public export，release gate 根据 evidence 阻塞不安全变更。

## 7. 推荐目录结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library</span>
  </div>

```txt
chapter-18-design-system-library/
  DesignSystemLibraryChapterApp.vue
  design-system-library.css
  components/
  library/
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

`npm run dev` 只观察本地 UI。`npm run typecheck` 检查 SFC 和 TypeScript contract。`npm run test:unit` 检查 model decisions。`npm run build` 检查 app build，不等于 library package build、type declaration generation、consumer install 或 package publish readiness。

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Design system mental model：token、component contract、state matrix、documentation、package boundary and release evidence

**结论：**

本节把 `color.blue.600 and color.action` 放进 `src/learning/vue/chapter-18-design-system-library/models/designTokenModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/designTokenModel.test.ts` 证明对应 contract；如果出现 `missing token docs blocks release`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

很多学习者把 design system 理解成一套好看的 CSS 或组件截图，本节先纠正这个起点：如果 token 没有 owner、组件 API 没有 contract、状态没有 coverage、文档没有 evidence、package boundary 没有 gate，那么它只是 UI 片段集合，不是可复用系统。

**技术意义：**

`designTokenModel.ts` 里的 `primitiveDesignTokens` 不是为了列颜色，而是把设计决策变成可审查的数据；`listDeprecatedTokens()` 让治理信号可测试，release gate 才能知道哪些 token 文档或迁移说明缺失。

**概念解释：**

design system 的第一层是 governance：`color.blue.600` 这样的 primitive token 记录原始决策，后续 component contract、state matrix、documentation story 和 package export 都围绕这些决策建立证据。`DesignTokenExplorer.vue` 只是观察入口，不是治理本身。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节把 design system 定义为 evidence chain，而不是样式集合：token 决策先进入 `designTokenModel.ts`，组件 API 再由 contract model 固化，state matrix 与 documentation story 补齐可见状态，package export 与 release gate 决定能否交付。Storybook、package publish 和 visual regression 仍是外部证据。

**Design System 机制证据链：**

1. design decision 出现；2. designTokenModel.ts 创建或读取 color.blue.600 and color.action；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/designTokenModel.test.ts`；6. `missing token docs blocks release` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 在这里检查 `DesignToken` 的 `name`、`type`、`value`、`description` 与 `deprecated` 字段；`vue-tsc` 只保证面板 import 与 SFC 使用关系成立，不能判断这些 token 是否符合团队品牌规范或 DTCG 完整格式。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`DesignTokenExplorer.vue` 渲染 primitive token 列表和 deprecated count；浏览器只看到普通文本和 CSS，不知道这些值是否能成为 package API。release runtime 读取的是 test evidence 和 dashboard gate，不是视觉偏好。

**API / 语法规则：**

本节主要 API 是 `findDesignToken()` 和 `listDeprecatedTokens()`，它们把 token lookup 与 deprecated warning 变成可测试函数；组件 props/emits 还不是主角，package boundary 只作为后续 sections 的目标出现。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/designTokenModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/designTokenModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/designTokenModel.ts</span>
  </div>

```ts
export type DesignTokenType = "color" | "space" | "radius" | "font" | "duration";

export interface DesignToken {
  readonly name: string;
  readonly type: DesignTokenType;
  readonly value: string;
  readonly description: string;
  readonly deprecated: boolean;
}

export const primitiveDesignTokens: readonly DesignToken[] = [
  {
    name: "color.gray.0",
    type: "color",
    value: "#ffffff",
    description: "Base white surface color.",
    deprecated: false,
  },
  {
    name: "color.gray.900",
    type: "color",
    value: "#111827",
    description: "Base dark text color.",
    deprecated: false,
  },
  {
    name: "color.blue.600",
    type: "color",
    value: "#2563eb",
    description: "Interactive brand color.",
    deprecated: false,
  },
  {
    name: "color.red.600",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/designTokenModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  findDesignToken,
  listDeprecatedTokens,
  primitiveDesignTokens,
} from "../models/designTokenModel";

describe("designTokenModel", () => {
  it("finds primitive tokens by stable name", () => {
    expect(findDesignToken(primitiveDesignTokens, "color.blue.600")?.value).toBe("#2563eb");
  });

  it("reports deprecated primitive tokens", () => {
    expect(listDeprecatedTokens(primitiveDesignTokens).map((token) => token.name)).toContain(
      "color.brand.old",
    );
  });
});
```
</div>

**逐行解释：**

`primitiveDesignTokens` 声明 token name/type/value/description/deprecated；`findDesignToken()` 按稳定名称查找；`listDeprecatedTokens()` 提取需要迁移的决策。测试断言 `color.blue.600` 可查、`color.brand.old` 可被识别，说明治理信号不是靠人工记忆。

**执行过程：**

打开 Chapter 18 后，token explorer 读取 `primitiveDesignTokens`，计算 deprecated token count，再把结果渲染为列表；Vitest 直接调用 lookup function，证明 `color.blue.600` 与 `color.brand.old` 的治理信号存在。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

token source 从 `primitiveDesignTokens` 开始，deprecated flag 进入 explorer 输出，test assertion 固定 lookup 行为，release gate 把缺少 token docs 视为 failure signal，而不是让任意 CSS 变量自动成为系统规范。

**为什么得到这个结果：**

结果成立是因为本节先建立 owner：token 文件拥有设计决策，面板只是展示，测试才是可复现证据。没有 package build、docs deployment 或 token validator 时，这些本地 token 不能被升级为已发布 design system。

**对比写法：**

正确写法是先定义 token 决策和证据链，再让组件消费语义值；错误写法是把散落的 CSS variable、截图或个人命名习惯直接称为 design system。

**常见错误为什么错：**

忽略 `missing token docs blocks release` 会让后续组件依赖没有来源说明的颜色或间距。问题不是颜色值本身，而是 consumer 无法知道它是否稳定、是否 deprecated、是否属于 public contract。

**与真实项目的关系：**

真实项目需要 token owner、review 流程、deprecated policy、docs coverage 和 release gate；本节只提供本地 token evidence model，帮助你识别哪些决策还缺少团队级治理。

**与当前学习主线的关系：**

本节是 Chapter 18 的入口：它把 Chapter 08 的 UI 组件提升为可复用系统，把 Chapter 10 的 tests 和 Chapter 17 的 evidence 思路引入 design-system 语境。

**最终记忆模型：**

Design system = token decision -> component contract -> state/docs evidence -> package boundary -> release gate。

<a id="section-9-2"></a>

### 9.2 Design tokens：primitive token、semantic token、alias、theme variant and CSS variable output

**结论：**

本节把 `--ds-color-action` 放进 `src/learning/vue/chapter-18-design-system-library/models/semanticTokenModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/semanticTokenModel.test.ts` 证明对应 contract；如果出现 `unknown semantic token throws`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 token 分层混乱：primitive token 是原始值，semantic token 是用途意图。没有 alias resolution 时，组件会直接依赖 `#2563eb` 或 `color.blue.600`，一旦主题切换或品牌更新，所有组件都会被迫跟着改。

**技术意义：**

`resolveSemanticToken("color.action")` 把“按钮行动色”这类语义映射到 `color.blue.600`，再输出 `--ds-color-action`。这个过程让主题变化发生在 token 层，而不是分散到 `DsButton.vue`、`ThemePreviewPanel.vue` 或任意组件样式里。

**概念解释：**

primitive token 回答“值是多少”，semantic token 回答“这个值用来表达什么”。`semanticDesignTokens` 保存 intent 和 primitive reference；resolver 负责验证 reference 是否存在，并把 deprecated 状态一起带到 resolved result。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节只讨论 token layer：primitive token 保存 raw value，semantic token 保存 intent，`resolveSemanticToken()` 负责 alias resolution，`toCssVariableName()` 输出 `--ds-color-action` 这类 runtime carrier。组件 props、slots 和 package exports 暂时只是下游 consumer。

**Design System 机制证据链：**

1. semantic alias 出现；2. semanticTokenModel.ts 创建或读取 --ds-color-action；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/semanticTokenModel.test.ts`；6. `unknown semantic token throws` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 检查 `SemanticToken.primitiveTokenName` 是字符串字段，但不会静态证明它一定存在于 `primitiveDesignTokens`；这个关联必须由 `resolveSemanticToken()` 的 runtime lookup 和 `semanticTokenModel.test.ts` 覆盖。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

运行时先按 semantic name 查找 intent，再调用 `requireDesignToken()` 找 primitive value，最后生成 CSS variable name。浏览器只消费变量值；如果 alias 不存在，错误在 resolver 层抛出，而不是等到组件样式静默失败。

**API / 语法规则：**

核心规则是 `resolveSemanticToken("color.action")` 返回 primitive name、CSS variable name、value 和 deprecated 状态；`createCssVariableDeclaration()` 只负责格式化输出，不承担 token governance。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/semanticTokenModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/semanticTokenModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/semanticTokenModel.ts</span>
  </div>

```ts
import { toCssVariableName } from "./cssVariableModel";
import {
  primitiveDesignTokens,
  requireDesignToken,
  type DesignToken,
} from "./designTokenModel";

export interface SemanticToken {
  readonly name: string;
  readonly primitiveTokenName: string;
  readonly intent: string;
  readonly deprecated: boolean;
}

export interface ResolvedSemanticToken {
  readonly name: string;
  readonly primitiveTokenName: string;
  readonly cssVariableName: string;
  readonly value: string;
  readonly deprecated: boolean;
}

export const semanticDesignTokens: readonly SemanticToken[] = [
  {
    name: "color.surface",
    primitiveTokenName: "color.gray.0",
    intent: "Default component surface.",
    deprecated: false,
  },
  {
    name: "color.text",
    primitiveTokenName: "color.gray.900",
    intent: "Default readable text.",
    deprecated: false,
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/semanticTokenModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { resolveSemanticToken } from "../models/semanticTokenModel";

describe("semanticTokenModel", () => {
  it("resolves semantic token aliases to primitive values", () => {
    const token = resolveSemanticToken("color.action");

    expect(token.primitiveTokenName).toBe("color.blue.600");
    expect(token.cssVariableName).toBe("--ds-color-action");
  });
});
```
</div>

**逐行解释：**

`semanticDesignTokens` 中的 `color.action` 指向 `color.blue.600`；`resolveSemanticToken()` 先找 semantic entry，再调用 `requireDesignToken()`；返回对象包含 primitive name、CSS variable name 和 value。测试检查 alias 与 CSS variable，避免 unknown semantic token 静默失败。

**执行过程：**

测试调用 `resolveSemanticToken("color.action")`，resolver 命中 `semanticDesignTokens`，再解析到 `color.blue.600`，断言 CSS variable 是 `--ds-color-action`；未知 semantic name 会触发 explicit failure。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

primitive value 从 `color.blue.600` 流向 `color.action`，再流向 `--ds-color-action`；deprecated flag 会被合并到 resolved result，unknown alias 则成为 token modeling 的 failure signal。

**为什么得到这个结果：**

结果来自两层 token 分工：primitive token 管 raw value，semantic token 管使用意图。只改主题值时不必改按钮组件，因为组件应该依赖 semantic intent，而不是硬编码色阶。

**对比写法：**

正确写法是 `color.action -> color.blue.600 -> --ds-color-action`；错误写法是组件直接写 `#2563eb` 或把 `color.blue.600` 当成按钮语义。

**常见错误为什么错：**

忽略 `unknown semantic token throws` 会导致组件引用不存在的 intent。错误的根源是 alias 没有 resolver 和测试保护，最终表现为主题缺口或不可预测的 CSS fallback。

**与真实项目的关系：**

真实 design token pipeline 可能接入 design tool、DTCG formatter 和 transformer；本节没有声明完整 conformance，只证明本地 alias model 能发现 deprecated 与 unknown token。

**与当前学习主线的关系：**

本节承接 Chapter 05 的 TypeScript model 思路：类型描述 token shape，runtime resolver 证明 alias，测试固定边界。

**最终记忆模型：**

Primitive token owns value; semantic token owns intent; resolver turns intent into CSS variable evidence.

<a id="section-9-3"></a>

### 9.3 Theme runtime boundary：CSS custom properties、scoped style、SFC CSS v-bind and safe token switching

**结论：**

本节把 `high-contrast semantic override` 放进 `src/learning/vue/chapter-18-design-system-library/components/ThemePreviewPanel.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/themeVariantModel.test.ts` 证明对应 contract；如果出现 `raw CSS customization is rejected elsewhere`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 theme switching 的边界：主题切换应该改变已建模的 semantic token value，而不是让用户输入任意 CSS。否则主题系统会绕开 9.13 的安全定制规则，变成未审查的 style 注入入口。

**技术意义：**

`useThemeTokens()` 用有限的 `ThemeVariantName` 控制 light/dark/high-contrast；`createThemeCssDeclarations()` 只生成 `--ds-*` declarations。这样组件不需要知道当前主题，只消费 CSS custom properties。

**概念解释：**

CSS custom property 是 runtime carrier：它把 token value 交给浏览器 cascade，但不负责 token governance。scoped CSS 约束当前 SFC 的样式范围；如果使用 SFC CSS `v-bind()`，它也是把 script value 带入 CSS，不是开放 raw CSS 的理由。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 theme switching：`useThemeTokens()` 和 `createThemeCssDeclarations()` 只允许在已知 theme variant 中切换 semantic token value。raw CSS 字符串不属于 theme runtime，它属于 9.13 的 security customization boundary。

**Design System 机制证据链：**

1. theme select change 出现；2. useThemeTokens.ts 创建或读取 high-contrast semantic override；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/themeVariantModel.test.ts`；6. `raw CSS customization is rejected elsewhere` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 用 `ThemeVariantName = "light" | "dark" | "high-contrast"` 限制 select 结果的目标集合；`vue-tsc` 能发现不存在的 variant 字面量，但不能证明浏览器最终 contrast 足够或主题符合品牌。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

用户在 `ThemePreviewPanel.vue` 选择 variant，Vue 更新 `currentVariant` ref，computed `cssText` 重新生成 declarations，`:style="previewStyle"` 让浏览器 cascade CSS custom properties。scoped CSS 限制组件样式范围，变量值仍按 CSS cascade 生效。

**API / 语法规则：**

本节使用 `useThemeTokens()`, `setThemeVariant()`, `resolveThemeTokens()` 和 inline style binding。若提到 SFC CSS `v-bind()`，它只是把 script value 注入 CSS 的另一种通道，不替代 token allowlist。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/components/ThemePreviewPanel.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/themeVariantModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/ThemePreviewPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useThemeTokens } from "../composables/useThemeTokens";
import type { ThemeVariantName } from "../models/themeVariantModel";

const { currentVariant, cssText, setThemeVariant } = useThemeTokens("light");
const previewStyle = computed(() =>
  Object.fromEntries(
    cssText.value.split("\n").map((line) => {
      const [name, value] = line.replace(";", "").split(": ");

      return [name, value];
    }),
  ),
);

function selectVariant(event: Event): void {
  const select = event.target as HTMLSelectElement;
  setThemeVariant(select.value as ThemeVariantName);
}
</script>

<template>
  <section class="design-card">
    <h3>Theme preview</h3>
    <label class="design-field">
      Theme variant
      <select :value="currentVariant" @change="selectVariant">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="high-contrast">High Contrast</option>
      </select>
    </label>
    <div class="theme-preview" :style="previewStyle">
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/themeVariantModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { createThemeCssDeclarations, resolveThemeTokens } from "../models/themeVariantModel";

describe("themeVariantModel", () => {
  it("overrides semantic values for high contrast", () => {
    const tokens = resolveThemeTokens("high-contrast");

    expect(tokens.find((token) => token.name === "color.action")?.value).toBe("#facc15");
  });

  it("creates CSS custom property declarations", () => {
    expect(createThemeCssDeclarations("light")).toContain("--ds-color-action: #2563eb;");
  });
});
```
</div>

**逐行解释：**

`currentVariant` 是 ref；select change 调用 `setThemeVariant()`；computed `cssText` 读取 variant 并生成 declarations；`previewStyle` 把这些声明转成 inline style object。测试验证 high-contrast override 和 CSS declaration 输出。

**执行过程：**

select change 触发 `selectVariant()`，函数把 DOM value 收窄为 `ThemeVariantName` 后写入 ref；computed 读取新 variant，生成 `--ds-color-*` declarations；preview box 不接收任意 CSS 输入。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

theme variant 从 select value 进入 `currentVariant`，semantic override 改变 CSS variable value，browser repaint preview；raw CSS control 没有进入这条链，所以 security failure 不会被 theme switching 吞掉。

**为什么得到这个结果：**

结果成立是因为 theme runtime 只交换已建模 token，不允许用户提交任意 style 文本。CSS custom property 提供运行时承载能力，但治理仍来自 token model 与 finite variant set。

**对比写法：**

正确写法是选择 `dark` 或 `high-contrast` 这类有限 variant；错误写法是给 playground 一个 textarea 让用户输入 `position: fixed` 或未知 CSS，再把它称为主题能力。

**常见错误为什么错：**

忽略 `raw CSS customization is rejected elsewhere` 会把安全问题误放进 theme API。主题切换应回答“哪个语义值生效”，不是开放任意样式执行面。

**与真实项目的关系：**

真实项目会把 theme preview 连接到品牌审查、contrast 检查和设计 token pipeline；本地 lab 只证明 Vue ref、computed 与 CSS variable 的安全切换模型。

**与当前学习主线的关系：**

本节连接 Chapter 02 的 computed 更新、Chapter 08 的 UI preview 和 Chapter 16 的安全边界，但不会重复每个组件的 release 关系。

**最终记忆模型：**

Theme switching = finite variant ref -> semantic overrides -> CSS custom properties -> browser repaint.

<a id="section-9-4"></a>

### 9.4 Component public API：props、emits、slots、attrs、expose boundary and TypeScript contract

**结论：**

本节把 `variant prop and press emit` 放进 `src/learning/vue/chapter-18-design-system-library/models/componentContractModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/componentContractModel.test.ts` 证明对应 contract；如果出现 `removed public prop is major`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决“组件 API 只等于 props”的误解。组件库的 public API 还包括 emits、slots、attrs、model 和可能的 expose surface；这些入口一旦被 consumer 使用，就会产生 versioning 和 migration 责任。

**技术意义：**

`buttonContract` 把 `variant` prop、`press` emit、default slot 和 attrs target 放在同一个对象里。这样 contract review 不会只看输入，也会检查输出事件、组合面和 pass-through 行为。

**概念解释：**

props 是 parent 给组件的输入，emits 是组件给 parent 的输出，slots 是 parent 注入结构的方式，attrs 是未声明属性穿透到真实元素的边界，model 是 value/update event 的约定。删除任意公开面都可能是 breaking change。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 component public API。`buttonContract` 把 props 视为 input contract、emits 视为 output contract、slots 视为 composition contract、attrs 视为 pass-through contract；`expose` 代表 imperatively exposed surface，未建模时不能对外承诺。

**Design System 机制证据链：**

1. public component API 出现；2. buttonContract 创建或读取 variant prop and press emit；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/componentContractModel.test.ts`；6. `removed public prop is major` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 能描述 `PropContract`、`EmitContract`、`SlotContract` 和 optional `ModelValueContract`；`vue-tsc` 能检查这些对象和面板 import，但不能替 consumer 判断删除 prop 是否可接受。breaking-change 风险由 `detectBreakingContractChange()` 建模。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`ComponentContractPanel.vue` 读取 `buttonContract` 并展示 attrs target、documentation gaps 和 removal impact。Vue runtime 不知道“major version”是什么；它只会按当前 props/emits 执行。release reviewer 才把 major impact 变成迁移要求。

**API / 语法规则：**

本节规则是 public API 必须同时覆盖 props、emits、slots、attrs 和 model；删除 prop、emit 或 slot 是 major impact，visual default change 至少需要 review。declared emits 优先于把 listener 当作 `$attrs` 隐式契约。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/componentContractModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/componentContractModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/componentContractModel.ts</span>
  </div>

```ts
import type { EmitContract } from "./emitContractModel";
import type { ModelValueContract } from "./modelValueContractModel";
import type { PropContract } from "./propContractModel";
import { findUndocumentedRequiredProps } from "./propContractModel";
import type { SlotContract } from "./slotContractModel";

export interface ComponentContract {
  readonly componentName: string;
  readonly props: readonly PropContract[];
  readonly emits: readonly EmitContract[];
  readonly slots: readonly SlotContract[];
  readonly model?: ModelValueContract;
  readonly attrsTarget: string;
  readonly public: boolean;
}

export type ContractChangeImpact = "patch" | "minor" | "major";

export const buttonContract: ComponentContract = {
  componentName: "DsButton",
  props: [
    {
      name: "variant",
      typeLabel: "primary | secondary | danger",
      required: false,
      defaultValue: "primary",
      description: "Controls visual intent through semantic tokens.",
      deprecated: false,
    },
    {
      name: "loading",
      typeLabel: "boolean",
      required: false,
      defaultValue: "false",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/componentContractModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  buttonContract,
  detectBreakingContractChange,
  findContractDocumentationGaps,
} from "../models/componentContractModel";

describe("componentContractModel", () => {
  it("keeps documented public button contract", () => {
    expect(findContractDocumentationGaps(buttonContract)).toEqual([]);
  });

  it("marks removed public props as major changes", () => {
    expect(
      detectBreakingContractChange({
        removedProp: true,
        removedEmit: false,
        removedSlot: false,
        visualDefaultChanged: false,
      }),
    ).toBe("major");
  });
});
```
</div>

**逐行解释：**

`buttonContract.props` 记录 prop 名称、类型标签、默认值和 deprecated 状态；`emits` 记录事件名和 payload；`slots` 记录 required default slot；`detectBreakingContractChange()` 把 removed prop/emit/slot 归类为 major。测试固定这些规则。

**执行过程：**

面板调用 `findContractDocumentationGaps(buttonContract)`，再模拟 removed prop change；测试断言 documented contract 无 gap，并确认 removed public prop 返回 `major`。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

component prop 从 `buttonContract.props` 进入 docs evidence，emit payload 进入 parent handler contract，slot metadata 进入 composition surface，attrs target 进入 wrapper boundary；removed prop 变成 version failure signal。

**为什么得到这个结果：**

结果成立是因为组件库的 API 一旦被 consumer 使用，就不再只是内部实现。TypeScript 可以描述 contract shape，但 semver impact 必须由显式规则计算。

**对比写法：**

正确写法是把 props、emits、slots、attrs 一起写进 contract；错误写法是只写 props table，却让 emits、slots 和 attrs forwarding 通过源码猜测。

**常见错误为什么错：**

忽略 `removed public prop is major` 会把 consumer breakage 当作普通 refactor。这个错误违反 public API contract：被导出的组件不允许无迁移说明地改变调用方式。

**与真实项目的关系：**

真实组件库需要 API review、migration note、deprecated window 和 changelog；本节的 model 帮你在发布前识别哪些改动已经越过 patch 范围。

**与当前学习主线的关系：**

本节把 Chapter 03 的组件通信扩展为库级 contract，并为 Chapter 19 以后可能的 package release 建立版本意识。

**最终记忆模型：**

Component API = props input + emits output + slots composition + attrs forwarding + version impact.

<a id="section-9-5"></a>

### 9.5 Base button component：native button ownership、variant/size/status props、loading/disabled and emit contract

**结论：**

本节把 `press MouseEvent payload` 放进 `src/learning/vue/chapter-18-design-system-library/library/DsButton.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/nativeElementOwnershipModel.test.ts` 证明对应 contract；如果出现 `interactive div fails native ownership`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 design-system button 最常见的错误：为了样式自由把按钮写成 clickable div。`DsButton.vue` 的核心任务是保留 native `<button>` 的 keyboard、disabled、form 和 click 语义，再在上面叠加 variant、size、loading 与 emit contract。

**技术意义：**

loading 和 disabled 不是纯视觉状态。它们会共同决定 native `disabled` attribute 和 `handleClick()` 是否 emit `press`。这让 consumer 不会在 loading 状态下收到误触发事件。

**概念解释：**

`press` 事件保留原始 `MouseEvent`，但只有在按钮可交互时发出。default slot 提供 label，`aria-busy` 表示 pending 状态，`type` 默认是 button，避免组件在 form 中意外 submit。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节只讨论 `DsButton.vue` 的 native element ownership。variant、size、loading 和 disabled 是 props；`press` 是 emit；slot 是 label surface。它必须渲染 `<button>`，不能用 wrapper div 重做浏览器已经提供的 keyboard、disabled 和 form 行为。

**Design System 机制证据链：**

1. button press 出现；2. DsButton.vue 创建或读取 press MouseEvent payload；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/nativeElementOwnershipModel.test.ts`；6. `interactive div fails native ownership` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 检查 `variant`、`size`、`type` 字面量和 `press: [event: MouseEvent]` payload；它不能证明实际 DOM 是 `<button>`，也不能模拟键盘激活或 disabled 表单语义，所以 `nativeElementOwnershipModel.test.ts` 补充模型证据。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

用户点击按钮时，浏览器先执行 native button 行为；Vue `handleClick()` 再判断 `disabled || loading`，必要时阻止 press emit。loading 不只是视觉状态，它和 disabled 一起阻止 consumer handler 收到事件。

**API / 语法规则：**

`DsButton` 的 API 是 `variant`, `size`, `loading`, `disabled`, `type` props，加 `press` event 和 default slot。`aria-busy` 表达 pending 状态；native `disabled` 保留浏览器语义。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/library/DsButton.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/nativeElementOwnershipModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsButton.vue</span>
  </div>

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    readonly variant?: "primary" | "secondary" | "danger";
    readonly size?: "sm" | "md" | "lg";
    readonly loading?: boolean;
    readonly disabled?: boolean;
    readonly type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    type: "button",
  },
);

const emit = defineEmits<{
  press: [event: MouseEvent];
}>();

function handleClick(event: MouseEvent): void {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }

  emit("press", event);
}
</script>

<template>
  <button
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/nativeElementOwnershipModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { evaluateNativeElementOwnership } from "../models/nativeElementOwnershipModel";

describe("nativeElementOwnershipModel", () => {
  it("blocks interactive components that hide native button behavior", () => {
    expect(
      evaluateNativeElementOwnership({
        componentName: "DsButton",
        expectedElement: "button",
        actualElement: "div",
        interactive: true,
      }),
    ).toBe("fail");
  });
});
```
</div>

**逐行解释：**

`withDefaults()` 给 variant/size/loading/disabled/type 设置默认值；`handleClick()` 先检查 disabled 或 loading；被阻止时调用 `preventDefault()` 并 return；否则 `emit("press", event)`。测试用 model 证明 interactive div 不是合格替代。

**执行过程：**

click 进入 `handleClick(event)`；若 loading 或 disabled 为 true，函数 `preventDefault()` 并 return；否则 emit `press`，parent 通过 `@press` 接收原始 `MouseEvent`。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

component prop 控制 native disabled attribute，emit payload 保留 MouseEvent，slot content 提供 label；test assertion 把 interactive div 标为 fail，release gate 因 native ownership failure 阻塞。

**为什么得到这个结果：**

结果来自平台优先原则：组件库按钮应该包装 native button，而不是复制其行为。Vue event handler 只添加 contract rule，不替代浏览器的键盘和 disabled 机制。

**对比写法：**

正确写法是 `<button type="button">` 加有限 props；错误写法是 `<div>` 加 click handler、tabindex 和 role，再试图补齐所有 button 行为。

**常见错误为什么错：**

忽略 `interactive div fails native ownership` 会破坏键盘用户、表单语义和 disabled 行为。它不是样式偏好，而是组件 contract 失去平台基础。

**与真实项目的关系：**

真实 design system 中 button 是最容易被复用的基础组件；一旦 native ownership 错误，所有 consumer 页面都会继承相同可访问性和交互问题。

**与当前学习主线的关系：**

本节把 Chapter 15 的键盘和可访问性要求落到 Chapter 18 的库组件 API，而不是泛泛重复 release evidence。

**最终记忆模型：**

DsButton = native button + finite visual props + loading/disabled gate + typed press emit.

<a id="section-9-6"></a>

### 9.6 Form control component：defineModel、label、description、error、aria relationship and validation boundary

**结论：**

本节把 `update:modelValue` 放进 `src/learning/vue/chapter-18-design-system-library/library/DsTextField.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts` 证明对应 contract；如果出现 `missing aria relationship blocks a11y evidence`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决表单控件的双重边界：一边是 `defineModel` 的值同步 contract，另一边是 label、description、error 与 input 的可访问关系。只做到 v-model 可用，不等于文本框已经对所有用户可理解。

**技术意义：**

`DsTextField.vue` 把 `id`、`label`、`description`、`error` 和 model value 放进同一个组件 contract。consumer 只负责提供内容和接收 value，组件负责把这些内容连接成浏览器可识别的 label/description/error 关系。

**概念解释：**

`defineModel<string>()` 表面像一个 ref，底层仍是 model prop 加 `update:modelValue` event。`descriptionId`、`errorId` 和 `describedBy` computed 根据 props 生成 ID 链，最终落到 input 的 `aria-describedby`。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 form control contract。`DsTextField.vue` 用 `defineModel<string>()` 表达 value sync，用 `label`、`description`、`error` 和 generated IDs 建立 accessible relationship；validation 结果如何产生不属于本组件。

**Design System 机制证据链：**

1. text input update 出现；2. defineModel string model 创建或读取 update:modelValue；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts`；6. `missing aria relationship blocks a11y evidence` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 能检查 model value 是 string、`id` 和 `label` 是必填 props、`error` 是可选 string；它不能打开浏览器 accessibility tree 验证 accessible name，所以 aria relationship 仍需 component test 或 manual review。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

父组件通过 `v-model` 传入 value，Vue 展开为 model prop 与 `update:modelValue` event；input 更新后 model ref 同步。computed `describedBy` 根据 description/error 是否存在生成 ID 列表，浏览器用它连接辅助文本。

**API / 语法规则：**

核心 API 是 `defineModel<string>({ default: "" })`、required `id`/`label`、optional `description`/`error`/`disabled`。`aria-invalid` 来自 Boolean(error)，`aria-describedby` 只在有说明或错误时输出。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/library/DsTextField.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsTextField.vue</span>
  </div>

```vue
<script setup lang="ts">
import { computed } from "vue";

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly error?: string;
    readonly disabled?: boolean;
  }>(),
  {
    description: "",
    error: "",
    disabled: false,
  },
);

const descriptionId = computed(() => `${props.id}-description`);
const errorId = computed(() => `${props.id}-error`);
const describedBy = computed(() => {
  const ids = [];

  if (props.description) {
    ids.push(descriptionId.value);
  }

  if (props.error) {
    ids.push(errorId.value);
  }

  return ids.length > 0 ? ids.join(" ") : undefined;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  createModelValueContract,
  isModelUpdateEvent,
} from "../models/modelValueContractModel";

describe("modelValueContractModel", () => {
  it("models defineModel as prop plus update event", () => {
    const contract = createModelValueContract("modelValue", "string", true);

    expect(contract.updateEventName).toBe("update:modelValue");
    expect(isModelUpdateEvent(contract, "update:modelValue")).toBe(true);
  });
});
```
</div>

**逐行解释：**

代码先创建 `model`，再读取 props 生成 description/error ID；`describedBy` 只在有 description 或 error 时返回字符串。template 中 label 的 `for` 指向 input id，input 的 `aria-invalid` 来自 Boolean(error)。测试验证 update event contract。

**执行过程：**

用户输入文本，native input 触发 v-model 更新；Vue 写入 model ref；computed 读取 props 生成 `descriptionId`、`errorId` 和 `describedBy`；template 重新渲染 input attribute。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

model prop 变为 update event，label text 绑定 input id，description/error 进入 aria-describedby，test assertion 证明 `update:modelValue` contract；缺少 aria relation 是 a11y failure signal。

**为什么得到这个结果：**

结果成立是因为 `defineModel` 简化写法没有改变底层 contract：consumer 仍然依赖 model prop 和 update event。可访问命名则由真实 DOM attribute 关系决定，不由 TypeScript 单独证明。

**对比写法：**

正确写法是 label `for` 指向 input id，并把 description/error ID 放进 `aria-describedby`；错误写法是只显示错误文本，却不让 input 与文本建立关系。

**常见错误为什么错：**

忽略 `missing aria relationship blocks a11y evidence` 会让视觉上完整的输入框在辅助技术中缺少上下文。错误不在 TS 类型，而在浏览器可访问性关系。

**与真实项目的关系：**

真实表单库需要把 value contract、validation message、disabled state 和 accessible description 作为一个 API 交付；否则 consumer 每次都要修补相同问题。

**与当前学习主线的关系：**

本节连接 Chapter 08 的表单控件、Chapter 05 的 `defineModel` 类型和 Chapter 15 的 name/description 证据。

**最终记忆模型：**

DsTextField = defineModel value sync + labeled input + described error/description boundary.

<a id="section-9-7"></a>

### 9.7 Alert and feedback component：status semantics、icon boundary、dismiss event and live-region decision

**结论：**

本节把 `announce controls role status` 放进 `src/learning/vue/chapter-18-design-system-library/library/DsAlert.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts` 证明对应 contract；如果出现 `visual status without announcement decision`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 alert 组件的语义分离：status 决定视觉反馈，不等于一定要 live announce。成功提示、警告、危险提示在视觉上不同，但是否打断辅助技术用户必须由 `announce` 明确控制。

**技术意义：**

`DsAlert.vue` 通过 `status` 输出样式语义，通过 `announce` 决定 `role="status"`，通过 `dismissible` 和 `dismiss` emit 表达关闭能力。这样“看起来危险”和“需要被朗读”不会被混成一个 prop。

**概念解释：**

alert 的 default slot 是消息内容；`status` 是有限状态；`announce` 是 live-region policy；`dismiss` 是用户动作输出。icon 或内容扩展应走 slot/有限状态，而不是 raw HTML。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节只处理 feedback component。`status` 决定 visual intent，`announce` 决定是否设置 `role="status"`，`dismissible` 与 `dismiss` event 决定用户能否关闭。不是每条提示都应该自动 live announce。

**Design System 机制证据链：**

1. status feedback 出现；2. DsAlert.vue 创建或读取 announce controls role status；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts`；6. `visual status without announcement decision` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 限制 `status` 只能是 info/success/warning/danger，并检查 `dismiss` 无 payload；它不能判断当前消息是否紧急，也不能证明 screen reader 体验合适。announcement policy 要靠 a11y review。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`DsAlert.vue` 根据 props 渲染 section class、status text、slot content 和可选 dismiss button。`announce` 为 true 时才输出 status role；点击 dismiss button 时 Vue emit `dismiss`，由 parent 决定移除或保留。

**API / 语法规则：**

本节 API 是 `status`, `dismissible`, `announce` props，default slot 传入反馈内容，`dismiss` emit 表示用户请求关闭。icon boundary 仍应走 slot 或有限 status map，不能开放 raw HTML。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/library/DsAlert.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsAlert.vue</span>
  </div>

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    readonly status?: "info" | "success" | "warning" | "danger";
    readonly dismissible?: boolean;
    readonly announce?: boolean;
  }>(),
  {
    status: "info",
    dismissible: false,
    announce: false,
  },
);

const emit = defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <section
    class="ds-alert"
    :class="`ds-alert--${status}`"
    :role="props.announce ? 'status' : undefined"
  >
    <strong class="ds-alert__status">{{ status }}</strong>
    <div class="ds-alert__content">
      <slot />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="ds-alert__dismiss"
      @click="emit('dismiss')"
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { findMissingAccessibilityEvidence } from "../models/accessibilityContractModel";

describe("accessibilityContractModel", () => {
  it("requires evidence for each accessibility requirement", () => {
    expect(
      findMissingAccessibilityEvidence({
        componentName: "DsTextField",
        requirements: ["name", "description", "keyboard"],
        verifiedRequirements: ["name"],
      }),
    ).toEqual(["description", "keyboard"]);
  });
});
```
</div>

**逐行解释：**

props 默认 `status="info"`、`dismissible=false`、`announce=false`；template 根据 announce 决定是否输出 status role；dismiss button 只在 dismissible 时出现，点击后 emit `dismiss`。a11y model 测试证明 requirement 仍需 evidence。

**执行过程：**

父组件传入 status 和 announce；Vue render 根据 status 生成 class；如果 dismissible 为 true，button click 调用 `emit("dismiss")`；测试模型检查 a11y requirement 是否有 evidence。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

status prop 改变 visual class，announce prop 改变 live-region role，dismiss event 把用户动作传给 parent；缺少 announcement decision 会成为 feedback component failure signal。

**为什么得到这个结果：**

结果来自视觉反馈和辅助技术公告的分离。danger 样式不等于必须 live announce；频繁变化的普通信息如果都 announce，反而干扰用户。

**对比写法：**

正确写法是让 `announce` 明确表达公告策略；错误写法是所有 alert 都写死 `role="status"` 或只改颜色不记录语义。

**常见错误为什么错：**

忽略 `visual status without announcement decision` 会让组件在安静和打断之间没有可审查规则。问题不是缺少颜色，而是缺少 announcement contract。

**与真实项目的关系：**

真实设计系统需要为 toast、inline alert、form error 和 system banner 分别定义公告策略；本地 `DsAlert` 只提供最小可测试边界。

**与当前学习主线的关系：**

本节把 Chapter 15 的 live-region 思维放入组件库反馈 API，同时保留 Chapter 16 对 unsafe slot/customization 的警惕。

**最终记忆模型：**

DsAlert = status visual semantics + optional live announcement + dismiss event.

<a id="section-9-8"></a>

### 9.8 Dialog shell contract：trigger/content/footer slots、controlled open state and focus-management delegation

**结论：**

本节把 `update:open and close` 放进 `src/learning/vue/chapter-18-design-system-library/library/DsDialogShell.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts` 证明对应 contract；如果出现 `focus trap claim remains external`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 dialog shell 与完整 dialog 的边界。`DsDialogShell.vue` 可以示范 controlled open state、trigger/content/footer slots 和 close events，但它没有实现完整 focus trap，因此不能宣称是 production-ready modal。

**技术意义：**

shell 的价值是把 dialog 结构 contract 讲清楚：parent 拥有 open state，trigger slot 请求打开，footer slot 可请求关闭，component 发出 `update:open` 和 `close`。focus trapping、Escape、return focus 属于额外实现和验证。

**概念解释：**

`open` prop 是受控输入，`update:open` 是同步输出，`close` 是语义事件。named slots 把 trigger、content、footer 分开，让 consumer 组合内容，但不让 shell 假装拥有全部焦点管理。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 dialog shell contract，不是完整 modal implementation。`open` 是 controlled state，trigger/content/footer slots 定义组合面，`update:open` 和 `close` events 定义状态输出；focus trap 仍委托给 Chapter 15 概念。

**Design System 机制证据链：**

1. controlled open state 出现；2. DsDialogShell.vue 创建或读取 update:open and close；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts`；6. `focus trap claim remains external` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 能检查 `open` boolean、`title` string、slot props 中的 `open`/`close` callback 形状；它不能证明焦点被困在 dialog 内，也不能证明 Escape、initial focus 和 return focus 已实现。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

trigger slot 接收 open callback，点击后 emit `update:open(true)`；当 `open` 为 true，Vue 渲染 `role="dialog"` section；Close button 调用 `closeDialog()`，同时 emit `update:open(false)` 和 `close`。

**API / 语法规则：**

组件 API 是 controlled `open` prop、`update:open` event、`close` event、trigger slot、default content slot 和 footer slot。focus-management API 没有暴露，因此文档必须明确不声明完整 focus trap。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/library/DsDialogShell.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsDialogShell.vue</span>
  </div>

```vue
<script setup lang="ts">
defineProps<{
  readonly open: boolean;
  readonly title: string;
}>();

const emit = defineEmits<{
  "update:open": [open: boolean];
  close: [];
}>();

function closeDialog(): void {
  emit("update:open", false);
  emit("close");
}
</script>

<template>
  <div class="ds-dialog-contract">
    <slot name="trigger" :open="() => emit('update:open', true)" />
    <section v-if="open" class="ds-dialog" aria-modal="true" role="dialog">
      <header class="ds-dialog__header">
        <h3>{{ title }}</h3>
        <button type="button" @click="closeDialog">Close</button>
      </header>
      <div class="ds-dialog__body">
        <slot />
      </div>
      <footer class="ds-dialog__footer">
        <slot name="footer" :close="closeDialog" />
      </footer>
    </section>
  </div>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/modelValueContractModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  createModelValueContract,
  isModelUpdateEvent,
} from "../models/modelValueContractModel";

describe("modelValueContractModel", () => {
  it("models defineModel as prop plus update event", () => {
    const contract = createModelValueContract("modelValue", "string", true);

    expect(contract.updateEventName).toBe("update:modelValue");
    expect(isModelUpdateEvent(contract, "update:modelValue")).toBe(true);
  });
});
```
</div>

**逐行解释：**

trigger slot 接收 `open` callback；callback emit `update:open(true)`；`open` 为 true 时渲染 role dialog section；`closeDialog()` 同时 emit `update:open(false)` 与 `close`。model test 只证明 update event pattern，不证明 focus trap。

**执行过程：**

parent 持有 `dialogOpen` ref，trigger slot 调用 open callback 后 parent 更新 ref；Vue 重新渲染 shell；footer slot 调用 close callback 后 ref 变回 false，dialog subtree 被移除。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

controlled state 从 parent ref 进入 `open` prop，slot callback 发出 update event，content/footer slot 根据状态出现或消失；focus trap 证据不存在时 failure signal 保持 external。

**为什么得到这个结果：**

结果成立是因为 shell 只拥有结构和状态 contract，不拥有完整焦点算法。把它写成“完整 dialog”会越过当前代码能证明的边界。

**对比写法：**

正确写法是称为 dialog shell 并记录 focus delegation；错误写法是只要有 `role="dialog"` 就宣称 modal accessible。

**常见错误为什么错：**

忽略 `focus trap claim remains external` 会制造虚假可访问性承诺。consumer 可能以为组件已经处理所有键盘细节，但源码只提供 open/close 结构。

**与真实项目的关系：**

真实组件库可在此基础上接入经过测试的 focus trap、escape handling、portal 和 scroll lock；本 lab 只教 controlled shell boundary。

**与当前学习主线的关系：**

本节连接 Chapter 03 的 slot contract、Chapter 05 的 model event 和 Chapter 15 的 focus-management evidence。

**最终记忆模型：**

DsDialogShell = controlled open state + named slots + close events; focus trap remains unproven.

<a id="section-9-9"></a>

### 9.9 Slots and compound components：card、stack、header/body/footer slots and layout composition

**结论：**

本节把 `header default footer slots` 放进 `src/learning/vue/chapter-18-design-system-library/library/DsCard.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts` 证明对应 contract；如果出现 `required slot missing from story`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 compound component 的职责分配。`DsCard` 负责结构区域，`DsStack` 负责布局节奏，consumer 负责 slot 内容。如果这些职责混在一个巨型 prop API 里，组件很快会变成业务页面模板。

**技术意义：**

header/default/footer slots 让 Card 保持稳定 DOM 区域，同时允许 consumer 提供内容。Stack 的 direction/gap prop 提供有限布局选择，避免让 Card 暴露任意布局 CSS。documentation story 需要覆盖这些组合状态。

**概念解释：**

slot composition 是 parent 提供 render content，child 决定 content 放在哪里。optional slot 可以不存在；required slot 如果存在于 contract，就必须出现在 story coverage 和测试模型中。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节关注 composition surface。`DsCard.vue` 拥有 header/default/footer slot placement，`DsStack.vue` 拥有 direction/gap layout；内容语义由 consumer 提供。optional slot 可以缺省，required slot 必须进入 docs/story evidence。

**Design System 机制证据链：**

1. slot content composition 出现；2. DsCard.vue and DsStack.vue 创建或读取 header default footer slots；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts`；6. `required slot missing from story` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 在当前代码中不会自动验证 `$slots.header` 是否被提供；slot requirements 由 `SlotContract` 和 documentation story model 表达。`vue-tsc` 能检查组件 import，却不能保证故事覆盖所有组合状态。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

Vue render 时检查 `$slots.header` 与 `$slots.footer`，存在才渲染区域；default slot 始终作为 body 内容。`DsStack` 根据 props 输出方向和间距 class，浏览器负责 flex layout。

**API / 语法规则：**

Card API 是 named slots：`header`、default、`footer`。Stack API 是 finite props：`direction` 和 `gap`。compound component 通过组合小组件形成布局，而不是让 card 接收任意 raw layout CSS。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/library/DsCard.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsCard.vue</span>
  </div>

```vue
<template>
  <article class="ds-card">
    <header v-if="$slots.header" class="ds-card__header">
      <slot name="header" />
    </header>
    <div class="ds-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="ds-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { findMissingStoryStates } from "../models/documentationStoryModel";

describe("documentationStoryModel", () => {
  it("requires meaningful state stories", () => {
    expect(
      findMissingStoryStates(
        [
          {
            title: "Button default",
            componentName: "DsButton",
            state: "default",
            args: { variant: "primary" },
            purpose: "Document default action.",
            antiExample: false,
          },
        ],
        ["default", "loading"],
      ),
    ).toEqual(["loading"]);
  });
});
```
</div>

**逐行解释：**

`DsCard.vue` 用 `$slots.header` 和 `$slots.footer` 判断是否渲染区域，default slot 始终进入 body；`DsStack.vue` 把 direction/gap 变成 class。story model 测试检查 required state 是否被文档覆盖。

**执行过程：**

consumer 在 `DesignSystemLibraryChapterApp.vue` 提供 header/footer slots；Vue 调用 slot function 生成内容；Stack 接收 gap prop 输出 class；story test 检查 required state 是否有文档覆盖。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

slot content 从 parent template 进入 card region，layout prop 进入 stack class，documentation story 记录组合状态；required slot 未记录时成为 docs coverage failure signal。

**为什么得到这个结果：**

结果来自 ownership 分离：Card 拥有结构位置，Stack 拥有布局节奏，consumer 拥有内容。这样组件库能稳定布局 contract，又不吞掉业务内容。

**对比写法：**

正确写法是 named slots 组合结构；错误写法是给 Card 增加大量 `headerText`、`footerButtonText` 这类业务 prop，或让 consumer 覆盖内部 DOM。

**常见错误为什么错：**

忽略 `required slot missing from story` 会让某些组合只能从源码猜测。文档缺口在组件库中就是 consumer contract 缺口。

**与真实项目的关系：**

真实 design system 会给 compound components 写 story matrix，覆盖 empty/header/footer/action 等状态；本节用 model test 证明 story coverage 可以被 gate 检查。

**与当前学习主线的关系：**

本节回到 Chapter 03 的 slots，但重点从“传内容”升级为“定义可复用组件的 composition surface”。

**最终记忆模型：**

Compound components = owned layout slots + finite layout props + documented state coverage.

<a id="section-9-10"></a>

### 9.10 Fallthrough attributes and wrapper boundary：inheritAttrs、useAttrs、native element forwarding and multi-root risk

**结论：**

本节把 `native-control target` 放进 `src/learning/vue/chapter-18-design-system-library/models/fallthroughAttrsModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/fallthroughAttrsModel.test.ts` 证明对应 contract；如果出现 `wrapper target is risky`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 wrapper component 最隐蔽的破坏：consumer 传入的 aria、data attribute 或 listener 看似到了组件，实际落在外层 wrapper，真实 native control 没收到。

**技术意义：**

fallthrough attrs 是 consumer 对底层元素的意图。`fallthroughAttrsModel.ts` 用 `native-control`、`wrapper`、`not-forwarded` 描述落点风险，提醒 wrapper 组件不能只关注视觉结构。

**概念解释：**

`inheritAttrs` 控制自动继承；`useAttrs()` 允许手动读取 attrs；multi-root SFC 必须显式决定转发目标。对于 button/input 这类组件，正确目标通常是真正的 native control。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 attrs forwarding。`inheritAttrs` 决定未声明 attrs 是否自动落到 root；`useAttrs()` 可让 wrapper 手动选择目标；multi-root component 必须显式处理。模型用 `target: "native-control"` 表达正确落点。

**Design System 机制证据链：**

1. fallthrough attrs 出现；2. attrs forwarding decision 创建或读取 native-control target；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/fallthroughAttrsModel.test.ts`；6. `wrapper target is risky` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 能描述 `AttrForwardingDecision.target`、`multiRoot` 和 `forwardsListeners`，但无法静态证明真实 SFC 把 `$attrs` 绑定到了 input 还是 wrapper div。这个 gap 需要 component test 或 manual DOM inspection。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

父组件传入 aria/data/listener attrs；Vue 把未声明 attrs 放进 fallthrough set。若 attrs 被转发到 native control，consumer 期望保留；若落在 wrapper，label、form、listener 或 testing selector 可能失效。

**API / 语法规则：**

关键 API 是 `inheritAttrs: false` 和 `useAttrs()` 的概念边界，以及 `v-bind="$attrs"` 的具体目标选择。本 lab 用 `assessAttrForwarding()` 模型化风险，不改真实组件 attrs 实现。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/fallthroughAttrsModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/fallthroughAttrsModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/fallthroughAttrsModel.ts</span>
  </div>

```ts
export type AttrForwardingTarget = "native-control" | "wrapper" | "not-forwarded";
export type AttrForwardingRisk = "safe" | "risky";

export interface AttrForwardingDecision {
  readonly componentName: string;
  readonly target: AttrForwardingTarget;
  readonly multiRoot: boolean;
  readonly forwardsListeners: boolean;
}

export function assessAttrForwarding(
  decision: AttrForwardingDecision,
): AttrForwardingRisk {
  if (decision.target !== "native-control") {
    return "risky";
  }

  if (decision.multiRoot && !decision.forwardsListeners) {
    return "risky";
  }

  return "safe";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/fallthroughAttrsModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { assessAttrForwarding } from "../models/fallthroughAttrsModel";

describe("fallthroughAttrsModel", () => {
  it("flags wrapper forwarding as risky for native controls", () => {
    expect(
      assessAttrForwarding({
        componentName: "DsButton",
        target: "wrapper",
        multiRoot: false,
        forwardsListeners: true,
      }),
    ).toBe("risky");
  });
});
```
</div>

**逐行解释：**

测试构造 `target="wrapper"` 的 decision；`assessAttrForwarding()` 先检查 target，不是 native-control 就返回 risky；如果 multi-root 且 listener 未转发，也返回 risky。这个模型解释为什么 UI 正常也可能 contract 错位。

**执行过程：**

测试构造 target 为 wrapper 的 decision；`assessAttrForwarding()` 看到目标不是 native-control 后返回 `risky`。multi-root 且 listener 未转发也会被视为 risky。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

attrs 从 consumer call site 进入 fallthrough set，forwarding target 决定 browser 接收者，test assertion 把 wrapper target 转成 failure signal，release gate 不能忽略这个风险。

**为什么得到这个结果：**

结果来自 consumer expectation：传给 Button 的 `aria-label`、`data-testid` 或 click listener 通常期望落到 button，而不是外层容器。wrapper 吞 attrs 会让组件表面看似工作，实际契约错位。

**对比写法：**

正确写法是把 native-control attrs 转到真实 `<button>` 或 `<input>`；错误写法是多根组件不处理 `$attrs`，或把所有 attrs 绑到装饰 wrapper。

**常见错误为什么错：**

忽略 `wrapper target is risky` 会破坏测试选择器、可访问名称和原生事件路径。这个错误常在封装样式容器时出现，因为 UI 仍然看起来正常。

**与真实项目的关系：**

真实库组件需要为每个 wrapper 写 attrs forwarding test，尤其是 form control、button、link 和 menu item；本节提供风险模型而不重写源码。

**与当前学习主线的关系：**

本节连接 Chapter 03 的 attrs/fallthrough 机制和 Chapter 15 的可访问属性落点问题。

**最终记忆模型：**

Fallthrough attrs are consumer intent; wrapper components must forward them to the correct native target.

<a id="section-9-11"></a>

### 9.11 Component state matrix：default、hover、focus、disabled、loading、error、selected and empty states

**结论：**

本节把 `default focus disabled loading` 放进 `src/learning/vue/chapter-18-design-system-library/models/componentStateMatrixModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/componentStateMatrixModel.test.ts` 证明对应 contract；如果出现 `missing disabled or error state blocks docs`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决组件状态只看 default 的问题。设计系统组件必须说明 default、hover、focus、disabled、loading、error、selected、empty 等状态，否则 consumer 会在异常状态下第一次发现缺口。

**技术意义：**

`componentStateMatrixModel.ts` 把状态覆盖变成集合差：required states 是基线，component coverage 是当前证据。只要差集非空，文档、测试或视觉 review 都还不完整。

**概念解释：**

state matrix 不是截图目录，而是 public behavior inventory。TypeScript union 保证状态名合法；`findMissingComponentStates()` 保证缺口可计算；visual review 仍需要外部工具或人工执行。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 state coverage。`requiredComponentStates` 列出 default、hover、focus、disabled、loading、error、selected、empty；它不负责截图工具，也不替代手动视觉审查。

**Design System 机制证据链：**

1. state coverage review 出现；2. componentStateMatrixModel.ts 创建或读取 default focus disabled loading；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/componentStateMatrixModel.test.ts`；6. `missing disabled or error state blocks docs` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 限制 `ComponentStateName` 只能取八个已知状态；它能阻止拼错状态名，但不能证明 hover/focus 样式在浏览器中可见，也不能证明视觉回归没有发生。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`ComponentStateMatrixPanel.vue` 读取 coverage ref 和 computed missing states；点击按钮添加 `error` 状态后，Vue 更新 ref，computed 重新计算缺口，面板立即反映 matrix 变化。

**API / 语法规则：**

核心 API 是 `findMissingComponentStates()` 和 `useComponentStateMatrix()`。组件状态必须以有限 union 表达，不能靠截图文件名或设计稿备注隐式存在。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/componentStateMatrixModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/componentStateMatrixModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/componentStateMatrixModel.ts</span>
  </div>

```ts
export type ComponentStateName =
  | "default"
  | "hover"
  | "focus"
  | "disabled"
  | "loading"
  | "error"
  | "selected"
  | "empty";

export interface ComponentStateCoverage {
  readonly componentName: string;
  readonly states: readonly ComponentStateName[];
}

export const requiredComponentStates: readonly ComponentStateName[] = [
  "default",
  "hover",
  "focus",
  "disabled",
  "loading",
  "error",
  "selected",
  "empty",
];

export function findMissingComponentStates(
  coverage: ComponentStateCoverage,
  requiredStates: readonly ComponentStateName[] = requiredComponentStates,
): readonly ComponentStateName[] {
  const covered = new Set(coverage.states);

  return requiredStates.filter((state) => !covered.has(state));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/componentStateMatrixModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { findMissingComponentStates } from "../models/componentStateMatrixModel";

describe("componentStateMatrixModel", () => {
  it("finds uncovered component states", () => {
    expect(
      findMissingComponentStates({
        componentName: "DsButton",
        states: ["default", "focus"],
      }),
    ).toContain("disabled");
  });
});
```
</div>

**逐行解释：**

`requiredComponentStates` 列出八个状态；`findMissingComponentStates()` 把 coverage.states 转成 Set，再过滤 required states；composable 的 `addState()` 创建新 coverage object，触发 Vue computed missing list 更新。

**执行过程：**

初始 coverage 只有 default/focus/disabled/loading；model function 与 computed 都会返回其余缺口；点击 Add error state 后，`addState("error")` 创建新 coverage object，missing list 缩短。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

state matrix 从 required union 进入 coverage object，missing-state list 进入 panel output，test assertion 固定 disabled/error 等缺口识别；缺失状态成为 docs/review failure signal。

**为什么得到这个结果：**

结果成立是因为状态覆盖是集合差问题：required set 不变，coverage set 可变。TypeScript 保证元素合法，测试保证差集逻辑。

**对比写法：**

正确写法是显式列出每个组件状态；错误写法是只有 default screenshot，然后假设 hover、focus、disabled 和 error 都会自然可用。

**常见错误为什么错：**

忽略 `missing disabled or error state blocks docs` 会让 consumer 在异常或不可用状态下首次发现样式问题。组件库状态不是边缘情况，而是 API 的一部分。

**与真实项目的关系：**

真实 design system 会把 state matrix 连接到 docs stories、component tests 和 visual review；本地模型只证明缺口能被发现。

**与当前学习主线的关系：**

本节连接 Chapter 08 的 UI 状态和 Chapter 10 的测试思维，为后续 visual regression boundary 做铺垫。

**最终记忆模型：**

State matrix = required finite states minus covered states; non-empty difference blocks confidence.

<a id="section-9-12"></a>

### 9.12 Accessibility contract：keyboard、focus visible、name/description、role/state and manual verification evidence

**结论：**

本节把 `name description keyboard` 放进 `src/learning/vue/chapter-18-design-system-library/models/accessibilityContractModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts` 证明对应 contract；如果出现 `missing keyboard evidence`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 accessibility 被下游应用“最后补救”的错误。组件库交付的每个基础组件都应该声明 role、name、description、keyboard、focus-visible、state 等 requirement，并记录哪些已经验证。

**技术意义：**

`AccessibilityContract` 把 requirement 与 verified evidence 分开。这样文档不能只写“支持可访问性”，而要说明哪些 requirement 有测试、哪些仍需要 manual verification。

**概念解释：**

accessibility evidence accounting 是差集模型：requirements 是应有项，verifiedRequirements 是已证明项，missing list 是 release reviewer 需要处理的缺口。TypeScript 能限制 requirement 名称，但不能读浏览器 accessibility tree。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 accessibility contract。role、name、description、keyboard、focus-visible 和 state 是组件库要交付的 requirement；model evidence 只能指出缺口，不能替代真实键盘和辅助技术检查。

**Design System 机制证据链：**

1. a11y requirement 出现；2. AccessibilityContract 创建或读取 name description keyboard；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts`；6. `missing keyboard evidence` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 可以限制 `AccessibilityRequirement` union，确保面板和测试不会引用未知 requirement；它不能读取 accessibility tree，也不能判断焦点环是否可见。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`AccessibilityContractPanel.vue` 调用 `findMissingAccessibilityEvidence()`，把 requirements 与 verifiedRequirements 做集合差。Vue 只渲染 missing evidence 文本；浏览器行为仍要通过 manual 或 component-level assertions 验证。

**API / 语法规则：**

核心 API 是 `AccessibilityContract` 和 `findMissingAccessibilityEvidence()`。每个 component 应声明 requirement，再记录已验证项；没有 evidence 的 requirement 不能被文档写成 PASS。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/accessibilityContractModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/accessibilityContractModel.ts</span>
  </div>

```ts
export type AccessibilityRequirement =
  | "role"
  | "name"
  | "description"
  | "keyboard"
  | "focus-visible"
  | "state";

export interface AccessibilityContract {
  readonly componentName: string;
  readonly requirements: readonly AccessibilityRequirement[];
  readonly verifiedRequirements: readonly AccessibilityRequirement[];
}

export function findMissingAccessibilityEvidence(
  contract: AccessibilityContract,
): readonly AccessibilityRequirement[] {
  const verified = new Set(contract.verifiedRequirements);

  return contract.requirements.filter((requirement) => !verified.has(requirement));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/accessibilityContractModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { findMissingAccessibilityEvidence } from "../models/accessibilityContractModel";

describe("accessibilityContractModel", () => {
  it("requires evidence for each accessibility requirement", () => {
    expect(
      findMissingAccessibilityEvidence({
        componentName: "DsTextField",
        requirements: ["name", "description", "keyboard"],
        verifiedRequirements: ["name"],
      }),
    ).toEqual(["description", "keyboard"]);
  });
});
```
</div>

**逐行解释：**

`findMissingAccessibilityEvidence()` 把 verifiedRequirements 放入 Set，再返回未验证 requirement。panel 用 DsTextField 示例显示缺少 state/keyboard；测试断言 name 已验证时 description/keyboard 仍会被报告。

**执行过程：**

面板传入 DsTextField 的 name/description/state/keyboard requirement；verified 只有 name/description；model 返回 state/keyboard，提示 release reviewer 仍缺证据。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

a11y requirement 从 component contract 进入 evidence model，verified list 删除已证明项目，missing list 进入 panel；keyboard 缺口成为 release failure signal。

**为什么得到这个结果：**

结果来自证据差异：声明 requirement 不等于完成验证。库组件必须把 accessibility 当作自身 contract，而不是推给每个下游页面补救。

**对比写法：**

正确写法是为每个组件列出 requirement 与 verification evidence；错误写法是只说“符合可访问性”，却没有 role/name/keyboard/focus 的具体证据。

**常见错误为什么错：**

忽略 `missing keyboard evidence` 会让组件在鼠标路径通过后仍可能阻塞键盘用户。这个错误通常被截图和类型检查掩盖。

**与真实项目的关系：**

真实项目需要 role/name queries、keyboard tests、manual screen reader review 和 issue tracking；本节只提供本地 evidence accounting。

**与当前学习主线的关系：**

本节专门承接 Chapter 15，不再把 accessibility 当成最终发布时才补的检查项。

**最终记忆模型：**

Accessibility contract = declared requirement + verified evidence; missing evidence remains blocking.

<a id="section-9-13"></a>

### 9.13 Security and customization boundary：token allowlist、no arbitrary CSS string, no unsafe HTML and safe icon/content slots

**结论：**

本节把 `token slot raw-css raw-html` 放进 `src/learning/vue/chapter-18-design-system-library/models/securityTokenBoundaryModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts` 证明对应 contract；如果出现 `raw-html is unsafe`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决“组件库越可定制越好”的误解。可定制必须是有限且可审查的：token 和 slot 可以进入 contract，raw CSS 与 raw HTML 不能作为普通 props 开放。

**技术意义：**

`securityTokenBoundaryModel.ts` 把 customization 分为 token、slot、raw-css、raw-html。这个分类让安全审查能在 model 层发现危险输入，而不是等到组件渲染后才发现布局或 XSS 风险。

**概念解释：**

token allowlist 提供可控样式变化；slot customization 提供受 Vue 渲染规则约束的内容组合；raw CSS 会绕过 token governance；raw HTML 会绕过模板安全边界。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 customization safety。允许的输入只有 token 和 slot；raw CSS 与 raw HTML 被模型标记为 unsafe。主题切换不能成为任意 CSS 注入面，内容 slot 也不能变成未审查 HTML 渲染。

**Design System 机制证据链：**

1. customization input 出现；2. securityTokenBoundaryModel.ts 创建或读取 token slot raw-css raw-html；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts`；6. `raw-html is unsafe` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 用 `CustomizationInputKind` 限定输入种类，能阻止拼错 kind；它不能证明某个 slot 内容业务上安全，也不能自动审查 CSS side effect。unsafe 判定由 `isCustomizationSafe()` 和测试执行。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`SecurityTokenBoundaryPanel.vue` 构造 token、raw-css、slot 三个输入；model 过滤出 unsafe 项。Vue 只显示数量，没有执行 raw CSS，也没有用 `v-html` 渲染 raw HTML。

**API / 语法规则：**

核心 API 是 `isCustomizationSafe()` 和 `findUnsafeCustomizationInputs()`。设计系统应提供 token allowlist、finite props 和 slots，而不是 CSS string prop 或 raw markup prop。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/securityTokenBoundaryModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/securityTokenBoundaryModel.ts</span>
  </div>

```ts
export type CustomizationInputKind = "token" | "slot" | "raw-css" | "raw-html";

export interface CustomizationInput {
  readonly kind: CustomizationInputKind;
  readonly value: string;
}

export function isCustomizationSafe(input: CustomizationInput): boolean {
  return input.kind === "token" || input.kind === "slot";
}

export function findUnsafeCustomizationInputs(
  inputs: readonly CustomizationInput[],
): readonly CustomizationInput[] {
  return inputs.filter((input) => !isCustomizationSafe(input));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { findUnsafeCustomizationInputs } from "../models/securityTokenBoundaryModel";

describe("securityTokenBoundaryModel", () => {
  it("blocks raw style and markup customization", () => {
    const unsafe = findUnsafeCustomizationInputs([
      { kind: "token", value: "color.action" },
      { kind: "raw-html", value: "<script></script>" },
    ]);

    expect(unsafe).toHaveLength(1);
    expect(unsafe[0]?.kind).toBe("raw-html");
  });
});
```
</div>

**逐行解释：**

`isCustomizationSafe()` 只接受 token 或 slot；`findUnsafeCustomizationInputs()` 过滤出其他 kind。panel 中 raw-css 只是 inert data；测试用 raw-html 证明危险输入会被拦截，没有进入 `v-html` 或 `innerHTML`。

**执行过程：**

测试传入 raw-html；model 检查 kind 不是 token/slot 后返回 unsafe；面板中的 raw-css 示例同样只作为 inert data 显示，不进入 style attribute 或 DOM HTML。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

customization input 从 consumer request 进入安全模型，token/slot 保留，raw-css/raw-html 被剔除；test assertion 将 unsafe kind 转成 release failure signal。

**为什么得到这个结果：**

结果成立是因为可复用组件会跨页面传播风险。任意 CSS 可以破坏布局或隐藏内容，raw HTML 会引入 XSS 面；有限 token 和 slot contract 才可审查。

**对比写法：**

正确写法是 `variant="danger"`、semantic token 或 icon slot；错误写法是 `customCss="..."`、`html="..."` 或把用户字符串传进 `v-html`。

**常见错误为什么错：**

忽略 `raw-html is unsafe` 会把设计系统变成跨应用注入通道。安全边界一旦放进基础组件，所有 consumer 都会继承。

**与真实项目的关系：**

真实项目需要安全 review、allowed token registry、slot usage notes 和 lint/test guard；本节只在本地模型中证明 unsafe customization 会被发现。

**与当前学习主线的关系：**

本节直接连接 Chapter 16 的 security boundary，并解释为什么 theme runtime 与 customization safety 必须分开。

**最终记忆模型：**

Safe customization = finite tokens or slots; raw CSS and raw HTML stay outside the component API.

<a id="section-9-14"></a>

### 9.14 Documentation stories：component state stories, controls model, usage notes and anti-example documentation

**结论：**

本节把 `default loading disabled` 放进 `src/learning/vue/chapter-18-design-system-library/models/documentationStoryModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts` 证明对应 contract；如果出现 `missing loading story`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决“有一个展示故事就等于有文档”的问题。设计系统故事必须覆盖 meaningful states、controls、usage notes 和 anti-example，否则 consumer 只知道 happy path。

**技术意义：**

`documentationStoryModel.ts` 让 story 变成可检查的数据：title、componentName、state、args、purpose、antiExample。docs coverage 因此可以被测试，而不是只靠页面看起来完整。

**概念解释：**

story 是文档证据，不是行为证明。它说明某个状态如何使用，但不自动证明 keyboard、emit、attrs forwarding 或视觉回归都通过。Storybook 如果未来安装，也只是承载这些故事的工具。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 documentation story model。story 描述 component、state、args、purpose 和 antiExample；它能指导读者理解状态，但不自动证明 accessibility、behavior 或 visual regression。Storybook 在这里只是概念边界，没有安装。

**Design System 机制证据链：**

1. story coverage 出现；2. DocumentationStory 创建或读取 default loading disabled；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts`；6. `missing loading story` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 检查 `DocumentationStory.state` 必须来自 `ComponentStateName`，`args` 只能是 string/boolean map；它不能证明 story 截图存在，也不能证明交互控件覆盖所有路径。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`DocumentationStoryPanel.vue` 创建一个 default story，再要求 default/disabled/loading；model 返回缺失状态。Vue 渲染 missing list，提醒 docs coverage 不完整。

**API / 语法规则：**

核心 API 是 `DocumentationStory` 和 `findMissingStoryStates()`。controls 应该是 finite args，anti-example 应该明确 misuse，而不是把所有 props 随意开放。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/documentationStoryModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/documentationStoryModel.ts</span>
  </div>

```ts
import type { ComponentStateName } from "./componentStateMatrixModel";

export interface DocumentationStory {
  readonly title: string;
  readonly componentName: string;
  readonly state: ComponentStateName;
  readonly args: Readonly<Record<string, string | boolean>>;
  readonly purpose: string;
  readonly antiExample: boolean;
}

export function findMissingStoryStates(
  stories: readonly DocumentationStory[],
  requiredStates: readonly ComponentStateName[],
): readonly ComponentStateName[] {
  const documentedStates = new Set(stories.map((story) => story.state));

  return requiredStates.filter((state) => !documentedStates.has(state));
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/documentationStoryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { findMissingStoryStates } from "../models/documentationStoryModel";

describe("documentationStoryModel", () => {
  it("requires meaningful state stories", () => {
    expect(
      findMissingStoryStates(
        [
          {
            title: "Button default",
            componentName: "DsButton",
            state: "default",
            args: { variant: "primary" },
            purpose: "Document default action.",
            antiExample: false,
          },
        ],
        ["default", "loading"],
      ),
    ).toEqual(["loading"]);
  });
});
```
</div>

**逐行解释：**

`findMissingStoryStates()` 收集 stories 中已有 state，再与 required states 比较；panel 只有 default story，却要求 disabled/loading，于是返回缺口。测试固定 missing loading 的结果。

**执行过程：**

story list 进入 model function，函数提取 documented state set，与 required states 比较；`loading` 未出现，所以测试和面板都能暴露缺口。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

story metadata 从 docs source 进入 coverage model，state set 进入 test assertion，missing state 进入 docs failure signal；anti-example flag 保留误用说明的空间。

**为什么得到这个结果：**

结果来自 docs coverage 不是文字数量，而是状态矩阵覆盖。一个漂亮 story 只证明 default 状态可展示，不证明 loading 或 disabled 有说明。

**对比写法：**

正确写法是为 default、loading、disabled、error 等状态写有目的的 story；错误写法是只有一个 showcase story，然后把它当成完整文档。

**常见错误为什么错：**

忽略 `missing loading story` 会让 consumer 在异步状态下无参考实现。stories 的职责是沟通 contract，不是装饰 docs 页面。

**与真实项目的关系：**

真实 design system 可以把该模型迁移到 Storybook CSF 或 docs site；本地 lab 不声明 Storybook deployment，只证明 story coverage rule。

**与当前学习主线的关系：**

本节连接 Chapter 10 的 coverage 思路和 Chapter 11 的发布证据，但聚焦文档状态而不是构建输出。

**最终记忆模型：**

Documentation story = state + args + purpose; missing required state means docs coverage gap.

<a id="section-9-15"></a>

### 9.15 Component playground：controlled inputs, safe controls, state preview and no production telemetry claim

**结论：**

本节把 `variant select options` 放进 `src/learning/vue/chapter-18-design-system-library/components/ComponentPlaygroundPanel.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts` 证明对应 contract；如果出现 `raw CSS control is not safe`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 playground 失控问题。playground 应该帮助学习者用安全控件观察组件状态，而不是提供 raw CSS、任意 HTML 或生产 telemetry 入口。

**技术意义：**

`ComponentPlaygroundPanel.vue` 使用 finite select 控制 `variant`，再把它传给 `DsButton`。这个受控路径能展示状态切换，同时保持组件 API、token 边界和安全定制规则不被绕过。

**概念解释：**

playground control 是文档交互，不是 runtime configuration system。select options、boolean 和有限文本可以审查；CSS textarea、HTML editor 或 analytics collector 不属于本地学习面板。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 local playground。`ComponentPlaygroundPanel.vue` 用 finite select 控制 button variant，用 ref 保存 preview state；它不发送 telemetry，不接受 raw CSS control，也不代表 production analytics。

**Design System 机制证据链：**

1. playground control 出现；2. playgroundControlModel.ts 创建或读取 variant select options；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts`；6. `raw CSS control is not safe` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 把 `variant` ref 限定为 primary/secondary/danger；template select 只能提供这些 option。类型检查不能证明用户体验完整，但能防止 playground 把未知 variant 传给 `DsButton`。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

用户选择 variant 后，Vue 更新 `variant` ref，`DsButton` 接收新 prop 并改变 class。`safeControl` 来自 `isPlaygroundControlSafe()`，用于展示这个 control 没有 raw CSS 通道。

**API / 语法规则：**

本节 API 是 finite select、`ref<"primary" | "secondary" | "danger">`、`isPlaygroundControlSafe()` 和 `DsButton :variant`。playground 不应暴露自由文本 CSS 或模拟生产 telemetry。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/components/ComponentPlaygroundPanel.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/ComponentPlaygroundPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { isPlaygroundControlSafe } from "../models/playgroundControlModel";
import DsButton from "../library/DsButton.vue";

const variant = ref<"primary" | "secondary" | "danger">("primary");
const safeControl = isPlaygroundControlSafe({
  name: "variant",
  controlType: "select",
  options: ["primary", "secondary", "danger"],
  allowsRawCss: false,
});
</script>

<template>
  <section class="design-card">
    <h3>Component playground</h3>
    <label class="design-field">
      Variant
      <select v-model="variant">
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
        <option value="danger">Danger</option>
      </select>
    </label>
    <DsButton :variant="variant">Preview action</DsButton>
    <p>Safe control: {{ safeControl }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/securityTokenBoundaryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { findUnsafeCustomizationInputs } from "../models/securityTokenBoundaryModel";

describe("securityTokenBoundaryModel", () => {
  it("blocks raw style and markup customization", () => {
    const unsafe = findUnsafeCustomizationInputs([
      { kind: "token", value: "color.action" },
      { kind: "raw-html", value: "<script></script>" },
    ]);

    expect(unsafe).toHaveLength(1);
    expect(unsafe[0]?.kind).toBe("raw-html");
  });
});
```
</div>

**逐行解释：**

`variant` 是 primary/secondary/danger union ref；select `v-model` 更新 ref；`DsButton :variant` 重新渲染预览；`isPlaygroundControlSafe()` 证明该 control 没有 raw CSS 通道。

**执行过程：**

select v-model 写入 variant；Vue rerender button preview；model test 使用 unsafe raw customization 证明安全边界；面板不会调用网络、collector 或 analytics SDK。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

playground control 从 finite options 进入 ref，component prop 更新 preview，security model 拦截 raw CSS 类输入；failure signal 是出现允许任意 style 的 control。

**为什么得到这个结果：**

结果成立是因为 playground 是学习和 docs surface，不是生产配置入口。有限 controls 让状态可复现，raw CSS control 会绕开 token governance。

**对比写法：**

正确写法是 select、boolean、有限 text 等可审查 controls；错误写法是提供 CSS textarea 或把 playground events 当成真实 usage telemetry。

**常见错误为什么错：**

忽略 `raw CSS control is not safe` 会让文档工具成为未审查定制入口。看似方便的 playground 可能破坏组件 API 的有限性。

**与真实项目的关系：**

真实项目可把 playground 接入 docs site controls，但仍要保持 finite args、safe defaults 和 no-secret/no-telemetry policy。

**与当前学习主线的关系：**

本节承接 Chapter 17 的 observability 边界：本地交互可以展示状态，但不能声称生产 telemetry。

**最终记忆模型：**

Playground = controlled local preview + finite controls; no raw CSS, no production telemetry claim.

<a id="section-9-16"></a>

### 9.16 Component testing：model tests、component tests、role/name assertions、contract tests and visual regression boundary

**结论：**

本节把 `typecheck unit component visual-screenshot` 放进 `src/learning/vue/chapter-18-design-system-library/models/componentTestEvidenceModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/componentTestEvidenceModel.test.ts` 证明对应 contract；如果出现 `unknown required evidence blocks release`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决测试证据混为一谈的问题。model test、component test、role/name assertion、contract test、visual screenshot 各自证明不同层，不能用截图替代语义和行为验证。

**技术意义：**

`componentTestEvidenceModel.ts` 把 evidence type、status、required 和 evidence text 放在一起。release gate 可以据此区分 pass、fail、skipped、unknown，而不是把“未运行”误写成“通过”。

**概念解释：**

visual regression 只能发现外观漂移，不能证明 button 是 native、input 有 accessible name、emit payload 正确或 attrs 转发到正确元素。UNKNOWN required evidence 必须阻塞。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 testing evidence。model tests 验证决策函数，component tests 验证 rendered contract，role/name assertions 验证 accessibility surface，visual regression 只验证截图差异，不能证明语义或事件行为。

**Design System 机制证据链：**

1. evidence status 出现；2. componentTestEvidenceModel.ts 创建或读取 typecheck unit component visual-screenshot；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/componentTestEvidenceModel.test.ts`；6. `unknown required evidence blocks release` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 检查 `ComponentEvidenceType` 和 `EvidenceStatus` union，保证 evidence status 不随意拼写；它不能运行 DOM queries、不能比较截图、也不能决定 manual review 是否充分。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`blocksComponentRelease()` 遍历 evidence list，只要 required item 是 fail 或 unknown 就返回 true。这个函数不运行测试工具；它汇总已经产生的证据状态。

**API / 语法规则：**

核心 API 是 `ComponentTestEvidence` 与 `blocksComponentRelease()`。visual screenshot 可以作为 evidence type，但没有工具输出时 status 必须是 unknown，而不是 pass。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/componentTestEvidenceModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/componentTestEvidenceModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/componentTestEvidenceModel.ts</span>
  </div>

```ts
export type ComponentEvidenceType =
  | "typecheck"
  | "unit"
  | "component"
  | "accessibility-assertion"
  | "visual-screenshot"
  | "manual-review";

export type EvidenceStatus = "pass" | "fail" | "skipped" | "unknown";

export interface ComponentTestEvidence {
  readonly type: ComponentEvidenceType;
  readonly status: EvidenceStatus;
  readonly required: boolean;
  readonly evidence: string;
}

export function blocksComponentRelease(
  evidence: readonly ComponentTestEvidence[],
): boolean {
  return evidence.some(
    (item) => item.required && (item.status === "fail" || item.status === "unknown"),
  );
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/componentTestEvidenceModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { blocksComponentRelease } from "../models/componentTestEvidenceModel";

describe("componentTestEvidenceModel", () => {
  it("blocks required unknown evidence", () => {
    expect(
      blocksComponentRelease([
        {
          type: "visual-screenshot",
          status: "unknown",
          required: true,
          evidence: "No visual tool output.",
        },
      ]),
    ).toBe(true);
  });
});
```
</div>

**逐行解释：**

`blocksComponentRelease()` 遍历 evidence list；只要 required item 的 status 是 fail 或 unknown 就返回 true。测试传入 required visual-screenshot unknown，证明没有工具输出时不能声明 coverage。

**执行过程：**

测试传入 required visual-screenshot 且 status unknown；model 返回 blocked。若 component tests 或 role/name assertions fail，同一 release gate 也应阻塞。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

evidence item 从 test pipeline 进入 model，required flag 决定是否 blocking，status 决定 pass/fail/unknown；unknown required evidence 被转成 release failure signal。

**为什么得到这个结果：**

结果成立是因为 release gate 看的是证据状态，不是假设。截图不能证明 button emit、input label 或 attrs forwarding，所以 visual evidence 只能覆盖外观变化。

**对比写法：**

正确写法是组合 unit/model/component/a11y/manual/visual evidence；错误写法是只有 snapshot 或 screenshot，就声称 contract 全部通过。

**常见错误为什么错：**

忽略 `unknown required evidence blocks release` 会把未运行的检查当成成功。UNKNOWN 和 PASS 在组件库发布中必须严格区分。

**与真实项目的关系：**

真实 design system 会把 Vitest、Vue Test Utils、role/name queries、visual tool 和 manual review 接入同一 gate；本地 lab 只建模 gate rule。

**与当前学习主线的关系：**

本节直接扩展 Chapter 10：测试不只是数量，而是每种 evidence 覆盖不同 contract 层。

**最终记忆模型：**

Testing gate = required evidence list; fail or unknown required item blocks release.

<a id="section-9-17"></a>

### 9.17 Package export surface：public entry, internal modules, CSS export, type declaration and breaking-change boundary

**结论：**

本节把 `. and ./css` 放进 `src/learning/vue/chapter-18-design-system-library/models/packageExportModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/packageExportModel.test.ts` 证明对应 contract；如果出现 `internal path is blocked`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决源码路径和 package public API 混淆。组件库内部可以有很多模块，但 consumer 只能依赖显式公开的 entry；internal module 一旦被外部导入，就会变成隐性 breaking-change 风险。

**技术意义：**

`packageExportModel.ts` 用 `PackageExportEntry` 区分 public component entry、public CSS entry 和 internal module。`hasCssExport()` 还提醒样式文件本身也是 consumer contract。

**概念解释：**

package export surface 是 consumer import gate：`.` 代表主入口，`./css` 代表样式入口，`./internal/tokenResolver` 虽然存在于源码模型中，但 public=false，不能被文档或 consumer 使用。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 package export surface。`.` 和 `./css` 被建模为 public entries，`./internal/tokenResolver` 被标记 internal。type declaration 和 breaking-change 风险被记录为边界，但没有真实 package export map。

**Design System 机制证据链：**

1. consumer import path 出现；2. packageExportModel.ts 创建或读取 . and ./css；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/packageExportModel.test.ts`；6. `internal path is blocked` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 能检查 `PackageExportEntry.kind` 和 `public` flag；它不能证明 package.json exports 实际配置，也不能证明 consumer app 能安装并解析类型。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`PackageExportPanel.vue` 调用 `isPublicPackageImport()` 和 `hasCssExport()`，显示 root import、internal import 和 CSS export 状态。package consumer 在真实世界只能依赖 public path。

**API / 语法规则：**

核心 API 是 `isPublicPackageImport(entries, path)` 与 `hasCssExport(entries)`。internal modules 即使在源码中存在，也不应被 consumer 当成稳定路径。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/packageExportModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/packageExportModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/packageExportModel.ts</span>
  </div>

```ts
export interface PackageExportEntry {
  readonly path: string;
  readonly public: boolean;
  readonly kind: "component" | "composable" | "style" | "internal";
}

export const packageExportEntries: readonly PackageExportEntry[] = [
  { path: ".", public: true, kind: "component" },
  { path: "./css", public: true, kind: "style" },
  { path: "./internal/tokenResolver", public: false, kind: "internal" },
];

export function isPublicPackageImport(
  entries: readonly PackageExportEntry[],
  importPath: string,
): boolean {
  const entry = entries.find((candidate) => candidate.path === importPath);

  return entry?.public ?? false;
}

export function hasCssExport(entries: readonly PackageExportEntry[]): boolean {
  return entries.some((entry) => entry.public && entry.kind === "style");
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/packageExportModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  hasCssExport,
  isPublicPackageImport,
  packageExportEntries,
} from "../models/packageExportModel";

describe("packageExportModel", () => {
  it("blocks internal package imports", () => {
    expect(isPublicPackageImport(packageExportEntries, "./internal/tokenResolver")).toBe(false);
  });

  it("requires a CSS export path", () => {
    expect(hasCssExport(packageExportEntries)).toBe(true);
  });
});
```
</div>

**逐行解释：**

`isPublicPackageImport()` 查找 importPath 对应 entry，再返回 public flag；找不到时也返回 false。测试断言 internal path 被阻止，并确认 CSS export 存在。

**执行过程：**

测试查询 `./internal/tokenResolver`，model 找到 entry 但 public 为 false，所以返回 false；另一个测试确认 `./css` 这类 style export 存在。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

package export entry 从 model 进入 consumer import gate，public flag 决定可用性，CSS export 决定样式契约；internal import 被转成 breaking-change failure signal。

**为什么得到这个结果：**

结果来自 package boundary：源码路径不等于 public API。组件库可以重组 internal modules，但不能无故破坏 public entry。

**对比写法：**

正确写法是只文档化 `.`、`./css` 等 public entry；错误写法是在 README 或 app 里导入 `./internal/*`，再把 internal 改动当作 patch。

**常见错误为什么错：**

忽略 `internal path is blocked` 会让 consumer 依赖私有结构。以后重构 token resolver 时，所谓内部改动会变成外部 breaking change。

**与真实项目的关系：**

真实发布需要 package.json exports、types、CSS export、bundled files 和 consumer install 测试；本节只用本地 model 教 import gate。

**与当前学习主线的关系：**

本节把 Chapter 11 的 build 产物意识推进到 library consumer boundary，而不是只看 app dist 能否生成。

**最终记忆模型：**

Package boundary = public export entries are contract; internal paths are not consumer API.

<a id="section-9-18"></a>

### 9.18 Vite library mode boundary：build.lib, external Vue, peer dependency model and app-build vs library-build distinction

**结论：**

本节把 `externalVue and type declarations` 放进 `src/learning/vue/chapter-18-design-system-library/models/libraryBuildBoundaryModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/libraryBuildBoundaryModel.test.ts` 证明对应 contract；如果出现 `missing type declarations blocks readiness`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 `npm run build` 通过就等于组件库可发布的误解。Vite app build 面向浏览器应用入口；library build 面向 package consumer，需要 `build.lib`、external Vue、peer dependency、CSS export 和 type declarations。

**技术意义：**

`libraryBuildBoundaryModel.ts` 不配置真实 Vite library mode，而是列出 readiness flags。这样 guide 可以教学 app build 与 library build 的差异，同时避免虚假声明 package publish readiness。

**概念解释：**

library boundary 关注 consumer 怎么 import、Vue 是否被外置、样式如何导出、类型声明是否生成。当前项目只运行 app build，所以 type declaration evidence 和 package output 都保持 UNKNOWN。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 Vite library mode model。`build.lib`、external Vue、peer dependency、CSS export 和 type declarations 是 library readiness signals；本 guide 没有改 `vite.config.ts` 或 package files，因此不能声称真实 library build。

**Design System 机制证据链：**

1. library build model 出现；2. libraryBuildBoundaryModel.ts 创建或读取 externalVue and type declarations；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/libraryBuildBoundaryModel.test.ts`；6. `missing type declarations blocks readiness` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 能检查 `LibraryBuildBoundary` flags；`vue-tsc --noEmit` 只做 app/source typecheck，不生成 declaration files。真实 `.d.ts` output 需要单独配置和验证。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`LibraryBuildBoundaryPanel.vue` 用 model flags 计算 failure list。Vite app build 会生成本学习站点的 `dist`，但不会自动产出 reusable package entry、externalized Vue 或 consumer-facing CSS export。

**API / 语法规则：**

概念 API 是 Vite `build.lib`、Rollup external Vue、peer dependency declaration、CSS export 和 declaration generation。本节只建模这些开关，不运行 real package build。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/libraryBuildBoundaryModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/libraryBuildBoundaryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/libraryBuildBoundaryModel.ts</span>
  </div>

```ts
export interface LibraryBuildBoundary {
  readonly hasLibraryEntry: boolean;
  readonly externalVue: boolean;
  readonly hasCssExport: boolean;
  readonly hasTypeDeclarations: boolean;
}

export function evaluateLibraryBuildBoundary(
  boundary: LibraryBuildBoundary,
): readonly string[] {
  const failures: string[] = [];

  if (!boundary.hasLibraryEntry) {
    failures.push("missing-library-entry");
  }

  if (!boundary.externalVue) {
    failures.push("vue-not-external");
  }

  if (!boundary.hasCssExport) {
    failures.push("missing-css-export");
  }

  if (!boundary.hasTypeDeclarations) {
    failures.push("missing-type-declarations");
  }

  return failures;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/libraryBuildBoundaryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { evaluateLibraryBuildBoundary } from "../models/libraryBuildBoundaryModel";

describe("libraryBuildBoundaryModel", () => {
  it("blocks package readiness when type declarations are missing", () => {
    expect(
      evaluateLibraryBuildBoundary({
        hasLibraryEntry: true,
        externalVue: true,
        hasCssExport: true,
        hasTypeDeclarations: false,
      }),
    ).toContain("missing-type-declarations");
  });
});
```
</div>

**逐行解释：**

`evaluateLibraryBuildBoundary()` 逐项检查 hasLibraryEntry、externalVue、hasCssExport、hasTypeDeclarations；缺哪个就 push 对应 failure。测试把 type declarations 设为 false，得到 `missing-type-declarations`。

**执行过程：**

测试传入 hasLibraryEntry/externalVue/hasCssExport 为 true，但 hasTypeDeclarations 为 false；model 返回 `missing-type-declarations`，说明 package readiness 仍被阻塞。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

library boundary flags 从 release checklist 进入 model，failure array 进入 panel 和 test assertion；缺少 type declaration evidence 会阻塞 package readiness claim。

**为什么得到这个结果：**

结果成立是因为 app build 和 library build 的 entry 假设不同。app build 关注浏览器入口，library build 关注 consumer import、external peer 和 declaration surface。

**对比写法：**

正确写法是明确“本章只建模 library boundary”；错误写法是看到 `npm run build` 通过，就宣称组件库已经可发布。

**常见错误为什么错：**

忽略 `missing type declarations blocks readiness` 会让 TypeScript consumer 无法可靠使用库。运行 app typecheck 不等于生成 package types。

**与真实项目的关系：**

真实项目需要配置 library entry、external Vue、peerDependencies、exports、files、CSS entry 和 declaration output，再用 consumer app 验证。

**与当前学习主线的关系：**

本节连接 Chapter 11 的 production build，但专门指出 app build 与 library build 的差异。

**最终记忆模型：**

Vite library readiness = lib entry + external Vue + CSS export + declarations + consumer verification.

<a id="section-9-19"></a>

### 9.19 Versioning and deprecation：semver impact、deprecated props、migration notes、changelog and removal schedule

**结论：**

本节把 `removed-prop major` 放进 `src/learning/vue/chapter-18-design-system-library/models/versioningModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/versioningModel.test.ts` 证明对应 contract；如果出现 `empty migration note fails evidence`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 public API 变更没有生命周期的问题。组件库不能只改 prop 名称或视觉默认值，还必须判断 semver impact、给出 deprecation replacement、migration note、changelog 和 removal schedule。

**技术意义：**

`versioningModel.ts` 判断 change type 对应 patch/minor/major；`deprecationModel.ts` 检查 propName、replacement、firstDeprecatedVersion、plannedRemovalVersion 是否完整。版本策略因此可以被测试。

**概念解释：**

semver 是 consumer 兼容性语言：removed prop 是 major，新 prop 通常是 minor，bug fix 才可能是 patch。deprecation plan 是从旧 API 到新 API 的桥，不是简单警告。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 public API change management。semver impact、deprecated props、replacement、firstDeprecatedVersion、plannedRemovalVersion、migration note 和 changelog 都属于 release evidence；它不发布真实版本。

**Design System 机制证据链：**

1. public API change 出现；2. versioningModel.ts 创建或读取 removed-prop major；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/versioningModel.test.ts`；6. `empty migration note fails evidence` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 能限制 `SemverImpact` 和 `VersionChange.changeType`，但不能判断 consumer 受影响范围，也不能自动写 migration guide。migration evidence 由 `hasMigrationEvidence()` 检查。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`VersioningDeprecationPanel.vue` 计算 removed prop 的 impact 为 major，并检查 deprecation plan 是否完整。Vue runtime 不关心 semver；它只执行当前 prop。semver 是 package consumer contract。

**API / 语法规则：**

核心 API 是 `getSemverImpact()`, `hasMigrationEvidence()` 和 `isDeprecationPlanComplete()`。删除 prop 是 major；新增 prop 或视觉默认变化至少需要 minor/review；deprecation 必须有替代和移除版本。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/versioningModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/versioningModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/versioningModel.ts</span>
  </div>

```ts
export type SemverImpact = "patch" | "minor" | "major";

export interface VersionChange {
  readonly changeType:
    | "bug-fix"
    | "new-prop"
    | "removed-prop"
    | "visual-default-change";
  readonly migrationNote: string;
}

export function getSemverImpact(change: VersionChange): SemverImpact {
  if (change.changeType === "removed-prop") {
    return "major";
  }

  if (change.changeType === "new-prop" || change.changeType === "visual-default-change") {
    return "minor";
  }

  return "patch";
}

export function hasMigrationEvidence(change: VersionChange): boolean {
  return change.migrationNote.trim().length > 0;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/versioningModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { getSemverImpact, hasMigrationEvidence } from "../models/versioningModel";

describe("versioningModel", () => {
  it("marks removed props as major changes", () => {
    expect(getSemverImpact({ changeType: "removed-prop", migrationNote: "Use tone." })).toBe(
      "major",
    );
  });

  it("requires migration evidence", () => {
    expect(hasMigrationEvidence({ changeType: "new-prop", migrationNote: "" })).toBe(false);
  });
});
```
</div>

**逐行解释：**

`getSemverImpact()` 先判断 removed-prop，返回 major；new-prop 或 visual-default-change 返回 minor；否则 patch。`hasMigrationEvidence()` 检查 migrationNote 非空；deprecation test 检查替代和移除版本齐全。

**执行过程：**

测试传入 `removed-prop` 和 migration note，得到 major；再传入空 migration note，得到 false。panel 用 `colorIntent -> tone` 展示完整 deprecation lifecycle。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

version decision 从 changeType 进入 semver model，deprecated prop 进入 replacement/removal schedule，migration note 成为 evidence；空 note 是 release failure signal。

**为什么得到这个结果：**

结果来自 consumer compatibility：改名或删除 prop 会破坏调用方模板。没有 migration note，consumer 不知道如何从旧 API 迁移。

**对比写法：**

正确写法是先 deprecate、给 replacement、记录 removal version；错误写法是直接删 prop，再把失败归类为 consumer 使用不当。

**常见错误为什么错：**

忽略 `empty migration note fails evidence` 会让 breaking change 没有可执行迁移路径。版本号本身不能替代 changelog。

**与真实项目的关系：**

真实组件库需要 changelog、migration docs、deprecation warnings 和 removal schedule；本地 model 只检查最小 evidence shape。

**与当前学习主线的关系：**

本节连接 Chapter 14 的 migration 思维，把现代化/迁移要求应用到组件库 API 生命周期。

**最终记忆模型：**

Versioning = semver impact + deprecation plan + migration note before removal.

<a id="section-9-20"></a>

### 9.20 Design system release dashboard：coverage、a11y evidence、security token review、package boundary and release gate

**结论：**

本节把 `high open issue` 放进 `src/learning/vue/chapter-18-design-system-library/models/designSystemIssueModel.ts`，用 `src/learning/vue/chapter-18-design-system-library/tests/designSystemIssueModel.test.ts` 证明对应 contract；如果出现 `release blocked`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决 release gate 只看单个成功信号的问题。design system 发布必须同时聚合 token docs、tests、accessibility evidence、security review、package boundary 和 open issue severity。

**技术意义：**

`designSystemIssueModel.ts` 把发布条件变成一个 gate object。即使 testsPassing 变成 true，只要 high issue 仍 open，或安全/package/a11y 证据缺失，release 仍应该 blocked。

**概念解释：**

release dashboard 不是状态展示板，而是阻塞规则的可视化。boolean evidence 表示必需项是否完成，issue severity 表示风险等级，`isDesignSystemReleaseBlocked()` 把它们合并成最终决策。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 design-system release gate。token docs、tests、accessibility evidence、security review、package boundary documented 和 open high issues 一起决定 blocked 状态；它不代表真实 CI 或 release approval system。

**Design System 机制证据链：**

1. release gate review 出现；2. DesignSystemReleaseDashboard.vue 创建或读取 high open issue；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/designSystemIssueModel.test.ts`；6. `release blocked` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 检查 `DesignSystemReleaseGate` 的 boolean fields 和 issue severity union；它不能证明审查真的完成，只能保证 dashboard 输入形状可被 model function 读取。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

`DesignSystemReleaseDashboard.vue` 用 composable 保存 gate ref，computed `blocked` 调用 `isDesignSystemReleaseBlocked()`；点击按钮只能修改 local testsPassing，不会关闭 high issue。

**API / 语法规则：**

核心 API 是 `isDesignSystemReleaseBlocked()` 和 `useDesignSystemReleaseGate()`。任一 required evidence false 或 high open issue 都应阻塞；local button 只是 demo control。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/models/designSystemIssueModel.ts`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/designSystemIssueModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/designSystemIssueModel.ts</span>
  </div>

```ts
export type DesignSystemIssueSeverity = "low" | "medium" | "high";

export interface DesignSystemIssue {
  readonly id: string;
  readonly title: string;
  readonly severity: DesignSystemIssueSeverity;
  readonly open: boolean;
}

export interface DesignSystemReleaseGate {
  readonly tokenDocsComplete: boolean;
  readonly testsPassing: boolean;
  readonly accessibilityEvidenceComplete: boolean;
  readonly securityReviewComplete: boolean;
  readonly packageBoundaryDocumented: boolean;
  readonly issues: readonly DesignSystemIssue[];
}

export function isDesignSystemReleaseBlocked(
  gate: DesignSystemReleaseGate,
): boolean {
  const hasHighOpenIssue = gate.issues.some(
    (issue) => issue.open && issue.severity === "high",
  );

  return (
    hasHighOpenIssue ||
    !gate.tokenDocsComplete ||
    !gate.testsPassing ||
    !gate.accessibilityEvidenceComplete ||
    !gate.securityReviewComplete ||
    !gate.packageBoundaryDocumented
  );
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/designSystemIssueModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { isDesignSystemReleaseBlocked } from "../models/designSystemIssueModel";

describe("designSystemIssueModel", () => {
  it("blocks release when high severity issues are open", () => {
    expect(
      isDesignSystemReleaseBlocked({
        tokenDocsComplete: true,
        testsPassing: true,
        accessibilityEvidenceComplete: true,
        securityReviewComplete: true,
        packageBoundaryDocumented: true,
        issues: [
          {
            id: "DS-18-1",
            title: "Missing package boundary evidence",
            severity: "high",
            open: true,
          },
        ],
      }),
    ).toBe(true);
  });
});
```
</div>

**逐行解释：**

函数先检查是否存在 open high issue，再检查 tokenDocsComplete、testsPassing、accessibilityEvidenceComplete、securityReviewComplete、packageBoundaryDocumented。任一不满足就返回 true。panel 的 button 只改 testsPassing，不会关闭 high issue。

**执行过程：**

初始 gate 中 testsPassing 为 false 且存在 high open issue；computed blocked 为 true。点击 Mark local tests passing 后只改变 testsPassing，high issue 仍让 release 保持 blocked。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

release gate fields 从 dashboard state 进入 model，高严重度 issue 与 evidence booleans 合并为 blocked result；failure signal 是 `release blocked`。

**为什么得到这个结果：**

结果成立是因为 release gate 需要合取证据，不是单项成功。测试通过不能抵消高严重度 package boundary 或 security issue。

**对比写法：**

正确写法是让 token docs、tests、a11y、安全和 package boundary 全部进入 gate；错误写法是只看 build 通过就发布组件库。

**常见错误为什么错：**

忽略 `release blocked` 会把 dashboard 变成装饰性状态页。真正的 release gate 必须能阻止缺证据发布。

**与真实项目的关系：**

真实项目会把这个模型连接到 CI、issue tracker、review owner 和 release notes；本地 lab 只验证阻塞逻辑。

**与当前学习主线的关系：**

本节借用 Chapter 17 的 release evidence 思维，但只在最终 dashboard 讲一次，不把同一句话散落到每个小节。

**最终记忆模型：**

Release dashboard = required evidence booleans + high issues; any blocking signal stops release.

<a id="section-9-21"></a>

### 9.21 Chapter integration：how Chapter 18 connects UI, tests, accessibility, security, observability and migration

**结论：**

本节把 `design-system evidence panels` 放进 `src/learning/vue/chapter-18-design-system-library/DesignSystemLibraryChapterApp.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/deprecationModel.test.ts` 证明对应 contract；如果出现 `root shell missing chapter app`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节只在一个位置解释 Chapter 18 如何接入前面章节，避免每个小节都重复跨章节关系。这里关注的是 `DesignSystemLibraryChapterApp.vue` 如何把 UI、测试、可访问性、安全、证据和迁移整合成一个可运行学习入口。

**技术意义：**

Chapter 18 不是替换 Chapter 08 的 UI，也不是重写 Chapter 15/16/17；它把这些章节的能力收束到 component library 语境中。root shell 追加渲染 Chapter 18，说明新章节接入而旧章节保持原样。

**概念解释：**

integration 的对象是学习路径，不是 production architecture。`fieldValue` 和 `dialogOpen` 只是本章 preview state；panels 展示对应 model evidence；旧章节仍拥有各自主题。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 chapter integration。`DesignSystemLibraryChapterApp.vue` 把 panels 和 library preview 串起来，说明 Chapter 18 如何吸收 UI、testing、a11y、security、observability 和 migration；它不新增后端、发布或设计工具。

**Design System 机制证据链：**

1. chapter shell integration 出现；2. DesignSystemLibraryChapterApp.vue 创建或读取 design-system evidence panels；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/deprecationModel.test.ts`；6. `root shell missing chapter app` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 检查 Chapter 18 app 的 imports、refs 和 component usage；它不能证明前面章节的全部知识都已掌握，也不能证明 root shell 可视化结果符合学习顺序。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

root `App.vue` render Chapter 18 app 后，Vue 按顺序显示 token、contract、library、docs、package 和 release panels。`fieldValue` 与 `dialogOpen` 两个 ref 只服务本章 preview。

**API / 语法规则：**

本节没有新增底层 API；它组合前面出现的 `DsButton`、`DsTextField`、`DsAlert`、`DsDialogShell`、`DsCard`、`DsStack` 和 panels。integration 的规则是只连接本章，不改 Chapter 01–17 内容。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/DesignSystemLibraryChapterApp.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/deprecationModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/DesignSystemLibraryChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import "./design-system-library.css";
import AccessibilityContractPanel from "./components/AccessibilityContractPanel.vue";
import ComponentContractPanel from "./components/ComponentContractPanel.vue";
import ComponentPlaygroundPanel from "./components/ComponentPlaygroundPanel.vue";
import ComponentStateMatrixPanel from "./components/ComponentStateMatrixPanel.vue";
import DesignSystemReleaseDashboard from "./components/DesignSystemReleaseDashboard.vue";
import DesignTokenExplorer from "./components/DesignTokenExplorer.vue";
import DocumentationStoryPanel from "./components/DocumentationStoryPanel.vue";
import LibraryBuildBoundaryPanel from "./components/LibraryBuildBoundaryPanel.vue";
import PackageExportPanel from "./components/PackageExportPanel.vue";
import SecurityTokenBoundaryPanel from "./components/SecurityTokenBoundaryPanel.vue";
import ThemePreviewPanel from "./components/ThemePreviewPanel.vue";
import VersioningDeprecationPanel from "./components/VersioningDeprecationPanel.vue";
import DsAlert from "./library/DsAlert.vue";
import DsButton from "./library/DsButton.vue";
import DsCard from "./library/DsCard.vue";
import DsDialogShell from "./library/DsDialogShell.vue";
import DsStack from "./library/DsStack.vue";
import DsTextField from "./library/DsTextField.vue";
import DsVisuallyHidden from "./library/DsVisuallyHidden.vue";
import { ref } from "vue";

const fieldValue = ref("Design system input");
const dialogOpen = ref(false);
</script>

<template>
  <section class="chapter-section chapter-18" aria-labelledby="chapter-18-title">
    <header class="hero">
      <p class="eyebrow">Chapter 18</p>
      <h2 id="chapter-18-title">
        Design System, Reusable Component Library, Design Tokens, Documentation,
        and Package Boundary
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/deprecationModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { isDeprecationPlanComplete } from "../models/deprecationModel";

describe("deprecationModel", () => {
  it("requires replacement and removal schedule", () => {
    expect(
      isDeprecationPlanComplete({
        propName: "colorIntent",
        replacement: "tone",
        firstDeprecatedVersion: "1.4.0",
        plannedRemovalVersion: "2.0.0",
      }),
    ).toBe(true);
  });
});
```
</div>

**逐行解释：**

`DesignSystemLibraryChapterApp.vue` import CSS、panels 和 library components；template 先渲染 evidence grid，再渲染 library component preview；root `App.vue` 只追加 import 和 render point。deprecation test 仍属于 model-level validation。

**执行过程：**

应用启动时 root shell import Chapter 18 app；Chapter app import CSS、panels 和 library components；用户操作 text field 或 dialog shell 时，只更新本地 refs，不影响其他章节。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

chapter integration 从 root render point 进入 Chapter 18 app，组件 preview 产生局部 state，tests 仍在 model 层验证；缺少 root integration 会让 final lab 不可观察。

**为什么得到这个结果：**

结果成立是因为学习项目需要一个可运行入口。guide 可以解释机制，但 root shell integration 才让 learner 在浏览器中观察组件契约和 panels。

**对比写法：**

正确写法是新增 Chapter 18 app 并在 root shell 追加渲染；错误写法是重写旧章节、移动前面 panels 或把 design-system demo 塞进 Chapter 08。

**常见错误为什么错：**

忽略 `root shell missing chapter app` 会让文档和 practice files 脱节。学习指南声称可运行时，必须有实际入口。

**与真实项目的关系：**

真实项目集成 design system 时也要限制改动边界：引入库组件不应顺手重构所有旧页面。Chapter 18 只示范局部接入。

**与当前学习主线的关系：**

这是唯一集中说明跨章节关系的小节：Chapter 08 提供 UI 场景，Chapter 10 提供测试，Chapter 15/16/17/14 分别提供 a11y、安全、证据和迁移视角。

**最终记忆模型：**

Chapter integration = root shell renders Chapter 18 lab while earlier chapters remain unchanged.

<a id="section-9-22"></a>

### 9.22 Final integration：vue-design-system-library-lab 如何形成 reusable UI system evidence workspace

**结论：**

本节把 `tests docs a11y security package` 放进 `src/learning/vue/chapter-18-design-system-library/components/DesignSystemReleaseDashboard.vue`，用 `src/learning/vue/chapter-18-design-system-library/tests/visualRegressionBoundaryModel.test.ts` 证明对应 contract；如果出现 `visual regression remains UNKNOWN`，Chapter 18 release gate 不能放行。

**本节解决的问题：**

本节解决最终 lab 的边界声明：`vue-design-system-library-lab` 是本地 evidence workspace，不是已发布组件库、已部署文档站、已运行视觉回归或已验证 DTCG 的生产系统。

**技术意义：**

最终 lab 的价值是把 token、theme、base components、state matrix、docs model、security model、package model、versioning 和 release gate 放在一起，让学习者看到哪些证据已经本地可测，哪些仍是 UNKNOWN。

**概念解释：**

evidence workspace 的核心是区分 local proof 与 external proof。本地 tests 能证明 model decision；浏览器 preview 能证明 demo 可交互；package build、Storybook、visual regression、DTCG validation、consumer install 必须由外部流程实际运行。

**边界：design token、semantic token、CSS custom property、SFC scoped CSS、component props、emits、slots、attrs、defineModel、native element ownership、accessibility contract、security customization boundary、documentation story、state matrix、component test、visual regression boundary、package export、library build、peer dependency、versioning、deprecation、release gate：**

本节边界是 final evidence workspace。`vue-design-system-library-lab` 汇总 token、components、state matrix、docs、security、package model、versioning 和 release dashboard；没有 package build、Storybook、visual regression、DTCG validation、consumer install 时必须保持 UNKNOWN。

**Design System 机制证据链：**

1. final lab evidence 出现；2. release dashboard 创建或读取 tests docs a11y security package；3. Vue component 或 model function 把它交给 consumer；4. TypeScript 检查 shape；5. test runner 检查 `src/learning/vue/chapter-18-design-system-library/tests/visualRegressionBoundaryModel.test.ts`；6. `visual regression remains UNKNOWN` 进入 release gate。

**TypeScript / vue-tsc 编译期过程：**

TypeScript 和 `vue-tsc` 能检查 lab 内部 imports、models 和 SFC usage；它们不会产出 package declarations，不会验证 export map，也不会运行外部 docs 或 screenshot service。

**Vue / Browser / CSS / Package Consumer / Release Runtime 运行时过程：**

最终 lab 在浏览器中展示所有 panels，并让 learner 操作 button、field、dialog 和 dashboard。runtime evidence 仍是 local UI evidence，不是 published package evidence。

**API / 语法规则：**

本节把本章 API 收束为 evidence workspace：token resolver、theme composable、component contracts、package export model、library build boundary、version/deprecation model 和 release gate。

**文件结构：**

- Source: `src/learning/vue/chapter-18-design-system-library/components/DesignSystemReleaseDashboard.vue`
- Validation: `src/learning/vue/chapter-18-design-system-library/tests/visualRegressionBoundaryModel.test.ts`

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/DesignSystemReleaseDashboard.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useDesignSystemReleaseGate } from "../composables/useDesignSystemReleaseGate";

const { gate, blocked, setTestsPassing } = useDesignSystemReleaseGate({
  tokenDocsComplete: true,
  testsPassing: false,
  accessibilityEvidenceComplete: true,
  securityReviewComplete: true,
  packageBoundaryDocumented: true,
  issues: [
    {
      id: "DS-18-1",
      title: "Missing type declaration evidence",
      severity: "high",
      open: true,
    },
  ],
});
</script>

<template>
  <section class="design-card">
    <h3>Design system release dashboard</h3>
    <p>Release blocked: {{ blocked }}</p>
    <p>Open issues: {{ gate.issues.length }}</p>
    <button type="button" class="design-button" @click="setTestsPassing(true)">
      Mark local tests passing
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
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/visualRegressionBoundaryModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import { canClaimVisualRegressionCoverage } from "../models/visualRegressionBoundaryModel";

describe("visualRegressionBoundaryModel", () => {
  it("does not claim coverage without tool output", () => {
    expect(
      canClaimVisualRegressionCoverage({
        toolConfigured: false,
        screenshotStatus: "unknown",
        semanticBehaviorCovered: false,
      }),
    ).toBe(false);
  });
});
```
</div>

**逐行解释：**

最终 app 让 learner 依次观察 token/theme、操作 library components、查看 package/version/release panels；每个 panel 指向 model 或 test evidence。`visualRegressionBoundaryModel.test.ts` 明确没有工具输出时不能声明 visual coverage。

**执行过程：**

learner 先观察 token/theme，再操作 base components，然后查看 package/version/release panels；每个 panel 指向对应 model test。未配置的 external checks 不会被本地操作变成 PASS。

**token source、component prop、emit payload、slot content、attrs forwarding、CSS variable、state matrix、test assertion、package export、version decision、release gate 与 failure signal 的变化：**

lab evidence 从 source files、panels 和 tests 汇总到 release dashboard；package build、Storybook、visual regression、DTCG 和 consumer install 仍留在 UNKNOWN column。

**为什么得到这个结果：**

结果成立是因为最终小项目整合的是可证明的本地机制。没有实际运行外部工具时，严谨做法是保留 UNKNOWN，而不是把教学模型当成生产结果。

**对比写法：**

正确写法是把 lab 称为 reusable UI system evidence workspace；错误写法是把它描述成已发布 npm package、已部署 docs site 或已完成 visual regression suite。

**常见错误为什么错：**

忽略 `visual regression remains UNKNOWN` 会制造过度声明。截图工具未运行时，外观回归没有证据；consumer install 未运行时，package compatibility 没有证据。

**与真实项目的关系：**

真实项目要在本 lab 之后补 library build、types、exports、docs deployment、visual screenshots、DTCG validation 和 consumer app smoke test。

**与当前学习主线的关系：**

本节收束 Chapter 18：它告诉你哪些能力已经本地验证，哪些必须交给后续工程流程，而不是重复所有前置章节关系。

**最终记忆模型：**

Final lab = local evidence workspace; package, docs, visual, DTCG, consumer checks remain UNKNOWN until run.## 10. API / 语法索引

| API / Syntax | Layer | Input | Output | Runtime Effect | TypeScript Boundary |
| --- | --- | --- | --- | --- | --- |
| `defineProps` | Vue SFC macro | prop contract | typed props | parent passes values | checks shape, not consumer compatibility |
| `defineEmits` | Vue SFC macro | event payload contract | emit function | parent handler receives payload | checks event names and payload types |
| `defineModel` | Vue SFC macro | model prop and update event | ref-like binding | parent v-model sync | does not validate business value |
| `slot` | Vue composition | rendered content | slot function result | parent supplies content | slot props need explicit type model |
| `fallthrough attrs` | Vue runtime | undeclared attrs | forwarded attrs | native element receives attrs | wrong target not proven by TS |
| `CSS custom property` | Browser CSS | variable name/value | computed style | runtime theme value | does not prove token governance |
| `Vite build.lib` | Vite build | library entry config | library output | package-style bundle | not configured in this lab |

## 11. 常见错误表

| Wrong Form | Error Type | Violated Rule | Correction | Recognition Method |
| --- | --- | --- | --- | --- |
| 1. Treating design system as only CSS variables. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 2. Treating tokens as random variable names. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 3. Mixing primitive and semantic tokens with no alias model. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 4. Allowing arbitrary raw CSS customization. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 5. Creating a button component that does not render a native button. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 6. Hiding native input behavior inside a wrapper with broken attrs forwarding. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 7. Using defineModel without documenting the model prop/update event contract. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 8. Documenting props but forgetting emits and slots. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 9. Letting fallthrough attrs land on the wrong wrapper element. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 10. Assuming Storybook-like stories prove accessibility. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 11. Using snapshots as the only component tests. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 12. Treating visual regression as behavior testing. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 13. Forgetting disabled/loading/error/focus states. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 14. Changing prop names without major version or migration note. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 15. Deprecating a prop without replacement or removal schedule. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 16. Exporting internal modules as public package API by accident. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 17. Bundling Vue into a component library unintentionally. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 18. Forgetting CSS export path. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 19. Claiming npm package readiness without build/type/package verification. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 20. Claiming DTCG conformance without implementation and validation. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 21. Claiming visual regression coverage without running a tool. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |
| 22. Treating component library as separate from accessibility/security/observability evidence. | boundary error | public contract or evidence rule is violated | add typed model, test, docs, migration note or UNKNOWN label | grep, test failure, review gate or missing evidence |

## 12. 最终小项目

最终小项目 `vue-design-system-library-lab` 只整合本章机制，不替代前面的 `9.x` 分节教学。

### 12.1 项目目标

目标是用本地 Vue app 展示 design token explorer、theme preview、base components、contract panels、package-boundary panels、versioning/deprecation panel 和 release dashboard。

### 12.2 文件职责

| Path group | Responsibility |
| --- | --- |
| `src/learning/vue/chapter-18-design-system-library/models` | typed token, contract, package, version and release-gate decisions |
| `src/learning/vue/chapter-18-design-system-library/library` | reusable Vue components with native and accessibility boundaries |
| `src/learning/vue/chapter-18-design-system-library/components` | learning panels that render evidence and safe controls |
| `src/learning/vue/chapter-18-design-system-library/tests` | model tests for contract and release-gate decisions |

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
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/DesignSystemLibraryChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import "./design-system-library.css";
import AccessibilityContractPanel from "./components/AccessibilityContractPanel.vue";
import ComponentContractPanel from "./components/ComponentContractPanel.vue";
import ComponentPlaygroundPanel from "./components/ComponentPlaygroundPanel.vue";
import ComponentStateMatrixPanel from "./components/ComponentStateMatrixPanel.vue";
import DesignSystemReleaseDashboard from "./components/DesignSystemReleaseDashboard.vue";
import DesignTokenExplorer from "./components/DesignTokenExplorer.vue";
import DocumentationStoryPanel from "./components/DocumentationStoryPanel.vue";
import LibraryBuildBoundaryPanel from "./components/LibraryBuildBoundaryPanel.vue";
import PackageExportPanel from "./components/PackageExportPanel.vue";
import SecurityTokenBoundaryPanel from "./components/SecurityTokenBoundaryPanel.vue";
import ThemePreviewPanel from "./components/ThemePreviewPanel.vue";
import VersioningDeprecationPanel from "./components/VersioningDeprecationPanel.vue";
import DsAlert from "./library/DsAlert.vue";
import DsButton from "./library/DsButton.vue";
import DsCard from "./library/DsCard.vue";
import DsDialogShell from "./library/DsDialogShell.vue";
import DsStack from "./library/DsStack.vue";
import DsTextField from "./library/DsTextField.vue";
import DsVisuallyHidden from "./library/DsVisuallyHidden.vue";
import { ref } from "vue";

const fieldValue = ref("Design system input");
const dialogOpen = ref(false);
</script>

<template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/DesignTokenExplorer.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  listDeprecatedTokens,
  primitiveDesignTokens,
} from "../models/designTokenModel";
import { semanticDesignTokens } from "../models/semanticTokenModel";

const deprecatedTokens = listDeprecatedTokens(primitiveDesignTokens);
</script>

<template>
  <section class="design-card">
    <h3>Design token explorer</h3>
    <p>Primitive tokens own raw values. Semantic tokens own component intent.</p>
    <ul class="design-list">
      <li v-for="token in primitiveDesignTokens" :key="token.name">
        <code>{{ token.name }}</code>
        <span>{{ token.value }}</span>
      </li>
    </ul>
    <p>Semantic count: {{ semanticDesignTokens.length }}</p>
    <p>Deprecated token count: {{ deprecatedTokens.length }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/ThemePreviewPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useThemeTokens } from "../composables/useThemeTokens";
import type { ThemeVariantName } from "../models/themeVariantModel";

const { currentVariant, cssText, setThemeVariant } = useThemeTokens("light");
const previewStyle = computed(() =>
  Object.fromEntries(
    cssText.value.split("\n").map((line) => {
      const [name, value] = line.replace(";", "").split(": ");

      return [name, value];
    }),
  ),
);

function selectVariant(event: Event): void {
  const select = event.target as HTMLSelectElement;
  setThemeVariant(select.value as ThemeVariantName);
}
</script>

<template>
  <section class="design-card">
    <h3>Theme preview</h3>
    <label class="design-field">
      Theme variant
      <select :value="currentVariant" @change="selectVariant">
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/ComponentContractPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  buttonContract,
  detectBreakingContractChange,
  findContractDocumentationGaps,
} from "../models/componentContractModel";
import { assessAttrForwarding } from "../models/fallthroughAttrsModel";

const gaps = findContractDocumentationGaps(buttonContract);
const removalImpact = detectBreakingContractChange({
  removedProp: true,
  removedEmit: false,
  removedSlot: false,
  visualDefaultChanged: false,
});
const attrsRisk = assessAttrForwarding({
  componentName: "DsButton",
  target: "native-control",
  multiRoot: false,
  forwardsListeners: true,
});
</script>

<template>
  <section class="design-card">
    <h3>Component contract</h3>
    <p>{{ buttonContract.componentName }} forwards attrs to {{ buttonContract.attrsTarget }}.</p>
    <p>Documentation gaps: {{ gaps.length }}</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/ComponentStateMatrixPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useComponentStateMatrix } from "../composables/useComponentStateMatrix";

const { coverage, missingStates, addState } = useComponentStateMatrix({
  componentName: "DsButton",
  states: ["default", "focus", "disabled", "loading"],
});
</script>

<template>
  <section class="design-card">
    <h3>Component state matrix</h3>
    <p>{{ coverage.componentName }} missing states: {{ missingStates.join(", ") }}</p>
    <button type="button" class="design-button" @click="addState('error')">
      Add error state
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
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/DocumentationStoryPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { findMissingStoryStates } from "../models/documentationStoryModel";

const missingStories = findMissingStoryStates(
  [
    {
      title: "Button primary",
      componentName: "DsButton",
      state: "default",
      args: { variant: "primary" },
      purpose: "Show primary action.",
      antiExample: false,
    },
  ],
  ["default", "disabled", "loading"],
);
</script>

<template>
  <section class="design-card">
    <h3>Documentation stories</h3>
    <p>Missing story states: {{ missingStories.join(", ") }}</p>
    <p>Storybook is a documentation boundary here, not an installed dependency.</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/ComponentPlaygroundPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { ref } from "vue";
import { isPlaygroundControlSafe } from "../models/playgroundControlModel";
import DsButton from "../library/DsButton.vue";

const variant = ref<"primary" | "secondary" | "danger">("primary");
const safeControl = isPlaygroundControlSafe({
  name: "variant",
  controlType: "select",
  options: ["primary", "secondary", "danger"],
  allowsRawCss: false,
});
</script>

<template>
  <section class="design-card">
    <h3>Component playground</h3>
    <label class="design-field">
      Variant
      <select v-model="variant">
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
        <option value="danger">Danger</option>
      </select>
    </label>
    <DsButton :variant="variant">Preview action</DsButton>
    <p>Safe control: {{ safeControl }}</p>
  </section>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/AccessibilityContractPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { findMissingAccessibilityEvidence } from "../models/accessibilityContractModel";

const missingEvidence = findMissingAccessibilityEvidence({
  componentName: "DsTextField",
  requirements: ["name", "description", "state", "keyboard"],
  verifiedRequirements: ["name", "description"],
});
</script>

<template>
  <section class="design-card">
    <h3>Accessibility contract</h3>
    <p>Missing evidence: {{ missingEvidence.join(", ") }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/SecurityTokenBoundaryPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { findUnsafeCustomizationInputs } from "../models/securityTokenBoundaryModel";

const unsafeInputs = findUnsafeCustomizationInputs([
  { kind: "token", value: "color.action" },
  { kind: "raw-css", value: "position: fixed" },
  { kind: "slot", value: "icon" },
]);
</script>

<template>
  <section class="design-card">
    <h3>Security token boundary</h3>
    <p>Unsafe customization inputs: {{ unsafeInputs.length }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/PackageExportPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import {
  hasCssExport,
  isPublicPackageImport,
  packageExportEntries,
} from "../models/packageExportModel";

const rootImportAllowed = isPublicPackageImport(packageExportEntries, ".");
const internalImportAllowed = isPublicPackageImport(
  packageExportEntries,
  "./internal/tokenResolver",
);
const cssExportPresent = hasCssExport(packageExportEntries);
</script>

<template>
  <section class="design-card">
    <h3>Package export surface</h3>
    <p>Root import allowed: {{ rootImportAllowed }}</p>
    <p>Internal import allowed: {{ internalImportAllowed }}</p>
    <p>CSS export present: {{ cssExportPresent }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/LibraryBuildBoundaryPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { evaluateLibraryBuildBoundary } from "../models/libraryBuildBoundaryModel";
import { shouldUseCustomElement } from "../models/customElementBoundaryModel";

const libraryFailures = evaluateLibraryBuildBoundary({
  hasLibraryEntry: true,
  externalVue: true,
  hasCssExport: true,
  hasTypeDeclarations: false,
});
const customElementNeeded = shouldUseCustomElement({
  consumer: "vue-consumer",
  needsShadowDom: false,
  needsVueSlots: true,
});
</script>

<template>
  <section class="design-card">
    <h3>Library build boundary</h3>
    <p>Library model failures: {{ libraryFailures.join(", ") }}</p>
    <p>Custom element needed: {{ customElementNeeded }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/VersioningDeprecationPanel.vue</span>
  </div>

```vue
<script setup lang="ts">
import { isDeprecationPlanComplete } from "../models/deprecationModel";
import { getSemverImpact } from "../models/versioningModel";

const semverImpact = getSemverImpact({
  changeType: "removed-prop",
  migrationNote: "Use tone instead of colorIntent.",
});
const deprecationComplete = isDeprecationPlanComplete({
  propName: "colorIntent",
  replacement: "tone",
  firstDeprecatedVersion: "1.4.0",
  plannedRemovalVersion: "2.0.0",
});
</script>

<template>
  <section class="design-card">
    <h3>Versioning and deprecation</h3>
    <p>Impact: {{ semverImpact }}</p>
    <p>Deprecation plan complete: {{ deprecationComplete }}</p>
  </section>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/components/DesignSystemReleaseDashboard.vue</span>
  </div>

```vue
<script setup lang="ts">
import { useDesignSystemReleaseGate } from "../composables/useDesignSystemReleaseGate";

const { gate, blocked, setTestsPassing } = useDesignSystemReleaseGate({
  tokenDocsComplete: true,
  testsPassing: false,
  accessibilityEvidenceComplete: true,
  securityReviewComplete: true,
  packageBoundaryDocumented: true,
  issues: [
    {
      id: "DS-18-1",
      title: "Missing type declaration evidence",
      severity: "high",
      open: true,
    },
  ],
});
</script>

<template>
  <section class="design-card">
    <h3>Design system release dashboard</h3>
    <p>Release blocked: {{ blocked }}</p>
    <p>Open issues: {{ gate.issues.length }}</p>
    <button type="button" class="design-button" @click="setTestsPassing(true)">
      Mark local tests passing
    </button>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsButton.vue</span>
  </div>

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    readonly variant?: "primary" | "secondary" | "danger";
    readonly size?: "sm" | "md" | "lg";
    readonly loading?: boolean;
    readonly disabled?: boolean;
    readonly type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    type: "button",
  },
);

const emit = defineEmits<{
  press: [event: MouseEvent];
}>();

function handleClick(event: MouseEvent): void {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsTextField.vue</span>
  </div>

```vue
<script setup lang="ts">
import { computed } from "vue";

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly error?: string;
    readonly disabled?: boolean;
  }>(),
  {
    description: "",
    error: "",
    disabled: false,
  },
);

const descriptionId = computed(() => `${props.id}-description`);
const errorId = computed(() => `${props.id}-error`);
const describedBy = computed(() => {
  const ids = [];

  if (props.description) {
    ids.push(descriptionId.value);
  }
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsAlert.vue</span>
  </div>

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    readonly status?: "info" | "success" | "warning" | "danger";
    readonly dismissible?: boolean;
    readonly announce?: boolean;
  }>(),
  {
    status: "info",
    dismissible: false,
    announce: false,
  },
);

const emit = defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <section
    class="ds-alert"
    :class="`ds-alert--${status}`"
    :role="props.announce ? 'status' : undefined"
  >
    <strong class="ds-alert__status">{{ status }}</strong>
    <div class="ds-alert__content">
      <slot />
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsCard.vue</span>
  </div>

```vue
<template>
  <article class="ds-card">
    <header v-if="$slots.header" class="ds-card__header">
      <slot name="header" />
    </header>
    <div class="ds-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="ds-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/library/DsStack.vue</span>
  </div>

```vue
<script setup lang="ts">
withDefaults(
  defineProps<{
    readonly direction?: "row" | "column";
    readonly gap?: "sm" | "md" | "lg";
  }>(),
  {
    direction: "column",
    gap: "md",
  },
);
</script>

<template>
  <div class="ds-stack" :class="[`ds-stack--${direction}`, `ds-stack--${gap}`]">
    <slot />
  </div>
</template>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/composables/useThemeTokens.ts</span>
  </div>

```ts
import { computed, ref } from "vue";
import {
  createThemeCssDeclarations,
  type ThemeVariantName,
} from "../models/themeVariantModel";

export function useThemeTokens(initialVariant: ThemeVariantName = "light") {
  const currentVariant = ref<ThemeVariantName>(initialVariant);

  const cssText = computed(() =>
    createThemeCssDeclarations(currentVariant.value).join("\n"),
  );

  function setThemeVariant(nextVariant: ThemeVariantName): void {
    currentVariant.value = nextVariant;
  }

  return {
    currentVariant,
    cssText,
    setThemeVariant,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/composables/useComponentStateMatrix.ts</span>
  </div>

```ts
import { computed, ref } from "vue";
import {
  findMissingComponentStates,
  type ComponentStateCoverage,
  type ComponentStateName,
} from "../models/componentStateMatrixModel";

export function useComponentStateMatrix(initialCoverage: ComponentStateCoverage) {
  const coverage = ref<ComponentStateCoverage>(initialCoverage);

  const missingStates = computed(() => findMissingComponentStates(coverage.value));

  function addState(state: ComponentStateName): void {
    if (coverage.value.states.includes(state)) {
      return;
    }

    coverage.value = {
      ...coverage.value,
      states: [...coverage.value.states, state],
    };
  }

  return {
    coverage,
    missingStates,
    addState,
  };
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/composables/useDesignSystemReleaseGate.ts</span>
  </div>

```ts
import { computed, ref } from "vue";
import {
  isDesignSystemReleaseBlocked,
  type DesignSystemReleaseGate,
} from "../models/designSystemIssueModel";

export function useDesignSystemReleaseGate(initialGate: DesignSystemReleaseGate) {
  const gate = ref<DesignSystemReleaseGate>(initialGate);

  const blocked = computed(() => isDesignSystemReleaseBlocked(gate.value));

  function setTestsPassing(testsPassing: boolean): void {
    gate.value = {
      ...gate.value,
      testsPassing,
    };
  }

  return {
    gate,
    blocked,
    setTestsPassing,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/designTokenModel.ts</span>
  </div>

```ts
export type DesignTokenType = "color" | "space" | "radius" | "font" | "duration";

export interface DesignToken {
  readonly name: string;
  readonly type: DesignTokenType;
  readonly value: string;
  readonly description: string;
  readonly deprecated: boolean;
}

export const primitiveDesignTokens: readonly DesignToken[] = [
  {
    name: "color.gray.0",
    type: "color",
    value: "#ffffff",
    description: "Base white surface color.",
    deprecated: false,
  },
  {
    name: "color.gray.900",
    type: "color",
    value: "#111827",
    description: "Base dark text color.",
    deprecated: false,
  },
  {
    name: "color.blue.600",
    type: "color",
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/componentContractModel.ts</span>
  </div>

```ts
import type { EmitContract } from "./emitContractModel";
import type { ModelValueContract } from "./modelValueContractModel";
import type { PropContract } from "./propContractModel";
import { findUndocumentedRequiredProps } from "./propContractModel";
import type { SlotContract } from "./slotContractModel";

export interface ComponentContract {
  readonly componentName: string;
  readonly props: readonly PropContract[];
  readonly emits: readonly EmitContract[];
  readonly slots: readonly SlotContract[];
  readonly model?: ModelValueContract;
  readonly attrsTarget: string;
  readonly public: boolean;
}

export type ContractChangeImpact = "patch" | "minor" | "major";

export const buttonContract: ComponentContract = {
  componentName: "DsButton",
  props: [
    {
      name: "variant",
      typeLabel: "primary | secondary | danger",
      required: false,
      defaultValue: "primary",
      description: "Controls visual intent through semantic tokens.",
      deprecated: false,
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/modelValueContractModel.ts</span>
  </div>

```ts
export interface ModelValueContract {
  readonly propName: string;
  readonly updateEventName: string;
  readonly valueType: string;
  readonly controlled: boolean;
}

export function createModelValueContract(
  propName: string,
  valueType: string,
  controlled: boolean,
): ModelValueContract {
  return {
    propName,
    updateEventName: `update:${propName}`,
    valueType,
    controlled,
  };
}

export function isModelUpdateEvent(
  contract: ModelValueContract,
  eventName: string,
): boolean {
  return contract.updateEventName === eventName;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/fallthroughAttrsModel.ts</span>
  </div>

```ts
export type AttrForwardingTarget = "native-control" | "wrapper" | "not-forwarded";
export type AttrForwardingRisk = "safe" | "risky";

export interface AttrForwardingDecision {
  readonly componentName: string;
  readonly target: AttrForwardingTarget;
  readonly multiRoot: boolean;
  readonly forwardsListeners: boolean;
}

export function assessAttrForwarding(
  decision: AttrForwardingDecision,
): AttrForwardingRisk {
  if (decision.target !== "native-control") {
    return "risky";
  }

  if (decision.multiRoot && !decision.forwardsListeners) {
    return "risky";
  }

  return "safe";
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/packageExportModel.ts</span>
  </div>

```ts
export interface PackageExportEntry {
  readonly path: string;
  readonly public: boolean;
  readonly kind: "component" | "composable" | "style" | "internal";
}

export const packageExportEntries: readonly PackageExportEntry[] = [
  { path: ".", public: true, kind: "component" },
  { path: "./css", public: true, kind: "style" },
  { path: "./internal/tokenResolver", public: false, kind: "internal" },
];

export function isPublicPackageImport(
  entries: readonly PackageExportEntry[],
  importPath: string,
): boolean {
  const entry = entries.find((candidate) => candidate.path === importPath);

  return entry?.public ?? false;
}

export function hasCssExport(entries: readonly PackageExportEntry[]): boolean {
  return entries.some((entry) => entry.public && entry.kind === "style");
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/libraryBuildBoundaryModel.ts</span>
  </div>

```ts
export interface LibraryBuildBoundary {
  readonly hasLibraryEntry: boolean;
  readonly externalVue: boolean;
  readonly hasCssExport: boolean;
  readonly hasTypeDeclarations: boolean;
}

export function evaluateLibraryBuildBoundary(
  boundary: LibraryBuildBoundary,
): readonly string[] {
  const failures: string[] = [];

  if (!boundary.hasLibraryEntry) {
    failures.push("missing-library-entry");
  }

  if (!boundary.externalVue) {
    failures.push("vue-not-external");
  }

  if (!boundary.hasCssExport) {
    failures.push("missing-css-export");
  }

  if (!boundary.hasTypeDeclarations) {
    failures.push("missing-type-declarations");
  }
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/models/versioningModel.ts</span>
  </div>

```ts
export type SemverImpact = "patch" | "minor" | "major";

export interface VersionChange {
  readonly changeType:
    | "bug-fix"
    | "new-prop"
    | "removed-prop"
    | "visual-default-change";
  readonly migrationNote: string;
}

export function getSemverImpact(change: VersionChange): SemverImpact {
  if (change.changeType === "removed-prop") {
    return "major";
  }

  if (change.changeType === "new-prop" || change.changeType === "visual-default-change") {
    return "minor";
  }

  return "patch";
}

export function hasMigrationEvidence(change: VersionChange): boolean {
  return change.migrationNote.trim().length > 0;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/designTokenModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  findDesignToken,
  listDeprecatedTokens,
  primitiveDesignTokens,
} from "../models/designTokenModel";

describe("designTokenModel", () => {
  it("finds primitive tokens by stable name", () => {
    expect(findDesignToken(primitiveDesignTokens, "color.blue.600")?.value).toBe("#2563eb");
  });

  it("reports deprecated primitive tokens", () => {
    expect(listDeprecatedTokens(primitiveDesignTokens).map((token) => token.name)).toContain(
      "color.brand.old",
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
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/componentContractModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  buttonContract,
  detectBreakingContractChange,
  findContractDocumentationGaps,
} from "../models/componentContractModel";

describe("componentContractModel", () => {
  it("keeps documented public button contract", () => {
    expect(findContractDocumentationGaps(buttonContract)).toEqual([]);
  });

  it("marks removed public props as major changes", () => {
    expect(
      detectBreakingContractChange({
        removedProp: true,
        removedEmit: false,
        removedSlot: false,
        visualDefaultChanged: false,
      }),
    ).toBe("major");
  });
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-18-design-system-library/tests/packageExportModel.test.ts</span>
  </div>

```ts
import { describe, expect, it } from "vitest";
import {
  hasCssExport,
  isPublicPackageImport,
  packageExportEntries,
} from "../models/packageExportModel";

describe("packageExportModel", () => {
  it("blocks internal package imports", () => {
    expect(isPublicPackageImport(packageExportEntries, "./internal/tokenResolver")).toBe(false);
  });

  it("requires a CSS export path", () => {
    expect(hasCssExport(packageExportEntries)).toBe(true);
  });
});
```
</div>

### 12.5 代码执行链路

`App.vue` render Chapter 18 app；`DesignSystemLibraryChapterApp.vue` render panels and library previews；panels read model/composable output；library components expose native button/input/alert/card/dialog contracts；tests call pure model functions to validate token alias, contract change, attrs forwarding, export surface, library boundary and release gate。

### 12.6 验证命令与失败定位

- `npm run typecheck` failure usually means SFC props/emits/model/import contract is invalid.
- `npm run test:unit` failure usually means a model rule changed.
- `npm run build` failure means app build is broken, not package publish readiness.
- Missing visual regression, Storybook, DTCG and package publish evidence must stay UNKNOWN.

### 12.7 Design system review checklist

- Token aliases resolve and deprecated tokens are visible.
- Native button/input behavior is preserved.
- Props, emits, slots, attrs and model contracts are documented.
- Unsafe raw CSS and raw HTML customization are blocked.
- Package export surface separates public and internal paths.
- Versioning, deprecation and migration notes exist for public API changes.

## 13. 额外速查表

| Topic | One-line model | Safe copy pattern | Failure signal |
| --- | --- | --- | --- |
| Token | decision with name/type/value/description | semantic token points to primitive token | deprecated or unknown token |
| Component API | public contract | props + emits + slots + attrs + model | undocumented breaking change |
| Native ownership | preserve platform behavior | render native button/input | wrapper swallows keyboard behavior |
| Package boundary | consumer imports only public paths | `.` and `./css` public entries | internal import allowed |
| Release gate | evidence decides release | tests + docs + a11y + security + package boundary | high open issue |

## 14. 真实项目判断模型

| Choice | When to use | When not to use | Evidence that proves it works | Excluded concern owner |
| --- | --- | --- | --- | --- |
| Local token model | learning token governance and aliasing | claiming full DTCG support | alias tests and deprecated token test | DTCG validator |
| Vue component library pattern | repeated UI needs stable API | one-off page-only UI | props/emits/slots/attrs tests and a11y review | consumer app install |
| Story model | documenting component states before tooling | claiming deployed docs site | documentation story model tests | Storybook deployment |
| Vite library model | teaching package boundary | claiming publishable package | library boundary model and package export tests | real package build/types/export map |
| Release gate | blocking missing evidence | replacing engineering review | issue model tests and dashboard | real release process |

## 15. 如何转换成个人笔记

保留 token -> semantic -> CSS variable、props/emits/slots/attrs/model contract、native ownership、a11y/security evidence、package export、semver/deprecation 和 release gate 的机制链。熟练后可以删掉重复 panel 代码，只保留 failure signals。

## 16. 必须能回答的问题

1. 为什么 design system 不只是 CSS variable？
2. primitive token 与 semantic token 的边界是什么？
3. `defineModel()` 为什么仍然是 prop 加 update event contract？
4. 为什么 clickable wrapper 不能替代 native button？
5. 为什么 Storybook-like story 不证明 accessibility？
6. 为什么 Vite app build 不等于 library package readiness？
7. 为什么 visual regression PASS 也不能证明 behavior？
8. 什么证据会 block design system release？

## 17. 最终记忆模型

Design decision -> token model -> semantic alias -> CSS variable -> Vue component props/emits/slots/attrs/model -> native/browser behavior -> model/component tests -> package export boundary -> semver/deprecation evidence -> release gate。

## 18. 官方文档阅读清单

- [https://vuejs.org/guide/components/props.html](https://vuejs.org/guide/components/props.html)
- [https://vuejs.org/guide/components/events.html](https://vuejs.org/guide/components/events.html)
- [https://vuejs.org/guide/components/slots.html](https://vuejs.org/guide/components/slots.html)
- [https://vuejs.org/guide/components/attrs.html](https://vuejs.org/guide/components/attrs.html)
- [https://vuejs.org/guide/components/v-model.html](https://vuejs.org/guide/components/v-model.html)
- [https://vuejs.org/guide/typescript/composition-api.html](https://vuejs.org/guide/typescript/composition-api.html)
- [https://vuejs.org/api/sfc-css-features.html](https://vuejs.org/api/sfc-css-features.html)
- [https://vuejs.org/guide/extras/web-components.html](https://vuejs.org/guide/extras/web-components.html)
- [https://vite.dev/guide/build.html#library-mode](https://vite.dev/guide/build.html#library-mode)
- [https://storybook.js.org/docs](https://storybook.js.org/docs)
- [https://www.designtokens.org/tr/drafts/format/](https://www.designtokens.org/tr/drafts/format/)
- [https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties)

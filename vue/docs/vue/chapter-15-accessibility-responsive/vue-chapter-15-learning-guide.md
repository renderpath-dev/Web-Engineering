# Vue 第 15 章：Accessibility、Responsive Interaction 与 Inclusive UI Verification

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
  - [9.1 Accessibility mental model：WCAG principles、semantic HTML、ARIA boundary、keyboard and verification evidence](#section-9-1)
  - [9.2 Semantic page structure：skip link、landmarks、heading order、main content and route focus restore](#section-9-2)
  - [9.3 Accessible names and descriptions：label、aria-label、aria-labelledby、aria-describedby and useId](#section-9-3)
  - [9.4 Form accessibility：fieldset、legend、validation errors、aria-invalid、error summary and submit boundary](#section-9-4)
  - [9.5 Button, link and custom control boundary：native behavior、keyboard activation and no clickable div](#section-9-5)
  - [9.6 Focus management：focus visible、focus order、focus restore, focus trap and focus return](#section-9-6)
  - [9.7 Disclosure / accordion interaction：expanded state、button ownership、keyboard and content visibility](#section-9-7)
  - [9.8 Dialog accessibility：Teleport boundary、modal semantics、escape close、focus trap and inert background](#section-9-8)
  - [9.9 Roving tabindex widget：tabs/listbox mental model、active descendant option and arrow-key ownership](#section-9-9)
  - [9.10 Data table accessibility：caption、scope、sortable header button、empty state and responsive overflow](#section-9-10)
  - [9.11 Live regions and async status：loading、toast、alert、polite/assertive and announcement throttling](#section-9-11)
  - [9.12 Color contrast and theming：text contrast、non-text contrast、focus ring, dark/light mode evidence](#section-9-12)
  - [9.13 Reduced motion and animation：prefers-reduced-motion、Transition boundary, visibility preservation](#section-9-13)
  - [9.14 Responsive layout verification：mobile nav、reflow、target size, code/table overflow and viewport matrix](#section-9-14)
  - [9.15 Accessibility testing：role/name queries、keyboard events、focus assertions and manual checks](#section-9-15)
  - [9.16 Accessibility issue dashboard：severity、WCAG criterion、owner, evidence and release gate](#section-9-16)
  - [9.17 Chapter integration：how Chapter 15 connects UI, Router, forms, tests, production and migration](#section-9-17)
  - [9.18 Final integration：vue-accessibility-responsive-lab 如何形成 inclusive UI verification workspace](#section-9-18)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 文件职责](#122-文件职责)
  - [12.3 运行与验证](#123-运行与验证)
  - [12.4 完整核心代码](#124-完整核心代码)
  - [12.5 代码执行链路](#125-代码执行链路)
  - [12.6 验证命令与失败定位](#126-验证命令与失败定位)
  - [12.7 手动键盘与响应式验收清单](#127-手动键盘与响应式验收清单)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 学习目标 | 真实路径 | 位置 |
| --- | --- | --- |
| 可访问性原则、WCAG 证据与 release gate | `src/learning/vue/chapter-15-accessibility-responsive/models/accessibilityPrincipleModel.ts` | 9.1 |
| skip link、landmark、heading 和 route focus | `components/SkipLinkDemo.vue`、`components/LandmarkLayoutDemo.vue`、`components/RouteFocusRestoreDemo.vue`、`composables/useFocusRestore.ts`、`models/landmarkModel.ts` | 9.2、9.6 |
| accessible name、description 和 form state | `models/formAccessibilityModel.ts`、`components/AccessibleSearchForm.vue` | 9.3、9.4 |
| native control 与 keyboard activation | `components/NativeControlBoundaryDemo.vue`、`models/keyboardInteractionModel.ts`、`tests/nativeControlBoundary.test.ts` | 9.5 |
| disclosure、dialog、focus trap 和 focus return | `components/AccessibleDisclosure.vue`、`components/AccessibleDialog.vue`、`composables/useDialogFocusTrap.ts` | 9.7、9.8 |
| roving tabindex | `components/RovingTabindexTabs.vue`、`composables/useRovingTabindex.ts`、`models/rovingTabindexModel.ts` | 9.9 |
| table、sort、live region | `components/SortableResultsTable.vue`、`components/AsyncStatusLiveRegion.vue`、`models/tableAccessibilityModel.ts`、`models/liveRegionModel.ts` | 9.10、9.11 |
| contrast、reduced motion、responsive verification | `components/ContrastReviewPanel.vue`、`components/ReducedMotionTransitionDemo.vue`、`components/ResponsiveNavigationDemo.vue`、`models/contrastModel.ts`、`models/reducedMotionModel.ts`、`models/responsiveVerificationModel.ts` | 9.12–9.14 |
| role/name/focus/unit evidence | `tests/*.test.ts` | 9.15 |
| accessibility issue release gate | `components/AccessibilityVerificationDashboard.vue`、`models/accessibilityIssueModel.ts` | 9.16 |
| final lab entry | `AccessibilityResponsiveChapterApp.vue`、`accessibility-responsive.css` | 9.17、9.18、12 |

## 0. 本章机制边界

本章不是设计装饰章节。它研究的是 DOM semantics、interaction ownership、focus ownership、responsive task continuity 与 verification evidence。Vue 的 `ref`、`computed`、component state 和 props 可以驱动 `aria-expanded`、`aria-invalid`、当前 tab、dialog open state、live region message、motion policy 和 viewport result，但 Vue state 本身不会自动创建可访问语义；最终必须看浏览器渲染出的 DOM node 是否有正确的 role、name、state、relationship 和 focus behavior。

TypeScript 能检查 `FieldAccessibilityState`、`DialogFocusState`、`RovingTabState`、`ViewportCheck` 和 `AccessibilityIssue` 的 shape，但它不能证明 visible label 是否真的被辅助技术读取、Tab 顺序是否符合任务顺序、焦点环是否可见、暗色主题 contrast 是否足够、screen reader 是否按预期播报。Vitest 和 Vue Test Utils 能覆盖 role/name/focus/keyboard 的一部分行为；manual keyboard verification、真实 browser width verification 和 screen reader verification 仍然是独立证据。

本章排除完整法律合规声明、WCAG conformance claim、screen reader certification、自动化审计工具结果、设计系统发布、生产监控与真实用户辅助技术研究。它只建立 `vue-accessibility-responsive-lab` 这种学习级 inclusive UI verification workspace。

## 1. 本章解决的问题

Chapter 08 已经做了 UI、forms、table、permission 和 theme；Chapter 10 建立了 test quality gates；Chapter 11 讨论 production build；Chapter 14 讨论 migration evidence。Chapter 15 把这些能力连接到一个更容易在真实项目中漏掉的边界：界面可用性不能只看“视觉上能点”。一个搜索表单必须有 label、description、error relationship；一个 dialog 必须有 focus trap、Escape close 和 focus return；一个 responsive layout 必须在 360px 到 1440px 的实际宽度下保留任务连续性。

## 2. 前置概念

- 已理解 Vue SFC、`<script setup>`、`ref`、`computed`、template ref 和 component event。
- 已理解 Router navigation 不等于整页刷新，route change 后需要显式 focus strategy。
- 已理解 Chapter 08 的 form/table/theme，Chapter 10 的 component tests，Chapter 11 的 production evidence，Chapter 14 的 release gate model。
- 已知道 HTML native control 通常比自造 ARIA control 更可靠。

## 3. 学习目标

完成本章后，你应该能：

1. 解释 accessibility 为什么不只是 screen reader。
2. 判断 semantic HTML、ARIA、CSS、Vue state、Router navigation、test runner 与 manual verification 分别负责什么。
3. 写出 skip link、landmark、form labels、error summary、disclosure、dialog、roving tabindex、sortable table、live region、reduced motion 和 responsive verification 的最小可运行代码。
4. 知道哪些行为可以 unit/component test，哪些必须人工键盘或浏览器宽度检查。
5. 不把自动化测试结果、WCAG 原则引用或 screen reader 支持声明混为 release proof。

## 4. 核心机制证据链总览

| 触发点 | DOM / state owner | Runtime behavior | TypeScript boundary | Failure signal |
| --- | --- | --- | --- | --- |
| Skip link -> main target -> focus restore -> route change evidence | `SkipLinkDemo.vue`、`useFocusRestore.ts` | anchor moves to `#chapter-15-main`; route simulation focuses a stable target | `FocusRestoreController` checks target ref shape only | Tab starts in repeated nav or route change leaves focus behind |
| Heading/landmark structure -> DOM outline -> navigation by assistive tech | `landmarkModel.ts` | `main` and labelled `nav` expose page regions | `LandmarkRegion` checks model shape only | missing `main` or skipped heading rank |
| Label/description -> accessible name/description -> form field evidence | `AccessibleSearchForm.vue` | label, description and error IDs are rendered into field relationships | `FieldAccessibilityState` checks IDs only | placeholder is the only label |
| Validation error -> aria-invalid / aria-describedby -> error summary focus | `ValidationErrorSummary.vue` | invalid state updates relationships and summary links fields | `SearchFormState` cannot prove DOM focus | error text is visible but not connected |
| Native button/link -> keyboard activation -> no clickable div | `NativeControlBoundaryDemo.vue`、`keyboardInteractionModel.ts` | native button/link are rendered; custom control remains model-only risk | union type narrows control kind | role/state added without keyboard behavior |
| Disclosure button -> aria-expanded -> content visibility | `AccessibleDisclosure.vue` | button toggles visible content and state | boolean state is checked, not AT output | visual open state without `aria-expanded` |
| Dialog trigger -> Teleport -> focus trap -> Escape close -> focus return | `AccessibleDialog.vue`、`useDialogFocusTrap.ts` | Teleport moves DOM; trap cycles focus; Escape closes | focus IDs are typed, real focus remains runtime | modal opens while focus stays behind it |
| Roving tabindex -> active index -> keyboard arrow movement | `RovingTabindexTabs.vue` | one active tab gets `tabindex` zero; arrows move active item | `RovingTabState` checks index model | every tab is a tab stop |
| Sortable table header -> sort state -> aria-sort or button label update | `SortableResultsTable.vue` | button toggles sort and header state | `SortState` checks column and direction | visual order changes without state label |
| Async status -> live region -> announcement policy | `AsyncStatusLiveRegion.vue` | polite messages throttle; assertive messages bypass throttle | `LiveRegionMessage` checks priority only | live region announces every keystroke |
| Theme token -> contrast model -> visible focus evidence | `contrastModel.ts` | contrast pairs become review evidence | ratio data is checked, real pixels are not | focus ring invisible in dark mode |
| Reduced motion media query -> animation branch -> content still visible | `ReducedMotionTransitionDemo.vue` | policy swaps transition branch and keeps content visible | `MotionPolicy` checks branch shape | reduced motion hides content |
| Viewport width -> responsive layout -> no horizontal overflow | `ResponsiveNavigationDemo.vue` | width matrix records overflow, targets and nav operation | `ViewportCheck` checks data only | horizontal overflow at 360px |
| Test query -> role/name/focus assertion -> manual check boundary | `tests/*.test.ts` | Vue Test Utils triggers click/key events in jsdom | test files typecheck; browser AT output is not proven | unit tests claimed as WCAG proof |
| Accessibility issue -> owner/severity/evidence -> release gate | `AccessibilityVerificationDashboard.vue` | blocked issue prevents release-ready state | issue model checks fields only | issue has no owner or evidence |

## 5. 核心术语表

| Term | 本章含义 | 常见误解 |
| --- | --- | --- |
| Semantic HTML | native element 自带 role、keyboard 和 relationship 的基础能力 | 以为 ARIA 比 HTML 更高级 |
| Accessible name | 控件暴露给辅助技术的可识别名称 | 以为 placeholder 等于 label |
| Focus owner | 当前交互中谁决定焦点进入、移动、返回 | 以为 TypeScript 能证明焦点顺序 |
| Live region | 异步状态对辅助技术的播报通道 | 以为所有消息都应该 assertive |
| Responsive verification | 在代表性宽度下检查任务连续性 | 以为写了 media query 就完成 |
| Release gate | 可访问性问题是否阻塞发布的证据模型 | 以为测试通过等于合规 |

## 6. 底层心智模型

本章的底层模型是：

```text
DOM node
  -> native role or ARIA role
  -> visible label or programmatic name
  -> state relationship
  -> keyboard and focus behavior
  -> CSS visibility and responsive layout
  -> unit/component evidence
  -> manual browser evidence
  -> release decision
```

Vue 只在中间提供 state、render 和 component boundary。真正被用户和辅助技术接触的是浏览器 DOM、keyboard event、focus target、CSS media query 和 viewport layout。

## 7. 推荐目录结构

```text
src/learning/vue/chapter-15-accessibility-responsive/
  AccessibilityResponsiveChapterApp.vue
  accessibility-responsive.css
  models/
  components/
  composables/
  tests/
```

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

`npm run dev` 只用于本地浏览器观察，不等于可访问性验收。`npm run test:unit` 覆盖本章已有 jsdom/Vue Test Utils 能测到的 behavior；manual keyboard、responsive widths 和 screen reader 行为需要单独验证。

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Accessibility mental model：WCAG principles、semantic HTML、ARIA boundary、keyboard and verification evidence

**结论：** accessibility 是 DOM semantics、interaction、focus、visual perception、responsive task continuity 和 evidence 的组合，不是 CSS polish。

**本节解决的问题：** `accessibilityPrincipleModel.ts` 把 Perceivable、Operable、Understandable、Robust 映射成 release signal，避免只背 WCAG 名词。

**技术意义：** 任何控件都必须回答“谁拥有 role、name、state、keyboard、focus、verification”。

**概念解释：** WCAG 是原则和成功标准；semantic HTML 是首选实现；ARIA 只补足原生 HTML 不足；测试和人工检查是证据。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** 本节只定义判断模型，不声明合规。

**Accessibility 机制证据链：** 用户进入 Chapter 15；DOM 里的 button、main、form、dialog 等节点分别拥有语义；Vue state 驱动状态；tests 证明一部分；manual browser check 证明剩余部分。

**TypeScript / vue-tsc 编译期过程：** `AccessibilityPrincipleRecord` 能检查每条 principle 都有 `id`、`label`、`question` 和 `releaseSignal`。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Browser 暴露 DOM semantics；AT 读取 role/name/state；Vue 只负责渲染和更新 DOM。

**API / 语法规则：** semantic element、ARIA state、role/name queries、manual keyboard checks。

**文件结构：** `models/accessibilityPrincipleModel.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/accessibilityPrincipleModel.ts</span>
  </div>

```ts
export type AccessibilityPrinciple = "perceivable" | "operable" | "understandable" | "robust";

export interface AccessibilityPrincipleRecord {
  readonly id: AccessibilityPrinciple;
  readonly label: string;
  readonly question: string;
  readonly releaseSignal: string;
}
```
</div>

**逐行解释：** `AccessibilityPrinciple` 限定四个原则；`AccessibilityPrincipleRecord` 要求每个原则都有学习问题和 release signal；这让 dashboard 和 guide 都围绕 evidence，而不是围绕视觉偏好。

**执行过程：** Chapter app 导入 `accessibilityPrinciples` 并渲染 principle cards。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** 本节没有单一 DOM 交互；它建立后续每个 DOM 节点都要被追踪的字段。

**为什么得到这个结果：** accessibility failure 通常不是一个 API 错，而是 role、name、state、focus、layout 或 verification 的证据断裂。

**对比写法：** 只写“符合 WCAG”没有可复现证据。

**常见错误为什么错：** 把 accessibility 当成最后加颜色和 `aria-label` 会错过 keyboard、focus、responsive 和 error recovery。

**与真实项目的关系：** PR review 应要求可见证据：DOM、keyboard、test、manual check 或 issue owner。

**与当前学习主线的关系：** Chapter 10 的 quality gate 在这里变成 inclusive UI gate。

**最终记忆模型：** 先证明语义和交互，再讨论美观。

<a id="section-9-2"></a>

### 9.2 Semantic page structure：skip link、landmarks、heading order、main content and route focus restore

**结论：** 页面结构必须先让用户能跳过重复内容，并定位到 `main`。

**本节解决的问题：** `SkipLinkDemo.vue`、`LandmarkLayoutDemo.vue`、`RouteFocusRestoreDemo.vue` 与 `landmarkModel.ts` 展示 skip link、landmark、heading 和 route focus target。

**技术意义：** SPA route change 不刷新页面，焦点不会自动回到新页面起点。

**概念解释：** skip link 是第一个可聚焦控件；`main` 是稳定目标；landmark label 描述区域职责；heading rank 不能随意跳级。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** Router 触发页面变化；focus restore 是 browser runtime behavior。

**Accessibility 机制证据链：** Tab 进入页面，先聚焦 skip link；Enter 跳到 `#chapter-15-main`；route simulation 调用 `restoreFocus`；failure signal 是 focus 留在旧链接。

**TypeScript / vue-tsc 编译期过程：** `LandmarkRegion` 能检查 `kind` 和 `label`；不能证明 DOM 真的出现在正确顺序。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Browser 根据 anchor 改变焦点/滚动位置；AT 可按 landmark 浏览。

**API / 语法规则：** `<main>`、`<nav aria-label>`、anchor `href="#id"`、`tabindex="-1"`、template ref。

**文件结构：** `components/SkipLinkDemo.vue`、`components/LandmarkLayoutDemo.vue`、`components/RouteFocusRestoreDemo.vue`、`models/landmarkModel.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/SkipLinkDemo.vue</span>
  </div>

```vue
<a class="a11y-skip-link" :href="createSkipLinkTarget(mainTarget)">
  Skip to main content
</a>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/landmarkModel.ts</span>
  </div>

```ts
export function findHeadingRankSkips(
  headings: ReadonlyArray<HeadingRecord>,
): ReadonlyArray<string> {
  const failures: Array<string> = [];

  headings.reduce((previousRank, heading) => {
    if (heading.rank > previousRank + 1) {
      failures.push(heading.id);
    }

    return heading.rank;
  }, 0);

  return failures;
}
```
</div>

**逐行解释：** skip link 的 `href` 指向 stable main target；`findHeadingRankSkips` 从前一个 rank 到当前 rank 检查是否跳级；返回的是可阻塞 release 的 heading id。

**执行过程：** 用户按 Tab 看到 skip link，按 Enter 到 main；route simulation 后 `restoreFocus` 聚焦目标。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** focus 从 skip link 移到 main target；failure 是 main id 缺失或 heading rank skip。

**为什么得到这个结果：** SPA 不会天然提供文档级重新加载后的浏览位置。

**对比写法：** 只在视觉顶部放导航但没有 skip link，会让键盘用户每页重复 Tab。

**常见错误为什么错：** 多个 `main` 或无 label 的 landmark 会让区域导航变得不稳定。

**与真实项目的关系：** admin shell、dashboard shell 和 Nuxt layout 都需要这个结构。

**与当前学习主线的关系：** Chapter 06 Router navigation 在这里补上 focus evidence。

**最终记忆模型：** SPA route change 后，必须给用户一个可预测的新起点。

<a id="section-9-3"></a>

### 9.3 Accessible names and descriptions：label、aria-label、aria-labelledby、aria-describedby and useId

**结论：** 可访问名称优先来自可见 label，description 和 error 通过关系 ID 连接。

**本节解决的问题：** `formAccessibilityModel.ts` 与 `AccessibleSearchForm.vue` 统一生成 input、label、description 和 error IDs。

**技术意义：** 重用组件如果复制固定 id，会让 `aria-describedby` 指向错误节点。

**概念解释：** `label for` 是首选；`aria-label` 用在无可见 label 的少数场景；`aria-labelledby` 连接可见文本；`aria-describedby` 连接说明或错误。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** ID 关系由 DOM 证明，TypeScript 只能检查字符串字段。

**Accessibility 机制证据链：** 用户聚焦 search input；DOM 暴露 label；description ID 提供说明；invalid 后 error ID 加入 relationship。

**TypeScript / vue-tsc 编译期过程：** `SearchFieldId` 限制字段名，避免拼错 `"query"` 和 `"status"`。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Vue 更新 `aria-describedby`；browser accessible tree 组合 name 和 description。

**API / 语法规则：** `<label for>`、`useId()`、`aria-labelledby`、`aria-describedby`。

**文件结构：** `models/formAccessibilityModel.ts`、`components/AccessibleSearchForm.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/formAccessibilityModel.ts</span>
  </div>

```ts
export function getDescribedByIds(field: FieldAccessibilityState): string {
  return field.invalid
    ? `${field.descriptionId} ${field.errorId}`
    : field.descriptionId;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AccessibleSearchForm.vue</span>
  </div>

```vue
<label :id="queryField.labelId" :for="queryField.inputId">
  Search term
</label>
<input
  :id="queryField.inputId"
  v-model="state.query"
  type="search"
  :aria-labelledby="queryField.labelId"
  :aria-describedby="getDescribedByIds(queryField)"
  :aria-invalid="queryField.invalid ? 'true' : 'false'"
/>
```
</div>

**逐行解释：** label 绑定 input id；`aria-labelledby` 指向可见 label；`aria-describedby` 根据 invalid state 加入 error id；`aria-invalid` 从 Vue state 变成 DOM state。

**执行过程：** `state.query` 改变后 computed field 重新计算，template patch 更新 ARIA attributes。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** input 的 accessible name 保持 `Search term`；description 从 instruction 扩展到 error。

**为什么得到这个结果：** relationship ID 是 AT 能把错误与字段关联的关键证据。

**对比写法：** placeholder 只是一段输入提示，不是稳定 label。

**常见错误为什么错：** 复制组件时固定 id 会让多个 input 共享同一个 description。

**与真实项目的关系：** 搜索、筛选、登录和后台表单都需要稳定 ID 策略。

**与当前学习主线的关系：** Chapter 05 TypeScript 只能帮你管数据形状，不能替你证明 label 暴露。

**最终记忆模型：** label 给名字，description 给说明，error 给恢复路径。

<a id="section-9-4"></a>

### 9.4 Form accessibility：fieldset、legend、validation errors、aria-invalid、error summary and submit boundary

**结论：** 表单错误必须同时 visible、linked、focusable 和可恢复。

**本节解决的问题：** `validateSearchForm` 产生字段错误，`ValidationErrorSummary.vue` 用 summary link 指回字段。

**技术意义：** 只在字段下显示红字，键盘用户和 AT 用户不一定知道提交失败在哪里。

**概念解释：** `aria-invalid` 反映当前验证状态；`aria-describedby` 连接错误文本；error summary 用于提交后全局恢复。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** validation state 是 Vue runtime；错误可读性是 DOM relationship；submit boundary 不能陷住焦点。

**Accessibility 机制证据链：** 用户提交空表单；Vue computed 返回 errors；DOM patch `aria-invalid`；summary render links；test 断言 invalid state。

**TypeScript / vue-tsc 编译期过程：** `SearchFormState` 保证提交函数读取 `query` 和 `status`，但不能证明错误文本被朗读。

**Vue / Router / Browser / Assistive Technology 运行时过程：** submit event 被 `.prevent` 处理；Vue 更新 state；browser 保持表单控件可 Tab。

**API / 语法规则：** `@submit.prevent`、`aria-invalid`、`role="alert"`、summary links。

**文件结构：** `components/AccessibleSearchForm.vue`、`components/ValidationErrorSummary.vue`、`tests/accessibleSearchForm.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/ValidationErrorSummary.vue</span>
  </div>

```vue
<div v-if="errors.length > 0" role="alert" tabindex="-1">
  <p>Form cannot be submitted yet.</p>
  <ul>
    <li v-for="error in errors" :key="error.fieldId">
      <a :href="`#${error.inputId}`">{{ error.message }}</a>
    </li>
  </ul>
</div>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/accessibleSearchForm.test.ts</span>
  </div>

```ts
expect(searchInput.attributes("aria-invalid")).toBe("true");
expect(statusSelect.attributes("aria-invalid")).toBe("true");
expect(wrapper.text()).toContain("Fix the listed fields.");
```
</div>

**逐行解释：** summary 只在有 errors 时出现；`role="alert"` 表示提交失败状态；每个 link 指向字段 input；测试断言两个字段都暴露 invalid state。

**执行过程：** submit 触发 `submitSearch`；computed errors 更新；template 显示错误和 summary。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** `aria-invalid` 从 false 到 true；summary 从不存在到 alert；failure 是 error text 未连接字段。

**为什么得到这个结果：** 用户需要知道错误是什么，也需要知道从哪里修正。

**对比写法：** 只用 toast 提示“表单错误”没有字段恢复路径。

**常见错误为什么错：** `aria-invalid="true"` 常驻会让有效字段也被标成错误。

**与真实项目的关系：** 登录、支付、审批表单都应能通过键盘恢复。

**与当前学习主线的关系：** Chapter 08 的表单验证在这里补上 inclusive recovery。

**最终记忆模型：** 错误不是红字，是 field relationship 和 recovery path。

<a id="section-9-5"></a>

### 9.5 Button, link and custom control boundary：native behavior、keyboard activation and no clickable div

**结论：** 能用 `<button>` 和 `<a href>` 时，不要用可点击 `div` 重造控件。

**本节解决的问题：** `NativeControlBoundaryDemo.vue` 把 native button、native link 和 custom-control risk 放到同一个可观察界面里；`keyboardInteractionModel.ts` 记录 activation key、preferred element 和 failure signal；`nativeControlBoundary.test.ts` 只验证代码拥有的模型和 DOM evidence，不冒充浏览器完整键盘实现。

**技术意义：** ARIA role 不会自动添加 keyboard event、focus order 或 disabled behavior。

**概念解释：** button 天然拥有 button role、focusability、Enter/Space activation；link 天然表示 navigation；custom control 需要完整重建。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** keyboard activation 属于 browser/platform behavior。

**Accessibility 机制证据链：** 用户先遇到 native button 和真实 `href` link；button click 修改 `activationCount`；link 的 navigation target 是 `#chapter-15-main`；custom control 没有被实现为 clickable `div`，只作为 data risk 展示；failure signal 是 mouse click 可用但 Enter/Space 或 Enter navigation 不可用。

**TypeScript / vue-tsc 编译期过程：** `ControlElementKind` 能防止模型拼错，但不能保证 DOM 用了 button。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Vue 只处理 button 的 `@click` 和 `activationCount` 更新；Browser/platform 拥有 native key activation；AT 读取 button/link role 与 visible text；custom risk list 不提供 interactive DOM node。

**API / 语法规则：** `<button type="button">`、`<a href>`、keyboard event、disabled state。

**文件结构：** `components/NativeControlBoundaryDemo.vue`、`models/keyboardInteractionModel.ts`、`tests/nativeControlBoundary.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/NativeControlBoundaryDemo.vue</span>
  </div>

```vue
<div class="a11y-actions">
  <button class="a11y-button" type="button" @click="activateNativeButton">
    Native button action
  </button>
  <a class="a11y-button secondary" href="#chapter-15-main">
    Native link action
  </a>
</div>

<p class="a11y-status" role="status">
  Native button activations: {{ activationCount }}
</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/keyboardInteractionModel.ts</span>
  </div>

```ts
export function keyActivatesControl(kind: ControlElementKind, key: KeyboardKey): boolean {
  return getActivationRule(kind).activationKeys.includes(key);
}

export function shouldPreferNativeControl(kind: ControlElementKind): boolean {
  return !getActivationRule(kind).requiresManualKeyboardImplementation;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/nativeControlBoundary.test.ts</span>
  </div>

```ts
expect(keyActivatesControl("button", "Enter")).toBe(true);
expect(keyActivatesControl("button", " ")).toBe(true);
expect(keyActivatesControl("link", "Enter")).toBe(true);
expect(getActivationRule("custom").requiresManualKeyboardImplementation).toBe(true);
expect(shouldPreferNativeControl("custom")).toBe(false);
```
</div>

**逐行解释：** 第一段代码中，`button` 的 `type="button"` 避免表单默认提交，`@click` 只负责 Vue state 更新；`a[href]` 保留 navigation ownership；`role="status"` 只报告 activation count。第二段代码中，`keyActivatesControl` 读取对应 rule 的 activation keys；`shouldPreferNativeControl` 把 `requiresManualKeyboardImplementation` 转成 review decision。第三段 test 明确 button 的 Enter/Space、link 的 Enter 和 custom control 的 manual implementation risk。

**执行过程：** 用户点击 native button 时，Vue 调用 `activateNativeButton`，`activationCount` 增加并 patch status text；用户使用 link 时，browser 使用真实 `href` 处理 navigation；custom risk 只以 list item 呈现，不创建可点击 `div`。test 在 jsdom 中验证 model rule 和 rendered native controls，但不声称浏览器 keyboard activation 已被人工验收。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** 正确写法让 button role、focus 和 activation 一起存在；失败信号是鼠标能点但键盘不能操作。

**为什么得到这个结果：** 浏览器已经为 native controls 实现大量平台行为；ARIA role 只能暴露语义，不能补齐 keydown、focusability、disabled state 和 click synthesis。

**对比写法：** `div` 加 click handler 没有默认 focus 和 Space activation。

**常见错误为什么错：** `role="button"` 只改 accessibility tree 语义，不会自动让 `div` 进入 Tab order，也不会自动处理 Space key；因此本章把 custom control 作为 data risk，而不是实现一个坏例子。

**与真实项目的关系：** 设计系统按钮、表格排序、dialog action 都应从 native button 开始。

**与当前学习主线的关系：** Chapter 03 emits 处理 component event，但 DOM activation 仍由 native control 更可靠。

**最终记忆模型：** 先选对元素，再写 Vue 逻辑。

<a id="section-9-6"></a>

### 9.6 Focus management：focus visible、focus order、focus restore, focus trap and focus return

**结论：** focus 是 runtime ownership，不是 TypeScript ownership。

**本节解决的问题：** `useFocusRestore.ts` 管 route target；`useDialogFocusTrap.ts` 管 dialog trap 和 return。

**技术意义：** route change、modal open/close 和 dynamic content 都会改变用户当前任务位置。

**概念解释：** focus visible 让当前控件可见；focus order 应符合任务顺序；dialog focus trap 限制 Tab 范围；close 后返回 trigger。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** TypeScript 检查 ref 类型，实际 focus 由 browser 决定。

**Accessibility 机制证据链：** 用户触发 route or dialog；Vue open state 改变；`nextTick` 后 DOM 存在；focus 被转移；test 断言 active element。

**TypeScript / vue-tsc 编译期过程：** `Ref<HTMLElement | null>` 防止把非 DOM ref 当 focus target。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Vue patch DOM 后，browser 执行 `.focus()`，AT 使用当前 focused node。

**API / 语法规则：** template ref、`nextTick`、`.focus()`、`keydown`、`Tab`、`Escape`。

**文件结构：** `composables/useFocusRestore.ts`、`composables/useDialogFocusTrap.ts`、`tests/dialogFocusTrap.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/composables/useFocusRestore.ts</span>
  </div>

```ts
async function restoreFocus(reason: string): Promise<void> {
  await nextTick();
  targetRef.value?.focus();
  lastFocusedId.value = `${targetId}:${reason}`;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/dialogFocusTrap.test.ts</span>
  </div>

```ts
expect(dialog?.getAttribute("aria-modal")).toBe("true");
expect(document.activeElement?.id).toBe("accessibility-dialog-confirm");
```
</div>

**逐行解释：** `await nextTick()` 等待 Vue patch；`targetRef.value?.focus()` 把 browser focus 移到目标；测试用 `document.activeElement` 验证 runtime focus。

**执行过程：** button click 或 route simulation 改变 state；Vue patch 后 focus owner 执行 `.focus()`。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** active element 从 trigger 变成 dialog action，再在 close 后返回 trigger。

**为什么得到这个结果：** focus target 必须在 DOM 中存在，提前 focus 会失败。

**对比写法：** route change 只更新 component，不移动 focus，会让键盘用户留在旧位置。

**常见错误为什么错：** 去掉 outline 让 focus 仍存在但不可见。

**与真实项目的关系：** modal、drawer、route page 和 toast action 都需要明确 focus owner。

**与当前学习主线的关系：** Chapter 04 composable 在这里承接 DOM focus side effect。

**最终记忆模型：** focus 是运行时任务位置，必须显式设计。

<a id="section-9-7"></a>

### 9.7 Disclosure / accordion interaction：expanded state、button ownership、keyboard and content visibility

**结论：** disclosure 的 owner 是 button，不是 content 容器。

**本节解决的问题：** `AccessibleDisclosure.vue` 用 native button、`aria-expanded` 和 controlled content 建立最小 disclosure。

**技术意义：** 视觉展开不等于可访问状态展开。

**概念解释：** button 暴露操作；`aria-expanded` 暴露 state；`aria-controls` 连接内容；content visibility 由 Vue state 决定。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** Vue owns boolean state；button owns keyboard activation。

**Accessibility 机制证据链：** 用户按 button；`open` 切换；`aria-expanded` patch；content mount/unmount；test 断言 state 和 text。

**TypeScript / vue-tsc 编译期过程：** `ref(false)` 推断 boolean，防止把 string state 当 condition。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Native button 处理 Enter/Space；Vue click handler 更新 state。

**API / 语法规则：** `<button>`、`:aria-expanded`、`:aria-controls`、`v-if`。

**文件结构：** `components/AccessibleDisclosure.vue`、`tests/accessibleDisclosure.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AccessibleDisclosure.vue</span>
  </div>

```vue
<button
  class="a11y-button"
  type="button"
  :aria-expanded="open ? 'true' : 'false'"
  :aria-controls="contentId"
  @click="open = !open"
>
  {{ buttonLabel }}
</button>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/accessibleDisclosure.test.ts</span>
  </div>

```ts
expect(button.attributes("aria-expanded")).toBe("false");
await button.trigger("click");
expect(button.attributes("aria-expanded")).toBe("true");
```
</div>

**逐行解释：** button 保留 native keyboard behavior；`aria-expanded` 与 `open` 同步；`aria-controls` 指向内容 id；click handler 只切换 state。

**执行过程：** click 触发 Vue state update，render effect 重新运行，DOM attribute 和 content 一起 patch。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** button state 从 false 到 true；content 从不存在到存在；failure 是 content 可见但 state 未变。

**为什么得到这个结果：** 状态必须暴露在触发控件上。

**对比写法：** 用标题点击展开但不使用 button，会丢失 keyboard activation。

**常见错误为什么错：** 每个 panel 都 `tabindex="0"` 会制造无意义 tab stop。

**与真实项目的关系：** FAQ、filter panel、admin advanced search 都是 disclosure 变体。

**与当前学习主线的关系：** Chapter 08 drawer/form 的展开体验需要同样的 state evidence。

**最终记忆模型：** disclosure = button + state + controlled content。

<a id="section-9-8"></a>

### 9.8 Dialog accessibility：Teleport boundary、modal semantics、escape close、focus trap and inert background

**结论：** Teleport 只改变 DOM 放置位置，不自动提供 modal accessibility。

**本节解决的问题：** `AccessibleDialog.vue` 和 `useDialogFocusTrap.ts` 显式处理 `role="dialog"`、`aria-modal`、focus trap、Escape close 和 focus return。

**技术意义：** modal 是交互边界，不能让焦点留在背景页面。

**概念解释：** dialog title 通过 `aria-labelledby` 命名；focus start 在 dialog 内；Tab 循环；Escape close；close 后回到 trigger。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** Teleport 属 Vue DOM placement；focus trap 属 browser runtime。

**Accessibility 机制证据链：** trigger click -> open true -> Teleport render -> first button focus -> Tab cycle -> Escape close -> trigger focus。

**TypeScript / vue-tsc 编译期过程：** `DialogFocusState` 检查 focusable IDs，但不能证明页面背景真的不可达。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Vue patch Teleport target；browser activeElement 改变；AT 读取 dialog role 和 title。

**API / 语法规则：** `<Teleport>`、`role="dialog"`、`aria-modal="true"`、`aria-labelledby`、`keydown`。

**文件结构：** `components/AccessibleDialog.vue`、`composables/useDialogFocusTrap.ts`、`models/dialogAccessibilityModel.ts`、`tests/dialogFocusTrap.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AccessibleDialog.vue</span>
  </div>

```vue
<button
  id="open-accessibility-dialog"
  ref="triggerRef"
  class="a11y-button"
  type="button"
  @click="openDialog"
>
  Open dialog
</button>

<Teleport to="body">
  <div v-if="open" class="a11y-dialog-backdrop">
    <section
      ref="dialogRef"
      class="a11y-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-dialog-title"
      aria-describedby="accessibility-dialog-description"
      @keydown="handleDialogKeydown"
    >
    <h2 id="accessibility-dialog-title">Keyboard verification dialog</h2>
      <button id="accessibility-dialog-confirm" ref="firstFocusableRef" type="button">
        Confirm
      </button>
      <button id="accessibility-dialog-cancel" ref="lastFocusableRef" type="button">
        Cancel
      </button>
  </section>
  </div>
</Teleport>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/composables/useDialogFocusTrap.ts</span>
  </div>

```ts
function openDialog(): void {
  const currentElement = document.activeElement;

  if (currentElement instanceof HTMLElement) {
    triggerRef.value = currentElement;
  }

  open.value = true;
  void nextTick(() => {
    focusFirstDialogControl();
  });
}

function handleDialogKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    closeDialog("escape");
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const currentElement = document.activeElement;

  if (event.shiftKey && currentElement === firstFocusableRef.value) {
    event.preventDefault();
    focusLastDialogControl();
    return;
  }

  if (!event.shiftKey && currentElement === lastFocusableRef.value) {
    event.preventDefault();
    focusFirstDialogControl();
    return;
  }

  event.preventDefault();
  const nextId = getNextDialogFocusId(
    focusState.value,
    event.shiftKey ? "backward" : "forward",
  );
  focusElementById(nextId);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/dialogFocusTrap.test.ts</span>
  </div>

```ts
await wrapper.get("#open-accessibility-dialog").trigger("click");
await nextTick();
await nextTick();

expect(document.activeElement?.id).toBe("accessibility-dialog-confirm");

dialog?.dispatchEvent(
  new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
);
await nextTick();

expect(document.activeElement?.id).toBe("accessibility-dialog-cancel");

dialog?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
await nextTick();
await nextTick();

expect(document.querySelector('[role="dialog"]')).toBeNull();
expect(document.activeElement?.id).toBe("open-accessibility-dialog");
```
</div>

**逐行解释：** 第一段代码中，trigger button 持有 `triggerRef`，Teleport 只改变 DOM placement；dialog 用 `role="dialog"`、`aria-modal`、`aria-labelledby` 和 `aria-describedby` 暴露 name 与 description；confirm/cancel button 分别绑定 first/last focusable refs。第二段代码中，`openDialog` 先存储当前 active trigger，再等 Vue render 后聚焦 first control；Escape branch 关闭 dialog；Tab branch 根据 first/last ref 决定 Shift+Tab 回到 last，Tab 从 last 回到 first；中间状态用 `getNextDialogFocusId` 更新。第三段 test 打开 dialog 后断言 initial focus，触发 Shift+Tab 断言 cycle，再触发 Escape 断言 dialog 移除和 focus return。

**执行过程：** trigger click 后 `open.value = true`，Vue patch Teleport content 到 body；`nextTick` 后 `firstFocusableRef` 获得 focus；keydown Tab/Shift+Tab 在 dialog boundary 内循环；keydown Escape 调用 `closeDialog("escape")`，Vue 移除 dialog，下一次 tick 把 focus 放回 `triggerRef`。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** dialog node 从无到有；accessible name 来自 title；description 来自 paragraph；focus target 从 trigger 进入 confirm，再在 confirm/cancel 间循环；Escape 后 dialog node 为 null，focus target 回到 trigger。failure signal 是 focus 留在背景、Tab 逃出 dialog、Escape 无效或 close 后 active element 丢失。

**为什么得到这个结果：** Teleport 和 accessibility 是两个不同边界。

**对比写法：** 只用 fixed overlay 但不移动 focus，键盘仍可操作背景；只写 `aria-modal` 但不 trap focus，也不能证明 modal interaction 成立。

**常见错误为什么错：** dialog close 后不返回 trigger 会让用户丢失任务位置。

**与真实项目的关系：** 登录弹窗、确认删除、批量审批都必须满足这个边界。

**与当前学习主线的关系：** Chapter 04 composable 和 Chapter 14 migration 都会遇到 modal owner。

**最终记忆模型：** Teleport moves nodes; focus trap owns interaction.

<a id="section-9-9"></a>

### 9.9 Roving tabindex widget：tabs/listbox mental model、active descendant option and arrow-key ownership

**结论：** roving tabindex 让复合控件只有一个 Tab 入口，内部用 arrow keys 移动。

**本节解决的问题：** `RovingTabindexTabs.vue` 和 `useRovingTabindex.ts` 让 active item 拥有 `tabindex` zero，其余 item 为 negative tab stop，并把 ArrowRight、ArrowLeft、Home 和 End 都收敛到一个 dispatcher。

**技术意义：** 如果每个 tab 都进入全局 Tab 顺序，键盘路径会膨胀。

**概念解释：** roving tabindex 直接移动 DOM focus；`aria-activedescendant` 是另一种方案，本章选择 roving，因为它更容易在 jsdom 中验证。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** Arrow key owner 是 widget，不是整个页面。

**Accessibility 机制证据链：** 用户 Tab 到 active tab；ArrowRight/ArrowLeft/Home/End 更新 active index；template patch `tabindex`、`aria-selected` 和 `aria-controls`；`nextTick` 后 focus 移到新的 active tab；tabpanel 使用 active item id 绑定 label。

**TypeScript / vue-tsc 编译期过程：** `RovingItem` 保证每个 item 有 id 和 label。

**Vue / Router / Browser / Assistive Technology 运行时过程：** keydown event 被 widget 捕获；Vue state 更新；browser tab order 变化。

**API / 语法规则：** `role="tablist"`、`role="tab"`、`role="tabpanel"`、`aria-selected`、`aria-controls`、`tabindex`、ArrowLeft/ArrowRight/Home/End。

**文件结构：** `components/RovingTabindexTabs.vue`、`composables/useRovingTabindex.ts`、`models/rovingTabindexModel.ts`、`tests/rovingTabindexTabs.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/composables/useRovingTabindex.ts</span>
  </div>

```ts
function handleRovingKeydown(event: KeyboardEvent): boolean {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveNext();
    return true;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    movePrevious();
    return true;
  }

  if (event.key === "Home") {
    event.preventDefault();
    moveFirst();
    return true;
  }

  if (event.key === "End") {
    event.preventDefault();
    moveLast();
    return true;
  }

  return false;
}

function getItemTabIndex(itemIndex: number): 0 | -1 {
  return getRovingTabIndex(state.value, itemIndex);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/RovingTabindexTabs.vue</span>
  </div>

```vue
<div class="a11y-tabs" role="tablist" aria-label="Accessibility topics">
  <button
    v-for="(tab, index) in tabs"
    :id="`${tab.id}-tab`"
    :key="tab.id"
    :ref="(element) => setTabRef(element, index)"
    type="button"
    role="tab"
    :aria-selected="getItemSelectedState(index)"
    :aria-controls="`${tab.id}-panel`"
    :tabindex="getItemTabIndex(index)"
    @keydown="handleTabKeydown"
    @click="activeIndex = index"
  >
    {{ tab.label }}
  </button>
</div>

<section :id="panelId" role="tabpanel" :aria-labelledby="`${activeItem.id}-tab`">
  Active topic: {{ activeItem.label }}
</section>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/rovingTabindexTabs.test.ts</span>
  </div>

```ts
await tabs[0]?.trigger("keydown", { key: "End" });
await nextTick();

const endTabs = wrapper.findAll('[role="tab"]');
expect(endTabs[2]?.attributes("tabindex")).toBe("0");
expect(document.activeElement?.id).toBe("responsive-check-tab");

await endTabs[2]?.trigger("keydown", { key: "Home" });
await nextTick();

const homeTabs = wrapper.findAll('[role="tab"]');
expect(homeTabs[0]?.attributes("tabindex")).toBe("0");
expect(homeTabs[1]?.attributes("tabindex")).toBe("-1");
expect(homeTabs[2]?.attributes("tabindex")).toBe("-1");
```
</div>

**逐行解释：** 第一段 code 的 dispatcher 把 ArrowRight、ArrowLeft、Home 和 End 映射到 `moveNext`、`movePrevious`、`moveFirst` 和 `moveLast`，返回 `true` 表示组件需要在 patch 后移动 focus；`getItemTabIndex` 把 active index 转成 `0` 或 `-1`。第二段 template 中，`role="tablist"` 定义复合控件，button 暴露 `role="tab"`，`aria-selected` 和 `tabindex` 来自同一 active index，`aria-controls` 连接 panel。第三段 test 先用 End 移到最后一个 tab，再用 Home 回到第一个 tab，同时检查 inactive tabs 保持 `tabindex="-1"`。

**执行过程：** keydown 进入 `handleRovingKeydown`；composable 更新 `activeIndex`；Vue 重新计算 `activeItem` 和 `panelId`；template patch tab attributes 和 panel label；组件 `nextTick` 后调用当前 tab ref 的 `focus()`。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** active tab 从 first 变 second 或 last；`aria-selected` 和 `tabindex` 同步变化；focus target 跟随 active tab；failure 是多个 item 都为 `tabindex` zero、Home/End 无效或 panel label 指向旧 tab。

**为什么得到这个结果：** 复合控件内部导航应由控件接管。

**对比写法：** roving tabindex 直接移动 DOM focus；`aria-activedescendant` 保持 DOM focus 在容器上，通过 attribute 指向 active item。两者都可用，但本章选择 roving，因为每个 tab 都是 native button，`document.activeElement` 在 test 中可直接观察。

**常见错误为什么错：** 只改视觉 active class 但不改 `aria-selected`，AT 不知道状态。

**与真实项目的关系：** tabs、segmented control、toolbar、listbox 都会用到这个 mental model。

**与当前学习主线的关系：** Chapter 03 component public contract 在这里变成 keyboard contract。

**最终记忆模型：** Tab enters widget; arrows move inside widget.

<a id="section-9-10"></a>

### 9.10 Data table accessibility：caption、scope、sortable header button、empty state and responsive overflow

**结论：** table sort 必须同时改变视觉顺序和可访问状态/名称。

**本节解决的问题：** `SortableResultsTable.vue` 使用 caption、header scope、sort button、`aria-sort` 和 overflow container。

**技术意义：** 表格在后台项目中常见，排序和横向滚动是最容易漏掉的可访问性点。

**概念解释：** caption 描述表；`scope="col"` 连接 header；sort button 负责操作；`aria-sort` 暴露当前方向；overflow container 保证窄屏不撑破页面。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** table semantics 来自 HTML；responsive overflow 需要 browser width 检查。

**Accessibility 机制证据链：** 用户按 sort button；sort direction 切换；rows 重新排序；header `aria-sort` patch；test 断言 state。

**TypeScript / vue-tsc 编译期过程：** `SortState` 限定 column 和 direction；不能证明表格在 360px 没有页面 overflow。

**Vue / Router / Browser / Assistive Technology 运行时过程：** button click 触发 sort state；Vue patch rows；AT 可读取 header state。

**API / 语法规则：** `<caption>`、`scope="col"`、button in header、`aria-sort`、overflow container。

**文件结构：** `components/SortableResultsTable.vue`、`models/tableAccessibilityModel.ts`、`tests/sortableResultsTable.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/SortableResultsTable.vue</span>
  </div>

```vue
<th scope="col" :aria-sort="sortDirection">
  <button class="a11y-button secondary" type="button" @click="toggleScoreSort">
    {{ createSortButtonLabel("score", sortDirection) }}
  </button>
</th>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/sortableResultsTable.test.ts</span>
  </div>

```ts
expect(header.attributes("aria-sort")).toBe("ascending");
await button.trigger("click");
expect(wrapper.get("th[aria-sort]").attributes("aria-sort")).toBe("descending");
```
</div>

**逐行解释：** header owns sort state；button owns keyboard activation；label includes current direction；test proves state changes after click.

**执行过程：** `toggleScoreSort` flips direction；computed `sortedRows` recalculates；table rows patch。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** sort state 从 ascending 到 descending；failure 是 rows changed but header state stayed stale。

**为什么得到这个结果：** table sort is both data behavior and accessibility state.

**对比写法：** 只在 header text 加箭头图标会把 state 留给视觉用户。

**常见错误为什么错：** table 横向撑破 page 会破坏 1.4.10 reflow 类检查。

**与真实项目的关系：** admin table、audit table、order table 都应使用这个 pattern。

**与当前学习主线的关系：** Chapter 08 data table 在这里补上 semantic sort evidence。

**最终记忆模型：** Table sort must update rows and exposed state.

<a id="section-9-11"></a>

### 9.11 Live regions and async status：loading、toast、alert、polite/assertive and announcement throttling

**结论：** live region 用于重要异步状态，不用于每次输入变化。

**本节解决的问题：** `AsyncStatusLiveRegion.vue` 和 `liveRegionModel.ts` 区分 polite 和 assertive，并对 polite 消息做节流。

**技术意义：** 过度播报会干扰用户完成任务。

**概念解释：** `role="status"` 通常是 polite；alert/assertive 用于需要立即注意的失败；toast 不能太快消失。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** 测试能证明消息策略，不能证明具体 screen reader 播报。

**Accessibility 机制证据链：** async action 完成；model 判断是否 announce；Vue 更新 message；live region text 变更；manual screen reader check 不在本任务中执行。

**TypeScript / vue-tsc 编译期过程：** `LiveRegionPriority` 限定 `"polite"` 和 `"assertive"`。

**Vue / Router / Browser / Assistive Technology 运行时过程：** state patch 到 live region text；AT 可选择播报。

**API / 语法规则：** `role="status"`、`aria-live="polite"`、assertive alert policy。

**文件结构：** `components/AsyncStatusLiveRegion.vue`、`models/liveRegionModel.ts`、`tests/liveRegionModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/liveRegionModel.ts</span>
  </div>

```ts
if (next.priority === "assertive") {
  return true;
}

return next.createdAtMs - previous.createdAtMs >= minimumIntervalMs;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/liveRegionModel.test.ts</span>
  </div>

```ts
expect(shouldAnnounceMessage(previous, polite, 700)).toBe(false);
expect(shouldAnnounceMessage(previous, assertive, 700)).toBe(true);
```
</div>

**逐行解释：** assertive message 直接允许；polite message 必须超过间隔；test 证明同一时间窗口内 polite 被抑制而 assertive 保留。

**执行过程：** button 生成 message，model 决定是否更新 `currentMessage`，template patch status text。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** status text 从 empty 变为 result；failure 是每个 keystroke 都产生 live update。

**为什么得到这个结果：** live region 是用户注意力通道，不是 log output。

**对比写法：** 将 search input 每次输入都写进 live region 会制造噪声。

**常见错误为什么错：** toast 自动消失过快，用户可能还没感知就丢失内容。

**与真实项目的关系：** save、upload、filter result、checkout failure 都需要 status policy。

**与当前学习主线的关系：** Chapter 09 API state 和 Chapter 10 async testing 在这里连接可访问反馈。

**最终记忆模型：** Announce state changes, not every state mutation.

<a id="section-9-12"></a>

### 9.12 Color contrast and theming：text contrast、non-text contrast、focus ring, dark/light mode evidence

**结论：** contrast 是 release evidence，不是设计偏好。

**本节解决的问题：** `contrastModel.ts` 和 `ContrastReviewPanel.vue` 把 text、focus ring 和 chip contrast 转成可审查数据。

**技术意义：** light mode pass 不代表 dark mode pass；focus ring 也需要可见。

**概念解释：** text contrast、non-text contrast 和 focus indication 是不同检查对象；颜色不能是唯一状态通道。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** model ratio 是静态证据，真实浏览器仍需视觉检查。

**Accessibility 机制证据链：** theme token 选定；contrast pair 记录 ratio；panel 显示 reviewed/blocked；manual check 验证 focus ring。

**TypeScript / vue-tsc 编译期过程：** `ContrastPair` 保证 ratio 和 target 存在。

**Vue / Router / Browser / Assistive Technology 运行时过程：** CSS paint 决定真实像素；AT 不替代视觉 contrast。

**API / 语法规则：** CSS custom colors、`:focus-visible`、contrast evidence model。

**文件结构：** `models/contrastModel.ts`、`components/ContrastReviewPanel.vue`、`accessibility-responsive.css`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/contrastModel.ts</span>
  </div>

```ts
export function passesContrast(pair: ContrastPair): boolean {
  return pair.ratio >= pair.target;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/accessibility-responsive.css</span>
  </div>

```css
.chapter-15 button:focus-visible,
.chapter-15 input:focus-visible,
.chapter-15 select:focus-visible {
  outline: 0.2rem solid #0f766e;
}
```
</div>

**逐行解释：** model 用 ratio 对 target；CSS 用 `:focus-visible` 保留可见 focus ring。

**执行过程：** panel 渲染 pair；CSS 在 keyboard focus 时显示 outline。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** focus target 不变，但可见 outline 出现；failure 是 dark theme 下 outline 不可见。

**为什么得到这个结果：** contrast 发生在视觉渲染层，不发生在 TypeScript 层。

**对比写法：** 全局 `outline: none` 会删除键盘用户最重要的定位信号。

**常见错误为什么错：** 只用颜色表达 error/success，色弱用户可能无法区分。

**与真实项目的关系：** design token review 应包含 light/dark/focus 三类 evidence。

**与当前学习主线的关系：** Chapter 08 theme store 在这里补充 contrast gate。

**最终记忆模型：** Color tokens must carry contrast evidence.

<a id="section-9-13"></a>

### 9.13 Reduced motion and animation：prefers-reduced-motion、Transition boundary, visibility preservation

**结论：** reduced motion 应减少非必要运动，但不能隐藏内容。

**本节解决的问题：** `usePrefersReducedMotion.ts`、`ReducedMotionTransitionDemo.vue` 和 `reducedMotionModel.ts` 通过 policy 分支保留内容可见。

**技术意义：** 动画可能引起不适；禁用动画不能变成禁用信息。

**概念解释：** CSS media query 检测系统偏好；Vue Transition 负责 enter/leave class；policy 控制 transition name 和 duration。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** media query 属 browser；model test 只证明 policy branch。

**Accessibility 机制证据链：** 用户系统偏好 reduce；media query matches；policy duration 变 0；contentVisible 保持 true；test 断言。

**TypeScript / vue-tsc 编译期过程：** `MotionPreference` 限定 `"reduce"` 与 `"no-preference"`。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Browser 触发 media query change；Vue ref 更新；Transition 使用新的 name。

**API / 语法规则：** `window.matchMedia`、`@media (prefers-reduced-motion: reduce)`、`<Transition>`。

**文件结构：** `components/ReducedMotionTransitionDemo.vue`、`composables/usePrefersReducedMotion.ts`、`models/reducedMotionModel.ts`、`tests/reducedMotionModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/reducedMotionModel.ts</span>
  </div>

```ts
if (preference === "reduce") {
  return {
    preference,
    transitionName: "no-motion",
    durationMs: 0,
    contentVisible: true,
  };
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/reducedMotionModel.test.ts</span>
  </div>

```ts
expect(reduced.durationMs).toBe(0);
expect(reduced.transitionName).toBe("no-motion");
expect(keepsContentVisible(reduced)).toBe(true);
```
</div>

**逐行解释：** reduce branch 明确 duration 为 0；transition name 切到 no-motion；`contentVisible` 仍为 true；test 锁定这个边界。

**执行过程：** media query 更新 policy，template `Transition` 读取 policy name。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** CSS query 改变 motion branch；failure 是内容因为 disabled animation 而不可见。

**为什么得到这个结果：** reduced motion 是替换 motion，不是删除任务。

**对比写法：** `v-if="!prefersReducedMotion"` 会直接隐藏内容。

**常见错误为什么错：** 只去掉 transition class 但保留 long JavaScript animation 仍会产生运动。

**与真实项目的关系：** dashboard cards、route transition、toast 和 skeleton loading 都需要 motion policy。

**与当前学习主线的关系：** Chapter 11 performance animation 和 Chapter 14 transition migration 都要接这个边界。

**最终记忆模型：** Reduce motion, preserve information.

<a id="section-9-14"></a>

### 9.14 Responsive layout verification：mobile nav、reflow、target size, code/table overflow and viewport matrix

**结论：** responsive 不是写了 breakpoint，而是任务在代表性宽度下继续可完成。

**本节解决的问题：** `ResponsiveNavigationDemo.vue` 和 `responsiveVerificationModel.ts` 建立 360、390、768、1024、1280、1440 的 width matrix。

**技术意义：** 360px overflow、small touch target、sticky header 覆盖 focus 都会阻塞移动端使用。

**概念解释：** reflow 是内容在窄屏不需要双向滚动；code/table 可局部 overflow，但 page 不能整体横向 overflow。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** model 能标记 width，真实 layout 需 browser verification。

**Accessibility 机制证据链：** viewport width 变化；`useResponsiveViewport` 检测 scrollWidth；result 更新；dashboard 显示 pass/blocked；manual check 确认。

**TypeScript / vue-tsc 编译期过程：** `ViewportCheck` 保证每个检查都有 width、overflow、target 和 nav 字段。

**Vue / Router / Browser / Assistive Technology 运行时过程：** resize event 更新 ref；CSS media query 改变 nav layout。

**API / 语法规则：** `resize` event、`window.innerWidth`、`documentElement.scrollWidth`、CSS media query。

**文件结构：** `components/ResponsiveNavigationDemo.vue`、`composables/useResponsiveViewport.ts`、`models/responsiveVerificationModel.ts`、`tests/responsiveVerificationModel.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/responsiveVerificationModel.ts</span>
  </div>

```ts
export const representativeViewportWidths: ReadonlyArray<number> = [
  360, 390, 768, 1024, 1280, 1440,
];
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/responsiveVerificationModel.test.ts</span>
  </div>

```ts
expect(result.status).toBe("blocked");
expect(result.failureSignals).toContain("Horizontal overflow");
```
</div>

**逐行解释：** width matrix 固定代表性宽度；test 用 360px overflow 证明模型会阻塞；manual check 仍要确认真实 layout。

**执行过程：** resize 更新 width，model 生成 result，component 渲染 viewport status。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** viewport 从 desktop 到 mobile；nav 从 horizontal 到 grid；failure 是 page-level horizontal overflow。

**为什么得到这个结果：** responsive bug 只有在具体 viewport 下才可观察。

**对比写法：** 只看 1280px desktop 会漏掉 mobile nav 和 overflow。

**常见错误为什么错：** code block/table 没有局部 overflow 会撑破 page。

**与真实项目的关系：** 中后台系统也常在平板和小屏审批场景使用。

**与当前学习主线的关系：** Chapter 11 production build 之后需要 preview width smoke。

**最终记忆模型：** Responsive verification is a width matrix, not a CSS promise.

<a id="section-9-15"></a>

### 9.15 Accessibility testing：role/name queries、keyboard events、focus assertions and manual checks

**结论：** 自动化测试可以覆盖 role/state/focus 的一部分，但不能宣称完整 WCAG 或 screen reader 支持。

**本节解决的问题：** 本章使用 Vue Test Utils 和 Vitest 测 `aria-invalid`、`aria-expanded`、dialog focus、roving tabindex、sort state、live region policy、reduced motion 和 responsive model。

**技术意义：** 测试应该接近用户可观察行为：role/name/state/focus，而不是组件内部变量。

**概念解释：** jsdom 可检查 DOM attributes 和 `document.activeElement`；真实 browser、screen reader 和视觉 contrast 需要人工或专门工具。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** test runner 是 evidence source，不是 AT。

**Accessibility 机制证据链：** test mounts component；trigger click/key；Vue patch DOM；assert role/state/focus；manual check covers remaining gaps。

**TypeScript / vue-tsc 编译期过程：** test imports and component props are typechecked.

**Vue / Router / Browser / Assistive Technology 运行时过程：** Vue Test Utils simulates events; jsdom approximates DOM; no screen reader is executed.

**API / 语法规则：** `mount`、`trigger`、`attributes`、`document.activeElement`、`expect`。

**文件结构：** `tests/*.test.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/accessibleSearchForm.test.ts</span>
  </div>

```ts
await wrapper.find("form").trigger("submit");

const searchInput = wrapper.find('input[type="search"]');
const statusSelect = wrapper.find("select");

expect(searchInput.attributes("aria-invalid")).toBe("true");
expect(statusSelect.attributes("aria-invalid")).toBe("true");
expect(wrapper.text()).toContain("Fix the listed fields.");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/accessibleDisclosure.test.ts</span>
  </div>

```ts
const button = wrapper.get("button");

expect(button.attributes("aria-expanded")).toBe("false");
expect(wrapper.text()).not.toContain("Tab reaches the button once.");

await button.trigger("click");

expect(button.attributes("aria-expanded")).toBe("true");
expect(wrapper.text()).toContain("Tab reaches the button once.");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/dialogFocusTrap.test.ts</span>
  </div>

```ts
dialog?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
await nextTick();
await nextTick();

expect(document.querySelector('[role="dialog"]')).toBeNull();
expect(document.activeElement?.id).toBe("open-accessibility-dialog");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/rovingTabindexTabs.test.ts</span>
  </div>

```ts
await tabs[0]?.trigger("keydown", { key: "ArrowRight" });
await nextTick();

const updatedTabs = wrapper.findAll('[role="tab"]');
expect(updatedTabs[0]?.attributes("tabindex")).toBe("-1");
expect(updatedTabs[1]?.attributes("tabindex")).toBe("0");
expect(document.activeElement?.id).toBe("focus-order-tab");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/sortableResultsTable.test.ts</span>
  </div>

```ts
const header = wrapper.get("th[aria-sort]");
const button = wrapper.get("th button");

expect(header.attributes("aria-sort")).toBe("ascending");
expect(button.text()).toBe("Sort by score, ascending");

await button.trigger("click");

expect(wrapper.get("th[aria-sort]").attributes("aria-sort")).toBe("descending");
```
</div>

**逐行解释：** form test 触发 submit 并读取 `aria-invalid`，证明错误状态进入 DOM；disclosure test 点击 native button 并检查 `aria-expanded` 与 content visibility 同步；dialog test 发出 Escape keyboard event，等待 Vue patch 后断言 dialog 移除和 focus return；roving test 触发 ArrowRight 并检查 `tabindex` 和 activeElement；sortable table test 点击 header 内 native button 并检查 `aria-sort` 从 ascending 到 descending。

**执行过程：** Vitest 运行 jsdom；Vue Test Utils mount component；trigger click、submit 或 keydown；Vue patch DOM；assert attributes、text 和 `document.activeElement`。这些 tests 验证代码拥有的 DOM/focus behavior，不证明 screen reader output，不证明 WCAG conformance，也不能替代 manual keyboard 和 browser width verification。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** form failure 是 invalid fields 没有 `aria-invalid`；disclosure failure 是 content visible 但 `aria-expanded` 不变；dialog failure 是 dialog still exists 或 focus 未返回；roving failure 是多个 tab stop 或 activeElement 不移动；table failure 是 sort order 变了但 `aria-sort` 或 button label 不更新。

**为什么得到这个结果：** 这类 behavior 属于 component runtime，可以在 jsdom 中部分验证。

**对比写法：** 只断言 `open === false` 不证明 DOM 和 focus 真的更新。

**常见错误为什么错：** 把 unit tests 说成 WCAG proof 是证据过度声明。

**与真实项目的关系：** PR 可以要求 component test + manual keyboard checklist 双证据。

**与当前学习主线的关系：** Chapter 10 的 quality gates 在这里转成 accessibility-specific assertions。

**最终记忆模型：** Test what code can prove; label the rest as manual evidence.

<a id="section-9-16"></a>

### 9.16 Accessibility issue dashboard：severity、WCAG criterion、owner, evidence and release gate

**结论：** accessibility issue 不是“建议优化”，它需要 owner、severity、criterion、evidence、remediation 和 release gate。

**本节解决的问题：** `accessibilityIssueModel.ts` 和 `AccessibilityVerificationDashboard.vue` 把 blocked issue 转成 release-ready false。

**技术意义：** 没有 owner 和 evidence 的 accessibility bug 会在 release 前被弱化。

**概念解释：** severity 应包含用户影响；WCAG criterion 是定位语言；evidence 指向 test/manual/browser record；blocked issue 阻塞发布。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** dashboard 汇总证据，不生成证据。

**Accessibility 机制证据链：** issue list 包含 blocked item；model 过滤 blocked；dashboard releaseReady false；failure signal 是 release gate blocked。

**TypeScript / vue-tsc 编译期过程：** `AccessibilityIssue` 防止缺少 owner、evidence 和 remediation。

**Vue / Router / Browser / Assistive Technology 运行时过程：** dashboard 渲染 issue cards；reviewer 用它决定是否继续发布。

**API / 语法规则：** issue model、computed release gate、dashboard summary。

**文件结构：** `models/accessibilityIssueModel.ts`、`components/AccessibilityVerificationDashboard.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/models/accessibilityIssueModel.ts</span>
  </div>

```ts
export function canReleaseAccessibilityWork(
  issues: ReadonlyArray<AccessibilityIssue>,
): boolean {
  return getBlockedAccessibilityIssues(issues).length === 0;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AccessibilityVerificationDashboard.vue</span>
  </div>

```vue
<p class="a11y-status">
  Release ready: {{ releaseReady ? "yes" : "no" }}.
  Blocked issues: {{ blockedIssues.length }}.
</p>
```
</div>

**逐行解释：** release function 只允许 zero blocked issues；dashboard 把 boolean 和 count 显示给 reviewer。

**执行过程：** app import issue list，model returns blocked issues，template render release summary。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** blocked count 大于零时 release-ready 为 no。

**为什么得到这个结果：** 可访问性修复也需要工程化 owner 和 gate。

**对比写法：** issue 只写“需要优化无障碍”没有可执行修复路径。

**常见错误为什么错：** 自动化工具没运行却把 issue 标为 verified，是虚假证据。

**与真实项目的关系：** release checklist、PR review 和 design QA 都需要 issue dashboard。

**与当前学习主线的关系：** Chapter 14 migration gate 的思路复用于 accessibility gate。

**最终记忆模型：** Accessibility issue must have owner and evidence.

<a id="section-9-17"></a>

### 9.17 Chapter integration：how Chapter 15 connects UI, Router, forms, tests, production and migration

**结论：** Chapter 15 不是孤立章节；它连接前面章节的 UI、Router、forms、testing、production 和 migration。

**本节解决的问题：** `AccessibilityResponsiveChapterApp.vue` 在 root shell 中渲染所有 demos，不移除 Chapter 01–14 panels。

**技术意义：** 可访问性要进入现有 learning shell，而不是新建另一个应用。

**概念解释：** Chapter app 是本章入口；models/composables/components/tests 是证据；root `App.vue` 只做 import 和 render。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** integration 只证明本章进入 shell，不证明浏览器手动验收。

**Accessibility 机制证据链：** root app render Chapter 15；Chapter app render demos；demos import models/composables；tests import components/models。

**TypeScript / vue-tsc 编译期过程：** root import 和 all component imports 被 `vue-tsc` 检查。

**Vue / Router / Browser / Assistive Technology 运行时过程：** root render effect 包含 Chapter 15 subtree；browser DOM 增加 Chapter 15 region。

**API / 语法规则：** SFC import、component render、scoped/global CSS boundary。

**文件结构：** `AccessibilityResponsiveChapterApp.vue`、`chapter-01-application-boundary/App.vue`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/AccessibilityResponsiveChapterApp.vue</span>
  </div>

```vue
<SkipLinkDemo />
<LandmarkLayoutDemo />
<AccessibleSearchForm />
<AccessibleDialog />
<AccessibilityVerificationDashboard />
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
<MigrationModernizationChapterApp />

<div class="chapter-divider" role="separator"></div>

<AccessibilityResponsiveChapterApp />
```
</div>

**逐行解释：** Chapter app renders core demos; root shell keeps Chapter 14, adds divider, then renders Chapter 15.

**执行过程：** Vite loads root app, Vue resolves imports, render effect mounts Chapter 15 after Chapter 14。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** DOM subtree 增加 Chapter 15；failure 是 root shell 替换了旧 chapters。

**为什么得到这个结果：** 新章节应作为 learning shell 的连续模块。

**对比写法：** 创建独立 app 会破坏当前路线图和 root integration。

**常见错误为什么错：** 修改 package 或重写 root layout 超出本任务边界。

**与真实项目的关系：** 新 feature 应接入现有 shell，不绕开现有质量门禁。

**与当前学习主线的关系：** Chapter 15 是 Chapter 08/10/11/14 的交叉验收层。

**最终记忆模型：** Add inclusive UI evidence without replacing prior learning evidence.

<a id="section-9-18"></a>

### 9.18 Final integration：vue-accessibility-responsive-lab 如何形成 inclusive UI verification workspace

**结论：** 最终 lab 是一个 evidence workspace，不是 WCAG conformance report。

**本节解决的问题：** `vue-accessibility-responsive-lab` 汇总 skip link、landmark、form、dialog、tabs、table、live region、contrast、motion、responsive nav 和 dashboard。

**技术意义：** 学习目标是能解释机制和验证边界，而不是宣称全部用户场景已覆盖。

**概念解释：** workspace 中每个 demo 都有 source owner；tests 覆盖能自动化的行为；manual checklist 保留未自动化部分。

**边界：semantic HTML、ARIA role/state/property、keyboard event、focus owner、Vue reactive state、Router navigation、Teleport DOM placement、CSS media query、responsive layout、test runner、manual browser verification：** lab 只整合 evidence，不替代真实验收。

**Accessibility 机制证据链：** root shell -> Chapter app -> demo components -> model/composable state -> tests/manual checklist -> dashboard gate。

**TypeScript / vue-tsc 编译期过程：** 所有 source files 和 tests 参与 typecheck。

**Vue / Router / Browser / Assistive Technology 运行时过程：** Browser 可运行 demos；AT behavior 未在本任务中实际执行。

**API / 语法规则：** app shell、component composition、verification dashboard。

**文件结构：** `AccessibilityResponsiveChapterApp.vue`、`models/`、`components/`、`composables/`、`tests/`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/AccessibilityResponsiveChapterApp.vue</span>
  </div>

```vue
<section id="chapter-15-main" tabindex="-1" aria-labelledby="chapter-15-title">
  <div class="a11y-grid">
    <RouteFocusRestoreDemo />
    <AccessibleSearchForm />
    <AccessibleDisclosure />
    <AccessibleDialog />
  </div>
</section>
```
</div>

**逐行解释：** `main` owns the stable target; grid renders task demos; each child owns one evidence boundary.

**执行过程：** 用户滚动到 Chapter 15，逐项操作 demos，并把自动化结果与手动 checklist 对照。

**DOM node、accessible name、role、state、focus target、keyboard event、CSS query、viewport、test assertion 与 failure signal 的变化：** workspace 汇总多类变化，dashboard 把 blocked issue 转成 release gate。

**为什么得到这个结果：** inclusive UI verification 需要多种证据，不可能由单个工具完成。

**对比写法：** 只有组件截图没有 keyboard、focus、role/name 和 responsive evidence。

**常见错误为什么错：** 声称 screen reader support 但未测试，是不可接受的 release 结论。

**与真实项目的关系：** 真实项目应把本章模式拆进 design system、feature QA 和 release checklist。

**与当前学习主线的关系：** 这是 Vue learning shell 的第一个专门 inclusive UI chapter。

**最终记忆模型：** Inclusive UI = semantics + interaction + layout + evidence.

## 10. API / 语法索引

| API / syntax | 层级 | 本章用途 |
| --- | --- | --- |
| `<main>`、`<nav>`、`<button>`、`<label>`、`<table>` | semantic HTML | 首选语义和原生行为 |
| `aria-labelledby`、`aria-describedby`、`aria-invalid`、`aria-expanded`、`aria-sort`、`aria-live` | ARIA relationship/state | 补足 DOM relationship 和动态状态 |
| `tabindex="-1"` | focus target | 让非交互容器可被程序聚焦 |
| `document.activeElement` | browser runtime | 测试 focus result |
| `window.matchMedia` | browser API | 读取 reduced motion preference |
| `@media (prefers-reduced-motion: reduce)` | CSS media query | 减少非必要运动 |
| `mount`、`trigger`、`expect` | Vitest / Vue Test Utils | 断言 component behavior |

## 11. 常见错误表

| # | 错误 | 为什么错 | 修正方式 |
| ---: | --- | --- | --- |
| 1 | Treating accessibility as a CSS polish task | 缺少 semantics、focus 和 verification | 从 DOM role/name/state 开始 |
| 2 | Using ARIA instead of native HTML | ARIA 不创建行为 | 优先 button、label、table、main |
| 3 | Adding role without keyboard behavior | role 只改语义 | 使用 native control 或完整键盘实现 |
| 4 | Clickable div with no button semantics | 不可聚焦也无 Space activation | 改为 `<button>` |
| 5 | Placeholder used as the only label | placeholder 会消失且不是稳定名称 | 使用 visible label |
| 6 | Error text not linked with aria-describedby | 错误无法关联字段 | 把 error id 加入 describedby |
| 7 | aria-invalid always true or never updated | 状态与实际验证不一致 | 从 validation state 派生 |
| 8 | aria-hidden used on focusable content | focusable 内容从 accessibility tree 消失 | 不隐藏可聚焦控件 |
| 9 | Focus outline removed | 键盘用户丢失位置 | 使用 `:focus-visible` 样式 |
| 10 | Route changes do not restore focus | SPA 不自动重置任务起点 | focus stable main target |
| 11 | Modal opens but focus stays behind it | 背景仍可被操作 | open 后聚焦 dialog 内控件 |
| 12 | Escape key does not close dialog | keyboard escape path 缺失 | keydown Escape close |
| 13 | Dialog closes but focus does not return | 用户丢失触发位置 | close 后 focus trigger |
| 14 | Disclosure has visual state but no aria-expanded | AT 不知道展开状态 | state 绑定在 button |
| 15 | Roving tabindex gives every item tabindex zero | 全局 Tab 顺序膨胀 | 只有 active item 为 zero |
| 16 | Sortable table changes order but not state | 排序状态不可读 | 更新 `aria-sort` 或 button label |
| 17 | Live region announces every keystroke | 信息噪声过高 | 节流 polite updates |
| 18 | Toast disappears before being perceived | 用户来不及读取 | 保持足够时间或提供历史 |
| 19 | Reduced motion hides content | 降低运动不能降低信息 | 保留 contentVisible |
| 20 | Mobile nav is visible but not keyboard-operable | 视觉可见不等于可操作 | 用 button 控制 nav |
| 21 | Header overlaps focused content | focus target 被遮挡 | 调整 scroll margin 或 layout |
| 22 | Horizontal overflow at 360px | 破坏 reflow | page no overflow, table local overflow |
| 23 | Code block/table overflows page | 窄屏不可读 | 使用 overflow container |
| 24 | Touch targets too small | motor accessibility 受损 | min target 44px 级别 |
| 25 | Color alone communicates state | 色觉差异用户无法识别 | 加文本、icon label 或 pattern |
| 26 | Contrast checked only in light mode | dark mode 可能失败 | light/dark/focus 都检查 |
| 27 | Focus ring invisible in dark mode | keyboard user 失去定位 | 单独检查 focus contrast |
| 28 | Unit tests used as full WCAG proof | 测试覆盖有限 | 标明 manual/browser evidence |
| 29 | Automated tool result claimed without running tool | 虚假证据 | 只报告实际执行结果 |
| 30 | Screen reader support claimed without testing | 未验证 AT 输出 | 未测试时标 UNKNOWN |

## 12. 最终小项目

最终小项目 `vue-accessibility-responsive-lab` 只整合本章机制，不替代前面的分节教学。

### 12.1 项目目标

目标是在现有 Vite learning shell 中运行一个 inclusive UI verification workspace：能操作 skip link、route focus restore、accessible form、error summary、disclosure、dialog、tabs、sortable table、live region、contrast panel、reduced motion demo、responsive navigation 和 issue dashboard。

### 12.2 文件职责

| 路径 | 职责 |
| --- | --- |
| `AccessibilityResponsiveChapterApp.vue` | Chapter 15 final lab entry |
| `components/` | 可操作 UI demos |
| `composables/` | focus、dialog、roving、motion、viewport runtime owners |
| `models/` | 可测试 evidence model |
| `tests/` | Vitest / Vue Test Utils evidence |
| `accessibility-responsive.css` | focus visible、responsive、motion CSS |

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

下面选择最终 lab 的关键执行链路，而不是复制全部源码。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/AccessibilityResponsiveChapterApp.vue</span>
  </div>

```vue
<SkipLinkDemo />
<LandmarkLayoutDemo />
<AccessibleSearchForm />
<AccessibleDialog />
<AccessibilityVerificationDashboard />
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/SkipLinkDemo.vue</span>
  </div>

```vue
<a class="a11y-skip-link" :href="createSkipLinkTarget(mainTarget)">
  Skip to main content
</a>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/LandmarkLayoutDemo.vue</span>
  </div>

```vue
<nav class="a11y-nav" aria-label="Landmark examples">
  <a v-for="region in chapterLandmarks" :key="region.id" :href="`#${region.id}`">
    {{ region.label }}
  </a>
</nav>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AccessibleSearchForm.vue</span>
  </div>

```vue
<label :id="queryField.labelId" :for="queryField.inputId">
  Search term
</label>
<input
  :id="queryField.inputId"
  v-model="state.query"
  type="search"
  :aria-labelledby="queryField.labelId"
  :aria-describedby="getDescribedByIds(queryField)"
  :aria-invalid="queryField.invalid ? 'true' : 'false'"
  autocomplete="off"
/>
<span :id="queryField.descriptionId">Enter at least two characters.</span>
<strong v-if="queryField.invalid" :id="queryField.errorId" class="a11y-error">
  {{ queryField.message }}
</strong>

<button class="a11y-button" type="submit">Search</button>
<p v-if="submitted" class="a11y-status" role="status">
  {{ errors.length === 0 ? "Search submitted." : "Fix the listed fields." }}
</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/ValidationErrorSummary.vue</span>
  </div>

```vue
<div v-if="errors.length > 0" role="alert" tabindex="-1">
  <p>Form cannot be submitted yet.</p>
</div>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AccessibleDisclosure.vue</span>
  </div>

```vue
<button
  type="button"
  :aria-expanded="open ? 'true' : 'false'"
  :aria-controls="contentId"
  @click="open = !open"
>
  {{ buttonLabel }}
</button>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AccessibleDialog.vue</span>
  </div>

```vue
<button
  id="open-accessibility-dialog"
  ref="triggerRef"
  class="a11y-button"
  type="button"
  @click="openDialog"
>
  Open dialog
</button>

<Teleport to="body">
  <div v-if="open" class="a11y-dialog-backdrop">
    <section
      ref="dialogRef"
      class="a11y-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-dialog-title"
      aria-describedby="accessibility-dialog-description"
      @keydown="handleDialogKeydown"
    >
      <h2 id="accessibility-dialog-title">Keyboard verification dialog</h2>
      <button id="accessibility-dialog-confirm" ref="firstFocusableRef" type="button">
        Confirm
      </button>
      <button id="accessibility-dialog-cancel" ref="lastFocusableRef" type="button">
        Cancel
      </button>
    </section>
  </div>
</Teleport>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/RovingTabindexTabs.vue</span>
  </div>

```vue
<div class="a11y-tabs" role="tablist" aria-label="Accessibility topics">
  <button
    v-for="(tab, index) in tabs"
    :id="`${tab.id}-tab`"
    :key="tab.id"
    :ref="(element) => setTabRef(element, index)"
    class="a11y-button secondary"
    type="button"
    role="tab"
    :aria-selected="getItemSelectedState(index)"
    :aria-controls="`${tab.id}-panel`"
    :tabindex="getItemTabIndex(index)"
    @keydown="handleTabKeydown"
    @click="activeIndex = index"
  >
    {{ tab.label }}
  </button>
</div>
<section
  :id="panelId"
  class="a11y-tab-panel"
  role="tabpanel"
  :aria-labelledby="`${activeItem.id}-tab`"
>
  Active topic: {{ activeItem.label }}
</section>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/SortableResultsTable.vue</span>
  </div>

```vue
<table class="a11y-table">
  <caption>
    Accessibility review results
  </caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
      <th scope="col" :aria-sort="sortDirection">
        <button class="a11y-button secondary" type="button" @click="toggleScoreSort">
          {{ createSortButtonLabel("score", sortDirection) }}
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="row in sortedRows" :key="row.id">
      <td>{{ row.name }}</td>
      <td>{{ row.status }}</td>
      <td>{{ row.score }}</td>
    </tr>
  </tbody>
</table>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/AsyncStatusLiveRegion.vue</span>
  </div>

```vue
<p class="a11y-status" role="status" aria-live="polite">
  {{ createLiveRegionText(currentMessage) || "No status yet." }}
</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/ReducedMotionTransitionDemo.vue</span>
  </div>

```vue
<Transition :name="policy.transitionName">
  <p v-if="visible" class="a11y-status">
    Motion policy {{ policy.preference }} keeps content visible.
  </p>
</Transition>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/components/ResponsiveNavigationDemo.vue</span>
  </div>

```vue
<button
  class="a11y-button"
  type="button"
  aria-controls="chapter-15-responsive-nav"
  :aria-expanded="expanded ? 'true' : 'false'"
  @click="expanded = !expanded"
>
  {{ navigationLabel }}
</button>
<nav
  v-if="expanded"
  id="chapter-15-responsive-nav"
  class="a11y-nav"
  aria-label="Responsive chapter links"
>
  <a href="#chapter-15-main">Main demo</a>
  <a href="#chapter-15-verification">Verification</a>
  <a href="#chapter-15-footer">Completion</a>
</nav>
<p class="a11y-status">
  Width {{ width }}px, viewport status {{ result.status }}.
</p>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/composables/useFocusRestore.ts</span>
  </div>

```ts
await nextTick();
targetRef.value?.focus();
lastFocusedId.value = `${targetId}:${reason}`;
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/composables/useDialogFocusTrap.ts</span>
  </div>

```ts
function openDialog(): void {
  const currentElement = document.activeElement;

  if (currentElement instanceof HTMLElement) {
    triggerRef.value = currentElement;
  }

  open.value = true;
  void nextTick(() => {
    focusFirstDialogControl();
  });
}

function handleDialogKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    closeDialog("escape");
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const currentElement = document.activeElement;

  if (event.shiftKey && currentElement === firstFocusableRef.value) {
    event.preventDefault();
    focusLastDialogControl();
    return;
  }

  if (!event.shiftKey && currentElement === lastFocusableRef.value) {
    event.preventDefault();
    focusFirstDialogControl();
    return;
  }

  event.preventDefault();
  const nextId = getNextDialogFocusId(
    focusState.value,
    event.shiftKey ? "backward" : "forward",
  );
  focusElementById(nextId);
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/composables/useRovingTabindex.ts</span>
  </div>

```ts
function moveNext(): void {
  activeIndex.value = moveRovingIndex(state.value, "next");
}

function movePrevious(): void {
  activeIndex.value = moveRovingIndex(state.value, "previous");
}

function moveFirst(): void {
  activeIndex.value = moveRovingIndex(state.value, "first");
}

function moveLast(): void {
  activeIndex.value = moveRovingIndex(state.value, "last");
}

function getItemTabIndex(itemIndex: number): 0 | -1 {
  return getRovingTabIndex(state.value, itemIndex);
}

function handleRovingKeydown(event: KeyboardEvent): boolean {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveNext();
    return true;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    movePrevious();
    return true;
  }

  if (event.key === "Home") {
    event.preventDefault();
    moveFirst();
    return true;
  }

  if (event.key === "End") {
    event.preventDefault();
    moveLast();
    return true;
  }

  return false;
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/dialogFocusTrap.test.ts</span>
  </div>

```ts
dialog?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
await nextTick();
await nextTick();

expect(document.querySelector('[role="dialog"]')).toBeNull();
expect(document.activeElement?.id).toBe("open-accessibility-dialog");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/accessibleSearchForm.test.ts</span>
  </div>

```ts
await wrapper.find("form").trigger("submit");

const searchInput = wrapper.find('input[type="search"]');
const statusSelect = wrapper.find("select");

expect(searchInput.attributes("aria-invalid")).toBe("true");
expect(statusSelect.attributes("aria-invalid")).toBe("true");
expect(wrapper.text()).toContain("Fix the listed fields.");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/rovingTabindexTabs.test.ts</span>
  </div>

```ts
await tabs[0]?.trigger("keydown", { key: "End" });
await nextTick();

const endTabs = wrapper.findAll('[role="tab"]');
expect(endTabs[2]?.attributes("tabindex")).toBe("0");
expect(document.activeElement?.id).toBe("responsive-check-tab");

await endTabs[2]?.trigger("keydown", { key: "Home" });
await nextTick();

const homeTabs = wrapper.findAll('[role="tab"]');
expect(homeTabs[0]?.attributes("tabindex")).toBe("0");
expect(homeTabs[1]?.attributes("tabindex")).toBe("-1");
expect(homeTabs[2]?.attributes("tabindex")).toBe("-1");
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-15-accessibility-responsive/tests/sortableResultsTable.test.ts</span>
  </div>

```ts
const header = wrapper.get("th[aria-sort]");
const button = wrapper.get("th button");

expect(header.attributes("aria-sort")).toBe("ascending");
expect(button.text()).toBe("Sort by score, ascending");

await button.trigger("click");

expect(wrapper.get("th[aria-sort]").attributes("aria-sort")).toBe("descending");
```
</div>

### 12.5 代码执行链路

执行链路是：root `App.vue` import Chapter 15 app；Chapter app import CSS、components 和 model data；skip link 与 landmark 建结构起点；form、disclosure、dialog、tabs、table、live region、motion 和 responsive demos 各自维护局部 state；composables 承接 focus、dialog、roving、motion 和 viewport side effect；tests 覆盖 jsdom 能验证的 behavior；dashboard 汇总 issue model；manual checklist 覆盖 browser 和 AT 相关剩余证据。

### 12.6 验证命令与失败定位

`npm run typecheck` 证明 `.vue` 和 `.ts` 类型边界通过 `vue-tsc --noEmit`，但不证明 focus order、contrast 或 screen reader output。`npm run test:unit` 证明已有 Vitest tests 覆盖 model、DOM attribute 和 focus assertions，但不等于 WCAG conformance。`npm run build` 证明 production bundle 可生成，但不等于真实浏览器宽度验收。

### 12.7 手动键盘与响应式验收清单

必须人工检查：

- 360px、390px、768px、1024px、1280px、1440px。
- 无 page-level horizontal overflow。
- skip link focus 可见并跳到 main。
- heading order 和 landmark 有意义。
- keyboard 能到达并操作 disclosure、dialog、tabs、sortable table。
- dialog trap focus、Escape closes、close returns focus。
- live region 不因连续输入产生噪声。
- reduced motion 不隐藏内容。
- code/table overflow 被局部容器包住。

## 13. 额外速查表

| 目标 | 推荐写法 | 避免 |
| --- | --- | --- |
| 操作控件 | `<button type="button">` | clickable `div` |
| 导航 | `<a href>` 或 Router link | button 假装 link |
| 表单名称 | visible `<label>` | placeholder-only |
| 错误关系 | `aria-describedby` + error id | 红字不关联 |
| 展开状态 | button + `aria-expanded` | 只改 CSS class |
| modal | dialog role + focus trap + return | overlay only |
| tabs | one active tab stop | every item in Tab order |
| async status | polite/assertive policy | announce every mutation |
| responsive | viewport matrix | only desktop preview |

## 14. 真实项目判断模型

| 决策 | 应该使用本章模式 | 不应该过度设计 | 需要证据 |
| --- | --- | --- | --- |
| semantic HTML first | 控件有原生元素 | 为炫技加 ARIA role | DOM role/name/state |
| focus restore | SPA route、modal、drawer、toast action | 静态内容无交互变化 | keyboard test/manual check |
| dialog trap | modal 阻断背景任务 | 非 modal popover | Escape/focus return evidence |
| live region | 保存、上传、加载、失败反馈 | 每次输入或 hover | announcement policy |
| reduced motion | route/card/list/toast animation | 纯静态页面 | content visible in reduce mode |
| responsive verification | 真实移动/平板使用场景 | 只面向固定桌面屏 | width matrix |
| accessibility issue gate | release 相关用户影响 | 纯内部备注 | owner/severity/evidence |

## 15. 如何转换成个人笔记

把每个组件都记成一条证据链：trigger、DOM role/name、Vue state、keyboard/focus、CSS/viewport、test/manual evidence、failure signal。不要把笔记写成 ARIA 属性清单。

## 16. 必须能回答的问题

- 为什么 accessibility 不只是 screen reader？
- 为什么 semantic HTML 是第一工具？
- 为什么 ARIA 不创建行为？
- 为什么 `role="button"` 不能替代 `<button>`？
- 为什么 focus management 是 runtime behavior？
- 为什么 route navigation 后需要 predictable focus target？
- 为什么 placeholder 不是 label？
- 为什么 form error 必须连接 field？
- 为什么 live region 要节流？
- 为什么 modal 需要 focus trap、Escape close 和 focus return？
- 为什么 reduced motion 不能隐藏内容？
- 为什么 responsive verification 要在实际宽度做？
- 为什么 unit tests 不能声明 WCAG conformance？
- 为什么不能声明 screen reader support without testing？

## 17. 最终记忆模型

```text
Inclusive Vue UI
  = semantic DOM
  + visible and programmatic names
  + keyboard operation
  + focus ownership
  + responsive task continuity
  + reduced motion without lost content
  + tests for code-owned behavior
  + manual evidence for browser and AT boundaries
```

## 18. 官方文档阅读清单

- Vue Accessibility Guide: https://vuejs.org/guide/best-practices/accessibility
- Vue Teleport: https://vuejs.org/guide/built-ins/teleport
- Vue Transition: https://vuejs.org/guide/built-ins/transition
- Vue TransitionGroup: https://vuejs.org/guide/built-ins/transition-group
- Vue Test Utils event handling: https://test-utils.vuejs.org/guide/essentials/event-handling.html
- Vue Test Utils API: https://test-utils.vuejs.org/api/
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- WAI-ARIA APG Patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- MDN ARIA Roles: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles
- MDN ARIA States and Properties: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes
- MDN prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- Vue official accessibility route focus example: https://vuejs.org/guide/best-practices/accessibility

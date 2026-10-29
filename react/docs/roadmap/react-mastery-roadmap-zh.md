# React 精通路线图：从现代前端基础到生产级前端架构

> 目标：用于 `react learning` 项目。
> 核心判断：React 精通不等于会写组件或会用 Hooks，而是能理解 React 的 UI 计算模型、渲染机制、状态模型、Effect 边界、TypeScript 组件建模、Next.js server/client boundary，并能交付、测试、优化和维护生产级前端应用。

---

## 目录

- [0. 路线图定位](#0-路线图定位)
- [1. 最终能力目标](#1-最终能力目标)
- [2. 三个判断维度](#2-三个判断维度)
- [3. React 精通分级标准](#3-react-精通分级标准)
- [4. 总体学习路径](#4-总体学习路径)
- [5. Phase 1：React 基础语法与组件模型](#5-phase-1react-基础语法与组件模型)
- [6. Phase 2：React 渲染机制与状态心智模型](#6-phase-2react-渲染机制与状态心智模型)
- [7. Phase 3：Hooks、Effects 与自定义逻辑复用](#7-phase-3hookseffects-与自定义逻辑复用)
- [8. Phase 4：TypeScript 与 React 类型建模](#8-phase-4typescript-与-react-类型建模)
- [9. Phase 5：前端应用架构、路由与模块边界](#9-phase-5前端应用架构路由与模块边界)
- [10. Phase 6：状态管理、服务端状态与数据缓存](#10-phase-6状态管理服务端状态与数据缓存)
- [11. Phase 7：表单、可访问性与 UI 系统](#11-phase-7表单可访问性与-ui-系统)
- [12. Phase 8：性能优化、Suspense 与渲染调度](#12-phase-8性能优化suspense-与渲染调度)
- [13. Phase 9：测试、质量保障与前端工程化](#13-phase-9测试质量保障与前端工程化)
- [14. Phase 10：Next.js、SSR、Hydration 与 Server Components](#14-phase-10nextjsssrhydration-与-server-components)
- [15. Phase 11：React 19、Actions 与 React Compiler](#15-phase-11react-19actions-与-react-compiler)
- [16. Phase 12：生产级前端架构与团队工程能力](#16-phase-12生产级前端架构与团队工程能力)
- [17. 最终项目路线](#17-最终项目路线)
- [18. 面试验收题库](#18-面试验收题库)
- [19. 简历表达标准](#19-简历表达标准)
- [20. 每周学习节奏](#20-每周学习节奏)
- [21. 学习指导文件生成规则](#21-学习指导文件生成规则)
- [22. 资料使用顺序](#22-资料使用顺序)
- [23. 最终验收标准](#23-最终验收标准)
- [2026-10 增量更新：版本、就业与 AI 工程](#2026-delta)

---

## 0. 路线图定位

这份路线图服务于一个目标：

```txt
把 React 从“会写页面组件”学到“能支撑真实中大型前端项目和求职面试”。
```

React 学习不应该停在：

```txt
JSX 怎么写？
useState 怎么写？
useEffect 怎么调接口？
```

而应该继续深入：

```txt
JSX 为什么不是 HTML？
React component 为什么会被反复调用？
state 为什么是 snapshot？
render phase 和 commit phase 有什么区别？
key 为什么影响 state 保留和重置？
Effect 到底是同步外部系统，还是计算派生状态？
Context 为什么会导致大面积重渲染？
server state 为什么不应该简单塞进 useState？
hydration mismatch 为什么会发生？
Server Component 和 Client Component 的边界在哪里？
React Compiler 会如何改变手动 memoization 的习惯？
```

---

## 1. 最终能力目标

学完这条路线后，你应该达到：

```txt
1. 能解释 React 的核心模型：component、React element、render phase、commit phase、state snapshot、reconciliation、component identity。
2. 能使用 React + TypeScript 构建可维护组件、页面、路由、表单、数据请求、状态管理和错误边界。
3. 能区分 local state、server state、form state、URL state、global client state，并选择合适工具。
4. 能正确使用 Hooks、Effects、custom hooks，并避免 stale closure、无限 Effect、派生状态冗余等常见问题。
5. 能使用 TanStack Query、React Hook Form、zod、Zustand / Redux Toolkit 等现代 React 生态工具。
6. 能写组件测试、集成测试、E2E test，并接入 lint、typecheck、CI。
7. 能使用 React DevTools Profiler 定位重渲染、长任务、慢组件和不必要 memoization。
8. 能理解 Next.js App Router、Server Components、Client Components、Server Actions、SSR、SSG、ISR、streaming、hydration。
9. 能理解 React 19 Actions、useActionState、useOptimistic、useFormStatus、use，以及 React Compiler 的优化方向。
10. 能在简历和面试中证明你不是只会写页面，而是具备生产级 React 前端架构能力。
```

---

## 2. 三个判断维度

### 2.1 官方文档维度

官方文档决定 React 的真实能力边界。必须覆盖：

| 官方能力区 | 需要掌握的内容 | 为什么重要 |
|---|---|---|
| Describing UI | component、JSX、props、conditional rendering、list rendering、key、pure component | 决定你能不能正确描述 UI |
| Adding Interactivity | event、state、render and commit、state snapshot、batching | 决定你能不能理解状态更新和重新渲染 |
| Managing State | state structure、lifting state up、preserving/resetting state、reducer、context | 决定复杂页面状态是否可维护 |
| Escape Hatches | refs、DOM ref、Effect、Effect lifecycle、custom hooks | 决定你能不能正确同步外部系统 |
| React DOM | createRoot、hydrateRoot、portal、server rendering APIs | 决定你是否理解客户端渲染、hydration 和服务端渲染 |
| Server Components | Server Components、Client Components、Server Functions、directives | 决定你是否理解现代 React / Next.js 的 server-client boundary |
| React Compiler | automatic memoization、purity rules、compiler directives、debugging | 决定你是否能适应 React 的未来优化方向 |
| React DevTools / Lints | performance tracks、rules-of-hooks、exhaustive-deps、purity、immutability | 决定你能不能用工具约束和诊断 React 项目 |

### 2.2 市场情况维度

市场需要的不是孤立 React，而是完整现代前端组合：

```txt
React
TypeScript
Next.js
Vite
TanStack Query
React Hook Form
zod
Zustand / Redux Toolkit
Testing Library
Vitest
Playwright
Tailwind CSS / design system
CI/CD
Performance optimization
Accessibility
```

### 2.3 招聘需求维度

招聘不会只问：

```txt
useState 怎么写？
```

更常问：

```txt
state 更新后为什么不是立刻拿到新值？
render phase 和 commit phase 有什么区别？
为什么 Hook 不能写在条件语句里？
为什么某些 useEffect 会无限循环？
key 为什么影响组件状态？
useMemo、useCallback、React.memo 的边界是什么？
Context 为什么会导致性能问题？
TanStack Query 和 useEffect fetch 有什么区别？
复杂表单如何设计？
如何定位 React 页面卡顿？
hydration mismatch 是怎么出现的？
Server Component 为什么不能使用 useState？
"use client" 的真实含义是什么？
React 19 Actions 改变了什么？
React Compiler 会替代哪些手动优化？
```

---

## 3. React 精通分级标准

### Level 1：会用 React

```txt
写函数组件
写 JSX
使用 props
使用 useState
使用 useEffect 调接口
渲染列表
写简单表单
```

简历只能写：

```txt
熟悉 React 基础
```

### Level 2：能做 React 项目

```txt
使用 React Router / Next.js routing
使用 TypeScript 写 props 和 event 类型
拆分页面和组件
处理 loading / error / empty / success 状态
使用 Context 或 Zustand 管理简单全局状态
使用 TanStack Query 管理 server state
使用 React Hook Form 管理表单
使用 zod 做表单验证
写基础组件测试
```

简历可以写：

```txt
熟练使用 React、TypeScript 构建前端应用，具备路由、表单、状态管理和 API 集成经验。
```

### Level 3：理解 React 核心机制

```txt
解释 JSX 到 React element 的关系
解释 render phase 和 commit phase
解释 state snapshot 和 batching
解释 reconciliation 和 key
解释 component identity 如何决定 state 保留或重置
解释 Hooks 为什么依赖调用顺序
解释 useEffect cleanup 和 dependency
解释 stale closure
解释 useMemo / useCallback / React.memo 的边界
解释 Context value identity 引发的重渲染
解释 Suspense fallback 和 boundary
解释 startTransition / useTransition 的用途
```

简历可以写：

```txt
深入理解 React render/commit、state snapshot、Hooks、Effect、reconciliation、Suspense 与性能优化机制。
```

### Level 4：具备生产级 React 能力

```txt
设计复杂页面状态模型
设计 feature-based 项目结构
设计组件库和复用组件
设计业务组件、UI 组件、layout 组件、data component 边界
处理复杂表单和权限 UI
处理 server state cache、pagination、optimistic update
处理 error boundary、loading boundary、empty state
处理 accessibility
处理国际化
处理 SSR / hydration
处理 bundle splitting 和 lazy loading
使用 React DevTools Profiler 分析瓶颈
写组件测试、集成测试、E2E test
```

简历可以写：

```txt
具备生产级 React + TypeScript 应用设计、状态建模、性能优化、测试和工程化经验。
```

### Level 5：高级 React / 前端架构能力

```txt
理解 React 19 Actions、useActionState、useOptimistic、useFormStatus、use
理解 React Server Components
理解 Client Component / Server Component boundary
理解 "use client" 和 "use server"
理解 hydration、streaming SSR、selective hydration
理解 Suspense-enabled data fetching 的框架边界
理解 React Compiler 自动 memoization 的意义和限制
设计 Next.js App Router 项目架构
设计 design system
设计 monorepo frontend packages
做性能预算和监控
做大型项目迁移和重构
制定团队级 React 代码规范
```

简历可以写：

```txt
具备现代 React / Next.js 前端架构能力，理解 Server Components、hydration、streaming、Actions、React Compiler 与大型前端工程治理。
```

---

## 4. 总体学习路径

推荐顺序：

```txt
Phase 1: React fundamentals
Phase 2: React rendering mental model
Phase 3: Hooks, Effects, and custom hooks
Phase 4: TypeScript with React
Phase 5: Frontend application architecture
Phase 6: State management and server state
Phase 7: Forms, accessibility, and UI systems
Phase 8: Performance, Suspense, and scheduling
Phase 9: Testing and frontend engineering quality
Phase 10: Next.js, SSR, hydration, and Server Components
Phase 11: React 19 and React Compiler
Phase 12: Production frontend architecture
```

学习方式：

```txt
每一章：
  1. 先学机制。
  2. 再写最小可运行代码。
  3. 再写错误示例。
  4. 再解释 render / state / effect / type 的变化。
  5. 再做小项目。
  6. 最后做 cheatsheet。
```

---

## 5. Phase 1：React 基础语法与组件模型

### 5.1 目标

建立 React 的基础使用模型：

```txt
React 用 component 描述 UI。
JSX 是 JavaScript 里的 UI 描述语法，不是 HTML。
props 是父组件传给子组件的数据。
state 是组件自己的记忆。
event handler 是用户交互进入 React 状态系统的入口。
list key 决定 React 如何追踪兄弟节点身份。
```

### 5.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| React 是什么 | 能区分 library、framework、runtime、compiler |
| JSX | 知道 JSX 不是 HTML，能解释 JSX expression 和 JavaScript expression 的关系 |
| Component | 知道组件是返回 UI 描述的 JavaScript 函数 |
| Props | 能设计只读 props，理解 data flow |
| Children | 能用 composition 代替不必要的配置对象 |
| Event | 知道传递 handler 和调用 handler 的区别 |
| State | 能使用 useState 保存局部 UI 状态 |
| Conditional Rendering | 能用 JavaScript 条件表达 UI 分支 |
| List and Key | 知道 key 必须稳定、唯一、来自数据 |
| Basic Form | 能写 controlled input 和简单提交逻辑 |

### 5.3 推荐练习文件

```txt
practices/01-react-fundamentals/
  01-jsx/
    jsx-expression-demo.tsx
    jsx-is-not-html.tsx
    component-capitalization.tsx

  02-components-props/
    profile-card.tsx
    children-composition.tsx
    props-are-readonly.tsx

  03-events-state/
    event-handler-reference.tsx
    use-state-counter.tsx
    stateful-input.tsx

  04-lists-keys/
    stable-key-list.tsx
    index-key-mistake.tsx
    conditional-rendering.tsx
```

### 5.4 小项目

```txt
component-basics-gallery
```

功能：

```txt
1. 展示多个 profile card。
2. 支持筛选、搜索、展开详情。
3. 使用稳定 key 渲染列表。
4. 使用 children 组合 card layout。
5. 使用 controlled input 管理搜索条件。
```

### 5.5 验收标准

```txt
JSX 和 HTML 有什么区别？
为什么 React 组件名必须大写？
<Component /> 和 Component() 有什么区别？
props 为什么不能被子组件修改？
为什么 event handler 不能写成 onClick={handleClick()}？
key 为什么不能随便用 index？
controlled input 和 uncontrolled input 的区别是什么？
```

### 2026-10 增量模块：Modern React Baseline

- **优先级 / 新增工时**：P1 / 2h，不替代原 Phase。
- **新增学习与练习**：函数组件、JSX、composition；区分组件函数执行、React element 与 DOM commit。计划新增练习：practices/01-components/2026-jsx-element-runtime.md。
- **工程验收**：最小实验解释 JSX 转换、组件调用与渲染纯度，不把 class-first 模式作为新项目默认范式。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 6. Phase 2：React 渲染机制与状态心智模型

### 6.1 目标

建立 React 的核心运行模型：

```txt
React component 是 UI 计算函数。
React render 阶段会调用组件函数来计算 UI。
React commit 阶段才把变化提交到 DOM。
state 是一次 render 的 snapshot。
state update 会进入队列并触发下一次 render。
component identity 决定 state 是保留还是重置。
```

### 6.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| React Element | 知道 JSX 最终描述的是 React element tree |
| Render Trigger | 知道初次渲染和 state update 如何触发 render |
| Render Phase | 知道 React 调用组件函数计算 UI，不应该产生副作用 |
| Commit Phase | 知道 DOM 更新、ref 赋值、Effect 执行发生在 commit 相关阶段 |
| Pure Rendering | 知道组件必须是纯计算，不能修改 render 前存在的对象 |
| State Snapshot | 知道一次 event handler 读到的是当前 render 的 state snapshot |
| Batching | 知道多个 state update 会被批处理 |
| Functional Update | 知道什么时候必须使用 updater function |
| Reconciliation | 知道 React 比较 element tree 并决定复用或重建 |
| Component Identity | 知道 type、position、key 如何决定组件身份 |

### 6.3 推荐练习文件

```txt
practices/02-rendering-mental-model/
  01-render-commit/
    render-log-demo.tsx
    render-side-effect-mistake.tsx
    commit-dom-demo.tsx

  02-state-snapshot/
    stale-state-in-event.tsx
    functional-update-counter.tsx
    batching-demo.tsx

  03-identity-reconciliation/
    key-preserves-state.tsx
    key-resets-state.tsx
    conditional-component-position.tsx
```

### 6.4 小项目

```txt
react-render-visualizer
```

功能：

```txt
1. 展示父子组件 render 次数。
2. 展示 state update 前后的 snapshot。
3. 展示 key 改变时组件状态如何重置。
4. 展示纯渲染和副作用渲染的差别。
5. 输出每次交互后的 render log。
```

### 6.5 验收标准

```txt
React 为什么会重新调用组件函数？
render phase 和 commit phase 有什么区别？
为什么 render 里不能修改外部变量？
state 为什么是 snapshot？
setState 后为什么不能立刻读到新值？
functional update 解决什么问题？
React 如何决定复用一个组件还是重新创建？
key 如何影响 state 保留和重置？
```

### 2026-10 增量模块：Identity & Scheduling Diagnostics

- **优先级 / 新增工时**：P0 / 3h，不替代原 Phase。
- **新增学习与练习**：state identity、key、render/commit、Strict Mode 开发期重复调用；记录 React DevTools 和日志。
- **工程验收**：证明三组 state preserve/reset 案例，并解释 render 不能包含副作用。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 7. Phase 3：Hooks、Effects 与自定义逻辑复用

### 7.1 目标

真正理解 Hooks 不是生命周期语法替代品，而是 React runtime 根据调用顺序保存组件状态和副作用描述的机制。

### 7.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| Rules of Hooks | 知道 Hooks 为什么必须在顶层调用 |
| useState | 局部状态和 updater function |
| useReducer | 复杂状态转移和 action modeling |
| useRef | 保存可变值、DOM ref、不触发 render |
| useEffect | 同步 external system，不是派生状态计算工具 |
| Effect Cleanup | 知道依赖变化前、卸载时 cleanup 的执行时机 |
| Dependency Array | 能解释 reactive value、stale closure、exhaustive-deps |
| useLayoutEffect | 知道和 DOM layout 相关的同步 Effect 边界 |
| useInsertionEffect | 知道 CSS-in-JS 插入样式的特殊场景 |
| useMemo | 缓存昂贵计算结果，而不是默认包所有值 |
| useCallback | 稳定函数引用，主要服务于 memoized child 或 dependency |
| React.memo | 跳过相同 props 的子组件 render |
| Custom Hooks | 提取可复用状态逻辑，而不是提取普通工具函数 |

### 7.3 推荐练习文件

```txt
practices/03-hooks-effects/
  01-hooks-rules/
    conditional-hook-mistake.tsx
    hook-call-order-demo.tsx

  02-effect-lifecycle/
    effect-cleanup-demo.tsx
    effect-dependency-demo.tsx
    stale-closure-interval.tsx
    infinite-effect-loop.tsx

  03-you-might-not-need-effect/
    derived-state-mistake.tsx
    event-logic-not-effect.tsx
    render-calculation.tsx

  04-custom-hooks/
    use-local-storage.ts
    use-window-event.ts
    use-debounce.ts
```

### 7.4 小项目

```txt
hooks-behavior-lab
```

功能：

```txt
1. 展示 conditional hook 错误。
2. 展示 stale closure。
3. 展示 Effect cleanup。
4. 展示 derived state 不需要 Effect。
5. 编写三个 custom hooks，并配套测试。
```

### 7.5 验收标准

```txt
Hooks 为什么不能写进 if / for / nested function？
useEffect 是什么时候运行的？
cleanup 是什么时候运行的？
dependency array 中应该放什么？
stale closure 是什么？
为什么不应该用 Effect 计算 fullName 这种派生状态？
useRef 和 useState 的区别是什么？
useMemo 和 useCallback 是性能优化还是引用稳定工具？
React.memo 什么时候无效？
custom hook 和普通函数有什么区别？
```

### 2026-10 增量模块：Effect Events & Request Cancellation

- **优先级 / 新增工时**：P0 / 4h，不替代原 Phase。
- **新增学习与练习**：useEffectEvent、AbortController、Effect cleanup、stale response race；计划新增 practices/03-hooks/2026-effect-race.test.tsx。
- **工程验收**：连续输入搜索时旧响应不覆盖新结果；卸载取消请求；自动化测试防回归。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 8. Phase 4：TypeScript 与 React 类型建模

### 8.1 目标

让 React 项目从“能跑”升级为“类型边界清晰、组件 API 可维护、重构安全”。

### 8.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| Props Typing | 能写明确的 props 类型，不滥用 React.FC |
| Children Typing | 能区分 ReactNode、ReactElement、JSX.Element |
| Event Typing | 能给 click、change、submit、keyboard event 正确建模 |
| State Typing | 能处理 nullable state、union state、lazy initializer |
| Discriminated Union Props | 能用 union 表达互斥组件状态 |
| Generic Components | 能写可复用 list、select、table 组件 |
| Controlled Component Types | 能设计 value/onChange 类型 |
| Component Polymorphism | 理解 `as` prop 和类型复杂度 |
| Custom Hook Types | 能让 hook 返回值具备准确推断 |
| Context Typing | 能避免 nullable context 到处断言 |
| API Types | 区分 DTO、view model、domain model |
| Runtime Validation | 理解 TypeScript 类型不能验证 API 返回数据 |

### 8.3 推荐练习文件

```txt
practices/04-react-typescript/
  01-props-events/
    button-props.tsx
    form-event-types.tsx
    children-types.tsx

  02-union-components/
    async-state-union.tsx
    modal-props-union.tsx
    status-badge-union.tsx

  03-generic-components/
    generic-list.tsx
    generic-select.tsx
    typed-table.tsx

  04-hooks-context/
    typed-custom-hook.ts
    strict-context.tsx
    reducer-action-types.ts
```

### 8.4 小项目

```txt
typed-component-library-starter
```

功能：

```txt
1. Button、Input、Modal、Tabs、Select、DataTable。
2. 所有组件都有明确 props 类型。
3. 使用 discriminated union 表达状态。
4. DataTable 使用 generic。
5. 编写 Storybook 或文档示例。
6. 编写组件测试。
```

### 8.5 验收标准

```txt
React.FC 的优缺点是什么？
ReactNode、ReactElement、JSX.Element 有什么区别？
如何给 onChange 事件写类型？
为什么 API response 不能只靠 TypeScript 类型信任？
如何用 discriminated union 避免 boolean props 爆炸？
generic component 如何保持 item 类型推断？
Context 为什么应该封装成 custom hook？
```

### 2026-10 增量模块：Type Contracts vs Runtime Validation

- **优先级 / 新增工时**：P0 / 4h，不替代原 Phase。
- **新增学习与练习**：TypeScript 7 工具链兼容性实验；discriminated props、generics、ref；外部 JSON 从 unknown 经 schema 验证进入业务层。
- **工程验收**：组件 API 不滥用 any；至少两个类型检查通过但运行时输入无效的反例。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 9. Phase 5：前端应用架构、路由与模块边界

### 9.1 目标

把 React 从组件练习升级为真实应用结构。

### 9.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| Project Structure | feature-based、route-based、layer-based 的取舍 |
| Routing | nested routes、layout routes、protected routes、route params、search params |
| Page / Layout / Feature | 区分页面组合、布局结构、业务功能模块 |
| Component Boundary | 区分 UI component、business component、data component |
| Error Boundary | 捕获渲染错误，设计 fallback |
| Loading Boundary | 局部 loading，不让全页阻塞 |
| Auth UI | protected route、role-based UI、permission gate |
| URL State | search params、filter、pagination、sort |
| API Client | fetch wrapper、error normalization、request cancellation |
| Environment Config | 前端环境变量和 build-time config 边界 |
| Code Splitting | route-level splitting、component-level lazy loading |

### 9.3 推荐项目结构

```txt
frontend/
  src/
    app/
      router.tsx
      providers.tsx

    shared/
      api/
        http-client.ts
        api-error.ts

      ui/
        button.tsx
        modal.tsx
        data-table.tsx

      hooks/
        use-debounce.ts
        use-media-query.ts

    features/
      auth/
        auth.routes.tsx
        auth.api.ts
        login-form.tsx
        permission-gate.tsx

      projects/
        projects.routes.tsx
        projects.api.ts
        project-list.tsx
        project-detail.tsx

    pages/
      dashboard-page.tsx
      not-found-page.tsx
```

### 9.4 小项目

```txt
react-dashboard-shell
```

功能：

```txt
1. Dashboard layout。
2. Nested routes。
3. Protected routes。
4. URL search params 保存筛选条件。
5. Error boundary。
6. Loading boundary。
7. Feature-based folder structure。
```

### 9.5 验收标准

```txt
feature-based structure 解决什么问题？
UI component 和 business component 的边界是什么？
什么时候状态应该放进 URL？
Error Boundary 能捕获哪些错误，不能捕获哪些错误？
protected route 应该只做 UI 隐藏，还是也要依赖后端权限？
API client 为什么要统一错误格式？
route-level code splitting 有什么价值？
```

### 2026-10 增量模块：Feature Ownership & API Contracts

- **优先级 / 新增工时**：P0 / 3h，不替代原 Phase。
- **新增学习与练习**：为 feature 定义 public API、内部目录、依赖方向；写 React SPA、Next BFF、Node API 职责 ADR。
- **工程验收**：无跨 feature 深层 import；解释复用、领域耦合与服务端数据所有权。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 10. Phase 6：状态管理、服务端状态与数据缓存

### 10.1 目标

掌握现代 React 项目真正困难的部分：状态分类和数据一致性。

### 10.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| State Classification | local state、server state、form state、URL state、global client state |
| Local State | 组件内部 UI 状态 |
| Derived State | 能从 props/state 计算就不要重复存 |
| Reducer State | 复杂本地状态转移 |
| Context | 适合低频全局依赖，不适合高频大对象状态 |
| Zustand | 轻量 client state store |
| Redux Toolkit | 大型团队、复杂全局状态、严格 action flow |
| TanStack Query | server state、cache、stale time、refetch、mutation |
| Cache Invalidation | query key、invalidate、refetch、optimistic update |
| Pagination | offset pagination、cursor pagination、infinite query |
| Optimistic UI | 乐观更新、回滚、并发 mutation |
| Request Race | 过期请求、取消请求、缓存覆盖 |

### 10.3 推荐练习文件

```txt
practices/06-state-data/
  01-state-classification/
    local-vs-server-state.tsx
    derived-state-mistake.tsx
    url-state-filter.tsx

  02-client-state/
    context-rerender-demo.tsx
    zustand-cart-store.ts
    reducer-workflow.tsx

  03-tanstack-query/
    basic-query.tsx
    query-key-design.tsx
    mutation-invalidation.tsx
    optimistic-update.tsx
    infinite-query.tsx
```

### 10.4 小项目

```txt
query-driven-project-board
```

功能：

```txt
1. 项目列表、任务列表、任务详情。
2. TanStack Query 管理 server state。
3. URL search params 管理筛选、排序、分页。
4. Zustand 管理局部跨页面 UI 状态。
5. Optimistic update 修改任务状态。
6. 处理 loading、error、empty、success。
```

### 10.5 验收标准

```txt
local state 和 server state 的区别是什么？
为什么 useEffect fetch 不是现代复杂项目的最佳默认方案？
query key 应该如何设计？
staleTime 和 gcTime 的区别是什么？
mutation 成功后为什么需要 invalidation？
optimistic update 如何回滚？
Context 为什么可能导致大面积重渲染？
Redux Toolkit 和 Zustand 的取舍是什么？
哪些状态应该放进 URL？
```

### 2026-10 增量模块：State Taxonomy & Optimistic Conflict

- **优先级 / 新增工时**：P0 / 4h，不替代原 Phase。
- **新增学习与练习**：local/UI、URL、form、server cache、global client、AI stream state；TanStack Query 乐观更新、回滚、冲突与取消。
- **工程验收**：服务端 409/500 时 UI 回滚且与 server state 一致。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 11. Phase 7：表单、可访问性与 UI 系统

### 11.1 目标

掌握真实业务前端最容易变复杂的三块：表单、交互可访问性、可复用 UI 组件。

### 11.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| Controlled Input | value 由 React state 控制 |
| Uncontrolled Input | DOM 保存当前值，React 通过 ref 或 form API 读取 |
| React Hook Form | 注册字段、表单状态、错误状态、提交状态 |
| zod Validation | schema、parse、safeParse、错误映射 |
| Field Array | 动态字段数组 |
| Async Validation | 唯一性检查、debounce、提交前验证 |
| Form State Boundary | 区分 draft、submitted、server error、field error |
| Accessibility | label、aria、keyboard navigation、focus management |
| Component Library | Button、Input、Modal、Select、Tabs、Table |
| Design Tokens | color、spacing、typography、radius、shadow |
| Headless UI | behavior 和 style 分离 |
| Storybook | 组件文档、交互状态、视觉回归基础 |

### 11.3 推荐练习文件

```txt
practices/07-forms-ui-system/
  01-forms/
    controlled-input.tsx
    uncontrolled-input.tsx
    react-hook-form-basic.tsx
    zod-resolver-form.tsx
    field-array-form.tsx

  02-accessibility/
    accessible-modal.tsx
    keyboard-tabs.tsx
    focus-management.tsx
    aria-error-message.tsx

  03-ui-system/
    button-variants.tsx
    input-field.tsx
    modal-composition.tsx
    data-table-empty-loading-error.tsx
```

### 11.4 小项目

```txt
form-heavy-admin-module
```

功能：

```txt
1. 多步骤创建项目表单。
2. React Hook Form 管理字段。
3. zod 做 runtime validation。
4. 动态成员列表。
5. async validation 检查项目 slug。
6. accessible modal。
7. 表单错误和服务端错误分层展示。
```

### 11.5 验收标准

```txt
controlled input 和 uncontrolled input 的机制区别是什么？
React Hook Form 为什么比每个字段 useState 更适合复杂表单？
zod 解决的是 TypeScript 的哪个边界问题？
field error 和 server error 应该如何区分？
modal 为什么要处理 focus trap？
aria-describedby 有什么作用？
组件库为什么要区分 primitive component 和 business component？
```

### 2026-10 增量模块：Accessible & Trusted UI

- **优先级 / 新增工时**：P1 / 3h，不替代原 Phase。
- **新增学习与练习**：keyboard/focus、semantic form、dialog、错误提示、Trusted Types 与危险 HTML 风险。
- **工程验收**：核心表单可纯键盘完成；焦点恢复；不可信 HTML 有安全测试。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 12. Phase 8：性能优化、Suspense 与渲染调度

### 12.1 目标

进入生产级 React 的关键区间：能判断性能问题来自哪里，并用正确工具解决，而不是盲目 memo。

### 12.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| React DevTools Profiler | 能看 render 次数、commit 时间、slow component |
| Re-render Cause | props identity、state location、context update、parent render |
| Memoization | React.memo、useMemo、useCallback 的真实边界 |
| State Colocation | 把状态放到真正需要它的最近组件 |
| Context Splitting | 拆分 context，避免大面积更新 |
| List Virtualization | 大列表虚拟滚动 |
| Code Splitting | lazy、dynamic import、route-level splitting |
| Suspense | fallback、boundary、lazy loading、data loading boundary |
| useTransition | 区分 urgent update 和 transition update |
| useDeferredValue | 延迟非关键派生值 |
| Bundle Analysis | 分析包体积和重复依赖 |
| Web Vitals | LCP、INP、CLS 与 React 应用体验 |

### 12.3 推荐练习文件

```txt
practices/08-performance-suspense/
  01-rerender/
    parent-rerender-demo.tsx
    unstable-props-demo.tsx
    context-rerender-demo.tsx

  02-memoization/
    react-memo-effective.tsx
    use-memo-expensive-calculation.tsx
    use-callback-child-props.tsx
    over-memoization-mistake.tsx

  03-suspense-transition/
    lazy-route-suspense.tsx
    transition-search.tsx
    deferred-filter-list.tsx

  04-profiling/
    profiler-target.tsx
    virtualized-list.tsx
    bundle-splitting-demo.tsx
```

### 12.4 小项目

```txt
react-performance-lab
```

功能：

```txt
1. 构造一个慢列表页面。
2. 使用 Profiler 定位慢组件。
3. 用 state colocation 减少重渲染。
4. 用 memoization 处理稳定引用。
5. 用 virtualization 处理大列表。
6. 用 lazy + Suspense 分割模块。
7. 输出性能优化报告。
```

### 12.5 验收标准

```txt
为什么父组件 render 会影响子组件？
React.memo 为什么有时不起作用？
useMemo 和 useCallback 的成本是什么？
什么是 state colocation？
Context value identity 为什么重要？
Suspense boundary 应该放在哪里？
useTransition 解决什么用户体验问题？
useDeferredValue 和 debounce 的区别是什么？
如何用 Profiler 判断优化是否有效？
```

### 2026-10 增量模块：React Compiler 1.0 Measurement

- **优先级 / 新增工时**：P0 / 5h，不替代原 Phase。
- **新增学习与练习**：React Compiler 1.0 构建期 memoization、Rules of React、Profiler 对照；了解 View Transitions / Activity。
- **工程验收**：保存 compiler on/off 性能证据；说明 Compiler 不替代 state identity 与 render purity。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 13. Phase 9：测试、质量保障与前端工程化

### 13.1 目标

让 React 项目从“能运行”变成“可验证、可重构、可持续维护”。

### 13.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| Unit Test | utility、reducer、pure function |
| Component Test | React Testing Library，按用户行为测试组件 |
| Integration Test | 多组件、router、query、form、API mock |
| E2E Test | Playwright，覆盖真实浏览器流程 |
| API Mock | MSW 模拟网络边界 |
| Test Query | getByRole、getByLabelText、findBy、waitFor |
| Accessibility Test | role、name、keyboard interaction |
| Visual Test | Storybook interaction / visual regression 基础 |
| Lint | eslint、eslint-plugin-react-hooks、exhaustive-deps |
| Typecheck | tsc --noEmit 作为质量门禁 |
| CI | lint、typecheck、test、build、e2e |
| Error Monitoring | 前端错误收集、source map、release tracking |

### 13.3 推荐练习文件

```txt
practices/09-testing-quality/
  01-unit/
    reducer.test.ts
    format-date.test.ts

  02-components/
    login-form.test.tsx
    modal-accessibility.test.tsx
    data-table.test.tsx

  03-integration/
    project-list-with-query.test.tsx
    protected-route.test.tsx
    form-submit-msw.test.tsx

  04-e2e/
    auth-flow.spec.ts
    project-crud.spec.ts
```

### 13.4 小项目

```txt
tested-react-dashboard
```

功能：

```txt
1. Vitest 单元测试。
2. React Testing Library 组件测试。
3. MSW mock API。
4. Playwright E2E test。
5. ESLint hooks 规则。
6. CI 运行 lint、typecheck、test、build。
```

### 13.5 验收标准

```txt
为什么 React Testing Library 不鼓励测试实现细节？
getByRole 比 getByTestId 更推荐的原因是什么？
MSW 和手动 mock fetch 的区别是什么？
组件测试和 E2E test 的边界是什么？
waitFor 什么时候需要使用？
如何测试 loading、error、success 状态？
exhaustive-deps 为什么不是烦人的规则，而是闭包边界检查？
CI 里为什么要分 lint、typecheck、test、build？
```

### 2026-10 增量模块：Async UI Regression & Security Patches

- **优先级 / 新增工时**：P0 / 4h，不替代原 Phase。
- **新增学习与练习**：Vitest/RTL/MSW/Playwright 增加 abort/race/error/a11y；依赖安全公告、补丁和 smoke tests。
- **工程验收**：CI 覆盖 stale response、provider timeout、keyboard flow、依赖升级回归。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 14. Phase 10：Next.js、SSR、Hydration 与 Server Components

### 14.1 目标

掌握现代 React 生产框架能力，理解 browser 和 server 的边界。

### 14.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| Next.js App Router | route segment、layout、page、loading、error、not-found |
| Server Rendering | SSR、SSG、ISR、dynamic rendering |
| Hydration | 服务端 HTML 和客户端 React tree 对齐 |
| Hydration Mismatch | 随机值、时间、浏览器专属 API、条件渲染导致不一致 |
| Server Components | 默认在 server 运行，不进入 client bundle |
| Client Components | 使用 state、effect、event handler 的交互组件 |
| "use client" | 定义 client boundary，不是整个文件夹都变客户端 |
| Server Actions / Functions | 表单提交、mutation、server-side logic |
| Data Fetching | server fetch、cache、revalidate、client query 的边界 |
| Streaming | 分段发送 UI，配合 Suspense boundary |
| Metadata | SEO、Open Graph、动态 metadata |
| Route Handlers | BFF/API 边界 |
| Middleware | auth redirect、request rewrite 的限制 |
| Deployment Boundary | Node runtime、Edge runtime、serverless 的差异 |

### 14.3 推荐练习文件

```txt
practices/10-next-modern-react/
  01-app-router/
    nested-layout-demo/
    loading-error-boundary-demo/
    not-found-demo/

  02-server-client-boundary/
    server-component-data.tsx
    client-component-interaction.tsx
    use-client-boundary-demo.tsx

  03-hydration/
    hydration-mismatch-date.tsx
    browser-api-guard.tsx
    stable-server-client-output.tsx

  04-actions-streaming/
    server-action-form.tsx
    optimistic-action-demo.tsx
    suspense-streaming-page.tsx
```

### 14.4 小项目

```txt
nextjs-fullstack-dashboard
```

功能：

```txt
1. App Router。
2. Server Components 获取初始数据。
3. Client Components 管理交互。
4. Server Actions 处理 mutation。
5. Suspense streaming。
6. Auth protected routes。
7. Metadata。
8. Route Handlers 作为 BFF。
9. Hydration mismatch diagnostics。
```

### 14.5 验收标准

```txt
SSR、SSG、ISR、CSR 的区别是什么？
hydration 是什么？
hydration mismatch 为什么会发生？
Server Component 为什么不能使用 useState？
Client Component 会不会让所有子组件都变成客户端组件？
"use client" 的真实边界是什么？
Server Actions 和 API route 的取舍是什么？
Next.js 的 loading.tsx 和 Suspense boundary 有什么关系？
什么时候使用 TanStack Query，什么时候使用 server fetch？
Edge runtime 和 Node runtime 有什么差异？
```

### 2026-10 增量模块：RSC Serialization & Security Lifecycle

- **优先级 / 新增工时**：P0 / 4h，不替代原 Phase。
- **新增学习与练习**：区分 React 与 Next RSC implementation；RSC payload、client boundary、secret leak、2025 RSC 安全公告。
- **工程验收**：计划新增 rsc-security-checklist.md；证明 client bundle 无 secret；核查 patched dependencies。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 15. Phase 11：React 19、Actions 与 React Compiler

### 15.1 目标

掌握 React 新方向：异步 mutation、表单状态、乐观 UI、资源读取、自动 memoization。

### 15.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| React 19 Actions | async function 处理 mutation、pending、error、optimistic update |
| useActionState | 根据 action 结果更新表单或 mutation 状态 |
| useFormStatus | 子组件读取最近 form 的 pending 状态 |
| useOptimistic | 在真实提交完成前展示乐观 UI |
| use | 读取 Promise 或 context 的新方式，理解使用边界 |
| Ref as Prop | React 19 中 ref 作为普通 prop 的变化 |
| Document Metadata | title、meta、link 支持 |
| Static APIs | prerender、resume 等面向框架的 API |
| React Compiler | 自动 memoization，减少手写 useMemo/useCallback/React.memo |
| Compiler Rules | purity、immutability、unsupported syntax、manual memo preservation |
| Compiler Directives | "use memo"、"use no memo" |
| Migration Strategy | 旧项目如何逐步启用 compiler |

### 15.3 推荐练习文件

```txt
practices/11-react-19-compiler/
  01-actions/
    action-state-form.tsx
    form-status-submit-button.tsx
    optimistic-comment-list.tsx

  02-use-api/
    use-promise-demo.tsx
    use-context-demo.tsx

  03-compiler/
    compiler-friendly-component.tsx
    impurity-breaks-optimization.tsx
    manual-memoization-comparison.tsx
```

### 15.4 小项目

```txt
react-19-actions-lab
```

功能：

```txt
1. 表单使用 Action 提交。
2. 使用 useActionState 管理提交结果。
3. 使用 useFormStatus 管理 submit button pending。
4. 使用 useOptimistic 展示乐观评论。
5. 对比手动 memoization 和 compiler-friendly component。
6. 记录迁移注意事项。
```

### 15.5 验收标准

```txt
React 19 Actions 解决了传统 submit handler 的什么重复逻辑？
useActionState 和 useState 的关系是什么？
useFormStatus 为什么适合封装 SubmitButton？
useOptimistic 什么时候需要回滚？
use API 能读取什么？边界是什么？
React Compiler 为什么要求组件保持 pure？
React Compiler 会不会让你不需要理解 render？
什么时候应该保留手动 memoization？
```

### 2026-10 增量模块：React 19.3 & Compiler Delta

- **优先级 / 新增工时**：P0 / 5h，不替代原 Phase。
- **新增学习与练习**：依据 React 19.3 官方说明分别实验 View Transitions、Fragment refs、browser()、Trusted Types、Actions/Compiler。
- **工程验收**：每个实验给出最小用例、版本和不适用场景；browser() 不是 SSR/hydration 万能修复。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 16. Phase 12：生产级前端架构与团队工程能力

### 16.1 目标

从“个人能写项目”升级到“能支撑团队协作和长期维护”。

### 16.2 必学主题

| 主题 | 必须理解到什么程度 |
|---|---|
| Design System | tokens、primitive components、compound components、documentation |
| Frontend Monorepo | app packages、shared UI、shared config、versioning |
| Module Boundary | feature module、shared module、public API |
| API Contract | OpenAPI、generated client、schema sharing、breaking changes |
| Feature Flags | 灰度、实验、权限开关 |
| Internationalization | route、message catalog、locale formatting |
| Performance Budget | bundle budget、LCP、INP、CLS、route-level cost |
| Observability | error tracking、web vitals、user session replay、logging |
| Security | XSS、CSRF、CSP、token storage、third-party script risk |
| Migration | class to hooks、CRA to Vite、pages router to app router、React version upgrade |
| Code Review Standard | component API、state ownership、effect necessity、test coverage |
| Documentation | ADR、component docs、architecture notes、runbook |

### 16.3 推荐练习文件

```txt
practices/12-production-architecture/
  01-design-system/
    compound-tabs.tsx
    polymorphic-button.tsx
    token-driven-theme.ts

  02-monorepo-boundary/
    package-public-api.md
    shared-ui-boundary.md
    feature-module-boundary.md

  03-observability-security/
    web-vitals-reporter.ts
    error-boundary-reporting.tsx
    csp-risk-checklist.md

  04-migration/
    cra-to-vite-plan.md
    class-to-hooks-refactor.md
    next-pages-to-app-router-plan.md
```

### 16.4 小项目

```txt
production-react-architecture-kit
```

功能：

```txt
1. 设计 shared UI package。
2. 设计 feature module public API。
3. 设计 OpenAPI generated client 流程。
4. 设计 web vitals 采集。
5. 设计 error monitoring。
6. 设计 performance budget。
7. 设计 React migration checklist。
8. 产出 architecture decision records。
```

### 16.5 验收标准

```txt
design system 和普通组件库有什么区别？
compound component 解决什么问题？
monorepo 中 shared UI 如何避免业务污染？
API contract 如何减少前后端联调成本？
feature flag 如何影响状态和测试？
web vitals 如何和 React 性能优化关联？
前端 XSS 的主要入口有哪些？
如何设计一次 React 大版本升级计划？
代码评审时如何判断一个 useEffect 是否必要？
```

### 2026-10 增量模块：Operational Ownership & Release ADR

- **优先级 / 新增工时**：P1 / 4h，不替代原 Phase。
- **新增学习与练习**：release checklist、dependency policy、Web Vitals、错误追踪、回滚方案与 ADR。
- **工程验收**：完成升级、测试、发布、回滚演练，保留基线和恢复证据。
- **面试验收**：解释机制与错误反例，并展示日志、测试或 Profiler 证据。

---

## 17. 最终项目路线

### Project 1：React Rendering Lab

目标：

```txt
证明你理解 React render、state、key、Effect 的机制。
```

包含：

```txt
render count demo
state snapshot demo
batching demo
key reset demo
effect cleanup demo
stale closure demo
```

简历价值：

```txt
适合作为学习仓库，不适合作为主简历项目。
```

---

### Project 2：Typed Component Library Starter

目标：

```txt
证明你能设计可复用 React + TypeScript 组件。
```

包含：

```txt
Button
Input
Modal
Tabs
Select
DataTable
discriminated union props
generic component
component tests
Storybook docs
```

简历价值：

```txt
适合作为组件设计能力展示。
```

---

### Project 3：Query-driven Dashboard

目标：

```txt
证明你能处理真实前端数据状态。
```

包含：

```txt
TanStack Query
URL state
pagination
filtering
optimistic update
error boundary
loading boundary
React Testing Library
MSW
```

简历价值：

```txt
适合作为中级 React 项目。
```

---

### Project 4：Form-heavy Admin System

目标：

```txt
证明你能处理复杂表单和权限 UI。
```

包含：

```txt
React Hook Form
zod
multi-step form
field array
async validation
RBAC UI
accessible modal
server error mapping
```

简历价值：

```txt
适合作为业务复杂度展示。
```

---

### Project 5：Next.js Full-stack Product

目标：

```txt
证明你具备现代 React / Next.js 全栈交付能力。
```

技术栈：

```txt
Frontend:
  React
  Next.js App Router
  TypeScript
  TanStack Query
  React Hook Form
  zod
  Zustand
  Tailwind CSS or design system

Backend:
  Node.js
  Route Handlers or separate API
  PostgreSQL
  Redis
  Auth
  RBAC
```

功能：

```txt
workspace
project
task
comment
attachment
role permission
activity log
notification
search
dashboard analytics
```

简历价值：

```txt
主简历项目。
```

---

### Project 6：React Performance and Diagnostics Lab

目标：

```txt
证明你具备生产问题诊断能力。
```

包含：

```txt
slow render case
large list performance problem
context rerender problem
hydration mismatch case
bundle size problem
Profiler report
optimization report
```

简历价值：

```txt
高级差异化项目。
```

#### 2026-10 Planned Extension：Explain This Dashboard（不新建项目）

在原有 Query-driven Dashboard 上追加“Explain this spike”：React 发送 metricId、时间区间、过滤条件和可见数据上下文到既有 Node/Next API；模型密钥和工具执行只在 server。本扩展仍属计划，不能写成已完成。

- **UI contract**：区分 query/server、URL、AI stream、conversation、tool approval state；覆盖 loading、partial、cancelled、error、retry、complete。
- **取消与并发**：AbortController 从 UI 传播至 server/provider；旧 stream 不覆盖当前结果。
- **可信输出**：后端返回经过 schema 验证的结构化结果和数据来源；不把模型文本直接当可信 HTML。
- **质量门禁**：Playwright 覆盖慢流、断流、取消、重试、权限拒绝；Profiler 证明 token streaming 不引起 dashboard 全树无意义重渲染。
- **Portfolio 证据**：录屏、状态机图、API contract、race regression test、性能前后对比。

---

## 18. 面试验收题库

### React Fundamentals

```txt
React 是 library 还是 framework？
JSX 和 HTML 有什么区别？
React element 是什么？
props 为什么应该只读？
children 和 props.children 的作用是什么？
为什么列表需要 key？
```

### Rendering Model

```txt
React 为什么会重新调用组件函数？
render phase 和 commit phase 有什么区别？
为什么组件必须保持 pure？
state snapshot 是什么？
setState 后为什么不能立即读到新值？
batching 是什么？
functional update 解决什么问题？
key 如何影响 state 保留和重置？
```

### Hooks and Effects

```txt
Hooks 为什么不能写进条件语句？
useState 和 useReducer 怎么选？
useRef 和 useState 的区别是什么？
useEffect 的真实用途是什么？
cleanup 什么时候执行？
dependency array 应该怎么写？
stale closure 是什么？
为什么很多派生状态不应该用 Effect？
custom hook 和普通函数的区别是什么？
```

### TypeScript with React

```txt
ReactNode、ReactElement、JSX.Element 有什么区别？
如何给 onChange 写类型？
React.FC 的优缺点是什么？
如何设计 discriminated union props？
generic component 如何保持类型推断？
为什么 TypeScript 类型不能验证 API 返回数据？
```

### State and Data

```txt
local state、server state、form state、URL state、global client state 有什么区别？
TanStack Query 和 useEffect fetch 有什么区别？
query key 如何设计？
cache invalidation 是什么？
optimistic update 如何回滚？
Context 为什么可能导致大面积重渲染？
Zustand 和 Redux Toolkit 如何取舍？
```

### Forms and UI

```txt
controlled input 和 uncontrolled input 的机制区别是什么？
React Hook Form 为什么适合复杂表单？
zod 解决了什么边界问题？
field error 和 server error 如何区分？
accessible modal 要处理哪些交互？
design system 和普通组件库有什么区别？
```

### Performance

```txt
如何定位 React 页面卡顿？
React.memo 什么时候有效？
useMemo 和 useCallback 的成本是什么？
state colocation 为什么能减少重渲染？
Suspense boundary 应该如何设计？
useTransition 和 useDeferredValue 的区别是什么？
如何判断一次优化是否真实有效？
```

### Next.js / Modern React

```txt
SSR、SSG、ISR、CSR 的区别是什么？
hydration 是什么？
hydration mismatch 为什么发生？
Server Component 为什么不能用 useState？
"use client" 的真实含义是什么？
Server Actions 和 API route 如何取舍？
Streaming SSR 和 Suspense 有什么关系？
```

### React 19 / Compiler

```txt
Actions 解决了 mutation 的什么重复逻辑？
useActionState、useFormStatus、useOptimistic 分别解决什么问题？
use API 的使用边界是什么？
React Compiler 为什么依赖 purity？
React Compiler 会不会让手动 memoization 全部消失？
```

---

## 19. 简历表达标准

### 不建议写

```txt
精通 React
```

如果项目和面试不能支撑，这句话风险很高。

### 基础阶段写法

```txt
熟悉 React 基础，能够开发组件化前端页面。
```

### 项目阶段写法

```txt
熟练使用 React、TypeScript、React Router、TanStack Query、React Hook Form 构建前端应用，具备组件拆分、状态管理、表单验证、接口集成和测试经验。
```

### 深入阶段写法

```txt
深入理解 React render/commit、state snapshot、Hooks、Effect、reconciliation、Suspense 与性能优化机制，能够定位和优化复杂组件重渲染问题。
```

### 生产级阶段写法

```txt
具备生产级 React + TypeScript 应用架构设计、复杂状态建模、组件库建设、测试体系、性能诊断和工程化实践经验。
```

### Next.js 阶段写法

```txt
具备现代 React / Next.js App Router 开发经验，理解 Server Components、Client Components、hydration、streaming、Server Actions 与前后端边界设计。
```

### 项目描述模板

```txt
基于 React / Next.js + TypeScript 构建任务协作平台，前端采用 feature-based 架构设计，包含权限 UI、复杂表单、URL 状态、TanStack Query 服务端状态缓存、乐观更新、错误边界、加载边界、组件测试、E2E 测试和性能分析。项目中使用 Server Components 获取初始数据，使用 Client Components 管理交互，并通过 React DevTools Profiler 定位和优化重渲染瓶颈。
```

---

## 20. 每周学习节奏

### 每周固定节奏

```txt
Day 1:
  阅读官方文档和本地参考资料，整理核心概念。

Day 2:
  写正确示例，跑通交互。

Day 3:
  写错误示例，解释错误原因。

Day 4:
  做小练习或 mini lab。

Day 5:
  整理学习指导文件和 cheatsheet。

Day 6:
  做阶段小项目。

Day 7:
  复盘、补漏洞、做面试题。
```

### 每章输出物

每章至少输出：

```txt
1. chapter-learning-guide.md
2. practices/
3. mini-project/
4. cheatsheet.md
5. interview-questions.md
```

---

## 21. 学习指导文件生成规则

每一章指导文件必须包含：

```txt
本章解决什么问题
前置概念
学习目标
学习顺序
核心术语表
底层心智模型
推荐目录结构
运行方式
分节教学与练习
API / 语法索引
常见错误表
最终小项目
额外速查表
最终文件清单
如何转换成个人笔记
必须能回答的问题
最终记忆模型
官方文档阅读清单
```

每个非平凡代码示例必须包含：

```txt
正确示例
错误示例
逐行解释
执行过程
props / state / ref / closure / effect dependency / type 的变化
为什么得到这个输出
违反了什么规则
如何修正
如何识别类似错误
```

对于 React / TypeScript 章节，必须明确区分：

```txt
JSX syntax
JavaScript runtime behavior
React runtime behavior
render phase
commit phase
state snapshot
closure behavior
TypeScript type-system behavior
browser DOM behavior
server/client boundary
```

---

## 22. 资料使用顺序

推荐资料顺序：

```txt
1. Official React documentation
2. Official React blog and upgrade guides
3. Official TypeScript documentation
4. MDN JavaScript and Web API documentation
5. Official Next.js documentation
6. React Testing Library documentation
7. TanStack Query documentation
8. React Hook Form documentation
9. Local React books and project notes
```

使用原则：

```txt
官方 React 文档负责机制正确性。
官方 React blog 负责版本特性和迁移方向。
TypeScript 官方文档负责类型系统边界。
MDN 负责 JavaScript 和浏览器行为。
Next.js 官方文档负责框架边界。
本地资料负责补充学习路径和练习。
项目练习负责把知识变成能力。
```

如果本地书籍或旧教程和当前官方文档冲突，以当前官方文档为准。

---

## 23. 最终验收标准

完成这条路线后，你应该能独立完成：

```txt
1. 写一个 React + TypeScript 中大型前端应用。
2. 设计 feature-based 项目结构。
3. 设计可复用组件和业务组件边界。
4. 正确处理 props、state、derived state、lifting state up。
5. 正确使用 key 保证列表 identity。
6. 写 custom hooks 复用状态逻辑。
7. 避免不必要的 useEffect。
8. 处理 loading、error、empty、success 状态。
9. 使用 TanStack Query 管理 server state。
10. 使用 React Hook Form + zod 处理复杂表单。
11. 使用 Zustand / Redux Toolkit 处理必要的 client state。
12. 使用 Suspense / lazy 做代码分割和加载边界。
13. 使用 React DevTools Profiler 定位重渲染。
14. 使用 memoization，但不过度优化。
15. 使用 Error Boundary 处理渲染错误。
16. 写 React Testing Library 组件测试。
17. 写 Playwright E2E test。
18. 处理 accessibility。
19. 处理 SSR / hydration 问题。
20. 理解 React Server Components 和 Client Components 边界。
21. 理解 React 19 Actions 和 optimistic UI。
22. 理解 React Compiler 的优化方向。
23. 能设计 design system 和团队级 React 代码规范。
24. 能把这些能力做进一个真实项目并写进简历。
```

如果这些都能做到，你可以把 React 能力定位为：

```txt
深入理解 React 核心机制，并具备生产级 React + TypeScript / Next.js 应用设计、实现、测试、优化和架构治理能力。
```

这才是“精通 React”在官方文档、市场情况和招聘需求三个维度下都站得住的标准。

---

<a id="2026-delta"></a>

## 2026-10 增量更新：版本、就业与 AI 工程

> 基准日期：2026-10-28。只补充原有 12 个 Phase 和 6 个 Planned Projects；不重命名、不删除、不假定新增练习已经创建。原始 Markdown 是事实源，PDF 仅作阅读副本，避免从乱码 PDF 覆盖原文。

### A. 版本基线与兼容边界

| 组件 | 2026-10 学习基线 | 必须区分的机制 |
|---|---|---|
| React | React 19.3 stable | React Compiler 1.0 是构建期优化器，不改变 state identity、render/commit 与 Effect 语义 |
| TypeScript | TypeScript 7 stable（先检查工具链兼容性） | 类型检查不等于运行时 JSON 验证；编译器提速不等于页面运行提速 |
| Next.js | Next.js 16.2（深入内容在 Next roadmap） | React SPA 与 RSC/server functions 有不同执行边界 |
| Node.js | Node 24 LTS（后端生产练习） | HTTP、鉴权、数据库和 LLM provider 调用归 server；浏览器不得保存 provider secret |
| Vercel AI SDK | AI SDK 7（仅在 AI 集成时引入） | Node 22+、ESM；UI hooks 不等于 agent 权限或持久化工作流 |

React 19.3 新 API 先做独立 lab，再按浏览器支持、SSR 边界和需求选择。React Server Components 安全公告意味着 Next/RSC 项目必须维护框架依赖补丁清单。

### B. 跨框架职责去重

| 关注点 | React roadmap 学习与交付 | 其他路线负责 |
|---|---|---|
| UI、组件与状态 | 渲染纯度、identity、Hooks、TanStack Query、表单、a11y、AI streaming UX | Vue 对照 reactivity/composables，不重复同一业务项目 |
| API、身份与授权 | 定义调用 contract、处理 401/403 与 UI 状态 | Node 或 Next BFF 执行真实 authz、schema validation、rate limit |
| LLM/agent | 展示进度、取消、引用、审批与错误恢复 | Node/Next 负责 provider API、tool loop、RAG、eval、审计 |
| 生产工程 | RTL/MSW/Playwright、Profiler、Web Vitals | Next/Vercel 负责部署、缓存、BFF、server trace；Node 负责后台任务 |

AI UI contract 练习：定义 ExplainMetricRequest（metricId、from、to、filters）和 discriminated union 状态 idle / streaming / awaiting_approval / complete / error；说明联合类型约束的是 UI 状态组合，网络数据仍必须 runtime validate。

### C. AI-assisted Engineering：Codex/Agent 工作流（P0，共用规范）

1. **任务契约**：明确输入、输出、受影响文件、禁止修改范围、版本、验收命令和回滚办法。
2. **上下文管理**：提供本章 roadmap、learning guide、组件/API contract、最小错误复现；可在 AGENTS.md 记录稳定约束。
3. **最小 diff**：Agent 先阅读源文件和测试，再提出 patch；不允许静默删除原练习或项目。
4. **人工审查**：检查异步竞争、权限、类型断言、依赖升级与测试是否验证真实行为；危险操作需要明确批准。
5. **质量门禁**：lint → typecheck → unit/integration → E2E → build，保存实际输出；“AI 已检查”不等于测试通过。
6. **复盘**：记录 Agent 错误假设、缺失上下文、回归测试和人工修改，强化独立工程设计能力。

### D. 求职优先级与可展示证据

| 优先级 | 技能组合 | Portfolio 证据 |
|---|---|---|
| P0 | TypeScript + React、HTTP/API、测试、a11y、异步状态与错误恢复 | 可访问 UI、自动化测试、API contract、状态边界说明 |
| P0 | React + Node/Next + PostgreSQL + authz + AI tools | 端到端流程；server 鉴权、schema、取消、审批与 eval |
| P1 | React Compiler、CI/CD、Observability、Docker、RAG | 性能 baseline、trace、部署记录、RAG 引用正确性测试 |
| P2 | 微前端、复杂分布式、Swift native client | 先完成主线项目，再按目标岗位选择 |

这是学习 ROI 判断，不是岗位数量统计。职位标题、地区、资历和技能关键词不可直接比较；投递前对目标地区 20–30 份真实 JD 做可追溯抽样。

### E. 执行顺序与可测量门禁

- **第 1 轮（P0，12–16h）**：Phase 2/3/4 的 identity、Effect race、runtime validation。
- **第 2 轮（P0，12–16h）**：Phase 6/8/9 的 optimistic rollback、Compiler profiling、async regression。
- **第 3 轮（P0，10–14h）**：Phase 10/11 的 RSC security、React 19.3 labs；Next 迁移留给 Next roadmap。
- **第 4 轮（项目扩展，12–20h）**：Query-driven Dashboard 的 Explain This Dashboard，复用既有 Node/Next AI 服务。

每轮要保存 baseline、可复现错误、测试修复、验收日志与机制解释。性能预算按环境与负载制定，不统一硬编码 p95。AI eval 使用固定 golden cases，跟踪 schema-valid rate、task success、未经授权工具执行、取消率、token 成本和延迟。

### F. 官方资料与招聘证据入口

- [React 19.3 官方发布说明](https://react.dev/blog/2026/09/09/react-19-3)
- [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [React 官方安全公告](https://react.dev/blog)
- [React：You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Vercel AI SDK 7](https://vercel.com/changelog/ai-sdk-7)
- [OpenAI API 开发者文档](https://developers.openai.com/api/docs)
- [OWASP GenAI Security](https://genai.owasp.org/)
- [LinkedIn 招聘样本入口（需按地区重新核验）](https://www.linkedin.com/jobs/)

# React 第 17 章：Official API Gaps、Escape Hatches 与 External Store Boundary

<style>
.macos-code-window {
  overflow: hidden;
  margin: 16px 0;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #0d1117;
}

.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid #30363d;
  background: #161b22;
}

.macos-code-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  border-radius: 999px;
}

.macos-code-dot-red { background: #ff5f57; }
.macos-code-dot-yellow { background: #ffbd2e; }
.macos-code-dot-green { background: #28c840; }

.macos-code-title {
  margin-left: 8px;
  color: #c9d1d9;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
}

.macos-code-titlebar + pre {
  overflow-x: auto;
  margin: 0;
  padding: 16px;
  border-radius: 0 0 12px 12px;
  background: transparent;
}

.macos-code-titlebar + pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
}
</style>

## 目录

- [本章机制地图](#本章机制地图)
- [0. 本章工程问题与边界](#0-本章工程问题与边界)
- [1. 本章解决的问题](#1-本章解决的问题)
- [2. 前置概念](#2-前置概念)
- [3. 学习目标](#3-学习目标)
- [4. 机制依赖图](#4-机制依赖图)
- [5. 核心术语表](#5-核心术语表)
- [6. 底层心智模型](#6-底层心智模型)
- [7. 推荐目录结构](#7-推荐目录结构)
- [8. 示例运行方式](#8-示例运行方式)
- [9. 分节教学与练习](#9-分节教学与练习)
  - [9.1 API 补漏章定位：为什么不是常规业务 API](#section-9-1)
  - [9.2 useDeferredValue：deferred rendering 与 stale UI](#section-9-2)
  - [9.3 useTransition / startTransition：non-blocking update 与 pending boundary](#section-9-3)
  - [9.4 useDeferredValue vs useTransition：value lag 和 update priority 的区别](#section-9-4)
  - [9.5 useSyncExternalStore：外部 store snapshot 与 subscription contract](#section-9-5)
  - [9.6 useId：accessibility ID、hydration consistency 与 key 的区别](#section-9-6)
  - [9.7 useDebugValue：custom hook DevTools label](#section-9-7)
  - [9.8 useLayoutEffect：commit 后、paint 前的 DOM measurement](#section-9-8)
  - [9.9 useInsertionEffect：CSS insertion timing 与普通 effect 的边界](#section-9-9)
  - [9.10 useImperativeHandle：imperative ref handle 与 controlled component 边界](#section-9-10)
  - [9.11 useEffectEvent：effect 中读取最新值但不扩大 dependency](#section-9-11)
  - [9.12 cache / cacheSignal / captureOwnerStack：framework、server 与 diagnostic boundary](#section-9-12)
  - [9.13 SellerHub API gap mapping：哪些场景需要这些 API，哪些不需要](#section-9-13)
  - [9.14 最终小项目：SellerHub API Gap Lab](#section-9-14)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 最终小项目结构](#122-最终小项目结构)
  - [12.3 文件职责](#123-文件职责)
  - [12.4 完整代码定位](#124-完整代码定位)
  - [12.5 运行方式](#125-运行方式)
  - [12.6 预期输出或交互结果](#126-预期输出或交互结果)
  - [12.7 核心执行流程](#127-核心执行流程)
  - [12.8 常见错误与可选扩展](#128-常见错误与可选扩展)
- [13. 额外速查表](#13-额外速查表)
- [14. 工程迁移与代码审查要点](#14-工程迁移与代码审查要点)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章机制地图

这张表只保留能帮助理解机制的工程路径；它不是文件盘点，也不记录文件状态。

| Mechanism | Owner / Boundary | Runtime Layer | Project Scenario | Source Reading Path |
| --- | --- | --- | --- | --- |
| Deferred value | The component defers expensive display updates while keeping input responsive. | React concurrent rendering | Catalog search can keep typing responsive while results lag intentionally. | `src/learning/react/chapter-17-official-api-gaps/02-deferred-value/deferred-catalog-search.tsx` |
| Transition | The interaction owner marks non-urgent state updates. | React scheduler | Filter changes can be scheduled without blocking urgent input. | `src/learning/react/chapter-17-official-api-gaps/03-transition-boundary/transition-filter-workspace.tsx` |
| External store | React reads a non-React source through a subscribe/getSnapshot contract. | useSyncExternalStore boundary | Inventory state can mirror browser storage or external event sources safely. | `src/learning/react/chapter-17-official-api-gaps/05-sync-external-store/sync-external-store-panel.tsx` |
| Escape hatch boundary | Layout, insertion, imperative, debug, and effect event APIs solve narrow edge cases. | React specialized hook/runtime boundary | SellerHub maps when an API is justified and when ordinary props/state/effects are better. | `src/learning/react/chapter-17-official-api-gaps/13-sellerhub-api-gap-map/sellerhub-api-gap-map.tsx` |

## 0. 本章工程问题与边界

本章解决的工程问题是：官方 API 列表中有些能力是常用机制，有些是 escape hatch，有些是 framework/server/diagnostic 边界。学习目标是知道何时不用它们，和何时需要证据后再用。

本章不把 `cache`、`cacheSignal`、`captureOwnerStack` 等边界 API 伪造成普通 client demo。边界是 runnable client examples 与 framework/diagnostic-only 知识的明确区分。

## 1. 本章解决的问题

前 1-16 章已经建立了 React 渲染、state、forms、effects、refs、routing、async data、performance、testing、Next.js boundary、React 19 Actions、production architecture 和 SellerHub capstone。剩下的学习风险不是“不会写页面”，而是遇到 official API 时分不清：

- 哪些是普通 Vite client component 可以运行的 API。
- 哪些是 external system 或 library author boundary。
- 哪些是 framework/server/diagnostic API，当前项目只能认识和记录，不能伪造成业务能力。
- 哪些 API 改变的是 scheduling、snapshot、subscription 或 timing，而不是让计算本身变快。

本章用一个个小练习把这些边界拆开，最终再合成 `SellerHub API Gap Lab`。

## 2. 前置概念

学习本章前必须能解释：

- render snapshot：component function 每次调用都有自己的 state/props binding。
- commit phase：React 把 render result 提交到 DOM 的阶段。
- effect dependency：dependency array 表示 effect 应该同步哪些 reactive values。
- ref object：`ref.current` 是可变容器，不自动触发 render。
- browser layout / paint：DOM mutation 后，浏览器会计算 layout 并绘制。
- TypeScript type erasure：TS 检查类型，但 runtime 不保存 interface 或 union。
- Vite client runtime：本项目是 browser-side Vite React lab，不运行 React Server Components。

## 3. 学习目标

完成本章后，你应该能够：

1. 判断 `useDeferredValue` 和 `useTransition` 分别适合 value lag 还是 update priority。
2. 写出符合 `useSyncExternalStore` contract 的 `subscribe` / `getSnapshot` / server snapshot。
3. 用 `useId` 建立 accessible label / description relationship，并说明为什么它不是 list key。
4. 用 `useDebugValue` 为 custom hook 提供 DevTools label，而不把它当 runtime state。
5. 判断什么时候需要 `useLayoutEffect`，以及它为什么可能阻塞 paint。
6. 说明 `useInsertionEffect` 为什么主要服务 CSS-in-JS library boundary。
7. 用 `useImperativeHandle` 暴露最小 command surface，而不是泄露整个 DOM node。
8. 用 `useEffectEvent` 在 effect subscription 中读取 latest value，但不隐藏真正的 dependency。
9. 诚实标记 `cache`、`cacheSignal`、`captureOwnerStack` 的 server / framework / diagnostic boundary。

## 4. 机制依赖图

这些依赖不是阅读顺序清单，而是本章概念成立的前置关系。

| First Understand | Then Understand | Dependency Reason | Failure If Skipped |
| --- | --- | --- | --- |
| Urgent vs non-urgent work | Deferred value and transition | 先区分用户输入和派生结果，才能选择正确 scheduling API。 | 会用 transition 包住错误状态或让输入仍然卡顿。 |
| External source contract | useSyncExternalStore | 外部 store 必须提供稳定 subscribe/getSnapshot。 | React 会读到撕裂或不同步快照。 |
| DOM measurement timing | useLayoutEffect | 布局读取需要在 paint 前同步处理。 | 会出现布局闪烁或错误测量。 |
| Imperative need | useImperativeHandle | 只有父级确实需要命令式能力时才暴露 handle。 | 会把普通数据流退化成难追踪命令调用。 |

## 5. 核心术语表

| Term | 中文说明 | Layer | Why It Matters |
| --- | --- | --- | --- |
| current value | 当前 render 中的普通 state/prop value | React render snapshot | 与 deferred value 对比，帮助判断 stale UI |
| deferred value | React 延后交给下游 UI 的 value | React scheduling | 保持 urgent input responsive，但不减少计算本身 |
| transition update | 被标记为 non-urgent 的 state update | React scheduling | 用 pending boundary 管理大 UI 更新 |
| external store snapshot | 外部 mutable source 的只读快照 | external system boundary | React 通过 identity 判断是否需要 re-render |
| subscription contract | `subscribe` 返回 unsubscribe，store changed 时通知 listener | JavaScript runtime / React hook boundary | 保证 React 与外部 source 同步 |
| accessibility ID | 连接 label、input、description 的 DOM ID | browser platform / React Hook | 避免 hardcoded ID collision |
| layout effect | commit 后、paint 前运行的 effect | React commit / browser rendering | 适合 DOM measurement，但会推迟 paint |
| insertion effect | layout effect 前插入 CSS 的 effect | library author boundary | 主要用于 CSS injection timing |
| imperative handle | child 暴露给 parent 的 command object | ref / escape hatch | 只开放必要方法，隐藏 DOM node |
| effect event | effect 内部使用的非 reactive event logic | React effect boundary | 读取 latest value，不扩大 subscription dependency |

## 6. 底层心智模型

本章所有 API 都可以归为四类：

1. **Scheduling boundary**：`useDeferredValue`、`useTransition`、`startTransition` 改变的是 React 处理更新的优先级和可中断性，不是把循环变快，也不是 debounce。
2. **External boundary**：`useSyncExternalStore` 承认数据 owner 不在 React state 内部，所以必须把 snapshot identity、subscription 和 unsubscribe contract 讲清楚。
3. **Escape hatch boundary**：`useLayoutEffect`、`useInsertionEffect`、`useImperativeHandle`、`useEffectEvent` 都绕开普通 declarative rendering 的一部分，但每个 API 只解决一个窄问题。
4. **Framework/server/diagnostic boundary**：`cache`、`cacheSignal`、`captureOwnerStack` 不是本 Vite client lab 的普通业务 API。本章学习它们是为了读官方文档和识别边界，不是伪造执行结果。

## 7. 推荐目录结构

### 当前项目结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Current project structure</span>
  </div>

```txt
D:/vite_ts/
  README.md
  package.json
  src/App.tsx
  docs/react/
  src/learning/react/
```
</div>

### 本章文档结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Chapter document structure</span>
  </div>

```txt
docs/react/chapter-17-official-api-gaps/
  react-chapter-17-learning-guide.md
```
</div>

### 本章真实练习结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Chapter 17 practice structure</span>
  </div>

```txt
src/learning/react/chapter-17-official-api-gaps/
  chapter-17-practice-root.tsx
  chapter-17-practice.css
  01-api-gap-boundary/
  02-deferred-value/
  03-transition-boundary/
  04-deferred-vs-transition/
  05-sync-external-store/
  06-use-id/
  07-use-debug-value/
  08-layout-effect/
  09-insertion-effect/
  10-imperative-handle/
  11-effect-event/
  12-framework-diagnostic-boundary/
  13-sellerhub-api-gap-map/
  sellerhub-api-gap-lab/
```
</div>

### 概念示例结构

本章主要使用真实练习文件。文档中的 snippet 只用于解释机制，不代表需要创建新文件。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Conceptual snippets</span>
  </div>

```txt
Snippet: stable external snapshot
Snippet: unstable external snapshot mistake
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
```
</div>

开发服务器启动后打开 `/react/chapter-17`。本章不需要新增依赖，不需要 Next.js，不需要 server，也不需要外部 store library 或 CSS-in-JS library。

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 API 补漏章定位：为什么不是常规业务 API

**结论：** 第 17 章不是“React API 列表”。它训练的是边界判断：某个 API 到底属于 scheduling、external store、accessibility、DOM timing、CSS insertion、imperative ref、effect subscription，还是 framework/server/diagnostic boundary。

**本节解决的问题：** 如果把这些 API 都当成普通业务 state API，最容易犯三个错误：用 `useDeferredValue` 当 debounce、用 `useSyncExternalStore` 包装本来就属于 React 的 local state、把 `cache` / `cacheSignal` 当作 Vite client cache。

**机制证据链：**

1. 触发动作是开发者选择 API。
2. JavaScript runtime 只会执行当前 bundle 中实际 import 的 client code；server-only semantics 不会因为类型存在就变成 browser capability。
3. React 只在对应 hook call position 或 framework boundary 中赋予 API 意义。
4. TypeScript 能检查导出和调用签名，但不会证明某 API 在当前 runtime 的语义适用。
5. UI 结果取决于真实 runtime：client hook 能渲染练习面板，server/diagnostic API 只能在本章中以边界卡片呈现。
6. 错误形式是把 boundary API 伪造成已运行功能。
7. 真实项目中，如果 API 说明依赖 Server Components、development diagnostics、CSS library insertion 或 external store contract，就应先写边界说明，再决定是否落代码。

**与真实文件的关系：** `api-gap-boundary-panel.tsx` 把 runnable client APIs 与 boundary-only APIs 分开显示；它不改动前 1-16 章。

**边界示例：**

| 判断对象 | 错误边界 | 违反的规则 | 修正后的判断 | 真实项目识别信号 |
| --- | --- | --- | --- | --- |
| `useDeferredValue` | 看到“defer”就拿来减少 HTTP 请求 | 它延后的是下游 UI render，不是 event、timer 或 fetch 调度 | 用它保留旧列表、降低 expensive rendering 对输入的阻塞；网络节流仍由 debounce/cache/request layer 处理 | 需求写着“少发请求”时不要先选它；需求写着“输入不卡，旧结果可短暂保留”时才考虑 |
| `cache` / `cacheSignal` | 在 client component 中包装 fetch 并宣称得到 server cache | server/framework context 不能由 TypeScript import 伪造 | 在本 Vite lab 只作为 Server Components / framework boundary 阅读 | API 文档提到 Server Components、render cache lifetime、framework integration |
| `captureOwnerStack` | 把 owner stack 当作 production analytics payload | development diagnostic 不等于业务数据模型 | 作为诊断边界说明，不做用户可见功能 | 需求属于 error overlay、dev diagnostics、owner trace，而不是用户流程 |

**执行过程：** 先从工程问题出发，识别 value owner 是 React state、external store、DOM node、CSS runtime、effect subscription、server render context 还是 development diagnostic；再检查官方 API 的 runtime 条件；最后决定是写 runnable TSX、写 boundary card，还是只放在 review checklist 中。这个顺序能避免“为了覆盖 API 而写代码”。

**边界解释：** JavaScript 只能执行已经进入 browser bundle 的代码；React 只在特定 hook call position、render phase、commit phase、server/framework context 或 DevTools/diagnostic context 给 API 语义；TypeScript 只确认导出和调用签名，不证明当前 runtime 具备该 API 的正确执行环境。

<a id="section-9-2"></a>

### 9.2 useDeferredValue：deferred rendering 与 stale UI

**结论：** `useDeferredValue` 延后的是传给下游 UI 的 value。输入框的 current value 已经变了，deferred value 可能仍然停留在旧 snapshot，所以结果列表可以短暂显示 stale UI。

**本节解决的问题：** catalog search 中，用户输入必须 urgent；产品列表如果昂贵，可以读取 deferred query。它不是 debounce，因为 React 没有等待固定毫秒；它也不会减少计算本身，只是让 background render 可被 urgent update 打断。

**机制证据链：**

1. 用户在 `DeferredCatalogSearch` 的 input 输入 `light`。
2. JavaScript handler 调用 `setQuery(nextValue)`，current render 的 `query` binding 在下一次 render 中变成 `light`。
3. `useDeferredValue(query)` 的 hook cell 可以先返回旧 `deferredQuery`，再安排 background render。
4. TypeScript 只知道 `query` 与 `deferredQuery` 都是 string，不会检查它们是否 stale。
5. UI 先显示 input 最新值，列表可能仍基于旧 query；等 background render commit 后列表更新。
6. 错误形式是把它当作 network throttle；官方也明确它不会阻止额外请求。
7. 真实项目中，如果用户输入不卡但列表慢，且旧结果短暂保留是可接受体验，就考虑 deferred value。

**真实练习文件：** `02-deferred-value/deferred-catalog-search.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | `const deferredQuery = useDeferredValue(query)` 后仍用 `query` 过滤昂贵列表，并期待 fewer requests | expensive consumer 没有读取 deferred value，所以 render cost 仍跟 urgent input 同步；fetch count 也不会被减少 |
| Correct | input 使用 `query`，list 使用 `deferredQuery`，并用 `query !== deferredQuery` 显示 stale indicator | React 先提交 urgent input snapshot，再尝试 background render，让 slow consumer 追上最新 value |

**执行过程：** 输入事件先让 browser control 得到候选 string；handler 调用 `setQuery(nextQuery)`；下一次 render 中 input 读取最新 `query`，而 `useDeferredValue(query)` 可以返回上一轮 `deferredQuery`；列表继续基于旧 value 渲染；background render 完成后，列表使用新 deferred value commit。若期间又输入新字符，旧 background render 可被打断并重启。

**逐行机制对应：** `const [query, setQuery] = useState('')` 拥有 urgent input value；`const deferredQuery = useDeferredValue(query)` 创建 lagging consumer value；`value={query}` 保证输入框不延迟；`products.filter(...deferredQuery...)` 才是被延后的 expensive consumer；`query !== deferredQuery` 是可见 stale evidence。

**识别同类问题：** 如果 profiler 显示慢的是列表、图表、Markdown preview 或搜索结果渲染，而不是网络请求或算法本身，`useDeferredValue` 才是候选；如果需求是合并请求、取消请求或减少 HTTP 次数，应回到 Chapter 24 的 abort/cache/request boundary。

<a id="section-9-3"></a>

### 9.3 useTransition / startTransition：non-blocking update 与 pending boundary

**结论：** `useTransition` 和 `startTransition` 标记的是 update 的 priority。urgent update 先反映在控件上，transition update 可以延后、被打断，并通过 pending flag 暴露给 UI。

**本节解决的问题：** Seller task filter 中，select 的 value 应该立即变；大列表筛选是 non-urgent。`startTransition` 不让筛选算法变快，它只让 React 把这次 state update 放到可中断的 transition lane。

**机制证据链：**

1. 用户选择 `Orders`。
2. handler 同步调用 `setUrgentCategory('Orders')`，再在 `startSelectionTransition` 中调用 `setVisibleCategory('Orders')`。
3. React 把 urgent state cell 和 transition state cell 分在不同优先级处理；`isPending` 来自 transition hook cell。
4. TypeScript 检查 category union，但不参与 scheduling。
5. UI 上 select 立即显示 Orders，任务列表可以随后 commit；pending pill 表示 transition 尚未完成。
6. 错误形式是在 transition callback 外创建异步结果再以为所有后续 update 都是 transition；需要明确包住目标 update。
7. 真实项目中，tab switch、filter switch、route-like content update 是 transition 的典型候选。

**真实练习文件：** `03-transition-boundary/transition-filter-workspace.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | 把 controlled input 的 `setText(nextText)` 放进 `startTransition` | React 官方边界要求 text input control state 不能由 Transition 控制，否则输入反馈会被标成 non-urgent |
| Correct | `setText(nextText)` 保持 urgent，只把 `setVisibleFilter(nextFilter)` 或 large result update 放进 transition | urgent state cell 先保证 control feedback，transition state cell 可以延后并通过 `isPending` 给出 pending UI |

**执行过程：** handler 同步运行；transition action 不是延迟调用的 timer，而是立即执行并把其中同步触发的 state updates 标记为 non-blocking；React 遇到更 urgent 的输入或点击时可以中断 transition render；commit 后 `isPending` 回到 false。

**边界解释：** JavaScript callback 本身仍立即执行；React scheduler 标记的是 state update priority；TypeScript 只检查 category union、setter 参数和 callback 类型，不判断某次 update 是否应该 urgent。真实项目里，tab content、route-like pane、filter result 可以 transition；输入值、checkbox checked、drag position 这类 control feedback 不应该 transition。

<a id="section-9-4"></a>

### 9.4 useDeferredValue vs useTransition：value lag 和 update priority 的区别

**结论：** `useDeferredValue` 接收一个已经变化的 value，然后让下游读取可能滞后的版本；`useTransition` 从 update 发生点就把某次 state update 标为 non-urgent。

**本节解决的问题：** 两者常被混用。判断标准是：你控制的是“要延后的 value 读取”，还是“要标记的 state update”。

**机制证据链：**

1. 用户输入 search text，同时切换 kind。
2. `searchText` 立即进入 state；`deferredSearchText` 可以 lag。
3. `visibleKind` 只在 transition callback 内更新，所以 pending 表示 category content update 的状态。
4. TypeScript 能检查 option value string，但不能判断何者应该 deferred 或 transition。
5. UI 结果体现为 text lag 与 kind pending 分开显示。
6. 错误形式是同时对同一 update 叠加 deferred 和 transition，却没有明确用户体验目标。
7. 真实项目中，search query 常用 deferred value；tab content 或大区域切换常用 transition。

**真实练习文件：** `04-deferred-vs-transition/deferred-vs-transition-panel.tsx`。

**边界示例：**

| Decision | Correct API | Why |
| --- | --- | --- |
| Parent receives a rapidly changing prop and wants a slow child to lag | `useDeferredValue(prop)` | 你没有 prop 的 setter，只能 defer value consumption |
| Handler owns the state update and knows it is non-urgent | `useTransition` / `startTransition` | 你能包住 setter，并给 UI 暴露 pending state |
| Need fewer network requests | neither by itself | request boundary 需要 debounce/cache/abort，不是 render scheduling |

**执行过程：** deferred value 从“已经产生的新 value”开始分叉，当前 render 可继续给下游旧 value；transition 从“即将排队的 update”开始标记 priority。前者的关键变量是 `value` 与 `deferredValue`；后者的关键变量是 urgent state、transition state 与 `isPending`。

**错误识别：** 如果代码同时保留 `deferredQuery`、`visibleQuery`、`pendingQuery`，却不能说明哪个变量控制 input、哪个变量控制 expensive consumer、哪个变量代表 pending evidence，通常说明把两种机制混在一起了。修正方式是先画 owner：value consumer lag 用 deferred，setter priority 用 transition。

<a id="section-9-5"></a>

### 9.5 useSyncExternalStore：外部 store snapshot 与 subscription contract

**结论：** `useSyncExternalStore` 用于 React state 之外的 mutable source。它要求 `subscribe` 通知变更，`getSnapshot` 返回当前快照，并且 snapshot identity 必须稳定：没有变化就返回同一个对象。

**本节解决的问题：** 外部库存 store 不属于某个 component state owner。如果用 `useEffect` 手写 subscription，render 期间读取和 commit 期间订阅可能出现不一致；`useSyncExternalStore` 把读取 snapshot 和订阅关系变成 React 认识的 contract。

**机制证据链：**

1. 用户点击 `Restock one`。
2. JavaScript store 更新 `currentSnapshot`，创建新的 items array 和 snapshot object，然后调用 listener。
3. React 通过 subscription 收到通知，再调用 `getSnapshot` 并比较 snapshot identity。
4. TypeScript 检查 snapshot shape，但不会证明 `getSnapshot` 稳定，也不会保证 listener 一定被调用。
5. UI re-render 后显示新 version 和 stock。
6. 错误形式是 `getSnapshot` 每次都返回新 object；即使数据没变，React 也会认为 snapshot 变了。
7. 真实项目中，browser storage、WebSocket cache、third-party store 或 media query store 都需要这种 contract。

**关键片段：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Snippet: stable external snapshot</span>
  </div>

```ts
let currentSnapshot = initialSnapshot

export function getSnapshot() {
  return currentSnapshot
}

export function updateSnapshot(nextSnapshot: Snapshot) {
  currentSnapshot = nextSnapshot
  listeners.forEach((listener) => listener())
}
```
</div>

逐行看：`currentSnapshot` 是 module-level mutable binding；`getSnapshot` 只返回当前 binding，不构造新 object；`updateSnapshot` 只有在真实变化时替换 binding；通知 listener 后 React 才重新读取。对比错误是 `getSnapshot()` 内部写 `{ ...currentSnapshot }`，那会让 identity 每次都变。

**真实练习文件：** `05-sync-external-store/browser-inventory-store.ts`、`05-sync-external-store/sync-external-store-panel.tsx`。

**错误边界与修正：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | `getSnapshot() { return { items: store.items } }` | 每次 render 都创建新 object；即使 external data 没变，React 也会读到新 identity |
| Correct | 只有 mutation path 替换 `currentSnapshot`；无变化时 `getSnapshot` 返回同一引用 | React 可以用 snapshot identity 判断是否需要重新渲染 subscriber |

**执行过程：** external store 先在 React 外部变更；mutation function 生成 next immutable snapshot；listeners 被调用；React 在 subscriber render 前后读取 snapshot；如果 snapshot 在相同数据下保持同一引用，UI 稳定；如果每次都新建对象，可能触发重复 render 或官方 troubleshooting 中的 cached snapshot warning。

**真实项目识别：** 看到 `window.addEventListener('storage')`、`matchMedia`、WebSocket cache、third-party observable store 时，先问 source owner 是否在 React 外部；如果答案是 yes，再检查 `subscribe` 是否返回 unsubscribe、`getSnapshot` 是否缓存无变化 identity。

<a id="section-9-6"></a>

### 9.6 useId：accessibility ID、hydration consistency 与 key 的区别

**结论：** `useId` 生成用于 accessibility attributes 的 unique ID。它不是 list key，不是 database ID，也不是 cache key。

**本节解决的问题：** 多个 filter form 同屏渲染时，hardcoded `id="query"` 会冲突；`useId` 让 label、input、description 拥有稳定关联。Server rendering 场景下，它依赖 server/client component tree 一致来保持 hydration consistency。

**机制证据链：**

1. Component render 调用 `useId()`。
2. JavaScript 得到一个 string；React 把这个 string 绑定到当前 hook call position 和 owner path。
3. JSX 把 string 写入 `id`、`htmlFor`、`aria-describedby`。
4. TypeScript 检查这些 prop 是 string，但不会验证 DOM 中是否唯一。
5. Browser accessibility tree 通过 matching id 建立字段与说明文本关系。
6. 错误形式是用 `useId` 生成 list key；key 必须来自 data identity。
7. 真实项目中，设计系统 field component 可以用 `useId` 处理 label/help/error relationship。

**真实练习文件：** `06-use-id/accessibility-id-panel.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | `items.map((item) => <Row key={useId()} item={item} />)` | key 必须表达 sibling data identity；hook 不能在 loop 中调用，生成 ID 也不能替代 domain ID |
| Correct | `const fieldId = useId()`，再把它传给 `id`、`htmlFor`、`aria-describedby` | ID 绑定 hook call position，用于 DOM association；list key 继续使用 `item.id` |

**执行过程：** render 到达固定 hook call position；React 产生该 owner path 下稳定 ID；JSX 把 ID 写到 label/input/help text 之间；browser accessibility tree 根据 matching DOM IDs 建立关系。TypeScript 只确认 prop value 是 string，不会证明 DOM ID 唯一，也不会检查 accessible name 是否符合产品语义。

**识别同类问题：** 如果错误表现是 screen reader 读不到 help/error text、多个 field 共用同一个 `id`、label click 聚焦错字段，优先检查 `useId` 或显式 ID 传递；如果错误表现是列表状态串行、checkbox 勾选错行，优先检查 key，不要用 `useId` 修。

<a id="section-9-7"></a>

### 9.7 useDebugValue：custom hook DevTools label

**结论：** `useDebugValue` 只帮助 React DevTools 显示 custom hook 的调试标签。它不参与 render output，不是 state，也不应该承载业务逻辑。

**本节解决的问题：** custom hook 很多时，DevTools 里只看到 state 和 memo value 不够直观。`useDebugValue` 可以暴露 label，例如 low stock threshold，但 UI 应继续从普通 state/props 读取。

**机制证据链：**

1. Component 调用 custom hook。
2. Hook 内部根据 `minimumStock` 创建 label，并调用 `useDebugValue(label, formatter)`。
3. React DevTools 可在检查 hook 时格式化这个 label。
4. TypeScript 检查 formatter input/output，但 runtime UI 不读取 debug label。
5. 页面结果不因 `useDebugValue` 改变。
6. 错误形式是把 debug label 当作业务 source state。
7. 真实项目中，复杂 custom hook 如 inventory filters、feature flags、auth session 可用它改善调试可读性。

**真实练习文件：** `07-use-debug-value/use-debug-value-panel.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | `const label = useDebugValue(status)` 后在 JSX 中读取 label | `useDebugValue` 没有返回 UI state；它只给 DevTools 描述 custom hook |
| Correct | UI 读取 `status`，custom hook 内部调用 `useDebugValue(status, formatStatus)` | runtime UI 与 diagnostic label 分离，调试增强不会成为业务依赖 |

**执行过程：** custom hook 先计算真实业务值；`useDebugValue` 注册一个 DevTools 可读 label 或 formatter；页面 render output 不会因为该调用增加 DOM；只有开发者检查 hooks 时才看到 label。TypeScript 能检查 formatter 参数，但不会保证 DevTools 一定打开，也不会让 label 进入 component props。

**真实项目识别：** 如果一个 custom hook 很难在 DevTools 中区分，例如 `useInventoryStore`、`useFeatureFlag`、`useSellerSession`，可以加 debug label；如果产品逻辑、analytics payload 或测试断言依赖 debug label，则边界已经错了。

<a id="section-9-8"></a>

### 9.8 useLayoutEffect：commit 后、paint 前的 DOM measurement

**结论：** `useLayoutEffect` 在 DOM commit 后、browser paint 前运行，适合读取 layout 并同步修正 UI；代价是可能阻塞 paint。

**本节解决的问题：** Dashboard metric card 有时必须先 render，读取真实 DOM size，再决定 popover 或 layout。普通 `useEffect` 发生在 paint 后，可能先闪一下错误位置；layout effect 可以避免闪烁，但不能滥用。

**机制证据链：**

1. 用户切换 density。
2. React render 新 JSX，commit DOM mutation。
3. layout effect 读取 `ref.current.getBoundingClientRect()`，再设置 measurement state。
4. TypeScript 检查 ref 可能为 null，所以代码必须 guard；它不保证浏览器 layout cost。
5. UI 在 paint 前得到 measurement label。
6. 错误形式是在 layout effect 中做慢网络请求或大计算，导致 paint 被推迟。
7. 真实项目中，只在必须依赖真实 DOM measurement 时使用。

**真实练习文件：** `08-layout-effect/layout-measurement-panel.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | 在每个数据同步 effect 中都改成 `useLayoutEffect` | layout effect 会阻塞 paint；普通 network、analytics、title sync 不需要 paint 前完成 |
| Correct | 只在 tooltip position、scroll measurement、popover placement 这类 DOM read/write 中使用 | DOM 已 commit，但 browser 尚未 paint，measurement 和同步修正可以避免闪烁 |

**执行过程：** React render 只返回 element description，不读 layout；commit phase 把 DOM mutation 写入页面；layout effect 在 paint 前运行，读取 `ref.current` 和 layout box；如果需要修正 state，React 可再次同步 render/commit；最后 browser paint 已修正的 UI。

**识别同类问题：** 如果用户看到“先出现在错误位置再跳一下”，且原因是必须读取真实 DOM 尺寸，layout effect 合理；如果只是数据请求、日志、localStorage 或 document title，使用 ordinary effect，避免阻塞首屏 paint。

<a id="section-9-9"></a>

### 9.9 useInsertionEffect：CSS insertion timing 与普通 effect 的边界

**结论：** `useInsertionEffect` 用于在 layout effects 之前插入 CSS rules。它是 CSS-in-JS library author boundary，普通业务数据同步不应该使用它。

**本节解决的问题：** 如果 runtime CSS 规则晚于 layout measurement 插入，layout effect 可能读到未应用样式的尺寸。`useInsertionEffect` 解决的是 style injection timing，不是 state、fetch 或 analytics。

**机制证据链：**

1. 用户修改 color input。
2. Component render 生成新的 CSS rule string。
3. insertion effect 在 layout effects 前把 rule 写入 style element。
4. TypeScript 只检查 DOM API 类型，不判断 CSS 是否正确，也不保证样式策略合理。
5. 后续 layout measurement 能在样式已插入后读取 DOM。
6. 错误形式是在 insertion effect 中读取 layout ref 或执行业务 side effect。
7. 真实项目中，除非你在写 CSS runtime/library，否则很少直接调用它。

**真实练习文件：** `09-insertion-effect/css-insertion-boundary-panel.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | 在 `useInsertionEffect` 中 fetch theme token 或读取 `getBoundingClientRect()` | insertion effect 发生在 layout effects 前，目标是 style insertion；它不是数据同步或 measurement API |
| Correct | CSS runtime 根据本次 render 的 style rule 把 rule 插入 style element，然后 layout effect 才读取应用后的 layout | style insertion timing 与 DOM measurement timing 分离 |

**执行过程：** render 计算出 CSS rule string；commit 后 React 运行 insertion effect；style element 被更新；随后 layout effect 或 browser layout 可以基于已插入的 CSS 计算尺寸。TypeScript 只检查 DOM API 和 string，不会验证 CSS selector 是否安全，也不会判断团队是否应该引入 runtime CSS 策略。

**真实项目识别：** 如果你不是在写 CSS-in-JS runtime、design token runtime 或 style injection library，几乎不需要直接调用它。业务组件里出现 fetch、subscription、analytics 或 measurement inside insertion effect，通常就是错误边界。

<a id="section-9-10"></a>

### 9.10 useImperativeHandle：imperative ref handle 与 controlled component 边界

**结论：** `useImperativeHandle` 让 child 暴露一个最小 command object 给 parent。React 19 中 `ref` 可以作为 prop 接收；重点是隐藏 DOM node，只暴露必要方法。

**本节解决的问题：** Search panel 仍然应该是 controlled component：query 由 state owner 管理。但 parent 有时需要 `focusSearch`、`resetSearch`、`scrollToResults` 这类命令。imperative handle 只解决命令入口，不应该替代 props 和 state。

**机制证据链：**

1. Parent 创建 `useRef<Handle | null>(null)` 并传给 child。
2. Child 内部保留真实 input DOM ref。
3. `useImperativeHandle` 把 `{ focusSearch, resetSearch, scrollToResults }` 赋给 parent ref。
4. TypeScript 检查 parent 只能调用 handle type 上的方法，但 runtime 仍需 optional chaining 防 null。
5. 用户点击 parent button 时，只能执行暴露的方法，不能直接改 DOM style。
6. 错误形式是暴露整个 DOM node 或过多 mutable methods，破坏 component boundary。
7. 真实项目中，focus、scroll、reset command 是合理用例；业务数据仍走 controlled props。

**真实练习文件：** `10-imperative-handle/imperative-search-panel.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | Parent ref 直接拿到 child input DOM node，然后改 `value` 和 `style` | Parent 绕过 controlled state owner 和 child boundary，可能让 DOM 与 React snapshot 分离 |
| Correct | Child 暴露 `{ focusSearch, resetSearch, scrollToResults }`，数据仍由 props/state 管理 | imperative handle 只开放命令，不开放内部结构 |

**执行过程：** parent 创建 ref object；child render 到固定 hook call position；`useImperativeHandle` 在 commit 期间把 handle object 赋给 parent ref；parent event handler 读取 `ref.current` 并调用有限命令；child 内部再决定使用 DOM ref、state setter 或 scroll API。TypeScript 限制可见方法名，但 runtime 仍需要处理 `null`。

**识别同类问题：** 合理需求通常是 focus、scroll、reset、play/pause；如果 parent 想读取 child 内部全部 state、直接 mutate input value、改 className 或调用私有方法，应改回 props/callback/state ownership，而不是扩大 handle。

<a id="section-9-11"></a>

### 9.11 useEffectEvent：effect 中读取最新值但不扩大 dependency

**结论：** `useEffectEvent` 把 effect 内部的非 reactive event logic 分出来，让 subscription callback 读取 latest value，而不把这些 value 加进 subscription effect 的 dependency array。

**本节解决的问题：** audit subscription 只应该绑定一次 event listener，但 listener 执行时要读到最新 channel 和 draft note。手工删 dependency 是错的；`useEffectEvent` 才是显式表达“读取 latest，但不驱动 re-subscribe”的 API。

**机制证据链：**

1. Component render 创建 `channel`、`draftNote` state snapshot。
2. `useEffectEvent` 返回可在 effect subscription 中调用的 event function。
3. `useEffect` 只负责 add/remove window listener，不依赖 `channel` 和 `draftNote`。
4. TypeScript 检查 function 参数，但不会替你判断 reactive dependency 是否该进入 effect。
5. 用户触发 event 时，listener 调用 effect event，读取 latest state。
6. 错误形式是把 `useEffectEvent` 当普通 click handler replacement，或用它隐藏本该同步的 dependency。
7. 真实项目中，analytics、audit、subscription callback 常需要这种 latest read。

**真实练习文件：** `11-effect-event/effect-event-latest-value-panel.tsx`。

**边界示例：**

| Form | Example | Mechanism |
| --- | --- | --- |
| Wrong | 删除 dependency array 中的 `channel`、`draftNote`，只为避免 resubscribe warning | 这是隐藏 reactive dependency；callback 可能读取 stale closure |
| Correct | effect 只依赖 subscription owner，latest value read 放进 `useEffectEvent` 返回的 function | setup/cleanup 的 reactive boundary 与 event-like latest read boundary 分离 |

**执行过程：** render 创建最新 state snapshot；`useEffectEvent` 返回能读取 latest snapshot 的 effect event；`useEffect` 只安装一次或只随真正的 subscription key 更新；外部事件触发 listener；listener 调用 effect event，读取最新 `channel` 和 `draftNote`。TypeScript 只检查函数签名，不会替你决定哪些 values 应该 reactive。

**真实项目识别：** analytics、audit log、subscription callback、socket message handler 常需要“安装时机稳定，但执行时读最新值”。如果读取的值应该改变 subscription 本身，例如 room id、topic id、user id，则不能用 effect event 隐藏它，必须放入 dependency。

<a id="section-9-12"></a>

### 9.12 cache / cacheSignal / captureOwnerStack：framework、server 与 diagnostic boundary

**结论：** `cache` 和 `cacheSignal` 属于 React Server Components / framework data boundary；`captureOwnerStack` 属于 development diagnostic boundary。本 Vite client lab 不伪造它们的业务执行结果。

**本节解决的问题：** 当前 `react` package 有这些导出，类型也可见，但“导出存在”不等于“在 Vite client business code 中语义适用”。本章只在 UI 中解释边界和适用场景。

**机制证据链：**

1. 开发者查看 React exports，发现这三个 API 存在。
2. JavaScript bundler 可以解析导出，但 runtime 语义仍受 React 官方边界约束。
3. Server cache 依赖 framework/server render context；owner stack 依赖 development diagnostic context。
4. TypeScript 只证明 API 名称和签名存在，不证明当前 runtime 能实现 server semantics。
5. UI 显示 boundary table，而不是执行 server cache。
6. 错误形式是在 Vite client 中把 `cache` 当普通 memoization 或 fetch cache。
7. 真实项目中，只有进入支持 RSC/server rendering 的 framework 时，才继续设计这些 API 的真实执行路径。

**真实练习文件：** `12-framework-diagnostic-boundary/framework-diagnostic-boundary-panel.tsx`。

**边界示例：**

| API | Wrong boundary | Correct boundary | Recognition |
| --- | --- | --- | --- |
| `cache` | 当成 client `useMemo` 或 fetch cache | Server Components / framework render cache reading | 需求涉及 server render dedupe、RSC data reads、framework loader |
| `cacheSignal` | 在 click handler 里取消浏览器请求 | render cache lifetime signal，Client Components 中不是普通 abort owner | 文档提到 rendering finished、cache lifetime、Server Components |
| `captureOwnerStack` | 当作 production analytics state | development-only diagnostic owner stack | 需求来自 error overlay、console patch、debug tooling |

**执行过程：** browser bundle 可以 import 某些导出，但 React runtime 会根据 dispatcher、environment 和 development/production mode 决定语义；server/framework API 需要 render context，diagnostic API 需要 owner stack context；没有这些 context 时，代码不能声称实现了 server cache 或 production telemetry。

**识别同类问题：** 如果一个 API 的官方说明包含 Server Components、server rendering、static API、development only、diagnostic、framework handles this for you，就先写 reading boundary。只有当项目真实引入相应 framework/runtime 后，才把它迁移为可执行 feature。

<a id="section-9-13"></a>

### 9.13 SellerHub API gap mapping：哪些场景需要这些 API，哪些不需要

**结论：** SellerHub 场景不是每个 API 都要用。只有当问题属于对应边界时才使用：search lag 用 deferred value，filter/tab priority 用 transition，browser-owned inventory 用 external store，field relationship 用 `useId`，layout measurement 用 layout effect，CSS runtime 用 insertion effect，命令入口用 imperative handle，audit subscription latest read 用 effect event。

**机制证据链：**

1. 场景从 SellerHub UI 问题出发，而不是从 API 出发。
2. JavaScript values 先确定 owner：React state、external store、DOM node、CSS rule 或 effect subscription。
3. React 只在匹配 owner 的 boundary 上提供正确语义。
4. TypeScript 能限制 shape，却不能替你选择 architecture boundary。
5. UI 决策表把每个场景和 API 绑定起来。
6. 错误形式是为了“覆盖 API”而无场景地使用 escape hatch。
7. 真实项目中，API choice 应写成 decision table 或 ADR，而不是散落在组件里。

**真实练习文件：** `13-sellerhub-api-gap-map/sellerhub-api-gap-map.tsx`。

**边界示例：**

| SellerHub problem | Correct API decision | Wrong decision |
| --- | --- | --- |
| Catalog search input is responsive but result rendering is heavy | `useDeferredValue` on query consumer | Debounce every keypress without measuring render cost |
| Switching analytics panels feels janky | `useTransition` around panel update | Transition the controlled select value itself |
| Inventory comes from browser/third-party mutable source | `useSyncExternalStore` | Copy external data into multiple component states with effects |
| Help text and error text need stable associations | `useId` | Reuse hardcoded IDs or list keys |
| Future RSC cache review | `cache` / `cacheSignal` reading boundary | Fake server cache inside Vite client |

**执行过程：** 决策从 scenario 开始，而不是从 API 名开始；每个 scenario 先确定 owner，再确定 runtime layer，再选 API。这个 mapping 让 SellerHub review 能解释为什么某些 API 应该落地，为什么某些 API 只放在 architectural note 中。

**识别同类问题：** 如果 review 只说“这里用了高级 API”，但不能说出 owner、runtime boundary、wrong alternative 和 observable evidence，就还没有达到本章目标。修正方式是把每个 API choice 写成 scenario-based decision row。

<a id="section-9-14"></a>

### 9.14 最终小项目：SellerHub API Gap Lab

**结论：** `SellerHub API Gap Lab` 是本章机制整合练习。它仍是 client-side Vite React lab，不运行 RSC，不运行 server-only cache，不配置 React Compiler，不安装 external state library，也不安装 CSS-in-JS library。

**机制证据链：**

1. 用户进入 `/react/chapter-17`。
2. `src/App.tsx` lazy-load `Chapter17PracticeRoot`，root 组合各 section 和 final lab。
3. Lab 内部各模块分别 owning query state、external snapshot、generated IDs、layout refs、style element、imperative handle、effect event callback。
4. TypeScript 检查每个 module 的 props、snapshot、ref handle 和 test imports，但 runtime behavior 由 React/browser 执行。
5. UI 显示 deferred search、transition filter、inventory store、accessible form、layout measurement、CSS insertion boundary、imperative command、effect event audit、decision table。
6. 错误形式是把 final lab 当成新 capstone 并重写前 1-16 章。
7. 真实项目中，它对应的是“API gap review workspace”，不是 production SellerHub feature。

**真实练习文件：** `sellerhub-api-gap-lab/` 下所有文件，详见第 12 节。

**边界示例：**

| Lab capability | Demonstrated mechanism | Boundary kept honest |
| --- | --- | --- |
| Deferred product search | urgent input vs deferred result rendering | 不声称减少 network requests |
| External inventory store | stable snapshot and subscribe/unsubscribe | 不把 external mutable source 复制成多个 local states |
| Accessible filter form | generated DOM association IDs | 不把 generated ID 当 list key |
| API decision table | server/framework/diagnostic classification | 不执行 fake RSC cache 或 fake production diagnostics |

**执行过程：** `Chapter17PracticeRoot` 组合分节 panels 和 final lab；final lab 只集成本章已经讲过的机制。用户交互触发各自 owner：search state、external store、generated ID、layout ref、style rule、imperative handle、effect event callback。每个 owner 都有自己的 boundary，避免把 escape hatch 合并成一个不透明 capstone。

**识别同类问题：** 如果 final lab 增加新 API 但前面没有独立 `9.x` 解释，或把 boundary-only API 变成“已运行功能”，就违反本章修复目标。正确做法是先补分节教学，再让 final lab 只做整合。

## 10. API / 语法索引

| API | Layer | 本章用法 | 常见误用 |
| --- | --- | --- | --- |
| `useDeferredValue` | React scheduling | 让结果列表读取 deferred query | 当作 debounce 或 network throttle |
| `useTransition` | React scheduling | 标记 non-urgent state update 并显示 pending | 以为计算会变快 |
| `startTransition` | React scheduling | 在 event handler 中标记 update priority | 包住无关代码却漏掉目标 setter |
| `useSyncExternalStore` | External store boundary | 读取 stable snapshot 并订阅变更 | `getSnapshot` 每次返回新 object |
| `useId` | Accessibility / hydration | 连接 label、input、description | 生成 list key 或 database ID |
| `useDebugValue` | DevTools tooling | 标注 custom hook state | 当作 runtime state |
| `useLayoutEffect` | Commit / browser layout | commit 后 paint 前读取 DOM | 做慢计算或 fetch |
| `useInsertionEffect` | CSS library boundary | 插入 runtime style rule | 普通业务 effect |
| `useImperativeHandle` | Ref escape hatch | 暴露 focus/reset/scroll command | 暴露完整 DOM node |
| `useEffectEvent` | Effect subscription boundary | 在 subscription callback 读取 latest state | 隐藏真正 dependency |
| `cache` | Server / framework boundary | 只说明边界 | 当作 Vite client memo |
| `cacheSignal` | Server / framework boundary | 只说明边界 | 当作 browser AbortController 替代 |
| `captureOwnerStack` | Development diagnostic boundary | 只说明诊断用途 | 当作 production UI data source |

## 11. 常见错误表

| Error | Type | Violated Rule | Correction | How to Recognize Later |
| --- | --- | --- | --- | --- |
| 把 `useDeferredValue` 当 debounce | Concept error | deferred render 不是 fixed delay | 网络请求仍需单独控制 | 输入响应好但请求数没减少 |
| `getSnapshot` 每次返回新 object | Runtime contract error | snapshot identity 必须稳定 | 没变化时返回同一 snapshot | re-render 过多或 warning |
| 用 `useId` 生成 list key | Identity error | key 必须来自 data identity | 使用 domain id | list reorder 后 state 错位 |
| layout effect 做慢计算 | Performance error | layout effect blocks paint | 把非 layout work 放到 render memo 或 passive effect | 页面切换时卡顿 |
| insertion effect 做业务同步 | Boundary error | insertion effect 只处理 CSS insertion timing | 使用 `useEffect` 或 event handler | 数据逻辑藏在 style timing API |
| 暴露整个 DOM node | Encapsulation error | imperative handle 应最小化 command surface | 暴露具体方法 | parent 开始改 child 内部 DOM |
| 用 effect event 隐藏 dependency | React rule error | reactive synchronization 仍需 dependency | 只把 non-reactive event logic 放进去 | effect 不按条件重新同步 |
| 在 Vite client 中伪造 server cache | Runtime boundary error | server-only semantics 不存在 | 写 boundary note，等待 framework runtime | client demo 和官方 server 行为不一致 |

## 12. 最终小项目

最终小项目只用于整合本章机制，不替代前面的分节教学。每个 API 的核心机制已经在 9.1-9.14 中独立解释；这里把它们组合到一个 SellerHub lab。

### 12.1 项目目标

`SellerHub API Gap Lab` 目标是把 official API gaps 放进一个可运行的 Vite client workspace：

- deferred product search。
- transition filter workspace。
- external inventory store using `useSyncExternalStore`。
- accessible filter form using `useId`。
- layout measurement panel using `useLayoutEffect`。
- CSS insertion boundary using `useInsertionEffect`。
- imperative command panel using `useImperativeHandle`。
- effect event audit panel using `useEffectEvent`。
- decision table for when to use and when not to use each API。
- boundary note for `cache` / `cacheSignal` / `captureOwnerStack`。

### 12.2 最终小项目结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Final mini project structure</span>
  </div>

```txt
src/learning/react/chapter-17-official-api-gaps/sellerhub-api-gap-lab/
  sellerhub-api-gap-lab.tsx
  sellerhub-api-gap-data.ts
  deferred-product-search.tsx
  external-inventory-store.ts
  inventory-store-view.tsx
  accessible-filter-form.tsx
  layout-measured-panel.tsx
  imperative-command-panel.tsx
  effect-event-audit-panel.tsx
  api-gap-decision-table.tsx
  __tests__/
    external-inventory-store.test.ts
    deferred-product-search.behavior.test.tsx
    accessible-filter-form.test.tsx
    sellerhub-api-gap-lab.integration.test.tsx
```
</div>

### 12.3 文件职责

| File | Responsibility |
| --- | --- |
| `sellerhub-api-gap-lab.tsx` | 组合最终小项目模块。 |
| `sellerhub-api-gap-data.ts` | 提供 product data、category union 和 filter function。 |
| `deferred-product-search.tsx` | 用 `useDeferredValue` 让 product results 读取 deferred query。 |
| `external-inventory-store.ts` | 提供 external snapshot、subscribe、server snapshot 和 mutation functions。 |
| `inventory-store-view.tsx` | 用 `useSyncExternalStore` 接入 external store。 |
| `accessible-filter-form.tsx` | 用 `useId` 连接 label、input 和 help text。 |
| `layout-measured-panel.tsx` | 用 `useLayoutEffect` 读取 DOM measurement。 |
| `imperative-command-panel.tsx` | 用 `useImperativeHandle` 暴露 focus / clear command。 |
| `effect-event-audit-panel.tsx` | 用 `useEffectEvent` 在 subscription callback 读取 latest state。 |
| `api-gap-decision-table.tsx` | 显示 API choice 与 boundary note。 |

### 12.4 完整代码定位

完整可运行代码已经放在第 12.2 的真实文件中。这里不把所有 TSX 重复粘贴成第二份 source of truth；学习时应以真实文件为准，并配合本指南的机制说明阅读。需要检查完整实现时，从 `sellerhub-api-gap-lab.tsx` 入口进入，再按组件 import 顺序逐个阅读。

### 12.5 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run dev
```
</div>

然后打开：

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Output</span>
  </div>

```txt
/react/chapter-17
```
</div>

### 12.6 预期输出或交互结果

页面应显示 `SellerHub API Gap Lab`，并包含 `Deferred product search`、`Transition filter workspace`、`Inventory store view`、`Accessible filter form`、`Layout measured panel`、`CSS insertion boundary`、`Imperative command panel`、`Effect event audit panel` 和 `API gap decision table`。

### 12.7 核心执行流程

1. `src/App.tsx` 识别 `/react/chapter-17` 并 lazy-load `Chapter17PracticeRoot`。
2. Root 页面先显示 API boundary map，再显示 runnable client API sections。
3. `SellerHubApiGapLab` 组合所有最终小项目模块。
4. product search 使用 deferred query 过滤 data array。
5. inventory view 使用 external store snapshot identity。
6. accessible form 使用 generated IDs 建立 DOM relationship。
7. layout panel、CSS insertion panel、imperative command panel 和 effect event audit panel 分别展示 escape hatch boundary。
8. decision table 明确 server/diagnostic APIs 不在当前 Vite client runtime 中伪造执行。

### 12.8 常见错误与可选扩展

常见错误：

- 把 final lab 继续扩展成新 capstone，导致本章变成业务功能重写。
- 把 `cache` 和 `cacheSignal` 写成 client fetch cache。
- 为了展示 `useInsertionEffect` 安装 CSS-in-JS library。
- 测试时查询 className，而不是 role、label 或 text。

可选扩展必须仍然遵守本章边界：可以增加更多 decision rows 或更多 accessible field variants，但不要新增依赖、不要迁移到 Next.js、不要重写第 1-16 章。

## 13. 额外速查表

| Concept | One-sentence memory |
| --- | --- |
| `useDeferredValue` | 延后 value consumption，形成可接受的 stale UI。 |
| `useTransition` | 标记 update priority，并通过 pending boundary 表达非紧急更新。 |
| `useSyncExternalStore` | 让 React 通过 stable snapshot 和 subscription 读取外部 mutable source。 |
| `useId` | 生成 accessibility relationship IDs，不生成 list keys。 |
| `useDebugValue` | 为 custom hook 提供 DevTools label，不改变 runtime UI。 |
| `useLayoutEffect` | commit 后 paint 前读取或修正 DOM。 |
| `useInsertionEffect` | CSS insertion timing 的 library boundary。 |
| `useImperativeHandle` | 暴露最小 imperative command surface。 |
| `useEffectEvent` | 在 effect subscription 中读取 latest value，但不扩大 dependency。 |

## 14. 工程迁移与代码审查要点

### Code review questions

- 这个 API 是否解决了真实边界问题，还是只是因为官方文档里存在？
- 是否已有普通 props、state、effect 或 memo 能更简单解决？
- 该 API 是 client runnable、framework-only、server-only，还是 diagnostic-only？

### Migration checks

- 引入 escape hatch 前先写下症状、证据、替代方案和回退计划。
- 把 external store 接入点限制在小边界，避免全应用直接读取。
- 对 framework/server-only API 保持诚实标注，不在 Vite client 代码里伪造运行。

### Production risk signals

- 输入卡顿但结果可延后，考虑 deferred value 或 transition。
- 浏览器外部事件源和 React UI 不一致，检查 external store contract。
- imperative ref 扩散到多层组件，说明组件数据流可能需要重构。

## 15. 如何转换成个人笔记

建议按边界整理，而不是按 API 字母顺序整理：

1. Scheduling：`useDeferredValue`、`useTransition`、`startTransition`。
2. External store：`useSyncExternalStore`。
3. Accessibility / DevTools：`useId`、`useDebugValue`。
4. DOM / CSS timing：`useLayoutEffect`、`useInsertionEffect`。
5. Escape hatch：`useImperativeHandle`、`useEffectEvent`。
6. Server / diagnostic boundary：`cache`、`cacheSignal`、`captureOwnerStack`。

每个笔记条目都写三行：适用场景、数据/identity/timing 机制、不该使用的场景。

## 16. 必须能回答的问题

1. 为什么 `useDeferredValue` 不是 debounce？
2. `useTransition` 改变的是计算速度还是 update priority？
3. 为什么 `getSnapshot` 不能每次返回新 object？
4. `useId` 为什么不能用作 list key？
5. `useDebugValue` 为什么不会改变 UI？
6. `useLayoutEffect` 为什么可能阻塞 paint？
7. `useInsertionEffect` 为什么主要是 CSS library boundary？
8. `useImperativeHandle` 为什么应该暴露最小方法集？
9. `useEffectEvent` 和删 dependency array 的区别是什么？
10. 为什么当前 Vite client lab 不伪造 `cache` / `cacheSignal` 的 server behavior？

## 17. 最终记忆模型

第 17 章的核心不是“会背 API”，而是看到 API 后先问：它控制的是 value、update priority、external snapshot、DOM relationship、DevTools label、layout timing、CSS insertion timing、imperative command、effect subscription latest read，还是 server/diagnostic boundary？

判断 owner 和 boundary 后，再决定是否在当前 Vite client runtime 中写可运行代码。

## 18. 官方文档阅读清单

优先阅读：

- React API Reference：`useDeferredValue`、`useTransition`、`startTransition`、`useSyncExternalStore`。
- React Hooks Reference：`useId`、`useDebugValue`、`useLayoutEffect`、`useInsertionEffect`、`useImperativeHandle`、`useEffectEvent`。
- React Rules of React：Rules of Hooks、Components and Hooks must be pure。
- React API Reference boundary pages：`cache`、`cacheSignal`、`captureOwnerStack`。
- React DOM Reference：只用于理解 client root / hydration 与 `useId` boundary，不把本章扩展成 React DOM API 课。
- Vite Guide：只用于确认当前项目是 Vite client learning runtime，不运行 RSC/server-only APIs。

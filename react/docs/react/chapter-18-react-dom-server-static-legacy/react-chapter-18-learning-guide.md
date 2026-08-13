# React 第 18 章：React DOM、Server / Static APIs 与 Legacy API Reading

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
  - [9.1 React DOM 边界：React owner tree 与 browser DOM tree](#section-9-1)
  - [9.2 createPortal：DOM 位置改变但 React owner tree 不变](#section-9-2)
  - [9.3 flushSync：强制同步 DOM flush 的逃生口](#section-9-3)
  - [9.4 Resource Preloading APIs：preconnect、prefetchDNS、preload 与 preinit](#section-9-4)
  - [9.5 createRoot vs hydrateRoot：client root 与 hydration root](#section-9-5)
  - [9.6 Hydration mismatch reading：server HTML、client render 与 DOM 接管](#section-9-6)
  - [9.7 renderToString / renderToStaticMarkup：blocking server HTML boundary](#section-9-7)
  - [9.8 renderToPipeableStream / renderToReadableStream：streaming server rendering boundary](#section-9-8)
  - [9.9 Static APIs 与 resume boundary：prerender、resume 与 framework ownership](#section-9-9)
  - [9.10 React 19 removed DOM APIs：render、hydrate、findDOMNode 与替代方案](#section-9-10)
  - [9.11 createElement、Children、cloneElement：element object 与 legacy composition](#section-9-11)
  - [9.12 Component、PureComponent、createRef、forwardRef：class / legacy ref reading](#section-9-12)
  - [9.13 isValidElement 与 library boundary：验证 React element 而不是业务数据](#section-9-13)
  - [9.14 SellerHub DOM / server / legacy API mapping](#section-9-14)
  - [9.15 最终小项目：SellerHub DOM Boundary Lab](#section-9-15)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 为什么适合本章](#122-为什么适合本章)
  - [12.3 最终小项目结构](#123-最终小项目结构)
  - [12.4 文件职责](#124-文件职责)
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
| React DOM boundary | React owner tree controls component relationships; browser DOM tree controls physical nodes | React DOM renderer / browser platform | Explain why the Vite app starts from a DOM container and why React Native is outside this chapter | `src/learning/react/chapter-18-react-dom-server-static-legacy/01-dom-boundary/dom-owner-tree-panel.tsx` |
| Portal target | Component owner keeps state and context; portal target owns physical DOM placement | React reconciliation / browser DOM | Help desk modal escapes layout clipping without becoming a second root | `src/learning/react/chapter-18-react-dom-server-static-legacy/02-create-portal/portal-modal-boundary.tsx` |
| Synchronous DOM flush | Event owner requests an immediate commit for a narrow DOM timing need | React DOM escape hatch / browser layout | Scroll or measure after inserting an escalation note | `src/learning/react/chapter-18-react-dom-server-static-legacy/03-flush-sync/flush-sync-measurement-panel.tsx` |
| Resource hints | App shell or framework hints network, connection, fetch, or evaluation work | Browser preload scanner / React DOM resource APIs | Prepare likely seller dashboard resources without confusing them with lazy route splitting | `src/learning/react/chapter-18-react-dom-server-static-legacy/04-resource-preloading/resource-preloading-panel.tsx` |
| Client root vs hydration root | App entry or framework owns the root API choice | React DOM client / server-generated HTML boundary | Current Vite lab uses client root; SSR frameworks usually own hydration root | `src/learning/react/chapter-18-react-dom-server-static-legacy/05-client-hydration-root/client-hydration-root-map.tsx` |
| Server and static rendering APIs | Server or framework owns response streams, HTML strings, prerender, and resume | Node stream / Web stream / static generation runtime | Read API boundaries without faking SSR or static prerender in the browser | `src/learning/react/chapter-18-react-dom-server-static-legacy/07-server-rendering-blocking/server-rendering-boundary-panel.tsx` |
| Removed and legacy APIs | Migration owner decides whether to replace, wrap, or temporarily keep a legacy boundary | React 19 migration / library boundary | Audit old SellerHub plugins and replace removed APIs with modern roots, refs, and server APIs | `src/learning/react/chapter-18-react-dom-server-static-legacy/10-removed-dom-apis/removed-dom-api-migration-panel.tsx` |

## 0. 本章工程问题与边界

本章解决的是官方 API 覆盖中的最后一类混淆：React DOM API 不是普通业务组件 API；`react-dom/client` 根 API 通常只在入口或 framework adapter 中出现；`react-dom/server` 与 `react-dom/static` 是 server、build 或 framework runtime 的边界；Legacy React APIs 主要用于读旧代码、维护 library boundary 和迁移判断。

当前项目是 Vite client React lab。它可以诚实运行 `createPortal`、`flushSync`、resource preloading API、legacy element reading panel 和 migration table；它不创建真实 SSR server，不配置 React Server Components，不运行 server stream response，也不配置 static prerender / resume pipeline。把 server/static API 放进浏览器组件里“展示运行结果”，会把 runtime ownership 教错。

本章也不重教 `useState`、`useEffect`、`useMemo`、`useCallback`、`useReducer`、Context、Suspense、lazy、Profiler、Actions、Compiler、`useDeferredValue`、`useTransition`、`useSyncExternalStore`、`useId`、`useDebugValue`、`useLayoutEffect`、`useInsertionEffect`、`useImperativeHandle` 或 `useEffectEvent`。这些机制已经在前面章节出现；本章只在它们和 DOM/server/legacy API 边界发生关系时引用。

## 1. 本章解决的问题

完成前 17 章后，学习者通常已经能写 React 组件、路由、表单、测试和 SellerHub capstone。剩下的问题是读官方 API Reference 或旧代码库时容易误判 API 层级：

1. 看到 `createPortal`，误以为它创建了另一个 React root。
2. 看到 `flushSync`，误以为它是“让 state 立即更新”的常规模式。
3. 看到 `preload` / `preinit`，误以为它们等同于 React `lazy`、Vite chunk split 或普通浏览器缓存。
4. 看到 `hydrateRoot`，误以为任何 client app 都应该换掉 `createRoot`。
5. 看到 `renderToPipeableStream`、`prerender` 或 `resume`，误以为可以直接在 Vite client page 中跑 SSR。
6. 看到 `Children`、`cloneElement`、class component 或 `forwardRef`，无法判断是需要迁移的遗留模式，还是 library boundary 的兼容层。
7. 看到 React 19 删除的 DOM API，不能快速映射到 `createRoot`、`hydrateRoot`、`root.unmount()`、explicit refs 或现代 server APIs。

## 2. 前置概念

- React owner tree：组件之间的所有权、context、event propagation 和 render snapshot 关系。
- Browser DOM tree：真实 DOM node、container、focus、layout、paint 与 resource loading 的宿主结构。
- Root API：`createRoot` 和 `hydrateRoot` 是应用入口或 framework adapter 边界，不是普通组件依赖。
- Hydration：server HTML 已存在时，client React 接管并绑定事件；第一次 client render 必须和 HTML 匹配。
- Browser resource hint：DNS、connection、preload、module preload、script/style preinit 属于浏览器资源调度，不属于 React component identity。
- Server runtime：Node stream、Web stream、HTTP response、headers、bootstrap scripts 和 postponed state 由 server/framework 拥有。
- Legacy reading：旧 API 不等于马上删除；迁移要看 library contract、consumer compatibility 和证据。

## 3. 学习目标

完成本章后，你应该能够：

1. 解释 React owner tree 与 browser DOM tree 为什么不是同一棵树。
2. 使用 `createPortal` 建立 modal/tooltip 这类 DOM escape，同时说明 event 仍按 React tree 传播。
3. 判断 `flushSync` 是否真有第三方 DOM timing 证据，而不是滥用同步 commit。
4. 区分 `preconnect`、`prefetchDNS`、`preload`、`preloadModule`、`preinit`、`preinitModule` 的资源层含义。
5. 解释当前 Vite app 为什么使用 client root，而普通组件为什么不应 import `createRoot`。
6. 根据 warning text 识别 hydration mismatch 的 server/client 差异来源。
7. 把 `renderToString`、`renderToStaticMarkup`、streaming server APIs、static APIs 和 resume APIs 标为 server/framework boundary。
8. 把 React 19 removed DOM APIs 映射到现代替代方案。
9. 读懂 `createElement`、`Children`、`cloneElement`、`Component`、`PureComponent`、`createRef`、`forwardRef`、`isValidElement` 的 legacy/library 语义。
10. 对 SellerHub 真实代码做 DOM/server/legacy API code review，而不是按 API 名称机械迁移。

## 4. 机制依赖图

这些依赖不是阅读顺序清单，而是本章判断成立的前置关系。

| First Understand | Then Understand | Dependency Reason | Failure If Skipped |
| --- | --- | --- | --- |
| React owner tree | Portal event propagation | Portal 只移动物理 DOM node，不改变组件 owner、context 和 React event path | 会把 portal 当成新 root，错误复制 provider 或 state |
| Batched update and commit | `flushSync` escape hatch | 只有知道普通更新如何被 React 排队和 commit，才能判断何时需要同步 flush | 会把所有 state update 包进 `flushSync`，破坏 scheduling |
| Browser resource loading | React DOM resource APIs | Resource APIs 只提示浏览器提前连接、抓取或执行资源 | 会把 `preloadModule` 当成 Suspense 或 Vite dynamic import |
| Empty client container | Hydration root | `hydrateRoot` 要求已有 server-generated matching HTML | 会在 CSR app 中错误 hydrate，导致 HTML 被重建或 warning |
| Server HTML ownership | Server/static APIs | Server stream、static prerender 和 resume 需要 response/build/framework owner | 会在浏览器 demo 中伪造 server API 执行 |
| React element object | Legacy composition APIs | `Children`、`cloneElement`、`isValidElement` 操作的是 element object，不是 DOM node 或业务数据 | 会用 element validator 代替 DTO/runtime data validation |
| React 19 migration boundary | Removed API replacements | Removed DOM APIs 需要按 root/ref/server boundary 替换 | 会盲目替换，破坏 library contract 或 hydration entry |

## 5. 核心术语表

| Term | 中文说明 | Layer | Why It Matters |
| --- | --- | --- | --- |
| React owner tree | React 组件所有权、context 和 event propagation 的逻辑树 | React renderer | 解释 portal 为什么不等于新 root |
| Browser DOM tree | 浏览器中真实 node 的物理结构 | Browser platform | 决定 focus、layout、paint 和 portal target |
| DOM container | React root 或 portal 放置内容的真实 DOM node | React DOM / browser | `createRoot`、`hydrateRoot` 和 `createPortal` 都需要真实 container |
| Portal target node | portal children 被放置的 DOM node | React DOM API | 改变物理位置，不改变 owner tree |
| Synchronous DOM flush | 强制 React 在 callback 内同步提交 DOM 的逃生口 | React DOM escape hatch | 用于第三方 DOM timing，不是常规更新模式 |
| Resource hint | 提示浏览器提前准备资源的信号 | Browser preload scanner | 与 component rendering、lazy chunk loading 分层 |
| Client root | 由 `createRoot` 管理的 client-rendered React root | React DOM client | 当前 Vite app 的入口边界 |
| Hydration root | 由 `hydrateRoot` 接管已有 server HTML 的 root | SSR / hydration boundary | framework 或 server-rendered app 才通常需要 |
| Node stream | Node.js response 可 pipe 的 stream | Server runtime | `renderToPipeableStream` 所属边界 |
| Web stream | Web/edge runtime 的 `ReadableStream` | Web runtime | `renderToReadableStream` 所属边界 |
| Static prerendering | build/server 阶段生成 static HTML | Static API boundary | 不是普通 browser component API |
| Resume boundary | 继续 postponed prerender / server render 的 runtime boundary | Framework/server runtime | 需要 framework ownership |
| Legacy API | React 保留但不推荐新业务代码优先使用的 API | React API reading | 服务迁移、library boundary 和旧代码阅读 |
| React element object | JSX 或 `createElement` 产出的普通对象描述 | React object model | `isValidElement` 验证的是它，不是业务数据 |

## 6. 底层心智模型

本章可以用四层来记：

1. **Browser DOM layer**：真实 node、container、focus、layout、paint、resource hints 都属于浏览器宿主层。React DOM 是 React 针对 web DOM 的 renderer，不适用于 React Native。
2. **React owner layer**：组件 owner tree 决定 context、event bubbling、state owner、render snapshot 和 ref ownership。Portal 只让某段 DOM 离开当前物理位置，但仍属于原来的 React owner tree。
3. **Root / hydration layer**：`createRoot` 接管空 client container；`hydrateRoot` 接管 server/build 生成的匹配 HTML。多数业务组件不应该知道 root API。
4. **Server/static/legacy reading layer**：server APIs 和 static APIs 需要 server/framework/build runtime；legacy APIs 需要 migration judgment。读懂这些 API 的目标是做正确边界判断，而不是把所有 API 都搬进 Vite client 练习。

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
  tsconfig.app.json
  vitest.config.ts
  src/App.tsx
  src/site/data/learning-manifest.ts
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
docs/react/chapter-18-react-dom-server-static-legacy/
  react-chapter-18-learning-guide.md
```
</div>

### 本章真实练习结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Chapter 18 practice structure</span>
  </div>

```txt
src/learning/react/chapter-18-react-dom-server-static-legacy/
  chapter-18-practice-root.tsx
  chapter-18-practice.css
  01-dom-boundary/
  02-create-portal/
  03-flush-sync/
  04-resource-preloading/
  05-client-hydration-root/
  06-hydration-mismatch/
  07-server-rendering-blocking/
  08-server-streaming/
  09-static-resume-boundary/
  10-removed-dom-apis/
  11-legacy-element-composition/
  12-class-ref-legacy/
  13-valid-element-boundary/
  14-sellerhub-dom-server-legacy-map/
  sellerhub-dom-boundary-lab/
```
</div>

### 概念示例结构

本章主要使用真实练习文件。文档中的 snippet 只服务机制解释，不代表需要创建项目文件。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Conceptual snippets</span>
  </div>

```txt
Snippet: root choice matrix
Snippet: hydration mismatch warning reader
Snippet: legacy cloneElement data-flow risk
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

打开 Vite 输出的本地 URL 后，进入 `/react/chapter-18`。本章练习只在浏览器中运行 client-side panels；server/static APIs 以 boundary cards 方式展示，不生成 HTTP response，不执行 stream，不配置 framework。

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 React DOM 边界：React owner tree 与 browser DOM tree

**结论：**

React DOM 是 React 针对 web browser DOM 的 renderer。React owner tree 解释组件、context、event、state owner；browser DOM tree 解释真实 node、container、focus、layout 和 paint。二者相关，但不是同一层。

**机制证据链：**

触发动作是 `createRoot(container).render(<App />)` 或 root component 的一次 state update；JavaScript runtime 读取 `container` 这个真实 `HTMLElement` 引用，并调用 React DOM client API；React 在 owner tree 中记录 component、props、state snapshot 和 child relationship；TypeScript 只检查 `container` 可能是 DOM element，不会在 runtime 证明 HTML 中一定有对应节点；最终浏览器看到的是 React DOM renderer commit 到 DOM tree 的 nodes。错误形式是把 DOM node 位置当作组件 owner 关系，例如认为移动 DOM 就会移动 context owner；真实项目中可通过“event/context 路径和 DevTools DOM 路径不一致”识别。

**真实练习：**

`dom-owner-tree-panel.tsx` 把两棵树并排展示：左边是 React owner tree，右边是 browser DOM tree。它不引入新 hook，只要求你把“组件谁拥有谁”和“节点放在哪里”分开说清。

**常见错误为什么错：**

把 React DOM 当成所有 React 平台都支持的 API 是错误的。React DOM 官方边界是 web apps running in browser DOM environment；React Native 没有 browser DOM container、`document.body` 或 DOM layout。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | “这个 component 在 DOM 里被 portal 移走了，所以 context owner 也变了。” | DOM placement 不等于 React owner tree；context/event/state 仍按 React tree 解释 |
| Correct | “这个 node 放在 `document.body`，但它仍由原 component render，并读取原 provider context。” | React DOM renderer 只负责把 React output commit 到 browser DOM |

**执行过程补充：** root container 是 React DOM 与 browser DOM 的接缝；root 以下的 component ownership 由 React fiber/owner relationship 描述，真实 node 的 focus、layout、paint 由 browser 描述。真实项目里同时打开 React DevTools tree 和 Elements panel，路径不同不是 bug，而是两层模型不同。

<a id="section-9-2"></a>

### 9.2 createPortal：DOM 位置改变但 React owner tree 不变

**结论：**

`createPortal(children, domNode, key?)` 只改变 `children` 的物理 DOM 放置位置。Portal 内容仍然是调用它的 component 的 React child：它保留 context、owner state 和 React event propagation。

**机制证据链：**

触发动作是用户点击 `Open portal modal`；JavaScript runtime 调用 handler，把 `isOpen` 更新为 `true`；下一次 render 返回一个 portal React node，里面包含 dialog JSX 和目标 `document.body`；React reconciliation 仍把这个 portal 作为 owner component 的 render output；React DOM commit 阶段把 dialog DOM nodes 插入 `document.body`；TypeScript 只检查 `domNode` 类型是 DOM `Element`，不会验证 focus trap 或 aria 完整性；点击 portal 内部按钮时，事件按 React tree 向 owner 冒泡，而不是按 physical DOM parent 判断。错误形式是为了 modal 创建第二个 root；真实项目中表现为 provider 丢失、重复 app state、modal 无法读取原 context。

**真实练习：**

`portal-modal-boundary.tsx` 用 portal 展示 modal。`PortalHelpDeskModal` 在最终小项目中把同一机制放进 SellerHub help desk 场景。

**可访问性边界：**

Portal 解决的是 physical placement，不自动解决 focus management、escape key、aria relationship 或 background inertness。modal code review 仍要检查 `role="dialog"`、`aria-modal`、可聚焦 close button、初始 focus 和关闭后 focus restore。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 为 modal 调用 `createRoot(document.body).render(<Modal />)` | 第二个 root 会切断原 owner tree、provider 和 app state ownership |
| Correct | 原 component 返回 `createPortal(<Dialog />, document.body)` | Portal 只改变 DOM target，不改变 React parent-child ownership |

**执行过程补充：** click 打开 modal 后，`isOpen` state 仍属于 opener component；React reconciliation 仍处理 opener 的 returned children；commit 阶段把 dialog DOM 插入 portal target。事件从 portal child 回到 React owner path，所以 context、error boundary 和 event handler 仍按 React tree 工作。

<a id="section-9-3"></a>

### 9.3 flushSync：强制同步 DOM flush 的逃生口

**结论：**

`flushSync(callback)` 强制 React 同步执行 callback 内的 updates 并立即更新 DOM。它是最后手段，常用于第三方 browser API 或 UI library 要求“callback 返回前 DOM 已更新”的场景，不是常规 state update pattern。

**机制证据链：**

触发动作是用户点击 `Add escalation and measure`；JavaScript runtime 进入 handler，并在 `flushSync` callback 内调用 setter；React 立即处理这次 update queue、重新调用 owner component、commit 新 list item；callback 返回后，handler 读取 `listRef.current.getBoundingClientRect()`；TypeScript 只知道 ref 可能是 `HTMLUListElement | null`，不会保证 layout 数值非零；最终 measurement 发生在 commit 之后。错误形式是在 render、effect 或每个 click 中习惯性包 `flushSync`；真实项目中可通过 Suspense fallback 意外重现、interaction 变慢、batched update 被打断来识别。

**真实练习：**

`flush-sync-measurement-panel.tsx` 与 `flush-sync-scroll-panel.tsx` 都只把 `flushSync` 包在一个窄 update 上，然后立刻做 DOM measurement 或 scroll。练习文本明确标注它是 escape hatch。

**对比情况：**

普通 React state update 允许 batching 和 scheduling；如果后续逻辑不依赖“马上可读的 DOM”，就不应该使用 `flushSync`。如果只是要根据 state 计算值，应回到 render snapshot、derived data 或 ref timing，而不是强制同步 DOM。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 所有 click handler 都写 `flushSync(() => setState(...))` | 破坏 React batching 和 scheduling，可能让 interaction 变慢 |
| Correct | 只在“update 后马上调用 browser API 读取/滚动/测量新 DOM”时包住那个 update | `flushSync` 是 browser integration escape hatch，不是常规 render pattern |

**执行过程补充：** `flushSync` callback 中的 setter 会被立即 flush；callback 返回后，DOM 已经包含新节点，handler 才读取 `ref.current`。如果后续逻辑只需要 next state value，应该通过 functional update、derived data 或 effect，而不是强迫 DOM commit。

<a id="section-9-4"></a>

### 9.4 Resource Preloading APIs：preconnect、prefetchDNS、preload 与 preinit

**结论：**

React DOM resource preloading APIs 是资源提示（resource hint）边界。`prefetchDNS`、`preconnect` 准备连接；`preload`、`preloadModule` 提前抓取资源；`preinit`、`preinitModule` 可以提前抓取并执行 script/module 或插入 stylesheet。它们不是 React lazy，不是 Vite dynamic import，也不是浏览器缓存本身。

**机制证据链：**

触发动作是 app shell 或事件 handler 判断某个 seller dashboard 资源很可能需要；JavaScript runtime 调用 `preconnect("https://cdn...")` 或 `preload("/asset.css", { as: "style" })`；React DOM 把这个意图转换为浏览器可理解的资源提示；browser preload scanner / connection layer 开始 DNS、TCP/TLS、fetch 或 evaluation 工作；React component tree 没有因此加载另一个 component，也没有建立 Suspense boundary；TypeScript 检查 options shape，例如 `as` 的可选值，但不会验证 URL 是否真的存在。错误形式是把 `preloadModule` 当成 `lazy(() => import(...))` 的替代；真实项目中可通过 network waterfall：资源更早出现但 component render path 未改变来识别。

**真实练习：**

`resource-preloading-panel.tsx` 和 `resource-preload-decision-panel.tsx` 展示什么时候考虑 resource hints。当前 Vite app 可以调用这些 client APIs，但 production 中通常由 framework、HTML shell 或 route loader 决定更合适。

**与 Vite 的关系：**

Vite 负责 module graph、dev server transform 和 production build chunks。Resource hints 只影响浏览器何时连接、下载或执行某个资源；它不会把一个 module 加进 Vite graph，也不会替你创建 route-level code split。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 用 `preload('/orders.json', { as: 'fetch' })` 代替 application data fetching lifecycle | resource hint 只提示 browser fetch，不建立 React request state、error state 或 cache ownership |
| Correct | 对字体、style、script、module 等可预测资源使用 hint；业务数据仍用明确 request model | resource loading boundary 与 application data boundary 分离 |

**执行过程补充：** hint API 返回 `void`；它不会返回 resource content，也不会让 component suspend。TypeScript 能检查 options，但真实效果要用 Network panel waterfall 或 server headers 检查。

<a id="section-9-5"></a>

### 9.5 createRoot vs hydrateRoot：client root 与 hydration root

**结论：**

`createRoot(domNode)` 用于 client-rendered app：React 接管一个 DOM container 并从 client JS 渲染 UI。`hydrateRoot(domNode, reactNode)` 用于已有 server-generated HTML 的 app：React 绑定事件并接管匹配 HTML。当前 Vite lab 正常使用 `createRoot`。

**机制证据链：**

触发动作是 app entry 读取 `document.getElementById("root")`；JavaScript runtime 得到 DOM container；`createRoot` 创建 root object，`root.render(<App />)` 让 React DOM 管理该 container 内的内容；TypeScript 可提醒 `getElementById` 可能返回 null，但不会保证 HTML 已由 server 渲染；如果 container 是空的，client root 正确；如果 container 里是 React server HTML，则应使用 `hydrateRoot`，否则旧 HTML 可能被清空重建。错误形式是在没有 server HTML 的 CSR app 中使用 hydrate；真实项目中可通过 hydration warning、HTML 重建、事件绑定异常识别。

**真实练习：**

`client-hydration-root-map.tsx` 和 `client-hydration-boundary-card.tsx` 只展示 root selection matrix，不在普通 component 中调用 root API。

**组件边界：**

多数业务组件不 import `createRoot` 或 `hydrateRoot`。它们只返回 JSX，由 root 或 framework 调用链负责最终渲染。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 在普通 feature component 内部调用 `createRoot` 来显示 tooltip | root API 是 entry/island ownership 边界，不是 child rendering 工具 |
| Correct | 单入口 app 使用 `createRoot(container).render(<App />)`；hydrated app 使用 `hydrateRoot(container, <App />)` | root selection 由 HTML ownership 和 server markup 是否存在决定 |

**执行过程补充：** `createRoot` 创建 root object 后，后续 unmount 也应由该 root object 执行；`hydrateRoot` 则要求 container 已经包含 React server/build 生成且可匹配的 DOM。没有 server markup 时使用 hydrate，会把 hydration boundary 教错。

<a id="section-9-6"></a>

### 9.6 Hydration mismatch reading：server HTML、client render 与 DOM 接管

**结论：**

Hydration mismatch 意味着 server HTML 与第一次 client render 结果不一致。React 文档要求把 mismatch 当作 bug 处理；`suppressHydrationWarning` 只适合非常窄、不可避免的文本差异，不是隐藏所有不一致的工具。

**机制证据链：**

触发动作是浏览器加载 server HTML 后执行 client bundle；JavaScript runtime 调用 `hydrateRoot(container, <App />)`；React 读取已有 DOM nodes，并把本次 client render 的 expected tree 与它们匹配；TypeScript 只能检查 JSX 和 props 类型，不能证明 server 与 client 同时刻、同 locale、同 browser state；如果 render 中使用 `Date.now()`、`Math.random()`、locale formatting 或直接读 `window.localStorage`，server 和 client 可能产出不同 text；最终表现是 hydration warning、attribute 不一定被修补、或 root 切换 client rendering。真实项目中先从 warning path、server log、client first render input 和 browser-only read 查起。

**真实练习：**

`hydration-mismatch-reader.tsx` 用 reader table 解释 mismatch 原因。它不创建 SSR output，因为当前项目没有 server runtime。

**常见错误为什么错：**

在 Vite client panel 中手写一个 HTML string 然后声称“这就是 SSR hydration”是错误教学。真实 hydration 需要 server/build 生成的 HTML、matching client component tree、bootstrap scripts 和 `hydrateRoot` entry。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | Shared render 中直接输出 `Date.now()`、`Math.random()` 或 browser-only storage value | 第一次 server HTML 与第一次 client render 必须 deterministic match |
| Correct | Server 序列化稳定数据，或把 browser-only value 移到 client effect 后再显示 | Hydration 接管需要一致初始 tree；差异必须被隔离 |

**执行过程补充：** server 输出 HTML 时没有 browser local state；client hydration 时如果第一次 render 读到另一个值，React 看到的 expected tree 与 existing DOM 不一致。TypeScript 对日期、随机数和 storage read 没有 mismatch 保护；识别信号是 hydration warning、client-only fallback 或 UI 首屏闪烁。

<a id="section-9-7"></a>

### 9.7 renderToString / renderToStaticMarkup：blocking server HTML boundary

**结论：**

`renderToString` 和 `renderToStaticMarkup` 属于 server rendering API。前者生成可配合 hydration 的 HTML string；后者生成 non-interactive static markup，不能 hydrate。它们都是 blocking output，能力弱于现代 streaming/static APIs。

**机制证据链：**

触发动作是 server route handler 收到 request；JavaScript runtime 在 Node 或其他 server runtime 调用 `renderToString(<App />)`；React server renderer 遍历 React tree 并返回 HTML string；server response owner 决定 headers、document shell、script tags 和发送时机；TypeScript 可检查 JSX element 类型，但不会提供 HTTP server、request object 或 response pipe；client 若要接管 interactive app，还必须加载 bundle 并调用 `hydrateRoot`。错误形式是在浏览器组件中 import `react-dom/server` 然后把 string 插进 DOM，声称完成 SSR；真实项目中可通过“没有 server response、没有 hydrate entry、没有 matching request path”识别。

**真实练习：**

`server-rendering-boundary-panel.tsx` 只解释 blocking server APIs，不执行 server render。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 在 browser component 中 `renderToString(<Card />)` 再塞进 `innerHTML`，并称为 SSR | SSR 是 server response ownership，不是 client-side string serialization |
| Correct | 把 `renderToString` 放在 server route/build pipeline 中，并配合 document shell、scripts 和 hydration entry | server renderer 的输出必须由 HTTP/build owner 发送或保存 |

**执行过程补充：** blocking server renderer 一次性返回 string；它不能等待 suspended data，也不能提供 streaming shell。真实项目若有 SSR，应检查 request path、headers、HTML shell、bootstrap script 和 hydrate root，而不是只看是否调用了 API。

<a id="section-9-8"></a>

### 9.8 renderToPipeableStream / renderToReadableStream：streaming server rendering boundary

**结论：**

`renderToPipeableStream` 属于 Node.js Streams；`renderToReadableStream` 属于 Web Streams / edge-like runtime。Streaming server rendering 需要 response ownership、shell readiness、error handling、bootstrap scripts、Suspense boundary 和 hydration plan。

**机制证据链：**

触发动作是 server runtime 决定 stream React tree；JavaScript runtime 调用 streaming API 并传入 options；React server renderer 先生成 shell，再按 Suspense/data readiness 继续输出 chunks；Node response 或 Web `Response` 接收 stream；TypeScript 检查 options callback shape，但不会创建 server、headers 或 stream backpressure；client 侧随后用 `hydrateRoot` 接管 HTML。错误形式是在 Vite client component 中模拟 `onShellReady` 或 pipe；真实项目中可通过“代码是否拥有 HTTP response、是否设置 content-type、是否发送 bootstrap scripts”判断真假。

**真实练习：**

`server-streaming-boundary-panel.tsx` 把 Node stream 与 Web stream 分开展示，并说明当前 lab 只做 boundary map。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 在 client test 中 mock `onShellReady` 并宣称证明 streaming SSR | streaming SSR 需要 Node/Web stream response owner 和 browser hydration plan |
| Correct | 在 guide 中作为 boundary reading；未来若引入 server，再用 server integration tests 验证 stream behavior | client-only Vite lab 不拥有 response headers、pipe、abort 和 bootstrap lifecycle |

**执行过程补充：** streaming API 的关键 evidence 是 shell 何时 ready、error 如何处理、stream 如何 pipe、client 如何 hydrate Suspense boundary。没有这些 evidence，就只能是 architecture reading。

<a id="section-9-9"></a>

### 9.9 Static APIs 与 resume boundary：prerender、resume 与 framework ownership

**结论：**

`react-dom/static` 的 `prerender`、`prerenderToNodeStream`、`resumeAndPrerender`、`resumeAndPrerenderToNodeStream` 面向 static HTML generation。`react-dom/server` 的 `resume`、`resumeToPipeableStream` 继续 postponed rendering。它们需要 framework 或 build/server pipeline owner。

**机制证据链：**

触发动作通常是 build step、framework route worker 或 server handler；JavaScript runtime 调用 static 或 resume API，并携带 React tree、postponed state 或 stream options；React renderer 产出 static HTML 或继续某个 postponed render；framework 保存或传递 postponed state、决定缓存、headers 和 hydration bootstrap；TypeScript 可检查 API signature，但不会帮你实现 storage、routing、cache invalidation 或 deploy runtime；最终结果不应该由普通 Vite client component 伪造。错误形式是把 `prerender` 当成业务组件里的性能 hook；真实项目中可通过“是否有 build/server owner 和 HTML output lifecycle”识别。

**真实练习：**

`static-resume-boundary-panel.tsx` 只做 static/resume API reading，强调它不是 ordinary business component API。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 把 `prerender` 描述成 component-level performance hook | static API 发生在 build/server/framework pipeline，不发生在 normal client render |
| Correct | 把 static/resume 写成 framework ownership、build artifact 和 hydration/resume plan 的阅读边界 | static output、postponed state 和 resume context 需要真实 pipeline |

**执行过程补充：** static API 产物是 HTML/static stream/postponed state，而不是 JSX component 的 local state。识别信号是是否存在 route build step、artifact storage、cache invalidation 和 deployment path。

<a id="section-9-10"></a>

### 9.10 React 19 removed DOM APIs：render、hydrate、findDOMNode 与替代方案

**结论：**

React 19 删除或淘汰的 DOM/server APIs 必须按边界替换：`ReactDOM.render` -> `createRoot(...).render(...)`；`ReactDOM.hydrate` -> `hydrateRoot(...)`；`unmountComponentAtNode` -> `root.unmount()`；`findDOMNode` -> explicit refs；`renderToNodeStream` -> `renderToPipeableStream`；`renderToStaticNodeStream` -> static/modern server alternatives。

**机制证据链：**

触发动作是 migration audit 扫描旧入口或老 library；JavaScript runtime 以前直接调用 removed API；React 19 package 不再提供这些 DOM APIs 或不再支持旧行为；现代替代方案把 ownership 放到 root object、explicit ref 或 modern server stream；TypeScript 19 types 会让部分旧 API 缺失或类型不再通过，但运行时第三方库也可能继续调用不存在的方法；最终表现是 build/type error、runtime missing method 或 incompatible library warning。错误形式是不看 boundary 直接全局替换，例如把 hydration entry 改成 `createRoot`；真实项目中按 root type、server output、library owner 分组迁移。

**真实练习：**

`removed-dom-api-migration-panel.tsx` 和 `removed-api-migration-table.tsx` 用表格把 removed API、replacement、owner boundary 和 migration guidance 放在一起。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 搜到 `ReactDOM.hydrate` 就统一替换成 `createRoot` | hydration root 和 client root 不是同一边界 |
| Correct | 先判断旧入口是否有 server HTML；有则迁到 `hydrateRoot`，没有则迁到 `createRoot` | migration 要保留 root ownership semantics |

**执行过程补充：** migration audit 先分组：client root、hydration root、explicit ref、server stream、static rendering。每组再查 tests 和 runtime evidence。这样能避免“能编译但 hydration 被破坏”的迁移。

<a id="section-9-11"></a>

### 9.11 createElement、Children、cloneElement：element object 与 legacy composition

**结论：**

`createElement` 是 JSX 的对象模型替代写法；`Children` 和 `cloneElement` 用于处理收到的 opaque children 或基于已有 element 注入 props。React 文档把这些放在 legacy reading 区域，因为它们容易让 data flow 难追踪。

**机制证据链：**

触发动作是 library component 接收 `children`；JavaScript runtime 把 JSX 产物当成 React element object 传入；`Children.toArray` 把 opaque children 规范化为 array；`isValidElement` 缩小 runtime value；`cloneElement` 复制 element object 并 shallow merge props；React 在后续 render 中按新 element 描述渲染；TypeScript 可帮助声明 `ReactNode` / `ReactElement`，但不能保证 child 的业务 prop contract 正确；最终 UI 可工作，但 prop 来源变隐蔽。错误形式是在业务组件中大量 clone children 注入行为；真实项目中表现为“点击 handler 从哪里来”难追踪。

**真实练习：**

`legacy-element-composition-panel.tsx` 展示 `createElement`、`Children`、`cloneElement` 和 `isValidElement` 的 library boundary 读法。新业务代码优先考虑显式 props、render props、context 或 composition API。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | Feature component 用 `cloneElement(children, { onClick })` 给任意 child 注入业务行为 | prop source 变隐蔽，child contract 不可见，测试难定位 |
| Correct | Library boundary 可在确认 `isValidElement(child)` 后窄范围 clone；业务 feature 优先显式 props 或 render prop | legacy element APIs 适合 library adapter，不适合普通 data flow |

**执行过程补充：** JSX 创建 element object；`Children` 处理 opaque children；`cloneElement` 复制并合并 props，但不会调用 child component。真实项目里如果 bug 来自“child 收到的 prop 不知道从哪来”，优先检查 clone/injection boundary。

<a id="section-9-12"></a>

### 9.12 Component、PureComponent、createRef、forwardRef：class / legacy ref reading

**结论：**

Class component、`PureComponent`、`createRef` 和 `forwardRef` 仍然是读旧代码必须认识的 API。React 19 新代码更偏向 function components 和 ref as prop 边界，但迁移旧库时不能盲删兼容层。

**机制证据链：**

触发动作是旧 class component 接收 props 或调用 `this.setState`；JavaScript runtime 创建 class instance，并通过 `this.props`、`this.state`、lifecycle methods 管理对象状态；`PureComponent` 用 shallow comparison 跳过相同 props/state 的 render；`createRef` 产生 `{ current }` object，由 React commit 后填入；`forwardRef` 包装组件以转发 ref；TypeScript 可检查 class props/state/ref 类型，但不迁移 lifecycle side effects；最终迁移策略取决于 consumer API 和测试证据。错误形式是为了“现代化”一次性重写所有 class；真实项目中先建立行为测试、生命周期 side effect inventory 和 ref consumer list。

**真实练习：**

`class-ref-legacy-reader.tsx` 用小型 class/PureComponent/createRef panel 表示这些 API 的 reading boundary。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 为了现代化，一次性把 stable class library 重写成 hooks | migration 需要 behavior evidence；lifecycle side effects 和 public instance APIs 可能被破坏 |
| Correct | 先写 characterization tests，再逐个迁移 state/lifecycle/ref consumers | legacy reading 的目标是降低风险，不是炫耀新语法 |

**执行过程补充：** class instance 持有 `this.state`，function component 按 hook call position 持有 state cell；二者 runtime model 不同。TypeScript 可迁移类型，但不会自动迁移 lifecycle timing、instance method consumers 或 `PureComponent` shallow comparison 行为。

<a id="section-9-13"></a>

### 9.13 isValidElement 与 library boundary：验证 React element 而不是业务数据

**结论：**

`isValidElement(value)` 判断某个 runtime value 是否是 React element object。它不验证 component function，不验证 rendered DOM node，也不验证业务 DTO。字符串、数字、数组可能是 renderable React nodes，但不是 React elements。

**机制证据链：**

触发动作是 library component 收到 unknown `child` 或 plugin output；JavaScript runtime 持有任意 value；`isValidElement` 检查它是否是 JSX 或 `createElement` 产物；React 可把 element object 当作 render description；TypeScript 的 `ReactNode` / `ReactElement` 类型只服务 compile-time narrowing，不替代 runtime check；最终 table 显示 JSX element 为 true，string/array 为 false。错误形式是用 `isValidElement` 检查 API response 是否可信；真实项目中要用 DTO validator 或 runtime guard，而不是 React element validator。

**真实练习：**

`valid-element-boundary-panel.tsx` 对 JSX element、`createElement` result、string node 和 array node 做 runtime distinction。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | `isValidElement(MyComponent)` 期望 true | component function 是 callable value，不是已经创建的 React element object |
| Correct | `isValidElement(<MyComponent />)` 或 `isValidElement(createElement(MyComponent))` | 只有 JSX/createElement 产物才是 React element |
| Wrong | 用它验证 API payload shape | React element validation 不等于 business DTO validation | API payload 要用 runtime parser/type guard |

**执行过程补充：** `isValidElement` 检查的是 React element object tag，不检查 renderability 的全部范围。字符串可以被 React render，但不是 element；DOM node 是 browser object，也不是 React element。识别信号是 library boundary 收到 `unknown` children 时需要判断 element object。

<a id="section-9-14"></a>

### 9.14 SellerHub DOM / server / legacy API mapping

**结论：**

SellerHub 场景里，DOM/server/legacy API 的正确问题不是“能不能用”，而是“谁拥有这个边界”。Help desk modal 属于 portal/focus owner；scroll measurement 属于 flushSync escape hatch；dashboard resources 属于 resource hint owner；SSR/static cards 属于 framework boundary；legacy plugins 属于 migration boundary。

**机制证据链：**

触发动作是 code review 提出一个 API 使用点；JavaScript runtime 层可能是 DOM target、resource hint、root entry、server stream 或 legacy element object；React 层要确认 owner tree、root ownership、hydration ownership 或 element ownership；TypeScript 只能检查 API signature，不能证明边界选择合理；最终 review result 是保留、迁移、包 adapter 或拒绝。错误形式是按 API 名称一刀切；真实项目中要收集 Profiler/DOM timing/network waterfall/hydration warning/test failure/library consumer 证据。

**真实练习：**

`sellerhub-dom-server-legacy-map.tsx` 和最终 lab 的 decision table 把 API 映射到 SellerHub 的具体场景。

**错误边界与修正：**

| SellerHub scenario | Wrong choice | Correct boundary |
| --- | --- | --- |
| Help desk modal escapes clipping | Create a second app root | Use portal under the existing owner tree |
| Escalation note must scroll after insertion | `setTimeout` guess or global `flushSync` habit | Narrow `flushSync` only around the insertion |
| Future SSR/static evaluation | Fake server APIs in the client lab | Keep server/static APIs as reading boundary until a real server/build owner exists |
| Legacy plugin audit | Delete all legacy APIs blindly | Classify removed APIs, legacy adapters, and consumer contracts separately |

**执行过程补充：** SellerHub review 先从 UI 问题或迁移问题出发，再映射到 DOM placement、root ownership、hydration/server/static ownership 或 legacy library ownership。同一个 API 是否正确，取决于当前问题的 owner evidence，而不是 API 名称本身。

<a id="section-9-15"></a>

### 9.15 最终小项目：SellerHub DOM Boundary Lab

**结论：**

`SellerHub DOM Boundary Lab` 整合本章机制，但仍然是 Vite client lab。它运行 portal、flushSync 和 resource hint panels；它把 server/static APIs、removed APIs 和 legacy APIs 作为 boundary reading 和 migration table 呈现。

**机制证据链：**

触发动作是访问 `/react/chapter-18`；Vite client bundle 加载 Chapter 18 root；React render tree 组合 DOM boundary panels 和 final lab；portal modal 打开时，React owner state 控制 dialog，React DOM 把 DOM node 放到 `document.body`；flushSync panel 只在一个 event handler 中强制 commit；resource panel 只发送 browser resource hints；server/static cards 不调用 server renderer；TypeScript 检查 TSX props、table data 和 test imports，但不会运行 SSR；最终 UI 同时展示 runnable client mechanisms 和 boundary-only API reading。错误形式是把 boundary card 改成 fake server execution；真实项目中通过缺少 server response owner、stream owner 或 build pipeline 识别。

**项目边界声明：**

这个 lab 不创建真实 SSR server，不运行 React Server Components，不在浏览器中运行 `react-dom/server` streaming，不配置 static prerender/resume，不迁移到 Next.js。Legacy APIs 只用于阅读和迁移判断，不作为新业务代码首选模式。

**错误边界与修正：**

| Lab area | Wrong extension | Correct extension |
| --- | --- | --- |
| Portal modal | Treat portal as complete accessibility | Add focus restore, escape behavior, and inert/background review as separate accessibility work |
| Server/static cards | Add fake SSR execution to pass a checkbox | Keep boundary reading unless a real server or static pipeline is introduced by a future task |
| Legacy migration table | Delete old API examples because they are legacy | Keep examples as migration reading material while avoiding them in new feature code |

**执行过程补充：** final lab 应证明边界分离：可运行的 client DOM 机制有 interactive UI 和 tests；server/static/legacy topics 只提供 boundary cards、migration tables 和 review criteria。如果未来任务引入真实 SSR，本章是 reading baseline，不是当前实现本身。

## 10. API / 语法索引

| API / Syntax | Layer | Meaning | Common Mistake |
| --- | --- | --- | --- |
| `createPortal(children, domNode, key?)` | React DOM API | 把 children 的 DOM nodes 放到另一个 DOM node | 误以为它创建新 root |
| `flushSync(callback)` | React DOM escape hatch | 同步 flush callback 内 updates 并更新 DOM | 常规 state update 都包进去 |
| `prefetchDNS` / `preconnect` | Resource hint | 提前解析或连接资源域名 | 当成 module split |
| `preload` / `preloadModule` | Resource hint | 提前 fetch resource 或 ESM module | 当成 React `lazy` |
| `preinit` / `preinitModule` | Resource hint | 提前 fetch 并执行 script/module 或插入 style | 忽略 framework ownership |
| `createRoot` | React DOM client | 创建 client-rendered root | 用在已有 server HTML |
| `hydrateRoot` | React DOM client | 接管 server-generated HTML | 用在空 CSR container |
| `renderToString` | Server API | 返回 blocking HTML string | 在 browser component 中伪造 SSR |
| `renderToStaticMarkup` | Server API | 返回 non-interactive static markup | 期待后续 hydration |
| `renderToPipeableStream` | Server API | Node stream SSR | 在没有 response owner 时调用 |
| `renderToReadableStream` | Server API | Web stream SSR | 忽略 runtime ownership |
| `prerender` / `prerenderToNodeStream` | Static API | static HTML generation | 当成 business component helper |
| `resume` / `resumeToPipeableStream` | Server API | 继续 postponed render | 没有 postponed state owner |
| `Children` / `cloneElement` | Legacy API | 操作 opaque children 和 element object | 让 data flow 难追踪 |
| `isValidElement` | Legacy API | 判断 React element object | 用来验证业务数据 |

## 11. 常见错误表

| Error | Type | Violated Rule | Correction | How to Recognize Later |
| --- | --- | --- | --- | --- |
| Modal uses a second root | architecture | Portal changes DOM placement, not owner tree | Use `createPortal` from the owner component | Provider missing or duplicated state |
| Every click uses `flushSync` | performance | `flushSync` is a last-resort escape hatch | Keep normal updates batched unless DOM timing evidence exists | Interaction gets slower, Suspense fallback appears |
| `preloadModule` replaces dynamic import | resource boundary | Resource hint does not create React lazy boundary | Keep Vite dynamic import and use hints only for browser preload | Network starts earlier but component graph is unchanged |
| `hydrateRoot` in empty Vite page | root boundary | Hydration requires existing matching server HTML | Use `createRoot` for CSR | Hydration warning or root switches to client rendering |
| Browser panel runs `renderToPipeableStream` | runtime boundary | Node stream API needs server response ownership | Show boundary map or build a real server separately | No response headers or pipe target exist |
| `isValidElement` validates API data | runtime validation | React element check is not DTO validation | Use runtime data guard for API payloads | Strings or arrays behave differently than elements |
| Blind class component rewrite | migration | Legacy reading requires behavior evidence | Add tests, map lifecycle/ref consumers, migrate incrementally | Behavior changes without API evidence |

## 12. 最终小项目

最终小项目只用于整合本章机制，不替代前面的分节教学。任何在项目中出现的核心概念，都已经在对应 `9.x` 小节中先建立边界判断。

### 12.1 项目目标

`SellerHub DOM Boundary Lab` 让学习者在一个 Vite client page 中同时看到：

- portal help desk modal；
- flushSync scroll/measurement escape hatch；
- resource preload decision panel；
- client/hydration root boundary card；
- server/static API boundary card；
- legacy API reading panel；
- removed API migration table；
- DOM boundary decision table。

### 12.2 为什么适合本章

本章主题不是多写业务页面，而是把“可运行 client API”和“必须诚实标记的 server/static/legacy boundary”放到同一个 review surface 中。SellerHub 的 modal、dashboard resource、hydration card、legacy plugin audit 都是实际项目会遇到的 API 判断点。

### 12.3 最终小项目结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Final mini project structure</span>
  </div>

```txt
src/learning/react/chapter-18-react-dom-server-static-legacy/
  sellerhub-dom-boundary-lab/
    sellerhub-dom-boundary-lab.tsx
    sellerhub-dom-boundary-data.ts
    portal-help-desk-modal.tsx
    flush-sync-scroll-panel.tsx
    resource-preload-decision-panel.tsx
    client-hydration-boundary-card.tsx
    server-static-api-boundary-card.tsx
    legacy-api-reading-panel.tsx
    removed-api-migration-table.tsx
    dom-boundary-decision-table.tsx
```
</div>

### 12.4 文件职责

| File | Responsibility |
| --- | --- |
| `sellerhub-dom-boundary-lab.tsx` | 组合最终 lab 的八个 section，并声明 client-side Vite boundary |
| `sellerhub-dom-boundary-data.ts` | 保存 removed API、legacy API、resource hint 和 decision rows |
| `portal-help-desk-modal.tsx` | 用 `createPortal` 运行 help desk modal |
| `flush-sync-scroll-panel.tsx` | 演示窄范围 `flushSync` + scroll timing |
| `resource-preload-decision-panel.tsx` | 展示 resource hint decisions，并通过按钮请求 example hints |
| `client-hydration-boundary-card.tsx` | 对比 client root 与 hydration root |
| `server-static-api-boundary-card.tsx` | 只做 server/static APIs boundary reading |
| `legacy-api-reading-panel.tsx` | 展示 legacy APIs 的 reading/migration guidance |
| `removed-api-migration-table.tsx` | 把 removed APIs 映射到 modern replacements |
| `dom-boundary-decision-table.tsx` | 把 SellerHub scenarios 映射到 boundary decisions |

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

访问 `/react/chapter-18`。如果只验证行为测试，运行：

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
npm run test
```
</div>

### 12.6 预期输出或交互结果

- 点击 `Open SellerHub help desk` 后出现 `role="dialog"` 的 modal。
- 点击 `Close help desk` 后 dialog 消失。
- 点击 flushSync panel 的按钮后，列表增加 escalation note，并显示 escape-hatch status。
- Resource panel 显示 resource hints 和它们的边界说明。
- Server/static card 明确声明不运行 SSR、RSC、streaming 或 static prerender。
- Legacy panel 和 removed API table 显示迁移判断。

### 12.7 核心执行流程

1. `chapter-18-practice-root.tsx` 作为 route component 被 lazy loaded。
2. Root 先展示 DOM/client panels，再展示 server/static/legacy reading panels。
3. Final lab 组合八个 SellerHub boundary cards。
4. Portal modal 的 open state 由 lab 内部 component 拥有，但 dialog DOM node 放到 `document.body`。
5. flushSync panel 只把一条 note insertion 放进 synchronous flush，然后执行 scroll。
6. Resource panel 只请求 browser resource hints，不改变 React component graph。
7. Server/static cards 不调用 server APIs；它们只展示 runtime ownership。
8. Tests 用 role/text assertions 验证 modal、legacy guidance、removed replacements 和 final lab smoke path。

### 12.8 常见错误与可选扩展

常见错误：

- 为 modal 创建第二个 root，导致 provider 和 state owner 重复。
- 为了“保险”把所有 state update 都包进 `flushSync`。
- 把 resource hint 和 route-level lazy chunk 混为一谈。
- 在 client lab 中伪造 `renderToPipeableStream` 或 `prerender` 输出。
- 把 `cloneElement` 当作业务组件默认 composition 模式。

可选扩展：

- 为 portal 增加 escape key、focus trap 和 focus restore。
- 为 resource hint panel 增加 network waterfall reading exercise。
- 为 legacy API audit 增加 codemod checklist。
- 为 hydration card 增加真实 SSR framework 迁移前置 checklist，但不要在本 Vite lab 中伪造 framework runtime。

## 13. 额外速查表

### 一句话总结

React DOM APIs 处理 web DOM renderer、client root、portal、resource hint 和 emergency flush；server/static APIs 属于 server/build/framework runtime；legacy APIs 用于读旧代码和做迁移判断。

### 常用 API

| API | Use for | Avoid when |
| --- | --- | --- |
| `createPortal` | Modal, tooltip, overlay DOM escape | You only need normal nested layout |
| `flushSync` | Third-party DOM timing requires immediate commit | Ordinary React state update works |
| `preconnect` / `prefetchDNS` | Likely future external origin | The origin may never be used |
| `preload` / `preinit` | Critical known resources | Framework already handles resources |
| `createRoot` | Client-rendered app root | Server HTML already exists |
| `hydrateRoot` | Existing matching server HTML | Empty CSR container |
| `renderToPipeableStream` | Node SSR stream | Browser-only component |
| `prerender` | Static generation pipeline | Runtime business component |
| `cloneElement` | Library prop injection boundary | Ordinary explicit props are possible |

### 相似概念对比

| Pair | Difference |
| --- | --- |
| Portal vs root | Portal keeps owner tree; root creates an independent React tree |
| flushSync vs normal batching | flushSync commits immediately; batching lets React schedule work |
| preload vs lazy | preload hints browser fetch; lazy defines component code-splitting boundary |
| createRoot vs hydrateRoot | createRoot starts CSR; hydrateRoot attaches to server HTML |
| renderToString vs renderToStaticMarkup | renderToString can pair with hydration; static markup is non-interactive |
| isValidElement vs runtime data guard | isValidElement checks React element object; data guard checks business payload |

### 错误类型速查

| Symptom | Likely boundary issue |
| --- | --- |
| Modal cannot read provider state | Portal was replaced with a second root |
| Page slows after many updates | `flushSync` overuse |
| Hydration warning mentions text mismatch | Server/client first render differs |
| Removed method is undefined | React 19 removed DOM API still in code |
| Legacy wrapper hides click source | `cloneElement` prop injection obscures data flow |

### 最小模板

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Template: portal boundary</span>
  </div>

```tsx
import { createPortal } from 'react-dom'

export function ModalBoundary({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body)
}
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Template: client root</span>
  </div>

```tsx
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')

if (container) {
  createRoot(container).render(<App />)
}
```
</div>

## 14. 工程迁移与代码审查要点

### Code review questions

- 这个 API 是普通 component API、DOM escape hatch、root entry、server/static boundary，还是 legacy/library boundary？
- Portal 是否保持原 owner tree，并处理 focus、aria、escape key 和 close behavior？
- `flushSync` 前是否有第三方 DOM timing 证据？有没有普通 batching、ref timing 或 layout effect 替代方案？
- Resource hint 是否由 app shell/framework owner 统一管理？是否和 Vite module graph、React `lazy`、浏览器 cache 分开说明？
- `hydrateRoot` 是否有 server/build 生成的 matching HTML？是否有 hydration mismatch 监控？
- server/static API 是否真的运行在 server/build/framework runtime，而不是 browser component？
- legacy API 是否由 library contract 要求保留？是否已有测试覆盖迁移前行为？

### Migration checks

- 搜索 `ReactDOM.render`、`ReactDOM.hydrate`、`findDOMNode`、`unmountComponentAtNode`、`renderToNodeStream`、`renderToStaticNodeStream`。
- 将入口按 client root / hydration root 分组，再选择 `createRoot` 或 `hydrateRoot`。
- 将 DOM node access 从 `findDOMNode` 改为 explicit refs，并确认 owner component 真正拥有该 node。
- 对 class components 先建立 behavior tests，再拆 lifecycle side effects。
- 对 `cloneElement` wrappers 画出 prop injection data flow，确认是否能改成 explicit props、render props 或 context。
- 对 server/static API 使用点确认 runtime、response owner、bootstrap scripts、postponed state 和 deployment target。

### Production risk signals

- Modal 独立 root 导致 context/provider duplication。
- `flushSync` 包裹大量 updates 或出现在 effect/render 附近。
- Hydration warnings 被 `suppressHydrationWarning` 批量隐藏。
- Resource hints 散落在 leaf components，缺少 route/resource ownership。
- React 19 upgrade 后第三方库仍调用 removed DOM APIs。
- Element validation 被误用成 API data validation。
- Server/static API 出现在 client bundle 或 browser-only route 中。

### When to keep a legacy pattern

- 公开 component library 需要支持已有 consumers。
- Wrapper 必须接收 unknown `children`，且替代 API 会破坏插件生态。
- Class component 迁移风险高，已有测试不足，短期先加 adapter 更安全。
- `forwardRef` 仍服务旧版本 consumer 或库边界。

### When to refactor away

- 业务组件用 `cloneElement` 只是为了省 props drilling。
- `findDOMNode` 只是在访问自己能直接挂 ref 的 DOM node。
- class lifecycle 只是在同步普通 effect 或派生数据。
- `flushSync` 没有第三方 DOM timing 证据。
- server/static API 被放进 client route，只是为了展示“API 用过”。

### Evidence to collect

- Portal accessibility review 和 keyboard interaction evidence。
- DOM timing measurement before using `flushSync`。
- Network waterfall before adding resource hints。
- Hydration warning text、server render input、client first render input。
- React 19 type/build/runtime errors for removed APIs。
- Tests around old class/legacy/library behavior before migration。

## 15. 如何转换成个人笔记

建议把笔记拆成五张卡：

1. Portal card：owner tree、DOM placement、event propagation、accessibility。
2. flushSync card：normal batching、forced commit、third-party DOM timing、risk。
3. Resource hint card：DNS/connect/fetch/evaluate 与 lazy/Vite/cache 的区别。
4. Root/server/static card：createRoot、hydrateRoot、server APIs、static APIs、resume。
5. Legacy migration card：removed APIs replacements、legacy reading、library boundary exceptions。

每张卡都写一个“不能这么用”的反例。第 18 章最重要的学习不是背 API，而是在 code review 中说清 API 属于哪一层。

## 16. 必须能回答的问题

1. Portal 为什么不是第二个 React root？
2. Portal 中的事件为什么仍按 React tree 冒泡？
3. `flushSync` 会带来哪些 scheduling / Suspense / effect 风险？
4. `preloadModule` 和 React `lazy` 的边界差异是什么？
5. 当前 Vite app 为什么使用 `createRoot` 而不是 `hydrateRoot`？
6. Hydration mismatch 常见来源有哪些？
7. `renderToStaticMarkup` 为什么不能用于 interactive hydration？
8. Node stream 与 Web stream server APIs 的 runtime 差异是什么？
9. Static prerender 与 resume API 为什么需要 framework/build ownership？
10. React 19 中 `ReactDOM.render`、`hydrate`、`findDOMNode` 应如何替换？
11. `cloneElement` 为什么容易让 data flow 难追踪？
12. `isValidElement` 为什么不能验证业务数据？
13. 什么情况下 legacy API 可以暂时保留？
14. 迁移旧 class component 前需要哪些证据？
15. 为什么本章不在浏览器中伪造 SSR/static API 执行？

## 17. 最终记忆模型

React DOM chapter 的核心不是“所有 API 都要会写”，而是“API 属于哪一层”。`createPortal` 和 `flushSync` 是 web DOM renderer 的窄边界；resource APIs 是浏览器资源提示；`createRoot` / `hydrateRoot` 是 entry/framework boundary；server/static APIs 属于 server、build 或 framework runtime；legacy APIs 属于 reading/migration/library boundary。写新业务代码时先用普通 React data flow；只有证据指向 DOM placement、DOM timing、resource ownership、hydration ownership、server runtime 或 legacy contract 时，才引入这些 API。

## 18. 官方文档阅读清单

1. [React DOM APIs](https://react.dev/reference/react-dom)：先确认 `react-dom` 是 web DOM renderer，并阅读 `createPortal`、`flushSync` 与 resource preloading API 总览。
2. [createPortal](https://react.dev/reference/react-dom/createPortal)：重点看 portal 只改变 physical DOM placement，以及 events 按 React tree 冒泡。
3. [flushSync](https://react.dev/reference/react-dom/flushSync)：重点看 last resort、性能风险、pending work / Suspense / effects caveats。
4. [React DOM Client APIs](https://react.dev/reference/react-dom/client/createRoot) 与 [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)：对比 empty CSR container 与 server-generated matching HTML。
5. [Server React DOM APIs](https://react.dev/reference/react-dom/server)：总览 Node stream、Web stream、legacy non-streaming APIs。
6. [Static React DOM APIs](https://react.dev/reference/react-dom/static)：理解 static prerender 和 resume-and-prerender 的 framework/build boundary。
7. [Legacy React APIs](https://react.dev/reference/react/legacy)：阅读 `Children`、`cloneElement`、`Component`、`createElement`、`createRef`、`forwardRef`、`isValidElement`、`PureComponent` 和 removed APIs。
8. [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)：重点查 removed APIs、codemods、TypeScript changes 和 migration gates。
9. [Vite Guide](https://vite.dev/guide/)：只用于确认当前项目是 Vite client runtime，`index.html` 是 dev entry，不代表已配置 SSR/RSC/static prerender framework。

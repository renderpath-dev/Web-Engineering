# React 第 19 章：Vite、Module Graph、HMR、Env、Assets 与 Production Build

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
  - [9.1 Vite 工程边界：React runtime 之外的 tooling layer](#section-9-1)
  - [9.2 index.html 与 module graph：为什么入口不是隐藏模板](#section-9-2)
  - [9.3 Dev server 与 native ESM：浏览器如何按需加载模块](#section-9-3)
  - [9.4 Dependency pre-bundling：CommonJS / UMD compatibility 与 request reduction](#section-9-4)
  - [9.5 HMR 与 React Fast Refresh：module update、state preservation 与 full reload](#section-9-5)
  - [9.6 import.meta.env、modes 与 VITE_ client exposure](#section-9-6)
  - [9.7 vite-env.d.ts 与 env type augmentation：类型系统和 runtime 的边界](#section-9-7)
  - [9.8 CSS imports、CSS Modules 与 style HMR](#section-9-8)
  - [9.9 Static assets、public 目录、?url 与 ?raw imports](#section-9-9)
  - [9.10 Web Workers 与 ?worker imports：browser thread boundary](#section-9-10)
  - [9.11 import.meta.glob：compile-time glob transform 不是 runtime filesystem](#section-9-11)
  - [9.12 Dynamic import 与 chunk boundary：React lazy、Vite split point 与限制](#section-9-12)
  - [9.13 vite.config.ts、defineConfig、resolve.alias 与 plugin boundary](#section-9-13)
  - [9.14 build、preview、base path 与 static deployment](#section-9-14)
  - [9.15 SSR / Backend Integration：当前 Vite client lab 的边界说明](#section-9-15)
  - [9.16 SellerHub Vite tooling mapping](#section-9-16)
  - [9.17 最终小项目：SellerHub Vite Boundary Lab](#section-9-17)
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

这张表只连接机制、owner、运行层和学习场景；它不是交付清单，也不记录文件状态。

| Mechanism | Owner / Boundary | Runtime Layer | Project Scenario | Source Reading Path |
| --- | --- | --- | --- | --- |
| Vite tooling boundary | Vite owns serving, transforming, HMR, dependency optimization, and production bundling | Tooling / dev server / build | Read why React UI can render only after modules are transformed and loaded | `vite.config.ts` |
| HTML entry and module graph | Vite owns `index.html` as source and resolves module imports from it | Dev server / production build | Trace app startup from HTML to `src/sudoku/main.tsx` and `src/App.tsx` | `index.html` |
| Native ESM development | Browser requests ESM URLs; Vite transforms TSX and CSS on demand | Browser ESM / Vite transform pipeline | Explain why dev starts fast without one large bundle | `src/learning/react/chapter-19-vite-module-graph-hmr-env-assets-build/03-dev-server-native-esm/dev-server-module-request-panel.tsx` |
| Dependency pre-bundling | Vite optimizes third-party deps for native ESM and request reduction | Dev-only dependency optimizer | Explain why React dependency imports behave differently from local source modules | `package.json` |
| HMR and Fast Refresh | Vite HMR client owns module updates; React plugin owns component refresh behavior | Development-only HMR / React Fast Refresh | Clean up side effects and distinguish preserved state from full reload | `src/learning/react/chapter-19-vite-module-graph-hmr-env-assets-build/05-hmr-fast-refresh/hmr-side-effect-module.ts` |
| Env and mode boundary | Vite exposes selected env values to client bundles | Build-time replacement / runtime constants | Audit public `VITE_` values and parse strings explicitly | `src/learning/react/chapter-19-vite-module-graph-hmr-env-assets-build/06-env-modes/env-mode-model.ts` |
| Assets, workers, glob, and chunks | Vite transforms import queries and statically analyzable module expressions | Bundler transform / browser platform | Compare source-imported assets, raw text, workers, glob maps, and dynamic chunks | `src/learning/react/chapter-19-vite-module-graph-hmr-env-assets-build/sellerhub-vite-boundary-lab/sellerhub-vite-boundary-lab.tsx` |
| Build, preview, base, SSR, backend | Vite can build static assets and integrate with SSR/backend systems, but this lab remains client-side | Production build / static host / server boundary | Review deployment assumptions without faking real hosting or SSR | `src/learning/react/chapter-19-vite-module-graph-hmr-env-assets-build/14-build-preview-deploy/build-preview-base-path-panel.tsx` |

## 0. 本章工程问题与边界

本章解决的是 React 学习项目中常见但容易被跳过的 tooling boundary：React 负责根据 state、props、context、hooks 和 JSX 产生 UI 描述并提交到 DOM；Vite 负责把源码作为模块图加载、转换、热更新和生产构建。React runtime 不知道 `?raw`、`?worker`、`import.meta.glob` 或 `vite.config.ts` 的转换细节；Vite 也不负责决定一个 component 的 state owner、render snapshot 或 effect cleanup。

Vite dev server 行为和 production build 行为必须分开看。开发时，浏览器通过 native ESM 请求模块，Vite 按需转换 TS/TSX/CSS、注入 HMR client，并对依赖做 pre-bundling。构建时，Vite 从 `index.html` 出发生成优化后的静态资源、hashed filenames、chunk graph 和按 `base` 改写后的 asset URLs。把 dev server 的 URL、HMR 或模块请求形态当成最终部署结果，会导致错误的性能判断和发布判断。

`index.html` 是本章的关键边界。它不是隐藏模板，而是 Vite 的 source 和 module graph entry；`<script type="module">` 指向的应用入口会继续 import React、React DOM、router、CSS 和各章练习。环境变量也是 client bundle 安全边界：只有按配置暴露给 client 的值才会进入 bundle，但一旦进入 bundle，它就是公开数据，不能放 secret。Assets、workers、glob imports、dynamic imports 和 config 都属于 tooling、bundler 或 browser platform 边界。

本章不覆盖真实 SSR server、Next.js framework runtime、deployment automation、CDN configuration、custom Vite plugin production publishing、真实 backend integration 或真实 static host 配置。SSR 和 backend integration 只作为边界阅读：你要能判断它们不属于当前 Vite client lab 的运行目标。

## 1. 本章解决的问题

完成前 18 章后，你已经能写 React components、routes、forms、async data、performance workspace、tests、capstone、React 19 API gap 和 React DOM/server/static 边界。剩下的问题是：项目实际运行时并不是 React 单独完成一切。浏览器先加载 HTML，Vite 把源码变成浏览器能理解的模块，React runtime 才开始渲染。

本章要让你能回答这些工程问题：

1. 为什么 Vite 有 dev server，也有 production build。
2. 为什么 `index.html` 是 source 和 module graph entry。
3. 为什么 React rendering 和 Vite transform、dependency optimization、HMR、bundling 是不同 owner。
4. 为什么 HMR 可以更新 module，但不等于所有 state 都必然保留。
5. 为什么 `import.meta.env` 的值要按 string 解析，`VITE_` 仍然是公开数据。
6. 为什么 CSS、assets、workers、glob imports、dynamic imports 和 config 属于 tooling 或 browser platform。
7. 为什么 `vite build` 通过不等于真实部署已经验证完成。

## 2. 前置概念

- Native ESM：浏览器以 URL 请求 ES modules，并按 import graph 继续加载依赖。
- Module graph：从 entry 出发，HTML、TSX、CSS、assets 和 dynamic imports 组成依赖图。
- React render and commit：React 读取当前 render snapshot，生成 UI 描述，再由 renderer commit 到宿主环境。
- TypeScript type erasure：TS 检查类型，但运行时不会保留 interface、literal type 或 env schema。
- Browser platform APIs：URL、module scripts、Web Worker、CSSOM、network cache 和 static hosting 都属于浏览器或服务器平台。
- Bundler transform：Vite 在 dev/build 阶段处理 `?url`、`?raw`、`?worker`、CSS Modules 和 glob transforms。

## 3. 学习目标

完成本章后，你应该能够：

1. 解释 Vite 和 React runtime 的 owner 分界。
2. 追踪 `index.html` 到 React root 的 module graph。
3. 读懂 dev server 请求、native ESM、dependency pre-bundling 和 production bundling 的差异。
4. 使用 HMR API 的 `accept`、`dispose`、`data`、`invalidate` 概念判断 side-effect cleanup。
5. 审查 `import.meta.env`、mode、`BASE_URL`、`DEV`、`PROD`、`SSR`、`VITE_` 和 secret leakage。
6. 说明 `vite-env.d.ts` / `ImportMetaEnv` 是类型增强，不是 runtime validation。
7. 区分 CSS imports、CSS Modules、source assets、public assets、`?url`、`?raw`、`?worker`。
8. 解释 `import.meta.glob` 是 compile-time transform，而不是 runtime filesystem access。
9. 把 dynamic import、React `lazy`、chunk boundary 和 data fetching boundary 分开。
10. 审查 `vite.config.ts`、`defineConfig`、`resolve.alias`、`@vitejs/plugin-react` 和 plugin API boundary。
11. 判断 build、preview、base path、static deployment、SSR 和 backend integration 的证据边界。

## 4. 机制依赖图

| First Understand | Then Understand | Dependency Reason | Failure If Skipped |
| --- | --- | --- | --- |
| React render/commit | Vite tooling boundary | React 只能渲染已经被浏览器加载和执行的模块；Vite 负责模块进入浏览器前后的 tooling work | 会把 Vite HMR 或 build chunk 问题误判成 React state 问题 |
| `index.html` as source | Module graph entry | Vite 从 HTML 解析 module script，才知道 app entry 和后续 imports | 会找错入口，误以为 HTML 只是 public template |
| Native ESM requests | Dependency pre-bundling | 本地源码按需转换，第三方依赖需要 ESM compatibility 和 request reduction | 会误删或错误配置 optimizer |
| Module graph ownership | HMR boundary | HMR 以 module 为单位传播更新，React Fast Refresh 只处理 React component module 的刷新语义 | 会用 tests 假装 live HMR，或遗漏 side-effect cleanup |
| Env exposure | Env type augmentation | TypeScript 只描述 env shape；Vite 决定哪些值进入 client bundle | 会把 `ImportMetaEnv` 当成 secret protection |
| Asset import transform | Public directory and base path | source-imported assets 进入 transform graph，public assets as-is 复制并按 URL 访问 | 会在 nested deploy 中写死 asset URL |
| Glob static analysis | Dynamic import chunk boundary | glob 是 Vite 静态展开的 module map；dynamic import 是 chunk split point | 会写过度动态的路径，导致无法构建或无法预加载 |
| Static build | Preview and deployment | `vite preview` 只本地服务 `dist`，不是 production host | 会把 build success 当成 CDN、fallback、base path 都已验证 |

## 5. 核心术语表

| Term | 中文说明 | Layer | Why It Matters |
| --- | --- | --- | --- |
| Vite dev server | 开发期按需服务和转换模块的 HTTP server | Tooling | 决定 dev 启动、模块请求和 HMR 行为 |
| Module graph | 从 HTML entry 到所有 imports 的依赖图 | Tooling / browser ESM | 解释 HMR、assets、chunks 和 build entry |
| Native ESM | 浏览器原生 `import` / `export` 模块加载模型 | Browser platform | Vite dev server 以接近源码的方式服务模块 |
| Dependency pre-bundling | 开发期将依赖转换为 ESM 并减少请求 | Tooling | 支持 CommonJS / UMD deps 和 faster dev requests |
| HMR boundary | 能接受热更新的 module boundary | Vite HMR | 决定 update、invalidate 或 full reload |
| React Fast Refresh | React integration 对 component module 的刷新语义 | React plugin boundary | 决定 state preservation 和 reset |
| `import.meta.env` | Vite 注入的 env constants object | Build-time replacement / runtime value | 决定 client 能读到哪些公开配置 |
| `VITE_` prefix | 默认暴露给 client bundle 的 env prefix | Security boundary | 带此前缀的值仍然是公开数据 |
| CSS Modules | `.module.css` 导出的 local class mapping | CSS transform | 支持局部 class name 和 module graph dependency |
| `?url` / `?raw` / `?worker` | 修改 import 处理方式的 Vite query | Bundler transform | 分别得到 URL、raw string 或 Worker constructor |
| `import.meta.glob` | Vite 编译期展开的 glob module map | Compile-time transform | 不是浏览器 runtime filesystem API |
| `base` | dev/build 中的 public base path | Vite config / deployment | 决定 nested deploy 的 asset URL |
| `vite preview` | 本地预览 `dist` 的 server | Tooling | 不是 production hosting 或 CDN 验证 |

## 6. 底层心智模型

用一句话记住本章：React 处理 UI 的运行时状态和提交，Vite 处理源文件进入浏览器与生产包的 tooling path。用户打开页面时，浏览器先请求 HTML；Vite 或静态服务器返回 HTML；HTML 中的 module script 指向应用入口；入口 import React、React DOM、router、CSS、章节练习和 assets；React runtime 只有在这些模块执行后才创建 root 并渲染。

开发模式中，模块 identity 通常表现为 URL；Vite 根据请求路径读取源码、转换 TSX/CSS/assets、注入 HMR 运行时代码，并维护 module graph。生产模式中，Vite 不再按原始源文件逐个服务所有模块，而是从 entry 构建 chunk graph，重写 asset URLs，生成 hashed assets，并输出可以交给 static host 的 `dist`。TypeScript、ESLint、Vitest 和 Vite 是不同质量门；`vite build` 会做 transform/bundle，但不是完整业务测试，也不是真实部署证明。

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
  index.html
  package.json
  vite.config.ts
  tsconfig.app.json
  vitest.config.ts
  src/App.tsx
  src/sudoku/main.tsx
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
docs/react/chapter-19-vite-module-graph-hmr-env-assets-build/
  react-chapter-19-learning-guide.md
```
</div>

### 本章真实练习结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Chapter 19 practice structure</span>
  </div>

```txt
src/learning/react/chapter-19-vite-module-graph-hmr-env-assets-build/
  chapter-19-practice-root.tsx
  chapter-19-practice.css
  01-vite-boundary/
  02-index-module-graph/
  03-dev-server-native-esm/
  04-dependency-prebundling/
  05-hmr-fast-refresh/
  06-env-modes/
  07-env-types/
  08-css-modules/
  09-static-assets/
  10-web-workers/
  11-import-meta-glob/
  12-dynamic-import-chunks/
  13-vite-config-plugin/
  14-build-preview-deploy/
  15-ssr-backend-boundary/
  16-sellerhub-vite-tooling-map/
  sellerhub-vite-boundary-lab/
  __tests__/
```
</div>

### 概念示例结构

下面 snippets 只解释机制，不表示需要额外创建文件。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Conceptual snippets</span>
  </div>

```txt
Snippet: html module entry
Snippet: hmr dispose data
Snippet: public env parsing
Snippet: glob raw notes
Template: vite config review
```
</div>

### 最终小项目结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Final mini project structure</span>
  </div>

```txt
sellerhub-vite-boundary-lab/
  sellerhub-vite-boundary-lab.tsx
  sellerhub-vite-boundary-data.ts
  module-graph-inspector.tsx
  hmr-lifecycle-card.tsx
  env-exposure-auditor.tsx
  asset-import-lab.tsx
  worker-metric-panel.tsx
  glob-content-reader.tsx
  dynamic-chunk-boundary-card.tsx
  build-deploy-decision-table.tsx
  tooling-review-checklist.tsx
```
</div>

## 8. 示例运行方式

开发期用 Vite dev server 观察练习页面；验证阶段要把 lint、typecheck、test 和 build 分开看。

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

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Output</span>
  </div>

```txt
Open /react/chapter-19
```
</div>

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Vite 工程边界：React runtime 之外的 tooling layer

**结论：** Vite 不是 React runtime。Vite 决定源码如何被浏览器加载、热更新和打包；React 决定组件如何根据 render snapshot 返回 UI 并 commit。

**机制证据链：** 触发动作是打开 `/react/chapter-19`。浏览器请求 HTML 和 module script；Vite dev server 读取 `index.html`、`src/sudoku/main.tsx`、`src/App.tsx` 和 manifest 中的 lazy practice entry，产生浏览器能执行的 ESM responses。JavaScript runtime 执行模块后，React 才创建 component functions、state cells 和 Suspense boundary。TypeScript 只在 `tsc -b` 中检查 imports、JSX 和 types，不会在浏览器中保留 interface。若把 Vite transform error 当成 React render bug，就违反了 owner 分层规则；真实项目中可通过 terminal transform error、browser module request failure、React error boundary stack 的来源区分。

**练习文件：** `01-vite-boundary/vite-tooling-boundary-panel.tsx` 用四层图把 `npm scripts`、Vite、React runtime 和 browser platform 分开。

**常见错误：** 看到页面空白就只查 component state，而不查 module import、CSS module declaration、asset query 或 dynamic import。判断方法是先看 network/module error，再看 React component stack。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | “页面空白，所以一定是 React state bug。” | Vite transform、module request、asset URL 和 React render 属于不同 owner |
| Correct | 先看 terminal transform error、Network module request、console import error，再看 React component stack | tooling failure 不进入 React error boundary 时，不能用 component state 解释 |

**执行过程补充：** `npm run dev` 启动的是 tooling runtime；browser 请求 HTML 和 ESM modules；Vite transform 后返回 JavaScript；React 只有在 entry module 执行、root 创建后才参与 UI。真实项目排错要按“HTML -> module -> transform -> React root -> component render”顺序定位。

<a id="section-9-2"></a>

### 9.2 index.html 与 module graph：为什么入口不是隐藏模板

**结论：** 在 Vite 项目中，`index.html` 是 source code，也是 module graph 的入口之一。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Snippet: html module entry</span>
  </div>

```html
<div id="root"></div>
<script type="module" src="/src/sudoku/main.tsx"></script>
```
</div>

**逐行解释：** 第一行提供 React root container；第二行声明 browser module script。Vite 解析这个 module script，把 TSX entry 加入 module graph，并继续解析该 entry 的 imports。

**机制证据链：** 触发动作是浏览器解析 HTML。JavaScript runtime 尚未创建 React root；浏览器先把 `<script type="module">` 放入 module loader。Vite 根据 `/src/sudoku/main.tsx` 找到源码、转换 TSX、继续解析 imports。React 的 hook cell 和 render snapshot 在 entry module 执行后才出现。TypeScript 会检查 `main.tsx` 中的 imports 和 JSX 类型，但不会改变 HTML 的 module loading 语义。错误形式是把 entry 移到 public placeholder 或写错 absolute path；识别信号是 HTML 能返回，但 module script 404 或 MIME/type transform error。

**练习文件：** `02-index-module-graph/index-module-graph-panel.tsx` 把 HTML entry、main module、App shell、manifest lazy entry 和 CSS/assets 画成 module graph。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 删除 `index.html` 中的 module script，以为 `main.tsx` 会被 Vite 自动发现 | Vite 需要 HTML 或 explicit entry 指向 module graph root |
| Correct | `index.html` 保留 root container 和 `<script type="module" src="/src/sudoku/main.tsx">` | HTML entry、root DOM node、module graph entry 是同一启动链的一部分 |

**执行过程补充：** browser 先解析 HTML，不知道 TSX；Vite 根据 script URL 找到 TSX source 并 transform；`src/sudoku/main.tsx` 再 import `src/App.tsx`。如果 script path 写错，React code 根本不会执行，调试 state 没意义。

<a id="section-9-3"></a>

### 9.3 Dev server 与 native ESM：浏览器如何按需加载模块

**结论：** 开发期不是先生成一个完整 production bundle。浏览器按 native ESM graph 请求模块，Vite 按需转换源文件。

**机制证据链：** 触发动作是浏览器发现一个 static import 或 dynamic import。浏览器创建 URL-based module request；Vite 读取对应 TS/TSX/CSS/asset source，执行 transform，并返回 ESM-compatible response。React 只看到模块导出的 component function，之后在 render 中读取 props、state 和 context。TypeScript 只证明 import target 和 exported symbol 形状，不证明开发服务器能访问文件路径。错误形式是大小写路径、缺失 extension declaration 或非法 asset query；真实项目中可通过 network 404、transform stack、`Failed to fetch dynamically imported module` 识别。

**练习文件：** `03-dev-server-native-esm/dev-server-module-request-panel.tsx` 展示 request waterfall、source transform 和 dev/build 差异。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 以为 dev server 已经提前生成一个和 production 一样的 bundle | 开发期浏览器按 native ESM graph 发起模块请求，Vite 按需 transform |
| Correct | 用 Network panel 观察每个 source module URL；用 build output 另行审查 production chunks | dev request graph 和 production artifact graph 是两个 evidence source |

**执行过程补充：** static import 会触发直接 module request；dynamic import 会在运行到该路径时请求 chunk/module；CSS 和 assets 也可形成 transformed responses。路径大小写、query、missing file 在 dev server 层失败，不是 React reconciliation 失败。

<a id="section-9-4"></a>

### 9.4 Dependency pre-bundling：CommonJS / UMD compatibility 与 request reduction

**结论：** Dependency pre-bundling 是开发期优化，主要解决第三方依赖的 CommonJS / UMD compatibility 和过多 nested dependency requests。

**机制证据链：** 触发动作是 dev server 首次遇到 `react`、`react-dom`、`react-router` 这类 dependency import。Vite 的 optimizer 读取 package entry，转换 CommonJS/UMD 或多模块依赖为更适合 browser native ESM 的缓存结果。React runtime 仍然执行 React package exported functions；state cell、fiber identity 和 hooks rule 不由 optimizer 改写。TypeScript 根据 package types 检查 imports；它不控制 optimizer cache。错误形式是盲目配置 `optimizeDeps.include` / `exclude` 或把 `node_modules/.vite` 当成源码；识别信号是 dependency optimizer log、stale cache、dependency export mismatch。

**练习文件：** `04-dependency-prebundling/dependency-prebundling-panel.tsx` 区分 app source modules、dependency modules 和 optimizer cache。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 把 `node_modules/.vite` 中的 optimized dependency 当成要编辑的源码 | pre-bundled dependency cache 是 dev optimizer output |
| Correct | 修改真实 source 或 package version；必要时清理 optimizer cache 或调整 `optimizeDeps` | pre-bundling 优化 dev dependency loading，不改变 React hook semantics |

**执行过程补充：** Vite 首次遇到 dependency import 时分析 package entry；optimizer 把 CommonJS/UMD 或 deep dependency graph 转成浏览器更友好的 ESM cache；app source 仍按 source module transform。真实项目中只有遇到 dependency export mismatch、stale optimizer cache 或 linked package 时才调整这个边界。

<a id="section-9-5"></a>

### 9.5 HMR 与 React Fast Refresh：module update、state preservation 与 full reload

**结论：** HMR 是 module graph 更新机制；React Fast Refresh 是 React plugin 对 component module 的开发期刷新语义。它们都不是生产功能。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Snippet: hmr dispose data</span>
  </div>

```ts
if (import.meta.hot) {
  import.meta.hot.dispose((hotData) => {
    hotData.disposedAt = Date.now()
  })
}
```
</div>

**逐行解释：** 条件分支只在支持 HMR 的开发环境中执行；`dispose` 在旧 module instance 被替换前运行；`hotData` 可以把少量调试状态交给下一次 module evaluation。

**机制证据链：** 触发动作是编辑一个 module。Vite 找到受影响 module，判断是否有 `import.meta.hot.accept` boundary、accepted dependency 或需要 full reload。JavaScript runtime 重新 evaluate 新 module；旧 module 的 timer、subscription 或 singleton side effect 必须在 `dispose` 中清理。React Fast Refresh 只在 component signature 安全时保留 hook cell；改 hook order、module exports 或非 component side effect 可能 reset 或 reload。TypeScript 可以检查 `import.meta.hot` 类型，但不会模拟 live HMR。错误形式是在测试中 fake HMR 成功；识别信号是 dev console HMR log、full reload、state reset 或 duplicated interval。

**练习文件：** `05-hmr-fast-refresh/hmr-fast-refresh-panel.tsx` 和 `05-hmr-fast-refresh/hmr-side-effect-module.ts` 讲 update、dispose、data、invalidate 和 full reload。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 修改 module 后发现 state 保留，就认为所有 edits 都会保留 state | Fast Refresh 只在 compatible component boundary 上尽量保留 hook state |
| Wrong | module 启动 interval/subscription，但没有 `dispose` 清理 | HMR re-evaluates modules；persistent side effects must be disposed |
| Correct | component-only edits 依赖 Fast Refresh；side-effect modules 用 `dispose`；不兼容 edits 接受 full reload | HMR 是 development convenience，不是 production lifecycle |

**执行过程补充：** Vite 收到 file change 后沿 module graph 找 HMR boundary；旧 module 先运行 dispose；新 module 被 evaluate；React plugin 判断 component signature 是否可 refresh；不安全时 full reload。测试可以验证 pure classification model，但不能证明 live websocket HMR session。

<a id="section-9-6"></a>

### 9.6 import.meta.env、modes 与 VITE_ client exposure

**结论：** `import.meta.env` 是 Vite 注入到 client bundle 的公开配置边界；所有 env 值需要按 string 显式解析，`VITE_` 不是 secret protection。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Snippet: public env parsing</span>
  </div>

```ts
const publicApiBaseUrl = import.meta.env.VITE_API_BASE_URL
const isDevelopment = import.meta.env.DEV
const maxRetries = Number(import.meta.env.VITE_MAX_RETRIES ?? '0')
```
</div>

**逐行解释：** 第一行读取 client-exposed value；第二行读取 Vite built-in boolean；第三行把公开 string 转成 number。`Number(...)` 是 runtime parsing，不是 TypeScript type annotation。

**机制证据链：** 触发动作是 Vite transform/build 遇到 `import.meta.env`。Vite 注入 built-ins，例如 `MODE`、`BASE_URL`、`DEV`、`PROD`、`SSR`，并只暴露符合 prefix 的 env values。JavaScript runtime 读到的是已经进入 bundle 的值；React component 只是把这些值作为普通 variables 渲染或传递。TypeScript 可以给 `VITE_MAX_RETRIES` 标成 string，但不会阻止 value 为 `"abc"`。错误形式是把 `VITE_DB_PASSWORD` 放进 `.env`；识别信号是变量名带 `VITE_` 且语义是 password、secret、token、private key。

**练习文件：** `06-env-modes/env-boundary-panel.tsx` 和 `06-env-modes/env-mode-model.ts` 通过 env audit 把 public、server-only 和 unsafe-public keys 分开。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | `VITE_PRIVATE_TOKEN=abc` 并相信前缀会隐藏它 | `VITE_` 表示允许进入 client bundle，不是 secret marker |
| Wrong | `if (import.meta.env.VITE_FLAG)` 读取 `"false"` 并期待 false branch | `.env` values are strings unless explicitly parsed |
| Correct | public client config 用 `VITE_`，private secrets 保留在 server/runtime outside client bundle；boolean/number 显式 parse | env exposure 和 runtime parsing 是两个独立边界 |

**执行过程补充：** Vite transform/build 替换 built-in env constants 并暴露 prefixed values；React component 读取的是普通 JavaScript values；TypeScript augmentation 只改变编辑器和 compile-time view。真实项目中看到 password、token、secret、private key 带 `VITE_`，应立即当作泄漏风险。

<a id="section-9-7"></a>

### 9.7 vite-env.d.ts 与 env type augmentation：类型系统和 runtime 的边界

**结论：** `vite-env.d.ts` / `ImportMetaEnv` 增强的是 TypeScript IntelliSense 和 type checking，不会创建、加密、校验或隐藏 runtime env values。

**机制证据链：** 触发动作是 `tsc` 或 IDE 读取全局 declaration。TypeScript 把 `ImportMetaEnv` merge 到 `import.meta.env` 的类型上，使 `import.meta.env.VITE_API_BASE_URL` 有明确类型。JavaScript runtime 执行时没有 interface，也没有 declaration file。React render 读取的仍是普通 runtime value。错误形式是写了 `readonly VITE_FLAG: boolean` 就以为 `.env` 会自动变 boolean；识别信号是 UI 中显示 `"false"` 但条件判断按 truthy string 走。

**练习文件：** `07-env-types/env-type-boundary-panel.tsx` 对比 type augmentation、runtime parsing 和 validation。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | `interface ImportMetaEnv { readonly VITE_ENABLED: boolean }` 后直接当 boolean 使用 | declaration 不会改变 `.env` runtime string |
| Correct | 类型声明描述 expected shape；runtime code 仍用 parser 把 string 转成 boolean/number | TypeScript type system is erased before browser execution |

**执行过程补充：** `tsc` 读取 `.d.ts` 并给 `import.meta.env` 增强类型；Vite transform 注入 runtime values；browser 执行时没有 interface。识别信号是类型看起来是 boolean，但 UI branch 以 non-empty string truthiness 执行。

<a id="section-9-8"></a>

### 9.8 CSS imports、CSS Modules 与 style HMR

**结论：** CSS import 是 module graph dependency；CSS Modules 让 `.module.css` 导出 class name mapping；style HMR 只更新样式，不改变 React state owner。

**机制证据链：** 触发动作是 TSX import CSS 或 CSS Module。Vite 把 CSS 纳入 module graph，生成 style injection/update path；`.module.css` 额外导出一个 mapping object。JavaScript runtime 读取 `styles.card` 这样的 string；React 只把该 string 写入 `className`。TypeScript 依赖 Vite client types 或 CSS module declarations 认识 CSS imports，但不会检查 class 是否真的存在，除非有额外生成类型。错误形式是把 global class 当作 CSS Module export；识别信号是 `undefined` className、样式未生效或 test 中 class assertion 过度依赖 hash。

**练习文件：** `08-css-modules/css-imports-modules-panel.tsx` 和 `08-css-modules/vite-scope-card.module.css` 展示 global CSS、local mapping 和 style update boundary。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | `import styles from './card.css'` 后使用 `styles.card` | 普通 CSS import 注入样式，不导出 CSS Module mapping |
| Correct | `card.module.css` 才作为 CSS Module import，并把 exported class string 交给 `className` | CSS module graph edge 与 React className prop 分层 |

**执行过程补充：** Vite transform CSS import，dev 期可通过 style HMR 更新 style tag；CSS Module 额外生成 mapping object。React 不知道原始 selector，只接收 string。测试不要断言 hashed class 的具体值，应断言可见 behavior 或稳定语义。

<a id="section-9-9"></a>

### 9.9 Static assets、public 目录、?url 与 ?raw imports

**结论：** Source-imported assets 进入 Vite transform graph；public assets as-is 暴露在 root URL 下；`?url` 得到 URL string，`?raw` 得到文件内容 string。

**机制证据链：** 触发动作是 import asset。Vite 根据 import query 返回 public URL、raw string 或普通 transformed module。JavaScript runtime 得到 string 并传给 React JSX，例如 `href`、`src` 或 text preview。React 不知道该 string 来自 hashed asset 还是 raw source；TypeScript 通过 Vite client declarations 允许这些 query imports。错误形式是在 source 中写死 `/assets/file.hash.png` 或把 secret config 放进 raw text import；识别信号是 build 后 asset 404、base path 错误或 bundle 中出现不该公开的文本。

**练习文件：** `09-static-assets/static-asset-boundary-panel.tsx` 和 `09-static-assets/raw-release-note.md` 解释 source asset、public asset、raw text 和 base rewriting。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 在 component 中写死 `/src/assets/logo.svg` 作为 production URL | source file path 不是 production asset URL |
| Wrong | 把 private release config 放进 `?raw` import | raw import content enters the client bundle |
| Correct | 用 source import、`new URL(..., import.meta.url)` 或 public path，并用 build/base evidence 验证 URL | asset graph 与 deployment base 必须一起审查 |

**执行过程补充：** source-imported asset 进入 build graph 并可能得到 hashed URL；public asset 原样复制到 root；raw import 变成 string literal-like module content。真实项目中 asset 404 通常要同时检查 import style、`base`、static host path 和 generated dist file。

<a id="section-9-10"></a>

### 9.10 Web Workers 与 ?worker imports：browser thread boundary

**结论：** `?worker` 把 worker module 变成 Worker constructor；worker 在独立 browser thread 中运行，通过 `postMessage` 传递 structured clone 数据，不共享 React state。

**机制证据链：** 触发动作是 UI button 创建 worker 或发送 message。Vite transform `import WorkerConstructor from './worker?worker'`，JavaScript runtime 创建 Worker instance，main thread 通过 `postMessage` 发送 plain data。React state cell 只存在 main thread component owner 中；worker 只能返回 message，由 handler 再调用 setter。TypeScript 检查 message payload shape，但不保证 worker runtime 性能或 browser support。错误形式是在 worker 中直接读取 React hook 或 DOM node；识别信号是 runtime reference error、clone error 或 UI state 没有通过 message 更新。

**练习文件：** `10-web-workers/vite-worker-boundary-panel.tsx` 和 `10-web-workers/sellerhub-metric.worker.ts` 展示 heavy metric crossing the thread boundary。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | worker module 直接 import React state hook 或读取 `document.querySelector` | Worker thread 不拥有 React hook dispatcher，也没有普通 DOM access |
| Correct | main thread sends structured data; worker returns result; component handler commits result into state | Worker boundary is message passing plus cleanup |

**执行过程补充：** Vite 把 `?worker` import 转为 constructor；button handler 创建 worker；main thread postMessage；worker computes and postMessage result；component receives event and calls setter；cleanup terminates worker。TypeScript 约束 message shape，但 structured clone 和 browser worker support 是 runtime/platform 边界。

<a id="section-9-11"></a>

### 9.11 import.meta.glob：compile-time glob transform 不是 runtime filesystem

**结论：** `import.meta.glob` 是 Vite 静态分析并展开的 module map，不是浏览器运行时扫描文件系统。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Snippet: glob raw notes</span>
  </div>

```ts
const noteModules = import.meta.glob('./content/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})
```
</div>

**逐行解释：** glob pattern 必须让 Vite 能静态分析；`eager: true` 让 matching modules 在 build/dev transform 阶段直接导入；`import: 'default'` 读取 default export；`query: '?raw'` 让 Markdown 作为 raw string 进入 module map。

**机制证据链：** 触发动作是 Vite transform 源码时发现 glob call。Vite 使用 fast-glob 类机制匹配源码文件，并把 call 改写成静态 import map 或 lazy import functions。JavaScript runtime 执行时只看到 object，不具备 filesystem permission。React component 读取 object entries 并渲染 notes；hook state 不参与文件发现。TypeScript 可约束返回值为 `Record<string, string>`，但不保证 pattern 覆盖所有业务内容。错误形式是把 user input 拼进 glob pattern；识别信号是 build 报静态分析失败或返回 map 缺失。

**练习文件：** `11-import-meta-glob/glob-module-map-panel.tsx` 和 `sellerhub-vite-boundary-lab/glob-content-reader.tsx` 对比 eager raw notes 和 lazy module map。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | `import.meta.glob(userSelectedPattern)` | Vite must statically analyze the glob pattern during transform |
| Correct | `import.meta.glob('./content/*.md', { eager: true, query: '?raw' })` | Literal scoped pattern creates a predictable module map |

**执行过程补充：** glob expansion 发生在 browser runtime 之前；lazy mode 返回用于导入匹配模块的 functions；eager mode 会立即导入。React 只渲染已经创建好的 module map。如果内容缺失，先检查 pattern scope 和 transformed module map，而不是先怀疑 component state。

<a id="section-9-12"></a>

### 9.12 Dynamic import 与 chunk boundary：React lazy、Vite split point 与限制

**结论：** Dynamic import 是 chunk split point；React `lazy` 消费 Promise-returning module loader；chunk boundary 不是 data fetching boundary。

**机制证据链：** 触发动作是 route、tab 或 user action 需要加载一个 deferred module。JavaScript runtime 调用 `import('./chunk-audit-card')`，Vite/Rolldown 在 build 中把它变成 async chunk boundary，并可能预加载 shared chunks。React `lazy` 读取 promise status，通过 Suspense 展示 fallback，然后在 module resolved 后渲染 default export。TypeScript 检查 imported module exports，但不保证网络速度或 chunk 预加载策略。错误形式是过度动态路径如 `import(pathFromUser)`；识别信号是 build 无法分析、chunk 过碎或 fallback 被误当成 data loading。

**练习文件：** `12-dynamic-import-chunks/dynamic-import-chunk-panel.tsx` 和 `12-dynamic-import-chunks/chunk-audit-card.tsx` 讲 React lazy 与 Vite split point 的关系。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | `lazy(() => import(pathFromUser))` | bundler needs analyzable import boundaries; user input cannot define arbitrary source modules |
| Wrong | 把 Suspense fallback 当成 data loading proof | fallback may represent code chunk loading, not server data fetching |
| Correct | Use explicit dynamic imports for route/page-sized chunks and review build output | chunk boundary, route boundary, and data boundary are separate |

**执行过程补充：** dynamic import 创建 async module request；Vite build 把它变成 output chunk；React `lazy` 等待 default export；Suspense 控制 UI fallback。真实项目 review 要检查 chunk size、loading UX、preloading behavior，以及这个 split point 是否真的减少 initial work。

<a id="section-9-13"></a>

### 9.13 vite.config.ts、defineConfig、resolve.alias 与 plugin boundary

**结论：** `vite.config.ts` 由 Vite tooling 执行，不会进入 browser runtime；`defineConfig` 提供 config typing；`@vitejs/plugin-react` 接入 React Fast Refresh 和 React transforms。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Template: vite config review</span>
  </div>

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
})
```
</div>

**逐行解释：** 第一行导入 React plugin；第二行导入 typed config helper；`plugins` array 让 Vite 在 dev/build transform pipeline 中启用 React integration。这里没有新增 alias，因为 alias 只有在真实 import pain 明确时才值得引入。

**机制证据链：** 触发动作是 `vite`, `vite build` 或 `vite preview` 启动。Node/Vite runtime 加载 config，解析 plugins、server/build/preview options、alias 和 define replacements。浏览器不会执行 `vite.config.ts`；React component 也不应 import config。TypeScript 对 config object 提供 intellisense，但不保证 plugin hook 行为正确。错误形式是为了方便随意加 alias、在 config 中读取 client-only global、或改 config 后不重启 dev server；识别信号是 unresolved import、plugin transform mismatch 或 config change 未生效。

**练习文件：** `13-vite-config-plugin/vite-config-plugin-boundary-panel.tsx` 用 review table 解释 `defineConfig`、`resolve.alias`、plugin hook 和 when not to customize。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | 在 `vite.config.ts` 中读取 `window.location` 或 DOM API | config runs in Node/tooling runtime, not browser runtime |
| Wrong | 用 plugin 解决 component state ownership or prop drilling | plugins transform modules; they do not own React render state |
| Correct | Add config/plugin only with import-path, transform, build, or dev-server evidence | Vite config changes must be tooling-motivated and testable |

**执行过程补充：** config 会先于 dev/build pipeline 加载；plugins 参与 resolve/load/transform/build hooks；React component code 只看到 transformed module output。如果一个修改只是在修 component architecture，应该在 React code 中解决，而不是改 Vite config。

<a id="section-9-14"></a>

### 9.14 build、preview、base path 与 static deployment

**结论：** `vite build` 产出可由 static host 服务的 `dist`；`vite preview` 本地服务 build output；`base` 决定 public asset URL 前缀。它们都不等于真实部署自动完成。

**机制证据链：** 触发动作是运行 `npm run build`。Vite 从 `index.html` 出发构建 app bundle、chunks 和 hashed assets，并按 `base` 重写 URLs。React runtime 在 build 阶段不渲染业务 UI；它只被打包进 output。TypeScript 是否参与取决于脚本，本项目用 `tsc -b && vite build`，所以 typecheck 和 bundle 是连续门。错误形式是在 nested path 部署但 `base` 仍为 `/`，或只跑 `vite preview` 就宣称 CDN fallback 已验证；识别信号是 production asset 404、SPA refresh 404、dist 中 URL 前缀错误。

**练习文件：** `14-build-preview-deploy/build-preview-base-path-panel.tsx` 区分 build output、preview server、static host、base path 和 SPA fallback。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | `vite preview` works locally, therefore production static host is configured | preview serves local build output; it does not prove CDN headers, fallback rewrites, or nested base |
| Wrong | Deploy under `/react-lab/` while `base` remains `/` | asset URLs are rewritten relative to configured public base |
| Correct | Build with the intended `base`, inspect generated URLs, and verify static host deep-link fallback separately | build artifact evidence and deployment evidence are separate gates |

**执行过程补充：** `tsc -b` checks types; `vite build` walks HTML/module graph and emits hashed assets; `vite preview` serves `dist`; static deployment must still configure fallback for browser routes. Real release evidence includes generated `dist`, asset URL prefixes, host rewrite config, and a deep-link smoke test.

<a id="section-9-15"></a>

### 9.15 SSR / Backend Integration：当前 Vite client lab 的边界说明

**结论：** Vite 支持 SSR 和 backend integration，但当前学习 app 是 client-side Vite React lab。本章只阅读这些边界，不配置真实 SSR server 或 traditional backend manifest pipeline。

**机制证据链：** 触发动作是阅读 Vite SSR 或 backend docs。SSR 需要 server entry、client entry、render function、HTTP response owner 和 hydration strategy；backend integration 需要后端 HTML owner、Vite manifest、asset serving 和 script injection。React render snapshot 在 server/client runtime 的 owner 不同；当前 app 只使用 browser client root。TypeScript 可以检查 server entry types，但不会让 browser component 具备 Node response stream。错误形式是在 client component 中伪造 SSR API 或把 backend manifest 当成 current runtime；识别信号是 Node-only API in browser、hydration owner 缺失、deployment docs 与 local Vite app 不匹配。

**练习文件：** `15-ssr-backend-boundary/ssr-backend-boundary-panel.tsx` 把 SSR、backend integration、Next.js framework runtime 和 current Vite client lab 分开。

**错误边界与修正：**

| Form | Boundary Example | Rule |
| --- | --- | --- |
| Wrong | Add `react-dom/server` snippets to a browser component and call it SSR support | SSR needs a server entry, response owner, client entry, and hydration plan |
| Wrong | Treat Vite backend integration manifest as active in this project | This app currently has no backend HTML owner consuming a manifest |
| Correct | Document SSR/backend as reading-only boundary until a future task introduces real server/build ownership | Do not fake runtime ownership to satisfy topic coverage |

**执行过程补充：** Vite SSR has separate server/client concerns; backend integration has manifest and host HTML concerns. Current project only has `index.html` and browser client root. If future work adds SSR, it must add explicit server files, scripts, tests, and deployment assumptions; this chapter does not do that.

<a id="section-9-16"></a>

### 9.16 SellerHub Vite tooling mapping

**结论：** SellerHub 业务功能应映射到 Vite tooling boundary，而不是把 tooling concern 混进 component state。

**机制证据链：** 触发动作是审查 SellerHub catalog、orders、dashboard 或 capstone feature。JavaScript modules import components、CSS、assets、workers 和 route-level chunks；Vite 管理 transform/build/HMR；React component owner 管理 UI state、props 和 effects。TypeScript 检查 module exports 和 props，但不会告诉你 chunk 是否过大、base 是否错或 env secret 是否泄漏。错误形式是用 React Context 存 build config、在 component 内拼接 production asset path、或把 worker result 当成 shared state；识别信号是 component code 出现 tooling literals、deploy path coupling、public secret keys。

**练习文件：** `16-sellerhub-vite-tooling-map/sellerhub-vite-tooling-map.tsx` 把 SellerHub feature slice 对应到 entry、env、assets、worker、glob、dynamic import 和 build review。

**错误边界与修正：**

| SellerHub concern | Wrong owner | Correct owner |
| --- | --- | --- |
| Feature flag secret | React Context in client bundle | Server/private runtime; only public flags use `VITE_` |
| Product asset URL | Hardcoded source path in component | Vite asset import plus base-aware build output |
| Heavy metric calculation | Block React render with synchronous loop | Worker boundary or memoized derived computation based on measured cost |
| Route page split | Random dynamic import string | Explicit lazy import and build chunk review |

**执行过程补充：** SellerHub review maps each problem to the owner that can actually enforce it. React owns UI state; Vite owns module/build transforms; browser owns worker/asset/network execution; static host owns fallback paths. Mixing these owners creates bugs that tests in only one layer may miss.

<a id="section-9-17"></a>

### 9.17 最终小项目：SellerHub Vite Boundary Lab

**结论：** 最终小项目把本章机制放在一个 SellerHub tooling review workspace 中，但它仍然是 client-side lab，不伪造 production deployment、live HMR 或 SSR execution。

**机制证据链：** 触发动作是打开 `/react/chapter-19` 并阅读 final lab cards。JavaScript runtime 加载 lab modules；React render snapshot 组织每张 card；worker demo 只有在用户触发时跨 thread；glob reader 展示 compile-time module map；dynamic chunk card 展示 split point；env auditor 对普通 object entries 做风险分类。TypeScript 检查 props、env audit model 和 test assertions；它不证明 real host、CDN、HMR websocket 或 SSR server。错误形式是把 lab 的 boundary explanation 当成真实部署证据；识别信号是没有真实 deployment URL、server logs、manifest integration 或 browser HMR session evidence。

**练习文件：** `sellerhub-vite-boundary-lab/sellerhub-vite-boundary-lab.tsx` 组合 module graph inspector、HMR lifecycle、env auditor、asset lab、worker panel、glob reader、dynamic chunk card、build/deploy decision table 和 tooling review checklist。

**错误边界与修正：**

| Lab evidence | What it proves | What it does not prove |
| --- | --- | --- |
| Env auditor tests | public-prefix secret names can be detected in a model | real secrets are absent from every deployment environment |
| Worker panel | worker message boundary works in browser-like runtime | every production device has acceptable worker performance |
| Glob reader | Vite transformed static content patterns | runtime filesystem access exists in the browser |
| Build/deploy table | learner can classify build/base/preview decisions | production deployment has actually succeeded |

**执行过程补充：** final lab 是 tooling review workspace。它整合 module graph、HMR classification、env exposure、assets、workers、glob、dynamic chunks 和 build/deploy review；但 production hosting 和 SSR 仍然是 evidence gaps，除非后续通过真实 deployment task 单独验证。

## 10. API / 语法索引

| API / Syntax | Layer | Meaning | Common Mistake |
| --- | --- | --- | --- |
| `<script type="module">` | Browser platform / Vite entry | 让浏览器以 ESM 加载 app entry，Vite 从这里解析 module graph | 把 `index.html` 当成 public template 而忽略 entry |
| `import.meta.env` | Vite env replacement | 读取 Vite built-ins 和 exposed public env values | 把 `VITE_` 当成 private secret |
| `import.meta.hot` | Vite HMR API | 开发期接受或处理 module update | 在 production logic 中依赖 HMR branch |
| `import.meta.glob` | Vite compile-time transform | 静态展开 matching modules into map | 用 runtime user input 生成 glob |
| `?url` | Vite asset query | 以 URL string 引入 asset | 写死 build 后 hash path |
| `?raw` | Vite asset query | 以 raw string 引入文件内容 | 导入包含 secret 的文本 |
| `?worker` | Vite worker query | 生成 Worker constructor | 期待 worker 共享 React hooks 或 DOM |
| `defineConfig` | Vite config helper | 提供 typed config authoring | 把 config 当 browser runtime module |
| `resolve.alias` | Vite/Rollup resolution | 改写 import resolution | 用 relative replacement 或过度隐藏路径 |
| `base` | Vite shared option | 设置 public base path | nested deploy 仍使用 `/` |
| `vite build` | Production build command | 生成 static assets and chunks | 把 build success 当成 deployment success |
| `vite preview` | Local preview command | 本地服务 `dist` | 当成 real production host |

## 11. 常见错误表

| Error | Type | Violated Rule | Correction | How to Recognize Later |
| --- | --- | --- | --- | --- |
| Treating Vite as React runtime | Concept boundary | Tooling owner and React owner are different | First classify the failure as module transform, render, typecheck, test, or build | Error stack points to transform or module fetch before React render |
| Putting secrets in `VITE_` env values | Security boundary | Client bundle values are public | Move secret to server-only env and expose only derived public config | Key name includes password, token, secret, private, or credential |
| Expecting `ImportMetaEnv` to parse runtime strings | Type/runtime boundary | Type declarations do not execute | Parse and validate env strings explicitly | `"false"` behaves as truthy string |
| Using `import.meta.glob` as runtime filesystem | Tooling boundary | Glob must be statically analyzable | Keep glob literal and filter resulting map at runtime | Build cannot analyze pattern or map is empty |
| Confusing dynamic chunk with data loading | Bundling boundary | Dynamic import loads code, not business data | Use route/data loading separately | Suspense fallback appears but data state is still idle |
| Relying on HMR cleanup in production | Environment boundary | HMR is dev-only | Put real cleanup in React effects and resource owners | Production build has no `import.meta.hot` behavior |
| Hardcoding asset URLs | Build/deploy boundary | Vite rewrites imported asset URLs and base path | Import assets or use public paths intentionally | Asset works in dev and 404s in deployed nested path |
| Treating preview as production hosting | Deployment evidence | Preview is local static serving only | Verify target host, base, fallback, cache and headers separately | No production URL, CDN logs, or host config evidence |

## 12. 最终小项目

最终小项目只用于整合本章机制，不替代前面的分节教学。它把 Vite tooling boundary 变成一个 SellerHub review workspace，让你练习把 module graph、HMR、env、assets、workers、glob、chunks、build 和 deployment boundary 放回真实项目审查语境。

### 12.1 项目目标

SellerHub Vite Boundary Lab 的目标不是做新业务功能，而是建立 tooling review 能力：看到一个 React feature slice 时，能说清哪些问题属于 React component owner，哪些问题属于 Vite transform/build owner，哪些问题属于 browser platform，哪些问题必须留给 deployment、SSR 或 backend integration。

### 12.2 为什么适合本章

SellerHub 场景已经在前面章节积累了 catalog、orders、dashboard、performance、testing 和 production architecture。Vite 第 19 章正好从这些功能背后抽出 tooling layer：catalog 可以练 CSS/assets，orders 可以练 env exposure，dashboard 可以练 worker metrics，content notes 可以练 glob，workspace cards 可以练 dynamic chunks 和 build review。

### 12.3 最终小项目结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Final mini project structure</span>
  </div>

```txt
sellerhub-vite-boundary-lab/
  sellerhub-vite-boundary-lab.tsx
  sellerhub-vite-boundary-data.ts
  module-graph-inspector.tsx
  hmr-lifecycle-card.tsx
  env-exposure-auditor.tsx
  asset-import-lab.tsx
  worker-metric-panel.tsx
  glob-content-reader.tsx
  dynamic-chunk-boundary-card.tsx
  build-deploy-decision-table.tsx
  tooling-review-checklist.tsx
```
</div>

### 12.4 文件职责

| File | Responsibility | Mechanism |
| --- | --- | --- |
| `sellerhub-vite-boundary-lab.tsx` | 组合所有 review cards | React composition over Vite tooling topics |
| `sellerhub-vite-boundary-data.ts` | 提供稳定的教学数据 | Plain TypeScript values |
| `module-graph-inspector.tsx` | 展示 entry、imports 和 lazy boundary | Module graph reading |
| `hmr-lifecycle-card.tsx` | 展示 HMR update、dispose 和 full reload distinction | HMR lifecycle |
| `env-exposure-auditor.tsx` | 审查 public env exposure risk | Env security boundary |
| `asset-import-lab.tsx` | 对比 URL、raw text 和 public asset | Asset transform |
| `worker-metric-panel.tsx` | 演示 main thread 与 worker message boundary | Browser worker |
| `glob-content-reader.tsx` | 读取 Vite glob raw note map | Compile-time glob |
| `dynamic-chunk-boundary-card.tsx` | 展示 dynamic import split point | Chunk boundary |
| `build-deploy-decision-table.tsx` | 区分 build、preview、static host 和 base | Production build review |
| `tooling-review-checklist.tsx` | 汇总迁移与 code review evidence | Engineering review |

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

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Output</span>
  </div>

```txt
Open /react/chapter-19
Review the SellerHub Vite Boundary Lab cards
```
</div>

### 12.6 预期输出或交互结果

页面应显示 Chapter 19 hero、Vite tooling mechanism cards、assets/chunks/config/deployment boundary cards，以及 SellerHub Vite Boundary Lab。worker card 的 heavy metric 需要用户触发；glob reader 应展示 notes；env auditor 应把 public、安全风险和 server-only keys 分开。

### 12.7 核心执行流程

1. Browser 通过 route 加载 Chapter 19 practice root。
2. Vite lazy route chunk 被请求并执行。
3. React 渲染 practice root，组合各机制 panels。
4. Env auditor 对普通 key/value entries 做 runtime classification。
5. Glob reader 读取 Vite 已转换好的 raw markdown map。
6. Worker card 在用户触发后创建 worker，主线程通过 message 接收结果。
7. Dynamic chunk card 展示 code-splitting boundary，而不是发起业务数据请求。
8. Build/deploy table 把 `build`、`preview`、`base`、static host、SPA fallback 和 SSR/backend boundary 分开。

### 12.8 常见错误与可选扩展

常见错误是把 lab 当成真实 deployment evidence、把 worker 当成 React state owner、把 glob 当 runtime filesystem、把 env typing 当 secret protection。可选扩展可以增加 bundle visual review、base path smoke checklist、public asset audit 或 HMR side-effect diary，但不要新增 framework、deployment package、SSR runtime 或 state-management library。

## 13. 额外速查表

**一句话总结：** Vite 是 React app 的 tooling path：开发期负责 module graph、transform、HMR 和 optimizer；生产期负责 build graph、chunks、assets 和 public base path。

| Concept | One-line Rule |
| --- | --- |
| Vite vs React | Vite loads/transforms/builds modules; React renders UI after modules execute |
| `index.html` | Source and graph entry, not hidden public template |
| HMR | Development module update mechanism, not production behavior |
| Fast Refresh | React plugin refresh semantics for component modules |
| Env | `VITE_` values are public once bundled |
| Env typing | Helps TypeScript, does not parse or secure runtime values |
| CSS Modules | Exports class mapping object from `.module.css` |
| Assets | Imported assets can be rewritten and hashed |
| Public dir | As-is assets served from root path |
| Worker | Separate browser thread, message boundary only |
| Glob | Compile-time static transform |
| Dynamic import | Code chunk boundary, not data boundary |
| Build | Static output generation |
| Preview | Local `dist` server, not production host |

| Similar Concepts | Difference |
| --- | --- |
| `import.meta.glob` vs dynamic import | Glob builds a module map from static pattern; dynamic import loads one analyzable chunk boundary |
| `?raw` vs fetch text | `?raw` bundles source file content; fetch reads runtime URL |
| CSS Modules vs global CSS | Modules export local mapping; global CSS applies selectors globally |
| `base` vs router basename | `base` rewrites asset URLs; router basename changes route matching/navigation |
| SSR vs static deployment | SSR owns request-time rendering; static deployment serves built files |

## 14. 工程迁移与代码审查要点

- **Vite config review**：确认 `plugins`、`resolve.alias`、`define`、`base`、`server`、`build`、`preview` 是否有真实需求；没有证据不要为了“高级”而扩展 config。
- **Env exposure review**：搜索 `VITE_` keys，按 public config、unsafe public secret、server-only secret 分类；检查 string parsing 和 runtime fallback。
- **Base path and deployment review**：确认部署路径、asset URL、SPA fallback、static host headers、cache policy 和 preview 的证据边界。
- **Alias review**：alias 应减少真实 import pain，而不是隐藏模块边界；filesystem replacement 应使用 absolute path；改 alias 后要验证 typecheck 和 build。
- **Asset import review**：source-imported assets、public assets、`?url`、`?raw` 各自有不同 transform 和 security implications。
- **Worker boundary review**：worker 不共享 React hooks、DOM 或 state；审查 message payload、lifecycle cleanup 和 fallback。
- **HMR side-effect cleanup review**：开发期 side effects 需要 `dispose` 或 React effect cleanup；不要把 HMR branch 当 production cleanup。
- **Build output and chunk review**：检查 chunk split 是否对应 route/feature boundary，避免过碎 chunks 或隐藏 shared dependency cost。
- **Plugin usage review**：plugin hook 会影响 dev/build transform；新增 plugin 前要有 failing case、官方 docs、config diff、rollback plan 和 quality gate evidence。
- **SSR/backend honesty review**：如果没有 server entry、hydration path、backend manifest integration 和 host evidence，就不要宣称 SSR 或 backend integration 已实现。

## 15. 如何转换成个人笔记

把笔记分成四列：`Trigger`、`Vite owner`、`React owner`、`Evidence`。每学一个机制，都写清触发动作是什么、Vite 改写了什么、React 是否参与 render/state、验证证据来自 terminal、network、browser console、test、typecheck 还是 build。这样可以避免把所有问题都归因给 React component。

## 16. 必须能回答的问题

1. 为什么 Vite 的 `index.html` 是 source，而不是普通 public template？
2. Native ESM dev server 和 production bundle 的主要差异是什么？
3. Dependency pre-bundling 解决哪两个开发期问题？
4. HMR boundary、accepted dependency、full reload 和 React Fast Refresh 的区别是什么？
5. 为什么 `VITE_` key 仍然不能保存 secret？
6. `ImportMetaEnv` 为什么不能保证 runtime env value 合法？
7. CSS Modules 返回的是什么 runtime value？
8. `?url`、`?raw`、`?worker` 分别改变了 import 的什么结果？
9. `import.meta.glob` 为什么不是 runtime filesystem API？
10. Dynamic import chunk boundary 和 data fetching boundary 为什么不能混为一谈？
11. `base` 配错时最常见的 production symptom 是什么？
12. 为什么 `vite preview` 不能替代真实 deployment verification？
13. 当前 Vite client lab 为什么不应该伪造 SSR 或 backend integration？

## 17. 最终记忆模型

浏览器从 HTML 开始；Vite 把 HTML、TSX、CSS、assets、workers、glob 和 dynamic imports 组织成 module graph；开发期按 native ESM 请求和 HMR 更新；生产期从 graph 生成 chunks 和 static assets；React runtime 在模块执行后才渲染 UI。TypeScript 只给你静态检查，不能替代 runtime parsing、security review、network evidence、build output inspection 或 deployment verification。

## 18. 官方文档阅读清单

1. [Vite Getting Started](https://vite.dev/guide/)：读 Overview、`index.html and Project Root`、CLI scripts，建立 dev server / build command / HTML entry 模型。
2. [Vite Features](https://vite.dev/guide/features.html)：读 HMR、TypeScript、CSS、CSS Modules、Static Assets、Glob Import、Dynamic Import。
3. [Vite Env Variables and Modes](https://vite.dev/guide/env-and-mode.html)：读 built-ins、`VITE_` exposure、env typing 和 mode / `NODE_ENV` difference。
4. [Vite Dependency Pre-Bundling](https://vite.dev/guide/dep-pre-bundling.html)：读 CommonJS / UMD compatibility 和 request reduction。
5. [Vite Static Asset Handling](https://vite.dev/guide/assets.html)：读 imported assets、public directory、`?url`、`?raw`。
6. [Vite Building for Production](https://vite.dev/guide/build.html)：读 build entry、static output、chunk and asset behavior。
7. [Vite Deploying a Static Site](https://vite.dev/guide/static-deploy.html)：读 static hosting and SPA fallback assumptions。
8. [Vite Config Reference](https://vite.dev/config/) 与 [Shared Options](https://vite.dev/config/shared-options.html)：读 `defineConfig`、`base`、`define`、`plugins`、`publicDir`、`resolve.alias`。
9. [Vite HMR API](https://vite.dev/guide/api-hmr.html)：读 `accept`、HMR boundary、`dispose`、`data`、`invalidate`。
10. [Vite Plugin API](https://vite.dev/guide/api-plugin.html)：读 plugin interface boundary，不急着写 production plugin。
11. [Vite SSR](https://vite.dev/guide/ssr.html) 与 [Backend Integration](https://vite.dev/guide/backend-integration.html)：只作为 boundary reference。
12. [React Render and Commit](https://react.dev/learn/render-and-commit)：用来区分 React render/commit 与 Vite transform/build。

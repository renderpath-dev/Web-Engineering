# Vue 第 12 章：Nuxt、SSR / SSG / Hybrid Rendering 与 Full-stack Boundary

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
  - [9.1 Nuxt mental model：Vue SPA、universal app、server engine、payload 与 deployment output](#section-9-1)
  - [9.2 Nuxt project structure：nuxt.config、app.vue、pages、layouts、components、composables、server、shared](#section-9-2)
  - [9.3 File-based routing：pages directory、dynamic route、NuxtLink、prefetch 与 manual Vue Router 的差异](#section-9-3)
  - [9.4 Layouts and page meta：NuxtLayout、slot、definePageMeta、admin layout 与 page wrapper boundary](#section-9-4)
  - [9.5 Rendering modes：SSR、CSR、SSG、prerender、hybrid rendering 与 routeRules](#section-9-5)
  - [9.6 Universal rendering lifecycle：server render、HTML response、payload、hydration 与 client navigation](#section-9-6)
  - [9.7 Hydration mismatch：non-deterministic values、browser-only APIs、DOM differences 与 fixed patterns](#section-9-7)
  - [9.8 Data fetching：$fetch、useFetch、useAsyncData、payload dedupe、pending/error/refresh](#section-9-8)
  - [9.9 Server API routes：server/api、defineEventHandler、event、query/body/params 与 JSON response](#section-9-9)
  - [9.10 Server routes and middleware：server/routes、server/middleware、request pipeline 与 no frontend authority](#section-9-10)
  - [9.11 Runtime config：private server config、runtimeConfig.public、serialization 与 secret boundary](#section-9-11)
  - [9.12 Plugins：universal、.client、.server plugins、NuxtApp injection 与 side-effect boundary](#section-9-12)
  - [9.13 Route middleware：anonymous、named、global middleware、navigateTo、abortNavigation 与 auth UI boundary](#section-9-13)
  - [9.14 State boundary：useState、Pinia comparison、payload state、server state 与 browser storage](#section-9-14)
  - [9.15 Client-only boundary：ClientOnly、onMounted、window/document/localStorage 与 browser API access](#section-9-15)
  - [9.16 SEO and meta：useHead、useSeoMeta、SSR HTML、crawler visibility 与 ranking boundary](#section-9-16)
  - [9.17 Error handling：createError、showError、error.vue、API errors 与 status code boundary](#section-9-17)
  - [9.18 Build and deployment output：nuxt build、nuxt generate、.output/server、.output/public、Node/edge/static targets](#section-9-18)
  - [9.19 Final integration：nuxt-fullstack-boundary-lab 如何串联 SSR、data、server、config、hydration 与 deployment](#section-9-19)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
  - [12.1 项目目标](#121-项目目标)
  - [12.2 项目结构与文件职责](#122-项目结构与文件职责)
  - [12.3 边界映射](#123-边界映射)
  - [12.4 完整核心代码](#124-完整核心代码)
  - [12.5 运行方式与预期行为](#125-运行方式与预期行为)
  - [12.6 常见错误与扩展任务](#126-常见错误与扩展任务)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 学习目标 | 对应文件 / 片段 | 类型 | 所在章节 |
| --- | --- | --- | --- |
| 理解 Nuxt 独立应用边界 | `src/learning/vue/chapter-12-nuxt-ssr-boundary/NuxtSsrBoundaryChapterApp.vue` | Vite summary component | 9.1 |
| 理解 Nuxt 配置和 routeRules | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/nuxt.config.ts` | Nuxt config | 9.5 |
| 理解 Nuxt 根组件 | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app.vue` | Nuxt app root | 9.2 |
| 理解 file-based routing | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/products/[id].vue` | Nuxt page | 9.3 |
| 理解 layout 和 page meta | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/admin/index.vue` | Nuxt page | 9.4 |
| 理解 useFetch | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/data/use-fetch.vue` | Nuxt page | 9.8 |
| 理解 useAsyncData | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/data/use-async-data.vue` | Nuxt page | 9.8 |
| 理解 server/api | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/server/api/products/index.get.ts` | Nitro API handler | 9.9 |
| 理解 server/routes | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/server/routes/health.get.ts` | Nitro route handler | 9.10 |
| 理解 runtimeConfig | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/config.vue` | Nuxt page | 9.11 |
| 理解 hydration fixed pattern | `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/components/HydrationMismatchFixed.vue` | Nuxt component | 9.7 |

## 0. 本章机制边界

本章只把 Nuxt 作为独立 full-stack boundary lab 研究，不把根 Vite 学习壳迁移成 Nuxt app。`nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/nuxt.config.ts`、`app/app.vue`、`app/pages/`、`app/layouts/`、`app/components/HydrationMismatchFixed.vue`、`app/pages/data/use-fetch.vue`、`app/pages/data/use-async-data.vue`、Nitro `server/api/products/index.get.ts`、`server/routes/health.get.ts`、runtime config page、route middleware、plugins 和 `.output` build/generate result 共同说明 SSR、SSG、hybrid、payload、hydration、server routes 与 deployment output。

执行 owner 横跨 Nuxt server runtime、Vue SSR renderer、Nitro request pipeline、browser hydration 和 client navigation。Browser request 命中 page route 时，Nuxt 根据 `app/pages` 解析 route，layout 包裹 page，middleware 可 redirect/abort，`useFetch` / `useAsyncData` 在 server render 中拿数据并写入 payload，Nitro `server/api` 返回 JSON，SSR HTML 发给 browser，client hydration 复用 DOM 和 payload，之后的 `NuxtLink` navigation 才转入 client-side。TypeScript 能检查 composable/server handler 的源码关系和 shared types，但不能证明 payload 没泄露 secret、server/client 初始 render 一致、routeRules 与部署目标匹配，或 `.output` 已在目标环境中真实运行。

跨边界的值包括 request URL、page file path、layout name、middleware return、async data key、payload JSON、server event、runtimeConfig.public/private、hydrated state、browser-only API access、`.output/server` 与 `.output/public` artifacts。它纠正的误解是“Nuxt 只是带文件路由的 Vue SPA”或“SSR 就是 server/client 各跑一遍”。本章排除 Nuxt module 生态、Content/Image/Auth session/layers、真实数据库和 provider-specific deployment；这些交给 Chapter 13 或后端/部署平台。

## 1. 本章解决的问题

前 11 章已经覆盖 Vue SPA 的应用边界、Router、Pinia、UI、API、测试、生产 build 和 static deployment。当前缺口是：当页面需要 SSR、SSG、SEO、server API、hybrid rendering 或部署成服务器输出时，Vite SPA 的心智模型不够了。

本章解决三个问题：

1. 如何判断一个页面应该继续是 Vite SPA，还是升级到 Nuxt universal app。
2. 如何追踪一次 Nuxt 请求从 URL、page file、layout、middleware、server render、payload、hydration 到 client navigation 的完整链路。
3. 如何在不引入数据库、真实认证、云平台或 Nuxt modules 的前提下，先把 SSR/full-stack boundary 学清楚。

## 2. 前置概念

- Chapter 06：已经理解 manual Vue Router route records、`RouterLink`、guards、route params 和 query state。
- Chapter 07：已经理解 Pinia、global client state、SSR-safe state factory 与 browser persistence 边界。
- Chapter 08：已经理解 page component、business component、project UI wrapper 的分层。
- Chapter 09：已经理解 frontend API client、unknown response、runtime validation 与 server authority。
- Chapter 10：已经理解 typecheck、test、build 是不同质量门禁。
- Chapter 11：已经理解 Vite `dist`、base path、static host、SPA fallback 与 production build。

## 3. 学习目标

- 能解释 Nuxt 为什么是 framework，而不是 Vue Router 加 Vite plugin。
- 能区分 SSR、CSR、SSG、prerender 与 hybrid rendering。
- 能解释 hydration 和 hydration mismatch 的具体原因。
- 能说明 `$fetch`、`useFetch`、`useAsyncData` 的 payload 行为差异。
- 能写出本地 Nitro `server/api`、`server/routes` 与 runtime config 的最小安全边界。
- 能比较 Vite `dist` 与 Nuxt `.output/server`、`.output/public`。

## 4. 核心机制证据链总览

1. Browser 请求 `/products/sku-1`，Nuxt 从 `app/pages/products/[id].vue` 建 route，而不是读取手写 Vue Router record。
2. `app/app.vue` 提供 app shell，`NuxtLayout` 根据 `definePageMeta({ layout: "admin" })` 选择 `app/layouts/admin.vue`，layout 用 slot 包 page，不拥有 page data。
3. route middleware 在 navigation layer 运行；它能 `navigateTo` 或 `abortNavigation`，但不能替代 Nitro server route 的 authorization。
4. `useFetch` / `useAsyncData` 在 server render 期间执行，将结果按 key 写入 payload；hydration 时 browser 复用 payload，避免同一数据立刻重复请求。
5. `server/api/products/index.get.ts` 是 Nitro API handler，读取 event/query/config 后返回 JSON；private runtimeConfig 只能 server 读，不能序列化给 page。
6. SSR 生成 HTML + payload，browser hydration 要求 client 初始 render 与 server HTML deterministic；`HydrationMismatchFixed.vue` 把 browser-only work 放进 `onMounted` 或 `<ClientOnly>`。
7. client navigation 通过 `NuxtLink` 预取/切换 page，后续交互仍是 Vue reactivity；它不同于第一次 browser request 的 server render。
8. `nuxt build` 产出 `.output/server` + `.output/public`，`nuxt generate` 产出 prerender/static result；这和 Chapter 11 的 Vite SPA `dist` 不是同一种 artifact。
9. final lab 同时检查 pages、layouts、middleware、data fetching、server/api、runtime config、hydration、routeRules 和 output，因此任何 blank page 都要先定位是 route、payload、server handler、hydration 还是 output。

## 5. 核心术语表

| Concept | Layer | Meaning | Common Misunderstanding |
| --- | --- | --- | --- |
| Nuxt universal app | Framework boundary | 同一套 Vue 代码在 server render 与 browser hydration 中协作 | 以为 Nuxt 只是 Vue Router 文件名语法 |
| Nitro | Server engine | 负责 server routes、API handlers、middleware 和 production server output | 以为 `server/api` 会进浏览器 bundle |
| Payload | Data transfer | server render 后序列化给 client hydration 的数据 | 以为 hydration 会重新请求所有 setup data |
| Hydration | Vue runtime | 浏览器复用 SSR HTML 并绑定事件和组件实例 | 以为它等于重新 mount 一个空页面 |
| routeRules | Nuxt rendering policy | 按 route 设置 prerender、ssr、swr 等策略 | 以为所有页面必须同一种 rendering mode |
| runtimeConfig.public | Serialization boundary | 会暴露给客户端的公开配置 | 把 secret 放进 public |

## 6. 底层心智模型

Nuxt 请求不是“浏览器下载 JS 后自己渲染”这么简单。以 `/products/p-100` 为例：

1. URL 命中 `app/pages/products/[id].vue`。
2. Nuxt 选择 layout，并执行 route middleware。
3. `<script setup>` 在 server render 阶段运行，调用 `useProductDetail("p-100")`。
4. `useFetch` 触发 Nitro `/api/products/p-100` handler。
5. server handler 读取 route param，返回 JSON response。
6. Nuxt 把 resolved data 放入 payload，并生成 HTML。
7. 浏览器收到 HTML 先显示内容，再下载 client bundle。
8. Vue hydration 复用 HTML，恢复 component instance、event listeners、reactive refs。
9. 后续通过 `NuxtLink` navigation 时，浏览器侧 router 接管，必要时预取 page component 和 payload。

## 7. 推荐目录结构

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab</span>
  </div>

```txt
package.json
nuxt.config.ts
app.vue
app/
  pages/
  layouts/
  components/
  composables/
  middleware/
  plugins/
server/
  api/
  routes/
  middleware/
  utils/
shared/
  types/
public/
  robots.txt
```
</div>

## 8. 示例运行方式

这些命令属于 Nuxt lab 子项目，不在根 Vite app 中执行。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
cd nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab
npm install
npm run dev
npm run typecheck
npm run build
npm run generate
npm run preview
```
</div>

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Nuxt mental model：Vue SPA、universal app、server engine、payload 与 deployment output

**结论：**

Nuxt 是一个拥有 client app、server engine、payload transfer 和 deployment output 的 application framework；本章因此把它放在 `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/`，而不是安装进根 Vite SPA。

**本节解决的问题：**

你需要解释为什么 `src/learning/vue/chapter-12-nuxt-ssr-boundary/NuxtSsrBoundaryChapterApp.vue` 只显示命令和边界说明，而不是把 Nuxt page 直接 import 到 Vite app。

**技术意义：**

这个边界防止两个应用生命周期混在一起：Vite 根应用由 `createApp(App)` 创建，Nuxt 应用由 Nuxt CLI、Nitro 和 `app.vue` 协作创建。

**概念解释：**

Vite SPA 的 owner 是浏览器 bundle；Nuxt universal app 的 owner 同时包括 Nitro server、Vue server renderer、payload serializer 和 browser hydration。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

`App.vue` 只能渲染 Chapter 12 summary panel；`nuxt.config.ts` 才能定义 runtime config、routeRules 和 Nuxt TypeScript 行为；`server/api` 只在 Nitro 中运行；`.output` 只由 Nuxt build/generate 产生。

**Nuxt 机制证据链：**

访问根 Vite `/` 时，`App.vue` 渲染 `NuxtSsrBoundaryChapterApp`。点击命令不是浏览器行为；开发者进入 Nuxt lab 后，`npm run dev` 启动 Nuxt。访问 `http://localhost:3030/products` 后，Nuxt 解析 `app/pages/products/index.vue`，使用 default layout，运行 global route middleware，执行 `useFetch`，触发 `/api/products`，序列化 payload，返回 HTML，再 hydration。

**TypeScript / Nuxt type generation 编译期过程：**

根 Vite `vue-tsc` 只检查 `src/**/*.vue` 与 `src/**/*.ts`；Nuxt lab 的 `nuxt prepare` 生成 `.nuxt/tsconfig.json` 和 auto-import 类型，再由 `nuxt typecheck` 检查 `app/`、`server/`、`shared/`。

**Server / Nitro / Vue / Browser 运行时过程：**

Vite summary panel 在浏览器运行；Nuxt page 初始请求可在 Nitro server 中渲染；hydration 后 Vue 在浏览器恢复交互。

**API / 语法规则：**

Nuxt lab 使用自己的 `package.json` scripts，根 `package.json` 不添加 Nuxt dependency。

**文件结构：**

`src/learning/vue/chapter-12-nuxt-ssr-boundary/` 是 Vite summary；`nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/` 是 Nuxt app。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">src/learning/vue/chapter-12-nuxt-ssr-boundary/NuxtSsrBoundaryChapterApp.vue</span>
  </div>

```vue
<script setup lang="ts">
import NuxtLabCommandPanel from "./components/NuxtLabCommandPanel.vue";
</script>

<template>
  <section aria-labelledby="chapter-12-title">
    <h2 id="chapter-12-title">Nuxt, SSR / SSG / Hybrid Rendering</h2>
    <NuxtLabCommandPanel />
  </section>
</template>
```
</div>

**逐行解释：**

`import` 只导入 Vite summary component，不导入 Nuxt app。`section` 是普通 Vue component template。`NuxtLabCommandPanel` 展示命令；它不启动 server，也不读取 `.nuxt`。

**执行过程：**

根 Vite main 创建 Vue app，渲染 `App.vue`，`App.vue` 渲染 Chapter 12 summary。Nuxt 生命周期直到开发者在 lab 目录执行 `npm run dev` 才开始。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

Vite summary 阶段没有 Nuxt request/payload/server route；Nuxt lab 启动后才存在 server render、payload、runtime config 和 `.output`。

**为什么得到这个结果：**

因为 Nuxt 需要自己的 build context 和 server context，不能被当成普通 child component 放入已有 Vite bundle。

**对比写法：**

错误方式是在根 `package.json` 安装 Nuxt 并把根 `App.vue` 改成 `<NuxtPage />`；正确方式是保留根 Vite shell，并创建独立 Nuxt lab。

**常见错误为什么错：**

“Nuxt 是 Vue Router 文件名语法”这个说法错在忽略 Nitro server、payload、runtime config、routeRules 和 deployment output。

**与真实项目的关系：**

真实项目迁移到 Nuxt 通常是 application-level decision，不是“给某个组件加一个 plugin”。

**与当前学习主线的关系：**

Chapter 11 结束于 Vite SPA production output；Chapter 12 扩展到 SSR/full-stack Vue output。

**最终记忆模型：**

Vite SPA summary panel 解释 Nuxt；Nuxt lab 运行 Nuxt；两个 app boundary 不互相伪装。

<a id="section-9-2"></a>

### 9.2 Nuxt project structure：nuxt.config、app.vue、pages、layouts、components、composables、server、shared

**结论：**

Nuxt 项目结构本身就是运行规则：`app/pages` 产生路由，`app/layouts` 包 page，`server/api` 产生 API endpoint，`shared/types` 只共享 TypeScript contract。

**本节解决的问题：**

解释为什么本章需要 `nuxt.config.ts`、`app.vue`、`app/`、`server/` 和 `shared/`，而不是只创建几个 `.vue` 文件。

**技术意义：**

目录结构减少手写 glue code，但也要求你知道每个目录归属于 browser、Vue runtime、Nuxt app layer 或 Nitro server layer。

**概念解释：**

`app.vue` 是 Nuxt app root；`app/pages` 是 page owner；`app/layouts/default.vue` 是默认 wrapper；`server/api/products/index.get.ts` 是 `/api/products` 的 server owner。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

`app/components` 可以被 page 自动导入；`server/utils` 不能被 client template 当作 browser utility；`shared/types` 不提供 runtime validation。

**Nuxt 机制证据链：**

访问 `/about` 时，Nuxt 从 `app/pages/about.vue` 生成 route record，套用 `app/layouts/default.vue`，执行 `app/middleware/role-demo.global.ts`，渲染 HTML。该页面没有 data fetching，因此 payload 只包含 Nuxt 必需状态；hydration 后 `NuxtLink` 继续负责 client navigation。

**TypeScript / Nuxt type generation 编译期过程：**

`nuxt prepare` 扫描 app directories，生成 component auto-import、composable auto-import 和 route-related 类型。`tsconfig.json` extends `.nuxt/tsconfig.json`。

**Server / Nitro / Vue / Browser 运行时过程：**

`app/pages` 和 `app/components` 可参与 SSR 与 client hydration；`server/api` 只在 Nitro 中响应请求；`public/robots.txt` 是静态资源。

**API / 语法规则：**

Nuxt v4 文档使用 `app/pages`、`app/layouts`、`app/components` 作为 app directory 结构。

**文件结构：**

本章真实结构包含 `app/pages/products/[id].vue`、`app/layouts/admin.vue`、`server/api/submit.post.ts` 和 `shared/types/api.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app.vue</span>
  </div>

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```
</div>

**逐行解释：**

`NuxtLayout` 选择 default 或 page meta 指定的 layout。`NuxtPage` 渲染当前 route 对应的 page component。这里没有 `createApp`，因为 Nuxt 在 framework 层完成 app creation。

**执行过程：**

Nuxt 启动后读取 config 和 app directory。请求到来时，route matcher 找到 page，layout 包住 page，然后 server render 输出 HTML。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

目录结构决定 request 的 page owner；payload 是否有数据取决于 page 是否调用 Nuxt data composables；build 后目录结构进入 `.output`。

**为什么得到这个结果：**

Nuxt 用 convention 把原来手写的 router/server glue code 变成文件系统规则。

**对比写法：**

手写 Vue Router route record 需要显式维护 `routes.ts`；Nuxt 通过 file name 推导 route。

**常见错误为什么错：**

把 `shared/types` 当 runtime validator 会让非法 request body 穿过 server boundary；TypeScript 类型擦除后不会检查 JSON。

**与真实项目的关系：**

团队协作时，目录就是 contract。看到文件路径就应该能判断它运行在 server、client、universal，还是只参与类型检查。

**与当前学习主线的关系：**

这把 Chapter 06 的 route records、Chapter 09 的 API boundary 和 Chapter 11 的 build output 放入一个 Nuxt structure。

**最终记忆模型：**

Nuxt directory is runtime policy。

<a id="section-9-3"></a>

### 9.3 File-based routing：pages directory、dynamic route、NuxtLink、prefetch 与 manual Vue Router 的差异

**结论：**

`app/pages/products/[id].vue` 直接生成 `/products/:id` 路由；`NuxtLink` 负责 hydration 后的 client navigation 和预取，而不是你手写 route records。

**本节解决的问题：**

解释 Chapter 06 的 `routes.ts` 为什么在 Nuxt lab 中没有对应文件。

**技术意义：**

file-based routing 让 URL 与 page file 建立强约定，同时减少 route table boilerplate。

**概念解释：**

`[id].vue` 的文件名成为 route param owner。`useRoute().params.id` 读取当前 URL param。`NuxtLink` 在 SSR HTML 中生成 anchor，在 client hydration 后接管 navigation。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

Nuxt page 是 route owner；product detail data 仍由 server API owner 提供；route param 不等于已验证 product record。

**Nuxt 机制证据链：**

用户访问 `/products/p-100`，Nuxt 匹配 `app/pages/products/[id].vue`，default layout 包装页面，global route middleware 设置 demo role，setup 读取 `route.params.id`，`useProductDetail("p-100")` 请求 `/api/products/p-100`，payload 携带 product，HTML 显示 product card，hydration 后 `NuxtLink` 返回列表页。

**TypeScript / Nuxt type generation 编译期过程：**

page file 与 auto-imported composables 由 Nuxt 生成类型支持。`String(route.params.id ?? "")` 把可能的 param shape 收敛为 API endpoint 需要的 string。

**Server / Nitro / Vue / Browser 运行时过程：**

server render 阶段可读取 route param 并发起 internal API call；browser client navigation 时也会重用同一 page code。

**API / 语法规则：**

`[id].vue` 表示 dynamic route；`NuxtLink` 的 `to` 接收 path 字符串。

**文件结构：**

`app/pages/products/index.vue` 对应 `/products`，`app/pages/products/[id].vue` 对应 `/products/:id`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/products/[id].vue</span>
  </div>

```vue
<script setup lang="ts">
const route = useRoute();
const productId = computed(() => String(route.params.id ?? ""));
const { data, error, status } = await useProductDetail(productId.value);
</script>
```
</div>

**逐行解释：**

`useRoute()` 读取当前 Nuxt route。`computed` 将 param 转成稳定 string。`useProductDetail` 包装 `useFetch`，因此 server render 结果可以进入 payload。

**执行过程：**

URL param 先决定 page；page 再决定 API URL；API response 决定 HTML 和 payload。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

`/products/p-100` 的 request 会产生包含 product detail 的 HTML 和 payload；如果 product 不存在，page 把 API error 转成 Nuxt error boundary。

**为什么得到这个结果：**

Nuxt 使用文件路径生成 route record，省掉手动 route table，但不省掉 param validation。

**对比写法：**

Chapter 06 手写 `path: "/users/:id"`；本章通过 `products/[id].vue` 表达同一类动态段。

**常见错误为什么错：**

把 `route.params.id` 当可信 product id 会把 URL 字符串误当业务实体；必须让 server handler 查找并返回 404。

**与真实项目的关系：**

内容站、电商详情页和文档页常用 file-based route 表达 URL structure。

**与当前学习主线的关系：**

这是对 Chapter 06 Router 的 framework-level 封装，不是替代 Router 原理。

**最终记忆模型：**

file path → route param → page setup → server API → payload → hydration。

<a id="section-9-4"></a>

### 9.4 Layouts and page meta：NuxtLayout、slot、definePageMeta、admin layout 与 page wrapper boundary

**结论：**

layout 是 page wrapper，不是 route record；`definePageMeta({ layout: "admin" })` 让 page 选择 `app/layouts/admin.vue`。

**本节解决的问题：**

解释 `app/pages/admin/index.vue` 为什么不手写 `<AdminLayout>` 包自己。

**技术意义：**

layout 把跨页面 shell 从 page content 中抽离，适合 admin shell、marketing shell、docs shell。

**概念解释：**

`app.vue` 中的 `NuxtLayout` 决定 wrapper，layout 中的 `<slot />` 承接 page content。page meta 是 page 向 Nuxt runtime 声明 layout 和 middleware 的 contract。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

layout 运行在 Vue app 层；它不能替代 server middleware，也不能证明用户已授权访问 server data。

**Nuxt 机制证据链：**

访问 `/admin?allow=admin`，page owner 是 `app/pages/admin/index.vue`，page meta 选择 `admin` layout 并启用 `auth-demo` route middleware。middleware 允许 navigation，layout 渲染 aside 和 slot，page 调用 `/api/admin/summary`，server handler 读取 private config 但只返回 derived safe field。

**TypeScript / Nuxt type generation 编译期过程：**

`definePageMeta` 是 Nuxt macro，由 Nuxt 类型生成识别；layout name 与 middleware name 通过 Nuxt project context 检查。

**Server / Nitro / Vue / Browser 运行时过程：**

route middleware 在 Nuxt app navigation 层运行；server API 在 Nitro 层运行。两者同名 middleware 不是同一类机制。

**API / 语法规则：**

`definePageMeta({ layout: "admin", middleware: "auth-demo" })` 放在 page `<script setup>` 中。

**文件结构：**

`app/layouts/default.vue` 默认包多数页面；`app/layouts/admin.vue` 包 admin page。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/admin/index.vue</span>
  </div>

```vue
<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "auth-demo",
});
</script>
```
</div>

**逐行解释：**

`layout` 指向 `app/layouts/admin.vue`。`middleware` 指向 `app/middleware/auth-demo.ts`。这里没有真实 auth，只是演示 route UI boundary。

**执行过程：**

Nuxt 匹配 admin page，先评估 middleware，再选择 layout，最后渲染 page slot。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

admin route 在 config 中设置 `ssr: false`，因此重点是 client-side admin UI boundary；server API 仍需要自己保护 private data。

**为什么得到这个结果：**

page meta 是 Nuxt 的 route-level metadata channel，layout 是 render wrapper channel。

**对比写法：**

手写 `<AdminLayout>` 会让每个 page 重复 wrapper；page meta 保持 route-level 配置集中在 page。

**常见错误为什么错：**

把 route middleware 当 security boundary 是错误的；它只能改善 navigation experience，不能替代 server authorization。

**与真实项目的关系：**

真实 admin app 仍需要 backend authorization，本章只做 layout/middleware boundary。

**与当前学习主线的关系：**

连接 Chapter 08 admin shell 与 Chapter 06 navigation guard。

**最终记忆模型：**

page declares meta；Nuxt selects layout；middleware gates navigation；server must still enforce authority。

<a id="section-9-5"></a>

### 9.5 Rendering modes：SSR、CSR、SSG、prerender、hybrid rendering 与 routeRules

**结论：**

Nuxt 可以按 route 使用 SSR、CSR、prerender 和 SWR-like hybrid policy；`routeRules` 是本章最小可验证入口。

**本节解决的问题：**

解释为什么 `/rendering/prerendered`、`/rendering/hybrid`、`/admin/**` 在同一个 Nuxt app 中有不同 rendering behavior。

**技术意义：**

真实项目通常不是“全站 SSR 或全站 SPA”的二选一。产品页、内容页、admin 页和健康检查有不同成本和 SEO 需求。

**概念解释：**

SSR 是 request-time render；CSR 主要由 browser render；SSG/prerender 是 build-time render；hybrid routeRules 允许按路径配置缓存或渲染策略。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

`routeRules` 属于 Nuxt/Nitro config；单个 Vue component 不应该自己假装决定 deployment output。

**Nuxt 机制证据链：**

请求 `/rendering/prerendered` 时，page owner 是 `app/pages/rendering/prerendered.vue`。`routeRules` 标记 prerender。运行 `npm run generate` 时，Nitro crawler 将 discoverable route 输出到 `.output/public`。请求 `/rendering/hybrid` 时，`swr: 60` 是 route policy；具体缓存效果还取决于 Nitro target。

**TypeScript / Nuxt type generation 编译期过程：**

`defineNuxtConfig` 的 `routeRules` 由 Nuxt config 类型约束。错误 key 或错误 value 会在 config/typecheck 阶段暴露。

**Server / Nitro / Vue / Browser 运行时过程：**

SSR request 经过 Nitro server render；prerender route 在 generate 阶段写出 static files；CSR admin route 更依赖 browser hydration。

**API / 语法规则：**

`routeRules` 写在 `nuxt.config.ts`。

**文件结构：**

`app/pages/rendering/ssr.vue`、`csr.vue`、`prerendered.vue`、`hybrid.vue` 对应四个演示页面。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/nuxt.config.ts</span>
  </div>

```ts
export default defineNuxtConfig({
  routeRules: {
    "/rendering/ssr": { ssr: true },
    "/rendering/prerendered": { prerender: true },
    "/rendering/hybrid": { swr: 60 },
    "/admin/**": { ssr: false },
  },
});
```
</div>

**逐行解释：**

`ssr: true` 保持 server render。`prerender: true` 标记 build-time static generation。`swr: 60` 表示 hybrid cache intent。`ssr: false` 把 admin 路径推向 client-side rendering。

**执行过程：**

dev server 读取 routeRules；build/generate 根据 rules 生成对应 output；preview 使用 production output 验证行为。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

SSR route 产生 request-time HTML；prerender route 产生 `.output/public` 静态 HTML；admin CSR route 初始 HTML 更薄，依赖 browser app。

**为什么得到这个结果：**

Nuxt 把 rendering policy 放到 route level，是为了解决不同页面的性能、SEO、成本和交互需求差异。

**对比写法：**

Vite SPA 全站通常只有 static assets 和 history fallback；Nuxt 可以混合 server output 与 static output。

**常见错误为什么错：**

没有运行 `npm run generate` 就宣称 prerender 成功，是把配置意图误当实际 output。

**与真实项目的关系：**

电商商品页常 SSR/SSG，admin 后台可 CSR，内容列表可使用 hybrid cache。

**与当前学习主线的关系：**

延伸 Chapter 11 的 deployment output，不再只有一个 `dist`。

**最终记忆模型：**

routeRules = per-route rendering and cache policy。

<a id="section-9-6"></a>

### 9.6 Universal rendering lifecycle：server render、HTML response、payload、hydration 与 client navigation

**结论：**

Universal rendering 的关键不是“server 先跑一遍，client 再跑一遍”这么粗糙，而是 server 生成 HTML 与 payload，client hydration 复用它们并恢复交互。

**本节解决的问题：**

解释为什么 `useState` 和 `useFetch` 在 SSR 中要能把初始数据转交给浏览器。

**技术意义：**

没有 payload transfer，client hydration 可能重复请求、得到不同初始值，甚至出现 mismatch。

**概念解释：**

HTML 解决 time-to-content；payload 解决数据延续；hydration 解决 interactivity；client navigation 解决后续 SPA-like 跳转。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

server-only value 不应序列化；public config 和 `useFetch` data 可以进入 client-visible payload。

**Nuxt 机制证据链：**

访问 `/rendering/ssr`，page owner 是 `app/pages/rendering/ssr.vue`，default layout 包装，global route middleware 运行，setup 中 `useState` 产生 `server-rendered payload value`，HTML 返回该文本，payload 保存 state。hydration 时 browser 复用 state；`SsrSafeClock` 的 `onMounted` 再更新 client time。

**TypeScript / Nuxt type generation 编译期过程：**

`useState<string>` 明确 state value 类型；Nuxt auto-import 类型让 `.vue` 中无需手写 import。

**Server / Nitro / Vue / Browser 运行时过程：**

server render 没有 DOM update 和 browser events；browser hydration 绑定事件；点击 button 只在 client 触发 mutation。

**API / 语法规则：**

`useState<T>(key, init)` 的 key 应稳定，init 应返回可序列化、deterministic 初始值。

**文件结构：**

`app/pages/rendering/ssr.vue` 与 `app/components/SsrSafeClock.vue` 一起展示生命周期。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/rendering/ssr.vue</span>
  </div>

```vue
<script setup lang="ts">
const initialRenderSource = useState<string>(
  "ssr-initial-render-source",
  () => "server-rendered payload value",
);
</script>
```
</div>

**逐行解释：**

key 标识 payload state。initializer 在初始 render 时创建 deterministic value。`string` 类型告诉 type checker template 读取的值类型。

**执行过程：**

server 创建 state，渲染 HTML，序列化 payload；browser hydration 读取同 key 的 payload state，避免初始值分叉。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

`useState` 值进入 payload；HTML 显示同一值；hydration 不重新生成不同 initial value。

**为什么得到这个结果：**

Nuxt 需要让 universal code 的 server result 和 client result 对齐。

**对比写法：**

直接在 template 中渲染 `new Date().toISOString()` 会让 server/client 初始文本不同。

**常见错误为什么错：**

把 setup 中所有代码都当 client-only 是错的；universal page setup 在 SSR initial request 中会先跑 server 侧。

**与真实项目的关系：**

用户信息、feature flag、product data 和 SEO content 都需要明确哪些可序列化、哪些必须 server-only。

**与当前学习主线的关系：**

连接 Chapter 07 SSR-safe state 与 Chapter 09 request lifecycle。

**最终记忆模型：**

server HTML + payload → browser hydration → client navigation。

<a id="section-9-7"></a>

### 9.7 Hydration mismatch：non-deterministic values、browser-only APIs、DOM differences 与 fixed patterns

**结论：**

Hydration mismatch 发生在 SSR HTML 与 client 初始 render 不一致时；修复原则是初始 render deterministic，browser-only work 放到 `onMounted` 或 `<ClientOnly>`。

**本节解决的问题：**

解释为什么 current time、random value、viewport、`window`、`document`、`localStorage` 不能直接参与 SSR initial template。

**技术意义：**

mismatch 会让 Vue 丢弃或修正部分 DOM，造成性能损耗、状态错位和难以复现的 UI bug。

**概念解释：**

SSR HTML 是 server 对 page 的第一次描述。hydration 要把 client component instance 对齐到这份 DOM。如果 client 第一次 render 得到不同文本或结构，就出现 mismatch。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

`window.innerWidth` 是 browser-only value；`Math.random()` 是 non-deterministic value；二者都不能直接决定 SSR HTML。

**Nuxt 机制证据链：**

访问 `/hydration/mismatch`，page owner 是 bad demo page，default layout 包装，global middleware 运行，`HydrationMismatchBad` 在 server setup 生成 random text，HTML 返回该值。浏览器 hydration 重新执行 setup，又生成另一个 random text，于是 mismatch 风险出现。访问 `/hydration/fixed` 时，`HydrationMismatchFixed` 初始值稳定，`onMounted` 后才生成 random value。

**TypeScript / Nuxt type generation 编译期过程：**

TypeScript 可以确认 `stableValue` 是 string，但不能证明它 deterministic。mismatch 是 runtime/hydration 问题，不是纯 type problem。

**Server / Nitro / Vue / Browser 运行时过程：**

server 没有 viewport 和 localStorage；browser 有。`onMounted` 只在 client 运行，适合 browser-only reads。

**API / 语法规则：**

使用 `onMounted`、`<ClientOnly>`、稳定 `useState` initializer，避免初始模板读取非确定值。

**文件结构：**

`app/components/HydrationMismatchBad.vue` 是隔离坏例子；`app/components/HydrationMismatchFixed.vue` 是可复用修复模式。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/components/HydrationMismatchFixed.vue</span>
  </div>

```vue
<script setup lang="ts">
const stableValue = useState<string>("stable-random-label", () => "stable-before-client");

onMounted(() => {
  stableValue.value = Math.random().toFixed(5);
});
</script>
```
</div>

**逐行解释：**

`useState` 初始值稳定并可序列化。`onMounted` 推迟 random generation 到 client hydration 完成后。mutation 发生在浏览器，Vue 再 patch DOM。

**执行过程：**

server 输出 `stable-before-client`；client hydration 看到相同文本；mounted hook 运行后更新为 random value。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

fixed route 的 HTML 和 payload 初始一致；random value 不属于 server HTML，而是 hydration 后 client update。

**为什么得到这个结果：**

Vue hydration 只要求 initial DOM 一致；hydration 之后的 reactive update 是正常 client behavior。

**对比写法：**

坏写法是在 `<script setup>` 顶层生成 random value 并立即渲染；好写法是在 client mounted 后更新。

**常见错误为什么错：**

忽略 hydration warning 会让你错过 server/client 初始状态分叉的证据。

**与真实项目的关系：**

常见于主题、时区、用户本地设置、广告脚本、A/B test 和 viewport responsive 逻辑。

**与当前学习主线的关系：**

连接 Chapter 03 lifecycle、Chapter 07 SSR-safe state 和 Chapter 11 production error diagnosis。

**最终记忆模型：**

SSR initial render must be deterministic；browser-only work waits for client。

<a id="section-9-8"></a>

### 9.8 Data fetching：$fetch、useFetch、useAsyncData、payload dedupe、pending/error/refresh

**结论：**

`useFetch` 和 `useAsyncData` 是 Nuxt 为 universal rendering 提供的 data composables；它们把 server result 放入 payload，避免 hydration 重复请求。

**本节解决的问题：**

解释为什么不在 page setup 里直接 `$fetch("/api/products")`。

**技术意义：**

如果 setup-time raw `$fetch` 在 server 和 client 各执行一次，可能造成重复请求、状态分叉、mismatch 或性能浪费。

**概念解释：**

`$fetch` 是 request utility；`useFetch` 是 URL-oriented wrapper；`useAsyncData` 是 keyed async wrapper。`status`、`error`、`refresh` 让 UI 表达 request lifecycle。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

data composable 在 page setup 中运行，可能触发 internal Nitro API。payload 是 client-visible，不要放 secret。

**Nuxt 机制证据链：**

访问 `/data/use-fetch`，page owner 是 `app/pages/data/use-fetch.vue`，default layout 包装，route middleware 运行，`useFetch("/api/products")` 调用 Nitro API，server handler 返回 product list，Nuxt 序列化 payload，HTML 显示列表。hydration 时 client 读取 payload，不重复请求初始 list；点击 refresh 后才主动请求。

**TypeScript / Nuxt type generation 编译期过程：**

`useFetch<ApiResult<ProductListResponse>>` 给 `data` ref 提供 discriminated union 类型；TypeScript 仍不验证网络响应，server handler 和 runtime guard 才负责 runtime boundary。

**Server / Nitro / Vue / Browser 运行时过程：**

server render 可直接调用 internal route；browser refresh 调用 HTTP endpoint。二者都返回同一 API shape。

**API / 语法规则：**

`useFetch(url, { key })` 适合 URL request；`useAsyncData(key, handler)` 适合自定义 async process；event handler 中可用 `$fetch`。

**文件结构：**

`app/pages/data/use-fetch.vue` 与 `app/pages/data/use-async-data.vue` 分别展示两种方式。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/data/use-async-data.vue</span>
  </div>

```vue
<script setup lang="ts">
import type { ApiResult } from "../../../shared/types/api";
import type { ProductListResponse } from "../../../shared/types/product";

const { data, error, refresh, status } = await useAsyncData<
  ApiResult<ProductListResponse>
>("page:async-products", () => $fetch("/api/products"));
</script>
```
</div>

**逐行解释：**

type imports 只参与编译期。explicit key 让 payload entry 可识别。handler 使用 `$fetch` 但被 `useAsyncData` 包住，因此 Nuxt 能接管 payload。

**执行过程：**

server render 调 handler，写 payload；template 读取 `status` 和 `data`；hydration 复用 payload；refresh 触发新请求。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

data fetching 结果进入 payload；error ref 不为空时 UI 展示错误；build output 不内联 private config。

**为什么得到这个结果：**

Nuxt 通过 composable key 和 payload serialization 把 server/client setup 连接起来。

**对比写法：**

raw `$fetch` 适合 click submit；setup initial data 应优先用 `useFetch` 或 `useAsyncData`。

**常见错误为什么错：**

把 `useFetch` 与 `$fetch` 当完全相同会忽略 payload dedupe 和 navigation blocking 行为。

**与真实项目的关系：**

商品列表、文章详情、SEO content 都应避免 hydration 重复请求。

**与当前学习主线的关系：**

延续 Chapter 09 API request state，但加入 Nuxt payload layer。

**最终记忆模型：**

setup initial data → useFetch/useAsyncData → payload；event request → $fetch。

<a id="section-9-9"></a>

### 9.9 Server API routes：server/api、defineEventHandler、event、query/body/params 与 JSON response

**结论：**

`server/api` 文件会注册 Nitro API endpoint；handler 运行在 server，能读取 params/body/config，但不能把 private value 泄露给 client。

**本节解决的问题：**

解释 `server/api/products/[id].get.ts` 如何成为 `/api/products/:id`。

**技术意义：**

Nuxt server API 是 full-stack boundary 的最小入口，不需要先引入外部 backend、database 或 API client library。

**概念解释：**

`defineEventHandler` 接收 request event。`getRouterParam` 读取动态段。`readBody` 读取 unknown request body。返回对象会序列化成 JSON。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

server API route 是 authority owner；frontend page 不是 authority owner。

**Nuxt 机制证据链：**

访问 `/products/p-100`，page 调 `useProductDetail`，内部请求 `/api/products/p-100`。Nitro 匹配 `server/api/products/[id].get.ts`，handler 读取 id，查找 mockProducts，没找到就 throw `createError(404)`，找到就返回 JSON。Nuxt page data 进入 payload，HTML 显示 product。

**TypeScript / Nuxt type generation 编译期过程：**

`ProductDetailResponse` 限定返回对象 shape；但 URL param 是 runtime string，必须运行时查找。

**Server / Nitro / Vue / Browser 运行时过程：**

handler 只在 Nitro server 运行；浏览器只收到 JSON response 或 serialized payload。

**API / 语法规则：**

`.get.ts` 表示 GET handler；`[id]` 表示 dynamic server route segment。

**文件结构：**

`server/api/products/index.get.ts` 返回 list；`server/api/products/[id].get.ts` 返回 detail。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/server/api/products/[id].get.ts</span>
  </div>

```ts
export default defineEventHandler((event) => {
  const productId = getRouterParam(event, "id") ?? "";
  const product = mockProducts.find((candidate) => candidate.id === productId);

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Product not found",
    });
  }

  return ok({ product: mapProductDto(product) });
});
```
</div>

**逐行解释：**

`event` 是 Nitro request context。`getRouterParam` 读取 URL dynamic segment。`find` 是 runtime validation。`createError` 设置 HTTP-like error。`ok` 返回统一成功 envelope。

**执行过程：**

request 到 `/api/products/p-100`，handler 查找 product，返回 JSON；page 的 data composable 接收 result。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

server API response 可进入 page payload；404 error 可进入 Nuxt error boundary；private config 不参与此 response。

**为什么得到这个结果：**

Nitro 根据 `server/api` 文件系统生成 endpoint。

**对比写法：**

Chapter 09 的 mock Axios adapter 在 browser 模拟 backend；本章的 handler 在 server runtime 中是真 endpoint。

**常见错误为什么错：**

把 shared TypeScript type 当 request validation 会导致非法 body 或 param 未被拦截。

**与真实项目的关系：**

后续接数据库或 auth 时，server API route 是自然扩展点，但本章先保持 local mock。

**与当前学习主线的关系：**

把 Chapter 09 frontend API boundary 推进到 Nuxt server boundary。

**最终记忆模型：**

server/api file → Nitro endpoint → JSON response → payload or browser request。

<a id="section-9-10"></a>

### 9.10 Server routes and middleware：server/routes、server/middleware、request pipeline 与 no frontend authority

**结论：**

`server/routes` 创建非 `/api` server route；`server/middleware` 进入 Nitro request pipeline；它们和 app route middleware 是不同层。

**本节解决的问题：**

解释 `/health` 为什么来自 `server/routes/health.get.ts`，而不是 `app/pages/health.vue`。

**技术意义：**

健康检查、webhook、feed、sitemap、robots 这类 response 不一定是 Vue page 或 JSON API。

**概念解释：**

`server/routes` 处理 server request；`server/middleware` 可以观察或修改 request context；`app/middleware` 处理 Vue navigation。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

server middleware 不能依赖 browser state；route middleware 不能保护 direct server endpoint。

**Nuxt 机制证据链：**

访问 `/health`，Nitro request pipeline 先运行 `server/middleware/request-log.ts`，再匹配 `server/routes/health.get.ts`，返回 JSON。这个 request 不进入 `app/pages`，没有 layout，没有 page hydration，也没有 NuxtLink navigation。

**TypeScript / Nuxt type generation 编译期过程：**

server middleware 和 route handler 使用 Nitro auto-import 类型；`event.context` 可承载 request-scoped server context。

**Server / Nitro / Vue / Browser 运行时过程：**

全部发生在 Nitro server；Vue component tree 不参与。

**API / 语法规则：**

`server/routes/health.get.ts` 对应 `/health`；`server/api/config.get.ts` 对应 `/api/config`。

**文件结构：**

`server/middleware/request-log.ts` 和 `server/routes/health.get.ts` 共同展示 server pipeline。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/server/routes/health.get.ts</span>
  </div>

```ts
export default defineEventHandler(() => {
  return {
    status: "ok",
    service: "nuxt-fullstack-boundary-lab",
  };
});
```
</div>

**逐行解释：**

handler 不返回 Vue component，而是直接返回 serializable object。Nitro 把它变成 HTTP response body。

**执行过程：**

request → server middleware → health handler → JSON response。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

这个 request 没有 server render/payload/hydration；它验证的是 Nitro route boundary。

**为什么得到这个结果：**

Nuxt 区分 page route 与 server route。

**对比写法：**

`app/pages/health.vue` 会生成 HTML page；`server/routes/health.get.ts` 返回 server response。

**常见错误为什么错：**

用 route middleware 保护 `/api/*` 是错的；Nuxt app route middleware 不运行在 server endpoint request 上。

**与真实项目的关系：**

健康检查和 webhook 不能依赖浏览器导航。

**与当前学习主线的关系：**

补齐 Chapter 09 没有真实 server pipeline 的部分。

**最终记忆模型：**

app middleware guards navigation；server middleware handles Nitro request pipeline。

<a id="section-9-11"></a>

### 9.11 Runtime config：private server config、runtimeConfig.public、serialization 与 secret boundary

**结论：**

`runtimeConfig.public` 会暴露给客户端；private runtime config 只能在 server 侧读取，不能返回给 page 或 API response。

**本节解决的问题：**

解释 `apiSecret` 为什么存在于 `nuxt.config.ts`，但页面只能显示 `config.public`。

**技术意义：**

配置边界是 SSR/full-stack 项目最容易泄密的地方。public config 是 serialization boundary，不是“比较方便的全局变量”。

**概念解释：**

`useRuntimeConfig()` 在 server handler 中能读 private 和 public；在 client-visible page 中只能安全使用 public branch。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

server-only value 是 `runtimeConfig.apiSecret`；client-visible value 是 `runtimeConfig.public.appTitle`。

**Nuxt 机制证据链：**

访问 `/config`，page owner 是 `app/pages/config.vue`，page 调 `/api/config`，server handler 读取 runtime config，只构造 `PublicRuntimeConfigShape` 返回。HTML 和 payload 只能包含 public config。访问 `/api/admin/summary` 时，server handler 能判断 private config exists，但不返回 secret value。

**TypeScript / Nuxt type generation 编译期过程：**

`PublicRuntimeConfigShape` 与 `ServerRuntimeConfigShape` 描述意图，但真正防泄漏取决于 handler 不返回 private field。

**Server / Nitro / Vue / Browser 运行时过程：**

server handler 能访问 private config；browser template 不应渲染 private value。

**API / 语法规则：**

`runtimeConfig: { apiSecret, public: { apiBase, appTitle } }`。

**文件结构：**

`nuxt.config.ts` 定义 config；`server/api/config.get.ts` 返回 public config；`app/pages/config.vue` 显示 public config。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/server/api/config.get.ts</span>
  </div>

```ts
export default defineEventHandler(() => {
  const config = useRuntimeConfig();
  const publicConfig = {
    apiBase: config.public.apiBase,
    appTitle: config.public.appTitle,
  };

  return {
    ok: true,
    data: publicConfig,
  };
});
```
</div>

**逐行解释：**

`useRuntimeConfig` 读取 runtime config。`publicConfig` 只复制 public branch。return object 不包含 `apiSecret`。

**执行过程：**

page 请求 `/api/config`；handler 在 server 读取 config；response 只返回 public fields；payload 可安全序列化。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

public config 可进入 HTML/payload；private config 只影响 server-side derived result。

**为什么得到这个结果：**

Nuxt 需要明确区分可序列化给 client 的配置与只能在 server 使用的配置。

**对比写法：**

把 token 放到 `runtimeConfig.public` 等于主动公开。

**常见错误为什么错：**

返回 private runtime config from server API 会绕过 Nuxt public/private boundary。

**与真实项目的关系：**

API base path、site title 可 public；database URL、API secret、private token 必须 server-only。

**与当前学习主线的关系：**

延续 Chapter 11 env exposure 和 Chapter 09 secret boundary。

**最终记忆模型：**

public config serializes；private config stays server-side。

<a id="section-9-12"></a>

### 9.12 Plugins：universal、.client、.server plugins、NuxtApp injection 与 side-effect boundary

**结论：**

Nuxt plugin 的文件后缀决定运行边界：universal 两侧可运行，`.client` 只在浏览器，`.server` 只在 server。

**本节解决的问题：**

解释为什么 `client-analytics.client.ts` 可以用 `window`，而 `universal-logger.ts` 不应该使用 browser-only API。

**技术意义：**

plugin 常用于 analytics、request id、third-party SDK、app injection。错误边界会造成 SSR crash 或 hydration side effect。

**概念解释：**

`defineNuxtPlugin` 接收 Nuxt app context。`.client` suffix 把 side effect 限制到 browser；`.server` suffix 把 request/server-only value 限制到 server。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

browser API 只能在 `.client` plugin 或 mounted/client-only component 中使用；request id 适合 server plugin。

**Nuxt 机制证据链：**

访问任意 page，Nuxt 初始化 app plugins。server render 时 `.server` 和 universal plugin 可运行；client hydration 时 `.client` 和 universal plugin 可运行。`window.dispatchEvent` 只在 client plugin 中出现，因此 server render 不会访问 `window`。

**TypeScript / Nuxt type generation 编译期过程：**

Nuxt 扫描 `app/plugins` 并生成 plugin 类型；TypeScript 不能仅靠类型阻止 universal plugin 使用 browser global，文件后缀是关键约定。

**Server / Nitro / Vue / Browser 运行时过程：**

server plugin 可为 Nuxt app 提供 request-scoped value；client plugin 可执行 analytics browser side effect。

**API / 语法规则：**

`defineNuxtPlugin((nuxtApp) => { nuxtApp.provide("key", value) })`。

**文件结构：**

`app/plugins/client-analytics.client.ts`、`server-request-id.server.ts`、`universal-logger.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/plugins/client-analytics.client.ts</span>
  </div>

```ts
export default defineNuxtPlugin(() => {
  window.dispatchEvent(new CustomEvent("nuxt-boundary-lab-ready"));
});
```
</div>

**逐行解释：**

`.client` 文件名把代码限制到 browser。`window.dispatchEvent` 因此不会在 Nitro server render 时执行。

**执行过程：**

client bundle hydration 阶段加载 plugin，触发 browser event；server render 阶段跳过它。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

plugin side effect 不进入 payload；它影响 app initialization boundary。

**为什么得到这个结果：**

Nuxt 用文件后缀表达执行环境。

**对比写法：**

把同样代码放进 universal plugin 会让 server 尝试访问 `window`。

**常见错误为什么错：**

browser-only analytics SDK 放在 universal plugin 会导致 SSR runtime error。

**与真实项目的关系：**

支付、地图、analytics、AB testing SDK 都需要明确 client/server 后缀。

**与当前学习主线的关系：**

连接 Chapter 01 plugin registration 和 Chapter 11 production side effect。

**最终记忆模型：**

plugin suffix controls execution side。

<a id="section-9-13"></a>

### 9.13 Route middleware：anonymous、named、global middleware、navigateTo、abortNavigation 与 auth UI boundary

**结论：**

Nuxt route middleware 运行在 app navigation 层；它可以 redirect 或 abort navigation，但不能替代 server-side authorization。

**本节解决的问题：**

解释 `auth-demo.ts` 为什么只能作为 demo guard，不能保护 `/api/admin/summary`。

**技术意义：**

前端导航控制改善体验；真正权限必须在 server/API 层执行。

**概念解释：**

named middleware 放在 `app/middleware/auth-demo.ts`，page 用 `definePageMeta` 引用。global middleware 用 `.global` suffix 自动运行。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

route middleware 可以访问 `to`/`from`，但不能信任它作为 backend security proof。

**Nuxt 机制证据链：**

访问 `/admin`，Nuxt 匹配 `app/pages/admin/index.vue`，读取 page meta，执行 `auth-demo`。如果 query 不含 `allow=admin`，返回 `navigateTo("/")`。global middleware 设置 demo role state。server API handler 仍必须自己决定能否返回 private-derived data。

**TypeScript / Nuxt type generation 编译期过程：**

`defineNuxtRouteMiddleware` 提供 `to` route 类型；`DemoRole` 是 shared type，只描述 state 值。

**Server / Nitro / Vue / Browser 运行时过程：**

route middleware 可在 initial navigation 和 client navigation 中运行；server endpoint request 不经过它。

**API / 语法规则：**

`return navigateTo("/target")` redirect；`return abortNavigation()` abort。

**文件结构：**

`app/middleware/auth-demo.ts` named；`app/middleware/role-demo.global.ts` global。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/middleware/auth-demo.ts</span>
  </div>

```ts
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith("/admin") && to.query.allow !== "admin") {
    return navigateTo("/?admin=denied");
  }
});
```
</div>

**逐行解释：**

`to` 是目标 route。condition 是 demo-only UI gate。`navigateTo` 让 Nuxt 改变 navigation result。

**执行过程：**

page render 前执行 middleware；通过后才选择 layout 和渲染 page。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

redirect 会改变 page request result；它不改变 server API 的 authority model。

**为什么得到这个结果：**

Nuxt route middleware 属于 Vue app router layer。

**对比写法：**

server middleware 放 `server/middleware`，处理 Nitro request；route middleware 放 `app/middleware`，处理 page navigation。

**常见错误为什么错：**

把 query `allow=admin` 当真实 auth 是错误的；它只是 demo navigation input。

**与真实项目的关系：**

真实权限需要 cookie/session/token server validation，本章不实现。

**与当前学习主线的关系：**

连接 Chapter 06 guards 与 Chapter 09 backend authority。

**最终记忆模型：**

route middleware controls page navigation, not server authority。

<a id="section-9-14"></a>

### 9.14 State boundary：useState、Pinia comparison、payload state、server state 与 browser storage

**结论：**

`useState` 是 Nuxt SSR-aware shared state primitive；Pinia 仍适合复杂 client/global domain state，但本章不安装 `@pinia/nuxt`。

**本节解决的问题：**

解释 Chapter 07 的 Pinia store 与 Nuxt `useState` 的关系。

**技术意义：**

SSR 下不能把 per-user state 放在 module singleton。`useState` 使用 key 和 payload 协调 request/client 初始 state。

**概念解释：**

`useState` 的 state 可序列化到 payload；browser storage 必须等 client；server state 来自 request/API/database，不能长期复制到 client global state。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

payload state 是 client-visible；server-only state 不应该进入 `useState`。

**Nuxt 机制证据链：**

访问 `/rendering/ssr`，`useState("ssr-initial-render-source")` 创建 state，payload 序列化。访问 `/hydration/fixed`，初始 state deterministic，mounted 后更新。route middleware 中 `useState("demo-role")` 表示 navigation demo state，不是 secure auth state。

**TypeScript / Nuxt type generation 编译期过程：**

`useState<DemoRole>` 约束 role value；不代表用户身份已验证。

**Server / Nitro / Vue / Browser 运行时过程：**

server render 创建 payload state；browser hydration 复用；localStorage 只能 client after mount。

**API / 语法规则：**

`useState<T>("stable-key", () => initialValue)`。

**文件结构：**

`app/middleware/role-demo.global.ts` 与 `app/components/HydrationMismatchFixed.vue` 使用 `useState`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/middleware/role-demo.global.ts</span>
  </div>

```ts
import type { DemoRole } from "../../shared/types/auth";

export default defineNuxtRouteMiddleware((to) => {
  const role = useState<DemoRole>("demo-role", () => "guest");
  role.value = to.query.allow === "admin" ? "admin" : "guest";
});
```
</div>

**逐行解释：**

type import 描述 role union。`useState` 创建 SSR-aware state。query 只影响 demo UI role，不能作为 security proof。

**执行过程：**

navigation 发生时 middleware 更新 state；page 可读取 state；payload 可能携带 initial state。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

state 可进入 payload；server-only auth decision 不应进入 browser-only state。

**为什么得到这个结果：**

Nuxt 需要 request-safe state primitive，避免 cross-request pollution。

**对比写法：**

module-scope `reactive({ user })` 在 SSR server 中可能跨 request 共享。

**常见错误为什么错：**

把 browser localStorage 当 SSR initial state 会在 server render 访问不存在的 API。

**与真实项目的关系：**

小型 SSR-aware state 用 `useState`；复杂 domain store 后续可加 Pinia，但不是本章目标。

**与当前学习主线的关系：**

继承 Chapter 07 的 SSR-safe state factory 原则。

**最终记忆模型：**

useState is payload-aware; Pinia is optional for larger client/global state。

<a id="section-9-15"></a>

### 9.15 Client-only boundary：ClientOnly、onMounted、window/document/localStorage 与 browser API access

**结论：**

Browser APIs 必须在 client-only boundary 内访问：`<ClientOnly>` 包 UI，`onMounted` 包逻辑。

**本节解决的问题：**

解释 `ClientOnlyViewport.vue` 为什么不直接在 SSR setup 中读取 `window.innerWidth`。

**技术意义：**

SSR server runtime 没有 DOM、window、document、localStorage。错误访问会导致 server render crash。

**概念解释：**

`<ClientOnly>` 告诉 Nuxt 这部分 UI 只在 client render；`onMounted` 告诉 Vue 这段逻辑只在 DOM mount 后运行。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

client-only value 不进入 SSR HTML；server-only value 不进入 browser template。

**Nuxt 机制证据链：**

访问 `/rendering/csr`，page owner 是 CSR demo page，default layout 包装。template 中 `<ClientOnly>` 在 SSR 输出 fallback，hydration 后 browser 加载 `ClientOnlyViewport`，composable 在 `onMounted` 中读取 `window.innerWidth`，Vue patch DOM 显示 viewport。

**TypeScript / Nuxt type generation 编译期过程：**

DOM lib 让 TypeScript 认识 `window`，但这不表示 server runtime 存在 `window`。

**Server / Nitro / Vue / Browser 运行时过程：**

server 输出 fallback；browser mounted 后读取 viewport；resize listener 在 unmount 时清理。

**API / 语法规则：**

`<ClientOnly fallback="...">` 用于 client-only component；`onMounted` 用于 client lifecycle。

**文件结构：**

`app/components/ClientOnlyViewport.vue` 和 `app/composables/useBrowserViewport.ts`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/composables/useBrowserViewport.ts</span>
  </div>

```ts
export interface BrowserViewport {
  readonly width: number;
  readonly height: number;
}

export function useBrowserViewport() {
  const viewport = ref<BrowserViewport | null>(null);

  function updateViewport(): void {
    viewport.value = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  onMounted(() => {
    updateViewport();
    window.addEventListener("resize", updateViewport);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateViewport);
  });

  return {
    viewport,
  };
}
```
</div>

**逐行解释：**

`ref<BrowserViewport | null>(null)` 给 TypeScript 完整的可能值集合：SSR 阶段是 `null`，browser mounted 后可以是 `{ width, height }`。`null` 是 SSR-safe initial value，因为 server render 不读取 browser viewport。`updateViewport` 中的 object assignment 在 `onMounted` 后执行，因此赋值给 `viewport.value` 是合法的。`window` 仍然只在 browser-only lifecycle 中读取。

**执行过程：**

SSR 输出 fallback 或 null state；hydration 完成；mounted hook 读取 viewport；DOM patch 显示尺寸。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

viewport 不进入 payload，也不影响 server HTML。

**为什么得到这个结果：**

browser API 是 platform-specific value，只能在 browser platform 读取。

**对比写法：**

setup 顶层 `const width = window.innerWidth` 会在 server render crash。

**常见错误为什么错：**

因为 TypeScript DOM type 存在就以为 server runtime 有 `window`，这是 type environment 和 runtime environment 混淆。

**与真实项目的关系：**

localStorage、matchMedia、ResizeObserver、third-party widgets 都应按这个模式隔离。

**与当前学习主线的关系：**

连接 Chapter 03 lifecycle 与 Chapter 11 production runtime error。

**最终记忆模型：**

Browser API waits for browser lifecycle。

<a id="section-9-16"></a>

### 9.16 SEO and meta：useHead、useSeoMeta、SSR HTML、crawler visibility 与 ranking boundary

**结论：**

Nuxt 可以把 `useSeoMeta` 和 `useHead` 的结果渲染进 SSR HTML，提高 crawler visibility；但 metadata 不保证搜索排名。

**本节解决的问题：**

解释为什么内容页、电商页更适合 Nuxt SSR/SSG，而内部后台未必需要。

**技术意义：**

SEO 依赖 crawler 能看到 HTML content 和 meta；Vite SPA 纯 client render 可能让异步内容出现较晚。

**概念解释：**

`useSeoMeta` 描述常见 SEO meta；`useHead` 描述更一般 head entries。SSR/SSG 能把 head 和 HTML 一起返回。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

SEO metadata 是 public HTML，不应包含 private config 或 user-specific secret。

**Nuxt 机制证据链：**

访问 `/seo`，page owner 是 `app/pages/seo.vue`，setup 调用 `useSeoMeta` 和 `useHead`，server render 把 head entries 合并到 HTML。浏览器和 crawler 先收到 HTML head，再 hydration。

**TypeScript / Nuxt type generation 编译期过程：**

Nuxt 提供 head composables 类型；literal meta 字段由 TypeScript 检查基本 shape。

**Server / Nitro / Vue / Browser 运行时过程：**

server render 阶段生成 head；client navigation 时 Nuxt 更新 document head。

**API / 语法规则：**

`useSeoMeta({ title, description, ogTitle })`；`useHead({ link: [...] })`。

**文件结构：**

`app/pages/seo.vue` 是 SEO/meta demo。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/seo.vue</span>
  </div>

```vue
<script setup lang="ts">
useSeoMeta({
  title: "Nuxt SEO Boundary Lab",
  description: "SSR HTML can include metadata, but metadata does not guarantee ranking.",
});
</script>
```
</div>

**逐行解释：**

`title` 和 `description` 是 public metadata。它们可以出现在 SSR HTML 中，不依赖 client JavaScript 完成后才出现。

**执行过程：**

server render 收集 head entries；HTML response 包含 meta；hydration 后 Nuxt 维护 head state。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

SEO route 的关键输出是 HTML head；payload 不是 SEO 的唯一载体。

**为什么得到这个结果：**

Nuxt 在 framework 层整合 page rendering 和 head management。

**对比写法：**

纯 Vite SPA 如果在 mounted 后才设置 meta，crawler 可能先看到不完整 HTML。

**常见错误为什么错：**

“用了 SSR 就排名好”是错误结论；SSR 改善可见性，不替代内容质量、链接、性能和搜索引擎策略。

**与真实项目的关系：**

产品详情、内容页、官网 landing page 适合优先考虑 SSR/SSG。

**与当前学习主线的关系：**

补充 Chapter 11 performance/deployment 对 SEO HTML 的影响。

**最终记忆模型：**

SSR/SSG can expose content and meta early; ranking is broader than rendering。

<a id="section-9-17"></a>

### 9.17 Error handling：createError、showError、error.vue、API errors 与 status code boundary

**结论：**

Nuxt 错误边界包括 server/API error、page error 和 `app/error.vue`；status code 是 response boundary，不只是 UI text。

**本节解决的问题：**

解释 product detail 找不到时为什么 throw `createError`，而不是只显示空 card。

**技术意义：**

SSR/SEO 页面需要正确的 HTTP-like status 和 error UI；API handler 也需要表达 404、422 等业务错误。

**概念解释：**

`createError` 创建 Nuxt-aware error。`error.vue` 是全局 error page。`setResponseStatus` 可用于 API validation failure。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

server API error 是 data boundary；page error 是 rendering boundary；error page 是 UI recovery boundary。

**Nuxt 机制证据链：**

访问 `/products/not-exist`，page owner 是 dynamic page，setup 调 detail API。server handler 找不到 product，throw 404 error。page data composable 得到 error，page 再 throw `createError`，Nuxt 使用 `app/error.vue` 渲染错误界面，HTML/status 反映 failure。

**TypeScript / Nuxt type generation 编译期过程：**

`ApiResult<T>` 描述业务 envelope；Nuxt error object 类型描述 framework error。两者不是同一个层。

**Server / Nitro / Vue / Browser 运行时过程：**

server handler 可抛错；page setup 可抛错；browser navigation 也会进入 Nuxt error handling。

**API / 语法规则：**

`throw createError({ statusCode: 404, statusMessage: "Product not found" })`。

**文件结构：**

`server/api/products/[id].get.ts` 产生 404；`app/error.vue` 显示错误。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/error.vue</span>
  </div>

```vue
<script setup lang="ts">
interface NuxtErrorShape {
  readonly statusCode?: number;
  readonly statusMessage?: string;
  readonly message?: string;
}

defineProps<{
  readonly error: NuxtErrorShape;
}>();
</script>
```
</div>

**逐行解释：**

`NuxtErrorShape` 描述 error page 接收的 error prop。字段可选，因为不同来源的 error shape 不完全相同。

**执行过程：**

server/page throw error；Nuxt 捕获；`error.vue` 渲染 status 和 message；用户可 clear error 回首页。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

错误改变 response status、HTML 内容和 client navigation result。

**为什么得到这个结果：**

Nuxt 把 server error、page error 和 UI error boundary 接在一起。

**对比写法：**

只返回 `{ ok: false }` 适合局部表单错误；不存在的 SEO page 更适合 404 boundary。

**常见错误为什么错：**

把所有错误都吞掉并渲染空页面，会让 crawler、用户和监控都看不到真实失败。

**与真实项目的关系：**

产品不存在、权限不足、表单 422、server crash 应该区分处理。

**与当前学习主线的关系：**

延续 Chapter 09 normalized error，但加入 page status 和 SSR HTML。

**最终记忆模型：**

API error describes data failure; Nuxt error boundary describes page failure。

<a id="section-9-18"></a>

### 9.18 Build and deployment output：nuxt build、nuxt generate、.output/server、.output/public、Node/edge/static targets

**结论：**

Nuxt `build` 生成可运行 server output；Nuxt `generate` 生成 prerender/static output；它们都不同于 Vite SPA `dist`。

**本节解决的问题：**

解释为什么 Chapter 11 的 static `dist` 模型不能直接覆盖 Nuxt deployment。

**技术意义：**

部署输出决定你需要 Node/serverless/edge runtime，还是只需要 static hosting。

**概念解释：**

`.output/server` 包含 Nitro server entry；`.output/public` 包含 public assets 和 prerendered files。`nuxt preview` 用 production output 做本地预览。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

server API 需要 server output；pure static generated output 不等于所有 server endpoints 都可用。

**Nuxt 机制证据链：**

运行 `npm run build`，Nuxt 编译 client bundle、server bundle、Nitro output，生成 `.output/server` 和 `.output/public`。运行 `npm run generate`，Nitro crawler prerenders discoverable pages，将 static HTML/payload 写入 `.output/public`。运行 `npm run preview`，本地 server 读取 production output。

**TypeScript / Nuxt type generation 编译期过程：**

`nuxt typecheck` 验证 app/server 类型；`nuxt build` 还会执行 build pipeline，但不要把 build 当唯一 typecheck 证明。

**Server / Nitro / Vue / Browser 运行时过程：**

build output 决定 production request 是由 Nitro server 渲染，还是 static files 直接响应。

**API / 语法规则：**

`nuxt build`、`nuxt generate`、`nuxt preview` 是 package scripts。

**文件结构：**

`.output/server` 和 `.output/public` 是 generated output，不手写。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/package.json</span>
  </div>

```json
{
  "scripts": {
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "set PORT=3031&& nuxt preview --port 3031"
  }
}
```
</div>

**逐行解释：**

`build` 创建 production server output。`generate` prerenders static output。`preview` 本地运行 output 以验证 production behavior。

**执行过程：**

install dependencies → prepare types → typecheck → build → generate → preview smoke。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

build/generate 后才能检查 `.output`；不要在运行前声称 prerender 或 deployment output 已成功。

**为什么得到这个结果：**

Nuxt 同时服务 server-rendered 和 statically generated use cases。

**对比写法：**

Vite `dist` 是静态资源目录；Nuxt `.output` 可包含 server runtime。

**常见错误为什么错：**

假设 `nuxt generate` 包含 server endpoints 是错误的；纯静态 hosting 没有 Nitro server runtime。

**与真实项目的关系：**

部署前必须知道目标支持 Node/serverless/edge/static 哪种运行环境。

**与当前学习主线的关系：**

直接承接 Chapter 11 deployment output。

**最终记忆模型：**

Vite dist is static; Nuxt output may be server plus public assets。

<a id="section-9-19"></a>

### 9.19 Final integration：nuxt-fullstack-boundary-lab 如何串联 SSR、data、server、config、hydration 与 deployment

**结论：**

最终 lab 用最小 Nuxt app 串起本章全部 boundary：routing、layout、middleware、plugin、data fetching、server API、runtime config、hydration、routeRules 和 output。

**本节解决的问题：**

说明为什么本章不继续加数据库、真实 auth、Nuxt modules、UI library 或 remote deployment provider。

**技术意义：**

先把 framework lifecycle 学清楚，才能安全进入真实 full-stack feature。

**概念解释：**

最终项目不是 UI showcase，而是 boundary map。每个 page 和 server handler 都回答“这个值在哪一层创建、在哪一层可见、如何进入 HTML/payload/output”。

**边界：Vite SPA、Nuxt universal app、Vue component、Nuxt page、layout、route middleware、plugin、server API route、Nitro server engine、runtime config、payload、hydration、browser API、server-only value、client-only value、deployment output：**

Vite root shell 只显示 summary；Nuxt lab 才运行 SSR/full-stack mechanics；server-only values 不进 client payload；client-only values 不进 server render。

**Nuxt 机制证据链：**

从 `/` 进入 lab 首页，Nuxt 使用 `app/pages/index.vue` 和 default layout。`NuxtLink` 指向 data/rendering/hydration/config/seo pages。每个 page 触发对应 composable 或 component。API pages 调 `server/api`。`/health` 走 `server/routes`。config page 验证 runtime config。hydration pages 对比 mismatch 和 fixed pattern。build/generate/preview 验证 deployment output。

**TypeScript / Nuxt type generation 编译期过程：**

Nuxt 生成 auto-import 和 app types；shared types连接 app 和 server；unknown body 仍必须通过 `parseSubmitRequest` runtime guard。

**Server / Nitro / Vue / Browser 运行时过程：**

server render、Nitro API、payload、hydration、client navigation 在 lab 内闭环；root Vite app 不参与 Nuxt runtime。

**API / 语法规则：**

所有命令通过 lab `package.json` scripts 执行；不安装 global packages。

**文件结构：**

最终项目真实路径是 `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/`。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/server/api/submit.post.ts</span>
  </div>

```ts
export default defineEventHandler(async (event) => {
  const body: unknown = await readBody(event);
  const result = parseSubmitRequest(body);

  if (!result.valid || !result.value) {
    setResponseStatus(event, 422);
    return fail("validation_error", result.message ?? "Request body is invalid.");
  }

  return ok({
    accepted: true,
    productId: result.value.productId,
    email: result.value.email,
  });
});
```
</div>

**逐行解释：**

`readBody` 返回 unknown boundary。`parseSubmitRequest` 做 runtime validation。失败时设置 422。成功时只返回 safe accepted data。

**执行过程：**

client event 或 test request 提交 body；server handler 验证；response 返回 success 或 validation error。

**request、server render、payload、HTML、hydration、client navigation、data fetching、runtime config、server route、error 与 deployment output 的变化：**

submit handler 不属于 initial SSR HTML；它展示 server mutation boundary 和 request body validation。

**为什么得到这个结果：**

Nuxt full-stack boundary 不是只读页面，也包括 server-side request validation。

**对比写法：**

直接把 `body as SubmitRequest` 当已验证会绕过 runtime boundary。

**常见错误为什么错：**

使用 `any` 会关闭 TypeScript 对 request parsing 的帮助，也会掩盖 unknown boundary。

**与真实项目的关系：**

真实项目会把这里的 local mock 换成 database/auth/service layer，但 boundary 不变。

**与当前学习主线的关系：**

整合 Chapter 06–11 的 route、state、API、quality、deployment。

**最终记忆模型：**

Nuxt lab = file route + layout + middleware + data + Nitro API + config + hydration + output。

## 10. API / 语法索引

| API / Syntax | Layer | Input | Output | Runtime Effect | TypeScript Boundary |
| --- | --- | --- | --- | --- | --- |
| `defineNuxtConfig` | Nuxt config | config object | framework policy | 配置 routeRules、runtimeConfig、typescript | 检查 config shape |
| `routeRules` | Nitro/Nuxt | route pattern | render/cache policy | 控制 prerender、SSR、SWR-like 行为 | 检查 rule value |
| `NuxtPage` | Nuxt app | current route | page component | 渲染 route page | 由 Nuxt types 支持 |
| `NuxtLayout` | Nuxt app | layout name | wrapper component | 包装 page slot | layout name 由 Nuxt project context 支持 |
| `NuxtLink` | Nuxt app/browser | `to` path | anchor + client navigation | hydration 后接管跳转与预取 | path 字符串基本检查 |
| `definePageMeta` | Nuxt macro | page meta object | route metadata | 选择 layout/middleware/validation | macro type check |
| `useFetch` | Nuxt data | URL/options | refs | SSR data + payload | generic result type，不验证 runtime data |
| `useAsyncData` | Nuxt data | key/handler | refs | 自定义 async + payload | generic result type |
| `$fetch` | request utility | URL/options | Promise | direct request | generic type 只是静态假设 |
| `defineEventHandler` | Nitro | event handler | response | 注册 server route/API | handler input/output type |
| `getRouterParam` | Nitro | event/key | string/undefined | 读取 dynamic server route param | 不验证业务存在 |
| `readBody` | Nitro | event | unknown/body | 读取 request body | 应保留 unknown boundary |
| `setResponseStatus` | Nitro | event/status | response status | 设置 API status | number type only |
| `createError` | Nuxt/Nitro | error options | thrown error | 进入 error boundary/status | options shape check |
| `useRuntimeConfig` | Nuxt | none | config object | 读取 runtime config | public/private 可见性仍需代码遵守 |
| `useState` | Nuxt payload | key/init | SSR-aware ref | payload state transfer | generic value type |
| `ClientOnly` | Nuxt component | slot/fallback | client-only render | 避免 server render browser-only UI | template type support |
| `onMounted` | Vue lifecycle | callback | client hook | hydration 后运行 browser logic | callback type check |
| `useHead` / `useSeoMeta` | Nuxt head | head/meta object | SSR/client head | 管理 HTML head | field shape check |

## 11. 常见错误表

| Wrong Form | Error Type | Violated Rule | Why It Fails | Correction | Recognition Method |
| --- | --- | --- | --- | --- | --- |
| Install `nuxt` in root Vite `package.json` | Architecture drift | Nuxt must be separate app boundary | Root shell gets polluted by framework lifecycle | Install inside `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab` | Root `package.json` contains `nuxt` |
| Replace root `App.vue` with `<NuxtPage />` | App boundary break | Do not migrate Vite shell | Existing chapters disappear | Add `NuxtSsrBoundaryChapterApp` only | `/` no longer shows Chapters 01-11 |
| Treat Nuxt as only file-based Router | Concept error | Nuxt includes Nitro/payload/output | Server/full-stack features disappear from model | Track route, server, payload, output | Explanation omits `server/api` |
| `const width = window.innerWidth` in setup | SSR runtime error | Browser API not available on server | Server render has no `window` | Use `onMounted` or `ClientOnly` | Error mentions `window is not defined` |
| Render `Date.now()` in template | Hydration mismatch | Initial render must be deterministic | Server/client text differs | Render placeholder then update on mounted | Hydration warning with text mismatch |
| Ignore hydration warnings | Debugging failure | Warnings are boundary evidence | DOM may be patched unexpectedly | Reproduce and isolate mismatch source | Console shows hydration mismatch |
| Raw `$fetch` in setup for initial data | Duplicate fetch | Use Nuxt data composables | Server and client may both fetch | Use `useFetch` or `useAsyncData` | Network shows repeated initial request |
| Treat `useFetch` and `$fetch` as identical | Data lifecycle error | Payload behavior differs | `$fetch` alone does not create payload entry | Use `$fetch` for event calls | No payload reuse |
| Put secret in `runtimeConfig.public` | Secret exposure | Public config is serialized | Client can read value | Keep secret in private runtime config | Secret visible in client payload |
| Return `config.apiSecret` from API | Secret leak | Server-only value must stay server-only | API response exposes private value | Return derived safe boolean | Response includes secret text |
| Trust shared TS type as validation | Runtime validation bug | TS types erase at runtime | Invalid JSON passes | Validate unknown body | Handler accepts malformed body |
| Add database/auth provider in Chapter 12 | Scope creep | Chapter focuses on Nuxt boundary | Hides rendering mechanics | Use local mock data | New database dependency appears |
| Confuse route middleware with server middleware | Layer confusion | App and Nitro middleware differ | API requests bypass route middleware | Use `server/middleware` for server pipeline | `/api/*` not affected by app guard |
| Browser side effect in universal plugin | SSR crash | Universal plugin can run on server | Server sees browser-only global | Use `.client.ts` suffix | Build/dev server logs runtime error |
| Access localStorage on server | SSR runtime error | Browser storage is client-only | Server has no localStorage | Read after mounted | Error mentions `localStorage` |
| Assume `nuxt generate` includes server endpoints | Deployment error | Static output has no server runtime | `/api/*` unavailable on static host | Use `nuxt build` for server endpoints | Static preview lacks API |
| Assume `nuxt build` equals Vite `dist` | Output model error | Nuxt output can include server | Deployment target chosen wrong | Inspect `.output/server` and `.output/public` | Output has server entry |
| Claim prerender without running generate | Verification error | Output must be generated | Config intent is not proof | Run `npm run generate` | No `.output/public` route file |
| Claim SSR without inspecting command result | Verification error | SSR must be executed | Unverified behavior may fail | Run dev/build/preview smoke | No server output or request evidence |
| Add UI library to hide boundary gaps | Scope creep | Chapter is rendering/server boundary | UI complexity distracts | Use simple scoped CSS | New UI dependency appears |
| Add Nuxt modules too early | Scope creep | Core Nuxt first | Module behavior hides framework basics | No modules in config | `modules` key appears |
| Add provider deployment file | Scope creep | No remote provider assumed | Creates unverifiable target | Keep provider-neutral notes | Provider config file appears |
| Use `any` for request body | Type safety loss | Preserve unknown boundary | Invalid access hidden | Use `unknown` plus guard | Search finds `any` |
| Chinese characters in source code block | Language rule violation | Code blocks must be English-only | Source examples become invalid for project rule | Keep code strings/comments English | CJK search inside fences |
| Claim commands passed without output | Validation false claim | Only actual command result counts | User cannot trust status | Report PASS only after run | Missing command log |

## 12. 最终小项目

最终小项目只整合本章机制，不替代前面的分节教学。项目名为 `nuxt-fullstack-boundary-lab`，真实目录是 `nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/`。

### 12.1 项目目标

- 用独立 Nuxt app 解释 SSR、CSR、SSG/prerender、hybrid routeRules。
- 用 `app/pages` 展示 file-based routing 和 dynamic route。
- 用 `server/api` 与 `server/routes` 展示 Nitro full-stack boundary。
- 用 runtime config demo 展示 public/private config。
- 用 hydration mismatch/fixed demo 展示 SSR-safe code。
- 用 build/generate/preview 命令展示 Nuxt output 与 Vite `dist` 差异。

### 12.2 项目结构与文件职责

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab</span>
  </div>

```txt
nuxt.config.ts
app.vue
app/pages/index.vue
app/pages/products/index.vue
app/pages/products/[id].vue
app/pages/data/use-fetch.vue
app/pages/data/use-async-data.vue
app/pages/rendering/ssr.vue
app/pages/rendering/csr.vue
app/pages/rendering/prerendered.vue
app/pages/rendering/hybrid.vue
app/pages/hydration/mismatch.vue
app/pages/hydration/fixed.vue
app/pages/config.vue
app/pages/seo.vue
app/layouts/default.vue
app/layouts/admin.vue
app/middleware/auth-demo.ts
app/middleware/role-demo.global.ts
app/plugins/client-analytics.client.ts
app/plugins/server-request-id.server.ts
app/plugins/universal-logger.ts
server/api/products/index.get.ts
server/api/products/[id].get.ts
server/api/submit.post.ts
server/api/config.get.ts
server/routes/health.get.ts
server/middleware/request-log.ts
shared/types/product.ts
shared/types/api.ts
shared/types/runtimeConfig.ts
```
</div>

### 12.3 边界映射

| Map | Files | Boundary |
| --- | --- | --- |
| Vite SPA vs Nuxt app | root `App.vue`, Nuxt lab `app.vue` | Existing shell remains Vite; Nuxt runs separately |
| Nuxt route map | `app/pages/**/*.vue` | File paths become routes |
| Layout map | `app/layouts/default.vue`, `admin.vue` | Layout wraps page slot |
| Middleware map | `app/middleware/*.ts` | Page navigation guard, not server authority |
| Plugin map | `.client.ts`, `.server.ts`, universal plugin | Controls execution side |
| SSR/CSR/SSG/hybrid map | `nuxt.config.ts`, rendering pages | routeRules choose policy |
| Hydration map | hydration components/pages | Deterministic initial render |
| Data fetching map | data pages, product composables | Payload-aware fetching |
| Payload map | `useFetch`, `useAsyncData`, `useState` | Client-visible serialized data |
| Server API map | `server/api/**/*.ts` | Nitro JSON endpoints |
| Server routes map | `server/routes/health.get.ts` | Non-API route response |
| Runtime config map | `nuxt.config.ts`, config API/page | public vs private config |
| State boundary map | `useState`, no Pinia module | SSR-aware state without new module |
| SEO/meta map | `app/pages/seo.vue` | SSR-visible head entries |
| Error handling map | `app/error.vue`, product detail | Page/API error boundary |
| Build output map | `build`, `generate`, `preview` scripts | `.output/server` and `.output/public` |

### 12.4 完整核心代码

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/nuxt.config.ts</span>
  </div>

```ts
export default defineNuxtConfig({
  compatibilityDate: "2026-07-10",
  devtools: { enabled: true },
  runtimeConfig: {
    apiSecret: "server-only-demo-secret",
    public: {
      apiBase: "/api",
      appTitle: "Nuxt Full-stack Boundary Lab",
    },
  },
  routeRules: {
    "/rendering/ssr": { ssr: true },
    "/rendering/prerendered": { prerender: true },
    "/rendering/hybrid": { swr: 60 },
    "/admin/**": { ssr: false },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
});
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/app/pages/products/index.vue</span>
  </div>

```vue
<script setup lang="ts">
const { data, error, refresh, status } = await useProductList();

const products = computed(() => {
  if (!data.value?.ok) {
    return [];
  }

  return data.value.data.products;
});
</script>
```
</div>

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab/server/api/products/index.get.ts</span>
  </div>

```ts
import type { ProductListResponse } from "../../../shared/types/product";
import { mapProductDto } from "../../../app/utils/productMapper";
import { mockProducts } from "../../utils/mockProducts";
import { ok } from "../../utils/serverResponse";

export default defineEventHandler(() => {
  const response: ProductListResponse = {
    products: mockProducts.map(mapProductDto),
  };

  return ok(response);
});
```
</div>

### 12.5 运行方式与预期行为

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
cd nuxt-labs/chapter-12-nuxt-fullstack-boundary-lab
npm install
npm run prepare
npm run typecheck
npm run dev
npm run build
npm run generate
npm run preview
```
</div>

预期行为：

- `http://localhost:3030/` 显示 lab home 和 route links。
- `/products` 通过 `useFetch` 获取 product list。
- `/products/p-100` 通过 dynamic route 读取 detail。
- `/data/use-fetch` 与 `/data/use-async-data` 展示 payload-aware fetching。
- `/rendering/ssr` 展示 deterministic SSR state。
- `/rendering/csr` 展示 client-only browser API。
- `/rendering/prerendered` 对应 routeRules prerender。
- `/rendering/hybrid` 对应 routeRules SWR-like intent。
- `/hydration/fixed` 展示 fixed hydration pattern。
- `/config` 不显示 private config。
- `/seo` 设置 SSR-visible meta。
- `/api/products` 返回 JSON。
- `/health` 返回 Nitro route JSON。

### 12.6 常见错误与扩展任务

常见错误集中在三类：把 Nuxt 合并进根 Vite SPA、把 browser-only value 放进 SSR initial render、把 server-only value 暴露给 client。扩展任务可以在后续章节加入 Nuxt testing、content module、auth provider、database、real deployment preset，但必须在本章 boundary 稳定之后。

## 13. 额外速查表

| Term | One-line Rule | Safe Usage |
| --- | --- | --- |
| Nuxt | Full-stack Vue framework | Separate app boundary |
| universal rendering | Server and client cooperate | SSR HTML plus hydration |
| SSR | Request-time HTML | SEO-sensitive dynamic pages |
| CSR | Browser rendering | Internal interactive pages |
| SSG | Build-time HTML | Stable public pages |
| prerender | Static generation route | `routeRules.prerender` or `nuxt generate` |
| hybrid rendering | Per-route policy | `routeRules` |
| hydration | Bind Vue to SSR HTML | Deterministic initial DOM |
| payload | Serialized server data | `useFetch`, `useAsyncData`, `useState` |
| routeRules | Route-level render/cache config | `nuxt.config.ts` |
| `nuxt.config.ts` | App policy file | runtimeConfig, routeRules, TypeScript |
| `app.vue` | Nuxt app root | `NuxtLayout` and `NuxtPage` |
| `NuxtPage` | Current page outlet | Inside app root |
| `NuxtLayout` | Layout wrapper | Around pages |
| `NuxtLink` | Nuxt navigation link | Internal routes |
| `definePageMeta` | Page metadata macro | layout and middleware |
| pages | Route source | `app/pages` |
| layouts | Page wrappers | `app/layouts` |
| middleware | Navigation guards | `app/middleware` |
| plugins | App initialization | `app/plugins` |
| `.server plugin` | Server-only plugin | Request/server side effect |
| `.client plugin` | Client-only plugin | Browser side effect |
| `server/api` | API endpoint directory | `/api/*` routes |
| `server/routes` | Custom server routes | Non-API responses |
| `server/middleware` | Nitro request middleware | Request pipeline |
| `defineEventHandler` | Nitro handler | Return response |
| event | Nitro request context | params/body/context |
| `getQuery` | Query reader | Server route query |
| `readBody` | Body reader | Unknown body boundary |
| `setResponseStatus` | Status setter | 422 validation response |
| `createError` | Nuxt/Nitro error | 404 page/API failure |
| `showError` | Client error trigger | Explicit error display |
| `error.vue` | Error page | Global error UI |
| `useFetch` | SSR-aware fetch | URL data in setup |
| `useAsyncData` | Keyed async data | Custom data in setup |
| `$fetch` | Direct request utility | Event handlers |
| refresh | Data refetch | User-triggered retry |
| pending/status | Request state | Loading UI |
| runtimeConfig | Runtime config object | Server and public config |
| runtimeConfig.public | Client-visible config | Non-secret values |
| `useRuntimeConfig` | Config reader | Read config by environment |
| `useState` | SSR-aware state | Payload-safe state |
| `ClientOnly` | Client render wrapper | Browser-only UI |
| `onMounted` | Client lifecycle hook | Browser API access |
| window boundary | Browser global | Never in server render |
| document boundary | Browser DOM | Mounted/client-only only |
| localStorage boundary | Browser storage | Mounted/client-only only |
| `useHead` | Head manager | links and generic head |
| `useSeoMeta` | SEO meta helper | public metadata |
| `nuxt build` | Production build | `.output/server` and public assets |
| `nuxt generate` | Static generation | `.output/public` |
| `nuxt preview` | Production preview | Local output server |
| `.output/server` | Server runtime output | Node/serverless/edge target |
| `.output/public` | Public static output | Static assets/prerendered files |
| Nitro | Nuxt server engine | API, routes, middleware, output |
| server-only value | Private runtime value | Never serialize |
| client-only value | Browser/platform value | Mounted/client-only only |
| shared type | Static contract | Not runtime validation |
| runtime validation | Runtime guard | Validate unknown input |

## 14. 真实项目判断模型

| 架构选择 | 什么时候选 | 什么时候不选 | 需要的证据 | 排除 concern 的 owner |
| --- | --- | --- | --- | --- |
| Vite SPA | 主要是 authenticated app、SEO/first HTML 不关键、server API 已独立 | 需要 route-level SSR HTML、server data colocation、hybrid render | `dist` static hosting + Router fallback 足够 | Chapter 11 production boundary |
| Nuxt SSR | 需要 request-time HTML、SEO/crawler visibility、server data before hydration | 页面高度交互且 SEO 不重要，server cost 不值得 | SSR HTML 包含关键内容，payload 无 secret，hydration clean | Nitro/server ops owns runtime availability |
| Nuxt SSG / prerender | 内容可提前生成，route set 可枚举 | 高度个性化或每次请求不同 | generated output 包含目标 routes | Content/source pipeline owns freshness |
| Hybrid route rules | 不同 route 需要 SSR/CSR/prerender/SWR-like policy | 团队无法维护每条 route 的缓存/render语义 | `routeRules` 与 preview/output 行为一致 | Deployment platform may constrain support |
| Nitro server API | 前端 lab 需要 colocated server route 或 BFF seam | 需要完整 domain backend、database、auth provider | server/api status/body/config boundary 可测 | Real backend / database layer |
| Nuxt lab boundary | 学习 SSR/payload/hydration，而不破坏根 Vite shell | 想把所有 Vue 章节迁进 Nuxt | 根 Vite shell 保留，Nuxt lab 独立运行 | Chapter 13 adds modules/content/image/session |

## 15. 如何转换成个人笔记

保留三条主线：第一，URL 如何映射到 page、layout、middleware；第二，data 如何从 server API 进入 payload 并被 hydration 复用；第三，public/private、server/client、build/generate output 如何分边界。熟悉后可以删掉代码全文，只保留 boundary map 和错误表。

## 16. 必须能回答的问题

1. 为什么 Nuxt 不是 Vue Router 加 Vite？
2. 为什么本章 Nuxt lab 不能直接嵌入根 Vite `App.vue`？
3. SSR、CSR、SSG、prerender、hybrid rendering 分别解决什么问题？
4. hydration mismatch 为什么会发生？
5. `useFetch` 和 `$fetch` 的核心差异是什么？
6. `server/api` 和 frontend API client 的 authority 差异是什么？
7. `runtimeConfig.public` 为什么不能放 secret？
8. route middleware 和 server middleware 有什么区别？
9. `nuxt build` 和 `nuxt generate` 输出有什么不同？
10. 如何从 command output 证明 typecheck/build/generate/preview 真的跑过？

## 17. 最终记忆模型

Nuxt request 的最终链路是：

URL → `app/pages` page owner → `NuxtLayout` wrapper → route middleware → page setup → `useFetch` / `useAsyncData` / `useState` → Nitro `server/api` 或 `server/routes` → runtime config boundary → HTML + payload → hydration → client navigation → build/generate output。

如果某个值不能安全出现在这个链路的某一段，就必须移动边界：secret 留在 server，browser API 留到 mounted/client-only，request body 留在 unknown + runtime guard，static output 留给 generate 后验证。

## 18. 官方文档阅读清单

- [Nuxt Introduction](https://nuxt.com/docs/getting-started/introduction)
- [Nuxt Routing](https://nuxt.com/docs/getting-started/routing)
- [Nuxt Views](https://nuxt.com/docs/getting-started/views)
- [Nuxt Rendering Modes](https://nuxt.com/docs/guide/concepts/rendering)
- [Nuxt Data Fetching](https://nuxt.com/docs/getting-started/data-fetching)
- [Nuxt Server Directory](https://nuxt.com/docs/guide/directory-structure/server)
- [Nuxt Server Engine](https://nuxt.com/docs/guide/concepts/server-engine)
- [Nuxt Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Nuxt Prerendering](https://nuxt.com/docs/getting-started/prerendering)
- [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)
- [Nuxt Error Handling](https://nuxt.com/docs/getting-started/error-handling)
- [Nuxt State Management](https://nuxt.com/docs/getting-started/state-management)
- [Nuxt Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)
- [Nuxt Plugins](https://nuxt.com/docs/guide/directory-structure/plugins)
- [Nuxt SEO and Meta](https://nuxt.com/docs/getting-started/seo-meta)
- [Vue SSR Guide](https://vuejs.org/guide/scaling-up/ssr.html)
- [Nitro Documentation](https://nitro.build/guide)

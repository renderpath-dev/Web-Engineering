# Vue 第 13 章：Nuxt Advanced Modules、Content、Image、Auth Session、Layers 与 Production-grade Patterns

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

.macos-code-dot,
.macos-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.macos-code-dot-red,
.macos-dot.red {
  background: #ff5f57;
}

.macos-code-dot-yellow,
.macos-dot.yellow {
  background: #febc2e;
}

.macos-code-dot-green,
.macos-dot.green {
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
- [1. 本地 roadmap 与本章边界](#1-本地-roadmap-与本章边界)
- [2. 学习目标](#2-学习目标)
- [3. 本章运行范围](#3-本章运行范围)
- [4. 核心机制证据链总览](#4-核心机制证据链总览)
- [5. 运行机制总览](#5-运行机制总览)
- [6. Nuxt advanced 运行时所有权图](#6-nuxt-advanced-运行时所有权图)
- [7. 代码窗口格式约定](#7-代码窗口格式约定)
- [8. Advanced capability 执行路径](#8-advanced-capability-执行路径)
- [9. 分节教学与练习](#9-分节教学与练习)
  - [9.1 Advanced Nuxt mental model：module、content、image、session、layer、test 与 production readiness](#section-9-1)
  - [9.2 Module selection boundary：Nuxt modules、runtime behavior、dependency cost 与 no random modules](#section-9-2)
  - [9.3 Nuxt Content：content directory、Markdown/MDC、query、rendering、navigation 与 content ownership](#section-9-3)
  - [9.4 Content-driven routing：docs/blog pages、dynamic slug、not found、SEO meta 与 prerender boundary](#section-9-4)
  - [9.5 Nuxt Image：NuxtImg、NuxtPicture、sizes、providers、lazy loading、CLS 与 performance evidence](#section-9-5)
  - [9.6 Auth/session mental model：sealed cookie session、server session、client composable 与 no localStorage token](#section-9-6)
  - [9.7 Login/logout flow：server validation、session set/clear、safe user payload 与 error boundary](#section-9-7)
  - [9.8 Protected server routes：require session、role check、401/403、private runtime config 与 server authority](#section-9-8)
  - [9.9 Protected page routes：client route middleware、dashboard UX、admin UX 与 no security illusion](#section-9-9)
  - [9.10 Runtime config hardening：NUXT_SESSION_PASSWORD、private/public config、env examples 与 leak prevention](#section-9-10)
  - [9.11 Server validation：unknown body、Zod parse、422 error、client validation UX 与 server authority](#section-9-11)
  - [9.12 Local Nuxt layer：extends、base-ui layer、auto-scanned files、priority 与 override boundary](#section-9-12)
  - [9.13 Layer versus module versus component library：reuse strategy、build-time hooks、runtime components 与 ownership](#section-9-13)
  - [9.14 Nuxt tests：@nuxt/test-utils、server route tests、page smoke tests、validation tests 与 Chapter 10 bridge](#section-9-14)
  - [9.15 Content and image production readiness：generate/build output、asset paths、SEO, accessibility and cache boundary](#section-9-15)
  - [9.16 Session production readiness：cookie secret、secure deployment env、server-only data 与 logout invalidation](#section-9-16)
  - [9.17 Module performance and risk review：bundle impact、server output, hydration risk, dependency updates](#section-9-17)
  - [9.18 Chapter integration：Chapter 12 Nuxt boundary 如何升级成 advanced app capability](#section-9-18)
  - [9.19 Final integration：nuxt-advanced-production-lab 如何形成可扩展 Nuxt 项目骨架](#section-9-19)
- [10. API / 语法索引](#10-api--语法索引)
- [11. 常见错误表](#11-常见错误表)
- [12. 最终小项目](#12-最终小项目)
- [13. 额外速查表](#13-额外速查表)
- [14. 真实项目判断模型](#14-真实项目判断模型)
- [15. 如何转换成个人笔记](#15-如何转换成个人笔记)
- [16. 必须能回答的问题](#16-必须能回答的问题)
- [17. 最终记忆模型](#17-最终记忆模型)
- [18. 官方文档阅读清单](#18-官方文档阅读清单)

## 本章代码定位索引

| 范围 | 路径 | 用途 |
| --- | --- | --- |
| Vite summary panel | `src/learning/vue/chapter-13-nuxt-advanced-production/NuxtAdvancedProductionChapterApp.vue` | 在根 Vite app 中展示 Chapter 13 概念地图 |
| Vite models | `src/learning/vue/chapter-13-nuxt-advanced-production/models/` | 给 summary panels 提供 typed data |
| Nuxt lab config | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/nuxt.config.ts` | module、layer、routeRules、image、runtime config 边界 |
| Content config | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/content.config.ts` | docs 与 blog collections |
| Content pages | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/app/pages/docs/` | content query 与 content rendering |
| Image pages | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/app/pages/gallery/` | Nuxt Image 与 gallery API |
| Auth routes | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/server/api/auth/` | login、logout、session |
| Protected routes | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/server/api/account/` 和 `server/api/admin/` | server-side authority |
| Route middleware | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/app/middleware/` | page UX guard |
| Local layer | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/layers/base-ui/` | reusable app files and config |
| Tests | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/tests/` | server、page、validation checks |
| Environment examples | `nuxt-labs/chapter-13-nuxt-advanced-production-lab/.env.example` 和 `.env.production.example` | safe config examples |

## 0. 本章机制边界

本章在 Chapter 12 的 Nuxt SSR/payload/hydration 边界之上，研究 advanced capability 如何进入可维护生产骨架。`nuxt.config.ts` 选择 modules、extends local layer、配置 routeRules、image 和 runtime config；`content.config.ts`、`app/pages/docs/`、`app/pages/gallery/` 分别处理 Content collections 和 Nuxt Image rendering；`server/api/auth/` 设置 login/logout/session，sealed session cookie 保存 server-side session projection；`server/api/account/`、`server/api/admin/` 执行 protected server route authority；`app/middleware/` 只做 page UX guard；`layers/base-ui/` 提供 local layer reuse；`tests/` 使用 Nuxt test utilities 覆盖 server、page 和 validation checks。

执行 owner 不再是单个 Nuxt feature。Nuxt module 在 build/runtime hook 中改变 app 能力；Content 从 `content/` source 和 collections 查询生成 page data；Nuxt Image 根据 provider/sizes/lazy strategy 生成 image URL/render output；session API 在 server route 中验证 unknown body、写 sealed cookie、返回 safe user payload；protected server route 重新检查 session/role；local layer 被 Nuxt merge 到 app file/config scan；tests 启动 Nuxt-aware harness 验证 server and page behavior。TypeScript 能帮助 config、content schema、session payload、Zod body 和 test helper，但不能保证 module provider 可用、cookie secret 足够安全、content 在部署中已生成、image provider 性能达标或 authorization 只靠 middleware 成立。

跨边界的值包括 module option、content document metadata、dynamic slug、`NuxtImg` props、generated image URL、login body、Zod parse result、sealed cookie、safe session user、server event、private runtime config、layer-provided component/config、Nuxt test fixture、build/generate output。它纠正的误解是“装 module 就等于生产能力”或“page middleware 能保护 server data”。本章不选择真实数据库/auth provider，不锁定部署平台，不重写根 Vite app，也不把 local layer 当 npm component library；这些分别属于后端架构、部署工程和未来 library/module packaging。

## 1. 本地 roadmap 与本章边界

本地 `docs/roadmap/vue-mastery-roadmap-zh.md` 的 Phase 13 是迁移与重构：Vue 2 to Vue 3、Options API to Composition API、Vuex to Pinia、webpack to Vite、JavaScript to TypeScript 等。附件任务指定的是 Nuxt advanced modules and production-grade patterns。

因此本章采用两个边界：

- 不修改 roadmap，不把本地 Phase 13 重写为 Nuxt。
- 按附件要求创建 Chapter 13 资料与独立 Nuxt lab，让根 Vite app 只展示一个 summary panel。

## 2. 学习目标

完成本章后，你应能解释：

- module 是 build/runtime 能力入口，不是随手安装的 UI 魔法。
- content 是文件驱动的数据源，不是把 Markdown 复制进 Vue component。
- image optimization 必须绑定尺寸、provider、lazy loading、CLS 与验证证据。
- session 安全由 server 和 sealed cookie 控制，不由 `localStorage` token 控制。
- client route middleware 只能改善 UX，不能替代 server authorization。
- layer 复用 app files and config，module 扩展 Nuxt build/runtime，component library 只复用 UI。
- production readiness 需要 `typecheck`、`test`、`build`、`generate`、`preview` 和 smoke evidence。

## 3. 本章运行范围

根 Vite app 仍然是 Vue 3 + TypeScript learning shell。Nuxt advanced lab 独立位于 `nuxt-labs/chapter-13-nuxt-advanced-production-lab/`。

本章没有引入数据库驱动、ORM、Redis、OAuth provider、payment SDK、cloud SDK、Tailwind、`@nuxt/ui`、Cypress、Playwright 或 MSW 到 lab。session 使用 `nuxt-auth-utils` 的 sealed cookie 机制；内容由 local Markdown collections 提供；gallery 使用 local SVG assets。

## 4. 核心机制证据链总览

| Capability path | Named evidence | Boundary being tested | Failure signal |
| --- | --- | --- | --- |
| Module entry | `nuxt.config.ts` modules/options | module must justify runtime/build behavior and dependency cost | module added but no page/server/test evidence uses it |
| Content source | `content.config.ts` + `app/pages/docs/` | Markdown/MDC source is queried and rendered by page, not copied into component state | slug 404, schema drift, SEO/prerender missing |
| Content routing | docs/blog dynamic pages | slug, not found, meta, prerender belong to one chain | content page works in dev but not generate/preview |
| Image optimization | `app/pages/gallery/` + `NuxtImg`/provider config | sizes/provider/lazy loading affect rendered asset and CLS risk | image visible but dimensions/cache/perf unverified |
| Login/session | `server/api/auth/login.post.ts` / logout/session | unknown body -> Zod parse -> safe payload -> sealed cookie | token stored in `localStorage`, or unsafe user fields returned |
| Protected server data | `server/api/account/` and `server/api/admin/` | every request rechecks sealed session and role | page hidden but API still returns private data |
| Page guard UX | `app/middleware/` dashboard/admin guard | redirects improve UX only after server authority exists | middleware mistaken for security control |
| Runtime config | `.env.example`, `.env.production.example`, private/public config | `NUXT_SESSION_PASSWORD` stays server-only, public config is safe | secret appears in payload/client bundle |
| Local layer | `layers/base-ui/` and `extends` | layer reuses Nuxt app files/config with override priority | business permission hidden in layer override |
| Nuxt tests | `tests/` server/page/validation checks | test harness verifies server routes, page smoke, validation errors | only build runs; session/content/image behavior untested |
| Output readiness | build/generate output review | advanced modules must survive production output, not only dev | provider/session/content path fails after generate/preview |

## 5. 运行机制总览

一次登录访问的完整链路是：browser submit form，`LoginForm.vue` 调用 `/api/auth/login`，server route 先用 Zod parse unknown body，再查 mock user，再调用 `setUserSession` 写 sealed cookie。后续 browser 请求 `/api/admin/report` 时带上 cookie，Nitro server route 调用 `requireUserSession`，再做 role check，最后读取 private runtime config。这个 authority 不在 page component，也不在 route middleware。

一次 content page 的完整链路是：Markdown 文件进入 Content collection，Nuxt Content 在 build/dev 阶段生成 query 能力，page 通过 `queryCollection` 拉取 entry，`ContentRenderer` 渲染 body，SEO meta 从 page setup 设置，routeRules 决定 docs routes 的 prerender 策略。

## 6. Nuxt advanced 运行时所有权图

本节不按目录罗列文件，而是按 runtime boundary 判断谁拥有能力、谁不能越权、失败时应观察什么信号。

| Owner | Runtime boundary | What it may own | What it must not own | Failure signal |
| --- | --- | --- | --- | --- |
| `nuxt.config.ts` | Nuxt build/runtime config boundary | module registration、routeRules、private/public runtime config、image provider、local layer extension | page business decision、server authorization result、content document body | module added but no route, output, image, content, session, or test evidence uses it |
| `content/` | Nuxt Content source boundary | docs/blog Markdown source data and frontmatter | Vue component state, server session, or authorization policy | content exists but route query returns not found or schema fields drift |
| `app/pages/docs/` and `app/pages/blog/` | URL rendering boundary | content-driven routes, slug handling, page rendering, SEO/prerender connection | raw content ownership or server-only permission checks | docs/blog page works in dev but fails in generate or preview |
| `app/pages/gallery/` and image components | Browser rendering plus Nuxt Image boundary | `NuxtImg` / `NuxtPicture` props, responsive sizes, provider URL rendering, layout stability evidence | image provider infrastructure or unrelated API state | image appears but dimensions, lazy behavior, provider URL, or CLS evidence is missing |
| `server/api/auth/` | Nitro server authority boundary | login, logout, session read, unknown body parsing, safe session payload, sealed cookie writes | client-only token trust or unsafe user field exposure | invalid body accepted, password returned, cookie not set, or logout leaves session active |
| `server/api/account/` and `server/api/admin/` | Protected server data boundary | `requireUserSession`, role checks, 401/403/200 response authority | trusting page middleware or browser-hidden UI as security | hidden page still allows private API data |
| `app/middleware/` | Client navigation UX boundary | redirect hints, dashboard/admin navigation flow, user-facing route experience | security guarantee or private data protection | API remains readable when only page middleware blocks navigation |
| `layers/base-ui/` | Nuxt layer scan/merge boundary | reusable Nuxt app files, shared components, composables, and local config defaults | product permission policy or app-specific server secrets | layer override changes UI unexpectedly or hides business behavior |
| `tests/` | Validation evidence boundary | server route tests, page smoke tests, validation tests, readiness checks | production authority by itself | build passes but content/session/image/layer behavior is untested |
| `shared/types/` | TypeScript compile-time contract boundary | shared payload shapes, API result types, auth/session types | runtime validation or authorization decisions | typecheck passes while malformed runtime input still reaches server logic |

## 7. 代码窗口格式约定

本章所有主要代码示例都使用 macOS-style title bar 加 fenced code block。代码块内部只放英文代码、命令、配置或路径。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">Snippet: code-window-rule.ts</span></div>

```ts
export const codeWindowRule = "titlebar-before-fenced-code";
```

</div>

## 8. Advanced capability 执行路径

本章按可观察执行链理解 advanced capability，而不是按阅读顺序记忆文件。

| Path | Trigger | Runtime owner | Observable result | Failure signal |
| --- | --- | --- | --- | --- |
| Content path | `content/*.md -> content collection -> queryCollection -> page render -> SEO/prerender output` | `content/` source, Content collection, docs/blog page setup, routeRules | docs/blog URL renders collection data and keeps SEO/prerender evidence connected | Markdown exists but slug lookup, meta, generate, or preview fails |
| Image path | `gallery API/metadata -> NuxtImg/NuxtPicture -> provider URL -> browser image request -> layout stability/performance evidence` | gallery API/page, Nuxt Image component, image provider config, browser layout engine | rendered image URL, dimensions, lazy loading, and stable layout can be inspected | image is visible but provider URL, dimensions, cache, or CLS evidence is missing |
| Auth/session path | `login form -> server/api/auth/login.post.ts -> unknown body -> Zod parse -> setUserSession -> sealed cookie -> session.get/profile/report` | login form UX, Nitro auth route, Zod schema, session utility, protected server routes | valid login sets sealed cookie and later session/account/admin requests see safe user data | invalid body accepted, secret leaks, password returns, or session is not cleared |
| Protected data path | `browser request -> cookie -> requireUserSession -> role check -> 401/403/200` | Nitro server route and authorization utility | anonymous request receives 401, signed-in non-admin receives 403, admin receives 200 | UI route guard hides page but API still returns protected data |
| Layer path | `extends -> layer files scanned -> component/composable available -> override priority` | Nuxt layer scanner and app merge priority | base UI component/composable is available without duplicating app code | layer silently overrides app behavior or carries business policy |
| Test/build path | `prepare/typecheck/test/build/generate/preview -> evidence for module/content/image/session/layer readiness` | Nuxt type generation, test runner, Nitro/Vite build, prerender/preview output | commands produce evidence that advanced features survive non-dev execution | only dev server works, while tests, build, generate, or preview expose missing runtime assumptions |

## 9. 分节教学与练习

<a id="section-9-1"></a>

### 9.1 Advanced Nuxt mental model：module、content、image、session、layer、test 与 production readiness

**结论：** Chapter 13 的核心不是多装 module，而是把每个能力放进可解释、可验证、可维护的边界。

**本节解决的问题：** `nuxt-labs/chapter-13-nuxt-advanced-production-lab/` 展示 Nuxt app 如何同时拥有 content、image、session、layer、test 和 production output。

**技术意义：** 当 app 进入 full-stack 阶段，page component 不能承担 content ownership、security authority、server secret、build output validation 等职责。

**概念解释：** module 注册能力，content 拥有 Markdown 数据，image provider 处理图片 URL，session 由 server sealed cookie 保存，layer 复用 app files，tests 提供回归证据。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** 根 Vite app 只加载 Chapter 13 summary；真实 Nuxt 能力只在 lab 内运行。

**Nuxt advanced 机制证据链：** `nuxt.config.ts` 注册 modules；`content.config.ts` 定义 collections；`server/api/auth/login.post.ts` 设置 session；`layers/base-ui/` 被 `extends` 复用；`tests/` 验证关键规则。

**TypeScript / Nuxt type generation 编译期过程：** `npm run prepare` 生成 Nuxt types，`npm run typecheck` 通过 `nuxt typecheck` 检查 pages、server routes、shared types。

**Server / Nitro / Module / Vue / Browser 运行时过程：** Browser 访问 page，Vue 渲染 component，Nuxt runtime 注入 composables，Nitro 处理 server routes，modules 提供 content/image/session API。

**API / 语法规则：** `defineNuxtConfig`、`modules`、`extends`、`routeRules`、`runtimeConfig`、`useAsyncData`、`queryCollection`、`setUserSession`、`requireUserSession`。

**文件结构：** `app/`、`server/`、`shared/`、`content/`、`layers/`、`tests/`。

**示例代码：** 本节总览见 `nuxt.config.ts`。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/nuxt.config.ts</span></div>

```ts
const isProduction = process.env.NODE_ENV === "production";

export default defineNuxtConfig({
  compatibilityDate: "2026-07-11",
  devtools: { enabled: true },
  extends: ["./layers/base-ui"],
  modules: ["@nuxt/content", "@nuxt/image", "nuxt-auth-utils"],
  runtimeConfig: {
    session: {
      name: "nuxt-session",
      password: process.env.NUXT_SESSION_PASSWORD || "",
      cookie: {
        sameSite: "lax",
        secure: isProduction,
      },
    },
    privateReportSecret: "server-only-report-secret",
    public: {
      appTitle: "Nuxt Advanced Production Lab",
      imageBasePath: "/",
    },
  },
  routeRules: {
    "/docs/**": { prerender: true },
    "/blog/**": { ssr: true },
    "/dashboard": { ssr: false },
    "/admin/**": { ssr: false },
  },
  image: {
    provider: "ipx",
    screens: {
      sm: 320,
      md: 640,
      lg: 1024,
      xl: 1280,
    },
  },
  content: {
    experimental: {
      sqliteConnector: "native",
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
    tsConfig: {
      include: ["../tests/**/*.ts", "../shared/**/*.d.ts"],
    },
  },
});
```

</div>

**逐行解释：** `modules` 只注册本章允许的能力；`extends` 接入 local layer；`runtimeConfig.session.cookie.secure` 在 dev HTTP smoke 时为 false，production 为 true；`runtimeConfig.public` 可进入 payload，`privateReportSecret` 只给 server；`routeRules` 区分 docs prerender、blog SSR、dashboard/admin CSR UX。

**执行过程：** Nuxt prepare/build 读取 config，安装 module hooks，生成 imports/types，dev/build 时把 app、server、content、layer 合成一个 Nuxt runtime。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** 注册 module 后，page 能调用 content/image/session API；layer component 可自动扫描；build/generate 产生 `.output/`。

**为什么得到这个结果：** Nuxt 的约定目录与 module hooks 会把文件系统映射成 runtime 能力，而不是只做 Vite component bundling。

**对比写法：** 根 Vite app 只能展示 summary；Nuxt lab 才拥有 server routes、routeRules、Content collections 和 Nitro output。

**常见错误为什么错：** 把 `nuxt-auth-utils` 装到根 Vite app 没意义，因为它依赖 Nuxt server runtime。

**与真实项目的关系：** 真项目要先说明每个 module 的业务价值、runtime 成本和验证方式。

**与当前学习主线的关系：** Chapter 12 学 Nuxt boundary，本章学习 boundary 内的 production-grade composition。

**最终记忆模型：** Nuxt advanced app = selected modules + owned data sources + server authority + reusable layers + validation evidence。

<a id="section-9-2"></a>

### 9.2 Module selection boundary：Nuxt modules、runtime behavior、dependency cost 与 no random modules

**结论：** module 选择必须从实际能力倒推，不从生态流行度倒推。

**本节解决的问题：** lab 只引入 `@nuxt/content`、`@nuxt/image`、`nuxt-auth-utils`、`zod` 与测试工具，避免随机扩展技术栈。

**技术意义：** 每个 module 都可能增加 build hooks、runtime code、server output、types 和维护成本。

**概念解释：** module 是 Nuxt app 的扩展点；library 是普通依赖；dev tool 是验证工具；它们的生命周期不同。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** `package.json` 的 dependencies 只属于 lab，不污染根 `package.json` 的 Vite learning shell。

**Nuxt advanced 机制证据链：** `npm ls --depth=0` 能看到 lab 依赖；根 `package.json` 不包含 Nuxt。

**TypeScript / Nuxt type generation 编译期过程：** module 安装后，`nuxt prepare` 生成 auto imports and types。

**Server / Nitro / Module / Vue / Browser 运行时过程：** Content 和 auth module 会影响 server side；image module 会影响 rendered image URLs；Vue component 只消费这些能力。

**API / 语法规则：** `modules: ["@nuxt/content", "@nuxt/image", "nuxt-auth-utils"]`。

**文件结构：** `nuxt-labs/chapter-13-nuxt-advanced-production-lab/package.json`。

**示例代码：** lab scripts 明确区分 dev、prepare、typecheck、test、build、generate、preview。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/package.json</span></div>

```json
{
  "scripts": {
    "dev": "nuxt dev --port 3040",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "set PORT=3041&& nuxt preview --port 3041",
    "typecheck": "nuxt typecheck",
    "prepare": "nuxt prepare",
    "test": "vitest run"
  },
  "dependencies": {
    "@nuxt/content": "latest",
    "@nuxt/image": "latest",
    "nuxt": "latest",
    "nuxt-auth-utils": "latest",
    "vue": "latest",
    "zod": "latest"
  }
}
```

</div>

**逐行解释：** `prepare` 负责 generated Nuxt files；`typecheck` 不等于 Vite transform；`test` 用 Vitest；`preview` 使用独立 port，避免和 dev server 混淆。

**执行过程：** `npm install` 写入 lockfile；Nuxt 命令读取 local dependencies；root Vite 命令不会进入 lab。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** 只有被注册 module 的 API 会出现在 app runtime；未安装的 UI/database modules 不参与 output。

**为什么得到这个结果：** Nuxt 的 module system 是显式注册系统，不是全局包扫描系统。

**对比写法：** 安装 `@nuxt/ui` 或 database ORM 会扩大任务边界，本章没有对应需求。

**常见错误为什么错：** 把“以后可能用”当成依赖理由，会让 learning lab 无法解释每个 output 来源。

**与真实项目的关系：** 生产项目要为每个 module 写 adoption reason、owner、upgrade plan。

**与当前学习主线的关系：** 这延续 Chapter 11 的 production dependency discipline。

**最终记忆模型：** module selection = capability need + boundary proof + validation command。

<a id="section-9-3"></a>

### 9.3 Nuxt Content：content directory、Markdown/MDC、query、rendering、navigation 与 content ownership

**结论：** Content-owned data 应该放在 `content/`，page 负责 query and render，不复制正文。

**本节解决的问题：** docs/blog content 被放入 collections，pages 通过 `queryCollection` 读取。

**技术意义：** 文档内容和 Vue component 分离后，content authoring、routing、rendering、SEO 更清晰。

**概念解释：** Markdown 是 source，collection 是 typed content boundary，query 是读取接口，component 是展示层。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** `content/` 拥有文档；`app/pages/docs/` 只拥有 URL 和 render flow。

**Nuxt advanced 机制证据链：** `content.config.ts` 定义 docs/blog；`app/pages/docs/index.vue` 使用 `queryCollection("docs")`。

**TypeScript / Nuxt type generation 编译期过程：** Content module 读取 collection schema，Nuxt types 让 collection queries 被 typecheck。

**Server / Nitro / Module / Vue / Browser 运行时过程：** page setup 请求 content data，Vue 渲染 `ContentCard`，browser 只收到可展示结果。

**API / 语法规则：** `defineCollection`、`z.object`、`queryCollection`、`ContentRenderer`。

**文件结构：** `content/docs/*.md`、`content/blog/*.md`、`content.config.ts`。

**示例代码：** docs index 从 collection 查询，不硬编码 cards。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/app/pages/docs/index.vue</span></div>

```vue
<script setup lang="ts">
definePageMeta({
  layout: "content",
});

const { data: docs } = await useAsyncData("docs-list", () =>
  queryCollection("docs").order("title", "ASC").all(),
);

const cards = computed(() =>
  (docs.value ?? []).map((entry) => toContentCardItem(entry, "docs")),
);

const { visibleItems } = useContentNavigation(cards.value);

useSeoMeta({
  title: "Docs",
  description: "Content-driven docs powered by Nuxt Content.",
});
</script>
```

</div>

**逐行解释：** `definePageMeta` 选 content layout；`useAsyncData` 绑定 SSR/data lifecycle；`queryCollection` 读取 docs；`computed` 把 entry 投影成 UI card model。

**执行过程：** dev/build 时 Content module 解析 Markdown；请求 `/docs` 时 page setup 获取 docs list 并渲染 cards。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** content query 变化会改变 docs cards；module 未注册时该 query 不存在。

**为什么得到这个结果：** Content module 把 file source 接入 Nuxt data lifecycle。

**对比写法：** 把 Markdown body 写进 `template` 会让内容和 UI 耦合，难以复用。

**常见错误为什么错：** 让 server API 再包装 local Markdown 会绕开 Content 的 query/rendering 类型能力。

**与真实项目的关系：** 文档站、博客、产品说明、变更日志都适合 content-owned model。

**与当前学习主线的关系：** 它连接 Chapter 09 API boundary 与 Chapter 12 SSR data boundary。

**最终记忆模型：** Content = file source + collection schema + query + renderer。

<a id="section-9-4"></a>

### 9.4 Content-driven routing：docs/blog pages、dynamic slug、not found、SEO meta 与 prerender boundary

**结论：** content-driven routing 要把 slug、not found、SEO 和 prerender 放在同一条证据链里。

**本节解决的问题：** `/docs/[...slug]` 与 `/blog/[slug]` 从 content collection 查找 entry，并处理 missing content。

**技术意义：** 真实内容站点不能只验证 index page，还要验证 dynamic route 和 404 行为。

**概念解释：** route param 是 URL state；content path 是 content identity；SEO meta 是页面输出契约；prerender 是部署输出契约。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** docs route 使用 prerender；blog route 保持 SSR。

**Nuxt advanced 机制证据链：** `routeRules["/docs/**"]` 设置 prerender；dynamic pages 使用 `queryCollection` 查 content。

**TypeScript / Nuxt type generation 编译期过程：** slug route params 被 page setup 使用；collection query 返回 typed entries。

**Server / Nitro / Module / Vue / Browser 运行时过程：** Nitro 处理 request，Nuxt 匹配 dynamic route，Content module 返回 entry，Vue 渲染 content body。

**API / 语法规则：** `useRoute`、`createError`、`useSeoMeta`、`routeRules`。

**文件结构：** `app/pages/docs/[...slug].vue`、`app/pages/blog/[slug].vue`。

**示例代码：** 本节示例在上述两个 dynamic page 文件中，关键是 content query 后没有 entry 就抛出 404。

**逐行解释：** route params 先变成 content path，再传给 collection query；成功时设置 SEO，失败时交给 Nuxt error boundary。

**执行过程：** 请求 `/docs/getting-started` 时，Nuxt 匹配 catch-all route，query docs collection，返回 Markdown-rendered page。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** routeRules 会影响 generate/build 输出；content query 决定页面是否存在。

**为什么得到这个结果：** Nuxt 文件路由和 Content collection 是两个系统，通过 route params 被显式连接。

**对比写法：** 只做 `/docs` list 不做 detail route，不能证明 content-driven routing 完整。

**常见错误为什么错：** 没有 404 会把 missing content 当成 empty page，破坏 SEO 和用户反馈。

**与真实项目的关系：** 内容站点发布流程必须能解释每个 URL 的 source file。

**与当前学习主线的关系：** 它复用 Chapter 06 router mental model，但运行在 Nuxt file routing 中。

**最终记忆模型：** Content route = URL param -> content path -> collection query -> render or 404 -> output mode。

<a id="section-9-5"></a>

### 9.5 Nuxt Image：NuxtImg、NuxtPicture、sizes、providers、lazy loading、CLS 与 performance evidence

**结论：** 图片优化不能只写 `NuxtImg`，还要声明尺寸、provider、loading strategy 和验证边界。

**本节解决的问题：** gallery 使用 local SVG assets、declared dimensions、lazy loading 和 API-provided metadata。

**技术意义：** 没有 width/height 的图片容易造成 layout shift；没有 provider boundary 的图片 URL 难以迁移。

**概念解释：** `NuxtImg` 是渲染组件；provider 负责 URL generation；asset metadata 负责 dimensions；page 负责 UX。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** gallery data 来自 server API，image rendering 在 app component 中完成。

**Nuxt advanced 机制证据链：** `@nuxt/image` 在 modules 中注册；`ImageGalleryCard.vue` 使用 image metadata 渲染。

**TypeScript / Nuxt type generation 编译期过程：** `GalleryImage` type 约束 id、src、width、height、alt。

**Server / Nitro / Module / Vue / Browser 运行时过程：** Browser 请求 gallery page，page fetches `/api/gallery`，component 渲染 image tag，image provider 处理 URL。

**API / 语法规则：** `NuxtImg`、`sizes`、`width`、`height`、`loading`、`provider`。

**文件结构：** `app/pages/gallery/`、`app/components/ImageGalleryCard.vue`、`server/api/gallery/`、`public/images/gallery/`。

**示例代码：** gallery page 不直接写 image data，而是从 composable/API 获取。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/app/pages/gallery/index.vue</span></div>

```vue
<script setup lang="ts">
const { data, pending, error } = await useGalleryImages();

useSeoMeta({
  title: "Image Gallery",
  description: "Nuxt Image examples with layout-stable image cards.",
});
</script>
```

</div>

**逐行解释：** `useGalleryImages` 隔离 data fetching；`useSeoMeta` 设置 page output；template 再根据 pending/error/data 渲染。

**执行过程：** server API 返回 image metadata，Vue component 用 metadata 生成 stable image card。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** image provider 改变 image URL 输出；metadata 改变 card size and alt text。

**为什么得到这个结果：** Nuxt Image 需要 module registration 才能让 image component 与 provider pipeline 生效。

**对比写法：** 直接 `<img>` 可以显示图片，但不会走 Nuxt Image provider boundary。

**常见错误为什么错：** 只看图片是否显示，不能证明 CLS、lazy loading 或 provider output 正确。

**与真实项目的关系：** 生产项目要记录 provider、cache、responsive sizes、accessibility alt strategy。

**与当前学习主线的关系：** 连接 Chapter 11 performance verification。

**最终记忆模型：** Image readiness = source metadata + provider + dimensions + loading + evidence。

<a id="section-9-6"></a>

### 9.6 Auth/session mental model：sealed cookie session、server session、client composable 与 no localStorage token

**结论：** 本章认证状态由 server session 和 sealed cookie 管理，不把 token 放进 `localStorage`。

**本节解决的问题：** `nuxt-auth-utils` 管理 session cookie；client 只通过 composable/API 读取 safe user state。

**技术意义：** client storage 不能成为权限来源；server route 才能判断 protected resource。

**概念解释：** sealed cookie 是 browser 持有的加密 session envelope；server helper 负责写入、读取、清理；client composable 负责 UI state。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** cookie 可随 request 发送，但 role check 在 server route。

**Nuxt advanced 机制证据链：** `server/api/auth/session.get.ts` 返回 session state；`SessionStatus.vue` 展示 safe user。

**TypeScript / Nuxt type generation 编译期过程：** `shared/types/auth-utils.d.ts` 扩展 session payload 类型。

**Server / Nitro / Module / Vue / Browser 运行时过程：** login 写 cookie；browser 后续请求带 cookie；server 解封 session；Vue 只显示结果。

**API / 语法规则：** `useUserSession`、`setUserSession`、`getUserSession`、`clearUserSession`、`requireUserSession`。

**文件结构：** `server/api/auth/`、`shared/types/auth.ts`、`app/components/SessionStatus.vue`。

**示例代码：** 本节核心是 server-only session helpers，代码见 9.7 和 9.8。

**逐行解释：** session payload 中只保存 safe user，不保存 password、raw token 或 private server secret。

**执行过程：** `useUserSession` 获取当前登录状态；logout 清理 session cookie；server routes 重新读取 session。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** cookie 存在时 UI 可显示 user；cookie 无效时 protected server route 返回 401。

**为什么得到这个结果：** 权限必须绑定 server-verifiable state，而不是 browser-owned flag。

**对比写法：** `localStorage.setItem("role", "admin")` 只是 browser 字符串，server 不应信任。

**常见错误为什么错：** 把 route middleware 当安全层，会让 API 被直接调用时失守。

**与真实项目的关系：** 后续接入 OAuth 或 database 时，仍然保持 server session authority。

**与当前学习主线的关系：** 连接 Chapter 06 permission 与 Chapter 09 API runtime boundary。

**最终记忆模型：** Auth UI asks; server decides。

<a id="section-9-7"></a>

### 9.7 Login/logout flow：server validation、session set/clear、safe user payload 与 error boundary

**结论：** login route 必须先验证 unknown body，再创建 safe session payload。

**本节解决的问题：** `/api/auth/login` 处理 valid credentials、invalid credentials 和 malformed payload。

**技术意义：** server validation 是 security and correctness boundary，不能只依赖 client form validation。

**概念解释：** unknown request body 先进入 Zod parser；只有 parser 成功后才查 user；成功后写 sealed cookie；失败返回 401 或 422。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** form 只是输入界面，server route 是认证决策点。

**Nuxt advanced 机制证据链：** `server/api/auth/login.post.ts` 使用 `parseLoginBody`、`findDemoUser`、`setUserSession`。

**TypeScript / Nuxt type generation 编译期过程：** `rawBody: unknown` 阻止未验证字段被直接使用。

**Server / Nitro / Module / Vue / Browser 运行时过程：** POST request 到 Nitro route；route parse body；server 写 session cookie；browser 接收 response。

**API / 语法规则：** `readBody`、`createError`、`setUserSession`、Zod parse。

**文件结构：** `server/api/auth/login.post.ts`、`server/api/auth/logout.post.ts`、`server/utils/serverValidation.ts`、`server/utils/sessionPolicy.ts`。

**示例代码：** login route 保持 server authority。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/server/api/auth/login.post.ts</span></div>

```ts
import { findDemoUser } from "../../utils/mockUsers";
import { createSessionPayload } from "../../utils/sessionPolicy";
import {
  isValidationFailure,
  parseLoginBody,
} from "../../utils/serverValidation";
import type { LoginResponse } from "../../../shared/types/auth";

export default defineEventHandler(async (event) => {
  const rawBody: unknown = await readBody(event);

  try {
    const credentials = parseLoginBody(rawBody);
    const user = findDemoUser(credentials.email, credentials.password);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Invalid credentials.",
      });
    }

    await setUserSession(event, createSessionPayload(user));

    return {
      user,
    } satisfies LoginResponse;
  } catch (error) {
    if (isValidationFailure(error)) {
      throw createError({
        statusCode: 422,
        statusMessage: "Unprocessable Entity",
        message: "Login payload is invalid.",
      });
    }

    throw error;
  }
});
```

</div>

**逐行解释：** `readBody` 只产生 unknown；`parseLoginBody` 负责 shape validation；`findDemoUser` 只在 validated input 后执行；`setUserSession` 只保存 projected payload。

**执行过程：** invalid shape 得到 422；wrong credentials 得到 401；valid credentials 写 session 并返回 safe user。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** login 成功后 session cookie 让 `SessionStatus` 和 protected fetch 变为 logged-in state。

**为什么得到这个结果：** `nuxt-auth-utils` 的 server helper 需要 Nuxt server runtime；Zod parse 把 unknown input 变成 typed credentials。

**对比写法：** 直接读取 `body.email` 会把 unknown external input 当可信 object。

**常见错误为什么错：** 在 client form 里判断 role 不能保护 `/api/admin/report`。

**与真实项目的关系：** database user lookup、password hashing、OAuth callback 都应接在同样的 server validation/session boundary 上。

**与当前学习主线的关系：** 这是 Chapter 08 form validation 和 Chapter 09 API error boundary 的 full-stack 版本。

**最终记忆模型：** Login = unknown body -> server validation -> identity lookup -> safe session -> UI refresh。

<a id="section-9-8"></a>

### 9.8 Protected server routes：require session、role check、401/403、private runtime config 与 server authority

**结论：** 保护资源必须在 server route 中执行 session and role check。

**本节解决的问题：** `/api/account/profile` 要求登录；`/api/admin/report` 要求 admin role。

**技术意义：** 直接访问 API 时不会经过 page UI，所以 API 自身必须有权限判断。

**概念解释：** 401 表示没有认证 session；403 表示有 session 但权限不足；private runtime config 只在 server route 可见。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** `privateReportSecret` 不进入 page payload，只在 server route 中读取。

**Nuxt advanced 机制证据链：** `server/api/admin/report.get.ts` 调用 `requireUserSession` 和 `requireRole`。

**TypeScript / Nuxt type generation 编译期过程：** `AdminReportResponse` 约束 response shape。

**Server / Nitro / Module / Vue / Browser 运行时过程：** Request 带 cookie 到 Nitro；server 解出 session；role check 决定 response。

**API / 语法规则：** `requireUserSession`、`useRuntimeConfig(event)`、`createError`。

**文件结构：** `server/api/admin/report.get.ts`、`server/utils/authorization.ts`。

**示例代码：** admin route 展示 server-only authority。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/server/api/admin/report.get.ts</span></div>

```ts
import { requireRole } from "../../utils/authorization";
import type { AdminReportResponse } from "../../../shared/types/auth";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  requireRole(session.user, "admin");

  const runtimeConfig = useRuntimeConfig(event);

  return {
    reportId: "advanced-report-001",
    generatedFor: session.user,
    privateConfigAvailable: Boolean(runtimeConfig.privateReportSecret),
    records: [
      "Server route checked a sealed cookie session.",
      "Role authorization ran on the server.",
      "Private runtime config stayed server-only.",
    ],
  } satisfies AdminReportResponse;
});
```

</div>

**逐行解释：** `requireUserSession` 先确认 authentication；`requireRole` 再确认 authorization；`useRuntimeConfig(event)` 在 server context 读取 private value。

**执行过程：** 未登录访问返回 401；learner session 返回 403；admin session 返回 report。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** session cookie 改变 server response，但 private config 不暴露给 browser。

**为什么得到这个结果：** Cookie 由 browser 携带，但解封和授权逻辑在 server。

**对比写法：** 只在 `/admin` page 用 middleware 拦截，不能阻止直接 fetch `/api/admin/report`。

**常见错误为什么错：** 把 private secret 放进 `runtimeConfig.public` 会进入 client payload。

**与真实项目的关系：** 所有 admin、billing、account、private data API 都应使用 server authority。

**与当前学习主线的关系：** 它把 Chapter 06 meta permission 从 UI guard 提升为 server route permission。

**最终记忆模型：** Protected data lives behind protected server routes。

<a id="section-9-9"></a>

### 9.9 Protected page routes：client route middleware、dashboard UX、admin UX 与 no security illusion

**结论：** page middleware 是 UX layer，不是 security layer。

**本节解决的问题：** `authenticated.ts` 和 `admin-only.ts` 让 dashboard/admin 页面给出更早的 navigation feedback。

**技术意义：** 用户体验和安全权限必须分层，否则容易误以为隐藏页面就是保护数据。

**概念解释：** route middleware 在 navigation 时运行；server route authorization 在 data access 时运行。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** middleware 控制 page flow，server API 控制 data flow。

**Nuxt advanced 机制证据链：** `app/pages/dashboard.vue` 和 `app/pages/admin/index.vue` 使用 page meta middleware。

**TypeScript / Nuxt type generation 编译期过程：** middleware file names 被 Nuxt 生成 route middleware references。

**Server / Nitro / Module / Vue / Browser 运行时过程：** navigation 触发 middleware；API fetch 仍然走 Nitro server route。

**API / 语法规则：** `defineNuxtRouteMiddleware`、`navigateTo`、`definePageMeta`。

**文件结构：** `app/middleware/authenticated.ts`、`app/middleware/admin-only.ts`、`app/pages/dashboard.vue`、`app/pages/admin/index.vue`。

**示例代码：** 本节示例在 middleware files 中；它们只决定 navigation，不返回 protected data。

**逐行解释：** middleware 读取 client-visible session state；缺失时 redirect；role 不足时 redirect 或显示 fallback。

**执行过程：** 未登录打开 dashboard 会被送到 login；直接 API request 仍由 server route 决定 401/403。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** login 改变 client session state 后，middleware 允许进入 dashboard UI。

**为什么得到这个结果：** Browser navigation 是可绕开的；server API request 是必须被保护的 resource boundary。

**对比写法：** 只有 middleware 没有 protected server route 是 security illusion。

**常见错误为什么错：** 把 admin button 隐藏掉不等于禁止 admin API。

**与真实项目的关系：** 真项目同时需要 UX guard 和 server authorization。

**与当前学习主线的关系：** 复盘 Chapter 06 route guard 的边界。

**最终记忆模型：** Middleware guides users; server routes guard data。

<a id="section-9-10"></a>

### 9.10 Runtime config hardening：NUXT_SESSION_PASSWORD、private/public config、env examples 与 leak prevention

**结论：** private runtime config 只给 server，public runtime config 会进入 client payload。

**本节解决的问题：** `.env.example` 和 `.env.production.example` 只给 safe examples，不包含真实 secret。

**技术意义：** session password 和 server-only config 是部署时必须显式设置的 security input。

**概念解释：** `runtimeConfig` private keys 在 server side 可用；`runtimeConfig.public` 会被 client 使用；`NUXT_SESSION_PASSWORD` 用于 session sealing；dev HTTP smoke 需要 non-secure cookie，production 应使用 secure cookie。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** `privateReportSecret` 只在 `server/api/admin/report.get.ts` 使用。

**Nuxt advanced 机制证据链：** env example files 存在；server route 只返回 `privateConfigAvailable` boolean，不返回 secret value。

**TypeScript / Nuxt type generation 编译期过程：** runtime config keys 由 Nuxt config shape 推导。

**Server / Nitro / Module / Vue / Browser 运行时过程：** server 启动时读取 env；browser 只接收 public payload。

**API / 语法规则：** `runtimeConfig`、`runtimeConfig.public`、`useRuntimeConfig(event)`、`NUXT_SESSION_PASSWORD`。

**文件结构：** `nuxt.config.ts`、`.env.example`、`.env.production.example`。

**示例代码：** 本节关键代码在 9.1 和 9.8 的 config/server route 示例中。

**逐行解释：** public title/base path 可进入 UI；private report secret 不出现在 component。

**执行过程：** build 生成 server output；runtime 读取 matching env vars；API route 能确认 private config exists。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** runtime config 决定 server behavior 和 public UI config，但不会改变 content source。

**为什么得到这个结果：** Nuxt 明确把 public config 加进 payload，private config 只在 server context 读取。

**对比写法：** `runtimeConfig.public.secret` 会把 secret 暴露给 browser。

**常见错误为什么错：** 在 docs 中写真实 `NUXT_SESSION_PASSWORD` 会泄露部署 secret。

**与真实项目的关系：** production env management 必须区分 example、local secret 和 deployed secret。

**与当前学习主线的关系：** 延续 Chapter 11 env exposure verification。

**最终记忆模型：** public config is product data; private config is server authority。

<a id="section-9-11"></a>

### 9.11 Server validation：unknown body、Zod parse、422 error、client validation UX 与 server authority

**结论：** 所有 external body 都先是 unknown，必须由 server parser 变成 typed data。

**本节解决的问题：** login 和 contact API 都通过 server validation 处理 request body。

**技术意义：** TypeScript 不能验证 runtime input；Zod parse 是 runtime validation。

**概念解释：** TypeScript 检查源代码，Zod 检查运行时 value，Nitro route 决定 HTTP error。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** client validation 只提升 UX；server validation 才是 authority。

**Nuxt advanced 机制证据链：** `server/utils/serverValidation.ts` 统一 parse helpers；tests 覆盖 valid/invalid payload。

**TypeScript / Nuxt type generation 编译期过程：** parser return type 让后续 code 使用 typed credentials/contact input。

**Server / Nitro / Module / Vue / Browser 运行时过程：** request 到达 server route，parser 成功才进入业务逻辑，失败抛出 HTTP error。

**API / 语法规则：** `z.object`、`.safeParse` 或 `.parse`、`createError`。

**文件结构：** `server/utils/serverValidation.ts`、`server/api/contact.post.ts`、`tests/utils/validation.test.ts`。

**示例代码：** 本节 parser 被 9.7 login route 使用。

**逐行解释：** `unknown` 阻止直接信任 external shape；parser 是 runtime proof。

**执行过程：** invalid email 或 short password 被 422 捕获；valid payload 才进入 lookup。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** validation failure 不会写 session cookie，也不会改变 protected UI。

**为什么得到这个结果：** TypeScript 类型在运行时被擦除，必须用 runtime validator 处理 request body。

**对比写法：** `const body = await readBody<LoginInput>(event)` 只是类型断言，不是验证。

**常见错误为什么错：** client form schema 不能保护 direct API request。

**与真实项目的关系：** 所有 create/update/import APIs 都要保留 server validation。

**与当前学习主线的关系：** 连接 Chapter 05 TypeScript boundary 和 Chapter 08 form validation。

**最终记忆模型：** TypeScript narrows code; Zod validates data。

<a id="section-9-12"></a>

### 9.12 Local Nuxt layer：extends、base-ui layer、auto-scanned files、priority 与 override boundary

**结论：** local layer 适合复用 Nuxt app files and config，不适合承载业务权限。

**本节解决的问题：** `layers/base-ui/` 提供 `BaseCard`、`BaseButton` 和 theme composable。

**技术意义：** layer 让多个 Nuxt apps 可共享 UI/config，但项目文件仍有更高 override priority。

**概念解释：** layer 结构接近 Nuxt app；`extends` 把 layer 合入当前 app；本项目文件可覆盖 layer files。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** layer 提供 reusable UI，不保存 session 或 private runtime config。

**Nuxt advanced 机制证据链：** `nuxt.config.ts` 的 `extends: ["./layers/base-ui"]`；layer 中有 app components。

**TypeScript / Nuxt type generation 编译期过程：** layer composables/components 被 Nuxt auto import/type generation 识别。

**Server / Nitro / Module / Vue / Browser 运行时过程：** Vue template 可使用 layer component；runtime 渲染时它像本 app component 一样工作。

**API / 语法规则：** `extends`、`layers/`、auto-scanned `app/components`、auto-scanned `app/composables`。

**文件结构：** `layers/base-ui/nuxt.config.ts`、`layers/base-ui/app/components/`、`layers/base-ui/app/composables/`。

**示例代码：** local layer component 保持简单可复用。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/layers/base-ui/app/components/BaseCard.vue</span></div>

```vue
<template>
  <section class="base-card">
    <slot />
  </section>
</template>

<style scoped>
.base-card {
  padding: 1rem;
  border: 1px solid #d8e4de;
  border-radius: 1rem;
  background: #ffffff;
}
</style>
```

</div>

**逐行解释：** component 只提供 slot container 和 style；不读取 auth state，不调用 server API。

**执行过程：** Nuxt 合并 layer 后，app 可直接使用 layer component。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** layer override 会改变 UI composition，不应改变 authorization result。

**为什么得到这个结果：** layer 是 file reuse mechanism，不是 security boundary。

**对比写法：** 把 auth role check 放进 layer component 会让权限依赖 UI。

**常见错误为什么错：** layer priority 不等于 business priority；项目文件覆盖 layer 只是 file resolution。

**与真实项目的关系：** design system、default layouts、shared composables 可放 layer。

**与当前学习主线的关系：** 连接 Chapter 04 composables architecture 和 Chapter 08 UI reuse。

**最终记忆模型：** Layer shares files; server routes guard data。

<a id="section-9-13"></a>

### 9.13 Layer versus module versus component library：reuse strategy、build-time hooks、runtime components 与 ownership

**结论：** layer、module、component library 解决的问题不同，不能互相替代。

**本节解决的问题：** 判断什么时候写 layer，什么时候装 module，什么时候抽 component。

**技术意义：** 复用策略错误会导致 build hooks、runtime authority 和 UI ownership 混乱。

**概念解释：** module 扩展 Nuxt capability；layer 复用 Nuxt app files/config；component library 复用 UI primitives。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** 本章 module 处理 content/image/session；layer 处理 base UI；components 处理 local presentation。

**Nuxt advanced 机制证据链：** `modules`、`extends`、`app/components` 同时存在且职责不同。

**TypeScript / Nuxt type generation 编译期过程：** module 可能扩展 generated types；layer files 也进入 auto imports；component props/emits 单独 typecheck。

**Server / Nitro / Module / Vue / Browser 运行时过程：** module hooks 可影响 server/build；layer/component 主要影响 Vue render tree。

**API / 语法规则：** `defineNuxtConfig.modules`、`defineNuxtConfig.extends`、Vue SFC component props。

**文件结构：** `nuxt.config.ts`、`layers/base-ui/`、`app/components/`。

**示例代码：** 本节用 9.1 config 和 9.12 layer 示例对比。

**逐行解释：** `modules` 是 capability list；`extends` 是 app file reuse list；component 是 render unit。

**执行过程：** Nuxt 启动时先解析 config/modules/layers，再编译 app components。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** module 可能创建 new API；layer override 改 UI；component prop 改局部 render。

**为什么得到这个结果：** 它们介入 Nuxt lifecycle 的层级不同。

**对比写法：** 为一个 card style 写 Nuxt module 是过度设计；为 Content query 写普通 component library 则缺少 module capability。

**常见错误为什么错：** 复用 UI 时引入全功能 module，会增加不必要 runtime/build cost。

**与真实项目的关系：** 架构评审要先问 ownership，再选 reuse tool。

**与当前学习主线的关系：** 帮你从 Vue component reuse 走向 Nuxt app architecture reuse。

**最终记忆模型：** Module adds capability; layer shares app files; component renders UI。

<a id="section-9-14"></a>

### 9.14 Nuxt tests：@nuxt/test-utils、server route tests、page smoke tests、validation tests 与 Chapter 10 bridge

**结论：** Chapter 13 的验证不是只跑 build，还要用 tests 覆盖 server validation、session projection 和 page smoke。

**本节解决的问题：** `tests/` 目录覆盖 auth、protected route、content API、page rendering、validation。

**技术意义：** Full-stack lab 的风险点包括 request body、session payload、server authorization 和 route rendering。

**概念解释：** Vitest 负责 test runner；`@nuxt/test-utils` 提供 Nuxt-aware config/runtime；server utils 可做 narrow tests。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** tests 验证规则，不替代 manual dev/preview smoke。

**Nuxt advanced 机制证据链：** `vitest.config.ts` 使用 `defineVitestConfig`；`tests/server/auth-session.test.ts` 检查 safe user projection。

**TypeScript / Nuxt type generation 编译期过程：** tests 被 tsconfig include 覆盖，typecheck 能发现 test import/type drift。

**Server / Nitro / Module / Vue / Browser 运行时过程：** utility tests 不启动完整 browser；page tests 验证 SSR/page output smoke。

**API / 语法规则：** `defineVitestConfig`、`describe`、`it`、`expect`。

**文件结构：** `tests/server/`、`tests/pages/`、`tests/utils/`、`tests/setup/`。

**示例代码：** auth session test 检查 password 不进入 session payload。

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">nuxt-labs/chapter-13-nuxt-advanced-production-lab/tests/server/auth-session.test.ts</span></div>

```ts
import { describe, expect, it } from "vitest";
import { findDemoUser } from "../../server/utils/mockUsers";
import { createSessionPayload } from "../../server/utils/sessionPolicy";
import { parseLoginBody } from "../../server/utils/serverValidation";

describe("auth session boundary", () => {
  it("validates login body before session lookup", () => {
    const payload = parseLoginBody({
      email: "learner@example.com",
      password: "learn-nuxt-13",
    });

    expect(payload.email).toBe("learner@example.com");
  });

  it("rejects invalid login body", () => {
    expect(() => parseLoginBody({ email: "bad", password: "short" })).toThrow();
  });

  it("projects a safe user into session payload", () => {
    const user = findDemoUser("admin@example.com", "admin-nuxt-13");

    expect(user).not.toBeNull();
    expect(user?.role).toBe("admin");

    if (user) {
      const payload = createSessionPayload(user);
      expect(payload.user.email).toBe("admin@example.com");
      expect("password" in payload.user).toBe(false);
    }
  });
});
```

</div>

**逐行解释：** test 先验证 parser，再验证 invalid input，再验证 session payload projection。

**执行过程：** `npm run test` 启动 Vitest，执行 server/page/utility tests。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** test failure 提示某个 boundary 行为退化。

**为什么得到这个结果：** Narrow tests 比手动点击更容易证明 validation 和 projection 规则。

**对比写法：** 只跑 `npm run build` 不能证明 invalid login body 返回 422。

**常见错误为什么错：** 把 e2e 当唯一验证会让 server utility rules 难以定位。

**与真实项目的关系：** 真实项目会继续加 integration/e2e，但本章不引入额外 test framework。

**与当前学习主线的关系：** 直接承接 Chapter 10 testing quality。

**最终记忆模型：** Test the rule at the smallest boundary that owns it。

<a id="section-9-15"></a>

### 9.15 Content and image production readiness：generate/build output、asset paths、SEO, accessibility and cache boundary

**结论：** Content/image ready 不等于 dev server 能显示；必须验证 build/generate/preview 输出。

**本节解决的问题：** docs prerender、blog SSR、gallery assets、SEO meta 和 static preview route 都需要 evidence。

**技术意义：** 生产输出和开发期 Vite transform 不是同一阶段。

**概念解释：** build 生成 server output；generate 生成 static/prerender output；preview 运行 production output。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** auth server module 依赖 Nuxt server；static generated pages 不能代表 server session production behavior。

**Nuxt advanced 机制证据链：** `npm run build`、`npm run generate`、`npm run preview` 分别验证 output。

**TypeScript / Nuxt type generation 编译期过程：** build 前 typecheck 应先通过，避免 output 包含 type drift。

**Server / Nitro / Module / Vue / Browser 运行时过程：** preview 用 `.output/` 运行，不是 source dev server。

**API / 语法规则：** `nuxt build`、`nuxt generate`、`nuxt preview`、`routeRules`。

**文件结构：** `.output/`、`dist/`、`public/images/gallery/`。

**示例代码：** production commands 见 Section 12。

**逐行解释：** build/generate/preview 分别回答 server output、static output、production smoke 三个问题。

**执行过程：** commands 读取 lab config，生成 output，然后通过 HTTP smoke 检查 routes。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** content route output 和 image asset URL 会体现在 generated HTML/assets 中。

**为什么得到这个结果：** Nuxt 的 production behavior 由 Nitro output 和 prerender rules 决定。

**对比写法：** 只打开 dev server 不等于验证 deployment output。

**常见错误为什么错：** 把 `nuxt generate` 当 auth server verification 会忽略 auth-utils 的 server requirement。

**与真实项目的关系：** 发布前必须确认 host mode：Node server、serverless、edge 或 static。

**与当前学习主线的关系：** 承接 Chapter 11 deployment validation。

**最终记忆模型：** Production evidence lives in output commands and smoke routes。

<a id="section-9-16"></a>

### 9.16 Session production readiness：cookie secret、secure deployment env、server-only data 与 logout invalidation

**结论：** session production readiness 的核心是 secret、cookie lifecycle、server-only data 和 logout invalidation。

**本节解决的问题：** env examples 提示 `NUXT_SESSION_PASSWORD`，logout route 清理 session。

**技术意义：** session secret 不应写死到 public docs；logout 必须让后续 protected request 失效。

**概念解释：** session password 用于 sealing；cookie 随 request 发送；server helper 解封；logout 清理 cookie。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** client never owns the secret and never decides final authorization。

**Nuxt advanced 机制证据链：** `.env.production.example` 只提供 placeholder；`logout.post.ts` 调用 clear helper。

**TypeScript / Nuxt type generation 编译期过程：** session augmentation 让 session user shape 在 server/client code 中被检查。

**Server / Nitro / Module / Vue / Browser 运行时过程：** login writes cookie；logout clears cookie；next protected request fails without session。

**API / 语法规则：** `NUXT_SESSION_PASSWORD`、`clearUserSession`、`requireUserSession`。

**文件结构：** `.env.example`、`.env.production.example`、`server/api/auth/logout.post.ts`。

**示例代码：** logout code is small and server-owned; see `server/api/auth/logout.post.ts`。

**逐行解释：** 清理 session 是 server action，client button 只是触发 request。

**执行过程：** valid login 后 profile returns 200；logout 后 profile should return 401。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** cookie removal changes both session UI and protected server response。

**为什么得到这个结果：** Session state is bound to sealed cookie and server helper, not component state。

**对比写法：** `loggedIn.value = false` 只改变 UI，不清理 server session。

**常见错误为什么错：** 生产环境没有 stable `NUXT_SESSION_PASSWORD` 会让 sessions 无法可靠解封。

**与真实项目的关系：** secret rotation、secure cookies、domain/path policy 需要部署层配合。

**与当前学习主线的关系：** 把 Chapter 06 permission 与 Chapter 11 env discipline 合并。

**最终记忆模型：** Session production = strong secret + server helpers + logout invalidation。

<a id="section-9-17"></a>

### 9.17 Module performance and risk review：bundle impact、server output, hydration risk, dependency updates

**结论：** 每个 module 都应被 review：它影响 bundle、server output、hydration risk 还是 dependency maintenance。

**本节解决的问题：** 本章只保留 Content/Image/Auth Utils 三个能力 module。

**技术意义：** 生产级 app 的风险来自运行时行为和升级成本，不只来自代码是否能跑。

**概念解释：** Content 影响 content build/query；Image 影响 image rendering/provider；Auth Utils 影响 server session routes。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** 没有引入不在任务范围内的 cloud/database/UI modules。

**Nuxt advanced 机制证据链：** `package.json` dependencies list 和 `nuxt.config.ts` modules list 一一对应。

**TypeScript / Nuxt type generation 编译期过程：** module update 可能改变 generated types，因此需要 rerun prepare/typecheck。

**Server / Nitro / Module / Vue / Browser 运行时过程：** module update 可能改变 server output route handling 或 client hydration payload。

**API / 语法规则：** `npm ls --depth=0`、`npm run build`、`npm run generate`。

**文件结构：** `package-lock.json` 记录 resolved dependency tree。

**示例代码：** 见 Section 12 的 dependency audit command。

**逐行解释：** 审查 dependency tree 是 validation 的一部分，不是发布后才做。

**执行过程：** install 后检查 top-level packages；build/generate 检查 output behavior。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** dependency update 可能改变所有这些环节，所以需要 lockfile and commands。

**为什么得到这个结果：** Nuxt app 是 module-composed runtime，module 版本就是 runtime contract 的一部分。

**对比写法：** `latest` without lockfile review makes future reproduction harder。

**常见错误为什么错：** 只看 source diff 不看 lockfile，会漏掉 dependency behavior change。

**与真实项目的关系：** 真项目要有 dependency update policy 和 release note review。

**与当前学习主线的关系：** 延续 Chapter 11 production review。

**最终记忆模型：** Module adoption includes upgrade cost。

<a id="section-9-18"></a>

### 9.18 Chapter integration：Chapter 12 Nuxt boundary 如何升级成 advanced app capability

**结论：** Chapter 12 建立 Nuxt boundary，Chapter 13 在 boundary 内组合 content、image、session、layer、tests。

**本节解决的问题：** 防止把 Nuxt lab 的 server/runtime concerns 泄漏回根 Vite app。

**技术意义：** 学习项目需要能同时展示章节进度和保护每个 runtime 的边界。

**概念解释：** 根 app 是 Vite SPA learning shell；Nuxt lab 是 independent full-stack app；两者通过 docs and summary panel 关联。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** Chapter 13 Vite panel 不 import Nuxt lab files。

**Nuxt advanced 机制证据链：** `App.vue` only imports `NuxtAdvancedProductionChapterApp.vue` from `src/learning/vue/...`。

**TypeScript / Nuxt type generation 编译期过程：** root `vue-tsc` checks Vite app; lab `nuxt typecheck` checks Nuxt app。

**Server / Nitro / Module / Vue / Browser 运行时过程：** root `npm run dev` starts Vite; lab `npm run dev` starts Nuxt on port 3040。

**API / 语法规则：** separate package scripts and package roots。

**文件结构：** `src/learning/vue/chapter-13-nuxt-advanced-production/` 与 `nuxt-labs/chapter-13-nuxt-advanced-production-lab/`。

**示例代码：** root integration is one component import and one render point。

**逐行解释：** App shell 只显示 summary，所有 server/API/content/image/auth code 在 lab 内。

**执行过程：** root build 不需要 Nuxt dependencies；lab build 不需要 root Vite app。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** 两套 command 输出独立，避免交叉污染。

**为什么得到这个结果：** package boundary 和 directory boundary 同时存在。

**对比写法：** 把 Nuxt pages 放进 root `src/` 会让 Vite app 无法理解 Nuxt conventions。

**常见错误为什么错：** 在根 `package.json` 加 Nuxt dependency 会扩大任务边界。

**与真实项目的关系：** monorepo/subproject 要清楚 package ownership。

**与当前学习主线的关系：** 强化 Chapter 01 application boundary。

**最终记忆模型：** One learning shell can point to multiple isolated labs。

<a id="section-9-19"></a>

### 9.19 Final integration：nuxt-advanced-production-lab 如何形成可扩展 Nuxt 项目骨架

**结论：** 这个 lab 是可扩展骨架，但不是生产模板；扩展前必须先写 boundary and validation rule。

**本节解决的问题：** 给后续 database/OAuth/deployment/provider work 留出位置，同时不提前引入。

**技术意义：** 可扩展不是提前装所有东西，而是让每个新能力有清楚接入点。

**概念解释：** 新 data source 应进入 server/API/content boundary；新 auth provider 应接入 server callback/session boundary；新 UI system 应先评估 layer/component boundary。

**边界：Nuxt app、Nuxt module、local layer、content source、image provider、server API route、client route middleware、server session、sealed cookie、runtime config、public payload、private value、Nuxt test runner、production output：** 本章结束时仍保持 local-only lab，没有 remote/deploy side effects。

**Nuxt advanced 机制证据链：** README、env examples、tests、package scripts 和 guide 共同说明 extension path。

**TypeScript / Nuxt type generation 编译期过程：** 每次新增 module/type augmentation 后重跑 `npm run prepare` 和 `npm run typecheck`。

**Server / Nitro / Module / Vue / Browser 运行时过程：** 新 server routes 进入 Nitro；新 UI 进入 Vue render tree；新 content 进入 Content collections。

**API / 语法规则：** add capability only with config, files, tests, docs, and validation evidence。

**文件结构：** extension points are `server/api/`, `server/utils/`, `content/`, `layers/`, `tests/`。

**示例代码：** Section 12 gives the final project commands and smoke targets。

**逐行解释：** 骨架的价值在于 boundary names 明确，后续改动可被小范围 review。

**执行过程：** 开发者新增能力，补类型和 tests，跑 validation commands，再更新 docs。

**module registration、content query、image rendering、login request、session cookie、protected server route、layer override、test setup、build/generate output 与 UI render 的变化：** 每个 extension 都应说明影响哪一个或哪几个环节。

**为什么得到这个结果：** 当前文件结构已经把 content、image、auth、layer、test、output 分开。

**对比写法：** 把所有逻辑写进 `app.vue` 会让每个 extension 都变成大重构。

**常见错误为什么错：** 没有 validation evidence 的“可扩展”只是目录看起来多。

**与真实项目的关系：** 真项目架构要能支持增量变更和回归验证。

**与当前学习主线的关系：** Chapter 13 把前 12 章的 component、type、router、state、API、test、deployment 合并到 Nuxt full-stack lab。

**最终记忆模型：** Extensible Nuxt app = clear boundaries + small modules + server authority + reproducible validation。

## 10. API / 语法索引

| API / 语法 | 所属边界 | 本章用法 |
| --- | --- | --- |
| `defineNuxtConfig` | Nuxt config | 注册 modules、extends、runtimeConfig、routeRules |
| `modules` | Nuxt module | 注册 Content、Image、Auth Utils |
| `extends` | Nuxt layer | 接入 `layers/base-ui` |
| `routeRules` | Nitro/Nuxt output | 设置 docs prerender、blog SSR、dashboard CSR |
| `runtimeConfig` | Nuxt runtime | 区分 private value 和 public payload |
| `queryCollection` | Nuxt Content | 查询 docs/blog entries |
| `ContentRenderer` | Nuxt Content | 渲染 Markdown body |
| `NuxtImg` | Nuxt Image | 渲染 provider-managed image |
| `useAsyncData` | Nuxt data lifecycle | SSR-aware data fetching |
| `useSeoMeta` | SEO | 设置 page metadata |
| `definePageMeta` | Page metadata | 绑定 layout/middleware |
| `defineNuxtRouteMiddleware` | Route middleware | 做 UX navigation guard |
| `readBody` | Nitro server route | 读取 unknown request body |
| `createError` | Nitro error boundary | 返回 401/403/422/404 |
| `setUserSession` | Auth Utils | 写 session cookie |
| `getUserSession` | Auth Utils | 读取 optional session |
| `requireUserSession` | Auth Utils | 要求 authenticated session |
| `clearUserSession` | Auth Utils | logout 清理 session |
| `defineVitestConfig` | Nuxt test | 配置 Vitest/Nuxt test utils |

## 11. 常见错误表

| # | wrong code/config | error/bug | violated rule | why fails | correct code/config | recognition |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `localStorage.setItem("role", "admin")` | API still exposed | server authority | browser value is user-controlled | `requireUserSession(event)` plus `requireRole(...)` | protected data route has server check |
| 2 | `runtimeConfig.public.secret = "x"` | secret leak | private/public split | public payload reaches browser | `runtimeConfig.privateReportSecret` | secret only read in server route |
| 3 | `readBody<LoginInput>(event)` | invalid body accepted | runtime validation | generic does not parse runtime data | `const rawBody: unknown = await readBody(event)` then `parseLoginBody(rawBody)` | invalid body returns 422 |
| 4 | `modules: ["@nuxt/ui"]` | scope creep | no random modules | no chapter requirement | keep allowed modules only | module list maps to chapter goals |
| 5 | root `package.json` adds `nuxt` | root app polluted | project boundary | Vite shell becomes mixed runtime | lab-local `package.json` | root build remains Vite-only |
| 6 | page-only admin guard | direct API access works | API authority | middleware is bypassable | server route role check | direct fetch returns 401/403 |
| 7 | no `NUXT_SESSION_PASSWORD` example | deployment surprise | env readiness | session secret not documented | `.env.production.example` placeholder | deploy checklist includes secret |
| 8 | real secret in docs | credential leak | no secrets | repo stores private value | placeholder value | no real token in file |
| 9 | no image dimensions | layout shift | image readiness | browser cannot reserve space | `width` and `height` from metadata | stable image card |
| 10 | hard-coded Markdown in component | content duplication | content ownership | page owns content body | `content/*.md` plus `queryCollection` | content changes outside component |
| 11 | no dynamic route 404 | blank page | route contract | missing content not surfaced | `createError({ statusCode: 404 })` | missing slug is clear |
| 12 | no tests for invalid login | auth regression | validation evidence | happy path hides parser bug | validation test | invalid payload covered |
| 13 | `privateReportSecret` returned directly | secret leak | server-only data | response exposes private config | return boolean availability only | response has no secret value |
| 14 | layer stores business role | mixed ownership | layer boundary | UI reuse controls security | server utility owns role check | layer remains presentational |
| 15 | all routes prerendered blindly | auth/static mismatch | output boundary | session server routes need server runtime | selective `routeRules` | static routes documented |
| 16 | no `npm run prepare` | missing generated types | Nuxt type generation | auto imports/types absent | run `npm run prepare` | `.nuxt` types exist |
| 17 | only dev smoke | production gap | validation boundary | dev server differs from output | build/generate/preview smoke | output is checked |
| 18 | `any` in server utility | type erosion | TS strictness | invalid shapes can pass | `unknown` plus typed parser | no `any` needed |
| 19 | `@ts-ignore` near session | hidden type bug | no ignored diagnostics | suppresses real mismatch | fix session type augmentation | typecheck passes without ignores |
| 20 | database driver added for mock users | dependency creep | local lab scope | no database requirement | mock data in server utils | package list stays small |
| 21 | `better-sqlite3` forced on Node 26 | install friction | environment fit | native SQLite is available | `sqliteConnector: "native"` | install avoids extra DB driver |
| 22 | image provider undocumented | migration risk | provider boundary | URL behavior unclear | `image.provider = "ipx"` | config names provider |
| 23 | route middleware fetches private secret | secret exposure risk | client/server split | middleware may run client-side | server route reads config | secret never enters client |
| 24 | tests import generated output | brittle tests | test ownership | output paths change | tests import source utilities | tests stay source-level |
| 25 | one component owns all lab logic | unreviewable app | file boundary | auth/content/image mix together | app/server/shared/content/layers split | each folder has one responsibility |

## 12. 最终小项目

小项目名称：`nuxt-advanced-production-lab`

目标：在不迁移根 Vite app 的前提下，完成一个独立 Nuxt full-stack learning lab，包含 content-driven docs/blog、image gallery、sealed-cookie session、protected server routes、local layer、tests、production output commands。

关键映射：

| 能力 | 文件 | 验证 |
| --- | --- | --- |
| Module config | `nuxt.config.ts` | `npm run prepare`、`npm run typecheck` |
| Content docs/blog | `content/`、`app/pages/docs/`、`app/pages/blog/` | dev/preview route smoke |
| Image gallery | `app/pages/gallery/`、`server/api/gallery/` | gallery route smoke |
| Login/logout | `server/api/auth/`、`app/components/LoginForm.vue` | login/profile/logout smoke |
| Admin protection | `server/api/admin/report.get.ts` | 401/403/200 smoke |
| Layer reuse | `layers/base-ui/` | root page render and build |
| Tests | `tests/` | `npm run test` |

主要命令：

<div class="macos-code-window">
<div class="macos-code-titlebar"><span class="macos-dot red"></span><span class="macos-dot yellow"></span><span class="macos-dot green"></span><span class="macos-code-title">Terminal: lab-validation.ps1</span></div>

```powershell
cd D:\vue\nuxt-labs\chapter-13-nuxt-advanced-production-lab
npm install
npm run prepare
npm run typecheck
npm run test
npm run build
npm run generate
npm run preview
```

</div>

Expected behavior:

- `/` shows the lab overview.
- `/docs` lists docs from `content/docs/`.
- `/docs/getting-started` renders a content page.
- `/blog/first-post` renders a blog page.
- `/gallery` renders local image metadata through Nuxt Image.
- `/login` can log in demo users.
- `/api/account/profile` returns 401 without a session and 200 with a valid session.
- `/api/admin/report` returns 401 without session, 403 for non-admin session, and 200 for admin session.

Expected errors:

| Case | Expected result |
| --- | --- |
| malformed login payload | 422 |
| wrong credentials | 401 |
| non-admin admin report request | 403 |
| missing content slug | 404 |

Possible extensions, still outside this task:

- Replace mock users with database-backed users.
- Add OAuth callback flow.
- Add deployment-provider-specific Nitro preset.
- Add visual/e2e tests.
- Add image CDN provider.

Each extension must add config, source files, tests, docs, and validation evidence in the same change.

## 13. 额外速查表

| Question | Answer |
| --- | --- |
| Where does protected data live? | Server routes |
| Where does content live? | `content/` |
| Where does reusable Nuxt UI live? | local layer or app components |
| Where does auth secret live? | deployment env/private runtime config |
| What does route middleware protect? | page navigation UX |
| What protects API data? | server session and role checks |
| What proves Nuxt types exist? | `npm run prepare` and `npm run typecheck` |
| What proves production server output? | `npm run build` |
| What proves static output routes? | `npm run generate` and preview smoke |
| What should not be added without scope? | database drivers, ORMs, cloud SDKs, UI frameworks, unrelated test frameworks |

## 14. 真实项目判断模型

| 选择 | 适合使用 | 不适合使用 | 必须证明 | 后续 owner |
| --- | --- | --- | --- | --- |
| Nuxt module | It supplies real build/runtime integration such as Content/Image/test utilities | 只是因为生态流行或少写几行 local code | config、page/server usage、test/build evidence all exist | Module maintenance / dependency update process |
| Local layer | Multiple Nuxt apps need shared app files/config conventions | 单 app 内普通组件复用，或业务权限藏在 layer | override priority documented and smoke-tested | Component library or Nuxt module when packaging outward |
| Component library | Reusable UI independent of Nuxt app filesystem | Needs pages/server/routes/runtime config | props/events/slots API works outside this Nuxt app | Design system package |
| Content source | docs/blog/marketing content belongs to versioned files and queries | Highly relational/user-specific data | slug, not-found, SEO, prerender/generate paths pass | CMS/database if editors or dynamic relations dominate |
| Image provider | Image performance needs responsive sizes/provider/cache policy | Small static icons or unmeasured optimization | rendered URL, dimensions, lazy behavior, CLS/perf evidence | CDN/image service operations |
| Server route + sealed session | Server must own protected data and session projection | Client-only UX guard or localStorage token | login parses unknown body, cookie set/cleared, protected API 401/403 works | Real auth provider/database for production identity |
| Page middleware | Improve dashboard/admin navigation UX | Protect private data by itself | middleware redirect plus server route denial both tested | Server route authorization |
| Nuxt tests | Advanced capability crosses server/page/module boundaries | Pure function or component can be tested cheaper | server route, page smoke, validation tests run in Nuxt harness | Chapter 10 quality pipeline / CI |

## 15. 如何转换成个人笔记

建议按这个模板重写成你自己的笔记：

| 模块 | 你要回答的问题 |
| --- | --- |
| Module | 为什么选这个 module，不选其他 module？ |
| Content | 哪些数据由 content source 拥有？ |
| Image | 图片尺寸、provider、lazy loading 如何被验证？ |
| Session | 哪个 server route 写 session，哪个 route 要求 session？ |
| Middleware | 它改善了什么 UX，它不能保护什么？ |
| Runtime config | 哪些 key 是 private，哪些 key 是 public？ |
| Layer | 它复用了什么，不应该拥有什么？ |
| Tests | 哪条业务规则由哪个 test 证明？ |
| Output | build/generate/preview 分别证明什么？ |

## 16. 必须能回答的问题

1. 为什么本章没有把根 Vite app 改成 Nuxt？
2. 为什么 `nuxt-auth-utils` 不能用作纯静态 auth server？
3. 为什么 route middleware 不是安全边界？
4. 为什么 request body 要先当作 unknown？
5. 为什么 `runtimeConfig.public` 不能放 secret？
6. Content collection 和 page component 的 ownership 有什么不同？
7. `NuxtImg` 和 provider 的关系是什么？
8. layer、module、component library 的区别是什么？
9. 为什么 `npm run prepare` 和 `npm run typecheck` 是两个不同阶段？
10. `npm run build` 和 `npm run generate` 分别证明什么？
11. 为什么 admin report route 返回 boolean 而不是 secret value？
12. 如果未来接 database，要新增哪些验证？

## 17. 最终记忆模型

Nuxt advanced production-grade pattern 可以压缩成一句话：

> 先定义 ownership，再选择 module；先保护 server data，再改善 client UX；先验证 output，再谈 production readiness。

在本章中：

- Content owns text.
- Server routes own authority.
- Runtime config owns environment boundary.
- Layer owns reusable app files.
- Components own UI.
- Tests own evidence.
- Build/generate/preview own production proof.

## 18. 官方文档阅读清单

- Nuxt modules author guide: <https://nuxt.com/docs/4.x/guide/modules/getting-started>
- Nuxt Content configuration: <https://content.nuxt.com/docs/getting-started/configuration>
- Nuxt Content queryCollection: <https://content.nuxt.com/docs/utils/query-collection>
- Nuxt Image `NuxtImg`: <https://image.nuxt.com/usage/nuxt-img>
- Nuxt Image providers: <https://image.nuxt.com/get-started/providers>
- Nuxt Auth Utils: <https://nuxt.com/modules/auth-utils>
- Nuxt sessions and authentication recipe: <https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication>
- Nuxt layers: <https://nuxt.com/docs/4.x/getting-started/layers>
- Nuxt testing: <https://nuxt.com/docs/4.x/getting-started/testing>
- Nuxt runtime config: <https://nuxt.com/docs/4.x/guide/going-further/runtime-config>
- Nuxt server directory: <https://nuxt.com/docs/4.x/directory-structure/server>
- Nuxt deployment: <https://nuxt.com/docs/4.x/getting-started/deployment>

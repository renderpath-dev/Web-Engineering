# Node.js 第 11 章：生产部署、Docker、CI/CD、反向代理、数据库迁移发布与运行时配置边界

<style>
.macos-code-window {
  overflow: hidden;
  border: 1px solid #30363d;
  border-radius: 12px;
  background: #0d1117;
  margin: 16px 0;
}

.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.macos-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
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
  margin-left: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  color: #c9d1d9;
}

.macos-code-titlebar + pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background: transparent;
  border-radius: 0 0 12px 12px;
}

.macos-code-titlebar + pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
}
</style>

> 适用版本：Node.js 26.x；npm 11.x；TypeScript 7.x；Express 5.x；Prisma 7.x；Docker 与 GitHub Actions 以当前官方文档为准。
>
> 本章边界：学习 Node.js API 从本地源码进入生产式 release artifact 的过程，覆盖 Docker、Compose、CI、反向代理、迁移发布、运行时配置、健康检查、smoke test 与 shutdown；不进入云厂商、Kubernetes、Terraform、serverless、CDN、service mesh 或高级 SRE 自动化。

## 目录

- [本章代码定位索引](#本章代码定位索引)
- [0. 章前定位](#0-章前定位)
- [1. 学习目标](#1-学习目标)
- [2. 前置知识](#2-前置知识)
- [3. 环境与运行基线](#3-环境与运行基线)
- [4. 第一性原理](#4-第一性原理)
- [5. 技术边界模型](#5-技术边界模型)
- [6. 底层机制模型](#6-底层机制模型)
- [7. 核心术语](#7-核心术语)
- [8. 本章实践路线](#8-本章实践路线)
- [9. 核心教学](#9-核心教学)
  - [9.1 Development runtime versus production runtime](#section-9-1)
  - [9.2 Source code, build output, runtime artifact, and release artifact](#section-9-2)
  - [9.3 npm install versus npm ci and lockfile reproducibility](#section-9-3)
  - [9.4 package scripts：build、start、typecheck、test、migration、smoke](#section-9-4)
  - [9.5 TypeScript build output for Node ESM](#section-9-5)
  - [9.6 Runtime configuration and startup env validation](#section-9-6)
  - [9.7 `.env.example`, real secrets, and CI secrets boundary](#section-9-7)
  - [9.8 `NODE_ENV=production` and production runtime behavior](#section-9-8)
  - [9.9 Docker build context and `.dockerignore`](#section-9-9)
  - [9.10 Multi-stage Dockerfile for a TypeScript Node API](#section-9-10)
  - [9.11 Docker Compose local production simulation](#section-9-11)
  - [9.12 Prisma generate and `prisma migrate deploy`](#section-9-12)
  - [9.13 Database migration safety and rollback boundary](#section-9-13)
  - [9.14 Health checks in deployment：liveness、readiness、container healthcheck](#section-9-14)
  - [9.15 Reverse proxy model：client、NGINX、Node process](#section-9-15)
  - [9.16 Express `trust proxy`, forwarded headers, and secure cookies](#section-9-16)
  - [9.17 WebSocket and SSE proxy boundaries](#section-9-17)
  - [9.18 Static storage and uploaded files in containerized runtime](#section-9-18)
  - [9.19 Logs, stdout/stderr, and no local log files in containers](#section-9-19)
  - [9.20 GitHub Actions CI：install、generate、typecheck、test、build](#section-9-20)
  - [9.21 Smoke tests, release validation, and graceful shutdown](#section-9-21)
  - [9.22 Chapter integration: deployable-notes-api](#section-9-22)
- [10. API 与规则索引](#10-api-与规则索引)
- [11. 常见错误对照表](#11-常见错误对照表)
- [12. 调试与验证方法](#12-调试与验证方法)
- [13. 分项练习说明](#13-分项练习说明)
- [14. 最终迷你项目](#14-最终迷你项目)
  - [14.1 项目目标](#141-项目目标)
  - [14.2 最终迷你项目结构](#142-最终迷你项目结构)
  - [14.3 完整项目代码](#143-完整项目代码)
  - [14.4 运行与测试](#144-运行与测试)
  - [14.5 执行与生命周期](#145-执行与生命周期)
  - [14.6 常见错误](#146-常见错误)
- [15. 知识迁移与真实项目场景](#15-知识迁移与真实项目场景)
- [16. 本章复盘任务](#16-本章复盘任务)
- [17. 最终心智模型](#17-最终心智模型)
- [18. 官方资料](#18-官方资料)

## 本章代码定位索引

| 学习目标 | 文件或片段 | 可观察证据 |
| --- | --- | --- |
| Development runtime versus production runtime | `practices/11-production-deployment/01-release-model/dev-vs-production-runtime.ts` | development command, build command, production command |
| Source code, build output, runtime artifact, and release artifact | `practices/11-production-deployment/01-release-model/source-build-runtime-artifact.ts` | source, dist, image, migrations, CI workflow |
| npm install versus npm ci and lockfile reproducibility | `practices/11-production-deployment/02-npm-build-runtime/npm-install-vs-ci.ts` | lockfile, node_modules, install command |
| package scripts：build、start、typecheck、test、migration、smoke | `practices/11-production-deployment/02-npm-build-runtime/package-scripts-boundary.ts` | package scripts and release gates |
| TypeScript build output for Node ESM | `practices/11-production-deployment/02-npm-build-runtime/typescript-build-output.ts` | NodeNext emitted JavaScript path |
| Runtime configuration and startup env validation | `practices/11-production-deployment/02-npm-build-runtime/startup-env-validation.ts` | Zod parse before listen |
| `.env.example`, real secrets, and CI secrets boundary | `mini-projects/deployable-notes-api/.env.example` | .env.example placeholders and secret storage boundary |
| `NODE_ENV=production` and production runtime behavior | `practices/11-production-deployment/02-npm-build-runtime/node-env-production.ts` | production mode switches debug and cookie policy |
| Docker build context and `.dockerignore` | `practices/11-production-deployment/03-docker-container/dockerignore-boundary.ts` | build context exclusions |
| Multi-stage Dockerfile for a TypeScript Node API | `mini-projects/deployable-notes-api/Dockerfile` | deps, builder, runtime stages |
| Docker Compose local production simulation | `mini-projects/deployable-notes-api/compose.yaml` | api, postgres, redis, nginx services |
| Prisma generate and `prisma migrate deploy` | `practices/11-production-deployment/04-database-release/prisma-migrate-dev-vs-deploy.ts` | client generation and committed migrations |
| Database migration safety and rollback boundary | `practices/11-production-deployment/04-database-release/migration-safety-boundary.ts` | destructive change and backward compatibility |
| Health checks in deployment：liveness、readiness、container healthcheck | `practices/11-production-deployment/03-docker-container/container-healthcheck.ts` | live, ready, container probes |
| Reverse proxy model：client、NGINX、Node process | `practices/11-production-deployment/05-proxy-runtime/reverse-proxy-header-model.ts` | forwarded header ownership |
| Express `trust proxy`, forwarded headers, and secure cookies | `practices/11-production-deployment/05-proxy-runtime/express-trust-proxy-boundary.ts` | Express proxy trust and cookie behavior |
| WebSocket and SSE proxy boundaries | `practices/11-production-deployment/05-proxy-runtime/websocket-proxy-upgrade.ts` | HTTP upgrade and stream buffering |
| Static storage and uploaded files in containerized runtime | `practices/11-production-deployment/03-docker-container/dockerignore-boundary.ts` | container filesystem and upload storage ownership |
| 集成生产部署边界 | `mini-projects/deployable-notes-api/src/server.ts` | `SIGTERM` 进入 `server.close()`、Redis quit、Prisma disconnect |
| 验证最终项目接口契约 | `mini-projects/deployable-notes-api/openapi/openapi.yaml` | `/health/live`、`/health/ready`、`/metrics` 与继承 API 被描述 |

## 0. 章前定位

前十章已经建立了 Node.js runtime、HTTP/Express、TypeScript、Prisma、Redis、auth、文件上传、realtime、observability 的局部能力。本章解决的是另一个层级的问题：同一份后端源码如何变成可复现安装、可构建、可迁移、可运行、可被反向代理、可被健康检查、可被 CI 验证、可被 shutdown 清理的生产式发布单元。

本章不把部署等同于某个云平台。生产部署的第一层机制是本地也能验证的：`package-lock.json`、`npm ci`、`tsc` 输出、Docker build context、Compose dependency graph、Prisma migration files、NGINX forwarded headers、Express `trust proxy`、stdout/stderr、health endpoints、smoke test 和 process signal。

## 1. 学习目标

完成本章后，你应该能解释并验证：

- 为什么 development runtime、build command、production runtime 是三件事。
- 为什么 `npm ci` 和 lockfile 是 CI reproducibility boundary。
- 为什么 TypeScript 源码需要明确的 production execution strategy。
- 为什么 `.env.example` 只能记录变量名和占位值，不能携带真实 secret。
- Docker build context、`.dockerignore`、multi-stage build 如何影响镜像内容。
- `prisma migrate deploy` 如何从 committed migration files 应用生产迁移。
- liveness、readiness、container healthcheck 各自证明什么。
- NGINX 与 Express `trust proxy` 如何影响 `req.ip`、`req.protocol` 和 secure cookie。
- CI、smoke test、graceful shutdown 与 rollback 判断如何组成 release safety chain。

## 2. 前置知识

你需要已经理解 Node process、`process.env`、signals、HTTP request/response、Express middleware、TypeScript `NodeNext`、Zod runtime validation、Prisma schema/migrations、Redis connection、cookie session、CSRF、Prometheus metrics、SSE/WebSocket 的基本边界。这里不会重新教学这些主题，只会把它们放进发布路径。

## 3. 环境与运行基线

本章示例使用 ESM TypeScript 项目，Node 运行 built JavaScript。开发命令可以使用 watcher，生产 `start` 不可以。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```txt
node --version
npm --version
npm install
npm run prisma:generate
npm run typecheck
npm test
npm run build
npm run start
```
</div>

Windows PowerShell 设置变量时使用 `$env:NAME = "value"`；macOS/Linux 使用 `NAME=value command` 或 `export NAME=value`。不要把 POSIX shell 写法当成 PowerShell 可运行命令。

## 4. 第一性原理

部署不是“把本地命令搬到服务器”。部署的核心是固定边界：依赖解析边界、编译输出边界、镜像文件系统边界、环境变量边界、数据库迁移边界、反向代理边界、健康探针边界、日志输出边界和 shutdown 边界。每个边界都有自己的证据：lockfile、`dist/`、image layer、validated env object、migration SQL、forwarded headers、HTTP status、stdout/stderr、exit code。

## 5. 技术边界模型

| 层 | 本章责任 | 常见误解 |
| --- | --- | --- |
| TypeScript | 检查源码与输出 JS 形状 | 以为类型能验证 `.env` 和数据库状态 |
| npm | 安装、scripts、lockfile | 以为 `npm install` 等同 CI reproducibility |
| Docker | build context、image filesystem、runtime command | 把 `.env` 和本地文件复制进镜像 |
| Prisma | Client generation 与 migration deploy | 在生产发布使用 `migrate dev` |
| Express | middleware、`trust proxy`、cookies | 无条件信任 `X-Forwarded-*` |
| NGINX | proxy headers、upgrade、buffering | 以为代理不会改变 request interpretation |
| Node process | env snapshot、HTTP server、signals、stdio | `SIGTERM` 后立刻 `process.exit()` |
| CI | install、generate、typecheck、test、build | 把未运行的步骤当成通过 |

## 6. 底层机制模型

```txt
source files
  -> npm ci reads package-lock
  -> prisma generate reads schema and env config
  -> tsc emits dist
  -> docker build copies selected context
  -> container starts node dist/src/server.js
  -> NGINX forwards HTTP headers
  -> Express handles routes and trust proxy
  -> health and smoke observe runtime state
  -> SIGTERM closes HTTP, Redis, and Prisma
```

上面每个箭头都是一个可失败边界。学习重点不是背命令，而是知道每个箭头读取什么输入、创建什么资源、输出什么证据，以及失败时该看哪一层。

## 7. 核心术语

| Concept | Layer | Meaning | Common Mistake |
| --- | --- | --- | --- |
| release artifact | deployment/runtime environment | 可被部署系统启动和验证的一组输出 | 只把源码仓库当成发布物 |
| runtime artifact | Docker / process | 容器镜像或 built JS entry | 在生产运行 watcher |
| readiness | health boundary | 服务能真实接流量的依赖状态 | 把 process live 当 ready |
| trust proxy | Express convention | 是否信任 forwarded headers | 未配置时读取错误协议和 IP |
| migration deploy | Prisma tooling | 应用已提交迁移文件 | 生产运行 `migrate dev` |
| smoke test | release validation | 启动后验证安全端点 | 只跑 build 不验证进程 |

## 8. 本章实践路线

实践顺序是：先拆 development/build/runtime，再拆 npm 和 TypeScript 输出；再进入 Docker context、multi-stage、Compose；然后处理 Prisma migration deploy 与 rollback；再处理 NGINX、`trust proxy`、cookie、SSE/WebSocket 边界；最后用 CI、smoke test、graceful shutdown 串成最终项目。

## 9. 核心教学


<a id="section-9-1"></a>

### 9.1 Development runtime versus production runtime

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `development command, build command, production command` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/01-release-model/dev-vs-production-runtime.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `development command, build command, production command`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/01-release-model/dev-vs-production-runtime.ts</span>
  </div>

```ts
export type RuntimeRole = "development" | "build" | "production";

export interface RuntimeCommand {
  role: RuntimeRole;
  command: string;
  watchesSource: boolean;
  createsRuntimeArtifact: boolean;
}

export const runtimeCommands: RuntimeCommand[] = [
  { role: "development", command: "tsx watch src/server.ts", watchesSource: true, createsRuntimeArtifact: false },
  { role: "build", command: "tsc -p tsconfig.json", watchesSource: false, createsRuntimeArtifact: true },
  { role: "production", command: "node dist/src/server.js", watchesSource: false, createsRuntimeArtifact: false }
];

export function isValidProductionRuntime(command: RuntimeCommand): boolean {
  return command.role === "production" && command.command.startsWith("node ") && !command.watchesSource;
}

export function explainRuntimeBoundary(command: RuntimeCommand): string {
  if (command.watchesSource) return "Watcher processes are development feedback loops, not release runtimes.";
  if (command.createsRuntimeArtifact) return "Build commands create emitted JavaScript but do not serve traffic.";
  return "Production runtime starts a fixed artifact with the Node process.";
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `development command, build command, production command` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-2"></a>

### 9.2 Source code, build output, runtime artifact, and release artifact

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `source, dist, image, migrations, CI workflow` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/01-release-model/source-build-runtime-artifact.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `source, dist, image, migrations, CI workflow`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/01-release-model/source-build-runtime-artifact.ts</span>
  </div>

```ts
export type ArtifactKind = "source" | "build-output" | "runtime-artifact" | "release-artifact";

export interface ArtifactBoundary {
  path: string;
  kind: ArtifactKind;
  sourceControlled: boolean;
  producedBy: string;
}

export const artifactBoundaries: ArtifactBoundary[] = [
  { path: "src/server.ts", kind: "source", sourceControlled: true, producedBy: "developer edit" },
  { path: "dist/src/server.js", kind: "build-output", sourceControlled: false, producedBy: "npm run build" },
  { path: "deployable-notes-api:chapter-11", kind: "runtime-artifact", sourceControlled: false, producedBy: "docker build" },
  { path: "prisma/migrations/0001_init/migration.sql", kind: "release-artifact", sourceControlled: true, producedBy: "prisma migrate dev" },
  { path: ".github/workflows/ci.yml", kind: "release-artifact", sourceControlled: true, producedBy: "developer edit" }
];

export function sourceControlledArtifacts(boundaries: ArtifactBoundary[]): ArtifactBoundary[] {
  return boundaries.filter((boundary) => boundary.sourceControlled);
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `source, dist, image, migrations, CI workflow` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-3"></a>

### 9.3 npm install versus npm ci and lockfile reproducibility

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `lockfile, node_modules, install command` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/02-npm-build-runtime/npm-install-vs-ci.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `lockfile, node_modules, install command`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/02-npm-build-runtime/npm-install-vs-ci.ts</span>
  </div>

```ts
export interface InstallCommandModel {
  command: "npm install" | "npm ci";
  requiresLockfile: boolean;
  mayRewriteLockfile: boolean;
  removesExistingNodeModules: boolean;
}

export const installCommands: InstallCommandModel[] = [
  { command: "npm install", requiresLockfile: false, mayRewriteLockfile: true, removesExistingNodeModules: false },
  { command: "npm ci", requiresLockfile: true, mayRewriteLockfile: false, removesExistingNodeModules: true }
];

export function selectInstallCommand(hasLockfile: boolean, inContinuousIntegration: boolean): "npm install" | "npm ci" {
  if (inContinuousIntegration && hasLockfile) return "npm ci";
  return "npm install";
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `lockfile, node_modules, install command` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-4"></a>

### 9.4 package scripts：build、start、typecheck、test、migration、smoke

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `package scripts and release gates` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/02-npm-build-runtime/package-scripts-boundary.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `package scripts and release gates`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/02-npm-build-runtime/package-scripts-boundary.ts</span>
  </div>

```ts
export const productionScripts = {
  build: "tsc -p tsconfig.json",
  start: "node dist/src/server.js",
  typecheck: "tsc --noEmit",
  test: "node --import tsx --test tests/*.test.ts",
  "prisma:migrate:deploy": "prisma migrate deploy",
  smoke: "tsx scripts/smoke-test.ts"
} as const;

export function rejectsWatcherStart(startCommand: string): boolean {
  return !/\bwatch\b|\btsx\s+watch\b|\bnodemon\b/.test(startCommand);
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `package scripts and release gates` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-5"></a>

### 9.5 TypeScript build output for Node ESM

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `NodeNext emitted JavaScript path` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/02-npm-build-runtime/typescript-build-output.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `NodeNext emitted JavaScript path`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/02-npm-build-runtime/typescript-build-output.ts</span>
  </div>

```ts
export interface TypeScriptBuildOutput {
  rootDir: string;
  outDir: string;
  module: "NodeNext";
  moduleResolution: "NodeNext";
  runtimeEntry: string;
}

export const nodeEsmBuild: TypeScriptBuildOutput = {
  rootDir: ".",
  outDir: "dist",
  module: "NodeNext",
  moduleResolution: "NodeNext",
  runtimeEntry: "dist/src/server.js"
};

export function emittedPath(sourcePath: string, build: TypeScriptBuildOutput): string {
  return sourcePath.replace(build.rootDir + "/", build.outDir + "/").replace(/\.ts$/, ".js");
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `NodeNext emitted JavaScript path` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-6"></a>

### 9.6 Runtime configuration and startup env validation

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `Zod parse before listen` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/02-npm-build-runtime/startup-env-validation.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `Zod parse before listen`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/02-npm-build-runtime/startup-env-validation.ts</span>
  </div>

```ts
import { z } from "zod";

const startupEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().min(1).max(65535)
});

export type StartupEnv = z.infer<typeof startupEnvSchema>;

export function parseStartupEnv(source: NodeJS.ProcessEnv): StartupEnv {
  return startupEnvSchema.parse(source);
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `Zod parse before listen` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-7"></a>

### 9.7 `.env.example`, real secrets, and CI secrets boundary

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `.env.example placeholders and secret storage boundary` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `mini-projects/deployable-notes-api/.env.example` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `.env.example placeholders and secret storage boundary`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/.env.example</span>
  </div>

```txt
NODE_ENV=development
PORT=3020
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deployable_notes_api
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=deployable_notes_session
SESSION_SECRET=replace-with-at-least-32-characters
SESSION_TTL_SECONDS=604800
CSRF_COOKIE_NAME=deployable_notes_csrf
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
TRUST_PROXY=false
COOKIE_SECURE=false
LOG_LEVEL=info
SHUTDOWN_TIMEOUT_MS=10000
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `.env.example placeholders and secret storage boundary` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-8"></a>

### 9.8 `NODE_ENV=production` and production runtime behavior

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `production mode switches debug and cookie policy` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/02-npm-build-runtime/node-env-production.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `production mode switches debug and cookie policy`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/02-npm-build-runtime/node-env-production.ts</span>
  </div>

```ts
export type NodeEnvironment = "development" | "test" | "production";

export interface RuntimeModeConfig {
  nodeEnv: NodeEnvironment;
  enableDebugErrors: boolean;
  useSecureCookies: boolean;
}

export function createRuntimeModeConfig(nodeEnv: NodeEnvironment): RuntimeModeConfig {
  return {
    nodeEnv,
    enableDebugErrors: nodeEnv !== "production",
    useSecureCookies: nodeEnv === "production"
  };
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `production mode switches debug and cookie policy` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-9"></a>

### 9.9 Docker build context and `.dockerignore`

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `build context exclusions` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/03-docker-container/dockerignore-boundary.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `build context exclusions`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/03-docker-container/dockerignore-boundary.ts</span>
  </div>

```ts
export const dockerIgnoreEntries = [
  "node_modules",
  ".env",
  ".env.*",
  "logs",
  "*.log",
  "coverage",
  "docs",
  "dist",
  "secrets",
  "*.pem"
] as const;

export function shouldExcludeFromDockerContext(path: string): boolean {
  return dockerIgnoreEntries.some((entry) => path === entry || path.startsWith(entry + "/"));
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `build context exclusions` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-10"></a>

### 9.10 Multi-stage Dockerfile for a TypeScript Node API

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `deps, builder, runtime stages` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `mini-projects/deployable-notes-api/Dockerfile` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `deps, builder, runtime stages`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/Dockerfile</span>
  </div>

```txt
# syntax=docker/dockerfile:1
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
EXPOSE 3020
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3020/health/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/src/server.js"]
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `deps, builder, runtime stages` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-11"></a>

### 9.11 Docker Compose local production simulation

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `api, postgres, redis, nginx services` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `mini-projects/deployable-notes-api/compose.yaml` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `api, postgres, redis, nginx services`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/compose.yaml</span>
  </div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: deployable_notes_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - deployable-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d deployable_notes_api"]
      interval: 5s
      timeout: 5s
      retries: 20

  redis:
    image: redis:8-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 20

  api:
    build:
      context: .
    environment:
      NODE_ENV: production
      PORT: 3020
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/deployable_notes_api
      REDIS_URL: redis://redis:6379
      SESSION_COOKIE_NAME: deployable_notes_session
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `api, postgres, redis, nginx services` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-12"></a>

### 9.12 Prisma generate and `prisma migrate deploy`

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `client generation and committed migrations` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/04-database-release/prisma-migrate-dev-vs-deploy.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `client generation and committed migrations`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/04-database-release/prisma-migrate-dev-vs-deploy.ts</span>
  </div>

```ts
export interface PrismaMigrationCommand {
  command: "prisma migrate dev" | "prisma migrate deploy";
  environment: "development" | "production";
  createsMigrationFiles: boolean;
  appliesCommittedMigrations: boolean;
}

export const prismaMigrationCommands: PrismaMigrationCommand[] = [
  { command: "prisma migrate dev", environment: "development", createsMigrationFiles: true, appliesCommittedMigrations: true },
  { command: "prisma migrate deploy", environment: "production", createsMigrationFiles: false, appliesCommittedMigrations: true }
];
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `client generation and committed migrations` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-13"></a>

### 9.13 Database migration safety and rollback boundary

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `destructive change and backward compatibility` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/04-database-release/migration-safety-boundary.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `destructive change and backward compatibility`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/04-database-release/migration-safety-boundary.ts</span>
  </div>

```ts
export interface MigrationRisk {
  change: string;
  destructive: boolean;
  requiresBackfill: boolean;
  compatibleWithOldCode: boolean;
}

export function requiresManualReleasePlan(risk: MigrationRisk): boolean {
  return risk.destructive || risk.requiresBackfill || !risk.compatibleWithOldCode;
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `destructive change and backward compatibility` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-14"></a>

### 9.14 Health checks in deployment：liveness、readiness、container healthcheck

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `live, ready, container probes` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/03-docker-container/container-healthcheck.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `live, ready, container probes`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/03-docker-container/container-healthcheck.ts</span>
  </div>

```ts
export interface HealthProbe {
  name: "live" | "ready" | "container";
  path: string;
  dependsOnExternalServices: boolean;
}

export const healthProbes: HealthProbe[] = [
  { name: "live", path: "/health/live", dependsOnExternalServices: false },
  { name: "ready", path: "/health/ready", dependsOnExternalServices: true },
  { name: "container", path: "/health/live", dependsOnExternalServices: false }
];

export function shouldRestartContainer(probe: HealthProbe, ok: boolean): boolean {
  return probe.name === "container" && !ok;
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `live, ready, container probes` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-15"></a>

### 9.15 Reverse proxy model：client、NGINX、Node process

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `forwarded header ownership` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/05-proxy-runtime/reverse-proxy-header-model.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `forwarded header ownership`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/05-proxy-runtime/reverse-proxy-header-model.ts</span>
  </div>

```ts
export interface ForwardedHeaderSet {
  host: string;
  xForwardedFor: string;
  xForwardedProto: "http" | "https";
}

export function createForwardedHeaders(clientIp: string, host: string, proto: "http" | "https"): ForwardedHeaderSet {
  return {
    host,
    xForwardedFor: clientIp,
    xForwardedProto: proto
  };
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `forwarded header ownership` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-16"></a>

### 9.16 Express `trust proxy`, forwarded headers, and secure cookies

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `Express proxy trust and cookie behavior` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/05-proxy-runtime/express-trust-proxy-boundary.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `Express proxy trust and cookie behavior`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/05-proxy-runtime/express-trust-proxy-boundary.ts</span>
  </div>

```ts
export interface TrustProxyDecision {
  trustProxy: boolean;
  acceptsForwardedHeaders: boolean;
  affectsSecureCookies: boolean;
}

export function createTrustProxyDecision(trustProxy: boolean): TrustProxyDecision {
  return {
    trustProxy,
    acceptsForwardedHeaders: trustProxy,
    affectsSecureCookies: trustProxy
  };
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `Express proxy trust and cookie behavior` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-17"></a>

### 9.17 WebSocket and SSE proxy boundaries

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `HTTP upgrade and stream buffering` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/05-proxy-runtime/websocket-proxy-upgrade.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `HTTP upgrade and stream buffering`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/05-proxy-runtime/websocket-proxy-upgrade.ts</span>
  </div>

```ts
export interface WebSocketProxyHeaders {
  upgrade: "websocket";
  connection: "upgrade";
  proxyHttpVersion: "1.1";
}

export const websocketProxyHeaders: WebSocketProxyHeaders = {
  upgrade: "websocket",
  connection: "upgrade",
  proxyHttpVersion: "1.1"
};
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `HTTP upgrade and stream buffering` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-18"></a>

### 9.18 Static storage and uploaded files in containerized runtime

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `container filesystem and upload storage ownership` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/03-docker-container/dockerignore-boundary.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `container filesystem and upload storage ownership`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/03-docker-container/dockerignore-boundary.ts</span>
  </div>

```ts
export const dockerIgnoreEntries = [
  "node_modules",
  ".env",
  ".env.*",
  "logs",
  "*.log",
  "coverage",
  "docs",
  "dist",
  "secrets",
  "*.pem"
] as const;

export function shouldExcludeFromDockerContext(path: string): boolean {
  return dockerIgnoreEntries.some((entry) => path === entry || path.startsWith(entry + "/"));
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `container filesystem and upload storage ownership` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-19"></a>

### 9.19 Logs, stdout/stderr, and no local log files in containers

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `process stdio log stream` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/03-docker-container/container-logs-stdout.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `process stdio log stream`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/03-docker-container/container-logs-stdout.ts</span>
  </div>

```ts
export interface LogEvent {
  level: "info" | "warn" | "error";
  message: string;
  target: "stdout" | "stderr";
}

export function routeContainerLog(event: LogEvent): "stdout" | "stderr" {
  if (event.level === "error") return "stderr";
  return "stdout";
}

export const noLocalLogFileRule = "Containers should emit process logs to stdout or stderr.";
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `process stdio log stream` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-20"></a>

### 9.20 GitHub Actions CI：install、generate、typecheck、test、build

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `CI ordered release gates` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/06-ci-smoke-release/github-actions-node-ci.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `CI ordered release gates`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/06-ci-smoke-release/github-actions-node-ci.ts</span>
  </div>

```ts
export const nodeCiSteps = [
  "actions/checkout",
  "actions/setup-node",
  "npm ci",
  "npm run prisma:generate",
  "npm run typecheck",
  "npm test",
  "npm run build",
  "npm run release:validate"
] as const;

export function includesReleaseValidation(steps: readonly string[]): boolean {
  return steps.includes("npm run release:validate");
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `CI ordered release gates` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-21"></a>

### 9.21 Smoke tests, release validation, and graceful shutdown

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `health smoke and shutdown resource closure` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `practices/11-production-deployment/06-ci-smoke-release/smoke-test-health-ready.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `health smoke and shutdown resource closure`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/11-production-deployment/06-ci-smoke-release/smoke-test-health-ready.ts</span>
  </div>

```ts
export interface SmokeEndpoint {
  name: "live" | "ready";
  path: "/health/live" | "/health/ready";
  requiredStatus: 200;
}

export const smokeEndpoints: SmokeEndpoint[] = [
  { name: "live", path: "/health/live", requiredStatus: 200 },
  { name: "ready", path: "/health/ready", requiredStatus: 200 }
];

export function isSmokeSuccess(statusByPath: Record<string, number>): boolean {
  return smokeEndpoints.every((endpoint) => statusByPath[endpoint.path] === endpoint.requiredStatus);
}
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `health smoke and shutdown resource closure` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


<a id="section-9-22"></a>

### 9.22 Chapter integration: deployable-notes-api

**结论：** 生产部署里的这一节不是单个命令的记忆点，而是要明确 `integrated release runtime entry` 由谁创建、谁读取、何时失效，以及错误时能观察到什么。

**本节解决的问题：** 本节把 `mini-projects/deployable-notes-api/src/server.ts` 作为学习证据，说明开发机、CI、Docker build、Node runtime、数据库迁移、反向代理或健康探针之间的责任边界。

**技术意义：** 真实后端失败通常不是 TypeScript 类型写错，而是 release artifact、runtime config、proxy header、dependency readiness 或 shutdown resource 的边界没有固定。把这一节的机制拆开后，故障会落到可检查的文件、命令、进程、socket、环境变量或 HTTP 响应上。

**概念解释：** 本节的核心对象是 `integrated release runtime entry`。它在源代码阶段是文本或配置，在 build 阶段可能变成 `dist/`、Docker layer 或 Prisma Client，在 runtime 阶段由 Node 进程、Express app、Prisma adapter、Redis client、NGINX proxy 或 CI runner 读取。

**边界：语法、JavaScript 运行时、Node 平台 API、模块系统、类型系统、工具链与框架约定：** TypeScript 只检查源码形状；`tsc` 决定 emitted JavaScript；npm 决定 `node_modules` 和 scripts；Docker 决定 image filesystem；Prisma 决定 migration application；Express 和 NGINX 决定 request/proxy interpretation；Node process 决定 env、stdio、HTTP server 和 signal lifecycle。

**底层机制：** 触发动作进入命令或 HTTP 请求后，字符串参数、环境变量、JSON/YAML 字段、request/response 对象或 migration SQL 被读取；工具或 runtime 跨过 filesystem、process、network socket、database connection 或 proxy boundary；结果表现为 build artifact、HTTP status、cookie attribute、log line、health probe result、migration row 或 process shutdown。

**API / 配置 / 命令规则：** 本节要遵守的规则是：生产路径必须使用明确 artifact，runtime config 必须启动前验证，外部依赖 readiness 必须可失败，秘密不能进入镜像或仓库，CI 只能证明它实际执行过的 gates。

**示例代码：**

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/server.ts</span>
  </div>

```ts
import { createServer, type Server } from "node:http";
import { pathToFileURL } from "node:url";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedisClient } from "./redis/redis-client.js";
import { createApp } from "./app.js";
import { logger } from "./observability/logger.js";

export interface ShutdownResource {
  name: string;
  close: () => Promise<void> | void;
}

export interface GracefulShutdownOptions {
  server: Server;
  timeoutMs: number;
  resources: ShutdownResource[];
}

async function closeHttpServer(server: Server, timeoutMs: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.closeAllConnections();
      resolve();
    }, timeoutMs);
    timeout.unref();

    server.close((error) => {
      clearTimeout(timeout);
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
```
</div>

**逐行解释：** 关键行先声明输入值或配置字段，再把这些值交给 npm、TypeScript、Docker、Prisma、Express、NGINX、Node HTTP server 或测试脚本；返回值不是“看起来能跑”，而是具体 artifact、响应状态、header、cookie 属性、stdout/stderr 记录或退出码。

**运行方式：** 在相关练习中读取该文件；在最终项目中使用 `npm install` 建立本地依赖，用 `npm run prisma:generate` 生成 Prisma Client，用 `npm run typecheck` 检查类型，用 `npm run build` 生成 `dist/`，再用 `npm run start` 启动 built JavaScript。

**预期输出：** 正确路径会得到稳定的文件、命令结果、HTTP health signal 或 process state；错误路径会表现为 missing script、missing lockfile、invalid env、readiness 503、proxy header 不可信、cookie Secure 属性错误、migration failure 或 shutdown timeout。

**执行过程：** 同步阶段读取配置和 package metadata；工具阶段执行 install/build/generate/test；运行时阶段创建 Node HTTP server、Express middleware chain、Prisma adapter、Redis client 和 stdio logger；关闭阶段由 `SIGTERM` 触发 `server.close()` 和外部资源 cleanup。

**变量、引用、资源与生命周期变化：** 主要资源从 source file 变成 build output，再变成 runtime process 使用的 file descriptor、socket、environment snapshot、database connection、Redis connection、HTTP response 或 container layer。

**为什么会得到这个结果：** 结果由负责层决定：npm 不会替你证明数据库可用，TypeScript 不会验证环境变量真实性，Docker build 不该携带真实 secret，Express 不会在未配置 `trust proxy` 时自动信任 forwarded headers。

**对比情况：** 正确形式把 development feedback、CI verification、runtime start、migration deploy 和 smoke validation 分开；错误形式把 `tsx watch`、`npm install`、未验证 `.env`、`prisma migrate dev` 或未受信任 proxy headers 带进生产路径。

**常见错误为什么错：** 常见错误违反的是 artifact boundary 或 runtime boundary：命令能在本地启动不等于 release artifact 可复现，健康端点能返回 200 不等于服务 ready，旧代码回滚也不等于数据库状态自动回滚。识别方式是看脚本、日志、HTTP status、Docker layer、migration table 和 process exit code。

**与真实项目的关系：** 这一节对应 code review、CI failure、container startup、reverse proxy 调试、migration release review、post-start smoke test 和 rollback decision。

**与当前学习路径的关系：** 它承接前面章节的 process lifecycle、HTTP/Express、TypeScript、Prisma、Redis、auth cookie、upload storage、SSE/WebSocket 和 observability，只把这些机制放进生产发布边界。

**最终记忆模型：** `integrated release runtime entry` 必须能回答六个问题：谁创建、谁读取、何时运行、跨过哪个边界、输出什么证据、失败时违反哪条规则。


## 10. API 与规则索引

| 名称 | 负责层 | 规则 |
| --- | --- | --- |
| `npm ci` | npm | 需要 lockfile，适合 CI reproducible install |
| `npm install` | npm | 用于开发安装，可能改变 dependency resolution |
| `tsc -p tsconfig.json` | TypeScript | 生成或检查 emitted JavaScript，取决于 `noEmit` |
| `node dist/src/server.js` | Node runtime | 启动已构建 JS，不 watch 源码 |
| `prisma generate` | Prisma | 根据 schema 生成 Prisma Client |
| `prisma migrate deploy` | Prisma | 应用 committed migrations |
| `app.set("trust proxy", value)` | Express | 决定是否信任 forwarded headers |
| `server.close()` | Node HTTP | 停止接收新连接并等待已有连接结束 |
| `server.closeAllConnections()` | Node HTTP | timeout 后关闭现有 HTTP 连接 |
| `HEALTHCHECK` | Dockerfile | 容器运行时探针，不替代 readiness 设计 |

## 11. 常见错误对照表

| Symptom | Violated Rule | Mechanism Cause | Evidence | Correction |
| --- | --- | --- | --- | --- |
| CI 和本地安装结果不同 | lockfile reproducibility | CI 使用 `npm install` 改变解析 | lockfile diff 或 dependency tree diff | CI 使用 `npm ci` |
| 容器内缺少运行文件 | artifact boundary | Dockerfile 没复制 `dist/` | `MODULE_NOT_FOUND` | build 后复制 runtime artifacts |
| readiness 一直 200 但数据库不可用 | health boundary | ready 没检查 dependency | 业务请求 500 | ready 检查 PostgreSQL/Redis |
| secure cookie 没有发送 | proxy trust boundary | Express 未信任代理协议 | `req.secure` false | 配置 `trust proxy` 并验证 forwarded proto |
| 回滚旧镜像后仍失败 | migration boundary | 数据库 schema 已前进 | SQL error 或 Prisma error | 发布前做 migration rollback plan |

## 12. 调试与验证方法

调试部署问题时按边界倒查：先看 `npm run build` 是否产生 `dist/src/server.js`，再看 `npm run start` 是否运行 built JS；容器问题看 Docker context 与 `.dockerignore`；数据库问题看 `prisma migrate status` 和 `prisma migrate deploy`；代理问题看 `Host`、`X-Forwarded-For`、`X-Forwarded-Proto`；健康问题看 `/health/live` 与 `/health/ready` 的状态码差异；shutdown 问题看 `SIGTERM` 后 HTTP server、Redis 和 Prisma 是否完成 cleanup。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```txt
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/deployable_notes_api"
npm run prisma:migrate:deploy
npm run build
npm run start
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
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deployable_notes_api npm run prisma:migrate:deploy
npm run build
npm run start
```
</div>

## 13. 分项练习说明

每个 `practices/11-production-deployment` 文件都对应一个边界。运行方式可以是阅读类型模型、把对象传给函数、或把同名最终项目文件与练习模型对照。练习观察点不是 UI，而是命令选择、artifact path、env validation、Docker context exclusion、migration command、proxy header、cookie secure policy、health probe、stdout/stderr、CI step、smoke result 和 shutdown resource list。

## 14. 最终迷你项目

最终小项目只用于整合本章机制，不替代前面的分节教学。`deployable-notes-api` 延续前面 notes API 的认证、notebook、note、Prisma、Redis、metrics 形状，但学习焦点是 production build、Docker image、Compose simulation、migration deploy、reverse proxy、trust proxy、secure cookies、CI、smoke test、graceful shutdown 和 rollback boundary。

### 14.1 项目目标

项目目标是让一个 TypeScript Express API 具备生产式发布闭环：源码可安装、可生成 Prisma Client、可类型检查、可测试、可构建、可用 built JS 启动、可在 Docker/Compose 中模拟依赖、可被 NGINX 代理、可检查 live/ready、可通过 smoke test、可在 `SIGTERM` 后清理 HTTP/Redis/Prisma。

### 14.2 最终迷你项目结构

| 路径 | 责任 |
| --- | --- |
| `package.json` | 定义 install/build/start/typecheck/test/migration/smoke/release scripts |
| `tsconfig.json` | 定义 Node ESM TypeScript 输出到 `dist/` |
| `.env.example` | 记录 runtime config placeholder |
| `.dockerignore` | 限定 Docker build context |
| `Dockerfile` | multi-stage image build 与 built JS runtime |
| `compose.yaml` | API、PostgreSQL、Redis、NGINX 本地生产模拟 |
| `nginx/nginx.conf` | reverse proxy、forwarded headers、upgrade、buffering boundary |
| `prisma/` | schema、migration SQL、seed |
| `src/app.ts` | Express middleware、proxy trust、routes |
| `src/server.ts` | HTTP server startup、signals、graceful shutdown |
| `src/config/` | env validation 与 production runtime policy |
| `src/health/` | live 与 ready endpoints |
| `src/observability/` | stdout/stderr logger、request metrics、safe error route pattern |
| `src/modules/` | inherited auth/notebook/note API |
| `scripts/` | smoke、ready wait、release artifact validation |
| `tests/` | env、proxy、health、smoke、shutdown validation |

### 14.3 完整项目代码

#### `mini-projects/deployable-notes-api/package.json`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/package.json</span>
  </div>

```json
{
  "name": "deployable-notes-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/src/server.js",
    "typecheck": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "seed": "prisma db seed",
    "test": "node --import tsx --test tests/env.unit.test.ts tests/proxy-config.unit.test.ts tests/health.integration.test.ts tests/smoke.integration.test.ts tests/shutdown.unit.test.ts",
    "smoke": "tsx scripts/smoke-test.ts",
    "wait:ready": "tsx scripts/wait-for-ready.ts",
    "release:validate": "tsx scripts/validate-release.ts"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.6.0",
    "helmet": "^8.3.0",
    "pg": "^8.22.0",
    "pino": "^10.3.1",
    "prom-client": "^15.1.3",
    "redis": "^6.1.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^26.1.1",
    "@types/pg": "^8.20.0",
    "@types/supertest": "^7.2.1",
    "prisma": "^7.8.0",
    "supertest": "^7.2.2",
    "tsx": "^4.23.1",
    "typescript": "^7.0.2"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "engines": {
    "node": ">=26"
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/tsconfig.json`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tsconfig.json</span>
  </div>

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "rootDir": ".",
    "outDir": "dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src", "scripts", "tests", "prisma.config.ts", "prisma"],
  "exclude": ["node_modules", "dist"]
}
```
</div>
#### `mini-projects/deployable-notes-api/.env.example`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/.env.example</span>
  </div>

```txt
NODE_ENV=development
PORT=3020
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deployable_notes_api
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=deployable_notes_session
SESSION_SECRET=replace-with-at-least-32-characters
SESSION_TTL_SECONDS=604800
CSRF_COOKIE_NAME=deployable_notes_csrf
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
TRUST_PROXY=false
COOKIE_SECURE=false
LOG_LEVEL=info
SHUTDOWN_TIMEOUT_MS=10000
```
</div>
#### `mini-projects/deployable-notes-api/.dockerignore`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/.dockerignore</span>
  </div>

```txt
node_modules
npm-debug.log
*.log
logs
.env
.env.*
coverage
docs
dist
.git
.github
secrets
*.pem
*.key
diagnostic-reports
tmp
```
</div>
#### `mini-projects/deployable-notes-api/Dockerfile`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/Dockerfile</span>
  </div>

```txt
# syntax=docker/dockerfile:1
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
EXPOSE 3020
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3020/health/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/src/server.js"]
```
</div>
#### `mini-projects/deployable-notes-api/compose.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/compose.yaml</span>
  </div>

```txt
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: deployable_notes_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - deployable-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d deployable_notes_api"]
      interval: 5s
      timeout: 5s
      retries: 20

  redis:
    image: redis:8-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 20

  api:
    build:
      context: .
    environment:
      NODE_ENV: production
      PORT: 3020
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/deployable_notes_api
      REDIS_URL: redis://redis:6379
      SESSION_COOKIE_NAME: deployable_notes_session
      SESSION_SECRET: local-compose-session-secret-32chars
      SESSION_TTL_SECONDS: 604800
      CSRF_COOKIE_NAME: deployable_notes_csrf
      ALLOWED_ORIGINS: http://localhost:8080,http://127.0.0.1:8080
      TRUST_PROXY: "true"
      COOKIE_SECURE: "false"
      LOG_LEVEL: info
      SHUTDOWN_TIMEOUT_MS: 10000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3020/health/live').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 10

  nginx:
    image: nginx:1.29-alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      api:
        condition: service_healthy

volumes:
  deployable-postgres-data:
```
</div>
#### `mini-projects/deployable-notes-api/nginx/nginx.conf`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/nginx/nginx.conf</span>
  </div>

```txt
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

upstream deployable_notes_api {
  server api:3020;
}

server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://deployable_notes_api;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_buffering off;
    proxy_read_timeout 60s;
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/.github/workflows/ci.yml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/.github/workflows/ci.yml</span>
  </div>

```txt
name: deployable-notes-api-ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_DB: deployable_notes_api
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres -d deployable_notes_api"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 20
      redis:
        image: redis:8-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 20
    env:
      NODE_ENV: test
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/deployable_notes_api
      REDIS_URL: redis://localhost:6379
      SESSION_SECRET: ci-session-secret-with-32-characters
      ALLOWED_ORIGINS: http://localhost:3000
      TRUST_PROXY: "false"
      COOKIE_SECURE: "false"
    defaults:
      run:
        working-directory: mini-projects/deployable-notes-api
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 26
          cache: npm
          cache-dependency-path: mini-projects/deployable-notes-api/package-lock.json
      - name: Install dependencies
        run: npm ci
      - name: Generate Prisma Client
        run: npm run prisma:generate
      - name: Typecheck
        run: npm run typecheck
      - name: Test
        run: npm test
      - name: Build
        run: npm run build
      - name: Validate release artifact
        run: npm run release:validate
```
</div>
#### `mini-projects/deployable-notes-api/prisma.config.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/prisma.config.ts</span>
  </div>

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/deployable_notes_api"
  }
});
```
</div>
#### `mini-projects/deployable-notes-api/prisma/schema.prisma`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/prisma/schema.prisma</span>
  </div>

```txt
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  USER
  ADMIN
}

enum NoteStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

model User {
  id           String     @id @default(uuid()) @db.Uuid
  email        String     @unique @db.VarChar(320)
  passwordHash String     @db.Text
  role         Role       @default(USER)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  sessions     Session[]
  notebooks    Notebook[]
  notes        Note[]
}

model Session {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @db.Uuid
  tokenHash     String    @unique @db.VarChar(96)
  csrfTokenHash String?   @db.VarChar(96)
  userAgent     String?   @db.VarChar(512)
  ipHash        String?   @db.VarChar(96)
  createdAt     DateTime  @default(now())
  expiresAt     DateTime
  revokedAt     DateTime?
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model Notebook {
  id        String   @id @default(uuid()) @db.Uuid
  ownerId   String   @db.Uuid
  name      String   @db.VarChar(120)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notes     Note[]

  @@index([ownerId])
  @@unique([ownerId, name])
}

model Note {
  id         String     @id @default(uuid()) @db.Uuid
  ownerId    String     @db.Uuid
  notebookId String     @db.Uuid
  title      String     @db.VarChar(160)
  body       String     @default("")
  status     NoteStatus @default(ACTIVE)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  owner      User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notebook   Notebook   @relation(fields: [notebookId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@index([notebookId])
  @@index([status, createdAt])
  @@unique([notebookId, title])
}
```
</div>
#### `mini-projects/deployable-notes-api/prisma/seed.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/prisma/seed.ts</span>
  </div>

```ts
import { prisma } from "../src/db/prisma.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

async function seed(): Promise<void> {
  const passwordHash = await hashPassword("ChangeMe123!45");

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
      role: "USER"
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: "Release Notes"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      name: "Release Notes"
    }
  });

  await prisma.note.upsert({
    where: {
      notebookId_title: {
        notebookId: notebook.id,
        title: "Deployment checklist"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      notebookId: notebook.id,
      title: "Deployment checklist",
      body: "Run install, generate, typecheck, test, build, migrate deploy, and smoke."
    }
  });
}

await seed();
await prisma.$disconnect();
```
</div>
#### `mini-projects/deployable-notes-api/prisma/migrations/0001_init/migration.sql`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/prisma/migrations/0001_init/migration.sql</span>
  </div>

```txt
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(320) NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" VARCHAR(96) NOT NULL,
  "csrfTokenHash" VARCHAR(96),
  "userAgent" VARCHAR(512),
  "ipHash" VARCHAR(96),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notebook" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notebook_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Note" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL,
  "notebookId" UUID NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "body" TEXT NOT NULL DEFAULT '',
  "status" "NoteStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "Notebook_ownerId_idx" ON "Notebook"("ownerId");
CREATE UNIQUE INDEX "Notebook_ownerId_name_key" ON "Notebook"("ownerId", "name");
CREATE INDEX "Note_ownerId_idx" ON "Note"("ownerId");
CREATE INDEX "Note_notebookId_idx" ON "Note"("notebookId");
CREATE INDEX "Note_status_createdAt_idx" ON "Note"("status", "createdAt");
CREATE UNIQUE INDEX "Note_notebookId_title_key" ON "Note"("notebookId", "title");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notebook" ADD CONSTRAINT "Notebook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "Notebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```
</div>
#### `mini-projects/deployable-notes-api/src/config/env.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

function numberFromEnv(defaultValue: number) {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    return Number(value);
  }, z.number().int().positive());
}

function optionalBooleanFromEnv() {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return undefined;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean().optional());
}

function booleanFromEnv(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean());
}

function splitOrigins(value: string): string[] {
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: numberFromEnv(3020),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/deployable_notes_api"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("deployable_notes_session"),
  SESSION_SECRET: z.string().min(32).default("development-session-secret-change-me-32"),
  SESSION_TTL_SECONDS: numberFromEnv(604800),
  CSRF_COOKIE_NAME: z.string().min(1).default("deployable_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://127.0.0.1:3000"),
  TRUST_PROXY: booleanFromEnv(false),
  COOKIE_SECURE: optionalBooleanFromEnv(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  SHUTDOWN_TIMEOUT_MS: numberFromEnv(10000)
});

export type RawAppConfig = z.infer<typeof envSchema>;

export interface AppConfig extends Omit<RawAppConfig, "ALLOWED_ORIGINS" | "COOKIE_SECURE"> {
  ALLOWED_ORIGINS: string[];
  COOKIE_SECURE: boolean;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(source);

  if (parsed.NODE_ENV === "production" && parsed.SESSION_SECRET.includes("development")) {
    throw new Error("SESSION_SECRET must be replaced before production startup.");
  }

  return {
    ...parsed,
    ALLOWED_ORIGINS: splitOrigins(parsed.ALLOWED_ORIGINS),
    COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production"
  };
}

export const config = loadEnv();
```
</div>
#### `mini-projects/deployable-notes-api/src/config/production.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/config/production.ts</span>
  </div>

```ts
import type { AppConfig } from "./env.js";

export interface ProductionRuntimePolicy {
  trustProxy: boolean;
  secureCookies: boolean;
  exposeDebugErrors: boolean;
}

export function createProductionRuntimePolicy(config: AppConfig): ProductionRuntimePolicy {
  return {
    trustProxy: config.TRUST_PROXY,
    secureCookies: config.COOKIE_SECURE,
    exposeDebugErrors: config.NODE_ENV !== "production"
  };
}
```
</div>
#### `mini-projects/deployable-notes-api/src/db/prisma.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/db/prisma.ts</span>
  </div>

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/env.js";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL
});

export const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"]
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
```
</div>
#### `mini-projects/deployable-notes-api/src/db/prisma-errors.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/db/prisma-errors.ts</span>
  </div>

```ts
import { HttpError } from "../shared/errors/http-error.js";

interface PrismaLikeError {
  code?: string;
}

export function mapPrismaError(error: unknown): HttpError | undefined {
  const candidate = error as PrismaLikeError;

  if (candidate.code === "P2002") {
    return new HttpError(409, "CONFLICT", "Resource already exists.");
  }

  if (candidate.code === "P2025") {
    return new HttpError(404, "NOT_FOUND", "Resource was not found.");
  }

  return undefined;
}
```
</div>
#### `mini-projects/deployable-notes-api/src/db/db-health.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/db/db-health.ts</span>
  </div>

```ts
import { prisma } from "./prisma.js";

export async function checkDatabase(): Promise<"ready" | "unavailable"> {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return "ready";
  } catch {
    return "unavailable";
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/redis/redis-client.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/redis/redis-client.ts</span>
  </div>

```ts
import { createClient } from "redis";
import { config } from "../config/env.js";

let redisClient: ReturnType<typeof createClient> | undefined;

export function getRedisClient(): ReturnType<typeof createClient> {
  if (!redisClient) {
    redisClient = createClient({
      url: config.REDIS_URL
    });
  }

  return redisClient;
}

export async function connectRedisClient(): Promise<ReturnType<typeof createClient>> {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function closeRedisClient(): Promise<void> {
  if (!redisClient) return;
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  redisClient = undefined;
}
```
</div>
#### `mini-projects/deployable-notes-api/src/redis/redis-health.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/redis/redis-health.ts</span>
  </div>

```ts
import { connectRedisClient } from "./redis-client.js";

export async function checkRedis(): Promise<"ready" | "unavailable"> {
  try {
    const client = await connectRedisClient();
    const pong = await client.ping();
    return pong === "PONG" ? "ready" : "unavailable";
  } catch {
    return "unavailable";
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/health/health.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/health/health.types.ts</span>
  </div>

```ts
export type DependencyStatus = "ready" | "unavailable";

export interface LiveHealth {
  status: "live";
  uptimeSeconds: number;
}

export interface ReadyHealth {
  status: "ready" | "not_ready";
  dependencies: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
  };
}
```
</div>
#### `mini-projects/deployable-notes-api/src/health/health.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/health/health.service.ts</span>
  </div>

```ts
import { checkDatabase } from "../db/db-health.js";
import { checkRedis } from "../redis/redis-health.js";
import type { LiveHealth, ReadyHealth } from "./health.types.js";

export function getLiveness(): LiveHealth {
  return {
    status: "live",
    uptimeSeconds: Math.round(process.uptime())
  };
}

export async function getReadiness(): Promise<ReadyHealth> {
  const [postgres, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const ready = postgres === "ready" && redis === "ready";

  return {
    status: ready ? "ready" : "not_ready",
    dependencies: {
      postgres,
      redis
    }
  };
}
```
</div>
#### `mini-projects/deployable-notes-api/src/health/health.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/health/health.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getLiveness, getReadiness } from "./health.service.js";
import { sendOk } from "../shared/responses/send-response.js";

export async function live(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, getLiveness());
  } catch (error) {
    next(error);
  }
}

export async function ready(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const readiness = await getReadiness();
    const statusCode = readiness.status === "ready" ? 200 : 503;
    sendOk(response.status(statusCode), readiness);
  } catch (error) {
    next(error);
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/health/health.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/health/health.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import * as controller from "./health.controller.js";

export const healthRoutes = Router();

healthRoutes.get("/live", controller.live);
healthRoutes.get("/ready", controller.ready);
```
</div>
#### `mini-projects/deployable-notes-api/src/observability/logger.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/observability/logger.ts</span>
  </div>

```ts
import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: [
      "password",
      "passwordHash",
      "sessionToken",
      "csrfToken",
      "req.headers.authorization",
      "req.headers.cookie",
      "request.headers.authorization",
      "request.headers.cookie"
    ],
    censor: "[Redacted]"
  }
});
```
</div>
#### `mini-projects/deployable-notes-api/src/observability/request-context.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/observability/request-context.ts</span>
  </div>

```ts
import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}
```
</div>
#### `mini-projects/deployable-notes-api/src/observability/metrics.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/observability/metrics.ts</span>
  </div>

```ts
import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: "deployable-notes-api"
});

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "nodejs_"
});

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds by method, route, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry]
});
```
</div>
#### `mini-projects/deployable-notes-api/src/observability/request-logger.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/observability/request-logger.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";
import { httpRequestDurationSeconds, httpRequestsTotal } from "./metrics.js";

function getRoutePattern(request: Request): string {
  if (request.route?.path) return `${request.baseUrl}${String(request.route.path)}`;
  return request.path;
}

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const statusClass = `${Math.trunc(response.statusCode / 100)}xx`;
    const route = getRoutePattern(request);

    httpRequestsTotal.inc({ method: request.method, route, status_class: statusClass });
    httpRequestDurationSeconds.observe({ method: request.method, route, status_class: statusClass }, durationSeconds);

    logger.info({
      requestId: response.getHeader("x-request-id"),
      method: request.method,
      route,
      statusCode: response.statusCode,
      durationSeconds
    }, "request completed");
  });

  next();
}
```
</div>
#### `mini-projects/deployable-notes-api/src/observability/error-logger.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/observability/error-logger.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { logger } from "./logger.js";

function getSafeRoutePattern(request: Parameters<ErrorRequestHandler>[1]): string {
  if (request.route?.path) return `${request.baseUrl}${String(request.route.path)}`;
  return request.path;
}

export const errorLogger: ErrorRequestHandler = (error, request, response, next) => {
  logger.error({
    requestId: response.getHeader("x-request-id"),
    method: request.method,
    route: getSafeRoutePattern(request),
    error
  }, "request failed");

  next(error);
};
```
</div>
#### `mini-projects/deployable-notes-api/src/observability/metrics.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/observability/metrics.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { metricsRegistry } from "./metrics.js";

export const metricsRoutes = Router();

metricsRoutes.get("/", async (_request, response, next) => {
  try {
    response.setHeader("content-type", metricsRegistry.contentType);
    response.send(await metricsRegistry.metrics());
  } catch (error) {
    next(error);
  }
});
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/errors/http-error.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/errors/http-error.ts</span>
  </div>

```ts
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown[] = []
  ) {
    super(message);
    this.name = "HttpError";
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/errors/error-middleware.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/errors/error-middleware.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "./http-error.js";
import { mapPrismaError } from "../../db/prisma-errors.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const prismaError = mapPrismaError(error);
  const normalized = prismaError ?? error;

  if (normalized instanceof HttpError) {
    response.status(normalized.statusCode).json({
      ok: false,
      error: {
        code: normalized.code,
        message: normalized.message,
        details: normalized.details
      }
    });
    return;
  }

  if (normalized instanceof ZodError) {
    response.status(422).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: normalized.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    });
    return;
  }

  response.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error.",
      details: []
    }
  });
};
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/middleware/not-found.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/middleware/not-found.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, "NOT_FOUND", `Route ${request.method} ${request.path} was not found.`));
};
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/middleware/request-id.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/middleware/request-id.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { runWithRequestContext } from "../../observability/request-context.js";

export const requestId: RequestHandler = (request, response, next) => {
  const existing = request.get("x-request-id");
  const id = existing && existing.length <= 128 ? existing : randomUUID();
  response.setHeader("x-request-id", id);
  runWithRequestContext({ requestId: id }, next);
};
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/middleware/security-headers.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/middleware/security-headers.ts</span>
  </div>

```ts
import helmet from "helmet";

export const securityHeaders = helmet({
  crossOriginResourcePolicy: {
    policy: "same-site"
  }
});
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/middleware/cors.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/middleware/cors.ts</span>
  </div>

```ts
import cors from "cors";
import { config } from "../../config/env.js";

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin is not allowed."));
  },
  allowedHeaders: ["content-type", "x-csrf-token", "x-request-id"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
});
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/middleware/rate-limit.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/middleware/rate-limit.ts</span>
  </div>

```ts
import { rateLimit } from "express-rate-limit";

export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/validation/validate-request.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/validation/validate-request.ts</span>
  </div>

```ts
import type { NextFunction, Request, RequestHandler, Response } from "express";

interface RuntimeSchema {
  parse(input: unknown): unknown;
}

export interface RequestSchemas {
  body?: RuntimeSchema;
  params?: RuntimeSchema;
  query?: RuntimeSchema;
}

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (schemas.body) request.body = schemas.body.parse(request.body);
    if (schemas.params) request.params = schemas.params.parse(request.params) as Request["params"];
    if (schemas.query) {
      Object.defineProperty(request, "query", {
        value: schemas.query.parse(request.query),
        configurable: true
      });
    }
    next();
  };
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/responses/send-response.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/responses/send-response.ts</span>
  </div>

```ts
import type { Response } from "express";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export function sendOk<T>(response: Response, data: T): void {
  response.json({ ok: true, data } satisfies ApiSuccess<T>);
}

export function sendCreated<T>(response: Response, data: T): void {
  response.status(201).json({ ok: true, data } satisfies ApiSuccess<T>);
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/cookies/cookie-parser.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/cookies/cookie-parser.ts</span>
  </div>

```ts
export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};

  return Object.fromEntries(
    header.split(";").map((part) => {
      const [name, ...value] = part.trim().split("=");
      return [name, decodeURIComponent(value.join("="))];
    }).filter(([name]) => Boolean(name))
  );
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/cookies/session-cookie.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/cookies/session-cookie.ts</span>
  </div>

```ts
import { config } from "../../config/env.js";

function serializeCookie(name: string, value: string, options: Record<string, string | number | boolean>): string {
  const attributes = Object.entries(options).flatMap(([key, optionValue]) => {
    if (optionValue === false) return [];
    if (optionValue === true) return [key];
    return [`${key}=${optionValue}`];
  });

  return [`${name}=${encodeURIComponent(value)}`, ...attributes].join("; ");
}

export function serializeSessionCookie(sessionToken: string): string {
  return serializeCookie(config.SESSION_COOKIE_NAME, sessionToken, {
    HttpOnly: true,
    Secure: config.COOKIE_SECURE,
    SameSite: "Lax",
    Path: "/",
    "Max-Age": config.SESSION_TTL_SECONDS
  });
}

export function serializeCsrfCookie(csrfToken: string): string {
  return serializeCookie(config.CSRF_COOKIE_NAME, csrfToken, {
    Secure: config.COOKIE_SECURE,
    SameSite: "Lax",
    Path: "/",
    "Max-Age": config.SESSION_TTL_SECONDS
  });
}

export function clearSessionCookies(): string[] {
  return [
    serializeCookie(config.SESSION_COOKIE_NAME, "", { HttpOnly: true, Path: "/", "Max-Age": 0 }),
    serializeCookie(config.CSRF_COOKIE_NAME, "", { Path: "/", "Max-Age": 0 })
  ];
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/auth/session-token.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/auth/session-token.ts</span>
  </div>

```ts
import { createHash, randomBytes } from "node:crypto";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken).digest("hex");
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/auth/password-hashing.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/auth/password-hashing.ts</span>
  </div>

```ts
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, keyLength) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [salt, storedKey] = passwordHash.split(":");
  if (!salt || !storedKey) return false;
  const derivedKey = await scrypt(password, salt, keyLength) as Buffer;
  const storedBuffer = Buffer.from(storedKey, "hex");
  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/auth/auth-context.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/auth/auth-context.ts</span>
  </div>

```ts
import type { Request } from "express";
import { HttpError } from "../errors/http-error.js";

export interface AuthContext {
  userId: string;
  sessionId: string;
  role: "USER" | "ADMIN";
  csrfTokenHash?: string | null;
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

export function setAuthContext(request: Request, auth: AuthContext): void {
  (request as AuthenticatedRequest).auth = auth;
}

export function getAuthContext(request: Request): AuthContext {
  const auth = (request as Partial<AuthenticatedRequest>).auth;
  if (!auth) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");
  return auth;
}
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/auth/csrf.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/auth/csrf.ts</span>
  </div>

```ts
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { getAuthContext } from "./auth-context.js";
import { HttpError } from "../errors/http-error.js";

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCsrfToken(csrfToken: string): string {
  return createHash("sha256").update(csrfToken).digest("hex");
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export const requireCsrfToken: RequestHandler = (request, _response, next) => {
  const auth = getAuthContext(request);
  const csrfToken = request.get("x-csrf-token");

  if (!csrfToken || !auth.csrfTokenHash) {
    next(new HttpError(403, "CSRF_REQUIRED", "A CSRF token is required."));
    return;
  }

  if (!safeEqualHex(hashCsrfToken(csrfToken), auth.csrfTokenHash)) {
    next(new HttpError(403, "CSRF_INVALID", "The CSRF token is invalid."));
    return;
  }

  next();
};
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/auth/authorize-owner.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/auth/authorize-owner.ts</span>
  </div>

```ts
import { HttpError } from "../errors/http-error.js";
import type { AuthContext } from "./auth-context.js";

export function requireOwner(auth: AuthContext, ownerId: string): void {
  if (auth.role === "ADMIN") return;
  if (auth.userId !== ownerId) {
    throw new HttpError(403, "FORBIDDEN", "The authenticated user does not own this resource.");
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/auth/auth.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/auth/auth.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(128)
});

export const loginSchema = registerSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/auth/auth.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/auth/auth.types.ts</span>
  </div>

```ts
export interface PublicUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface AuthSessionResult {
  user: PublicUser;
  sessionToken: string;
  csrfToken: string;
  expiresAt: Date;
}

export interface SessionRequestMeta {
  userAgent?: string;
  ip?: string;
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/auth/auth.repository.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/auth/auth.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  createUser(email: string, passwordHash: string) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER"
      }
    });
  }

  createSession(input: {
    userId: string;
    tokenHash: string;
    csrfTokenHash: string;
    userAgent?: string;
    ipHash?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({ data: input });
  }

  findActiveSessionByHash(tokenHash: string, now: Date) {
    return prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now }
      },
      include: { user: true }
    });
  }

  updateCsrfToken(sessionId: string, csrfTokenHash: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { csrfTokenHash }
    });
  }

  revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/auth/auth.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/auth/auth.service.ts</span>
  </div>

```ts
import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { createCsrfToken, hashCsrfToken } from "../../shared/auth/csrf.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashSessionToken } from "../../shared/auth/session-token.js";
import type { AuthContext } from "../../shared/auth/auth-context.js";
import { AuthRepository } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import type { AuthSessionResult, PublicUser, SessionRequestMeta } from "./auth.types.js";

function toPublicUser(user: { id: string; email: string; role: "USER" | "ADMIN"; createdAt: Date }): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  };
}

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {}

  async register(input: RegisterInput, meta: SessionRequestMeta): Promise<AuthSessionResult> {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) throw new HttpError(409, "EMAIL_ALREADY_REGISTERED", "Email is already registered.");

    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.createUser(input.email, passwordHash);
    return this.createSessionForUser(user, meta);
  }

  async login(input: LoginInput, meta: SessionRequestMeta): Promise<AuthSessionResult> {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user || !await verifyPassword(input.password, user.passwordHash)) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    return this.createSessionForUser(user, meta);
  }

  async me(auth: AuthContext): Promise<PublicUser> {
    const user = await this.repository.findUserById(auth.userId);
    if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User was not found.");
    return toPublicUser(user);
  }

  async rotateCsrf(auth: AuthContext): Promise<{ csrfToken: string }> {
    const csrfToken = createCsrfToken();
    await this.repository.updateCsrfToken(auth.sessionId, hashCsrfToken(csrfToken));
    return { csrfToken };
  }

  async logout(auth: AuthContext): Promise<{ loggedOut: true }> {
    await this.repository.revokeSession(auth.sessionId);
    return { loggedOut: true };
  }

  private async createSessionForUser(
    user: { id: string; email: string; role: "USER" | "ADMIN"; createdAt: Date },
    meta: SessionRequestMeta
  ): Promise<AuthSessionResult> {
    const sessionToken = createSessionToken();
    const csrfToken = createCsrfToken();
    const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000);

    await this.repository.createSession({
      userId: user.id,
      tokenHash: hashSessionToken(sessionToken),
      csrfTokenHash: hashCsrfToken(csrfToken),
      userAgent: meta.userAgent,
      ipHash: meta.ip ? hashSessionToken(meta.ip) : undefined,
      expiresAt
    });

    return {
      user: toPublicUser(user),
      sessionToken,
      csrfToken,
      expiresAt
    };
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/auth/auth.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/auth/auth.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { clearSessionCookies, serializeCsrfCookie, serializeSessionCookie } from "../../shared/cookies/session-cookie.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

function setSessionCookies(response: Response, result: { sessionToken: string; csrfToken: string }): void {
  response.setHeader("Set-Cookie", [
    serializeSessionCookie(result.sessionToken),
    serializeCsrfCookie(result.csrfToken)
  ]);
}

export async function register(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.register(request.body, {
      userAgent: request.get("user-agent"),
      ip: request.ip
    });
    setSessionCookies(response, result);
    sendCreated(response, { user: result.user, csrfToken: result.csrfToken });
  } catch (error) {
    next(error);
  }
}

export async function login(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.login(request.body, {
      userAgent: request.get("user-agent"),
      ip: request.ip
    });
    setSessionCookies(response, result);
    sendOk(response, { user: result.user, csrfToken: result.csrfToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.logout(getAuthContext(request));
    response.setHeader("Set-Cookie", clearSessionCookies());
    sendOk(response, result);
  } catch (error) {
    next(error);
  }
}

export async function me(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { user: await service.me(getAuthContext(request)) });
  } catch (error) {
    next(error);
  }
}

export async function csrf(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const result = await service.rotateCsrf(getAuthContext(request));
    response.setHeader("Set-Cookie", serializeCsrfCookie(result.csrfToken));
    sendOk(response, result);
  } catch (error) {
    next(error);
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/auth/auth.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/auth/auth.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { authenticateSession } from "../../shared/auth/authenticate-session.js";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: registerSchema }), controller.register);
authRoutes.post("/login", validateRequest({ body: loginSchema }), controller.login);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, controller.logout);
authRoutes.get("/me", authenticateSession, controller.me);
authRoutes.get("/csrf", authenticateSession, controller.csrf);
```
</div>
#### `mini-projects/deployable-notes-api/src/shared/auth/authenticate-session.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/shared/auth/authenticate-session.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { config } from "../../config/env.js";
import { AuthRepository } from "../../modules/auth/auth.repository.js";
import { parseCookies } from "../cookies/cookie-parser.js";
import { HttpError } from "../errors/http-error.js";
import { setAuthContext } from "./auth-context.js";
import { hashSessionToken } from "./session-token.js";

const repository = new AuthRepository();

export const authenticateSession: RequestHandler = async (request, _response, next) => {
  try {
    const cookies = parseCookies(request.get("cookie"));
    const sessionToken = cookies[config.SESSION_COOKIE_NAME];
    if (!sessionToken) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");

    const session = await repository.findActiveSessionByHash(hashSessionToken(sessionToken), new Date());
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Authentication is required.");

    setAuthContext(request, {
      userId: session.userId,
      sessionId: session.id,
      role: session.user.role,
      csrfTokenHash: session.csrfTokenHash
    });

    next();
  } catch (error) {
    next(error);
  }
};
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/users/users.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/users/users.types.ts</span>
  </div>

```ts
export interface UserSummary {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/users/users.repository.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/users/users.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";

export class UsersRepository {
  findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNotebookSchema = z.object({
  name: z.string().min(1).max(120)
});

export const updateNotebookSchema = createNotebookSchema;

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>;
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.types.ts</span>
  </div>

```ts
export interface NotebookDto {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.repository.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";

export class NotebooksRepository {
  list(ownerId: string) {
    return prisma.notebook.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" }
    });
  }

  findOwned(ownerId: string, notebookId: string) {
    return prisma.notebook.findFirst({
      where: { id: notebookId, ownerId }
    });
  }

  create(ownerId: string, name: string) {
    return prisma.notebook.create({
      data: { ownerId, name }
    });
  }

  update(ownerId: string, notebookId: string, name: string) {
    return prisma.notebook.update({
      where: { id: notebookId, ownerId },
      data: { name }
    });
  }

  remove(ownerId: string, notebookId: string) {
    return prisma.notebook.delete({
      where: { id: notebookId, ownerId }
    });
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.service.ts</span>
  </div>

```ts
import { HttpError } from "../../shared/errors/http-error.js";
import { NotebooksRepository } from "./notebooks.repository.js";
import type { CreateNotebookInput, UpdateNotebookInput } from "./notebooks.schema.js";
import type { NotebookDto } from "./notebooks.types.js";

function toNotebookDto(notebook: { id: string; ownerId: string; name: string; createdAt: Date; updatedAt: Date }): NotebookDto {
  return {
    id: notebook.id,
    ownerId: notebook.ownerId,
    name: notebook.name,
    createdAt: notebook.createdAt.toISOString(),
    updatedAt: notebook.updatedAt.toISOString()
  };
}

export class NotebooksService {
  constructor(private readonly repository = new NotebooksRepository()) {}

  async list(ownerId: string): Promise<NotebookDto[]> {
    return (await this.repository.list(ownerId)).map(toNotebookDto);
  }

  async get(ownerId: string, notebookId: string): Promise<NotebookDto> {
    const notebook = await this.repository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return toNotebookDto(notebook);
  }

  async create(ownerId: string, input: CreateNotebookInput): Promise<NotebookDto> {
    return toNotebookDto(await this.repository.create(ownerId, input.name));
  }

  async update(ownerId: string, notebookId: string, input: UpdateNotebookInput): Promise<NotebookDto> {
    return toNotebookDto(await this.repository.update(ownerId, notebookId, input.name));
  }

  async remove(ownerId: string, notebookId: string): Promise<{ deleted: true }> {
    await this.repository.remove(ownerId, notebookId);
    return { deleted: true };
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { NotebooksService } from "./notebooks.service.js";

const service = new NotebooksService();

function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export async function list(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebooks: await service.list(getAuthContext(request).userId) });
  } catch (error) {
    next(error);
  }
}

export async function create(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendCreated(response, { notebook: await service.create(getAuthContext(request).userId, request.body) });
  } catch (error) {
    next(error);
  }
}

export async function get(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebook: await service.get(getAuthContext(request).userId, routeParam(request, "notebookId")) });
  } catch (error) {
    next(error);
  }
}

export async function update(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { notebook: await service.update(getAuthContext(request).userId, routeParam(request, "notebookId"), request.body) });
  } catch (error) {
    next(error);
  }
}

export async function remove(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await service.remove(getAuthContext(request).userId, routeParam(request, "notebookId")));
  } catch (error) {
    next(error);
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notebooks/notebooks.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./notebooks.controller.js";
import { createNotebookSchema, notebookParamsSchema, updateNotebookSchema } from "./notebooks.schema.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", controller.list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookSchema }), controller.create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), controller.get);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookSchema }), controller.update);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), controller.remove);
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notes/notes.schema.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notes/notes.schema.ts</span>
  </div>

```ts
import { z } from "zod";

const noteStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNoteSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().max(20000).default(""),
  status: noteStatusSchema.default("ACTIVE")
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  body: z.string().max(20000).optional(),
  status: noteStatusSchema.optional()
}).refine((input) => Object.keys(input).length > 0, {
  message: "At least one note field is required."
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notes/notes.types.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notes/notes.types.ts</span>
  </div>

```ts
export type NoteStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface NoteDto {
  id: string;
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notes/notes.repository.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notes/notes.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";

export class NotesRepository {
  async listForNotebook(ownerId: string, notebookId: string) {
    return prisma.note.findMany({
      where: { ownerId, notebookId },
      orderBy: { updatedAt: "desc" }
    });
  }

  async findOwned(ownerId: string, noteId: string) {
    return prisma.note.findFirst({
      where: { id: noteId, ownerId }
    });
  }

  async create(ownerId: string, notebookId: string, input: CreateNoteInput) {
    return prisma.note.create({
      data: {
        ownerId,
        notebookId,
        title: input.title,
        body: input.body,
        status: input.status
      }
    });
  }

  async update(ownerId: string, noteId: string, input: UpdateNoteInput) {
    return prisma.note.update({
      where: { id: noteId, ownerId },
      data: input
    });
  }

  async remove(ownerId: string, noteId: string) {
    return prisma.note.delete({
      where: { id: noteId, ownerId }
    });
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notes/notes.service.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notes/notes.service.ts</span>
  </div>

```ts
import { HttpError } from "../../shared/errors/http-error.js";
import { NotebooksRepository } from "../notebooks/notebooks.repository.js";
import { NotesRepository } from "./notes.repository.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.schema.js";
import type { NoteDto } from "./notes.types.js";

function toNoteDto(note: {
  id: string;
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}): NoteDto {
  return {
    id: note.id,
    ownerId: note.ownerId,
    notebookId: note.notebookId,
    title: note.title,
    body: note.body,
    status: note.status,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  };
}

export class NotesService {
  constructor(
    private readonly notesRepository = new NotesRepository(),
    private readonly notebooksRepository = new NotebooksRepository()
  ) {}

  async listForNotebook(ownerId: string, notebookId: string): Promise<NoteDto[]> {
    const notebook = await this.notebooksRepository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return (await this.notesRepository.listForNotebook(ownerId, notebookId)).map(toNoteDto);
  }

  async create(ownerId: string, notebookId: string, input: CreateNoteInput): Promise<NoteDto> {
    const notebook = await this.notebooksRepository.findOwned(ownerId, notebookId);
    if (!notebook) throw new HttpError(404, "NOTEBOOK_NOT_FOUND", "Notebook was not found.");
    return toNoteDto(await this.notesRepository.create(ownerId, notebookId, input));
  }

  async get(ownerId: string, noteId: string): Promise<NoteDto> {
    const note = await this.notesRepository.findOwned(ownerId, noteId);
    if (!note) throw new HttpError(404, "NOTE_NOT_FOUND", "Note was not found.");
    return toNoteDto(note);
  }

  async update(ownerId: string, noteId: string, input: UpdateNoteInput): Promise<NoteDto> {
    return toNoteDto(await this.notesRepository.update(ownerId, noteId, input));
  }

  async remove(ownerId: string, noteId: string): Promise<{ deleted: true }> {
    await this.notesRepository.remove(ownerId, noteId);
    return { deleted: true };
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notes/notes.controller.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notes/notes.controller.ts</span>
  </div>

```ts
import type { NextFunction, Request, Response } from "express";
import { getAuthContext } from "../../shared/auth/auth-context.js";
import { sendCreated, sendOk } from "../../shared/responses/send-response.js";
import { NotesService } from "./notes.service.js";

const service = new NotesService();

function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export async function listForNotebook(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, {
      notes: await service.listForNotebook(getAuthContext(request).userId, routeParam(request, "notebookId"))
    });
  } catch (error) {
    next(error);
  }
}

export async function create(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendCreated(response, {
      note: await service.create(getAuthContext(request).userId, routeParam(request, "notebookId"), request.body)
    });
  } catch (error) {
    next(error);
  }
}

export async function get(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { note: await service.get(getAuthContext(request).userId, routeParam(request, "noteId")) });
  } catch (error) {
    next(error);
  }
}

export async function update(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, { note: await service.update(getAuthContext(request).userId, routeParam(request, "noteId"), request.body) });
  } catch (error) {
    next(error);
  }
}

export async function remove(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    sendOk(response, await service.remove(getAuthContext(request).userId, routeParam(request, "noteId")));
  } catch (error) {
    next(error);
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notes/notebook-notes.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notes/notebook-notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./notes.controller.js";
import { createNoteSchema, notebookNoteParamsSchema } from "./notes.schema.js";

export const notebookNotesRoutes = Router({ mergeParams: true });

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema }), controller.listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteSchema }), controller.create);
```
</div>
#### `mini-projects/deployable-notes-api/src/modules/notes/notes.routes.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/modules/notes/notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import * as controller from "./notes.controller.js";
import { noteParamsSchema, updateNoteSchema } from "./notes.schema.js";

export const notesRoutes = Router();

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), controller.get);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteSchema }), controller.update);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), controller.remove);
```
</div>
#### `mini-projects/deployable-notes-api/src/app.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/app.ts</span>
  </div>

```ts
import express, { type Express } from "express";
import type { AppConfig } from "./config/env.js";
import { config } from "./config/env.js";
import { createProductionRuntimePolicy } from "./config/production.js";
import { healthRoutes } from "./health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notebookNotesRoutes } from "./modules/notes/notebook-notes.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { metricsRoutes } from "./observability/metrics.routes.js";
import { errorLogger } from "./observability/error-logger.js";
import { requestLogger } from "./observability/request-logger.js";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { notFound } from "./shared/middleware/not-found.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";

export function createApp(appConfig: AppConfig = config): Express {
  const runtimePolicy = createProductionRuntimePolicy(appConfig);
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", runtimePolicy.trustProxy);
  app.use(requestId);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(apiRateLimit);
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  app.use("/health", healthRoutes);
  app.use("/metrics", metricsRoutes);
  app.use("/auth", authRoutes);
  app.use("/notebooks/:notebookId/notes", authenticateSession, notebookNotesRoutes);
  app.use("/notebooks", authenticateSession, notebookRoutes);
  app.use("/notes", authenticateSession, notesRoutes);

  app.use(notFound);
  app.use(errorLogger);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
```
</div>
#### `mini-projects/deployable-notes-api/src/server.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/src/server.ts</span>
  </div>

```ts
import { createServer, type Server } from "node:http";
import { pathToFileURL } from "node:url";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedisClient } from "./redis/redis-client.js";
import { createApp } from "./app.js";
import { logger } from "./observability/logger.js";

export interface ShutdownResource {
  name: string;
  close: () => Promise<void> | void;
}

export interface GracefulShutdownOptions {
  server: Server;
  timeoutMs: number;
  resources: ShutdownResource[];
}

async function closeHttpServer(server: Server, timeoutMs: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.closeAllConnections();
      resolve();
    }, timeoutMs);
    timeout.unref();

    server.close((error) => {
      clearTimeout(timeout);
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function createGracefulShutdown(options: GracefulShutdownOptions): (signal: NodeJS.Signals) => Promise<void> {
  let shuttingDown = false;

  return async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "shutdown signal received");
    await closeHttpServer(options.server, options.timeoutMs);

    for (const resource of options.resources) {
      try {
        await resource.close();
        logger.info({ resource: resource.name }, "shutdown resource closed");
      } catch (error) {
        logger.error({ resource: resource.name, error }, "shutdown resource close failed");
      }
    }
  };
}

export async function startServer(): Promise<Server> {
  const server = createServer(createApp(config));
  const shutdown = createGracefulShutdown({
    server,
    timeoutMs: config.SHUTDOWN_TIMEOUT_MS,
    resources: [
      { name: "redis", close: closeRedisClient },
      { name: "prisma", close: disconnectPrisma }
    ]
  });

  server.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, "HTTP server started");
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void shutdown(signal).then(() => {
        process.exitCode = 0;
      });
    });
  }

  return server;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  void startServer().catch((error) => {
    logger.error({ error }, "server startup failed");
    process.exitCode = 1;
  });
}
```
</div>
#### `mini-projects/deployable-notes-api/scripts/smoke-test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/scripts/smoke-test.ts</span>
  </div>

```ts
import { pathToFileURL } from "node:url";

export interface SmokeTarget {
  name: "live" | "ready";
  url: string;
}

export interface SmokeResult {
  name: string;
  status: number;
  ok: boolean;
}

export function createSmokeTargets(baseUrl: string): SmokeTarget[] {
  const normalized = baseUrl.replace(/\/$/, "");
  return [
    { name: "live", url: `${normalized}/health/live` },
    { name: "ready", url: `${normalized}/health/ready` }
  ];
}

export function evaluateSmokeResults(results: SmokeResult[]): boolean {
  return results.every((result) => result.ok && result.status === 200);
}

export async function runSmokeTest(baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3020"): Promise<SmokeResult[]> {
  const results: SmokeResult[] = [];

  for (const target of createSmokeTargets(baseUrl)) {
    const response = await fetch(target.url);
    results.push({
      name: target.name,
      status: response.status,
      ok: response.ok
    });
  }

  if (!evaluateSmokeResults(results)) {
    throw new Error(`Smoke test failed: ${JSON.stringify(results)}`);
  }

  return results;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  runSmokeTest()
    .then((results) => {
      console.log(JSON.stringify({ ok: true, results }));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```
</div>
#### `mini-projects/deployable-notes-api/scripts/wait-for-ready.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/scripts/wait-for-ready.ts</span>
  </div>

```ts
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

export async function waitForReady(baseUrl: string, attempts = 30, intervalMs = 1000): Promise<void> {
  const url = `${baseUrl.replace(/\/$/, "")}/health/ready`;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await delay(intervalMs);
      continue;
    }

    await delay(intervalMs);
  }

  throw new Error(`Service did not become ready at ${url}`);
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  waitForReady(process.env.SMOKE_BASE_URL ?? "http://localhost:3020")
    .then(() => console.log("ready"))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```
</div>
#### `mini-projects/deployable-notes-api/scripts/validate-release.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/scripts/validate-release.ts</span>
  </div>

```ts
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export interface PackageScripts {
  scripts?: Record<string, string>;
}

export function validatePackageScripts(packageJson: PackageScripts): string[] {
  const scripts = packageJson.scripts ?? {};
  const issues: string[] = [];

  for (const scriptName of ["build", "start", "typecheck", "test", "prisma:generate", "prisma:migrate:deploy", "smoke"]) {
    if (!scripts[scriptName]) issues.push(`Missing script: ${scriptName}`);
  }

  if (/\bwatch\b|\btsx\s+watch\b|\bnodemon\b/.test(scripts.start ?? "")) {
    issues.push("The start script must run built JavaScript without a watcher.");
  }

  return issues;
}

export function validateReleaseArtifact(): string[] {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as PackageScripts;
  const issues = validatePackageScripts(packageJson);

  if (!existsSync(new URL("../dist/src/server.js", import.meta.url))) {
    issues.push("Missing runtime artifact: dist/src/server.js");
  }

  return issues;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  const issues = validateReleaseArtifact();
  if (issues.length > 0) {
    console.error(JSON.stringify({ ok: false, issues }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ ok: true }));
  }
}
```
</div>
#### `mini-projects/deployable-notes-api/tests/helpers/database.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tests/helpers/database.ts</span>
  </div>

```ts
import { connect } from "node:net";

export async function canReachTcpPort(host: string, port: number, timeoutMs = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.once("connect", () => {
      clearTimeout(timer);
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

export function databaseUrlForTests(): string {
  return process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/deployable_notes_api";
}
```
</div>
#### `mini-projects/deployable-notes-api/tests/helpers/redis.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tests/helpers/redis.ts</span>
  </div>

```ts
import { canReachTcpPort } from "./database.js";

export async function canReachRedis(): Promise<boolean> {
  return canReachTcpPort("127.0.0.1", 6379);
}
```
</div>
#### `mini-projects/deployable-notes-api/tests/env.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tests/env.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { loadEnv } from "../src/config/env.js";

test("loadEnv parses boolean and numeric deployment configuration", () => {
  const config = loadEnv({
    NODE_ENV: "test",
    PORT: "4999",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/deployable_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "test-session-secret-with-32-characters",
    ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",
    TRUST_PROXY: "true",
    COOKIE_SECURE: "false"
  });

  assert.equal(config.PORT, 4999);
  assert.equal(config.TRUST_PROXY, true);
  assert.equal(config.COOKIE_SECURE, false);
  assert.deepEqual(config.ALLOWED_ORIGINS, ["http://localhost:3000", "http://127.0.0.1:3000"]);
});

test("loadEnv rejects the development secret in production", () => {
  assert.throws(() => loadEnv({
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/deployable_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "development-session-secret-change-me-32"
  }), /SESSION_SECRET/);
});
```
</div>
#### `mini-projects/deployable-notes-api/tests/proxy-config.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tests/proxy-config.unit.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";

test("createApp applies trust proxy from runtime configuration", () => {
  const app = createApp(loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/deployable_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "test-session-secret-with-32-characters",
    TRUST_PROXY: "true"
  }));

  assert.equal(app.get("trust proxy"), true);
});
```
</div>
#### `mini-projects/deployable-notes-api/tests/health.integration.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tests/health.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

test("GET /health/live does not require PostgreSQL or Redis", async () => {
  const response = await request(createApp()).get("/health/live").expect(200);

  assert.equal(response.body.ok, true);
  assert.equal(response.body.data.status, "live");
  assert.equal(typeof response.body.data.uptimeSeconds, "number");
});

test("GET /health/ready reports dependency state", async () => {
  const response = await request(createApp()).get("/health/ready");

  assert.ok([200, 503].includes(response.status));
  assert.ok(["ready", "not_ready"].includes(response.body.data.status));
  assert.ok(["ready", "unavailable"].includes(response.body.data.dependencies.postgres));
  assert.ok(["ready", "unavailable"].includes(response.body.data.dependencies.redis));
});
```
</div>
#### `mini-projects/deployable-notes-api/tests/smoke.integration.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tests/smoke.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { createSmokeTargets, evaluateSmokeResults } from "../scripts/smoke-test.js";

test("createSmokeTargets checks live and ready endpoints", () => {
  assert.deepEqual(createSmokeTargets("http://localhost:3020"), [
    { name: "live", url: "http://localhost:3020/health/live" },
    { name: "ready", url: "http://localhost:3020/health/ready" }
  ]);
});

test("evaluateSmokeResults requires successful live and ready responses", () => {
  assert.equal(evaluateSmokeResults([
    { name: "live", status: 200, ok: true },
    { name: "ready", status: 200, ok: true }
  ]), true);

  assert.equal(evaluateSmokeResults([
    { name: "live", status: 200, ok: true },
    { name: "ready", status: 503, ok: false }
  ]), false);
});
```
</div>
#### `mini-projects/deployable-notes-api/tests/shutdown.unit.test.ts`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/tests/shutdown.unit.test.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createGracefulShutdown } from "../src/server.js";

test("createGracefulShutdown closes the HTTP server and resources", async () => {
  const server = createServer((_request, response) => {
    response.end("ok");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  let resourceClosed = false;
  const shutdown = createGracefulShutdown({
    server,
    timeoutMs: 1000,
    resources: [
      {
        name: "test-resource",
        close: () => {
          resourceClosed = true;
        }
      }
    ]
  });

  await shutdown("SIGTERM");
  assert.equal(resourceClosed, true);
  assert.equal(server.listening, false);
});
```
</div>
#### `mini-projects/deployable-notes-api/openapi/openapi.yaml`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/openapi/openapi.yaml</span>
  </div>

```txt
openapi: 3.1.0
info:
  title: deployable-notes-api
  version: 1.0.0
paths:
  /auth/register:
    post:
      summary: Register a user and create a session.
      responses:
        "201":
          description: Registered
  /auth/login:
    post:
      summary: Create a session.
      responses:
        "200":
          description: Logged in
  /auth/logout:
    post:
      summary: Revoke the current session.
      responses:
        "200":
          description: Logged out
  /auth/me:
    get:
      summary: Read the current authenticated user.
      responses:
        "200":
          description: Current user
  /auth/csrf:
    get:
      summary: Rotate the CSRF token for the current session.
      responses:
        "200":
          description: CSRF token
  /notebooks:
    get:
      summary: List notebooks.
      responses:
        "200":
          description: Notebook list
    post:
      summary: Create a notebook.
      responses:
        "201":
          description: Created notebook
  /notebooks/{notebookId}:
    get:
      summary: Get a notebook.
      parameters:
        - name: notebookId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Notebook
    patch:
      summary: Update a notebook.
      responses:
        "200":
          description: Updated notebook
    delete:
      summary: Delete a notebook.
      responses:
        "200":
          description: Deleted notebook
  /notebooks/{notebookId}/notes:
    get:
      summary: List notes in a notebook.
      responses:
        "200":
          description: Note list
    post:
      summary: Create a note in a notebook.
      responses:
        "201":
          description: Created note
  /notes/{noteId}:
    get:
      summary: Get a note.
      responses:
        "200":
          description: Note
    patch:
      summary: Update a note.
      responses:
        "200":
          description: Updated note
    delete:
      summary: Delete a note.
      responses:
        "200":
          description: Deleted note
  /health/live:
    get:
      summary: Liveness endpoint.
      responses:
        "200":
          description: Live
  /health/ready:
    get:
      summary: Readiness endpoint.
      responses:
        "200":
          description: Ready
        "503":
          description: Not ready
  /metrics:
    get:
      summary: Prometheus metrics endpoint.
      responses:
        "200":
          description: Metrics
```
</div>
#### `mini-projects/deployable-notes-api/README.md`

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/deployable-notes-api/README.md</span>
  </div>

````txt
# deployable-notes-api

This mini project demonstrates a production-oriented TypeScript Node.js API boundary: emitted JavaScript, reproducible installs, Docker image creation, Docker Compose simulation, Prisma migration deployment, NGINX reverse proxying, proxy trust, secure cookies, health checks, smoke tests, and graceful shutdown.

## Local development

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run typecheck
npm test
npm run build
npm run dev
```

macOS/Linux:

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run typecheck
npm test
npm run build
npm run dev
```

## Local production simulation

Windows PowerShell:

```powershell
docker compose up --build -d
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
docker compose down
```

macOS/Linux:

```bash
docker compose up --build -d
SMOKE_BASE_URL=http://localhost:8080 npm run smoke
docker compose down
```

## Prisma migration deploy

Use `npm run prisma:migrate:deploy` when a PostgreSQL database is reachable and migration files are committed under `prisma/migrations`. Do not use `prisma migrate dev` as the production deploy command.

## Health and smoke checks

`GET /health/live` only proves that the Node process can answer HTTP. `GET /health/ready` checks PostgreSQL and Redis. `npm run smoke` requires both endpoints to return successful responses.

## Reverse proxy boundary

`nginx/nginx.conf` forwards traffic to the API service, preserves `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto`, supports WebSocket upgrade headers for future routes, and disables buffering for long-lived streaming boundaries.

## Limitations

This project is a local learning artifact. It does not include cloud deployment, registry publishing, production TLS automation, autoscaling, Kubernetes manifests, Terraform files, frontend UI, or incident response automation.
````
</div>

### 14.4 运行与测试

Windows PowerShell:

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```txt
Set-Location D:\node.js\mini-projects\deployable-notes-api
Copy-Item .env.example .env
npm install
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/deployable_notes_api"
npm run prisma:generate
npm run typecheck
npm test
npm run build
npm run start
```
</div>

macOS/Linux:

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```bash
cd mini-projects/deployable-notes-api
cp .env.example .env
npm install
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deployable_notes_api npm run prisma:generate
npm run typecheck
npm test
npm run build
npm run start
```
</div>

Docker Compose:

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```txt
docker compose config
docker build -t deployable-notes-api:chapter-11 .
docker compose up --build -d
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
docker compose down
```
</div>

### 14.5 执行与生命周期

启动时，`server.ts` 先读取经 Zod 验证的 config，创建 Express app，再把 app 交给 Node HTTP server。请求进入 NGINX 后携带 forwarded headers 到 Express；Express 根据 `trust proxy` 判断是否接受这些 headers。业务请求经过 session、CSRF、validation、controller、service、repository，数据库由 Prisma adapter 持有连接，Redis 在 readiness 或业务需要时连接。`SIGTERM` 到来后，shutdown handler 停止接收新 HTTP 连接，超时后关闭已有连接，并依次关闭 Redis 与 Prisma。

### 14.6 常见错误

- `start` 使用 watcher：违反 production runtime artifact boundary。
- `.env` 被复制到镜像：违反 secret boundary 和 Docker context boundary。
- `prisma migrate dev` 用于发布：违反 production migration command boundary。
- `trust proxy` 随意打开：违反 forwarded header trust boundary。
- ready 不检查 Redis/PostgreSQL：违反 readiness semantic boundary。
- 只回滚镜像不评估 migration：违反 rollback data boundary。

## 15. 知识迁移与真实项目场景

真实项目中，这套机制可以迁移到 Express、Fastify、NestJS 或更复杂的后端，但迁移对象是边界模型，不是文件名。你仍然要重新验证：平台如何传入 env、反向代理是否终止 TLS、headers 是否可信、数据库迁移如何审批、容器如何发送 `SIGTERM`、日志如何采集 stdout/stderr、CI 是否真的运行了同等 gates。

## 16. 本章复盘任务

1. 解释为什么 `npm ci` 比 `npm install` 更适合作为 CI install gate。
2. 画出从 `src/server.ts` 到 `dist/src/server.js` 到 Docker image 到 Node process 的 artifact chain。
3. 对比 `/health/live` 与 `/health/ready` 的失败含义。
4. 解释 `trust proxy` 错误时 secure cookie、`req.ip`、`req.protocol` 如何出错。
5. 给一个 destructive migration 写 release 和 rollback reasoning。
6. 说明 `SIGTERM` 后为什么不能立刻 `process.exit()`。

## 17. 最终心智模型

Node.js 生产部署的核心模型是：源码不是运行时，build output 不是完整发布，Docker image 不是 secret store，Compose 不是云平台，readiness 不是 liveness，proxy headers 不是天然可信，迁移不是普通代码回滚，CI 没运行的 gate 不能算证据。可靠发布来自每个边界都有明确输入、负责层、输出 artifact、运行状态、失败信号和清理动作。

## 18. 官方资料

- [https://nodejs.org/api/process.html](https://nodejs.org/api/process.html)
- [https://nodejs.org/api/http.html](https://nodejs.org/api/http.html)
- [https://nodejs.org/api/test.html](https://nodejs.org/api/test.html)
- [https://nodejs.org/api/assert.html](https://nodejs.org/api/assert.html)
- [https://nodejs.org/api/environment_variables.html](https://nodejs.org/api/environment_variables.html)
- [https://nodejs.org/api/cli.html](https://nodejs.org/api/cli.html)
- [https://docs.npmjs.com/cli/v11/configuring-npm/package-json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)
- [https://docs.npmjs.com/cli/v11/commands/npm-ci](https://docs.npmjs.com/cli/v11/commands/npm-ci)
- [https://docs.npmjs.com/cli/v11/commands/npm-install](https://docs.npmjs.com/cli/v11/commands/npm-install)
- [https://docs.npmjs.com/cli/v11/commands/npm-run](https://docs.npmjs.com/cli/v11/commands/npm-run)
- [https://docs.npmjs.com/cli/v11/commands/npm-prune](https://docs.npmjs.com/cli/v11/commands/npm-prune)
- [https://docs.npmjs.com/cli/v11/commands/npm-audit](https://docs.npmjs.com/cli/v11/commands/npm-audit)
- [https://docs.docker.com/reference/dockerfile/](https://docs.docker.com/reference/dockerfile/)
- [https://docs.docker.com/guides/nodejs/](https://docs.docker.com/guides/nodejs/)
- [https://docs.docker.com/build/cache/](https://docs.docker.com/build/cache/)
- [https://docs.docker.com/build/building/context/](https://docs.docker.com/build/building/context/)
- [https://docs.docker.com/compose/compose-file/](https://docs.docker.com/compose/compose-file/)
- [https://docs.docker.com/engine/logging/](https://docs.docker.com/engine/logging/)
- [https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs](https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs)
- [https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
- [https://github.com/actions/checkout](https://github.com/actions/checkout)
- [https://github.com/actions/setup-node](https://github.com/actions/setup-node)
- [https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
- [https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)
- [https://www.prisma.io/docs/orm/reference/prisma-cli-reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)
- [https://www.prisma.io/docs/orm/reference/prisma-config-reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
- [https://www.prisma.io/docs/orm/reference/error-reference](https://www.prisma.io/docs/orm/reference/error-reference)
- [https://expressjs.com/en/advanced/best-practice-performance.html](https://expressjs.com/en/advanced/best-practice-performance.html)
- [https://expressjs.com/en/guide/behind-proxies.html](https://expressjs.com/en/guide/behind-proxies.html)
- [https://expressjs.com/en/guide/error-handling.html](https://expressjs.com/en/guide/error-handling.html)
- [https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
- [https://nginx.org/en/docs/http/websocket.html](https://nginx.org/en/docs/http/websocket.html)
- [https://www.typescriptlang.org/tsconfig/](https://www.typescriptlang.org/tsconfig/)
- [https://www.typescriptlang.org/docs/handbook/modules/reference.html](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [https://zod.dev/](https://zod.dev/)
- [https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

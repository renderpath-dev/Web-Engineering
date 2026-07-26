# TypeScript Monorepo 工程化学习指导文件 v1

> 定位：这是 `typescript/monorepo-typescript/` 的学习指导文件，不是最终学习笔记。
> 目标：按照这份文件创建 monorepo 练习目录、写 `package.json` / `tsconfig.json` / `.ts` / `.md` 文件、运行 workspace 命令、执行 `tsc -b`，观察 workspace link、package boundary、project references、declaration output、package exports、task graph 和编辑器跨包跳转。
> 参考范围：TypeScript 官方 Project References、Modules Reference、TSConfig Reference，Node.js Packages 文档，npm / pnpm workspaces 官方文档，Turborepo TypeScript 官方指南。
> 语言规则：正文统一中文；必要技术术语保留 English term。
> 代码规则：代码命名、字符串和代码注释统一英文；代码块中不使用中文字符。
> 学习原则：先理解 monorepo 的包边界（package boundary）和 TypeScript 项目边界（TypeScript project boundary），再理解 workspace link、project references、package exports、declaration output、task cache、应用包和库包之间如何协作。不要把本专题学成“复制一个 monorepo 模板”。

---

## 目录

1. [0. 文件定位](#0-文件定位)
2. [1. 本章先解决什么问题](#1-本章先解决什么问题)
3. [2. 学习本章前必须补齐的前置概念](#2-学习本章前必须补齐的前置概念)
4. [3. 本章学习目标](#3-本章学习目标)
5. [4. 本章学习顺序](#4-本章学习顺序)
6. [5. 本章核心术语表](#5-本章核心术语表)
7. [6. 本章底层模型](#6-本章底层模型)
8. [7. 推荐目录结构](#7-推荐目录结构)
9. [8. 运行方式](#8-运行方式)
10. [9. 分节教学与训练内容](#9-分节教学与训练内容)
    - [01：Monorepo 到底解决什么问题](#01monorepo-到底解决什么问题)
    - [02：workspace link 和 package 边界](#02workspace-link-和-package-边界)
    - [03：根配置、包配置和 tsconfig 继承](#03根配置包配置和-tsconfig-继承)
    - [04：Project References 和 solution tsconfig](#04project-references-和-solution-tsconfig)
    - [05：composite、declaration 和 declarationMap](#05compositedeclaration-和-declarationmap)
    - [06：package exports、types 和 public API](#06package-exportstypes-和-public-api)
    - [07：workspace protocol 和内部依赖版本](#07workspace-protocol-和内部依赖版本)
    - [08：paths alias、subpath imports 和运行时解析](#08paths-aliassubpath-imports-和运行时解析)
    - [09：ESM / CJS / NodeNext 在 monorepo 里的边界](#09esm--cjs--nodenext-在-monorepo-里的边界)
    - [10：apps、packages、tooling 包的职责划分](#10appspackagestooling-包的职责划分)
    - [11：构建顺序、task graph 和缓存边界](#11构建顺序task-graph-和缓存边界)
    - [12：共享 tsconfig 包和配置包](#12共享-tsconfig-包和配置包)
    - [13：类型检查、测试和 lint 的 workspace 命令](#13类型检查测试和-lint-的-workspace-命令)
    - [14：编辑器、tsserver 和跨包跳转](#14编辑器tsserver-和跨包跳转)
    - [15：发布策略、private 包和版本边界](#15发布策略private-包和版本边界)
11. [10. 本章 API / 语法完整索引](#10-本章-api--语法完整索引)
12. [11. 本章常见错误总表](#11-本章常见错误总表)
13. [12. 最终小项目：Typed Commerce Monorepo](#12-最终小项目typed-commerce-monorepo)
14. [13. cheatsheet 使用方式](#13-cheatsheet-使用方式)
15. [14. 最终文件清单](#14-最终文件清单)
16. [15. 最终学习笔记转换要求](#15-最终学习笔记转换要求)
17. [16. 本章最终要能回答的问题](#16-本章最终要能回答的问题)
18. [17. 本章最终记忆模型](#17-本章最终记忆模型)
19. [18. 官方文档阅读清单](#18-官方文档阅读清单)
20. [19. 学习完成检查清单](#19-学习完成检查清单)


---

## 0. 文件定位

### 结论

`typescript/monorepo-typescript/` 训练的是 TypeScript 在多包工程里的边界管理能力。一个 monorepo 不是一个“更大的文件夹”，而是多个 package、多个 tsconfig、多个构建任务、多个运行时入口共同组成的工程系统。

### 技术意义

单包项目主要回答：

```txt
How does this project compile?
```

monorepo 必须同时回答：

```txt
Which package owns this code?
Which package is allowed to import this code?
Does the importer consume source, declarations, or built JavaScript?
Which task must run before another task?
Does TypeScript resolve the same entry that Node or the bundler resolves?
```

### 底层机制

```txt
package manager:
  discovers workspaces and links local packages

TypeScript:
  checks each project and emits declaration files

Node or bundler:
  resolves runtime imports through package.json metadata

task runner:
  schedules build, test, lint, and typecheck tasks

editor:
  runs tsserver and provides cross-package navigation
```

---

## 1. 本章先解决什么问题

### 结论

本章解决的是：当项目从一个 app 变成多个 app、多个 shared package、多个配置包以后，TypeScript、package manager、Node / bundler、CI、编辑器如何保持同一套边界。

### 技术意义

如果 monorepo 边界没有设计清楚，会出现这些问题：

```txt
TypeScript can compile but Node cannot run.
Editor can jump to source but package consumers get wrong declarations.
An app imports a library's internal source file.
A build command runs packages in the wrong order.
A package publishes files that were never intended to be public.
```

---

## 2. 学习本章前必须补齐的前置概念

| 前置概念 | 必须理解到什么程度 | 不懂会影响什么 |
|---|---|---|
| ES Module | 理解 `import` / `export` 和模块作用域 | 会混淆包入口、runtime import、type-only import |
| package.json | 理解 `name`、`type`、`exports`、`types`、`dependencies` | 会看不懂 package boundary |
| tsconfig.json | 理解 `compilerOptions`、`include`、`references`、`extends` | 会混淆 TypeScript project boundary |
| declaration file | 知道 `.d.ts` 是给消费者和编辑器看的类型表面 | 会误以为跨包只需要源码 |
| moduleResolution | 知道 TypeScript 如何解析 import specifier | 会混淆 TypeScript 解析和 Node 运行时解析 |
| Node ESM | 知道 `"type": "module"` 和 `.js` 扩展名会影响运行时 | 会写出能过类型检查但不能运行的 import |
| CI script | 知道脚本顺序会影响构建可信度 | 会让 app 在依赖包没构建时运行 |

---

## 3. 本章学习目标

```txt
1. Explain why a monorepo is not just a large folder.
2. Create a workspace-based TypeScript monorepo.
3. Distinguish package boundary and TypeScript project boundary.
4. Configure root package.json workspaces.
5. Configure pnpm-workspace.yaml.
6. Create package-level package.json files.
7. Share a base tsconfig without type-checking the whole repo twice.
8. Use tsc -b with project references.
9. Explain why composite requires declaration output.
10. Design package exports and types fields.
11. Avoid leaking internal source files as public API.
12. Explain why paths alias is not runtime resolution.
13. Use Node.js package imports for package-internal aliases when appropriate.
14. Split apps, packages, and tooling packages.
15. Run workspace scripts from the root.
16. Understand task graph and cache boundaries.
17. Debug common monorepo IDE errors.
18. Decide when project references help and when a task-runner-first setup is enough.
19. Build a small typed monorepo with shared contracts, UI package, app package, and generated declarations.
```

---

## 4. 本章学习顺序

```txt
monorepo problem model
  -> workspace link
  -> root config vs package config
  -> project references
  -> composite declaration output
  -> package exports and types
  -> workspace protocol
  -> paths vs runtime resolution
  -> NodeNext package boundary
  -> apps/packages/tooling split
  -> task graph and caching
  -> shared config package
  -> workspace commands
  -> editor and tsserver
  -> publish and version boundary
  -> final mini project
```

---

## 5. 本章核心术语表

| 中文术语 | English term | 所属层级 | 技术意义 | 容易混淆点 |
|---|---|---|---|---|
| 单体仓库 | monorepo | repository architecture | 一个 Git 仓库管理多个 package 或 app | 不是“所有代码放一个文件夹” |
| 工作区 | workspace | package manager | package manager 发现并链接多个本地 package | 不等于 TypeScript project references |
| 包 | package | package metadata | 有自己 `package.json` 的发布或内部消费单元 | 不等于一个 tsconfig |
| 应用包 | app package | runtime boundary | 最终运行或部署的应用，例如 web app | 通常不发布给 npm |
| 库包 | library package | public API boundary | 被其他包导入的代码单元 | 必须控制 `exports` 和 `.d.ts` |
| 工具包 | tooling package | shared config | 提供共享 tsconfig、eslint config、build config | 不应该混入业务代码 |
| 包边界 | package boundary | package metadata | 由 `package.json`、`exports`、`dependencies` 决定导入边界 | 不是物理目录边界 |
| TypeScript 项目边界 | TypeScript project boundary | type system / compiler | 由 `tsconfig.json` 决定一次类型检查或构建范围 | 不等于 package boundary |
| 项目引用 | project references | TypeScript build system | `references` 声明 TS 项目之间的构建依赖 | 不等于 package manager workspace |
| solution tsconfig | solution tsconfig | TypeScript build entry | 根入口 tsconfig 通常只包含 references | 不应该 include 全仓库源码 |
| 复合项目 | composite project | TypeScript build system | 开启 `composite` 后项目可被引用并参与 `tsc -b` | 需要输出声明或构建信息 |
| 声明文件 | declaration file | type output | `.d.ts` 描述 package 对外类型 | 不包含运行时实现 |
| 声明映射 | declaration map | editor navigation | `.d.ts.map` 帮助从声明跳回源码 | 不是 source map 的运行时调试用途 |
| 包导出表 | package exports | Node / bundler package resolution | `exports` 定义 package 支持的导入入口 | 不等于 TypeScript `paths` |
| 类型入口 | types entry | TypeScript package resolution | `types` 或 `exports.types` 指向声明入口 | 不会决定运行时执行文件 |
| workspace protocol | workspace protocol | package manager | `workspace:*` 等声明内部 workspace 依赖 | 发布时会被 package manager 转换 |
| 子路径导入 | subpath imports | Node package resolution | package 内部 `imports` 字段，通常使用 `#` 前缀 | 不等于 TS `paths` alias |
| 任务图 | task graph | build orchestration | 任务之间的依赖顺序图 | 不等于 TypeScript 类型依赖图 |

---

## 6. 本章底层模型

### 结论

TypeScript monorepo 的核心模型是四层边界叠在一起：

```txt
repository boundary:
  one Git repository

workspace boundary:
  package manager links local packages

package boundary:
  package.json defines dependency and public API surface

TypeScript project boundary:
  tsconfig defines type-checking and build unit
```

### 关键机制

```txt
root package.json
  -> workspaces list package locations
  -> package manager links local packages into node_modules
  -> each package has package.json
  -> each package has tsconfig.json
  -> TypeScript checks or builds projects
  -> declarations are emitted
  -> apps import package names
  -> Node or bundler resolves package exports
```

### 必须记住的边界规则

```txt
A workspace package can exist without TypeScript project references.
A TypeScript project can exist without being a publishable package.
A package export can hide files that physically exist.
A paths alias can make TypeScript compile while runtime still fails.
A task runner can order builds, but it cannot replace package metadata.
```

---

## 7. 推荐目录结构

```txt
typescript/monorepo-typescript/
  typescript-monorepo-typescript-learning-guide-zh-v1.md
  typescript-monorepo-typescript-cheatsheet-zh-v1.md

  00-monorepo-problem-model/
    packageBoundaryOverview.ts
    projectBoundaryMistake.ts

  01-workspace-link/
    rootPackageJsonExample.json
    pnpmWorkspaceExample.yaml
    linkedPackageConsumer.ts

  02-root-and-package-config/
    rootPackageJson.json
    packageJsonForContracts.json
    baseTsconfig.json
    packageTsconfig.json

  03-project-references/
    tsconfigSolution.json
    contractsTsconfig.json
    appTsconfig.json
    referenceGraphNotes.md

  04-composite-declarations/
    explicitReturnApi.ts
    declarationOutputConsumer.ts
    missingCompositeMistake.md

  05-package-exports-types/
    packageJsonExports.json
    publicApiIndex.ts
    deepImportMistake.ts

  06-workspace-protocol/
    workspaceDependencyPackageJson.json
    versionMismatchMistake.md
    internalDependencyPolicy.md

  07-paths-vs-runtime/
    pathsAliasTsconfig.json
    aliasCompileOnlyMistake.ts
    nodeSubpathImportsPackageJson.json

  08-nodenext-boundary/
    esmPackageJson.json
    cjsPackageJson.json
    extensionBoundary.ts
    typeFieldMistake.md

  09-apps-packages-tooling/
    appPackageRole.md
    libraryPackageRole.md
    toolingPackageRole.md

  10-task-graph-cache/
    turboJsonExample.json
    packageScriptsExample.json
    taskDependencyNotes.md

  11-shared-tsconfig-package/
    tsconfigPackageJson.json
    baseConfigExport.json
    consumerExtendsConfig.json

  12-workspace-commands/
    npmWorkspaceCommands.md
    pnpmWorkspaceCommands.md
    commandScopeMistake.md

  13-editor-tsserver/
    declarationMapNavigation.md
    multipleTsVersionMistake.md
    editorRestartChecklist.md

  14-publish-version-boundary/
    privatePackageJson.json
    publishablePackageJson.json
    changesetPolicyNotes.md
  15-mini-project/
    package.json
    pnpm-workspace.yaml
    tsconfig.base.json
    tsconfig.json
    packages/
      contracts/
        package.json
        tsconfig.json
        src/
          index.ts
      ui/
        package.json
        tsconfig.json
        src/
          index.ts
    apps/
      storefront/
        package.json
        tsconfig.json
        src/
          main.ts
    miniProjectMistakes.md
    miniProjectChecklist.md
```

---

## 8. 运行方式

### 初始化建议

```bash
cd typescript/monorepo-typescript
pnpm init
pnpm add -D typescript turbo
```

也可以用 npm workspaces，但本章最终小项目用 pnpm，因为 `pnpm-workspace.yaml` 和 `workspace:*` 对内部包边界更直观。

### 类型检查清单

```bash
npx tsc --noEmit
npx tsc -b --verbose
npx tsc -b --dry
npx tsc -b --clean
```

### workspace 命令清单

```bash
npm run typecheck --workspaces --if-present
npm run build --workspaces --if-present
pnpm -r typecheck
pnpm -r build
pnpm --filter @demo/contracts build
pnpm --filter @demo/storefront typecheck
```

### 最终小项目运行清单

```bash
cd typescript/monorepo-typescript/15-mini-project
pnpm install
pnpm -r build
pnpm --filter @demo/storefront start
```

---

## 9. 分节教学与训练内容

每节都要创建文件、运行检查、解释机制。配置示例用于理解边界；最终小项目是完整可运行 monorepo。

---
## 01：Monorepo 到底解决什么问题

### 结论

monorepo 解决的不是“代码放一起方便”，而是让多个包共享仓库、依赖图、任务图、类型边界和重构上下文。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

workspace 让 package manager 链接本地包；package.json 决定 public API；tsconfig 决定一次类型检查或构建范围；Node 或 bundler 决定运行时能不能加载。

### 文件结构

```txt
00-monorepo-problem-model/
  packageBoundaryOverview.ts
  projectBoundaryMistake.ts
```

### packageBoundaryOverview.ts

```ts
// Goal:
// Separate repository, package, and TypeScript project boundaries.

// Expected output:
// @demo/contracts:package-boundary-ok

type BoundaryReport = {
  repositoryName: string;
  packageName: string;
  tsProjectName: string;
  publicEntry: string;
};

const boundaryReport: BoundaryReport = {
  repositoryName: "commerce-workspace",
  packageName: "@demo/contracts",
  tsProjectName: "packages/contracts/tsconfig.json",
  publicEntry: "./dist/index.js",
};

console.log(`${boundaryReport.packageName}:package-boundary-ok`);
```

### projectBoundaryMistake.ts

```ts
// Goal:
// Show that a physical folder is not a public API boundary.

// Expected output:
// deep-source-import-risk

export const invalidImportPattern = "@demo/contracts/src/internal/formatPrice";
export const validImportPattern = "@demo/contracts";

if (invalidImportPattern.includes("/src/")) {
  console.log("deep-source-import-risk");
}

console.log(validImportPattern);
```

### 运行方式

```bash
npx tsc --noEmit 00-monorepo-problem-model/packageBoundaryOverview.ts
npx tsc --noEmit 00-monorepo-problem-model/projectBoundaryMistake.ts
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 02：workspace link 和 package 边界

### 结论

workspace link 让 package manager 把本地包链接成可通过包名导入的依赖。它替代手动 npm link，但不替代 TypeScript 类型边界。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

根 package.json 或 pnpm-workspace.yaml 定义 workspace 包位置；安装时 package manager 创建本地链接；应用包仍然应该通过依赖名导入库包。

### 文件结构

```txt
01-workspace-link/
  rootPackageJsonExample.json
  pnpmWorkspaceExample.yaml
  linkedPackageConsumer.ts
```

### rootPackageJsonExample.json

```json
{
  "name": "workspace-link-demo",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### pnpmWorkspaceExample.yaml

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

### linkedPackageConsumer.ts

```ts
// Goal:
// Consume a workspace package through its public package name.

// Expected result:
// TypeScript checks the public type imported from the linked package.

import type { ProductRecord } from "@demo/contracts";

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(product.title);
```

### 运行方式

```bash
pnpm install
pnpm -r typecheck
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 03：根配置、包配置和 tsconfig 继承

### 结论

根配置负责共享规则，包配置负责定义本包的编译范围。不要让根 tsconfig 直接 include 全仓库源码。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

`extends` 继承基础配置，包级 tsconfig 再声明本包输入、输出、声明文件和 references。

### 文件结构

```txt
02-root-and-package-config/
  rootPackageJson.json
  packageJsonForContracts.json
  baseTsconfig.json
  packageTsconfig.json
```

### rootPackageJson.json

```json
{
  "name": "root-config-demo",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "tsc -b --verbose",
    "typecheck": "tsc -b --pretty"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### packageJsonForContracts.json

```json
{
  "name": "@demo/contracts",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  }
}
```

### baseTsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### packageTsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

### 运行方式

```bash
npx tsc -p 02-root-and-package-config/packageTsconfig.json --showConfig
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 04：Project References 和 solution tsconfig

### 结论

Project References 用 references 显式声明 TypeScript 项目之间的依赖。根 tsconfig 可以作为 solution tsconfig。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

`tsc -b` 读取 references 图，先构建依赖项目，再构建依赖它们的项目。被引用项目必须启用 composite。

### 文件结构

```txt
03-project-references/
  tsconfigSolution.json
  contractsTsconfig.json
  appTsconfig.json
  referenceGraphNotes.md
```

### tsconfigSolution.json

```json
{
  "files": [],
  "references": [
    { "path": "../packages/contracts" },
    { "path": "../apps/storefront" }
  ]
}
```

### contractsTsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"]
}
```

### appTsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true
  },
  "references": [
    { "path": "../../packages/contracts" }
  ],
  "include": ["src"]
}
```

### referenceGraphNotes.md

```md
# Reference Graph Notes

## Build order

1. packages/contracts
2. apps/storefront

## Rule

The app references the contracts project because it imports the contracts package.
The solution config lists projects and does not include source files directly.
```

### 运行方式

```bash
npx tsc -b 03-project-references/tsconfigSolution.json --verbose
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 05：composite、declaration 和 declarationMap

### 结论

被其他 TS 项目引用的 package 通常需要 composite 和 declaration output。declarationMap 让编辑器能从 .d.ts 跳回源码。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

composite 约束项目结构并生成构建信息；declaration 生成 .d.ts；declarationMap 生成 .d.ts.map。

### 文件结构

```txt
04-composite-declarations/
  explicitReturnApi.ts
  declarationOutputConsumer.ts
  missingCompositeMistake.md
```

### explicitReturnApi.ts

```ts
// Goal:
// Keep exported API declarations stable with explicit return types.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type ProductSummary = {
  id: string;
  label: string;
};

export function createProductSummary(product: ProductRecord): ProductSummary {
  return {
    id: product.id,
    label: `${product.title}:${product.priceCents}`,
  };
}
```

### declarationOutputConsumer.ts

```ts
// Goal:
// Consume only the public declaration surface of a package.

import type { ProductSummary } from "@demo/contracts";

const summary: ProductSummary = {
  id: "p1",
  label: "Keyboard:9900",
};

console.log(summary.label);
```

### missingCompositeMistake.md

```md
# Missing Composite Mistake

## Problem

A referenced project does not enable composite.

## Why it fails

TypeScript build mode needs predictable project outputs and metadata.

## Fix

Set composite to true in the referenced project and emit declaration files.
```

### 运行方式

```bash
npx tsc --declaration --declarationMap --emitDeclarationOnly 04-composite-declarations/explicitReturnApi.ts --outDir 04-composite-declarations/dist
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 06：package exports、types 和 public API

### 结论

exports map 控制消费者能 import 的 package 入口，types 控制 TypeScript 能找到的声明入口。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

Node / bundler 通过 exports.import 找运行时代码；TypeScript 通过 exports.types 或顶层 types 找声明文件。

### 文件结构

```txt
05-package-exports-types/
  packageJsonExports.json
  publicApiIndex.ts
  deepImportMistake.ts
```

### packageJsonExports.json

```json
{
  "name": "@demo/contracts",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./validation": {
      "types": "./dist/validation.d.ts",
      "import": "./dist/validation.js"
    }
  },
  "types": "./dist/index.d.ts",
  "files": ["dist"]
}
```

### publicApiIndex.ts

```ts
// Goal:
// Export only the stable public API surface.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProductTitle(product: ProductRecord): string {
  return product.title.trim().toUpperCase();
}
```

### deepImportMistake.ts

```ts
// Goal:
// Document a deep import that should be rejected by package policy.

const deepImportPath = "@demo/contracts/src/internal/formatCents";
const publicImportPath = "@demo/contracts";

console.log(deepImportPath.includes("/src/"));
console.log(publicImportPath);
```

### 运行方式

```bash
npx tsc --noEmit 05-package-exports-types/publicApiIndex.ts
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 07：workspace protocol 和内部依赖版本

### 结论

workspace protocol 表示“这个依赖必须来自当前 workspace”。它让内部依赖关系更明确。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

安装时，package manager 解析 workspace range 并链接本地包；发布或打包时会按工具规则转换为真实版本范围。

### 文件结构

```txt
06-workspace-protocol/
  workspaceDependencyPackageJson.json
  versionMismatchMistake.md
  internalDependencyPolicy.md
```

### workspaceDependencyPackageJson.json

```json
{
  "name": "@demo/storefront",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "@demo/contracts": "workspace:*",
    "@demo/ui": "workspace:*"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  }
}
```

### versionMismatchMistake.md

```md
# Version Mismatch Mistake

## Problem

An internal package depends on a registry version instead of the local workspace package.

## Risk

The app may test against one package version locally and install another version in CI.

## Fix

Use a workspace protocol for internal dependencies when the package manager supports it.
```

### internalDependencyPolicy.md

```md
# Internal Dependency Policy

## Rules

- Internal packages use workspace protocol.
- Apps depend on package names, not source paths.
- Packages declare dependencies they import at runtime.
- Type-only relationships still need TypeScript references when using tsc build mode.
```

### 运行方式

```bash
pnpm install
pnpm list --depth 0
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 08：paths alias、subpath imports 和运行时解析

### 结论

paths 只影响 TypeScript 如何解析类型；它不会自动教 Node、Vite、Vitest 或 Jest 解析同样的别名。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

TypeScript paths 在编译期改写类型解析；Node package imports 在运行时 package 内部解析 # specifier。

### 文件结构

```txt
07-paths-vs-runtime/
  pathsAliasTsconfig.json
  aliasCompileOnlyMistake.ts
  nodeSubpathImportsPackageJson.json
```

### pathsAliasTsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "baseUrl": ".",
    "paths": {
      "@contracts/*": ["packages/contracts/src/*"]
    },
    "strict": true,
    "noEmit": true
  },
  "include": ["packages", "apps"]
}
```

### aliasCompileOnlyMistake.ts

```ts
// Goal:
// Show that a TypeScript paths alias is not automatically a runtime alias.

const compileTimeAlias = "@contracts/index";
const runtimeResolverKnowsAlias = false;

if (!runtimeResolverKnowsAlias) {
  console.log(`${compileTimeAlias}:runtime-risk`);
}
```

### nodeSubpathImportsPackageJson.json

```json
{
  "name": "@demo/contracts",
  "type": "module",
  "imports": {
    "#internal/*": "./dist/internal/*.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

### 运行方式

```bash
npx tsc --noEmit 07-paths-vs-runtime/aliasCompileOnlyMistake.ts
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 09：ESM / CJS / NodeNext 在 monorepo 里的边界

### 结论

每个 package 都可以有自己的 module system。type 字段、文件扩展名和 TypeScript module / moduleResolution 必须一致。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

Node 根据最近的 package.json type 决定 .js 是 ESM 还是 CJS；TypeScript NodeNext 按相同模型检查 import/export。

### 文件结构

```txt
08-nodenext-boundary/
  esmPackageJson.json
  cjsPackageJson.json
  extensionBoundary.ts
  typeFieldMistake.md
```

### esmPackageJson.json

```json
{
  "name": "@demo/esm-package",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

### cjsPackageJson.json

```json
{
  "name": "@demo/cjs-package",
  "type": "commonjs",
  "main": "./dist/index.cjs",
  "types": "./dist/index.d.ts"
}
```

### extensionBoundary.ts

```ts
// Goal:
// Remember that NodeNext ESM source often uses runtime .js specifiers.

const sourceImportSpecifier = "./config.js";
const emittedImportSpecifier = sourceImportSpecifier;

console.log(emittedImportSpecifier);
```

### typeFieldMistake.md

```md
# Type Field Mistake

## Problem

A package emits .js files but package.json does not define the intended module system.

## Risk

Node may interpret the same .js file as CommonJS or ESM depending on package scope.

## Fix

Set the package type field deliberately and align TypeScript module settings with runtime behavior.
```

### 运行方式

```bash
npx tsc --noEmit 08-nodenext-boundary/extensionBoundary.ts
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 10：apps、packages、tooling 包的职责划分

### 结论

monorepo 中 app、library、tooling 三类包的职责不同。不要把共享配置、业务模型、运行时 app 入口混在同一个 package 里。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

每个 package 的 package.json、exports、scripts、dependencies 应该反映它的角色。

### 文件结构

```txt
09-apps-packages-tooling/
  appPackageRole.md
  libraryPackageRole.md
  toolingPackageRole.md
```

### appPackageRole.md

```md
# App Package Role

## Owns

- Runtime deployment
- Environment variables
- Routing
- App-specific tests
- Build output for hosting

## Should not own

- Shared public contracts
- Reusable UI library internals
- Shared TypeScript configuration rules
```

### libraryPackageRole.md

```md
# Library Package Role

## Owns

- Stable public API
- Runtime utilities or components
- Declaration output
- Package exports

## Should not own

- App environment variables
- App deployment configuration
- Deep consumer imports
```

### toolingPackageRole.md

```md
# Tooling Package Role

## Owns

- Shared tsconfig
- Shared lint config
- Shared test config
- Build presets

## Should not own

- Runtime business logic
- App routes
- Product domain entities
```

### 运行方式

```bash
No command is required. Review package responsibilities before writing configs.
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 11：构建顺序、task graph 和缓存边界

### 结论

task graph 负责调度 build/test/lint/typecheck；TypeScript project references 负责 TypeScript 构建图。两者可以配合，但不能互相替代。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

dependsOn 描述任务顺序；outputs 描述缓存产物；references 描述 TypeScript 项目依赖。

### 文件结构

```txt
10-task-graph-cache/
  turboJsonExample.json
  packageScriptsExample.json
  taskDependencyNotes.md
```

### turboJsonExample.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

### packageScriptsExample.json

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

### taskDependencyNotes.md

```md
# Task Dependency Notes

## Task graph

A task graph describes which package task must run before another package task.

## Cache boundary

A cache entry is valid only if inputs, outputs, environment, and dependency task outputs match.

## TypeScript boundary

The TypeScript project graph and the task graph can overlap, but they are not the same graph.
```

### 运行方式

```bash
turbo build
turbo typecheck
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 12：共享 tsconfig 包和配置包

### 结论

共享 tsconfig 包可以减少重复配置，但它应该只分享通用规则，不应该强行决定每个包的 include、rootDir 和 outDir。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

消费者通过 extends 继承共享配置，然后在本包 tsconfig 中声明自己的输入和输出边界。

### 文件结构

```txt
11-shared-tsconfig-package/
  tsconfigPackageJson.json
  baseConfigExport.json
  consumerExtendsConfig.json
```

### tsconfigPackageJson.json

```json
{
  "name": "@demo/tsconfig",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./base": "./base.json",
    "./node": "./node.json"
  },
  "files": ["base.json", "node.json"]
}
```

### baseConfigExport.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

### consumerExtendsConfig.json

```json
{
  "extends": "@demo/tsconfig/base",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src"]
}
```

### 运行方式

```bash
npx tsc -p 11-shared-tsconfig-package/consumerExtendsConfig.json --showConfig
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 13：类型检查、测试和 lint 的 workspace 命令

### 结论

workspace 命令必须明确运行范围：根 package、所有 workspace package、还是某个指定 package。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

npm 使用 --workspaces / --workspace；pnpm 使用 -r 和 --filter。

### 文件结构

```txt
12-workspace-commands/
  npmWorkspaceCommands.md
  pnpmWorkspaceCommands.md
  commandScopeMistake.md
```

### npmWorkspaceCommands.md

```md
# npm Workspace Commands

## Run a script in all workspaces

npm run build --workspaces --if-present
npm run typecheck --workspaces --if-present

## Run a script in one workspace

npm run build --workspace @demo/contracts
```

### pnpmWorkspaceCommands.md

```md
# pnpm Workspace Commands

## Recursive commands

pnpm -r build
pnpm -r typecheck

## Filtered commands

pnpm --filter @demo/contracts build
pnpm --filter @demo/storefront typecheck
```

### commandScopeMistake.md

```md
# Command Scope Mistake

## Problem

A root command runs only the root package and skips workspace packages.

## Fix

Use a workspace-aware command when the script must run in packages.

## Rule

Root scripts coordinate. Package scripts perform package work.
```

### 运行方式

```bash
npm run build --workspaces --if-present
pnpm -r build
pnpm --filter @demo/contracts build
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 14：编辑器、tsserver 和跨包跳转

### 结论

monorepo 编辑器体验依赖 tsserver、声明输出、declarationMap、package exports 和 workspace TypeScript 版本。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

编辑器通过 tsserver 创建项目图，读取 tsconfig、package metadata 和 declaration maps 来提供跨包跳转。

### 文件结构

```txt
13-editor-tsserver/
  declarationMapNavigation.md
  multipleTsVersionMistake.md
  editorRestartChecklist.md
```

### declarationMapNavigation.md

```md
# Declaration Map Navigation

## What it improves

Declaration maps allow editor navigation from emitted declaration files back to source files.

## Required settings

- declaration: true
- declarationMap: true
- sourceMap: true when runtime debugging also matters

## Check

Hover an imported type from another package and use Go to Definition.
```

### multipleTsVersionMistake.md

```md
# Multiple TypeScript Version Mistake

## Problem

Different packages or the editor use different TypeScript versions.

## Risk

Diagnostics, JSX behavior, module resolution, and config support can differ.

## Fix

Use the workspace TypeScript version in the editor and keep package versions aligned.
```

### editorRestartChecklist.md

```md
# Editor Restart Checklist

## Use this when cross-package types look stale

- Restart the TypeScript server.
- Reinstall workspace dependencies.
- Rebuild referenced projects.
- Check declaration output.
- Check package exports and types entries.
- Check that the editor uses the workspace TypeScript version.
```

### 运行方式

```bash
npx tsc -b --verbose
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 15：发布策略、private 包和版本边界

### 结论

monorepo 里不是所有 package 都应该发布。app 通常是 private，库包可以 publishable，但必须定义版本、exports、types、files 和发布前检查。

### 技术意义

这一节不是记配置名，而是确认这个配置或代码位于哪一层边界：workspace、package metadata、TypeScript project、runtime resolver、task graph 或 editor service。

### 底层机制

private 阻止发布；publishable 包通过 files 控制包内容，通过 exports 和 types 控制导入和类型入口。

### 文件结构

```txt
14-publish-version-boundary/
  privatePackageJson.json
  publishablePackageJson.json
  changesetPolicyNotes.md
```

### privatePackageJson.json

```json
{
  "name": "@demo/storefront",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  }
}
```

### publishablePackageJson.json

```json
{
  "name": "@demo/contracts",
  "version": "0.1.0",
  "type": "module",
  "private": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "prepack": "pnpm build",
    "pack:check": "pnpm pack --dry-run"
  }
}
```

### changesetPolicyNotes.md

```md
# Changeset Policy Notes

## Patch

Bug fix without public API change.

## Minor

Backward-compatible public API addition.

## Major

Breaking runtime or type-level public API change.

## Rule

In TypeScript libraries, type changes can be breaking changes.
```

### 运行方式

```bash
pnpm --filter @demo/contracts pack --dry-run
```

### 预期输出

```txt
No unexpected compiler errors. If a file is a note or metadata file, inspect it instead of running it as TypeScript.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 创建本节文件结构。 |
| 2 | 判断每个文件属于 package metadata、TypeScript config、source code 还是 note。 |
| 3 | 运行命令或人工检查配置。 |
| 4 | 把结果归因到正确边界，而不是笼统说“monorepo 配置错了”。 |

### 常见错误为什么错

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把文件夹边界当作 package 边界 | 物理目录不定义 public API | 用 package.json 和 exports 定义 public API |
| 把 TypeScript 能解析当作运行时能加载 | TypeScript 和 Node / bundler 使用不同解析机制 | 让 package metadata、tsconfig 和 runtime 配置一致 |
| 根配置包含太多源码 | 容易重复检查和污染编辑器项目图 | 根配置共享规则，包配置定义边界 |

### 最终记忆模型

```txt
Boundary alignment matters more than folder layout.
```

---

## 10. 本章 API / 语法完整索引

| 名称 | 所属层级 | 写法 | 作用 | 常见坑 |
|---|---|---|---|---|
| `workspaces` | package.json | `"workspaces": ["packages/*"]` | npm workspace 发现本地包 | 不等于 TS references |
| `pnpm-workspace.yaml` | pnpm | `packages: ["packages/*"]` | pnpm workspace 根配置 | 文件必须在 workspace root |
| `workspace:*` | package manager | `"@demo/contracts": "workspace:*"` | 声明内部 workspace 依赖 | 不是 TypeScript 语法 |
| `references` | tsconfig | `{ "path": "../contracts" }` | TS 项目构建依赖 | 不是 package dependency |
| `composite` | TSConfig | `"composite": true` | 允许项目被引用 | 被引用项目通常需要 declaration output |
| `declaration` | TSConfig | `"declaration": true` | 生成 `.d.ts` | 应用包不一定需要发布声明 |
| `declarationMap` | TSConfig | `"declarationMap": true` | 声明跳源码 | 要配合 fresh build 才可靠 |
| `exports` | package.json | `{ ".": { "import": "..." } }` | 控制 package public entries | deep import 会被阻止 |
| `types` | package.json | `"types": "./dist/index.d.ts"` | 声明入口 | 不决定运行时入口 |
| `imports` | package.json | `"#internal/*": "./dist/internal/*.js"` | package 内部 subpath imports | 只适合包内部 `#` specifier |
| `paths` | TSConfig | `"@/*": ["src/*"]` | TS 编译期别名解析 | 不是 runtime alias |
| `type` | package.json | `"type": "module"` | Node 判断 `.js` 模块系统 | 会影响整个 package scope |
| `tsc -b` | TypeScript CLI | `tsc -b --verbose` | 按 references 构建 | 需要正确 project graph |
| `pnpm -r` | pnpm CLI | `pnpm -r build` | 在 workspace packages 中递归运行脚本 | 注意命令作用范围 |
| `pnpm --filter` | pnpm CLI | `pnpm --filter @demo/contracts build` | 限定命令作用范围 | filter 错会跑错包 |

---

## 11. 本章常见错误总表

| 错误 | 为什么错 | 正确做法 |
|---|---|---|
| 把 monorepo 当成一个大项目 | 多包工程需要明确 package ownership | 每个 package 有自己的 package.json 和 tsconfig |
| 根 tsconfig include 全仓库 | 会导致重复检查、编辑器变慢、边界不清 | 根使用 solution tsconfig 或 base config |
| 跨包 deep import `src` | 绕过 public API 和 exports | 从 package name 或 subpath export 导入 |
| 只配置 `paths` | 运行时不认识 TS alias | runtime / bundler 也要配置，或用 package exports |
| 没有声明输出 | 下游包无法稳定消费类型 | 库包启用 declaration 和 types entry |
| app 和 library 都发布 | app 通常是部署目标不是 npm 包 | app 标记 private，库包再考虑发布 |
| task runner 替代 tsc | task runner 调度命令，不计算 TS 类型 | 保留 tsc 类型检查或 build mode |
| project references 到处乱加 | 增加配置复杂度和缓存层 | 只有需要 `tsc -b` 构建图时再使用 |
| `workspace:*` 当作运行时路径 | 它是依赖版本协议 | 运行时仍通过 package name 和 exports 加载 |
| 多个 TS 版本并存 | 编辑器和 CI 诊断可能不同 | 统一 workspace TypeScript 版本 |

---

## 12. 最终小项目：Typed Commerce Monorepo

### 项目目标

建立一个最小可运行 TypeScript monorepo：

```txt
packages/contracts:
  exports shared product contracts and helpers

packages/ui:
  consumes contracts and exports UI-independent label helpers

apps/storefront:
  consumes both packages and runs as a Node ESM app
```

### 文件结构

```txt
15-mini-project/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  tsconfig.json
  packages/
    contracts/
      package.json
      tsconfig.json
      src/
        index.ts
    ui/
      package.json
      tsconfig.json
      src/
        index.ts
  apps/
    storefront/
      package.json
      tsconfig.json
      src/
        main.ts
  miniProjectMistakes.md
  miniProjectChecklist.md
```

### package.json

```json
{
  "name": "typed-commerce-monorepo",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@latest",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "tsc -b --verbose",
    "clean": "tsc -b --clean",
    "typecheck": "tsc -b --pretty",
    "start": "pnpm --filter @demo/storefront start"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./packages/contracts" },
    { "path": "./packages/ui" },
    { "path": "./apps/storefront" }
  ]
}
```

### packages/contracts/package.json

```json
{
  "name": "@demo/contracts",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  }
}
```

### packages/contracts/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### packages/contracts/src/index.ts

```ts
// Goal:
// Export shared contracts for the workspace.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type ProductSummary = {
  id: string;
  label: string;
};

export function createProductSummary(product: ProductRecord): ProductSummary {
  return {
    id: product.id,
    label: `${product.title}:${product.priceCents}`,
  };
}
```

### packages/ui/package.json

```json
{
  "name": "@demo/ui",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@demo/contracts": "workspace:*"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit"
  }
}
```

### packages/ui/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "references": [
    { "path": "../contracts" }
  ],
  "include": ["src"]
}
```

### packages/ui/src/index.ts

```ts
// Goal:
// Consume the contracts package and export UI-friendly formatting helpers.

import type { ProductRecord } from "@demo/contracts";
import { createProductSummary } from "@demo/contracts";

export function createProductCardLabel(product: ProductRecord): string {
  const summary = createProductSummary(product);
  return `Product ${summary.label}`;
}
```

### apps/storefront/package.json

```json
{
  "name": "@demo/storefront",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "@demo/contracts": "workspace:*",
    "@demo/ui": "workspace:*"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "start": "node dist/main.js"
  }
}
```

### apps/storefront/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "sourceMap": true
  },
  "references": [
    { "path": "../../packages/contracts" },
    { "path": "../../packages/ui" }
  ],
  "include": ["src"]
}
```

### apps/storefront/src/main.ts

```ts
// Goal:
// Run an app package that consumes workspace library packages.

import type { ProductRecord } from "@demo/contracts";
import { createProductCardLabel } from "@demo/ui";

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(createProductCardLabel(product));
```

### miniProjectMistakes.md

```md
# Mini Project Mistakes

## Deep source import

Do not import from @demo/contracts/src/index.
Import from @demo/contracts.

## Missing build order

The app depends on generated library output.
Build referenced projects before running the app.

## Missing package dependency

If a package imports another package at runtime, declare it in dependencies.
```

### miniProjectChecklist.md

```md
# Mini Project Checklist

- Root package.json defines workspaces.
- pnpm-workspace.yaml includes packages and apps.
- Root tsconfig.json is a solution config.
- contracts emits declarations.
- ui references contracts.
- storefront references contracts and ui.
- packages expose public entries through exports.
- app imports package names, not source paths.
- pnpm -r build succeeds.
- storefront can run after build.
```

### 运行方式

```bash
cd typescript/monorepo-typescript/15-mini-project
pnpm install
pnpm -r build
pnpm --filter @demo/storefront start
```

### 预期输出

```txt
Product Keyboard:9900
```

### 完整执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | pnpm 读取 workspace 配置并链接本地 packages。 |
| 2 | `tsc -b` 从 solution tsconfig 读取 references。 |
| 3 | contracts 先构建并输出 JS 和 `.d.ts`。 |
| 4 | ui 引用 contracts 的输出并构建。 |
| 5 | storefront 引用 contracts 和 ui 并构建。 |
| 6 | Node 运行 `apps/storefront/dist/main.js`。 |
| 7 | 运行时通过 workspace link 和 package exports 加载本地包。 |

---

## 13. cheatsheet 使用方式

本章可以单独生成速查表：

```txt
typescript/monorepo-typescript/typescript-monorepo-typescript-cheatsheet-zh-v1.md
```

速查表应覆盖：

```txt
workspace commands
project references commands
package.json boundary fields
tsconfig boundary fields
NodeNext import rules
exports/types checklist
task graph checklist
common IDE fixes
```

---

## 14. 最终文件清单

```txt
typescript/monorepo-typescript/
  typescript-monorepo-typescript-learning-guide-zh-v1.md
  typescript-monorepo-typescript-cheatsheet-zh-v1.md

  00-monorepo-problem-model/
    packageBoundaryOverview.ts
    projectBoundaryMistake.ts

  01-workspace-link/
    rootPackageJsonExample.json
    pnpmWorkspaceExample.yaml
    linkedPackageConsumer.ts

  02-root-and-package-config/
    rootPackageJson.json
    packageJsonForContracts.json
    baseTsconfig.json
    packageTsconfig.json

  03-project-references/
    tsconfigSolution.json
    contractsTsconfig.json
    appTsconfig.json
    referenceGraphNotes.md

  04-composite-declarations/
    explicitReturnApi.ts
    declarationOutputConsumer.ts
    missingCompositeMistake.md

  05-package-exports-types/
    packageJsonExports.json
    publicApiIndex.ts
    deepImportMistake.ts

  06-workspace-protocol/
    workspaceDependencyPackageJson.json
    versionMismatchMistake.md
    internalDependencyPolicy.md

  07-paths-vs-runtime/
    pathsAliasTsconfig.json
    aliasCompileOnlyMistake.ts
    nodeSubpathImportsPackageJson.json

  08-nodenext-boundary/
    esmPackageJson.json
    cjsPackageJson.json
    extensionBoundary.ts
    typeFieldMistake.md

  09-apps-packages-tooling/
    appPackageRole.md
    libraryPackageRole.md
    toolingPackageRole.md

  10-task-graph-cache/
    turboJsonExample.json
    packageScriptsExample.json
    taskDependencyNotes.md

  11-shared-tsconfig-package/
    tsconfigPackageJson.json
    baseConfigExport.json
    consumerExtendsConfig.json

  12-workspace-commands/
    npmWorkspaceCommands.md
    pnpmWorkspaceCommands.md
    commandScopeMistake.md

  13-editor-tsserver/
    declarationMapNavigation.md
    multipleTsVersionMistake.md
    editorRestartChecklist.md

  14-publish-version-boundary/
    privatePackageJson.json
    publishablePackageJson.json
    changesetPolicyNotes.md
  15-mini-project/
    package.json
    pnpm-workspace.yaml
    tsconfig.base.json
    tsconfig.json
    packages/
      contracts/
        package.json
        tsconfig.json
        src/
          index.ts
      ui/
        package.json
        tsconfig.json
        src/
          index.ts
    apps/
      storefront/
        package.json
        tsconfig.json
        src/
          main.ts
    miniProjectMistakes.md
    miniProjectChecklist.md
```

---

## 15. 最终学习笔记转换要求

每个知识点按这个结构整理：

```md
## Topic name

### Conclusion

### Technical meaning

### Underlying mechanism

### Configuration or code example

### Execution process

### Common mistake

### Project relationship

### Final memory model
```

最终笔记必须讲清楚这些对比：

```txt
monorepo vs large folder
workspace boundary vs package boundary
package boundary vs TypeScript project boundary
workspace protocol vs package name import
project references vs task graph
exports vs paths
runtime JavaScript output vs declaration output
app package vs library package vs tooling package
NodeNext package boundary vs Bundler resolution
private package vs publishable package
```

---

## 16. 本章最终要能回答的问题

```txt
1. Why is a monorepo not just a large folder?
2. What does a workspace link solve?
3. What does a package boundary solve?
4. What does a TypeScript project boundary solve?
5. Why should a root solution tsconfig usually avoid include?
6. What does tsc -b do with references?
7. Why do referenced projects need composite?
8. Why do library packages emit declaration files?
9. What does declarationMap improve?
10. What do exports and types control?
11. Why is a paths alias not runtime resolution?
12. When should you use Node package imports?
13. What is the difference between app, package, and tooling package?
14. How does a task graph differ from TypeScript project references?
15. Why can Turborepo and tsc build mode be alternative strategies in some projects?
16. How do workspace commands run scripts across packages?
17. Why can editor cross-package navigation become stale?
18. Why are type changes breaking changes for TypeScript libraries?
19. How does the final mini project connect package manager, TypeScript, and runtime resolution?
```

---

## 17. 本章最终记忆模型

```txt
TypeScript monorepo engineering is boundary alignment.

Repository:
  one Git history

Workspace:
  local packages are installed and linked

Package:
  public API and runtime entries are declared

TypeScript project:
  type checking and declaration output are scoped

Task graph:
  commands are ordered and cached

Runtime:
  Node or bundler loads emitted JavaScript through package metadata

Editor:
  tsserver reads configs, declarations, package metadata, and maps
```

最重要的一句话：

```txt
A safe TypeScript monorepo is not defined by folder layout alone; it is defined by agreement between workspace links, package exports, tsconfig projects, build tasks, and runtime resolution.
```

---

## 18. 官方文档阅读清单

1. [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
2. [TypeScript Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
3. [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
4. [Node.js Packages](https://nodejs.org/api/packages.html)
5. [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)
6. [pnpm Workspaces](https://pnpm.io/workspaces)
7. [pnpm workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
8. [Turborepo TypeScript guide](https://turborepo.com/docs/guides/tools/typescript)
9. [Turborepo task configuration](https://turborepo.com/docs/crafting-your-repository/configuring-tasks)

---

## 19. 学习完成检查清单

```txt
[ ] I can explain workspace link without confusing it with project references.
[ ] I can explain package boundary without using folder layout as the only rule.
[ ] I can create a root solution tsconfig with references.
[ ] I can configure composite library packages.
[ ] I can explain declaration output and declarationMap.
[ ] I can define package exports and types entries.
[ ] I can explain why paths does not equal runtime resolution.
[ ] I can run workspace scripts with npm or pnpm.
[ ] I can explain task graph vs TypeScript project graph.
[ ] I can build and run the final mini project.
```

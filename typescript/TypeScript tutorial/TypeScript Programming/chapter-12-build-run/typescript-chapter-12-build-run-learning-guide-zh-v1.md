# TypeScript 第 12 章“构建和运行 TypeScript”学习指导文件 v1

> 定位：这是 TypeScript 第 12 章“构建和运行 TypeScript”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` / `.mts` / `.cts` / `.json` / `.d.ts` 文件、运行 `tsc`、观察构建产物、源码映射、项目引用、watch 输出、Node 运行、浏览器打包、NPM 发布结构和三斜线指令，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 12 章“构建和运行 TypeScript”，TypeScript 官方 Handbook / Reference 的 Project References、Triple-Slash Directives、Modules Reference、Declaration Files Publishing，以及 TSConfig 官方文档中的 `target`、`lib`、`module`、`moduleResolution`、`rootDir`、`outDir`、`declaration`、`declarationMap`、`sourceMap`、`inlineSources`、`composite`、`incremental`、`tsBuildInfoFile`、`noEmitOnError`、`emitDeclarationOnly`、`types`、`typeRoots`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名、字符串和代码注释统一英文；代码块中不使用中文字符。  
> 学习原则：先理解 TypeScript 编译器在工程中到底产出什么，再理解服务器、浏览器、NPM 包和旧式三斜线指令如何消费这些产物。不要把构建学成“会运行 tsc 命令”。

> 重要说明：第 12 章开始从“写 TypeScript 代码”转向“交付 TypeScript 工程”。你现在要训练的是：源码、类型检查、编译输出、调试映射、运行环境、发布包结构和项目引用之间的边界。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 项目引用、`composite`、`declarationMap`、`tsc --build`、增量构建、solution tsconfig | [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) |
| 三斜线指令、`reference path`、`reference types`、`reference lib`、`amd-module`、`preserve` | [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) |
| 发布声明文件、`package.json` 的 `types` 字段、随包发布类型和 DefinitelyTyped | [Declaration Files Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html) |
| Node / bundler 模块理论、运行时模块系统和 TypeScript 输出的关系 | [Modules Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html) |
| 编译目标和默认 lib 的关系 | [TSConfig target](https://www.typescriptlang.org/tsconfig/target.html) |
| 编译产物输出目录 | [TSConfig outDir](https://www.typescriptlang.org/tsconfig/outDir.html) |
| 输入根目录和输出目录结构 | [TSConfig rootDir](https://www.typescriptlang.org/tsconfig/rootDir.html) |
| 生成 `.d.ts` 声明文件 | [TSConfig declaration](https://www.typescriptlang.org/tsconfig/declaration.html) |
| 生成源码映射文件 | [TSConfig sourceMap](https://www.typescriptlang.org/tsconfig/sourceMap.html) |
| 项目引用必须满足的复合项目约束 | [TSConfig composite](https://www.typescriptlang.org/tsconfig/composite.html) |
| 保存构建图信息，加快后续编译 | [TSConfig incremental](https://www.typescriptlang.org/tsconfig/incremental.html) |
| 有错误时不输出构建产物 | [TSConfig noEmitOnError](https://www.typescriptlang.org/tsconfig/noEmitOnError.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 12 章完整学习顺序](#3-第-12-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：构建和运行到底在解决什么](#5-00构建和运行到底在解决什么)
6. [01：项目结构、rootDir 和 outDir](#6-01项目结构rootdir-和-outdir)
7. [02：构建产物：JavaScript、声明文件和映射文件](#7-02构建产物javascript声明文件和映射文件)
8. [03：target、lib、module 和 moduleResolution](#8-03targetlibmodule-和-moduleresolution)
9. [04：源码映射 source map 和调试边界](#9-04源码映射-source-map-和调试边界)
10. [05：declaration、declarationMap 和类型入口](#10-05declarationdeclarationmap-和类型入口)
11. [06：noEmit、noEmitOnError 和类型检查模式](#11-06noemitnoemitonerror-和类型检查模式)
12. [07：incremental、tsBuildInfoFile 和构建缓存](#12-07incrementaltsbuildinfofile-和构建缓存)
13. [08：项目引用 project references](#13-08项目引用-project-references)
14. [09：solution tsconfig 和 tsc --build](#14-09solution-tsconfig-和-tsc-build)
15. [10：监控错误 watch mode](#15-10监控错误-watch-mode)
16. [11：在服务器中运行 TypeScript](#16-11在服务器中运行-typescript)
17. [12：在浏览器中运行 TypeScript](#17-12在浏览器中运行-typescript)
18. [13：发布到 NPM：package.json 和 dist 结构](#18-13发布到-npmpackagejson-和-dist-结构)
19. [14：发布声明文件和类型版本边界](#19-14发布声明文件和类型版本边界)
20. [15：三斜线指令 reference types](#20-15三斜线指令-reference-types)
21. [16：三斜线指令 amd-module](#21-16三斜线指令-amd-module)
22. [17：小项目整合](#22-17小项目整合)
23. [最终文件清单](#23-最终文件清单)
24. [最终学习笔记转换要求](#24-最终学习笔记转换要求)
25. [本章最终要能回答的问题](#25-本章最终要能回答的问题)
26. [TS 官方文档阅读清单](#26-ts-官方文档阅读清单)
27. [第 12 章最终记忆模型](#27-第-12-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个让你亲手构建 TypeScript 工程、检查编译输出、运行输出文件、观察调试映射和发布结构的训练指导。

第 12 章必须同时观察五件事：

```txt
Source layer:
  TypeScript source files, config files, package metadata, and declaration files.

Checker layer:
  tsc checks types, module boundaries, project references, and config constraints.

Emit layer:
  tsc emits JavaScript, declaration files, source maps, and build info files.

Runtime layer:
  Node, browser, or bundler runs JavaScript, not TypeScript types.

Distribution layer:
  npm packages expose JavaScript entry points and declaration entry points.
```

本章的核心问题不是“怎么把 `.ts` 变成 `.js`”，而是：

```txt
What exactly does the compiler produce, who consumes each output, and which environment runs it?
```

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. Read the conclusion first.
2. Classify the concept as project layout, compiler emit, debug artifact, build graph, runtime execution, package distribution, or legacy directive.
3. Create the target directory.
4. Write the source files and config files.
5. Run npx tsc --noEmit when the goal is type checking only.
6. Run npx tsc -p tsconfig.json when the goal is compiler output.
7. Inspect dist, types, source maps, and .tsbuildinfo files when they are produced.
8. Run Node only against emitted JavaScript unless the tool explicitly supports TypeScript execution.
9. Compare source file, emitted file, declaration file, and runtime behavior.
10. Convert the section into your final notes.
```

### 推荐基础 tsconfig

本章建议从一个“可构建库”的配置开始：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noEmitOnError": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### 推荐 package scripts

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.json",
    "build:watch": "tsc -p tsconfig.json --watch",
    "clean": "node scripts/clean-dist.mjs",
    "prepack": "npm run build",
    "pack:dry": "npm pack --dry-run"
  }
}
```

### 代码注释模板

`.ts` 文件顶部：

```ts
// Goal:
// Verify how this TypeScript build and runtime example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`.json` 配置文件中不写注释。真实 JSON 不支持注释。

---

## 2. 项目重新整理建议

### 结论

第 12 章建议单独建立：

```txt
typescript/chapter-12-build-run/
```

这一章不要只写练习代码。你必须创建多个 `tsconfig`、`package.json`、`src`、`dist`、`types`、`packages` 和 `apps` 结构，因为本章训练的是工程构建，不是单文件语法。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json

  chapter-03-types/
  chapter-04-functions/
  chapter-05-classes-interfaces/
  chapter-06-advanced-types/
  chapter-07-error-handling/
  chapter-08-async-concurrency-parallelism/
  chapter-09-frameworks/
  chapter-10-namespaces-modules/
  chapter-11-js-interop/

  chapter-12-build-run/
    README.md

    00-build-runtime-model/
      src/index.ts
      tsconfig.json
      inspectBuild.md
      tscDiagnosticCommands.md

    01-project-structure/
      src/domain/product.ts
      src/index.ts
      tsconfig.json

    02-build-artifacts/
      src/index.ts
      tsconfig.json
      artifactNotes.md

    03-target-lib-module/
      src/runtimeFeatures.ts
      targetDoesNotPolyfill.ts
      tsconfig.node.json
      tsconfig.browser.json
      moduleResolutionTrace.md
      configComparison.md

    04-source-maps/
      src/errorStack.ts
      tsconfig.json
      debugNotes.md
      inlineSourcesBoundary.md

    05-declarations/
      src/publicApi.ts
      tsconfig.json
      declarationNotes.md

    06-emit-modes/
      src/brokenTypes.ts
      tsconfig.typecheck.json
      tsconfig.emit.json
      tsconfig.declaration-only.json

    07-incremental-build/
      src/index.ts
      tsconfig.json
      cacheNotes.md

    08-project-references/
      packages/contracts/src/index.ts
      packages/contracts/tsconfig.json
      packages/core/src/index.ts
      packages/core/tsconfig.json
      projectReferenceBoundaryNotes.md

    09-solution-build/
      tsconfig.json
      packages/contracts/tsconfig.json
      packages/core/tsconfig.json
      apps/cli/tsconfig.json

    10-watch-mode/
      src/index.ts
      tsconfig.json
      watchNotes.md

    11-server-runtime/
      src/serverEntry.ts
      tsconfig.node.json
      package.json
      directTsRuntimeBoundary.md

    12-browser-runtime/
      src/browserEntry.ts
      index.html
      tsconfig.browser.json
      browserNotes.md
      tscDoesNotBundle.md

    13-npm-publishing/
      src/index.ts
      package.json
      packageExportsBoundary.json
      tsconfig.json
      npmPackNotes.md

    14-type-publishing/
      src/index.ts
      package.json
      tsconfig.json
      typeEntryNotes.md
      declarationRuntimeDrift.ts

    15-triple-slash-types/
      node-env.d.ts
      nodeConsumer.ts
      typesDirectiveNotes.md

    16-triple-slash-amd/
      amdModule.ts
      tsconfig.amd.json
      amdNotes.md

    17-mini-project/
      packages/contracts/src/index.ts
      packages/contracts/tsconfig.json
      packages/core/src/index.ts
      packages/core/tsconfig.json
      apps/cli/src/main.ts
      apps/cli/tsconfig.json
      tsconfig.json
      package.json

notes/
  typescript.md
```

### 和前面章节的关系

```txt
Chapter 3 to Chapter 7:
  value shapes, function boundaries, object structures, errors, and type operations.

Chapter 8:
  async runtime and Promise boundaries.

Chapter 9:
  framework and API boundaries.

Chapter 10:
  module boundaries.

Chapter 11:
  JavaScript interop and declaration files.

Chapter 12:
  build, run, debug, publish, and scale the project.
```

---

## 3. 第 12 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
build and runtime model
  -> project structure
  -> rootDir and outDir
  -> emitted JavaScript
  -> declaration files
  -> source maps
  -> target, lib, module, moduleResolution
  -> noEmit and noEmitOnError
  -> incremental builds
  -> project references
  -> solution tsconfig
  -> watch mode
  -> server runtime
  -> browser runtime
  -> npm package publishing
  -> type publishing
  -> triple-slash reference types
  -> triple-slash amd-module
  -> mini project
```

### 技术意义

第 12 章是 TypeScript 从“语言”进入“工程交付”的章节。你要开始用下面这组问题检查每个项目：

```txt
Where are source files?
Where are emitted files?
Which files are runtime files?
Which files are type-only files?
Which tsconfig is used for type checking?
Which tsconfig is used for building?
Which JavaScript environment runs the output?
Which package metadata points consumers to runtime and type entries?
```

---

## 4. 本章先要建立的底层模型

### 结论

TypeScript 工程构建可以拆成六层：

```txt
input layer:
  src files, declaration files, package files, and configs.

analysis layer:
  parser, binder, checker, module resolver, and project graph.

emit layer:
  JavaScript files, declaration files, source maps, and build info.

debug layer:
  source maps connect emitted JavaScript back to TypeScript source.

runtime layer:
  Node, browser, worker, test runner, or bundler executes JavaScript.

distribution layer:
  npm package exposes JS entry points, type entry points, and export maps.
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| `tsc` | TypeScript 编译器命令。可以只检查，也可以输出文件。 |
| `tsconfig.json` | TypeScript 项目配置文件。 |
| `rootDir` | TypeScript 用来计算输出目录结构的源码根目录。 |
| `outDir` | 编译产物输出目录。 |
| `target` | 要输出到哪个 ECMAScript 版本。 |
| `lib` | 当前项目可见的标准库类型声明集合。 |
| `module` | 输出的 JavaScript 模块格式或模块语义。 |
| `moduleResolution` | TypeScript 如何解析 import specifier。 |
| `sourceMap` | 生成 `.js.map`，让调试器从 JS 映射回 TS。 |
| `declaration` | 生成 `.d.ts`，给消费者提供类型入口。 |
| `declarationMap` | 生成 `.d.ts.map`，改善跨包跳转体验。 |
| `composite` | 让项目满足 project references 的构建约束。 |
| `incremental` | 保存构建图信息到 `.tsbuildinfo`，加快后续构建。 |
| `tsc --build` | 构建模式，按项目引用图构建多个项目。 |
| `watch` | 文件变化后持续重新检查或构建。 |
| 三斜线指令 | 文件顶部的特殊注释，给编译器提供额外指令。 |

### 底层机制总图

```txt
source files and configs
  -> tsc creates a program
  -> module resolver finds files and types
  -> checker validates types
  -> emitter writes JavaScript and declarations
  -> source maps connect output to input
  -> runtime executes JavaScript
  -> npm package exposes runtime and type entries
```

### 本章最重要的边界

```txt
Type checking is not the same as emitting files.
Emitted JavaScript is not the same as declaration files.
Source maps are not runtime logic.
Node does not run TypeScript types.
Browsers do not run TypeScript source directly.
Project references are build graph boundaries.
NPM package types must match the runtime JavaScript entry points.
Triple-slash directives are legacy and declaration-focused tools, not normal module imports.
```

---

## 5. 00：构建和运行到底在解决什么

### 结论

构建解决“从 TypeScript 源码产生可运行 JavaScript 和可消费类型声明”的问题；运行解决“哪个环境执行这些 JavaScript”的问题。

### 技术意义

TypeScript 类型在运行时会被擦除。你交付给 Node、浏览器或 NPM 消费者的不是 `.ts` 类型本身，而是 JavaScript 文件、`.d.ts` 文件和元数据。

### 文件结构

```txt
00-build-runtime-model/
  src/index.ts
  tsconfig.json
  inspectBuild.md
  tscDiagnosticCommands.md
```

### `src/index.ts`

```ts
// Goal:
// Build a small TypeScript module and inspect emitted output.

// Expected result:
// The compiler emits JavaScript and declaration files.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProduct(product: ProductRecord): string {
  return `${product.title}:${product.priceCents}`;
}

console.log(formatProduct({ id: "p1", title: "Keyboard", priceCents: 9900 }));
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true,
    "strict": true,
    "noEmitOnError": true
  },
  "include": ["src"]
}
```

### 运行方式

```bash
npx tsc -p tsconfig.json
node dist/index.js
```

### `inspectBuild.md`

```txt
Inspect:
  dist/index.js
  dist/index.d.ts
  dist/index.js.map

Questions:
  Which output file does Node run?
  Which output file describes the public type API?
  Which output file helps debugging?
```

### 本节补充：先把 `tsc` 当成“可观察的编译器”

构建问题最容易变模糊，是因为你只看命令是否成功，没有看 TypeScript 实际采用了哪些配置、读入了哪些文件、如何解析模块。第 12 章以后，遇到构建错误不要直接猜，先用诊断命令把编译器视角打印出来。

### `tscDiagnosticCommands.md`

```txt
Commands:
  npx tsc -p tsconfig.json --showConfig
  npx tsc -p tsconfig.json --listFilesOnly
  npx tsc -p tsconfig.json --explainFiles
  npx tsc -p tsconfig.json --traceResolution

Use showConfig:
  Inspect the final merged compiler options.

Use listFilesOnly:
  Inspect files included in the program without continuing compilation.

Use explainFiles:
  Inspect why each file is included.

Use traceResolution:
  Inspect how each import specifier is resolved.
```

这几个命令解决的是“我以为 tsconfig 是这样，但 TypeScript 实际不是这样”的问题。特别是 `extends`、`include`、`exclude`、`types`、`moduleResolution`、项目引用和路径别名混在一起时，诊断命令比猜更可靠。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| TypeScript 代码直接被 Node 运行 | Node 默认运行 JavaScript 输出，除非使用额外运行工具。 |
| `.d.ts` 是运行时代码 | `.d.ts` 只给类型检查器和编辑器使用。 |
| `sourceMap` 会改变业务逻辑 | source map 只帮助调试映射。 |

---

## 6. 01：项目结构、rootDir 和 outDir

### 结论

`rootDir` 决定输出目录结构如何从源码目录复制；`outDir` 决定构建产物放在哪里。

### 技术意义

清楚的项目结构能避免源码和编译产物混在一起。库项目和应用项目都应该把 `src` 和 `dist` 分开。

### 文件结构

```txt
01-project-structure/
  src/domain/product.ts
  src/index.ts
  tsconfig.json
```

### `src/domain/product.ts`

```ts
// Goal:
// Define a domain module under src.

// Expected result:
// The compiled output keeps the domain directory structure.

export type ProductRecord = {
  id: string;
  title: string;
};

export function createProduct(id: string, title: string): ProductRecord {
  return { id, title };
}
```

### `src/index.ts`

```ts
// Goal:
// Re-export the public API from src.

export { createProduct } from "./domain/product.js";
export type { ProductRecord } from "./domain/product.js";
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "strict": true
  },
  "include": ["src"]
}
```

### 观察目标

```txt
Expected output:
  dist/domain/product.js
  dist/domain/product.d.ts
  dist/index.js
  dist/index.d.ts
```

### 常见错误

```txt
Mistake:
  Let emitted JavaScript appear next to source files.

Correct:
  Use outDir so source and build artifacts stay separated.
```

---

## 7. 02：构建产物：JavaScript、声明文件和映射文件

### 结论

一次 TypeScript 构建可能产生四类产物：`.js`、`.d.ts`、`.js.map`、`.d.ts.map`。

### 技术意义

不同产物服务不同消费者：

```txt
.js:
  runtime consumes it.

.d.ts:
  TypeScript consumers and editors consume it.

.js.map:
  debugger consumes it.

.d.ts.map:
  editor navigation consumes it across project or package boundaries.
```

### 文件结构

```txt
02-build-artifacts/
  src/index.ts
  tsconfig.json
  artifactNotes.md
```

### `src/index.ts`

```ts
// Goal:
// Produce JavaScript, declaration files, and source maps.

// Expected result:
// Build outputs include runtime and type artifacts.

export type UserRecord = {
  id: string;
  email: string;
};

export function normalizeEmail(user: UserRecord): string {
  return user.email.trim().toLowerCase();
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true
  },
  "include": ["src"]
}
```

### `artifactNotes.md`

```txt
Build:
  npx tsc -p tsconfig.json

Inspect:
  dist/index.js
  dist/index.d.ts
  dist/index.js.map
  dist/index.d.ts.map
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 只发布 `.d.ts` 就能运行 | 运行时需要 `.js`。 |
| 只发布 `.js` 就有完整 TS 体验 | TS 消费者需要 `.d.ts`。 |
| source map 是必须发布的业务文件 | 它主要用于调试，是否发布取决于包策略。 |

---

## 8. 03：target、lib、module 和 moduleResolution

### 结论

`target` 控制输出 JavaScript 语法级别；`lib` 控制可见标准库类型；`module` 控制模块输出或语义；`moduleResolution` 控制 import 如何解析到文件。

### 技术意义

构建配置必须和运行环境匹配。Node、浏览器和 bundler 项目不能盲目复用同一个配置。

### 文件结构

```txt
03-target-lib-module/
  src/runtimeFeatures.ts
  targetDoesNotPolyfill.ts
  tsconfig.node.json
  tsconfig.browser.json
  moduleResolutionTrace.md
  configComparison.md
```

### `src/runtimeFeatures.ts`

```ts
// Goal:
// Use features whose availability depends on runtime and lib choices.

// Expected result:
// The file type-checks when the correct lib is selected.

export async function readResponseTitle(response: Response): Promise<string> {
  const value: unknown = await response.json();

  if (typeof value === "object" && value !== null && "title" in value) {
    const candidate = value as { title: unknown };

    if (typeof candidate.title === "string") {
      return candidate.title;
    }
  }

  throw new Error("Invalid response");
}
```

### `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

### 本节补充：`target` 不提供 polyfill

`target` 主要控制输出语法能降到哪个 ECMAScript 版本；它不会给运行时补上缺失的 API。`lib` 只决定类型系统能看见哪些标准库声明，也不会提供真实实现。

### `targetDoesNotPolyfill.ts`

```ts
// Goal:
// Show that target does not provide runtime polyfills.

// Expected result:
// The compiler may accept this when the selected lib contains replaceAll.

export function slugifyTitle(titleText: string): string {
  return titleText.replaceAll(" ", "-").toLowerCase();
}

console.log(slugifyTitle("Gaming Keyboard"));
```

这段代码如果在缺少 `String.prototype.replaceAll` 的旧运行时里执行，TypeScript 不会自动帮你补 polyfill。真正的 runtime capability 来自 Node、浏览器或 polyfill 工具链。

### `tsconfig.browser.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

### 观察目标

```txt
Run:
  npx tsc -p tsconfig.node.json
  npx tsc -p tsconfig.browser.json

Question:
  Which config knows the Response type without extra dependencies?
```

### `moduleResolutionTrace.md`

```txt
Commands:
  npx tsc -p tsconfig.node.json --showConfig
  npx tsc -p tsconfig.node.json --explainFiles
  npx tsc -p tsconfig.node.json --traceResolution

Questions:
  Which moduleResolution mode is active?
  Which file satisfies each import specifier?
  Did TypeScript resolve a source file or a declaration file?
  Does the runtime support the same path?
```

`moduleResolution` 的核心不是“找得到类型就结束”，而是 TypeScript 要模拟宿主环境的路径解析，同时找到能提供类型信息的 `.ts`、`.d.ts` 或 `.js` 文件。构建错误里大量问题来自这两层不一致。

### 常见错误

```txt
Mistake:
  target and lib are the same setting.

Correct:
  target controls emitted syntax.
  lib controls available type declarations.
```

---

## 9. 04：源码映射 source map 和调试边界

### 结论

`sourceMap` 生成 `.js.map` 文件，让调试器可以把运行中的 JavaScript 位置映射回 TypeScript 源码位置。

### 技术意义

运行时执行的是 `.js`。source map 不改变执行逻辑，只改变调试器和错误定位工具如何显示源位置。

### 文件结构

```txt
04-source-maps/
  src/errorStack.ts
  tsconfig.json
  debugNotes.md
  inlineSourcesBoundary.md
```

### `src/errorStack.ts`

```ts
// Goal:
// Emit source maps for runtime debugging.

// Expected result:
// The emitted JavaScript references a source map file.

export function failWithProductId(productId: string): never {
  throw new Error(`Invalid product:${productId}`);
}

failWithProductId("p1");
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true,
    "strict": true
  },
  "include": ["src"]
}
```

### 运行方式

```bash
npx tsc -p tsconfig.json
node --enable-source-maps dist/errorStack.js
```

### `debugNotes.md`

```txt
Inspect:
  dist/errorStack.js
  dist/errorStack.js.map

Question:
  Which file is executed by Node?
  Which file maps JavaScript positions back to TypeScript?
```

### 本节补充：`sourceMap`、`inlineSourceMap` 和 `inlineSources`

`sourceMap` 输出独立 `.js.map` 文件；`inlineSourceMap` 把 source map 内容嵌入 `.js` 文件；`inlineSources` 把原始 `.ts` 源码内容嵌入 source map。它们都只影响调试映射，不改变运行时业务逻辑。

### `inlineSourcesBoundary.md`

```txt
sourceMap:
  Emits a separate .js.map file.

inlineSourceMap:
  Embeds the source map into the emitted .js file.

inlineSources:
  Embeds original source text into the source map.

Runtime rule:
  JavaScript execution is unchanged.
```

发布库时是否带 source map、是否内联源码，是调试体验、包体积和源码暴露之间的取舍。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| source map 会让 Node 执行 TS 文件 | Node 仍然执行 JS。 |
| 生产包一定要带 source map | 要根据调试、源码暴露和包体积策略决定。 |
| 错误栈一定自动指向 TS | Node 运行时需要 source map 支持或工具链支持。 |

---

## 10. 05：declaration、declarationMap 和类型入口

### 结论

`declaration` 生成 `.d.ts`，给外部 TypeScript 项目描述你的公共 API；`declarationMap` 生成 `.d.ts.map`，改善编辑器跨包跳转体验。

### 技术意义

如果你要发布库，运行时入口和类型入口必须对应。消费者 import 的运行时模块，应该能找到匹配的类型声明。

### 文件结构

```txt
05-declarations/
  src/publicApi.ts
  tsconfig.json
  declarationNotes.md
```

### `src/publicApi.ts`

```ts
// Goal:
// Emit declaration files for a public API.

// Expected result:
// The generated declaration describes exported types and functions.

export type PriceValue = {
  currencyCode: "USD" | "EUR";
  amountCents: number;
};

export function formatPrice(value: PriceValue): string {
  return `${value.currencyCode}:${value.amountCents}`;
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "strict": true
  },
  "include": ["src"]
}
```

### `declarationNotes.md`

```txt
Inspect:
  dist/publicApi.d.ts
  dist/publicApi.d.ts.map

Questions:
  Which exported names appear?
  Which local helper names disappear?
```

### 常见错误

```txt
Mistake:
  Declaration files describe every internal detail.

Correct:
  Declarations describe the exported API surface.
  Non-exported helpers usually do not appear.
```

---

## 11. 06：noEmit、noEmitOnError 和类型检查模式

### 结论

`noEmit` 适合“只检查类型，不输出文件”；`noEmitOnError` 适合“有错误就不要输出不可信产物”。

### 技术意义

前端 bundler 项目常用 `tsc --noEmit` 只做类型检查，让 Vite、Next.js、esbuild 或 swc 负责输出。库项目则通常需要 `tsc` 输出 `.js` 和 `.d.ts`。

### 文件结构

```txt
06-emit-modes/
  src/brokenTypes.ts
  tsconfig.typecheck.json
  tsconfig.emit.json
  tsconfig.declaration-only.json
```

### `src/brokenTypes.ts`

```ts
// Goal:
// Show why noEmitOnError protects build artifacts.

// Expected result:
// The compiler rejects the invalid assignment.

export type ProductRecord = {
  id: string;
  title: string;
};

const product: ProductRecord = {
  id: "p1",
  // @ts-expect-error: title must be a string.
  title: 123,
};

console.log(product.id);
```

### `tsconfig.typecheck.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

### `tsconfig.emit.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noEmitOnError": true
  },
  "include": ["src"]
}
```

### 本节补充：`emitDeclarationOnly` 是“只交付类型入口”的模式

`emitDeclarationOnly` 不输出 JavaScript，只输出 `.d.ts`。它适合“运行时代码由别的工具输出，但类型声明仍由 `tsc` 生成”的库构建流程。

### `tsconfig.declaration-only.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "types",
    "declaration": true,
    "emitDeclarationOnly": true,
    "strict": true
  },
  "include": ["src"]
}
```

不要把 `emitDeclarationOnly` 当成完整 build。它不能提供 runtime `.js` 文件，必须和 bundler、swc、esbuild、Babel 或另一套 JS 输出流程配合。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `noEmit` 是构建失败 | 它是故意只检查，不输出。 |
| 有 TS 错误也能发布产物 | 库项目应使用 `noEmitOnError`。 |
| bundler 项目不需要 tsc | bundler 转译快，但类型检查仍然需要 `tsc --noEmit`。 |

---

## 12. 07：incremental、tsBuildInfoFile 和构建缓存

### 结论

`incremental` 让 TypeScript 保存上次构建的项目图信息，后续构建可以复用这些信息。生成的 `.tsbuildinfo` 不是运行时代码。

### 技术意义

大型项目重复全量检查很慢。增量构建让 TypeScript 记录哪些文件和依赖关系发生过变化，从而加快后续构建。

### 文件结构

```txt
07-incremental-build/
  src/index.ts
  tsconfig.json
  cacheNotes.md
```

### `src/index.ts`

```ts
// Goal:
// Enable incremental builds and inspect build info output.

// Expected result:
// The compiler creates a build info file.

export function createBuildLabel(valueText: string): string {
  return `build:${valueText}`;
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "incremental": true,
    "tsBuildInfoFile": "dist/.tsbuildinfo",
    "strict": true
  },
  "include": ["src"]
}
```

### `cacheNotes.md`

```txt
Build twice:
  npx tsc -p tsconfig.json
  npx tsc -p tsconfig.json

Inspect:
  dist/.tsbuildinfo

Rule:
  This file can be deleted and regenerated.
  Do not treat it as runtime code.
```

### 常见错误

```txt
Mistake:
  .tsbuildinfo is required by the JavaScript runtime.

Correct:
  It is compiler cache data.
```

---

## 13. 08：项目引用 project references

### 结论

项目引用把一个 TypeScript 工程拆成多个可独立构建的小项目。被引用项目必须启用 `composite`，并通常需要输出 `.d.ts`。

### 技术意义

项目引用解决大型项目的构建顺序、类型边界和增量构建问题。依赖项目消费的是被依赖项目输出的声明文件，而不是随便穿透源码。

### 文件结构

```txt
08-project-references/
  packages/contracts/src/index.ts
  packages/contracts/tsconfig.json
  packages/core/src/index.ts
  packages/core/tsconfig.json
  projectReferenceBoundaryNotes.md
```

### `packages/contracts/src/index.ts`

```ts
// Goal:
// Define a referenced contract project.

// Expected result:
// This project emits declarations for dependent projects.

export type ProductRecord = {
  id: string;
  title: string;
};
```

### `packages/contracts/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true
  },
  "include": ["src"]
}
```

### `packages/core/src/index.ts`

```ts
// Goal:
// Consume declarations from a referenced project.

// Expected result:
// Build mode builds contracts before core.

import type { ProductRecord } from "../../contracts/dist/index.js";

export function renderProduct(product: ProductRecord): string {
  return product.title.toUpperCase();
}
```

### `packages/core/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "strict": true
  },
  "references": [
    { "path": "../contracts" }
  ],
  "include": ["src"]
}
```

### 本节补充：project reference 是构建图，不是路径别名

`references` 告诉 `tsc --build` 项目之间的构建顺序和依赖关系。它不会自动让你写任意 import specifier 都能运行；运行时路径、包入口或路径别名仍然要单独设计。

### `projectReferenceBoundaryNotes.md`

```txt
Project reference:
  Describes build dependency between projects.

Runtime import path:
  Describes how Node or a bundler loads JavaScript.

Declaration consumption:
  Dependent projects normally consume built .d.ts outputs.

Build rule:
  Use tsc -b for referenced projects.
```

因此，project references 解决的是构建顺序和类型边界，不替代 `package.json` exports、workspace package 名称、路径别名或 bundler 配置。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| project reference 只是路径别名 | 它是构建图关系。 |
| referenced project 不需要输出声明 | 依赖项目通常通过 `.d.ts` 理解引用项目 API。 |
| 普通 `tsc -p` 会自动构建所有依赖 | 多项目引用应该使用 `tsc --build`。 |

---

## 14. 09：solution tsconfig 和 tsc --build

### 结论

solution `tsconfig.json` 通常不包含源码，只包含 `references`，作为整个工作区的构建入口。`tsc --build` 会按引用图顺序构建过期项目。

### 技术意义

这是真实 monorepo 和多包项目的核心模型。根配置负责组织项目图，子项目配置负责自己的输入输出。

### 文件结构

```txt
09-solution-build/
  tsconfig.json
  packages/contracts/tsconfig.json
  packages/core/tsconfig.json
  apps/cli/tsconfig.json
```

### 根 `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./packages/contracts" },
    { "path": "./packages/core" },
    { "path": "./apps/cli" }
  ]
}
```

### `apps/cli/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "strict": true
  },
  "references": [
    { "path": "../../packages/contracts" },
    { "path": "../../packages/core" }
  ],
  "include": ["src"]
}
```

### 运行方式

```bash
npx tsc -b
npx tsc -b --verbose
npx tsc -b --clean
npx tsc -b --force
```

### 常见错误

```txt
Mistake:
  Put all files in the root solution tsconfig.

Correct:
  The solution config usually has files as an empty array and references child projects.
```

---

## 15. 10：监控错误 watch mode

### 结论

watch mode 让 TypeScript 持续监控文件变化，自动重新检查或构建。它适合开发时快速发现错误，不等同于生产构建流程。

### 技术意义

watch mode 关注反馈速度。生产构建仍然应该跑一次干净的 `tsc -b` 或 CI 构建，避免本地状态、缓存和未保存文件造成误判。

### 文件结构

```txt
10-watch-mode/
  src/index.ts
  tsconfig.json
  watchNotes.md
```

### `src/index.ts`

```ts
// Goal:
// Use watch mode to observe errors after edits.

// Expected result:
// The watcher reports changes and new errors.

export function formatWatchLabel(valueText: string): string {
  return `watch:${valueText}`;
}

console.log(formatWatchLabel("ready"));
```

### 运行方式

```bash
npx tsc -p tsconfig.json --watch
npx tsc -b --watch --verbose
```

### `watchNotes.md`

```txt
Edit:
  Change a string parameter to a number parameter.
  Save the file.
  Observe the watch output.

Questions:
  Did TypeScript rebuild or only recheck?
  Which project changed?
  Did emitted files update?
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| watch mode 是 CI 构建替代品 | CI 仍然需要 clean build。 |
| watch 只适合输出 JS | 它也适合 `--noEmit` 类型检查。 |
| watch 报错可以忽略 | 开发阶段错误会流向后续构建风险。 |

---

## 16. 11：在服务器中运行 TypeScript

### 结论

服务器运行时通常执行编译后的 JavaScript。你可以用开发工具直接运行 TS，但必须知道那是额外工具链，不是 TypeScript 类型系统本身。

### 技术意义

Node 运行的是 JavaScript 模块。TypeScript 的工作是检查和输出；服务器入口要对齐 `module`、`package.json type`、文件扩展名和 Node 版本。

### 文件结构

```txt
11-server-runtime/
  src/serverEntry.ts
  tsconfig.node.json
  package.json
  directTsRuntimeBoundary.md
```

### `src/serverEntry.ts`

```ts
// Goal:
// Build and run a TypeScript server entry as JavaScript.

// Expected result:
// Node runs the emitted JavaScript file.

import { createServer } from "node:http";

const server = createServer((request, response) => {
  void request;

  response.statusCode = 200;
  response.setHeader("content-type", "text/plain");
  response.end("ready");
});

server.listen(3000, () => {
  console.log("server-ready");
});
```

### `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### `package.json`

```json
{
  "type": "module",
  "scripts": {
    "build:node": "tsc -p tsconfig.node.json",
    "start": "node --enable-source-maps dist/serverEntry.js"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

### 本节补充：直接运行 TypeScript 的工具是额外运行层

开发中你会看到 `tsx`、`ts-node`、运行时 loader 或框架 dev server 直接执行 `.ts`。这不等于 Node 原生理解 TypeScript 类型语法。那些工具会在运行前做转译、加载或注册 hook，并且很多情况下不等同于完整 `tsc` 类型检查。

### `directTsRuntimeBoundary.md`

```txt
Normal production path:
  TypeScript source
  tsc or build tool
  emitted JavaScript
  Node runtime

Direct TypeScript runtime tool:
  TypeScript source
  runtime transform layer
  JavaScript execution

Rule:
  Know whether the tool type-checks or only transpiles.
```

生产脚本里更稳定的基本路径仍然是：先构建，再运行输出的 JavaScript。开发工具可以提高反馈速度，但不能让你忘记最终交付物是什么。

### 常见错误

```txt
Mistake:
  Node type declarations make Node run TypeScript directly.

Correct:
  @types/node only provides static types.
  Runtime still executes JavaScript or a TS-aware runtime tool.
```

---

## 17. 12：在浏览器中运行 TypeScript

### 结论

浏览器不直接执行 TypeScript 类型语法。浏览器项目通常由 bundler、framework compiler 或 `tsc` 输出 JavaScript 后再运行。

### 技术意义

浏览器配置要包含 DOM 类型库，模块输出要适合浏览器或 bundler。实际工程中，Vite / Next.js / Angular CLI / Webpack 等工具通常负责转译、打包和热更新。

### 文件结构

```txt
12-browser-runtime/
  src/browserEntry.ts
  index.html
  tsconfig.browser.json
  browserNotes.md
  tscDoesNotBundle.md
```

### `src/browserEntry.ts`

```ts
// Goal:
// Build a browser entry file with DOM types.

// Expected result:
// The source type-checks with DOM lib enabled.

const rootElement = document.querySelector("#app");

if (rootElement === null) {
  throw new Error("Missing app element");
}

rootElement.textContent = "browser-ready";
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>TypeScript Browser Build</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="./dist/browserEntry.js"></script>
  </body>
</html>
```

### `tsconfig.browser.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### `browserNotes.md`

```txt
Questions:
  Does the browser load .ts or .js?
  Which config makes document available?
  Which tool serves index.html and dist files?
```

### 本节补充：`tsc` 不是 bundler

`tsc` 可以把 TypeScript 转成 JavaScript，也可以保留或转换模块语法，但它不会像 Vite、Webpack、Rollup 那样把整个应用依赖图打成浏览器可部署 bundle。

### `tscDoesNotBundle.md`

```txt
tsc:
  Type-checks TypeScript.
  Emits JavaScript and declaration files.
  Does not bundle dependencies into one browser asset graph.

Bundler:
  Resolves runtime asset graph.
  Bundles or code-splits modules.
  Handles CSS, images, environment replacement, and dev server behavior.
```

所以浏览器项目常见组合是：`tsc --noEmit` 做类型检查，bundler 或框架工具做转译、打包和开发服务器。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 浏览器可以直接运行 `.ts` | 浏览器运行 JS，TS 需要编译或工具链转译。 |
| Node 配置能直接给浏览器用 | 浏览器需要 DOM lib 和适合浏览器的 module 策略。 |
| `lib: ["DOM"]` 会提供运行时 DOM | 它只提供类型声明，真正 DOM 来自浏览器。 |

---

## 18. 13：发布到 NPM：package.json 和 dist 结构

### 结论

发布 NPM 包时，`package.json` 必须清楚指向运行时入口和类型入口；`files` 或 `.npmignore` 必须控制发布内容。

### 技术意义

消费者安装的是你的发布包，不是你的源码仓库。包内必须包含运行所需的 `.js` 和类型检查所需的 `.d.ts`，并且入口路径要对得上。

### 文件结构

```txt
13-npm-publishing/
  src/index.ts
  package.json
  packageExportsBoundary.json
  tsconfig.json
  npmPackNotes.md
```

### `src/index.ts`

```ts
// Goal:
// Create a minimal public package entry.

// Expected result:
// The package exports runtime and type APIs.

export type FormatInput = {
  title: string;
};

export function formatTitle(input: FormatInput): string {
  return input.title.trim().toUpperCase();
}
```

### `package.json`

```json
{
  "name": "@learning-lab/formatting",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "prepack": "npm run build",
    "pack:dry": "npm pack --dry-run"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### 本节补充：`exports` 是包的真实公共入口表

现代包不要只看 `main` 和 `types`。一旦配置 `exports`，消费者能不能 import 某个路径，主要取决于 `exports` 是否公开了这个入口。类型入口也要和运行时入口逐项对应。

### `packageExportsBoundary.json`

```json
{
  "name": "@learning-lab/formatting",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./formatters": {
      "types": "./dist/formatters.d.ts",
      "import": "./dist/formatters.js"
    }
  }
}
```

如果 `exports` 没有暴露 `./internal`，消费者就不应该依赖这个路径。这样你才能重构内部文件而不破坏公共 API。

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noEmitOnError": true
  },
  "include": ["src"]
}
```

### `npmPackNotes.md`

```txt
Run:
  npm run build
  npm pack --dry-run

Inspect:
  package file list
  dist/index.js
  dist/index.d.ts
  package.json entry fields
```

### 常见错误

```txt
Mistake:
  Publish src only and expect consumers to compile it.

Correct:
  Publish the runtime files and type declarations you intend consumers to use.
```

---

## 19. 14：发布声明文件和类型版本边界

### 结论

声明文件是你的类型级公共 API。发布包时，声明文件必须和实际 JavaScript 行为一致。

### 技术意义

如果 `.d.ts` 说函数接受 `string`，但运行时函数实际要求对象，消费者会获得错误安全感。类型发布不是文档装饰，而是契约。

### 文件结构

```txt
14-type-publishing/
  src/index.ts
  package.json
  tsconfig.json
  typeEntryNotes.md
  declarationRuntimeDrift.ts
```

### `src/index.ts`

```ts
// Goal:
// Keep runtime behavior and declaration output aligned.

// Expected result:
// The emitted declaration matches the exported function.

export function parseInteger(inputText: string): number {
  const parsedValue = Number.parseInt(inputText, 10);

  if (Number.isNaN(parsedValue)) {
    throw new Error("Invalid integer");
  }

  return parsedValue;
}
```

### `typeEntryNotes.md`

```txt
Check:
  package.json types field
  package.json exports ".".types field
  emitted dist/index.d.ts
  runtime dist/index.js

Question:
  Does every public runtime export have a matching type declaration?
```

### 本节补充：声明文件不能比运行时“更漂亮”

`.d.ts` 是类型契约，不是愿望清单。声明文件写得比实现更理想，会让消费者在编译期获得错误安全感，然后在运行时踩坑。

### `declarationRuntimeDrift.ts`

```ts
// Goal:
// Document the risk of declaration and runtime drift.

export type PublishedApiCheck = {
  runtimeEntry: string;
  declarationEntry: string;
  mustMatch: true;
};

const check: PublishedApiCheck = {
  runtimeEntry: "./dist/index.js",
  declarationEntry: "./dist/index.d.ts",
  mustMatch: true,
};

console.log(check.runtimeEntry);
```

发布前至少检查三件事：源码导出、`dist` 运行时导出、`.d.ts` 类型导出是否一致；再用一个临时消费者从包入口 import，而不是只从源码路径 import。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `.d.ts` 可以随便写得比实现更理想 | 声明必须描述真实运行时 API。 |
| 只测试源码 import | 还要测试从打包后的 package 入口 import。 |
| types 字段可以指向源码 `.ts` | 发布包通常指向输出 `.d.ts`。 |

---

## 20. 15：三斜线指令 reference types

### 结论

`/// <reference types="..." />` 在声明文件中声明对某个类型包的依赖。普通 `.ts` 文件通常优先使用 `tsconfig` 的 `types` 配置。

### 技术意义

三斜线指令是给编译器的特殊文件顶部指令，不是普通注释。它主要出现在声明文件、旧项目和少数特殊类型依赖场景。

### 文件结构

```txt
15-triple-slash-types/
  node-env.d.ts
  nodeConsumer.ts
  typesDirectiveNotes.md
```

### `node-env.d.ts`

```ts
/// <reference types="node" />

export type RuntimeProcessId = typeof process.pid;
```

### `nodeConsumer.ts`

```ts
// Goal:
// Consume a type that depends on a referenced type package.

// Expected result:
// The declaration file can mention Node globals.

import type { RuntimeProcessId } from "./node-env.js";

const processId: RuntimeProcessId = process.pid;

console.log(processId);
```

### `typesDirectiveNotes.md`

```txt
Rule:
  Use reference types mainly in declaration files.
  Use tsconfig types for normal project-level type package control.

Placement:
  Triple-slash directives must be at the top of the file.
```

### 常见错误

```txt
Mistake:
  Put triple-slash directives anywhere in a file.

Correct:
  They only have directive meaning when placed at the top before statements.
```

---

## 21. 16：三斜线指令 amd-module

### 结论

`/// <amd-module name="..." />` 用于给 AMD 输出指定模块名。它是历史模块格式相关能力，现代项目通常不主动使用。

### 技术意义

书上保留这个主题是为了让你能读懂旧项目和老式构建输出。现代前端工程通常使用 ES Modules 和 bundler，不需要 AMD 命名模块。

### 文件结构

```txt
16-triple-slash-amd/
  amdModule.ts
  tsconfig.amd.json
  amdNotes.md
```

### `amdModule.ts`

```ts
/// <amd-module name="LearningAmdModule" />

// Goal:
// Compile a named AMD module for historical understanding.

// Expected result:
// The emitted AMD define call includes the module name.

export function createAmdLabel(valueText: string): string {
  return `amd:${valueText}`;
}
```

### `tsconfig.amd.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "AMD",
    "outDir": "dist-amd",
    "strict": true
  },
  "include": ["amdModule.ts"]
}
```

### 运行方式

```bash
npx tsc -p tsconfig.amd.json
```

### `amdNotes.md`

```txt
Inspect:
  dist-amd/amdModule.js

Question:
  Where does the AMD module name appear?
  Why is this not a default choice for modern frontend projects?
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| AMD 是现代默认模块方案 | 现代项目优先 ESM 和 bundler。 |
| `amd-module` 影响所有模块格式 | 它只和 AMD 输出有关。 |
| 学到这个就要在项目里用 | 这是历史兼容知识。 |

---

## 22. 17：小项目整合

### 结论

本章小项目要做一个小型 monorepo：`contracts` 输出公共类型，`core` 输出运行时函数，`cli` 消费它们；根 `tsconfig` 用 project references 统一构建；根 `package.json` 提供 build、watch、pack dry-run 脚本。

### 技术意义

这个小项目把本章核心全部连起来：

```txt
source layout
  -> build artifacts
  -> declaration output
  -> project references
  -> solution build
  -> Node runtime
  -> package entry points
```

### 文件结构

```txt
17-mini-project/
  packages/contracts/src/index.ts
  packages/contracts/tsconfig.json
  packages/core/src/index.ts
  packages/core/tsconfig.json
  apps/cli/src/main.ts
  apps/cli/tsconfig.json
  tsconfig.json
  package.json
```

### `packages/contracts/src/index.ts`

```ts
// Goal:
// Define shared public contract types.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };
```

### `packages/contracts/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true
  },
  "include": ["src"]
}
```

### `packages/core/src/index.ts`

```ts
// Goal:
// Implement runtime functions that consume contract types.

import type { ProductRecord, Result } from "../../contracts/dist/index.js";

export type FormatError = {
  kind: "invalid-price";
};

export function formatProduct(
  product: ProductRecord,
): Result<string, FormatError> {
  if (product.priceCents < 0) {
    return { ok: false, error: { kind: "invalid-price" } };
  }

  return {
    ok: true,
    value: `${product.title}:${product.priceCents}`,
  };
}
```

### `packages/core/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true
  },
  "references": [
    { "path": "../contracts" }
  ],
  "include": ["src"]
}
```

### `apps/cli/src/main.ts`

```ts
// Goal:
// Run emitted JavaScript from a TypeScript CLI app.

import { formatProduct } from "../../../packages/core/dist/index.js";

const result = formatProduct({
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
});

if (result.ok) {
  console.log(result.value);
} else {
  console.log(result.error.kind);
}
```

### `apps/cli/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "strict": true,
    "types": ["node"]
  },
  "references": [
    { "path": "../../packages/contracts" },
    { "path": "../../packages/core" }
  ],
  "include": ["src"]
}
```

### 根 `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./packages/contracts" },
    { "path": "./packages/core" },
    { "path": "./apps/cli" }
  ]
}
```

### 根 `package.json`

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc -b",
    "build:verbose": "tsc -b --verbose",
    "watch": "tsc -b --watch --verbose",
    "clean": "tsc -b --clean",
    "start": "node apps/cli/dist/main.js"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 根 `tsconfig.json` 定义 solution build 入口。 |
| 2 | `contracts` 是底层项目，输出 `.d.ts`。 |
| 3 | `core` 引用 `contracts`，并输出运行时函数。 |
| 4 | `cli` 引用两个项目，并运行最终 JS。 |
| 5 | `tsc -b` 按引用图决定构建顺序。 |
| 6 | Node 执行 `apps/cli/dist/main.js`。 |
| 7 | `.d.ts` 服务编辑器和类型检查，不参与运行。 |

### 常见错误

```txt
Mistake:
  Run the CLI before building referenced projects.

Correct:
  Build the solution first so dependent dist files and declarations exist.
```

---

## 23. 最终文件清单

```txt
typescript/
  chapter-12-build-run/
    README.md

    00-build-runtime-model/
      src/index.ts
      tsconfig.json
      inspectBuild.md
      tscDiagnosticCommands.md

    01-project-structure/
      src/domain/product.ts
      src/index.ts
      tsconfig.json

    02-build-artifacts/
      src/index.ts
      tsconfig.json
      artifactNotes.md

    03-target-lib-module/
      src/runtimeFeatures.ts
      targetDoesNotPolyfill.ts
      tsconfig.node.json
      tsconfig.browser.json
      moduleResolutionTrace.md
      configComparison.md

    04-source-maps/
      src/errorStack.ts
      tsconfig.json
      debugNotes.md
      inlineSourcesBoundary.md

    05-declarations/
      src/publicApi.ts
      tsconfig.json
      declarationNotes.md

    06-emit-modes/
      src/brokenTypes.ts
      tsconfig.typecheck.json
      tsconfig.emit.json
      tsconfig.declaration-only.json

    07-incremental-build/
      src/index.ts
      tsconfig.json
      cacheNotes.md

    08-project-references/
      packages/contracts/src/index.ts
      packages/contracts/tsconfig.json
      packages/core/src/index.ts
      packages/core/tsconfig.json
      projectReferenceBoundaryNotes.md

    09-solution-build/
      tsconfig.json
      packages/contracts/tsconfig.json
      packages/core/tsconfig.json
      apps/cli/tsconfig.json

    10-watch-mode/
      src/index.ts
      tsconfig.json
      watchNotes.md

    11-server-runtime/
      src/serverEntry.ts
      tsconfig.node.json
      package.json
      directTsRuntimeBoundary.md

    12-browser-runtime/
      src/browserEntry.ts
      index.html
      tsconfig.browser.json
      browserNotes.md
      tscDoesNotBundle.md

    13-npm-publishing/
      src/index.ts
      package.json
      packageExportsBoundary.json
      tsconfig.json
      npmPackNotes.md

    14-type-publishing/
      src/index.ts
      package.json
      tsconfig.json
      typeEntryNotes.md
      declarationRuntimeDrift.ts

    15-triple-slash-types/
      node-env.d.ts
      nodeConsumer.ts
      typesDirectiveNotes.md

    16-triple-slash-amd/
      amdModule.ts
      tsconfig.amd.json
      amdNotes.md

    17-mini-project/
      packages/contracts/src/index.ts
      packages/contracts/tsconfig.json
      packages/core/src/index.ts
      packages/core/tsconfig.json
      apps/cli/src/main.ts
      apps/cli/tsconfig.json
      tsconfig.json
      package.json

notes/
  typescript.md
```

---

## 24. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### Topic name

Conclusion:
Explain what problem it solves.

Technical meaning:
Explain what TypeScript checks, emits, or records.

Runtime mechanism:
Explain what Node, browser, bundler, debugger, or npm actually consumes.

Code example:
Keep one example that proves the mechanism.

Common mistake:
Write one mistake you personally may make.

Project relation:
Connect it to CLI apps, browser apps, libraries, monorepos, npm packages, or debugging.
```

最终笔记必须包含这些对比：

```txt
typecheck vs build
source file vs emitted file
.js vs .d.ts vs .js.map vs .tsbuildinfo
rootDir vs outDir
target vs lib
target vs runtime polyfill
module vs moduleResolution
NodeNext vs Bundler
tsc vs bundler
sourceMap vs inlineSourceMap vs inlineSources
sourceMap vs declarationMap
declaration vs emitDeclarationOnly
noEmit vs noEmitOnError
incremental vs project references
tsc -p vs tsc -b
single project tsconfig vs solution tsconfig
watch build vs clean build
Node runtime vs browser runtime
TypeScript source vs runtime JavaScript
package main vs package types
exports import condition vs exports types condition
package exports public entry vs internal file path
direct TypeScript runtime tool vs emitted JavaScript runtime
bundled types vs DefinitelyTyped
reference types directive vs tsconfig types
amd-module directive vs ES module name
```

---

## 25. 本章最终要能回答的问题

学完第 12 章后，你必须能不用查资料回答这些问题：

1. 构建 TypeScript 项目到底产出什么？
2. 类型检查和编译输出有什么区别？
3. `rootDir` 和 `outDir` 分别控制什么？
4. 为什么源码和构建产物不要混在同一目录？
5. `.js`、`.d.ts`、`.js.map`、`.d.ts.map` 分别给谁使用？
6. `target` 控制什么？
7. `lib` 控制什么？
8. 为什么 `target` 和 `lib` 不是同一个概念？
9. `module` 和 `moduleResolution` 有什么区别？
10. Node 项目和浏览器项目为什么配置不同？
11. source map 如何帮助调试？
12. Node 为什么仍然执行 `.js` 而不是 `.ts`？
13. `declaration` 生成的 `.d.ts` 代表什么？
14. `declarationMap` 对编辑器有什么价值？
15. `noEmit` 适合什么场景？
16. `noEmitOnError` 为什么适合库构建？
17. `incremental` 生成的 `.tsbuildinfo` 是什么？
18. `.tsbuildinfo` 能不能删除？
19. project references 解决什么问题？
20. 为什么 referenced project 要启用 `composite`？
21. `tsc -p` 和 `tsc -b` 有什么区别？
22. solution `tsconfig.json` 为什么常常写 `files: []`？
23. watch mode 适合什么，不适合什么？
24. 服务器中运行 TS 的推荐基本路径是什么？
25. 浏览器为什么不能直接运行 TS 类型语法？
26. NPM 包为什么需要同时提供 JS 入口和类型入口？
27. `package.json` 的 `main`、`types`、`exports` 分别解决什么？
28. `npm pack --dry-run` 检查什么？
29. 声明文件和真实运行时不一致会造成什么问题？
30. 三斜线指令必须放在哪里？
31. `/// <reference types="..." />` 和 tsconfig `types` 有什么关系？
32. `/// <amd-module />` 适合什么历史场景？
33. 为什么现代项目默认不应该依赖三斜线指令组织模块？
34. `tsc --showConfig`、`--explainFiles` 和 `--traceResolution` 分别适合诊断什么？
35. 为什么 `target` 不等于 runtime polyfill？
36. 为什么 `tsc` 不是 bundler？
37. 直接运行 `.ts` 的工具和先构建再运行 `.js` 有什么边界差异？
38. 为什么 package `exports` 会限制消费者可导入的路径？
39. 第 12 章如何把前面所有类型能力变成可运行、可调试、可发布的工程？

---

## 26. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)  
   重点读 What is a Project Reference、`composite`、`declarationMap`、Build Mode for TypeScript、Guidance。理解 `tsc -b` 为什么是多项目构建入口。

2. [TSConfig rootDir](https://www.typescriptlang.org/tsconfig/rootDir.html) 和 [TSConfig outDir](https://www.typescriptlang.org/tsconfig/outDir.html)  
   重点理解源码目录结构如何映射到输出目录结构。

3. [TSConfig target](https://www.typescriptlang.org/tsconfig/target.html) 和 [TSConfig lib](https://www.typescriptlang.org/tsconfig/lib.html)  
   重点理解输出语法级别和类型库可见性之间的区别。

4. [TSConfig module](https://www.typescriptlang.org/tsconfig/module.html) 和 [moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html)  
   复习第 10 章模块知识，理解构建产物和运行时模块系统必须对齐。

5. [TSConfig sourceMap](https://www.typescriptlang.org/tsconfig/sourceMap.html)  
   理解 `.js.map` 如何让调试器显示原始 TS 源码位置。

6. [TSConfig declaration](https://www.typescriptlang.org/tsconfig/declaration.html)、[declarationMap](https://www.typescriptlang.org/tsconfig/declarationMap.html)、[emitDeclarationOnly](https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html)  
   理解库项目如何输出类型入口。

7. [TSConfig composite](https://www.typescriptlang.org/tsconfig/composite.html)、[incremental](https://www.typescriptlang.org/tsconfig/incremental.html)、[tsBuildInfoFile](https://www.typescriptlang.org/tsconfig/tsBuildInfoFile.html)  
   理解项目引用和增量构建需要什么构建信息。

8. [TSConfig noEmitOnError](https://www.typescriptlang.org/tsconfig/noEmitOnError.html)  
   理解为什么发布产物时不应该在有错误的状态下继续输出。

9. [Declaration Files Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)  
   重点读 bundled declarations、`types` field、dependencies。理解 NPM 包如何暴露类型声明。

10. [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)  
    重点读 `reference types` 和 `amd-module`。理解它们是历史和声明文件相关工具，不是现代模块组织的默认方案。

---

## 27. 第 12 章最终记忆模型

```txt
Build and run TypeScript as an engineering pipeline.

Source:
  .ts
  .tsx
  .mts
  .cts
  .d.ts
  tsconfig
  package.json

Check:
  tsc creates a program
  resolves modules
  checks types
  validates project references

Emit:
  JavaScript for runtime
  declarations for consumers
  source maps for debugging
  build info for incremental compilation

Run:
  Node runs emitted JavaScript
  Browser runs emitted or bundled JavaScript
  Tools may run TypeScript directly only by adding their own runtime layer

Publish:
  npm package exposes runtime entry
  npm package exposes type entry
  dist content must match package metadata
  declarations must match runtime behavior

Scale:
  project references divide large systems
  tsc --build orchestrates dependency order
  watch mode gives development feedback
  clean build protects release correctness

Legacy:
  triple-slash directives are compiler directives
  reference types can declare type package dependencies
  amd-module names AMD output
  modern modules usually avoid triple-slash organization
```

### 最终一句话

第 3 章让你描述值的形状。第 4 章让你描述行为的边界。第 5 章让你描述对象的长期结构和抽象契约。第 6 章让你理解类型系统如何比较、缩小、派生、转换和保护类型。第 7 章让你把失败路径变成可读、可检查、可组合的代码结构。第 8 章让你把未来值、并发任务、异步序列和跨线程消息协议建模清楚。第 9 章让你把类型能力放进框架和前后端边界。第 10 章让你把所有这些代码拆成清晰、可维护、可重构的模块边界。第 11 章让你把真实世界的 JavaScript、第三方包和历史代码逐步接入 TypeScript 类型系统。第 12 章让你把 TypeScript 工程构建、运行、调试、发布并扩展到多项目结构。

真正的 TypeScript 构建学习，不是会敲 `tsc`，而是能分清源码、类型检查、编译输出、声明文件、源码映射、运行环境、项目引用和 NPM 发布入口之间的边界。

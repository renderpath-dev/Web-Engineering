# TypeScript 第 10 章“命名空间和模块”学习指导文件 v1

> 定位：这是 TypeScript 第 10 章“命名空间和模块”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` / `.mts` / `.cts` / `.d.ts` 文件、运行 `tsc` 类型检查、观察编译输出和运行结果，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 10 章“命名空间和模块”，TypeScript 官方 Handbook / Reference 的 Modules、Modules Reference、Namespaces、Namespaces and Modules、Declaration Merging，以及 TSConfig 官方文档中的 `module`、`moduleResolution`、`verbatimModuleSyntax`、`isolatedModules`、`esModuleInterop`、`allowSyntheticDefaultImports`、`paths`、`baseUrl`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解 JavaScript 模块的运行时加载机制，再理解 TypeScript 如何在模块边界上处理类型、值、声明合并和编译输出。不要把模块学成“import/export 语法速查表”。

> 重要说明：现代 TypeScript 项目默认优先使用 ES Modules。命名空间（namespace）主要用于理解历史代码、全局脚本、声明合并和 `.d.ts` 场景；不要在普通现代模块文件里再套一层 namespace。

> 本版补全：已按 TypeScript 官方 Modules Reference、Namespaces and Modules、Declaration Merging、TSConfig `module` / `moduleResolution` / `verbatimModuleSyntax` / `isolatedModules` 文档核对，新增 live binding、type-only import 擦除边界、`.d.ts` ambient module、NodeNext package `exports`、path alias 运行时边界、class + namespace merging 等容易断层的机制说明。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 模块定义、模块作用域、脚本模式、ESM 语法、CommonJS、模块解析、模块输出 | [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) |
| NodeNext、文件扩展名、package.json `type`、ESM / CJS 互操作、模块解析细节 | [Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) |
| namespace 术语、单文件 namespace、多文件 namespace、ambient namespace | [Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) |
| 现代代码中 modules vs namespaces、namespace 常见陷阱、无意义 namespace 包装 | [Namespaces and Modules](https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html) |
| interface / namespace / class / function / enum 的声明合并、module augmentation、global augmentation | [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) |
| `import type`、`export type`、type-only import/export | [TypeScript 3.8 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html) |
| `module` 如何控制输出模块格式，NodeNext / preserve / ES2022 等模式 | [TSConfig module](https://www.typescriptlang.org/tsconfig/module.html) |
| `moduleResolution` 如何把 import specifier 解析到文件 | [TSConfig moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html) |
| 保留模块语法，明确区分 type-only import/export | [TSConfig verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html) |
| 单文件转译限制，避免 namespace、const enum 等无法单文件安全转译的写法 | [TSConfig isolatedModules](https://www.typescriptlang.org/tsconfig/isolatedModules.html) |
| CommonJS 默认导入兼容性 | [TSConfig esModuleInterop](https://www.typescriptlang.org/tsconfig/esModuleInterop.html) / [allowSyntheticDefaultImports](https://www.typescriptlang.org/tsconfig/allowSyntheticDefaultImports.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 10 章完整学习顺序](#3-第-10-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：模块到底在解决什么问题](#5-00模块到底在解决什么问题)
6. [01：脚本模式和模块模式](#6-01脚本模式和模块模式)
7. [02：命名导出和默认导出](#7-02命名导出和默认导出)
8. [03：导入形式、重命名和 namespace import](#8-03导入形式重命名和-namespace-import)
9. [04：type-only import 和 export](#9-04type-only-import-和-export)
10. [05：re-export、barrel 文件和公共 API](#10-05re-exportbarrel-文件和公共-api)
11. [06：动态导入 dynamic import](#11-06动态导入-dynamic-import)
12. [07：副作用导入和模块求值顺序](#12-07副作用导入和模块求值顺序)
13. [08：CommonJS 和 ES Modules 互操作](#13-08commonjs-和-es-modules-互操作)
14. [09：AMD 和历史模块格式的定位](#14-09amd-和历史模块格式的定位)
15. [10：module、moduleResolution 和文件扩展名](#15-10modulemoduleresolution-和文件扩展名)
16. [11：NodeNext、package.json type、.mts 和 .cts](#16-11nodenextpackagejson-typemts-和-cts)
17. [12：路径别名 paths 和 baseUrl](#17-12路径别名-paths-和-baseurl)
18. [13：namespace 基础](#18-13namespace-基础)
19. [14：namespace 冲突、导出边界和编译输出](#19-14namespace-冲突导出边界和编译输出)
20. [15：声明合并 declaration merging](#20-15声明合并-declaration-merging)
21. [16：module augmentation 和 global augmentation](#21-16module-augmentation-和-global-augmentation)
22. [17：模块组织策略和小项目整合](#22-17模块组织策略和小项目整合)
23. [最终文件清单](#23-最终文件清单)
24. [最终学习笔记转换要求](#24-最终学习笔记转换要求)
25. [本章最终要能回答的问题](#25-本章最终要能回答的问题)
26. [TS 官方文档阅读清单](#26-ts-官方文档阅读清单)
27. [第 10 章最终记忆模型](#27-第-10-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个让你拆分文件、导入导出、观察模块作用域、理解编译输出和模块解析的训练指导。

第 10 章必须同时观察四件事：

```txt
JavaScript runtime:
  module loader locates files, executes dependencies, and gives each module its own scope.

TypeScript type system:
  imports and exports connect value space and type space across files.

Compiler output:
  module controls emitted JavaScript module format.

Module resolution:
  moduleResolution decides how an import path maps to files and declaration files.
```

模块学习的目标不是会写：

```ts
import { something } from "./somewhere.js";
```

而是你能解释：

```txt
这个 import 是值导入还是类型导入？
它会不会生成运行时代码？
它是静态导入还是动态导入？
它会触发被导入模块的顶层代码吗？
TypeScript 如何找到对应的 .ts / .d.ts 文件？
编译后会保留成 ESM，还是输出成 CommonJS？
这个文件是模块模式，还是脚本模式？
```

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. 先读结论。
2. 区分本节概念属于 module syntax、runtime loading、type-only boundary、module resolution、namespace、declaration merging 还是 compiler output。
3. 创建对应目录。
4. 写一个正确示例文件。
5. 写一个错误示例文件，优先用 @ts-expect-error 标记预期错误。
6. 运行 npx tsc --noEmit 做类型检查。
7. 涉及编译输出时运行 npx tsc --outDir dist，再查看 dist 文件。
8. 涉及 Node 运行时模块时，用 node 运行编译后的入口文件。
9. 对照执行过程表格解释每一步。
10. 把本节整理进最终学习笔记。
```

### 推荐 tsconfig

现代 TypeScript 学习阶段，本章推荐优先使用 NodeNext 语义，并显式打开模块相关选项：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noImplicitReturns": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

Node 专用示例需要：

```bash
npm install -D @types/node
```

如果你在 Vite / Next.js / 前端 bundler 项目里训练模块解析，可以另建 `tsconfig.bundler.json`：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true
  }
}
```

### 代码注释模板

每个 `.ts` / `.mts` / `.cts` / `.d.ts` 文件顶部都写英文注释：

```ts
// Goal:
// Verify how this TypeScript module example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`export {};` 的作用是把文件变成模块（module），防止不同练习文件里的同名变量污染全局作用域。

---

## 2. 项目重新整理建议

### 结论

第 10 章建议单独建立：

```txt
typescript/chapter-10-namespaces-modules/
```

第 10 章训练的是“文件之间如何连接”。它和前几章的关系是：前几章写的是一个文件内部的类型能力；第 10 章开始训练工程级代码组织。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json
  tsconfig.bundler.json
  tsconfig.namespace.json

  chapter-03-types/
  chapter-04-functions/
  chapter-05-classes-interfaces/
  chapter-06-advanced-types/
  chapter-07-error-handling/
  chapter-08-async-concurrency-parallelism/
  chapter-09-frameworks/

  chapter-10-namespaces-modules/
    README.md

    00-module-problem-model/
      moduleBoundaryOverview.ts
      privateModuleScope.ts

    01-script-vs-module/
      scriptModeA.ts
      scriptModeB.ts
      moduleModeA.ts
      moduleModeB.ts
      emptyExportBoundary.ts

    02-named-default-exports/
      productFormatter.ts
      productFormatterConsumer.ts
      defaultExportFormatter.ts
      defaultExportConsumer.ts

    03-import-forms/
      priceMath.ts
      renamedImportConsumer.ts
      namespaceImportConsumer.ts
      sideBySideImportConsumer.ts

    04-type-only-import-export/
      productTypes.ts
      productRuntime.ts
      importTypeConsumer.ts
      inlineTypeImportConsumer.ts
      typeOnlyImportValueMistake.ts

    05-re-export-barrel/
      contracts.ts
      validators.ts
      index.ts
      consumer.ts

    06-dynamic-import/
      lazyFormatter.ts
      dynamicImportConsumer.ts
      dynamicImportTypes.ts

    07-side-effect-import/
      registerGlobals.ts
      sideEffectConsumer.ts
      moduleEvaluationOrder.ts
      liveBindingProducer.ts
      liveBindingConsumer.ts

    08-commonjs-interop/
      commonjsExport.cjs
      commonjsConsumer.cts
      esModuleConsumer.mts
      importEqualsRequire.ts

    09-amd-history/
      amdOutputExample.ts
      amdPositioning.md

    10-module-resolution/
      relativeImportExtensions.ts
      declarationFileResolution.ts
      moduleResolutionNotes.md
      ambientCssModule.d.ts

    11-nodenext-files/
      package-type-module.json
      esmEntry.mts
      cjsEntry.cts
      extensionMistake.ts
      packageExportsBoundary.json

    12-paths-baseurl/
      tsconfig.paths.json
      productContract.ts
      aliasedImportConsumer.ts
      aliasRuntimeBoundary.ts

    13-namespaces/
      namespaceBasics.ts
      namespaceExportBoundary.ts
      nestedNamespace.ts

    14-namespace-output-conflicts/
      namespaceConflict.ts
      namespaceCompileOutput.ts
      needlessNamespaceInModule.ts

    15-declaration-merging/
      interfaceMerging.ts
      functionNamespaceMerge.ts
      enumNamespaceMerge.ts
      classNamespaceMerge.ts

    16-module-global-augmentation/
      observable.ts
      observableMap.ts
      observableConsumer.ts
      globalArrayExtension.ts

    17-mini-project/
      contracts.ts
      validators.ts
      formatters.ts
      errors.ts
      index.ts
      app.ts

notes/
  typescript.md
```

### 和真实前端项目的关系

```txt
React / Vue / Angular:
  components, hooks, services, validators, and shared types are split across modules.

Node / Next.js:
  route handlers, server actions, clients, and utilities depend on clear module boundaries.

Design system:
  public exports decide what consumers can import.

SDK:
  index.ts is the public surface; internal modules stay private.

Monorepo:
  path aliases, package exports, and type-only imports decide how projects connect.
```

---

## 3. 第 10 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
module problem model
  -> script mode vs module mode
  -> named export and default export
  -> import forms and aliases
  -> type-only import and export
  -> re-export and barrel files
  -> dynamic import
  -> side-effect import and module evaluation
  -> CommonJS interop
  -> AMD historical positioning
  -> module and moduleResolution
  -> NodeNext file and package rules
  -> paths and baseUrl
  -> namespace basics
  -> namespace conflict and output
  -> declaration merging
  -> module augmentation and global augmentation
  -> mini project
```

### 技术意义

模块是工程代码的骨架。没有模块边界，你写的类型、函数、类、验证器、API contract 都只能堆在一个文件里。

第 10 章的重点不是把语法记住，而是理解：

```txt
A module is a file-level boundary.
An export is a public API decision.
An import is a dependency decision.
A type-only import is a compile-time dependency decision.
A namespace is a TypeScript-specific grouping mechanism.
Declaration merging is a way to combine declarations with the same name.
Module augmentation is a controlled way to extend an existing module's type surface.
```

---

## 4. 本章先要建立的底层模型

### 结论

TypeScript 模块系统要分成五层理解：

```txt
source layer:
  import, export, import type, export type, namespace, declare module.

scope layer:
  scripts share global scope, modules have file-local scope.

resolution layer:
  moduleResolution maps import specifiers to source files or declaration files.

emit layer:
  module decides emitted JavaScript module format.

runtime layer:
  the runtime or bundler loads, links, evaluates, and caches modules.
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| 模块（module） | 拥有独立作用域、通过 import/export 连接的文件。 |
| 脚本（script） | 没有顶层 import/export 的文件，声明进入全局作用域。 |
| 模块说明符（module specifier） | `import ... from "..."` 里的路径或包名字符串。 |
| 静态导入（static import） | 顶层 `import`，在模块链接阶段确定依赖。 |
| 动态导入（dynamic import） | `import("...")`，运行时返回 Promise。 |
| 命名导出（named export） | 一个模块导出多个有名字的成员。 |
| 默认导出（default export） | 一个模块导出一个默认成员。 |
| type-only import | 只导入类型，编译输出中不会保留为运行时导入。 |
| re-export | 从一个模块重新导出另一个模块的成员。 |
| barrel 文件 | 常见的 `index.ts` 聚合导出文件。 |
| side-effect import | 只执行模块顶层代码，不绑定导入值。 |
| CommonJS | Node 早期模块系统，核心是 `require` 和 `module.exports`。 |
| ES Modules | JavaScript 标准模块系统，核心是 `import` 和 `export`。 |
| namespace | TypeScript 特有的命名空间语法，编译后通常是对象包装。 |
| declaration merging | 同名声明合并为一个类型或值/命名空间组合。 |
| module augmentation | 给已有模块补充类型声明。 |
| global augmentation | 给全局类型环境补充声明。 |

### 底层机制总图

```txt
source files
  -> parser sees import/export or script syntax
  -> checker builds module scopes and type scopes
  -> moduleResolution resolves specifiers
  -> checker connects imported and exported types/values
  -> emitter writes JavaScript according to module option
  -> runtime or bundler loads modules
  -> module top-level code executes once and exports are shared
```

### 本章最重要的边界

```txt
TypeScript can check module imports.
TypeScript cannot make a missing runtime file exist.
TypeScript can erase type-only imports.
TypeScript cannot use erased types at runtime.
TypeScript can emit CommonJS or ESM shapes.
TypeScript cannot make every ESM/CJS interop case magically identical.
TypeScript can declare module augmentation.
TypeScript cannot patch runtime objects unless you also run runtime code.
```
### 本章先补清楚：模块系统里的三个不同问题

模块这一章最容易混在一起的不是语法，而是三个层次：

```txt
1. Source syntax question:
   How do I write import and export?

2. TypeScript checking question:
   Is this imported name a value, a type, or both?
   Does this import survive into emitted JavaScript?

3. Runtime loading question:
   Can Node, the browser, or the bundler really find and execute this module?
```

所以看到一行导入时，不要只读“从哪个文件导入了什么”。要拆成：

```txt
import { formatProductCard, type ProductRecord } from "./index.js";

formatProductCard:
  value import.
  kept in emitted JavaScript.
  target module top-level code must run.

ProductRecord:
  type-only import marker.
  used only by TypeScript checker.
  erased from emitted JavaScript.
```

这也是 `verbatimModuleSyntax` 重要的原因：它让你必须更诚实地区分类型依赖和值依赖。

### 本章必须建立：import 不是复制值，而是连接绑定

ES Modules 的导入不是把被导入模块里的值复制一份到当前文件。更准确的模型是：

```txt
exported binding in module A
  -> imported live binding view in module B
```

这意味着：

```txt
1. 被导入模块会先被求值。
2. 同一个模块通常只求值一次。
3. 导入绑定是只读视图，导入方不能重新赋值。
4. 如果导出方通过函数修改了导出的 let 绑定，导入方读取到的是更新后的值。
```

这和对象解构不一样。对象解构是从对象上取值；ESM import 是模块系统建立的绑定关系。

### 本章必须建立：TypeScript 找得到，不等于运行时找得到

TypeScript 的 `moduleResolution` 是类型检查阶段的解析。Node、浏览器或 bundler 的加载规则是运行时解析。二者必须一致。

```txt
TypeScript may resolve:
  @contracts/productContract

Runtime may still fail if:
  Node does not know the alias.
  The bundler is not configured with the same alias.
  The emitted JavaScript still contains an unresolved alias.
```

所以 path alias、package `exports`、`.js` extension、`.mts` / `.cts` 不是“IDE 配置细节”，它们决定类型检查和运行时加载能不能对齐。


---

## 5. 00：模块到底在解决什么问题

### 结论

模块解决的是“代码如何拆分、隐藏、导出、导入和复用”的问题。

### 技术意义

模块边界决定哪些实现细节私有，哪些 API 对外公开。TypeScript 在这个边界上检查类型，JavaScript 运行时在这个边界上加载和执行代码。

### 文件结构

```txt
00-module-problem-model/
  moduleBoundaryOverview.ts
  privateModuleScope.ts
```

### `moduleBoundaryOverview.ts`

```ts
// Goal:
// Model a module public API with exports.

// Expected result:
// The compiler accepts public exports and private helpers stay local.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

function formatCents(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function formatProductLabel(product: ProductRecord): string {
  return `${product.title}: ${formatCents(product.priceCents)}`;
}
```

### `privateModuleScope.ts`

```ts
// Goal:
// Show that non-exported names are private to the module.

// Expected result:
// Only exported names can be imported by other modules.

export const publicFeatureName = "search";

const internalFeatureKey = "feature.search";

export function readFeatureKey(): string {
  return internalFeatureKey;
}
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 文件中出现 `export`，文件进入模块模式。 |
| 2 | `ProductRecord` 和 `formatProductLabel` 成为公共 API。 |
| 3 | `formatCents` 没有导出，只能在当前文件内使用。 |
| 4 | 编译后类型被擦除，运行时只剩值导出。 |
| 5 | 其他模块必须通过 `import` 消费导出成员。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 一个文件里的变量天然能被别的文件访问 | 模块文件默认私有，必须显式 export。 |
| export 只是给 IDE 看 | export 会影响运行时模块 API。 |
| type export 会生成运行时代码 | `export type` 只存在于类型系统。 |

---

## 6. 01：脚本模式和模块模式

### 结论

有顶层 `import`、`export` 或顶层 `await` 的文件是模块；没有这些语法的文件会被当成脚本，声明可能进入共享全局作用域。

### 技术意义

脚本模式容易造成全局变量冲突。学习阶段建议每个练习文件都写 `export {};`，强制文件进入模块模式。

### 文件结构

```txt
01-script-vs-module/
  scriptModeA.ts
  scriptModeB.ts
  moduleModeA.ts
  moduleModeB.ts
  emptyExportBoundary.ts
```

### `scriptModeA.ts`

```ts
// Goal:
// Demonstrate script-mode global scope.

// Expected result:
// This file can conflict with another script file.

const sharedName = "alpha";

console.log(sharedName);
```

### `scriptModeB.ts`

```ts
// Goal:
// Demonstrate that another script file shares the global scope.

// Expected result:
// The compiler may reject duplicate declarations when both files are scripts.

const sharedName = "beta";

console.log(sharedName);
```

### `moduleModeA.ts`

```ts
// Goal:
// Use export to create module scope.

// Expected result:
// This file has its own module scope.

export {};

const sharedName = "alpha";

console.log(sharedName);
```

### `moduleModeB.ts`

```ts
// Goal:
// Use export to avoid global collision.

// Expected result:
// This file can reuse the same local name safely.

export {};

const sharedName = "beta";

console.log(sharedName);
```

### `emptyExportBoundary.ts`

```ts
// Goal:
// Turn a file into a module without exporting a public API.

// Expected result:
// The file is module-scoped but exports nothing.

export {};

const localOnlyValue = "module-local";

console.log(localOnlyValue);
```

### 常见错误

```txt
错误：
没有 import/export 的 .ts 文件也一定是模块。

正确：
没有顶层 import/export 的文件默认是 script。
学习练习文件统一写 export {} 可以避免全局污染。
```

---

## 7. 02：命名导出和默认导出

### 结论

命名导出适合导出多个稳定 API；默认导出适合模块主输出，但重构和自动导入时不如命名导出清楚。

### 技术意义

导出方式会影响调用方的导入语法、重命名方式和公共 API 可维护性。现代团队项目通常更偏向命名导出，因为它更清晰、更容易重构。

### 文件结构

```txt
02-named-default-exports/
  productFormatter.ts
  productFormatterConsumer.ts
  defaultExportFormatter.ts
  defaultExportConsumer.ts
```

### `productFormatter.ts`

```ts
// Goal:
// Export multiple named values from a module.

// Expected result:
// Consumers can import each exported name explicitly.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProductTitle(product: ProductRecord): string {
  return product.title.trim().toUpperCase();
}

export function formatProductPrice(product: ProductRecord): string {
  return `$${(product.priceCents / 100).toFixed(2)}`;
}
```

### `productFormatterConsumer.ts`

```ts
// Goal:
// Import named exports from another module.

// Expected result:
// The compiler connects imported function and type names.

import {
  formatProductPrice,
  formatProductTitle,
  type ProductRecord,
} from "./productFormatter.js";

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(formatProductTitle(product));
console.log(formatProductPrice(product));
```

### `defaultExportFormatter.ts`

```ts
// Goal:
// Export one default value from a module.

// Expected result:
// Consumers can choose any local import name.

export default function formatDefaultProductTitle(titleText: string): string {
  return titleText.trim().toUpperCase();
}
```

### `defaultExportConsumer.ts`

```ts
// Goal:
// Import a default export with a local name.

// Expected result:
// The local import name does not need to match the exported function name.

import formatTitle from "./defaultExportFormatter.js";

console.log(formatTitle(" Keyboard "));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 一个模块只能导出一个东西 | 一个模块可以有多个命名导出。 |
| default import 的名字必须和原函数名一致 | 调用方可以自己命名 default import。 |
| 默认导出一定更高级 | 默认导出只是另一种 API 形式，不代表更推荐。 |

---

## 8. 03：导入形式、重命名和 namespace import

### 结论

导入形式决定你如何在当前模块中引用另一个模块的导出成员。重命名解决本地命名冲突，namespace import 把所有命名导出放到一个模块对象下。

### 技术意义

导入不是复制代码。导入建立的是模块之间的依赖关系。被导入模块的顶层代码会先求值，然后导入方才能使用它导出的绑定。

### 文件结构

```txt
03-import-forms/
  priceMath.ts
  renamedImportConsumer.ts
  namespaceImportConsumer.ts
  sideBySideImportConsumer.ts
```

### `priceMath.ts`

```ts
// Goal:
// Provide several named exports for import-form practice.

// Expected result:
// Consumers can import these values in different ways.

export const taxRate = 0.08;

export function addTax(priceCents: number): number {
  return Math.round(priceCents * (1 + taxRate));
}

export function applyDiscount(priceCents: number, discountRate: number): number {
  return Math.round(priceCents * (1 - discountRate));
}
```

### `renamedImportConsumer.ts`

```ts
// Goal:
// Rename an imported binding locally.

// Expected result:
// The imported value can be used with a local alias.

import { addTax as addSalesTax } from "./priceMath.js";

console.log(addSalesTax(10000));
```

### `namespaceImportConsumer.ts`

```ts
// Goal:
// Import all named exports under a namespace object.

// Expected result:
// The namespace object exposes exported members as properties.

import * as PriceMath from "./priceMath.js";

const discountedPrice = PriceMath.applyDiscount(10000, 0.15);
const finalPrice = PriceMath.addTax(discountedPrice);

console.log(finalPrice);
```

### `sideBySideImportConsumer.ts`

```ts
// Goal:
// Use multiple import forms in one module.

// Expected result:
// The compiler accepts explicit imports and aliases.

import { addTax, applyDiscount as discountPrice } from "./priceMath.js";

const salePrice = discountPrice(12000, 0.25);

console.log(addTax(salePrice));
```

### 常见错误

```txt
错误：
import * as PriceMath 会导入 default export 为 PriceMath.default，并且总是适合所有场景。

正确：
namespace import 主要聚合命名导出。默认导出和 CommonJS 互操作要根据模块格式和配置判断。
```

---

## 9. 04：type-only import 和 export

### 结论

`import type` 和 `export type` 表示只在类型系统中使用的依赖。它们不会生成运行时代码。

### 技术意义

TypeScript 里同一个模块可能同时导出类型和值。type-only import 能让你明确告诉编译器和转译工具：这个导入不应该在运行时存在。

### 文件结构

```txt
04-type-only-import-export/
  productTypes.ts
  productRuntime.ts
  importTypeConsumer.ts
  inlineTypeImportConsumer.ts
```

### `productTypes.ts`

```ts
// Goal:
// Export shared types without runtime values.

// Expected result:
// Consumers can import these types with import type.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type ProductSummary = Pick<ProductRecord, "id" | "title">;
```

### `productRuntime.ts`

```ts
// Goal:
// Export runtime values from a module.

// Expected result:
// Consumers must use normal imports for runtime values.

import type { ProductRecord } from "./productTypes.js";

export function createProductSummary(product: ProductRecord): string {
  return `${product.id}:${product.title}`;
}
```

### `importTypeConsumer.ts`

```ts
// Goal:
// Import types with import type.

// Expected result:
// The type-only import is erased from emitted JavaScript.

import type { ProductRecord } from "./productTypes.js";
import { createProductSummary } from "./productRuntime.js";

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(createProductSummary(product));
```

### `inlineTypeImportConsumer.ts`

```ts
// Goal:
// Mix runtime and type imports with inline type markers.

// Expected result:
// The runtime function remains imported and the type import is erased.

import { createProductSummary } from "./productRuntime.js";
import { type ProductRecord } from "./productTypes.js";

const product: ProductRecord = {
  id: "p2",
  title: "Mouse",
  priceCents: 2500,
};

console.log(createProductSummary(product));
```

### `typeOnlyImportValueMistake.ts`

```ts
// Goal:
// Show that import type does not create a runtime binding.

// Expected result:
// The compiler rejects using the imported name as a value.

import type { createProductSummary } from "./productRuntime.js";

type ProductSummaryCreator = typeof createProductSummary;

const summaryCreator: ProductSummaryCreator = (product) => {
  return `${product.id}:${product.title}`;
};

console.log(summaryCreator({ id: "p1", title: "Keyboard", priceCents: 9900 }));

// @ts-expect-error: createProductSummary was imported only as a type.
console.log(createProductSummary({ id: "p2", title: "Mouse", priceCents: 2500 }));
```

### 本节补充：`import type` 不是“懒加载”

`import type` 不是更轻量的运行时导入，也不是 lazy import。它是“只给 TypeScript checker 使用”的类型依赖。

```txt
import type:
  erased from emitted JavaScript.
  does not run the imported module.
  cannot provide runtime values.

dynamic import:
  runtime expression.
  returns Promise.
  loads and evaluates the target module when executed.
```

所以如果一个模块必须执行顶层注册代码，不能用 `import type` 代替副作用导入。

### 常见错误

```ts
// Goal:
// Show that a type-only import cannot be used as a runtime value.

// Expected result:
// The compiler rejects using ProductRecord as a value.

import type { ProductRecord } from "./productTypes.js";

// @ts-expect-error: ProductRecord is a type-only import.
console.log(ProductRecord);
```

### 记忆模型

```txt
import:
  runtime dependency, can import values and types.

import type:
  type-system dependency only, erased from emitted JavaScript.

export type:
  exposes a type-only API, not a runtime value.
```

---

## 10. 05：re-export、barrel 文件和公共 API

### 结论

re-export 用来从一个模块转发另一个模块的导出。barrel 文件通常是 `index.ts`，用来集中暴露一个目录的公共 API。

### 技术意义

barrel 文件不是越多越好。它应该表达“这个目录希望外部依赖的公共表面”，而不是把所有内部文件全部暴露出去。

### 文件结构

```txt
05-re-export-barrel/
  contracts.ts
  validators.ts
  index.ts
  consumer.ts
```

### `contracts.ts`

```ts
// Goal:
// Define public contract types.

// Expected result:
// These types can be re-exported by index.ts.

export type ProductRecord = {
  id: string;
  title: string;
};

export type ProductListResponse = {
  products: ProductRecord[];
};
```

### `validators.ts`

```ts
// Goal:
// Export a runtime validator.

// Expected result:
// The validator can be part of the public module API.

import type { ProductRecord } from "./contracts.js";

export function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.id === "string" && typeof candidate.title === "string";
}
```

### `index.ts`

```ts
// Goal:
// Re-export the public API of this folder.

// Expected result:
// Consumers can import from the folder entry point.

export type { ProductListResponse, ProductRecord } from "./contracts.js";
export { isProductRecord } from "./validators.js";
```

### `consumer.ts`

```ts
// Goal:
// Consume a public API through a barrel file.

// Expected result:
// The consumer does not depend on internal file layout.

import { isProductRecord, type ProductRecord } from "./index.js";

const value: unknown = {
  id: "p1",
  title: "Keyboard",
};

if (isProductRecord(value)) {
  const product: ProductRecord = value;
  console.log(product.title);
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| barrel 文件导出所有内部实现 | barrel 应该是公共 API，不是内部文件清单。 |
| 在同一目录内部也绕回 index.ts 导入 | 内部模块之间优先直接相对导入，避免循环依赖。 |
| re-export 类型忘记写 `type` | 开启 `verbatimModuleSyntax` 后应明确区分类型和值。 |

---

## 11. 06：动态导入 dynamic import

### 结论

动态导入 `import("...")` 是运行时表达式，返回 Promise，适合按需加载模块。

### 技术意义

静态导入在模块加载阶段确定依赖；动态导入在代码执行到这一行时才开始加载。它常用于路由懒加载、重型工具按需加载、特性开关模块。

### 文件结构

```txt
06-dynamic-import/
  lazyFormatter.ts
  dynamicImportConsumer.ts
  dynamicImportTypes.ts
```

### `lazyFormatter.ts`

```ts
// Goal:
// Export a function that can be loaded dynamically.

// Expected result:
// Dynamic consumers can call this function after import.

export function formatLazyTitle(titleText: string): string {
  return titleText.trim().toUpperCase();
}
```

### `dynamicImportConsumer.ts`

```ts
// Goal:
// Load a module dynamically.

// Expected result:
// Node prints the formatted title after the module is loaded.

export {};

async function main(): Promise<void> {
  const formatterModule = await import("./lazyFormatter.js");
  console.log(formatterModule.formatLazyTitle(" Keyboard "));
}

void main();
```

### `dynamicImportTypes.ts`

```ts
// Goal:
// Extract the type of a dynamically imported module.

// Expected result:
// The module type stays linked to the imported file.

export {};

type FormatterModule = typeof import("./lazyFormatter.js");

type LazyFormatter = FormatterModule["formatLazyTitle"];

const formatter: LazyFormatter = (titleText) => titleText.toLowerCase();

console.log(formatter("Keyboard"));
```

### 常见错误

```txt
错误：
动态导入和静态导入只是写法不同，加载时机一样。

正确：
静态导入在模块链接阶段处理。
动态导入是运行时表达式，返回 Promise。
```

---

## 12. 07：副作用导入和模块求值顺序

### 结论

`import "./file.js"` 不导入任何绑定，只执行目标模块的顶层代码。它适合注册 polyfill、全局扩展或一次性初始化，但要谨慎使用。

### 技术意义

模块顶层代码会在模块第一次被加载时执行一次。副作用导入让依赖变得不显式，真实项目中要集中管理。

### 文件结构

```txt
07-side-effect-import/
  registerGlobals.ts
  sideEffectConsumer.ts
  moduleEvaluationOrder.ts
```

### `registerGlobals.ts`

```ts
// Goal:
// Run a side effect at module evaluation time.

// Expected result:
// Importing this module executes the top-level code once.

console.log("register-globals");

export {};
```

### `sideEffectConsumer.ts`

```ts
// Goal:
// Import a module only for side effects.

// Expected result:
// The imported module top-level code runs before this module continues.

import "./registerGlobals.js";

console.log("consumer-ready");
```

### `moduleEvaluationOrder.ts`

```ts
// Goal:
// Observe module top-level evaluation order.

// Expected result:
// Dependencies are evaluated before the importer body runs.

import "./registerGlobals.js";

console.log("entry-module");
```

### 预期输出

```txt
register-globals
entry-module
```

### `liveBindingProducer.ts`

```ts
// Goal:
// Export a mutable binding and a function that updates it.

// Expected result:
// Consumers observe the updated binding through ESM live binding.

export let currentCount = 0;

export function incrementCount(): void {
  currentCount += 1;
}
```

### `liveBindingConsumer.ts`

```ts
// Goal:
// Observe that ESM imports are live read-only bindings.

// Expected result:
// Node prints 0 and then 1.

import { currentCount, incrementCount } from "./liveBindingProducer.js";

console.log(currentCount);
incrementCount();
console.log(currentCount);

// @ts-expect-error: Imported bindings are read-only in the importing module.
currentCount = 10;
```

### 本节补充：模块求值、缓存和循环依赖

模块顶层代码通常只在第一次加载时执行一次，后续导入复用同一个模块实例。这个机制让模块可以保存状态，但也会让顶层副作用和循环依赖变危险。

```txt
Good module boundary:
  export functions, types, validators, constants.
  keep top-level side effects rare and explicit.

Risky module boundary:
  top-level code mutates global state.
  barrel files import too many modules.
  circular imports read values before initialization finishes.
```

判断一个 import 时，要问：

```txt
Does this import need a value?
Does it execute top-level code?
Could it create a cycle?
Is the top-level side effect intentional?
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| import 只是拿变量，不会执行模块 | 模块依赖会被求值。 |
| 副作用导入可以随便散落 | 副作用导入应该集中且有明确原因。 |
| 多次导入会多次执行顶层代码 | 同一个模块通常只会被加载并执行一次，然后缓存。 |

---

## 13. 08：CommonJS 和 ES Modules 互操作

### 结论

CommonJS 使用 `require` / `module.exports`；ES Modules 使用 `import` / `export`。TypeScript 可以帮助它们互操作，但配置、运行时和文件格式必须一致。

### 技术意义

很多 npm 包仍然涉及 CommonJS。你必须能分清“TypeScript 源码语法”“编译输出格式”“Node 运行时加载规则”这三件事。

### 文件结构

```txt
08-commonjs-interop/
  commonjsExport.cjs
  commonjsConsumer.cts
  esModuleConsumer.mts
  importEqualsRequire.ts
```

### `commonjsExport.cjs`

```js
// Goal:
// Export a CommonJS module value.

// Expected result:
// CommonJS consumers can require this module.

function formatCommonTitle(titleText) {
  return titleText.trim().toUpperCase();
}

module.exports = {
  formatCommonTitle,
};
```

### `commonjsConsumer.cts`

```ts
// Goal:
// Consume a CommonJS module from a CommonJS TypeScript file.

// Expected result:
// This file is emitted as CommonJS under NodeNext.

export {};

const commonModule = require("./commonjsExport.cjs") as {
  formatCommonTitle(titleText: string): string;
};

console.log(commonModule.formatCommonTitle(" Keyboard "));
```

### `esModuleConsumer.mts`

```ts
// Goal:
// Import a CommonJS module from an ES module file.

// Expected result:
// Runtime behavior depends on Node interop rules.

import commonModule from "./commonjsExport.cjs";

const typedCommonModule = commonModule as {
  formatCommonTitle(titleText: string): string;
};

console.log(typedCommonModule.formatCommonTitle(" Mouse "));
```

### `importEqualsRequire.ts`

```ts
// Goal:
// Use TypeScript import-equals syntax for CommonJS-style modules.

// Expected result:
// This syntax maps closely to require-style module loading.

import path = require("node:path");

console.log(path.join("products", "p1"));
```

### 常见错误

```txt
错误：
ESM 和 CommonJS 只是两套完全等价的语法。

正确：
它们的默认导入、命名空间导入、同步/异步加载能力、文件识别和运行时行为都不完全一样。
```

---

## 14. 09：AMD 和历史模块格式的定位

### 结论

AMD 是历史模块格式，主要用于早期浏览器异步模块加载。现代前端项目通常使用 ES Modules 加 bundler，不再主动选择 AMD。

### 技术意义

书上提到 CommonJS 和 AMD，是为了让你理解 TypeScript 曾经支持多种模块输出。现在你需要知道它们是什么、在哪里可能遇到、为什么新项目不优先选它们。

### 文件结构

```txt
09-amd-history/
  amdOutputExample.ts
  amdPositioning.md
```

### `amdOutputExample.ts`

```ts
// Goal:
// Provide a small module that can be emitted to AMD when configured.

// Expected result:
// Compile with module AMD to inspect emitted define wrapper.

export function createAmdLabel(titleText: string): string {
  return `product:${titleText}`;
}
```

### 运行方式

```bash
npx tsc amdOutputExample.ts --module AMD --target ES2022 --outDir dist-amd
```

### `amdPositioning.md`

```txt
AMD is historical knowledge for this chapter.
Modern frontend projects should prefer native ES module syntax and bundler-aware configuration.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 书上提到 AMD，所以新项目也应该学会使用 AMD | AMD 主要是历史兼容知识。 |
| module 选项只影响类型检查 | `module` 会影响 JavaScript 输出格式。 |
| 只看 TS 源码不看输出 | 本章必须观察编译输出。 |

---

## 15. 10：module、moduleResolution 和文件扩展名

### 结论

`module` 控制编译输出和运行时模块语义；`moduleResolution` 控制 TypeScript 如何把 import 路径解析到文件和类型声明。

### 技术意义

很多模块错误不是语法错误，而是配置和运行时不一致：TypeScript 找得到，Node 运行时找不到；bundler 支持，Node 不支持；类型声明存在，真实 JS 文件不存在。

### 文件结构

```txt
10-module-resolution/
  relativeImportExtensions.ts
  declarationFileResolution.ts
  moduleResolutionNotes.md
```

### `relativeImportExtensions.ts`

```ts
// Goal:
// Use a runtime JavaScript extension in an ESM-style relative import.

// Expected result:
// TypeScript maps .js specifier to the .ts source during checking.

export function createRuntimeExtensionLabel(titleText: string): string {
  return titleText.toUpperCase();
}
```

### `declarationFileResolution.ts`

```ts
// Goal:
// Explain that TypeScript can resolve implementation files and declaration files.

// Expected result:
// This file is a placeholder for module-resolution tracing.

export type ResolutionNote = {
  specifier: string;
  resolvedFile: string;
};

const note: ResolutionNote = {
  specifier: "./module.js",
  resolvedFile: "./module.ts",
};

console.log(note.resolvedFile);
```

### `moduleResolutionNotes.md`

```txt
Run this command to inspect module resolution:

npx tsc --noEmit --traceResolution

Questions to answer:
1. Which file did TypeScript choose?
2. Did it resolve source, declaration, or package types?
3. Does the runtime support the same specifier?
```

### `ambientCssModule.d.ts`

```ts
// Goal:
// Declare the type shape of imported CSS module files.

// Expected result:
// TypeScript can type-check imports that match *.module.css.

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
```

### 本节补充：`.d.ts` 只描述存在的运行时东西

`.d.ts` 文件告诉 TypeScript：“这个模块或全局值在运行时会存在，并且形状是这样。” 它不会创建真实文件，也不会实现真实函数。

```txt
declaration file:
  gives TypeScript type information.

runtime file:
  gives Node, browser, or bundler executable code or assets.
```

如果只写 `ambientCssModule.d.ts`，但 bundler 没有配置 CSS module loader，运行时仍然可能失败。

### 常见错误

```txt
错误：
TypeScript 找得到模块，就代表 Node 一定能运行。

正确：
TypeScript 的解析结果和运行时加载规则必须一致。
NodeNext、Bundler、Node10 会模拟不同的运行时或工具链规则。
```

---

## 16. 11：NodeNext、package.json type、.mts 和 .cts

### 结论

在 NodeNext 模式下，TypeScript 会按 Node 的 ESM / CJS 规则处理文件。`.mts` 明确表示 ESM 源文件，`.cts` 明确表示 CommonJS 源文件；普通 `.ts` 还会受最近的 `package.json` 的 `type` 字段影响。

### 技术意义

现代 Node 同时支持 ESM 和 CommonJS。学习模块时不能只问“代码写的是 import 还是 require”，还要看文件扩展名、package.json、tsconfig 和最终输出。

### 文件结构

```txt
11-nodenext-files/
  package-type-module.json
  esmEntry.mts
  cjsEntry.cts
  extensionMistake.ts
```

### `package-type-module.json`

```json
{
  "type": "module"
}
```

### `esmEntry.mts`

```ts
// Goal:
// Write an explicit ESM TypeScript file.

// Expected result:
// This file emits to .mjs.

export const esmLabel = "esm-entry";

console.log(esmLabel);
```

### `cjsEntry.cts`

```ts
// Goal:
// Write an explicit CommonJS TypeScript file.

// Expected result:
// This file emits to .cjs.

export const cjsLabel = "cjs-entry";

console.log(cjsLabel);
```

### `extensionMistake.ts`

```ts
// Goal:
// Avoid relying on extensionless relative imports in NodeNext ESM output.

// Expected result:
// Use the runtime .js extension in relative ESM imports.

export function createExtensionSafeLabel(valueText: string): string {
  return valueText.toUpperCase();
}
```

### `packageExportsBoundary.json`

```json
{
  "name": "example-package",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./validators": {
      "types": "./dist/validators.d.ts",
      "import": "./dist/validators.js"
    }
  }
}
```

### 本节补充：NodeNext 不只看 TypeScript 文件

NodeNext 会尽量模拟 Node 的真实模块规则。判断一个文件最终是 ESM 还是 CommonJS，不能只看源码里有没有 `import`。还要看：

```txt
.mts:
  explicit TypeScript ESM input.
  emits .mjs.

.cts:
  explicit TypeScript CommonJS input.
  emits .cjs.

.ts:
  depends on nearest package.json type field under NodeNext.

package exports:
  controls which package subpaths are public to consumers.
```

对库作者来说，`exports` 是公共模块 API；没有出现在 `exports` 里的内部路径，消费者不应该依赖。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `.ts` 文件天然就是 ESM | 在 NodeNext 下还要看 `package.json` 的 `type`。 |
| `.mts` 和 `.cts` 只是名字习惯 | 它们明确控制 ESM / CJS 输出。 |
| 相对导入可以永远不写扩展名 | Node ESM 运行时通常需要明确扩展名。 |

---

## 17. 12：路径别名 paths 和 baseUrl

### 结论

`paths` 和 `baseUrl` 让 TypeScript 用别名解析模块路径，但它们不会自动改写运行时路径。运行时或 bundler 也必须知道同样的别名规则。

### 技术意义

路径别名解决的是深层相对路径难维护的问题，但它引入了“TypeScript 编译期解析”和“运行时 / bundler 解析”一致性问题。

### 文件结构

```txt
12-paths-baseurl/
  tsconfig.paths.json
  productContract.ts
  aliasedImportConsumer.ts
```

### `tsconfig.paths.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@contracts/*": ["chapter-10-namespaces-modules/12-paths-baseurl/*"]
    }
  }
}
```

### `productContract.ts`

```ts
// Goal:
// Export a type that can be imported through an alias.

// Expected result:
// TypeScript can resolve the alias when paths is configured.

export type ProductContract = {
  id: string;
  title: string;
};
```

### `aliasedImportConsumer.ts`

```ts
// Goal:
// Import a type through a configured path alias.

// Expected result:
// This works only when tsconfig paths and the runtime tool agree.

import type { ProductContract } from "@contracts/productContract";

const product: ProductContract = {
  id: "p1",
  title: "Keyboard",
};

console.log(product.title);
```

### `aliasRuntimeBoundary.ts`

```ts
// Goal:
// Keep path alias usage as a runtime-resolution decision.

// Expected result:
// This file demonstrates why type-only aliases are safer than value aliases without runtime config.

import type { ProductContract } from "@contracts/productContract";

function renderProduct(product: ProductContract): string {
  return product.title.toUpperCase();
}

console.log(renderProduct({ id: "p1", title: "Keyboard" }));
```

### 本节补充：type-only alias 和 value alias 的风险不同

如果 alias 只出现在 `import type` 里，编译输出会擦除这条导入，运行时不会加载该 alias。

如果 alias 出现在值导入里：

```txt
import { parseProduct } from "@contracts/productValidator";
```

那么 emitted JavaScript 里仍然会有运行时导入。此时 Node、bundler、test runner 必须也知道 `@contracts/*` 怎么解析。

所以 path alias 的真正检查清单是：

```txt
TypeScript can resolve it.
Bundler can resolve it.
Test runner can resolve it.
Node runtime can resolve it if emitted code runs directly in Node.
```

### 常见错误

```txt
错误：
paths 会自动改变编译后的 JavaScript import 路径。

正确：
paths 主要影响 TypeScript 解析。运行时、bundler、test runner、IDE 都要有一致配置。
```

---

## 18. 13：namespace 基础

### 结论

`namespace` 是 TypeScript 特有的代码组织方式，适合理解旧代码、全局脚本和声明文件。现代模块化项目中优先使用 ES Modules。

### 技术意义

namespace 编译后通常变成一个对象包装，用点语法访问导出的成员。没有 `export` 的 namespace 内部成员只在 namespace 内可见。

### 文件结构

```txt
13-namespaces/
  namespaceBasics.ts
  namespaceExportBoundary.ts
  nestedNamespace.ts
```

### `namespaceBasics.ts`

```ts
// Goal:
// Create a simple namespace with exported members.

// Expected result:
// Exported namespace members can be accessed with dotted notation.

namespace ProductFormatting {
  export function formatTitle(titleText: string): string {
    return titleText.trim().toUpperCase();
  }
}

console.log(ProductFormatting.formatTitle(" Keyboard "));
```

### `namespaceExportBoundary.ts`

```ts
// Goal:
// Show namespace export boundary.

// Expected result:
// Only exported members are visible outside the namespace.

namespace InventoryRules {
  const minimumStock = 1;

  export function hasStock(stockCount: number): boolean {
    return stockCount >= minimumStock;
  }
}

console.log(InventoryRules.hasStock(3));

// @ts-expect-error: minimumStock is not exported from the namespace.
console.log(InventoryRules.minimumStock);
```

### `nestedNamespace.ts`

```ts
// Goal:
// Use a nested namespace for legacy-style grouping.

// Expected result:
// Nested exported members use dotted access.

namespace Storefront.Products {
  export type ProductRecord = {
    id: string;
    title: string;
  };

  export function createProduct(id: string, title: string): ProductRecord {
    return { id, title };
  }
}

const product = Storefront.Products.createProduct("p1", "Keyboard");

console.log(product.title);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| namespace 是 JavaScript 标准模块系统 | namespace 是 TypeScript 特有语法。 |
| namespace 适合包住每个现代模块 | 模块文件本身已经是边界，不需要再套 namespace。 |
| namespace 内所有成员都自动公开 | 只有 `export` 的成员外部可见。 |

---

## 19. 14：namespace 冲突、导出边界和编译输出

### 结论

namespace 在全局作用域中创建名字，容易产生冲突；编译后通常输出为对象包装和立即执行函数模式。你必须观察它的 JavaScript 输出。

### 技术意义

namespace 的价值是历史和声明建模；它的风险是全局命名污染和依赖不清晰。

### 文件结构

```txt
14-namespace-output-conflicts/
  namespaceConflict.ts
  namespaceCompileOutput.ts
  needlessNamespaceInModule.ts
```

### `namespaceConflict.ts`

```ts
// Goal:
// Show that same-name namespaces can merge.

// Expected result:
// Members from both declarations are available.

namespace ProductTools {
  export function formatTitle(titleText: string): string {
    return titleText.toUpperCase();
  }
}

namespace ProductTools {
  export function formatId(idText: string): string {
    return `product:${idText}`;
  }
}

console.log(ProductTools.formatTitle("Keyboard"));
console.log(ProductTools.formatId("p1"));
```

### `namespaceCompileOutput.ts`

```ts
// Goal:
// Compile this file and inspect namespace output.

// Expected result:
// The emitted JavaScript creates or reuses a namespace object.

namespace AuditLog {
  export function createEntry(messageText: string): string {
    return `audit:${messageText}`;
  }
}

console.log(AuditLog.createEntry("ready"));
```

### 运行方式

```bash
npx tsc namespaceCompileOutput.ts --target ES2022 --module none --outFile namespaceCompileOutput.js
```

### `needlessNamespaceInModule.ts`

```ts
// Goal:
// Avoid wrapping modern module exports in a needless namespace.

// Expected result:
// The module itself is already a boundary.

export namespace ProductModule {
  export function formatTitle(titleText: string): string {
    return titleText.toUpperCase();
  }
}
```

### 常见错误

```txt
错误：
export namespace ProductModule inside a module makes the API cleaner.

正确：
The module file is already a namespace-like boundary.
Prefer exporting formatTitle directly unless you are modeling a specific legacy API.
```

---

## 20. 15：声明合并 declaration merging

### 结论

声明合并是 TypeScript 把同名声明组合起来的能力。常见场景包括 interface 合并、function + namespace 合并、enum + namespace 合并。

### 技术意义

声明合并不是普通对象合并。它发生在类型检查阶段，用来描述 JavaScript 中“函数也有属性”“类旁边挂静态工具”“第三方库扩展”等模式。

### 文件结构

```txt
15-declaration-merging/
  interfaceMerging.ts
  functionNamespaceMerge.ts
  enumNamespaceMerge.ts
```

### `interfaceMerging.ts`

```ts
// Goal:
// Merge interface declarations with the same name.

// Expected result:
// The final interface requires members from both declarations.

export {};

interface AppConfig {
  appName: string;
}

interface AppConfig {
  version: string;
}

const config: AppConfig = {
  appName: "Learning Lab",
  version: "1.0.0",
};

console.log(config.appName);
```

### `functionNamespaceMerge.ts`

```ts
// Goal:
// Merge a function with a namespace to model function properties.

// Expected result:
// The function can be called and can expose static-like properties.

export {};

function createLabel(titleText: string): string {
  return `${createLabel.prefix}${titleText}`;
}

namespace createLabel {
  export const prefix = "product:";
}

console.log(createLabel("Keyboard"));
console.log(createLabel.prefix);
```

### `enumNamespaceMerge.ts`

```ts
// Goal:
// Add helper functions to an enum through namespace merging.

// Expected result:
// The enum value and helper function share one name.

export {};

enum OrderStatus {
  Draft = "draft",
  Paid = "paid",
  Shipped = "shipped",
}

namespace OrderStatus {
  export function isFinal(status: OrderStatus): boolean {
    return status === OrderStatus.Shipped;
  }
}

console.log(OrderStatus.isFinal(OrderStatus.Shipped));
```

### `classNamespaceMerge.ts`

```ts
// Goal:
// Merge a class with a namespace to add static-like helpers.

// Expected result:
// The class constructor and namespace helpers share one exported name.

export {};

class ProductParser {
  parseTitle(titleText: string): string {
    return titleText.trim().toUpperCase();
  }
}

namespace ProductParser {
  export function fromUnknown(value: unknown): ProductParser {
    if (typeof value !== "object" || value === null) {
      throw new Error("Invalid parser config");
    }

    return new ProductParser();
  }
}

const parser = ProductParser.fromUnknown({});

console.log(parser.parseTitle(" Keyboard "));
```

### 本节补充：声明合并不是对象 spread

声明合并发生在 TypeScript 的声明空间里，不等于运行时对象展开。

```txt
interface merging:
  type-level shape combination.

function + namespace merging:
  function value plus namespace-exported static-like members.

class + namespace merging:
  class constructor value plus namespace-exported static-like helpers.
```

合并能不能成立，取决于声明是否同时占用 value space、type space、namespace space，以及 TypeScript 是否允许这种组合。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| interface 重复声明一定是覆盖 | 同名 interface 会合并。 |
| function + namespace 是运行时魔法 | namespace 导出的值会变成函数对象上的属性模式。 |
| 所有声明都能合并 | class 不能和 class 合并；不是所有组合都允许。 |

---

## 21. 16：module augmentation 和 global augmentation

### 结论

module augmentation 给已有模块补充类型声明；global augmentation 给全局类型环境补充声明。两者都只补类型，不自动补运行时实现。

### 技术意义

如果你扩展第三方库原型、给模块增加方法、给全局对象增加属性，TypeScript 必须知道这个新成员存在。但你也必须写真正的运行时代码。

### 文件结构

```txt
16-module-global-augmentation/
  observable.ts
  observableMap.ts
  observableConsumer.ts
  globalArrayExtension.ts
```

### `observable.ts`

```ts
// Goal:
// Export a small class that can be augmented.

// Expected result:
// Other modules can import this class.

export class Observable<ValueType> {
  constructor(private readonly value: ValueType) {}

  subscribe(consumer: (value: ValueType) => void): void {
    consumer(this.value);
  }
}
```

### `observableMap.ts`

```ts
// Goal:
// Add a method to Observable through module augmentation and runtime patching.

// Expected result:
// The compiler knows about map after this module is imported.

import { Observable } from "./observable.js";

declare module "./observable.js" {
  interface Observable<ValueType> {
    map<OutputType>(transform: (value: ValueType) => OutputType): Observable<OutputType>;
  }
}

Observable.prototype.map = function <ValueType, OutputType>(
  this: Observable<ValueType>,
  transform: (value: ValueType) => OutputType,
): Observable<OutputType> {
  let mappedValue: OutputType | undefined;

  this.subscribe((value) => {
    mappedValue = transform(value);
  });

  if (mappedValue === undefined) {
    throw new Error("Missing mapped value");
  }

  return new Observable(mappedValue);
};
```

### `observableConsumer.ts`

```ts
// Goal:
// Use a method provided by module augmentation.

// Expected result:
// Importing the patch module provides both type and runtime behavior.

import { Observable } from "./observable.js";
import "./observableMap.js";

const titleObservable = new Observable("Keyboard");
const lengthObservable = titleObservable.map((title) => title.length);

lengthObservable.subscribe((lengthValue) => {
  console.log(lengthValue.toFixed(0));
});
```

### 本节补充：augmentation 的模块说明符必须对上

`declare module "./observable.js"` 里的字符串不是随便写的名字。它要和消费者实际导入的模块说明符对齐。

```txt
Runtime import:
  import { Observable } from "./observable.js";

Type augmentation:
  declare module "./observable.js" { ... }
```

如果你声明的是另一个 specifier，TypeScript 可能不会把补充类型应用到当前导入的 `Observable` 上。

同时还要记住：

```txt
declare module:
  changes TypeScript's type view.

import "./observableMap.js":
  runs the runtime patch code.
```

少了前者，编译器不知道 `.map()`。少了后者，运行时对象没有 `.map()`。

### `globalArrayExtension.ts`

```ts
// Goal:
// Pair global augmentation with runtime implementation.

// Expected result:
// The compiler accepts the new array method after augmentation.

export {};

declare global {
  interface Array<T> {
    firstOrUndefined(): T | undefined;
  }
}

if (!Array.prototype.firstOrUndefined) {
  Array.prototype.firstOrUndefined = function <T>(this: T[]): T | undefined {
    return this[0];
  };
}

const titles = ["Keyboard", "Mouse"];

console.log(titles.firstOrUndefined());
```

### 常见错误

```txt
错误：
declare module alone adds the runtime method.

正确：
declare module only updates TypeScript's type view.
You still need runtime patching code.
```

---

## 22. 17：模块组织策略和小项目整合

### 结论

本章小项目要把 contracts、validators、formatters、errors 和 public barrel 串成一个模块化的小型 SDK。目标是训练“公共 API 清楚、内部实现隐藏、类型和值边界分明”。

### 技术意义

真实项目里，模块设计最重要的问题不是“文件怎么分”，而是“外部应该依赖哪些文件”。公共 API 越稳定，内部重构越安全。

### 文件结构

```txt
17-mini-project/
  contracts.ts
  validators.ts
  formatters.ts
  errors.ts
  index.ts
  app.ts
```

### `contracts.ts`

```ts
// Goal:
// Define public contract types for the mini SDK.

// Expected result:
// These types are exported through index.ts.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type ProductValidationError =
  | { kind: "not-object" }
  | { kind: "invalid-field"; fieldName: string };

export type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };
```

### `validators.ts`

```ts
// Goal:
// Validate unknown input into public contract types.

// Expected result:
// Runtime validation returns a typed Result.

import type { ProductRecord, ProductValidationError, Result } from "./contracts.js";

export function parseProduct(value: unknown): Result<ProductRecord, ProductValidationError> {
  if (typeof value !== "object" || value === null) {
    return { ok: false, error: { kind: "not-object" } };
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== "string") {
    return { ok: false, error: { kind: "invalid-field", fieldName: "id" } };
  }

  if (typeof candidate.title !== "string") {
    return { ok: false, error: { kind: "invalid-field", fieldName: "title" } };
  }

  if (typeof candidate.priceCents !== "number") {
    return { ok: false, error: { kind: "invalid-field", fieldName: "priceCents" } };
  }

  return {
    ok: true,
    value: {
      id: candidate.id,
      title: candidate.title,
      priceCents: candidate.priceCents,
    },
  };
}
```

### `formatters.ts`

```ts
// Goal:
// Export runtime formatting utilities.

// Expected result:
// Consumers can format validated products.

import type { ProductRecord } from "./contracts.js";

function formatCents(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function formatProductCard(product: ProductRecord): string {
  return `${product.title}: ${formatCents(product.priceCents)}`;
}
```

### `errors.ts`

```ts
// Goal:
// Render validation errors for consumers.

// Expected result:
// Error rendering handles every known error kind.

import type { ProductValidationError } from "./contracts.js";

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

export function renderProductValidationError(error: ProductValidationError): string {
  switch (error.kind) {
    case "not-object":
      return "Expected an object";
    case "invalid-field":
      return `Invalid field: ${error.fieldName}`;
    default:
      return assertNever(error);
  }
}
```

### `index.ts`

```ts
// Goal:
// Expose the public API of the mini SDK.

// Expected result:
// Consumers import only from this file.

export type {
  ProductRecord,
  ProductValidationError,
  Result,
} from "./contracts.js";

export { parseProduct } from "./validators.js";
export { formatProductCard } from "./formatters.js";
export { renderProductValidationError } from "./errors.js";
```

### `app.ts`

```ts
// Goal:
// Consume the mini SDK through its public API.

// Expected result:
// The app does not import from internal modules directly.

import {
  formatProductCard,
  parseProduct,
  renderProductValidationError,
} from "./index.js";

const rawValue: unknown = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

const result = parseProduct(rawValue);

if (result.ok) {
  console.log(formatProductCard(result.value));
} else {
  console.log(renderProductValidationError(result.error));
}
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `contracts.ts` 只定义公共类型。 |
| 2 | `validators.ts` 导入类型并导出运行时 validator。 |
| 3 | `formatters.ts` 隐藏内部 `formatCents`，只导出 `formatProductCard`。 |
| 4 | `errors.ts` 用 `never` 检查错误渲染是否完整。 |
| 5 | `index.ts` 作为公共 API 入口。 |
| 6 | `app.ts` 只依赖 `index.ts`，不关心内部文件布局。 |
| 7 | 类型导入被擦除，值导入保留到运行时。 |

### 常见错误

```txt
错误：
调用方直接 import from "./validators.js" 更方便。

正确：
小项目可以这么做，但真实 SDK 应该通过 index.ts 控制公共 API。
内部文件路径越少暴露，后续重构越安全。
```

---

## 23. 最终文件清单

```txt
typescript/
  chapter-10-namespaces-modules/
    README.md

    00-module-problem-model/
      moduleBoundaryOverview.ts
      privateModuleScope.ts

    01-script-vs-module/
      scriptModeA.ts
      scriptModeB.ts
      moduleModeA.ts
      moduleModeB.ts
      emptyExportBoundary.ts

    02-named-default-exports/
      productFormatter.ts
      productFormatterConsumer.ts
      defaultExportFormatter.ts
      defaultExportConsumer.ts

    03-import-forms/
      priceMath.ts
      renamedImportConsumer.ts
      namespaceImportConsumer.ts
      sideBySideImportConsumer.ts

    04-type-only-import-export/
      productTypes.ts
      productRuntime.ts
      importTypeConsumer.ts
      inlineTypeImportConsumer.ts
      typeOnlyImportValueMistake.ts

    05-re-export-barrel/
      contracts.ts
      validators.ts
      index.ts
      consumer.ts

    06-dynamic-import/
      lazyFormatter.ts
      dynamicImportConsumer.ts
      dynamicImportTypes.ts

    07-side-effect-import/
      registerGlobals.ts
      sideEffectConsumer.ts
      moduleEvaluationOrder.ts
      liveBindingProducer.ts
      liveBindingConsumer.ts

    08-commonjs-interop/
      commonjsExport.cjs
      commonjsConsumer.cts
      esModuleConsumer.mts
      importEqualsRequire.ts

    09-amd-history/
      amdOutputExample.ts
      amdPositioning.md

    10-module-resolution/
      relativeImportExtensions.ts
      declarationFileResolution.ts
      moduleResolutionNotes.md
      ambientCssModule.d.ts

    11-nodenext-files/
      package-type-module.json
      esmEntry.mts
      cjsEntry.cts
      extensionMistake.ts
      packageExportsBoundary.json

    12-paths-baseurl/
      tsconfig.paths.json
      productContract.ts
      aliasedImportConsumer.ts
      aliasRuntimeBoundary.ts

    13-namespaces/
      namespaceBasics.ts
      namespaceExportBoundary.ts
      nestedNamespace.ts

    14-namespace-output-conflicts/
      namespaceConflict.ts
      namespaceCompileOutput.ts
      needlessNamespaceInModule.ts

    15-declaration-merging/
      interfaceMerging.ts
      functionNamespaceMerge.ts
      enumNamespaceMerge.ts
      classNamespaceMerge.ts

    16-module-global-augmentation/
      observable.ts
      observableMap.ts
      observableConsumer.ts
      globalArrayExtension.ts

    17-mini-project/
      contracts.ts
      validators.ts
      formatters.ts
      errors.ts
      index.ts
      app.ts

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
Explain what TypeScript checks or emits.

Runtime mechanism:
Explain what Node, browser, bundler, or module loader actually does.

Code example:
Keep one example that proves the mechanism.

Common mistake:
Write one mistake you personally may make.

Project relation:
Connect it to frontend folders, API clients, SDKs, package exports, or Node scripts.
```

最终笔记必须包含这些对比：

```txt
script mode vs module mode
module scope vs global scope
named export vs default export
value import vs type-only import
static import vs dynamic import
side-effect import vs named import
re-export vs direct export
barrel file vs internal module
ES Modules vs CommonJS
CommonJS require vs ES import
module vs moduleResolution
NodeNext vs Bundler moduleResolution
.ts vs .mts vs .cts
.js import specifier vs .ts source file
paths alias vs runtime resolution
namespace vs module
namespace export vs module export
namespace merge vs interface merge
function namespace merge vs object property assignment
module augmentation vs runtime patch
ambient declaration vs runtime implementation
live binding vs copied value
path alias type-only import vs path alias value import
package exports public API vs internal file path
readonly public API vs internal implementation
```

---

## 25. 本章最终要能回答的问题

学完第 10 章后，你必须能不用查资料回答这些问题：

1. 模块到底解决什么工程问题？
2. 什么情况下 `.ts` 文件是 script？什么情况下是 module？
3. 为什么学习文件里经常写 `export {};`？
4. 模块作用域和全局作用域有什么区别？
5. `export` 暴露的是类型、值，还是两者都有可能？
6. 命名导出和默认导出有什么差异？
7. default import 为什么可以随便命名？
8. namespace import 适合什么场景？
9. `import type` 为什么不会生成运行时代码？
10. `verbatimModuleSyntax` 为什么会让 type-only 边界更重要？
11. re-export 和 barrel 文件解决什么问题？
12. barrel 文件有什么风险？
13. 动态导入和静态导入的加载时机有什么不同？
14. 副作用导入会做什么？
15. 模块顶层代码什么时候执行？会执行几次？
16. CommonJS 和 ES Modules 的核心机制有什么不同？
17. `require`、`module.exports` 和 `import`、`export` 分别属于什么系统？
18. TypeScript 的 `module` 选项控制什么？
19. `moduleResolution` 控制什么？
20. 为什么 TypeScript 找得到模块，不等于 Node 一定能运行？
21. NodeNext 模式下 `.mts` 和 `.cts` 分别表示什么？
22. package.json 的 `type` 字段如何影响普通 `.ts` 文件？
23. 为什么 ESM 相对导入常常要写 `.js` 扩展名？
24. `paths` 和 `baseUrl` 为什么不能单独保证运行时可用？
25. namespace 是什么？和 module 有什么区别？
26. 为什么现代模块项目不建议再套 namespace？
27. namespace 内部成员为什么需要 `export` 才能被外部访问？
28. namespace 编译输出大致是什么样子？
29. 声明合并是什么？哪些声明常见地可以合并？
30. interface 合并和 type alias 重复声明有什么区别？
31. function + namespace merge 模拟了什么 JS 模式？
32. module augmentation 只做了类型补充，为什么还需要运行时代码？
33. global augmentation 为什么风险更高？
34. 如何设计一个模块化小型 SDK 的公共 API？
35. 第 10 章如何连接前面第 3 到第 9 章的所有代码组织能力？
36. ESM import 为什么是 live binding，而不是普通值复制？
37. 为什么导入绑定在导入方不能重新赋值？
38. `import type` 为什么不会执行被导入模块的顶层代码？
39. `.d.ts` 文件为什么不能代替真实运行时实现？
40. package.json `exports` 为什么属于公共 API 设计？
41. path alias 什么时候只影响类型检查，什么时候会影响运行时？
42. class + namespace merging 可以模拟什么 JavaScript API 形状？
43. module augmentation 的 specifier 为什么必须和真实 import specifier 对齐？

---

## 26. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)  
   重点读 How JavaScript Modules are Defined、Non-modules、ES Module Syntax、TypeScript Specific ES Module Syntax、CommonJS Syntax、Module Resolution、Module Output Options。

2. [Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)  
   重点读 NodeNext、package.json `type`、文件扩展名、ESM/CJS 互操作、模块解析细节。

3. [Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html)  
   重点读 namespacing、splitting across files、multi-file namespaces、aliases、ambient namespaces。现代项目不主推 namespace，但要读懂旧代码和声明文件。

4. [Namespaces and Modules](https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html)  
   重点读 Using Modules、Using Namespaces、Needless Namespacing、Trade-offs of Modules。记住现代代码推荐 modules over namespaces。

5. [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)  
   重点读 Basic Concepts、Merging Interfaces、Merging Namespaces、Merging Namespaces with Classes / Functions / Enums、Module Augmentation、Global Augmentation。

6. [TypeScript 3.8 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html)  
   重点读 type-only imports and exports。理解为什么 `import type` 对模块输出和转译工具很重要。

7. [TSConfig module](https://www.typescriptlang.org/tsconfig/module.html)  
   理解 `ES2022`、`CommonJS`、`NodeNext`、`Preserve` 等输出模式差异。

8. [TSConfig moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html)  
   理解 `NodeNext`、`Bundler`、`Node10`、`Classic` 的适用场景。

9. [TSConfig verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html)  
   理解为什么现代 TS 更鼓励你明确写 `type` 修饰符。

10. [TSConfig isolatedModules](https://www.typescriptlang.org/tsconfig/isolatedModules.html)  
    理解 Babel、swc、esbuild 这类单文件转译器为什么需要更严格的限制。

11. [TSConfig esModuleInterop](https://www.typescriptlang.org/tsconfig/esModuleInterop.html) 和 [allowSyntheticDefaultImports](https://www.typescriptlang.org/tsconfig/allowSyntheticDefaultImports.html)  
    理解 CommonJS 默认导入互操作的类型检查和输出差异。

---

## 27. 第 10 章最终记忆模型

```txt
Modules in JavaScript:
  files are dependency boundaries.
  imports connect dependencies.
  ESM imports are live read-only bindings.
  exports define public API.
  module loaders locate and execute modules.
  modules are usually evaluated once and cached.
  ESM and CommonJS have different runtime rules.

Modules in TypeScript:
  files with import/export have module scope.
  files without import/export are scripts.
  type-only imports are erased.
  module controls JavaScript output.
  moduleResolution controls how specifiers map to files.
  declaration files describe modules without implementation.
  paths affects TypeScript resolution but does not rewrite runtime imports by itself.
  verbatimModuleSyntax makes type-only boundaries explicit.

Namespaces in TypeScript:
  TypeScript-specific grouping syntax.
  useful for legacy global code and declarations.
  exported namespace members become public.
  modern module files usually do not need namespaces.

Declaration merging:
  same-name declarations can combine.
  interfaces can merge.
  namespaces can merge with functions, classes, and enums in specific patterns.
  module augmentation changes the compiler's view of a module.
  runtime patching must still happen separately.
```

### 最终一句话

```txt
第 3 章让你描述值的形状。
第 4 章让你描述行为的边界。
第 5 章让你描述对象的长期结构和抽象契约。
第 6 章让你理解类型系统如何比较、缩小、派生、转换和保护类型。
第 7 章让你把失败路径变成可读、可检查、可组合的代码结构。
第 8 章让你把未来值、并发任务、异步序列和跨线程消息协议建模清楚。
第 9 章让你把类型能力放进框架和前后端边界。
第 10 章让你把所有这些代码拆成清晰、可维护、可重构的模块边界。

真正的 TypeScript 模块学习，不是背 import/export 写法，而是能分清脚本模式、模块作用域、值导入、类型导入、编译输出、运行时加载、命名空间和声明合并之间的边界。
```

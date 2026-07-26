# TypeScript 第 11 章“与 JavaScript 互操作”学习指导文件 v1

> 定位：这是 TypeScript 第 11 章“与 JavaScript 互操作”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.js` / `.ts` / `.d.ts` 文件、运行 `tsc` 类型检查、观察声明文件、迁移步骤和第三方库类型补充方式，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 11 章“与 JavaScript 互操作”，TypeScript 官方 Handbook / Reference 的 Declaration Files、JSDoc Reference、Type Checking JavaScript Files、Creating `.d.ts` Files from `.js` Files、Modules、Declaration Merging，以及 TSConfig 官方文档中的 `allowJs`、`checkJs`、`declaration`、`emitDeclarationOnly`、`types`、`typeRoots`、`skipLibCheck`、`maxNodeModuleJsDepth`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名、字符串和代码注释统一英文；代码块中不使用中文字符。  
> 学习原则：先理解 JavaScript 代码在运行时真实存在什么，再理解 TypeScript 如何通过 JSDoc、`.d.ts`、`@types/*`、局部声明和逐步迁移把它纳入静态类型系统。不要把互操作学成“所有 unknown 都 as 成 any”。

> 重要说明：第 11 章不是“退回 JavaScript”。它训练的是工程过渡能力：面对历史 JS、第三方 JS、缺类型包、混合仓库时，如何逐步建立可信类型边界。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 高质量声明文件的定位、结构、模板、发布和消费 | [Declaration Files Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) |
| 从 API 使用方式反推 `.d.ts` 写法，声明全局变量、函数、对象、类、模块 | [Declaration Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html) |
| 模块声明文件、`export =`、CommonJS 风格库、默认导出和命名导出声明模板 | [Modules .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html) |
| 全局库声明、全局变量、全局函数、全局 namespace 的 `.d.ts` 模板 | [Global .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html) |
| JavaScript 项目如何使用 TypeScript 进行类型检查 | [JS Projects Utilizing TypeScript](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html) |
| JavaScript 文件中的类型检查规则和 `.js` 与 `.ts` 的差异 | [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html) |
| JSDoc 中 `@type`、`@param`、`@returns`、`@typedef`、`@callback`、`@template`、`@import` 等支持 | [JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) |
| 从 `.js` 文件生成 `.d.ts` | [Creating .d.ts Files from .js files](https://www.typescriptlang.org/docs/handbook/declaration-files/dts-from-js.html) |
| 查找和安装类型声明包 | [Declaration Files Consumption](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html) |
| 引入 JS 文件参与 TS 项目 | [TSConfig allowJs](https://www.typescriptlang.org/tsconfig/allowJs.html) |
| 对 JS 文件做类型检查 | [TSConfig checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html) |
| 生成声明文件 | [TSConfig declaration](https://www.typescriptlang.org/tsconfig/declaration.html) |
| 只生成声明文件，不生成 JavaScript | [TSConfig emitDeclarationOnly](https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html) |
| 控制全局 `@types/*` 包进入项目 | [TSConfig types](https://www.typescriptlang.org/tsconfig/types.html) |
| 控制自定义类型声明查找目录 | [TSConfig typeRoots](https://www.typescriptlang.org/tsconfig/typeRoots.html) |
| JS 项目中检查 `node_modules` 内 JS 的最大深度 | [TSConfig maxNodeModuleJsDepth](https://www.typescriptlang.org/tsconfig/maxNodeModuleJsDepth.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 11 章完整学习顺序](#3-第-11-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：与 JavaScript 互操作到底在解决什么](#5-00与-javascript-互操作到底在解决什么)
6. [01：allowJs、checkJs 和迁移入口](#6-01allowjscheckjs-和迁移入口)
7. [02：在 JavaScript 文件里使用 @ts-check](#7-02在-javascript-文件里使用-ts-check)
8. [03：JSDoc 参数、返回值和对象形状](#8-03jsdoc-参数返回值和对象形状)
9. [04：JSDoc typedef、callback 和泛型](#9-04jsdoc-typedefcallback-和泛型)
10. [05：JSDoc import type 和跨文件类型复用](#10-05jsdoc-import-type-和跨文件类型复用)
11. [06：生成声明文件 .d.ts](#11-06生成声明文件-dts)
12. [07：外参变量声明 declare const](#12-07外参变量声明-declare-const)
13. [08：外参类型声明 declare interface/type/namespace](#13-08外参类型声明-declare-interfacetypenamespace)
14. [09：外参模块声明 declare module](#14-09外参模块声明-declare-module)
15. [10：全局 .d.ts 和模块 .d.ts 的区别](#15-10全局-dts-和模块-dts-的区别)
16. [11：逐步迁移步骤一：添加 TSC](#16-11逐步迁移步骤一添加-tsc)
17. [12：逐步迁移步骤二：检查 JS，可选加入 JSDoc](#17-12逐步迁移步骤二检查-js可选加入-jsdoc)
18. [13：逐步迁移步骤三：把文件重命名为 .ts](#18-13逐步迁移步骤三把文件重命名为-ts)
19. [14：逐步迁移步骤四：逐步打开 strict](#19-14逐步迁移步骤四逐步打开-strict)
20. [15：寻找第三方 JavaScript 的类型信息](#20-15寻找第三方-javascript-的类型信息)
21. [16：使用自带类型的 JavaScript 包](#21-16使用自带类型的-javascript-包)
22. [17：使用 DefinitelyTyped 和 @types 包](#22-17使用-definitelytyped-和-types-包)
23. [18：没有类型声明的第三方包](#23-18没有类型声明的第三方包)
24. [19：包装不可信 JavaScript API](#24-19包装不可信-javascript-api)
25. [20：小项目整合](#25-20小项目整合)
26. [最终文件清单](#26-最终文件清单)
27. [最终学习笔记转换要求](#27-最终学习笔记转换要求)
28. [本章最终要能回答的问题](#28-本章最终要能回答的问题)
29. [TS 官方文档阅读清单](#29-ts-官方文档阅读清单)
30. [第 11 章最终记忆模型](#30-第-11-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个让你把 JavaScript 项目逐步纳入 TypeScript 类型系统的训练指导。

第 11 章必须同时观察四件事：

```txt
JavaScript runtime:
  existing JavaScript code still runs as JavaScript.

TypeScript checker:
  TypeScript can check JavaScript files when allowJs and checkJs are enabled.

JSDoc layer:
  comments can provide static type information without renaming files.

Declaration layer:
  .d.ts files describe runtime JavaScript APIs without implementing them.
```

本章的核心问题不是“JS 和 TS 能不能混用”，而是：

```txt
How do we describe JavaScript code accurately enough for TypeScript without lying about runtime behavior?
```

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. Read the conclusion first.
2. Classify the concept as migration config, JSDoc typing, ambient declaration, module declaration, third-party typing, or runtime wrapper.
3. Create the target directory.
4. Write one correct example file.
5. Write one mistake example file and mark the expected error with @ts-expect-error when possible.
6. Run npx tsc --noEmit.
7. For declaration generation examples, run npx tsc with declaration output.
8. Compare JavaScript runtime behavior with TypeScript's static view.
9. Convert the section into your final notes.
```

### 推荐 tsconfig

本章建议准备两个配置：一个用于“检查 JS 项目”，一个用于“迁移到 TS 后的严格项目”。

`tsconfig.js-migration.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "strict": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["chapter-11-js-interop/**/*"]
}
```

`tsconfig.strict.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowJs": false,
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
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

用于从 JS 生成声明文件的配置：

```json
{
  "compilerOptions": {
    "allowJs": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "types",
    "strict": true
  },
  "include": ["src/**/*.js"]
}
```

### 代码注释模板

`.ts` 文件顶部：

```ts
// Goal:
// Verify how this JavaScript interop example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`.js` 文件顶部：

```js
// @ts-check

// Goal:
// Verify how TypeScript checks this JavaScript file.

// Expected result:
// Replace this block with the compiler result or runtime output.
```

---

## 2. 项目重新整理建议

### 结论

第 11 章建议单独建立：

```txt
typescript/chapter-11-js-interop/
```

第 10 章训练模块边界，第 11 章训练“模块之外的现实世界”：历史 JS、JSDoc、`.d.ts`、第三方包、迁移阶段和不可信运行时 API。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json
  tsconfig.js-migration.json
  tsconfig.strict.json
  tsconfig.declarations.json

  chapter-03-types/
  chapter-04-functions/
  chapter-05-classes-interfaces/
  chapter-06-advanced-types/
  chapter-07-error-handling/
  chapter-08-async-concurrency-parallelism/
  chapter-09-frameworks/
  chapter-10-namespaces-modules/

  chapter-11-js-interop/
    README.md

    00-interop-problem-model/
      runtimeVsStaticDescription.js
      typeDeclarationBoundary.ts

    01-allowjs-checkjs/
      legacyPrice.js
      consumer.ts
      configNotes.md

    02-ts-check/
      checkedFormatter.js
      uncheckedFormatter.js
      tsCommentDirectives.js

    03-jsdoc-params-returns/
      formatPrice.js
      objectShape.js
      nullableLookup.js
      openEndedObjectLiteral.js
      optionalParamsAndDefaults.js

    04-jsdoc-typedef-callback-generic/
      typedefProduct.js
      callbackHandler.js
      genericIdentity.js

    05-jsdoc-import-types/
      productTypes.d.ts
      jsdocImportConsumer.js
      jsdocTypeofImport.js
      jsdocImportTagConsumer.js
      jsdocSatisfiesCheck.js

    06-generate-declarations/
      src/publicApi.js
      tsconfig.declarations.json
      generatedDeclarationNotes.md

    07-ambient-variables/
      analytics-global.d.ts
      analyticsConsumer.ts
      missingRuntimeValue.ts

    08-ambient-types/
      globalProductTypes.d.ts
      namespaceDeclaration.d.ts
      ambientTypeConsumer.ts

    09-ambient-modules/
      legacy-utils.d.ts
      legacyModuleConsumer.ts
      wildcardModuleDeclaration.d.ts

    10-global-vs-module-dts/
      globalLibrary.d.ts
      moduleLibrary.d.ts
      globalModuleBoundary.ts
      declareGlobalInModule.d.ts

    11-migration-add-tsc/
      tsconfig.step1.json
      legacyCalculator.js
      migrationCheck.ts

    12-migration-checkjs-jsdoc/
      legacyParser.js
      legacyParserWithJsdoc.js
      jsdocMigrationNotes.md

    13-migration-rename-to-ts/
      beforeRename.js
      afterRename.ts
      renameRules.md

    14-migration-strict/
      looseUser.ts
      strictUser.ts
      strictUpgradePlan.md

    15-find-types/
      packageTypeSources.md
      packageJsonTypes.ts
      npmTypesNotes.md

    16-bundled-types/
      bundledTypesConsumer.ts
      packageTypesField.md

    17-definitelytyped/
      installTypes.md
      nodeTypesConsumer.ts
      typesOptionBoundary.md

    18-untyped-third-party/
      localShim.d.ts
      unsafeConsumer.ts
      typedWrapper.ts
      anyShimRisk.d.ts
      unknownFirstPackage.d.ts
      unknownFirstWrapper.ts

    19-wrapper-boundary/
      unsafeLegacyApi.js
      unsafeLegacyApi.d.ts
      safeLegacyWrapper.ts
      anyLeakMistake.ts

    20-mini-project/
      legacyCart.js
      legacyCart.d.ts
      cartTypes.ts
      cartValidator.ts
      cartWrapper.ts
      app.ts

notes/
  typescript.md
```

### 和真实工程的关系

```txt
legacy JavaScript project:
  use allowJs and checkJs to start type checking before renaming files.

mixed TS and JS repo:
  use JSDoc and .d.ts to describe JS modules.

third-party JavaScript package:
  use bundled types, @types packages, or local shims.

unsafe runtime boundary:
  use unknown, validators, and typed wrappers.

migration plan:
  add tsc first, check JS next, add JSDoc, rename files, then tighten strictness.
```

---

## 3. 第 11 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
interop problem model
  -> allowJs and checkJs
  -> @ts-check
  -> JSDoc params and returns
  -> JSDoc typedef, callback, and generics
  -> JSDoc import types
  -> generating .d.ts from .js
  -> ambient variable declarations
  -> ambient type declarations
  -> ambient module declarations
  -> global .d.ts vs module .d.ts
  -> migration step 1 add TSC
  -> migration step 2 check JS and add JSDoc
  -> migration step 3 rename to .ts
  -> migration step 4 strict mode
  -> finding third-party types
  -> bundled types
  -> DefinitelyTyped and @types
  -> untyped packages
  -> safe wrapper boundary
  -> mini project
```

### 技术意义

前面章节默认你在写 TypeScript。第 11 章开始处理真实工程中更常见的情况：

```txt
Some code is still JavaScript.
Some libraries have types.
Some libraries have no types.
Some APIs are global variables.
Some packages are CommonJS.
Some types are wrong or incomplete.
Some migration steps must be incremental.
```

TypeScript 的目标不是一次性把所有 JavaScript 改成 TypeScript，而是在风险可控的路径上逐步增加类型信息。

---

## 4. 本章先要建立的底层模型

### 结论

TypeScript 和 JavaScript 互操作可以拆成五层：

```txt
runtime layer:
  JavaScript values, modules, globals, packages, and side effects.

static description layer:
  JSDoc comments and .d.ts declarations describe those values.

checker layer:
  TypeScript checks JS and TS files using inferred, annotated, or declared types.

migration layer:
  allowJs, checkJs, JSDoc, file renaming, and strict options are turned on gradually.

trust boundary layer:
  declarations describe expected APIs, but runtime validation is still needed at external boundaries.
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| `allowJs` | 允许 TypeScript 项目包含 `.js` 文件。 |
| `checkJs` | 让 TypeScript 对 `.js` 文件报告类型错误。 |
| `@ts-check` | 在单个 JavaScript 文件中开启类型检查。 |
| `@ts-nocheck` | 在单个 JavaScript 文件中关闭类型检查。 |
| JSDoc | 用注释给 JavaScript 提供类型信息。 |
| `.d.ts` | 声明文件，只描述类型和 API 形状，不包含实现。 |
| ambient declaration | 使用 `declare` 描述已经存在的运行时值。 |
| global declaration | 描述全局变量、全局函数或全局 namespace。 |
| module declaration | 描述某个模块名导出的 API。 |
| DefinitelyTyped | 社区维护的类型声明仓库，通常通过 `@types/*` 包安装。 |
| bundled types | npm 包自己携带的类型声明。 |
| shim | 临时的本地声明文件，用来让缺类型模块先通过检查。 |
| wrapper | 用一个安全 TS 模块包住不可信 JS API。 |

### 底层机制总图

```txt
existing JavaScript code
  -> TypeScript includes it with allowJs
  -> TypeScript checks it with checkJs or @ts-check
  -> JSDoc supplies local type information
  -> .d.ts files describe external values and modules
  -> imports connect TS code to JS code
  -> emitted JavaScript still runs as JavaScript
```

### 本章最重要的边界

```txt
A declaration file is not an implementation.
A type assertion is not runtime validation.
A JSDoc comment does not change JavaScript behavior.
A third-party type package can be incomplete or wrong.
A local declare module can unblock migration but can also hide errors.
A wrapper can isolate unsafe APIs and protect the rest of the codebase.
```

### 本章必须先补：`.js` 检查不是 `.ts` 检查的简单弱化版

JavaScript 文件进入 TypeScript 检查后，checker 会尽量尊重 JavaScript 既有写法，所以它和 `.ts` 文件有几个重要差异。

| 差异点 | `.js` 文件中的默认倾向 | 学习时的正确处理 |
|---|---|---|
| object literal | 没有 JSDoc 时更像 open-ended object | 重要对象用 `@type` 关闭开放形状。 |
| 函数参数 | 很多场景会比 `.ts` 更宽松 | 导出函数必须写 `@param`。 |
| `null` / `undefined` 初始化 | 容易退到 `any` 或宽松推导 | 迁移时主动写 JSDoc 或改成 `.ts`。 |
| `@ts-check` | 只让 JS 被检查，不改变运行时 | 不能把注释当成运行时保护。 |
| `.d.ts` | 只描述已经存在的 JS API | 不能把声明文件当实现文件。 |

所以本章最重要的判断不是“能不能让报错消失”，而是：

```txt
This JavaScript value really exists at runtime.
This JSDoc or .d.ts declaration describes it accurately.
The unsafe value does not leak beyond the wrapper boundary.
```


---

## 5. 00：与 JavaScript 互操作到底在解决什么

### 结论

与 JavaScript 互操作解决的是：在不重写全部现有代码的前提下，让 TypeScript 理解已有运行时 API。

### 技术意义

JavaScript 运行时值已经存在。TypeScript 需要一个静态描述来检查调用是否安全。这个描述可以来自推导、JSDoc、`.d.ts`、包内类型、`@types` 或本地声明。

### 文件结构

```txt
00-interop-problem-model/
  runtimeVsStaticDescription.js
  typeDeclarationBoundary.ts
```

### `runtimeVsStaticDescription.js`

```js
// @ts-check

// Goal:
// Show that JavaScript implementation still runs as JavaScript.

// Expected result:
// TypeScript checks this JavaScript function when checkJs is enabled.

/**
 * @param {number} priceCents
 * @returns {string}
 */
export function formatPrice(priceCents) {
  return `$${(priceCents / 100).toFixed(2)}`;
}
```

### `typeDeclarationBoundary.ts`

```ts
// Goal:
// Import a JavaScript value and use its static description.

// Expected result:
// The compiler accepts valid calls and rejects invalid calls.

import { formatPrice } from "./runtimeVsStaticDescription.js";

console.log(formatPrice(9900));

// @ts-expect-error: formatPrice expects a number.
console.log(formatPrice("9900"));
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `.js` 文件提供真实运行时函数。 |
| 2 | JSDoc 描述函数参数和返回值。 |
| 3 | TypeScript 检查 TS 文件里的导入和调用。 |
| 4 | 编译输出中 JSDoc 不改变运行时行为。 |
| 5 | Node 或浏览器仍然执行普通 JavaScript。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| JS 文件不能被 TypeScript 检查 | `allowJs` 和 `checkJs` 可以让 TS 检查 JS 文件。 |
| JSDoc 会改变函数运行方式 | JSDoc 只提供静态类型信息。 |
| `.d.ts` 会生成函数 | `.d.ts` 只描述已经存在的函数。 |

---

## 6. 01：allowJs、checkJs 和迁移入口

### 结论

`allowJs` 让 TypeScript 项目包含 JavaScript 文件；`checkJs` 让 TypeScript 对 JavaScript 文件报告类型错误。迁移项目通常先开 `allowJs`，再逐步开 `checkJs`。

### 技术意义

这是最温和的迁移入口。你不需要立刻把 `.js` 改成 `.ts`，就能先让 TypeScript 看见项目结构。

### 文件结构

```txt
01-allowjs-checkjs/
  legacyPrice.js
  consumer.ts
  configNotes.md
```

### `legacyPrice.js`

```js
// @ts-check

// Goal:
// Keep implementation in JavaScript while adding type checking.

/**
 * @param {number} priceCents
 * @returns {string}
 */
export function formatPrice(priceCents) {
  return `$${(priceCents / 100).toFixed(2)}`;
}
```

### `consumer.ts`

```ts
// Goal:
// Consume a checked JavaScript module from TypeScript.

import { formatPrice } from "./legacyPrice.js";

console.log(formatPrice(1299));

// @ts-expect-error: The argument must be a number.
console.log(formatPrice("1299"));
```

### `configNotes.md`

```txt
allowJs:
  TypeScript includes JavaScript files in the program.

checkJs:
  TypeScript reports type errors in JavaScript files.

@ts-check:
  Enables checking in one JavaScript file.

@ts-nocheck:
  Disables checking in one JavaScript file.
```

### 常见错误

```txt
Mistake:
  Turn on strict and rename every file on day one.

Correct:
  Start with allowJs, observe errors, add JSDoc, then rename stable files.
```

---

## 7. 02：在 JavaScript 文件里使用 @ts-check

### 结论

`// @ts-check` 可以在单个 `.js` 文件中启用 TypeScript 类型检查，即使项目没有全局开启 `checkJs`。

### 技术意义

这适合逐个文件推进迁移。你可以先挑稳定、依赖少、业务关键的 JS 文件加 `@ts-check`。

### 文件结构

```txt
02-ts-check/
  checkedFormatter.js
  uncheckedFormatter.js
```

### `checkedFormatter.js`

```js
// @ts-check

// Goal:
// Enable type checking for this JavaScript file.

/**
 * @param {string} titleText
 * @returns {string}
 */
export function formatTitle(titleText) {
  return titleText.trim().toUpperCase();
}

formatTitle("Keyboard");

// @ts-expect-error: formatTitle expects a string.
formatTitle(123);
```

### `uncheckedFormatter.js`

```js
// Goal:
// This file has no @ts-check directive.

/**
 * @param {string} titleText
 * @returns {string}
 */
export function formatUncheckedTitle(titleText) {
  return titleText.trim().toUpperCase();
}

formatUncheckedTitle(123);
```

### `tsCommentDirectives.js`

```js
// @ts-check

// Goal:
// Compare TypeScript migration comment directives in JavaScript.

// Expected result:
// The expect-error directive must match a real checker error.

/**
 * @param {number} priceCents
 * @returns {string}
 */
export function formatCents(priceCents) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

// @ts-expect-error: priceCents must be a number.
formatCents("9900");

// @ts-ignore: This hides the next line even if the error later disappears.
formatCents("2500");
```

### 补充机制：`@ts-expect-error` 和 `@ts-ignore` 在迁移中的边界

| 指令 | 作用 | 迁移建议 |
|---|---|---|
| `@ts-expect-error` | 下一行应该有一个类型错误；如果错误消失，它自己会报错。 | 用来记录“我知道这里正在迁移”。 |
| `@ts-ignore` | 直接忽略下一行错误；错误消失也不会提醒你。 | 只在无法表达的第三方边界短期使用。 |
| `@ts-nocheck` | 关闭整个 JS 文件检查。 | 只能作为临时隔离，不要成为最终方案。 |


### 常见错误

| 错误 | 正确模型 |
|---|---|
| `@ts-check` 只能写在 TS 文件里 | 它是给 JavaScript 文件使用的。 |
| 加了 JSDoc 就一定会报错 | 还需要 `checkJs` 或单文件 `@ts-check`。 |
| 用 `@ts-ignore` 处理所有迁移错误 | 优先补类型或重构边界。 |

---

## 8. 03：JSDoc 参数、返回值和对象形状

### 结论

JSDoc 可以用 `@param`、`@returns`、`@type` 描述 JavaScript 函数和变量的类型。

### 技术意义

JSDoc 是迁移中间层：不改变文件扩展名，也能让 TypeScript 理解函数边界和对象形状。

### 文件结构

```txt
03-jsdoc-params-returns/
  formatPrice.js
  objectShape.js
  nullableLookup.js
```

### `formatPrice.js`

```js
// @ts-check

// Goal:
// Type JavaScript function parameters and return value with JSDoc.

/**
 * @param {number} priceCents
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatPrice(priceCents, currencyCode) {
  return `${currencyCode} ${(priceCents / 100).toFixed(2)}`;
}

console.log(formatPrice(9900, "USD"));

// @ts-expect-error: priceCents must be a number.
formatPrice("9900", "USD");
```

### `objectShape.js`

```js
// @ts-check

// Goal:
// Type an object shape in JavaScript with JSDoc.

/** @type {{ id: string, title: string, priceCents: number }} */
const product = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(product.title);

// @ts-expect-error: priceCents must be a number.
product.priceCents = "9900";
```

### `nullableLookup.js`

```js
// @ts-check

// Goal:
// Model nullable results in JavaScript with JSDoc.

/**
 * @param {{ id: string, title: string }[]} products
 * @param {string} id
 * @returns {{ id: string, title: string } | null}
 */
export function findProduct(products, id) {
  return products.find((product) => product.id === id) ?? null;
}

const product = findProduct([], "p1");

if (product !== null) {
  console.log(product.title);
}
```

### `openEndedObjectLiteral.js`

```js
// @ts-check

// Goal:
// Compare open-ended JavaScript object inference with a closed JSDoc shape.

// Expected result:
// The first object allows extension, while the JSDoc-typed object rejects it.

const looseProduct = {
  id: "p1",
};

looseProduct.title = "Keyboard";
console.log(looseProduct.title);

/** @type {{ id: string }} */
const strictProduct = {
  id: "p2",
};

// @ts-expect-error: title was not declared in the JSDoc object shape.
strictProduct.title = "Mouse";
```

### `optionalParamsAndDefaults.js`

```js
// @ts-check

// Goal:
// Use JSDoc optional parameters and default values.

// Expected result:
// The fallback parameter is optional for callers.

/**
 * @param {string | undefined} titleText
 * @param {string} [fallbackText="Untitled"]
 * @returns {string}
 */
export function normalizeTitle(titleText, fallbackText = "Untitled") {
  if (titleText === undefined || titleText.trim().length === 0) {
    return fallbackText;
  }

  return titleText.trim();
}

console.log(normalizeTitle("Keyboard"));
console.log(normalizeTitle(undefined, "Missing title"));
```

### 补充机制：JSDoc 不是普通注释

```txt
@param:
  describes a function input boundary.

@returns:
  describes a function output boundary.

@type:
  can close an otherwise open-ended JavaScript object shape.

Optional parameter syntax:
  [name]
  [name=defaultValue]
```


### 常见错误

```txt
Mistake:
  Use JSDoc as loose documentation only.

Correct:
  Treat JSDoc as part of the static type boundary during migration.
```

---

## 9. 04：JSDoc typedef、callback 和泛型

### 结论

复杂对象、回调函数和通用函数可以用 `@typedef`、`@callback`、`@template` 建模。

### 技术意义

当 JS 文件内部开始出现重复对象形状和泛型关系时，不要复制注释。用 JSDoc 声明可复用类型。

### 文件结构

```txt
04-jsdoc-typedef-callback-generic/
  typedefProduct.js
  callbackHandler.js
  genericIdentity.js
```

### `typedefProduct.js`

```js
// @ts-check

// Goal:
// Define a reusable object type with JSDoc.

/**
 * @typedef {object} ProductRecord
 * @property {string} id
 * @property {string} title
 * @property {number} priceCents
 */

/**
 * @param {ProductRecord} product
 * @returns {string}
 */
export function formatProduct(product) {
  return `${product.title}:${product.priceCents}`;
}
```

### `callbackHandler.js`

```js
// @ts-check

// Goal:
// Define a reusable callback type with JSDoc.

/**
 * @typedef {{ id: string, title: string }} ProductRecord
 */

/**
 * @callback ProductHandler
 * @param {ProductRecord} product
 * @returns {void}
 */

/**
 * @param {ProductRecord[]} products
 * @param {ProductHandler} handler
 * @returns {void}
 */
export function visitProducts(products, handler) {
  for (const product of products) {
    handler(product);
  }
}
```

### `genericIdentity.js`

```js
// @ts-check

// Goal:
// Use @template to model a generic JavaScript function.

/**
 * @template ValueType
 * @param {ValueType} value
 * @returns {ValueType}
 */
export function identity(value) {
  return value;
}

const title = identity("Keyboard");
const count = identity(42);

console.log(title.toUpperCase());
console.log(count.toFixed(0));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有 JS 类型都只能写成 `any` | JSDoc 支持对象、联合、函数、泛型等常用类型。 |
| 泛型必须等到 `.ts` 文件才能写 | `@template` 可以在 JS 文件里表达类型参数。 |
| callback 参数写成 `Function` | 用 `@callback` 写清楚参数和返回值。 |

---

## 10. 05：JSDoc import type 和跨文件类型复用

### 结论

JavaScript 文件可以通过 JSDoc 的 `import("./file").TypeName` 或 `@import` 复用其他文件导出的类型。

### 技术意义

迁移项目里经常会先把类型放到 `.d.ts` 或 `.ts` 文件中，然后让 `.js` 文件通过 JSDoc 引用这些类型。

### 文件结构

```txt
05-jsdoc-import-types/
  productTypes.d.ts
  jsdocImportConsumer.js
  jsdocTypeofImport.js
```

### `productTypes.d.ts`

```ts
export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};
```

### `jsdocImportConsumer.js`

```js
// @ts-check

// Goal:
// Use an imported type inside JSDoc.

/**
 * @param {import("./productTypes.js").ProductRecord} product
 * @returns {string}
 */
export function formatImportedProduct(product) {
  return `${product.id}:${product.title}`;
}
```

### `jsdocTypeofImport.js`

```js
// @ts-check

// Goal:
// Use typeof import to reference a runtime export type.

/**
 * @type {typeof import("./jsdocImportConsumer.js").formatImportedProduct}
 */
const formatter = (product) => {
  return product.title.toUpperCase();
};

export { formatter };
```

### `jsdocImportTagConsumer.js`

```js
// @ts-check

// Goal:
// Use the JSDoc @import tag to bring a type name into JSDoc comments.

// Expected result:
// ProductRecord is available only in JSDoc type positions.

/** @import { ProductRecord } from "./productTypes.js" */

/**
 * @param {ProductRecord} product
 * @returns {string}
 */
export function formatWithImportTag(product) {
  return `${product.id}:${product.title}`;
}
```

### `jsdocSatisfiesCheck.js`

```js
// @ts-check

// Goal:
// Use JSDoc @satisfies to check a value without widening its inferred type.

// Expected result:
// The object must satisfy the expected status map shape.

/**
 * @typedef {"draft" | "paid" | "shipped"} OrderStatus
 */

/** @satisfies {Record<string, OrderStatus>} */
const orderStatusMap = {
  Draft: "draft",
  Paid: "paid",
  Shipped: "shipped",
};

const draftStatus = orderStatusMap.Draft;

console.log(draftStatus.toUpperCase());
```

### 补充机制：JSDoc import 不等于 runtime import

```txt
import("./file").TypeName:
  used inside a JSDoc type expression.

@import:
  brings a type name into JSDoc comments.

typeof import("./file").runtimeValue:
  gets the static type of an exported runtime value.

None of these forms executes the imported file by itself.
```


### 常见错误

```txt
Mistake:
  JSDoc import creates a runtime import.

Correct:
  JSDoc import types are for type checking and do not load runtime modules.
```

---

## 11. 06：生成声明文件 .d.ts

### 结论

TypeScript 可以从有 JSDoc 类型信息的 `.js` 文件生成 `.d.ts`，让 JS 库被 TS 项目消费。

### 技术意义

这适合你维护一个 JavaScript 包，但希望给 TypeScript 用户提供类型。实现仍然是 JS，类型入口是生成出来的声明文件。

### 文件结构

```txt
06-generate-declarations/
  src/publicApi.js
  tsconfig.declarations.json
  generatedDeclarationNotes.md
```

### `src/publicApi.js`

```js
// @ts-check

// Goal:
// Provide a typed JavaScript public API for declaration generation.

/**
 * @typedef {object} ProductRecord
 * @property {string} id
 * @property {string} title
 * @property {number} priceCents
 */

/**
 * @param {ProductRecord} product
 * @returns {string}
 */
export function formatProduct(product) {
  return `${product.title}:${product.priceCents}`;
}
```

### `tsconfig.declarations.json`

```json
{
  "compilerOptions": {
    "allowJs": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "types",
    "strict": true
  },
  "include": ["src/**/*.js"]
}
```

### 运行方式

```bash
npx tsc -p tsconfig.declarations.json
```

### `generatedDeclarationNotes.md`

```txt
Expected output:
  types/publicApi.d.ts

Questions to answer:
  What exported members are included?
  Which implementation details are missing?
  Which JSDoc annotations were preserved as types?
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `.d.ts` 是手写唯一方式 | 可以手写，也可以从 JS/TS 生成。 |
| 生成声明文件会生成运行时代码 | `emitDeclarationOnly` 只输出声明。 |
| 没有 JSDoc 也能得到高质量声明 | 输出质量依赖可推导信息和注释信息。 |

---

## 12. 07：外参变量声明 declare const

### 结论

`declare const` 用来告诉 TypeScript：这个变量在运行时已经由外部环境提供。它只声明类型，不创建变量。

### 技术意义

全局脚本、CDN 库、浏览器注入对象、测试环境全局对象，都可能需要外参变量声明。

### 文件结构

```txt
07-ambient-variables/
  analytics-global.d.ts
  analyticsConsumer.ts
  missingRuntimeValue.ts
```

### `analytics-global.d.ts`

```ts
declare const analytics: {
  track(eventName: string, payload: Record<string, unknown>): void;
};
```

### `analyticsConsumer.ts`

```ts
// Goal:
// Use an ambient global variable declared in a .d.ts file.

// Expected result:
// The compiler accepts the analytics global when the declaration is included.

export {};

analytics.track("product_viewed", {
  productId: "p1",
});
```

### `missingRuntimeValue.ts`

```ts
// Goal:
// Remember that declare const does not create a runtime value.

// Expected result:
// This compiles only if the declaration exists, but runtime still needs the global.

export {};

console.log(typeof analytics);
```

### 常见错误

```txt
Mistake:
  declare const analytics creates analytics at runtime.

Correct:
  It only tells TypeScript that analytics should exist at runtime.
```

---

## 13. 08：外参类型声明 declare interface/type/namespace

### 结论

外参类型声明描述已经存在的全局类型、全局 namespace 或全局 API 形状。它通常放在 `.d.ts` 文件中。

### 技术意义

当 JS 库暴露全局对象并在对象下组织 API 时，`.d.ts` 可以用 `declare namespace` 或全局 interface 描述它。

### 文件结构

```txt
08-ambient-types/
  globalProductTypes.d.ts
  namespaceDeclaration.d.ts
  ambientTypeConsumer.ts
```

### `globalProductTypes.d.ts`

```ts
interface LegacyProductRecord {
  id: string;
  title: string;
  priceCents: number;
}
```

### `namespaceDeclaration.d.ts`

```ts
declare namespace LegacyFormatting {
  function formatTitle(titleText: string): string;

  type FormatMode = "short" | "long";
}
```

### `ambientTypeConsumer.ts`

```ts
// Goal:
// Consume global ambient types.

// Expected result:
// The compiler knows global interfaces and namespaces.

export {};

const product: LegacyProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

const mode: LegacyFormatting.FormatMode = "short";

console.log(product.title);
console.log(mode);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `declare namespace` 一定会生成对象 | 它只声明运行时已经存在的对象形状。 |
| 全局 interface 没有风险 | 全局声明会影响整个项目类型环境。 |
| `.d.ts` 里可以写实现逻辑 | 声明文件只写签名和类型。 |

---

## 14. 09：外参模块声明 declare module

### 结论

`declare module "module-name"` 用来给一个无法被 TypeScript 理解的模块补充类型声明。

### 技术意义

当第三方 JS 包没有自带类型，也没有 `@types` 包时，可以先写本地 module declaration 让项目继续推进。

### 文件结构

```txt
09-ambient-modules/
  legacy-utils.d.ts
  legacyModuleConsumer.ts
  wildcardModuleDeclaration.d.ts
```

### `legacy-utils.d.ts`

```ts
declare module "legacy-utils" {
  export function formatTitle(titleText: string): string;

  export function parsePrice(inputText: string): number;
}
```

### `legacyModuleConsumer.ts`

```ts
// Goal:
// Consume a module described by an ambient module declaration.

// Expected result:
// The compiler accepts imports from legacy-utils.

import { formatTitle, parsePrice } from "legacy-utils";

console.log(formatTitle(" Keyboard "));
console.log(parsePrice("99.00").toFixed(2));

// @ts-expect-error: parsePrice expects a string.
parsePrice(99);
```

### `wildcardModuleDeclaration.d.ts`

```ts
declare module "*.svg" {
  const sourceUrl: string;
  export default sourceUrl;
}
```

### 常见错误

```txt
Mistake:
  declare module installs or implements the package.

Correct:
  It only tells TypeScript what the module exports should look like.
  The runtime package still must exist.
```

---

## 15. 10：全局 .d.ts 和模块 .d.ts 的区别

### 结论

没有顶层 `import` / `export` 的 `.d.ts` 通常向全局作用域添加声明；带顶层 `import` / `export` 的 `.d.ts` 是模块声明文件，默认不会污染全局。

### 技术意义

错误地把声明写进全局会让整个项目都“看见”不该看见的名字。现代项目优先让 `.d.ts` 成为模块，只在必要时用 `declare global`。

### 文件结构

```txt
10-global-vs-module-dts/
  globalLibrary.d.ts
  moduleLibrary.d.ts
  globalModuleBoundary.ts
```

### `globalLibrary.d.ts`

```ts
declare const globalLogger: {
  log(messageText: string): void;
};
```

### `moduleLibrary.d.ts`

```ts
export type ModuleProductRecord = {
  id: string;
  title: string;
};
```

### `globalModuleBoundary.ts`

```ts
// Goal:
// Compare global declarations and module declarations.

// Expected result:
// The global declaration is visible without import; module types require import.

import type { ModuleProductRecord } from "./moduleLibrary.js";

export {};

const product: ModuleProductRecord = {
  id: "p1",
  title: "Keyboard",
};

globalLogger.log(product.title);
```

### `declareGlobalInModule.d.ts`

```ts
export {};

declare global {
  const globalFeatureFlag: {
    enabled: boolean;
  };
}
```

### 补充机制：为什么模块 `.d.ts` 里还需要 `declare global`

```txt
No top-level import/export in .d.ts:
  declarations usually enter the global scope directly.

Top-level import/export in .d.ts:
  the declaration file itself becomes a module.

export {} plus declare global:
  keeps the file module-scoped while explicitly adding selected global names.
```


### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有 `.d.ts` 都是全局声明 | 顶层 import/export 会让 `.d.ts` 成为模块。 |
| 模块 `.d.ts` 里的类型能直接全局使用 | 必须 import。 |
| 为方便把所有类型放全局 | 这会增加命名冲突和隐藏依赖。 |

---

## 16. 11：逐步迁移步骤一：添加 TSC

### 结论

迁移第一步是添加 TypeScript 编译器和 `tsconfig`，让项目被 TypeScript 看见，但不立刻改变运行方式。

### 技术意义

第一步的目标是建立观察能力。先让 TypeScript 构建出项目图，识别文件、模块、依赖、JS 文件和潜在问题。

### 文件结构

```txt
11-migration-add-tsc/
  tsconfig.step1.json
  legacyCalculator.js
  migrationCheck.ts
```

### `tsconfig.step1.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["**/*"]
}
```

### `legacyCalculator.js`

```js
// Goal:
// Keep a legacy JavaScript file in the project.

export function add(leftValue, rightValue) {
  return leftValue + rightValue;
}
```

### `migrationCheck.ts`

```ts
// Goal:
// Verify that TypeScript can import a JavaScript module during migration.

import { add } from "./legacyCalculator.js";

console.log(add(1, 2));
```

### 常见错误

```txt
Mistake:
  The first migration step must rename files.

Correct:
  First add tsc and let it understand the project.
```

---

## 17. 12：逐步迁移步骤二：检查 JS，可选加入 JSDoc

### 结论

迁移第二步是对 JS 文件开启检查，并用 JSDoc 给高价值边界补充类型。

### 技术意义

`checkJs` 会暴露 JS 中长期隐藏的问题。不要一次性修完所有文件；先挑业务边界、工具函数、API client、共享模块。

### 文件结构

```txt
12-migration-checkjs-jsdoc/
  legacyParser.js
  legacyParserWithJsdoc.js
  jsdocMigrationNotes.md
```

### `legacyParser.js`

```js
// @ts-check

// Goal:
// Observe how TypeScript checks unchecked JavaScript patterns.

export function parseQuantity(inputText) {
  return Number.parseInt(inputText, 10);
}
```

### `legacyParserWithJsdoc.js`

```js
// @ts-check

// Goal:
// Add JSDoc to make the JavaScript function boundary explicit.

/**
 * @param {string} inputText
 * @returns {number}
 */
export function parseQuantity(inputText) {
  return Number.parseInt(inputText, 10);
}

parseQuantity("42");

// @ts-expect-error: inputText must be a string.
parseQuantity(42);
```

### `jsdocMigrationNotes.md`

```txt
Good first targets:
  shared utilities
  API clients
  data parsers
  domain validators
  framework entry points

Avoid first:
  unstable experimental files
  generated files
  vendored third-party files
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `checkJs` 报错太多就关掉整个项目 | 用 include、exclude、单文件指令分批推进。 |
| JSDoc 只写在实现细节上 | 优先写在模块导出 API 上。 |
| 所有旧代码都立刻改成 strict | 先建立边界，再提高严格度。 |

---

## 18. 13：逐步迁移步骤三：把文件重命名为 .ts

### 结论

当一个 JS 文件已经有清楚类型边界、依赖稳定、错误可控时，再把它重命名为 `.ts`。

### 技术意义

`.ts` 文件比 checked `.js` 更严格。很多 JS 宽松规则会消失，隐式 `any`、对象属性动态添加、函数参数不明确等问题会暴露。

### 文件结构

```txt
13-migration-rename-to-ts/
  beforeRename.js
  afterRename.ts
  renameRules.md
```

### `beforeRename.js`

```js
// @ts-check

// Goal:
// A JavaScript function ready to be renamed.

/**
 * @param {string} titleText
 * @returns {string}
 */
export function normalizeTitle(titleText) {
  return titleText.trim().toLowerCase();
}
```

### `afterRename.ts`

```ts
// Goal:
// The same function after renaming to TypeScript.

// Expected result:
// The boundary is now expressed with TypeScript syntax.

export function normalizeTitle(titleText: string): string {
  return titleText.trim().toLowerCase();
}
```

### `renameRules.md`

```txt
Rename when:
  exported API is stable
  parameters are typed
  return value is typed or inferable
  dynamic object patterns are controlled
  tests or usage examples exist

Do not rename first:
  generated files
  highly dynamic integration glue
  files depending on untyped third-party packages
```

### 常见错误

```txt
Mistake:
  Rename the hardest dynamic file first.

Correct:
  Rename stable leaf modules first, then move toward framework and integration boundaries.
```

---

## 19. 14：逐步迁移步骤四：逐步打开 strict

### 结论

最终迁移目标是严格 TypeScript，但严格选项应该按风险逐步开启，而不是一次性把整个历史项目打爆。

### 技术意义

严格选项不是“烦人的规则”，而是把 JS 中容易出运行时错误的地方变成编译期问题。

### 文件结构

```txt
14-migration-strict/
  looseUser.ts
  strictUser.ts
  strictUpgradePlan.md
```

### `looseUser.ts`

```ts
// Goal:
// Show a loose boundary that hides unsafe null access.

export type UserRecord = {
  id: string;
  email?: string;
};

export function readEmail(user: UserRecord): string | undefined {
  return user.email;
}
```

### `strictUser.ts`

```ts
// Goal:
// Write a strict-safe boundary.

// Expected result:
// Callers must handle missing email.

export type UserRecord = {
  id: string;
  email?: string;
};

export function requireEmail(user: UserRecord): string {
  if (user.email === undefined) {
    throw new Error("Missing email");
  }

  return user.email;
}
```

### `strictUpgradePlan.md`

```txt
Suggested order:
  noImplicitAny
  strictNullChecks
  useUnknownInCatchVariables
  noImplicitReturns
  noUncheckedIndexedAccess
  exactOptionalPropertyTypes

Rule:
  Enable one option, fix boundary errors, commit, then continue.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| strict 模式只是格式偏好 | strict 模式改变类型安全边界。 |
| 用 `as any` 快速通过迁移 | 会把风险推到运行时。 |
| 一次性打开所有严格选项 | 大项目应分阶段推进。 |

---

## 20. 15：寻找第三方 JavaScript 的类型信息

### 结论

使用第三方 JS 包时，先判断类型从哪里来：包自带类型、DefinitelyTyped 的 `@types` 包、本地声明文件，或你自己写的 wrapper。

### 技术意义

不要一遇到缺类型包就写 `declare module "*"`。正确顺序是先查包自带类型，再查 `@types`，最后才写本地 shim。

### 文件结构

```txt
15-find-types/
  packageTypeSources.md
  packageJsonTypes.ts
  npmTypesNotes.md
```

### `packageTypeSources.md`

```txt
Type source order:
  1. The package ships its own declarations.
  2. An @types package exists.
  3. The package exposes JSDoc-typed JavaScript.
  4. A local .d.ts shim is written.
  5. A safe wrapper is created around unknown runtime behavior.
```

### `packageJsonTypes.ts`

```ts
// Goal:
// Document what package.json type fields usually mean.

export type PackageTypingInfo = {
  name: string;
  hasTypesField: boolean;
  typesPackageName?: string;
};

const info: PackageTypingInfo = {
  name: "example-package",
  hasTypesField: true,
};

console.log(info.name);
```

### `npmTypesNotes.md`

```txt
Check:
  package.json types
  package.json typings
  included .d.ts files
  @types/package-name
  documentation examples
  source JSDoc
  issue tracker for known type problems
```

### 常见错误

```txt
Mistake:
  Install @types for every package.

Correct:
  Many modern packages ship their own types and do not need @types.
```

---

## 21. 16：使用自带类型的 JavaScript 包

### 结论

如果包自带 `.d.ts` 或在 `package.json` 中声明 `types` / `typings`，TypeScript 通常能自动读取它。

### 技术意义

自带类型通常和包版本一起发布，版本匹配风险比外部类型包小。但你仍然要理解这些类型只是静态描述。

### 文件结构

```txt
16-bundled-types/
  bundledTypesConsumer.ts
  packageTypesField.md
```

### `bundledTypesConsumer.ts`

```ts
// Goal:
// Represent consuming a package that ships its own types.

// Expected result:
// This example models the decision rather than importing a real package.

export type BundledTypePackage = {
  packageName: string;
  typesField: string;
};

const packageInfo: BundledTypePackage = {
  packageName: "typed-package",
  typesField: "./dist/index.d.ts",
};

console.log(packageInfo.typesField);
```

### `packageTypesField.md`

```txt
Common package.json fields:
  types
  typings
  exports with types condition

Questions:
  Does the package version match the type version?
  Are subpath exports typed?
  Does the package expose both ESM and CJS entry points?
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 自带类型一定完全正确 | 类型可能过宽、过窄或落后于实现。 |
| 只检查主入口类型 | subpath exports 也可能需要类型。 |
| 类型正确就不需要 runtime validation | 外部数据仍然要验证。 |

---

## 22. 17：使用 DefinitelyTyped 和 @types 包

### 结论

如果第三方包没有自带类型，优先查找 `@types/package-name`。这些类型通常来自 DefinitelyTyped。

### 技术意义

`@types` 包让没有类型声明的 JS 包也能被 TS 项目静态检查。它们是独立版本，可能和运行时包版本不完全同步。

### 文件结构

```txt
17-definitelytyped/
  installTypes.md
  nodeTypesConsumer.ts
  typesOptionBoundary.md
```

### `installTypes.md`

```txt
Example:
  npm install -D @types/node

General pattern:
  npm install -D @types/package-name

Check:
  runtime package version
  @types package version
  package major version compatibility
```

### `nodeTypesConsumer.ts`

```ts
// Goal:
// Use Node types from @types/node.

// Expected result:
// This file type-checks when Node types are included.

import path from "node:path";

console.log(path.join("products", "p1"));
```

### `typesOptionBoundary.md`

```txt
types option:
  restricts which global @types packages are included.

typeRoots option:
  restricts where TypeScript looks for type packages.

Use carefully:
  misconfiguration can hide expected globals such as node, jest, or vitest.
```

### 常见错误

```txt
Mistake:
  @types package always matches the runtime package.

Correct:
  @types is separate and can drift. Check versions and test important runtime behavior.
```

---

## 23. 18：没有类型声明的第三方包

### 结论

没有类型声明的第三方包不要直接扩散到全项目。先写最小可用本地声明，再用 typed wrapper 把不安全边界隔离起来。

### 技术意义

最小声明可以让项目继续编译，但 wrapper 才是长期安全策略。声明越宽，越容易把错误隐藏掉。

### 文件结构

```txt
18-untyped-third-party/
  localShim.d.ts
  unsafeConsumer.ts
  typedWrapper.ts
```

### `localShim.d.ts`

```ts
declare module "untyped-legacy-package" {
  export function readValue(key: string): unknown;
}
```

### `unsafeConsumer.ts`

```ts
// Goal:
// Show the unsafe boundary of an untyped package.

import { readValue } from "untyped-legacy-package";

const value = readValue("product-title");

console.log(value);
```

### `typedWrapper.ts`

```ts
// Goal:
// Wrap an untyped package with runtime validation.

import { readValue } from "untyped-legacy-package";

export function readStringValue(key: string): string | null {
  const value = readValue(key);

  if (typeof value !== "string") {
    return null;
  }

  return value;
}

const title = readStringValue("product-title");

if (title !== null) {
  console.log(title.toUpperCase());
}
```

### `anyShimRisk.d.ts`

```ts
declare module "dangerously-any-package" {
  export function readConfig(key: string): any;
}
```

### `unknownFirstPackage.d.ts`

```ts
declare module "unknown-first-package" {
  export function readConfig(key: string): unknown;
}
```

### `unknownFirstWrapper.ts`

```ts
// Goal:
// Prefer unknown in a local shim and narrow in a wrapper.

import { readConfig } from "unknown-first-package";

export type ConfigReadResult =
  | { ok: true; value: string }
  | { ok: false; reason: "missing" | "invalid" };

export function readStringConfig(key: string): ConfigReadResult {
  const value = readConfig(key);

  if (value === null || value === undefined) {
    return { ok: false, reason: "missing" };
  }

  if (typeof value !== "string") {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, value };
}
```

### 补充机制：local shim 的目标是最小描述，不是伪造安全

```txt
declare module "pkg" with any:
  unblocks compilation but can leak unsafe operations everywhere.

declare module "pkg" with unknown:
  forces consumers to narrow or wrap the result.

typed wrapper:
  converts unknown runtime behavior into a stable TypeScript boundary.
```


### 常见错误

| 错误 | 正确模型 |
|---|---|
| `declare module "pkg";` 让所有导入变成安全 | 这通常让包变成 `any`，风险很高。 |
| 本地声明一次写满整个库 | 先声明你实际使用的 API。 |
| wrapper 多余 | wrapper 可以把不可信结果变成可信领域类型。 |

---

## 24. 19：包装不可信 JavaScript API

### 结论

包装不可信 JS API 的目标是把 `any` / `unknown` 限制在一个小文件里，对外只暴露安全的 TypeScript 函数。

### 技术意义

互操作不是让不安全类型到处流动。真正的工程做法是：边界处接收未知，验证后输出领域类型或 `Result`。

### 文件结构

```txt
19-wrapper-boundary/
  unsafeLegacyApi.js
  unsafeLegacyApi.d.ts
  safeLegacyWrapper.ts
```

### `unsafeLegacyApi.js`

```js
// Goal:
// Simulate a legacy JavaScript API with unknown runtime behavior.

export function loadProductFromLegacy(id) {
  if (id === "p1") {
    return {
      id: "p1",
      title: "Keyboard",
      priceCents: 9900,
    };
  }

  return null;
}
```

### `unsafeLegacyApi.d.ts`

```ts
export function loadProductFromLegacy(id: string): unknown;
```

### `safeLegacyWrapper.ts`

```ts
// Goal:
// Convert an unsafe legacy API into a safe TypeScript boundary.

import { loadProductFromLegacy } from "./unsafeLegacyApi.js";

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

export type LegacyError =
  | { kind: "not-found" }
  | { kind: "invalid-shape" };

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.priceCents === "number"
  );
}

export function loadProduct(id: string): Result<ProductRecord, LegacyError> {
  const value = loadProductFromLegacy(id);

  if (value === null) {
    return { ok: false, error: { kind: "not-found" } };
  }

  if (!isProductRecord(value)) {
    return { ok: false, error: { kind: "invalid-shape" } };
  }

  return { ok: true, value };
}
```

### `anyLeakMistake.ts`

```ts
// Goal:
// Show how any can bypass the checker after JavaScript interop.

// Expected result:
// The checker allows this, but runtime safety is not guaranteed.

export {};

function readLegacyValue(): any {
  return 123;
}

const title = readLegacyValue();

console.log(title.toUpperCase());
```

### 补充机制：`any` 泄漏和 `unknown` 边界的区别

| 边界类型 | 调用方能不能直接使用 | 风险 |
|---|---|---|
| `any` | 能，checker 不阻止 | 错误会直接进入运行时。 |
| `unknown` | 不能，必须先 narrow | 风险被限制在边界附近。 |
| wrapper return type | 能，但已经验证过 | 适合作为新 TS 代码的入口。 |


### 常见错误

```txt
Mistake:
  Cast legacy output at every call site.

Correct:
  Cast or validate once at the boundary, then expose a typed wrapper.
```

---

## 25. 20：小项目整合

### 结论

本章小项目要把 legacy JS、`.d.ts`、JSDoc、Result、validator、typed wrapper 和 TS consumer 合起来，做一个“旧购物车模块迁移边界”。

### 技术意义

真实迁移项目通常不是把旧模块全部重写，而是先为旧模块建立安全边界，让新 TS 代码可以放心调用。

### 文件结构

```txt
20-mini-project/
  legacyCart.js
  legacyCart.d.ts
  cartTypes.ts
  cartValidator.ts
  cartWrapper.ts
  app.ts
```

### `legacyCart.js`

```js
// Goal:
// Simulate a legacy JavaScript cart module.

export function readCart() {
  return {
    items: [
      {
        productId: "p1",
        quantity: 2,
      },
    ],
  };
}
```

### `legacyCart.d.ts`

```ts
export function readCart(): unknown;
```

### `cartTypes.ts`

```ts
// Goal:
// Define trusted cart domain types.

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
};

export type CartError =
  | { kind: "invalid-cart" }
  | { kind: "invalid-item"; index: number };

export type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };
```

### `cartValidator.ts`

```ts
// Goal:
// Validate unknown cart data.

import type { Cart, CartItem, Result, CartError } from "./cartTypes.js";

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.productId === "string" &&
    typeof candidate.quantity === "number" &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0
  );
}

export function parseCart(value: unknown): Result<Cart, CartError> {
  if (typeof value !== "object" || value === null) {
    return { ok: false, error: { kind: "invalid-cart" } };
  }

  const candidate = value as Record<string, unknown>;

  if (!Array.isArray(candidate.items)) {
    return { ok: false, error: { kind: "invalid-cart" } };
  }

  const items: CartItem[] = [];

  for (let index = 0; index < candidate.items.length; index += 1) {
    const item = candidate.items[index];

    if (!isCartItem(item)) {
      return { ok: false, error: { kind: "invalid-item", index } };
    }

    items.push(item);
  }

  return { ok: true, value: { items } };
}
```

### `cartWrapper.ts`

```ts
// Goal:
// Expose a safe wrapper around the legacy cart module.

import { readCart } from "./legacyCart.js";
import { parseCart } from "./cartValidator.js";
import type { Cart, CartError, Result } from "./cartTypes.js";

export function readSafeCart(): Result<Cart, CartError> {
  return parseCart(readCart());
}
```

### `app.ts`

```ts
// Goal:
// Consume only the safe TypeScript wrapper.

import { readSafeCart } from "./cartWrapper.js";

const result = readSafeCart();

if (result.ok) {
  const totalQuantity = result.value.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  console.log(totalQuantity);
} else {
  console.log(result.error.kind);
}
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `legacyCart.js` 是旧 JS 实现。 |
| 2 | `legacyCart.d.ts` 把旧 API 声明为返回 `unknown`。 |
| 3 | `cartTypes.ts` 定义可信领域类型和错误类型。 |
| 4 | `cartValidator.ts` 把 `unknown` 检查成 `Cart`。 |
| 5 | `cartWrapper.ts` 对外暴露安全 API。 |
| 6 | `app.ts` 只消费安全 wrapper，不直接接触旧 JS。 |

### 常见错误

```txt
Mistake:
  Let new TypeScript code import legacyCart.js directly.

Correct:
  Force new code to import the wrapper so unsafe data is validated once.
```

---

## 26. 最终文件清单

```txt
typescript/
  chapter-11-js-interop/
    README.md

    00-interop-problem-model/
      runtimeVsStaticDescription.js
      typeDeclarationBoundary.ts

    01-allowjs-checkjs/
      legacyPrice.js
      consumer.ts
      configNotes.md

    02-ts-check/
      checkedFormatter.js
      uncheckedFormatter.js
      tsCommentDirectives.js

    03-jsdoc-params-returns/
      formatPrice.js
      objectShape.js
      nullableLookup.js
      openEndedObjectLiteral.js
      optionalParamsAndDefaults.js

    04-jsdoc-typedef-callback-generic/
      typedefProduct.js
      callbackHandler.js
      genericIdentity.js

    05-jsdoc-import-types/
      productTypes.d.ts
      jsdocImportConsumer.js
      jsdocTypeofImport.js
      jsdocImportTagConsumer.js
      jsdocSatisfiesCheck.js

    06-generate-declarations/
      src/publicApi.js
      tsconfig.declarations.json
      generatedDeclarationNotes.md

    07-ambient-variables/
      analytics-global.d.ts
      analyticsConsumer.ts
      missingRuntimeValue.ts

    08-ambient-types/
      globalProductTypes.d.ts
      namespaceDeclaration.d.ts
      ambientTypeConsumer.ts

    09-ambient-modules/
      legacy-utils.d.ts
      legacyModuleConsumer.ts
      wildcardModuleDeclaration.d.ts

    10-global-vs-module-dts/
      globalLibrary.d.ts
      moduleLibrary.d.ts
      globalModuleBoundary.ts
      declareGlobalInModule.d.ts

    11-migration-add-tsc/
      tsconfig.step1.json
      legacyCalculator.js
      migrationCheck.ts

    12-migration-checkjs-jsdoc/
      legacyParser.js
      legacyParserWithJsdoc.js
      jsdocMigrationNotes.md

    13-migration-rename-to-ts/
      beforeRename.js
      afterRename.ts
      renameRules.md

    14-migration-strict/
      looseUser.ts
      strictUser.ts
      strictUpgradePlan.md

    15-find-types/
      packageTypeSources.md
      packageJsonTypes.ts
      npmTypesNotes.md

    16-bundled-types/
      bundledTypesConsumer.ts
      packageTypesField.md

    17-definitelytyped/
      installTypes.md
      nodeTypesConsumer.ts
      typesOptionBoundary.md

    18-untyped-third-party/
      localShim.d.ts
      unsafeConsumer.ts
      typedWrapper.ts
      anyShimRisk.d.ts
      unknownFirstPackage.d.ts
      unknownFirstWrapper.ts

    19-wrapper-boundary/
      unsafeLegacyApi.js
      unsafeLegacyApi.d.ts
      safeLegacyWrapper.ts
      anyLeakMistake.ts

    20-mini-project/
      legacyCart.js
      legacyCart.d.ts
      cartTypes.ts
      cartValidator.ts
      cartWrapper.ts
      app.ts

notes/
  typescript.md
```

---

## 27. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### Topic name

Conclusion:
Explain what problem it solves.

Technical meaning:
Explain what TypeScript checks or describes.

Runtime mechanism:
Explain what JavaScript actually runs.

Code example:
Keep one example that proves the mechanism.

Common mistake:
Write one mistake you personally may make.

Project relation:
Connect it to JS migration, third-party packages, local declarations, runtime validation, or wrappers.
```

最终笔记必须包含这些对比：

```txt
allowJs vs checkJs
@ts-check vs checkJs
JSDoc type vs TypeScript annotation
JSDoc @typedef vs type alias
JSDoc @callback vs function type
JSDoc @template vs TypeScript generic
JSDoc import type vs runtime import
.d.ts declaration vs implementation
declare const vs const
declare module vs installed runtime package
global .d.ts vs module .d.ts
bundled types vs @types package
@types package vs local shim
local declare module vs typed wrapper
unknown boundary vs any boundary
type assertion vs runtime validation
@ts-expect-error vs @ts-ignore
@type vs @satisfies
open-ended JS object vs closed JSDoc object
any shim vs unknown shim
rename to .ts vs keep checked .js
strict migration vs immediate rewrite
skipLibCheck speed vs type-system accuracy
```

---

## 28. 本章最终要能回答的问题

学完第 11 章后，你必须能不用查资料回答这些问题：

1. TypeScript 和 JavaScript 互操作到底解决什么问题？
2. `allowJs` 和 `checkJs` 分别做什么？
3. `@ts-check` 和项目级 `checkJs` 有什么区别？
4. 为什么 JSDoc 不会改变 JavaScript 运行时行为？
5. `@param`、`@returns`、`@type` 分别适合描述什么？
6. `@typedef` 解决什么重复问题？
7. `@callback` 为什么比 `Function` 安全？
8. `@template` 在 JS 文件中表达什么？
9. JSDoc 的 `import("./x").Type` 会不会产生运行时导入？
10. `.d.ts` 文件是什么，不是什么？
11. `declare const` 为什么不会创建运行时变量？
12. `declare namespace` 适合描述什么？
13. `declare module "pkg"` 解决什么问题？
14. 为什么 `declare module` 不会安装真实 package？
15. 全局 `.d.ts` 和模块 `.d.ts` 有什么区别？
16. 什么时候应该使用 `declare global`？
17. 从 JS 生成 `.d.ts` 需要哪些配置？
18. 为什么声明文件质量依赖 JS 推导和 JSDoc？
19. 迁移 JavaScript 项目为什么应该先添加 TSC？
20. 为什么不建议一开始就重命名所有文件？
21. JS 文件迁移到 TS 文件后会变严格在哪里？
22. strict 模式应该如何分阶段打开？
23. 第三方包的类型信息可能来自哪些地方？
24. 包自带类型和 `@types` 包有什么区别？
25. DefinitelyTyped 解决什么问题，又有什么风险？
26. 没有类型声明的第三方包应该怎么处理？
27. 为什么最小 local shim 不应该写成全局 `any`？
28. wrapper boundary 为什么比到处断言安全？
29. 为什么外部 JS API 的返回值最好先是 `unknown`？
30. 类型声明错误会给项目带来什么风险？
31. `skipLibCheck` 是什么迁移取舍？
32. 第 11 章如何连接模块、声明合并、运行时验证和渐进式工程迁移？
33. `.js` 文件中的 object literal 为什么会比 `.ts` 文件更 open-ended？
34. JSDoc `@import` 和 `import("./x").Type` 为什么不会执行运行时代码？
35. JSDoc `@satisfies` 和 `@type` 有什么区别？
36. 为什么本地 shim 更推荐先返回 `unknown` 而不是 `any`？
37. `export {}` 加 `declare global` 在模块 `.d.ts` 里解决什么问题？
38. `skipLibCheck` 是性能取舍还是类型安全保证？

---

## 29. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [JS Projects Utilizing TypeScript](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html)  
   重点理解 JavaScript 项目可以逐步使用 TypeScript，而不是必须一次性改写。

2. [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)  
   重点读 `.js` 文件中类型检查和 `.ts` 文件的差异，尤其是 JS 宽松对象、open-ended object literal、类属性和函数参数推导规则。

3. [JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)  
   重点读 `@type`、`@param`、`@returns`、`@typedef`、`@callback`、`@template`、`@import`、`@satisfies`。

4. [Creating .d.ts Files from .js files](https://www.typescriptlang.org/docs/handbook/declaration-files/dts-from-js.html)  
   理解如何从已有 JavaScript 文件生成声明文件。

5. [Declaration Files Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)  
   理解声明文件是为了描述 JavaScript 库 API，而不是实现 API。

6. [Declaration Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html)  
   读对象、函数、类、全局变量、模块 API 的声明写法。

7. [Modules .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html)  
   读 CommonJS、ESM、函数模块、类模块等模块声明模板。

8. [Global .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html)  
   读全局库声明模板，理解什么时候不要污染全局。

9. [Declaration Files Consumption](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)  
   理解 TypeScript 如何消费第三方声明文件和 `@types` 包。

10. [TSConfig allowJs](https://www.typescriptlang.org/tsconfig/allowJs.html) 和 [TSConfig checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html)  
    理解迁移时 JS 文件如何进入项目，以及何时报告 JS 类型错误。

11. [TSConfig declaration](https://www.typescriptlang.org/tsconfig/declaration.html) 和 [emitDeclarationOnly](https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html)  
    理解如何为 JS/TS 库输出类型声明。

12. [TSConfig types](https://www.typescriptlang.org/tsconfig/types.html) 和 [typeRoots](https://www.typescriptlang.org/tsconfig/typeRoots.html)  
    理解如何控制全局类型包和自定义声明目录。

---

## 30. 第 11 章最终记忆模型

```txt
JavaScript interop is not one feature.
It is a migration and boundary strategy.

Existing JavaScript:
  runs at runtime
  can be checked by TypeScript
  can be described by JSDoc
  can produce .d.ts files

Declaration files:
  describe existing runtime APIs
  do not implement values
  can be global or module-scoped
  can describe variables, functions, classes, namespaces, and modules

Migration path:
  add tsc
  enable allowJs
  enable checkJs or @ts-check
  add JSDoc to important boundaries
  generate or write .d.ts files
  rename stable files to .ts
  tighten strict options gradually

Third-party JavaScript:
  may ship bundled types
  may have @types package
  may need local declaration
  may need a safe wrapper
  should be treated as a runtime trust boundary

Safe interop:
  keep any and unknown near the boundary
  validate external values
  expose trusted TypeScript APIs
  do not let unsafe declarations spread through the project
```

### 最终一句话

第 3 章让你描述值的形状。第 4 章让你描述行为的边界。第 5 章让你描述对象的长期结构和抽象契约。第 6 章让你理解类型系统如何比较、缩小、派生、转换和保护类型。第 7 章让你把失败路径变成可读、可检查、可组合的代码结构。第 8 章让你把未来值、并发任务、异步序列和跨线程消息协议建模清楚。第 9 章让你把类型能力放进框架和前后端边界。第 10 章让你把所有这些代码拆成清晰、可维护、可重构的模块边界。第 11 章让你把真实世界的 JavaScript、第三方包和历史代码逐步接入 TypeScript 类型系统。

真正的 TypeScript 互操作学习，不是用 `any` 让 JS 代码闭嘴，而是用 JSDoc、`.d.ts`、`@types`、局部声明和安全 wrapper 把不确定的运行时边界变成可检查、可迁移、可维护的工程边界。

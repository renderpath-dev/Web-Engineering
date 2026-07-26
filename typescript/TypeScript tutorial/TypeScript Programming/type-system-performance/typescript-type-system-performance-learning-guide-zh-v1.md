
# TypeScript 类型系统性能学习指导文件 v1

> 定位：这是 `typescript/type-system-performance/` 的学习指导文件，不是最终学习笔记。  
> 目标：按照这份文件创建练习目录、写 `.ts` / `.json` / `.md` 文件、运行 `tsc` 性能诊断命令、观察慢类型的表现、理解 TypeScript 类型检查器为什么变慢，再整理成正式学习笔记。  
> 参考范围：TypeScript 官方 Wiki Performance、TSConfig 官方文档中的 `extendedDiagnostics`、`generateTrace`、`noErrorTruncation`、`incremental`、`skipLibCheck`、`types`、`typeRoots`、Project References，以及 TypeScript 5.9 关于类型实例化缓存和 hover 长度的发布说明。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名、字符串和代码注释统一英文；代码块中不使用中文字符。  
> 学习原则：先测量，再优化；先定位，再改类型。不要凭感觉删高级类型，也不要为了炫技写无法维护的类型层程序。

> 重要说明：本章不是教你害怕高级类型，而是教你判断哪些类型设计会让检查器反复展开、分配、比较和实例化。真正的工程目标是：类型表达力、编译速度、编辑器响应和代码可读性之间取得平衡。

---

## 目录

1. [0. 文件定位](#0-文件定位)
2. [1. 本章学习目标](#1-本章学习目标)
3. [2. 本章学习顺序](#2-本章学习顺序)
4. [3. 本章核心术语表](#3-本章核心术语表)
5. [4. 本章底层模型](#4-本章底层模型)
6. [5. 推荐目录结构](#5-推荐目录结构)
7. [6. 运行方式](#6-运行方式)
8. [7. 分节训练内容](#7-分节训练内容)
   - [00：类型系统性能到底在解决什么](#00类型系统性能到底在解决什么)
   - [01：用 extendedDiagnostics 建立性能基线](#01用-extendeddiagnostics-建立性能基线)
   - [02：用 noErrorTruncation 看完整错误类型](#02用-noerrortruncation-看完整错误类型)
   - [03：用 generateTrace 定位慢检查](#03用-generatetrace-定位慢检查)
   - [04：大联合类型和二次比较成本](#04大联合类型和二次比较成本)
   - [05：分布式条件类型和实例化膨胀](#05分布式条件类型和实例化膨胀)
   - [06：模板字面量类型和组合爆炸](#06模板字面量类型和组合爆炸)
   - [07：递归类型和过深实例化](#07递归类型和过深实例化)
   - [08：interface extends 与 intersection 的性能差异](#08interface-extends-与-intersection-的性能差异)
   - [09：命名复杂类型和显式返回类型](#09命名复杂类型和显式返回类型)
   - [10：include、exclude、files 和类型范围控制](#10includeexcludefiles-和类型范围控制)
   - [11：types、typeRoots 和全局类型污染](#11typestyperoots-和全局类型污染)
   - [12：incremental、composite 和 project references](#12incrementalcomposite-和-project-references)
   - [13：skipLibCheck 的取舍边界](#13skiplibcheck-的取舍边界)
   - [14：编辑器性能、hover 长度和语言服务](#14编辑器性能hover-长度和语言服务)
   - [15：API 类型设计的性能策略](#15api-类型设计的性能策略)
9. [8. 本章 API / 语法完整索引](#8-本章-api--语法完整索引)
10. [9. 本章常见错误总表](#9-本章常见错误总表)
11. [10. 最终小项目：Type Performance Audit](#10-最终小项目type-performance-audit)
12. [11. 额外 cheatsheet](#11-额外-cheatsheet)
13. [12. 最终文件清单](#12-最终文件清单)
14. [13. 最终学习笔记转换要求](#13-最终学习笔记转换要求)
15. [14. 本章最终记忆模型](#14-本章最终记忆模型)
16. [15. 官方文档阅读清单](#15-官方文档阅读清单)
17. [16. 学习文件完整性检查清单](#16-学习文件完整性检查清单)

---

## 0. 文件定位

### 结论

`typescript/type-system-performance/` 是 TypeScript 主线学习后的工程进阶章节。它不重复讲 `keyof`、条件类型（conditional type）、映射类型（mapped type）和模板字面量类型（template literal type）的基础语法，而是训练你识别这些类型在大型项目里如何影响编译速度和编辑器响应。

### 技术意义

TypeScript 类型系统性能不是“电脑快不快”的问题，而是类型检查器（type checker）做了多少工作：

```txt
parse source files
  -> bind declarations
  -> resolve modules
  -> instantiate generic types
  -> compare assignability
  -> reduce unions and intersections
  -> evaluate conditional types
  -> print errors and declaration types
  -> serve editor hover and completion
```

### 本章核心判断

```txt
如果文件太多：先控制项目输入范围。
如果声明太多：先控制 types / typeRoots / skipLibCheck。
如果类型太大：先命名复杂类型，减少匿名展开。
如果 union 太大：先找公共 base type。
如果条件类型太慢：先阻止不必要的分布式展开。
如果 template literal 组合过大：先限制 union 输入。
如果递归类型过深：先设置递归深度或改为运行时函数。
```

---

## 1. 本章学习目标

学完本章，你要能做到：

```txt
1. 看懂 tsc --extendedDiagnostics 输出里的关键指标。
2. 用 --generateTrace 生成性能追踪文件。
3. 用 --noErrorTruncation 暴露被截断的巨大类型。
4. 判断什么时候大 union 会拖慢比较。
5. 判断什么时候条件类型会分布式展开。
6. 判断什么时候 template literal types 会产生组合爆炸。
7. 判断什么时候递归类型会触发 excessive type instantiation。
8. 用 interface extends 替代不必要的 intersection。
9. 用命名 type alias 缓存复杂类型。
10. 给导出函数补显式返回类型，减少 declaration emit 复杂度。
11. 用 include / exclude / files 控制项目输入范围。
12. 用 types / typeRoots 控制全局类型包范围。
13. 理解 incremental、composite、project references 的性能意义。
14. 理解 skipLibCheck 是速度取舍，不是类型安全万能开关。
15. 把性能规则应用到 React、Next.js、Node、SDK 和 monorepo 项目。
```

---

## 2. 本章学习顺序

```txt
type performance model
  -> baseline measurement
  -> complete error output
  -> trace generation
  -> large union cost
  -> distributive conditional types
  -> template literal type explosion
  -> recursive type depth
  -> interface extends vs intersection
  -> named aliases and return annotations
  -> include/exclude/files boundary
  -> types/typeRoots boundary
  -> incremental and project references
  -> skipLibCheck tradeoff
  -> editor and language service performance
  -> API type design strategy
  -> final mini project
```

---

## 3. 本章核心术语表

| 中文术语 | English term | 解释 |
|---|---|---|
| 类型检查器 | type checker | TypeScript 中负责类型推导、类型关系比较、错误报告的核心部分。 |
| 类型实例化 | type instantiation | 把泛型类型参数替换成具体类型参数的过程。 |
| 类型关系比较 | type relation checking | 判断一个类型是否能赋值给另一个类型。 |
| 分布式条件类型 | distributive conditional type | 当 `T` 是裸类型参数并传入 union 时，条件类型会对 union 每个成员分别执行。 |
| 组合爆炸 | combinatorial explosion | 多个 union 互相组合导致结果数量成倍增长。 |
| 递归类型 | recursive type | 类型定义间接或直接引用自己。 |
| 过深实例化 | excessive type instantiation | 类型递归或条件展开超过编译器限制时出现的错误。 |
| 性能基线 | performance baseline | 修改前的编译耗时、检查耗时、类型数量、实例化数量等数据。 |
| 性能追踪 | performance trace | TypeScript 生成的事件追踪文件，用来分析慢检查点。 |
| 语言服务 | language service | IDE 使用的 TypeScript 服务，提供补全、跳转、hover、诊断等能力。 |
| 项目引用 | project references | 把大型 TS 项目拆成多个互相引用的子项目。 |
| 增量构建 | incremental build | 保存构建信息，下次只重新检查或输出必要部分。 |
| 声明输出 | declaration emit | 生成 `.d.ts` 文件的过程。 |
| 类型显示 | type display | IDE hover 或错误信息把类型打印成人类可读文本的过程。 |
| 全局类型污染 | global type pollution | 不需要的 `@types/*` 包进入项目，增加类型检查范围或造成冲突。 |

---

## 4. 本章底层模型

### 结论

TypeScript 类型系统性能可以分成两类：

```txt
project-size cost:
  TypeScript 需要加载多少文件、多少声明、多少依赖、多少全局类型。

type-computation cost:
  TypeScript 需要实例化、展开、比较、规约多少复杂类型。
```

### 底层机制

```txt
tsc
  -> read tsconfig.json
  -> build root file list
  -> resolve imports and declaration files
  -> parse source files
  -> bind declarations into symbols
  -> check types and assignability
  -> instantiate generic aliases and conditional types
  -> reduce unions and intersections
  -> report diagnostics
  -> optionally emit JavaScript and declaration files
```

---

## 5. 推荐目录结构

```txt
typescript/
  type-system-performance/
    typescript-type-system-performance-learning-guide-zh-v1.md
    typescript-type-system-performance-cheatsheet-zh-v1.md
    README.md
    package.json
    tsconfig.json
    tsconfig.perf.json
    tsconfig.trace.json
    tsconfig.solution.json

    00-performance-model/
      typeCheckerWorkModel.ts
      runtimeVsTypePerformance.ts
      modelNotes.md

    01-extended-diagnostics/
      simpleBaseline.ts
      namedReturnBaseline.ts
      diagnosticsChecklist.md

    02-no-error-truncation/
      truncatedErrorExample.ts
      readableNamedTypeExample.ts
      errorOutputNotes.md

    03-generate-trace/
      traceHotspotExample.ts
      traceCommandNotes.md
      traceReviewChecklist.md

    04-large-unions/
      largeUnionCost.ts
      baseTypeAlternative.ts
      largeUnionMistake.ts

    05-distributive-conditionals/
      distributiveConditionalCost.ts
      nonDistributiveConditional.ts
      conditionalExplosionMistake.ts

    06-template-literal-explosion/
      templateCombinationCost.ts
      constrainedTemplateTypes.ts
      generatedStringUnionMistake.ts

    07-recursive-types/
      recursiveDepthExample.ts
      boundedRecursiveType.ts
      excessiveInstantiationMistake.ts

    08-interface-vs-intersection/
      intersectionCompositionCost.ts
      interfaceExtendsAlternative.ts
      propertyConflictComparison.ts

    09-named-types-return-annotations/
      anonymousReturnTypeCost.ts
      namedReturnTypeOptimization.ts
      declarationEmitNotes.md

    10-project-input-boundary/
      tsconfig.too-broad.json
      tsconfig.focused.json
      includeExcludeFilesNotes.md

    11-global-types-boundary/
      tsconfig.with-many-types.json
      tsconfig.with-explicit-types.json
      typesBoundaryNotes.md

    12-incremental-references/
      packages/shared/src/index.ts
      packages/client/src/index.ts
      packages/server/src/index.ts
      packages/shared/tsconfig.json
      packages/client/tsconfig.json
      packages/server/tsconfig.json
      tsconfig.solution.json
      referenceBuildNotes.md

    13-skip-lib-check/
      skipLibCheckTradeoff.ts
      dependencyTypeConflictNotes.md
      libCheckDecisionChecklist.md

    14-editor-performance/
      hugeHoverType.ts
      namedHoverType.ts
      editorSettingsNotes.md

    15-api-type-design/
      overPreciseApiType.ts
      stableApiSurface.ts
      apiTypeDesignChecklist.md

    16-mini-project-type-performance-audit/
      sampleApiTypes.ts
      sampleSlowTypes.ts
      auditTypeSurface.ts
      auditChecklist.md
      optimizationReport.md
```

---

## 6. 运行方式

### 初始化依赖

```bash
cd typescript/type-system-performance
npm init -y
npm install -D typescript
```

### package.json

```json
{
  "scripts": {
    "check": "tsc -p tsconfig.json --noEmit",
    "perf": "tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics",
    "trace": "tsc -p tsconfig.trace.json --noEmit --generateTrace ./trace-output",
    "build:refs": "tsc -b tsconfig.solution.json --verbose",
    "clean:refs": "tsc -b tsconfig.solution.json --clean"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noEmitOnError": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**/*.ts"],
  "exclude": ["trace-output", "dist", "node_modules"]
}
```

### tsconfig.perf.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "extendedDiagnostics": true,
    "noErrorTruncation": true
  }
}
```

### tsconfig.trace.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "noErrorTruncation": true
  }
}
```


### tsconfig.solution.json

```json
{
  "files": [],
  "references": [
    { "path": "./12-incremental-references/packages/shared" },
    { "path": "./12-incremental-references/packages/client" },
    { "path": "./12-incremental-references/packages/server" }
  ]
}
```

### 类型检查清单

```bash
npm run check
npm run perf
npm run trace
npm run build:refs
```


---

## 7. 分节训练内容

本节是主体训练区。每个小节都要创建文件、运行检查、观察输出或诊断结果，并把结论整理成正式学习笔记。

---

## 00：类型系统性能到底在解决什么

### 结论

类型系统性能关注的是 TypeScript 在编译期和编辑器中处理类型的成本。它不影响运行时 JavaScript 的速度，但会影响 `tsc`、IDE hover、自动补全、跳转定义和 CI 类型检查速度。

### 技术意义

复杂类型是静态工具的一部分。它们不会进入打包产物，但会让类型检查器做更多工作。

### 底层机制

```txt
type syntax -> type checker work -> diagnostics / hover / declaration emit
runtime JavaScript does not contain TypeScript-only types
```

### API / 语法规范

```txt
tsc --noEmit
  Runs type checking without output.

tsc --extendedDiagnostics
  Prints compiler timing and size metrics.
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
tsc --noEmit
tsc --extendedDiagnostics
tsc --generateTrace <directory>
```

### 文件结构

```txt
00-performance-model/
  typeCheckerWorkModel.ts
  runtimeVsTypePerformance.ts
  modelNotes.md
```

### typeCheckerWorkModel.ts

```ts
// Goal:
// Show that type computation exists only at compile time.

// Expected result:
// The compiler checks the derived type and runtime output stays simple.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type ProductFormatterMap<RecordType> = {
  [Key in keyof RecordType as `format${Capitalize<string & Key>}`]: (
    value: RecordType[Key],
  ) => string;
};

export type ProductFormatters = ProductFormatterMap<ProductRecord>;

export const productFormatters: ProductFormatters = {
  formatId: (value) => value,
  formatTitle: (value) => value.toUpperCase(),
  formatPriceCents: (value) => `$${(value / 100).toFixed(2)}`,
};

console.log(productFormatters.formatTitle("Keyboard"));
```

### runtimeVsTypePerformance.ts

```ts
// Goal:
// Compare runtime work with compile-time type work.

// Expected result:
// Runtime only executes the JavaScript function body.

export {};

type ExactRouteName<Section extends string, Action extends string> =
  `${Section}:${Action}`;

type ProductRouteName = ExactRouteName<"product", "list" | "detail" | "edit">;

function navigateToRoute(routeName: ProductRouteName): void {
  console.log(routeName);
}

navigateToRoute("product:list");
```

### modelNotes.md

```md
# Performance Model Notes

## Core distinction

Runtime performance is about emitted JavaScript execution.
Type-checking performance is about compiler and editor work before runtime.

## Measurement habit

Record what changed, which command was used, and which metric moved.
```

### 运行方式

```bash
npx tsc --noEmit 00-performance-model/typeCheckerWorkModel.ts
npx tsc --noEmit 00-performance-model/runtimeVsTypePerformance.ts
```

### 预期输出

```txt
No compiler errors.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | TypeScript 解析 `ProductRecord`。 |
| 2 | 映射类型遍历每个 key。 |
| 3 | 模板字面量类型生成格式化函数名。 |
| 4 | 编译器检查对象是否实现所有函数。 |
| 5 | 运行时类型计算被擦除。 |

### 和实际项目的关系

React props、API contract、route name、form field path 都可能用类型层生成。它们能提升安全性，但也可能让 hover 和 CI 变慢。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 类型复杂会让浏览器运行变慢 | 类型被擦除，不直接影响运行时。 |
| 类型复杂没有任何成本 | 编译器和 IDE 会付出检查成本。 |

### 最终记忆模型

```txt
Runtime reads JavaScript.
TypeScript checker reads types.
Slow JavaScript and slow TypeScript are different problems.
```


---

## 01：用 extendedDiagnostics 建立性能基线

### 结论

`--extendedDiagnostics` 是本章第一工具。没有基线，就没有优化。

### 技术意义

它能告诉你 TypeScript 在整体编译中花时间的位置。重点不是单次数字，而是修改前后对比。

### 底层机制

```txt
program -> parse -> bind -> check -> print metrics
metrics include Files, Types, Instantiations, Memory used, Check time, Total time
```

### API / 语法规范

```txt
tsc --extendedDiagnostics
  Prints extra timing and size metrics.

Use with --noEmit when you only need type checking.
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
-p: selects a config file
--noEmit: prevents output
--extendedDiagnostics: prints performance metrics
```

### 文件结构

```txt
01-extended-diagnostics/
  simpleBaseline.ts
  namedReturnBaseline.ts
  diagnosticsChecklist.md
```

### simpleBaseline.ts

```ts
// Goal:
// Create a small baseline for extended diagnostics.

// Expected result:
// The compiler accepts the file and diagnostics show small counts.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function createProductLabel(product: ProductRecord): string {
  return `${product.title}:${product.priceCents}`;
}
```

### namedReturnBaseline.ts

```ts
// Goal:
// Use an explicit named return type for a public function.

// Expected result:
// The exported function has a compact public type surface.

export interface ProductSummary {
  id: string;
  label: string;
}

export interface ProductRecord {
  id: string;
  title: string;
  priceCents: number;
}

export function createProductSummary(product: ProductRecord): ProductSummary {
  return {
    id: product.id,
    label: `${product.title}:${product.priceCents}`,
  };
}
```

### diagnosticsChecklist.md

```md
# Diagnostics Checklist

- Command used: `npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics`
- Record `Files`.
- Record `Types`.
- Record `Instantiations`.
- Record `Memory used`.
- Record `Check time`.
- Record `Total time`.
- Compare before and after the type design change.
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
```

### 预期输出

```txt
Files: ...
Types: ...
Instantiations: ...
Memory used: ...
Check time: ...
Total time: ...
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `tsc` 读取 `tsconfig.perf.json`。 |
| 2 | `include` 决定哪些文件进入 program。 |
| 3 | 编译器解析文件并绑定 symbol。 |
| 4 | 类型检查器计算类型关系。 |
| 5 | `extendedDiagnostics` 打印整体指标。 |

### 和实际项目的关系

CI 里发现 `npm run typecheck` 越来越慢时，不要先猜。先用 `extendedDiagnostics` 建立指标，再比较每次优化。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 只看 Total time | 同时看 Files、Types、Instantiations、Memory used、Check time。 |
| 只跑一次就下结论 | 至少跑多次，观察趋势。 |

### 最终记忆模型

```txt
extendedDiagnostics answers overall where TypeScript spends time.
```


---

## 02：用 noErrorTruncation 看完整错误类型

### 结论

`--noErrorTruncation` 不会优化性能，但能帮助你看清错误信息里被截断的巨大类型。

### 技术意义

当错误信息出现 `...` 或 hover 极长时，说明类型显示（type display）本身已经复杂。

### 底层机制

```txt
diagnostic printing -> type display -> truncation by default
noErrorTruncation -> complete diagnostic text
```

### API / 语法规范

```txt
tsc --noErrorTruncation
  Do not truncate error messages.
  It changes diagnostic formatting, not type checking rules.
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
npx tsc --noEmit --noErrorTruncation
```

### 文件结构

```txt
02-no-error-truncation/
  truncatedErrorExample.ts
  readableNamedTypeExample.ts
  errorOutputNotes.md
```

### truncatedErrorExample.ts

```ts
// Goal:
// Produce a large error type so noErrorTruncation can reveal it.

// Expected error:
// The assigned object is missing many required properties.

export type VerboseProductShape = {
  productIdentifier: string;
  productDisplayTitle: string;
  productPriceInMinorUnits: number;
  productInventoryTrackingCode: string;
  productWarehouseLocationCode: string;
  productSupplierReferenceCode: string;
  productAuditCreatedAtIso: string;
  productAuditUpdatedAtIso: string;
};

// @ts-expect-error: The object is missing required properties.
export const incompleteProduct: VerboseProductShape = {
  productIdentifier: "p1",
};
```

### readableNamedTypeExample.ts

```ts
// Goal:
// Keep large object types readable by splitting them into named pieces.

// Expected error:
// The missing type section is easier to identify.

export interface ProductIdentity {
  productIdentifier: string;
  productDisplayTitle: string;
}

export interface ProductAuditInfo {
  productAuditCreatedAtIso: string;
  productAuditUpdatedAtIso: string;
}

export interface ProductShape extends ProductIdentity, ProductAuditInfo {
  productPriceInMinorUnits: number;
}

// @ts-expect-error: The object is missing required sections.
export const incompleteNamedProduct: ProductShape = {
  productIdentifier: "p1",
};
```

### errorOutputNotes.md

```md
# Error Output Notes

## What to record

- The original compiler command.
- Whether the message was truncated.
- Which exported type produced the largest display.
- Whether naming the type made the message easier to read.

## Rule

Use full error output for investigation, not as a daily default.
```

### 运行方式

```bash
npx tsc --noEmit --noErrorTruncation 02-no-error-truncation/truncatedErrorExample.ts
```

### 预期输出

```txt
The compiler prints a longer, less truncated error message.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 编译器发现对象缺少 required properties。 |
| 2 | 普通错误输出可能截断长类型。 |
| 3 | `noErrorTruncation` 打印更完整的类型。 |
| 4 | 你观察巨大类型来自哪里。 |

### 和实际项目的关系

当 WebStorm 或 VS Code hover 变成一大坨类型，通常说明公共 API 的类型表面太复杂。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| noErrorTruncation 是性能优化开关 | 它只是让错误更完整，方便你诊断类型为什么变大。 |
| 错误越长越好 | 只在定位问题时打开。 |

### 最终记忆模型

```txt
noErrorTruncation does not make checking faster.
It makes hidden type complexity visible.
```


---

## 03：用 generateTrace 定位慢检查

### 结论

`--generateTrace` 用来生成性能追踪文件。它适合在 `extendedDiagnostics` 只能说明整体慢，但不能说明哪里慢时使用。

### 技术意义

性能追踪（performance trace）是进一步分析慢检查、慢类型实例化、慢符号解析的工具。

### 底层机制

```txt
tsc --generateTrace <dir>
  -> trace.json event trace
  -> types.json type list
```

### API / 语法规范

```txt
tsc --generateTrace <directory>
  directory is the output directory for trace files.
  It writes files and adds overhead.
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
npx tsc -p tsconfig.trace.json --noEmit --generateTrace ./trace-output
```

### 文件结构

```txt
03-generate-trace/
  traceHotspotExample.ts
  traceCommandNotes.md
  traceReviewChecklist.md
```

### traceHotspotExample.ts

```ts
// Goal:
// Create a controlled generic type that can appear in trace output.

// Expected result:
// The compiler accepts the file and trace output can be inspected.

export type ApiEntity = "product" | "order" | "customer" | "invoice";
export type ApiAction = "list" | "read" | "create" | "update";
export type ApiVersion = "v1" | "v2";

export type ApiRoute = `/api/${ApiVersion}/${ApiEntity}/${ApiAction}`;

export type RouteHandlerMap = {
  [RouteName in ApiRoute]: {
    route: RouteName;
    handle(input: unknown): Promise<unknown>;
  };
};

export type ProductListHandler = RouteHandlerMap["/api/v1/product/list"];
```

### traceCommandNotes.md

```md
# Trace Command Notes

## Command

`npx tsc -p tsconfig.trace.json --noEmit --generateTrace ./trace-output`

## Output files

- `trace-output/trace.json`
- `trace-output/types.json`

## Rule

Trace generation is for investigation only. Do not run it as the default CI typecheck.
```

### traceReviewChecklist.md

```md
# Trace Review Checklist

- Open `trace.json` in a trace viewer.
- Search for long checking events.
- Check `types.json` for large generated types.
- Map the slow type back to the source file.
- Change one type design at a time and measure again.
```

### 运行方式

```bash
npx tsc -p tsconfig.trace.json --noEmit --generateTrace ./trace-output
```

### 预期输出

```txt
trace-output/trace.json
trace-output/types.json
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `tsc` 创建 program。 |
| 2 | 类型检查器实例化 `ApiRoute`。 |
| 3 | 映射类型为每个 route 生成 handler entry。 |
| 4 | `generateTrace` 写入 trace 文件。 |
| 5 | 你查看 trace 和 types 文件，寻找重复实例化和大型类型。 |

### 和实际项目的关系

`tRPC`、schema library、form library、route generator、typed API client 都可能生成大量类型。trace 用来确认热点。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 把 generateTrace 放进日常 CI | 它是调查工具，不是常规检查命令。 |
| trace 一生成就代表知道原因 | 还需要结合源码和类型设计分析。 |

### 最终记忆模型

```txt
extendedDiagnostics gives the dashboard.
generateTrace gives the investigation file.
```


---

## 04：大联合类型和二次比较成本

### 结论

联合类型（union type）成员越多，类型关系比较越贵。大 union 不是一定不能用，但不要用它建模所有可能实体的完整枚举世界。

### 技术意义

当 TypeScript 判断一个值是否可赋给大 union 时，需要把候选类型和 union 成员逐个比较。

### 底层机制

```txt
candidate type -> compare against union member 1 -> member 2 -> member 3
large union reductions can become expensive
```

### API / 语法规范

```txt
Union syntax:
  TypeA | TypeB

Base interface alternative:
  interface BaseEntity { id: string }
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
Discriminant property:
  kind: "literal"

Base type:
  interface StoreEventBase { kind: StoreEventKind; id: string }
```

### 文件结构

```txt
04-large-unions/
  largeUnionCost.ts
  baseTypeAlternative.ts
  largeUnionMistake.ts
```

### largeUnionCost.ts

```ts
// Goal:
// Model a medium-sized union and observe how it is checked.

// Expected result:
// The compiler accepts the union but it creates more comparison work as it grows.

export type ProductEvent = { kind: "product"; id: string; title: string };
export type OrderEvent = { kind: "order"; id: string; totalCents: number };
export type CustomerEvent = { kind: "customer"; id: string; email: string };
export type InvoiceEvent = { kind: "invoice"; id: string; dueDateIso: string };
export type ShipmentEvent = { kind: "shipment"; id: string; trackingCode: string };

export type StoreEvent =
  | ProductEvent
  | OrderEvent
  | CustomerEvent
  | InvoiceEvent
  | ShipmentEvent;

export function readEventId(event: StoreEvent): string {
  return event.id;
}
```

### baseTypeAlternative.ts

```ts
// Goal:
// Replace a large public union with a shared base type when exact branch data is unnecessary.

// Expected result:
// Public APIs can depend on the smaller base type.

export type StoreEventKind = "product" | "order" | "customer" | "invoice" | "shipment";

export interface StoreEventBase {
  kind: StoreEventKind;
  id: string;
}

export function readBaseEventId(event: StoreEventBase): string {
  return event.id;
}
```

### largeUnionMistake.ts

```ts
// Goal:
// Show a public helper that accepts a precise union even though it only needs common fields.

// Expected result:
// This compiles, but the parameter type is more precise than necessary.

export type ProductEvent = { kind: "product"; id: string; title: string };
export type OrderEvent = { kind: "order"; id: string; totalCents: number };
export type CustomerEvent = { kind: "customer"; id: string; email: string };

export type StoreEvent = ProductEvent | OrderEvent | CustomerEvent;

export function createEventCacheKey(event: StoreEvent): string {
  return `${event.kind}:${event.id}`;
}
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
```

### 预期输出

```txt
No compiler errors.
Record Types and Instantiations before and after changing public APIs.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `StoreEvent` 把多个对象类型组合成 union。 |
| 2 | 调用函数时，TypeScript 需要判断参数属于 union 的哪个范围。 |
| 3 | 如果函数只需要公共字段 `id`，大 union 是过度精确。 |
| 4 | `StoreEventBase` 提供更小的公共类型表面。 |

### 和实际项目的关系

在 API client、analytics event、domain event、Redux action 中，大 union 很常见。内部 reducer 可以用 union，公共 helper 不一定要接收完整 union。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有地方都用最精确 union | 只在需要分支收窄的地方使用完整 union。 |
| base type 会降低所有安全性 | base type 适合只读取公共字段的 API。 |

### 最终记忆模型

```txt
Use a union when branches matter.
Use a base type when common fields matter.
```


---

## 05：分布式条件类型和实例化膨胀

### 结论

条件类型（conditional type）遇到 union 时可能分布式展开。小 union 很有用，大 union 加嵌套条件会制造大量类型实例化。

### 技术意义

`T extends X ? A : B` 中，如果 `T` 是裸类型参数（naked type parameter），传入 union 时会对每个 union 成员分别执行条件判断。

### 底层机制

```txt
KeepString<"a" | 1 | "b">
  -> KeepString<"a"> | KeepString<1> | KeepString<"b">
  -> "a" | never | "b"
```

### API / 语法规范

```txt
type Conditional<T> = T extends Constraint ? TrueType : FalseType;
type NonDistributive<T> = [T] extends [Constraint] ? TrueType : FalseType;
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
T extends U ? X : Y
[T] extends [U] ? X : Y
```

### 文件结构

```txt
05-distributive-conditionals/
  distributiveConditionalCost.ts
  nonDistributiveConditional.ts
  conditionalExplosionMistake.ts
```

### distributiveConditionalCost.ts

```ts
// Goal:
// Observe distributive conditional types over a union.

// Expected result:
// Only string members remain in the derived type.

export type MixedValue = "product" | "order" | 100 | 200 | false;

export type KeepString<ValueType> = ValueType extends string ? ValueType : never;

export type StringOnlyValue = KeepString<MixedValue>;

export const routeName: StringOnlyValue = "product";
```

### nonDistributiveConditional.ts

```ts
// Goal:
// Prevent distributive conditional behavior by wrapping both sides in tuples.

// Expected result:
// The whole union is tested as one type.

export type MixedValue = "product" | "order" | 100;

export type IsEntireUnionString<ValueType> = [ValueType] extends [string]
  ? true
  : false;

export type WholeUnionResult = IsEntireUnionString<MixedValue>;

export const result: WholeUnionResult = false;
```

### conditionalExplosionMistake.ts

```ts
// Goal:
// Show nested distributive conditional types that multiply work over unions.

// Expected result:
// This compiles, but each union member can trigger extra instantiations.

export type EntityName = "product" | "order" | "customer" | "invoice";
export type ActionName = "list" | "read" | "create" | "update";

export type PairEvery<Entity, Action> = Entity extends string
  ? Action extends string
    ? `${Entity}:${Action}`
    : never
  : never;

export type EntityActionPair = PairEvery<EntityName, ActionName>;

export const pairName: EntityActionPair = "product:list";
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
```

### 预期输出

```txt
No compiler errors.
Compare Instantiations when union members increase.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `KeepString<MixedValue>` 接收 union。 |
| 2 | 因为 `ValueType` 是裸类型参数，条件类型分布式执行。 |
| 3 | 每个 union 成员都被单独代入。 |
| 4 | `never` 成员被 union 消除。 |
| 5 | 嵌套条件类型会放大实例化次数。 |

### 和实际项目的关系

很多库用条件类型提取参数、返回值、schema output、route payload。你要能分清必要的分布式与无意的分布式。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 条件类型总是整体判断 union | 裸类型参数会分布式展开。 |
| 分布式条件类型都是坏的 | 它是强大工具，但要控制输入 union 大小。 |

### 最终记忆模型

```txt
Naked type parameter distributes.
Tuple wrapping stops distribution.
```


---

## 06：模板字面量类型和组合爆炸

### 结论

模板字面量类型（template literal type）会把 union 组合成交叉乘积。两个小 union 可以接受，多个大 union 会迅速变成巨大字符串字面量集合。

### 技术意义

类型安全路由、事件名、CSS class、i18n key 都会用模板字面量类型。它们很有价值，但必须限制输入范围。

### 底层机制

```txt
`${A}-${B}`
A has 4 members.
B has 5 members.
Result has 20 members.
```

### API / 语法规范

```txt
type Route = `/api/${Version}/${Entity}/${Action}`;
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
Template literal type placeholder:
  ${TypeExpression}
```

### 文件结构

```txt
06-template-literal-explosion/
  templateCombinationCost.ts
  constrainedTemplateTypes.ts
  generatedStringUnionMistake.ts
```

### templateCombinationCost.ts

```ts
// Goal:
// Show how template literal types combine union members.

// Expected result:
// The route type accepts only generated combinations.

export type ApiVersion = "v1" | "v2";
export type ApiEntity = "product" | "order";
export type ApiAction = "list" | "read";

export type ApiRoute = `/api/${ApiVersion}/${ApiEntity}/${ApiAction}`;

export const route: ApiRoute = "/api/v1/product/list";

// @ts-expect-error: The action is not part of ApiAction.
export const invalidRoute: ApiRoute = "/api/v1/product/delete";
```

### constrainedTemplateTypes.ts

```ts
// Goal:
// Show an over-generated route type.

// Expected result:
// This compiles, but the result grows quickly as unions expand.

export type VersionName = "v1" | "v2" | "v3";
export type ResourceName = "product" | "order" | "customer" | "invoice";
export type ActionName = "list" | "read" | "create" | "update" | "delete";
export type FormatName = "json" | "csv" | "xml";

export type GeneratedEndpoint =
  `/api/${VersionName}/${ResourceName}/${ActionName}.${FormatName}`;

export const endpoint: GeneratedEndpoint = "/api/v1/product/list.json";
```

### generatedStringUnionMistake.ts

```ts
// Goal:
// Show a generated string union with too many independent dimensions.

// Expected result:
// This compiles, but the generated union grows by multiplication.

export type LocaleName = "en" | "fr" | "de" | "es";
export type PageName = "home" | "product" | "checkout" | "account";
export type SlotName = "title" | "subtitle" | "button" | "error";
export type VariantName = "default" | "short" | "long";

export type TranslationKey = `${LocaleName}.${PageName}.${SlotName}.${VariantName}`;

export const translationKey: TranslationKey = "en.product.title.default";
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
```

### 预期输出

```txt
The valid route passes.
The invalid route is rejected.
Instantiations and Types increase when union dimensions grow.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | TypeScript 读取每个 union 成员。 |
| 2 | 模板字面量类型组合所有可能字符串。 |
| 3 | 组合数量等于各维度数量相乘。 |
| 4 | 错误信息和 hover 可能显示巨大 union。 |

### 和实际项目的关系

路线名、权限名、埋点事件名很适合用模板字面量类型。但完整 API 世界、全量数据库字段路径、所有表单嵌套路径不一定适合完全类型生成。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| template literal type 只是字符串拼接 | 它会在类型层生成 union。 |
| 维度越多越安全 | 维度多会导致组合爆炸。 |

### 最终记忆模型

```txt
Template literal type size equals multiplied union dimensions.
Limit dimensions before they multiply.
```


---

## 07：递归类型和过深实例化

### 结论

递归类型能表达深层对象路径、JSON、树结构和 schema，但无界递归会触发过深实例化或严重拖慢检查器。

### 技术意义

类型递归不是普通函数递归。它发生在编译器内部，错误通常表现为 excessive type instantiation 或 hover 卡顿。

### 底层机制

```txt
DeepKeys<T>
  -> inspect T[key]
  -> if object, call DeepKeys<T[key]>
  -> repeat until primitive or compiler limit
```

### API / 语法规范

```txt
type Recursive<T> = T extends object ? Recursive<T[keyof T]> : T;
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
Depth counter:
  Custom type parameter for limiting recursive expansion.
Base case:
  Branch that stops recursion.
```

### 文件结构

```txt
07-recursive-types/
  recursiveDepthExample.ts
  boundedRecursiveType.ts
  excessiveInstantiationMistake.ts
```

### recursiveDepthExample.ts

```ts
// Goal:
// Use a simple recursive type with a clear base case.

// Expected result:
// The compiler accepts JSON-like values.

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export const productJson: JsonValue = {
  id: "p1",
  title: "Keyboard",
  tags: ["hardware", "sale"],
};
```

### boundedRecursiveType.ts

```ts
// Goal:
// Limit recursive path extraction with an explicit depth parameter.

// Expected result:
// The recursive type stops after a small number of levels.

export type DecrementMap = {
  0: 0;
  1: 0;
  2: 1;
  3: 2;
};

export type Depth = keyof DecrementMap;

export type LimitedKeys<ValueType, CurrentDepth extends Depth = 3> =
  CurrentDepth extends 0
    ? never
    : ValueType extends object
      ? keyof ValueType | {
          [Key in keyof ValueType]: LimitedKeys<ValueType[Key], DecrementMap[CurrentDepth]>;
        }[keyof ValueType]
      : never;
```

### excessiveInstantiationMistake.ts

```ts
// Goal:
// Show the shape of an unsafe recursive type pattern.

// Expected result:
// Keep this small; do not apply it to large object graphs.

export type UnsafeDeepValue<ValueType> = ValueType extends object
  ? UnsafeDeepValue<ValueType[keyof ValueType]>
  : ValueType;

export interface ProductTree {
  product: {
    metadata: {
      title: string;
    };
  };
}

export type ProductDeepValue = UnsafeDeepValue<ProductTree>;
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
```

### 预期输出

```txt
Small recursive examples compile.
Do not intentionally create huge recursive examples in the main project.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 递归类型检查当前类型是否是 object。 |
| 2 | 如果是 object，就遍历 key。 |
| 3 | 对每个 property 再应用递归类型。 |
| 4 | 如果没有深度限制，复杂输入会持续展开。 |
| 5 | 深度参数可以人为设置停止条件。 |

### 和实际项目的关系

表单路径、JSON schema、router path、translation key、deep readonly 都常用递归类型。简历项目里可以用，但必须限制深度。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 递归类型越深越专业 | 无界递归会拖慢甚至报错。 |
| 所有深层校验都应该在类型层完成 | 深层 runtime validation 应该交给运行时代码或 schema 库。 |

### 最终记忆模型

```txt
Recursive types need a base case.
Engineering recursive types also need a depth limit.
```


---

## 08：interface extends 与 intersection 的性能差异

### 结论

对象类型组合优先考虑 `interface extends`。不必要的 intersection（交叉类型）会让 TypeScript 递归合并属性，并且在类型关系比较时更难缓存。

### 技术意义

`interface extends` 创建一个更稳定、可缓存、可显示的对象类型。`A & B & C` 适合表达真正的交叉组合，但不应该作为所有对象组合的默认方式。

### 底层机制

```txt
interface A extends B, C -> named relationship
B & C -> intersection constituents must be flattened and compared
```

### API / 语法规范

```txt
interface ProductCardProps extends ProductIdentity, ProductPriceInfo {}
type ProductCardProps = ProductIdentity & ProductPriceInfo;
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
interface Child extends ParentA, ParentB {}
type Combined = A & B;
```

### 文件结构

```txt
08-interface-vs-intersection/
  intersectionCompositionCost.ts
  interfaceExtendsAlternative.ts
  propertyConflictComparison.ts
```

### intersectionCompositionCost.ts

```ts
// Goal:
// Compose object types with an intersection.

// Expected result:
// The compiler accepts it, but this pattern can become harder to display and compare.

export type ProductIdentity = {
  id: string;
};

export type ProductPricing = {
  priceCents: number;
};

export type ProductViewModel = ProductIdentity & ProductPricing & {
  title: string;
};

export const productViewModel: ProductViewModel = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};
```

### interfaceExtendsAlternative.ts

```ts
// Goal:
// Compose object types with interface extends.

// Expected result:
// The public object type has a named, cache-friendly shape.

export interface ProductIdentity {
  id: string;
}

export interface ProductPricing {
  priceCents: number;
}

export interface ProductViewModel extends ProductIdentity, ProductPricing {
  title: string;
}

export const productViewModel: ProductViewModel = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};
```

### propertyConflictComparison.ts

```ts
// Goal:
// Compare a conflicting intersection with an interface extension error.

// Expected result:
// The conflict is easier to reason about when object contracts stay named.

export type StringIdentifier = { id: string };
export type NumberIdentifier = { id: number };

export type ConflictingIntersection = StringIdentifier & NumberIdentifier;

// @ts-expect-error: The intersection makes id impossible to assign.
export const impossibleIdentifier: ConflictingIntersection = {
  id: "p1",
};
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
```

### 预期输出

```txt
The valid composition examples pass.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | intersection 组合对象类型。 |
| 2 | TypeScript 需要把交叉成员合成有效对象类型。 |
| 3 | interface extends 建立命名继承关系。 |
| 4 | interface 更容易显示和缓存。 |

### 和实际项目的关系

React props、API DTO、domain model、service contract 都经常组合对象类型。默认使用 interface extends 会更利于长期维护。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| type alias 永远比 interface 现代 | 二者都现代，性能和合并语义不同。 |
| intersection 是对象组合默认选择 | 对象继承优先 interface extends。 |

### 最终记忆模型

```txt
Prefer interface extends for object composition.
Use intersections when you truly need intersection semantics.
```


---

## 09：命名复杂类型和显式返回类型

### 结论

复杂导出类型要命名；公共导出函数要考虑显式返回类型。这样可以减少匿名巨大类型传播，也能让 `.d.ts` 输出和 hover 更稳定。

### 技术意义

如果导出函数返回一个复杂推导对象，TypeScript 可能需要在声明输出中重新打印完整结构。

### 底层机制

```txt
anonymous inferred return type -> compiler prints full shape
named return type -> compiler references compact name
```

### API / 语法规范

```txt
export function createProductSummary(product: ProductRecord): ProductSummary
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
function name(parameters): ReturnType
export interface Name {}
export type Name = ...
```

### 文件结构

```txt
09-named-types-return-annotations/
  anonymousReturnTypeCost.ts
  namedReturnTypeOptimization.ts
  declarationEmitNotes.md
```

### anonymousReturnTypeCost.ts

```ts
// Goal:
// Show a public function with a large inferred return type.

// Expected result:
// The compiler infers the return type from the object literal.

export function createAnonymousProductView(productId: string, titleText: string) {
  return {
    identity: {
      productId,
      titleText,
    },
    display: {
      headingText: titleText.toUpperCase(),
      badgeText: `product:${productId}`,
    },
    permissions: {
      canEdit: true,
      canArchive: false,
    },
  };
}
```

### namedReturnTypeOptimization.ts

```ts
// Goal:
// Use a named public return type for a public function.

// Expected result:
// The exported API has a compact named return type.

export interface ProductViewModel {
  identity: {
    productId: string;
    titleText: string;
  };
  display: {
    headingText: string;
    badgeText: string;
  };
  permissions: {
    canEdit: boolean;
    canArchive: boolean;
  };
}

export function createNamedProductView(
  productId: string,
  titleText: string,
): ProductViewModel {
  return {
    identity: { productId, titleText },
    display: {
      headingText: titleText.toUpperCase(),
      badgeText: `product:${productId}`,
    },
    permissions: {
      canEdit: true,
      canArchive: false,
    },
  };
}
```

### declarationEmitNotes.md

```md
# Declaration Emit Notes

## Files to compare

- `dist-anonymous/anonymousReturnTypeCost.d.ts`
- `dist-named/namedReturnTypeOptimization.d.ts`

## What to inspect

- Whether the exported return type is printed inline.
- Whether the declaration can reference a named interface.
- Whether hover output stays readable.
```

### 运行方式

```bash
npx tsc 09-named-types-return-annotations/anonymousReturnTypeCost.ts --declaration --emitDeclarationOnly --outDir dist-anonymous
npx tsc 09-named-types-return-annotations/namedReturnTypeOptimization.ts --declaration --emitDeclarationOnly --outDir dist-named
```

### 预期输出

```txt
dist-anonymous/anonymousReturnTypeCost.d.ts
dist-named/namedReturnTypeOptimization.d.ts
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 第一个函数没有返回类型注解。 |
| 2 | TypeScript 从对象字面量推导返回类型。 |
| 3 | declaration emit 需要打印这个推导类型。 |
| 4 | 第二个函数返回 `ProductViewModel`。 |
| 5 | declaration emit 可以引用命名类型。 |

### 和实际项目的关系

SDK、组件库、工具函数库、API client 都应该控制公共 API 类型表面。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有返回类型都靠推导最好 | 内部函数可以推导，公共导出常常应该显式。 |
| 显式返回类型只是代码啰嗦 | 它能稳定 `.d.ts`、hover 和 API contract。 |

### 最终记忆模型

```txt
Infer inside modules.
Name public surfaces.
```


---

## 10：include、exclude、files 和类型范围控制

### 结论

项目性能先看输入范围。`include` 太宽会让生成文件、测试文件、临时文件、旧代码全部进入 TypeScript program。

### 技术意义

类型检查器只能检查它看见的文件。文件越多，解析、绑定、模块解析和检查成本越高。

### 底层机制

```txt
tsconfig.json -> files/include/exclude -> root source files -> import graph -> program
```

### API / 语法规范

```txt
files: exact source file list
include: glob patterns for root files
exclude: glob patterns removed from include search
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
npx tsc --listFilesOnly
npx tsc --explainFiles
```

### 文件结构

```txt
10-project-input-boundary/
  tsconfig.too-broad.json
  tsconfig.focused.json
  includeExcludeFilesNotes.md
```

### tsconfig.too-broad.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["../**/*.ts"],
  "exclude": ["../node_modules"]
}
```

### tsconfig.focused.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "files": ["../09-named-types-return-annotations/namedReturnTypeOptimization.ts"],
  "exclude": ["../trace-output", "../dist", "../node_modules"]
}
```

### includeExcludeFilesNotes.md

```md
# Include, Exclude, and Files Notes

## Comparison target

Run both configs with `--listFilesOnly` and compare the number of included files.

## Rule

Start with a focused project boundary before changing complex types.
```

### 运行方式

```bash
npx tsc -p 10-project-input-boundary/tsconfig.too-broad.json --listFilesOnly
npx tsc -p 10-project-input-boundary/tsconfig.focused.json --explainFiles
```

### 预期输出

```txt
The broad config includes more files.
The focused config includes fewer files and is easier to reason about.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `include` 决定根文件搜索范围。 |
| 2 | `exclude` 从搜索结果中排除目录。 |
| 3 | import 依赖仍然可能被纳入 program。 |
| 4 | `listFilesOnly` 打印最终文件列表。 |
| 5 | `explainFiles` 说明文件为什么被包含。 |

### 和实际项目的关系

Next.js、Vite、monorepo 项目经常生成 `.next`、`dist`、`coverage`、`storybook-static`。这些不应该进入主类型检查 program。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| include: ["**/*"] 永远最省事 | 它可能把构建产物、临时文件、旧目录和测试夹具全部纳入类型检查。 |
| exclude 可以排除任何 import 文件 | 被源码 import 的文件仍可能进入 program。 |

### 最终记忆模型

```txt
Before optimizing types, optimize the program boundary.
```


---

## 11：types、typeRoots 和全局类型污染

### 结论

`types` 和 `typeRoots` 控制哪些全局 `@types/*` 声明进入项目。全局类型越多，潜在冲突和检查成本越高。

### 技术意义

很多包会通过 `@types` 声明全局变量，例如 `node`、`jest`、`vitest`。如果前端代码不需要 Node 全局类型，就不要让它们默认进入。

### 底层机制

```txt
node_modules/@types/* -> visible type packages -> global declarations -> program type environment
```

### API / 语法规范

```txt
types: array of package names whose global declarations should be included
typeRoots: array of directories where TypeScript looks for type packages
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
"types": []
"types": ["node"]
"typeRoots": ["./types", "./node_modules/@types"]
```

### 文件结构

```txt
11-global-types-boundary/
  tsconfig.with-many-types.json
  tsconfig.with-explicit-types.json
  typesBoundaryNotes.md
```

### tsconfig.with-many-types.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["../**/*.ts"],
  "exclude": ["../node_modules", "../dist", "../trace-output"]
}
```

### tsconfig.with-explicit-types.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": []
  },
  "include": ["../**/*.ts"],
  "exclude": ["../node_modules", "../dist", "../trace-output"]
}
```

### typesBoundaryNotes.md

```md
# Types Boundary Notes

## What to compare

Run both configs with `--explainFiles` and check which global type packages enter the program.

## Rule

Only include global type packages that match the current runtime environment.
```

### 运行方式

```bash
npx tsc -p 11-global-types-boundary/tsconfig.with-many-types.json --explainFiles
npx tsc -p 11-global-types-boundary/tsconfig.with-explicit-types.json --explainFiles
```

### 预期输出

```txt
Compare whether @types packages enter the program.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 没有 `types` 时，TypeScript 可能包含可见的 `@types` 包。 |
| 2 | `types: []` 表示不自动包含任何全局 `@types` 包。 |
| 3 | 需要 Node、Jest、Vitest 时再显式添加。 |
| 4 | `explainFiles` 可以帮助你确认来源。 |

### 和实际项目的关系

React 浏览器项目误引入 Node 类型后，可能出现 `setTimeout` 返回值、`process`、`Buffer` 等环境混淆。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 安装的所有 @types 都应该自动进入项目 | 只让当前环境需要的全局类型进入。 |
| typeRoots 更安全所以默认使用 | 配错 typeRoots 可能隐藏正常类型包。 |

### 最终记忆模型

```txt
Global types are part of the program environment.
Control them like dependencies.
```


---

## 12：incremental、composite 和 project references

### 结论

大型项目不要只靠一个巨大 `tsconfig.json`。用增量构建（incremental build）和项目引用（project references）把项目拆成可缓存、可独立检查的边界。

### 技术意义

项目引用让 TypeScript 以依赖图方式构建多个子项目。`tsc -b` 会按顺序构建过期项目。

### 底层机制

```txt
solution tsconfig -> references shared/client/server -> tsc -b -> .tsbuildinfo records build state
```

### API / 语法规范

```txt
composite: true
declaration: true
incremental: true
references: [{ path: "../shared" }]
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
npx tsc -b tsconfig.solution.json --verbose
npx tsc -b tsconfig.solution.json --clean
```

### 文件结构

```txt
12-incremental-references/
  packages/shared/src/index.ts
  packages/client/src/index.ts
  packages/server/src/index.ts
  packages/shared/tsconfig.json
  packages/client/tsconfig.json
  packages/server/tsconfig.json
  tsconfig.solution.json
  referenceBuildNotes.md
```

### packages/shared/src/index.ts

```ts
// Goal:
// Export a shared contract for referenced projects.

// Expected result:
// Client and server projects can reference this package.

export interface ProductContract {
  id: string;
  title: string;
}
```

### packages/client/src/index.ts

```ts
// Goal:
// Consume the shared contract from another referenced project.

// Expected result:
// The project reference build checks this after shared.

import type { ProductContract } from "../../shared/src/index.js";

export function renderProductTitle(product: ProductContract): string {
  return product.title.toUpperCase();
}
```

### packages/server/src/index.ts

```ts
// Goal:
// Consume the shared contract from the server project.

// Expected result:
// The server project is checked after the shared project.

import type { ProductContract } from "../../shared/src/index.js";

export function serializeProduct(product: ProductContract): string {
  return JSON.stringify(product);
}
```

### packages/shared/tsconfig.json

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"]
}
```

### packages/client/tsconfig.json

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [{ "path": "../shared" }],
  "include": ["src/**/*.ts"]
}
```

### packages/server/tsconfig.json

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [{ "path": "../shared" }],
  "include": ["src/**/*.ts"]
}
```

### tsconfig.solution.json

```json
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/client" },
    { "path": "./packages/server" }
  ]
}
```

### referenceBuildNotes.md

```md
# Reference Build Notes

## Commands

- `npx tsc -b 12-incremental-references/tsconfig.solution.json --verbose`
- `npx tsc -b 12-incremental-references/tsconfig.solution.json --clean`

## What to record

- Which project builds first.
- Which project is reused on the second build.
- Which `.tsbuildinfo` files are created.
```

### 运行方式

```bash
npx tsc -b 12-incremental-references/tsconfig.solution.json --verbose
npx tsc -b 12-incremental-references/tsconfig.solution.json --clean
```

### 预期输出

```txt
The first build compiles projects.
The second build reports projects are up to date.
The clean command removes build info and outputs.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | solution config 不直接包含源码。 |
| 2 | `references` 描述项目依赖图。 |
| 3 | `tsc -b` 先构建 shared。 |
| 4 | client 和 server 依赖 shared 的声明输出。 |
| 5 | 第二次构建读取 `.tsbuildinfo` 判断是否过期。 |

### 和实际项目的关系

monorepo、前后端共享类型、组件库 + app、SDK + demo 都适合 project references。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| project references 只是路径别名 | 它是构建和检查边界。 |
| 项目拆得越碎越快 | 太多小项目也会有额外开销。 |

### 最终记忆模型

```txt
One huge project slows the editor.
Too many tiny projects add overhead.
Split by real dependency boundaries.
```


---

## 13：skipLibCheck 的取舍边界

### 结论

`skipLibCheck` 可以跳过声明文件检查，从而提升速度或绕过第三方声明冲突。但它不是让你的代码更安全的选项。

### 技术意义

大型项目经常依赖很多 `.d.ts` 文件。跳过库声明检查可以减少检查成本，但不能解决真实类型定义错误。

### 底层机制

```txt
skipLibCheck: true -> skip checking declaration files -> still use their exposed types for your source code
```

### API / 语法规范

```txt
"skipLibCheck": true
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
skipLibCheck: boolean
true skips type checking of declaration files
false checks declaration files
```

### 文件结构

```txt
13-skip-lib-check/
  skipLibCheckTradeoff.ts
  dependencyTypeConflictNotes.md
  libCheckDecisionChecklist.md
```

### skipLibCheckTradeoff.ts

```ts
// Goal:
// Document that skipLibCheck does not skip checking your source file.

// Expected error:
// The compiler still checks this file.

export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

// @ts-expect-error: formatPrice expects a number.
formatPrice("9900");
```

### dependencyTypeConflictNotes.md

```md
# Dependency Type Conflict Notes

## What `skipLibCheck` changes

It skips checking declaration files, but your source files are still checked.

## What it does not change

It does not fix incorrect dependency types. It only avoids checking some declaration internals.
```

### libCheckDecisionChecklist.md

```md
# Lib Check Decision Checklist

- App project: `skipLibCheck` can be a practical speed tradeoff.
- Library project: keep declaration quality higher before publishing.
- Dependency conflict: use it as a temporary workaround, not as the final fix.
- Source safety: remember that source files are still checked.
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
```

### 预期输出

```txt
Your source file is still checked.
Declaration file checking behavior depends on skipLibCheck.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `skipLibCheck` 设置声明文件检查策略。 |
| 2 | TypeScript 仍然使用第三方声明里的类型。 |
| 3 | 你的 `.ts` 文件仍然被检查。 |
| 4 | 错误调用 `formatPrice("9900")` 仍然报错。 |

### 和实际项目的关系

业务 app 常开 `skipLibCheck` 很常见；库作者发布 `.d.ts` 前不应该只靠它掩盖声明质量问题。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| skipLibCheck 会让 TypeScript 不检查我的代码 | 它跳过 declaration files 的检查，不跳过你的 source files。 |
| skipLibCheck 能修复依赖类型 | 它只是绕过声明检查。 |

### 最终记忆模型

```txt
skipLibCheck is a dependency-checking tradeoff.
It is not a source-code safety switch.
```


---

## 14：编辑器性能、hover 长度和语言服务

### 结论

编辑器卡顿通常来自语言服务（language service）工作量：大类型 hover、复杂补全、全局类型过多、项目过大、插件额外分析。

### 技术意义

同样一段类型，CI 可能还能接受，但 IDE hover 可能会卡。开发体验也是工程质量的一部分。

### 底层机制

```txt
hover / completion / diagnostics -> language service -> compute type at cursor -> display type
```

### API / 语法规范

```txt
VS Code setting:
  js/ts.hover.maximumLength

WebStorm setting:
  TypeScript language service memory and project TypeScript version
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
js/ts.hover.maximumLength
TSServer log
TypeScript language service memory limit
```

### 文件结构

```txt
14-editor-performance/
  hugeHoverType.ts
  namedHoverType.ts
  editorSettingsNotes.md
```

### hugeHoverType.ts

```ts
// Goal:
// Create a type that can produce a large hover.

// Expected result:
// Hovering the exported value may show a large expanded type.

export type EntityName = "product" | "order" | "customer";
export type ActionName = "list" | "read" | "create";

export type HandlerTable = {
  [Entity in EntityName as `${Entity}Handlers`]: {
    [Action in ActionName as `${Action}Handler`]: (input: unknown) => Promise<unknown>;
  };
};

export declare const handlerTable: HandlerTable;
```

### namedHoverType.ts

```ts
// Goal:
// Use named types to keep hover output smaller.

// Expected result:
// Hover can reference named interfaces.

export interface HandlerGroup {
  listHandler(input: unknown): Promise<unknown>;
  readHandler(input: unknown): Promise<unknown>;
  createHandler(input: unknown): Promise<unknown>;
}

export interface NamedHandlerTable {
  productHandlers: HandlerGroup;
  orderHandlers: HandlerGroup;
  customerHandlers: HandlerGroup;
}

export declare const namedHandlerTable: NamedHandlerTable;
```

### editorSettingsNotes.md

```md
# Editor Settings Notes

## VS Code

- Check the workspace TypeScript version.
- Check `js/ts.hover.maximumLength`.
- Capture TSServer logs when editor latency is severe.

## Rule

A type that compiles quickly can still be painful if hover output is too large.
```

### 运行方式

```bash
npx tsc --noEmit 14-editor-performance/hugeHoverType.ts
npx tsc --noEmit 14-editor-performance/namedHoverType.ts
```

### 预期输出

```txt
No compiler errors.
Compare hover readability in the editor.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `hugeHoverType.ts` 用映射类型生成多层对象。 |
| 2 | IDE hover 可能展开生成结果。 |
| 3 | `namedHoverType.ts` 把公共结构命名为 interface。 |
| 4 | hover 可以显示较短的命名类型。 |

### 和实际项目的关系

复杂 React component props、generic hooks、polymorphic component、schema inference 经常造成 hover 巨大。不要让 IDE 每次都展开完整宇宙。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| IDE 卡就是电脑不行 | 先检查项目大小、插件、TypeScript version、hover 大小。 |
| tsc 快就代表 IDE 一定快 | 语言服务还要处理交互式请求。 |

### 最终记忆模型

```txt
Editor performance is type performance plus interaction cost.
Readable public types help humans and tools.
```


---

## 15：API 类型设计的性能策略

### 结论

高质量 TypeScript API 类型不是最复杂，而是足够精确、稳定可读、可缓存、可调试。

### 技术意义

类型设计影响调用方的编译速度和 IDE 体验。库作者尤其要控制导出的类型表面。

### 底层机制

```txt
exported generic type -> imported by many files -> instantiated many times -> appears in hovers and errors
```

### API / 语法规范

```txt
Prefer stable public type.
Avoid leaking deeply computed internals as public return type.
```

### 固定属性名 / 固定方法名 / 参数签名

```txt
Public API type: exported type used by external modules
Internal helper type: non-exported type used inside implementation
```

### 文件结构

```txt
15-api-type-design/
  overPreciseApiType.ts
  stableApiSurface.ts
  apiTypeDesignChecklist.md
```

### overPreciseApiType.ts

```ts
// Goal:
// Show an over-precise public type surface.

// Expected result:
// This works, but it exposes generated keys to every consumer.

export type EntityName = "product" | "order" | "customer";
export type FieldName = "id" | "title" | "status";

export type ExactEntityFieldMap = {
  [Entity in EntityName as `${Entity}Fields`]: {
    [Field in FieldName as `${Entity}_${Field}`]: string;
  };
};

export function createExactFieldMap(): ExactEntityFieldMap {
  return {} as ExactEntityFieldMap;
}
```

### stableApiSurface.ts

```ts
// Goal:
// Expose a stable public API and keep exact internals private.

// Expected result:
// Consumers see a smaller stable contract.

export interface EntityFieldGroup {
  id: string;
  title: string;
  status: string;
}

export interface EntityFieldMap {
  product: EntityFieldGroup;
  order: EntityFieldGroup;
  customer: EntityFieldGroup;
}

export function createStableFieldMap(): EntityFieldMap {
  return {
    product: { id: "p1", title: "Keyboard", status: "active" },
    order: { id: "o1", title: "Order", status: "paid" },
    customer: { id: "c1", title: "Customer", status: "active" },
  };
}
```

### apiTypeDesignChecklist.md

```md
# API Type Design Checklist

- Keep precise generated types inside implementation modules when possible.
- Export named interfaces for public contracts.
- Add explicit return types for exported factory functions.
- Avoid exposing template-generated maps when callers only need stable methods.
- Measure before and after public type changes.
```

### 运行方式

```bash
npx tsc --noEmit 15-api-type-design/overPreciseApiType.ts
npx tsc --noEmit 15-api-type-design/stableApiSurface.ts
```

### 预期输出

```txt
Both examples compile.
The second example exposes a smaller and more stable public type.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `ExactEntityFieldMap` 用模板字面量类型生成所有 key。 |
| 2 | 导出函数暴露这个生成类型。 |
| 3 | 每个调用方都要理解这个精确结构。 |
| 4 | `EntityFieldMap` 暴露稳定业务形状。 |
| 5 | 调用方 hover 和错误更清楚。 |

### 和实际项目的关系

简历项目里，如果你写 SDK、API client、design system、form builder，要优先设计可读公共类型，而不是展示类型体操。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 公共类型越精确越高级 | 公共类型应该表达调用者需要的合同，而不是暴露内部生成细节。 |
| 稳定 API 就是不安全 | 稳定 API 保留必要约束，隐藏内部复杂度。 |

### 最终记忆模型

```txt
Internal types can be clever.
Public types should be stable.
```


---

## 8. 本章 API / 语法完整索引

| 名称 | 所属对象 / 层级 | 签名 / 写法 | 参数 | 返回 / 输出 | 是否修改文件 | 常见坑 |
|---|---|---|---|---|---|---|
| `--extendedDiagnostics` | `tsc` CLI | `tsc --extendedDiagnostics` | 无 | stdout 性能指标 | 否 | 只看单次总时间，不做前后对比。 |
| `--generateTrace` | `tsc` CLI | `tsc --generateTrace <dir>` | `dir` 输出目录 | `trace.json`、`types.json` | 写 trace 文件 | 不应放进日常 CI。 |
| `--noErrorTruncation` | `tsc` CLI | `tsc --noErrorTruncation` | 无 | 完整错误文本 | 否 | 不是性能优化，只是诊断辅助。 |
| `--listFilesOnly` | `tsc` CLI | `tsc --listFilesOnly` | 无 | 文件列表 | 否 | 只显示文件，不解释原因。 |
| `--explainFiles` | `tsc` CLI | `tsc --explainFiles` | 无 | 文件来源说明 | 否 | 输出很多，要保存对比。 |
| `--traceResolution` | `tsc` CLI | `tsc --traceResolution` | 无 | 模块解析日志 | 否 | 信息量大，适合解析路径问题。 |
| `--showConfig` | `tsc` CLI | `tsc --showConfig` | 无 | 展开后的配置 | 否 | 不等于运行类型检查。 |
| `incremental` | TSConfig | `"incremental": true` | boolean | `.tsbuildinfo` | 写构建信息 | 不等于项目拆分。 |
| `composite` | TSConfig | `"composite": true` | boolean | 构建约束 | 影响构建输出 | 被引用项目需要它。 |
| `references` | TSConfig | `"references": [{"path":"..."}]` | path | 项目依赖图 | 否 | 不是 path alias。 |
| `skipLibCheck` | TSConfig | `"skipLibCheck": true` | boolean | 跳过声明文件检查 | 否 | 不是跳过源码检查。 |
| `types` | TSConfig | `"types": []` | string[] | 控制全局 `@types` | 否 | 配错会隐藏 node / jest / vitest 全局类型。 |
| `typeRoots` | TSConfig | `"typeRoots": ["./types"]` | string[] | 控制类型包目录 | 否 | 通常不需要随便配置。 |
| `files` | TSConfig | `"files": ["src/index.ts"]` | file paths | 根文件列表 | 否 | 大项目手写容易漏文件。 |
| `include` | TSConfig | `"include": ["src/**/*.ts"]` | glob patterns | 根文件搜索范围 | 否 | 太宽会纳入无关文件。 |
| `exclude` | TSConfig | `"exclude": ["dist"]` | glob patterns | 排除搜索范围 | 否 | 不阻止被 import 的文件进入 program。 |
| `interface extends` | 类型语法 | `interface A extends B {}` | parent interfaces | 命名对象类型 | 否 | 适合对象组合。 |
| `intersection` | 类型语法 | `A & B` | constituent types | 交叉类型 | 否 | 过度使用会难显示和难缓存。 |
| 非分布式条件 | 类型语法 | `[T] extends [U] ? X : Y` | wrapped types | 整体判断 | 否 | 忘记 tuple wrapping 会分布式展开。 |

---

## 9. 本章常见错误总表

| 错误 | 为什么错 | 正确做法 |
|---|---|---|
| 还没测量就开始改类型 | 无法证明优化有效 | 先跑 `extendedDiagnostics`。 |
| 只看 `Total time` | 单次总时间受机器状态影响 | 同时看 `Types`、`Instantiations`、`Check time`。 |
| 把 `generateTrace` 放进日常 CI | trace 输出重，不适合每次跑 | 只在调查热点时使用。 |
| 用 `noErrorTruncation` 当优化 | 它只改变错误显示 | 用它看清复杂类型来源。 |
| 所有对象组合都用 `&` | intersection 难缓存、冲突难读 | 对象继承优先 `interface extends`。 |
| 所有 API 都暴露最精确生成类型 | 调用方 hover 和错误会变巨大 | 公共 API 用稳定命名类型。 |
| 无限制使用 template literal types | union 维度相乘 | 限制 union 输入或代码生成。 |
| 无界递归类型 | 可能触发过深实例化 | 加深度限制或移到运行时。 |
| `include: ["**/*"]` | 纳入过多文件 | 明确 include / exclude / files。 |
| 滥用 `typeRoots` | 可能隐藏正常类型包 | 优先用 `types` 控制全局类型。 |
| 认为 `skipLibCheck` 更安全 | 它是跳过声明检查 | app 可取舍，库发布要谨慎。 |
| 项目引用拆得越多越好 | 项目也有额外开销 | 按真实依赖边界拆。 |

---

## 10. 最终小项目：Type Performance Audit

### 项目目标

做一个“类型性能审计”小项目。你要把一个过度精确的 API 类型表面重构成更稳定、更容易检查、更适合公开导出的类型表面，并记录优化前后的诊断指标。

### 使用到的本章知识点

```txt
extendedDiagnostics
noErrorTruncation
generateTrace
large union
template literal type
distributive conditional type
interface extends
named return type
public API surface
diagnostics checklist
```

### 推荐文件结构

```txt
16-mini-project-type-performance-audit/
  sampleApiTypes.ts
  sampleSlowTypes.ts
  auditTypeSurface.ts
  auditChecklist.md
  optimizationReport.md
```

### sampleSlowTypes.ts

```ts
// Goal:
// Provide intentionally over-precise public types for audit practice.

// Expected result:
// The file compiles, but its public type surface is larger than necessary.

export type EntityName = "product" | "order" | "customer" | "invoice";
export type ActionName = "list" | "read" | "create" | "update";
export type ApiVersion = "v1" | "v2";
export type ResponseFormat = "json" | "csv";

export type GeneratedRoute =
  `/api/${ApiVersion}/${EntityName}/${ActionName}.${ResponseFormat}`;

export type GeneratedRouteHandlerMap = {
  [RouteName in GeneratedRoute]: {
    route: RouteName;
    execute(input: unknown): Promise<{
      route: RouteName;
      received: unknown;
      metadata: {
        generatedAtIso: string;
        routeLength: number;
      };
    }>;
  };
};

export function createGeneratedRouteHandlers(): GeneratedRouteHandlerMap {
  return {} as GeneratedRouteHandlerMap;
}
```

### auditTypeSurface.ts

```ts
// Goal:
// Replace an over-generated public type surface with stable named interfaces.

// Expected result:
// Consumers receive a compact API contract.

export type EntityName = "product" | "order" | "customer" | "invoice";
export type ActionName = "list" | "read" | "create" | "update";
export type ApiVersion = "v1" | "v2";
export type ResponseFormat = "json" | "csv";

export interface RouteDescriptor {
  version: ApiVersion;
  entity: EntityName;
  action: ActionName;
  format: ResponseFormat;
}

export interface RouteExecutionMetadata {
  generatedAtIso: string;
  routeLength: number;
}

export interface RouteExecutionResult {
  descriptor: RouteDescriptor;
  received: unknown;
  metadata: RouteExecutionMetadata;
}

export interface RouteHandler {
  descriptor: RouteDescriptor;
  execute(input: unknown): Promise<RouteExecutionResult>;
}

export type RouteHandlerRegistry = Record<string, RouteHandler>;

export function createRouteHandlerRegistry(): RouteHandlerRegistry {
  return {};
}
```

### sampleApiTypes.ts

```ts
// Goal:
// Provide stable shared API names for the audit project.

// Expected result:
// Other files can import these names instead of recreating unions.

export type EntityName = "product" | "order" | "customer" | "invoice";
export type ActionName = "list" | "read" | "create" | "update";
export type ApiVersion = "v1" | "v2";
export type ResponseFormat = "json" | "csv";

export interface RouteDescriptor {
  version: ApiVersion;
  entity: EntityName;
  action: ActionName;
  format: ResponseFormat;
}
```

### auditChecklist.md

```md
# Type Performance Audit Checklist

- Record baseline diagnostics.
- Identify generated public types.
- Name stable public contracts.
- Limit generated string unions.
- Re-run diagnostics after each change.
- Compare hover readability before and after.
```

### optimizationReport.md

```md
# Optimization Report

## Baseline

- Files:
- Types:
- Instantiations:
- Check time:
- Total time:

## After optimization

- Files:
- Types:
- Instantiations:
- Check time:
- Total time:

## Summary

The public type surface became smaller and easier to inspect.
```

### 运行方式

```bash
npx tsc -p tsconfig.perf.json --noEmit --extendedDiagnostics
npx tsc -p tsconfig.trace.json --noEmit --generateTrace ./trace-output
```

### 预期输出

```txt
Before optimization:
  Record Types, Instantiations, Check time, and hover readability.

After optimization:
  Compare whether public hover and declaration output are smaller.
```

### 完整执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `sampleSlowTypes.ts` 生成所有 route 字符串组合。 |
| 2 | `GeneratedRouteHandlerMap` 为每个 route 创建 handler 类型。 |
| 3 | `createGeneratedRouteHandlers()` 暴露巨大公共返回类型。 |
| 4 | `auditTypeSurface.ts` 改用命名 interface 和 `Record<string, RouteHandler>`。 |
| 5 | 公共 API 不再暴露每个 route 的生成细节。 |
| 6 | 运行 `extendedDiagnostics` 记录指标。 |
| 7 | 运行 `generateTrace` 查看是否还有热点。 |
| 8 | 把结果写入 `optimizationReport.md`。 |

### API 角色表

| API / 语法 | 在小项目中的角色 |
|---|---|
| `--extendedDiagnostics` | 建立优化前后性能基线。 |
| `--generateTrace` | 生成深入分析文件。 |
| `--noErrorTruncation` | 观察巨大错误类型。 |
| template literal type | 生成精确 route 字符串。 |
| mapped type | 根据 route 生成 handler map。 |
| `Record<string, RouteHandler>` | 提供更小的公共 registry 类型。 |
| `interface` | 命名公共 API 结构。 |
| explicit return type | 稳定导出函数类型表面。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 只比较代码行数 | 类型性能看检查工作量，不只看代码长度。 |
| 优化后完全失去业务约束 | 保留关键 union，减少不必要组合。 |
| 把所有 route 精度都删掉 | 内部可以精确，公共 API 可以稳定。 |
| 不写报告 | 没有前后数据就不能证明优化。 |

### 可扩展任务

```txt
1. 给 optimizationReport.md 增加前后指标表。
2. 对 sampleSlowTypes.ts 添加更多 union 维度，观察增长。
3. 把 route 字符串生成迁移到运行时代码。
4. 用 Compiler API 读取导出类型名称，自动生成 public API report。
5. 在 CI 中加入 npm run perf，但只记录指标，不让 trace 每次运行。
```

### 和真实项目 / 简历项目的关系

这个小项目可以转化为“TypeScript 类型性能审计工具”的简历亮点：你能解释如何诊断慢类型、如何重构公共类型表面、如何用 `extendedDiagnostics` 和 trace 支撑工程判断。这比单纯说“会高级类型”更有竞争力。

### 最终记忆模型

```txt
Measure first.
Expose less.
Name public types.
Limit generated unions.
Keep precision where it pays rent.
```

---

## 11. 额外 cheatsheet

本章已单独生成速查表：

```txt
typescript/type-system-performance/typescript-type-system-performance-cheatsheet-zh-v1.md
```

速查表负责快速复习：

```txt
1. 核心命令。
2. TSConfig 性能选项。
3. 慢类型模式。
4. 优化策略。
5. 常见 IDE 警告。
6. 官方文档链接。
```

---

## 12. 最终文件清单

```txt
typescript/
  type-system-performance/
    typescript-type-system-performance-learning-guide-zh-v1.md
    typescript-type-system-performance-cheatsheet-zh-v1.md
    README.md
    package.json
    tsconfig.json
    tsconfig.perf.json
    tsconfig.trace.json
    tsconfig.solution.json

    00-performance-model/
      typeCheckerWorkModel.ts
      runtimeVsTypePerformance.ts
      modelNotes.md

    01-extended-diagnostics/
      simpleBaseline.ts
      namedReturnBaseline.ts
      diagnosticsChecklist.md

    02-no-error-truncation/
      truncatedErrorExample.ts
      readableNamedTypeExample.ts
      errorOutputNotes.md

    03-generate-trace/
      traceHotspotExample.ts
      traceCommandNotes.md
      traceReviewChecklist.md

    04-large-unions/
      largeUnionCost.ts
      baseTypeAlternative.ts
      largeUnionMistake.ts

    05-distributive-conditionals/
      distributiveConditionalCost.ts
      nonDistributiveConditional.ts
      conditionalExplosionMistake.ts

    06-template-literal-explosion/
      templateCombinationCost.ts
      constrainedTemplateTypes.ts
      generatedStringUnionMistake.ts

    07-recursive-types/
      recursiveDepthExample.ts
      boundedRecursiveType.ts
      excessiveInstantiationMistake.ts

    08-interface-vs-intersection/
      intersectionCompositionCost.ts
      interfaceExtendsAlternative.ts
      propertyConflictComparison.ts

    09-named-types-return-annotations/
      anonymousReturnTypeCost.ts
      namedReturnTypeOptimization.ts
      declarationEmitNotes.md

    10-project-input-boundary/
      tsconfig.too-broad.json
      tsconfig.focused.json
      includeExcludeFilesNotes.md

    11-global-types-boundary/
      tsconfig.with-many-types.json
      tsconfig.with-explicit-types.json
      typesBoundaryNotes.md

    12-incremental-references/
      packages/shared/src/index.ts
      packages/client/src/index.ts
      packages/server/src/index.ts
      packages/shared/tsconfig.json
      packages/client/tsconfig.json
      packages/server/tsconfig.json
      tsconfig.solution.json
      referenceBuildNotes.md

    13-skip-lib-check/
      skipLibCheckTradeoff.ts
      dependencyTypeConflictNotes.md
      libCheckDecisionChecklist.md

    14-editor-performance/
      hugeHoverType.ts
      namedHoverType.ts
      editorSettingsNotes.md

    15-api-type-design/
      overPreciseApiType.ts
      stableApiSurface.ts
      apiTypeDesignChecklist.md

    16-mini-project-type-performance-audit/
      sampleApiTypes.ts
      sampleSlowTypes.ts
      auditTypeSurface.ts
      auditChecklist.md
      optimizationReport.md
```

---

## 13. 最终学习笔记转换要求

练习做完后，把本章整理成正式学习笔记。不要直接复制本指导文件。最终笔记要更像你自己的工程判断。

每个知识点按这个结构整理：

```md
## 知识点名称

### 结论

### 技术意义

### 底层机制

### API / 语法规范

### 代码示例

### 执行过程

### 常见错误

### 最终记忆模型
```

最终笔记必须包含这些对比：

```txt
runtime performance vs type-checking performance
tsc performance vs editor performance
extendedDiagnostics vs generateTrace
noErrorTruncation vs performance optimization
union precision vs base type stability
distributive conditional vs non-distributive conditional
template literal precision vs combinatorial explosion
recursive type vs bounded recursive type
interface extends vs intersection
anonymous inferred return vs named return type
include vs files vs exclude
types vs typeRoots
incremental vs project references
skipLibCheck tradeoff vs declaration correctness
internal clever type vs public stable type
```

---

## 14. 本章最终记忆模型

```txt
TypeScript performance has two roots:
  too many files
  too much type computation

Measure first:
  extendedDiagnostics
  noErrorTruncation
  generateTrace
  listFilesOnly
  explainFiles

Optimize project boundary:
  include
  exclude
  files
  types
  typeRoots
  project references
  skipLibCheck with caution

Optimize type design:
  prefer interface extends for object composition
  name complex types
  annotate public return types
  limit large unions
  stop accidental distributive conditionals
  constrain template literal dimensions
  bound recursive types
  expose stable public APIs

Final principle:
  advanced types are tools, not decorations.
```

---

## 15. 官方文档阅读清单

按这个顺序读：

1. [TypeScript Wiki: Performance](https://github.com/microsoft/TypeScript/wiki/Performance)  
   重点读 writing easy-to-compile code、project references、configuring tsconfig、investigating issues。

2. [TSConfig: extendedDiagnostics](https://www.typescriptlang.org/tsconfig/extendedDiagnostics.html)  
   理解它用于发现编译时间花在哪里。

3. [TSConfig: generateTrace](https://www.typescriptlang.org/tsconfig/generateTrace.html)  
   理解它会生成事件 trace 和类型列表。

4. [TSConfig: noErrorTruncation](https://www.typescriptlang.org/tsconfig/noErrorTruncation.html)  
   理解完整错误输出如何帮助观察巨大类型。

5. [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)  
   理解大型项目如何拆分为多个可构建子项目。

6. [TSConfig: incremental](https://www.typescriptlang.org/tsconfig/incremental.html)  
   理解 `.tsbuildinfo` 的作用。

7. [TSConfig: skipLibCheck](https://www.typescriptlang.org/tsconfig/skipLibCheck.html)  
   理解跳过声明文件检查的速度取舍。

8. [TypeScript 5.9 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)  
   重点读 configurable maximum hover length 和 optimizations。

---

## 16. 学习文件完整性检查清单

```txt
[x] Chapter directory: typescript/type-system-performance/
[x] No unrelated notes directory
[x] Main explanations use Chinese
[x] Important terms include English terms
[x] Code identifiers use English
[x] Code comments use English
[x] Each section includes conclusion, mechanism, files, execution, mistakes, and memory model
[x] API and config option names are explicit
[x] Config object property names are explicit
[x] Function signatures and outputs are explicit
[x] Common editor warnings are covered
[x] Official links use Markdown links
[x] Examples are runnable or marked as expected errors
[x] Directory structure is complete
[x] Final mini project is complete
[x] Cheatsheet path is documented
[x] Final file list is complete
[x] Run checklist is complete
[x] This file remains a learning guide, not final notes
```

# TypeScript 必补章节 04：“TSConfig 安全配置”学习指导文件 v1

> 定位：这是对《TypeScript Programming》附录 F“安全相关的 TSC 编译器标志”和第 2、3、6、11、12 章配置内容的集中训练文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件和多个 `tsconfig` 文件，运行 `tsc`，观察不同配置如何改变类型检查结果。  
> 参考范围：TypeScript 官方 TSConfig Reference 的 `strict`、`noImplicitAny`、`strictNullChecks`、`useUnknownInCatchVariables`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`strictFunctionTypes`、`strictBindCallApply`、`noImplicitThis`、`noImplicitReturns`、`noFallthroughCasesInSwitch`、`noImplicitOverride`、`noPropertyAccessFromIndexSignature`、`noEmitOnError`、`isolatedModules`、`verbatimModuleSyntax`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：把配置当成“项目安全边界”，不是 IDE 偏好。每个 flag 都要对应一个具体会被阻止的错误。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| `strict` 严格检查族总开关 | [TSConfig strict](https://www.typescriptlang.org/tsconfig/strict.html) |
| 禁止隐式 `any` | [TSConfig noImplicitAny](https://www.typescriptlang.org/tsconfig/noImplicitAny.html) |
| 严格区分 `null` / `undefined` | [TSConfig strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) |
| `catch` 变量默认为 `unknown` | [TSConfig useUnknownInCatchVariables](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html) |
| 索引访问加入 `undefined` | [TSConfig noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html) |
| 精确可选属性语义 | [TSConfig exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html) |
| 函数参数严格检查 | [TSConfig strictFunctionTypes](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html) |
| `call` / `apply` / `bind` 严格检查 | [TSConfig strictBindCallApply](https://www.typescriptlang.org/tsconfig/strictBindCallApply.html) |
| `this` 隐式 `any` 检查 | [TSConfig noImplicitThis](https://www.typescriptlang.org/tsconfig/noImplicitThis.html) |
| 返回路径检查 | [TSConfig noImplicitReturns](https://www.typescriptlang.org/tsconfig/noImplicitReturns.html) |
| switch fallthrough 检查 | [TSConfig noFallthroughCasesInSwitch](https://www.typescriptlang.org/tsconfig/noFallthroughCasesInSwitch.html) |
| 重写父类成员必须显式 `override` | [TSConfig noImplicitOverride](https://www.typescriptlang.org/tsconfig/noImplicitOverride.html) |
| 索引签名属性必须用 `[]` 访问 | [TSConfig noPropertyAccessFromIndexSignature](https://www.typescriptlang.org/tsconfig/noPropertyAccessFromIndexSignature.html) |
| 有错误时不输出 JS | [TSConfig noEmitOnError](https://www.typescriptlang.org/tsconfig/noEmitOnError.html) |
| 单文件转译安全 | [TSConfig isolatedModules](https://www.typescriptlang.org/tsconfig/isolatedModules.html) |
| 明确保留或擦除 type-only import/export | [TSConfig verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [完整学习顺序](#3-完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：TSConfig 安全配置到底在解决什么](#5-00tsconfig-安全配置到底在解决什么)
6. [01：配置分层：base、learning、react、node、library](#6-01配置分层baselearningreactnodelibrary)
7. [02：`strict` 和隐式 `any`](#7-02strict-和隐式-any)
8. [03：`strictNullChecks`](#8-03strictnullchecks)
9. [04：`useUnknownInCatchVariables`](#9-04useunknownincatchvariables)
10. [05：`noUncheckedIndexedAccess`](#10-05nouncheckedindexedaccess)
11. [06：`exactOptionalPropertyTypes`](#11-06exactoptionalpropertytypes)
12. [07：函数安全配置](#12-07函数安全配置)
13. [08：控制流安全配置](#13-08控制流安全配置)
14. [09：类安全：`noImplicitOverride`](#14-09类安全noimplicitoverride)
15. [10：索引签名安全：`noPropertyAccessFromIndexSignature`](#15-10索引签名安全nopropertyaccessfromindexsignature)
16. [11：输出安全：`noEmitOnError`](#16-11输出安全noemitonerror)
17. [12：模块转译安全：`isolatedModules`、`verbatimModuleSyntax`](#17-12模块转译安全isolatedmodulesverbatimmodulesyntax)
18. [13：小项目整合](#18-13小项目整合)
19. [最终文件清单](#19-最终文件清单)
20. [最终学习笔记转换要求](#20-最终学习笔记转换要求)
21. [本章最终要能回答的问题](#21-本章最终要能回答的问题)
22. [最终记忆模型](#22-最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这份文件不是让你复制一份“最严格 tsconfig”，而是让你理解每个安全 flag 到底阻止哪一类错误。

每节都要回答：

```txt
Which bug does this flag prevent?
Which code passes without the flag?
Which code fails with the flag?
What change makes the code honest?
```

### 每节固定学习步骤

```txt
1. Read the conclusion first.
2. Create the example file.
3. Run the file under the loose config if needed.
4. Run the file under the strict config.
5. Record the compiler error.
6. Fix the code honestly instead of adding as any.
7. Convert the section into final notes.
```

---

## 2. 项目重新整理建议

```txt
typescript/
  tsconfig-safety/
    README.md
    configs/
      tsconfig.base.json
      tsconfig.learning.json
      tsconfig.react.json
      tsconfig.node.json
      tsconfig.library.json
      tsconfig.loose-demo.json
    00-problem-model/
      configSafetyModel.ts
    01-config-profiles/
      configProfileNotes.md
    02-strict-no-implicit-any/
      implicitAnyParameter.ts
      explicitBoundary.ts
    03-strict-null-checks/
      unsafeFind.ts
      safeFind.ts
    04-catch-unknown/
      catchUnknown.ts
      catchErrorNarrowing.ts
    05-indexed-access/
      arrayIndex.ts
      dictionaryLookup.ts
    06-exact-optional-properties/
      optionalAbsentVsUndefined.ts
      explicitUndefinedUnion.ts
    07-function-safety/
      functionVariance.ts
      bindApplyCall.ts
      implicitThis.ts
    08-control-flow-safety/
      missingReturn.ts
      switchFallthrough.ts
    09-class-safety/
      overrideMistake.ts
    10-index-signature-safety/
      envAccess.ts
    11-emit-safety/
      noEmitOnErrorNotes.md
    12-module-transpile-safety/
      typeOnlyImport.ts
      isolatedModuleBoundary.ts
    13-mini-project/
      tsconfig.project.json
      apiClient.ts
      routeHandlers.ts
      app.ts
```

---

## 3. 完整学习顺序

```txt
config safety problem model
  -> config profiles
  -> strict and noImplicitAny
  -> strictNullChecks
  -> useUnknownInCatchVariables
  -> noUncheckedIndexedAccess
  -> exactOptionalPropertyTypes
  -> function safety flags
  -> control-flow safety flags
  -> class safety flags
  -> index-signature safety flags
  -> emit safety
  -> module transpile safety
  -> mini project
```

---

## 4. 本章先要建立的底层模型

### 结论

TSConfig 安全配置分为五层：

```txt
type soundness:
  strict, noImplicitAny, strictNullChecks, exactOptionalPropertyTypes

runtime uncertainty:
  useUnknownInCatchVariables, noUncheckedIndexedAccess

function and object model:
  strictFunctionTypes, strictBindCallApply, noImplicitThis, noImplicitOverride

control flow:
  noImplicitReturns, noFallthroughCasesInSwitch

toolchain boundary:
  noEmitOnError, isolatedModules, verbatimModuleSyntax
```

---

## 5. 00：TSConfig 安全配置到底在解决什么

### `configSafetyModel.ts`

```ts
// Goal:
// Classify TSConfig safety flags.

// Expected result:
// The file compiles and prints safety layers.

export {};

type SafetyLayer =
  | "type-soundness"
  | "runtime-uncertainty"
  | "function-object-model"
  | "control-flow"
  | "toolchain-boundary";

const layers: SafetyLayer[] = [
  "type-soundness",
  "runtime-uncertainty",
  "function-object-model",
  "control-flow",
  "toolchain-boundary",
];

console.log(layers.join(","));
```

---

## 6. 01：配置分层：base、learning、react、node、library

### 结论

不要所有场景只用一个 `tsconfig.json`。学习、React、Node、library build 的配置边界不同，但安全 flags 应尽量共享。

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noEmitOnError": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### `tsconfig.learning.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  }
}
```

### `tsconfig.react.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

### `tsconfig.node.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "types": ["node"],
    "verbatimModuleSyntax": true
  }
}
```

### `tsconfig.library.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "verbatimModuleSyntax": true
  }
}
```

---

## 7. 02：`strict` 和隐式 `any`

### 结论

`strict` 是严格检查族总开关；`noImplicitAny` 会阻止 TypeScript 在无法推导时偷偷退回 `any`。

### `implicitAnyParameter.ts`

```ts
// Goal:
// Show why implicit any is unsafe.

// Expected result:
// noImplicitAny rejects the untyped parameter.

export {};

// @ts-expect-error: value implicitly has an any type.
function formatValue(value) {
  return value.trim().toUpperCase();
}

console.log(formatValue("Keyboard"));
```

### `explicitBoundary.ts`

```ts
// Goal:
// Fix the boundary by writing an explicit type.

export {};

function formatValue(value: string): string {
  return value.trim().toUpperCase();
}

console.log(formatValue("Keyboard"));
```

### 常见错误

```txt
Mistake:
  Add value: any to silence noImplicitAny.

Correct:
  Add the real boundary type or use unknown and narrow it.
```

---

## 8. 03：`strictNullChecks`

### 结论

`strictNullChecks` 打开后，`null` 和 `undefined` 不再能偷偷流入具体类型。可能找不到结果的 API 必须显式处理空值。

### `unsafeFind.ts`

```ts
// Goal:
// Show that find can return undefined.

// Expected result:
// strictNullChecks rejects unsafe access.

export {};

const products = [
  { id: "p1", title: "Keyboard" },
  { id: "p2", title: "Mouse" },
];

const product = products.find((item) => item.id === "missing");

// @ts-expect-error: product may be undefined.
console.log(product.title);
```

### `safeFind.ts`

```ts
// Goal:
// Handle undefined before property access.

export {};

const products = [
  { id: "p1", title: "Keyboard" },
  { id: "p2", title: "Mouse" },
];

const product = products.find((item) => item.id === "p1");

if (product !== undefined) {
  console.log(product.title);
}
```

---

## 9. 04：`useUnknownInCatchVariables`

### 结论

`catch` 里捕获到的不一定是 `Error`。这个 flag 让你先把错误值当成 `unknown`，再收窄。

### `catchUnknown.ts`

```ts
// Goal:
// Treat caught values as unknown.

export {};

try {
  throw "broken";
} catch (errorValue) {
  // @ts-expect-error: errorValue is unknown.
  console.log(errorValue.message);
}
```

### `catchErrorNarrowing.ts`

```ts
// Goal:
// Narrow a caught value before reading message.

export {};

try {
  throw new Error("Load failed");
} catch (errorValue) {
  if (errorValue instanceof Error) {
    console.log(errorValue.message);
  } else {
    console.log("Unknown error");
  }
}
```

---

## 10. 05：`noUncheckedIndexedAccess`

### 结论

数组索引和字典 key 读取可能失败。这个 flag 给不确定索引读取结果加上 `undefined`。

### `arrayIndex.ts`

```ts
// Goal:
// Handle possibly missing array element.

export {};

const titles = ["Keyboard", "Mouse"];

const firstTitle = titles[0];

if (firstTitle !== undefined) {
  console.log(firstTitle.toUpperCase());
}
```

### `dictionaryLookup.ts`

```ts
// Goal:
// Handle possibly missing dictionary value.

export {};

type ProductDictionary = Record<string, { title: string }>;

const products: ProductDictionary = {
  p1: { title: "Keyboard" },
};

const product = products["missing"];

if (product !== undefined) {
  console.log(product.title);
}
```

---

## 11. 06：`exactOptionalPropertyTypes`

### 结论

打开后，`property?: T` 表示“属性可以不存在”，不自动等于“属性存在且值可以是 `undefined`”。

### `optionalAbsentVsUndefined.ts`

```ts
// Goal:
// Distinguish absent optional property from explicit undefined.

export {};

type UserSettings = {
  themeOverride?: "dark" | "light";
};

const settings: UserSettings = {};

// @ts-expect-error: undefined is not assignable unless explicitly allowed.
settings.themeOverride = undefined;

console.log("themeOverride" in settings);
```

### `explicitUndefinedUnion.ts`

```ts
// Goal:
// Allow explicit undefined when the runtime model needs it.

export {};

type UserSettings = {
  themeOverride?: "dark" | "light" | undefined;
};

const settings: UserSettings = {};

settings.themeOverride = undefined;

console.log(settings.themeOverride);
```

---

## 12. 07：函数安全配置

### 结论

函数安全配置保护参数位置、`call/apply/bind` 和 `this` 绑定。

### `functionVariance.ts`

```ts
// Goal:
// Avoid accepting a callback that requires a narrower argument.

export {};

type ProductEvent = {
  id: string;
};

type DetailedProductEvent = {
  id: string;
  title: string;
};

function handleProductEvent(callback: (event: ProductEvent) => void): void {
  callback({ id: "p1" });
}

const callback = (event: DetailedProductEvent): void => {
  console.log(event.title.toUpperCase());
};

// @ts-expect-error: callback requires a narrower event.
handleProductEvent(callback);
```

### `bindApplyCall.ts`

```ts
// Goal:
// Check call, apply, and bind argument types.

export {};

function formatPrice(currencyCode: string, priceCents: number): string {
  return `${currencyCode}:${priceCents}`;
}

console.log(formatPrice.call(undefined, "USD", 9900));

// @ts-expect-error: priceCents must be a number.
formatPrice.call(undefined, "USD", "9900");
```

### `implicitThis.ts`

```ts
// Goal:
// Avoid implicit any for this.

export {};

type ProductFormatter = {
  prefix: string;
  format(this: ProductFormatter, id: string): string;
};

const formatter: ProductFormatter = {
  prefix: "product",
  format(id) {
    return `${this.prefix}:${id}`;
  },
};

console.log(formatter.format("p1"));
```

---

## 13. 08：控制流安全配置

### 结论

控制流安全配置阻止函数漏返回和 switch 意外贯穿。

### `missingReturn.ts`

```ts
// Goal:
// Ensure every code path returns a value.

export {};

type RequestState =
  | { status: "success"; title: string }
  | { status: "error"; message: string };

function renderState(state: RequestState): string {
  if (state.status === "success") {
    return state.title;
  }

  return state.message;
}

console.log(renderState({ status: "success", title: "Keyboard" }));
```

### `switchFallthrough.ts`

```ts
// Goal:
// Avoid accidental switch fallthrough.

export {};

type Status = "draft" | "paid" | "shipped";

function renderStatus(status: Status): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "paid":
      return "Paid";
    case "shipped":
      return "Shipped";
  }
}

console.log(renderStatus("paid"));
```

---

## 14. 09：类安全：`noImplicitOverride`

### 结论

这个 flag 要求重写父类成员时显式写 `override`，避免父类方法改名后子类悄悄变成新方法。

### `overrideMistake.ts`

```ts
// Goal:
// Require explicit override when replacing a base method.

export {};

class BaseRepository {
  findTitle(id: string): string {
    return `base:${id}`;
  }
}

class ProductRepository extends BaseRepository {
  override findTitle(id: string): string {
    return `product:${id}`;
  }
}

const repository = new ProductRepository();

console.log(repository.findTitle("p1"));
```

---

## 15. 10：索引签名安全：`noPropertyAccessFromIndexSignature`

### 结论

有 index signature 的未知字段应该用 `[]` 访问，这能提醒你这个字段不是明确声明的属性。

### `envAccess.ts`

```ts
// Goal:
// Use bracket access for values covered only by an index signature.

export {};

type Environment = {
  NODE_ENV: string;
  [key: string]: string;
};

declare const env: Environment;

const mode = env.NODE_ENV;
const apiUrl = env["API_URL"];

console.log(mode, apiUrl);
```

---

## 16. 11：输出安全：`noEmitOnError`

### 结论

`noEmitOnError` 阻止有类型错误的项目继续输出 JavaScript，避免错误代码进入运行环境。

### `noEmitOnErrorNotes.md`

```txt
Experiment:
  1. Create a file with a type error.
  2. Run tsc with noEmitOnError false.
  3. Observe that JavaScript can still be emitted.
  4. Run tsc with noEmitOnError true.
  5. Observe that output is blocked.

Rule:
  Application and library projects should normally keep noEmitOnError enabled.
```

---

## 17. 12：模块转译安全：`isolatedModules`、`verbatimModuleSyntax`

### 结论

这两个 flag 让你的源码更适合 Babel、swc、esbuild 等单文件转译工具，并强迫你明确区分类型导入和值导入。

### `typeOnlyImport.ts`

```ts
// Goal:
// Use type-only import for type dependencies.

import type { ProductRecord } from "./types.js";

export function formatProduct(product: ProductRecord): string {
  return product.title;
}
```

### `isolatedModuleBoundary.ts`

```ts
// Goal:
// Make the file explicitly a module.

export {};

const localValue = "module-local";

console.log(localValue);
```

---

## 18. 13：小项目整合

### 结论

本章小项目建立一套安全 `tsconfig.project.json`，然后写一个 API client 和 route handler，触发空值、catch、索引访问、optional 属性、函数边界和模块导入检查。

### `tsconfig.project.json`

```json
{
  "extends": "../configs/tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  },
  "include": ["*.ts"]
}
```

### `apiClient.ts`

```ts
// Goal:
// Handle unknown JSON, catch unknown errors, and nullable results.

export type ProductRecord = {
  id: string;
  title: string;
  metadata?: {
    source: "api" | "cache";
  };
};

export type ApiResult =
  | { ok: true; value: ProductRecord }
  | { ok: false; message: string };

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.id === "string" && typeof candidate.title === "string";
}

export async function loadProduct(): Promise<ApiResult> {
  try {
    const response = await fetch("/api/product");
    const value: unknown = await response.json();

    if (!isProductRecord(value)) {
      return { ok: false, message: "Invalid response" };
    }

    return { ok: true, value };
  } catch (errorValue) {
    if (errorValue instanceof Error) {
      return { ok: false, message: errorValue.message };
    }

    return { ok: false, message: "Unknown error" };
  }
}
```

### `routeHandlers.ts`

```ts
// Goal:
// Keep route handlers safe under strict function and return checks.

import type { ApiResult, ProductRecord } from "./apiClient.js";

export type RouteHandler<Request, Response> = (
  request: Request,
) => Promise<Response>;

export type GetProductRequest = {
  params: {
    id: string;
  };
};

export const getProductHandler: RouteHandler<GetProductRequest, ApiResult> =
  async (request) => {
    const product: ProductRecord = {
      id: request.params.id,
      title: "Keyboard",
    };

    return {
      ok: true,
      value: product,
    };
  };
```

### `app.ts`

```ts
// Goal:
// Consume the safe API result.

import { loadProduct } from "./apiClient.js";

async function main(): Promise<void> {
  const result = await loadProduct();

  if (result.ok) {
    console.log(result.value.metadata?.source ?? "unknown");
  } else {
    console.log(result.message);
  }
}

void main();
```

---

## 19. 最终文件清单

```txt
typescript/
  tsconfig-safety/
    README.md
    configs/
      tsconfig.base.json
      tsconfig.learning.json
      tsconfig.react.json
      tsconfig.node.json
      tsconfig.library.json
      tsconfig.loose-demo.json
    00-problem-model/
      configSafetyModel.ts
    01-config-profiles/
      configProfileNotes.md
    02-strict-no-implicit-any/
      implicitAnyParameter.ts
      explicitBoundary.ts
    03-strict-null-checks/
      unsafeFind.ts
      safeFind.ts
    04-catch-unknown/
      catchUnknown.ts
      catchErrorNarrowing.ts
    05-indexed-access/
      arrayIndex.ts
      dictionaryLookup.ts
    06-exact-optional-properties/
      optionalAbsentVsUndefined.ts
      explicitUndefinedUnion.ts
    07-function-safety/
      functionVariance.ts
      bindApplyCall.ts
      implicitThis.ts
    08-control-flow-safety/
      missingReturn.ts
      switchFallthrough.ts
    09-class-safety/
      overrideMistake.ts
    10-index-signature-safety/
      envAccess.ts
    11-emit-safety/
      noEmitOnErrorNotes.md
    12-module-transpile-safety/
      typeOnlyImport.ts
      isolatedModuleBoundary.ts
    13-mini-project/
      tsconfig.project.json
      apiClient.ts
      routeHandlers.ts
      app.ts
```

---

## 20. 最终学习笔记转换要求

最终笔记必须包含这些对比：

```txt
strict vs individual strict flags
implicit any vs explicit unknown
strictNullChecks off vs on
catch any vs catch unknown
array[index] as T vs T | undefined
optional property absent vs explicit undefined
method override vs accidental new method
dot access declared property vs bracket access index signature
emit with errors vs noEmitOnError
normal import vs import type
single-file transpilation vs whole-program type checking
learning tsconfig vs React tsconfig vs Node tsconfig vs library tsconfig
```

---

## 21. 本章最终要能回答的问题

1. `strict` 为什么不是普通风格选项？
2. `noImplicitAny` 阻止了哪类错误？
3. 为什么 `unknown` 比 `any` 更适合外部边界？
4. `strictNullChecks` 如何改变 `find()` 的返回类型？
5. 为什么 catch 变量不能直接当成 `Error`？
6. `noUncheckedIndexedAccess` 为什么会让数组索引结果包含 `undefined`？
7. `exactOptionalPropertyTypes` 如何区分属性不存在和属性值为 `undefined`？
8. `strictFunctionTypes` 在回调参数上保护什么？
9. `strictBindCallApply` 为什么和第 4 章函数学习有关？
10. `noImplicitThis` 解决什么 `this` 问题？
11. `noImplicitReturns` 如何帮助错误处理？
12. `noFallthroughCasesInSwitch` 防止什么控制流错误？
13. `noImplicitOverride` 如何保护继承重构？
14. `noPropertyAccessFromIndexSignature` 为什么推荐 bracket access？
15. `noEmitOnError` 对构建产物有什么意义？
16. `isolatedModules` 为什么和前端工具链有关？
17. `verbatimModuleSyntax` 为什么让 `import type` 更重要？
18. 为什么不同项目类型应该有不同 tsconfig profile？
19. 哪些安全 flags 应该成为你所有 TS 项目的默认配置？

---

## 22. 最终记忆模型

```txt
Safety config is executable discipline.

Type strictness:
  strict
  noImplicitAny
  strictNullChecks
  exactOptionalPropertyTypes

Runtime uncertainty:
  useUnknownInCatchVariables
  noUncheckedIndexedAccess

Function and object model:
  strictFunctionTypes
  strictBindCallApply
  noImplicitThis
  noImplicitOverride

Control flow:
  noImplicitReturns
  noFallthroughCasesInSwitch

Toolchain:
  noEmitOnError
  isolatedModules
  verbatimModuleSyntax
```

### 最终一句话

```txt
TSConfig 安全配置的意义不是让报错变多，而是把真实项目里最容易从类型边界漏到运行时的错误提前拦下来。
```

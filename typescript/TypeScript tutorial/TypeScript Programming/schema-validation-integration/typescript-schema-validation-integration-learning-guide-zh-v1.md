# TypeScript Schema Validation Integration 学习指导文件 v1

> 定位：这是 `typescript/schema-validation-integration/` 的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` / `.tsx` / `.json` 文件、运行 `tsc` 类型检查、运行验证示例、观察成功输出和错误对象，再把每节整理成正式学习笔记。  
> 参考范围：TypeScript 官方 Handbook 的 `unknown`、Narrowing、Generics、Utility Types、Modules、TSConfig strict 相关内容；Zod 官方文档；Valibot 官方文档；JSON Schema 官方文档；Ajv 官方文档；React Hook Form Resolvers 文档。  
> 语言规则：正文统一中文；必要技术术语保留英文括号)。  
> 代码规则：代码命名和代码注释统一英文；代码、字符串和代码注释不使用中文字符。  
> 学习原则：先理解 TypeScript 的静态类型为什么不能验证运行时数据，再理解 schema 如何把 `unknown` 转换成可信领域类型。不要把本章学成“Zod API 速查表”。

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
   - [01：运行时验证到底解决什么问题](#01运行时验证到底解决什么问题)
   - [02：`unknown` 边界和手写 type guard](#02unknown-边界和手写-type-guard)
   - [03：Zod schema 基础和 `parse()`](#03zod-schema-基础和-parse)
   - [04：`safeParse()`、错误对象和 Result 边界](#04safeparse错误对象和-result-边界)
   - [05：`z.infer`、`z.input`、`z.output` 和 transform](#05zinferzinputzoutput-和-transform)
   - [06：对象 schema、未知字段策略和 schema 组合](#06对象-schema未知字段策略和-schema-组合)
   - [07：联合、判别联合和表单状态建模](#07联合判别联合和表单状态建模)
   - [08：业务规则、`refine()`、`superRefine()` 和错误路径](#08业务规则refinesuperrefine-和错误路径)
   - [09：异步验证、`parseAsync()` 和外部依赖](#09异步验证parseasync-和外部依赖)
   - [10：表单验证集成和 React Hook Form resolver](#10表单验证集成和-react-hook-form-resolver)
   - [11：API client、typed fetch 和响应验证](#11api-clienttyped-fetch-和响应验证)
   - [12：后端 route、请求体验证和响应 schema](#12后端-route请求体验证和响应-schema)
   - [13：环境变量、URLSearchParams 和 localStorage 验证](#13环境变量urlsearchparams-和-localstorage-验证)
   - [14：JSON Schema、Ajv 和跨语言 contract](#14json-schemaajv-和跨语言-contract)
   - [15：Valibot 对照和 schema 库选择](#15valibot-对照和-schema-库选择)
   - [16：性能、bundle、错误信息和边界设计](#16性能bundle错误信息和边界设计)
9. [8. 本章 API / 语法完整索引](#8-本章-api--语法完整索引)
10. [9. 本章常见错误总表](#9-本章常见错误总表)
11. [10. 最终小项目：Checkout Validation Boundary](#10-最终小项目checkout-validation-boundary)
12. [11. 额外 cheatsheet](#11-额外-cheatsheet)
13. [12. 最终文件清单](#12-最终文件清单)
14. [13. 最终学习笔记转换要求](#13-最终学习笔记转换要求)
15. [14. 本章最终记忆模型](#14-本章最终记忆模型)
16. [15. 官方文档阅读清单](#15-官方文档阅读清单)
17. [16. 生成前自检清单](#16-生成前自检清单)

---

## 0. 文件定位

### 结论

本文件训练的是 TypeScript 项目里的运行时验证边界（runtime validation boundary）。它不是 schema 库 API 总结，也不是后端接口规范速查表。

你要通过本章建立一个稳定模型：

```txt
external runtime value
  -> unknown
  -> schema validation
  -> typed output
  -> domain logic
```

TypeScript 类型检查发生在编译期。API 响应、表单输入、URL 查询参数、localStorage、环境变量、第三方 SDK 返回值都发生在运行时。schema validation 的职责就是把这些运行时值从“不可信”变成“经过验证的可信类型”。

### 本文件不做什么

```txt
不是只学习 Zod。
不是只学习表单验证。
不是把所有数据都 as 成业务类型。
不是把前后端共享 type 当成运行时安全。
不是用 schema 代替所有业务规则。
```

---

## 1. 本章学习目标

学完本章后，你应该能做到：

1. 解释 TypeScript 静态类型为什么不能验证 JSON、表单、URL、localStorage、环境变量。
2. 正确使用 `unknown` 表示外部数据边界。
3. 区分 type guard、schema parser、assertion function、Result wrapper。
4. 使用 Zod 定义对象、数组、字面量、枚举、联合、判别联合、可选、可空、默认值、转换和业务规则。
5. 区分 `parse()`、`safeParse()`、`parseAsync()`、`safeParseAsync()`。
6. 区分 `z.infer`、`z.input`、`z.output`。
7. 把 schema 接到 API client、后端 route、React form、环境变量、URLSearchParams、localStorage。
8. 理解 JSON Schema 和 Ajv 适合跨语言 contract 与高性能验证的场景。
9. 对照理解 Zod 和 Valibot 的接口差异。
10. 设计最终小项目：一个 checkout 输入边界验证管线。

---

## 2. 本章学习顺序

```txt
runtime trust boundary
  -> unknown boundary
  -> manual type guard
  -> Zod schema basics
  -> parse and safeParse
  -> inferred input and output types
  -> object unknown-key policy
  -> unions and discriminated unions
  -> refine and superRefine
  -> async validation
  -> form resolver integration
  -> typed fetch response validation
  -> backend request validation
  -> env, URLSearchParams, localStorage validation
  -> JSON Schema and Ajv
  -> Valibot comparison
  -> performance and architecture
  -> final mini project
```

---

## 3. 本章核心术语表

| 术语 | 解释 |
|---|---|
| 运行时验证（runtime validation） | 程序运行时检查一个值是否满足某个结构和规则。 |
| schema | 描述运行时数据结构、约束、转换和错误信息的对象。 |
| 不可信数据（untrusted data） | 来源不受当前 TypeScript 程序控制的数据，例如 HTTP JSON、表单、localStorage。 |
| `unknown` | TypeScript 中表示“值存在但不能直接使用”的安全顶层类型。 |
| type guard | 返回类型谓词（type predicate）的函数，例如 `value is Product`。 |
| parser | 接收 unknown，验证成功时返回目标值，失败时抛错或返回错误结果。 |
| `parse()` | Zod 中验证失败会 throw 的解析方法。 |
| `safeParse()` | Zod 中返回判别联合结果的解析方法。 |
| input type | schema 接收的输入类型。转换前的类型。 |
| output type | schema 解析成功后输出的类型。转换后的类型。 |
| transform | 验证后把输入值转换成另一个输出值。 |
| refinement | 在基础结构验证后增加业务规则检查。 |
| issue | schema 验证失败时记录的一条错误信息。 |
| path | issue 对应的数据路径，例如 `items.0.quantity`。 |
| JSON Schema | 用 JSON 文档描述 JSON 数据结构和约束的标准。 |
| Ajv | 常用 JSON Schema validator，会把 schema 编译成验证函数。 |
| resolver | 表单库和 schema 库之间的适配器。 |

---

## 4. 本章底层模型

### 结论

TypeScript 类型是编译期静态信息，schema 是运行时对象。真正安全的工程边界必须两者配合。

### 底层机制

```txt
TypeScript source code
  -> type checker validates static code
  -> emitted JavaScript removes types
  -> runtime receives external data
  -> schema object validates external value
  -> parsed output enters domain logic
```

### 三个不同层次

| 层次 | 存在时间 | 能做什么 | 不能做什么 |
|---|---|---|---|
| TypeScript type | 编译期 | 检查你写的代码是否自洽 | 检查服务器实际返回的 JSON |
| schema object | 运行时 | 验证实际值、返回错误、转换数据 | 替代所有业务逻辑 |
| domain model | 运行时和编译期 | 表示业务可信数据 | 自动保证外部数据正确 |

### 本章关键判断

```txt
Any value crossing a process, network, storage, user-input, or environment boundary should start as unknown.
```

这句话是本章的总开关。

---

## 5. 推荐目录结构

在你的项目中创建：

```txt
typescript/schema-validation-integration/
  typescript-schema-validation-integration-learning-guide-zh-v1.md
  typescript-schema-validation-integration-cheatsheet-zh-v1.md
  README.md
  package.json
  tsconfig.json

  00-runtime-validation-problem/
    staticTypeDoesNotValidateJson.ts
    trustedBoundaryMistake.ts
    boundaryDecisionTable.ts

  01-unknown-type-guard/
    unknownBoundary.ts
    manualProductGuard.ts
    unsafeAssertionMistake.ts

  02-zod-schema-basics/
    productSchemaBasics.ts
    primitiveSchemaMethods.ts
    invalidProductParseMistake.ts

  03-parse-safeparse-errors/
    parseThrowsExample.ts
    safeParseResultExample.ts
    zodErrorIssueFormatter.ts

  04-input-output-transform/
    inferredTypeExample.ts
    transformInputOutput.ts
    transformTypeMistake.ts

  05-object-key-policy-composition/
    objectUnknownKeyPolicy.ts
    schemaComposition.ts
    chainedExtendMistake.ts

  06-unions-discriminated-unions/
    paymentUnionSchema.ts
    checkoutStateSchema.ts
    plainUnionPerformanceNote.ts

  07-refine-superrefine-business-rules/
    passwordConfirmRefine.ts
    cartItemSuperRefine.ts
    wrongPathMistake.ts

  08-async-validation/
    asyncEmailCheck.ts
    parseAsyncRequired.ts
    syncParseAsyncMistake.ts

  09-form-integration/
    checkoutFormSchema.ts
    checkoutFormComponent.tsx
    formNumberCoercionMistake.tsx

  10-api-client-validation/
    typedFetchWithSchema.ts
    productApiClient.ts
    responseAssertionMistake.ts

  11-backend-route-validation/
    routeRequestSchemas.ts
    createProductHandler.ts
    unsafeBodyHandlerMistake.ts

  12-env-url-storage-validation/
    envSchema.ts
    urlSearchParamsSchema.ts
    localStorageSchema.ts

  13-json-schema-ajv/
    productJsonSchema.json
    ajvValidationExample.ts
    jsonSchemaTypeGap.md

  14-valibot-comparison/
    valibotProductSchema.ts
    valibotSafeParseExample.ts
    libraryChoiceNotes.md

  15-performance-boundary-design/
    schemaReuseExample.ts
    validationBoundaryMap.ts
    overValidationMistake.ts

  16-mini-project/
    schemas.ts
    validationResult.ts
    typedClient.ts
    routeHandler.ts
    formBoundary.tsx
    app.ts
    mistakes.ts
    miniProjectChecklist.md
```

---

## 6. 运行方式

### 安装依赖

```bash
cd typescript/schema-validation-integration
npm init -y
npm install zod valibot ajv react react-dom react-hook-form @hookform/resolvers
npm install -D typescript @types/react @types/react-dom tsx
npx tsc --init
```

### 推荐 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noEmitOnError": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

### 类型检查清单

```bash
npx tsc --noEmit
```

### 运行清单

```bash
npx tsx 00-runtime-validation-problem/staticTypeDoesNotValidateJson.ts
npx tsx 01-unknown-type-guard/manualProductGuard.ts
npx tsx 02-zod-schema-basics/productSchemaBasics.ts
npx tsx 03-parse-safeparse-errors/safeParseResultExample.ts
npx tsx 04-input-output-transform/transformInputOutput.ts
npx tsx 05-object-key-policy-composition/objectUnknownKeyPolicy.ts
npx tsx 06-unions-discriminated-unions/paymentUnionSchema.ts
npx tsx 07-refine-superrefine-business-rules/cartItemSuperRefine.ts
npx tsx 08-async-validation/asyncEmailCheck.ts
npx tsx 10-api-client-validation/productApiClient.ts
npx tsx 11-backend-route-validation/createProductHandler.ts
npx tsx 12-env-url-storage-validation/urlSearchParamsSchema.ts
npx tsx 13-json-schema-ajv/ajvValidationExample.ts
npx tsx 14-valibot-comparison/valibotSafeParseExample.ts
npx tsx 15-performance-boundary-design/schemaReuseExample.ts
npx tsx 16-mini-project/app.ts
```

---

## 7. 分节训练内容

## 01：运行时验证到底解决什么问题

### 结论

TypeScript 能检查你写的静态代码，但不能检查运行时从外部进入的真实数据。schema validation 解决的是“运行时数据是否真的符合类型”的问题。

### 技术意义

这节要把一个错误直觉打掉：

```txt
错误直觉：const data: Product = await response.json()
正确模型：const data: unknown = await response.json(); parse data before use.
```

### 底层机制

TypeScript 的类型注解会在编译后被擦除。服务器返回的 JSON 字符串由 `JSON.parse()` 或 `response.json()` 在运行时产生对象。这个对象没有自动附带 TypeScript 类型。

### API / 语法规范

| API / 语法 | 所属对象 | 签名 | 返回值 | 作用 |
|---|---|---|---|---|
| `JSON.parse()` | `JSON` | `JSON.parse(text, reviver?)` | `any` | 把 JSON text 解析成 JS 值。 |
| `Response.json()` | Fetch API | `response.json()` | `Promise<any>` 或实现定义类型 | 读取响应体并解析 JSON。 |
| `unknown` | TypeScript | `const value: unknown` | 无运行时输出 | 强制先缩小类型再使用。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
JSON.parse(text, reviver?)
response.json()
unknown
```

### 文件结构

```txt
00-runtime-validation-problem/
  staticTypeDoesNotValidateJson.ts
  trustedBoundaryMistake.ts
  boundaryDecisionTable.ts
```

### 示例代码

`staticTypeDoesNotValidateJson.ts`

```ts
// Goal:
// Show that a TypeScript type annotation does not validate JSON at runtime.

// Expected output:
// undefined

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

const jsonText = '{"id":"p1","title":"Keyboard","price":"99.00"}';
const product = JSON.parse(jsonText) as ProductRecord;

console.log(product.priceCents);
```

`trustedBoundaryMistake.ts`

```ts
// Goal:
// Demonstrate why asserting external data is unsafe.

// Expected error:
// This file compiles, but it models an unsafe boundary.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

function readProduct(value: unknown): ProductRecord {
  return value as ProductRecord;
}

const product = readProduct({ id: "p1", title: "Keyboard", price: "99.00" });

console.log(product.priceCents);
```

`boundaryDecisionTable.ts`

```ts
// Goal:
// Classify data sources by trust level.

// Expected output:
// api-response:unknown
// local-code:trusted

export {};

type DataSource =
  | { name: "api-response"; trust: "unknown" }
  | { name: "form-input"; trust: "unknown" }
  | { name: "local-storage"; trust: "unknown" }
  | { name: "local-code"; trust: "trusted" };

const sources: DataSource[] = [
  { name: "api-response", trust: "unknown" },
  { name: "local-code", trust: "trusted" },
];

for (const source of sources) {
  console.log(`${source.name}:${source.trust}`);
}
```

### 运行方式

```bash
npx tsx 00-runtime-validation-problem/staticTypeDoesNotValidateJson.ts
npx tsx 00-runtime-validation-problem/trustedBoundaryMistake.ts
npx tsx 00-runtime-validation-problem/boundaryDecisionTable.ts
```

### 预期输出

```txt
undefined
undefined
api-response:unknown
local-code:trusted
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `JSON.parse()` 把字符串解析成普通 JS object。 |
| 2 | `as ProductRecord` 只影响 TypeScript 的静态视图。 |
| 3 | 运行时对象真实字段是 `price`，不是 `priceCents`。 |
| 4 | 读取不存在的 `priceCents` 得到 `undefined`。 |
| 5 | 编译期没有自动验证 JSON shape。 |

### 和实际项目的关系

API client、server route handler、Next.js server action、React form、localStorage 恢复状态都需要这种边界判断。你后面写简历项目时，所有外部输入都要能说清楚“在哪里变成可信类型”。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| `as ProductRecord` 用在 API response 上 | 先用 schema parse。 |
| 把共享 type 当成 runtime contract | 共享 type 不会在运行时执行。 |
| 只在后端验证，不在前端验证 | 前端验证改善 UX，后端验证保证安全。两者职责不同。 |

### 最终记忆模型

```txt
Type annotation describes what you expect.
Schema validation checks what you actually received.
```

---

## 02：`unknown` 边界和手写 type guard

### 结论

`unknown` 是外部数据进入 TypeScript 项目的安全起点。手写 type guard 可以验证简单结构，但复杂嵌套、错误详情、转换、异步规则更适合 schema 库。

### 技术意义

`unknown` 强迫你先做类型缩小（narrowing）。它比 `any` 更安全，因为不能直接读取属性、调用方法或传给要求具体类型的函数。

### 底层机制

TypeScript 遇到 `value is ProductRecord` 返回类型时，会在 `if` 分支内把 `value` 的静态类型缩小为 `ProductRecord`。运行时真正执行的是你函数体里的 `typeof`、`Array.isArray()`、`in`、属性检查等 JS 逻辑。

### API / 语法规范

| API / 语法 | 签名 | 返回值 | 作用 |
|---|---|---|---|
| `typeof` | `typeof value` | string | 检查原始类型。 |
| `Array.isArray()` | `Array.isArray(value)` | boolean | 检查数组。 |
| type predicate | `value is T` | boolean | 告诉 TS 条件成立后 value 是 T。 |
| `Record<string, unknown>` | 类型 | 无 | 安全读取未知对象属性。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
typeof value
Array.isArray(value)
value is TargetType
Record<string, unknown>
```

### 文件结构

```txt
01-unknown-type-guard/
  unknownBoundary.ts
  manualProductGuard.ts
  unsafeAssertionMistake.ts
```

### 示例代码

`unknownBoundary.ts`

```ts
// Goal:
// Verify that unknown cannot be used without narrowing.

// Expected result:
// The compiler rejects direct property access on unknown.

export {};

const payload: unknown = { title: "Keyboard" };

// @ts-expect-error: payload is unknown.
console.log(payload.title);

if (typeof payload === "object" && payload !== null) {
  const record = payload as Record<string, unknown>;
  console.log(record.title);
}
```

`manualProductGuard.ts`

```ts
// Goal:
// Validate a simple product object with a hand-written type guard.

// Expected output:
// Keyboard

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

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

const inputValue: unknown = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

if (isProductRecord(inputValue)) {
  console.log(inputValue.title);
}
```

`unsafeAssertionMistake.ts`

```ts
// Goal:
// Show the difference between narrowing and assertion.

// Expected output:
// undefined

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

const inputValue: unknown = {
  id: "p1",
  title: "Keyboard",
  price: "99.00",
};

const product = inputValue as ProductRecord;

console.log(product.priceCents);
```

### 运行方式

```bash
npx tsc --noEmit
npx tsx 01-unknown-type-guard/manualProductGuard.ts
npx tsx 01-unknown-type-guard/unsafeAssertionMistake.ts
```

### 预期输出

```txt
Keyboard
undefined
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `inputValue` 的静态类型是 `unknown`。 |
| 2 | `isProductRecord()` 先排除非对象和 `null`。 |
| 3 | `candidate` 只被当成 `Record<string, unknown>` 读取属性。 |
| 4 | 三个字段都通过 `typeof` 检查后返回 true。 |
| 5 | `if` 分支内 TypeScript 把 `inputValue` 缩小为 `ProductRecord`。 |

### 和实际项目的关系

手写 guard 适合非常小的边界，例如检查一个 feature flag、一个简单事件 payload、一个从 `postMessage` 进入的轻量消息。业务 API response、复杂 form、后端 request body 不建议长期手写。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| `value as ProductRecord` 当作验证 | 断言不执行检查。 |
| guard 只检查外层对象 | 嵌套对象和数组元素也要检查。 |
| guard 返回 boolean 而不是 type predicate | TS 不会自动缩小到目标类型。 |

### 最终记忆模型

```txt
unknown is a locked box.
A type guard is a key.
A type assertion is a label pasted on the box.
```

---

## 03：Zod schema 基础和 `parse()`

### 结论

Zod schema 是运行时对象。它既能验证真实值，也能让 TypeScript 从 schema 推导静态类型。

### 技术意义

Zod 解决的是“schema 和 TypeScript type 重复维护”的问题。你定义一次 schema，然后用 `z.infer` 提取类型。

### 底层机制

`z.object({...})` 创建一个 schema object。调用 `.parse(input)` 时，Zod 运行检查逻辑。成功时返回解析后的深拷贝值；失败时抛出 `ZodError`。

### API / 语法规范

| API | 所属对象 | 签名 | 返回值 | 作用 |
|---|---|---|---|---|
| `z.string()` | Zod | `z.string()` | string schema | 验证字符串。 |
| `z.number()` | Zod | `z.number()` | number schema | 验证有限数值。 |
| `z.int()` | Zod | `z.int()` | integer schema | 验证安全整数。 |
| `z.boolean()` | Zod | `z.boolean()` | boolean schema | 验证布尔值。 |
| `z.literal()` | Zod | `z.literal(value)` | literal schema | 验证固定值。 |
| `z.enum()` | Zod | `z.enum(values)` | enum schema | 验证一组字符串字面量。 |
| `z.array()` | Zod | `z.array(elementSchema)` | array schema | 验证数组。 |
| `z.object()` | Zod | `z.object(shape)` | object schema | 验证对象结构。 |
| `.parse()` | schema | `schema.parse(input)` | parsed output | 失败时 throw。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
z.object(shape)
z.array(elementSchema)
z.enum(values)
schema.parse(input)
z.string().min(value)
z.string().max(value)
z.number().min(value)
z.number().max(value)
z.number().positive()
z.email()
z.url()
z.uuid()
z.iso.datetime()
```

### 文件结构

```txt
02-zod-schema-basics/
  productSchemaBasics.ts
  primitiveSchemaMethods.ts
  invalidProductParseMistake.ts
```

### 示例代码

`productSchemaBasics.ts`

```ts
// Goal:
// Define a Zod object schema and parse valid product data.

// Expected output:
// Keyboard:9900

import * as z from "zod";

const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  priceCents: z.int().nonnegative(),
  status: z.enum(["draft", "published"]),
});

type ProductRecord = z.infer<typeof ProductSchema>;

const inputValue: unknown = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
  status: "published",
};

const product: ProductRecord = ProductSchema.parse(inputValue);

console.log(`${product.title}:${product.priceCents}`);
```

`primitiveSchemaMethods.ts`

```ts
// Goal:
// Practice primitive validation methods.

// Expected output:
// jane@example.com
// https://example.com/

import * as z from "zod";

const EmailSchema = z.email();
const WebUrlSchema = z.url({ protocol: /^https?$/ });

const emailValue = EmailSchema.parse("jane@example.com");
const webUrlValue = WebUrlSchema.parse("https://example.com");

console.log(emailValue);
console.log(webUrlValue);
```

`invalidProductParseMistake.ts`

```ts
// Goal:
// Verify that parse throws when the input is invalid.

// Expected output:
// validation-failed

import * as z from "zod";

const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  priceCents: z.int().nonnegative(),
});

try {
  ProductSchema.parse({ id: "p1", title: "Keyboard", priceCents: -1 });
} catch (errorValue) {
  if (errorValue instanceof z.ZodError) {
    console.log("validation-failed");
  }
}
```

### 运行方式

```bash
npx tsx 02-zod-schema-basics/productSchemaBasics.ts
npx tsx 02-zod-schema-basics/primitiveSchemaMethods.ts
npx tsx 02-zod-schema-basics/invalidProductParseMistake.ts
```

### 预期输出

```txt
Keyboard:9900
jane@example.com
https://example.com/
validation-failed
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `ProductSchema` 在运行时创建一个 object schema。 |
| 2 | `z.infer<typeof ProductSchema>` 在类型层提取输出类型。 |
| 3 | `ProductSchema.parse(inputValue)` 检查真实字段。 |
| 4 | `priceCents` 必须是非负整数。 |
| 5 | 成功后 `product` 是静态类型安全且运行时已验证的值。 |

### 和实际项目的关系

你可以用这种方式定义 API response schema、form schema、env schema、localStorage schema。核心原则是：业务代码不直接消费 `unknown`，只消费 parse 成功后的 output。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| schema 和 type 分开手写 | 优先从 schema 推导 type。 |
| 在组件里到处写 `.parse()` | 把验证集中在边界层。 |
| 用 `parse()` 处理可预期失败的用户输入 | 用户输入通常用 `safeParse()`。 |

### 最终记忆模型

```txt
Schema is runtime.
z.infer is compile time.
parse connects them.
```

---

## 04：`safeParse()`、错误对象和 Result 边界

### 结论

`safeParse()` 更适合用户输入、API response 和业务边界，因为它不抛异常，而是返回一个可以分支处理的结果对象。

### 技术意义

`safeParse()` 的结果是判别联合（discriminated union）。你检查 `result.success` 后，TypeScript 会自动区分成功分支和失败分支。

### 底层机制

Zod 执行与 `parse()` 相同的验证逻辑；区别是失败时不会 throw，而是返回 `{ success: false, error }`。成功时返回 `{ success: true, data }`。

### API / 语法规范

| API | 签名 | 返回值 | 失败方式 |
|---|---|---|---|
| `.parse()` | `schema.parse(input)` | output | throw `ZodError` |
| `.safeParse()` | `schema.safeParse(input)` | `{ success: true; data } | { success: false; error }` | 不 throw |
| `ZodError.issues` | `error.issues` | `ZodIssue[]` | 存储错误列表 |
| `ZodError.flatten()` | `error.flatten()` | flattened object | 适合表单字段错误 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
schema.safeParse(input)
result.success
result.data
result.error
error.issues
issue.path
issue.message
issue.code
error.flatten()
```

### 文件结构

```txt
03-parse-safeparse-errors/
  parseThrowsExample.ts
  safeParseResultExample.ts
  zodErrorIssueFormatter.ts
```

### 示例代码

`safeParseResultExample.ts`

```ts
// Goal:
// Handle validation success and failure without throwing.

// Expected output:
// invalid:priceCents

import * as z from "zod";

const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  priceCents: z.int().positive(),
});

const result = ProductSchema.safeParse({
  id: "p1",
  title: "Keyboard",
  priceCents: 0,
});

if (result.success) {
  console.log(result.data.title);
} else {
  const firstIssue = result.error.issues[0];
  console.log(`invalid:${firstIssue?.path.join(".")}`);
}
```

`zodErrorIssueFormatter.ts`

```ts
// Goal:
// Convert Zod issues into stable field messages.

// Expected output:
// email:Invalid email address

import * as z from "zod";

const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

function formatFirstIssue(errorValue: z.ZodError): string {
  const issue = errorValue.issues[0];

  if (issue === undefined) {
    return "unknown:Invalid input";
  }

  return `${issue.path.join(".")}:${issue.message}`;
}

const result = SignupSchema.safeParse({
  email: "not-an-email",
  password: "123",
});

if (!result.success) {
  console.log(formatFirstIssue(result.error));
}
```

### 运行方式

```bash
npx tsx 03-parse-safeparse-errors/safeParseResultExample.ts
npx tsx 03-parse-safeparse-errors/zodErrorIssueFormatter.ts
```

### 预期输出

```txt
invalid:priceCents
email:Invalid email address
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `safeParse()` 验证输入对象。 |
| 2 | `priceCents` 不满足 `.positive()`。 |
| 3 | 结果对象的 `success` 是 `false`。 |
| 4 | `result.error.issues` 保存错误详情。 |
| 5 | `issue.path` 指向出错字段。 |

### 和实际项目的关系

表单验证、API client、server handler 都适合返回 Result 风格结果。这样可以避免把可预期的验证失败都当作异常处理。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 忘记检查 `result.success` 就读 `result.data` | 先分支。 |
| 在用户输入中大量 try/catch | 用 `safeParse()` 建模预期失败。 |
| 把 `issue.message` 直接作为长期稳定错误码 | message 适合展示，业务判断应使用稳定 code 或自定义映射。 |

### 最终记忆模型

```txt
parse is exception-based.
safeParse is branch-based.
User input usually wants branch-based validation.
```

---

## 05：`z.infer`、`z.input`、`z.output` 和 transform

### 结论

没有 transform 时，schema 的 input type 和 output type 通常一样；使用 transform、default、coerce 等能力后，输入类型和输出类型可能不同。

### 技术意义

真实项目中常见输入都是字符串，但业务逻辑需要 number、Date、boolean 或 normalized object。此时必须明确区分 input 和 output。

### 底层机制

`.transform()` 在验证成功后运行。Zod 的 schema 同时记录输入类型和输出类型，`z.input<typeof Schema>` 提取输入类型，`z.output<typeof Schema>` 提取输出类型，`z.infer<typeof Schema>` 等价于输出类型。

### API / 语法规范

| API | 签名 | 返回值 | 作用 |
|---|---|---|---|
| `z.infer` | `z.infer<typeof Schema>` | output type | 提取 schema 输出类型。 |
| `z.input` | `z.input<typeof Schema>` | input type | 提取 schema 输入类型。 |
| `z.output` | `z.output<typeof Schema>` | output type | 提取 schema 输出类型。 |
| `.transform()` | `schema.transform(callback)` | transformed schema | 验证后转换值。 |
| `z.coerce.number()` | `z.coerce.number()` | number schema | 尝试把输入转成 number。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
z.infer<typeof Schema>
z.input<typeof Schema>
z.output<typeof Schema>
schema.transform(callback)
z.coerce.string()
z.coerce.number()
z.coerce.boolean()
z.coerce.bigint()
```

### 文件结构

```txt
04-input-output-transform/
  inferredTypeExample.ts
  transformInputOutput.ts
  transformTypeMistake.ts
```

### 示例代码

`transformInputOutput.ts`

```ts
// Goal:
// Distinguish schema input type from output type.

// Expected output:
// 9900

import * as z from "zod";

const PriceCentsSchema = z
  .string()
  .regex(/^\d+$/)
  .transform((priceText) => Number.parseInt(priceText, 10));

type PriceCentsInput = z.input<typeof PriceCentsSchema>;
type PriceCentsOutput = z.output<typeof PriceCentsSchema>;

const inputValue: PriceCentsInput = "9900";
const outputValue: PriceCentsOutput = PriceCentsSchema.parse(inputValue);

console.log(outputValue);
```

`transformTypeMistake.ts`

```ts
// Goal:
// Show that transform changes the output type.

// Expected result:
// The compiler rejects assigning output to string.

import * as z from "zod";

const LengthSchema = z.string().transform((textValue) => textValue.length);

const lengthValue = LengthSchema.parse("Keyboard");

// @ts-expect-error: The transformed output is number.
const textValue: string = lengthValue;

console.log(lengthValue);
```

### 运行方式

```bash
npx tsc --noEmit
npx tsx 04-input-output-transform/transformInputOutput.ts
```

### 预期输出

```txt
9900
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 输入必须先是 string。 |
| 2 | `.regex()` 检查字符串只包含数字。 |
| 3 | `.transform()` 把 string 转成 number。 |
| 4 | `z.input` 是 `string`。 |
| 5 | `z.output` 和 `z.infer` 是 `number`。 |

### 和实际项目的关系

表单输入、URLSearchParams、环境变量天然是 string；业务逻辑通常需要 number、boolean、URL、Date 或枚举。用 schema transform 可以把转换集中在边界层。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 只用 `z.infer` 不考虑输入类型 | 有 transform 时同时写 `z.input` 和 `z.output`。 |
| 在业务函数内部到处 `Number(...)` | 在 schema 边界集中转换。 |
| 不处理 `Number("abc")` 得到 `NaN` | 先验证格式或用更严格 schema。 |

### 最终记忆模型

```txt
Input type is what the outside world gives you.
Output type is what your application is allowed to trust.
```

---

## 06：对象 schema、未知字段策略和 schema 组合

### 结论

对象 schema 不只是字段列表。你必须决定未知字段如何处理：剥离、拒绝、保留或按 catchall schema 验证。

### 技术意义

未知字段策略会影响安全、兼容性、日志、API 版本升级和前端状态污染。

### 底层机制

Zod 默认会从 parsed result 中剥离未识别字段。`z.strictObject()` 会遇到未知字段时报错；`z.looseObject()` 会保留未知字段；`.catchall(schema)` 会验证未知字段的值。

### API / 语法规范

| API | 作用 |
|---|---|
| `z.object(shape)` | 定义对象 schema，默认剥离未知字段。 |
| `z.strictObject(shape)` | 拒绝未知字段。 |
| `z.looseObject(shape)` | 允许并保留未知字段。 |
| `.catchall(schema)` | 验证所有未知字段。 |
| `.shape` | 读取 object schema 内部字段 schema。 |
| `.extend(shape)` | 扩展字段，可能覆盖已有字段。 |
| `.safeExtend(shape)` | 更安全地扩展字段。 |
| `.pick(mask)` | 选取字段。 |
| `.omit(mask)` | 排除字段。 |
| `.partial(mask?)` | 字段变可选。 |
| `.required(mask?)` | 字段变必需。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
z.object(shape)
z.strictObject(shape)
z.looseObject(shape)
schema.catchall(valueSchema)
schema.shape
schema.extend(shape)
schema.safeExtend(shape)
schema.pick(mask)
schema.omit(mask)
schema.partial(mask?)
schema.required(mask?)
```

### 文件结构

```txt
05-object-key-policy-composition/
  objectUnknownKeyPolicy.ts
  schemaComposition.ts
  chainedExtendMistake.ts
```

### 示例代码

`objectUnknownKeyPolicy.ts`

```ts
// Goal:
// Compare default, strict, and loose object schemas.

// Expected output:
// default:false
// strict:false
// loose:true

import * as z from "zod";

const DefaultProduct = z.object({
  id: z.string(),
});

const StrictProduct = z.strictObject({
  id: z.string(),
});

const LooseProduct = z.looseObject({
  id: z.string(),
});

const inputValue = {
  id: "p1",
  debug: true,
};

const defaultOutput = DefaultProduct.parse(inputValue);
const strictResult = StrictProduct.safeParse(inputValue);
const looseOutput = LooseProduct.parse(inputValue);

console.log(`default:${"debug" in defaultOutput}`);
console.log(`strict:${strictResult.success}`);
console.log(`loose:${"debug" in looseOutput}`);
```

`schemaComposition.ts`

```ts
// Goal:
// Compose schemas without duplicating field definitions.

// Expected output:
// Keyboard

import * as z from "zod";

const ProductBaseSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  priceCents: z.int().nonnegative(),
});

const ProductListItemSchema = ProductBaseSchema.pick({
  id: true,
  title: true,
});

const CreateProductSchema = ProductBaseSchema.omit({
  id: true,
});

const item = ProductListItemSchema.parse({
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
});

const createInput = CreateProductSchema.parse({
  title: "Mouse",
  priceCents: 2500,
});

void createInput;

console.log(item.title);
```

### 运行方式

```bash
npx tsx 05-object-key-policy-composition/objectUnknownKeyPolicy.ts
npx tsx 05-object-key-policy-composition/schemaComposition.ts
```

### 预期输出

```txt
default:false
strict:false
loose:true
Keyboard
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 默认 object schema parse 后去掉 `debug`。 |
| 2 | strict schema 遇到 `debug` 后 validation failed。 |
| 3 | loose schema 保留 `debug`。 |
| 4 | `pick()` 复用字段定义并派生 list item schema。 |
| 5 | `omit()` 复用字段定义并派生 create request schema。 |

### 和实际项目的关系

后端请求体通常适合 strict；API response 可以默认剥离未知字段；日志和第三方 webhook 可能需要 loose 或 catchall 保留未知字段。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 不知道 unknown keys 默认会被剥离 | 明确选择 object policy。 |
| 链式 `.extend()` 很长 | 大 schema 优先使用 spread 或清晰拆分。 |
| create / update / response schema 全部手写 | 用 `pick()` / `omit()` / `partial()` 派生。 |

### 最终记忆模型

```txt
Object schema means field policy plus unknown-key policy.
```

---

## 07：联合、判别联合和表单状态建模

### 结论

互斥状态和多形态输入要用 union schema；有稳定 discriminator 字段时，优先用 discriminated union。

### 技术意义

判别联合可以让 TypeScript 和 schema validation 使用同一个字段完成缩小和验证。它也比普通 union 更适合大型状态分支。

### 底层机制

普通 union 通常按候选项逐个尝试；判别联合先读取 discriminator key，然后定位对应分支。TypeScript 在 `switch` 或 `if` 中也根据这个字段缩小类型。

### API / 语法规范

| API | 签名 | 作用 |
|---|---|---|
| `z.union()` | `z.union([A, B])` | 任一 schema 通过即可。 |
| `z.discriminatedUnion()` | `z.discriminatedUnion(key, options)` | 基于 discriminator 字段选择分支。 |
| `z.literal()` | `z.literal(value)` | 固定分支标记。 |
| `z.enum()` | `z.enum(values)` | 多个字符串值。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
z.union([schemaA, schemaB])
z.discriminatedUnion(discriminatorKey, schemas)
z.literal(value)
z.enum(values)
```

### 文件结构

```txt
06-unions-discriminated-unions/
  paymentUnionSchema.ts
  checkoutStateSchema.ts
  plainUnionPerformanceNote.ts
```

### 示例代码

`paymentUnionSchema.ts`

```ts
// Goal:
// Validate mutually exclusive payment inputs with a discriminated union.

// Expected output:
// card:4242

import * as z from "zod";

const PaymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardLast4: z.string().regex(/^\d{4}$/),
  }),
  z.object({
    method: z.literal("paypal"),
    email: z.email(),
  }),
]);

type Payment = z.infer<typeof PaymentSchema>;

function renderPayment(payment: Payment): string {
  switch (payment.method) {
    case "card":
      return `card:${payment.cardLast4}`;
    case "paypal":
      return `paypal:${payment.email}`;
  }
}

const payment = PaymentSchema.parse({
  method: "card",
  cardLast4: "4242",
});

console.log(renderPayment(payment));
```

### 运行方式

```bash
npx tsx 06-unions-discriminated-unions/paymentUnionSchema.ts
```

### 预期输出

```txt
card:4242
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | schema 读取 `method` 字段。 |
| 2 | `method` 是 `card`，进入 card schema。 |
| 3 | `cardLast4` 必须匹配四位数字。 |
| 4 | parse 成功后 `payment.method` 缩小 TypeScript 类型。 |
| 5 | `renderPayment()` 中 card 分支可以读取 `cardLast4`。 |

### 和实际项目的关系

支付方式、登录方式、表单步骤、请求状态、通知类型、webhook event 都适合判别联合。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 用多个 optional 字段表达互斥状态 | 用 discriminated union。 |
| discriminator 字段名字不稳定 | 选择固定字段，如 `type`、`kind`、`status`、`method`。 |
| switch 分支漏处理 | 配合 `assertNever()` 做穷尽检查。 |

### 最终记忆模型

```txt
A discriminated union is a runtime parser and a TypeScript narrowing strategy sharing one key.
```

---

## 08：业务规则、`refine()`、`superRefine()` 和错误路径

### 结论

基础字段类型检查只能验证 shape；跨字段业务规则需要 refinement。单字段规则用 `refine()`，需要多个 issue 或精确 path 时用 `superRefine()`。

### 技术意义

业务规则通常不是“字段是什么类型”，而是“字段之间的关系是否成立”：确认密码一致、结束日期晚于开始日期、购物车数量不能超过库存。

### 底层机制

`refine()` 在基础 schema 验证通过后执行 predicate。`superRefine()` 接收 `ctx`，可以调用 `ctx.addIssue()` 添加一个或多个错误，并指定 path。

### API / 语法规范

| API | 签名 | 作用 |
|---|---|---|
| `.refine()` | `schema.refine(predicate, params?)` | 添加自定义规则。 |
| `.superRefine()` | `schema.superRefine((value, ctx) => {})` | 添加复杂规则和多个 issue。 |
| `ctx.addIssue()` | `ctx.addIssue(issue)` | 添加错误。 |
| `path` | `path: PropertyKey[]` | 指定错误字段路径。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
schema.refine(predicate, params?)
schema.superRefine((value, ctx) => void)
ctx.addIssue(issue)
issue.code
issue.message
issue.path
```

### 文件结构

```txt
07-refine-superrefine-business-rules/
  passwordConfirmRefine.ts
  cartItemSuperRefine.ts
  wrongPathMistake.ts
```

### 示例代码

`passwordConfirmRefine.ts`

```ts
// Goal:
// Validate a cross-field password confirmation rule.

// Expected output:
// confirmPassword

import * as z from "zod";

const SignupSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const result = SignupSchema.safeParse({
  email: "jane@example.com",
  password: "correct-password",
  confirmPassword: "wrong-password",
});

if (!result.success) {
  console.log(result.error.issues[0]?.path.join("."));
}
```

`cartItemSuperRefine.ts`

```ts
// Goal:
// Add multiple business validation issues with superRefine.

// Expected output:
// quantity

import * as z from "zod";

const CartItemSchema = z
  .object({
    productId: z.string(),
    quantity: z.int(),
    stockCount: z.int().nonnegative(),
  })
  .superRefine((value, context) => {
    if (value.quantity <= 0) {
      context.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantity must be positive",
      });
    }

    if (value.quantity > value.stockCount) {
      context.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantity exceeds stock",
      });
    }
  });

const result = CartItemSchema.safeParse({
  productId: "p1",
  quantity: 3,
  stockCount: 1,
});

if (!result.success) {
  console.log(result.error.issues[0]?.path.join("."));
}
```

### 运行方式

```bash
npx tsx 07-refine-superrefine-business-rules/passwordConfirmRefine.ts
npx tsx 07-refine-superrefine-business-rules/cartItemSuperRefine.ts
```

### 预期输出

```txt
confirmPassword
quantity
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | object schema 先验证字段基础类型。 |
| 2 | 基础验证通过后执行 refinement。 |
| 3 | predicate 或 custom issue 表示业务规则失败。 |
| 4 | `path` 决定错误归属哪个字段。 |
| 5 | 表单可以根据 path 显示字段错误。 |

### 和实际项目的关系

前端表单错误显示、后端业务校验错误、checkout 库存规则、日期区间规则都需要精确 path。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 把所有业务规则都塞进字段 schema | 跨字段规则放到 object refinement。 |
| 不设置 path | 表单无法把错误定位到具体字段。 |
| 只做前端 refine | 后端仍必须验证同样的业务边界。 |

### 最终记忆模型

```txt
Shape validation checks fields.
Refinement checks meaning.
Path connects validation to UI.
```

---

## 09：异步验证、`parseAsync()` 和外部依赖

### 结论

如果 schema 中包含异步 refinement 或 transform，就必须使用 `parseAsync()` 或 `safeParseAsync()`。

### 技术意义

异步规则通常依赖数据库、API、缓存或服务端检查。例如邮箱是否已存在、优惠券是否有效、用户名是否被占用。

### 底层机制

异步 refinement 返回 Promise。同步 `parse()` 无法等待这个 Promise，因此必须使用 async parse API。

### API / 语法规范

| API | 签名 | 返回值 | 作用 |
|---|---|---|---|
| `.parseAsync()` | `schema.parseAsync(input)` | `Promise<Output>` | 异步验证，失败 throw。 |
| `.safeParseAsync()` | `schema.safeParseAsync(input)` | `Promise<Result>` | 异步验证，不 throw。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
schema.parseAsync(input)
schema.safeParseAsync(input)
async predicate
Promise<boolean>
```

### 文件结构

```txt
08-async-validation/
  asyncEmailCheck.ts
  parseAsyncRequired.ts
  syncParseAsyncMistake.ts
```

### 示例代码

`asyncEmailCheck.ts`

```ts
// Goal:
// Validate an async uniqueness rule with safeParseAsync.

// Expected output:
// email

import * as z from "zod";

async function isEmailAvailable(emailAddress: string): Promise<boolean> {
  await Promise.resolve();
  return emailAddress !== "used@example.com";
}

const EmailSignupSchema = z.object({
  email: z.email().refine(isEmailAvailable, {
    message: "Email is already used",
  }),
});

const result = await EmailSignupSchema.safeParseAsync({
  email: "used@example.com",
});

if (!result.success) {
  console.log(result.error.issues[0]?.path.join("."));
}
```

### 运行方式

```bash
npx tsx 08-async-validation/asyncEmailCheck.ts
```

### 预期输出

```txt
email
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `safeParseAsync()` 启动异步验证。 |
| 2 | `z.email()` 先检查格式。 |
| 3 | async refinement 调用 `isEmailAvailable()`。 |
| 4 | Promise resolve 为 false。 |
| 5 | result 返回失败分支。 |

### 和实际项目的关系

异步验证适合服务端或提交阶段，不适合每个 keypress 都直接打数据库。前端即时校验应优先做同步格式规则，异步唯一性检查要 debounce 或放到 submit 阶段。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| schema 有 async refine 仍用 `parse()` | 改用 `parseAsync()` / `safeParseAsync()`。 |
| 每次输入变化都打 API | debounce 或 submit 时验证。 |
| 异步验证结果不处理 race condition | 记录请求序号或取消旧请求。 |

### 最终记忆模型

```txt
Async rule means async parser.
```

---

## 10：表单验证集成和 React Hook Form resolver

### 结论

表单集成的核心不是“显示错误”，而是让表单输入类型、schema 输入类型、schema 输出类型和 submit handler 类型保持一致。

### 技术意义

浏览器表单输入默认是 string。即使 `<input type="number">`，表单库拿到的值也可能需要显式转换。schema 是表单边界，不是业务组件内部随便调用的工具。

### 底层机制

resolver 接收 schema，表单提交时调用 schema 验证，把 schema 错误映射到表单错误结构。成功时，submit handler 消费 schema output。

### API / 语法规范

| API | 所属对象 | 签名 / 形式 | 作用 |
|---|---|---|---|
| `useForm()` | React Hook Form | `useForm<Input, Context, Output>(options)` | 创建表单状态。 |
| `zodResolver()` | `@hookform/resolvers/zod` | `zodResolver(schema)` | 把 Zod 接入 RHF。 |
| `register()` | RHF | `register(name, options?)` | 注册字段。 |
| `handleSubmit()` | RHF | `handleSubmit(onValid, onInvalid?)` | 提交处理。 |
| `valueAsNumber` | RHF option | `{ valueAsNumber: true }` | 把 input value 转成 number。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
useForm<Input, Context, Output>(options)
zodResolver(schema)
register(name, options?)
handleSubmit(onValid, onInvalid?)
formState.errors
valueAsNumber
```

### 文件结构

```txt
09-form-integration/
  checkoutFormSchema.ts
  checkoutFormComponent.tsx
  formNumberCoercionMistake.tsx
```

### 示例代码

`checkoutFormSchema.ts`

```ts
// Goal:
// Define a form schema with input and output types.

// Expected result:
// The schema output has a numeric quantity.

import * as z from "zod";

export const CheckoutFormSchema = z.object({
  email: z.email(),
  quantity: z.coerce.number().int().positive(),
});

export type CheckoutFormInput = z.input<typeof CheckoutFormSchema>;
export type CheckoutFormOutput = z.output<typeof CheckoutFormSchema>;
```

`checkoutFormComponent.tsx`

```tsx
// Goal:
// Integrate a Zod schema with React Hook Form.

// Expected result:
// The submit handler receives parsed output.

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CheckoutFormSchema,
  type CheckoutFormInput,
  type CheckoutFormOutput,
} from "./checkoutFormSchema.js";

export function CheckoutForm() {
  const form = useForm<CheckoutFormInput, unknown, CheckoutFormOutput>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      email: "",
      quantity: 1,
    },
  });

  function handleValidSubmit(value: CheckoutFormOutput): void {
    console.log(value.quantity.toFixed(0));
  }

  return (
    <form onSubmit={form.handleSubmit(handleValidSubmit)}>
      <input {...form.register("email")} />
      <input type="number" {...form.register("quantity")} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
No type errors.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `CheckoutFormSchema` 定义表单边界。 |
| 2 | `CheckoutFormInput` 表示 resolver 接收的输入。 |
| 3 | `CheckoutFormOutput` 表示验证和转换后的数据。 |
| 4 | `zodResolver()` 把 schema 接入表单。 |
| 5 | `handleValidSubmit()` 消费 parsed output。 |

### 和实际项目的关系

你后面写 React / Next.js 项目时，不要让表单组件直接拼 API body。表单组件应该得到 parsed output，再交给 action 或 API client。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 忘记 number input 实际输入可能是 string | 使用 `z.coerce.number()` 或 RHF `valueAsNumber`。 |
| submit handler 用手写 type | 从 schema output 推导。 |
| form schema 和 API schema 完全混在一起 | 表单 schema 可以 transform 成 API schema 所需结构。 |

### 最终记忆模型

```txt
Form values are input.
Submit handler should receive schema output.
```

---

## 11：API client、typed fetch 和响应验证

### 结论

typed fetch 的安全版本不是 `fetch<T>()`，而是 `fetchUnknown() -> schema.safeParse() -> Result<T, E>`。

### 技术意义

泛型只能改变 TypeScript 对返回值的看法，不能验证服务器实际返回值。schema validation 才能证明 response shape。

### 底层机制

`response.json()` 返回运行时 value。你先把它保存为 `unknown`，再交给 schema。schema 成功后输出可信类型；失败后返回 invalid-response 错误。

### API / 语法规范

| API | 签名 | 返回值 | 作用 |
|---|---|---|---|
| `fetch()` | `fetch(input, init?)` | `Promise<Response>` | 发起 HTTP 请求。 |
| `response.json()` | `response.json()` | `Promise<unknown>` 建议视角 | 解析响应 JSON。 |
| `schema.safeParse()` | `schema.safeParse(value)` | parse result | 验证响应。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
fetch(input, init?)
response.ok
response.status
response.json()
schema.safeParse(value)
result.success
result.data
result.error
```

### 文件结构

```txt
10-api-client-validation/
  typedFetchWithSchema.ts
  productApiClient.ts
  responseAssertionMistake.ts
```

### 示例代码

`typedFetchWithSchema.ts`

```ts
// Goal:
// Validate fetched JSON through a schema before returning it.

// Expected result:
// The function returns a Result instead of asserting response data.

import * as z from "zod";

export type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

export type FetchSchemaError =
  | { kind: "network-error"; message: string }
  | { kind: "http-error"; status: number }
  | { kind: "invalid-response"; message: string };

export async function fetchWithSchema<SchemaType extends z.ZodType>(
  url: string,
  schema: SchemaType,
): Promise<Result<z.output<SchemaType>, FetchSchemaError>> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return { ok: false, error: { kind: "http-error", status: response.status } };
    }

    const value: unknown = await response.json();
    const parsed = schema.safeParse(value);

    if (!parsed.success) {
      return {
        ok: false,
        error: { kind: "invalid-response", message: parsed.error.message },
      };
    }

    return { ok: true, value: parsed.data };
  } catch (errorValue) {
    return {
      ok: false,
      error: {
        kind: "network-error",
        message: errorValue instanceof Error ? errorValue.message : "Unknown error",
      },
    };
  }
}
```

`productApiClient.ts`

```ts
// Goal:
// Define a typed API client method with response validation.

// Expected output:
// function

import * as z from "zod";
import { fetchWithSchema } from "./typedFetchWithSchema.js";

const ProductListResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      priceCents: z.int().nonnegative(),
    }),
  ),
});

export async function loadProducts() {
  return fetchWithSchema("/api/products", ProductListResponseSchema);
}

console.log(typeof loadProducts);
```

### 运行方式

```bash
npx tsc --noEmit
npx tsx 10-api-client-validation/productApiClient.ts
```

### 预期输出

```txt
function
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | API client 发起 fetch。 |
| 2 | HTTP 失败先返回 `http-error`。 |
| 3 | JSON response 被保存为 `unknown`。 |
| 4 | schema 验证 response shape。 |
| 5 | 成功后返回 typed output。 |

### 和实际项目的关系

React Query、SWR、Next.js server components、Node SDK 都可以复用这种 `fetchWithSchema()` 模式。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| `async function get<T>()` 直接返回 `T` | 泛型不能验证 runtime JSON。 |
| 只检查 HTTP status 不检查 body | status 和 body shape 是两个边界。 |
| schema 写在组件内部 | schema 放到 API contract / validation layer。 |

### 最终记忆模型

```txt
Generic fetch is typed hope.
Schema fetch is checked data.
```

---

## 12：后端 route、请求体验证和响应 schema

### 结论

后端 route handler 必须验证 request body、params、query，并且最好也用 response schema 约束返回值。

### 技术意义

后端是安全边界。前端验证只能改善体验，不能替代后端验证。后端验证失败要返回稳定错误 shape。

### 底层机制

HTTP body 是序列化数据。框架帮你 parse JSON 后，得到的仍然是不可信 JS value。route handler 应先 parse request schema，再进入业务逻辑。

### API / 语法规范

| 概念 | 类型 | 说明 |
|---|---|---|
| `params` | unknown / record | URL path 参数。 |
| `query` | unknown / record | 查询字符串参数。 |
| `body` | unknown | 请求体。 |
| request schema | schema object | 验证请求输入。 |
| response schema | schema object | 约束响应输出。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
request.params
request.query
request.body
schema.safeParse(value)
response.status
response.body
```

### 文件结构

```txt
11-backend-route-validation/
  routeRequestSchemas.ts
  createProductHandler.ts
  unsafeBodyHandlerMistake.ts
```

### 示例代码

`createProductHandler.ts`

```ts
// Goal:
// Validate a backend request body before business logic.

// Expected output:
// 201

import * as z from "zod";

const CreateProductBodySchema = z.strictObject({
  title: z.string().min(1),
  priceCents: z.int().nonnegative(),
});

const CreateProductResponseSchema = z.object({
  product: z.object({
    id: z.string(),
    title: z.string(),
    priceCents: z.int().nonnegative(),
  }),
});

type RouteResponse = {
  status: number;
  body: unknown;
};

function createProductHandler(body: unknown): RouteResponse {
  const parsedBody = CreateProductBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return {
      status: 400,
      body: { error: "invalid-request" },
    };
  }

  const responseBody = CreateProductResponseSchema.parse({
    product: {
      id: "p1",
      title: parsedBody.data.title,
      priceCents: parsedBody.data.priceCents,
    },
  });

  return {
    status: 201,
    body: responseBody,
  };
}

const response = createProductHandler({
  title: "Keyboard",
  priceCents: 9900,
});

console.log(response.status);
```

### 运行方式

```bash
npx tsx 11-backend-route-validation/createProductHandler.ts
```

### 预期输出

```txt
201
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | handler 接收 unknown body。 |
| 2 | request schema 验证 title 和 priceCents。 |
| 3 | 失败时返回 400。 |
| 4 | 成功后进入业务逻辑。 |
| 5 | response schema 确认返回 shape。 |

### 和实际项目的关系

Express、Fastify、Hono、Next.js Route Handler、Server Action 都需要这个思路。不同框架只是 request/response 适配层不同。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 前端已经验证，后端就不验证 | 后端必须验证。 |
| body 类型直接写成业务 type | request body 来自外部，是 unknown。 |
| 只验证 request 不约束 response | response schema 能防止后端 contract 漂移。 |

### 最终记忆模型

```txt
Backend route handlers are trust boundaries.
No body enters domain logic before validation.
```

---

## 13：环境变量、URLSearchParams 和 localStorage 验证

### 结论

环境变量、URLSearchParams 和 localStorage 的共同点是：读出来的值不是你想要的业务类型，而是 string、null 或 unknown-like runtime value。

### 技术意义

这些边界经常被忽略，但它们是实际项目 bug 的高发点：端口是 string，布尔开关是 string，query param 可能不存在，localStorage 可能被旧版本污染。

### 底层机制

`process.env` 值通常是 `string | undefined`；`URLSearchParams.get()` 找不到返回 `null`；`localStorage.getItem()` 找不到返回 `null`，找到返回 string。进入业务逻辑前必须转换和验证。

### API / 语法规范

| API | 所属对象 | 签名 | 返回值 |
|---|---|---|---|
| `process.env.NAME` | Node | property access | `string | undefined` |
| `URLSearchParams.get()` | URLSearchParams | `get(name)` | `string | null` |
| `localStorage.getItem()` | Storage | `getItem(key)` | `string | null` |
| `JSON.parse()` | JSON | `parse(text)` | `any` |

### 固定属性名 / 固定方法名 / 参数签名

```txt
process.env
url.searchParams.get(name)
localStorage.getItem(key)
JSON.parse(text)
z.coerce.number()
z.enum(values)
z.string().default(value)
```

### 文件结构

```txt
12-env-url-storage-validation/
  envSchema.ts
  urlSearchParamsSchema.ts
  localStorageSchema.ts
```

### 示例代码

`urlSearchParamsSchema.ts`

```ts
// Goal:
// Parse URLSearchParams into typed query state.

// Expected output:
// search:keyboard page:2

import * as z from "zod";

const ProductQuerySchema = z.object({
  search: z.string().default(""),
  page: z.coerce.number().int().positive().default(1),
});

const url = new URL("https://example.com/products?search=keyboard&page=2");

const queryValue = ProductQuerySchema.parse({
  search: url.searchParams.get("search") ?? undefined,
  page: url.searchParams.get("page") ?? undefined,
});

console.log(`search:${queryValue.search} page:${queryValue.page}`);
```

`localStorageSchema.ts`

```ts
// Goal:
// Parse stored JSON before using restored state.

// Expected output:
// cart-items:1

import * as z from "zod";

const CartStateSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.int().positive(),
    }),
  ),
});

const storedText = '{"items":[{"productId":"p1","quantity":2}]}';
const storedValue: unknown = JSON.parse(storedText);
const cartState = CartStateSchema.parse(storedValue);

console.log(`cart-items:${cartState.items.length}`);
```

### 运行方式

```bash
npx tsx 12-env-url-storage-validation/urlSearchParamsSchema.ts
npx tsx 12-env-url-storage-validation/localStorageSchema.ts
```

### 预期输出

```txt
search:keyboard page:2
cart-items:1
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `URLSearchParams.get()` 返回 `string | null`。 |
| 2 | `?? undefined` 把缺失参数交给 schema default。 |
| 3 | `z.coerce.number()` 把 page string 转成 number。 |
| 4 | localStorage 文本先 JSON parse 成 unknown。 |
| 5 | schema 验证旧状态 shape。 |

### 和实际项目的关系

Next.js search params、React Router query、feature flags、用户偏好、购物车缓存、env config 都要做边界验证。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| `Boolean(process.env.FLAG)` | 字符串 `"false"` 也是 true。 |
| `Number(url.searchParams.get("page"))` 不检查 NaN | 用 schema 约束 positive int。 |
| localStorage 旧数据直接恢复 | 先 parse，再迁移或丢弃。 |

### 最终记忆模型

```txt
Storage and URL values are strings first.
Your app types come after parsing.
```

---

## 14：JSON Schema、Ajv 和跨语言 contract

### 结论

JSON Schema 适合跨语言、跨服务、文档化和标准化 contract；Zod 更适合 TypeScript-first 应用内部建模。Ajv 适合高性能 JSON Schema 验证。

### 技术意义

如果你的 schema 要被后端、前端、API 网关、文档生成器、其他语言服务共同使用，JSON Schema 的标准化价值更高。

### 底层机制

JSON Schema 本身是 JSON 文档。validator 读取 schema 和 instance，返回验证结果。Ajv 会把 schema 编译成验证函数并缓存，复用 compiled validator 可以获得更好性能。

### API / 语法规范

| API / 字段 | 所属对象 | 作用 |
|---|---|---|
| `$schema` | JSON Schema | 指定 draft。 |
| `$id` | JSON Schema | schema 标识 URI。 |
| `type` | JSON Schema | 限制 JSON 类型。 |
| `properties` | JSON Schema | 定义对象字段。 |
| `required` | JSON Schema | 指定必需字段。 |
| `items` | JSON Schema | 定义数组元素 schema。 |
| `additionalProperties` | JSON Schema | 控制未知字段。 |
| `new Ajv()` | Ajv | 创建 validator instance。 |
| `ajv.compile()` | Ajv | 编译 schema。 |
| `validate(data)` | compiled validator | 返回 boolean。 |
| `validate.errors` | compiled validator | 最近一次错误列表。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
$schema
$id
type
properties
required
items
additionalProperties
minimum
exclusiveMinimum
minItems
uniqueItems
new Ajv(options?)
ajv.compile(schema)
validate(data)
validate.errors
```

### 文件结构

```txt
13-json-schema-ajv/
  productJsonSchema.json
  ajvValidationExample.ts
  jsonSchemaTypeGap.md
```

### 示例代码

`productJsonSchema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/product.schema.json",
  "title": "Product",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "title", "priceCents"],
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string", "minLength": 1 },
    "priceCents": { "type": "integer", "minimum": 0 }
  }
}
```

`ajvValidationExample.ts`

```ts
// Goal:
// Validate a value with Ajv and a JSON Schema object.

// Expected output:
// false

import Ajv from "ajv";

const productJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "priceCents"],
  properties: {
    id: { type: "string" },
    title: { type: "string", minLength: 1 },
    priceCents: { type: "integer", minimum: 0 },
  },
};

const ajv = new Ajv();
const validateProduct = ajv.compile(productJsonSchema);

const isValid = validateProduct({
  id: "p1",
  title: "Keyboard",
  priceCents: -1,
});

console.log(isValid);
```

### 运行方式

```bash
npx tsx 13-json-schema-ajv/ajvValidationExample.ts
```

### 预期输出

```txt
false
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | JSON Schema 描述 product shape。 |
| 2 | `new Ajv()` 创建 validator。 |
| 3 | `ajv.compile()` 把 schema 编译成函数。 |
| 4 | `validateProduct(data)` 运行验证。 |
| 5 | `priceCents` 小于 0，返回 false。 |

### 和实际项目的关系

OpenAPI、API gateway、跨语言微服务、SDK 生成、文档生成和高性能服务端验证常常更适合 JSON Schema / Ajv 路线。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 每次请求都重新 compile schema | 启动时 compile，一直复用 validator。 |
| 以为 JSON Schema 自动生成 TS type | 需要额外工具或手写映射。 |
| 忽略 `additionalProperties` | 明确未知字段策略。 |

### 最终记忆模型

```txt
Zod is TypeScript-first.
JSON Schema is ecosystem-first.
Ajv is compiled validation.
```

---

## 15：Valibot 对照和 schema 库选择

### 结论

Valibot 也是 TypeScript schema validation library。它的常见风格是通过函数组合和 `pipe()` 建立 schema，通过 `parse()`、`safeParse()`、`InferInput`、`InferOutput` 接入类型系统。

### 技术意义

学习 Zod 后再看 Valibot，可以帮助你抽象出“schema validation 的共同模型”，避免被某一个库的 API 绑定死。

### 底层机制

Valibot 的 `parse(schema, input)` 验证失败会抛 `ValiError`；`safeParse(schema, input)` 返回带 `success` 的结果对象；`InferOutput` 提取 parse 成功后的输出类型。

### API / 语法规范

| API | 所属库 | 签名 | 作用 |
|---|---|---|---|
| `v.object()` | Valibot | `v.object(entries)` | 定义对象。 |
| `v.string()` | Valibot | `v.string()` | 定义字符串。 |
| `v.number()` | Valibot | `v.number()` | 定义数值。 |
| `v.pipe()` | Valibot | `v.pipe(schema, ...actions)` | 组合验证和转换管线。 |
| `v.parse()` | Valibot | `v.parse(schema, input, config?)` | 验证失败 throw。 |
| `v.safeParse()` | Valibot | `v.safeParse(schema, input, config?)` | 返回结果对象。 |
| `v.InferInput` | Valibot | `v.InferInput<typeof Schema>` | 提取输入类型。 |
| `v.InferOutput` | Valibot | `v.InferOutput<typeof Schema>` | 提取输出类型。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
v.object(entries)
v.string()
v.number()
v.pipe(schema, ...actions)
v.parse(schema, input, config?)
v.safeParse(schema, input, config?)
v.is(schema, input)
v.assert(schema, input)
v.InferInput<typeof Schema>
v.InferOutput<typeof Schema>
result.success
result.output
result.issues
abortEarly
abortPipeEarly
```

### 文件结构

```txt
14-valibot-comparison/
  valibotProductSchema.ts
  valibotSafeParseExample.ts
  libraryChoiceNotes.md
```

### 示例代码

`valibotSafeParseExample.ts`

```ts
// Goal:
// Validate a product with Valibot safeParse.

// Expected output:
// Keyboard

import * as v from "valibot";

const ProductSchema = v.object({
  id: v.string(),
  title: v.pipe(v.string(), v.minLength(1)),
  priceCents: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

type ProductOutput = v.InferOutput<typeof ProductSchema>;

const result = v.safeParse(ProductSchema, {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
});

if (result.success) {
  const product: ProductOutput = result.output;
  console.log(product.title);
} else {
  console.log(result.issues.length);
}
```

### 运行方式

```bash
npx tsx 14-valibot-comparison/valibotSafeParseExample.ts
```

### 预期输出

```txt
Keyboard
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `v.object()` 创建对象 schema。 |
| 2 | `v.pipe()` 组合字符串和数值约束。 |
| 3 | `v.safeParse()` 验证输入。 |
| 4 | 成功时读取 `result.output`。 |
| 5 | `InferOutput` 提取输出类型。 |

### 和实际项目的关系

如果项目关注 bundle、tree-shaking、函数组合风格，可以评估 Valibot。团队项目中更重要的是统一一种 validation strategy，而不是每个模块随便选库。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 同一个项目混用多个 schema 库 | 除非有明确边界，否则统一。 |
| 只比较语法喜好 | 同时比较生态、resolver、JSON Schema、bundle、性能、团队熟悉度。 |
| 忽略 input/output 差异 | Valibot 也要区分 `InferInput` 和 `InferOutput`。 |

### 最终记忆模型

```txt
Different libraries, same boundary model:
unknown -> schema -> output.
```

---

## 16：性能、bundle、错误信息和边界设计

### 结论

schema validation 要放在边界，而不是每一层都重复 parse。性能优化的第一原则是复用 schema 和 compiled validator，第二原则是只验证跨信任边界的数据。

### 技术意义

过度验证会增加 runtime cost；验证不足会让不可信数据进入业务逻辑。工程上要设计 validation boundary map。

### 底层机制

schema 是运行时对象。Zod schema 每次 parse 都要遍历输入；Ajv compiled function 编译成本高但执行快；Valibot 支持 `abortEarly`、`abortPipeEarly` 配置以减少 issue 收集成本。

### API / 语法规范

| API / 选项 | 所属库 | 作用 |
|---|---|---|
| schema reuse | 通用策略 | 在模块顶层定义 schema，避免重复创建。 |
| `abortEarly` | Valibot config | 第一个 issue 后停止验证。 |
| `abortPipeEarly` | Valibot config | pipeline 中第一个 issue 后停止。 |
| `ajv.compile()` | Ajv | 编译并复用 validator。 |
| `z.discriminatedUnion()` | Zod | 大 union 更适合通过 discriminator 定位。 |

### 固定属性名 / 固定方法名 / 参数签名

```txt
schema.parse(input)
schema.safeParse(input)
z.discriminatedUnion(key, schemas)
ajv.compile(schema)
v.parse(schema, input, { abortEarly: true })
v.parse(schema, input, { abortPipeEarly: true })
```

### 文件结构

```txt
15-performance-boundary-design/
  schemaReuseExample.ts
  validationBoundaryMap.ts
  overValidationMistake.ts
```

### 示例代码

`validationBoundaryMap.ts`

```ts
// Goal:
// Document where validation should happen in an application.

// Expected output:
// api-response:validate
// domain-service:trust

export {};

type BoundaryDecision = {
  locationName: string;
  action: "validate" | "trust";
};

const boundaryMap: BoundaryDecision[] = [
  { locationName: "api-response", action: "validate" },
  { locationName: "form-submit", action: "validate" },
  { locationName: "domain-service", action: "trust" },
];

for (const decision of boundaryMap) {
  console.log(`${decision.locationName}:${decision.action}`);
}
```

### 运行方式

```bash
npx tsx 15-performance-boundary-design/validationBoundaryMap.ts
```

### 预期输出

```txt
api-response:validate
form-submit:validate
domain-service:trust
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 外部边界标记为 validate。 |
| 2 | 内部 domain-service 标记为 trust。 |
| 3 | 业务代码只接收 parsed output。 |
| 4 | 重复 parse 被边界设计避免。 |

### 和实际项目的关系

大型前端项目和全栈项目要有统一边界图：form submit、API response、route request、env load、storage restore、webhook input 都是 validate；domain service、UI component props、repository internal return 通常应消费 trusted type。

### 常见错误

| 错误 | 正确做法 |
|---|---|
| 每个函数入口都 parse | 只在 trust boundary parse。 |
| 每次调用都重新创建 schema | schema 放模块顶层复用。 |
| 只追求完整错误列表 | 高频路径可选择早停策略。 |

### 最终记忆模型

```txt
Validate at boundaries.
Trust inside the boundary.
Do not validate the same value repeatedly.
```

---

## 8. 本章 API / 语法完整索引

### Zod 核心 API

| API | 所属对象 | 参数 | 返回值 | 备注 |
|---|---|---|---|---|
| `z.object(shape)` | Zod | `shape` | object schema | 默认剥离未知字段。 |
| `z.strictObject(shape)` | Zod | `shape` | object schema | 拒绝未知字段。 |
| `z.looseObject(shape)` | Zod | `shape` | object schema | 保留未知字段。 |
| `z.string()` | Zod | 无 | string schema | 字符串。 |
| `z.number()` | Zod | 无 | number schema | 有限数值。 |
| `z.int()` | Zod | 无 | integer schema | 安全整数。 |
| `z.boolean()` | Zod | 无 | boolean schema | 布尔值。 |
| `z.literal(value)` | Zod | literal value | literal schema | 固定值。 |
| `z.enum(values)` | Zod | readonly string array | enum schema | 字符串枚举。 |
| `z.array(schema)` | Zod | element schema | array schema | 数组。 |
| `z.union(schemas)` | Zod | schema array | union schema | 逐项匹配。 |
| `z.discriminatedUnion(key, schemas)` | Zod | key + object schemas | union schema | 基于 discriminator。 |
| `z.coerce.number()` | Zod | optional generic | number schema | 转换后验证。 |
| `schema.parse(input)` | schema | input | output | 失败 throw。 |
| `schema.safeParse(input)` | schema | input | result object | 失败不 throw。 |
| `schema.parseAsync(input)` | schema | input | Promise output | 异步验证。 |
| `schema.safeParseAsync(input)` | schema | input | Promise result | 异步验证不 throw。 |
| `schema.transform(callback)` | schema | callback | schema | 改变输出类型。 |
| `schema.refine(predicate, params?)` | schema | predicate + params | schema | 自定义规则。 |
| `schema.superRefine(callback)` | schema | `(value, ctx)` | schema | 多 issue 复杂规则。 |
| `z.infer<typeof Schema>` | type utility | schema type | output type | 等价 output。 |
| `z.input<typeof Schema>` | type utility | schema type | input type | 转换前类型。 |
| `z.output<typeof Schema>` | type utility | schema type | output type | 转换后类型。 |

### Valibot 核心 API

| API | 参数 | 返回值 | 备注 |
|---|---|---|---|
| `v.object(entries)` | entries | object schema | 定义对象。 |
| `v.string()` | 无 | string schema | 字符串。 |
| `v.number()` | 无 | number schema | 数值。 |
| `v.pipe(schema, ...actions)` | schema + actions | schema | 管线组合。 |
| `v.parse(schema, input, config?)` | schema + input | output | 失败 throw。 |
| `v.safeParse(schema, input, config?)` | schema + input | result | 失败不 throw。 |
| `v.is(schema, input)` | schema + input | boolean | type guard，无 issue 详情。 |
| `v.assert(schema, input)` | schema + input | asserts | assertion function。 |
| `v.InferInput<typeof Schema>` | schema type | input type | 输入类型。 |
| `v.InferOutput<typeof Schema>` | schema type | output type | 输出类型。 |
| `v.InferIssue<typeof Schema>` | schema type | issue type | 错误类型。 |

### JSON Schema / Ajv 核心字段

| API / 字段 | 所属对象 | 作用 |
|---|---|---|
| `$schema` | JSON Schema | 指定 draft。 |
| `$id` | JSON Schema | schema URI。 |
| `type` | JSON Schema | JSON 类型。 |
| `properties` | JSON Schema | 字段 schema。 |
| `required` | JSON Schema | 必填字段数组。 |
| `items` | JSON Schema | 数组元素。 |
| `additionalProperties` | JSON Schema | 未知字段策略。 |
| `new Ajv(options?)` | Ajv | 创建 validator。 |
| `ajv.compile(schema)` | Ajv | 编译 validator。 |
| `validate(data)` | Ajv compiled validator | boolean。 |
| `validate.errors` | Ajv compiled validator | error array。 |

---

## 9. 本章常见错误总表

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| `as Product` 验证 API response | assertion 不执行运行时检查 | response 先是 `unknown`，schema parse 后再用。 |
| `fetch<T>()` 直接返回 `T` | 泛型不会验证 JSON | `fetch -> unknown -> schema -> Result`。 |
| 不区分 input/output | transform 后两者不同 | 用 `z.input` 和 `z.output`。 |
| 表单 number 字段直接当 number | 浏览器输入可能是 string | 用 `z.coerce.number()` 或表单库转换。 |
| 后端相信前端验证 | 用户可以绕过前端 | 后端必须验证 request。 |
| schema 放在函数内重复创建 | 增加运行时成本 | schema 放模块顶层复用。 |
| 每层函数都 parse | 重复验证 | 只在 trust boundary 验证。 |
| 错误 message 当业务 code | message 不稳定 | 使用稳定 error kind 或映射层。 |
| 忽略 unknown keys 策略 | 安全和兼容行为不清晰 | 明确 strict / default / loose / catchall。 |
| localStorage 直接 JSON.parse 后使用 | 旧数据或用户修改会污染状态 | parse JSON 后 schema 验证。 |
| env 布尔值用 `Boolean()` | `"false"` 是 truthy | 用 enum 或自定义 transform。 |

---

## 10. 最终小项目：Checkout Validation Boundary

### 项目目标

构建一个 checkout 输入验证边界，把表单输入、API 响应、后端请求体和本地缓存统一接入 schema validation。

### 使用到的本章知识点

```txt
unknown boundary
Zod object schema
safeParse Result
input/output types
coerce number
strict request body
API response validation
discriminated union
form resolver boundary
localStorage validation
error issue formatting
```

### 推荐文件结构

```txt
16-mini-project/
  schemas.ts
  validationResult.ts
  typedClient.ts
  routeHandler.ts
  formBoundary.tsx
  app.ts
  mistakes.ts
  miniProjectChecklist.md
```

### 主文件代码

`schemas.ts`

```ts
// Goal:
// Define shared checkout validation schemas.

// Expected result:
// These schemas are used by client, server, and form boundaries.

import * as z from "zod";

export const CartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const CheckoutFormSchema = z.object({
  email: z.email(),
  items: z.array(CartItemSchema).min(1),
});

export const CheckoutRequestSchema = z.strictObject({
  email: z.email(),
  items: z.array(
    z.strictObject({
      productId: z.string().min(1),
      quantity: z.int().positive(),
    }),
  ).min(1),
});

export const CheckoutResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("accepted"),
    orderId: z.string(),
  }),
  z.object({
    status: z.literal("rejected"),
    reason: z.enum(["out-of-stock", "invalid-payment"]),
  }),
]);

export type CheckoutFormInput = z.input<typeof CheckoutFormSchema>;
export type CheckoutFormOutput = z.output<typeof CheckoutFormSchema>;
export type CheckoutRequest = z.output<typeof CheckoutRequestSchema>;
export type CheckoutResponse = z.output<typeof CheckoutResponseSchema>;
```

`validationResult.ts`

```ts
// Goal:
// Define a reusable validation Result type.

// Expected result:
// Callers handle validation success and failure explicitly.

export type ValidationResult<ValueType> =
  | { ok: true; value: ValueType }
  | { ok: false; issues: { path: string; message: string }[] };

export function formatIssues(issues: readonly { path: PropertyKey[]; message: string }[]) {
  return issues.map((issue) => {
    return {
      path: issue.path.join("."),
      message: issue.message,
    };
  });
}
```

`routeHandler.ts`

```ts
// Goal:
// Validate a checkout request body at the backend boundary.

// Expected result:
// Invalid request bodies return status 400.

import { CheckoutRequestSchema, CheckoutResponseSchema } from "./schemas.js";
import { formatIssues } from "./validationResult.js";

export function checkoutRouteHandler(body: unknown) {
  const parsedRequest = CheckoutRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return {
      status: 400,
      body: {
        error: "invalid-request",
        issues: formatIssues(parsedRequest.error.issues),
      },
    };
  }

  const responseBody = CheckoutResponseSchema.parse({
    status: "accepted",
    orderId: "order_123",
  });

  return {
    status: 201,
    body: responseBody,
  };
}
```

`app.ts`

```ts
// Goal:
// Run the checkout validation pipeline.

// Expected output:
// 201
// accepted

import { checkoutRouteHandler } from "./routeHandler.js";

const response = checkoutRouteHandler({
  email: "jane@example.com",
  items: [
    {
      productId: "p1",
      quantity: 2,
    },
  ],
});

console.log(response.status);

if ("status" in response.body) {
  console.log(response.body.status);
}
```

### 对比 / 错误文件代码

`mistakes.ts`

```ts
// Goal:
// Show unsafe validation shortcuts.

// Expected output:
// undefined

import type { CheckoutRequest } from "./schemas.js";

const body: unknown = {
  email: "jane@example.com",
  items: [{ productId: "p1", amount: 2 }],
};

const request = body as CheckoutRequest;

console.log(request.items[0]?.quantity);
```

`miniProjectChecklist.md`

```md
# Mini Project Checklist

## Boundary checklist

- [ ] Form input is parsed by `CheckoutFormSchema`.
- [ ] Request body is parsed by `CheckoutRequestSchema`.
- [ ] API response is parsed by `CheckoutResponseSchema`.
- [ ] No external value is asserted directly with `as CheckoutRequest`.
- [ ] Validation errors include stable paths.
- [ ] Domain logic receives only parsed output.
```

### 运行方式

```bash
npx tsx 16-mini-project/app.ts
npx tsx 16-mini-project/mistakes.ts
```

### 预期输出

```txt
201
accepted
undefined
```

### 完整执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `app.ts` 构造一个模拟 checkout request body。 |
| 2 | `checkoutRouteHandler()` 接收 body，静态类型是 `unknown`。 |
| 3 | `CheckoutRequestSchema.safeParse()` 验证 email 和 items。 |
| 4 | 成功后业务逻辑构造 response。 |
| 5 | `CheckoutResponseSchema.parse()` 约束 response shape。 |
| 6 | handler 返回 `{ status, body }`。 |
| 7 | `mistakes.ts` 用 assertion 绕过验证，读取不存在字段得到 `undefined`。 |

### API 角色表

| API | 在小项目中的角色 |
|---|---|
| `z.object()` | 定义表单、请求、响应对象结构。 |
| `z.strictObject()` | 后端 request body 拒绝未知字段。 |
| `z.coerce.number()` | 把表单数量输入转换成 number。 |
| `z.discriminatedUnion()` | 建模 accepted / rejected response。 |
| `safeParse()` | request validation 返回显式失败分支。 |
| `parse()` | response validation 失败时暴露开发错误。 |
| `z.input` | 表示表单原始输入。 |
| `z.output` | 表示验证后的可信输出。 |

### 常见错误

| 错误 | 正确做法 |
|---|---|
| form schema 直接复用 request schema | 表单 input 可能需要 coercion。 |
| response 不验证 | 用 response schema 防止 contract 漂移。 |
| 错误文件也能编译就以为安全 | 编译通过不等于 runtime 数据正确。 |

### 可扩展任务

1. 增加 coupon schema 和异步 coupon validation。
2. 增加 localStorage cart restore schema。
3. 增加 React form component，用 resolver 接入 `CheckoutFormSchema`。
4. 增加 API client，用 `CheckoutResponseSchema` 验证 response。
5. 增加 JSON Schema 输出，用于后端 API 文档。

### 和真实项目 / 简历项目的关系

这个小项目可以升级成完整的 checkout validation layer：表单、server action、route handler、API client、缓存恢复全部通过 schema 统一边界。简历项目里，这能体现你不是只会写 UI，而是能设计可靠的数据入口。

### 最终记忆模型

```txt
The checkout app has multiple boundaries.
Each boundary starts with unknown input.
Each schema produces trusted output.
Domain logic never consumes unparsed external values.
```

---

## 11. 额外 cheatsheet

本章额外生成独立速查表：

```txt
typescript/schema-validation-integration/typescript-schema-validation-integration-cheatsheet-zh-v1.md
```

速查表负责快速复习，不替代本指导文件。它包含：

1. Zod 核心 API 速查。
2. Valibot 核心 API 速查。
3. JSON Schema / Ajv 核心字段速查。
4. `parse()` / `safeParse()` / `parseAsync()` 对比。
5. `z.infer` / `z.input` / `z.output` 对比。
6. validation boundary 决策表。
7. 常见 IDE 和 TypeScript 警告。
8. 官方文档链接。

---

## 12. 最终文件清单

```txt
typescript/schema-validation-integration/
  typescript-schema-validation-integration-learning-guide-zh-v1.md
  typescript-schema-validation-integration-cheatsheet-zh-v1.md
  README.md
  package.json
  tsconfig.json

  00-runtime-validation-problem/
    staticTypeDoesNotValidateJson.ts
    trustedBoundaryMistake.ts
    boundaryDecisionTable.ts

  01-unknown-type-guard/
    unknownBoundary.ts
    manualProductGuard.ts
    unsafeAssertionMistake.ts

  02-zod-schema-basics/
    productSchemaBasics.ts
    primitiveSchemaMethods.ts
    invalidProductParseMistake.ts

  03-parse-safeparse-errors/
    parseThrowsExample.ts
    safeParseResultExample.ts
    zodErrorIssueFormatter.ts

  04-input-output-transform/
    inferredTypeExample.ts
    transformInputOutput.ts
    transformTypeMistake.ts

  05-object-key-policy-composition/
    objectUnknownKeyPolicy.ts
    schemaComposition.ts
    chainedExtendMistake.ts

  06-unions-discriminated-unions/
    paymentUnionSchema.ts
    checkoutStateSchema.ts
    plainUnionPerformanceNote.ts

  07-refine-superrefine-business-rules/
    passwordConfirmRefine.ts
    cartItemSuperRefine.ts
    wrongPathMistake.ts

  08-async-validation/
    asyncEmailCheck.ts
    parseAsyncRequired.ts
    syncParseAsyncMistake.ts

  09-form-integration/
    checkoutFormSchema.ts
    checkoutFormComponent.tsx
    formNumberCoercionMistake.tsx

  10-api-client-validation/
    typedFetchWithSchema.ts
    productApiClient.ts
    responseAssertionMistake.ts

  11-backend-route-validation/
    routeRequestSchemas.ts
    createProductHandler.ts
    unsafeBodyHandlerMistake.ts

  12-env-url-storage-validation/
    envSchema.ts
    urlSearchParamsSchema.ts
    localStorageSchema.ts

  13-json-schema-ajv/
    productJsonSchema.json
    ajvValidationExample.ts
    jsonSchemaTypeGap.md

  14-valibot-comparison/
    valibotProductSchema.ts
    valibotSafeParseExample.ts
    libraryChoiceNotes.md

  15-performance-boundary-design/
    schemaReuseExample.ts
    validationBoundaryMap.ts
    overValidationMistake.ts

  16-mini-project/
    schemas.ts
    validationResult.ts
    typedClient.ts
    routeHandler.ts
    formBoundary.tsx
    app.ts
    mistakes.ts
    miniProjectChecklist.md
```

---

## 13. 最终学习笔记转换要求

练习做完后，把本章整理成正式学习笔记。不要直接复制本指导文件。最终笔记按每个知识点写：

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
TypeScript type vs runtime schema
unknown vs any
as assertion vs parse validation
type guard vs schema parser
parse vs safeParse
parseAsync vs parse
z.infer vs z.input vs z.output
refine vs superRefine
optional vs nullable vs nullish
strict object vs default object vs loose object
form schema vs API request schema
frontend validation vs backend validation
fetch generic vs response schema validation
Zod vs JSON Schema
Zod vs Valibot
schema validation vs business authorization
```

---

## 14. 本章最终记忆模型

```txt
Schema validation integration is boundary design.

External sources:
  API response
  request body
  form input
  URL query
  environment variables
  localStorage
  third-party SDK output

Safe pipeline:
  unknown
  schema parse
  typed output
  domain logic

API choice:
  parse for exceptional invalid data
  safeParse for expected invalid data
  parseAsync for async rules
  safeParseAsync for async expected invalid data

Type choice:
  z.input for incoming data
  z.output for parsed data
  z.infer for parsed output

Architecture rule:
  validate at boundary
  trust inside boundary
  never replace validation with assertion
```

---

## 15. 官方文档阅读清单

1. [Zod Intro](https://zod.dev/)  
   重点读 Zod 的 TypeScript-first validation 定位、strict requirement 和 features。

2. [Zod Basic usage](https://zod.dev/basics)  
   重点读 defining schema、parse、safeParse、ZodError、z.infer、z.input、z.output。

3. [Zod Defining schemas](https://zod.dev/api)  
   重点读 primitives、coerce、string formats、objects、strictObject、looseObject、catchall、pick、omit、partial、discriminatedUnion。

4. [Valibot Parse data](https://valibot.dev/guides/parse-data/)  
   重点读 parse、safeParse、is、assert、abortEarly、abortPipeEarly。

5. [Valibot Infer types](https://valibot.dev/guides/infer-types/)  
   重点读 InferInput、InferOutput、InferIssue。

6. [JSON Schema Getting Started](https://json-schema.org/learn/getting-started-step-by-step)  
   重点读 `$schema`、`$id`、`type`、`properties`、`required`、`items`、`$ref`。

7. [Ajv Getting Started](https://ajv.js.org/guide/getting-started.html)  
   重点读 compile、compiled validation function、errors、performance notes。

8. [React Hook Form Resolvers](https://github.com/react-hook-form/resolvers)  
   重点读 `useForm<Input, Context, Output>()`、`zodResolver(schema)`、resolver options。

9. [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)  
   复习 type guard、type predicate、control-flow narrowing。

10. [TypeScript strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html)  
    复习为什么 `null` / `undefined` 必须显式处理。

---

## 16. 生成前自检清单

```txt
[x] 文件放在用户指定章节目录下。
[x] 没有新建 notes/。
[x] 正文是中文。
[x] 重要术语有 English term。
[x] 代码变量名、函数名、类名没有中文。
[x] 代码注释没有中文。
[x] 每节有结论、技术意义、底层机制、API 规范、代码、执行过程、常见错误、记忆模型。
[x] API 的固定属性名和方法名没有漏。
[x] options object 的合法属性名写清楚。
[x] 方法签名和返回值写清楚。
[x] 常见 IDE 警告写清楚。
[x] 官方文档链接是正常 Markdown 链接。
[x] 示例代码可运行或明确标注故意报错。
[x] 推荐目录结构完整。
[x] 最终小项目完整。
[x] 额外 cheatsheet 已生成。
[x] 最终文件清单完整。
[x] 运行清单完整。
[x] 没有把指导文件写成最终笔记。
```

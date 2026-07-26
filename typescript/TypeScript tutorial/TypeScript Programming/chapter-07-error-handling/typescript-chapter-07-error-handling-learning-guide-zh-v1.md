# TypeScript 第 7 章“处理错误”学习指导文件 v1

> 定位：这是 TypeScript 第 7 章“处理错误”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察编译错误或运行输出，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 7 章“处理错误”，TypeScript 官方 Handbook 的 Narrowing、Everyday Types、More on Functions、Utility Types，以及 TSConfig 官方文档中的 `useUnknownInCatchVariables`、`noImplicitReturns`、`strictNullChecks`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解 JavaScript 错误处理的运行时机制，再理解 TypeScript 如何把失败路径建模成类型。不要把错误处理学成“到处 try/catch”。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| `null`、`undefined`、联合类型、字面量联合、类型别名 | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 控制流分析、`typeof` 收窄、判等收窄、判别联合、`never` 穷尽检查、类型谓词、断言函数 | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| 函数返回类型、`void`、`never`、函数边界 | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| `NonNullable`、`Extract`、`Exclude`、`ReturnType` 等错误建模常用工具类型 | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| `catch` 变量默认为 `unknown` 的严格模式 | [TSConfig useUnknownInCatchVariables](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html) |
| 检查函数所有路径是否都有返回值 | [TSConfig noImplicitReturns](https://www.typescriptlang.org/tsconfig/noImplicitReturns.html) |
| 严格区分 `null` 和 `undefined` | [TSConfig strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 7 章完整学习顺序](#3-第-7-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：错误处理到底在建模什么](#5-00错误处理到底在建模什么)
6. [01：返回 null](#6-01返回-null)
7. [02：返回 undefined 和可选结果](#7-02返回-undefined-和可选结果)
8. [03：抛出异常](#8-03抛出异常)
9. [04：catch 变量与 unknown](#9-04catch-变量与-unknown)
10. [05：自定义 Error 类](#10-05自定义-error-类)
11. [06：返回异常对象](#11-06返回异常对象)
12. [07：Result 判别联合](#12-07result-判别联合)
13. [08：Option 类型](#13-08option-类型)
14. [09：Option 工具函数](#14-09option-工具函数)
15. [10：断言函数和不变量](#15-10断言函数和不变量)
16. [11：全面性检查和 never](#16-11全面性检查和-never)
17. [12：错误处理策略选择](#17-12错误处理策略选择)
18. [13：小项目整合](#18-13小项目整合)
19. [最终文件清单](#19-最终文件清单)
20. [最终学习笔记转换要求](#20-最终学习笔记转换要求)
21. [本章最终要能回答的问题](#21-本章最终要能回答的问题)
22. [TS 官方文档阅读清单](#22-ts-官方文档阅读清单)
23. [第 7 章最终记忆模型](#23-第-7-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个写失败路径、触发类型检查、解释错误处理运行时行为和类型建模方式的训练指导。

第 7 章要同时观察两件事：

```txt
JavaScript 运行时：
错误可以通过返回特殊值、throw、try/catch/finally 表达。
throw 会中断正常执行路径并沿调用栈寻找 catch。

TypeScript 编译期：
失败路径可以被建模成 null、undefined、Error、Result、Option、never。
类型系统不能自动知道 throw 会抛出什么类型，也不会自动验证外部数据。
```

错误处理的目标不是“让代码不报错”，而是让失败路径变得明确、可预测、可组合。

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. 先读结论。
2. 区分本节概念属于 runtime control flow、return type modeling、narrowing、exception boundary 还是 domain modeling。
3. 创建对应目录。
4. 写一个正确示例文件。
5. 写一个错误示例文件，优先用 @ts-expect-error 标记预期错误。
6. 运行 npx tsc --noEmit 做类型检查。
7. 如果示例有运行时输出，再编译并用 node 运行。
8. 对照执行过程表格解释每一步。
9. 把本节整理进最终学习笔记。
```

### 推荐 tsconfig

继续使用前几章的严格配置，并为第 7 章显式保留这些选项：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noImplicitReturns": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

本章练习优先使用：

```bash
npx tsc --noEmit
```

如果某个文件需要运行：

```bash
npx tsc
node path/to/compiled-file.js
```

### 代码注释模板

每个 `.ts` 文件顶部都写英文注释：

```ts
// Goal:
// Verify how this TypeScript error handling example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`export {};` 的作用是把文件变成模块（module），防止不同练习文件里的同名变量污染全局作用域。

---

## 2. 项目重新整理建议

### 结论

第 7 章建议单独建立：

```txt
typescript/chapter-07-error-handling/
```

第 3 章训练“值的类型建模”，第 4 章训练“函数边界”，第 5 章训练“对象结构”，第 6 章训练“类型运算”，第 7 章训练“失败路径建模”。

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
    README.md

    00-error-modeling/
      failurePathOverview.ts
      noImplicitReturnsCheck.ts
      throwDoesNotChangeReturnType.ts

    01-return-null/
      nullableLookup.ts
      nullableLookupMistake.ts
      nullBoundaryPolicy.ts

    02-return-undefined/
      optionalLookup.ts
      arrayFindResult.ts
      undefinedVsNullPolicy.ts

    03-throw-exceptions/
      throwErrorBasics.ts
      tryCatchFinally.ts
      throwStringMistake.ts
      finallyReturnMasking.ts

    04-catch-unknown/
      unknownCatchVariable.ts
      safeErrorMessage.ts
      catchTypedErrorMistake.ts
      safeErrorObjectShape.ts

    05-custom-error-classes/
      domainErrorClass.ts
      errorCause.ts
      instanceofErrorNarrowing.ts

    06-return-exceptions/
      returnErrorObject.ts
      returnedErrorMustBeHandled.ts

    07-result-unions/
      parseResultUnion.ts
      resultExhaustiveHandling.ts
      resultMap.ts
      flatMapResult.ts

    08-option-type/
      optionBasics.ts
      optionFromNullable.ts
      optionVsNullable.ts

    09-option-helpers/
      mapOption.ts
      flatMapOption.ts
      unwrapOr.ts

    10-assertion-functions/
      assertNonNull.ts
      assertProductRecord.ts
      invariant.ts

    11-exhaustiveness-never/
      errorStateSwitch.ts
      assertNeverErrorState.ts

    12-strategy-selection/
      chooseErrorStrategy.ts
      boundaryDecisionTable.ts
      asyncThrowBoundary.ts
      asyncResultBoundary.ts

    13-mini-project/
      safeJsonParser.ts
      checkoutErrorModel.ts
      typedValidationPipeline.ts

notes/
  typescript.md
```

### 和真实前端项目的关系

错误处理会出现在所有工程边界：

```txt
API response parsing
  后端数据可能不符合前端预期。

form validation
  用户输入可能缺失、格式错误、范围错误。

URL and localStorage
  字符串来源不可信，字段可能不存在。

business action
  当前业务状态可能不允许某个操作。

component rendering
  加载、成功、失败、空状态都需要明确建模。
```

---

## 3. 第 7 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
错误处理建模目标
  -> 返回 null
  -> 返回 undefined
  -> 抛出异常
  -> catch unknown
  -> 自定义 Error 类
  -> 返回异常对象
  -> Result 判别联合
  -> Option 类型
  -> Option 工具函数
  -> 断言函数
  -> never 全面性检查
  -> 错误处理策略选择
  -> 小项目整合
```

### 技术意义

错误处理不是一个单独语法点，而是“函数失败时，调用者如何知道并处理失败”的设计问题。

```txt
return null:
  调用者必须检查空值。

throw:
  正常返回类型保持干净，但失败路径跳出当前调用流程。

return Error:
  失败作为普通值返回，调用者必须分支处理。

Result:
  成功和失败都被类型系统显式建模。

Option:
  只表示存在或不存在，不表达失败原因。
```

---

## 4. 本章先要建立的底层模型

### 结论

错误处理有两条主线：

```txt
control-flow failure:
  throw changes runtime control flow.

value-level failure:
  null / undefined / Error / Result / Option keeps failure in the returned value.
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| 失败路径（failure path） | 函数无法产出正常业务值时的执行路径。 |
| 异常（exception） | 通过 `throw` 抛出、通过 `catch` 捕获的运行时控制流。 |
| 可恢复错误（recoverable error） | 调用方可以预计并处理的失败，例如表单验证失败。 |
| 不可恢复错误（unrecoverable error） | 表示程序不变量被破坏或环境异常，通常抛出异常。 |
| `null` 返回 | 用一个空值表示“没有结果”。 |
| `undefined` 返回 | 常见于查找失败、可选属性、未命中。 |
| 返回异常对象 | 把错误对象当普通返回值交给调用者。 |
| `Result<T, E>` | 判别联合，显式表示成功值或失败值。 |
| `Option<T>` | 判别联合，显式表示有值或无值。 |
| 断言函数（assertion function） | 运行时检查失败时抛错，成功后缩小类型。 |
| 全面性检查（exhaustiveness checking） | 使用 `never` 确认所有失败状态都被处理。 |

### 底层机制总图

```txt
function call
  -> normal path returns a value
  -> nullable path returns null or undefined
  -> result path returns tagged success or failure
  -> exception path throws and jumps to nearest catch
  -> TypeScript checks return types and narrowing
  -> emitted JavaScript still uses ordinary runtime behavior
```

### 本章最重要的边界

TypeScript 能帮你建模失败路径，但不会自动做到这些事：

```txt
不会自动知道 throw 的具体错误类型。
不会强制调用者 catch 某个异常类型。
不会自动验证 JSON 是否符合类型。
不会让 type assertion 变成运行时校验。
不会让 Option 或 Result 自动存在运行时行为。
```

---

### 本章必须先补：TypeScript 不检查 checked exception

结论：TypeScript 不会把“这个函数可能 throw 哪种错误”写进函数返回类型，也不会强制调用者必须 `catch` 某种错误。

这和 Java、C# 一类语言里的 checked exception 思路不同。TypeScript 的函数签名主要描述正常返回值：

```txt
function readTitle(): string

TypeScript sees:
  normal return value is string.

TypeScript does not encode:
  this function may throw MissingFieldError.
```

所以错误处理必须靠你主动设计边界：

```txt
throw:
  失败路径不出现在返回类型里。

Result<T, E>:
  失败路径出现在返回类型里。

Option<T>:
  无值路径出现在返回类型里，但不携带原因。

null / undefined:
  无值路径出现在返回类型里，但语义较弱。
```

这就是为什么本章不能只学 `try/catch`。真正要训练的是：什么时候让失败跳出控制流，什么时候把失败变成返回值。

### 本章必须先补：throw、return 和 Result 的签名差异

同样是“可能失败”，函数签名给调用者的信息完全不同：

| 写法 | 函数签名能看见失败吗 | 运行时控制流 | 调用方是否被类型系统强制处理失败 |
|---|---|---|---|
| `throw new Error()` | 不能 | 中断当前路径，跳到最近 `catch` | 否 |
| `return null` | 能 | 正常返回 | 是，必须检查 `null` |
| `return undefined` | 能 | 正常返回 | 是，必须检查 `undefined` |
| `return Result<T, E>` | 能 | 正常返回 | 是，必须分支处理 |
| `return Option<T>` | 能 | 正常返回 | 是，必须分支处理 |

关键模型：

```txt
Exception-based failure:
  hidden from TypeScript return type.

Value-based failure:
  visible in TypeScript return type.
```

所以如果失败是业务流程的一部分，例如表单验证失败、解析失败、库存不足，优先考虑让失败出现在返回类型里。如果失败表示程序无法继续满足不变量，例如配置缺失、非法状态、无法恢复的环境错误，才更适合 `throw`。


## 5. 00：错误处理到底在建模什么

### 结论

错误处理建模的是“正常值产不出来时，函数和调用者如何交接控制权或失败信息”。

### 技术意义

这节先建立完整视角：一个函数失败时，可以返回空值、抛异常、返回错误对象、返回 `Result`、返回 `Option`。每种策略都会改变调用者代码的形状。

### 文件结构

```txt
00-error-modeling/
  failurePathOverview.ts
  noImplicitReturnsCheck.ts
  throwDoesNotChangeReturnType.ts
```

### `failurePathOverview.ts`

```ts
// Goal:
// Compare different failure path shapes.

// Expected result:
// The compiler accepts explicit failure modeling.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

function findProductOrNull(productList: ProductRecord[], id: string): ProductRecord | null {
  return productList.find((product) => product.id === id) ?? null;
}

function findProductOrThrow(productList: ProductRecord[], id: string): ProductRecord {
  const product = productList.find((item) => item.id === id);

  if (product === undefined) {
    throw new Error(`Missing product: ${id}`);
  }

  return product;
}

function findProductResult(
  productList: ProductRecord[],
  id: string,
): Result<ProductRecord, string> {
  const product = productList.find((item) => item.id === id);

  if (product === undefined) {
    return { ok: false, error: `Missing product: ${id}` };
  }

  return { ok: true, value: product };
}

const productList: ProductRecord[] = [
  { id: "p1", title: "Keyboard" },
];

console.log(findProductOrNull(productList, "p2"));
console.log(findProductResult(productList, "p2"));
console.log(findProductOrThrow(productList, "p1").title);
```

### `noImplicitReturnsCheck.ts`

```ts
// Goal:
// Verify that all code paths must return a value.

// Expected result:
// With noImplicitReturns enabled, the compiler rejects missing return paths.

export {};

type ParseMode = "number" | "text";

// @ts-expect-error: Not all code paths return a value.
function parseValue(inputText: string, mode: ParseMode): number | string {
  if (mode === "number") {
    return Number(inputText);
  }

  console.log(`unhandled mode:${mode}`);
}

console.log(parseValue("42", "number"));
```

### 执行过程

| 策略 | 运行时行为 | 类型系统效果 |
|---|---|---|
| 返回 `null` | 函数正常返回空值 | 返回类型包含 `null` |
| 抛异常 | 函数中断，跳到 `catch` | 函数返回类型通常不包含错误 |
| 返回错误对象 | 函数正常返回错误值 | 调用者必须判断返回值 |
| 返回 `Result` | 函数正常返回判别联合 | 成功和失败分支可被收窄 |
| 返回 `Option` | 函数正常返回有/无值 | 不携带失败原因 |

### `throwDoesNotChangeReturnType.ts`

```ts
// Goal:
// Show that throw does not appear in the normal return type.

export {};

function readRequiredTitle(titleText: string | undefined): string {
  if (titleText === undefined) {
    throw new Error("Missing title");
  }

  return titleText;
}

const titleText = readRequiredTitle("Keyboard");

console.log(titleText.toUpperCase());

try {
  readRequiredTitle(undefined);
} catch (errorValue) {
  if (errorValue instanceof Error) {
    console.log(errorValue.message);
  }
}
```

### 执行过程补充

| 代码 | TypeScript 编译期 | JavaScript 运行时 |
|---|---|---|
| `function readRequiredTitle(...): string` | 正常返回类型是 `string` | 函数可能正常返回，也可能 throw |
| `throw new Error(...)` | 当前分支不产生普通返回值 | 中断当前函数执行 |
| `readRequiredTitle("Keyboard")` | 调用结果被视为 `string` | 返回 `"Keyboard"` |
| `readRequiredTitle(undefined)` | 类型上仍然是调用一个返回 `string` 的函数 | 实际抛出 `Error` 并跳到 `catch` |

这就是 TypeScript 错误处理的重要边界：函数返回类型描述正常路径，不描述所有可能被抛出的异常类型。


### 常见错误

```txt
错误：
函数失败时随便返回 null、undefined、false、空字符串混用。

正确：
一个模块内要有稳定的失败策略。
调用者应该能从函数签名看出失败是否需要处理。
```

---

## 6. 01：返回 null

### 结论

返回 `null` 适合表达“查找不到、正常无结果”。开启 `strictNullChecks` 后，调用者必须先检查 `null` 才能使用正常值。

### 技术意义

`null` 是一种值级失败路径。它不改变控制流，调用方继续执行，但必须显式处理空值。

### 文件结构

```txt
01-return-null/
  nullableLookup.ts
  nullableLookupMistake.ts
  nullBoundaryPolicy.ts
```

### `nullableLookup.ts`

```ts
// Goal:
// Return null for an expected missing lookup result.

// Expected result:
// The compiler requires null checking before property access.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

function findProductById(productList: ProductRecord[], id: string): ProductRecord | null {
  return productList.find((product) => product.id === id) ?? null;
}

const productList: ProductRecord[] = [
  { id: "p1", title: "Keyboard" },
];

const product = findProductById(productList, "missing");

if (product !== null) {
  console.log(product.title);
} else {
  console.log("not-found");
}
```

### `nullableLookupMistake.ts`

```ts
// Goal:
// Show why nullable return values must be checked.

// Expected result:
// The compiler rejects direct property access on a nullable value.

export {};

type UserRecord = {
  id: string;
  email: string;
};

function findUserById(userList: UserRecord[], id: string): UserRecord | null {
  return userList.find((user) => user.id === id) ?? null;
}

const user = findUserById([], "u1");

// @ts-expect-error: user may be null.
console.log(user.email.toLowerCase());
```

### `nullBoundaryPolicy.ts`

```ts
// Goal:
// Convert a nullable lower-level result into a Result at the module boundary.

// Expected result:
// The compiler forces callers to handle the result state.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type LookupResult =
  | { ok: true; product: ProductRecord }
  | { ok: false; reason: "not-found" };

function findProductById(productList: ProductRecord[], id: string): ProductRecord | null {
  return productList.find((product) => product.id === id) ?? null;
}

function getProductLookupResult(productList: ProductRecord[], id: string): LookupResult {
  const product = findProductById(productList, id);

  if (product === null) {
    return { ok: false, reason: "not-found" };
  }

  return { ok: true, product };
}

const result = getProductLookupResult([], "p1");

if (result.ok) {
  console.log(result.product.title);
} else {
  console.log(result.reason);
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 返回 `null` 后调用者直接访问属性 | 必须先做 `value !== null` 检查。 |
| 同一个模块有时返回 `null`，有时返回 `undefined` | 要统一空值策略。 |
| 用 `null` 表达所有错误原因 | `null` 只表达“无结果”，不表达为什么失败。 |

---

## 7. 02：返回 undefined 和可选结果

### 结论

`undefined` 常用于“没找到”“缺省”“可选属性”。数组 `find()`、对象索引、可选属性都会让你遇到它。

### 技术意义

`undefined` 和 `null` 都能表达无值，但语义不同。`undefined` 更常来自 JavaScript 默认行为；`null` 更常是你主动返回的“空结果”信号。

### 文件结构

```txt
02-return-undefined/
  optionalLookup.ts
  arrayFindResult.ts
  undefinedVsNullPolicy.ts
```

### `optionalLookup.ts`

```ts
// Goal:
// Return undefined for a cache miss.

// Expected result:
// The compiler requires undefined checking.

export {};

type CacheRecord = {
  key: string;
  value: string;
};

const cacheMap = new Map<string, CacheRecord>();

cacheMap.set("theme", {
  key: "theme",
  value: "dark",
});

function readCacheRecord(key: string): CacheRecord | undefined {
  return cacheMap.get(key);
}

const cacheRecord = readCacheRecord("missing");

if (cacheRecord !== undefined) {
  console.log(cacheRecord.value);
} else {
  console.log("cache-miss");
}
```

### `arrayFindResult.ts`

```ts
// Goal:
// Handle Array.find returning undefined.

// Expected result:
// The compiler rejects unsafe access to a find result.

export {};

const statusList = ["draft", "paid", "shipped"] as const;

const matchedStatus = statusList.find((status) => {
  return status.startsWith("x");
});

// @ts-expect-error: matchedStatus may be undefined.
console.log(matchedStatus.toUpperCase());

if (matchedStatus !== undefined) {
  console.log(matchedStatus.toUpperCase());
}
```

### `undefinedVsNullPolicy.ts`

```ts
// Goal:
// Normalize undefined from a lower-level API to null in a public function.

// Expected result:
// The public function returns a stable nullable result.

export {};

type ProfileRecord = {
  id: string;
  displayName: string;
};

const profileMap = new Map<string, ProfileRecord>();

function findProfilePublic(id: string): ProfileRecord | null {
  return profileMap.get(id) ?? null;
}

console.log(findProfilePublic("u1"));
```

### 常见错误

```txt
错误：
undefined 和 null 完全一样，可以随便混用。

正确：
undefined 经常来自 JS 缺省行为。
null 更适合作为主动设计的空值。
模块边界要统一策略。
```

---

## 8. 03：抛出异常

### 结论

`throw` 表示当前函数无法继续正常执行。它会中断当前执行路径，沿调用栈寻找最近的 `catch`。

### 技术意义

异常适合表示“不应该被当前调用者当成普通业务结果处理”的失败，例如不变量被破坏、配置错误、非法状态、无法继续的解析失败。

### 文件结构

```txt
03-throw-exceptions/
  throwErrorBasics.ts
  tryCatchFinally.ts
  throwStringMistake.ts
  finallyReturnMasking.ts
```

### `throwErrorBasics.ts`

```ts
// Goal:
// Throw an Error object for an invalid business invariant.

// Expected result:
// Node catches and prints the error message.

export {};

function parseRequiredPositiveInteger(inputText: string): number {
  const parsedValue = Number(inputText);

  if (!Number.isInteger(parsedValue)) {
    throw new TypeError("Expected an integer");
  }

  if (parsedValue <= 0) {
    throw new RangeError("Expected a positive integer");
  }

  return parsedValue;
}

try {
  console.log(parseRequiredPositiveInteger("0"));
} catch (errorValue) {
  if (errorValue instanceof Error) {
    console.log(errorValue.name);
    console.log(errorValue.message);
  }
}
```

### `tryCatchFinally.ts`

```ts
// Goal:
// Verify try, catch, and finally execution order.

// Expected result:
// Node prints cleanup even when an error is thrown.

export {};

function readSettingsText(): string {
  throw new Error("Settings unavailable");
}

try {
  console.log("before-read");
  console.log(readSettingsText());
  console.log("after-read");
} catch (errorValue) {
  if (errorValue instanceof Error) {
    console.log(`caught:${errorValue.message}`);
  }
} finally {
  console.log("cleanup");
}
```

### 预期输出

```txt
before-read
caught:Settings unavailable
cleanup
```

### `throwStringMistake.ts`

```ts
// Goal:
// Avoid throwing plain strings.

// Expected result:
// Node shows why Error objects are easier to inspect.

export {};

try {
  throw "Request failed";
} catch (errorValue) {
  console.log(typeof errorValue);

  if (errorValue instanceof Error) {
    console.log(errorValue.message);
  } else {
    console.log("not-error-object");
  }
}

try {
  throw new Error("Request failed");
} catch (errorValue) {
  console.log(errorValue instanceof Error);

  if (errorValue instanceof Error) {
    console.log(errorValue.message);
  }
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 抛普通字符串 | 优先抛 `new Error()` 或自定义 Error 子类。 |
| 以为 `throw` 会返回错误值 | `throw` 会中断执行，不是普通返回。 |
| catch 后什么都不做 | 这会吞掉错误，让调试更困难。 |
| 把可恢复业务失败都用 throw | 可恢复失败更适合 `Result` 或表单错误对象。 |

### `finallyReturnMasking.ts`

```ts
// Goal:
// Show why returning from finally is dangerous.

export {};

function readValueWithFinallyReturn(): string {
  try {
    throw new Error("Original failure");
  } finally {
    return "Value from finally";
  }
}

console.log(readValueWithFinallyReturn());
```

### `finally` 的危险边界

`finally` 适合清理资源，不适合返回业务值。原因是：如果 `finally` 里出现 `return`，它会覆盖前面 `try` 或 `catch` 中已经发生的 `throw` 或 `return`。

这段代码运行时不会把 `"Original failure"` 抛给调用者，而是返回 `"Value from finally"`。这会把真正的错误隐藏掉。

本章规则：

```txt
finally:
  cleanup only.

Avoid:
  return from finally.
  throw from finally unless you intentionally want to replace the original error.
```


---

## 9. 04：catch 变量与 unknown

### 结论

开启 `useUnknownInCatchVariables` 后，`catch` 变量是 `unknown`。这是合理的，因为 JavaScript 可以抛出任何值。

### 技术意义

你不能假设捕获到的一定是 `Error`。必须先用 `instanceof Error`、`typeof` 或自定义函数缩小后再读取 `.message`。

### 文件结构

```txt
04-catch-unknown/
  unknownCatchVariable.ts
  safeErrorMessage.ts
  catchTypedErrorMistake.ts
  safeErrorObjectShape.ts
```

### `unknownCatchVariable.ts`

```ts
// Goal:
// Narrow an unknown catch variable before using it.

// Expected result:
// The compiler requires narrowing before reading message.

export {};

try {
  throw new Error("Network failed");
} catch (errorValue) {
  // @ts-expect-error: errorValue is unknown.
  console.log(errorValue.message);

  if (errorValue instanceof Error) {
    console.log(errorValue.message);
  }
}
```

### `safeErrorMessage.ts`

```ts
// Goal:
// Convert an unknown thrown value into a safe message.

// Expected result:
// Node prints messages for different thrown value shapes.

export {};

function getErrorMessage(errorValue: unknown): string {
  if (errorValue instanceof Error) {
    return errorValue.message;
  }

  if (typeof errorValue === "string") {
    return errorValue;
  }

  return "Unknown error";
}

const thrownValues: unknown[] = [
  new Error("Broken"),
  "Plain failure",
  { message: "object-like" },
];

for (const thrownValue of thrownValues) {
  console.log(getErrorMessage(thrownValue));
}
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `catch` 捕获的值类型是 `unknown`。 |
| 2 | 直接读取 `.message` 不安全。 |
| 3 | `instanceof Error` 把类型缩小为 `Error`。 |
| 4 | `typeof errorValue === "string"` 处理普通字符串抛出值。 |
| 5 | 剩余情况使用兜底消息。 |

### `catchTypedErrorMistake.ts`

```ts
// Goal:
// Show that a catch variable cannot be typed as a specific Error subclass.

export {};

class NetworkError extends Error {
  override name = "NetworkError";
}

try {
  throw new NetworkError("Network failed");
} catch (
  // @ts-expect-error: Catch variables can only be annotated as any or unknown.
  errorValue: NetworkError
) {
  console.log(errorValue.message);
}
```

### 为什么不能写 `catch (errorValue: NetworkError)`

JavaScript 运行时允许任何值被 `throw`：

```txt
throw new Error("x")
throw "x"
throw 123
throw { message: "x" }
```

所以 TypeScript 不能相信 `catch` 里拿到的一定是 `NetworkError`。正确模型是：

```txt
catch receives unknown.
Then your code narrows it.
```

也就是先捕获，再判断：

```txt
catch (errorValue) {
  if (errorValue instanceof NetworkError) {
    ...
  }
}
```

### `safeErrorObjectShape.ts`

```ts
// Goal:
// Safely read a message-like property from an unknown thrown value.

export {};

function hasStringMessage(value: unknown): value is { message: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate["message"] === "string";
}

function getBetterErrorMessage(errorValue: unknown): string {
  if (errorValue instanceof Error) {
    return errorValue.message;
  }

  if (typeof errorValue === "string") {
    return errorValue;
  }

  if (hasStringMessage(errorValue)) {
    return errorValue.message;
  }

  return "Unknown error";
}

const thrownValues: unknown[] = [
  new Error("Error object"),
  "Plain string",
  { message: "Message-like object" },
  { reason: "No message" },
];

for (const thrownValue of thrownValues) {
  console.log(getBetterErrorMessage(thrownValue));
}
```

### catch narrowing 的完整顺序

处理 `catch` 变量时，安全顺序是：

```txt
unknown
  -> instanceof Error
  -> typeof value === "string"
  -> object shape check
  -> fallback message
```

不要一上来写 `errorValue as Error`。那只是压过类型检查，没有证明运行时值真的是 `Error`。


### 常见错误

```txt
错误：
catch (error) { console.log(error.message) }

正确：
catch (error) {
  if (error instanceof Error) {
    console.log(error.message)
  }
}
```

---

## 10. 05：自定义 Error 类

### 结论

自定义 Error 类适合表达领域错误类型，让调用者可以按错误类别分支处理。

### 技术意义

普通 `Error` 只有 `name`、`message`、`cause` 等通用信息。业务错误经常需要额外字段，比如 `fieldName`、`statusCode`、`errorCode`。

### 文件结构

```txt
05-custom-error-classes/
  domainErrorClass.ts
  errorCause.ts
  instanceofErrorNarrowing.ts
```

### `domainErrorClass.ts`

```ts
// Goal:
// Create a domain-specific Error subclass.

// Expected result:
// Node prints the custom error name and field.

export {};

class MissingFieldError extends Error {
  override name = "MissingFieldError";

  constructor(public readonly fieldName: string) {
    super(`Missing field: ${fieldName}`);
  }
}

function requireField(record: Record<string, unknown>, fieldName: string): unknown {
  if (!(fieldName in record)) {
    throw new MissingFieldError(fieldName);
  }

  return record[fieldName];
}

try {
  requireField({ title: "Keyboard" }, "price");
} catch (errorValue) {
  if (errorValue instanceof MissingFieldError) {
    console.log(errorValue.name);
    console.log(errorValue.fieldName);
  }
}
```

### `errorCause.ts`

```ts
// Goal:
// Wrap a lower-level error with a higher-level cause.

// Expected result:
// Node prints the wrapper message and confirms the cause.

export {};

class ConfigParseError extends Error {
  override name = "ConfigParseError";

  constructor(messageText: string, causeValue: unknown) {
    super(messageText, { cause: causeValue });
  }
}

function parseConfig(configText: string): unknown {
  try {
    return JSON.parse(configText);
  } catch (errorValue) {
    throw new ConfigParseError("Config could not be parsed", errorValue);
  }
}

try {
  parseConfig("{broken-json");
} catch (errorValue) {
  if (errorValue instanceof ConfigParseError) {
    console.log(errorValue.message);
    console.log(errorValue.cause instanceof SyntaxError);
  }
}
```

### `instanceofErrorNarrowing.ts`

```ts
// Goal:
// Narrow different custom error classes with instanceof.

// Expected result:
// Node handles each error class differently.

export {};

class ValidationError extends Error {
  override name = "ValidationError";

  constructor(public readonly fieldName: string) {
    super(`Invalid field: ${fieldName}`);
  }
}

class AuthorizationError extends Error {
  override name = "AuthorizationError";

  constructor(public readonly actionName: string) {
    super(`Action not allowed: ${actionName}`);
  }
}

function runAction(actionName: string): void {
  if (actionName === "delete") {
    throw new AuthorizationError(actionName);
  }

  if (actionName.length === 0) {
    throw new ValidationError("actionName");
  }
}

try {
  runAction("delete");
} catch (errorValue) {
  if (errorValue instanceof AuthorizationError) {
    console.log(errorValue.actionName);
  } else if (errorValue instanceof ValidationError) {
    console.log(errorValue.fieldName);
  } else {
    throw errorValue;
  }
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有错误都用普通 `Error` | 有领域分类时可以用自定义 Error。 |
| 自定义错误类不设置 `name` | 日志和调试信息不够明确。 |
| catch 到未知错误后直接吞掉 | 不认识的错误应该重新抛出或统一上报。 |

---

## 11. 06：返回异常对象

### 结论

返回异常对象是把失败当成普通值返回。它不会中断控制流，但调用者必须判断返回的是正常值还是错误值。

### 技术意义

这种策略适合你想避免异常跳转，同时又想保留错误对象信息的场景。它比返回 `null` 信息更多，但比 `Result` 的标签更容易误用。

### 文件结构

```txt
06-return-exceptions/
  returnErrorObject.ts
  returnedErrorMustBeHandled.ts
```

### `returnErrorObject.ts`

```ts
// Goal:
// Return an Error object instead of throwing it.

// Expected result:
// The caller handles both value and error branches.

export {};

function parsePort(inputText: string): number | Error {
  const parsedValue = Number(inputText);

  if (!Number.isInteger(parsedValue)) {
    return new TypeError("Port must be an integer");
  }

  if (parsedValue <= 0 || parsedValue > 65535) {
    return new RangeError("Port is out of range");
  }

  return parsedValue;
}

const result = parsePort("70000");

if (result instanceof Error) {
  console.log(result.name);
  console.log(result.message);
} else {
  console.log(result.toFixed(0));
}
```

### `returnedErrorMustBeHandled.ts`

```ts
// Goal:
// Show why returned Error values must be checked.

// Expected result:
// The compiler rejects treating number | Error as number.

export {};

function parseQuantity(inputText: string): number | Error {
  const parsedValue = Number(inputText);

  if (!Number.isInteger(parsedValue)) {
    return new TypeError("Quantity must be an integer");
  }

  return parsedValue;
}

const quantity = parseQuantity("x");

// @ts-expect-error: quantity may be an Error.
console.log(quantity.toFixed(0));
```

### 常见错误

```txt
错误：
返回 Error 后调用者忘记判断。

正确：
用 instanceof Error 分支处理。
如果团队经常忘记处理，优先考虑 Result 判别联合。
```

---

## 12. 07：Result 判别联合

### 结论

`Result<T, E>` 是最适合显式建模“成功或失败”的基础结构。它用判别字段让 TypeScript 在不同分支中准确缩小类型。

### 技术意义

`Result` 比 `null` 信息更多，比 `throw` 更可组合，比返回裸 `Error` 更不容易误用。

### 文件结构

```txt
07-result-unions/
  parseResultUnion.ts
  resultExhaustiveHandling.ts
  resultMap.ts
  flatMapResult.ts
```

### `parseResultUnion.ts`

```ts
// Goal:
// Use a Result union to represent success and failure.

// Expected result:
// The compiler narrows value and error branches.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type ParseError =
  | { kind: "empty-input" }
  | { kind: "invalid-number"; inputText: string };

function parsePositiveNumber(inputText: string): Result<number, ParseError> {
  if (inputText.trim().length === 0) {
    return { ok: false, error: { kind: "empty-input" } };
  }

  const parsedValue = Number(inputText);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return { ok: false, error: { kind: "invalid-number", inputText } };
  }

  return { ok: true, value: parsedValue };
}

const result = parsePositiveNumber("42");

if (result.ok) {
  console.log(result.value.toFixed(2));
} else {
  console.log(result.error.kind);
}
```

### `resultExhaustiveHandling.ts`

```ts
// Goal:
// Use never to handle all Result error variants.

// Expected result:
// The compiler accepts exhaustive handling.

export {};

type ValidationError =
  | { kind: "missing-field"; fieldName: string }
  | { kind: "invalid-format"; fieldName: string }
  | { kind: "out-of-range"; fieldName: string };

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function renderValidationError(error: ValidationError): string {
  switch (error.kind) {
    case "missing-field":
      return `Missing ${error.fieldName}`;
    case "invalid-format":
      return `Invalid ${error.fieldName}`;
    case "out-of-range":
      return `Out of range ${error.fieldName}`;
    default:
      return assertNever(error);
  }
}

console.log(renderValidationError({ kind: "missing-field", fieldName: "email" }));
```

### `resultMap.ts`

```ts
// Goal:
// Transform a successful Result value while preserving the error type.

// Expected result:
// The compiler preserves success and failure types.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

function mapResult<InputType, OutputType, ErrorType>(
  result: Result<InputType, ErrorType>,
  transformValue: (value: InputType) => OutputType,
): Result<OutputType, ErrorType> {
  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    value: transformValue(result.value),
  };
}

const numberResult: Result<number, string> = {
  ok: true,
  value: 42,
};

const labelResult = mapResult(numberResult, (value) => `value:${value}`);

console.log(labelResult);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 用 `{ data?: T; error?: E }` 建模结果 | 这会允许 data 和 error 同时存在或同时不存在。 |
| `Result` 分支没有判别字段 | 缩小会更困难。 |
| 错误类型只写 `string` | 简单场景可以，复杂业务应使用错误联合。 |

### `flatMapResult.ts`

```ts
// Goal:
// Chain Result-returning steps without losing the first error.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

function flatMapResult<InputType, OutputType, ErrorType>(
  result: Result<InputType, ErrorType>,
  transformValue: (value: InputType) => Result<OutputType, ErrorType>,
): Result<OutputType, ErrorType> {
  if (!result.ok) {
    return result;
  }

  return transformValue(result.value);
}

function parseInteger(inputText: string): Result<number, string> {
  const parsedValue = Number(inputText);

  if (!Number.isInteger(parsedValue)) {
    return { ok: false, error: "invalid-integer" };
  }

  return { ok: true, value: parsedValue };
}

function requirePositive(value: number): Result<number, string> {
  if (value <= 0) {
    return { ok: false, error: "not-positive" };
  }

  return { ok: true, value };
}

const result = flatMapResult(parseInteger("42"), requirePositive);

console.log(result);
```

### `mapResult` 和 `flatMapResult` 的区别

```txt
mapResult:
  success value -> plain value

flatMapResult:
  success value -> another Result
```

如果转换函数本身也可能失败，就用 `flatMapResult`。否则会得到嵌套结构：

```txt
Result<Result<T, E>, E>
```

这就是 `Result` 可组合性的核心：每一步成功才继续，失败就短路并保留错误。


---

## 13. 08：Option 类型

### 结论

`Option<T>` 表示“有值或无值”。它适合不存在正常、且不需要失败原因的场景。

### 技术意义

`Option` 比 `T | null` 更显式，因为它强迫你通过 `kind` 或 `tag` 分支处理。它的重点不是携带错误，而是把“可能没有值”变成稳定结构。

### 文件结构

```txt
08-option-type/
  optionBasics.ts
  optionFromNullable.ts
  optionVsNullable.ts
```

### `optionBasics.ts`

```ts
// Goal:
// Model presence and absence with Option.

// Expected result:
// The compiler narrows Some and None branches.

export {};

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

function findFirstLongTitle(titleList: string[]): Option<string> {
  const title = titleList.find((item) => item.length > 6);

  if (title === undefined) {
    return { kind: "none" };
  }

  return { kind: "some", value: title };
}

const result = findFirstLongTitle(["Mouse", "Keyboard"]);

if (result.kind === "some") {
  console.log(result.value.toUpperCase());
} else {
  console.log("none");
}
```

### `optionFromNullable.ts`

```ts
// Goal:
// Convert nullable values into Option values.

// Expected result:
// The compiler handles the option branches.

export {};

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

function fromNullable<ValueType>(value: ValueType | null | undefined): Option<NonNullable<ValueType>> {
  if (value === null || value === undefined) {
    return { kind: "none" };
  }

  return { kind: "some", value: value as NonNullable<ValueType> };
}

const optionValue = fromNullable("Keyboard");

if (optionValue.kind === "some") {
  console.log(optionValue.value.toUpperCase());
}
```

### `optionVsNullable.ts`

```ts
// Goal:
// Compare nullable value handling and Option handling.

// Expected result:
// The compiler accepts explicit option handling.

export {};

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

function renderNullableTitle(titleText: string | null): string {
  if (titleText === null) {
    return "Untitled";
  }

  return titleText;
}

function renderOptionTitle(titleOption: Option<string>): string {
  switch (titleOption.kind) {
    case "some":
      return titleOption.value;
    case "none":
      return "Untitled";
  }
}

console.log(renderNullableTitle(null));
console.log(renderOptionTitle({ kind: "none" }));
```

### 常见错误

```txt
错误：
Option 可以表达所有错误。

正确：
Option 只表达有值或无值。
需要失败原因时用 Result。
```

---

## 14. 09：Option 工具函数

### 结论

`Option` 的价值来自可组合性。`mapOption`、`flatMapOption`、`unwrapOr` 能让你不手写重复分支。

### 技术意义

当多个步骤都可能没有值时，普通 `null` 检查容易层层嵌套。Option 工具函数把“有值继续、无值短路”变成统一模式。

### 文件结构

```txt
09-option-helpers/
  mapOption.ts
  flatMapOption.ts
  unwrapOr.ts
```

### `mapOption.ts`

```ts
// Goal:
// Transform the value inside Option when it exists.

// Expected result:
// The compiler derives Option<number>.

export {};

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

function mapOption<InputType, OutputType>(
  option: Option<InputType>,
  transformValue: (value: InputType) => OutputType,
): Option<OutputType> {
  if (option.kind === "none") {
    return option;
  }

  return {
    kind: "some",
    value: transformValue(option.value),
  };
}

const titleOption: Option<string> = {
  kind: "some",
  value: "Keyboard",
};

const lengthOption = mapOption(titleOption, (title) => title.length);

console.log(lengthOption);
```

### `flatMapOption.ts`

```ts
// Goal:
// Chain computations that each return Option.

// Expected result:
// None short-circuits the chain.

export {};

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

function flatMapOption<InputType, OutputType>(
  option: Option<InputType>,
  transformValue: (value: InputType) => Option<OutputType>,
): Option<OutputType> {
  if (option.kind === "none") {
    return option;
  }

  return transformValue(option.value);
}

function parseNumberOption(inputText: string): Option<number> {
  const parsedValue = Number(inputText);

  if (Number.isNaN(parsedValue)) {
    return { kind: "none" };
  }

  return { kind: "some", value: parsedValue };
}

function invertNumberOption(value: number): Option<number> {
  if (value === 0) {
    return { kind: "none" };
  }

  return { kind: "some", value: 1 / value };
}

const result = flatMapOption(parseNumberOption("4"), invertNumberOption);

console.log(result);
```

### `unwrapOr.ts`

```ts
// Goal:
// Extract an Option value with a fallback.

// Expected result:
// Node prints the fallback when no value exists.

export {};

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

function unwrapOr<ValueType>(option: Option<ValueType>, fallbackValue: ValueType): ValueType {
  if (option.kind === "some") {
    return option.value;
  }

  return fallbackValue;
}

console.log(unwrapOr({ kind: "some", value: "Keyboard" }, "Untitled"));
console.log(unwrapOr({ kind: "none" }, "Untitled"));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `mapOption` 的回调返回 `Option` | 这种情况应该用 `flatMapOption`。 |
| `unwrapOr` 过早使用 | 过早拿默认值会丢失“无值”信息。 |
| Option helper 写成 `any` | 泛型要保留输入输出类型关系。 |

---

## 15. 10：断言函数和不变量

### 结论

断言函数在运行时检查条件；失败时抛错，成功后让 TypeScript 缩小类型。它适合模块边界和程序不变量。

### 技术意义

断言函数把“这件事不成立就不能继续执行”写成可复用边界。它不是普通错误返回，而是明确中断执行。

### 文件结构

```txt
10-assertion-functions/
  assertNonNull.ts
  assertProductRecord.ts
  invariant.ts
```

### `assertNonNull.ts`

```ts
// Goal:
// Assert that a nullable value is present.

// Expected result:
// The compiler narrows after the assertion call.

export {};

function assertNonNull<ValueType>(
  value: ValueType,
  messageText: string,
): asserts value is NonNullable<ValueType> {
  if (value === null || value === undefined) {
    throw new Error(messageText);
  }
}

const titleText: string | null = "Keyboard";

assertNonNull(titleText, "Missing title");

console.log(titleText.toUpperCase());
```

### `assertProductRecord.ts`

```ts
// Goal:
// Assert unknown external data into a ProductRecord.

// Expected result:
// The compiler allows product access after assertion.

export {};

type ProductRecord = {
  id: string;
  title: string;
  price: number;
};

function assertProductRecord(value: unknown): asserts value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    throw new Error("Invalid product");
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.price !== "number"
  ) {
    throw new Error("Invalid product");
  }
}

const rawValue: unknown = JSON.parse('{"id":"p1","title":"Keyboard","price":99}');

assertProductRecord(rawValue);

console.log(rawValue.title);
```

### `invariant.ts`

```ts
// Goal:
// Stop execution when an impossible condition occurs.

// Expected result:
// Node prints the valid value.

export {};

function invariant(conditionValue: unknown, messageText: string): asserts conditionValue {
  if (!conditionValue) {
    throw new Error(messageText);
  }
}

type SessionRecord = {
  userId?: string;
};

const sessionRecord: SessionRecord = {
  userId: "u1",
};

invariant(sessionRecord.userId !== undefined, "Missing user id");

console.log(sessionRecord.userId.toUpperCase());
```

### 常见错误

```txt
错误：
asserts 自动检查类型。

正确：
asserts 只是告诉 TypeScript 检查成功后的类型。
真正的运行时检查必须写在函数体里。
```

---

## 16. 11：全面性检查和 never

### 结论

错误状态一旦用判别联合建模，就要用 `never` 做全面性检查，防止新增错误种类后漏处理 UI 或日志分支。

### 技术意义

错误处理最容易腐烂的地方，是新增错误类型后旧代码静默走默认分支。`never` 能把遗漏变成编译错误。

### 文件结构

```txt
11-exhaustiveness-never/
  errorStateSwitch.ts
  assertNeverErrorState.ts
```

### `errorStateSwitch.ts`

```ts
// Goal:
// Render every known error state explicitly.

// Expected result:
// The compiler accepts exhaustive switch handling.

export {};

type CheckoutError =
  | { kind: "empty-cart" }
  | { kind: "payment-declined"; reason: string }
  | { kind: "network-failure"; retryAfterSeconds: number };

function renderCheckoutError(error: CheckoutError): string {
  switch (error.kind) {
    case "empty-cart":
      return "Cart is empty";
    case "payment-declined":
      return `Payment declined: ${error.reason}`;
    case "network-failure":
      return `Retry after ${error.retryAfterSeconds}`;
    default: {
      const exhaustiveValue: never = error;
      return exhaustiveValue;
    }
  }
}

console.log(renderCheckoutError({ kind: "empty-cart" }));
```

### `assertNeverErrorState.ts`

```ts
// Goal:
// Use an assertNever helper for error state handling.

// Expected result:
// The compiler checks that every branch is handled.

export {};

type ParseError =
  | { kind: "invalid-json"; message: string }
  | { kind: "invalid-shape"; fieldName: string };

function assertNever(value: never): never {
  throw new Error(`Unexpected error: ${JSON.stringify(value)}`);
}

function renderParseError(error: ParseError): string {
  switch (error.kind) {
    case "invalid-json":
      return error.message;
    case "invalid-shape":
      return `Invalid field: ${error.fieldName}`;
    default:
      return assertNever(error);
  }
}

console.log(renderParseError({ kind: "invalid-shape", fieldName: "price" }));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 用普通 `default` 吞掉所有未知错误 | 这会隐藏新增状态遗漏。 |
| 错误联合没有判别字段 | 难以做清晰分支和全面性检查。 |
| 把 `never` 当运行时错误类型 | `never` 表示静态上不该到达的位置。 |

---

## 17. 12：错误处理策略选择

### 结论

错误处理没有唯一最佳方案。你要根据失败是否预期、是否可恢复、是否需要原因、调用者是否必须处理来选择策略。

### 技术意义

同一个项目中，不同层应该有不同策略。底层解析函数可能返回 `Result`；业务不变量失败可能 `throw`；UI 查找可能返回 `Option`；缓存读取可能返回 `undefined`。

### 文件结构

```txt
12-strategy-selection/
  chooseErrorStrategy.ts
  boundaryDecisionTable.ts
  asyncThrowBoundary.ts
  asyncResultBoundary.ts
```

### `chooseErrorStrategy.ts`

```ts
// Goal:
// Use different error strategies for different failure meanings.

// Expected result:
// The compiler accepts explicit strategy choices.

export {};

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

function findOptionalTitle(titleList: string[], keywordText: string): Option<string> {
  const title = titleList.find((item) => item.includes(keywordText));

  if (title === undefined) {
    return { kind: "none" };
  }

  return { kind: "some", value: title };
}

function parseRequiredQuantity(inputText: string): Result<number, string> {
  const parsedValue = Number(inputText);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return { ok: false, error: "invalid-quantity" };
  }

  return { ok: true, value: parsedValue };
}

function requireConfiguredBaseUrl(baseUrl: string | undefined): string {
  if (baseUrl === undefined) {
    throw new Error("Missing base URL");
  }

  return baseUrl;
}

console.log(findOptionalTitle(["Keyboard"], "Key"));
console.log(parseRequiredQuantity("2"));
console.log(requireConfiguredBaseUrl("https://example.com"));
```

### `boundaryDecisionTable.ts`

```ts
// Goal:
// Keep a local decision table for error strategy selection.

// Expected result:
// Node prints the strategy table labels.

export {};

const errorStrategyTable = {
  optionalLookup: "Option",
  expectedValidationFailure: "Result",
  impossibleState: "throw",
  cacheMiss: "undefined",
  publicNoResult: "null",
} as const;

type ErrorScenario = keyof typeof errorStrategyTable;
type ErrorStrategy = (typeof errorStrategyTable)[ErrorScenario];

function readStrategy(scenario: ErrorScenario): ErrorStrategy {
  return errorStrategyTable[scenario];
}

console.log(readStrategy("expectedValidationFailure"));
```

### 策略选择表

| 场景 | 推荐策略 |
|---|---|
| 查找不到是正常情况，不需要原因 | `Option<T>` 或 `T | null` |
| JS API 自然返回未命中 | `T | undefined` |
| 表单验证、API 解析、业务规则失败 | `Result<T, E>` |
| 程序不变量被破坏 | `throw new Error()` |
| 需要错误堆栈和异常传播 | `throw` |
| 需要组合多个失败步骤 | `Result` 或 `Option` |
| 只表达有无，不表达原因 | `Option` |
| 需要失败原因 | `Result` |

### 本节必须补：异步错误边界

前端真实项目里，很多错误来自异步边界：

```txt
fetch request
JSON parsing
route loader
server action
local async storage
WebSocket message
```

异步函数有两种常见失败模型：

```txt
async function throws:
  returns Promise<T>
  failure becomes rejected Promise
  caller needs await + try/catch or .catch()

async function returns Result:
  returns Promise<Result<T, E>>
  failure stays in resolved value
  caller handles result.ok
```

TypeScript 仍然不会把 rejected error type 写进 `Promise<T>`。`Promise<string>` 只表示成功后得到 `string`，不表示失败时会 reject 什么错误。

### `asyncThrowBoundary.ts`

```ts
// Goal:
// Handle an async function that rejects by throwing.

export {};

async function loadSettingsText(shouldFail: boolean): Promise<string> {
  if (shouldFail) {
    throw new Error("Settings unavailable");
  }

  return "ready";
}

async function runDemo(): Promise<void> {
  try {
    const settingsText = await loadSettingsText(true);
    console.log(settingsText.toUpperCase());
  } catch (errorValue) {
    if (errorValue instanceof Error) {
      console.log(errorValue.message);
    }
  }
}

void runDemo();
```

### `asyncResultBoundary.ts`

```ts
// Goal:
// Represent async failure with a resolved Result value.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

async function loadSettingsResult(shouldFail: boolean): Promise<Result<string, string>> {
  if (shouldFail) {
    return {
      ok: false,
      error: "settings-unavailable",
    };
  }

  return {
    ok: true,
    value: "ready",
  };
}

async function runDemo(): Promise<void> {
  const result = await loadSettingsResult(true);

  if (result.ok) {
    console.log(result.value.toUpperCase());
  } else {
    console.log(result.error);
  }
}

void runDemo();
```

### 异步策略选择

| 场景 | 推荐 |
|---|---|
| 不可恢复环境错误 | `throw` / rejected Promise |
| 可恢复业务失败 | `Promise<Result<T, E>>` |
| UI 表单验证 | `Result<T, E>` 或字段错误对象 |
| API parsing boundary | `Promise<Result<T, E>>` |
| fire-and-forget 日志 | 明确捕获并上报，避免 unhandled rejection |

本章规则：

```txt
Promise<T>:
  success type only.

Promise<Result<T, E>>:
  success and expected failure are both visible.

Rejected Promise:
  runtime failure channel, not typed as E in Promise<T>.
```


---

## 18. 13：小项目整合

### 结论

本章小项目要把 `unknown` 输入、JSON 解析、运行时验证、`Result`、`Option`、自定义错误、断言函数和全面性检查组合起来，做一个“类型安全的输入解析与结账错误模型”。

### 技术意义

真实项目中的错误处理通常不是单个 `try/catch`。它包括：外部数据进入、解析失败、校验失败、业务规则失败、UI 展示失败原因、日志记录异常。

### 文件结构

```txt
13-mini-project/
  safeJsonParser.ts
  checkoutErrorModel.ts
  typedValidationPipeline.ts
```

### `safeJsonParser.ts`

```ts
// Goal:
// Parse JSON safely and return a typed Result.

// Expected result:
// The caller handles JSON parse failure without try/catch.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type JsonParseError = {
  kind: "invalid-json";
  message: string;
};

function getErrorMessage(errorValue: unknown): string {
  if (errorValue instanceof Error) {
    return errorValue.message;
  }

  return "Unknown parse error";
}

function parseJson(inputText: string): Result<unknown, JsonParseError> {
  try {
    return {
      ok: true,
      value: JSON.parse(inputText),
    };
  } catch (errorValue) {
    return {
      ok: false,
      error: {
        kind: "invalid-json",
        message: getErrorMessage(errorValue),
      },
    };
  }
}

const result = parseJson("{broken-json");

if (result.ok) {
  console.log(result.value);
} else {
  console.log(result.error.message);
}
```

### `checkoutErrorModel.ts`

```ts
// Goal:
// Model checkout errors as a discriminated union.

// Expected result:
// The compiler enforces explicit handling of every error kind.

export {};

type CheckoutError =
  | { kind: "empty-cart" }
  | { kind: "invalid-quantity"; productId: string }
  | { kind: "payment-declined"; reason: string }
  | { kind: "network-failure"; retryAfterSeconds: number };

function assertNever(value: never): never {
  throw new Error(`Unexpected checkout error: ${JSON.stringify(value)}`);
}

function renderCheckoutError(error: CheckoutError): string {
  switch (error.kind) {
    case "empty-cart":
      return "Your cart is empty.";
    case "invalid-quantity":
      return `Invalid quantity for ${error.productId}.`;
    case "payment-declined":
      return `Payment declined: ${error.reason}.`;
    case "network-failure":
      return `Please retry after ${error.retryAfterSeconds} seconds.`;
    default:
      return assertNever(error);
  }
}

console.log(renderCheckoutError({ kind: "empty-cart" }));
```

### `typedValidationPipeline.ts`

```ts
// Goal:
// Combine JSON parsing, shape validation, and business validation with Result and Option.

// Expected result:
// The compiler preserves every failure branch.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type Option<ValueType> =
  | { kind: "some"; value: ValueType }
  | { kind: "none" };

type RawCartItem = {
  productId: string;
  quantity: number;
};

type CartItem = RawCartItem & {
  readonly __brand: "CartItem";
};

type ValidationError =
  | { kind: "invalid-json"; message: string }
  | { kind: "invalid-shape"; fieldName: string }
  | { kind: "invalid-quantity"; productId: string };

function getErrorMessage(errorValue: unknown): string {
  if (errorValue instanceof Error) {
    return errorValue.message;
  }

  return "Unknown error";
}

function parseJson(inputText: string): Result<unknown, ValidationError> {
  try {
    return { ok: true, value: JSON.parse(inputText) };
  } catch (errorValue) {
    return {
      ok: false,
      error: {
        kind: "invalid-json",
        message: getErrorMessage(errorValue),
      },
    };
  }
}

function isRawCartItem(value: unknown): value is RawCartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.productId === "string" &&
    typeof candidate.quantity === "number"
  );
}

function validateCartItem(value: unknown): Result<CartItem, ValidationError> {
  if (!isRawCartItem(value)) {
    return {
      ok: false,
      error: {
        kind: "invalid-shape",
        fieldName: "cartItem",
      },
    };
  }

  if (!Number.isInteger(value.quantity) || value.quantity <= 0) {
    return {
      ok: false,
      error: {
        kind: "invalid-quantity",
        productId: value.productId,
      },
    };
  }

  return {
    ok: true,
    value: value as CartItem,
  };
}

function firstCartItemOption(items: CartItem[]): Option<CartItem> {
  const firstItem = items[0];

  if (firstItem === undefined) {
    return { kind: "none" };
  }

  return { kind: "some", value: firstItem };
}

const jsonResult = parseJson('{"productId":"p1","quantity":2}');

if (jsonResult.ok) {
  const itemResult = validateCartItem(jsonResult.value);

  if (itemResult.ok) {
    console.log(firstCartItemOption([itemResult.value]));
  } else {
    console.log(itemResult.error.kind);
  }
} else {
  console.log(jsonResult.error.kind);
}
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 外部 JSON 字符串先进入 `parseJson()`。 |
| 2 | `JSON.parse()` 失败时不向外抛异常，而是返回 `Result`。 |
| 3 | 成功解析后的值仍然是 `unknown`。 |
| 4 | `isRawCartItem()` 做运行时形状检查。 |
| 5 | `validateCartItem()` 做业务数量检查。 |
| 6 | 成功后返回带品牌的 `CartItem`。 |
| 7 | `firstCartItemOption()` 用 `Option` 表示列表可能为空。 |
| 8 | UI 层可以按 `Result` 和 `Option` 分支渲染。 |

---

## 19. 最终文件清单

```txt
typescript/
  chapter-07-error-handling/
    README.md

    00-error-modeling/
      failurePathOverview.ts
      noImplicitReturnsCheck.ts
      throwDoesNotChangeReturnType.ts

    01-return-null/
      nullableLookup.ts
      nullableLookupMistake.ts
      nullBoundaryPolicy.ts

    02-return-undefined/
      optionalLookup.ts
      arrayFindResult.ts
      undefinedVsNullPolicy.ts

    03-throw-exceptions/
      throwErrorBasics.ts
      tryCatchFinally.ts
      throwStringMistake.ts
      finallyReturnMasking.ts

    04-catch-unknown/
      unknownCatchVariable.ts
      safeErrorMessage.ts
      catchTypedErrorMistake.ts
      safeErrorObjectShape.ts

    05-custom-error-classes/
      domainErrorClass.ts
      errorCause.ts
      instanceofErrorNarrowing.ts

    06-return-exceptions/
      returnErrorObject.ts
      returnedErrorMustBeHandled.ts

    07-result-unions/
      parseResultUnion.ts
      resultExhaustiveHandling.ts
      resultMap.ts
      flatMapResult.ts

    08-option-type/
      optionBasics.ts
      optionFromNullable.ts
      optionVsNullable.ts

    09-option-helpers/
      mapOption.ts
      flatMapOption.ts
      unwrapOr.ts

    10-assertion-functions/
      assertNonNull.ts
      assertProductRecord.ts
      invariant.ts

    11-exhaustiveness-never/
      errorStateSwitch.ts
      assertNeverErrorState.ts

    12-strategy-selection/
      chooseErrorStrategy.ts
      boundaryDecisionTable.ts
      asyncThrowBoundary.ts
      asyncResultBoundary.ts

    13-mini-project/
      safeJsonParser.ts
      checkoutErrorModel.ts
      typedValidationPipeline.ts

notes/
  typescript.md
```

---

## 20. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### 知识点名称

结论：一句话说明它解决什么问题。

技术意义：它在类型系统里表示什么。

底层机制：编译期做了什么，运行时还剩什么。

代码例子：保留一个最能说明问题的例子。

常见错误：写一个你自己容易犯的反例。

项目关系：说明它在 API response、form validation、localStorage、URL params、React rendering、Node scripts 中的用途。
```

最终笔记必须包含这些对比：

```txt
return null vs return undefined
nullable return vs throwing exception
throw Error vs throw string
Error object vs custom Error class
catch any vs catch unknown
returned Error vs thrown Error
Result<T, E> vs T | Error
Result<T, E> vs { data?: T; error?: E }
Option<T> vs T | null
Option<T> vs Result<T, E>
type guard vs assertion function
assertion function vs type assertion
never exhaustive check vs default fallback
recoverable error vs unrecoverable error
business validation error vs programming invariant error
async throw boundary vs Promise<Result<T, E>>
checked exception expectation vs TypeScript throw reality
return from finally vs cleanup in finally
mapResult vs flatMapResult
```

---

## 21. 本章最终要能回答的问题

学完第 7 章后，你必须能不用查资料回答这些问题：

1. 错误处理到底是在建模什么？
2. 返回 `null` 适合什么场景？
3. 返回 `undefined` 和返回 `null` 的语义差异是什么？
4. `strictNullChecks` 为什么会改变空值处理方式？
5. `throw` 在运行时如何改变控制流？
6. 为什么不要抛普通字符串？
7. `Error` 对象有什么好处？
8. `TypeError`、`RangeError`、自定义 Error 类分别适合什么场景？
9. `catch` 变量为什么应该是 `unknown`？
10. `useUnknownInCatchVariables` 解决什么问题？
11. 捕获到 `unknown` 后如何安全读取错误消息？
12. 自定义 Error 类怎么携带业务字段？
13. `cause` 适合解决什么问题？
14. 返回异常对象和抛异常有什么区别？
15. `Result<T, E>` 为什么比 `{ data?: T; error?: E }` 安全？
16. `Result` 的判别字段为什么重要？
17. `Option<T>` 表达什么，不表达什么？
18. 什么时候用 `Option`，什么时候用 `Result`？
19. `mapOption` 和 `flatMapOption` 有什么区别？
20. `unwrapOr` 为什么不应该太早调用？
21. 断言函数的 `asserts value is T` 做了什么？
22. 断言函数和类型断言有什么区别？
23. 为什么断言函数仍然必须写运行时检查？
24. `never` 如何帮助错误状态全面性检查？
25. 为什么新增错误类型后旧代码应该编译失败？
26. 哪些错误适合 throw，哪些错误适合 Result？
27. API 解析失败应该如何建模？
28. 表单验证失败应该如何建模？
29. 查找不到结果应该如何建模？
30. 为什么 TypeScript 不检查 checked exception？
31. 为什么 TypeScript 不能知道函数会抛出哪些异常？
32. 错误处理如何影响 React UI 状态建模？
33. 为什么 TypeScript 不会把函数可能 throw 的错误类型写进返回类型？
34. 为什么 `catch (error: SpecificError)` 不是安全写法？
35. `finally` 里为什么不应该随便 `return`？
36. `Promise<T>` 为什么只描述成功值，不描述 reject error 类型？
37. 什么时候应该用 `Promise<Result<T, E>>` 替代 async throw？
38. `mapResult` 和 `flatMapResult` 的区别是什么？

---

## 22. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)  
   重点读 `typeof` narrowing、truthiness narrowing、equality narrowing、`instanceof` narrowing、control flow analysis、type predicates、assertion functions、discriminated unions、`never` exhaustive checking。

2. [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)  
   复习 `null`、`undefined`、union types、type aliases、literal types。第 7 章里 `null`、`undefined`、`Result`、`Option` 都依赖这些基础。

3. [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)  
   复习函数返回类型、`void`、`never`、函数边界。错误处理最终都会体现在函数签名里。

4. [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)  
   重点读 `NonNullable`、`Extract`、`Exclude`、`ReturnType`。本章用它们辅助空值、错误联合和函数边界建模。

5. [TSConfig useUnknownInCatchVariables](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html)  
   理解为什么 `catch` 变量默认不应该被当成 `Error`，必须先缩小类型。

6. [TSConfig noImplicitReturns](https://www.typescriptlang.org/tsconfig/noImplicitReturns.html)  
   理解为什么函数所有代码路径都应该明确返回值。

7. [TSConfig strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html)  
   理解 `null` 和 `undefined` 为什么必须进入类型系统，而不是默认混入所有类型。

8. [MDN try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)  
   读 `try`、`catch`、`finally` 的运行时控制流，尤其是 `finally` 中控制流语句会影响前面的 `return` 或 `throw`。

9. [MDN Promise.prototype.catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)  
   理解 Promise rejection 的错误通道，以及为什么异步错误边界需要 `.catch()` 或 `await` + `try/catch`。

---

## 23. 第 7 章最终记忆模型

```txt
Error handling in JavaScript:
  return keeps normal control flow.
  throw interrupts normal control flow.
  catch receives any thrown value.
  finally runs cleanup after try starts.
  Error objects carry name, message, cause, and stack information.

Error handling in TypeScript:
  null and undefined force presence checks.
  unknown catch variables force error narrowing.
  Result makes success and failure explicit.
  Option makes presence and absence explicit.
  assertion functions connect runtime checks to type narrowing.
  never checks that all error states are handled.
  Promise rejection is a runtime failure channel.
  Promise<T> describes fulfillment value, not rejection error type.
  Promise<Result<T, E>> makes expected async failure visible.
```

### 最终一句话

```txt
第 3 章让你描述值的形状。
第 4 章让你描述行为的边界。
第 5 章让你描述对象的长期结构和抽象契约。
第 6 章让你理解类型系统如何比较、缩小、派生、转换和保护类型。
第 7 章让你把失败路径变成可读、可检查、可组合的代码结构。

真正的 TypeScript 错误处理，不是到处 try/catch，而是根据失败语义选择 null、undefined、throw、Error、Result 或 Option，并让调用者在类型系统里看见必须处理的失败。
```

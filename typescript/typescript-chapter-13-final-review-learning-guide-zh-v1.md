# TypeScript 第 13 章“总结与总复习”学习指导文件 v1

> 定位：这是 TypeScript 第 13 章“总结与总复习”的教学型学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件把第 2 章到第 12 章、附录和进阶补充内容串成一套完整的 TypeScript 操作模型，创建复习练习目录，写 `.ts` / `.tsx` / `.json` 文件，运行 `tsc`、观察类型检查结果，最后完成一个综合小项目。  
> 参考范围：《TypeScript Programming》第 13 章“总结”，TypeScript 官方 Handbook / Reference / TSConfig Reference，以及本项目中已经生成的 TypeScript 主线、补充和进阶指导文件。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：本章不是“把前面内容再列一遍”，而是把 TypeScript 学习路线压缩成可执行、可检查、可用于项目决策的总模型。

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
    - [00：TypeScript 总复习到底复习什么](#00typescript-总复习到底复习什么)
    - [01：语法、运行时和类型系统边界总复习](#01语法运行时和类型系统边界总复习)
    - [02：值、类型、变量和类型推断总复习](#02值类型变量和类型推断总复习)
    - [03：对象类型、接口、类型别名和结构化类型总复习](#03对象类型接口类型别名和结构化类型总复习)
    - [04：函数边界、泛型和重载总复习](#04函数边界泛型和重载总复习)
    - [05：类、接口、抽象类和运行时构造函数总复习](#05类接口抽象类和运行时构造函数总复习)
    - [06：联合类型、类型收窄和全面性检查总复习](#06联合类型类型收窄和全面性检查总复习)
    - [07：高级类型、类型运算符和实用类型总复习](#07高级类型类型运算符和实用类型总复习)
    - [08：错误建模、异步边界和 Result 模型总复习](#08错误建模异步边界和-result-模型总复习)
    - [09：模块、声明文件和 JavaScript 互操作总复习](#09模块声明文件和-javascript-互操作总复习)
    - [10：TSConfig、构建运行和项目边界总复习](#10tsconfig构建运行和项目边界总复习)
    - [11：框架、TSX、API contract 和运行时验证总复习](#11框架tsxapi-contract-和运行时验证总复习)
    - [12：项目级 TypeScript 决策清单](#12项目级-typescript-决策清单)
11. [10. 本章 API / 语法完整索引](#10-本章-api--语法完整索引)
12. [11. 本章常见错误总表](#11-本章常见错误总表)
13. [12. 最终小项目](#12-最终小项目)
14. [13. 额外 cheatsheet](#13-额外-cheatsheet)
15. [14. 最终文件清单](#14-最终文件清单)
16. [15. 最终学习笔记转换要求](#15-最终学习笔记转换要求)
17. [16. 本章最终要能回答的问题](#16-本章最终要能回答的问题)
18. [17. 本章最终记忆模型](#17-本章最终记忆模型)
19. [18. 官方文档阅读清单](#18-官方文档阅读清单)

---

## 0. 文件定位

### 结论

第 13 章不是新语法章节，而是 TypeScript 学完后的总整合章节。

它要把你前面学过的内容变成一套可以反复使用的工程判断模型：

```txt
source value
  -> inferred type
  -> explicit boundary type
  -> narrowing and validation
  -> domain logic
  -> module boundary
  -> build boundary
  -> runtime JavaScript
```

学完这章，你不只是知道某个语法怎么写，而是能回答：

```txt
这个类型该写在哪里？
这里该用 interface 还是 type？
这里为什么要从 unknown 开始？
这里类型检查能保证什么，不能保证什么？
这里需要运行时 validation 吗？
这里应该用泛型、联合类型、重载，还是拆函数？
这里的 tsconfig 是否适合当前项目？
这里的类型是否会拖慢项目或污染 public API？
```

### 本文件和前面章节的关系

```txt
第 2 章：
建立 TypeScript compiler、type checker、tsconfig、emit、runtime 的总模型。

第 3 章：
建立值和类型的关系，理解 primitive、object、array、tuple、enum、null、undefined、never。

第 4 章：
建立函数边界，理解参数、返回值、this、call/apply/bind、generator、overload、generic。

第 5 章：
建立 class/interface 边界，理解类的运行时值和类型系统身份。

第 6 章：
建立高级类型计算模型，理解 keyof、typeof、indexed access、mapped type、conditional type、infer。

第 7 章：
建立错误建模，理解 null、throw、return error、Option、Result 的项目取舍。

第 8 章：
建立异步类型边界，理解 Promise、async/await、async iterable、worker message typing。

第 9 章：
建立框架边界，理解 React/Angular/backend/API contract 中的类型职责。

第 10 章：
建立模块边界，理解 script/module、import/export、CommonJS/ESM、namespace、augmentation。

第 11 章：
建立 JavaScript 互操作边界，理解 .d.ts、declare、allowJs、checkJs、JSDoc、@types。

第 12 章：
建立构建运行边界，理解 rootDir/outDir、sourceMap、declaration、project references、npm publish。

补充章节：
建立现代 TS、TSX 深水区、工具链、库发布、Compiler API、类型性能、schema validation、monorepo 的项目能力。
```

---

## 1. 本章先解决什么问题

### 结论

本章先解决一个核心问题：

```txt
TypeScript 学完以后，如何把所有语法和配置变成项目里的判断能力？
```

学习 TypeScript 最容易出现两个极端：

```txt
极端 1：
只会写类型注解，但不知道类型系统边界在哪里。

极端 2：
沉迷高级类型，但不会设计稳定、清晰、可维护的项目类型边界。
```

第 13 章要让你从“知道类型语法”过渡到“能设计类型系统”。

### 这一章解决的开发问题

真实项目里，TypeScript 不只是检查变量类型。它会参与这些决策：

```txt
1. API response 是否可信。
2. 表单输入是否需要运行时验证。
3. domain model 是否应该暴露给 UI 层。
4. public API 是否应该暴露复杂条件类型。
5. React component props 是否应该允许 impossible state。
6. backend route handler 是否应该把 request body 当 unknown。
7. 库发布时 .d.ts 是否表达了真实外部 API。
8. monorepo 中 package boundary 是否和 TypeScript project references 一致。
9. tsconfig 是应用项目配置、库项目配置，还是测试项目配置。
10. 类型错误是应该修复、收窄、重构，还是用局部断言隔离。
```

### 不学清楚会导致什么混淆

```txt
把 type annotation 当成 runtime conversion。
把 interface 当成 JavaScript object。
把 type assertion 当成安全检查。
把 union 当成枚举值。
把 generic 当成 any 的高级写法。
把 overload 当成实现多个函数。
把 .d.ts 当成源码。
把 tsconfig 当成可随便复制的模板。
把 React props 类型当成组件架构本身。
把 schema validation 当成 TypeScript 类型系统的重复劳动。
```

---

## 2. 学习本章前必须补齐的前置概念

| 前置概念 | 必须理解到什么程度 | 如果不懂会影响什么 |
|---|---|---|
| JavaScript 值（value） | 知道运行时真正存在的是值，不是 TypeScript 类型 | 会误以为类型在运行时存在 |
| 对象（object） | 知道对象由属性组成，对象属性不等于变量 | 会混淆 object type、interface、props、API response |
| 函数（function） | 知道函数是值，调用时绑定参数并返回值 | 会看不懂函数类型、callback、handler、overload |
| 模块（module） | 知道模块有自己的作用域，import/export 建立模块边界 | 会混淆 script mode、module mode、type-only import |
| 异步（async） | 知道 Promise 表示未来值，async function 总是返回 Promise | 会写错 async return type 和 error boundary |
| DOM / Web API | 知道浏览器提供的外部数据和事件都不可信 | 会忽略 runtime validation |
| Node / package.json | 知道 Node 负责运行 JS，package.json 影响模块解析和发布 | 会混淆 tsc、Node、bundler 的职责 |
| TypeScript 编译期 | 知道类型检查发生在编译期，不改变运行时值 | 会滥用类型断言和泛型 |
| tsconfig | 知道配置文件定义项目、输入文件、输出方式和类型检查规则 | 会遇到 IDE 和 CLI 结果不一致 |

### 前置概念短示例：类型不是运行时值

### `typeValueBoundaryWarmup.ts`

```ts
// Goal:
// Verify that a TypeScript type is not a runtime value.

type ProductRecord = {
  id: string;
  price: number;
};

const productRecord: ProductRecord = {
  id: 'p-001',
  price: 99,
};

console.log(productRecord.id);
```

逐行解释：

- `type ProductRecord = ...` 创建的是类型别名（type alias），只存在于 TypeScript 编译期。
- `const productRecord` 创建的是 JavaScript 运行时变量。
- `: ProductRecord` 只让 TypeScript 检查对象形状，不会在运行时创建 `ProductRecord` 构造函数。
- 编译后的 JavaScript 中没有 `ProductRecord`。

错误对比：

### `typeValueBoundaryWarmupMistake.ts`

```ts
// Goal:
// Verify why a type alias cannot be used as a runtime value.

type ProductRecord = {
  id: string;
};

// @ts-expect-error ProductRecord is a type, not a value.
console.log(ProductRecord);
```

错误类型：TypeScript 类型错误。

原因：`ProductRecord` 位于类型空间（type space），不是值空间（value space）。`console.log()` 需要运行时值。

---

## 3. 本章学习目标

学完本章，你要达到这些目标：

```txt
1. 能把任意 TypeScript 问题归类到 syntax、runtime、type system、object model、module system、build system。
2. 能解释类型检查和 JavaScript 运行时之间的边界。
3. 能设计函数、对象、class、module、API、React component 的类型边界。
4. 能用 unknown、narrowing、schema validation 处理不可信输入。
5. 能用 union、generic、mapped type、conditional type 解决真实建模问题，而不是炫技。
6. 能判断什么时候该用 interface、type、class、abstract class、discriminated union、utility type。
7. 能读懂并修复常见 TypeScript error message。
8. 能配置基础应用、库项目、Node 项目、React 项目的 tsconfig。
9. 能解释 .d.ts、types、exports、moduleResolution、declaration、sourceMap 的职责。
10. 能完成一个从输入验证到 API contract、domain logic、UI state、构建检查的综合小项目。
```

---

## 4. 本章学习顺序

本章按这个顺序复习：

```txt
TypeScript 总模型
  -> 类型系统和运行时边界
  -> 值与类型推断
  -> 对象/interface/type/class
  -> 函数和泛型边界
  -> narrowing 与 discriminated union
  -> advanced type tools
  -> error and async modeling
  -> module and declaration boundary
  -> tsconfig and build boundary
  -> framework and validation boundary
  -> project decision checklist
  -> final mini project
```

不要按“语法速查”复习。应该按“项目边界”复习：

```txt
value boundary
function boundary
object boundary
class boundary
type computation boundary
error boundary
async boundary
module boundary
declaration boundary
build boundary
framework boundary
runtime validation boundary
package boundary
```

---

## 5. 本章核心术语表

| 中文术语 | English term | 所属层级 | 技术意义 | 容易混淆点 |
|---|---|---|---|---|
| 值 | value | runtime behavior | JavaScript 运行时真正存在并被操作的数据 | 容易和 TypeScript 类型混淆 |
| 类型 | type | TypeScript type system | 编译期对值形状、行为和可赋值性的描述 | 容易误以为运行时存在 |
| 类型空间 | type space | TypeScript type system | 存放 type、interface、type parameter 等类型名字的空间 | 容易和值空间混用 |
| 值空间 | value space | runtime behavior | 存放变量、函数、类、对象、模块值的空间 | 容易把 type alias 当值使用 |
| 类型推断 | type inference | TypeScript type system | TypeScript 根据初始化值、上下文和控制流推导类型 | 容易误以为所有类型都要手写 |
| 类型注解 | type annotation | syntax / type system | 显式告诉编译器某个边界期望的类型 | 容易误以为会转换运行时值 |
| 可赋值性 | assignability | TypeScript type system | 判断一个值类型能否赋给目标类型 | 容易和继承关系混淆 |
| 结构化类型 | structural typing | TypeScript type system | 按形状兼容，而不是按声明名兼容 | 容易和 nominal typing 混淆 |
| 类型收窄 | type narrowing | TypeScript control-flow analysis | 根据 if、typeof、in、discriminant 等运行时检查缩小类型 | 容易和类型断言混淆 |
| 类型断言 | type assertion | syntax / type system | 告诉编译器相信某个类型，不做运行时检查 | 容易滥用成“修复错误” |
| 泛型 | generic | TypeScript type system | 把类型关系参数化，让输入类型和输出类型保持联系 | 容易写成 any 的替代品 |
| 条件类型 | conditional type | TypeScript type computation | 在类型层根据可赋值关系分支计算类型 | 容易写出过度复杂类型 |
| 映射类型 | mapped type | TypeScript type computation | 遍历 key union 生成新对象类型 | 容易和运行时 map 混淆 |
| 声明文件 | declaration file | type declaration boundary | 用 `.d.ts` 描述已有 JavaScript 或库的外部类型形状 | 容易误以为包含运行时代码 |
| 项目配置 | tsconfig | build system / type system | 定义 TypeScript 项目、输入、输出、类型检查和模块解析 | 容易和 package.json 职责混淆 |
| 运行时验证 | runtime validation | runtime behavior | 在 JavaScript 运行时检查外部数据是否满足预期结构 | 容易误以为 TypeScript 类型已经保证外部数据 |
| 类型边界 | type boundary | architecture | 类型系统介入的位置，如函数参数、API contract、props、module export | 容易把类型写在内部实现细节上 |
| 公共 API 表面 | public API surface | package architecture | 外部使用者能 import 和依赖的类型和值 | 容易暴露过度复杂内部类型 |

---

## 6. 本章底层模型

### 结论

TypeScript 的总模型可以压成三层：

```txt
Layer 1: JavaScript runtime
  values, objects, functions, classes, modules, promises, DOM, Node

Layer 2: TypeScript compile time
  types, inference, assignability, narrowing, generics, declarations, diagnostics

Layer 3: Project architecture
  tsconfig, moduleResolution, build output, package boundary, validation boundary, framework boundary
```

### TypeScript 编译期流程

```txt
.ts / .tsx source files
  -> parse syntax
  -> bind symbols
  -> build type information
  -> infer types
  -> check assignability
  -> run control-flow narrowing
  -> produce diagnostics
  -> emit JavaScript and declaration files if enabled
```

### JavaScript 运行时流程

```txt
emitted .js files
  -> Node / browser / bundler runtime loads modules
  -> values are created
  -> functions are called
  -> objects and promises exist at runtime
  -> TypeScript types do not exist
```

### 工程边界流程

```txt
external input
  -> unknown
  -> runtime validation or narrowing
  -> domain type
  -> business logic
  -> typed result
  -> UI / API / storage / package export
```

### 最重要的总原则

```txt
TypeScript protects boundaries.
TypeScript does not magically make runtime data safe.
```

你应该主动寻找项目边界：

```txt
function parameter
return value
module export
API response
request body
form input
localStorage value
URLSearchParams value
React props
worker message
package public type
```

---

## 7. 推荐目录结构

在 TypeScript 学习项目中建立：

```txt
typescript/chapter-13-final-review/
  typescript-chapter-13-final-review-learning-guide-zh-v1.md

  00-final-review-model/
    typeSystemMap.ts
    runtimeBoundaryDemo.ts
    reviewChecklist.md
    typeValueBoundaryWarmup.ts
    typeValueBoundaryWarmupMistake.ts

  01-type-runtime-boundary/
    erasedTypeDemo.ts
    classValueTypeDualRole.ts
    assertionDoesNotValidate.ts

  02-values-inference/
    literalInferenceDemo.ts
    wideningVsConstDemo.ts
    satisfiesReviewDemo.ts

  03-object-type-boundary/
    interfaceVsTypeReview.ts
    structuralCompatibilityReview.ts
    excessPropertyReview.ts

  04-function-generic-boundary/
    callbackBoundaryReview.ts
    genericRelationshipReview.ts
    overloadImplementationReview.ts

  05-class-interface-boundary/
    classRuntimeReview.ts
    implementsCheckReview.ts
    abstractClassReview.ts

  06-union-narrowing-exhaustiveness/
    discriminatedUnionReview.ts
    exhaustiveSwitchReview.ts
    customTypeGuardReview.ts

  07-advanced-type-tools/
    keyofMappedTypeReview.ts
    conditionalInferReview.ts
    utilityTypeReview.ts

  08-error-async-modeling/
    resultTypeReview.ts
    asyncResultReview.ts
    promiseAwaitedReview.ts

  09-module-declaration-interop/
    typeOnlyImportReview.ts
    moduleAugmentationReview.ts
    declarationFileReview.d.ts
    declarationConsumer.ts

  10-tsconfig-build-boundary/
    app.ts
    tsconfig.app.json
    tsconfig.lib.json
    tsconfig.node.json
    packageBoundaryNotes.md

  11-framework-validation-boundary/
    apiContractReview.ts
    runtimeValidationReview.ts
    reactStateModelReview.tsx

  12-project-decision-checklist/
    typeBoundaryDecisionTable.md
    tsconfigDecisionTable.md
    publicApiDecisionTable.md
    serviceBoundaryDecisionReview.ts

  13-final-mini-project/
    package.json
    tsconfig.json
    src/contracts/orderContract.ts
    src/validation/orderValidator.ts
    src/domain/orderPricing.ts
    src/api/orderClient.ts
    src/ui/orderState.ts
    src/index.ts
    tests/orderReviewCases.ts
    README.md

  typescript-chapter-13-final-review-cheatsheet-zh-v1.md
```

说明：

```txt
1. 本次只生成 learning guide 文件。
2. cheatsheet 文件本章先列入目录规划，暂时不单独生成。
3. 所有练习文件都放在 chapter-13-final-review 内部，不新建平行 notes 目录。
4. 文件结构中列出的每个文件，都在正文中有对应的同名文件标题和代码块；对比写法和错误代码属于解释片段，不列入目录结构。
```

---

## 8. 运行方式

### 安装依赖

```bash
npm init -y
npm install -D typescript @types/node
```

如果运行 TSX 示例：

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

如果你后续要把 validation 示例换成 Zod：

```bash
npm install zod
```

本文件默认先使用手写 validator，避免第 13 章总复习被第三方库细节干扰。

### 推荐 tsconfig

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

### 常用命令

```bash
npx tsc --noEmit
npx tsc --showConfig
npx tsc --listFilesOnly
npx tsc --traceResolution
npx tsc --extendedDiagnostics
```

### 每个练习文件顶部注释模板

```ts
// Goal:
// Verify one TypeScript review concept.

// Expected result:
// Replace this text with the compiler result or runtime output.

export {};
```

---

## 9. 分节教学与训练内容

---

## 00：TypeScript 总复习到底复习什么

### 结论

TypeScript 总复习不是背语法，而是复习“边界设计”。

你要把每段代码都放进这个问题里：

```txt
这个位置是内部实现，还是外部边界？
```

内部实现可以更多依赖推断；外部边界应该更明确。

### 这一节解决什么问题

解决你学完很多语法之后不知道怎么整合的问题。TypeScript 不是每个地方都写最多类型，而是在关键边界写正确类型。

### 技术意义

项目中最关键的类型位置通常不是变量内部，而是：

```txt
module export
function parameter
function return value
API request
API response
React props
form input
storage value
package public API
```

这些位置一旦设计清楚，内部实现会被推断带着走。

### 概念解释

#### 内部实现（implementation detail）

函数内部的中间变量、局部临时对象、循环中的计算值。

#### 外部边界（external boundary）

调用者能接触到的位置，例如函数参数、返回值、模块导出、API contract。

### 语法、运行时、对象模型、类型系统边界

```txt
syntax:
  : TypeAnnotation, export, import, type, interface

runtime:
  JavaScript values, function calls, object properties

type system:
  inferred types, annotated boundaries, assignability, narrowing

architecture:
  package boundary, API boundary, UI boundary, validation boundary
```

### 底层机制

TypeScript 会检查值是否能通过边界：

```txt
caller value type
  -> assignability check
  -> parameter type
  -> function body checked under that type
  -> return expression type
  -> return type boundary
```

### API / 语法规则

本节没有新 API，重点是复习模型。

### 固定属性名 / 固定方法名 / 参数签名

本节没有固定 API。

### 文件结构

```txt
00-final-review-model/
  typeSystemMap.ts
  runtimeBoundaryDemo.ts
  reviewChecklist.md
```

### `typeSystemMap.ts`

```ts
// Goal:
// Verify why public boundaries should be explicit and internal values can be inferred.

export type ProductSummary = {
  id: string;
  label: string;
  finalPrice: number;
};

function applyDiscount(basePrice: number, discountRate: number) {
  const discountAmount = basePrice * discountRate;
  return basePrice - discountAmount;
}

export function createProductSummary(
  productId: string,
  productName: string,
  basePrice: number,
): ProductSummary {
  const finalPrice = applyDiscount(basePrice, 0.1);

  return {
    id: productId,
    label: productName.toUpperCase(),
    finalPrice,
  };
}
```

### 代码逐行解释

- `export type ProductSummary` 定义 public type boundary。外部模块可以依赖这个类型。
- `function applyDiscount(...)` 是内部 helper，没有导出。参数类型明确，返回值可以推断为 `number`。
- `export function createProductSummary(...)` 是 public function boundary，所以参数和返回值都显式标注。
- `const finalPrice` 是内部临时值，TypeScript 根据 `applyDiscount()` 返回值推断为 `number`。
- `return {...}` 被检查是否满足 `ProductSummary`。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
No TypeScript errors.
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 定义 `ProductSummary` | 创建类型别名 | 没有运行时代码 |
| 2 | 定义 `applyDiscount` | 检查参数和返回表达式 | 创建函数值 |
| 3 | 定义 `createProductSummary` | 检查 public boundary | 创建函数值 |
| 4 | 返回对象 | 检查对象是否满足 `ProductSummary` | 函数被调用时创建对象 |

### 变量和引用变化

```txt
productId:
  function parameter binding, runtime string value

finalPrice:
  local variable binding, runtime number value

ProductSummary:
  compile-time type alias, no runtime binding
```

### 为什么得到这个输出

因为所有返回字段都满足 `ProductSummary`：`id` 是 `string`，`label` 是 `string`，`finalPrice` 是 `number`。

### 对比写法

错误写法：

```ts
// Goal:
// Verify why an exported function should not hide an unstable return shape.

export function createProductSummary(productId: string, productName: string, basePrice: number) {
  return {
    id: productId,
    label: productName.toUpperCase(),
    priceText: String(basePrice),
  };
}
```

这段代码本身可能不报错，但 public API 的返回结构完全由推断暴露出去。后续你改字段名会直接影响调用方。

### 常见错误为什么错

错误：内部变量全都手写类型，public API 反而不写返回值。

原因：类型标注应该优先保护边界，而不是把实现细节写死。

正确策略：

```txt
internal local value:
  prefer inference.

exported function:
  prefer explicit return type.
```

### 和实际项目的关系

React component props、API client、domain service、library export 都是 public boundary，需要比普通局部变量更严格。

### 和当前学习主线的关系

这是整套 TypeScript 的总复习入口。后面每一节都在回答“这个类型边界应该怎么设计”。

### 最终记忆模型

```txt
Type annotations are most valuable at boundaries.
Inference is most valuable inside implementations.
```


### `runtimeBoundaryDemo.ts`

```ts
// Goal:
// Verify that a runtime value must be checked with runtime code.

type CustomerRecord = {
  id: string;
  email: string;
};

function isCustomerRecord(inputValue: unknown): inputValue is CustomerRecord {
  return (
    typeof inputValue === 'object' &&
    inputValue !== null &&
    'id' in inputValue &&
    typeof inputValue.id === 'string' &&
    'email' in inputValue &&
    typeof inputValue.email === 'string'
  );
}

const externalValue: unknown = {
  id: 'customer-001',
  email: 'ada@example.com',
};

if (isCustomerRecord(externalValue)) {
  console.log(externalValue.email);
}
```

### `reviewChecklist.md`

```md
# Final Review Checklist

## Boundary questions

- Is this value created inside the function?
- Is this value received from outside the program?
- Is this function exported?
- Is this type part of a public API?
- Does this data require runtime validation?
- Does this module export runtime values, types, or both?

## TypeScript questions

- Can inference describe the internal value clearly?
- Does the public boundary need an explicit return type?
- Should this input start as unknown?
- Should this state be modeled as a discriminated union?
- Should this relationship be modeled with a generic?
```

---

## 01：语法、运行时和类型系统边界总复习

### 结论

TypeScript 中最重要的复习能力是分清三件事：

```txt
语法怎么写。
编译器检查什么。
运行时实际存在什么。
```

### 这一节解决什么问题

解决“类型为什么不能打印”“interface 为什么不能 instanceof”“as 为什么不能验证数据”这些问题。

### 技术意义

很多 TypeScript 错误不是因为语法不会，而是因为你把编译期类型当成运行时值。

### 概念解释

#### 类型擦除（type erasure）

TypeScript 类型信息在编译成 JavaScript 后会被移除。

#### 值空间（value space）

JavaScript 运行时真正存在的名字，比如变量、函数、类、枚举运行时对象。

#### 类型空间（type space）

只给 TypeScript 编译器使用的名字，比如 type alias、interface、type parameter。

### 语法、运行时、对象模型、类型系统边界

| 写法 | 语法层 | 类型系统层 | 运行时层 |
|---|---|---|---|
| `type A = ...` | TypeScript syntax | 创建类型别名 | 不存在 |
| `interface A {}` | TypeScript syntax | 创建结构契约 | 不存在 |
| `class A {}` | JavaScript / TypeScript syntax | 创建实例类型和构造签名 | 存在构造函数 |
| `as A` | TypeScript syntax | 改变编译器视角 | 不验证值 |
| `typeof value` | JavaScript syntax | 可参与 narrowing | 运行时返回字符串 |
| `import type` | TypeScript syntax | 只导入类型 | emit 中移除 |

### 底层机制

```txt
TypeScript source
  -> type checker uses types
  -> emitter removes type-only syntax
  -> JavaScript runtime receives only values
```

### API / 语法规则

```ts
value as TypeName
```

含义：告诉 TypeScript 把 `value` 当作 `TypeName` 看待。

返回值：没有运行时返回值概念；这是编译期语法。

副作用：不会修改原值，不会验证属性，不会创建对象。

### 文件结构

```txt
01-type-runtime-boundary/
  erasedTypeDemo.ts
  classValueTypeDualRole.ts
  assertionDoesNotValidate.ts
```

### `classValueTypeDualRole.ts`

```ts
// Goal:
// Verify the difference between a type-only name and a runtime class name.

type OrderRecord = {
  id: string;
};

interface PaymentRecord {
  amount: number;
}

class InvoiceRecord {
  constructor(public invoiceId: string) {}
}

const invoiceRecord = new InvoiceRecord('inv-001');

console.log(invoiceRecord instanceof InvoiceRecord);
console.log(invoiceRecord.invoiceId);
```

### 代码逐行解释

- `type OrderRecord` 创建类型别名，只存在于编译期。
- `interface PaymentRecord` 创建接口，也只存在于编译期。
- `class InvoiceRecord` 同时创建运行时构造函数和类型系统中的实例类型。
- `new InvoiceRecord('inv-001')` 运行时调用构造函数，创建实例对象。
- `instanceof InvoiceRecord` 使用运行时构造函数检查原型链。

### 运行方式

```bash
npx tsc --noEmit
```

需要运行时输出时：

```bash
npx tsc
node dist/01-type-runtime-boundary/classValueTypeDualRole.js
```

### 预期输出

```txt
true
inv-001
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | `type OrderRecord` | 登记类型别名 | 不存在 |
| 2 | `interface PaymentRecord` | 登记接口 | 不存在 |
| 3 | `class InvoiceRecord` | 创建类型和构造签名 | 创建构造函数 |
| 4 | `new InvoiceRecord(...)` | 检查参数类型 | 创建对象 |
| 5 | `instanceof` | 检查表达式合法性 | 查原型链 |

### 变量和引用变化

```txt
invoiceRecord:
  runtime reference to an object created by InvoiceRecord

InvoiceRecord:
  runtime constructor function and compile-time type name

OrderRecord:
  compile-time only

PaymentRecord:
  compile-time only
```

### 为什么得到这个输出

`InvoiceRecord` 是 class，运行时存在构造函数，所以 `instanceof InvoiceRecord` 可以执行并返回 `true`。

### 对比写法

错误代码：

```ts
// Goal:
// Verify why an interface cannot be used with instanceof.

interface PaymentRecord {
  amount: number;
}

const paymentRecord = { amount: 20 };

// @ts-expect-error PaymentRecord is not a runtime value.
console.log(paymentRecord instanceof PaymentRecord);
```

### 常见错误为什么错

错误类型：TypeScript 类型错误。

原因：`PaymentRecord` 是 interface，只存在于类型空间。`instanceof` 右侧需要运行时构造函数。

正确写法：

```ts
// Goal:
// Verify a runtime predicate for a structural value.

interface PaymentRecord {
  amount: number;
}

function isPaymentRecord(inputValue: unknown): inputValue is PaymentRecord {
  return (
    typeof inputValue === 'object' &&
    inputValue !== null &&
    'amount' in inputValue &&
    typeof inputValue.amount === 'number'
  );
}
```

### 和实际项目的关系

API response、localStorage、URL query、form input 都是运行时数据。不能靠 interface 验证它们，必须用 runtime check 或 schema validation。

### 最终记忆模型

```txt
interface and type describe.
class exists.
as trusts.
runtime validation proves.
```


### `erasedTypeDemo.ts`

```ts
// Goal:
// Verify that type aliases and interfaces are erased from emitted JavaScript.

type AccountRecord = {
  id: string;
  balance: number;
};

interface AccountLabel {
  label: string;
}

const accountRecord: AccountRecord = {
  id: 'account-001',
  balance: 120,
};

const accountLabel: AccountLabel = {
  label: `account:${accountRecord.id}`,
};

console.log(accountLabel.label);
```

### `assertionDoesNotValidate.ts`

```ts
// Goal:
// Verify that a type assertion does not validate runtime data.

type SessionRecord = {
  token: string;
  expiresAt: number;
};

const externalValue: unknown = {
  token: 123,
  expiresAt: 'tomorrow',
};

const sessionRecord = externalValue as SessionRecord;

console.log(sessionRecord.token);
```

---

## 02：值、类型、变量和类型推断总复习

### 结论

TypeScript 会根据值的来源和上下文推断类型。总复习时要重点区分：

```txt
literal type
widened type
const assertion
contextual type
satisfies check
```

### 这一节解决什么问题

解决为什么有时 `'admin'` 被推断成字面量类型，有时变成 `string`；为什么 `as const` 会让对象变 readonly；为什么 `satisfies` 比直接类型注解更适合配置对象。

### 技术意义

类型推断决定了你后面能不能得到精确的联合类型、配置 key、路由名和组件 variant。

### 概念解释

#### 类型拓宽（type widening）

当 TypeScript 认为值后续可能变化时，会把字面量类型拓宽成更通用的类型。

#### 字面量类型（literal type）

具体值本身作为类型，例如 `'draft'`、`42`、`true`。

#### `satisfies`

检查表达式满足某个类型，同时保留表达式自身更精确的推断结果。

### 语法、运行时、对象模型、类型系统边界

```txt
const value = 'draft':
  runtime creates string value
  type system infers literal type 'draft'

let value = 'draft':
  runtime creates string value
  type system widens to string

as const:
  type system keeps literal and readonly shape
  runtime value is still normal JavaScript object

satisfies:
  type system checks shape
  runtime emits no validation code
```

### API / 语法规则

```ts
expression satisfies TargetType
```

含义：检查 `expression` 是否可赋给 `TargetType`，但不把表达式类型直接改成 `TargetType`。

返回值：运行时仍是原表达式。

副作用：无运行时副作用。

### 文件结构

```txt
02-values-inference/
  literalInferenceDemo.ts
  wideningVsConstDemo.ts
  satisfiesReviewDemo.ts
```

### `satisfiesReviewDemo.ts`

```ts
// Goal:
// Verify how satisfies checks object shape while preserving literal details.

type RouteConfig = Record<string, {
  path: string;
  requiresAuth: boolean;
}>;

const routeConfig = {
  home: {
    path: '/',
    requiresAuth: false,
  },
  dashboard: {
    path: '/dashboard',
    requiresAuth: true,
  },
} satisfies RouteConfig;

type RouteName = keyof typeof routeConfig;

function navigateTo(routeName: RouteName) {
  return routeConfig[routeName].path;
}

console.log(navigateTo('dashboard'));
```

### 代码逐行解释

- `type RouteConfig` 定义配置对象必须满足的形状。
- `const routeConfig = {...} satisfies RouteConfig` 让 TypeScript 检查对象值符合 `RouteConfig`。
- `satisfies` 不会把 `routeConfig` 的 key 拓宽成普通 `string`。
- `keyof typeof routeConfig` 提取真实对象 key，得到 `'home' | 'dashboard'`。
- `navigateTo(routeName: RouteName)` 只允许传入真实存在的 route name。
- `routeConfig[routeName].path` 根据 key 读取路径。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

编译检查：

```txt
No TypeScript errors.
```

运行输出：

```txt
/dashboard
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 创建 `RouteConfig` | 定义目标类型 | 不存在 |
| 2 | 创建 `routeConfig` | 检查对象满足 `RouteConfig` | 创建对象 |
| 3 | 创建 `RouteName` | 从对象类型提取 key union | 不存在 |
| 4 | 调用 `navigateTo` | 检查参数必须是 route key | 读取对象属性 |

### 变量和引用变化

```txt
routeConfig:
  runtime object reference

RouteConfig:
  compile-time shape contract

RouteName:
  compile-time union of keys
```

### 为什么得到这个输出

`'dashboard'` 是 `RouteName` 的合法成员，运行时读取 `routeConfig.dashboard.path`，得到 `'/dashboard'`。

### 对比写法

直接类型注解：

```ts
// Goal:
// Show how direct annotation can lose literal key precision in some designs.

type RouteConfig = Record<string, {
  path: string;
  requiresAuth: boolean;
}>;

const routeConfig: RouteConfig = {
  home: {
    path: '/',
    requiresAuth: false,
  },
};

type RouteName = keyof typeof routeConfig;
```

这里 `RouteName` 更容易退化为 `string`，因为 `routeConfig` 被整体注解成 `Record<string, ...>`。

### 常见错误为什么错

错误代码：

```ts
// Goal:
// Verify why an invalid route value fails with satisfies.

type RouteConfig = Record<string, {
  path: string;
  requiresAuth: boolean;
}>;

const routeConfig = {
  admin: {
    path: '/admin',
    // @ts-expect-error requiresAuth must be boolean.
    requiresAuth: 'yes',
  },
} satisfies RouteConfig;
```

错误类型：TypeScript 类型错误。

原因：`requiresAuth` 目标类型是 `boolean`，字符串 `'yes'` 不可赋给 `boolean`。

识别方式：配置对象需要“检查形状但保留精确信息”时，优先考虑 `satisfies`。

### 和实际项目的关系

路由表、权限表、feature flag、主题 token、API endpoint map 都适合用 `satisfies`。

### 最终记忆模型

```txt
annotation can reshape.
assertion can lie.
satisfies checks and preserves.
```


### `literalInferenceDemo.ts`

```ts
// Goal:
// Compare literal inference for const and widening for let.

const fixedStatus = 'draft';
let mutableStatus = 'draft';

mutableStatus = 'published';

console.log(fixedStatus);
console.log(mutableStatus);
```

### `wideningVsConstDemo.ts`

```ts
// Goal:
// Verify how as const keeps literal values and readonly properties.

const mutableConfig = {
  mode: 'dark',
  pageSize: 20,
};

const readonlyConfig = {
  mode: 'dark',
  pageSize: 20,
} as const;

type MutableMode = typeof mutableConfig.mode;
type ReadonlyMode = typeof readonlyConfig.mode;

const selectedMode: ReadonlyMode = 'dark';

console.log(selectedMode);
```

---

## 03：对象类型、接口、类型别名和结构化类型总复习

### 结论

对象类型复习的核心不是“interface 和 type 谁更好”，而是理解 TypeScript 按对象形状检查兼容性。

### 这一节解决什么问题

解决这几个高频混淆：

```txt
interface 和 type 有什么边界区别？
为什么额外属性有时能传，有时报错？
为什么两个没有继承关系的对象可以互相赋值？
为什么 class 实例也可以满足 interface？
```

### 技术意义

React props、API response、配置对象、service contract、domain entity 都依赖对象类型建模。

### 概念解释

#### 结构化类型系统（structural type system）

TypeScript 主要根据值的形状判断兼容性，而不是根据声明名称。

#### 额外属性检查（excess property check）

对象字面量直接赋给目标类型时，TypeScript 会更严格检查多余属性。

### 语法、运行时、对象模型、类型系统边界

```txt
interface:
  type system only, can merge declarations, good for object contracts.

type alias:
  type system only, can name unions, primitives, tuples, conditionals.

object literal:
  runtime value, TypeScript checks its shape.

class instance:
  runtime object, can structurally satisfy interface.
```

### API / 语法规则

```ts
interface InterfaceName {
  propertyName: PropertyType;
}

type TypeName = {
  propertyName: PropertyType;
};
```

本节没有运行时 API。

### 文件结构

```txt
03-object-type-boundary/
  interfaceVsTypeReview.ts
  structuralCompatibilityReview.ts
  excessPropertyReview.ts
```

### `structuralCompatibilityReview.ts`

```ts
// Goal:
// Verify structural compatibility and excess property checking.

interface ProductPreview {
  id: string;
  title: string;
}

const fullProductRecord = {
  id: 'p-001',
  title: 'Keyboard',
  stockCount: 12,
};

function renderProductPreview(productPreview: ProductPreview) {
  return `${productPreview.id}:${productPreview.title}`;
}

console.log(renderProductPreview(fullProductRecord));
```

### 代码逐行解释

- `interface ProductPreview` 定义需要 `id` 和 `title` 两个属性的结构契约。
- `fullProductRecord` 是运行时对象，包含三个属性。
- `renderProductPreview(productPreview: ProductPreview)` 要求参数至少有 `id` 和 `title`。
- `renderProductPreview(fullProductRecord)` 能通过，因为变量里的对象有目标类型需要的属性。
- `stockCount` 作为额外属性不会影响函数内部只读 `id` 和 `title`。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
p-001:Keyboard
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 定义 interface | 创建结构契约 | 不存在 |
| 2 | 创建对象 | 推断三个属性 | 创建对象 |
| 3 | 调用函数 | 检查对象是否至少有 `id` 和 `title` | 传入对象引用 |
| 4 | 字符串拼接 | 检查属性存在 | 读取属性 |

### 变量和引用变化

```txt
fullProductRecord:
  reference to object with id, title, stockCount

productPreview:
  parameter binding pointing to the same object

ProductPreview:
  compile-time structural contract
```

### 为什么得到这个输出

函数运行时读取的是同一个对象上的 `id` 和 `title` 属性，得到 `p-001` 和 `Keyboard`。

### 对比写法

对象字面量直接传参会触发额外属性检查：

```ts
// Goal:
// Verify why direct object literals trigger excess property checking.

interface ProductPreview {
  id: string;
  title: string;
}

function renderProductPreview(productPreview: ProductPreview) {
  return `${productPreview.id}:${productPreview.title}`;
}

renderProductPreview({
  id: 'p-001',
  title: 'Keyboard',
  // @ts-expect-error Object literal may only specify known properties.
  stockCount: 12,
});
```

### 常见错误为什么错

错误类型：TypeScript 类型错误。

原因：对象字面量直接出现在目标类型位置时，TypeScript 会检查是否写了目标类型没有声明的属性。这是为了捕获拼写错误和错误配置。

正确策略：

```txt
If the extra property is intentional:
  assign object to a variable first or change the target type.

If the extra property is a mistake:
  remove or rename the property.
```

### 和实际项目的关系

组件 props 和配置对象中，额外属性检查能帮你发现拼写错误；API response 变量中，额外字段常常是允许存在的。

### 最终记忆模型

```txt
TypeScript checks shape.
Fresh object literals are checked more strictly.
```


### `interfaceVsTypeReview.ts`

```ts
// Goal:
// Compare interface for object contracts and type alias for unions.

interface ProductCardProps {
  id: string;
  title: string;
}

type ProductCardState =
  | { status: 'hidden' }
  | { status: 'visible'; props: ProductCardProps };

const cardState: ProductCardState = {
  status: 'visible',
  props: {
    id: 'product-001',
    title: 'Keyboard',
  },
};

console.log(cardState.status);
```

### `excessPropertyReview.ts`

```ts
// Goal:
// Verify excess property checking on fresh object literals.

type CheckoutItem = {
  productId: string;
  quantity: number;
};

function acceptCheckoutItem(item: CheckoutItem) {
  return item.quantity;
}

const storedItem = {
  productId: 'product-001',
  quantity: 2,
  note: 'gift',
};

console.log(acceptCheckoutItem(storedItem));

acceptCheckoutItem({
  productId: 'product-002',
  quantity: 1,
  // @ts-expect-error Object literal may only specify known properties.
  note: 'gift',
});
```

---

## 04：函数边界、泛型和重载总复习

### 结论

函数类型复习的核心是：参数类型描述调用者必须给什么，返回类型描述调用者能拿到什么，泛型描述输入和输出之间的类型关系。

### 这一节解决什么问题

解决以下问题：

```txt
为什么 generic 不是 any？
什么时候写 overload？
为什么 overload implementation 不能直接暴露？
为什么 callback 参数类型很重要？
```

### 技术意义

真实项目中，函数是所有边界的基础：event handler、API client、validator、hook、middleware、service 都是函数边界。

### 概念解释

#### 泛型（generic）

泛型不是“不知道类型”，而是“让调用时的具体类型参与类型关系”。

#### 函数重载（function overload）

重载用于表达同一个函数对不同调用方式返回不同类型。

### 语法、运行时、对象模型、类型系统边界

```txt
generic type parameter:
  compile-time placeholder bound during call inference.

overload signatures:
  compile-time call contracts.

implementation signature:
  actual JavaScript function body.
```

### API / 语法规则

```ts
function functionName<TypeParameter>(inputValue: TypeParameter): TypeParameter
```

```ts
function readValue(input: string): string;
function readValue(input: number): number;
function readValue(input: string | number) {
  return input;
}
```

### 文件结构

```txt
04-function-generic-boundary/
  callbackBoundaryReview.ts
  genericRelationshipReview.ts
  overloadImplementationReview.ts
```

### `genericRelationshipReview.ts`

```ts
// Goal:
// Verify that a generic preserves the relationship between input and output.

type ApiEnvelope<Payload> = {
  status: 'success';
  payload: Payload;
};

function createApiEnvelope<Payload>(payload: Payload): ApiEnvelope<Payload> {
  return {
    status: 'success',
    payload,
  };
}

const productEnvelope = createApiEnvelope({
  id: 'p-001',
  title: 'Keyboard',
});

console.log(productEnvelope.payload.title);
```

### 代码逐行解释

- `type ApiEnvelope<Payload>` 定义泛型类型，`Payload` 是类型参数。
- `payload: Payload` 表示 `payload` 属性的类型由调用者传入的值决定。
- `createApiEnvelope<Payload>(payload: Payload)` 建立输入参数和返回对象之间的类型关系。
- 调用 `createApiEnvelope({...})` 时，TypeScript 从对象字面量推断 `Payload`。
- `productEnvelope.payload.title` 能访问，因为 `Payload` 被推断为包含 `title` 的对象类型。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
Keyboard
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 定义泛型类型 | 创建类型模板 | 不存在 |
| 2 | 定义泛型函数 | 创建调用时类型关系 | 创建函数值 |
| 3 | 调用函数 | 推断 `Payload` | 创建 envelope 对象 |
| 4 | 读取 payload | 检查属性存在 | 读取属性 |

### 变量和引用变化

```txt
Payload:
  compile-time type parameter

payload:
  runtime parameter value

productEnvelope:
  runtime object with status and payload
```

### 为什么得到这个输出

泛型让返回类型保留了输入 payload 的具体对象形状，所以 `title` 在类型系统里可见，运行时也存在。

### 对比写法

错误写法：

```ts
// Goal:
// Verify why any loses the relationship between input and output.

type ApiEnvelope = {
  status: 'success';
  payload: any;
};

function createApiEnvelope(payload: any): ApiEnvelope {
  return {
    status: 'success',
    payload,
  };
}

const productEnvelope = createApiEnvelope({
  id: 'p-001',
  title: 'Keyboard',
});

console.log(productEnvelope.payload.missing.deep.value);
```

这可能通过类型检查，但运行时会崩。`any` 破坏了输入和输出的类型关系。

### 常见错误为什么错

错误：把泛型当成 “更高级的 any”。

原因：`any` 是放弃检查；泛型是保留类型关系。

正确识别：

```txt
Use generic when output type depends on input type.
Use unknown when input is untrusted.
Use any only when you intentionally opt out of checking.
```

### 和实际项目的关系

API client、data loader、repository、React custom hook 经常需要泛型保留输入输出关系。

### 最终记忆模型

```txt
any forgets.
unknown forces proof.
generic preserves relationships.
```


### `callbackBoundaryReview.ts`

```ts
// Goal:
// Verify callback parameter and return type boundaries.

type ProductRecord = {
  id: string;
  price: number;
};

function filterProducts(
  productRecords: ProductRecord[],
  predicate: (productRecord: ProductRecord) => boolean,
): ProductRecord[] {
  return productRecords.filter(predicate);
}

const discountedProducts = filterProducts(
  [
    { id: 'product-001', price: 80 },
    { id: 'product-002', price: 120 },
  ],
  (productRecord) => productRecord.price < 100,
);

console.log(discountedProducts.length);
```

### `overloadImplementationReview.ts`

```ts
// Goal:
// Verify overload signatures and implementation signature.

function normalizeIdentifier(inputValue: string): string;
function normalizeIdentifier(inputValue: number): string;
function normalizeIdentifier(inputValue: string | number): string {
  if (typeof inputValue === 'number') {
    return `id-${inputValue}`;
  }

  return inputValue.trim().toLowerCase();
}

console.log(normalizeIdentifier(' Product-001 '));
console.log(normalizeIdentifier(42));
```

---

## 05：类、接口、抽象类和运行时构造函数总复习

### 结论

TypeScript 中 class 是双重身份：它既是运行时构造函数，也是类型系统里的实例类型来源。

### 这一节解决什么问题

解决这些混淆：

```txt
class 和 interface 谁在运行时存在？
implements 是否会改变 class 的运行时行为？
abstract class 和 interface 怎么选？
private/protected 对结构化类型有什么影响？
```

### 技术意义

类在框架、服务对象、错误类型、SDK client、domain model 中仍然常见。理解 class 的运行时身份，能防止把类型检查当成继承实现。

### 概念解释

#### `implements`

`implements` 只检查 class 实例是否满足 interface，不会复制方法，不会改变原型链。

#### 抽象类（abstract class）

抽象类可以包含实现，也可以定义必须由子类实现的抽象成员。它有运行时基类输出。

### 语法、运行时、对象模型、类型系统边界

```txt
class:
  runtime constructor + prototype methods + instance type

interface:
  compile-time object contract

implements:
  compile-time check only

extends:
  runtime prototype inheritance + type relationship
```

### API / 语法规则

```ts
class Child extends Parent implements Contract {
  override methodName() {}
}
```

固定关键字：

```txt
class
extends
implements
abstract
override
public
private
protected
readonly
static
```

### 文件结构

```txt
05-class-interface-boundary/
  classRuntimeReview.ts
  implementsCheckReview.ts
  abstractClassReview.ts
```

### `implementsCheckReview.ts`

```ts
// Goal:
// Verify how implements checks a class without changing runtime behavior.

interface PriceFormatter {
  formatPrice(amount: number): string;
}

class CurrencyPriceFormatter implements PriceFormatter {
  constructor(private readonly currencyCode: string) {}

  formatPrice(amount: number): string {
    return `${this.currencyCode} ${amount.toFixed(2)}`;
  }
}

const priceFormatter = new CurrencyPriceFormatter('USD');

console.log(priceFormatter.formatPrice(25));
```

### 代码逐行解释

- `interface PriceFormatter` 定义实例需要有 `formatPrice(amount: number): string`。
- `class CurrencyPriceFormatter implements PriceFormatter` 让 TypeScript 检查类实例是否满足接口。
- `constructor(private readonly currencyCode: string)` 是参数属性（parameter property），会创建实例属性。
- `formatPrice(amount: number): string` 是原型方法。
- `new CurrencyPriceFormatter('USD')` 运行时创建实例对象。
- `formatPrice(25)` 调用实例方法，`this` 指向 `priceFormatter`。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
USD 25.00
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 定义 interface | 创建实例契约 | 不存在 |
| 2 | 定义 class | 检查 implements | 创建构造函数和 prototype 方法 |
| 3 | new class | 检查构造参数 | 创建对象并写入属性 |
| 4 | 调用方法 | 检查参数和返回值 | 读取 this.currencyCode |

### 变量和引用变化

```txt
priceFormatter:
  reference to CurrencyPriceFormatter instance

currencyCode:
  private readonly instance property

PriceFormatter:
  compile-time interface only
```

### 为什么得到这个输出

实例属性 `currencyCode` 保存 `'USD'`，`amount.toFixed(2)` 返回 `'25.00'`，模板字符串拼接成 `'USD 25.00'`。

### 对比写法

错误代码：

```ts
// Goal:
// Verify that implements does not copy missing methods.

interface PriceFormatter {
  formatPrice(amount: number): string;
}

// @ts-expect-error Class incorrectly implements interface.
class BrokenPriceFormatter implements PriceFormatter {
  constructor(private readonly currencyCode: string) {}
}
```

### 常见错误为什么错

错误类型：TypeScript 类型错误。

原因：`implements` 要求 class 实例结构中存在 `formatPrice` 方法，但 class 没有定义这个方法。

识别方式：看到 “incorrectly implements interface” 时，检查 class 实例成员，不要以为 interface 会自动提供实现。

### 和实际项目的关系

抽象类适合共享实现；interface 适合只描述边界。service contract 多用 interface，带共享逻辑的基类才用 abstract class。

### 最终记忆模型

```txt
implements checks.
extends inherits.
interface disappears.
class remains.
```


### `classRuntimeReview.ts`

```ts
// Goal:
// Verify that a class creates a runtime constructor and prototype method.

class ProductEntity {
  constructor(
    public readonly id: string,
    private title: string,
  ) {}

  createLabel(): string {
    return `${this.id}:${this.title}`;
  }
}

const productEntity = new ProductEntity('product-001', 'Keyboard');

console.log(productEntity instanceof ProductEntity);
console.log(productEntity.createLabel());
```

### `abstractClassReview.ts`

```ts
// Goal:
// Compare abstract base behavior with subclass implementation.

abstract class BaseRepository<RecordValue> {
  protected constructor(private readonly resourceName: string) {}

  createResourceLabel(): string {
    return `resource:${this.resourceName}`;
  }

  abstract findById(recordId: string): Promise<RecordValue | null>;
}

type ProductRecord = {
  id: string;
  title: string;
};

class ProductRepository extends BaseRepository<ProductRecord> {
  constructor() {
    super('products');
  }

  override async findById(recordId: string): Promise<ProductRecord | null> {
    return {
      id: recordId,
      title: 'Keyboard',
    };
  }
}

const productRepository = new ProductRepository();

console.log(productRepository.createResourceLabel());
```

---

## 06：联合类型、类型收窄和全面性检查总复习

### 结论

联合类型（union type）只有和类型收窄（narrowing）一起使用才有工程价值。总复习时要把它们和状态机、错误处理、API response 连接起来。

### 这一节解决什么问题

解决为什么不能直接访问 union 中某个成员特有属性，以及为什么 discriminated union 是 React state 和 API result 的核心建模方式。

### 技术意义

联合类型能表达“值可能处于多个状态之一”。全面性检查能防止新增状态后漏处理。

### 概念解释

#### 判别联合（discriminated union）

每个成员共享一个固定字段，例如 `status`、`kind`、`type`，用这个字段区分成员。

#### 全面性检查（exhaustiveness checking）

确保所有联合成员都被处理。如果新增成员但 switch 没更新，编译器能提醒。

### 语法、运行时、对象模型、类型系统边界

```txt
runtime:
  normal objects with status property.

type system:
  union members are narrowed by checking status.

control flow:
  switch/if changes the visible type in each branch.
```

### API / 语法规则

本节没有新 API，重点是语言机制。

固定模式：

```ts
switch (value.status) {
  case 'loading':
    return ...;
  default: {
    const neverValue: never = value;
    return neverValue;
  }
}
```

### 文件结构

```txt
06-union-narrowing-exhaustiveness/
  discriminatedUnionReview.ts
  exhaustiveSwitchReview.ts
  customTypeGuardReview.ts
```

### `discriminatedUnionReview.ts`

```ts
// Goal:
// Verify discriminated union narrowing and exhaustive checking.

type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; records: string[] }
  | { status: 'failure'; errorMessage: string };

function renderRequestState(requestState: RequestState): string {
  switch (requestState.status) {
    case 'idle':
      return 'Idle';
    case 'loading':
      return 'Loading';
    case 'success':
      return requestState.records.join(',');
    case 'failure':
      return requestState.errorMessage;
    default: {
      const unreachableState: never = requestState;
      return unreachableState;
    }
  }
}

console.log(renderRequestState({ status: 'success', records: ['A', 'B'] }));
```

### 代码逐行解释

- `RequestState` 是 union type，每个成员都有 `status` 字段。
- `renderRequestState(requestState: RequestState)` 接收四种状态之一。
- `switch (requestState.status)` 触发控制流收窄。
- 在 `case 'success'` 中，TypeScript 知道 `requestState` 有 `records`。
- 在 `case 'failure'` 中，TypeScript 知道 `requestState` 有 `errorMessage`。
- `const unreachableState: never = requestState` 用于全面性检查。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
A,B
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 创建 union type | 登记四种状态 | 不存在 |
| 2 | 调用函数 | 检查参数符合一个成员 | 传入对象 |
| 3 | switch status | 每个 case 收窄类型 | 比较字符串 |
| 4 | success 分支 | 允许访问 `records` | join 数组 |
| 5 | default 分支 | 检查是否 never | 当前不会执行 |

### 变量和引用变化

```txt
requestState:
  starts as RequestState
  narrows to success member inside success branch

unreachableState:
  should only accept never
```

### 为什么得到这个输出

传入对象的 `status` 是 `'success'`，进入 success 分支，读取 `records` 并调用 `join(',')`。

### 对比写法

错误代码：

```ts
// Goal:
// Verify why union-specific properties require narrowing.

type RequestState =
  | { status: 'success'; records: string[] }
  | { status: 'failure'; errorMessage: string };

function renderRequestState(requestState: RequestState): string {
  // @ts-expect-error records does not exist on every union member.
  return requestState.records.join(',');
}
```

### 常见错误为什么错

错误类型：TypeScript 类型错误。

原因：`RequestState` 可能是 failure 成员，failure 成员没有 `records` 属性。访问 union 成员属性前必须先收窄。

正确写法：检查 `status` 后再访问。

### 和实际项目的关系

React `useState` 里的 loading/success/failure，API response 的 ok/error，表单的 clean/dirty/submitting/submitted 都适合判别联合。

### 最终记忆模型

```txt
Union models possibility.
Narrowing proves current case.
Never protects future changes.
```


### `exhaustiveSwitchReview.ts`

```ts
// Goal:
// Verify that never catches missing union members.

type PaymentState =
  | { status: 'pending' }
  | { status: 'paid'; receiptId: string }
  | { status: 'failed'; reason: string };

function renderPaymentState(paymentState: PaymentState): string {
  switch (paymentState.status) {
    case 'pending':
      return 'Pending';
    case 'paid':
      return paymentState.receiptId;
    case 'failed':
      return paymentState.reason;
    default: {
      const unreachableState: never = paymentState;
      return unreachableState;
    }
  }
}

console.log(renderPaymentState({ status: 'paid', receiptId: 'receipt-001' }));
```

### `customTypeGuardReview.ts`

```ts
// Goal:
// Verify a custom type guard for unknown input.

type ProductRecord = {
  id: string;
  title: string;
};

function isProductRecord(inputValue: unknown): inputValue is ProductRecord {
  return (
    typeof inputValue === 'object' &&
    inputValue !== null &&
    'id' in inputValue &&
    typeof inputValue.id === 'string' &&
    'title' in inputValue &&
    typeof inputValue.title === 'string'
  );
}

const inputValue: unknown = {
  id: 'product-001',
  title: 'Keyboard',
};

if (isProductRecord(inputValue)) {
  console.log(inputValue.title);
}
```

---

## 07：高级类型、类型运算符和实用类型总复习

### 结论

高级类型的价值不是让类型变复杂，而是减少重复并保证类型之间的关系一致。

### 这一节解决什么问题

解决这些问题：

```txt
什么时候用 keyof？
什么时候用 typeof？
什么时候用 indexed access？
什么时候用 mapped type？
什么时候用 conditional type？
什么时候不要用高级类型？
```

### 技术意义

真实项目中，API map、form field、config、component variants、library public types 都会用到类型运算符。

### 概念解释

#### `keyof`

从对象类型中取出属性名 union。

#### 类型位置的 `typeof`

从运行时值提取静态类型。

#### 索引访问类型（indexed access type）

用 `T[K]` 提取属性值类型。

#### 映射类型（mapped type）

遍历 key union 生成新对象类型。

#### 条件类型（conditional type）

基于类型可赋值关系进行类型层分支。

### 语法、运行时、对象模型、类型系统边界

```txt
keyof, typeof in type position, T[K], mapped type, conditional type:
  compile-time only.

Object.keys, value[key]:
  runtime operations.
```

### API / 语法规则

```ts
type Keys = keyof SomeType;
type ValueType = SomeType[KeyType];
type Flags<T> = { [Key in keyof T]: boolean };
type UnwrapPromise<T> = T extends Promise<infer Value> ? Value : T;
```

### 文件结构

```txt
07-advanced-type-tools/
  keyofMappedTypeReview.ts
  conditionalInferReview.ts
  utilityTypeReview.ts
```

### `keyofMappedTypeReview.ts`

```ts
// Goal:
// Verify how keyof and indexed access types keep API names and payloads connected.

type EndpointMap = {
  getProduct: {
    request: { id: string };
    response: { id: string; title: string };
  };
  searchProducts: {
    request: { query: string };
    response: { items: Array<{ id: string; title: string }> };
  };
};

type EndpointName = keyof EndpointMap;
type EndpointRequest<Name extends EndpointName> = EndpointMap[Name]['request'];
type EndpointResponse<Name extends EndpointName> = EndpointMap[Name]['response'];

function createRequest<Name extends EndpointName>(
  endpointName: Name,
  requestPayload: EndpointRequest<Name>,
): EndpointResponse<Name> {
  console.log(endpointName, requestPayload);
  throw new Error('Network implementation is not included');
}
```

### 代码逐行解释

- `EndpointMap` 定义 endpoint 名称到 request/response 的映射。
- `EndpointName = keyof EndpointMap` 得到 `'getProduct' | 'searchProducts'`。
- `EndpointRequest<Name>` 根据 endpoint name 提取对应 request 类型。
- `EndpointResponse<Name>` 根据 endpoint name 提取对应 response 类型。
- `createRequest<Name extends EndpointName>` 用泛型把 endpoint name 和 payload 类型绑定。
- `requestPayload: EndpointRequest<Name>` 要求请求体和 endpoint 对应。
- `EndpointResponse<Name>` 表达返回值和 endpoint 对应。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
No TypeScript errors.
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 定义 `EndpointMap` | 创建类型映射 | 不存在 |
| 2 | 提取 `EndpointName` | 生成 key union | 不存在 |
| 3 | 定义 helper types | 根据 key 提取类型 | 不存在 |
| 4 | 定义函数 | 检查泛型关系 | 创建函数值 |

### 变量和引用变化

```txt
Name:
  compile-time type parameter

endpointName:
  runtime string argument

requestPayload:
  runtime object argument checked against EndpointRequest<Name>
```

### 为什么得到这个输出

这个示例只做类型检查。函数体里抛错是为了避免假装网络实现已经存在。

### 对比写法

错误代码：

```ts
// Goal:
// Verify why endpoint request payload should depend on endpoint name.

type EndpointMap = {
  getProduct: {
    request: { id: string };
    response: { id: string; title: string };
  };
};

type EndpointName = keyof EndpointMap;
type EndpointRequest<Name extends EndpointName> = EndpointMap[Name]['request'];

function createRequest<Name extends EndpointName>(
  endpointName: Name,
  requestPayload: EndpointRequest<Name>,
) {
  return { endpointName, requestPayload };
}

createRequest('getProduct', {
  // @ts-expect-error getProduct requires id, not query.
  query: 'keyboard',
});
```

### 常见错误为什么错

错误类型：TypeScript 类型错误。

原因：`Name` 被推断为 `'getProduct'`，所以 `EndpointRequest<Name>` 是 `{ id: string }`。`query` 不是合法字段。

### 和实际项目的关系

这类类型模型适合 API client、route map、event map、command map。它能防止 endpoint 名和 payload 类型失配。

### 何时不要用高级类型

不要为了“自动化一切”写过度复杂类型。如果一个类型让 hover 巨长、错误难懂、编译变慢，优先拆成命名 type alias 或直接写清楚 public type。

### 最终记忆模型

```txt
Use advanced types to preserve relationships.
Do not use advanced types to hide architecture.
```


### `conditionalInferReview.ts`

```ts
// Goal:
// Verify conditional types and infer for async return values.

type AsyncReturnValue<FunctionValue> =
  FunctionValue extends (...args: never[]) => Promise<infer Value>
    ? Value
    : never;

async function loadProductTitle(productId: string): Promise<string> {
  return `product:${productId}`;
}

type LoadedTitle = AsyncReturnValue<typeof loadProductTitle>;

const titleText: LoadedTitle = 'product:product-001';

console.log(titleText);
```

### `utilityTypeReview.ts`

```ts
// Goal:
// Review utility types for public and internal type boundaries.

type ProductRecord = {
  id: string;
  title: string;
  price: number;
  internalCost: number;
};

type PublicProductRecord = Omit<ProductRecord, 'internalCost'>;
type ProductPatch = Partial<Pick<ProductRecord, 'title' | 'price'>>;
type ReadonlyProductRecord = Readonly<PublicProductRecord>;

const publicProduct: ReadonlyProductRecord = {
  id: 'product-001',
  title: 'Keyboard',
  price: 99,
};

const productPatch: ProductPatch = {
  price: 89,
};

console.log(publicProduct.title);
console.log(productPatch.price);
```

---

## 08：错误建模、异步边界和 Result 模型总复习

### 结论

TypeScript 不能强制你处理 thrown exception，但可以帮你建模显式返回的错误结果。异步函数中最稳定的边界通常是：

```txt
Promise<Result<Success, Failure>>
```

### 这一节解决什么问题

解决这些问题：

```txt
为什么 throw 不出现在函数返回类型里？
catch 里的 error 为什么应该是 unknown？
Promise<T> 的 T 是成功值还是错误值？
API client 应该 throw 还是返回 Result？
```

### 技术意义

前端项目中的请求、表单提交、权限校验、订单创建都需要明确错误状态。错误如果只靠 throw，很容易在 UI 层漏处理。

### 概念解释

#### `Result`

用判别联合表达成功或失败。

#### `Awaited<T>`

模拟 `await` 对 Promise-like 类型的递归解包。

#### `useUnknownInCatchVariables`

让 `catch (error)` 中的 `error` 默认为 `unknown`，迫使你先检查再使用。

### 语法、运行时、对象模型、类型系统边界

```txt
async function:
  runtime always returns Promise.

type Result:
  compile-time model of success/failure shape.

catch error:
  runtime can be any thrown value.
  type system should treat it as unknown.
```

### API / 语法规则

```ts
type Result<Success, Failure> =
  | { ok: true; value: Success }
  | { ok: false; error: Failure };
```

```ts
type AwaitedValue = Awaited<Promise<string>>;
```

### 文件结构

```txt
08-error-async-modeling/
  resultTypeReview.ts
  asyncResultReview.ts
  promiseAwaitedReview.ts
```

### `asyncResultReview.ts`

```ts
// Goal:
// Verify async Result modeling for API-like work.

type Result<Success, Failure> =
  | { ok: true; value: Success }
  | { ok: false; error: Failure };

type ProductRecord = {
  id: string;
  title: string;
};

type ProductLoadError = {
  code: 'not_found' | 'network_failure';
  message: string;
};

async function loadProduct(productId: string): Promise<Result<ProductRecord, ProductLoadError>> {
  if (productId === 'missing') {
    return {
      ok: false,
      error: {
        code: 'not_found',
        message: 'Product was not found',
      },
    };
  }

  return {
    ok: true,
    value: {
      id: productId,
      title: 'Keyboard',
    },
  };
}

async function renderProduct(productId: string) {
  const productResult = await loadProduct(productId);

  if (!productResult.ok) {
    return productResult.error.message;
  }

  return productResult.value.title;
}
```

### 代码逐行解释

- `Result<Success, Failure>` 定义成功和失败两种形状。
- `ProductRecord` 是成功数据类型。
- `ProductLoadError` 是失败数据类型。
- `loadProduct(...)` 是 async function，返回 `Promise<Result<...>>`。
- `productId === 'missing'` 时返回失败对象。
- 成功时返回 `ok: true` 和 `value`。
- `renderProduct` 中 `await` 后得到 `Result`。
- `if (!productResult.ok)` 收窄到失败分支。
- if 后剩余分支中 TypeScript 知道 `productResult` 是成功分支。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
No TypeScript errors.
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 调用 async function | 返回类型是 `Promise<Result<...>>` | 创建 Promise |
| 2 | `await loadProduct` | 解包成功 fulfilled value | 等待 Promise 完成 |
| 3 | 检查 `ok` | 收窄 union | 判断布尔值 |
| 4 | 失败分支 | 允许访问 `error` | 返回 message |
| 5 | 成功分支 | 允许访问 `value` | 返回 title |

### 变量和引用变化

```txt
productResult:
  starts as Result<ProductRecord, ProductLoadError>
  narrows to failure when ok is false
  narrows to success after failure branch returns
```

### 为什么得到这个输出

类型系统能通过 `ok` 字段判断当前分支，所以能安全访问 `error` 或 `value`。

### 对比写法

错误代码：

```ts
// Goal:
// Verify why a Result must be narrowed before accessing value.

type Result<Success, Failure> =
  | { ok: true; value: Success }
  | { ok: false; error: Failure };

declare const productResult: Result<{ title: string }, { message: string }>;

// @ts-expect-error value does not exist on every Result member.
console.log(productResult.value.title);
```

### 常见错误为什么错

错误类型：TypeScript 类型错误。

原因：`productResult` 可能是失败分支，失败分支没有 `value`。

正确写法：先检查 `ok`。

### 和实际项目的关系

API client 返回 `Result` 可以让 UI 层必须处理失败状态。React state 可以直接存这个 Result 或转换为 UI state union。

### 最终记忆模型

```txt
Promise models time.
Result models success or failure.
Narrowing makes one branch safe.
```


### `resultTypeReview.ts`

```ts
// Goal:
// Verify a synchronous Result boundary.

type Result<Success, Failure> =
  | { ok: true; value: Success }
  | { ok: false; error: Failure };

function parseQuantity(inputValue: string): Result<number, string> {
  const parsedValue = Number(inputValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return {
      ok: false,
      error: 'Expected a positive integer',
    };
  }

  return {
    ok: true,
    value: parsedValue,
  };
}

const quantityResult = parseQuantity('3');

if (quantityResult.ok) {
  console.log(quantityResult.value);
}
```

### `promiseAwaitedReview.ts`

```ts
// Goal:
// Verify Awaited with nested Promise values.

type NestedPromiseValue = Promise<Promise<{ id: string }>>;
type ResolvedValue = Awaited<NestedPromiseValue>;

const resolvedValue: ResolvedValue = {
  id: 'record-001',
};

console.log(resolvedValue.id);
```

---

## 09：模块、声明文件和 JavaScript 互操作总复习

### 结论

模块边界决定值怎么被加载，声明文件决定类型怎么被看见。它们是两条相关但不同的线。

### 这一节解决什么问题

解决这些问题：

```txt
为什么 import type 不出现在运行时代码里？
为什么 .d.ts 不能实现函数？
为什么 moduleResolution 会影响类型查找？
为什么 allowJs/checkJs 不是迁移完成的终点？
```

### 技术意义

真实项目一定会接触第三方包、老 JS 文件、没有类型的包、内部 package、ESM/CJS 边界。模块和声明文件不清楚，项目会不断出现导入错误和类型缺失。

### 概念解释

#### 模块（module）

有顶层 `import` 或 `export` 的文件会成为模块，有自己的模块作用域。

#### 声明文件（declaration file）

`.d.ts` 文件描述值的类型形状，不提供运行时实现。

#### type-only import

只导入类型，emit 时会被移除。

### 语法、运行时、对象模型、类型系统边界

```txt
import { valueName } from './module.js':
  runtime import and type information.

import type { TypeName } from './types.js':
  type system only, erased from JavaScript output.

declare module 'package-name':
  tells TypeScript about external module types.
```

### API / 语法规则

```ts
import type { SomeType } from './someModule.js';
export type { SomeType } from './someModule.js';
declare module 'library-name' {}
declare global {}
```

### 文件结构

```txt
09-module-declaration-interop/
  typeOnlyImportReview.ts
  moduleAugmentationReview.ts
  declarationFileReview.d.ts
  declarationConsumer.ts
```

### `declarationFileReview.d.ts`


```ts
// Goal:
// Describe an external runtime module for TypeScript.

declare module 'legacy-price-tools' {
  export function formatPrice(amount: number, currencyCode: string): string;
}
```

### `declarationConsumer.ts`

```ts
// Goal:
// Consume a declared JavaScript module type.

import { formatPrice } from 'legacy-price-tools';

const priceText = formatPrice(25, 'USD');

console.log(priceText);
```

### 代码逐行解释

- `declare module 'legacy-price-tools'` 告诉 TypeScript 存在一个模块名。
- `export function formatPrice(...)` 描述这个模块导出的函数签名。
- `.d.ts` 文件不会生成运行时代码。
- `import { formatPrice }` 是运行时导入，真正运行时仍然需要这个包存在。
- `formatPrice(25, 'USD')` 会根据声明文件检查参数类型。

### 运行方式

```bash
npx tsc --noEmit
```

注意：这个练习只验证类型声明。如果真的运行 `node`，需要安装或提供 `legacy-price-tools` 的运行时实现。

### 预期输出

类型检查：

```txt
No TypeScript errors.
```

运行时：

```txt
Do not run without a real legacy-price-tools implementation.
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 读取 `.d.ts` | 知道模块类型 | 没有输出 |
| 2 | import module | 检查导出存在 | Node/bundler 查找真实包 |
| 3 | 调用函数 | 检查参数和返回类型 | 调用真实实现 |

### 变量和引用变化

```txt
formatPrice:
  compile-time known from .d.ts
  runtime must come from actual package
```

### 为什么得到这个输出

只运行 `tsc --noEmit` 时，TypeScript 只关心类型是否存在，不执行模块。真正运行时需要真实包。

### 对比写法

错误代码：

```ts
// Goal:
// Verify why a declaration file does not provide runtime implementation.

import { formatPrice } from 'legacy-price-tools';

console.log(formatPrice(25, 'USD'));
```

如果没有真实包，类型检查可能通过，但运行时报模块找不到。

### 常见错误为什么错

错误：以为 `.d.ts` 写了函数声明，就等于实现了函数。

原因：`.d.ts` 只给 TypeScript 看，不给 JavaScript runtime 执行。

识别方式：

```txt
TypeScript error says module type missing:
  fix declaration or install @types.

Runtime error says module not found:
  install or provide actual package.
```

### 和实际项目的关系

迁移 JS 老项目、封装第三方库、发布 npm 包、monorepo 内部 package 都离不开声明边界。

### 最终记忆模型

```txt
Modules load values.
Declarations describe values.
Type-only imports disappear.
Runtime imports must exist.
```


### `typeOnlyImportReview.ts`

```ts
// Goal:
// Export a runtime function and a type that can be imported type-only.

export interface ProductRecord {
  id: string;
  title: string;
}

export function createProductLabel(productRecord: ProductRecord): string {
  return `${productRecord.id}:${productRecord.title}`;
}
```

### `moduleAugmentationReview.ts`

```ts
// Goal:
// Verify module augmentation for an exported interface.

import { createProductLabel } from './typeOnlyImportReview.js';

declare module './typeOnlyImportReview.js' {
  interface ProductRecord {
    category?: string;
  }
}

const productRecord = {
  id: 'product-001',
  title: 'Keyboard',
  category: 'accessory',
};

console.log(createProductLabel(productRecord));
```

---

## 10：TSConfig、构建运行和项目边界总复习

### 结论

`tsconfig.json` 不是装饰文件，它定义 TypeScript 项目本身：输入文件、类型检查规则、模块解析、输出产物和运行环境假设。

### 这一节解决什么问题

解决这些问题：

```txt
为什么命令行指定文件时 tsconfig 没生效？
为什么 DOM 类型在 Node 项目里不该默认存在？
为什么库项目要 declaration？
为什么 Vite 需要 tsc --noEmit？
为什么 project references 能改善大型项目？
```

### 技术意义

你以后做 React、Node、Next、monorepo、library、SDK 时，不能复制同一个 tsconfig。不同项目边界需要不同配置。

### 概念解释

#### `strict`

开启一组严格类型检查选项，是现代 TypeScript 项目的基础。

#### `noEmit`

只做类型检查，不输出 JavaScript。

#### `declaration`

输出 `.d.ts`，用于库项目和项目引用。

#### `moduleResolution`

决定 TypeScript 如何按照目标运行环境和模块系统查找导入。

### 语法、运行时、对象模型、类型系统边界

```txt
tsconfig:
  consumed by TypeScript compiler and language service.

package.json:
  consumed by package manager, Node, bundler, publishing tools.

runtime:
  only sees emitted JavaScript and package metadata.
```

### API / 语法规则

常见命令：

```bash
npx tsc --noEmit
npx tsc -p tsconfig.app.json
npx tsc -b
npx tsc --showConfig
```

常见配置项：

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "declaration": true,
    "sourceMap": true,
    "outDir": "dist"
  }
}
```

### 文件结构

```txt
10-tsconfig-build-boundary/
  app.ts
  tsconfig.app.json
  tsconfig.lib.json
  tsconfig.node.json
  packageBoundaryNotes.md
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
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["./app.ts"]
}
```

### `app.ts`

```ts
// Goal:
// Verify a Node-specific TypeScript configuration.

import { readFile } from 'node:fs/promises';

const packageText = await readFile('./package.json', 'utf8');

console.log(packageText.length);
```

### 代码逐行解释

- `lib: ["ES2022"]` 表示使用 ES2022 标准库类型，不默认加入 DOM。
- `types: ["node"]` 明确加入 Node 类型。
- `noEmit: true` 表示这里只做类型检查。
- `import { readFile } from 'node:fs/promises'` 使用 Node 内置模块。
- `await readFile(...)` 返回 Promise fulfilled 后的字符串。
- `console.log(packageText.length)` 输出字符串长度。

### 运行方式

```bash
npx tsc -p 10-tsconfig-build-boundary/tsconfig.node.json
```

### 预期输出

```txt
No TypeScript errors.
```

### 执行过程

| 步骤 | 执行内容 | TypeScript 发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 读取 tsconfig | 确定 root files 和 options | 不发生 |
| 2 | 解析 Node import | 根据 NodeNext 和 node types 查找声明 | 不发生 |
| 3 | 检查 await | 确认 top-level await 配置可用 | 不发生 |
| 4 | noEmit | 不输出 JS | 不运行 |

### 变量和引用变化

```txt
packageText:
  inferred as string after awaiting readFile with utf8 encoding
```

### 为什么得到这个输出

`@types/node` 提供 `node:fs/promises` 的类型，`module: NodeNext` 支持 Node 风格模块解析，`noEmit` 只检查不输出。

### 对比写法

错误配置：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "classic",
    "strict": true
  }
}
```

问题：现代 Node 项目不应该使用 `classic` 解析。它不能正确模拟 Node package 边界。

### 常见错误为什么错

错误：运行 `npx tsc app.ts` 后发现 `tsconfig.json` 里的 strict 没生效。

原因：命令行直接指定输入文件时，TypeScript 不按项目方式读取最近的 tsconfig。

正确写法：

```bash
npx tsc -p tsconfig.json
```

或者：

```bash
npx tsc --noEmit
```

在项目根目录运行。

### 和实际项目的关系

React 项目、Node 项目、库项目、测试项目、monorepo package 都应该有适合自己的 tsconfig profile。

### 最终记忆模型

```txt
tsconfig defines the TypeScript project.
package.json defines package and runtime metadata.
Bundlers transform code.
Node or browser runs JavaScript.
```


### `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["../11-framework-validation-boundary/**/*.ts", "../11-framework-validation-boundary/**/*.tsx"]
}
```

### `tsconfig.lib.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "../../dist/lib",
    "rootDir": "..",
    "skipLibCheck": true
  },
  "include": ["../09-module-declaration-interop/**/*.ts"]
}
```

### `packageBoundaryNotes.md`

```md
# Package Boundary Notes

## Runtime boundary

- Node loads emitted JavaScript.
- A bundler can rewrite imports.
- TypeScript path aliases do not automatically change runtime resolution.

## Type boundary

- Public exports should be named.
- Declaration output should be readable.
- Internal helper types should stay private unless callers need them.
```

---

## 11：框架、TSX、API contract 和运行时验证总复习

### 结论

框架里的 TypeScript 负责检查边界：props、state、events、API contract、route params、request body、response body。但所有外部数据仍然需要运行时验证。

### 这一节解决什么问题

解决这些问题：

```txt
React props 类型能不能保证 API response 正确？
TSX 类型检查和 DOM 运行时是什么关系？
API shared type 是否能替代 validation？
表单输入为什么不能直接 as DomainType？
```

### 技术意义

你后面做 React / Node / Next 项目时，TypeScript 的价值主要体现在这些边界：

```txt
component props
component state
custom hook return
API client response
server request body
form input
URL params
localStorage
schema validation
```

### 概念解释

#### TSX

TypeScript 解析 JSX 的文件形式，提供 component props 和 intrinsic elements 的类型检查。

#### API contract

前后端共享或约定的请求响应结构。

#### validation boundary

把 `unknown` 转成可信 domain type 的运行时检查位置。

### 语法、运行时、对象模型、类型系统边界

```txt
TSX:
  type checks JSX expressions and props.

React runtime:
  creates elements and updates UI.

API contract type:
  compile-time agreement.

Runtime validator:
  checks real data at runtime.
```

### API / 语法规则

本节的重点语法：

```ts
type ComponentProps = {
  value: string;
  onChange(nextValue: string): void;
};

type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

### 文件结构

```txt
11-framework-validation-boundary/
  apiContractReview.ts
  runtimeValidationReview.ts
  reactStateModelReview.tsx
```

### `runtimeValidationReview.ts`

```ts
// Goal:
// Verify unknown input validation before using an API response as a domain type.

type ProductRecord = {
  id: string;
  title: string;
  price: number;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function validateProductRecord(inputValue: unknown): ValidationResult<ProductRecord> {
  if (typeof inputValue !== 'object' || inputValue === null) {
    return { ok: false, error: 'Expected object' };
  }

  if (!('id' in inputValue) || typeof inputValue.id !== 'string') {
    return { ok: false, error: 'Expected string id' };
  }

  if (!('title' in inputValue) || typeof inputValue.title !== 'string') {
    return { ok: false, error: 'Expected string title' };
  }

  if (!('price' in inputValue) || typeof inputValue.price !== 'number') {
    return { ok: false, error: 'Expected number price' };
  }

  return {
    ok: true,
    value: {
      id: inputValue.id,
      title: inputValue.title,
      price: inputValue.price,
    },
  };
}
```

### 代码逐行解释

- `ProductRecord` 是 domain type，只描述可信产品数据。
- `ValidationResult<T>` 用 union 表示验证成功或失败。
- `validateProductRecord(inputValue: unknown)` 明确外部输入不可信。
- 第一个 `if` 检查输入必须是非 null object。
- `'id' in inputValue` 检查属性存在。
- `typeof inputValue.id === 'string'` 检查属性值类型。
- 所有字段检查通过后，创建新的 `ProductRecord` 对象返回。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
No TypeScript errors.
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 输入 unknown | 禁止直接访问具体属性 | 接收任意值 |
| 2 | 检查 object | 收窄为 object | 判断类型 |
| 3 | 检查字段 | 每个字段逐步证明 | 读取属性 |
| 4 | 返回 success | 返回 `ValidationResult<ProductRecord>` | 创建对象 |

### 变量和引用变化

```txt
inputValue:
  starts as unknown
  narrows after runtime checks

value:
  newly created trusted ProductRecord object
```

### 为什么得到这个输出

所有属性访问都在 `unknown` 被运行时检查后发生，所以 TypeScript 允许读取并构造可信对象。

### 对比写法

错误写法：

```ts
// Goal:
// Verify why assertion does not validate an API response.

type ProductRecord = {
  id: string;
  title: string;
  price: number;
};

function unsafeReadProduct(inputValue: unknown): ProductRecord {
  return inputValue as ProductRecord;
}
```

这段代码可能通过类型检查，但没有证明 `inputValue` 真的有 `id`、`title`、`price`。

### 常见错误为什么错

错误：API response 一回来就写 `as ProductRecord`。

原因：类型断言只改变 TypeScript 的视角，不做运行时验证。

正确策略：

```txt
external input -> unknown -> validate -> ProductRecord
```

### 和实际项目的关系

React props 可以假设父组件传来的类型被 TypeScript 检查；API response、form input、URL params、storage value 不可以假设可信，必须验证。

### 最终记忆模型

```txt
Shared types align teams.
Runtime validation protects reality.
```


### `apiContractReview.ts`

```ts
// Goal:
// Verify a shared API contract without pretending it validates runtime data.

export type ProductListRequest = {
  query: string;
  page: number;
};

export type ProductListResponse = {
  items: Array<{
    id: string;
    title: string;
  }>;
  totalCount: number;
};

export type ProductListEndpoint = {
  request: ProductListRequest;
  response: ProductListResponse;
};

export function createProductListUrl(request: ProductListRequest): string {
  const queryText = encodeURIComponent(request.query);
  return `/api/products?query=${queryText}&page=${request.page}`;
}
```

### `reactStateModelReview.tsx`

```tsx
// Goal:
// Model React UI state as a discriminated union.

import { useState } from 'react';

type ProductPanelState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; title: string }
  | { status: 'failure'; message: string };

export function ProductPanel() {
  const [panelState] = useState<ProductPanelState>({
    status: 'success',
    title: 'Keyboard',
  });

  if (panelState.status === 'success') {
    return <section>{panelState.title}</section>;
  }

  if (panelState.status === 'failure') {
    return <section>{panelState.message}</section>;
  }

  return <section>{panelState.status}</section>;
}
```

---

## 12：项目级 TypeScript 决策清单

### 结论

项目里写 TypeScript，要先问“边界在哪里”，再问“用什么类型语法”。

### 这一节解决什么问题

给你一个项目开工前和代码 review 时可以使用的 TypeScript 决策表。

### 技术意义

TypeScript 的高阶能力不是多会几个操作符，而是能让项目长期保持可维护、可检查、可重构。

### 概念解释

#### 类型设计决策（type design decision）

决定一个类型应该放在哪里、暴露给谁、是否稳定、是否需要运行时验证。

### 语法、运行时、对象模型、类型系统边界

本节主要是架构判断，不新增语法。

### API / 语法规则

本节没有新 API。

### 文件结构

```txt
12-project-decision-checklist/
  typeBoundaryDecisionTable.md
  tsconfigDecisionTable.md
  publicApiDecisionTable.md
  serviceBoundaryDecisionReview.ts
```

### `typeBoundaryDecisionTable.md`

```txt
Question:
  Is the value created inside this function?

Decision:
  Prefer inference unless the expression is complex.

Question:
  Is the function exported?

Decision:
  Prefer explicit parameter and return types.

Question:
  Does the value come from network, form, URL, storage, or worker?

Decision:
  Treat it as unknown and validate.

Question:
  Does this type appear in a package export?

Decision:
  Keep it stable, named, readable, and documented.

Question:
  Is the type becoming too slow or unreadable?

Decision:
  Name intermediate aliases, reduce union explosion, simplify public surface.
```

### `serviceBoundaryDecisionReview.ts`

```ts
// Goal:
// Apply project-level TypeScript decisions to one service boundary.

type CreateOrderInput = {
  productId: string;
  quantity: number;
};

type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; code: 'invalid_quantity' | 'out_of_stock'; message: string };

export function createOrder(input: CreateOrderInput): CreateOrderResult {
  if (input.quantity <= 0) {
    return {
      ok: false,
      code: 'invalid_quantity',
      message: 'Quantity must be greater than zero',
    };
  }

  return {
    ok: true,
    orderId: `order-${input.productId}`,
  };
}
```

### 代码逐行解释

- `CreateOrderInput` 是 service boundary 的输入类型。
- `CreateOrderResult` 是显式结果类型，调用者必须处理成功或失败。
- `export function createOrder(...)` 是模块外部可见边界，因此返回值显式标注。
- `input.quantity <= 0` 是运行时业务检查。
- 返回失败分支时，`code` 是可枚举的错误码。
- 返回成功分支时，`ok: true` 让调用方可以收窄到成功状态。

### 运行方式

```bash
npx tsc --noEmit
```

### 预期输出

```txt
No TypeScript errors.
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 定义 input type | 创建输入边界 | 不存在 |
| 2 | 定义 result union | 创建成功/失败模型 | 不存在 |
| 3 | 导出函数 | 检查 public boundary | 创建函数值 |
| 4 | 检查 quantity | 不改变类型，但表达业务规则 | 判断数字 |
| 5 | 返回 union 分支 | 检查符合 result 类型 | 创建对象 |

### 变量和引用变化

```txt
input:
  runtime parameter object checked as CreateOrderInput

CreateOrderResult:
  compile-time union type describing possible output states
```

### 为什么得到这个输出

函数每条返回路径都返回了 `CreateOrderResult` 的一个合法成员。

### 对比写法

不推荐：

```ts
// Goal:
// Show a weak service boundary.

export function createOrder(input: any) {
  if (input.quantity <= 0) {
    throw new Error('Invalid quantity');
  }

  return {
    orderId: `order-${input.productId}`,
  };
}
```

问题：

```txt
input is any.
error path is not visible in return type.
caller does not know success shape precisely.
```

### 常见错误为什么错

错误：把 public function 写成 `any -> any`，然后期待调用方自己猜。

原因：public boundary 是 TypeScript 最应该保护的位置。

正确策略：输入、输出、错误都显式建模。

### 和实际项目的关系

这就是你后面做 React / Node / Next 项目时最常用的服务层类型写法。

### 最终记忆模型

```txt
Good TypeScript is boundary design.
Bad TypeScript is decorative annotation.
```


### `tsconfigDecisionTable.md`

```md
# TSConfig Decision Table

| Project type | Recommended mode | Reason |
|---|---|---|
| Browser app | noEmit with bundler | The bundler emits JavaScript |
| Node app | NodeNext | Match Node package resolution |
| Library | declaration output | Consumers need .d.ts files |
| Monorepo package | composite project | Project references need build metadata |
| Test project | separate config | Test globals should not leak into app code |
```

### `publicApiDecisionTable.md`

```md
# Public API Decision Table

| Question | Decision |
|---|---|
| Can callers import this type? | Keep it stable and readable |
| Is this helper internal? | Do not export it |
| Does the return shape define a contract? | Write an explicit return type |
| Does the type expose many conditional branches? | Name intermediate types |
| Does the value come from users or network? | Validate at runtime |
```

---

## 10. 本章 API / 语法完整索引

| 语法 / 配置 / 工具 | 所属层级 | 作用 | 是否有运行时效果 | 常见误区 |
|---|---|---|---|---|
| `type` | type system | 创建类型别名 | 否 | 当成运行时对象 |
| `interface` | type system | 描述对象结构，可声明合并 | 否 | 当成 class 或 constructor |
| `class` | runtime + type system | 创建构造函数、prototype 和实例类型 | 是 | 忽略它的运行时存在 |
| `as` | type system syntax | 类型断言 | 否 | 当成 validation |
| `satisfies` | type system syntax | 检查目标类型并保留表达式精确类型 | 否 | 当成 runtime check |
| `keyof` | type computation | 提取对象 key union | 否 | 当成 `Object.keys()` |
| type-position `typeof` | type computation | 从值提取静态类型 | 否 | 和 runtime `typeof` 混淆 |
| indexed access `T[K]` | type computation | 提取属性值类型 | 否 | 和运行时属性访问混淆 |
| mapped type | type computation | 根据 key 生成新对象类型 | 否 | 和 `Array.prototype.map()` 混淆 |
| conditional type | type computation | 类型层条件分支 | 否 | 写成过度复杂逻辑 |
| `infer` | type computation | 在条件类型中提取局部类型变量 | 否 | 当成运行时推断 |
| `never` | type system | 表示不可能的类型 | 否 | 和 `void` 混淆 |
| `unknown` | type system | 表示未知值，使用前必须证明 | 否 | 和 `any` 混淆 |
| `any` | type system escape hatch | 关闭检查 | 否 | 当成灵活泛型 |
| `import type` | module/type system | 只导入类型 | 否 | 期待运行时存在 |
| `.d.ts` | declaration boundary | 描述类型，不实现代码 | 否 | 当成 JS 实现 |
| `strict` | TSConfig | 开启严格检查集合 | 否 | 以为只是风格选项 |
| `noEmit` | TSConfig | 只检查不输出 | 否 | 期待生成 JS |
| `declaration` | TSConfig | 输出 `.d.ts` | 构建产物 | 以为应用项目都必须开 |
| `moduleResolution` | TSConfig | 控制模块查找算法 | 编译期 | 和 `module` 混淆 |
| `module` | TSConfig | 控制模块输出或目标模块模型 | 编译/输出 | 和 runtime package type 混淆 |
| `target` | TSConfig | 控制输出 JS 语言目标 | 输出 | 以为会 polyfill API |
| `lib` | TSConfig | 引入内置类型声明 | 编译期 | 以为会引入运行时 API |
| `types` | TSConfig | 限制进入全局作用域的 `@types` | 编译期 | 和 package dependencies 混淆 |
| `tsc --noEmit` | CLI | 项目类型检查 | 否 | 以为会打包 |
| `tsc -b` | CLI | build mode / project references | 构建 | 和普通 tsc 混淆 |
| `tsc --showConfig` | CLI | 展开最终配置 | 否 | 以为会检查类型 |
| `tsc --traceResolution` | CLI | 诊断模块解析 | 否 | 以为会修复导入 |

---

## 11. 本章常见错误总表

| 错误 | 错误类型 | 违反规则 | 正确修复 | 识别方式 |
|---|---|---|---|---|
| 把 `interface` 用在 `instanceof` 右边 | 类型错误 | `instanceof` 需要运行时构造函数 | 用 class 或 type guard | 看到 “only refers to a type” |
| API response 直接 `as DomainType` | 逻辑错误 / 类型安全漏洞 | assertion 不做验证 | unknown -> validator -> domain type | 数据来自外部边界 |
| 用 `any` 写通用函数 | 类型安全漏洞 | `any` 丢失类型关系 | 改用 generic 或 unknown | 调用方属性乱写不报错 |
| union 不收窄就访问成员属性 | 类型错误 | 属性不是所有成员共有 | 检查 discriminant | 看到 property does not exist on type |
| switch 漏处理 union 新成员 | 逻辑错误 | 没有 exhaustive check | default 中使用 `never` | 新增状态但无报错 |
| public function 不写返回类型 | API 稳定性问题 | 导出边界不明确 | exported function 显式返回 | 改内部字段影响调用者 |
| 直接把复杂 conditional type 暴露给用户 | 可维护性问题 | public type surface 过复杂 | 命名中间类型，简化 API | hover 很长，错误难懂 |
| 以为 `.d.ts` 提供实现 | 运行时错误 | declaration only has types | 安装真实包或写实现 | tsc 通过但 node 找不到模块 |
| 命令行指定文件导致 tsconfig 不生效 | 配置错误 | `tsc file.ts` 不按项目方式读取配置 | 用 `tsc -p` | strict 结果和 IDE 不一致 |
| Node 项目默认包含 DOM 类型 | 配置污染 | lib 选择错误 | Node tsconfig 用 `lib: ["ES2022"]` | `document` 在 Node 文件里不报错 |
| `paths` 只配 TypeScript 不配 runtime | 运行时错误 | TS 路径别名不等于运行时解析 | 配 bundler/Node imports | tsc 通过但运行找不到模块 |
| 把 shared type 当 validation | 安全漏洞 | 类型只在编译期存在 | 加 schema validation | API 数据来自网络 |
| React state 用多个 boolean 表示状态 | 逻辑错误 | impossible state | 用 discriminated union | loading 和 error 同时为 true |
| catch error 直接 `error.message` | 类型错误 / 不安全 | thrown value 可以是任意值 | 先 `instanceof Error` | `useUnknownInCatchVariables` 报错 |
| 滥用 non-null assertion `!` | 运行时风险 | 跳过 null 检查 | 改控制流检查或提前返回 | 报错消失但 runtime 可能崩 |

---

## 12. 最终小项目

### 结论

最终小项目是：

```txt
Typed Order Boundary Review
```

目标：把 TypeScript 学习路线整合成一个小型订单边界项目。

你要完成这些边界：

```txt
external input
  -> unknown
  -> runtime validation
  -> domain input
  -> pricing logic
  -> async API client Result
  -> UI state union
  -> public module exports
  -> tsc project check
```

### 文件结构

```txt
13-final-mini-project/
  package.json
  tsconfig.json
  src/contracts/orderContract.ts
  src/validation/orderValidator.ts
  src/domain/orderPricing.ts
  src/api/orderClient.ts
  src/ui/orderState.ts
  src/index.ts
  tests/orderReviewCases.ts
  README.md
```

### `package.json`

```json
{
  "name": "typed-order-boundary-review",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "latest",
    "@types/node": "latest"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": ".",
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

### `src/contracts/orderContract.ts`

```ts
// Goal:
// Define stable public contracts for the order boundary.

export type OrderItemInput = {
  productId: string;
  unitPrice: number;
  quantity: number;
};

export type CreateOrderInput = {
  customerId: string;
  items: OrderItemInput[];
};

export type OrderPricingSummary = {
  subtotal: number;
  discount: number;
  total: number;
};

export type CreateOrderSuccess = {
  orderId: string;
  pricing: OrderPricingSummary;
};

export type CreateOrderError = {
  code: 'invalid_input' | 'empty_order' | 'network_failure';
  message: string;
};

export type Result<Success, Failure> =
  | { ok: true; value: Success }
  | { ok: false; error: Failure };
```

### `src/validation/orderValidator.ts`

```ts
// Goal:
// Validate unknown order input before domain logic uses it.

import type { CreateOrderError, CreateOrderInput, Result } from '../contracts/orderContract.js';

function isRecord(inputValue: unknown): inputValue is Record<string, unknown> {
  return typeof inputValue === 'object' && inputValue !== null;
}

export function validateCreateOrderInput(inputValue: unknown): Result<CreateOrderInput, CreateOrderError> {
  if (!isRecord(inputValue)) {
    return {
      ok: false,
      error: {
        code: 'invalid_input',
        message: 'Expected an object input',
      },
    };
  }

  if (typeof inputValue.customerId !== 'string') {
    return {
      ok: false,
      error: {
        code: 'invalid_input',
        message: 'Expected a string customerId',
      },
    };
  }

  if (!Array.isArray(inputValue.items)) {
    return {
      ok: false,
      error: {
        code: 'invalid_input',
        message: 'Expected an items array',
      },
    };
  }

  const validatedItems: CreateOrderInput['items'] = [];

  for (const itemValue of inputValue.items) {
    if (!isRecord(itemValue)) {
      return {
        ok: false,
        error: {
          code: 'invalid_input',
          message: 'Expected valid order items',
        },
      };
    }

    if (
      typeof itemValue.productId !== 'string' ||
      typeof itemValue.unitPrice !== 'number' ||
      typeof itemValue.quantity !== 'number'
    ) {
      return {
        ok: false,
        error: {
          code: 'invalid_input',
          message: 'Expected valid order items',
        },
      };
    }

    validatedItems.push({
      productId: itemValue.productId,
      unitPrice: itemValue.unitPrice,
      quantity: itemValue.quantity,
    });
  }

  return {
    ok: true,
    value: {
      customerId: inputValue.customerId,
      items: validatedItems,
    },
  };
}
```

### `src/domain/orderPricing.ts`

```ts
// Goal:
// Calculate order pricing from trusted domain input.

import type { CreateOrderInput, OrderPricingSummary, Result, CreateOrderError } from '../contracts/orderContract.js';

export function calculateOrderPricing(input: CreateOrderInput): Result<OrderPricingSummary, CreateOrderError> {
  if (input.items.length === 0) {
    return {
      ok: false,
      error: {
        code: 'empty_order',
        message: 'Order must contain at least one item',
      },
    };
  }

  const subtotal = input.items.reduce((currentTotal, itemRecord) => {
    return currentTotal + itemRecord.unitPrice * itemRecord.quantity;
  }, 0);

  const discount = subtotal >= 100 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  return {
    ok: true,
    value: {
      subtotal,
      discount,
      total,
    },
  };
}
```

### `src/api/orderClient.ts`

```ts
// Goal:
// Compose validation, domain logic, and async Result output.

import type { CreateOrderError, CreateOrderSuccess, Result } from '../contracts/orderContract.js';
import { calculateOrderPricing } from '../domain/orderPricing.js';
import { validateCreateOrderInput } from '../validation/orderValidator.js';

export async function createOrderFromUnknownInput(
  inputValue: unknown,
): Promise<Result<CreateOrderSuccess, CreateOrderError>> {
  const validationResult = validateCreateOrderInput(inputValue);

  if (!validationResult.ok) {
    return validationResult;
  }

  const pricingResult = calculateOrderPricing(validationResult.value);

  if (!pricingResult.ok) {
    return pricingResult;
  }

  return {
    ok: true,
    value: {
      orderId: `order-${validationResult.value.customerId}`,
      pricing: pricingResult.value,
    },
  };
}
```

### `src/ui/orderState.ts`

```ts
// Goal:
// Model UI state with a discriminated union.

import type { CreateOrderError, CreateOrderSuccess } from '../contracts/orderContract.js';

export type OrderSubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; result: CreateOrderSuccess }
  | { status: 'failure'; error: CreateOrderError };

export function renderOrderSubmitState(state: OrderSubmitState): string {
  switch (state.status) {
    case 'idle':
      return 'Ready';
    case 'submitting':
      return 'Submitting';
    case 'success':
      return `Order created: ${state.result.orderId}`;
    case 'failure':
      return state.error.message;
    default: {
      const unreachableState: never = state;
      return unreachableState;
    }
  }
}
```

### `src/index.ts`

```ts
// Goal:
// Re-export public API from the mini project.

export type {
  CreateOrderError,
  CreateOrderInput,
  CreateOrderSuccess,
  OrderItemInput,
  OrderPricingSummary,
  Result,
} from './contracts/orderContract.js';

export { createOrderFromUnknownInput } from './api/orderClient.js';
export { renderOrderSubmitState } from './ui/orderState.js';
```

### `tests/orderReviewCases.ts`

```ts
// Goal:
// Verify final review project behavior with valid and invalid inputs.

import { createOrderFromUnknownInput, renderOrderSubmitState } from '../src/index.js';

const validInput = {
  customerId: 'customer-001',
  items: [
    {
      productId: 'product-001',
      unitPrice: 80,
      quantity: 2,
    },
  ],
};

const invalidInput = {
  customerId: 'customer-001',
  items: [
    {
      productId: 'product-001',
      unitPrice: '80',
      quantity: 2,
    },
  ],
};

const validResult = await createOrderFromUnknownInput(validInput);
const invalidResult = await createOrderFromUnknownInput(invalidInput);

if (validResult.ok) {
  console.log(renderOrderSubmitState({ status: 'success', result: validResult.value }));
}

if (!invalidResult.ok) {
  console.log(renderOrderSubmitState({ status: 'failure', error: invalidResult.error }));
}
```


### `README.md`

```md
# Typed Order Boundary Review

## Goal

Practice a complete TypeScript boundary from unknown input to validated domain logic, async Result output, UI state modeling, and public module exports.

## Commands

```bash
npm install
npm run typecheck
npm run build
node dist/tests/orderReviewCases.js
```

## Expected output

```txt
Order created: order-customer-001
Expected valid order items
```

## Review questions

- Why does external input start as unknown?
- Why does the validator create a trusted domain value?
- Why does the API layer return Promise<Result<T, E>>?
- Why does the UI state use a discriminated union?
- Why does index.ts define the public module boundary?
```

### 运行方式

```bash
cd 13-final-mini-project
npm install
npm run typecheck
npm run build
node dist/tests/orderReviewCases.js
```

### 预期输出

```txt
Order created: order-customer-001
Expected valid order items
```

### 项目逐步解释

1. `contracts/orderContract.ts` 定义 public API 类型，不包含运行时验证逻辑。
2. `validation/orderValidator.ts` 负责从 `unknown` 到 `CreateOrderInput`。
3. `domain/orderPricing.ts` 只处理可信 domain input，不再重复检查未知结构。
4. `api/orderClient.ts` 组合 validation 和 domain logic，并返回 async Result。
5. `ui/orderState.ts` 用判别联合表达 UI 提交状态。
6. `index.ts` 是 public module boundary，只导出稳定 API。
7. `tests/orderReviewCases.ts` 验证成功和失败路径。

### 最终检查目标

你完成小项目后，要能解释：

```txt
为什么 external input 是 unknown？
为什么 validation 成功后才能进入 domain logic？
为什么 Result 比 throw 更适合这个 API boundary？
为什么 UI state 用 discriminated union？
为什么 index.ts 是 public API boundary？
为什么 type-only export 不产生运行时代码？
为什么 tsconfig 里开启 strict 和 noUncheckedIndexedAccess？
```

---

## 13. 额外 cheatsheet

### 结论

本章建议后续单独生成 cheatsheet，但本次先不生成独立文件。

建议文件名：

```txt
typescript-chapter-13-final-review-cheatsheet-zh-v1.md
```

建议覆盖：

```txt
1. TypeScript 边界决策表。
2. interface vs type vs class vs abstract class。
3. any vs unknown vs never。
4. annotation vs assertion vs satisfies。
5. union vs overload vs generic。
6. keyof / typeof / T[K] / mapped type / conditional type。
7. throw vs Result vs Option。
8. import vs import type vs .d.ts。
9. tsconfig app/lib/node/react profiles。
10. runtime validation decision table。
```

---

## 14. 最终文件清单

```txt
typescript/chapter-13-final-review/
  typescript-chapter-13-final-review-learning-guide-zh-v1.md

  00-final-review-model/
    typeSystemMap.ts
    runtimeBoundaryDemo.ts
    reviewChecklist.md
    typeValueBoundaryWarmup.ts
    typeValueBoundaryWarmupMistake.ts

  01-type-runtime-boundary/
    erasedTypeDemo.ts
    classValueTypeDualRole.ts
    assertionDoesNotValidate.ts

  02-values-inference/
    literalInferenceDemo.ts
    wideningVsConstDemo.ts
    satisfiesReviewDemo.ts

  03-object-type-boundary/
    interfaceVsTypeReview.ts
    structuralCompatibilityReview.ts
    excessPropertyReview.ts

  04-function-generic-boundary/
    callbackBoundaryReview.ts
    genericRelationshipReview.ts
    overloadImplementationReview.ts

  05-class-interface-boundary/
    classRuntimeReview.ts
    implementsCheckReview.ts
    abstractClassReview.ts

  06-union-narrowing-exhaustiveness/
    discriminatedUnionReview.ts
    exhaustiveSwitchReview.ts
    customTypeGuardReview.ts

  07-advanced-type-tools/
    keyofMappedTypeReview.ts
    conditionalInferReview.ts
    utilityTypeReview.ts

  08-error-async-modeling/
    resultTypeReview.ts
    asyncResultReview.ts
    promiseAwaitedReview.ts

  09-module-declaration-interop/
    typeOnlyImportReview.ts
    moduleAugmentationReview.ts
    declarationFileReview.d.ts
    declarationConsumer.ts

  10-tsconfig-build-boundary/
    app.ts
    tsconfig.app.json
    tsconfig.lib.json
    tsconfig.node.json
    packageBoundaryNotes.md

  11-framework-validation-boundary/
    apiContractReview.ts
    runtimeValidationReview.ts
    reactStateModelReview.tsx

  12-project-decision-checklist/
    typeBoundaryDecisionTable.md
    tsconfigDecisionTable.md
    publicApiDecisionTable.md
    serviceBoundaryDecisionReview.ts

  13-final-mini-project/
    package.json
    tsconfig.json
    src/contracts/orderContract.ts
    src/validation/orderValidator.ts
    src/domain/orderPricing.ts
    src/api/orderClient.ts
    src/ui/orderState.ts
    src/index.ts
    tests/orderReviewCases.ts
    README.md

  typescript-chapter-13-final-review-cheatsheet-zh-v1.md
```

---

## 15. 最终学习笔记转换要求

整理最终学习笔记时，不要按“第 3 章、第 4 章、第 5 章”机械抄目录。建议按边界整理：

```md
# TypeScript 最终总复习笔记

## 1. TypeScript 的总模型

## 2. 编译期和运行时边界

## 3. 值、类型和类型推断

## 4. 对象类型和结构化类型

## 5. 函数、泛型和重载

## 6. class / interface / abstract class

## 7. union、narrowing 和 never

## 8. 高级类型工具

## 9. 错误、异步和 Result

## 10. 模块、声明文件和 JS 互操作

## 11. tsconfig 和构建边界

## 12. React / API / validation 边界

## 13. 项目级 TypeScript 决策清单

## 14. 最终小项目复盘
```

每个部分固定写：

```txt
Conclusion
Technical meaning
Underlying mechanism
Code example
Execution process
Common mistakes
Project decision rule
Final memory model
```

---

## 16. 本章最终要能回答的问题

学完第 13 章，你应该能回答：

1. TypeScript 类型在运行时是否存在？
2. `type`、`interface`、`class` 哪些会生成运行时代码？
3. 类型注解、类型断言、`satisfies` 的区别是什么？
4. 为什么 `unknown` 比 `any` 更适合外部输入？
5. 为什么泛型能保留输入和输出之间的类型关系？
6. 结构化类型系统如何判断兼容性？
7. 为什么对象字面量有额外属性检查？
8. `implements` 和 `extends` 的区别是什么？
9. 判别联合为什么适合 UI state 和 API result？
10. `never` 如何做全面性检查？
11. `keyof`、类型位置 `typeof`、`T[K]` 分别解决什么问题？
12. mapped type 和 runtime map 有什么区别？
13. conditional type 和普通 if 有什么区别？
14. `infer` 在什么位置使用？
15. thrown exception 为什么不会体现在函数返回类型里？
16. `Promise<Result<T, E>>` 表达了什么？
17. `catch` 里的 error 为什么应该先当 unknown？
18. `import type` 为什么会被擦除？
19. `.d.ts` 文件为什么不能提供运行时实现？
20. `tsconfig.json` 和 `package.json` 分别负责什么？
21. `target` 是否会自动 polyfill API？
22. `lib` 是否会引入运行时代码？
23. `module` 和 `moduleResolution` 的区别是什么？
24. 为什么应用项目常用 `noEmit`，库项目常用 `declaration`？
25. 为什么 React props 类型不能验证 API response？
26. 为什么 shared type 不能替代 schema validation？
27. public API 为什么要避免暴露过度复杂类型？
28. 如何判断一个类型错误应该修代码、修类型、收窄、验证，还是断言？
29. 如何给 React / Node / library 项目选择不同 tsconfig？
30. 一个 TypeScript 项目的核心边界有哪些？

---

## 17. 本章最终记忆模型

### 一句话模型

```txt
TypeScript is a boundary design tool for JavaScript programs.
```

### 完整模型

```txt
JavaScript runtime:
  values exist.
  objects have properties.
  functions run.
  classes create constructors.
  modules load values.
  promises settle.

TypeScript compile time:
  types describe values.
  inference reads code.
  assignability checks boundaries.
  narrowing follows control flow.
  generics preserve relationships.
  declarations describe external values.
  tsconfig defines the project.

Project architecture:
  external data starts as unknown.
  validation creates trusted domain values.
  domain logic uses stable types.
  UI state should avoid impossible states.
  public API should be explicit and readable.
  build output should match runtime environment.
```

### 最终判断口诀

```txt
Internal values:
  prefer inference.

Exported boundaries:
  prefer explicit types.

External input:
  prefer unknown plus validation.

Flexible relation:
  prefer generics.

Multiple states:
  prefer discriminated unions.

Impossible branch:
  use never.

Unsafe shortcut:
  isolate assertions.

Package boundary:
  keep types stable.

Runtime boundary:
  TypeScript is not enough.
```

---

## 18. 官方文档阅读清单

按这个顺序复习官方文档：

1. [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
2. [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
3. [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
4. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
5. [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
6. [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
7. [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
8. [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)
9. [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)
10. [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
11. [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
12. [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
13. [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
14. [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
15. [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
16. [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
17. [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)
18. [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
19. [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
20. [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
21. [What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
22. [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
23. [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
24. [Publishing Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
25. [Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)

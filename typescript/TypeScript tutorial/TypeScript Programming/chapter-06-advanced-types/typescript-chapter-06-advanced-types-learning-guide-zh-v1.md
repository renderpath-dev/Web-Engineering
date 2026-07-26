# TypeScript 第 6 章“类型进阶”学习指导文件 v1

> 定位：这是 TypeScript 第 6 章“类型进阶”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察编译错误或运行输出，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 6 章“类型进阶”，TypeScript 官方 Handbook 的 Type Compatibility、Narrowing、Generics、Keyof Type Operator、Typeof Type Operator、Indexed Access Types、Mapped Types、Conditional Types、Utility Types、Declaration Merging，以及 TSConfig 官方文档中的 `noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`strictFunctionTypes`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解 TypeScript 类型关系和类型运算的机制，再使用高级类型工具。不要把类型进阶学成“背内置工具类型”。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 结构化类型、可赋值性、函数参数兼容性、类型系统不完全 sound 的设计取舍 | [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) |
| 泛型、泛型约束、泛型参数默认值 | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| 类型缩小、控制流分析、判别联合、`never` 穷尽检查、类型谓词、断言函数 | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| `keyof` 类型运算符 | [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) |
| 类型位置的 `typeof` | [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) |
| 索引访问类型 | [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) |
| 映射类型、映射修饰符、键名重映射 | [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) |
| 条件类型、条件类型约束、分配式条件类型、`infer` | [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) |
| `Partial`、`Required`、`Readonly`、`Record`、`Pick`、`Omit`、`Exclude`、`Extract`、`ReturnType`、`Parameters`、`Awaited` 等工具类型 | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| `satisfies` 运算符：检查表达式满足目标类型，同时保留表达式自身推导结果 | [TypeScript 4.9 Release Notes - satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) |
| 全局扩展、模块扩展、prototype 扩展声明 | [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) |
| 索引访问时加入 `undefined` | [TSConfig noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html) |
| 可选属性精确语义 | [TSConfig exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html) |
| 函数参数位置更严格检查 | [TSConfig strictFunctionTypes](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 6 章完整学习顺序](#3-第-6-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：类型关系、子类型和超类型](#5-00类型关系子类型和超类型)
6. [01：可赋值性](#6-01可赋值性)
7. [02：型变 variance](#7-02型变-variance)
8. [03：类型拓宽和类型细化](#8-03类型拓宽和类型细化)
9. [04：全面性检查和 never](#9-04全面性检查和-never)
10. [05：对象类型的类型运算符](#10-05对象类型的类型运算符)
11. [06：Record 类型](#11-06record-类型)
12. [07：映射类型](#12-07映射类型)
13. [08：伴生对象模式](#13-08伴生对象模式)
14. [09：改善元组的类型推导](#14-09改善元组的类型推导)
15. [10：用户定义的类型防护措施](#15-10用户定义的类型防护措施)
16. [11：条件类型](#16-11条件类型)
17. [12：条件分配](#17-12条件分配)
18. [13：infer 关键字](#18-13infer-关键字)
19. [14：内置条件类型和工具类型](#19-14内置条件类型和工具类型)
20. [15：类型断言](#20-15类型断言)
21. [16：非空断言和明确赋值断言](#21-16非空断言和明确赋值断言)
22. [17：模拟名义类型](#22-17模拟名义类型)
23. [18：安全地扩展原型](#23-18安全地扩展原型)
24. [19：小项目整合](#24-19小项目整合)
25. [最终文件清单](#25-最终文件清单)
26. [最终学习笔记转换要求](#26-最终学习笔记转换要求)
27. [本章最终要能回答的问题](#27-本章最终要能回答的问题)
28. [TS 官方文档阅读清单](#28-ts-官方文档阅读清单)
29. [第 6 章最终记忆模型](#29-第-6-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个写类型关系、写类型运算、触发类型检查、解释高级类型机制的训练指导。

第 6 章的核心不是更多语法，而是 TypeScript 类型系统如何“计算类型”。

你必须同时观察三件事：

```txt
Type relationship:
  一个类型能不能赋值给另一个类型。

Type transformation:
  从一个已有类型生成另一个类型。

Type refinement:
  从一个较宽类型缩小到更具体的类型。
```

第 6 章真正开始进入 TypeScript 的“类型层编程”。但它仍然服务于真实代码，不是为了写复杂类型而写复杂类型。

### 每节固定学习步骤

```txt
1. 先读结论。
2. 区分本节概念属于 type relationship、type operator、control-flow analysis、escape hatch 还是 runtime augmentation。
3. 创建对应目录。
4. 写一个正确示例文件。
5. 写一个错误示例文件，优先用 @ts-expect-error 标记预期错误。
6. 运行 npx tsc --noEmit 做类型检查。
7. 如果示例有运行时输出，再编译并用 node 运行。
8. 对照执行过程表格解释每一步。
9. 把本节整理进最终学习笔记。
```

### 推荐 tsconfig

继续使用前几章的严格配置，并为第 6 章显式保留这些选项：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noImplicitOverride": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
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
// Verify how this advanced TypeScript type example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`export {};` 的作用是把文件变成模块（module），防止不同练习文件里的同名变量污染全局作用域。

---

## 2. 项目重新整理建议

### 结论

第 6 章建议单独建立：

```txt
typescript/chapter-06-advanced-types/
```

不要把第 6 章混进 `chapter-03-types/` 或 `chapter-04-functions/`。第 6 章要训练的是“类型之间的关系”和“从类型生成类型”。

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
    README.md

    00-type-relationships/
      subtypeSupertype.ts
      topAndBottomTypes.ts

    01-assignability/
      structuralAssignability.ts
      excessPropertyAssignability.ts

    02-variance/
      arrayVariancePitfall.ts
      readonlyArrayVariance.ts
      functionParameterVariance.ts

    03-widening-refinement/
      literalWideningReview.ts
      controlFlowRefinement.ts
      mutationBreaksRefinement.ts
      mutationThroughFunctionCallPitfall.ts

    04-exhaustiveness/
      exhaustiveSwitch.ts
      assertNeverHelper.ts

    05-type-operators/
      keyofOperator.ts
      typeofTypeOperator.ts
      indexedAccessType.ts
      genericGetProperty.ts
      satisfiesOperator.ts

    06-record-type/
      recordWithKnownKeys.ts
      recordVsIndexSignature.ts

    07-mapped-types/
      mappedFlags.ts
      mappedModifiers.ts
      keyRemapping.ts

    08-companion-object-pattern/
      statusCompanionObject.ts
      runtimeValueStaticTypePair.ts

    09-tuple-inference/
      tupleHelper.ts
      readonlyTupleInference.ts

    10-user-defined-type-guards/
      isProductRecord.ts
      assertionFunction.ts

    11-conditional-types/
      basicConditionalType.ts
      conditionalApiResult.ts
      conditionalTypeRuntimeBoundary.ts

    12-distributive-conditional-types/
      distributiveConditional.ts
      nonDistributiveConditional.ts

    13-infer-keyword/
      inferArrayElement.ts
      inferFunctionReturn.ts
      inferPromiseValue.ts

    14-built-in-utility-types/
      extractExclude.ts
      pickOmit.ts
      awaitedReturnParameters.ts

    15-type-assertions/
      singleAssertion.ts
      doubleAssertionMistake.ts

    16-null-definite-assertions/
      nonNullAssertion.ts
      definiteAssignmentAssertion.ts

    17-nominal-types/
      brandedIds.ts
      opaqueAmount.ts

    18-safe-prototype-extension/
      globalAugmentation.ts
      prototypeExtensionRisk.ts

    19-mini-project/
      typedApiBoundary.ts
      domainBrandAndMapper.ts

notes/
  typescript.md
```

### 和前面章节的关系

```txt
第 3 章：
描述值本身的类型。

第 4 章：
描述函数输入输出关系。

第 5 章：
描述对象、类、接口和抽象边界。

第 6 章：
描述类型与类型之间如何比较、推导、转换和保护。
```

第 6 章学完后，你开始能理解很多真实项目里的类型写法：

```txt
keyof T
T[K]
Partial<T>
Record<K, V>
Pick<T, K>
Exclude<T, U>
Extract<T, U>
ReturnType<F>
Parameters<F>
Awaited<T>
T extends U ? X : Y
value is ProductRecord
asserts value is ProductRecord
Brand<T, Name>
```

---

## 3. 第 6 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
类型关系
  -> 子类型和超类型
  -> 可赋值性
  -> 型变
  -> 类型拓宽
  -> 类型细化
  -> 全面性检查
  -> keyof / typeof / indexed access
  -> Record
  -> mapped types
  -> companion object pattern
  -> tuple inference
  -> user-defined type guard
  -> assertion function
  -> conditional types
  -> distributive conditional types
  -> infer
  -> built-in utility types
  -> type assertions
  -> non-null assertion
  -> definite assignment assertion
  -> nominal type simulation
  -> safe prototype extension
  -> mini project
```

### 技术意义

这一章不是给你一堆“高级写法”，而是把 TypeScript 的类型系统变成可以推理的工具。

你要从这章开始养成一个习惯：

```txt
看到一个复杂类型，不先问“怎么背”。
先问：
  它输入什么类型？
  它输出什么类型？
  它在哪里分支？
  它在哪里遍历 key？
  它在哪里保留或丢失具体类型？
  它是否只存在于编译期？
```

---

## 4. 本章先要建立的底层模型

### 结论

TypeScript 类型进阶的底层模型可以拆成五个动作：

```txt
relate
  判断两个类型是否兼容。

narrow
  根据控制流把宽类型缩小成窄类型。

derive
  从已有值或类型提取新类型。

map
  遍历 key 生成新对象类型。

branch
  根据类型条件选择不同结果类型。
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| 子类型（subtype） | 比另一个类型更具体、更受限制的类型。 |
| 超类型（supertype） | 比另一个类型更宽泛、能容纳更多值的类型。 |
| 可赋值性（assignability） | 一个值或表达式的类型是否可以放到另一个类型位置。 |
| 型变（variance） | 类型参数出现在不同位置时，容器类型之间兼容关系如何变化。 |
| 协变（covariance） | 内部类型更具体时，整体类型也更具体。 |
| 逆变（contravariance） | 函数参数位置中，接受更宽类型的函数更容易被替换。 |
| 不变（invariance） | 类型参数必须完全一致才能兼容。 |
| 双向协变（bivariance） | 参数位置同时近似允许协变和逆变，是兼容 JS 回调习惯的折中。 |
| 类型拓宽（type widening） | 字面量类型扩大成更一般的类型。 |
| 类型细化（refinement / narrowing） | 控制流让 TypeScript 在局部分支里知道更具体的类型。 |
| 全面性检查（exhaustiveness checking） | 保证联合类型所有成员都被处理。 |
| 类型运算符（type operator） | 在类型位置对类型进行计算的语法，例如 `keyof`、`typeof`、`T[K]`。 |
| 映射类型（mapped type） | 遍历 key 生成新对象类型。 |
| 条件类型（conditional type） | 根据类型是否可赋值给另一个类型选择结果。 |
| 分配式条件类型（distributive conditional type） | 条件类型作用于联合类型时逐个成员分配计算。 |
| `infer` | 在条件类型中声明临时类型变量，从匹配结构中提取类型。 |
| 类型断言（type assertion） | 让 TypeScript 相信某个表达式是指定类型，但不做运行时检查。 |
| 品牌类型（branded type） | 在结构化类型系统中模拟名义类型的一种技巧。 |

### 底层机制总图

```txt
source code
  -> checker computes expression types
  -> assignability compares source type and target type
  -> control-flow analysis narrows unions
  -> type operators derive new types
  -> mapped types iterate keys
  -> conditional types branch on assignability
  -> infer extracts inner type pieces
  -> emitter erases type-only constructs
  -> runtime executes ordinary JavaScript
```

### 本章最重要的边界

第 6 章很多写法看起来“很强”，但它们都不会自动改变运行时行为：

```txt
keyof:
  does not enumerate runtime keys.

T[K]:
  does not read runtime property values.

mapped type:
  does not create runtime object.

conditional type:
  does not run if/else at runtime.

infer:
  does not inspect runtime values.

type assertion:
  does not validate data.

brand:
  does not create secure runtime identity unless you also add runtime validation.
```

### 第 6 章必须先补：类型层表达式不是运行时代码

第 6 章最容易看不懂，不是因为每个符号都难，而是因为同一个符号在 TypeScript 里可能出现在不同层级。你要先学会判断“它是在类型层计算，还是在运行时执行”。

| 写法 | 所属层级 | 读法 | 是否生成 JavaScript |
|---|---|---|---|
| `T extends U ? X : Y` | type system | 如果 `T` 可赋值给 `U`，结果是 `X`，否则是 `Y` | 否 |
| `ValueType extends { id: string }` | type system | 泛型参数必须满足这个结构 | 否 |
| `keyof T` | type system | 从对象类型 `T` 取 key union | 否 |
| `typeof value` | runtime expression | 运行时返回类型字符串 | 是 |
| `typeof value` in type position | type system | 从值提取静态类型 | 否 |
| `T[K]` | type system | 从对象类型 `T` 中，根据 key 类型 `K` 取 value 类型 | 否 |
| `obj[key]` | runtime expression | 从对象值读取属性值 | 是 |
| `[K in keyof T]` | type system | 映射类型遍历 key union | 否 |
| `[K in keyof T as NewKey]` | type system | 映射类型里重映射 key | 否 |
| `infer R` | type system | 在条件类型匹配结构中提取内部类型 | 否 |
| `value as T` | type system escape hatch | 让 checker 把表达式看成 `T` | 否 |
| `expr satisfies T` | type system check | 检查表达式满足 `T`，但保留表达式自己的推导类型 | 否 |

本章的操作模型是：

```txt
value-level code:
  creates objects
  reads properties
  calls functions
  runs if / switch
  mutates data

type-level code:
  compares types
  extracts keys
  extracts value types
  maps keys
  branches by assignability
  narrows static possibilities
```

所以看到复杂类型时，不要先背语法。先问：

```txt
This expression receives what type?
This expression returns what type?
Does it inspect runtime values?
Does it only help the checker?
```

---

### 第 6 章必须先补：`extends` 有两种常见含义

第 5 章里的 `class Child extends Parent` 是 JavaScript / TypeScript 的类继承语法。第 6 章里的 `extends` 经常不是这个意思。

```ts
type ResultType<ValueType> = ValueType extends string ? "text" : "other";
```

这里的 `extends` 不是创建继承关系，而是在类型层做可赋值性测试：

```txt
Can ValueType be assigned to string?
  yes -> "text"
  no  -> "other"
```

再看泛型约束：

```ts
function readId<ValueType extends { id: string }>(value: ValueType): string {
  return value.id;
}
```

这里的 `extends` 表示：

```txt
ValueType must at least have:
  id: string
```

它不是让 `ValueType` 继承某个类，而是限制可传入的类型结构。

因此本章看到 `extends` 时，固定先判断：

```txt
class A extends B:
  runtime inheritance plus type relationship.

T extends U:
  type-level assignability test or generic constraint.
```

---

## 5. 00：类型关系、子类型和超类型

### 结论

子类型更具体，超类型更宽泛。TypeScript 主要用结构化类型系统判断类型关系，而不是只看声明名。

### 技术意义

如果 `ProductRecord` 拥有 `EntityRecord` 需要的所有成员，那么 `ProductRecord` 可以被当成 `EntityRecord` 使用。这个关系不是因为继承，而是因为结构兼容。

### 文件结构

```txt
00-type-relationships/
  subtypeSupertype.ts
  topAndBottomTypes.ts
```

### `subtypeSupertype.ts`

```ts
// Goal:
// Verify subtype and supertype relationship through object structure.

// Expected result:
// The compiler accepts assigning a narrower object to a wider type.

export {};

type EntityRecord = {
  id: string;
};

type ProductRecord = {
  id: string;
  title: string;
  price: number;
};

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

const entityRecord: EntityRecord = productRecord;

console.log(entityRecord.id);
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `EntityRecord` 要求对象有 `id: string`。 |
| 2 | `ProductRecord` 有 `id`，还额外有 `title` 和 `price`。 |
| 3 | `ProductRecord` 比 `EntityRecord` 更具体。 |
| 4 | 更具体的值可以放进更宽泛的位置。 |
| 5 | 运行时仍然是同一个普通对象。 |

### `topAndBottomTypes.ts`

```ts
// Goal:
// Compare unknown as a top type and never as a bottom type.

// Expected result:
// The compiler accepts safe assignments and rejects unsafe ones.

export {};

let topValue: unknown;

topValue = "hello";
topValue = 42;
topValue = { id: "p1" };

function failWithMessage(messageText: string): never {
  throw new Error(messageText);
}

const impossibleValue = failWithMessage("failed");

// @ts-expect-error: unknown cannot be assigned to string without narrowing.
const titleText: string = topValue;

console.log(typeof impossibleValue);
console.log(typeof titleText);
```

### 记忆模型

```txt
unknown:
  top type.
  many values can flow into it.
  you must narrow before using it.

never:
  bottom type.
  no real value can be observed.
  it can flow into other types because it represents impossible code paths.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 子类型就是继承出来的类型 | 在 TS 中多数关系来自结构兼容。 |
| 属性更多就更宽 | 属性更多通常更具体，因为限制更多。 |
| `unknown` 可以直接使用 | `unknown` 只能接收，使用前必须细化。 |

---

## 6. 01：可赋值性

### 结论

可赋值性（assignability）回答的是：一个表达式的类型能不能放到某个目标类型位置。

### 技术意义

TypeScript 不是只比较“两个类型是否完全相等”。更常见的是比较“源类型是否足够满足目标类型要求”。

### 文件结构

```txt
01-assignability/
  structuralAssignability.ts
  excessPropertyAssignability.ts
```

### `structuralAssignability.ts`

```ts
// Goal:
// Verify assignment based on required members.

// Expected result:
// The compiler accepts compatible assignment and rejects missing members.

export {};

type UserSummary = {
  id: string;
  displayName: string;
};

const fullUserRecord = {
  id: "u1",
  displayName: "Ada",
  email: "ada@example.com",
};

const userSummary: UserSummary = fullUserRecord;

const missingNameRecord = {
  id: "u2",
};

// @ts-expect-error: displayName is required.
const brokenSummary: UserSummary = missingNameRecord;

console.log(userSummary.displayName);
console.log(typeof brokenSummary);
```

### `excessPropertyAssignability.ts`

```ts
// Goal:
// Compare direct object literal checking and variable assignment.

// Expected result:
// The compiler rejects excess properties on direct object literals.

export {};

type ProductCard = {
  id: string;
  title: string;
};

const productSource = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

const acceptedCard: ProductCard = productSource;

const rejectedCard: ProductCard = {
  id: "p2",
  title: "Mouse",
  // @ts-expect-error: Direct object literals receive excess property checks.
  price: 25,
};

console.log(acceptedCard.title);
console.log(typeof rejectedCard);
```

### 底层机制

```txt
source expression type
  -> compared with target type
  -> required members must exist
  -> member types must be compatible
  -> direct object literals receive an extra typo-catching check
```

### 常见错误

```txt
错误：
对象字面量多一个属性永远不行。

正确：
直接对象字面量会触发 excess property check。
已经保存到变量里的对象按结构可赋值性检查。
```

---

## 7. 02：型变 variance

### 结论

型变描述的是：`Container<Sub>` 和 `Container<Super>` 之间是否兼容。第 6 章必须重点理解数组、只读数组和函数参数位置。

### 技术意义

型变不是语法，而是类型参数在不同位置出现时形成的兼容关系。

```txt
output position:
  tends to be covariant.

input position:
  tends to be contravariant.

read and write position:
  tends to require invariance.
```

### 文件结构

```txt
02-variance/
  arrayVariancePitfall.ts
  readonlyArrayVariance.ts
  functionParameterVariance.ts
```

### `arrayVariancePitfall.ts`

```ts
// Goal:
// Observe why mutable arrays are risky with subtype relationships.

// Expected result:
// This example shows a runtime pitfall.

export {};

type AnimalRecord = {
  name: string;
};

type DogRecord = AnimalRecord & {
  bark(): void;
};

type CatRecord = AnimalRecord & {
  meow(): void;
};

const dogList: DogRecord[] = [
  {
    name: "Rex",
    bark() {
      console.log("woof");
    },
  },
];

const animalList: AnimalRecord[] = dogList;

animalList.push({
  name: "Misty",
} as CatRecord);

const firstDog = dogList[1];

firstDog?.bark();
```

### 说明

这段代码展示 mutable array 的风险。`DogRecord[]` 被当成 `AnimalRecord[]` 后，写入一个不是 dog 的 animal，会让原来的 dog array 被污染。不同 TS 配置和具体代码形状下，类型系统会有不同宽松程度，但你要记住底层风险：可写容器既读又写，天然不如只读容器安全。

### `readonlyArrayVariance.ts`

```ts
// Goal:
// Prefer readonly arrays when only reading values.

// Expected result:
// The compiler accepts reading through a wider readonly array.

export {};

type AnimalRecord = {
  name: string;
};

type DogRecord = AnimalRecord & {
  bark(): void;
};

const dogs: readonly DogRecord[] = [
  {
    name: "Rex",
    bark() {
      console.log("woof");
    },
  },
];

const animals: readonly AnimalRecord[] = dogs;

for (const animal of animals) {
  console.log(animal.name);
}

// @ts-expect-error: A readonly array cannot be mutated.
animals.push({ name: "Misty" });
```

### `functionParameterVariance.ts`

```ts
// Goal:
// Understand function parameter compatibility under strictFunctionTypes.

// Expected result:
// The compiler rejects an unsafe callback assignment.

export {};

type AnimalRecord = {
  name: string;
};

type DogRecord = AnimalRecord & {
  bark(): void;
};

type AnimalHandler = (animal: AnimalRecord) => void;
type DogHandler = (dog: DogRecord) => void;

const dogOnlyHandler: DogHandler = (dog) => {
  dog.bark();
};

// @ts-expect-error: A dog-only handler cannot safely handle every animal.
const unsafeAnimalHandler: AnimalHandler = dogOnlyHandler;

console.log(typeof unsafeAnimalHandler);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `Dog extends Animal` 所以 `Array<Dog>` 一定能安全当 `Array<Animal>` | 可写数组会有写入风险。 |
| 函数参数越具体越安全 | 回调参数位置通常相反，能接收更宽类型的函数更通用。 |
| 看到 `extends` 就只想到类继承 | 类型关系里的 `extends` 常表示可赋值关系。 |

---

## 8. 03：类型拓宽和类型细化

### 结论

类型拓宽让变量可以接收更多未来值；类型细化让 TypeScript 在某个控制流分支里得到更具体的类型。

### 技术意义

拓宽发生在声明和初始化附近；细化发生在控制流中。一个负责“给变量留空间”，一个负责“根据检查缩小可能性”。

### 文件结构

```txt
03-widening-refinement/
  literalWideningReview.ts
  controlFlowRefinement.ts
  mutationBreaksRefinement.ts
```

### `literalWideningReview.ts`

```ts
// Goal:
// Review literal widening and const assertion.

// Expected result:
// The compiler accepts literal-preserving values and rejects widened values.

export {};

let mutableStatus = "draft";
const fixedStatus = "draft";
const statusConfig = {
  status: "draft",
} as const;

// @ts-expect-error: mutableStatus is widened to string.
const onlyDraftFromLet: "draft" = mutableStatus;

const onlyDraftFromConst: "draft" = fixedStatus;
const onlyDraftFromObject: "draft" = statusConfig.status;

console.log(onlyDraftFromConst);
console.log(onlyDraftFromObject);
console.log(typeof onlyDraftFromLet);
```

### `controlFlowRefinement.ts`

```ts
// Goal:
// Narrow a union type through control flow.

// Expected result:
// The compiler accepts branch-specific operations.

export {};

type InputValue = string | number | null;

function formatInput(inputValue: InputValue): string {
  if (inputValue === null) {
    return "empty";
  }

  if (typeof inputValue === "number") {
    return inputValue.toFixed(2);
  }

  return inputValue.trim().toUpperCase();
}

console.log(formatInput(" keyboard "));
console.log(formatInput(12));
console.log(formatInput(null));
```

### `mutationBreaksRefinement.ts`

```ts
// Goal:
// Observe that direct mutation invalidates a previous property refinement.

// Expected result:
// The compiler rejects unsafe access after direct mutation.

export {};

type ProductDraft = {
  title?: string;
};

function renderDraft(draft: ProductDraft): string {
  if (draft.title !== undefined) {
    delete draft.title;

    // @ts-expect-error: title may be missing after direct mutation.
    return draft.title.toUpperCase();
  }

  return "missing";
}

console.log(renderDraft({ title: "Keyboard" }));
```

### `mutationThroughFunctionCallPitfall.ts`

```ts
// Goal:
// Show that TypeScript does not fully track mutation hidden inside another function.

// Expected result:
// The compiler accepts this file, but runtime can still fail.

export {};

type ProductDraft = {
  title?: string;
};

function clearTitle(draft: ProductDraft): void {
  delete draft.title;
}

function renderDraft(draft: ProductDraft): string {
  if (draft.title !== undefined) {
    clearTitle(draft);

    return draft.title.toUpperCase();
  }

  return "missing";
}

try {
  console.log(renderDraft({ title: "Keyboard" }));
} catch (errorValue) {
  console.log(errorValue instanceof TypeError);
}
```

这两个文件要一起看：

```txt
direct mutation:
  TypeScript can see the property was deleted.

mutation hidden inside another function:
  TypeScript does not fully model arbitrary side effects.
  The code may still compile, but runtime can fail.
```

这就是第 6 章必须建立的边界：control-flow analysis 很强，但不是完整的程序证明系统。

### 常见错误

```txt
错误：
if 检查过一次，后面永远安全。

正确：
细化依赖控制流和数据是否被修改。
函数调用、别名引用、对象属性变更都可能破坏之前的假设。
```

---

## 9. 04：全面性检查和 never

### 结论

全面性检查用 `never` 确认联合类型的所有成员都被处理。它是写可靠状态机、请求状态和事件处理器的核心技巧。

### 文件结构

```txt
04-exhaustiveness/
  exhaustiveSwitch.ts
  assertNeverHelper.ts
```

### `exhaustiveSwitch.ts`

```ts
// Goal:
// Use never to enforce exhaustive switch handling.

// Expected result:
// The compiler accepts the exhaustive switch.

export {};

type RequestState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; data: string[] }
  | { kind: "error"; message: string };

function renderState(state: RequestState): string {
  switch (state.kind) {
    case "idle":
      return "Idle";
    case "loading":
      return "Loading";
    case "success":
      return state.data.join(",");
    case "error":
      return state.message;
    default: {
      const exhaustiveValue: never = state;
      return exhaustiveValue;
    }
  }
}

console.log(renderState({ kind: "success", data: ["a", "b"] }));
```

### `assertNeverHelper.ts`

```ts
// Goal:
// Create an assertNever helper for exhaustive checks.

// Expected result:
// The compiler rejects missing variants.

export {};

type PaymentState =
  | { kind: "pending" }
  | { kind: "paid"; receiptId: string }
  | { kind: "failed"; reason: string };

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function renderPaymentState(state: PaymentState): string {
  switch (state.kind) {
    case "pending":
      return "Pending";
    case "paid":
      return state.receiptId;
    case "failed":
      return state.reason;
    default:
      return assertNever(state);
  }
}

console.log(renderPaymentState({ kind: "paid", receiptId: "r1" }));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| default 分支随便返回一个字符串 | 这样不能让 TS 检查是否漏分支。 |
| 新增联合成员后不检查旧 switch | `never` 会把遗漏变成编译错误。 |
| 把 `never` 当空值 | `never` 表示不可到达、不会产生可观察值。 |

---

## 10. 05：对象类型的类型运算符

### 结论

对象类型运算符让你从已有类型中提取 key、提取值类型、从运行时值反推静态类型。核心工具是 `keyof`、类型位置的 `typeof` 和索引访问类型 `T[K]`。

### 技术意义

这些运算符解决的是“类型不要重复写”的问题。你可以让一个类型自动跟着另一个类型变化。

### 文件结构

```txt
05-type-operators/
  keyofOperator.ts
  typeofTypeOperator.ts
  indexedAccessType.ts
```

### `keyofOperator.ts`

```ts
// Goal:
// Use keyof to limit property names to known keys.

// Expected result:
// The compiler accepts valid keys and rejects unknown keys.

export {};

type ProductRecord = {
  id: string;
  title: string;
  price: number;
};

function readProductValue(product: ProductRecord, key: keyof ProductRecord): string | number {
  return product[key];
}

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

console.log(readProductValue(productRecord, "title"));

// @ts-expect-error: stock is not a key of ProductRecord.
console.log(readProductValue(productRecord, "stock"));
```

### `typeofTypeOperator.ts`

```ts
// Goal:
// Use typeof in a type context to derive a type from a value.

// Expected result:
// The compiler keeps the value and type in sync.

export {};

const defaultProduct = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

type ProductRecord = typeof defaultProduct;

const nextProduct: ProductRecord = {
  id: "p2",
  title: "Mouse",
  price: 25,
};

console.log(nextProduct.title);
```

### `indexedAccessType.ts`

```ts
// Goal:
// Use indexed access types to extract property value types.

// Expected result:
// The compiler derives the property and array element types.

export {};

type ProductRecord = {
  id: string;
  title: string;
  price: number;
  tags: string[];
};

type ProductId = ProductRecord["id"];
type ProductValue = ProductRecord[keyof ProductRecord];
type ProductTag = ProductRecord["tags"][number];

const productId: ProductId = "p1";
const productTag: ProductTag = "featured";

const productValueList: ProductValue[] = [
  "Keyboard",
  99,
  ["featured"],
];

console.log(productId);
console.log(productTag);
console.log(productValueList.length);
```

### 本节必须先补：`keyof`、`typeof`、`T[K]` 三者不是同一件事

这三个写法经常连在一起出现，但它们做的是三种不同动作。

```txt
keyof T:
  从对象类型 T 取 key union。

typeof value:
  在类型位置里，从运行时值 value 提取静态类型。

T[K]:
  从对象类型 T 中，根据 key 类型 K 取 value 类型。
```

看这一行：

```ts
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

拆开读：

```txt
typeof ORDER_STATUS:
  得到 ORDER_STATUS 这个值的静态对象类型。

keyof typeof ORDER_STATUS:
  得到这个对象类型的 key union。

(typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]:
  用所有 key 去索引这个对象类型，得到所有 value 的 union。
```

注意：这里没有读取运行时对象，也没有执行循环。它是 TypeScript checker 在类型层做的计算。

### `genericGetProperty.ts`

```ts
// Goal:
// Connect a key parameter with its value type using keyof and indexed access.

// Expected result:
// The compiler returns the exact value type for each key.

export {};

type ProductRecord = {
  id: string;
  title: string;
  price: number;
};

function getProperty<SourceType, KeyName extends keyof SourceType>(
  source: SourceType,
  key: KeyName,
): SourceType[KeyName] {
  return source[key];
}

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

const titleText = getProperty(productRecord, "title");
const priceValue = getProperty(productRecord, "price");

console.log(titleText.toUpperCase());
console.log(priceValue.toFixed(2));

// @ts-expect-error: stock is not a key of ProductRecord.
console.log(getProperty(productRecord, "stock"));
```

执行过程：

| 代码 | 类型层发生什么 |
|---|---|
| `KeyName extends keyof SourceType` | `key` 必须是 `source` 类型里的合法 key。 |
| `SourceType[KeyName]` | 返回值类型跟随具体 key 变化。 |
| `getProperty(productRecord, "title")` | `KeyName` 推导为 `"title"`，返回 `string`。 |
| `getProperty(productRecord, "price")` | `KeyName` 推导为 `"price"`，返回 `number`。 |

这个例子是 `keyof` 和 `T[K]` 的核心用途：把“传入哪个 key”和“返回什么 value”绑定起来。

### `satisfiesOperator.ts`

```ts
// Goal:
// Check an object against a target type while preserving precise inference.

// Expected result:
// The compiler checks keys and keeps literal property types.

export {};

type RouteName = "home" | "products";

type RouteConfig = {
  path: string;
  requiresAuth: boolean;
};

const routeConfigMap = {
  home: {
    path: "/",
    requiresAuth: false,
  },
  products: {
    path: "/products",
    requiresAuth: true,
  },
} as const satisfies Record<RouteName, RouteConfig>;

const homePath: "/" = routeConfigMap.home.path;
const productsRequiresAuth: true = routeConfigMap.products.requiresAuth;

console.log(homePath);
console.log(productsRequiresAuth);

const brokenRouteConfigMap = {
  home: {
    path: "/",
    requiresAuth: false,
  },
  products: {
    path: "/products",
    requiresAuth: true,
  },
  // @ts-expect-error: admin is not part of RouteName.
  admin: {
    path: "/admin",
    requiresAuth: true,
  },
} satisfies Record<RouteName, RouteConfig>;

console.log(typeof brokenRouteConfigMap);
```

`satisfies` 和类型注解、类型断言的区别：

| 写法 | 检查目标类型 | 是否保留表达式自己的精确推导 | 是否绕过类型检查 |
|---|---:|---:|---:|
| `const x: T = expr` | 是 | 通常会被目标类型约束并可能变宽 | 否 |
| `const x = expr satisfies T` | 是 | 是 | 否 |
| `const x = expr as T` | 弱 | 否，直接要求 checker 相信 `T` | 可能 |

在第 6 章里，`satisfies` 的价值是：它让你检查配置对象是否符合 `Record<K, V>`，同时又不丢失对象内部具体字面量类型。

### 常见错误

```txt
keyof T:
  creates a union of known property keys.

typeof value:
  in type position, gets the static type of a value.

T[K]:
  gets the value type behind key K.

None of them reads runtime data by itself.
```

---

## 11. 06：Record 类型

### 结论

`Record<KeyType, ValueType>` 用来描述“键集合到值类型”的对象映射。它适合有限 key 集合，也适合简单字典。

### 技术意义

`Record` 是常见工具类型，不是特殊运行时对象。它本质上生成一个对象类型，要求指定 key 都存在并拥有指定值类型。

### 文件结构

```txt
06-record-type/
  recordWithKnownKeys.ts
  recordVsIndexSignature.ts
```

### `recordWithKnownKeys.ts`

```ts
// Goal:
// Use Record with a known key union.

// Expected result:
// The compiler requires all known keys.

export {};

type FeatureName = "search" | "checkout" | "profile";

type FeatureConfig = {
  enabled: boolean;
};

const featureConfigMap: Record<FeatureName, FeatureConfig> = {
  search: { enabled: true },
  checkout: { enabled: false },
  profile: { enabled: true },
};

console.log(featureConfigMap.search.enabled);

// @ts-expect-error: reports is not a known feature key.
featureConfigMap.reports = { enabled: true };
```

### `recordVsIndexSignature.ts`

```ts
// Goal:
// Compare Record with string keys and unknown property access.

// Expected result:
// With noUncheckedIndexedAccess, unknown keys include undefined.

export {};

type ScoreMap = Record<string, number>;

const scoreMap: ScoreMap = {
  quality: 90,
};

const qualityScore = scoreMap["quality"];
const missingScore = scoreMap["speed"];

// @ts-expect-error: missingScore may be undefined.
const strictScore: number = missingScore;

console.log(qualityScore);
console.log(strictScore);
```

### 本节必须先补：`Record<string, V>` 和属性访问方式

当你开启了本章推荐的 `noPropertyAccessFromIndexSignature` 后，来自索引签名的属性应该用 bracket access 读取：

```ts
const score = scoreMap["quality"];
```

而不是：

```ts
const score = scoreMap.quality;
```

原因是 `Record<string, number>` 的含义不是“这个对象真的声明了一个叫 `quality` 的固定属性”，而是：

```txt
Any string key is allowed by the type.
The value behind that key is number.
```

配合 `noUncheckedIndexedAccess` 后，未知 key 读取还要考虑 `undefined`：

```txt
scoreMap["quality"]:
  number | undefined
```

所以第 6 章要把两个问题分开：

```txt
Can this key be used syntactically?
  Record<string, number> says yes for string keys.

Does this key definitely exist at runtime?
  noUncheckedIndexedAccess says not necessarily.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 用 `Record<string, T>` 后以为任何 key 都一定存在 | 开启 `noUncheckedIndexedAccess` 后，未知 key 读取应包含 `undefined`。 |
| 有固定 key 集合却写宽泛 string 索引 | 用字面量联合当 key 更安全。 |
| 把 `Record` 当 `Map` | `Record` 是对象类型，`Map` 是运行时数据结构。 |

---

## 12. 07：映射类型

### 结论

映射类型（mapped type）遍历 key union 生成新的对象类型。它是很多工具类型的底层机制。

### 技术意义

当你想“保留原对象的 key，但改变值类型或属性修饰符”时，用映射类型。

### 文件结构

```txt
07-mapped-types/
  mappedFlags.ts
  mappedModifiers.ts
  keyRemapping.ts
```

### `mappedFlags.ts`

```ts
// Goal:
// Map every property to a boolean flag.

// Expected result:
// The compiler derives a flag object from the source type.

export {};

type FeatureHandlers = {
  search(): void;
  checkout(): void;
  profile(): void;
};

type FeatureFlags<SourceType> = {
  [KeyName in keyof SourceType]: boolean;
};

const featureFlags: FeatureFlags<FeatureHandlers> = {
  search: true,
  checkout: false,
  profile: true,
};

console.log(featureFlags.search);
```

### `mappedModifiers.ts`

```ts
// Goal:
// Remove readonly and optional modifiers in a mapped type.

// Expected result:
// The compiler requires all mutable properties.

export {};

type DraftProduct = {
  readonly id?: string;
  readonly title?: string;
};

type CompleteMutable<SourceType> = {
  -readonly [KeyName in keyof SourceType]-?: SourceType[KeyName];
};

const completeProduct: CompleteMutable<DraftProduct> = {
  id: "p1",
  title: "Keyboard",
};

completeProduct.title = "Mouse";

console.log(completeProduct.title);
```

### `keyRemapping.ts`

```ts
// Goal:
// Remap keys with template literal types.

// Expected result:
// The compiler requires remapped getter names.

export {};

type ProductRecord = {
  id: string;
  title: string;
  price: number;
};

type GetterMap<SourceType> = {
  [KeyName in keyof SourceType as `get${Capitalize<string & KeyName>}`]: () => SourceType[KeyName];
};

const productGetters: GetterMap<ProductRecord> = {
  getId: () => "p1",
  getTitle: () => "Keyboard",
  getPrice: () => 99,
};

console.log(productGetters.getTitle());
```

### 本节必须先补：映射类型不是运行时 `map()`

映射类型的语法：

```ts
type Mapped<SourceType> = {
  [KeyName in keyof SourceType]: SourceType[KeyName];
};
```

要按类型层循环来读：

```txt
keyof SourceType:
  先得到 key union。

KeyName in keyof SourceType:
  逐个取出 union 里的 key。

SourceType[KeyName]:
  取出当前 key 对应的 value type。

{ ... }:
  生成新的对象类型。
```

它和 JavaScript 的 `array.map()` 不在同一层：

```txt
array.map(callback):
  runtime loop
  creates a runtime array value

mapped type:
  type-level key iteration
  creates a static object type
```

`keyRemapping.ts` 里的 `as` 也不是类型断言。这里：

```ts
[KeyName in keyof SourceType as `get${Capitalize<string & KeyName>}`]
```

`as` 的作用是重命名 key：

```txt
id    -> getId
title -> getTitle
price -> getPrice
```

不是把某个值断言成另一个类型。

### 常见错误

```txt
错误：
映射类型会创建对象。

正确：
映射类型只创建对象类型。
运行时对象仍然要自己创建。
```

---

## 13. 08：伴生对象模式

### 结论

伴生对象模式（companion object pattern）把运行时值和静态类型放在同一个名字附近，常用于状态枚举、常量集合、解析器、验证器。

### 技术意义

TypeScript 类型会被擦除。真实项目经常需要“运行时值”和“静态类型”成对出现。

### 文件结构

```txt
08-companion-object-pattern/
  statusCompanionObject.ts
  runtimeValueStaticTypePair.ts
```

### `statusCompanionObject.ts`

```ts
// Goal:
// Create a runtime object and derive a static union type from it.

// Expected result:
// The compiler accepts known statuses and rejects unknown statuses.

export {};

const OrderStatus = {
  Draft: "draft",
  Paid: "paid",
  Shipped: "shipped",
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

function renderStatus(status: OrderStatus): string {
  return status.toUpperCase();
}

console.log(renderStatus(OrderStatus.Paid));

// @ts-expect-error: This status is not in OrderStatus.
console.log(renderStatus("cancelled"));
```

### `runtimeValueStaticTypePair.ts`

```ts
// Goal:
// Pair a runtime validator with the type it validates.

// Expected result:
// The compiler narrows unknown input after validation.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

const ProductRecord = {
  is(value: unknown): value is ProductRecord {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return typeof candidate["id"] === "string" && typeof candidate["title"] === "string";
  },
};

const rawValue: unknown = JSON.parse('{"id":"p1","title":"Keyboard"}');

if (ProductRecord.is(rawValue)) {
  console.log(rawValue.title);
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 类型别名可以运行时检查数据 | 类型被擦除，必须写 validator。 |
| 只写 const object 不导出类型 | 调用方得不到静态约束。 |
| 只写 type union 不提供 runtime values | 运行时代码没有可复用常量。 |

---

## 14. 09：改善元组的类型推导

### 结论

普通数组字面量经常被推导成数组；元组 helper、`as const` 和 `readonly` 元组可以保留位置和长度信息。

### 技术意义

函数参数、路由段、事件 payload、坐标、返回多值时，经常需要“第几个位置是什么类型”。这就是元组比数组更准确的地方。

### 文件结构

```txt
09-tuple-inference/
  tupleHelper.ts
  readonlyTupleInference.ts
```

### `tupleHelper.ts`

```ts
// Goal:
// Preserve tuple item positions with a helper function.

// Expected result:
// The compiler preserves [string, number] rather than widening to array.

export {};

function tuple<FirstType, SecondType>(
  firstValue: FirstType,
  secondValue: SecondType,
): [FirstType, SecondType] {
  return [firstValue, secondValue];
}

const productPair = tuple("Keyboard", 99);

const titleText = productPair[0];
const priceValue = productPair[1];

console.log(titleText.toUpperCase());
console.log(priceValue.toFixed(2));
```

### `readonlyTupleInference.ts`

```ts
// Goal:
// Preserve literal tuple information with as const.

// Expected result:
// The compiler treats the tuple as readonly literal values.

export {};

const routeParts = ["products", "p1"] as const;

type RouteName = typeof routeParts[0];
type ProductId = typeof routeParts[1];

const routeName: RouteName = "products";
const productId: ProductId = "p1";

// @ts-expect-error: routeParts is readonly.
routeParts.push("extra");

console.log(routeName);
console.log(productId);
```

### 常见错误

```txt
array:
  variable length.
  same element type or union element type.

tuple:
  fixed position meaning.
  fixed or constrained length.
  each position can have a different type.
```

---

## 15. 10：用户定义的类型防护措施

### 结论

用户定义的类型防护措施（user-defined type guard）用返回类型 `value is Type` 把运行时检查结果告诉 TypeScript。

### 技术意义

从 JSON、localStorage、URL query、postMessage、第三方 SDK 进入的数据，在类型上应该先是 `unknown`。只有通过运行时检查后，才能变成业务类型。

### 文件结构

```txt
10-user-defined-type-guards/
  isProductRecord.ts
  assertionFunction.ts
```

### `isProductRecord.ts`

```ts
// Goal:
// Use a user-defined type guard to narrow unknown data.

// Expected result:
// The compiler allows ProductRecord access after the guard.

export {};

type ProductRecord = {
  id: string;
  price: number;
};

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate["id"] === "string" && typeof candidate["price"] === "number";
}

const rawValue: unknown = JSON.parse('{"id":"p1","price":99}');

if (isProductRecord(rawValue)) {
  console.log(rawValue.price.toFixed(2));
}
```

### `assertionFunction.ts`

```ts
// Goal:
// Use an assertion function to stop execution when data is invalid.

// Expected result:
// The compiler narrows after the assertion call.

export {};

type UserRecord = {
  id: string;
  email: string;
};

function assertUserRecord(value: unknown): asserts value is UserRecord {
  if (typeof value !== "object" || value === null) {
    throw new Error("Invalid user");
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate["id"] !== "string" || typeof candidate["email"] !== "string") {
    throw new Error("Invalid user");
  }
}

const rawUser: unknown = JSON.parse('{"id":"u1","email":"ada@example.com"}');

assertUserRecord(rawUser);

console.log(rawUser.email.toLowerCase());
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `value is T` 自动验证数据 | 你必须在函数体里真的写运行时检查。 |
| 用断言函数代替所有错误处理 | 断言函数会抛错，适合边界校验或不变量检查。 |
| 直接把 unknown as ProductRecord | 断言不等于验证。 |

---

## 16. 11：条件类型

### 结论

条件类型根据类型可赋值关系选择结果类型，形状是 `T extends U ? X : Y`。

### 技术意义

条件类型用来描述“输入类型不同，输出类型也不同”的类型层关系。它能替代很多重复重载。

### 文件结构

```txt
11-conditional-types/
  basicConditionalType.ts
  conditionalApiResult.ts
```

### `basicConditionalType.ts`

```ts
// Goal:
// Use a conditional type to choose a result type.

// Expected result:
// The compiler computes different result types.

export {};

type LabelFor<ValueType> = ValueType extends number
  ? { id: number }
  : { name: string };

const idLabel: LabelFor<number> = {
  id: 1,
};

const nameLabel: LabelFor<string> = {
  name: "Keyboard",
};

console.log(idLabel.id);
console.log(nameLabel.name);
```

### `conditionalApiResult.ts`

```ts
// Goal:
// Model different API result shapes based on input type.

// Expected result:
// The compiler derives a result shape from the input mode.

export {};

type RequestMode = "list" | "single";

type ProductRecord = {
  id: string;
  title: string;
};

type ApiData<ModeType extends RequestMode> = ModeType extends "list"
  ? ProductRecord[]
  : ProductRecord;

function createMockData<ModeType extends RequestMode>(mode: ModeType): ApiData<ModeType> {
  if (mode === "list") {
    return [{ id: "p1", title: "Keyboard" }] as ApiData<ModeType>;
  }

  return { id: "p1", title: "Keyboard" } as ApiData<ModeType>;
}

const listData = createMockData("list");
const singleData = createMockData("single");

console.log(listData[0]?.title);
console.log(singleData.title);
```

### `conditionalTypeRuntimeBoundary.ts`

```ts
// Goal:
// Separate a conditional type from a runtime branch.

// Expected result:
// The compiler computes the type, and runtime code still uses an if statement.

export {};

type ResponseShape<IsListType extends boolean> = IsListType extends true
  ? string[]
  : string;

function createResponse<IsListType extends boolean>(
  isList: IsListType,
): ResponseShape<IsListType> {
  if (isList) {
    return ["keyboard", "mouse"] as ResponseShape<IsListType>;
  }

  return "keyboard" as ResponseShape<IsListType>;
}

const listResponse = createResponse(true);
const singleResponse = createResponse(false);

console.log(listResponse.join(","));
console.log(singleResponse.toUpperCase());
```

这段代码里有两个不同层次：

```txt
type level:
  ResponseShape<true> becomes string[].
  ResponseShape<false> becomes string.

runtime level:
  if (isList) chooses the actual returned value.
```

条件类型不能替你生成运行时分支。你仍然需要真实的 `if` 来返回正确值。函数体里的 `as ResponseShape<IsListType>` 是因为 TypeScript 在泛型函数体内不能完全根据 `if (isList)` 证明返回值和泛型条件类型一一对应。

### 常见错误

```txt
错误：
条件类型是运行时 if。

正确：
条件类型只在类型系统中计算。
运行时代码仍然需要真实 if / switch。
```

---

## 17. 12：条件分配

### 结论

当条件类型的检查对象是裸类型参数时，传入联合类型会被自动拆开逐个计算，这叫分配式条件类型（distributive conditional type）。

### 技术意义

很多内置工具类型都依赖这个机制，比如 `Exclude<T, U>`、`Extract<T, U>`。

### 文件结构

```txt
12-distributive-conditional-types/
  distributiveConditional.ts
  nonDistributiveConditional.ts
```

### `distributiveConditional.ts`

```ts
// Goal:
// Observe distributive conditional types over unions.

// Expected result:
// The compiler distributes over each union member.

export {};

type ToArray<ValueType> = ValueType extends unknown ? ValueType[] : never;

type StringOrNumberArray = ToArray<string | number>;

const firstList: StringOrNumberArray = ["a", "b"];
const secondList: StringOrNumberArray = [1, 2];

// @ts-expect-error: This is not string[] or number[].
const mixedList: StringOrNumberArray = ["a", 1];

console.log(firstList.length);
console.log(secondList.length);
console.log(mixedList.length);
```

### `nonDistributiveConditional.ts`

```ts
// Goal:
// Stop distributive behavior by wrapping both sides in tuples.

// Expected result:
// The compiler keeps the union as one whole type.

export {};

type ToArrayNonDistributive<ValueType> = [ValueType] extends [unknown]
  ? ValueType[]
  : never;

type MixedArray = ToArrayNonDistributive<string | number>;

const mixedArray: MixedArray = ["a", 1, 2, "b"];

console.log(mixedArray.length);
```

### 本节必须先补：为什么叫“裸类型参数”

所谓 naked type parameter，就是类型参数直接站在 `extends` 左边：

```ts
type ToArray<ValueType> = ValueType extends unknown ? ValueType[] : never;
```

如果传入：

```ts
type Result = ToArray<string | number>;
```

TypeScript 不是一次性计算：

```txt
(string | number)[] 
```

而是先拆 union：

```txt
ToArray<string> | ToArray<number>
```

再得到：

```txt
string[] | number[]
```

如果你写：

```ts
type ToArrayNonDistributive<ValueType> = [ValueType] extends [unknown]
  ? ValueType[]
  : never;
```

`ValueType` 不再裸露，TypeScript 就会把 union 当成整体处理，得到：

```txt
(string | number)[]
```

这就是为什么 `["a", 1]` 对 `string[] | number[]` 不合法，但对 `(string | number)[]` 合法。

### 记忆模型

```txt
T extends U ? X : Y:
  distributive when T is a naked type parameter.

[T] extends [U] ? X : Y:
  non-distributive because T is wrapped.
```

---

## 18. 13：infer 关键字

### 结论

`infer` 只能出现在条件类型的 `extends` 分支中，用来从匹配结构中提取内部类型。

### 技术意义

`infer` 让你不用手动索引复杂类型。你可以从数组、函数、Promise、构造函数等结构里提取内部类型。

### 文件结构

```txt
13-infer-keyword/
  inferArrayElement.ts
  inferFunctionReturn.ts
```

### `inferArrayElement.ts`

```ts
// Goal:
// Extract an array element type with infer.

// Expected result:
// The compiler extracts ProductRecord from ProductRecord[].

export {};

type ElementOf<ValueType> = ValueType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

type ProductRecord = {
  id: string;
  title: string;
};

type ProductElement = ElementOf<readonly ProductRecord[]>;

const product: ProductElement = {
  id: "p1",
  title: "Keyboard",
};

console.log(product.title);
```

### `inferFunctionReturn.ts`

```ts
// Goal:
// Extract a function return type with infer.

// Expected result:
// The compiler extracts the return object type.

export {};

type ReturnValueOf<FunctionType> = FunctionType extends (...args: never[]) => infer ReturnType
  ? ReturnType
  : never;

function createProduct() {
  return {
    id: "p1",
    title: "Keyboard",
  };
}

type CreatedProduct = ReturnValueOf<typeof createProduct>;

const product: CreatedProduct = createProduct();

console.log(product.title);
```

### `inferPromiseValue.ts`

```ts
// Goal:
// Extract the resolved value type from a Promise-like type.

// Expected result:
// The compiler extracts the final ProductRecord type.

export {};

type UnwrapPromise<ValueType> = ValueType extends Promise<infer ResolvedType>
  ? ResolvedType
  : ValueType;

type ProductRecord = {
  id: string;
  title: string;
};

async function fetchProduct(): Promise<ProductRecord> {
  return {
    id: "p1",
    title: "Keyboard",
  };
}

type FetchedProduct = UnwrapPromise<ReturnType<typeof fetchProduct>>;

const product: FetchedProduct = {
  id: "p1",
  title: "Keyboard",
};

console.log(product.title);
```

`infer` 的操作模型不是“运行 fetchProduct 拿到返回值”，而是：

```txt
ReturnType<typeof fetchProduct>:
  Promise<ProductRecord>

Promise<infer ResolvedType>:
  匹配 Promise<...> 结构，并把里面的 ProductRecord 捕获为 ResolvedType

UnwrapPromise<...>:
  返回 ResolvedType
```

实际项目里优先用内置 `Awaited<T>`，这个文件只是为了让你看懂 `infer` 的提取机制。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 在普通 type alias 里随便写 infer | `infer` 只能在 conditional type 的 extends 匹配结构里使用。 |
| `infer` 会读取运行时返回值 | 它只提取静态类型。 |
| 能用内置工具类型时还手写复杂 infer | 先用 `ReturnType`、`Parameters`、`Awaited` 等内置工具。 |

---

## 19. 14：内置条件类型和工具类型

### 结论

内置工具类型是 TypeScript 已经提供好的常见类型转换工具。先理解底层机制，再使用它们，不要把它们当黑盒背诵。

### 技术意义

工具类型能减少重复代码，但过度嵌套会降低可读性。真实项目中常用的是少数几个高频工具。

### 文件结构

```txt
14-built-in-utility-types/
  extractExclude.ts
  pickOmit.ts
  awaitedReturnParameters.ts
```

### `extractExclude.ts`

```ts
// Goal:
// Use Extract and Exclude to filter union members.

// Expected result:
// The compiler accepts filtered union members.

export {};

type AppEvent =
  | "product:create"
  | "product:update"
  | "user:create"
  | "user:delete";

type ProductEvent = Extract<AppEvent, `product:${string}`>;
type NonUserDeleteEvent = Exclude<AppEvent, "user:delete">;

const productEvent: ProductEvent = "product:create";
const safeEvent: NonUserDeleteEvent = "user:create";

// @ts-expect-error: This event is excluded.
const removedEvent: NonUserDeleteEvent = "user:delete";

console.log(productEvent);
console.log(safeEvent);
console.log(removedEvent);
```

### `pickOmit.ts`

```ts
// Goal:
// Use Pick and Omit to derive view and form types.

// Expected result:
// The compiler derives smaller object types.

export {};

type ProductRecord = {
  id: string;
  title: string;
  price: number;
  internalCost: number;
};

type ProductCard = Pick<ProductRecord, "id" | "title" | "price">;
type PublicProduct = Omit<ProductRecord, "internalCost">;

const card: ProductCard = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

const publicProduct: PublicProduct = card;

console.log(publicProduct.title);
```

### `awaitedReturnParameters.ts`

```ts
// Goal:
// Use Awaited, ReturnType, and Parameters.

// Expected result:
// The compiler extracts function-related types.

export {};

async function fetchProduct(id: string): Promise<{ id: string; title: string }> {
  return {
    id,
    title: "Keyboard",
  };
}

type FetchProductParams = Parameters<typeof fetchProduct>;
type FetchProductPromise = ReturnType<typeof fetchProduct>;
type FetchProductData = Awaited<FetchProductPromise>;

const params: FetchProductParams = ["p1"];
const data: FetchProductData = {
  id: "p1",
  title: "Keyboard",
};

console.log(params[0]);
console.log(data.title);
```

### 常见工具类型记忆

```txt
Partial<T>:
  make properties optional.

Required<T>:
  make properties required.

Readonly<T>:
  make properties readonly.

Record<K, V>:
  create object type from keys and value type.

Pick<T, K>:
  keep selected properties.

Omit<T, K>:
  remove selected properties.

Exclude<T, U>:
  remove union members assignable to U.

Extract<T, U>:
  keep union members assignable to U.

ReturnType<F>:
  extract function return type.

Parameters<F>:
  extract function parameter tuple.

Awaited<T>:
  unwrap Promise-like result recursively.
```

---

## 20. 15：类型断言

### 结论

类型断言（type assertion）告诉 TypeScript：“请把这个表达式当成这个类型。”它不会做运行时检查。

### 技术意义

类型断言是 escape hatch。它适合 TypeScript 无法知道但你已经通过其他方式保证安全的场景，不适合掩盖真实错误。

### 文件结构

```txt
15-type-assertions/
  singleAssertion.ts
  doubleAssertionMistake.ts
```

### `singleAssertion.ts`

```ts
// Goal:
// Use a type assertion after a runtime check.

// Expected result:
// The compiler accepts property access after a guarded assertion.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

function parseProduct(value: unknown): ProductRecord {
  if (typeof value !== "object" || value === null) {
    throw new Error("Invalid product");
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate["id"] !== "string" || typeof candidate["title"] !== "string") {
    throw new Error("Invalid product");
  }

  return {
    id: candidate["id"],
    title: candidate["title"],
  };
}

const product = parseProduct(JSON.parse('{"id":"p1","title":"Keyboard"}'));

console.log(product.title);
```

### 本节必须先补：`as`、类型注解、`satisfies` 的边界

这三个写法都能出现在“让表达式符合某个类型”的场景，但含义不一样：

```txt
type annotation:
  const value: TargetType = expression
  Check expression against TargetType.
  The variable's type is TargetType.

satisfies:
  const value = expression satisfies TargetType
  Check expression against TargetType.
  Keep expression's own inferred type.

type assertion:
  const value = expression as TargetType
  Ask TypeScript to treat expression as TargetType.
  This can bypass missing evidence.
```

学习阶段的优先级：

```txt
能用更准确的类型建模，就不要断言。
能用 runtime check，就不要直接 as final domain type。
配置对象需要检查形状又保留字面量推导时，优先考虑 satisfies。
```

### `doubleAssertionMistake.ts`

```ts
// Goal:
// Show why double assertion is dangerous.

// Expected result:
// The file compiles, but runtime behavior is unsafe.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

const unsafeProduct = 123 as unknown as ProductRecord;

try {
  console.log(unsafeProduct.title.toUpperCase());
} catch (errorValue) {
  console.log(errorValue instanceof TypeError);
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `as ProductRecord` 会验证 JSON | 不会，只改静态看法。 |
| 双重断言可以正常解决类型问题 | 它通常是在绕过类型系统。 |
| 遇到报错先断言 | 先问类型模型是否设计错了。 |

---

## 21. 16：非空断言和明确赋值断言

### 结论

非空断言 `value!` 告诉 TypeScript 值不是 `null` / `undefined`；明确赋值断言 `field!` 告诉 TypeScript 字段会在使用前被赋值。两者都不会生成安全检查。

### 技术意义

这两个断言都是 escape hatch。它们应该出现在很少、很靠近边界的位置，并且最好能被运行时逻辑证明。

### 文件结构

```txt
16-null-definite-assertions/
  nonNullAssertion.ts
  definiteAssignmentAssertion.ts
```

### `nonNullAssertion.ts`

```ts
// Goal:
// Compare safe narrowing with non-null assertion.

// Expected result:
// The compiler accepts non-null assertion but runtime can still fail.

export {};

function findProductTitle(id: string): string | undefined {
  if (id === "p1") {
    return "Keyboard";
  }

  return undefined;
}

const safeTitle = findProductTitle("p1");

if (safeTitle !== undefined) {
  console.log(safeTitle.toUpperCase());
}

const unsafeTitle = findProductTitle("missing")!;

try {
  console.log(unsafeTitle.toUpperCase());
} catch (errorValue) {
  console.log(errorValue instanceof TypeError);
}
```

### `definiteAssignmentAssertion.ts`

```ts
// Goal:
// Use definite assignment assertion only when external setup guarantees assignment.

// Expected result:
// The compiler accepts the field but runtime still depends on setup.

export {};

class ConfigStore {
  value!: string;

  initialize(value: string): void {
    this.value = value;
  }

  readUppercase(): string {
    return this.value.toUpperCase();
  }
}

const configStore = new ConfigStore();

configStore.initialize("ready");

console.log(configStore.readUppercase());
```

### 常见错误

```txt
value!:
  removes null and undefined from the static type.
  does not check the runtime value.

field!:
  disables definite assignment checking for that field.
  does not initialize the field.
```

---

## 22. 17：模拟名义类型

### 结论

TypeScript 默认是结构化类型系统。要区分“同样都是 string，但业务意义不同”的值，可以用品牌类型（branded type）模拟名义类型。

### 技术意义

真实项目里很多 id 都是字符串：`UserId`、`ProductId`、`OrderId`。结构上它们都一样，但业务上不能混用。品牌类型能把这种业务边界变成静态约束。

### 文件结构

```txt
17-nominal-types/
  brandedIds.ts
  opaqueAmount.ts
```

### `brandedIds.ts`

```ts
// Goal:
// Simulate nominal types with string brands.

// Expected result:
// The compiler rejects mixing different branded ids.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
  readonly __brand: BrandName;
};

type UserId = Brand<string, "UserId">;
type ProductId = Brand<string, "ProductId">;

function createUserId(value: string): UserId {
  return value as UserId;
}

function createProductId(value: string): ProductId {
  return value as ProductId;
}

function loadUser(userId: UserId): string {
  return `user:${userId}`;
}

const userId = createUserId("u1");
const productId = createProductId("p1");

console.log(loadUser(userId));

// @ts-expect-error: ProductId is not assignable to UserId.
console.log(loadUser(productId));
```

### `opaqueAmount.ts`

```ts
// Goal:
// Brand a number to prevent mixing raw numbers with validated money amounts.

// Expected result:
// The compiler requires creation through a function.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
  readonly __brand: BrandName;
};

type CentsAmount = Brand<number, "CentsAmount">;

function createCentsAmount(value: number): CentsAmount {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Invalid amount");
  }

  return value as CentsAmount;
}

function formatCents(amount: CentsAmount): string {
  return `$${(amount / 100).toFixed(2)}`;
}

const amount = createCentsAmount(1299);

console.log(formatCents(amount));

// @ts-expect-error: Raw number is not a validated CentsAmount.
console.log(formatCents(1299));
```

### 本节必须先补：brand 不是加密，也不是运行时身份

品牌类型的核心是静态隔离：

```txt
string:
  any string can be assigned.

UserId:
  only values that passed through the branding boundary should be assigned.

ProductId:
  same runtime representation as string, but different static meaning.
```

运行时看，`UserId` 仍然是 string。品牌字段通常不会真实存在于运行时值里，因为它只是交叉类型的一部分：

```txt
type UserId = string & { readonly __brand: "UserId" }
```

所以品牌类型必须配合集中创建函数或 parser：

```txt
unsafe:
  value as UserId appears everywhere.

safer:
  createUserId(value) validates or centralizes the assertion.
```

如果业务值需要真正的运行时防伪，品牌类型不够，你还需要运行时对象封装、校验、签名或数据库约束。第 6 章这里只训练静态类型隔离。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 品牌类型提供运行时安全 | 品牌主要提供静态隔离，运行时仍是原始值。 |
| 到处直接 `as UserId` | 应该集中在构造函数或 parser 里。 |
| 品牌字段用普通公开属性名 | 选择不易误用的只读品牌字段。 |

---

## 23. 18：安全地扩展原型

### 结论

扩展原型会修改运行时全局对象行为，风险很高。如果必须做，必须同时写运行时代码和 TypeScript 声明扩展，并控制影响范围。

### 技术意义

TypeScript 只知道你声明过的成员。你给 `Array.prototype` 加方法，运行时确实改变了数组；但如果没有声明合并，TypeScript 不知道这个方法存在。反过来，只写声明不写运行时代码，运行时会崩。

### 文件结构

```txt
18-safe-prototype-extension/
  globalAugmentation.ts
  prototypeExtensionRisk.ts
```

### `globalAugmentation.ts`

```ts
// Goal:
// Safely pair runtime prototype extension with global type augmentation.

// Expected result:
// The compiler accepts the new method and Node prints the last item.

export {};

declare global {
  interface Array<T> {
    lastOrUndefined(): T | undefined;
  }
}

if (!Array.prototype.lastOrUndefined) {
  Array.prototype.lastOrUndefined = function <T>(this: T[]): T | undefined {
    return this[this.length - 1];
  };
}

const itemList = ["a", "b", "c"];

console.log(itemList.lastOrUndefined());
```

### `prototypeExtensionRisk.ts`

```ts
// Goal:
// Show why declaration without runtime implementation is unsafe.

// Expected result:
// This example demonstrates the risk conceptually.

export {};

declare global {
  interface String {
    toTitleCaseForDemo(): string;
  }
}

const titleText = "hello";

// Do not call titleText.toTitleCaseForDemo() unless the runtime method exists.
console.log(titleText.toUpperCase());
```

### 真实项目建议

```txt
默认不要扩展内置原型。
优先写普通工具函数。
如果必须扩展：
  1. 放在唯一入口文件。
  2. 同时写 declare global。
  3. 加运行时存在性检查。
  4. 避免与标准未来方法名冲突。
  5. 写测试覆盖。
```

---

## 24. 19：小项目整合

### 结论

本章小项目要把类型运算符、映射类型、条件类型、用户定义类型防护、品牌类型和工具类型合起来，做一个“类型安全 API 边界”。

### 技术意义

真实项目里高级类型最常见的价值不是炫技，而是把外部数据边界、领域 id、API 结果、派生 view model 建模清楚。

### 文件结构

```txt
19-mini-project/
  typedApiBoundary.ts
  domainBrandAndMapper.ts
```

### `typedApiBoundary.ts`

```ts
// Goal:
// Build a typed API boundary with unknown input, validation, and derived view types.

// Expected result:
// The compiler enforces validation before business access.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
  readonly __brand: BrandName;
};

type ProductId = Brand<string, "ProductId">;

type ProductRecord = {
  id: ProductId;
  title: string;
  priceCents: number;
  tags: string[];
};

type ProductCard = Pick<ProductRecord, "id" | "title" | "priceCents">;

type ApiResult<DataType> =
  | {
      ok: true;
      data: DataType;
    }
  | {
      ok: false;
      errorMessage: string;
    };

function createProductId(value: string): ProductId {
  if (!value.startsWith("p_")) {
    throw new Error("Invalid product id");
  }

  return value as ProductId;
}

function isRawProduct(value: unknown): value is {
  id: string;
  title: string;
  priceCents: number;
  tags: string[];
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate["id"] === "string" &&
    typeof candidate["title"] === "string" &&
    typeof candidate["priceCents"] === "number" &&
    Array.isArray(candidate["tags"]) &&
    candidate["tags"].every((tagValue) => typeof tagValue === "string")
  );
}

function parseProduct(value: unknown): ApiResult<ProductRecord> {
  if (!isRawProduct(value)) {
    return {
      ok: false,
      errorMessage: "Invalid product",
    };
  }

  return {
    ok: true,
    data: {
      id: createProductId(value.id),
      title: value.title,
      priceCents: value.priceCents,
      tags: value.tags,
    },
  };
}

function toProductCard(product: ProductRecord): ProductCard {
  return {
    id: product.id,
    title: product.title,
    priceCents: product.priceCents,
  };
}

const rawValue: unknown = JSON.parse(
  '{"id":"p_1","title":"Keyboard","priceCents":9900,"tags":["hardware"]}',
);

const result = parseProduct(rawValue);

if (result.ok) {
  console.log(toProductCard(result.data).title);
} else {
  console.log(result.errorMessage);
}
```

### `domainBrandAndMapper.ts`

```ts
// Goal:
// Use mapped and conditional types to derive a client-safe view model.

// Expected result:
// The compiler derives a public model and protects branded ids.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
  readonly __brand: BrandName;
};

type UserId = Brand<string, "UserId">;

type InternalUserRecord = {
  id: UserId;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type RemovePrivateFields<SourceType> = {
  [KeyName in keyof SourceType as KeyName extends `password${string}` ? never : KeyName]: SourceType[KeyName];
};

type SerializeDates<SourceType> = {
  [KeyName in keyof SourceType]: SourceType[KeyName] extends Date
    ? string
    : SourceType[KeyName];
};

type PublicUserView = SerializeDates<RemovePrivateFields<InternalUserRecord>>;

function createUserId(value: string): UserId {
  return value as UserId;
}

function toPublicUserView(user: InternalUserRecord): PublicUserView {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

const userRecord: InternalUserRecord = {
  id: createUserId("u1"),
  email: "ada@example.com",
  passwordHash: "hash",
  createdAt: new Date("2026-05-15T00:00:00Z"),
};

const publicView = toPublicUserView(userRecord);

console.log(publicView.createdAt);

// @ts-expect-error: passwordHash was removed from the public view.
console.log(publicView.passwordHash);
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 外部 JSON 先进入 `unknown`。 |
| 2 | `isRawProduct()` 运行时验证对象形状。 |
| 3 | `ProductId` 使用品牌类型防止 id 混用。 |
| 4 | `ApiResult<T>` 用判别联合建模成功和失败。 |
| 5 | `Pick` 派生列表卡片需要的 view model。 |
| 6 | `RemovePrivateFields<T>` 用 key remapping 删除敏感字段。 |
| 7 | `SerializeDates<T>` 用条件类型把 `Date` 字段转换成 `string`。 |
| 8 | TypeScript 只在编译期约束，运行时转换仍由函数实现。 |

---

## 25. 最终文件清单

```txt
typescript/
  chapter-06-advanced-types/
    README.md

    00-type-relationships/
      subtypeSupertype.ts
      topAndBottomTypes.ts

    01-assignability/
      structuralAssignability.ts
      excessPropertyAssignability.ts

    02-variance/
      arrayVariancePitfall.ts
      readonlyArrayVariance.ts
      functionParameterVariance.ts

    03-widening-refinement/
      literalWideningReview.ts
      controlFlowRefinement.ts
      mutationBreaksRefinement.ts
      mutationThroughFunctionCallPitfall.ts

    04-exhaustiveness/
      exhaustiveSwitch.ts
      assertNeverHelper.ts

    05-type-operators/
      keyofOperator.ts
      typeofTypeOperator.ts
      indexedAccessType.ts
      genericGetProperty.ts
      satisfiesOperator.ts

    06-record-type/
      recordWithKnownKeys.ts
      recordVsIndexSignature.ts

    07-mapped-types/
      mappedFlags.ts
      mappedModifiers.ts
      keyRemapping.ts

    08-companion-object-pattern/
      statusCompanionObject.ts
      runtimeValueStaticTypePair.ts

    09-tuple-inference/
      tupleHelper.ts
      readonlyTupleInference.ts

    10-user-defined-type-guards/
      isProductRecord.ts
      assertionFunction.ts

    11-conditional-types/
      basicConditionalType.ts
      conditionalApiResult.ts
      conditionalTypeRuntimeBoundary.ts

    12-distributive-conditional-types/
      distributiveConditional.ts
      nonDistributiveConditional.ts

    13-infer-keyword/
      inferArrayElement.ts
      inferFunctionReturn.ts
      inferPromiseValue.ts

    14-built-in-utility-types/
      extractExclude.ts
      pickOmit.ts
      awaitedReturnParameters.ts

    15-type-assertions/
      singleAssertion.ts
      doubleAssertionMistake.ts

    16-null-definite-assertions/
      nonNullAssertion.ts
      definiteAssignmentAssertion.ts

    17-nominal-types/
      brandedIds.ts
      opaqueAmount.ts

    18-safe-prototype-extension/
      globalAugmentation.ts
      prototypeExtensionRisk.ts

    19-mini-project/
      typedApiBoundary.ts
      domainBrandAndMapper.ts

notes/
  typescript.md
```

---

## 26. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### 知识点名称

结论：一句话说明它解决什么问题。

技术意义：它在类型系统里表示什么。

底层机制：编译期做了什么，运行时还剩什么。

代码例子：保留一个最能说明问题的例子。

常见错误：写一个你自己容易犯的反例。

项目关系：说明它在 API response、React props、form state、domain model、SDK 类型声明中的用途。
```

最终笔记必须包含这些对比：

```txt
subtype vs supertype
assignability vs equality
structural typing vs nominal typing
covariance vs contravariance vs invariance
widening vs refinement
narrowing vs type assertion
never exhaustive check vs default branch fallback
keyof vs Object.keys
satisfies vs type annotation vs type assertion
typeof in value position vs typeof in type position
T[K] vs obj[key]
Record<K, V> vs Map<K, V>
Record<string, V> dot access vs bracket access under noPropertyAccessFromIndexSignature
mapped type vs runtime object mapping
mapped modifiers vs property reassignment
companion object pattern vs enum
array vs tuple vs readonly tuple
type guard vs assertion function
conditional type vs runtime if
distributive conditional vs non-distributive conditional
infer vs indexed access type
Extract vs Exclude
Pick vs Omit
ReturnType vs returned runtime value
non-null assertion vs null check
definite assignment assertion vs field initialization
branded type vs runtime validation
prototype extension vs utility function
```

---

## 27. 本章最终要能回答的问题

学完第 6 章后，你必须能不用查资料回答这些问题：

1. TypeScript 中子类型和超类型分别是什么意思？
2. 属性更多的对象为什么通常是更具体的类型？
3. 可赋值性和类型完全相等有什么区别？
4. 直接对象字面量为什么会触发 excess property check？
5. 什么是型变？
6. 可写数组为什么有型变风险？
7. 为什么只读数组更安全？
8. 函数参数位置为什么通常要逆变理解？
9. 类型拓宽解决什么问题？
10. 类型细化依赖什么控制流信息？
11. 为什么对象 mutation 可能破坏之前的细化？
12. `never` 怎么用于全面性检查？
13. `keyof T` 产生什么类型？
14. 类型位置的 `typeof` 和运行时 `typeof` 有什么区别？
15. `T[K]` 解决什么问题？
16. `Record<K, V>` 和普通索引签名有什么关系？
17. `Record<string, V>` 为什么不代表所有 key 一定存在？
18. 映射类型如何遍历对象 key？
19. `-readonly` 和 `-?` 在映射类型里是什么意思？
20. key remapping 的 `as` 用来做什么？
21. 伴生对象模式为什么适合替代一部分 enum 场景？
22. 为什么 `as const` 能改善元组和字面量推导？
23. 类型防护函数的 `value is T` 是什么？
24. 断言函数的 `asserts value is T` 和普通 type guard 有什么区别？
25. 条件类型中的 `extends` 是类继承吗？
26. 条件类型和运行时 `if` 有什么区别？
27. 什么情况下条件类型会分配到联合类型成员上？
28. 如何阻止条件类型分配？
29. `infer` 能在什么位置使用？
30. `ReturnType` 和 `Parameters` 的底层思想是什么？
31. 类型断言为什么危险？
32. 非空断言为什么不能替代 null 检查？
33. 明确赋值断言为什么不能替代字段初始化？
34. 品牌类型如何在结构化类型系统中模拟名义类型？
35. 安全扩展 prototype 为什么必须同时处理运行时和类型声明？
36. 高级类型在真实项目里的目标是什么？
37. `satisfies` 和 `as` 的区别是什么？
38. `Record<string, V>` 为什么在 `noPropertyAccessFromIndexSignature` 下更适合用 bracket access？
39. `[Key in keyof T as NewKey]` 里的 `as` 为什么不是类型断言？
40. 为什么 TypeScript 不会完全追踪隐藏在函数调用里的对象 mutation？

---

## 28. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)  
   重点读 structural typing、soundness、function parameter bivariance、optional/rest parameters、generics。理解 TypeScript 为什么采用结构化类型系统，以及哪些地方为了 JavaScript 使用习惯做了不完全 sound 的设计取舍。

2. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)  
   重点读 `typeof` narrowing、truthiness narrowing、equality narrowing、`in` operator narrowing、control flow analysis、type predicates、assertion functions、discriminated unions、`never` exhaustive checking。

3. [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)  
   复习泛型约束、泛型参数默认值、在泛型约束中使用类型参数。第 6 章的条件类型和映射类型都需要泛型基础。

4. [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html)  
   理解 `keyof` 如何把对象类型转换成 key union。

5. [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)  
   理解类型位置的 `typeof` 如何从运行时值提取静态类型。

6. [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)  
   理解 `T[K]`、`T[keyof T]`、`typeof array[number]`。

7. [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)  
   重点读 mapping modifiers 和 key remapping via `as`。

8. [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)  
   重点读 conditional type constraints、inferring within conditional types、distributive conditional types。

9. [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)  
   重点读 `Partial`、`Required`、`Readonly`、`Record`、`Pick`、`Omit`、`Exclude`、`Extract`、`NonNullable`、`Parameters`、`ReturnType`、`Awaited`。

10. [TypeScript 4.9 Release Notes - satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)  
    理解 `satisfies` 如何在检查表达式满足目标类型的同时保留表达式自身的精确推导。

11. [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)  
    只读 global augmentation 和 module augmentation 相关内容，为安全扩展 prototype 做准备。

12. [TSConfig noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)  
    理解为什么未知 key 或数组索引读取结果应该包含 `undefined`。

13. [TSConfig exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)  
    理解“属性不存在”和“属性值为 `undefined`”不是同一件事。

---

## 29. 第 6 章最终记忆模型

```txt
Advanced TypeScript is not about complex syntax.

It is about:

Relating types:
  subtype
  supertype
  assignability
  structural compatibility
  variance

Refining types:
  widening
  narrowing
  control-flow analysis
  exhaustive checking
  never

Deriving types:
  keyof
  typeof in type position
  indexed access type
  Record
  satisfies
  utility types

Transforming types:
  mapped types
  mapped modifiers
  key remapping
  conditional types
  distributive conditional types
  infer

Escaping types:
  type assertion
  non-null assertion
  definite assignment assertion

Protecting domain meaning:
  branded types
  companion object pattern
  user-defined type guards
  assertion functions
```

### 最终一句话

```txt
第 3 章让你描述值的形状。
第 4 章让你描述行为的边界。
第 5 章让你描述对象的长期结构和抽象契约。
第 6 章让你理解类型系统如何比较、缩小、派生、转换和保护类型。

真正的 TypeScript 类型进阶，不是把类型写得复杂，而是让类型准确跟随业务数据、控制流和模块边界变化。
```

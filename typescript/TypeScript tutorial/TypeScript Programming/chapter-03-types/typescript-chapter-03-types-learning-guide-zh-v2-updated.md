# TypeScript 第 3 章“类型全解”学习指导文件 v2

> 定位：这是 TypeScript 第 3 章“类型全解”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察编译错误或运行输出，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 3 章“类型全解”，TypeScript 官方 Handbook 的 Everyday Types、Object Types、Narrowing、More on Functions、Enums，以及 TSConfig 官方文档中的 `strict`、`noImplicitAny`、`strictNullChecks`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先区分“JavaScript 运行时值”和“TypeScript 静态类型”，再学习具体类型写法。不要把 TypeScript 学成“给变量后面加冒号”。

> 本版补全：已联网核对 TypeScript 官方文档。本文件把“书上第 3 章的类型清单”转换成“官方文档可验证的训练路径”，并额外补上严格模式、隐式 `any`、严格空值检查、字面量推导、只读元组、`enum` 运行时代价等实践要求。

### 本版相对 v1 的补全点

```txt
1. 增加 TypeScript 官方文档对应关系，不再只写笼统阅读清单。
2. 把 tsconfig 推荐配置升级为显式 strict、noImplicitAny、strictNullChecks。
3. 补上 any 与 unknown 的安全边界：any 会传播，unknown 必须先收窄。
4. 补上 literal inference、as const、readonly tuple 的训练要求。
5. 补上 enum 的运行时输出和 union/as const object 替代方案。
6. 补上 never 与 exhaustive checking 的正式训练方式。
7. 补上“外部数据建模”小项目，避免只写孤立类型示例。
```

### 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 常见原始类型、数组、`any`、对象类型、联合、类型别名、字面量类型、`null` / `undefined`、`enum` | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 对象类型、可选属性、只读属性、索引签名、交叉类型、数组、元组、只读元组 | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) |
| `typeof` 收窄、判等收窄、`in` 收窄、可区分联合、`never` 穷尽检查 | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| `void`、`object`、`unknown`、`never` 在函数语境中的含义 | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| `enum` 运行时对象、数字枚举、字符串枚举、`const enum` | [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) |
| 严格类型检查总开关 | [TSConfig strict](https://www.typescriptlang.org/tsconfig/strict.html) |
| 禁止隐式 `any` | [TSConfig noImplicitAny](https://www.typescriptlang.org/tsconfig/noImplicitAny.html) |
| 严格区分 `null` 和 `undefined` | [TSConfig strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) |


---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 3 章完整学习顺序](#3-第-3-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：TypeScript 类型系统到底在检查什么](#5-00typescript-类型系统到底在检查什么)
6. [01：类型注解、类型推导和类型拓宽](#6-01类型注解类型推导和类型拓宽)
7. [02：any](#7-02any)
8. [03：unknown](#8-03unknown)
9. [04：boolean 和布尔字面量类型](#9-04boolean-和布尔字面量类型)
10. [05：number 和数值字面量类型](#10-05number-和数值字面量类型)
11. [06：bigint](#11-06bigint)
12. [07：string 和字符串字面量类型](#12-07string-和字符串字面量类型)
13. [08：symbol 和 unique symbol](#13-08symbol-和-unique-symbol)
14. [09：对象类型](#14-09对象类型)
15. [10：类型别名](#15-10类型别名)
16. [11：联合类型](#16-11联合类型)
17. [12：交叉类型](#17-12交叉类型)
18. [13：数组类型](#18-13数组类型)
19. [14：元组类型](#19-14元组类型)
20. [15：null 和 undefined](#20-15null-和-undefined)
21. [16：void](#21-16void)
22. [17：never](#22-17never)
23. [18：枚举 enum](#23-18枚举-enum)
24. [19：小项目整合](#24-19小项目整合)
25. [最终文件清单](#25-最终文件清单)
26. [最终学习笔记转换要求](#26-最终学习笔记转换要求)
27. [本章最终要能回答的问题](#27-本章最终要能回答的问题)
28. [TS 官方文档阅读清单](#28-ts-官方文档阅读清单)
29. [第 3 章最终记忆模型](#29-第-3-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个写代码、触发类型检查、解释类型系统行为的训练指导。

学习 TypeScript 第 3 章时，你必须同时观察两件事：

```txt
TypeScript 编译期：类型检查器如何判断一段代码安全不安全。
JavaScript 运行时：编译后的代码实际保存什么值、执行什么逻辑。
```

TypeScript 初学阶段最容易犯的错误，是把类型理解成运行时存在的东西。实际模型是：

```txt
.ts source code
  -> TypeScript parser reads syntax
  -> Type checker checks types
  -> Compiler emits JavaScript
  -> Types are erased
  -> JavaScript runtime executes values
```

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. 先读结论。
2. 区分本节概念属于 syntax、type system 还是 runtime behavior。
3. 创建对应目录。
4. 写一个正确示例文件。
5. 写一个错误示例文件，优先用 @ts-expect-error 标记预期错误。
6. 运行 npx tsc --noEmit 做类型检查。
7. 如果示例有运行时输出，再编译并用 node 运行。
8. 对照执行过程表格解释每一步。
9. 把本节整理进最终学习笔记。
```

### 推荐运行环境

在 `typescript/` 目录下建立独立 TypeScript 学习环境，避免和后续 React、Node、Next.js 项目混在一起。

```bash
cd typescript
npm init -y
npm install -D typescript
npx tsc --init
```

推荐 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

这几个选项的学习意义：

| 配置 | 本章作用 |
|---|---|
| `strict` | 打开严格类型检查族，让练习更接近真实项目。 |
| `noImplicitAny` | 当 TypeScript 推不出类型、准备退回 `any` 时直接报错。 |
| `strictNullChecks` | 让 `null` 和 `undefined` 真正进入类型系统，避免“可能不存在的值”被当成一定存在。 |
| `noUncheckedIndexedAccess` | 让数组索引、对象索引的读取结果包含 `undefined`，逼你处理越界或缺失。 |
| `exactOptionalPropertyTypes` | 让“属性不存在”和“属性值显式为 `undefined`”更接近真实语义。 |

注意：`strict` 已经包含 `noImplicitAny` 和 `strictNullChecks`。这里仍然显式写出来，是为了让你在学习阶段知道这两个检查来自哪里。

本章练习优先使用：

```bash
npx tsc --noEmit
```

如果某个文件需要运行，先编译：

```bash
npx tsc
node path/to/compiled-file.js
```

### 代码注释模板

每个 `.ts` 文件顶部都写英文注释：

```ts
// Goal:
// Verify how this TypeScript type example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`export {};` 的作用是把文件变成模块（module），防止不同练习文件里的同名变量污染全局作用域。

### 本章学习要求

每个类型点都不能只记“怎么写”。必须回答：

```txt
它描述什么 JavaScript 值？
它是在编译期存在，还是运行时存在？
它解决什么安全问题？
它会不会改变运行时行为？
它和 JavaScript 原本的类型有什么关系？
它什么时候应该显式标注？
它什么时候应该让 TypeScript 自己推导？
它在真实前端项目里用于建模什么数据？
它最常见的错误写法是什么？
```


### 第一次学 TS 时本章会提前出现的符号

第 3 章虽然主要讲“类型”，但示例里会提前出现几个 TypeScript 符号。它们不是装饰写法，必须先建立最低限度的操作模型，否则你会在后面看到代码就卡住。

| 符号 / 写法 | 名称 | 所属层级 | 在本章哪里出现 | 先记住的结论 |
|---|---|---|---|---|
| `:` | 类型注解（type annotation） | TypeScript syntax / type system | 几乎所有变量、参数、返回值 | 冒号右边是类型，不是运行时赋值。 |
| `<...>` | 类型参数列表（type argument list） | TypeScript type system | `Record<string, unknown>`、`Array<T>` | 尖括号在类型位置表示“把类型传给一个泛型类型”，不是数学比较符号。 |
| `is` | 类型谓词（type predicate） | TypeScript narrowing | `value is ProductRecord` | 函数运行时返回 `boolean`，但签名告诉 TypeScript：返回 `true` 时参数可收窄成某个类型。 |
| `as` | 类型断言（type assertion） | TypeScript syntax / type system | `value as Record<string, unknown>` | 断言只改变编译器视角，不做运行时验证。 |
| `as const` | const 断言（const assertion） | TypeScript type system | `ORDER_STATUS` 示例 | 保留字面量类型，并把对象属性推成 readonly。 |
| `typeof` | 运行时 `typeof` / 类型位置 `typeof` | runtime behavior / type system | `typeof value === "object"`、`typeof ORDER_STATUS` | 表达式里是运行时检查；类型位置里是从值提取静态类型。 |
| `keyof` | 键名类型运算符（keyof type operator） | TypeScript type system | `keyof typeof ORDER_STATUS` | 从对象类型中取出所有 key，形成字符串字面量联合。 |
| `T[K]` | 索引访问类型（indexed access type） | TypeScript type system | `(typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]` | 从对象类型里取出属性值类型。 |
| `@ts-expect-error` | 预期错误指令（compiler directive） | TypeScript tooling behavior | 错误示例上一行 | 它不是普通注释；它要求下一行必须出现 TypeScript 错误。 |
| `@ts-ignore` | 忽略错误指令（compiler directive） | TypeScript tooling behavior | 本章补充说明 | 它会压制下一行的 TypeScript 错误，即使下一行后来没有错误也不会提醒你。 |


### 本章必须先建立：`type Name = TypeExpression` 是声明，不是对象

结论：`type ProductRecord = { id: string }` 这一整行不是在创建对象，而是在创建一个**类型别名声明**（type alias declaration）。`ProductRecord` 是类型别名的名字；`{ id: string }` 是对象类型字面量（object type literal）；`id` 是属性名；`string` 是这个属性值必须满足的类型。

这一步必须先讲清楚，因为你从 JavaScript 进入 TypeScript 时，大脑会自然把 `{ id: string }` 看成“对象”。但在 TypeScript 的类型位置里，它不是运行时对象，而是描述对象形状的类型表达式。

#### 逐 token 拆解

```ts
type ProductRecord = {
  id: string;
  title: string;
};
```

这行代码按语法角色拆开是：

| 片段 | 语法角色 | 所属层级 | 解释 |
|---|---|---|---|
| `type` | 关键字 | TypeScript syntax | 开始一个类型别名声明。 |
| `ProductRecord` | 类型别名名 | TypeScript type system | 给右侧类型表达式起的名字。 |
| `=` | 类型别名绑定符号 | TypeScript syntax | 把左侧名字绑定到右侧类型表达式。 |
| `{ ... }` | 对象类型字面量 | TypeScript type system | 描述对象应该有哪些属性。 |
| `id` | 属性名 | Object type property name | 描述对象里必须有一个叫 `id` 的属性。 |
| `:` | 属性类型注解符号 | TypeScript syntax | 右边写这个属性值的类型。 |
| `string` | 属性值类型 | TypeScript type system | 说明 `id` 属性保存的值必须是字符串。 |

所以正确读法是：

```txt
ProductRecord:
  the name of the type alias

{
  id: string;
  title: string;
}:
  the object type assigned to ProductRecord

id:
  a property name required by the object type

string:
  the value type required for the id property
```

错误读法是：

```txt
ProductRecord is an object.
id has the type string as a key.
type creates a runtime object.
```

正确读法是：

```txt
ProductRecord is a type alias name.
It points to an object type.
The object type requires an id property.
The value stored in the id property must be string.
```

#### `object type` 和 `runtime object` 必须分开

```ts
// Goal:
// Distinguish an object type from a runtime object.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
};

console.log(productRecord.id);
```

这一段有两层：

| 代码 | 编译期含义 | 运行时含义 |
|---|---|---|
| `type ProductRecord = ...` | 创建类型别名，只给 checker 使用 | 编译后删除，没有运行时值 |
| `{ id: string; title: string }` | 对象类型，描述对象形状 | 编译后删除，不创建对象 |
| `const productRecord = ...` | 检查右侧值是否满足 `ProductRecord` | 创建真实 JavaScript 对象 |
| `{ id: "p1", title: "Keyboard" }` | 被检查为符合对象类型 | 真实存在的运行时对象 |

这一章所有对象相关概念都要坚持这个分层：

```txt
Runtime object:
  const productRecord = { id: "p1" };

Object type:
  { id: string }

Type alias:
  type ProductRecord = { id: string };
```

#### `type ProductId = string` 和 `type ProductRecord = { ... }` 的区别

`type` 后面的名字永远是类型别名名，但右侧类型表达式可以完全不同。

```ts
// Goal:
// Compare primitive type aliases and object type aliases.

export {};

type ProductId = string;

type ProductRecord = {
  id: ProductId;
  title: string;
};

const productId: ProductId = "p1";

const productRecord: ProductRecord = {
  id: productId,
  title: "Keyboard",
};

console.log(productRecord.id);
```

拆开看：

| 写法 | 类型别名名 | 右侧类型表达式 | 描述什么 |
|---|---|---|---|
| `type ProductId = string` | `ProductId` | `string` | 一个字符串类型的业务别名 |
| `type ProductRecord = { ... }` | `ProductRecord` | object type literal | 一个对象形状 |
| `id: ProductId` | `id` 是属性名 | `ProductId` 是属性值类型 | `id` 属性的值必须满足 `ProductId` |

所以在 `id: ProductId` 里，`id` 和 `ProductId` 的角色不一样：

```txt
id:
  property name

ProductId:
  property value type
```

#### `Record<string, unknown>` 和 `{ id: string }` 不是同一种读法

这两个都能描述对象相关类型，但机制不同：

```ts
type ProductRecord = {
  id: string;
};

type ProductDictionary = Record<string, unknown>;
```

对比：

| 写法 | 有没有固定属性名 | key 怎么来 | value 类型怎么来 |
|---|---|---|---|
| `{ id: string }` | 有，固定是 `id` | 直接写出来的属性名 | `id` 后面的 `string` |
| `Record<string, unknown>` | 没有固定属性名 | 第一个类型参数 `string` | 第二个类型参数 `unknown` |

所以：

```txt
{ id: string }
  means an object type with a required property named id.

Record<string, unknown>
  means an object-like type whose keys are strings and whose values are unknown.
```

这就是你容易混的点：在 `{ id: string }` 里，`string` 不是 key 类型，而是 `id` 这个属性的 value type；在 `Record<string, unknown>` 里，第一个 `string` 才是 key type。

#### 判断一行 TypeScript 类型声明的固定方法

看到一行类型声明时，按这个顺序读：

```txt
1. Find the type keyword.
2. Find the alias name being created.
3. Read the right-hand type expression.
4. If the right-hand side is an object type, read each property as propertyName: propertyValueType.
5. Remember that type aliases and object types disappear after compilation.
```

这个步骤比背概念更重要。只要你能拆语法角色，后面的 `interface`、`type alias`、`React props`、`API response type` 都会变清楚。

---

### 本章必须先建立：断言（assertion）到底是什么

结论：TypeScript 里的断言（assertion）不是“证明”，而是“你告诉编译器：请按我说的类型理解这个表达式”。它主要改变 TypeScript 的静态类型判断，不会自动改变 JavaScript 运行时的值，也不会自动做数据验证。

断言最容易和三个东西混在一起：

| 概念 | English term | 本质 | 是否证明数据真实安全 | 是否改变运行时值 |
|---|---|---|---|---|
| 类型注解 | type annotation | 你给变量、参数、返回值规定类型边界 | TypeScript 会检查赋值是否匹配 | 否 |
| 类型收窄 | type narrowing | 通过运行时判断让 TypeScript 在分支里缩小类型 | 取决于判断是否真实可靠 | 判断表达式会运行 |
| 类型断言 | type assertion | 你要求 TypeScript 把一个表达式看成某个类型 | 否 | 否 |
| const 断言 | const assertion | 你要求 TypeScript 保留字面量类型并推断 readonly | 否 | 否 |
| 非空断言 | non-null assertion | 你要求 TypeScript 移除 `null` / `undefined` 可能性 | 否 | 否 |
| 断言函数 | assertion function | 函数运行时检查失败就抛错，成功后让 TypeScript 收窄 | 如果函数体检查可靠，就是运行时验证 | 函数会运行 |

#### 类型断言：`as Type`

```ts
// Goal:
// Show that a type assertion changes only the compiler's view.

export {};

type ProductRecord = {
  id: string;
};

const rawValue: unknown = {
  id: 123,
};

const productRecord = rawValue as ProductRecord;

console.log(productRecord.id);
```

这段代码里，`rawValue as ProductRecord` 的含义不是“把 `rawValue` 转换成 `ProductRecord`”。它的含义是：

```txt
TypeScript checker:
  Treat rawValue as ProductRecord from this expression onward.

JavaScript runtime:
  Keep the original object unchanged.
  id is still the number 123.
```

所以断言不是类型转换（type conversion）。真正的运行时转换是 JavaScript 表达式，例如 `String(value)`、`Number(value)`、`Boolean(value)`。

#### 尖括号断言：`<Type>value`

TypeScript 还有另一种旧写法：

```ts
// Goal:
// Show the older angle-bracket type assertion form.

export {};

type ProductRecord = {
  id: string;
};

const rawValue: unknown = {
  id: "keyboard",
};

const productRecord = <ProductRecord>rawValue;

console.log(productRecord.id);
```

它和 `rawValue as ProductRecord` 在普通 `.ts` 文件里基本等价。但是现代前端学习里优先使用 `as`，原因是：

```txt
.ts file:
  <ProductRecord>rawValue can mean a type assertion.

.tsx file:
  <ProductRecord> can be confused with JSX syntax.
  Therefore, TSX uses as syntax for type assertions.
```

所以本章看到尖括号时要先判断语境：

```txt
Record<string, unknown>:
  泛型类型参数，不是断言。

<ProductRecord>rawValue:
  尖括号断言，表示把 rawValue 看成 ProductRecord。

<App />:
  JSX 元素，不是 TypeScript 类型语法。
```

#### 非空断言：`value!`

非空断言（non-null assertion）写在表达式后面，用来告诉 TypeScript：

```txt
我保证这里不是 null，也不是 undefined。
```

```ts
// Goal:
// Show that non-null assertion removes null from the static type only.

export {};

type ProductRecord = {
  id: string;
};

const productRecord: ProductRecord | null = null;

const productId = productRecord!.id;

console.log(productId);
```

这段代码会通过一部分类型检查，但运行时仍然会失败，因为 `productRecord` 实际就是 `null`。`!` 不会自动创建对象，也不会自动处理空值。它只是在编译期移除 `null | undefined` 的可能性。

#### 断言函数：`asserts value is Type`

断言函数（assertion function）和普通 `as` 不一样。它的函数体会在运行时执行，失败时应该抛错；如果没有抛错，TypeScript 就认为对应值已经被验证过。

```ts
// Goal:
// Show how an assertion function validates before narrowing.

export {};

type ProductRecord = {
  id: string;
  price: number;
};

function assertProductRecord(value: unknown): asserts value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    throw new Error("Invalid product record");
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== "string" || typeof candidate.price !== "number") {
    throw new Error("Invalid product record");
  }
}

const rawValue: unknown = JSON.parse('{"id":"keyboard","price":99}');

assertProductRecord(rawValue);

console.log(rawValue.id);
console.log(rawValue.price + 1);
```

这类写法的顺序是：

```txt
unknown input
  -> assertion function runs runtime checks
  -> function throws if invalid
  -> if the function returns, TypeScript narrows the variable
```

#### 最容易错的判断方式

错误模型：

```txt
我写了 as，所以这个值现在一定是那个类型。
```

正确模型：

```txt
我写了 as，只是让 TypeScript 暂时相信这个表达式是那个类型。
值本身没有变。
验证有没有发生，要看前面是否真的写了运行时检查。
```

本章遇到“断言”时，固定问三个问题：

```txt
1. 这是 type assertion、const assertion、non-null assertion，还是 assertion function？
2. 它有没有执行运行时检查？
3. 如果运行时数据是错的，这段代码会不会仍然崩？
```


#### 教学展开：为什么断言不是“我已经证明了”

先看一个没有断言的版本。这里 `rawValue` 的静态类型是 `unknown`：

```ts
// Goal:
// Show why unknown cannot be used before narrowing.

export {};

const rawValue: unknown = {
  id: 123,
};

// @ts-expect-error: unknown cannot be accessed directly.
console.log(rawValue.id);
```

TypeScript 在这段代码里做的不是运行时检查，而是静态规则检查：

| 代码 | TypeScript 编译期看到什么 | 为什么报错 |
|---|---|---|
| `const rawValue: unknown = ...` | `rawValue` 可以保存任意值，但使用前必须证明它是什么 | `unknown` 是安全的不确定类型 |
| `rawValue.id` | 你正在读取一个未知值的属性 | `unknown` 可能是数字、字符串、`null`、数组、函数或对象 |
| `@ts-expect-error` | 你声明下一行应该报错 | 如果下一行不再报错，TypeScript 会提醒这条指令多余 |

现在加入断言：

```ts
// Goal:
// Show what a type assertion changes.

export {};

type ProductRecord = {
  id: string;
};

const rawValue: unknown = {
  id: 123,
};

const productRecord = rawValue as ProductRecord;

console.log(productRecord.id);
```

逐行解释：

| 代码 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|
| `type ProductRecord = ...` | 创建一个只存在于 TypeScript 编译期的类型别名 | 运行时没有 `ProductRecord` 这个值 |
| `const rawValue: unknown = ...` | `rawValue` 被标记为 `unknown` | 创建普通对象 `{ id: 123 }` |
| `rawValue as ProductRecord` | 你要求 checker 把这个表达式看作 `ProductRecord` | 不检查 `id` 是否真是字符串，不转换对象 |
| `const productRecord = ...` | `productRecord` 的静态类型变成 `ProductRecord` | `productRecord` 保存的仍然是同一个对象引用 |
| `productRecord.id` | TypeScript 相信它是 `string` | 实际读到的是数字 `123` |

所以断言的真实含义是：

```txt
I know more than the checker here. Trust me.
```

它不是：

```txt
I have converted this value.
I have validated this value.
This value is now safe at runtime.
```

#### 断言和类型转换不是一回事

类型转换（type conversion）会产生新的运行时值；类型断言（type assertion）不会。

```ts
// Goal:
// Compare runtime conversion with type assertion.

export {};

const numericId = 123;

const convertedId = String(numericId);
const assertedId = numericId as unknown as string;

console.log(convertedId.toUpperCase());
console.log(assertedId.toUpperCase());
```

执行过程：

| 代码 | 编译期 | 运行时 |
|---|---|---|
| `String(numericId)` | 返回值类型是 `string` | 真的把 `123` 转成字符串 `'123'` |
| `numericId as unknown as string` | 强行让 TypeScript 相信它是 `string` | 值仍然是数字 `123` |
| `convertedId.toUpperCase()` | 合法 | 字符串方法存在，运行成功 |
| `assertedId.toUpperCase()` | 可能被放行 | 数字没有 `toUpperCase()`，运行时崩溃 |

这个例子特别关键：

```txt
as string changes the static type.
String(value) changes the runtime value.
```

#### 断言和收窄也不是一回事

收窄（narrowing）依赖代码里的证据；断言（assertion）依赖你的承诺。

```ts
// Goal:
// Compare narrowing and assertion.

export {};

const inputValue: unknown = "keyboard";

if (typeof inputValue === "string") {
  console.log(inputValue.toUpperCase());
}

const assertedValue = inputValue as string;
console.log(assertedValue.toUpperCase());
```

第一段 `if` 是收窄：

```txt
Runtime check:
  typeof inputValue === "string"

TypeScript effect:
  Inside the if block, inputValue is narrowed to string.
```

第二段 `as string` 是断言：

```txt
Runtime check:
  none

TypeScript effect:
  Treat inputValue as string because the programmer said so.
```

如果 `inputValue` 以后变成数字，第一段会跳过字符串操作，第二段仍然可能崩。

#### 为什么 `as Record<string, unknown>` 可以出现，但 `as ProductRecord` 要谨慎

在 validator 里，`as Record<string, unknown>` 不是最终结论，而是一个中间工具。

```ts
// Goal:
// Use a small assertion only after checking the object boundary.

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

  return typeof candidate.id === "string" && typeof candidate.price === "number";
}
```

这段代码的安全点在于顺序：

| 步骤 | 代码 | 作用 |
|---|---|---|
| 1 | `typeof value !== "object"` | 排除原始值 |
| 2 | `value === null` | 排除 `null`，因为 `typeof null` 也是 `'object'` |
| 3 | `value as Record<string, unknown>` | 只把非空对象临时当作“可按字符串 key 读取的对象” |
| 4 | `typeof candidate.id === "string"` | 真正检查 `id` 的运行时类型 |
| 5 | `typeof candidate.price === "number"` | 真正检查 `price` 的运行时类型 |
| 6 | `value is ProductRecord` | 把函数的 `true` 结果绑定到类型收窄 |

这里的 `as Record<string, unknown>` 是局部、保守、可解释的断言。它没有说“这个值已经是产品对象”，它只说：

```txt
I have already checked that this is a non-null object.
Now I need a temporary indexed view so I can inspect its properties.
```

危险写法是直接跳过验证：

```ts
// Goal:
// Show an unsafe final assertion.

export {};

type ProductRecord = {
  id: string;
  price: number;
};

const rawValue: unknown = JSON.parse('{"id":123,"price":"99"}');
const productRecord = rawValue as ProductRecord;

console.log(productRecord.id.toUpperCase());
console.log(productRecord.price + 1);
```

这个写法的问题不是语法错，而是模型错：

```txt
TypeScript checker:
  Trusts productRecord as ProductRecord.

Runtime:
  id is actually number.
  price is actually string.

Result:
  The type system has been bypassed.
```

#### 断言的使用原则

学习阶段可以先记这四条：

| 场景 | 应该怎么做 | 原因 |
|---|---|---|
| 外部数据 | 先 `unknown`，再 runtime check，再 type guard | 外部数据不受 TS 控制 |
| DOM 查询 | 先判断是否为 `null`，少用 `!` | DOM 元素可能不存在 |
| 字面量配置对象 | 可以用 `as const` | 让 TS 保留精确字面量类型 |
| 类型系统暂时无法表达但你已经验证过 | 可以局部使用 `as` | 断言范围越小，风险越小 |

最危险的习惯是：

```txt
看到类型报错 -> 加 as -> 报错消失 -> 以为代码安全
```

正确习惯是：

```txt
看到类型报错 -> 问编译器缺少什么证据 -> 用 runtime check / 更准确的类型 / 更清楚的函数边界补证据
```


这几个符号在第 3 章只需要掌握“能读懂示例”的程度，不需要提前学完整泛型、类型运算符和高级类型。完整泛型会在第 4 章和第 6 章系统学习。

#### 机制片段：`<...>` 不是比较运算符

```ts
type ProductMap = Record<string, unknown>;
```

这里的 `Record<string, unknown>` 读法是：

```txt
Record:
  一个 TypeScript 内置泛型工具类型。

string:
  第一个类型参数，表示对象的 key 是 string。

unknown:
  第二个类型参数，表示对象的 value 暂时未知。
```

它不是下面这种 JavaScript 比较表达式：

```ts
const isLess = 1 < 2;
```

判断方式：

```txt
出现在类型声明右边、冒号后面、type alias 右边：
  通常是 TypeScript 类型语法。

出现在普通表达式里：
  可能是 JavaScript 比较运算。
```

#### 本章必须先建立：`<...>` 到底在 TypeScript 里做什么

`<...>` 本身不是一个固定含义的“万能符号”。它的意思由所在位置决定。第 3 章里最常见的是 **类型参数列表（type argument list）**：把一个或多个类型传给一个泛型类型，让这个泛型类型生成一个更具体的类型。

先看这行：

```ts
type ProductMap = Record<string, unknown>;
```

这行代码可以拆成三层：

```txt
Record
  TypeScript 内置泛型工具类型。
  它需要两个类型参数。

<string, unknown>
  传给 Record 的类型参数列表。
  第一个类型参数是 key 的类型。
  第二个类型参数是 value 的类型。

ProductMap
  得到的新类型。
  它表示：一个可以用 string key 读取，读取出来的 value 暂时是 unknown 的对象类型。
```

所以 `Record<string, unknown>` 的意思不是“调用 Record 函数”，也不是“创建一个对象”。它只是类型系统里的类型表达式。编译成 JavaScript 后，`Record<string, unknown>` 不会存在。

更具体地说：

```ts
type ProductMap = Record<string, unknown>;

const productMap: ProductMap = {
  keyboard: { price: 99 },
  mouse: { price: 49 },
};

const keyboardValue = productMap.keyboard;
```

逐行看：

| 代码 | TypeScript 编译期含义 | JavaScript 运行时含义 |
|---|---|---|
| `type ProductMap = Record<string, unknown>` | 创建一个类型别名，描述 string key 到 unknown value 的对象形状 | 这一行会被擦除，运行时没有 `ProductMap` |
| `const productMap: ProductMap = ...` | 检查右侧对象能不能满足 `ProductMap` | 创建普通 JavaScript 对象 |
| `productMap.keyboard` | 读取结果的类型是 `unknown` | 读取对象的 `keyboard` 属性值 |

关键点在这里：`<string, unknown>` 是给 `Record` 这个“类型工具”提供材料。没有这两个材料，`Record` 无法知道对象的 key 和 value 应该是什么类型。

#### `Array<string>` 里的 `<string>` 是同一种机制

```ts
const tagList: Array<string> = ["typescript", "frontend"];
```

这行的意思是：

```txt
Array
  JavaScript 的数组构造函数在 TypeScript 类型系统中的泛型类型表示。

<string>
  告诉 TypeScript：这个数组里的元素应该是 string。

tagList
  变量保存一个运行时数组，但 TypeScript 会检查它的元素类型。
```

它和下面这行在本章可以先理解为等价：

```ts
const tagList: string[] = ["typescript", "frontend"];
```

`string[]` 是数组类型的简写；`Array<string>` 是泛型写法。它们都表示“元素类型是 string 的数组”。

#### `Promise<number>`、`Record<string, unknown>`、`Array<string>` 的共同模型

虽然第 3 章还没有正式学习 `Promise` 和泛型函数，但你会在项目里经常看到这种结构：

```txt
GenericType<TypeArgument>
```

读法是：

```txt
GenericType:
  一个可以接收类型参数的类型模板。

TypeArgument:
  传进去的具体类型。

GenericType<TypeArgument>:
  用具体类型填充模板以后得到的新类型。
```

对比一下：

| 写法 | 怎么读 | 类型系统含义 |
|---|---|---|
| `Array<string>` | string 数组 | 数组元素必须是 `string` |
| `Array<number>` | number 数组 | 数组元素必须是 `number` |
| `Record<string, unknown>` | string key 到 unknown value 的对象 | 可以用 string key 读值，但读出来还不能直接用 |
| `Promise<number>` | 未来会得到 number 的 Promise | `await` 后的结果应该是 `number` |

第 3 章只要求你记住这个操作模型：

```txt
<...> 在类型位置里通常表示：
把具体类型传进一个泛型类型，得到一个更具体的类型。
```

#### `T` 是什么，为什么经常出现在 `<T>` 里

你会经常看到 `Array<T>`、`Promise<T>`、`Result<T>`。这里的 `T` 不是特殊关键字，而是一个常用的类型参数名。

可以把它理解成类型层面的“占位变量”：

```ts
type Box<T> = {
  value: T;
};

type StringBox = Box<string>;
type NumberBox = Box<number>;
```

这段代码的类型层含义是：

```txt
Box<T>:
  定义一个类型模板。
  T 暂时不知道是什么。

Box<string>:
  把 T 替换成 string。
  得到 { value: string }。

Box<number>:
  把 T 替换成 number。
  得到 { value: number }。
```

注意：这只是帮助你读懂 `Array<T>` 这类写法。完整泛型机制会在第 4 章和第 6 章再系统学习。

#### `<...>` 在不同上下文里的不同含义

同样是尖括号，位置不同，含义完全不同。你以后看到它时，先判断上下文。

| 写法 | 所在位置 | 含义 | 本章怎么处理 |
|---|---|---|---|
| `Record<string, unknown>` | 类型位置 | 泛型类型参数列表 | 需要理解 |
| `Array<string>` | 类型位置 | 数组元素类型参数 | 需要理解 |
| `Box<T>` | 类型声明位置 | 声明一个类型参数 | 先认识，后面系统学 |
| `<ProductRecord>value` | `.ts` 表达式前 | 旧式类型断言 | 先知道有这种写法，但本章推荐 `value as ProductRecord` |
| `<div>` | `.tsx` 文件里 | JSX 标签 | React / TSX 章节再系统学 |
| `1 < 2` | JavaScript 表达式 | 小于比较运算符 | 这是运行时表达式，不是类型语法 |

为什么本章推荐 `as`，不推荐 `<ProductRecord>value` 这种旧式断言？因为在 `.tsx` 文件里，`<ProductRecord>value` 很容易和 JSX 标签冲突。现代 TypeScript 代码里，类型断言更常写成：

```ts
const productRecord = inputValue as ProductRecord;
```

#### 判断 `<...>` 的实用规则

看到 `<...>` 时，不要先背定义，先问四个问题：

```txt
1. 它是不是出现在 type alias、冒号后面、函数返回类型、泛型类型后面？
   是：大概率是 TypeScript 类型语法。

2. 它是不是夹在两个运行时表达式之间，比如 1 < 2？
   是：这是 JavaScript 比较运算。

3. 它是不是在 .tsx 文件里像 HTML 标签一样出现？
   是：这是 JSX。

4. 它是不是写在一个值前面，比如 <ProductRecord>inputValue？
   是：这是旧式类型断言，不是类型参数列表。
```

#### 常见错误：把 `Record<string, unknown>` 当成运行时代码

错误理解：

```txt
Record<string, unknown> 会在运行时创建一种特殊对象。
```

正确理解：

```txt
Record<string, unknown> 只在 TypeScript 编译期存在。
它告诉 checker：这个类型允许 string key，value 类型先保持 unknown。
运行时真正存在的还是普通 JavaScript object。
```

错误理解：

```txt
Array<string> 和 new Array() 是一样的东西。
```

正确理解：

```txt
Array<string> 是类型表达式。
new Array() 是运行时创建数组对象的表达式。
一个给 TypeScript checker 看，一个给 JavaScript runtime 执行。
```

#### 记忆模型

```txt
TypeScript <...> in type position:
  choose the concrete type used by a generic type.

JavaScript < in expression position:
  compare two runtime values.

JSX <Tag> in TSX:
  describe UI markup.
```

#### 机制片段：`is` 不是普通返回值类型

```ts
function isProductRecord(value: unknown): value is { id: string } {
  return typeof value === "object" && value !== null && "id" in value;
}
```

这段代码有两层含义：

```txt
JavaScript runtime:
  函数执行后只返回 true 或 false。

TypeScript type system:
  如果返回 true，TypeScript 在对应分支里把 value 收窄成 { id: string }。
```

#### 机制片段：`as` 不会验证数据

```ts
const inputValue: unknown = {
  id: 123,
};

const productRecord = inputValue as { id: string };

console.log(productRecord.id);
```

这段代码不会把 `123` 转成字符串。`as { id: string }` 只是让 TypeScript 暂时相信 `inputValue` 是这个形状。运行时对象仍然是原来的对象。

本章规则：

```txt
看到 as:
  先问它前面有没有运行时检查。

如果没有检查:
  它可能只是把类型错误藏起来。
```


#### 机制片段：`@ts-expect-error` 和 `@ts-ignore` 的区别

这两个写法都属于 TypeScript 编译器指令（compiler directive），不是普通注释。它们只影响下一行代码的类型检查结果，不会进入 JavaScript 运行时。

| 指令 | 技术含义 | 下一行有错误时 | 下一行没有错误时 | 学习阶段建议 |
|---|---|---|---|---|
| `@ts-expect-error` | 预期下一行应该有 TypeScript 错误 | 压制这个预期错误 | TypeScript 会反过来报错，提示这条指令已经多余 | 推荐用于学习文件和测试错误示例 |
| `@ts-ignore` | 直接忽略下一行 TypeScript 错误 | 压制错误 | 不会提醒你这条指令已经多余 | 不推荐作为日常学习写法 |

正确学习用法：

```ts
// Goal:
// Verify that a number is not assignable to a string literal type.

// @ts-expect-error: 123 is not assignable to the literal type "draft".
const draftStatus: "draft" = 123;
```

不推荐的学习写法：

```ts
// Goal:
// Show that ts-ignore hides the compiler error without requiring it to stay real.

// @ts-ignore
const hiddenStatus: "draft" = 123;
```

两者的关键区别是：

```txt
@ts-expect-error:
  我知道下一行应该报错。
  如果未来不报错了，请提醒我。

@ts-ignore:
  不管下一行为什么报错，都先别管。
  如果未来不报错了，也不要提醒我。
```

所以在本章训练里，错误示例优先使用 `@ts-expect-error`。`@ts-ignore` 只作为必须认识的工具讲解，不作为推荐写法。真实项目里只有在迁移旧代码、第三方类型声明错误、临时兼容历史代码时才考虑使用，而且要留下原因并尽快移除。

---

## 2. 项目重新整理建议

### 结论

你当前仓库的总方向是对的：先把 JavaScript、TypeScript、React、Node.js、mini-projects 和 notes 分开。现在进入 TypeScript 后，建议把 `typescript/` 从“宽泛主题目录”升级成“章节训练目录 + 类型主题目录 + 项目整合目录”。

### 当前结构的问题

你现在的 `typescript/README.md` 已经列了这些大类：

```txt
01-basic-types
02-functions
03-objects-interfaces
04-generics
05-type-narrowing
06-utility-types
```

这个结构适合总览，但对第 3 章不够细。因为第 3 章不是一个“basic types”小节，而是 TypeScript 类型系统的地基：`any`、`unknown`、字面量类型、对象类型、联合、交叉、数组、元组、`null`、`undefined`、`void`、`never`、`enum` 都要分别训练。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json

  chapter-03-types/
    README.md
    00-runtime-values-vs-static-types/
      valueTypeBoundary.ts
      typeErasureDemo.ts
      typeAliasSyntaxBoundary.ts
    01-type-annotations-inference-widening/
      annotationVsInference.ts
      literalWidening.ts
    02-any/
      anyEscapeHatch.ts
      anyRuntimeFailure.ts
    03-unknown/
      unknownBeforeNarrowing.ts
      unknownSafeParser.ts
    04-boolean/
      booleanLiteralState.ts
    05-number/
      numberPrecision.ts
      numericLiteralStatus.ts
    06-bigint/
      bigintCounter.ts
    07-string/
      stringLiteralUnion.ts
    08-symbol/
      symbolIdentity.ts
      uniqueSymbolKey.ts
    09-object-types/
      objectShape.ts
      optionalReadonlyProperties.ts
      excessPropertyCheck.ts
      objectTypeLiteralVsRuntimeObject.ts
    10-type-aliases/
      productTypeAlias.ts
      typeAliasNameVsObjectShape.ts
    11-union-types/
      unionNarrowing.ts
      discriminatedUnion.ts
    12-intersection-types/
      composedObjectType.ts
    13-arrays/
      typedArrayMethods.ts
      readonlyArray.ts
    14-tuples/
      tupleCoordinates.ts
      tupleReturnValue.ts
    15-null-undefined/
      nullableLookup.ts
      optionalPropertyVsUndefined.ts
    16-void/
      voidReturn.ts
    17-never/
      exhaustiveCheck.ts
    18-enums/
      enumRuntimeObject.ts
      constObjectAlternative.ts
    19-mini-project/
      typedProductParser.ts
      checkoutStateModel.ts
```

### 为什么这样拆

```txt
chapter-03-types/
  用章节维度保存完整训练过程。

每个小目录：
  对应一个类型机制。
  每个文件只验证一个概念。
  错误示例和正确示例能并排比较。

notes/typescript.md：
  只放最终总结，不放所有练习过程。
```

### 和你后续学习路线的关系

TypeScript 第 3 章学扎实后，后面的函数、接口、泛型、React props、API response、form state、route params 都会更容易。原因是后续所有高级类型都建立在这几个基础动作上：

```txt
描述值的形状
限制可能的状态
组合已有类型
缩小不确定类型
保证分支处理完整
```


### 结合你当前仓库的重新规划建议

你仓库的总 README 已经把 `typescript/` 定位为 TypeScript 类型系统练习目录，把 `notes/` 定位为学习笔记、总结和复习材料。这个方向不要推翻，只需要把 `typescript/` 下面的第 3 章训练单独细分。

推荐规则：

```txt
typescript/chapter-03-types/
  保存过程型代码。
  每个目录只验证一个类型机制。
  允许出现预期类型错误。
  文件名必须描述概念，不要用 test.ts 或 demo.ts。

notes/typescript.md
  保存最终总结。
  不放所有错误示例。
  每个概念写清：类型系统行为、运行时行为、真实项目用途、常见错误。
```

现阶段不要急着把 TS、React、Node、Next.js 混在同一个项目结构里。TypeScript 第 3 章的目标不是做应用，而是训练“类型建模能力”。等你学到 React + TS 时，再把这些类型能力迁移到 props、state、API response 和 custom hook 返回值里。


---

## 3. 第 3 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
TypeScript 类型系统检查什么
  -> 类型注解、类型推导、类型拓宽
  -> any
  -> unknown
  -> boolean
  -> number
  -> bigint
  -> string
  -> symbol / unique symbol
  -> object types
  -> type aliases
  -> union types
  -> intersection types
  -> arrays
  -> tuples
  -> null / undefined
  -> void
  -> never
  -> enum
  -> 小项目整合
```

### 技术意义

JavaScript 已经有运行时类型，TypeScript 增加的是静态类型系统（static type system）。静态类型系统不是替代 JavaScript 运行时，而是在代码执行前检查：

```txt
这个值能不能被这样使用？
这个属性是否一定存在？
这个函数能不能接收这个参数？
这个变量可能处于哪些状态？
这个分支有没有处理所有情况？
```

### 本章不是类型名列表

第 3 章真正要建立的是类型思维：

```txt
any      -> 关闭检查。
unknown  -> 承认不知道，但强制先检查。
literal  -> 把值限制到某个具体常量。
object   -> 描述对象形状。
union    -> 表示多个可能状态之一。
intersection -> 合并多个类型要求。
tuple    -> 描述固定位置、固定长度的数据结构。
never    -> 表示不可能出现的值。
```

---

## 4. 本章先要建立的底层模型

### 结论

TypeScript 类型是编译期约束，不是运行时值。

```txt
TypeScript type
  -> exists during type checking
  -> helps editor and compiler reject unsafe code
  -> is removed from emitted JavaScript
  -> does not validate external data at runtime by itself
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| 静态类型系统（static type system） | 在代码运行前分析值的可能形状和使用方式。 |
| 类型注解（type annotation） | 手动告诉 TypeScript 某个变量、参数或返回值的类型。 |
| 类型推导（type inference） | TypeScript 根据初始值、表达式和上下文自动推断类型。 |
| 类型拓宽（type widening） | TypeScript 把具体字面量类型扩大成更通用的类型，例如 `'draft'` 拓宽为 `string`。 |
| 字面量类型（literal type） | 具体值本身作为类型，例如 `'draft'`、`42`、`true`。 |
| 联合类型（union type） | 一个值可以是多个类型之一，用 `|` 表示。 |
| 交叉类型（intersection type） | 一个值必须同时满足多个类型，用 `&` 表示。 |
| 类型缩小（narrowing） | 通过 `typeof`、判断、分支、判别字段等方式，把宽类型缩小到更具体的类型。 |
| 类型擦除（type erasure） | TypeScript 编译成 JavaScript 后，类型信息被删除。 |
| 结构化类型（structural typing） | 只要形状兼容，就认为类型兼容，不要求显式继承或声明同一个名字。 |

### 底层总图

```txt
source code
  -> parser builds syntax tree
  -> binder connects declarations and names
  -> checker computes and compares types
  -> emitter outputs JavaScript
  -> runtime executes JavaScript values
```

### 和 JavaScript 基础的关系

你之前学过 JavaScript 的类型、值、变量、对象、数组、函数、原型和模块。TypeScript 不是让这些机制消失，而是在它们上面加一层静态分析。

```txt
JavaScript: What value exists at runtime?
TypeScript: What values are allowed before runtime?
```


### 官方文档核对后的学习边界

本章只把 TypeScript 第 3 章和官方 Handbook 中“基础类型建模”有关的内容纳入主线。暂时不要把下面这些高级主题提前混进来：

```txt
generics
conditional types
mapped types
template literal types
declaration merging
module declaration files
decorators
```

这些内容以后都会学，但现在提前混入会让你误以为 TypeScript 的核心是“复杂类型体操”。第 3 章真正的核心只有一个：

```txt
用尽可能准确的类型描述一个 JavaScript 值可能处于的状态。
```

本章所有训练都围绕四个动作展开：

```txt
infer
  TypeScript 从初始化值和上下文推断类型。

annotate
  你在函数边界、对象结构、返回值上显式声明类型。

combine
  用 union、intersection、tuple、literal type 组合已有类型。

narrow
  用运行时判断让 TypeScript 在某个分支里得到更具体的类型。
```

---

## 5. 00：TypeScript 类型系统到底在检查什么

### 结论

TypeScript 检查的是“代码中值的使用是否符合类型约束”。它不会自动检查真实运行时传进来的外部数据是否可信。

### 技术意义

前端项目中有很多不确定数据：接口响应、表单输入、URL 参数、本地存储、第三方 SDK 返回值。TypeScript 能帮你在代码内部保持一致，但外部数据进入系统时仍然需要运行时校验。

### 文件结构

```txt
00-runtime-values-vs-static-types/
  valueTypeBoundary.ts
  typeErasureDemo.ts
  typeAliasSyntaxBoundary.ts
```

### `valueTypeBoundary.ts`

```ts
// Goal:
// Distinguish runtime values from static types.

// Expected result:
// The compiler accepts this file and Node prints the two values.

export {};

type ProductRecord = {
  id: string;
  price: number;
};

const productRecord: ProductRecord = {
  id: "keyboard",
  price: 99,
};

console.log(productRecord.id);
console.log(productRecord.price + 1);
```

### 预期输出

```txt
keyboard
100
```

### 执行过程

| 阶段 | 发生什么 |
|---|---|
| 编译期 | `ProductRecord` 只作为类型存在。 |
| 编译期 | TypeScript 检查 `productRecord.id` 是 `string`，`productRecord.price` 是 `number`。 |
| 编译输出 | `type ProductRecord` 被删除。 |
| 运行时 | JavaScript 只看到普通对象 `{ id: "keyboard", price: 99 }`。 |

### `typeErasureDemo.ts`

```ts
// Goal:
// Verify that TypeScript types are erased from JavaScript output.

// Expected result:
// The emitted JavaScript contains no UserProfile type.

export {};

type UserProfile = {
  name: string;
  role: "admin" | "member";
};

const userProfile: UserProfile = {
  name: "Ada",
  role: "admin",
};

console.log(userProfile.role);
```

### `typeAliasSyntaxBoundary.ts`

```ts
// Goal:
// Split a type alias declaration into syntax roles.

// Expected result:
// The compiler uses the alias for checking, but no alias exists at runtime.

export {};

type ProductId = string;

type ProductRecord = {
  id: ProductId;
  title: string;
};

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
};

console.log(productRecord.id);
```

### `typeAliasSyntaxBoundary.ts` 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `ProductId` 是类型别名名，右侧类型表达式是 `string`。 |
| 2 | `ProductRecord` 是类型别名名，右侧类型表达式是 object type literal。 |
| 3 | `id` 是对象类型里的属性名。 |
| 4 | `ProductId` 是 `id` 属性的值类型。 |
| 5 | `const productRecord` 创建真实运行时对象。 |
| 6 | 编译输出里没有 `ProductId` 或 `ProductRecord`。 |

### 常见错误 / 反例

错误理解：

```txt
我写了 type UserProfile，所以运行时会自动验证对象是不是 UserProfile。
```

正确模型：

```txt
type 只参与编译期检查。
运行时不会自动产生 UserProfile 构造函数，也不会自动验证接口响应。
```

---

## 6. 01：类型注解、类型推导和类型拓宽

### 结论

TypeScript 不要求所有地方都手写类型。局部变量优先依赖类型推导；函数边界、对象结构、外部数据边界优先显式标注。

### 新关键字和新概念

#### 类型注解

类型注解是写在变量、参数或返回值旁边的类型说明。

```ts
const productPrice: number = 99;
```

#### 类型推导

TypeScript 可以根据初始值推断类型。

```ts
const productPrice = 99;
```

这里 `productPrice` 的类型会被推断出来，不需要重复写 `: number`。

#### 类型拓宽

`let` 声明的值通常会被拓宽，因为它以后可以被重新赋值。

```ts
let orderStatus = "pending";
```

这里 `orderStatus` 的类型通常是 `string`，不是字面量类型 `'pending'`。

### 文件结构

```txt
01-type-annotations-inference-widening/
  annotationVsInference.ts
  literalWidening.ts
```

### `annotationVsInference.ts`

```ts
// Goal:
// Compare explicit annotation and type inference.

// Expected result:
// The compiler accepts this file.

export {};

const explicitPrice: number = 99;
const inferredPrice = 99;

function calculateTotalPrice(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

const totalPrice = calculateTotalPrice(explicitPrice, 2);

console.log(inferredPrice);
console.log(totalPrice);
```

### 执行过程

| 代码 | 类型系统行为 |
|---|---|
| `const explicitPrice: number = 99` | 手动指定 `number`。 |
| `const inferredPrice = 99` | TypeScript 根据初始值推断。 |
| 函数参数 | 函数边界需要明确参数类型。 |
| 返回值 `: number` | 显式锁定函数输出，防止以后改坏。 |

### `literalWidening.ts`

```ts
// Goal:
// Verify how let and const affect literal type widening.

// Expected result:
// The compiler accepts the valid assignments and rejects the marked one.

export {};

const fixedStatus = "draft";
let mutableStatus = "draft";

const onlyDraft: "draft" = fixedStatus;

// @ts-expect-error: mutableStatus is widened to string.
const draftOnlyStatus: "draft" = mutableStatus;

mutableStatus = "published";

console.log(fixedStatus);
console.log(mutableStatus);
```

### 常见错误

| 错误理解 | 正确模型 |
|---|---|
| 所有字符串值的类型都是 `string` | `const` 字符串可能推断为字符串字面量类型。 |
| 类型注解越多越专业 | 重复注解会制造噪音；边界位置的注解更重要。 |
| `let x = 'a'` 的类型一定是 `'a'` | `let` 通常拓宽，因为变量可重新赋值。 |

---

## 7. 02：any

### 结论

`any` 会让 TypeScript 放弃检查。它不是“任意安全类型”，而是“关闭类型系统的逃生口”。

### 技术意义

`any` 的问题不是它能接收任何值，而是它允许你对这个值做任何操作。它会把错误从编译期推迟到运行时。

### 底层机制

```txt
value typed as any
  -> can be assigned to any type
  -> can access any property
  -> can be called as a function
  -> can disable downstream type safety
```

### 文件结构

```txt
02-any/
  anyEscapeHatch.ts
  anyRuntimeFailure.ts
```

### `anyEscapeHatch.ts`

```ts
// Goal:
// Verify that any disables useful type checking.

// Expected result:
// The compiler accepts unsafe operations.

export {};

let responseBody: any = {
  id: "order-1",
  total: 120,
};

const orderId: number = responseBody.id;
const upperText = responseBody.total.toUpperCase();

console.log(orderId);
console.log(upperText);
```

### 预期现象

```txt
TypeScript 编译期：可能不报错。
JavaScript 运行时：responseBody.total.toUpperCase is not a function。
```

### `anyRuntimeFailure.ts`

```ts
// Goal:
// Show how any moves an error from compile time to runtime.

// Expected result:
// The file compiles, but runtime execution fails.

export {};

function readProductTitle(productRecord: any): string {
  return productRecord.title.toUpperCase();
}

const brokenProductRecord = {
  name: "Keyboard",
};

console.log(readProductTitle(brokenProductRecord));
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `productRecord` 被标成 `any`。 |
| 2 | TypeScript 不检查 `title` 是否存在。 |
| 3 | 编译通过。 |
| 4 | 运行时读取 `productRecord.title` 得到 `undefined`。 |
| 5 | 对 `undefined` 调用 `toUpperCase()` 抛出错误。 |

### 常见错误

| 错误 | 原因 |
|---|---|
| 把 `any` 当成灵活类型 | 它本质上是在关闭检查。 |
| 接口响应直接写成 `any` | 外部数据最需要谨慎处理。 |
| 用 `any` 解决每个报错 | 报错被隐藏，不代表问题消失。 |

### 项目规则

```txt
允许短期 any：迁移旧代码、临时兼容第三方库、先跑通原型。
必须隔离 any：只允许在边界层出现，不能扩散到业务核心。
优先替代方案：unknown、具体对象类型、泛型、运行时校验函数。
```

---

## 8. 03：unknown

### 结论

`unknown` 表示“值的类型暂时不知道”。它比 `any` 安全，因为使用前必须先缩小类型。

### 技术意义

从外部世界进来的数据，本质上都应该先视为 `unknown`：接口响应、`JSON.parse()`、表单输入、localStorage、URL query、postMessage 数据。

### 底层机制

```txt
unknown
  -> can receive any value
  -> cannot be used directly
  -> must be narrowed before property access, call, arithmetic, etc.
```


### 本节必须先补：`is` 和 `as` 为什么一起出现

`unknownSafeParser.ts` 里有两种很容易混的写法：

```txt
value is ProductRecord
value as Record<string, unknown>
```

它们解决的是两个不同问题。

| 写法 | 名称 | 作用 | 是否运行时验证 | 安全边界 |
|---|---|---|---|---|
| `value is ProductRecord` | 类型谓词（type predicate） | 把函数的 `true` 结果和类型收窄绑定起来 | 函数体里的判断才是真正验证 | 相对安全，前提是函数体检查真实可靠 |
| `value as Record<string, unknown>` | 类型断言（type assertion） | 临时告诉编译器把 `value` 当作可索引对象看 | 否 | 只能在已经检查 `object !== null` 后局部使用 |

#### 为什么 `value is ProductRecord` 写在返回类型位置

```ts
function isProductRecord(value: unknown): value is ProductRecord {
  return true;
}
```

冒号后面的 `value is ProductRecord` 不是普通的 `boolean` 返回类型。它的意思是：

```txt
当这个函数返回 true 时，
TypeScript 可以把传入的 value 从 unknown 收窄成 ProductRecord。
```

运行时实际返回的仍然只是 `true` 或 `false`。`is` 的作用发生在 TypeScript 的控制流分析（control-flow analysis）里。

#### 为什么 `as Record<string, unknown>` 不是最终验证

在这段代码里：

```ts
const candidate = value as Record<string, unknown>;
```

`as` 的目的不是证明 `value` 已经是 `ProductRecord`，而是解决一个更小的问题：

```txt
前面已经检查 value 是非 null object。
但 TypeScript 还不知道这个 object 上能不能用 candidate.id 这种方式读取属性。
所以先把它临时看成 Record<string, unknown>。
然后再逐个检查 id、price 等属性的真实运行时类型。
```

这就是为什么正确顺序必须是：

```txt
unknown
  -> typeof value === "object"
  -> value !== null
  -> value as Record<string, unknown>
  -> typeof candidate.id === "string"
  -> typeof candidate.price === "number"
  -> value is ProductRecord
```

错误顺序是：

```txt
unknown
  -> value as ProductRecord
  -> 直接使用
```

这个错误顺序没有验证任何东西，只是把 TypeScript 报错压下去。


#### 本节里的断言边界

`unknownSafeParser.ts` 里的 `as Record<string, unknown>` 是一个“局部断言”，不是最终结论。

它合理的原因是前面已经完成了最基本的运行时保护：

```txt
typeof value === "object"
value !== null
```

这两个检查只证明一件事：

```txt
value 是一个非 null object。
```

它还没有证明：

```txt
value.id 是 string。
value.price 是 number。
value.tags 是 string[]。
```

所以这里的 `as Record<string, unknown>` 只是让 TypeScript 允许你用属性名读取未知属性：

```ts
// Goal:
// Create a temporary indexable view after checking object and null.

export {};

function readCandidateId(value: unknown): unknown {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const candidate = value as Record<string, unknown>;

  return candidate.id;
}
```

真正让 `value` 变成可信业务类型的是后面的运行时判断：

```txt
typeof candidate.id === "string"
typeof candidate.price === "number"
Array.isArray(candidate.tags)
```

因此本节的规则是：

```txt
as Record<string, unknown>:
  可以作为读取未知对象属性的中间步骤。

as ProductRecord:
  不能替代真实验证。
```




### 文件结构

```txt
03-unknown/
  unknownBeforeNarrowing.ts
  unknownSafeParser.ts
```

### `unknownBeforeNarrowing.ts`

```ts
// Goal:
// Verify that unknown must be narrowed before use.

// Expected result:
// The compiler rejects direct property access on unknown.

export {};

const inputValue: unknown = {
  name: "Ada",
};

// @ts-expect-error: unknown must be narrowed before property access.
console.log(inputValue.name);

if (typeof inputValue === "object" && inputValue !== null && "name" in inputValue) {
  console.log(inputValue);
}
```

### `unknownSafeParser.ts`

```ts
// Goal:
// Convert unknown external data into a safe ProductRecord.

// Expected result:
// The parser returns a ProductRecord only after runtime checks.

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

  return typeof candidate.id === "string" && typeof candidate.price === "number";
}

const rawValue: unknown = JSON.parse('{"id":"keyboard","price":99}');

if (isProductRecord(rawValue)) {
  console.log(rawValue.id);
  console.log(rawValue.price + 1);
}
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `JSON.parse()` 的结果从真实语义上是不可信数据。 |
| 2 | 用 `unknown` 表示暂时不能直接使用。 |
| 3 | `isProductRecord()` 做运行时检查。 |
| 4 | 返回类型 `value is ProductRecord` 告诉 TypeScript：检查成功后可以缩小类型。 |
| 5 | `if` 分支内部可以安全访问 `id` 和 `price`。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `unknown` 和 `any` 一样 | `unknown` 能接收任何值，但不能随便使用。 |
| 直接把 `unknown` 断言成目标类型 | 断言不等于验证。 |
| 以为 TypeScript 会自动检查 JSON | JSON 是运行时数据，需要运行时检查。 |


### any 与 unknown 的官方文档补充模型

```txt
any:
  允许你跳过类型检查。
  属性访问、函数调用、赋值都会被放行。
  一旦进入表达式链，any 会继续传播。
  适合临时迁移旧 JS 或暂时没有类型声明的第三方代码。
  不适合表示“我还不知道这个值是什么”。

unknown:
  允许接收任意值。
  不允许直接读属性、调用方法、赋值给具体类型。
  必须先经过 typeof、Array.isArray、自定义 type guard 等收窄。
  适合表示外部输入、JSON.parse、localStorage、URL query、接口响应。
```

本章以这个实践原则为准：

```txt
外部输入默认 unknown。
临时绕过才使用 any。
业务模型不要使用 any。
```

错误判断：

```txt
这个值我不知道是什么，所以写 any。
```

正确判断：

```txt
这个值我不知道是什么，所以先写 unknown。
等代码证明它是什么以后，再把它收窄成具体类型。
```

---

## 9. 04：boolean 和布尔字面量类型

### 结论

`boolean` 表示 `true` 或 `false`；布尔字面量类型 `true`、`false` 可以用来表达更严格的状态。

### 文件结构

```txt
04-boolean/
  booleanLiteralState.ts
```

### `booleanLiteralState.ts`

```ts
// Goal:
// Use boolean and boolean literal types for state modeling.

// Expected result:
// The compiler accepts valid states and rejects invalid ones.

export {};

type LoadingState = {
  isLoading: true;
  data: null;
};

type LoadedState = {
  isLoading: false;
  data: string[];
};

type RequestState = LoadingState | LoadedState;

function renderState(state: RequestState): string {
  if (state.isLoading) {
    return "Loading";
  }

  return state.data.join(",");
}

console.log(renderState({ isLoading: true, data: null }));
console.log(renderState({ isLoading: false, data: ["a", "b"] }));
```

### 技术意义

布尔值不只表示开关。布尔字面量类型可以成为联合类型的判别信息，让 TypeScript 在不同分支里推断出不同对象形状。

### 常见错误

错误建模：

```ts
// Goal:
// Show a weak request state model.

export {};

type WeakRequestState = {
  isLoading: boolean;
  data: string[] | null;
};
```

这个类型允许出现不合理状态：

```txt
isLoading: true, data: ['already-loaded']
isLoading: false, data: null
```

更好的模型是用联合类型把状态绑定起来。

---

## 10. 05：number 和数值字面量类型

### 结论

`number` 描述 JavaScript 的双精度浮点数值；数值字面量类型可以限制某个值只能是固定数字集合之一。

### 技术意义

TypeScript 的 `number` 不区分整数、浮点数、正数、负数，也不会自动表达金额、百分比、评分范围。需要更严格的业务范围时，要用字面量联合、对象封装或运行时校验。

### 文件结构

```txt
05-number/
  numberPrecision.ts
  numericLiteralStatus.ts
```

### `numberPrecision.ts`

```ts
// Goal:
// Remember that TypeScript number follows JavaScript number behavior.

// Expected result:
// Node prints a floating-point precision result.

export {};

const firstValue: number = 0.1;
const secondValue: number = 0.2;
const totalValue: number = firstValue + secondValue;

console.log(totalValue);
```

### 预期输出

```txt
0.30000000000000004
```

### 机制解释

`number` 是类型系统中的静态描述，不能改变 JavaScript 的 IEEE 754 浮点数机制。TypeScript 能检查你是不是把字符串当数字用，但不能让浮点数变成十进制精确数。

### `numericLiteralStatus.ts`

```ts
// Goal:
// Use numeric literal union types for allowed rating values.

// Expected result:
// The compiler accepts allowed ratings and rejects invalid ratings.

export {};

type RatingScore = 1 | 2 | 3 | 4 | 5;

function formatRating(score: RatingScore): string {
  return `${score}/5`;
}

console.log(formatRating(5));

// @ts-expect-error: 6 is not an allowed rating score.
console.log(formatRating(6));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为 `number` 表示所有“合法业务数字” | `number` 只表示 JS number 值。 |
| 以为 TypeScript 会修复浮点误差 | 不会，运行时仍然是 JS。 |
| 用 `number` 表示有限状态 | 有限集合优先考虑字面量联合。 |

---

## 11. 06：bigint

### 结论

`bigint` 表示 JavaScript 的 BigInt 值，适合需要超过安全整数范围的整数。它不能和 `number` 在算术运算中混用。

### 文件结构

```txt
06-bigint/
  bigintCounter.ts
```

### `bigintCounter.ts`

```ts
// Goal:
// Verify bigint typing and arithmetic rules.

// Expected result:
// The compiler accepts bigint arithmetic and rejects mixed arithmetic.

export {};

const largeId: bigint = 9007199254740993n;
const nextLargeId = largeId + 1n;

console.log(nextLargeId);

const smallCount = 1;

// @ts-expect-error: bigint and number cannot be mixed in arithmetic.
console.log(largeId + smallCount);
```

### 技术意义

`bigint` 和 `number` 是两种不同运行时类型。TypeScript 在编译期阻止它们直接混合，是因为 JavaScript 运行时本来就不允许这种算术操作。

### 常见错误

```txt
错误：把 API 返回的超大 id 当 number。
正确：如果 id 只用于展示和传输，通常用 string；如果确实要做大整数运算，再用 bigint。
```

---

## 12. 07：string 和字符串字面量类型

### 结论

`string` 表示任意字符串；字符串字面量类型可以把字符串限制到固定集合，是前端状态建模的核心工具。

### 文件结构

```txt
07-string/
  stringLiteralUnion.ts
```

### `stringLiteralUnion.ts`

```ts
// Goal:
// Use string literal union types for UI state.

// Expected result:
// The compiler accepts known tabs and rejects unknown tabs.

export {};

type SettingsTab = "profile" | "security" | "billing";

function createTabLabel(tabName: SettingsTab): string {
  switch (tabName) {
    case "profile":
      return "Profile";
    case "security":
      return "Security";
    case "billing":
      return "Billing";
  }
}

console.log(createTabLabel("profile"));

// @ts-expect-error: reports is not a SettingsTab.
console.log(createTabLabel("reports"));
```

### 技术意义

字符串字面量联合比散落在代码里的普通字符串更安全。它可以让编辑器自动补全，也可以让 TypeScript 拦截拼写错误。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有状态都写 `string` | 有限状态应该写成字面量联合。 |
| 到处复制字符串 | 把状态集合集中成一个类型。 |
| 用 enum 表示所有字符串状态 | 字符串字面量联合更轻、更贴近 JS 输出。 |

---

## 13. 08：symbol 和 unique symbol

### 结论

`symbol` 表示 JavaScript 的唯一符号值；`unique symbol` 表示某个具体唯一符号的类型，通常用于非常严格的对象键或品牌标记。

### 文件结构

```txt
08-symbol/
  symbolIdentity.ts
  uniqueSymbolKey.ts
```

### `symbolIdentity.ts`

```ts
// Goal:
// Verify that symbols are unique runtime values.

// Expected result:
// Node prints false.

export {};

const firstKey = Symbol("cache");
const secondKey = Symbol("cache");

console.log(firstKey === secondKey);
```

### `uniqueSymbolKey.ts`

```ts
// Goal:
// Use unique symbol as a strongly typed object key.

// Expected result:
// The compiler accepts access through the same unique symbol.

export {};

const internalIdKey: unique symbol = Symbol("internalId");

type EntityRecord = {
  name: string;
  [internalIdKey]: string;
};

const entityRecord: EntityRecord = {
  name: "Order",
  [internalIdKey]: "order-1",
};

console.log(entityRecord[internalIdKey]);
```

### 常见错误

```txt
symbol 的描述文本不是身份。
Symbol('id') 和 Symbol('id') 是两个不同值。
unique symbol 类型只能用于 const 声明或 readonly static 属性等稳定位置。
```

---

## 14. 09：对象类型

### 结论

对象类型描述的是对象的“形状”（shape）：有哪些属性、属性值是什么类型、属性是否可选、是否只读。

### 技术意义

TypeScript 使用结构化类型系统（structural type system）。两个对象类型是否兼容，主要看形状是否匹配，而不是看它们是否来自同一个类或同一个声明名。

### 文件结构

```txt
09-object-types/
  objectShape.ts
  optionalReadonlyProperties.ts
  excessPropertyCheck.ts
  objectTypeLiteralVsRuntimeObject.ts
```

### `objectShape.ts`

```ts
// Goal:
// Verify structural object typing.

// Expected result:
// The compiler accepts objects with compatible shapes.

export {};

type ProductCard = {
  id: string;
  title: string;
  price: number;
};

function renderProductCard(product: ProductCard): string {
  return `${product.title}: ${product.price}`;
}

const keyboardRecord = {
  id: "keyboard",
  title: "Keyboard",
  price: 99,
  stock: 12,
};

console.log(renderProductCard(keyboardRecord));
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `ProductCard` 要求 `id`、`title`、`price`。 |
| 2 | `keyboardRecord` 有这些属性。 |
| 3 | 它额外有 `stock`，但变量传参时结构兼容。 |
| 4 | 函数内部只按 `ProductCard` 的形状使用它。 |

### `optionalReadonlyProperties.ts`

```ts
// Goal:
// Use optional and readonly object properties.

// Expected result:
// The compiler rejects assignment to a readonly property.

export {};

type UserProfile = {
  readonly id: string;
  name: string;
  avatarUrl?: string;
};

const userProfile: UserProfile = {
  id: "user-1",
  name: "Ada",
};

userProfile.name = "Grace";

// @ts-expect-error: id is readonly.
userProfile.id = "user-2";

console.log(userProfile.name);
```

### `excessPropertyCheck.ts`

```ts
// Goal:
// Verify excess property checks on object literals.

// Expected result:
// The compiler rejects direct object literals with extra properties.

export {};

type ProductCard = {
  id: string;
  title: string;
};

function renderProduct(product: ProductCard): string {
  return product.title;
}

// @ts-expect-error: extra properties are checked on direct object literals.
renderProduct({ id: "p1", title: "Keyboard", price: 99 });

const productRecord = { id: "p1", title: "Keyboard", price: 99 };
renderProduct(productRecord);
```


### `objectTypeLiteralVsRuntimeObject.ts`

```ts
// Goal:
// Compare an object type literal with a runtime object literal.

// Expected result:
// The type literal is erased, while the runtime object remains.

export {};

type ProductCard = {
  id: string;
  title: string;
};

const productCard = {
  id: "p1",
  title: "Keyboard",
};

function renderProductCard(product: ProductCard): string {
  return product.title;
}

console.log(renderProductCard(productCard));
```

### `objectTypeLiteralVsRuntimeObject.ts` 执行过程

| 片段 | 角色 | 是否运行时存在 |
|---|---|---|
| `type ProductCard = ...` | 类型别名声明 | 否 |
| `{ id: string; title: string }` | 对象类型字面量 | 否 |
| `const productCard = ...` | 变量声明 | 是 |
| `{ id: "p1", title: "Keyboard" }` | 对象值字面量 | 是 |
| `product: ProductCard` | 参数类型注解 | 否 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为对象类型必须完全相等 | 结构兼容通常允许额外属性。 |
| 不理解直接对象字面量更严格 | excess property check 用来捕捉拼写和多余字段错误。 |
| 以为 `readonly` 会冻结对象 | `readonly` 是编译期限制，不等于运行时 `Object.freeze()`。 |

---

## 15. 10：类型别名

### 结论

类型别名（type alias）给复杂类型起名字，让类型可以被复用、组合和表达业务含义。

### 文件结构

```txt
10-type-aliases/
  productTypeAlias.ts
  typeAliasNameVsObjectShape.ts
```

### `productTypeAlias.ts`

```ts
// Goal:
// Use type aliases to name reusable domain types.

// Expected result:
// The compiler accepts this file.

export {};

type ProductId = string;

type MoneyAmount = {
  cents: number;
  currency: "USD" | "EUR" | "CNY";
};

type ProductRecord = {
  id: ProductId;
  title: string;
  price: MoneyAmount;
};

const productRecord: ProductRecord = {
  id: "keyboard",
  title: "Keyboard",
  price: {
    cents: 9900,
    currency: "USD",
  },
};

console.log(productRecord.price.cents);
```


### `typeAliasNameVsObjectShape.ts`

```ts
// Goal:
// Separate alias names, property names, and property value types.

// Expected result:
// The compiler checks each property value against its declared type.

export {};

type ProductId = string;

type ProductRecord = {
  id: ProductId;
  title: string;
};

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
};

const invalidProductRecord: ProductRecord = {
  // @ts-expect-error: id must be a ProductId, which is a string alias.
  id: 123,
  title: "Mouse",
};

console.log(productRecord.title, invalidProductRecord.title);
```

### `typeAliasNameVsObjectShape.ts` 执行过程

| 代码片段 | 正确角色 |
|---|---|
| `ProductId` | 类型别名名，指向 `string`。 |
| `ProductRecord` | 类型别名名，指向一个对象类型。 |
| `id` | `ProductRecord` 对象类型里的属性名。 |
| `ProductId` in `id: ProductId` | `id` 属性的值类型。 |
| `title` | 属性名。 |
| `string` in `title: string` | `title` 属性的值类型。 |

### 技术意义

类型别名不创造新的运行时实体。它只是给类型表达式命名。`type ProductId = string` 不会让 `ProductId` 在运行时存在。

### 常见错误

```txt
错误：以为 type alias 会生成 JavaScript 代码。
正确：type alias 编译后被擦除，只用于检查。
```

---

## 16. 11：联合类型

### 结论

联合类型表示“一个值可以是几种类型之一”。使用联合类型后，必须通过类型缩小才能安全使用每种类型的专属能力。

### 文件结构

```txt
11-union-types/
  unionNarrowing.ts
  discriminatedUnion.ts
```

### `unionNarrowing.ts`

```ts
// Goal:
// Narrow a union type before using type-specific methods.

// Expected result:
// The compiler accepts narrowed branches.

export {};

function formatId(idValue: string | number): string {
  if (typeof idValue === "string") {
    return idValue.toUpperCase();
  }

  return idValue.toFixed(0);
}

console.log(formatId("ab-12"));
console.log(formatId(42));
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 参数类型是 `string | number`。 |
| 2 | 进入函数时，只能使用二者共有能力。 |
| 3 | `typeof idValue === "string"` 把类型缩小为 `string`。 |
| 4 | `else` 分支中剩下的可能性是 `number`。 |

### `discriminatedUnion.ts`

```ts
// Goal:
// Model UI request states with a discriminated union.

// Expected result:
// The compiler narrows each branch by the status field.

export {};

type IdleState = {
  status: "idle";
};

type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string[];
};

type ErrorState = {
  status: "error";
  message: string;
};

type RequestState = IdleState | LoadingState | SuccessState | ErrorState;

function renderRequestState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Idle";
    case "loading":
      return "Loading";
    case "success":
      return state.data.join(",");
    case "error":
      return state.message;
  }
}

console.log(renderRequestState({ status: "success", data: ["a", "b"] }));
```

### 技术意义

判别联合（discriminated union）是前端状态建模的核心。它能防止 UI 状态之间互相污染，例如“失败状态却带着成功数据”或“成功状态没有 data”。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `data?: T`、`error?: string` 堆在一个对象上 | 这会允许非法状态组合。 |
| 联合类型后直接访问专属属性 | 必须先缩小类型。 |
| 用字符串到处判断但没有统一类型 | 应该把状态字段写成字面量联合。 |

---

## 17. 12：交叉类型

### 结论

交叉类型表示“一个值必须同时满足多个类型要求”。它常用于组合对象能力，而不是表示“二选一”。

### 文件结构

```txt
12-intersection-types/
  composedObjectType.ts
```

### `composedObjectType.ts`

```ts
// Goal:
// Compose object requirements with an intersection type.

// Expected result:
// The compiler requires all properties from both sides.

export {};

type TimestampFields = {
  createdAt: string;
  updatedAt: string;
};

type ProductFields = {
  id: string;
  title: string;
};

type ProductRecord = ProductFields & TimestampFields;

const productRecord: ProductRecord = {
  id: "keyboard",
  title: "Keyboard",
  createdAt: "2026-05-13T00:00:00.000Z",
  updatedAt: "2026-05-13T00:00:00.000Z",
};

console.log(productRecord.title);
```

### 技术意义

交叉类型适合把横切字段组合进业务对象，例如时间戳、软删除字段、分页元数据、权限元数据。

### 常见错误

错误理解：

```txt
A & B 表示 A 或 B。
```

正确模型：

```txt
A & B 表示同时满足 A 和 B。
A | B 才表示 A 或 B。
```

危险反例：

```ts
// Goal:
// Show impossible primitive intersections.

export {};

type ImpossibleValue = string & number;

// @ts-expect-error: no value can be both string and number.
const value: ImpossibleValue = "x";
```

---

## 18. 13：数组类型

### 结论

数组类型描述“一组同类元素的列表”。TypeScript 能检查数组元素类型，但普通数组类型不限制长度。



### 本节必须先补：`T[]`、`Array<T>` 和尖括号

数组类型有两种常见写法：

```ts
const firstTagList: string[] = ["typescript"];
const secondTagList: Array<string> = ["frontend"];
```

这两种写法在本章大多数场景下等价：

```txt
string[]:
  更常见，更简洁。

Array<string>:
  使用泛型类型写法，尖括号里的 string 是元素类型。
```

`Array<T>` 里的 `T` 是一个占位名，意思是：

```txt
Array<string>:
  string 元素组成的数组。

Array<number>:
  number 元素组成的数组。

Array<ProductRecord>:
  ProductRecord 元素组成的数组。
```

第 3 章你只需要先能读懂这个模式：

```txt
GenericType<TypeArgument>
```

完整泛型机制以后会在函数和高级类型章节展开。这里先不要把 `<...>` 看成比较符号。

#### 本节代码里的 `<...>` 怎么参与检查

看这两行：

```ts
const firstTagList: string[] = ["typescript"];
const secondTagList: Array<string> = ["frontend"];
```

它们给 TypeScript 的信息是一样的：

```txt
firstTagList:
  array value at runtime
  string[] type at compile time

secondTagList:
  array value at runtime
  Array<string> type at compile time
```

所以后面这行会被接受：

```ts
secondTagList.push("react");
```

而这行会被拒绝：

```ts
// @ts-expect-error: number is not assignable to string.
secondTagList.push(123);
```

原因不是 `Array<string>` 改变了运行时数组，而是 TypeScript checker 知道：这个数组的元素类型应该是 `string`。`push()` 的参数也因此被检查为 `string`。

运行时层面，数组仍然是普通 JavaScript 数组。类型层面的 `string` 不会跟着数组进入浏览器或 Node。

### 文件结构

```txt
13-arrays/
  typedArrayMethods.ts
  readonlyArray.ts
```

### `typedArrayMethods.ts`

```ts
// Goal:
// Verify typed array element behavior.

// Expected result:
// The compiler accepts string operations on string array elements.

export {};

const tagList: string[] = ["typescript", "frontend"];

tagList.push("types");

// @ts-expect-error: number is not assignable to string.
tagList.push(123);

const upperTagList = tagList.map((tagName) => {
  return tagName.toUpperCase();
});

console.log(upperTagList);
```

### `readonlyArray.ts`

```ts
// Goal:
// Use readonly arrays to prevent mutation through a function boundary.

// Expected result:
// The compiler rejects mutation of readonly arrays.

export {};

function createSortedCopy(scoreList: readonly number[]): number[] {
  // @ts-expect-error: readonly array cannot be mutated.
  scoreList.sort();

  return [...scoreList].sort((leftScore, rightScore) => leftScore - rightScore);
}

console.log(createSortedCopy([3, 1, 2]));
```

### 技术意义

`readonly number[]` 的意义不是冻结运行时数组，而是在函数边界告诉调用者：这个函数不会修改你传进来的数组引用。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `string[]` 表示至少一个字符串 | 它可以是空数组。 |
| `Array<T>` 和 `T[]` 是两种完全不同能力 | 二者大多数场景等价，只是语法不同。 |
| `readonly` 等于运行时不可变 | 它是类型系统限制，不是运行时冻结。 |

---

## 19. 14：元组类型

### 结论

元组（tuple）描述固定长度、固定位置含义的数组。数组关注“每个元素是什么类型”，元组关注“第几个位置是什么类型”。

### 文件结构

```txt
14-tuples/
  tupleCoordinates.ts
  tupleReturnValue.ts
```

### `tupleCoordinates.ts`

```ts
// Goal:
// Use a tuple for fixed-position data.

// Expected result:
// The compiler enforces tuple positions.

export {};

type Point2D = [number, number];

function formatPoint(point: Point2D): string {
  const [xValue, yValue] = point;
  return `(${xValue}, ${yValue})`;
}

console.log(formatPoint([10, 20]));

// @ts-expect-error: second tuple item must be a number.
console.log(formatPoint([10, "20"]));
```

### `tupleReturnValue.ts`

```ts
// Goal:
// Use a named tuple return value.

// Expected result:
// The compiler preserves tuple positions.

export {};

type ParseResult = [success: true, value: number] | [success: false, error: string];

function parseNumber(inputText: string): ParseResult {
  const parsedValue = Number(inputText);

  if (Number.isNaN(parsedValue)) {
    return [false, "Invalid number"];
  }

  return [true, parsedValue];
}

const result = parseNumber("42");

if (result[0]) {
  console.log(result[1].toFixed(0));
} else {
  console.log(result[1].toUpperCase());
}
```

### 技术意义

元组适合表达轻量结构：坐标、范围、函数返回的成对结果、`Object.entries()` 风格数据。对象适合表达字段较多、语义需要自解释的数据。

### 常见错误

```txt
错误：把所有数组都写成 tuple。
正确：只有长度固定且位置有语义时才用 tuple。
```

---

## 20. 15：null 和 undefined

### 结论

`null` 和 `undefined` 都表示“没有值”，但语义不同。开启 `strictNullChecks` 后，它们不会自动赋给所有类型。

### 技术意义

前端项目里最常见的空值来源：接口字段缺失、可选表单项、DOM 查询失败、数组查找失败、路由参数不存在。TypeScript 的价值是逼你在使用前处理这些空值。

### 文件结构

```txt
15-null-undefined/
  nullableLookup.ts
  optionalPropertyVsUndefined.ts
```

### `nullableLookup.ts`

```ts
// Goal:
// Handle a nullable lookup result before use.

// Expected result:
// The compiler requires null checking.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

function findProductById(productList: ProductRecord[], id: string): ProductRecord | null {
  return productList.find((product) => product.id === id) ?? null;
}

const productList: ProductRecord[] = [
  { id: "keyboard", title: "Keyboard" },
];

const productRecord = findProductById(productList, "mouse");

if (productRecord !== null) {
  console.log(productRecord.title);
} else {
  console.log("Not found");
}
```

### `optionalPropertyVsUndefined.ts`

```ts
// Goal:
// Compare optional properties and explicit undefined.

// Expected result:
// The compiler treats optional properties as possibly missing.

export {};

type ProfileForm = {
  displayName: string;
  avatarUrl?: string;
};

const profileForm: ProfileForm = {
  displayName: "Ada",
};

if (profileForm.avatarUrl !== undefined) {
  console.log(profileForm.avatarUrl.toUpperCase());
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 直接对可能为空的值访问属性 | 先判断 `null` 或 `undefined`。 |
| 不区分字段缺失和字段值为 `undefined` | 开启 `exactOptionalPropertyTypes` 后区别更明显。 |
| 用 `!` 到处消除报错 | 非空断言只是绕过检查，不会改变运行时。 |


### 本节必须先补：非空断言 `!` 为什么危险

非空断言（non-null assertion）是写在表达式后面的 `!`：

```ts
// Goal:
// Show the syntax of non-null assertion.

export {};

type ProductRecord = {
  title: string;
};

const productRecord: ProductRecord | null = {
  title: "Keyboard",
};

console.log(productRecord!.title);
```

它的意思是：

```txt
TypeScript:
  Please remove null and undefined from this expression's type.

JavaScript runtime:
  Do nothing special.
```

所以 `!` 不是运行时保护。它不会自动判断 `productRecord` 是否为 `null`，也不会在为空时给你默认值。

危险反例：

```ts
// Goal:
// Show why non-null assertion can hide a real runtime crash.

export {};

type ProductRecord = {
  title: string;
};

const productRecord: ProductRecord | null = null;

console.log(productRecord!.title);
```

这段代码的真实问题是：

```txt
TypeScript type system:
  productRecord! tells the checker to ignore null.

JavaScript runtime:
  productRecord is still null.
  Reading title from null throws a TypeError.
```

更好的写法是显式收窄：

```ts
// Goal:
// Narrow a nullable value before property access.

export {};

type ProductRecord = {
  title: string;
};

const productRecord: ProductRecord | null = null;

if (productRecord !== null) {
  console.log(productRecord.title);
} else {
  console.log("No product");
}
```

本章规则：

```txt
学习阶段：
  少用 !，优先写 if 判断。

真实项目：
  只有当你能证明某个框架或前置逻辑保证值一定存在时，才考虑使用 !。
```



---

## 21. 16：void

### 结论

`void` 通常表示函数没有有意义的返回值。它描述的是函数调用结果不应该被使用。

### 文件结构

```txt
16-void/
  voidReturn.ts
```

### `voidReturn.ts`

```ts
// Goal:
// Use void for functions that perform side effects.

// Expected result:
// The compiler accepts a function with no meaningful return value.

export {};

function logMessage(messageText: string): void {
  console.log(messageText);
}

const resultValue = logMessage("Saved");

console.log(resultValue);
```

### 预期输出

```txt
Saved
undefined
```

### 技术意义

`void` 主要用于函数返回值位置。它不是让运行时产生特殊值，而是告诉类型系统：调用这个函数的重点是副作用，不是返回数据。

### 常见错误

```txt
错误：把 void 当成 undefined 的完全替代品。
正确：变量类型一般少用 void；函数返回类型中更常见。
```

---

## 22. 17：never

### 结论

`never` 表示“不可能存在的值”。它常出现在永远抛错、永远不返回、或联合类型已经被穷尽后的位置。

### 文件结构

```txt
17-never/
  exhaustiveCheck.ts
```

### `exhaustiveCheck.ts`

```ts
// Goal:
// Use never to enforce exhaustive checks.

// Expected result:
// The compiler accepts this file only when every state is handled.

export {};

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function renderState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Idle";
    case "loading":
      return "Loading";
    case "success":
      return state.data.join(",");
    case "error":
      return state.message;
    default:
      return assertNever(state);
  }
}

console.log(renderState({ status: "idle" }));
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `RequestState` 有四种状态。 |
| 2 | `switch` 每处理一种，剩余可能性就减少一种。 |
| 3 | 全部处理完后，`default` 中的 `state` 应该是 `never`。 |
| 4 | 如果以后新增状态但忘记处理，`assertNever(state)` 会触发类型错误。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `never` 是空对象类型 | 它表示没有任何可能值。 |
| `never` 和 `void` 一样 | `void` 是没有有意义返回值；`never` 是根本不会正常产生值。 |
| 不做穷尽检查 | 新增联合成员时容易漏分支。 |

---

## 23. 18：枚举 enum

### 结论

`enum` 是 TypeScript 少数会生成运行时代码的类型特性。现代前端中，很多枚举场景可以用字符串字面量联合或 `as const` 对象替代。

### 文件结构

```txt
18-enums/
  enumRuntimeObject.ts
  constObjectAlternative.ts
```

### `enumRuntimeObject.ts`

```ts
// Goal:
// Verify that enum creates a runtime object.

// Expected result:
// Node prints enum values and the enum object.

export {};

enum OrderStatus {
  Pending = "pending",
  Paid = "paid",
  Shipped = "shipped",
}

function formatOrderStatus(status: OrderStatus): string {
  return status.toUpperCase();
}

console.log(formatOrderStatus(OrderStatus.Paid));
console.log(OrderStatus);
```

### 技术意义

`enum` 和 `type` 不一样。`type` 会被擦除，`enum` 默认会输出 JavaScript 对象。这个差异会影响打包体积、运行时代码和模块边界。



### 本节必须先补：`as const`、`typeof`、`keyof` 和索引访问类型

`constObjectAlternative.ts` 里这行代码信息量很大：

```ts
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

它不是普通 JavaScript 表达式，而是一段 TypeScript 类型计算。要从内到外读。

#### 第一步：`as const` 保留字面量类型

```ts
const ORDER_STATUS = {
  Pending: "pending",
  Paid: "paid",
  Shipped: "shipped",
} as const;
```

没有 `as const` 时，TypeScript 往往会把对象属性值拓宽成 `string`：

```txt
Pending:
  string
```

加上 `as const` 后，属性值会保留为具体字面量类型：

```txt
Pending:
  "pending"
```

同时对象属性会被视为 readonly。注意：这是类型系统里的只读，不等于运行时 `Object.freeze()`。


#### `as const` 也是一种断言，但它不是运行时冻结

`as const` 的完整名称是 const 断言（const assertion）。它和 `as ProductRecord` 一样，主要影响 TypeScript 的推断结果；它不会调用 `Object.freeze()`。

```ts
// Goal:
// Show that as const affects static types, not runtime freezing.

export {};

const orderStatusMap = {
  Pending: "pending",
  Paid: "paid",
} as const;

console.log(orderStatusMap.Pending);
```

TypeScript 看到的是：

```txt
readonly Pending: "pending"
readonly Paid: "paid"
```

JavaScript 运行时看到的是普通对象。区别在于 TypeScript 会在编译期阻止你写：

```ts
// Goal:
// Show that readonly from as const is a static restriction.

export {};

const orderStatusMap = {
  Pending: "pending",
  Paid: "paid",
} as const;

// @ts-expect-error: as const makes this property readonly in the type system.
orderStatusMap.Pending = "waiting";
```

这就是为什么 `as const` 适合配合 `typeof` 和 `keyof` 派生字面量联合：它让 TypeScript 保留 `"pending"` 这种精确值，而不是把它拓宽成普通 `string`。


#### 第二步：`typeof ORDER_STATUS` 从值提取类型

在类型位置里，`typeof ORDER_STATUS` 的意思不是运行时 `typeof` 字符串结果，而是：

```txt
取 ORDER_STATUS 这个运行时值对应的静态类型。
```

它大致得到：

```ts
type OrderStatusObject = {
  readonly Pending: "pending";
  readonly Paid: "paid";
  readonly Shipped: "shipped";
};
```

#### 第三步：`keyof typeof ORDER_STATUS` 取出 key union

```ts
type OrderStatusKey = keyof typeof ORDER_STATUS;
```

得到的是：

```txt
"Pending" | "Paid" | "Shipped"
```

#### 第四步：`T[K]` 取出 value union

```ts
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

意思是：

```txt
从 ORDER_STATUS 的类型里，
用所有 key 去索引，
拿到所有 value 的类型。
```

最终得到：

```txt
"pending" | "paid" | "shipped"
```

这就是 `as const object` 替代 `enum` 的核心机制：运行时保留一个普通对象，类型系统从这个对象里自动推导出可用的状态联合。


### `constObjectAlternative.ts`

```ts
// Goal:
// Use an as const object as an enum alternative.

// Expected result:
// The compiler derives a union type from object values.

export {};

const ORDER_STATUS = {
  Pending: "pending",
  Paid: "paid",
  Shipped: "shipped",
} as const;

type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

function formatOrderStatus(status: OrderStatus): string {
  return status.toUpperCase();
}

console.log(formatOrderStatus(ORDER_STATUS.Paid));

// @ts-expect-error: cancelled is not an OrderStatus.
console.log(formatOrderStatus("cancelled"));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为 enum 只是类型 | enum 会生成运行时代码。 |
| 所有有限状态都用 enum | 字符串字面量联合更轻。 |
| 混用 enum 值和普通字符串 | 是否允许取决于 enum 类型和写法，不要靠猜。 |

### 本章建议

```txt
学习阶段：必须理解 enum，因为项目和第三方类型中会遇到。
日常前端状态：优先 string literal union。
需要运行时常量对象：优先 as const object。
```


### enum 的官方文档补充模型

`enum` 和多数 TypeScript 类型不同。多数类型只存在于编译期，编译成 JavaScript 后会被擦除；普通 `enum` 会生成运行时代码。

因此学习 `enum` 时必须同时观察两个结果：

```txt
1. TypeScript 类型层面：某个值是否属于枚举成员。
2. JavaScript 运行时层面：编译后是否生成对象，以及这个对象长什么样。
```

日常前端项目里，有限状态更常用这两种写法：

```ts
type CheckoutStatus = "idle" | "submitting" | "success" | "failed";

const checkoutStatusLabelMap = {
  idle: "Idle",
  submitting: "Submitting",
  success: "Success",
  failed: "Failed",
} as const;
```

这不是说 `enum` 不能用，而是你必须先知道它不是“纯类型工具”。如果你的团队、代码库或运行时输出约束不需要 `enum`，优先使用字面量联合类型或 `as const` 对象。

---

## 24. 19：小项目整合

### 结论

第 3 章学完后，不要只停留在单个类型示例。你要做一个“类型安全的商品解析和结算状态模型”，把 `unknown`、对象类型、联合类型、数组、元组、`null`、`never` 串起来。

### 文件结构

```txt
19-mini-project/
  typedProductParser.ts
  checkoutStateModel.ts
```

### `typedProductParser.ts`

```ts
// Goal:
// Parse unknown product data into a safe product list.

// Expected result:
// The parser accepts valid records and rejects invalid records.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
  tags: string[];
};

type ParseSuccess = {
  status: "success";
  data: ProductRecord[];
};

type ParseFailure = {
  status: "failure";
  errors: string[];
};

type ParseResult = ParseSuccess | ParseFailure;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.priceCents === "number" &&
    isStringArray(candidate.tags)
  );
}

function parseProductList(value: unknown): ParseResult {
  if (!Array.isArray(value)) {
    return {
      status: "failure",
      errors: ["Input is not an array"],
    };
  }

  const productList: ProductRecord[] = [];
  const errorList: string[] = [];

  value.forEach((item, index) => {
    if (isProductRecord(item)) {
      productList.push(item);
    } else {
      errorList.push(`Invalid product at index ${index}`);
    }
  });

  if (errorList.length > 0) {
    return {
      status: "failure",
      errors: errorList,
    };
  }

  return {
    status: "success",
    data: productList,
  };
}

const rawValue: unknown = JSON.parse(
  '[{"id":"keyboard","title":"Keyboard","priceCents":9900,"tags":["input","hardware"]}]'
);

const parseResult = parseProductList(rawValue);

if (parseResult.status === "success") {
  console.log(parseResult.data[0]?.title ?? "Empty");
} else {
  console.log(parseResult.errors.join(","));
}
```

### `checkoutStateModel.ts`

```ts
// Goal:
// Model checkout UI state with discriminated unions and exhaustive checks.

// Expected result:
// The compiler enforces complete state handling.

export {};

type CartItem = {
  productId: string;
  quantity: number;
};

type CheckoutState =
  | { status: "empty" }
  | { status: "editing"; items: CartItem[] }
  | { status: "submitting"; items: CartItem[] }
  | { status: "submitted"; orderId: string }
  | { status: "failed"; message: string; items: CartItem[] };

function assertNever(value: never): never {
  throw new Error(`Unexpected state: ${JSON.stringify(value)}`);
}

function renderCheckoutState(state: CheckoutState): string {
  switch (state.status) {
    case "empty":
      return "Cart is empty";
    case "editing":
      return `Editing ${state.items.length} items`;
    case "submitting":
      return `Submitting ${state.items.length} items`;
    case "submitted":
      return `Order ${state.orderId} submitted`;
    case "failed":
      return `${state.message}: ${state.items.length} items kept`;
    default:
      return assertNever(state);
  }
}

console.log(
  renderCheckoutState({
    status: "editing",
    items: [{ productId: "keyboard", quantity: 1 }],
  })
);
```

### 整合要求

完成后你要能解释：

```txt
为什么外部数据先用 unknown。
为什么 isProductRecord 既是运行时检查，也是类型缩小工具。
为什么 ParseResult 不用 data? 和 errors? 堆在一个对象里。
为什么 CheckoutState 要用 status 做判别字段。
为什么 assertNever 能防止新增状态后漏写 UI 分支。
```

---

## 25. 最终文件清单

本章完成后，建议至少有这些文件：

```txt
typescript/chapter-03-types/
  README.md
  00-runtime-values-vs-static-types/valueTypeBoundary.ts
  00-runtime-values-vs-static-types/typeErasureDemo.ts
  00-runtime-values-vs-static-types/typeAliasSyntaxBoundary.ts
  01-type-annotations-inference-widening/annotationVsInference.ts
  01-type-annotations-inference-widening/literalWidening.ts
  02-any/anyEscapeHatch.ts
  02-any/anyRuntimeFailure.ts
  03-unknown/unknownBeforeNarrowing.ts
  03-unknown/unknownSafeParser.ts
  04-boolean/booleanLiteralState.ts
  05-number/numberPrecision.ts
  05-number/numericLiteralStatus.ts
  06-bigint/bigintCounter.ts
  07-string/stringLiteralUnion.ts
  08-symbol/symbolIdentity.ts
  08-symbol/uniqueSymbolKey.ts
  09-object-types/objectShape.ts
  09-object-types/optionalReadonlyProperties.ts
  09-object-types/excessPropertyCheck.ts
  09-object-types/objectTypeLiteralVsRuntimeObject.ts
  10-type-aliases/productTypeAlias.ts
  10-type-aliases/typeAliasNameVsObjectShape.ts
  11-union-types/unionNarrowing.ts
  11-union-types/discriminatedUnion.ts
  12-intersection-types/composedObjectType.ts
  13-arrays/typedArrayMethods.ts
  13-arrays/readonlyArray.ts
  14-tuples/tupleCoordinates.ts
  14-tuples/tupleReturnValue.ts
  15-null-undefined/nullableLookup.ts
  15-null-undefined/optionalPropertyVsUndefined.ts
  16-void/voidReturn.ts
  17-never/exhaustiveCheck.ts
  18-enums/enumRuntimeObject.ts
  18-enums/constObjectAlternative.ts
  19-mini-project/typedProductParser.ts
  19-mini-project/checkoutStateModel.ts
notes/typescript.md
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

项目关系：说明它在 React、接口数据、表单、状态管理中的用途。
```

最终笔记必须包含这些对比：

```txt
any vs unknown
string vs string literal union
object type vs runtime object
union vs intersection
array vs tuple
null vs undefined
void vs never
enum vs string literal union vs as const object
```

---

## 27. 本章最终要能回答的问题

学完第 3 章后，你必须能不用查资料回答这些问题：

1. TypeScript 类型在运行时还存在吗？
2. 为什么 `any` 危险？
3. 为什么 `unknown` 比 `any` 更适合外部数据？
4. 什么是类型缩小？
5. 为什么 `let status = "draft"` 通常不是 `'draft'` 类型？
6. 字符串字面量联合为什么适合前端状态？
7. 对象类型检查的是名字还是结构？
8. 为什么直接对象字面量会触发 excess property check？
9. `type A = B` 会不会生成 JavaScript？
10. `A | B` 和 `A & B` 的区别是什么？
11. `string[]` 和 `[string, number]` 的语义差异是什么？
12. `avatarUrl?: string` 和 `avatarUrl: string | undefined` 有什么区别？
13. `void` 和 `never` 为什么不是一回事？
14. `enum` 为什么说是会产生运行时代码的 TypeScript 特性？
15. 为什么真实项目里很多状态更适合用 discriminated union？


### 本章新增符号验收问题

学完本章以后，还要能回答这些问题：

16. `type ProductRecord = { id: string }` 里，`ProductRecord`、`id`、`string` 分别是什么语法角色？
17. 对象类型字面量 `{ id: string }` 和运行时对象 `{ id: "p1" }` 有什么区别？
18. `type ProductId = string` 和 `type ProductRecord = { id: string }` 的相同点和不同点是什么？
19. `id: ProductId` 里，`id` 和 `ProductId` 分别是什么？
20. `Record<string, unknown>` 里的 `<string, unknown>` 是什么？
21. `{ id: string }` 里的 `string` 和 `Record<string, unknown>` 里的第一个 `string` 为什么不是同一个角色？
22. `value is ProductRecord` 和 `: boolean` 的区别是什么？
23. `as ProductRecord` 为什么不等于运行时验证？
24. `as const` 改变的是运行时对象，还是 TypeScript 对对象的推断？
25. `typeof value === "object"` 和 `typeof ORDER_STATUS` 为什么不是同一层含义？
26. `(typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]` 为什么能得到 `"pending" | "paid" | "shipped"`？
27. 为什么 `@ts-expect-error` 不是普通注释？
28. `@ts-ignore` 和 `@ts-expect-error` 的区别是什么？
29. 为什么学习阶段更推荐 `@ts-expect-error`，而不是 `@ts-ignore`？
30. TypeScript 里的断言为什么不是运行时验证？
31. `as ProductRecord`、`as const`、`value!`、`asserts value is ProductRecord` 分别属于哪类断言？
32. 为什么 `as Record<string, unknown>` 可以作为中间步骤，但不能替代 `isProductRecord()` 的属性检查？
33. 非空断言 `!` 为什么可能把编译期错误变成运行时错误？
34. `Array<string>`、`Record<string, unknown>`、`Promise<number>` 的共同模式是什么？
35. 为什么 `Array<string>` 是类型表达式，而 `new Array()` 是运行时表达式？
36. `Box<T>` 里的 `T` 是关键字，还是类型参数名？
37. 为什么 `.tsx` 里不推荐使用 `<Type>value` 这种断言写法？
38. 看到 `<...>` 时，怎样根据上下文判断它是类型参数、比较运算、旧式断言还是 JSX？

---

## 28. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)  
   读 `string`、`number`、`boolean`、array、`any`、type annotations、object types、union types、type aliases、interfaces、literal types、`null`、`undefined`、`enum`、`bigint`、`symbol`。

2. [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)  
   读 optional properties、readonly properties、index signatures、excess property checks、intersection types、array、readonly array、tuple、readonly tuple。

3. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)  
   读 `typeof` type guards、truthiness narrowing、equality narrowing、`in` operator narrowing、discriminated unions、`never`、exhaustiveness checking。

4. [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)  
   只读本章相关部分：`void`、`object`、`unknown`、`never`、函数返回值语义。完整函数类型放到第 4 章再系统学。

5. [Enums](https://www.typescriptlang.org/docs/handbook/enums.html)  
   读 numeric enums、string enums、computed and constant members、union enums、enums at runtime、const enums。

6. [TSConfig strict](https://www.typescriptlang.org/tsconfig/strict.html)  
   理解 `strict` 是严格类型检查族的总开关。

7. [TSConfig noImplicitAny](https://www.typescriptlang.org/tsconfig/noImplicitAny.html)  
   理解为什么隐式 `any` 会漏掉错误，以及为什么本章练习要开启它。

8. [TSConfig strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html)  
   理解为什么 `Array.prototype.find()` 结果应该是 `T | undefined`，以及为什么读取前必须检查。

9. [TSConfig noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)  
   理解为什么 `array[index]` 不应该被无条件当作一定存在的元素。

10. [TSConfig exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)  
    理解可选属性与显式 `undefined` 的区别。

阅读时不要只看语法。每一页都追问：

```txt
这个类型描述什么运行时值？
这个检查发生在编译期还是运行时？
这个规则能防止什么真实 bug？
它在 React props、API response、form state 里怎么用？
它和 JavaScript 原本的运行时行为是否一致？
```

### 官方文档阅读时的重点标记

```txt
Everyday Types:
  any 会关闭后续类型检查。
  union 只能执行所有成员都支持的操作。
  literal types 需要和 union 组合才真正有用。
  enum 是 TypeScript 添加到 JavaScript 运行时的功能。

Object Types:
  optional property 读取时可能是 undefined。
  readonly 是类型层面的写入限制，不是运行时冻结。
  tuple 是“长度和位置已知的数组类型”。
  readonly tuple 是 as const 推导的关键结果。

Narrowing:
  typeof 是运行时操作符，也是 TypeScript 能理解的 type guard。
  discriminated union 是状态建模的核心。
  never 可以检查 switch 是否处理完所有分支。

TSConfig:
  strict 是学习 TypeScript 时应该打开的默认选项。
  noImplicitAny 防止类型系统悄悄放弃检查。
  strictNullChecks 防止不存在的值被当成一定存在。
```

---

## 29. 第 3 章最终记忆模型

### 一句话模型

TypeScript 第 3 章的核心不是“类型有哪些”，而是“如何用类型精确描述 JavaScript 值的可能性，并在代码运行前排除不合理操作”。

### 最终模型图

```txt
JavaScript runtime values
  string
  number
  bigint
  boolean
  symbol
  null
  undefined
  object
  array
  function

TypeScript static types
  primitive types
  literal types
  object types
  array types
  tuple types
  union types
  intersection types
  unknown
  any
  void
  never
  enum

Type checker job
  infer possible values
  compare assignability
  narrow unions through control flow
  reject unsafe operations
  erase types before runtime
```

### 最重要的实践原则

```txt
1. 外部数据先 unknown，不要直接 any。
2. 有限状态用字面量联合，不要随手 string。
3. 互斥状态用 discriminated union，不要堆 optional fields。
4. 固定位置数据用 tuple，普通列表用 array。
5. 函数边界显式标注，局部变量优先推导。
6. 错误分支用 never 做穷尽检查。
7. enum 要理解，但日常状态优先考虑 union 或 as const object。
8. 类型不会自动验证运行时数据，需要 runtime guard。
```

### 和当前学习阶段的关系

你现在从 JavaScript 进入 TypeScript，最重要的切换不是语法，而是思维方式：

```txt
JavaScript 学习重点：值在运行时如何被创建、保存、传递、比较和修改。
TypeScript 学习重点：值在运行前允许处于哪些形状和状态。
```

后续学 React 时，你会把本章内容直接用在：

```txt
props 类型
component state 类型
form value 类型
API response 类型
route params 类型
loading / success / error 状态
custom hook 返回值类型
```

本章学不扎实，React + TypeScript 会变成“到处补冒号”和“到处 `as`”。本章学扎实，后面的类型会自然变成建模工具。

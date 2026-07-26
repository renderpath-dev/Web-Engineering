# TypeScript 必补章节 03：“实用类型 Utility Types”学习指导文件 v1

> 定位：这是对《TypeScript Programming》附录 B“实用类型”和前面第 6、7、8、9 章中零散工具类型的集中训练文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察工具类型的输入和输出，再把每节整理成最终学习笔记。  
> 参考范围：TypeScript 官方 Utility Types 文档，以及 Handbook 中对象类型、函数类型、条件类型、映射类型、模板字面量类型相关内容。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：每个 utility type 都要联系真实项目场景。不要把它们背成“类型函数名字表”。

> 本版按“同样标准”补齐：本文件不再只列 utility type 名字，而是在第一次出现前先拆清楚：名字角色、类型参数个数、输入类型、输出类型、运行时是否存在、是否改变真实对象。尤其补齐 `Record`、`Pick`、`Omit`、`Exclude`、`Parameters`、`ReturnType`、`typeof`、`keyof`、`T[K]`、`<...>`、`|`、`as const`、`NoInfer`、显式 `this` 参数这些容易被误读的前置概念。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| `Awaited`、`Partial`、`Required`、`Readonly`、`Record`、`Pick`、`Omit` | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| `Exclude`、`Extract`、`NonNullable` | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| `Parameters`、`ConstructorParameters`、`ReturnType`、`InstanceType` | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| `NoInfer`、`ThisParameterType`、`OmitThisParameter`、`ThisType` | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| `Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize` | [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
   - [本章第一次出现的基础语法角色](#本章第一次出现的基础语法角色)
   - [Utility Type 固定读法](#utility-type-固定读法)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [完整学习顺序](#3-完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：实用类型到底在解决什么](#5-00实用类型到底在解决什么)
6. [01：对象形状转换：`Partial`、`Required`、`Readonly`](#6-01对象形状转换partialrequiredreadonly)
7. [02：对象 key 选择：`Pick`、`Omit`](#7-02对象-key-选择pickomit)
8. [03：对象字典：`Record`](#8-03对象字典record)
9. [04：union 过滤：`Exclude`、`Extract`、`NonNullable`](#9-04union-过滤excludeextractnonnullable)
10. [05：函数类型提取：`Parameters`、`ReturnType`](#10-05函数类型提取parametersreturntype)
11. [06：构造函数类型提取：`ConstructorParameters`、`InstanceType`](#11-06构造函数类型提取constructorparametersinstancetype)
12. [07：异步类型提取：`Awaited`](#12-07异步类型提取awaited)
13. [08：控制泛型推导：`NoInfer`](#13-08控制泛型推导noinfer)
14. [09：`this` 相关工具类型](#14-09this-相关工具类型)
15. [10：字符串工具类型](#15-10字符串工具类型)
16. [11：小项目整合](#16-11小项目整合)
17. [最终文件清单](#17-最终文件清单)
18. [最终学习笔记转换要求](#18-最终学习笔记转换要求)
19. [本章最终要能回答的问题](#19-本章最终要能回答的问题)
20. [最终记忆模型](#20-最终记忆模型)

---

## 1. 本文件怎么用

### 结论

Utility Types 是 TypeScript 标准库里预先写好的类型转换工具。你要学的是“什么时候用哪一个”，不是只记名字。

### 每节固定学习步骤

```txt
1. Identify the source type.
2. Identify the utility type.
3. Predict the output type before reading the code.
4. Write the example file.
5. Add one invalid assignment with @ts-expect-error.
6. Run npx tsc --noEmit.
7. Explain the business scenario.
8. Convert the section into final notes.
```


### 本章第一次出现的基础语法角色

结论：Utility Types 不是运行时 API。它们都是 TypeScript 类型系统里的“类型转换表达式”。学习本章时，先判断每个名字和符号属于哪一层，否则会把 `Record`、`typeof`、`keyof`、`T[K]`、`<...>` 全部混成运行时代码。

| 片段 | 名称 | 所属层级 | 能不能改名 | 运行时是否存在 | 当前读法 |
|---|---|---|---|---|---|
| `ProductRecord` | 类型别名名 | TypeScript type system | 可以 | 否 | 给一个类型表达式起名字。 |
| `T` / `K` / `Keys` / `Type` | 类型参数名 | TypeScript type system | 声明自己的泛型时可以；使用内置工具时不能改内置工具名 | 否 | 类型层面的参数，不是运行时变量。 |
| `<...>` | 类型参数列表 / 类型实参列表 | TypeScript type system | 不是名字 | 否 | 把类型传给泛型类型工具。 |
| `Record<K, V>` | 内置 utility type | TypeScript type system | `Record` 不能随便改 | 否 | 用 key type 和 value type 生成对象类型。 |
| `typeof value` | 表达式里的 `typeof` | JavaScript runtime | 不能改 | 是 | 返回运行时类型字符串。 |
| `typeof functionName` | 类型位置里的 `typeof` | TypeScript type system | 不能改 | 否 | 从运行时值提取静态类型。 |
| `keyof T` | key union 操作符 | TypeScript type system | 不能改 | 否 | 取出对象类型的所有 key。 |
| `T[K]` | indexed access type | TypeScript type system | `T` / `K` 是类型参数名 | 否 | 从对象类型中取属性值类型。 |
| `|` | union type operator | TypeScript type system | 不能改 | 否 | 表示类型可能性之一。 |
| `as const` | const assertion | TypeScript type system | 不能改 | 否 | 保留字面量类型并推断 readonly。 |
| `this: Type` | 显式 `this` 参数 | TypeScript function type syntax | `this` 不能改 | 否 | 给函数调用时的 `this` 规定类型。 |

注意：这里最容易误解的是 `typeof`。同一个词，在不同位置含义不同：

```ts
// Goal:
// Compare runtime typeof and type-position typeof.

export {};

function createProduct(title: string, priceCents: number) {
  return {
    title,
    priceCents,
  };
}

const runtimeTypeName = typeof createProduct;
type FunctionType = typeof createProduct;

const productFactory: FunctionType = createProduct;

console.log(runtimeTypeName);
console.log(productFactory("Keyboard", 9900).title);
```

这段代码里：

```txt
typeof createProduct in an expression:
  JavaScript runtime operator.
  It produces the string "function".

typeof createProduct in a type position:
  TypeScript type operator.
  It extracts the function type of createProduct.
```

### Utility Type 固定读法

看到任意 utility type，都按这个顺序读：

```txt
1. 先读工具名。
2. 再数它接收几个类型参数。
3. 再判断每个类型参数的角色。
4. 再判断输出类型是什么。
5. 最后确认它是否改变运行时对象。
```

例如：

```ts
type ProductPatch = Partial<ProductRecord>;
```

读法是：

```txt
Partial:
  utility type name

<ProductRecord>:
  one type argument

ProductRecord:
  source object type

ProductPatch:
  output type
  same keys as ProductRecord, but every property becomes optional

Runtime:
  no JavaScript object is changed
```

再看：

```ts
type RouteTable = Record<RouteName, RouteConfig>;
```

读法是：

```txt
Record:
  utility type name

<RouteName, RouteConfig>:
  two type arguments

RouteName:
  key type

RouteConfig:
  value type

RouteTable:
  output object type

Runtime:
  no route object is created by Record itself
```

本章所有 utility type 都遵守这个核心模型：

```txt
Input type
  -> utility type transformation
  -> output type
  -> type erased before runtime
```


---

## 2. 项目重新整理建议

```txt
typescript/
  appendix-utility-types/
    README.md
    00-problem-model/
      utilityTypeMentalModel.ts
      utilityTypeSyntaxRoles.ts
      typeLevelOnlyBoundary.ts
    01-object-shape-transform/
      partialPatch.ts
      requiredConfig.ts
      readonlySnapshot.ts
    02-pick-omit/
      publicProductDto.ts
      createProductBody.ts
    03-record/
      routeTable.ts
      eventHandlerMap.ts
      recordKeyValueBoundary.ts
      recordLiteralKeyUnion.ts
    04-union-filter/
      excludeStates.ts
      extractErrors.ts
      nonNullableLookup.ts
      distributiveUnionFilter.ts
    05-function-extraction/
      parametersFromHandler.ts
      returnTypeFromLoader.ts
      typeofFunctionBoundary.ts
    06-constructor-extraction/
      constructorParameters.ts
      instanceType.ts
      classValueVsInstanceBoundary.ts
    07-awaited/
      awaitedReturnType.ts
      apiDataType.ts
    08-noinfer/
      defaultValueBoundary.ts
    09-this-utilities/
      thisParameterType.ts
      omitThisParameter.ts
      thisTypeObjectLiteral.ts
    10-string-utilities/
      capitalizeKeys.ts
      upperCaseEventNames.ts
    11-mini-project/
      domain.ts
      dto.ts
      api.ts
      routes.ts
      app.ts
```

---

## 3. 完整学习顺序

```txt
utility type problem model
  -> Partial / Required / Readonly
  -> Pick / Omit
  -> Record
  -> Exclude / Extract / NonNullable
  -> Parameters / ReturnType
  -> ConstructorParameters / InstanceType
  -> Awaited
  -> NoInfer
  -> ThisParameterType / OmitThisParameter / ThisType
  -> string manipulation utilities
  -> mini project
```

---

## 4. 本章先要建立的底层模型

### 结论

Utility Types 可以分成六类：

```txt
object transformation:
  Partial, Required, Readonly

object selection:
  Pick, Omit

union filtering:
  Exclude, Extract, NonNullable

function extraction:
  Parameters, ReturnType

class extraction:
  ConstructorParameters, InstanceType

special helpers:
  Awaited, NoInfer, ThisParameterType, OmitThisParameter, ThisType, string manipulation types
```


### 本章的共同底层机制

结论：Utility Types 的共同机制不是“调用函数”，而是“在类型系统里用一个已有类型派生出另一个类型”。

```txt
source type:
  原始类型

utility type:
  类型转换工具

output type:
  派生后的类型

runtime:
  没有自动转换、没有自动校验、没有自动填值
```

对比三个层级：

| 写法 | 属于哪一层 | 做了什么 |
|---|---|---|
| `type ProductPatch = Partial<ProductRecord>` | TypeScript type system | 创建一个新类型。 |
| `const patch = { title: "Mouse" }` | JavaScript runtime | 创建一个真实对象。 |
| `updateProduct(product, patch)` | JavaScript runtime + TypeScript checking | 运行时调用函数；编译期检查参数类型。 |

所以本章固定问四个问题：

```txt
1. 这个 utility type 接收几个类型参数？
2. 每个类型参数是什么角色？
3. 输出的新类型长什么样？
4. 它有没有改变运行时对象？
```

### 本章工具类型参数总表

| 工具类型 | 类型参数个数 | 第一个参数 | 第二个参数 | 输出类型 |
|---|---:|---|---|---|
| `Partial<T>` | 1 | object type | 无 | 所有属性变 optional 的对象类型 |
| `Required<T>` | 1 | object type | 无 | 所有属性变 required 的对象类型 |
| `Readonly<T>` | 1 | object type | 无 | 所有属性变 readonly 的对象类型 |
| `Pick<T, K>` | 2 | source object type | selected key union | 只保留指定 key 的对象类型 |
| `Omit<T, K>` | 2 | source object type | removed key union | 删除指定 key 的对象类型 |
| `Record<K, V>` | 2 | key type | value type | key 到 value 的对象类型 |
| `Exclude<U, E>` | 2 | source union | removed members | 删除成员后的 union |
| `Extract<U, E>` | 2 | source union | kept members | 保留成员后的 union |
| `NonNullable<T>` | 1 | any type | 无 | 删除 `null | undefined` 后的类型 |
| `Parameters<F>` | 1 | function type | 无 | 参数 tuple |
| `ReturnType<F>` | 1 | function type | 无 | 返回值类型 |
| `ConstructorParameters<C>` | 1 | constructor type | 无 | constructor 参数 tuple |
| `InstanceType<C>` | 1 | constructor type | 无 | class instance type |
| `Awaited<T>` | 1 | promise-like or value type | 无 | await 后的最终值类型 |
| `NoInfer<T>` | 1 | target type | 无 | 阻止该位置参与泛型推导 |
| `ThisParameterType<F>` | 1 | function type | 无 | 显式 `this` 参数类型 |
| `OmitThisParameter<F>` | 1 | function type | 无 | 删除 `this` 参数后的函数类型 |
| `ThisType<T>` | 1 | contextual this type | 无 | 对象字面量方法中的 `this` 类型上下文 |


---

## 5. 00：实用类型到底在解决什么

### `utilityTypeMentalModel.ts`

```ts
// Goal:
// Classify utility types by transformation category.

// Expected result:
// The file compiles and prints the category names.

export {};

type UtilityCategory =
  | "object-transformation"
  | "object-selection"
  | "union-filtering"
  | "function-extraction"
  | "class-extraction"
  | "special-helper";

const categories: UtilityCategory[] = [
  "object-transformation",
  "object-selection",
  "union-filtering",
  "function-extraction",
  "class-extraction",
  "special-helper",
];

console.log(categories.join(","));
```


### `utilityTypeSyntaxRoles.ts`

```ts
// Goal:
// Split utility type syntax into names, type arguments, and output types.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type ProductPatch = Partial<ProductRecord>;
type PublicProduct = Pick<ProductRecord, "id" | "title">;
type ProductMap = Record<string, ProductRecord>;

const patch: ProductPatch = {
  title: "Mouse",
};

const publicProduct: PublicProduct = {
  id: "p1",
  title: "Keyboard",
};

const productMap: ProductMap = {
  p1: {
    id: "p1",
    title: "Keyboard",
    priceCents: 9900,
  },
};

console.log(patch.title);
console.log(publicProduct.id);
console.log(productMap.p1?.title);
```

### `utilityTypeSyntaxRoles.ts` 执行过程

| 代码片段 | 角色 | 解释 |
|---|---|---|
| `Partial` | utility type name | 内置类型转换工具。 |
| `<ProductRecord>` | type argument list | 把 `ProductRecord` 作为输入类型传给 `Partial`。 |
| `Pick` | utility type name | 从对象类型里选择 key。 |
| `<ProductRecord, "id" | "title">` | two type arguments | 第一个是源对象类型，第二个是 key union。 |
| `Record` | utility type name | 生成对象字典类型。 |
| `<string, ProductRecord>` | two type arguments | 第一个是 key type，第二个是 value type。 |

### `typeLevelOnlyBoundary.ts`

```ts
// Goal:
// Show that utility types do not create runtime values.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ProductPatch = Partial<ProductRecord>;

const patch: ProductPatch = {
  title: "Keyboard",
};

console.log(patch.title);
```

### `typeLevelOnlyBoundary.ts` 执行过程

| 片段 | 编译期 | 运行时 |
|---|---|---|
| `type ProductPatch = Partial<ProductRecord>` | 创建派生类型 | 编译后删除 |
| `const patch: ProductPatch = ...` | 检查对象是否满足类型 | 创建普通对象 |
| `patch.title` | 读取结果可能是 `string | undefined` | 真实读取对象属性 |

---

## 6. 01：对象形状转换：`Partial`、`Required`、`Readonly`

### 结论

这三个工具类型操作对象属性修饰符：可选、必需、只读。


### 本节必须先建立：`Partial<T>`、`Required<T>`、`Readonly<T>` 的共同模型

这三个工具都只接收一个类型参数：

```ts
type Output = Partial<Source>;
type Output2 = Required<Source>;
type Output3 = Readonly<Source>;
```

读法：

```txt
Source:
  source object type

Partial<Source>:
  same keys, optional properties

Required<Source>:
  same keys, required properties

Readonly<Source>:
  same keys, readonly properties
```

它们只改变静态类型，不会改变运行时对象：

```txt
Partial<T>:
  does not delete required fields at runtime

Required<T>:
  does not fill missing values at runtime

Readonly<T>:
  does not freeze the object at runtime
```

看 `Partial<Omit<ProductRecord, "id">>` 时，从内到外读：

```txt
Omit<ProductRecord, "id">
  remove id from ProductRecord

Partial<...>
  make the remaining properties optional
```

### `partialPatch.ts`

```ts
// Goal:
// Use Partial for patch updates.

// Expected result:
// Only changed fields are required.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

function updateProduct(
  product: ProductRecord,
  patch: Partial<Omit<ProductRecord, "id">>,
): ProductRecord {
  return {
    ...product,
    ...patch,
  };
}

const product = updateProduct(
  { id: "p1", title: "Keyboard", priceCents: 9900 },
  { priceCents: 8900 },
);

console.log(product.priceCents);
```

### `requiredConfig.ts`

```ts
// Goal:
// Use Required after defaults have been applied.

// Expected result:
// The normalized config has every property.

export {};

type RawConfig = {
  endpoint?: string;
  retryCount?: number;
};

type NormalizedConfig = Required<RawConfig>;

function normalizeConfig(config: RawConfig): NormalizedConfig {
  return {
    endpoint: config.endpoint ?? "/api",
    retryCount: config.retryCount ?? 3,
  };
}

console.log(normalizeConfig({}).retryCount);
```

### `readonlySnapshot.ts`

```ts
// Goal:
// Use Readonly for immutable snapshots.

// Expected result:
// Reassignment is rejected.

export {};

type ProductSnapshot = Readonly<{
  id: string;
  title: string;
}>;

const snapshot: ProductSnapshot = {
  id: "p1",
  title: "Keyboard",
};

// @ts-expect-error: title is readonly.
snapshot.title = "Mouse";

console.log(snapshot.title);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `Partial<T>` 适合所有输入 | 它适合 patch，不适合创建必需业务对象。 |
| `Required<T>` 会自动填默认值 | 它只改变类型，需要你写运行时代码填值。 |
| `Readonly<T>` 会冻结对象 | 它只阻止 TypeScript 层面的重新赋值。 |

---

## 7. 02：对象 key 选择：`Pick`、`Omit`

### 结论

`Pick<T, K>` 选择字段；`Omit<T, K>` 删除字段。它们适合 DTO、表单、列表摘要和公开 API。


### 本节必须先建立：`Pick<T, K>` 和 `Omit<T, K>` 的参数角色

`Pick` 和 `Omit` 都接收两个类型参数：

```ts
type Selected = Pick<SourceObject, KeyUnion>;
type Removed = Omit<SourceObject, KeyUnion>;
```

参数角色：

```txt
SourceObject:
  source object type

KeyUnion:
  keys from SourceObject

Pick<SourceObject, KeyUnion>:
  keep only those keys

Omit<SourceObject, KeyUnion>:
  remove those keys
```

所以：

```ts
type PublicProduct = Pick<ProductRecord, "id" | "title">;
```

不是运行时挑字段，而是创建一个新对象类型：

```txt
ProductRecord:
  source type

"id" | "title":
  key union

PublicProduct:
  object type with only id and title
```

### `publicProductDto.ts`

```ts
// Goal:
// Expose only public fields with Pick.

// Expected result:
// Internal fields are not part of the DTO.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
  internalCostCents: number;
};

type ProductListItem = Pick<ProductRecord, "id" | "title" | "priceCents">;

const item: ProductListItem = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(item.title);
```

### `createProductBody.ts`

```ts
// Goal:
// Remove server-generated fields with Omit.

// Expected result:
// Create body does not include id.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type CreateProductBody = Omit<ProductRecord, "id">;

const body: CreateProductBody = {
  title: "Keyboard",
  priceCents: 9900,
};

// @ts-expect-error: id is generated by the server.
body.id = "p1";

console.log(body.title);
```

---

## 8. 03：对象字典：`Record`

### 结论

`Record<Keys, Value>` 创建一个 key 集合到 value 类型的映射。它适合路由表、权限表、事件处理表。


### 本节必须先建立：`Record<Keys, Value>` 的完整读法

`Record` 固定接收两个类型参数：

```ts
Record<Keys, Value>
```

参数角色：

```txt
Keys:
  property key type

Value:
  property value type

Record<Keys, Value>:
  object type whose keys come from Keys and whose values are Value
```

所以：

```ts
type RouteTable = Record<RouteName, RouteConfig>;
```

读法是：

```txt
RouteName:
  key type

RouteConfig:
  value type

Record<RouteName, RouteConfig>:
  object type whose every RouteName key has a RouteConfig value
```

`Record` 本质上仍然是在描述对象类型。它和手写对象类型的区别是：手写对象类型逐个写属性，`Record` 用一个 key union 批量生成属性规则。

对比：

| 写法 | key 从哪里来 | value 类型是什么 | 结果 |
|---|---|---|---|
| `{ home: RouteConfig; cart: RouteConfig }` | 手写属性名 | `RouteConfig` | 固定两个属性 |
| `Record<"home" | "cart", RouteConfig>` | key union | `RouteConfig` | 固定两个属性 |
| `Record<string, RouteConfig>` | 任意 string key | `RouteConfig` | 字典对象类型 |

注意：`Record<"home" | "cart", RouteConfig>` 要求两个 key 都存在；`Record<string, RouteConfig>` 不表示“无限属性都必须提前存在”，而是表示出现的 string key 对应的值应满足 `RouteConfig`。

### `recordKeyValueBoundary.ts`

```ts
// Goal:
// Show that Record has a key type and a value type.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ProductDictionary = Record<string, ProductRecord>;

const products: ProductDictionary = {
  keyboard: {
    id: "p1",
    title: "Keyboard",
  },
  mouse: {
    id: "p2",
    title: "Mouse",
  },
};

console.log(products.keyboard?.title);
```

### `recordLiteralKeyUnion.ts`

```ts
// Goal:
// Show that a literal key union creates required object keys.

export {};

type RouteName = "home" | "cart";

type RouteConfig = {
  path: string;
  requiresAuth: boolean;
};

const routes: Record<RouteName, RouteConfig> = {
  home: {
    path: "/",
    requiresAuth: false,
  },
  cart: {
    path: "/cart",
    requiresAuth: true,
  },
};

// @ts-expect-error: product is not part of RouteName.
routes.product = {
  path: "/products/:id",
  requiresAuth: false,
};

console.log(routes.home.path);
```

### `Record` 的常见误读

| 错误理解 | 正确模型 |
|---|---|
| `Record` 会创建运行时对象 | `Record` 只创建类型，运行时没有 `Record`。 |
| `Record<string, unknown>` 证明属性安全 | 它只说明 value 是 `unknown`，使用前仍要检查。 |
| `Record<"id", string>` 和 `Record<string, string>` 一样 | 前者是固定 key，后者是 string 字典。 |

### `routeTable.ts`

```ts
// Goal:
// Define a complete route table with Record.

// Expected result:
// Every route has a config.

export {};

type RouteName = "home" | "product" | "cart";

type RouteConfig = {
  path: string;
  requiresAuth: boolean;
};

const routes: Record<RouteName, RouteConfig> = {
  home: { path: "/", requiresAuth: false },
  product: { path: "/products/:id", requiresAuth: false },
  cart: { path: "/cart", requiresAuth: true },
};

console.log(routes.cart.path);
```

### `eventHandlerMap.ts`

```ts
// Goal:
// Map event names to handlers.

export {};

type EventName = "created" | "deleted";

type Handler = (id: string) => void;

const handlers: Record<EventName, Handler> = {
  created: (id) => console.log(`created:${id}`),
  deleted: (id) => console.log(`deleted:${id}`),
};

handlers.created("p1");
```

---

## 9. 04：union 过滤：`Exclude`、`Extract`、`NonNullable`

### 结论

这些工具类型操作 union：删除成员、保留成员、删除 `null | undefined`。


### 本节必须先建立：union filter 不是数组过滤

`Exclude`、`Extract`、`NonNullable` 操作的是 union type，不是运行时数组。

```ts
type Status = "idle" | "loading" | "success" | "error";
type Finished = Exclude<Status, "idle" | "loading">;
```

读法：

```txt
Status:
  source union

"idle" | "loading":
  members to remove

Finished:
  "success" | "error"
```

它没有遍历运行时数组，也不会删除任何运行时值。它只在类型系统里删除 union 成员。

### `distributiveUnionFilter.ts`

```ts
// Goal:
// Show that Exclude and Extract filter union members.

export {};

type RequestStatus = "idle" | "loading" | "success" | "error";

type BlockingStatus = Extract<RequestStatus, "loading" | "error">;
type NonBlockingStatus = Exclude<RequestStatus, BlockingStatus>;

const blockingStatus: BlockingStatus = "error";
const nonBlockingStatus: NonBlockingStatus = "success";

// @ts-expect-error: loading is not a non-blocking status.
const brokenStatus: NonBlockingStatus = "loading";

console.log(blockingStatus, nonBlockingStatus, brokenStatus);
```

### `excludeStates.ts`

```ts
// Goal:
// Remove one union member.

export {};

type RequestStatus = "idle" | "loading" | "success" | "error";

type FinishedStatus = Exclude<RequestStatus, "idle" | "loading">;

const status: FinishedStatus = "success";

// @ts-expect-error: loading was excluded.
const brokenStatus: FinishedStatus = "loading";

console.log(status, brokenStatus);
```

### `extractErrors.ts`

```ts
// Goal:
// Extract only error-like union members.

export {};

type ApiResult =
  | { ok: true; value: string }
  | { ok: false; error: "network" }
  | { ok: false; error: "invalid" };

type ApiError = Extract<ApiResult, { ok: false }>;

const error: ApiError = {
  ok: false,
  error: "network",
};

console.log(error.error);
```

### `nonNullableLookup.ts`

```ts
// Goal:
// Remove null and undefined from a lookup result type.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type LookupResult = ProductRecord | null | undefined;

type FoundProduct = NonNullable<LookupResult>;

const product: FoundProduct = {
  id: "p1",
  title: "Keyboard",
};

console.log(product.title);
```

---

## 10. 05：函数类型提取：`Parameters`、`ReturnType`

### 结论

这两个工具类型从已有函数中提取参数 tuple 和返回值类型，让 wrapper、mock、handler 类型跟源函数保持同步。


### 本节必须先建立：为什么这里要写 `typeof functionName`

`Parameters` 和 `ReturnType` 接收的是函数类型，不是函数调用结果。

```ts
type Args = Parameters<typeof createProduct>;
type Result = ReturnType<typeof createProduct>;
```

这里的 `typeof createProduct` 是类型位置里的 `typeof`：

```txt
createProduct:
  runtime function value

typeof createProduct:
  static function type extracted from that value

Parameters<typeof createProduct>:
  tuple of parameter types

ReturnType<typeof createProduct>:
  return value type
```

### `typeofFunctionBoundary.ts`

```ts
// Goal:
// Use typeof in type position to extract a function type.

export {};

function createProduct(title: string, priceCents: number) {
  return {
    title,
    priceCents,
  };
}

type CreateProductFunction = typeof createProduct;
type CreateProductArgs = Parameters<CreateProductFunction>;
type CreateProductResult = ReturnType<CreateProductFunction>;

const args: CreateProductArgs = ["Keyboard", 9900];
const result: CreateProductResult = createProduct(...args);

console.log(result.title);
```

### `parametersFromHandler.ts`

```ts
// Goal:
// Reuse a handler's parameter types.

export {};

function createProduct(title: string, priceCents: number): string {
  return `${title}:${priceCents}`;
}

type CreateProductArgs = Parameters<typeof createProduct>;

const args: CreateProductArgs = ["Keyboard", 9900];

console.log(createProduct(...args));
```

### `returnTypeFromLoader.ts`

```ts
// Goal:
// Extract a function return type.

export {};

function loadProduct() {
  return {
    id: "p1",
    title: "Keyboard",
  };
}

type ProductRecord = ReturnType<typeof loadProduct>;

const product: ProductRecord = {
  id: "p2",
  title: "Mouse",
};

console.log(product.title);
```

---

## 11. 06：构造函数类型提取：`ConstructorParameters`、`InstanceType`

### 结论

这两个工具类型从 class 或构造签名中提取构造参数和实例类型。


### 本节必须先建立：class 有 value side 和 instance side

在 TypeScript 里，class 名字会同时参与两个层级：

```txt
ProductModel:
  instance type in type position

typeof ProductModel:
  constructor function type in type position
```

`ConstructorParameters` 和 `InstanceType` 都需要 constructor type，所以通常写：

```ts
ConstructorParameters<typeof ProductModel>
InstanceType<typeof ProductModel>
```

### `classValueVsInstanceBoundary.ts`

```ts
// Goal:
// Compare a class instance type with a constructor type.

export {};

class ProductModel {
  constructor(
    public readonly id: string,
    public readonly title: string,
  ) {}
}

type ProductInstance = ProductModel;
type ProductConstructor = typeof ProductModel;

const instance: ProductInstance = new ProductModel("p1", "Keyboard");
const ConstructorValue: ProductConstructor = ProductModel;

console.log(instance.title);
console.log(new ConstructorValue("p2", "Mouse").title);
```

### `constructorParameters.ts`

```ts
// Goal:
// Extract constructor parameter types.

export {};

class ProductModel {
  constructor(
    public readonly id: string,
    public readonly title: string,
  ) {}
}

type ProductModelArgs = ConstructorParameters<typeof ProductModel>;

const args: ProductModelArgs = ["p1", "Keyboard"];
const model = new ProductModel(...args);

console.log(model.title);
```

### `instanceType.ts`

```ts
// Goal:
// Extract the instance type from a class constructor.

export {};

class ProductRepository {
  findTitle(id: string): string {
    return `product:${id}`;
  }
}

type RepositoryInstance = InstanceType<typeof ProductRepository>;

const repository: RepositoryInstance = new ProductRepository();

console.log(repository.findTitle("p1"));
```

---

## 12. 07：异步类型提取：`Awaited`

### 结论

`Awaited<T>` 模拟 `await` 和 `.then()` 对 Promise 的递归解包。


### 本节必须先建立：async 函数的 `ReturnType` 不等于最终 data

`async function` 的返回类型总是 Promise 包装后的类型。也就是说：

```txt
ReturnType<typeof asyncFn>:
  Promise<final value>

Awaited<ReturnType<typeof asyncFn>>:
  final value
```

所以：

```ts
type ProductData = Awaited<ReturnType<typeof loadProduct>>;
```

要从内到外读：

```txt
typeof loadProduct:
  function type

ReturnType<typeof loadProduct>:
  Promise<...>

Awaited<...>:
  data after await
```

### `awaitedReturnType.ts`

```ts
// Goal:
// Extract the final value from an async function.

export {};

async function loadProduct() {
  return {
    id: "p1",
    title: "Keyboard",
  };
}

type ProductData = Awaited<ReturnType<typeof loadProduct>>;

const product: ProductData = {
  id: "p2",
  title: "Mouse",
};

console.log(product.title);
```

### `apiDataType.ts`

```ts
// Goal:
// Unwrap nested Promise-like data.

export {};

type NestedAsyncValue = Promise<Promise<{ count: number }>>;

type Data = Awaited<NestedAsyncValue>;

const data: Data = {
  count: 42,
};

console.log(data.count.toFixed(0));
```

---

## 13. 08：控制泛型推导：`NoInfer`

### 结论

`NoInfer<T>` 阻止某个位置参与类型推导，但保留它必须符合已经推导出的类型。


### 本节必须先建立：`NoInfer<T>` 不改变类型，只改变推导来源

普通泛型推导会从多个参数位置一起收集候选类型。`NoInfer<T>` 的作用是告诉 TypeScript：这个位置仍然必须符合 `T`，但不要从这个位置反向扩大 `T`。

在本节代码里：

```ts
function createSelector<Option extends string>(
  options: readonly Option[],
  defaultValue?: NoInfer<Option>,
): Option
```

读法：

```txt
Option:
  inferred from options

defaultValue:
  must be one of Option

NoInfer<Option>:
  do not let defaultValue add new candidates to Option
```

所以 `"yellow"` 不能把 `Option` 扩大成 `"red" | "green" | "blue" | "yellow"`。

### `defaultValueBoundary.ts`

```ts
// Goal:
// Prevent defaultValue from expanding the inferred union.

export {};

function createSelector<Option extends string>(
  options: readonly Option[],
  defaultValue?: NoInfer<Option>,
): Option {
  return defaultValue ?? options[0]!;
}

const selected = createSelector(["red", "green", "blue"] as const, "red");

// @ts-expect-error: yellow is not part of the options.
createSelector(["red", "green", "blue"] as const, "yellow");

console.log(selected);
```

---

## 14. 09：`this` 相关工具类型

### 结论

这些工具类型处理显式 `this` 参数、绑定函数和对象字面量里的上下文 `this`。


### 本节必须先建立：显式 `this` 参数不是普通运行时参数

```ts
function formatWithPrefix(this: { prefix: string }, value: string): string
```

这里的 `this: { prefix: string }` 是 TypeScript 专门给函数 `this` 建模的语法。它不会作为第一个普通参数传入。真正调用时要通过 `.call()`、`.apply()`、`.bind()` 或对象方法调用来提供 `this`。

读法：

```txt
this:
  special this parameter

{ prefix: string }:
  required shape of this

value:
  normal function parameter

ThisParameterType<typeof formatWithPrefix>:
  extract the type of this

OmitThisParameter<typeof formatWithPrefix>:
  remove the this parameter from the function type
```

### `thisParameterType.ts`

```ts
// Goal:
// Extract a function's explicit this parameter.

export {};

function formatWithPrefix(this: { prefix: string }, value: string): string {
  return `${this.prefix}:${value}`;
}

type FormatterThis = ThisParameterType<typeof formatWithPrefix>;

const context: FormatterThis = {
  prefix: "product",
};

console.log(formatWithPrefix.call(context, "p1"));
```

### `omitThisParameter.ts`

```ts
// Goal:
// Remove this parameter from a bound function type.

export {};

function formatWithPrefix(this: { prefix: string }, value: string): string {
  return `${this.prefix}:${value}`;
}

const boundFormatter: OmitThisParameter<typeof formatWithPrefix> =
  formatWithPrefix.bind({ prefix: "product" });

console.log(boundFormatter("p1"));
```

### `thisTypeObjectLiteral.ts`

```ts
// Goal:
// Use ThisType to type this inside object literal methods.

export {};

type ObjectDescriptor<Data, Methods> = {
  data: Data;
  methods: Methods & ThisType<Data & Methods>;
};

function makeObject<Data, Methods>(
  descriptor: ObjectDescriptor<Data, Methods>,
): Data & Methods {
  return {
    ...descriptor.data,
    ...descriptor.methods,
  };
}

const counter = makeObject({
  data: { count: 0 },
  methods: {
    increment() {
      this.count += 1;
    },
  },
});

counter.increment();

console.log(counter.count);
```

---

## 15. 10：字符串工具类型

### 结论

`Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize` 通常和 Template Literal Types 一起生成命名协议。


### 本节必须先建立：字符串工具类型不是运行时字符串方法

`Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize` 都是类型系统里的字符串字面量转换工具，不会调用 JavaScript 的 `.toUpperCase()` 或 `.toLowerCase()`。

```ts
type ChannelName = Uppercase<"productCreated">;
```

读法：

```txt
"productCreated":
  string literal type

Uppercase<"productCreated">:
  transformed string literal type

ChannelName:
  "PRODUCTCREATED"
```

运行时如果要真的转换字符串，仍然要写：

```ts
const channelName = "productCreated".toUpperCase();
```

### `capitalizeKeys.ts`

```ts
// Goal:
// Generate getter names with Capitalize.

export {};

type GetterName<Key extends string> = `get${Capitalize<Key>}`;

type ProductTitleGetter = GetterName<"title">;

const getterName: ProductTitleGetter = "getTitle";

// @ts-expect-error: gettitle is not capitalized.
const brokenGetterName: ProductTitleGetter = "gettitle";

console.log(getterName, brokenGetterName);
```

### `upperCaseEventNames.ts`

```ts
// Goal:
// Convert event names to uppercase channel names.

export {};

type EventName = "productCreated" | "productDeleted";

type ChannelName = Uppercase<EventName>;

const channel: ChannelName = "PRODUCTCREATED";

console.log(channel);
```

---

## 16. 11：小项目整合

### 结论

本章小项目做一个“产品 API 类型派生层”：从领域类型派生 create body、update patch、public DTO、response、handler 参数和异步返回数据。

### `domain.ts`

```ts
// Goal:
// Define the domain model.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
  internalCostCents: number;
  createdAt: string;
};
```

### `dto.ts`

```ts
// Goal:
// Derive DTO types from the domain model.

import type { ProductRecord } from "./domain.js";

export type PublicProductDto = Omit<ProductRecord, "internalCostCents">;

export type ProductListItem = Pick<ProductRecord, "id" | "title" | "priceCents">;

export type CreateProductBody = Pick<ProductRecord, "title" | "priceCents">;

export type UpdateProductPatch = Partial<CreateProductBody>;
```

### `api.ts`

```ts
// Goal:
// Define API result types.

import type { PublicProductDto } from "./dto.js";

export type ApiError =
  | { kind: "not-found"; message: string }
  | { kind: "invalid-input"; message: string };

export type ApiResult<Data> =
  | { ok: true; data: Data }
  | { ok: false; error: ApiError };

export async function loadProduct(id: string): Promise<ApiResult<PublicProductDto>> {
  return {
    ok: true,
    data: {
      id,
      title: "Keyboard",
      priceCents: 9900,
      createdAt: "2026-01-01",
    },
  };
}

export type LoadProductData = Awaited<ReturnType<typeof loadProduct>>;
```

### `routes.ts`

```ts
// Goal:
// Define route handler types with utility types.

import type { CreateProductBody, UpdateProductPatch } from "./dto.js";

export type RouteName = "createProduct" | "updateProduct";

export type RouteBodies = {
  createProduct: CreateProductBody;
  updateProduct: UpdateProductPatch;
};

export type RouteHandler<Name extends RouteName> = (
  body: RouteBodies[Name],
) => Promise<void>;
```

### `app.ts`

```ts
// Goal:
// Use the derived utility types.

import { loadProduct } from "./api.js";
import type { RouteHandler } from "./routes.js";

const createProductHandler: RouteHandler<"createProduct"> = async (body) => {
  console.log(body.title);
};

async function main(): Promise<void> {
  await createProductHandler({
    title: "Keyboard",
    priceCents: 9900,
  });

  const result = await loadProduct("p1");

  if (result.ok) {
    console.log(result.data.title);
  }
}

void main();
```

---

## 17. 最终文件清单

```txt
typescript/
  appendix-utility-types/
    README.md
    00-problem-model/
      utilityTypeMentalModel.ts
      utilityTypeSyntaxRoles.ts
      typeLevelOnlyBoundary.ts
    01-object-shape-transform/
      partialPatch.ts
      requiredConfig.ts
      readonlySnapshot.ts
    02-pick-omit/
      publicProductDto.ts
      createProductBody.ts
    03-record/
      routeTable.ts
      eventHandlerMap.ts
      recordKeyValueBoundary.ts
      recordLiteralKeyUnion.ts
    04-union-filter/
      excludeStates.ts
      extractErrors.ts
      nonNullableLookup.ts
      distributiveUnionFilter.ts
    05-function-extraction/
      parametersFromHandler.ts
      returnTypeFromLoader.ts
      typeofFunctionBoundary.ts
    06-constructor-extraction/
      constructorParameters.ts
      instanceType.ts
      classValueVsInstanceBoundary.ts
    07-awaited/
      awaitedReturnType.ts
      apiDataType.ts
    08-noinfer/
      defaultValueBoundary.ts
    09-this-utilities/
      thisParameterType.ts
      omitThisParameter.ts
      thisTypeObjectLiteral.ts
    10-string-utilities/
      capitalizeKeys.ts
      upperCaseEventNames.ts
    11-mini-project/
      domain.ts
      dto.ts
      api.ts
      routes.ts
      app.ts
```

---

## 18. 最终学习笔记转换要求

最终笔记必须包含这些对比：

```txt
Partial vs Required
Readonly type vs Object.freeze
Pick vs Omit
Record vs mapped type
Exclude vs Extract
NonNullable vs runtime null check
Parameters vs ReturnType
ConstructorParameters vs InstanceType
ReturnType<typeof asyncFn> vs Awaited<ReturnType<typeof asyncFn>>
NoInfer vs normal generic inference
ThisParameterType vs OmitThisParameter
ThisType vs explicit this parameter
Capitalize vs runtime string capitalization
```

---

## 19. 本章最终要能回答的问题

1. Utility Types 为什么不是运行时工具？
2. `Partial<T>` 适合 patch 还是 create body？
3. `Required<T>` 会不会自动给对象填默认值？
4. `Readonly<T>` 和 `Object.freeze()` 有什么区别？
5. `Pick` 和 `Omit` 如何服务 API DTO？
6. `Record<K, V>` 和普通对象类型有什么关系？
7. `Exclude` 与 `Extract` 分别如何处理 union？
8. `NonNullable` 能否代替运行时判空？
9. `Parameters` 的输出为什么是 tuple？
10. `ReturnType` 用在 async 函数上会得到什么？
11. 为什么 async 函数常配合 `Awaited<ReturnType<...>>`？
12. `NoInfer` 解决什么泛型推导问题？
13. `ThisType` 为什么需要 `noImplicitThis`？
14. 字符串工具类型为什么常配合模板字面量类型？
15. 如何用 utility types 从领域模型派生 DTO、API body 和 response？
16. `Record<K, V>` 固定接收几个类型参数？每个参数控制什么？
17. `Record<"home" | "cart", RouteConfig>` 和 `Record<string, RouteConfig>` 有什么区别？
18. `Pick<ProductRecord, "id" | "title">` 里的第二个类型参数为什么是 key union？
19. `Partial<Omit<ProductRecord, "id">>` 应该从内到外还是从外到内读？
20. `typeof createProduct` 在类型位置和表达式位置有什么区别？
21. 为什么 `Parameters<typeof fn>` 的结果是 tuple？
22. 为什么 `ReturnType<typeof asyncFn>` 还不是 async 函数最终 data？
23. `Awaited<ReturnType<typeof asyncFn>>` 为什么要从内到外读？
24. `NoInfer<T>` 是改变类型本身，还是改变泛型推导来源？
25. 显式 `this` 参数为什么不会成为普通运行时参数？
26. `Uppercase<T>` 和 `value.toUpperCase()` 属于同一层吗？


---

## 20. 最终记忆模型

```txt
Object shape:
  Partial
  Required
  Readonly

Object selection:
  Pick
  Omit
  Record

Union filtering:
  Exclude
  Extract
  NonNullable

Function and class extraction:
  Parameters
  ReturnType
  ConstructorParameters
  InstanceType

Async:
  Awaited

Inference and this:
  NoInfer
  ThisParameterType
  OmitThisParameter
  ThisType

String protocol:
  Uppercase
  Lowercase
  Capitalize
  Uncapitalize
```


### 同样标准下的阅读顺序

```txt
For every utility type:
  1. identify the utility name
  2. count type arguments
  3. identify the role of each type argument
  4. predict the output type
  5. check whether the runtime value changed
```

最容易出错的分层：

```txt
type-level:
  Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, NonNullable,
  Parameters, ReturnType, ConstructorParameters, InstanceType, Awaited, NoInfer,
  ThisParameterType, OmitThisParameter, ThisType, Uppercase, Lowercase, Capitalize, Uncapitalize

runtime-level:
  object spread, function calls, class construction, string methods, Promise execution

bridge syntax:
  typeof value in type position
  as const
  explicit this parameter
```

### 最终一句话

```txt
Utility Types 的核心价值是把真实项目里常见的类型派生标准化：从一个领域类型自动得到 DTO、patch、response、handler、异步数据和事件命名协议。
```

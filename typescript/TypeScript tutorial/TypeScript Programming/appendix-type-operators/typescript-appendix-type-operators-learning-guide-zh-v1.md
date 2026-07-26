# TypeScript 必补章节 02：“类型运算符参考”学习指导文件 v1

> 定位：这是对《TypeScript Programming》附录 A“类型运算符”和第 6 章“类型进阶”的补充训练文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察类型输入和类型输出，再把每节整理成最终学习笔记。  
> 参考范围：TypeScript 官方 Handbook 的 `keyof`、类型位置 `typeof`、Indexed Access Types、Mapped Types、Conditional Types、Template Literal Types、Generics。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先把每个类型运算符看成“输入类型 -> 输出类型”的函数，再写组合类型。不要直接背复杂类型表达式。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| `keyof`：从对象类型生成 key union | [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) |
| 类型位置 `typeof`：从值提取静态类型 | [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) |
| `T[K]`：索引访问类型，提取属性值类型 | [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) |
| 映射类型、映射修饰符、key remapping | [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) |
| 条件类型、分配式条件类型、`infer` | [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) |
| 字符串类型拼接和 intrinsic string manipulation types | [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [完整学习顺序](#3-完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：类型运算符到底在解决什么](#5-00类型运算符到底在解决什么)
6. [01：`keyof`](#6-01keyof)
7. [02：类型位置的 `typeof`](#7-02类型位置的-typeof)
8. [03：索引访问类型 `T[K]`](#8-03索引访问类型-tk)
9. [04：`keyof` + `T[K]` 写安全读取函数](#9-04keyof--tk-写安全读取函数)
10. [05：映射类型 mapped types](#10-05映射类型-mapped-types)
11. [06：映射修饰符 `readonly` 和 `?`](#11-06映射修饰符-readonly-和-)
12. [07：key remapping](#12-07key-remapping)
13. [08：条件类型 conditional types](#13-08条件类型-conditional-types)
14. [09：分配式条件类型](#14-09分配式条件类型)
15. [10：`infer`](#15-10infer)
16. [11：模板字面量类型作为类型运算符](#16-11模板字面量类型作为类型运算符)
17. [12：小项目整合](#17-12小项目整合)
18. [最终文件清单](#18-最终文件清单)
19. [最终学习笔记转换要求](#19-最终学习笔记转换要求)
20. [本章最终要能回答的问题](#20-本章最终要能回答的问题)
21. [最终记忆模型](#21-最终记忆模型)

---

## 1. 本文件怎么用

### 结论

类型运算符不是“高级炫技”，而是用来从已有类型派生新类型，减少重复和手写漂移。

每节都要回答：

```txt
Input type:
  What type enters the operator?

Operation:
  What does the operator do?

Output type:
  What type comes out?

Runtime:
  Does anything exist after emit?
```

### 每节固定学习步骤

```txt
1. Read the conclusion first.
2. Write the smallest example that shows the type transformation.
3. Add one invalid usage with @ts-expect-error.
4. Run npx tsc --noEmit.
5. Explain the input type, operation, and output type.
6. Convert the section into your final notes.
```

---

## 2. 项目重新整理建议

```txt
typescript/
  appendix-type-operators/
    README.md
    00-problem-model/
      operatorMentalModel.ts
      nameRoleBoundary.ts
      typePositionVsExpressionPosition.ts
      operatorCompositionReadOrder.ts
      nameRoleBoundary.ts
      typePositionVsExpressionPosition.ts
      operatorCompositionReadOrder.ts
    01-keyof/
      keyofObject.ts
      keyofIndexSignature.ts
    02-typeof-type-operator/
      typeofValue.ts
      typeofFunction.ts
      typeofRuntimeVsTypePosition.ts
    03-indexed-access/
      propertyAccessType.ts
      arrayElementType.ts
      indexedAccessVsRuntimeAccess.ts
    04-keyof-indexed-access/
      safeReadProperty.ts
      safePick.ts
    05-mapped-types/
      mapKeysToBooleans.ts
      mapToValidators.ts
    06-mapping-modifiers/
      makeReadonly.ts
      removeOptional.ts
    07-key-remapping/
      prefixKeys.ts
      getterNames.ts
      asKeyRemappingVsAssertion.ts
    08-conditional-types/
      basicConditional.ts
      constraintPlacement.ts
      extendsConstraintVsConditional.ts
    09-distributive-conditional-types/
      unionDistribution.ts
      preventDistribution.ts
    10-infer/
      inferArrayElement.ts
      inferFunctionReturn.ts
      inferPromiseValue.ts
      inferScopeBoundary.ts
    11-template-literal-operators/
      eventNameFromKey.ts
      stringManipulationTypes.ts
      templateLiteralTypeVsRuntimeString.ts
    12-mini-project/
      schema.ts
      validators.ts
      clientTypes.ts
      app.ts
```

---

## 3. 完整学习顺序

```txt
type operator problem model
  -> keyof
  -> typeof in type positions
  -> indexed access types
  -> keyof + indexed access
  -> mapped types
  -> mapping modifiers
  -> key remapping
  -> conditional types
  -> distributive conditional types
  -> infer
  -> template literal type operators
  -> mini project
```

---

## 4. 本章先要建立的底层模型

### 结论

类型运算符只在类型系统中运行。它们不会读取运行时对象，也不会生成 JavaScript 逻辑。

```txt
value world:
  objects, arrays, functions, strings, numbers exist at runtime.

type world:
  keyof, typeof, T[K], mapped types, conditional types, infer operate before emit.

bridge:
  typeof in a type position can copy the static type of a runtime value.
```

---


### 本章第一次出现就必须讲清楚的符号

### 结论

本章所有内容都不是“先背名字”。每个类型运算符第一次出现时，必须先判断它处在 **type position** 还是 **expression position**。

```txt
Read order:
  1. Is this a value, a type, an operator, or a name?
  2. Is this in type position or expression position?
  3. Does it exist after TypeScript emits JavaScript?
  4. What is the input type?
  5. What is the output type?
```

### 必须先分清的名字角色

| 写法 | 当前角色 | 能不能改名 | 运行时是否存在 |
|---|---|---|---|
| `ProductRecord` | type alias name | 可以 | 否 |
| `ObjectType` | type parameter name | 可以 | 否 |
| `Key` | type parameter name | 可以 | 否 |
| `id` in `{ id: string }` | property name in an object type | 可以，但结构会变 | 否 |
| `"id"` | string literal type 或 runtime string，取决于位置 | 可以，但含义会变 | 类型位置否，表达式位置是 |
| `product` | runtime variable name | 可以 | 是 |
| `key` | runtime variable name 或 type alias name，取决于声明方式 | 可以 | 变量是，类型别名否 |

### 必须先分清的符号角色

| 符号 | 所属层级 | 当前章含义 |
|---|---|---|
| `keyof T` | TypeScript type system | 从对象类型得到 key union |
| `typeof value` | TypeScript type position 或 JavaScript expression position | 类型位置提取静态类型；表达式位置返回运行时字符串 |
| `T[K]` | TypeScript type system | 从对象类型中提取属性值类型 |
| `<T>` | TypeScript type parameter / type argument list | 给类型工具或泛型函数传入类型 |
| `extends` | TypeScript type system | 泛型约束或条件类型判断，位置不同含义不同 |
| `[Key in Keys]` | TypeScript mapped type | 遍历 key union 并生成对象类型 |
| `as` in mapped type | TypeScript key remapping | 重命名或过滤 key |
| `as` in expression | TypeScript type assertion | 告诉类型检查器把表达式当成某类型 |
| `infer` | TypeScript conditional type | 在条件类型内部声明临时类型变量 |
| `` `${...}` `` in type position | TypeScript template literal type | 拼接并生成字符串字面量类型 union |

### 本章禁止省略的判断

```txt
Rule:
  A type operator is not runtime logic.
  A type alias name is not a runtime variable.
  A runtime variable name is not automatically a type.
  typeof is the bridge only when it appears in type position.
```


---

## 5. 00：类型运算符到底在解决什么

### `operatorMentalModel.ts`

```ts
// Goal:
// Treat type operators as type-level transformations.

// Expected result:
// The file compiles and prints a runtime label.

export {};

type Source = {
  id: string;
  priceCents: number;
};

type Keys = keyof Source;
type Values = Source[Keys];

const key: Keys = "id";
const value: Values = "p1";

console.log(key, value);
```

### `nameRoleBoundary.ts`

```ts
// Goal:
// Separate type alias names, type parameter names, property names, and value names.

// Expected result:
// The file compiles and prints the product title.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

function readTitle(product: ProductRecord): string {
  return product.title;
}

const runtimeProduct: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(readTitle(runtimeProduct));
```

这段代码必须按名字角色读：

| 名字 | 角色 | 说明 |
|---|---|---|
| `ProductRecord` | type alias name | 只在类型系统存在 |
| `id` / `title` / `priceCents` | property names | 描述对象结构 |
| `product` | function parameter name | 运行时参数 |
| `runtimeProduct` | runtime variable name | 运行时对象值 |

### `typePositionVsExpressionPosition.ts`

```ts
// Goal:
// Distinguish type position from expression position.

// Expected result:
// The file compiles and prints a property value.

export {};

const product = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

type Product = typeof product;
type ProductKey = keyof Product;

const key: ProductKey = "title";
const value = product[key];

console.log(value);
```

这段的关键不是结果，而是位置：

| 片段 | 位置 | 含义 |
|---|---|---|
| `const product = ...` | expression position | 创建运行时对象 |
| `typeof product` | type position | 提取 `product` 的静态类型 |
| `keyof Product` | type position | 提取 `Product` 的 key union |
| `product[key]` | expression position | 运行时属性读取 |

### `operatorCompositionReadOrder.ts`

```ts
// Goal:
// Read composed type operators from inside to outside.

// Expected result:
// The file compiles and prints one valid key and one valid value.

export {};

const products = [
  { id: "p1", title: "Keyboard", priceCents: 9900 },
  { id: "p2", title: "Mouse", priceCents: 2500 },
] as const;

type Product = (typeof products)[number];
type ProductKey = keyof Product;
type ProductValue = Product[ProductKey];

const key: ProductKey = "title";
const value: ProductValue = "Keyboard";

console.log(key, value);
```

读取顺序：

```txt
typeof products:
  static type of the products value

(typeof products)[number]:
  element type of the readonly array

keyof Product:
  key union of one product object

Product[ProductKey]:
  union of all property value types
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 类型运算符运行时会执行 | 类型运算符编译后被擦除。 |
| `typeof` 在所有位置都一样 | 表达式位置是 JS 操作符，类型位置是 TS 类型查询。 |
| 复杂类型可以随便嵌套 | 每一步都要能说出输入和输出。 |

---

## 6. 01：`keyof`

### 结论

`keyof T` 把对象类型 `T` 的属性名变成字符串、数字或符号字面量 union。

### `keyofObject.ts`

```ts
// Goal:
// Use keyof to derive allowed property names.

// Expected result:
// The compiler rejects unknown keys.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type ProductKey = keyof ProductRecord;

const validKey: ProductKey = "title";

// @ts-expect-error: stock is not a key of ProductRecord.
const invalidKey: ProductKey = "stock";

console.log(validKey, invalidKey);
```

### `keyofIndexSignature.ts`

```ts
// Goal:
// Observe keyof with index signatures.

// Expected result:
// A string index signature produces string or number keys.

export {};

type Dictionary = {
  [key: string]: boolean;
};

type DictionaryKey = keyof Dictionary;

const stringKey: DictionaryKey = "enabled";
const numberKey: DictionaryKey = 0;

console.log(stringKey, numberKey);
```

---

## 7. 02：类型位置的 `typeof`

### 结论

类型位置的 `typeof value` 从一个运行时值的静态类型中派生类型，不会读取运行时值。

### `typeofValue.ts`

```ts
// Goal:
// Derive a type from a value declaration.

// Expected result:
// ProductConfig stays synchronized with defaultConfig.

export {};

const defaultConfig = {
  currencyCode: "USD",
  retryCount: 3,
  enableCache: true,
};

type ProductConfig = typeof defaultConfig;

const config: ProductConfig = {
  currencyCode: "EUR",
  retryCount: 2,
  enableCache: false,
};

console.log(config.currencyCode);
```

### `typeofFunction.ts`

```ts
// Goal:
// Derive a function type from a function value.

// Expected result:
// The new function must match the source function type.

export {};

function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

type PriceFormatter = typeof formatPrice;

const formatter: PriceFormatter = (priceCents) => {
  return `USD ${priceCents}`;
};

console.log(formatter(9900));
```

### `typeofRuntimeVsTypePosition.ts`

```ts
// Goal:
// Compare runtime typeof with type-position typeof.

// Expected result:
// Runtime typeof returns a string, while type-position typeof creates a type.

export {};

const product = {
  id: "p1",
  priceCents: 9900,
};

const runtimeTypeName = typeof product;

type Product = typeof product;

const copiedProduct: Product = {
  id: "p2",
  priceCents: 2500,
};

console.log(runtimeTypeName, copiedProduct.priceCents);
```

对比：

| 写法 | 位置 | 结果 |
|---|---|---|
| `const runtimeTypeName = typeof product` | expression position | 运行时字符串 `"object"` |
| `type Product = typeof product` | type position | 静态对象类型 |

### 常见错误

```txt
Mistake:
  Use typeof ProductRecord where ProductRecord is already a type alias.

Correct:
  typeof in type position queries values, not type aliases.
```

---

## 8. 03：索引访问类型 `T[K]`

### 结论

`T[K]` 在类型层读取对象类型 `T` 的属性 `K` 对应的值类型。

### `propertyAccessType.ts`

```ts
// Goal:
// Extract a property value type from an object type.

// Expected result:
// ProductTitle is string.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type ProductTitle = ProductRecord["title"];

const title: ProductTitle = "Keyboard";

// @ts-expect-error: ProductTitle is string.
const brokenTitle: ProductTitle = 123;

console.log(title, brokenTitle);
```

### `arrayElementType.ts`

```ts
// Goal:
// Extract array element type with number indexing.

// Expected result:
// Product is the array element type.

export {};

const products = [
  { id: "p1", title: "Keyboard" },
  { id: "p2", title: "Mouse" },
];

type Product = (typeof products)[number];

const product: Product = {
  id: "p3",
  title: "Monitor",
};

console.log(product.title);
```

### `indexedAccessVsRuntimeAccess.ts`

```ts
// Goal:
// Compare indexed access types with runtime indexed property access.

// Expected result:
// The file compiles and prints the title.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type TitleType = ProductRecord["title"];

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

const runtimeTitle = product["title"];

const typedTitle: TitleType = runtimeTitle;

console.log(typedTitle.toUpperCase());
```

对比：

| 写法 | 所属层级 | 作用 |
|---|---|---|
| `ProductRecord["title"]` | type system | 提取 `title` 属性的类型 |
| `product["title"]` | runtime | 读取运行时对象上的 `title` 属性值 |

---

## 9. 04：`keyof` + `T[K]` 写安全读取函数

### 结论

`Key extends keyof ObjectType` 和 `ObjectType[Key]` 可以把输入 key 和返回值类型绑定起来。

### `safeReadProperty.ts`

```ts
// Goal:
// Preserve the relationship between key and returned value.

// Expected result:
// Reading title returns string and reading priceCents returns number.

export {};

function readProperty<ObjectType, Key extends keyof ObjectType>(
  objectValue: ObjectType,
  key: Key,
): ObjectType[Key] {
  return objectValue[key];
}

const product = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

const title = readProperty(product, "title");
const priceCents = readProperty(product, "priceCents");

console.log(title.toUpperCase());
console.log(priceCents.toFixed(0));
```

### `safePick.ts`

```ts
// Goal:
// Pick selected keys while preserving their value types.

// Expected result:
// The returned object only has selected keys.

export {};

function pick<ObjectType, Key extends keyof ObjectType>(
  objectValue: ObjectType,
  keys: readonly Key[],
): Pick<ObjectType, Key> {
  const result = {} as Pick<ObjectType, Key>;

  for (const key of keys) {
    result[key] = objectValue[key];
  }

  return result;
}

const product = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

const summary = pick(product, ["id", "title"] as const);

console.log(summary.title);

// @ts-expect-error: priceCents was not picked.
console.log(summary.priceCents);
```

---

## 10. 05：映射类型 mapped types

### 结论

映射类型遍历 key union，为每个 key 生成一个属性。

### `mapKeysToBooleans.ts`

```ts
// Goal:
// Map every key to a boolean flag.

// Expected result:
// ProductFlags has one boolean field for each product key.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type Flags<ObjectType> = {
  [Key in keyof ObjectType]: boolean;
};

type ProductFlags = Flags<ProductRecord>;

const flags: ProductFlags = {
  id: true,
  title: true,
  priceCents: false,
};

console.log(flags.title);
```

### `mapToValidators.ts`

```ts
// Goal:
// Create validators based on source object keys.

// Expected result:
// Each validator receives the original field type.

export {};

type Validators<ObjectType> = {
  [Key in keyof ObjectType]: (value: ObjectType[Key]) => boolean;
};

type ProductRecord = {
  title: string;
  priceCents: number;
};

const validators: Validators<ProductRecord> = {
  title: (value) => value.length > 0,
  priceCents: (value) => value > 0,
};

console.log(validators.title("Keyboard"));
```

---

## 11. 06：映射修饰符 `readonly` 和 `?`

### 结论

映射类型可以添加或移除 `readonly` 和可选属性修饰符。

### `makeReadonly.ts`

```ts
// Goal:
// Add readonly to every property.

// Expected result:
// Reassignment is rejected.

export {};

type ReadonlyFields<ObjectType> = {
  readonly [Key in keyof ObjectType]: ObjectType[Key];
};

type ProductRecord = {
  id: string;
  title: string;
};

const product: ReadonlyFields<ProductRecord> = {
  id: "p1",
  title: "Keyboard",
};

// @ts-expect-error: title is readonly.
product.title = "Mouse";

console.log(product.title);
```

### `removeOptional.ts`

```ts
// Goal:
// Remove optional modifiers from every property.

// Expected result:
// All properties become required.

export {};

type Concrete<ObjectType> = {
  [Key in keyof ObjectType]-?: ObjectType[Key];
};

type DraftProduct = {
  id?: string;
  title?: string;
};

type ProductRecord = Concrete<DraftProduct>;

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
};

console.log(product.title);
```

---

## 12. 07：key remapping

### 结论

映射类型里的 `as` 可以重命名 key，也可以把某些 key 映射成 `never` 来过滤掉。

### `prefixKeys.ts`

```ts
// Goal:
// Prefix all keys with a namespace.

// Expected result:
// Prefixed keys are generated from source keys.

export {};

type PrefixKeys<ObjectType, Prefix extends string> = {
  [Key in keyof ObjectType as `${Prefix}${Capitalize<string & Key>}`]: ObjectType[Key];
};

type ProductRecord = {
  id: string;
  title: string;
};

type ApiProductRecord = PrefixKeys<ProductRecord, "api">;

const product: ApiProductRecord = {
  apiId: "p1",
  apiTitle: "Keyboard",
};

console.log(product.apiTitle);
```

### `getterNames.ts`

```ts
// Goal:
// Generate getter function names from source keys.

// Expected result:
// Getter names and return values stay linked.

export {};

type Getters<ObjectType> = {
  [Key in keyof ObjectType as `get${Capitalize<string & Key>}`]: () => ObjectType[Key];
};

type ProductRecord = {
  title: string;
  priceCents: number;
};

const getters: Getters<ProductRecord> = {
  getTitle: () => "Keyboard",
  getPriceCents: () => 9900,
};

console.log(getters.getTitle());
```

### `asKeyRemappingVsAssertion.ts`

```ts
// Goal:
// Compare key-remapping as with expression type assertion as.

// Expected result:
// The file compiles and prints a remapped key value.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ApiShape<ObjectType> = {
  [Key in keyof ObjectType as `api${Capitalize<string & Key>}`]: ObjectType[Key];
};

const apiProduct: ApiShape<ProductRecord> = {
  apiId: "p1",
  apiTitle: "Keyboard",
};

const unknownValue: unknown = "p2";
const assertedId = unknownValue as string;

console.log(apiProduct.apiTitle, assertedId.toUpperCase());
```

对比：

| 写法 | 位置 | 含义 |
|---|---|---|
| `[Key in keyof ObjectType as ...]` | mapped type | 重命名生成出来的 key |
| `unknownValue as string` | expression with type assertion | 告诉类型检查器把表达式当成 `string` |

---

## 13. 08：条件类型 conditional types

### 结论

条件类型是类型层的分支：`A extends B ? X : Y`。它根据类型关系选择不同输出类型。

### `basicConditional.ts`

```ts
// Goal:
// Select output type based on input type.

// Expected result:
// Strings become string arrays and numbers become number arrays.

export {};

type ToArray<ValueType> = ValueType extends string
  ? string[]
  : ValueType[];

type StringResult = ToArray<string>;
type NumberResult = ToArray<number>;

const titles: StringResult = ["Keyboard"];
const counts: NumberResult = [1, 2, 3];

console.log(titles.length, counts.length);
```

### `constraintPlacement.ts`

```ts
// Goal:
// Move the constraint into a conditional type.

// Expected result:
// Non-message types become never.

export {};

type MessageOf<ValueType> = ValueType extends { message: unknown }
  ? ValueType["message"]
  : never;

type Email = {
  message: string;
};

type EmailMessage = MessageOf<Email>;
type MissingMessage = MessageOf<{ id: string }>;

const message: EmailMessage = "Ready";

// @ts-expect-error: MissingMessage is never.
const broken: MissingMessage = "Missing";

console.log(message, broken);
```

### `extendsConstraintVsConditional.ts`

```ts
// Goal:
// Distinguish generic constraints from conditional type checks.

// Expected result:
// The file compiles and prints both labels.

export {};

type HasId = {
  id: string;
};

function readId<Entity extends HasId>(entity: Entity): string {
  return entity.id;
}

type IdKind<ValueType> = ValueType extends HasId ? "has-id" : "missing-id";

type ProductKind = IdKind<{ id: string; title: string }>;
type AnonymousKind = IdKind<{ title: string }>;

const productKind: ProductKind = "has-id";
const anonymousKind: AnonymousKind = "missing-id";

console.log(readId({ id: "p1", title: "Keyboard" }), productKind, anonymousKind);
```

对比：

| 写法 | 位置 | 含义 |
|---|---|---|
| `Entity extends HasId` | generic parameter list | 限制 `Entity` 必须至少有 `id` |
| `ValueType extends HasId ? ... : ...` | conditional type | 根据类型关系选择输出类型 |

---

## 14. 09：分配式条件类型

### 结论

当条件类型的左侧是裸类型参数时，传入 union 会逐个成员分配执行。

### `unionDistribution.ts`

```ts
// Goal:
// Observe distributive conditional types.

// Expected result:
// string or number becomes string array or number array.

export {};

type ToArray<ValueType> = ValueType extends unknown
  ? ValueType[]
  : never;

type Result = ToArray<string | number>;

const result: Result = ["a", "b"];

console.log(result.length);
```

### `preventDistribution.ts`

```ts
// Goal:
// Prevent distribution by wrapping both sides in tuples.

// Expected result:
// string or number becomes a mixed array.

export {};

type ToArrayNonDistributive<ValueType> = [ValueType] extends [unknown]
  ? ValueType[]
  : never;

type Result = ToArrayNonDistributive<string | number>;

const result: Result = ["a", 1, "b"];

console.log(result.length);
```

---

## 15. 10：`infer`

### 结论

`infer` 在条件类型内部声明一个临时类型变量，用来从匹配到的结构中提取类型。

### `inferArrayElement.ts`

```ts
// Goal:
// Extract the element type from an array.

export {};

type ElementOf<ValueType> = ValueType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

type ProductIds = ElementOf<readonly ["p1", "p2"]>;

const productId: ProductIds = "p1";

// @ts-expect-error: p3 is not part of the tuple elements.
const brokenProductId: ProductIds = "p3";

console.log(productId, brokenProductId);
```

### `inferFunctionReturn.ts`

```ts
// Goal:
// Extract function return type with infer.

export {};

type MyReturnType<FunctionType> = FunctionType extends (...args: never[]) => infer Return
  ? Return
  : never;

function loadTitle(): string {
  return "Keyboard";
}

type Title = MyReturnType<typeof loadTitle>;

const title: Title = "Mouse";

console.log(title);
```

### `inferPromiseValue.ts`

```ts
// Goal:
// Recursively unwrap Promise-like types.

export {};

type MyAwaited<ValueType> = ValueType extends Promise<infer Inner>
  ? MyAwaited<Inner>
  : ValueType;

type LoadedValue = MyAwaited<Promise<Promise<number>>>;

const value: LoadedValue = 42;

console.log(value.toFixed(0));
```

### `inferScopeBoundary.ts`

```ts
// Goal:
// Show that infer creates a temporary type variable inside a conditional type.

// Expected result:
// The file compiles and prints the extracted payload.

export {};

type PayloadOf<ValueType> = ValueType extends { payload: infer Payload }
  ? Payload
  : never;

type ProductEvent = {
  type: "product-created";
  payload: {
    id: string;
  };
};

type ProductPayload = PayloadOf<ProductEvent>;

const payload: ProductPayload = {
  id: "p1",
};

console.log(payload.id);
```

关键点：

```txt
Payload:
  exists only inside the true branch of the conditional type

PayloadOf<ProductEvent>:
  extracts the type of the payload property

Runtime:
  infer emits no JavaScript
```

---

## 16. 11：模板字面量类型作为类型运算符

### 结论

模板字面量类型可以和 `keyof`、key remapping、intrinsic string manipulation types 组合，用类型系统生成命名协议。

### `eventNameFromKey.ts`

```ts
// Goal:
// Generate event names from object keys.

export {};

type ChangeEvents<ObjectType> = {
  [Key in keyof ObjectType as `${string & Key}Changed`]: ObjectType[Key];
};

type ProductRecord = {
  title: string;
  priceCents: number;
};

type ProductEvents = ChangeEvents<ProductRecord>;

const eventPayloads: ProductEvents = {
  titleChanged: "Keyboard",
  priceCentsChanged: 9900,
};

console.log(eventPayloads.titleChanged);
```

### `stringManipulationTypes.ts`

```ts
// Goal:
// Use intrinsic string manipulation types.

export {};

type FieldName = "title" | "priceCents";

type GetterName = `get${Capitalize<FieldName>}`;

const getterName: GetterName = "getTitle";

// @ts-expect-error: gettitle does not match the capitalized form.
const brokenGetterName: GetterName = "gettitle";

console.log(getterName, brokenGetterName);
```

### `templateLiteralTypeVsRuntimeString.ts`

```ts
// Goal:
// Compare template literal types with runtime template strings.

// Expected result:
// The file compiles and prints the runtime event name.

export {};

type FieldName = "title" | "priceCents";

type ChangeEventName = `${FieldName}Changed`;

function createRuntimeEventName(fieldName: FieldName): ChangeEventName {
  return `${fieldName}Changed`;
}

const eventName: ChangeEventName = createRuntimeEventName("title");

// @ts-expect-error: titleChange does not match the generated type.
const brokenEventName: ChangeEventName = "titleChange";

console.log(eventName, brokenEventName);
```

对比：

| 写法 | 位置 | 作用 |
|---|---|---|
| `` `${FieldName}Changed` `` | type position | 生成字符串字面量类型 union |
| `` `${fieldName}Changed` `` | expression position | 生成运行时字符串值 |

---

## 17. 12：小项目整合

### 结论

本章小项目要写一个 schema 到 client 类型的派生系统，训练 `keyof`、`T[K]`、mapped type、conditional type、`infer` 和 template literal type 的组合。

### `schema.ts`

```ts
// Goal:
// Define a small schema format.

export type StringField = {
  type: "string";
};

export type NumberField = {
  type: "number";
};

export type BooleanField = {
  type: "boolean";
};

export type FieldSchema = StringField | NumberField | BooleanField;

export type ObjectSchema = Record<string, FieldSchema>;
```

### `clientTypes.ts`

```ts
// Goal:
// Derive runtime data types from schema types.

import type { FieldSchema, ObjectSchema } from "./schema.js";

export type FieldValue<Field extends FieldSchema> =
  Field extends { type: "string" }
    ? string
    : Field extends { type: "number" }
      ? number
      : Field extends { type: "boolean" }
        ? boolean
        : never;

export type InferObject<Schema extends ObjectSchema> = {
  [Key in keyof Schema]: FieldValue<Schema[Key]>;
};

export type ChangeEventMap<Schema extends ObjectSchema> = {
  [Key in keyof Schema as `${string & Key}Changed`]: FieldValue<Schema[Key]>;
};
```

### `validators.ts`

```ts
// Goal:
// Validate an unknown field value against a schema field.

import type { FieldSchema } from "./schema.js";
import type { FieldValue } from "./clientTypes.js";

export function isFieldValue<Field extends FieldSchema>(
  field: Field,
  value: unknown,
): value is FieldValue<Field> {
  switch (field.type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
  }
}
```

### `app.ts`

```ts
// Goal:
// Use schema-derived types.

import type { ChangeEventMap, InferObject } from "./clientTypes.js";

const productSchema = {
  title: { type: "string" },
  priceCents: { type: "number" },
  inStock: { type: "boolean" },
} as const;

type Product = InferObject<typeof productSchema>;
type ProductEvents = ChangeEventMap<typeof productSchema>;

const product: Product = {
  title: "Keyboard",
  priceCents: 9900,
  inStock: true,
};

const events: ProductEvents = {
  titleChanged: "Mouse",
  priceCentsChanged: 2500,
  inStockChanged: false,
};

console.log(product.title, events.priceCentsChanged);
```

---

## 18. 最终文件清单

```txt
typescript/
  appendix-type-operators/
    README.md
    00-problem-model/
      operatorMentalModel.ts
      nameRoleBoundary.ts
      typePositionVsExpressionPosition.ts
      operatorCompositionReadOrder.ts
    01-keyof/
      keyofObject.ts
      keyofIndexSignature.ts
    02-typeof-type-operator/
      typeofValue.ts
      typeofFunction.ts
      typeofRuntimeVsTypePosition.ts
    03-indexed-access/
      propertyAccessType.ts
      arrayElementType.ts
      indexedAccessVsRuntimeAccess.ts
    04-keyof-indexed-access/
      safeReadProperty.ts
      safePick.ts
    05-mapped-types/
      mapKeysToBooleans.ts
      mapToValidators.ts
    06-mapping-modifiers/
      makeReadonly.ts
      removeOptional.ts
    07-key-remapping/
      prefixKeys.ts
      getterNames.ts
      asKeyRemappingVsAssertion.ts
    08-conditional-types/
      basicConditional.ts
      constraintPlacement.ts
      extendsConstraintVsConditional.ts
    09-distributive-conditional-types/
      unionDistribution.ts
      preventDistribution.ts
    10-infer/
      inferArrayElement.ts
      inferFunctionReturn.ts
      inferPromiseValue.ts
      inferScopeBoundary.ts
    11-template-literal-operators/
      eventNameFromKey.ts
      stringManipulationTypes.ts
      templateLiteralTypeVsRuntimeString.ts
    12-mini-project/
      schema.ts
      validators.ts
      clientTypes.ts
      app.ts
```

---

## 19. 最终学习笔记转换要求

最终笔记必须包含这些对比：

```txt
keyof T vs T[keyof T]
typeof value in type position vs typeof value at runtime
indexed access T[K] vs runtime property access object[key]
mapped type vs Record
mapping modifier +readonly vs -readonly
optional property ? vs undefined union
key remapping vs original key preservation
conditional type vs union type
distributive conditional type vs non-distributive conditional type
infer vs manual indexing
template literal type vs runtime template string
type parameter name vs runtime parameter name
mapped type as vs type assertion as
extends constraint vs conditional type extends
infer temporary variable vs normal type parameter
```

---

## 20. 本章最终要能回答的问题

1. `keyof` 的输入和输出分别是什么？
2. 有 string index signature 时，为什么 `keyof` 可能包含 `number`？
3. 类型位置的 `typeof` 和运行时 `typeof` 有什么区别？
4. `T[K]` 为什么能提取属性值类型？
5. 为什么 `Key extends keyof T` 能保护属性读取？
6. 映射类型本质上在遍历什么？
7. `-?` 和 `+readonly` 分别控制什么？
8. key remapping 里的 `as` 和类型断言里的 `as` 是同一个概念吗？
9. 条件类型如何做类型层分支？
10. 分配式条件类型什么时候发生？
11. 如何阻止分配式条件类型？
12. `infer` 的作用域在哪里？
13. 如何用类型运算符从 schema 派生业务类型？
14. 哪些类型运算符会生成运行时代码？
15. `T`、`K`、`Key` 这些名字是固定语法还是可改名的类型参数？
16. 为什么 `typeof fn` 才能传给 `ReturnType`，而不是直接写函数名？
17. key remapping 里的 `as` 和表达式里的 `as` 为什么不是同一个位置？
18. `infer` 声明出来的临时类型变量能不能离开 conditional type 使用？

---

## 21. 最终记忆模型

```txt
derive:
  typeof
  indexed access

select:
  keyof
  conditional types

iterate:
  mapped types

rename:
  key remapping
  template literal types

extract:
  infer

compose:
  schema -> domain type -> validators -> event map

first-read protocol:
  name role -> position -> input type -> operation -> output type -> runtime existence
```

### 最终一句话

```txt
类型运算符的核心不是复杂，而是让类型从一个可信来源自动派生，避免项目里同一份结构被手写三次之后互相漂移。
```

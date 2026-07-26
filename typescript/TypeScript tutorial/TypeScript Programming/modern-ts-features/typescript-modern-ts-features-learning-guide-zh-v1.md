# TypeScript 必补章节 01：“现代 TypeScript 特性”学习指导文件 v1

> 定位：这是 TypeScript 主线第 3 到第 12 章之后的现代特性补充文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察推导结果和编译错误，再把每节整理成最终学习笔记。  
> 参考范围：TypeScript 官方文档中的 `satisfies`、Template Literal Types、TypeScript 5.0 `const` type parameters、TypeScript 5.0 标准 decorators。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解这些特性解决的类型推导问题，再理解它们和前面章节的连接关系。不要把现代特性学成“新语法收藏”。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| `satisfies`：检查表达式满足目标类型，同时保留表达式自身的精确推导 | [TypeScript 4.9 Release Notes - satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) |
| Template Literal Types：在类型位置拼接字符串字面量类型，并和 union 交叉展开 | [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) |
| `const` type parameters：让泛型推导默认采用类似 `as const` 的窄推导 | [TypeScript 5.0 Release Notes - const Type Parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters) |
| 标准 decorators：新版装饰器、context object、legacy decorators 差异 | [TypeScript 5.0 Release Notes - Decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [完整学习顺序](#3-完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：现代特性到底补什么](#5-00现代特性到底补什么)
6. [01：`satisfies` 和类型注解的区别](#6-01satisfies-和类型注解的区别)
7. [02：`satisfies` 和 `as` 断言的区别](#7-02satisfies-和-as-断言的区别)
8. [03：Template Literal Types 基础](#8-03template-literal-types-基础)
9. [04：Template Literal Types 和对象 key 绑定](#9-04template-literal-types-和对象-key-绑定)
10. [05：`const` type parameters](#10-05const-type-parameters)
11. [06：标准 decorators 基础](#11-06标准-decorators-基础)
12. [07：标准 decorators 和 legacy decorators 差异](#12-07标准-decorators-和-legacy-decorators-差异)
13. [08：小项目整合](#13-08小项目整合)
14. [最终文件清单](#14-最终文件清单)
15. [最终学习笔记转换要求](#15-最终学习笔记转换要求)
16. [本章最终要能回答的问题](#16-本章最终要能回答的问题)
17. [最终记忆模型](#17-最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这份文件补的是“书上旧版本没有系统覆盖，但现代 TS 项目会频繁遇到”的内容。

你要同时观察三件事：

```txt
inference:
  how TypeScript infers literal, object, tuple, and generic types.

validation:
  how TypeScript checks a value against a target type without changing runtime behavior.

emit:
  which features are type-only and which features may affect emitted JavaScript.
```

### 每节固定学习步骤

```txt
1. Read the conclusion first.
2. Classify the feature as inference control, string type construction, or runtime emit.
3. Create the target directory.
4. Write the correct example.
5. Write the mistake example and mark the expected error with @ts-expect-error.
6. Run npx tsc --noEmit.
7. If decorators are involved, compile and inspect emitted JavaScript.
8. Explain what is type-only and what exists at runtime.
9. Convert the section into your final notes.
```

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

### `package.json`

```json
{
  "name": "modern-ts-features-lab",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

---

## 2. 项目重新整理建议

### 结论

建议建立：

```txt
typescript/modern-ts-features/
```

### 推荐结构

```txt
typescript/
  modern-ts-features/
    README.md
    package.json
    00-feature-problem-model/
      featureBoundaryOverview.ts
      syntaxRoleBoundary.ts
      typeOnlyRuntimeBoundary.ts
    01-satisfies-vs-annotation/
      satisfiesPreservesLiteral.ts
      annotationWidensAccess.ts
      satisfiesReadOrder.ts
    02-satisfies-vs-assertion/
      satisfiesChecksShape.ts
      assertionCanLie.ts
      assertionRuntimeBoundary.ts
    03-template-literal-types/
      routeNameType.ts
      unionExpansion.ts
      templateLiteralTypeVsRuntimeString.ts
    04-template-literal-key-binding/
      watchedObjectEvents.ts
      eventPayloadMapping.ts
      keyPayloadBindingReadOrder.ts
    05-const-type-parameters/
      tupleInferenceBefore.ts
      constTypeParameter.ts
      readonlyConstraintMistake.ts
    06-standard-decorators/
      loggedMethodDecorator.ts
      boundMethodDecorator.ts
      decoratorRuntimeBoundary.ts
    07-standard-vs-legacy-decorators/
      decoratorModeNotes.md
      legacyMigrationBoundary.ts
      decoratorContextShape.ts
    08-mini-project/
      routes.ts
      events.ts
      config.ts
      decorators.ts
      app.ts
notes/
  typescript.md
```

---

## 3. 完整学习顺序

```txt
modern feature problem model
  -> satisfies vs annotation
  -> satisfies vs assertion
  -> template literal type basics
  -> template literal type with keys
  -> const type parameters
  -> standard decorators
  -> standard decorators vs legacy decorators
  -> mini project
```

---

## 4. 本章先要建立的底层模型

### 结论

现代 TypeScript 特性主要做四件事：

```txt
check without widening:
  satisfies validates shape but keeps precise inference.

construct strings at type level:
  template literal types derive route names, event names, and field paths.

preserve literal inference in generic APIs:
  const type parameters reduce the need for as const at call sites.

decorate runtime declarations:
  standard decorators run at runtime and have different typing from legacy decorators.
```

| 术语 | 解释 |
|---|---|
| `satisfies` | 类型检查操作符，用于验证表达式满足某个类型，同时保留表达式自己的推导结果。 |
| 类型注解 | 给变量指定类型，变量之后按这个类型看待，可能丢失更窄的字面量信息。 |
| 类型断言 | 告诉编译器“把它当成某类型”，可能绕过真实检查。 |
| Template Literal Type | 类型位置的模板字符串，用来拼出字符串字面量类型。 |
| `const` type parameter | 泛型参数上的 `const` 修饰，让推导偏向字面量、readonly tuple 和精确对象。 |
| standard decorators | 新版装饰器语义，装饰器函数接收 value 和 context。 |
| legacy decorators | TypeScript 早期实验装饰器，依赖 `experimentalDecorators`，和标准装饰器不兼容。 |

### 本章第一次出现就必须讲清楚的符号角色

### 结论

本章所有新语法都按“位置、层级、输入、输出、运行时是否存在”阅读。只要代码块中出现，就按当前章节内容讲清楚，不把它当成可跳过内容。

| 代码片段 | 角色 | 所属层级 | 运行时是否存在 | 当前必须读懂的内容 |
|---|---|---|---|---|
| `value satisfies Type` | `satisfies` 操作符 | TypeScript type system | 否 | 检查表达式满足目标类型，同时保留表达式自身推导。 |
| `const value: Type = ...` | 类型注解 | TypeScript type system | 类型部分否 | 变量按目标类型看待，可能丢失更窄的字面量信息。 |
| `value as Type` | 类型断言 | TypeScript type system | 否 | 改变编译器看法，不做运行时转换。 |
| `Record<K, V>` | utility type | TypeScript type system | 否 | `K` 控制 key，`V` 控制 value，输出对象类型。 |
| `readonly [A, B, C]` | readonly tuple type | TypeScript type system | 否 | 描述固定长度、固定位置类型的只读 tuple。 |
| `` `${A}.${B}` `` | template literal type | TypeScript type system | 否 | 在类型位置生成字符串字面量类型。 |
| `` `app.${name}` `` | template literal string | JavaScript runtime | 是 | 在运行时生成普通 string 值。 |
| `Key extends keyof ObjectType` | 泛型约束 | TypeScript type system | 否 | 限制 `Key` 必须是 `ObjectType` 的 key。 |
| `ObjectType[Key]` | indexed access type | TypeScript type system | 否 | 根据 key 提取属性值类型。 |
| `const Items extends readonly string[]` | const type parameter | TypeScript type system | 否 | 让泛型推导保留调用点字面量和 readonly tuple 信息。 |
| `(typeof menu)[number]` | 类型位置 `typeof` + indexed access | TypeScript type system | 否 | 先取 `menu` 的静态类型，再取数组或 tuple 元素类型。 |
| `@logged` | decorator syntax | JavaScript runtime + TypeScript checking | 是 | 调用 decorator 函数，可能替换或初始化类成员。 |
| `ClassMethodDecoratorContext` | decorator context type | TypeScript type system | 否 | 描述标准 method decorator 的 context 对象形状。 |
| `context.addInitializer(...)` | decorator runtime API | JavaScript runtime | 是 | 注册实例或类初始化时要执行的函数。 |
| `this: This` | 显式 this 参数 | TypeScript type system | 否 | 给函数体内的 `this` 建模，不会成为运行时参数。 |

### 阅读顺序

```txt
1. Identify whether the syntax is in type position or expression position.
2. Identify whether it changes checking, inference, or runtime emit.
3. Identify the input type or runtime value.
4. Identify the output type or runtime behavior.
5. Compare it with the similar syntax from earlier chapters.
```

---

## 5. 00：现代特性到底补什么

### 结论

现代特性不是替代基础，而是在你已经理解类型推导、泛型、对象 key、函数 this 和类之后，解决更细的工程边界问题。

### `featureBoundaryOverview.ts`

```ts
// Goal:
// Classify modern TypeScript features by the problem they solve.

// Expected result:
// The file compiles and prints the feature names.

export {};

type FeatureGroup =
  | "check-without-widening"
  | "string-type-construction"
  | "literal-generic-inference"
  | "runtime-decoration";

const featureGroups: FeatureGroup[] = [
  "check-without-widening",
  "string-type-construction",
  "literal-generic-inference",
  "runtime-decoration",
];

console.log(featureGroups.join(","));
```

### `syntaxRoleBoundary.ts`

```ts
// Goal:
// Separate syntax roles before reading modern TypeScript features.

// Expected result:
// The file compiles and prints each role label.

export {};

type SyntaxRole =
  | "type-check-operator"
  | "type-assertion"
  | "type-level-string-construction"
  | "generic-inference-control"
  | "runtime-decorator";

const roles: Record<SyntaxRole, string> = {
  "type-check-operator": "satisfies",
  "type-assertion": "as",
  "type-level-string-construction": "template-literal-type",
  "generic-inference-control": "const-type-parameter",
  "runtime-decorator": "decorator",
};

console.log(Object.values(roles).join(","));
```

### `typeOnlyRuntimeBoundary.ts`

```ts
// Goal:
// Classify modern features by runtime existence.

// Expected result:
// The file compiles and prints the runtime feature names.

export {};

type FeatureBoundary = {
  featureName: string;
  typeOnly: boolean;
};

const satisfiesBoundary = {
  featureName: "satisfies",
  typeOnly: true,
} satisfies FeatureBoundary;

const decoratorBoundary = {
  featureName: "decorator",
  typeOnly: false,
} satisfies FeatureBoundary;

const runtimeFeatures = [satisfiesBoundary, decoratorBoundary].filter((item) => {
  return !item.typeOnly;
});

console.log(runtimeFeatures.map((item) => item.featureName).join(","));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 新特性越多越高级 | 新特性只有在解决具体问题时才值得用。 |
| `satisfies`、`as`、类型注解差不多 | 三者对检查和推导的影响不同。 |
| decorators 是纯类型功能 | decorators 会影响运行时代码。 |

---

## 6. 01：`satisfies` 和类型注解的区别

### 结论

`const value: Type = ...` 会让变量被目标类型接管；`const value = ... satisfies Type` 会检查表达式满足目标类型，但保留表达式自身更精确的推导。

### `satisfiesPreservesLiteral.ts`

```ts
// Goal:
// Check an object shape while preserving precise property inference.

// Expected result:
// palette.primary keeps string methods and danger keeps tuple access.

export {};

type ColorName = "primary" | "danger" | "success";
type ColorValue = string | readonly [number, number, number];

const palette = {
  primary: "#0055ff",
  danger: [255, 0, 0],
  success: "#00aa55",
} satisfies Record<ColorName, ColorValue>;

console.log(palette.primary.toUpperCase());
console.log(palette.danger[0].toFixed(0));
```

### `annotationWidensAccess.ts`

```ts
// Goal:
// Show how a direct annotation can widen property access.

// Expected result:
// The compiler rejects direct string method access on a union value.

export {};

type ColorName = "primary" | "danger" | "success";
type ColorValue = string | readonly [number, number, number];

const palette: Record<ColorName, ColorValue> = {
  primary: "#0055ff",
  danger: [255, 0, 0],
  success: "#00aa55",
};

// @ts-expect-error: palette.primary is viewed as ColorValue.
console.log(palette.primary.toUpperCase());
```

### `satisfiesReadOrder.ts`

```ts
// Goal:
// Read a satisfies expression from source inference to target checking.

// Expected result:
// The exact property type is still available after the shape check.

export {};

type RouteName = "home" | "product";

type RouteConfig = {
  path: string;
  requiresAuth: boolean;
};

const routes = {
  home: { path: "/", requiresAuth: false },
  product: { path: "/products/:id", requiresAuth: false },
} satisfies Record<RouteName, RouteConfig>;

const homePath = routes.home.path;

console.log(homePath.toUpperCase());
```

### 执行过程

| 步骤 | `satisfies` | 类型注解 |
|---|---|---|
| 1 | 先推导表达式自身类型 | 变量被指定成目标类型 |
| 2 | 再检查是否满足目标类型 | 表达式要赋值给目标类型 |
| 3 | 保留具体属性类型 | 访问属性时看到目标类型 |
| 4 | 适合配置表 | 适合主动限制变量使用范围 |

---

## 7. 02：`satisfies` 和 `as` 断言的区别

### 结论

`as` 可以绕过检查；`satisfies` 会执行检查。`as` 是“相信我”；`satisfies` 是“帮我验证”。

### `satisfiesChecksShape.ts`

```ts
// Goal:
// Use satisfies to catch missing and extra configuration keys.

// Expected result:
// The compiler rejects a misspelled key.

export {};

type RouteName = "home" | "product" | "cart";

type RouteConfig = {
  path: string;
  requiresAuth: boolean;
};

const routes = {
  home: { path: "/", requiresAuth: false },
  product: { path: "/products/:id", requiresAuth: false },
  // @ts-expect-error: checkout is not part of RouteName.
  checkout: { path: "/checkout", requiresAuth: true },
} satisfies Record<RouteName, RouteConfig>;

console.log(routes.home.path);
```

### `assertionCanLie.ts`

```ts
// Goal:
// Show that assertion can hide an incorrect runtime shape.

// Expected result:
// This compiles, but it is unsafe.

export {};

type ProductConfig = {
  title: string;
  priceCents: number;
};

const config = {
  title: "Keyboard",
} as ProductConfig;

console.log(config.priceCents);
```

### `assertionRuntimeBoundary.ts`

```ts
// Goal:
// Show that an assertion does not create missing runtime fields.

// Expected result:
// The asserted field is still missing at runtime.

export {};

type ProductConfig = {
  title: string;
  priceCents: number;
};

const source = {
  title: "Keyboard",
};

const config = source as ProductConfig;

console.log("priceCents" in config);
```

---

## 8. 03：Template Literal Types 基础

### 结论

Template Literal Types 在类型位置拼接字符串字面量类型。插入 union 时，会生成所有可能的字符串组合。

### `routeNameType.ts`

```ts
// Goal:
// Build route names from string literal types.

// Expected result:
// The compiler only accepts generated route names.

export {};

type ResourceName = "product" | "user" | "order";
type RouteAction = "list" | "detail";

type RouteName = `${ResourceName}:${RouteAction}`;

const routeName: RouteName = "product:detail";

// @ts-expect-error: archive is not part of RouteAction.
const brokenRouteName: RouteName = "product:archive";

console.log(routeName);
console.log(brokenRouteName);
```

### `unionExpansion.ts`

```ts
// Goal:
// Observe cross multiplication of unions in template literal types.

// Expected result:
// LocaleMessageId is generated from all combinations.

export {};

type Locale = "en" | "ja";
type MessageKey = "home.title" | "product.title";

type LocaleMessageId = `${Locale}.${MessageKey}`;

const messageId: LocaleMessageId = "en.product.title";

// @ts-expect-error: fr is not part of Locale.
const brokenMessageId: LocaleMessageId = "fr.product.title";

console.log(messageId);
console.log(brokenMessageId);
```

### `templateLiteralTypeVsRuntimeString.ts`

```ts
// Goal:
// Distinguish a template literal type from a runtime template string.

// Expected result:
// A runtime string is not automatically a finite route union.

export {};

type RouteSegment = "products" | "cart";
type StaticRoute = `/${RouteSegment}`;

function buildRoute(segment: string): string {
  return `/${segment}`;
}

const staticRoute: StaticRoute = "/products";
const runtimeRoute = buildRoute("products");

// @ts-expect-error: runtimeRoute is string, not StaticRoute.
const routeFromRuntime: StaticRoute = runtimeRoute;

console.log(staticRoute, routeFromRuntime);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| Template Literal Types 是运行时字符串拼接 | 它只在类型系统中生成字符串类型。 |
| 很大的字符串 union 随便生成 | 大型 union 会影响可读性和性能。 |
| 所有路径都适合类型层拼接 | 只给稳定、有限、可枚举的协议用。 |

---

## 9. 04：Template Literal Types 和对象 key 绑定

### 结论

Template Literal Types 最强的场景不是单独拼字符串，而是把事件名、字段名和对象 key 绑定起来。

### `watchedObjectEvents.ts`

```ts
// Goal:
// Connect event names to object keys with template literal types.

// Expected result:
// The callback parameter type depends on the event name.

export {};

type Watchable<ObjectType extends object> = ObjectType & {
  on<Key extends string & keyof ObjectType>(
    eventName: `${Key}Changed`,
    callback: (value: ObjectType[Key]) => void,
  ): void;
};

declare function makeWatchable<ObjectType extends object>(
  objectValue: ObjectType,
): Watchable<ObjectType>;

const product = makeWatchable({
  title: "Keyboard",
  priceCents: 9900,
});

product.on("titleChanged", (value) => {
  console.log(value.toUpperCase());
});

product.on("priceCentsChanged", (value) => {
  console.log(value.toFixed(0));
});

// @ts-expect-error: stock is not a key of product.
product.on("stockChanged", () => {});
```

### `eventPayloadMapping.ts`

```ts
// Goal:
// Derive event topics from an event map.

export {};

type EventMap = {
  productCreated: { id: string; title: string };
  productDeleted: { id: string };
};

type EventName = keyof EventMap;
type EventTopic<Name extends EventName> = `store.${Name}`;

function publish<Name extends EventName>(
  topic: EventTopic<Name>,
  payload: EventMap[Name],
): void {
  console.log(topic, payload);
}

publish("store.productCreated", {
  id: "p1",
  title: "Keyboard",
});

publish(
  "store.productDeleted",
  // @ts-expect-error: productDeleted payload does not include title.
  { id: "p1", title: "Keyboard" },
);
```

### `keyPayloadBindingReadOrder.ts`

```ts
// Goal:
// Read the relationship between an object key, event name, and payload type.

// Expected result:
// The payload type follows the selected key.

export {};

type ProductRecord = {
  title: string;
  priceCents: number;
};

type ChangeEvent<ObjectType, Key extends string & keyof ObjectType> = {
  eventName: `${Key}Changed`;
  payload: ObjectType[Key];
};

type TitleChanged = ChangeEvent<ProductRecord, "title">;

const event: TitleChanged = {
  eventName: "titleChanged",
  payload: "Keyboard",
};

// @ts-expect-error: title payload must be string.
const brokenEvent: TitleChanged = { eventName: "titleChanged", payload: 9900 };

console.log(event.payload.toUpperCase(), brokenEvent.payload);
```

---

## 10. 05：`const` type parameters

### 结论

`const` type parameter 让泛型函数在调用点保留更精确的字面量类型，不需要调用者总是手动写 `as const`。

### `tupleInferenceBefore.ts`

```ts
// Goal:
// Show the widened inference before const type parameters.

// Expected result:
// MenuItem becomes string, so any string is accepted.

export {};

function defineMenu<Items extends string[]>(items: Items): Items {
  return items;
}

const menu = defineMenu(["home", "product", "cart"]);

type MenuItem = (typeof menu)[number];

const activeItem: MenuItem = "checkout";

console.log(activeItem);
```

### `constTypeParameter.ts`

```ts
// Goal:
// Preserve literal tuple inference with a const type parameter.

// Expected result:
// The inferred value is a readonly tuple.

export {};

function defineMenu<const Items extends readonly string[]>(items: Items): Items {
  return items;
}

const menu = defineMenu(["home", "product", "cart"]);

type MenuItem = (typeof menu)[number];

const activeItem: MenuItem = "product";

// @ts-expect-error: checkout is not part of the inferred menu tuple.
const brokenItem: MenuItem = "checkout";

console.log(activeItem);
console.log(brokenItem);
```

### `readonlyConstraintMistake.ts`

```ts
// Goal:
// Use readonly constraints when preserving literal arrays.

// Expected result:
// The readonly constraint accepts const-like inferred tuples.

export {};

function defineRoutes<const Routes extends readonly string[]>(routes: Routes): Routes {
  return routes;
}

const routes = defineRoutes(["/", "/products", "/cart"]);

console.log(routes[0]);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `const` type parameter 会让运行时值冻结 | 它只影响类型推导，不调用 `Object.freeze`。 |
| 所有泛型都加 `const` | 只在需要保留字面量和 tuple 信息时使用。 |
| constraint 写成 mutable array | 优先写 `readonly string[]` 这种可接受 const-like 推导的约束。 |

---

## 11. 06：标准 decorators 基础

### 结论

标准 decorators 是运行时语法，不是纯类型工具。方法装饰器接收原方法和 context，可以返回替换方法。

### `loggedMethodDecorator.ts`

```ts
// Goal:
// Write a well-typed standard method decorator.

// Expected result:
// The decorated method keeps its this, args, and return types.

export {};

function loggedMethod<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const methodName = String(context.name);

  function replacementMethod(this: This, ...args: Args): Return {
    console.log(`enter:${methodName}`);
    const result = target.call(this, ...args);
    console.log(`exit:${methodName}`);
    return result;
  }

  return replacementMethod;
}

class ProductService {
  @loggedMethod
  loadTitle(id: string): string {
    return `product:${id}`;
  }
}

const service = new ProductService();

console.log(service.loadTitle("p1"));
```

### `boundMethodDecorator.ts`

```ts
// Goal:
// Bind a method to its instance with addInitializer.

// Expected result:
// Passing the method keeps the instance receiver.

export {};

function bound<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
): void {
  const methodName = context.name;

  if (context.private) {
    throw new Error("Private methods are not supported");
  }

  context.addInitializer(function (this: This) {
    const receiver = this as Record<PropertyKey, unknown>;
    receiver[methodName] = target.bind(this);
  });
}

class ProductController {
  private readonly prefix = "product";

  @bound
  render(id: string): string {
    return `${this.prefix}:${id}`;
  }
}

const controller = new ProductController();
const render = controller.render;

console.log(render("p1"));
```

### `decoratorRuntimeBoundary.ts`

```ts
// Goal:
// Show that a standard decorator is called at runtime.

// Expected result:
// The decorator wraps the original method.

export {};

function trace<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const methodName = String(context.name);

  return function replacement(this: This, ...args: Args): Return {
    console.log(`trace:${methodName}`);
    return target.call(this, ...args);
  };
}

class ProductReporter {
  @trace
  report(id: string): string {
    return `report:${id}`;
  }
}

const reporter = new ProductReporter();

console.log(reporter.report("p1"));
```

---

## 12. 07：标准 decorators 和 legacy decorators 差异

### 结论

标准 decorators 和 legacy decorators 不是同一套模型。legacy decorators 依赖 `experimentalDecorators`；标准 decorators 默认语义使用新的 value/context 形态，且不兼容 `emitDecoratorMetadata` 和参数装饰器。

### `decoratorModeNotes.md`

```txt
Standard decorators:
  use value and context.
  can use addInitializer.
  have different emit and type checking.

Legacy decorators:
  use experimentalDecorators.
  commonly appear in older Angular or NestJS code.
  may rely on emitDecoratorMetadata.
  are not the same API shape as standard decorators.

Migration rule:
  Do not rewrite a framework decorator system until you know which decorator mode the framework expects.
```

### `legacyMigrationBoundary.ts`

```ts
// Goal:
// Keep framework decorator mode as an explicit migration boundary.

// Expected result:
// This file records the decision as typed data.

export {};

type DecoratorMode = "standard" | "legacy";

type FrameworkDecoratorDecision = {
  frameworkName: string;
  mode: DecoratorMode;
  reason: string;
};

const decision: FrameworkDecoratorDecision = {
  frameworkName: "example-framework",
  mode: "legacy",
  reason: "The framework expects legacy metadata behavior.",
};

console.log(decision.mode);
```

### `decoratorContextShape.ts`

```ts
// Goal:
// Record the standard method decorator context fields used in this chapter.

// Expected result:
// The file compiles and prints the context field names.

export {};

type UsedContextField = "name" | "private" | "static" | "addInitializer";

const fields: UsedContextField[] = [
  "name",
  "private",
  "static",
  "addInitializer",
];

console.log(fields.join(","));
```

---

## 13. 08：小项目整合

### 结论

本章小项目要用现代特性做一个类型安全的路由和事件配置层：`satisfies` 检查配置表，Template Literal Types 生成事件名，`const` type parameters 保留调用点字面量，decorator 记录方法调用。

### `routes.ts`

```ts
// Goal:
// Define route names with satisfies and template literal types.

export type PageName = "home" | "product" | "cart";
export type RouteName = `page:${PageName}`;

export type RouteConfig = {
  path: string;
  requiresAuth: boolean;
};

export const routes = {
  "page:home": { path: "/", requiresAuth: false },
  "page:product": { path: "/products/:id", requiresAuth: false },
  "page:cart": { path: "/cart", requiresAuth: true },
} satisfies Record<RouteName, RouteConfig>;
```

### `events.ts`

```ts
// Goal:
// Connect event names to payloads.

export type AppEventMap = {
  routeChanged: { routeName: string };
  configLoaded: { count: number };
};

export type AppTopic<Name extends keyof AppEventMap> = `app.${Name}`;

export function publish<Name extends keyof AppEventMap>(
  topic: AppTopic<Name>,
  payload: AppEventMap[Name],
): void {
  console.log(topic, payload);
}
```

### `config.ts`

```ts
// Goal:
// Preserve literal array members with const type parameters.

export function defineEnabledRoutes<const Routes extends readonly string[]>(
  routes: Routes,
): Routes {
  return routes;
}
```

### `decorators.ts`

```ts
// Goal:
// Export a standard method decorator.

export function logged<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const methodName = String(context.name);

  return function replacement(this: This, ...args: Args): Return {
    console.log(`call:${methodName}`);
    return target.call(this, ...args);
  };
}
```

### `app.ts`

```ts
// Goal:
// Use the modern feature mini project.

import { defineEnabledRoutes } from "./config.js";
import { logged } from "./decorators.js";
import { publish } from "./events.js";
import { routes } from "./routes.js";

const enabledRoutes = defineEnabledRoutes([
  "page:home",
  "page:product",
] as const);

class Router {
  @logged
  open(routeName: (typeof enabledRoutes)[number]): string {
    publish("app.routeChanged", { routeName });
    return routes[routeName].path;
  }
}

const router = new Router();

console.log(router.open("page:home"));
```

---

## 14. 最终文件清单

```txt
typescript/
  modern-ts-features/
    README.md
    package.json
    00-feature-problem-model/
      featureBoundaryOverview.ts
      syntaxRoleBoundary.ts
      typeOnlyRuntimeBoundary.ts
    01-satisfies-vs-annotation/
      satisfiesPreservesLiteral.ts
      annotationWidensAccess.ts
      satisfiesReadOrder.ts
    02-satisfies-vs-assertion/
      satisfiesChecksShape.ts
      assertionCanLie.ts
      assertionRuntimeBoundary.ts
    03-template-literal-types/
      routeNameType.ts
      unionExpansion.ts
      templateLiteralTypeVsRuntimeString.ts
    04-template-literal-key-binding/
      watchedObjectEvents.ts
      eventPayloadMapping.ts
      keyPayloadBindingReadOrder.ts
    05-const-type-parameters/
      tupleInferenceBefore.ts
      constTypeParameter.ts
      readonlyConstraintMistake.ts
    06-standard-decorators/
      loggedMethodDecorator.ts
      boundMethodDecorator.ts
      decoratorRuntimeBoundary.ts
    07-standard-vs-legacy-decorators/
      decoratorModeNotes.md
      legacyMigrationBoundary.ts
      decoratorContextShape.ts
    08-mini-project/
      routes.ts
      events.ts
      config.ts
      decorators.ts
      app.ts
```

---

## 15. 最终学习笔记转换要求

最终笔记必须包含这些对比：

```txt
type annotation vs satisfies
satisfies vs as assertion
literal inference vs widened inference
template literal type vs template literal string
string union vs generated event name
generic type parameter vs const type parameter
as const vs const type parameter
standard decorator vs legacy decorator
decorator type checking vs decorator runtime execution
```

---

## 16. 本章最终要能回答的问题

1. `satisfies` 解决什么问题？
2. `satisfies` 为什么不会像普通类型注解那样丢失具体属性类型？
3. `satisfies` 和 `as` 的安全性差异是什么？
4. Template Literal Types 是运行时功能还是类型系统功能？
5. union 放进模板字面量类型里会发生什么？
6. 为什么大型字符串 union 不应该无限扩张？
7. 如何把对象 key 和事件名绑定起来？
8. `const` type parameter 和 `as const` 的关系是什么？
9. `const` type parameter 会不会冻结运行时对象？
10. 标准 decorators 为什么不是纯类型功能？
11. 标准 decorators 和 legacy decorators 有哪些关键差异？
12. 什么时候应该避免 decorators？
13. 这些现代特性如何服务于真实项目里的路由、事件、配置和框架边界？

---

## 17. 最终记忆模型

```txt
satisfies:
  check target shape
  preserve source inference
  safer than assertion

template literal types:
  construct string literal types
  cross multiply unions
  bind string protocols to object keys

const type parameters:
  preserve call-site literal information
  reduce as const noise
  useful for library-style helpers

standard decorators:
  runtime functions
  use value and context
  differ from legacy experimental decorators
```

### 最终一句话

现代 TypeScript 特性不是为了写更花的类型，而是为了在不牺牲推导精度、不扩散断言、不手写重复字符串协议的前提下，把配置、路由、事件、泛型工具和类方法边界建模得更稳。

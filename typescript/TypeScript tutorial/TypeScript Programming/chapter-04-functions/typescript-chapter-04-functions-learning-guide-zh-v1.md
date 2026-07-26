# TypeScript 第 4 章“函数”学习指导文件 v1

> 定位：这是 TypeScript 第 4 章“函数”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察编译错误或运行输出，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 4 章“函数”，TypeScript 官方 Handbook 的 More on Functions、Generics、Type Inference、Iterators and Generators，以及 TSConfig 官方文档中的 `strictFunctionTypes`、`strictBindCallApply`、`noImplicitThis`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解 JavaScript 函数的运行时行为，再理解 TypeScript 如何描述函数的调用方式、参数关系、返回值关系和泛型关系。不要把函数类型学成“给函数参数加冒号”。

> 本版补全：已按 TypeScript 官方文档核对函数类型表达式、调用签名、构造签名、可选参数、默认参数、剩余参数、函数重载、`this` 参数、`void` 返回值、泛型函数、泛型约束、泛型推导、上下文类型推导、迭代器相关类型和严格函数配置。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 函数类型表达式、调用签名、构造签名、泛型函数、可选参数、函数重载、`this` 参数、`void`、`Function`、剩余参数 | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| 泛型函数、泛型接口、泛型类、泛型约束、泛型参数默认值 | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| 上下文类型推导（contextual typing） | [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html) |
| 可迭代对象、`Iterable<T>`、`for...of` | [Iterators and Generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html) |
| `call`、`apply`、`bind` 参数检查 | [TSConfig strictBindCallApply](https://www.typescriptlang.org/tsconfig/strictBindCallApply.html) |
| `this` 隐式 `any` 检查 | [TSConfig noImplicitThis](https://www.typescriptlang.org/tsconfig/noImplicitThis.html) |
| 函数参数更严格检查 | [TSConfig strictFunctionTypes](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 4 章完整学习顺序](#3-第-4-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：JavaScript 函数值和 TypeScript 函数类型](#5-00javascript-函数值和-typescript-函数类型)
6. [01：声明和调用函数](#6-01声明和调用函数)
7. [02：参数类型和返回值类型](#7-02参数类型和返回值类型)
8. [03：可选参数和默认参数](#8-03可选参数和默认参数)
9. [04：剩余参数和展开实参](#9-04剩余参数和展开实参)
10. [05：call、apply 和 bind](#10-05callapply-和-bind)
11. [06：注解 this 的类型](#11-06注解-this-的类型)
12. [07：生成器函数](#12-07生成器函数)
13. [08：迭代器和 Iterable](#13-08迭代器和-iterable)
14. [09：函数类型表达式](#14-09函数类型表达式)
15. [10：调用签名](#15-10调用签名)
16. [11：构造签名补充](#16-11构造签名补充)
17. [12：上下文类型推导](#17-12上下文类型推导)
18. [13：函数类型重载](#18-13函数类型重载)
19. [14：多态和泛型函数](#19-14多态和泛型函数)
20. [15：什么时候绑定泛型](#20-15什么时候绑定泛型)
21. [16：可以在什么地方声明泛型](#21-16可以在什么地方声明泛型)
22. [17：泛型推导](#22-17泛型推导)
23. [18：泛型别名](#23-18泛型别名)
24. [19：受限的多态](#24-19受限的多态)
25. [20：泛型默认类型](#25-20泛型默认类型)
26. [21：类型驱动开发](#26-21类型驱动开发)
27. [22：小项目整合](#27-22小项目整合)
28. [最终文件清单](#28-最终文件清单)
29. [最终学习笔记转换要求](#29-最终学习笔记转换要求)
30. [本章最终要能回答的问题](#30-本章最终要能回答的问题)
31. [TS 官方文档阅读清单](#31-ts-官方文档阅读清单)
32. [第 4 章最终记忆模型](#32-第-4-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个写函数、标注函数类型、触发类型检查、解释函数类型机制的训练指导。

函数这一章必须同时观察两件事：

```txt
JavaScript 运行时：
函数是值，可以被调用，可以作为参数传递，可以绑定 this，可以返回值，也可以不返回值。

TypeScript 编译期：
函数类型描述这个函数如何被调用、参数之间有什么关系、返回值与输入有什么关系。
```

函数类型不是只给参数写 `: string`。函数类型的核心是：

```txt
call shape
  -> 这个函数能用什么参数调用

return shape
  -> 这个函数调用后会得到什么类型

type relation
  -> 输入类型和输出类型之间是否有关联

context
  -> 调用位置能不能反向推导参数类型

polymorphism
  -> 同一个函数能不能保留不同调用者的具体类型
```

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. 先读结论。
2. 区分本节概念属于 syntax、runtime behavior、type system 还是 object model。
3. 创建对应目录。
4. 写一个正确示例文件。
5. 写一个错误示例文件，优先用 @ts-expect-error 标记预期错误。
6. 运行 npx tsc --noEmit 做类型检查。
7. 如果示例有运行时输出，再编译并用 node 运行。
8. 对照执行过程表格解释每一步。
9. 把本节整理进最终学习笔记。
```

### 推荐运行环境

继续使用第 3 章建立的 `typescript/` 学习环境。第 4 章建议在 `tsconfig.json` 里显式加入函数相关严格检查：

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
    "strictBindCallApply": true,
    "strictNullChecks": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

注意：`strict` 已经包含这些严格检查中的大部分。这里显式写出，是为了让你知道第 4 章正在训练哪些函数相关检查。

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
// Verify how this TypeScript function example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`export {};` 的作用是把文件变成模块（module），防止不同练习文件里的同名变量污染全局作用域。

### 本章学习要求

每个函数类型点都必须回答：

```txt
它描述的是函数值，还是函数调用方式？
它在运行时是否存在？
它会不会改变 JavaScript 函数执行规则？
参数类型和返回值类型之间有没有关系？
TypeScript 是从声明处推导，还是从调用处推导？
这个函数适合用普通函数、箭头函数、函数表达式、方法，还是生成器？
什么时候应该使用泛型？
什么时候泛型是多余的？
什么时候应该用联合类型替代重载？
这个点在 React props、事件处理、API 工具函数、表单回调、数组方法中怎么出现？
```

---



### 本章第一次遇到的符号和机制必须先讲清

第 4 章比第 3 章更容易让人断掉，因为同一个符号在不同上下文里含义不同。你不能只看符号本身，必须看它所在的位置。

| 写法 | 在哪里出现 | 技术含义 | 是否运行时存在 | 先记住的结论 |
|---|---|---|---|---|
| `=>` | 函数类型表达式 | 左边是参数类型，右边是返回值类型 | 否 | `(x: string) => number` 描述调用合同，不创建函数。 |
| `=>` | 箭头函数表达式 | 创建 JavaScript 函数值 | 是 | `(x) => x.length` 是运行时函数。 |
| `<...>` | 泛型函数或泛型类型 | 传入或声明类型参数 | 否 | 它是给 generic 填类型，不是 object 专用。 |
| `...` | 函数声明参数位置 | rest parameter，收集多个实参 | 是 | `...items: string[]` 把多个实参收成数组。 |
| `...` | 函数调用实参位置 | spread argument，展开数组或元组 | 是 | `fn(...tuple)` 把一个数组/元组展开成多个实参。 |
| `this: Type` | 函数第一个参数位置 | TypeScript 专用 this 参数 | 否 | 它不占运行时参数位置，只给 checker 看。 |
| `function*` | 函数声明 | 创建生成器函数 | 是 | 调用后返回 generator object，不立即执行函数体。 |
| `yield` | 生成器函数体 | 暂停并产出一个值 | 是 | `next(value)` 的参数会回到上一个暂停的 `yield` 表达式。 |
| `new (...) => Type` | 构造签名 | 描述可以被 `new` 调用的值 | 否 | 它描述 constructable value，不创建类。 |
| `extends` | 泛型约束 | 限制类型参数必须满足某种结构 | 否 | 这里不是 class inheritance，而是 assignability constraint。 |
| `void` | 函数返回类型 | 调用方不应该使用返回值 | 否 | `void` 不等于函数运行时一定不能返回值。 |

#### `=>`：函数类型里的箭头不是箭头函数

先看函数类型表达式：

```ts
// Goal:
// Distinguish a function type expression from an arrow function value.

export {};

type StringLengthGetter = (inputText: string) => number;

const getStringLength: StringLengthGetter = (inputText) => {
  return inputText.length;
};

console.log(getStringLength("TypeScript"));
```

这段代码里有两个 `=>`，但它们不是同一层东西：

| 代码 | 所属层级 | 含义 |
|---|---|---|
| `type StringLengthGetter = (inputText: string) => number` | TypeScript type system | 描述函数必须接收 `string` 并返回 `number`。 |
| `const getStringLength = (inputText) => { ... }` | JavaScript runtime | 创建一个真实箭头函数值。 |

函数类型表达式里的 `=> number` 不是函数体。它的意思是“返回值类型是 `number`”。

箭头函数里的 `=> { ... }` 或 `=> expression` 才是 JavaScript 运行时语法。

判断方式：

```txt
出现在 type alias、参数类型、变量类型注解里：
  多半是函数类型表达式。

出现在等号右边、能执行函数体：
  是箭头函数表达式。
```

#### `<...>`：给 generic 填类型，不是 object 专用

第 4 章会大量出现：

```ts
// Goal:
// Show the basic model of generic type arguments.

export {};

function wrapValue<ValueType>(value: ValueType): { value: ValueType } {
  return { value };
}

const wrappedTitle = wrapValue<string>("Keyboard");
const wrappedCount = wrapValue<number>(12);

console.log(wrappedTitle.value.toUpperCase());
console.log(wrappedCount.value.toFixed(1));
```

这里有两类 `<...>`：

| 写法 | 含义 |
|---|---|
| `wrapValue<ValueType>` | 声明这个函数有一个类型参数，名字叫 `ValueType`。 |
| `wrapValue<string>("Keyboard")` | 调用时把 `ValueType` 填成 `string`。 |
| `wrapValue<number>(12)` | 调用时把 `ValueType` 填成 `number`。 |

泛型不是只给 object 用。最终是不是 object，取决于 generic 自己生成什么类型：

```txt
Array<string>
  -> array type

Promise<number>
  -> promise type

Record<string, unknown>
  -> object-shaped type

(value: T) => T
  -> function type relationship
```

所以准确模型是：

```txt
<...>:
  pass type arguments to a generic type or generic function.

The result:
  depends on the generic being used.
```

#### `...`：rest parameter 和 spread argument 必须按位置区分

```ts
// Goal:
// Compare rest parameters and spread arguments.

export {};

function createLabel(...parts: string[]): string {
  return parts.join("-");
}

const labelParts = ["order", "paid"] as const;

console.log(createLabel("order", "created"));
console.log(createLabel(...labelParts));
```

同样是 `...`：

| 位置 | 写法 | 含义 |
|---|---|---|
| 函数声明侧 | `...parts: string[]` | 把调用者传进来的多个实参收集成数组。 |
| 函数调用侧 | `...labelParts` | 把数组或元组展开成多个实参。 |

这两个是 JavaScript 运行时行为，TypeScript 只是检查 rest / spread 的类型是否匹配。

#### `this: Type`：TypeScript fake parameter

```ts
// Goal:
// Show that a this parameter is not a runtime parameter.

export {};

type ProductContext = {
  title: string;
};

function readProductTitle(this: ProductContext, prefixText: string): string {
  return `${prefixText}:${this.title}`;
}

console.log(readProductTitle.call({ title: "Keyboard" }, "product"));
console.log(readProductTitle.length);
```

`this: ProductContext` 只给 TypeScript checker 看。运行时函数实际只有一个普通参数 `prefixText`，所以 `readProductTitle.length` 是 `1`，不是 `2`。

#### `void`：不使用返回值，不等于运行时不能返回值

```ts
// Goal:
// Show how a void callback type ignores a returned value.

export {};

type SaveHandler = () => void;

const saveHandler: SaveHandler = () => {
  return "saved";
};

const resultValue = saveHandler();

console.log(resultValue);
```

这个例子很反直觉：一个返回 `string` 的函数可以赋值给 `() => void` 类型。原因是 `void` 在回调上下文里表达的是：

```txt
The caller should ignore the return value.
```

它不是运行时强制函数不能返回值。`resultValue` 在 TypeScript 里是 `void`，但运行时仍然可能打印真实返回值。这是第 4 章必须单独记住的函数类型规则。

#### 本章判断符号含义的固定顺序

看到一个陌生函数相关符号时，先问：

```txt
1. 它在声明侧，还是调用侧？
2. 它是 TypeScript 类型语法，还是 JavaScript 运行时语法？
3. 它会不会出现在编译后的 JavaScript 里？
4. 它描述的是函数值，还是函数调用方式？
```


## 2. 项目重新整理建议

### 结论

第 4 章建议单独建立：

```txt
typescript/chapter-04-functions/
```

不要把函数训练混进 `chapter-03-types/`。第 3 章训练的是“值的类型建模”，第 4 章训练的是“行为边界和类型关系建模”。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json

  chapter-03-types/
    README.md
    ...

  chapter-04-functions/
    README.md

    00-function-values-and-function-types/
      functionValueVsFunctionType.ts

    01-declare-and-call-functions/
      functionDeclarationAndCall.ts
      argumentCountCheck.ts

    02-parameter-and-return-types/
      parameterReturnAnnotation.ts
      returnInferenceBoundary.ts

    03-optional-default-parameters/
      optionalParameter.ts
      defaultParameter.ts
      optionalCallbackMistake.ts

    04-rest-parameters/
      restParameter.ts
      tupleRestParameter.ts
      restArgumentConstTuple.ts

    05-call-apply-bind/
      callApplyBindRuntime.ts
      strictBindCallApplyCheck.ts
      arrowThisCallMistake.ts

    06-this-parameter/
      thisParameterCallback.ts
      noImplicitThisMistake.ts
      arrowFunctionThisMistake.ts

    07-generator-functions/
      generatorFunctionBasics.ts
      typedGenerator.ts

    08-iterables/
      iterableParameter.ts
      iteratorResultTyping.ts

    09-function-type-expressions/
      callbackTypeExpression.ts
      namedCallbackType.ts

    10-call-signatures/
      callableObject.ts
      functionWithProperty.ts

    11-construct-signatures/
      constructorSignature.ts
      callOrConstructSignature.ts

    12-contextual-typing/
      arrayMapContextualTyping.ts
      eventHandlerContextualTyping.ts

    13-function-overloads/
      overloadSignatures.ts
      unionInsteadOfOverload.ts
      overloadImplementationMistake.ts

    14-generic-functions/
      identityGeneric.ts
      firstElementGeneric.ts
      mapGeneric.ts

    15-when-to-bind-generics/
      functionLevelGeneric.ts
      typeLevelGeneric.ts

    16-where-to-declare-generics/
      genericCallSignature.ts
      genericInterface.ts

    17-generic-inference/
      inferredTypeArgument.ts
      explicitTypeArgument.ts

    18-generic-type-aliases/
      ResultTypeAlias.ts
      MapperTypeAlias.ts

    19-constrained-polymorphism/
      lengthConstraint.ts
      constraintReturnMistake.ts

    20-generic-defaults/
      apiResponseDefault.ts

    21-type-driven-development/
      typeFirstFormatter.ts
      typeFirstFetcher.ts

    22-mini-project/
      typedEventEmitter.ts
      typedPipeline.ts
```

### 为什么这样拆

```txt
chapter-04-functions/
  保存函数机制训练。

每个小目录：
  对应一个函数类型能力。
  每个文件只验证一个关键机制。
  错误示例必须能解释具体规则。

notes/typescript.md：
  最终总结函数类型模型。
```

### 和后续 React / Node / Next.js 的关系

第 4 章是你进入现代前端工程的关键桥梁：

```txt
React props
  -> 组件接收函数 prop，例如 onClick、onSubmit、renderItem。

React hooks
  -> useState、useMemo、useCallback、custom hook 都依赖函数类型和泛型。

API 工具函数
  -> fetch wrapper、parser、formatter 都依赖参数和返回值类型。

Node.js
  -> 回调、事件监听器、流处理都依赖函数签名。

Next.js
  -> server actions、route handlers、data fetching 都依赖函数边界建模。
```

---

## 3. 第 4 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
函数值和函数类型
  -> 声明和调用函数
  -> 参数类型和返回值类型
  -> 可选参数和默认参数
  -> 剩余参数和展开实参
  -> call / apply / bind
  -> this 参数
  -> 生成器函数
  -> 迭代器和 Iterable
  -> 函数类型表达式
  -> 调用签名
  -> 构造签名
  -> 上下文类型推导
  -> 函数重载
  -> 多态和泛型函数
  -> 什么时候绑定泛型
  -> 泛型声明位置
  -> 泛型推导
  -> 泛型别名
  -> 受限多态
  -> 泛型默认类型
  -> 类型驱动开发
  -> 小项目整合
```

### 技术意义

第 3 章让你能描述“值是什么”。第 4 章让你能描述“值如何被处理”。

```txt
第 3 章：
product.price 是 number。

第 4 章：
formatPrice(product.price) 必须接收 number 并返回 string。
mapProducts(products, formatter) 的 formatter 参数类型必须和 products 的元素类型关联。
```

### 本章不是函数语法复习

你已经学过 JavaScript 函数。TypeScript 第 4 章的重点不是重新学 `function`、箭头函数和 `return`，而是理解：

```txt
函数是一种可调用值。
函数类型描述调用合同。
参数位置和返回值位置有不同的类型关系。
泛型用来保存输入与输出之间的关系。
上下文类型推导让回调函数少写类型但仍然安全。
重载只适合确实存在多种调用形状的 API。
```

---

## 4. 本章先要建立的底层模型

### 结论

TypeScript 函数类型的底层模型是：

```txt
function value
  -> can be called at runtime
  -> may have properties
  -> may have this binding
  -> may be constructed with new

function type
  -> describes allowed call signatures
  -> describes parameter types
  -> describes return type
  -> may connect input and output with generics
  -> is erased from emitted JavaScript
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| 函数值（function value） | JavaScript 运行时存在的可调用对象。 |
| 函数类型（function type） | TypeScript 编译期描述函数如何被调用的类型。 |
| 调用签名（call signature） | 描述一个值可以被调用的参数列表和返回值。 |
| 构造签名（construct signature） | 描述一个值可以被 `new` 调用。 |
| 参数类型（parameter type） | 函数接收的参数类型。 |
| 返回值类型（return type） | 函数执行后返回的值类型。 |
| 可选参数（optional parameter） | 调用时可以省略的参数，参数值可能是 `undefined`。 |
| 默认参数（default parameter） | 调用时省略或传入 `undefined` 时使用默认值的参数。 |
| 剩余参数（rest parameter） | 使用 `...` 收集不定数量实参的参数。 |
| 上下文类型推导（contextual typing） | TypeScript 根据函数出现的位置反向推断参数类型。 |
| 泛型（generic） | 使用类型参数描述多个类型位置之间的关系。 |
| 受限泛型（constrained generic） | 使用 `extends` 限制类型参数必须满足某种结构。 |
| 函数重载（function overload） | 为同一个函数声明多个外部可见调用签名。 |
| `this` 参数 | TypeScript 专用的假参数，用来声明函数体内 `this` 的类型。 |

### 底层机制总图

```txt
source code
  -> function syntax creates JavaScript function value
  -> TypeScript reads parameter and return annotations
  -> checker compares call expressions with call signatures
  -> generic inference solves type parameters from arguments
  -> contextual typing may infer callback parameter types
  -> emitter removes types
  -> runtime executes ordinary JavaScript functions
```

### 和 JavaScript 基础的关系

JavaScript 决定函数怎么运行：

```txt
参数少传 -> missing parameter is undefined
参数多传 -> extra arguments are allowed at runtime
普通函数 this -> depends on call site
箭头函数 this -> captured from outer scope
generator -> returns generator object
```

TypeScript 决定调用是否安全：

```txt
参数少传是否允许
参数多传在源码中是否报错
this 是否可能是 any
回调参数是否能被上下文推导
返回值是否符合声明
泛型输出是否保留输入类型
```

---

## 5. 00：JavaScript 函数值和 TypeScript 函数类型

### 结论

函数在 JavaScript 里是运行时值；函数类型在 TypeScript 里是编译期调用合同。

### 技术意义

这节先建立边界：TypeScript 不改变函数的运行方式，只是在函数调用前检查调用是否合法。

### 文件结构

```txt
00-function-values-and-function-types/
  functionValueVsFunctionType.ts
```

### `functionValueVsFunctionType.ts`

```ts
// Goal:
// Distinguish a runtime function value from a static function type.

// Expected result:
// The compiler accepts this file and Node prints the formatted title.

export {};

type TitleFormatter = (titleText: string) => string;

const formatProductTitle: TitleFormatter = (titleText) => {
  return titleText.trim().toUpperCase();
};

console.log(formatProductTitle(" keyboard "));
```

### 预期输出

```txt
KEYBOARD
```

### 执行过程

| 阶段 | 发生什么 |
|---|---|
| 编译期 | `TitleFormatter` 描述函数必须接收 `string` 并返回 `string`。 |
| 编译期 | TypeScript 检查箭头函数是否符合这个调用合同。 |
| 编译输出 | `TitleFormatter` 被擦除。 |
| 运行时 | JavaScript 只执行普通箭头函数。 |

### 常见错误 / 反例

```ts
// Goal:
// Show that a function type does not create a runtime function.

// Expected result:
// The compiler rejects using a type as a value.

export {};

type PriceFormatter = (priceValue: number) => string;

// @ts-expect-error: PriceFormatter is a type, not a runtime value.
console.log(PriceFormatter);
```

### 和项目开发的关系

React 里的 `onSubmit`、数组方法里的 `map` 回调、API 工具函数里的 parser，都需要你明确“函数值”和“函数类型”不是同一个东西。

---

## 6. 01：声明和调用函数

### 结论

TypeScript 会检查函数调用表达式的实参与函数声明的形参是否匹配。

### 技术意义

JavaScript 运行时允许少传和多传参数，但 TypeScript 的源码检查会根据函数签名限制调用形状。这个限制是为了在运行前发现错误调用。

### 文件结构

```txt
01-declare-and-call-functions/
  functionDeclarationAndCall.ts
  argumentCountCheck.ts
```

### `functionDeclarationAndCall.ts`

```ts
// Goal:
// Declare and call a function with typed parameters.

// Expected result:
// The compiler accepts this file and Node prints the summary.

export {};

function createOrderSummary(orderId: string, totalPrice: number): string {
  return `${orderId}: ${totalPrice}`;
}

const summaryText = createOrderSummary("order-1", 120);

console.log(summaryText);
```

### 预期输出

```txt
order-1: 120
```

### `argumentCountCheck.ts`

```ts
// Goal:
// Verify how TypeScript checks the number of arguments.

// Expected result:
// The compiler rejects the marked calls.

export {};

function createInventoryLabel(productName: string, stockCount: number): string {
  return `${productName}:${stockCount}`;
}

createInventoryLabel("keyboard", 12);

// @ts-expect-error: Missing required argument.
createInventoryLabel("keyboard");

// @ts-expect-error: Too many arguments for this function signature.
createInventoryLabel("keyboard", 12, "warehouse-a");
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 函数声明建立一个运行时函数值。 |
| 2 | 参数注解建立一个 TypeScript 调用签名。 |
| 3 | 调用表达式出现时，TypeScript 检查实参数量和类型。 |
| 4 | 编译后，参数类型被删除。 |
| 5 | Node 执行普通 JavaScript 函数。 |

### 常见错误

| 错误理解 | 正确模型 |
|---|---|
| TypeScript 会改变 JS 参数传递规则 | 不会，只做编译期检查。 |
| 多传参数在 JS 里完全不可能 | JS 运行时允许，但 TS 源码通常不允许。 |
| 少传参数会自动变成可选参数 | 少传时运行时是 `undefined`，类型上必须显式允许。 |

---

## 7. 02：参数类型和返回值类型

### 结论

函数参数是边界，应该明确标注；返回值可以推导，但公共函数和复杂函数建议显式标注。

### 技术意义

函数参数没有可靠的初始化表达式可供 TypeScript 推断，所以必须显式标注。返回值可以从 `return` 语句推断，但显式返回值能防止函数内部改动破坏外部调用者。

### 文件结构

```txt
02-parameter-and-return-types/
  parameterReturnAnnotation.ts
  returnInferenceBoundary.ts
```

### `parameterReturnAnnotation.ts`

```ts
// Goal:
// Annotate function parameters and return value.

// Expected result:
// The compiler accepts this file and Node prints the formatted price.

export {};

function formatPrice(amountValue: number, currencyCode: string): string {
  return `${currencyCode} ${amountValue.toFixed(2)}`;
}

console.log(formatPrice(29.9, "USD"));
```

### `returnInferenceBoundary.ts`

```ts
// Goal:
// Use explicit return type to protect a function boundary.

// Expected result:
// The compiler rejects the marked return value.

export {};

function calculateDiscountedPrice(priceValue: number, discountRate: number): number {
  if (discountRate <= 0) {
    return priceValue;
  }

  // @ts-expect-error: The declared return type is number.
  return `${priceValue * (1 - discountRate)}`;
}
```



### 本节必须先补：`void` 返回类型和“忽略返回值”不是一回事

这一节已经讲了参数和返回值类型，但函数章节里还有一个很容易误解的点：`void` 在函数类型里经常表示“调用方不使用返回值”，不一定表示实现函数运行时绝对不会返回任何东西。

```ts
// Goal:
// Show that a non-void function can be used where a void callback is expected.

export {};

function runTask(taskHandler: () => void): void {
  const resultValue = taskHandler();

  console.log(resultValue);
}

runTask(() => {
  return "task-finished";
});
```

逐层解释：

| 代码 | TypeScript 编译期 | JavaScript 运行时 |
|---|---|---|
| `taskHandler: () => void` | 调用方不应该依赖回调返回值 | 参数是普通函数值 |
| `return "task-finished"` | 允许，因为返回值会被上下文忽略 | 函数实际返回字符串 |
| `const resultValue = taskHandler()` | `resultValue` 的静态类型是 `void` | 实际值可能是 `"task-finished"` |

这就是为什么数组方法里经常能写：

```ts
// Goal:
// Show a callback return value in a void context.

export {};

["a", "b"].forEach((itemText) => {
  return itemText.toUpperCase();
});
```

`forEach` 不使用回调返回值，所以回调返回什么都没有业务意义。学习阶段要把两个结论分清：

```txt
(): string
  The caller expects and can use a string result.

(): void
  The caller must not rely on the result.
```

常见错误：

```txt
错误：
void means the function cannot return anything at runtime.

正确：
void means the type contract says the return value should be ignored.
```


### 常见错误 / 反例

```ts
// Goal:
// Show why missing parameter types are unsafe.

// Expected result:
// With noImplicitAny enabled, the compiler rejects the parameter.

export {};

// @ts-expect-error: Parameter has an implicit any type.
function normalizeTitle(titleText) {
  return titleText.trim().toLowerCase();
}
```

### 和项目开发的关系

在真实项目里，工具函数、API 封装、事件处理器、表单提交函数都属于边界。边界越清楚，后续 React 组件和业务模块越容易组合。

---

## 8. 03：可选参数和默认参数

### 结论

可选参数表示调用者可以省略参数；默认参数表示参数省略或为 `undefined` 时使用默认值。它们解决的问题不同。

### 技术意义

可选参数在函数体内部的类型通常包含 `undefined`。默认参数在函数体内部会被默认值替换，因此参数类型通常更具体。

### 文件结构

```txt
03-optional-default-parameters/
  optionalParameter.ts
  defaultParameter.ts
  optionalCallbackMistake.ts
```

### `optionalParameter.ts`

```ts
// Goal:
// Verify that an optional parameter may be undefined.

// Expected result:
// The compiler accepts this file and Node prints both labels.

export {};

function createPageLabel(pageTitle: string, sectionTitle?: string): string {
  if (sectionTitle === undefined) {
    return pageTitle;
  }

  return `${pageTitle} - ${sectionTitle}`;
}

console.log(createPageLabel("Settings"));
console.log(createPageLabel("Settings", "Security"));
```

### `defaultParameter.ts`

```ts
// Goal:
// Verify that a default parameter receives a fallback value.

// Expected result:
// The compiler accepts this file and Node prints the normalized limit.

export {};

function normalizePageSize(pageSize = 20): number {
  return Math.min(Math.max(pageSize, 1), 100);
}

console.log(normalizePageSize());
console.log(normalizePageSize(50));
console.log(normalizePageSize(undefined));
```

### `optionalCallbackMistake.ts`

```ts
// Goal:
// Avoid marking callback parameters optional when the caller always receives them.

// Expected result:
// The compiler accepts the correct callback type.

export {};

function visitProductNames(
  productNames: string[],
  visitor: (productName: string, index: number) => void,
): void {
  for (let index = 0; index < productNames.length; index += 1) {
    const productName = productNames[index];

    if (productName !== undefined) {
      visitor(productName, index);
    }
  }
}

visitProductNames(["keyboard", "mouse"], (productName, index) => {
  console.log(`${index}:${productName}`);
});
```



### 本节必须先补：回调参数“可以少写”和“参数可选”不是一回事

你在写回调时，经常可以少写参数：

```ts
// Goal:
// Show that a callback implementation may ignore parameters.

export {};

type ProductVisitor = (productName: string, index: number) => void;

const visitor: ProductVisitor = (productName) => {
  console.log(productName.toUpperCase());
};

visitor("Keyboard", 0);
```

这里 `(productName) => { ... }` 少写了 `index`，但 `index` 并不是可选参数。真实含义是：

```txt
函数类型 ProductVisitor:
  调用者会传 productName 和 index。

回调实现:
  可以选择不用 index。
```

错误写法是把回调类型写成：

```ts
// Goal:
// Show why optional callback parameters change the contract.

export {};

type WeakProductVisitor = (productName: string, index?: number) => void;

const visitor: WeakProductVisitor = (productName, index) => {
  if (index !== undefined) {
    console.log(`${index}:${productName}`);
  }
};
```

`index?: number` 的含义不是“实现者可以不写 index”，而是：

```txt
调用这个 visitor 的代码可以不传 index。
所以函数体里 index 可能是 undefined。
```

这会把责任放错位置。

对回调类型要这样判断：

```txt
如果 API 永远会提供某个参数：
  不要把它写成 optional parameter。

如果 API 确实可能不提供某个参数：
  才写成 optional parameter。
```


### 底层机制

```txt
optional parameter:
  caller may omit argument
  parameter may be undefined inside function

default parameter:
  caller may omit argument
  undefined is replaced by default value
  parameter body type is usually the default value type
```

### 常见错误

| 错误 | 原因 |
|---|---|
| 把回调参数写成 `index?: number` | 这表示实现方可能不传 index，不是表示调用者可以少写一个参数。 |
| 可选参数后面再放必选参数 | 调用形状会变得混乱。 |
| 以为默认参数不会接收 `undefined` | 传入 `undefined` 会触发默认值。 |

---

## 9. 04：剩余参数和展开实参

### 结论

剩余参数（rest parameter）把多个实参收集成数组或元组；展开实参（spread argument）把数组或元组展开成多个实参。

### 技术意义

剩余参数描述函数能接收不定数量参数。TypeScript 中剩余参数的类型必须是数组类型或元组类型。

### 文件结构

```txt
04-rest-parameters/
  restParameter.ts
  tupleRestParameter.ts
  restArgumentConstTuple.ts
```

### `restParameter.ts`

```ts
// Goal:
// Type a rest parameter as an array.

// Expected result:
// The compiler accepts this file and Node prints the sum.

export {};

function sumNumbers(...numberValues: number[]): number {
  return numberValues.reduce((totalValue, currentValue) => {
    return totalValue + currentValue;
  }, 0);
}

console.log(sumNumbers(1, 2, 3));
```

### `tupleRestParameter.ts`

```ts
// Goal:
// Type a rest parameter as a tuple.

// Expected result:
// The compiler accepts this file and rejects invalid argument shapes.

export {};

function createAuditLog(...entryParts: [string, "create" | "update" | "delete", number]): string {
  const [entityId, actionName, timestampValue] = entryParts;

  return `${entityId}:${actionName}:${timestampValue}`;
}

console.log(createAuditLog("product-1", "update", Date.now()));

// @ts-expect-error: The second tuple item must be a known action.
createAuditLog("product-1", "remove", Date.now());
```

### `restArgumentConstTuple.ts`

```ts
// Goal:
// Use a const tuple when spreading arguments into a fixed-parameter function.

// Expected result:
// The compiler accepts the const tuple call.

export {};

function createPointLabel(xCoordinate: number, yCoordinate: number): string {
  return `(${xCoordinate}, ${yCoordinate})`;
}

const pointPair = [10, 20] as const;

console.log(createPointLabel(...pointPair));
```



### 本节必须先补：`...` 在声明侧和调用侧完全不同

这节有两个相似写法：

```ts
// Goal:
// Compare declaration-side rest and call-side spread.

export {};

function joinLabels(...labelParts: string[]): string {
  return labelParts.join("/");
}

const tupleParts = ["settings", "security"] as const;

console.log(joinLabels("home", "profile"));
console.log(joinLabels(...tupleParts));
```

拆开看：

| 写法 | 所在位置 | 运行时动作 | TypeScript 检查 |
|---|---|---|---|
| `...labelParts: string[]` | 函数声明参数位置 | 把多个实参收集成数组 | 每个实参都应该是 `string` |
| `...tupleParts` | 函数调用实参位置 | 把数组或元组展开成多个实参 | 展开后的每一项要匹配目标参数 |

为什么普通数组展开到固定参数函数会报错？因为普通数组只表达“元素类型”，不表达“长度固定”。

```ts
// Goal:
// Compare array spread and tuple spread.

export {};

function createRangeLabel(startValue: number, endValue: number): string {
  return `${startValue}-${endValue}`;
}

const arrayValues = [1, 10];
const tupleValues = [1, 10] as const;

// @ts-expect-error: A number array does not guarantee exactly two elements.
console.log(createRangeLabel(...arrayValues));

console.log(createRangeLabel(...tupleValues));
```

这里的关键是：

```txt
number[]:
  could have zero, one, two, or many numbers.

readonly [1, 10]:
  known to have exactly two positions.

fixed-parameter function:
  needs exactly two arguments.
```


### 常见错误

```ts
// Goal:
// Show why a normal array is too wide for fixed arguments.

// Expected result:
// The compiler rejects spreading a normal number array into fixed parameters.

export {};

function createVectorLabel(xValue: number, yValue: number): string {
  return `${xValue},${yValue}`;
}

const vectorValues = [10, 20];

// @ts-expect-error: A number array may have any length.
createVectorLabel(...vectorValues);
```

---

## 10. 05：call、apply 和 bind

### 结论

`call`、`apply` 和 `bind` 是 JavaScript 函数对象的方法，用来间接调用函数或固定 `this` / 部分参数。TypeScript 通过 `strictBindCallApply` 检查它们的参数是否匹配原函数。

### 技术意义

这节连接 JavaScript 函数对象模型和 TypeScript 函数类型检查。你要同时看清：

```txt
runtime:
  call/apply/bind really change how the function is called.

type system:
  strictBindCallApply checks argument and return types.
```

### 文件结构

```txt
05-call-apply-bind/
  callApplyBindRuntime.ts
  strictBindCallApplyCheck.ts
  arrowThisCallMistake.ts
```

### `callApplyBindRuntime.ts`

```ts
// Goal:
// Verify call, apply, and bind runtime behavior.

// Expected result:
// The compiler accepts this file and Node prints formatted labels.

export {};

type PriceContext = {
  currencyCode: string;
};

function formatContextPrice(this: PriceContext, amountValue: number): string {
  return `${this.currencyCode} ${amountValue.toFixed(2)}`;
}

const usdContext: PriceContext = {
  currencyCode: "USD",
};

console.log(formatContextPrice.call(usdContext, 12.5));
console.log(formatContextPrice.apply(usdContext, [15]));
const boundFormatter = formatContextPrice.bind(usdContext);
console.log(boundFormatter(20));
```

### `strictBindCallApplyCheck.ts`

```ts
// Goal:
// Verify strict argument checking for call, apply, and bind.

// Expected result:
// The compiler rejects invalid call arguments.

export {};

function parseQuantity(quantityText: string): number {
  return Number.parseInt(quantityText, 10);
}

const validQuantity = parseQuantity.call(undefined, "10");

// @ts-expect-error: The argument must be a string.
const invalidQuantity = parseQuantity.call(undefined, false);

console.log(validQuantity);
console.log(invalidQuantity);
```

### `arrowThisCallMistake.ts`

```ts
// Goal:
// Show that call cannot replace lexical this in an arrow function.

// Expected result:
// Node prints undefined.

export {};

const productRecord = {
  productName: "Keyboard",
};

const readName = () => {
  return (globalThis as { productName?: string }).productName;
};

console.log(readName.call(productRecord));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为 `call()` 永远能改变 `this` | 箭头函数的 `this` 来自外层词法作用域，不能被 `call` 改写。 |
| 以为 `apply()` 和展开语法完全一样 | 运行效果相似，但 `apply()` 还传入 `thisArg`。 |
| 关闭 `strictBindCallApply` | 会让错误调用退回不安全的 `any`。 |


---

## 11. 06：注解 this 的类型

### 结论

TypeScript 可以用一个特殊的 `this` 参数声明函数体内 `this` 的类型。这个参数只存在于类型系统，不会出现在运行时参数列表里。

### 技术意义

JavaScript 的 `this` 由调用方式决定。TypeScript 的 `this` 参数用来让类型检查器知道函数应该被什么对象调用。

### 文件结构

```txt
06-this-parameter/
  thisParameterCallback.ts
  noImplicitThisMistake.ts
  arrowFunctionThisMistake.ts
```

### `thisParameterCallback.ts`

```ts
// Goal:
// Declare the type of this in a callback function.

// Expected result:
// The compiler accepts the function callback.

export {};

type AdminRecord = {
  id: string;
  isAdmin: boolean;
};

function filterWithThis<T>(
  items: T[],
  predicate: (this: T, item: T) => boolean,
): T[] {
  return items.filter((item) => {
    return predicate.call(item, item);
  });
}

const accounts: AdminRecord[] = [
  { id: "a", isAdmin: true },
  { id: "b", isAdmin: false },
];

const adminAccounts = filterWithThis(accounts, function (this: AdminRecord) {
  return this.isAdmin;
});

console.log(adminAccounts);
```

### `noImplicitThisMistake.ts`

```ts
// Goal:
// Verify that noImplicitThis catches unsafe this usage.

// Expected result:
// The compiler rejects the implicit this usage.

export {};

function createBrokenReader() {
  return function () {
    // @ts-expect-error: this has no declared type.
    return this.productName;
  };
}

const reader = createBrokenReader();

console.log(typeof reader);
```

### `arrowFunctionThisMistake.ts`

```ts
// Goal:
// Avoid using arrow functions when an API controls this.

// Expected result:
// The compiler rejects using this from the wrong scope.

export {};

type UserRecord = {
  id: string;
  isAdmin: boolean;
};

type UserFilter = (this: UserRecord) => boolean;

function runUserFilter(userRecord: UserRecord, filterUser: UserFilter): boolean {
  return filterUser.call(userRecord);
}

// The error is inside the arrow function body below.
runUserFilter({ id: "a", isAdmin: true }, () => {
  // @ts-expect-error: Arrow functions do not have their own this parameter.
  return this.isAdmin;
});
```



### 本节必须先补：`this` 参数为什么只能写在普通函数上

TypeScript 的 `this` 参数描述的是“这个函数被调用时，`this` 应该是什么类型”。它依赖 JavaScript 普通函数的动态 `this` 机制。

```ts
// Goal:
// Show a typed this parameter on a normal function.

export {};

type ButtonContext = {
  label: string;
};

function readButtonLabel(this: ButtonContext): string {
  return this.label.toUpperCase();
}

console.log(readButtonLabel.call({ label: "submit" }));
```

普通函数的 `this` 来自调用方式：

```txt
readButtonLabel.call({ label: "submit" })
  -> this is { label: "submit" }
```

箭头函数没有自己的 `this`，它捕获外层作用域的 `this`。所以你不能靠 `call()` 改掉箭头函数的 `this`，也不能给箭头函数声明 TypeScript 的 `this` 参数。

错误模型：

```txt
call can always change this.
```

正确模型：

```txt
call changes this for ordinary functions.
arrow functions ignore call-time this binding.
```


### 常见错误

```txt
普通函数 this:
  depends on call site.

箭头函数 this:
  captured from outer scope.

TypeScript this parameter:
  type-system-only fake parameter.
  must be written before real parameters.
```

---

## 12. 07：生成器函数

### 结论

生成器函数（generator function）调用后不会立即执行函数体，而是返回生成器对象。TypeScript 可以为生成器产出的值、最终返回值、传入 `next()` 的值分别建模。

### 技术意义

生成器函数连接了函数、迭代器和惰性求值。第 4 章学习 TS 生成器类型时，要复用你在 JS 迭代器章节建立的运行时模型。

### 文件结构

```txt
07-generator-functions/
  generatorFunctionBasics.ts
  typedGenerator.ts
```

### `generatorFunctionBasics.ts`

```ts
// Goal:
// Verify that calling a generator returns a generator object.

// Expected result:
// Node prints yielded values step by step.

export {};

function* createTaskSequence(): Generator<string, void, unknown> {
  yield "design";
  yield "build";
  yield "test";
}

const taskIterator = createTaskSequence();

console.log(taskIterator.next());
console.log(taskIterator.next());
console.log(taskIterator.next());
console.log(taskIterator.next());
```

### 预期输出

```txt
{ value: 'design', done: false }
{ value: 'build', done: false }
{ value: 'test', done: false }
{ value: undefined, done: true }
```

### `typedGenerator.ts`

```ts
// Goal:
// Type yield value, return value, and next input value.

// Expected result:
// The compiler accepts correctly typed next values.

export {};

function* createMultiplier(): Generator<number, string, number> {
  const firstInput = yield 1;
  const secondInput = yield firstInput * 2;

  return `final:${secondInput}`;
}

const multiplier = createMultiplier();

console.log(multiplier.next());
console.log(multiplier.next(10));
console.log(multiplier.next(20));
```



### 本节必须先补：`Generator<Y, R, N>` 三个类型参数按时间顺序理解

这行类型最容易背混：

```ts
function* createMultiplier(): Generator<number, string, number> {
  const firstInput = yield 1;
  const secondInput = yield firstInput * 2;

  return `final:${secondInput}`;
}
```

`Generator<number, string, number>` 不是随便三个类型。它们分别是：

```txt
Generator<YieldValue, ReturnValue, NextInput>
```

逐步执行：

| 调用 | 运行时结果 | 类型含义 |
|---|---|---|
| `multiplier.next()` | 得到第一个 `yield 1` | `YieldValue` 是 `number` |
| `multiplier.next(10)` | `10` 成为上一次 `yield 1` 表达式的结果 | `NextInput` 是 `number` |
| `multiplier.next(20)` | `20` 成为上一次 `yield firstInput * 2` 表达式的结果，然后函数 `return` | `ReturnValue` 是 `string` |

最容易错的是 `next(value)` 的方向：

```txt
错误：
next(value) sends value to the next yield.

正确：
next(value) resumes the previous paused yield expression.
```

所以 `NextInput` 描述的是外部下一次 `next(value)` 可以传回生成器内部的值。


### 类型参数记忆

```txt
Generator<YieldValue, ReturnValue, NextInput>
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为调用生成器会立即运行函数体 | 调用只返回 generator object。 |
| 只写 `Generator<number>` | 只描述 yield 值，不完整描述 return 和 next 输入。 |
| 忘记 `next(value)` 的值进入上一个暂停的 `yield` 表达式 | `next(value)` 不是传给下一次 `yield`，而是恢复上一次暂停点。 |

---

## 13. 08：迭代器和 Iterable

### 结论

`Iterable<T>` 描述可以被 `for...of` 消费、可以被展开、可以被传给 `Array.from()` 的值。它比 `T[]` 更通用。

### 技术意义

如果函数只需要“逐个读取值”，不要强行要求数组。用 `Iterable<T>` 可以接收数组、Set、Map 的 values、生成器等更多数据源。

### 文件结构

```txt
08-iterables/
  iterableParameter.ts
  iteratorResultTyping.ts
```

### `iterableParameter.ts`

```ts
// Goal:
// Accept any iterable source instead of only arrays.

// Expected result:
// The compiler accepts arrays, sets, and generators.

export {};

function collectLabels(sourceLabels: Iterable<string>): string[] {
  return Array.from(sourceLabels);
}

function* createGeneratedLabels(): Generator<string, void, unknown> {
  yield "alpha";
  yield "beta";
}

console.log(collectLabels(["draft", "published"]));
console.log(collectLabels(new Set(["admin", "member"])));
console.log(collectLabels(createGeneratedLabels()));
```

### `iteratorResultTyping.ts`

```ts
// Goal:
// Observe IteratorResult typing.

// Expected result:
// The compiler accepts safe handling of done.

export {};

const statusIterator = ["draft", "published"][Symbol.iterator]();

const firstResult = statusIterator.next();

if (!firstResult.done) {
  const statusText: string = firstResult.value;
  console.log(statusText);
}
```



### 本节必须先补：`Iterable<T>`、`Iterator<T>` 和 `T[]` 的边界

这三个概念经常混在一起：

| 类型 | 保证什么 | 不保证什么 |
|---|---|---|
| `T[]` | 有数组方法、索引、`length`，也可以迭代 | 不代表只会被读取，数组通常可变 |
| `Iterable<T>` | 可以被 `for...of`、spread、`Array.from()` 消费 | 不保证有 `length`、索引、`map()` |
| `Iterator<T>` | 有 `.next()`，每次推进一步 | 不保证可以重新开始，也不保证能直接 `for...of` |

看这个例子：

```ts
// Goal:
// Accept an iterable without assuming array methods.

export {};

function printEachLabel(sourceLabels: Iterable<string>): void {
  for (const labelText of sourceLabels) {
    console.log(labelText.toUpperCase());
  }
}

printEachLabel(["draft", "published"]);
printEachLabel(new Set(["admin", "member"]));
```

`sourceLabels` 是 `Iterable<string>`，所以函数体里应该按“可迭代来源”使用它：

```txt
可以：
  for...of sourceLabels

不要假设：
  sourceLabels.length
  sourceLabels[0]
  sourceLabels.map(...)
```

如果函数真的需要数组能力，就写 `string[]`。如果只是逐个读取，写 `Iterable<string>` 更准确。


### 常见错误

| 错误 | 正确模型 |
|---|---|
| 函数只遍历数据，却把参数写成 `T[]` | 更通用的类型是 `Iterable<T>`。 |
| 以为 `Iterable<T>` 一定有 `.length` | iterable 只保证能迭代，不保证有数组属性。 |
| 以为 iterator 可以随便重置 | iterator 通常是有状态的一次性游标。 |

---

## 14. 09：函数类型表达式

### 结论

函数类型表达式（function type expression）用来描述一个普通可调用函数的参数和返回值。

### 技术意义

当函数作为参数、变量、对象属性或返回值出现时，你需要一种类型语法描述它的调用方式。

### 文件结构

```txt
09-function-type-expressions/
  callbackTypeExpression.ts
  namedCallbackType.ts
```



### 本节必须先补：函数类型表达式只描述“能怎么调用”

函数类型表达式：

```ts
type ProductFormatter = (productName: string, index: number) => string;
```

不要把它读成“箭头函数”。它没有函数体，也不会执行。它只描述调用合同：

```txt
caller must pass:
  productName: string
  index: number

caller receives:
  string
```

所以它和下面的运行时函数值不是一回事：

```ts
// Goal:
// Compare function type expression and function value.

export {};

type ProductFormatter = (productName: string, index: number) => string;

const formatProduct: ProductFormatter = (productName, index) => {
  return `${index}:${productName}`;
};

console.log(formatProduct("Keyboard", 0));
```

TypeScript 在这里做了两件事：

```txt
1. ProductFormatter defines the expected call shape.
2. The arrow function is checked against that call shape.
```

编译后，`ProductFormatter` 会消失，只剩真正的箭头函数。


### `callbackTypeExpression.ts`

```ts
// Goal:
// Type a callback parameter with a function type expression.

// Expected result:
// The compiler accepts valid callbacks and rejects invalid ones.

export {};

function formatEachProduct(
  productNames: string[],
  formatter: (productName: string) => string,
): string[] {
  return productNames.map((productName) => {
    return formatter(productName);
  });
}

const labels = formatEachProduct(["keyboard", "mouse"], (productName) => {
  return productName.toUpperCase();
});

console.log(labels);

// @ts-expect-error: The formatter must return a string.
formatEachProduct(["keyboard"], (productName) => {
  return productName.length;
});
```

### `namedCallbackType.ts`

```ts
// Goal:
// Name a function type with a type alias.

// Expected result:
// The compiler accepts this file.

export {};

type ProductFormatter = (productName: string, index: number) => string;

function formatProductList(productNames: string[], formatter: ProductFormatter): string[] {
  return productNames.map(formatter);
}

console.log(formatProductList(["keyboard", "mouse"], (productName, index) => {
  return `${index}:${productName}`;
}));
```

### 常见错误

```ts
// Goal:
// Show why parameter names matter in function type expressions.

// Expected result:
// This file shows the correct syntax.

export {};

type CorrectFormatter = (titleText: string) => string;

const formatter: CorrectFormatter = (titleText) => {
  return titleText.toUpperCase();
};

console.log(formatter("home"));
```

注意：函数类型表达式里参数名不是可省略的装饰，它是语法的一部分。

---

## 15. 10：调用签名

### 结论

调用签名（call signature）用于描述“既可以被调用，又有属性”的函数对象。

### 技术意义

JavaScript 函数本身是对象，可以挂属性。函数类型表达式只能描述调用方式，不能同时描述函数对象属性。调用签名可以同时描述这两部分。

### 文件结构

```txt
10-call-signatures/
  callableObject.ts
  functionWithProperty.ts
```

### `callableObject.ts`

```ts
// Goal:
// Use a call signature to type a callable object.

// Expected result:
// The compiler accepts the callable object.

export {};

type TrackedFormatter = {
  description: string;
  callCount: number;
  (inputText: string): string;
};

const trackedFormatter: TrackedFormatter = Object.assign(
  (inputText: string) => {
    trackedFormatter.callCount += 1;
    return inputText.trim().toUpperCase();
  },
  {
    description: "Uppercase formatter",
    callCount: 0,
  },
);

console.log(trackedFormatter(" keyboard "));
console.log(trackedFormatter.description);
console.log(trackedFormatter.callCount);
```

### `functionWithProperty.ts`

```ts
// Goal:
// Type a function value that also owns metadata.

// Expected result:
// The compiler accepts this file.

export {};

type ValidatorFunction = {
  ruleName: string;
  (inputValue: string): boolean;
};

const nonEmptyValidator: ValidatorFunction = Object.assign(
  (inputValue: string) => {
    return inputValue.trim().length > 0;
  },
  {
    ruleName: "non-empty",
  },
);

console.log(nonEmptyValidator("hello"));
console.log(nonEmptyValidator.ruleName);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 用 `(x: string) => boolean` 描述带属性的函数 | 这种语法不能描述函数属性。 |
| 以为函数不能有属性 | JS 函数是对象，可以有属性。 |
| 把调用签名当成运行时代码 | 调用签名只存在于类型系统。 |

---

## 16. 11：构造签名补充

### 结论

构造签名（construct signature）描述一个值可以用 `new` 调用。它不是第 4 章最核心的内容，但它能补全“函数既可调用也可能可构造”的模型。

### 技术意义

某些 JavaScript 值既可以直接调用，也可以使用 `new`。TypeScript 用调用签名描述普通调用，用构造签名描述 `new` 调用。

### 文件结构

```txt
11-construct-signatures/
  constructorSignature.ts
  callOrConstructSignature.ts
```

### `constructorSignature.ts`

```ts
// Goal:
// Type a constructor function with a construct signature.

// Expected result:
// The compiler accepts a value that can be called with new.

export {};

type ProductInstance = {
  name: string;
};

type ProductConstructor = {
  new (name: string): ProductInstance;
};

class ProductRecord {
  constructor(public name: string) {}
}

function createProduct(ctor: ProductConstructor, name: string): ProductInstance {
  return new ctor(name);
}

console.log(createProduct(ProductRecord, "Keyboard"));
```

### `callOrConstructSignature.ts`

```ts
// Goal:
// Combine call and construct signatures.

// Expected result:
// The compiler accepts both call and new usage.

export {};

type DateLikeFactory = {
  (timestampValue?: number): string;
  new (timestampValue?: number): Date;
};

function useDateLikeFactory(factory: DateLikeFactory): void {
  console.log(factory(0));
  console.log(new factory(0).toISOString());
}

useDateLikeFactory(Date);
```

### 常见错误

```txt
call signature:
  describes value(...args)

construct signature:
  describes new value(...args)
```


---

## 17. 12：上下文类型推导

### 结论

上下文类型推导（contextual typing）是 TypeScript 根据函数出现的位置，反向推断函数参数类型。

### 技术意义

很多回调函数不需要手写参数类型，是因为外部 API 已经给了上下文。数组方法、事件处理器、Promise 回调、React props 都依赖这个机制。

### 文件结构

```txt
12-contextual-typing/
  arrayMapContextualTyping.ts
  eventHandlerContextualTyping.ts
```

### `arrayMapContextualTyping.ts`

```ts
// Goal:
// Observe contextual typing in an array callback.

// Expected result:
// The compiler infers productName as string.

export {};

const productNames = ["keyboard", "mouse"];

const labels = productNames.map((productName, index) => {
  return `${index}:${productName.toUpperCase()}`;
});

console.log(labels);
```

### `eventHandlerContextualTyping.ts`

```ts
// Goal:
// Observe contextual typing with a simplified event handler.

// Expected result:
// The compiler infers the event parameter from the handler type.

export {};

type ClickEvent = {
  x: number;
  y: number;
};

type ClickHandler = (event: ClickEvent) => void;

function registerClickHandler(handler: ClickHandler): void {
  handler({ x: 10, y: 20 });
}

registerClickHandler((event) => {
  console.log(event.x + event.y);

  // @ts-expect-error: ClickEvent has no key property.
  console.log(event.key);
});
```



### 本节必须先补：上下文类型推导是“类型从外往里流”

你在数组方法里不写参数类型，不是因为参数变成 `any`，而是因为外部位置已经知道回调应该是什么类型。

```ts
// Goal:
// Show how contextual typing flows into a callback.

export {};

const productNames: string[] = ["keyboard", "mouse"];

productNames.map((productName) => {
  return productName.toUpperCase();
});
```

TypeScript 的推导方向是：

```txt
productNames:
  string[]

map callback expected shape:
  (value: string, index: number, array: string[]) => NewValue

callback parameter:
  productName is inferred as string
```

所以这里的类型不是从 `productName` 自己来的，而是从 `productNames.map(...)` 这个上下文流进去的。

如果脱离上下文：

```ts
// Goal:
// Show that removing context removes callback parameter inference.

export {};

// @ts-expect-error: Parameter has an implicit any type.
const formatter = (productName) => {
  return productName.toUpperCase();
};
```

这就是为什么 React 事件处理器、数组回调、Promise 回调经常可以少写参数类型：它们所在的位置提供了 expected type。


### 底层机制

```txt
callback expression appears in a typed position
  -> TypeScript reads the expected function type
  -> parameter types flow into the callback
  -> callback body is checked with inferred parameter types
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 回调参数没写类型就是 `any` | 在有上下文的位置，参数可从上下文推导。 |
| 把上下文推导当成运行时机制 | 它只发生在编译期。 |
| 过度手写回调参数类型 | 很多情况下会重复上下文已有的信息。 |

---

## 18. 13：函数类型重载

### 结论

函数重载（function overload）用于描述同一个函数有多种不同调用方式。优先使用联合类型；只有不同调用方式对应不同返回类型或不同参数数量时，再使用重载。

### 技术意义

重载由多个外部可见的重载签名和一个实现签名组成。实现签名用于写函数体，但调用者看不到实现签名。

### 文件结构

```txt
13-function-overloads/
  overloadSignatures.ts
  unionInsteadOfOverload.ts
  overloadImplementationMistake.ts
```

### `overloadSignatures.ts`

```ts
// Goal:
// Use overloads when different inputs produce different outputs.

// Expected result:
// The compiler infers different return types from different calls.

export {};

function parseInputValue(inputValue: string): string[];
function parseInputValue(inputValue: number): number;
function parseInputValue(inputValue: string | number): string[] | number {
  if (typeof inputValue === "string") {
    return inputValue.split(",");
  }

  return inputValue * 2;
}

const parsedList = parseInputValue("a,b,c");
const doubledValue = parseInputValue(10);

console.log(parsedList);
console.log(doubledValue);
```

### `unionInsteadOfOverload.ts`

```ts
// Goal:
// Prefer a union parameter when overloads do not add value.

// Expected result:
// The compiler accepts union input.

export {};

function getItemCount(inputValue: string | unknown[]): number {
  return inputValue.length;
}

const inputValue = Math.random() > 0.5 ? "hello" : [1, 2, 3];

console.log(getItemCount(inputValue));
```

### `overloadImplementationMistake.ts`

```ts
// Goal:
// Show that the implementation signature is not directly callable.

// Expected result:
// The compiler rejects the two-argument call.

export {};

function createDate(timestampValue: number): Date;
function createDate(yearValue: number, monthValue: number, dayValue: number): Date;
function createDate(yearOrTimestamp: number, monthValue?: number, dayValue?: number): Date {
  if (monthValue !== undefined && dayValue !== undefined) {
    return new Date(yearOrTimestamp, monthValue, dayValue);
  }

  return new Date(yearOrTimestamp);
}

console.log(createDate(1700000000000));
console.log(createDate(2026, 4, 15));

// @ts-expect-error: No overload accepts exactly two arguments.
console.log(createDate(2026, 4));
```



### 本节必须先补：重载签名和实现签名不是平级关系

函数重载由两层组成：

```txt
overload signatures:
  给调用者看的外部调用方式。

implementation signature:
  给函数体实现用的内部签名。
```

看这段：

```ts
// Goal:
// Show overload signatures and implementation signature.

export {};

function readValue(inputValue: string): string[];
function readValue(inputValue: number): number;
function readValue(inputValue: string | number): string[] | number {
  if (typeof inputValue === "string") {
    return inputValue.split(",");
  }

  return inputValue * 2;
}

const listValue = readValue("a,b");
const numberValue = readValue(10);

console.log(listValue.join("-"));
console.log(numberValue.toFixed(0));
```

调用者能看到的是前两个签名：

```txt
readValue(string): string[]
readValue(number): number
```

实现签名：

```txt
readValue(string | number): string[] | number
```

不是一个额外可调用签名。它只是为了让函数体能同时处理所有重载情况。

判断是否需要 overload：

```txt
如果只是参数可以是 A 或 B，返回值不随输入精确变化：
  prefer union parameter.

如果输入形状不同，返回值也要跟着精确变化：
  overload can be useful.
```


### 常见错误

| 错误 | 正确模型 |
|---|---|
| 把实现签名当成可调用签名 | 调用者只能看到重载签名。 |
| 同参数数量、同返回类型还写重载 | 通常联合类型更好。 |
| 重载签名和实现签名不兼容 | 实现签名必须能覆盖所有重载情况。 |

---

## 19. 14：多态和泛型函数

### 结论

泛型函数用类型参数描述输入和输出之间的类型关系。它解决的是“保留具体类型关系”的问题，不是“让函数接受任何值”的问题。

### 技术意义

`any` 会丢失类型信息。泛型会保存调用者传入的具体类型，并把这个类型传递到返回值或其他参数位置。

### 文件结构

```txt
14-generic-functions/
  identityGeneric.ts
  firstElementGeneric.ts
  mapGeneric.ts
```

### `identityGeneric.ts`

```ts
// Goal:
// Preserve input type through a generic function.

// Expected result:
// The compiler infers different return types for different calls.

export {};

function identityValue<ValueType>(value: ValueType): ValueType {
  return value;
}

const titleText = identityValue("Keyboard");
const quantityValue = identityValue(12);

console.log(titleText.toUpperCase());
console.log(quantityValue.toFixed(2));
```

### `firstElementGeneric.ts`

```ts
// Goal:
// Preserve array element type in the return value.

// Expected result:
// The return type includes undefined because the array may be empty.

export {};

function getFirstElement<ElementType>(items: ElementType[]): ElementType | undefined {
  return items[0];
}

const firstName = getFirstElement(["Ada", "Grace"]);
const firstScore = getFirstElement([90, 85]);

console.log(firstName?.toUpperCase());
console.log(firstScore?.toFixed(1));
```

### `mapGeneric.ts`

```ts
// Goal:
// Connect input element type and output element type.

// Expected result:
// The compiler infers number[] as the mapped output.

export {};

function mapItems<InputType, OutputType>(
  items: InputType[],
  transformItem: (item: InputType) => OutputType,
): OutputType[] {
  return items.map(transformItem);
}

const parsedNumbers = mapItems(["1", "2", "3"], (textValue) => {
  return Number.parseInt(textValue, 10);
});

console.log(parsedNumbers);
```



### 本节必须先补：泛型函数不是“更高级的 any”

`any` 和 generic 都能让函数接收多种值，但它们的类型结果完全不同。

```ts
// Goal:
// Compare any and a generic type parameter.

export {};

function identityAny(value: any): any {
  return value;
}

function identityGeneric<ValueType>(value: ValueType): ValueType {
  return value;
}

const anyResult = identityAny("Keyboard");
const genericResult = identityGeneric("Keyboard");

anyResult.missingMethod();
console.log(genericResult.toUpperCase());

// @ts-expect-error: string has no missingMethod.
genericResult.missingMethod();
```

区别：

| 写法 | 输入能否多样 | 是否保留输入类型 | 后续是否安全 |
|---|---|---|---|
| `any` | 能 | 不能，结果也是 `any` | 不安全，错误会扩散 |
| `<ValueType>(value: ValueType) => ValueType` | 能 | 能，返回值和输入保持同一类型 | 安全，checker 继续工作 |

泛型的重点不是“任意类型”，而是“类型关系”：

```txt
input type:
  ValueType

return type:
  same ValueType
```

所以类型参数至少要连接两个位置才有意义。只出现一次的类型参数通常是坏味道：

```ts
// Goal:
// Show a generic parameter that does not preserve a relationship.

export {};

function parseJsonBad<ValueType>(jsonText: string): ValueType {
  return JSON.parse(jsonText) as ValueType;
}

const result = parseJsonBad<{ id: string }>('{"id":123}');

console.log(result.id);
```

这里 `ValueType` 没有从参数推导出来，只是让调用者随便指定返回类型。这种写法本质上接近断言，不是安全解析。更好的做法是配合运行时验证函数。


### 常见错误

| 错误 | 正确模型 |
|---|---|
| 用 `any` 写通用函数 | `any` 接受任何值，但不保留类型关系。 |
| 泛型参数只出现一次 | 类型参数没有建立关系，通常是多余的。 |
| 泛型名字过于随意 | 初学阶段用 `InputType`、`OutputType`、`ElementType` 更清楚。 |

---

## 20. 15：什么时候绑定泛型

### 结论

泛型绑定位置决定类型参数什么时候被确定。函数级泛型在每次调用时确定；类型级泛型在使用该类型时确定。

### 技术意义

同一个泛型写在不同位置，会导致复用方式不同。函数级泛型适合每次调用独立推导；接口或类型别名上的泛型适合让一组成员共享同一个类型参数。

### 文件结构

```txt
15-when-to-bind-generics/
  functionLevelGeneric.ts
  typeLevelGeneric.ts
```

### `functionLevelGeneric.ts`

```ts
// Goal:
// Bind a generic type parameter at each function call.

// Expected result:
// Each call can infer a different type.

export {};

function wrapValue<ValueType>(value: ValueType): { value: ValueType } {
  return { value };
}

const wrappedText = wrapValue("draft");
const wrappedCount = wrapValue(3);

console.log(wrappedText.value.toUpperCase());
console.log(wrappedCount.value.toFixed(1));
```

### `typeLevelGeneric.ts`

```ts
// Goal:
// Bind a generic type parameter when creating a reusable type.

// Expected result:
// The repository keeps one entity type.

export {};

type Repository<EntityType> = {
  save(entity: EntityType): void;
  findById(id: string): EntityType | undefined;
};

type ProductRecord = {
  id: string;
  title: string;
};

const productRepository: Repository<ProductRecord> = {
  save(entity) {
    console.log(entity.title);
  },
  findById(id) {
    return { id, title: "Keyboard" };
  },
};

productRepository.save({ id: "p1", title: "Mouse" });
console.log(productRepository.findById("p1")?.title);
```



### 本节必须先补：函数级泛型和类型级泛型的“确定时间”不同

函数级泛型每次调用都重新确定类型参数：

```ts
// Goal:
// Show per-call generic binding.

export {};

function createValueBox<ValueType>(value: ValueType): { value: ValueType } {
  return { value };
}

const stringBox = createValueBox("Ada");
const numberBox = createValueBox(42);

console.log(stringBox.value.toUpperCase());
console.log(numberBox.value.toFixed(0));
```

这里两次调用互不影响：

```txt
first call:
  ValueType = string

second call:
  ValueType = number
```

类型级泛型在你标注这个类型时就确定：

```ts
// Goal:
// Show type-level generic binding.

export {};

type Store<ItemType> = {
  add(item: ItemType): void;
};

const stringStore: Store<string> = {
  add(item) {
    console.log(item.toUpperCase());
  },
};

stringStore.add("Ada");

// @ts-expect-error: This store was bound to string.
stringStore.add(42);
```

这里 `Store<string>` 一旦确定，整个 `stringStore` 都围绕 `string` 工作。

判断规则：

```txt
每次调用都应该允许不同类型：
  put the generic on the function.

一组属性或方法要共享同一个类型：
  put the generic on the type/interface.
```


### 记忆模型

```txt
generic on function:
  chosen per call.

generic on type/interface:
  chosen when the type is instantiated or annotated.
```

---

## 21. 16：可以在什么地方声明泛型

### 结论

泛型可以声明在函数、调用签名、接口、类型别名、类和方法上。第 4 章重点掌握函数、调用签名、接口和类型别名。

### 技术意义

泛型声明位置决定哪些代码区域可以使用这个类型参数。

### 文件结构

```txt
16-where-to-declare-generics/
  genericCallSignature.ts
  genericInterface.ts
```

### `genericCallSignature.ts`

```ts
// Goal:
// Declare a generic parameter on a call signature.

// Expected result:
// The compiler accepts calls with different types.

export {};

type ValueWrapper = {
  <ValueType>(value: ValueType): { value: ValueType };
};

const wrapValue: ValueWrapper = (value) => {
  return { value };
};

console.log(wrapValue("hello").value.toUpperCase());
console.log(wrapValue(42).value.toFixed(1));
```

### `genericInterface.ts`

```ts
// Goal:
// Declare a generic parameter on an interface-like object type.

// Expected result:
// The compiler accepts a strongly typed store.

export {};

type Store<ItemType> = {
  items: ItemType[];
  add(item: ItemType): void;
  getAll(): ItemType[];
};

const numberStore: Store<number> = {
  items: [],
  add(item) {
    this.items.push(item);
  },
  getAll() {
    return this.items;
  },
};

numberStore.add(10);

// @ts-expect-error: The store only accepts numbers.
numberStore.add("10");

console.log(numberStore.getAll());
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 不知道泛型写在哪里 | 看这个类型参数要被谁共享。 |
| 函数每次调用都应独立推导，却把泛型放到外层类型上 | 会让类型被过早固定。 |
| 一组方法共享同一实体类型，却把泛型散落在每个方法上 | 会失去统一约束。 |

---

## 22. 17：泛型推导

### 结论

TypeScript 通常能从实参推导泛型类型参数，也能从回调返回值推导输出类型。只有推导不出你的意图时，才显式传类型参数。

### 技术意义

泛型推导减少重复标注，并让函数更容易调用。你要学会观察 TypeScript 是从哪个参数位置推导类型的。

### 文件结构

```txt
17-generic-inference/
  inferredTypeArgument.ts
  explicitTypeArgument.ts
```

### `inferredTypeArgument.ts`

```ts
// Goal:
// Let TypeScript infer generic type arguments from input values.

// Expected result:
// The compiler infers string and number automatically.

export {};

function createPair<FirstType, SecondType>(
  firstValue: FirstType,
  secondValue: SecondType,
): [FirstType, SecondType] {
  return [firstValue, secondValue];
}

const productPair = createPair("keyboard", 99);

console.log(productPair[0].toUpperCase());
console.log(productPair[1].toFixed(2));
```

### `explicitTypeArgument.ts`

```ts
// Goal:
// Specify a generic type argument when inference is too narrow.

// Expected result:
// The compiler accepts a union array result.

export {};

function combineLists<ItemType>(firstList: ItemType[], secondList: ItemType[]): ItemType[] {
  return firstList.concat(secondList);
}

const mixedList = combineLists<string | number>([1, 2], ["three"]);

console.log(mixedList);
```

### 常见错误

```txt
错误：
到处显式写泛型参数。

正确：
先让 TypeScript 推导。
只有推导结果太窄、太宽、或无法表达意图时，再显式指定。
```


---

## 23. 18：泛型别名

### 结论

泛型类型别名让你把可复用的类型结构参数化。它常用于 `Result<T>`、`ApiResponse<T>`、`Mapper<Input, Output>` 这类通用模型。

### 技术意义

泛型别名把“结构固定、内部类型可变”的模式抽出来，避免复制多个相似类型。

### 文件结构

```txt
18-generic-type-aliases/
  ResultTypeAlias.ts
  MapperTypeAlias.ts
```

### `ResultTypeAlias.ts`

```ts
// Goal:
// Create a generic result type alias.

// Expected result:
// The compiler accepts success and failure states.

export {};

type Result<ValueType> =
  | {
      ok: true;
      value: ValueType;
    }
  | {
      ok: false;
      errorMessage: string;
    };

function parseNumberValue(inputText: string): Result<number> {
  const parsedValue = Number.parseFloat(inputText);

  if (Number.isNaN(parsedValue)) {
    return { ok: false, errorMessage: "Invalid number" };
  }

  return { ok: true, value: parsedValue };
}

const parseResult = parseNumberValue("42");

if (parseResult.ok) {
  console.log(parseResult.value.toFixed(2));
} else {
  console.log(parseResult.errorMessage);
}
```

### `MapperTypeAlias.ts`

```ts
// Goal:
// Create a generic function type alias.

// Expected result:
// The compiler accepts a typed mapper.

export {};

type Mapper<InputType, OutputType> = (inputValue: InputType) => OutputType;

const titleLengthMapper: Mapper<string, number> = (inputValue) => {
  return inputValue.length;
};

console.log(titleLengthMapper("Keyboard"));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 为每种响应复制一个类型 | 用 `ApiResponse<T>` 参数化内部数据。 |
| 泛型别名里类型参数没有被使用 | 这个泛型参数是多余的。 |
| 把泛型别名当运行时函数 | `type` 不会生成 JS。 |

---

## 24. 19：受限的多态

### 结论

受限多态（bounded polymorphism）使用 `extends` 限制泛型参数必须满足某种结构，这样函数内部才能安全访问该结构上的属性或方法。

### 技术意义

无约束泛型表示“任何类型”。如果函数内部要访问 `.length`、`.id`、`.toISOString()` 这类成员，就必须给泛型加约束。

### 文件结构

```txt
19-constrained-polymorphism/
  lengthConstraint.ts
  constraintReturnMistake.ts
```

### `lengthConstraint.ts`

```ts
// Goal:
// Use a generic constraint to access a required property.

// Expected result:
// The compiler accepts values with a length property and rejects numbers.

export {};

function chooseLonger<ValueType extends { length: number }>(
  firstValue: ValueType,
  secondValue: ValueType,
): ValueType {
  if (firstValue.length >= secondValue.length) {
    return firstValue;
  }

  return secondValue;
}

console.log(chooseLonger("short", "longer"));
console.log(chooseLonger([1, 2], [1, 2, 3]));

// @ts-expect-error: Numbers do not have a length property.
console.log(chooseLonger(10, 100));
```

### `constraintReturnMistake.ts`

```ts
// Goal:
// Understand that returning the constraint is not the same as returning the type parameter.

// Expected result:
// The compiler rejects returning a plain constraint object as ValueType.

export {};

function ensureMinimumLength<ValueType extends { length: number }>(
  value: ValueType,
  minimumLength: number,
): ValueType {
  if (value.length >= minimumLength) {
    return value;
  }

  // @ts-expect-error: This object satisfies the constraint, but it may not be ValueType.
  return { length: minimumLength };
}
```



### 本节必须先补：`extends` 约束不是 class 继承

泛型约束里的 `extends` 表示：

```txt
ValueType must be assignable to this structure.
```

它不是在创建子类，也不要求 `class extends`。

```ts
// Goal:
// Show structural generic constraints.

export {};

function readId<EntityType extends { id: string }>(entity: EntityType): string {
  return entity.id;
}

console.log(readId({ id: "p1", title: "Keyboard" }));

// @ts-expect-error: The value does not have a string id.
console.log(readId({ title: "Mouse" }));
```

这个约束只保证函数体能安全读取 `entity.id`。它没有丢掉调用者传进来的具体类型：

```ts
// Goal:
// Preserve the concrete type while using a constraint.

export {};

function keepEntity<EntityType extends { id: string }>(entity: EntityType): EntityType {
  console.log(entity.id);
  return entity;
}

const productRecord = keepEntity({
  id: "p1",
  title: "Keyboard",
});

console.log(productRecord.title);
```

这里 `EntityType` 不是简单变成 `{ id: string }`。它仍然是调用者传入的完整对象类型，所以返回值还保留 `title`。

这也是为什么不能随便返回一个只满足约束的对象：

```txt
The constraint is the minimum requirement.
The type parameter is the caller's exact type.
```


### 底层机制

```txt
ValueType extends { length: number }
  -> TypeScript knows every ValueType has length
  -> function can read value.length
  -> function still promises to return the exact original ValueType
  -> returning only the constraint object is unsafe
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为 `extends` 是类继承 | 泛型约束里的 `extends` 表示类型必须可赋值给某个结构。 |
| 以为返回约束对象就等于返回泛型 | 泛型承诺返回调用者传入的具体类型。 |
| 约束过宽或过窄 | 约束只写函数体真正需要的成员。 |

---

## 25. 20：泛型默认类型

### 结论

泛型默认类型让调用者不指定类型参数时，类型系统使用一个默认类型。

### 技术意义

泛型默认类型适合给通用 API 提供合理默认值，同时保留调用者覆盖类型参数的能力。

### 文件结构

```txt
20-generic-defaults/
  apiResponseDefault.ts
```

### `apiResponseDefault.ts`

```ts
// Goal:
// Use a default generic type parameter.

// Expected result:
// The compiler uses the default metadata type unless overridden.

export {};

type ApiResponse<DataType, MetaType = { requestId: string }> = {
  data: DataType;
  meta: MetaType;
};

type ProductRecord = {
  id: string;
  title: string;
};

const defaultMetaResponse: ApiResponse<ProductRecord> = {
  data: {
    id: "p1",
    title: "Keyboard",
  },
  meta: {
    requestId: "req-1",
  },
};

const customMetaResponse: ApiResponse<ProductRecord, { page: number; total: number }> = {
  data: {
    id: "p2",
    title: "Mouse",
  },
  meta: {
    page: 1,
    total: 20,
  },
};

console.log(defaultMetaResponse.meta.requestId);
console.log(customMetaResponse.meta.total);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 泛型默认类型写得太具体 | 默认值应该是合理通用的安全选择。 |
| 默认类型依赖后面的类型参数 | 后面的类型参数还没有声明，不能被前面使用。 |
| 用默认泛型掩盖必要类型 | 如果调用者必须明确指定，就不要给默认值。 |

---

## 26. 21：类型驱动开发

### 结论

类型驱动开发（type-driven development）是先设计函数的输入、输出和状态模型，再写实现代码。它能把“业务规则”提前变成类型约束。

### 技术意义

函数类型不是实现之后补的注释。函数类型可以先定义边界，让实现沿着类型模型写下去。

### 文件结构

```txt
21-type-driven-development/
  typeFirstFormatter.ts
  typeFirstFetcher.ts
```

### `typeFirstFormatter.ts`

```ts
// Goal:
// Write the type boundary before the implementation.

// Expected result:
// The compiler guides the implementation.

export {};

type CurrencyCode = "USD" | "EUR" | "JPY";

type PriceFormatter = (amountValue: number, currencyCode: CurrencyCode) => string;

const formatPrice: PriceFormatter = (amountValue, currencyCode) => {
  return `${currencyCode} ${amountValue.toFixed(2)}`;
};

console.log(formatPrice(99, "USD"));

// @ts-expect-error: Currency code must be known.
console.log(formatPrice(99, "GBP"));
```

### `typeFirstFetcher.ts`

```ts
// Goal:
// Model a fetch helper result before writing the implementation.

// Expected result:
// The compiler forces callers to handle both result states.

export {};

type FetchResult<DataType> =
  | {
      ok: true;
      data: DataType;
    }
  | {
      ok: false;
      errorMessage: string;
    };

type ProductRecord = {
  id: string;
  title: string;
};

function createMockProductResult(shouldSucceed: boolean): FetchResult<ProductRecord> {
  if (!shouldSucceed) {
    return {
      ok: false,
      errorMessage: "Request failed",
    };
  }

  return {
    ok: true,
    data: {
      id: "p1",
      title: "Keyboard",
    },
  };
}

const result = createMockProductResult(true);

if (result.ok) {
  console.log(result.data.title);
} else {
  console.log(result.errorMessage);
}
```

### 常见错误

```txt
错误：
先写实现，最后用 any 把类型错误压掉。

正确：
先写函数边界和结果模型，让 TypeScript 指导实现和调用方处理。
```

---

## 27. 22：小项目整合

### 结论

本章小项目要把函数类型表达式、调用签名、上下文类型推导、泛型、约束和类型驱动开发合在一起，做一个“类型安全的数据处理管道”。

### 技术意义

真实项目里的函数不是孤立存在的。它们经常组成 pipeline：解析数据、校验数据、转换数据、格式化结果、处理失败状态。泛型函数的价值就在于保留每一步的输入输出关系。

### 文件结构

```txt
22-mini-project/
  typedEventEmitter.ts
  typedPipeline.ts
```

### `typedEventEmitter.ts`

```ts
// Goal:
// Build a small typed event emitter with generic event payloads.

// Expected result:
// The compiler enforces event names and payload types.

export {};

type EventMap = {
  productCreated: {
    id: string;
    title: string;
  };
  inventoryChanged: {
    id: string;
    stockCount: number;
  };
};

type EventHandler<PayloadType> = (payload: PayloadType) => void;

function createEventEmitter<Events extends Record<string, unknown>>() {
  const handlers: {
    [EventName in keyof Events]?: EventHandler<Events[EventName]>[];
  } = {};

  return {
    on<EventName extends keyof Events>(
      eventName: EventName,
      handler: EventHandler<Events[EventName]>,
    ): void {
      const eventHandlers = handlers[eventName] ?? [];
      eventHandlers.push(handler);
      handlers[eventName] = eventHandlers;
    },

    emit<EventName extends keyof Events>(
      eventName: EventName,
      payload: Events[EventName],
    ): void {
      const eventHandlers = handlers[eventName] ?? [];

      for (const handler of eventHandlers) {
        handler(payload);
      }
    },
  };
}

const eventEmitter = createEventEmitter<EventMap>();

eventEmitter.on("productCreated", (payload) => {
  console.log(payload.title);
});

eventEmitter.emit("productCreated", {
  id: "p1",
  title: "Keyboard",
});

// @ts-expect-error: The payload shape does not match inventoryChanged.
eventEmitter.emit("inventoryChanged", { id: "p1", title: "Keyboard" });
```

### `typedPipeline.ts`

```ts
// Goal:
// Build a typed two-step pipeline.

// Expected result:
// The output type is inferred from the second step.

export {};

type Step<InputType, OutputType> = (inputValue: InputType) => OutputType;

function pipeTwoSteps<InputType, MiddleType, OutputType>(
  inputValue: InputType,
  firstStep: Step<InputType, MiddleType>,
  secondStep: Step<MiddleType, OutputType>,
): OutputType {
  return secondStep(firstStep(inputValue));
}

const finalLabel = pipeTwoSteps(
  "42",
  (inputText) => Number.parseInt(inputText, 10),
  (numberValue) => `quantity:${numberValue}`,
);

console.log(finalLabel.toUpperCase());

// @ts-expect-error: finalLabel is a string, not a number.
console.log(finalLabel.toFixed(2));
```



### 小项目必须先补：`Events[EventName]` 是把事件名和 payload 绑定起来

`typedEventEmitter.ts` 里最难的一行是：

```ts
type EventHandler<PayloadType> = (payload: PayloadType) => void;

type HandlerFor<Events, EventName extends keyof Events> = EventHandler<Events[EventName]>;
```

这不是“复杂写法炫技”，它是在表达一个核心关系：

```txt
eventName determines payload type.
```

拆开：

```txt
Events:
  the whole event map.

EventName:
  one key from Events.

Events[EventName]:
  the payload type for that specific event name.
```

在这个事件表里：

```ts
// Goal:
// Show event map indexing.

export {};

type EventMap = {
  productCreated: {
    id: string;
    title: string;
  };
  inventoryChanged: {
    id: string;
    stockCount: number;
  };
};

type ProductCreatedPayload = EventMap["productCreated"];
type InventoryChangedPayload = EventMap["inventoryChanged"];

const productPayload: ProductCreatedPayload = {
  id: "p1",
  title: "Keyboard",
};

const inventoryPayload: InventoryChangedPayload = {
  id: "p1",
  stockCount: 10,
};

console.log(productPayload.title);
console.log(inventoryPayload.stockCount);
```

所以：

```txt
emit("productCreated", payload)
  payload must be EventMap["productCreated"]

emit("inventoryChanged", payload)
  payload must be EventMap["inventoryChanged"]
```

这就是泛型函数在真实项目里的价值：不是让参数更抽象，而是把两个参数之间的关系保存下来。


### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `EventMap` 先描述业务事件和 payload。 |
| 2 | `createEventEmitter<Events>()` 用泛型保存事件表。 |
| 3 | `on()` 和 `emit()` 使用同一个 `EventName` 类型参数关联事件名与 payload。 |
| 4 | 回调参数由上下文类型推导得到。 |
| 5 | `pipeTwoSteps()` 用三个泛型参数连接输入、中间值和输出。 |
| 6 | TypeScript 从实参和回调返回值推导最终输出类型。 |

### 和真实项目的关系

这个小项目对应真实前端中的几类常见代码：

```txt
typed event emitter
  -> UI event bus
  -> analytics event tracking
  -> WebSocket message handling

typed pipeline
  -> form input normalization
  -> API response parsing
  -> data formatting
  -> chained transform helpers
```

---

## 28. 最终文件清单

```txt
typescript/
  chapter-04-functions/
    README.md

    00-function-values-and-function-types/
      functionValueVsFunctionType.ts

    01-declare-and-call-functions/
      functionDeclarationAndCall.ts
      argumentCountCheck.ts

    02-parameter-and-return-types/
      parameterReturnAnnotation.ts
      returnInferenceBoundary.ts

    03-optional-default-parameters/
      optionalParameter.ts
      defaultParameter.ts
      optionalCallbackMistake.ts

    04-rest-parameters/
      restParameter.ts
      tupleRestParameter.ts
      restArgumentConstTuple.ts

    05-call-apply-bind/
      callApplyBindRuntime.ts
      strictBindCallApplyCheck.ts
      arrowThisCallMistake.ts

    06-this-parameter/
      thisParameterCallback.ts
      noImplicitThisMistake.ts
      arrowFunctionThisMistake.ts

    07-generator-functions/
      generatorFunctionBasics.ts
      typedGenerator.ts

    08-iterables/
      iterableParameter.ts
      iteratorResultTyping.ts

    09-function-type-expressions/
      callbackTypeExpression.ts
      namedCallbackType.ts

    10-call-signatures/
      callableObject.ts
      functionWithProperty.ts

    11-construct-signatures/
      constructorSignature.ts
      callOrConstructSignature.ts

    12-contextual-typing/
      arrayMapContextualTyping.ts
      eventHandlerContextualTyping.ts

    13-function-overloads/
      overloadSignatures.ts
      unionInsteadOfOverload.ts
      overloadImplementationMistake.ts

    14-generic-functions/
      identityGeneric.ts
      firstElementGeneric.ts
      mapGeneric.ts

    15-when-to-bind-generics/
      functionLevelGeneric.ts
      typeLevelGeneric.ts

    16-where-to-declare-generics/
      genericCallSignature.ts
      genericInterface.ts

    17-generic-inference/
      inferredTypeArgument.ts
      explicitTypeArgument.ts

    18-generic-type-aliases/
      ResultTypeAlias.ts
      MapperTypeAlias.ts

    19-constrained-polymorphism/
      lengthConstraint.ts
      constraintReturnMistake.ts

    20-generic-defaults/
      apiResponseDefault.ts

    21-type-driven-development/
      typeFirstFormatter.ts
      typeFirstFetcher.ts

    22-mini-project/
      typedEventEmitter.ts
      typedPipeline.ts

notes/
  typescript.md
```

---

## 29. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### 知识点名称

结论：一句话说明它解决什么问题。

技术意义：它在类型系统里表示什么。

底层机制：编译期做了什么，运行时还剩什么。

代码例子：保留一个最能说明问题的例子。

常见错误：写一个你自己容易犯的反例。

项目关系：说明它在 React、接口数据、表单、状态管理、Node 回调中的用途。
```

最终笔记必须包含这些对比：

```txt
function value vs function type
parameter annotation vs return annotation
optional parameter vs default parameter
rest parameter vs spread argument
ordinary function this vs arrow function this
function type expression vs call signature
call signature vs construct signature
contextual typing vs explicit annotation
union parameter vs overload
any function vs generic function
unconstrained generic vs constrained generic
function-level generic vs type-level generic
generic inference vs explicit type argument
void return type vs returned value ignored by callback context
```

---

## 30. 本章最终要能回答的问题

学完第 4 章后，你必须能不用查资料回答这些问题：

1. JavaScript 函数值和 TypeScript 函数类型有什么区别？
2. 为什么函数参数通常需要显式标注？
3. 为什么返回值可以推导，但公共函数仍建议显式返回类型？
4. 可选参数在函数体内为什么可能是 `undefined`？
5. 默认参数和可选参数的类型机制有什么区别？
6. 为什么回调参数不要随便写成可选参数？
7. 剩余参数和展开实参分别发生在函数声明侧还是调用侧？
8. 为什么普通数组展开到固定参数函数时可能报错？
9. `call`、`apply`、`bind` 在运行时分别做什么？
10. `strictBindCallApply` 解决什么问题？
11. 普通函数和箭头函数的 `this` 机制有什么不同？
12. TypeScript 的 `this` 参数为什么不算真实参数？
13. `Generator<Y, R, N>` 三个类型参数分别表示什么？
14. 为什么只需要遍历数据时可以用 `Iterable<T>` 而不是 `T[]`？
15. 函数类型表达式适合描述什么？
16. 调用签名为什么能描述带属性的函数？
17. 构造签名和调用签名有什么区别？
18. 什么是上下文类型推导？
19. 为什么 `array.map(item => ...)` 里的 `item` 可以不用手写类型？
20. 函数重载由哪两类签名组成？
21. 为什么实现签名不能被外部直接调用？
22. 什么情况下应该用联合类型替代重载？
23. 泛型函数解决的是什么问题？
24. 为什么泛型不是 `any` 的高级写法？
25. 类型参数只出现一次为什么通常是坏味道？
26. 函数级泛型和类型级泛型的绑定时机有什么区别？
27. 泛型约束中的 `extends` 和类继承有什么区别？
28. 为什么返回一个满足约束的对象不一定能作为 `T` 返回？
29. 泛型默认类型适合什么场景？
30. 类型驱动开发为什么能减少实现阶段的类型断言？
31. 函数类型表达式里的 `=>` 和箭头函数表达式里的 `=>` 有什么区别？
32. 为什么 `() => void` 的回调实现仍然可以返回一个值？
33. 回调实现少写参数，为什么不等于这个参数是 optional parameter？
34. `...args` 在函数声明侧和函数调用侧分别做什么？
35. `this: Type` 为什么不算真实运行时参数？
36. 为什么箭头函数不能通过 `call()` 改变 `this`？
37. `Iterable<T>`、`Iterator<T>` 和 `T[]` 的边界分别是什么？
38. 为什么上下文类型推导是“类型从外往里流”？
39. 为什么泛型不是 `any` 的高级写法？
40. 类型参数只出现在返回值里，为什么通常接近断言而不是安全泛型？
41. `Events[EventName]` 为什么能把事件名和 payload 类型绑定起来？

---

## 31. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)  
   读 Function Type Expressions、Call Signatures、Construct Signatures、Generic Functions、Optional Parameters、Function Overloads、Declaring `this` in a Function、`void`、`Function`、Rest Parameters and Arguments。

2. [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)  
   读 Hello World of Generics、Working with Generic Type Variables、Generic Types、Generic Interfaces、Generic Classes、Generic Constraints、Using Type Parameters in Generic Constraints、Generic Parameter Defaults。

3. [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)  
   重点读 Contextual Typing，理解“类型从位置反向流入表达式”。

4. [Iterators and Generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html)  
   读 Iterables、Iterable interface、for..of statements。TypeScript 类型部分和你之前的 JavaScript 迭代器训练合并理解。

5. [TSConfig strictBindCallApply](https://www.typescriptlang.org/tsconfig/strictBindCallApply.html)  
   理解 `call`、`apply`、`bind` 如何从原函数签名得到安全检查。

6. [TSConfig noImplicitThis](https://www.typescriptlang.org/tsconfig/noImplicitThis.html)  
   理解隐式 `this: any` 为什么危险。

7. [TSConfig strictFunctionTypes](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html)  
   理解函数参数位置为什么需要更严格的可赋值性检查。

---

## 32. 第 4 章最终记忆模型

```txt
Function in JavaScript:
  callable runtime object.
  can be passed around.
  can have properties.
  can have dynamic this.
  can be called with call/apply/bind.
  can be a generator.
  can be used with new if constructable.

Function in TypeScript:
  call signature controls legal calls.
  parameter annotations protect input boundary.
  return annotations protect output boundary.
  contextual typing flows expected types into callbacks.
  overloads describe multiple call shapes.
  generics preserve type relationships.
  constraints allow safe property access on generic values.
  default generic types provide fallback type arguments.
```

### 最终一句话

```txt
第 3 章让你描述值的形状。
第 4 章让你描述行为的边界。
真正的 TypeScript 函数学习，不是会写参数冒号，而是能把输入、输出、this、回调、重载和泛型关系建模清楚。
```

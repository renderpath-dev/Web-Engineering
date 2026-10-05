# TypeScript 第 5 章“类和接口”学习指导文件 v1

> 定位：这是 TypeScript 第 5 章“类和接口”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察编译错误或运行输出，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 5 章“类和接口”，TypeScript 官方 Handbook 的 Classes、Object Types、Declaration Merging、Mixins、Decorators，以及 TSConfig 官方文档中的 `strictPropertyInitialization`、`noImplicitOverride`、`useDefineForClassFields`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解 JavaScript class 的运行时对象模型，再理解 TypeScript 如何给 class、interface、继承、可见性、抽象类和设计模式加上静态约束。不要把类学成“对象写法的语法糖”或“面向对象模板”。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| class 字段、构造函数、方法、访问器、继承、`implements`、`extends`、可见性、`static`、泛型类、`this` 类型、参数属性、类表达式、构造签名、抽象类、结构化类关系 | [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) |
| interface、可选属性、只读属性、索引签名、扩展类型、intersection、interface extension vs intersection、generic object types | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) |
| interface 声明合并、namespace/type/value 三类声明空间 | [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) |
| mixin class expression pattern | [Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html) |
| decorator 语法、运行时调用、`experimentalDecorators` | [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) |
| 类属性初始化检查 | [TSConfig strictPropertyInitialization](https://www.typescriptlang.org/tsconfig/strictPropertyInitialization.html) |
| 子类重写父类成员时必须显式写 `override` | [TSConfig noImplicitOverride](https://www.typescriptlang.org/tsconfig/noImplicitOverride.html) |
| class fields 使用标准 ECMAScript 运行时语义 | [TSConfig useDefineForClassFields](https://www.typescriptlang.org/tsconfig/useDefineForClassFields.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 5 章完整学习顺序](#3-第-5-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：class 值、实例类型和静态侧](#5-00class-值实例类型和静态侧)
6. [01：类字段、初始化和 readonly](#6-01类字段初始化和-readonly)
7. [02：构造函数、参数属性和方法](#7-02构造函数参数属性和方法)
8. [03：继承、super 和 override](#8-03继承super-和-override)
9. [04：public、protected、private 和 JS private field](#9-04publicprotectedprivate-和-js-private-field)
10. [05：static 成员和泛型类](#10-05static-成员和泛型类)
11. [06：this 运行时绑定、箭头方法和 this 类型](#11-06this-运行时绑定箭头方法和-this-类型)
12. [07：接口 interface](#12-07接口-interface)
13. [08：声明合并](#13-08声明合并)
14. [09：implements](#14-09implements)
15. [10：实现接口还是扩展抽象类](#15-10实现接口还是扩展抽象类)
16. [11：类是结构化类型](#16-11类是结构化类型)
17. [12：类既声明值也声明类型](#17-12类既声明值也声明类型)
18. [13：混入、装饰器和 final 类预习](#18-13混入装饰器和-final-类预习)
19. [14：工厂模式和建造者模式](#19-14工厂模式和建造者模式)
20. [15：小项目整合](#20-15小项目整合)
21. [最终文件清单](#21-最终文件清单)
22. [最终学习笔记转换要求](#22-最终学习笔记转换要求)
23. [本章最终要能回答的问题](#23-本章最终要能回答的问题)
24. [TS 官方文档阅读清单](#24-ts-官方文档阅读清单)
25. [第 5 章最终记忆模型](#25-第-5-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个写类、写接口、触发类型检查、解释 class 运行时机制和 TypeScript 类型机制的训练指导。

类和接口这一章必须同时观察三件事：

```txt
JavaScript 运行时：
class 是构造函数和 prototype 机制的语法形式，会生成运行时值。

TypeScript 编译期：
class 同时产生实例类型、构造函数值和静态侧类型。
interface 只产生类型，不产生运行时代码。

对象模型：
继承、super、this、prototype、static、private field 都有具体运行时行为。
```

### 每节固定学习步骤

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

### 推荐 tsconfig

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictPropertyInitialization": true,
    "noImplicitOverride": true,
    "useDefineForClassFields": true,
    "strictNullChecks": true,
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
// Verify how this TypeScript class and interface example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

### 1.1 必补基础：先建立 class 成员存储模型

### 结论

这一章不能先背 `public`、`private`、`extends`、`implements`。必须先把 `class` 当成一个**创建对象的流程**来读。

最核心的一句话：**class 里的每个名字都要先判断它存在哪里。**

| 代码位置 | 例子 | 存储位置 | 生命周期 | 是否是初始化 |
|---|---|---|---|---|
| class 名 | `ProductRecord` | 模块作用域里的运行时值；类型空间里的实例类型名 | 模块加载后存在 | 不是实例初始化 |
| 实例字段名 | `title` / `this.title` | 每个实例对象上 | 跟实例一样久 | 需要 initializer 或 constructor assignment |
| 字段 initializer | `title = "Keyboard"` 的 `"Keyboard"` | 执行后写入当前实例字段 | 每次 `new` 执行一次 | 是 |
| constructor 参数 | `constructor(title: string)` 的 `title` | constructor 调用栈里的局部绑定 | constructor 执行期间 | 不是字段初始化 |
| constructor assignment | `this.title = title` | 把参数值写到当前实例字段 | 跟实例一样久 | 是 |
| 参数属性 | `constructor(public title: string)` | 只有在 constructor 参数位置触发的 TypeScript 特殊语法；编译输出会包含 `this.title = title` | 跟实例一样久 | 是 |
| 方法名 | `readTitle()` | 通常在 `ClassName.prototype` 上 | 被实例共享 | 不是字段初始化 |
| static 成员 | `static create()` | class 构造函数对象本身上 | 跟 class 值一样久 | 不是实例初始化 |

### 技术意义

你现在真正要学的不是“class 怎么写”，而是这条对象创建链路：

```txt
class declaration
  -> constructor value
  -> new expression
  -> instance allocation
  -> field initializer execution
  -> constructor body execution
  -> instance returned
```

TypeScript 在这条链路上做静态检查：

```txt
field type annotation
  -> checked by TypeScript
  -> erased from JavaScript
  -> does not create a usable runtime value

field initializer
  -> runtime expression
  -> creates or computes a value
  -> writes the value to the instance

constructor assignment
  -> runtime property write
  -> stores constructor input on the instance
```

所以：`title: string`、`title = "Keyboard"`、`constructor(title: string)`、`this.title = title` 是四件事，不是四种相同写法。

---

### class 最小结构应该怎么读

一个完整 class 可以包含这些区域：

```ts
class ProductRecord {
  static collectionName = "products";

  readonly id: string;
  title = "Untitled";
  private stockCount: number;

  constructor(id: string, stockCount: number) {
    this.id = id;
    this.stockCount = stockCount;
  }

  readLabel(): string {
    return `${this.id}:${this.title}:${this.stockCount}`;
  }
}
```

逐个位置读：

| 区域 | 例子 | 你要问的问题 |
|---|---|---|
| class 名 | `ProductRecord` | 这个名字是在值空间、类型空间，还是两边都存在？ |
| static 字段 | `static collectionName` | 这个成员属于 class 本身，还是属于每个实例？ |
| 字段声明 | `readonly id: string` | 这个字段有没有真实初始值？ |
| 字段 initializer | `title = "Untitled"` | `=` 右边表达式什么时候执行？ |
| constructor 参数 | `id: string` | 这个参数只是临时输入，还是会被保存到实例？ |
| constructor body | `this.id = id` | 哪些参数被写入当前实例？ |
| 方法 | `readLabel()` | 方法读取哪些实例字段？方法在 prototype 上还是实例上？ |

### 底层机制

`new ProductRecord("p1", 10)` 可以按这 6 步理解：

| 步骤 | 运行时动作 | 结果 |
|---|---|---|
| 1 | 找到 `ProductRecord` 这个 class 值 | 得到可被 `new` 调用的构造函数值 |
| 2 | 分配一个新实例对象 | 这个对象会连接到 `ProductRecord.prototype` |
| 3 | 执行实例字段 initializer | `title` 得到 `"Untitled"` |
| 4 | 调用 constructor | 参数 `id` 接收 `"p1"`，`stockCount` 接收 `10` |
| 5 | 执行 `this.id = id` 等赋值 | 参数值被保存到实例字段 |
| 6 | `new` 返回实例对象 | 变量接收这个实例引用 |

### 和当前学习主线的关系

第 3 章你学的是“值的形状”；第 4 章你学的是“函数调用的输入输出边界”；第 5 章开始，重点变成“对象如何被创建、保存长期状态、暴露行为”。

---



## 1.2 初始化、initializer、assignment：不要混成一个词

### 结论

初始化（initialization）的意思不是“写了字段名”，也不是“写了类型注解”。初始化的核心是：**实例对象在创建过程中获得真实字段值。**

initializer 的定义更具体：**initializer 是字段声明中 `=` 右边的表达式。**

```ts
class ProductDraft {
  status = "draft";
  createdAt = new Date();
  tags: string[] = [];
}
```

这里的 initializer 分别是：

| 字段 | initializer | 它创建什么值 |
|---|---|---|
| `status` | `"draft"` | 字符串值 |
| `createdAt` | `new Date()` | 新的 `Date` 对象 |
| `tags` | `[]` | 新的数组对象 |

`status: string;` 没有 initializer。`: string` 是类型注解，不是值。

### TypeScript 编译期模型

对 TypeScript 来说，`strictPropertyInitialization` 要求：非可选、类型不允许 `undefined` 的实例字段，必须能在 constructor 结束前被证明已经赋值。TypeScript 官方文档也说明，`strictPropertyInitialization` 控制 class 字段是否需要在 constructor 中初始化，字段 initializer 也会用于推导字段类型。

### JavaScript 运行时模型

对 JavaScript 来说，初始化就是实际执行代码，把值放到对象上。

```txt
new ProductDraft()
  -> allocate instance
  -> run status initializer
  -> run createdAt initializer
  -> run tags initializer
  -> run constructor body if present
  -> return instance
```

---



## 1.3 constructor 参数不是字段：参数只是一段临时输入

### 结论

constructor 参数和实例字段不是同一个东西。

```ts
class ProductRecord {
  constructor(title: string) {
    console.log(title);
  }
}
```

这段代码只说明：调用 `new ProductRecord(...)` 时必须传入一个 `string`，constructor 里面可以用参数名 `title`。它没有创建 `this.title`。

### 底层机制

| 名字 | 存储位置 | 生命周期 |
|---|---|---|
| `title` in `constructor(title: string)` | constructor 的局部作用域 | constructor 执行期间 |
| `this.title` | 当前实例对象 | 跟实例一样久 |

constructor 参数是函数参数。实例字段是对象属性。两者不在同一个存储区。

---


## 1.4 `this.field = parameter` 是把临时输入保存成长期状态

### 结论

`this.field = parameter` 不是 TypeScript 魔法。它是 JavaScript 对象属性写入。

```txt
this.field = parameter
  -> read parameter from constructor local scope
  -> write that value to the current instance object
```

这行代码解决的问题是：constructor 参数执行完就消失，所以需要把要长期保存的值写到 `this` 上。

---



## 1.5 parameter property 是简写，不是另一种对象模型

### 结论

参数属性（parameter property）只发生在 constructor 参数列表里。参数前面出现 `public`、`protected`、`private`、`readonly` 时，它不再是普通参数写法，而是 TypeScript 简写。

```ts
class ProductRecord {
  constructor(public readonly id: string) {}
}
```

概念上等价于：

```ts
class ProductRecord {
  public readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}
```

TypeScript 官方旧版 Handbook 也直接说明：参数属性用访问修饰符或 `readonly` 前缀声明，会创建并初始化对应成员。

这里必须拆清楚：赋值不是来自 `: string`，也不是来自“访问控制”这个词本身。赋值来自一个更窄的语法规则：**访问修饰符或 `readonly` 出现在 constructor 参数位置时，这个参数被 TypeScript 解析为 parameter property。**

### parameter property 的四种相邻写法

| 写法 | 名称 | 是否创建实例字段 | 是否保存 constructor 实参 | 方法里是否仍要写 `this.field` |
|---|---|---|---|---|
| `public title: string;` | class body field declaration | 是，声明实例字段 | 否，没有实参可保存 | 是 |
| `constructor(title: string) {}` | ordinary constructor parameter | 否 | 否，只是局部参数 | 没有字段可读 |
| `constructor(public title: string) {}` | parameter property | 是 | 是，TypeScript 生成赋值 | 是 |
| `constructor(title: string) { this.title = title; }` | explicit constructor assignment | 需要先有字段声明，或者 JS 运行时动态写入 | 是，手写赋值 | 是 |

所以不能总结成“写访问控制就不用 `this`”。正确总结是：

```txt
Only constructor parameters with public, protected, private, or readonly become parameter properties.
Parameter properties generate instance fields and constructor assignments.
Methods still access instance state through this.field.
```

### parameter property 的编译后核心形态

TypeScript 源码：

```ts
class ProductRecord {
  constructor(public title: string) {}
}
```

核心 JavaScript 输出可以按这个模型理解：

```js
class ProductRecord {
  title;

  constructor(title) {
    this.title = title;
  }
}
```

真正保存值的是输出里的这一句：

```js
this.title = title;
```

`public` 决定 TypeScript 类型层的可访问性；`: string` 决定 TypeScript 类型检查；`constructor 参数位置 + public` 触发 parameter property 语法；最终保存实例状态的是编译输出里的 `this.title = title`。

---



## 1.6 method implementation、method signature、constructor implementation 不要混

### 结论

implementation 指的是“有函数体的实现代码”。

| 写法 | 名称 | 是否有运行时实现 |
|---|---|---|
| `serialize(): string;` in interface | method signature | 否 |
| `serialize(): string { return ""; }` in class | method implementation | 是 |
| `constructor(id: string);` | constructor overload signature | 否 |
| `constructor(id: string) { this.id = id; }` | constructor implementation | 是 |

所以你看到 class 时，不要把 `this.field = parameter` 叫做 implementation。它更准确叫 constructor assignment。constructor 的整个 `{ ... }` 函数体才是 implementation body。

---


## 1.7 readonly、`!`、`declare` 都不是同一个东西

### readonly 的初始化窗口

`readonly` 不表示永远不能赋值。它表示：实例创建完成后，不能再重新赋值。

可以赋值的位置：

| 位置 | 是否允许 |
|---|---|
| field initializer | 允许 |
| constructor body | 允许 |
| ordinary method | 不允许 |
| outside code | 不允许 |




## 1.8 继承里的初始化顺序：父类 constructor 不能依赖子类字段

### 结论

普通类和派生类初始化顺序不同。

没有继承时：

```txt
new BaseRecord()
  -> allocate instance
  -> run base field initializers
  -> run base constructor body
  -> return instance
```

有继承时：

```txt
new DerivedRecord()
  -> enter derived constructor
  -> call super
  -> run base field initializers
  -> run base constructor body
  -> return from super
  -> run derived field initializers
  -> run derived constructor body after super
  -> return instance
```

TypeScript 官方 Classes 文档也说明，派生类字段会在父类 constructor 完成后初始化。


## 1.9 最终判断流程：看到 class 先走这两个流程

### 判断字段

```txt
field reading flow
  -> is it static or instance
  -> does it have an equals sign
  -> if yes, the right side is the initializer
  -> if no, does the type allow undefined
  -> if no, is it assigned on every constructor path
  -> if no, is it a parameter property
  -> if no, is it using a checker escape hatch
  -> before a method reads it, where did the runtime value come from
```

### 判断 constructor 参数

```txt
constructor parameter flow
  -> what argument is passed by new
  -> is the parameter only used temporarily
  -> does any method need the value later
  -> if yes, where is this.field assigned
  -> if a parameter property is used, expand it mentally
```

### 判断方法

```txt
method reading flow
  -> is it a method signature or an implementation
  -> if it has a body, it exists at runtime
  -> if it reads this.field, find where that field was initialized
  -> if the method is detached, this may be lost
  -> if it is an arrow field, the function is created per instance
```

### 本节最终记忆模型

```txt
Class declaration:
  creates a runtime constructor value and a TypeScript instance type.

new expression:
  creates an instance object.

Field:
  state stored on each instance.

Field initializer:
  expression after equals in a class field.
  runs during instance creation.

Type annotation:
  compile-time description.
  not a runtime value.
  not initialization.

Constructor parameter:
  local binding during constructor execution.
  not stored automatically.

Constructor assignment:
  this.field = parameter.
  stores constructor input on the instance.

Parameter property:
  TypeScript shortcut for field declaration plus constructor assignment.

Method implementation:
  method declaration with a body.
  usually stored on the prototype.

Static member:
  stored on the class constructor value.
  not stored on instances.

Definite assignment assertion:
  skips a checker error.
  does not create a reliable runtime value.
```

---


## 2. 项目重新整理建议

### 结论

第 5 章建议单独建立：

```txt
typescript/chapter-05-classes-interfaces/
```

第 3 章训练“值的类型建模”，第 4 章训练“行为边界和类型关系”，第 5 章训练“对象模型、实例状态、继承关系和抽象边界”。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json

  chapter-03-types/
  chapter-04-functions/

  chapter-05-classes-interfaces/
    README.md
    00-class-value-and-type/
      classBlueprintVsInstance.ts
      classMemberStorageMap.ts
      classValueAndInstanceType.ts
      interfaceErasureBoundary.ts
    01-fields-initialization/
      initializerMeaning.ts
      fieldDeclarationIsNotValue.ts
      fieldInitialization.ts
      strictPropertyInitialization.ts
      readonlyConstructorAssignment.ts
      readonlyInitializationWindow.ts
      definiteAssignmentIsNotInitialization.ts
      derivedInitializationOrder.ts
      declareFieldNoInitializer.ts
    02-constructors-methods/
      constructorParameterStorage.ts
      constructorAssignmentStorage.ts
      constructorAssignmentDecision.ts
      parameterPropertyExpansion.ts
      parameterPropertyEmitProof.ts
      classMethodImplementationVsInterfaceSignature.ts
      constructorTyping.ts
      parameterProperties.ts
      methodThisAccess.ts
    03-inheritance-super-override/
      extendsBasics.ts
      superCallOrder.ts
      superMethodAccess.ts
      overrideSubtypeRule.ts
    04-visibility-private-fields/
      publicProtectedPrivate.ts
      softPrivateVsHardPrivate.ts
    05-static-generic-classes/
      staticFactoryMethod.ts
      genericClass.ts
      staticGenericTypeParameterMistake.ts
    06-this-runtime-and-this-types/
      lostThisContext.ts
      arrowMethodProperty.ts
      fluentThisReturn.ts
      thisBasedTypeGuard.ts
    07-interfaces/
      interfaceShape.ts
      optionalReadonlyInterface.ts
      interfaceExtends.ts
      intersectionConflict.ts
    08-declaration-merging/
      interfaceMerging.ts
      incompatibleInterfaceMerging.ts
    09-implements/
      implementsContract.ts
      implementsDoesNotInferMethodParams.ts
      optionalPropertyNotCreated.ts
    10-interface-vs-abstract-class/
      interfaceOnlyContract.ts
      abstractClassSharedImplementation.ts
    11-structural-class-types/
      compatibleClasses.ts
      privateBreaksStructuralCompatibility.ts
    12-class-value-and-type-space/
      classAsTypeAndValue.ts
      typeofClassConstructor.ts
      instanceTypeUtility.ts
    13-advanced-class-patterns/
      timestampedMixin.ts
      classDecoratorPreview.ts
      privateConstructor.ts
    14-factory-builder-patterns/
      paymentFactory.ts
      requestBuilder.ts
    15-mini-project/
      typedRepository.ts
      typedDomainModel.ts

notes/
  typescript.md
```

### `typescript/README.md`

这个文件放在 `typescript/` 根目录，用来说明练习入口和章节边界。

```txt
# TypeScript Learning Workspace

Chapters

- chapter-03-types
- chapter-04-functions
- chapter-05-classes-interfaces

Commands

- npm run check
- npm run build
```

### `typescript/package.json`

这个文件放在 `typescript/` 根目录，用来固定本章练习需要的 TypeScript 命令。

```json
{
  "type": "module",
  "scripts": {
    "check": "tsc --noEmit",
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  }
}
```

### `typescript/tsconfig.json`

这个文件放在 `typescript/` 根目录，用来开启本章 class 练习需要的严格检查。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictPropertyInitialization": true,
    "noImplicitOverride": true,
    "useDefineForClassFields": true,
    "strictNullChecks": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### `chapter-05-classes-interfaces/README.md`

这个文件只做章节索引，不放机制示例代码。它应该记录本章练习目录、运行命令和完成状态。

```txt
# TypeScript Chapter 05 Classes and Interfaces

Commands:
  npx tsc --noEmit

Practice folders

- 00-class-value-and-type
- 01-fields-initialization
- 02-constructors-methods
- 03-inheritance-super-override
- 04-visibility-private-fields
- 05-static-generic-classes
- 06-this-runtime-and-this-types
- 07-interfaces
- 08-declaration-merging
- 09-implements
- 10-interface-vs-abstract-class
- 11-structural-class-types
- 12-class-value-and-type-space
- 13-advanced-class-patterns
- 14-factory-builder-patterns
- 15-mini-project
```

### 结构一致性规则

本章以后只以第 21 节“最终文件清单”为文件结构来源。第 2 节“推荐结构”和第 21 节“最终文件清单”必须完全一致。

具体规则：

| 文件类型 | 对齐规则 |
|---|---|
| `.ts` 练习文件 | 必须同时出现在第 21 节文件清单、对应小节的“文件结构”、正文文件标题和代码块中。 |
| `README.md` | 是章节索引文件，不承载 TypeScript 机制示例。 |
| `notes/typescript.md` | 是练习完成后的最终笔记输出文件，不把本指导文件直接复制进去。 |
| 目录名 | 只表示组织边界，不需要单独代码块。 |

---

## 3. 第 5 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
class 值和实例类型
  -> 类字段和初始化
  -> 构造函数、参数属性、readonly
  -> 方法和访问器
  -> 继承、super、override
  -> public / protected / private / #private
  -> static 成员和泛型类
  -> this 运行时绑定和 this 类型
  -> interface 基础
  -> interface 扩展和 intersection
  -> 声明合并
  -> implements
  -> interface vs abstract class
  -> class structural typing
  -> class value/type 双重身份
  -> mixin / decorator / final 类预习
  -> factory pattern
  -> builder pattern
  -> 小项目整合
```

### 技术意义

第 5 章让你描述“对象的长期结构”：对象如何被创建、保存什么状态、暴露什么方法、允许谁访问、如何被替换、如何被继承。

---

## 4. 本章先要建立的底层模型

### 结论

TypeScript 的类和接口要分成四层理解：

```txt
runtime value layer:
  class declaration creates a constructor function value.

prototype layer:
  instance methods live on prototype.
  extends links prototype chains.
  super resolves methods through the parent prototype.

static type layer:
  class name can be used as the instance type.
  interface describes a structural contract.
  private/protected affect type compatibility.

erasure layer:
  interface and most type-only syntax disappear from emitted JavaScript.
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| 实例侧（instance side） | `new ClassName()` 创建出来的对象拥有的字段和方法。 |
| 静态侧（static side） | 类构造函数对象本身拥有的属性和方法。 |
| 字段（field） | 每个实例上的数据属性。 |
| 方法（method） | 通常存在于 prototype 上的函数。 |
| 构造函数（constructor） | `new` 时运行，用来初始化实例。 |
| `super` | 在子类中访问父类构造函数或父类方法的语法。 |
| `override` | 显式声明“这个成员正在重写父类成员”。 |
| 接口（interface） | 只存在于类型系统中的对象形状声明。 |
| 抽象类（abstract class） | 不能直接实例化，可以包含抽象成员和具体实现。 |
| 结构化类型（structural typing） | 类型兼容性主要看形状，而不是声明名或继承关系。 |

---

## 5. 00：class 值、实例类型和静态侧

### 结论

`class` 在 JavaScript 里会创建运行时构造函数值；在 TypeScript 里还会创建一个同名实例类型。


### 本节新概念先解释

这一节先解决一个根本问题：`class` 不是实例对象本身，而是一套可以被 `new` 使用的创建规则。运行时的 `ProductRecord` 是 class value，它可以被 `typeof` 观察，也可以被 `new` 调用；`new ProductRecord()` 返回的 `productRecord` 才是实例对象。

同一个 class 里会同时出现几个不同层级的名字：

| 名字位置 | 例子 | 它属于哪里 | 你应该怎么读 |
|---|---|---|---|
| class 名 | `ProductRecord` | 运行时值空间和 TypeScript 类型空间 | 值空间里是构造函数对象，类型空间里通常表示实例类型。 |
| 实例字段 | `title` | 每次 `new` 创建出来的实例对象 | 字段名会成为实例对象上的 property key。 |
| 方法 | `readTitle()` | 通常在 `ProductRecord.prototype` 上 | 实例能调用它，但方法函数通常不是每个实例单独保存一份。 |
| static 成员 | `static entityName` | `ProductRecord` 这个 class value 本身 | 它属于类构造函数对象，不属于实例。 |

所以看到 `console.log(typeof ProductRecord)` 时，你观察的是 class value；看到 `productRecord.title` 时，你观察的是实例对象上的 property；看到 `productRecord.readTitle()` 时，你通过实例访问 prototype 上的方法。

本节的代码不是为了背输出，而是为了建立这条边界：class value 负责创建对象；instance object 保存每个对象自己的状态；prototype 保存实例共享的方法；static side 保存类本身的成员。

### 文件结构

```txt
00-class-value-and-type/
  classBlueprintVsInstance.ts
  classMemberStorageMap.ts
  classValueAndInstanceType.ts
  interfaceErasureBoundary.ts
```

### `classBlueprintVsInstance.ts`
```ts
// Goal:
// Distinguish a class value from an instance object.

// Expected output:
// function
// Keyboard
// Keyboard

export {};

class ProductRecord {
  title = "Keyboard";

  readTitle(): string {
    return this.title;
  }
}

console.log(typeof ProductRecord);

const productRecord = new ProductRecord();

console.log(productRecord.title);
console.log(productRecord.readTitle());
```

### 代码逐行解释

`class ProductRecord {` 创建一个运行时 class 值。这个名字在值空间可以被 `new` 使用，在类型空间也可以表示实例类型。定义 class 不会立刻创建实例。

`title = "Keyboard";` 是实例字段加字段 initializer。每次执行 `new ProductRecord()`，都会给新实例写入 `title` 字段，值为 `"Keyboard"`。

`readTitle(): string { ... }` 是实例方法实现（method implementation）。它有函数体，所以运行时存在。方法内部的 `this.title` 会读取当前调用者实例上的 `title` 字段。

`console.log(typeof ProductRecord);` 读取 class 运行时值。JavaScript 中 class 是特殊的构造函数值，所以输出 `function`。

`const productRecord = new ProductRecord();` 创建一个实例。字段 initializer 在实例创建过程中执行，所以 `productRecord.title` 已经有值。

### 执行过程

| 步骤 | 执行内容 | 运行时发生什么 | 当前关键值 |
|---|---|---|---|
| 1 | 定义 class | 创建 `ProductRecord` class 值 | 还没有实例 |
| 2 | 输出 `typeof ProductRecord` | 读取 class 值类型 | `function` |
| 3 | 执行 `new ProductRecord()` | 分配实例并执行字段 initializer | `title` 是 `"Keyboard"` |
| 4 | 读取 `productRecord.title` | 从实例对象上读取字段 | `Keyboard` |
| 5 | 调用 `productRecord.readTitle()` | `this` 指向 `productRecord` | 返回 `Keyboard` |

---

---

### `classMemberStorageMap.ts`
```ts
// Goal:
// Show where instance fields, prototype methods, and static members are stored.

// Expected output:
// Product
// true
// false
// true
// false

export {};

class ProductRecord {
  static entityName = "Product";

  title = "Keyboard";

  readTitle(): string {
    return this.title;
  }
}

const productRecord = new ProductRecord();

console.log(ProductRecord.entityName);
console.log(Object.hasOwn(productRecord, "title"));
console.log(Object.hasOwn(productRecord, "readTitle"));
console.log(Object.hasOwn(ProductRecord.prototype, "readTitle"));
console.log(Object.hasOwn(productRecord, "entityName"));
```

### 为什么这个文件重要

这段代码把 class 拆成三个存储位置：

| 成员 | 存储位置 | 说明 |
|---|---|---|
| `title` | 实例对象自身 | 每个实例都有自己的字段值。 |
| `readTitle` | `ProductRecord.prototype` | 方法通常由所有实例共享。 |
| `entityName` | `ProductRecord` class 值本身 | static 成员不在实例上。 |

### 执行过程

| 步骤 | 执行内容 | 结果 |
|---|---|---|
| 1 | 创建 `ProductRecord` class 值 | class 本身拥有 `entityName` |
| 2 | 创建 `productRecord` 实例 | 实例自身拥有 `title` |
| 3 | 检查实例是否自有 `readTitle` | `false` |
| 4 | 检查 prototype 是否自有 `readTitle` | `true` |
| 5 | 检查实例是否自有 static 字段 | `false` |

### 常见错误

错误理解：以为 class 里所有成员都放在实例对象上。

正确模型：字段通常在实例上，普通方法通常在 prototype 上，static 成员在 class 构造函数对象上。

---

---

### `classValueAndInstanceType.ts`

```ts
// Goal:
// Distinguish a class runtime value from its instance type.

// Expected result:
// The compiler accepts this file and Node prints the product title.

export {};

class ProductRecord {
  constructor(
    public readonly id: string,
    public title: string,
  ) {}
}

const productRecord: ProductRecord = new ProductRecord("p1", "Keyboard");

console.log(typeof ProductRecord);
console.log(productRecord.title);
```

### 预期输出

```txt
function
Keyboard
```

### `interfaceErasureBoundary.ts`

```ts
// Goal:
// Verify that interface is erased but class remains as a runtime value.

// Expected result:
// The compiler accepts this file and Node prints values.

export {};

interface SerializableRecord {
  serialize(): string;
}

class UserRecord implements SerializableRecord {
  constructor(public id: string) {}

  serialize(): string {
    return JSON.stringify({ id: this.id });
  }
}

const userRecord = new UserRecord("u1");

console.log(typeof UserRecord);
console.log(userRecord.serialize());
```

### 常见错误

```ts
// Goal:
// Show that an interface is not a runtime value.

// Expected result:
// The compiler rejects using an interface as a value.

export {};

interface OrderRecord {
  id: string;
}

// @ts-expect-error: OrderRecord is a type, not a runtime value.
console.log(OrderRecord);
```

---

## 6. 01：类字段、初始化和 readonly

### 结论

类字段表示每个实例拥有的数据。开启 `strictPropertyInitialization` 后，非可选、非 `undefined`、非 definite assignment 的字段必须在声明处或构造函数里初始化。


### 本节新概念先解释

这一节的关键不是“字段怎么写”，而是区分 field declaration、field initializer、constructor assignment 三个位置。

`totalCents: number;` 这种写法声明的是实例对象将来应该有的 property key 和 TypeScript 规则。它没有 `=`，所以没有提供运行时值。`createdAt = new Date()` 这种写法有 `=`，右边的 `new Date()` 是 initializer，会在每次 `new` 时执行并把结果写到当前实例上。

constructor assignment 是另一种初始化来源：字段声明在 class body 里，真实值在 constructor 里通过 `this.field = value` 写入。它适合值来自创建对象时的输入、校验结果或计算结果的场景。

本节要把这张表牢牢记住：

| 写法 | 是否声明字段 | 是否提供真实值 | 值来自哪里 |
|---|---:|---:|---|
| `title: string;` | 是 | 否 | 没有值，必须由其他位置初始化。 |
| `title = "Keyboard";` | 是 | 是 | 字段 initializer。 |
| `constructor(title: string)` | 否 | 否 | 只是 constructor 局部参数。 |
| `this.title = title` | 否，使用已有字段 | 是 | constructor assignment。 |
| `title!: string` | 是 | 否 | 只是跳过检查，不创建可靠值。 |
| `declare title: string` | 类型声明用途 | 否 | 不发出字段初始化代码。 |

`strictPropertyInitialization` 检查的不是“你有没有写字段名”，而是“constructor 结束前，实例字段是否一定拿到了真实值”。

### 文件结构

```txt
01-fields-initialization/
  initializerMeaning.ts
  fieldDeclarationIsNotValue.ts
  fieldInitialization.ts
  strictPropertyInitialization.ts
  readonlyConstructorAssignment.ts
  readonlyInitializationWindow.ts
  definiteAssignmentIsNotInitialization.ts
  derivedInitializationOrder.ts
  declareFieldNoInitializer.ts
```

### `initializerMeaning.ts`
```ts
// Goal:
// Show that field initializers run once for each new instance.

// Expected output:
// draft
// draft
// 1
// 0
// false

export {};

class ProductDraft {
  status = "draft";
  createdAt = new Date();
  tags: string[] = [];

  addTag(tagName: string): void {
    this.tags.push(tagName);
  }
}

const firstDraft = new ProductDraft();
const secondDraft = new ProductDraft();

firstDraft.addTag("sale");

console.log(firstDraft.status);
console.log(secondDraft.status);
console.log(firstDraft.tags.length);
console.log(secondDraft.tags.length);
console.log(firstDraft.tags === secondDraft.tags);
```

### 代码逐行解释

`status = "draft"` 在每次实例创建时执行，把字符串写入当前实例。

`createdAt = new Date()` 在每次实例创建时执行，所以每个实例得到不同的 `Date` 对象。

`tags: string[] = []` 同时包含类型注解和 initializer。`: string[]` 只给 TypeScript 检查数组元素类型；`[]` 才是运行时创建数组的表达式。

`firstDraft.addTag("sale")` 修改第一个实例自己的数组，不影响第二个实例。

### 为什么最后是 `false`

两个实例分别执行了 `[]` initializer。每次执行数组字面量都会创建一个新数组对象，所以 `firstDraft.tags` 和 `secondDraft.tags` 不是同一个引用。

---

---

### `fieldDeclarationIsNotValue.ts`
```ts
// Goal:
// Show that a field type annotation is not a runtime value.

// Expected result:
// The compiler rejects the uninitialized field.

export {};

class BrokenProductRecord {
  // @ts-expect-error: The field has no initializer and is not definitely assigned.
  title: string;
}

console.log(typeof BrokenProductRecord);
```

### 为什么这个错误必须讲清楚

`title: string;` 里面有两个东西：

| 部分 | 层级 | 作用 |
|---|---|---|
| `title` | class field syntax | 声明这个类的实例应该有 `title` 字段。 |
| `: string` | TypeScript type system | 声明字段值应该是 `string`。 |

但它没有 `=`，也没有 constructor assignment，所以没有任何代码提供真实字符串值。

对比：

```ts
class ProductRecord {
  title = "Keyboard";
}
```

这里 `"Keyboard"` 才是运行时值。

---

---

### `fieldInitialization.ts`

```ts
// Goal:
// Initialize class fields in field declarations and constructors.

// Expected result:
// The compiler accepts this file and Node prints the account label.

export {};

class AccountRecord {
  status = "active";
  displayName: string;

  constructor(displayName: string) {
    this.displayName = displayName;
  }

  createLabel(): string {
    return `${this.displayName}:${this.status}`;
  }
}

const accountRecord = new AccountRecord("Ada");

console.log(accountRecord.createLabel());
```

### `strictPropertyInitialization.ts`

```ts
// Goal:
// Verify strict property initialization.

// Expected result:
// The compiler rejects the uninitialized field.

export {};

class BrokenProfileRecord {
  // @ts-expect-error: This field is not initialized.
  displayName: string;

  createdAt = new Date();
}

const profileRecord = new BrokenProfileRecord();

console.log(profileRecord.createdAt.toISOString());
```

### `readonlyConstructorAssignment.ts`

```ts
// Goal:
// Verify that readonly fields can be assigned in the constructor but not later.

// Expected result:
// The compiler rejects reassignment outside the constructor.

export {};

class SessionRecord {
  readonly sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  changeSessionId(nextSessionId: string): void {
    // @ts-expect-error: A readonly field cannot be reassigned here.
    this.sessionId = nextSessionId;
  }
}

const sessionRecord = new SessionRecord("s1");

console.log(sessionRecord.sessionId);
```

### `readonlyInitializationWindow.ts`
```ts
// Goal:
// Show where a readonly field can be assigned.

// Expected output:
// s1
// true

export {};

class SessionRecord {
  readonly sessionId: string;
  readonly createdAt = new Date();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  replaceSessionId(nextSessionId: string): void {
    // @ts-expect-error: A readonly field cannot be reassigned here.
    this.sessionId = nextSessionId;
  }
}

const sessionRecord = new SessionRecord("s1");

console.log(sessionRecord.sessionId);
console.log(sessionRecord.createdAt instanceof Date);
```

### `!` definite assignment assertion

`field!: Type` 只是让 TypeScript 相信字段会在使用前被赋值。它不创建可靠值。

---

### `definiteAssignmentIsNotInitialization.ts`
```ts
// Goal:
// Show that definite assignment assertion does not create a runtime value.

// Expected output:
// true

export {};

class BrokenSessionRecord {
  sessionId!: string;

  readUpperSessionId(): string {
    return this.sessionId.toUpperCase();
  }
}

const sessionRecord = new BrokenSessionRecord();

try {
  console.log(sessionRecord.readUpperSessionId());
} catch (errorValue) {
  console.log(errorValue instanceof TypeError);
}
```

### `declare` 字段

`declare field: Type` 是类型声明工具，不是初始化工具。它告诉 TypeScript 这个字段存在于类型层面，但不要为这个字段生成运行时代码。

---

### `derivedInitializationOrder.ts`
```ts
// Goal:
// Show initialization order between base fields, base constructor, and derived fields.

// Expected output:
// base constructor:base-field
// derived constructor:derived-field

export {};

class BaseRecord {
  label = "base-field";

  constructor() {
    console.log(`base constructor:${this.label}`);
  }
}

class DerivedRecord extends BaseRecord {
  override label = "derived-field";

  constructor() {
    super();
    console.log(`derived constructor:${this.label}`);
  }
}

new DerivedRecord();
```

### 为什么得到这个输出

`new DerivedRecord()` 先进入子类 constructor，但子类 constructor 不能在 `super()` 前使用 `this`。

`super()` 执行父类初始化。父类字段 initializer 先把 `label` 写成 `"base-field"`，然后父类 constructor 输出这个值。

`super()` 返回后，子类字段 initializer 才执行，把 `label` 改成 `"derived-field"`。所以子类 constructor 后面的输出是 `derived-field`。

---

---

### `declareFieldNoInitializer.ts`
```ts
// Goal:
// Show that declare changes type information without emitting a field initializer.

// Expected output:
// Base Product

export {};

class BaseProductRecord {
  title = "Base Product";
}

class SpecializedProductRecord extends BaseProductRecord {
  declare title: string;
}

const productRecord = new SpecializedProductRecord();

console.log(productRecord.title);
```

### 三者对比

| 写法 | 是否提供真实值 | 是否跳过检查 | 是否适合普通初始化 |
|---|---|---|---|
| `title = "Keyboard"` | 是 | 不需要跳过 | 是 |
| `constructor(...) { this.title = ... }` | 是 | 不需要跳过 | 是 |
| `title!: string` | 否 | 是 | 否 |
| `declare title: string` | 否 | 类型声明用途 | 否 |

---

---

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 为了消除报错到处写 `!` | `!` 是跳过初始化检查，不是初始化。 |
| 以为字段类型注解会自动赋值 | 类型注解不会生成值。 |
| 以为 `readonly` 是深度不可变 | 它只限制属性本身不能被重新赋值。 |

---

## 7. 02：构造函数、参数属性和方法

### 结论

构造函数负责初始化实例；参数属性是 TypeScript 专用简写，可以把构造函数参数直接变成实例字段；类方法描述实例可以执行的行为。


### 本节新概念先解释

constructor 是实例创建过程中的初始化函数。constructor 括号里的参数和 class body 里的字段不是同一个东西，即使它们同名也不是同一个存储位置。

直接写 `id` 时，查找的是 constructor 当前作用域里的局部参数；写 `this.id` 时，访问的是这次 `new` 创建出来的实例对象上的 property。`this.id = id` 的意义就是把临时参数值保存成实例长期状态。

这一节要建立三个判断问题：

| 问题 | 判断方式 |
|---|---|
| 参数是不是会自动保存到实例？ | 不会。普通 constructor 参数只在 constructor 执行期间存在。 |
| 方法以后要读这个值怎么办？ | 必须通过 field initializer、constructor assignment 或 parameter property 保存到实例。 |
| parameter property 为什么特殊？ | 因为访问修饰符或 `readonly` 出现在 constructor 参数位置时，TypeScript 把它展开成字段声明加赋值。 |

所以 `constructor(public readonly id: string) {}` 不是因为 `: string` 产生值，也不是因为 `public` 单独产生值，而是因为这个语法位置触发了 parameter property 规则。它概念上等价于 class body 字段声明再加 constructor 里的 `this.id = id`。

### 文件结构

```txt
02-constructors-methods/
  constructorParameterStorage.ts
  constructorAssignmentStorage.ts
  constructorAssignmentDecision.ts
  parameterPropertyExpansion.ts
  parameterPropertyEmitProof.ts
  classMethodImplementationVsInterfaceSignature.ts
  constructorTyping.ts
  parameterProperties.ts
  methodThisAccess.ts
```

### `constructorParameterStorage.ts`
```ts
// Goal:
// Show that constructor parameters are not stored on the instance automatically.

// Expected result:
// The compiler rejects reading this.title.

export {};

class BrokenProductRecord {
  constructor(title: string) {
    console.log(title);
  }

  readTitle(): string {
    // @ts-expect-error: The class has no title field.
    return this.title;
  }
}

const productRecord = new BrokenProductRecord("Keyboard");

console.log(productRecord.readTitle());
```

### TypeScript 编译期过程

| 步骤 | TypeScript 检查什么 |
|---|---|
| 1 | constructor 有一个参数 `title: string`。 |
| 2 | 类体没有声明 `title` 实例字段。 |
| 3 | `this.title` 试图访问实例字段。 |
| 4 | 编译器找不到这个字段，所以报错。 |

### JavaScript 运行时过程

| 步骤 | 运行时发生什么 |
|---|---|
| 1 | `new BrokenProductRecord("Keyboard")` 调用 constructor。 |
| 2 | 参数 `title` 接收字符串。 |
| 3 | constructor 输出这个参数。 |
| 4 | constructor 执行结束，参数绑定消失。 |
| 5 | `readTitle()` 读取 `this.title`。 |
| 6 | 实例上没有 `title` 字段，结果是 `undefined`。 |

### 最终判断

你能在 constructor 里使用参数，不代表实例保存了参数。后续方法要读取这个值，就必须看到：

| 合格来源 | 例子 |
|---|---|
| field initializer | `title = "Keyboard"` |
| constructor assignment | `this.title = title` |
| parameter property | `constructor(public title: string)` |

---

---

### `constructorAssignmentStorage.ts`
```ts
// Goal:
// Store constructor input on the instance through this assignment.

// Expected output:
// p1:Keyboard:10

export {};

class ProductRecord {
  readonly id: string;
  title: string;
  private stockCount: number;

  constructor(id: string, title: string, stockCount: number) {
    this.id = id;
    this.title = title;
    this.stockCount = stockCount;
  }

  readLabel(): string {
    return `${this.id}:${this.title}:${this.stockCount}`;
  }
}

const productRecord = new ProductRecord("p1", "Keyboard", 10);

console.log(productRecord.readLabel());
```

### 代码逐行解释

`readonly id: string;` 声明实例字段 `id`。它没有 initializer，所以必须由 constructor assignment 初始化。

`title: string;` 声明实例字段 `title`。类型是 `string`，但类型注解不提供值。

`private stockCount: number;` 声明私有实例字段。它必须在类内部初始化并使用。

`constructor(id: string, title: string, stockCount: number)` 声明三个 constructor 参数。参数名和字段名相同只是命名选择；左边的 `this.id` 和右边的 `id` 不是同一个存储位置。

`this.id = id` 把 constructor 参数 `id` 的值保存到当前实例字段 `id`。

`readLabel()` 后续能读到这些字段，是因为 constructor 已经把参数值存进实例。

### 什么时候写 constructor assignment

| 你问的问题 | 结论 |
|---|---|
| 这个值是不是来自 `new` 的实参？ | 通常需要 constructor 参数。 |
| 方法以后还要用这个值吗？ | 必须保存到 `this.field`。 |
| 每个实例的值是否不同？ | 通常用 constructor assignment。 |
| 是否需要校验后再保存？ | 用显式 constructor assignment。 |
| 是否只是 constructor 里的临时计算值？ | 不要保存到实例。 |
| 是否有固定默认值？ | 优先用 field initializer。 |

---

---

### `constructorAssignmentDecision.ts`
```ts
// Goal:
// Decide which constructor values should become instance fields.

// Expected output:
// s1
// 3500
// closed
// true

export {};

class CheckoutSession {
  readonly sessionId: string;
  readonly createdAt = new Date();
  status: "open" | "closed" = "open";
  totalCents: number;

  constructor(sessionId: string, itemPrices: readonly number[]) {
    const computedTotal = itemPrices.reduce((totalValue, priceValue) => {
      return totalValue + priceValue;
    }, 0);

    this.sessionId = sessionId;
    this.totalCents = computedTotal;
  }

  close(): void {
    this.status = "closed";
  }
}

const session = new CheckoutSession("s1", [1000, 2500]);

session.close();

console.log(session.sessionId);
console.log(session.totalCents);
console.log(session.status);
console.log(session.createdAt instanceof Date);
```

### 为什么这样设计

| 名字 | 是否保存到实例 | 原因 |
|---|---|---|
| `sessionId` | 是 | 后续要长期识别 session。 |
| `createdAt` | 是 | 每个实例创建时自动生成。 |
| `status` | 是 | 实例状态会被 `close()` 修改。 |
| `itemPrices` | 否 | 只是 constructor 的输入材料。 |
| `computedTotal` | 否 | 只是局部计算结果。 |
| `totalCents` | 是 | 计算结果需要长期保存。 |

---

---

### `parameterPropertyExpansion.ts`
```ts
// Goal:
// Expand parameter properties into explicit fields and assignments.

// Expected output:
// p1
// true
// p2
// true

export {};

class ExplicitProductRecord {
  public readonly id: string;
  public title: string;
  private stockCount: number;

  constructor(id: string, title: string, stockCount: number) {
    this.id = id;
    this.title = title;
    this.stockCount = stockCount;
  }

  hasStock(): boolean {
    return this.stockCount > 0;
  }
}

class ShorthandProductRecord {
  constructor(
    public readonly id: string,
    public title: string,
    private stockCount: number,
  ) {}

  hasStock(): boolean {
    return this.stockCount > 0;
  }
}

const explicitProduct = new ExplicitProductRecord("p1", "Keyboard", 10);
const shorthandProduct = new ShorthandProductRecord("p2", "Mouse", 5);

console.log(explicitProduct.id);
console.log(explicitProduct.hasStock());
console.log(shorthandProduct.id);
console.log(shorthandProduct.hasStock());
```

---

### `parameterPropertyEmitProof.ts`
```ts
// Goal:
// Prove that a parameter property creates an own instance field.

// Expected output:
// true
// true
// false
// Mouse

export {};

class ExplicitProductRecord {
  public title: string;

  constructor(title: string) {
    this.title = title;
  }
}

class ParameterPropertyProductRecord {
  constructor(public title: string) {}
}

class PlainParameterProductRecord {
  constructor(title: string) {
    console.log(title.length > 0);
  }
}

const explicitProduct = new ExplicitProductRecord("Keyboard");
const parameterProduct = new ParameterPropertyProductRecord("Mouse");
const plainProduct = new PlainParameterProductRecord("Monitor");

console.log(Object.hasOwn(explicitProduct, "title"));
console.log(Object.hasOwn(parameterProduct, "title"));
console.log(Object.hasOwn(plainProduct, "title"));
console.log(parameterProduct.title);
```

### 为什么这个文件能证明 parameter property 不是普通参数

`ExplicitProductRecord` 手写字段声明和 `this.title = title`，所以实例对象自己拥有 `title` 字段。

`ParameterPropertyProductRecord` 没有手写 `this.title = title`，但 constructor 参数用了 `public title: string`，所以 TypeScript 把它当成 parameter property，编译输出会保存这个值。实例对象也拥有 `title` 字段。

`PlainParameterProductRecord` 的 `title` 只是普通 constructor 参数。constructor 执行时可以读取它，但 constructor 执行结束后，这个参数不会留在实例对象上，所以 `Object.hasOwn(plainProduct, "title")` 是 `false`。

这就是最终判断标准：看 constructor 参数前面有没有 `public`、`protected`、`private` 或 `readonly`。有，就是 parameter property；没有，就是普通参数。

### 什么时候不用参数属性

| 场景 | 原因 |
|---|---|
| 参数要校验 | 需要先检查，再赋值。 |
| 参数要转换 | 字段值不等于原始参数值。 |
| 参数名和字段名不同 | 显式 assignment 更清楚。 |
| constructor 参数很多 | 参数属性会让签名过密。 |
| 正在学习 class 基础机制 | 显式 `this.field = parameter` 更容易看清存储位置。 |

---

---

### `classMethodImplementationVsInterfaceSignature.ts`
```ts
// Goal:
// Distinguish interface method signatures from class method implementations.

// Expected output:
// {"id":"p1"}

export {};

interface SerializableRecord {
  serialize(): string;
}

class ProductRecord implements SerializableRecord {
  constructor(public readonly id: string) {}

  serialize(): string {
    return JSON.stringify({ id: this.id });
  }
}

const productRecord = new ProductRecord("p1");

console.log(productRecord.serialize());
```

### 代码逐行解释

`interface SerializableRecord { serialize(): string; }` 只描述实例必须有一个可调用方法。它没有方法体，编译后不会生成 JavaScript。

`class ProductRecord implements SerializableRecord` 表示 TypeScript 检查 `ProductRecord` 的实例是否满足接口。

`serialize(): string { ... }` 是 class 方法实现。它有函数体，所以运行时存在。

`constructor(public readonly id: string) {}` 使用参数属性创建并初始化 `id` 字段。`serialize()` 后续能读取 `this.id`，是因为参数属性保存了它。

---

---

### `constructorTyping.ts`

```ts
// Goal:
// Type constructor parameters and initialize fields.

// Expected result:
// The compiler accepts this file and Node prints the summary.

export {};

class InvoiceRecord {
  readonly id: string;
  totalAmount: number;

  constructor(id: string, totalAmount: number) {
    this.id = id;
    this.totalAmount = totalAmount;
  }

  createSummary(): string {
    return `${this.id}:${this.totalAmount}`;
  }
}

const invoiceRecord = new InvoiceRecord("inv-1", 120);

console.log(invoiceRecord.createSummary());
```

### `parameterProperties.ts`

```ts
// Goal:
// Use parameter properties to create and initialize fields.

// Expected result:
// The compiler accepts this file and Node prints the title.

export {};

class ProductRecord {
  constructor(
    public readonly id: string,
    public title: string,
    private stockCount: number,
  ) {}

  hasStock(): boolean {
    return this.stockCount > 0;
  }
}

const productRecord = new ProductRecord("p1", "Keyboard", 10);

console.log(productRecord.title);
console.log(productRecord.hasStock());
```

### `methodThisAccess.ts`

```ts
// Goal:
// Use this to access instance fields inside class methods.

// Expected result:
// The compiler accepts this file and Node prints the updated stock.

export {};

class InventoryItem {
  constructor(
    public readonly sku: string,
    private stockCount: number,
  ) {}

  addStock(amountValue: number): void {
    this.stockCount += amountValue;
  }

  readStock(): number {
    return this.stockCount;
  }
}

const inventoryItem = new InventoryItem("kb-1", 5);
inventoryItem.addStock(3);

console.log(inventoryItem.readStock());
```

### 常见错误

```txt
parameter property:
  only works in constructor parameter lists.
  syntax sugar for declaring a field and assigning constructor parameter to it.

ordinary constructor parameter:
  local binding only.
  not stored on the instance automatically.

method body:
  instance fields must be accessed through this.
```

---

## 8. 03：继承、super 和 override

### 结论

`extends` 建立子类到父类的继承关系；`super` 调用父类构造函数或方法；`override` 显式声明子类成员正在重写父类成员。


### 本节新概念先解释

这一节不能只把 `super` 背成“调用父类”。要分成三种机制看：`extends` 建立继承链，`super(...)` 初始化父类部分，`super.method(...)` 访问父类 prototype 上的方法。

`extends` 在运行时至少建立两条关系：子类实例可以沿着 prototype chain 找到父类方法；子类构造函数也可以继承父类的 static 成员。TypeScript 还会在类型系统里检查子类实例是否能作为父类实例使用。

`super(...)` 只出现在派生类 constructor 里。派生类实例的 `this` 在 `super()` 返回前不能使用，因为父类初始化还没有完成。你可以把 `super(messageText)` 理解成：把子类 constructor 收到的值交给父类 constructor，让父类先初始化它负责的实例字段。

`super.render()` 和 `super(...)` 不是一回事。`super.render()` 不是创建父类实例，也不是把 `this` 改成父类对象；它是在父类 prototype 上找到 `render` 方法，然后仍然用当前子类实例作为 `this` 去调用它。因此父类方法里读到的 `this.messageText`，仍然来自当前这个子类实例对象。

`override` 是 TypeScript 的静态检查标记。它不会改变 JavaScript 运行时调用规则；它的作用是确认子类这个成员确实在重写父类成员，并且重写后的参数和返回值仍然满足父类契约。

本节看代码时要分别问：这个文件是在证明 constructor 初始化顺序、父类方法访问，还是 override 类型兼容？不能把它们都压缩成一句“调用父类”。

### 文件结构

```txt
03-inheritance-super-override/
  extendsBasics.ts
  superCallOrder.ts
  superMethodAccess.ts
  overrideSubtypeRule.ts
```

### `extendsBasics.ts`

```ts
// Goal:
// Use extends to inherit fields and methods.

// Expected result:
// The compiler accepts this file and Node prints both labels.

export {};

class NotificationMessage {
  constructor(public readonly messageText: string) {}

  render(): string {
    return this.messageText;
  }
}

class EmailMessage extends NotificationMessage {
  constructor(
    messageText: string,
    public readonly subjectText: string,
  ) {
    super(messageText);
  }

  renderSubject(): string {
    return this.subjectText.toUpperCase();
  }
}

const emailMessage = new EmailMessage("Welcome", "Account");

console.log(emailMessage.render());
console.log(emailMessage.renderSubject());
```

### `superCallOrder.ts`

```ts
// Goal:
// Verify that super must run before using this in a derived constructor.

// Expected result:
// The compiler rejects this access before super.

export {};

class BaseRecord {
  id = "base";
}

class DerivedRecord extends BaseRecord {
  constructor() {
    // @ts-expect-error: super must be called before accessing this.
    console.log(this.id);

    super();
  }
}

console.log(typeof DerivedRecord);
```

### `superMethodAccess.ts`

```ts
// Goal:
// Call a parent prototype method through super while keeping the derived instance as this.

// Expected output:
// message:Welcome:subject=Account

export {};

class NotificationMessage {
  constructor(public readonly messageText: string) {}

  render(): string {
    return `message:${this.messageText}`;
  }
}

class EmailMessage extends NotificationMessage {
  constructor(
    messageText: string,
    public readonly subjectText: string,
  ) {
    super(messageText);
  }

  override render(): string {
    return `${super.render()}:subject=${this.subjectText}`;
  }
}

const emailMessage = new EmailMessage("Welcome", "Account");

console.log(emailMessage.render());
```

### 为什么这个文件必须新增

前面的 `extendsBasics.ts` 只演示了 `super(messageText)`，也就是子类 constructor 调用父类 constructor。它没有演示 `super.method()`。

这个文件专门补上第二种 `super`：`super.render()`。它的意义不是创建父类实例，而是从父类 prototype 上找到 `render` 方法，再用当前子类实例作为 `this` 调用这个方法。

执行 `emailMessage.render()` 时：

| 步骤 | 发生什么 |
|---|---|
| 1 | 调用子类 `EmailMessage.prototype.render`。 |
| 2 | 子类方法内部执行 `super.render()`。 |
| 3 | JavaScript 到 `NotificationMessage.prototype` 上查找 `render`。 |
| 4 | 找到父类 `render` 后，用当前 `emailMessage` 作为 `this` 调用它。 |
| 5 | 父类 `render` 读取的是当前实例上的 `messageText`。 |
| 6 | 子类方法再拼接自己的 `subjectText`。 |

所以 `super.render()` 的准确模型是：父类方法来源，当前实例作为 `this`。

---

### `overrideSubtypeRule.ts`

```ts
// Goal:
// Override a method while preserving the base contract.

// Expected result:
// The compiler accepts a safe override and rejects an unsafe one.

export {};

class BaseRenderer {
  render(labelText?: string): string {
    return labelText ?? "default";
  }
}

class ProductRenderer extends BaseRenderer {
  override render(labelText?: string): string {
    return `product:${labelText ?? "default"}`;
  }
}

class BrokenRenderer extends BaseRenderer {
  // @ts-expect-error: The override return type is not compatible with the base method.
  override render(labelText?: string): number {
    return labelText?.length ?? 0;
  }
}

const renderer: BaseRenderer = new ProductRenderer();

console.log(renderer.render());
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 子类构造函数里先用 `this` 再 `super()` | 派生类必须先调用 `super()`。 |
| 重写时收窄参数 | 父类引用调用时会不安全。 |
| 不开 `noImplicitOverride` | 父类改名后子类方法可能悄悄变成普通新方法。 |

---

## 9. 04：public、protected、private 和 JS private field

### 结论

`public`、`protected`、`private` 是 TypeScript 的类型系统访问控制；JavaScript 的 `#private` 是运行时真正私有字段。


### 本节新概念先解释

访问控制要分清 TypeScript 类型层和 JavaScript 运行时层。`public`、`protected`、`private` 是 TypeScript 对“哪里可以访问这个成员”的静态检查；`#field` 是 JavaScript 运行时真正私有字段。

`public` 是默认可见性，外部代码、子类和类内部都可以访问。`protected` 允许声明类和子类访问，但不允许外部实例访问。TypeScript 的 `private` 只允许声明它的 class 内部访问；它还会影响类之间的类型兼容性。JavaScript 的 `#hardSecret` 是完全不同的语法，它在运行时也不能通过普通属性访问。

本节不要只记“能不能访问”。更重要的是判断：这个限制是在 TypeScript 编译期阻止你写错，还是 JavaScript 运行时对象模型真的没有普通 property key 可以访问。

### 文件结构

```txt
04-visibility-private-fields/
  publicProtectedPrivate.ts
  softPrivateVsHardPrivate.ts
```

### `publicProtectedPrivate.ts`

```ts
// Goal:
// Compare public, protected, and private access.

// Expected result:
// The compiler rejects invalid access.

export {};

class AccountBase {
  public displayName = "Ada";
  protected roleName = "member";
  private secretToken = "token";

  readTokenInsideBase(): string {
    return this.secretToken;
  }
}

class AdminAccount extends AccountBase {
  readRole(): string {
    return this.roleName;
  }
}

const adminAccount = new AdminAccount();

console.log(adminAccount.displayName);
console.log(adminAccount.readRole());

// @ts-expect-error: protected member is not accessible outside the class hierarchy.
console.log(adminAccount.roleName);

// @ts-expect-error: private member is only accessible inside AccountBase.
console.log(adminAccount.secretToken);
```

### `softPrivateVsHardPrivate.ts`

```ts
// Goal:
// Compare TypeScript private and JavaScript private fields.

// Expected result:
// The compiler rejects direct access to both private members.

export {};

class SecretStore {
  private softSecret = "soft";
  #hardSecret = "hard";

  readSecrets(): string {
    return `${this.softSecret}:${this.#hardSecret}`;
  }
}

const secretStore = new SecretStore();

console.log(secretStore.readSecrets());

// @ts-expect-error: softSecret is private in TypeScript.
console.log(secretStore.softSecret);

// @ts-expect-error: hardSecret is a JavaScript private field.
console.log(secretStore.#hardSecret);
```

### 常见错误

```txt
public:
  default visibility.

protected:
  accessible inside declaring class and subclasses.

private:
  TypeScript private, type-system access control.

#field:
  JavaScript private field, runtime hard privacy.
```

---

## 10. 05：static 成员和泛型类

### 结论

`static` 成员属于类构造函数对象，不属于实例。泛型类的类型参数属于实例侧，静态成员不能引用实例侧泛型参数。


### 本节新概念先解释

`static` 的核心是存储位置：static 成员属于 class value，也就是构造函数对象本身，不属于 `new` 出来的实例。实例字段属于每个实例；static 字段属于类本身。

泛型类的类型参数描述的是实例侧关系。`class Box<ValueType>` 里的 `ValueType` 用来约束这个 Box 实例保存什么类型的值；不同实例可以有不同的 `ValueType`。static 成员只有一份，挂在 `Box` 这个构造函数对象上，不属于某一个 `Box<string>` 或 `Box<number>` 实例，因此 static 成员不能直接引用类的实例侧类型参数。

本节的判断方式是：先问成员存在哪里，再问它能不能使用实例侧的类型信息。

### 文件结构

```txt
05-static-generic-classes/
  staticFactoryMethod.ts
  genericClass.ts
  staticGenericTypeParameterMistake.ts
```

### `staticFactoryMethod.ts`

```ts
// Goal:
// Use a static factory method on the class constructor object.

// Expected result:
// The compiler accepts this file and Node prints the created user.

export {};

class UserAccount {
  private constructor(
    public readonly id: string,
    public readonly email: string,
  ) {}

  static createGuest(id: string): UserAccount {
    return new UserAccount(id, `${id}@example.com`);
  }
}

const guestAccount = UserAccount.createGuest("guest-1");

console.log(guestAccount.email);
```

### `genericClass.ts`

```ts
// Goal:
// Create a generic class that preserves value type.

// Expected result:
// The compiler infers string for the box content.

export {};

class Box<ValueType> {
  constructor(private value: ValueType) {}

  read(): ValueType {
    return this.value;
  }

  replace(nextValue: ValueType): void {
    this.value = nextValue;
  }
}

const titleBox = new Box("Keyboard");

titleBox.replace("Mouse");

// @ts-expect-error: This box stores strings.
titleBox.replace(123);

console.log(titleBox.read().toUpperCase());
```

### `staticGenericTypeParameterMistake.ts`

```ts
// Goal:
// Show that static members cannot reference class type parameters.

// Expected result:
// The compiler rejects using ItemType in a static member.

export {};

class Box<ItemType> {
  constructor(public readonly value: ItemType) {}

  // @ts-expect-error: Static members cannot reference class type parameters.
  static defaultValue: ItemType;
}

console.log(typeof Box);
```

---

## 11. 06：this 运行时绑定、箭头方法和 this 类型

### 结论

类方法里的 `this` 仍然遵循 JavaScript 调用点规则。箭头方法属性可以捕获实例 `this`，但会为每个实例创建一个函数。返回 `this` 可以让链式 API 在子类中保留具体子类类型。


### 本节新概念先解释

class 方法里的 `this` 不是永久绑定在实例上的。普通方法本质上是 prototype 上的函数；函数被谁以“对象点调用”的形式调用，运行时的 `this` 就指向谁。把方法取出来单独调用时，原来的实例调用点丢失，`this` 也会丢失。

箭头方法属性不是普通 prototype method。它是实例字段 initializer，右边创建一个 arrow function，并捕获当前实例的 `this`。所以它可以解决 detached method 的 `this` 丢失问题，但代价是每个实例都会保存一份函数。

TypeScript 的 `this` return type 是类型系统能力。它表示方法返回当前具体子类类型，而不是固定父类类型，因此链式 API 在继承后仍能继续调用子类方法。

### 文件结构

```txt
06-this-runtime-and-this-types/
  lostThisContext.ts
  arrowMethodProperty.ts
  fluentThisReturn.ts
  thisBasedTypeGuard.ts
```

### `lostThisContext.ts`

```ts
// Goal:
// Show that a class method can lose its this context.

// Expected result:
// Node may throw when calling the detached method.

export {};

class NameReader {
  nameText = "NameReader";

  readName(): string {
    return this.nameText;
  }
}

const nameReader = new NameReader();
const detachedReadName = nameReader.readName;

try {
  console.log(detachedReadName());
} catch (errorValue) {
  console.log(errorValue instanceof TypeError);
}
```

### `arrowMethodProperty.ts`

```ts
// Goal:
// Use an arrow method property to capture instance this.

// Expected result:
// Node prints the instance name even after detaching the function.

export {};

class StableNameReader {
  nameText = "StableNameReader";

  readName = (): string => {
    return this.nameText;
  };
}

const stableNameReader = new StableNameReader();
const detachedReadName = stableNameReader.readName;

console.log(detachedReadName());
```

### `fluentThisReturn.ts`

```ts
// Goal:
// Use this return type for a fluent API.

// Expected result:
// The subclass chain preserves subclass methods.

export {};

class QueryBuilder {
  protected queryParts: string[] = [];

  where(conditionText: string): this {
    this.queryParts.push(`where ${conditionText}`);
    return this;
  }

  build(): string {
    return this.queryParts.join(" ");
  }
}

class ProductQueryBuilder extends QueryBuilder {
  orderBy(fieldName: string): this {
    this.queryParts.push(`order by ${fieldName}`);
    return this;
  }
}

const queryText = new ProductQueryBuilder()
  .where("stock > 0")
  .orderBy("price")
  .build();

console.log(queryText);
```

### `thisBasedTypeGuard.ts`

```ts
// Goal:
// Use this-based type guards to narrow a class hierarchy.

// Expected result:
// The compiler narrows the instance in each branch.

export {};

class FileSystemNode {
  constructor(public readonly path: string) {}

  isFile(): this is FileNode {
    return this instanceof FileNode;
  }

  isDirectory(): this is DirectoryNode {
    return this instanceof DirectoryNode;
  }
}

class FileNode extends FileSystemNode {
  constructor(path: string, public readonly content: string) {
    super(path);
  }
}

class DirectoryNode extends FileSystemNode {
  children: FileSystemNode[] = [];
}

const node: FileSystemNode = new FileNode("/readme.md", "hello");

if (node.isFile()) {
  console.log(node.content);
} else if (node.isDirectory()) {
  console.log(node.children.length);
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为 class 方法自动绑定 this | 普通方法的 this 由调用方式决定。 |
| 到处用箭头方法属性 | 它解决 this 丢失，但每个实例都会创建函数。 |
| 链式 API 返回父类类型 | 返回 `this` 可以保留子类类型。 |

---

## 12. 07：接口 interface

### 结论

`interface` 描述对象结构。它只存在于 TypeScript 类型系统，不会生成 JavaScript。


### 本节新概念先解释

`interface` 是类型系统里的结构契约，不是运行时对象，也不是 class。它描述“一个值需要有哪些 property key、每个 value 是什么类型、哪些属性可选或只读”。

interface 的重点是 structural typing：只要一个对象实际拥有需要的结构，就可以被当成这个 interface 使用，不要求对象一定由某个 class 创建。

所以 `renderProductCard(productCard: ProductCard)` 关心的是参数值有没有 `id`、`title`、`price` 这些属性，不关心这个值是不是字面量对象、class 实例，或者其他函数返回的对象。

### 文件结构

```txt
07-interfaces/
  interfaceShape.ts
  optionalReadonlyInterface.ts
  interfaceExtends.ts
  intersectionConflict.ts
```

### `interfaceShape.ts`

```ts
// Goal:
// Use an interface to describe an object shape.

// Expected result:
// The compiler accepts compatible objects.

export {};

interface ProductCard {
  id: string;
  title: string;
  price: number;
}

function renderProductCard(productCard: ProductCard): string {
  return `${productCard.title}:${productCard.price}`;
}

const keyboardCard = {
  id: "p1",
  title: "Keyboard",
  price: 99,
  stockCount: 10,
};

console.log(renderProductCard(keyboardCard));
```

### `optionalReadonlyInterface.ts`

```ts
// Goal:
// Use optional and readonly properties in an interface.

// Expected result:
// The compiler rejects reassignment to readonly property.

export {};

interface UserProfile {
  readonly id: string;
  displayName: string;
  avatarUrl?: string;
}

const userProfile: UserProfile = {
  id: "u1",
  displayName: "Ada",
};

userProfile.displayName = "Ada Lovelace";

// @ts-expect-error: id is readonly.
userProfile.id = "u2";

console.log(userProfile.avatarUrl ?? "no-avatar");
```

### `interfaceExtends.ts`

```ts
// Goal:
// Extend an interface with additional properties.

// Expected result:
// The compiler accepts the extended shape.

export {};

interface EntityRecord {
  id: string;
}

interface ProductRecord extends EntityRecord {
  title: string;
  price: number;
}

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

console.log(productRecord.id);
```

### `intersectionConflict.ts`

```ts
// Goal:
// Show how intersection can produce impossible property requirements.

// Expected result:
// The compiler rejects assigning a string to a never property.

export {};

type NamedAsString = {
  name: string;
};

type NamedAsNumber = {
  name: number;
};

type ImpossibleName = NamedAsString & NamedAsNumber;

const impossibleName: ImpossibleName = {
  // @ts-expect-error: name becomes never because it must be string and number.
  name: "Ada",
};

console.log(typeof impossibleName);
```

---

## 13. 08：声明合并

### 结论

同名 `interface` 声明会合并成员。这是 TypeScript 的特殊能力，常用于扩展第三方库类型、全局类型和框架类型。


### 本节新概念先解释

声明合并不是“后面的 interface 覆盖前面的 interface”。同一个作用域里的同名 interface 会被 TypeScript 合并成一个更大的结构要求。

这件事的技术意义是扩展已有类型，尤其是库、框架、全局对象或插件系统里的类型增强。但它也有风险：合并会影响同名 interface 的所有使用位置，因此不应该把它当成普通对象合并或普通模块导出技巧。

本节要观察的是：为什么 `AppConfig` 两次声明后，最终对象必须同时有 `appName` 和 `version`。

### 文件结构

```txt
08-declaration-merging/
  interfaceMerging.ts
  incompatibleInterfaceMerging.ts
```

### `interfaceMerging.ts`

```ts
// Goal:
// Verify that same-name interfaces merge members.

// Expected result:
// The compiler requires both merged properties.

export {};

interface AppConfig {
  appName: string;
}

interface AppConfig {
  version: string;
}

const appConfig: AppConfig = {
  appName: "Learning Lab",
  version: "1.0.0",
};

console.log(`${appConfig.appName}:${appConfig.version}`);
```

### `incompatibleInterfaceMerging.ts`

```ts
// Goal:
// Show that incompatible merged properties are rejected.

// Expected result:
// The compiler rejects incompatible property declarations.

export {};

interface MergeTarget {
  id: string;
}

interface MergeTarget {
  // @ts-expect-error: Merged property declarations must have compatible types.
  id: number;
}

const mergeTarget: MergeTarget = {
  id: "m1",
};

console.log(mergeTarget.id);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 以为第二个 interface 覆盖第一个 | 同名 interface 会合并。 |
| 随便使用全局声明合并 | 会影响整个项目类型环境。 |
| 用 type alias 期待声明合并 | type alias 不能这样重复声明合并。 |

---

## 14. 09：implements

### 结论

`implements` 只检查类实例是否满足接口结构。它不会把接口的方法参数类型自动注入类体，也不会自动创建可选属性。


### 本节新概念先解释

`implements` 的意思不是“把 interface 的代码复制进 class”，因为 interface 根本没有运行时代码。它的意思是：TypeScript 检查这个 class 的实例侧是否满足 interface 描述的结构。

因此 `implements` 不会自动创建字段，不会自动生成方法，也不会把 interface 方法里的参数类型自动注入到 class 方法实现里。class 体内部仍然要自己写完整的字段、方法体和参数类型。

本节必须抓住这个边界：interface 是检查标准；class implementation 是真实实现。`implements` 只负责检查二者是否匹配。

### 文件结构

```txt
09-implements/
  implementsContract.ts
  implementsDoesNotInferMethodParams.ts
  optionalPropertyNotCreated.ts
```

### `implementsContract.ts`

```ts
// Goal:
// Use implements to check that a class satisfies an interface.

// Expected result:
// The compiler accepts the correct implementation.

export {};

interface SerializableRecord {
  serialize(): string;
}

class ProductRecord implements SerializableRecord {
  constructor(
    public readonly id: string,
    public title: string,
  ) {}

  serialize(): string {
    return JSON.stringify({
      id: this.id,
      title: this.title,
    });
  }
}

const productRecord = new ProductRecord("p1", "Keyboard");

console.log(productRecord.serialize());
```

### `implementsDoesNotInferMethodParams.ts`

```ts
// Goal:
// Show that implements does not infer method parameter types inside the class body.

// Expected result:
// With noImplicitAny enabled, the compiler rejects the untyped parameter.

export {};

interface NameChecker {
  check(nameText: string): boolean;
}

class BrokenNameChecker implements NameChecker {
  // @ts-expect-error: The parameter type is not inferred from implements.
  check(nameText) {
    return nameText.toLowerCase() === "ok";
  }
}

console.log(typeof BrokenNameChecker);
```

### `optionalPropertyNotCreated.ts`

```ts
// Goal:
// Show that implements does not create optional properties on the class instance.

// Expected result:
// The compiler rejects accessing a property not declared in the class.

export {};

interface ProfileShape {
  id: string;
  avatarUrl?: string;
}

class ProfileRecord implements ProfileShape {
  id = "u1";
}

const profileRecord = new ProfileRecord();

// @ts-expect-error: implements does not create avatarUrl on ProfileRecord.
profileRecord.avatarUrl = "https://example.com/avatar.png";

console.log(profileRecord.id);
```

---

## 15. 10：实现接口还是扩展抽象类

### 结论

如果只需要描述能力，用 `interface`。如果既要描述能力，又要复用部分实现，用 `abstract class`。


### 本节新概念先解释

interface 和 abstract class 都能描述“子类型必须具备什么能力”，但它们解决的问题不同。

interface 是 type-only contract，只适合描述能力边界，不提供共享实现。abstract class 是运行时 class，可以写普通方法、保存 protected 状态、提供部分实现，同时把某些成员留给子类实现。

选择标准不是“哪个更面向对象”，而是：你是否需要复用运行时代码。如果只需要让不同对象都能被同一个函数使用，用 interface；如果多个子类必须共享一段初始化逻辑或公共方法，用 abstract class。

### 文件结构

```txt
10-interface-vs-abstract-class/
  interfaceOnlyContract.ts
  abstractClassSharedImplementation.ts
```

### `interfaceOnlyContract.ts`

```ts
// Goal:
// Use an interface when only a contract is needed.

// Expected result:
// The compiler accepts any object with the required shape.

export {};

interface Logger {
  log(messageText: string): void;
}

class ConsoleLogger implements Logger {
  log(messageText: string): void {
    console.log(messageText);
  }
}

const objectLogger: Logger = {
  log(messageText: string): void {
    console.log(`object:${messageText}`);
  },
};

objectLogger.log("ready");
new ConsoleLogger().log("ready");
```

### `abstractClassSharedImplementation.ts`

```ts
// Goal:
// Use an abstract class when subclasses share implementation.

// Expected result:
// The compiler rejects direct instantiation and accepts concrete subclass.

export {};

abstract class DataParser {
  parse(inputText: string): unknown {
    const trimmedText = inputText.trim();
    return this.parseTrimmed(trimmedText);
  }

  protected abstract parseTrimmed(inputText: string): unknown;
}

class JsonParser extends DataParser {
  protected override parseTrimmed(inputText: string): unknown {
    return JSON.parse(inputText);
  }
}

// @ts-expect-error: Cannot instantiate an abstract class.
const brokenParser = new DataParser();

const jsonParser = new JsonParser();

console.log(jsonParser.parse('{"ok":true}'));
console.log(typeof brokenParser);
```

### 对比模型

```txt
interface:
  type-only.
  no runtime value.
  no shared implementation.
  multiple interfaces can be implemented.

abstract class:
  runtime value.
  can contain shared implementation.
  can contain abstract members.
  single extends chain.
```

---

## 16. 11：类是结构化类型

### 结论

TypeScript 中的类通常按结构兼容，而不是按声明名兼容。两个无继承关系的类，只要实例形状兼容，就可以互相赋值。


### 本节新概念先解释

TypeScript 的类兼容性默认看结构，不看名字。两个 class 没有继承关系，只要实例侧公开成员形状兼容，就可以赋值。

这和 Java、C# 那种名义类型系统不同。TypeScript 更接近“这个对象能不能被当成需要的形状使用”。但是 private 和 protected 会打破纯结构兼容，因为它们带有声明来源信息。两个不同 class 各自声明的 private 成员即使名字一样，也不表示同一个私有来源。

本节要观察：为什么 `Point2D` 和 `Coordinate2D` 可以兼容，而两个各自有 private `secret` 的类不能兼容。

### 文件结构

```txt
11-structural-class-types/
  compatibleClasses.ts
  privateBreaksStructuralCompatibility.ts
```

### `compatibleClasses.ts`

```ts
// Goal:
// Verify that classes are structurally compatible.

// Expected result:
// The compiler accepts assignment between identical class shapes.

export {};

class Point2D {
  x = 0;
  y = 0;
}

class Coordinate2D {
  x = 0;
  y = 0;
}

const point: Point2D = new Coordinate2D();

console.log(point.x + point.y);
```

### `privateBreaksStructuralCompatibility.ts`

```ts
// Goal:
// Show that private members affect class compatibility.

// Expected result:
// The compiler rejects assignment between classes with separate private declarations.

export {};

class UserSecret {
  private secret = "user";
}

class AdminSecret {
  private secret = "admin";
}

// @ts-expect-error: Separate private members make these classes incompatible.
const userSecret: UserSecret = new AdminSecret();

console.log(typeof userSecret);
```

---

## 17. 12：类既声明值也声明类型

### 结论

一个 `class` 名字同时在值空间和类型空间存在。直接写 `ProductRecord` 通常指实例类型；写 `typeof ProductRecord` 指构造函数值的类型。


### 本节新概念先解释

class 名字有双重身份：在值空间里，它是运行时 constructor value；在类型空间里，它通常表示实例类型。

`const productRecord: ProductRecord` 里的 `ProductRecord` 是实例类型，意思是变量应该保存一个 `ProductRecord` 实例形状的值。`new ProductRecord("p1")` 里的 `ProductRecord` 是运行时值，意思是调用这个构造函数对象创建实例。

`typeof ProductRecord` 不是实例类型，而是“ProductRecord 这个 class value 的类型”，也就是构造函数侧类型。`InstanceType<typeof ProductRecord>` 则是从构造函数类型反推出它创建出来的实例类型。

### 文件结构

```txt
12-class-value-and-type-space/
  classAsTypeAndValue.ts
  typeofClassConstructor.ts
  instanceTypeUtility.ts
```

### `classAsTypeAndValue.ts`

```ts
// Goal:
// Use a class name as both a value and a type.

// Expected result:
// The compiler accepts this file and Node prints true.

export {};

class ProductRecord {
  constructor(public readonly id: string) {}
}

const productRecord: ProductRecord = new ProductRecord("p1");

console.log(productRecord instanceof ProductRecord);
```

### `typeofClassConstructor.ts`

```ts
// Goal:
// Use typeof ClassName to describe the constructor side.

// Expected result:
// The compiler accepts class constructors with matching new signatures.

export {};

class ProductRecord {
  constructor(public readonly id: string) {}
}

function createRecord(ctor: typeof ProductRecord, id: string): ProductRecord {
  return new ctor(id);
}

const productRecord = createRecord(ProductRecord, "p1");

console.log(productRecord.id);
```

### `instanceTypeUtility.ts`

```ts
// Goal:
// Use InstanceType to get the instance type from a constructor type.

// Expected result:
// The compiler accepts this file.

export {};

class UserRecord {
  constructor(public readonly id: string) {}
}

type UserInstance = InstanceType<typeof UserRecord>;

const userRecord: UserInstance = new UserRecord("u1");

console.log(userRecord.id);
```

---

## 18. 13：混入、装饰器和 final 类预习

### 结论

混入是组合类能力的模式；装饰器是运行时元编程语法；TypeScript 没有内置 final class，但可以用私有构造函数或私有品牌模拟部分限制。


### 本节新概念先解释

mixin、decorator、private constructor 都是在讨论“class 创建规则如何被组合、包裹或限制”。

mixin 不是普通继承链上的一个父类，而是一个接收 class、返回新 class 的函数模式。decorator 不是类型注解，它是运行时会被调用的函数，可以观察或修改 class declaration 相关的值。private constructor 则限制外部不能直接 `new`，把实例创建入口收束到 static factory method。

本节只需要建立边界：mixin 组合能力，decorator 参与运行时元编程，private constructor 控制创建入口。不要把 decorator 当成 interface，也不要把 mixin 当成简单的 `extends` 替代品。

### 文件结构

```txt
13-advanced-class-patterns/
  timestampedMixin.ts
  classDecoratorPreview.ts
  privateConstructor.ts
```

### `timestampedMixin.ts`

```ts
// Goal:
// Add timestamp fields to a base class through a mixin.

// Expected result:
// The compiler preserves base members and mixin members.

export {};

type Constructor<InstanceType = {}> = new (...args: any[]) => InstanceType;

function Timestamped<BaseType extends Constructor>(BaseClass: BaseType) {
  return class TimestampedClass extends BaseClass {
    createdAt = new Date();

    readCreatedAt(): string {
      return this.createdAt.toISOString();
    }
  };
}

class ProductRecord {
  constructor(public readonly title: string) {}
}

const TimestampedProductRecord = Timestamped(ProductRecord);

const productRecord = new TimestampedProductRecord("Keyboard");

console.log(productRecord.title);
console.log(productRecord.readCreatedAt());
```

### `classDecoratorPreview.ts`

```ts
// Goal:
// Preview a class decorator as a runtime function call.

// Expected result:
// This file requires experimentalDecorators.

export {};

function sealed(constructorFunction: Function): void {
  Object.seal(constructorFunction);
  Object.seal(constructorFunction.prototype);
}

@sealed
class PaymentProcessor {
  process(): string {
    return "processed";
  }
}

const processor = new PaymentProcessor();

console.log(processor.process());
```

### `privateConstructor.ts`

```ts
// Goal:
// Use a private constructor to control instance creation.

// Expected result:
// The compiler rejects direct construction.

export {};

class AppConfig {
  private constructor(
    public readonly environmentName: string,
  ) {}

  static createProduction(): AppConfig {
    return new AppConfig("production");
  }
}

const productionConfig = AppConfig.createProduction();

// @ts-expect-error: The constructor is private.
const brokenConfig = new AppConfig("development");

console.log(productionConfig.environmentName);
console.log(typeof brokenConfig);
```

### 常见错误

```txt
mixin:
  composition pattern based on class expressions and generic constructors.

decorator:
  runtime function call, not a type annotation.

final class:
  no built-in final keyword in TypeScript.
```

---

## 19. 14：工厂模式和建造者模式

### 结论

工厂模式集中创建同族对象；建造者模式把复杂对象的创建过程拆成链式步骤，最后通过 `build()` 产出稳定对象。


### 本节新概念先解释

工厂模式和建造者模式都在处理对象创建，但它们处理的复杂度不同。

factory 解决的是“根据输入选择创建哪一种具体实现”。调用者只拿到公共接口，不需要知道具体 class。builder 解决的是“一个对象的构造步骤很多、顺序较长、参数组合复杂”。它把中间状态保存在 builder 实例里，最后用 `build()` 产出稳定结果。

本节不是让你背设计模式名字，而是让你看 class、interface、private field、this return type 如何组合成可维护的对象创建 API。

### 文件结构

```txt
14-factory-builder-patterns/
  paymentFactory.ts
  requestBuilder.ts
```

### `paymentFactory.ts`

```ts
// Goal:
// Build objects through a typed factory function.

// Expected result:
// The compiler enforces supported payment methods.

export {};

interface PaymentProcessor {
  pay(amountValue: number): string;
}

class CardPaymentProcessor implements PaymentProcessor {
  pay(amountValue: number): string {
    return `card:${amountValue}`;
  }
}

class WalletPaymentProcessor implements PaymentProcessor {
  pay(amountValue: number): string {
    return `wallet:${amountValue}`;
  }
}

type PaymentMethod = "card" | "wallet";

function createPaymentProcessor(method: PaymentMethod): PaymentProcessor {
  switch (method) {
    case "card":
      return new CardPaymentProcessor();
    case "wallet":
      return new WalletPaymentProcessor();
  }
}

const processor = createPaymentProcessor("card");

console.log(processor.pay(99));

// @ts-expect-error: This payment method is not supported.
createPaymentProcessor("cash");
```

### `requestBuilder.ts`

```ts
// Goal:
// Build a request configuration with a fluent builder.

// Expected result:
// The compiler preserves the chain and Node prints the URL.

export {};

type RequestConfig = {
  readonly url: string;
  readonly method: "GET" | "POST";
  readonly headers: Record<string, string>;
};

class RequestBuilder {
  private urlValue = "/";
  private methodValue: "GET" | "POST" = "GET";
  private headerMap: Record<string, string> = {};

  url(urlValue: string): this {
    this.urlValue = urlValue;
    return this;
  }

  method(methodValue: "GET" | "POST"): this {
    this.methodValue = methodValue;
    return this;
  }

  header(nameText: string, valueText: string): this {
    this.headerMap[nameText] = valueText;
    return this;
  }

  build(): RequestConfig {
    return {
      url: this.urlValue,
      method: this.methodValue,
      headers: { ...this.headerMap },
    };
  }
}

const requestConfig = new RequestBuilder()
  .url("/api/products")
  .method("GET")
  .header("Accept", "application/json")
  .build();

console.log(requestConfig.url);
```

---

## 20. 15：小项目整合

### 结论

本章小项目要把 class、interface、abstract class、泛型类、多态、工厂模式和 builder 模式合在一起，做一个“类型安全的领域模型和仓储层”。


### 本节新概念先解释

小项目不是额外练习，而是把本章概念放回工程语境。真实项目里不会孤立使用 `class` 或 `interface`，而是同时需要实体约束、仓储接口、具体实现、抽象基类、工厂函数和 builder API。

`Repository<T>` 负责描述行为契约；`MemoryRepository<T>` 负责真实存储；`EntityRecord` 约束实体最小形状；`DiscountStrategy` 让不同折扣类保持同一调用方式；`OrderLineBase` 用 abstract class 复用构造逻辑并要求子类实现小计计算；`OrderBuilder` 把复杂订单创建过程拆成可链式调用的步骤。

本节要训练的是：看到一个对象建模问题时，能判断哪个部分需要 interface，哪个部分需要 class，哪个部分需要 abstract class，哪个部分只是函数，哪个状态应该保存在实例字段里。

### 文件结构

```txt
15-mini-project/
  typedRepository.ts
  typedDomainModel.ts
```

### `typedRepository.ts`

```ts
// Goal:
// Build a typed repository with an interface and a concrete memory implementation.

// Expected result:
// The compiler enforces entity ids and repository behavior.

export {};

interface EntityRecord {
  readonly id: string;
}

interface Repository<EntityType extends EntityRecord> {
  save(entity: EntityType): void;
  findById(id: string): EntityType | undefined;
  findAll(): EntityType[];
}

class MemoryRepository<EntityType extends EntityRecord> implements Repository<EntityType> {
  private records = new Map<string, EntityType>();

  save(entity: EntityType): void {
    this.records.set(entity.id, entity);
  }

  findById(id: string): EntityType | undefined {
    return this.records.get(id);
  }

  findAll(): EntityType[] {
    return Array.from(this.records.values());
  }
}

type ProductRecord = EntityRecord & {
  readonly title: string;
  readonly price: number;
};

const productRepository: Repository<ProductRecord> = new MemoryRepository<ProductRecord>();

productRepository.save({
  id: "p1",
  title: "Keyboard",
  price: 99,
});

console.log(productRepository.findById("p1")?.title);
```

### `typedDomainModel.ts`

```ts
// Goal:
// Combine abstract class, concrete classes, factory, and builder.

// Expected result:
// The compiler enforces known discount types and valid order construction.

export {};

interface DiscountStrategy {
  apply(amountValue: number): number;
}

class NoDiscountStrategy implements DiscountStrategy {
  apply(amountValue: number): number {
    return amountValue;
  }
}

class PercentageDiscountStrategy implements DiscountStrategy {
  constructor(private readonly rate: number) {}

  apply(amountValue: number): number {
    return amountValue * (1 - this.rate);
  }
}

type DiscountKind = "none" | "percentage";

function createDiscountStrategy(kind: DiscountKind): DiscountStrategy {
  switch (kind) {
    case "none":
      return new NoDiscountStrategy();
    case "percentage":
      return new PercentageDiscountStrategy(0.1);
  }
}

abstract class OrderLineBase {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
  ) {}

  abstract calculateSubtotal(): number;
}

class ProductOrderLine extends OrderLineBase {
  constructor(
    productId: string,
    quantity: number,
    private readonly unitPrice: number,
  ) {
    super(productId, quantity);
  }

  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }
}

type OrderPayload = {
  readonly userId: string;
  readonly lineSubtotals: readonly number[];
  readonly totalAmount: number;
};

class OrderBuilder {
  private userIdValue?: string;
  private orderLines: OrderLineBase[] = [];
  private discountStrategy: DiscountStrategy = new NoDiscountStrategy();

  userId(userIdValue: string): this {
    this.userIdValue = userIdValue;
    return this;
  }

  addProduct(productId: string, quantity: number, unitPrice: number): this {
    this.orderLines.push(new ProductOrderLine(productId, quantity, unitPrice));
    return this;
  }

  discount(kind: DiscountKind): this {
    this.discountStrategy = createDiscountStrategy(kind);
    return this;
  }

  build(): OrderPayload {
    if (this.userIdValue === undefined) {
      throw new Error("Missing user id");
    }

    const lineSubtotals = this.orderLines.map((orderLine) => {
      return orderLine.calculateSubtotal();
    });

    const rawTotal = lineSubtotals.reduce((totalValue, subtotalValue) => {
      return totalValue + subtotalValue;
    }, 0);

    return {
      userId: this.userIdValue,
      lineSubtotals,
      totalAmount: this.discountStrategy.apply(rawTotal),
    };
  }
}

const orderPayload = new OrderBuilder()
  .userId("u1")
  .addProduct("p1", 2, 50)
  .discount("percentage")
  .build();

console.log(orderPayload.totalAmount);

// @ts-expect-error: Unknown discount kind.
new OrderBuilder().discount("coupon");
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `Repository<T>` 描述仓储契约。 |
| 2 | `MemoryRepository<T>` 用泛型保存具体实体类型。 |
| 3 | `EntityRecord` 约束实体必须有 `id`。 |
| 4 | `DiscountStrategy` 让不同折扣类共享同一接口。 |
| 5 | `OrderLineBase` 用抽象类复用构造逻辑，强制子类实现 `calculateSubtotal()`。 |
| 6 | `createDiscountStrategy()` 用工厂模式隐藏具体类创建。 |
| 7 | `OrderBuilder` 用 builder 模式封装复杂订单构造过程。 |
| 8 | TypeScript 在编译期限制未知折扣类型和错误 payload。 |

---

## 21. 最终文件清单

```txt
typescript/
  README.md
  package.json
  tsconfig.json

  chapter-03-types/
  chapter-04-functions/

  chapter-05-classes-interfaces/
    README.md
    00-class-value-and-type/
      classBlueprintVsInstance.ts
      classMemberStorageMap.ts
      classValueAndInstanceType.ts
      interfaceErasureBoundary.ts
    01-fields-initialization/
      initializerMeaning.ts
      fieldDeclarationIsNotValue.ts
      fieldInitialization.ts
      strictPropertyInitialization.ts
      readonlyConstructorAssignment.ts
      readonlyInitializationWindow.ts
      definiteAssignmentIsNotInitialization.ts
      derivedInitializationOrder.ts
      declareFieldNoInitializer.ts
    02-constructors-methods/
      constructorParameterStorage.ts
      constructorAssignmentStorage.ts
      constructorAssignmentDecision.ts
      parameterPropertyExpansion.ts
      parameterPropertyEmitProof.ts
      classMethodImplementationVsInterfaceSignature.ts
      constructorTyping.ts
      parameterProperties.ts
      methodThisAccess.ts
    03-inheritance-super-override/
      extendsBasics.ts
      superCallOrder.ts
      superMethodAccess.ts
      overrideSubtypeRule.ts
    04-visibility-private-fields/
      publicProtectedPrivate.ts
      softPrivateVsHardPrivate.ts
    05-static-generic-classes/
      staticFactoryMethod.ts
      genericClass.ts
      staticGenericTypeParameterMistake.ts
    06-this-runtime-and-this-types/
      lostThisContext.ts
      arrowMethodProperty.ts
      fluentThisReturn.ts
      thisBasedTypeGuard.ts
    07-interfaces/
      interfaceShape.ts
      optionalReadonlyInterface.ts
      interfaceExtends.ts
      intersectionConflict.ts
    08-declaration-merging/
      interfaceMerging.ts
      incompatibleInterfaceMerging.ts
    09-implements/
      implementsContract.ts
      implementsDoesNotInferMethodParams.ts
      optionalPropertyNotCreated.ts
    10-interface-vs-abstract-class/
      interfaceOnlyContract.ts
      abstractClassSharedImplementation.ts
    11-structural-class-types/
      compatibleClasses.ts
      privateBreaksStructuralCompatibility.ts
    12-class-value-and-type-space/
      classAsTypeAndValue.ts
      typeofClassConstructor.ts
      instanceTypeUtility.ts
    13-advanced-class-patterns/
      timestampedMixin.ts
      classDecoratorPreview.ts
      privateConstructor.ts
    14-factory-builder-patterns/
      paymentFactory.ts
      requestBuilder.ts
    15-mini-project/
      typedRepository.ts
      typedDomainModel.ts

notes/
  typescript.md
```

---

## 22. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### 知识点名称

结论：一句话说明它解决什么问题。

技术意义：它在类型系统里表示什么。

底层机制：编译期做了什么，运行时还剩什么。

代码例子：保留一个最能说明问题的例子。

常见错误：写一个你自己容易犯的反例。

项目关系：说明它在 React、Node、API SDK、状态管理、测试替身中的用途。
```

### `notes/typescript.md`

这是练习完成后的个人笔记输出文件。它不是本指导文件的复制品，而是你跑完每个 `.ts` 文件后整理出的结论。

建议先放一个英文结构占位，等练习完成后再写成中文学习笔记：

```txt
# TypeScript Notes

## Chapter 05 Classes and Interfaces

### Concept
Conclusion:
Technical meaning:
Runtime mechanism:
TypeScript checking:
Code example:
Common mistake:
Project relation:
```

最终笔记必须包含这些对比：

```txt
class value vs class instance type
class declaration vs instance creation
constructor parameter vs instance field
constructor assignment vs parameter property
instance side vs static side
field initializer vs constructor assignment
readonly vs deep immutability
method vs arrow method property
extends vs implements
super call vs super method access
override vs ordinary method
public vs protected vs private vs #private
static member vs instance member
interface vs type alias
interface extends vs intersection type
interface merging vs duplicate type alias
interface vs abstract class
class structural compatibility vs nominal class identity
typeof Class vs Class instance type
generic class vs generic method
mixin vs inheritance
decorator vs type annotation
factory pattern vs builder pattern
```

---

## 23. 本章最终要能回答的问题

学完第 5 章后，你必须能不用查资料回答这些问题：

1. 初始化（initialization）在 TypeScript 编译期和 JavaScript 运行时分别是什么意思？
2. initializer 是什么？它和类型注解有什么区别？
3. 一个 class 的最小基本结构由哪些部分组成？
4. constructor 参数和实例字段有什么区别？
5. 为什么 `constructor(title: string)` 不会自动创建 `this.title`？
6. 什么时候需要在 constructor 里写 `this.field = parameter`？
7. 什么时候应该用 field initializer，而不是 constructor assignment？
8. 参数属性为什么是 field declaration 加 constructor assignment 的简写？
9. 为什么 `constructor(public title: string)` 会生成赋值，而 `public title: string;` 不会？
10. parameter property 的赋值来自哪里？为什么不是来自 `: string`？
11. 为什么使用 parameter property 后，方法里访问实例字段仍然必须写 `this.field`？
12. method signature 和 method implementation 有什么区别？
13. constructor assignment 为什么不是 method implementation？
14. `field!: Type` 为什么不是初始化？
15. `declare field: Type` 为什么不是普通初始化写法？
16. `class` 在 TypeScript 中为什么既是值又是类型？
17. `interface` 为什么不能在运行时使用？
18. 类的实例侧和静态侧有什么区别？
19. `strictPropertyInitialization` 检查的是什么？
20. `readonly` 字段什么时候可以被赋值？
21. 类方法为什么必须通过 `this.` 访问实例字段？
22. 普通 class 方法通常存在哪里？实例字段通常存在哪里？static 成员存在哪里？
23. `extends` 在运行时和类型系统里分别做什么？
24. 子类构造函数里为什么必须先 `super()` 再访问 `this`？
25. 父类 constructor 为什么不能依赖子类字段已经初始化？
26. `override` 解决什么问题？
27. 为什么子类重写方法不能随便收窄参数？
28. `public`、`protected`、`private` 分别限制什么？
29. TypeScript `private` 和 JavaScript `#private` 有什么区别？
30. `static` 成员属于实例还是类构造函数对象？
31. 为什么 generic class 的 static 成员不能使用类类型参数？
32. 普通类方法为什么可能丢失 `this`？
33. 箭头方法属性解决什么问题，又有什么代价？
34. 返回 `this` 为什么适合链式 API？
35. interface 适合建模什么？
36. interface 声明合并是什么？
37. `implements` 为什么不会自动推导类方法参数？
38. 实现接口和扩展抽象类怎么选择？
39. TypeScript 类为什么是结构化类型？
40. private/protected 为什么会影响类兼容性？
41. `typeof SomeClass` 表示什么类型？
42. `InstanceType<typeof SomeClass>` 解决什么问题？
43. mixin 和继承有什么区别？
44. decorator 为什么不是普通类型注解？
45. TypeScript 为什么没有内置 final class？
46. 工厂模式适合解决什么对象创建问题？
47. 建造者模式适合解决什么复杂对象构造问题？

48. `super(...)` 和 `super.method(...)` 分别访问什么？为什么它们不是同一种调用？
49. 为什么 `super.render()` 调用的是父类 prototype 上的方法，但方法里的 `this` 仍然指向当前子类实例？

---

## 24. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)  
   读 Class Members、Fields、`strictPropertyInitialization`、`readonly`、Constructors、Super Calls、Methods、Getters/Setters、Class Heritage、`implements`、`extends`、Overriding Methods、Member Visibility、Static Members、Generic Classes、`this` at Runtime、this Types、Parameter Properties、Class Expressions、Constructor Signatures、abstract Classes and Members、Relationships Between Classes。

2. [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)  
   读 Optional Properties、readonly Properties、Index Signatures、Excess Property Checks、Extending Types、Intersection Types、Interface Extension vs Intersection、Generic Object Types。

3. [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)  
   读 Basic Concepts、Merging Interfaces，理解 namespace/type/value 三个声明空间和 interface 合并。

4. [Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html)  
   读 How Does A Mixin Work，理解 class expression pattern 和 generic constructor type。

5. [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)  
   只做预习：理解 decorator 是运行时函数调用，且 legacy decorator 需要 `experimentalDecorators`。不要在本章投入过多时间。

6. [TSConfig strictPropertyInitialization](https://www.typescriptlang.org/tsconfig/strictPropertyInitialization.html)  
   理解为什么类字段必须在声明处或构造函数里初始化。

7. [TSConfig noImplicitOverride](https://www.typescriptlang.org/tsconfig/noImplicitOverride.html)  
   理解为什么子类重写父类成员要显式写 `override`。

8. [TSConfig useDefineForClassFields](https://www.typescriptlang.org/tsconfig/useDefineForClassFields.html)  
   理解 class fields 的标准运行时语义，尤其是字段初始化顺序。

---

## 25. 第 5 章最终记忆模型

```txt
Class in JavaScript:
  constructor function value.
  instances created by new.
  fields stored on each instance.
  methods usually shared through prototype.
  static members stored on constructor object.
  extends links prototype chains.
  super calls parent constructor or parent methods.
  this depends on call site unless captured by arrow function.
  #private fields are runtime private.

Class in TypeScript:
  creates a runtime value.
  creates an instance type.
  has instance side and static side.
  fields can be checked for initialization.
  members can be public, protected, private, readonly, static, abstract.
  overrides must remain compatible with base class.
  generic classes preserve instance-side type relationships.
  classes are usually structurally compared.

Interface in TypeScript:
  type-only structural contract.
  erased from JavaScript output.
  can be extended.
  can merge with same-name interface declarations.
  can be implemented by classes.
  does not infer class method parameter types.
  does not create runtime properties.
```

### 最终一句话

```txt
第 3 章让你描述值的形状。
第 4 章让你描述行为的边界。
第 5 章让你描述对象的长期结构、继承关系和抽象契约。

真正的 TypeScript 类和接口学习，不是会写 class 和 interface，而是能分清运行时构造函数、实例类型、静态侧、接口契约、结构化兼容和抽象复用之间的边界。
```

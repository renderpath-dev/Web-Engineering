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
    01-fields-initialization/
    02-constructors-methods/
    03-inheritance-super-override/
    04-visibility-private-fields/
    05-static-generic-classes/
    06-this-runtime-and-this-types/
    07-interfaces/
    08-declaration-merging/
    09-implements/
    10-interface-vs-abstract-class/
    11-structural-class-types/
    12-class-value-and-type-space/
    13-advanced-class-patterns/
    14-factory-builder-patterns/
    15-mini-project/

notes/
  typescript.md
```

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

### 文件结构

```txt
00-class-value-and-type/
  classValueAndInstanceType.ts
  interfaceErasureBoundary.ts
```

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

### 文件结构

```txt
01-fields-initialization/
  fieldInitialization.ts
  strictPropertyInitialization.ts
  readonlyConstructorAssignment.ts
```

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

### 文件结构

```txt
02-constructors-methods/
  constructorTyping.ts
  parameterProperties.ts
  methodThisAccess.ts
```

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
  syntax sugar for declaring a field and assigning constructor parameter to it.

method body:
  instance fields must be accessed through this.
```

---

## 8. 03：继承、super 和 override

### 结论

`extends` 建立子类到父类的继承关系；`super` 调用父类构造函数或方法；`override` 显式声明子类成员正在重写父类成员。

### 文件结构

```txt
03-inheritance-super-override/
  extendsBasics.ts
  superCallOrder.ts
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
  // @ts-expect-error: The override is not compatible with the base method.
  override render(labelText: string): string {
    return labelText.toUpperCase();
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

// @ts-expect-error: name becomes never because it must be string and number.
const impossibleName: ImpossibleName = {
  name: "Ada",
};

console.log(typeof impossibleName);
```

---

## 13. 08：声明合并

### 结论

同名 `interface` 声明会合并成员。这是 TypeScript 的特殊能力，常用于扩展第三方库类型、全局类型和框架类型。

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
  chapter-05-classes-interfaces/
    README.md
    00-class-value-and-type/
      classValueAndInstanceType.ts
      interfaceErasureBoundary.ts
    01-fields-initialization/
      fieldInitialization.ts
      strictPropertyInitialization.ts
      readonlyConstructorAssignment.ts
    02-constructors-methods/
      constructorTyping.ts
      parameterProperties.ts
      methodThisAccess.ts
    03-inheritance-super-override/
      extendsBasics.ts
      superCallOrder.ts
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

最终笔记必须包含这些对比：

```txt
class value vs class instance type
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

1. `class` 在 TypeScript 中为什么既是值又是类型？
2. `interface` 为什么不能在运行时使用？
3. 类的实例侧和静态侧有什么区别？
4. `strictPropertyInitialization` 检查的是什么？
5. `!` definite assignment assertion 为什么危险？
6. 参数属性是运行时机制还是 TypeScript 简写？
7. `readonly` 字段什么时候可以被赋值？
8. 类方法为什么必须通过 `this.` 访问实例字段？
9. `extends` 在运行时和类型系统里分别做什么？
10. 子类构造函数里为什么必须先 `super()` 再访问 `this`？
11. `override` 解决什么问题？
12. 为什么子类重写方法不能随便收窄参数？
13. `public`、`protected`、`private` 分别限制什么？
14. TypeScript `private` 和 JavaScript `#private` 有什么区别？
15. `static` 成员属于实例还是类构造函数对象？
16. 为什么 generic class 的 static 成员不能使用类类型参数？
17. 普通类方法为什么可能丢失 `this`？
18. 箭头方法属性解决什么问题，又有什么代价？
19. 返回 `this` 为什么适合链式 API？
20. interface 适合建模什么？
21. interface 声明合并是什么？
22. `implements` 为什么不会自动推导类方法参数？
23. 实现接口和扩展抽象类怎么选择？
24. TypeScript 类为什么是结构化类型？
25. private/protected 为什么会影响类兼容性？
26. `typeof SomeClass` 表示什么类型？
27. `InstanceType<typeof SomeClass>` 解决什么问题？
28. mixin 和继承有什么区别？
29. decorator 为什么不是普通类型注解？
30. TypeScript 为什么没有内置 final class？
31. 工厂模式适合解决什么对象创建问题？
32. 建造者模式适合解决什么复杂对象构造问题？

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

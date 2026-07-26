# TypeScript 第 2 章“TypeScript 概述”学习指导文件 v1

> 定位：这是 TypeScript 第 2 章“TypeScript 概述”的教学型学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` / `.js` / `.json` 文件、运行 `tsc`、观察类型检查结果和编译产物，再把每节整理成正式学习笔记。  
> 参考范围：《TypeScript Programming》第 2 章“TypeScript 概述”，TypeScript 官方 Handbook / TSConfig Reference / tsc CLI Options / JavaScript Projects 文档，以及现代 TypeScript 工程实践。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：本章不是“安装 TypeScript”这么简单，而是建立 TypeScript 的整体运行模型：源码、编译器、类型检查器、配置文件、编辑器、运行时之间到底是什么关系。

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
    - [00：TypeScript 到底在 JavaScript 上加了什么](#00typescript-到底在-javascript-上加了什么)
    - [01：编译器、类型检查器和输出文件](#01编译器类型检查器和输出文件)
    - [02：类型系统只存在于编译期](#02类型系统只存在于编译期)
    - [03：类型推断、类型注解和类型错误](#03类型推断类型注解和类型错误)
    - [04：tsconfig.json 如何定义一个项目](#04tsconfigjson-如何定义一个项目)
    - [05：noEmit、outDir 和编译产物边界](#05noemitoutdir-和编译产物边界)
    - [06：target、lib、module 和运行环境](#06targetlibmodule-和运行环境)
    - [07：strict 和最小安全配置](#07strict-和最小安全配置)
    - [08：编辑器里的 TypeScript Language Service](#08编辑器里的-typescript-language-service)
    - [09：tslint.json 为什么不再作为现代默认选择](#09tslintjson-为什么不再作为现代默认选择)
    - [10：index.ts 作为入口文件](#10indexts-作为入口文件)
    - [11：诊断命令：showConfig、listFilesOnly、traceResolution](#11诊断命令showconfiglistfilesonlytraceresolution)
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

第 2 章是 TypeScript 学习路线的“操作系统层总览”。它不负责讲完所有类型语法，而是先回答一个更底层的问题：

```txt
TypeScript source code
  -> TypeScript compiler
  -> type checking
  -> JavaScript output or noEmit checking
  -> JavaScript runtime
```

你后面学习第 3 章到第 12 章时，所有类型错误、配置错误、模块错误、编辑器提示、构建错误，最终都能回到本章模型里解释。

### 本文件和后续章节的关系

```txt
第 3 章：
具体类型从哪里来，如何给值建模。

第 4 章：
函数边界如何被类型系统检查。

第 5 章：
class、interface 和运行时构造函数之间的区别。

第 6 章：
高级类型为什么只在编译期计算。

第 9 章：
React / Angular / backend 框架中，TypeScript 如何检查框架边界。

第 12 章：
构建、运行、发布时，tsc、bundler、runtime 如何协作。
```

---

## 1. 本章先解决什么问题

### 结论

本章先解决一个核心问题：

```txt
TypeScript 不是新的运行时语言。
TypeScript 是 JavaScript 加上一套静态类型系统、编译器和工具链。
```

你要先分清楚这几件事：

```txt
syntax:
  TypeScript 多了类型注解、接口、类型别名、泛型等语法。

type system:
  TypeScript 在编译期检查值的形状、函数参数、返回值、可赋值性和控制流。

emit:
  TypeScript 可以把 .ts 编译成 .js。

runtime:
  真正运行的仍然是 JavaScript，不是 TypeScript 类型。
```

### 不学清楚会导致什么混淆

如果第 2 章没学清楚，后面会反复出现这些问题：

```txt
为什么类型错误不会阻止 JavaScript 运行？
为什么类型注解编译后消失？
为什么写了 interface，运行时却找不到？
为什么 tsc index.ts 没读 tsconfig.json？
为什么 Vite 启动没报类型错误，但 tsc --noEmit 会报？
为什么编辑器报错和命令行报错有时不一致？
为什么 target 改了会影响输出语法，但不会自动添加 polyfill？
为什么 lib 改了会影响 document / Promise / DOM 类型？
```

### 本章技术意义

本章是 TypeScript 的“总开关章节”。它会让你建立这套判断模型：

```txt
一个问题出现时，先判断它属于哪一层：

1. TypeScript syntax error
2. TypeScript type checking error
3. TypeScript config error
4. module resolution error
5. JavaScript runtime error
6. bundler error
7. editor language service warning
8. linter warning
```

---

## 2. 学习本章前必须补齐的前置概念

| 前置概念 | 必须理解到什么程度 | 如果不懂会影响什么 |
|---|---|---|
| JavaScript 值（value） | 知道运行时真正存在的是 string、number、object、function 等值 | 会误以为 TypeScript 类型在运行时存在 |
| 变量绑定（variable binding） | 知道 const / let 创建的是名字和值的绑定 | 会混淆变量名、属性名和类型名 |
| 对象（object） | 知道对象由属性组成，属性属于运行时值 | 会看不懂结构化类型系统 |
| 函数（function） | 知道函数是值，可以接收参数并返回值 | 会看不懂参数类型和返回类型 |
| 模块（module） | 知道 import / export 建立文件边界 | 会看不懂 module / moduleResolution 配置 |
| Node 和 npm | 知道 npm 管理依赖，npx 可以运行本地包命令 | 会看不懂 npx tsc 和 package.json scripts |
| JSON 配置 | 知道 tsconfig.json 是 JSON 文件，不是 TypeScript 代码 | 会在配置文件里写注释或写错字段类型 |

### 前置概念快速补讲：类型名不是运行时变量名

```ts
// Goal:
// Verify that a type alias is not a runtime value.

// Expected error:
// Type names cannot be used as runtime values.

type ProductRecord = {
  title: string;
  price: number;
};

// @ts-expect-error
console.log(ProductRecord);
```

### 解释

- `type ProductRecord = ...` 创建的是类型系统里的名字。
- 类型别名（type alias）只给 TypeScript 编译器使用。
- JavaScript 运行时没有叫 `ProductRecord` 的变量。
- 所以不能 `console.log(ProductRecord)`。
- 这就是本章最重要的边界：类型层（type level）和运行时值层（runtime value level）不是同一层。

---

## 3. 本章学习目标

学完本章，你要能做到：

```txt
1. 准确解释 TypeScript 和 JavaScript 的关系。
2. 解释 tsc 做了什么，不做什么。
3. 区分 type checking、emit、runtime execution。
4. 手动创建 tsconfig.json。
5. 解释 include、exclude、files、compilerOptions 的作用。
6. 解释 noEmit、outDir、target、lib、module、moduleResolution。
7. 解释 strict 为什么是项目级安全开关。
8. 解释编辑器提示、tsc 报错、ESLint 警告的区别。
9. 解释为什么 tslint.json 属于历史知识，现代项目优先使用 ESLint。
10. 用 index.ts 建立最小 TypeScript 项目入口。
11. 用 tsc 诊断命令定位配置和文件包含问题。
```

---

## 4. 本章学习顺序

```txt
TypeScript vs JavaScript
  -> compiler and type checker
  -> type erasure
  -> inference and annotations
  -> tsconfig project boundary
  -> emit and noEmit
  -> target / lib / module
  -> strict configuration
  -> editor language service
  -> linting boundary
  -> index.ts entry file
  -> diagnostics commands
  -> mini project
```

学习顺序不能反过来。不要一上来背 `tsconfig` 字段。先理解：

```txt
TypeScript checks source code before JavaScript runs.
```

再理解：

```txt
tsconfig decides what source files belong to the project and how TypeScript checks or emits them.
```

---

## 5. 本章核心术语表

| 中文术语 | English term | 所属层级 | 技术意义 | 容易混淆点 |
|---|---|---|---|---|
| TypeScript 源文件 | TypeScript source file | syntax / toolchain | 扩展名通常是 `.ts` / `.tsx`，可以包含类型语法 | 容易误以为浏览器或 Node 能直接运行所有 TS 语法 |
| JavaScript 输出文件 | JavaScript output file | runtime output | TypeScript 编译后生成的 `.js` 文件 | 容易忘记真正运行的是 JS |
| 编译器 | compiler | toolchain | 读取 TS 源码，解析、检查、生成输出 | 容易只把它理解成“转译器” |
| 类型检查器 | type checker | type system | 分析类型关系、可赋值性、函数调用、控制流 | 容易和运行时验证混淆 |
| 类型推断 | type inference | type system | 编译器根据已有值推导类型 | 容易误以为必须到处写类型注解 |
| 类型注解 | type annotation | syntax / type system | 手动告诉编译器某个位置应该满足什么类型 | 容易误以为会在运行时转换值 |
| 类型擦除 | type erasure | compiler mechanism | 编译后类型语法消失，不进入 JS 输出 | 容易误以为 interface 是运行时对象 |
| 静态检查 | static checking | type system / toolchain | 程序运行前发现错误 | 容易和单元测试混淆 |
| 运行时 | runtime | runtime behavior | Node、浏览器或其他 JS 引擎实际执行 JS 的阶段 | 容易误以为 TS 类型能保护运行时外部数据 |
| 配置文件 | tsconfig.json | project configuration | 定义项目根、文件范围、编译选项 | 容易和 package.json 混淆 |
| 编译目标 | target | compiler option | 决定输出 JS 使用哪个 ECMAScript 语法级别 | 容易误以为它自动提供运行时 polyfill |
| 库声明 | lib | compiler option / type environment | 决定可用的全局类型声明，如 DOM、ES2022 | 容易和实际运行时能力混淆 |
| 模块输出 | module | compiler option | 决定 import/export 如何输出或被理解 | 容易和文件夹模块划分混淆 |
| 模块解析 | moduleResolution | compiler option | 决定 TypeScript 如何找到导入的模块和类型 | 容易和 runtime module loading 混淆 |
| 不输出 | noEmit | compiler option | 只做类型检查，不生成 JS | 容易误以为项目无法运行 |
| 严格模式 | strict | compiler option | 启用一组更强的类型检查规则 | 容易和 JS 的 use strict 混淆 |
| 语言服务 | TypeScript Language Service | editor tooling | 给编辑器提供补全、跳转、重命名、诊断 | 容易和命令行 tsc 混淆 |
| Linter | ESLint | static analysis tooling | 检查代码风格、潜在 bug、团队规则 | 容易和 TypeScript 类型检查混淆 |
| TSLint | TSLint | legacy tooling | 旧 TypeScript lint 工具，现代项目不作为默认选择 | 容易照旧书创建 tslint.json |

---

## 6. 本章底层模型

### 结论

TypeScript 项目的底层流程可以拆成两条线：

```txt
type checking line:
  .ts source
    -> parser
    -> binder
    -> checker
    -> diagnostics

emit line:
  .ts source
    -> transform
    -> .js output
    -> .d.ts output if enabled
    -> source map if enabled
```

如果设置了：

```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

那么第二条输出线关闭，第一条类型检查线仍然存在。

### 编译器流程模型

```txt
1. Read project config
   tsconfig.json tells TypeScript which files and options to use.

2. Parse source files
   TypeScript turns text into syntax tree.

3. Bind declarations
   TypeScript connects declared names to scopes and symbols.

4. Check types
   TypeScript checks assignments, calls, returns, object shapes, imports, and control flow.

5. Report diagnostics
   TypeScript prints errors and warnings.

6. Emit JavaScript
   If emit is enabled, TypeScript writes .js files.

7. Runtime executes JavaScript
   Node or browser executes emitted JavaScript.
```

### 类型系统和运行时的分界线

```txt
TypeScript type system:
  exists before runtime.
  reads source code.
  reports diagnostics.
  is erased from emitted JavaScript.

JavaScript runtime:
  receives JavaScript code.
  creates values and objects.
  calls functions.
  throws runtime errors.
  does not know TypeScript interfaces or type aliases.
```

### 最重要的判断原则

遇到任何 TypeScript 问题，先问：

```txt
这个东西会不会出现在 emitted JavaScript 中？
```

如果不会，它就是类型系统或编译器工具层内容；如果会，它才是运行时内容。

---

## 7. 推荐目录结构

本章建议目录：

```txt
typescript/chapter-02-typescript-overview/
  typescript-chapter-02-overview-learning-guide-zh-v1.md

  package.json
  tsconfig.json
  tsconfig.strict.json
  tsconfig.emit.json
  tsconfig.browser.json
  tsconfig.node.json

  00-ts-vs-js/
    safeNumericConversion.ts
    unsafeNumericOperation.ts

  01-compiler-typechecker-emit/
    productSummary.ts
    productSummaryMistake.ts

  02-type-erasure/
    typeOnlyModel.ts
    interfaceRuntimeMistake.ts

  03-inference-annotations-errors/
    inferenceDemo.ts
    annotationBoundary.ts
    excessPropertyMistake.ts

  04-tsconfig-project-boundary/
    includedSource.ts
    excludedDraft.ts
    configBoundaryNotes.md

  05-emit-noemit-outdir/
    emitSource.ts
    emitOutputNotes.md

  06-target-lib-module/
    browserGlobalDemo.ts
    nodeGlobalDemo.ts
    moduleOutputDemo.ts

  07-strict-configuration/
    implicitAnyMistake.ts
    nullCheckMistake.ts
    catchUnknownDemo.ts

  08-editor-language-service/
    editorHoverDemo.ts
    renameSymbolDemo.ts
    diagnosticDemo.ts

  09-linting-boundary/
    eslintBoundaryDemo.ts
    lintVsTypeCheckNotes.md

  10-index-entry/
    index.ts
    pricing.ts
    display.ts

  11-diagnostics-commands/
    moduleResolutionDemo.ts
    diagnosticsCommandNotes.md

  12-mini-project/
    package.json
    tsconfig.json
    src/index.ts
    src/catalog.ts
    src/pricing.ts
    src/report.ts
    src/config.ts
    README.md
```

### 目录设计原则

- 所有练习都放在 `typescript/chapter-02-typescript-overview/` 内。
- 不新建 `notes/`、`extra-guides/`、`misc/` 等平行目录。
- 本章重点是项目级配置和编译行为，所以要保留多个 `tsconfig.*.json` 做对比。
- `.md` 文件只用于记录观察结果，不替代代码训练。

---

## 8. 运行方式

### 初始化项目

```bash
mkdir -p typescript/chapter-02-typescript-overview
cd typescript/chapter-02-typescript-overview
npm init -y
npm install -D typescript
npx tsc --init
```

### 推荐 package.json

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:strict": "tsc -p tsconfig.strict.json --noEmit",
    "build": "tsc -p tsconfig.emit.json",
    "show-config": "tsc --showConfig",
    "list-files": "tsc --listFilesOnly",
    "trace-resolution": "tsc --traceResolution --noEmit"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### 推荐基础 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

### 本章常用命令

```bash
npx tsc --version
npx tsc --noEmit
npx tsc -p tsconfig.json --noEmit
npx tsc -p tsconfig.emit.json
npx tsc --showConfig
npx tsc --listFilesOnly
npx tsc --traceResolution --noEmit
```

---

## 9. 分节教学与训练内容

---

## 00：TypeScript 到底在 JavaScript 上加了什么

### 结论

TypeScript 在 JavaScript 上加的是静态类型系统和类型语法，不是新的运行时。TypeScript 代码最终要么被编译成 JavaScript 运行，要么只被用来做类型检查。

### 这一节解决什么问题

这一节解决：

```txt
TypeScript 和 JavaScript 到底是什么关系？
为什么 TypeScript 能发现一些 JS 运行时才暴露的问题？
为什么 TypeScript 不能保证所有运行时数据都安全？
```

### 技术意义

JavaScript 是动态语言，很多错误要到运行时才暴露。TypeScript 的价值是提前检查：

```txt
wrong property name
wrong argument type
wrong return type
missing field
nullable value misuse
impossible union branch
```

但 TypeScript 不会替你运行代码，也不会验证真实 API 返回值。

### 概念解释

TypeScript 是 JavaScript 的超集（superset）：

```txt
Every valid JavaScript program is usually valid TypeScript syntax.
TypeScript adds type syntax and static analysis on top of JavaScript.
```

这里的“超集”不是说所有 JS 代码都没有类型错误，而是说 TS 能读 JS 的语法，再额外检查类型关系。

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| syntax | 类型注解和类型声明 |
| runtime behavior | 运行的是 JS 值和 JS 运算 |
| language mechanism | 表达式求值和运算符仍按 JS 规则 |
| object model | 对象属性仍是 JS 运行时属性 |
| type system | TS 只在运行前检查是否安全 |

### 底层机制

```txt
source TypeScript:
  const priceText: string = "120";

type checker:
  sees priceText is string.
  rejects numeric operation if it requires number.

emitted JavaScript:
  const priceText = "120";

runtime:
  JavaScript executes the emitted code.
```

### API / 语法规则

本节没有新 API，重点是语言层边界：

```txt
value: runtime thing
type: compile-time description
annotation: syntax for telling TypeScript expected type
```

### 固定属性名 / 固定方法名 / 参数签名

本节没有固定 API。需要记住两个命令：

```txt
tsc --noEmit
tsc file.ts
```

### 文件结构

```txt
00-ts-vs-js/
  safeNumericConversion.ts
  unsafeNumericOperation.ts
```

### 示例代码

safeNumericConversion.ts

```ts
// Goal:
// Verify that TypeScript checks the value boundary before JavaScript runs.

// Expected output:
// 100

const cartTotalText = "120";
const cartTotalNumber = Number(cartTotalText);
const discountedTotal = cartTotalNumber - 20;

console.log(discountedTotal);
```

unsafeNumericOperation.ts

```ts
// Goal:
// Verify that TypeScript rejects unsafe numeric operations.

// Expected error:
// A string value should not be used directly as a number.

const cartTotalText = "120";

// @ts-expect-error
const discountedTotal = cartTotalText - 20;

console.log(discountedTotal);
```

### 代码逐行解释

```ts
const cartTotalText = "120";
```

- 创建变量绑定 `cartTotalText`。
- 运行时值是字符串 `"120"`。
- TypeScript 推断它的类型是 `string`。

```ts
const cartTotalNumber = Number(cartTotalText);
```

- 调用运行时构造函数 `Number`。
- 参数是字符串 `"120"`。
- 返回运行时数字 `120`。
- TypeScript 把返回值看成 `number`。

```ts
const discountedTotal = cartTotalNumber - 20;
```

- `cartTotalNumber` 是 `number`。
- `20` 是 number literal。
- `-` 运算符用于数值运算。
- TypeScript 接受这行代码。

```ts
console.log(discountedTotal);
```

- 运行时输出 `100`。
- `console.log()` 是运行时 API，不是类型系统 API。

### 运行方式

```bash
npx tsc --noEmit 00-ts-vs-js/safeNumericConversion.ts
npx tsc 00-ts-vs-js/safeNumericConversion.ts
node 00-ts-vs-js/safeNumericConversion.js
```

### 预期输出

```txt
100
```

### 执行过程

| 步骤 | 执行内容 | 运行时发生什么 | 当前关键值 |
|---|---|---|---|
| 1 | 创建 `cartTotalText` | 保存字符串 | `"120"` |
| 2 | 调用 `Number()` | 字符串转数字 | `120` |
| 3 | 执行减法 | 数字减数字 | `100` |
| 4 | 输出 | 打印结果 | `100` |

### 变量和引用变化

- 本例没有对象引用变化。
- 所有值都是原始值。
- TypeScript 类型不会创建运行时对象。

### 为什么得到这个输出

因为 `Number("120")` 在运行时产生数字 `120`，之后 `120 - 20` 得到 `100`。

### 对比写法

错误写法：

```ts
const cartTotalText = "120";
const discountedTotal = cartTotalText - 20;
```

这在 JavaScript 运行时可能得到 `100`，但 TypeScript 不鼓励依赖隐式转换。你的代码应该显式表达边界：

```ts
const cartTotalNumber = Number(cartTotalText);
```

### 常见错误为什么错

错误类型：TypeScript 类型错误。

错误原因：`cartTotalText` 是 `string`，你把它放进数值运算位置。即使 JS 运行时可能做隐式转换，TS 也要求你把意图写清楚。

### 和实际项目的关系

表单输入、URL query、localStorage、API JSON 中的数字经常先以字符串形式进入程序。真实项目里应显式解析，不要靠隐式转换。

### 和当前学习主线的关系

本节把你从 JavaScript 动态运行时带到 TypeScript 静态检查。后面的 `unknown`、schema validation、表单类型、API response 都是在扩展这个边界。

### 最终记忆模型

```txt
TypeScript does not replace JavaScript runtime.
TypeScript checks whether your JavaScript usage is safe before runtime.
```

---

## 01：编译器、类型检查器和输出文件

### 结论

`tsc` 不只做“把 .ts 变成 .js”。它同时承担项目读取、语法解析、类型检查、错误报告和可选输出。

### 这一节解决什么问题

解决：

```txt
tsc 到底做了什么？
类型错误和编译输出是什么关系？
为什么有错误时还能生成 JS？
为什么 noEmit 可以只检查不输出？
```

### 技术意义

真实项目中经常有两套流程：

```txt
development server:
  bundler transpiles fast.

CI typecheck:
  tsc --noEmit checks correctness.
```

你必须知道 `tsc` 的职责，才能解释 Vite、Next.js、Babel、SWC、ESBuild 和 `tsc` 的分工。

### 概念解释

编译器（compiler）是工具链组件。类型检查器（type checker）是编译器内部负责检查类型关系的部分。

```txt
compiler:
  reads files and options.

type checker:
  checks whether types are compatible.

emitter:
  writes JavaScript output.
```

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| syntax | .ts 文件中的类型语法 |
| runtime behavior | 编译后的 .js 被 Node 执行 |
| type system | 类型检查器报告错误 |
| toolchain | tsc 读取文件并输出 JS |

### 底层机制

```txt
productSummary.ts
  -> parse
  -> bind names
  -> check function call
  -> emit productSummary.js
  -> node runs productSummary.js
```

### API / 语法规则

命令签名：

```txt
tsc
tsc file.ts
tsc -p tsconfig.json
tsc --noEmit
```

参数说明：

| 命令 | 含义 |
|---|---|
| `tsc` | 从当前目录向上找最近的 `tsconfig.json` 并编译项目 |
| `tsc file.ts` | 用默认选项编译指定文件，此时忽略 `tsconfig.json` |
| `tsc -p tsconfig.json` | 使用指定配置编译项目 |
| `tsc --noEmit` | 只检查，不输出 JS |

### 固定属性名 / 固定方法名 / 参数签名

本节核心是 CLI 命令，不是对象 API：

```txt
--project / -p
--noEmit
--outDir
--target
--module
```

### 文件结构

```txt
01-compiler-typechecker-emit/
  productSummary.ts
  productSummaryMistake.ts
```

### 示例代码

productSummary.ts

```ts
// Goal:
// Verify that tsc checks types and emits JavaScript.

// Expected output:
// Keyboard costs 99

type ProductRecord = {
  title: string;
  price: number;
};

function createProductSummary(productRecord: ProductRecord): string {
  return `${productRecord.title} costs ${productRecord.price}`;
}

const keyboardRecord = {
  title: "Keyboard",
  price: 99,
};

console.log(createProductSummary(keyboardRecord));
```

productSummaryMistake.ts

```ts
// Goal:
// Verify that tsc reports a function argument type mismatch.

// Expected error:
// The price property must be a number.

type ProductRecord = {
  title: string;
  price: number;
};

function createProductSummary(productRecord: ProductRecord): string {
  return `${productRecord.title} costs ${productRecord.price}`;
}

const keyboardRecord = {
  title: "Keyboard",
  price: "99",
};

// @ts-expect-error
console.log(createProductSummary(keyboardRecord));
```

### 代码逐行解释

```ts
type ProductRecord = {
  title: string;
  price: number;
};
```

- 创建类型别名 `ProductRecord`。
- 它只存在于 TypeScript 类型系统。
- 编译成 JS 后这段会消失。

```ts
function createProductSummary(productRecord: ProductRecord): string {
```

- 创建运行时函数 `createProductSummary`。
- `productRecord: ProductRecord` 是参数类型注解。
- `: string` 是返回类型注解。
- 类型注解用于编译期检查，不会在 JS 中保留。

```ts
return `${productRecord.title} costs ${productRecord.price}`;
```

- 运行时读取对象属性 `title` 和 `price`。
- TypeScript 在编译期确认这两个属性存在。

```ts
const keyboardRecord = {
  title: "Keyboard",
  price: 99,
};
```

- 创建运行时对象。
- TypeScript 推断它的形状是 `{ title: string; price: number }`。

```ts
console.log(createProductSummary(keyboardRecord));
```

- 调用函数。
- TypeScript 检查参数形状是否满足 `ProductRecord`。
- 运行时输出字符串。

### 运行方式

```bash
npx tsc 01-compiler-typechecker-emit/productSummary.ts
node 01-compiler-typechecker-emit/productSummary.js
npx tsc --noEmit 01-compiler-typechecker-emit/productSummaryMistake.ts
```

### 预期输出

```txt
Keyboard costs 99
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 读取类型别名 | 建立类型模型 | 无运行时代码 |
| 2 | 读取函数声明 | 检查参数和返回类型 | 创建函数值 |
| 3 | 创建对象 | 推断对象类型 | 创建对象值 |
| 4 | 调用函数 | 检查参数兼容 | 执行函数 |
| 5 | 输出结果 | 无 | 打印字符串 |

### 变量和引用变化

- `keyboardRecord` 保存对象引用。
- `productRecord` 参数在函数调用时绑定到同一个对象引用。
- 类型别名不产生运行时引用。

### 为什么得到这个输出

对象的 `title` 是 `"Keyboard"`，`price` 是 `99`，模板字面量拼接得到 `"Keyboard costs 99"`。

### 对比写法

如果 `price` 写成字符串：

```ts
const keyboardRecord = {
  title: "Keyboard",
  price: "99",
};
```

TypeScript 会拒绝把它传给需要 `price: number` 的函数。

### 常见错误为什么错

错误类型：TypeScript 类型错误。

违反规则：函数调用时，实参类型必须可赋值给形参类型。

识别方式：看到 `Argument of type ... is not assignable to parameter of type ...`，先检查函数参数边界。

### 和实际项目的关系

组件 props、API client、backend handler、utility function 都是函数边界。TS 的第一大价值就是保护函数调用边界。

### 和当前学习主线的关系

你后面学泛型、条件类型、React props，本质都在扩展“函数边界和对象形状检查”。

### 最终记忆模型

```txt
tsc checks source code.
tsc may emit JavaScript.
Node or browser runs JavaScript, not TypeScript types.
```

---

## 02：类型系统只存在于编译期

### 结论

TypeScript 的 type、interface、类型注解、泛型参数通常都会在编译输出中被擦除。运行时只能看到 JavaScript 值。

### 这一节解决什么问题

解决：

```txt
为什么 interface 不能 console.log？
为什么 instanceof 不能检查 interface？
为什么泛型不能在运行时自动验证 API response？
```

### 技术意义

这节是整个 TS 学习最重要的底层边界之一。只要你记住类型会擦除，就不会把 TS 当成运行时验证工具。

### 概念解释

类型擦除（type erasure）指：

```txt
TypeScript type syntax is removed from emitted JavaScript.
```

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| syntax | type、interface、类型注解 |
| runtime behavior | 输出 JS 中没有类型声明 |
| type system | 类型只给 checker 使用 |
| object model | 对象仍然只是属性集合 |

### 底层机制

```txt
type Product = { title: string }
const product: Product = { title: "Keyboard" }

emits roughly:

const product = { title: "Keyboard" }
```

### API / 语法规则

类型位置和运行时值位置不同：

```txt
type position:
  const x: Product = ...

value position:
  console.log(Product)
```

### 固定属性名 / 固定方法名 / 参数签名

本节没有新 API。

需要记住：

```txt
type
interface
as
satisfies
```

这些大多参与编译期，不作为普通运行时值存在。

### 文件结构

```txt
02-type-erasure/
  typeOnlyModel.ts
  interfaceRuntimeMistake.ts
```

### 示例代码

typeOnlyModel.ts

```ts
// Goal:
// Verify that type annotations disappear after emit.

// Expected output:
// Keyboard

type ProductRecord = {
  title: string;
};

const productRecord: ProductRecord = {
  title: "Keyboard",
};

console.log(productRecord.title);
```

interfaceRuntimeMistake.ts

```ts
// Goal:
// Verify that an interface is not a runtime value.

// Expected error:
// Interface names cannot be used as runtime values.

interface ProductRecord {
  title: string;
}

const productRecord: ProductRecord = {
  title: "Keyboard",
};

// @ts-expect-error
console.log(ProductRecord);

console.log(productRecord.title);
```

### 代码逐行解释

```ts
type ProductRecord = {
  title: string;
};
```

- `ProductRecord` 是类型别名。
- 它描述对象形状。
- 它不会生成 JS 变量。

```ts
const productRecord: ProductRecord = {
  title: "Keyboard",
};
```

- `const productRecord` 是运行时变量绑定。
- `: ProductRecord` 是编译期类型注解。
- `{ title: "Keyboard" }` 是运行时对象值。
- 编译后只保留变量和值，不保留类型注解。

```ts
console.log(productRecord.title);
```

- 运行时读取对象属性。
- TypeScript 在编译期提前确认 `title` 存在。

### 运行方式

```bash
npx tsc 02-type-erasure/typeOnlyModel.ts --target ES2022 --outDir dist/type-erasure
node dist/type-erasure/typeOnlyModel.js
cat dist/type-erasure/typeOnlyModel.js
```

### 预期输出

```txt
Keyboard
```

输出 JS 中不会有：

```txt
type ProductRecord
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 声明类型别名 | 创建类型模型 | 无 |
| 2 | 创建对象 | 检查对象形状 | 创建对象 |
| 3 | 读取属性 | 确认属性存在 | 读取字符串 |
| 4 | 输出 | 无 | 打印 Keyboard |

### 变量和引用变化

- `productRecord` 是运行时变量。
- `ProductRecord` 不是运行时变量。
- 对象引用只存在于 `productRecord` 这个值绑定中。

### 为什么得到这个输出

因为运行时对象确实有 `title` 属性，值是 `"Keyboard"`。

### 对比写法

错误写法：

```ts
console.log(ProductRecord);
```

原因：`ProductRecord` 是类型名，不是运行时变量名。

### 常见错误为什么错

错误类型：TypeScript 类型错误，如果强行绕过还会变成运行时 `ReferenceError`。

违反规则：类型名只能出现在类型位置，不能当成值使用。

识别方式：如果一个名字只通过 `type` 或 `interface` 声明，就不能在 `console.log()`、`if`、`new`、`instanceof` 里当值用。

### 和实际项目的关系

API response 类型不会自动验证接口数据。你需要运行时验证库或手写验证函数，把 `unknown` 转成可信 domain type。

### 和当前学习主线的关系

这节为第 7 章错误处理、第 9 章 typed API、第 11 章声明文件、schema validation integration 打基础。

### 最终记忆模型

```txt
TypeScript types describe values before runtime.
JavaScript runtime only sees values.
```

---

## 03：类型推断、类型注解和类型错误

### 结论

TypeScript 不要求你到处写类型注解。它会根据初始化值、函数返回值、上下文位置推断类型。类型注解应该写在边界上，而不是每个局部变量上。

### 这一节解决什么问题

解决：

```txt
什么时候让 TS 推断？
什么时候应该手写注解？
为什么对象字面量会有额外属性检查？
```

### 技术意义

优秀 TS 代码不是“注解越多越好”，而是：

```txt
internal implementation:
  rely on inference.

public boundary:
  use explicit types.
```

### 概念解释

类型推断（type inference）是编译器根据已有信息自动得到类型。

类型注解（type annotation）是你手动告诉编译器预期类型。

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| syntax | `const x: string = ...` |
| runtime behavior | 注解不影响运行时值 |
| type system | 推断和注解共同决定检查结果 |
| object model | 对象字面量仍是运行时对象 |

### 底层机制

```txt
const pageSize = 20
  -> TypeScript infers number.

const pageSize: number = 20
  -> TypeScript checks 20 is assignable to number.

const pageSize: string = 20
  -> TypeScript reports error.
```

### API / 语法规则

```txt
variable annotation:
  const name: Type = value;

function parameter annotation:
  function run(input: Type) {}

function return annotation:
  function run(): Type {}

object type annotation:
  const value: { key: Type } = ...
```

### 固定属性名 / 固定方法名 / 参数签名

本节没有运行时 API。核心语法：

```txt
:
type
interface
```

### 文件结构

```txt
03-inference-annotations-errors/
  inferenceDemo.ts
  annotationBoundary.ts
  excessPropertyMistake.ts
```

### 示例代码

inferenceDemo.ts

```ts
// Goal:
// Verify how TypeScript infers local variable types.

// Expected output:
// product:Keyboard:99

const productTitle = "Keyboard";
const productPrice = 99;

function createInventoryLabel(title: string, price: number): string {
  return `product:${title}:${price}`;
}

console.log(createInventoryLabel(productTitle, productPrice));
```

annotationBoundary.ts

```ts
// Goal:
// Verify why public function boundaries should be explicit.

// Expected output:
// 89

type ScoreRecord = {
  correctCount: number;
  totalCount: number;
};

function calculateScorePercent(scoreRecord: ScoreRecord): number {
  return Math.round((scoreRecord.correctCount / scoreRecord.totalCount) * 100);
}

console.log(calculateScorePercent({ correctCount: 8, totalCount: 9 }));
```

excessPropertyMistake.ts

```ts
// Goal:
// Verify excess property checking on object literals.

// Expected error:
// Object literals cannot contain unexpected properties for this target type.

type ProductRecord = {
  title: string;
  price: number;
};

const productRecord: ProductRecord = {
  title: "Keyboard",
  price: 99,
  // @ts-expect-error
  currencyCode: "USD",
};

console.log(productRecord.title);
```

### 代码逐行解释

```ts
const productTitle = "Keyboard";
```

- 创建变量绑定。
- 初始化值是字符串字面量。
- 在 const 场景中，TS 可以保留较精确的字面量信息，但在普通使用中它可作为 string 传入函数。

```ts
function createInventoryLabel(title: string, price: number): string {
```

- `title: string` 是参数类型注解。
- `price: number` 是参数类型注解。
- `: string` 是返回值类型注解。
- 函数体必须返回 string-compatible 的值。

```ts
return `product:${title}:${price}`;
```

- 模板字面量在运行时生成字符串。
- TypeScript 确认返回值是 string。

### 运行方式

```bash
npx tsc --noEmit 03-inference-annotations-errors/inferenceDemo.ts
npx tsc 03-inference-annotations-errors/inferenceDemo.ts
node 03-inference-annotations-errors/inferenceDemo.js
```

### 预期输出

```txt
product:Keyboard:99
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 声明标题 | 推断字符串类型 | 保存字符串 |
| 2 | 声明价格 | 推断数字类型 | 保存数字 |
| 3 | 定义函数 | 检查参数和返回类型 | 创建函数 |
| 4 | 调用函数 | 检查实参类型 | 执行模板拼接 |
| 5 | 输出 | 无 | 打印字符串 |

### 变量和引用变化

- 本例没有对象引用共享。
- `title` 和 `price` 是函数调用时创建的参数绑定。
- 类型注解不会影响运行时绑定。

### 为什么得到这个输出

函数接收 `"Keyboard"` 和 `99`，模板字面量按顺序拼接成字符串。

### 对比写法

过度注解：

```ts
const productTitle: string = "Keyboard";
const productPrice: number = 99;
```

这不是错误，但在局部变量上通常没必要。更有价值的是给函数参数和返回值写清楚边界。

### 常见错误为什么错

错误类型：TypeScript 类型错误。

错误代码：

```ts
const productRecord: ProductRecord = {
  title: "Keyboard",
  price: 99,
  currencyCode: "USD",
};
```

错误原因：对象字面量直接赋给目标类型时，TypeScript 会做额外属性检查（excess property checking），防止拼错字段或传入目标类型不认识的字段。

### 和实际项目的关系

React props、API request body、配置对象都经常使用对象字面量。额外属性检查可以提前发现字段名错误。

### 和当前学习主线的关系

本节连接第 3 章的类型基础和第 6 章的结构化类型系统。

### 最终记忆模型

```txt
Let TypeScript infer local details.
Annotate important boundaries.
```

---

## 04：tsconfig.json 如何定义一个项目

### 结论

tsconfig.json 定义 TypeScript 项目边界：哪些文件属于项目，以及编译器应该使用哪些规则检查和输出这些文件。

### 这一节解决什么问题

解决：

```txt
为什么 tsc 有时检查整个项目，有时只检查一个文件？
include / exclude / files 到底控制什么？
为什么命令行传入文件时 tsconfig 可能被忽略？
```

### 技术意义

没有 tsconfig.json，TypeScript 只是按默认选项处理文件。有了 tsconfig.json，TypeScript 才知道“这是一个项目”。

### 概念解释

配置文件（configuration file）不属于 TypeScript 源码。它是工具链读取的 JSON 配置。

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| syntax | JSON syntax |
| toolchain | tsc 读取配置 |
| type system | 配置影响类型检查规则 |
| runtime behavior | 配置文件不被 Node 作为业务代码运行 |

### 底层机制

```txt
npx tsc
  -> search tsconfig.json
  -> read include/exclude/files
  -> read compilerOptions
  -> create program
  -> check project files
```

### API / 语法规则

tsconfig.json 常见顶层字段：

```txt
compilerOptions
include
exclude
files
extends
references
```

### 固定属性名 / 固定方法名 / 参数签名

```json
{
  "compilerOptions": {},
  "include": [],
  "exclude": [],
  "files": []
}
```

字段含义：

| 字段 | 类型 | 含义 |
|---|---|---|
| compilerOptions | object | 编译器选项 |
| include | string array | 按 glob 包含文件 |
| exclude | string array | 从 include 结果中排除 |
| files | string array | 精确列出文件 |
| extends | string | 继承另一个配置 |
| references | object array | 项目引用 |

### 文件结构

```txt
04-tsconfig-project-boundary/
  includedSource.ts
  excludedDraft.ts
  configBoundaryNotes.md
```

### 示例代码

tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true
  },
  "include": ["04-tsconfig-project-boundary/**/*.ts"],
  "exclude": ["04-tsconfig-project-boundary/excludedDraft.ts"]
}
```

includedSource.ts

```ts
// Goal:
// Verify that this file is included by tsconfig.json.

// Expected output:
// included

const includedLabel = "included";

console.log(includedLabel);
```

excludedDraft.ts

```ts
// Goal:
// Verify that this file is excluded by tsconfig.json.

// Expected result:
// This file should not be checked by the project config.

const draftCount: number = "wrong";
console.log(draftCount);
```

### 代码逐行解释

includedSource.ts

```ts
const includedLabel = "included";
```

- 创建运行时变量。
- TypeScript 推断它是字符串。

```ts
console.log(includedLabel);
```

- 输出字符串。
- 这个文件被 include 匹配，所以 npx tsc 会检查它。

excludedDraft.ts

```ts
const draftCount: number = "wrong";
```

- 这行本来有类型错误。
- 但文件被 exclude 排除时，项目级 npx tsc 不检查它。
- 如果你直接运行 `npx tsc excludedDraft.ts`，它又会被检查。

### 运行方式

```bash
npx tsc --noEmit
npx tsc --noEmit 04-tsconfig-project-boundary/excludedDraft.ts
```

### 预期输出

项目级检查不报告 excludedDraft.ts 的错误。直接检查该文件时会报告类型错误。

### 执行过程

| 步骤 | 执行内容 | 工具链发生什么 | 当前关键结果 |
|---|---|---|---|
| 1 | 运行 npx tsc | 查找 tsconfig.json | 找到项目配置 |
| 2 | 读取 include | 匹配目录下 .ts | 包含源文件 |
| 3 | 读取 exclude | 排除 draft 文件 | draft 不进项目 |
| 4 | 类型检查 | 只检查项目文件 | 不报告 draft 错误 |

### 变量和引用变化

本节重点不在运行时变量，而在项目文件集合（program files）的变化。

### 为什么得到这个输出

因为项目配置决定了哪些文件进入 TypeScript Program。没有进入 Program 的文件不会被项目级检查。

### 对比写法

```bash
npx tsc excludedDraft.ts
```

当命令行直接传入文件时，tsconfig.json 的项目文件范围可能不按你预期生效。练习时优先用：

```bash
npx tsc -p tsconfig.json --noEmit
```

### 常见错误为什么错

错误类型：工具链配置错误。

错误原因：以为 exclude 是全局禁止检查，但直接传文件时仍然可能检查它。

识别方式：看命令是否使用了 -p 或是否直接传入了 .ts 文件名。

### 和实际项目的关系

大项目中测试文件、构建产物、临时脚本、node-only 文件、browser-only 文件都需要通过不同配置划分边界。

### 和当前学习主线的关系

第 12 章项目引用、monorepo、library publishing 都建立在本节配置模型上。

### 最终记忆模型

```txt
tsconfig.json defines the TypeScript project boundary.
```

---

## 05：noEmit、outDir 和编译产物边界

### 结论

noEmit 控制是否输出文件；outDir 控制输出目录。类型检查和输出文件是两件不同的事。

### 这一节解决什么问题

解决：

```txt
为什么 tsc --noEmit 没有生成 JS？
为什么 Vite 项目还要跑 tsc --noEmit？
为什么 dist 目录应该排除出源代码范围？
```

### 技术意义

现代前端项目常见配置：

```txt
bundler:
  emits production JavaScript.

tsc --noEmit:
  checks types.
```

所以你不能把 tsc --noEmit 理解成“没用”。

### 概念解释

编译产物（build output）是工具生成的文件，通常不应该再作为源码输入参与类型检查。

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| toolchain | noEmit、outDir |
| type system | noEmit 不关闭类型检查 |
| runtime behavior | outDir 中 JS 可被 Node 执行 |
| project boundary | dist 通常应该被 exclude |

### 底层机制

```txt
noEmit: true
  -> check files
  -> write no output

noEmit: false + outDir: "dist"
  -> check files
  -> write JavaScript into dist
```

### API / 语法规则

```json
{
  "compilerOptions": {
    "noEmit": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

### 固定属性名 / 固定方法名 / 参数签名

| 配置项 | 类型 | 含义 |
|---|---|---|
| noEmit | boolean | 不输出 JS / declaration / source map |
| outDir | string | 输出目录 |
| rootDir | string | 输入源码根目录 |
| declaration | boolean | 输出 .d.ts |
| sourceMap | boolean | 输出 .js.map |

### 文件结构

```txt
05-emit-noemit-outdir/
  emitSource.ts
  emitOutputNotes.md
```

### 示例代码

tsconfig.emit.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "rootDir": "05-emit-noemit-outdir",
    "outDir": "dist/chapter-02-emit",
    "noEmit": false
  },
  "include": ["05-emit-noemit-outdir/**/*.ts"]
}
```

emitSource.ts

```ts
// Goal:
// Verify how TypeScript emits JavaScript into outDir.

// Expected output:
// emit-ready

const buildStatusLabel = "emit-ready";

console.log(buildStatusLabel);
```

### 代码逐行解释

```ts
const buildStatusLabel = "emit-ready";
```

- 创建变量绑定。
- TypeScript 推断字符串类型。
- 这行会进入输出 JS。

```ts
console.log(buildStatusLabel);
```

- 运行时输出变量值。
- 这行也会进入输出 JS。

### 运行方式

```bash
npx tsc -p tsconfig.emit.json
node dist/chapter-02-emit/emitSource.js
```

### 预期输出

```txt
emit-ready
```

### 执行过程

| 步骤 | 执行内容 | 工具链发生什么 | 当前关键结果 |
|---|---|---|---|
| 1 | 读取配置 | 找到 rootDir 和 outDir | 确定输入输出位置 |
| 2 | 检查源码 | 类型检查通过 | 没有 diagnostics |
| 3 | 输出 JS | 写入 dist | 生成 .js |
| 4 | 运行 JS | Node 执行输出文件 | 打印文本 |

### 变量和引用变化

本节的重点是文件流向：

```txt
source file reference:
  05-emit-noemit-outdir/emitSource.ts

output file:
  dist/chapter-02-emit/emitSource.js
```

### 为什么得到这个输出

因为 noEmit 是 false，TypeScript 输出 JS，Node 运行 JS 后打印字符串。

### 对比写法

```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

这种配置适合只做类型检查，不生成 JS。

### 常见错误为什么错

错误类型：工具链配置错误。

错误原因：把 noEmit: true 放进需要 tsc 生成 JS 的 Node 项目里，然后找不到输出文件。

识别方式：如果 node dist/... 报找不到文件，先检查 noEmit 和 outDir。

### 和实际项目的关系

Vite / Next.js 通常不靠 tsc 输出前端 JS，但库发布、Node 脚本、纯 TS 项目可能需要 tsc 输出文件。

### 和当前学习主线的关系

第 12 章构建和发布会系统讲 declaration、emitDeclarationOnly、sourceMap、project references。

### 最终记忆模型

```txt
noEmit controls output.
It does not disable type checking.
```

---

## 06：target、lib、module 和运行环境

### 结论

target 决定输出 JS 的语法级别；lib 决定 TypeScript 能看到哪些全局类型；module 决定模块语法如何被处理或输出。三者经常一起影响项目行为，但它们不是同一个东西。

### 这一节解决什么问题

解决：

```txt
为什么 document 找不到？
为什么 Promise 类型找不到？
为什么 import/export 输出不一样？
为什么改 target 不等于自动兼容旧浏览器？
```

### 技术意义

不同项目有不同运行环境：

```txt
browser app:
  needs DOM lib.

node app:
  needs node types.

library:
  needs declaration output and careful module settings.

bundler app:
  often uses noEmit but still needs correct module information.
```

### 概念解释

- target 是输出 JS 语法目标。
- lib 是类型环境中的标准库声明集合。
- module 是模块输出或模块理解方式。
- moduleResolution 是 TypeScript 查找导入模块的算法。

### 语法、运行时、对象模型、类型系统边界

| 配置项 | 影响层级 |
|---|---|
| target | emit / syntax output |
| lib | type system global declarations |
| module | emit / module checking |
| moduleResolution | toolchain module lookup |
| types | included global type packages |

### 底层机制

```txt
lib includes DOM
  -> document is known to TypeScript.

lib excludes DOM
  -> document may be unknown.

target ES2022
  -> output may keep modern syntax.

target ES2017
  -> output may transform newer syntax.
```

### API / 语法规则

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

### 固定属性名 / 固定方法名 / 参数签名

| 配置项 | 常见值 |
|---|---|
| target | ES2020、ES2022、ESNext |
| lib | ES2022、DOM、DOM.Iterable |
| module | NodeNext、ESNext、CommonJS |
| moduleResolution | NodeNext、Bundler、Node16 |
| types | ["node"] |

### 文件结构

```txt
06-target-lib-module/
  browserGlobalDemo.ts
  nodeGlobalDemo.ts
  moduleOutputDemo.ts
```

### 示例代码

browserGlobalDemo.ts

```ts
// Goal:
// Verify that DOM types come from the lib option.

// Expected result:
// This file type-checks only when DOM lib is available.

const pageTitleElement = document.querySelector("title");

console.log(pageTitleElement?.textContent);
```

nodeGlobalDemo.ts

```ts
// Goal:
// Verify that Node globals require Node type declarations.

// Expected output:
// current-directory-ready

console.log(process.cwd() ? "current-directory-ready" : "missing-directory");
```

moduleOutputDemo.ts

```ts
// Goal:
// Verify module syntax in a TypeScript file.

// Expected output:
// module-ready

export function createModuleLabel(): string {
  return "module-ready";
}

console.log(createModuleLabel());
```

### 代码逐行解释

browserGlobalDemo.ts

```ts
const pageTitleElement = document.querySelector("title");
```

- document 是浏览器 DOM 全局对象。
- TypeScript 是否认识 document 取决于 lib 是否包含 DOM。
- querySelector() 返回可能为 null 的元素引用。

```ts
console.log(pageTitleElement?.textContent);
```

- `?.` 是可选链。
- 如果 pageTitleElement 是 null，结果是 undefined。
- 如果找到元素，读取 textContent。

### 运行方式

浏览器配置：

```bash
npx tsc -p tsconfig.browser.json --noEmit
```

Node 配置：

```bash
npm install -D @types/node
npx tsc -p tsconfig.node.json --noEmit
```

### 预期输出

browserGlobalDemo.ts 不建议直接在 Node 运行，因为 Node 没有 document。

nodeGlobalDemo.ts 在 Node 环境运行输出：

```txt
current-directory-ready
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 使用 document | 需要 DOM lib | 浏览器提供 document |
| 2 | 使用 process | 需要 Node types | Node 提供 process |
| 3 | 使用 export | 根据 module 检查 | 根据输出格式运行 |

### 变量和引用变化

- document 和 process 都不是你声明的局部变量。
- 它们来自运行环境的全局对象，TypeScript 通过声明文件认识它们。

### 为什么得到这个输出

Node 环境提供 process.cwd()，它返回当前工作目录字符串，所以条件表达式选择 `"current-directory-ready"`。

### 对比写法

错误配置：

```json
{
  "compilerOptions": {
    "lib": ["ES2022"]
  }
}
```

这时 TypeScript 不知道 DOM 类型，document 会报错。

### 常见错误为什么错

错误类型：类型环境配置错误。

错误原因：运行环境和 TypeScript 类型环境不一致。

识别方式：如果错误是 `Cannot find name 'document'`，检查 lib；如果错误是 `Cannot find name 'process'`，检查 @types/node 和 types。

### 和实际项目的关系

React 浏览器项目需要 DOM 类型；Node API 项目需要 Node 类型；Next.js 同时包含 server 和 client 边界，更要区分环境。

### 和当前学习主线的关系

这节直接支撑 React、Node、Next.js 和 monorepo 里的多环境配置。

### 最终记忆模型

```txt
target controls emitted syntax.
lib controls known global types.
module controls module behavior.
```

---

## 07：strict 和最小安全配置

### 结论

strict 是 TypeScript 项目的安全总开关。新项目应该默认开启，再根据需要理解每个严格选项，而不是为了少报错关闭它。

### 这一节解决什么问题

解决：

```txt
strict 到底控制什么？
为什么 noImplicitAny 很重要？
为什么 strictNullChecks 改变代码习惯？
为什么 catch 变量应该先验证？
```

### 技术意义

严格配置不是形式主义。它能强迫你处理真实项目中最容易出 bug 的地方：

```txt
implicit any
nullable value
unsafe catch error
unchecked indexed access
missing returns
```

### 概念解释

strict: true 会开启一组严格类型检查行为。它不是 JavaScript 的 use strict。

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| type system | 更严格检查 |
| runtime behavior | 不改变运行时 JS 语义 |
| config | 项目级开关 |
| error prevention | 提前暴露潜在 bug |

### 底层机制

```txt
strict false:
  TypeScript may allow uncertain code.

strict true:
  TypeScript forces explicit handling.
```

### API / 语法规则

推荐基础：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true
  }
}
```

### 固定属性名 / 固定方法名 / 参数签名

| 配置项 | 含义 |
|---|---|
| strict | 启用严格检查族 |
| noImplicitAny | 不允许隐式 any |
| strictNullChecks | 严格区分 null / undefined |
| useUnknownInCatchVariables | catch 变量默认为 unknown |
| noImplicitReturns | 检查函数所有路径是否返回 |
| noUncheckedIndexedAccess | 索引读取加入 undefined |
| exactOptionalPropertyTypes | 更精确处理可选属性 |

### 文件结构

```txt
07-strict-configuration/
  implicitAnyMistake.ts
  nullCheckMistake.ts
  catchUnknownDemo.ts
```

### 示例代码

implicitAnyMistake.ts

```ts
// Goal:
// Verify that function parameters should not become implicit any.

// Expected error:
// The parameter needs an explicit type.

// @ts-expect-error
function createOrderLabel(orderRecord) {
  return `order:${orderRecord.id}`;
}

console.log(createOrderLabel({ id: "A-100" }));
```

nullCheckMistake.ts

```ts
// Goal:
// Verify that nullable values must be checked.

// Expected output:
// missing-title

function readProductTitle(productRecord: { title?: string }): string {
  return productRecord.title ?? "missing-title";
}

console.log(readProductTitle({}));
```

catchUnknownDemo.ts

```ts
// Goal:
// Verify safe error handling with unknown catch variables.

// Expected output:
// Error: request failed

try {
  throw new Error("request failed");
} catch (caughtError) {
  if (caughtError instanceof Error) {
    console.log(`${caughtError.name}: ${caughtError.message}`);
  } else {
    console.log("Unknown error");
  }
}
```

### 代码逐行解释

catchUnknownDemo.ts

```ts
try {
  throw new Error("request failed");
}
```

- 创建 Error 实例。
- 立即抛出错误。
- 控制流进入 catch。

```ts
catch (caughtError) {
```

- caughtError 接收被抛出的值。
- 在严格配置下，它应被当作 unknown 处理。
- 不能直接读取 message，必须先验证类型。

```ts
if (caughtError instanceof Error) {
```

- 运行时检查 caughtError 是否是 Error 实例。
- TypeScript 根据控制流收窄类型。

```ts
console.log(`${caughtError.name}: ${caughtError.message}`);
```

- 收窄后可以安全读取 name 和 message。

### 运行方式

```bash
npx tsc -p tsconfig.strict.json --noEmit
npx tsc 07-strict-configuration/catchUnknownDemo.ts --target ES2022 --outDir dist/strict
node dist/strict/catchUnknownDemo.js
```

### 预期输出

```txt
Error: request failed
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 抛出 Error | 确认语法合法 | 创建并抛出 Error |
| 2 | catch 接收 | 变量类型视为 unknown | 绑定错误值 |
| 3 | instanceof 检查 | 收窄为 Error | 判断为 true |
| 4 | 读取属性 | 允许读取 message | 输出错误信息 |

### 变量和引用变化

- caughtError 先是 unknown。
- instanceof Error 分支内被收窄为 Error。
- 这是编译期控制流分析，不是创建新对象。

### 为什么得到这个输出

抛出的是 Error 实例，所以 instanceof Error 为 true，输出 `Error: request failed`。

### 对比写法

错误写法：

```ts
try {
  throw new Error("request failed");
} catch (caughtError) {
  console.log(caughtError.message);
}
```

在安全配置下，caughtError 是 unknown，不能直接读属性。

### 常见错误为什么错

错误类型：TypeScript 类型错误。

违反规则：unknown 必须先收窄才能使用。

识别方式：看到 `Object is of type 'unknown'`，就要写 typeof、instanceof、自定义 type guard 或 schema validation。

### 和实际项目的关系

网络请求、JSON 解析、后端 handler、任务队列都可能抛出非 Error 值。严格处理 catch 可以减少错误处理代码再次崩溃。

### 和当前学习主线的关系

这节连接第 7 章错误处理和 schema validation integration。

### 最终记忆模型

```txt
strict mode makes uncertainty explicit.
```

---

## 08：编辑器里的 TypeScript Language Service

### 结论

编辑器里的红线、hover、自动补全、跳转定义、重命名，大多来自 TypeScript Language Service。它和命令行 tsc 共享很多类型分析能力，但使用场景不同。

### 这一节解决什么问题

解决：

```txt
为什么 WebStorm / VS Code 不运行代码也能报错？
为什么编辑器有时和终端 tsc 结果不同？
为什么重命名 symbol 比全文替换安全？
```

### 技术意义

现代 TS 学习不能只看命令行。IDE 是 TypeScript 开发体验的重要组成部分。

### 概念解释

语言服务（Language Service）长期运行在编辑器背后，实时分析项目文件，给出：

```txt
diagnostics
hover type
autocomplete
go to definition
find references
rename symbol
quick fix
```

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| editor tooling | hover、diagnostics、rename |
| type system | 语言服务使用类型检查信息 |
| runtime behavior | 编辑器提示不会执行代码 |
| project config | 语言服务读取 tsconfig.json |

### 底层机制

```txt
editor opens project
  -> finds tsconfig.json
  -> starts TypeScript server
  -> builds project graph
  -> analyzes open files
  -> reports diagnostics and suggestions
```

### API / 语法规则

本节没有运行时 API。重点是编辑器操作：

```txt
Hover
Go to Definition
Find References
Rename Symbol
Quick Fix
Restart TypeScript Server
Select TypeScript Version
```

### 固定属性名 / 固定方法名 / 参数签名

无运行时 API。

### 文件结构

```txt
08-editor-language-service/
  editorHoverDemo.ts
  renameSymbolDemo.ts
  diagnosticDemo.ts
```

### 示例代码

editorHoverDemo.ts

```ts
// Goal:
// Use editor hover to inspect inferred types.

// Expected result:
// Hover shows the inferred object and function return types.

const dashboardSettingsRecord = {
  themeMode: "dark",
  pageSize: 20,
};

function createSettingsSummary(settingsRecord: typeof dashboardSettingsRecord) {
  return `${settingsRecord.themeMode}:${settingsRecord.pageSize}`;
}

console.log(createSettingsSummary(dashboardSettingsRecord));
```

renameSymbolDemo.ts

```ts
// Goal:
// Verify that symbol rename is safer than text replacement.

// Expected output:
// inventory:3

const inventoryItemCount = 3;

function createInventorySummary(itemCount: number): string {
  return `inventory:${itemCount}`;
}

console.log(createInventorySummary(inventoryItemCount));
```

diagnosticDemo.ts

```ts
// Goal:
// Verify editor diagnostics from TypeScript Language Service.

// Expected error:
// The argument must be a number.

function formatPageSize(pageSize: number): string {
  return `page-size:${pageSize}`;
}

// @ts-expect-error
console.log(formatPageSize("20"));
```

### 代码逐行解释

```ts
const dashboardSettingsRecord = {
  themeMode: "dark",
  pageSize: 20,
};
```

- 创建对象值。
- TypeScript 推断对象属性类型。
- 编辑器 hover 可以展示推断结果。

```ts
function createSettingsSummary(settingsRecord: typeof dashboardSettingsRecord) {
```

- typeof dashboardSettingsRecord 在类型位置读取变量的静态类型。
- 不是运行时 typeof 表达式。
- 编辑器能跳转到变量定义。

### 运行方式

```bash
npx tsc --noEmit 08-editor-language-service/editorHoverDemo.ts
```

同时在编辑器中执行：

```txt
1. Hover dashboardSettingsRecord.
2. Hover createSettingsSummary.
3. Rename inventoryItemCount.
4. Check whether all references are updated.
```

### 预期输出

editorHoverDemo.ts 运行输出：

```txt
dark:20
```

### 执行过程

| 步骤 | 执行内容 | 编辑器发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 打开文件 | Language Service 分析类型 | 无 |
| 2 | hover 变量 | 显示推断类型 | 无 |
| 3 | rename symbol | 更新相关引用 | 无 |
| 4 | 运行 JS | 无 | 输出结果 |

### 变量和引用变化

- 编辑器 rename 改的是源代码里的 symbol references。
- 不是运行时对象引用。
- Rename Symbol 和文本搜索替换不同，它知道哪些名字是同一个声明。

### 为什么得到这个输出

运行时调用函数，把对象属性拼接为字符串。

### 对比写法

危险方式：

```txt
Search text: count
Replace text: total
```

这可能错误修改字符串、注释、无关变量。应优先用 Rename Symbol。

### 常见错误为什么错

错误类型：工具使用错误。

原因：编辑器可能使用全局 TypeScript 版本，而项目使用本地 TypeScript 版本，导致诊断不一致。

识别方式：查看编辑器当前 TypeScript version，并和 `npx tsc --version` 对比。

### 和实际项目的关系

大型项目中，安全重构离不开 Language Service。重命名 props、函数、类型、导出 API 时必须用 symbol-aware 工具。

### 和当前学习主线的关系

你后面学习 React / TSX 时，props 推断、事件类型提示、组件跳转都依赖这套服务。

### 最终记忆模型

```txt
The editor is not guessing.
It is asking TypeScript to analyze your project.
```

---

## 09：tslint.json 为什么不再作为现代默认选择

### 结论

书上第 2 章提到 tslint.json，这是历史背景。现代 TypeScript 项目不应默认新建 TSLint 配置，而应优先使用 ESLint + typescript-eslint。

### 这一节解决什么问题

解决：

```txt
为什么书里有 tslint.json，但现在项目里不用？
TypeScript type checking 和 linting 有什么区别？
ESLint 能不能替代 tsc？
```

### 技术意义

不要把工具链历史知识当成现代最佳实践。今天的项目通常这样分工：

```txt
tsc:
  checks type correctness.

ESLint:
  checks code quality, style, unsafe patterns, team rules.

Prettier:
  formats code.
```

### 概念解释

Linting 是静态代码分析，但不等于类型检查。它可以使用类型信息，也可以不使用类型信息。

### 语法、运行时、对象模型、类型系统边界

| 工具 | 主要层级 |
|---|---|
| tsc | type system / emit |
| ESLint | static analysis / style rules |
| Prettier | formatting |
| TSLint | legacy linting tool |

### 底层机制

```txt
source file
  -> tsc checks type relationships
  -> ESLint checks configured rules
  -> Prettier formats code
```

### API / 语法规则

现代项目配置通常不是：

```txt
tslint.json
```

而是：

```txt
eslint.config.js
```

或旧格式：

```txt
.eslintrc.*
```

### 固定属性名 / 固定方法名 / 参数签名

示例 eslint.config.js 文件名是现代 ESLint flat config 常见入口。

常见规则名：

```txt
@typescript-eslint/no-floating-promises
@typescript-eslint/no-misused-promises
@typescript-eslint/consistent-type-imports
@typescript-eslint/no-explicit-any
```

### 文件结构

```txt
09-linting-boundary/
  eslintBoundaryDemo.ts
  lintVsTypeCheckNotes.md
```

### 示例代码

eslintBoundaryDemo.ts

```ts
// Goal:
// Compare type checking with linting concerns.

// Expected output:
// lint-boundary-ready

async function saveAuditRecord(): Promise<string> {
  return "lint-boundary-ready";
}

void saveAuditRecord().then((statusLabel) => {
  console.log(statusLabel);
});
```

### 代码逐行解释

```ts
async function saveAuditRecord(): Promise<string> {
```

- 创建 async 函数。
- 返回值类型是 Promise<string>。
- TypeScript 检查函数返回值与注解兼容。

```ts
void saveAuditRecord().then((statusLabel) => {
```

- 调用 async 函数得到 Promise。
- 使用 void 表示有意不等待外层 Promise。
- 一些 lint 规则会关注 floating promise。

```ts
console.log(statusLabel);
```

- Promise fulfilled 后运行回调。
- 输出字符串。

### 运行方式

```bash
npx tsc --noEmit 09-linting-boundary/eslintBoundaryDemo.ts
```

后续如果配置 ESLint，再运行：

```bash
npx eslint 09-linting-boundary/eslintBoundaryDemo.ts
```

### 预期输出

```txt
lint-boundary-ready
```

### 执行过程

| 步骤 | 执行内容 | TypeScript 关注 | ESLint 可能关注 |
|---|---|---|---|
| 1 | 定义 async 函数 | 返回类型是否匹配 | 命名和规则 |
| 2 | 调用 Promise | 类型是否正确 | 是否 floating promise |
| 3 | 使用 void | 类型合法 | 表达有意忽略 |
| 4 | 输出 | 无 | 无 |

### 变量和引用变化

- saveAuditRecord() 每次调用返回一个新的 Promise。
- statusLabel 是 .then() callback 的参数绑定。
- lint 规则不改变运行时引用。

### 为什么得到这个输出

async 函数返回 fulfilled Promise，.then() 回调收到字符串并输出。

### 对比写法

危险写法：

```ts
saveAuditRecord();
```

TypeScript 可能允许它，但 lint 规则可能要求处理 Promise，防止未捕获异步错误。

### 常见错误为什么错

错误类型：工具职责混淆。

错误原因：以为 ESLint 可以替代 tsc --noEmit。ESLint 可以做很多静态检查，但完整项目类型检查仍然应由 tsc 或框架对应 typecheck 命令承担。

### 和实际项目的关系

真实项目 CI 通常拆成：

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

四者不能随便互相替代。

### 和当前学习主线的关系

后面的 React / Next.js 项目一定要配置 typed linting，但现在先分清它和 TypeScript compiler 的边界。

### 最终记忆模型

```txt
tsc checks types.
ESLint checks rules.
Prettier formats code.
```

---

## 10：index.ts 作为入口文件

### 结论

index.ts 通常作为小项目或包的入口文件。它的职责是组合其他模块，而不是堆放所有代码。

### 这一节解决什么问题

解决：

```txt
为什么很多项目都有 index.ts？
入口文件和模块文件是什么关系？
为什么入口文件不应该变成垃圾桶？
```

### 技术意义

从第 2 章开始就建立模块化习惯。后面 React、Node、库发布都依赖入口文件设计。

### 概念解释

入口文件（entry file）是工具链或运行命令最先加载的文件。

```txt
index.ts:
  imports modules.
  calls top-level startup code.
  exports package public API if used as library entry.
```

### 语法、运行时、对象模型、类型系统边界

| 层级 | 本节对应内容 |
|---|---|
| syntax | import / export |
| runtime behavior | 入口模块先被执行 |
| type system | import/export 参与类型检查 |
| toolchain | bundler 或 Node 以入口文件建立依赖图 |

### 底层机制

```txt
index.ts
  -> imports pricing.ts
  -> imports display.ts
  -> calls functions
  -> runtime executes imported modules first when needed
```

### API / 语法规则

```ts
import { name } from "./module.js";
export { name } from "./module.js";
```

在 NodeNext 配置下，TypeScript 源码中经常需要写 .js 扩展名来对应运行时 ESM 路径。

### 固定属性名 / 固定方法名 / 参数签名

本节没有运行时 API，核心语法是：

```txt
import
export
default export
named export
```

### 文件结构

```txt
10-index-entry/
  index.ts
  pricing.ts
  display.ts
```

### 示例代码

pricing.ts

```ts
// Goal:
// Export pricing helpers for the entry file.

export type PriceRecord = {
  basePrice: number;
  discountAmount: number;
};

export function calculateFinalPrice(priceRecord: PriceRecord): number {
  return priceRecord.basePrice - priceRecord.discountAmount;
}
```

display.ts

```ts
// Goal:
// Export display helpers for the entry file.

export function createPriceLabel(finalPrice: number): string {
  return `final-price:${finalPrice}`;
}
```

index.ts

```ts
// Goal:
// Compose imported functions from separate modules.

// Expected output:
// final-price:80

import { createPriceLabel } from "./display.js";
import { calculateFinalPrice } from "./pricing.js";

const finalPrice = calculateFinalPrice({
  basePrice: 100,
  discountAmount: 20,
});

console.log(createPriceLabel(finalPrice));
```

### 代码逐行解释

pricing.ts

```ts
export type PriceRecord = {
```

- 导出类型别名。
- 它可被其他 TS 文件用于类型检查。
- 编译后类型导出会消失。

```ts
export function calculateFinalPrice(priceRecord: PriceRecord): number {
```

- 导出运行时函数。
- 参数类型用于检查调用者传入对象的形状。
- 函数本身会进入 JS 输出。

index.ts

```ts
import { createPriceLabel } from "./display.js";
```

- 导入运行时函数。
- TypeScript 根据模块解析规则找到源文件。
- .js 扩展名用于对齐 ESM 运行时路径。

```ts
const finalPrice = calculateFinalPrice({
```

- 调用导入函数。
- 对象字面量必须满足 PriceRecord 形状。

### 运行方式

tsconfig.emit.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "rootDir": "10-index-entry",
    "outDir": "dist/index-entry"
  },
  "include": ["10-index-entry/**/*.ts"]
}
```

命令：

```bash
npx tsc -p tsconfig.emit.json
node dist/index-entry/index.js
```

### 预期输出

```txt
final-price:80
```

### 执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | 导入模块 | 解析模块路径和类型 | 加载模块 |
| 2 | 调用价格函数 | 检查参数对象 | 执行减法 |
| 3 | 调用展示函数 | 检查参数 number | 拼接字符串 |
| 4 | 输出 | 无 | 打印结果 |

### 变量和引用变化

- calculateFinalPrice 是从模块导入的函数引用。
- finalPrice 保存数字原始值。
- 类型 PriceRecord 不出现在运行时。

### 为什么得到这个输出

100 - 20 得到 80，再传给 createPriceLabel() 生成字符串。

### 对比写法

不推荐：

```ts
function calculateFinalPrice() {}
function createPriceLabel() {}
```

入口文件过大时，模块边界会消失，后面很难测试和复用。

### 常见错误为什么错

错误类型：模块解析错误。

错误原因：在 NodeNext 下路径扩展名和运行时 ESM 规则不匹配。

识别方式：看到 Cannot find module 或路径扩展名相关错误时，先检查 module、moduleResolution 和 import path。

### 和实际项目的关系

Node CLI、库入口、React app entry、server entry 都需要入口文件。入口应该组合模块，不承载所有业务逻辑。

### 和当前学习主线的关系

这节为第 10 章模块、第 12 章构建运行、库发布和 monorepo 打基础。

### 最终记忆模型

```txt
index.ts is an entry point, not a dumping ground.
```

---

## 11：诊断命令：showConfig、listFilesOnly、traceResolution

### 结论

当你不确定 TypeScript 到底读了什么配置、检查了哪些文件、如何解析模块时，不要猜，直接用诊断命令。

### 这一节解决什么问题

解决：

```txt
为什么这个文件被检查了？
为什么那个文件没被检查？
为什么路径别名没生效？
为什么导入的类型找不到？
```

### 技术意义

工程项目里，配置问题比语法问题更难排查。诊断命令是你从“猜配置”进入“看事实”的工具。

### 概念解释

诊断命令（diagnostic command）用于让工具输出它的内部决策过程。

### 语法、运行时、对象模型、类型系统边界

| 命令 | 观察层级 |
|---|---|
| --showConfig | 最终配置 |
| --listFilesOnly | 项目文件集合 |
| --traceResolution | 模块解析过程 |
| --extendedDiagnostics | 编译性能指标 |
| --noErrorTruncation | 完整错误信息 |

### 底层机制

```txt
tsc --showConfig
  -> resolves extends and defaults
  -> prints final config

tsc --listFilesOnly
  -> creates program
  -> prints included files

tsc --traceResolution
  -> logs module lookup steps
```

### API / 语法规则

```bash
npx tsc --showConfig
npx tsc --listFilesOnly
npx tsc --traceResolution --noEmit
```

### 固定属性名 / 固定方法名 / 参数签名

| CLI flag | 类型 | 含义 |
|---|---|---|
| --showConfig | boolean | 打印最终配置 |
| --listFilesOnly | boolean | 只打印文件列表，不继续编译 |
| --traceResolution | boolean | 打印模块解析过程 |
| --project / -p | string | 指定配置文件或配置目录 |
| --noErrorTruncation | boolean | 不截断错误信息 |

### 文件结构

```txt
11-diagnostics-commands/
  moduleResolutionDemo.ts
  diagnosticsCommandNotes.md
```

### 示例代码

moduleResolutionDemo.ts

```ts
// Goal:
// Use diagnostics commands to inspect project configuration.

// Expected output:
// diagnostics-ready

export function createDiagnosticsLabel(): string {
  return "diagnostics-ready";
}

console.log(createDiagnosticsLabel());
```

### 代码逐行解释

```ts
export function createDiagnosticsLabel(): string {
```

- 导出运行时函数。
- 返回类型注解用于类型检查。
- 函数会出现在 JS 输出中。

```ts
return "diagnostics-ready";
```

- 返回字符串。
- TypeScript 检查返回值满足 string。

```ts
console.log(createDiagnosticsLabel());
```

- 调用函数并输出结果。

### 运行方式

```bash
npx tsc --showConfig
npx tsc --listFilesOnly
npx tsc --traceResolution --noEmit
```

### 预期输出

--showConfig 输出完整 JSON 配置。

--listFilesOnly 输出 TypeScript 实际纳入项目的文件列表。

--traceResolution 输出模块解析过程，内容较长。

### 执行过程

| 步骤 | 执行内容 | 工具链发生什么 | 当前关键结果 |
|---|---|---|---|
| 1 | 运行 --showConfig | 合并配置 | 打印最终配置 |
| 2 | 运行 --listFilesOnly | 创建 Program 文件集 | 打印文件 |
| 3 | 运行 --traceResolution | 记录模块查找步骤 | 打印解析日志 |

### 变量和引用变化

本节重点不是运行时变量，而是 TypeScript Program 的配置和文件图。

### 为什么得到这个输出

因为这些命令让 tsc 把内部配置和解析结果显示出来。

### 对比写法

低效方式：

```txt
Guess why the file is included.
```

正确方式：

```bash
npx tsc --listFilesOnly
```

### 常见错误为什么错

错误类型：排查方式错误。

原因：只看 tsconfig.json 源文件，不看 extends 后的最终配置，容易漏掉继承配置和默认行为。

识别方式：如果你说“我明明配置了”，下一步就运行 --showConfig。

### 和实际项目的关系

monorepo、Next.js、Vite、库构建、NodeNext 模块解析都经常需要这些命令。

### 和当前学习主线的关系

这节为 type-system-performance、monorepo-typescript、library publishing 做工具准备。

### 最终记忆模型

```txt
Do not guess TypeScript configuration.
Ask tsc to print what it sees.
```

---

## 10. 本章 API / 语法完整索引

### TypeScript 基础语法

| 语法 | 所属层级 | 作用 | 是否进入 JS 输出 |
|---|---|---|---|
| `: Type` | type system syntax | 类型注解 | 否 |
| `type Name = ...` | type system syntax | 类型别名 | 否 |
| `interface Name {}` | type system syntax | 接口声明 | 否 |
| `as Type` | type system syntax | 类型断言 | 否 |
| `satisfies Type` | type system syntax | 检查表达式满足类型并保留推断 | 否 |
| `typeof value` in type position | type system syntax | 从值取得静态类型 | 否 |
| `import type` | module / type system | 只导入类型 | 否 |
| `export type` | module / type system | 只导出类型 | 否 |

### tsc CLI

| 命令 / 参数 | 参数类型 | 返回 / 输出 | 是否修改文件 | 用途 |
|---|---|---|---|---|
| `tsc` | none | diagnostics and optional files | 可能 | 编译最近项目 |
| `tsc file.ts` | file path | .js output by default | 可能 | 编译指定文件，注意配置边界 |
| `tsc -p tsconfig.json` | config path | diagnostics and optional files | 可能 | 按指定配置编译 |
| `tsc --noEmit` | boolean flag | diagnostics only | 否 | 只做类型检查 |
| `tsc --init` | boolean flag | tsconfig.json | 是 | 创建配置文件 |
| `tsc --showConfig` | boolean flag | final config JSON | 否 | 查看最终配置 |
| `tsc --listFilesOnly` | boolean flag | file list | 否 | 查看项目文件集合 |
| `tsc --traceResolution` | boolean flag | resolution log | 否 | 查看模块解析过程 |
| `tsc --version` | boolean flag | version string | 否 | 查看 TS 版本 |

### tsconfig.json 顶层字段

| 字段 | 类型 | 含义 |
|---|---|---|
| compilerOptions | object | 编译选项 |
| include | string array | 包含文件 |
| exclude | string array | 排除文件 |
| files | string array | 精确文件列表 |
| extends | string | 继承配置 |
| references | object array | 项目引用 |

### 常用 compilerOptions

| 字段 | 类型 | 作用 |
|---|---|---|
| target | string | 输出 JS 语法目标 |
| lib | string array | 类型系统可见的标准库声明 |
| module | string | 模块输出 / 检查方式 |
| moduleResolution | string | 模块解析策略 |
| strict | boolean | 严格类型检查总开关 |
| noEmit | boolean | 不输出文件 |
| outDir | string | 输出目录 |
| rootDir | string | 源码根目录 |
| declaration | boolean | 输出 .d.ts |
| sourceMap | boolean | 输出 source map |
| types | string array | 指定进入全局作用域的 @types 包 |
| skipLibCheck | boolean | 跳过声明文件类型检查 |
| forceConsistentCasingInFileNames | boolean | 强制文件名大小写一致 |

---

## 11. 本章常见错误总表

| 错误 | 错误类型 | 原因 | 正确判断方式 |
|---|---|---|---|
| 把 interface 当运行时值打印 | 类型错误 / 运行时错误 | interface 编译后被擦除 | 类型名不能放在值位置 |
| 以为类型注解会转换值 | 逻辑错误 | 类型注解只检查，不转换 | 需要显式调用 Number()、validator 等 |
| tsc index.ts 没按项目配置检查 | 工具链错误 | 指定 input files 时项目配置行为不同 | 用 tsc -p tsconfig.json |
| document 找不到 | 类型环境配置错误 | lib 没包含 DOM | 检查 lib |
| process 找不到 | 类型环境配置错误 | 没安装或没引入 Node types | 安装 @types/node 并检查 types |
| 没有生成 JS | 配置错误 | noEmit: true | 检查 noEmit |
| 输出目录混进类型检查 | 项目边界错误 | dist 没排除 | exclude 加入 dist |
| 编辑器和命令行报错不同 | 工具版本错误 | TS version 或 project root 不一致 | 对比 editor TS version 和 npx tsc --version |
| 把 ESLint 当成 tsc | 工具职责混淆 | lint 不等于完整类型检查 | CI 同时跑 typecheck 和 lint |
| 关闭 strict 逃避错误 | 配置策略错误 | 隐藏不确定性 | 优先修复边界，而不是关掉检查 |

### 常见错误：把类型当运行时值

错误代码：

```ts
type OrderRecord = {
  id: string;
};

// @ts-expect-error
console.log(OrderRecord);
```

错误类型：TypeScript 类型错误。

违反规则：OrderRecord 只存在于类型命名空间，不存在于运行时值命名空间。

正确写法：

```ts
const orderRecord = {
  id: "A-100",
};

console.log(orderRecord);
```

识别方式：如果名字只由 type / interface 声明，就不能放进 console.log()、new、instanceof、函数调用等值位置。

### 常见错误：以为 target 会自动添加 polyfill

错误理解：

```txt
target ES5 means every modern API will work in old browsers.
```

错误类型：运行环境误解。

原因：target 主要影响输出语法，不保证所有运行时 API 都存在。运行时 API 需要对应环境或 polyfill。

正确判断：

```txt
target:
  emitted syntax level.

lib:
  compile-time type declarations.

polyfill:
  runtime implementation.
```

---

## 12. 最终小项目

### 项目名称

```txt
TypeScript Project Bootstrap Inspector
```

### 项目目标

创建一个最小 TypeScript 项目，验证：

```txt
1. tsconfig defines project boundary.
2. strict configuration catches unsafe code.
3. type-only syntax disappears after emit.
4. index.ts composes modules.
5. tsc diagnostics commands reveal configuration truth.
```

### 文件结构

```txt
12-mini-project/
  package.json
  tsconfig.json
  src/index.ts
  src/catalog.ts
  src/pricing.ts
  src/report.ts
  src/config.ts
  README.md
```

### package.json

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc",
    "show-config": "tsc --showConfig",
    "list-files": "tsc --listFilesOnly"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "rootDir": "src",
    "outDir": "dist",
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

### src/catalog.ts

```ts
// Goal:
// Define catalog domain types and values.

export type CatalogItemRecord = {
  sku: string;
  title: string;
  basePrice: number;
};

export const catalogItems: CatalogItemRecord[] = [
  { sku: "KB-001", title: "Keyboard", basePrice: 100 },
  { sku: "MS-002", title: "Mouse", basePrice: 60 },
];
```

### src/pricing.ts

```ts
// Goal:
// Calculate final prices from catalog items.

import type { CatalogItemRecord } from "./catalog.js";

export function calculateDiscountedPrice(itemRecord: CatalogItemRecord, discountAmount: number): number {
  return itemRecord.basePrice - discountAmount;
}
```

### src/report.ts

```ts
// Goal:
// Format report lines for catalog items.

import type { CatalogItemRecord } from "./catalog.js";
import { calculateDiscountedPrice } from "./pricing.js";

export function createCatalogReportLine(itemRecord: CatalogItemRecord): string {
  const finalPrice = calculateDiscountedPrice(itemRecord, 10);
  return `${itemRecord.sku}:${itemRecord.title}:${finalPrice}`;
}
```

### src/config.ts

```ts
// Goal:
// Keep project runtime configuration values.

export const reportConfig = {
  title: "Catalog Report",
  currencyCode: "USD",
} as const;
```

### src/index.ts

```ts
// Goal:
// Compose the TypeScript project entry point.

// Expected output:
// Catalog Report
// KB-001:Keyboard:90
// MS-002:Mouse:50

import { catalogItems } from "./catalog.js";
import { reportConfig } from "./config.js";
import { createCatalogReportLine } from "./report.js";

console.log(reportConfig.title);

for (const itemRecord of catalogItems) {
  console.log(createCatalogReportLine(itemRecord));
}
```

### 运行方式

```bash
cd 12-mini-project
npm install
npm run typecheck
npm run build
node dist/index.js
npm run show-config
npm run list-files
```

### 预期输出

```txt
Catalog Report
KB-001:Keyboard:90
MS-002:Mouse:50
```

### 项目执行过程

| 步骤 | 执行内容 | 编译期发生什么 | 运行时发生什么 |
|---|---|---|---|
| 1 | catalog.ts 导出类型和值 | 检查数组元素形状 | 创建数组 |
| 2 | pricing.ts 导入类型 | 检查函数参数 | 类型导入被擦除 |
| 3 | report.ts 组合函数 | 检查跨模块调用 | 拼接字符串 |
| 4 | index.ts 遍历数组 | 检查 item 类型 | 输出报告 |
| 5 | show-config | 打印最终配置 | 不运行项目 |
| 6 | list-files | 打印文件集合 | 不运行项目 |

### 最终验收标准

你完成小项目后，必须能解释：

```txt
1. 哪些代码会进入 dist。
2. 哪些类型会被擦除。
3. 为什么 import type 不产生运行时导入。
4. 为什么 index.ts 是入口。
5. 为什么 typecheck 可以不输出 JS。
6. 为什么 list-files 可以验证 include 是否正确。
```

---

## 13. 额外 cheatsheet

本章建议后续生成独立速查表：

```txt
typescript/chapter-02-typescript-overview/
  typescript-chapter-02-overview-cheatsheet-zh-v1.md
```

速查表应该覆盖：

```txt
1. tsc CLI 命令速查。
2. tsconfig 顶层字段速查。
3. compilerOptions 分类速查。
4. type checking vs emit vs runtime 对照表。
5. target / lib / module / moduleResolution 对照表。
6. noEmit / outDir / rootDir 对照表。
7. strict 相关配置速查。
8. editor diagnostic vs tsc diagnostic vs ESLint warning 对照表。
9. 常见错误定位决策树。
```

这次文件只生成学习指导文件，不额外生成独立 cheatsheet 文件。

---

## 14. 最终文件清单

本章完成后，章节目录应包含：

```txt
typescript/chapter-02-typescript-overview/
  typescript-chapter-02-overview-learning-guide-zh-v1.md

  package.json
  tsconfig.json
  tsconfig.strict.json
  tsconfig.emit.json
  tsconfig.browser.json
  tsconfig.node.json

  00-ts-vs-js/
    safeNumericConversion.ts
    unsafeNumericOperation.ts

  01-compiler-typechecker-emit/
    productSummary.ts
    productSummaryMistake.ts

  02-type-erasure/
    typeOnlyModel.ts
    interfaceRuntimeMistake.ts

  03-inference-annotations-errors/
    inferenceDemo.ts
    annotationBoundary.ts
    excessPropertyMistake.ts

  04-tsconfig-project-boundary/
    includedSource.ts
    excludedDraft.ts
    configBoundaryNotes.md

  05-emit-noemit-outdir/
    emitSource.ts
    emitOutputNotes.md

  06-target-lib-module/
    browserGlobalDemo.ts
    nodeGlobalDemo.ts
    moduleOutputDemo.ts

  07-strict-configuration/
    implicitAnyMistake.ts
    nullCheckMistake.ts
    catchUnknownDemo.ts

  08-editor-language-service/
    editorHoverDemo.ts
    renameSymbolDemo.ts
    diagnosticDemo.ts

  09-linting-boundary/
    eslintBoundaryDemo.ts
    lintVsTypeCheckNotes.md

  10-index-entry/
    index.ts
    pricing.ts
    display.ts

  11-diagnostics-commands/
    moduleResolutionDemo.ts
    diagnosticsCommandNotes.md

  12-mini-project/
    package.json
    tsconfig.json
    src/index.ts
    src/catalog.ts
    src/pricing.ts
    src/report.ts
    src/config.ts
    README.md
```

---

## 15. 最终学习笔记转换要求

每一节整理成正式笔记时，用这个结构：

```txt
Conclusion
Technical meaning
Syntax boundary
Type system behavior
Compiler behavior
Runtime behavior
Configuration impact
Code example
Line-by-line explanation
Common mistakes
Project usage
Memory model
```

### 最终笔记必须单独整理的对照表

```txt
TypeScript vs JavaScript
type checking vs runtime validation
type annotation vs runtime conversion
type alias/interface vs runtime value
tsc vs bundler
tsc diagnostics vs editor diagnostics
tsc vs ESLint vs Prettier
target vs lib vs module vs moduleResolution
noEmit vs emit
strict vs use strict
```

### 不能写成这样

```txt
TypeScript 是 JavaScript 的超集。
tsconfig 是配置文件。
strict 可以让类型更严格。
```

这种写法太浅，不能作为正式学习笔记。

### 应该写成这样

```txt
TypeScript adds compile-time type analysis on top of JavaScript.
TypeScript types are erased before runtime.
The emitted JavaScript is what Node or browsers execute.
Therefore, TypeScript can prevent many wrong calls before runtime, but it cannot validate unknown external data unless runtime validation code exists.
```

---

## 16. 本章最终要能回答的问题

学完本章，你必须能回答：

1. TypeScript 和 JavaScript 的关系是什么？
2. TypeScript 是运行时语言吗？
3. tsc 做了哪几件事？
4. 类型检查和 emit 有什么区别？
5. noEmit 是关闭编译器，还是只关闭输出？
6. 类型注解会不会进入输出 JS？
7. interface 为什么不能被 console.log()？
8. type 和运行时变量有什么区别？
9. 类型推断解决什么问题？
10. 什么时候应该写类型注解？
11. tsconfig.json 为什么能定义项目根？
12. include、exclude、files 有什么区别？
13. 为什么 tsc index.ts 可能不按项目配置工作？
14. target 控制什么？
15. lib 控制什么？
16. module 和 moduleResolution 各自控制什么？
17. 为什么浏览器代码需要 DOM lib？
18. 为什么 Node 代码需要 @types/node？
19. strict 和 JavaScript use strict 有什么区别？
20. 为什么新项目应该默认开启 strict？
21. 编辑器红线和 tsc 报错有什么关系？
22. 为什么 TSLint 不再是现代默认选择？
23. ESLint 能不能替代 tsc --noEmit？
24. index.ts 作为入口文件应该承担什么职责？
25. 如何用 --showConfig 排查配置问题？
26. 如何用 --listFilesOnly 排查文件包含问题？
27. 如何用 --traceResolution 排查模块解析问题？

---

## 17. 本章最终记忆模型

### 一句话模型

```txt
TypeScript is JavaScript plus a compile-time type system and project-aware tooling.
```

### 分层模型

```txt
TypeScript source layer:
  .ts and .tsx files contain JavaScript plus type syntax.

Compiler layer:
  tsc reads tsconfig, builds a program, checks types, and optionally emits files.

Type system layer:
  types describe values, but do not exist as runtime values.

Runtime layer:
  Node or browsers execute emitted JavaScript.

Tooling layer:
  editor language service, tsc, ESLint, Prettier, bundler, and test runner each have different responsibilities.
```

### 最重要的工程判断

```txt
If it is a type, it disappears before runtime.
If it is a value, JavaScript can execute it.
If it is a config option, it changes how TypeScript sees the project.
If it is an external input, TypeScript cannot trust it without runtime validation.
```

---

## 18. 官方文档阅读清单

按这个顺序读，不要一次性打开全部文档：

1. [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
2. [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
3. [What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
4. [tsc CLI Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
5. [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
6. [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
7. [Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
8. [typescript-eslint Getting Started](https://typescript-eslint.io/getting-started/)
9. [ESLint Configuration Files](https://eslint.org/docs/latest/use/configure/configuration-files)

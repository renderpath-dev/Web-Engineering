# TypeScript 进阶专题“Compiler API 入门”学习指导文件 v1

## 目录

- [0. 文件定位](#0-文件定位)
- [1. 本章学习目标](#1-本章学习目标)
- [2. 本章学习顺序](#2-本章学习顺序)
- [3. 本章核心术语表](#3-本章核心术语表)
- [4. 本章底层模型](#4-本章底层模型)
- [5. 推荐目录结构](#5-推荐目录结构)
- [6. 运行方式](#6-运行方式)
- [7. 分节训练内容](#7-分节训练内容)
   - [7.1 00：Compiler API 到底在解决什么](#71-00compiler-api-到底在解决什么)
   - [7.2 01：SourceFile 和源码解析](#72-01sourcefile-和源码解析)
   - [7.3 02：AST 遍历](#73-02ast-遍历)
   - [7.4 03：SyntaxKind 和类型防护函数](#74-03syntaxkind-和类型防护函数)
   - [7.5 04：节点位置、文本范围和源码片段](#75-04节点位置文本范围和源码片段)
   - [7.6 05：Printer 和节点重新打印](#76-05printer-和节点重新打印)
   - [7.7 06：Program 和 CompilerHost](#77-06program-和-compilerhost)
   - [7.8 07：Diagnostics 诊断信息](#78-07diagnostics-诊断信息)
   - [7.9 08：TypeChecker、Symbol 和导出分析](#79-08typecheckersymbol-和导出分析)
   - [7.10 09：Type 对象和 typeToString](#710-09type-对象和-typetostring)
   - [7.11 10：emit 和 transpileModule 的边界](#711-10emit-和-transpilemodule-的边界)
   - [7.12 11：Transformer API 入门](#712-11transformer-api-入门)
   - [7.13 12：LanguageService 入门](#713-12languageservice-入门)
   - [7.14 13：Watch Program 入门](#714-13watch-program-入门)
   - [7.15 14：模块解析边界](#715-14模块解析边界)
- [8. 本章 API / 语法完整索引](#8-本章-api-语法完整索引)
- [9. 本章常见错误总表](#9-本章常见错误总表)
- [10. 最终小项目：Public API Analyzer](#10-最终小项目public-api-analyzer)
- [11. 额外 cheatsheet](#11-额外-cheatsheet)
- [12. 最终文件清单](#12-最终文件清单)
- [13. 最终学习笔记转换要求](#13-最终学习笔记转换要求)
- [14. 本章最终记忆模型](#14-本章最终记忆模型)
- [15. 官方文档阅读清单](#15-官方文档阅读清单)
- [16. 生成前自检清单](#16-生成前自检清单)
---

## 0. 文件定位

这是一份 TypeScript 进阶专题 `typescript/compiler-api-intro/` 的学习指导文件，不是最终学习笔记，也不是 API 速查表。

你要按照这份文件创建目录、写 `.ts` 文件、运行 `tsc` 和 Node 脚本、观察抽象语法树（abstract syntax tree, AST）、诊断信息（diagnostic）、类型检查器（type checker）、打印器（printer）、转换器（transformer）和语言服务（language service）的行为，最后把练习结果整理成正式学习笔记。

本专题不是《TypeScript Programming》正文里的独立章节，而是进阶补充：书上主线已经覆盖编译器、类型系统、模块、JS 互操作、构建运行和附录工具类型；本专题把这些能力推进到“用 TypeScript 编译器写工程工具”。

> 本次已按你的补充要求：只保留原文件名，新增目录导航栏，并额外补充独立 cheatsheet 文件。

---

## 1. 本章学习目标

学完本专题后，你要能做到：

1. 解释 TypeScript 编译器 API（Compiler API）解决什么工程问题。
2. 区分语法树（syntax tree）、符号（symbol）、类型（type）、诊断信息（diagnostic）、发射结果（emit result）。
3. 使用 `ts.createSourceFile()` 把源码字符串解析成 `SourceFile`。
4. 使用 `ts.forEachChild()` 递归遍历 AST。
5. 使用 `ts.SyntaxKind` 和 `ts.isXxx()` 类型防护函数判断节点种类。
6. 使用 `ts.createPrinter()` 打印 AST 节点。
7. 使用 `ts.createProgram()` 建立项目级编译上下文。
8. 使用 `program.getTypeChecker()` 读取符号和类型信息。
9. 使用 `ts.getPreEmitDiagnostics()` 和 `program.emit()` 收集错误。
10. 使用 `ts.transpileModule()` 理解“只转译，不完整类型检查”的边界。
11. 使用 `ts.transform()` 和 `ts.factory` 做一个安全的小型 AST 转换。
12. 初步理解 `LanguageService`、`ScriptSnapshot`、watch program 的定位。
13. 写一个最终小项目：扫描一个小型 TS API 模块，输出导出函数、参数、返回类型、`any` 风险和缺失返回类型的报告。

---

## 2. 本章学习顺序

```txt
compiler problem model
  -> source text and SourceFile
  -> AST traversal
  -> SyntaxKind and node type guards
  -> node positions and text ranges
  -> printer and node reprint
  -> Program and CompilerHost
  -> diagnostics
  -> TypeChecker and symbols
  -> Type object and typeToString
  -> emit and transpileModule
  -> transformer API
  -> LanguageService overview
  -> watch program overview
  -> module resolution boundary
  -> final mini project
```

不要一上来写 transformer。先看懂 AST，再看懂 Program，再看懂 TypeChecker。否则你会把“语法层分析”和“类型层分析”混在一起。

---

## 3. 本章核心术语表

| 中文术语（English term） | 技术含义 |
|---|---|
| 编译器 API（Compiler API） | TypeScript 暴露给 Node 程序调用的一组 API，用来解析、检查、转换和发射 TS / JS 代码。 |
| 源文件（SourceFile） | TypeScript 对一个源码文件的 AST 根节点，保存源码文本、文件名、脚本目标和子节点。 |
| 抽象语法树（abstract syntax tree, AST） | 把源码解析成节点树后的结构，每个节点代表语法结构。 |
| 节点（Node） | AST 中的基本单位，例如函数声明、变量声明、调用表达式、标识符。 |
| 节点种类（SyntaxKind） | TypeScript 用数字枚举表示节点类型，例如 `FunctionDeclaration`。 |
| 类型防护函数（type guard function） | `ts.isFunctionDeclaration(node)` 这种函数，运行时判断节点类型，同时在 TS 类型系统中缩小类型。 |
| 程序（Program） | TypeScript 对整个项目或一组根文件的编译上下文。 |
| 编译器宿主（CompilerHost） | 编译器访问文件系统、读取文件、写入文件、解析路径的抽象层。 |
| 类型检查器（TypeChecker） | 负责从语法节点、符号和声明中计算类型信息的对象。 |
| 符号（Symbol） | 编译器绑定阶段建立的名字实体，例如变量名、函数名、导出名。 |
| 类型（Type） | 类型检查器计算出来的静态类型对象，不是运行时值。 |
| 诊断信息（Diagnostic） | 编译器产生的错误、警告或提示，包含 code、category、messageText、file、start 等信息。 |
| 发射（emit） | 把 TypeScript 输出为 JavaScript、声明文件或 source map 的过程。 |
| 转译（transpile） | 只做源码到输出的语法级转换，通常不做完整项目级类型检查。 |
| 转换器（transformer） | 在发射前或发射过程中修改 AST 的函数。 |
| 打印器（printer） | 把 AST 节点重新打印成源代码文本的工具。 |
| 语言服务（LanguageService） | 给编辑器和 IDE 使用的长生命周期编译服务，支持补全、诊断、跳转、快速修复等能力。 |
| 脚本快照（ScriptSnapshot） | 语言服务用于表示某一时刻文件文本内容的对象。 |
| 观察程序（watch program） | TypeScript 用于监听文件变化并增量构建的编译程序。 |

---

## 4. 本章底层模型

### 4.1 结论

Compiler API 的底层模型是：

```txt
source text
  -> parser
  -> SourceFile AST
  -> binder
  -> symbols
  -> checker
  -> types and diagnostics
  -> transformer
  -> emitter
  -> JavaScript output or declaration output
```

你要始终区分三层：

| 层级 | 代表 API | 能看到什么 | 不能做什么 |
|---|---|---|---|
| 语法层（syntax layer） | `createSourceFile`、`forEachChild`、`SyntaxKind` | 节点结构、文本范围、语法形状 | 不能知道表达式最终静态类型 |
| 语义层（semantic layer） | `createProgram`、`getTypeChecker`、`getTypeAtLocation` | 符号、类型、导入导出、类型错误 | 不能改变运行时代码 |
| 发射层（emit layer） | `emit`、`transpileModule`、`transform`、`createPrinter` | 输出 JS、`.d.ts`、source map、转换后的文本 | 不能保证运行时数据安全 |

### 4.2 技术意义

以前你写代码时，TypeScript 编译器像一个“黑盒检查器”。本专题把它拆开：解析器（parser）把文本变成树；绑定器（binder）把名字连接成符号；检查器（checker）把符号、声明和控制流分析成类型；发射器（emitter）输出 JavaScript；语言服务（language service）把这些能力变成 IDE 功能。

### 4.3 和实际项目的关系

| 场景 | 用到的能力 |
|---|---|
| 代码迁移脚本 | 解析 AST、查找旧 API、自动生成替换建议 |
| API 文档生成 | 读取导出函数、类型别名、接口、JSDoc |
| SDK 发布检查 | 检查 public API 是否有 `any`、缺失返回类型、破坏性变更 |
| 组件库约束 | 检查导出组件 props、默认导出、命名规范 |
| 大型重构 | 定位特定语法节点并安全修改 |
| IDE 插件 | 使用语言服务读取补全、跳转、诊断 |
| 构建工具 | 调用 program、emit、watch program |

---

## 5. 推荐目录结构

```txt
typescript/compiler-api-intro/
  typescript-compiler-api-intro-learning-guide-zh-v1.md
  typescript-compiler-api-intro-cheatsheet-zh-v1.md

  package.json
  tsconfig.json

  00-compiler-api-problem-model/
    compilerApiOverview.ts
    compilerPipelineNotes.md

  01-sourcefile-parse/
    parseSourceText.ts
    parseScriptKind.ts
    sourceFileMistake.ts

  02-ast-traversal/
    traverseTopLevelNodes.ts
    recursiveTraversal.ts
    traversalMistake.ts

  03-syntaxkind-type-guards/
    inspectSyntaxKind.ts
    functionDeclarationGuard.ts
    unsafeCastMistake.ts

  04-node-position-text/
    nodePositionPrinter.ts
    nodeTextRange.ts
    positionMistake.ts

  05-printer-reprint/
    printSelectedNode.ts
    printFunctionSignatures.ts
    printerMistake.ts

  06-program-compilerhost/
    createProgramFromFiles.ts
    customCompilerHostWriteFile.ts
    missingFileMistake.ts

  07-diagnostics/
    collectDiagnostics.ts
    formatDiagnostics.ts
    diagnosticMistake.ts

  08-typechecker-symbols/
    inspectExportedSymbols.ts
    inspectIdentifierSymbol.ts
    symbolMistake.ts

  09-typechecker-types/
    inspectFunctionTypes.ts
    inspectVariableTypes.ts
    typeMistake.ts

  10-emit-transpile/
    emitProject.ts
    transpileSingleFile.ts
    transpileMistake.ts

  11-transformer-api/
    renameConsoleLogTransformer.ts
    addFunctionPrefixComment.ts
    transformerMistake.ts

  12-language-service-overview/
    simpleLanguageService.ts
    completionAtPosition.ts
    languageServiceNotes.md

  13-watch-program-overview/
    watchProgramSkeleton.ts
    watchProgramNotes.md

  14-module-resolution-boundary/
    traceResolvedModule.ts
    moduleResolutionHostNotes.md

  15-mini-project/
    samplePublicApi.ts
    analyzePublicApi.ts
    analyzePublicApiMistakes.ts
    publicApiReportChecklist.md
```

---

## 6. 运行方式

### 6.1 package.json

```json
{
  "name": "typescript-compiler-api-intro",
  "private": true,
  "type": "module",
  "scripts": {
    "check": "tsc --noEmit",
    "build": "tsc",
    "run:parse": "node dist/01-sourcefile-parse/parseSourceText.js",
    "run:traverse": "node dist/02-ast-traversal/recursiveTraversal.js",
    "run:diagnostics": "node dist/07-diagnostics/collectDiagnostics.js",
    "run:types": "node dist/09-typechecker-types/inspectFunctionTypes.js",
    "run:emit": "node dist/10-emit-transpile/emitProject.js",
    "run:mini": "node dist/15-mini-project/analyzePublicApi.js"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

### 6.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "rootDir": ".",
    "outDir": "dist"
  },
  "include": ["**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

### 6.3 类型检查和运行清单

```bash
npm install
npm run check
npm run build
npm run run:parse
npm run run:traverse
npm run run:diagnostics
npm run run:types
npm run run:emit
npm run run:mini
```

---

## 7. 分节训练内容

## 7.1 00：Compiler API 到底在解决什么

### 结论

Compiler API 让你把 TypeScript 编译器当作一个可调用的库，而不是只能通过 `tsc` 命令使用。

### 技术意义

它解决的是“用程序理解程序”的问题。你可以写一个 Node 脚本，让它读取 TypeScript 文件，找出导出函数、参数类型、错误诊断、依赖关系和输出内容。

### 底层机制

`tsc` 本身也建立在这些内部能力之上。你调用 Compiler API 时，不是让 TypeScript 执行你的业务代码，而是让 TypeScript 分析你的源码文本。

### API / 语法规范

| API | 所属对象 | 签名简化版 | 返回值 | 作用 |
|---|---|---|---|---|
| `ts.createSourceFile` | `typescript` 模块 | `createSourceFile(fileName, sourceText, languageVersion, setParentNodes?, scriptKind?)` | `SourceFile` | 把文本解析成 AST |
| `ts.createProgram` | `typescript` 模块 | `createProgram(rootNames, options, host?)` | `Program` | 创建项目级编译上下文 |
| `program.getTypeChecker` | `Program` | `getTypeChecker()` | `TypeChecker` | 获取类型检查器 |
| `program.emit` | `Program` | `emit()` | `EmitResult` | 输出 JS / 声明文件 |
| `ts.getPreEmitDiagnostics` | `typescript` 模块 | `getPreEmitDiagnostics(program)` | `Diagnostic[]` | 获取发射前诊断 |
| `ts.transpileModule` | `typescript` 模块 | `transpileModule(input, transpileOptions)` | `TranspileOutput` | 单文件转译 |
| `ts.transform` | `typescript` 模块 | `transform(source, transformers, compilerOptions?)` | `TransformationResult<T>` | 转换 AST |

### 文件结构

```txt
00-compiler-api-problem-model/
  compilerApiOverview.ts
  compilerPipelineNotes.md
```

### 示例代码

`compilerApiOverview.ts`

```ts
// Goal:
// Show the main Compiler API layers without doing deep analysis.

// Expected output:
// Print a short compiler pipeline description.

import ts from "typescript";

const pipelineSteps = [
  "source text",
  "SourceFile AST",
  "Program",
  "TypeChecker",
  "diagnostics",
  "emit output",
];

for (const stepName of pipelineSteps) {
  console.log(stepName);
}

console.log(typeof ts.createSourceFile);
console.log(typeof ts.createProgram);
```


### 补齐文件代码

`compilerPipelineNotes.md`

```md
# Compiler Pipeline Notes

## Core pipeline

```txt
source text
  -> parser
  -> SourceFile
  -> binder
  -> symbols
  -> checker
  -> types and diagnostics
  -> transformer
  -> emitter
  -> output files
```

## Layer boundaries

- SourceFile answers syntax questions.
- Program answers project context questions.
- TypeChecker answers semantic type questions.
- Printer and emit answer output questions.

## Review question

Which API do you need when a tool must know whether an exported function returns `any`?
```

### 运行方式

```bash
npm run build
node dist/00-compiler-api-problem-model/compilerApiOverview.js
```

### 预期输出

```txt
source text
SourceFile AST
Program
TypeChecker
diagnostics
emit output
function
function
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `import ts from "typescript"` | 导入 TypeScript 编译器库的运行时对象。 |
| 2 | `pipelineSteps` | 保存你要记住的编译流程名称。 |
| 3 | `for...of` | 逐个打印流程节点。 |
| 4 | `typeof ts.createSourceFile` | 验证该 API 是运行时函数，不是类型。 |
| 5 | `typeof ts.createProgram` | 验证 program 创建能力来自 TypeScript 包。 |

### 和实际项目的关系

以后你写迁移工具、代码检查器、API 文档生成器时，第一步不是正则匹配文本，而是使用编译器把代码变成 AST 或 Program。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 用正则解析所有 TS 代码 | TS 语法有嵌套、泛型、重载、装饰器、JSX，正则不可靠 | 用 AST 表示语法结构 |
| 以为 Compiler API 会执行代码 | Compiler API 分析源码，不执行业务逻辑 | 它处理源文本和类型信息 |
| 一开始就写 transformer | transformer 是后期能力 | 先学 SourceFile、Program、TypeChecker |

### 最终记忆模型

```txt
Compiler API is code about code.
It parses source text, builds program context, checks types, reports diagnostics, and emits output.
```

---

## 7.2 01：SourceFile 和源码解析

### 结论

`SourceFile` 是一个文件级 AST 根节点。你可以不用创建完整 Program，只用 `ts.createSourceFile()` 解析一段源码文本。

### 技术意义

SourceFile 适合做轻量级语法分析，比如统计函数数量、检查命名、提取顶层声明。

### 底层机制

`createSourceFile()` 只做解析。它能知道“这里是函数声明”，但不知道某个表达式的完整类型，也不知道项目里其他文件的导入导出语义。

### API / 语法规范

| 项目 | 内容 |
|---|---|
| API 名称 | `ts.createSourceFile()` |
| 所属对象 | `typescript` 模块 |
| 参数 1 | `fileName: string`，虚拟或真实文件名 |
| 参数 2 | `sourceText: string`，源码文本 |
| 参数 3 | `languageVersion: ts.ScriptTarget`，脚本目标 |
| 参数 4 | `setParentNodes?: boolean`，是否设置父节点引用 |
| 参数 5 | `scriptKind?: ts.ScriptKind`，脚本类型，例如 TS、TSX、JS、JSX |
| 返回值 | `ts.SourceFile` |
| 是否读取文件系统 | 否 |
| 是否完整类型检查 | 否 |

### 固定属性名 / 固定方法名 / 参数签名

| 名称 | 所属对象 | 含义 |
|---|---|---|
| `sourceFile.fileName` | `SourceFile` | 文件名 |
| `sourceFile.text` | `SourceFile` | 完整源码文本 |
| `sourceFile.statements` | `SourceFile` | 顶层语句数组 |
| `sourceFile.getLineAndCharacterOfPosition(pos)` | `SourceFile` | 把字符位置转换为行列 |
| `sourceFile.getText()` | `Node` / `SourceFile` | 获取节点对应文本 |

### 文件结构

```txt
01-sourcefile-parse/
  parseSourceText.ts
  parseScriptKind.ts
  sourceFileMistake.ts
```

### 示例代码

`parseSourceText.ts`

```ts
// Goal:
// Parse TypeScript source text into a SourceFile.

// Expected output:
// Print the source file name and top-level statement count.

import ts from "typescript";

const sourceText = `
export function formatTitle(titleText: string): string {
  return titleText.trim().toUpperCase();
}

export const itemCount = 3;
`;

const sourceFile = ts.createSourceFile(
  "samplePublicApi.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

console.log(sourceFile.fileName);
console.log(sourceFile.statements.length);
console.log(ts.SyntaxKind[sourceFile.kind]);
```

`sourceFileMistake.ts`

```ts
// Goal:
// Show that SourceFile parsing alone does not perform semantic type checking.

// Expected output:
// Print the statement count even though the source has a type error.

import ts from "typescript";

const sourceText = `
const priceText: string = 42;
`;

const sourceFile = ts.createSourceFile(
  "brokenTypes.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

console.log(sourceFile.statements.length);
console.log("parsed");
```


### 补齐文件代码

`parseScriptKind.ts`

```ts
// Goal:
// Parse TSX-like source text by explicitly passing ScriptKind.TSX.

// Expected output:
// Print the file kind and statement count.

import ts from "typescript";

const sourceText = `
export function ProductTitle() {
  return <h1>Keyboard</h1>;
}
`;

const sourceFile = ts.createSourceFile(
  "ProductTitle.tsx",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TSX,
);

console.log(sourceFile.fileName);
console.log(sourceFile.statements.length);
console.log(ts.ScriptKind[ts.ScriptKind.TSX]);
```

### 运行方式

```bash
npm run build
node dist/01-sourcefile-parse/parseSourceText.js
node dist/01-sourcefile-parse/sourceFileMistake.js
```

### 预期输出

```txt
samplePublicApi.ts
2
SourceFile
```

第二个文件会输出：

```txt
1
parsed
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `sourceText` | 保存一段 TypeScript 源码字符串。 |
| 2 | `ts.createSourceFile(...)` | 解析源码文本并生成 `SourceFile` 根节点。 |
| 3 | `ts.ScriptTarget.ES2022` | 告诉解析器按 ES2022 目标理解语法。 |
| 4 | `true` | 给节点设置 parent 引用，便于向上查找父节点。 |
| 5 | `ts.ScriptKind.TS` | 告诉解析器这是 TypeScript 文件。 |
| 6 | `sourceFile.statements.length` | 读取顶层语句数量。 |
| 7 | `ts.SyntaxKind[sourceFile.kind]` | 把数字枚举映射回可读名称。 |

### 和实际项目的关系

如果你只想检查“是否有默认导出”“函数名是否符合规范”“是否使用某个旧 API”，SourceFile 足够。如果你要知道变量的最终静态类型，必须进入 Program 和 TypeChecker。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 以为 `createSourceFile()` 会报类型错误 | 它只解析语法 | 类型错误要用 Program |
| 忘记传 `ScriptKind.TSX` | TSX 文件会按 TS 解析失败 | TSX 用 `ts.ScriptKind.TSX` |
| 把 `fileName` 当真实文件路径 | 它可以是虚拟名称 | 只有 Program / host 才涉及文件系统 |

### 最终记忆模型

```txt
SourceFile is syntax only.
It answers what the code looks like, not what the code means.
```

---

## 7.3 02：AST 遍历

### 结论

遍历 AST 的基础 API 是 `ts.forEachChild()`。它会访问语法意义上的子节点，适合写静态分析工具。

### 技术意义

如果你要找出所有函数声明、变量声明、调用表达式、导入声明，就必须遍历节点树。

### 底层机制

AST 是树。每个节点可能有子节点。递归遍历的基本模式是：处理当前节点，然后递归处理子节点。

### API / 语法规范

| API | 签名简化版 | 返回值 | 作用 |
|---|---|---|---|
| `ts.forEachChild` | `forEachChild(node, callback)` | callback 返回值或 `undefined` | 遍历节点的语法子节点 |
| `node.kind` | 属性 | `ts.SyntaxKind` 数字 | 节点种类 |
| `ts.SyntaxKind[node.kind]` | 枚举反查 | `string` | 可读节点名 |

### 文件结构

```txt
02-ast-traversal/
  traverseTopLevelNodes.ts
  recursiveTraversal.ts
  traversalMistake.ts
```

### 示例代码

`recursiveTraversal.ts`

```ts
// Goal:
// Traverse every syntax node in a SourceFile.

// Expected output:
// Print node kind names with indentation.

import ts from "typescript";

const sourceText = `
export function calculateTotal(priceCents: number, quantity: number): number {
  return priceCents * quantity;
}
`;

const sourceFile = ts.createSourceFile(
  "orderMath.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

function printNodeTree(node: ts.Node, depth: number): void {
  const indentation = "  ".repeat(depth);
  console.log(`${indentation}${ts.SyntaxKind[node.kind]}`);

  ts.forEachChild(node, (childNode) => {
    printNodeTree(childNode, depth + 1);
  });
}

printNodeTree(sourceFile, 0);
```

`traversalMistake.ts`

```ts
// Goal:
// Show a traversal mistake where only top-level statements are inspected.

// Expected output:
// Print only top-level statement kinds.

import ts from "typescript";

const sourceText = `
function normalizeTitle(titleText: string): string {
  const trimmedTitle = titleText.trim();
  return trimmedTitle.toUpperCase();
}
`;

const sourceFile = ts.createSourceFile(
  "normalizer.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
);

for (const statementNode of sourceFile.statements) {
  console.log(ts.SyntaxKind[statementNode.kind]);
}
```


### 补齐文件代码

`traverseTopLevelNodes.ts`

```ts
// Goal:
// Inspect only top-level statements before learning recursive traversal.

// Expected output:
// Print top-level statement kind names.

import ts from "typescript";

const sourceText = `
import { readFile } from "node:fs/promises";

export interface ProductRecord {
  id: string;
  title: string;
}

export function formatTitle(titleText: string): string {
  return titleText.toUpperCase();
}
`;

const sourceFile = ts.createSourceFile(
  "api.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

for (const statementNode of sourceFile.statements) {
  console.log(ts.SyntaxKind[statementNode.kind]);
}
```

### 运行方式

```bash
npm run build
node dist/02-ast-traversal/recursiveTraversal.js
node dist/02-ast-traversal/traversalMistake.js
```

### 预期输出

递归版本会打印 `SourceFile`、`FunctionDeclaration`、`ExportKeyword`、`Identifier`、`Parameter`、`NumberKeyword`、`Block`、`ReturnStatement` 等节点名称。错误对比版本只会打印顶层 `FunctionDeclaration`，不会进入函数体内部。

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `printNodeTree(sourceFile, 0)` | 从根节点开始遍历。 |
| 2 | `ts.SyntaxKind[node.kind]` | 把当前节点 kind 转为名称。 |
| 3 | `ts.forEachChild(node, callback)` | 访问当前节点的语法子节点。 |
| 4 | `printNodeTree(childNode, depth + 1)` | 对子节点递归执行相同逻辑。 |
| 5 | `indentation` | 根据深度打印缩进，显示树结构。 |

### 和实际项目的关系

静态分析工具本质上就是遍历 AST，然后在感兴趣的节点上执行规则。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 只遍历 `sourceFile.statements` | 只能看到顶层节点 | 深层节点需要递归 |
| 使用 `getChildren()` 作为默认遍历 | 它包含更多 token 级节点，初学时噪音大 | 优先用 `forEachChild()` |
| 不判断节点类型直接访问属性 | `ts.Node` 没有具体节点属性 | 先用 `ts.isXxx()` 缩小类型 |

### 最终记忆模型

```txt
AST traversal is recursive pattern matching over syntax nodes.
```

---

## 7.4 03：SyntaxKind 和类型防护函数

### 结论

`node.kind` 告诉你节点是什么种类；`ts.isFunctionDeclaration(node)` 这类类型防护函数让 TypeScript 同时理解节点的具体类型。

### 技术意义

Compiler API 里很多节点都从 `ts.Node` 开始。只有缩小到具体节点类型后，你才能安全读取 `name`、`parameters`、`type`、`body` 等属性。

### 底层机制

`SyntaxKind` 是运行时枚举；`ts.isXxx()` 是运行时判断函数，同时在 TypeScript 类型系统里声明了类型谓词（type predicate）。

### API / 语法规范

| API | 作用 |
|---|---|
| `ts.isFunctionDeclaration(node)` | 判断函数声明 |
| `ts.isVariableStatement(node)` | 判断变量语句 |
| `ts.isVariableDeclaration(node)` | 判断变量声明 |
| `ts.isInterfaceDeclaration(node)` | 判断接口声明 |
| `ts.isTypeAliasDeclaration(node)` | 判断类型别名声明 |
| `ts.isClassDeclaration(node)` | 判断类声明 |
| `ts.isImportDeclaration(node)` | 判断导入声明 |
| `ts.isExportDeclaration(node)` | 判断导出声明 |
| `ts.isCallExpression(node)` | 判断函数调用表达式 |
| `ts.isIdentifier(node)` | 判断标识符节点 |
| `ts.isStringLiteral(node)` | 判断字符串字面量节点 |

### 文件结构

```txt
03-syntaxkind-type-guards/
  inspectSyntaxKind.ts
  functionDeclarationGuard.ts
  unsafeCastMistake.ts
```

### 示例代码

`functionDeclarationGuard.ts`

```ts
// Goal:
// Use TypeScript node guard functions to inspect function declarations.

// Expected output:
// Print exported function names.

import ts from "typescript";

const sourceText = `
export function formatTitle(titleText: string): string {
  return titleText.toUpperCase();
}

const localValue = 42;
`;

const sourceFile = ts.createSourceFile(
  "api.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

function visitNode(node: ts.Node): void {
  if (ts.isFunctionDeclaration(node)) {
    const functionName = node.name?.text ?? "anonymous";
    console.log(functionName);
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```

`unsafeCastMistake.ts`

```ts
// Goal:
// Show why casting every node to FunctionDeclaration is unsafe.

// Expected error:
// Runtime output may be wrong because many nodes are not functions.

import ts from "typescript";

const sourceText = `
const titleText = "Keyboard";
`;

const sourceFile = ts.createSourceFile(
  "unsafe.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
);

for (const statementNode of sourceFile.statements) {
  const functionNode = statementNode as ts.FunctionDeclaration;
  console.log(functionNode.name?.text ?? "missing-name");
}
```


### 补齐文件代码

`inspectSyntaxKind.ts`

```ts
// Goal:
// Inspect numeric SyntaxKind values and readable SyntaxKind names.

// Expected output:
// Print kind numbers and names for top-level nodes.

import ts from "typescript";

const sourceText = `
export const itemCount = 3;

export function readItemCount(): number {
  return itemCount;
}
`;

const sourceFile = ts.createSourceFile(
  "counter.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

for (const statementNode of sourceFile.statements) {
  console.log(statementNode.kind);
  console.log(ts.SyntaxKind[statementNode.kind]);
}
```

### 运行方式

```bash
npm run build
node dist/03-syntaxkind-type-guards/functionDeclarationGuard.js
node dist/03-syntaxkind-type-guards/unsafeCastMistake.js
```

### 预期输出

正确文件输出：

```txt
formatTitle
```

错误对比文件输出：

```txt
missing-name
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `visitNode(sourceFile)` | 从根节点开始访问。 |
| 2 | `ts.isFunctionDeclaration(node)` | 判断当前节点是否是函数声明。 |
| 3 | `node.name?.text` | 在类型被缩小后安全读取函数名。 |
| 4 | `ts.forEachChild(node, visitNode)` | 继续递归访问子节点。 |
| 5 | 错误示例中的 `as ts.FunctionDeclaration` | 只欺骗类型系统，不改变运行时节点结构。 |

### 和实际项目的关系

写代码扫描器时，不能靠猜节点结构。先判断，再读取，这是 Compiler API 的基本安全习惯。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 用 `as` 强行断言节点类型 | 断言不会做运行时验证 | 用 `ts.isXxx()` 判断 |
| 只比较字符串名称 | `SyntaxKind` 本身是数字枚举 | 可用枚举名辅助调试 |
| 访问 `node.name.text` 不判空 | 匿名函数或默认导出可能没有 name | 用可选链或分支检查 |

### 最终记忆模型

```txt
SyntaxKind tells you the shape.
Node guards let TypeScript safely narrow that shape.
```

---

## 7.5 04：节点位置、文本范围和源码片段

### 结论

每个 AST 节点都保留自己在源码文本中的位置范围。你可以用 `getStart()`、`getText()`、`getLineAndCharacterOfPosition()` 把节点定位回源代码。

### 技术意义

诊断工具、lint 工具、错误报告、代码修复都需要准确告诉用户：问题发生在哪个文件、哪一行、哪一列、哪段文本。

### 底层机制

AST 节点保存字符偏移量。行列信息不是节点直接保存的，而是通过 SourceFile 的文本映射计算出来的。

### API / 语法规范

| API / 属性 | 所属对象 | 返回值 | 含义 |
|---|---|---|---|
| `node.pos` | `Node` | `number` | 节点完整范围开始位置，可能包含前导 trivia |
| `node.end` | `Node` | `number` | 节点结束位置 |
| `node.getStart(sourceFile?)` | `Node` | `number` | 跳过前导 trivia 后的位置 |
| `node.getFullStart()` | `Node` | `number` | 完整开始位置 |
| `node.getWidth(sourceFile?)` | `Node` | `number` | 节点宽度 |
| `node.getText(sourceFile?)` | `Node` | `string` | 节点源码文本 |
| `sourceFile.getLineAndCharacterOfPosition(pos)` | `SourceFile` | `{ line, character }` | 字符偏移转行列 |

### 文件结构

```txt
04-node-position-text/
  nodePositionPrinter.ts
  nodeTextRange.ts
  positionMistake.ts
```

### 示例代码

`nodePositionPrinter.ts`

```ts
// Goal:
// Print node source position and text.

// Expected output:
// Print the function name, line, character, and source text.

import ts from "typescript";

const sourceText = `
export function buildSlug(titleText: string): string {
  return titleText.toLowerCase().replaceAll(" ", "-");
}
`;

const sourceFile = ts.createSourceFile(
  "slug.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
);

function visitNode(node: ts.Node): void {
  if (ts.isFunctionDeclaration(node)) {
    const startPosition = node.getStart(sourceFile);
    const lineInfo = sourceFile.getLineAndCharacterOfPosition(startPosition);

    console.log(node.name?.text ?? "anonymous");
    console.log(lineInfo.line + 1);
    console.log(lineInfo.character + 1);
    console.log(node.getText(sourceFile));
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```


### 补齐文件代码

`nodeTextRange.ts`

```ts
// Goal:
// Compare getText, getStart, getFullStart, and end on a selected node.

// Expected output:
// Print text range information for a function declaration.

import ts from "typescript";

const sourceText = `
// Leading note
export function normalizeTitle(titleText: string): string {
  return titleText.trim();
}
`;

const sourceFile = ts.createSourceFile(
  "title.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

const firstStatement = sourceFile.statements[0];

if (firstStatement === undefined) {
  throw new Error("Missing first statement");
}

console.log(firstStatement.getFullStart());
console.log(firstStatement.getStart(sourceFile));
console.log(firstStatement.end);
console.log(firstStatement.getText(sourceFile));
```

`positionMistake.ts`

```ts
// Goal:
// Show why using pos directly can point at leading trivia.

// Expected output:
// Print different text slices for pos and getStart.

import ts from "typescript";

const sourceText = `
// Comment before declaration
export const productTitle = "Keyboard";
`;

const sourceFile = ts.createSourceFile(
  "product.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

const firstStatement = sourceFile.statements[0];

if (firstStatement === undefined) {
  throw new Error("Missing first statement");
}

const rawStartText = sourceFile.text.slice(firstStatement.pos, firstStatement.pos + 10);
const cleanStartText = sourceFile.text.slice(
  firstStatement.getStart(sourceFile),
  firstStatement.getStart(sourceFile) + 10,
);

console.log(JSON.stringify(rawStartText));
console.log(JSON.stringify(cleanStartText));
```

### 运行方式

```bash
npm run build
node dist/04-node-position-text/nodePositionPrinter.js
```

### 预期输出

```txt
buildSlug
2
1
export function buildSlug(titleText: string): string {
  return titleText.toLowerCase().replaceAll(" ", "-");
}
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `node.getStart(sourceFile)` | 获取跳过空白和注释后的节点开始位置。 |
| 2 | `getLineAndCharacterOfPosition` | 把字符偏移量转换成从 0 开始的行列。 |
| 3 | `line + 1` | 转换成人类习惯的从 1 开始的行号。 |
| 4 | `node.getText(sourceFile)` | 取出函数声明源码文本。 |

### 和实际项目的关系

你写错误报告时不能只说“发现一个问题”。要像 TypeScript 一样报告文件名、行号、列号和消息。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 直接把 `line` 当人类行号 | API 返回从 0 开始 | 展示给用户时加 1 |
| 混用 `pos` 和 `getStart()` | `pos` 可能包含空白和注释 | 报错位置通常用 `getStart()` |
| 忘记传 `sourceFile` | 某些文本计算需要源文件上下文 | 初学时统一传入 SourceFile |

### 最终记忆模型

```txt
AST nodes remember text ranges.
Diagnostics turn text ranges into human-readable locations.
```

---

## 7.6 05：Printer 和节点重新打印

### 结论

`ts.createPrinter()` 可以把 AST 节点重新打印成源码文本。它适合做代码提取、文档生成和转换后输出。

### 技术意义

当你找到一个函数、类型别名、接口或导出声明后，可以用 printer 把它重新输出成规范文本。

### 底层机制

Printer 不只是 `getText()`。`getText()` 读取原始源码片段；printer 会根据 AST 节点重新生成文本。

### API / 语法规范

| API | 签名简化版 | 返回值 | 作用 |
|---|---|---|---|
| `ts.createPrinter(options?)` | `createPrinter({ newLine? })` | `Printer` | 创建打印器 |
| `printer.printNode(hint, node, sourceFile)` | `printNode(emitHint, node, sourceFile)` | `string` | 打印单个节点 |
| `printer.printFile(sourceFile)` | `printFile(sourceFile)` | `string` | 打印整个文件 |

### 固定属性名 / 固定方法名

| 名称 | 合法值 / 类型 | 说明 |
|---|---|---|
| `ts.EmitHint.Unspecified` | enum value | 默认打印提示 |
| `ts.EmitHint.Expression` | enum value | 按表达式打印 |
| `ts.EmitHint.IdentifierName` | enum value | 按标识符打印 |
| `ts.NewLineKind.LineFeed` | enum value | LF 换行 |
| `ts.NewLineKind.CarriageReturnLineFeed` | enum value | CRLF 换行 |

### 文件结构

```txt
05-printer-reprint/
  printSelectedNode.ts
  printFunctionSignatures.ts
  printerMistake.ts
```

### 示例代码

`printFunctionSignatures.ts`

```ts
// Goal:
// Reprint function declarations without function bodies.

// Expected output:
// Print function signatures.

import ts from "typescript";

const sourceText = `
export function formatPrice(priceCents: number): string {
  return String(priceCents);
}

export function formatTitle(titleText: string): string {
  return titleText.toUpperCase();
}
`;

const sourceFile = ts.createSourceFile(
  "formatters.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
);

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

function visitNode(node: ts.Node): void {
  if (ts.isFunctionDeclaration(node)) {
    const bodylessFunction = ts.factory.updateFunctionDeclaration(
      node,
      node.modifiers,
      node.asteriskToken,
      node.name,
      node.typeParameters,
      node.parameters,
      node.type,
      undefined,
    );

    console.log(printer.printNode(ts.EmitHint.Unspecified, bodylessFunction, sourceFile));
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```


### 补齐文件代码

`printSelectedNode.ts`

```ts
// Goal:
// Print a selected interface declaration with TypeScript Printer.

// Expected output:
// Print the selected interface source.

import ts from "typescript";

const sourceText = `
export interface ProductRecord {
  id: string;
  title: string;
}

export function formatTitle(product: ProductRecord): string {
  return product.title;
}
`;

const sourceFile = ts.createSourceFile(
  "productApi.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

for (const statementNode of sourceFile.statements) {
  if (ts.isInterfaceDeclaration(statementNode)) {
    console.log(printer.printNode(ts.EmitHint.Unspecified, statementNode, sourceFile));
  }
}
```

`printerMistake.ts`

```ts
// Goal:
// Show that getText reads original source while Printer prints constructed nodes.

// Expected output:
// Print original text and newly printed text.

import ts from "typescript";

const sourceText = `
const productTitle = "Keyboard";
`;

const sourceFile = ts.createSourceFile(
  "product.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

const originalStatement = sourceFile.statements[0];

if (originalStatement === undefined) {
  throw new Error("Missing original statement");
}

const createdStatement = ts.factory.createVariableStatement(
  [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
  ts.factory.createVariableDeclarationList(
    [
      ts.factory.createVariableDeclaration(
        "productTitle",
        undefined,
        undefined,
        ts.factory.createStringLiteral("Keyboard"),
      ),
    ],
    ts.NodeFlags.Const,
  ),
);

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

console.log(originalStatement.getText(sourceFile));
console.log(printer.printNode(ts.EmitHint.Unspecified, createdStatement, sourceFile));
```

### 运行方式

```bash
npm run build
node dist/05-printer-reprint/printFunctionSignatures.js
```

### 预期输出

```txt
export function formatPrice(priceCents: number): string;
export function formatTitle(titleText: string): string;
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `ts.createPrinter(...)` | 创建一个 AST 到文本的打印器。 |
| 2 | `ts.isFunctionDeclaration(node)` | 找到函数声明节点。 |
| 3 | `ts.factory.updateFunctionDeclaration(...)` | 创建一个没有 body 的函数声明节点。 |
| 4 | `printer.printNode(...)` | 把新节点打印成函数签名文本。 |
| 5 | `console.log(...)` | 输出 API 签名。 |

### 和实际项目的关系

API 文档生成、声明预览、迁移报告经常需要“提取代码片段并重新打印”。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 以为 `getText()` 和 printer 完全一样 | `getText()` 是原始文本，printer 是根据 AST 生成文本 | 修改节点后用 printer |
| 手写字符串拼接生成代码 | 容易漏掉修饰符、泛型、返回类型 | 用 factory 和 printer |
| 直接修改原节点属性 | AST 节点应尽量视为不可变 | 用 `ts.factory.updateXxx()` |

### 最终记忆模型

```txt
getText reads original source.
Printer emits text from AST.
```

---

## 7.7 06：Program 和 CompilerHost

### 结论

`Program` 是项目级编译上下文。它知道多个文件、编译配置、标准库、模块解析和类型检查入口。

### 技术意义

只要你需要跨文件分析、读取类型、收集项目诊断、发射输出，就要用 Program。

### 底层机制

`createProgram()` 接收根文件和编译选项。默认情况下，它通过 `CompilerHost` 访问真实文件系统。你可以自定义 host 来拦截读写。

### API / 语法规范

| API | 签名简化版 | 返回值 | 作用 |
|---|---|---|---|
| `ts.createProgram(rootNames, options, host?)` | `string[]`, `CompilerOptions`, optional host | `Program` | 创建编译上下文 |
| `ts.createCompilerHost(options)` | `CompilerOptions` | `CompilerHost` | 创建默认 host |
| `program.getSourceFile(fileName)` | `string` | `SourceFile | undefined` | 读取 source file |
| `program.getTypeChecker()` | none | `TypeChecker` | 获取类型检查器 |
| `program.emit()` | optional args | `EmitResult` | 发射输出 |

### CompilerHost 常见方法

| 方法名 | 参数 | 返回值 | 作用 |
|---|---|---|---|
| `readFile` | `fileName` | `string | undefined` | 读取文件内容 |
| `fileExists` | `fileName` | `boolean` | 判断文件存在 |
| `writeFile` | `fileName`, `text` | `void` | 写输出文件 |
| `getCurrentDirectory` | none | `string` | 当前目录 |
| `getCanonicalFileName` | `fileName` | `string` | 规范化文件名 |
| `getNewLine` | none | `string` | 获取换行符 |
| `getSourceFile` | `fileName`, `languageVersion` | `SourceFile | undefined` | 获取 SourceFile |

### 文件结构

```txt
06-program-compilerhost/
  createProgramFromFiles.ts
  customCompilerHostWriteFile.ts
  missingFileMistake.ts
```

### 示例代码

`customCompilerHostWriteFile.ts`

```ts
// Goal:
// Create a Program and capture emitted files in memory.

// Expected output:
// Print emitted file names.

import ts from "typescript";

const rootFileNames = ["15-mini-project/samplePublicApi.ts"];

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  declaration: true,
};

const capturedFiles = new Map<string, string>();
const compilerHost = ts.createCompilerHost(compilerOptions);

compilerHost.writeFile = (fileName, fileText) => {
  capturedFiles.set(fileName, fileText);
};

const program = ts.createProgram(rootFileNames, compilerOptions, compilerHost);
const emitResult = program.emit();

console.log(emitResult.emitSkipped);

for (const emittedFileName of capturedFiles.keys()) {
  console.log(emittedFileName);
}
```


### 补齐文件代码

`createProgramFromFiles.ts`

```ts
// Goal:
// Create a Program from a real TypeScript file.

// Expected output:
// Print whether the target source file is available.

import ts from "typescript";

const targetFileName = "15-mini-project/samplePublicApi.ts";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  noEmit: true,
};

const program = ts.createProgram([targetFileName], compilerOptions);
const sourceFile = program.getSourceFile(targetFileName);

console.log(sourceFile !== undefined);
console.log(program.getRootFileNames().join(","));
```

`missingFileMistake.ts`

```ts
// Goal:
// Show how Program reports a missing root file.

// Expected output:
// Print at least one diagnostic for the missing file.

import ts from "typescript";

const program = ts.createProgram(["missing-file.ts"], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  noEmit: true,
});

const diagnostics = ts.getPreEmitDiagnostics(program);

for (const diagnostic of diagnostics) {
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  console.log(`TS${diagnostic.code}: ${messageText}`);
}
```

### 运行方式

```bash
npm run build
node dist/06-program-compilerhost/customCompilerHostWriteFile.js
```

### 预期输出

输出取决于文件路径，但会包含类似：

```txt
false
15-mini-project/samplePublicApi.js
15-mini-project/samplePublicApi.d.ts
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `compilerOptions` | 定义编译目标、模块格式、严格模式和声明输出。 |
| 2 | `ts.createCompilerHost(...)` | 创建默认文件系统 host。 |
| 3 | `compilerHost.writeFile = ...` | 覆盖写文件行为，把输出存入 Map。 |
| 4 | `ts.createProgram(...)` | 用根文件、选项和 host 创建 Program。 |
| 5 | `program.emit()` | 发射 JS 和声明文件。 |
| 6 | `capturedFiles.keys()` | 打印被捕获的输出文件名。 |

### 和实际项目的关系

构建工具和代码生成工具经常需要自定义 `writeFile`，例如把输出存入内存、生成报告、写到虚拟文件系统。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| Program 只分析一个文件 | Program 可以包含根文件、依赖文件、lib 文件 | 它是项目级上下文 |
| 忘记 rootNames 路径相对运行目录 | Node 当前工作目录影响相对路径 | 用明确路径或 `process.cwd()` |
| 自定义 host 后漏掉默认方法 | Compiler API 需要多个 host 能力 | 先从 `createCompilerHost` 继承再覆盖 |

### 最终记忆模型

```txt
Program is project context.
CompilerHost is how the compiler talks to the outside world.
```

---

## 7.8 07：Diagnostics 诊断信息

### 结论

诊断信息（diagnostic）是编译器发现的问题。它可以来自语法、配置、语义、声明发射和 emit 阶段。

### 技术意义

你写工具时，不应该只判断成功或失败。要输出清楚的文件名、行列、错误代码和错误消息。

### 底层机制

`Diagnostic` 通常包含 `file`、`start`、`length`、`messageText`、`category`、`code`。没有文件的诊断通常来自配置或全局编译问题。

### API / 语法规范

| API / 属性 | 返回值 / 类型 | 作用 |
|---|---|---|
| `ts.getPreEmitDiagnostics(program)` | `Diagnostic[]` | 获取发射前诊断 |
| `emitResult.diagnostics` | `Diagnostic[]` | 获取发射阶段诊断 |
| `diagnostic.file` | `SourceFile | undefined` | 相关文件 |
| `diagnostic.start` | `number | undefined` | 起始字符位置 |
| `diagnostic.messageText` | `string | DiagnosticMessageChain` | 消息文本 |
| `diagnostic.code` | `number` | 错误代码 |
| `diagnostic.category` | `DiagnosticCategory` | 类别 |
| `ts.flattenDiagnosticMessageText(messageText, newLine)` | `string` | 展平嵌套消息 |
| `ts.formatDiagnosticsWithColorAndContext(diagnostics, host)` | `string` | 格式化彩色上下文诊断 |

### 文件结构

```txt
07-diagnostics/
  collectDiagnostics.ts
  formatDiagnostics.ts
  diagnosticMistake.ts
```

### 示例代码

`collectDiagnostics.ts`

```ts
// Goal:
// Collect TypeScript diagnostics from a Program.

// Expected output:
// Print diagnostic code, file position, and message.

import ts from "typescript";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  noEmit: true,
};

const program = ts.createProgram(
  ["07-diagnostics/diagnosticMistake.ts"],
  compilerOptions,
);

const diagnostics = ts.getPreEmitDiagnostics(program);

for (const diagnostic of diagnostics) {
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

  if (diagnostic.file !== undefined && diagnostic.start !== undefined) {
    const lineInfo = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    console.log(`${diagnostic.file.fileName}:${lineInfo.line + 1}:${lineInfo.character + 1}`);
  }

  console.log(`TS${diagnostic.code}: ${messageText}`);
}
```

`diagnosticMistake.ts`

```ts
// Goal:
// Provide a file with a type error for diagnostics.

// Expected error:
// TypeScript reports that number is not assignable to string.

export const productTitle: string = 42;
```


### 补齐文件代码

`formatDiagnostics.ts`

```ts
// Goal:
// Format diagnostics with TypeScript's built-in formatter.

// Expected output:
// Print formatted diagnostics with file context.

import ts from "typescript";

const program = ts.createProgram(["07-diagnostics/diagnosticMistake.ts"], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  noEmit: true,
});

const diagnostics = ts.getPreEmitDiagnostics(program);

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
```

### 运行方式

```bash
npm run build
node dist/07-diagnostics/collectDiagnostics.js
```

### 预期输出

```txt
07-diagnostics/diagnosticMistake.ts:7:14
TS2322: Type 'number' is not assignable to type 'string'.
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `createProgram([...], options)` | 创建只分析错误文件的 Program。 |
| 2 | `getPreEmitDiagnostics(program)` | 收集发射前诊断。 |
| 3 | `flattenDiagnosticMessageText(...)` | 把可能嵌套的消息变成字符串。 |
| 4 | `diagnostic.file` | 判断该错误是否绑定到具体文件。 |
| 5 | `getLineAndCharacterOfPosition` | 把字符位置转换成行列。 |
| 6 | `TS${diagnostic.code}` | 输出 TypeScript 错误编号。 |

### 和实际项目的关系

CI 工具、代码质量平台、编辑器插件都需要把诊断信息格式化成可读报告。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 假设每个 diagnostic 都有 file | 配置错误可能没有具体文件 | 判断 `diagnostic.file` |
| 忽略 `start` 可能为 undefined | 不是每个诊断都有文本位置 | 判断后再取行列 |
| 只读 emit diagnostics | 很多类型错误在 pre-emit 阶段 | 合并 pre-emit 和 emit diagnostics |

### 最终记忆模型

```txt
Diagnostics are compiler reports.
Good tools turn diagnostics into precise human feedback.
```

---

## 7.9 08：TypeChecker、Symbol 和导出分析

### 结论

`TypeChecker` 负责从 AST 节点获取符号（symbol）和类型（type）。如果 SourceFile 告诉你“这里有一个名字”，TypeChecker 告诉你“这个名字代表什么”。

### 技术意义

只靠 AST 无法知道导入的函数来自哪里、变量的推导类型是什么、导出成员最终暴露了什么类型。TypeChecker 负责回答这些语义问题。

### 底层机制

TypeScript 先绑定名字生成 Symbol，再根据声明、引用、控制流、泛型实例化计算 Type。

### API / 语法规范

| API | 所属对象 | 返回值 | 作用 |
|---|---|---|---|
| `program.getTypeChecker()` | `Program` | `TypeChecker` | 获取类型检查器 |
| `checker.getSymbolAtLocation(node)` | `TypeChecker` | `Symbol | undefined` | 获取某个名字位置的符号 |
| `checker.getExportsOfModule(symbol)` | `TypeChecker` | `Symbol[]` | 获取模块导出符号 |
| `checker.getTypeOfSymbolAtLocation(symbol, node)` | `TypeChecker` | `Type` | 获取符号在某位置的类型 |
| `checker.getTypeAtLocation(node)` | `TypeChecker` | `Type` | 获取节点类型 |
| `checker.typeToString(type)` | `TypeChecker` | `string` | 把 Type 转成可读文本 |
| `symbol.getName()` | `Symbol` | `string` | 获取符号名称 |
| `symbol.getDeclarations()` | `Symbol` | `Declaration[] | undefined` | 获取符号声明节点 |

### 文件结构

```txt
08-typechecker-symbols/
  inspectExportedSymbols.ts
  inspectIdentifierSymbol.ts
  symbolMistake.ts
```

### 示例代码

`inspectExportedSymbols.ts`

```ts
// Goal:
// Inspect exported symbols from a source file.

// Expected output:
// Print exported symbol names.

import ts from "typescript";

const targetFileName = "15-mini-project/samplePublicApi.ts";

const program = ts.createProgram([targetFileName], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
});

const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(targetFileName);

if (sourceFile === undefined) {
  throw new Error("Missing source file");
}

const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

if (moduleSymbol === undefined) {
  throw new Error("Missing module symbol");
}

const exportedSymbols = checker.getExportsOfModule(moduleSymbol);

for (const exportedSymbol of exportedSymbols) {
  console.log(exportedSymbol.getName());
}
```


### 补齐文件代码

`inspectIdentifierSymbol.ts`

```ts
// Goal:
// Inspect symbols for identifier nodes.

// Expected output:
// Print identifier text and resolved symbol names.

import ts from "typescript";

const targetFileName = "15-mini-project/samplePublicApi.ts";

const program = ts.createProgram([targetFileName], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
});

const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(targetFileName);

if (sourceFile === undefined) {
  throw new Error("Missing source file");
}

function visitNode(node: ts.Node): void {
  if (ts.isIdentifier(node)) {
    const symbol = checker.getSymbolAtLocation(node);

    if (symbol !== undefined) {
      console.log(`${node.text} -> ${symbol.getName()}`);
    }
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```

`symbolMistake.ts`

```ts
// Goal:
// Show that identifier text is not the same as a compiler Symbol.

// Expected output:
// Print duplicate identifier text from different declarations.

import ts from "typescript";

const sourceText = `
function readTitle(product: { title: string }): string {
  const title = product.title;
  return title;
}
`;

const sourceFile = ts.createSourceFile(
  "symbolMistake.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

function visitNode(node: ts.Node): void {
  if (ts.isIdentifier(node)) {
    console.log(node.text);
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```

### 运行方式

```bash
npm run build
node dist/08-typechecker-symbols/inspectExportedSymbols.js
```

### 预期输出

取决于 `samplePublicApi.ts`，可能类似：

```txt
ProductRecord
formatProductTitle
calculateDiscountPrice
createProductSummary
unsafeEcho
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `createProgram(...)` | 建立项目级语义上下文。 |
| 2 | `program.getTypeChecker()` | 获取类型检查器。 |
| 3 | `program.getSourceFile(targetFileName)` | 获取目标文件的 SourceFile。 |
| 4 | `checker.getSymbolAtLocation(sourceFile)` | 获取模块符号。 |
| 5 | `checker.getExportsOfModule(moduleSymbol)` | 读取模块对外导出的符号。 |
| 6 | `exportedSymbol.getName()` | 打印导出名称。 |

### 和实际项目的关系

API 审计、SDK 文档生成、破坏性变更检测都需要从导出符号开始。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 用 AST 判断所有导出 | re-export、type-only export、别名导出更复杂 | 用 TypeChecker 读符号 |
| 认为每个 SourceFile 都有 module symbol | 脚本模式文件可能没有模块符号 | 文件要有 import/export |
| 不处理 undefined | Compiler API 大量 API 返回 undefined | 每一步都做边界检查 |

### 最终记忆模型

```txt
AST finds syntax.
TypeChecker resolves meaning.
Symbol names the thing.
Type describes the thing.
```

---

## 7.10 09：Type 对象和 typeToString

### 结论

`Type` 是类型检查器计算出来的静态类型对象。你通常用 `checker.typeToString(type)` 把它转换成人类可读文本。

### 技术意义

如果你要写“导出函数返回类型检查器”“禁止 public API 暴露 any”“生成接口文档”，你必须读取 Type 对象。

### 底层机制

TypeScript 的类型不是运行时对象的类型标签，而是编译器在语义层计算出来的静态结构。它会考虑注解、推导、泛型、控制流和声明文件。

### API / 语法规范

| API | 返回值 | 作用 |
|---|---|---|
| `checker.getTypeAtLocation(node)` | `Type` | 获取节点表达式或声明位置的类型 |
| `checker.getTypeOfSymbolAtLocation(symbol, node)` | `Type` | 获取符号类型 |
| `checker.typeToString(type)` | `string` | 输出可读类型文本 |
| `type.flags` | `TypeFlags` | 类型标志位 |
| `type.getCallSignatures()` | `Signature[]` | 获取函数调用签名 |
| `checker.getReturnTypeOfSignature(signature)` | `Type` | 获取函数返回类型 |
| `signature.getParameters()` | `Symbol[]` | 获取签名参数符号 |

### 文件结构

```txt
09-typechecker-types/
  inspectFunctionTypes.ts
  inspectVariableTypes.ts
  typeMistake.ts
```

### 示例代码

`inspectFunctionTypes.ts`

```ts
// Goal:
// Inspect exported function parameter and return types.

// Expected output:
// Print function type summaries.

import ts from "typescript";

const targetFileName = "15-mini-project/samplePublicApi.ts";

const program = ts.createProgram([targetFileName], {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
});

const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(targetFileName);

if (sourceFile === undefined) {
  throw new Error("Missing source file");
}

function visitNode(node: ts.Node): void {
  if (ts.isFunctionDeclaration(node) && node.name !== undefined) {
    const functionType = checker.getTypeAtLocation(node.name);
    const callSignatures = functionType.getCallSignatures();

    for (const callSignature of callSignatures) {
      const returnType = checker.getReturnTypeOfSignature(callSignature);
      console.log(`${node.name.text}: ${checker.typeToString(returnType)}`);
    }
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```


### 补齐文件代码

`inspectVariableTypes.ts`

```ts
// Goal:
// Inspect inferred variable types with a Program and TypeChecker.

// Expected output:
// Print variable names and inferred types.

import ts from "typescript";

const fileName = "memoryVariables.ts";
const sourceText = `
const titleText = "Keyboard";
const priceCents = 9900;
const productRecord = {
  titleText,
  priceCents,
};
`;

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ES2022,
  strict: true,
};

const compilerHost = ts.createCompilerHost(compilerOptions);

compilerHost.fileExists = (requestedFileName) => {
  return requestedFileName === fileName || ts.sys.fileExists(requestedFileName);
};

compilerHost.readFile = (requestedFileName) => {
  if (requestedFileName === fileName) {
    return sourceText;
  }

  return ts.sys.readFile(requestedFileName);
};

compilerHost.getSourceFile = (requestedFileName, languageVersion) => {
  if (requestedFileName === fileName) {
    return ts.createSourceFile(fileName, sourceText, languageVersion, true, ts.ScriptKind.TS);
  }

  const fileText = ts.sys.readFile(requestedFileName);

  if (fileText === undefined) {
    return undefined;
  }

  return ts.createSourceFile(requestedFileName, fileText, languageVersion, true);
};

const program = ts.createProgram([fileName], compilerOptions, compilerHost);
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(fileName);

if (sourceFile === undefined) {
  throw new Error("Missing source file");
}

function visitNode(node: ts.Node): void {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
    const variableType = checker.getTypeAtLocation(node.name);
    console.log(`${node.name.text}: ${checker.typeToString(variableType)}`);
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);
```

`typeMistake.ts`

```ts
// Goal:
// Show that node.type only reads explicit annotations.

// Expected output:
// Print missing-explicit-type for an inferred variable.

import ts from "typescript";

const sourceText = `
const productTitle = "Keyboard";
const priceCents: number = 9900;
`;

const sourceFile = ts.createSourceFile(
  "typeMistake.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

for (const statementNode of sourceFile.statements) {
  if (ts.isVariableStatement(statementNode)) {
    for (const declarationNode of statementNode.declarationList.declarations) {
      const nameText = declarationNode.name.getText(sourceFile);
      const typeText = declarationNode.type?.getText(sourceFile) ?? "missing-explicit-type";
      console.log(`${nameText}: ${typeText}`);
    }
  }
}
```

### 运行方式

```bash
npm run build
node dist/09-typechecker-types/inspectFunctionTypes.js
```

### 预期输出

```txt
formatProductTitle: string
calculateDiscountPrice: number
createProductSummary: ProductSummary
unsafeEcho: any
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `checker.getTypeAtLocation(node.name)` | 获取函数名位置对应的函数类型。 |
| 2 | `functionType.getCallSignatures()` | 获取函数可调用签名。 |
| 3 | `checker.getReturnTypeOfSignature(callSignature)` | 读取返回类型对象。 |
| 4 | `checker.typeToString(returnType)` | 把类型对象转换成文本。 |
| 5 | `console.log(...)` | 输出函数名和返回类型。 |

### 和实际项目的关系

公开 API 审计最关心的不是源码长什么样，而是最终暴露给使用者的类型是什么。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把类型字符串当作唯一真相 | 字符串只是展示结果 | 复杂判断要看 Type flags、symbol、signature |
| 直接读取 AST 的 `node.type` | 没有注解时可能为空 | 推导类型要用 TypeChecker |
| 以为类型存在于运行时 | Type 对象只存在于编译器进程 | 编译后不会进入业务 JS |

### 最终记忆模型

```txt
TypeChecker computes types.
typeToString only displays them.
```

---

## 7.11 10：emit 和 transpileModule 的边界

### 结论

`program.emit()` 是项目级发射；`ts.transpileModule()` 是单文件转译。它们解决的问题不同。

### 技术意义

很多前端工具链默认只转译 TS，不做完整类型检查。你必须知道这和 `tsc --noEmit` 的边界差异。

### 底层机制

`transpileModule()` 不创建完整 Program，不做跨文件类型检查。它适合快速把 TS 语法变成 JS，但不适合作为完整类型安全保证。

### API / 语法规范

| API | 输入 | 输出 | 是否完整类型检查 | 使用场景 |
|---|---|---|---|---|
| `program.emit()` | Program | `EmitResult` | 可以结合 diagnostics | 项目构建 |
| `ts.transpileModule()` | 单个源码字符串 | `TranspileOutput` | 否 | 快速转译、演示、工具内部 |
| `ts.getPreEmitDiagnostics()` | Program | `Diagnostic[]` | 是 | 类型检查报告 |

### 文件结构

```txt
10-emit-transpile/
  emitProject.ts
  transpileSingleFile.ts
  transpileMistake.ts
```

### 示例代码

`transpileMistake.ts`

```ts
// Goal:
// Show that transpileModule does not provide full type safety.

// Expected output:
// It still emits JavaScript even with an obvious type mismatch.

import ts from "typescript";

const sourceText = `
const titleText: string = 42;
console.log(titleText);
`;

const output = ts.transpileModule(sourceText, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
  reportDiagnostics: true,
});

console.log(output.outputText.trim());
console.log(output.diagnostics?.length ?? 0);
```


### 补齐文件代码

`emitProject.ts`

```ts
// Goal:
// Emit JavaScript and declaration output from a Program.

// Expected output:
// Print whether emit was skipped and any emitted diagnostics.

import ts from "typescript";

const targetFileName = "15-mini-project/samplePublicApi.ts";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  declaration: true,
  outDir: "dist-emitted",
};

const program = ts.createProgram([targetFileName], compilerOptions);
const emitResult = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

console.log(`emitSkipped: ${String(emitResult.emitSkipped)}`);

for (const diagnostic of diagnostics) {
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  console.log(`TS${diagnostic.code}: ${messageText}`);
}
```

`transpileSingleFile.ts`

```ts
// Goal:
// Transpile a single TypeScript source string into JavaScript.

// Expected output:
// Print JavaScript output text.

import ts from "typescript";

const sourceText = `
const priceCents: number = 9900;
console.log(priceCents);
`;

const output = ts.transpileModule(sourceText, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
});

console.log(output.outputText.trim());
```

### 运行方式

```bash
npm run build
node dist/10-emit-transpile/transpileMistake.js
```

### 预期输出

`transpileMistake.ts` 仍会输出 JS 文本。诊断数量通常不会包含完整语义类型错误。

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `sourceText` | 保存单文件源码。 |
| 2 | `ts.transpileModule(...)` | 只把 TS 语法转成 JS。 |
| 3 | `output.outputText` | 读取输出 JS。 |
| 4 | `reportDiagnostics` | 只报告转译相关诊断，不等价于完整 Program 检查。 |

### 和实际项目的关系

Vite、esbuild、swc 这类工具常常转译很快，但类型检查要由 `tsc --noEmit` 或独立插件承担。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 以为能编译就类型安全 | 转译不等于类型检查 | CI 中保留 `tsc --noEmit` |
| 用 `transpileModule` 做项目审计 | 它没有完整项目上下文 | 用 Program 和 TypeChecker |
| 忽略 emitSkipped | 项目发射可能跳过 | 检查 `emitResult.emitSkipped` |

### 最终记忆模型

```txt
Transpile changes syntax.
Program checks project meaning.
Emit writes project output.
```

---

## 7.12 11：Transformer API 入门

### 结论

Transformer API 可以在 AST 层修改代码结构，然后用 printer 或 emit 输出新代码。

### 技术意义

自动迁移、批量重构、代码生成、编译插件都可能使用 transformer。但 transformer 风险比只读分析更高，初学时只能做很小的安全转换。

### 底层机制

Transformer 接收 `TransformationContext`，返回一个访问函数。访问函数遍历节点，遇到目标节点时返回新节点，否则继续访问子节点。

### API / 语法规范

| API / 类型 | 作用 |
|---|---|
| `ts.transform(source, transformers)` | 对 AST 应用转换器 |
| `ts.TransformerFactory<T>` | 转换器工厂类型 |
| `ts.visitNode(node, visitor)` | 访问单个节点 |
| `ts.visitEachChild(node, visitor, context)` | 访问并更新子节点 |
| `ts.factory` | 创建或更新 AST 节点 |
| `ts.factory.updateCallExpression` | 更新调用表达式 |
| `ts.factory.createIdentifier` | 创建标识符 |
| `TransformationResult.dispose()` | 释放转换结果内部资源 |

### 文件结构

```txt
11-transformer-api/
  renameConsoleLogTransformer.ts
  addFunctionPrefixComment.ts
  transformerMistake.ts
```

### 示例代码

`renameConsoleLogTransformer.ts`

```ts
// Goal:
// Transform console.log calls into console.info calls.

// Expected output:
// Print transformed JavaScript source text.

import ts from "typescript";

const sourceText = `
console.log("ready");
console.error("failed");
`;

const sourceFile = ts.createSourceFile(
  "logger.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (context) => {
  const visitor: ts.Visitor = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.expression.getText(sourceFile) === "console" &&
      node.expression.name.text === "log"
    ) {
      const updatedExpression = ts.factory.updatePropertyAccessExpression(
        node.expression,
        node.expression.expression,
        ts.factory.createIdentifier("info"),
      );

      return ts.factory.updateCallExpression(
        node,
        updatedExpression,
        node.typeArguments,
        node.arguments,
      );
    }

    return ts.visitEachChild(node, visitor, context);
  };

  return (node) => ts.visitNode(node, visitor) as ts.SourceFile;
};

const transformationResult = ts.transform(sourceFile, [transformerFactory]);
const transformedSourceFile = transformationResult.transformed[0];

if (transformedSourceFile === undefined) {
  throw new Error("Missing transformed source file");
}

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

console.log(printer.printFile(transformedSourceFile));
transformationResult.dispose();
```


### 补齐文件代码

`addFunctionPrefixComment.ts`

```ts
// Goal:
// Add a synthetic leading comment before function declarations.

// Expected output:
// Print transformed source with a synthetic comment.

import ts from "typescript";

const sourceText = `
export function formatTitle(titleText: string): string {
  return titleText.toUpperCase();
}
`;

const sourceFile = ts.createSourceFile(
  "api.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (context) => {
  const visitor: ts.Visitor = (node) => {
    if (ts.isFunctionDeclaration(node)) {
      const updatedNode = ts.factory.updateFunctionDeclaration(
        node,
        node.modifiers,
        node.asteriskToken,
        node.name,
        node.typeParameters,
        node.parameters,
        node.type,
        node.body,
      );

      ts.addSyntheticLeadingComment(
        updatedNode,
        ts.SyntaxKind.MultiLineCommentTrivia,
        " API function ",
        true,
      );

      return updatedNode;
    }

    return ts.visitEachChild(node, visitor, context);
  };

  return (node) => ts.visitNode(node, visitor) as ts.SourceFile;
};

const transformationResult = ts.transform(sourceFile, [transformerFactory]);
const transformedSourceFile = transformationResult.transformed[0];

if (transformedSourceFile === undefined) {
  throw new Error("Missing transformed source file");
}

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

console.log(printer.printFile(transformedSourceFile));
transformationResult.dispose();
```

`transformerMistake.ts`

```ts
// Goal:
// Show why broad string replacement is unsafe for code migration.

// Expected output:
// Print a replacement that also changes non-call text.

const sourceText = `
const catalogName = "logistics";
console.log(catalogName);
`;

const unsafeOutput = sourceText.replaceAll("log", "info");

console.log(unsafeOutput.trim());
```

### 运行方式

```bash
npm run build
node dist/11-transformer-api/renameConsoleLogTransformer.js
```

### 预期输出

```txt
console.info("ready");
console.error("failed");
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `transformerFactory` | 定义一个 SourceFile 转换器工厂。 |
| 2 | `visitor` | 对每个节点执行判断。 |
| 3 | `ts.isCallExpression(node)` | 找函数调用节点。 |
| 4 | `ts.isPropertyAccessExpression(node.expression)` | 判断调用目标是否是属性访问。 |
| 5 | `console.log` 条件 | 只匹配 `console.log(...)`。 |
| 6 | `updatePropertyAccessExpression` | 把 `.log` 更新为 `.info`。 |
| 7 | `updateCallExpression` | 返回新的调用表达式节点。 |
| 8 | `visitEachChild` | 非目标节点继续递归访问。 |
| 9 | `ts.transform(...)` | 执行转换。 |
| 10 | `printer.printFile(...)` | 打印转换后的文件。 |
| 11 | `dispose()` | 释放转换结果资源。 |

### 和实际项目的关系

迁移旧 API、替换函数调用、自动修复导入路径，都可以用 transformer。但真实项目更推荐先用只读报告，再做可审查的转换。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 用字符串替换源码 | 容易误替换注释、字符串、嵌套语法 | 用 AST 匹配节点 |
| 忘记 `visitEachChild` | 子树不会继续遍历 | 非目标节点继续递归 |
| 直接创建不完整节点 | 可能丢失类型参数或参数列表 | 优先用 `updateXxx()` |
| 不调用 `dispose()` | 转换结果资源未释放 | 转换后调用 dispose |

### 最终记忆模型

```txt
Transformer changes syntax trees, not runtime values.
Small precise transforms are safer than broad string replacement.
```

---

## 7.13 12：LanguageService 入门

### 结论

`LanguageService` 是给编辑器和 IDE 使用的长生命周期编译服务。它按需提供诊断、补全、跳转、悬停、重命名和 emit 输出。

### 技术意义

如果 Program 像一次性编译，那么 LanguageService 更像 IDE 后台常驻的“项目大脑”。

### 底层机制

LanguageService 依赖 `LanguageServiceHost`。Host 提供文件名、版本号、ScriptSnapshot、编译配置和文件系统访问能力。文件版本变化后，语言服务可以增量更新。

### API / 语法规范

| API / 类型 | 作用 |
|---|---|
| `ts.createLanguageService(host, registry?)` | 创建语言服务 |
| `ts.createDocumentRegistry()` | 创建文档注册表 |
| `LanguageServiceHost.getScriptFileNames()` | 返回参与服务的文件 |
| `LanguageServiceHost.getScriptVersion(fileName)` | 返回文件版本 |
| `LanguageServiceHost.getScriptSnapshot(fileName)` | 返回文件文本快照 |
| `ts.ScriptSnapshot.fromString(text)` | 从字符串创建快照 |
| `languageService.getSyntacticDiagnostics(fileName)` | 获取语法诊断 |
| `languageService.getSemanticDiagnostics(fileName)` | 获取语义诊断 |
| `languageService.getCompletionsAtPosition(fileName, position, options)` | 获取补全 |
| `languageService.getQuickInfoAtPosition(fileName, position)` | 获取悬停信息 |
| `languageService.getDefinitionAtPosition(fileName, position)` | 获取定义位置 |

### 文件结构

```txt
12-language-service-overview/
  simpleLanguageService.ts
  completionAtPosition.ts
  languageServiceNotes.md
```

### 示例代码

`simpleLanguageService.ts`

```ts
// Goal:
// Create a small in-memory LanguageService.

// Expected output:
// Print semantic diagnostic count.

import ts from "typescript";

const fileName = "memoryFile.ts";
const fileText = `
const titleText: string = 42;
titleText.toUpperCase();
`;

const files = new Map<string, { version: string; text: string }>();

files.set(fileName, {
  version: "1",
  text: fileText,
});

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ES2022,
  strict: true,
};

const languageServiceHost: ts.LanguageServiceHost = {
  getScriptFileNames: () => [...files.keys()],
  getScriptVersion: (requestedFileName) => files.get(requestedFileName)?.version ?? "0",
  getScriptSnapshot: (requestedFileName) => {
    const fileRecord = files.get(requestedFileName);

    if (fileRecord === undefined) {
      return undefined;
    }

    return ts.ScriptSnapshot.fromString(fileRecord.text);
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => compilerOptions,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
};

const languageService = ts.createLanguageService(
  languageServiceHost,
  ts.createDocumentRegistry(),
);

const diagnostics = languageService.getSemanticDiagnostics(fileName);

console.log(diagnostics.length);
```


### 补齐文件代码

`completionAtPosition.ts`

```ts
// Goal:
// Request completions from an in-memory LanguageService.

// Expected output:
// Print a few completion names after a string value dot.

import ts from "typescript";

const fileName = "completionFile.ts";
const fileText = `
const titleText = "Keyboard";
titleText.
`;

const files = new Map<string, { version: string; text: string }>();

files.set(fileName, {
  version: "1",
  text: fileText,
});

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ES2022,
  strict: true,
};

const languageServiceHost: ts.LanguageServiceHost = {
  getScriptFileNames: () => [...files.keys()],
  getScriptVersion: (requestedFileName) => files.get(requestedFileName)?.version ?? "0",
  getScriptSnapshot: (requestedFileName) => {
    const fileRecord = files.get(requestedFileName);

    if (fileRecord === undefined) {
      return undefined;
    }

    return ts.ScriptSnapshot.fromString(fileRecord.text);
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => compilerOptions,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
};

const languageService = ts.createLanguageService(
  languageServiceHost,
  ts.createDocumentRegistry(),
);

const completions = languageService.getCompletionsAtPosition(
  fileName,
  fileText.length,
  {},
);

const completionNames = completions?.entries.slice(0, 5).map((entry) => entry.name) ?? [];

for (const completionName of completionNames) {
  console.log(completionName);
}
```

`languageServiceNotes.md`

```md
# Language Service Notes

## Mental model

```txt
files with versions
  -> ScriptSnapshot
  -> LanguageServiceHost
  -> LanguageService
  -> diagnostics / completions / quick info / definitions
```

## Key rule

When file text changes, the file version must change too.

## Practice checklist

- Request semantic diagnostics.
- Request completions at a known position.
- Change the in-memory file text.
- Increment the version.
- Request diagnostics again.
```

### 运行方式

```bash
npm run build
node dist/12-language-service-overview/simpleLanguageService.js
```

### 预期输出

```txt
1
```

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `files` | 用 Map 模拟内存文件系统。 |
| 2 | `getScriptFileNames` | 告诉语言服务有哪些文件。 |
| 3 | `getScriptVersion` | 给每个文件一个版本号。 |
| 4 | `getScriptSnapshot` | 提供文件某一时刻的文本快照。 |
| 5 | `createLanguageService` | 创建语言服务对象。 |
| 6 | `getSemanticDiagnostics` | 请求某个文件的语义诊断。 |

### 和实际项目的关系

WebStorm、VS Code、tsserver、编辑器插件会围绕类似能力构建用户体验。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把 LanguageService 当普通脚本工具 | 它适合长生命周期、按需查询 | 一次性分析先用 Program |
| 文件变化不更新 version | 服务无法知道文件变了 | 内容变化要更新版本号 |
| `ScriptSnapshot` 返回旧文本 | 诊断和补全会过期 | host 必须维护真实文本状态 |

### 最终记忆模型

```txt
LanguageService is a long-lived, on-demand compiler context for editor features.
```

---

## 7.14 13：Watch Program 入门

### 结论

Watch Program 是 TypeScript 用于监听文件变化并增量构建的能力。它适合构建工具，不适合初学阶段写复杂逻辑。

### 技术意义

大型项目不能每次文件变化都完整重建。watch program 和 builder program 通过缓存减少重复检查和重复发射。

### 底层机制

`createWatchCompilerHost()` 创建 watch host，`createWatchProgram()` 启动监听。builder program 可以复用之前的语义结果。

### API / 语法规范

| API | 作用 |
|---|---|
| `ts.findConfigFile(searchPath, fileExists, configName)` | 查找 tsconfig |
| `ts.createWatchCompilerHost(configPath, optionsToExtend, system, createProgram, reportDiagnostic, reportWatchStatusChanged)` | 创建 watch host |
| `ts.createWatchProgram(host)` | 启动 watch program |
| `ts.createSemanticDiagnosticsBuilderProgram` | 创建只关心语义诊断的 builder program |
| `ts.createEmitAndSemanticDiagnosticsBuilderProgram` | 创建语义诊断和发射 builder program |

### 文件结构

```txt
13-watch-program-overview/
  watchProgramSkeleton.ts
  watchProgramNotes.md
```

### 示例代码

`watchProgramSkeleton.ts`

```ts
// Goal:
// Show the minimal shape of a TypeScript watch program.

// Expected output:
// Print watch status messages when executed.

import ts from "typescript";

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

const configPath = ts.findConfigFile(
  "./",
  ts.sys.fileExists,
  "tsconfig.json",
);

if (configPath === undefined) {
  throw new Error("Missing tsconfig.json");
}

const watchHost = ts.createWatchCompilerHost(
  configPath,
  {},
  ts.sys,
  ts.createSemanticDiagnosticsBuilderProgram,
  (diagnostic) => {
    console.error(ts.formatDiagnostic(diagnostic, formatHost));
  },
  (diagnostic) => {
    console.info(ts.formatDiagnostic(diagnostic, formatHost));
  },
);

ts.createWatchProgram(watchHost);
```


### 补齐文件代码

`watchProgramNotes.md`

```md
# Watch Program Notes

## Role

Watch Program is TypeScript's infrastructure for repeated builds after file changes.

## When to use it

- Build tools
- Long-running development servers
- Project diagnostics that should update after edits

## When not to use it

- One-off source analysis
- Small scripts
- Simple API report generation
```

### 运行方式

```bash
npm run build
node dist/13-watch-program-overview/watchProgramSkeleton.js
```

### 预期输出

会输出启动监听、开始编译、编译完成或错误信息。该脚本会持续运行，需要手动停止。

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `formatHost` | 定义诊断格式化需要的环境信息。 |
| 2 | `findConfigFile` | 从当前目录查找 `tsconfig.json`。 |
| 3 | `createWatchCompilerHost` | 创建监听编译宿主。 |
| 4 | `createSemanticDiagnosticsBuilderProgram` | 使用增量语义诊断 builder。 |
| 5 | `createWatchProgram` | 启动监听流程。 |

### 和实际项目的关系

这解释了为什么 `tsc --watch` 能在文件变化时快速给出新结果。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| 把 watch program 用作普通一次性脚本 | 它会持续运行 | 普通脚本用 Program |
| 忘记手动停止 | Node 进程会保持监听 | 用 Ctrl+C 停止 |
| watch 中做重型同步任务 | 会拖慢开发体验 | 只做必要分析 |

### 最终记忆模型

```txt
Watch Program is incremental compiler infrastructure for file changes.
```

---

## 7.15 14：模块解析边界

### 结论

Compiler API 可以让你观察 TypeScript 如何解析模块，但 TypeScript 找得到类型文件不等于 Node 运行时一定能加载对应模块。

### 技术意义

很多工程问题发生在“类型解析成功，但运行时路径失败”或“bundler 支持路径别名，但 Node 不支持”。你要把类型解析和运行时加载分开。

### 底层机制

模块解析（module resolution）会根据 `moduleResolution`、`baseUrl`、`paths`、`package.json`、扩展名和声明文件寻找目标文件。

### API / 语法规范

| API | 作用 |
|---|---|
| `ts.resolveModuleName(moduleName, containingFile, options, host)` | 手动解析模块 |
| `ts.createCompilerHost(options)` | 提供默认解析 host |
| `ResolvedModuleFull.resolvedFileName` | 解析到的文件名 |
| `ResolvedModuleFull.extension` | 解析到的扩展类型 |
| `ResolvedModuleFull.isExternalLibraryImport` | 是否外部库导入 |

### 文件结构

```txt
14-module-resolution-boundary/
  traceResolvedModule.ts
  moduleResolutionHostNotes.md
```

### 示例代码

`traceResolvedModule.ts`

```ts
// Goal:
// Resolve a module name with TypeScript module resolution.

// Expected output:
// Print the resolved TypeScript package declaration path or undefined.

import ts from "typescript";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
};

const compilerHost = ts.createCompilerHost(compilerOptions);

const resolvedModule = ts.resolveModuleName(
  "typescript",
  "analyzer.ts",
  compilerOptions,
  compilerHost,
);

console.log(resolvedModule.resolvedModule?.resolvedFileName ?? "not-found");
```


### 补齐文件代码

`moduleResolutionHostNotes.md`

```md
# Module Resolution Host Notes

## Boundary

TypeScript module resolution answers where an import points in the type system.

Node or a bundler answers what code runs at runtime.

## Checklist

- Check `module`.
- Check `moduleResolution`.
- Check package `exports`.
- Check relative import extensions.
- Check `paths` and runtime alias configuration separately.
```

### 运行方式

```bash
npm run build
node dist/14-module-resolution-boundary/traceResolvedModule.js
```

### 预期输出

输出会指向本地 `node_modules/typescript` 下的声明或入口相关文件。

### 执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `compilerOptions` | 配置 NodeNext 模块解析。 |
| 2 | `createCompilerHost` | 创建带文件系统能力的 host。 |
| 3 | `resolveModuleName(...)` | 根据包含文件、模块名和配置解析模块。 |
| 4 | `resolvedModule?.resolvedFileName` | 读取解析结果文件名。 |
| 5 | `?? "not-found"` | 没解析到时输出 fallback 文本。 |

### 和实际项目的关系

路径别名、包导出、`.d.ts` 查找、monorepo workspace 都绕不开模块解析。

### 常见错误

| 错误 | 为什么错 | 正确模型 |
|---|---|---|
| TypeScript 解析成功就代表 Node 能运行 | TS 可能解析到声明文件 | 运行时还要能加载 JS |
| 忘记 NodeNext 的扩展名规则 | ESM 相对导入常需要 `.js` 后缀 | TS 源文件和运行时 specifier 要对齐 |
| 把 paths 当成运行时别名 | paths 主要服务 TS 解析 | bundler / runtime 也要配置 |

### 最终记忆模型

```txt
Module resolution is TypeScript's answer to where an import points.
Runtime loading is the host's answer to what code actually runs.
```

---

## 8. 本章 API / 语法完整索引

| 分类 | API / 属性 | 返回值 | 核心用途 |
|---|---|---|---|
| 解析 | `ts.createSourceFile(fileName, sourceText, languageVersion, setParentNodes?, scriptKind?)` | `SourceFile` | 创建 AST 根节点 |
| 解析 | `ts.ScriptTarget.ES2022` | enum value | 指定脚本目标 |
| 解析 | `ts.ScriptKind.TS` / `ts.ScriptKind.TSX` | enum value | 指定脚本类型 |
| SourceFile | `sourceFile.fileName` | `string` | 文件名 |
| SourceFile | `sourceFile.text` | `string` | 完整源码文本 |
| SourceFile | `sourceFile.statements` | `NodeArray<Statement>` | 顶层语句 |
| 遍历 | `ts.forEachChild(node, callback)` | callback result | 遍历语法子节点 |
| 节点 | `node.kind` | `SyntaxKind` | 节点种类 |
| 节点 | `node.getStart(sourceFile?)` | `number` | 节点开始位置 |
| 节点 | `node.getText(sourceFile?)` | `string` | 节点源码文本 |
| 判断 | `ts.isFunctionDeclaration(node)` | `boolean` | 判断函数声明 |
| 判断 | `ts.isVariableStatement(node)` | `boolean` | 判断变量语句 |
| 判断 | `ts.isCallExpression(node)` | `boolean` | 判断调用表达式 |
| Program | `ts.createProgram(rootNames, options, host?)` | `Program` | 创建项目上下文 |
| Host | `ts.createCompilerHost(options)` | `CompilerHost` | 创建默认宿主 |
| Program | `program.getSourceFile(fileName)` | `SourceFile | undefined` | 获取源文件 |
| Program | `program.getTypeChecker()` | `TypeChecker` | 获取类型检查器 |
| Program | `program.emit()` | `EmitResult` | 发射输出 |
| Diagnostics | `ts.getPreEmitDiagnostics(program)` | `Diagnostic[]` | 获取发射前诊断 |
| Diagnostics | `ts.flattenDiagnosticMessageText(messageText, newLine)` | `string` | 展平消息 |
| TypeChecker | `checker.getSymbolAtLocation(node)` | `Symbol | undefined` | 获取符号 |
| TypeChecker | `checker.getExportsOfModule(symbol)` | `Symbol[]` | 获取模块导出 |
| TypeChecker | `checker.getTypeAtLocation(node)` | `Type` | 获取节点类型 |
| TypeChecker | `checker.typeToString(type)` | `string` | 类型转文本 |
| Signature | `type.getCallSignatures()` | `Signature[]` | 获取调用签名 |
| Signature | `checker.getReturnTypeOfSignature(signature)` | `Type` | 获取返回类型 |
| Printer | `ts.createPrinter(options?)` | `Printer` | 创建打印器 |
| Printer | `printer.printNode(hint, node, sourceFile)` | `string` | 打印节点 |
| Emit | `ts.transpileModule(input, options)` | `TranspileOutput` | 单文件转译 |
| Transform | `ts.transform(source, transformers)` | `TransformationResult` | 转换 AST |
| Transform | `ts.visitEachChild(node, visitor, context)` | `Node` | 递归访问子节点 |
| Transform | `ts.factory.updateCallExpression(...)` | `CallExpression` | 更新调用表达式 |
| LanguageService | `ts.createLanguageService(host, registry?)` | `LanguageService` | 创建语言服务 |
| LanguageService | `ts.ScriptSnapshot.fromString(text)` | `ScriptSnapshot` | 创建文本快照 |
| Watch | `ts.createWatchCompilerHost(...)` | `WatchCompilerHost` | 创建监听 host |
| Watch | `ts.createWatchProgram(host)` | watch object | 启动监听 |
| Resolution | `ts.resolveModuleName(moduleName, containingFile, options, host)` | resolution result | 解析模块 |

---

## 9. 本章常见错误总表

| 错误 | 类型 | 原因 | 正确处理 |
|---|---|---|---|
| 用正则解析 TS 代码 | 工程设计错误 | 泛型、嵌套、JSX、注释和字符串会破坏规则 | 用 AST |
| 用 `createSourceFile()` 期待类型错误 | 概念错误 | 它只解析，不做项目级类型检查 | 用 Program |
| 只遍历顶层 statements | 逻辑错误 | 深层节点不会访问 | 递归 `forEachChild` |
| 对所有节点强行 `as FunctionDeclaration` | 类型逃逸错误 | 断言不验证运行时结构 | 用 `ts.isFunctionDeclaration` |
| 忘记处理 undefined | 运行时错误 | API 经常返回 undefined | 每个边界显式判断 |
| 把 `typeToString()` 当作唯一数据源 | 设计错误 | 字符串适合展示，不适合复杂判断 | 需要时检查 flags、symbol、signature |
| 用 `transpileModule()` 替代 `tsc --noEmit` | 类型安全错误 | 它不做完整项目语义检查 | CI 保留完整类型检查 |
| transformer 直接拼接字符串 | 代码转换错误 | 容易误伤源码 | 用 AST 节点匹配和 factory |
| LanguageService 文件版本不更新 | IDE 状态错误 | 服务不知道文件变化 | 修改文本时递增 version |
| TS 解析成功就认为 Node 能运行 | 模块边界错误 | TS 可能解析到声明文件 | 同时检查运行时路径 |

### IDE 警告说明

| 警告 | 类别 | 解释 |
|---|---|---|
| `Cannot find module 'typescript'` | 类型检查错误 | 当前目录未安装 `typescript`，或 IDE 没使用当前项目的 `node_modules`。 |
| `Cannot find name 'process'` | 类型检查错误 | 缺少 `@types/node` 或 `types` 未包含 `node`。 |
| `Property does not exist on type Node` | 类型检查错误 | 没有先用 `ts.isXxx()` 缩小节点类型。 |
| `Object is possibly undefined` | 类型检查错误 | Compiler API 很多方法返回 `undefined`，需要分支检查。 |
| `This syntax requires an imported helper` | 编译配置问题 | target、module 或 helper 配置影响输出。 |
| IDE 对某些 factory 签名提示不一致 | 标准库类型版本问题 | `typescript` 版本和 IDE 内置 TS 服务版本不一致时可能出现。 |

---

## 10. 最终小项目：Public API Analyzer

### 项目目标

做一个小型公开 API 分析器。它读取 `samplePublicApi.ts`，输出：导出函数名称、参数名称、参数类型、返回类型、是否有显式返回类型、是否暴露 `any`、是否存在未导出的内部函数，并设置 CI 可识别的退出码。

### 使用到的本章知识点

| 知识点 | 在项目中的角色 |
|---|---|
| `createProgram` | 建立项目级语义上下文 |
| `getSourceFile` | 获取被分析文件 |
| `forEachChild` | 遍历文件 AST |
| `ts.isFunctionDeclaration` | 找函数声明 |
| `TypeChecker` | 读取参数和返回类型 |
| `Diagnostic` | 检查目标文件是否有类型错误 |
| `typeToString` | 输出可读类型 |
| `getLineAndCharacterOfPosition` | 报告函数位置 |
| `ts.SyntaxKind` | 判断 export modifier |

### 推荐文件结构

```txt
15-mini-project/
  samplePublicApi.ts
  analyzePublicApi.ts
  analyzePublicApiMistakes.ts
  publicApiReportChecklist.md
```

### 主文件代码

`samplePublicApi.ts`

```ts
// Goal:
// Provide a sample public API for Compiler API analysis.

// Expected output:
// This file is analyzed by analyzePublicApi.ts.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type ProductSummary = {
  id: string;
  label: string;
};

export function formatProductTitle(product: ProductRecord): string {
  return product.title.trim().toUpperCase();
}

export function calculateDiscountPrice(
  priceCents: number,
  discountRate: number,
): number {
  return Math.round(priceCents * (1 - discountRate));
}

export function createProductSummary(product: ProductRecord): ProductSummary {
  return {
    id: product.id,
    label: `${product.title}:${product.priceCents}`,
  };
}

export function unsafeEcho(value: any): any {
  return value;
}

function formatInternalKey(productId: string): string {
  return `product:${productId}`;
}

console.log(formatInternalKey("p1"));
```

`analyzePublicApi.ts`

```ts
// Goal:
// Analyze exported functions in a TypeScript module.

// Expected output:
// Print public function names, parameter types, return types, and API risks.

import ts from "typescript";

type FunctionReport = {
  name: string;
  line: number;
  character: number;
  isExported: boolean;
  hasExplicitReturnType: boolean;
  parameters: {
    name: string;
    typeText: string;
  }[];
  returnTypeText: string;
  exposesAny: boolean;
};

const targetFileName = "15-mini-project/samplePublicApi.ts";

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  strict: true,
  noEmit: true,
};

const program = ts.createProgram([targetFileName], compilerOptions);
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(targetFileName);

if (sourceFile === undefined) {
  throw new Error("Missing source file");
}

const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length > 0) {
  for (const diagnostic of diagnostics) {
    const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.error(`TS${diagnostic.code}: ${messageText}`);
  }

  process.exitCode = 1;
}

function hasExportModifier(node: ts.FunctionDeclaration): boolean {
  return node.modifiers?.some((modifier) => {
    return modifier.kind === ts.SyntaxKind.ExportKeyword;
  }) ?? false;
}

function symbolTypeText(symbol: ts.Symbol, location: ts.Node): string {
  const symbolType = checker.getTypeOfSymbolAtLocation(symbol, location);
  return checker.typeToString(symbolType);
}

function reportFunction(node: ts.FunctionDeclaration): FunctionReport | null {
  if (node.name === undefined) {
    return null;
  }

  const startPosition = node.getStart(sourceFile);
  const lineInfo = sourceFile.getLineAndCharacterOfPosition(startPosition);
  const functionType = checker.getTypeAtLocation(node.name);
  const callSignatures = functionType.getCallSignatures();
  const firstSignature = callSignatures[0];

  if (firstSignature === undefined) {
    return null;
  }

  const returnType = checker.getReturnTypeOfSignature(firstSignature);
  const parameters = firstSignature.getParameters().map((parameterSymbol) => {
    return {
      name: parameterSymbol.getName(),
      typeText: symbolTypeText(parameterSymbol, node),
    };
  });

  const returnTypeText = checker.typeToString(returnType);
  const parameterHasAny = parameters.some((parameter) => {
    return parameter.typeText === "any";
  });

  return {
    name: node.name.text,
    line: lineInfo.line + 1,
    character: lineInfo.character + 1,
    isExported: hasExportModifier(node),
    hasExplicitReturnType: node.type !== undefined,
    parameters,
    returnTypeText,
    exposesAny: parameterHasAny || returnTypeText === "any",
  };
}

const reports: FunctionReport[] = [];

function visitNode(node: ts.Node): void {
  if (ts.isFunctionDeclaration(node)) {
    const functionReport = reportFunction(node);

    if (functionReport !== null) {
      reports.push(functionReport);
    }
  }

  ts.forEachChild(node, visitNode);
}

visitNode(sourceFile);

const exportedReports = reports.filter((report) => report.isExported);

for (const report of exportedReports) {
  console.log(`Function: ${report.name}`);
  console.log(`Location: ${report.line}:${report.character}`);
  console.log(`Return: ${report.returnTypeText}`);
  console.log(`Explicit return type: ${String(report.hasExplicitReturnType)}`);
  console.log(`Exposes any: ${String(report.exposesAny)}`);

  for (const parameter of report.parameters) {
    console.log(`Parameter: ${parameter.name}: ${parameter.typeText}`);
  }

  console.log("---");
}

const internalReports = reports.filter((report) => !report.isExported);

console.log(`Exported functions: ${exportedReports.length}`);
console.log(`Internal functions: ${internalReports.length}`);

const unsafeReports = exportedReports.filter((report) => report.exposesAny);

if (unsafeReports.length > 0) {
  console.log("Unsafe public API detected");
  process.exitCode = 1;
}
```

### 对比 / 错误文件代码

`analyzePublicApiMistakes.ts`

```ts
// Goal:
// Show common mistakes when analyzing TypeScript source.

// Expected output:
// Print why AST-only analysis is incomplete.

import ts from "typescript";

const sourceText = `
export function inferReturnValue(titleText: string) {
  return titleText.toUpperCase();
}
`;

const sourceFile = ts.createSourceFile(
  "api.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
);

for (const statementNode of sourceFile.statements) {
  if (ts.isFunctionDeclaration(statementNode)) {
    console.log(statementNode.name?.text ?? "anonymous");
    console.log(statementNode.type?.getText(sourceFile) ?? "missing-explicit-return-type");
  }
}
```

`publicApiReportChecklist.md`

```md
# Public API Analyzer Checklist

## Required checks

- Exported function names are printed.
- Parameter names are printed.
- Parameter types are printed.
- Return types are printed.
- Missing explicit return annotations are reported.
- Public any usage is reported.
- Internal function count is printed.

## Upgrade tasks

- Add JSON report output.
- Add markdown report output.
- Fail CI when public any exists.
- Fail CI when exported functions miss return annotations.
- Support exported const arrow functions.
- Support re-exported functions.
- Support interface and type alias export reporting.
```

### 运行方式

```bash
npm run build
node dist/15-mini-project/analyzePublicApi.js
node dist/15-mini-project/analyzePublicApiMistakes.js
```

### 预期输出

```txt
Function: formatProductTitle
Location: 15:1
Return: string
Explicit return type: true
Exposes any: false
Parameter: product: ProductRecord
---
Function: calculateDiscountPrice
Location: 19:1
Return: number
Explicit return type: true
Exposes any: false
Parameter: priceCents: number
Parameter: discountRate: number
---
Function: createProductSummary
Location: 26:1
Return: ProductSummary
Explicit return type: true
Exposes any: false
Parameter: product: ProductRecord
---
Function: unsafeEcho
Location: 33:1
Return: any
Explicit return type: true
Exposes any: true
Parameter: value: any
---
Exported functions: 4
Internal functions: 1
Unsafe public API detected
```

### 完整执行过程

| 步骤 | 代码 | 发生什么 |
|---|---|---|
| 1 | `targetFileName` | 指向要分析的公开 API 文件。 |
| 2 | `createProgram` | 创建项目级编译上下文。 |
| 3 | `getTypeChecker` | 获取语义分析入口。 |
| 4 | `getSourceFile` | 取得目标文件 AST 根节点。 |
| 5 | `getPreEmitDiagnostics` | 检查目标文件是否有编译错误。 |
| 6 | `visitNode` | 递归遍历整个 AST。 |
| 7 | `ts.isFunctionDeclaration` | 找到函数声明。 |
| 8 | `reportFunction` | 把函数节点转换成报告对象。 |
| 9 | `hasExportModifier` | 判断函数是否带 `export`。 |
| 10 | `checker.getTypeAtLocation(node.name)` | 获取函数名对应的函数类型。 |
| 11 | `getCallSignatures()` | 读取函数调用签名。 |
| 12 | `getParameters()` | 读取参数符号。 |
| 13 | `getReturnTypeOfSignature()` | 读取返回类型对象。 |
| 14 | `typeToString()` | 把类型转换成可读文本。 |
| 15 | `exposesAny` | 判断参数或返回值是否是 `any`。 |
| 16 | `process.exitCode = 1` | 检测到不安全 public API 时设置失败退出码。 |

### API 角色表

| API | 在小项目中的角色 |
|---|---|
| `ts.createProgram` | 建立完整编译上下文 |
| `program.getSourceFile` | 获取目标源码文件 |
| `program.getTypeChecker` | 获取语义信息入口 |
| `ts.getPreEmitDiagnostics` | 防止在错误代码上生成误导报告 |
| `ts.forEachChild` | 遍历 AST |
| `ts.isFunctionDeclaration` | 精确识别函数声明 |
| `node.getStart` | 获取函数位置 |
| `sourceFile.getLineAndCharacterOfPosition` | 转换行列 |
| `checker.getTypeAtLocation` | 获取函数类型 |
| `type.getCallSignatures` | 获取函数签名 |
| `signature.getParameters` | 获取参数 |
| `checker.getReturnTypeOfSignature` | 获取返回类型 |
| `checker.typeToString` | 输出可读类型文本 |

### 常见错误

| 错误 | 后果 | 修正 |
|---|---|---|
| 只看 AST 的 `node.type` | 推导返回类型会显示缺失 | 用 TypeChecker 读取实际返回类型 |
| 只检查 `export function` | 漏掉 `export const fn = ...` | 后续扩展变量声明分析 |
| 只用字符串判断 `any` | 复杂 any 场景漏检 | 后续检查 `TypeFlags.Any` |
| 忽略 diagnostics | 错误源码可能产生误导报告 | 先收集诊断 |
| 不设置 exitCode | CI 无法感知失败 | 风险出现时设置非 0 退出码 |

### 可扩展任务

1. 支持 `export const normalize = (...) => ...`。
2. 支持 `export default function`。
3. 支持 re-export。
4. 支持输出 JSON 文件。
5. 支持输出 Markdown API 文档。
6. 支持检查 public API 是否缺少 JSDoc。
7. 支持检查 public API 是否暴露 `unknown`。
8. 支持检查 breaking changes：比较两次报告。
9. 接入 GitHub Actions，在 PR 中运行。
10. 将报告用于你的简历项目 SDK 或组件库。

### 和真实项目 / 简历项目的关系

这个小项目可以升级成“TypeScript Public API Guard”。真实价值很明确：在组件库、SDK、工具包中，自动阻止不安全的 public API 进入主分支。

### 最终记忆模型

```txt
A public API analyzer combines AST traversal and semantic type checking.
AST finds exported functions.
TypeChecker explains their parameter and return types.
Diagnostics protect the report from invalid source code.
```

---

## 11. 额外 cheatsheet

本次已补充独立 cheatsheet 文件：

```txt
typescript/compiler-api-intro/
  typescript-compiler-api-intro-cheatsheet-zh-v1.md
```

这份 cheatsheet 用于完成主体训练后的快速复习，不替代本指导文件。它覆盖 SourceFile、Node、SyntaxKind、Program、CompilerHost、Diagnostic、TypeChecker、Printer、Transformer、LanguageService、Watch API、module resolution、常见同名方法对比、options object 固定属性、IDE 警告和官方文档链接。

使用方式：

```bash
# Keep this file as a quick review reference after finishing the exercises.
```

---

## 12. 最终文件清单

```txt
typescript/compiler-api-intro/
  typescript-compiler-api-intro-learning-guide-zh-v1.md
  typescript-compiler-api-intro-cheatsheet-zh-v1.md

  package.json
  tsconfig.json

  00-compiler-api-problem-model/
    compilerApiOverview.ts
    compilerPipelineNotes.md

  01-sourcefile-parse/
    parseSourceText.ts
    parseScriptKind.ts
    sourceFileMistake.ts

  02-ast-traversal/
    traverseTopLevelNodes.ts
    recursiveTraversal.ts
    traversalMistake.ts

  03-syntaxkind-type-guards/
    inspectSyntaxKind.ts
    functionDeclarationGuard.ts
    unsafeCastMistake.ts

  04-node-position-text/
    nodePositionPrinter.ts
    nodeTextRange.ts
    positionMistake.ts

  05-printer-reprint/
    printSelectedNode.ts
    printFunctionSignatures.ts
    printerMistake.ts

  06-program-compilerhost/
    createProgramFromFiles.ts
    customCompilerHostWriteFile.ts
    missingFileMistake.ts

  07-diagnostics/
    collectDiagnostics.ts
    formatDiagnostics.ts
    diagnosticMistake.ts

  08-typechecker-symbols/
    inspectExportedSymbols.ts
    inspectIdentifierSymbol.ts
    symbolMistake.ts

  09-typechecker-types/
    inspectFunctionTypes.ts
    inspectVariableTypes.ts
    typeMistake.ts

  10-emit-transpile/
    emitProject.ts
    transpileSingleFile.ts
    transpileMistake.ts

  11-transformer-api/
    renameConsoleLogTransformer.ts
    addFunctionPrefixComment.ts
    transformerMistake.ts

  12-language-service-overview/
    simpleLanguageService.ts
    completionAtPosition.ts
    languageServiceNotes.md

  13-watch-program-overview/
    watchProgramSkeleton.ts
    watchProgramNotes.md

  14-module-resolution-boundary/
    traceResolvedModule.ts
    moduleResolutionHostNotes.md

  15-mini-project/
    samplePublicApi.ts
    analyzePublicApi.ts
    analyzePublicApiMistakes.ts
    publicApiReportChecklist.md
```

---

## 13. 最终学习笔记转换要求

练习完成后，把本专题整理成正式学习笔记。不要直接复制本指导文件。

正式笔记中，每个知识点按这个结构整理：

```md
## Topic name

### Conclusion

### Technical meaning

### Underlying mechanism

### API / syntax specification

### Code example

### Execution process

### Common mistake

### Final memory model
```

正式笔记必须包含这些对比：

| 对比 | 必须讲清楚 |
|---|---|
| SourceFile vs Program | 单文件语法树 vs 项目级编译上下文 |
| AST vs Symbol | 语法结构 vs 名字实体 |
| Symbol vs Type | 名字绑定 vs 静态类型 |
| `node.type` vs `checker.getTypeAtLocation()` | 显式注解节点 vs 实际推导类型 |
| `getText()` vs Printer | 原始源码片段 vs 根据 AST 生成文本 |
| `transpileModule()` vs `program.emit()` | 单文件转译 vs 项目级发射 |
| AST traversal vs TypeChecker | 语法扫描 vs 语义分析 |
| Diagnostic file error vs config error | 有文件位置 vs 无文件位置 |
| LanguageService vs Program | 长生命周期按需服务 vs 一次性项目上下文 |
| TypeScript module resolution vs Node runtime loading | 类型解析 vs 运行时加载 |

---

## 14. 本章最终记忆模型

```txt
Compiler API learning has three levels.

Syntax level:
  createSourceFile
  SourceFile
  Node
  SyntaxKind
  forEachChild
  node guards
  getText
  getStart

Project level:
  createProgram
  CompilerHost
  diagnostics
  emit
  module resolution

Semantic level:
  TypeChecker
  Symbol
  Type
  Signature
  typeToString
  exported API analysis

Tooling level:
  Printer
  Transformer
  LanguageService
  WatchProgram
  public API analyzer
```

最终一句话：

```txt
TypeScript Compiler API lets you turn TypeScript itself into project tooling.
You parse code as syntax, connect files as a Program, ask the TypeChecker for meaning, and use diagnostics, printers, transformers, and language services to build real engineering tools.
```

---

## 15. 官方文档阅读清单

按这个顺序读：

1. [TypeScript Wiki: Using the Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)  
   重点读 minimal compiler、transpileModule、re-printing nodes、AST traversal、watch program。

2. [TypeScript Wiki: Using the Language Service API](https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API)  
   重点读 overview、design goals、LanguageServiceHost、ScriptSnapshot。

3. [TypeScript Wiki: Architectural Overview](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)  
   重点理解编译器分层、数据结构、编译流程术语。

4. [TypeScript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)  
   复习模块边界，因为 Program、module symbol、export analysis 都依赖模块概念。

5. [TypeScript Handbook: Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)  
   复习 `.d.ts`，因为 Compiler API 经常用于生成或分析声明文件。

6. [TSConfig Reference: moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html)  
   复习模块解析配置，理解 TypeScript 如何解析 import specifier。

7. [TSConfig Reference: declaration](https://www.typescriptlang.org/tsconfig/declaration.html)  
   复习声明文件输出，理解 emit 和 public API 的关系。

8. [Node.js File system documentation](https://nodejs.org/api/fs.html)  
   只读 `readFileSync`、`writeFileSync`、`watchFile` 的基础用法，因为 Compiler API 脚本通常运行在 Node 环境。

---

## 16. 生成前自检清单

```txt
[checked] File is scoped to typescript/compiler-api-intro.
[checked] No notes directory is introduced.
[checked] Main text is Chinese.
[checked] Important terms include English terms.
[checked] Code variable names, function names, class names, and comments use English only.
[checked] Each core section includes conclusion, technical meaning, mechanism, API specification, code, execution process, common mistakes, and memory model.
[checked] Fixed API names, method names, parameters, and return values are listed.
[checked] IDE and tool warnings are explained through common mistake tables.
[checked] Official documentation links use normal Markdown links.
[checked] Example code is runnable or explicitly marked as a mistake example.
[checked] Recommended directory structure is complete.
[checked] Final mini project is included.
[checked] Cheatsheet file is generated and listed in the final file checklist.
[checked] Final file checklist is complete.
[checked] Run checklist is complete.
[checked] This file is a learning guide, not final notes.
```

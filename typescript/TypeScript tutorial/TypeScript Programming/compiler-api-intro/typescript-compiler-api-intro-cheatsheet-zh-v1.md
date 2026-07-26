# TypeScript Compiler API 入门 Cheatsheet v1

> 定位：这是 `typescript/compiler-api-intro/` 的快速复习表，不是主体学习指导文件。  
> 使用方式：先完成 `typescript-compiler-api-intro-learning-guide-zh-v1.md` 的训练，再用这份 cheatsheet 复盘 API、签名、参数、返回值和常见坑。  
> 代码规则：代码块中的变量名、函数名、字符串和注释使用英文。

---

## 目录

1. [核心 API 总览](#1-核心-api-总览)
2. [同名方法和相似概念对照](#2-同名方法和相似概念对照)
3. [参数签名速查](#3-参数签名速查)
4. [options object 固定属性名](#4-options-object-固定属性名)
5. [会修改外部状态或写文件的 API](#5-会修改外部状态或写文件的-api)
6. [不会立即输出或不会立即完整类型检查的 API](#6-不会立即输出或不会立即完整类型检查的-api)
7. [常见 IDE / TypeScript 警告](#7-常见-ide--typescript-警告)
8. [常用任务配方](#8-常用任务配方)
9. [Compiler API 学习时最容易混的边界](#9-compiler-api-学习时最容易混的边界)
10. [最终记忆模型](#10-最终记忆模型)
11. [官方文档链接](#11-官方文档链接)

---

## 1. 核心 API 总览

### 1.1 解析和语法树 API

| API / 类型 | 所属对象 | 常用签名 | 参数 | 返回值 | 是否修改原对象 | 常见坑 |
|---|---|---|---|---|---|---|
| `ts.createSourceFile()` | `typescript` module | `createSourceFile(fileName, sourceText, languageVersion, setParentNodes?, scriptKind?)` | `fileName` 文件名；`sourceText` 源码文本；`languageVersion` 目标脚本版本；`setParentNodes` 是否设置父节点；`scriptKind` 文件种类 | `ts.SourceFile` | 否 | 只解析语法，不做项目级类型检查。 |
| `ts.SourceFile` | `typescript` AST | interface | 保存源码文本、文件名、语句列表、AST 根节点信息 | AST 根节点对象 | 否 | 它是一个文件的语法树，不等于整个项目。 |
| `ts.Node` | `typescript` AST | interface | AST 节点基础接口 | 节点对象 | 否 | 只有语法信息，不天然包含静态类型结果。 |
| `ts.forEachChild()` | `typescript` module | `forEachChild(node, cbNode, cbNodes?)` | `node` 父节点；`cbNode` 子节点回调；`cbNodes` 节点数组回调 | 回调返回值或 `undefined` | 否 | 它只遍历语法子节点；不会自动递归，递归要你自己调用。 |
| `ts.visitEachChild()` | `typescript` module | `visitEachChild(node, visitor, context)` | `node` 当前节点；`visitor` 转换函数；`context` 转换上下文 | 更新后的节点 | 通常返回新节点 | 用于 transformer，不是普通只读遍历的首选。 |
| `ts.SyntaxKind` | `typescript` enum | `ts.SyntaxKind.FunctionDeclaration` | 固定枚举成员 | number enum value | 否 | 输出数字时要用 `ts.SyntaxKind[node.kind]` 转回名字。 |
| `ts.isFunctionDeclaration()` | `typescript` module | `isFunctionDeclaration(node)` | 任意节点 | `node is ts.FunctionDeclaration` | 否 | 运行时判断节点种类，同时帮 TS 缩小类型。 |
| `ts.isVariableStatement()` | `typescript` module | `isVariableStatement(node)` | 任意节点 | `node is ts.VariableStatement` | 否 | 变量语句和变量声明不是同一个节点层级。 |
| `ts.isIdentifier()` | `typescript` module | `isIdentifier(node)` | 任意节点 | `node is ts.Identifier` | 否 | 标识符只是名字节点，不等于它绑定到的 symbol。 |
| `node.getText()` | `ts.Node` method | `node.getText(sourceFile?)` | 可选 `sourceFile` | 原始源码片段字符串 | 否 | 返回原源码文本，不是格式化后的代码。 |
| `node.getStart()` | `ts.Node` method | `node.getStart(sourceFile?, includeJsDocComment?)` | 可选源文件；是否包含 JSDoc | 起始位置 number | 否 | 通常比直接用 `node.pos` 更适合报错位置。 |
| `node.getFullStart()` | `ts.Node` method | `node.getFullStart()` | none | 起始位置 number | 否 | 包含 trivia，例如注释和空白。 |
| `sourceFile.getLineAndCharacterOfPosition()` | `ts.SourceFile` method | `getLineAndCharacterOfPosition(position)` | 字符偏移位置 | `{ line, character }` | 否 | `line` 和 `character` 都是 0-based，显示给人看通常要加 1。 |

### 1.2 打印和生成源码 API

| API / 类型 | 所属对象 | 常用签名 | 参数 | 返回值 | 是否修改原对象 | 常见坑 |
|---|---|---|---|---|---|---|
| `ts.createPrinter()` | `typescript` module | `createPrinter(printerOptions?, handlers?)` | `printerOptions` 打印选项；`handlers` 打印通知 | `ts.Printer` | 否 | Printer 根据 AST 打印，不保证完全保留原始格式。 |
| `printer.printNode()` | `ts.Printer` method | `printNode(hint, node, sourceFile)` | `hint` 发射提示；`node` 节点；`sourceFile` 上下文 | string | 否 | 需要传入 SourceFile 作为上下文。 |
| `printer.printFile()` | `ts.Printer` method | `printFile(sourceFile)` | SourceFile | string | 否 | 适合打印整个文件。 |
| `ts.EmitHint` | `typescript` enum | `ts.EmitHint.Unspecified` | 固定枚举值 | number enum value | 否 | `Expression`、`IdentifierName`、`JsxAttributeValue` 等 hint 会影响打印方式。 |
| `ts.factory` | `typescript` namespace object | `ts.factory.createXxx()` / `ts.factory.updateXxx()` | 节点构造参数 | 新节点或更新节点 | 不建议原地修改 | 现代 transformer 优先用 `ts.factory`，不要依赖旧的 `ts.createXxx` / `ts.updateXxx`。 |

### 1.3 Program、CompilerHost 和诊断 API

| API / 类型 | 所属对象 | 常用签名 | 参数 | 返回值 | 是否修改外部状态 | 常见坑 |
|---|---|---|---|---|---|---|
| `ts.createProgram()` | `typescript` module | `createProgram(rootNames, options, host?, oldProgram?, configFileParsingDiagnostics?)` | root 文件数组；编译选项；可选 host | `ts.Program` | 可能读取文件系统 | Program 是项目级上下文，不只是一个文件。 |
| `ts.createCompilerHost()` | `typescript` module | `createCompilerHost(options, setParentNodes?)` | 编译选项；是否设置 parent | `ts.CompilerHost` | 创建 host 本身不写文件 | 默认 host 会通过 `ts.sys` 读写文件系统。 |
| `program.getSourceFile()` | `ts.Program` method | `getSourceFile(fileName)` | 文件名 | `ts.SourceFile | undefined` | 否 | 文件没进入 Program 时返回 `undefined`。 |
| `program.getSourceFiles()` | `ts.Program` method | `getSourceFiles()` | none | `readonly SourceFile[]` | 否 | 包含库声明文件，筛选时要排除 `node_modules` 或 lib 文件。 |
| `program.getTypeChecker()` | `ts.Program` method | `getTypeChecker()` | none | `ts.TypeChecker` | 否 | TypeChecker 必须来自 Program。 |
| `program.emit()` | `ts.Program` method | `emit(targetSourceFile?, writeFile?, cancellationToken?, emitOnlyDtsFiles?, customTransformers?)` | 可选目标文件；写文件函数；取消 token；是否只发声明；自定义转换器 | `ts.EmitResult` | 可能写文件 | 是否写到磁盘取决于 host / `writeFile`。 |
| `ts.getPreEmitDiagnostics()` | `typescript` module | `getPreEmitDiagnostics(program, sourceFile?, cancellationToken?)` | Program；可选文件；可选取消 token | `readonly Diagnostic[]` | 否 | 不包含 emit 过程中产生的所有 diagnostics。 |
| `ts.flattenDiagnosticMessageText()` | `typescript` module | `flattenDiagnosticMessageText(messageText, newLine)` | diagnostic message；换行符 | string | 否 | `messageText` 可能是嵌套链，不一定是普通字符串。 |
| `ts.formatDiagnosticsWithColorAndContext()` | `typescript` module | `formatDiagnosticsWithColorAndContext(diagnostics, host)` | diagnostics；format host | string | 否 | 需要 host 提供当前目录、换行符和文件名规范化函数。 |
| `ts.Diagnostic` | `typescript` type | object shape | `code`、`category`、`messageText`、`file`、`start`、`length` | diagnostic object | 否 | config 级错误可能没有 `file` 和 `start`。 |

### 1.4 TypeChecker、Symbol 和 Type API

| API / 类型 | 所属对象 | 常用签名 | 参数 | 返回值 | 是否修改原对象 | 常见坑 |
|---|---|---|---|---|---|---|
| `checker.getSymbolAtLocation()` | `ts.TypeChecker` method | `getSymbolAtLocation(node)` | 名字相关节点 | `ts.Symbol | undefined` | 否 | 对任意节点都可能返回 `undefined`。 |
| `checker.getTypeAtLocation()` | `ts.TypeChecker` method | `getTypeAtLocation(node)` | AST 节点 | `ts.Type` | 否 | 这是实际推导或计算结果，不等于源码里的注解节点。 |
| `checker.getTypeOfSymbolAtLocation()` | `ts.TypeChecker` method | `getTypeOfSymbolAtLocation(symbol, node)` | symbol；上下文节点 | `ts.Type` | 否 | 需要 symbol 和位置上下文一起使用。 |
| `checker.getExportsOfModule()` | `ts.TypeChecker` method | `getExportsOfModule(moduleSymbol)` | 模块 symbol | `ts.Symbol[]` | 否 | 只有模块 symbol 才适合传入。 |
| `checker.typeToString()` | `ts.TypeChecker` method | `typeToString(type, enclosingDeclaration?, flags?)` | type；可选上下文；可选 flags | string | 否 | 输出是展示用字符串，不是可稳定解析的 schema。 |
| `checker.symbolToString()` | `ts.TypeChecker` method | `symbolToString(symbol, enclosingDeclaration?, meaning?, flags?)` | symbol；上下文；含义；flags | string | 否 | symbol 名字和 type 展示不是同一件事。 |
| `checker.getSignaturesOfType()` | `ts.TypeChecker` method | `getSignaturesOfType(type, kind)` | type；signature kind | `readonly Signature[]` | 否 | 函数类型、构造函数类型要用不同的 `SignatureKind`。 |
| `checker.getReturnTypeOfSignature()` | `ts.TypeChecker` method | `getReturnTypeOfSignature(signature)` | signature | `ts.Type` | 否 | 先拿 signature，再拿返回类型。 |
| `ts.Symbol` | `typescript` type | object | `name`、`flags`、`declarations` 等 | 名字实体 | 否 | Symbol 代表名字绑定，不代表所有类型细节。 |
| `ts.Type` | `typescript` type | object | `flags`、`symbol`、`aliasSymbol` 等 | 静态类型对象 | 否 | Type 不是运行时构造函数。 |

### 1.5 发射、转译和转换 API

| API / 类型 | 所属对象 | 常用签名 | 参数 | 返回值 | 是否修改外部状态 | 常见坑 |
|---|---|---|---|---|---|---|
| `program.emit()` | `ts.Program` method | `emit(...)` | 见上表 | `ts.EmitResult` | 可能写文件 | 项目级发射，会基于 Program 和 CompilerOptions。 |
| `ts.transpileModule()` | `typescript` module | `transpileModule(input, transpileOptions)` | 单个源码字符串；转译选项 | `ts.TranspileOutput` | 否 | 只转译单文件，不做完整项目级类型检查。 |
| `ts.transform()` | `typescript` module | `transform(source, transformers, compilerOptions?)` | 源节点或节点数组；转换器；选项 | `ts.TransformationResult<T>` | 否 | 需要调用 `dispose()` 释放转换结果资源。 |
| `ts.TransformerFactory<T>` | `typescript` type | `(context) => transformer` | transform context | transformer function | 否 | factory 返回 visitor 或 root transformer。 |
| `ts.visitNode()` | `typescript` module | `visitNode(node, visitor, test?, lift?)` | 当前节点；visitor | 更新后的节点 | 否 | 常用于处理 root node。 |
| `ts.visitEachChild()` | `typescript` module | `visitEachChild(node, visitor, context)` | 当前节点；visitor；context | 更新后的节点 | 否 | 用于递归转换子节点。 |

### 1.6 LanguageService、Watch 和模块解析 API

| API / 类型 | 所属对象 | 常用签名 | 参数 | 返回值 | 是否有内部状态 | 常见坑 |
|---|---|---|---|---|---|---|
| `ts.createLanguageService()` | `typescript` module | `createLanguageService(host, documentRegistry?, syntaxOnly?)` | LanguageServiceHost；可选文档注册表；是否只语法服务 | `ts.LanguageService` | 是 | 适合编辑器能力，不适合一次性脚本优先选择。 |
| `ts.ScriptSnapshot.fromString()` | `typescript` module | `fromString(text)` | 文件文本 | `ts.IScriptSnapshot` | 否 | LanguageService 通过 snapshot 读取某一版本文本。 |
| `languageService.getSemanticDiagnostics()` | `ts.LanguageService` method | `getSemanticDiagnostics(fileName)` | 文件名 | `Diagnostic[]` | 使用服务缓存 | 需要 host 提供脚本版本和 snapshot。 |
| `languageService.getCompletionsAtPosition()` | `ts.LanguageService` method | `getCompletionsAtPosition(fileName, position, options)` | 文件名；位置；补全选项 | `CompletionInfo | undefined` | 使用服务缓存 | 位置是字符偏移，不是行列号。 |
| `ts.findConfigFile()` | `typescript` module | `findConfigFile(searchPath, fileExists, configName?)` | 搜索路径；文件存在函数；配置名 | `string | undefined` | 可能读文件系统 | 找不到配置时返回 `undefined`。 |
| `ts.readConfigFile()` | `typescript` module | `readConfigFile(fileName, readFile)` | 配置文件名；读文件函数 | `{ config?, error? }` | 可能读文件 | 只读 JSON，不负责解析 include / extends。 |
| `ts.parseJsonConfigFileContent()` | `typescript` module | `parseJsonConfigFileContent(json, host, basePath, existingOptions?, configFileName?)` | JSON；解析 host；base path；已有选项；配置文件名 | `ParsedCommandLine` | 可能访问文件系统 | 解析后的 `fileNames` 才是 Program 的 rootNames。 |
| `ts.createWatchCompilerHost()` | `typescript` module | `createWatchCompilerHost(configFileName, optionsToExtend, system, createProgram?, reportDiagnostic?, reportWatchStatusChanged?)` | 配置路径；额外选项；系统接口；builder 策略；报告函数 | Watch host | 是 | 会用于创建长期 watch program。 |
| `ts.createWatchProgram()` | `typescript` module | `createWatchProgram(host)` | watch host | `WatchOfConfigFile<BuilderProgram>` | 是 | 会监听文件变化，不适合普通一次性脚本。 |
| `ts.resolveModuleName()` | `typescript` module | `resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost)` | specifier；包含文件；选项；解析 host | `ResolvedModuleWithFailedLookupLocations` | 可能读文件 | TypeScript 解析成功不等于 Node 运行时一定能加载成功。 |

---

## 2. 同名方法和相似概念对照

| 对比 | 左边含义 | 右边含义 | 判断规则 |
|---|---|---|---|
| `SourceFile` vs `Program` | 单个文件的源码文本和 AST 根节点 | 多个文件组成的项目级编译上下文 | 只看语法用 SourceFile；需要类型、模块和 diagnostics 用 Program。 |
| `Node` vs `Symbol` | 源码中的语法结构 | 绑定阶段创建的名字实体 | 节点是“写了什么”；symbol 是“这个名字绑定到谁”。 |
| `Symbol` vs `Type` | 名字实体 | 静态类型结果 | 一个 symbol 可以有类型；一个 type 也可能没有直接 symbol。 |
| `node.type` vs `checker.getTypeAtLocation(node)` | 源码里显式写的类型注解节点 | TypeChecker 计算出来的实际类型 | 没写注解时 `node.type` 可能不存在，但 checker 仍可推导类型。 |
| `getText()` vs `printer.printNode()` | 从原源码截取文本 | 从 AST 重新生成文本 | 保留原始片段用 `getText()`；生成规范化文本用 Printer。 |
| `node.pos` vs `node.getStart()` | 包含前导 trivia 的原始位置 | 更适合用户报错的位置 | 报错位置通常用 `getStart()`。 |
| `forEachChild()` vs `visitEachChild()` | 只读遍历子节点 | transformer 中访问并可能替换子节点 | 分析用 `forEachChild()`；转换用 `visitEachChild()`。 |
| `createSourceFile()` vs `program.getSourceFile()` | 从字符串解析一个 SourceFile | 从 Program 中读取已纳入项目的 SourceFile | 单文件实验用前者；项目分析用后者。 |
| `getPreEmitDiagnostics()` vs `emitResult.diagnostics` | 发射前的语法、语义、配置等诊断 | 发射过程产生的诊断 | 完整编译结果通常两者合并。 |
| `program.emit()` vs `transpileModule()` | 项目级发射 | 单文件字符串转译 | 需要类型检查用 Program；快速语法转译用 `transpileModule()`。 |
| `LanguageService` vs `Program` | 长生命周期编辑器服务 | 一次性或项目级编译上下文 | IDE 能力用 LanguageService；CLI 分析工具优先 Program。 |
| `CompilerHost` vs `LanguageServiceHost` | 编译器读写文件的抽象 | 编辑器服务读取脚本、版本和快照的抽象 | build 工具用 CompilerHost；编辑器工具用 LanguageServiceHost。 |
| TypeScript module resolution vs Node runtime loading | 编译期解析类型和文件 | 运行时加载 JavaScript 文件 | TS 找得到类型，不代表运行时路径一定存在。 |

---

## 3. 参数签名速查

### 3.1 `createSourceFile()`

```ts
const sourceFile = ts.createSourceFile(
  fileName,
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);
```

| 参数 | 类型 | 是否可选 | 含义 |
|---|---|---:|---|
| `fileName` | `string` | 否 | 源文件名，影响脚本种类推断和错误显示。 |
| `sourceText` | `string` | 否 | 要解析的源码文本。 |
| `languageVersion` | `ts.ScriptTarget` | 否 | 解析时使用的 ECMAScript 目标版本。 |
| `setParentNodes` | `boolean` | 是 | 是否给节点设置 `parent` 引用。 |
| `scriptKind` | `ts.ScriptKind` | 是 | `TS`、`TSX`、`JS`、`JSX` 等脚本种类。 |

### 3.2 `createProgram()`

```ts
const program = ts.createProgram(rootNames, compilerOptions, compilerHost);
```

| 参数 | 类型 | 是否可选 | 含义 |
|---|---|---:|---|
| `rootNames` | `readonly string[]` | 否 | 项目入口文件列表。 |
| `options` | `ts.CompilerOptions` | 否 | 编译配置对象。 |
| `host` | `ts.CompilerHost` | 是 | 文件系统抽象；省略时使用默认 host。 |
| `oldProgram` | `ts.Program` | 是 | 增量场景可复用旧 Program。 |
| `configFileParsingDiagnostics` | `readonly ts.Diagnostic[]` | 是 | 配置解析诊断。 |

### 3.3 `program.emit()`

```ts
const emitResult = program.emit(
  undefined,
  writeFile,
  undefined,
  false,
  customTransformers,
);
```

| 参数 | 类型 | 是否可选 | 含义 |
|---|---|---:|---|
| `targetSourceFile` | `ts.SourceFile` | 是 | 只发射指定源文件。 |
| `writeFile` | `ts.WriteFileCallback` | 是 | 自定义写文件函数。 |
| `cancellationToken` | `ts.CancellationToken` | 是 | 取消发射。 |
| `emitOnlyDtsFiles` | `boolean` | 是 | 是否只输出 `.d.ts`。 |
| `customTransformers` | `ts.CustomTransformers` | 是 | 自定义 transformer。 |

### 3.4 `transpileModule()`

```ts
const output = ts.transpileModule(sourceText, {
  compilerOptions: {
    module: ts.ModuleKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "input.ts",
  reportDiagnostics: true,
});
```

| 参数 / 属性 | 类型 | 是否可选 | 含义 |
|---|---|---:|---|
| `input` | `string` | 否 | 单文件源码文本。 |
| `compilerOptions` | `ts.CompilerOptions` | 是 | 转译选项。 |
| `fileName` | `string` | 是 | 虚拟文件名。 |
| `reportDiagnostics` | `boolean` | 是 | 是否返回有限诊断。 |
| `transformers` | `ts.CustomTransformers` | 是 | 自定义 transformer。 |
| `moduleName` | `string` | 是 | AMD / System 等场景的模块名。 |

### 3.5 `resolveModuleName()`

```ts
const resolved = ts.resolveModuleName(
  moduleName,
  containingFile,
  compilerOptions,
  moduleResolutionHost,
);
```

| 参数 | 类型 | 是否可选 | 含义 |
|---|---|---:|---|
| `moduleName` | `string` | 否 | import specifier，例如 `./api.js` 或 `typescript`。 |
| `containingFile` | `string` | 否 | 发起导入的文件。 |
| `compilerOptions` | `ts.CompilerOptions` | 否 | 模块解析配置。 |
| `moduleResolutionHost` | `ts.ModuleResolutionHost` | 否 | 读文件和判断文件存在的 host。 |

---

## 4. options object 固定属性名

### 4.1 `CompilerOptions` 常用属性

| 固定属性名 | 常用值 | 作用 | 常见坑 |
|---|---|---|---|
| `target` | `ts.ScriptTarget.ES2022` | 控制输出 JavaScript 目标版本。 | 影响语法降级，不等于运行时 polyfill。 |
| `module` | `ts.ModuleKind.NodeNext` / `CommonJS` / `ESNext` | 控制模块输出格式。 | 和 `package.json`、Node、bundler 规则要一致。 |
| `moduleResolution` | `ts.ModuleResolutionKind.NodeNext` / `Bundler` | 控制 import specifier 如何解析。 | TS 解析成功不代表 runtime 一定成功。 |
| `strict` | `true` | 打开严格类型检查族。 | 真实工具建议默认开启。 |
| `noEmitOnError` | `true` | 有错误时跳过输出。 | 和 `emitSkipped` 一起判断 CI 状态。 |
| `declaration` | `true` | 输出 `.d.ts`。 | 通常配合库发布或 API 分析。 |
| `emitDeclarationOnly` | `true` | 只输出声明文件。 | 仍然需要 `declaration: true`。 |
| `allowJs` | `true` | 允许 JS 进入 Program。 | 互操作和迁移项目常用。 |
| `checkJs` | `true` | 检查 JS 文件。 | 大项目迁移时要分阶段开启。 |
| `jsx` | `ts.JsxEmit.ReactJSX` | 控制 JSX 输出模式。 | TSX 分析必须正确设置 script kind 和 jsx。 |
| `types` | `string[]` | 限制进入全局环境的 `@types` 包。 | 配错会让 `node`、`vitest`、`jest` 等全局类型消失。 |
| `lib` | `string[]` | 指定内置库声明。 | 缺 `DOM` 会导致浏览器类型不存在。 |
| `skipLibCheck` | `true` / `false` | 跳过声明文件检查。 | 加快检查，但可能隐藏第三方类型问题。 |

### 4.2 `PrinterOptions` 常用属性

| 固定属性名 | 类型 | 作用 | 常见坑 |
|---|---|---|---|
| `newLine` | `ts.NewLineKind` | 控制换行符。 | 常用 `ts.NewLineKind.LineFeed`。 |
| `removeComments` | `boolean` | 是否移除注释。 | 对重印节点输出有影响。 |
| `omitTrailingSemicolon` | `boolean` | 是否省略尾部分号。 | 只影响打印结果，不改变 AST 语义。 |
| `noEmitHelpers` | `boolean` | 是否不输出 helper。 | 和实际 emit helper 行为有关。 |

### 4.3 `CustomTransformers` 固定属性名

| 固定属性名 | 类型 | 执行阶段 | 作用 |
|---|---|---|---|
| `before` | `TransformerFactory<SourceFile>[]` | TypeScript 转换之前 | 常用于分析或替换 TS AST。 |
| `after` | `TransformerFactory<SourceFile>[]` | JavaScript 转换之后 | 常用于处理 JS 输出阶段 AST。 |
| `afterDeclarations` | `TransformerFactory<Bundle | SourceFile>[]` | 声明文件输出阶段 | 常用于处理 `.d.ts` AST。 |

### 4.4 `LanguageServiceHost` 常见方法名

| 方法名 | 常用签名 | 返回值 | 必要性 |
|---|---|---|---|
| `getScriptFileNames()` | `() => string[]` | 文件名列表 | 必需 |
| `getScriptVersion(fileName)` | `(fileName: string) => string` | 版本字符串 | 必需 |
| `getScriptSnapshot(fileName)` | `(fileName: string) => IScriptSnapshot | undefined` | 文件快照 | 必需 |
| `getCurrentDirectory()` | `() => string` | 当前目录 | 必需 |
| `getCompilationSettings()` | `() => CompilerOptions` | 编译选项 | 必需 |
| `getDefaultLibFileName(options)` | `(options: CompilerOptions) => string` | 默认 lib 文件名 | 必需 |
| `fileExists(fileName)` | `(fileName: string) => boolean` | 文件是否存在 | 常用 |
| `readFile(fileName)` | `(fileName: string) => string | undefined` | 文件内容 | 常用 |
| `readDirectory(...)` | function | 文件列表 | 常用 |

---

## 5. 会修改外部状态或写文件的 API

| API | 是否修改外部状态 | 具体副作用 | 安全用法 |
|---|---:|---|---|
| `program.emit()` | 可能 | 默认 host 或自定义 `writeFile` 可能写 `.js`、`.d.ts`、`.map`。 | 学习阶段传入自定义 `writeFile`，先把输出存在内存对象里。 |
| `ts.createWatchProgram()` | 是 | 启动文件监听，长期运行。 | 只在 watch 工具里使用，普通脚本不要随手调用。 |
| `CompilerHost.writeFile()` | 是 | 写输出文件。 | 可以重写为内存写入函数。 |
| transformer visitor | 不应该原地修改 | 错误写法可能直接改旧节点对象。 | 使用 `ts.factory.updateXxx()` 返回新节点。 |
| Node `fs.writeFileSync()` | 是 | 直接写磁盘。 | 先输出到临时目录或使用 dry-run。 |

---

## 6. 不会立即输出或不会立即完整类型检查的 API

| API | 不会做什么 | 正确理解 |
|---|---|---|
| `ts.createSourceFile()` | 不会检查跨文件类型，不会解析模块依赖，不会发射 JS。 | 它只把源码文本解析成 AST。 |
| `ts.forEachChild()` | 不会自动深度遍历整棵树。 | 回调里要递归调用。 |
| `checker.getTypeAtLocation()` | 不会改变源码，也不会生成类型声明。 | 它只查询 TypeChecker 的类型结果。 |
| `ts.transpileModule()` | 不做完整项目级类型检查。 | 它适合快速单文件转译，不适合当作严格 CI 检查。 |
| `ts.createPrinter()` | 不会保留所有原始格式。 | 它从 AST 生成文本，输出可能和原源码格式不同。 |
| `declare module` | 不会安装或实现模块。 | 它只改变 TypeScript 的静态类型视图。 |
| `resolveModuleName()` | 不保证 Node 运行时一定能加载。 | 它模拟 TypeScript 的模块解析，不是 runtime loader。 |

---

## 7. 常见 IDE / TypeScript 警告

| 警告 / 现象 | 类型 | 原因 | 处理方式 |
|---|---|---|---|
| `Cannot find module 'typescript'` | 类型检查错误 / 运行时错误 | 当前项目没有安装 `typescript`，或 IDE 没指向项目 `node_modules`。 | 在当前 `typescript/` 或专题目录安装 `typescript`，并检查 IDE TypeScript 设置。 |
| `Cannot find module 'node:fs'` | 类型检查错误 | 没安装或没引入 Node 类型。 | 安装 `@types/node`，并检查 `types` / `moduleResolution`。 |
| `Property 'name' does not exist on type 'Node'` | 类型检查错误 | 没用 `ts.isFunctionDeclaration()` 等 type guard 缩小节点。 | 先用节点类型防护函数，再访问具体属性。 |
| `Object is possibly 'undefined'` | 类型检查错误 | `program.getSourceFile()`、`getSymbolAtLocation()` 等 API 可能找不到结果。 | 先做 `undefined` 分支处理。 |
| `node.parent is undefined` | 运行时问题 / 类型假设错误 | `createSourceFile()` 没设置 `setParentNodes: true`，或节点来自特殊场景。 | 需要 parent 时开启 `setParentNodes`，不要无条件假设存在。 |
| `Debug Failure. Unhandled SyntaxKind` | 运行时错误 | transformer 返回了不合法节点，或在错误上下文返回了错误节点类型。 | 确保 visitor 返回的节点适合当前位置。 |
| `Unused '@ts-expect-error' directive` | 类型检查错误 | 你预期的错误没有发生。 | 检查示例是否真的触发类型错误。 |
| WebStorm / IDE 对 Compiler API 类型显示不完整 | IDE 静态检查问题 | IDE 使用的 TypeScript 版本和项目版本不同。 | 让 IDE 使用项目 `node_modules/typescript`。 |
| `ts.createXxx` / `ts.updateXxx` 找不到 | API 版本差异 | 旧 factory API 已被现代 `ts.factory` 取代。 | 使用 `ts.factory.createXxx()` 和 `ts.factory.updateXxx()`。 |

---

## 8. 常用任务配方

### 8.1 解析字符串为 SourceFile

```ts
import ts from "typescript";

const sourceText = "export function add(left: number, right: number) { return left + right; }";

const sourceFile = ts.createSourceFile(
  "sample.ts",
  sourceText,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

console.log(sourceFile.statements.length);
```

### 8.2 递归遍历 AST

```ts
import ts from "typescript";

function walkNode(node: ts.Node, sourceFile: ts.SourceFile): void {
  console.log(ts.SyntaxKind[node.kind], node.getText(sourceFile));
  ts.forEachChild(node, (childNode) => walkNode(childNode, sourceFile));
}
```

### 8.3 收集 diagnostics

```ts
import ts from "typescript";

const program = ts.createProgram(["src/index.ts"], {
  strict: true,
  noEmitOnError: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
});

const emitResult = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

for (const diagnostic of diagnostics) {
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  console.log(messageText);
}
```

### 8.4 查询函数返回类型

```ts
import ts from "typescript";

function getFunctionReturnTypeText(
  checker: ts.TypeChecker,
  node: ts.FunctionDeclaration,
): string {
  const functionType = checker.getTypeAtLocation(node);
  const signatures = checker.getSignaturesOfType(functionType, ts.SignatureKind.Call);
  const firstSignature = signatures[0];

  if (firstSignature === undefined) {
    return "unknown";
  }

  const returnType = checker.getReturnTypeOfSignature(firstSignature);
  return checker.typeToString(returnType);
}
```

### 8.5 in-memory emit

```ts
import ts from "typescript";

const createdFiles = new Map<string, string>();
const options: ts.CompilerOptions = {
  declaration: true,
  emitDeclarationOnly: true,
};

const host = ts.createCompilerHost(options);
host.writeFile = (fileName, contents) => {
  createdFiles.set(fileName, contents);
};

const program = ts.createProgram(["src/index.ts"], options, host);
program.emit();

console.log([...createdFiles.keys()]);
```

### 8.6 最小 transformer 结构

```ts
import ts from "typescript";

const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (context) => {
  const visitor: ts.Visitor = (node) => {
    return ts.visitEachChild(node, visitor, context);
  };

  return (sourceFile) => ts.visitNode(sourceFile, visitor, ts.isSourceFile);
};
```

---

## 9. Compiler API 学习时最容易混的边界

| 边界 | 错误理解 | 正确模型 |
|---|---|---|
| 语法分析 vs 类型检查 | 有 AST 就能知道所有类型 | AST 只知道语法结构；类型要问 TypeChecker。 |
| 类型注解 vs 推导类型 | `node.type` 就是最终类型 | `node.type` 只是显式注解；最终类型来自 checker。 |
| 编译期类型 vs 运行时值 | `Type` 能在运行时验证 JSON | `Type` 只存在于编译器内部，运行时验证要自己写。 |
| 发射 vs 转译 | `transpileModule()` 可以替代 `tsc --noEmit` | 它不做完整项目检查，不能替代严格 CI。 |
| 打印 AST vs 格式化代码 | Printer 是 Prettier | Printer 是 AST 输出器，不是完整代码格式化器。 |
| 模块解析 vs 模块加载 | TypeScript 能 resolve 就能运行 | 运行时还要 Node 或 bundler 找到真实 JS 文件。 |
| transformer vs linter | transformer 只是报告问题 | transformer 的职责是返回修改后的 AST；只报告问题更像 linter。 |
| LanguageService vs CLI 工具 | 所有工具都该用 LanguageService | 一次性分析工具优先 Program；编辑器能力才考虑 LanguageService。 |

---

## 10. 最终记忆模型

```txt
Compiler API has four working layers.

Syntax layer:
  source text
  createSourceFile
  SourceFile
  Node
  SyntaxKind
  forEachChild
  type guards

Project layer:
  createProgram
  CompilerHost
  CompilerOptions
  diagnostics
  emit
  module resolution

Semantic layer:
  TypeChecker
  Symbol
  Type
  Signature
  typeToString
  public API analysis

Tooling layer:
  Printer
  Transformer
  LanguageService
  WatchProgram
  CI analyzer
```

一句话：

```txt
Use SourceFile to see syntax, Program to see the project, TypeChecker to ask meaning, and emit or transformers only after you know which layer you are operating on.
```

---

## 11. 官方文档链接

- [TypeScript Wiki: Using the Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [TypeScript Wiki: Using the Language Service API](https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API)
- [TypeScript Wiki: Architectural Overview](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)
- [TypeScript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [TypeScript Handbook: Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [TSConfig Reference: moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html)
- [TSConfig Reference: declaration](https://www.typescriptlang.org/tsconfig/declaration.html)
- [Node.js File system documentation](https://nodejs.org/api/fs.html)
- [AST Viewer](https://ts-ast-viewer.com/)


# TypeScript 类型系统性能 Cheatsheet v1

> 路径：`typescript/type-system-performance/typescript-type-system-performance-cheatsheet-zh-v1.md`  
> 定位：这是完成 `typescript/type-system-performance/` 训练后的快速复习表，不替代正文指导文件。  
> 代码规则：示例命令和代码注释不使用中文字符。

---

## 目录

1. [1. 核心命令总览](#1-核心命令总览)
2. [2. TSConfig 性能相关配置](#2-tsconfig-性能相关配置)
3. [3. 慢类型模式速查](#3-慢类型模式速查)
4. [4. 同名 / 相似概念对照](#4-同名--相似概念对照)
5. [5. 参数签名速查](#5-参数签名速查)
6. [6. options object 固定属性名](#6-options-object-固定属性名)
7. [7. 会修改文件或产生输出的方法](#7-会修改文件或产生输出的方法)
8. [8. 不会立即优化性能的诊断工具](#8-不会立即优化性能的诊断工具)
9. [9. 常见 IDE 警告和卡顿来源](#9-常见-ide-警告和卡顿来源)
10. [10. 优化决策表](#10-优化决策表)
11. [11. 最终记忆模型](#11-最终记忆模型)
12. [12. 官方文档链接](#12-官方文档链接)

---

## 1. 核心命令总览

| 命令 | 所属对象 | 作用 | 返回 / 输出 | 是否修改文件 | 常见坑 |
|---|---|---|---|---|---|
| `npx tsc --noEmit` | TypeScript CLI | 只做类型检查 | 诊断信息 | 否 | 不输出 JS，不代表没有检查。 |
| `npx tsc --extendedDiagnostics` | TypeScript CLI | 输出性能指标 | stdout 指标 | 否 | 不要只看 `Total time`。 |
| `npx tsc --generateTrace ./trace-output` | TypeScript CLI | 生成性能追踪 | `trace.json`、`types.json` | 是 | 不要放进日常 CI。 |
| `npx tsc --noErrorTruncation` | TypeScript CLI | 不截断错误信息 | 更长错误文本 | 否 | 不是性能优化。 |
| `npx tsc --listFilesOnly` | TypeScript CLI | 列出 program 文件 | 文件路径列表 | 否 | 不解释为什么被包含。 |
| `npx tsc --explainFiles` | TypeScript CLI | 解释文件进入原因 | 文件来源说明 | 否 | 输出很长，要保存对比。 |
| `npx tsc --traceResolution` | TypeScript CLI | 追踪模块解析 | 解析日志 | 否 | 适合查路径，不适合日常使用。 |
| `npx tsc --showConfig` | TypeScript CLI | 展开最终配置 | JSON 配置 | 否 | 不执行类型检查。 |
| `npx tsc -b` | TypeScript CLI | 构建 project references | 构建输出 | 可能 | 需要 `composite` 和 `references`。 |
| `npx tsc -b --clean` | TypeScript CLI | 清理 build mode 输出 | 删除构建产物 | 是 | 只清理引用项目相关输出。 |

---

## 2. TSConfig 性能相关配置

| 配置项 | 类型 | 作用 | 常见取值 | 常见坑 |
|---|---|---|---|---|
| `include` | `string[]` | 指定根文件搜索范围 | `["src/**/*.ts"]` | 太宽会纳入构建产物和测试夹具。 |
| `exclude` | `string[]` | 从搜索范围排除路径 | `["dist", "coverage"]` | 不阻止被 import 的文件进入 program。 |
| `files` | `string[]` | 精确列出根文件 | `["src/index.ts"]` | 大项目容易漏新文件。 |
| `types` | `string[]` | 控制自动进入的全局 `@types` 包 | `[]`、`["node"]` | 配错会隐藏测试或 Node 全局类型。 |
| `typeRoots` | `string[]` | 控制类型包查找目录 | `["./types"]` | 通常不用随便配置。 |
| `skipLibCheck` | `boolean` | 跳过 `.d.ts` 检查 | `true` | 不是跳过源码检查。 |
| `incremental` | `boolean` | 保存构建信息 | `true` | 不等于项目拆分。 |
| `composite` | `boolean` | 启用项目引用约束 | `true` | 被引用项目需要它。 |
| `declaration` | `boolean` | 输出 `.d.ts` | `true` | 公共 API 类型过大时输出复杂。 |
| `declarationMap` | `boolean` | 输出声明 sourcemap | `true` | 库和 project references 常用。 |

---

## 3. 慢类型模式速查

| 模式 | 典型写法 | 为什么慢 | 优化方向 |
|---|---|---|---|
| 大联合类型 | `A | B | C | ...` | 候选类型要和多个成员比较 | 只在分支需要时用完整 union；公共 helper 用 base type。 |
| 交叉类型堆叠 | `A & B & C & D` | 需要合并和检查多个 constituent | 对象组合优先 `interface extends`。 |
| 分布式条件类型 | `T extends U ? X : Y` | union 成员逐个代入 | 用 `[T] extends [U]` 阻止无意分布。 |
| 嵌套条件类型 | `T extends A ? ... : T extends B ? ...` | 每层都可能实例化 | 命名中间类型，限制输入 union。 |
| 模板字面量组合 | `` `${A}-${B}-${C}` `` | union 维度相乘 | 限制维度，手写稳定 union，或代码生成。 |
| 无界递归类型 | `Deep<T[K]>` | 不断展开嵌套对象 | 加 depth 参数和 base case。 |
| 匿名巨大返回类型 | `export function f() { return {...} }` | declaration emit 和 hover 要打印结构 | 给公共导出显式返回类型。 |
| 过度精确公共 API | 导出内部生成类型 | 调用方反复实例化和显示 | 内部精确，外部稳定。 |
| 全局类型污染 | 默认加载所有 `@types` | program 环境变大 | 用 `types` 控制全局类型。 |
| 输入范围太宽 | `include: ["**/*"]` | 文件数量过多 | 明确 include / exclude / files。 |

---

## 4. 同名 / 相似概念对照

| 概念 A | 概念 B | 区别 |
|---|---|---|
| runtime performance | type-checking performance | 前者是 JS 执行速度，后者是 TypeScript 检查速度。 |
| build performance | editor performance | 前者是命令行/CI，后者是语言服务交互。 |
| `extendedDiagnostics` | `generateTrace` | 前者给整体指标，后者生成深入追踪文件。 |
| `noErrorTruncation` | performance optimization | 前者只让错误完整显示，不优化速度。 |
| union | base interface | union 表达分支，base interface 表达公共字段。 |
| distributive conditional | non-distributive conditional | 裸类型参数会分布式，tuple wrapping 阻止分布。 |
| template literal type | runtime string building | 前者在类型层生成字符串 union，后者运行时拼接字符串。 |
| recursive type | recursive function | 前者编译期展开，后者运行时调用。 |
| `interface extends` | intersection | 前者更适合对象组合和缓存，后者表达交叉语义。 |
| `include` | `files` | `include` 用 glob，`files` 精确列文件。 |
| `types` | `typeRoots` | `types` 选包名，`typeRoots` 选查找目录。 |
| `incremental` | project references | `incremental` 缓存单项目构建，references 拆项目依赖图。 |
| `skipLibCheck` | type safety | `skipLibCheck` 是速度取舍，不提升安全性。 |

---

## 5. 参数签名速查

```bash
tsc --extendedDiagnostics
```

```txt
参数:
  none

输出:
  Compiler metrics printed to stdout.

常用场景:
  Build a performance baseline.
```

```bash
tsc --generateTrace <directory>
```

```txt
参数:
  directory: target directory for trace files.

输出:
  trace.json
  types.json

常用场景:
  Investigate deeper type-checking hotspots.
```

```bash
tsc --noErrorTruncation
```

```txt
参数:
  none

输出:
  Longer diagnostic messages.

常用场景:
  Inspect huge or truncated types.
```

```bash
tsc -b <config>
```

```txt
参数:
  config: solution tsconfig path.

输出:
  Builds referenced projects.

常用场景:
  Use project references in larger workspaces.
```

---

## 6. options object 固定属性名

```json
{
  "compilerOptions": {
    "extendedDiagnostics": true,
    "generateTrace": "./trace-output",
    "noErrorTruncation": true,
    "incremental": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "skipLibCheck": true,
    "types": [],
    "typeRoots": ["./types"],
    "disableReferencedProjectLoad": true,
    "disableSolutionSearching": true
  },
  "files": [],
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "coverage", "node_modules"],
  "references": [
    { "path": "./packages/shared" }
  ]
}
```

---

## 7. 会修改文件或产生输出的方法

| 命令 / 配置 | 输出 |
|---|---|
| `tsc --generateTrace ./trace-output` | 写入 `trace-output/trace.json` 和 `trace-output/types.json`。 |
| `tsc -b` | 可能写入 `.js`、`.d.ts`、`.d.ts.map`、`.tsbuildinfo`。 |
| `tsc -b --clean` | 删除 build mode 输出。 |
| `declaration: true` | 生成 `.d.ts`。 |
| `declarationMap: true` | 生成 `.d.ts.map`。 |
| `incremental: true` | 生成 `.tsbuildinfo`。 |

---

## 8. 不会立即优化性能的诊断工具

| 工具 | 为什么不算直接优化 |
|---|---|
| `noErrorTruncation` | 只改变错误显示，不改变检查工作量。 |
| `generateTrace` | 生成追踪文件，反而有额外开销。 |
| `traceResolution` | 打印模块解析过程，不减少解析本身。 |
| `showConfig` | 展开配置，不执行优化。 |
| `listFilesOnly` | 列出文件，不改变文件范围。 |
| `explainFiles` | 解释文件来源，不自动修改配置。 |

---

## 9. 常见 IDE 警告和卡顿来源

| 现象 | 可能原因 | 处理方式 |
|---|---|---|
| hover 极长 | 匿名复杂类型或巨大 union | 命名公共类型，显式返回类型。 |
| 自动补全慢 | program 太大或全局类型太多 | 收窄 include，设置 types。 |
| WebStorm 项目错误很多 | 选择的 TypeScript 版本或 tsconfig 不一致 | 使用 project node_modules TypeScript。 |
| VS Code hover 被截断 | hover 长度限制 | 调整 `js/ts.hover.maximumLength` 或命名类型。 |
| IDE 慢但 `tsc` 不慢 | language service 交互成本高 | 检查插件、项目加载、hover 类型。 |
| `excessive type instantiation` | 递归或条件类型失控 | 限制递归深度，减少 union 输入。 |
| declaration emit 慢 | 导出匿名巨大返回类型 | 给导出函数加命名返回类型。 |
| Node / DOM 类型混淆 | 全局 `@types` 环境污染 | 用 `types` 明确环境。 |

---

## 10. 优化决策表

| 发现的问题 | 先用什么确认 | 优化策略 |
|---|---|---|
| CI 类型检查慢 | `extendedDiagnostics` | 看 Files、Types、Instantiations、Check time。 |
| 不知道哪些文件进入 program | `--listFilesOnly` / `--explainFiles` | 收窄 include / exclude / files。 |
| 模块解析异常慢 | `--traceResolution` | 检查 paths、exports、重复依赖。 |
| 错误类型巨大 | `--noErrorTruncation` | 命名复杂类型，减少匿名展开。 |
| 类型实例化过多 | `extendedDiagnostics` / `generateTrace` | 找条件类型、递归类型、模板字面量类型。 |
| 大型 app 单项目卡 | `extendedDiagnostics` / editor logs | project references 拆分。 |
| 第三方声明检查慢 | `extendedDiagnostics` | 考虑 `skipLibCheck`。 |
| 库发布声明过大 | declaration emit 输出 | 显式返回类型，稳定 public API。 |

---

## 11. 最终记忆模型

```txt
第一层：测量
  extendedDiagnostics
  noErrorTruncation
  generateTrace
  listFilesOnly
  explainFiles

第二层：项目边界
  include
  exclude
  files
  types
  typeRoots
  project references

第三层：类型设计
  interface extends
  named aliases
  explicit public return types
  smaller base types
  bounded recursion
  constrained template literal types

第四层：工程取舍
  internal precision
  public stability
  editor readability
  CI speed
```

最终一句话：

```txt
高级类型不是问题；无边界、无测量、无命名、无深度限制的高级类型才是问题。
```

---

## 12. 官方文档链接

- [TypeScript Wiki: Performance](https://github.com/microsoft/TypeScript/wiki/Performance)
- [TSConfig: extendedDiagnostics](https://www.typescriptlang.org/tsconfig/extendedDiagnostics.html)
- [TSConfig: generateTrace](https://www.typescriptlang.org/tsconfig/generateTrace.html)
- [TSConfig: noErrorTruncation](https://www.typescriptlang.org/tsconfig/noErrorTruncation.html)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TSConfig: incremental](https://www.typescriptlang.org/tsconfig/incremental.html)
- [TSConfig: skipLibCheck](https://www.typescriptlang.org/tsconfig/skipLibCheck.html)
- [TypeScript 5.9 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)

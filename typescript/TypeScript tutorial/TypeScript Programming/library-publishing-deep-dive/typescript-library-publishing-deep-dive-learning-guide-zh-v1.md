# TypeScript 做项目前补充 03：库构建与发布深挖学习指导文件 v1

> 定位：这是做简历项目或开源小库之前必须补的 TypeScript 库构建与发布学习指导文件，不是最终学习笔记。  
> 目标：按照这份文件训练 package public API、ESM / CJS 输出、声明文件、exports map、types 字段、side effects、peerDependencies、npm pack 预检查和版本发布边界。  
> 参考范围：TypeScript 官方 Declaration Files Publishing、TSConfig `declaration` / `emitDeclarationOnly` / `declarationMap`、Modules Reference、Node package exports、npm package 发布实践。  
> 代码规则：代码命名、字符串和代码注释统一英文；代码块中不使用中文字符。  
> 学习原则：先理解“应用项目”和“库项目”的差异，再学习构建配置。不要把库发布学成“把 dist 发到 npm”。

## 目录

1. [官方文档对应关系](#官方文档对应关系)
2. [1. 本文件怎么用](#1-本文件怎么用)
3. [2. 项目重新整理建议](#2-项目重新整理建议)
4. [3. 本章先要建立的底层模型](#3-本章先要建立的底层模型)
5. [4. 00：库项目到底在解决什么](#4-00库项目到底在解决什么)
6. [5. 01：应用项目 vs 库项目](#5-01应用项目-vs-库项目)
7. [6. 02：public API 和 barrel 文件](#6-02public-api-和-barrel-文件)
8. [7. 03：声明文件输出](#7-03声明文件输出)
9. [8. 04：ESM / CJS 输出策略](#8-04esm--cjs-输出策略)
10. [9. 05：exports map 和 subpath exports](#9-05exports-map-和-subpath-exports)
11. [10. 06：peerDependencies 和 external](#10-06peerdependencies-和-external)
12. [11. 07：sideEffects 和 tree shaking](#11-07sideeffects-和-tree-shaking)
13. [12. 08：npm pack dry run](#12-08npm-pack-dry-run)
14. [13. 09：版本、CHANGELOG 和发布前检查](#13-09版本changelog-和发布前检查)
15. [14. 10：小项目整合](#14-10小项目整合)
16. [15. 最终文件清单](#15-最终文件清单)
17. [16. 最终学习笔记转换要求](#16-最终学习笔记转换要求)
18. [17. 最终要能回答的问题](#17-最终要能回答的问题)
19. [18. 最终记忆模型](#18-最终记忆模型)

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 声明文件发布方式、`types` 字段、依赖声明、`typesVersions`、DefinitelyTyped | https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html |
| `declaration` 生成 `.d.ts` | https://www.typescriptlang.org/tsconfig/declaration.html |
| `emitDeclarationOnly` 只输出声明 | https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html |
| `declarationMap` 调试声明来源 | https://www.typescriptlang.org/tsconfig/declarationMap.html |
| `rootDir`、`outDir`、`composite`、`incremental` | https://www.typescriptlang.org/tsconfig |
| NodeNext、ESM / CJS、`package.json` `type` 和扩展名 | https://www.typescriptlang.org/docs/handbook/modules/reference.html |
| npm package.json 字段、files、exports、main、types | https://docs.npmjs.com/cli/v10/configuring-npm/package-json |
| npm pack 预检查 | https://docs.npmjs.com/cli/v10/commands/npm-pack |

---

## 1. 本文件怎么用

### 结论

库项目的核心是：你发布的不只是 JavaScript 文件，而是一个长期可被别人依赖的 public API。

一个库包通常要同时提供：

```txt
runtime JavaScript:
  executed by consumers

type declarations:
  read by TypeScript and editors

package metadata:
  tells tools which files to load

public API:
  defines what consumers are allowed to import
```

### 每节固定学习步骤

```txt
1. Read the conclusion first.
2. Decide whether the section is about runtime output, type output, package metadata, public API, or release safety.
3. Create the files.
4. Run typecheck.
5. Build output.
6. Inspect dist files.
7. Run npm pack --dry-run.
8. Explain what consumers will import.
9. Convert the result into notes/typescript.md.
```

---

## 2. 项目重新整理建议

### 结论

建议新增：

```txt
typescript/library-publishing-deep-dive/
```

### 推荐结构

```txt
typescript/
  library-publishing-deep-dive/
    README.md
    00-library-problem-model/
      appVsLibrary.md
      boundaryVocabulary.md
      valueTypeMetadataBoundary.md
      publicApiBoundary.ts
      consumerResolutionBoundary.md
    01-app-vs-library/
      applicationEntry.ts
      libraryEntry.ts
      consumerBoundary.ts
    02-public-api/
      src/contracts.ts
      src/formatters.ts
      src/validators.ts
      src/index.ts
      src/internal/formatCents.ts
    03-declaration-output/
      tsconfig.json
      tsconfig.types.json
      src/index.ts
      declarationFieldBoundary.md
      dist-inspection.md
    04-esm-cjs-output/
      package.json
      tsconfig.esm.json
      tsconfig.cjs.json
      src/index.ts
      moduleFormatDecision.md
    05-exports-map/
      package.json
      src/index.ts
      src/react.tsx
      src/node.ts
      exportSpecifierBoundary.md
    06-peer-dependencies/
      package.json
      externalNotes.md
      dependencyRoleBoundary.md
      reactPeerExample.tsx
    07-side-effects/
      package.json
      src/registerGlobal.ts
      src/pureFormatter.ts
      src/importSideEffectBoundary.ts
      sideEffectsNotes.md
    08-pack-dry-run/
      package.json
      filesFieldNotes.md
      packageContentBoundary.md
      packChecklist.md
    09-release-checks/
      package.json
      changelog.md
      versioningNotes.md
      apiCompatibilityBoundary.md
    10-mini-project/
      package.json
      tsconfig.json
      src/contracts.ts
      src/validators.ts
      src/formatters.ts
      src/index.ts
      test/consumer.ts
      test/packageConsumer.ts
```

### `README.md`

```md
# Product Kit Publishing Lab

## Goal

Practice the package boundary of a TypeScript library.

## Checklist

- Define the public API through src/index.ts.
- Build runtime JavaScript output.
- Build declaration output.
- Inspect package.json metadata.
- Run npm pack --dry-run before publishing.
- Test the package from a consumer file.
```

---

## 3. 本章先要建立的底层模型

### 结论

库发布有四层边界：

```txt
source boundary:
  TypeScript source files and internal modules.

build boundary:
  JavaScript output and declaration output.

package boundary:
  package.json fields describe entry points.

consumer boundary:
  another project imports your public API.
```

### 关键术语

| 术语 | 技术意义 |
|---|---|
| public API | 消费者允许依赖的导出表面。 |
| internal module | 只供库内部使用，不保证稳定。 |
| declaration file | `.d.ts`，描述 runtime JS API 的类型。 |
| `types` | package.json 中指向声明入口的字段。 |
| `exports` | package.json 中控制可导入入口的字段。 |
| subpath export | 例如 `my-lib/react` 这样的子路径入口。 |
| ESM | 标准 JavaScript 模块格式。 |
| CJS | CommonJS 模块格式。 |
| peer dependency | 由消费者项目提供的依赖。 |
| external | 构建时不打进 bundle 的依赖。 |
| side effect | import 后会改变外部状态的模块行为。 |

### 本章第一次出现就必须讲清楚的符号、字段和边界角色

### 结论

本章不是只学配置文件。只要配置字段、文件扩展名、导入入口或脚本命令在代码块里出现，就必须立刻说清楚它属于哪一层、谁读取它、它是否会进入发布包，以及消费者会不会依赖它。

### 角色表

| 写法 | 角色 | 谁读取 | 是否运行时执行 | 当前必须掌握的意义 |
|---|---|---|---|---|
| `export` | 模块导出语法 | TypeScript / bundler / Node | 是 | 决定模块公开哪些 value；`export type` 只公开类型。 |
| `import` | 模块导入语法 | TypeScript / bundler / Node | 是 | 消费者通过它进入 public API。 |
| `export type` | 类型导出语法 | TypeScript | 否 | 只导出类型，编译后被擦除。 |
| `.d.ts` | 声明文件 | TypeScript / editor | 否 | 描述 runtime JS API 的类型表面。 |
| `.js` | JavaScript 输出 | Node / browser / bundler | 是 | 消费者真正执行的文件。 |
| `.cjs` | CommonJS 输出 | Node CJS loader | 是 | 给 `require` 消费者使用。 |
| `package.json` | 包元数据文件 | npm / Node / bundler / TypeScript | 否 | 描述包名、入口、依赖、发布内容。 |
| `"type"` | package 模块语义字段 | Node / tools | 否 | 决定 `.js` 按 ESM 还是 CJS 解释。 |
| `"types"` | 声明入口字段 | TypeScript / editor | 否 | 告诉类型系统声明入口在哪里。 |
| `"exports"` | 包入口映射字段 | Node / bundler / TypeScript | 否 | 控制消费者可以导入哪些入口。 |
| `"files"` | npm 打包白名单 | npm | 否 | 控制发布包里包含哪些文件。 |
| `"sideEffects"` | tree shaking 提示 | bundler | 否 | 告诉 bundler 哪些文件 import 后可能有副作用。 |
| `"peerDependencies"` | 宿主依赖声明 | npm / consumers | 否 | 表示依赖由消费者项目提供。 |
| `"devDependencies"` | 开发依赖声明 | npm | 否 | 库作者本地开发、测试、构建使用。 |
| `declaration` | TSConfig 输出选项 | TypeScript compiler | 否 | 让 `tsc` 生成 `.d.ts`。 |
| `emitDeclarationOnly` | TSConfig 输出选项 | TypeScript compiler | 否 | 只生成 `.d.ts`，不生成 JS。 |
| `npm pack --dry-run` | npm 命令 | npm CLI | 是 | 预览将被打进 tarball 的文件。 |

### 当前章节的读法

每看到一个配置或路径，按这个顺序读：

```txt
1. Which file contains it?
2. Which tool reads it?
3. Does it affect runtime JavaScript, type declarations, package metadata, or release safety?
4. Does the consumer depend on it?
5. Does it appear in the published package?
```

---

## 4. 00：库项目到底在解决什么

### 结论

库项目解决的是“把可复用能力以稳定 API 发布给其他项目”的问题。

### `appVsLibrary.md`

```txt
Application:
  owns runtime
  owns deployment
  can import internal files freely
  optimizes for product behavior

Library:
  is consumed by other projects
  must control public API
  must emit declarations
  must avoid leaking internals
  must define package metadata
```

### `boundaryVocabulary.md`

```md
# Boundary Vocabulary

## Source boundary

Source files are the files the library author edits.

## Build boundary

Build output is what TypeScript or a bundler emits.

## Package boundary

Package metadata decides which output files consumers can import.

## Consumer boundary

A consumer should import supported public entries, not internal source files.
```

### `valueTypeMetadataBoundary.md`

```md
# Value, Type, and Metadata Boundary

## Runtime value

A runtime value exists in emitted JavaScript.

## Type declaration

A type declaration helps TypeScript check consumer code.

## Package metadata

Package metadata is read by npm, Node, bundlers, TypeScript, and editors.

## Rule

Do not explain package publishing as one layer. Runtime code, declaration files, and metadata solve different problems.
```

### `publicApiBoundary.ts`

```ts
// Goal:
// Separate public API from implementation details.

// Expected result:
// Only exported members are public.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

function formatCents(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function formatProduct(product: ProductRecord): string {
  return `${product.title}:${formatCents(product.priceCents)}`;
}
```


### `consumerResolutionBoundary.md`

```md
# Consumer Resolution Boundary

## Supported import

A supported import starts from a documented public entry.

## Unsupported import

An unsupported import reaches into internal implementation files.

## Rule

A consumer should not depend on an internal helper path just because the file exists in the repository or the package tarball.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 能 import 就代表能公开依赖 | public API 应该由入口文件控制。 |
| 发 npm 只是上传源码 | 发布的是 runtime、types 和 metadata 的组合。 |
| 内部文件路径可以长期依赖 | 内部路径重构不保证兼容。 |

---

## 5. 01：应用项目 vs 库项目

### 结论

应用项目的入口是运行页面或服务；库项目的入口是消费者导入的 API。两者构建目标完全不同。

### `applicationEntry.ts`

```ts
// Goal:
// Show an application entry point that owns its runtime.

// Expected result:
// Run product behavior directly inside the app boundary.

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

function renderProductPage(product: ProductRecord): void {
  console.log(`Product page: ${product.title}`);
}

renderProductPage({
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
});
```

### `libraryEntry.ts`

```ts
// Goal:
// Show a library public entry point.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProduct(product: ProductRecord): string {
  return `${product.title}:${product.priceCents}`;
}
```

### `consumerBoundary.ts`

```ts
// Goal:
// Simulate a consumer using only the public API.

import { formatProduct, type ProductRecord } from "./libraryEntry";

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
};

console.log(formatProduct(product));
```

### 常见错误

```txt
Mistake:
  A library can expose every file in src.

Correct:
  A library should expose stable entry points and hide internal modules.
```

---

## 6. 02：public API 和 barrel 文件

### 结论

库项目的 `src/index.ts` 是 public API 的门面。它应该导出稳定能力，不应该把所有内部实现都暴露出去。

### `src/contracts.ts`

```ts
// Goal:
// Define public contract types.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type ValidationResult<ValueType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: string };
```

### `src/internal/formatCents.ts`

```ts
// Goal:
// Keep implementation details internal.

export function formatCents(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}
```

### `src/validators.ts`

```ts
// Goal:
// Export public validation utilities without exposing internals.

import type { ProductRecord, ValidationResult } from "./contracts";

export function validateProduct(value: unknown): ValidationResult<ProductRecord> {
  if (typeof value !== "object" || value === null) {
    return { ok: false, error: "Expected an object" };
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== "string") {
    return { ok: false, error: "Invalid id" };
  }

  if (typeof candidate.title !== "string") {
    return { ok: false, error: "Invalid title" };
  }

  if (typeof candidate.priceCents !== "number") {
    return { ok: false, error: "Invalid priceCents" };
  }

  return {
    ok: true,
    value: {
      id: candidate.id,
      title: candidate.title,
      priceCents: candidate.priceCents,
    },
  };
}
```

### `src/formatters.ts`

```ts
// Goal:
// Export public runtime utilities.

import type { ProductRecord } from "./contracts";
import { formatCents } from "./internal/formatCents";

export function formatProduct(product: ProductRecord): string {
  return `${product.title}:${formatCents(product.priceCents)}`;
}
```

### `src/index.ts`

```ts
// Goal:
// Export the public library surface.

export type { ProductRecord, ValidationResult } from "./contracts";
export { formatProduct } from "./formatters";
export { validateProduct } from "./validators";
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `index.ts` 导出所有文件 | 只导出公共 API。 |
| 内部 helper 被消费者依赖 | 内部 helper 不要出现在 public entry。 |
| type export 和 value export 混着写 | 开启 `verbatimModuleSyntax` 后明确区分。 |

---

## 7. 03：声明文件输出

### 结论

库项目必须输出 `.d.ts`，否则 TypeScript 消费者无法获得你的 public API 类型。

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### `tsconfig.types.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "emitDeclarationOnly": true,
    "outDir": "dist/types"
  }
}
```

### `src/index.ts`

```ts
// Goal:
// Provide a minimal public entry for declaration output.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProductTitle(product: ProductRecord): string {
  return product.title.trim().toUpperCase();
}
```

### 运行方式

```bash
npx tsc -p tsconfig.json
npx tsc -p tsconfig.types.json
```

### `declarationFieldBoundary.md`

```md
# Declaration Field Boundary

## declaration

The declaration option makes TypeScript emit .d.ts files together with JavaScript output.

## emitDeclarationOnly

The emitDeclarationOnly option emits declaration files without JavaScript output.

## declarationMap

The declarationMap option creates maps from .d.ts files back to source files.

## types

The types field points consumers and editors to the declaration entry.

## Rule

Declaration output describes the public API. It is not a runtime implementation.
```

### `dist-inspection.md`

```txt
Inspect:
  dist/index.js
  dist/index.d.ts
  dist/index.d.ts.map
  dist/index.js.map

Questions:
  Which types appear in the declaration file?
  Which implementation details are erased?
  Does the declaration file match the public API?
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 应用项目也必须发 `.d.ts` | 主要是库项目需要给消费者发声明。 |
| `.d.ts` 包含实现代码 | 声明文件只描述类型表面。 |
| 忘记 `types` 字段 | 消费者可能找不到声明入口。 |

---

## 8. 04：ESM / CJS 输出策略

### 结论

现代库优先 ESM；如果要兼容 CommonJS，需要明确双输出策略和 package metadata。不要假设所有消费者用同一种模块系统。

### `package.json`

```json
{
  "name": "product-kit",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs"
    }
  }
}
```

### `tsconfig.esm.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "rootDir": "src",
    "outDir": "dist/esm",
    "strict": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### `tsconfig.cjs.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist/cjs",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### `src/index.ts`

```ts
// Goal:
// Provide source code that can be emitted to ESM and CJS outputs.

export function formatProductTitle(title: string): string {
  return title.trim().toUpperCase();
}

export function calculateProductPrice(priceCents: number, quantity: number): number {
  return priceCents * quantity;
}
```

### `moduleFormatDecision.md`

```md
# Module Format Decision

## ESM output

ESM output is loaded with import syntax and ESM resolution rules.

## CJS output

CJS output is loaded with require syntax and CommonJS resolution rules.

## package type

The package type field controls how .js files are interpreted in the package scope.

## Rule

Do not treat module format as syntax only. It changes runtime loading, file extensions, package conditions, and consumer tests.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| ESM / CJS 只是语法不同 | 包元数据和运行时加载规则也不同。 |
| 双输出不需要测试 | 要分别测试 import 和 require 消费场景。 |
| `"type": "module"` 不影响库 | 它影响 `.js` 文件的模块语义。 |

---

## 9. 05：exports map 和 subpath exports

### 结论

`exports` map 控制消费者能导入什么入口。它是库的边界保护工具，不只是路径映射。

### `package.json`

```json
{
  "name": "product-kit",
  "version": "0.1.0",
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "import": "./dist/react.js"
    },
    "./node": {
      "types": "./dist/node.d.ts",
      "import": "./dist/node.js"
    }
  },
  "files": ["dist"]
}
```

### `src/index.ts`

```ts
// Goal:
// Export the default package entry.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProductTitle(product: ProductRecord): string {
  return product.title.trim().toUpperCase();
}
```

### `src/react.tsx`

```tsx
// Goal:
// Export a React-specific entry point.

import type { ProductRecord } from "./index";

export type ProductBadgeProps = {
  product: ProductRecord;
};

export function ProductBadge(props: ProductBadgeProps) {
  return <span>{props.product.title}</span>;
}
```

### `src/node.ts`

```ts
// Goal:
// Export a Node-specific entry point.

import { readFileSync } from "node:fs";

export function readPackageJsonText(filePath: string): string {
  return readFileSync(filePath, "utf8");
}
```

### `exportSpecifierBoundary.md`

```md
# Export Specifier Boundary

## Package entry

The package entry is the supported import surface for consumers.

## Subpath export

A subpath export is a named public entry below the package name.

## Internal path

An internal path is an implementation detail unless it appears in the exports map.

## Rule

The exports map is not just path shorthand. It defines supported import contracts.
```

### 常见错误

```txt
Mistake:
  Consumers can import any dist file.

Correct:
  exports map should restrict supported public entry points.
```

---

## 10. 06：peerDependencies 和 external

### 结论

库中依赖 React 这类宿主项目应该提供的包时，通常要放到 `peerDependencies`，并在构建时 external 掉，避免打包进库。

### `package.json`

```json
{
  "name": "product-ui",
  "version": "0.1.0",
  "type": "module",
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "react": "latest",
    "react-dom": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest"
  }
}
```

### `reactPeerExample.tsx`

```tsx
// Goal:
// Export a React component from a library entry.

import type { ReactNode } from "react";

export type PanelProps = {
  title: string;
  children: ReactNode;
};

export function Panel(props: PanelProps) {
  return (
    <section>
      <h2>{props.title}</h2>
      <div>{props.children}</div>
    </section>
  );
}
```

### `externalNotes.md`

```md
# External Dependency Notes

## Rule

React should stay outside the library bundle.

## Why

The consumer application should provide the React runtime instance.

## Check

- React is listed in peerDependencies.
- React is listed in devDependencies for local development.
- The bundler marks react and react-dom as external.
```

### `dependencyRoleBoundary.md`

```md
# Dependency Role Boundary

## dependencies

Use dependencies for packages required by the library at runtime.

## peerDependencies

Use peerDependencies for packages the consumer must provide.

## devDependencies

Use devDependencies for local development, tests, examples, and builds.

## external

Use external bundler settings to keep selected packages out of the emitted bundle.

## Rule

Dependency category is part of the public contract. A wrong category can duplicate runtimes, hide missing installs, or bloat the package.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| React 组件库把 React 打进 bundle | React 通常应该是 peer dependency。 |
| peer dependency 不放 devDependencies | 作者开发时也需要安装。 |
| 所有依赖都 peer | 只有需要消费者共享实例或版本的依赖适合 peer。 |

---

## 11. 07：sideEffects 和 tree shaking

### 结论

`sideEffects` 告诉 bundler 模块导入是否可能产生副作用。纯工具函数库可以更激进地标记，但包含全局注册的模块必须谨慎。

### `package.json`

```json
{
  "name": "product-kit",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": [
    "./dist/registerGlobal.js"
  ]
}
```

### `src/registerGlobal.ts`

```ts
// Goal:
// Demonstrate a module with a side effect.

declare global {
  interface Window {
    productKitReady?: boolean;
  }
}

if (typeof window !== "undefined") {
  window.productKitReady = true;
}

export {};
```

### `src/pureFormatter.ts`

```ts
// Goal:
// Demonstrate a side-effect-free utility.

export function formatTitle(title: string): string {
  return title.trim().toUpperCase();
}
```

### `src/importSideEffectBoundary.ts`

```ts
// Goal:
// Show that top-level code runs when the module is imported.

const loadedAt = Date.now();

export function getModuleLoadedAt(): number {
  return loadedAt;
}
```

### `sideEffectsNotes.md`

```md
# Side Effects Notes

## Pure module

A pure module only exports values and does not change external state during import.

## Side-effect module

A side-effect module runs top-level code that changes external state during import.

## Package rule

Only mark a package as side-effect-free when every entry can be safely removed if its exports are unused.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有库都写 `"sideEffects": false` | 有全局注册或 CSS import 时要谨慎。 |
| tree shaking 是 TS 做的 | tree shaking 是 bundler 优化。 |
| import 一定无副作用 | 顶层代码会执行。 |

---

## 12. 08：npm pack dry run

### 结论

发布前必须用 `npm pack --dry-run` 检查包里实际包含哪些文件。它比肉眼看目录可靠。

### `package.json`

```json
{
  "name": "product-kit",
  "version": "0.1.0",
  "type": "module",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "prepack": "npm run build",
    "pack:check": "npm pack --dry-run"
  }
}
```

### `filesFieldNotes.md`

```md
# Files Field Notes

## Rule

The files field controls which project files are included in the npm package.

## Keep

- dist
- README.md
- LICENSE
- package.json

## Exclude

- src
- test fixtures
- local config files
- temporary build output
```

### `packageContentBoundary.md`

```md
# Package Content Boundary

## Repository files

Repository files are everything in the working project.

## Package files

Package files are the files npm includes in the tarball.

## Consumer files

Consumer files are the files import resolution can reach through supported entries.

## Rule

Do not assume repository structure equals package structure. Verify the package with npm pack --dry-run.
```

### `packChecklist.md`

```txt
Run:
  npm run pack:check

Inspect:
  package size
  included JavaScript files
  included declaration files
  README
  LICENSE
  package.json metadata
```

### 常见错误

```txt
Mistake:
  The npm package contains the same files as the repository.

Correct:
  The package contains what npm packaging rules include. Verify with npm pack --dry-run.
```

---

## 13. 09：版本、CHANGELOG 和发布前检查

### 结论

发布不是构建成功就结束。你还要确认版本号、变更说明、兼容性、测试、类型、包内容和消费端验证。

### `package.json`

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.json",
    "test:consumer": "tsc -p test/tsconfig.consumer.json",
    "pack:check": "npm pack --dry-run",
    "release:check": "npm run typecheck && npm run build && npm run test:consumer && npm run pack:check"
  }
}
```

### `changelog.md`

```md
# Changelog

## 0.1.0

### Added

- Initial public Product Kit API.
- Runtime formatter utilities.
- Type declaration output.
- Package exports map.
- npm pack dry-run checklist.
```

### `versioningNotes.md`

```txt
Patch:
  bug fix without public API change.

Minor:
  new backward-compatible public API.

Major:
  breaking public API change.

Rule:
  If consumers must change their code, treat it as breaking.
```

### `apiCompatibilityBoundary.md`

```md
# API Compatibility Boundary

## Runtime compatibility

Runtime compatibility means existing consumer code still executes correctly.

## Type compatibility

Type compatibility means existing TypeScript consumer code still type-checks.

## Import compatibility

Import compatibility means existing import specifiers still resolve.

## Rule

A change can be breaking even when the JavaScript implementation still runs.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 类型改动不是 breaking change | 对 TS 库来说，类型也是 API。 |
| README 可以以后补 | README 是消费者入口。 |
| 不测 consumer | 要验证另一个项目能正确 import。 |

---

## 14. 10：小项目整合

### 结论

小项目目标是发布一个最小 `product-kit` SDK：类型、验证器、格式化器、声明文件、package metadata 和 consumer test 都完整。

### `package.json`

```json
{
  "name": "product-kit",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist", "README.md", "LICENSE"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "types": "./dist/index.d.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.json",
    "test:consumer": "tsc --noEmit test/consumer.ts",
    "pack:check": "npm pack --dry-run"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "rootDir": ".",
    "outDir": "dist",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src", "test"]
}
```

### `src/contracts.ts`

```ts
// Goal:
// Define public SDK contract types.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

export type ProductParseError =
  | { kind: "not-object" }
  | { kind: "invalid-field"; fieldName: string };
```

### `src/validators.ts`

```ts
// Goal:
// Export a runtime validator.

import type { ProductParseError, ProductRecord, Result } from "./contracts";

export function parseProduct(value: unknown): Result<ProductRecord, ProductParseError> {
  if (typeof value !== "object" || value === null) {
    return { ok: false, error: { kind: "not-object" } };
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== "string") {
    return { ok: false, error: { kind: "invalid-field", fieldName: "id" } };
  }

  if (typeof candidate.title !== "string") {
    return { ok: false, error: { kind: "invalid-field", fieldName: "title" } };
  }

  if (typeof candidate.priceCents !== "number") {
    return { ok: false, error: { kind: "invalid-field", fieldName: "priceCents" } };
  }

  return {
    ok: true,
    value: {
      id: candidate.id,
      title: candidate.title,
      priceCents: candidate.priceCents,
    },
  };
}
```

### `src/formatters.ts`

```ts
// Goal:
// Export SDK formatting utilities.

import type { ProductRecord } from "./contracts";

export function formatProduct(product: ProductRecord): string {
  return `${product.title}:${(product.priceCents / 100).toFixed(2)}`;
}
```

### `src/index.ts`

```ts
// Goal:
// Expose the public SDK API.

export type { ProductParseError, ProductRecord, Result } from "./contracts";
export { formatProduct } from "./formatters";
export { parseProduct } from "./validators";
```

### `test/consumer.ts`

```ts
// Goal:
// Simulate a consumer importing only the public package entry.

import { formatProduct, parseProduct } from "../src/index";

const parsedProduct = parseProduct({
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
});

if (parsedProduct.ok) {
  console.log(formatProduct(parsedProduct.value));
}
```

### `test/packageConsumer.ts`

```ts
// Goal:
// Simulate a consumer importing from the package entry after build.

import { formatProduct, parseProduct } from "product-kit";

const parsedProduct = parseProduct({
  id: "p1",
  title: "Keyboard",
  priceCents: 9900,
});

if (parsedProduct.ok) {
  console.log(formatProduct(parsedProduct.value));
}
```

### 小项目执行过程

| 步骤 | 命令 | 观察点 |
|---|---|---|
| 1 | `npm run typecheck` | 源码类型是否通过。 |
| 2 | `npm run build` | `dist` 是否有 JS 和 `.d.ts`。 |
| 3 | consumer check | 消费者能否 import。 |
| 4 | `npm run pack:check` | 包内容是否正确。 |
| 5 | 检查 `exports` | 入口是否只暴露 public API。 |

---

## 15. 最终文件清单

```txt
typescript/
  library-publishing-deep-dive/
    README.md
    00-library-problem-model/
      appVsLibrary.md
      boundaryVocabulary.md
      valueTypeMetadataBoundary.md
      publicApiBoundary.ts
      consumerResolutionBoundary.md
    01-app-vs-library/
      applicationEntry.ts
      libraryEntry.ts
      consumerBoundary.ts
    02-public-api/
      src/contracts.ts
      src/formatters.ts
      src/validators.ts
      src/index.ts
      src/internal/formatCents.ts
    03-declaration-output/
      tsconfig.json
      tsconfig.types.json
      src/index.ts
      declarationFieldBoundary.md
      dist-inspection.md
    04-esm-cjs-output/
      package.json
      tsconfig.esm.json
      tsconfig.cjs.json
      src/index.ts
      moduleFormatDecision.md
    05-exports-map/
      package.json
      src/index.ts
      src/react.tsx
      src/node.ts
      exportSpecifierBoundary.md
    06-peer-dependencies/
      package.json
      externalNotes.md
      dependencyRoleBoundary.md
      reactPeerExample.tsx
    07-side-effects/
      package.json
      src/registerGlobal.ts
      src/pureFormatter.ts
      src/importSideEffectBoundary.ts
      sideEffectsNotes.md
    08-pack-dry-run/
      package.json
      filesFieldNotes.md
      packageContentBoundary.md
      packChecklist.md
    09-release-checks/
      package.json
      changelog.md
      versioningNotes.md
      apiCompatibilityBoundary.md
    10-mini-project/
      package.json
      tsconfig.json
      src/contracts.ts
      src/validators.ts
      src/formatters.ts
      src/index.ts
      test/consumer.ts
      test/packageConsumer.ts
```

## 16. 最终学习笔记转换要求

每节笔记按这个结构整理：

```txt
Conclusion:
State the publishing rule.

Technical meaning:
Explain what TypeScript, npm, or Node reads.

Runtime mechanism:
Explain what consumers actually import and execute.

Config example:
Keep one minimal package or tsconfig example.

Common mistake:
Write one mistake and correction.

Project relation:
Explain how this applies to a reusable SDK, UI library, or shared package.
```

必须包含这些对比：

同时必须在每节第一次出现配置字段时写明：字段属于哪个文件、由哪个工具读取、是否影响 runtime、是否影响 types、是否影响 package metadata。

```txt
application project vs library project
source API vs public API
internal module vs exported entry
JavaScript output vs declaration output
main vs module vs types vs exports
ESM output vs CJS output
peerDependencies vs dependencies vs devDependencies
side-effect-free module vs side-effect module
tree shaking vs TypeScript type erasure
npm pack dry run vs repository file list
patch vs minor vs major release
consumer test vs unit test
```

---

## 17. 最终要能回答的问题

1. 应用项目和库项目的构建目标有什么不同？
2. 为什么 `src/index.ts` 是 public API 边界？
3. 为什么库项目必须输出 `.d.ts`？
4. `declaration` 和 `emitDeclarationOnly` 分别做什么？
5. `.d.ts` 中会保留实现细节吗？
6. package.json 的 `types` 字段解决什么？
7. `main`、`module`、`exports` 的关系是什么？
8. ESM / CJS 双输出为什么复杂？
9. `exports` map 为什么能保护内部文件？
10. subpath exports 适合什么场景？
11. React 组件库为什么通常把 React 放 peerDependencies？
12. peerDependencies 和 devDependencies 为什么可能同时出现？
13. `sideEffects` 字段会影响什么？
14. 为什么全局注册模块不能轻易被当成 side-effect-free？
15. `npm pack --dry-run` 检查什么？
16. 类型变更为什么也可能是 breaking change？
17. consumer test 和普通 unit test 有什么区别？
18. 发布前完整检查链应该包含什么？
19. 这些能力如何支撑你做可写进简历的工程项目？

---

## 18. 最终记忆模型

```txt
Library publishing is public API discipline.

Source:
  TypeScript modules
  internal files
  implementation details

Build:
  JavaScript output
  declaration output
  source maps

Package:
  exports
  types
  files
  dependencies
  sideEffects

Consumer:
  imports public entry
  gets runtime code
  gets type declarations
  should not depend on internals
```

### 最终一句话

真正的库发布学习，不是把代码打包成 dist，而是能控制消费者看到什么、运行什么、获得什么类型、依赖什么版本，以及未来哪些改动会破坏他们。

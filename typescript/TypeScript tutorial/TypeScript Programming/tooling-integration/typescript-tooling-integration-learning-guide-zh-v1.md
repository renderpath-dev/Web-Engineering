# TypeScript 做项目前补充 02：工程工具链整合学习指导文件 v1

> 定位：这是做真实前端项目之前必须补的 TypeScript 工具链整合学习指导文件，不是最终学习笔记。  
> 目标：按照这份文件训练 Vite + React + TypeScript、Next.js + TypeScript、Node ESM + TypeScript、ESLint + typescript-eslint、Vitest、路径别名一致性、环境变量类型和 CI 检查。  
> 参考范围：TypeScript 官方 TSConfig、Modules Reference、Vite 官方 TypeScript 文档、Next.js 官方 TypeScript 文档、Node.js 官方 TypeScript 文档、typescript-eslint 官方文档、Vitest 官方文档。  
> 代码规则：代码命名、字符串和代码注释统一英文；代码块中不使用中文字符。  
> 学习原则：先区分 type checking、transpilation、bundling、linting、testing、runtime execution，再配置工具。不要把工具链学成“复制配置文件”。

---

## 目录

- [官方文档对应关系](#官方文档对应关系)
- [1. 本文件怎么用](#1-本文件怎么用)
- [2. 项目重新整理建议](#2-项目重新整理建议)
- [3. 本章先要建立的底层模型](#3-本章先要建立的底层模型)
- [4. 00：工具链到底在解决什么](#4-00工具链到底在解决什么)
- [5. 01：tsc、transpiler、bundler 的分工](#5-01tsctranspilerbundler-的分工)
- [6. 02：Vite + React + TypeScript](#6-02vite--react--typescript)
- [7. 03：Next.js + TypeScript](#7-03nextjs--typescript)
- [8. 04：Node ESM + TypeScript](#8-04node-esm--typescript)
- [9. 05：ESLint + typescript-eslint](#9-05eslint--typescript-eslint)
- [10. 06：Vitest + TypeScript](#10-06vitest--typescript)
- [11. 07：路径别名和运行时解析一致性](#11-07路径别名和运行时解析一致性)
- [12. 08：环境变量类型](#12-08环境变量类型)
- [13. 09：CI 类型检查流水线](#13-09ci-类型检查流水线)
- [14. 10：小项目整合](#14-10小项目整合)
- [15. 最终文件清单](#15-最终文件清单)
- [16. 最终学习笔记转换要求](#16-最终学习笔记转换要求)
- [17. 最终要能回答的问题](#17-最终要能回答的问题)
- [18. 最终记忆模型](#18-最终记忆模型)

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| TypeScript 模块、模块解析、NodeNext、Bundler | https://www.typescriptlang.org/docs/handbook/modules/reference.html |
| `moduleResolution`、`paths`、`types`、`jsx`、`noEmit`、`isolatedModules` | https://www.typescriptlang.org/tsconfig |
| Vite TypeScript 支持、transpile only、HMR、`import.meta.env`、`import.meta.glob` | https://vite.dev/guide/features.html#typescript |
| Next.js TypeScript、App Router type helpers、typed routes、`next-env.d.ts`、custom tsconfig | https://nextjs.org/docs/app/api-reference/config/typescript |
| Node.js TypeScript runtime support | https://nodejs.org/api/typescript.html |
| typescript-eslint flat config、recommended config、typed linting | https://typescript-eslint.io/getting-started/ |
| Vitest 安装、测试文件、config、type testing | https://vitest.dev/guide/ |

---

## 1. 本文件怎么用

### 结论

工具链学习的核心不是记配置，而是分清每个工具负责哪一步。

```txt
tsc:
  type checking and declaration emit

transpiler:
  convert TypeScript syntax to JavaScript quickly

bundler:
  collect modules and assets into browser-ready output

runtime:
  execute JavaScript

linter:
  catch code quality issues and selected type-aware mistakes

test runner:
  execute behavior tests and selected type contract tests
```

### 每节固定学习步骤

```txt
1. Read the conclusion first.
2. Decide which phase is involved: check, transpile, bundle, run, lint, test, or publish.
3. Create the config file.
4. Add a script to package.json.
5. Run the script.
6. Break one rule intentionally.
7. Observe which tool reports the error.
8. Write the mechanism into notes/typescript.md.
```

---

## 2. 项目重新整理建议

### 结论

建议新增：

```txt
typescript/tooling-integration/
```

### 推荐结构

```txt
typescript/
  tooling-integration/
    README.md
    00-toolchain-model/
      toolchainMap.md
      packageScripts.json
      phaseVocabulary.md
      typeOnlyRuntimeBoundary.ts
      configFieldRoles.md
      resolutionOwnerMap.md
    01-tsc-transpile-bundle/
      tsconfig.base.json
      tsconfig.check.json
      transpileOnlyRisk.ts
      diagnosticOwnerBoundary.ts
    02-vite-react-ts/
      package.json
      tsconfig.json
      tsconfig.app.json
      tsconfig.node.json
      vite.config.ts
      src/App.tsx
      src/vite-env.d.ts
    03-nextjs-ts/
      next.config.ts
      tsconfig.json
      app/page.tsx
      app/products/[id]/page.tsx
      app/example-client.tsx
      nextGeneratedTypesBoundary.md
    04-node-esm-ts/
      package.json
      tsconfig.json
      src/index.ts
      src/config.ts
      nodeEsmImportExtensionBoundary.md
    05-eslint-typescript/
      eslint.config.mjs
      unsafeBoundary.ts
      typedLintingNotes.md
    06-vitest-typescript/
      package.json
      vitest.config.ts
      src/sum.ts
      src/sum.test.ts
      src/type-contract.test-d.ts
    07-path-alias-consistency/
      tsconfig.json
      vite.config.ts
      src/domain/product.ts
      src/app.ts
      aliasResolutionOwnership.md
    08-env-typing/
      vite-env.d.ts
      next-env-notes.md
      envReader.ts
    09-ci-checks/
      package.json
      ciCommands.md
      checkOrder.md
      failureOwnerMatrix.md
    10-mini-project/
      package.json
      tsconfig.json
      vite.config.ts
      eslint.config.mjs
      vitest.config.ts
      src/domain/product.ts
      src/domain/product.test.ts
      src/domain/product.type.test-d.ts
      src/App.tsx
```


### `README.md`

```md
# TypeScript Tooling Integration

## Goal

Build a small set of TypeScript tooling exercises that separate checking, transpilation, bundling, linting, testing, runtime execution, and CI verification.

## Study order

1. Toolchain model
2. tsc, transpiler, and bundler
3. Vite React TypeScript
4. Next.js TypeScript
5. Node ESM TypeScript
6. ESLint with TypeScript
7. Vitest with TypeScript
8. Path aliases
9. Environment typing
10. CI checks
11. Mini project
```

---

## 3. 本章先要建立的底层模型

### 结论

工具链有五个边界：

```txt
source boundary:
  .ts and .tsx files

static boundary:
  tsc and ESLint inspect source code

transform boundary:
  Vite, Next, SWC, Oxc, esbuild, Babel transform source code

runtime boundary:
  browser or Node executes JavaScript

verification boundary:
  tests and CI catch behavior and integration errors
```

### 常见工具职责

| 工具 | 职责 |
|---|---|
| `tsc --noEmit` | 类型检查，不输出 JavaScript。 |
| `vite dev` | 快速开发服务器和 HMR。 |
| `vite build` | 生产打包。 |
| `next dev` | Next 开发服务器和框架类型集成。 |
| `next build` | Next 生产构建和类型检查。 |
| `eslint .` | 代码质量和规则检查。 |
| `vitest` | 开发测试监听。 |
| `vitest run` | CI 中一次性运行测试。 |

### 本章第一次出现就必须讲清楚的配置角色

这章不把配置项当作可复制的模板。只要字段出现在文件里，就必须说明它被哪个工具读取、处在哪个阶段、是否影响运行时。

| 片段 | 角色 | 读取者 | 阶段 | 是否直接运行 |
|---|---|---|---|---|
| `scripts` | npm script table | npm | command orchestration | 是，执行命令 |
| `compilerOptions` | TypeScript compiler options | TypeScript | type checking / emit planning | 否 |
| `moduleResolution` | module lookup mode | TypeScript | static resolution | 否 |
| `module` | emitted module model or checker model | TypeScript | emit / module checking | 可能影响输出 |
| `jsx` | JSX transform/checking mode | TypeScript / framework | transform/checking | 可能影响输出 |
| `types` | included ambient type packages | TypeScript | type program construction | 否 |
| `paths` | TypeScript-only alias mapping | TypeScript | static resolution | 否 |
| `resolve.alias` | bundler runtime alias mapping | Vite | bundling/runtime resolution | 是，影响打包 |
| `import.meta.env` | framework-provided env object | Vite | runtime after replacement/loading | 是 |
| `process.env` | Node runtime env object | Node | runtime execution | 是 |

### 本章第一次出现就必须区分的边界

| 对比 | 必须掌握的结论 |
|---|---|
| type checking vs transpilation | 前者需要全项目类型信息；后者按文件把 TS 语法转成 JS。 |
| transpilation vs bundling | 前者处理单文件语法；后者处理模块图、依赖和资源。 |
| TS resolution vs runtime resolution | `tsconfig.paths` 只服务 TypeScript；运行时或 bundler 要另配。 |
| type declaration vs runtime validation | `.d.ts` 和 env 类型只改善类型体验，不验证真实输入。 |
| dev server vs CI | dev server优化反馈速度；CI 负责可重复的完整检查链。 |

---

## 4. 00：工具链到底在解决什么

### 结论

工具链解决的是“源码如何被检查、转换、打包、运行、测试和部署”的问题。

### `toolchainMap.md`

```md
# Toolchain Map

## Type checking

Tool: tsc
Command: npm run typecheck
Output: diagnostics only

## Transpilation

Tool: Vite, Next.js, SWC, esbuild, or Babel
Output: JavaScript transformed from TypeScript syntax

## Bundling

Tool: Vite, Next.js, or another bundler
Output: browser-ready module graph

## Linting

Tool: ESLint and typescript-eslint
Output: code quality diagnostics

## Testing

Tool: Vitest
Output: runtime behavior results and type contract checks

## CI verification

Tool: npm scripts
Output: repeatable project health signal
```


### `packageScripts.json`

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:type": "vitest --typecheck",
    "build": "vite build",
    "check": "npm run typecheck && npm run lint && npm run test:run && npm run build"
  }
}
```

### `phaseVocabulary.md`

```md
# Phase Vocabulary

## Type checking

Input: TypeScript source files and declaration files.
Owner: TypeScript compiler.
Output: diagnostics.
Runtime effect: none.

## Transpilation

Input: one source file at a time.
Owner: Vite, Next.js, SWC, Oxc, esbuild, Babel, or TypeScript.
Output: JavaScript syntax output.
Runtime effect: creates JavaScript that can run.

## Bundling

Input: module graph.
Owner: Vite, Next.js, Rollup, Turbopack, Webpack, or another bundler.
Output: deployable chunks and assets.
Runtime effect: controls what the browser or server loads.

## Linting

Input: source files and optional type information.
Owner: ESLint and plugins.
Output: rule diagnostics.
Runtime effect: none.

## Testing

Input: test files and source files.
Owner: Vitest or another test runner.
Output: behavior results and optional type test results.
Runtime effect: executes test code.
```

### `typeOnlyRuntimeBoundary.ts`

```ts
// Goal:
// Separate TypeScript-only declarations from runtime values.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

const product: ProductRecord = {
  id: "p1",
  title: "Keyboard",
};

console.log(typeof product);
console.log(product.title);
```

### `configFieldRoles.md`

```md
# Config Field Roles

## package.json scripts

Read by npm.
Runs shell commands.
Does not type-check by itself.

## tsconfig compilerOptions

Read by TypeScript and tools that model TypeScript.
Controls checking, resolution, JSX behavior, and emit planning.
Does not run application code.

## vite.config.ts

Read by Vite.
Controls dev server, plugins, aliases, and build behavior.
May affect runtime module resolution in bundled output.

## eslint.config.mjs

Read by ESLint.
Controls lint rules and parser behavior.
Does not emit JavaScript.

## vitest.config.ts

Read by Vitest.
Controls test environment, matching, globals, coverage, and type test integration.
Runs test code.
```

### `resolutionOwnerMap.md`

```md
# Resolution Owner Map

## TypeScript

Reads tsconfig moduleResolution, baseUrl, paths, types, and package metadata.
Reports whether imports are valid for the TypeScript program.

## Vite

Reads vite.config.ts and package metadata.
Builds the browser module graph and applies resolve.alias.

## Next.js

Reads Next config, tsconfig, generated types, and framework conventions.
Builds server and client module graphs.

## Node.js

Reads package.json type, file extensions, package exports, and runtime specifiers.
Executes JavaScript according to Node module rules.

## ESLint

Reads eslint config and optionally TypeScript project information.
Reports rule violations.

## Vitest

Reads vitest config and Vite resolution behavior.
Executes tests and optional type tests.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| Vite 能运行就代表没有 TS 错误 | Vite 默认只转译，不完整类型检查。 |
| ESLint 能替代 tsc | ESLint 和 tsc 检查不同层面。 |
| 测试通过就代表类型安全 | 测试和类型检查互补。 |

---

## 5. 01：tsc、transpiler、bundler 的分工

### 结论

`tsc` 负责类型检查和声明输出；Vite / Next 的内部转译器负责快速把 TS 变成 JS；bundler 负责把模块图打包给浏览器。

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "react-jsx",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

### `tsconfig.check.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["dist", "node_modules"]
}
```


### `transpileOnlyRisk.ts`

```ts
// Goal:
// Show why transpilation is not the same as type checking.

// Expected result:
// A transpiler can output JavaScript while tsc reports a type error.

export {};

function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

// @ts-expect-error: The argument must be a number.
console.log(formatPrice("9900"));
```

### `diagnosticOwnerBoundary.ts`

```ts
// Goal:
// Show which tool should report a type-only mistake.

export {};

type ProductRecord = {
  id: string;
  priceCents: number;
};

const product: ProductRecord = {
  id: "p1",
  // @ts-expect-error: priceCents must be a number.
  priceCents: "9900",
};

console.log(product.id);
```

### 执行命令

```bash
npx tsc --noEmit
```

### 常见错误

```txt
Mistake:
  The dev server is green, so the project is type-safe.

Correct:
  Run tsc --noEmit separately, especially in CI.
```

---

## 6. 02：Vite + React + TypeScript

### 结论

Vite 适合 React 项目的快速开发，但 TypeScript 类型检查要和 Vite 转译分开跑。

### `package.json`

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc -b --pretty",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

### `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  },
  "include": ["vite.config.ts"]
}
```

### `vite.config.ts`

```ts
// Goal:
// Type Vite configuration.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### `src/App.tsx`

```tsx
// Goal:
// Read a typed Vite environment variable.

export function App() {
  return <p>{import.meta.env.VITE_API_BASE_URL}</p>;
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 只跑 `vite build` | 建议 `tsc -b && vite build`。 |
| `moduleResolution` 随便设 | Vite 前端代码常用 `Bundler`。 |
| 修改 env 类型后不重启 IDE | 类型声明有时需要 IDE 重新加载。 |

---

## 7. 03：Next.js + TypeScript

### 结论

Next.js 内置 TypeScript 集成，但你仍然要理解 `next-env.d.ts`、App Router 类型助手、typed routes、server/client 边界和独立 `tsconfig`。

### `next.config.ts`

```ts
// Goal:
// Type a Next.js config file.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
};

export default nextConfig;
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": ["node_modules"]
}
```

### `app/page.tsx`

```tsx
// Goal:
// Use a server component with typed data.

type ProductRecord = {
  id: string;
  title: string;
};

async function loadProducts(): Promise<ProductRecord[]> {
  return [{ id: "p1", title: "Keyboard" }];
}

export default async function Page() {
  const products = await loadProducts();

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.title}</li>
      ))}
    </ul>
  );
}
```

### `app/products/[id]/page.tsx`

```tsx
// Goal:
// Use a typed dynamic route parameter in a Next.js App Router page.

// Expected result:
// The page reads the product id from params and renders it.

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;

  return <h1>Product {params.id}</h1>;
}
```


### `app/example-client.tsx`

```tsx
// Goal:
// Keep client-side state inside a Client Component.

"use client";

import { useState } from "react";

export default function ExampleClient() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}
```

### `nextGeneratedTypesBoundary.md`

```md
# Next Generated Types Boundary

## next-env.d.ts

Owner: Next.js.
Purpose: include Next-specific ambient types.
Rule: do not edit manually.

## .next/types

Owner: Next.js.
Purpose: generated route and environment helper declarations.
Rule: include generated files in the TypeScript program when the feature requires it.

## Client component marker

Owner: React and Next.js.
Purpose: mark a module as a Client Component boundary.
Runtime effect: yes.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 修改 `next-env.d.ts` | 这是生成文件，不要手改。 |
| Client hooks 放进 Server Component | 需要 `"use client"`。 |
| typed routes 开了但没 include `.next/types` | 生成类型必须进入 TS 程序。 |
| 忽略 build 阶段 TS 错误 | 生产构建不应该带类型错误。 |

---

## 8. 04：Node ESM + TypeScript

### 结论

Node ESM + TypeScript 的重点是：`package.json` 的 `type`、`module` / `moduleResolution`、运行时扩展名、Node 类型声明和执行方式必须一致。

### `package.json`

```json
{
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "types": ["node"],
    "strict": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### `src/index.ts`

```ts
// Goal:
// Import another TypeScript source through a runtime .js specifier.

import { readConfig } from "./config.js";

const config = readConfig();

console.log(config.port);
```

### `src/config.ts`

```ts
// Goal:
// Read and validate Node runtime configuration.

// Expected result:
// Return a typed configuration object.

export type AppConfig = {
  port: number;
};

export function readConfig(): AppConfig {
  const rawPort = process.env.PORT ?? "3000";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("Invalid PORT");
  }

  return { port };
}
```


### `nodeEsmImportExtensionBoundary.md`

```md
# Node ESM Import Extension Boundary

## Source file

File: src/index.ts
Specifier: ./config.js
Reason: the emitted JavaScript file is dist/config.js.

## TypeScript checker

Mode: NodeNext.
Behavior: allows the source import to point at the future JavaScript output path.

## Node runtime

Input: dist/index.js.
Rule: Node resolves the exact runtime specifier.
Result: ./config.js must exist after build.
```

### 常见错误

```txt
Mistake:
  Import ./config in NodeNext ESM output.

Correct:
  Use ./config.js in the TypeScript source so emitted JavaScript can run in Node.
```

---

## 9. 05：ESLint + typescript-eslint

### 结论

`typescript-eslint` 让 ESLint 能解析并检查 TypeScript。普通 recommended rules 不需要类型信息；typed linting 需要读取 TS project，成本更高但规则更强。

### `eslint.config.mjs`

```js
// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
);
```

### `unsafeBoundary.ts`

```ts
// Goal:
// Keep unknown data near the boundary.

export {};

function parseJson(text: string): unknown {
  return JSON.parse(text) as unknown;
}

const value = parseJson('{"id":"p1"}');

console.log(value);
```

### `typedLintingNotes.md`

```md
# Typed Linting Notes

## Recommended rules

Recommended rules parse TypeScript syntax and catch common code quality issues. They do not require full type information.

## Typed rules

Typed rules ask TypeScript for semantic information. They can catch stronger mistakes, but they need a project configuration and cost more time.

## Practical rule

Start with non-typed recommended rules. Add typed linting only when the project needs rules that depend on type information.
```


### 常见错误

| 错误 | 正确模型 |
|---|---|
| ESLint 替代 TypeScript | ESLint 是规则检查，TypeScript 是类型系统。 |
| 所有规则都开 typed linting | 先按项目规模评估性能。 |
| 格式化规则和 Prettier 混在一起 | 格式化和逻辑检查要分清。 |

---

## 10. 06：Vitest + TypeScript

### 结论

Vitest 用来验证运行时行为；`tsc --noEmit` 用来验证类型；类型测试可以专门测试 public API 的推导结果。

### `package.json`

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:type": "vitest --typecheck",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

### `vitest.config.ts`

```ts
// Goal:
// Type Vitest configuration.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node"
  }
});
```

### `src/sum.ts`

```ts
// Goal:
// Export a simple function to test.

export function sum(leftValue: number, rightValue: number): number {
  return leftValue + rightValue;
}
```

### `src/sum.test.ts`

```ts
// Goal:
// Test runtime behavior with Vitest.

import { describe, expect, test } from "vitest";
import { sum } from "./sum";

describe("sum", () => {
  test("adds two numbers", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

### `src/type-contract.test-d.ts`

```ts
// Goal:
// Test public type contracts with Vitest type helpers.

import { expectTypeOf } from "vitest";
import { sum } from "./sum";

expectTypeOf(sum).parameter(0).toEqualTypeOf<number>();
expectTypeOf(sum).returns.toEqualTypeOf<number>();
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 单元测试能替代类型检查 | 测试运行值，类型检查检查类型空间。 |
| 所有测试都开 globals | 显式 import 更利于理解依赖。 |
| 类型测试和运行时测试混在一个目标里 | 可以分开 `test` 和 `typecheck`。 |

---

## 11. 07：路径别名和运行时解析一致性

### 结论

`paths` 只告诉 TypeScript 如何解析类型；Vite、Next、Node、Vitest、ESLint 也要理解同样的别名规则，否则编译期和运行时会分裂。

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"]
    },
    "strict": true,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

### `vite.config.ts`

```ts
// Goal:
// Make Vite resolve the same alias as TypeScript.

import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@domain": fileURLToPath(new URL("./src/domain", import.meta.url)),
    },
  },
});
```

### `src/domain/product.ts`

```ts
// Goal:
// Export a domain module that can be imported through an alias.

// Expected result:
// TypeScript and Vite can resolve the same alias target.

export type ProductRecord = {
  id: string;
  title: string;
};

export function createProductLabel(product: ProductRecord): string {
  return `${product.id}:${product.title}`;
}
```

### `src/app.ts`

```ts
// Goal:
// Import the domain module through the configured path alias.

// Expected result:
// The import works only when TypeScript and the runtime tool agree on the alias.

import { createProductLabel } from "@domain/product";

const label = createProductLabel({
  id: "p1",
  title: "Keyboard",
});

console.log(label);
```


### `aliasResolutionOwnership.md`

```md
# Alias Resolution Ownership

## TypeScript paths

Owner: TypeScript.
File: tsconfig.json.
Effect: editor and type checker can resolve the alias.
Runtime effect: none.

## Vite resolve.alias

Owner: Vite.
File: vite.config.ts.
Effect: dev server and production build can resolve the alias.
Runtime effect: yes, through bundled output.

## Node runtime

Owner: Node.js.
Input: JavaScript specifiers.
Effect: Node does not read tsconfig paths by default.
```

### 常见错误

```txt
Mistake:
  paths makes aliases work everywhere.

Correct:
  paths is for TypeScript resolution. Each runtime or bundler must also know the alias.
```

---

## 12. 08：环境变量类型

### 结论

环境变量永远是运行时输入。类型声明可以让访问更舒服，但不能验证真实环境值。真实项目要把 env 读取集中到一个模块里验证。

### `vite-env.d.ts`

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_FEATURE_SEARCH: "enabled" | "disabled";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### `next-env-notes.md`

```md
# Next Environment Notes

## Server environment

Server code can read process.env directly, but the value is still string or undefined at runtime. Validate it before use.

## Client environment

Client-exposed variables must follow the framework prefix rule. In Next.js, public browser variables use NEXT_PUBLIC_.

## Type boundary

Type declarations improve editor feedback. They do not create runtime variables and they do not validate deployed configuration.
```


### `envReader.ts`

```ts
// Goal:
// Validate runtime environment values.

export type AppEnv = {
  apiBaseUrl: string;
  featureSearch: boolean;
};

export function readAppEnv(rawEnv: Record<string, string | undefined>): AppEnv {
  const apiBaseUrl = rawEnv.VITE_API_BASE_URL;

  if (apiBaseUrl === undefined || apiBaseUrl.length === 0) {
    throw new Error("Missing VITE_API_BASE_URL");
  }

  return {
    apiBaseUrl,
    featureSearch: rawEnv.VITE_FEATURE_SEARCH === "enabled",
  };
}
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| env 类型声明等于 env 存在 | 声明不创建运行时值。 |
| 客户端能读所有环境变量 | Vite 和 Next 都有客户端暴露规则。 |
| 每个文件直接读 env | 集中读取并验证。 |

---

## 13. 09：CI 类型检查流水线

### 结论

真实项目要在 CI 里至少跑：类型检查、lint、测试、构建。顺序要能最快暴露错误。

### `package.json`

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test:run": "vitest run",
    "build": "vite build",
    "check": "npm run typecheck && npm run lint && npm run test:run && npm run build"
  }
}
```

### `ciCommands.md`

```txt
Local:
  npm run check

CI:
  npm ci
  npm run check
```

### `checkOrder.md`

```md
# Check Order

## Fast failure order

1. typecheck
2. lint
3. test:run
4. build

## Reason

Type checking catches broad source problems before tests start. Lint catches rule violations before behavior tests. Runtime tests verify behavior. Build verifies production output.

## CI command

Use the same command locally and in CI.

Command: npm run check
```


### `failureOwnerMatrix.md`

```md
# Failure Owner Matrix

## typecheck failure

Owner: TypeScript.
Meaning: the static type program is invalid.
Fix location: source types, imports, tsconfig, or declarations.

## lint failure

Owner: ESLint.
Meaning: a configured code rule failed.
Fix location: source style, safety rule, or lint config.

## test failure

Owner: Vitest.
Meaning: executed behavior did not match assertions.
Fix location: implementation or test expectation.

## build failure

Owner: Vite or framework build.
Meaning: production output could not be produced.
Fix location: imports, assets, environment, or bundler config.
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 只跑 build | build 可能不覆盖 lint 和测试。 |
| 本地和 CI 命令不同 | 尽量复用同一组 scripts。 |
| 类型错误允许上线 | 除迁移期外，不建议绕过类型错误。 |

---

## 14. 10：小项目整合

### 结论

小项目目标是建立一个最小但真实的 Vite React TypeScript 工程检查链：`typecheck`、`lint`、`test`、`build` 全部串起来。

### `package.json`

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:type": "vitest --typecheck",
    "build": "vite build",
    "check": "npm run typecheck && npm run lint && npm run test:run && npm run build"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest"
  },
  "devDependencies": {
    "@eslint/js": "latest",
    "eslint": "latest",
    "typescript-eslint": "latest",
    "vitest": "latest"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts", "eslint.config.mjs"]
}
```

### `vite.config.ts`

```ts
// Goal:
// Configure Vite for the mini React TypeScript project.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### `eslint.config.mjs`

```js
// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended,
);
```

### `vitest.config.ts`

```ts
// Goal:
// Configure Vitest for the mini project.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "jsdom",
  },
});
```


### `src/domain/product.ts`

```ts
// Goal:
// Export domain logic that can be tested.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export function formatProduct(product: ProductRecord): string {
  return `${product.title}:${(product.priceCents / 100).toFixed(2)}`;
}
```

### `src/domain/product.test.ts`

```ts
// Goal:
// Verify product formatting behavior.

import { expect, test } from "vitest";
import { formatProduct } from "./product";

test("formats a product", () => {
  expect(formatProduct({ id: "p1", title: "Keyboard", priceCents: 9900 })).toBe(
    "Keyboard:99.00",
  );
});
```

### `src/domain/product.type.test-d.ts`

```ts
// Goal:
// Verify the public type contract for product formatting.

import { expectTypeOf } from "vitest";
import { formatProduct } from "./product";

expectTypeOf(formatProduct).parameter(0).toEqualTypeOf<{
  id: string;
  title: string;
  priceCents: number;
}>();

expectTypeOf(formatProduct).returns.toEqualTypeOf<string>();
```

### `src/App.tsx`

```tsx
// Goal:
// Use typed domain logic in React.

import { formatProduct } from "./domain/product";

export function App() {
  const label = formatProduct({
    id: "p1",
    title: "Keyboard",
    priceCents: 9900,
  });

  return <p>{label}</p>;
}
```

### 小项目执行过程

| 步骤 | 命令 | 验证什么 |
|---|---|---|
| 1 | `npm run typecheck` | TypeScript 类型系统。 |
| 2 | `npm run lint` | 规则和代码质量。 |
| 3 | `npm run test:run` | 运行时行为。 |
| 4 | `npm run build` | 生产构建和打包。 |
| 5 | `npm run check` | 全链路项目健康状态。 |

---

## 15. 最终文件清单

```txt
typescript/
  tooling-integration/
    README.md
    00-toolchain-model/
      toolchainMap.md
      packageScripts.json
      phaseVocabulary.md
      typeOnlyRuntimeBoundary.ts
      configFieldRoles.md
      resolutionOwnerMap.md
    01-tsc-transpile-bundle/
      tsconfig.base.json
      tsconfig.check.json
      transpileOnlyRisk.ts
      diagnosticOwnerBoundary.ts
    02-vite-react-ts/
      package.json
      tsconfig.json
      tsconfig.app.json
      tsconfig.node.json
      vite.config.ts
      src/App.tsx
      src/vite-env.d.ts
    03-nextjs-ts/
      next.config.ts
      tsconfig.json
      app/page.tsx
      app/products/[id]/page.tsx
      app/example-client.tsx
      nextGeneratedTypesBoundary.md
    04-node-esm-ts/
      package.json
      tsconfig.json
      src/index.ts
      src/config.ts
      nodeEsmImportExtensionBoundary.md
    05-eslint-typescript/
      eslint.config.mjs
      unsafeBoundary.ts
      typedLintingNotes.md
    06-vitest-typescript/
      package.json
      vitest.config.ts
      src/sum.ts
      src/sum.test.ts
      src/type-contract.test-d.ts
    07-path-alias-consistency/
      tsconfig.json
      vite.config.ts
      src/domain/product.ts
      src/app.ts
      aliasResolutionOwnership.md
    08-env-typing/
      vite-env.d.ts
      next-env-notes.md
      envReader.ts
    09-ci-checks/
      package.json
      ciCommands.md
      checkOrder.md
      failureOwnerMatrix.md
    10-mini-project/
      package.json
      tsconfig.json
      vite.config.ts
      eslint.config.mjs
      vitest.config.ts
      src/domain/product.ts
      src/domain/product.test.ts
      src/domain/product.type.test-d.ts
      src/App.tsx
notes/
  typescript.md
```

---

## 16. 最终学习笔记转换要求

### `notes/typescript.md`

```md
# TypeScript Tooling Integration Notes

## Phase model

Type checking, transpilation, bundling, linting, testing, runtime execution, and CI verification are separate phases.

## Tool ownership

Each configuration field must be explained by owner, phase, input, output, and runtime effect.

## Project rule

A real project should run typecheck, lint, test, and build with one repeatable check command.
```

每节笔记按这个结构整理：

```txt
Conclusion:
State the toolchain rule.

Technical meaning:
Explain what the tool checks or transforms.

Runtime mechanism:
Explain where the emitted JavaScript runs.

Config example:
Keep one minimal config.

Common mistake:
Write one mistake and correction.

Project relation:
Explain how this appears in Vite, Next.js, Node, CI, or tests.
```

必须包含这些对比：

```txt
type checking vs transpilation
transpilation vs bundling
Vite dev vs Vite build
tsc --noEmit vs tsc emit
moduleResolution Bundler vs NodeNext
React TSX app vs Next App Router
server component vs client component
ESLint syntax rules vs typed linting
Vitest runtime test vs type contract test
paths alias vs runtime alias
env type declaration vs runtime env validation
local check vs CI check
```

---

## 17. 最终要能回答的问题

1. 为什么 Vite 默认不做完整 TypeScript 类型检查？
2. `tsc --noEmit` 在项目里负责什么？
3. `moduleResolution: "Bundler"` 和 `"NodeNext"` 分别适合什么场景？
4. Vite 项目为什么经常拆 `tsconfig.app.json` 和 `tsconfig.node.json`？
5. Next.js 的 `next-env.d.ts` 是什么，为什么不能手改？
6. App Router 的 Server Component 和 Client Component 类型边界是什么？
7. typed routes 依赖什么生成类型？
8. Node ESM 项目为什么相对导入常写 `.js` 后缀？
9. ESLint 和 TypeScript 分别检查什么？
10. typed linting 为什么更慢？
11. Vitest 验证什么，不能验证什么？
12. 类型测试和运行时测试有什么区别？
13. `paths` 为什么不等于运行时别名？
14. 环境变量类型声明为什么不能替代运行时验证？
15. CI 里为什么要同时跑 typecheck、lint、test、build？
16. 这些工具如何服务简历项目的工程可信度？

---

## 18. 最终记忆模型

```txt
Tooling integration is phase separation.

TypeScript:
  checks types
  emits declarations
  can emit JavaScript

Vite and Next:
  transform and bundle
  optimize development workflow
  do not remove the need for tsc understanding

Node:
  executes JavaScript
  follows runtime module rules

ESLint:
  checks code patterns

Vitest:
  checks runtime behavior

CI:
  runs the same guarantees repeatedly
```

### 最终一句话

真正的项目工具链学习，不是复制配置，而是知道每个工具在哪个阶段保护你：类型检查保护类型边界，lint 保护代码规则，测试保护行为，build 保护生产输出，CI 保护团队协作和上线流程。

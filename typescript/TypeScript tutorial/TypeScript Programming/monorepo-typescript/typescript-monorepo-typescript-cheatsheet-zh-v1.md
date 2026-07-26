# TypeScript Monorepo Cheatsheet v1

> 定位：这是 `typescript/monorepo-typescript/` 的速查表，不替代学习指导文件。  
> 用法：完成练习后，用它快速复习 monorepo 关键字段、命令、边界和常见错误。  
> 代码规则：代码、命令、配置示例中不使用中文字符。

---

## 目录

1. [1. 核心 API / 配置总览](#1-核心-api--配置总览)
2. [2. package.json 固定字段速查](#2-packagejson-固定字段速查)
3. [3. tsconfig 固定字段速查](#3-tsconfig-固定字段速查)
4. [4. workspace 命令速查](#4-workspace-命令速查)
5. [5. Project References 命令速查](#5-project-references-命令速查)
6. [6. exports / imports / paths 对比](#6-exports--imports--paths-对比)
7. [7. dependencies / devDependencies / peerDependencies 对比](#7-dependencies--devdependencies--peerdependencies-对比)
8. [8. NodeNext / package type 速查](#8-nodenext--package-type-速查)
9. [9. task runner 配置速查](#9-task-runner-配置速查)
10. [10. 会生成文件的命令](#10-会生成文件的命令)
11. [11. 不会自动解决的问题](#11-不会自动解决的问题)
12. [12. 常见 IDE 警告](#12-常见-ide-警告)
13. [13. 决策表](#13-决策表)
14. [14. 最终记忆模型](#14-最终记忆模型)
15. [15. 官方文档链接](#15-官方文档链接)

---

## 1. 核心 API / 配置总览

| API / 配置 | 所属对象 | 作用 | 返回值 / 效果 | 常见坑 |
|---|---|---|---|---|
| `workspaces` | root `package.json` | 声明 workspace 路径 | package manager 识别本地包 | 不等于 TS references |
| `pnpm-workspace.yaml` | pnpm root | 声明 pnpm workspace | pnpm 发现 packages | pnpm 必须有 |
| `name` | package `package.json` | 定义包名 | 可通过包名导入 | 跨包导入要用它 |
| `dependencies` | package `package.json` | 运行时依赖 | 安装 / 链接依赖 | 内部包建议 workspace protocol |
| `peerDependencies` | package `package.json` | 调用方提供依赖 | 避免重复实例 | UI 库常用于 React |
| `exports` | package `package.json` | 公共导出入口 | 限制可导入路径 | 会阻止未导出深度导入 |
| `imports` | package `package.json` | 包内部 `#` alias | Node package-internal resolution | 不是对外 API |
| `types` | package `package.json` | 类型声明入口 | TS 读取 `.d.ts` | 指向文件必须存在 |
| `type` | package `package.json` | ESM / CJS 判定 | 控制 `.js` 解释方式 | 每个 package 独立 |
| `extends` | `tsconfig.json` | 继承配置 | 合并配置 | 路径相对当前配置 |
| `references` | `tsconfig.json` | 声明 TS 项目依赖 | `tsc -b` 使用依赖图 | 被引用项目要 composite |
| `composite` | `compilerOptions` | 让项目可被引用 | 强化构建约束 | 要配 declaration |
| `declaration` | `compilerOptions` | 输出 `.d.ts` | 类型声明文件 | public package 必备 |
| `declarationMap` | `compilerOptions` | 输出 `.d.ts.map` | 跨包源码跳转 | 多一个输出文件 |
| `paths` | `compilerOptions` | TS 路径映射 | 编译期解析 | 不自动影响 runtime |

---

## 2. package.json 固定字段速查

```json
{
  "name": "@demo/contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@demo/contracts": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

| 字段 | 作用 |
|---|---|
| `name` | 包名导入入口 |
| `private` | 阻止误发布 |
| `type` | `.js` 文件 ESM / CJS 解释方式 |
| `types` | 顶层类型声明入口 |
| `exports` | public API map |
| `imports` | package 内部 `#` alias |
| `scripts` | 包内任务入口 |
| `dependencies` | 运行时依赖 |
| `devDependencies` | 开发工具依赖 |
| `peerDependencies` | 调用方提供依赖 |

---

## 3. tsconfig 固定字段速查

```json
{
  "files": [],
  "references": [
    { "path": "./packages/contracts" },
    { "path": "./packages/ui" }
  ]
}
```

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
  },
  "include": ["src/**/*.ts"]
}
```

| 字段 | 所属位置 | 作用 | 常见坑 |
|---|---|---|---|
| `files: []` | root solution | 根不直接编译源码 | 不写可能重复包含 |
| `references` | root or package | TS 项目依赖图 | path 指向项目目录 |
| `extends` | package config | 继承共享配置 | 不继承 include |
| `rootDir` | package compilerOptions | 源码根目录 | 影响输出结构 |
| `outDir` | package compilerOptions | 输出目录 | 应该每包独立 |
| `tsBuildInfoFile` | package compilerOptions | incremental 信息文件 | 建议放进 dist |
| `include` | package config | 当前项目源码 | composite 要求文件被包含 |

---

## 4. workspace 命令速查

| 目标 | npm | pnpm |
|---|---|---|
| 所有包 typecheck | `npm run typecheck --workspaces --if-present` | `pnpm -r typecheck` |
| 所有包 build | `npm run build --workspaces --if-present` | `pnpm -r build` |
| 单包 build | `npm run build --workspace=@demo/contracts` | `pnpm --filter @demo/contracts build` |
| 单 app start | `npm run start --workspace=@demo/storefront` | `pnpm --filter @demo/storefront start` |

---

## 5. Project References 命令速查

| 命令 | 作用 | 是否生成输出 |
|---|---|---|
| `npx tsc -b` | 按 references 构建 | 是 |
| `npx tsc -b --verbose` | 打印构建原因 | 是 |
| `npx tsc -b --dry` | 显示构建计划 | 否 |
| `npx tsc -b --clean` | 清理构建输出 | 会删除输出 |
| `npx tsc -b --force` | 强制重建 | 是 |
| `npx tsc -p packages/contracts --noEmit` | 只检查单个项目 | 否 |
| `npx tsc --showConfig` | 查看合并配置 | 否 |
| `npx tsc --traceResolution` | 查看模块解析 | 否 |
| `npx tsc --explainFiles` | 查看文件进入项目原因 | 否 |

---

## 6. exports / imports / paths 对比

| 名称 | 所属文件 | 服务对象 | 是否影响运行时 | 用途 |
|---|---|---|---|---|
| `exports` | `package.json` | package consumer | 是 | 控制包对外可导入入口 |
| `imports` | `package.json` | package internal code | 是 | 控制包内部 `#` alias |
| `paths` | `tsconfig.json` | TypeScript checker | 否 | 编译期路径映射 |
| bundler alias | bundler config | bundler | 是 | 打包时路径映射 |
| test alias | test config | test runner | 是 | 测试运行时路径映射 |

```txt
Use exports for package consumers.
Use imports for package internals.
Use paths only when every runtime tool also understands the same alias.
```

---

## 7. dependencies / devDependencies / peerDependencies 对比

| 字段 | 谁安装 | 运行时需要 | 典型用途 | 常见坑 |
|---|---|---|---|---|
| `dependencies` | consumer install | 是 | 内部运行时包、工具库 | 不要把 React 重复塞进 UI 库 dependencies |
| `devDependencies` | 当前包开发 | 否 | TypeScript、测试工具、配置包 | 发布库不要依赖它提供运行时代码 |
| `peerDependencies` | consumer 提供 | 是 | React、Vue、框架插件宿主 | 版本范围要谨慎 |

---

## 8. NodeNext / package type 速查

| 配置 / 扩展名 | 含义 |
|---|---|
| `"type": "module"` | package 内 `.js` 按 ESM 解释 |
| `"type": "commonjs"` | package 内 `.js` 按 CJS 解释 |
| `.mjs` | 永远按 ESM |
| `.cjs` | 永远按 CJS |
| `.mts` | TS ESM source |
| `.cts` | TS CJS source |
| `"module": "NodeNext"` | TypeScript 按 Node 现代规则处理模块 |
| `"moduleResolution": "NodeNext"` | TypeScript 按 Node 现代规则解析模块 |

---

## 9. task runner 配置速查

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

| 字段 | 含义 | 常见坑 |
|---|---|---|
| `tasks` | 任务配置表 | 旧版文档可能叫 pipeline |
| `dependsOn` | 任务依赖 | `^build` 是依赖包的 build |
| `outputs` | 缓存输出 | `dist/**`、`.next/**` 等 |
| `inputs` | 缓存输入 | 可精细控制缓存失效 |
| `cache` | 是否缓存 | dev 通常 false |
| `persistent` | 是否持续运行 | dev server 常用 |

---

## 10. 会生成文件的命令

| 命令 | 生成内容 |
|---|---|
| `tsc -p package/tsconfig.json` | 按 package 配置生成 JS / d.ts |
| `tsc -b` | 按 references 生成所有过期项目输出 |
| `tsc -b --clean` | 删除构建输出 |
| `npm pack --dry-run` | 不写 tarball，但列出将打包文件 |
| `pnpm install` | 生成 lockfile，链接 workspace packages |
| `npm install` | 生成 lockfile，链接 npm workspaces |

---

## 11. 不会自动解决的问题

| 配置 / 工具 | 不会自动解决什么 |
|---|---|
| `workspaces` | 不会设计 TypeScript 项目边界 |
| `references` | 不会定义 package public API |
| `exports` | 不会自动生成 `.d.ts` |
| `types` | 不会让运行时代码存在 |
| `paths` | 不会让 Node 运行时认识 alias |
| `task runner` | 不会修复错误的 package dependency |
| `workspace:*` | 不会检查架构依赖方向 |
| `private: true` | 不会阻止本地导入，只阻止发布 |

---

## 12. 常见 IDE 警告

| 现象 | 分类 | 处理方式 |
|---|---|---|
| 找不到 workspace package | IDE project loading issue | 重新 install，打开 repo root，重启 TS service |
| CLI 通过但 IDE 报错 | TypeScript version mismatch | 检查 IDE 使用的 TS 版本 |
| Go to Definition 跳到 `.d.ts` | declaration navigation issue | 开启 `declarationMap` |
| 修改内部包后 app 类型没更新 | stale build output | `tsc -b --clean` 后重建 |
| paths alias 在 IDE 正常但测试失败 | runtime resolver mismatch | 配 test runner alias 或改用 package imports |
| VS Code 使用错误 TypeScript | editor SDK issue | 选择 workspace TypeScript version |

---

## 13. 决策表

| 场景 | 推荐选择 |
|---|---|
| 小型单 app 项目 | 不需要 monorepo |
| app + shared contracts + UI package | monorepo 值得考虑 |
| 多个 app 共享 UI 和 API 类型 | monorepo 很合适 |
| 只是想少写相对路径 | 不要用 monorepo 解决 |
| 内部包需要稳定 public API | package exports + types |
| 内部包只给当前 app 用 | 可以 private |
| 需要 TS 构建图 | project references |
| 使用 Turborepo 缓存任务 | package-level tsconfig + task graph |
| 包内部 alias | package imports |
| 跨包导入 | package name import |
| 运行时 alias | bundler / Node config |
| 编译期 alias | TypeScript paths |
| 发布库 | files + exports + types + npm pack check |
| app package | private true |

---

## 14. 最终记忆模型

```txt
Monorepo:
  repository-level organization.

Workspace:
  package-manager-level linking.

Package:
  dependency and public API boundary.

tsconfig:
  TypeScript checking and build boundary.

Project references:
  TypeScript dependency graph.

exports:
  runtime and package public entry boundary.

types:
  declaration entry boundary.

Task runner:
  workflow graph and cache boundary.

Editor:
  language-service view of the same graph.
```

---

## 15. 官方文档链接

- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces/)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [Node.js Packages](https://nodejs.org/api/packages.html)
- [Turborepo TypeScript Guide](https://turborepo.dev/docs/guides/tools/typescript)

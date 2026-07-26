# TypeScript 第 9 章“前后端框架”学习指导文件 v1

> 定位：这是 TypeScript 第 9 章“前后端框架”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` / `.tsx` 文件、运行 `tsc` 类型检查、观察编译错误或运行输出，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 9 章“前后端框架”，TypeScript 官方 Handbook / Reference 的 JSX、Object Types、Narrowing、More on Functions、Generics、Modules、Declaration Files、Utility Types，以及 TSConfig 官方文档中的 `jsx`、`lib`、`types`、`module`、`moduleResolution`。React 和 Angular 部分额外参考各自官方 TypeScript / template type checking 文档。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解 TypeScript 在框架中的职责，再理解 React、Angular、API client、backend handler 如何把类型边界串起来。不要把本章学成“React 类型速查表”或“后端框架模板”。

> 重要说明：书上第 9 章提到 Angular 6/7。这里保留“Angular 与 TypeScript 框架集成”的学习目标，但示例按现代 Angular 类型检查思路组织，不绑定旧版本 API。React 也按现代 React + TypeScript 方式组织，不使用已经过时的 `React.FC` 作为默认教学模型。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| JSX 文件扩展名、`jsx` 编译选项、intrinsic elements、value-based elements、组件 props 检查、`.tsx` 中必须用 `as` 断言 | [TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) |
| `jsx` 输出模式：`preserve`、`react`、`react-jsx`、`react-jsxdev`、`react-native` | [TSConfig jsx](https://www.typescriptlang.org/tsconfig/jsx.html) |
| DOM、DOM.Iterable、Promise、ES 库声明如何进入类型系统 | [TSConfig lib](https://www.typescriptlang.org/tsconfig/lib.html) |
| 限制或指定全局 `@types/*` 包进入项目 | [TSConfig types](https://www.typescriptlang.org/tsconfig/types.html) |
| 模块边界、`import` / `export`、type-only import/export | [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) |
| props、API payload、route params、handler context 的对象结构建模 | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) |
| API response、UI state、错误状态的判别联合和控制流收窄 | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| callback props、event handlers、middleware handlers、generic helpers | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| API contract、repository、service、typed client 的泛型关系 | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| `Awaited`、`ReturnType`、`Parameters`、`Pick`、`Omit`、`Readonly` 等派生类型 | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| 为第三方库、插件或框架扩展写类型声明 | [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) |
| React 组件 props、Hooks、事件类型、Context 的官方 TypeScript 使用方式 | [React Using TypeScript](https://react.dev/learn/typescript) |
| Angular 模板类型检查、strict templates、输入输出绑定检查 | [Angular Template Type Checking](https://angular.dev/tools/cli/template-typecheck) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 9 章完整学习顺序](#3-第-9-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：框架里的 TypeScript 到底在解决什么](#5-00框架里的-typescript-到底在解决什么)
6. [01：TSX、JSX 和框架编译边界](#6-01tsxjsx-和框架编译边界)
7. [02：React 组件 props 建模](#7-02react-组件-props-建模)
8. [03：React children、事件和表单](#8-03react-children事件和表单)
9. [04：React state、reducer 和 UI 状态机](#9-04react-statereducer-和-ui-状态机)
10. [05：React Context 和自定义 Hook](#10-05react-context-和自定义-hook)
11. [06：Angular component 输入输出类型](#11-06angular-component-输入输出类型)
12. [07：Angular 模板类型检查](#12-07angular-模板类型检查)
13. [08：Angular service 和 HTTP 边界](#13-08angular-service-和-http-边界)
14. [09：类型安全 API contract](#14-09类型安全-api-contract)
15. [10：运行时验证和 unknown 边界](#15-10运行时验证和-unknown-边界)
16. [11：typed fetch client](#16-11typed-fetch-client)
17. [12：后端 route handler 类型](#17-12后端-route-handler-类型)
18. [13：middleware、context 和 request augmentation](#18-13middlewarecontext-和-request-augmentation)
19. [14：前后端共享类型的边界](#19-14前后端共享类型的边界)
20. [15：小项目整合](#20-15小项目整合)
21. [最终文件清单](#21-最终文件清单)
22. [最终学习笔记转换要求](#22-最终学习笔记转换要求)
23. [本章最终要能回答的问题](#23-本章最终要能回答的问题)
24. [TS 官方文档阅读清单](#24-ts-官方文档阅读清单)
25. [第 9 章最终记忆模型](#25-第-9-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个把 TypeScript 放进真实框架边界中训练的指导文件。

第 9 章要同时观察四件事：

```txt
Framework runtime:
  React renders components.
  Angular compiles templates and runs dependency injection.
  Backend frameworks receive requests and return responses.

TypeScript compile time:
  props, state, events, route params, request bodies, response payloads, and handlers are statically checked.

Data boundary:
  browser input, API response, URL params, localStorage, request body, and worker messages are untrusted at runtime.

Architecture boundary:
  frontend and backend may share contracts, but runtime validation is still required.
```

第 9 章的核心不是“某个框架怎么写”，而是：

```txt
如何把前面 3 到 8 章学过的类型能力放到框架入口处。
```

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. 先读结论。
2. 区分本节概念属于 JSX boundary、component contract、template checking、API contract、runtime validation 还是 backend handler。
3. 创建对应目录。
4. 写一个正确示例文件。
5. 写一个错误示例文件，优先用 @ts-expect-error 标记预期错误。
6. 运行 npx tsc --noEmit。
7. React 示例需要 .tsx 和 React 类型依赖。
8. Angular 示例需要 Angular 项目环境。
9. 框架无关示例可以直接在普通 TypeScript 项目中检查。
10. 把本节整理进最终学习笔记。
```

### 推荐依赖

React 示例需要：

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

Angular 示例建议放进 Angular CLI 项目中，不建议在普通 TypeScript 练习目录里硬跑。

框架无关 API / backend 示例不需要第三方依赖。

### 推荐 tsconfig

React / 浏览器示例建议：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "useUnknownInCatchVariables": true,
    "noImplicitReturns": true,
    "noEmitOnError": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

Node / backend 示例可以单独使用：

```bash
npm install -D @types/node
```

并在 Node 专用 `tsconfig.node.json` 中加入：

```json
{
  "compilerOptions": {
    "types": ["node"],
    "lib": ["ES2022"]
  }
}
```

### 代码注释模板

每个 `.ts` / `.tsx` 文件顶部都写英文注释：

```ts
// Goal:
// Verify how this framework TypeScript boundary works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`export {};` 的作用是把文件变成模块（module），防止不同练习文件里的同名变量污染全局作用域。

---

## 2. 项目重新整理建议

### 结论

第 9 章建议单独建立：

```txt
typescript/chapter-09-frameworks/
```

不要把 React、Angular、API contract、backend handler 示例散落到前几章目录里。第 9 章是“类型能力进入框架”的专门训练。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json
  tsconfig.node.json

  chapter-03-types/
  chapter-04-functions/
  chapter-05-classes-interfaces/
  chapter-06-advanced-types/
  chapter-07-error-handling/
  chapter-08-async-concurrency-parallelism/

  chapter-09-frameworks/
    README.md

    00-framework-type-boundary/
      frameworkBoundaryOverview.ts
      untrustedRuntimeBoundary.ts

    01-tsx-jsx-setup/
      jsxElementType.tsx
      tsxAssertionSyntax.tsx
      intrinsicElementTyping.tsx

    02-react-props/
      productCardProps.tsx
      discriminatedComponentProps.tsx
      callbackPropTyping.tsx
      componentPropsUtility.tsx

    03-react-events-forms/
      childrenTyping.tsx
      inputChangeHandler.tsx
      formSubmitModel.tsx
      reactNodeVsJsxElement.tsx
      refNullability.tsx
      effectAsyncCleanup.tsx

    04-react-state-reducer/
      requestStateUnion.tsx
      stateInferencePitfall.tsx
      reducerActionUnion.tsx
      exhaustiveReducer.tsx

    05-react-context-hooks/
      nullableContext.tsx
      customHookReturnType.tsx
      genericDataHook.tsx

    06-angular-components/
      productCardComponent.ts
      typedOutputEvent.ts
      inputTransformBoundary.ts
      signalInputOutputBoundary.ts

    07-angular-template-checking/
      templateContextModel.ts
      nullableTemplateData.ts
      templateEventTyping.ts

    08-angular-services-http/
      productApiService.ts
      httpUnknownBoundary.ts
      serviceResultModel.ts

    09-api-contracts/
      sharedApiTypes.ts
      endpointMap.ts
      routeParamsQueryBody.ts

    10-runtime-validation/
      productValidator.ts
      apiResponseValidator.ts
      validatorResult.ts

    11-typed-fetch-client/
      typedFetch.ts
      endpointClient.ts
      fetchResultBoundary.ts
      httpStatusResult.ts

    12-backend-route-handlers/
      typedRouteHandler.ts
      requestBodyParsing.ts
      responseShape.ts

    13-middleware-context/
      requestContext.ts
      authenticatedHandler.ts
      augmentationRisk.ts

    14-shared-types-boundary/
      sharedContract.ts
      typeOnlyExport.ts
      versionedContract.ts

    15-mini-project/
      sharedContract.ts
      frontendProductList.tsx
      backendHandlers.ts
      typedClient.ts

notes/
  typescript.md
```

### 和前面章节的关系

```txt
第 3 章：
props、state、API payload 的值形状。

第 4 章：
event handler、callback prop、route handler、middleware 的函数边界。

第 5 章：
service、controller、component class、interface contract。

第 6 章：
Pick、Omit、Record、ReturnType、Awaited、mapped type 派生框架类型。

第 7 章：
API error、form validation error、not found、unauthorized 状态建模。

第 8 章：
fetch、async data loading、streaming、worker and server communication。
```

---

## 3. 第 9 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
framework type boundary
  -> TSX and JSX setup
  -> React props
  -> React children and events
  -> React state and reducers
  -> React context and custom hooks
  -> Angular component inputs and outputs
  -> Angular template checking
  -> Angular services and HTTP boundary
  -> shared API contracts
  -> runtime validation
  -> typed fetch client
  -> backend route handlers
  -> middleware context
  -> shared type boundary
  -> mini project
```

### 技术意义

框架里的 TypeScript 不是多写类型注解，而是把框架调用你的位置描述清楚：

```txt
React calls your component with props.
React calls your event handler with event objects.
React calls your reducer with state and action.
Angular binds template values into component inputs.
Angular templates read component fields and call component methods.
Backend frameworks call your route handler with request and response.
API clients receive unknown runtime data and must validate before trusting it.
```

---

## 4. 本章先要建立的底层模型

### 结论

框架中的 TypeScript 类型边界可以拆成五层：

```txt
component boundary:
  props, children, events, state, reducer actions.

template boundary:
  Angular template bindings, nullable data, event payloads.

API boundary:
  request params, query, body, response, error shape.

runtime validation boundary:
  unknown external data becomes trusted domain data only after validation.

shared contract boundary:
  frontend and backend may share types, but types are erased at runtime.
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| `.tsx` | 允许 JSX 语法的 TypeScript 文件扩展名。 |
| JSX intrinsic element | 小写标签，例如 `div`、`button`，属性来自 `JSX.IntrinsicElements`。 |
| JSX value-based element | 大写组件，例如 `ProductCard`，props 来自组件函数参数或类组件。 |
| props contract | 组件调用者必须传入的属性形状。 |
| callback prop | 父组件传给子组件的函数属性。 |
| controlled input | 表单值由 state 控制的输入。 |
| reducer action union | 用判别联合建模的 reducer action。 |
| Angular input | 父级 template 绑定给 component 的输入属性。 |
| Angular output | component 发给父级 template 的事件。 |
| API contract | 请求和响应的数据协议。 |
| validator | 把 `unknown` 运行时数据检查成可信类型的函数。 |
| route handler | 后端框架收到请求后调用的处理函数。 |
| middleware context | 中间件在请求生命周期中添加的上下文信息。 |

### 底层机制总图

```txt
source code
  -> TypeScript checks props, templates, handlers, API contracts
  -> framework compiler or bundler transforms TSX/templates/modules
  -> emitted JavaScript runs in browser or server
  -> external data enters as runtime values
  -> validators refine unknown into domain types
  -> frontend and backend communicate through serialized data
```

### 本章最重要的边界

```txt
TypeScript can check your source code.
TypeScript cannot validate HTTP response data by itself.
TypeScript can type React props.
TypeScript cannot prevent a server from sending wrong JSON.
TypeScript can type Angular templates.
TypeScript cannot fix a value that is null at runtime.
TypeScript can share API types.
TypeScript cannot make client and server versions automatically compatible.
```

### 本章必须先补：framework type boundary 不等于 runtime guarantee

框架里的类型边界有两种不同层级：

```txt
source-code boundary:
  TypeScript checks the code you wrote.

runtime boundary:
  browser, server, template compiler, HTTP, and framework runtime pass real JavaScript values.
```

所以本章所有框架类型都要分成两问：

```txt
Question 1:
  Does TypeScript know this value's static type?

Question 2:
  Has runtime code actually checked this value?
```

React props、Angular input、route handler request、typed fetch response 都可以被 TypeScript 描述。  
但是 HTTP JSON、URL query、request body、localStorage、worker message 这些值进入程序时，运行时仍然只是普通 JavaScript value。

最终判断模型：

```txt
Framework type annotations:
  improve source-code correctness.

Runtime validation:
  proves external values really match the expected shape.

Shared contracts:
  reduce drift between modules.

Shared contracts without validation:
  still cannot protect runtime boundaries.
```


---

## 5. 00：框架里的 TypeScript 到底在解决什么

### 结论

框架里的 TypeScript 解决的是“谁调用谁、传什么数据、返回什么结果、失败怎么表示”的边界问题。

### 技术意义

框架会在很多地方调用你的代码。你不是直接调用所有函数，而是把组件、handler、service、validator 交给框架。TypeScript 要描述这些交接点。

### 文件结构

```txt
00-framework-type-boundary/
  frameworkBoundaryOverview.ts
  untrustedRuntimeBoundary.ts
```

### `frameworkBoundaryOverview.ts`

```ts
// Goal:
// Model framework entry points as typed function boundaries.

// Expected result:
// The compiler rejects an invalid callback payload.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ProductSelectHandler = (product: ProductRecord) => void;

function renderProductLikeFramework(
  product: ProductRecord,
  onSelect: ProductSelectHandler,
): void {
  onSelect(product);
}

renderProductLikeFramework(
  { id: "p1", title: "Keyboard" },
  (product) => {
    console.log(product.title);
  },
);

renderProductLikeFramework(
  { id: "p2", title: "Mouse" },
  // @ts-expect-error: The callback must accept a ProductRecord.
  (product: { id: number }) => {
    console.log(product.id);
  },
);
```

### `untrustedRuntimeBoundary.ts`

```ts
// Goal:
// Keep external data as unknown before validation.

// Expected result:
// The compiler requires validation before property access.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.id === "string" && typeof candidate.title === "string";
}

const responseData: unknown = JSON.parse('{"id":"p1","title":"Keyboard"}');

// @ts-expect-error: responseData is unknown.
console.log(responseData.title);

if (isProductRecord(responseData)) {
  console.log(responseData.title);
}
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 框架入口被建模成函数边界。 |
| 2 | 参数和 callback 描述框架会传什么。 |
| 3 | 外部 JSON 先是 `unknown`。 |
| 4 | validator 做运行时检查。 |
| 5 | 类型系统在检查成功后缩小类型。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 框架里所有类型都来自框架 | 业务类型仍然要你自己建模。 |
| API 返回值直接写成 `ProductRecord` | HTTP 边界的数据运行时不可信。 |
| 类型共享等于运行时安全 | 类型会被擦除，仍然需要验证。 |

---

## 6. 01：TSX、JSX 和框架编译边界

### 结论

写 JSX 的 TypeScript 文件必须使用 `.tsx`。TypeScript 可以检查 JSX，但 JSX 最终会按 `jsx` 配置交给编译器或框架转换。

### 技术意义

JSX 不是普通 HTML。小写标签和大写组件在类型检查规则上不同：小写标签查 `JSX.IntrinsicElements`，大写组件查当前作用域中的组件值。

### 文件结构

```txt
01-tsx-jsx-setup/
  jsxElementType.tsx
  tsxAssertionSyntax.tsx
  intrinsicElementTyping.tsx
```

### `jsxElementType.tsx`

```tsx
// Goal:
// Verify a simple TSX component and prop type check.

// Expected result:
// The compiler accepts the valid component usage and rejects missing props.

export {};

type ProductTitleProps = {
  title: string;
};

function ProductTitle(props: ProductTitleProps) {
  return <h2>{props.title}</h2>;
}

const validElement = <ProductTitle title="Keyboard" />;

// @ts-expect-error: title is required.
const invalidElement = <ProductTitle />;

console.log(validElement);
console.log(invalidElement);
```

### `tsxAssertionSyntax.tsx`

```tsx
// Goal:
// Use as assertion syntax in TSX files.

// Expected result:
// The compiler accepts as syntax.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

const rawValue: unknown = {
  id: "p1",
  title: "Keyboard",
};

const product = rawValue as ProductRecord;

console.log(product.title);
```

### `intrinsicElementTyping.tsx`

```tsx
// Goal:
// Observe intrinsic element attribute checking.

// Expected result:
// The compiler rejects an invalid intrinsic attribute.

export {};

const validButton = <button disabled={true}>Save</button>;

// @ts-expect-error: disabled expects a boolean-like value.
const invalidButton = <button disabled={{ value: true }}>Save</button>;

console.log(validButton);
console.log(invalidButton);
```

### 常见错误

```txt
错误：
JSX file can be .ts.

正确：
Use .tsx when the file contains JSX.

错误：
Angle-bracket type assertion works normally in .tsx.

正确：
Use value as Type in .tsx because angle brackets conflict with JSX syntax.
```

---

## 7. 02：React 组件 props 建模

### 结论

React 组件 props 是组件的外部调用合同。TypeScript 要检查调用者是否传入了正确属性，以及组件内部是否按正确类型使用 props。

### 技术意义

组件本质上是一个接收 props 并返回 UI 的函数。props 类型越清楚，组件越容易复用、重构和测试。

### 文件结构

```txt
02-react-props/
  productCardProps.tsx
  discriminatedComponentProps.tsx
  callbackPropTyping.tsx
```

### `productCardProps.tsx`

```tsx
// Goal:
// Type a React component props object.

// Expected result:
// The compiler accepts valid props and rejects missing props.

export {};

type ProductCardProps = {
  id: string;
  title: string;
  priceCents: number;
  isFeatured?: boolean;
};

function ProductCard(props: ProductCardProps) {
  const featuredLabel = props.isFeatured === true ? "Featured" : "Standard";

  return (
    <article>
      <h2>{props.title}</h2>
      <p>{props.priceCents}</p>
      <span>{featuredLabel}</span>
    </article>
  );
}

const validCard = <ProductCard id="p1" title="Keyboard" priceCents={9900} />;

// @ts-expect-error: priceCents is required.
const invalidCard = <ProductCard id="p2" title="Mouse" />;

console.log(validCard);
console.log(invalidCard);
```

### `discriminatedComponentProps.tsx`

```tsx
// Goal:
// Use discriminated union props for mutually exclusive UI states.

// Expected result:
// The compiler narrows props by state.

export {};

type ProductPanelProps =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "success"; product: { id: string; title: string } };

function ProductPanel(props: ProductPanelProps) {
  switch (props.state) {
    case "loading":
      return <p>Loading</p>;
    case "error":
      return <p>{props.message}</p>;
    case "success":
      return <h2>{props.product.title}</h2>;
  }
}

const successPanel = (
  <ProductPanel state="success" product={{ id: "p1", title: "Keyboard" }} />
);

// @ts-expect-error: The error state requires message.
const brokenPanel = <ProductPanel state="error" />;

console.log(successPanel);
console.log(brokenPanel);
```

### `callbackPropTyping.tsx`

```tsx
// Goal:
// Type a callback prop with a domain payload.

// Expected result:
// The compiler enforces callback payload shape.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ProductListProps = {
  products: ProductRecord[];
  onSelect(product: ProductRecord): void;
};

function ProductList(props: ProductListProps) {
  return (
    <ul>
      {props.products.map((product) => (
        <li key={product.id}>
          <button onClick={() => props.onSelect(product)}>{product.title}</button>
        </li>
      ))}
    </ul>
  );
}

const element = (
  <ProductList
    products={[{ id: "p1", title: "Keyboard" }]}
    onSelect={(product) => {
      console.log(product.title);
    }}
  />
);

console.log(element);
```

### `componentPropsUtility.tsx`

```tsx
// Goal:
// Reuse intrinsic element props with a custom component boundary.

// Expected result:
// The compiler checks both custom props and button props.

import type { ComponentPropsWithoutRef } from "react";

export {};

type AppButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant: "primary" | "secondary";
};

function AppButton(props: AppButtonProps) {
  const { variant, ...buttonProps } = props;

  return <button {...buttonProps} data-variant={variant} />;
}

const saveButton = (
  <AppButton
    variant="primary"
    type="button"
    disabled={false}
    onClick={() => {
      console.log("save");
    }}
  >
    Save
  </AppButton>
);

// @ts-expect-error: variant must be one of the known variants.
const brokenButton = <AppButton variant="danger">Delete</AppButton>;

console.log(saveButton);
console.log(brokenButton);
```

### 机制补充：复用 DOM props 不是复制 HTML 属性表

`ComponentPropsWithoutRef<"button">` 的作用是从 React 的 intrinsic `button` 类型里提取属性类型。它解决的问题是：

```txt
custom component:
  owns business props such as variant.

native element:
  owns DOM props such as disabled, type, onClick.

combined component:
  can accept both sets safely.
```

这不是运行时继承。它只是类型层复用，让 `AppButton` 可以暴露一个“像 button，但多了 variant”的调用合同。


### 常见错误

| 错误 | 正确模型 |
|---|---|
| props 全写成可选 | 调用者会遗漏必需数据。 |
| 用多个 optional 字段表达互斥 UI 状态 | 用 discriminated union 更安全。 |
| callback prop 参数写成 `any` | 会把父子组件边界类型检查关掉。 |

---

## 8. 03：React children、事件和表单

### 结论

`children`、DOM event 和 form value 都是 React 中常见边界。TypeScript 要分别描述可渲染内容、事件对象和表单状态。

### 技术意义

事件 handler 的类型通常来自 JSX 上下文；但一旦你把 handler 抽出来，就经常需要显式写事件类型。

### 文件结构

```txt
03-react-events-forms/
  childrenTyping.tsx
  inputChangeHandler.tsx
  formSubmitModel.tsx
```

### `childrenTyping.tsx`

```tsx
// Goal:
// Type children with ReactNode.

// Expected result:
// The compiler accepts renderable children.

import type { ReactNode } from "react";

export {};

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel(props: PanelProps) {
  return (
    <section>
      <h2>{props.title}</h2>
      <div>{props.children}</div>
    </section>
  );
}

const panel = (
  <Panel title="Details">
    <p>Keyboard</p>
  </Panel>
);

console.log(panel);
```

### `inputChangeHandler.tsx`

```tsx
// Goal:
// Type an extracted React change handler.

// Expected result:
// The event target is typed as HTMLInputElement.

import type { ChangeEventHandler } from "react";
import { useState } from "react";

export {};

function SearchBox() {
  const [queryText, setQueryText] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setQueryText(event.currentTarget.value);
  };

  return <input value={queryText} onChange={handleChange} />;
}

console.log(SearchBox);
```

### `formSubmitModel.tsx`

```tsx
// Goal:
// Model form values and submit result explicitly.

// Expected result:
// The compiler keeps form state and submit payload aligned.

import type { FormEventHandler } from "react";
import { useState } from "react";

export {};

type LoginFormValue = {
  email: string;
  password: string;
};

function LoginForm() {
  const [formValue, setFormValue] = useState<LoginFormValue>({
    email: "",
    password: "",
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    console.log(formValue.email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formValue.email}
        onChange={(event) => {
          setFormValue({
            ...formValue,
            email: event.currentTarget.value,
          });
        }}
      />
    </form>
  );
}

console.log(LoginForm);
```

### `reactNodeVsJsxElement.tsx`

```tsx
// Goal:
// Compare ReactNode with JSX.Element in component return boundaries.

// Expected result:
// ReactNode accepts text, null, arrays, and elements.

import type { ReactNode } from "react";

export {};

type MessageSlotProps = {
  content: ReactNode;
};

function MessageSlot(props: MessageSlotProps) {
  return <section>{props.content}</section>;
}

const textSlot = <MessageSlot content="Saved" />;
const nullSlot = <MessageSlot content={null} />;
const elementSlot = <MessageSlot content={<strong>Saved</strong>} />;

console.log(textSlot);
console.log(nullSlot);
console.log(elementSlot);
```

### `refNullability.tsx`

```tsx
// Goal:
// Model a DOM ref that may be null before React attaches it.

// Expected result:
// The compiler requires a null check before using the DOM node.

import { useRef } from "react";

export {};

function FocusableInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput(): void {
    const inputElement = inputRef.current;

    if (inputElement !== null) {
      inputElement.focus();
    }
  }

  return <input ref={inputRef} onFocus={focusInput} />;
}

console.log(FocusableInput);
```

### `effectAsyncCleanup.tsx`

```tsx
// Goal:
// Avoid passing an async function directly to useEffect.

// Expected result:
// The compiler rejects an effect callback that returns Promise<void>.

import { useEffect, useState } from "react";

export {};

async function loadTitle(): Promise<string> {
  return "Keyboard";
}

function ProductTitleEffect() {
  const [title, setTitle] = useState("loading");

  useEffect(() => {
    let ignoreResult = false;

    async function run(): Promise<void> {
      const loadedTitle = await loadTitle();

      if (!ignoreResult) {
        setTitle(loadedTitle);
      }
    }

    void run();

    return () => {
      ignoreResult = true;
    };
  }, []);

  return <h2>{title}</h2>;
}

function BrokenProductTitleEffect() {
  const [title, setTitle] = useState("loading");

  // @ts-expect-error: An effect callback must not return a Promise.
  useEffect(async () => {
    setTitle(await loadTitle());
  }, []);

  return <h2>{title}</h2>;
}

console.log(ProductTitleEffect);
console.log(BrokenProductTitleEffect);
```

### 机制补充：React event、ref、effect 是三种不同边界

```txt
event handler:
  React passes a SyntheticEvent to your function.

ref:
  React writes the DOM node into current after render and sets it back to null when removed.

effect:
  React runs setup after commit and may run cleanup before the next setup or unmount.
```

所以这三个点不能混成一种“React 回调”：

```txt
event parameter:
  usually inferred from JSX or annotated with React event types.

ref.current:
  must handle null unless you can prove the node exists.

useEffect callback:
  returns void or cleanup function, not Promise.
```


### 常见错误

```txt
错误：
Use Event for every React event.

正确：
Use React event types such as ChangeEvent, ChangeEventHandler, FormEventHandler, or infer from JSX context.

错误：
children is always JSX.Element.

正确：
children is often ReactNode because strings, numbers, null, arrays, and elements can be renderable.
```

---

## 9. 04：React state、reducer 和 UI 状态机

### 结论

React state 不只是一个对象。加载、成功、失败、空状态应该用判别联合建模；复杂状态迁移适合用 reducer action union。

### 技术意义

UI 状态最常见的问题是“几个 boolean 互相矛盾”。TypeScript 可以把合法状态限制成明确的联合成员。

### 文件结构

```txt
04-react-state-reducer/
  requestStateUnion.tsx
  reducerActionUnion.tsx
  exhaustiveReducer.tsx
```

### `requestStateUnion.tsx`

```tsx
// Goal:
// Model async UI state with a discriminated union.

// Expected result:
// The compiler narrows each UI state branch.

import { useState } from "react";

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ProductRecord[] }
  | { status: "error"; message: string };

function ProductListView() {
  const [requestState] = useState<RequestState>({ status: "idle" });

  switch (requestState.status) {
    case "idle":
      return <p>Idle</p>;
    case "loading":
      return <p>Loading</p>;
    case "success":
      return <p>{requestState.data.length}</p>;
    case "error":
      return <p>{requestState.message}</p>;
  }
}

console.log(ProductListView);
```

### `stateInferencePitfall.tsx`

```tsx
// Goal:
// Avoid empty-array and null-only state inference traps.

// Expected result:
// Explicit state types allow later valid updates.

import { useState } from "react";

export {};

type ProductRecord = {
  id: string;
  title: string;
};

function ProductStateExample() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);

  setProducts([
    {
      id: "p1",
      title: "Keyboard",
    },
  ]);

  setSelectedProduct({
    id: "p1",
    title: "Keyboard",
  });

  return <p>{selectedProduct?.title ?? products.length}</p>;
}

console.log(ProductStateExample);
```

### 机制补充：useState 推导不是业务建模

`useState([])` 和 `useState(null)` 容易让初始值过窄。  
它们只告诉 TypeScript “现在这里是空数组”或“现在这里是 null”，不一定能表达后续真实状态。

本章写 React state 时优先问：

```txt
Is this state a stable primitive value?
  let TypeScript infer.

Can this state later hold domain objects?
  write an explicit generic argument.

Are states mutually exclusive?
  use a discriminated union.
```


### `reducerActionUnion.tsx`

```tsx
// Goal:
// Type reducer state and action with discriminated unions.

// Expected result:
// The reducer only accepts known actions.

import { useReducer } from "react";

export {};

type CounterState = {
  count: number;
};

type CounterAction =
  | { type: "reset" }
  | { type: "increment"; amount: number }
  | { type: "decrement"; amount: number };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "reset":
      return { count: 0 };
    case "increment":
      return { count: state.count + action.amount };
    case "decrement":
      return { count: state.count - action.amount };
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <button onClick={() => dispatch({ type: "increment", amount: 1 })}>
      {state.count}
    </button>
  );
}

console.log(Counter);
```

### `exhaustiveReducer.tsx`

```tsx
// Goal:
// Use never to catch missing reducer actions.

// Expected result:
// The compiler accepts exhaustive handling.

export {};

type ToggleState = {
  enabled: boolean;
};

type ToggleAction =
  | { type: "turnOn" }
  | { type: "turnOff" };

function assertNever(value: never): never {
  throw new Error(`Unexpected action: ${JSON.stringify(value)}`);
}

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
  switch (action.type) {
    case "turnOn":
      return { enabled: true };
    case "turnOff":
      return { enabled: false };
    default:
      return assertNever(action);
  }
}

console.log(toggleReducer({ enabled: false }, { type: "turnOn" }));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `isLoading`、`error`、`data` 三个字段随便组合 | 用判别联合限制合法状态。 |
| reducer action 写成 `{ type: string; payload?: unknown }` | 会丢失 action 与 payload 的对应关系。 |
| default 分支直接返回原 state | 会隐藏遗漏 action 的错误。 |

---

## 10. 05：React Context 和自定义 Hook

### 结论

Context 适合跨组件树共享值；自定义 Hook 适合封装状态逻辑和类型边界。没有合理默认值的 Context 应该显式包含 `null`，并在 Hook 中检查。

### 技术意义

没有实际默认值时，`ContextShape | null` 是诚实建模；自定义 Hook 负责运行时检查，并把返回类型恢复成非空业务类型。

### 文件结构

```txt
05-react-context-hooks/
  nullableContext.tsx
  customHookReturnType.tsx
  genericDataHook.tsx
```

### `nullableContext.tsx`

```tsx
// Goal:
// Create a nullable context and a safe consumer hook.

// Expected result:
// The hook returns a non-null context value after runtime check.

import { createContext, useContext } from "react";

export {};

type AuthContextValue = {
  userId: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuthContext(): AuthContextValue {
  const contextValue = useContext(AuthContext);

  if (contextValue === null) {
    throw new Error("useAuthContext must be used within AuthContext");
  }

  return contextValue;
}

function UserLabel() {
  const auth = useAuthContext();

  return <p>{auth.userId}</p>;
}

console.log(UserLabel);
```

### `customHookReturnType.tsx`

```tsx
// Goal:
// Model a custom hook return value with a discriminated union.

// Expected result:
// Consumers must branch by status.

import { useState } from "react";

export {};

type LoadState<ValueType> =
  | { status: "idle" }
  | { status: "success"; value: ValueType }
  | { status: "error"; message: string };

function useProductTitle(): LoadState<string> {
  const [state] = useState<LoadState<string>>({
    status: "success",
    value: "Keyboard",
  });

  return state;
}

function ProductTitle() {
  const state = useProductTitle();

  if (state.status === "success") {
    return <h2>{state.value}</h2>;
  }

  return <p>{state.status}</p>;
}

console.log(ProductTitle);
```

### `genericDataHook.tsx`

```tsx
// Goal:
// Make a data hook generic over the loaded value type.

// Expected result:
// The hook preserves the loader result type.

import { useState } from "react";

export {};

type AsyncState<ValueType> =
  | { status: "loading" }
  | { status: "success"; value: ValueType }
  | { status: "error"; error: Error };

function useAsyncValue<ValueType>(
  loader: () => Promise<ValueType>,
): AsyncState<ValueType> {
  const [state] = useState<AsyncState<ValueType>>({ status: "loading" });

  void loader;

  return state;
}

async function loadCount(): Promise<number> {
  return 42;
}

function CountView() {
  const state = useAsyncValue(loadCount);

  if (state.status === "success") {
    return <p>{state.value.toFixed(0)}</p>;
  }

  return <p>{state.status}</p>;
}

console.log(CountView);
```

### 常见错误

```txt
错误：
Context default value can be fake object.

正确：
If there is no real default, use null and check in a custom hook.

错误：
Custom hook return type is always object with optional fields.

正确：
Use discriminated union when states are mutually exclusive.
```

---

## 11. 06：Angular component 输入输出类型

### 结论

Angular component 的输入输出边界要用 TypeScript 明确建模：父组件传入 `@Input()`，子组件通过 `@Output()` 发出事件。

### 技术意义

Angular 模板会绑定属性和事件。TypeScript 类型不只检查 `.ts` 文件，也能通过 Angular template checker 检查 template 中的绑定表达式。

### 文件结构

```txt
06-angular-components/
  productCardComponent.ts
  typedOutputEvent.ts
  inputTransformBoundary.ts
```

### `productCardComponent.ts`

```ts
// Goal:
// Type Angular component inputs.

// Expected result:
// This file type-checks inside an Angular project.

import { Component, Input } from "@angular/core";

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

@Component({
  selector: "app-product-card",
  template: `
    <article>
      <h2>{{ product.title }}</h2>
      <p>{{ product.priceCents }}</p>
    </article>
  `,
})
export class ProductCardComponent {
  @Input({ required: true })
  product!: ProductRecord;
}
```

### `typedOutputEvent.ts`

```ts
// Goal:
// Type Angular output events with EventEmitter payloads.

// Expected result:
// The output payload is ProductRecord.

import { Component, EventEmitter, Input, Output } from "@angular/core";

export type ProductRecord = {
  id: string;
  title: string;
};

@Component({
  selector: "app-product-select",
  template: `
    <button type="button" (click)="selectProduct()">
      {{ product.title }}
    </button>
  `,
})
export class ProductSelectComponent {
  @Input({ required: true })
  product!: ProductRecord;

  @Output()
  readonly selected = new EventEmitter<ProductRecord>();

  selectProduct(): void {
    this.selected.emit(this.product);
  }
}
```

### `inputTransformBoundary.ts`

```ts
// Goal:
// Keep input parsing logic explicit at the component boundary.

// Expected result:
// The component stores a normalized boolean value.

import { Component, Input } from "@angular/core";

@Component({
  selector: "app-feature-flag",
  template: `<p>{{ enabled }}</p>`,
})
export class FeatureFlagComponent {
  enabled = false;

  @Input()
  set enabledInput(value: boolean | string | null | undefined) {
    this.enabled = value === true || value === "true";
  }
}
```

### `signalInputOutputBoundary.ts`

```ts
// Goal:
// Preview signal-based Angular input and output typing.

// Expected result:
// This file type-checks inside a modern Angular project.

import { Component, input, output } from "@angular/core";

export type ProductRecord = {
  id: string;
  title: string;
};

@Component({
  selector: "app-product-signal-card",
  template: `
    <button type="button" (click)="selectProduct()">
      {{ product().title }}
    </button>
  `,
})
export class ProductSignalCardComponent {
  readonly product = input.required<ProductRecord>();
  readonly selected = output<ProductRecord>();

  selectProduct(): void {
    this.selected.emit(this.product());
  }
}
```

### 机制补充：Angular decorator input 和 signal input 都是组件边界

本章不要求你现在深入 Angular signal API，但要先建立边界模型：

```txt
decorator input:
  @Input() property is assigned by Angular runtime.

signal input:
  input<T>() returns a read-only signal-like input value.

output:
  emits a typed payload to the parent template.
```

它们表面 API 不同，但 TypeScript 要解决的问题一样：

```txt
parent template:
  passes data into child component.

child component:
  reads typed input and emits typed output.

Angular compiler:
  checks binding expressions when strict template checking is enabled.
```


### 常见错误

| 错误 | 正确模型 |
|---|---|
| `@Input()` 字段没有初始化，也不写 `!` 或默认值 | Angular 运行时赋值，但 TS 初始化检查需要你说明。 |
| `EventEmitter<any>` | 会丢失父组件接收事件的 payload 类型。 |
| 在 template 中依赖隐式 any | 开启 strict template checking。 |

---

## 12. 07：Angular 模板类型检查

### 结论

Angular 模板类型检查会检查 template 中的属性访问、事件绑定、输入输出绑定和可空值。严格模板检查能把很多运行时 template 错误提前暴露。

### 技术意义

Angular template 不是普通字符串。它会被 Angular 编译器分析，并结合 component class 的 TypeScript 类型检查模板表达式。

### 文件结构

```txt
07-angular-template-checking/
  templateContextModel.ts
  nullableTemplateData.ts
  templateEventTyping.ts
```

### `templateContextModel.ts`

```ts
// Goal:
// Model values that an Angular template can read.

// Expected result:
// The template can only read component members that exist.

import { Component } from "@angular/core";

type ProductRecord = {
  id: string;
  title: string;
};

@Component({
  selector: "app-product-list",
  template: `
    <ul>
      <li *ngFor="let product of products">
        {{ product.title }}
      </li>
    </ul>
  `,
})
export class ProductListComponent {
  products: ProductRecord[] = [
    { id: "p1", title: "Keyboard" },
  ];
}
```

### `nullableTemplateData.ts`

```ts
// Goal:
// Keep nullable data explicit for Angular templates.

// Expected result:
// The template guards nullable product before reading title.

import { Component } from "@angular/core";

type ProductRecord = {
  id: string;
  title: string;
};

@Component({
  selector: "app-product-detail",
  template: `
    <h2 *ngIf="product !== null">
      {{ product.title }}
    </h2>
  `,
})
export class ProductDetailComponent {
  product: ProductRecord | null = null;
}
```

### `templateEventTyping.ts`

```ts
// Goal:
// Type the method called from an Angular event binding.

// Expected result:
// The method signature describes expected input.

import { Component } from "@angular/core";

@Component({
  selector: "app-search-box",
  template: `
    <input (input)="handleInput($event)" />
  `,
})
export class SearchBoxComponent {
  handleInput(event: Event): void {
    const inputElement = event.target;

    if (inputElement instanceof HTMLInputElement) {
      console.log(inputElement.value);
    }
  }
}
```

### 常见错误

```txt
错误：
Template expressions are not type-checked like TypeScript.

正确：
With strict Angular template checking, templates are checked against component types.

错误：
event.target is always HTMLInputElement.

正确:
event.target is EventTarget | null. Narrow it before reading value.
```

---

## 13. 08：Angular service 和 HTTP 边界

### 结论

Angular service 常用来封装 HTTP 和业务操作。HTTP 返回的数据仍然是运行时外部数据，泛型类型只能描述你期望的形状，不能代替验证。

### 技术意义

`HttpClient.get<ProductRecord>()` 能给调用方一个静态返回类型，但服务器返回值是否真的符合类型，仍然是运行时问题。

### 文件结构

```txt
08-angular-services-http/
  productApiService.ts
  httpUnknownBoundary.ts
  serviceResultModel.ts
```

### `productApiService.ts`

```ts
// Goal:
// Type an Angular service method return value.

// Expected result:
// This file type-checks inside an Angular project.

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export type ProductRecord = {
  id: string;
  title: string;
};

@Injectable({ providedIn: "root" })
export class ProductApiService {
  constructor(private readonly httpClient: HttpClient) {}

  loadProducts(): Observable<ProductRecord[]> {
    return this.httpClient.get<ProductRecord[]>("/api/products");
  }
}
```

### `httpUnknownBoundary.ts`

```ts
// Goal:
// Treat HTTP data as unknown before validation.

// Expected result:
// The validator narrows unknown data.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

function isProductRecordArray(value: unknown): value is ProductRecord[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const candidate = item as Record<string, unknown>;

      return typeof candidate.id === "string" && typeof candidate.title === "string";
    })
  );
}

const responseValue: unknown = JSON.parse('[{"id":"p1","title":"Keyboard"}]');

if (isProductRecordArray(responseValue)) {
  console.log(responseValue[0]?.title);
}
```

### `serviceResultModel.ts`

```ts
// Goal:
// Return a Result from a service boundary.

// Expected result:
// Callers handle both success and error states.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type ProductRecord = {
  id: string;
  title: string;
};

type ApiError = {
  kind: "network-error" | "invalid-response";
  message: string;
};

function parseProducts(value: unknown): Result<ProductRecord[], ApiError> {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      error: { kind: "invalid-response", message: "Expected an array" },
    };
  }

  return {
    ok: true,
    value: value.flatMap((item) => {
      if (typeof item !== "object" || item === null) {
        return [];
      }

      const candidate = item as Record<string, unknown>;

      if (typeof candidate.id === "string" && typeof candidate.title === "string") {
        return [{ id: candidate.id, title: candidate.title }];
      }

      return [];
    }),
  };
}

console.log(parseProducts([{ id: "p1", title: "Keyboard" }]));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| HTTP 泛型等于验证 | 泛型只影响 TypeScript 静态类型。 |
| service 返回裸数据和抛错混用 | 模块内要有稳定失败策略。 |
| 把后端返回直接交给 UI | 在 service 或 API client 边界先解析。 |

---

## 14. 09：类型安全 API contract

### 结论

类型安全 API contract 是把 endpoint、method、params、query、body、response、error 关系建模成一个类型表。

### 技术意义

API contract 的核心不是把所有接口写成 `any` 的 fetch，而是让每个 endpoint 的请求和响应在类型层对应起来。

### 文件结构

```txt
09-api-contracts/
  sharedApiTypes.ts
  endpointMap.ts
  routeParamsQueryBody.ts
```

### `sharedApiTypes.ts`

```ts
// Goal:
// Define shared request and response shapes.

// Expected result:
// The compiler enforces request and response fields.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

type CreateProductRequest = {
  title: string;
  priceCents: number;
};

type CreateProductResponse = {
  product: ProductRecord;
};

const requestBody: CreateProductRequest = {
  title: "Keyboard",
  priceCents: 9900,
};

const responseBody: CreateProductResponse = {
  product: {
    id: "p1",
    title: requestBody.title,
    priceCents: requestBody.priceCents,
  },
};

console.log(responseBody.product.title);
```

### `endpointMap.ts`

```ts
// Goal:
// Map endpoints to request and response types.

// Expected result:
// The client function preserves endpoint-specific response types.

export {};

type EndpointMap = {
  "GET /products": {
    request: { query: { search?: string } };
    response: { products: { id: string; title: string }[] };
  };
  "POST /products": {
    request: { body: { title: string } };
    response: { product: { id: string; title: string } };
  };
};

async function requestEndpoint<EndpointName extends keyof EndpointMap>(
  endpointName: EndpointName,
  requestValue: EndpointMap[EndpointName]["request"],
): Promise<EndpointMap[EndpointName]["response"]> {
  void endpointName;
  void requestValue;

  throw new Error("Not implemented");
}

async function main(): Promise<void> {
  const response = await requestEndpoint("GET /products", {
    query: { search: "key" },
  });

  console.log(response.products.length);
}

void main();
```

### `routeParamsQueryBody.ts`

```ts
// Goal:
// Split API request data into params, query, and body.

// Expected result:
// Each route section has its own type.

export {};

type UpdateProductRequest = {
  params: {
    productId: string;
  };
  query: {
    preview?: "true";
  };
  body: {
    title?: string;
    priceCents?: number;
  };
};

function updateProduct(request: UpdateProductRequest): string {
  return request.params.productId;
}

console.log(
  updateProduct({
    params: { productId: "p1" },
    query: { preview: "true" },
    body: { title: "Keyboard" },
  }),
);
```

### 常见错误

```txt
错误：
API type is just response type.

正确：
API contract includes method, path, params, query, body, response, and error model.
```

---

## 15. 10：运行时验证和 unknown 边界

### 结论

前后端框架边界的数据必须先当成 `unknown`。TypeScript 类型不能验证 JSON，validator 才能把运行时数据变成可信领域类型。

### 技术意义

API contract 提供静态开发体验；runtime validation 提供运行时安全。两者缺一不可。

### 文件结构

```txt
10-runtime-validation/
  productValidator.ts
  apiResponseValidator.ts
  validatorResult.ts
```

### `productValidator.ts`

```ts
// Goal:
// Validate unknown data into a ProductRecord.

// Expected result:
// The type guard narrows unknown input.

export {};

type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.priceCents === "number"
  );
}

const value: unknown = JSON.parse('{"id":"p1","title":"Keyboard","priceCents":9900}');

if (isProductRecord(value)) {
  console.log(value.priceCents.toFixed(0));
}
```

### `apiResponseValidator.ts`

```ts
// Goal:
// Validate a nested API response shape.

// Expected result:
// The validator checks the nested product list.

export {};

type ProductListResponse = {
  products: {
    id: string;
    title: string;
  }[];
};

function isProductListResponse(value: unknown): value is ProductListResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    Array.isArray(candidate.products) &&
    candidate.products.every((item) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const product = item as Record<string, unknown>;

      return typeof product.id === "string" && typeof product.title === "string";
    })
  );
}

const responseValue: unknown = {
  products: [{ id: "p1", title: "Keyboard" }],
};

console.log(isProductListResponse(responseValue));
```

### `validatorResult.ts`

```ts
// Goal:
// Return typed validation errors instead of only true or false.

// Expected result:
// The caller can inspect validation failure reason.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type ProductRecord = {
  id: string;
  title: string;
};

type ValidationError =
  | { kind: "not-object" }
  | { kind: "missing-field"; fieldName: string };

function parseProduct(value: unknown): Result<ProductRecord, ValidationError> {
  if (typeof value !== "object" || value === null) {
    return { ok: false, error: { kind: "not-object" } };
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== "string") {
    return { ok: false, error: { kind: "missing-field", fieldName: "id" } };
  }

  if (typeof candidate.title !== "string") {
    return { ok: false, error: { kind: "missing-field", fieldName: "title" } };
  }

  return {
    ok: true,
    value: {
      id: candidate.id,
      title: candidate.title,
    },
  };
}

console.log(parseProduct({ id: "p1", title: "Keyboard" }));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `JSON.parse(...) as ProductRecord` | 这是断言，不是验证。 |
| validator 返回 `boolean` 后丢失错误原因 | 复杂场景用 `Result<T, E>`。 |
| 只验证最外层对象 | 嵌套字段也必须验证。 |

---

## 16. 11：typed fetch client

### 结论

typed fetch client 应该把 endpoint contract、HTTP 调用、JSON 解析、runtime validation 和错误建模放在一个边界中。

### 技术意义

不要让组件直接 `fetch().then(r => r.json()) as T`。组件应该消费已经验证过的 `Result<T, E>` 或可信数据。

### 文件结构

```txt
11-typed-fetch-client/
  typedFetch.ts
  endpointClient.ts
  fetchResultBoundary.ts
```

### `typedFetch.ts`

```ts
// Goal:
// Fetch JSON as unknown and parse it with a validator.

// Expected result:
// The client returns a Result.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type FetchError =
  | { kind: "network-error"; message: string }
  | { kind: "invalid-response"; message: string };

async function fetchJson<ValueType>(
  url: string,
  validate: (value: unknown) => value is ValueType,
): Promise<Result<ValueType, FetchError>> {
  try {
    const response = await fetch(url);
    const value: unknown = await response.json();

    if (!validate(value)) {
      return {
        ok: false,
        error: { kind: "invalid-response", message: "Invalid response shape" },
      };
    }

    return { ok: true, value };
  } catch (errorValue) {
    return {
      ok: false,
      error: {
        kind: "network-error",
        message: errorValue instanceof Error ? errorValue.message : "Unknown error",
      },
    };
  }
}

console.log(typeof fetchJson);
```

### `endpointClient.ts`

```ts
// Goal:
// Connect endpoint names with response types.

// Expected result:
// The response type depends on the endpoint name.

export {};

type EndpointMap = {
  products: {
    url: "/api/products";
    response: { products: { id: string; title: string }[] };
  };
  profile: {
    url: "/api/profile";
    response: { id: string; email: string };
  };
};

async function getEndpoint<EndpointName extends keyof EndpointMap>(
  endpointName: EndpointName,
): Promise<EndpointMap[EndpointName]["response"]> {
  void endpointName;
  throw new Error("Not implemented");
}

async function main(): Promise<void> {
  const response = await getEndpoint("products");
  console.log(response.products.length);
}

void main();
```

### `fetchResultBoundary.ts`

```ts
// Goal:
// Keep fetch failures visible in the return type.

// Expected result:
// Callers must branch by ok.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type ProductRecord = {
  id: string;
  title: string;
};

type ApiError = {
  kind: "not-found" | "invalid-response";
  message: string;
};

async function loadProduct(): Promise<Result<ProductRecord, ApiError>> {
  return {
    ok: true,
    value: {
      id: "p1",
      title: "Keyboard",
    },
  };
}

async function main(): Promise<void> {
  const result = await loadProduct();

  if (result.ok) {
    console.log(result.value.title);
  } else {
    console.log(result.error.message);
  }
}

void main();
```

### `httpStatusResult.ts`

```ts
// Goal:
// Check HTTP status before trusting response JSON.

// Expected result:
// The client returns typed failure states for non-2xx responses.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type HttpError =
  | { kind: "http-error"; status: number }
  | { kind: "invalid-response"; message: string }
  | { kind: "network-error"; message: string };

type ProductRecord = {
  id: string;
  title: string;
};

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.id === "string" && typeof candidate.title === "string";
}

async function loadProduct(url: string): Promise<Result<ProductRecord, HttpError>> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        ok: false,
        error: { kind: "http-error", status: response.status },
      };
    }

    const value: unknown = await response.json();

    if (!isProductRecord(value)) {
      return {
        ok: false,
        error: { kind: "invalid-response", message: "Invalid product" },
      };
    }

    return { ok: true, value };
  } catch (errorValue) {
    return {
      ok: false,
      error: {
        kind: "network-error",
        message: errorValue instanceof Error ? errorValue.message : "Unknown error",
      },
    };
  }
}

console.log(typeof loadProduct);
```

### 机制补充：typed fetch client 有三层失败

一个严谨的 fetch client 不能只检查 JSON shape。至少要分三层：

```txt
network failure:
  fetch itself rejects or environment fails.

HTTP failure:
  response exists but status is not acceptable.

shape failure:
  JSON exists but does not match the expected contract.
```

所以组件层最好消费：

```txt
Promise<Result<TrustedData, ApiError>>
```

而不是：

```txt
Promise<TrustedData>
```

这样 UI 才能稳定区分网络错误、状态码错误和响应结构错误。


### 常见错误

```txt
错误：
Generic fetch<T>() makes API safe.

正确：
Generic type arguments describe expected data.
Runtime validation proves actual data.
```

---

## 17. 12：后端 route handler 类型

### 结论

后端 route handler 是服务器端的框架入口。它必须明确建模 request params、query、body、context 和 response。

### 技术意义

后端 TypeScript 的关键不是“让 Express/Koa/Fastify 有类型”，而是让业务 handler 的输入输出边界清晰，然后再适配具体框架。

### 文件结构

```txt
12-backend-route-handlers/
  typedRouteHandler.ts
  requestBodyParsing.ts
  responseShape.ts
```

### `typedRouteHandler.ts`

```ts
// Goal:
// Type a framework-independent route handler.

// Expected result:
// The handler receives typed params and returns typed response.

export {};

type RouteRequest<ParamsType, QueryType, BodyType> = {
  params: ParamsType;
  query: QueryType;
  body: BodyType;
};

type RouteResponse<StatusCode extends number, BodyType> = {
  status: StatusCode;
  body: BodyType;
};

type Handler<RequestType, ResponseType> = (
  request: RequestType,
) => Promise<ResponseType> | ResponseType;

type GetProductRequest = RouteRequest<
  { productId: string },
  { includeInventory?: "true" },
  undefined
>;

type GetProductResponse = RouteResponse<
  200,
  { product: { id: string; title: string } }
>;

const getProductHandler: Handler<GetProductRequest, GetProductResponse> = (request) => {
  return {
    status: 200,
    body: {
      product: {
        id: request.params.productId,
        title: "Keyboard",
      },
    },
  };
};

console.log(typeof getProductHandler);
```

### `requestBodyParsing.ts`

```ts
// Goal:
// Parse unknown request body before using it.

// Expected result:
// The handler rejects invalid bodies.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type CreateProductBody = {
  title: string;
  priceCents: number;
};

function parseCreateProductBody(value: unknown): Result<CreateProductBody, string> {
  if (typeof value !== "object" || value === null) {
    return { ok: false, error: "Expected object" };
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.title !== "string") {
    return { ok: false, error: "Expected title" };
  }

  if (typeof candidate.priceCents !== "number") {
    return { ok: false, error: "Expected priceCents" };
  }

  return {
    ok: true,
    value: {
      title: candidate.title,
      priceCents: candidate.priceCents,
    },
  };
}

console.log(parseCreateProductBody({ title: "Keyboard", priceCents: 9900 }));
```

### `responseShape.ts`

```ts
// Goal:
// Keep backend response shape explicit.

// Expected result:
// The compiler rejects missing response fields.

export {};

type ApiResponse<DataType> =
  | { ok: true; data: DataType }
  | { ok: false; error: { message: string } };

type ProductRecord = {
  id: string;
  title: string;
};

function createProductResponse(product: ProductRecord): ApiResponse<ProductRecord> {
  return {
    ok: true,
    data: product,
  };
}

// @ts-expect-error: Error response must include error.message.
const invalidResponse: ApiResponse<ProductRecord> = {
  ok: false,
};

console.log(createProductResponse({ id: "p1", title: "Keyboard" }));
console.log(typeof invalidResponse);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| request body 直接当业务类型 | HTTP body 是运行时外部数据，先 `unknown` 再 parse。 |
| handler 返回值没有统一 response shape | client 难以稳定处理。 |
| 后端类型和前端类型手写两份 | 共享 contract 或从 schema 生成类型。 |

---

## 18. 13：middleware、context 和 request augmentation

### 结论

middleware 的核心是逐步给请求生命周期添加信息。TypeScript 要确保后续 handler 只能在信息确实存在的地方读取它。

### 技术意义

框架常用 request augmentation，例如把 `user` 挂到 request 上。类型上可以做，但容易污染全局。更推荐把 context 明确作为泛型或参数传递。

### 文件结构

```txt
13-middleware-context/
  requestContext.ts
  authenticatedHandler.ts
  augmentationRisk.ts
```

### `requestContext.ts`

```ts
// Goal:
// Model middleware context explicitly.

// Expected result:
// The handler only reads fields from its context type.

export {};

type RequestContext = {
  requestId: string;
};

type RequestWithContext<ContextType> = {
  context: ContextType;
};

function withRequestId(
  request: RequestWithContext<{}>,
): RequestWithContext<RequestContext> {
  void request;

  return {
    context: {
      requestId: "req-1",
    },
  };
}

const request = withRequestId({ context: {} });

console.log(request.context.requestId);
```

### `authenticatedHandler.ts`

```ts
// Goal:
// Require authenticated context for protected handlers.

// Expected result:
// The protected handler receives user context.

export {};

type AuthenticatedContext = {
  user: {
    id: string;
    role: "admin" | "member";
  };
};

type Handler<ContextType, ResponseType> = (
  context: ContextType,
) => ResponseType;

const protectedHandler: Handler<AuthenticatedContext, string> = (context) => {
  return context.user.id;
};

console.log(
  protectedHandler({
    user: {
      id: "u1",
      role: "admin",
    },
  }),
);
```

### `augmentationRisk.ts`

```ts
// Goal:
// Prefer explicit context over global request mutation.

// Expected result:
// This file demonstrates explicit context as the safer default.

export {};

type BaseRequest = {
  headers: Record<string, string | undefined>;
};

type AuthenticatedRequest = BaseRequest & {
  user: {
    id: string;
  };
};

function isAuthenticatedRequest(request: BaseRequest): request is AuthenticatedRequest {
  return request.headers.authorization !== undefined && "user" in request;
}

const request: BaseRequest = {
  headers: {
    authorization: "Bearer token",
  },
};

if (isAuthenticatedRequest(request)) {
  console.log(request.user.id);
}
```

### 常见错误

```txt
错误：
After authentication middleware runs, every request type has user.

正确：
Only handlers behind that middleware can safely assume authenticated context.
Use explicit context types or carefully scoped augmentation.
```

---

## 19. 14：前后端共享类型的边界

### 结论

前后端可以共享 TypeScript 类型，但共享类型不等于共享运行时保证。真实项目要同时管理类型导出、运行时验证、版本兼容和部署同步。

### 技术意义

共享类型能减少前后端契约漂移，但如果后端和前端版本不同步，或者数据没有验证，仍然会出错。

### 文件结构

```txt
14-shared-types-boundary/
  sharedContract.ts
  typeOnlyExport.ts
  versionedContract.ts
```

### `sharedContract.ts`

```ts
// Goal:
// Define a shared contract used by client and server.

// Expected result:
// Request and response types stay aligned.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type CreateProductRequest = {
  title: string;
  priceCents: number;
};

export type CreateProductResponse = {
  product: ProductRecord;
};

export function createProductResponse(
  request: CreateProductRequest,
  id: string,
): CreateProductResponse {
  return {
    product: {
      id,
      title: request.title,
      priceCents: request.priceCents,
    },
  };
}
```

### `typeOnlyExport.ts`

```ts
// Goal:
// Use type-only imports and exports for shared contracts.

// Expected result:
// Type-only imports do not create runtime imports.

export type ProductRecord = {
  id: string;
  title: string;
};

export type ProductListResponse = {
  products: ProductRecord[];
};

function renderCount(response: ProductListResponse): number {
  return response.products.length;
}

console.log(renderCount({ products: [] }));
```

### `versionedContract.ts`

```ts
// Goal:
// Version API contracts explicitly.

// Expected result:
// Callers can branch by contract version.

export {};

type ProductResponseV1 = {
  version: "v1";
  product: {
    id: string;
    title: string;
  };
};

type ProductResponseV2 = {
  version: "v2";
  product: {
    id: string;
    title: string;
    priceCents: number;
  };
};

type ProductResponse = ProductResponseV1 | ProductResponseV2;

function renderProduct(response: ProductResponse): string {
  switch (response.version) {
    case "v1":
      return response.product.title;
    case "v2":
      return `${response.product.title}:${response.product.priceCents}`;
  }
}

console.log(renderProduct({ version: "v1", product: { id: "p1", title: "Keyboard" } }));
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 共享 type 就不用验证 | 类型被擦除，运行时还是要验证外部数据。 |
| 前端和后端分别手写相同类型 | 容易 drift。 |
| 修改 contract 不考虑版本 | 已部署客户端可能仍然使用旧 contract。 |

---

## 20. 15：小项目整合

### 结论

本章小项目要把 React UI、API contract、runtime validation、typed client 和 backend handler 串起来，做一个“类型安全产品列表”端到端练习。

### 技术意义

这个小项目不是完整应用，而是专门训练：

```txt
shared contract
  -> backend handler produces response
  -> client fetches unknown JSON
  -> validator narrows data
  -> React component consumes validated state
```

### 文件结构

```txt
15-mini-project/
  sharedContract.ts
  typedClient.ts
  backendHandlers.ts
  frontendProductList.tsx
```

### `sharedContract.ts`

```ts
// Goal:
// Define shared product API contracts.

// Expected result:
// Both client and server use the same contract.

export type ProductRecord = {
  id: string;
  title: string;
  priceCents: number;
};

export type ProductListResponse = {
  products: ProductRecord[];
};

export type ApiError =
  | { kind: "network-error"; message: string }
  | { kind: "invalid-response"; message: string };
```

### `typedClient.ts`

```ts
// Goal:
// Validate unknown API response into a shared contract.

// Expected result:
// The client returns a typed Result.

import type { ApiError, ProductListResponse, ProductRecord } from "./sharedContract";

export type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

function isProductRecord(value: unknown): value is ProductRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.priceCents === "number"
  );
}

function isProductListResponse(value: unknown): value is ProductListResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return Array.isArray(candidate.products) && candidate.products.every(isProductRecord);
}

export async function loadProducts(): Promise<Result<ProductListResponse, ApiError>> {
  try {
    const response = await fetch("/api/products");
    const value: unknown = await response.json();

    if (!isProductListResponse(value)) {
      return {
        ok: false,
        error: { kind: "invalid-response", message: "Invalid product list" },
      };
    }

    return { ok: true, value };
  } catch (errorValue) {
    return {
      ok: false,
      error: {
        kind: "network-error",
        message: errorValue instanceof Error ? errorValue.message : "Unknown error",
      },
    };
  }
}
```

### `backendHandlers.ts`

```ts
// Goal:
// Implement a backend handler that returns the shared response shape.

// Expected result:
// The handler output matches ProductListResponse.

import type { ProductListResponse } from "./sharedContract";

export type RouteResponse<StatusCode extends number, BodyType> = {
  status: StatusCode;
  body: BodyType;
};

export function getProductsHandler(): RouteResponse<200, ProductListResponse> {
  return {
    status: 200,
    body: {
      products: [
        {
          id: "p1",
          title: "Keyboard",
          priceCents: 9900,
        },
      ],
    },
  };
}
```

### `frontendProductList.tsx`

```tsx
// Goal:
// Consume typed API state in a React component.

// Expected result:
// The component renders each request state explicitly.

import { useState } from "react";
import type { ApiError, ProductListResponse } from "./sharedContract";

export {};

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ProductListResponse }
  | { status: "error"; error: ApiError };

function ProductListView() {
  const [state] = useState<RequestState>({ status: "idle" });

  switch (state.status) {
    case "idle":
      return <p>Idle</p>;
    case "loading":
      return <p>Loading</p>;
    case "success":
      return (
        <ul>
          {state.data.products.map((product) => (
            <li key={product.id}>{product.title}</li>
          ))}
        </ul>
      );
    case "error":
      return <p>{state.error.message}</p>;
  }
}

console.log(ProductListView);
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `sharedContract.ts` 定义前后端共同理解的数据形状。 |
| 2 | `backendHandlers.ts` 返回符合 contract 的 response。 |
| 3 | `typedClient.ts` 把 HTTP JSON 当作 `unknown`。 |
| 4 | validator 检查 `unknown` 是否符合 `ProductListResponse`。 |
| 5 | client 返回 `Result<ProductListResponse, ApiError>`。 |
| 6 | React component 使用判别联合渲染 UI 状态。 |
| 7 | 所有边界都能静态检查，但运行时数据仍要验证。 |

---

## 21. 最终文件清单

```txt
typescript/
  chapter-09-frameworks/
    README.md

    00-framework-type-boundary/
      frameworkBoundaryOverview.ts
      untrustedRuntimeBoundary.ts

    01-tsx-jsx-setup/
      jsxElementType.tsx
      tsxAssertionSyntax.tsx
      intrinsicElementTyping.tsx

    02-react-props/
      productCardProps.tsx
      discriminatedComponentProps.tsx
      callbackPropTyping.tsx
      componentPropsUtility.tsx

    03-react-events-forms/
      childrenTyping.tsx
      inputChangeHandler.tsx
      formSubmitModel.tsx
      reactNodeVsJsxElement.tsx
      refNullability.tsx
      effectAsyncCleanup.tsx

    04-react-state-reducer/
      requestStateUnion.tsx
      stateInferencePitfall.tsx
      reducerActionUnion.tsx
      exhaustiveReducer.tsx

    05-react-context-hooks/
      nullableContext.tsx
      customHookReturnType.tsx
      genericDataHook.tsx

    06-angular-components/
      productCardComponent.ts
      typedOutputEvent.ts
      inputTransformBoundary.ts
      signalInputOutputBoundary.ts

    07-angular-template-checking/
      templateContextModel.ts
      nullableTemplateData.ts
      templateEventTyping.ts

    08-angular-services-http/
      productApiService.ts
      httpUnknownBoundary.ts
      serviceResultModel.ts

    09-api-contracts/
      sharedApiTypes.ts
      endpointMap.ts
      routeParamsQueryBody.ts

    10-runtime-validation/
      productValidator.ts
      apiResponseValidator.ts
      validatorResult.ts

    11-typed-fetch-client/
      typedFetch.ts
      endpointClient.ts
      fetchResultBoundary.ts
      httpStatusResult.ts

    12-backend-route-handlers/
      typedRouteHandler.ts
      requestBodyParsing.ts
      responseShape.ts

    13-middleware-context/
      requestContext.ts
      authenticatedHandler.ts
      augmentationRisk.ts

    14-shared-types-boundary/
      sharedContract.ts
      typeOnlyExport.ts
      versionedContract.ts

    15-mini-project/
      sharedContract.ts
      typedClient.ts
      backendHandlers.ts
      frontendProductList.tsx

notes/
  typescript.md
```

---

## 22. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### Topic name

Conclusion:
Explain what problem it solves.

Technical meaning:
Explain what TypeScript checks.

Runtime mechanism:
Explain what React, Angular, browser, server, or framework actually does.

Code example:
Keep one example that proves the mechanism.

Common mistake:
Write one mistake you personally may make.

Project relation:
Connect it to React components, Angular templates, API clients, backend handlers, or shared contracts.
```

最终笔记必须包含这些对比：

```txt
.ts vs .tsx
JSX intrinsic element vs value-based component
JSX type checking vs runtime rendering
props object vs component state
callback prop vs event handler
ReactNode vs JSX.Element
inline event handler inference vs extracted handler annotation
nullable Context vs safe custom hook
useState inference vs explicit state union
reducer action union vs string action
Angular Input vs Output
Angular component class type vs template expression type
template type checking vs runtime template rendering
HttpClient generic type vs runtime response validation
API contract vs API implementation
shared type vs runtime schema
type-only import vs runtime import
frontend validation vs backend validation
typed fetch generic vs validator-based fetch
route params vs query vs body
middleware mutation vs explicit context
Result response vs thrown exception
versioned contract vs breaking API change
ComponentPropsWithoutRef vs manually copied DOM props
useState inference vs explicit generic state
ref.current nullability vs direct DOM access
useEffect cleanup vs async callback return
Angular decorator input vs signal input
HTTP status validation vs response shape validation
```

---

## 23. 本章最终要能回答的问题

学完第 9 章后，你必须能不用查资料回答这些问题：

1. TypeScript 在框架项目里主要检查什么？
2. 为什么 JSX 文件必须用 `.tsx`？
3. `jsx` tsconfig 选项控制什么？
4. JSX intrinsic element 和 value-based element 有什么区别？
5. `.tsx` 里为什么不能默认使用尖括号类型断言？
6. React props 为什么应该被看成组件调用合同？
7. 为什么 mutually exclusive props 适合用 discriminated union？
8. callback prop 的参数类型为什么属于父子组件边界？
9. `ReactNode` 和 `JSX.Element` 有什么区别？
10. 抽离 React event handler 后为什么经常要写事件类型？
11. React state 什么时候应该用判别联合？
12. reducer action 为什么不应该写成普通 `string`？
13. Context 默认值没有业务意义时为什么用 `null` 更诚实？
14. safe custom hook 如何消除 Context 的 `null`？
15. Angular `@Input()` 和 `@Output()` 分别建模什么？
16. Angular template checking 能检查哪些问题？
17. Angular template 中读取 nullable 值为什么要先 guard？
18. `event.target` 为什么不是直接的 `HTMLInputElement`？
19. HTTP 泛型为什么不能代替 runtime validation？
20. API contract 应该包含哪些部分？
21. 为什么外部 JSON 应该先是 `unknown`？
22. type guard 和 validator Result 怎么选择？
23. typed fetch client 的核心边界是什么？
24. 后端 route handler 应该建模哪些输入？
25. request body 为什么必须解析和验证？
26. middleware context 如何避免全局污染？
27. 前后端共享类型有什么价值和风险？
28. type-only import 解决什么问题？
29. 为什么共享 TypeScript type 不等于运行时兼容？
30. 如何处理 API contract 的版本变化？
31. React UI 状态、API Result 和 backend response 如何串起来？
32. 第 9 章如何连接前面 3 到 8 章的所有类型能力？
33. `ComponentPropsWithoutRef<"button">` 解决什么复用问题？
34. 为什么 `useState([])` 和 `useState(null)` 经常需要显式泛型？
35. React ref 的 `current` 为什么通常要处理 `null`？
36. 为什么 `useEffect` 不能直接接收 `async` callback？
37. Angular signal input 和 decorator input 在类型边界上有什么共同点？
38. typed fetch client 为什么要同时处理 network failure、HTTP status failure 和 response shape failure？

---

## 24. TS 官方文档阅读清单

按这个顺序读 TypeScript 和框架官方文档对应内容：

1. [TypeScript JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)  
   重点读 Basic usage、`as` operator、Type Checking、intrinsic elements、value-based elements、Function Component、Attribute type checking。

2. [TSConfig jsx](https://www.typescriptlang.org/tsconfig/jsx.html)  
   理解 `preserve`、`react`、`react-jsx`、`react-jsxdev` 的输出区别。

3. [React Using TypeScript](https://react.dev/learn/typescript)  
   重点读 components props、Hooks examples、`useState`、`useReducer`、`useContext`、DOM events、children。

4. [Angular Template Type Checking](https://angular.dev/tools/cli/template-typecheck)  
   重点理解模板绑定、nullable 值、事件和输入输出如何进入类型检查。

5. [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)  
   复习 props、request、response、context 的对象建模。

6. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)  
   复习判别联合、type guard、assertion function、`never` 全面性检查。框架 UI state 和 API validation 都依赖它。

7. [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)  
   复习 callback、event handler、route handler、middleware 函数类型。

8. [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)  
   复习 typed client、endpoint map、service、repository 的泛型关系。

9. [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)  
   重点读 `Pick`、`Omit`、`Readonly`、`Parameters`、`ReturnType`、`Awaited`。这些常用于从 API 和 handler 派生类型。

10. [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)  
    复习 `import` / `export`，尤其是 shared contract 的 type-only import/export。

11. [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)  
    只做预习：当第三方框架插件缺类型时，理解 `.d.ts` 的作用。

12. [TSConfig lib](https://www.typescriptlang.org/tsconfig/lib.html) 和 [TSConfig types](https://www.typescriptlang.org/tsconfig/types.html)  
    理解 DOM、Node、React、测试框架等类型声明如何进入项目。

13. [React useRef](https://react.dev/reference/react/useRef) 和 [React useEffect](https://react.dev/reference/react/useEffect)  
    理解 DOM ref 的 `current` 为什么可能是 `null`，以及 effect setup / cleanup 为什么不是普通 async callback。

14. [Angular Inputs](https://angular.dev/guide/components/inputs) 和 [Angular input API](https://angular.dev/api/core/input)  
    了解现代 Angular signal input 与传统 decorator input 都是在描述组件输入边界。

---

## 25. 第 9 章最终记忆模型

```txt
Framework TypeScript is boundary modeling.

React boundary:
  props
  children
  event handlers
  state
  reducer actions
  context
  custom hooks
  refs
  effects

Angular boundary:
  component inputs
  component outputs
  template expressions
  services
  HTTP responses

API boundary:
  endpoint
  params
  query
  body
  response
  error

Backend boundary:
  request
  context
  route handler
  middleware
  response

Runtime trust boundary:
  unknown external data
  validator
  domain type
  Result
  UI state

Shared contract boundary:
  type-only export
  versioned API shape
  runtime validation
  frontend and backend alignment
```

### 最终一句话

```txt
第 3 章让你描述值的形状。
第 4 章让你描述行为的边界。
第 5 章让你描述对象的长期结构和抽象契约。
第 6 章让你理解类型系统如何比较、缩小、派生、转换和保护类型。
第 7 章让你把失败路径变成可读、可检查、可组合的代码结构。
第 8 章让你把未来值、并发任务、异步序列和跨线程消息协议建模清楚。
第 9 章让你把这些能力放进 React、Angular、API client 和 backend handler 的真实工程边界。

真正的 TypeScript 框架学习，不是记住某个框架类型名字，而是能把组件输入输出、模板绑定、API 协议、运行时验证和后端请求响应统一建模。
```


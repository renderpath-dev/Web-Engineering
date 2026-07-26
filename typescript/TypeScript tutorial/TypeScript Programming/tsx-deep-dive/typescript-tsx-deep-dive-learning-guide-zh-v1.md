# TypeScript 做项目前补充 01：TSX 深水区学习指导文件 v1

> 定位：这是做 React / Next.js 项目前必须补的 TSX 深水区学习指导文件，不是最终学习笔记。  
> 目标：按照这份文件创建练习目录、写 `.tsx` / `.ts` 文件、运行 `tsc --noEmit`，观察组件 props、children、DOM props、事件、ref、泛型组件、多态组件和复合组件的类型边界。  
> 参考范围：TypeScript 官方 JSX 文档、React 官方 TypeScript 文档、React 官方 `forwardRef` / `useImperativeHandle` 文档、React DOM common props 文档、Next.js App Router `use client` 文档、TypeScript Handbook 的 Object Types、Generics、Conditional Types、Utility Types。  
> 代码规则：代码命名、字符串和代码注释统一英文；代码块中不使用中文字符。  
> 学习原则：先理解 TSX 的类型检查边界，再理解 React 组件 API 如何被类型系统描述。不要把本文件学成“React 类型名速查表”。

> 重要说明：React 19 开始 `ref` 可以作为 prop 传递，`forwardRef` 在官方文档中被标记为未来会废弃。但大量项目仍在 React 18 或 React 18 兼容写法中使用 `forwardRef`。本文件同时训练 React 18 常见写法和 React 19 方向的迁移模型。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| `.tsx`、`jsx` 编译选项、`as` 断言、intrinsic elements、value-based elements、attribute checking | https://www.typescriptlang.org/docs/handbook/jsx.html |
| React props、Hooks、事件、children、style props | https://react.dev/learn/typescript |
| `forwardRef`、ref 转发、React 19 ref as prop 方向 | https://react.dev/reference/react/forwardRef |
| `useImperativeHandle` 暴露受限 imperative API | https://react.dev/reference/react/useImperativeHandle |
| `ComponentProps`、`Omit`、`NoInfer` 等组件 API 派生工具 | https://www.typescriptlang.org/docs/handbook/utility-types.html |
| `jsx` 输出模式：`preserve`、`react`、`react-jsx`、`react-jsxdev`、`react-native` | https://www.typescriptlang.org/tsconfig/jsx.html |
| `jsxImportSource`、automatic runtime 和替代 JSX runtime | https://www.typescriptlang.org/tsconfig/jsxImportSource.html |
| React DOM common props、style、data 属性、ref callback 行为 | https://react.dev/reference/react-dom/components/common |
| Next.js App Router Client Component 边界、`use client` 和 serializable props | https://nextjs.org/docs/app/api-reference/directives/use-client |


---

## 目录

1. [官方文档对应关系](#官方文档对应关系)
2. [1. 本文件怎么用](#1-本文件怎么用)
3. [2. 项目重新整理建议](#2-项目重新整理建议)
4. [3. 本章先要建立的底层模型](#3-本章先要建立的底层模型)
5. [4. 00：TSX 深水区到底在解决什么](#4-00tsx-深水区到底在解决什么)
6. [5. 01：ReactNode、ReactElement 和 JSX.Element](#5-01reactnodereactelement-和-jsxelement)
7. [6. 02：组件 props、DOM props 和 ComponentProps](#6-02组件-propsdom-props-和-componentprops)
8. [7. 03：受控表单组件和事件类型](#7-03受控表单组件和事件类型)
9. [8. 04：ref、forwardRef 和 React 19 ref as prop](#8-04refforwardref-和-react-19-ref-as-prop)
10. [9. 05：useImperativeHandle 和受限 imperative API](#9-05useimperativehandle-和受限-imperative-api)
11. [10. 06：泛型组件](#10-06泛型组件)
12. [11. 07：多态组件 as prop](#11-07多态组件-as-prop)
13. [12. 08：复合组件 compound component](#12-08复合组件-compound-component)
14. [13. 09：组件 API 设计小项目](#13-09组件-api-设计小项目)
15. [14. 最终学习笔记转换要求](#14-最终学习笔记转换要求)
16. [15. 最终要能回答的问题](#15-最终要能回答的问题)
17. [16. 最终记忆模型](#16-最终记忆模型)
18. [17. 最终文件清单](#17-最终文件清单)

## 1. 本文件怎么用

### 结论

TSX 深水区训练的是“组件如何成为安全、可复用、可扩展 API”。

你已经学过类型、函数、类、泛型、映射类型、条件类型、模块和构建；现在要把它们放进组件边界：

```txt
component props
children
DOM props
events
refs
generic components
polymorphic components
compound components
```

### 每节固定学习步骤

```txt
1. Read the conclusion first.
2. Decide whether the section is about renderable value, component contract, DOM prop inheritance, event boundary, ref boundary, generic relation, or component composition.
3. Create the target directory.
4. Write the valid example.
5. Write the invalid example with @ts-expect-error when possible.
6. Run npx tsc --noEmit.
7. Explain what TypeScript checks and what React does at runtime.
8. Convert the result into notes/typescript.md.
```

### `package.json`

```json
{
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
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
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true
  }
}
```

---

## 2. 项目重新整理建议

### 结论

建议新增：

```txt
typescript/tsx-deep-dive/
```

### 推荐结构

```txt
typescript/
  tsx-deep-dive/
    README.md
    package.json
    tsconfig.json
    00-tsx-problem-model/
      componentApiBoundary.tsx
      tsxParsingAndRuntime.tsx
      tsxAssertionSyntax.tsx
      jsxRuntimeOutputBoundary.tsx
    01-renderable-types/
      reactNodeVsReactElement.tsx
      childrenContract.tsx
    02-component-dom-props/
      intrinsicProps.tsx
      buttonPropsComposition.tsx
      styleProps.tsx
      jsxIntrinsicAttributeChecking.tsx
      componentPropsFromCustomComponent.tsx
      componentAsProp.tsx
    03-events-forms/
      extractedEventHandler.tsx
      controlledInput.tsx
      uncontrolledInput.tsx
    04-refs/
      react18ForwardRef.tsx
      react19RefProp.tsx
      refNullability.tsx
      callbackRefBoundary.tsx
    05-imperative-handle/
      inputHandle.tsx
    06-generic-components/
      genericSelect.tsx
      genericList.tsx
    07-polymorphic-as-prop/
      polymorphicBox.tsx
      polymorphicButtonLink.tsx
    08-compound-components/
      tabsModel.tsx
      staticPropertyTyping.tsx
    09-mini-project/
      uiTypes.ts
      Button.tsx
      TextField.tsx
      SelectField.tsx
      Card.tsx
      Demo.tsx
    10-nextjs-boundary/
      clientCounter.tsx
      serializableClientProps.tsx
```

### `README.md`

```md
# TSX Deep Dive

This practice folder focuses on TSX before React project development.

## Check commands

npm install
npm run typecheck

## Learning boundary

TSX syntax is checked by TypeScript.
React renders elements at runtime.
Component props are public API contracts.
DOM props should be inherited from React types.
Refs are imperative escape hatches.
```

---

## 3. 本章先要建立的底层模型

### 结论

TSX 类型系统有三层：

```txt
JSX syntax layer:
  TypeScript parses XML-like syntax inside .tsx.

React type layer:
  React types define ReactNode, ReactElement, events, refs, and component props helpers.

Component API layer:
  Your component props define the public contract.
```

### 关键术语

| 术语 | 技术意义 |
|---|---|
| `ReactNode` | React 可以渲染的宽泛值，包括元素、字符串、数字、null、数组等。 |
| `ReactElement` | React 元素对象，不包括普通字符串和数字。 |
| `JSX.Element` | JSX 表达式的返回类型，通常对应 React 元素。 |
| `ComponentProps<"button">` | 从 intrinsic element 提取 DOM props。 |
| `ComponentProps<typeof X>` | 从组件值提取 props 类型。 |
| `ComponentPropsWithoutRef` | 提取 props 但排除 ref。 |
| `ComponentPropsWithRef` | 提取 props 并保留 ref。 |
| `ElementType` | 可以作为 JSX element 的类型，包含字符串标签和组件。 |
| polymorphic component | 通过 `as` prop 改变底层渲染元素的组件。 |
| compound component | 多个子组件组合成一个高层 API 的组件模式。 |
| `JSX.IntrinsicElements` | TypeScript 用来检查小写 JSX 标签和 DOM 属性的接口。 |
| `JSX.ElementAttributesProperty` | TypeScript 用来决定 value-based element 从哪个属性读取 props 类型的 JSX 协议点。 |
| `CSSProperties` | React 提供的 inline style 对象类型，用来检查 CSS 属性名和值。 |
| `ChangeEventHandler<T>` | React 提供的事件 handler 类型别名，用来给抽离出来的事件函数补回上下文类型。 |

### 技术意义

TSX 不是“带类型的 HTML”。它是 TypeScript 对 JSX 语法、React 类型声明和组件函数签名的联合检查。学 React 前先掌握 TSX，核心是避免三个混淆：

```txt
JSX syntax is not HTML.
React element objects are not DOM nodes.
TypeScript props checking is not runtime validation.
```

### 底层机制

```txt
.tsx source file
  -> TypeScript parses JSX syntax
  -> jsx compiler option decides output shape
  -> JSX namespace decides intrinsic element and attribute checking
  -> React type declarations describe events, refs, children, and DOM props
  -> emitted JavaScript creates React element descriptions
  -> React runtime renders those descriptions into UI
```

---

## 4. 00：TSX 深水区到底在解决什么

### 结论

TSX 深水区解决的是“组件如何成为安全、可复用、可扩展 API”的问题。

### `componentApiBoundary.tsx`

```tsx
// Goal:
// Treat a React component as a public API boundary.

// Expected result:
// The compiler rejects invalid component usage.

export {};

type ProductBadgeProps = {
  title: string;
  tone: "neutral" | "warning" | "success";
};

function ProductBadge(props: ProductBadgeProps) {
  return <span data-tone={props.tone}>{props.title}</span>;
}

const validBadge = <ProductBadge title="Ready" tone="success" />;

// @ts-expect-error: The tone value is not part of the public contract.
const invalidBadge = <ProductBadge title="Ready" tone="danger" />;

console.log(validBadge, invalidBadge);
```

### 技术意义

这一节补齐 TSX 自身的前置边界：`.tsx` 文件启用 JSX 解析，`jsx` 选项决定 JSX 输出方式，组件名大小写决定 TypeScript 按 DOM intrinsic element 还是组件值来查 props 类型。

### 底层机制

```txt
Lowercase JSX tag:
  <button />
  -> TypeScript checks JSX.IntrinsicElements["button"]
  -> React runtime receives "button" as element type

Uppercase JSX tag:
  <ProductBadge />
  -> TypeScript resolves ProductBadge identifier in scope
  -> TypeScript checks ProductBadge props type
  -> React runtime receives ProductBadge function as element type
```

### `tsxParsingAndRuntime.tsx`

```tsx
// Goal:
// Verify the difference between intrinsic elements and value-based components.

// Expected result:
// Lowercase tags use intrinsic element types, uppercase tags use component props.

export {};

type StatusLabelProps = {
  statusText: string;
};

function StatusLabel(props: StatusLabelProps) {
  return <span>{props.statusText}</span>;
}

const intrinsicElement = <button type="button">Save</button>;
const valueBasedElement = <StatusLabel statusText="Ready" />;

// @ts-expect-error: statusText is required by StatusLabelProps.
const missingPropElement = <StatusLabel />;

// @ts-expect-error: href is not a valid button attribute.
const invalidIntrinsicElement = <button href="/products">Open</button>;

console.log(intrinsicElement, valueBasedElement, missingPropElement, invalidIntrinsicElement);
```

### `tsxAssertionSyntax.tsx`

```tsx
// Goal:
// Use as assertions in TSX where angle-bracket assertions are not allowed.

// Expected result:
// The as assertion narrows the unknown value for compile-time use only.

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
const element = <p>{product.title}</p>;

console.log(element);
```


### 补充：`jsx` 输出模式不是 React 运行时本身

`jsx` 选项决定 TypeScript 如何输出 JSX 语法；React runtime 决定这些元素描述如何变成 UI。两者不是同一层。

```txt
TypeScript layer:
  Parses JSX.
  Checks props.
  Emits JSX output based on the jsx option.

React layer:
  Receives element descriptions.
  Reconciles them.
  Renders DOM or another target.
```

### `jsxRuntimeOutputBoundary.tsx`

```tsx
// Goal:
// Show that TSX creates element descriptions, not real DOM nodes.

// Expected result:
// The component returns JSX that React can render later.

export {};

type StatusViewProps = {
  status: "idle" | "loading" | "success";
};

function StatusView(props: StatusViewProps) {
  return <span data-status={props.status}>{props.status}</span>;
}

const element = <StatusView status="success" />;

// @ts-expect-error: danger is not part of StatusViewProps.
const invalidElement = <StatusView status="danger" />;

console.log(element, invalidElement);
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | TypeScript 解析 `.tsx`。 |
| 2 | TypeScript 根据组件函数参数检查 props。 |
| 3 | JSX 被编译为 React runtime 能理解的元素描述。 |
| 4 | React 在运行时渲染元素。 |
| 5 | 类型在运行时被擦除。 |
| 6 | 小写标签从 `JSX.IntrinsicElements` 查属性类型。 |
| 7 | 大写标签先解析作用域里的组件值，再用组件参数类型检查 props。 |
| 8 | `.tsx` 中不能写 `<ProductRecord>rawValue` 这种角括号断言，要写 `rawValue as ProductRecord`。 |

---

## 5. 01：ReactNode、ReactElement 和 JSX.Element

### 结论

`ReactNode` 表示可渲染内容，范围最宽；`ReactElement` 表示 React 元素对象；`JSX.Element` 是 TSX 表达式常见返回类型。

### 技术意义

React 组件的 `children` 和 slot-like props 大多应该接收 `ReactNode`，因为调用方可能传字符串、数字、`null`、数组或元素。只有当你明确要求“必须是一个 React element object”时，才使用 `ReactElement`。

### 底层机制

```txt
JSX expression:
  <span>Text</span>
  -> creates a React element object

Renderable children:
  "Text"
  42
  null
  [<span key="a" />]
  -> React can render or ignore these values according to React rendering rules
```

### `reactNodeVsReactElement.tsx`

```tsx
// Goal:
// Compare ReactNode and ReactElement.

// Expected result:
// ReactNode accepts strings, numbers, null, and elements.

import type { ReactElement, ReactNode } from "react";

export {};

type NodePanelProps = {
  content: ReactNode;
};

function NodePanel(props: NodePanelProps) {
  return <section>{props.content}</section>;
}

const nodeA = <NodePanel content="Text content" />;
const nodeB = <NodePanel content={42} />;
const nodeC = <NodePanel content={null} />;
const nodeD = <NodePanel content={<strong>Element content</strong>} />;

const elementOnly: ReactElement = <span>Element</span>;

// @ts-expect-error: A string is not a ReactElement.
const notElement: ReactElement = "Text content";

console.log(nodeA, nodeB, nodeC, nodeD, elementOnly, notElement);
```

### `childrenContract.tsx`

```tsx
// Goal:
// Model children as renderable content.

// Expected result:
// The children prop accepts React renderable values.

import type { ReactNode } from "react";

export {};

type CardProps = {
  title: string;
  children: ReactNode;
};

function Card(props: CardProps) {
  return (
    <article>
      <h2>{props.title}</h2>
      <div>{props.children}</div>
    </article>
  );
}

const card = (
  <Card title="Product">
    <p>Keyboard</p>
  </Card>
);

console.log(card);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有 children 都写成 `JSX.Element` | 大多数组件应该接受 `ReactNode`。 |
| `ReactElement` 可以表示字符串 | `ReactElement` 只表示元素对象。 |
| 用 TS 强制 children 必须是某个组件 | React 类型系统不能可靠限制具体 JSX 子元素类型。 |

---

## 6. 02：组件 props、DOM props 和 ComponentProps

### 结论

组件包装原生 DOM 元素时，不应该手写所有 DOM 属性。要从 intrinsic element 提取 props，再和自己的业务 props 组合。

### 技术意义

DOM props 是 React 类型声明已经维护好的公共合同。组件库包装 `<button>`、`<input>`、`<a>` 时，直接继承对应 intrinsic element props，能自动获得事件、ARIA、disabled、type、href 等属性检查。再用 `Omit` 控制哪些属性由组件内部接管。

### 底层机制

```txt
ComponentPropsWithoutRef<"button">
  -> reads React's button prop type
  -> excludes ref
  -> keeps event handler and DOM attributes

Omit<..., "className">
  -> removes a prop from caller API
  -> component controls styling internally
```

### `intrinsicProps.tsx`

```tsx
// Goal:
// Extract DOM props from an intrinsic button element.

// Expected result:
// The wrapper accepts normal button attributes.

import type { ComponentPropsWithoutRef } from "react";

export {};

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

function NativeButton(props: NativeButtonProps) {
  return <button {...props} />;
}

const button = (
  <NativeButton
    type="button"
    disabled={false}
    onClick={(event) => {
      console.log(event.currentTarget.disabled);
    }}
  >
    Save
  </NativeButton>
);

console.log(button);
```

### `buttonPropsComposition.tsx`

```tsx
// Goal:
// Compose custom button props with native button props.

// Expected result:
// The wrapper supports native button props and custom variant.

import type { ComponentPropsWithoutRef } from "react";

export {};

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  variant: ButtonVariant;
} & Omit<ComponentPropsWithoutRef<"button">, "className">;

function Button(props: ButtonProps) {
  const { variant, ...buttonProps } = props;

  return <button data-variant={variant} {...buttonProps} />;
}

const validButton = (
  <Button variant="primary" type="button" disabled={false}>
    Save
  </Button>
);

// @ts-expect-error: className is owned by the component implementation.
const invalidButton = <Button variant="primary" className="external" />;

console.log(validButton, invalidButton);
```

### `styleProps.tsx`

```tsx
// Goal:
// Type inline style props with React CSSProperties.

// Expected result:
// Valid CSS property names are checked by TypeScript.

import type { CSSProperties, ReactNode } from "react";

export {};

type SurfaceProps = {
  children: ReactNode;
  style?: CSSProperties;
};

function Surface(props: SurfaceProps) {
  return <section style={props.style}>{props.children}</section>;
}

const panel = (
  <Surface style={{ padding: "12px", borderWidth: 1 }}>
    Product panel
  </Surface>
);

// @ts-expect-error: padLeft is not a valid React CSS property.
const invalidPanel = <Surface style={{ padLeft: "12px" }}>Invalid</Surface>;

console.log(panel, invalidPanel);
```

### `jsxIntrinsicAttributeChecking.tsx`

```tsx
// Goal:
// Verify JSX attribute checking for intrinsic and custom attributes.

// Expected result:
// DOM attributes are checked, while data attributes are accepted.

export {};

const validInput = <input aria-label="Search" data-track-id="search-input" />;

// @ts-expect-error: invalidAttribute is not part of input props.
const invalidInput = <input invalidAttribute="value" />;

type ProductLinkProps = {
  href: string;
  label: string;
};

function ProductLink(props: ProductLinkProps) {
  return <a href={props.href}>{props.label}</a>;
}

const validLink = <ProductLink href="/products" label="Products" />;

// @ts-expect-error: label is required by ProductLinkProps.
const invalidLink = <ProductLink href="/products" />;

console.log(validInput, invalidInput, validLink, invalidLink);
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `ComponentPropsWithoutRef<"button">` 从 React 的 intrinsic button 类型中提取 DOM props。 |
| 2 | `Omit<..., "className">` 从调用者可传 props 中移除 `className`。 |
| 3 | `CSSProperties` 检查 inline style 的属性名和值。 |
| 4 | `data-*` 和 `aria-*` 属性属于 DOM / React attribute 边界，适合用来传可追踪元信息和可访问性信息。 |
| 5 | 自定义组件的 props 由函数参数类型决定，不会自动接受任意属性。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 手写 `onClick?: Function` | 从 DOM props 提取事件类型。 |
| wrapper 丢掉所有原生 props | 用 `ComponentPropsWithoutRef<"button">` 继承。 |
| 盲目透传 `className` | 设计系统组件可以选择接管或开放样式入口。 |

---

### 补充：`ComponentProps<typeof Component>` 从自定义组件提取 props

`ComponentProps<"button">` 是从 intrinsic element 提取 DOM props；`ComponentProps<typeof ProductBadge>` 是从组件值提取组件 props。前者查 React DOM 声明，后者查你写的组件函数参数。

### `componentPropsFromCustomComponent.tsx`

```tsx
// Goal:
// Extract props from a custom component value.

// Expected result:
// Wrapper props stay linked to the original component props.

import type { ComponentProps } from "react";

export {};

type ProductBadgeProps = {
  title: string;
  tone: "neutral" | "success" | "warning";
};

function ProductBadge(props: ProductBadgeProps) {
  return <span data-tone={props.tone}>{props.title}</span>;
}

type ProductBadgeWrapperProps = ComponentProps<typeof ProductBadge> & {
  trackingId: string;
};

function TrackedProductBadge(props: ProductBadgeWrapperProps) {
  const { trackingId, ...badgeProps } = props;

  return <span data-tracking-id={trackingId}><ProductBadge {...badgeProps} /></span>;
}

const valid = (
  <TrackedProductBadge title="Ready" tone="success" trackingId="badge-1" />
);

const invalid = (
  // @ts-expect-error: tone must come from ProductBadgeProps.
  <TrackedProductBadge title="Ready" tone="danger" trackingId="badge-2" />
);

console.log(valid, invalid);
```

### 补充：`ComponentType` 和 `ElementType` 的边界

`ComponentType<Props>` 表示一个 React 组件值，并且这个组件必须接收指定 props。`ElementType` 更宽，可以是 `"button"` 这种字符串标签，也可以是组件。做“组件作为 prop”时，通常先用 `ComponentType`；做 polymorphic `as` 时才需要 `ElementType`。

### `componentAsProp.tsx`

```tsx
// Goal:
// Pass a typed component as a prop.

// Expected result:
// The item component must accept ProductItemProps.

import type { ComponentType } from "react";

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ProductItemProps = {
  product: ProductRecord;
};

type ProductListProps = {
  products: ProductRecord[];
  ItemComponent: ComponentType<ProductItemProps>;
};

function ProductList(props: ProductListProps) {
  const { products, ItemComponent } = props;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <ItemComponent product={product} />
        </li>
      ))}
    </ul>
  );
}

function ProductRow(props: ProductItemProps) {
  return <span>{props.product.title}</span>;
}

function InvalidRow(props: { userId: string }) {
  return <span>{props.userId}</span>;
}

const valid = (
  <ProductList products={[{ id: "p1", title: "Keyboard" }]} ItemComponent={ProductRow} />
);

const invalid = (
  // @ts-expect-error: InvalidRow does not accept ProductItemProps.
  <ProductList products={[{ id: "p1", title: "Keyboard" }]} ItemComponent={InvalidRow} />
);

console.log(valid, invalid);
```

### 本节补充执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `ComponentProps<typeof ProductBadge>` 读取组件函数参数类型。 |
| 2 | wrapper 组件继承原组件 props，同时增加自己的 `trackingId`。 |
| 3 | `ComponentType<ProductItemProps>` 要求传入的组件能接收 `product`。 |
| 4 | TypeScript 检查组件值本身，不会在运行时验证组件行为。 |


## 7. 03：受控表单组件和事件类型

### 结论

表单组件要分清 DOM event、state value、业务提交 payload 三个边界。

### 技术意义

React 官方建议：事件 handler 写在 JSX 内联位置时，TypeScript 通常能从 prop 上下文推导 event 类型；但一旦把 handler 抽离成独立函数，必须显式写 `ChangeEventHandler<HTMLInputElement>` 或 `React.ChangeEvent<HTMLInputElement>`，否则参数容易退化为 `any` 或失去 DOM 元素类型。

### 底层机制

```txt
Inline handler:
  <input onChange={(event) => ...} />
  -> event type comes from input onChange prop

Extracted handler:
  const handleChange = (event) => ...
  -> no JSX prop context at declaration site
  -> annotate handler type explicitly
```

### `extractedEventHandler.tsx`

```tsx
// Goal:
// Type an extracted React change event handler.

// Expected result:
// The event currentTarget is an HTMLInputElement.

import type { ChangeEventHandler } from "react";

export {};

const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (event) => {
  const nextValue = event.currentTarget.value;
  console.log(nextValue.toUpperCase());
};

const input = <input value="keyboard" onChange={handleSearchChange} />;

console.log(input);
```

### `controlledInput.tsx`

```tsx
// Goal:
// Create a reusable controlled text input.

// Expected result:
// The parent owns the value.

import type { ChangeEventHandler } from "react";

export {};

type TextInputProps = {
  value: string;
  onValueChange(value: string): void;
  label: string;
};

function TextInput(props: TextInputProps) {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    props.onValueChange(event.currentTarget.value);
  };

  return (
    <label>
      <span>{props.label}</span>
      <input value={props.value} onChange={handleChange} />
    </label>
  );
}

const input = (
  <TextInput
    label="Search"
    value="keyboard"
    onValueChange={(value) => {
      console.log(value.toUpperCase());
    }}
  />
);

console.log(input);
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `ChangeEventHandler<HTMLInputElement>` 把 handler 参数固定为 React change event。 |
| 2 | `event.currentTarget` 被识别为 `HTMLInputElement`。 |
| 3 | `currentTarget.value` 是 DOM 字符串值。 |
| 4 | `TextInput` 不把 DOM event 暴露给外部，而是调用 `onValueChange(value)`。 |
| 5 | 父组件只处理业务值，不需要知道 DOM event 细节。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 把 DOM event 暴露给业务层 | 组件内部把 event 转成业务值。 |
| 抽离 handler 后不写类型 | 抽离后上下文推导可能丢失。 |
| 所有表单字段都用 `any` | 字段状态应该有明确 payload 类型。 |

---

### 补充：controlled input 和 uncontrolled input 的边界

受控组件把 value 存在 React state 中；非受控组件把当前 value 留在 DOM 节点里，通过 ref 在提交时读取。设计系统里的文本输入多数应该用 controlled 模型；一次性表单或不需要实时同步的字段可以用 uncontrolled 模型。

### `uncontrolledInput.tsx`

```tsx
// Goal:
// Model an uncontrolled input with a ref.

// Expected result:
// The value is read from the DOM node during submit.

import { useRef } from "react";
import type { FormEventHandler } from "react";

export {};

function SearchForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const value = inputRef.current?.value ?? "";
    console.log(value.trim().toLowerCase());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="Keyboard" />
      <button type="submit">Search</button>
    </form>
  );
}

console.log(SearchForm);
```

### 对比模型

| 模型 | 数据来源 | 适合场景 |
|---|---|---|
| controlled input | React state | 实时校验、联动 UI、业务状态同步 |
| uncontrolled input | DOM node | 简单提交、一次性读取、非关键中间状态 |


## 8. 04：ref、forwardRef 和 React 19 ref as prop

### 结论

ref 是命令式访问边界，不是普通数据流。React 18 常用 `forwardRef`，React 19 方向是把 `ref` 当作 prop 传递。

### 技术意义

ref 的作用是访问 DOM 节点或组件暴露的 imperative handle。它不是组件状态同步机制。React 19 方向降低了 `forwardRef` 的必要性，但 React 18 项目和大量组件库仍需要理解 `forwardRef` 写法。

### 底层机制

```txt
React 18 style:
  parent ref
  -> forwardRef wrapper
  -> child DOM node or handle

React 19 style:
  ref is available as a prop
  -> component passes ref to DOM node or useImperativeHandle
```

### `react18ForwardRef.tsx`

```tsx
// Goal:
// Type a React 18 style forwardRef input component.

// Expected result:
// The ref points to HTMLInputElement.

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

export {};

type TextFieldProps = {
  label: string;
} & ComponentPropsWithoutRef<"input">;

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  props,
  ref,
) {
  const { label, ...inputProps } = props;

  return (
    <label>
      <span>{label}</span>
      <input ref={ref} {...inputProps} />
    </label>
  );
});

console.log(TextField);
```

### `react19RefProp.tsx`

```tsx
// Goal:
// Model React 19 style ref-as-prop typing.

// Expected result:
// The component accepts a typed ref prop.

import type { ComponentPropsWithRef } from "react";

export {};

type TextFieldProps = {
  label: string;
} & ComponentPropsWithRef<"input">;

function TextField(props: TextFieldProps) {
  const { label, ref, ...inputProps } = props;

  return (
    <label>
      <span>{label}</span>
      <input ref={ref} {...inputProps} />
    </label>
  );
}

console.log(TextField);
```

### `refNullability.tsx`

```tsx
// Goal:
// Keep ref nullability explicit.

// Expected result:
// The code checks current before using it.

import { useRef } from "react";

export {};

function FocusButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleClick(): void {
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button type="button" onClick={handleClick}>
        Focus
      </button>
    </>
  );
}

console.log(FocusButton);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| ref 一定非空 | ref 在初始渲染和卸载时可能是 null。 |
| 所有组件都暴露 ref | 只有低层可复用组件才常见。 |
| ref 用来替代 props | 能用 props 表达的状态，不要用 imperative ref。 |

---

### 补充：callback ref 也是 ref 边界

object ref 保存到 `.current`；callback ref 是 React 在节点 attach / detach 时调用的函数。React DOM 文档还说明，React 19 支持 callback ref 返回 cleanup function。无论是哪种 ref，都要把“节点可能不存在”作为正常状态处理。

### `callbackRefBoundary.tsx`

```tsx
// Goal:
// Type a callback ref boundary.

// Expected result:
// The callback receives the DOM node when attached.

import type { RefCallback } from "react";

export {};

function MeasuredPanel() {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (node === null) {
      return;
    }

    console.log(node.dataset.panelId ?? "missing-panel-id");

    return () => {
      console.log("panel-detached");
    };
  };

  return <div ref={handleRef} data-panel-id="product-panel">Product panel</div>;
}

console.log(MeasuredPanel);
```

### ref 边界补充模型

```txt
Object ref:
  React writes node into ref.current.
  Your code reads ref.current later.

Callback ref:
  React calls your function with the node.
  React calls cleanup or passes null when detached.

Shared rule:
  DOM access is imperative.
  It should be kept small and isolated.
```


## 9. 05：useImperativeHandle 和受限 imperative API

### 结论

`useImperativeHandle` 让组件暴露一个受限对象，而不是暴露整个 DOM 节点。

### 技术意义

低层组件有时必须提供 `focus()`、`clear()` 这种命令式能力。直接暴露 DOM 节点会让父组件可以随意修改样式、value、selection 等内部细节；imperative handle 的价值是只暴露你允许的最小方法集合。

### 底层机制

```txt
internal DOM ref:
  inputRef.current -> real input element

public ref handle:
  parentRef.current -> { focus, clear }

useImperativeHandle:
  maps internal implementation to public imperative API
```

### `inputHandle.tsx`

```tsx
// Goal:
// Expose a restricted imperative handle.

// Expected result:
// Parent code only sees the methods in InputHandle.

import { forwardRef, useImperativeHandle, useRef } from "react";

export {};

type InputHandle = {
  focus(): void;
  clear(): void;
};

type SearchBoxProps = {
  defaultValue?: string;
};

const SearchBox = forwardRef<InputHandle, SearchBoxProps>(function SearchBox(
  props,
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    clear() {
      if (inputRef.current !== null) {
        inputRef.current.value = "";
      }
    },
  }), []);

  return <input ref={inputRef} defaultValue={props.defaultValue} />;
});

console.log(SearchBox);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| imperative handle 暴露整个 DOM | 暴露最小能力集合。 |
| modal open/close 用 ref API | open state 更适合 props。 |
| 忘记 ref 可能为 null | imperative 方法内部也要处理 null。 |

---

## 10. 06：泛型组件

### 结论

泛型组件用于表达“输入数据类型”和“回调参数类型”之间的对应关系。

### 技术意义

泛型组件不是为了显得高级，而是为了让 `items`、`value`、`getKey`、`renderItem`、`onChange` 使用同一个类型参数。这样调用方传入 `ProductRecord[]` 时，回调参数自动变成 `ProductRecord`，不会退化为 `unknown` 或 `any`。

### 底层机制

```txt
<List items={ProductRecord[]} ...>
  -> TypeScript infers ItemType = ProductRecord
  -> getKey receives ProductRecord
  -> renderItem receives ProductRecord
```

### `genericList.tsx`

```tsx
// Goal:
// Build a generic list with a render prop.

// Expected result:
// renderItem receives each item with the correct type.

import type { ReactElement } from "react";

export {};

type ListProps<ItemType> = {
  items: ItemType[];
  getKey(item: ItemType): string;
  renderItem(item: ItemType): ReactElement;
};

function List<ItemType>(props: ListProps<ItemType>) {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={props.getKey(item)}>{props.renderItem(item)}</li>
      ))}
    </ul>
  );
}

const list = (
  <List
    items={[{ id: "p1", title: "Keyboard" }]}
    getKey={(product) => product.id}
    renderItem={(product) => <span>{product.title}</span>}
  />
);

console.log(list);
```

### `genericSelect.tsx`

```tsx
// Goal:
// Connect option values and selection callback with a generic type.

// Expected result:
// onChange receives the exact option value type.

export {};

type SelectOption<ValueType extends string> = {
  label: string;
  value: ValueType;
};

type SelectFieldProps<ValueType extends string> = {
  value: ValueType;
  options: SelectOption<ValueType>[];
  onChange(value: ValueType): void;
};

function SelectField<ValueType extends string>(props: SelectFieldProps<ValueType>) {
  return (
    <select
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value as ValueType)}
    >
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

const element = (
  <SelectField
    value="draft"
    options={[
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
    ]}
    onChange={(value) => {
      console.log(value);
    }}
  />
);

console.log(element);
```


### 本节纠偏：泛型组件的执行过程应该看类型参数关系

下面原来的执行过程内容对应的是 compound component，不对应本节的泛型组件。这里补上泛型组件真正该观察的机制：

| 步骤 | 发生什么 |
|---|---|
| 1 | 调用 `<List items={[{ id, title }]} />` 时，TypeScript 从 `items` 推断 `ItemType`。 |
| 2 | `getKey(item)` 的 `item` 使用同一个 `ItemType`。 |
| 3 | `renderItem(item)` 的 `item` 也使用同一个 `ItemType`。 |
| 4 | 调用 `<SelectField value="draft" options={...} />` 时，TypeScript 从 `value` 和 `options` 推断 `ValueType`。 |
| 5 | `onChange(value)` 里的 `value` 保持同一个字面量 union。 |
| 6 | DOM `<select>` 的 `event.currentTarget.value` 运行时永远是 string，所以示例里的 `as ValueType` 是 DOM 边界断言，不是运行时验证。 |

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `TabsContext` 用 `TabsContextValue | null` 表达 provider 外部没有上下文。 |
| 2 | `useTabsContext()` 在运行时检查 `null`，并把返回类型收窄为 `TabsContextValue`。 |
| 3 | `TabsRoot` 持有选中状态，把状态和 setter 放进 context。 |
| 4 | `TabsTrigger` 读取 context 并通过回调更新选中值。 |
| 5 | `TabsPanel` 根据 context 决定是否返回内容。 |
| 6 | `CardComponent` 用交叉类型描述 root 函数和静态子组件。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 泛型组件只是为了少写 union | 泛型表达输入和输出的关系。 |
| 在组件内部随便 `as ValueType` | DOM string 边界需要明确解析或限制泛型。 |
| 泛型越多越好 | 只有存在真实类型关系时才使用泛型。 |

---

## 11. 07：多态组件 as prop

### 结论

多态组件允许调用方通过 `as` prop 改变底层元素，同时保留对应元素的 props 类型。它适合设计系统低层组件，不适合所有业务组件。

### `polymorphicBox.tsx`

```tsx
// Goal:
// Build a small polymorphic Box component.

// Expected result:
// Props change based on the as prop.

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export {};

type BoxOwnProps<Element extends ElementType> = {
  as?: Element;
  children?: ReactNode;
};

type BoxProps<Element extends ElementType> =
  BoxOwnProps<Element> &
  Omit<ComponentPropsWithoutRef<Element>, keyof BoxOwnProps<Element>>;

function Box<Element extends ElementType = "div">(props: BoxProps<Element>) {
  const { as, children, ...restProps } = props;
  const Component = as ?? "div";

  return <Component {...restProps}>{children}</Component>;
}

const divBox = <Box id="main">Content</Box>;
const anchorBox = <Box as="a" href="/products">Products</Box>;

// @ts-expect-error: href is not a valid prop for a button.
const invalidBox = <Box as="button" href="/products">Products</Box>;

console.log(divBox, anchorBox, invalidBox);
```

### `polymorphicButtonLink.tsx`

```tsx
// Goal:
// Use discriminated union instead of polymorphism for a limited API.

// Expected result:
// Link and button modes have different required props.

export {};

type ActionProps =
  | {
      mode: "button";
      onPress(): void;
      children: string;
    }
  | {
      mode: "link";
      href: string;
      children: string;
    };

function Action(props: ActionProps) {
  if (props.mode === "button") {
    return <button type="button" onClick={props.onPress}>{props.children}</button>;
  }

  return <a href={props.href}>{props.children}</a>;
}

const button = <Action mode="button" onPress={() => console.log("press")}>Save</Action>;
const link = <Action mode="link" href="/products">Products</Action>;

console.log(button, link);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有组件都做 polymorphic | 只给低层基础组件做。 |
| `as` prop 用 `any` | 要用 `ElementType` 和 `ComponentPropsWithoutRef` 连接。 |
| 多态组件 API 过度复杂 | 有限模式用 discriminated union 更清楚。 |

---

## 12. 08：复合组件 compound component

### 结论

复合组件把多个子组件组织成一个高层 API。类型难点不是 JSX 本身，而是共享上下文、静态属性挂载和子组件 API 边界。

### 技术意义

复合组件适合把多个相关 UI parts 绑定成一个 API，例如 `Tabs.Root`、`Tabs.List`、`Tabs.Trigger`、`Tabs.Panel`。TypeScript 可以检查每个 part 的 props，但不能可靠保证 JSX children 的具体顺序或具体子元素类型。

### 底层机制

```txt
Compound component:
  Root component owns context
  Part components read context
  Static properties attach parts to root function object

TypeScript checks:
  each part props
  static property names
  context value shape

TypeScript cannot fully check:
  exact JSX children order
  exact child component identity
```

### `tabsModel.tsx`

```tsx
// Goal:
// Model compound tabs with typed context and child components.

// Expected result:
// Each compound part has its own typed props.

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export {};

type TabsContextValue = {
  selectedValue: string;
  setSelectedValue(value: string): void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const contextValue = useContext(TabsContext);

  if (contextValue === null) {
    throw new Error("Tabs parts must be used inside TabsRoot");
  }

  return contextValue;
}

type TabsRootProps = {
  defaultValue: string;
  children: ReactNode;
};

function TabsRoot(props: TabsRootProps) {
  const [selectedValue, setSelectedValue] = useState(props.defaultValue);

  return (
    <TabsContext.Provider value={{ selectedValue, setSelectedValue }}>
      {props.children}
    </TabsContext.Provider>
  );
}

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
};

function TabsTrigger(props: TabsTriggerProps) {
  const tabs = useTabsContext();
  const isSelected = tabs.selectedValue === props.value;

  return (
    <button
      type="button"
      aria-selected={isSelected}
      onClick={() => tabs.setSelectedValue(props.value)}
    >
      {props.children}
    </button>
  );
}

type TabsPanelProps = {
  value: string;
  children: ReactNode;
};

function TabsPanel(props: TabsPanelProps) {
  const tabs = useTabsContext();

  if (tabs.selectedValue !== props.value) {
    return null;
  }

  return <div>{props.children}</div>;
}

const tabs = (
  <TabsRoot defaultValue="details">
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="shipping">Shipping</TabsTrigger>
    <TabsPanel value="details">Product details</TabsPanel>
    <TabsPanel value="shipping">Shipping information</TabsPanel>
  </TabsRoot>
);

console.log(tabs);
```

### `staticPropertyTyping.tsx`

```tsx
// Goal:
// Attach compound parts as static properties.

// Expected result:
// The compound object has callable root and typed static parts.

import type { ReactNode } from "react";

export {};

type RootProps = {
  children: ReactNode;
};

function Root(props: RootProps) {
  return <section>{props.children}</section>;
}

function Header(props: { children: ReactNode }) {
  return <header>{props.children}</header>;
}

function Body(props: { children: ReactNode }) {
  return <div>{props.children}</div>;
}

type CardComponent = typeof Root & {
  Header: typeof Header;
  Body: typeof Body;
};

const Card = Root as CardComponent;
Card.Header = Header;
Card.Body = Body;

const element = (
  <Card>
    <Card.Header>Title</Card.Header>
    <Card.Body>Content</Card.Body>
  </Card>
);

console.log(element);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| compound component 一定能限制子组件顺序 | React 类型系统很难完全限制 JSX 子元素顺序。 |
| Context 默认值写假对象 | 没真实默认值就用 null 并封装 hook。 |
| 静态属性挂载不写类型 | 用交叉类型描述 root 函数和静态 parts。 |

---

## 13. 09：组件 API 设计小项目

### 结论

小项目目标是做一个最小设计系统组件集：`Button`、`TextField`、`SelectField`、`Card`。重点是类型边界，不是样式。

### 必做文件

```txt
09-mini-project/
  uiTypes.ts
  Button.tsx
  TextField.tsx
  SelectField.tsx
  Card.tsx
  Demo.tsx
```

### `uiTypes.ts`

```ts
// Goal:
// Share design-system primitive types.

export type FieldSize = "sm" | "md" | "lg";

export type FieldStatus =
  | { state: "default" }
  | { state: "error"; message: string }
  | { state: "success"; message: string };

export type Option<ValueType extends string> = {
  label: string;
  value: ValueType;
};
```

### `Button.tsx`

```tsx
// Goal:
// Build a typed design-system button.

import type { ComponentPropsWithoutRef } from "react";

export type Tone = "neutral" | "primary" | "danger";

export type ButtonProps = {
  tone?: Tone;
} & Omit<ComponentPropsWithoutRef<"button">, "className">;

export function Button(props: ButtonProps) {
  const { tone = "neutral", ...buttonProps } = props;

  return <button data-tone={tone} {...buttonProps} />;
}
```

### `TextField.tsx`

```tsx
// Goal:
// Build a controlled typed text field.

import type { ChangeEventHandler, ComponentPropsWithoutRef, ReactNode } from "react";

export type TextFieldProps =
  Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange" | "className"> & {
    label: ReactNode;
    value: string;
    onValueChange(value: string): void;
    errorMessage?: string;
  };

export function TextField(props: TextFieldProps) {
  const { label, errorMessage, value, onValueChange, ...inputProps } = props;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onValueChange(event.currentTarget.value);
  };

  return (
    <label>
      <span>{label}</span>
      <input {...inputProps} value={value} onChange={handleChange} />
      {errorMessage === undefined ? null : <span>{errorMessage}</span>}
    </label>
  );
}
```

### `SelectField.tsx`

```tsx
// Goal:
// Build a generic controlled select field.

import type { ChangeEventHandler, ReactNode } from "react";
import type { FieldSize, Option } from "./uiTypes";

export type SelectFieldProps<ValueType extends string> = {
  label: ReactNode;
  size?: FieldSize;
  value: ValueType;
  options: readonly Option<ValueType>[];
  onValueChange(value: ValueType): void;
};

export function SelectField<ValueType extends string>(props: SelectFieldProps<ValueType>) {
  const { label, size = "md", value, options, onValueChange } = props;

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    onValueChange(event.currentTarget.value as ValueType);
  };

  return (
    <label data-size={size}>
      <span>{label}</span>
      <select value={value} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
```

### `Card.tsx`

```tsx
// Goal:
// Build a small compound Card component.

import type { ReactNode } from "react";

export type CardRootProps = {
  children: ReactNode;
};

function CardRoot(props: CardRootProps) {
  return <article>{props.children}</article>;
}

function CardHeader(props: { children: ReactNode }) {
  return <header>{props.children}</header>;
}

function CardBody(props: { children: ReactNode }) {
  return <div>{props.children}</div>;
}

type CardComponent = typeof CardRoot & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
};

export const Card = CardRoot as CardComponent;
Card.Header = CardHeader;
Card.Body = CardBody;
```

### `Demo.tsx`

```tsx
// Goal:
// Verify the mini design-system components together.

import { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { SelectField } from "./SelectField";
import { TextField } from "./TextField";

export function Demo() {
  const [title, setTitle] = useState("Keyboard");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  return (
    <Card>
      <Card.Header>Product editor</Card.Header>
      <Card.Body>
        <TextField label="Title" value={title} onValueChange={setTitle} />
        <SelectField<"draft" | "published">
          label="Status"
          value={status}
          options={[
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ] as const}
          onValueChange={setStatus}
        />
        <Button tone="primary" type="button" onClick={() => console.log(title)}>
          Save
        </Button>
      </Card.Body>
    </Card>
  );
}
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `uiTypes.ts` 抽出设计系统共享类型，避免组件间复制 union。 |
| 2 | `Button.tsx` 继承原生 button props，同时移除 `className`。 |
| 3 | `TextField.tsx` 把 DOM `onChange` 转换成业务层 `onValueChange(value)`。 |
| 4 | `SelectField.tsx` 用泛型连接 `value`、`options` 和 `onValueChange`。 |
| 5 | `Card.tsx` 用静态属性表达 compound component API。 |
| 6 | `Demo.tsx` 把所有组件组合起来，验证调用方的 TSX 类型体验。 |

### 底层机制

```txt
Design-system TSX API:
  wrapper components inherit DOM props
  business props stay explicit
  callbacks expose domain values
  generic components preserve value relations
  compound components expose named parts
```

### 小项目检查

```bash
npx tsc --noEmit
```

---


## 14. 10：Next.js App Router TSX 边界

### 结论

Next.js App Router 里的 TSX 还要多看一层：这个组件运行在 server boundary 还是 client boundary。`'use client'` 不是普通字符串装饰，它定义 client component 入口；从 Server Component 传给 Client Component 的 props 必须适合跨边界序列化。

### 技术意义

React 普通组件类型检查只回答“props 形状是否匹配”。Next.js 的 App Router 还需要回答：

```txt
Does this file need browser interactivity?
Can this component use useState, useEffect, or event handlers?
Are props crossing from server to client serializable?
Is this value a runtime function, class instance, Date, Map, or plain data?
```

TypeScript 能帮你定义 serializable DTO 类型，但不能自动证明所有 runtime value 都能安全跨 server-client boundary。复杂对象仍然应该在 server side 转成 plain data transfer object。

### 文件结构

```txt
10-nextjs-boundary/
  clientCounter.tsx
  serializableClientProps.tsx
```

### `clientCounter.tsx`

```tsx
"use client";

// Goal:
// Mark an interactive component as a Client Component boundary.

// Expected result:
// The component can use useState and event handlers.

import { useState } from "react";

export function ClientCounter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}
```

### `serializableClientProps.tsx`

```tsx
"use client";

// Goal:
// Restrict Client Component props to serializable values.

// Expected result:
// Functions are rejected by the local SerializableValue boundary.

export {};

type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

type ClientPayloadViewProps = {
  payload: SerializableValue;
};

function ClientPayloadView(props: ClientPayloadViewProps) {
  return <pre>{JSON.stringify(props.payload)}</pre>;
}

const valid = (
  <ClientPayloadView
    payload={{
      id: "p1",
      title: "Keyboard",
      priceCents: 9900,
      tags: ["featured", "sale"],
    }}
  />
);

// @ts-expect-error: Functions are not serializable payload values.
const invalid = <ClientPayloadView payload={() => "not-serializable"} />;

console.log(valid, invalid);
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 没有 `'use client'` 的 App Router 组件默认按 Server Component 模型思考。 |
| 2 | 需要 state、effects、browser event handlers 的入口文件写 `'use client'`。 |
| 3 | Server Component 可以把 plain data 作为 props 传给 Client Component。 |
| 4 | 函数、类实例、复杂运行时对象不应该直接作为普通 client props 跨边界传递。 |
| 5 | TypeScript 可以定义 `SerializableValue` 这种静态约束，但真正的数据仍然来自运行时。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有组件都加 `'use client'` | 只在需要 client interactivity 的入口加。 |
| Client Component props 可以随便传函数 | 普通 props 跨 server-client boundary 时要考虑 serializability。 |
| TypeScript 能自动验证 Next.js server-client runtime 边界 | TS 只能检查你建模出来的类型，不能替代框架运行时规则。 |


## 15. 最终学习笔记转换要求

每节笔记按这个结构整理：

```txt
Conclusion:
State the component typing rule.

Technical meaning:
Explain what TypeScript checks.

Runtime mechanism:
Explain what React actually does.

Code proof:
Keep one minimal example.

Common mistake:
Write one mistake and correction.

Project relation:
Explain how this appears in Vite, Next.js, or a design system.
```

必须包含这些对比：

```txt
ReactNode vs ReactElement vs JSX.Element
DOM props vs custom props
ComponentProps vs ComponentPropsWithoutRef vs ComponentPropsWithRef
event object vs domain value
controlled input vs uncontrolled input
ref prop vs normal prop
forwardRef vs ref as prop
imperative handle vs declarative props
generic component vs union props
polymorphic component vs discriminated union component
compound component vs prop-heavy component
ComponentType vs ElementType
object ref vs callback ref
React Client Component props vs Server Component data
```

---

## 16. 最终要能回答的问题

1. `.tsx` 和 `.ts` 在解析规则上有什么区别？
2. 为什么 `.tsx` 里要用 `as` 断言？
3. `ReactNode`、`ReactElement`、`JSX.Element` 的边界分别是什么？
4. 为什么 children 常用 `ReactNode`？
5. `ComponentProps<"button">` 提取的是什么？
6. `ComponentPropsWithoutRef` 和 `ComponentPropsWithRef` 的差别是什么？
7. 包装 DOM 元素时为什么不应该手写所有 DOM props？
8. 抽离 event handler 后为什么经常要显式写事件类型？
9. 为什么表单组件要把 DOM event 转成业务值？
10. ref 为什么可能为 null？
11. React 18 的 `forwardRef` 和 React 19 的 ref as prop 有什么关系？
12. `useImperativeHandle` 解决什么问题？
13. 泛型组件什么时候值得写？
14. polymorphic `as` prop 的核心类型关系是什么？
15. 什么情况下 discriminated union 比 polymorphic component 更好？
16. compound component 能不能完全限制子组件顺序？
17. 设计系统组件怎样控制公共 API？
18. TSX 类型检查和 React 运行时渲染的关系是什么？
19. 这些能力如何支撑 Next.js 简历项目组件库？
20. `ComponentProps<typeof X>` 和 `ComponentProps<"button">` 分别从哪里提取 props？
21. `ComponentType<Props>` 和 `ElementType` 的边界是什么？
22. callback ref 和 object ref 的运行时行为有什么区别？
23. Next.js App Router 里 `'use client'` 定义什么边界？
24. 为什么传给 Client Component 的 props 要考虑 serializable data？

---

## 17. 最终记忆模型

```txt
TSX deep dive is component API modeling.

Renderable boundary:
  ReactNode
  ReactElement
  JSX.Element

DOM boundary:
  intrinsic elements
  DOM props
  event objects
  refs

Component boundary:
  custom props
  children
  callback props
  controlled values

Reusable component boundary:
  ComponentProps
  forwardRef
  ref as prop
  imperative handle

Advanced API boundary:
  generic components
  polymorphic as prop
  compound components

Next.js boundary:
  Server Component by default
  Client Component entry
  serializable props
  plain DTOs across boundaries
```

### 最终一句话

真正的 TSX 进阶，不是背 React 类型名，而是能把组件当成公共 API 来设计：调用者传什么、组件隐藏什么、DOM 透传什么、事件转换什么、ref 暴露什么、泛型连接什么。

---

## 18. 最终文件清单

```txt
typescript/
  tsx-deep-dive/
    README.md
    package.json
    tsconfig.json
    00-tsx-problem-model/
      componentApiBoundary.tsx
      tsxParsingAndRuntime.tsx
      tsxAssertionSyntax.tsx
      jsxRuntimeOutputBoundary.tsx
    01-renderable-types/
      reactNodeVsReactElement.tsx
      childrenContract.tsx
    02-component-dom-props/
      intrinsicProps.tsx
      buttonPropsComposition.tsx
      styleProps.tsx
      jsxIntrinsicAttributeChecking.tsx
      componentPropsFromCustomComponent.tsx
      componentAsProp.tsx
    03-events-forms/
      extractedEventHandler.tsx
      controlledInput.tsx
      uncontrolledInput.tsx
    04-refs/
      react18ForwardRef.tsx
      react19RefProp.tsx
      refNullability.tsx
      callbackRefBoundary.tsx
    05-imperative-handle/
      inputHandle.tsx
    06-generic-components/
      genericSelect.tsx
      genericList.tsx
    07-polymorphic-as-prop/
      polymorphicBox.tsx
      polymorphicButtonLink.tsx
    08-compound-components/
      tabsModel.tsx
      staticPropertyTyping.tsx
    09-mini-project/
      uiTypes.ts
      Button.tsx
      TextField.tsx
      SelectField.tsx
      Card.tsx
      Demo.tsx
    10-nextjs-boundary/
      clientCounter.tsx
      serializableClientProps.tsx
```


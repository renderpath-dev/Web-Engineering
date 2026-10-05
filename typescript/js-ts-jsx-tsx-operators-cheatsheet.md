# JS, TS, JSX, and TSX Operator Cheatsheet

> Scope: this cheatsheet covers JavaScript runtime operators, TypeScript type-level operators, TypeScript-only operator-like syntax, JSX syntax, and TSX-specific parsing rules.
>
> Core rule: the same token can mean different things depending on its syntactic position. Always ask: is this token in value code, type code, JSX markup, or TSX mixed syntax?

---

## 0. The one rule that prevents most confusion

```txt
Value position:
  Code that becomes JavaScript and runs.

Type position:
  Code used by the TypeScript checker.
  It is erased or only affects checking.

JSX position:
  Markup-like syntax that is transformed into function calls or preserved for another transform.

TSX position:
  TypeScript plus JSX.
  Some TypeScript syntax is restricted because it conflicts with JSX parsing.
```

Example:

```ts
const product = { id: "p1", price: 99 };

console.log(typeof product);

type Product = typeof product;
```

```txt
typeof product in console.log(...):
  JavaScript runtime typeof
  produces the string "object"

typeof product in type Product = ...:
  TypeScript type query
  produces a static type
  emits no runtime code
```

---

## 1. Quick classification

| Family | Runs at runtime | Exists in `.js` | Exists in `.ts` | Exists in `.jsx` | Exists in `.tsx` | Example |
|---|---:|---:|---:|---:|---:|---|
| JavaScript runtime operators | Yes | Yes | Yes | Yes, inside JS expressions | Yes, inside TS/JS expressions | `+`, `&&`, `?.`, `new`, `typeof value` |
| TypeScript type operators | No | No | Yes | No | Yes, in type positions | `keyof`, `T[K]`, `T extends U ? X : Y` |
| TypeScript checking operators | Usually no runtime effect | No or normal JS expression remains | Yes | No | Yes | `as`, `!`, `satisfies` |
| JSX syntax | Transformed or preserved | No, unless already transformed | No | Yes | Yes | `<Button disabled />`, `{value}`, `{...props}` |
| TSX disambiguation rules | Parser/type checker only | No | No | No | Yes | `<T,>(value: T) => value` |

---

## 2. JavaScript runtime operators and expression operators

These work in JavaScript and in TypeScript value code. In `.jsx` and `.tsx`, they work inside JavaScript expression positions such as `{...}`.

### 2.1 Grouping, member access, calls, construction

| Operator / syntax | Name | Meaning | Example | Result / note |
|---|---|---|---|---|
| `(expr)` | Grouping | Overrides default precedence. | `(a + b) * c` | Evaluates `a + b` first. |
| `obj.prop` | Property access | Reads property key `"prop"` from object. | `user.id` | Returns the property value. |
| `obj["prop"]` | Computed property access | Reads property key computed by expression. | `user[key]` | `key` is evaluated first. |
| `obj?.prop` | Optional property access | Reads property only if left side is not `null` or `undefined`. | `user?.id` | Returns `undefined` if `user` is nullish. |
| `obj?.[expr]` | Optional computed access | Optional version of bracket access. | `map?.[key]` | Avoids nullish access error. |
| `fn(args)` | Function call | Calls `fn` with arguments. | `sum(1, 2)` | Argument values are passed by position. |
| `obj.method(args)` | Method call | Calls method; `this` is usually `obj`. | `user.readId()` | Call site controls `this`. |
| `fn?.(args)` | Optional call | Calls only if callable value is not nullish. | `callback?.()` | Returns `undefined` if callback is nullish. |
| `new Ctor(args)` | Construction | Creates an instance and runs constructor. | `new User("u1")` | `this` in constructor refers to the new object. |
| `new Ctor` | Construction without argument list | Same construction with no arguments. | `new Date` | Prefer `new Date()` for clarity. |
| `new.target` | Constructor meta-property | Tells whether a function/class was called with `new`. | `new.target` | Only valid inside functions/classes. |
| `super(args)` | Parent constructor call | In a derived constructor, runs the parent constructor with argument values. | `super(id)` | Directly calls parent constructor; parent code decides initialization. |
| `super.prop` | Parent property/method lookup | Looks up a property on the parent prototype or parent constructor context. | `super.render()` | Used inside derived class methods. |
| `super[expr]` | Computed super access | Same as `super.prop`, but key is computed. | `super[key]()` | Key expression is evaluated. |
| `import(specifier)` | Dynamic import | Loads a module asynchronously. | `await import("./mod.js")` | Returns a promise-like module namespace object. |
| `import.meta` | Module meta-property | Provides host-defined module metadata. | `import.meta.url` | Available in modules. |

### 2.2 Unary and update operators

| Operator | Name | Meaning | Example | Note |
|---|---|---|---|---|
| `+x` | Unary plus | Converts operand to number. | `+"42"` | Produces `42`. |
| `-x` | Unary negation | Converts to number, then negates. | `-"42"` | Produces `-42`. |
| `!x` | Logical NOT | Converts to boolean and negates. | `!isReady` | Runtime boolean operation. |
| `~x` | Bitwise NOT | Converts to 32-bit integer and flips bits. | `~0` | Produces `-1`. |
| `typeof x` | Runtime typeof | Returns a string describing runtime type category. | `typeof value` | Example: `"string"`, `"object"`, `"function"`. |
| `void expr` | Void | Evaluates expression and returns `undefined`. | `void doWork()` | Often used to discard a promise intentionally. |
| `delete obj.key` | Delete property | Removes an own configurable property. | `delete user.temp` | Returns a boolean. |
| `await expr` | Await | Pauses an async function until promise settles. | `await fetch(url)` | Runtime async control flow. |
| `++x` | Prefix increment | Adds 1, returns updated value. | `++count` | Operand must be assignable. |
| `x++` | Postfix increment | Adds 1, returns old value. | `count++` | Operand must be assignable. |
| `--x` | Prefix decrement | Subtracts 1, returns updated value. | `--count` | Operand must be assignable. |
| `x--` | Postfix decrement | Subtracts 1, returns old value. | `count--` | Operand must be assignable. |

### 2.3 Arithmetic, string, and exponentiation operators

| Operator | Name | Meaning | Example | Note |
|---|---|---|---|---|
| `+` | Addition or concatenation | Numeric addition or string concatenation. | `1 + 2`, `"a" + 1` | If string coercion occurs, concatenates. |
| `-` | Subtraction | Numeric subtraction. | `5 - 2` | Converts operands to numbers. |
| `*` | Multiplication | Numeric multiplication. | `3 * 4` | Converts operands to numbers. |
| `/` | Division | Numeric division. | `10 / 2` | Produces `Infinity` for `1 / 0`. |
| `%` | Remainder | Remainder after division. | `10 % 3` | Remainder, not mathematical modulo for negatives. |
| `**` | Exponentiation | Raises left operand to power of right. | `2 ** 3` | Right-associative. |

### 2.4 Relational and equality operators

| Operator | Name | Meaning | Example | Note |
|---|---|---|---|---|
| `<` | Less than | Relational comparison. | `a < b` | Strings compare lexicographically. |
| `<=` | Less than or equal | Relational comparison. | `a <= b` | Runtime comparison. |
| `>` | Greater than | Relational comparison. | `a > b` | Runtime comparison. |
| `>=` | Greater than or equal | Relational comparison. | `a >= b` | Runtime comparison. |
| `in` | Property existence | Checks whether property key exists in object or prototype chain. | `"id" in user` | Also used by TS for narrowing. |
| `instanceof` | Prototype-chain test | Checks whether constructor prototype appears in object chain. | `value instanceof Date` | Also used by TS for narrowing. |
| `==` | Loose equality | Equality with coercion. | `value == null` | Often avoided except deliberate nullish check. |
| `!=` | Loose inequality | Inequality with coercion. | `value != null` | Same coercion concerns as `==`. |
| `===` | Strict equality | Equality without most coercion. | `value === 1` | Preferred for exact comparison. |
| `!==` | Strict inequality | Inequality without most coercion. | `value !== 1` | Preferred for exact comparison. |

### 2.5 Bitwise and shift operators

| Operator | Name | Meaning | Example | Note |
|---|---|---|---|---|
| `&` | Bitwise AND | Bitwise conjunction. | `a & b` | Runtime number/bigint bit operation. |
| `|` | Bitwise OR | Bitwise disjunction. | `a | b` | Different from TS union types. |
| `^` | Bitwise XOR | Bitwise exclusive OR. | `a ^ b` | Runtime bit operation. |
| `<<` | Left shift | Shifts bits left. | `x << 1` | 32-bit integer operation for numbers. |
| `>>` | Signed right shift | Shifts bits right preserving sign. | `x >> 1` | 32-bit integer operation for numbers. |
| `>>>` | Unsigned right shift | Shifts right filling zeros. | `x >>> 1` | Not valid for bigint. |

### 2.6 Logical and conditional operators

| Operator | Name | Meaning | Example | Note |
|---|---|---|---|---|
| `&&` | Logical AND | Returns first falsy operand, or last operand. | `user && user.id` | Short-circuits. |
| `||` | Logical OR | Returns first truthy operand, or last operand. | `name || "guest"` | Short-circuits. |
| `??` | Nullish coalescing | Returns right operand only for `null` or `undefined`. | `name ?? "guest"` | Does not treat `""` or `0` as missing. |
| `cond ? a : b` | Conditional ternary | Chooses one of two expressions. | `ok ? "yes" : "no"` | The only JavaScript ternary operator. |

### 2.7 Assignment operators

| Operator | Name | Equivalent idea | Example |
|---|---|---|---|
| `=` | Assignment | Store right value into left target. | `x = value` |
| `+=` | Addition assignment | `x = x + value` | `x += 1` |
| `-=` | Subtraction assignment | `x = x - value` | `x -= 1` |
| `*=` | Multiplication assignment | `x = x * value` | `x *= 2` |
| `/=` | Division assignment | `x = x / value` | `x /= 2` |
| `%=` | Remainder assignment | `x = x % value` | `x %= 2` |
| `**=` | Exponentiation assignment | `x = x ** value` | `x **= 2` |
| `<<=` | Left shift assignment | `x = x << value` | `x <<= 1` |
| `>>=` | Signed right shift assignment | `x = x >> value` | `x >>= 1` |
| `>>>=` | Unsigned right shift assignment | `x = x >>> value` | `x >>>= 1` |
| `&=` | Bitwise AND assignment | `x = x & value` | `x &= mask` |
| `^=` | Bitwise XOR assignment | `x = x ^ value` | `x ^= mask` |
| `|=` | Bitwise OR assignment | `x = x | value` | `x |= mask` |
| `&&=` | Logical AND assignment | Assign only if left side is truthy. | `cache &&= next` |
| `||=` | Logical OR assignment | Assign only if left side is falsy. | `name ||= "guest"` |
| `??=` | Nullish assignment | Assign only if left side is `null` or `undefined`. | `name ??= "guest"` |

### 2.8 Sequence, spread, rest, destructuring, and generators

| Syntax | Name | Meaning | Example | Note |
|---|---|---|---|---|
| `expr1, expr2` | Comma operator | Evaluates both, returns last value. | `(log(), value)` | Low precedence. |
| `...iterable` | Spread in call/array | Expands iterable elements. | `fn(...args)`, `[...items]` | Value-level syntax. |
| `...object` | Object spread | Copies enumerable own properties into new object. | `{ ...base, id: "p1" }` | Later keys override earlier keys. |
| `...rest` | Rest parameter | Collects remaining arguments into an array. | `function f(...args) {}` | Declaration syntax, not runtime operator. |
| `...rest` | Rest destructuring | Collects remaining properties/elements. | `const { id, ...rest } = obj` | Pattern syntax. |
| `yield value` | Yield | Pauses generator and emits value. | `yield item` | Only inside generator function. |
| `yield* source` | Yield delegation | Delegates to iterable/generator. | `yield* items` | Generator syntax. |

---

## 3. TypeScript operators and operator-like syntax

TypeScript reuses every JavaScript runtime operator in value code. It also adds operators for type computation, checking, and syntax annotation.

### 3.1 TypeScript value-level checking operators

| Operator / syntax | TS meaning | Runtime effect | Example | Common mistake |
|---|---|---|---|---|
| `value as Type` | Type assertion | Removed from emitted JavaScript. | `node as HTMLElement` | It does not convert the value. |
| `value as Record<K, V>` | Type assertion whose target type is `Record<K, V>` | Removed from emitted JavaScript. | `raw as Record<string, unknown>` | `Record` is the target type, not another operator. |
| `<Type>value` | Angle-bracket type assertion | Removed from emitted JavaScript. | `<HTMLCanvasElement>node` | Not allowed in `.tsx`. |
| `expr!` | Non-null assertion | Removed from emitted JavaScript. | `node!.textContent` | It does not check at runtime. |
| `field!: Type` | Definite assignment assertion | Checker escape hatch. | `id!: string` | It does not initialize the field. |
| `expr satisfies Type` | Compatibility check preserving inferred type | Removed as a type-only check; expression remains. | `config satisfies Config` | It is not a runtime validator. |
| `as const` | Const assertion | Removed; affects literal inference and readonly-ness. | `{ mode: "dark" } as const` | It does not freeze the object at runtime. |

### 3.2 Type annotations and declaration punctuation

These are not JavaScript runtime operators, but they are essential TypeScript syntax.

| Syntax | Meaning | Example | Runtime effect |
|---|---|---|---|
| `name: Type` | Type annotation | `let id: string` | Erased. |
| `param?: Type` | Optional parameter | `function f(id?: string) {}` | Parameter may be `undefined`; syntax erased. |
| `prop?: Type` | Optional property | `{ avatarUrl?: string }` | Type-level optionality only. |
| `prop: Type = value` | Typed initialized binding | `let count: number = 0` | Type erased; initializer remains. |
| `readonly prop: Type` | Readonly property in TS type/class context | `readonly id: string` | Type-level restriction, except class field emit depends on field syntax. |
| `public`, `protected`, `private` | TypeScript member visibility | `private token: string` | TS `private` is type-level, not hard runtime privacy. |
| `#field` | JavaScript private field | `#token = "x"` | Runtime hard privacy. |
| `abstract` | Abstract class/member modifier | `abstract parse(): unknown` | TypeScript checking; no direct JS abstract concept. |
| `override` | Requires matching base member | `override render()` | TypeScript checking only. |
| `declare` | Ambient/type declaration | `declare const windowId: string` | Emits no runtime code for declaration. |

### 3.3 Type composition operators

| Operator / syntax | TypeScript meaning | Example | Different from JavaScript |
|---|---|---|---|
| `A | B` | Union type: value may be assignable to `A` or `B`. | `type Id = string | number` | JS `|` is bitwise OR. |
| `A & B` | Intersection type: value must satisfy both `A` and `B`. | `type Entity = HasId & HasName` | JS `&` is bitwise AND. |
| `keyof T` | Produces a union of property keys of object type `T`. | `type K = keyof Product` | No runtime key array is created. |
| `typeof value` in type position | Gets static type of a value. | `type T = typeof product` | JS `typeof` returns a runtime string. |
| `T[K]` | Indexed access type: reads property value type from `T`. | `type Id = Product["id"]` | JS `obj[key]` reads runtime property value. |
| `T[number]` | Array/tuple element type extraction. | `type Item = Items[number]` | Type-level only. |
| `T extends U` | Generic constraint or conditional type test. | `T extends { id: string }` | Not the same as class `extends`. |
| `T extends U ? X : Y` | Conditional type. | `type R<T> = T extends string ? 1 : 0` | Type-level conditional, not runtime ternary. |
| `infer X` | Extracts a type variable inside a conditional type. | `T extends Promise<infer V> ? V : T` | Type-level pattern matching only. |
| `[K in Keys]` | Mapped type iteration over key union. | `{ [K in keyof T]: T[K] }` | JS `in` checks property existence at runtime. |
| `[K in keyof T as NewKey]` | Mapped type key remapping. | `{ [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] }` | This `as` is not a type assertion. |
| `readonly [K in keyof T]` | Add readonly modifier in mapped type. | `{ readonly [K in keyof T]: T[K] }` | Type-level property modifier. |
| `-readonly [K in keyof T]` | Remove readonly modifier in mapped type. | `{ -readonly [K in keyof T]: T[K] }` | Type-level modifier operation. |
| `[K in keyof T]?` | Add optional modifier in mapped type. | `{ [K in keyof T]?: T[K] }` | Type-level property modifier. |
| `[K in keyof T]-?` | Remove optional modifier in mapped type. | `{ [K in keyof T]-?: T[K] }` | Type-level modifier operation. |
| `` `${A}${B}` `` | Template literal type | `` type Route = `/api/${string}` `` | Type-level string pattern. |
| `is` | Type predicate return type | `value is User` | Used by checker for narrowing. |
| `asserts` | Assertion function return type | `asserts value is User` | Tells checker function throws or narrows. |
| `new (...args) => T` | Construct signature type | `type Ctor = new (id: string) => User` | Type-only description of `new`. |
| `abstract new (...args) => T` | Abstract construct signature type | `abstract new () => Base` | Type-only construct signature. |
| `(...args) => R` | Function type syntax | `(id: string) => User` | Type-only unless used in arrow function value code. |
| `this` in type position | Polymorphic this type | `method(): this` | Type of current receiver. |
| `readonly T[]` | Readonly array shorthand | `readonly string[]` | Type-level read-only array view. |
| `readonly [A, B]` | Readonly tuple | `readonly [string, number]` | Type-level tuple immutability. |

### 3.4 Generic syntax and type arguments

| Syntax | Meaning | Example | Note |
|---|---|---|---|
| `<T>` in declaration | Declares a type parameter. | `function id<T>(value: T): T` | Type-level parameter. |
| `<T extends Constraint>` | Constrained type parameter. | `function f<T extends { id: string }>(x: T)` | `extends` means assignability constraint. |
| `<const T>` | Const type parameter. | `function tuple<const T extends readonly unknown[]>(x: T)` | Prefers literal-like inference. |
| `<T = Default>` | Default type parameter. | `type Box<T = string> = { value: T }` | Used when caller omits type argument. |
| `fn<Type>(value)` | Explicit type argument in call | `id<string>("x")` | Type argument is erased. |
| `Class<Type>` | Generic type reference | `Array<string>` | Type position. |
| `new Class<Type>()` | Constructor call with type argument | `new Map<string, number>()` | Type argument erased. |

---

## 4. Same token, different meaning in JS and TS

| Token | JavaScript meaning | TypeScript meaning | Example difference |
|---|---|---|---|
| `typeof` | Runtime string operator. | Type query in type position. | `typeof value` vs `type T = typeof value` |
| `in` | Runtime property existence test. | Mapped type iteration in `[K in Keys]`; also used for narrowing with JS semantics. | `"id" in obj` vs `{ [K in keyof T]: T[K] }` |
| `extends` | Class inheritance in JS class syntax. | Class/interface inheritance, generic constraint, conditional type test. | `class A extends B` vs `T extends U ? X : Y` |
| `? :` | Runtime conditional expression. | Conditional type when combined with `extends`. | `ok ? a : b` vs `T extends U ? A : B` |
| `?` | Part of optional chaining or ternary. | Optional property/parameter/tuple element marker. | `user?.id` vs `{ id?: string }` |
| `!` | Logical NOT in prefix position. | Non-null assertion or definite assignment assertion in postfix/field position. | `!ok` vs `value!` vs `field!: string` |
| `as` | Not a general JS operator. | Type assertion or mapped type key remapping. | `value as User` vs `[K in keyof T as NewKey]` |
| `|` | Bitwise OR at runtime. | Union type in type position. | `1 | 2` vs `string | number` |
| `&` | Bitwise AND at runtime. | Intersection type in type position. | `flags & mask` vs `A & B` |
| `[]` | Runtime computed property access or array literal. | Indexed access type, tuple type, array type. | `obj[key]` vs `T[K]` |
| `{}` | Runtime object literal or block. | Object type literal in type position; JSX expression hole in JSX. | `{ id: "p1" }` vs `{ id: string }` vs `<div>{id}</div>` |
| `<>` | Less-than/greater-than operators in JS expressions. | Angle-bracket type assertion in `.ts`; JSX tag/fragment in JSX/TSX. | `<T>value` vs `<div />` |
| `...` | Spread/rest syntax in JS. | Rest tuple/generic variadic tuple syntax in types. | `fn(...args)` vs `[Head, ...Tail]` |
| `:` | Label in JavaScript statement positions. | Type annotation in TypeScript. | `label: for (...)` vs `id: string` |
| `readonly` | Not a JS operator. | TS property/array/tuple/mapped type modifier. | `readonly id: string` |
| `satisfies` | No JS equivalent. | Checks expression against type without changing inferred type. | `config satisfies Config` |

---

## 5. JSX syntax cheatsheet

JSX is not a separate runtime language. It is markup-like syntax inside JavaScript. Depending on the transform mode, it becomes calls such as `React.createElement(...)`, `_jsx(...)`, or preserved JSX for another transform.

### 5.1 JSX core syntax

| JSX syntax | Meaning | Example | Note |
|---|---|---|---|
| `<div />` | Intrinsic JSX element | `<div />` | Intrinsic names are usually lowercase. |
| `<Component />` | Component JSX element | `<Button />` | Component names are usually uppercase identifiers. |
| `<div></div>` | Element with explicit closing tag | `<section>{content}</section>` | Children appear between tags. |
| `<>...</>` | Fragment shorthand | `<><A /><B /></>` | Cannot take props such as `key`. |
| `<Fragment key={id}>...</Fragment>` | Explicit fragment | `<Fragment key={id}>{item}</Fragment>` | Can take `key` in React. |
| `prop="text"` | String prop | `<img alt="Avatar" />` | Passes string literal. |
| `prop={expr}` | Expression prop | `<img src={avatarUrl} />` | Expression is JavaScript. |
| `{expr}` | Expression child | `<h1>{title}</h1>` | Expression value becomes child. |
| `{{ ... }}` | Object expression inside expression hole | `<div style={{ color: "red" }} />` | Outer braces enter JS; inner braces create object. |
| `{...props}` | Spread props | `<Button {...buttonProps} />` | Spreads object properties as props. |
| `key={value}` | React key prop | `{items.map(item => <Row key={item.id} />)}` | Used by React reconciliation; not a normal component prop in React. |
| `ref={value}` | Ref prop | `<input ref={inputRef} />` | Framework-specific typing/runtime behavior. |

### 5.2 JSX expression boundary

Inside JSX, JavaScript expressions are only entered through curly braces.

```jsx
const title = "Products";

const element = <h1>{title}</h1>;
```

```txt
<h1>...</h1>:
  JSX markup position

{title}:
  JavaScript expression position

title:
  variable lookup

expression result:
  rendered as child
```

You can put expressions in two main JSX positions:

```jsx
<h1>{title}</h1>
<img src={avatarUrl} alt="Avatar" />
```

You cannot use arbitrary statements directly inside JSX expression holes:

```jsx
<div>{if (ok) title}</div>
```

Use an expression instead:

```jsx
<div>{ok ? title : fallbackTitle}</div>
```

### 5.3 JSX spread versus JavaScript spread

```jsx
<Button {...props} />
```

This is JSX attribute spread. It spreads object properties into props.

```js
const next = { ...props, disabled: true };
```

This is JavaScript object spread. It creates a new object.

The token is the same, but the syntactic position is different.

---

## 6. TSX-specific rules

TSX is TypeScript plus JSX. Most JavaScript and TypeScript operators work, but parser ambiguity matters.

### 6.1 Angle-bracket assertions are not allowed in `.tsx`

Use `as` style assertions:

```tsx
const input = event.currentTarget as HTMLInputElement;
```

Do not use angle-bracket assertions in `.tsx`:

```tsx
const input = <HTMLInputElement>event.currentTarget;
```

Reason:

```txt
In TSX, <HTMLInputElement> can be parsed as a JSX tag.
```

### 6.2 Generic arrow functions need disambiguation in TSX

Ambiguous:

```tsx
const identity = <T>(value: T): T => value;
```

Usually write one of these:

```tsx
const identity = <T,>(value: T): T => value;
```

```tsx
const identity = <T extends unknown>(value: T): T => value;
```

The comma or constraint tells the parser this is a type parameter list, not a JSX element.

### 6.3 TypeScript operators inside JSX expression holes

You can use TypeScript value-level checking syntax inside expression holes when the expression is valid TSX:

```tsx
<Component value={rawValue as string} />
<Component config={{ mode: "dark" } as const} />
<Component ready={maybeReady ?? false} />
```

But type declarations themselves do not belong inside JSX children:

```tsx
<div>{type User = { id: string }}</div>
```

Write the type outside:

```tsx
type User = { id: string };

const element = <div>User type declared outside JSX</div>;
```

### 6.4 JSX type checking uses JSX namespace and component prop types

In TSX, `<Button disabled />` is checked through the JSX typing model. Intrinsic elements are checked through `JSX.IntrinsicElements`, and components are checked through their callable or construct signatures.

```tsx
type ButtonProps = {
  disabled?: boolean;
  label: string;
};

function Button(props: ButtonProps) {
  return <button disabled={props.disabled}>{props.label}</button>;
}

const element = <Button label="Save" disabled />;
```

### 6.5 Generic components in TSX

Generic component usage may use JSX type arguments when the component type supports them.

```tsx
type SelectProps<Value> = {
  value: Value;
  onChange(value: Value): void;
};

function Select<Value>(props: SelectProps<Value>) {
  return <div>{String(props.value)}</div>;
}

const element = (
  <Select<string>
    value="draft"
    onChange={(value) => {
      value.toUpperCase();
    }}
  />
);
```

The type argument is for TypeScript checking. It does not become runtime JSX data.

---

## 7. Operator precedence summary for JavaScript value expressions

Use parentheses whenever a mixed expression is not obvious.

High to low, simplified for daily use:

| Level | Operators / syntax |
|---:|---|
| 1 | Member access, computed access, call, optional chaining, `new` with arguments |
| 2 | Postfix `x++`, `x--` |
| 3 | Prefix unary `!`, `~`, `+`, `-`, `typeof`, `void`, `delete`, `await`, prefix `++x`, `--x` |
| 4 | Exponentiation `**` |
| 5 | Multiplicative `*`, `/`, `%` |
| 6 | Additive `+`, `-` |
| 7 | Shift `<<`, `>>`, `>>>` |
| 8 | Relational `<`, `<=`, `>`, `>=`, `in`, `instanceof` |
| 9 | Equality `==`, `!=`, `===`, `!==` |
| 10 | Bitwise AND `&` |
| 11 | Bitwise XOR `^` |
| 12 | Bitwise OR `|` |
| 13 | Logical AND `&&` |
| 14 | Logical OR `||`, nullish coalescing `??` |
| 15 | Conditional `? :` |
| 16 | Assignment `=`, `+=`, `??=`, `&&=`, `||=`, etc.; `yield` |
| 17 | Comma `,` |

Important practical points:

```txt
a + b * c
  multiplication happens before addition

(a + b) * c
  grouping changes the parse

user?.profile?.name ?? "guest"
  optional chaining reads safely
  nullish coalescing provides fallback only for null or undefined

ok ? a : b
  conditional expression returns one value
```

---

## 8. Common learner mistakes and corrections

### Mistake 1: treating TypeScript type operators as runtime operations

```ts
type Product = {
  id: string;
  title: string;
};

type ProductKey = keyof Product;
```

`ProductKey` is a type. It is not a runtime array of keys.

Runtime equivalent needs JavaScript:

```ts
const product = {
  id: "p1",
  title: "Keyboard",
};

const keys = Object.keys(product);
```

### Mistake 2: confusing `typeof` runtime operator with `typeof` type operator

```ts
const product = { id: "p1" };

console.log(typeof product);

type Product = typeof product;
```

```txt
console.log(typeof product):
  runtime expression
  produces "object"

type Product = typeof product:
  type expression
  produces static object type
```

### Mistake 3: thinking `as` converts values

```ts
const value = 123 as unknown as string;

console.log(typeof value);
```

Runtime result:

```txt
number
```

`as string` changes the checker view. It does not convert the value.

Runtime conversion must use JavaScript:

```ts
const value = String(123);
```

### Mistake 3A: treating `as Record<...>` as a separate operator

```ts
const rawValue: unknown = {
  id: "p1",
  price: 99,
};

const recordValue = rawValue as Record<string, unknown>;

console.log(recordValue.id);
```

`as Record<string, unknown>` is not a new operator. It is this composition:

```txt
as
  TypeScript type assertion syntax

Record<string, unknown>
  TypeScript utility type used as the assertion target

<string, unknown>
  type arguments passed to Record
```

The assertion tells the TypeScript checker to treat `rawValue` as an object type whose string keys have `unknown` values. It does not prove at runtime that `rawValue` is an object, and it does not convert `rawValue` into a record.

A safer version checks the runtime shape first:

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const rawValue: unknown = {
  id: "p1",
  price: 99,
};

if (isRecord(rawValue)) {
  console.log(rawValue.id);
}
```

Do not confuse the type itself with an assertion using that type:

```ts
type StringKeyedUnknownRecord = Record<string, unknown>;

const checkedRecord: StringKeyedUnknownRecord = {
  id: "p1",
};

const assertedRecord = rawValue as Record<string, unknown>;
```

`checkedRecord` is checked against the target type at the assignment site. `assertedRecord` tells the checker to trust the assertion for an existing value.

### Mistake 4: thinking `!` checks non-null at runtime

```ts
const element = document.querySelector("#missing");

element!.textContent = "Ready";
```

If `element` is actually `null`, runtime still throws. `!` only silences the checker.

### Mistake 5: confusing `|` in JS and TS

```ts
const bitResult = 1 | 2;

type Id = string | number;
```

```txt
1 | 2:
  JavaScript bitwise OR
  runtime number result

string | number:
  TypeScript union type
  compile-time type relation
```

### Mistake 6: using angle-bracket assertions in TSX

```tsx
const value = <string>rawValue;
```

Use:

```tsx
const value = rawValue as string;
```

### Mistake 7: thinking JSX curly braces create a block

```jsx
<div>{ title }</div>
```

The braces enter JavaScript expression mode. They do not create a JavaScript block statement.

### Mistake 8: thinking `super(...)` initializes fields by itself

```ts
class Parent {
  constructor(id: string) {
    console.log(id);
  }
}

class Child extends Parent {
  constructor(id: string) {
    super(id);
  }
}
```

`super(id)` calls the parent constructor and passes the value. If the parent constructor does not assign a field, no field is stored.

---

## 9. Decision table: how to read an operator

| Question | If yes | Example |
|---|---|---|
| Is this inside emitted value code? | Use JavaScript runtime meaning. | `a + b`, `typeof value` |
| Is this after `type`, `interface`, `:` type annotation, or generic brackets? | Use TypeScript type-system meaning. | `keyof T`, `T[K]` |
| Is this inside JSX tags? | Use JSX syntax meaning. | `<Button {...props} />` |
| Is this inside JSX `{...}`? | Use JS/TS expression meaning. | `{value ?? fallback}` |
| Is this in `.tsx` and starts with `<T>`? | Check JSX ambiguity. | `<T,>(value: T) => value` |
| Does the token disappear after compilation? | It is probably TS-only checking/type syntax. | `as`, `keyof`, `satisfies` |
| Does the token still run in JavaScript? | It is a runtime operator. | `+`, `in`, `instanceof`, `?.` |

---

## 10. Compact reference tables

### 10.1 JavaScript runtime operator checklist

```txt
Grouping:
  (expr)

Access and call:
  obj.prop
  obj[expr]
  obj?.prop
  obj?.[expr]
  fn(args)
  fn?.(args)
  new Ctor(args)
  new.target
  super(args)
  super.prop
  import(specifier)
  import.meta

Unary and update:
  +x
  -x
  !x
  ~x
  typeof x
  void x
  delete obj.key
  await x
  ++x
  x++
  --x
  x--

Arithmetic:
  +
  -
  *
  /
  %
  **

Relational and equality:
  <
  <=
  >
  >=
  in
  instanceof
  ==
  !=
  ===
  !==

Bitwise:
  &
  |
  ^
  <<
  >>
  >>>

Logical and conditional:
  &&
  ||
  ??
  ?:

Assignment:
  =
  +=
  -=
  *=
  /=
  %=
  **=
  <<=
  >>=
  >>>=
  &=
  ^=
  |=
  &&=
  ||=
  ??=

Other:
  ,
  ...
  yield
  yield*
```

### 10.2 TypeScript type/checking operator checklist

```txt
Assertions and checking:
  value as Type
  <Type>value
  value!
  field!: Type
  expr satisfies Type
  as const

Type composition:
  A | B
  A & B
  keyof T
  typeof value
  T[K]
  T[number]
  T extends U
  T extends U ? X : Y
  infer X
  [K in Keys]
  [K in keyof T as NewKey]
  readonly [K in keyof T]
  -readonly [K in keyof T]
  [K in keyof T]?
  [K in keyof T]-?
  `${A}${B}`
  parameterName is Type
  asserts parameterName is Type

Generic/type syntax:
  <T>
  <T extends Constraint>
  <const T>
  <T = Default>
  fn<T>(value)
  Class<T>
  new (...args) => T
  abstract new (...args) => T
  (...args) => R
  readonly T[]
  readonly [A, B]
```

### 10.3 JSX and TSX syntax checklist

```txt
JSX:
  <div />
  <Component />
  <div></div>
  <>...</>
  <Fragment key={id}>...</Fragment>
  prop="text"
  prop={expr}
  {expr}
  {{ objectLiteral }}
  {...props}
  key={value}
  ref={value}

TSX:
  value as Type
  {value as Type}
  {value ?? fallback}
  {items.map((item) => <Row key={item.id} />)}
  <T,>(value: T) => value
  <T extends unknown>(value: T) => value
  <Component<Type> prop={value} />
```

---

## 11. Source basis

- MDN JavaScript Reference: Expressions and operators.
- MDN JavaScript Reference: Operator precedence.
- TypeScript Handbook: Creating Types from Types.
- TypeScript Handbook: Everyday Types.
- TypeScript Handbook: Classes.
- TypeScript Handbook: Narrowing.
- TypeScript Handbook: JSX.
- TypeScript Handbook: Mapped Types.
- TypeScript 4.9 release notes: `satisfies`.
- TypeScript 5.0 release notes: `const` type parameters.
- React Docs: JavaScript in JSX with Curly Braces.

# TypeScript Schema Validation Integration Cheatsheet v1

> 位置：`typescript/schema-validation-integration/typescript-schema-validation-integration-cheatsheet-zh-v1.md`  
> 作用：这是完成本章训练后的快速复习表，不替代主指导文件。  
> 规则：正文中文；代码命名和代码注释不使用中文。

---

## 1. 核心 API 总览

### Zod 核心 API

| API | 所属对象 | 作用 | 返回值 | 常见坑 |
|---|---|---|---|---|
| `z.object(shape)` | Zod | 定义对象 schema | object schema | 默认剥离未知字段。 |
| `z.strictObject(shape)` | Zod | 定义严格对象 schema | object schema | 遇到未知字段会失败。 |
| `z.looseObject(shape)` | Zod | 定义宽松对象 schema | object schema | 未知字段会保留。 |
| `schema.catchall(valueSchema)` | object schema | 验证未知字段值 | object schema | 不等于无条件接受。 |
| `z.string()` | Zod | 验证字符串 | string schema | 空字符串也是 string。 |
| `z.email()` | Zod | 验证 email 字符串 | string format schema | 邮箱规则取决于 Zod 默认 regex。 |
| `z.url()` | Zod | 验证 URL 字符串 | string format schema | 内部依赖 JS runtime 的 URL 行为。 |
| `z.number()` | Zod | 验证有限 number | number schema | `NaN` 和 `Infinity` 不通过。 |
| `z.int()` | Zod | 验证安全整数 | integer schema | 不是所有 number 都是 int。 |
| `z.boolean()` | Zod | 验证 boolean | boolean schema | 字符串 `"false"` 不是 false。 |
| `z.literal(value)` | Zod | 验证固定字面量 | literal schema | 适合 discriminator。 |
| `z.enum(values)` | Zod | 验证字符串枚举 | enum schema | values 应该是稳定 literal array。 |
| `z.array(schema)` | Zod | 验证数组 | array schema | 只写 array 不等于验证元素。 |
| `z.union(schemas)` | Zod | 验证任一分支 | union schema | 大 union 可能慢且错误复杂。 |
| `z.discriminatedUnion(key, schemas)` | Zod | 根据 discriminator 验证分支 | union schema | 每个分支必须共享 discriminator。 |
| `z.coerce.number()` | Zod | 把输入转成 number 再验证 | number schema | 仍要约束 int、positive、finite。 |
| `schema.parse(input)` | Zod schema | 验证输入，失败 throw | output | 不适合预期失败的表单输入。 |
| `schema.safeParse(input)` | Zod schema | 验证输入，失败返回错误 | result object | 必须先检查 `success`。 |
| `schema.parseAsync(input)` | Zod schema | 异步验证，失败 throw | `Promise<output>` | schema 含 async rule 时必须用。 |
| `schema.safeParseAsync(input)` | Zod schema | 异步验证，失败返回错误 | `Promise<result>` | 用户输入异步验证常用。 |
| `schema.transform(callback)` | Zod schema | 验证后转换输出 | schema | input/output 类型可能不同。 |
| `schema.refine(predicate, params?)` | Zod schema | 自定义业务规则 | schema | 单 issue 场景更适合。 |
| `schema.superRefine(callback)` | Zod schema | 多 issue 或精确 path | schema | 不要把所有逻辑都塞进去。 |
| `z.infer<typeof Schema>` | Zod type utility | 提取输出类型 | TypeScript type | 等价 `z.output`。 |
| `z.input<typeof Schema>` | Zod type utility | 提取输入类型 | TypeScript type | 表单和 URL 边界常用。 |
| `z.output<typeof Schema>` | Zod type utility | 提取输出类型 | TypeScript type | 业务逻辑应消费 output。 |

### Valibot 核心 API

| API | 所属对象 | 作用 | 返回值 | 常见坑 |
|---|---|---|---|---|
| `v.object(entries)` | Valibot | 定义对象 schema | schema | 写法不同于 Zod。 |
| `v.string()` | Valibot | 定义 string schema | schema | 约束通常用 pipe action。 |
| `v.number()` | Valibot | 定义 number schema | schema | 仍需 `integer()`、`minValue()` 等。 |
| `v.pipe(schema, ...actions)` | Valibot | 组合验证和转换 | schema | 顺序会影响结果。 |
| `v.parse(schema, input, config?)` | Valibot | 验证失败 throw | output | 预期失败用 safeParse。 |
| `v.safeParse(schema, input, config?)` | Valibot | 返回 result | result object | 成功读 `output`，失败读 `issues`。 |
| `v.is(schema, input)` | Valibot | type guard | boolean | 无 issue 详情，transform 无效。 |
| `v.assert(schema, input)` | Valibot | assertion function | void | 失败 throw。 |
| `v.InferInput<typeof Schema>` | Valibot type utility | 输入类型 | TypeScript type | 转换前类型。 |
| `v.InferOutput<typeof Schema>` | Valibot type utility | 输出类型 | TypeScript type | parse 后类型。 |
| `v.InferIssue<typeof Schema>` | Valibot type utility | issue 类型 | TypeScript type | 适合错误处理层。 |

### JSON Schema / Ajv 核心 API

| API / 字段 | 所属对象 | 作用 | 返回值 | 常见坑 |
|---|---|---|---|---|
| `$schema` | JSON Schema | 指定 draft | string | 不同 draft 规则可能不同。 |
| `$id` | JSON Schema | schema URI | string | 用于引用和识别。 |
| `type` | JSON Schema | 限制 JSON 类型 | string / array | JSON type 不等于 TypeScript type。 |
| `properties` | JSON Schema | 定义对象字段 | object | 不自动要求字段存在。 |
| `required` | JSON Schema | 必填字段 | string array | 要和 properties 配合。 |
| `items` | JSON Schema | 数组元素 schema | schema | 不写就无法验证元素 shape。 |
| `additionalProperties` | JSON Schema | 未知字段策略 | boolean / schema | 默认行为要明确。 |
| `new Ajv(options?)` | Ajv | 创建 validator | Ajv instance | options 会影响验证行为。 |
| `ajv.compile(schema)` | Ajv | 编译 schema | validate function | compile 成本较高，应复用。 |
| `validate(data)` | Ajv compiled function | 验证数据 | boolean | 失败详情在 `validate.errors`。 |
| `validate.errors` | Ajv compiled function | 最近一次错误 | error array / null | 下一次 validate 会覆盖。 |

---

## 2. 同名方法对照

| 方法名 | 所属对象 | 含义 | 失败时 |
|---|---|---|---|
| `parse()` | Zod schema | 验证并返回 output | throw `ZodError` |
| `parse()` | Valibot | 验证并返回 output | throw `ValiError` |
| `JSON.parse()` | JSON | 解析 JSON text | throw `SyntaxError` |
| `safeParse()` | Zod schema | 验证并返回 result | `{ success: false, error }` |
| `safeParse()` | Valibot | 验证并返回 result | `{ success: false, issues }` |
| `transform()` | Zod schema | 转换 output | 改变 output type |
| `transform()` | Valibot action | pipeline 转换 | 改变 output type |
| `refine()` | Zod schema | 自定义规则 | issue / throw via parse |
| `min()` | Zod string/number | 长度或数值下限 | issue |
| `minValue()` | Valibot action | 数值下限 | issue |

---

## 3. 参数签名速查

```ts
// Zod
schema.parse(input: unknown): Output;
schema.safeParse(input: unknown):
  | { success: true; data: Output }
  | { success: false; error: z.ZodError };
schema.parseAsync(input: unknown): Promise<Output>;
schema.safeParseAsync(input: unknown): Promise<
  | { success: true; data: Output }
  | { success: false; error: z.ZodError }
>;

type Output = z.output<typeof Schema>;
type Input = z.input<typeof Schema>;
type Inferred = z.infer<typeof Schema>;

// Valibot
v.parse(schema, input, config?);
v.safeParse(schema, input, config?);
v.is(schema, input);
v.assert(schema, input);

type Input = v.InferInput<typeof Schema>;
type Output = v.InferOutput<typeof Schema>;
type Issue = v.InferIssue<typeof Schema>;

// Ajv
const ajv = new Ajv(options?);
const validate = ajv.compile(schema);
const valid = validate(data);
const errors = validate.errors;
```

---

## 4. options object 固定属性名

### Zod 常见 options / params

| API | 固定属性名 | 含义 |
|---|---|---|
| `.refine(predicate, params)` | `message` | 错误信息。 |
| `.refine(predicate, params)` | `path` | 错误路径。 |
| `z.email(options?)` | `pattern` | 自定义 email regex。 |
| `z.url(options?)` | `protocol` | 限制 URL protocol。 |
| `z.url(options?)` | `hostname` | 限制 hostname。 |
| `z.iso.datetime(options?)` | `offset` | 是否允许 timezone offset。 |
| `z.iso.datetime(options?)` | `local` | 是否允许 local datetime。 |
| `z.iso.datetime(options?)` | `precision` | 限制时间精度。 |

### Valibot parse config

| 选项 | 含义 |
|---|---|
| `abortEarly` | 遇到第一个 issue 后停止验证。 |
| `abortPipeEarly` | pipeline 内遇到第一个 issue 后停止。 |

### React Hook Form resolver options

| 选项 | 合法值 | 含义 |
|---|---|---|
| `mode` | `'async' | 'sync'` | resolver 执行模式，默认 async。 |
| `raw` | `boolean` | 是否返回原始值，取决于 resolver 支持。 |

### Ajv options 常见决策项

| 选项 | 含义 |
|---|---|
| `allErrors` | 是否收集所有错误。 |
| `strict` | 是否启用严格模式。 |
| `coerceTypes` | 是否执行类型强制转换。 |
| `removeAdditional` | 是否移除额外字段。 |

---

## 5. 会修改原对象的方法

| API | 是否修改输入对象 | 说明 |
|---|---|---|
| `z.object().parse(input)` | 通常返回 parsed output，不应依赖修改输入 | Zod parse 返回解析后的值。 |
| `z.coerce.*()` | 不应该当作修改原值 | 返回转换后的 output。 |
| `schema.transform()` | 不修改原输入 | 返回转换 output。 |
| Ajv with `removeAdditional` / `coerceTypes` | 可能修改数据 | 取决于 Ajv 配置，慎用。 |

最终记忆：默认把 validation 当成“输入 unknown，输出新可信值”，不要写依赖原对象被修改的代码。

---

## 6. 不会立即输出或不会立即执行的方法

| API | 行为 |
|---|---|
| `z.object()` | 只创建 schema，不验证。 |
| `z.string().min(1)` | 只创建带约束的 schema，不验证。 |
| `.transform(callback)` | 定义转换，parse 时才执行。 |
| `.refine(predicate)` | 定义规则，parse 时才执行。 |
| `ajv.compile(schema)` | 编译验证函数，不验证具体数据。 |
| `zodResolver(schema)` | 创建 resolver，表单验证时才执行。 |

---

## 7. 常见 IDE 警告

| 警告 | 类型 | 原因 | 处理 |
|---|---|---|---|
| Cannot find module `zod` | 类型检查错误 | 未安装依赖或模块解析配置错误 | `npm install zod`，检查 `moduleResolution`。 |
| Cannot use JSX unless the `--jsx` flag is provided | TypeScript 配置错误 | `.tsx` 示例需要 jsx 配置 | 设置 `"jsx": "react-jsx"`。 |
| Property `data` does not exist on safeParse result | 类型检查错误 | 未先检查 `result.success` | 先分支。 |
| Property `output` does not exist on Valibot result | 类型检查错误 | 未先检查 `result.success` | 先分支。 |
| Top-level await not allowed | TypeScript / runtime 配置错误 | module/target 不支持 | 使用 `module: NodeNext` 和现代 target，或包一层 async function。 |
| Type instantiation is excessively deep | 类型系统性能问题 | schema 过深或链式 extend 太长 | 拆分 schema，命名中间类型，减少复杂组合。 |

---

## 8. validation boundary 决策表

| 数据来源 | 初始类型 | 是否需要 schema | 推荐策略 |
|---|---|---:|---|
| API response | `unknown` | 是 | `safeParse()`。 |
| request body | `unknown` | 是 | 后端 strict schema。 |
| form submit | raw form values | 是 | resolver + input/output types。 |
| URLSearchParams | `string | null` | 是 | coerce + default。 |
| localStorage | `string | null` | 是 | JSON parse + schema。 |
| env vars | `string | undefined` | 是 | startup schema。 |
| internal function return | known type | 通常不需要 | 靠 TS 静态类型。 |
| domain service input | parsed output | 通常不需要 | 信任边界内部。 |

---

## 9. 关键对比

### `unknown` vs `any`

| 类型 | 能否直接使用 | 安全性 |
|---|---:|---|
| `unknown` | 不能 | 安全，需要缩小。 |
| `any` | 能 | 不安全，跳过检查。 |

### assertion vs validation

| 写法 | 是否运行检查 | 适合场景 |
|---|---:|---|
| `value as Product` | 否 | 极少数 TS 无法表达但你已证明安全的内部代码。 |
| `ProductSchema.parse(value)` | 是 | 外部数据边界。 |

### parse vs safeParse

| 方法 | 失败方式 | 适合场景 |
|---|---|---|
| `parse()` | throw | 配置加载、开发期 contract 失败、不可恢复错误。 |
| `safeParse()` | result | 表单、API response、用户可修正输入。 |
| `parseAsync()` | Promise throw | 异步且异常式失败。 |
| `safeParseAsync()` | Promise result | 异步且预期失败。 |

### `z.infer` vs `z.input` vs `z.output`

| 工具 | 含义 | transform 后 |
|---|---|---|
| `z.input` | 输入类型 | 转换前类型。 |
| `z.output` | 输出类型 | 转换后类型。 |
| `z.infer` | 输出类型 | 等价 `z.output`。 |

### Zod vs Valibot vs JSON Schema / Ajv

| 方案 | 适合场景 | 注意点 |
|---|---|---|
| Zod | TypeScript-first app、表单、API client、业务 schema | 生态强，运行时对象较完整。 |
| Valibot | 函数组合、bundle 敏感、现代 TS app | API 风格不同，需要团队统一。 |
| JSON Schema + Ajv | 跨语言 contract、高性能服务端验证、API 文档 | TS type 推导需要额外工具或手写。 |

---

## 10. 官方文档链接

- [Zod Intro](https://zod.dev/)
- [Zod Basic usage](https://zod.dev/basics)
- [Zod Defining schemas](https://zod.dev/api)
- [Valibot Parse data](https://valibot.dev/guides/parse-data/)
- [Valibot Infer types](https://valibot.dev/guides/infer-types/)
- [JSON Schema Getting Started](https://json-schema.org/learn/getting-started-step-by-step)
- [Ajv Getting Started](https://ajv.js.org/guide/getting-started.html)
- [React Hook Form Resolvers](https://github.com/react-hook-form/resolvers)
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TSConfig strictNullChecks](https://www.typescriptlang.org/tsconfig/strictNullChecks.html)

---

## 11. 最终记忆模型

```txt
Schema validation is not extra typing.
It is runtime trust management.

External value:
  unknown

Validation:
  schema.parse or schema.safeParse

Trusted value:
  z.output<typeof Schema>

Application rule:
  validate at boundary
  trust inside boundary
  do not use assertions as validation
```

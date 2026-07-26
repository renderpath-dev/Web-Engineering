# TypeScript 第 8 章“异步编程、并发和并行”学习指导文件 v1

> 定位：这是 TypeScript 第 8 章“异步编程、并发和并行”的学习指导文件，不是最终学习笔记。  
> 目标：你按照这份文件创建练习目录、写 `.ts` 文件、运行 `tsc` 类型检查、观察编译错误或运行输出，再把每节整理成最终学习笔记。  
> 参考范围：《TypeScript Programming》第 8 章“异步编程、并发和并行”，TypeScript 官方 Handbook / Reference 的 More on Functions、Generics、Narrowing、Iterators and Generators、Utility Types、TS 2.3 Async Iteration release notes，以及 TSConfig 官方文档中的 `target`、`lib`、`module`、`moduleResolution`。  
> 语言规则：正文统一中文；必要技术术语保留英文括号。  
> 代码规则：代码命名和代码注释统一英文；代码和代码注释不使用中文字符。  
> 学习原则：先理解 JavaScript 异步运行时机制，再理解 TypeScript 如何描述异步函数、Promise、异步迭代、事件消息和并发任务的类型边界。不要把异步学成“看到 await 就同步了”。

---

## 官方文档对应关系

| 本文件主题 | 官方文档 |
|---|---|
| 回调函数、函数类型、泛型函数、`void` 返回值 | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| 泛型 Promise helper、类型参数关系 | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| `Result` 分支、错误分支、控制流收窄 | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| `Iterable<T>`、`for...of`、迭代协议 | [Iterators and Generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html) |
| `AsyncIterator`、`AsyncGenerator`、`for await...of` | [TypeScript 2.3 Async Iteration](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#async-iteration) |
| `Awaited<T>`、`ReturnType<T>`、`Parameters<T>` | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| `Promise`、`AsyncIterable`、DOM / Node 环境类型来自哪些库声明 | [TSConfig lib](https://www.typescriptlang.org/tsconfig/lib.html) |
| 编译目标影响异步语法、生成器和迭代输出 | [TSConfig target](https://www.typescriptlang.org/tsconfig/target.html) |
| NodeNext 模块解析和运行方式 | [TSConfig module](https://www.typescriptlang.org/tsconfig/module.html) / [moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html) |

### 额外官方核对边界

| 本文件补充主题 | 官方来源 |
|---|---|
| `await` 等待 Promise、取得 fulfilled value、rejected 时抛出 rejection reason | [MDN await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) |
| `Promise.all()` 的并发等待、fail-fast 行为、不要把 async function 本身直接传给 `Promise.all()` | [MDN Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) |
| `AbortController` / `AbortSignal` 是向异步操作发送取消信号，不是强制杀死任意 JavaScript 函数 | [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) |
| Worker `postMessage()` 发送的是 structured clone 能处理的数据，类型声明不等于运行时验证 | [MDN Worker.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) |
| Node 子进程 IPC 消息会经过序列化和解析，收到的消息不一定和发送前完全相同 | [Node.js child_process](https://nodejs.org/api/child_process.html) |

---

## 目录

1. [本文件怎么用](#1-本文件怎么用)
2. [项目重新整理建议](#2-项目重新整理建议)
3. [第 8 章完整学习顺序](#3-第-8-章完整学习顺序)
4. [本章先要建立的底层模型](#4-本章先要建立的底层模型)
5. [00：异步编程到底在解决什么问题](#5-00异步编程到底在解决什么问题)
6. [01：JavaScript 事件循环和任务顺序](#6-01javascript-事件循环和任务顺序)
7. [02：回调函数和错误优先回调](#7-02回调函数和错误优先回调)
8. [03：从回调包装成 Promise](#8-03从回调包装成-promise)
9. [04：Promise 类型和状态](#9-04promise-类型和状态)
10. [05：Promise 组合器](#10-05promise-组合器)
11. [06：async 和 await](#11-06async-和-await)
12. [07：Awaited 和异步返回类型提取](#12-07awaited-和异步返回类型提取)
13. [08：顺序 await、并发执行和并行执行](#13-08顺序-await并发执行和并行执行)
14. [09：异步错误、Result 和并发失败处理](#14-09异步错误result-和并发失败处理)
15. [10：超时、取消和 AbortController](#15-10超时取消和-abortcontroller)
16. [11：异步生成器和 AsyncIterable](#16-11异步生成器和-asynciterable)
17. [12：异步流式处理 pipeline](#17-12异步流式处理-pipeline)
18. [13：类型安全事件发射器](#18-13类型安全事件发射器)
19. [14：浏览器 Web Worker 类型安全消息协议](#19-14浏览器-web-worker-类型安全消息协议)
20. [15：Node.js 子进程类型安全消息协议](#20-15nodejs-子进程类型安全消息协议)
21. [16：小项目整合](#21-16小项目整合)
22. [最终文件清单](#22-最终文件清单)
23. [最终学习笔记转换要求](#23-最终学习笔记转换要求)
24. [本章最终要能回答的问题](#24-本章最终要能回答的问题)
25. [TS 官方文档阅读清单](#25-ts-官方文档阅读清单)
26. [第 8 章最终记忆模型](#26-第-8-章最终记忆模型)

---

## 1. 本文件怎么用

### 结论

这不是一份“看完就算学过”的文档。它是一个写异步函数、触发类型检查、观察事件循环顺序、解释 Promise 和异步迭代类型机制的训练指导。

第 8 章要同时观察三件事：

```txt
JavaScript runtime:
  event loop, task queue, microtask queue, Promise jobs, timers, message events.

TypeScript type system:
  Promise<T>, async function return type, Awaited<T>, AsyncIterable<T>, typed event payloads.

Engineering boundary:
  concurrency, cancellation, timeout, worker messages, child process messages.
```

异步编程的目标不是“让代码变慢后还能运行”，而是让等待外部结果的代码保持可读、可组合、可取消、可检查。

### 每节固定学习步骤

每一节都按这个顺序做：

```txt
1. Read the conclusion first.
2. Classify the concept as runtime scheduling, async value modeling, type narrowing, message protocol, or parallel boundary.
3. Create the target directory.
4. Write one correct example file.
5. Write one mistake example file and mark the expected error with @ts-expect-error when possible.
6. Run npx tsc --noEmit.
7. If the example has runtime output, compile and run it with Node.
8. Explain the execution order step by step.
9. Convert the section into your final notes.
```

### 推荐 tsconfig

继续使用前几章的严格配置，并为第 8 章显式保留异步相关库声明。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
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

如果你写 Node.js 专用示例，额外安装 Node 类型声明：

```bash
npm install -D @types/node
```

然后可以把 Node 专用练习放到独立 `node/` 子目录里，避免浏览器 DOM 类型和 Node 类型混淆。

本章练习优先使用：

```bash
npx tsc --noEmit
```

如果某个文件需要运行：

```bash
npx tsc
node path/to/compiled-file.js
```

### 代码注释模板

每个 `.ts` 文件顶部都写英文注释：

```ts
// Goal:
// Verify how this TypeScript async example works.

// Expected result:
// Replace this block with the compiler result or runtime output.

export {};
```

`export {};` 的作用是把文件变成模块（module），防止不同练习文件里的同名变量污染全局作用域。

---

## 2. 项目重新整理建议

### 结论

第 8 章建议单独建立：

```txt
typescript/chapter-08-async-concurrency-parallelism/
```

第 3 章训练“值的类型建模”，第 4 章训练“函数边界”，第 5 章训练“对象结构”，第 6 章训练“类型运算”，第 7 章训练“失败路径建模”，第 8 章训练“异步边界、并发任务和跨线程消息协议”。

### 推荐结构

```txt
typescript/
  README.md
  package.json
  tsconfig.json

  chapter-03-types/
  chapter-04-functions/
  chapter-05-classes-interfaces/
  chapter-06-advanced-types/
  chapter-07-error-handling/

  chapter-08-async-concurrency-parallelism/
    README.md

    00-async-problem-model/
      asyncBoundaryOverview.ts
      syncReturnVsAsyncReturn.ts

    01-event-loop/
      taskMicrotaskOrder.ts
      promiseCallbackOrder.ts
      promiseExecutorSync.ts

    02-callbacks/
      typedCallback.ts
      errorFirstCallback.ts
      callbackPyramidMistake.ts

    03-promisify-callbacks/
      manualPromisify.ts
      genericPromisify.ts

    04-promise-basics/
      promiseValueType.ts
      promiseRejectTypeMistake.ts
      promiseChainTyping.ts
      promiseCatchChangesType.ts

    05-promise-combinators/
      promiseAllTuple.ts
      promiseAllSettled.ts
      promiseRaceTimeout.ts
      promiseAnyFallback.ts
      promiseAllFunctionMistake.ts
      promiseAllCalledFunctions.ts

    06-async-await/
      asyncReturnType.ts
      awaitUnwrap.ts
      tryCatchAsync.ts
      floatingPromiseMistake.ts
      asyncStartBeforeAwait.ts

    07-awaited-return-types/
      awaitedUtility.ts
      asyncReturnData.ts

    08-concurrency-vs-parallelism/
      sequentialAwait.ts
      concurrentPromiseAll.ts
      limitedConcurrency.ts

    09-async-errors-result/
      asyncResult.ts
      concurrentResultCollection.ts

    10-timeout-cancellation/
      timeoutPromise.ts
      abortControllerFetch.ts
      cancellableTask.ts

    11-async-iterables/
      asyncGeneratorBasics.ts
      forAwaitOf.ts
      asyncIterableTyping.ts

    12-async-stream-pipeline/
      asyncMap.ts
      asyncFilter.ts
      pagedApiStream.ts

    13-typed-event-emitter/
      typedAsyncEmitter.ts
      onceAsPromise.ts

    14-web-worker-protocol/
      workerMessageProtocol.ts
      workerClient.ts
      workerMessageValidation.ts

    15-node-child-process-protocol/
      parentProcess.ts
      childProcess.ts
      childMessageValidation.ts

    16-mini-project/
      typedAsyncLoader.ts
      concurrentCheckoutTasks.ts
      asyncEventWorkflow.ts

notes/
  typescript.md
```

### 和真实前端项目的关系

异步边界会出现在所有现代前端工程里：

```txt
API request:
  fetch returns Promise and external data starts as unknown.

React UI state:
  loading, success, error, empty states are async state models.

Form submit:
  validation, request, retry, cancellation, and result rendering are async workflows.

Worker and child process:
  message payloads must be typed because runtime channels accept plain data.

Streaming data:
  logs, uploads, downloads, websocket messages, and paginated APIs are async sequences.
```

---

## 3. 第 8 章完整学习顺序

### 结论

本章按这个顺序学：

```txt
async boundary model
  -> event loop
  -> callback typing
  -> error-first callback
  -> Promise<T>
  -> Promise combinators
  -> async / await
  -> Awaited<T>
  -> sequential vs concurrent execution
  -> async error modeling
  -> timeout and cancellation
  -> async generator
  -> AsyncIterable<T>
  -> async stream pipeline
  -> typed event emitter
  -> Web Worker message protocol
  -> Node child process message protocol
  -> mini project
```

### 技术意义

第 8 章不是重新学 `setTimeout`、`Promise`、`async` 和 `await` 的表面语法，而是理解：

```txt
A Promise<T> is not T.
An async function always returns a Promise.
await unwraps a Promise only inside an async execution context.
Promise.all starts from already-created promises and waits for them together.
AsyncIterable<T> models a sequence whose next value arrives later.
Concurrency interleaves waiting tasks.
Parallelism uses multiple execution agents.
TypeScript does not make runtime messages safe unless you define and validate protocols.
```

---

## 4. 本章先要建立的底层模型

### 结论

异步 TypeScript 的底层模型可以拆成四层：

```txt
runtime scheduling layer:
  call stack, task queue, microtask queue, event loop.

async value layer:
  Promise<T>, async function, await, rejection, Result<T, E>.

async sequence layer:
  AsyncIterator<T>, AsyncIterable<T>, async generator, for await...of.

message boundary layer:
  EventEmitter, Web Worker, child process, typed request and response protocols.
```

### 关键术语先解释

| 术语 | 解释 |
|---|---|
| 事件循环（event loop） | 宿主环境调度同步代码、任务、微任务和事件回调的运行机制。 |
| 任务（task / macrotask） | 定时器、IO、用户事件等进入的较外层调度队列。 |
| 微任务（microtask） | Promise reaction、`queueMicrotask` 等在当前任务结束后尽快执行的队列。 |
| 回调（callback） | 传给另一个函数、未来被调用的函数。 |
| 错误优先回调（error-first callback） | Node 风格回调，通常第一个参数是 `Error | null`。 |
| `Promise<T>` | 表示未来可能兑现出 `T` 的异步结果。 |
| fulfilled / rejected | Promise 成功兑现或失败拒绝的状态。 |
| `async function` | 总是返回 Promise 的函数语法。 |
| `await` | 暂停当前 async 函数，等待 Promise settled 后恢复。 |
| 并发（concurrency） | 多个任务时间上重叠推进，但不一定同时在多个线程运行。 |
| 并行（parallelism） | 多个执行单元真正同时运行，例如 worker 或子进程。 |
| 异步迭代（async iteration） | 每次 `next()` 都返回 Promise 的序列协议。 |
| 消息协议（message protocol） | 跨 worker、进程或事件系统传递数据时约定的 payload 类型。 |

### 底层机制总图

```txt
synchronous code starts
  -> call stack runs to completion
  -> Promise callbacks enter microtask queue
  -> timers and IO callbacks enter task queue
  -> event loop picks next task
  -> microtasks drain after the current task
  -> async functions resume through Promise jobs
  -> workers and child processes communicate by messages
```

### 本章最重要的边界

```txt
TypeScript can describe async values.
TypeScript cannot change event loop behavior.
TypeScript can type Promise fulfilled values.
TypeScript cannot type rejected values as a second Promise parameter.
TypeScript can type message payloads.
TypeScript cannot validate incoming runtime messages unless you write validation.
TypeScript can type AsyncIterable<T>.
TypeScript cannot make a synchronous iterator become asynchronous.
```

### 本章必须提前澄清的模糊点

| 模糊点 | 正确模型 |
|---|---|
| `new Promise(...)` 里的 executor 是异步的吗 | executor 会同步执行；异步的是后续 fulfillment / rejection reaction。 |
| 调用 `async function` 会不会等到第一个 `await` 才开始 | 不会。调用后函数体会立刻开始执行，直到遇到第一个暂停点或返回。 |
| `await` 是不是阻塞线程 | 不是。它暂停当前 async 函数的继续执行，不阻塞整个 JavaScript 运行环境。 |
| `Promise<T>` 会不会记录 rejected error 类型 | 不会。标准 `Promise<T>` 只描述 fulfilled value 类型。 |
| `Promise.all([fnA, fnB])` 会不会调用函数 | 不会。`Promise.all()` 等待传进去的值；如果传的是函数，它只把函数当普通值。 |
| `AbortController.abort()` 会不会强制终止任意函数 | 不会。它发出取消信号，具体异步 API 或自定义任务必须主动配合。 |
| Worker / child process 消息写了 TypeScript 类型后是否天然安全 | 不安全。跨运行时边界收到的是普通 JavaScript 数据，必要时仍要运行时验证。 |

---



## 5. 00：异步编程到底在解决什么问题

### 结论

异步编程解决的是：程序需要等待外部结果，但不能阻塞整个运行环境。

### 技术意义

网络请求、文件读取、定时器、用户事件、worker 消息都不会立刻给你结果。异步代码把“现在没有结果，但未来会有结果或失败”的状态建模出来。

### 文件结构

```txt
00-async-problem-model/
  asyncBoundaryOverview.ts
  syncReturnVsAsyncReturn.ts
```

### `asyncBoundaryOverview.ts`

```ts
// Goal:
// Model a delayed value with Promise.

// Expected result:
// Node prints the loaded product title.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function loadProduct(): Promise<ProductRecord> {
  await delay(10);

  return {
    id: "p1",
    title: "Keyboard",
  };
}

const productPromise = loadProduct();

productPromise.then((product) => {
  console.log(product.title);
});
```

### `syncReturnVsAsyncReturn.ts`

```ts
// Goal:
// Distinguish a direct value from a Promise value.

// Expected result:
// The compiler rejects treating Promise<ProductRecord> as ProductRecord.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

async function loadProduct(): Promise<ProductRecord> {
  return {
    id: "p1",
    title: "Keyboard",
  };
}

const productPromise = loadProduct();

// @ts-expect-error: productPromise is Promise<ProductRecord>, not ProductRecord.
console.log(productPromise.title);

productPromise.then((product) => {
  console.log(product.title);
});
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 调用 `loadProduct()` 立刻得到 `Promise<ProductRecord>`。 |
| 2 | 函数内部的实际结果稍后兑现。 |
| 3 | TypeScript 不允许把 Promise 当成产品对象。 |
| 4 | `.then()` 或 `await` 才能拿到 fulfilled value。 |

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `Promise<T>` 就是 `T` | `Promise<T>` 是未来的 `T`，不是当前的 `T`。 |
| `async` 函数返回普通对象 | 表面写 `return object`，实际返回 `Promise<object>`。 |
| `await` 让整个程序暂停 | `await` 暂停当前 async 函数，不阻塞整个运行环境。 |

---

## 6. 01：JavaScript 事件循环和任务顺序

### 结论

事件循环决定异步回调什么时候执行。TypeScript 不改变事件循环，只能帮你检查异步回调中的值类型。

### 技术意义

你必须能解释为什么同步代码先执行，Promise 微任务早于定时器任务执行。这个顺序会影响 UI 状态、请求回调和测试断言。

### 文件结构

```txt
01-event-loop/
  taskMicrotaskOrder.ts
  promiseCallbackOrder.ts
```

### `taskMicrotaskOrder.ts`

```ts
// Goal:
// Observe synchronous code, microtasks, and tasks.

// Expected result:
// Node prints sync-start, sync-end, microtask, timeout.

export {};

console.log("sync-start");

setTimeout(() => {
  console.log("timeout-task");
}, 0);

queueMicrotask(() => {
  console.log("microtask");
});

console.log("sync-end");
```

### 预期输出

```txt
sync-start
sync-end
microtask
timeout-task
```

### `promiseCallbackOrder.ts`

```ts
// Goal:
// Observe Promise callback scheduling.

// Expected result:
// Promise callbacks run after synchronous code.

export {};

const resolvedPromise = Promise.resolve("ready");

resolvedPromise.then((value) => {
  console.log(`promise:${value}`);
});

console.log("after-then-registration");
```

### `promiseExecutorSync.ts`

```ts
// Goal:
// Show that the Promise executor runs synchronously.

// Expected result:
// Node prints executor, after-create, then:ready.

export {};

const readyPromise = new Promise<string>((resolve) => {
  console.log("executor");
  resolve("ready");
});

readyPromise.then((value) => {
  console.log(`then:${value}`);
});

console.log("after-create");
```

### 预期输出

```txt
executor
after-create
then:ready
```

### 机制解释

`new Promise(executor)` 调用时，`executor` 会立刻同步执行。`resolve("ready")` 只是把 Promise 推向 fulfilled 状态；`.then()` 里的 reaction callback 不会插队到当前同步代码中执行，而是进入后续 Promise job / microtask 队列。

所以不能把这两个概念混在一起：

```txt
Promise constructor executor:
  runs synchronously.

Promise reaction callback:
  runs later as a microtask.
```

### 执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | 同步代码进入调用栈。 |
| 2 | `setTimeout` 注册任务，不立刻执行。 |
| 3 | `queueMicrotask` 注册微任务。 |
| 4 | 当前同步代码执行结束。 |
| 5 | 微任务先执行。 |
| 6 | 定时器任务再执行。 |

### 常见错误

```txt
错误：
setTimeout(fn, 0) means fn runs immediately.

正确：
It schedules a later task. Current synchronous code and pending microtasks run first.
```

---

## 7. 02：回调函数和错误优先回调

### 结论

回调是最基础的异步接口形态。TypeScript 要描述的是：未来调用这个函数时会传入什么参数，以及调用者必须如何处理错误。

### 技术意义

回调本身不是异步，异步来自“谁在未来调用这个回调”。回调类型必须准确，否则错误会在未来才爆炸。

### 文件结构

```txt
02-callbacks/
  typedCallback.ts
  errorFirstCallback.ts
  callbackPyramidMistake.ts
```

### `typedCallback.ts`

```ts
// Goal:
// Type a callback that receives an async result.

// Expected result:
// Node prints the loaded user email.

export {};

type UserRecord = {
  id: string;
  email: string;
};

type UserCallback = (user: UserRecord) => void;

function loadUserLater(id: string, callback: UserCallback): void {
  setTimeout(() => {
    callback({
      id,
      email: `${id}@example.com`,
    });
  }, 10);
}

loadUserLater("u1", (user) => {
  console.log(user.email.toLowerCase());
});
```

### `errorFirstCallback.ts`

```ts
// Goal:
// Model a Node-style error-first callback.

// Expected result:
// The caller handles the error branch before reading the value.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ErrorFirstCallback<ValueType> = (
  error: Error | null,
  value: ValueType | null,
) => void;

function loadProductLegacy(
  id: string,
  callback: ErrorFirstCallback<ProductRecord>,
): void {
  setTimeout(() => {
    if (id.length === 0) {
      callback(new Error("Missing id"), null);
      return;
    }

    callback(null, {
      id,
      title: "Keyboard",
    });
  }, 10);
}

loadProductLegacy("p1", (error, product) => {
  if (error !== null) {
    console.log(error.message);
    return;
  }

  if (product !== null) {
    console.log(product.title);
  }
});
```

### `callbackPyramidMistake.ts`

```ts
// Goal:
// Show why nested callbacks become hard to compose.

// Expected result:
// This file compiles but demonstrates nested control flow.

export {};

type Callback<ValueType> = (value: ValueType) => void;

function loadId(callback: Callback<string>): void {
  setTimeout(() => callback("p1"), 10);
}

function loadTitle(id: string, callback: Callback<string>): void {
  setTimeout(() => callback(`title:${id}`), 10);
}

function loadPrice(id: string, callback: Callback<number>): void {
  setTimeout(() => callback(id.length * 10), 10);
}

loadId((id) => {
  loadTitle(id, (title) => {
    loadPrice(id, (price) => {
      console.log(`${title}:${price}`);
    });
  });
});
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 回调参数不写类型 | 边界回调应该明确参数类型。 |
| 错误和值都写成可选参数 | 调用者会分不清到底哪一种分支存在。 |
| 嵌套回调越来越深 | Promise / async 可以把组合关系拉平。 |

---

## 8. 03：从回调包装成 Promise

### 结论

把回调包装成 Promise 的本质是：把“未来调用 callback”转换成“未来 resolve 或 reject”。

### 技术意义

这是从旧 API 迁移到现代异步模型的关键步骤。TypeScript 泛型要保留 callback 成功值的类型。

### 文件结构

```txt
03-promisify-callbacks/
  manualPromisify.ts
  genericPromisify.ts
```

### `manualPromisify.ts`

```ts
// Goal:
// Wrap an error-first callback API into a Promise.

// Expected result:
// Node prints the product title through async await.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ProductCallback = (error: Error | null, product: ProductRecord | null) => void;

function loadProductLegacy(id: string, callback: ProductCallback): void {
  setTimeout(() => {
    if (id.length === 0) {
      callback(new Error("Missing id"), null);
      return;
    }

    callback(null, {
      id,
      title: "Keyboard",
    });
  }, 10);
}

function loadProduct(id: string): Promise<ProductRecord> {
  return new Promise((resolve, reject) => {
    loadProductLegacy(id, (error, product) => {
      if (error !== null) {
        reject(error);
        return;
      }

      if (product === null) {
        reject(new Error("Missing product"));
        return;
      }

      resolve(product);
    });
  });
}

async function main(): Promise<void> {
  const product = await loadProduct("p1");
  console.log(product.title);
}

void main();
```

### `genericPromisify.ts`

```ts
// Goal:
// Write a small generic wrapper for one-argument callback APIs.

// Expected result:
// The resolved Promise keeps the callback value type.

export {};

type ErrorFirstCallback<ValueType> = (
  error: Error | null,
  value: ValueType | null,
) => void;

type LegacyOneArgFunction<InputType, OutputType> = (
  input: InputType,
  callback: ErrorFirstCallback<OutputType>,
) => void;

function promisifyOne<InputType, OutputType>(
  legacyFunction: LegacyOneArgFunction<InputType, OutputType>,
): (input: InputType) => Promise<OutputType> {
  return (input) => {
    return new Promise((resolve, reject) => {
      legacyFunction(input, (error, value) => {
        if (error !== null) {
          reject(error);
          return;
        }

        if (value === null) {
          reject(new Error("Missing callback value"));
          return;
        }

        resolve(value);
      });
    });
  };
}

function readQuantityLegacy(
  text: string,
  callback: ErrorFirstCallback<number>,
): void {
  const parsedValue = Number.parseInt(text, 10);

  if (Number.isNaN(parsedValue)) {
    callback(new Error("Invalid number"), null);
    return;
  }

  callback(null, parsedValue);
}

const readQuantity = promisifyOne(readQuantityLegacy);

readQuantity("42").then((quantity) => {
  console.log(quantity.toFixed(2));
});
```

### 常见错误

```txt
错误：
resolve and reject both can run in the same code path.

正确：
After reject, return immediately unless control flow clearly stops.
```

---

## 9. 04：Promise 类型和状态

### 结论

`Promise<T>` 只描述成功兑现值的类型。TypeScript 的标准 `Promise` 没有第二个类型参数描述 rejected error 类型。

### 技术意义

如果你需要把错误类型放进类型系统，使用 `Result<T, E>` 作为 fulfilled value，而不是期待 `Promise<T, E>`。

### 文件结构

```txt
04-promise-basics/
  promiseValueType.ts
  promiseRejectTypeMistake.ts
  promiseChainTyping.ts
```

### `promiseValueType.ts`

```ts
// Goal:
// Type the fulfilled value of a Promise.

// Expected result:
// The compiler infers the fulfilled value as string.

export {};

const titlePromise: Promise<string> = Promise.resolve("Keyboard");

titlePromise.then((title) => {
  console.log(title.toUpperCase());
});
```

### `promiseRejectTypeMistake.ts`

```ts
// Goal:
// Show that Promise has no rejected-error type parameter.

// Expected result:
// The compiler rejects using two type arguments for Promise.

export {};

type NetworkError = {
  kind: "network-error";
};

// @ts-expect-error: Promise only accepts one type argument.
const brokenPromise: Promise<string, NetworkError> = Promise.resolve("ok");

console.log(typeof brokenPromise);
```

### `promiseChainTyping.ts`

```ts
// Goal:
// Observe Promise chain type transformation.

// Expected result:
// The compiler derives Promise<number> after the first then callback.

export {};

const lengthPromise = Promise.resolve("Keyboard")
  .then((title) => {
    return title.length;
  })
  .then((lengthValue) => {
    return lengthValue * 2;
  });

lengthPromise.then((value) => {
  console.log(value.toFixed(0));
});
```

### `promiseCatchChangesType.ts`

```ts
// Goal:
// Show that catch can recover and change the fulfilled value type.

// Expected result:
// The compiler treats the recovered value as string.

export {};

const recoveredPromise = Promise.reject(new Error("Load failed"))
  .catch((errorValue: unknown) => {
    if (errorValue instanceof Error) {
      return `fallback:${errorValue.message}`;
    }

    return "fallback:unknown";
  });

recoveredPromise.then((value) => {
  console.log(value.toUpperCase());
});
```

### 机制解释

`.catch()` 不是只负责“打印错误”。如果它返回一个正常值，后面的 Promise 链会进入 fulfilled 分支，并且 fulfilled value 的类型会变成这个返回值的类型。

```txt
throw inside Promise chain:
  keeps the chain rejected.

return inside catch:
  recovers the chain and creates a new fulfilled value.
```

所以错误处理代码会影响后续类型。你不能只看最开始的 `Promise<T>`，还要看每一个 `.then()` / `.catch()` callback 返回了什么。

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `Promise<T>` 同时描述成功和失败 | 它只描述 fulfilled value。 |
| `.catch()` 后 Promise 类型一定保持不变 | catch 返回值会影响后续链条类型。 |
| 忘记 return `.then()` 内的新值 | 回调不 return 时下一个 fulfilled value 是 `void`。 |

---

## 10. 05：Promise 组合器

### 结论

Promise 组合器用来等待多个异步任务。TypeScript 会根据组合器规则推导结果类型，尤其是 tuple 输入时的 `Promise.all()`。

### 技术意义

真实项目里，你经常要同时请求多个接口、等待多个异步校验、处理部分成功部分失败。不同组合器表达不同失败策略。

### 文件结构

```txt
05-promise-combinators/
  promiseAllTuple.ts
  promiseAllSettled.ts
  promiseRaceTimeout.ts
  promiseAnyFallback.ts
```

### `promiseAllTuple.ts`

```ts
// Goal:
// Preserve tuple result types with Promise.all.

// Expected result:
// The compiler infers [ProductRecord, InventoryRecord].

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type InventoryRecord = {
  productId: string;
  stock: number;
};

async function loadProduct(): Promise<ProductRecord> {
  return { id: "p1", title: "Keyboard" };
}

async function loadInventory(): Promise<InventoryRecord> {
  return { productId: "p1", stock: 12 };
}

async function main(): Promise<void> {
  const [product, inventory] = await Promise.all([
    loadProduct(),
    loadInventory(),
  ] as const);

  console.log(product.title);
  console.log(inventory.stock.toFixed(0));
}

void main();
```

### `promiseAllSettled.ts`

```ts
// Goal:
// Handle fulfilled and rejected outcomes separately.

// Expected result:
// Node prints each settled outcome.

export {};

async function loadLabel(id: string): Promise<string> {
  if (id === "broken") {
    throw new Error("Broken label");
  }

  return `label:${id}`;
}

async function main(): Promise<void> {
  const outcomes = await Promise.allSettled([
    loadLabel("a"),
    loadLabel("broken"),
  ]);

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      console.log(outcome.value.toUpperCase());
    } else {
      console.log("rejected");
    }
  }
}

void main();
```

### `promiseRaceTimeout.ts`

```ts
// Goal:
// Race a task against a timeout.

// Expected result:
// The faster Promise decides the result.

export {};

function delay<ValueType>(value: ValueType, milliseconds: number): Promise<ValueType> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), milliseconds);
  });
}

function timeout(milliseconds: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), milliseconds);
  });
}

async function main(): Promise<void> {
  const result = await Promise.race([
    delay("ready", 10),
    timeout(100),
  ]);

  console.log(result.toUpperCase());
}

void main();
```

### `promiseAnyFallback.ts`

```ts
// Goal:
// Use Promise.any to accept the first fulfilled result.

// Expected result:
// Node prints the first successful label.

export {};

async function loadMirror(name: string): Promise<string> {
  if (name === "primary") {
    throw new Error("Primary failed");
  }

  return `mirror:${name}`;
}

async function main(): Promise<void> {
  const label = await Promise.any([
    loadMirror("primary"),
    loadMirror("backup"),
  ]);

  console.log(label);
}

void main();
```

### `promiseAllFunctionMistake.ts`

```ts
// Goal:
// Show that Promise.all waits for promises, not function definitions.

// Expected result:
// The compiler keeps the function values because they were not called.

export {};

async function loadTitle(): Promise<string> {
  return "Keyboard";
}

async function loadPrice(): Promise<number> {
  return 99;
}

async function main(): Promise<void> {
  const [titleLoader, priceLoader] = await Promise.all([
    loadTitle,
    loadPrice,
  ] as const);

  console.log(typeof titleLoader);
  console.log(typeof priceLoader);

  // @ts-expect-error: titleLoader is a function, not a string.
  console.log(titleLoader.toUpperCase());
}

void main();
```

### `promiseAllCalledFunctions.ts`

```ts
// Goal:
// Start async tasks before passing promises to Promise.all.

// Expected result:
// Node prints the loaded title and price.

export {};

async function loadTitle(): Promise<string> {
  return "Keyboard";
}

async function loadPrice(): Promise<number> {
  return 99;
}

async function main(): Promise<void> {
  const [title, price] = await Promise.all([
    loadTitle(),
    loadPrice(),
  ] as const);

  console.log(title.toUpperCase());
  console.log(price.toFixed(2));
}

void main();
```

这两个例子的区别不是语法小问题，而是启动时机不同：

```txt
Promise.all([loadTitle, loadPrice]):
  passes function values.
  no async task is started by Promise.all itself.

Promise.all([loadTitle(), loadPrice()]):
  calls both async functions first.
  passes their returned promises into Promise.all.
```

### 常见错误

| 组合器 | 成功规则 | 失败规则 |
|---|---|---|
| `Promise.all` | 全部 fulfilled | 任意一个 rejected 就 rejected |
| `Promise.allSettled` | 等全部 settled | 不短路，返回每个结果 |
| `Promise.race` | 第一个 settled 决定 | 第一个 rejected 也会决定 |
| `Promise.any` | 第一个 fulfilled 决定 | 全部 rejected 才 rejected |

---

## 11. 06：async 和 await

### 结论

`async` 函数永远返回 Promise；`await` 只在当前 async 函数内部把 Promise 的 fulfilled value 解包出来。

### 技术意义

`async` / `await` 是 Promise 的语法层抽象，不是新的线程模型。它让异步控制流更像同步代码，但运行时仍然通过 Promise 恢复执行。

### 文件结构

```txt
06-async-await/
  asyncReturnType.ts
  awaitUnwrap.ts
  tryCatchAsync.ts
  floatingPromiseMistake.ts
```

### `asyncReturnType.ts`

```ts
// Goal:
// Verify that async functions return Promise values.

// Expected result:
// The compiler rejects assigning the async result to a string.

export {};

async function createTitle(): Promise<string> {
  return "Keyboard";
}

const titlePromise = createTitle();

// @ts-expect-error: titlePromise is Promise<string>, not string.
const titleText: string = titlePromise;

console.log(typeof titlePromise);
console.log(typeof titleText);
```

### `awaitUnwrap.ts`

```ts
// Goal:
// Unwrap a Promise value with await inside an async function.

// Expected result:
// Node prints the uppercase title.

export {};

async function loadTitle(): Promise<string> {
  return "Keyboard";
}

async function main(): Promise<void> {
  const title = await loadTitle();
  console.log(title.toUpperCase());
}

void main();
```

### `tryCatchAsync.ts`

```ts
// Goal:
// Catch a rejected Promise with try catch around await.

// Expected result:
// Node prints the error message.

export {};

async function loadBrokenTitle(): Promise<string> {
  throw new Error("Load failed");
}

async function main(): Promise<void> {
  try {
    const title = await loadBrokenTitle();
    console.log(title);
  } catch (errorValue) {
    if (errorValue instanceof Error) {
      console.log(errorValue.message);
    }
  }
}

void main();
```

### `floatingPromiseMistake.ts`

```ts
// Goal:
// Show why unawaited promises are easy to lose.

// Expected result:
// This file demonstrates a promise that is intentionally ignored.

export {};

async function saveAuditLog(): Promise<void> {
  await Promise.resolve();
  console.log("saved");
}

void saveAuditLog();

console.log("after-call");
```

### `asyncStartBeforeAwait.ts`

```ts
// Goal:
// Show that an async function starts running immediately when called.

// Expected result:
// Node prints inside-start before after-call.

export {};

async function runTask(): Promise<string> {
  console.log("inside-start");

  await Promise.resolve();

  console.log("inside-after-await");

  return "done";
}

const taskPromise = runTask();

console.log("after-call");

void taskPromise.then((value) => {
  console.log(value);
});
```

### 预期输出

```txt
inside-start
after-call
inside-after-await
done
```

### 机制解释

调用 `runTask()` 时，函数体不会等到 `.then()` 或 `await` 才开始。它会立刻执行到第一个 `await`。遇到 `await` 后，当前 async 函数的后续部分被安排到后续 Promise job 中恢复。

```txt
call async function:
  starts executing immediately.

hit await:
  pause this async function.

outer synchronous code:
  continues running.

promise settles:
  async function resumes later.
```

### 常见错误

```txt
错误：
Calling an async function means the work is completed.

正确：
Calling it starts the async function and returns a Promise.
You need await, return, or explicit void when you intentionally ignore it.
```

---

## 12. 07：Awaited 和异步返回类型提取

### 结论

`Awaited<T>` 模拟 `await` 对类型的解包规则，适合从 async 函数返回类型中提取最终数据类型。

### 技术意义

真实项目里经常要从 API 函数得到 response data 类型。如果手动复制类型，函数返回结构变化后类型容易失同步。

### 文件结构

```txt
07-awaited-return-types/
  awaitedUtility.ts
  asyncReturnData.ts
```

### `awaitedUtility.ts`

```ts
// Goal:
// Use Awaited to unwrap nested Promise types.

// Expected result:
// The compiler derives string and number correctly.

export {};

type TitleType = Awaited<Promise<string>>;
type CountType = Awaited<Promise<Promise<number>>>;

const title: TitleType = "Keyboard";
const count: CountType = 12;

console.log(title.toUpperCase());
console.log(count.toFixed(0));
```

### `asyncReturnData.ts`

```ts
// Goal:
// Extract async function data from ReturnType and Awaited.

// Expected result:
// ProductData stays linked to loadProduct.

export {};

async function loadProduct() {
  return {
    id: "p1",
    title: "Keyboard",
    price: 99,
  };
}

type ProductData = Awaited<ReturnType<typeof loadProduct>>;

const product: ProductData = {
  id: "p2",
  title: "Mouse",
  price: 25,
};

console.log(product.title);
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| `ReturnType<typeof asyncFn>` 得到数据类型 | 它得到的是 `Promise<Data>`。 |
| 手动复制 async 返回对象类型 | 优先使用 `Awaited<ReturnType<typeof fn>>`。 |
| 以为 `Awaited` 是运行时函数 | 它只在类型系统中存在。 |

---

## 13. 08：顺序 await、并发执行和并行执行

### 结论

顺序 `await` 是一个任务完成后才开始下一个任务；并发执行是多个异步任务先同时启动，再一起等待；并行执行需要 worker、子进程或多线程能力。

### 技术意义

性能问题经常不是 `await` 本身造成的，而是你把可以同时开始的任务写成了串行开始。

### 文件结构

```txt
08-concurrency-vs-parallelism/
  sequentialAwait.ts
  concurrentPromiseAll.ts
  limitedConcurrency.ts
```

### `sequentialAwait.ts`

```ts
// Goal:
// Run async tasks sequentially.

// Expected result:
// The second task starts after the first one finishes.

export {};

function delayLabel(label: string, milliseconds: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(label), milliseconds);
  });
}

async function main(): Promise<void> {
  const firstLabel = await delayLabel("first", 10);
  const secondLabel = await delayLabel("second", 10);

  console.log(firstLabel);
  console.log(secondLabel);
}

void main();
```

### `concurrentPromiseAll.ts`

```ts
// Goal:
// Start async tasks before awaiting them together.

// Expected result:
// Both tasks are created before Promise.all waits.

export {};

function delayLabel(label: string, milliseconds: number): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(label), milliseconds);
  });
}

async function main(): Promise<void> {
  const firstPromise = delayLabel("first", 10);
  const secondPromise = delayLabel("second", 10);

  const [firstLabel, secondLabel] = await Promise.all([
    firstPromise,
    secondPromise,
  ] as const);

  console.log(firstLabel);
  console.log(secondLabel);
}

void main();
```

### `limitedConcurrency.ts`

```ts
// Goal:
// Process items with a simple concurrency limit.

// Expected result:
// Node prints all transformed labels.

export {};

async function mapWithLimit<InputType, OutputType>(
  items: readonly InputType[],
  limit: number,
  transform: (item: InputType, index: number) => Promise<OutputType>,
): Promise<OutputType[]> {
  const results: OutputType[] = [];
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      const item = items[currentIndex];

      if (item !== undefined) {
        results[currentIndex] = await transform(item, currentIndex);
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);

  return results;
}

async function main(): Promise<void> {
  const labels = await mapWithLimit(["a", "b", "c", "d"], 2, async (item) => {
    return `label:${item}`;
  });

  console.log(labels.join(","));
}

void main();
```

### 常见错误

```txt
sequential:
  await taskA(); await taskB();

concurrent:
  const a = taskA(); const b = taskB(); await Promise.all([a, b]);

parallel:
  run work in separate execution agents such as workers or child processes.
```

---

## 14. 09：异步错误、Result 和并发失败处理

### 结论

Promise rejection 会走异常式失败路径；如果你希望失败也变成普通值，就让 Promise fulfilled 出 `Result<T, E>`。

### 技术意义

并发场景下，直接 `Promise.all()` 遇到第一个 rejection 就短路。如果你要收集每个任务的成功和失败，使用 `Result` 或 `allSettled()`。

### 文件结构

```txt
09-async-errors-result/
  asyncResult.ts
  concurrentResultCollection.ts
```

### `asyncResult.ts`

```ts
// Goal:
// Return Result inside a Promise instead of rejecting.

// Expected result:
// The caller handles both result branches.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type LoadError = {
  kind: "not-found";
  id: string;
};

type ProductRecord = {
  id: string;
  title: string;
};

async function loadProductResult(id: string): Promise<Result<ProductRecord, LoadError>> {
  if (id !== "p1") {
    return {
      ok: false,
      error: { kind: "not-found", id },
    };
  }

  return {
    ok: true,
    value: { id, title: "Keyboard" },
  };
}

async function main(): Promise<void> {
  const result = await loadProductResult("missing");

  if (result.ok) {
    console.log(result.value.title);
  } else {
    console.log(result.error.kind);
  }
}

void main();
```

### `concurrentResultCollection.ts`

```ts
// Goal:
// Collect success and failure values from concurrent tasks.

// Expected result:
// The caller receives every task outcome.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

async function safeTask(id: string): Promise<Result<string, string>> {
  if (id === "bad") {
    return { ok: false, error: `failed:${id}` };
  }

  return { ok: true, value: `loaded:${id}` };
}

async function main(): Promise<void> {
  const results = await Promise.all([
    safeTask("a"),
    safeTask("bad"),
    safeTask("c"),
  ]);

  const successValues = results.flatMap((result) => {
    if (result.ok) {
      return [result.value];
    }

    return [];
  });

  console.log(successValues.join(","));
}

void main();
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 所有异步错误都 reject | 可恢复业务失败也可以 fulfilled 出 `Result`。 |
| 用 `Promise.all()` 期待拿到所有失败 | 它会在第一个 rejection 处短路。 |
| 在 async 函数中混用 throw 和 Result 没规则 | 一个模块要有稳定失败策略。 |

---

## 15. 10：超时、取消和 AbortController

### 结论

超时是你主动限制等待时间；取消是你向异步操作发送“不要继续”的信号。它们都不是 TypeScript 自动提供的能力，需要运行时协议。

### 技术意义

真实前端请求必须考虑组件卸载、用户切换页面、搜索输入变化、请求过慢等情况。`AbortController` 是现代 Web API 中常见的取消信号机制。

### 文件结构

```txt
10-timeout-cancellation/
  timeoutPromise.ts
  abortControllerFetch.ts
  cancellableTask.ts
```

### `timeoutPromise.ts`

```ts
// Goal:
// Wrap a promise with a timeout.

// Expected result:
// The timeout rejects if the task is too slow.

export {};

function withTimeout<ValueType>(
  promise: Promise<ValueType>,
  milliseconds: number,
): Promise<ValueType> {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, milliseconds);

    promise.then(
      (value) => {
        clearTimeout(timerId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timerId);
        reject(error);
      },
    );
  });
}

async function main(): Promise<void> {
  const value = await withTimeout(Promise.resolve("ready"), 100);
  console.log(value);
}

void main();
```

### `abortControllerFetch.ts`

```ts
// Goal:
// Pass an AbortSignal to fetch.

// Expected result:
// This example type-checks in a DOM-enabled TypeScript project.

export {};

async function fetchJsonWithSignal(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  return response.json();
}

const controller = new AbortController();
const requestPromise = fetchJsonWithSignal("https://example.com/products", controller.signal);

controller.abort();

void requestPromise.catch((errorValue) => {
  if (errorValue instanceof Error) {
    console.log(errorValue.name);
  }
});
```

### `cancellableTask.ts`

```ts
// Goal:
// Cooperatively cancel a custom async task with AbortSignal.

// Expected result:
// The task checks the signal before resolving.

export {};

function waitForSignalAwareDelay(
  milliseconds: number,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Already aborted"));
      return;
    }

    const timerId = setTimeout(() => {
      resolve("done");
    }, milliseconds);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timerId);
        reject(new Error("Aborted"));
      },
      { once: true },
    );
  });
}

const controller = new AbortController();

void waitForSignalAwareDelay(100, controller.signal).catch((errorValue) => {
  if (errorValue instanceof Error) {
    console.log(errorValue.message);
  }
});

controller.abort();
```

### 常见错误

```txt
错误：
AbortController forcibly kills any JavaScript function.

正确：
It sends a signal. The async API or your custom task must cooperate with that signal.
```

---

## 16. 11：异步生成器和 AsyncIterable

### 结论

异步生成器 `async function*` 产生 `AsyncGenerator<Yield, Return, Next>`。`for await...of` 用来消费 `AsyncIterable<T>`。

### 技术意义

Promise 适合一次性结果。异步迭代适合多个结果陆续到达：分页 API、日志流、下载进度、WebSocket 消息、Node 流。

### 文件结构

```txt
11-async-iterables/
  asyncGeneratorBasics.ts
  forAwaitOf.ts
  asyncIterableTyping.ts
```

### `asyncGeneratorBasics.ts`

```ts
// Goal:
// Create an async generator that yields values over time.

// Expected result:
// Node prints each yielded value.

export {};

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function* createLogStream(): AsyncGenerator<string, void, unknown> {
  await delay(10);
  yield "log-1";

  await delay(10);
  yield "log-2";
}

async function main(): Promise<void> {
  for await (const logMessage of createLogStream()) {
    console.log(logMessage);
  }
}

void main();
```

### `forAwaitOf.ts`

```ts
// Goal:
// Consume any AsyncIterable source.

// Expected result:
// The function collects async values into an array.

export {};

async function collectAsyncValues<ValueType>(
  source: AsyncIterable<ValueType>,
): Promise<ValueType[]> {
  const values: ValueType[] = [];

  for await (const value of source) {
    values.push(value);
  }

  return values;
}

async function* createNumbers(): AsyncGenerator<number, void, unknown> {
  yield 1;
  yield 2;
  yield 3;
}

async function main(): Promise<void> {
  const values = await collectAsyncValues(createNumbers());
  console.log(values.join(","));
}

void main();
```

### `asyncIterableTyping.ts`

```ts
// Goal:
// Accept an AsyncIterable instead of a concrete async generator.

// Expected result:
// The consumer only depends on the async iteration protocol.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

async function printProductTitles(source: AsyncIterable<ProductRecord>): Promise<void> {
  for await (const product of source) {
    console.log(product.title);
  }
}

async function* createProductSource(): AsyncGenerator<ProductRecord, void, unknown> {
  yield { id: "p1", title: "Keyboard" };
  yield { id: "p2", title: "Mouse" };
}

void printProductTitles(createProductSource());
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 用 `Promise<T[]>` 表示所有异步序列 | 一次性全部结果用 Promise，逐个到达用 AsyncIterable。 |
| 用 `for...of` 消费 async iterable | 应该用 `for await...of`。 |
| 以为 async generator 可以写成箭头函数 | `async function*` 不能用箭头函数形式。 |

---

## 17. 12：异步流式处理 pipeline

### 结论

异步 pipeline 是把 `AsyncIterable<T>` 一步步转换成新的 `AsyncIterable<U>`。它适合处理流式数据和分页结果。

### 技术意义

不要一上来把所有异步结果都收集成数组。能逐个处理时，异步迭代可以降低内存占用，并让结果更早可用。

### 文件结构

```txt
12-async-stream-pipeline/
  asyncMap.ts
  asyncFilter.ts
  pagedApiStream.ts
```

### `asyncMap.ts`

```ts
// Goal:
// Transform each async iterable item with a typed mapper.

// Expected result:
// Node prints transformed labels.

export {};

async function* asyncMap<InputType, OutputType>(
  source: AsyncIterable<InputType>,
  transform: (value: InputType) => OutputType | Promise<OutputType>,
): AsyncGenerator<OutputType, void, unknown> {
  for await (const value of source) {
    yield transform(value);
  }
}

async function* createIds(): AsyncGenerator<string, void, unknown> {
  yield "p1";
  yield "p2";
}

async function main(): Promise<void> {
  const labels = asyncMap(createIds(), (id) => `product:${id}`);

  for await (const label of labels) {
    console.log(label);
  }
}

void main();
```

### `asyncFilter.ts`

```ts
// Goal:
// Filter an async iterable with an async predicate.

// Expected result:
// Node prints values that pass the predicate.

export {};

async function* asyncFilter<ValueType>(
  source: AsyncIterable<ValueType>,
  predicate: (value: ValueType) => boolean | Promise<boolean>,
): AsyncGenerator<ValueType, void, unknown> {
  for await (const value of source) {
    if (await predicate(value)) {
      yield value;
    }
  }
}

async function* createNumbers(): AsyncGenerator<number, void, unknown> {
  yield 1;
  yield 2;
  yield 3;
}

async function main(): Promise<void> {
  for await (const value of asyncFilter(createNumbers(), async (value) => value >= 2)) {
    console.log(value.toFixed(0));
  }
}

void main();
```

### `pagedApiStream.ts`

```ts
// Goal:
// Model paged API results as an async stream.

// Expected result:
// Node prints every product title from all pages.

export {};

type ProductRecord = {
  id: string;
  title: string;
};

type ProductPage = {
  items: ProductRecord[];
  nextPage: number | null;
};

async function loadPage(pageNumber: number): Promise<ProductPage> {
  if (pageNumber >= 2) {
    return { items: [], nextPage: null };
  }

  return {
    items: [{ id: `p${pageNumber}`, title: `Product ${pageNumber}` }],
    nextPage: pageNumber + 1,
  };
}

async function* streamProducts(): AsyncGenerator<ProductRecord, void, unknown> {
  let pageNumber: number | null = 0;

  while (pageNumber !== null) {
    const page = await loadPage(pageNumber);

    for (const item of page.items) {
      yield item;
    }

    pageNumber = page.nextPage;
  }
}

async function main(): Promise<void> {
  for await (const product of streamProducts()) {
    console.log(product.title);
  }
}

void main();
```

### 常见错误

```txt
错误：
AsyncIterable is only useful for infinite streams.

正确：
It is useful whenever values arrive over time or can be processed incrementally.
```

---

## 18. 13：类型安全事件发射器

### 结论

事件系统本质上是“事件名 -> payload -> handler”的映射。TypeScript 可以用事件表把这三者关联起来。

### 技术意义

无类型事件发射器最大的问题是：事件名拼错、payload 形状错、handler 参数错。用泛型事件表可以把这些错误提前暴露。

### 文件结构

```txt
13-typed-event-emitter/
  typedAsyncEmitter.ts
  onceAsPromise.ts
```

### `typedAsyncEmitter.ts`

```ts
// Goal:
// Build a typed event emitter that supports async handlers.

// Expected result:
// The compiler enforces event names and payload types.

export {};

type EventHandler<PayloadType> = (payload: PayloadType) => void | Promise<void>;

function createAsyncEmitter<EventMap extends Record<string, unknown>>() {
  const handlers: {
    [EventName in keyof EventMap]?: EventHandler<EventMap[EventName]>[];
  } = {};

  return {
    on<EventName extends keyof EventMap>(
      eventName: EventName,
      handler: EventHandler<EventMap[EventName]>,
    ): void {
      const eventHandlers = handlers[eventName] ?? [];
      eventHandlers.push(handler);
      handlers[eventName] = eventHandlers;
    },

    async emit<EventName extends keyof EventMap>(
      eventName: EventName,
      payload: EventMap[EventName],
    ): Promise<void> {
      const eventHandlers = handlers[eventName] ?? [];

      for (const handler of eventHandlers) {
        await handler(payload);
      }
    },
  };
}

type AppEvents = {
  productLoaded: { id: string; title: string };
  loadFailed: { id: string; message: string };
};

const emitter = createAsyncEmitter<AppEvents>();

emitter.on("productLoaded", async (payload) => {
  console.log(payload.title);
});

void emitter.emit("productLoaded", {
  id: "p1",
  title: "Keyboard",
});

emitter.emit("loadFailed", {
  id: "p1",
  // @ts-expect-error: The payload does not match loadFailed.
  title: "Keyboard",
});
```

### `onceAsPromise.ts`

```ts
// Goal:
// Convert a one-time event into a Promise.

// Expected result:
// The once function resolves with the event payload.

export {};

type EventHandler<PayloadType> = (payload: PayloadType) => void;

type TinyEmitter<EventMap extends Record<string, unknown>> = {
  on<EventName extends keyof EventMap>(
    eventName: EventName,
    handler: EventHandler<EventMap[EventName]>,
  ): void;
  emit<EventName extends keyof EventMap>(
    eventName: EventName,
    payload: EventMap[EventName],
  ): void;
};

function createTinyEmitter<EventMap extends Record<string, unknown>>(): TinyEmitter<EventMap> {
  const handlers: {
    [EventName in keyof EventMap]?: EventHandler<EventMap[EventName]>[];
  } = {};

  return {
    on(eventName, handler): void {
      const eventHandlers = handlers[eventName] ?? [];
      eventHandlers.push(handler);
      handlers[eventName] = eventHandlers;
    },
    emit(eventName, payload): void {
      const eventHandlers = handlers[eventName] ?? [];
      for (const handler of eventHandlers) {
        handler(payload);
      }
    },
  };
}

function once<EventMap extends Record<string, unknown>, EventName extends keyof EventMap>(
  emitter: TinyEmitter<EventMap>,
  eventName: EventName,
): Promise<EventMap[EventName]> {
  return new Promise((resolve) => {
    emitter.on(eventName, resolve);
  });
}

type AppEvents = {
  ready: { timestamp: number };
};

const emitter = createTinyEmitter<AppEvents>();
const readyPromise = once(emitter, "ready");

emitter.emit("ready", { timestamp: Date.now() });

readyPromise.then((payload) => {
  console.log(payload.timestamp.toFixed(0));
});
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 事件名写成普通 `string` | 用 `keyof EventMap` 限制已知事件。 |
| payload 写成 `unknown` 后到处断言 | 在 emitter 边界保留泛型关系。 |
| async handler 不 await | 看业务语义，顺序执行时要 await，并发通知时可以 `Promise.all`。 |

---

## 19. 14：浏览器 Web Worker 类型安全消息协议

### 结论

Web Worker 通过消息传递通信。TypeScript 可以定义 request / response 协议，但运行时仍然只收到普通数据。

### 技术意义

Worker 是并行边界，不共享普通对象引用。你要把“主线程发什么消息、worker 回什么消息”设计成判别联合，并在入口处检查分支。

### 文件结构

```txt
14-web-worker-protocol/
  workerMessageProtocol.ts
  workerClient.ts
```

### `workerMessageProtocol.ts`

```ts
// Goal:
// Define a typed message protocol for a Web Worker.

// Expected result:
// The compiler enforces known request and response messages.

export {};

type WorkerRequest =
  | { kind: "calculateTotal"; prices: number[] }
  | { kind: "formatLabel"; title: string };

type WorkerResponse =
  | { kind: "totalCalculated"; total: number }
  | { kind: "labelFormatted"; label: string }
  | { kind: "workerError"; message: string };

function handleWorkerRequest(request: WorkerRequest): WorkerResponse {
  switch (request.kind) {
    case "calculateTotal":
      return {
        kind: "totalCalculated",
        total: request.prices.reduce((total, price) => total + price, 0),
      };
    case "formatLabel":
      return {
        kind: "labelFormatted",
        label: request.title.toUpperCase(),
      };
  }
}

const response = handleWorkerRequest({
  kind: "calculateTotal",
  prices: [10, 20],
});

console.log(response.kind);
```

### `workerClient.ts`

```ts
// Goal:
// Type a browser Worker client wrapper.

// Expected result:
// This file type-checks in a DOM-enabled project.

export {};

type WorkerRequest =
  | { kind: "calculateTotal"; prices: number[] }
  | { kind: "formatLabel"; title: string };

type WorkerResponse =
  | { kind: "totalCalculated"; total: number }
  | { kind: "labelFormatted"; label: string }
  | { kind: "workerError"; message: string };

function postTypedWorkerMessage(worker: Worker, request: WorkerRequest): void {
  worker.postMessage(request);
}

function handleTypedWorkerResponse(event: MessageEvent<WorkerResponse>): void {
  const response = event.data;

  switch (response.kind) {
    case "totalCalculated":
      console.log(response.total.toFixed(2));
      break;
    case "labelFormatted":
      console.log(response.label);
      break;
    case "workerError":
      console.log(response.message);
      break;
  }
}

console.log(typeof postTypedWorkerMessage);
console.log(typeof handleTypedWorkerResponse);
```

### `workerMessageValidation.ts`

```ts
// Goal:
// Validate an unknown worker message before treating it as a request.

// Expected result:
// The compiler narrows the message after validation.

export {};

type WorkerRequest =
  | { kind: "calculateTotal"; prices: number[] }
  | { kind: "formatLabel"; title: string };

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate["kind"] === "calculateTotal") {
    return isNumberArray(candidate["prices"]);
  }

  if (candidate["kind"] === "formatLabel") {
    return typeof candidate["title"] === "string";
  }

  return false;
}

const incomingMessage: unknown = {
  kind: "calculateTotal",
  prices: [10, 20],
};

if (isWorkerRequest(incomingMessage)) {
  console.log(incomingMessage.kind);
}
```

### 机制解释

`MessageEvent<WorkerResponse>` 只能约束你自己写的 TypeScript 代码。真实 worker 边界收到的数据来自另一个运行时上下文，进入当前模块时仍然应该当成 `unknown` 处理，再用 type guard 验证。

```txt
compile-time protocol:
  prevents your code from sending the wrong shape.

runtime validation:
  protects the boundary when data arrives from outside this type-checked module.
```

### 常见错误

```txt
错误：
The worker message is typed, so incoming data is automatically safe.

正确：
TypeScript checks your source code. A real message from another runtime boundary should still be validated if it is not fully controlled.
```

---

## 20. 15：Node.js 子进程类型安全消息协议

### 结论

Node.js 子进程通过 IPC 消息通信时，也需要明确的 request / response 协议。TypeScript 可以约束发送方和处理方，但运行时消息仍需要验证。

### 技术意义

子进程是真正的并行边界之一。它适合 CPU 密集任务、隔离执行、独立脚本。类型安全来自协议设计，不是来自进程通信本身。

### 文件结构

```txt
15-node-child-process-protocol/
  parentProcess.ts
  childProcess.ts
```

### `parentProcess.ts`

```ts
// Goal:
// Type messages sent from a parent process to a child process.

// Expected result:
// This file requires @types/node and a real child process entry file.

import { fork } from "node:child_process";

export {};

type ChildRequest =
  | { kind: "sum"; values: number[] }
  | { kind: "uppercase"; text: string };

type ChildResponse =
  | { kind: "sumResult"; total: number }
  | { kind: "uppercaseResult"; text: string }
  | { kind: "childError"; message: string };

function sendRequest(childPath: string, request: ChildRequest): Promise<ChildResponse> {
  return new Promise((resolve, reject) => {
    const child = fork(childPath);

    child.once("message", (message: unknown) => {
      resolve(message as ChildResponse);
      child.kill();
    });

    child.once("error", reject);
    child.send(request);
  });
}

console.log(typeof sendRequest);
```

### `childProcess.ts`

```ts
// Goal:
// Type messages handled inside a child process.

// Expected result:
// This file requires @types/node and is meant to run as a child process.

export {};

type ChildRequest =
  | { kind: "sum"; values: number[] }
  | { kind: "uppercase"; text: string };

type ChildResponse =
  | { kind: "sumResult"; total: number }
  | { kind: "uppercaseResult"; text: string }
  | { kind: "childError"; message: string };

function handleRequest(request: ChildRequest): ChildResponse {
  switch (request.kind) {
    case "sum":
      return {
        kind: "sumResult",
        total: request.values.reduce((total, value) => total + value, 0),
      };
    case "uppercase":
      return {
        kind: "uppercaseResult",
        text: request.text.toUpperCase(),
      };
  }
}

process.on("message", (message: unknown) => {
  const response = handleRequest(message as ChildRequest);

  if (process.send !== undefined) {
    process.send(response);
  }
});
```

### `childMessageValidation.ts`

```ts
// Goal:
// Validate an unknown child-process message before handling it.

// Expected result:
// The handler only receives a validated request.

export {};

type ChildRequest =
  | { kind: "sum"; values: number[] }
  | { kind: "uppercase"; text: string };

type ChildResponse =
  | { kind: "sumResult"; total: number }
  | { kind: "uppercaseResult"; text: string }
  | { kind: "childError"; message: string };

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isChildRequest(value: unknown): value is ChildRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate["kind"] === "sum") {
    return isNumberArray(candidate["values"]);
  }

  if (candidate["kind"] === "uppercase") {
    return typeof candidate["text"] === "string";
  }

  return false;
}

function handleRequest(request: ChildRequest): ChildResponse {
  switch (request.kind) {
    case "sum":
      return {
        kind: "sumResult",
        total: request.values.reduce((total, value) => total + value, 0),
      };
    case "uppercase":
      return {
        kind: "uppercaseResult",
        text: request.text.toUpperCase(),
      };
  }
}

function handleUnknownMessage(message: unknown): ChildResponse {
  if (!isChildRequest(message)) {
    return {
      kind: "childError",
      message: "Invalid child request",
    };
  }

  return handleRequest(message);
}

console.log(handleUnknownMessage({ kind: "sum", values: [1, 2, 3] }).kind);
```

### 机制解释

`message as ChildRequest` 是断言，不是验证。它会让 TypeScript 暂时相信消息符合协议，但运行时数据没有被检查。跨进程消息要优先采用这个顺序：

```txt
unknown message
  -> runtime validation
  -> narrowed request type
  -> business handler
  -> typed response
```

### 常见错误

| 错误 | 正确模型 |
|---|---|
| 子进程共享父进程内存 | 子进程是独立进程，通过消息通信。 |
| 类型声明等于运行时验证 | 进程边界收到的是普通 JS 值，必要时要 validate。 |
| 把所有异步都丢给子进程 | I/O 等待通常用并发即可，CPU 密集任务才更需要并行。 |

---

## 21. 16：小项目整合

### 结论

本章小项目要把 Promise、async/await、Result、Promise 组合器、取消信号、AsyncIterable 和类型安全事件协议合起来，做一个“可取消的并发数据加载工作流”。

### 技术意义

真实项目的异步不是一个孤立请求。它通常包括：并发加载、失败收集、取消、进度事件、最终状态渲染。

### 文件结构

```txt
16-mini-project/
  typedAsyncLoader.ts
  concurrentCheckoutTasks.ts
  asyncEventWorkflow.ts
```

### `typedAsyncLoader.ts`

```ts
// Goal:
// Build a typed async loader with Result and cancellation.

// Expected result:
// The caller handles success and failure states.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type LoadError =
  | { kind: "aborted" }
  | { kind: "not-found"; id: string };

type ProductRecord = {
  id: string;
  title: string;
};

async function loadProduct(
  id: string,
  signal: AbortSignal,
): Promise<Result<ProductRecord, LoadError>> {
  if (signal.aborted) {
    return { ok: false, error: { kind: "aborted" } };
  }

  await Promise.resolve();

  if (id !== "p1") {
    return { ok: false, error: { kind: "not-found", id } };
  }

  return {
    ok: true,
    value: { id, title: "Keyboard" },
  };
}

async function main(): Promise<void> {
  const controller = new AbortController();
  const result = await loadProduct("p1", controller.signal);

  if (result.ok) {
    console.log(result.value.title);
  } else {
    console.log(result.error.kind);
  }
}

void main();
```

### `concurrentCheckoutTasks.ts`

```ts
// Goal:
// Run independent checkout tasks concurrently and collect typed results.

// Expected result:
// Node prints checkout summaries.

export {};

type Result<ValueType, ErrorType> =
  | { ok: true; value: ValueType }
  | { ok: false; error: ErrorType };

type CheckoutError =
  | { kind: "inventory-failed" }
  | { kind: "pricing-failed" };

async function checkInventory(): Promise<Result<string, CheckoutError>> {
  return { ok: true, value: "inventory-ok" };
}

async function calculatePricing(): Promise<Result<string, CheckoutError>> {
  return { ok: true, value: "pricing-ok" };
}

async function main(): Promise<void> {
  const [inventoryResult, pricingResult] = await Promise.all([
    checkInventory(),
    calculatePricing(),
  ] as const);

  if (inventoryResult.ok && pricingResult.ok) {
    console.log(`${inventoryResult.value}:${pricingResult.value}`);
  } else {
    console.log("checkout-failed");
  }
}

void main();
```

### `asyncEventWorkflow.ts`

```ts
// Goal:
// Emit progress events while consuming an async iterable workflow.

// Expected result:
// Node prints progress events and final values.

export {};

type WorkflowEvents = {
  progress: { step: string };
  completed: { count: number };
};

type EventHandler<PayloadType> = (payload: PayloadType) => void | Promise<void>;

function createEmitter<EventMap extends Record<string, unknown>>() {
  const handlers: {
    [EventName in keyof EventMap]?: EventHandler<EventMap[EventName]>[];
  } = {};

  return {
    on<EventName extends keyof EventMap>(
      eventName: EventName,
      handler: EventHandler<EventMap[EventName]>,
    ): void {
      const eventHandlers = handlers[eventName] ?? [];
      eventHandlers.push(handler);
      handlers[eventName] = eventHandlers;
    },

    async emit<EventName extends keyof EventMap>(
      eventName: EventName,
      payload: EventMap[EventName],
    ): Promise<void> {
      for (const handler of handlers[eventName] ?? []) {
        await handler(payload);
      }
    },
  };
}

async function* createWorkflowSteps(): AsyncGenerator<string, void, unknown> {
  yield "load";
  yield "validate";
  yield "save";
}

async function main(): Promise<void> {
  const emitter = createEmitter<WorkflowEvents>();
  let count = 0;

  emitter.on("progress", (payload) => {
    console.log(payload.step);
  });

  emitter.on("completed", (payload) => {
    console.log(payload.count.toFixed(0));
  });

  for await (const step of createWorkflowSteps()) {
    count += 1;
    await emitter.emit("progress", { step });
  }

  await emitter.emit("completed", { count });
}

void main();
```

### 小项目执行过程

| 步骤 | 发生什么 |
|---|---|
| 1 | `loadProduct()` 返回 `Promise<Result<ProductRecord, LoadError>>`。 |
| 2 | `AbortSignal` 作为取消协议传入。 |
| 3 | `Promise.all()` 同时等待库存和价格任务。 |
| 4 | 每个任务把可恢复失败建模成 `Result`。 |
| 5 | `AsyncGenerator` 逐步产出 workflow step。 |
| 6 | typed emitter 按事件名约束 payload。 |
| 7 | UI 或日志层可以订阅 `progress` 和 `completed`。 |

---

## 22. 最终文件清单

```txt
typescript/
  chapter-08-async-concurrency-parallelism/
    README.md

    00-async-problem-model/
      asyncBoundaryOverview.ts
      syncReturnVsAsyncReturn.ts

    01-event-loop/
      taskMicrotaskOrder.ts
      promiseCallbackOrder.ts
      promiseExecutorSync.ts

    02-callbacks/
      typedCallback.ts
      errorFirstCallback.ts
      callbackPyramidMistake.ts

    03-promisify-callbacks/
      manualPromisify.ts
      genericPromisify.ts

    04-promise-basics/
      promiseValueType.ts
      promiseRejectTypeMistake.ts
      promiseChainTyping.ts
      promiseCatchChangesType.ts

    05-promise-combinators/
      promiseAllTuple.ts
      promiseAllSettled.ts
      promiseRaceTimeout.ts
      promiseAnyFallback.ts
      promiseAllFunctionMistake.ts
      promiseAllCalledFunctions.ts

    06-async-await/
      asyncReturnType.ts
      awaitUnwrap.ts
      tryCatchAsync.ts
      floatingPromiseMistake.ts
      asyncStartBeforeAwait.ts

    07-awaited-return-types/
      awaitedUtility.ts
      asyncReturnData.ts

    08-concurrency-vs-parallelism/
      sequentialAwait.ts
      concurrentPromiseAll.ts
      limitedConcurrency.ts

    09-async-errors-result/
      asyncResult.ts
      concurrentResultCollection.ts

    10-timeout-cancellation/
      timeoutPromise.ts
      abortControllerFetch.ts
      cancellableTask.ts

    11-async-iterables/
      asyncGeneratorBasics.ts
      forAwaitOf.ts
      asyncIterableTyping.ts

    12-async-stream-pipeline/
      asyncMap.ts
      asyncFilter.ts
      pagedApiStream.ts

    13-typed-event-emitter/
      typedAsyncEmitter.ts
      onceAsPromise.ts

    14-web-worker-protocol/
      workerMessageProtocol.ts
      workerClient.ts
      workerMessageValidation.ts

    15-node-child-process-protocol/
      parentProcess.ts
      childProcess.ts
      childMessageValidation.ts

    16-mini-project/
      typedAsyncLoader.ts
      concurrentCheckoutTasks.ts
      asyncEventWorkflow.ts

notes/
  typescript.md
```

---

## 23. 最终学习笔记转换要求

练习做完后，把本章整理成 `notes/typescript.md` 的一节。不要直接复制本指导文件。最终笔记要更像你自己的理解。

每个知识点按这个格式整理：

```txt
### Topic name

Conclusion:
Explain what problem it solves.

Technical meaning:
Explain what TypeScript models.

Runtime mechanism:
Explain what JavaScript or the host environment actually does.

Code example:
Keep one example that proves the mechanism.

Common mistake:
Write one mistake you personally may make.

Project relation:
Connect it to API requests, React state, workers, streams, event systems, or Node scripts.
```

最终笔记必须包含这些对比：

```txt
callback vs Promise
Promise<T> vs T
Promise fulfillment type vs rejection reason
then chain vs async await
await vs blocking the thread
sequential await vs concurrent Promise.all
concurrency vs parallelism
Promise.all vs Promise.allSettled vs Promise.race vs Promise.any
throw in async function vs Result inside Promise
ReturnType<typeof asyncFn> vs Awaited<ReturnType<typeof asyncFn>>
setTimeout task vs Promise microtask
for...of vs for await...of
Iterable<T> vs AsyncIterable<T>
Promise<T[]> vs AsyncIterable<T>
event emitter payload map vs untyped event string
Web Worker message protocol vs direct function call
Node child process protocol vs shared memory
AbortController signal vs forced cancellation
Promise executor vs Promise reaction callback
calling async function vs awaiting async result
Promise.all with promises vs Promise.all with function values
typed message protocol vs runtime message validation
```

---

## 24. 本章最终要能回答的问题

学完第 8 章后，你必须能不用查资料回答这些问题：

1. 异步编程到底在解决什么问题？
2. `Promise<T>` 和 `T` 有什么区别？
3. `async` 函数为什么总是返回 Promise？
4. `await` 解包的是什么，暂停的又是什么？
5. `await` 会不会阻塞整个 JavaScript 运行环境？
6. 微任务和任务的执行顺序有什么区别？
7. 为什么 `Promise.then()` 通常早于 `setTimeout(..., 0)` 执行？
8. 回调函数本身是不是异步？
9. 错误优先回调的类型应该怎么写？
10. 如何把 callback API 包装成 Promise？
11. `Promise` 为什么没有第二个错误类型参数？
12. 如果想静态建模异步错误类型，应该怎么做？
13. `Promise.all()` 对 tuple 输入如何推导结果类型？
14. `Promise.all()` 和 `Promise.allSettled()` 的失败策略有什么不同？
15. `Promise.race()` 和 timeout 可以怎么组合？
16. `Promise.any()` 适合什么场景？
17. 什么是 floating promise？
18. 为什么有些 Promise 要显式 `void`？
19. `Awaited<T>` 解决什么问题？
20. 为什么 `ReturnType<typeof asyncFn>` 不是最终数据类型？
21. 顺序 `await` 和并发 `Promise.all` 的启动时机有什么不同？
22. 并发和并行有什么区别？
23. 什么时候应该限制并发数量？
24. `AbortController` 是如何表达取消的？
25. 为什么取消需要异步任务配合？
26. `AsyncIterator` 和普通 `Iterator` 的 `next()` 返回值有什么不同？
27. `async function*` 适合什么场景？
28. `for await...of` 只能用在哪里？
29. `Promise<T[]>` 和 `AsyncIterable<T>` 如何选择？
30. 类型安全事件发射器的核心类型关系是什么？
31. Worker 消息为什么要设计 request / response 联合类型？
32. Node 子进程为什么属于并行边界？
33. 为什么跨 worker 或子进程消息仍然需要运行时验证？
34. 异步工作流如何把 loading、success、error、progress 建模清楚？
35. `new Promise()` 的 executor 是同步执行还是异步执行？
36. 调用 async 函数时，函数体什么时候开始执行？
37. `.catch()` 返回正常值时，后续 Promise 链的类型为什么会变化？
38. 为什么 `Promise.all([loadA, loadB])` 不会启动两个 async 任务？
39. 为什么 typed worker / child-process protocol 仍然需要 runtime validation？

---

## 25. TS 官方文档阅读清单

按这个顺序读 TypeScript 官方文档对应内容：

1. [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)  
   复习函数类型表达式、回调参数、`void` 返回值和泛型函数。异步 API 的第一层仍然是函数边界。

2. [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)  
   复习泛型函数和泛型约束。`Promise<T>`、`Result<T, E>`、`AsyncIterable<T>`、typed emitter 都依赖泛型关系。

3. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)  
   复习判别联合和控制流收窄。异步 `Result`、`allSettled`、worker response 都依赖分支收窄。

4. [Iterators and Generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html)  
   复习 `Iterable<T>`、`for...of` 和迭代协议，再迁移到异步迭代模型。

5. [TypeScript 2.3 Async Iteration](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#async-iteration)  
   重点读 `AsyncIterator`、`AsyncGenerator`、`for await...of` 和运行时依赖。

6. [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)  
   重点读 `Awaited<T>`、`ReturnType<T>`、`Parameters<T>`。第 8 章最常用的是从 async function 提取最终数据类型。

7. [TSConfig lib](https://www.typescriptlang.org/tsconfig/lib.html)  
   理解 `ES2015.Promise`、`ES2018.Promise`、`DOM`、`DOM.Iterable`、`ESNext.AsyncIterable` 等库声明如何影响类型可用性。

8. [TSConfig target](https://www.typescriptlang.org/tsconfig/target.html)  
   理解编译目标会影响 async / generator / iteration 的输出方式和运行时要求。

9. [TSConfig module](https://www.typescriptlang.org/tsconfig/module.html) 和 [moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html)  
   Node 专用异步示例会受模块系统影响，尤其是 `node:` 内置模块和 ESM / CJS 互操作。

10. [MDN await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)  
    读 `await` 的 return value、exception 和 description，理解它暂停的是 surrounding async function，不是整个运行环境。

11. [MDN Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)  
    读 concurrency method、fail-fast behavior、passing async functions directly 的错误示例。

12. [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)  
    读 controller / signal 的关系，理解取消是协议，不是强制杀死普通函数。

13. [MDN Worker.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) 和 [Node.js child_process](https://nodejs.org/api/child_process.html)  
    读消息传递和序列化边界，理解跨运行时通信必须同时考虑类型协议和运行时验证。

---

## 26. 第 8 章最终记忆模型

```txt
Async JavaScript runtime:
  synchronous code runs first.
  Promise callbacks run as microtasks.
  timers and IO callbacks run as tasks.
  async functions resume through Promise jobs.
  workers and child processes communicate through messages.

TypeScript async modeling:
  Promise<T> models fulfilled value type.
  Promise rejection reason is not represented as a second type parameter.
  Promise executor runs synchronously, but reactions run later.
  async functions return Promise<T>.
  calling an async function starts its body immediately.
  await unwraps Promise values in async contexts.
  Awaited<T> models await-like unwrapping at type level.
  Result<T, E> can make async failures explicit.
  AsyncIterable<T> models async sequences.
  event maps connect event names to payload types.
  message protocols connect requests and responses across parallel boundaries.
  runtime validation is still needed at uncontrolled message boundaries.
```

### 最终一句话

```txt
第 3 章让你描述值的形状。
第 4 章让你描述行为的边界。
第 5 章让你描述对象的长期结构和抽象契约。
第 6 章让你理解类型系统如何比较、缩小、派生、转换和保护类型。
第 7 章让你把失败路径变成可读、可检查、可组合的代码结构。
第 8 章让你把未来值、并发任务、异步序列和跨线程消息协议建模清楚。

真正的 TypeScript 异步学习，不是会写 async 和 await，而是能分清 Promise 值、异步控制流、并发启动时机、失败策略、取消协议和跨运行时消息边界。
```

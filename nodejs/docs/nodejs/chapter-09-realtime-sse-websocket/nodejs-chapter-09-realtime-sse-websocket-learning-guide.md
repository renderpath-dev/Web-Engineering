# Node.js 第 9 章：实时 API、SSE、WebSocket、连接管理与 Pub/Sub 边界


<style>
.macos-code-window {
  margin: 1rem 0;
  border: 1px solid #30363d;
  border-radius: 12px;
  overflow: hidden;
  background: #0d1117;
}

.macos-code-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.macos-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
}

.macos-code-dot-red {
  background: #ff5f57;
}

.macos-code-dot-yellow {
  background: #ffbd2e;
}

.macos-code-dot-green {
  background: #28c840;
}

.macos-code-title {
  margin-left: 6px;
  color: #c9d1d9;
  font-size: 0.85rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.macos-code-titlebar + pre {
  margin: 0;
  border-radius: 0;
  border: 0;
}

.macos-code-titlebar + pre code {
  display: block;
  padding: 1rem;
}
</style>


## 目录

- [本章代码定位索引](#code-index)
- [0. 章前定位](#section-0)
- [1. 学习目标](#section-1)
- [2. 前置知识](#section-2)
- [3. 环境与运行基线](#section-3)
- [4. 第一性原理](#section-4)
- [5. 技术边界模型](#section-5)
- [6. 底层机制模型](#section-6)
- [7. 核心术语](#section-7)
- [8. 本章实践路线](#section-8)
- [9. 核心教学](#section-9)
  - [9.1 Polling versus SSE versus WebSocket](#9-1-polling-versus-sse-versus-websocket)
  - [9.2 SSE as a long-lived HTTP response](#9-2-sse-as-a-long-lived-http-response)
  - [9.3 SSE event format：event、id、retry、data](#9-3-sse-event-format)
  - [9.4 EventSource reconnection and Last-Event-ID](#9-4-eventsource-reconnection-and-last-event-id)
  - [9.5 SSE authentication, cookies, CORS, and credentials boundary](#9-5-sse-authentication-cookies-cors-credentials-boundary)
  - [9.6 SSE heartbeat and disconnect cleanup](#9-6-sse-heartbeat-and-disconnect-cleanup)
  - [9.7 WebSocket handshake and HTTP upgrade boundary](#9-7-websocket-handshake-and-http-upgrade-boundary)
  - [9.8 `ws` `noServer` integration with Node HTTP server](#9-8-ws-noserver-integration-with-node-http-server)
  - [9.9 WebSocket upgrade authentication and Origin check](#9-9-websocket-upgrade-authentication-and-origin-check)
  - [9.10 WebSocket message schema validation](#9-10-websocket-message-schema-validation)
  - [9.11 Connection registry：user connections, note rooms, cleanup](#9-11-connection-registry-user-connections-note-rooms-cleanup)
  - [9.12 Subscription authorization：owner check before joining a room](#9-12-subscription-authorization-owner-check-before-joining-a-room)
  - [9.13 WebSocket heartbeat：ping、pong、dead connection detection](#9-13-websocket-heartbeat-ping-pong-dead-connection-detection)
  - [9.14 Send backpressure and memory boundary](#9-14-send-backpressure-and-memory-boundary)
  - [9.15 Close codes, error messages, and safe failure behavior](#9-15-close-codes-error-messages-and-safe-failure-behavior)
  - [9.16 Domain events from REST mutations](#9-16-domain-events-from-rest-mutations)
  - [9.17 PostgreSQL durable event log](#9-17-postgresql-durable-event-log)
  - [9.18 Redis Pub/Sub fan-out and at-most-once boundary](#9-18-redis-pubsub-fan-out-and-at-most-once-boundary)
  - [9.19 Durable replay versus live delivery](#9-19-durable-replay-versus-live-delivery)
  - [9.20 Integration testing SSE and WebSocket behavior](#9-20-integration-testing-sse-and-websocket-behavior)
  - [9.21 Graceful shutdown for realtime servers](#9-21-graceful-shutdown-for-realtime-servers)
  - [9.22 Chapter integration: realtime-notes-api](#9-22-chapter-integration-realtime-notes-api)
- [10. API 与规则索引](#section-10)
- [11. 常见错误对照表](#section-11)
- [12. 调试与验证方法](#section-12)
- [13. 分项练习说明](#section-13)
- [14. 最终迷你项目](#section-14)
- [15. 知识迁移与真实项目场景](#section-15)
- [16. 本章复盘任务](#section-16)
- [17. 最终心智模型](#section-17)
- [18. 官方资料](#section-18)

<a id="code-index"></a>

## 本章代码定位索引

| 学习目标 | 文件或片段 | 可观察证据 |
|---|---|---|
| 选择实时传输 | `practices/09-realtime-sse-websocket/01-transport-choice/polling-vs-sse-vs-websocket.ts` | 输出 direction 与 lifetime 差异 |
| 建立 SSE 流 | `mini-projects/realtime-notes-api/src/sse/sse.controller.ts` | `Content-Type: text/event-stream` 与 initial event |
| 解析 Last-Event-ID | `mini-projects/realtime-notes-api/src/realtime/replay.ts` | 按 ownerId 与 sequence 查询 replay |
| 处理 WebSocket upgrade | `mini-projects/realtime-notes-api/src/websocket/websocket-upgrade.ts` | HTTP server `upgrade` 先做 Origin 与 auth |
| 验证 WebSocket message | `mini-projects/realtime-notes-api/src/websocket/websocket-message.schema.ts` | Zod discriminated union |
| 维护连接注册表 | `mini-projects/realtime-notes-api/src/websocket/websocket-registry.ts` | user connection 与 note room Map |
| 持久化事件 | `mini-projects/realtime-notes-api/prisma/schema.prisma` | `RealtimeEvent` model 与 sequence |
| 跨实例 live fan-out | `mini-projects/realtime-notes-api/src/redis/redis-pubsub.ts` | `publish` / `pSubscribe` 通知在线实例 |
| 优雅关闭 | `mini-projects/realtime-notes-api/src/server.ts` | stop upgrades, close streams, Redis, Prisma |

<a id="section-0"></a>

## 0. 章前定位

本章位于 Phase 5 的实时通信与事件投递边界。前面章节已经建立了 Node process lifecycle、streams、HTTP/Express、TypeScript backend architecture、Prisma/PostgreSQL、cookie session、CSRF/CORS、Redis 和文件流清理能力；本章只把这些能力组合到 realtime API。

本章不实现 frontend UI、React、Next.js、GraphQL subscriptions、Socket.IO final implementation、Kafka、RabbitMQ、NATS、MQTT、WebRTC、Web Push、Docker、Kubernetes 或生产负载均衡。它们只作为后续边界被提及。

<a id="section-1"></a>

## 1. 学习目标

- 能区分 polling、SSE 和 WebSocket 的方向性、连接生命周期与安全边界。
- 能用 Express 5 暴露认证 SSE 路由，并正确设置 `text/event-stream`、heartbeat、cleanup 和 replay。
- 能用 Node HTTP server `upgrade` 事件与 `ws` `noServer` 模式接管 WebSocket。
- 能在 WebSocket upgrade 阶段做 cookie-session auth 和 Origin allowlist。
- 能对每条 WebSocket message 做 JSON parse、Zod validation、owner authorization、size/backpressure/close handling。
- 能把 REST note mutation 转换为 PostgreSQL durable event log，并用 Redis Pub/Sub 做 live fan-out。
- 能说明 Redis Pub/Sub at-most-once 与 PostgreSQL durable replay 的边界。

<a id="section-2"></a>

## 2. 前置知识

- Chapter 01：`process.env`、signal、shutdown、event loop。
- Chapter 02：stream、EventEmitter、Buffer、module boundary。
- Chapter 03：HTTP request/response、Express route、middleware、error handler。
- Chapter 04：TypeScript backend layout、Zod validation、app/server split、Node test runner。
- Chapter 05：PostgreSQL、Prisma schema/client、migration、transaction boundary。
- Chapter 06：cookie session、authenticateSession、owner authorization、CSRF、CORS。
- Chapter 07：Redis client lifecycle、Pub/Sub boundary。
- Chapter 08：长响应和 stream cleanup 的资源生命周期意识。

<a id="section-3"></a>

## 3. 环境与运行基线

本章 mini project 使用 TypeScript、Express 5、Node HTTP server、`ws`、PostgreSQL、Prisma v7 style、Redis through `node-redis`、Zod、Node built-in test runner 和 Supertest。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
Set-Location D:\node.js\mini-projects\realtime-notes-api
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run seed
npm run typecheck
$env:NODE_ENV = "test"; npm test
```

</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```sh
cd mini-projects/realtime-notes-api
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run seed
npm run typecheck
NODE_ENV=test npm test
```

</div>


<a id="section-4"></a>

## 4. 第一性原理

实时 API 的第一性原理是：网络输入不可信、长连接占资源、事件要区分 durable history 与 live notification。SSE 保持 HTTP 响应打开；WebSocket 在 HTTP upgrade 后变成双向消息通道；Redis Pub/Sub 通知在线订阅者；PostgreSQL 记录可恢复事实。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Snippet: realtime boundary order</span>
  </div>

```ts
type RealtimeBoundary = "auth" | "runtime-validation" | "owner-authorization" | "durable-log" | "live-fanout" | "cleanup";

const order: RealtimeBoundary[] = [
  "auth",
  "runtime-validation",
  "owner-authorization",
  "durable-log",
  "live-fanout",
  "cleanup"
];

console.log(order.join(" -> "));
```

</div>


<a id="section-5"></a>

## 5. 技术边界模型

- Browser EventSource：只负责建立 SSE 连接、自动重连、接收事件。
- Browser WebSocket：只负责建立 socket、发送/接收 frame，不替服务器做授权。
- HTTP upgrade：由 Node HTTP server 处理，不由 Express route 处理。
- Express route：适合 REST 与 SSE GET route；Express route 不拥有 WebSocket `upgrade` event，Node HTTP server owns it。
- `ws` server：接管已验证的 socket，管理 frame、ping/pong、close。
- Connection registry：process-local，只保存当前 Node 进程内连接。
- PostgreSQL event log：保存 durable event，可用于 replay。
- Redis Pub/Sub：通知在线实例，不保存 missed messages。

<a id="section-6"></a>

## 6. 底层机制模型

实时链路可以分成两条：SSE 是 HTTP response 不结束，WebSocket 是 HTTP upgrade 后双向 frame。两者共同点是认证、授权、清理和 backpressure 都必须显式设计。

<a id="section-7"></a>

## 7. 核心术语

- `text/event-stream`：SSE 的响应媒体类型。
- `EventSource`：浏览器原生 SSE 客户端 API。
- `Last-Event-ID`：EventSource 重连时可携带的恢复点。
- `upgrade`：HTTP server 交出 socket 控制权的事件边界。
- `noServer`：`ws` 不自己创建 HTTP server，而接收外部升级后的 socket。
- `connection registry`：进程内连接索引。
- `room`：按 user 或 note 聚合连接的 fan-out 目标。
- `at-most-once`：消息最多投递一次，订阅者离线不会补发。

<a id="section-8"></a>

## 8. 本章实践路线

先通过练习文件理解传输选择、SSE 格式、WebSocket upgrade、连接注册表和事件投递边界，再阅读 `realtime-notes-api` 的完整项目代码。

- `practices/09-realtime-sse-websocket/01-transport-choice/polling-vs-sse-vs-websocket.ts`
- `practices/09-realtime-sse-websocket/01-transport-choice/transport-capability-matrix.ts`
- `practices/09-realtime-sse-websocket/01-transport-choice/connection-lifecycle-states.ts`
- `practices/09-realtime-sse-websocket/02-sse-basics/sse-response-headers.ts`
- `practices/09-realtime-sse-websocket/02-sse-basics/sse-event-format.ts`
- `practices/09-realtime-sse-websocket/02-sse-basics/sse-heartbeat.ts`
- `practices/09-realtime-sse-websocket/02-sse-basics/sse-last-event-id.ts`
- `practices/09-realtime-sse-websocket/02-sse-basics/sse-disconnect-cleanup.ts`
- `practices/09-realtime-sse-websocket/03-websocket-basics/http-upgrade-boundary.ts`
- `practices/09-realtime-sse-websocket/03-websocket-basics/ws-noserver-upgrade.ts`
- `practices/09-realtime-sse-websocket/03-websocket-basics/websocket-message-schema.ts`
- `practices/09-realtime-sse-websocket/03-websocket-basics/websocket-origin-check.ts`
- `practices/09-realtime-sse-websocket/03-websocket-basics/websocket-close-codes.ts`
- `practices/09-realtime-sse-websocket/04-connection-management/connection-registry.ts`
- `practices/09-realtime-sse-websocket/04-connection-management/user-room-subscriptions.ts`
- `practices/09-realtime-sse-websocket/04-connection-management/heartbeat-ping-pong.ts`
- `practices/09-realtime-sse-websocket/04-connection-management/send-backpressure-boundary.ts`
- `practices/09-realtime-sse-websocket/04-connection-management/graceful-connection-shutdown.ts`
- `practices/09-realtime-sse-websocket/05-event-delivery/domain-event-model.ts`
- `practices/09-realtime-sse-websocket/05-event-delivery/postgres-event-log.ts`
- `practices/09-realtime-sse-websocket/05-event-delivery/redis-pubsub-fanout.ts`
- `practices/09-realtime-sse-websocket/05-event-delivery/at-most-once-boundary.ts`
- `practices/09-realtime-sse-websocket/05-event-delivery/event-replay-from-last-id.ts`

<a id="section-9"></a>

## 9. 核心教学


<a id="9-1-polling-versus-sse-versus-websocket"></a>

### 9.1 Polling versus SSE versus WebSocket

#### 结论

Polling 是重复的一次性请求；SSE 是服务器到浏览器的长期 HTTP 流；WebSocket 是升级后的双向 socket。选择标准不是“哪个更实时”，而是方向性、连接寿命、浏览器原语、重连行为和服务端资源成本是否匹配。

#### 本节解决的问题

本节要解决的是 transport selection：客户端是否需要主动发命令，服务器是否只需要推事件，连接是否会长期存在，以及浏览器原生能力能否承担重连。durable event log 和 Redis fan-out 只作为后续章节的短对比，这里不展开完整投递链。

#### 技术意义

传输选错会直接改变服务器的并发模型。低频状态确认用 polling 可以保持资源简单；持续服务端通知用 SSE 可以避免双向协议复杂度；需要 presence、订阅命令或协同编辑时才需要 WebSocket。

#### 概念解释

把三种方案拆成六个维度：directionality、connection lifetime、server resource cost、browser primitive、reconnection behavior、best-fit use case。`fetch` 每次请求都会结束；`EventSource` 自动重连但只能接收；`WebSocket` 可以双向发送但需要自己设计协议和心跳。

#### 底层机制

Node 端看到的入口不同：polling 是普通 Express request/response，SSE 是保持 response 打开的 GET，WebSocket 则先是 HTTP request，随后由 HTTP server 的 `upgrade` 事件转移到 socket。连接寿命越长，清理、认证和 backpressure 越不能省略。

#### API / 语法规则

- `fetch` 适合短请求；失败后由调用方再次发起。
- `EventSource` 适合 `text/event-stream`，浏览器负责基础重连。
- `WebSocket` 适合双向消息，需要应用层 message schema。
- PostgreSQL replay 和 Redis Pub/Sub 是事件交付层，不是 transport choice 本身。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/09-realtime-sse-websocket/01-transport-choice/polling-vs-sse-vs-websocket.ts</span>
  </div>

```ts
type Transport = "polling" | "sse" | "websocket";

type TransportDescription = {
  transport: Transport;
  direction: "request-response" | "server-to-client" | "bidirectional";
  connectionLifetime: "short" | "long";
  browserPrimitive: string;
};

const transports: TransportDescription[] = [
  {
    transport: "polling",
    direction: "request-response",
    connectionLifetime: "short",
    browserPrimitive: "fetch"
  },
  {
    transport: "sse",
    direction: "server-to-client",
    connectionLifetime: "long",
    browserPrimitive: "EventSource"
  },
  {
    transport: "websocket",
    direction: "bidirectional",
    connectionLifetime: "long",
    browserPrimitive: "WebSocket"
  }
];

for (const transport of transports) {
  console.log(`${transport.transport}: ${transport.direction}, ${transport.connectionLifetime}, ${transport.browserPrimitive}`);
}
```

</div>

#### 逐行解释

代码把 transport 的关键属性做成表格，因此你可以看到选择依据来自 runtime 行为，而不是来自库名。`direction` 判断消息方向，`connectionLifetime` 暗示资源占用，`browserPrimitive` 说明浏览器端使用哪个 API。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run typecheck
node --import tsx practices/09-realtime-sse-websocket/01-transport-choice/polling-vs-sse-vs-websocket.ts
```

</div>

#### 预期输出或消息

运行后应看到三行 transport 分类：`polling` 是 request-response，`sse` 是 server-to-client，`websocket` 是 bidirectional。这个输出只证明选择维度，不证明认证、授权或事件持久化。

#### 对照与常见错误

常见错误是因为“实时”二字直接选择 WebSocket。若客户端并不需要向服务器持续发命令，WebSocket 会额外引入 upgrade auth、Origin check、message validation、heartbeat 和 backpressure 成本。

#### 真实项目关系

`realtime-notes-api` 同时保留 SSE 与 WebSocket，是为了让 notes 更新通知和订阅命令走不同能力边界，而不是把所有实时需求塞进一个协议。

#### 当前学习路径关系

这一节把前面 HTTP、stream 和 process lifecycle 知识放到传输选择层；后续 9.2–9.22 再分别展开每个运行时边界。

#### 最终心智模型

先判断消息方向，再判断连接寿命，最后判断服务器愿意承担的长期状态；transport 是资源模型选择，不是功能装饰。
<a id="9-2-sse-as-a-long-lived-http-response"></a>

### 9.2 SSE as a long-lived HTTP response

#### 结论

SSE 的本质是 `text/event-stream` 长响应，不是普通 JSON API。Express 在这里负责认证后的 GET route、response headers、初始写入和连接生命周期入口。

#### 本节解决的问题

本节解决的是为什么 SSE response 不能像 REST 一样 `res.json()` 后结束。服务器要把 HTTP response 保持打开，让浏览器在同一条连接上连续解析事件帧。

#### 技术意义

只要 response 不结束，Node 进程就持有 socket、response object 和相关计时器。正确设置 header 和关闭策略，才能让代理、浏览器和服务器都按 stream 语义工作。

#### 概念解释

`text/event-stream` 告诉客户端 body 是事件流；`Cache-Control: no-cache` 避免中间层缓存；`Connection: keep-alive` 表达长连接意图。SSE 仍然是 HTTP 响应，只是 body 按事件帧逐步写出。

#### 底层机制

Express route 接收到请求后写入 SSE header，随后调用 `response.write()` 发送事件片段而不是调用 `response.end()` 结束请求。浏览器 `EventSource` 会在 body 中按空行分隔事件。

#### API / 语法规则

- `response.setHeader("Content-Type", "text/event-stream")` 建立流格式。
- `response.flushHeaders?.()` 可以尽早发送 headers。
- `response.write(...)` 追加事件片段。
- `request.on("close", ...)` 用于后续清理。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/09-realtime-sse-websocket/02-sse-basics/sse-response-headers.ts</span>
  </div>

```ts
import { createServer } from "node:http";

const server = createServer((request, response) => {
  if (request.url !== "/events") {
    response.writeHead(404).end();
    return;
  }

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  response.write("event: connection.ready\n");
  response.write('data: {"connectionId":"demo"}\n\n');
});

server.listen(0, () => {
  const address = server.address();
  console.log(address);
  server.close();
});
```

</div>

#### 逐行解释

示例重点是 header 与 open response：先声明 event-stream，再写入 initial event。代码没有返回 JSON，因为 JSON response 的完成条件是整个 body 结束，而 SSE 的完成条件由连接生命周期决定。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run typecheck
node --import tsx practices/09-realtime-sse-websocket/02-sse-basics/sse-response-headers.ts
```

</div>

#### 预期输出或消息

运行输出应展示 SSE headers 和 initial event 片段。你应该看到的是多行事件文本，而不是一个 JSON object。

#### 对照与常见错误

常见错误是在 SSE route 中调用 `res.json()` 或写完一次后 `res.end()`。这样浏览器只能得到一次响应，后续服务器推送就没有可写通道。

#### 真实项目关系

项目中的 `/events` 和 `/events/notes/:noteId` 都由 Express 先完成 session auth，再把 response 注册到 SSE registry。

#### 当前学习路径关系

本节承接 Chapter 03 的 HTTP response 和 Chapter 08 的长响应清理，为 9.3 的事件帧格式打基础。

#### 最终心智模型

SSE 是一个保持打开的 HTTP body；Express 负责打开门，事件格式负责后续消息边界。
<a id="9-3-sse-event-format-event-id-retry-data"></a>

### 9.3 SSE event format：event、id、retry、data

#### 结论

SSE 消息不是裸 JSON，而是由 `event:`、`id:`、`retry:`、多行 `data:` 和空行结束符组成的文本帧。JSON 只能作为 `data:` 字段的内容。

#### 本节解决的问题

本节解决的是服务器到底要写什么字节。浏览器不会把任意 JSON body 当作 SSE；它按行读取字段，并在遇到空行时提交一个完整事件。

#### 技术意义

事件格式错误会导致 EventSource 无法触发预期 listener，或者丢失 resume id。对于 replay、分类处理和重连延迟来说，字段名称本身就是协议的一部分。

#### 概念解释

`event` 决定客户端监听的事件名；`id` 更新浏览器保存的 last event id；`retry` 提示重连延迟；每一行 payload 都必须带 `data:` 前缀；空行表示当前事件结束。

#### 底层机制

Node 写出的是 UTF-8 文本。多行 payload 不能直接插入原始换行，而要拆成多条 `data:` 行。浏览器把连续 `data:` 行合并后再交给应用层解析。

#### API / 语法规则

- 字段语法是 `name: value`，字段名必须在行首。
- 事件之间用一个空行分隔。
- 多行 payload 要逐行加 `data:`。
- 裸 JSON 不包含 SSE 字段，浏览器不会把它识别为命名事件。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/09-realtime-sse-websocket/02-sse-basics/sse-event-format.ts</span>
  </div>

```ts
type SseEvent = {
  id?: string;
  event?: string;
  retry?: number;
  data: unknown;
};

export function formatSseEvent(input: SseEvent): string {
  const lines: string[] = [];
  if (input.id) lines.push(`id: ${input.id}`);
  if (input.event) lines.push(`event: ${input.event}`);
  if (input.retry !== undefined) lines.push(`retry: ${input.retry}`);

  const serialized = typeof input.data === "string" ? input.data : JSON.stringify(input.data);
  for (const line of serialized.split(/\r?\n/)) {
    lines.push(`data: ${line}`);
  }

  return `${lines.join("\n")}\n\n`;
}

console.log(formatSseEvent({ id: "123", event: "note.updated", data: { noteId: "n1" } }));
```

</div>

#### 逐行解释

示例函数把事件名、序列 id、重连时间和 JSON payload 拼成 SSE frame。关键点是 payload 先序列化，再按行补 `data:`，最后补一个空行。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run typecheck
node --import tsx practices/09-realtime-sse-websocket/02-sse-basics/sse-event-format.ts
```

</div>

#### 预期输出或消息

输出应包含 `event: ...`、`id: ...`、可选 `retry: ...`、一行或多行 `data: ...`，并以空行结束。

#### 对照与常见错误

常见错误是直接 `response.write(JSON.stringify(payload))`。这会写出文本，但不是 SSE frame，浏览器端 `addEventListener(eventName, ...)` 不会按预期收到命名事件。

#### 真实项目关系

项目的 SSE service 用统一 formatter 输出 domain events，保证 REST mutation 产生的事件在浏览器端有稳定名称和可恢复 id。

#### 当前学习路径关系

本节把 Chapter 02 的文本流写入能力连接到浏览器事件解析规则，为 9.4 的 Last-Event-ID 重连做准备。

#### 最终心智模型

SSE 的协议边界在“每一行文本”上；JSON 是 payload，不是整个传输格式。
<a id="9-4-eventsource-reconnection-and-last-event-id"></a>

### 9.4 EventSource reconnection and Last-Event-ID

#### 结论

`Last-Event-ID` 是浏览器在重连时提供的恢复提示，不是可信授权凭证。服务端必须用 authenticated ownerId 和 sequence 一起过滤 replay。

#### 本节解决的问题

本节解决断线后的事件恢复：浏览器会自动重新连接，但服务器要决定从哪个 sequence 之后读取历史事件，以及这些事件是否属于当前用户。

#### 技术意义

如果只信任客户端传来的 id，攻击者可以伪造较早或较晚的 resume point，尝试读取不属于自己的事件或跳过安全检查。

#### 概念解释

EventSource 保存最后一个成功事件的 `id`，重连时通过 `Last-Event-ID` header 发送给服务器。这个值只能定位顺序，不能证明资源所有权。

#### 底层机制

服务端解析 header 后，把它转成数据库 sequence 下界，再加上 session 中的 ownerId 查询 durable event log。replay 返回的是当前用户在该 sequence 之后可见的事件。

#### API / 语法规则

- 浏览器自动发起 EventSource reconnect。
- `Last-Event-ID` 来自客户端请求 header。
- replay 查询必须同时使用 owner filter 和 sequence filter。
- 无效 id 应降级为安全起点或拒绝，而不是直接拼入查询。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/09-realtime-sse-websocket/02-sse-basics/sse-last-event-id.ts</span>
  </div>

```ts
function parseLastEventId(value: string | undefined): bigint | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  return BigInt(trimmed);
}

const incomingHeader = "42";
const afterSequence = parseLastEventId(incomingHeader);
console.log({ afterSequence: afterSequence?.toString() });
```

</div>

#### 逐行解释

示例展示的是 resume hint 的解析和 owner-scoped 查询输入。重点不是 header 名称，而是这个 header 在进入数据库前必须经过类型转换和授权范围约束。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run typecheck
node --import tsx practices/09-realtime-sse-websocket/02-sse-basics/sse-last-event-id.ts
```

</div>

#### 预期输出或消息

运行输出应显示 after-sequence 与 ownerId 一起参与 replay lookup。不会输出其他用户事件，也不会把客户端 id 当成认证结果。

#### 对照与常见错误

常见错误是把 `Last-Event-ID` 当成服务器签发的可信游标。正确做法是把它视为用户可控输入，只用于 owner-scoped replay 的排序下界。

#### 真实项目关系

`realtime-notes-api` 的 SSE replay 在打开连接后读取 PostgreSQL `RealtimeEvent`，并按当前 session user 过滤。

#### 当前学习路径关系

本节连接 Chapter 06 的 session auth 和 Chapter 05 的数据库查询边界，后续 9.17 会定义 durable event log 的真实来源。

#### 最终心智模型

重连恢复只恢复“位置”，不恢复“权限”；权限必须从当前 session 和数据库 owner 关系重新计算。
<a id="9-5-sse-authentication-cookies-cors-and-credentials-boundary"></a>

### 9.5 SSE authentication, cookies, CORS, and credentials boundary

#### 结论

SSE 可以复用 same-origin cookie session；跨源时必须显式允许 credentials，且不能使用 wildcard CORS。EventSource 也不能像 `fetch` 一样随意带自定义 header。

#### 本节解决的问题

本节解决浏览器创建 SSE 连接时认证材料如何进入请求。cookie 可以随请求发送，但跨源策略决定浏览器是否允许这条 credentialed stream 暴露给页面。

#### 技术意义

SSE 是长期连接，错误 CORS 会长期暴露认证通道；错误 header 假设会让认证方案在浏览器里根本无法实现。

#### 概念解释

same-origin EventSource 默认携带对应 cookie；cross-origin EventSource 需要 `withCredentials: true`，服务端必须返回具体 `Access-Control-Allow-Origin` 和 `Access-Control-Allow-Credentials: true`。`*` 不能和 credentialed response 搭配。

#### 底层机制

浏览器先执行 CORS 检查，再决定脚本能否读取 stream。服务端 Express middleware 从 cookie 解析 session；如果认证失败，应在建立长响应前返回普通错误。

#### API / 语法规则

- `new EventSource(url, { withCredentials: true })` 只处理 credentials 标志。
- EventSource 标准接口不提供任意 custom header 参数。
- credentialed CORS 必须返回具体 origin。
- SSE auth 应尽量在写入 event-stream header 之前完成。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/middleware/cors.ts</span>
  </div>

```ts
import cors from "cors";
import { config } from "../../config/env.js";

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin is not allowed."));
  },
  allowedHeaders: ["content-type", "x-csrf-token", "last-event-id"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
});
```

</div>

#### 逐行解释

示例把 allowed origin 与 credential flag 分开判断。它强调的是浏览器安全模型：cookie 是否发送、响应是否暴露、服务端是否接受，是三个不同判断。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应区分 same-origin、allowed credentialed cross-origin 和 rejected wildcard cases。结果不应显示 cookie 值或 session secret。

#### 对照与常见错误

常见错误是希望通过 EventSource 发送 `Authorization` custom header。浏览器原生 EventSource 不支持这种 fetch 风格配置，通常要改用 cookie、短期 URL token 或不同 transport。

#### 真实项目关系

项目沿用前面章节的 cookie session 和 CORS allowlist，让 SSE 连接在认证之后才进入 registry。

#### 当前学习路径关系

本节复用 Chapter 06 的 cookie/CORS/CSRF 区分，并为 9.9 的 WebSocket Origin check 提供对照。

#### 最终心智模型

SSE 认证边界由浏览器 credentials 策略和服务端 cookie session 共同决定；CORS 不是认证，但会决定页面能否读取结果。
<a id="9-6-sse-heartbeat-and-disconnect-cleanup"></a>

### 9.6 SSE heartbeat and disconnect cleanup

#### 结论

SSE heartbeat 是一个长期 timer，disconnect cleanup 必须在 request close 时清除 timer、注销 response，并停止后续写入。

#### 本节解决的问题

本节解决长期响应静默断开后的资源回收。没有 heartbeat，代理可能关闭空闲连接；没有 cleanup，Node 进程会保留不可写 response 和 interval。

#### 技术意义

长连接问题通常不是一次请求失败，而是内存、timer 和 socket 数量缓慢增长。SSE cleanup 是实时服务最早需要建立的资源纪律。

#### 概念解释

heartbeat 可以是 SSE comment 或轻量 event，用来保持链路活跃并暴露连接状态；`request.on("close")` 是客户端断开时服务器侧最可靠的清理信号之一。

#### 底层机制

建立连接时注册 response 和 interval；interval 周期性 `write` heartbeat；request close 触发 `clearInterval`、registry delete 和停止写入。任何一环漏掉都会留下进程内状态。

#### API / 语法规则

- `setInterval` 需要保存 handle。
- `response.write(...)` 只能在连接仍可写时使用。
- `request.on("close", cleanup)` 绑定生命周期。
- `clearInterval(handle)` 防止 timer leak。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/09-realtime-sse-websocket/02-sse-basics/sse-disconnect-cleanup.ts</span>
  </div>

```ts
import { EventEmitter } from "node:events";

type Connection = {
  id: string;
  heartbeat: NodeJS.Timeout;
};

const activeConnections = new Map<string, Connection>();
const request = new EventEmitter();

function register(connection: Connection): void {
  activeConnections.set(connection.id, connection);
  request.once("close", () => {
    clearInterval(connection.heartbeat);
    activeConnections.delete(connection.id);
  });
}

register({ id: "conn-1", heartbeat: setInterval(() => undefined, 1000) });
request.emit("close");
console.log(activeConnections.size);
```

</div>

#### 逐行解释

示例用显式 cleanup 函数收束所有副作用。你应该检查 timer 的创建点、response 的注册点和 close handler 是否引用同一份状态。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run typecheck
node --import tsx practices/09-realtime-sse-websocket/02-sse-basics/sse-disconnect-cleanup.ts
```

</div>

#### 预期输出或消息

输出或测试应能观察到 heartbeat 写入，并在 close 后看到 registry size 下降、timer 不再触发。

#### 对照与常见错误

常见错误是只删除连接 Map，却忘记清理 interval。表面上连接数量正常，实际进程仍有 timer 持续运行。

#### 真实项目关系

`realtime-notes-api` 的 SSE registry 在用户级和 note 级 stream 中都需要 close cleanup，否则多标签页和断网重连会留下陈旧 response。

#### 当前学习路径关系

本节把 Chapter 01 的 timer/process lifecycle 和 Chapter 08 的长流清理应用到 SSE。

#### 最终心智模型

每打开一条长响应，就必须同时定义一条关闭路径；heartbeat 是保活机制，不是清理机制本身。
<a id="9-7-websocket-handshake-and-http-upgrade-boundary"></a>

### 9.7 WebSocket handshake and HTTP upgrade boundary

#### 结论

WebSocket 从 HTTP 请求开始，但真正接管点是 Node HTTP server 的 `upgrade` 事件；普通 Express route handler 不拥有升级后的 socket。

#### 本节解决的问题

本节解决 `/ws` 为什么不能只写成 `app.get("/ws", ...)`。WebSocket handshake 要求服务器从 HTTP 协议切换到 WebSocket 帧协议，socket 所有权会发生转移。

#### 技术意义

如果把 upgrade 当作普通 route，就会把认证、路径判断和错误响应放在错误层级，导致 socket 已经进入协议切换时才发现无法处理。

#### 概念解释

浏览器先发送带 `Upgrade: websocket` 的 HTTP request；Node HTTP server 发出 `upgrade` event；通过校验后，WebSocket library 才接管 raw socket。Express middleware 只处理普通 request/response pipeline。

#### 底层机制

HTTP server 在 parser 识别 upgrade header 后不再走常规 response body。应用必须在 upgrade listener 中决定 accept 或 destroy socket，accept 后消息变成 WebSocket frame。

#### API / 语法规则

- `httpServer.on("upgrade", handler)` 是入口。
- `request.url` 用于判断 path。
- 未通过校验时应写入最小 HTTP 错误或直接 destroy。
- 升级后的 socket 不再由 Express error middleware 处理。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/09-realtime-sse-websocket/03-websocket-basics/http-upgrade-boundary.ts</span>
  </div>

```ts
import { createServer } from "node:http";

const server = createServer();

server.on("request", (_request, response) => {
  response.writeHead(404).end();
});

server.on("upgrade", (request, socket) => {
  console.log(`upgrade requested for ${request.url}`);
  socket.write("HTTP/1.1 426 Upgrade Required\r\nConnection: close\r\n\r\n");
  socket.destroy();
});

server.listen(0, () => {
  console.log(server.address());
  server.close();
});
```

</div>

#### 逐行解释

示例把 Express app 和 HTTP server 分离，说明 WebSocket 需要在 server 层监听 `upgrade`。代码重点是 socket 接管位置，而不是业务消息处理。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run typecheck
node --import tsx practices/09-realtime-sse-websocket/03-websocket-basics/http-upgrade-boundary.ts
```

</div>

#### 预期输出或消息

运行输出应显示 upgrade path 被 server 层识别。不会出现 Express route 处理 WebSocket frame 的行为。

#### 对照与常见错误

常见错误是认为注册 `GET /ws` 就完成 WebSocket endpoint。实际 WebSocket 客户端需要的是协议升级，不是一个返回 200 的 HTTP body。

#### 真实项目关系

项目的 `server.ts` 创建 HTTP server 后集中处理 `/ws` upgrade，再把通过校验的 socket 交给 realtime WebSocket 模块。

#### 当前学习路径关系

本节复用 Chapter 03 的 app/server split，并为 9.8 的 `ws` `noServer` 集成建立入口。

#### 最终心智模型

WebSocket 的第一道边界在 HTTP server，不在 Express route；升级成功后，通信模型已经换了。
<a id="9-8-ws-noserver-integration-with-node-http-server"></a>

### 9.8 `ws` `noServer` integration with Node HTTP server

#### 结论

`noServer` 让应用先完成 path、Origin 和 auth 判断，再调用 `handleUpgrade`。没有通过校验的请求不应该交给 `WebSocketServer`。

#### 本节解决的问题

本节解决如何把 `ws` 嵌入已有 Express HTTP server，而不是让 WebSocket server 盲目接受所有 upgrade。

#### 技术意义

在真实 API 中，WebSocket endpoint 通常共享同一个端口和 session cookie。`noServer` 模式让安全边界保留在应用代码中，而不是交给默认监听器。

#### 概念解释

`new WebSocketServer({ noServer: true })` 不自己监听端口。应用在 `upgrade` handler 中筛选请求，只有通过后才调用 `handleUpgrade(request, socket, head, callback)`。

#### 底层机制

校验失败时 socket 仍是 HTTP upgrade socket，可以安全拒绝；调用 `handleUpgrade` 后，`ws` 会完成 handshake 并创建 WebSocket 对象，此时再拒绝就只能走 close frame。

#### API / 语法规则

- `noServer: true` 禁用自动 server binding。
- `handleUpgrade` 只能调用一次。
- path、Origin、session auth 应在 `handleUpgrade` 之前完成。
- 通过后通常触发自定义 `connection` 分发。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">practices/09-realtime-sse-websocket/03-websocket-basics/ws-noserver-upgrade.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

const server = createServer();
const websocketServer = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  if (request.url !== "/ws") {
    socket.destroy();
    return;
  }

  websocketServer.handleUpgrade(request, socket, head, (websocket) => {
    websocketServer.emit("connection", websocket, request);
  });
});

console.log(websocketServer.options.noServer);
server.close();
```

</div>

#### 逐行解释

示例把 accept 条件放在 `handleUpgrade` 之前。你应该关注失败分支是否提前返回，避免同一个 socket 既被拒绝又被升级。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run typecheck
node --import tsx practices/09-realtime-sse-websocket/03-websocket-basics/ws-noserver-upgrade.ts
```

</div>

#### 预期输出或消息

输出应区分 rejected upgrade 与 accepted upgrade。只有 accepted case 才会创建 WebSocket connection。

#### 对照与常见错误

常见错误是先 `handleUpgrade` 再检查 Origin 或 session。这样攻击请求已经完成协议切换，失败处理只能依赖应用层 close，安全边界变晚。

#### 真实项目关系

`realtime-notes-api` 使用 `noServer` 是为了让 `/ws` 与普通 REST API 共用 HTTP server，同时在升级前复用安全策略。

#### 当前学习路径关系

本节承接 9.7 的 upgrade 入口，并把 9.9 的认证与 Origin 判断放到正确调用顺序中。

#### 最终心智模型

`handleUpgrade` 是不可逆的门槛；门槛前做准入检查，门槛后才处理 WebSocket messages。
<a id="9-9-websocket-upgrade-authentication-and-origin-check"></a>

### 9.9 WebSocket upgrade authentication and Origin check

#### 结论

Cookie-authenticated WebSocket 必须在 upgrade 阶段提取 session 并检查 Origin allowlist；未通过时要在协议切换前拒绝。

#### 本节解决的问题

本节解决浏览器页面能否借用户 cookie 发起跨站 WebSocket。WebSocket 不受 CORS 预检保护，Origin check 是 cookie-authenticated WS 的关键防线。

#### 技术意义

如果只验证 cookie 而不验证 Origin，第三方站点可能诱导浏览器带上用户 cookie 建立 WebSocket，形成 cross-site WebSocket hijacking 风险。

#### 概念解释

upgrade request 仍包含 HTTP headers，包括 `cookie` 和 `origin`。服务端可以从 cookie 解析 session id，再把 Origin 与配置 allowlist 比对。两者都通过后才允许 `handleUpgrade`。

#### 底层机制

session extraction 在 raw `IncomingMessage` 上完成；Origin 是用户代理声明的页面来源。拒绝时 socket 不进入 WebSocket frame 层，因此不会出现业务消息或 close code。

#### API / 语法规则

- 从 `request.headers.cookie` 解析 session cookie。
- 从 `request.headers.origin` 做 allowlist 判断。
- 拒绝应发生在 `handleUpgrade` 之前。
- 不要把 Origin check 当成用户认证；它只约束页面来源。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-upgrade.ts</span>
  </div>

```ts
import type { Server } from "node:http";
import type { Duplex } from "node:stream";
import { authenticateWebSocketRequest } from "./websocket-auth.js";
import { isAllowedWebSocketOrigin } from "./websocket-origin.js";
import type { RealtimeWebSocketServer } from "./websocket-server.js";

export type WebSocketUpgradeController = {
  stopAccepting: () => void;
};

function rejectUpgrade(socket: Duplex, statusCode: number, reasonPhrase: string): void {
  socket.write(`HTTP/1.1 ${statusCode} ${reasonPhrase}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
}

export function installWebSocketUpgrade(server: Server, realtimeServer: RealtimeWebSocketServer): WebSocketUpgradeController {
  let accepting = true;

  server.on("upgrade", async (request, socket, head) => {
    if (!accepting) {
      rejectUpgrade(socket, 503, "Service Unavailable");
      return;
    }

    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    if (pathname !== "/ws") {
      rejectUpgrade(socket, 404, "Not Found");
      return;
    }

    if (!isAllowedWebSocketOrigin(request.headers.origin)) {
      rejectUpgrade(socket, 403, "Forbidden");
      return;
    }

    const auth = await authenticateWebSocketRequest(request);
    if (!auth) {
      rejectUpgrade(socket, 401, "Unauthorized");
      return;
    }

    realtimeServer.handleUpgrade(request, socket, head, auth);
  });

  return {
    stopAccepting: () => {
      accepting = false;
    }
  };
}
```

</div>

#### 逐行解释

示例把 cookie session 和 Origin 分成两个失败分支。这样可以保持错误处理稳定，同时避免把 session secret、token hash 或内部错误写给客户端。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应显示 missing session、disallowed origin 和 accepted upgrade 三类结果。安全输出只需要 code，不需要泄露 cookie 内容。

#### 对照与常见错误

常见错误是认为 WebSocket 与 fetch 一样自动受 CORS 限制。浏览器会发送 Origin，但服务端必须自己检查并拒绝不在 allowlist 中的来源。

#### 真实项目关系

项目的 `/ws` upgrade 在创建 connection registry 条目前先完成 session 和 Origin 校验。

#### 当前学习路径关系

本节把 Chapter 06 的 cookie session 与 CORS 思维迁移到 WebSocket，但实现点从 Express middleware 转到 HTTP upgrade listener。

#### 最终心智模型

WebSocket upgrade auth 有两个问题：这个用户是谁，以及这个浏览器页面是否被允许代表他打开连接。
<a id="9-10-websocket-message-schema-validation"></a>

### 9.10 WebSocket message schema validation

#### 结论

WebSocket message 是网络字节，不是 TypeScript object。服务端必须按 bytes -> string -> JSON -> Zod discriminated union 的顺序建立 runtime boundary。

#### 本节解决的问题

本节解决升级成功后的每条消息如何进入业务逻辑。连接认证只证明 socket 属于某个 session，不证明后续 payload 结构正确。

#### 技术意义

TypeScript 只约束本地源码；远端发送的 frame 可能是二进制、非法 JSON、缺字段 JSON 或业务上不允许的命令。runtime validation 是协议稳定性的基础。

#### 概念解释

先把 `RawData` 转成 string，再 `JSON.parse`。JSON 解析成功后仍只是 unknown，需要用 Zod discriminated union 按 `type` 字段区分 `subscribe.note`、`unsubscribe.note`、`presence.note` 等消息。

#### 底层机制

invalid JSON 应得到 parse failure；valid JSON but invalid schema 应得到 validation failure。两类错误都不能进入 owner authorization 或 mutation 逻辑。

#### API / 语法规则

- `message` event 提供 raw payload。
- `JSON.parse` 只验证 JSON 语法。
- `z.discriminatedUnion("type", [...])` 验证消息形状。
- TypeScript narrowing 只在 Zod parse 成功后才可信。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-message.schema.ts</span>
  </div>

```ts
import { z } from "zod";

const requestIdSchema = z.string().uuid();
const noteIdSchema = z.string().uuid();

export const websocketClientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("subscribe.note"),
    requestId: requestIdSchema,
    noteId: noteIdSchema
  }),
  z.object({
    type: z.literal("unsubscribe.note"),
    requestId: requestIdSchema,
    noteId: noteIdSchema
  }),
  z.object({
    type: z.literal("presence.note"),
    requestId: requestIdSchema,
    noteId: noteIdSchema,
    cursor: z.object({
      line: z.number().int().nonnegative(),
      column: z.number().int().nonnegative()
    })
  })
]);

export type WebSocketClientMessage = z.infer<typeof websocketClientMessageSchema>;
```

</div>

#### 逐行解释

示例的关键路径是从 unknown 到 typed command。你应该检查每个失败分支是否产生安全 error message，并且没有把原始异常透传给客户端。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

运行结果应区分 invalid JSON、invalid schema 和 accepted typed message。accepted message 才能访问 `noteId`、`requestId` 等字段。

#### 对照与常见错误

常见错误是把 `JSON.parse` 的返回值直接断言成 TypeScript 类型。断言不会验证网络输入，只会让错误更晚出现在业务代码中。

#### 真实项目关系

`realtime-notes-api` 的 WebSocket protocol 用 Zod 统一验证 client messages，再把通过的 command 交给订阅和 presence handler。

#### 当前学习路径关系

本节复用 Chapter 04 的 Zod boundary，但输入来源从 HTTP JSON body 变成 WebSocket frame。

#### 最终心智模型

升级建立的是通道，不是类型安全；每条消息都要重新跨过 runtime validation 边界。
<a id="9-11-connection-registry-user-connections-note-rooms-cleanup"></a>

### 9.11 Connection registry：user connections, note rooms, cleanup

#### 结论

Connection registry 是进程内 `Map` 状态，用来追踪 connection id、user id、session id、socket、订阅 note ids 和 cleanup。它不是数据库，也不是跨实例共享状态。

#### 本节解决的问题

本节解决服务器如何知道某个用户当前有哪些 live connections，以及某个 note room 中应该给哪些 socket fan-out。

#### 技术意义

长期连接需要可删除、可遍历、可按资源分组的状态。没有 registry，服务器只能持有 socket 引用，无法做用户级通知、room fan-out 或断开清理。

#### 概念解释

registry 通常包含多个索引：按 connectionId 找 connection，按 userId 找该用户连接集合，按 noteId 找订阅该 note 的连接集合。所有索引都必须在 close 时同步删除。

#### 底层机制

这是 process-local memory。单进程内查找很快，但重启会丢失，多个 Node 实例之间也不会共享。跨实例 live fan-out 需要 Redis Pub/Sub，历史恢复需要 PostgreSQL。

#### API / 语法规则

- `Map<string, Connection>` 保存连接实体。
- `Set<string>` 保存 user 或 note 下的 connection ids。
- connection entity 应包含 `socket`、`userId`、`sessionId`、`subscribedNoteIds`。
- cleanup 必须删除所有反向索引。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-registry.ts</span>
  </div>

```ts
import WebSocket from "ws";
import { config } from "../config/env.js";
import type { AuthContext } from "../shared/auth/auth-context.js";
import type { StoredRealtimeEvent } from "../realtime/events.js";
import { toClientRealtimeEvent } from "../realtime/events.js";
import { sendJsonWithBackpressure } from "./websocket-send.js";

export type WebSocketConnection = {
  connectionId: string;
  userId: string;
  sessionId: string;
  socket: WebSocket;
  subscribedNoteIds: Set<string>;
  isAlive: boolean;
};

export class WebSocketRegistry {
  private readonly connections = new Map<string, WebSocketConnection>();

  add(connectionId: string, auth: AuthContext, socket: WebSocket): WebSocketConnection {
    const connection: WebSocketConnection = {
      connectionId,
      userId: auth.userId,
      sessionId: auth.sessionId,
      socket,
      subscribedNoteIds: new Set(),
      isAlive: true
    };
    this.connections.set(connectionId, connection);
    return connection;
  }

  get(connectionId: string): WebSocketConnection | undefined {
    return this.connections.get(connectionId);
  }

  remove(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  markAlive(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) connection.isAlive = true;
  }

  subscribeNote(connectionId: string, noteId: string): void {
    this.connections.get(connectionId)?.subscribedNoteIds.add(noteId);
  }

  unsubscribeNote(connectionId: string, noteId: string): void {
    this.connections.get(connectionId)?.subscribedNoteIds.delete(noteId);
  }

  entries(): Iterable<WebSocketConnection> {
    return this.connections.values();
  }

  sendToUser(userId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.userId === userId) {
        sendJsonWithBackpressure(connection.socket, toClientRealtimeEvent(event), config.WS_BACKPRESSURE_LIMIT_BYTES);
      }
    }
  }

  sendToNote(noteId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.subscribedNoteIds.has(noteId)) {
        sendJsonWithBackpressure(connection.socket, toClientRealtimeEvent(event), config.WS_BACKPRESSURE_LIMIT_BYTES);
      }
    }
  }

  sendMessageToNote(noteId: string, message: unknown): void {
    for (const connection of this.connections.values()) {
      if (connection.subscribedNoteIds.has(noteId)) {
        sendJsonWithBackpressure(connection.socket, message, config.WS_BACKPRESSURE_LIMIT_BYTES);
      }
    }
  }

  closeAll(code: number, reason: string): void {
    for (const connection of this.connections.values()) {
      connection.socket.close(code, reason);
    }
    this.connections.clear();
  }

  size(): number {
    return this.connections.size;
  }
}

export const websocketRegistry = new WebSocketRegistry();
```

</div>

#### 逐行解释

示例展示多个 Map/Set 如何指向同一个 connection id。阅读时要确认 add 和 remove 是否成对，否则 room 中会留下死连接 id。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应能显示注册后 registry size 增加，订阅后 note room 包含 connection id，cleanup 后相关索引都为空。

#### 对照与常见错误

常见错误是只从主 Map 删除 connection，却忘记从 user index 或 note room 中删除 id。下一次 fan-out 会访问不存在的 socket。

#### 真实项目关系

项目用 registry 支持用户级 SSE/WS 通知和 note-level subscriptions，同时把 Redis 收到的 live event 分发给本进程连接。

#### 当前学习路径关系

本节把 Chapter 01 的 process memory 和 Chapter 07 的跨进程通知边界区分开，为 9.18 的 Redis fan-out 做铺垫。

#### 最终心智模型

registry 回答“本进程现在连着谁”；它不能回答“历史发生过什么”或“其他实例连着谁”。
<a id="9-12-subscription-authorization-owner-check-before-joining-a-room"></a>

### 9.12 Subscription authorization：owner check before joining a room

#### 结论

订阅 note room 前必须做 owner check。room name、noteId 格式和已认证 socket 都不能证明当前用户有权接收该 note 的事件。

#### 本节解决的问题

本节解决用户通过 WebSocket 发送 `subscribe.note` 时，服务器何时判断资源归属。答案是在加入 room 之前，而不是加入后再过滤。

#### 技术意义

订阅授权一旦遗漏，后续每次 fan-out 都可能把私有 note 更新发给错误用户。长期连接会放大一次授权错误的影响范围。

#### 概念解释

connection auth 证明用户身份；subscription authorization 证明这个用户能访问某个 note。二者发生在不同时间，也需要不同数据：session userId 与数据库中的 note ownerId。

#### 底层机制

handler 解析并验证 message 后，查询 note owner 或调用 domain service。只有 owner 匹配时才把 connection id 加入 note room；否则返回 `subscription.rejected`。

#### API / 语法规则

- `subscribe.note` message 需要 `requestId` 和 `noteId`。
- owner check 必须在 registry room mutation 之前。
- rejected response 应使用稳定 code，例如 `OWNER_REQUIRED`。
- 对资源敏感 command 要重复授权，不能复用旧结论。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-router.ts</span>
  </div>

```ts
import type { RawData } from "ws";
import { RealtimeEventType, RealtimeResourceType } from "../generated/prisma/client.js";
import { config } from "../config/env.js";
import { findNoteById } from "../modules/notes/notes.repository.js";
import { appendRealtimeEvent } from "../realtime/event-log.repository.js";
import { publishEventNotification } from "../redis/redis-pubsub.js";
import { websocketClientMessageSchema, type WebSocketClientMessage } from "./websocket-message.schema.js";
import type { WebSocketRegistry } from "./websocket-registry.js";
import { sendJsonWithBackpressure } from "./websocket-send.js";
import { websocketCloseCodes } from "./websocket-close.js";

function rawDataToString(raw: RawData): string {
  if (typeof raw === "string") return raw;
  if (raw instanceof Buffer) return raw.toString("utf8");
  if (Array.isArray(raw)) return Buffer.concat(raw).toString("utf8");
  return Buffer.from(new Uint8Array(raw as ArrayBuffer)).toString("utf8");
}

async function ensureOwnedNote(noteId: string, userId: string): Promise<boolean> {
  const note = await findNoteById(noteId);
  return Boolean(note && note.ownerId === userId);
}

async function handleSubscribe(connectionId: string, message: Extract<WebSocketClientMessage, { type: "subscribe.note" }>, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;

  if (!(await ensureOwnedNote(message.noteId, connection.userId))) {
    sendJsonWithBackpressure(connection.socket, {
      type: "subscription.rejected",
      requestId: message.requestId,
      code: "OWNER_REQUIRED",
      message: "The note does not belong to the authenticated user."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    return;
  }

  registry.subscribeNote(connectionId, message.noteId);
  const event = await appendRealtimeEvent({
    ownerId: connection.userId,
    resourceType: RealtimeResourceType.NOTE,
    resourceId: message.noteId,
    eventType: RealtimeEventType.NOTE_SUBSCRIBED,
    payload: { noteId: message.noteId }
  });
  await publishEventNotification(event);

  sendJsonWithBackpressure(connection.socket, {
    type: "subscription.accepted",
    requestId: message.requestId,
    noteId: message.noteId
  }, config.WS_BACKPRESSURE_LIMIT_BYTES);
}

async function handleUnsubscribe(connectionId: string, message: Extract<WebSocketClientMessage, { type: "unsubscribe.note" }>, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;
  registry.unsubscribeNote(connectionId, message.noteId);
  sendJsonWithBackpressure(connection.socket, {
    type: "subscription.removed",
    requestId: message.requestId,
    noteId: message.noteId
  }, config.WS_BACKPRESSURE_LIMIT_BYTES);
}

async function handlePresence(connectionId: string, message: Extract<WebSocketClientMessage, { type: "presence.note" }>, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;

  if (!(await ensureOwnedNote(message.noteId, connection.userId))) {
    sendJsonWithBackpressure(connection.socket, {
      type: "subscription.rejected",
      requestId: message.requestId,
      code: "OWNER_REQUIRED",
      message: "The note does not belong to the authenticated user."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    return;
  }

  registry.sendMessageToNote(message.noteId, {
    type: "presence.note",
    requestId: message.requestId,
    noteId: message.noteId,
    userId: connection.userId,
    cursor: message.cursor
  });
}

export async function handleWebSocketMessage(connectionId: string, raw: RawData, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawDataToString(raw));
  } catch {
    sendJsonWithBackpressure(connection.socket, {
      type: "error",
      code: "INVALID_JSON",
      message: "WebSocket messages must be JSON."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    connection.socket.close(websocketCloseCodes.invalidPayload, "Invalid JSON");
    return;
  }

  const parsedMessage = websocketClientMessageSchema.safeParse(parsedJson);
  if (!parsedMessage.success) {
    sendJsonWithBackpressure(connection.socket, {
      type: "error",
      code: "INVALID_MESSAGE",
      message: "WebSocket message schema validation failed."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    return;
  }

  if (parsedMessage.data.type === "subscribe.note") {
    await handleSubscribe(connectionId, parsedMessage.data, registry);
    return;
  }

  if (parsedMessage.data.type === "unsubscribe.note") {
    await handleUnsubscribe(connectionId, parsedMessage.data, registry);
    return;
  }

  await handlePresence(connectionId, parsedMessage.data, registry);
}
```

</div>

#### 逐行解释

示例把 note lookup 放在 room join 前面。`requestId` 用来让客户端关联响应，`noteId` 不能作为权限证明。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

owner case 应返回 `subscription.accepted` 并加入 room；non-owner case 应返回 `subscription.rejected`，registry 不应发生订阅写入。

#### 对照与常见错误

常见错误是把 room name 当作 capability。客户端能猜到或构造 note id，并不表示它有权接收该 room 的消息。

#### 真实项目关系

`realtime-notes-api` 在 WebSocket 订阅前复用 notes owner 查询，确保 REST 可访问性和 realtime 可见性一致。

#### 当前学习路径关系

本节延续 Chapter 06 的 owner authorization，只是触发点从 REST route 移到了 WebSocket message handler。

#### 最终心智模型

身份认证打开连接，资源授权打开房间；两个门都要过，顺序不能反。
<a id="9-13-websocket-heartbeat-ping-pong-dead-connection-detection"></a>

### 9.13 WebSocket heartbeat：ping、pong、dead connection detection

#### 结论

WebSocket heartbeat 用 ping/pong 和 `isAlive` 标记发现半开连接；无响应连接通常用 `terminate()` 清理，而不是等待正常 close。

#### 本节解决的问题

本节解决网络断开但服务器没有收到 close frame 的情况。没有 heartbeat，registry 会继续认为 socket 在线，fan-out 会写向已经失效的连接。

#### 技术意义

移动网络、代理和浏览器崩溃都可能让 dead connection 暂时不可见。heartbeat 是维护 registry 准确性和内存稳定性的必要机制。

#### 概念解释

服务器定期把 `isAlive` 设为 false 并发送 ping；收到 pong 后再设回 true。下一轮检查仍为 false 的连接说明没有响应。

#### 底层机制

`close()` 是协议级正常关闭，会发送 close frame；`terminate()` 直接销毁 socket，适合 heartbeat 判定的死连接。两者语义不同。

#### API / 语法规则

- `socket.ping()` 发送 heartbeat probe。
- `socket.on("pong", ...)` 标记连接存活。
- `isAlive` 是应用维护的状态。
- `socket.terminate()` 清理不可响应连接。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-heartbeat.ts</span>
  </div>

```ts
import type { WebSocketRegistry } from "./websocket-registry.js";

export function startWebSocketHeartbeat(registry: WebSocketRegistry, intervalMs: number): () => void {
  const timer = setInterval(() => {
    for (const connection of registry.entries()) {
      if (!connection.isAlive) {
        connection.socket.terminate();
        registry.remove(connection.connectionId);
        continue;
      }

      connection.isAlive = false;
      connection.socket.ping();
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
```

</div>

#### 逐行解释

示例用两轮 heartbeat 暴露状态变化。阅读时要确认 pong handler 和 interval 检查修改的是同一个 connection 对象。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

健康连接会在 pong 后保持 alive；未响应连接会被 terminate，并触发 registry cleanup。

#### 对照与常见错误

常见错误是只依赖浏览器主动 close。断网或进程崩溃时可能没有 close frame，服务器状态会长期错误。

#### 真实项目关系

项目的 WebSocket registry 通过 heartbeat 删除 dead clients，避免 Redis fan-out 时不断写入不可用 socket。

#### 当前学习路径关系

本节把 Chapter 01 的 timer 清理应用到 WebSocket，与 9.6 的 SSE heartbeat 形成协议对照。

#### 最终心智模型

WebSocket 在线状态需要主动探测；没有 pong 的连接应被视为占用资源的未知状态。
<a id="9-14-send-backpressure-and-memory-boundary"></a>

### 9.14 Send backpressure and memory boundary

#### 结论

发送前要检查 `readyState` 和 `bufferedAmount`。慢客户端会把待发送数据堆在内存里，服务端必须定义 close、drop 或 queue policy。

#### 本节解决的问题

本节解决 fan-out 时“能不能继续写”的问题。WebSocket API 允许你调用 send，但网络不一定能立刻把消息发出去。

#### 技术意义

实时系统最容易被慢客户端拖垮：事件产生速度高于网络发送速度时，未发送消息会堆积，进程内存可能持续增长。

#### 概念解释

`readyState` 表示 socket 是否处于 OPEN；`bufferedAmount` 表示已排队但尚未传输的字节量。它们共同决定当前连接是否适合继续发送。

#### 底层机制

send policy 应在序列化 payload 后计算大小，检查连接状态和 buffer 阈值。超出阈值时可以关闭连接、丢弃非关键事件或转入有界队列，但不能无限堆积。

#### API / 语法规则

- `WebSocket.OPEN` 表示可发送状态。
- `socket.bufferedAmount` 暴露排队字节数。
- `socket.send(data, callback)` 的 callback 只能报告写入结果。
- policy 要明确 close/drop/queue 中的选择。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-send.ts</span>
  </div>

```ts
import WebSocket from "ws";
import { websocketCloseCodes } from "./websocket-close.js";

export type WebSocketSendResult = "sent" | "closed" | "backpressure";

export function sendJsonWithBackpressure(socket: WebSocket, payload: unknown, maxBufferedBytes: number): WebSocketSendResult {
  if (socket.readyState !== WebSocket.OPEN) {
    return "closed";
  }

  if (socket.bufferedAmount > maxBufferedBytes) {
    socket.close(websocketCloseCodes.tryAgainLater, "Backpressure limit exceeded");
    return "backpressure";
  }

  socket.send(JSON.stringify(payload));
  return "sent";
}
```

</div>

#### 逐行解释

示例把 slow client 判定写在 send 前。重点是不要只看业务事件是否存在，还要看目标 socket 当前是否承受得住。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应区分 sent、skipped closed socket 和 rejected slow socket。不会因为一个慢连接阻塞整个 fan-out。

#### 对照与常见错误

常见错误是对 room 内所有 socket 无条件 `send`。这在本地测试很正常，但在弱网客户端下会把内存压力留在 Node 进程里。

#### 真实项目关系

`realtime-notes-api` 通过 `WS_BACKPRESSURE_LIMIT_BYTES` 控制单连接排队上限，保护 notes event fan-out。

#### 当前学习路径关系

本节把 Chapter 02 的 stream backpressure 思维迁移到 WebSocket send queue。

#### 最终心智模型

实时发送不是“有消息就写”；每个连接都有独立的内存边界和失败策略。
<a id="9-15-close-codes-error-messages-and-safe-failure-behavior"></a>

### 9.15 Close codes, error messages, and safe failure behavior

#### 结论

WebSocket failure 要区分 protocol failure 和 business rejection。close code 与 reason 应稳定、简短、安全，不能泄露 stack trace、数据库错误或 token 信息。

#### 本节解决的问题

本节解决实时协议如何表达失败。某些错误应该关闭连接，某些错误只需要返回业务消息并保持连接。

#### 技术意义

长连接错误会被客户端和日志系统反复观察。错误语义不稳定会让客户端无法恢复；错误内容过多会泄露内部实现。

#### 概念解释

close code 描述连接级状态，例如 policy violation 或 unsupported data；业务拒绝消息描述某个 requestId 对应的 command 未被接受。close reason 有长度限制，也不适合承载详细调试信息。

#### 底层机制

协议错误、payload 过大或认证失效可以触发 close；non-owner subscription 应发送 `subscription.rejected`。服务端内部异常应映射到稳定 code，并在服务端日志中保留细节。

#### API / 语法规则

- `socket.close(code, reason)` 发送正常 close frame。
- reason 应短且不含内部错误。
- 业务 rejected message 应带 `requestId`。
- 不要把 stack trace 或 Prisma/Redis error text 发给客户端。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-close.ts</span>
  </div>

```ts
export const websocketCloseCodes = {
  normal: 1000,
  goingAway: 1001,
  invalidPayload: 1007,
  policyViolation: 1008,
  tryAgainLater: 1013
} as const;

export function safeCloseReason(reason: string): string {
  return reason.slice(0, 120);
}
```

</div>

#### 逐行解释

示例把 failure 映射成安全 code。你应该观察 raw error 是否在边界内被转换，而不是穿透到 WebSocket response。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应包含稳定 error code 或 close code；客户端不应看到 password hash、session token、SQL、Redis connection string 或 stack trace。

#### 对照与常见错误

常见错误是把 catch 到的 `error.message` 直接作为 WebSocket message。开发阶段方便，但生产中会暴露数据库结构或内部模块路径。

#### 真实项目关系

项目用明确 close codes 和 rejected messages 让浏览器端可以区分重连、重新认证和资源拒绝。

#### 当前学习路径关系

本节复用 Chapter 03/04 的 error middleware 思维，但 WebSocket 没有 Express error pipeline，所以要在 message layer 显式转换。

#### 最终心智模型

连接级错误关闭通道，业务级错误拒绝命令；两者都只能暴露客户端需要恢复的信息。
<a id="9-16-domain-events-from-rest-mutations"></a>

### 9.16 Domain events from REST mutations

#### 结论

REST mutation 是事实来源；realtime layer 只运输已经发生且通过 owner check 的 domain facts。它不应该自己发明 note created、updated 或 deleted。

#### 本节解决的问题

本节解决事件何时产生。创建、更新、删除 note 的权威边界仍在 REST service 和数据库 transaction，而不是 WebSocket handler 或 SSE registry。

#### 技术意义

如果实时层独立制造事实，REST response、database state 和 client event stream 可能互相矛盾。domain event 必须跟随真实 mutation。

#### 概念解释

一次 REST mutation 先完成 authentication、owner authorization 和 database write；写入成功后产生 domain event payload。事件描述事实，例如 note id、event type、owner id 和 sequence source。

#### 底层机制

service 层在 mutation 成功后调用 event appender，再触发 live notification。失败的 mutation 不产生 event；未授权的 mutation 既不写业务数据，也不写 realtime event。

#### API / 语法规则

- REST handler 接收 HTTP JSON body。
- domain service 执行 owner check 和 database write。
- `appendRealtimeEvent` 记录可投递事实。
- transport layer 只读取并发送 event。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notes.service.ts</span>
  </div>

```ts
import { RealtimeEventType } from "../../generated/prisma/client.js";
import { requireOwner } from "../../shared/auth/authorize-owner.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { findNotebookById } from "../notebooks/notebooks.repository.js";
import { recordAndPublishNoteEvent } from "../../realtime/event-publisher.js";
import { createNote, deleteNote, findNoteById, listNotes, toNoteDto, updateNote } from "./notes.repository.js";
import type { NoteDto, NoteStatus } from "./notes.types.js";

export async function listNotebookNotes(ownerId: string, notebookId: string, query: { status?: NoteStatus; limit: number; offset: number }): Promise<NoteDto[]> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);
  return (await listNotes({ ownerId, notebookId, ...query })).map(toNoteDto);
}

export async function createNotebookNote(ownerId: string, notebookId: string, input: { title: string; body: string; status: NoteStatus }): Promise<NoteDto> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);

  const note = await createNote({ ownerId, notebookId, ...input });
  await recordAndPublishNoteEvent({
    ownerId,
    noteId: note.id,
    eventType: RealtimeEventType.NOTE_CREATED,
    payload: { noteId: note.id, notebookId: note.notebookId, title: note.title, updatedAt: note.updatedAt.toISOString() }
  });
  return toNoteDto(note);
}

export async function getNote(ownerId: string, noteId: string): Promise<NoteDto> {
  const note = await findNoteById(noteId);
  if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(note.ownerId, ownerId);
  return toNoteDto(note);
}

export async function updateUserNote(ownerId: string, noteId: string, input: Partial<{ title: string; body: string; status: NoteStatus }>): Promise<NoteDto> {
  const existing = await findNoteById(noteId);
  if (!existing) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(existing.ownerId, ownerId);

  const note = await updateNote(noteId, input);
  await recordAndPublishNoteEvent({
    ownerId,
    noteId: note.id,
    eventType: RealtimeEventType.NOTE_UPDATED,
    payload: { noteId: note.id, notebookId: note.notebookId, updatedAt: note.updatedAt.toISOString() }
  });
  return toNoteDto(note);
}

export async function deleteUserNote(ownerId: string, noteId: string): Promise<void> {
  const note = await findNoteById(noteId);
  if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(note.ownerId, ownerId);
  await deleteNote(noteId);
  await recordAndPublishNoteEvent({
    ownerId,
    noteId,
    eventType: RealtimeEventType.NOTE_DELETED,
    payload: { noteId, notebookId: note.notebookId, deletedAt: new Date().toISOString() }
  });
}
```

</div>

#### 逐行解释

示例把 mutation result 和 event append 放在同一业务路径中。重点是事件 payload 来自已提交事实，而不是来自客户端随 WebSocket 发来的声明。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

运行结果应显示 REST mutation 成功后才有 event。认证失败、owner check 失败或数据库写入失败时不应产生 live notification。

#### 对照与常见错误

常见错误是在 WebSocket `presence` 或 `subscribe` handler 中直接广播 note 更新。这样会绕过 REST 权威路径，客户端可能看到数据库里不存在的事实。

#### 真实项目关系

`realtime-notes-api` 的 notes routes 在 create/update/delete 后写 durable event，再交给 Redis 和本地 registry 做通知。

#### 当前学习路径关系

本节连接 Chapter 05 的 transaction/source-of-truth 思维和 Chapter 06 的 owner authorization。

#### 最终心智模型

实时层负责传播事实；事实必须先由受保护的 domain mutation 产生。
<a id="9-17-postgresql-durable-event-log"></a>

### 9.17 PostgreSQL durable event log

#### 结论

`RealtimeEvent` 是 durable source。sequence 提供 replay ordering，ownerId 提供可见性过滤；断线重连时历史恢复应读 PostgreSQL，而不是读内存或 Pub/Sub。

#### 本节解决的问题

本节解决客户端离线期间发生的事件如何找回。live connection 只能接收当前在线消息，不能保存过去事实。

#### 技术意义

没有 durable event log，断线、重启或多实例切换都会让客户端错过更新。PostgreSQL 提供可查询、可排序、可按 owner 过滤的恢复来源。

#### 概念解释

`RealtimeEvent` 通常包含 `id`、`sequence`、`ownerId`、`resourceType`、`resourceId`、`eventType`、`payload` 和 timestamps。`sequence` 是 replay 排序边界，不是用户权限。

#### 底层机制

append 时数据库生成递增 sequence；replay 时查询 `ownerId = currentUser.id AND sequence > lastSeen`，按 sequence 升序返回。这样可以从任意连接恢复到当前事实序列。

#### API / 语法规则

- Prisma model 定义 durable event table。
- append API 写入 owner-scoped event。
- replay API 使用 owner filter、sequence filter 和 limit。
- payload 只保存客户端需要的安全事实。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/prisma/schema.prisma</span>
  </div>

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  USER
  ADMIN
}

enum NoteStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum RealtimeResourceType {
  USER
  NOTEBOOK
  NOTE
}

enum RealtimeEventType {
  NOTE_CREATED
  NOTE_UPDATED
  NOTE_DELETED
  NOTE_SUBSCRIBED
  PRESENCE_UPDATED
}

model User {
  id             String          @id @default(uuid()) @db.Uuid
  email          String          @unique @db.VarChar(320)
  passwordHash   String          @db.Text
  role           Role            @default(USER)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  sessions       Session[]
  notebooks      Notebook[]
  notes          Note[]
  realtimeEvents RealtimeEvent[] @relation("RealtimeEventOwner")
}

model Session {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @db.Uuid
  tokenHash     String    @unique @db.VarChar(96)
  csrfTokenHash String?   @db.VarChar(96)
  userAgent     String?   @db.VarChar(512)
  ipHash        String?   @db.VarChar(96)
  createdAt     DateTime  @default(now())
  expiresAt     DateTime
  revokedAt     DateTime?
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model Notebook {
  id        String   @id @default(uuid()) @db.Uuid
  ownerId   String   @db.Uuid
  name      String   @db.VarChar(120)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notes     Note[]

  @@index([ownerId])
  @@unique([ownerId, name])
}

model Note {
  id         String     @id @default(uuid()) @db.Uuid
  ownerId    String     @db.Uuid
  notebookId String     @db.Uuid
  title      String     @db.VarChar(160)
  body       String     @default("")
  status     NoteStatus @default(ACTIVE)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  owner      User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notebook   Notebook   @relation(fields: [notebookId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@index([notebookId])
  @@index([status, createdAt])
  @@unique([notebookId, title])
}

model RealtimeEvent {
  id           String               @id @default(uuid()) @db.Uuid
  sequence     BigInt               @unique @default(autoincrement())
  ownerId      String               @db.Uuid
  resourceType RealtimeResourceType
  resourceId   String               @db.Uuid
  eventType    RealtimeEventType
  payload      Json
  createdAt    DateTime             @default(now())
  owner        User                 @relation("RealtimeEventOwner", fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId, sequence])
  @@index([resourceType, resourceId, sequence])
  @@index([eventType, createdAt])
}
```

</div>

#### 逐行解释

示例展示 append 与 find-after 查询。检查点是 sequence 由数据库事实驱动，replay query 同时包含 ownerId 和 afterSequence。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应显示新事件 sequence，并且 replay 只返回当前 owner 在指定 sequence 后的事件集合。

#### 对照与常见错误

常见错误是只按 `sequence > lastSeen` 查询。全局 sequence 不能代表访问权限，缺少 owner filter 会泄露其他用户事件。

#### 真实项目关系

项目的 SSE `Last-Event-ID` 和 WebSocket reconnect 语义都依赖 PostgreSQL `RealtimeEvent` 进行历史恢复。

#### 当前学习路径关系

本节扩展 Chapter 05 的 Prisma/PostgreSQL 能力，用数据库顺序解决实时系统的 missed events 问题。

#### 最终心智模型

PostgreSQL event log 回答“已经发生过什么，当前用户还能看到什么”。
<a id="9-18-redis-pub-sub-fan-out-and-at-most-once-boundary"></a>

### 9.18 Redis Pub/Sub fan-out and at-most-once boundary

#### 结论

Redis Pub/Sub 用于在线实例之间的 live fan-out，语义是 at-most-once。它不会保存 missed messages，也不能替代 PostgreSQL replay。

#### 本节解决的问题

本节解决多进程或多实例部署时，一个实例写入事件后如何通知其他在线实例。内存 registry 只能覆盖本进程连接。

#### 技术意义

Pub/Sub 让 live notification 跨实例传播，但它的轻量性来自不持久化。断线、重启或订阅者不可用期间的消息不会在 Redis 中等待重放。

#### 概念解释

publisher 把 event envelope 发布到 channel；subscriber client 订阅同一 channel，并把收到的 event 分发给本进程 registry。发布连接和订阅连接通常要分开，因为 subscribe 模式会改变连接用途。

#### 底层机制

Redis 把消息推给当前已订阅的连接。若订阅者当时不在线，消息不会被补发。因此客户端恢复历史必须回到 PostgreSQL sequence replay。

#### API / 语法规则

- `client.publish(channel, payload)` 发送 live notification。
- `client.duplicate()` 常用于创建 subscriber connection。
- `subscriber.subscribe(channel, handler)` 接收在线消息。
- Pub/Sub delivery 不保证 missed-message replay。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/redis/redis-pubsub.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RedisClientType } from "redis";
import { getRedisClient } from "./redis-client.js";
import { NOTE_EVENTS_PATTERN, USER_EVENTS_PATTERN, noteEventsChannel, userEventsChannel } from "./redis-channels.js";
import type { StoredRealtimeEvent } from "../realtime/events.js";
import { logger } from "../shared/logging/logger.js";

const processId = randomUUID();
let subscriber: RedisClientType | undefined;

type RealtimePubSubEnvelope = {
  originProcessId: string;
  event: StoredRealtimeEvent;
};

export async function publishEventNotification(event: StoredRealtimeEvent): Promise<void> {
  const client = await getRedisClient();
  const envelope = JSON.stringify({ originProcessId: processId, event } satisfies RealtimePubSubEnvelope);
  await client.publish(userEventsChannel(event.ownerId), envelope);

  if (event.resourceType === "NOTE") {
    await client.publish(noteEventsChannel(event.resourceId), envelope);
  }
}

export async function subscribeToRealtimeFanout(onEvent: (event: StoredRealtimeEvent) => void): Promise<() => Promise<void>> {
  const client = await getRedisClient();
  subscriber = client.duplicate();
  subscriber.on("error", (error) => {
    logger.error("Redis subscriber error.", { error });
  });
  await subscriber.connect();

  const listener = (message: string): void => {
    try {
      const envelope = JSON.parse(message) as RealtimePubSubEnvelope;
      if (envelope.originProcessId === processId) return;
      onEvent(envelope.event);
    } catch (error) {
      logger.warn("Dropped invalid Redis Pub/Sub message.", { error });
    }
  };

  await subscriber.pSubscribe(USER_EVENTS_PATTERN, listener);
  await subscriber.pSubscribe(NOTE_EVENTS_PATTERN, listener);

  return async () => {
    if (!subscriber) return;
    await subscriber.pUnsubscribe(USER_EVENTS_PATTERN);
    await subscriber.pUnsubscribe(NOTE_EVENTS_PATTERN);
    await subscriber.quit();
    subscriber = undefined;
  };
}
```

</div>

#### 逐行解释

示例区分 publish client 和 subscriber client，并把消息交给本地 fan-out。你应该关注 subscriber 不在线时没有补偿队列。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

在线订阅者应收到 publish payload；离线期间的消息不会从 Redis Pub/Sub 自动恢复。

#### 对照与常见错误

常见错误是把 Redis Pub/Sub 当作事件日志。它适合叫醒在线实例，不适合回答重连客户端错过了什么。

#### 真实项目关系

`realtime-notes-api` 用 Redis 通知其他 Node 进程，再由每个进程自己的 SSE/WS registry 发送给本地连接。

#### 当前学习路径关系

本节承接 Chapter 07 的 Redis 生命周期，并与 9.17 的 durable event log 建立清晰分工。

#### 最终心智模型

Redis Pub/Sub 回答“现在有哪些在线订阅者需要被通知”；它不回答历史问题。
<a id="9-19-durable-replay-versus-live-delivery"></a>

### 9.19 Durable replay versus live delivery

#### 结论

Durable replay 和 live delivery 是两条不同路径：PostgreSQL 负责历史恢复，Redis Pub/Sub 负责在线实例通知。重连客户端应该用 durable replay，而不是向 Pub/Sub 追历史。

#### 本节解决的问题

本节解决断线重连与在线广播的职责分离。客户端错过的事件来自数据库 replay；当前在线连接的快速通知来自 live delivery。

#### 技术意义

把两者混在一起会导致语义错误：用 Pub/Sub 做恢复会丢事件，用数据库轮询做所有 live delivery 又会增加延迟和数据库压力。

#### 概念解释

PostgreSQL event log 有 sequence、owner filter 和持久化记录；Redis Pub/Sub 有 channel、subscriber 和当前在线消息。一个偏正确性，一个偏低延迟通知。

#### 底层机制

REST mutation 写入 durable event 后，可以发布 live notification。在线连接收到通知即可发送；断线后重新连接的客户端提供 last seen id，由服务器从 PostgreSQL 查询缺口。

#### API / 语法规则

- replay API 使用 `ownerId` 和 `afterSequence` 查询 PostgreSQL。
- live publish API 把 event envelope 发到 Redis channel。
- subscriber handler 只处理当前收到的 payload。
- client reconnect path 不应该依赖 Pub/Sub 保存历史。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/realtime/replay.ts</span>
  </div>

```ts
import { RealtimeResourceType } from "../generated/prisma/client.js";
import { findEventsAfter } from "./event-log.repository.js";
import type { StoredRealtimeEvent } from "./events.js";

export function parseLastEventId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  return trimmed;
}

export function isReplaySequence(value: string | undefined): value is string {
  return value !== undefined && /^\d+$/.test(value);
}

export async function loadUserReplayEvents(ownerId: string, lastEventId: string | undefined): Promise<StoredRealtimeEvent[]> {
  return findEventsAfter({
    ownerId,
    afterSequence: parseLastEventId(lastEventId),
    limit: 100
  });
}

export async function loadNoteReplayEvents(ownerId: string, noteId: string, lastEventId: string | undefined): Promise<StoredRealtimeEvent[]> {
  return findEventsAfter({
    ownerId,
    afterSequence: parseLastEventId(lastEventId),
    resourceType: RealtimeResourceType.NOTE,
    resourceId: noteId,
    limit: 100
  });
}
```

</div>

#### 逐行解释

示例把 replay source 和 live source 放在不同函数中。阅读时要确认 missed events 的路径指向 PostgreSQL，而 online fan-out 的路径才指向 Redis subscriber。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应显示 history events 来自 durable query，online events 来自 live subscription。两种结果可能包含同类 payload，但来源和保证不同。

#### 对照与常见错误

常见错误是让重连客户端等待 Redis channel 补发。Pub/Sub 不保存离线消息，恢复缺口必须回到 durable event log。

#### 真实项目关系

项目在 SSE reconnect 和 WebSocket 恢复逻辑中使用 PostgreSQL replay，在多实例即时通知中使用 Redis live delivery。

#### 当前学习路径关系

本节把 9.17 和 9.18 的边界合并成一个决策模型，为 9.20 的 integration tests 提供验证点。

#### 最终心智模型

历史恢复问数据库，在线通知走 Pub/Sub；两个路径可以发送同一种事件，但不能互相替代。
<a id="9-20-integration-testing-sse-and-websocket-behavior"></a>

### 9.20 Integration testing SSE and WebSocket behavior

#### 结论

实时 integration tests 要验证 live streams、upgrade、auth、owner check、replay 和 cleanup。Supertest 适合 HTTP/SSE 入口，`ws` client 适合 WebSocket upgrade 和 message protocol。

#### 本节解决的问题

本节解决单元测试无法证明的边界：真实 HTTP headers、长响应、upgrade handshake、数据库 replay 和 Redis live notification 是否能一起工作。

#### 技术意义

SSE 与 WebSocket 的 bug 往往出现在组件交界处。只测试 formatter 或 handler，无法证明浏览器式连接、cookie、Origin、数据库和 Redis 的组合行为。

#### 概念解释

Supertest 可以打开 HTTP route 并检查 headers 或初始事件；`ws` client 可以模拟 upgrade、发送 message、等待 server message。PostgreSQL/Redis 不可用时，相关 integration tests 应标为 skip 或 UNKNOWN，而不是假装通过。

#### 底层机制

测试先准备用户和 note，再带 cookie 打开 SSE 或 WebSocket；随后执行 REST mutation，观察 event 是否到达。外部服务不可达时，测试应明确跳过依赖真实数据库或 Redis 的路径。

#### API / 语法规则

- Supertest 验证 Express HTTP/SSE route。
- `WebSocket` test client 验证 upgrade 和 messages。
- `RUN_REALTIME_TESTS=true` 可控制依赖外部服务的测试。
- 没有 PostgreSQL/Redis 时，migration、seed、integration test 结果应是 UNKNOWN。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/tests/websocket.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import WebSocket from "ws";
import { createRealtimeTestServer } from "./helpers/realtime.js";
import { integrationTestsEnabled } from "./helpers/database.js";

test("WebSocket upgrade rejects missing cookie session", { skip: !integrationTestsEnabled() }, async () => {
  const server = await createRealtimeTestServer();
  try {
    const result = await new Promise<"open" | "error">((resolve) => {
      const client = new WebSocket(server.wsUrl, { headers: { Origin: "http://localhost:3000" } });
      client.once("open", () => resolve("open"));
      client.once("error", () => resolve("error"));
    });
    assert.equal(result, "error");
  } finally {
    await server.close();
  }
});
```

</div>

#### 逐行解释

示例展示的是跨边界断言，而不是单个函数快照。你应该看测试是否真的经过 HTTP server、cookie auth、registry 和 event source。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

可用环境中应看到 SSE event、WebSocket accepted/rejected message 和 replay 行为；服务不可用时应得到明确 skip 或 UNKNOWN 说明。

#### 对照与常见错误

常见错误是用 typecheck 或纯单元测试代替实时 integration test。类型通过不能证明 upgrade、long response 或 Redis subscriber 工作。

#### 真实项目关系

项目的 tests 目录使用 Node test runner、Supertest 和 `ws` client 验证 SSE/WebSocket 关键路径。

#### 当前学习路径关系

本节复用 Chapter 04 的测试组织方式，并把验证范围提升到 Chapter 05–07 的外部服务边界。

#### 最终心智模型

实时测试要证明“连接真的打开、消息真的经过边界、资源真的被清理”；静态检查只能证明代码可编译。
<a id="9-21-graceful-shutdown-for-realtime-servers"></a>

### 9.21 Graceful shutdown for realtime servers

#### 结论

Graceful shutdown 要先停止接受新 upgrade，再关闭 HTTP server，随后关闭 SSE registry、WebSocket clients、Redis subscription 和 Prisma connection。

#### 本节解决的问题

本节解决进程收到 shutdown signal 时如何收束长期连接和外部资源。普通 REST server 只需停止新请求；realtime server 还持有 streams、sockets 和 subscriber。

#### 技术意义

如果关闭顺序错误，进程可能继续接受新 WebSocket，或者留下未关闭 Redis subscriber 和 Prisma connection，导致部署卡住或数据投递状态不清楚。

#### 概念解释

shutdown 是状态转换：accepting -> draining -> closed。进入 draining 后不再接收新的 upgrade 或 stream，已有连接收到安全 close，再释放外部客户端。

#### 底层机制

signal handler 设置 shuttingDown flag；upgrade handler 看到 flag 后拒绝；HTTP server close 停止监听；registry 遍历关闭 SSE/WS；最后 unsubscribe Redis 并 disconnect Prisma。

#### API / 语法规则

- `server.close()` 停止接收新 HTTP connections。
- upgrade handler 要检查 shutdown flag。
- SSE response 可以写入 shutdown event 后 end。
- WebSocket clients 可以用稳定 close code 关闭。
- Redis unsubscribe 与 Prisma disconnect 应等待完成。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/server.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedisClient } from "./redis/redis-client.js";
import { subscribeToRealtimeFanout } from "./redis/redis-pubsub.js";
import { app } from "./app.js";
import { deliverRealtimeEvent } from "./realtime/event-publisher.js";
import { sseRegistry } from "./sse/sse-registry.js";
import { logger } from "./shared/logging/logger.js";
import { createRealtimeWebSocketServer } from "./websocket/websocket-server.js";
import { installWebSocketUpgrade } from "./websocket/websocket-upgrade.js";

const httpServer = createServer(app);
const realtimeWebSocketServer = createRealtimeWebSocketServer();
const upgradeController = installWebSocketUpgrade(httpServer, realtimeWebSocketServer);
let unsubscribeRedisFanout: (() => Promise<void>) | undefined;
let isShuttingDown = false;

async function start(): Promise<void> {
  unsubscribeRedisFanout = await subscribeToRealtimeFanout(deliverRealtimeEvent);

  httpServer.listen(config.PORT, () => {
    logger.info("HTTP server started.", { port: config.PORT });
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info("Shutdown signal received.", { signal });
  upgradeController.stopAccepting();

  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });

  sseRegistry.closeAll();
  realtimeWebSocketServer.closeAll("Server shutdown");

  if (unsubscribeRedisFanout) {
    await unsubscribeRedisFanout();
  }

  await closeRedisClient();
  await disconnectPrisma();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal).then(() => process.exit(0));
  });
}

await start();
```

</div>

#### 逐行解释

示例把每类资源列入 shutdown 顺序。阅读时要确认没有新的连接能在 draining 期间进入 registry。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

输出应显示 server 停止接收、新连接被拒绝、已存在 SSE/WS 被关闭、Redis/Prisma lifecycle 完成。

#### 对照与常见错误

常见错误是只调用 `server.close()`。这不会自动结束所有应用层 registry，也不会替你取消 Redis subscription。

#### 真实项目关系

`realtime-notes-api` 的 shutdown path 同时处理 HTTP、SSE、WebSocket、Redis 和 Prisma，避免本地 dev 与测试环境留下悬挂句柄。

#### 当前学习路径关系

本节回到 Chapter 01 的 process lifecycle，并把前面所有长连接资源纳入统一退出顺序。

#### 最终心智模型

能打开的资源都要有关闭路径；realtime server 的 shutdown 是多资源 drain，不是单个 server close。
<a id="9-22-chapter-integration-realtime-notes-api"></a>

### 9.22 Chapter integration: realtime-notes-api

#### 结论

本节把 Chapter 09 的 realtime-notes-api 串成一次完整路径：authenticated user -> SSE or WebSocket connection -> session and Origin validation -> connection registry -> owner-checked subscription -> REST mutation writes durable event -> Redis Pub/Sub live fan-out -> SSE/WebSocket delivery -> replay from PostgreSQL -> heartbeat and shutdown cleanup。

#### 本节解决的问题

本节解决整章机制如何组合成一个可运行后端。前面每节只看一个边界，这里只在一次集成视角中展示完整链路。

#### 技术意义

实时功能的正确性来自边界顺序，而不是某个单独库。只要认证、授权、事件记录、live fan-out、replay 或 cleanup 任一环错位，客户端都会看到不一致或不安全行为。

#### 概念解释

用户先通过 cookie session 建立 HTTP/SSE 或 WebSocket 入口；WebSocket 还要做 Origin validation。连接进入 registry 后，note subscription 必须 owner-checked。REST mutation 成功后写 durable event，再发布 live notification；当前在线连接收到 SSE/WS delivery，断线客户端回到 PostgreSQL replay。heartbeat 和 shutdown 负责释放长期资源。

#### 底层机制

整合路径的关键是不让 transport 替代 domain authority：REST service 写事实，PostgreSQL 保存事实，Redis 提醒在线实例，registry 只保存当前连接，SSE/WebSocket 只负责把安全事件发给正确连接。

#### API / 语法规则

- `/events` 和 `/events/notes/:noteId` 提供 SSE stream。
- `/ws` upgrade 建立 WebSocket connection。
- notes REST routes 产生 domain events。
- `RealtimeEvent` 支撑 replay。
- Redis subscriber 触发本进程 fan-out。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/app.ts</span>
  </div>

```ts
import express from "express";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { notFound } from "./shared/middleware/not-found.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { sseRoutes } from "./sse/sse.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(requestId);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(apiRateLimit);
app.use(express.json({ limit: "1mb" }));

app.use("/auth", authRoutes);
app.use("/events", authenticateSession, sseRoutes);
app.use("/notebooks", authenticateSession, notebookRoutes);
app.use("/notes", authenticateSession, notesRoutes);

app.use(notFound);
app.use(errorMiddleware);
```

</div>

#### 逐行解释

示例把 app、server、registry、event log 和 fan-out 连接在一起。阅读时应沿着认证、授权、持久化、通知、恢复、清理的顺序检查，而不是按文件名孤立阅读。

#### 运行方式

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm run prisma:generate
npm run typecheck
```

</div>

#### 预期输出或消息

完整项目运行后，已认证用户可以接收自己的 note events；非 owner subscription 会被拒绝；断线后能按 sequence replay；慢连接和 dead connection 有清理策略。

#### 对照与常见错误

常见错误是只验证 happy path：连接打开、消息收到，就认为实时系统完成。真正需要验证的是断线、非 owner、跨源、慢客户端和 shutdown。

#### 真实项目关系

`realtime-notes-api` 是本章所有练习的最终组合，不引入前端 UI，也不把 Redis 或 WebSocket 当成数据库事实来源。

#### 当前学习路径关系

本节收束 Chapter 01–08 的 process、stream、HTTP、TypeScript、Prisma、auth、Redis 和 file/long-response lifecycle，形成后端实时 API 的学习闭环。

#### 最终心智模型

实时 API 的稳定性来自分层：连接是入口，授权决定可见性，数据库保存事实，Pub/Sub 传播在线通知，registry 管当前进程连接，cleanup 释放资源。
<a id="section-10"></a>

## 10. API 与规则索引

| 边界 | 规则 |
|---|---|
| SSE headers | `Content-Type: text/event-stream`、`Cache-Control: no-cache`、长连接不主动结束 |
| SSE event | `id`、`event`、`retry`、每行 `data`、空行结束 |
| EventSource replay | `Last-Event-ID` 只是客户端提供的恢复点，服务端必须按 owner 授权 |
| HTTP upgrade | 由 Node HTTP server `upgrade` event 接管 |
| `ws` noServer | `handleUpgrade` 只在路径、Origin、auth 通过后调用 |
| WebSocket message | JSON parse、Zod validation、owner authorization、safe error |
| Heartbeat | SSE timer 或 WS ping/pong 需要 close cleanup |
| Backpressure | 发送前检查 readyState 和 bufferedAmount |
| Redis Pub/Sub | live fan-out，at-most-once，不做 durable replay |
| PostgreSQL event log | durable source of truth for missed events |

<a id="section-11"></a>

## 11. 常见错误对照表

| 错误 | 违反的规则 | 识别方式 |
|---|---|---|
| 把 SSE 当 JSON response | SSE 是长响应，不是一次性 JSON body | 客户端迟迟收不到事件，直到连接关闭 |
| 把 Express GET `/ws` 当 WebSocket | upgrade 属于 HTTP server | route 代码没有收到 socket |
| WebSocket upgrade 后不再授权 | 连接认证不等于所有资源授权 | 非 owner 能订阅其他 note |
| 不做 Origin check | Cookie-authenticated WS 有跨站连接风险 | 第三方页面也能尝试连接 |
| 不做 Zod validation | TypeScript 不验证远端 payload | 无效 message 进入业务逻辑 |
| 无界 fan-out | 慢客户端产生 backpressure | bufferedAmount 和内存持续增长 |
| 用 Redis Pub/Sub 当 replay log | Pub/Sub 不持久化 missed messages | 客户端断线期间事件丢失 |

<a id="section-12"></a>

## 12. 调试与验证方法

优先验证静态边界：TypeScript typecheck、Prisma Client generation、required file existence、forbidden dependency absence、SSE header、WebSocket upgrade auth/origin、message schema、owner check、event log 与 Redis Pub/Sub 分工。只有 PostgreSQL 和 Redis 可用时，才运行 runtime integration tests。

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
npm install
npm run prisma:generate
npm run typecheck
$env:RUN_REALTIME_TESTS = "true"; $env:NODE_ENV = "test"; npm test
```

</div>


<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```sh
npm install
npm run prisma:generate
npm run typecheck
RUN_REALTIME_TESTS=true NODE_ENV=test npm test
```

</div>


<a id="section-13"></a>

## 13. 分项练习说明

分项练习只保留最小机制，不承担完整服务器职责。阅读顺序建议是 transport choice、SSE basics、WebSocket basics、connection management、event delivery。每个文件都应回答一个问题：输入从哪里来、状态在哪里保存、失败如何退出、输出如何被观察。

<a id="section-14"></a>

## 14. 最终迷你项目

`realtime-notes-api` 在受保护 notes API 基础上加入 `GET /events`、`GET /events/notes/:noteId` 和 `/ws` upgrade。REST mutation 写入 PostgreSQL durable event log，再通过 Redis Pub/Sub 通知在线实例，同时本进程直接 fan-out 到 SSE 与 WebSocket registry。

### 14.1 项目目标

- 保护 auth/notebook/note REST endpoints。
- SSE 支持 initial event、heartbeat、disconnect cleanup、Last-Event-ID replay。
- WebSocket 支持 upgrade auth、Origin allowlist、message size limit、Zod validation、subscribe/unsubscribe、presence、heartbeat、backpressure、safe close。
- PostgreSQL `RealtimeEvent` 保存 durable history。
- Redis Pub/Sub 只做 live fan-out。

### 14.2 运行路径

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">Terminal</span>
  </div>

```powershell
Set-Location D:\node.js\mini-projects\realtime-notes-api
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run seed
npm run dev
```

</div>


### 14.3 完整项目代码

<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/package.json</span>
  </div>

```json
{
  "name": "realtime-notes-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "typecheck": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "seed": "prisma db seed",
    "test": "node --import tsx --test tests/sse.integration.test.ts tests/websocket.integration.test.ts tests/event-log.integration.test.ts"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.6.0",
    "helmet": "^8.3.0",
    "pg": "^8.22.0",
    "redis": "^6.1.0",
    "ws": "^8.21.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^26.1.1",
    "@types/pg": "^8.20.0",
    "@types/supertest": "^7.2.1",
    "@types/ws": "^8.18.1",
    "prisma": "^7.8.0",
    "supertest": "^7.2.2",
    "tsx": "^4.23.1",
    "typescript": "^7.0.2"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "engines": {
    "node": ">=26"
  }
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/tsconfig.json</span>
  </div>

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src", "prisma", "tests"]
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/.env.example</span>
  </div>

```env
NODE_ENV=development
PORT=3009
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realtime_notes_api
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=realtime_notes_session
SESSION_TTL_SECONDS=604800
CSRF_COOKIE_NAME=realtime_notes_csrf
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
WS_MAX_PAYLOAD_BYTES=8192
WS_BACKPRESSURE_LIMIT_BYTES=1048576
HEARTBEAT_INTERVAL_MS=25000
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/prisma.config.ts</span>
  </div>

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/prisma/schema.prisma</span>
  </div>

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  USER
  ADMIN
}

enum NoteStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum RealtimeResourceType {
  USER
  NOTEBOOK
  NOTE
}

enum RealtimeEventType {
  NOTE_CREATED
  NOTE_UPDATED
  NOTE_DELETED
  NOTE_SUBSCRIBED
  PRESENCE_UPDATED
}

model User {
  id             String          @id @default(uuid()) @db.Uuid
  email          String          @unique @db.VarChar(320)
  passwordHash   String          @db.Text
  role           Role            @default(USER)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  sessions       Session[]
  notebooks      Notebook[]
  notes          Note[]
  realtimeEvents RealtimeEvent[] @relation("RealtimeEventOwner")
}

model Session {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @db.Uuid
  tokenHash     String    @unique @db.VarChar(96)
  csrfTokenHash String?   @db.VarChar(96)
  userAgent     String?   @db.VarChar(512)
  ipHash        String?   @db.VarChar(96)
  createdAt     DateTime  @default(now())
  expiresAt     DateTime
  revokedAt     DateTime?
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model Notebook {
  id        String   @id @default(uuid()) @db.Uuid
  ownerId   String   @db.Uuid
  name      String   @db.VarChar(120)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notes     Note[]

  @@index([ownerId])
  @@unique([ownerId, name])
}

model Note {
  id         String     @id @default(uuid()) @db.Uuid
  ownerId    String     @db.Uuid
  notebookId String     @db.Uuid
  title      String     @db.VarChar(160)
  body       String     @default("")
  status     NoteStatus @default(ACTIVE)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  owner      User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  notebook   Notebook   @relation(fields: [notebookId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@index([notebookId])
  @@index([status, createdAt])
  @@unique([notebookId, title])
}

model RealtimeEvent {
  id           String               @id @default(uuid()) @db.Uuid
  sequence     BigInt               @unique @default(autoincrement())
  ownerId      String               @db.Uuid
  resourceType RealtimeResourceType
  resourceId   String               @db.Uuid
  eventType    RealtimeEventType
  payload      Json
  createdAt    DateTime             @default(now())
  owner        User                 @relation("RealtimeEventOwner", fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId, sequence])
  @@index([resourceType, resourceId, sequence])
  @@index([eventType, createdAt])
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/prisma/seed.ts</span>
  </div>

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient, Role, NoteStatus } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      passwordHash: hashPassword("password-12345"),
      role: Role.USER
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: { ownerId_name: { ownerId: owner.id, name: "Realtime notes" } },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Realtime notes"
    }
  });

  await prisma.note.upsert({
    where: { notebookId_title: { notebookId: notebook.id, title: "First realtime note" } },
    update: {},
    create: {
      ownerId: owner.id,
      notebookId: notebook.id,
      title: "First realtime note",
      body: "Edit this note to emit realtime events.",
      status: NoteStatus.ACTIVE
    }
  });
}

await main();
await prisma.$disconnect();
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/app.ts</span>
  </div>

```ts
import express from "express";
import { authenticateSession } from "./shared/auth/authenticate-session.js";
import { errorMiddleware } from "./shared/errors/error-middleware.js";
import { corsMiddleware } from "./shared/middleware/cors.js";
import { notFound } from "./shared/middleware/not-found.js";
import { apiRateLimit } from "./shared/middleware/rate-limit.js";
import { requestId } from "./shared/middleware/request-id.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notebookRoutes } from "./modules/notebooks/notebooks.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";
import { sseRoutes } from "./sse/sse.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(requestId);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(apiRateLimit);
app.use(express.json({ limit: "1mb" }));

app.use("/auth", authRoutes);
app.use("/events", authenticateSession, sseRoutes);
app.use("/notebooks", authenticateSession, notebookRoutes);
app.use("/notes", authenticateSession, notesRoutes);

app.use(notFound);
app.use(errorMiddleware);
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/server.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedisClient } from "./redis/redis-client.js";
import { subscribeToRealtimeFanout } from "./redis/redis-pubsub.js";
import { app } from "./app.js";
import { deliverRealtimeEvent } from "./realtime/event-publisher.js";
import { sseRegistry } from "./sse/sse-registry.js";
import { logger } from "./shared/logging/logger.js";
import { createRealtimeWebSocketServer } from "./websocket/websocket-server.js";
import { installWebSocketUpgrade } from "./websocket/websocket-upgrade.js";

const httpServer = createServer(app);
const realtimeWebSocketServer = createRealtimeWebSocketServer();
const upgradeController = installWebSocketUpgrade(httpServer, realtimeWebSocketServer);
let unsubscribeRedisFanout: (() => Promise<void>) | undefined;
let isShuttingDown = false;

async function start(): Promise<void> {
  unsubscribeRedisFanout = await subscribeToRealtimeFanout(deliverRealtimeEvent);

  httpServer.listen(config.PORT, () => {
    logger.info("HTTP server started.", { port: config.PORT });
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info("Shutdown signal received.", { signal });
  upgradeController.stopAccepting();

  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });

  sseRegistry.closeAll();
  realtimeWebSocketServer.closeAll("Server shutdown");

  if (unsubscribeRedisFanout) {
    await unsubscribeRedisFanout();
  }

  await closeRedisClient();
  await disconnectPrisma();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal).then(() => process.exit(0));
  });
}

await start();
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/config/env.ts</span>
  </div>

```ts
import "dotenv/config";
import { z } from "zod";

function numberFromEnv(defaultValue: number): z.ZodType<number> {
  return z.preprocess((value) => {
    if (value === undefined || value === "") return defaultValue;
    return Number(value);
  }, z.number().int().positive());
}

function splitOrigins(value: string): string[] {
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: numberFromEnv(3009),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/realtime_notes_api"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("realtime_notes_session"),
  SESSION_TTL_SECONDS: numberFromEnv(604800),
  CSRF_COOKIE_NAME: z.string().min(1).default("realtime_notes_csrf"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://127.0.0.1:3000"),
  WS_MAX_PAYLOAD_BYTES: numberFromEnv(8192),
  WS_BACKPRESSURE_LIMIT_BYTES: numberFromEnv(1048576),
  HEARTBEAT_INTERVAL_MS: numberFromEnv(25000)
});

const parsed = envSchema.parse(process.env);

export const config = {
  ...parsed,
  ALLOWED_ORIGINS: splitOrigins(parsed.ALLOWED_ORIGINS),
  COOKIE_SECURE: parsed.NODE_ENV === "production"
} as const;
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/db/prisma.ts</span>
  </div>

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config/env.js";

const adapter = new PrismaPg({
  connectionString: config.DATABASE_URL
});

export const prisma = new PrismaClient({ adapter });

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/db/prisma-errors.ts</span>
  </div>

```ts
import { Prisma } from "../generated/prisma/client.js";

export function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/redis/redis-client.ts</span>
  </div>

```ts
import { createClient, type RedisClientType } from "redis";
import { config } from "../config/env.js";
import { logger } from "../shared/logging/logger.js";

let redisClient: RedisClientType | undefined;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({ url: config.REDIS_URL });
    redisClient.on("error", (error) => {
      logger.error("Redis client error.", { error });
    });
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }

  redisClient = undefined;
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/redis/redis-channels.ts</span>
  </div>

```ts
const SAFE_CHANNEL_SEGMENT = /^[a-zA-Z0-9:_-]+$/;

function safeSegment(value: string): string {
  if (!SAFE_CHANNEL_SEGMENT.test(value)) {
    throw new Error("Unsafe Redis channel segment.");
  }

  return value;
}

export function userEventsChannel(userId: string): string {
  return `realtime:user:${safeSegment(userId)}:events`;
}

export function noteEventsChannel(noteId: string): string {
  return `realtime:note:${safeSegment(noteId)}:events`;
}

export const USER_EVENTS_PATTERN = "realtime:user:*:events";
export const NOTE_EVENTS_PATTERN = "realtime:note:*:events";
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/redis/redis-pubsub.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RedisClientType } from "redis";
import { getRedisClient } from "./redis-client.js";
import { NOTE_EVENTS_PATTERN, USER_EVENTS_PATTERN, noteEventsChannel, userEventsChannel } from "./redis-channels.js";
import type { StoredRealtimeEvent } from "../realtime/events.js";
import { logger } from "../shared/logging/logger.js";

const processId = randomUUID();
let subscriber: RedisClientType | undefined;

type RealtimePubSubEnvelope = {
  originProcessId: string;
  event: StoredRealtimeEvent;
};

export async function publishEventNotification(event: StoredRealtimeEvent): Promise<void> {
  const client = await getRedisClient();
  const envelope = JSON.stringify({ originProcessId: processId, event } satisfies RealtimePubSubEnvelope);
  await client.publish(userEventsChannel(event.ownerId), envelope);

  if (event.resourceType === "NOTE") {
    await client.publish(noteEventsChannel(event.resourceId), envelope);
  }
}

export async function subscribeToRealtimeFanout(onEvent: (event: StoredRealtimeEvent) => void): Promise<() => Promise<void>> {
  const client = await getRedisClient();
  subscriber = client.duplicate();
  subscriber.on("error", (error) => {
    logger.error("Redis subscriber error.", { error });
  });
  await subscriber.connect();

  const listener = (message: string): void => {
    try {
      const envelope = JSON.parse(message) as RealtimePubSubEnvelope;
      if (envelope.originProcessId === processId) return;
      onEvent(envelope.event);
    } catch (error) {
      logger.warn("Dropped invalid Redis Pub/Sub message.", { error });
    }
  };

  await subscriber.pSubscribe(USER_EVENTS_PATTERN, listener);
  await subscriber.pSubscribe(NOTE_EVENTS_PATTERN, listener);

  return async () => {
    if (!subscriber) return;
    await subscriber.pUnsubscribe(USER_EVENTS_PATTERN);
    await subscriber.pUnsubscribe(NOTE_EVENTS_PATTERN);
    await subscriber.quit();
    subscriber = undefined;
  };
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/realtime/events.ts</span>
  </div>

```ts
import type { RealtimeEventType, RealtimeResourceType } from "../generated/prisma/client.js";

export type StoredRealtimeEvent = {
  id: string;
  sequence: string;
  ownerId: string;
  resourceType: RealtimeResourceType;
  resourceId: string;
  eventType: RealtimeEventType;
  payload: unknown;
  createdAt: string;
};

export type ClientRealtimeEvent = {
  type: "note.created" | "note.updated" | "note.deleted" | "note.subscribed" | "presence.updated";
  eventId: string;
  sequence: string;
  payload: unknown;
  createdAt: string;
};

const clientEventTypeByStoredType: Record<RealtimeEventType, ClientRealtimeEvent["type"]> = {
  NOTE_CREATED: "note.created",
  NOTE_UPDATED: "note.updated",
  NOTE_DELETED: "note.deleted",
  NOTE_SUBSCRIBED: "note.subscribed",
  PRESENCE_UPDATED: "presence.updated"
};

export function toClientRealtimeEvent(event: StoredRealtimeEvent): ClientRealtimeEvent {
  return {
    type: clientEventTypeByStoredType[event.eventType],
    eventId: event.id,
    sequence: event.sequence,
    payload: event.payload,
    createdAt: event.createdAt
  };
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/realtime/event-log.repository.ts</span>
  </div>

```ts
import { Prisma, type RealtimeEvent, type RealtimeEventType, type RealtimeResourceType } from "../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import type { StoredRealtimeEvent } from "./events.js";

export type CreateRealtimeEventInput = {
  ownerId: string;
  resourceType: RealtimeResourceType;
  resourceId: string;
  eventType: RealtimeEventType;
  payload: Prisma.InputJsonValue;
};

function toStoredRealtimeEvent(event: RealtimeEvent): StoredRealtimeEvent {
  return {
    id: event.id,
    sequence: event.sequence.toString(),
    ownerId: event.ownerId,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    eventType: event.eventType,
    payload: event.payload,
    createdAt: event.createdAt.toISOString()
  };
}

export async function appendRealtimeEvent(input: CreateRealtimeEventInput): Promise<StoredRealtimeEvent> {
  const event = await prisma.realtimeEvent.create({ data: input });
  return toStoredRealtimeEvent(event);
}

export async function findEventsAfter(input: {
  ownerId: string;
  afterSequence?: string;
  resourceType?: RealtimeResourceType;
  resourceId?: string;
  limit: number;
}): Promise<StoredRealtimeEvent[]> {
  const events = await prisma.realtimeEvent.findMany({
    where: {
      ownerId: input.ownerId,
      sequence: input.afterSequence ? { gt: BigInt(input.afterSequence) } : undefined,
      resourceType: input.resourceType,
      resourceId: input.resourceId
    },
    orderBy: { sequence: "asc" },
    take: input.limit
  });

  return events.map(toStoredRealtimeEvent);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/realtime/event-payload.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const noteEventPayloadSchema = z.object({
  noteId: z.string().uuid(),
  notebookId: z.string().uuid(),
  title: z.string().min(1).optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional()
});

export const presenceEventPayloadSchema = z.object({
  noteId: z.string().uuid(),
  userId: z.string().uuid(),
  cursor: z.object({
    line: z.number().int().nonnegative(),
    column: z.number().int().nonnegative()
  })
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/realtime/event-publisher.ts</span>
  </div>

```ts
import { RealtimeEventType, RealtimeResourceType, type Prisma } from "../generated/prisma/client.js";
import { publishEventNotification } from "../redis/redis-pubsub.js";
import { sseRegistry } from "../sse/sse-registry.js";
import { websocketRegistry } from "../websocket/websocket-registry.js";
import { appendRealtimeEvent } from "./event-log.repository.js";
import type { StoredRealtimeEvent } from "./events.js";

export async function recordAndPublishNoteEvent(input: {
  ownerId: string;
  noteId: string;
  eventType: typeof RealtimeEventType.NOTE_CREATED | typeof RealtimeEventType.NOTE_UPDATED | typeof RealtimeEventType.NOTE_DELETED;
  payload: Prisma.InputJsonValue;
}): Promise<StoredRealtimeEvent> {
  const event = await appendRealtimeEvent({
    ownerId: input.ownerId,
    resourceType: RealtimeResourceType.NOTE,
    resourceId: input.noteId,
    eventType: input.eventType,
    payload: input.payload
  });

  deliverRealtimeEvent(event);
  await publishEventNotification(event);
  return event;
}

export function deliverRealtimeEvent(event: StoredRealtimeEvent): void {
  sseRegistry.sendToUser(event.ownerId, event);
  websocketRegistry.sendToUser(event.ownerId, event);

  if (event.resourceType === RealtimeResourceType.NOTE) {
    sseRegistry.sendToNote(event.resourceId, event);
    websocketRegistry.sendToNote(event.resourceId, event);
  }
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/realtime/replay.ts</span>
  </div>

```ts
import { RealtimeResourceType } from "../generated/prisma/client.js";
import { findEventsAfter } from "./event-log.repository.js";
import type { StoredRealtimeEvent } from "./events.js";

export function parseLastEventId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  return trimmed;
}

export function isReplaySequence(value: string | undefined): value is string {
  return value !== undefined && /^\d+$/.test(value);
}

export async function loadUserReplayEvents(ownerId: string, lastEventId: string | undefined): Promise<StoredRealtimeEvent[]> {
  return findEventsAfter({
    ownerId,
    afterSequence: parseLastEventId(lastEventId),
    limit: 100
  });
}

export async function loadNoteReplayEvents(ownerId: string, noteId: string, lastEventId: string | undefined): Promise<StoredRealtimeEvent[]> {
  return findEventsAfter({
    ownerId,
    afterSequence: parseLastEventId(lastEventId),
    resourceType: RealtimeResourceType.NOTE,
    resourceId: noteId,
    limit: 100
  });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/sse/sse-format.ts</span>
  </div>

```ts
import type { StoredRealtimeEvent } from "../realtime/events.js";
import { toClientRealtimeEvent } from "../realtime/events.js";

export type SseEvent = {
  id?: string;
  event?: string;
  retry?: number;
  data: unknown;
};

export function formatSseEvent(input: SseEvent): string {
  const lines: string[] = [];
  if (input.id) lines.push(`id: ${input.id}`);
  if (input.event) lines.push(`event: ${input.event}`);
  if (input.retry !== undefined) lines.push(`retry: ${input.retry}`);

  const serialized = typeof input.data === "string" ? input.data : JSON.stringify(input.data);
  for (const line of serialized.split(/\r?\n/)) {
    lines.push(`data: ${line}`);
  }

  return `${lines.join("\n")}\n\n`;
}

export function formatSseComment(comment: string): string {
  return `: ${comment}\n\n`;
}

export function formatStoredRealtimeEvent(event: StoredRealtimeEvent): string {
  const clientEvent = toClientRealtimeEvent(event);
  return formatSseEvent({
    id: event.sequence,
    event: clientEvent.type,
    data: clientEvent
  });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/sse/sse-heartbeat.ts</span>
  </div>

```ts
import type { Response } from "express";
import { config } from "../config/env.js";
import { formatSseEvent } from "./sse-format.js";

export function startSseHeartbeat(response: Response): NodeJS.Timeout {
  return setInterval(() => {
    response.write(formatSseEvent({
      event: "heartbeat",
      data: { now: new Date().toISOString() }
    }));
  }, config.HEARTBEAT_INTERVAL_MS);
}

export function stopSseHeartbeat(timer: NodeJS.Timeout): void {
  clearInterval(timer);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/sse/sse-connection.ts</span>
  </div>

```ts
import type { Response } from "express";

export type SseConnection = {
  connectionId: string;
  userId: string;
  noteId?: string;
  response: Response;
  heartbeat: NodeJS.Timeout;
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/sse/sse-registry.ts</span>
  </div>

```ts
import type { StoredRealtimeEvent } from "../realtime/events.js";
import { formatStoredRealtimeEvent, formatSseEvent } from "./sse-format.js";
import type { SseConnection } from "./sse-connection.js";

export class SseRegistry {
  private readonly connections = new Map<string, SseConnection>();

  add(connection: SseConnection): void {
    this.connections.set(connection.connectionId, connection);
  }

  remove(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  sendToUser(userId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.userId === userId && !connection.noteId) {
        connection.response.write(formatStoredRealtimeEvent(event));
      }
    }
  }

  sendToNote(noteId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.noteId === noteId) {
        connection.response.write(formatStoredRealtimeEvent(event));
      }
    }
  }

  closeAll(): void {
    for (const connection of this.connections.values()) {
      clearInterval(connection.heartbeat);
      connection.response.write(formatSseEvent({
        event: "server.shutdown",
        data: { reason: "Server shutdown" }
      }));
      connection.response.end();
    }

    this.connections.clear();
  }

  size(): number {
    return this.connections.size;
  }
}

export const sseRegistry = new SseRegistry();
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/sse/sse.controller.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { findNoteById } from "../modules/notes/notes.repository.js";
import { requireAuthContext } from "../shared/auth/auth-context.js";
import { requireOwner } from "../shared/auth/authorize-owner.js";
import { HttpError } from "../shared/errors/http-error.js";
import { loadNoteReplayEvents, loadUserReplayEvents } from "../realtime/replay.js";
import { formatSseEvent, formatStoredRealtimeEvent } from "./sse-format.js";
import { startSseHeartbeat, stopSseHeartbeat } from "./sse-heartbeat.js";
import { sseRegistry } from "./sse-registry.js";

function prepareSseResponse(response: Parameters<RequestHandler>[1]): void {
  response.status(200);
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();
}

export const connectUserEvents: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    prepareSseResponse(response);

    const connectionId = randomUUID();
    const heartbeat = startSseHeartbeat(response);

    const cleanup = (): void => {
      stopSseHeartbeat(heartbeat);
      sseRegistry.remove(connectionId);
    };

    request.once("close", cleanup);

    sseRegistry.add({ connectionId, userId: auth.userId, response, heartbeat });

    response.write(formatSseEvent({ event: "connection.ready", data: { connectionId } }));

    const replayEvents = await loadUserReplayEvents(auth.userId, request.header("Last-Event-ID"));
    for (const event of replayEvents) {
      response.write(formatStoredRealtimeEvent(event));
    }
  } catch (error) {
    next(error);
  }
};

export const connectNoteEvents: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    const note = await findNoteById(noteId);
    if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
    requireOwner(note.ownerId, auth.userId);

    prepareSseResponse(response);

    const connectionId = randomUUID();
    const heartbeat = startSseHeartbeat(response);

    const cleanup = (): void => {
      stopSseHeartbeat(heartbeat);
      sseRegistry.remove(connectionId);
    };

    request.once("close", cleanup);

    sseRegistry.add({ connectionId, userId: auth.userId, noteId: note.id, response, heartbeat });

    response.write(formatSseEvent({ event: "connection.ready", data: { connectionId } }));

    const replayEvents = await loadNoteReplayEvents(auth.userId, note.id, request.header("Last-Event-ID"));
    for (const event of replayEvents) {
      response.write(formatStoredRealtimeEvent(event));
    }
  } catch (error) {
    next(error);
  }
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/sse/sse.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { validateRequest } from "../shared/validation/validate-request.js";
import { noteParamsSchema } from "../modules/notes/notes.schema.js";
import { connectNoteEvents, connectUserEvents } from "./sse.controller.js";

export const sseRoutes = Router();

sseRoutes.get("/", connectUserEvents);
sseRoutes.get("/notes/:noteId", validateRequest({ params: noteParamsSchema }), connectNoteEvents);
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-close.ts</span>
  </div>

```ts
export const websocketCloseCodes = {
  normal: 1000,
  goingAway: 1001,
  invalidPayload: 1007,
  policyViolation: 1008,
  tryAgainLater: 1013
} as const;

export function safeCloseReason(reason: string): string {
  return reason.slice(0, 120);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-send.ts</span>
  </div>

```ts
import WebSocket from "ws";
import { websocketCloseCodes } from "./websocket-close.js";

export type WebSocketSendResult = "sent" | "closed" | "backpressure";

export function sendJsonWithBackpressure(socket: WebSocket, payload: unknown, maxBufferedBytes: number): WebSocketSendResult {
  if (socket.readyState !== WebSocket.OPEN) {
    return "closed";
  }

  if (socket.bufferedAmount > maxBufferedBytes) {
    socket.close(websocketCloseCodes.tryAgainLater, "Backpressure limit exceeded");
    return "backpressure";
  }

  socket.send(JSON.stringify(payload));
  return "sent";
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-registry.ts</span>
  </div>

```ts
import WebSocket from "ws";
import { config } from "../config/env.js";
import type { AuthContext } from "../shared/auth/auth-context.js";
import type { StoredRealtimeEvent } from "../realtime/events.js";
import { toClientRealtimeEvent } from "../realtime/events.js";
import { sendJsonWithBackpressure } from "./websocket-send.js";

export type WebSocketConnection = {
  connectionId: string;
  userId: string;
  sessionId: string;
  socket: WebSocket;
  subscribedNoteIds: Set<string>;
  isAlive: boolean;
};

export class WebSocketRegistry {
  private readonly connections = new Map<string, WebSocketConnection>();

  add(connectionId: string, auth: AuthContext, socket: WebSocket): WebSocketConnection {
    const connection: WebSocketConnection = {
      connectionId,
      userId: auth.userId,
      sessionId: auth.sessionId,
      socket,
      subscribedNoteIds: new Set(),
      isAlive: true
    };
    this.connections.set(connectionId, connection);
    return connection;
  }

  get(connectionId: string): WebSocketConnection | undefined {
    return this.connections.get(connectionId);
  }

  remove(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  markAlive(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) connection.isAlive = true;
  }

  subscribeNote(connectionId: string, noteId: string): void {
    this.connections.get(connectionId)?.subscribedNoteIds.add(noteId);
  }

  unsubscribeNote(connectionId: string, noteId: string): void {
    this.connections.get(connectionId)?.subscribedNoteIds.delete(noteId);
  }

  entries(): Iterable<WebSocketConnection> {
    return this.connections.values();
  }

  sendToUser(userId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.userId === userId) {
        sendJsonWithBackpressure(connection.socket, toClientRealtimeEvent(event), config.WS_BACKPRESSURE_LIMIT_BYTES);
      }
    }
  }

  sendToNote(noteId: string, event: StoredRealtimeEvent): void {
    for (const connection of this.connections.values()) {
      if (connection.subscribedNoteIds.has(noteId)) {
        sendJsonWithBackpressure(connection.socket, toClientRealtimeEvent(event), config.WS_BACKPRESSURE_LIMIT_BYTES);
      }
    }
  }

  sendMessageToNote(noteId: string, message: unknown): void {
    for (const connection of this.connections.values()) {
      if (connection.subscribedNoteIds.has(noteId)) {
        sendJsonWithBackpressure(connection.socket, message, config.WS_BACKPRESSURE_LIMIT_BYTES);
      }
    }
  }

  closeAll(code: number, reason: string): void {
    for (const connection of this.connections.values()) {
      connection.socket.close(code, reason);
    }
    this.connections.clear();
  }

  size(): number {
    return this.connections.size;
  }
}

export const websocketRegistry = new WebSocketRegistry();
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-message.schema.ts</span>
  </div>

```ts
import { z } from "zod";

const requestIdSchema = z.string().uuid();
const noteIdSchema = z.string().uuid();

export const websocketClientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("subscribe.note"),
    requestId: requestIdSchema,
    noteId: noteIdSchema
  }),
  z.object({
    type: z.literal("unsubscribe.note"),
    requestId: requestIdSchema,
    noteId: noteIdSchema
  }),
  z.object({
    type: z.literal("presence.note"),
    requestId: requestIdSchema,
    noteId: noteIdSchema,
    cursor: z.object({
      line: z.number().int().nonnegative(),
      column: z.number().int().nonnegative()
    })
  })
]);

export type WebSocketClientMessage = z.infer<typeof websocketClientMessageSchema>;
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-origin.ts</span>
  </div>

```ts
import { config } from "../config/env.js";

export function isAllowedWebSocketOrigin(origin: string | undefined): boolean {
  if (config.ALLOWED_ORIGINS.length === 0) return true;
  if (!origin) return false;
  return config.ALLOWED_ORIGINS.includes(origin);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-auth.ts</span>
  </div>

```ts
import type { IncomingMessage } from "node:http";
import { config } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import type { AuthContext } from "../shared/auth/auth-context.js";
import { parseCookieHeader } from "../shared/cookies/cookie-parser.js";
import { hashSessionToken } from "../shared/auth/session-token.js";

export async function authenticateWebSocketRequest(request: IncomingMessage): Promise<AuthContext | null> {
  const cookies = parseCookieHeader(request.headers.cookie);
  const token = cookies.get(config.SESSION_COOKIE_NAME);
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true }
  });

  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return {
    userId: session.userId,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id
  };
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-heartbeat.ts</span>
  </div>

```ts
import type { WebSocketRegistry } from "./websocket-registry.js";

export function startWebSocketHeartbeat(registry: WebSocketRegistry, intervalMs: number): () => void {
  const timer = setInterval(() => {
    for (const connection of registry.entries()) {
      if (!connection.isAlive) {
        connection.socket.terminate();
        registry.remove(connection.connectionId);
        continue;
      }

      connection.isAlive = false;
      connection.socket.ping();
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-router.ts</span>
  </div>

```ts
import type { RawData } from "ws";
import { RealtimeEventType, RealtimeResourceType } from "../generated/prisma/client.js";
import { config } from "../config/env.js";
import { findNoteById } from "../modules/notes/notes.repository.js";
import { appendRealtimeEvent } from "../realtime/event-log.repository.js";
import { publishEventNotification } from "../redis/redis-pubsub.js";
import { websocketClientMessageSchema, type WebSocketClientMessage } from "./websocket-message.schema.js";
import type { WebSocketRegistry } from "./websocket-registry.js";
import { sendJsonWithBackpressure } from "./websocket-send.js";
import { websocketCloseCodes } from "./websocket-close.js";

function rawDataToString(raw: RawData): string {
  if (typeof raw === "string") return raw;
  if (raw instanceof Buffer) return raw.toString("utf8");
  if (Array.isArray(raw)) return Buffer.concat(raw).toString("utf8");
  return Buffer.from(new Uint8Array(raw as ArrayBuffer)).toString("utf8");
}

async function ensureOwnedNote(noteId: string, userId: string): Promise<boolean> {
  const note = await findNoteById(noteId);
  return Boolean(note && note.ownerId === userId);
}

async function handleSubscribe(connectionId: string, message: Extract<WebSocketClientMessage, { type: "subscribe.note" }>, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;

  if (!(await ensureOwnedNote(message.noteId, connection.userId))) {
    sendJsonWithBackpressure(connection.socket, {
      type: "subscription.rejected",
      requestId: message.requestId,
      code: "OWNER_REQUIRED",
      message: "The note does not belong to the authenticated user."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    return;
  }

  registry.subscribeNote(connectionId, message.noteId);
  const event = await appendRealtimeEvent({
    ownerId: connection.userId,
    resourceType: RealtimeResourceType.NOTE,
    resourceId: message.noteId,
    eventType: RealtimeEventType.NOTE_SUBSCRIBED,
    payload: { noteId: message.noteId }
  });
  await publishEventNotification(event);

  sendJsonWithBackpressure(connection.socket, {
    type: "subscription.accepted",
    requestId: message.requestId,
    noteId: message.noteId
  }, config.WS_BACKPRESSURE_LIMIT_BYTES);
}

async function handleUnsubscribe(connectionId: string, message: Extract<WebSocketClientMessage, { type: "unsubscribe.note" }>, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;
  registry.unsubscribeNote(connectionId, message.noteId);
  sendJsonWithBackpressure(connection.socket, {
    type: "subscription.removed",
    requestId: message.requestId,
    noteId: message.noteId
  }, config.WS_BACKPRESSURE_LIMIT_BYTES);
}

async function handlePresence(connectionId: string, message: Extract<WebSocketClientMessage, { type: "presence.note" }>, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;

  if (!(await ensureOwnedNote(message.noteId, connection.userId))) {
    sendJsonWithBackpressure(connection.socket, {
      type: "subscription.rejected",
      requestId: message.requestId,
      code: "OWNER_REQUIRED",
      message: "The note does not belong to the authenticated user."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    return;
  }

  registry.sendMessageToNote(message.noteId, {
    type: "presence.note",
    requestId: message.requestId,
    noteId: message.noteId,
    userId: connection.userId,
    cursor: message.cursor
  });
}

export async function handleWebSocketMessage(connectionId: string, raw: RawData, registry: WebSocketRegistry): Promise<void> {
  const connection = registry.get(connectionId);
  if (!connection) return;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawDataToString(raw));
  } catch {
    sendJsonWithBackpressure(connection.socket, {
      type: "error",
      code: "INVALID_JSON",
      message: "WebSocket messages must be JSON."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    connection.socket.close(websocketCloseCodes.invalidPayload, "Invalid JSON");
    return;
  }

  const parsedMessage = websocketClientMessageSchema.safeParse(parsedJson);
  if (!parsedMessage.success) {
    sendJsonWithBackpressure(connection.socket, {
      type: "error",
      code: "INVALID_MESSAGE",
      message: "WebSocket message schema validation failed."
    }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    return;
  }

  if (parsedMessage.data.type === "subscribe.note") {
    await handleSubscribe(connectionId, parsedMessage.data, registry);
    return;
  }

  if (parsedMessage.data.type === "unsubscribe.note") {
    await handleUnsubscribe(connectionId, parsedMessage.data, registry);
    return;
  }

  await handlePresence(connectionId, parsedMessage.data, registry);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-server.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";
import { config } from "../config/env.js";
import type { AuthContext } from "../shared/auth/auth-context.js";
import { handleWebSocketMessage } from "./websocket-router.js";
import { sendJsonWithBackpressure } from "./websocket-send.js";
import { websocketCloseCodes } from "./websocket-close.js";
import { startWebSocketHeartbeat } from "./websocket-heartbeat.js";
import { websocketRegistry, type WebSocketRegistry } from "./websocket-registry.js";

export class RealtimeWebSocketServer {
  private readonly webSocketServer = new WebSocketServer({
    noServer: true,
    maxPayload: config.WS_MAX_PAYLOAD_BYTES
  });

  private stopHeartbeat: (() => void) | undefined;

  constructor(private readonly registry: WebSocketRegistry = websocketRegistry) {}

  startHeartbeat(): void {
    this.stopHeartbeat = startWebSocketHeartbeat(this.registry, config.HEARTBEAT_INTERVAL_MS);
  }

  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer, auth: AuthContext): void {
    this.webSocketServer.handleUpgrade(request, socket, head, (websocket) => {
      const connectionId = randomUUID();
      this.registry.add(connectionId, auth, websocket);

      websocket.on("message", (raw) => {
        void handleWebSocketMessage(connectionId, raw, this.registry);
      });

      websocket.on("pong", () => {
        this.registry.markAlive(connectionId);
      });

      websocket.on("close", () => {
        this.registry.remove(connectionId);
      });

      sendJsonWithBackpressure(websocket, {
        type: "connection.ready",
        connectionId
      }, config.WS_BACKPRESSURE_LIMIT_BYTES);
    });
  }

  closeAll(reason: string): void {
    this.stopHeartbeat?.();
    this.registry.closeAll(websocketCloseCodes.goingAway, reason);
    this.webSocketServer.close();
  }
}

export function createRealtimeWebSocketServer(): RealtimeWebSocketServer {
  const server = new RealtimeWebSocketServer();
  server.startHeartbeat();
  return server;
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/websocket/websocket-upgrade.ts</span>
  </div>

```ts
import type { Server } from "node:http";
import type { Duplex } from "node:stream";
import { authenticateWebSocketRequest } from "./websocket-auth.js";
import { isAllowedWebSocketOrigin } from "./websocket-origin.js";
import type { RealtimeWebSocketServer } from "./websocket-server.js";

export type WebSocketUpgradeController = {
  stopAccepting: () => void;
};

function rejectUpgrade(socket: Duplex, statusCode: number, reasonPhrase: string): void {
  socket.write(`HTTP/1.1 ${statusCode} ${reasonPhrase}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
}

export function installWebSocketUpgrade(server: Server, realtimeServer: RealtimeWebSocketServer): WebSocketUpgradeController {
  let accepting = true;

  server.on("upgrade", async (request, socket, head) => {
    if (!accepting) {
      rejectUpgrade(socket, 503, "Service Unavailable");
      return;
    }

    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    if (pathname !== "/ws") {
      rejectUpgrade(socket, 404, "Not Found");
      return;
    }

    if (!isAllowedWebSocketOrigin(request.headers.origin)) {
      rejectUpgrade(socket, 403, "Forbidden");
      return;
    }

    const auth = await authenticateWebSocketRequest(request);
    if (!auth) {
      rejectUpgrade(socket, 401, "Unauthorized");
      return;
    }

    realtimeServer.handleUpgrade(request, socket, head, auth);
  });

  return {
    stopAccepting: () => {
      accepting = false;
    }
  };
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/auth/auth.types.ts</span>
  </div>

```ts
import type { Role } from "../../generated/prisma/client.js";

export type PublicUserDto = {
  id: string;
  email: string;
  role: Role;
};

export type AuthResult = {
  user: PublicUserDto;
  sessionToken: string;
  expiresAt: Date;
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/auth/auth.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(128)
});

export const loginSchema = registerSchema;
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/auth/auth.repository.ts</span>
  </div>

```ts
import { createHash } from "node:crypto";
import { prisma } from "../../db/prisma.js";
import { Role } from "../../generated/prisma/client.js";

export async function createUser(input: { email: string; passwordHash: string }) {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      role: Role.USER
    }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createSession(input: { userId: string; tokenHash: string; userAgent?: string; ip?: string; expiresAt: Date }) {
  return prisma.session.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      userAgent: input.userAgent,
      ipHash: input.ip ? createHash("sha256").update(input.ip).digest("base64url") : undefined,
      expiresAt: input.expiresAt
    }
  });
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() }
  });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/auth/auth.service.ts</span>
  </div>

```ts
import { config } from "../../config/env.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { hashPassword, verifyPassword } from "../../shared/auth/password-hashing.js";
import { createSessionToken, hashSessionToken } from "../../shared/auth/session-token.js";
import { createSession, createUser, findUserByEmail, revokeSession } from "./auth.repository.js";
import type { AuthResult, PublicUserDto } from "./auth.types.js";

function toPublicUser(user: { id: string; email: string; role: PublicUserDto["role"] }): PublicUserDto {
  return { id: user.id, email: user.email, role: user.role };
}

async function createAuthResult(user: { id: string; email: string; role: PublicUserDto["role"] }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const sessionToken = createSessionToken();
  const expiresAt = new Date(Date.now() + config.SESSION_TTL_SECONDS * 1000);
  await createSession({
    userId: user.id,
    tokenHash: hashSessionToken(sessionToken),
    userAgent: requestMeta.userAgent,
    ip: requestMeta.ip,
    expiresAt
  });

  return { user: toPublicUser(user), sessionToken, expiresAt };
}

export async function register(input: { email: string; password: string }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new HttpError(409, "Email is already registered.", "EMAIL_REGISTERED");
  }

  const user = await createUser({
    email: input.email,
    passwordHash: hashPassword(input.password)
  });

  return createAuthResult(user, requestMeta);
}

export async function login(input: { email: string; password: string }, requestMeta: { userAgent?: string; ip?: string }): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new HttpError(401, "Email or password is invalid.", "INVALID_CREDENTIALS");
  }

  return createAuthResult(user, requestMeta);
}

export async function logout(sessionId: string): Promise<void> {
  await revokeSession(sessionId);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/auth/auth.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { issueCsrfTokenForSession } from "../../shared/auth/csrf.js";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { setSessionCookie, clearSessionCookie, setCsrfCookie } from "../../shared/cookies/session-cookie.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { login, logout, register } from "./auth.service.js";

const requestMeta = (request: Parameters<RequestHandler>[0]) => ({
  userAgent: request.header("user-agent") ?? undefined,
  ip: request.ip
});

export const registerController: RequestHandler = async (request, response, next) => {
  try {
    const result = await register(request.body, requestMeta(request));
    setSessionCookie(response, result.sessionToken, result.expiresAt);
    sendSuccess(response, 201, { user: result.user });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const result = await login(request.body, requestMeta(request));
    setSessionCookie(response, result.sessionToken, result.expiresAt);
    sendSuccess(response, 200, { user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    await logout(auth.sessionId);
    clearSessionCookie(response);
    sendSuccess(response, 200, { loggedOut: true });
  } catch (error) {
    next(error);
  }
};

export const meController: RequestHandler = (_request, response) => {
  const auth = requireAuthContext(response);
  sendSuccess(response, 200, { user: { id: auth.userId, email: auth.email, role: auth.role } });
};

export const csrfController: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const csrfToken = await issueCsrfTokenForSession(auth.sessionId);
    setCsrfCookie(response, csrfToken);
    sendSuccess(response, 200, { csrfToken });
  } catch (error) {
    next(error);
  }
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/auth/auth.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { authenticateSession } from "../../shared/auth/authenticate-session.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { csrfController, loginController, logoutController, meController, registerController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest({ body: registerSchema }), registerController);
authRoutes.post("/login", validateRequest({ body: loginSchema }), loginController);
authRoutes.post("/logout", authenticateSession, requireCsrfToken, logoutController);
authRoutes.get("/me", authenticateSession, meController);
authRoutes.get("/csrf", authenticateSession, csrfController);
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/users/users.types.ts</span>
  </div>

```ts
import type { Role } from "../../generated/prisma/client.js";

export type UserRecord = {
  id: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/users/users.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notebooks/notebooks.types.ts</span>
  </div>

```ts
import type { Notebook } from "../../generated/prisma/client.js";

export type NotebookRecord = Notebook;

export type NotebookDto = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notebooks/notebooks.schema.ts</span>
  </div>

```ts
import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNotebookSchema = z.object({
  name: z.string().min(1).max(120)
});

export const updateNotebookSchema = createNotebookSchema;
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notebooks/notebooks.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import type { NotebookDto, NotebookRecord } from "./notebooks.types.js";

export function toNotebookDto(notebook: NotebookRecord): NotebookDto {
  return {
    id: notebook.id,
    name: notebook.name,
    createdAt: notebook.createdAt.toISOString(),
    updatedAt: notebook.updatedAt.toISOString()
  };
}

export async function listNotebooks(ownerId: string): Promise<NotebookRecord[]> {
  return prisma.notebook.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" }
  });
}

export async function findNotebookById(id: string): Promise<NotebookRecord | null> {
  return prisma.notebook.findUnique({ where: { id } });
}

export async function createNotebook(input: { ownerId: string; name: string }): Promise<NotebookRecord> {
  return prisma.notebook.create({ data: input });
}

export async function updateNotebook(id: string, input: { name: string }): Promise<NotebookRecord> {
  return prisma.notebook.update({
    where: { id },
    data: input
  });
}

export async function deleteNotebook(id: string): Promise<void> {
  await prisma.notebook.delete({ where: { id } });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notebooks/notebooks.service.ts</span>
  </div>

```ts
import { requireOwner } from "../../shared/auth/authorize-owner.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { createNotebook, deleteNotebook, findNotebookById, listNotebooks, toNotebookDto, updateNotebook } from "./notebooks.repository.js";
import type { NotebookDto } from "./notebooks.types.js";

export async function listUserNotebooks(ownerId: string): Promise<NotebookDto[]> {
  const notebooks = await listNotebooks(ownerId);
  return notebooks.map(toNotebookDto);
}

export async function getNotebook(ownerId: string, notebookId: string): Promise<NotebookDto> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);
  return toNotebookDto(notebook);
}

export async function createUserNotebook(ownerId: string, input: { name: string }): Promise<NotebookDto> {
  return toNotebookDto(await createNotebook({ ownerId, name: input.name }));
}

export async function updateUserNotebook(ownerId: string, notebookId: string, input: { name: string }): Promise<NotebookDto> {
  await getNotebook(ownerId, notebookId);
  return toNotebookDto(await updateNotebook(notebookId, input));
}

export async function deleteUserNotebook(ownerId: string, notebookId: string): Promise<void> {
  await getNotebook(ownerId, notebookId);
  await deleteNotebook(notebookId);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notebooks/notebooks.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { createUserNotebook, deleteUserNotebook, getNotebook, listUserNotebooks, updateUserNotebook } from "./notebooks.service.js";

export const list: RequestHandler = async (_request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    sendSuccess(response, 200, { notebooks: await listUserNotebooks(auth.userId) });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notebook: await getNotebook(auth.userId, notebookId) });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    sendSuccess(response, 201, { notebook: await createUserNotebook(auth.userId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notebook: await updateUserNotebook(auth.userId, notebookId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    await deleteUserNotebook(auth.userId, notebookId);
    sendSuccess(response, 200, { deleted: true });
  } catch (error) {
    next(error);
  }
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notebooks/notebooks.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createNotebookSchema, notebookParamsSchema, updateNotebookSchema } from "./notebooks.schema.js";
import * as controller from "./notebooks.controller.js";
import { notebookNotesRoutes } from "../notes/notebook-notes.routes.js";

export const notebookRoutes = Router();

notebookRoutes.get("/", controller.list);
notebookRoutes.post("/", requireCsrfToken, validateRequest({ body: createNotebookSchema }), controller.create);
notebookRoutes.get("/:notebookId", validateRequest({ params: notebookParamsSchema }), controller.getById);
notebookRoutes.patch("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema, body: updateNotebookSchema }), controller.update);
notebookRoutes.delete("/:notebookId", requireCsrfToken, validateRequest({ params: notebookParamsSchema }), controller.remove);
notebookRoutes.use("/:notebookId/notes", notebookNotesRoutes);
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notes.types.ts</span>
  </div>

```ts
import type { Note, NoteStatus } from "../../generated/prisma/client.js";

export type NoteRecord = Note;
export type { NoteStatus };

export type NoteDto = {
  id: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notes.schema.ts</span>
  </div>

```ts
import { z } from "zod";

const noteStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const listNotesQuerySchema = z.object({
  status: noteStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export const createNoteSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().max(20000).default(""),
  status: noteStatusSchema.default("ACTIVE")
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  body: z.string().max(20000).optional(),
  status: noteStatusSchema.optional()
}).refine((input) => Object.keys(input).length > 0, {
  message: "At least one note field is required."
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notes.repository.ts</span>
  </div>

```ts
import { prisma } from "../../db/prisma.js";
import type { NoteDto, NoteRecord, NoteStatus } from "./notes.types.js";

export function toNoteDto(note: NoteRecord): NoteDto {
  return {
    id: note.id,
    notebookId: note.notebookId,
    title: note.title,
    body: note.body,
    status: note.status,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  };
}

export async function listNotes(input: {
  ownerId: string;
  notebookId: string;
  status?: NoteStatus;
  limit: number;
  offset: number;
}): Promise<NoteRecord[]> {
  return prisma.note.findMany({
    where: {
      ownerId: input.ownerId,
      notebookId: input.notebookId,
      status: input.status
    },
    orderBy: { createdAt: "desc" },
    take: input.limit,
    skip: input.offset
  });
}

export async function findNoteById(id: string): Promise<NoteRecord | null> {
  return prisma.note.findUnique({ where: { id } });
}

export async function createNote(input: {
  ownerId: string;
  notebookId: string;
  title: string;
  body: string;
  status: NoteStatus;
}): Promise<NoteRecord> {
  return prisma.note.create({ data: input });
}

export async function updateNote(id: string, input: Partial<Pick<NoteRecord, "title" | "body" | "status">>): Promise<NoteRecord> {
  return prisma.note.update({
    where: { id },
    data: input
  });
}

export async function deleteNote(id: string): Promise<void> {
  await prisma.note.delete({ where: { id } });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notes.service.ts</span>
  </div>

```ts
import { RealtimeEventType } from "../../generated/prisma/client.js";
import { requireOwner } from "../../shared/auth/authorize-owner.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { findNotebookById } from "../notebooks/notebooks.repository.js";
import { recordAndPublishNoteEvent } from "../../realtime/event-publisher.js";
import { createNote, deleteNote, findNoteById, listNotes, toNoteDto, updateNote } from "./notes.repository.js";
import type { NoteDto, NoteStatus } from "./notes.types.js";

export async function listNotebookNotes(ownerId: string, notebookId: string, query: { status?: NoteStatus; limit: number; offset: number }): Promise<NoteDto[]> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);
  return (await listNotes({ ownerId, notebookId, ...query })).map(toNoteDto);
}

export async function createNotebookNote(ownerId: string, notebookId: string, input: { title: string; body: string; status: NoteStatus }): Promise<NoteDto> {
  const notebook = await findNotebookById(notebookId);
  if (!notebook) throw new HttpError(404, "Notebook was not found.", "NOTEBOOK_NOT_FOUND");
  requireOwner(notebook.ownerId, ownerId);

  const note = await createNote({ ownerId, notebookId, ...input });
  await recordAndPublishNoteEvent({
    ownerId,
    noteId: note.id,
    eventType: RealtimeEventType.NOTE_CREATED,
    payload: { noteId: note.id, notebookId: note.notebookId, title: note.title, updatedAt: note.updatedAt.toISOString() }
  });
  return toNoteDto(note);
}

export async function getNote(ownerId: string, noteId: string): Promise<NoteDto> {
  const note = await findNoteById(noteId);
  if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(note.ownerId, ownerId);
  return toNoteDto(note);
}

export async function updateUserNote(ownerId: string, noteId: string, input: Partial<{ title: string; body: string; status: NoteStatus }>): Promise<NoteDto> {
  const existing = await findNoteById(noteId);
  if (!existing) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(existing.ownerId, ownerId);

  const note = await updateNote(noteId, input);
  await recordAndPublishNoteEvent({
    ownerId,
    noteId: note.id,
    eventType: RealtimeEventType.NOTE_UPDATED,
    payload: { noteId: note.id, notebookId: note.notebookId, updatedAt: note.updatedAt.toISOString() }
  });
  return toNoteDto(note);
}

export async function deleteUserNote(ownerId: string, noteId: string): Promise<void> {
  const note = await findNoteById(noteId);
  if (!note) throw new HttpError(404, "Note was not found.", "NOTE_NOT_FOUND");
  requireOwner(note.ownerId, ownerId);
  await deleteNote(noteId);
  await recordAndPublishNoteEvent({
    ownerId,
    noteId,
    eventType: RealtimeEventType.NOTE_DELETED,
    payload: { noteId, notebookId: note.notebookId, deletedAt: new Date().toISOString() }
  });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notes.controller.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { requireAuthContext } from "../../shared/auth/auth-context.js";
import { sendSuccess } from "../../shared/responses/send-response.js";
import { createNotebookNote, deleteUserNote, getNote, listNotebookNotes, updateUserNote } from "./notes.service.js";

export const listForNotebook: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 200, { notes: await listNotebookNotes(auth.userId, notebookId, request.query as never) });
  } catch (error) {
    next(error);
  }
};

export const createForNotebook: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const notebookId = String(request.params.notebookId);
    sendSuccess(response, 201, { note: await createNotebookNote(auth.userId, notebookId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    sendSuccess(response, 200, { note: await getNote(auth.userId, noteId) });
  } catch (error) {
    next(error);
  }
};

export const updateById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    sendSuccess(response, 200, { note: await updateUserNote(auth.userId, noteId, request.body) });
  } catch (error) {
    next(error);
  }
};

export const removeById: RequestHandler = async (request, response, next) => {
  try {
    const auth = requireAuthContext(response);
    const noteId = String(request.params.noteId);
    await deleteUserNote(auth.userId, noteId);
    sendSuccess(response, 200, { deleted: true });
  } catch (error) {
    next(error);
  }
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notebook-notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { createNoteSchema, listNotesQuerySchema, notebookNoteParamsSchema } from "./notes.schema.js";
import * as controller from "./notes.controller.js";

export const notebookNotesRoutes = Router({ mergeParams: true });

notebookNotesRoutes.get("/", validateRequest({ params: notebookNoteParamsSchema, query: listNotesQuerySchema }), controller.listForNotebook);
notebookNotesRoutes.post("/", requireCsrfToken, validateRequest({ params: notebookNoteParamsSchema, body: createNoteSchema }), controller.createForNotebook);
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/modules/notes/notes.routes.ts</span>
  </div>

```ts
import { Router } from "express";
import { requireCsrfToken } from "../../shared/auth/csrf.js";
import { validateRequest } from "../../shared/validation/validate-request.js";
import { noteParamsSchema, updateNoteSchema } from "./notes.schema.js";
import * as controller from "./notes.controller.js";

export const notesRoutes = Router();

notesRoutes.get("/:noteId", validateRequest({ params: noteParamsSchema }), controller.getById);
notesRoutes.patch("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema, body: updateNoteSchema }), controller.updateById);
notesRoutes.delete("/:noteId", requireCsrfToken, validateRequest({ params: noteParamsSchema }), controller.removeById);
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/auth/auth-context.ts</span>
  </div>

```ts
import type { Response } from "express";
import type { Role } from "../../generated/prisma/client.js";

export type AuthContext = {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
};

export function attachAuthContext(response: Response, context: AuthContext): void {
  response.locals.auth = context;
}

export function requireAuthContext(response: Response): AuthContext {
  const context = response.locals.auth as AuthContext | undefined;
  if (!context) {
    throw new Error("Auth context is missing.");
  }

  return context;
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/auth/authenticate-session.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { config } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { parseCookieHeader } from "../cookies/cookie-parser.js";
import { attachAuthContext } from "./auth-context.js";
import { hashSessionToken } from "./session-token.js";

export const authenticateSession: RequestHandler = async (request, response, next) => {
  try {
    const cookies = parseCookieHeader(request.headers.cookie);
    const token = cookies.get(config.SESSION_COOKIE_NAME);

    if (!token) {
      throw new HttpError(401, "Authentication is required.", "AUTH_REQUIRED");
    }

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(401, "Authentication is required.", "AUTH_REQUIRED");
    }

    attachAuthContext(response, {
      userId: session.userId,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id
    });

    next();
  } catch (error) {
    next(error);
  }
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/auth/authorize-owner.ts</span>
  </div>

```ts
import { HttpError } from "../errors/http-error.js";

export function requireOwner(resourceOwnerId: string, authenticatedUserId: string): void {
  if (resourceOwnerId !== authenticatedUserId) {
    throw new HttpError(403, "The resource does not belong to the authenticated user.", "OWNER_REQUIRED");
  }
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/auth/csrf.ts</span>
  </div>

```ts
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../errors/http-error.js";
import { requireAuthContext } from "./auth-context.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCsrfToken(token: string): string {
  return createHash("sha256").update("csrf:" + token, "utf8").digest("base64url");
}

export async function issueCsrfTokenForSession(sessionId: string): Promise<string> {
  const token = createCsrfToken();
  await prisma.session.update({
    where: { id: sessionId },
    data: { csrfTokenHash: hashCsrfToken(token) }
  });
  return token;
}

export const requireCsrfToken: RequestHandler = async (request, response, next) => {
  try {
    if (SAFE_METHODS.has(request.method)) {
      next();
      return;
    }

    const auth = requireAuthContext(response);
    const token = request.header("x-csrf-token");
    if (!token) {
      throw new HttpError(403, "CSRF token is required.", "CSRF_REQUIRED");
    }

    const session = await prisma.session.findUnique({
      where: { id: auth.sessionId },
      select: { csrfTokenHash: true }
    });

    if (!session?.csrfTokenHash || !isHashMatch(hashCsrfToken(token), session.csrfTokenHash)) {
      throw new HttpError(403, "CSRF token is invalid.", "CSRF_INVALID");
    }

    next();
  } catch (error) {
    next(error);
  }
};

function isHashMatch(candidateHash: string, expectedHash: string): boolean {
  const candidate = Buffer.from(candidateHash, "base64url");
  const expected = Buffer.from(expectedHash, "base64url");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/auth/password-hashing.ts</span>
  </div>

```ts
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("base64url");
  return `${salt}.${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(".");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/auth/session-token.ts</span>
  </div>

```ts
import { createHash, randomBytes } from "node:crypto";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update("session:" + token, "utf8").digest("base64url");
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/cookies/session-cookie.ts</span>
  </div>

```ts
import type { Response } from "express";
import { config } from "../../config/env.js";

export function setSessionCookie(response: Response, token: string, expiresAt: Date): void {
  response.cookie(config.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.COOKIE_SECURE,
    expires: expiresAt,
    path: "/"
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(config.SESSION_COOKIE_NAME, { path: "/" });
}

export function setCsrfCookie(response: Response, token: string): void {
  response.cookie(config.CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: config.COOKIE_SECURE,
    path: "/"
  });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/cookies/cookie-parser.ts</span>
  </div>

```ts
export function parseCookieHeader(cookieHeader: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name) continue;
    cookies.set(name, decodeURIComponent(valueParts.join("=")));
  }

  return cookies;
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/errors/http-error.ts</span>
  </div>

```ts
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/errors/error-middleware.ts</span>
  </div>

```ts
import type { ErrorRequestHandler } from "express";
import { isPrismaKnownRequestError } from "../../db/prisma-errors.js";
import { isHttpError } from "./http-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isHttpError(error)) {
    response.status(error.status).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? []
      }
    });
    return;
  }

  if (isPrismaKnownRequestError(error)) {
    response.status(409).json({
      ok: false,
      error: {
        code: error.code,
        message: "Database constraint violation.",
        details: []
      }
    });
    return;
  }

  response.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error.",
      details: []
    }
  });
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/middleware/not-found.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

export const notFound: RequestHandler = () => {
  throw new HttpError(404, "Route was not found.", "ROUTE_NOT_FOUND");
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/middleware/request-id.ts</span>
  </div>

```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (request, response, next) => {
  const id = request.header("x-request-id") ?? randomUUID();
  response.setHeader("x-request-id", id);
  response.locals.requestId = id;
  next();
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/middleware/security-headers.ts</span>
  </div>

```ts
import helmet from "helmet";

export const securityHeaders = helmet();
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/middleware/cors.ts</span>
  </div>

```ts
import cors from "cors";
import { config } from "../../config/env.js";

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin is not allowed."));
  },
  allowedHeaders: ["content-type", "x-csrf-token", "last-event-id"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/middleware/rate-limit.ts</span>
  </div>

```ts
import { rateLimit } from "express-rate-limit";

export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/validation/validate-request.ts</span>
  </div>

```ts
import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../errors/http-error.js";

type RequestSchemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    try {
      if (schemas.params) request.params = schemas.params.parse(request.params) as typeof request.params;
      if (schemas.query) request.query = schemas.query.parse(request.query) as typeof request.query;
      if (schemas.body) request.body = schemas.body.parse(request.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new HttpError(400, "Request validation failed.", "VALIDATION_FAILED", error.issues));
        return;
      }

      next(error);
    }
  };
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/logging/logger.ts</span>
  </div>

```ts
type LogFields = Record<string, unknown>;

export const logger = {
  info(message: string, fields: LogFields = {}): void {
    console.info(message, fields);
  },
  warn(message: string, fields: LogFields = {}): void {
    console.warn(message, fields);
  },
  error(message: string, fields: LogFields = {}): void {
    console.error(message, fields);
  }
};
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/src/shared/responses/send-response.ts</span>
  </div>

```ts
import type { Response } from "express";

export function sendSuccess(response: Response, status: number, data: unknown): void {
  response.status(status).json({ ok: true, data });
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/openapi/openapi.yaml</span>
  </div>

```yaml
openapi: 3.1.0
info:
  title: Realtime Notes API
  version: 1.0.0
paths:
  /auth/register:
    post:
      summary: Register a user and create a cookie session.
      responses:
        "201":
          description: User registered.
  /auth/login:
    post:
      summary: Log in and create a cookie session.
      responses:
        "200":
          description: User logged in.
  /auth/logout:
    post:
      summary: Revoke the current session.
      responses:
        "200":
          description: User logged out.
  /auth/me:
    get:
      summary: Read the authenticated user.
      responses:
        "200":
          description: Authenticated user.
  /auth/csrf:
    get:
      summary: Issue a CSRF token for unsafe REST requests.
      responses:
        "200":
          description: CSRF token issued.
  /notebooks:
    get:
      summary: List notebooks.
      responses:
        "200":
          description: Notebook list.
    post:
      summary: Create notebook.
      responses:
        "201":
          description: Notebook created.
  /notebooks/{notebookId}:
    get:
      summary: Read notebook.
      parameters:
        - name: notebookId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Notebook.
    patch:
      summary: Update notebook.
      responses:
        "200":
          description: Notebook updated.
    delete:
      summary: Delete notebook.
      responses:
        "200":
          description: Notebook deleted.
  /notebooks/{notebookId}/notes:
    get:
      summary: List notes for a notebook.
      responses:
        "200":
          description: Notes list.
    post:
      summary: Create note and emit realtime event.
      responses:
        "201":
          description: Note created.
  /notes/{noteId}:
    get:
      summary: Read note.
      responses:
        "200":
          description: Note.
    patch:
      summary: Update note and emit realtime event.
      responses:
        "200":
          description: Note updated.
    delete:
      summary: Delete note and emit realtime event.
      responses:
        "200":
          description: Note deleted.
  /events:
    get:
      summary: Open an authenticated user-scoped SSE stream.
      responses:
        "200":
          description: text/event-stream response.
          content:
            text/event-stream:
              schema:
                type: string
  /events/notes/{noteId}:
    get:
      summary: Open an authenticated note-scoped SSE stream after owner authorization.
      responses:
        "200":
          description: text/event-stream response.
          content:
            text/event-stream:
              schema:
                type: string
  /ws:
    get:
      summary: WebSocket upgrade endpoint handled by the Node HTTP server upgrade event.
      description: OpenAPI can name the endpoint, but the message protocol is documented in README.md.
      responses:
        "101":
          description: Switching Protocols.
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/tests/helpers/database.ts</span>
  </div>

```ts
import { prisma } from "../../src/db/prisma.js";

export function integrationTestsEnabled(): boolean {
  return process.env.RUN_REALTIME_TESTS === "true" && Boolean(process.env.DATABASE_URL) && Boolean(process.env.REDIS_URL);
}

export async function resetDatabase(): Promise<void> {
  await prisma.realtimeEvent.deleteMany();
  await prisma.note.deleteMany();
  await prisma.notebook.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/tests/helpers/realtime.ts</span>
  </div>

```ts
import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import { app } from "../../src/app.js";
import { createRealtimeWebSocketServer } from "../../src/websocket/websocket-server.js";
import { installWebSocketUpgrade } from "../../src/websocket/websocket-upgrade.js";

export async function createRealtimeTestServer() {
  const httpServer = createServer(app);
  const websocketServer = createRealtimeWebSocketServer();
  const upgradeController = installWebSocketUpgrade(httpServer, websocketServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => resolve());
  });

  const address = httpServer.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${address.port}`,
    wsUrl: `ws://127.0.0.1:${address.port}/ws`,
    close: async () => {
      upgradeController.stopAccepting();
      websocketServer.closeAll("Test shutdown");
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }
  };
}
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/tests/sse.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { integrationTestsEnabled } from "./helpers/database.js";

test("SSE endpoint requires authentication", { skip: !integrationTestsEnabled() }, async () => {
  const response = await request(app).get("/events");
  assert.equal(response.status, 401);
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/tests/websocket.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import WebSocket from "ws";
import { createRealtimeTestServer } from "./helpers/realtime.js";
import { integrationTestsEnabled } from "./helpers/database.js";

test("WebSocket upgrade rejects missing cookie session", { skip: !integrationTestsEnabled() }, async () => {
  const server = await createRealtimeTestServer();
  try {
    const result = await new Promise<"open" | "error">((resolve) => {
      const client = new WebSocket(server.wsUrl, { headers: { Origin: "http://localhost:3000" } });
      client.once("open", () => resolve("open"));
      client.once("error", () => resolve("error"));
    });
    assert.equal(result, "error");
  } finally {
    await server.close();
  }
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/tests/event-log.integration.test.ts</span>
  </div>

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { RealtimeEventType, RealtimeResourceType } from "../src/generated/prisma/client.js";
import { appendRealtimeEvent, findEventsAfter } from "../src/realtime/event-log.repository.js";
import { integrationTestsEnabled, resetDatabase } from "./helpers/database.js";
import { prisma } from "../src/db/prisma.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

test("event replay reads owned events after a sequence", { skip: !integrationTestsEnabled() }, async () => {
  await resetDatabase();
  const user = await prisma.user.create({
    data: {
      email: "event-log@example.com",
      passwordHash: hashPassword("password-12345")
    }
  });

  const event = await appendRealtimeEvent({
    ownerId: user.id,
    resourceType: RealtimeResourceType.NOTE,
    resourceId: "00000000-0000-4000-8000-000000000001",
    eventType: RealtimeEventType.NOTE_UPDATED,
    payload: { noteId: "00000000-0000-4000-8000-000000000001" }
  });

  const replayed = await findEventsAfter({ ownerId: user.id, afterSequence: "0", limit: 10 });
  assert.equal(replayed[0]?.sequence, event.sequence);
});
```

</div>
<div class="macos-code-window">
  <div class="macos-code-titlebar">
    <span class="macos-code-dot macos-code-dot-red"></span>
    <span class="macos-code-dot macos-code-dot-yellow"></span>
    <span class="macos-code-dot macos-code-dot-green"></span>
    <span class="macos-code-title">mini-projects/realtime-notes-api/README.md</span>
  </div>

````markdown
# Realtime Notes API

This mini project demonstrates authenticated SSE streams, WebSocket upgrade handling, connection registries, PostgreSQL durable event replay, and Redis Pub/Sub live fan-out.

## Setup

Copy the example environment file into the project directory before running database commands.

```powershell
Set-Location D:\node.js\mini-projects\realtime-notes-api
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run seed
npm run typecheck
$env:NODE_ENV = "test"; npm test
```

```sh
cd mini-projects/realtime-notes-api
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run seed
npm run typecheck
NODE_ENV=test npm test
```

## Runtime

```powershell
npm run dev
```

```sh
npm run dev
```

## SSE

`GET /events` opens an authenticated user-scoped `text/event-stream` response. `GET /events/notes/:noteId` verifies note ownership before opening a note-scoped stream. `Last-Event-ID` is parsed as a durable sequence and replayed through PostgreSQL owner filtering.

## WebSocket protocol

The HTTP server handles `GET /ws` through the `upgrade` event. The upgrade validates Origin and cookie session before `ws` accepts the socket.

Client messages:

```json
{ "type": "subscribe.note", "requestId": "00000000-0000-4000-8000-000000000001", "noteId": "00000000-0000-4000-8000-000000000002" }
```

```json
{ "type": "unsubscribe.note", "requestId": "00000000-0000-4000-8000-000000000001", "noteId": "00000000-0000-4000-8000-000000000002" }
```

```json
{ "type": "presence.note", "requestId": "00000000-0000-4000-8000-000000000001", "noteId": "00000000-0000-4000-8000-000000000002", "cursor": { "line": 1, "column": 1 } }
```

Server messages:

```json
{ "type": "connection.ready", "connectionId": "00000000-0000-4000-8000-000000000003" }
```

```json
{ "type": "subscription.accepted", "requestId": "00000000-0000-4000-8000-000000000001", "noteId": "00000000-0000-4000-8000-000000000002" }
```

```json
{ "type": "subscription.rejected", "requestId": "00000000-0000-4000-8000-000000000001", "code": "OWNER_REQUIRED", "message": "The note does not belong to the authenticated user." }
```

## Event delivery boundary

PostgreSQL stores durable `RealtimeEvent` rows. Redis Pub/Sub only notifies currently live API instances and is not used as a replay store.

## Tests

Integration tests require PostgreSQL and Redis. Set `RUN_REALTIME_TESTS=true` when those services and `.env` are ready.

```powershell
$env:RUN_REALTIME_TESTS = "true"; $env:NODE_ENV = "test"; npm test
```

```sh
RUN_REALTIME_TESTS=true NODE_ENV=test npm test
```
````

</div>


<a id="section-15"></a>

## 15. 知识迁移与真实项目场景

真实项目会继续遇到 sticky sessions、cloud load balancers、WebRTC、Web Push、Socket.IO、Kafka、RabbitMQ、NATS、MQTT、GraphQL subscriptions 等边界。它们不是本章实现范围。本章要迁移的是底层判断：谁负责连接、谁负责授权、谁负责 durable history、谁负责 live fan-out、谁负责 cleanup。

<a id="section-16"></a>

## 16. 本章复盘任务

1. 解释为什么 `GET /events` 可以由 Express route 处理，而 `/ws` 必须由 Node HTTP server `upgrade` 处理。
2. 解释为什么 `Last-Event-ID` 不能直接作为授权证明。
3. 解释为什么 Redis Pub/Sub 不能替代 PostgreSQL event log。
4. 解释慢客户端如何导致 backpressure，以及代码如何识别。
5. 画出 REST note update 到 SSE/WebSocket client 的事件链路。

<a id="section-17"></a>

## 17. 最终心智模型

实时后端的核心不是某个库，而是边界：HTTP 长响应、HTTP upgrade、连接状态、消息验证、资源授权、durable event、live fan-out、heartbeat、backpressure、close cleanup。只要这些边界清楚，SSE、WebSocket、Redis 和 PostgreSQL 的职责就不会混在一起。

<a id="section-18"></a>

## 18. 官方资料

- [Node.js HTTP](https://nodejs.org/api/http.html)
- [Node.js Stream](https://nodejs.org/api/stream.html)
- [Node.js Events](https://nodejs.org/api/events.html)
- [Node.js Timers](https://nodejs.org/api/timers.html)
- [Node.js Process](https://nodejs.org/api/process.html)
- [Node.js Crypto](https://nodejs.org/api/crypto.html)
- [Node.js Test runner](https://nodejs.org/api/test.html)
- [Node.js Assert](https://nodejs.org/api/assert.html)
- [MDN Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [MDN Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [MDN EventSource withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/withCredentials)
- [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MDN HTTP protocol upgrade](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Protocol_upgrade_mechanism)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type)
- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
- [ws README](https://github.com/websockets/ws)
- [OWASP WebSocket Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Redis Pub/Sub](https://redis.io/docs/latest/develop/pubsub/)
- [node-redis guide](https://redis.io/docs/latest/develop/clients/nodejs/)
- [Express 5 API](https://expressjs.com/en/5x/api/)
- [Express routing](https://expressjs.com/en/guide/routing.html)
- [Express middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Express error handling](https://expressjs.com/en/guide/error-handling.html)
- [Prisma config reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma schema reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Prisma transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [Zod](https://zod.dev/)
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json)
- [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install)
- [npm run-script](https://docs.npmjs.com/cli/v11/commands/npm-run-script)
- [TypeScript TSConfig](https://www.typescriptlang.org/tsconfig/)
- [TypeScript Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

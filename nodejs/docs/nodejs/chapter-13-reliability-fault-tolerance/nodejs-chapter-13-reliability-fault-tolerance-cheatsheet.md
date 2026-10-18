# Node.js 第 13 章可靠性工程速查表

## 失败分类

| failure | retryable | safe policy |
| --- | --- | --- |
| timeout | usually yes | retry with budget or fallback |
| abort | usually no | stop work and cleanup |
| transient dependency failure | yes | backoff, jitter, circuit breaker |
| permanent validation failure | no | reject with Problem Details |
| conflict | conditional | retry whole transaction only when conflict is retryable |
| duplicate request | no | replay stored idempotent result or reject conflict |
| overload | conditional | shed, backoff, rate limit, bulkhead |

## timeout、abort、retry、fallback

timeout 是结果边界，abort 是取消机制，retry 是再次尝试策略，fallback 是降级策略。顺序通常是先设 timeout 和 abort，再分类失败，再决定 retry，最后才考虑 fallback。

## HTTP server timeout

`server.requestTimeout` 限制完整请求时间，`server.headersTimeout` 限制 headers 接收窗口，`server.keepAliveTimeout` 限制 keep-alive idle socket。它们属于 `node:http` server boundary。

## AbortController

`AbortController` 创建可取消信号；`AbortSignal.timeout(ms)` 创建自动超时信号；底层 API 必须支持 `signal` 才能真正取消。

## Retry policy checklist

- max attempts
- exponential backoff
- jitter
- retry budget
- retryable classifier
- abort-aware delay
- low-cardinality metrics

## HTTP method safety

RFC 9110 中，`GET`、`HEAD`、`OPTIONS` 通常是 safe；`PUT`、`DELETE` 通常是 idempotent；`POST` 默认 unsafe，需要 idempotency key 才能安全重放。

## Idempotency key

同一个 key 加同一个 request fingerprint 返回存储结果；同一个 key 加不同 fingerprint 返回 `409`; 缺失 key 返回 `400`；记录不应保存 token、cookie 或 secret。

## Problem Details

稳定字段：`type`, `title`, `status`, `detail`, `instance`, `code`。安全扩展：`retryable`, `retryAfterSeconds`, `requestId`, `validationErrors`。

## Error mapping

validation -> 400; auth -> 401/403; not found -> 404; conflict -> 409; timeout -> 504; dependency unavailable -> 503; rate limited -> 429; unknown -> 500。

## Prisma transaction retry

`P2034` 表示 write conflict 或 deadlock。只在有界 helper 中 retry 完整 transaction closure，不 retry 某个局部步骤。

## Redis handling

注册 `error` listener；设置 reconnect strategy；对命令使用 timeout；required Redis 失败影响 readiness，optional cache 失败可以 degraded fallback。

## Circuit breaker

closed 允许调用；open fail fast；half-open 只允许恢复探测；success 关闭，failure 重新打开。

## Bulkhead

bulkhead 限制慢依赖并发或队列；rate limit 限制入口请求速率。bulkhead 不能使用无限队列。

## Health semantics

liveness 表示进程是否能响应；readiness 表示 required dependency 是否可用；degraded 表示 optional dependency 失败但响应仍安全。

## Fault injection checklist

demo scoped; flag guarded; bounded duration; no process crash; no secret exposure; no database corruption; metrics and problem details observable.

## Reliability metrics

使用低基数 labels：method、route pattern、status class、dependency、failure kind、circuit state。禁止 user id、note id、request id、idempotency key、raw URL、query string、token。

## 常见错误

- retry every error
- retry unsafe POST without idempotency key
- use `Promise.race` timeout without cleanup
- hide Redis fallback
- expose stack trace in error response
- label metrics with high-cardinality values

## 官方资料

Node.js API, Node.js Learn, Express docs, RFC 9110, RFC 9457, Prisma docs, PostgreSQL docs, Redis docs, Docker Compose docs, OpenAPI 3.1.0, TypeScript docs.

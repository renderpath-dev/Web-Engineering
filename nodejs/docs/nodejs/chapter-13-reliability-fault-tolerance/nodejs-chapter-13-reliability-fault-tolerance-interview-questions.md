# Node.js 第 13 章可靠性工程面试题

## 1. 可靠性工程和 try/catch 的区别是什么？

try/catch 只改变异常传播；可靠性工程还要定义 timeout、abort、retry、fallback、idempotency、error contract、health 和 metrics。

## 2. timeout 和 abort 有什么区别？

timeout 是等待时间超过策略后的结果；abort 是向支持 signal 的底层 API 发送取消请求。

## 3. AbortController 负责什么？

它创建 `signal`，调用 `abort()` 后订阅者能观察取消。

## 4. AbortSignal.timeout 做了什么？

它创建一个会在指定毫秒数后自动 aborted 的 signal。

## 5. requestTimeout、headersTimeout、keepAliveTimeout 分别保护什么？

`requestTimeout` 保护完整请求生命周期，`headersTimeout` 保护 header 接收，`keepAliveTimeout` 保护 idle keep-alive socket。

## 6. retryable 和 non-retryable failure 如何区分？

临时网络、timeout、可恢复冲突通常可重试；validation、auth、schema、永久业务错误不可重试。

## 7. 为什么 retry 要用 exponential backoff 和 jitter？

backoff 降低依赖压力，jitter 避免多个客户端同步重试。

## 8. retry budget 解决什么？

它限制额外请求量，防止 retry amplification。

## 9. 什么是 retry amplification？

故障时大量客户端和层级同时重试，使依赖收到比正常流量更多的请求。

## 10. safe method 和 idempotent method 有什么区别？

safe 不应产生状态改变；idempotent 重复执行效果应相同。

## 11. idempotency key 如何让 POST 可重放？

服务端保存 key、fingerprint、status、response body；相同 key 和 fingerprint 返回存储结果。

## 12. duplicate POST 怎么处理？

缺 key 拒绝；相同 key 同 body replay；相同 key 不同 body 返回 409。

## 13. RFC 9457 Problem Details 解决什么？

它让错误响应有稳定字段，客户端不需要解析自由文本。

## 14. safe error details 不能包含什么？

不能包含 stack、SQL、database URL、Redis URL、password hash、token、cookie、env dump。

## 15. Prisma P2034 代表什么？

它表示 transaction write conflict 或 deadlock，需要在有界范围内 retry 完整事务。

## 16. 为什么必须 retry whole transaction？

事务内读取和写入是一个一致性单元，局部 retry 可能基于过期状态继续写。

## 17. database unavailable、pool timeout、conflict 如何区分？

unavailable 是连接边界失败，pool timeout 是等待连接失败，conflict 是事务隔离或写冲突。

## 18. node-redis error event 为什么必须监听？

未观察的连接错误会变成运行时风险，且无法进入日志和健康状态。

## 19. Redis reconnect strategy 为什么要有边界？

无限或无观测重连会隐藏故障；有界策略能进入 degraded 或 not ready。

## 20. cache fallback 的正确输出是什么？

返回 origin 或 stale 数据时必须标记 source、degraded 和原因。

## 21. stale response 的风险是什么？

没有标记的 stale 数据会被客户端误认为最新结果。

## 22. circuit breaker 有哪些状态？

closed、open、half-open。closed 调用，open fail fast，half-open 探测恢复。

## 23. bulkhead 和 rate limit 的区别是什么？

rate limit 控制入口流量；bulkhead 控制某个慢依赖的并发和队列。

## 24. graceful degradation 的关键规则是什么？

required dependency 失败不能假装 ready；optional dependency 失败可以 degraded，但必须显式标记。

## 25. liveness、readiness、degraded 如何区分？

liveness 看进程，readiness 看 required dependency，degraded 看 optional dependency 失败后的安全响应。

## 26. fault injection 的安全边界是什么？

demo scoped、flag guarded、bounded、不 crash、不泄露 secret、不破坏数据。

## 27. resilient-notes-api 架构边界是什么？

NGINX 入口、Express route/middleware、Prisma/PostgreSQL、Redis、reliability modules、metrics、test scripts。

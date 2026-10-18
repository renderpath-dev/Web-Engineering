# Node.js 第 15 章架构、消息与平台边界面试题

## 1. modular monolith

它是一个 deployment unit 内的模块化架构。重点是 module ownership、data ownership 和 use-case boundary，而不是服务数量。

## 2. service boundary

边界要同时看 business、data、runtime、deployment、team 和 trust。只有文件夹分开但数据和 runtime 仍混在一起，不是可靠服务边界。

## 3. when not to split microservices

当团队不能独立运维、数据所有权不清、重试不幂等、没有观测信号时，不应该拆。拆分会增加网络、部署和一致性失败面。

## 4. API service versus worker service

API service 负责 HTTP request/response、validation、job creation 和 status DTO；worker service 负责 queue payload processing、side effect、result update 和 cleanup。

## 5. HTTP request versus background job

HTTP request 有 socket、status、headers、body 和 timeout；background job 有 payload、attempt、state、worker owner 和 retry/backoff。

## 6. queue versus message broker

本章 BullMQ queue 面向 job processing；message broker 更偏事件流和服务通信。两者都不能自动保证 exactly once。

## 7. Redis-backed BullMQ

BullMQ 使用 Redis 保存 job delivery state；Redis 可用只说明 queue/cache infra 可连，不说明 PostgreSQL transaction 已提交。

## 8. BullMQ Queue and Worker

Queue 由 producer 调用 add；Worker claim job 并执行 processor。它们通过 Redis 交换序列化 payload，不共享 JavaScript object reference。

## 9. job payload contract

payload 需要固定 name、version、schema、idempotencyKey、correlationId 和 safe metadata。TypeScript type 会擦除，所以 worker 必须 runtime parse。

## 10. job versioning

version 让 producer 和 worker 能识别 payload shape；不兼容变更不能偷偷改变现有 version。

## 11. job idempotency

同一 idempotency key 必须返回同一 durable 结果或跳过重复写入，通常由 unique constraint 证明。

## 12. retry and backoff

transient failure 可有限 retry 并 backoff；permanent payload failure 不应无限 retry。

## 13. poison job

poison job 是持续失败且无法通过 retry 修复的任务，应进入 failed/dead-letter/operator review 边界。

## 14. stalled job

stalled 表示 worker 失去 lock 或无法续约，常见原因是 worker crash 或 event loop blocked。

## 15. graceful worker shutdown

signal handler 先停止接新任务，再关闭 Worker、Queue、QueueEvents、Redis、Prisma，避免 pending handles 和半处理状态。

## 16. timeout and cancellation

API timeout、job timeout、dependency timeout 是不同边界；AbortSignal 通知取消，但不会回滚已提交 DB write。

## 17. transactional outbox concept

DB write 和 Redis enqueue 不在同一 transaction；outbox 把待发布消息先写入 DB，再由 publisher 补偿投递。

## 18. cache-aside

读路径先查 cache，miss 后读 DB 并写 cache；写路径必须 invalidate 相关 cache。

## 19. stale data

stale data 出现在 cache value 与 DB fact 不一致时；TTL 只能限制持续时间，不证明写后立即正确。

## 20. cache invalidation

invalidation 应由写路径或 worker 成功提交后执行，key 需要 namespace 和 version。

## 21. Redis queue versus Redis cache

queue state 不可随意删除，因为它代表 delivery；cache state 可删除重建，因为它是 derived read model。

## 22. worker readiness

worker 没有公共 HTTP port 也需要 readiness signal，例如健康文件或内部探针，证明 queue/dependency 可用。

## 23. multi-service Docker Compose

Compose 建立 api、worker、postgres、redis、nginx 的本地 runtime topology。NGINX 暴露 8080，API 内部 3030，worker 不暴露 host port。

## 24. Compose depends_on versus service_healthy readiness

`depends_on` 控制启动顺序，`condition: service_healthy` 等待健康检查成功。

## 25. metrics labels

metric labels 必须低基数，使用 route pattern、status class、job name、failure class、queue/cache name，不使用用户或资源 id。

## 26. queue depth

queue depth 表示等待和活动工作量，不等于业务成功率，需要结合 completed/failed/duration。

## 27. cache hit/miss

hit/miss 能观察读取路径是否命中 cache，但不能单独证明数据新鲜。

## 28. migration from monolith to worker

先在 monolith 内建立模块和 job contract，再把 worker runtime 独立出来，并用 check scripts 证明边界。

## 29. distributed-task-platform-lab architecture

客户端经 NGINX 到 API；API 写 JobRecord 并 enqueue；worker 处理 job、写 Task、更新 JobEvent、invalidate cache；metrics 和 checks 观察结果。

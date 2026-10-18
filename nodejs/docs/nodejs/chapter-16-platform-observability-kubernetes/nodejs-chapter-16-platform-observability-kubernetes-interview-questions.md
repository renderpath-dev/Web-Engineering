# Node.js 第 16 章面试题：生产级可观测性、SLO、告警、OpenTelemetry、Kubernetes 基础与容器运行边界

## 1. 可观测性和 logging 的边界是什么？

logging 只记录离散事件；可观测性还包括 metrics、traces、alerts、SLOs。真正的可观测性要能回答趋势、路径、用户影响和是否需要行动。

## 2. logs、metrics、traces 分别回答什么问题？

logs 回答单个事件发生了什么；metrics 回答某类事件多少、多久、趋势如何；traces 回答一次请求沿途经过哪些 span、时间花在哪里。

## 3. 结构化日志为什么需要 redaction？

日志会被集中采集和长期保存，authorization、cookie、token、email、database URL、request body 一旦进入日志就可能扩散。redaction 把敏感字段在写入前替换掉。

## 4. Counter、Gauge、Histogram 怎么选？

Counter 用于单调递增事件数，Gauge 用于当前状态，Histogram 用于分布和延迟桶。请求延迟通常用 Histogram，不用 Gauge。

## 5. 为什么 metric label 必须低基数？

Prometheus 每个 label 组合都是新的 time series。traceId、userId、email、raw URL 会制造无限维度，导致内存、查询和告警都失控。

## 6. RED 方法是什么？

RED 是 Rate、Errors、Duration，适合观察 HTTP/API 的请求量、错误率和延迟分布。

## 7. USE 方法是什么？

USE 是 Utilization、Saturation、Errors，适合观察 CPU、memory、event loop delay 等资源压力。

## 8. trace、span、context propagation 的关系是什么？

trace 是一次端到端工作；span 是其中一段工作；context propagation 把 trace context 传给下游，使 child span 能挂到同一个 trace。

## 9. OpenTelemetry API 和 SDK 的区别是什么？

API 是应用代码调用的抽象；SDK 提供实际 provider、resource、processor、exporter。没有 SDK 时 API 可能只是 no-op。

## 10. manual instrumentation 和 automatic instrumentation 怎么取舍？

manual instrumentation 精确表达业务边界；automatic instrumentation 自动覆盖常见库，但仍需要在关键业务步骤补充手工 span 和属性。

## 11. SLI 和 SLO 的区别是什么？

SLI 是实际测量值，例如 availability ratio；SLO 是目标，例如 99% availability。SLO 应围绕用户可见可靠性。

## 12. error budget 是什么？

error budget 是 SLO 允许失败的空间。它把 reliability 变成发布和修复的决策边界。

## 13. burn rate 为什么重要？

burn rate 表示 error budget 被消耗的速度。比单个错误更适合判断是否需要人介入。

## 14. 什么是 alert fatigue？

告警过多、重复或不可行动会让人忽略告警。应按用户症状、持续窗口、severity 和 runbook 设计告警。

## 15. Prometheus alert rule 至少应该有什么？

应有 alert、expr、for、labels、annotations。labels 放低基数路由信息，annotations 放 summary 和 runbook。

## 16. Alertmanager 的边界是什么？

Alertmanager 负责 grouping、deduplication、routing、silence、inhibition。Prometheus 负责规则评估，不负责真实值班流程。

## 17. Kubernetes Pod 是什么？

Pod 是 Kubernetes 最小可部署单元，包含一个或多个共享网络和存储上下文的容器。

## 18. Deployment 负责什么？

Deployment 声明期望副本和滚动更新策略，并通过 ReplicaSet 管理 Pod 副本。

## 19. Service 解决什么问题？

Service 为一组由 selector 匹配的 Pod 提供稳定网络入口，避免直接依赖 Pod IP。

## 20. ConfigMap 和 Secret 的边界是什么？

ConfigMap 放非敏感配置；Secret 放敏感配置。本章 Secret 只允许 fake placeholder。

## 21. liveness probe 失败会怎样？

kubelet 可能重启容器，所以 liveness 不应检查外部依赖 readiness。

## 22. readiness probe 失败会怎样？

Pod 会从 Service endpoints 移除，不再接收流量，但进程不一定被重启。

## 23. startup probe 解决什么？

它保护慢启动应用，在 startup 成功前延迟 liveness 的判断，避免过早重启。

## 24. requests 和 limits 有什么区别？

requests 用于调度和资源预留；limits 用于运行时约束。两者都会影响平台行为。

## 25. CPU limit 对 Node 有什么影响？

CPU quota 会放大同步代码和 event loop delay 的影响，可能让 p95/p99 延迟恶化。

## 26. memory limit 对 Node 有什么影响？

内存限制改变 heap 与 RSS 风险，超限可能导致 OOM kill；需要结合 heap、container memory 和 restart 观察。

## 27. SIGTERM 与 graceful shutdown 的机制是什么？

编排器先发 SIGTERM，应用停止接新连接，等待 in-flight 完成，关闭 DB/Redis，再在 grace period 内退出。

## 28. Compose 和 Kubernetes 的根本差异是什么？

Compose 是本地多服务模拟；Kubernetes 是声明式调度系统。Compose service、healthcheck、depends_on 不能等同于 Kubernetes Service、probe、Deployment。

## 29. platform-observability-kubernetes-lab 的架构边界是什么？

它是本地学习项目：Express API 产生日志、metrics、trace、SLO report，Compose 提供依赖和 NGINX，Kubernetes YAML 只做静态验证。

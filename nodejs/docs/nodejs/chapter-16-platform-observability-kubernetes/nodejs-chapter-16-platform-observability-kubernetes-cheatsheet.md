# Node.js 第 16 章速查表：生产级可观测性、SLO、告警、OpenTelemetry、Kubernetes 基础与容器运行边界

## 可观测性信号速查

| 信号 | 回答的问题 | 典型证据 | 常见误用 |
| --- | --- | --- | --- |
| logs | 单个事件发生了什么 | requestId、traceId、error class | 把日志当成所有可观测性 |
| metrics | 某类事件发生多少、多久、趋势如何 | Counter、Gauge、Histogram | 把 traceId、userId 放进 label |
| traces | 一次请求的时间花在哪里 | trace、span、parent span | 没有传播上下文 |
| alerts | 什么时候需要人行动 | threshold、for、severity、runbook | 每个错误都告警 |
| SLOs | 用户可见可靠性是否达标 | SLI、target、error budget | 用内部愿望代替用户体验 |

## 结构化日志清单

- 使用稳定字段：requestId、correlationId、traceId、spanId、level、message、errorClass。
- redact authorization、cookie、token、secret、password、email、database URL、Redis URL、request body。
- 公开响应不返回 raw stack trace。
- 日志可以引用 traceId；metrics 不把 traceId 作为 label。

## Metric 类型速查

| 类型 | 适合表达 | Chapter 16 示例 |
| --- | --- | --- |
| Counter | 单调递增事件数 | http_requests_total |
| Gauge | 当前状态 | dependency_readiness |
| Histogram | 延迟分布 | http_request_duration_seconds |
| Summary | 客户端分位数概念比较 | 作为对比，不作为本项目默认实现 |

## 低基数 label 清单

允许：method、route pattern、status class、dependency name、operation name、error class、signal kind、slo name、alert name、service name。

禁止：traceId、spanId、requestId、userId、jobId、email、IP、raw URL、query string、token、Redis key、database URL、request body hash。

## RED 与 USE

- RED：Rate、Errors、Duration，适合 HTTP/API。
- USE：Utilization、Saturation、Errors，适合资源和运行时压力。
- Node 容器里要特别观察 event loop delay、CPU quota、memory limit。

## Tracing 与 OpenTelemetry

- trace 表示一次端到端工作。
- span 表示一段有开始和结束时间的工作单元。
- parent-child span 表示调用层级。
- traceparent 传播 trace context。
- OpenTelemetry API 用来写 instrumentation；SDK 负责 provider、resource、exporter。
- manual instrumentation 精确表达业务边界；automatic instrumentation 适合补齐常见库边界。

## SLI/SLO/Error Budget

- SLI 是量化指标，例如 availability ratio、latency compliance ratio。
- SLO 是目标，例如 99% availability。
- error budget 是允许失败的空间。
- release gate 应该基于剩余 error budget，而不是基于“有没有错误”。

## Alerting

- 以症状告警，不以每个 raw error 告警。
- alert rule 要有 expr、for、severity、summary、runbook。
- Alertmanager 负责 grouping、deduplication、routing、silence，是真实通知边界。

## Kubernetes 对象

| 对象 | 责任 |
| --- | --- |
| Namespace | 隔离资源命名空间 |
| ConfigMap | 非敏感配置 |
| Secret | 敏感配置，示例必须是假值 |
| Pod | 最小可调度运行单元 |
| Deployment | 声明并滚动管理 Pod 副本 |
| ReplicaSet | Deployment 管理的副本实现细节 |
| Service | 给一组 Pod 提供稳定网络入口 |

## Probes

| Probe | 证明 | 失败后果 |
| --- | --- | --- |
| liveness | 进程是否还活着 | kubelet 可能重启容器 |
| readiness | 是否能接流量 | 从 Service endpoints 移除 |
| startup | 是否完成启动窗口 | 保护慢启动，避免过早 liveness restart |

## Requests/Limits

- requests 影响调度和预留。
- limits 影响运行时约束。
- CPU limit 会改变事件循环延迟表现。
- memory limit 会改变 Node heap 与 OOM 风险。

## Compose 与 Kubernetes

- Compose 适合本地多服务模拟。
- depends_on 不是 readiness；需要 healthcheck 和 service_healthy。
- Kubernetes Service 不是 Compose service；probe 也不是 Docker HEALTHCHECK 的完全替代。
- 本章不实现真实 Ingress，NGINX 仍是本地 8080 入口。

## Runbook

- 先看用户可见症状。
- 再看 route pattern、status class、dependency readiness、event loop delay。
- 避免把 high-cardinality 维度塞进 labels。
- 告警要指向可执行的 runbook。

## 常见错误

- 把 observability 等同于 console.log。
- 用 liveness 检查数据库。
- 把 startup order 当 readiness。
- 把 YAML 当真实生产部署。
- 在 Secret 示例里写真实 secret。
- metrics label 使用 traceId、requestId、userId、email。
- 每个 error 都发告警。

## 官方资料

- https://nodejs.org/api/process.html
- https://nodejs.org/api/perf_hooks.html
- https://opentelemetry.io/docs/concepts/observability-primer/
- https://opentelemetry.io/docs/languages/js/instrumentation/
- https://prometheus.io/docs/instrumenting/exposition_formats/
- https://prometheus.io/docs/practices/naming/
- https://sre.google/sre-book/service-level-objectives/
- https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- https://docs.docker.com/compose/how-tos/startup-order/
- https://nginx.org/en/docs/http/ngx_http_proxy_module.html

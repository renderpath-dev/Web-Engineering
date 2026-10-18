# Node.js 第 12 章性能工程速查表

## Performance terms

| Term | Meaning | Signal |
| --- | --- | --- |
| latency | request duration | p50, p95, p99 |
| throughput | completed work per time | requests/sec |
| concurrency | simultaneous in-flight work | connections |
| saturation | resource near limit | queue, delay, timeout |
| capacity | sustainable load boundary | stable p95 and errors |

## Load test types

- smoke: live and ready endpoints.
- integration: code plus dependency behavior.
- benchmark: controlled comparison.
- load test: expected traffic.
- stress test: beyond expected traffic.
- soak test: long-duration stability.

## Core boundaries

- event loop delay: callback wait signal.
- event loop utilization: busy ratio signal.
- CPU-bound handler: blocks main JavaScript thread.
- Worker Threads: CPU JavaScript parallelism.
- Cluster: process-level HTTP scaling.
- memoryUsage: rss, heapTotal, heapUsed, external, arrayBuffers.
- heap snapshot: local diagnostic file, not public route.
- Express hot path: every middleware adds request cost.
- body size: parser CPU and heap boundary.
- backpressure: wait for drain after write returns false.
- Prisma pool: reuse one client and measure query duration.
- Redis pipeline: reduce command RTT cost.
- Docker capacity: read CPU, memory, net, block, PIDs.
- performance budget: fail regression on p95, request rate, errors, timeouts.

## Common mistakes

| Mistake | Correction |
| --- | --- |
| Load test internal port | Target http://localhost:8080 through NGINX |
| Use average latency only | Read p95 and p99 |
| Create Prisma Client per request | Reuse one Client |
| Expose heap snapshots over HTTP | Write local controlled files only |
| Put raw URLs in metric labels | Use route patterns |
| Use Worker Threads for database I/O | Use async I/O and pool sizing |

## Official docs

- https://nodejs.org/api/perf_hooks.html
- https://nodejs.org/api/worker_threads.html
- https://nodejs.org/api/cluster.html
- https://nodejs.org/api/stream.html
- https://expressjs.com/en/advanced/best-practice-performance/
- https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
- https://node-postgres.com/apis/pool
- https://redis.io/docs/latest/develop/using-commands/pipelining/
- https://docs.docker.com/reference/cli/docker/container/stats/
- https://github.com/mcollina/autocannon

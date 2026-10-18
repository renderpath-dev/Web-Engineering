# Node.js 第 12 章性能工程面试题

## 1. performance engineering versus optimization

Performance engineering fixes a measured bottleneck and verifies the same signal after change; optimization without baseline is guessing.

## 2. latency versus throughput

Latency is one request duration; throughput is completed requests per time. They can move in opposite directions under saturation.

## 3. p95 and p99

They show tail latency and expose slow user experience hidden by averages.

## 4. benchmark versus load test

Benchmark compares controlled alternatives; load test simulates expected traffic through the real entry.

## 5. event loop delay

Delay measures how late callbacks run because the event loop could not return in time.

## 6. event loop utilization

ELU measures active versus idle loop time in a sampling window.

## 7. CPU-bound handler

A synchronous CPU loop blocks the main JavaScript thread and delays unrelated requests.

## 8. Worker Threads

Workers run JavaScript in parallel for CPU tasks and communicate by messages.

## 9. structured clone

Worker messages clone supported values unless transferable objects are moved.

## 10. Worker pool

A pool limits CPU worker concurrency and prevents unbounded thread creation.

## 11. Cluster

Cluster forks processes that can share server ports but not ordinary memory.

## 12. Worker Threads versus Cluster

Workers are threads inside a process; Cluster is multiple Node processes.

## 13. memoryUsage fields

rss is process resident memory; heap fields are V8; external and arrayBuffers cover non-heap allocations.

## 14. V8 heap statistics

They describe heap limits and usage from V8's perspective.

## 15. heap snapshots

Snapshots are diagnostic files and may contain sensitive object graphs.

## 16. Express middleware hot path

Every request traverses mounted middleware until response or error flow completes.

## 17. JSON body size

Body parsing consumes CPU and heap before handler logic can run.

## 18. streams and backpressure

Writable false means stop writing until drain to avoid unbounded buffering.

## 19. Prisma Client reuse

Reuse keeps the underlying pool bounded and avoids connection exhaustion.

## 20. connection pool saturation

Requests wait for an available connection and tail latency grows.

## 21. N+1 query

A list request triggers one query plus one per row instead of a bounded query shape.

## 22. Redis pipelining

Pipeline batches commands to reduce RTT cost.

## 23. cache hit/miss

Hit rate is useful only with latency and origin load context.

## 24. Docker CPU/memory capacity

Container stats show whether runtime limits are near saturation.

## 25. performance budgets

Budgets turn regression into a failing command.

## 26. regression benchmark

Run the same benchmark before and after a change under the same entry and load.

## 27. performance-notes-api architecture

NGINX receives traffic, API records metrics, PostgreSQL and Redis provide dependency pressure, and scripts verify budgets.

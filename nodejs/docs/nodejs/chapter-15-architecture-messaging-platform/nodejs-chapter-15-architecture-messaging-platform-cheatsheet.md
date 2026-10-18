# Node.js 第 15 章架构、消息与平台边界速查表

| Topic | Quick rule | Diagnostic signal |
| --- | --- | --- |
| Modular monolith | keep one deployment while preserving module and data ownership | import graph and service functions stay clean |
| Service boundary | split only when business, data, runtime, deployment, team, or trust pressure is observable | boundary decision table has multiple signals |
| Monolith to worker | split slow retryable side effects, not synchronous response obligations | API returns job id and worker owns side effect |
| HTTP versus queue | HTTP owns status/body now; queue owns delayed delivery attempts | POST import returns `202` and `jobId` |
| BullMQ Queue | producer adds named job with payload and options | queue counts change |
| BullMQ Worker | worker processes payload and updates durable state | JobRecord moves active to completed or failed |
| Stalled job | worker lost or failed to renew processing lock | stalled signal or retry after lock loss |
| Graceful shutdown | close Worker, Queue, QueueEvents, Redis, Prisma | process exits after signal without dangling handles |
| Job payload | name, version, schema, idempotencyKey, correlationId | Zod parse succeeds before processing |
| Idempotency | duplicate key maps to same durable result | unique constraint prevents duplicate rows |
| Retry/backoff | transient can retry; permanent must stop | attempts are bounded |
| Poison job | repeated permanent failure is isolated | final failed status and safe event |
| Timeout | each boundary has its own timeout budget | AbortSignal or job timeout fires |
| Transaction/outbox | DB transaction cannot include Redis enqueue atomically | outbox record is recoverable bridge |
| Cache-aside | miss loads DB and fills cache | first miss, second hit |
| Invalidation | write path deletes derived cache | worker invalidates project summary |
| Redis queue vs cache | queue is delivery state; cache is derived state | different key namespace and deletion policy |
| Compose | api, worker, postgres, redis, nginx | `docker compose config` expands services |
| service_healthy | readiness is checked, not assumed | healthcheck passes before dependent service starts |
| Metrics | labels stay low cardinality | no user id, project id, job id, raw URL |

Common mistakes: retrying non-idempotent jobs, claiming exactly-once processing, exposing BullMQ internals as public API, treating TTL as correctness, using `depends_on` as readiness, and putting Express Request or Prisma Client into job payload.

Official references: Node.js process/timers/AbortController/test/packages, Express routing/error handling, BullMQ queue/worker/retry/stalled/shutdown, Redis EXPIRE/TTL, PostgreSQL transactions/constraints/indexes, Prisma v7 adapter/seeding/connections, Docker multi-stage/Compose startup/services, NGINX proxy module, npm scripts/install, TypeScript TSConfig/modules, Zod basics, OpenAPI latest.

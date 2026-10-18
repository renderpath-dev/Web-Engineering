# Distributed Task Platform Lab

## 1. Project Summary

Distributed Task Platform Lab is a local Node.js / TypeScript backend architecture lab. It demonstrates an Express API service, a separate worker service, PostgreSQL persistence, Redis / BullMQ job delivery, cache-aside reads, explicit cache invalidation, retry and idempotency boundaries, health/readiness endpoints, Prometheus-style metrics, Docker Compose runtime configuration, and an NGINX public boundary.

This is a local portfolio lab, not a real production deployment.

The project is meant to be portfolio-facing evidence for backend architecture mechanisms, not a claim of operating a production platform. Runtime evidence should be captured in a later Stage 2 pass before public portfolio use.

## 2. Architecture

Text diagram:

```text
Client or smoke script
  -> NGINX on http://localhost:8080
  -> API service on port 3030
     -> PostgreSQL for business state
     -> Redis cache for derived project summaries
     -> BullMQ queue in Redis for task import jobs
  -> Worker service
     -> BullMQ worker consumes task import jobs
     -> PostgreSQL records job state, events, projects, and tasks
     -> Redis cache invalidation after imports
```

- API service responsibility: owns HTTP routing, request validation, public DTO responses, job creation, job status endpoints, health/readiness endpoints, metrics endpoint, and architecture explanation endpoints. Owner files include `src/api/app.ts`, `src/api/server.ts`, `src/modules/projects`, `src/modules/tasks`, `src/modules/jobs`, `src/health`, and `src/observability`.
- Worker service responsibility: owns BullMQ job processing, job payload validation, idempotent task writes, persisted job events, cache invalidation after imports, readiness file creation, and worker shutdown cleanup. Owner files include `src/worker/worker.ts`, `src/worker/processor.ts`, `src/worker/worker-health.ts`, and `src/worker/worker-shutdown.ts`.
- PostgreSQL ownership: owns durable business state and job audit state. `Project`, `Task`, `JobRecord`, and `JobEvent` are defined in `prisma/schema.prisma` and created by `prisma/migrations/0001_init/migration.sql`.
- Redis queue responsibility: owns BullMQ delivery state for the `task-import` queue. Queue owner files include `src/queue/task-queue.ts`, `src/queue/queue-events.ts`, `src/queue/queue-names.ts`, and `src/queue/job-contract.ts`.
- Redis cache responsibility: owns short-lived derived state for project summary reads. Cache owner files include `src/cache/cache-aside.ts`, `src/cache/cache-invalidation.ts`, `src/cache/cache-keys.ts`, and `src/cache/stampede-guard.ts`.
- BullMQ job boundary: the public HTTP API accepts a task import request, stores a `JobRecord`, enqueues a BullMQ job, and returns a job id. The worker validates and processes that payload outside the request lifecycle.
- NGINX reverse proxy boundary: `nginx/nginx.conf` proxies public traffic from `http://localhost:8080` to the internal API service at `api:3030`.
- Health/readiness boundary: liveness proves the Node process can answer a minimal request; readiness checks PostgreSQL, Redis, and queue access before traffic should be treated as ready.
- Metrics boundary: `GET /v1/metrics` exposes Prometheus-style metrics from `prom-client`; labels are intentionally low-cardinality route, status, queue, job, failure, worker, and cache labels.

## 3. Technology Stack

Actual project technologies:

- Node.js 26 or newer
- TypeScript
- Express 5
- PostgreSQL
- Prisma 7 with `@prisma/adapter-pg`
- Redis
- BullMQ
- `ioredis`
- `redis`
- `zod`
- `helmet`
- `cors`
- `express-rate-limit`
- `pino`
- `prom-client`
- Docker
- Docker Compose
- NGINX
- `node:test`
- `supertest`

Supporting projects use additional concepts, but they are not part of this primary project's runtime unless named in Section 12.

## 4. Why This Project Exists

A synchronous HTTP API should not directly perform slow retryable background work. Long-running imports can block the request lifecycle, make client retries ambiguous, and mix public HTTP concerns with internal retry state.

This project separates request handling from background processing through a queue and worker boundary:

- The API validates a task import request, creates a durable job record, enqueues a BullMQ job, and returns `202 Accepted` with a public job id.
- The worker consumes the job separately, validates the payload again, performs idempotent writes, records job events, and invalidates the derived summary cache.
- PostgreSQL is used for business state and job audit state.
- Redis is used for BullMQ queue state and derived cache state.

## 5. Main Mechanisms

### API / Worker Split

- Owner files: `src/api/app.ts`, `src/api/server.ts`, `src/worker/worker.ts`, `src/worker/processor.ts`, `compose.yaml`.
- Mechanism: the API service handles HTTP routes and enqueues work; the worker service runs as a separate process and consumes `task-import` jobs.
- Failure mode: if slow work stays inside the API request, HTTP clients can time out and retry without a stable job state. If the worker is unavailable, imports can stay queued and the readiness/runtime checks need to expose that boundary.
- Validation command: `npm run queue:check` proves the API can accept and queue a task import job; `npm run worker:check` proves a worker can complete a queued import when the runtime stack is up.

### Job Contract

- Owner files: `src/queue/job-contract.ts`, `src/queue/job-schemas.ts`, `src/modules/tasks/tasks.service.ts`, `src/worker/processor.ts`, `tests/job-contract.unit.test.ts`.
- Mechanism: `tasks.import` jobs use an explicit payload version, idempotency key, project id, correlation id, task list, and optional failure mode for reliability checks.
- Failure mode: a worker that accepts unvalidated payloads can write invalid data or retry permanently invalid jobs.
- Validation command: `npm test -- --test-concurrency=1` runs job contract tests; `npm run queue:check` verifies the API returns a queued job id through the runtime boundary.

### Retry Policy

- Owner files: `src/queue/retry-policy.ts`, `src/queue/job-contract.ts`, `src/worker/processor.ts`, `tests/retry-policy.unit.test.ts`.
- Mechanism: BullMQ job options allow three attempts with exponential backoff; permanent failures are classified separately from transient or unknown failures.
- Failure mode: retrying permanent validation failures wastes resources and can hide bad input; retrying transient failures without a budget can create retry storms.
- Validation command: `npm test -- --test-concurrency=1` runs retry policy coverage. There is no dedicated `retry:check` script in `package.json`.

### Idempotency

- Owner files: `src/modules/tasks/tasks.service.ts`, `src/worker/processor.ts`, `prisma/schema.prisma`, `tests/idempotency.unit.test.ts`, `tests/cache-consistency.unit.test.ts`.
- Mechanism: the import request stores a unique `idempotencyKey` on `JobRecord`, derives a stable BullMQ job id, and uses a unique task constraint on `projectId`, `importBatchId`, and `title` to avoid duplicate task rows for the same import batch.
- Failure mode: client retries or worker retries can create duplicate tasks if the API and worker do not share a stable idempotency boundary.
- Validation command: `npm run consistency:check` verifies duplicate import requests return the existing job and produce one matching task after processing.

### Cache-Aside Reads

- Owner files: `src/cache/cache-aside.ts`, `src/cache/cache-keys.ts`, `src/cache/stampede-guard.ts`, `src/modules/projects/projects.service.ts`, `src/modules/cache-demo/cache-demo.service.ts`, `tests/cache.integration.test.ts`.
- Mechanism: project summaries are loaded from Redis when present; a miss loads from PostgreSQL, stores JSON with a TTL, and records cache hit/miss metrics.
- Failure mode: stale or unbounded cache state can return incorrect summaries. Cache stampedes can duplicate expensive loads when many requests miss the same key.
- Validation command: `npm run cache:check` verifies miss -> hit -> invalidation behavior through the runtime HTTP boundary.

### Cache Invalidation

- Owner files: `src/cache/cache-invalidation.ts`, `src/modules/tasks/tasks.service.ts`, `src/worker/processor.ts`, `src/modules/cache-demo/cache-demo.routes.ts`, `tests/cache-consistency.unit.test.ts`.
- Mechanism: direct task creation and worker imports invalidate the project summary cache key. TTL is a fallback, not the primary correctness mechanism.
- Failure mode: if writes do not invalidate derived cache state, clients can see stale task counts after imports or task creation.
- Validation command: `npm run consistency:check` validates idempotent import consistency; `npm run cache:check` validates explicit invalidation through cache demo endpoints.

### Health and Readiness

- Owner files: `src/health/health.routes.ts`, `src/health/health.service.ts`, `src/db/db-health.ts`, `src/redis/redis-health.ts`, `src/queue/task-queue.ts`, `compose.yaml`.
- Mechanism: `/v1/health/live` returns a minimal process liveness response. `/v1/health/ready` checks PostgreSQL, Redis, and BullMQ queue access and returns `503` when dependencies are not ready.
- Failure mode: treating liveness as readiness can send traffic to a process that is running but cannot reach required dependencies.
- Validation command: `npm run smoke` waits for readiness and checks `/v1/health/live` plus `/v1/health/ready`.

### Metrics

- Owner files: `src/observability/metrics.ts`, `src/observability/metrics.routes.ts`, `src/observability/http-metrics.ts`, `src/observability/job-metrics.ts`, `src/observability/cache-metrics.ts`.
- Mechanism: `prom-client` collects default metrics and project metrics for HTTP requests, problem responses, queued/started/completed/failed/retried jobs, job duration, queue depth, cache hits/misses/invalidations, and worker readiness.
- Failure mode: high-cardinality labels such as raw URLs, user ids, job ids, tokens, Redis keys, or request bodies can make metrics expensive and unsafe.
- Validation command: there is no dedicated metrics script in `package.json`. After runtime is up, manually capture `GET /v1/metrics` output as future evidence.

### Docker Compose and NGINX

- Owner files: `Dockerfile`, `compose.yaml`, `nginx/nginx.conf`, `scripts/smoke-test.ts`, `scripts/wait-for-ready.ts`.
- Mechanism: Compose defines PostgreSQL, Redis, API, worker, and NGINX services. NGINX listens on `http://localhost:8080` and proxies traffic to the API container at `api:3030`.
- Failure mode: local Docker configuration can exist but still fail at build, startup, dependency health, NGINX proxying, or smoke time.
- Validation command: future Stage 2 should run `docker compose config`, `docker compose build --no-cache --progress=plain api worker`, `docker compose up -d postgres redis`, `npm run prisma:migrate:deploy`, `npm run seed`, `docker compose up -d api worker nginx`, `docker compose ps`, `npm run smoke`, and `docker compose down`.

## 6. Local Setup

These commands are based on actual `package.json` scripts. They are listed for future use; this README update does not claim they passed.

Windows PowerShell:

```powershell
npm install
npm run prisma:generate
npm run typecheck
npm run build
```

macOS/Linux:

```bash
npm install
npm run prisma:generate
npm run typecheck
npm run build
```

Local Docker Compose runtime path for future Stage 2 evidence capture:

Windows PowerShell:

```powershell
docker compose config
docker compose build --no-cache --progress=plain api worker
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api worker nginx
docker compose ps
npm run smoke
docker compose down
```

macOS/Linux:

```bash
docker compose config
docker compose build --no-cache --progress=plain api worker
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api worker nginx
docker compose ps
npm run smoke
docker compose down
```

Optional smoke base URL override for a compatible reverse-proxy entry:

Windows PowerShell:

```powershell
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
Remove-Item Env:\SMOKE_BASE_URL
```

macOS/Linux:

```bash
SMOKE_BASE_URL=http://localhost:8080 npm run smoke
```

## 7. Validation Commands

| Command | What it validates | Evidence produced | Required services |
| --- | --- | --- | --- |
| `npm install` | Installs dependencies from `package.json` and `package-lock.json` | npm install log | npm registry/network access |
| `npm run prisma:generate` | Generates Prisma client into `src/generated/prisma` from `prisma/schema.prisma` | Prisma generation log | None |
| `npm run typecheck` | TypeScript project type boundaries | TypeScript diagnostics | None |
| `npm run build` | Emitted JavaScript build from `tsconfig.json` | `tsc` build output | None |
| `npm test -- --test-concurrency=1` | Unit and integration test suite listed in `package.json` | `node:test` output | PostgreSQL and Redis are needed for the full suite |
| `npm run smoke` | NGINX/API readiness and health endpoints through `SMOKE_BASE_URL` or `http://localhost:8080` | JSON with `baseUrl`, `live`, and `ready` statuses | Compose runtime with API dependencies |
| `npm run queue:check` | API can create a project and enqueue a task import job | JSON with queue name, job id, and queued status | API, PostgreSQL, Redis, NGINX |
| `npm run worker:check` | Worker can complete a queued import job | JSON with worker name and completed status | API, worker, PostgreSQL, Redis, NGINX |
| `npm run cache:check` | Cache miss, hit, and explicit invalidation flow | JSON with first/second cache status and invalidation result | API, PostgreSQL, Redis, NGINX |
| `npm run consistency:check` | Duplicate idempotency key returns the existing job and creates one matching task | JSON with duplicate flag and matching task count | API, worker, PostgreSQL, Redis, NGINX |
| `docker compose config` | Compose file syntax and resolved service model | Resolved Compose config | Docker Compose |
| `docker compose build --no-cache --progress=plain api worker` | Docker image build path for API and worker | Plain build log | Docker Desktop Linux engine |
| `docker compose up -d postgres redis` | Starts dependency services with health checks | Compose startup log | Docker Desktop Linux engine |
| `npm run prisma:migrate:deploy` | Applies committed Prisma migrations to reachable PostgreSQL | Prisma migration deploy log | PostgreSQL |
| `npm run seed` | Seeds the architecture lab project/task | Prisma seed log | PostgreSQL |
| `docker compose up -d api worker nginx` | Starts API, worker, and reverse proxy services | Compose startup log | Docker Desktop Linux engine, PostgreSQL, Redis |
| `docker compose ps` | Shows local service state and health | Compose service table | Docker Desktop Linux engine |
| `docker compose down` | Cleans up the local Compose runtime | Compose cleanup log | Docker Desktop Linux engine |

## 8. API and Runtime Endpoints

These endpoints are listed from `src/api/app.ts`, route files, and `openapi/openapi.yaml`.

- `GET /v1/health/live`
- `GET /v1/health/ready`
- `GET /v1/metrics`
- `GET /v1/projects`
- `POST /v1/projects`
- `GET /v1/projects/:projectId`
- `GET /v1/projects/:projectId/summary`
- `GET /v1/projects/:projectId/tasks`
- `POST /v1/projects/:projectId/tasks`
- `POST /v1/projects/:projectId/tasks/import`
- `GET /v1/jobs/:jobId`
- `GET /v1/jobs/:jobId/events`
- `POST /v1/jobs/:jobId/retry`
- `GET /v1/architecture/service-boundary`
- `GET /v1/architecture/migration-plan`
- `GET /v1/cache-demo/projects/:projectId/summary`
- `POST /v1/cache-demo/projects/:projectId/invalidate`

The OpenAPI file documents public HTTP routes. It does not document internal BullMQ delivery semantics.

## 9. Observability

This project includes local observability boundaries:

- Structured logging through `pino` in `src/observability/logger.ts`.
- Request id middleware in `src/shared/middleware/request-id.ts`.
- HTTP request metrics in `src/observability/http-metrics.ts`.
- Problem response metrics through `recordProblemResponse` in `src/observability/metrics.ts`.
- Job metrics in `src/observability/job-metrics.ts`.
- Cache metrics in `src/observability/cache-metrics.ts`.
- Worker readiness gauge in `src/worker/worker.ts` and `src/observability/metrics.ts`.
- Prometheus-style text output from `GET /v1/metrics`.

Metric labels are intentionally low-cardinality. The project should not use user ids, project ids, job ids, raw URLs, query strings, tokens, Redis keys, request bodies, or secret values as labels.

This project does not include a real monitoring dashboard, real Prometheus server proof, Grafana, paging, or a production alerting backend.

## 10. Reliability and Consistency

- Retry: `src/queue/job-contract.ts` configures bounded BullMQ attempts and exponential backoff. `src/queue/retry-policy.ts` separates permanent, transient, and unknown failure classes. `tests/retry-policy.unit.test.ts` covers retry behavior.
- Idempotency: `src/modules/tasks/tasks.service.ts` creates a unique `JobRecord.idempotencyKey`, and `src/worker/processor.ts` uses an import batch boundary plus the Prisma unique task constraint to avoid duplicate imported tasks. `npm run consistency:check` is the runtime check for this mechanism.
- Worker failure boundary: `src/worker/processor.ts` records failed jobs and failure classes; `src/worker/worker.ts` logs completed/failed BullMQ jobs; `src/worker/worker-health.ts` marks readiness with `/tmp/distributed-task-worker-ready`.
- Cache consistency: `src/cache/cache-aside.ts` performs cache-aside reads, `src/cache/cache-invalidation.ts` deletes derived summary state, and `src/worker/processor.ts` invalidates summaries after imports. `tests/cache-consistency.unit.test.ts`, `npm run cache:check`, and `npm run consistency:check` tie the claim to tests/checks.
- Graceful shutdown: `src/api/server.ts` handles `SIGINT` and `SIGTERM`, closes the HTTP server, queue, Redis client, and Prisma client with a timeout. `src/worker/worker-shutdown.ts` closes the BullMQ worker, queue, queue events, Redis client, and Prisma client.

The project does not claim perfect exactly-once processing. It demonstrates idempotent handling for duplicate-safe retry paths.

## 11. Docker / NGINX Runtime

The project provides Docker Compose and NGINX configuration for local validation. Runtime evidence should be captured before public portfolio use.

Local Docker Compose runtime:

- `compose.yaml` defines `postgres`, `redis`, `api`, `worker`, and `nginx`.
- `postgres` uses `postgres:18-alpine` with a `pg_isready` healthcheck.
- `redis` uses `redis:8-alpine` with a `redis-cli ping` healthcheck.
- `api` builds from the local `Dockerfile`, runs `node dist/src/api/server.js`, and exposes internal port `3030`.
- `worker` builds from the same context and runs `node dist/src/worker/worker.js`.
- `nginx` uses `nginx:1.29-alpine`, maps host port `8080` to container port `80`, and proxies to `api:3030`.

Boundaries:

- Local Docker Compose runtime: provided by `Dockerfile`, `compose.yaml`, and `nginx/nginx.conf`; Stage 2 should capture command logs before public portfolio use.
- Public production deployment: not proven by this repository.
- Real registry image: not proven; no pushed image digest is recorded here.
- Real Kubernetes rollout: not part of this project; no cluster manifests or `kubectl` evidence exist in this primary project.

## 12. Supporting Evidence Projects

These projects are related local evidence. They are not merged into `distributed-task-platform-lab`, and their capabilities should not be claimed as primary-project runtime features.

| Supporting project | Conceptual support | Boundary |
| --- | --- | --- |
| `contract-governed-notes-api` | API contract governance, OpenAPI, compatibility checks, version/deprecation policy, SDK checks | Supports API governance claims; does not mean this project publishes an SDK |
| `final-production-release-lab` | Release/security evidence, workflow policy checks, dependency/secret/Docker/Kubernetes static checks, SBOM, release manifest | Supports release/security explanation; does not prove real cloud deployment, registry push, or remote GitHub Actions success |
| `platform-observability-kubernetes-lab` | Observability/platform modeling, metrics, traces, SLO checks, alert checks, static Kubernetes manifests | Supports platform explanation; does not prove Grafana, paging, tracing backend, or real cluster rollout |
| `resilient-notes-api` | Reliability patterns such as timeout, cancellation, retry, idempotency, circuit breaker, bulkhead, fault checks | Supports reliability vocabulary; does not mean those exact mechanisms are merged into this project |
| `performance-notes-api` | Performance diagnostics, event-loop delay, memory, worker thread demos, stream backpressure, benchmark budgets | Supports performance discussion; does not prove production traffic or cloud capacity |
| `secure-notes-auth-api` | Password auth, opaque sessions, cookie/CSRF boundary, CORS, rate limiting, owner authorization | Supports auth/security boundary discussion; this primary project currently has no auth layer |

## 13. Limitations

- No real production deployment.
- No real user traffic.
- No real GitHub Actions remote run.
- No real container registry image digest.
- No real Kubernetes cluster rollout.
- No real monitoring dashboard.
- No full security review.
- No authentication or authorization layer in the primary project.
- No Kafka, RabbitMQ, service mesh, cloud provider SDK, GraphQL, gRPC, tRPC, or frontend.
- No claim of perfect exactly-once processing.
- Runtime evidence from Docker Compose should be captured in Stage 2 before public portfolio use.

## 14. Portfolio Claim Boundary

Safe claims:

| Safe claim | Evidence | Boundary |
| --- | --- | --- |
| Built a local Node.js / TypeScript backend architecture lab with separate API and worker processes | `src/api/server.ts`, `src/worker/worker.ts`, `compose.yaml` services `api` and `worker` | Local lab only; not a deployed production platform |
| Modeled a BullMQ-backed background task import boundary | `src/queue/job-contract.ts`, `src/queue/task-queue.ts`, `src/modules/tasks/tasks.service.ts`, `src/worker/processor.ts` | Does not imply managed broker or multi-region delivery |
| Implemented idempotent import handling for duplicate-safe retry paths | `JobRecord.idempotencyKey`, task unique constraint in `prisma/schema.prisma`, `npm run consistency:check` script | Does not mean exactly-once processing |
| Demonstrated Redis cache-aside reads and explicit cache invalidation | `src/cache/cache-aside.ts`, `src/cache/cache-invalidation.ts`, `src/modules/cache-demo`, `npm run cache:check` | Does not prove global cache consistency in production |
| Provided health/readiness and Prometheus-style metrics endpoints | `src/health`, `src/observability`, `GET /v1/health/live`, `GET /v1/health/ready`, `GET /v1/metrics` | Does not prove real dashboard, alert routing, or production monitoring |
| Provided Docker Compose and NGINX configuration for local validation | `Dockerfile`, `compose.yaml`, `nginx/nginx.conf` | Stage 2 command evidence should be captured before public portfolio use |

Unsafe claims:

| Unsafe claim | Why unsafe | Safer wording |
| --- | --- | --- |
| Production microservices platform | The project is a local API/worker lab without production service discovery, independent deploy evidence, traffic, SLO backend, or cloud runtime | Local Node.js architecture lab with API/worker boundaries |
| Exactly-once processing | BullMQ and worker retries can redeliver work; the project uses idempotency to make duplicate-safe writes | Idempotent job handling for duplicate-safe retry paths |
| Real Kubernetes deployment | This primary project has no Kubernetes manifests or cluster evidence | Docker Compose local runtime configuration; Kubernetes is future external proof |
| Real cloud deployment | No public URL, cloud logs, environment record, or deploy history exists | Local Docker Compose and NGINX validation path |
| Real monitoring dashboard | The project exposes metrics but has no Grafana/Prometheus dashboard evidence | Prometheus-style metrics endpoint with low-cardinality labels |
| Real incident response drill | No timed incident exercise, injected outage record, alert, mitigation timeline, or postmortem exists | Local reliability and consistency checks can support a future drill |

## 15. Interview Explanation

- Why split API and worker: the API should validate requests, create durable job records, enqueue work, and return a job id instead of blocking clients on slow retryable imports.
- Why use a queue: Redis/BullMQ creates a delivery boundary between HTTP request handling and background work, enabling retry, status polling, and worker concurrency control.
- Why idempotency matters: clients and workers can retry. A stable idempotency key lets duplicate requests return the existing job and avoids duplicate imported tasks.
- Why cache invalidation is explicit: TTL alone is a fallback. Writes and worker imports invalidate derived project summary state so future reads do not rely on stale cache entries.
- Why readiness differs from liveness: liveness only proves the process can respond; readiness checks PostgreSQL, Redis, and queue access before the service should receive traffic.
- What would be required before production use: authentication/authorization, threat modeling, remote CI evidence, image registry digest, real deployment logs, managed secret handling, monitoring dashboard, alert routing, runbook drill, backup/restore plan, and real runtime evidence.

## 16. Next Evidence Capture Plan

Do not treat these commands as already passed. They are the future Stage 2 runtime evidence plan.

| Order | Future command | Output to save |
| --- | --- | --- |
| 1 | `npm install` | Dependency installation log |
| 2 | `npm run prisma:generate` | Prisma generation log |
| 3 | `npm run typecheck` | TypeScript diagnostics |
| 4 | `npm run build` | Build output |
| 5 | `docker compose config` | Resolved Compose config output |
| 6 | `docker compose build --no-cache --progress=plain api worker` | Plain Docker build log for API and worker |
| 7 | `docker compose up -d postgres redis` | Dependency startup log |
| 8 | `npm run prisma:migrate:deploy` | Migration deploy log |
| 9 | `npm run seed` | Seed log |
| 10 | `docker compose up -d api worker nginx` | API, worker, and NGINX startup log |
| 11 | `docker compose ps` | Service and health status table |
| 12 | `npm run smoke` | JSON output proving liveness/readiness through `http://localhost:8080` |
| 13 | `npm run queue:check` | JSON output with accepted queued job |
| 14 | `npm run worker:check` | JSON output with completed worker job |
| 15 | `npm run cache:check` | JSON output with miss/hit/invalidation |
| 16 | `npm run consistency:check` | JSON output with duplicate idempotency handling and one matching task |
| 17 | `GET http://localhost:8080/v1/metrics` using a documented HTTP client | Metrics sample with low-cardinality labels |
| 18 | `docker compose down` | Cleanup log |

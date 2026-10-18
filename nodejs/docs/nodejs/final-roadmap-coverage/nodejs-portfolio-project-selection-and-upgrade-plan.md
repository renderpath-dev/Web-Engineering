# Node.js Portfolio Project Selection and Upgrade Plan

## 1. Selection Scope

本报告只回答一个问题：在当前 `D:\node.js\mini-projects` 已存在项目中，哪个最适合作为 Node.js 后端简历 / portfolio 的主项目，以及在公开展示前还缺哪些证据。

本次评估基于本地文件静态审阅，不执行运行时命令，不修改任何 mini project、章节、练习、测试、脚本、package 文件、Dockerfile、Compose、Kubernetes manifest 或生成产物。

已纳入检查的路线图与最终覆盖资料：

- `docs\roadmap\nodejs-mastery-roadmap-zh.md`
- `docs\nodejs\final-roadmap-coverage\nodejs-final-roadmap-coverage-matrix.md`
- `docs\nodejs\final-roadmap-coverage\nodejs-final-portfolio-evidence-map.md`
- `docs\nodejs\final-roadmap-coverage\nodejs-final-interview-readiness-map.md`

已重点比较的本地候选：

- `distributed-task-platform-lab`
- `contract-governed-notes-api`
- `final-production-release-lab`
- `platform-observability-kubernetes-lab`
- `resilient-notes-api`
- `performance-notes-api`
- `deployable-notes-api`
- `observable-notes-api`
- `secure-notes-auth-api`
- `redis-job-notes-api`
- `realtime-notes-api`
- `notes-attachments-api`

选择标准：

- 能否用一个项目讲清 Node.js 后端核心机制，而不只是单点 demo。
- 是否有可审阅的 API、worker、database、cache、queue、observability、Docker / NGINX、test evidence。
- 是否能形成诚实简历表达，避免把本地学习项目说成真实生产系统。
- 缺失证据是否可以通过后续 staged upgrade 补齐。

## 2. Candidate Comparison Matrix

| Project | Main capability demonstrated | Runtime complexity | Architecture value | Testing evidence | Docker / deployment evidence | Observability evidence | Security / release evidence | Resume strength | Main limitation | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `distributed-task-platform-lab` | API service, worker service, PostgreSQL, Redis-backed BullMQ jobs, cache-aside, cache invalidation, idempotency, retry, NGINX boundary | High for local lab: API + worker + PostgreSQL + Redis + NGINX through `compose.yaml` | Highest: can explain service boundary, queue contract, worker extraction, cache consistency, readiness, graceful shutdown | `package.json` lists `typecheck`, `build`, `test`, `smoke`, `queue:check`, `worker:check`, `cache:check`, `consistency:check`; `tests` cover API, queue, worker, cache, retry, idempotency, service boundary | `Dockerfile`, `compose.yaml`, `nginx\nginx.conf`; README documents `docker compose config`, build, up, migrate, seed, smoke | `src\observability` includes metrics, HTTP metrics, job metrics, cache metrics, correlation id, logger; `/v1/metrics` documented | Helmet/rate limit/problem details exist, but no full auth/release/CI/security pipeline in this project | Strongest primary story: one coherent backend system rather than isolated feature demo | No auth; no Kubernetes runtime; no real deployment; runtime evidence must be captured before public confidence | `PRIMARY_CANDIDATE` |
| `contract-governed-notes-api` | API contract governance: OpenAPI, route inventory, compatibility report, SDK checks, version/deprecation policy | Medium: API + PostgreSQL + Redis + NGINX | Strong for API governance and versioning, narrower than distributed architecture | `package.json` lists `openapi:check`, `contract:check`, `compatibility:check`, `sdk:check`; tests cover contract drift, OpenAPI, SDK, compatibility, deprecation | README documents Docker runtime and `http://localhost:8080`; compose files are local project evidence | `src\observability` includes contract metrics and HTTP metrics; README documents `/v1/metrics` | Security middleware present, but not a release/security pipeline | Excellent supporting evidence for API contract maturity | Does not publish a real SDK package; no external consumer repo; not broad enough as sole portfolio project | `SUPPORTING_EVIDENCE_PROJECT` |
| `final-production-release-lab` | Release boundary, dependency checks, secret checks, Docker hardening checks, Kubernetes security checks, SBOM, release manifest, rollback plan | Medium: local API + NGINX Compose runtime | Strong release/security evidence lab, but intentionally not business-domain architecture | `package.json` lists `workflow:check`, `dependency:check`, `secret:check`, `docker:check`, `k8s:security:check`, `release:check`, `permission:check`, `portfolio:check`; tests cover workflow, release, Docker, Kubernetes policy, security | `Dockerfile`, `compose.yaml`, NGINX runtime; README documents Docker Compose build/up/smoke/down | Limited runtime observability compared with observability-specific projects | Strongest local release/security artifact: SBOM and release manifest scripts, rollback decision tests, secret scanner | Best supporting project for release/security claims | README explicitly says no real cloud deployment, no registry push, no real GitHub run, no real secrets | `SUPPORTING_EVIDENCE_PROJECT` |
| `platform-observability-kubernetes-lab` | Observability and platform readiness: logs, Prometheus metrics, manual trace work, SLO reports, alert rules, static Kubernetes manifests | High local platform lab: API + PostgreSQL + Redis + Prometheus + NGINX + static k8s | Strong platform/observability story, but less product-domain depth | `package.json` lists `metrics:check`, `trace:check`, `slo:check`, `alert:check`, `k8s:check`, `docker:check`; tests cover metrics, tracing, SLO, alert rules, k8s manifest, readiness | `Dockerfile`, `compose.yaml`, `k8s\*.yaml`, `prometheus\*.yml`, NGINX | Strongest local observability evidence: metrics, tracing module, SLO, alerts, runbook, Prometheus config | Kubernetes manifests include static security/readiness modeling; not a real cluster rollout | Strong supporting evidence for observability/platform claims | No tracing backend, no Grafana dashboard, no paging integration, no real Kubernetes cluster | `SUPPORTING_EVIDENCE_PROJECT` |
| `resilient-notes-api` | Timeouts, cancellation, retry policy, idempotency keys, circuit breakers, bulkheads, degraded health, fault injection | Medium-high: API + PostgreSQL + Redis + NGINX Compose path | Strong reliability mechanism project | `package.json` lists `reliability:check`, `fault:check`, `idempotency:check`; tests cover retry, timeout, circuit breaker, bulkhead, health, idempotency | README documents Docker Compose runtime through PostgreSQL, Redis, API, NGINX | Metrics documented as low-cardinality | Security middleware exists, but not release/security focused | Strong supporting evidence for reliability interview answers | Narrower than primary candidate; no Kubernetes, service mesh, managed failover, or cloud proof | `SUPPORTING_EVIDENCE_PROJECT` |
| `performance-notes-api` | Performance measurement: latency, event loop delay, memory, query duration, Redis cost, stream backpressure, Worker Threads, autocannon budgets | Medium-high: API + PostgreSQL + Redis + NGINX + benchmark scripts | Strong for Node.js runtime/performance reasoning | `package.json` lists `load:baseline`, `benchmark:budget`, `capacity:report`; tests cover performance, worker pool, stream backpressure, metrics | README documents Docker Compose runtime and NGINX base URL | Prometheus metrics at `/metrics`; capacity report scripts | Not security/release focused | Strong supporting evidence for performance claims | Local-only benchmark; no production traffic or cloud capacity proof | `SUPPORTING_EVIDENCE_PROJECT` |
| `deployable-notes-api` | Production-oriented API boundary: emitted JS, reproducible install, Docker image, Compose, Prisma deploy migration, NGINX, health, smoke, graceful shutdown | Medium: API + PostgreSQL + Redis + NGINX Compose | Good deployment-baseline project, now superseded by more specialized later labs | `package.json` lists `wait:ready`, `release:validate`, `smoke`; tests cover health, smoke, proxy config, shutdown | `Dockerfile`, `compose.yaml`, NGINX; README documents local production simulation | Health and metrics endpoints present through source structure | Secure cookie/proxy trust boundary, but no full release pipeline | Useful baseline supporting evidence | Does not include cloud deployment, registry publish, Kubernetes, Terraform, or incident response | `REFERENCE_ONLY` |
| `observable-notes-api` | Structured logs, request context, Prometheus metrics, OpenTelemetry boundaries | Medium: API + PostgreSQL + Redis | Good observability foundation, superseded by `platform-observability-kubernetes-lab` for portfolio evidence | `package.json` lists tests for health, metrics, logging, request context, redaction | No inspected Compose/NGINX evidence in README; mostly app-level observability | Strong app-level observability and redaction boundary | Not release/security focused | Useful reference when explaining evolution toward platform observability | Narrower than platform lab; no dashboard/backend proof | `REFERENCE_ONLY` |
| `secure-notes-auth-api` | Password auth, opaque database sessions, cookies, CSRF, CORS, Helmet, rate limiting, owner authorization, role contrast | Medium: API + PostgreSQL | Strong security/auth mechanism evidence | `package.json` lists auth/protected-notes integration tests | README does not present Docker/NGINX portfolio runtime path | Not observability focused | Strong app security/auth mechanism, but no release pipeline | Supporting evidence if resume needs auth/security mechanism detail | Requires separate test database; less compelling as primary architecture project | `SUPPORTING_EVIDENCE_PROJECT` |
| `redis-job-notes-api` | Redis cache-aside, Redis rate limiting, BullMQ background exports | Medium: API + PostgreSQL + Redis + worker | Important queue/cache stepping stone, superseded by distributed platform project | `package.json` lists cache, rate-limit, jobs integration tests | README documents PostgreSQL/Redis/manual worker setup, not full portfolio deployment boundary | Not metrics/observability focused in README | Not security/release focused | Useful historical/reference project | `distributed-task-platform-lab` covers this story with stronger boundary and evidence | `REFERENCE_ONLY` |
| `realtime-notes-api` | Authenticated SSE, WebSocket upgrades, connection registry, durable PostgreSQL replay, Redis Pub/Sub fan-out | Medium-high: API + PostgreSQL + Redis + live connections | Strong real-time communication project, but separate from main backend architecture route | Integration tests cover SSE, WebSocket, event log; gated by `RUN_REALTIME_TESTS=true` when services are ready | README does not present Docker/NGINX portfolio runtime path | Not observability/platform focused | Origin/session validation and owner filtering are meaningful | Supporting evidence for real-time/event delivery interviews | No local production deployment path captured; not the strongest single portfolio umbrella | `SUPPORTING_EVIDENCE_PROJECT` |
| `notes-attachments-api` | Multipart uploads, local object storage, metadata, owner-checked downloads, soft deletion | Medium: API + PostgreSQL + local object-store adapter | Good file boundary project, but feature-specific | Integration tests cover upload, download, delete attachment | README does not present Docker/NGINX deployment path | Not observability focused | Strong file validation and owner authorization boundary | Useful reference for file upload/security questions | Narrower feature project; no deployment/release/observability evidence | `REFERENCE_ONLY` |

## 3. Primary Project Recommendation

`distributed-task-platform-lab` should be the primary resume / portfolio project.

Reason:

- It matches the roadmap’s final architecture direction better than any other single local project: API service, worker service, PostgreSQL persistence, Redis / BullMQ queue, cache-aside, cache invalidation, retry, idempotency, readiness, shutdown, metrics, Docker Compose, and NGINX.
- It gives an interview-friendly architecture story: start from modular monolith boundaries, extract slow retryable work into a worker, keep job contracts explicit, use idempotency for retry safety, use Redis cache with invalidation, and expose readiness/metrics for operations.
- It is broader than `contract-governed-notes-api`, which is excellent but mainly about API governance.
- It is more product/system-like than `final-production-release-lab`, which is intentionally a release/security evidence lab.
- It is more coherent as a main portfolio project than `platform-observability-kubernetes-lab`, which is strongest as platform/observability support.

Current confidence boundary:

- Static file evidence supports selecting `distributed-task-platform-lab` as the main candidate.
- Runtime confidence is not complete until the documented commands are run and logs are captured.
- Public resume wording must say local lab / local Node.js backend system, not production platform.

## 4. What Can Be Claimed

| Claim | Evidence | Safe wording | Boundary |
| --- | --- | --- | --- |
| Built a local Node.js backend system with separated API and worker processes | `distributed-task-platform-lab\src\api\server.ts`, `src\worker\worker.ts`, `package.json` scripts `start:api` and `start:worker`, `compose.yaml` services `api` and `worker` | Built a local Node.js architecture lab with separate API and worker processes | Do not call it a deployed microservices platform |
| Modeled background job processing with retry and idempotency | `src\queue\job-contract.ts`, `src\queue\retry-policy.ts`, `src\worker\processor.ts`, `tests\job-contract.unit.test.ts`, `tests\retry-policy.unit.test.ts`, `tests\idempotency.unit.test.ts` | Implemented a BullMQ-backed job boundary with explicit job contracts, bounded retry, and idempotency checks | Do not claim exactly-once processing |
| Implemented cache-aside reads and explicit cache invalidation | `src\cache\cache-aside.ts`, `src\cache\cache-invalidation.ts`, `src\modules\cache-demo`, `tests\cache-consistency.unit.test.ts`, `tests\cache.integration.test.ts` | Demonstrated Redis cache-aside behavior with invalidation and TTL fallback | Do not claim global cache consistency in a production distributed system |
| Exposed local health/readiness and metrics endpoints | README documents `/v1/health/live`, `/v1/health/ready`, `/v1/metrics`; `src\health`, `src\observability` | Added health/readiness checks and low-cardinality Prometheus-style metrics for a local service | Do not claim production monitoring or alerting |
| Containerized a local API/worker/DB/cache/reverse-proxy runtime | `Dockerfile`, `compose.yaml`, `nginx\nginx.conf`, README Docker Compose commands | Provided Docker Compose and NGINX boundaries for local runtime validation | Do not claim cloud deployment, registry publishing, or Kubernetes rollout |
| Can explain API contract governance as supporting evidence | `contract-governed-notes-api` README, `openapi\openapi.yaml`, scripts `openapi:check`, `contract:check`, `compatibility:check`, `sdk:check` | Built a supporting project for OpenAPI, compatibility checks, and version/deprecation policy | Do not claim a published SDK package or external consumer integration |
| Can explain local release/security evidence as supporting evidence | `final-production-release-lab` README, scripts `workflow:check`, `dependency:check`, `secret:check`, `docker:check`, `k8s:security:check`, `sbom:generate`, `release:manifest` | Built a local release evidence lab covering static CI/security/release gates | Do not claim a real GitHub Actions run, real registry image, or real cluster deployment |
| Can explain observability/platform boundaries as supporting evidence | `platform-observability-kubernetes-lab` README, `prometheus\alert-rules.yml`, `k8s\*.yaml`, scripts `metrics:check`, `trace:check`, `slo:check`, `alert:check`, `k8s:check` | Built a local observability/platform lab with metrics, traces, SLO checks, alert rules, and static Kubernetes manifests | Do not claim Grafana dashboards, paging, tracing backend, or real Kubernetes runtime |

## 5. What Must Not Be Claimed Yet

| Unsafe claim | Why unsafe | Missing evidence | Safer wording |
| --- | --- | --- | --- |
| Real production deployment | The inspected projects describe local labs and local Compose simulations, not a public production service | Real deployment URL, environment identity, release record, uptime evidence, production logs, rollback evidence | Local production-style runtime lab with Docker Compose and NGINX |
| Real Kubernetes cluster rollout | `platform-observability-kubernetes-lab` and `final-production-release-lab` include static Kubernetes manifests, but no real cluster command output was inspected | `kubectl apply`, namespace/pod/service rollout output, image digest, events, probes, logs from a real cluster | Static Kubernetes manifest modeling and security checks |
| Real GitHub Actions remote run | Local scripts inspect workflow policy, but no remote Actions run was executed or inspected in this pass | GitHub Actions run URL, job logs, commit SHA, artifacts, status checks | Local workflow policy/static CI checks |
| Real user traffic | No project includes production analytics, access logs, load balancer logs, user signups, or live traffic evidence | Traffic logs, anonymized request metrics, usage dashboard, public endpoint evidence | Local smoke/load/benchmark scripts for simulated traffic |
| Real monitoring dashboard | Metrics endpoints, Prometheus config, SLO checks, and alert rules exist, but no Grafana/Prometheus UI screenshot or backend query evidence was inspected | Dashboard URL/screenshot, Prometheus target status, Grafana panel export, trace backend evidence | Local Prometheus-style metrics and static alert/SLO checks |
| Real incident response drill | Runbook/static rollback logic exists in supporting projects, but no timed drill was performed | Drill plan, timeline, injected fault, detection evidence, mitigation steps, postmortem notes | Local reliability/fault-injection checks and rollback-decision modeling |
| Exactly-once job processing | The README explicitly avoids claiming perfect exactly-once processing | Broker/database transaction proof, duplicate delivery tests under failure, idempotency key audit under retries | Idempotent job handling for duplicate-safe retry paths |
| Full microservices platform | `distributed-task-platform-lab` says it is not a full microservices platform | Service discovery, independent deploys, network policy, production ops evidence, distributed tracing backend | API/worker boundary lab with queue-backed background processing |
| Secure production authentication system in the primary project | `distributed-task-platform-lab` README lists no authentication or authorization layer | Auth design, session/token handling, permission tests, threat model, security review | Supporting auth evidence exists in `secure-notes-auth-api`; primary project currently excludes auth |

## 6. Upgrade Plan

The stages below are future work only. This report does not perform any of these updates or runtime checks.

| Stage | Objective | Files to update later | Commands to run later | Evidence to capture | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Stage 1: Documentation polish | Make `distributed-task-platform-lab` readable as the main portfolio project without changing behavior | `mini-projects\distributed-task-platform-lab\README.md`; optional later `mini-projects\distributed-task-platform-lab\docs\architecture.md` if a separate architecture note is approved | No runtime command required for documentation-only wording; after edit, run a Markdown/link review if available | README diff, architecture diagram or text model, explicit limitation section, exact command list | README explains project summary, architecture, tech stack, setup, API/worker boundary, queue/cache/retry/idempotency, observability, Docker/NGINX, limitations, and interview explanation |
| Stage 2: Local runtime proof | Prove the primary project starts locally through its documented runtime boundary | `mini-projects\distributed-task-platform-lab\README.md` only if evidence paths/commands need clarification; no source changes required unless runtime fails | From `mini-projects\distributed-task-platform-lab`: `npm install`; `npm run prisma:generate`; `npm run typecheck`; `npm run build`; `docker compose config`; `docker compose build --no-cache --progress=plain api worker`; `docker compose up -d postgres redis`; `npm run prisma:migrate:deploy`; `npm run seed`; `docker compose up -d api worker nginx`; `docker compose ps`; `npm run smoke`; `docker compose down` | Terminal logs, `docker compose ps`, smoke output, health/ready responses, NGINX `http://localhost:8080` evidence | All commands pass on a clean local environment; API and worker are healthy; smoke uses NGINX public base URL |
| Stage 3: API contract and testing proof | Prove the HTTP/API behavior and job/cache contracts with tests and documented checks | `mini-projects\distributed-task-platform-lab\README.md`; optional later `openapi\openapi.yaml` only if documented routes drift | `npm test -- --test-concurrency=1`; `npm run queue:check`; `npm run worker:check`; `npm run cache:check`; `npm run consistency:check` | Test output, check output, route list, OpenAPI route alignment notes | API integration, queue integration, worker unit, cache integration, retry/idempotency tests and check scripts pass without manual intervention |
| Stage 4: Observability and reliability proof | Capture operational evidence rather than only source evidence | `mini-projects\distributed-task-platform-lab\README.md`; optional later docs for metrics examples and reliability scenarios | With the Compose stack up: request `/v1/metrics`; run `npm run queue:check`; `npm run worker:check`; `npm run cache:check`; `npm run consistency:check`; optionally trigger retry/failure scenarios already supported by tests/checks | Metrics sample, low-cardinality label review, queue/job event output, cache hit/miss/invalidation output, graceful shutdown logs | Evidence proves health/readiness, job metrics, cache metrics, retry/idempotency, and shutdown behavior in local runtime |
| Stage 5: Release/security proof | Add or link release/security evidence so the primary portfolio story is not only architecture | Prefer linking to `mini-projects\final-production-release-lab` as supporting evidence first; if integrating later, update `mini-projects\distributed-task-platform-lab\Dockerfile`, `compose.yaml`, README, and optional release/security scripts only after explicit approval | Supporting-project commands: in `mini-projects\final-production-release-lab`, run `npm run workflow:check`; `npm run dependency:check`; `npm run secret:check`; `npm run docker:check`; `npm run k8s:security:check`; `npm run release:check`; `npm run permission:check`; `npm run portfolio:check`; `npm run sbom:generate`; `npm run release:manifest` | Static security/release gate output, SBOM file, release manifest, rollback decision evidence, Docker hardening evidence | Resume can say release/security evidence exists locally, while clearly separating it from real remote CI or production deployment |
| Stage 6: Optional real deployment proof | Convert local claims into real deployment claims only if actually deployed | Deployment-specific files only after choosing target: `.github\workflows\*.yml`, deployment manifest, environment docs, registry config; do not alter learning project blindly | Candidate commands depend on target: remote GitHub Actions run; image build and push; cloud or cluster deploy; `kubectl rollout status` if Kubernetes is used; public smoke test; monitoring/dashboard checks | Actions run URL, image digest, deployment URL, cluster rollout logs, public smoke output, dashboard screenshot/export, rollback/drill evidence | Only after this stage passes may wording mention real deployment, remote CI, cluster rollout, registry image, or monitoring dashboard |

## 7. README Upgrade Outline

This is an outline only, not a full README.

- Project summary
  - One paragraph: local Node.js distributed task platform lab.
  - One sentence boundary: not a full production microservices platform.
- Architecture
  - API service.
  - Worker service.
  - PostgreSQL ownership.
  - Redis/BullMQ queue.
  - Cache-aside and invalidation.
  - NGINX public boundary.
- Tech stack
  - Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, BullMQ, Pino, prom-client, Docker, NGINX.
- Local setup
  - `npm install`
  - `npm run prisma:generate`
  - `npm run typecheck`
  - `npm run build`
- API contract
  - Link/list public routes.
  - Explain OpenAPI scope: HTTP routes only, not internal BullMQ delivery semantics.
- Validation commands
  - `npm test -- --test-concurrency=1`
  - `npm run smoke`
  - `npm run queue:check`
  - `npm run worker:check`
  - `npm run cache:check`
  - `npm run consistency:check`
- Docker/NGINX runtime
  - `docker compose config`
  - `docker compose build --no-cache --progress=plain api worker`
  - `docker compose up -d postgres redis`
  - `npm run prisma:migrate:deploy`
  - `npm run seed`
  - `docker compose up -d api worker nginx`
  - Public base URL: `http://localhost:8080`
- Reliability mechanisms
  - Job contract.
  - Retry policy.
  - Idempotency.
  - Stalled job explanation.
  - Graceful shutdown.
- Observability
  - Health/live.
  - Health/ready.
  - `/v1/metrics`.
  - Low-cardinality labels.
  - Job/cache/HTTP metrics.
- Release/security evidence
  - Link to `final-production-release-lab` as supporting release/security evidence.
  - State what is not yet proven: remote CI, registry push, real production deployment.
- Limitations
  - No authentication.
  - No Kubernetes runtime.
  - No real cloud deployment.
  - No real users/traffic.
  - No monitoring dashboard.
- Interview explanation
  - Why API/worker split exists.
  - Why a queue is used.
  - Why idempotency matters.
  - Why cache invalidation is explicit.
  - How readiness differs from liveness.
  - What would be required before production use.

## 8. Resume Bullet Drafts

- Built `distributed-task-platform-lab`, a local Node.js/TypeScript backend lab with separate Express API and worker processes, PostgreSQL persistence, Redis/BullMQ job processing, NGINX reverse proxying, and Docker Compose runtime boundaries.
- Implemented background task processing with explicit job contracts, bounded retry policy, idempotency checks, persisted job records/events, and worker shutdown handling to reason about duplicate-safe local job execution.
- Modeled Redis cache-aside reads for project summaries with explicit invalidation after worker imports, TTL fallback, and validation scripts for cache hit/miss and consistency behavior.
- Added local operational evidence through health/readiness endpoints, Prometheus-style low-cardinality metrics, API/queue/cache/worker tests, and smoke/check scripts documented for `http://localhost:8080`.
- Prepared supporting portfolio evidence across API contract governance, observability/platform modeling, and release/security checks using `contract-governed-notes-api`, `platform-observability-kubernetes-lab`, and `final-production-release-lab`, while keeping real deployment and production-traffic claims out of the resume until proven.

## 9. Final Recommendation

Use `distributed-task-platform-lab` as the primary portfolio project.

Next step:

- Polish its README and capture a clean local runtime evidence bundle: Docker Compose config/build/up, migration/seed, smoke through `http://localhost:8080`, queue/worker/cache/consistency checks, metrics sample, and cleanup output.

Do not do next:

- Do not generate Chapter 18 before the portfolio project evidence is cleaned up.
- Do not claim production deployment, real Kubernetes rollout, remote GitHub Actions success, real user traffic, monitoring dashboard, or incident response drill until those exact artifacts exist.
- Do not merge all supporting projects into the primary project unless there is a specific upgrade objective and a new validation plan.

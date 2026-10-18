# Node.js Final Interview Readiness Map

## 1. Interview Readiness Overview

- strong: runtime/event loop, core I/O, HTTP/Express, TypeScript backend boundary, runtime validation, Prisma/PostgreSQL, auth/session, Redis/cache/jobs, testing, Problem Details, OpenAPI, reliability, queue/worker, observability, npm supply chain, release/rollback evidence.
- acceptable: Docker/NGINX local runtime, Kubernetes probes/resources, CI/CD and GitHub Actions security, because local/static evidence is strong but remote platform evidence is limited.
- weak: NestJS/Fastify runnable framework proof, real cloud deployment, real remote CI run, real Kubernetes cluster rollout, real monitoring dashboard, full security review.
- not yet evidenced: production incident response, public traffic, registry signing/provenance, managed platform operation.

## 2. Mechanism-Level Question Map

| Topic | Expected mechanism answer | Chapter evidence | Practice / project evidence | Status |
| --- | --- | --- | --- | --- |
| event loop / async | Explain V8/libuv/event-loop phases, microtasks, nextTick, timers, blocking work, and observation limits. | Chapter 01, Chapter 12 | practices/01-runtime; runtime-lab-cli; performance-notes-api | strong |
| streams if covered | Explain chunks, Buffer boundary, pipeline, backpressure, error/cleanup ownership. | Chapter 02, Chapter 08, Chapter 12 | large-file-log-processor; notes-attachments-api; performance-notes-api | strong |
| HTTP lifecycle | Trace method/URL/headers/body stream -> request object -> response status/body/end. | Chapter 03 | typed-express-notes-api | strong |
| Express middleware | Explain order, next(), short-circuit, error middleware, async error flow. | Chapter 03, Chapter 04 | typed-api-starter and later APIs | strong |
| error handling | Distinguish internal Error/log from public Problem Details contract. | Chapter 04, Chapter 13, Chapter 14 | resilient-notes-api; contract-governed-notes-api | strong |
| TypeScript runtime boundary | Explain type erasure, NodeNext/runtime loading, unknown input, Zod validation. | Chapter 04 | typed-api-starter | strong |
| validation | Explain external input as runtime data and schema ownership. | Chapter 03, Chapter 04, Chapter 14 | typed-api-starter; contract-governed-notes-api | strong |
| database readiness | Explain connection pool, transaction, migration/seed, readiness and repository boundary. | Chapter 05, Chapter 11 | persistent-notes-api; deployable-notes-api | strong |
| Redis/cache | Explain cache aside, TTL, invalidation, rate limit and stale data. | Chapter 07, Chapter 15 | redis-job-notes-api; distributed-task-platform-lab | strong |
| auth/session | Explain session cookie, JWT tradeoff, CSRF, RBAC, password hashing. | Chapter 06 | secure-notes-auth-api | strong |
| testing | Explain unit/API/integration boundaries and node:test/Supertest ownership. | Chapter 04, Chapter 11 | tests across mini-projects | strong |
| Docker/NGINX | Explain image build, Compose network, reverse proxy, healthcheck, local smoke. | Chapter 11, Chapter 17 | deployable-notes-api; final-production-release-lab | strong |
| graceful shutdown | Explain SIGTERM, server.close, dependency cleanup, why not immediate process.exit. | Chapter 11, Chapter 16 | deployable-notes-api; performance-notes-api | strong |
| OpenAPI/API contract | Explain OpenAPI as public contract, contract drift, typed client and compatibility. | Chapter 14 | contract-governed-notes-api | strong |
| idempotency/retry/timeout | Explain retry budgets, aborts, idempotency keys, permanent vs transient failures. | Chapter 13, Chapter 15 | resilient-notes-api; distributed-task-platform-lab | strong |
| queue/worker/background jobs | Explain API/worker split, job payload contract, retry/idempotent worker handling. | Chapter 07, Chapter 15 | redis-job-notes-api; distributed-task-platform-lab | strong |
| observability | Explain logs/metrics/traces/SLO/alerts and their limitations. | Chapter 10, Chapter 16 | observable-notes-api; platform-observability-kubernetes-lab | strong |
| Kubernetes probes/resources | Explain liveness/readiness/resources/securityContext but admit no real cluster rollout. | Chapter 16, Chapter 17 | platform-observability-kubernetes-lab; final-production-release-lab | acceptable |
| CI/CD and GitHub Actions security | Explain event/workflow/job/step/runner/action, token permission, pull_request_target risk. | Chapter 17 | final-production-release-lab workflow/security checks | acceptable |
| npm supply chain | Explain npm ci, package-lock, audit, SBOM, dependency review boundaries. | Chapter 17 | final-production-release-lab dependency/SBOM scripts | strong |
| release/rollback evidence | Explain release manifest, promote/hold/rollback and portfolio proof limits. | Chapter 17 | final-production-release-lab release manifest/rollback files | strong |
| NestJS/Fastify | Explain only conceptually from roadmap unless separately studied; no local runnable project evidence. | Roadmap Phase 8 | No dedicated local project | weak |

## 3. Interview Weak Spots

| Weak spot | Why weak | File/chapter showing partial coverage | One exercise or project task to strengthen it |
| --- | --- | --- | --- |
| NestJS/Fastify | Roadmap Phase 8 exists but there is no dedicated accepted guide/practice/mini project. | docs/roadmap/nodejs-mastery-roadmap-zh.md Phase 8; transfer notes in Chapter 10/11 | Build a small NestJS or Fastify version of typed-api-starter only if this framework track becomes necessary. |
| Remote GitHub Actions | Chapter 17 has local workflow/security checks, but no remote runner URL/log evidence. | chapter-17 guide and .codex-tasks/chapter-17-production-release-security local audit | Run the workflow in GitHub and save run URL, job logs, and artifact summary. |
| Real cloud deployment | Docker/Compose local evidence exists, but no Render/Railway/Fly/AWS/VPS artifact. | Chapter 11 deployment guide and deployable-notes-api | Deploy one project and record URL, health output, logs, env boundary, and rollback note. |
| Real Kubernetes rollout | Kubernetes manifests and static checks exist, but no cluster runtime/admission evidence. | Chapter 16 and 17 Kubernetes sections | Apply to a local or cloud cluster and preserve kubectl get/describe/logs evidence. |
| Monitoring backend | Metrics/traces/SLO are locally modeled; no real collector/dashboard/pager proof. | platform-observability-kubernetes-lab | Run Prometheus/Grafana or collector locally and capture scrape/dashboard/alert evidence. |
| Security review | Auth/release controls exist but no threat-model or penetration review artifact. | Chapter 06 and Chapter 17 | Create a small threat model and abuse-case test set for the chosen portfolio project. |

## 4. Final Review Plan

| Day | Review focus | Use existing evidence | Output |
| --- | --- | --- | --- |
| 1 | Runtime, event loop, modules, streams | Chapters 01-02; practices/01-runtime; practices/02-core-io; runtime-lab-cli; large-file-log-processor | Explain runtime vs framework, event loop caveats, Stream/backpressure. |
| 2 | HTTP, Express, TypeScript backend layering | Chapters 03-04; typed-express-notes-api; typed-api-starter | Trace request -> middleware -> validation -> controller -> service -> error response. |
| 3 | Database, auth, Redis/cache/jobs | Chapters 05-07; persistent/secure/redis mini projects | Explain transaction, session/JWT tradeoff, RBAC, cache aside, queue worker. |
| 4 | Uploads, realtime, observability | Chapters 08-10; notes-attachments-api; realtime-notes-api; observable-notes-api | Explain file safety, SSE/WebSocket, logs/metrics/traces/health. |
| 5 | Deployment, performance, reliability | Chapters 11-13; deployable/performance/resilient mini projects | Explain Docker/NGINX/shutdown, event-loop delay, timeout/retry/idempotency. |
| 6 | OpenAPI, service boundary, platform | Chapters 14-16; contract-governed-notes-api; distributed-task-platform-lab; platform-observability-kubernetes-lab | Explain contract drift, API/worker split, SLO/Kubernetes static boundary. |
| 7 | Release/security and portfolio honesty | Chapter 17; final-production-release-lab; final roadmap coverage files | Practice honest claims: local lab vs real production, static checks vs runtime proof. |

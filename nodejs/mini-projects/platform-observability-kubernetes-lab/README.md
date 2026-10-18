# Platform Observability Kubernetes Lab

Purpose:

- Demonstrates production observability boundaries for a local Node.js API.
- Includes structured logs, Prometheus metrics, manual trace work, SLO reports, alert rules, Docker Compose, NGINX, PostgreSQL readiness, Redis readiness, and static Kubernetes manifests.

Boundary:

- This is not a full Kubernetes production platform.
- It does not include cloud deployment, Helm, Terraform, service mesh, real Ingress, certificate automation, a tracing backend, Grafana dashboards, paging integrations, or real secrets.

Local setup:

- Windows PowerShell: npm install; npm run typecheck; npm run build; npm test -- --test-concurrency=1
- macOS or Linux: npm install; npm run typecheck; npm run build; npm test -- --test-concurrency=1

Docker Compose:

- docker compose config
- docker compose build --no-cache --progress=plain api
- docker compose up -d postgres redis api prometheus nginx
- npm run smoke
- docker compose down

Checks:

- npm run smoke
- npm run metrics:check
- npm run trace:check
- npm run slo:check
- npm run alert:check
- npm run k8s:check
- npm run docker:check

Endpoints:

- GET /v1/health/live
- GET /v1/health/ready
- GET /v1/health/startup
- GET /v1/metrics
- GET /v1/simulate/ok
- GET /v1/simulate/error
- GET /v1/simulate/slow
- GET /v1/simulate/event-loop-delay
- POST /v1/simulate/trace-work
- GET /v1/slo/policy
- GET /v1/slo/report
- GET /v1/platform/runbook
- GET /v1/platform/kubernetes-model

Runtime boundaries:

- Liveness proves the process can answer a minimal request.
- Readiness proves required dependencies are available for traffic.
- Startup protects slow initialization before liveness restarts become useful.
- Metrics avoid request ids, trace ids, span ids, user ids, raw URLs, tokens, emails, Redis keys, database URLs, and request bodies as labels.
- Kubernetes manifests are static learning artifacts and do not claim a real cluster deployment.

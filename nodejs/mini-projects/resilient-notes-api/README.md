# Resilient Notes API

This mini project demonstrates reliability boundaries for a Node.js API:
timeouts, cancellation, retry policy, idempotency keys, RFC 9457 problem details,
Prisma transaction conflict retry, Redis failure handling, cache fallback,
circuit breakers, bulkheads, degraded health, fault injection, and low-cardinality metrics.

## Local setup

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

## Docker Compose runtime

Windows PowerShell:

```powershell
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm run smoke
npm run reliability:check
npm run fault:check
npm run idempotency:check
docker compose down
```

macOS/Linux:

```bash
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm run smoke
npm run reliability:check
npm run fault:check
npm run idempotency:check
docker compose down
```

The default external base URL is `http://localhost:8080`.
Override it with `SMOKE_BASE_URL` when needed.

## Endpoints

- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`
- `GET /reliability/timeout-demo`
- `GET /reliability/abort-demo`
- `GET /reliability/retry-demo`
- `GET /reliability/circuit-breaker`
- `GET /reliability/bulkhead`
- `GET /reliability/degraded-cache`
- `POST /reliability/idempotent-operation`
- `POST /reliability/fault-injection`

## Known limitations

This project intentionally excludes Kubernetes, Terraform, service mesh,
Redis Cluster, PostgreSQL failover administration, Kafka, RabbitMQ,
cloud-provider SDKs, and frontend reliability code.

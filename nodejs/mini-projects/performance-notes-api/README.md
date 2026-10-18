# Performance Notes API

This mini project demonstrates Node.js performance engineering on top of a production-like Express API. It measures request latency, event loop delay, memory, database query duration, Redis round-trip cost, stream backpressure, and container capacity signals.

## What is included

- Express 5 API behind NGINX on `http://localhost:8080`
- PostgreSQL 18 and Redis through Docker Compose
- Prisma v7 style generated client and PostgreSQL driver adapter
- Prometheus metrics at `/metrics`
- Bounded CPU sync and Worker Thread demos
- Redis pipeline demo
- autocannon baseline and budget scripts

## Windows PowerShell

```powershell
npm install
npm run prisma:generate
npm run typecheck
npm run build
docker compose config
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm test -- --test-concurrency=1
npm run smoke
npm run load:baseline
npm run benchmark:budget
npm run capacity:report
docker compose down
```

## macOS and Linux

```bash
npm install
npm run prisma:generate
npm run typecheck
npm run build
docker compose config
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
npm test -- --test-concurrency=1
npm run smoke
npm run load:baseline
npm run benchmark:budget
npm run capacity:report
docker compose down
```

## Runtime endpoints

- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`
- `GET /performance/event-loop`
- `GET /performance/memory`
- `GET /performance/cpu-sync?size=small`
- `GET /performance/cpu-worker?size=small`
- `GET /performance/stream-report`
- `GET /performance/redis-pipeline-demo`
- `GET /performance/query-summary`

## Load and budget

`load:baseline` targets `http://localhost:8080` by default. Set `LOAD_BASE_URL` only when testing another compatible reverse-proxy entry.

`benchmark:budget` runs the same baseline and exits with an error when request rate, p95 latency, errors, or timeouts violate the configured budget.

## Known limitations

- This is a local learning project, not a cloud deployment.
- It does not expose heap snapshots over HTTP.
- It does not include Kubernetes, Terraform, service mesh, Redis Cluster, or vendor APM.
- The CPU endpoints are demo-scoped and hard limited.

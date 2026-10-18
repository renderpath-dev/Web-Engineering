# Contract Governed Notes API

This mini project demonstrates a contract-governed Express 5 API.

## Requirements

- Node.js 26 or newer
- Docker Desktop
- npm

## Local setup

```bash
npm install
npm run prisma:generate
```

## Docker runtime

```bash
docker compose up -d postgres redis
npm run prisma:migrate:deploy
npm run seed
docker compose up -d api nginx
```

The public base URL is `http://localhost:8080`.

## Validation

```bash
npm run typecheck
npm run build
npm test -- --test-concurrency=1
npm run smoke
npm run openapi:check
npm run contract:check
npm run compatibility:check
npm run sdk:check
```

PowerShell override:

```bash
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
Remove-Item Env:\SMOKE_BASE_URL
```

macOS and Linux override:

```bash
SMOKE_BASE_URL=http://localhost:8080 npm run smoke
```

## Contract endpoints

- `GET /v1/contracts/openapi.yaml`
- `GET /v1/contracts/route-inventory`
- `GET /v1/contracts/compatibility-report`
- `GET /v1/version`
- `GET /v1/deprecated-demo`

## Versioning and deprecation policy

The API uses `/v1` path versioning. The deprecated demo endpoint sets `Deprecation`, `Sunset`, and `Link` headers.

## Metrics

`GET /v1/metrics` exposes low-cardinality Prometheus metrics. Labels use route patterns, operation IDs, status classes, and rule names only.

## Limitations

- The compatibility report is rule-based and does not replace human review.
- This project does not publish an SDK package.
- This project does not include GraphQL, gRPC, AsyncAPI, Kubernetes, or cloud gateway configuration.

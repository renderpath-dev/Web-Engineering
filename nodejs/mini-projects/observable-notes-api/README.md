# Observable Notes API

A learning mini project for production observability boundaries in a Node.js, Express 5, TypeScript, Prisma, Redis, Pino, prom-client, and OpenTelemetry service.

## Environment

Create `.env` from the project-local sample file.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

## Install

```powershell
npm install
npm run prisma:generate
npm run typecheck
```

## Run

```powershell
npm run dev
```

## Health and metrics

```powershell
Invoke-RestMethod http://localhost:3010/health/live
Invoke-RestMethod http://localhost:3010/health/ready
Invoke-WebRequest http://localhost:3010/metrics
```

## Boundary

`/health/live` does not depend on PostgreSQL or Redis. `/health/ready` checks both dependencies and returns only safe status values. `/metrics` exposes Prometheus text and does not expose request bodies, cookies, authorization headers, CSRF tokens, session tokens, diagnostic reports, database URLs, or Redis URLs.

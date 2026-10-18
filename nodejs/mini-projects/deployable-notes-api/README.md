# deployable-notes-api

This mini project demonstrates a production-oriented TypeScript Node.js API boundary: emitted JavaScript, reproducible installs, Docker image creation, Docker Compose simulation, Prisma migration deployment, NGINX reverse proxying, proxy trust, secure cookies, health checks, smoke tests, and graceful shutdown.

## Local development

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run typecheck
npm test
npm run build
npm run dev
```

macOS/Linux:

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run typecheck
npm test
npm run build
npm run dev
```

## Local production simulation

Windows PowerShell:

```powershell
docker compose up --build -d
$env:SMOKE_BASE_URL = "http://localhost:8080"
npm run smoke
docker compose down
```

macOS/Linux:

```bash
docker compose up --build -d
SMOKE_BASE_URL=http://localhost:8080 npm run smoke
docker compose down
```

## Prisma migration deploy

Use `npm run prisma:migrate:deploy` when a PostgreSQL database is reachable and migration files are committed under `prisma/migrations`. Do not use `prisma migrate dev` as the production deploy command.

## Health and smoke checks

`GET /health/live` only proves that the Node process can answer HTTP. `GET /health/ready` checks PostgreSQL and Redis. `npm run smoke` requires both endpoints to return successful responses.

## Reverse proxy boundary

`nginx/nginx.conf` forwards traffic to the API service, preserves `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto`, supports WebSocket upgrade headers for future routes, and disables buffering for long-lived streaming boundaries.

## Limitations

This project is a local learning artifact. It does not include cloud deployment, registry publishing, production TLS automation, autoscaling, Kubernetes manifests, Terraform files, frontend UI, or incident response automation.

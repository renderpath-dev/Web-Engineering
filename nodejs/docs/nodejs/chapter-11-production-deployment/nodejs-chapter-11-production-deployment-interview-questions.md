# Node.js 第 11 章面试题：生产部署、Docker、CI/CD 与发布安全

## 1. development runtime versus production runtime

Development runtime optimizes feedback with watchers. Production runtime starts a fixed artifact with Node and must not recompile or watch source.

## 2. source/build/runtime/release artifact

Source is edited text, build output is emitted JS, runtime artifact is what the process starts, and release artifact includes migrations, config templates, CI and smoke checks.

## 3. npm install versus npm ci

`npm install` can update dependency resolution; `npm ci` installs from the lockfile and is the reproducible CI boundary.

## 4. package-lock reproducibility

The lockfile pins the resolved dependency graph that `npm ci` installs.

## 5. production package scripts

Scripts make release gates named and repeatable: build, start, typecheck, test, migrate deploy, smoke.

## 6. TypeScript build output

TypeScript checks source and emits JavaScript. Node executes emitted JS, not TypeScript types.

## 7. env validation

Environment variables are untyped strings at process startup and require runtime parsing before listening.

## 8. .env.example versus secrets

The example documents required names and placeholder shape; real secrets belong in local or CI secret storage.

## 9. NODE_ENV production

`NODE_ENV=production` changes runtime assumptions and should not be used as a secret or deployment proof.

## 10. Docker build context

The context is the filesystem sent to the builder, so `.dockerignore` is part of the security and artifact boundary.

## 11. .dockerignore

It prevents local dependencies, logs, coverage, docs and secrets from entering the build context.

## 12. multi-stage Dockerfile

Separate dependency install, build, and runtime stages reduce runtime artifacts and avoid watchers.

## 13. Docker Compose local production simulation

Compose wires local containers and networks but does not equal a cloud deployment platform.

## 14. Prisma migrate dev versus migrate deploy

`migrate dev` creates and applies development migrations; `migrate deploy` applies committed migrations.

## 15. migration safety

Destructive schema changes can break old code or delete data and need explicit release planning.

## 16. rollback boundary

Code rollback can be fast; database rollback may require a forward fix, backup restore, or manual approval.

## 17. health checks

Liveness proves process response; readiness proves dependencies required to serve real traffic.

## 18. reverse proxy model

The proxy receives client traffic and forwards a new upstream request with selected headers.

## 19. Express trust proxy

It controls whether Express uses forwarded headers for protocol and client IP.

## 20. secure cookies behind proxy

Secure cookies depend on the original protocol; misconfigured proxy trust can make the app see HTTP.

## 21. WebSocket proxying

WebSocket requires HTTP/1.1 upgrade and Connection headers across the proxy.

## 22. SSE proxy buffering

Streaming responses need buffering and timeout decisions so frames flush promptly.

## 23. stdout/stderr logs

Container logs should leave the process through stdio rather than local files.

## 24. GitHub Actions Node CI

A useful CI template runs install, generate, typecheck, tests, build and release validation.

## 25. secrets in CI

Secrets are referenced from secret storage and should not be hard-coded in YAML.

## 26. smoke tests

Smoke tests prove a started process answers safe endpoints after deployment.

## 27. graceful shutdown

Shutdown stops accepting requests, waits or times out, then closes Redis and Prisma.

## 28. deployable-notes-api architecture

The project keeps business routes familiar and moves the learning focus to release and runtime boundaries.

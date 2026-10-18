# Node.js 第 11 章速查表：生产部署与发布边界

## Release artifact quick reference

| Boundary | Safe rule |
| --- | --- |
| Source | Commit TypeScript source, Prisma schema, migrations, config templates, Dockerfile, Compose, CI template |
| Build output | Generate `dist/` through `npm run build`; do not hand-edit output |
| Runtime | Start with `node dist/src/server.js`; do not use watchers |
| Image | Build from selected context; do not bake secrets |

## npm install versus npm ci

| Command | Use |
| --- | --- |
| `npm install` | Local dependency changes and initial install |
| `npm ci` | CI and reproducible install from lockfile |

## Package scripts

- `build`: `tsc -p tsconfig.json`
- `start`: `node dist/src/server.js`
- `typecheck`: `tsc --noEmit`
- `test`: `node --import tsx --test ...`
- `prisma:migrate:deploy`: production migration application
- `smoke`: post-start health validation

## TypeScript and env

- `module` and `moduleResolution`: `NodeNext`
- `outDir`: `dist`
- `noEmit`: use `false` or omit for production build, use `tsc --noEmit` for checking
- Env validation: parse before `server.listen`
- `.env.example`: placeholder values only
- `NODE_ENV=production`: runtime mode signal, not a secret

## Docker, Compose, Prisma, proxy, CI

- `.dockerignore`: exclude `.env`, `node_modules`, logs, coverage, docs, secrets, local artifacts.
- Dockerfile: deps stage, builder stage, runtime stage.
- Compose: api, postgres, redis, nginx.
- Prisma: generate client before typecheck/build; deploy migrations with `prisma migrate deploy`.
- NGINX: preserve `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`; set WebSocket upgrade headers; disable buffering for streaming boundaries.
- Express: configure `trust proxy` deliberately before relying on forwarded protocol or secure cookies.
- CI: checkout, setup-node, `npm ci`, Prisma generate, typecheck, tests, build, release validation.
- Smoke: require `/health/live` and `/health/ready`.
- Shutdown: stop HTTP, close Redis, disconnect Prisma, use timeout.

## Common mistakes

- Running `tsx watch` in production.
- Copying `.env` into Docker image.
- Running `prisma migrate dev` during production deploy.
- Treating liveness as readiness.
- Trusting forwarded headers without proxy configuration.
- Assuming code rollback reverses database migration.

## Official docs

- https://nodejs.org/api/process.html
- https://nodejs.org/api/http.html
- https://nodejs.org/api/test.html
- https://nodejs.org/api/assert.html
- https://nodejs.org/api/environment_variables.html
- https://nodejs.org/api/cli.html
- https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- https://docs.npmjs.com/cli/v11/commands/npm-ci
- https://docs.npmjs.com/cli/v11/commands/npm-install
- https://docs.npmjs.com/cli/v11/commands/npm-run
- https://docs.npmjs.com/cli/v11/commands/npm-prune
- https://docs.npmjs.com/cli/v11/commands/npm-audit
- https://docs.docker.com/reference/dockerfile/
- https://docs.docker.com/guides/nodejs/
- https://docs.docker.com/build/cache/
- https://docs.docker.com/build/building/context/
- https://docs.docker.com/compose/compose-file/
- https://docs.docker.com/engine/logging/
- https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs
- https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
- https://github.com/actions/checkout
- https://github.com/actions/setup-node
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions
- https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
- https://www.prisma.io/docs/orm/reference/prisma-cli-reference
- https://www.prisma.io/docs/orm/reference/prisma-config-reference
- https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client
- https://www.prisma.io/docs/orm/reference/error-reference

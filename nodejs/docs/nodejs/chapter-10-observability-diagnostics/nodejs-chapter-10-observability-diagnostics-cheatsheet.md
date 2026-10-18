# Node.js 第 10 章速查表：Observability and Diagnostics

## Signal quick reference

| Signal | Question | Boundary |
| --- | --- | --- |
| log | What happened once? | structured JSON, redacted |
| metric | How often or how much? | low-cardinality numeric time series |
| trace | Where did time go? | spans and context |
| health | Can traffic be accepted? | live versus ready |
| diagnostic report | What was process state? | private file only |

## Structured logging quick reference

Use `level`, `time`, `message`, `requestId`, `method`, `route`, `statusCode`, `durationMs`. Do not log raw body, cookie, authorization header, CSRF token, session token, database URL, Redis URL, or client-visible stack.

## Metrics quick reference

Safe labels: `method`, `route`, `status_class`. Unsafe labels: `userId`, `email`, `requestId`, `sessionId`, `noteId`, `traceId`, `rawUrl`, `errorMessage`, `authorization`, `cookie`.

## Health, tracing, diagnostics

`/health/live` checks process only. `/health/ready` checks PostgreSQL and Redis. Start OpenTelemetry before app imports. Keep diagnostic reports private.

## Official docs

- [Node.js process](https://nodejs.org/api/process.html)
- [Node.js AsyncLocalStorage](https://nodejs.org/api/async_context.html)
- [Node.js diagnostics_channel](https://nodejs.org/api/diagnostics_channel.html)
- [Node.js perf_hooks](https://nodejs.org/api/perf_hooks.html)
- [Node.js diagnostic report](https://nodejs.org/api/report.html)
- [Node.js CLI](https://nodejs.org/api/cli.html)
- [Node.js test runner](https://nodejs.org/api/test.html)
- [Node.js assert](https://nodejs.org/api/assert.html)
- [Node.js events](https://nodejs.org/api/events.html)
- [Node.js timers](https://nodejs.org/api/timers.html)
- [Express 5 API](https://expressjs.com/en/5x/api/)
- [Express middleware](https://expressjs.com/en/guide/using-middleware/)
- [Express error handling](https://expressjs.com/en/guide/error-handling/)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/)
- [OpenTelemetry instrumentation](https://opentelemetry.io/docs/languages/js/instrumentation/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)
- [OpenTelemetry context](https://opentelemetry.io/docs/languages/js/context/)
- [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/http/)
- [Pino](https://getpino.io/)
- [Pino redaction](https://github.com/pinojs/pino/blob/main/docs/redaction.md)
- [prom-client](https://github.com/prometheus/client_js)
- [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/)
- [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Prisma logging](https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging)
- [Prisma tracing](https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/opentelemetry-tracing)
- [Prisma connection management](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management)
- [Prisma error reference](https://www.prisma.io/docs/orm/reference/error-reference)
- [Redis node-redis guide](https://redis.io/docs/latest/develop/clients/nodejs/)
- [Zod](https://zod.dev/)
- [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [npm install](https://docs.npmjs.com/cli/v11/commands/npm-install/)
- [npm run-script](https://docs.npmjs.com/cli/v11/commands/npm-run-script/)
- [TypeScript TSConfig](https://www.typescriptlang.org/tsconfig/)
- [TypeScript modules](https://www.typescriptlang.org/docs/handbook/2/modules.html)

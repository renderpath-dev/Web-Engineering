# Node.js 第 10 章面试题：Observability and Diagnostics

## 1. observability versus debugging

**Question:** Explain observability versus debugging.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 2. logs versus metrics versus traces

**Question:** Explain logs versus metrics versus traces.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 3. structured logging

**Question:** Explain structured logging.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 4. log levels

**Question:** Explain log levels.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 5. redaction

**Question:** Explain redaction.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 6. log injection

**Question:** Explain log injection.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 7. request IDs

**Question:** Explain request IDs.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 8. AsyncLocalStorage

**Question:** Explain AsyncLocalStorage.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 9. Express request logging

**Question:** Explain Express request logging.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 10. Express error logging

**Question:** Explain Express error logging.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 11. liveness versus readiness

**Question:** Explain liveness versus readiness.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 12. database readiness

**Question:** Explain database readiness.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 13. Redis readiness

**Question:** Explain Redis readiness.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 14. counters, gauges, histograms

**Question:** Explain counters, gauges, histograms.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 15. HTTP duration metrics

**Question:** Explain HTTP duration metrics.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 16. event loop delay

**Question:** Explain event loop delay.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 17. metric label cardinality

**Question:** Explain metric label cardinality.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 18. Prometheus /metrics

**Question:** Explain Prometheus /metrics.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 19. traces and spans

**Question:** Explain traces and spans.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 20. OpenTelemetry setup order

**Question:** Explain OpenTelemetry setup order.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 21. manual spans

**Question:** Explain manual spans.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 22. log/trace correlation

**Question:** Explain log/trace correlation.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 23. Prisma logging/tracing

**Question:** Explain Prisma logging/tracing.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 24. Redis diagnostics

**Question:** Explain Redis diagnostics.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 25. process warnings

**Question:** Explain process warnings.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 26. unhandled rejections

**Question:** Explain unhandled rejections.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 27. uncaught exceptions

**Question:** Explain uncaught exceptions.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 28. diagnostic reports

**Question:** Explain diagnostic reports.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

## 29. observable-notes-api architecture

**Question:** Explain observable-notes-api architecture.

**Answer:** Answer with the mechanism boundary, safe fields, failure mode, and verification evidence.

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

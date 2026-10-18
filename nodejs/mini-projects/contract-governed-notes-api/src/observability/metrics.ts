import { collectDefaultMetrics, Counter, Registry } from "prom-client";

export const metricsRegistry = new Registry();
metricsRegistry.setDefaultLabels({ app: "contract_governed_notes_api" });
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "HTTP requests by method, route pattern, and status class",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const contractViolationCounter = new Counter({
  name: "api_contract_violations_total",
  help: "Contract violations by check name",
  labelNames: ["check_name"] as const,
  registers: [metricsRegistry]
});

export const unsupportedVersionCounter = new Counter({
  name: "api_unsupported_versions_total",
  help: "Unsupported API versions by version family",
  labelNames: ["version_family"] as const,
  registers: [metricsRegistry]
});

export const deprecatedUsageCounter = new Counter({
  name: "api_deprecated_endpoint_usage_total",
  help: "Deprecated endpoint usage by operationId",
  labelNames: ["operation_id"] as const,
  registers: [metricsRegistry]
});

export const problemResponseCounter = new Counter({
  name: "api_problem_responses_total",
  help: "Problem responses by code and status class",
  labelNames: ["code", "status_class"] as const,
  registers: [metricsRegistry]
});

export const compatibilityCheckCounter = new Counter({
  name: "api_compatibility_checks_total",
  help: "Compatibility checks by result",
  labelNames: ["result"] as const,
  registers: [metricsRegistry]
});

export const sdkParseFailureCounter = new Counter({
  name: "api_sdk_parse_failures_total",
  help: "SDK parse failures by operationId",
  labelNames: ["operation_id"] as const,
  registers: [metricsRegistry]
});

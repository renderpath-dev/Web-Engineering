import client from "prom-client";

export const registry = new client.Registry();

registry.setDefaultLabels({
  service_name: "platform-observability-kubernetes-lab"
});

client.collectDefaultMetrics({ register: registry });

const allowedMetricLabelNames = new Set([
  "method",
  "route",
  "status_class",
  "dependency_name",
  "operation_name",
  "error_class",
  "signal_kind",
  "slo_name",
  "alert_name",
  "service_name",
  "pod_role",
  "statistic",
  "result",
  "le"
]);

const forbiddenMetricLabelNames = [
  "user",
  "user_id",
  "project",
  "project_id",
  "job",
  "job_id",
  "request",
  "request_id",
  "trace",
  "trace_id",
  "span",
  "span_id",
  "email",
  "ip",
  "url",
  "query",
  "token",
  "redis_key",
  "database_url",
  "request_body",
  "body_hash"
];

export function assertSafeMetricLabels(labels: Record<string, string>): void {
  for (const [name, value] of Object.entries(labels)) {
    const normalizedName = name.toLowerCase();
    if (!allowedMetricLabelNames.has(normalizedName)) {
      throw new Error("Metric label is not in the allow list: " + name);
    }
    if (forbiddenMetricLabelNames.some((forbidden) => normalizedName === forbidden || normalizedName.includes(forbidden))) {
      throw new Error("Metric label is forbidden: " + name);
    }
    if (value.length > 120) {
      throw new Error("Metric label value is too long: " + name);
    }
  }
}

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"],
  registers: [registry]
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry]
});

export const dependencyReadiness = new client.Gauge({
  name: "dependency_readiness",
  help: "Dependency readiness status using 1 for ready and 0 for not ready.",
  labelNames: ["dependency_name"],
  registers: [registry]
});

export const eventLoopDelaySeconds = new client.Gauge({
  name: "event_loop_delay_seconds",
  help: "Event loop delay in seconds from Node perf_hooks monitorEventLoopDelay.",
  labelNames: ["statistic"],
  registers: [registry]
});

export const simulationSignalsTotal = new client.Counter({
  name: "simulation_signals_total",
  help: "Bounded simulation signals produced by demo endpoints.",
  labelNames: ["signal_kind"],
  registers: [registry]
});

export const traceWorkTotal = new client.Counter({
  name: "trace_work_total",
  help: "Manual trace work outcomes.",
  labelNames: ["operation_name", "result"],
  registers: [registry]
});

export const sloComplianceRatio = new client.Gauge({
  name: "slo_compliance_ratio",
  help: "Current SLO compliance ratio in the local sample window.",
  labelNames: ["slo_name"],
  registers: [registry]
});

export const sloBudgetRemainingRatio = new client.Gauge({
  name: "slo_budget_remaining_ratio",
  help: "Remaining error budget ratio in the local sample window.",
  labelNames: ["slo_name"],
  registers: [registry]
});

import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from "prom-client";
import { config } from "../config/env.js";

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({
  service: config.OTEL_SERVICE_NAME
});

collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "nodejs_"
});

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds by method, route pattern, and status class.",
  labelNames: ["method", "route", "status_class"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry]
});

export const processUptimeSeconds = new Gauge({
  name: "app_process_uptime_seconds",
  help: "Current process uptime in seconds.",
  collect() {
    this.set(process.uptime());
  },
  registers: [metricsRegistry]
});

export const processResidentMemoryBytes = new Gauge({
  name: "app_process_resident_memory_bytes",
  help: "Current resident set size in bytes.",
  collect() {
    this.set(process.memoryUsage().rss);
  },
  registers: [metricsRegistry]
});

import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from "prom-client";

export const metricsRegistry = new Registry();
metricsRegistry.setDefaultLabels({ app: "distributed_task_platform_lab" });
collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "HTTP requests by method, route pattern, and status class",
  labelNames: ["method", "route", "status_class"] as const,
  registers: [metricsRegistry]
});

export const problemResponseCounter = new Counter({
  name: "api_problem_responses_total",
  help: "Problem responses by code and status class",
  labelNames: ["code", "status_class"] as const,
  registers: [metricsRegistry]
});

export const jobQueuedCounter = new Counter({
  name: "jobs_queued_total",
  help: "Jobs queued by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobStartedCounter = new Counter({
  name: "jobs_started_total",
  help: "Jobs started by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobCompletedCounter = new Counter({
  name: "jobs_completed_total",
  help: "Jobs completed by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobFailedCounter = new Counter({
  name: "jobs_failed_total",
  help: "Jobs failed by job name and failure class",
  labelNames: ["job_name", "failure_class"] as const,
  registers: [metricsRegistry]
});

export const jobRetryCounter = new Counter({
  name: "jobs_retried_total",
  help: "Job retries by job name",
  labelNames: ["job_name"] as const,
  registers: [metricsRegistry]
});

export const jobDurationHistogram = new Histogram({
  name: "job_duration_seconds",
  help: "Job duration by job name and result",
  labelNames: ["job_name", "result"] as const,
  buckets: [0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [metricsRegistry]
});

export const queueDepthGauge = new Gauge({
  name: "queue_depth",
  help: "Queue depth by queue name",
  labelNames: ["queue_name"] as const,
  registers: [metricsRegistry]
});

export const cacheHitCounter = new Counter({
  name: "cache_hits_total",
  help: "Cache hits by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const cacheMissCounter = new Counter({
  name: "cache_misses_total",
  help: "Cache misses by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const cacheInvalidationCounter = new Counter({
  name: "cache_invalidations_total",
  help: "Cache invalidations by cache name",
  labelNames: ["cache_name"] as const,
  registers: [metricsRegistry]
});

export const workerReadinessGauge = new Gauge({
  name: "worker_readiness",
  help: "Worker readiness signal",
  labelNames: ["worker_name"] as const,
  registers: [metricsRegistry]
});

export function statusClass(statusCode: number): string {
  return `${Math.trunc(statusCode / 100)}xx`;
}

export function recordProblemResponse(code: string, status: number): void {
  problemResponseCounter.inc({ code, status_class: statusClass(status) });
}

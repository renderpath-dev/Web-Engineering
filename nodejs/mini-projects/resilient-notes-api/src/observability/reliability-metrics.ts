import { Counter, Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

export const retryAttemptTotal = new Counter({
  name: "resilient_notes_retry_attempt_total",
  help: "Retry attempts by operation and failure kind",
  labelNames: ["operation", "failureKind"],
  registers: [metricsRegistry]
});

export const retryExhaustedTotal = new Counter({
  name: "resilient_notes_retry_exhausted_total",
  help: "Retry policies that exhausted all attempts",
  labelNames: ["operation", "failureKind"],
  registers: [metricsRegistry]
});

export const timeoutTotal = new Counter({
  name: "resilient_notes_timeout_total",
  help: "Timeout count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const abortTotal = new Counter({
  name: "resilient_notes_abort_total",
  help: "Abort count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const idempotencyReplayTotal = new Counter({
  name: "resilient_notes_idempotency_replay_total",
  help: "Stored idempotency responses replayed",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const idempotencyConflictTotal = new Counter({
  name: "resilient_notes_idempotency_conflict_total",
  help: "Idempotency key conflicts by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const problemResponseTotal = new Counter({
  name: "resilient_notes_problem_response_total",
  help: "Problem details responses by problem code and status class",
  labelNames: ["code", "statusClass"],
  registers: [metricsRegistry]
});

export const circuitBreakerState = new Gauge({
  name: "resilient_notes_circuit_breaker_state",
  help: "Circuit breaker state gauge by dependency and state",
  labelNames: ["dependency", "state"],
  registers: [metricsRegistry]
});

export const circuitBreakerOpenTotal = new Counter({
  name: "resilient_notes_circuit_breaker_open_total",
  help: "Circuit breaker open events by dependency",
  labelNames: ["dependency"],
  registers: [metricsRegistry]
});

export const bulkheadRejectedTotal = new Counter({
  name: "resilient_notes_bulkhead_rejected_total",
  help: "Bulkhead rejections by dependency",
  labelNames: ["dependency"],
  registers: [metricsRegistry]
});

export const dependencyHealthStatus = new Gauge({
  name: "resilient_notes_dependency_health_status",
  help: "Dependency health as 1 for healthy and 0 for unhealthy",
  labelNames: ["dependency", "status"],
  registers: [metricsRegistry]
});

export const redisFallbackTotal = new Counter({
  name: "resilient_notes_redis_fallback_total",
  help: "Redis fallback count by operation",
  labelNames: ["operation"],
  registers: [metricsRegistry]
});

export const transactionRetryTotal = new Counter({
  name: "resilient_notes_transaction_retry_total",
  help: "Transaction retry count by reason",
  labelNames: ["reason"],
  registers: [metricsRegistry]
});

export function recordRetryAttempt(operation: string, failureKind: string): void {
  retryAttemptTotal.inc({ operation, failureKind });
}

export function recordRetryExhausted(operation: string, failureKind: string): void {
  retryExhaustedTotal.inc({ operation, failureKind });
}

export function recordTransactionRetry(reason: string): void {
  transactionRetryTotal.inc({ reason });
}

export function recordRedisFallback(operation: string): void {
  redisFallbackTotal.inc({ operation });
}

export function recordDependencyHealth(dependency: string, status: "healthy" | "unhealthy"): void {
  dependencyHealthStatus.set({ dependency, status }, status === "healthy" ? 1 : 0);
}

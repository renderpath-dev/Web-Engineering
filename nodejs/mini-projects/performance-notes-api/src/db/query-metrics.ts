import { Histogram } from "prom-client";
import { metricsRegistry } from "../observability/metrics.js";

export interface QueryMetricSummary {
  model: string;
  operation: string;
  count: number;
  totalDurationMs: number;
  maxDurationMs: number;
}

const summaries = new Map<string, QueryMetricSummary>();

export const queryDurationSeconds = new Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration by model and operation.",
  labelNames: ["model", "operation"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [metricsRegistry]
});

export async function measureQuery<T>(model: string, operation: string, action: () => Promise<T>): Promise<T> {
  const startedAt = process.hrtime.bigint();
  try {
    return await action();
  } finally {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const key = model + "." + operation;
    const existing = summaries.get(key) ?? {
      model,
      operation,
      count: 0,
      totalDurationMs: 0,
      maxDurationMs: 0
    };
    existing.count += 1;
    existing.totalDurationMs += durationMs;
    existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
    summaries.set(key, existing);
    queryDurationSeconds.observe({ model, operation }, durationMs / 1000);
  }
}

export function getQueryMetricSummary(): QueryMetricSummary[] {
  return Array.from(summaries.values()).map((summary) => ({
    ...summary,
    totalDurationMs: Number(summary.totalDurationMs.toFixed(3)),
    maxDurationMs: Number(summary.maxDurationMs.toFixed(3))
  }));
}

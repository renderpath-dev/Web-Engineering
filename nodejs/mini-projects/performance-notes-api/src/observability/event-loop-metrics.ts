import { eventLoopUtilization, monitorEventLoopDelay } from "node:perf_hooks";
import { Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

const delayHistogram = monitorEventLoopDelay({ resolution: 20 });
let interval: NodeJS.Timeout | undefined;
let previousUtilization = eventLoopUtilization();
let lastSnapshot = {
  delayMeanMs: 0,
  delayP95Ms: 0,
  delayMaxMs: 0,
  utilization: 0
};

export const eventLoopDelaySeconds = new Gauge({
  name: "node_event_loop_delay_seconds",
  help: "Event loop delay summary in seconds.",
  labelNames: ["quantile"] as const,
  registers: [metricsRegistry]
});

export const eventLoopUtilizationRatio = new Gauge({
  name: "node_event_loop_utilization_ratio",
  help: "Event loop utilization ratio for the last sample window.",
  registers: [metricsRegistry]
});

export function sampleEventLoopMetrics(): typeof lastSnapshot {
  const delayMeanMs = Number(delayHistogram.mean) / 1_000_000;
  const delayP95Ms = delayHistogram.percentile(95) / 1_000_000;
  const delayMaxMs = Number(delayHistogram.max) / 1_000_000;

  const current = eventLoopUtilization(previousUtilization);
  previousUtilization = eventLoopUtilization();
  lastSnapshot = {
    delayMeanMs,
    delayP95Ms,
    delayMaxMs,
    utilization: current.utilization
  };

  eventLoopDelaySeconds.set({ quantile: "mean" }, delayMeanMs / 1000);
  eventLoopDelaySeconds.set({ quantile: "p95" }, delayP95Ms / 1000);
  eventLoopDelaySeconds.set({ quantile: "max" }, delayMaxMs / 1000);
  eventLoopUtilizationRatio.set(current.utilization);
  delayHistogram.reset();
  return lastSnapshot;
}

export function startEventLoopMetrics(): void {
  if (interval) return;
  delayHistogram.enable();
  interval = setInterval(sampleEventLoopMetrics, 5000);
  interval.unref();
}

export function stopEventLoopMetrics(): void {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }
  delayHistogram.disable();
}

export function readEventLoopSnapshot() {
  return sampleEventLoopMetrics();
}

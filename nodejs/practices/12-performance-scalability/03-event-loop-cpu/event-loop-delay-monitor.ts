
import { performance, monitorEventLoopDelay } from "node:perf_hooks";

const histogram = monitorEventLoopDelay({ resolution: 20 });
let previous = performance.eventLoopUtilization();

export function startEventLoopSample(): void {
  histogram.enable();
}

export function readEventLoopSample() {
  const utilization = performance.eventLoopUtilization(previous);
  previous = performance.eventLoopUtilization();

  return {
    meanMs: Number(histogram.mean) / 1_000_000,
    maxMs: Number(histogram.max) / 1_000_000,
    p95Ms: histogram.percentile(95) / 1_000_000,
    utilization: utilization.utilization
  };
}

export function resetEventLoopSample(): void {
  histogram.reset();
}

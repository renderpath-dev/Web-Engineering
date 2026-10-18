import { monitorEventLoopDelay } from "node:perf_hooks";
import { eventLoopDelaySeconds } from "./metrics.js";

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

function nanosecondsToSeconds(value: number): number {
  return value / 1_000_000_000;
}

export type EventLoopDelaySnapshot = {
  mean: number;
  max: number;
  p99: number;
};

export function collectEventLoopDelaySnapshot(): EventLoopDelaySnapshot {
  const snapshot = {
    mean: nanosecondsToSeconds(histogram.mean),
    max: nanosecondsToSeconds(histogram.max),
    p99: nanosecondsToSeconds(histogram.percentile(99))
  };
  eventLoopDelaySeconds.set({ statistic: "mean" }, Number.isFinite(snapshot.mean) ? snapshot.mean : 0);
  eventLoopDelaySeconds.set({ statistic: "max" }, snapshot.max);
  eventLoopDelaySeconds.set({ statistic: "p99" }, snapshot.p99);
  return snapshot;
}

export function blockEventLoop(milliseconds: number): void {
  const end = Date.now() + milliseconds;
  while (Date.now() < end) {
    Math.sqrt(Date.now());
  }
}

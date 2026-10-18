import { monitorEventLoopDelay } from "node:perf_hooks";
import { Gauge } from "prom-client";
import { metricsRegistry } from "./metrics.js";

const eventLoopDelay = monitorEventLoopDelay({ resolution: 20 });
let enabled = false;

export function startEventLoopMetrics(): void {
  if (enabled) return;
  eventLoopDelay.enable();
  enabled = true;
}

export function stopEventLoopMetrics(): void {
  if (!enabled) return;
  eventLoopDelay.disable();
  enabled = false;
}

export const eventLoopDelaySeconds = new Gauge({
  name: "nodejs_event_loop_delay_seconds",
  help: "Mean event loop delay in seconds since the previous scrape.",
  collect() {
    this.set(Number.isFinite(eventLoopDelay.mean) ? eventLoopDelay.mean / 1_000_000_000 : 0);
    eventLoopDelay.reset();
  },
  registers: [metricsRegistry]
});

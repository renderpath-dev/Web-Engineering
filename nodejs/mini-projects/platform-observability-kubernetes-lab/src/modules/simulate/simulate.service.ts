import { collectEventLoopDelaySnapshot, blockEventLoop } from "../../observability/event-loop-delay.js";
import { simulationSignalsTotal } from "../../observability/metrics.js";
import { runManualTraceWork } from "../../observability/tracing.js";
import { PublicProblem } from "../../shared/problem.js";
import type { createSloStore } from "../../slo/slo.service.js";
import type { TraceWorkInput } from "./simulate.schema.js";

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function createSimulationService(sloStore: ReturnType<typeof createSloStore>) {
  return {
    ok() {
      simulationSignalsTotal.inc({ signal_kind: "ok" });
      sloStore.record({ ok: true, durationMs: 20 });
      return { signal: "ok" };
    },
    error(): never {
      simulationSignalsTotal.inc({ signal_kind: "error" });
      sloStore.record({ ok: false, durationMs: 30 });
      throw new PublicProblem(503, "simulated_error", "Simulated dependency error");
    },
    async slow() {
      const start = Date.now();
      await wait(250);
      const durationMs = Date.now() - start;
      simulationSignalsTotal.inc({ signal_kind: "slow" });
      sloStore.record({ ok: true, durationMs });
      return { signal: "slow", durationMs };
    },
    eventLoopDelay() {
      blockEventLoop(60);
      simulationSignalsTotal.inc({ signal_kind: "event_loop_delay" });
      return { signal: "event_loop_delay", eventLoopDelay: collectEventLoopDelaySnapshot() };
    },
    traceWork(input: TraceWorkInput) {
      const result = runManualTraceWork(input);
      simulationSignalsTotal.inc({ signal_kind: "trace" });
      sloStore.record({ ok: true, durationMs: 35 });
      return result;
    }
  };
}

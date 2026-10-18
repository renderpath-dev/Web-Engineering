import test from "node:test";
import assert from "node:assert/strict";
import { isTraceContextShape, runManualTraceWork, startTelemetrySdk } from "../src/observability/tracing.js";

test("validates traceparent shape", () => {
  assert.equal(isTraceContextShape("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"), true);
  assert.equal(isTraceContextShape("00-00000000000000000000000000000000-00f067aa0ba902b7-01"), false);
});

test("creates manual trace work result", () => {
  startTelemetrySdk({ SERVICE_NAME: "platform-observability-kubernetes-lab-test" });
  const result = runManualTraceWork({ operationName: "unit-trace-work", steps: 2 });
  assert.match(result.traceId, /^[0-9a-f]{32}$/);
  assert.match(result.spanId, /^[0-9a-f]{16}$/);
  assert.equal(isTraceContextShape(result.traceparent), true);
});

import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeMetricLabels, registry } from "../src/observability/metrics.js";

test("accepts low-cardinality metric labels", () => {
  assert.doesNotThrow(() => assertSafeMetricLabels({
    method: "GET",
    route: "/v1/health/ready",
    status_class: "2xx"
  }));
});

test("rejects high-cardinality metric labels", () => {
  assert.throws(() => assertSafeMetricLabels({ trace_id: "abc" }));
  assert.throws(() => assertSafeMetricLabels({ request_id: "abc" }));
});

test("exports Prometheus text", async () => {
  const text = await registry.metrics();
  assert.match(text, /http_requests_total/);
});

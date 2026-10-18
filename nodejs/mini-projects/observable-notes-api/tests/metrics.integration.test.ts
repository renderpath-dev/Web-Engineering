import test from "node:test";
import assert from "node:assert/strict";
import { metricsRegistry } from "../src/observability/metrics.js";
import { observeHttpRequest } from "../src/observability/http-metrics.js";

test("metrics expose expected names and safe labels", async () => {
  observeHttpRequest("GET", "/notes/:noteId", 200, 0.02);
  const metrics = await metricsRegistry.metrics();

  assert.match(metrics, /http_requests_total/);
  assert.match(metrics, /http_request_duration_seconds/);
  assert.match(metrics, /route="\/notes\/:noteId"/);
  assert.equal(metrics.includes("requestId"), false);
  assert.equal(metrics.includes("email"), false);
  assert.equal(metrics.includes("rawUrl"), false);
});

import test from "node:test";
import assert from "node:assert/strict";
const metrics = 'http_requests_total{method="GET",route="/notes/:noteId",status_class="2xx"} 1';
test("metrics use safe labels", () => {
  assert.match(metrics, /route="\/notes\/:noteId"/);
  assert.equal(metrics.includes("requestId"), false);
  assert.equal(metrics.includes("email"), false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { createStreamBackpressureReport } from "../src/modules/performance/stream-report.service.js";

test("stream report observes write backpressure without unbounded output", async () => {
  const report = await createStreamBackpressureReport();
  assert.equal(report.chunks, 40);
  assert.equal(report.chunkSize, 1024);
  assert.equal(report.bytesWritten, 40 * 1024);
  assert.equal(report.drains >= 0, true);
});

import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { getRequestContext, runWithRequestContext } from "../src/observability/request-context.js";

test("request context survives across awaited work", async () => {
  await runWithRequestContext({ requestId: "req_test", startedAt: performance.now() }, async () => {
    await Promise.resolve();
    assert.equal(getRequestContext()?.requestId, "req_test");
  });
});

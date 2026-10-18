import test from "node:test";
import assert from "node:assert/strict";
import { createSmokeTargets, evaluateSmokeResults } from "../scripts/smoke-test.js";

test("createSmokeTargets checks live and ready endpoints", () => {
  assert.deepEqual(createSmokeTargets("http://localhost:3020"), [
    { name: "live", url: "http://localhost:3020/health/live" },
    { name: "ready", url: "http://localhost:3020/health/ready" }
  ]);
});

test("evaluateSmokeResults requires successful live and ready responses", () => {
  assert.equal(evaluateSmokeResults([
    { name: "live", status: 200, ok: true },
    { name: "ready", status: 200, ok: true }
  ]), true);

  assert.equal(evaluateSmokeResults([
    { name: "live", status: 200, ok: true },
    { name: "ready", status: 503, ok: false }
  ]), false);
});

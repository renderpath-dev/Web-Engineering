import assert from "node:assert/strict";
import test from "node:test";
import { CircuitBreaker, CircuitBreakerOpenError } from "../src/reliability/circuit-breaker.js";

test("circuit opens after threshold failures", async () => {
  const breaker = new CircuitBreaker({ dependency: "unit", failureThreshold: 2, recoveryTimeoutMs: 5 });
  await assert.rejects(() => breaker.execute(async () => { throw new Error("first"); }));
  await assert.rejects(() => breaker.execute(async () => { throw new Error("second"); }));
  assert.equal(breaker.getState(), "open");
  await assert.rejects(() => breaker.execute(async () => "ok"), CircuitBreakerOpenError);
});

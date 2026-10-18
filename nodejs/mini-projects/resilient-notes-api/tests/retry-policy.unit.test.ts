import assert from "node:assert/strict";
import test from "node:test";
import { calculateBackoffDelay, createRetryBudget, consumeRetryBudget, isRetrySafeMethod } from "../src/reliability/retry-policy.js";
import { executeWithRetry } from "../src/reliability/retry-executor.js";
import { TimeoutError } from "../src/reliability/timeout.js";

test("retry policy uses a bounded budget", () => {
  const budget = createRetryBudget(1);
  assert.equal(consumeRetryBudget(budget), true);
  assert.equal(consumeRetryBudget(budget), false);
});

test("unsafe post requires idempotency key before retry", () => {
  assert.equal(isRetrySafeMethod("POST", false), false);
  assert.equal(isRetrySafeMethod("POST", true), true);
});

test("retry executor stops after success", async () => {
  let attempts = 0;
  const result = await executeWithRetry(async () => {
    attempts += 1;
    if (attempts < 2) throw new TimeoutError("temporary");
    return "ok";
  }, { operation: "unit", maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 1, retryBudget: 2 });
  assert.equal(result, "ok");
  assert.equal(attempts, 2);
  assert.ok(calculateBackoffDelay(1, 1, 5) >= 1);
});

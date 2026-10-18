import test from "node:test";
import assert from "node:assert/strict";
import { runContractReleaseGate } from "../src/contracts/contract-release-gate.js";

test("contract release gate has no local drift", async () => {
  const result = await runContractReleaseGate();
  assert.equal(result.passed, true);
  assert.deepEqual(result.failures, []);
});

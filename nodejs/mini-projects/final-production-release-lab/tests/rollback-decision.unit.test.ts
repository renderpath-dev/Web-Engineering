import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultSignals } from "../src/release/gate-model.js";
import { decideRollback } from "../src/release/rollback-decision.js";

test("post-release smoke failure triggers rollback decision", () => {
  const signals = createDefaultSignals("PASS");
  const smoke = signals.find((signal) => signal.name === "smoke");
  assert.ok(smoke);
  smoke.status = "FAIL";
  const result = decideRollback({ phase: "post-release", signals });
  assert.equal(result.decision, "rollback");
});

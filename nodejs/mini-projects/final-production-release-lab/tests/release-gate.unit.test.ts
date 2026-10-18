import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultSignals, evaluateReleaseGate } from "../src/release/gate-model.js";

test("release gate promotes only when required evidence passes", () => {
  const result = evaluateReleaseGate({ phase: "pre-release", signals: createDefaultSignals("PASS") });
  assert.equal(result.decision, "promote");
});

test("release gate holds when required evidence is unknown", () => {
  const result = evaluateReleaseGate({ phase: "pre-release", signals: createDefaultSignals("UNKNOWN") });
  assert.equal(result.decision, "hold");
});

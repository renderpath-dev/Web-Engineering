import test from "node:test";
import assert from "node:assert/strict";
import { calculateSloReport } from "../src/slo/slo.service.js";
import { defaultSloPolicy } from "../src/slo/slo-policy.js";

test("calculates error budget decision", () => {
  const report = calculateSloReport([
    { ok: true, durationMs: 20, observedAt: new Date(0).toISOString() },
    { ok: true, durationMs: 30, observedAt: new Date(1).toISOString() },
    { ok: false, durationMs: 40, observedAt: new Date(2).toISOString() }
  ], defaultSloPolicy);
  assert.equal(report.sampleCount, 3);
  assert.equal(report.releaseDecision, "investigate");
  assert.ok(report.errorBudgetRemainingRatio >= 0);
});

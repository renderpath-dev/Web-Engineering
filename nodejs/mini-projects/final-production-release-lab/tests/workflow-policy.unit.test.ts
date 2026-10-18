import assert from "node:assert/strict";
import test from "node:test";
import { evaluateWorkflowPolicy } from "../src/security/workflow-policy.js";

test("workflow policy validates least privilege and pinned actions", () => {
  const result = evaluateWorkflowPolicy();
  assert.equal(result.status, "PASS", result.issues.join("\n"));
});

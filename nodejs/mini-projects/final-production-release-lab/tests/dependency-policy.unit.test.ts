import assert from "node:assert/strict";
import test from "node:test";
import { evaluateDependencyPolicy } from "../src/security/dependency-policy.js";

test("dependency policy accepts locked non-latest dependencies", () => {
  const result = evaluateDependencyPolicy();
  assert.equal(result.status, "PASS");
  assert.equal(result.auditCommand, "npm audit --audit-level=high");
});

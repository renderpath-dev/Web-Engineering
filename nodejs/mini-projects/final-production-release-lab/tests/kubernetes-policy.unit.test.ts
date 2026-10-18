import assert from "node:assert/strict";
import test from "node:test";
import { evaluateKubernetesPolicy } from "../src/security/kubernetes-policy.js";

test("kubernetes policy validates securityContext controls", () => {
  const result = evaluateKubernetesPolicy();
  assert.equal(result.status, "PASS", result.issues.join("\n"));
});

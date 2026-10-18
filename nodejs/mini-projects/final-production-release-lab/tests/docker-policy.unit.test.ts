import assert from "node:assert/strict";
import test from "node:test";
import { evaluateDockerPolicy } from "../src/security/docker-policy.js";

test("docker policy validates runtime hardening", () => {
  const result = evaluateDockerPolicy();
  assert.equal(result.status, "PASS", result.issues.join("\n"));
});

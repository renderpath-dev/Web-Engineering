import test from "node:test";
import assert from "node:assert/strict";
import { redactLogFields } from "../src/observability/logger.js";

test("redacts sensitive structured log fields", () => {
  const output = redactLogFields({
    requestId: "req-1",
    authorization: "Bearer token",
    password: "secret",
    email: "person@example.test"
  });
  assert.equal(output.requestId, "req-1");
  assert.equal(output.authorization, "[Redacted]");
  assert.equal(output.password, "[Redacted]");
  assert.equal(output.email, "[Redacted]");
});

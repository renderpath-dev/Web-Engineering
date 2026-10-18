import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeLogField } from "../src/observability/log-sanitization.js";
import { redactSensitiveData } from "../src/observability/log-redaction.js";

test("log fields are sanitized before output", () => {
  assert.equal(sanitizeLogField("first\nsecond|third"), "first second third");
});

test("server log payloads can be redacted", () => {
  const payload = JSON.stringify(redactSensitiveData({ authorization: "Bearer token", message: "failed" }));
  assert.equal(payload.includes("Bearer token"), false);
  assert.match(payload, /failed/);
});

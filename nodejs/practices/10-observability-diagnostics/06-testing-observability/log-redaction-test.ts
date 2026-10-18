import test from "node:test";
import assert from "node:assert/strict";
function redact(value: string): string { return value.replace(/secret-password|sid=123|Bearer token/g, "[REDACTED]"); }
test("redaction removes sensitive strings", () => {
  const output = redact("secret-password sid=123 Bearer token");
  assert.equal(output.includes("secret-password"), false);
  assert.equal(output.includes("sid=123"), false);
  assert.equal(output.includes("Bearer token"), false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { redactSensitiveData } from "../src/observability/log-redaction.js";

test("redactSensitiveData removes sensitive values", () => {
  const redacted = JSON.stringify(redactSensitiveData({
    password: "secret-password",
    headers: {
      cookie: "sid=123",
      authorization: "Bearer token"
    },
    csrfToken: "csrf-value",
    sessionToken: "session-value",
    databaseUrl: "postgresql://user:pass@localhost:5432/app",
    redisUrl: "redis://:pass@localhost:6379"
  }));

  assert.equal(redacted.includes("secret-password"), false);
  assert.equal(redacted.includes("sid=123"), false);
  assert.equal(redacted.includes("Bearer token"), false);
  assert.equal(redacted.includes("csrf-value"), false);
  assert.equal(redacted.includes("session-value"), false);
  assert.equal(redacted.includes("user:pass"), false);
});

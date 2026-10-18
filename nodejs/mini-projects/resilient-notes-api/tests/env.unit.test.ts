import assert from "node:assert/strict";
import test from "node:test";
import { envSchema } from "../src/config/env.js";

test("env schema provides local reliability defaults", () => {
  const parsed = envSchema.parse({});
  assert.equal(parsed.PORT, 3020);
  assert.equal(parsed.HTTP_REQUEST_TIMEOUT_MS, 30_000);
  assert.equal(parsed.FAULT_INJECTION_ENABLED, false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { envSchema } from "../src/config/env.js";

test("env schema supplies runtime defaults", () => {
  const parsed = envSchema.parse({});
  assert.equal(parsed.PORT, 3020);
  assert.equal(parsed.ALLOWED_ORIGINS.includes("localhost:8080"), true);
});

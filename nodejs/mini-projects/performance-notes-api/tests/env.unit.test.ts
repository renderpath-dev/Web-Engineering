import test from "node:test";
import assert from "node:assert/strict";
import { loadEnv } from "../src/config/env.js";

test("loadEnv parses boolean and numeric deployment configuration", () => {
  const config = loadEnv({
    NODE_ENV: "test",
    PORT: "4999",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/performance_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "test-session-secret-with-32-characters",
    ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000",
    TRUST_PROXY: "true",
    COOKIE_SECURE: "false"
  });

  assert.equal(config.PORT, 4999);
  assert.equal(config.TRUST_PROXY, true);
  assert.equal(config.COOKIE_SECURE, false);
  assert.deepEqual(config.ALLOWED_ORIGINS, ["http://localhost:3000", "http://127.0.0.1:3000"]);
});

test("loadEnv rejects the development secret in production", () => {
  assert.throws(() => loadEnv({
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/performance_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "development-session-secret-change-me-32"
  }), /SESSION_SECRET/);
});

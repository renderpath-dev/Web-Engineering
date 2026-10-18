import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";

test("createApp applies trust proxy from runtime configuration", () => {
  const app = createApp(loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/deployable_notes_api",
    REDIS_URL: "redis://localhost:6379",
    SESSION_SECRET: "test-session-secret-with-32-characters",
    TRUST_PROXY: "true"
  }));

  assert.equal(app.get("trust proxy"), true);
});

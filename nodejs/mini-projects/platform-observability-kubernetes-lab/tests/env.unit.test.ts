import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config/env.js";

test("loads default platform config", () => {
  const config = loadConfig({});
  assert.equal(config.PORT, 3040);
  assert.equal(config.CORS_ORIGIN, "http://localhost:8080");
  assert.equal(config.SKIP_DEPENDENCY_CHECKS, false);
});

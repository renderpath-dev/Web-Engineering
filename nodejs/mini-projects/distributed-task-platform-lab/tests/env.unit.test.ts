import test from "node:test";
import assert from "node:assert/strict";
import { config, parseAllowedOrigins } from "../src/config/env.js";

test("config has a safe default public base URL for checks", () => {
  assert.equal(config.SMOKE_BASE_URL, process.env.SMOKE_BASE_URL ?? "http://localhost:8080");
  assert.deepEqual(parseAllowedOrigins("http://localhost:8080,http://127.0.0.1:8080"), ["http://localhost:8080", "http://127.0.0.1:8080"]);
});

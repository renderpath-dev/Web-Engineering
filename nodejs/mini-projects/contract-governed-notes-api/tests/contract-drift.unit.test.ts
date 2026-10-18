import test from "node:test";
import assert from "node:assert/strict";
import { findContractDrift } from "../src/contracts/contract-drift.js";
import { loadOpenApiDocument } from "../src/contracts/openapi-loader.js";

test("route inventory matches openapi operations", async () => {
  const drift = findContractDrift(await loadOpenApiDocument());
  assert.deepEqual(drift, []);
});

import test from "node:test";
import assert from "node:assert/strict";
import { buildImportJobId } from "../src/queue/job-contract.js";

test("same idempotency key maps to same public job identity", () => {
  const first = buildImportJobId("same-key");
  const second = buildImportJobId("same-key");
  assert.equal(first, second);
});

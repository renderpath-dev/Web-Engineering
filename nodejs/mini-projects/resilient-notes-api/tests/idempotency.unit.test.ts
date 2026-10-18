import assert from "node:assert/strict";
import test from "node:test";
import { buildRequestFingerprint, validateIdempotencyKey } from "../src/reliability/idempotency-key.js";

test("fingerprint is stable for object key order", () => {
  const left = buildRequestFingerprint("POST", "/resource", { b: 2, a: 1 });
  const right = buildRequestFingerprint("POST", "/resource", { a: 1, b: 2 });
  assert.equal(left, right);
});

test("short idempotency key is rejected", () => {
  assert.throws(() => validateIdempotencyKey("short"));
});

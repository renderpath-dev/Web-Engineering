import test from "node:test";
import assert from "node:assert/strict";
import { deprecatedDemoPolicy } from "../src/contracts/deprecation-policy.js";

test("deprecated operation has deprecation and sunset evidence", () => {
  assert.equal(deprecatedDemoPolicy.operationId, "getDeprecatedDemo");
  assert.equal(deprecatedDemoPolicy.deprecation, "true");
  assert.match(deprecatedDemoPolicy.sunset, /GMT$/);
});

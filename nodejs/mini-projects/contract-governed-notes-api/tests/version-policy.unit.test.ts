import test from "node:test";
import assert from "node:assert/strict";
import { extractVersionFamily, isSupportedApiVersion } from "../src/contracts/version-policy.js";

test("path version is extracted and checked", () => {
  assert.equal(extractVersionFamily("/v1/notebooks"), "v1");
  assert.equal(isSupportedApiVersion("v1"), true);
  assert.equal(isSupportedApiVersion("v2"), false);
});

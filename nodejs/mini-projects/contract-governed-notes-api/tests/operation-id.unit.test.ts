import test from "node:test";
import assert from "node:assert/strict";
import { assertUniqueOperationIds, isOperationId, operationIds } from "../src/contracts/operation-id.js";

test("operation ids are unique and typed", () => {
  assert.doesNotThrow(() => assertUniqueOperationIds(operationIds));
  assert.equal(isOperationId("getVersion"), true);
  assert.equal(isOperationId("unknownOperation"), false);
});

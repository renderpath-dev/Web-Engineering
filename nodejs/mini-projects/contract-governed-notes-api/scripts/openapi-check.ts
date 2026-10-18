import assert from "node:assert/strict";
import { loadOpenApiDocument } from "../src/contracts/openapi-loader.js";
import { buildOpenApiInventory } from "../src/contracts/openapi-inventory.js";

const document = await loadOpenApiDocument();
assert.equal(document.openapi, "3.1.1");
assert.ok(document.info?.title);
assert.ok(document.components?.schemas?.ProblemDetails);
assert.ok(document.components?.responses?.ProblemResponse);

const inventory = buildOpenApiInventory(document);
assert.ok(inventory.length >= 23);
for (const operation of inventory) {
  assert.ok(operation.operationId, `${operation.method} ${operation.path} is missing operationId`);
}

console.log(`openapi check passed with ${inventory.length} operations`);

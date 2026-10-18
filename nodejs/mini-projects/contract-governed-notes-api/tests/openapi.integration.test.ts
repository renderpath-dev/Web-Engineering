import test from "node:test";
import assert from "node:assert/strict";
import { buildOpenApiInventory } from "../src/contracts/openapi-inventory.js";
import { loadOpenApiDocument } from "../src/contracts/openapi-loader.js";

test("openapi file exposes required governance objects", async () => {
  const document = await loadOpenApiDocument();
  const inventory = buildOpenApiInventory(document);
  assert.equal(document.openapi, "3.1.1");
  assert.ok(document.components?.schemas?.ProblemDetails);
  assert.ok(inventory.some((operation) => operation.operationId === "getDeprecatedDemo" && operation.deprecated));
});

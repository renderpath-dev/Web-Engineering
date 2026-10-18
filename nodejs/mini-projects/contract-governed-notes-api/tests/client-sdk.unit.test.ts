import test from "node:test";
import assert from "node:assert/strict";
import { ContractNotesClient } from "../src/client/api-client.js";

test("typed client parses success result", async () => {
  const client = new ContractNotesClient({
    baseUrl: "http://localhost:8080",
    fetch: async () => new Response(JSON.stringify({ apiVersion: "v1", openapi: "3.1.1", deprecatedOperations: [] }), { status: 200 })
  });

  const result = await client.getVersion();
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.apiVersion, "v1");
});

import assert from "node:assert/strict";
import { ContractNotesClient } from "../src/client/api-client.js";

const client = new ContractNotesClient({
  baseUrl: "http://localhost:8080",
  fetch: async () =>
    new Response(JSON.stringify({ apiVersion: "v1", openapi: "3.1.1", deprecatedOperations: ["getDeprecatedDemo"] }), {
      status: 200,
      headers: { "content-type": "application/json" }
    })
});

const result = await client.getVersion();
assert.equal(result.ok, true);
if (result.ok) assert.equal(result.data.openapi, "3.1.1");
console.log("sdk check passed");

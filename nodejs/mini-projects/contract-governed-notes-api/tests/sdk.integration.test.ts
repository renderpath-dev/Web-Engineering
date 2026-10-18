import test from "node:test";
import assert from "node:assert/strict";
import { ContractNotesClient } from "../src/client/api-client.js";

test("typed client parses problem result without throwing", async () => {
  const client = new ContractNotesClient({
    baseUrl: "http://localhost:8080",
    fetch: async () =>
      new Response(JSON.stringify({
        type: "https://api.example.test/problems/not_found",
        title: "Not Found",
        status: 404,
        detail: "Missing resource",
        code: "not_found"
      }), { status: 404, headers: { "content-type": "application/problem+json" } })
  });

  const result = await client.getVersion();
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.problem.code, "not_found");
});

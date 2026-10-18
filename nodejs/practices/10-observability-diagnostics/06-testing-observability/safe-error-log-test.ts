import test from "node:test";
import assert from "node:assert/strict";
function clientErrorResponse() { return { ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error.", details: [] } }; }
test("client error response does not expose stack", () => {
  const response = JSON.stringify(clientErrorResponse());
  assert.equal(response.includes("stack"), false);
  assert.equal(response.includes("DATABASE_URL"), false);
});

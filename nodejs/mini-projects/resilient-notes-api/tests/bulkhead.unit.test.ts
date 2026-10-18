import assert from "node:assert/strict";
import test from "node:test";
import { Bulkhead, BulkheadRejectedError } from "../src/reliability/bulkhead.js";

test("bulkhead rejects after active and queued slots are full", async () => {
  const bulkhead = new Bulkhead("unit", 1, 0);
  const blocker = bulkhead.execute(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
    return "done";
  });
  await assert.rejects(() => bulkhead.execute(async () => "rejected"), BulkheadRejectedError);
  assert.equal(await blocker, "done");
});

import { AsyncLocalStorage } from "node:async_hooks";
import test from "node:test";
import assert from "node:assert/strict";
const storage = new AsyncLocalStorage<{ requestId: string }>();
test("request id survives across await", async () => {
  await storage.run({ requestId: "req_test" }, async () => { await Promise.resolve(); assert.equal(storage.getStore()?.requestId, "req_test"); });
});

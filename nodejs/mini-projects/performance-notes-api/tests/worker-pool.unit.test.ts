import test from "node:test";
import assert from "node:assert/strict";
import { WorkerPool } from "../src/modules/performance/worker-pool.js";

test("WorkerPool exposes bounded size and pending count", async () => {
  const pool = new WorkerPool(1);
  try {
    assert.equal(pool.size, 1);
    const result = await pool.run({ iterations: 1000 });
    assert.equal(typeof result, "number");
    assert.equal(pool.pendingCount, 0);
  } finally {
    await pool.close();
  }
});

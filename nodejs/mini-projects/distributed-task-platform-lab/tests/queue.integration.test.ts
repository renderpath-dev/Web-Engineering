import test from "node:test";
import assert from "node:assert/strict";
import { taskQueue, closeTaskQueue } from "../src/queue/task-queue.js";

test("queue integration can read BullMQ queue counts", async (t) => {
  t.after(async () => {
    await closeTaskQueue();
  });

  const counts = await taskQueue.getJobCounts("waiting", "active", "completed", "failed");
  assert.ok(Object.prototype.hasOwnProperty.call(counts, "waiting"));
});

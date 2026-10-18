import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";
import { taskQueue } from "../queue/task-queue.js";
import { queueDepthGauge } from "../observability/metrics.js";
import { TASK_IMPORT_QUEUE_NAME } from "../queue/queue-names.js";

export async function liveStatus(): Promise<{ status: "live" }> {
  return { status: "live" };
}

export async function readyStatus(): Promise<{ status: "ready" | "not_ready"; dependencies: Record<string, boolean> }> {
  const [database, redis] = await Promise.all([checkDatabaseHealth(), checkRedisHealth()]);
  let queue = false;
  try {
    const counts = await taskQueue.getJobCounts("waiting", "active", "delayed", "failed");
    const depth = counts.waiting + counts.active + counts.delayed;
    queueDepthGauge.set({ queue_name: TASK_IMPORT_QUEUE_NAME }, depth);
    queue = true;
  } catch {
    queue = false;
  }

  const dependencies = { database, redis, queue };
  return {
    status: Object.values(dependencies).every(Boolean) ? "ready" : "not_ready",
    dependencies
  };
}

import { Worker } from "bullmq";
import { config } from "../config/env.js";
import { createRuntimePolicy } from "../config/runtime-policy.js";
import { logger } from "../observability/logger.js";
import { workerReadinessGauge } from "../observability/metrics.js";
import { createTaskQueueEvents } from "../queue/queue-events.js";
import { TASK_IMPORT_QUEUE_NAME } from "../queue/queue-names.js";
import { redisConnection, taskQueue } from "../queue/task-queue.js";
import { processImportTasksJob } from "./processor.js";
import { markWorkerReady } from "./worker-health.js";
import { registerWorkerShutdown } from "./worker-shutdown.js";

const policy = createRuntimePolicy(config);
const queueEvents = createTaskQueueEvents();
const worker = new Worker(TASK_IMPORT_QUEUE_NAME, processImportTasksJob, {
  connection: redisConnection,
  concurrency: policy.workerConcurrency
});

worker.on("completed", (job) => {
  logger.info({ jobName: job.name }, "job completed");
});

worker.on("failed", (job, error) => {
  logger.warn({ jobName: job?.name, error }, "job failed");
});

await Promise.all([queueEvents.waitUntilReady(), worker.waitUntilReady()]);
await markWorkerReady();
workerReadinessGauge.set({ worker_name: "task-import-worker" }, 1);
logger.info({ queue: TASK_IMPORT_QUEUE_NAME, concurrency: policy.workerConcurrency }, "worker ready");

registerWorkerShutdown({
  worker,
  queue: taskQueue,
  queueEvents,
  shutdownTimeoutMs: policy.shutdownTimeoutMs
});

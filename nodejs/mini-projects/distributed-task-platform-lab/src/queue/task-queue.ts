import { Queue } from "bullmq";
import { config } from "../config/env.js";
import { parseRedisUrl } from "../redis/redis-client.js";
import type { ImportTasksJobPayload, ImportTasksJobResult } from "./job-schemas.js";
import { TASK_IMPORT_QUEUE_NAME } from "./queue-names.js";

const redisConnection = {
  ...parseRedisUrl(config.REDIS_URL),
  maxRetriesPerRequest: null
};

export function createTaskQueue(): Queue<ImportTasksJobPayload, ImportTasksJobResult, string> {
  return new Queue<ImportTasksJobPayload, ImportTasksJobResult, string>(TASK_IMPORT_QUEUE_NAME, {
    connection: redisConnection
  });
}

export const taskQueue = createTaskQueue();
taskQueue.on("error", () => undefined);

export async function closeTaskQueue(): Promise<void> {
  await taskQueue.close();
}

export { redisConnection };

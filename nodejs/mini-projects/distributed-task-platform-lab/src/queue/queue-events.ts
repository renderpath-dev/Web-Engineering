import { QueueEvents } from "bullmq";
import { redisConnection } from "./task-queue.js";
import { TASK_IMPORT_QUEUE_NAME } from "./queue-names.js";

export function createTaskQueueEvents(): QueueEvents {
  return new QueueEvents(TASK_IMPORT_QUEUE_NAME, {
    connection: redisConnection
  });
}

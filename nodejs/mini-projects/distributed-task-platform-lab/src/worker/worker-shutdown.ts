import type { Queue, QueueEvents, Worker } from "bullmq";
import { disconnectPrisma } from "../db/prisma.js";
import { closeRedis } from "../redis/redis-client.js";
import { logger } from "../observability/logger.js";
import { clearWorkerReady } from "./worker-health.js";

export function registerWorkerShutdown(resources: {
  worker: Worker;
  queue: Queue;
  queueEvents: QueueEvents;
  shutdownTimeoutMs: number;
}): void {
  async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, "worker shutdown started");
    await clearWorkerReady();
    const forceTimer = setTimeout(() => {
      logger.error("worker shutdown timeout exceeded");
      process.exit(1);
    }, resources.shutdownTimeoutMs);
    forceTimer.unref();

    await resources.worker.close();
    await resources.queue.close();
    await resources.queueEvents.close();
    await Promise.allSettled([closeRedis(), disconnectPrisma()]);
    clearTimeout(forceTimer);
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      shutdown(signal).catch((error: unknown) => {
        logger.error({ error }, "worker shutdown failed");
        process.exitCode = 1;
      });
    });
  }
}

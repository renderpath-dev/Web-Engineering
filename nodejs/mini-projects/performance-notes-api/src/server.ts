import { createServer, type Server } from "node:http";
import { config } from "./config/env.js";
import { createApp } from "./app.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeCpuWorkerPool } from "./modules/performance/cpu-task.service.js";
import { logger } from "./observability/logger.js";
import { startEventLoopMetrics, stopEventLoopMetrics } from "./observability/event-loop-metrics.js";
import { closeRedisClient } from "./redis/redis-client.js";

export interface ShutdownResource {
  name: string;
  close: () => Promise<void> | void;
}

export interface GracefulShutdownOptions {
  server: Server;
  timeoutMs: number;
  resources: ShutdownResource[];
}

async function closeHttpServer(server: Server, timeoutMs: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.closeAllConnections();
      reject(new Error("HTTP server shutdown timed out."));
    }, timeoutMs);
    timeout.unref();

    server.close((error) => {
      clearTimeout(timeout);
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export function createGracefulShutdown(options: GracefulShutdownOptions) {
  let closing = false;

  return async (signal: NodeJS.Signals): Promise<void> => {
    if (closing) return;
    closing = true;
    logger.info({ signal }, "shutdown signal received");

    try {
      await closeHttpServer(options.server, options.timeoutMs);

      for (const resource of options.resources) {
        try {
          await resource.close();
          logger.info({ resource: resource.name }, "shutdown resource closed");
        } catch (error) {
          logger.error({ resource: resource.name, error }, "shutdown resource close failed");
        }
      }
    } finally {
      process.exitCode = 0;
    }
  };
}

export function startServer(): Server {
  startEventLoopMetrics();
  const server = createServer(createApp(config));
  const shutdown = createGracefulShutdown({
    server,
    timeoutMs: config.SHUTDOWN_TIMEOUT_MS,
    resources: [
      { name: "worker-pool", close: closeCpuWorkerPool },
      { name: "event-loop-metrics", close: stopEventLoopMetrics },
      { name: "redis", close: closeRedisClient },
      { name: "prisma", close: disconnectPrisma }
    ]
  });

  server.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, "HTTP server started");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  return server;
}

if (process.env.NODE_ENV !== "test") {
  try {
    startServer();
  } catch (error) {
    logger.error({ error }, "server startup failed");
    process.exitCode = 1;
  }
}

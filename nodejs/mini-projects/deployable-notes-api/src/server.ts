import { createServer, type Server } from "node:http";
import { pathToFileURL } from "node:url";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedisClient } from "./redis/redis-client.js";
import { createApp } from "./app.js";
import { logger } from "./observability/logger.js";

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
      resolve();
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

export function createGracefulShutdown(options: GracefulShutdownOptions): (signal: NodeJS.Signals) => Promise<void> {
  let shuttingDown = false;

  return async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "shutdown signal received");
    await closeHttpServer(options.server, options.timeoutMs);

    for (const resource of options.resources) {
      try {
        await resource.close();
        logger.info({ resource: resource.name }, "shutdown resource closed");
      } catch (error) {
        logger.error({ resource: resource.name, error }, "shutdown resource close failed");
      }
    }
  };
}

export async function startServer(): Promise<Server> {
  const server = createServer(createApp(config));
  const shutdown = createGracefulShutdown({
    server,
    timeoutMs: config.SHUTDOWN_TIMEOUT_MS,
    resources: [
      { name: "redis", close: closeRedisClient },
      { name: "prisma", close: disconnectPrisma }
    ]
  });

  server.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, "HTTP server started");
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void shutdown(signal).then(() => {
        process.exitCode = 0;
      });
    });
  }

  return server;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  void startServer().catch((error) => {
    logger.error({ error }, "server startup failed");
    process.exitCode = 1;
  });
}

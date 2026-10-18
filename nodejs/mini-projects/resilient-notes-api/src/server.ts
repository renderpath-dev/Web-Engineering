import http from "node:http";
import { app } from "./app.js";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { disconnectRedis } from "./redis/redis-client.js";
import { logger } from "./observability/logger.js";

const server = http.createServer(app);

server.requestTimeout = config.HTTP_REQUEST_TIMEOUT_MS;
server.headersTimeout = config.HTTP_HEADERS_TIMEOUT_MS;
server.keepAliveTimeout = config.HTTP_KEEP_ALIVE_TIMEOUT_MS;

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "Resilient Notes API is listening");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "Shutdown signal received");
  server.close(async () => {
    await disconnectRedis();
    await disconnectPrisma();
    process.exit(0);
  });

  setTimeout(() => {
    server.closeAllConnections();
    process.exit(1);
  }, config.SHUTDOWN_TIMEOUT_MS).unref();
}

process.once("SIGTERM", (signal) => void shutdown(signal));
process.once("SIGINT", (signal) => void shutdown(signal));

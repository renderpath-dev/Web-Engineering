import { createServer } from "node:http";
import { app } from "./app.js";
import { config } from "./config/env.js";
import { createProductionRuntimePolicy } from "./config/production.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedis } from "./redis/redis-client.js";
import { logger } from "./observability/logger.js";

const policy = createProductionRuntimePolicy(config);
const server = createServer(app);

server.requestTimeout = policy.requestTimeoutMs;
server.headersTimeout = policy.headersTimeoutMs;
server.keepAliveTimeout = policy.keepAliveTimeoutMs;

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "api listening");
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "shutdown started");
  const forceTimer = setTimeout(() => {
    logger.error("shutdown timeout exceeded");
    process.exit(1);
  }, policy.shutdownTimeoutMs);
  forceTimer.unref();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
  await Promise.allSettled([disconnectPrisma(), closeRedis()]);
  clearTimeout(forceTimer);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    shutdown(signal).catch((error: unknown) => {
      logger.error({ error }, "shutdown failed");
      process.exitCode = 1;
    });
  });
}

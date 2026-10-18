import "./instrumentation.js";
import { createServer } from "node:http";
import { config } from "./config/env.js";
import { disconnectPrisma } from "./db/prisma.js";
import { closeRedisClient } from "./redis/redis-client.js";
import { app } from "./app.js";
import { logger } from "./observability/logger.js";
import { registerProcessEventHandlers } from "./observability/process-events.js";
import { stopEventLoopMetrics } from "./observability/event-loop-metrics.js";
import { stopInstrumentation } from "./instrumentation.js";

registerProcessEventHandlers();

const server = createServer(app);
let shuttingDown = false;

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, "HTTP server started");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "shutdown signal received");

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  stopEventLoopMetrics();
  await closeRedisClient();
  await disconnectPrisma();
  await stopInstrumentation();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal).then(() => process.exit(0));
  });
}

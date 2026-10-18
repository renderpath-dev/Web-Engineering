import { createServer } from "node:http";
import { createApp } from "./app.js";
import { loadConfig } from "../config/env.js";
import { collectEventLoopDelaySnapshot } from "../observability/event-loop-delay.js";
import { logger } from "../observability/logger.js";
import { shutdownTelemetrySdk, startTelemetrySdk } from "../observability/tracing.js";

const config = loadConfig();
startTelemetrySdk(config);

const application = createApp({ config });
const server = createServer(application.app);
server.requestTimeout = 300_000;
server.headersTimeout = 65_000;

const eventLoopTimer = setInterval(() => {
  collectEventLoopDelaySnapshot();
}, 10_000);
eventLoopTimer.unref();

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT, serviceName: config.SERVICE_NAME }, "API server started");
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "Shutdown started");
  server.close(async () => {
    clearInterval(eventLoopTimer);
    await application.close();
    await shutdownTelemetrySdk();
    logger.info({ signal }, "Shutdown completed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error({ signal }, "Shutdown grace period exceeded");
    process.exit(1);
  }, config.SHUTDOWN_GRACE_MS).unref();
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

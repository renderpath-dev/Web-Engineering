import { logger } from "./logger.js";
import { redactSensitiveData } from "./log-redaction.js";

let registered = false;

export function registerProcessEventHandlers(options: { exitOnUncaughtException?: boolean } = {}): void {
  if (registered) return;
  registered = true;

  process.on("warning", (warning) => {
    logger.warn({
      warning: redactSensitiveData({
        name: warning.name,
        message: warning.message,
        stack: warning.stack
      })
    }, "process warning observed");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({
      reason: redactSensitiveData(reason)
    }, "unhandled rejection observed");
    process.exitCode = 1;
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({
      error: redactSensitiveData({
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }, "uncaught exception observed");

    if (options.exitOnUncaughtException !== false) {
      process.exit(1);
    }
  });
}

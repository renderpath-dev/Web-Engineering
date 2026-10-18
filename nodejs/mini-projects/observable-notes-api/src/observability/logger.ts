import pino from "pino";
import { config } from "../config/env.js";
import { pinoRedactionPaths } from "./log-redaction.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  base: {
    service: config.OTEL_SERVICE_NAME
  },
  messageKey: "message",
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: pinoRedactionPaths,
    censor: "[REDACTED]"
  }
});

import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "databaseUrl", "redisUrl"],
    remove: true
  }
});

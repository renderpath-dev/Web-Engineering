import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: ["req.headers.cookie", "req.headers.authorization", "password", "token", "session"]
});

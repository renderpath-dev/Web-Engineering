import pino from "pino";
import { config } from "../config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: [
      "password",
      "passwordHash",
      "sessionToken",
      "csrfToken",
      "req.headers.authorization",
      "req.headers.cookie",
      "request.headers.authorization",
      "request.headers.cookie"
    ],
    censor: "[Redacted]"
  }
});

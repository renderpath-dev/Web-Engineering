import pino from "pino";

const sensitiveFieldPattern = /(authorization|cookie|token|secret|password|database_url|redis_url|email|request_body)/i;

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "authorization",
      "cookie",
      "token",
      "secret",
      "password",
      "databaseUrl",
      "redisUrl",
      "email",
      "requestBody"
    ],
    censor: "[Redacted]"
  }
});

export function redactLogFields(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (sensitiveFieldPattern.test(key)) {
      output[key] = "[Redacted]";
      continue;
    }
    output[key] = value;
  }
  return output;
}

const sensitiveKeyPattern = /password|cookie|authorization|csrf|session|token|database_url|redis_url|databaseUrl|redisUrl|secret/i;
const sensitiveValuePattern = /(postgresql|postgres|redis):\/\/[^\s]+|Bearer\s+[^\s]+|sid=[^\s;]+/gi;

export const pinoRedactionPaths = [
  "password",
  "body.password",
  "headers.cookie",
  "headers.authorization",
  "headers.x-csrf-token",
  "cookie",
  "authorization",
  "csrfToken",
  "sessionToken",
  "DATABASE_URL",
  "REDIS_URL",
  "databaseUrl",
  "redisUrl"
];

export function redactString(value: string): string {
  return value.replace(sensitiveValuePattern, "[REDACTED]");
}

export function redactSensitiveData(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redactSensitiveData);
  if (!value || typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, childValue] of Object.entries(value)) {
    output[key] = sensitiveKeyPattern.test(key) ? "[REDACTED]" : redactSensitiveData(childValue);
  }
  return output;
}

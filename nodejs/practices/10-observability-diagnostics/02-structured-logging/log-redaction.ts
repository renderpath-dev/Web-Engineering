const sensitiveKeyPattern = /password|cookie|authorization|csrf|session|token|database_url|redis_url|databaseUrl|redisUrl/i;
export function redactLogValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactLogValue);
  if (!value || typeof value !== "object") return value;
  const output: Record<string, unknown> = {};
  for (const [key, childValue] of Object.entries(value)) output[key] = sensitiveKeyPattern.test(key) ? "[REDACTED]" : redactLogValue(childValue);
  return output;
}
console.log(JSON.stringify(redactLogValue({ password: "secret", nested: { cookie: "sid=1" } })));

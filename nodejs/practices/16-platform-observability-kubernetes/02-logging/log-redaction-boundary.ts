const sensitiveKeys = [/authorization/i, /cookie/i, /password/i, /secret/i, /token/i, /email/i];

export function redactLogEvent(event: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(event).map(([key, value]) => [
    key,
    sensitiveKeys.some((pattern) => pattern.test(key)) ? "[Redacted]" : value
  ]));
}

export function removeUnsafeErrorFields(error: Record<string, unknown>): Record<string, unknown> {
  const { stack, password, token, cookie, databaseUrl, redisUrl, ...safeFields } = error;
  return safeFields;
}

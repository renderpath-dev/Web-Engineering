export function isRetrySafe(method: string, hasIdempotencyKey: boolean): boolean {
  const normalized = method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(normalized)) return true;
  if (["PUT", "DELETE"].includes(normalized)) return true;
  return normalized === "POST" && hasIdempotencyKey;
}

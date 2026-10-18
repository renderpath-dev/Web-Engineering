export function chooseCacheFreshnessControl(isWritePathKnown: boolean, maxStaleSeconds: number): "explicit-invalidation" | "ttl-only" {
  if (isWritePathKnown) return "explicit-invalidation";
  if (maxStaleSeconds <= 30) return "explicit-invalidation";
  return "ttl-only";
}

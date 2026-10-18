export function calculateCacheHitRatio(cacheHits: number, cacheMisses: number): number {
  const total = cacheHits + cacheMisses;
  if (total === 0) return 0;
  return cacheHits / total;
}

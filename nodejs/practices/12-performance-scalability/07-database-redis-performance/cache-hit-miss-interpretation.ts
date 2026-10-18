
export interface CacheObservation {
  hits: number;
  misses: number;
  redisRoundTrips: number;
}

export function cacheHitRate(observation: CacheObservation): number {
  const total = observation.hits + observation.misses;
  if (total === 0) return 0;
  return Number((observation.hits / total).toFixed(3));
}

export function needsPipeline(observation: CacheObservation): boolean {
  return observation.redisRoundTrips > observation.hits + observation.misses;
}

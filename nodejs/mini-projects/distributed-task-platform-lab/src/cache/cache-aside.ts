import { config } from "../config/env.js";
import { recordCacheHit, recordCacheMiss } from "../observability/cache-metrics.js";
import { getRedisClient } from "../redis/redis-client.js";
import { PROJECT_SUMMARY_CACHE_NAME, projectSummaryCacheKey } from "./cache-keys.js";
import { loadOncePerKey } from "./stampede-guard.js";

export type CacheAsideResult<T> = {
  value: T;
  cacheStatus: "hit" | "miss";
};

export async function readCacheAside<T>(projectId: string, loader: () => Promise<T>): Promise<CacheAsideResult<T>> {
  const client = await getRedisClient();
  const key = projectSummaryCacheKey(projectId);
  const cached = await client.get(key);

  if (cached) {
    recordCacheHit(PROJECT_SUMMARY_CACHE_NAME);
    return { value: JSON.parse(cached) as T, cacheStatus: "hit" };
  }

  const value = await loadOncePerKey(key, loader);
  await client.set(key, JSON.stringify(value), { EX: config.CACHE_TTL_SECONDS });
  recordCacheMiss(PROJECT_SUMMARY_CACHE_NAME);
  return { value, cacheStatus: "miss" };
}

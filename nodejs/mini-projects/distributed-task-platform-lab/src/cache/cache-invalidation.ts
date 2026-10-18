import { getRedisClient } from "../redis/redis-client.js";
import { recordCacheInvalidation } from "../observability/cache-metrics.js";
import { PROJECT_SUMMARY_CACHE_NAME, projectSummaryCacheKey } from "./cache-keys.js";

export async function invalidateProjectSummary(projectId: string): Promise<boolean> {
  const client = await getRedisClient();
  const deleted = await client.del(projectSummaryCacheKey(projectId));
  recordCacheInvalidation(PROJECT_SUMMARY_CACHE_NAME);
  return deleted > 0;
}

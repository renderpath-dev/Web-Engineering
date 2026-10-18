import { config } from "../config/env.js";
import { recordRedisFallback } from "../observability/reliability-metrics.js";
import { raceWithTimeout } from "../reliability/timeout.js";
import { connectRedis } from "./redis-client.js";

export interface CacheResult<T> {
  value: T;
  source: "cache" | "origin";
  degraded: boolean;
  detail?: string;
}

export async function getJsonWithFallback<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<CacheResult<T>> {
  try {
    const client = await connectRedis();
    const cached = await raceWithTimeout(client.get(key), config.REDIS_COMMAND_TIMEOUT_MS, "Redis get timed out");
    if (cached) {
      return { value: JSON.parse(cached) as T, source: "cache", degraded: false };
    }

    const value = await loader();
    await raceWithTimeout(
      client.setEx(key, ttlSeconds, JSON.stringify(value)),
      config.REDIS_COMMAND_TIMEOUT_MS,
      "Redis set timed out"
    );
    return { value, source: "origin", degraded: false };
  } catch (error) {
    recordRedisFallback("optional_cache");
    const value = await loader();
    return {
      value,
      source: "origin",
      degraded: true,
      detail: error instanceof Error ? error.message : "cache unavailable"
    };
  }
}

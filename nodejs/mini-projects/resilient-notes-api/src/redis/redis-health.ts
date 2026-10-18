import type { DependencyHealth } from "../db/db-health.js";
import { recordDependencyHealth } from "../observability/reliability-metrics.js";
import { raceWithTimeout } from "../reliability/timeout.js";
import { classifyRedisError } from "./redis-error-classifier.js";
import { connectRedis } from "./redis-client.js";
import { config } from "../config/env.js";

export async function checkRedisHealth(): Promise<DependencyHealth> {
  try {
    const client = await connectRedis();
    await raceWithTimeout(client.ping(), config.REDIS_COMMAND_TIMEOUT_MS, "Redis health check timed out");
    recordDependencyHealth("redis", "healthy");
    return { name: "redis", healthy: true, required: true, detail: "ok" };
  } catch (error) {
    const kind = classifyRedisError(error);
    recordDependencyHealth("redis", "unhealthy");
    return { name: "redis", healthy: false, required: true, detail: kind };
  }
}

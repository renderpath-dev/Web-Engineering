import { checkPostgresReadiness } from "../db/db-health.js";
import { checkRedisReadiness } from "../redis/redis-health.js";
import type { LiveHealth, ReadyHealth } from "./health.types.js";

export function getLiveHealth(): LiveHealth {
  return {
    status: "live",
    uptimeSeconds: Number(process.uptime().toFixed(3))
  };
}

export async function getReadyHealth(): Promise<ReadyHealth> {
  const [postgres, redis] = await Promise.all([
    checkPostgresReadiness(),
    checkRedisReadiness()
  ]);

  return {
    status: postgres === "ready" && redis === "ready" ? "ready" : "not_ready",
    dependencies: {
      postgres,
      redis
    }
  };
}

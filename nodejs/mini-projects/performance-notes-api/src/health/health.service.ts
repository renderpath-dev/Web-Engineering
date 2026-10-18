import { checkDatabase } from "../db/db-health.js";
import { checkRedis } from "../redis/redis-health.js";
import type { LiveHealth, ReadyHealth } from "./health.types.js";

export function getLiveness(): LiveHealth {
  return {
    status: "live",
    uptimeSeconds: Math.round(process.uptime())
  };
}

export async function getReadiness(): Promise<ReadyHealth> {
  const [postgres, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const ready = postgres === "ready" && redis === "ready";

  return {
    status: ready ? "ready" : "not_ready",
    dependencies: {
      postgres,
      redis
    }
  };
}

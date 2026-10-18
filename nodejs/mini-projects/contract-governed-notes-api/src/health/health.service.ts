import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";

export function liveHealth() {
  return {
    status: "ok",
    service: "contract-governed-notes-api"
  };
}

export async function readyHealth() {
  const [database, redis] = await Promise.allSettled([checkDatabaseHealth(), checkRedisHealth()]);
  const checks = {
    database: database.status === "fulfilled" && database.value,
    redis: redis.status === "fulfilled" && redis.value
  };

  return {
    status: checks.database && checks.redis ? "ready" : "not_ready",
    checks
  };
}

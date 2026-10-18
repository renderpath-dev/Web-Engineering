import { checkDatabaseHealth } from "../db/db-health.js";
import { checkRedisHealth } from "../redis/redis-health.js";
import type { HealthStatus } from "./health.types.js";

export function getLiveness(): HealthStatus {
  return { status: "live", dependencies: [] };
}

export async function getReadiness(): Promise<HealthStatus> {
  const dependencies = await Promise.all([checkDatabaseHealth(), checkRedisHealth()]);
  const requiredFailures = dependencies.filter((dependency) => dependency.required && !dependency.healthy);
  const optionalFailures = dependencies.filter((dependency) => !dependency.required && !dependency.healthy);

  if (requiredFailures.length > 0) {
    return { status: "not_ready", dependencies };
  }

  if (optionalFailures.length > 0) {
    return { status: "degraded", dependencies };
  }

  return { status: "ready", dependencies };
}

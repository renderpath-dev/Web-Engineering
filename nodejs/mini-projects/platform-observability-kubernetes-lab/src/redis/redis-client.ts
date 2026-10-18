import { createClient } from "redis";
import type { AppConfig } from "../config/env.js";

export function createRedisClient(config: Pick<AppConfig, "REDIS_URL">) {
  return createClient({ url: config.REDIS_URL });
}

import { Pool } from "pg";
import type { AppConfig } from "../config/env.js";

export function createPgPool(config: Pick<AppConfig, "DATABASE_URL" | "READINESS_TIMEOUT_MS">): Pool {
  return new Pool({
    connectionString: config.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: config.READINESS_TIMEOUT_MS
  });
}

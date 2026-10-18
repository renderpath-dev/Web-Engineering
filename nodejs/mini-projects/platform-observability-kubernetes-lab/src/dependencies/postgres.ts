import { Pool } from "pg";
import type { AppConfig } from "../config/env.js";

export type DependencyStatus = {
  name: string;
  ready: boolean;
  latencyMs: number;
  message: string;
};

export type DependencyProbe = {
  name: string;
  check: () => Promise<DependencyStatus>;
  close: () => Promise<void>;
};

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Dependency readiness timeout")), timeoutMs);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export function createPostgresProbe(config: AppConfig): DependencyProbe {
  if (config.SKIP_DEPENDENCY_CHECKS) {
    return {
      name: "postgres",
      check: async () => ({ name: "postgres", ready: true, latencyMs: 0, message: "Skipped by local validation mode" }),
      close: async () => {}
    };
  }

  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: config.READINESS_TIMEOUT_MS
  });

  return {
    name: "postgres",
    check: async () => {
      const start = Date.now();
      try {
        const client = await withTimeout(pool.connect(), config.READINESS_TIMEOUT_MS);
        try {
          await withTimeout(client.query("select 1 as ok"), config.READINESS_TIMEOUT_MS);
          return { name: "postgres", ready: true, latencyMs: Date.now() - start, message: "Connection accepted" };
        } finally {
          client.release();
        }
      } catch {
        return { name: "postgres", ready: false, latencyMs: Date.now() - start, message: "Connection unavailable" };
      }
    },
    close: async () => {
      await pool.end();
    }
  };
}

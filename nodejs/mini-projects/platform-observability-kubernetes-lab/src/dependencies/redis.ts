import { createClient } from "redis";
import type { AppConfig } from "../config/env.js";
import type { DependencyProbe } from "./postgres.js";

export function createRedisProbe(config: AppConfig): DependencyProbe {
  if (config.SKIP_DEPENDENCY_CHECKS) {
    return {
      name: "redis",
      check: async () => ({ name: "redis", ready: true, latencyMs: 0, message: "Skipped by local validation mode" }),
      close: async () => {}
    };
  }

  const client = createClient({ url: config.REDIS_URL });

  return {
    name: "redis",
    check: async () => {
      const start = Date.now();
      try {
        if (!client.isOpen) {
          await client.connect();
        }
        const response = await client.ping();
        return { name: "redis", ready: response === "PONG", latencyMs: Date.now() - start, message: "PING accepted" };
      } catch {
        return { name: "redis", ready: false, latencyMs: Date.now() - start, message: "PING unavailable" };
      }
    },
    close: async () => {
      if (client.isOpen) {
        await client.quit();
      }
    }
  };
}

import { createClient } from "redis";
import { config } from "../config/env.js";
import { logger } from "../observability/logger.js";
import { redactSensitiveData } from "../observability/log-redaction.js";

export type AppRedisClient = ReturnType<typeof createClient>;

let client: AppRedisClient | undefined;

export function getRedisClient(): AppRedisClient {
  if (!client) {
    client = createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: false,
        connectTimeout: 500
      }
    });

    client.on("error", (error) => {
      logger.error({ error: redactSensitiveData(error) }, "redis client error");
    });

    client.on("ready", () => {
      logger.info({ dependency: "redis" }, "redis client ready");
    });

    client.on("end", () => {
      logger.warn({ dependency: "redis" }, "redis client ended");
    });
  }

  return client;
}

export async function connectRedisClient(): Promise<AppRedisClient> {
  const redis = getRedisClient();
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function closeRedisClient(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
  }
}

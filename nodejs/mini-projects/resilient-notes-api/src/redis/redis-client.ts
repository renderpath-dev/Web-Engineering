import { createClient } from "redis";
import { config } from "../config/env.js";
import { logger } from "../observability/logger.js";

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: config.REDIS_URL,
    socket: {
      connectTimeout: config.REDIS_CONNECT_TIMEOUT_MS,
      reconnectStrategy(retries) {
        if (retries > 10) return new Error("Redis reconnect budget exceeded");
        return Math.min(retries * 100, 2_000);
      }
    }
  });

  redisClient.on("error", (error) => {
    logger.warn({ dependency: "redis", error: error.message }, "Redis client error");
  });

  return redisClient;
}

export async function connectRedis(): Promise<RedisClient> {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
  redisClient = null;
}

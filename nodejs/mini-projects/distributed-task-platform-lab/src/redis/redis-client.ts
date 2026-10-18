import { createClient } from "redis";
import { config } from "../config/env.js";

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | undefined;

export async function getRedisClient(): Promise<RedisClient> {
  if (!redisClient) {
    redisClient = createClient({
      url: config.REDIS_URL,
      socket: {
        connectTimeout: config.REDIS_CONNECT_TIMEOUT_MS
      }
    });
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
  redisClient = undefined;
}

export function parseRedisUrl(redisUrl: string): { host: string; port: number } {
  const parsed = new URL(redisUrl);
  return {
    host: parsed.hostname,
    port: Number.parseInt(parsed.port || "6379", 10)
  };
}

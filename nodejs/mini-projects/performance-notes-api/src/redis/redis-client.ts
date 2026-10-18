import { createClient } from "redis";
import { config } from "../config/env.js";

let redisClient: ReturnType<typeof createClient> | undefined;

export function getRedisClient(): ReturnType<typeof createClient> {
  if (!redisClient) {
    redisClient = createClient({
      url: config.REDIS_URL
    });
  }

  return redisClient;
}

export async function connectRedisClient(): Promise<ReturnType<typeof createClient>> {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

export async function closeRedisClient(): Promise<void> {
  if (!redisClient) return;
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  redisClient = undefined;
}

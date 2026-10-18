import { createClient, type RedisClientType } from "redis";
import { config } from "../config/env.js";

let client: RedisClientType | undefined;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: config.REDIS_URL,
      socket: {
        connectTimeout: config.REDIS_CONNECT_TIMEOUT_MS
      }
    });
    client.on("error", () => undefined);
  }

  if (!client.isOpen) await client.connect();
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client?.isOpen) await client.quit();
  client = undefined;
}

import { getRedisClient } from "./redis-client.js";

export async function checkRedisHealth(): Promise<boolean> {
  const client = await getRedisClient();
  const result = await client.ping();
  return result === "PONG";
}

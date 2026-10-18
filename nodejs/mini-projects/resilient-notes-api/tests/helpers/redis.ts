import { disconnectRedis } from "../../src/redis/redis-client.js";

export async function closeRedis(): Promise<void> {
  await disconnectRedis();
}

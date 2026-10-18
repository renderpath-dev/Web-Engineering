import { connectRedisClient } from "./redis-client.js";

export async function checkRedis(): Promise<"ready" | "unavailable"> {
  try {
    const client = await connectRedisClient();
    const pong = await client.ping();
    return pong === "PONG" ? "ready" : "unavailable";
  } catch {
    return "unavailable";
  }
}

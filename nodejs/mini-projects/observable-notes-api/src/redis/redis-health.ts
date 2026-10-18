import { connectRedisClient } from "./redis-client.js";
import { withDependencySpan } from "../observability/spans.js";

export type RedisStatus = "ready" | "unavailable";

export async function checkRedisReadiness(): Promise<RedisStatus> {
  try {
    const redis = await connectRedisClient();
    const response = await withDependencySpan("redis", "PING", () => redis.ping());
    return response === "PONG" ? "ready" : "unavailable";
  } catch {
    return "unavailable";
  }
}

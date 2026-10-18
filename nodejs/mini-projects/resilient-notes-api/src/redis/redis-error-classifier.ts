export type RedisFailureKind = "connect_timeout" | "command_timeout" | "connection_error" | "unknown_redis_error";

export function classifyRedisError(error: unknown): RedisFailureKind {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("connect") && message.includes("timeout")) return "connect_timeout";
  if (message.includes("timed out")) return "command_timeout";
  if (message.includes("econnrefused") || message.includes("socket")) return "connection_error";
  return "unknown_redis_error";
}

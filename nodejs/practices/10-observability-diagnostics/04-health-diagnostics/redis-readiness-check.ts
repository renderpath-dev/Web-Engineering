type RedisLike = { ping(): Promise<string> };
export async function checkRedisReadiness(redis: RedisLike): Promise<"ready" | "unavailable"> {
  try { return (await redis.ping()) === "PONG" ? "ready" : "unavailable"; } catch { return "unavailable"; }
}
console.log(await checkRedisReadiness({ ping: async () => "PONG" }));

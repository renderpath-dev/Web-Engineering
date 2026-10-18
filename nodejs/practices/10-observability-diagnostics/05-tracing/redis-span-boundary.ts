type RedisLike = { ping(): Promise<string> };
export async function pingWithSpan(redis: RedisLike): Promise<string> {
  const attributes = { component: "redis", operation: "PING" };
  console.log({ event: "span.start", attributes });
  try { return await redis.ping(); } finally { console.log({ event: "span.end", attributes }); }
}
console.log(await pingWithSpan({ ping: async () => "PONG" }));

export async function runRedisCommandWithTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Redis command timed out")), timeoutMs).unref();
  });
  return Promise.race([operation, timeout]);
}

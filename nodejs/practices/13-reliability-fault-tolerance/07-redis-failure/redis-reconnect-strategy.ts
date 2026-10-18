export function reconnectDelay(retries: number): number | Error {
  if (retries > 10) return new Error("Redis reconnect budget exceeded");
  return Math.min(retries * 100, 2_000);
}

export type CacheAsideRead<T> = {
  cacheValue: T | null;
  loadFreshValue(): Promise<T>;
  storeFreshValue(value: T): Promise<void>;
};

export async function readThroughCacheAside<T>(read: CacheAsideRead<T>): Promise<{ value: T; cacheStatus: "hit" | "miss" }> {
  if (read.cacheValue !== null) return { value: read.cacheValue, cacheStatus: "hit" };
  const value = await read.loadFreshValue();
  await read.storeFreshValue(value);
  return { value, cacheStatus: "miss" };
}

export interface CacheFallbackResult<T> {
  value: T;
  source: "cache" | "origin" | "stale";
  degraded: boolean;
  stale: boolean;
  detail: string;
}

export async function readThroughCache<T>(
  readCache: () => Promise<T | null>,
  readStale: () => Promise<T | null>,
  readOrigin: () => Promise<T>
): Promise<CacheFallbackResult<T>> {
  try {
    const cached = await readCache();
    if (cached !== null) {
      return { value: cached, source: "cache", degraded: false, stale: false, detail: "cache hit" };
    }

    return { value: await readOrigin(), source: "origin", degraded: false, stale: false, detail: "cache miss" };
  } catch (error) {
    const stale = await readStale();
    if (stale !== null) {
      return { value: stale, source: "stale", degraded: true, stale: true, detail: "cache failed; stale value returned" };
    }

    return { value: await readOrigin(), source: "origin", degraded: true, stale: false, detail: "cache failed; origin fallback used" };
  }
}

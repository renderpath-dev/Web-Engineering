const inFlightLoads = new Map<string, Promise<unknown>>();

export async function loadOncePerKey<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = inFlightLoads.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const pending = loader().finally(() => {
    inFlightLoads.delete(key);
  });
  inFlightLoads.set(key, pending);
  return pending;
}

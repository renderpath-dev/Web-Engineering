export function buildRequestUrl(baseUrl: string, path: string, query: Record<string, string | number | undefined>): string {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

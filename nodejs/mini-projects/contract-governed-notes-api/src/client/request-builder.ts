export type RequestOptions = {
  method?: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  csrfToken?: string;
};

export function buildRequest(baseUrl: string, path: string, options: RequestOptions = {}): { url: URL; init: RequestInit } {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers = new Headers();
  headers.set("accept", "application/json");
  if (options.body !== undefined) headers.set("content-type", "application/json");
  if (options.csrfToken) headers.set("x-csrf-token", options.csrfToken);

  return {
    url,
    init: {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }
  };
}

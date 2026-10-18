export function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error("Request failed: " + response.status + " " + url);
  }
  return await response.json() as T;
}

export function baseUrl(): string {
  return process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
}

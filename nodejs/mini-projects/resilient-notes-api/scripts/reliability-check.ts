const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function readJson(path: string): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

await readJson("/reliability/abort-demo");
await readJson("/reliability/retry-demo");
await readJson("/reliability/circuit-breaker");
await readJson("/reliability/bulkhead");
await readJson("/reliability/degraded-cache");
console.log(`reliability check ok ${baseUrl}`);

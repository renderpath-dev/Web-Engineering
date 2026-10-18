const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function check(path: string): Promise<void> {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
}

await check("/v1/health/live");
await check("/v1/health/ready");
console.log(`smoke passed for ${baseUrl}`);

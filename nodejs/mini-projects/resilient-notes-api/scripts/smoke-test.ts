import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

async function requireOk(path: string): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
}

await requireOk("/health/live");
await waitForReady(baseUrl);
await requireOk("/metrics");
console.log(`smoke ok ${baseUrl}`);

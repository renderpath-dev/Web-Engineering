import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";

await waitForReady(baseUrl);

const live = await fetch(`${baseUrl}/v1/health/live`);
const ready = await fetch(`${baseUrl}/v1/health/ready`);

if (!live.ok) throw new Error(`live check failed: ${live.status}`);
if (!ready.ok) throw new Error(`ready check failed: ${ready.status}`);

console.log(JSON.stringify({ baseUrl, live: live.status, ready: ready.status }));

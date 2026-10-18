import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: `Cache Check ${Date.now()}` })
});
const project = await projectResponse.json() as { id: string };

await fetch(`${baseUrl}/v1/projects/${project.id}/tasks`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ title: `cache-task-${randomUUID()}` })
});

await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/invalidate`, { method: "POST" });

const first = await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/summary`);
const firstBody = await first.json() as { cacheStatus: string };
const second = await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/summary`);
const secondBody = await second.json() as { cacheStatus: string };
const invalidate = await fetch(`${baseUrl}/v1/cache-demo/projects/${project.id}/invalidate`, { method: "POST" });
const invalidateBody = await invalidate.json() as { invalidated: boolean };

if (firstBody.cacheStatus !== "miss") throw new Error(`expected miss, got ${firstBody.cacheStatus}`);
if (secondBody.cacheStatus !== "hit") throw new Error(`expected hit, got ${secondBody.cacheStatus}`);
if (!invalidateBody.invalidated) throw new Error("expected invalidation to delete cached value");

console.log(JSON.stringify({ first: firstBody.cacheStatus, second: secondBody.cacheStatus, invalidated: invalidateBody.invalidated }));

import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({ name: `Queue Check ${Date.now()}` })
});
if (!projectResponse.ok) throw new Error(`project create failed: ${projectResponse.status}`);
const project = await projectResponse.json() as { id: string };

const importResponse = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({
    idempotencyKey: `queue-check:${randomUUID()}`,
    tasks: [{ title: "queued task" }]
  })
});
if (importResponse.status !== 202) throw new Error(`queue check failed: ${importResponse.status}`);
const accepted = await importResponse.json() as { jobId: string; status: string };
if (!accepted.jobId || accepted.status !== "queued") throw new Error("queue check did not return queued job");
console.log(JSON.stringify({ queue: "task-import", jobId: accepted.jobId, status: accepted.status }));

import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

async function waitForJob(jobId: string): Promise<{ status: string }> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}`);
    const body = await response.json() as { status: string };
    if (body.status === "completed" || body.status === "failed") return body;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("worker check timed out");
}

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({ name: `Worker Check ${Date.now()}` })
});
const project = await projectResponse.json() as { id: string };

const importResponse = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-request-id": randomUUID() },
  body: JSON.stringify({
    idempotencyKey: `worker-check:${randomUUID()}`,
    tasks: [{ title: "worker processed task" }]
  })
});
const accepted = await importResponse.json() as { jobId: string };
const result = await waitForJob(accepted.jobId);
if (result.status !== "completed") throw new Error(`worker check ended as ${result.status}`);
console.log(JSON.stringify({ worker: "task-import-worker", status: result.status }));

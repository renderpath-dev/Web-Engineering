import { randomUUID } from "node:crypto";
import { waitForReady } from "./wait-for-ready.js";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
await waitForReady(baseUrl);

async function waitForJob(jobId: string): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}`);
    const body = await response.json() as { status: string };
    if (body.status === "completed") return;
    if (body.status === "failed") throw new Error("job failed during consistency check");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("consistency check timed out");
}

const projectResponse = await fetch(`${baseUrl}/v1/projects`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: `Consistency Check ${Date.now()}` })
});
const project = await projectResponse.json() as { id: string };
const idempotencyKey = `consistency-check:${randomUUID()}`;
const payload = {
  idempotencyKey,
  tasks: [{ title: "idempotent task" }]
};

const first = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});
const second = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks/import`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});
const firstBody = await first.json() as { jobId: string };
const secondBody = await second.json() as { jobId: string; duplicate: boolean };
if (firstBody.jobId !== secondBody.jobId || !secondBody.duplicate) throw new Error("duplicate idempotency key did not return existing job");

await waitForJob(firstBody.jobId);
const tasksResponse = await fetch(`${baseUrl}/v1/projects/${project.id}/tasks`);
const tasksBody = await tasksResponse.json() as { tasks: Array<{ title: string }> };
const matching = tasksBody.tasks.filter((task) => task.title === "idempotent task");
if (matching.length !== 1) throw new Error(`expected one imported task, got ${matching.length}`);

console.log(JSON.stringify({ duplicate: secondBody.duplicate, matchingTasks: matching.length }));

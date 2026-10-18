import { rm, writeFile } from "node:fs/promises";

export const workerReadyFile = "/tmp/distributed-task-worker-ready";

export async function markWorkerReady(): Promise<void> {
  await writeFile(workerReadyFile, "ready", "utf8");
}

export async function clearWorkerReady(): Promise<void> {
  await rm(workerReadyFile, { force: true });
}

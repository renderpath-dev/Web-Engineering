export type WorkerRunbookStep = "pause-input" | "drain-worker" | "close-queue" | "disconnect-data";

export function formatWorkerShutdownRunbook(steps: WorkerRunbookStep[]): string {
  return steps.join(" -> ");
}

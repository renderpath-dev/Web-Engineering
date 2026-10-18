export type ConsistencyStep = "db-committed" | "job-enqueued" | "worker-completed" | "cache-invalidated";

export function buildConsistencyTimeline(steps: ConsistencyStep[]): string {
  return steps.join(" -> ");
}

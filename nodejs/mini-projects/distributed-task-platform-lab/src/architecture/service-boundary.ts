export const serviceBoundaryModel = {
  architecture: "modular-monolith-with-worker-boundary",
  apiService: {
    owns: ["HTTP routing", "request validation", "job creation", "job status responses"],
    mustNotOwn: ["long-running import execution", "BullMQ internal keys", "worker process lifecycle"]
  },
  workerService: {
    owns: ["job processing", "payload validation", "idempotent task writes", "cache invalidation"],
    mustNotOwn: ["public HTTP contract", "Express Request objects", "client-facing DTO versioning"]
  },
  dataOwners: ["PostgreSQL is business state", "Redis queue is delivery state", "Redis cache is derived state"]
} as const;

export const migrationPlan = [
  {
    step: "Keep domain modules inside one deployable API",
    signal: "Imports cross modules only through service functions"
  },
  {
    step: "Move slow retryable side effects behind a job contract",
    signal: "HTTP returns a job id instead of waiting for task import completion"
  },
  {
    step: "Run worker as a separate service",
    signal: "Compose has api and worker services sharing PostgreSQL and Redis"
  },
  {
    step: "Observe idempotency, retries, and cache invalidation",
    signal: "Checks prove duplicate imports do not create duplicate rows"
  }
] as const;

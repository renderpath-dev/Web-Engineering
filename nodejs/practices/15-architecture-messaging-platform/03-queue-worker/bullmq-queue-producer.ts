export type QueueAddOptions = {
  jobId: string;
  attempts: number;
  backoffDelayMs: number;
};

export function buildQueueAddOptions(idempotencyKey: string): QueueAddOptions {
  return {
    jobId: `tasks.import:${idempotencyKey}`,
    attempts: 3,
    backoffDelayMs: 1000
  };
}

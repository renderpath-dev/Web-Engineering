export type FailureClass = "transient" | "permanent" | "unknown";

export class TransientJobError extends Error {
  readonly failureClass = "transient" as const;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransientJobError";
  }
}

export class PermanentJobError extends Error {
  readonly failureClass = "permanent" as const;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PermanentJobError";
  }
}

export function classifyJobFailure(error: unknown): FailureClass {
  if (error instanceof PermanentJobError) return "permanent";
  if (error instanceof TransientJobError) return "transient";
  return "unknown";
}

export function shouldRetryJob(failureClass: FailureClass, attemptsMade: number, maxAttempts: number): boolean {
  if (failureClass === "permanent") return false;
  return attemptsMade < maxAttempts;
}

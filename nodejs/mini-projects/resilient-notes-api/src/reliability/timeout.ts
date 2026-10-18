import { timeoutTotal } from "../observability/reliability-metrics.js";
import { isAbortError } from "./abortable.js";

export class TimeoutError extends Error {
  readonly code = "TIMEOUT";

  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    return await operation(signal);
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      timeoutTotal.inc({ operation: operationName });
      throw new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export async function raceWithTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => reject(new TimeoutError(message)), timeoutMs);
    timeout.unref();
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

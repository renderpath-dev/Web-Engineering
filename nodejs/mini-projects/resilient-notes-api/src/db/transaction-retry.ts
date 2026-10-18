import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";
import { config } from "../config/env.js";
import { recordTransactionRetry } from "../observability/reliability-metrics.js";
import { abortableDelay } from "../reliability/abortable.js";
import { isRetryableTransactionConflict } from "./db-error-classifier.js";

export interface TransactionRetryOptions {
  maxAttempts?: number;
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
  signal?: AbortSignal;
}

export async function withTransactionRetry<T>(
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  options: TransactionRetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? Math.max(1, config.RETRY_BUDGET + 1);
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new Error("Transaction retry aborted");
    }

    try {
      return await prisma.$transaction(operation, {
        isolationLevel: options.isolationLevel ?? Prisma.TransactionIsolationLevel.Serializable,
        maxWait: options.maxWait ?? 2_000,
        timeout: options.timeout ?? 5_000
      });
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionConflict(error) || attempt === maxAttempts) break;
      recordTransactionRetry("p2034");
      await abortableDelay(25 * attempt, options.signal);
    }
  }

  throw lastError;
}

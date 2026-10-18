import type { JobsOptions } from "bullmq";
import { config } from "../config/env.js";
import type { ImportTasksJobPayload } from "./job-schemas.js";

export const IMPORT_TASKS_JOB_NAME = "tasks.import";
export const IMPORT_TASKS_PAYLOAD_VERSION = "1";

export function buildImportJobId(idempotencyKey: string): string {
  return `${IMPORT_TASKS_JOB_NAME}:${idempotencyKey}`;
}

export function buildImportJobPayload(input: Omit<ImportTasksJobPayload, "name" | "version">): ImportTasksJobPayload {
  return {
    ...input,
    name: IMPORT_TASKS_JOB_NAME,
    version: IMPORT_TASKS_PAYLOAD_VERSION
  };
}

export function buildImportJobOptions(idempotencyKey: string): JobsOptions {
  return {
    jobId: buildImportJobId(idempotencyKey),
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  };
}

import type { Job } from "bullmq";
import type { Prisma } from "../generated/prisma/client.js";
import { invalidateProjectSummary } from "../cache/cache-invalidation.js";
import { prisma } from "../db/prisma.js";
import { recordJobCompleted, recordJobFailed, recordJobStarted } from "../observability/job-metrics.js";
import { IMPORT_TASKS_JOB_NAME } from "../queue/job-contract.js";
import { type ImportTasksJobPayload, type ImportTasksJobResult, parseImportTasksPayload } from "../queue/job-schemas.js";
import { classifyJobFailure, PermanentJobError, TransientJobError } from "../queue/retry-policy.js";

function readFailureIdempotencyKey(input: unknown): string | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const rawIdempotencyKey = (input as { idempotencyKey?: unknown }).idempotencyKey;
  return typeof rawIdempotencyKey === "string" && rawIdempotencyKey.length > 0 ? rawIdempotencyKey : undefined;
}

function parsePayloadForWorker(input: unknown): ImportTasksJobPayload {
  try {
    return parseImportTasksPayload(input);
  } catch (error: unknown) {
    throw new PermanentJobError("Invalid import job payload", { cause: error });
  }
}

export async function processImportTasksJob(job: Job<ImportTasksJobPayload, ImportTasksJobResult, string>): Promise<ImportTasksJobResult> {
  const startedAt = Date.now();
  let payload: ImportTasksJobPayload | undefined;
  try {
    const validPayload = parsePayloadForWorker(job.data);
    payload = validPayload;
    if (validPayload.failureMode === "permanent") throw new PermanentJobError("Permanent failure requested");
    if (validPayload.failureMode === "transient" && job.attemptsMade === 0) throw new TransientJobError("Transient failure requested");

    recordJobStarted(IMPORT_TASKS_JOB_NAME);

    const existingCompleted = await prisma.jobRecord.findUnique({
      where: { idempotencyKey: validPayload.idempotencyKey }
    });

    if (existingCompleted?.status === "completed" && existingCompleted.result) {
      return existingCompleted.result as ImportTasksJobResult;
    }

    const result = await prisma.$transaction(async (transaction) => {
      const record = await transaction.jobRecord.update({
        where: { idempotencyKey: validPayload.idempotencyKey },
        data: {
          status: "active",
          attemptCount: job.attemptsMade + 1,
          events: {
            create: {
              status: "active",
              message: "Worker started job",
              metadata: { attempt: job.attemptsMade + 1 }
            }
          }
        }
      });

      const beforeCount = await transaction.task.count({
        where: {
          projectId: validPayload.projectId,
          importBatchId: validPayload.idempotencyKey
        }
      });

      for (const task of validPayload.tasks) {
        await transaction.task.upsert({
          where: {
            projectId_importBatchId_title: {
              projectId: validPayload.projectId,
              importBatchId: validPayload.idempotencyKey,
              title: task.title
            }
          },
          update: {
            completed: task.completed
          },
          create: {
            projectId: validPayload.projectId,
            title: task.title,
            completed: task.completed,
            importBatchId: validPayload.idempotencyKey
          }
        });
      }

      const afterCount = await transaction.task.count({
        where: {
          projectId: validPayload.projectId,
          importBatchId: validPayload.idempotencyKey
        }
      });

      const importResult: ImportTasksJobResult = {
        projectId: validPayload.projectId,
        imported: Math.max(0, afterCount - beforeCount),
        skipped: validPayload.tasks.length - Math.max(0, afterCount - beforeCount),
        total: validPayload.tasks.length
      };

      await transaction.jobRecord.update({
        where: { id: record.id },
        data: {
          status: "completed",
          result: importResult as unknown as Prisma.InputJsonValue,
          events: {
            create: {
              status: "completed",
              message: "Worker completed job",
              metadata: importResult as unknown as Prisma.InputJsonValue
            }
          }
        }
      });

      return importResult;
    });

    await invalidateProjectSummary(validPayload.projectId);
    recordJobCompleted(IMPORT_TASKS_JOB_NAME, Date.now() - startedAt);
    return result;
  } catch (error: unknown) {
    const failureClass = classifyJobFailure(error);
    const failureIdempotencyKey = payload?.idempotencyKey ?? readFailureIdempotencyKey(job.data);

    if (failureIdempotencyKey) {
      const existingRecord = await prisma.jobRecord.findUnique({
        where: { idempotencyKey: failureIdempotencyKey },
        select: { id: true }
      });

      if (existingRecord) {
        await prisma.jobRecord.update({
          where: { id: existingRecord.id },
          data: {
            status: "failed",
            attemptCount: job.attemptsMade + 1,
            failureClass,
            failureCode: error instanceof Error ? error.constructor.name : "UnknownError",
            events: {
              create: {
                status: "failed",
                message: "Worker failed job",
                metadata: { failureClass }
              }
            }
          }
        });
      }
    }

    recordJobFailed(IMPORT_TASKS_JOB_NAME, failureClass, Date.now() - startedAt);
    throw error;
  }
}

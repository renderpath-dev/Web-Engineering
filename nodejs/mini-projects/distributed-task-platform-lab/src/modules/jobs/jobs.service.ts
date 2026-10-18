import type { Prisma } from "../../generated/prisma/client.js";
import { recordJobRetry } from "../../observability/job-metrics.js";
import { buildImportJobOptions, IMPORT_TASKS_JOB_NAME } from "../../queue/job-contract.js";
import { parseImportTasksPayload } from "../../queue/job-schemas.js";
import { taskQueue } from "../../queue/task-queue.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";

export type JobStatusDto = {
  jobId: string;
  jobName: string;
  payloadVersion: string;
  status: string;
  attemptCount: number;
  failureClass: string | null;
  failureCode: string | null;
  result: unknown;
  createdAt: string;
  updatedAt: string;
};

export type JobEventDto = {
  id: string;
  status: string;
  message: string;
  metadata: unknown;
  createdAt: string;
};

function toJobStatusDto(record: {
  jobId: string;
  jobName: string;
  payloadVersion: string;
  status: string;
  attemptCount: number;
  failureClass: string | null;
  failureCode: string | null;
  result: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}): JobStatusDto {
  return {
    jobId: record.jobId,
    jobName: record.jobName,
    payloadVersion: record.payloadVersion,
    status: record.status,
    attemptCount: record.attemptCount,
    failureClass: record.failureClass,
    failureCode: record.failureCode,
    result: record.result,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export async function getJobStatus(jobId: string): Promise<JobStatusDto> {
  const record = await prisma.jobRecord.findUnique({ where: { jobId } });
  if (!record) throw new HttpError(404, "job_not_found", "Job not found");
  return toJobStatusDto(record);
}

export async function getJobEvents(jobId: string): Promise<JobEventDto[]> {
  const record = await prisma.jobRecord.findUnique({
    where: { jobId },
    include: { events: { orderBy: { createdAt: "asc" } } }
  });
  if (!record) throw new HttpError(404, "job_not_found", "Job not found");
  return record.events.map((event) => ({
    id: event.id,
    status: event.status,
    message: event.message,
    metadata: event.metadata,
    createdAt: event.createdAt.toISOString()
  }));
}

export async function retryJob(jobId: string): Promise<JobStatusDto> {
  const record = await prisma.jobRecord.findUnique({ where: { jobId } });
  if (!record) throw new HttpError(404, "job_not_found", "Job not found");
  if (record.status !== "failed") throw new HttpError(409, "job_not_retryable", "Only failed jobs can be retried");

  const payload = parseImportTasksPayload(record.payload);
  await prisma.jobRecord.update({
    where: { jobId },
    data: {
      status: "queued",
      failureClass: null,
      failureCode: null,
      events: {
        create: {
          status: "queued",
          message: "Manual retry accepted",
          metadata: { source: "api" }
        }
      }
    }
  });
  await taskQueue.add(IMPORT_TASKS_JOB_NAME, payload, {
    ...buildImportJobOptions(payload.idempotencyKey),
    jobId: `${jobId}:retry:${Date.now()}`
  });
  recordJobRetry(IMPORT_TASKS_JOB_NAME);
  return getJobStatus(jobId);
}

import type { Prisma } from "../../generated/prisma/client.js";
import { chooseCorrelationId } from "../../observability/correlation-id.js";
import { recordJobQueued } from "../../observability/job-metrics.js";
import { buildImportJobOptions, buildImportJobPayload, IMPORT_TASKS_JOB_NAME, IMPORT_TASKS_PAYLOAD_VERSION } from "../../queue/job-contract.js";
import { taskQueue } from "../../queue/task-queue.js";
import { invalidateProjectSummary } from "../../cache/cache-invalidation.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../shared/errors/http-error.js";
import { getProjectById } from "../projects/projects.service.js";
import type { CreateTaskInput, ImportTasksRequest } from "./tasks.schema.js";

export type TaskDto = {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

function toTaskDto(task: { id: string; projectId: string; title: string; completed: boolean; createdAt: Date; updatedAt: Date }): TaskDto {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}

export async function listTasks(projectId: string): Promise<TaskDto[]> {
  await getProjectById(projectId);
  const tasks = await prisma.task.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } });
  return tasks.map(toTaskDto);
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<TaskDto> {
  await getProjectById(projectId);
  const task = await prisma.task.create({
    data: {
      projectId,
      title: input.title,
      completed: input.completed
    }
  });
  await invalidateProjectSummary(projectId);
  return toTaskDto(task);
}

export async function enqueueTaskImport(projectId: string, body: ImportTasksRequest, requestId: string | undefined): Promise<{ jobId: string; status: string; duplicate: boolean }> {
  await getProjectById(projectId);
  const correlationId = chooseCorrelationId(body.correlationId ?? requestId);
  const payload = buildImportJobPayload({
    projectId,
    idempotencyKey: body.idempotencyKey,
    correlationId,
    tasks: body.tasks,
    metadata: { source: "api" },
    failureMode: body.failureMode
  });
  const options = buildImportJobOptions(body.idempotencyKey);
  const publicJobId = String(options.jobId);

  try {
    await prisma.jobRecord.create({
      data: {
        jobId: publicJobId,
        jobName: IMPORT_TASKS_JOB_NAME,
        payloadVersion: IMPORT_TASKS_PAYLOAD_VERSION,
        idempotencyKey: body.idempotencyKey,
        correlationId,
        status: "queued",
        projectId,
        payload: payload as unknown as Prisma.InputJsonValue,
        events: {
          create: {
            status: "queued",
            message: "Job accepted",
            metadata: { source: "api" }
          }
        }
      }
    });
  } catch (error: unknown) {
    const existing = await prisma.jobRecord.findUnique({ where: { idempotencyKey: body.idempotencyKey } });
    if (existing) return { jobId: existing.jobId, status: existing.status, duplicate: true };
    throw error;
  }

  await taskQueue.add(IMPORT_TASKS_JOB_NAME, payload, options);
  recordJobQueued(IMPORT_TASKS_JOB_NAME);
  return { jobId: publicJobId, status: "queued", duplicate: false };
}

export function assertProjectExists(projectId: string): Promise<unknown> {
  return getProjectById(projectId).catch((error: unknown) => {
    if (error instanceof HttpError) throw error;
    throw new HttpError(404, "project_not_found", "Project not found");
  });
}

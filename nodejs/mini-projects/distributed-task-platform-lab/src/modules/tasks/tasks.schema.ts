import { z } from "zod";

export const taskParamsSchema = z.object({
  projectId: z.string().uuid()
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  completed: z.boolean().default(false)
});

export const importTasksRequestSchema = z.object({
  idempotencyKey: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/),
  correlationId: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/).optional(),
  tasks: z.array(createTaskSchema).min(1).max(50),
  failureMode: z.enum(["none", "transient", "permanent"]).default("none")
}).refine((body) => new Set(body.tasks.map((task) => task.title)).size === body.tasks.length, {
  message: "Task titles must be unique within one import request"
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ImportTasksRequest = z.infer<typeof importTasksRequestSchema>;

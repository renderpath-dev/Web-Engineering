import { z } from "zod";

export const importTaskItemSchema = z.object({
  title: z.string().trim().min(1).max(160),
  completed: z.boolean().default(false)
});

export const importTasksPayloadSchema = z.object({
  name: z.literal("tasks.import"),
  version: z.literal("1"),
  projectId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/),
  correlationId: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_.:-]+$/),
  tasks: z.array(importTaskItemSchema).min(1).max(50),
  metadata: z.object({
    source: z.string().min(1).max(80)
  }).default({ source: "api" }),
  failureMode: z.enum(["none", "transient", "permanent"]).default("none")
}).refine((payload) => new Set(payload.tasks.map((task) => task.title)).size === payload.tasks.length, {
  message: "Task titles must be unique within one import payload"
});

export const importTasksResultSchema = z.object({
  projectId: z.string().uuid(),
  imported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  total: z.number().int().nonnegative()
});

export type ImportTasksJobPayload = z.infer<typeof importTasksPayloadSchema>;
export type ImportTasksJobResult = z.infer<typeof importTasksResultSchema>;

export function parseImportTasksPayload(input: unknown): ImportTasksJobPayload {
  return importTasksPayloadSchema.parse(input);
}

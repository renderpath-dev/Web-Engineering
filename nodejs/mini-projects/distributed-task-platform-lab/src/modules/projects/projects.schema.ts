import { z } from "zod";

export const projectParamsSchema = z.object({
  projectId: z.string().uuid()
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

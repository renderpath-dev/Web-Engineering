import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNotebookBodySchema = z.object({
  title: z.string().min(1).max(120)
});

export const updateNotebookBodySchema = createNotebookBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});

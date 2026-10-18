import { z } from "zod";

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const noteQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  sort: z.enum(["createdAt", "updatedAt"]).default("updatedAt")
});

export const createNoteBodySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default("")
});

export const updateNoteBodySchema = createNoteBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});

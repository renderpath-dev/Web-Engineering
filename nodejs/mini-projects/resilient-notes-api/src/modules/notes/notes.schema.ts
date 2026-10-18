import { z } from "zod";

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const createNoteSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().max(10_000).default("")
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  body: z.string().max(10_000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional()
});

import { z } from "zod";

const noteStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export const listNotesQuerySchema = z.object({
  status: noteStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export const createNoteSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().max(20000).default(""),
  status: noteStatusSchema.default("ACTIVE")
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  body: z.string().max(20000).optional(),
  status: noteStatusSchema.optional()
}).refine((input) => Object.keys(input).length > 0, {
  message: "At least one note field is required."
});

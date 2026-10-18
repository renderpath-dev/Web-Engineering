import { z } from "zod";

const noteStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const noteParamsSchema = z.object({
  noteId: z.string().uuid()
});

export const notebookNoteParamsSchema = z.object({
  notebookId: z.string().uuid()
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

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

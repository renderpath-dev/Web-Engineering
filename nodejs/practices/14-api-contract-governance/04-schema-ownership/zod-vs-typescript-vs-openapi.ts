import { z } from "zod";

export const createNotebookSchema = z.object({
  title: z.string().min(1).max(120)
});

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;

export function parseCreateNotebook(input: unknown): CreateNotebookInput {
  return createNotebookSchema.parse(input);
}

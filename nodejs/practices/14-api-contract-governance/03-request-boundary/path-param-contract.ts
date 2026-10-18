import { z } from "zod";

export const notebookParamsSchema = z.object({
  notebookId: z.string().uuid()
});

export function parseNotebookParams(input: unknown) {
  return notebookParamsSchema.parse(input);
}

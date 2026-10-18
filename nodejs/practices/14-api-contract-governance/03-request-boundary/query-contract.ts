import { z } from "zod";

export const noteQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  sort: z.enum(["createdAt", "updatedAt"]).default("updatedAt")
});

export function parseNoteQuery(input: unknown) {
  return noteQuerySchema.parse(input);
}

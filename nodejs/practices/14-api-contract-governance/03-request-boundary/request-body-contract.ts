import { z } from "zod";

export const createNoteBodySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(20_000).default("")
});

export function parseCreateNoteBody(input: unknown) {
  return createNoteBodySchema.parse(input);
}

import { z } from "zod";

export const csrfHeaderSchema = z.object({
  "x-csrf-token": z.string().min(16)
});

export function parseCsrfHeader(input: unknown) {
  return csrfHeaderSchema.parse(input);
}

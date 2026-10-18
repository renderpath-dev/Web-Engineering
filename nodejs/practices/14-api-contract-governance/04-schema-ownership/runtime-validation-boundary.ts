import { z } from "zod";

const responseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  updatedAt: z.string().datetime()
});

export function parseResponseBody(body: unknown) {
  return responseSchema.parse(body);
}

import { z } from "zod";

export const workSizeSchema = z.object({
  size: z.enum(["small", "medium"]).default("small")
});

export type WorkSizeQuery = z.infer<typeof workSizeSchema>;

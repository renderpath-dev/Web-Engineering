import { z } from "zod";

export const TraceWorkSchema = z.object({
  operationName: z.string().min(1).max(64).default("demo-trace-work"),
  steps: z.coerce.number().int().min(1).max(5).default(2)
});

export type TraceWorkInput = z.infer<typeof TraceWorkSchema>;

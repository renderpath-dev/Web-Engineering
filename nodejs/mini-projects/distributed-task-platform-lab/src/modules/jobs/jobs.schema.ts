import { z } from "zod";

export const jobParamsSchema = z.object({
  jobId: z.string().min(1).max(180)
});

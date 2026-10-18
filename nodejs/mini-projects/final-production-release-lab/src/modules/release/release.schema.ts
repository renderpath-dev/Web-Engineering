import { z } from "zod";

export const gateStatusSchema = z.enum(["PASS", "FAIL", "UNKNOWN"]);

export const evaluateReleaseBodySchema = z.object({
  phase: z.enum(["pre-release", "post-release"]).default("pre-release"),
  signals: z.array(z.object({
    name: z.string().min(1),
    status: gateStatusSchema,
    required: z.boolean(),
    critical: z.boolean(),
    evidence: z.string().min(1),
    reason: z.string().optional()
  })).min(1)
});

export type EvaluateReleaseBody = z.infer<typeof evaluateReleaseBodySchema>;

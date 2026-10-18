import { z } from "zod";

export const idempotentOperationSchema = z.object({
  name: z.string().min(1).max(80),
  amount: z.number().int().positive().max(1_000)
});

export const faultInjectionSchema = z.object({
  scenario: z.enum(["none", "slow_dependency", "timeout", "redis_outage", "db_conflict", "circuit_open"])
});

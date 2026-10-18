export interface RedisRoundTripPlan {
  commandCount: number;
  mode: "sequential" | "pipeline";
}

export function estimateRoundTrips(plan: RedisRoundTripPlan): number {
  return plan.mode === "pipeline" ? 1 : plan.commandCount;
}

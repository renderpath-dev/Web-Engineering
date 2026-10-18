export type FaultScenario = "slow_dependency" | "timeout" | "redis_outage" | "db_conflict";

export function isSafeFaultScenario(value: string): value is FaultScenario {
  return ["slow_dependency", "timeout", "redis_outage", "db_conflict"].includes(value);
}

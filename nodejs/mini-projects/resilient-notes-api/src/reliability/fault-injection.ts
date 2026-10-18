import { config } from "../config/env.js";

export type FaultScenario = "none" | "slow_dependency" | "timeout" | "redis_outage" | "db_conflict" | "circuit_open";

let activeScenario: FaultScenario = "none";

export function assertFaultInjectionAllowed(): void {
  if (config.NODE_ENV === "production" && !config.FAULT_INJECTION_ENABLED) {
    throw new Error("Fault injection is disabled");
  }
}

export function setFaultScenario(scenario: FaultScenario): FaultScenario {
  assertFaultInjectionAllowed();
  activeScenario = scenario;
  return activeScenario;
}

export function resetFaultScenario(): void {
  activeScenario = "none";
}

export function getFaultScenario(): FaultScenario {
  return activeScenario;
}

export function shouldSimulate(scenario: FaultScenario): boolean {
  return activeScenario === scenario;
}

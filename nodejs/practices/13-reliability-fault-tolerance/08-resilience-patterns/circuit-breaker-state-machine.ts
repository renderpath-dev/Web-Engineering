export type CircuitState = "closed" | "open" | "half-open";

export function nextCircuitState(state: CircuitState, success: boolean): CircuitState {
  if (state === "closed") return success ? "closed" : "open";
  if (state === "half-open") return success ? "closed" : "open";
  return success ? "half-open" : "open";
}

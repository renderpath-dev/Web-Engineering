
export interface PoolObservation {
  activeConnections: number;
  poolSize: number;
  waitingQueries: number;
}

export function classifyPoolPressure(observation: PoolObservation): "healthy" | "saturated" {
  if (observation.activeConnections >= observation.poolSize && observation.waitingQueries > 0) {
    return "saturated";
  }
  return "healthy";
}

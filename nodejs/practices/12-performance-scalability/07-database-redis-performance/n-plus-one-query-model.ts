
export interface QueryCountObservation {
  parentRows: number;
  queryCount: number;
}

export function looksLikeNPlusOne(observation: QueryCountObservation): boolean {
  return observation.parentRows > 1 && observation.queryCount >= observation.parentRows + 1;
}

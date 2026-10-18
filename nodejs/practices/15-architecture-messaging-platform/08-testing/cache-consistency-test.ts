export type CacheCheckObservation = {
  firstRead: "hit" | "miss";
  secondRead: "hit" | "miss";
  invalidated: boolean;
};

export function cacheConsistencyPassed(observation: CacheCheckObservation): boolean {
  return observation.firstRead === "miss" && observation.secondRead === "hit" && observation.invalidated;
}

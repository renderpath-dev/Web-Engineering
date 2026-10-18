
export interface CapacityChecklist {
  entry: "nginx";
  databaseHealthy: boolean;
  redisHealthy: boolean;
  benchmarkBudgetPassed: boolean;
  containerStatsReviewed: boolean;
}

export function releaseCapacityReady(checklist: CapacityChecklist): boolean {
  return checklist.entry === "nginx"
    && checklist.databaseHealthy
    && checklist.redisHealthy
    && checklist.benchmarkBudgetPassed
    && checklist.containerStatsReviewed;
}

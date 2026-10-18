
import cluster from "node:cluster";
import os from "node:os";

export interface ClusterPlan {
  primary: boolean;
  workers: number;
  perProcessPools: boolean;
}

export function createClusterPlan(maxWorkers = os.availableParallelism()): ClusterPlan {
  return {
    primary: cluster.isPrimary,
    workers: Math.max(1, Math.min(maxWorkers, os.availableParallelism())),
    perProcessPools: true
  };
}

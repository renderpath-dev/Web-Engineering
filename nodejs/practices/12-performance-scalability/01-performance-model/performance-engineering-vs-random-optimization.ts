
export interface BaselineExperiment {
  route: string;
  loadProfile: {
    concurrency: number;
    totalRequests: number;
  };
  measuredSignal: "latencyP95" | "requestsPerSecond" | "errors" | "eventLoopDelay";
  hypothesis: string;
  changedLayer: "none" | "nginx" | "express" | "node-runtime" | "database" | "redis" | "container";
  verificationSignal: string;
}

export function planBaselineExperiment(route: string): BaselineExperiment {
  return {
    route,
    loadProfile: {
      concurrency: 5,
      totalRequests: 80
    },
    measuredSignal: "latencyP95",
    hypothesis: "ready check should stay below the local budget through nginx",
    changedLayer: "none",
    verificationSignal: "same route, same load profile, no errors"
  };
}

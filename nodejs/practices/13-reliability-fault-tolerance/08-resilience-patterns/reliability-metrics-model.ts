export interface ReliabilityMetricLabels {
  dependency: "api" | "postgres" | "redis";
  outcome: "success" | "failure" | "fallback";
  failureKind: "timeout" | "conflict" | "unavailable" | "none";
}

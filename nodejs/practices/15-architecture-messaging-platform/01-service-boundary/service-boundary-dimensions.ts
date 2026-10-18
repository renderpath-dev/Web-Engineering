export type BoundaryDimension = "business" | "data" | "runtime" | "deployment" | "team" | "trust";

export type BoundaryDecision = {
  dimension: BoundaryDimension;
  signal: string;
  splitPressure: number;
};

export function calculateSplitPressure(decisions: BoundaryDecision[]): number {
  return decisions.reduce((total, decision) => total + decision.splitPressure, 0);
}

export function needsSeparateService(decisions: BoundaryDecision[]): boolean {
  const runtimePressure = decisions.some((decision) => decision.dimension === "runtime" && decision.splitPressure >= 3);
  return runtimePressure && calculateSplitPressure(decisions) >= 8;
}

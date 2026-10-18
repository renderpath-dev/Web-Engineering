export type SloPolicy = {
  name: string;
  window: string;
  availabilityTarget: number;
  latencyTargetMs: number;
  releaseGateBudgetRemainingRatio: number;
};

export const defaultSloPolicy: SloPolicy = {
  name: "api-user-visible-reliability",
  window: "rolling-local-demo",
  availabilityTarget: 0.99,
  latencyTargetMs: 500,
  releaseGateBudgetRemainingRatio: 0.25
};

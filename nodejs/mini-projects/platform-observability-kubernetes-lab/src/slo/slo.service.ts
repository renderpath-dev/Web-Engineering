import { sloBudgetRemainingRatio, sloComplianceRatio } from "../observability/metrics.js";
import { defaultSloPolicy, type SloPolicy } from "./slo-policy.js";

export type RequestSample = {
  ok: boolean;
  durationMs: number;
  observedAt: string;
};

export type SloReport = {
  policy: SloPolicy;
  sampleCount: number;
  availabilityRatio: number;
  latencyComplianceRatio: number;
  errorBudgetSpentRatio: number;
  errorBudgetRemainingRatio: number;
  releaseDecision: "continue" | "investigate";
};

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 1;
  }
  return numerator / denominator;
}

export function calculateSloReport(samples: RequestSample[], policy: SloPolicy = defaultSloPolicy): SloReport {
  const total = samples.length;
  const successful = samples.filter((sample) => sample.ok).length;
  const latencyGood = samples.filter((sample) => sample.durationMs <= policy.latencyTargetMs).length;
  const availabilityRatio = ratio(successful, total);
  const latencyComplianceRatio = ratio(latencyGood, total);
  const allowedFailureRatio = 1 - policy.availabilityTarget;
  const actualFailureRatio = 1 - availabilityRatio;
  const errorBudgetSpentRatio = allowedFailureRatio === 0 ? 1 : Math.min(1, actualFailureRatio / allowedFailureRatio);
  const errorBudgetRemainingRatio = Math.max(0, 1 - errorBudgetSpentRatio);
  const releaseDecision = errorBudgetRemainingRatio < policy.releaseGateBudgetRemainingRatio ? "investigate" : "continue";

  sloComplianceRatio.set({ slo_name: policy.name }, availabilityRatio);
  sloBudgetRemainingRatio.set({ slo_name: policy.name }, errorBudgetRemainingRatio);

  return {
    policy,
    sampleCount: total,
    availabilityRatio,
    latencyComplianceRatio,
    errorBudgetSpentRatio,
    errorBudgetRemainingRatio,
    releaseDecision
  };
}

export function createSloStore(policy: SloPolicy = defaultSloPolicy) {
  const samples: RequestSample[] = [
    { ok: true, durationMs: 42, observedAt: new Date(0).toISOString() },
    { ok: true, durationMs: 80, observedAt: new Date(1).toISOString() },
    { ok: true, durationMs: 220, observedAt: new Date(2).toISOString() }
  ];

  return {
    policy,
    record(sample: Omit<RequestSample, "observedAt">): void {
      samples.push({ ...sample, observedAt: new Date().toISOString() });
      if (samples.length > 200) {
        samples.splice(0, samples.length - 200);
      }
    },
    report(): SloReport {
      return calculateSloReport(samples, policy);
    }
  };
}

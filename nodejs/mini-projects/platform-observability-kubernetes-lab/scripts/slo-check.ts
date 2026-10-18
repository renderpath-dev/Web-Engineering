import { assertCondition, baseUrl, fetchJson } from "./check-utils.js";

const policy = await fetchJson<{ availabilityTarget: number }>(baseUrl() + "/v1/slo/policy");
assertCondition(policy.availabilityTarget > 0 && policy.availabilityTarget < 1, "SLO policy availability target is invalid");

const report = await fetchJson<{ availabilityRatio: number; errorBudgetRemainingRatio: number; releaseDecision: string }>(baseUrl() + "/v1/slo/report");
assertCondition(report.availabilityRatio >= 0 && report.availabilityRatio <= 1, "Availability ratio is outside range");
assertCondition(report.errorBudgetRemainingRatio >= 0 && report.errorBudgetRemainingRatio <= 1, "Error budget ratio is outside range");
assertCondition(["continue", "investigate"].includes(report.releaseDecision), "Release decision is invalid");

console.log("slo ok");

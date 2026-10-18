import { classifyCompatibilityChange, type CompatibilityCase, type CompatibilityResult } from "./compatibility-classifier.js";
import { recordCompatibilityCheck } from "../observability/contract-metrics.js";

const compatibilityKinds = [
  "additive_field",
  "optional_field_added",
  "required_field_added",
  "field_removed",
  "field_renamed",
  "type_changed",
  "enum_value_added",
  "enum_value_removed",
  "status_code_changed",
  "error_code_changed",
  "nullable_changed"
] as const;

export type CompatibilityReport = {
  cases: CompatibilityCase[];
  summary: Record<CompatibilityResult, number>;
  limitations: string[];
};

export function buildCompatibilityReport(): CompatibilityReport {
  const cases = compatibilityKinds.map((kind) => classifyCompatibilityChange(kind));
  const summary: Record<CompatibilityResult, number> = {
    compatible: 0,
    potentially_compatible: 0,
    breaking: 0
  };

  for (const compatibilityCase of cases) {
    summary[compatibilityCase.result] += 1;
    recordCompatibilityCheck(compatibilityCase.result);
  }

  return {
    cases,
    summary,
    limitations: [
      "The classifier is rule-based and does not prove semantic compatibility.",
      "A release gate still needs reviewed fixtures and consumer feedback."
    ]
  };
}

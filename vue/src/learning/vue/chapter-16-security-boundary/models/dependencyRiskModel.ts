export type DependencyRiskCategory =
  | "dom-rendering"
  | "rich-text"
  | "auth"
  | "routing"
  | "storage"
  | "general-ui";

export interface DependencyRiskInput {
  readonly packageName: string;
  readonly category: DependencyRiskCategory;
  readonly changesLockfile: boolean;
}

export interface DependencyRiskReview extends DependencyRiskInput {
  readonly risk: "low" | "medium" | "high";
  readonly reviewAction: string;
}

const highRiskCategories = new Set<DependencyRiskCategory>([
  "dom-rendering",
  "rich-text",
  "auth",
  "storage",
]);

export function classifyDependencyRisk(
  input: DependencyRiskInput,
): DependencyRiskReview {
  if (highRiskCategories.has(input.category)) {
    return {
      ...input,
      risk: "high",
      reviewAction: "Require owner review, changelog review, and security evidence.",
    };
  }

  if (input.changesLockfile) {
    return {
      ...input,
      risk: "medium",
      reviewAction: "Review lockfile and package purpose before release.",
    };
  }

  return {
    ...input,
    risk: "low",
    reviewAction: "Standard code review is enough for the learning model.",
  };
}

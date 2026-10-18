export function releaseDecision(errorBudgetRemainingRatio: number): "continue" | "investigate" {
  return errorBudgetRemainingRatio >= 0.25 ? "continue" : "investigate";
}

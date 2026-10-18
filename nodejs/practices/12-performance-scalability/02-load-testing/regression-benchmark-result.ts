
import type { BaselineResult, PerformanceBudget } from "./performance-budget-check.js";
import { findBudgetViolations } from "./performance-budget-check.js";

export function assertBenchmarkBudget(result: BaselineResult, budget: PerformanceBudget): void {
  const violations = findBudgetViolations(result, budget);
  if (violations.length > 0) {
    throw new Error("Budget violated: " + violations.join(", "));
  }
}

export interface RetryBudget {
  remaining: number;
}

export function consumeRetryBudget(budget: RetryBudget): boolean {
  if (budget.remaining <= 0) return false;
  budget.remaining -= 1;
  return true;
}

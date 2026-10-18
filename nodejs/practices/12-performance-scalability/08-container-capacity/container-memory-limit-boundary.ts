
export interface ContainerMemoryBudget {
  usageMiB: number;
  limitMiB: number;
  maxRatio: number;
}

export function memoryBudgetViolated(budget: ContainerMemoryBudget): boolean {
  return budget.usageMiB / budget.limitMiB > budget.maxRatio;
}

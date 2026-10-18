export function errorBudgetRemaining(target: number, observedAvailability: number): number {
  const allowedFailure = 1 - target;
  const observedFailure = 1 - observedAvailability;
  return Math.max(0, 1 - observedFailure / allowedFailure);
}

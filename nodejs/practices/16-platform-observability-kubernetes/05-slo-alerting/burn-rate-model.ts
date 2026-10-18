export function burnRate(errorRatio: number, allowedErrorRatio: number): number {
  if (allowedErrorRatio <= 0) return Number.POSITIVE_INFINITY;
  return errorRatio / allowedErrorRatio;
}

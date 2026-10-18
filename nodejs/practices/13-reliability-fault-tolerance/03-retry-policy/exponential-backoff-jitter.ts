export function backoffWithJitter(attempt: number, baseMs: number, capMs: number): number {
  const exponential = Math.min(capMs, baseMs * 2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * Math.max(1, exponential * 0.2));
  return exponential + jitter;
}

export const breakingChanges = [
  "response field removed",
  "optional field became required",
  "status code changed",
  "error code changed"
] as const;

export function isKnownBreakingChange(change: string): boolean {
  return breakingChanges.includes(change as (typeof breakingChanges)[number]);
}

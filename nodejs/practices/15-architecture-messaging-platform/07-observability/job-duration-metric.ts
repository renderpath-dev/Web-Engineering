export function bucketJobDuration(durationMs: number): "fast" | "normal" | "slow" {
  if (durationMs < 100) return "fast";
  if (durationMs < 1000) return "normal";
  return "slow";
}

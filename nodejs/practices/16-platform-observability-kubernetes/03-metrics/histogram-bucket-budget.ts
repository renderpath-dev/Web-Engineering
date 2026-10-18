export function bucketForDuration(durationSeconds: number, buckets: number[]): number | undefined {
  return buckets.find((bucket) => durationSeconds <= bucket);
}

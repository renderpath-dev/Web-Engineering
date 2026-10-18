
export interface MemoryTrendSample {
  timestampMs: number;
  rss: number;
  heapUsed: number;
}

export function detectRetentionTrend(samples: MemoryTrendSample[]): boolean {
  if (samples.length < 3) return false;
  const first = samples[0];
  const last = samples[samples.length - 1];
  return last.heapUsed > first.heapUsed * 1.5 && last.rss > first.rss * 1.2;
}

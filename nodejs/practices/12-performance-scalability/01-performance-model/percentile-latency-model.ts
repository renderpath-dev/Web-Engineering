
export interface LatencySummary {
  average: number;
  p50: number;
  p95: number;
  p99: number;
}

function percentile(sortedValues: number[], percentileValue: number): number {
  const index = Math.ceil((percentileValue / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

export function summarizeLatency(samples: number[]): LatencySummary {
  if (samples.length === 0) {
    throw new RangeError("At least one latency sample is required");
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const total = sorted.reduce((sum, value) => sum + value, 0);

  return {
    average: Number((total / sorted.length).toFixed(3)),
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99)
  };
}

export function averageHidesTail(summary: LatencySummary): boolean {
  return summary.p95 > summary.average * 2;
}

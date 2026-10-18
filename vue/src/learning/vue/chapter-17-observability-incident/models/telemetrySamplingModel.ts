import type { TelemetryEvent, TelemetrySeverity } from "./telemetryEventModel";

export interface SamplingDecision {
  readonly keep: boolean;
  readonly reason: string;
}

const alwaysKeepSeverities = new Set<TelemetrySeverity>(["error", "critical"]);

export function shouldSampleTelemetryEvent(
  event: TelemetryEvent,
  sampleRate: number,
  sequenceNumber: number,
): SamplingDecision {
  if (alwaysKeepSeverities.has(event.severity)) {
    return {
      keep: true,
      reason: "High severity events bypass sampling.",
    };
  }

  const normalizedRate = Math.min(1, Math.max(0, sampleRate));
  const interval = normalizedRate === 0 ? Number.POSITIVE_INFINITY : Math.max(1, Math.round(1 / normalizedRate));
  const keep = sequenceNumber % interval === 0;

  return {
    keep,
    reason: keep ? "Sample slot kept." : "Sample slot dropped.",
  };
}

export function isRateLimited(countInWindow: number, limit: number): boolean {
  return countInWindow >= limit;
}

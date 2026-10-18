export type DurationStatus = "pass" | "warning" | "blocked";

export interface PerformanceMeasureReview {
  readonly name: string;
  readonly durationMs: number;
  readonly status: DurationStatus;
}

export function createSafeMarkName(featureName: string, phase: string): string {
  const safeFeature = featureName.replace(/[^a-z0-9-]/giu, "-").toLowerCase();
  const safePhase = phase.replace(/[^a-z0-9-]/giu, "-").toLowerCase();

  return `chapter-17:${safeFeature}:${safePhase}`;
}

export function reviewMeasureDuration(
  name: string,
  durationMs: number,
  warningMs = 120,
  blockedMs = 300,
): PerformanceMeasureReview {
  const status =
    durationMs >= blockedMs ? "blocked" : durationMs >= warningMs ? "warning" : "pass";

  return {
    name,
    durationMs,
    status,
  };
}

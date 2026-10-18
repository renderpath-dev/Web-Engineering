export type ResourceTimingStatus = "pass" | "warning" | "blocked";

export interface ResourceTimingSample {
  readonly name: string;
  readonly initiatorType: string;
  readonly startTime: number;
  readonly responseEnd: number;
  readonly crossOriginLimited: boolean;
}

export interface ResourceTimingReview {
  readonly resourceLabel: string;
  readonly initiatorType: string;
  readonly durationMs: number;
  readonly crossOriginLimited: boolean;
  readonly status: ResourceTimingStatus;
}

export function reviewResourceTiming(sample: ResourceTimingSample): ResourceTimingReview {
  const resourceLabel = sample.name.split("?")[0];
  const durationMs = Math.max(0, sample.responseEnd - sample.startTime);
  const status =
    durationMs > 1200 ? "blocked" : durationMs > 600 ? "warning" : "pass";

  return {
    resourceLabel,
    initiatorType: sample.initiatorType,
    durationMs,
    crossOriginLimited: sample.crossOriginLimited,
    status,
  };
}

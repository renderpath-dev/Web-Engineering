export interface ReleaseHealthSignal {
  readonly errorRatePercent: number;
  readonly failedApiRatePercent: number;
  readonly blockedVitalCount: number;
  readonly openIncidentCount: number;
}

export interface ReleaseHealthReview extends ReleaseHealthSignal {
  readonly releaseAllowed: boolean;
  readonly reason: string;
}

export function reviewReleaseHealth(signal: ReleaseHealthSignal): ReleaseHealthReview {
  const releaseAllowed =
    signal.errorRatePercent < 1 &&
    signal.failedApiRatePercent < 2 &&
    signal.blockedVitalCount === 0 &&
    signal.openIncidentCount === 0;

  return {
    ...signal,
    releaseAllowed,
    reason: releaseAllowed
      ? "Release health model is within local thresholds."
      : "Release health model has blocking signals.",
  };
}

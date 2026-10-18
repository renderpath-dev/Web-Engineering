export interface VisualRegressionBoundary {
  readonly toolConfigured: boolean;
  readonly screenshotStatus: "pass" | "fail" | "unknown";
  readonly semanticBehaviorCovered: boolean;
}

export function canClaimVisualRegressionCoverage(
  boundary: VisualRegressionBoundary,
): boolean {
  return boundary.toolConfigured && boundary.screenshotStatus === "pass";
}

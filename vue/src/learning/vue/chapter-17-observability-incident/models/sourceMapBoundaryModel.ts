export type SourceMapExposureDecision = "upload-private" | "disable-public-map" | "requires-review";

export interface SourceMapBoundaryInput {
  readonly sourceMapEnabled: boolean;
  readonly publicAsset: boolean;
  readonly releaseIdPresent: boolean;
}

export interface SourceMapBoundaryReview extends SourceMapBoundaryInput {
  readonly decision: SourceMapExposureDecision;
  readonly reason: string;
}

export function reviewSourceMapBoundary(
  input: SourceMapBoundaryInput,
): SourceMapBoundaryReview {
  if (input.sourceMapEnabled && input.publicAsset) {
    return {
      ...input,
      decision: "requires-review",
      reason: "Public source maps need deployment and exposure review.",
    };
  }

  if (input.sourceMapEnabled && input.releaseIdPresent) {
    return {
      ...input,
      decision: "upload-private",
      reason: "Private upload can improve stack trace debugging.",
    };
  }

  return {
    ...input,
    decision: "disable-public-map",
    reason: "No verified private upload path is modeled.",
  };
}

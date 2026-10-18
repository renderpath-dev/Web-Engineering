import { describe, expect, it } from "vitest";
import { canClaimVisualRegressionCoverage } from "../models/visualRegressionBoundaryModel";

describe("visualRegressionBoundaryModel", () => {
  it("does not claim coverage without tool output", () => {
    expect(
      canClaimVisualRegressionCoverage({
        toolConfigured: false,
        screenshotStatus: "unknown",
        semanticBehaviorCovered: false,
      }),
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { reviewReleaseHealth } from "../models/releaseHealthModel";

describe("releaseHealthModel", () => {
  it("blocks release on high error rate", () => {
    const review = reviewReleaseHealth({
      errorRatePercent: 1.2,
      failedApiRatePercent: 0.5,
      blockedVitalCount: 0,
      openIncidentCount: 0,
    });

    expect(review.releaseAllowed).toBe(false);
  });

  it("allows release when local thresholds pass", () => {
    const review = reviewReleaseHealth({
      errorRatePercent: 0.2,
      failedApiRatePercent: 0.6,
      blockedVitalCount: 0,
      openIncidentCount: 0,
    });

    expect(review.releaseAllowed).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { reviewEnvExposure } from "../models/envExposureModel";

describe("envExposureModel", () => {
  it("blocks secret values behind client-exposed keys", () => {
    const review = reviewEnvExposure({
      key: "VITE_PRIVATE_TOKEN",
      valueClassification: "secret",
    });

    expect(review.exposedToClient).toBe(true);
    expect(review.status).toBe("blocked");
  });

  it("allows non-client secret keys in the learning model", () => {
    const review = reviewEnvExposure({
      key: "SERVER_PRIVATE_TOKEN",
      valueClassification: "secret",
    });

    expect(review.exposedToClient).toBe(false);
    expect(review.status).toBe("allowed");
  });
});

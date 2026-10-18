import { describe, expect, it } from "vitest";
import { reviewPrivacySink } from "../models/privacyDataClassificationModel";

describe("privacyDataClassificationModel", () => {
  it("blocks personal data from URL sinks", () => {
    const review = reviewPrivacySink({
      label: "profile-email",
      classification: "personal",
      sink: "url",
    });

    expect(review.status).toBe("blocked");
  });

  it("allows public data on screen", () => {
    const review = reviewPrivacySink({
      label: "product-title",
      classification: "public",
      sink: "screen",
    });

    expect(review.status).toBe("allowed");
  });
});

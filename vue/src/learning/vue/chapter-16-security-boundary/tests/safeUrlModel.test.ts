import { describe, expect, it } from "vitest";
import { reviewUrlValue } from "../models/safeUrlModel";

describe("safeUrlModel", () => {
  it("allows same-origin relative URLs", () => {
    const review = reviewUrlValue("/settings?tab=profile");

    expect(review.status).toBe("allowed");
    expect(review.normalizedUrl).toBe("/settings?tab=profile");
  });

  it("requires review for external HTTPS URLs", () => {
    const review = reviewUrlValue("https://docs.example/security");

    expect(review.status).toBe("requires-backend-review");
  });

  it("blocks protocols outside the allowlist", () => {
    const blockedUrl = ["java", "script:blocked-action"].join("");
    const review = reviewUrlValue(blockedUrl);

    expect(review.status).toBe("blocked");
  });
});

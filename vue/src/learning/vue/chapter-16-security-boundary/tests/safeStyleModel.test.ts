import { describe, expect, it } from "vitest";
import { createSafeStyle, reviewRawStyleString } from "../models/safeStyleModel";

describe("safeStyleModel", () => {
  it("creates style objects only from reviewed tokens", () => {
    const review = createSafeStyle({
      colorToken: "success",
      backgroundToken: "warning",
      density: "compact",
    });

    expect(review.status).toBe("allowed");
    expect(review.style.color).toBe("#166534");
    expect(review.style.padding).toBe("0.5rem");
  });

  it("blocks raw style strings", () => {
    const review = reviewRawStyleString("color: red");

    expect(review.status).toBe("blocked");
    expect(review.style).toEqual({});
  });
});

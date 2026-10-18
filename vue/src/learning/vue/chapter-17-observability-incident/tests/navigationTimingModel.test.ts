import { describe, expect, it } from "vitest";
import { reviewNavigationTiming } from "../models/navigationTimingModel";

describe("navigationTimingModel", () => {
  it("computes navigation milestone durations", () => {
    const review = reviewNavigationTiming({
      navigationType: "reload",
      startTime: 10,
      domInteractive: 810,
      loadEventEnd: 2010,
    });

    expect(review.interactiveMs).toBe(800);
    expect(review.completeMs).toBe(2000);
    expect(review.status).toBe("warning");
  });
});

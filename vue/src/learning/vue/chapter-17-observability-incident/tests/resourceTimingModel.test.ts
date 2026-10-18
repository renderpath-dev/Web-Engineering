import { describe, expect, it } from "vitest";
import { reviewResourceTiming } from "../models/resourceTimingModel";

describe("resourceTimingModel", () => {
  it("removes query strings from resource labels", () => {
    const review = reviewResourceTiming({
      name: "/assets/app.js?cache=redacted",
      initiatorType: "script",
      startTime: 0,
      responseEnd: 700,
      crossOriginLimited: false,
    });

    expect(review.resourceLabel).toBe("/assets/app.js");
    expect(review.status).toBe("warning");
  });
});

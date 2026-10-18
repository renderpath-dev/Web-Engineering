import { describe, expect, it } from "vitest";
import {
  createSafeMarkName,
  reviewMeasureDuration,
} from "../models/performanceMarkModel";

describe("performanceMarkModel", () => {
  it("creates normalized mark names", () => {
    expect(createSafeMarkName("Order Panel", "Start")).toBe(
      "chapter-17:order-panel:start",
    );
  });

  it("classifies duration thresholds", () => {
    expect(reviewMeasureDuration("measure", 80).status).toBe("pass");
    expect(reviewMeasureDuration("measure", 180).status).toBe("warning");
    expect(reviewMeasureDuration("measure", 360).status).toBe("blocked");
  });
});

import { describe, expect, it } from "vitest";
import { reviewWebVital } from "../models/webVitalsBudgetModel";

describe("webVitalsBudgetModel", () => {
  it("classifies LCP budget edges", () => {
    expect(reviewWebVital("LCP", 2400).status).toBe("pass");
    expect(reviewWebVital("LCP", 2500).status).toBe("warning");
    expect(reviewWebVital("LCP", 4000).status).toBe("blocked");
  });

  it("keeps field data flag explicit", () => {
    expect(reviewWebVital("INP", 180, false).fieldData).toBe(false);
  });
});

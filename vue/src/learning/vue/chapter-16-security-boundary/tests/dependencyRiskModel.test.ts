import { describe, expect, it } from "vitest";
import { classifyDependencyRisk } from "../models/dependencyRiskModel";

describe("dependencyRiskModel", () => {
  it("marks rich text dependencies as high risk", () => {
    const review = classifyDependencyRisk({
      packageName: "@scope/rich-text",
      category: "rich-text",
      changesLockfile: false,
    });

    expect(review.risk).toBe("high");
  });

  it("marks lockfile changes as medium risk for standard UI packages", () => {
    const review = classifyDependencyRisk({
      packageName: "@scope/ui-widget",
      category: "general-ui",
      changesLockfile: true,
    });

    expect(review.risk).toBe("medium");
  });
});

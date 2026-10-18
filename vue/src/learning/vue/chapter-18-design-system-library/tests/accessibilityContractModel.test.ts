import { describe, expect, it } from "vitest";
import { findMissingAccessibilityEvidence } from "../models/accessibilityContractModel";

describe("accessibilityContractModel", () => {
  it("requires evidence for each accessibility requirement", () => {
    expect(
      findMissingAccessibilityEvidence({
        componentName: "DsTextField",
        requirements: ["name", "description", "keyboard"],
        verifiedRequirements: ["name"],
      }),
    ).toEqual(["description", "keyboard"]);
  });
});

import { describe, expect, it } from "vitest";
import { isDeprecationPlanComplete } from "../models/deprecationModel";

describe("deprecationModel", () => {
  it("requires replacement and removal schedule", () => {
    expect(
      isDeprecationPlanComplete({
        propName: "colorIntent",
        replacement: "tone",
        firstDeprecatedVersion: "1.4.0",
        plannedRemovalVersion: "2.0.0",
      }),
    ).toBe(true);
  });
});

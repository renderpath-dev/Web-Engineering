import { describe, expect, it } from "vitest";
import { doesVersionPlanMatchImpact, inferSemverImpact } from "../models/versionPlanModel";

describe("versionPlanModel", () => {
  it("infers major impact for removed public export", () => {
    const impact = inferSemverImpact({
      removedExport: true,
      addedExport: false,
      behaviorChanged: false,
    });

    expect(impact).toBe("major");
    expect(
      doesVersionPlanMatchImpact(
        {
          packageName: "@vue-lab/design-system",
          currentVersion: "1.4.2",
          nextVersion: "2.0.0",
          impact: "major",
        },
        impact,
      ),
    ).toBe(true);
  });
});


import { describe, expect, it } from "vitest";
import { getSemverImpact, hasMigrationEvidence } from "../models/versioningModel";

describe("versioningModel", () => {
  it("marks removed props as major changes", () => {
    expect(getSemverImpact({ changeType: "removed-prop", migrationNote: "Use tone." })).toBe(
      "major",
    );
  });

  it("requires migration evidence", () => {
    expect(hasMigrationEvidence({ changeType: "new-prop", migrationNote: "" })).toBe(false);
  });
});

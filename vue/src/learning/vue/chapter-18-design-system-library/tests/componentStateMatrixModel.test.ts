import { describe, expect, it } from "vitest";
import { findMissingComponentStates } from "../models/componentStateMatrixModel";

describe("componentStateMatrixModel", () => {
  it("finds uncovered component states", () => {
    expect(
      findMissingComponentStates({
        componentName: "DsButton",
        states: ["default", "focus"],
      }),
    ).toContain("disabled");
  });
});

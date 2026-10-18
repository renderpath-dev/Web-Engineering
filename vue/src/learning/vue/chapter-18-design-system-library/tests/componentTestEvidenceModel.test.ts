import { describe, expect, it } from "vitest";
import { blocksComponentRelease } from "../models/componentTestEvidenceModel";

describe("componentTestEvidenceModel", () => {
  it("blocks required unknown evidence", () => {
    expect(
      blocksComponentRelease([
        {
          type: "visual-screenshot",
          status: "unknown",
          required: true,
          evidence: "No visual tool output.",
        },
      ]),
    ).toBe(true);
  });
});

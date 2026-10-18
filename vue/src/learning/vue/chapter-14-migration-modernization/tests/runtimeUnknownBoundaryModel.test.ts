import { describe, expect, it } from "vitest";
import { parseUnknownProfilePayload } from "../models/runtimeUnknownBoundaryModel";

describe("runtime unknown boundary model", () => {
  it("parses valid profile payload input", () => {
    expect(
      parseUnknownProfilePayload({
        displayName: "Ada Lovelace",
        role: "Analyst",
      }),
    ).toEqual({
      displayName: "Ada Lovelace",
      role: "Analyst",
    });
  });

  it("rejects invalid profile payload input", () => {
    expect(() => parseUnknownProfilePayload({ displayName: "Ada" })).toThrow(
      "Profile role must be a string",
    );
  });
});

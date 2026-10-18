import { describe, expect, it } from "vitest";
import { findUnsafeCustomizationInputs } from "../models/securityTokenBoundaryModel";

describe("securityTokenBoundaryModel", () => {
  it("blocks raw style and markup customization", () => {
    const unsafe = findUnsafeCustomizationInputs([
      { kind: "token", value: "color.action" },
      { kind: "raw-html", value: "<script></script>" },
    ]);

    expect(unsafe).toHaveLength(1);
    expect(unsafe[0]?.kind).toBe("raw-html");
  });
});

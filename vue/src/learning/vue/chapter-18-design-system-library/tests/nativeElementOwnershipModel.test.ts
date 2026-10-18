import { describe, expect, it } from "vitest";
import { evaluateNativeElementOwnership } from "../models/nativeElementOwnershipModel";

describe("nativeElementOwnershipModel", () => {
  it("blocks interactive components that hide native button behavior", () => {
    expect(
      evaluateNativeElementOwnership({
        componentName: "DsButton",
        expectedElement: "button",
        actualElement: "div",
        interactive: true,
      }),
    ).toBe("fail");
  });
});

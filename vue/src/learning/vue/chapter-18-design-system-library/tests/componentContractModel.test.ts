import { describe, expect, it } from "vitest";
import {
  buttonContract,
  detectBreakingContractChange,
  findContractDocumentationGaps,
} from "../models/componentContractModel";

describe("componentContractModel", () => {
  it("keeps documented public button contract", () => {
    expect(findContractDocumentationGaps(buttonContract)).toEqual([]);
  });

  it("marks removed public props as major changes", () => {
    expect(
      detectBreakingContractChange({
        removedProp: true,
        removedEmit: false,
        removedSlot: false,
        visualDefaultChanged: false,
      }),
    ).toBe("major");
  });
});

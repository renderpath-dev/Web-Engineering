import { describe, expect, it } from "vitest";
import {
  formatProfileLabel,
  migrateLegacyFilterInput,
} from "../modernized/formatProfileValue";

describe("profile formatting migration", () => {
  it("preserves visible profile label output", () => {
    expect(
      formatProfileLabel({
        displayName: " Ada Lovelace ",
        role: " analyst ",
      }),
    ).toBe("Ada Lovelace - ANALYST");
  });

  it("maps legacy filter input into modern function input", () => {
    expect(
      migrateLegacyFilterInput({
        displayName: "Grace Hopper",
        role: "captain",
      }),
    ).toEqual({
      displayName: "Grace Hopper",
      role: "captain",
    });
  });
});

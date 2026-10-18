import { describe, expect, it } from "vitest";
import {
  designSystemImportPolicy,
  isImportPathAllowed,
  listBlockedImportSignals,
} from "../models/importGateModel";

describe("importGateModel", () => {
  it("allows public package entry paths", () => {
    expect(isImportPathAllowed(designSystemImportPolicy, "./css")).toBe(true);
  });

  it("blocks internal module imports", () => {
    expect(isImportPathAllowed(designSystemImportPolicy, "./internal/token-resolver")).toBe(
      false,
    );
    expect(
      listBlockedImportSignals(designSystemImportPolicy, [
        ".",
        "./internal/token-resolver",
      ]),
    ).toEqual(["./internal/token-resolver"]);
  });
});


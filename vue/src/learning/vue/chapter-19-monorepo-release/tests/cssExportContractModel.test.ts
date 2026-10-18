import { describe, expect, it } from "vitest";
import {
  isCssExportReady,
  listCssContractFailures,
} from "../models/cssExportContractModel";

describe("cssExportContractModel", () => {
  it("detects a complete CSS export contract", () => {
    expect(
      isCssExportReady({
        packageName: "@vue-lab/design-system",
        cssEntry: "./css",
        assetPaths: [],
        sideEffectSafe: true,
        consumerEvidenceStatus: "pass",
      }),
    ).toBe(true);
  });

  it("detects missing CSS export evidence", () => {
    expect(
      listCssContractFailures({
        packageName: "@vue-lab/design-system",
        cssEntry: "",
        assetPaths: [],
        sideEffectSafe: true,
        consumerEvidenceStatus: "unknown",
      }),
    ).toEqual(["missing-css-entry", "missing-consumer-style-evidence"]);
  });
});


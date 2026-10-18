import { describe, expect, it } from "vitest";
import {
  countRowsByStatus,
  isMatrixReleaseBlocked,
} from "../models/testBuildMatrixModel";

describe("testBuildMatrixModel", () => {
  it("blocks required unknown matrix rows", () => {
    const rows = [
      {
        packageName: "@vue-lab/admin-app",
        checkName: "consumer-css",
        status: "unknown" as const,
        required: true,
      },
    ];

    expect(isMatrixReleaseBlocked(rows)).toBe(true);
    expect(countRowsByStatus(rows, "unknown")).toBe(1);
  });
});


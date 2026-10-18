import { describe, expect, it } from "vitest";
import {
  isRequiredCiCheckBlocking,
  listBlockingCiChecks,
} from "../models/ciPipelineEvidenceModel";

describe("ciPipelineEvidenceModel", () => {
  it("blocks required unknown CI check", () => {
    const check = {
      packageName: "@vue-lab/admin-app",
      stage: "artifact" as const,
      status: "unknown" as const,
      required: true,
      evidenceId: "missing-artifact",
    };

    expect(isRequiredCiCheckBlocking(check)).toBe(true);
    expect(listBlockingCiChecks([check])).toEqual([check]);
  });
});


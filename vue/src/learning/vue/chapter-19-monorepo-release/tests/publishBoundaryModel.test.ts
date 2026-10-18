import { describe, expect, it } from "vitest";
import {
  isPublishBoundaryReady,
  listPublishBoundaryGaps,
} from "../models/publishBoundaryModel";

describe("publishBoundaryModel", () => {
  it("blocks publish when provenance or CI evidence is unknown", () => {
    const readiness = {
      packageName: "@vue-lab/design-system",
      packageMetadataReady: true,
      remoteAccessKnown: false,
      secretState: "unknown" as const,
      ciEvidenceStatus: "unknown" as const,
    };

    expect(isPublishBoundaryReady(readiness)).toBe(false);
    expect(listPublishBoundaryGaps(readiness)).toEqual([
      "remote-access",
      "secret-state",
      "ci-evidence",
    ]);
  });
});


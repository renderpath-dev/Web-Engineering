import { describe, expect, it } from "vitest";
import {
  isConsumerSmokeReady,
  listMissingConsumerSmokeEvidence,
} from "../models/consumerSmokeTestModel";

describe("consumerSmokeTestModel", () => {
  it("blocks release when CSS evidence is missing", () => {
    const result = {
      consumerPackage: "@vue-lab/admin-app",
      libraryPackage: "@vue-lab/design-system",
      importResult: "pass" as const,
      renderResult: "pass" as const,
      cssResult: "unknown" as const,
    };

    expect(isConsumerSmokeReady(result)).toBe(false);
    expect(listMissingConsumerSmokeEvidence(result)).toEqual(["css-result"]);
  });
});


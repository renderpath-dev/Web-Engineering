import { describe, expect, it } from "vitest";
import { rankAuthStorageRisk } from "../models/authStorageRiskModel";

describe("authStorageRiskModel", () => {
  it("sorts storage options from lower risk to higher risk", () => {
    const ranked = rankAuthStorageRisk();

    expect(ranked[0].kind).toBe("http-only-cookie");
    expect(ranked.at(-1)?.kind).toBe("local-storage");
  });
});

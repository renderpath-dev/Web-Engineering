import { describe, expect, it } from "vitest";
import { chooseMigrationEntry } from "../models/incrementalMigrationAdapterModel";

describe("incremental migration adapter model", () => {
  it("routes enabled flags to the modern entry", () => {
    expect(
      chooseMigrationEntry({
        key: "chapter-14-profile",
        enabled: true,
        fallbackEntry: "legacy",
      }),
    ).toBe("modern");
  });

  it("keeps the fallback entry when the flag is off", () => {
    expect(
      chooseMigrationEntry({
        key: "chapter-14-profile",
        enabled: false,
        fallbackEntry: "legacy",
      }),
    ).toBe("legacy");
  });
});

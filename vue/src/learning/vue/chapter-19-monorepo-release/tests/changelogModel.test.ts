import { describe, expect, it } from "vitest";
import { isChangelogEntryComplete, requiresMigrationNote } from "../models/changelogModel";

describe("changelogModel", () => {
  it("requires migration notes for breaking changelog entries", () => {
    const entry = {
      packageName: "@vue-lab/design-system",
      version: "2.0.0",
      changes: ["Remove legacy button alias"],
      breaking: true,
    };

    expect(isChangelogEntryComplete(entry)).toBe(true);
    expect(requiresMigrationNote(entry)).toBe(true);
  });
});


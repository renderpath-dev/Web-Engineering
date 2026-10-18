import { describe, expect, it } from "vitest";
import { isMigrationNoteComplete } from "../models/migrationNoteModel";

describe("migrationNoteModel", () => {
  it("blocks breaking change without steps", () => {
    expect(
      isMigrationNoteComplete({
        packageName: "@vue-lab/design-system",
        fromVersion: "1.4.2",
        toVersion: "2.0.0",
        breakingChange: true,
        steps: [],
        owner: "Design Systems",
      }),
    ).toBe(false);
  });
});


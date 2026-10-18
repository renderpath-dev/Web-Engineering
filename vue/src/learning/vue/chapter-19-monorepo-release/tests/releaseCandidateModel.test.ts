import { describe, expect, it } from "vitest";
import { isReleaseCandidateBlocked } from "../models/releaseCandidateModel";

describe("releaseCandidateModel", () => {
  it("blocks major candidate without migration note", () => {
    expect(
      isReleaseCandidateBlocked({
        id: "rc-19-local",
        changedPackages: ["@vue-lab/design-system"],
        versionPlanComplete: true,
        changelogComplete: true,
        migrationNoteComplete: false,
        approvals: [{ owner: "Design Systems", approved: true }],
      }),
    ).toBe(true);
  });
});


import { describe, expect, it } from "vitest";
import { evaluateMonorepoReleaseGate } from "../models/monorepoReleaseGateModel";

describe("monorepoReleaseGateModel", () => {
  it("aggregates CI, consumer, candidate, owner, and issue blockers", () => {
    const result = evaluateMonorepoReleaseGate({
      ciChecks: [
        {
          packageName: "@vue-lab/admin-app",
          stage: "build",
          status: "unknown",
          required: true,
          evidenceId: "missing-build-output",
        },
      ],
      consumerSmoke: {
        consumerPackage: "@vue-lab/admin-app",
        libraryPackage: "@vue-lab/design-system",
        importResult: "pass",
        renderResult: "pass",
        cssResult: "unknown",
      },
      releaseCandidate: {
        id: "rc-19-local",
        changedPackages: ["@vue-lab/design-system"],
        versionPlanComplete: true,
        changelogComplete: true,
        migrationNoteComplete: false,
        approvals: [{ owner: "Design Systems", approved: true }],
      },
      ownershipRules: [
        {
          packageName: "@vue-lab/admin-app",
          owner: "App Experience",
          requiredReviewer: "Product Surface Lead",
          riskArea: "consumer rendering",
          approved: false,
        },
      ],
      issues: [
        {
          id: "MR-19-1",
          title: "CSS smoke evidence missing",
          packageName: "@vue-lab/admin-app",
          severity: "high",
          open: true,
        },
      ],
    });

    expect(result.blocked).toBe(true);
    expect(result.failureSignals).toEqual([
      "ci-check-blocked",
      "consumer-smoke-incomplete",
      "release-candidate-blocked",
      "owner-approval-missing",
      "high-issue-open",
    ]);
  });
});


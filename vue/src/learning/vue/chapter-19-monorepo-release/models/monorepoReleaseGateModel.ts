import type { ConsumerSmokeResult } from "./consumerSmokeTestModel";
import { isConsumerSmokeReady } from "./consumerSmokeTestModel";
import type { CiPipelineCheck } from "./ciPipelineEvidenceModel";
import { listBlockingCiChecks } from "./ciPipelineEvidenceModel";
import type { MonorepoIssue } from "./monorepoIssueModel";
import { listOpenHighIssues } from "./monorepoIssueModel";
import type { OwnershipReviewRule } from "./ownershipReviewModel";
import { isOwnershipApproved } from "./ownershipReviewModel";
import type { ReleaseCandidate } from "./releaseCandidateModel";
import { isReleaseCandidateBlocked } from "./releaseCandidateModel";

export interface MonorepoReleaseGateInput {
  readonly ciChecks: readonly CiPipelineCheck[];
  readonly consumerSmoke: ConsumerSmokeResult;
  readonly releaseCandidate: ReleaseCandidate;
  readonly ownershipRules: readonly OwnershipReviewRule[];
  readonly issues: readonly MonorepoIssue[];
}

export interface MonorepoReleaseGateResult {
  readonly blocked: boolean;
  readonly failureSignals: readonly string[];
}

export function evaluateMonorepoReleaseGate(
  input: MonorepoReleaseGateInput,
): MonorepoReleaseGateResult {
  const failureSignals: string[] = [];

  if (listBlockingCiChecks(input.ciChecks).length > 0) {
    failureSignals.push("ci-check-blocked");
  }

  if (!isConsumerSmokeReady(input.consumerSmoke)) {
    failureSignals.push("consumer-smoke-incomplete");
  }

  if (isReleaseCandidateBlocked(input.releaseCandidate)) {
    failureSignals.push("release-candidate-blocked");
  }

  if (!isOwnershipApproved(input.ownershipRules)) {
    failureSignals.push("owner-approval-missing");
  }

  if (listOpenHighIssues(input.issues).length > 0) {
    failureSignals.push("high-issue-open");
  }

  return {
    blocked: failureSignals.length > 0,
    failureSignals,
  };
}


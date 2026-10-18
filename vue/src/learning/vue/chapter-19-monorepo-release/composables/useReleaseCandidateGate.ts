import { computed, ref } from "vue";
import { ciPipelineChecks } from "../models/ciPipelineEvidenceModel";
import { consumerSmokeResult } from "../models/consumerSmokeTestModel";
import { monorepoIssues } from "../models/monorepoIssueModel";
import { evaluateMonorepoReleaseGate } from "../models/monorepoReleaseGateModel";
import { ownershipReviewRules } from "../models/ownershipReviewModel";
import { releaseCandidate } from "../models/releaseCandidateModel";

export function useReleaseCandidateGate() {
  const reviewerOverride = ref(false);
  const gateInput = computed(() => ({
    ciChecks: ciPipelineChecks,
    consumerSmoke: consumerSmokeResult,
    releaseCandidate,
    ownershipRules: ownershipReviewRules.map((rule) => ({
      ...rule,
      approved: rule.approved || reviewerOverride.value,
    })),
    issues: monorepoIssues,
  }));
  const gateResult = computed(() => evaluateMonorepoReleaseGate(gateInput.value));

  function approveReviewerGate(): void {
    reviewerOverride.value = true;
  }

  return {
    gateResult,
    reviewerOverride,
    approveReviewerGate,
  };
}


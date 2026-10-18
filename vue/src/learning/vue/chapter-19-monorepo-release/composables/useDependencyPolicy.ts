import { computed } from "vue";
import {
  dependencyPolicies,
  isDependencyPolicyReviewRequired,
  isWorkspaceProtocol,
} from "../models/dependencyPolicyModel";
import { lockfileChange, requiresLockfileReview } from "../models/lockfilePolicyModel";

export function useDependencyPolicy() {
  const reviewRequired = computed(() =>
    dependencyPolicies.filter(isDependencyPolicyReviewRequired),
  );
  const workspaceProtocolRows = computed(() => dependencyPolicies.filter(isWorkspaceProtocol));
  const lockfileReviewRequired = computed(() => requiresLockfileReview(lockfileChange));

  return {
    reviewRequired,
    workspaceProtocolRows,
    lockfileReviewRequired,
  };
}


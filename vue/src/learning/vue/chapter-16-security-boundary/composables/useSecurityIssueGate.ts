import { computed } from "vue";
import {
  canReleaseSecurityWork,
  getBlockingSecurityIssues,
  type SecurityIssue,
} from "../models/securityIssueModel";

export function useSecurityIssueGate(issues: ReadonlyArray<SecurityIssue>) {
  const blockingIssues = computed(() => getBlockingSecurityIssues(issues));
  const releaseAllowed = computed(() => canReleaseSecurityWork(issues));

  return {
    blockingIssues,
    releaseAllowed,
  };
}

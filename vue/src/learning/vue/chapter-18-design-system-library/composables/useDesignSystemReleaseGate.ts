import { computed, ref } from "vue";
import {
  isDesignSystemReleaseBlocked,
  type DesignSystemReleaseGate,
} from "../models/designSystemIssueModel";

export function useDesignSystemReleaseGate(initialGate: DesignSystemReleaseGate) {
  const gate = ref<DesignSystemReleaseGate>(initialGate);

  const blocked = computed(() => isDesignSystemReleaseBlocked(gate.value));

  function setTestsPassing(testsPassing: boolean): void {
    gate.value = {
      ...gate.value,
      testsPassing,
    };
  }

  return {
    gate,
    blocked,
    setTestsPassing,
  };
}

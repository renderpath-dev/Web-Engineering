import { computed, ref } from "vue";
import {
  findMissingComponentStates,
  type ComponentStateCoverage,
  type ComponentStateName,
} from "../models/componentStateMatrixModel";

export function useComponentStateMatrix(initialCoverage: ComponentStateCoverage) {
  const coverage = ref<ComponentStateCoverage>(initialCoverage);

  const missingStates = computed(() => findMissingComponentStates(coverage.value));

  function addState(state: ComponentStateName): void {
    if (coverage.value.states.includes(state)) {
      return;
    }

    coverage.value = {
      ...coverage.value,
      states: [...coverage.value.states, state],
    };
  }

  return {
    coverage,
    missingStates,
    addState,
  };
}

import { computed, ref } from "vue";
import {
  createComponentFallbackState,
  shouldPropagateError,
  type ComponentFallbackState,
} from "../models/vueErrorBoundaryModel";
import { normalizeErrorMessage } from "../models/errorTelemetryModel";

export function useVueErrorBoundary() {
  const fallbackState = ref<ComponentFallbackState>({
    hasError: false,
    message: "",
    reportCreated: false,
    propagation: "propagate-to-app",
  });
  const propagationRequired = computed(() => shouldPropagateError(fallbackState.value));

  function captureError(error: unknown, stopPropagation: boolean): void {
    fallbackState.value = createComponentFallbackState({
      message: normalizeErrorMessage(error),
      reportCreated: true,
      stopPropagation,
    });
  }

  function resetBoundary(): void {
    fallbackState.value = {
      hasError: false,
      message: "",
      reportCreated: false,
      propagation: "propagate-to-app",
    };
  }

  return {
    fallbackState,
    propagationRequired,
    captureError,
    resetBoundary,
  };
}

import { computed, ref } from "vue";
import { createEscapedPreview } from "../models/escapedRenderingModel";

export function useSafeTextPreview(initialRawValue = "Guest <student>") {
  const rawValue = ref(initialRawValue);
  const preview = computed(() => createEscapedPreview(rawValue.value, "text"));

  function updateRawValue(nextValue: string): void {
    rawValue.value = nextValue;
  }

  return {
    rawValue,
    preview,
    updateRawValue,
  };
}

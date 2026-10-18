import { computed } from "vue";
import {
  reviewReleaseHealth,
  type ReleaseHealthSignal,
} from "../models/releaseHealthModel";

export function useReleaseHealthGate(signal: ReleaseHealthSignal) {
  const review = computed(() => reviewReleaseHealth(signal));
  const blocked = computed(() => !review.value.releaseAllowed);

  return {
    review,
    blocked,
  };
}

import { onMounted, onUnmounted, ref } from "vue";
import { createMotionPolicy, type MotionPolicy } from "../models/reducedMotionModel";

export function usePrefersReducedMotion() {
  const policy = ref<MotionPolicy>(createMotionPolicy("no-preference"));
  let mediaQuery: MediaQueryList | null = null;

  function updatePolicy(matches: boolean): void {
    policy.value = createMotionPolicy(matches ? "reduce" : "no-preference");
  }

  onMounted(() => {
    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    updatePolicy(mediaQuery.matches);
    mediaQuery.addEventListener("change", (event) => {
      updatePolicy(event.matches);
    });
  });

  onUnmounted(() => {
    mediaQuery = null;
  });

  return {
    policy,
  };
}


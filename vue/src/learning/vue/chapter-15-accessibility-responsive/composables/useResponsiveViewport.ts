import { onMounted, onUnmounted, ref } from "vue";
import {
  evaluateViewport,
  type ViewportResult,
} from "../models/responsiveVerificationModel";

export function useResponsiveViewport() {
  const width = ref(1024);
  const result = ref<ViewportResult>(
    evaluateViewport({
      width: width.value,
      hasHorizontalOverflow: false,
      touchTargetsPass: true,
      navigationOperable: true,
    }),
  );

  function updateWidth(): void {
    width.value = window.innerWidth;
    result.value = evaluateViewport({
      width: width.value,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      touchTargetsPass: true,
      navigationOperable: true,
    });
  }

  onMounted(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateWidth);
  });

  return {
    width,
    result,
  };
}


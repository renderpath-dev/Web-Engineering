import { ref } from "vue";
import {
  createSafeMarkName,
  reviewMeasureDuration,
  type PerformanceMeasureReview,
} from "../models/performanceMarkModel";

export function usePerformanceMarks(performanceSource: Performance = performance) {
  const measures = ref<ReadonlyArray<PerformanceMeasureReview>>([]);

  function markFeature(featureName: string, phase: string): string {
    const markName = createSafeMarkName(featureName, phase);
    performanceSource.mark(markName);

    return markName;
  }

  function measureFeature(name: string, startMark: string, endMark: string): void {
    try {
      performanceSource.measure(name, startMark, endMark);
      const entries = performanceSource.getEntriesByName(name, "measure");
      const latestEntry = entries.at(-1);
      const durationMs = latestEntry?.duration ?? 0;

      measures.value = [...measures.value, reviewMeasureDuration(name, durationMs)];
    } catch {
      measures.value = [...measures.value, reviewMeasureDuration(name, 0)];
    }
  }

  function clearChapterMarks(): void {
    performanceSource.clearMarks();
    performanceSource.clearMeasures();
    measures.value = [];
  }

  return {
    measures,
    markFeature,
    measureFeature,
    clearChapterMarks,
  };
}

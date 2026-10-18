import { computed, ref } from "vue";
import { shouldSampleTelemetryEvent } from "../models/telemetrySamplingModel";
import type { TelemetryEvent } from "../models/telemetryEventModel";

export function useTelemetrySampling(event: TelemetryEvent) {
  const sampleRate = ref(0.25);
  const sequenceNumber = ref(1);
  const decision = computed(() =>
    shouldSampleTelemetryEvent(event, sampleRate.value, sequenceNumber.value),
  );

  function advanceSequence(): void {
    sequenceNumber.value += 1;
  }

  return {
    sampleRate,
    sequenceNumber,
    decision,
    advanceSequence,
  };
}

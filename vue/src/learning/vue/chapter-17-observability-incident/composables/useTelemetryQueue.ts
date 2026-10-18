import { ref } from "vue";
import {
  createTelemetryQueueState,
  drainTelemetryQueue,
  enqueueTelemetryEvent,
  type TelemetryQueueState,
} from "../models/offlineTelemetryQueueModel";
import type { TelemetryEvent } from "../models/telemetryEventModel";

export function useTelemetryQueue(maxLength = 5) {
  const queueState = ref<TelemetryQueueState>(createTelemetryQueueState(maxLength));

  function enqueue(event: TelemetryEvent): void {
    queueState.value = enqueueTelemetryEvent(queueState.value, event);
  }

  function drain(): void {
    queueState.value = drainTelemetryQueue(queueState.value);
  }

  return {
    queueState,
    enqueue,
    drain,
  };
}

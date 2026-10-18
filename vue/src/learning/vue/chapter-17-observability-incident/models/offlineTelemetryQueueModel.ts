import type { TelemetryEvent } from "./telemetryEventModel";

export interface TelemetryQueueState {
  readonly events: ReadonlyArray<TelemetryEvent>;
  readonly maxLength: number;
  readonly droppedCount: number;
  readonly dropReason: string;
}

export function createTelemetryQueueState(maxLength = 5): TelemetryQueueState {
  return {
    events: [],
    maxLength,
    droppedCount: 0,
    dropReason: "No events dropped.",
  };
}

export function enqueueTelemetryEvent(
  state: TelemetryQueueState,
  event: TelemetryEvent,
): TelemetryQueueState {
  const nextEvents = [...state.events, event];

  if (nextEvents.length <= state.maxLength) {
    return {
      ...state,
      events: nextEvents,
    };
  }

  return {
    ...state,
    events: nextEvents.slice(1),
    droppedCount: state.droppedCount + 1,
    dropReason: "Queue limit reached; oldest event dropped.",
  };
}

export function drainTelemetryQueue(state: TelemetryQueueState): TelemetryQueueState {
  return {
    ...state,
    events: [],
  };
}

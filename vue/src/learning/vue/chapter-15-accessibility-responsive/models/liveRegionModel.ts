export type LiveRegionPriority = "polite" | "assertive";

export interface LiveRegionMessage {
  readonly id: string;
  readonly text: string;
  readonly priority: LiveRegionPriority;
  readonly createdAtMs: number;
}

export function shouldAnnounceMessage(
  previous: LiveRegionMessage | null,
  next: LiveRegionMessage,
  minimumIntervalMs: number,
): boolean {
  if (!previous) {
    return true;
  }

  if (next.priority === "assertive") {
    return true;
  }

  return next.createdAtMs - previous.createdAtMs >= minimumIntervalMs;
}

export function createLiveRegionText(message: LiveRegionMessage | null): string {
  return message ? message.text : "";
}


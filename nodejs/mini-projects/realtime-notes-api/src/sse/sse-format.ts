import type { StoredRealtimeEvent } from "../realtime/events.js";
import { toClientRealtimeEvent } from "../realtime/events.js";

export type SseEvent = {
  id?: string;
  event?: string;
  retry?: number;
  data: unknown;
};

export function formatSseEvent(input: SseEvent): string {
  const lines: string[] = [];
  if (input.id) lines.push(`id: ${input.id}`);
  if (input.event) lines.push(`event: ${input.event}`);
  if (input.retry !== undefined) lines.push(`retry: ${input.retry}`);

  const serialized = typeof input.data === "string" ? input.data : JSON.stringify(input.data);
  for (const line of serialized.split(/\r?\n/)) {
    lines.push(`data: ${line}`);
  }

  return `${lines.join("\n")}\n\n`;
}

export function formatSseComment(comment: string): string {
  return `: ${comment}\n\n`;
}

export function formatStoredRealtimeEvent(event: StoredRealtimeEvent): string {
  const clientEvent = toClientRealtimeEvent(event);
  return formatSseEvent({
    id: event.sequence,
    event: clientEvent.type,
    data: clientEvent
  });
}

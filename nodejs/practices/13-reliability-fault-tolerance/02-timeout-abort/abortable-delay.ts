import { setTimeout as delay } from "node:timers/promises";

export async function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  await delay(ms, undefined, { signal });
}

import { setTimeout as delay } from "node:timers/promises";
import { abortTotal } from "../observability/reliability-metrics.js";

export async function abortableDelay(ms: number, signal?: AbortSignal, operation = "delay"): Promise<void> {
  try {
    await delay(ms, undefined, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      abortTotal.inc({ operation });
    }
    throw error;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

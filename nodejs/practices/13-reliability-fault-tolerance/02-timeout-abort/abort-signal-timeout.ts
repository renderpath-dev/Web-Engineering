import { setTimeout as delay } from "node:timers/promises";

export async function runBoundedDelay(timeoutMs: number): Promise<string> {
  const signal = AbortSignal.timeout(timeoutMs);
  await delay(timeoutMs + 20, undefined, { signal });
  return "completed";
}

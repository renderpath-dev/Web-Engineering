
export interface CapacityVocabulary {
  latencyMs: number;
  requestsPerSecond: number;
  concurrency: number;
  saturated: boolean;
}

export function classifyCapacitySignal(input: CapacityVocabulary): string {
  if (input.saturated && input.latencyMs > 500) return "capacity boundary";
  if (input.requestsPerSecond < input.concurrency) return "queueing risk";
  return "baseline stable";
}

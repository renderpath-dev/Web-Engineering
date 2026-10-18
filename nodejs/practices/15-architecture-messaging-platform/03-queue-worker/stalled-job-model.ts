export type StalledJobSignal = {
  lockLost: boolean;
  processorBlocked: boolean;
  workerCrashed: boolean;
};

export function explainStalledJob(signal: StalledJobSignal): string {
  if (signal.lockLost && signal.processorBlocked) return "processor-blocked-event-loop";
  if (signal.lockLost && signal.workerCrashed) return "worker-crash-or-restart";
  return "no-stalled-signal";
}

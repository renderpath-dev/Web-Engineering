export const jobStates = ["queued", "active", "retrying", "completed", "failed", "stalled"] as const;
export type JobState = (typeof jobStates)[number];

const allowedTransitions = new Map<JobState, JobState[]>([
  ["queued", ["active", "failed"]],
  ["active", ["completed", "failed", "retrying", "stalled"]],
  ["retrying", ["queued", "failed"]],
  ["stalled", ["queued", "failed"]],
  ["completed", []],
  ["failed", ["queued"]]
]);

export function canTransitionJob(from: JobState, to: JobState): boolean {
  return allowedTransitions.get(from)?.includes(to) ?? false;
}

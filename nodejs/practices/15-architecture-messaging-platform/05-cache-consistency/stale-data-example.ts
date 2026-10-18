export type SummarySnapshot = {
  taskCount: number;
  generatedAtMs: number;
};

export function isStale(snapshot: SummarySnapshot, currentTaskCount: number): boolean {
  return snapshot.taskCount !== currentTaskCount;
}

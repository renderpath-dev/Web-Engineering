export function calculateFailureRate(failedJobs: number, completedJobs: number): number {
  const total = failedJobs + completedJobs;
  if (total === 0) return 0;
  return failedJobs / total;
}

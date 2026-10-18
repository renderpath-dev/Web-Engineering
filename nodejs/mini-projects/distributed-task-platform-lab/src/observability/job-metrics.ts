import { jobCompletedCounter, jobDurationHistogram, jobFailedCounter, jobQueuedCounter, jobRetryCounter, jobStartedCounter } from "./metrics.js";

export function recordJobQueued(jobName: string): void {
  jobQueuedCounter.inc({ job_name: jobName });
}

export function recordJobStarted(jobName: string): void {
  jobStartedCounter.inc({ job_name: jobName });
}

export function recordJobCompleted(jobName: string, durationMs: number): void {
  jobCompletedCounter.inc({ job_name: jobName });
  jobDurationHistogram.observe({ job_name: jobName, result: "completed" }, durationMs / 1000);
}

export function recordJobFailed(jobName: string, failureClass: string, durationMs: number): void {
  jobFailedCounter.inc({ job_name: jobName, failure_class: failureClass });
  jobDurationHistogram.observe({ job_name: jobName, result: "failed" }, durationMs / 1000);
}

export function recordJobRetry(jobName: string): void {
  jobRetryCounter.inc({ job_name: jobName });
}

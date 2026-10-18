export type WorkSize = "small" | "medium";

export interface CpuTaskResult {
  size: WorkSize;
  iterations: number;
  result: number;
  durationMs: number;
  mode: "sync" | "worker";
}

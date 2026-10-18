import { pathToFileURL } from "node:url";
import { runLoadBaseline } from "./load-baseline.js";

export interface PerformanceBudget {
  minRequestsPerSecond: number;
  maxLatencyP95: number;
  maxErrors: number;
  maxTimeouts: number;
}

export const defaultBudget: PerformanceBudget = {
  minRequestsPerSecond: 20,
  maxLatencyP95: 500,
  maxErrors: 0,
  maxTimeouts: 0
};

export async function checkBenchmarkBudget(budget = defaultBudget): Promise<void> {
  const result = await runLoadBaseline();
  const violations = [
    result.requestsPerSecond < budget.minRequestsPerSecond ? "requestsPerSecond" : undefined,
    result.latencyP95 > budget.maxLatencyP95 ? "latencyP95" : undefined,
    result.errors > budget.maxErrors ? "errors" : undefined,
    result.timeouts > budget.maxTimeouts ? "timeouts" : undefined
  ].filter(Boolean);

  if (violations.length > 0) {
    throw new Error("Budget violated: " + violations.join(", "));
  }

  console.log(JSON.stringify({ ok: true, result, budget }));
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  checkBenchmarkBudget().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

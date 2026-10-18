export type RunbookEntry = {
  alertName: string;
  symptom: string;
  firstChecks: string[];
  avoid: string[];
};

export const runbook: RunbookEntry[] = [
  {
    alertName: "HighHttpErrorBudgetBurn",
    symptom: "User-visible HTTP failures are consuming the error budget.",
    firstChecks: ["Check /v1/slo/report", "Check recent 5xx route patterns", "Inspect dependency readiness"],
    avoid: ["Do not page on each raw error", "Do not add user identifiers to metric labels"]
  },
  {
    alertName: "HighLatencyP95",
    symptom: "The p95 request duration is above the demo latency SLO.",
    firstChecks: ["Check route pattern histogram buckets", "Check event loop delay", "Check upstream dependency latency"],
    avoid: ["Do not use raw URLs as labels", "Do not hide slow requests behind liveness"]
  },
  {
    alertName: "DependencyReadinessFailing",
    symptom: "A required dependency is failing readiness checks.",
    firstChecks: ["Check PostgreSQL readiness", "Check Redis readiness", "Check network service names"],
    avoid: ["Do not move dependency checks into liveness", "Do not restart on external dependency failure"]
  },
  {
    alertName: "HighEventLoopDelay",
    symptom: "The Node event loop is delayed by CPU pressure or synchronous work.",
    firstChecks: ["Check CPU limits", "Inspect synchronous handlers", "Reduce blocking simulation load"],
    avoid: ["Do not assume more replicas fix blocking code", "Do not use worker_threads for ordinary I/O"]
  }
];

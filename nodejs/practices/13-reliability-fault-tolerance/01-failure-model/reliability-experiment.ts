export interface ReliabilityExperiment {
  name: string;
  failureSource: string;
  policyBoundary: "timeout" | "retry" | "fallback" | "reject";
  observableSignal: string;
  allowedRecovery: string;
  verificationCommand: string;
}

export function planReliabilityExperiment(name: string): ReliabilityExperiment {
  return {
    name,
    failureSource: "slow dependency",
    policyBoundary: "timeout",
    observableSignal: "timeout_total increments",
    allowedRecovery: "return problem details without duplicate side effects",
    verificationCommand: "npm run reliability:check"
  };
}

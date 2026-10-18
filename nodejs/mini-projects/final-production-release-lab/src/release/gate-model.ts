export type GateStatus = "PASS" | "FAIL" | "UNKNOWN";
export type ReleaseDecision = "promote" | "hold" | "rollback";
export type ReleasePhase = "pre-release" | "post-release";

export interface GateSignal {
  name: string;
  status: GateStatus;
  required: boolean;
  critical: boolean;
  evidence: string;
  reason?: string;
}

export interface ReleaseEvaluation {
  decision: ReleaseDecision;
  phase: ReleasePhase;
  summary: string;
  signals: GateSignal[];
}

export function evaluateReleaseGate(input: { phase: ReleasePhase; signals: GateSignal[] }): ReleaseEvaluation {
  const requiredFailures = input.signals.filter((signal) => signal.required && signal.status === "FAIL");
  const criticalFailures = input.signals.filter((signal) => signal.critical && signal.status === "FAIL");
  const missingRequiredEvidence = input.signals.filter((signal) => signal.required && signal.status === "UNKNOWN");

  if (input.phase === "post-release" && (criticalFailures.length > 0 || requiredFailures.some((signal) => signal.name === "smoke"))) {
    return {
      decision: "rollback",
      phase: input.phase,
      summary: "A post-release critical gate failed, so rollback is the safest release decision.",
      signals: input.signals
    };
  }

  if (requiredFailures.length > 0 || criticalFailures.length > 0) {
    return {
      decision: "hold",
      phase: input.phase,
      summary: "A required release gate failed, so the artifact must not be promoted.",
      signals: input.signals
    };
  }

  if (missingRequiredEvidence.length > 0) {
    return {
      decision: "hold",
      phase: input.phase,
      summary: "Required evidence is missing, and UNKNOWN is not a passing release signal.",
      signals: input.signals
    };
  }

  return {
    decision: "promote",
    phase: input.phase,
    summary: "All required release gates have explicit passing evidence.",
    signals: input.signals
  };
}

export function createDefaultSignals(status: GateStatus): GateSignal[] {
  const names = [
    "typecheck",
    "build",
    "test",
    "audit",
    "secret-scan",
    "workflow-security",
    "docker-hardening",
    "kubernetes-security",
    "smoke",
    "slo-continuity",
    "manual-review"
  ];

  return names.map((name) => ({
    name,
    status,
    required: true,
    critical: ["audit", "secret-scan", "workflow-security", "smoke"].includes(name),
    evidence: "local validation signal"
  }));
}

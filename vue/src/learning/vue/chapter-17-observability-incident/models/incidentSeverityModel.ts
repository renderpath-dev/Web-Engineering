export type IncidentSeverity = "sev1" | "sev2" | "sev3" | "sev4";

export interface IncidentSignal {
  readonly affectedUserPercent: number;
  readonly criticalPathDown: boolean;
  readonly durationMinutes: number;
}

export function classifyIncidentSeverity(signal: IncidentSignal): IncidentSeverity {
  if (signal.criticalPathDown || signal.affectedUserPercent >= 50) {
    return "sev1";
  }

  if (signal.affectedUserPercent >= 10 || signal.durationMinutes >= 60) {
    return "sev2";
  }

  if (signal.affectedUserPercent > 0 || signal.durationMinutes >= 15) {
    return "sev3";
  }

  return "sev4";
}

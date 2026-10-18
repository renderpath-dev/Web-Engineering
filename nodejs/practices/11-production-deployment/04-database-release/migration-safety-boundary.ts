export interface MigrationRisk {
  change: string;
  destructive: boolean;
  requiresBackfill: boolean;
  compatibleWithOldCode: boolean;
}

export function requiresManualReleasePlan(risk: MigrationRisk): boolean {
  return risk.destructive || risk.requiresBackfill || !risk.compatibleWithOldCode;
}

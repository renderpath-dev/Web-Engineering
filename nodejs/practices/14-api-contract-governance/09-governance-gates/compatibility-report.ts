export type CompatibilityReport = {
  compatible: number;
  potentiallyCompatible: number;
  breaking: number;
};

export function reportHasBreakingChanges(report: CompatibilityReport): boolean {
  return report.breaking > 0;
}

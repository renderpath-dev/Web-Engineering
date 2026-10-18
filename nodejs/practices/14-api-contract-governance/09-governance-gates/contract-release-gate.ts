export type ReleaseGateResult = {
  passed: boolean;
  failures: string[];
};

export function assertReleaseGate(result: ReleaseGateResult): void {
  if (!result.passed) throw new Error(result.failures.join("; "));
}

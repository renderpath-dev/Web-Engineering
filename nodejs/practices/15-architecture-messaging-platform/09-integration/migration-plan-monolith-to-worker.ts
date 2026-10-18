export type MigrationStep = {
  name: string;
  reversible: boolean;
  observableSignal: string;
};

export function allMigrationStepsAreObservable(steps: MigrationStep[]): boolean {
  return steps.every((step) => step.reversible && step.observableSignal.length > 0);
}

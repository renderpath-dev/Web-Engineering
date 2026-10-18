export type CompatWarningSeverity = "info" | "warning" | "blocker";

export interface CompatWarningWorkflowStep {
  readonly id: string;
  readonly affectedComponentOrRoute: string;
  readonly officialBreakingChangeTopic: string;
  readonly owner: string;
  readonly severity: CompatWarningSeverity;
  readonly action: string;
  readonly evidencePath: string;
  readonly rollbackPath: string;
}

export const compatWarningWorkflowSteps: ReadonlyArray<CompatWarningWorkflowStep> = [
  {
    id: "COMPAT-GLOBAL-API",
    affectedComponentOrRoute: "chapter-01-application-boundary/main.ts",
    officialBreakingChangeTopic: "Global API application instance",
    owner: "app bootstrap owner",
    severity: "info",
    action: "Move global registration into createApp and keep plugin order evidence.",
    evidencePath: "models/compatWarningWorkflowModel.ts",
    rollbackPath: "Keep the previous bootstrap entry until app smoke passes.",
  },
  {
    id: "COMPAT-V-MODEL",
    affectedComponentOrRoute: "legacy-shaped/legacyTemplateDirectiveExamples.ts",
    officialBreakingChangeTopic: "v-model component contract",
    owner: "component public contract owner",
    severity: "warning",
    action: "Replace value/input with modelValue/update:modelValue behind a wrapper.",
    evidencePath: "tests/templateDirectiveMigration.test.ts",
    rollbackPath: "Emit both event contracts until all callers move.",
  },
  {
    id: "COMPAT-INSTANCE-API",
    affectedComponentOrRoute: "legacy-shaped/legacyRemovedApisModel.ts",
    officialBreakingChangeTopic: "Removed instance APIs",
    owner: "component owner",
    severity: "blocker",
    action: "Replace child lookup, dynamic fields, teardown, events, and test props.",
    evidencePath: "tests/removedApiReplacement.test.ts",
    rollbackPath: "Keep the explicit registry and cleanup adapter until callers are moved.",
  },
  {
    id: "COMPAT-WATCH-ARRAY",
    affectedComponentOrRoute: "modernized/watchArrayMigration.ts",
    officialBreakingChangeTopic: "Array watchers",
    owner: "reactivity owner",
    severity: "info",
    action: "Choose replacement-only or deep-mutation mode based on the old callback intent.",
    evidencePath: "tests/watchArrayMigration.test.ts",
    rollbackPath: "Keep the old watcher callback behind a named adapter during rollout.",
  },
];

export function getBlockingCompatSteps(
  steps: ReadonlyArray<CompatWarningWorkflowStep>,
): ReadonlyArray<CompatWarningWorkflowStep> {
  return steps.filter((step) => step.severity === "blocker");
}

export function getCompatWarningById(id: string): CompatWarningWorkflowStep {
  const step = compatWarningWorkflowSteps.find((entry) => entry.id === id);

  if (!step) {
    throw new Error(`Missing compatibility warning: ${id}`);
  }

  return step;
}

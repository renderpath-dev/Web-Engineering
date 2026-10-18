export interface CompatibilityRisk {
  readonly legacyFeature: string;
  readonly changedAssumption: string;
  readonly diagnosticSource: string;
  readonly migrationTarget: string;
  readonly failureSignal: string;
}

export const compatibilityRisks: ReadonlyArray<CompatibilityRisk> = [
  {
    legacyFeature: "Global Vue API",
    changedAssumption: "Application config moves to a createApp instance.",
    diagnosticSource: "Migration build warning or code review inventory",
    migrationTarget: "main.ts app.use and app.mount flow",
    failureSignal: "Plugin order changes or test setup leaks across cases.",
  },
  {
    legacyFeature: "Filters",
    changedAssumption: "Template pipe formatting is removed.",
    diagnosticSource: "Template compiler error",
    migrationTarget: "modernized/formatProfileValue.ts",
    failureSignal: "Formatted profile labels change after refactor.",
  },
  {
    legacyFeature: "Event bus",
    changedAssumption: "Instance emitter APIs are removed.",
    diagnosticSource: "Migration build warning and missing owner map",
    migrationTarget: "modernized/ProfileEventContract.vue",
    failureSignal: "Saved event reaches hidden listeners without parent contract.",
  },
  {
    legacyFeature: "Router mode",
    changedAssumption: "History creation is explicit in Router 4.",
    diagnosticSource: "Router migration review",
    migrationTarget: "modernized/modernRouterConfig.ts",
    failureSignal: "Deep link refresh or guard redirect does not match old route.",
  },
];

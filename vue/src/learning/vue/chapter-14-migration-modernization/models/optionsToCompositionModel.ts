export interface ComponentMigrationStep {
  readonly step: string;
  readonly legacyOwner: string;
  readonly modernOwner: string;
  readonly preservedBehavior: string;
  readonly reviewSignal: string;
}

export const optionsToCompositionSteps: ReadonlyArray<ComponentMigrationStep> = [
  {
    step: "Characterize current behavior",
    legacyOwner: "legacy-shaped/LegacyOptionsProfile.vue",
    modernOwner: "tests/migrationInventory.test.ts",
    preservedBehavior: "Profile form starts with the same display name.",
    reviewSignal: "A PR changes behavior before a test captures it.",
  },
  {
    step: "Move local state",
    legacyOwner: "data and computed options",
    modernOwner: "modernized/useProfileForm.ts",
    preservedBehavior: "Dirty state still depends on draft value and initial value.",
    reviewSignal: "Computed state is replaced by duplicated mutable flags.",
  },
  {
    step: "Expose component contract",
    legacyOwner: "implicit this and methods",
    modernOwner: "ModernProfileComposition.vue emits",
    preservedBehavior: "Save still emits one typed profile payload.",
    reviewSignal: "Parent cannot see which event or payload changed.",
  },
];

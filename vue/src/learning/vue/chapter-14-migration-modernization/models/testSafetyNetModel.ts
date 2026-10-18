export interface TestSafetyNetItem {
  readonly target: string;
  readonly behaviorUnderTest: string;
  readonly testFile: string;
  readonly blockedSignal: string;
}

export const testSafetyNetItems: ReadonlyArray<TestSafetyNetItem> = [
  {
    target: "Formatting extraction",
    behaviorUnderTest: "Display name formatting remains stable.",
    testFile: "tests/formatProfileValue.test.ts",
    blockedSignal: "A filter replacement changes visible text.",
  },
  {
    target: "Store migration",
    behaviorUnderTest: "Profile update keeps the same state transition.",
    testFile: "tests/useProfileStore.test.ts",
    blockedSignal: "Pinia write path loses the profile id.",
  },
  {
    target: "Router migration",
    behaviorUnderTest: "Legacy route mapping preserves path and metadata.",
    testFile: "tests/routerMigrationModel.test.ts",
    blockedSignal: "Route guard metadata changes without review.",
  },
  {
    target: "Inventory gate",
    behaviorUnderTest: "Blocked items prevent migration approval.",
    testFile: "tests/migrationInventory.test.ts",
    blockedSignal: "Risk dashboard shows ready with blocked items.",
  },
];

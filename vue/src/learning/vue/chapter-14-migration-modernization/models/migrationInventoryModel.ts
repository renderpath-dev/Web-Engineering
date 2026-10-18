export type MigrationArea =
  | "component"
  | "state"
  | "router"
  | "build"
  | "typing"
  | "test"
  | "rollback";

export type MigrationStatus = "ready" | "blocked" | "watch";

export interface MigrationInventoryItem {
  readonly id: string;
  readonly area: MigrationArea;
  readonly legacyPattern: string;
  readonly preservedBehavior: string;
  readonly modernOwner: string;
  readonly evidenceFile: string;
  readonly riskScore: number;
  readonly status: MigrationStatus;
  readonly rollbackPath: string;
}

export const migrationInventoryItems: ReadonlyArray<MigrationInventoryItem> = [
  {
    id: "options-profile",
    area: "component",
    legacyPattern: "Options API profile form",
    preservedBehavior: "Editing a display name updates the submitted payload.",
    modernOwner: "modernized/ModernProfileComposition.vue",
    evidenceFile: "tests/migrationInventory.test.ts",
    riskScore: 3,
    status: "ready",
    rollbackPath: "Keep LegacyOptionsProfile.vue behind the chapter panel.",
  },
  {
    id: "profile-mixin",
    area: "component",
    legacyPattern: "Implicit mixin merge",
    preservedBehavior: "Dirty state and reset behavior stay visible.",
    modernOwner: "modernized/useProfileForm.ts",
    evidenceFile: "tests/migrationInventory.test.ts",
    riskScore: 4,
    status: "watch",
    rollbackPath: "Keep the mixin-shaped component until cleanup is verified.",
  },
  {
    id: "router-config",
    area: "router",
    legacyPattern: "Router 3 constructor config",
    preservedBehavior: "Profile URLs and auth metadata keep the same meaning.",
    modernOwner: "modernized/modernRouterConfig.ts",
    evidenceFile: "tests/routerMigrationModel.test.ts",
    riskScore: 5,
    status: "blocked",
    rollbackPath: "Restore the old route table if redirects regress.",
  },
  {
    id: "vuex-profile-module",
    area: "state",
    legacyPattern: "Vuex namespaced module",
    preservedBehavior: "Profile name updates remain explicit and testable.",
    modernOwner: "modernized/useProfileStore.ts",
    evidenceFile: "tests/useProfileStore.test.ts",
    riskScore: 4,
    status: "watch",
    rollbackPath: "Keep a store adapter while moving callers one feature at a time.",
  },
  {
    id: "vite-env",
    area: "build",
    legacyPattern: "Vue CLI env and asset assumptions",
    preservedBehavior: "Public env reads and asset URLs are validated in build.",
    modernOwner: "modernized/viteEnvBoundary.ts",
    evidenceFile: "tests/migrationInventory.test.ts",
    riskScore: 4,
    status: "watch",
    rollbackPath: "Keep the old build job until preview smoke passes.",
  },
];

export function getBlockedMigrationItems(
  items: ReadonlyArray<MigrationInventoryItem>,
): ReadonlyArray<MigrationInventoryItem> {
  return items.filter((item) => item.status === "blocked");
}

export function calculateMigrationRisk(
  items: ReadonlyArray<MigrationInventoryItem>,
): number {
  return items.reduce((total, item) => total + item.riskScore, 0);
}

export function getMigrationGateState(
  items: ReadonlyArray<MigrationInventoryItem>,
): MigrationStatus {
  if (items.some((item) => item.status === "blocked")) {
    return "blocked";
  }

  if (items.some((item) => item.status === "watch")) {
    return "watch";
  }

  return "ready";
}

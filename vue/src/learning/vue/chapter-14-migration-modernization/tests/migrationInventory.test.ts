import { describe, expect, it } from "vitest";
import {
  calculateMigrationRisk,
  getBlockedMigrationItems,
  getMigrationGateState,
  type MigrationInventoryItem,
} from "../models/migrationInventoryModel";

const inventory: ReadonlyArray<MigrationInventoryItem> = [
  {
    id: "ready-component",
    area: "component",
    legacyPattern: "Options API profile form",
    preservedBehavior: "Submit keeps the same payload.",
    modernOwner: "modernized/ModernProfileComposition.vue",
    evidenceFile: "tests/migrationInventory.test.ts",
    riskScore: 2,
    status: "ready",
    rollbackPath: "Restore legacy component.",
  },
  {
    id: "blocked-route",
    area: "router",
    legacyPattern: "Router guard redirect",
    preservedBehavior: "Admin redirect keeps old URL semantics.",
    modernOwner: "modernized/modernRouterConfig.ts",
    evidenceFile: "tests/routerMigrationModel.test.ts",
    riskScore: 5,
    status: "blocked",
    rollbackPath: "Restore legacy route table.",
  },
];

describe("migration inventory gate", () => {
  it("sums migration risk scores", () => {
    expect(calculateMigrationRisk(inventory)).toBe(7);
  });

  it("blocks approval when a blocked item exists", () => {
    expect(getMigrationGateState(inventory)).toBe("blocked");
    expect(getBlockedMigrationItems(inventory)).toHaveLength(1);
  });
});

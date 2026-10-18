import { describe, expect, it } from "vitest";
import {
  migrateLegacyRoute,
  type LegacyRouteRecord,
} from "../models/routerMigrationModel";
import {
  getRouteAuthRequirement,
  modernRouteRecords,
} from "../modernized/modernRouterConfig";

describe("router migration model", () => {
  it("preserves route path and auth metadata", () => {
    const legacyRoute: LegacyRouteRecord = {
      name: "profile-detail",
      path: "/profiles/:id",
      component: "LegacyProfilePage",
      meta: {
        requiresAuth: true,
      },
    };

    expect(migrateLegacyRoute(legacyRoute)).toEqual({
      name: "profile-detail",
      path: "/profiles/:id",
      componentPath: "LegacyProfilePage",
      meta: {
        requiresAuth: true,
      },
    });
  });

  it("exposes migrated route auth requirement", () => {
    expect(modernRouteRecords).toHaveLength(2);
    expect(getRouteAuthRequirement("profile-detail")).toBe(true);
    expect(getRouteAuthRequirement("missing-route")).toBe(false);
  });
});

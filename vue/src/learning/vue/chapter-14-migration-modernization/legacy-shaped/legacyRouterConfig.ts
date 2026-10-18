import type { LegacyRouteRecord } from "../models/routerMigrationModel";

export interface LegacyRouterConfig {
  readonly mode: "history" | "hash";
  readonly routes: ReadonlyArray<LegacyRouteRecord>;
}

export const legacyRouterConfig: LegacyRouterConfig = {
  mode: "history",
  routes: [
    {
      name: "profile-detail",
      path: "/profiles/:id",
      component: "LegacyProfilePage",
      meta: {
        requiresAuth: true,
      },
    },
    {
      name: "profile-settings",
      path: "/profiles/:id/settings",
      component: "LegacyProfileSettingsPage",
      meta: {
        requiresAuth: true,
      },
    },
  ],
};

import { createWebHistory, type RouterHistory } from "vue-router";
import {
  migrateLegacyRoute,
  type ModernRouteRecord,
} from "../models/routerMigrationModel";
import { legacyRouterConfig } from "../legacy-shaped/legacyRouterConfig";

export interface ModernRouterConfig {
  readonly history: RouterHistory;
  readonly routes: ReadonlyArray<ModernRouteRecord>;
}

export const modernRouteRecords: ReadonlyArray<ModernRouteRecord> =
  legacyRouterConfig.routes.map((route) => migrateLegacyRoute(route));

export function createModernRouterConfig(): ModernRouterConfig {
  return {
    history: createWebHistory(),
    routes: modernRouteRecords,
  };
}

export function getRouteAuthRequirement(routeName: string): boolean {
  return (
    modernRouteRecords.find((route) => route.name === routeName)?.meta
      .requiresAuth ?? false
  );
}

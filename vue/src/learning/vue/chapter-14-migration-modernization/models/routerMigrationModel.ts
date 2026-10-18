export interface LegacyRouteRecord {
  readonly name: string;
  readonly path: string;
  readonly component: string;
  readonly meta: {
    readonly requiresAuth: boolean;
  };
}

export interface ModernRouteRecord {
  readonly name: string;
  readonly path: string;
  readonly componentPath: string;
  readonly meta: {
    readonly requiresAuth: boolean;
  };
}

export interface RouterMigrationSummary {
  readonly legacyApi: string;
  readonly modernApi: string;
  readonly preservedUrl: string;
  readonly testEvidence: string;
}

export const routerMigrationSummaries: ReadonlyArray<RouterMigrationSummary> = [
  {
    legacyApi: "new Router({ mode: 'history' })",
    modernApi: "createRouter({ history: createWebHistory() })",
    preservedUrl: "/profiles/:id",
    testEvidence: "tests/routerMigrationModel.test.ts",
  },
  {
    legacyApi: "beforeEach guard",
    modernApi: "Router 4 beforeEach guard",
    preservedUrl: "/admin",
    testEvidence: "manual redirect smoke plus unit mapping check",
  },
];

export function migrateLegacyRoute(
  route: LegacyRouteRecord,
): ModernRouteRecord {
  return {
    name: route.name,
    path: route.path,
    componentPath: route.component,
    meta: {
      requiresAuth: route.meta.requiresAuth,
    },
  };
}

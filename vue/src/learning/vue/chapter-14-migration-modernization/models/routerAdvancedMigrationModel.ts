export type RouterMigrationTopic =
  | "factory"
  | "history"
  | "base"
  | "catch-all"
  | "is-ready"
  | "navigation-promise";

export interface RouterAdvancedMigrationItem {
  readonly topic: RouterMigrationTopic;
  readonly legacyPattern: string;
  readonly modernReplacement: string;
  readonly runtimeBehaviorPreserved: string;
  readonly typeBoundary: string;
  readonly evidence: string;
  readonly failureSignal: string;
  readonly rollbackStrategy: string;
}

export const routerAdvancedMigrationItems: ReadonlyArray<RouterAdvancedMigrationItem> =
  [
    {
      topic: "factory",
      legacyPattern: "new Router with a shared plugin-installed router",
      modernReplacement: "createRouter with an explicit router instance",
      runtimeBehaviorPreserved: "The app still owns exactly one route matcher.",
      typeBoundary: "Route record typing is checked when route definitions are explicit.",
      evidence: "tests/routerMigrationModel.test.ts",
      failureSignal: "Route records are missing or duplicated at startup.",
      rollbackStrategy: "Keep the old route table as a mapping source.",
    },
    {
      topic: "history",
      legacyPattern: "mode: history or mode: hash",
      modernReplacement: "createWebHistory or createWebHashHistory",
      runtimeBehaviorPreserved: "URLs keep the same user-facing shape.",
      typeBoundary: "History mode is runtime router configuration.",
      evidence: "modernized/modernRouterConfig.ts",
      failureSignal: "Deep links fail after refresh.",
      rollbackStrategy: "Switch the history factory only after deploy fallback is verified.",
    },
    {
      topic: "base",
      legacyPattern: "base is configured beside mode",
      modernReplacement: "base is passed to the selected history factory",
      runtimeBehaviorPreserved: "The same deployment subpath resolves route links.",
      typeBoundary: "The base path is a runtime deployment value.",
      evidence: "models/routerAdvancedMigrationModel.ts",
      failureSignal: "Generated links omit the deployment base.",
      rollbackStrategy: "Keep a route smoke check for the production base.",
    },
    {
      topic: "catch-all",
      legacyPattern: "Star route catches unmatched paths",
      modernReplacement: "Named custom regexp param catch-all route",
      runtimeBehaviorPreserved: "Unknown URLs still reach the not-found page.",
      typeBoundary: "Param typing depends on the route record shape.",
      evidence: "models/routerAdvancedMigrationModel.ts",
      failureSignal: "The not-found route never matches.",
      rollbackStrategy: "Add explicit tests for unknown paths before migration.",
    },
    {
      topic: "is-ready",
      legacyPattern: "Initial navigation is assumed complete after mount",
      modernReplacement: "Wait for router.isReady before assertions or hydration-sensitive checks",
      runtimeBehaviorPreserved: "The first rendered route still matches the requested URL.",
      typeBoundary: "router.isReady returns a Promise that TypeScript can enforce at call sites.",
      evidence: "models/routerAdvancedMigrationModel.ts",
      failureSignal: "Tests assert the previous route or hydration starts too early.",
      rollbackStrategy: "Keep startup assertions behind an explicit ready gate.",
    },
    {
      topic: "navigation-promise",
      legacyPattern: "push and replace errors are handled by callback assumptions",
      modernReplacement: "Await navigation promises and inspect navigation failures",
      runtimeBehaviorPreserved: "Redirect, abort, and duplicate navigation outcomes stay observable.",
      typeBoundary: "Promise results must be handled explicitly in async call sites.",
      evidence: "models/routerAdvancedMigrationModel.ts",
      failureSignal: "Duplicate navigation or guard aborts are reported as unhandled errors.",
      rollbackStrategy: "Wrap navigation calls with a small typed helper first.",
    },
  ];

export function getRouterMigrationTopic(
  topic: RouterMigrationTopic,
): RouterAdvancedMigrationItem {
  const item = routerAdvancedMigrationItems.find((entry) => entry.topic === topic);

  if (!item) {
    throw new Error(`Missing router migration topic: ${topic}`);
  }

  return item;
}

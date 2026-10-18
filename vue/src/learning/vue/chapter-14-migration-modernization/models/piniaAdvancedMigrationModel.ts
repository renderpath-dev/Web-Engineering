export type PiniaMigrationTopic =
  | "module-store"
  | "state-function"
  | "getter"
  | "action"
  | "mutation"
  | "outside-component"
  | "coexistence";

export interface PiniaAdvancedMigrationItem {
  readonly topic: PiniaMigrationTopic;
  readonly legacyPattern: string;
  readonly modernReplacement: string;
  readonly runtimeBehaviorPreserved: string;
  readonly typeBoundary: string;
  readonly evidence: string;
  readonly failureSignal: string;
  readonly rollbackStrategy: string;
}

export const piniaAdvancedMigrationItems: ReadonlyArray<PiniaAdvancedMigrationItem> =
  [
    {
      topic: "module-store",
      legacyPattern: "Vuex namespaced module",
      modernReplacement: "Pinia store id with domain-owned state",
      runtimeBehaviorPreserved: "Callers still address the same domain state.",
      typeBoundary: "Store ids are strings, while returned store fields are typed.",
      evidence: "tests/useProfileStore.test.ts",
      failureSignal: "Two modules collapse into one store and overwrite each other.",
      rollbackStrategy: "Migrate one namespace to one store id.",
    },
    {
      topic: "state-function",
      legacyPattern: "Module state object",
      modernReplacement: "Pinia state function returning fresh state",
      runtimeBehaviorPreserved: "Each app instance receives isolated initial state.",
      typeBoundary: "State shape is inferred from the returned object.",
      evidence: "models/piniaAdvancedMigrationModel.ts",
      failureSignal: "Tests share mutated state across cases.",
      rollbackStrategy: "Add a store factory reset helper before migration.",
    },
    {
      topic: "getter",
      legacyPattern: "Getter receives state, getters, rootState, and rootGetters",
      modernReplacement: "Pinia getter uses state argument or this for same-store values",
      runtimeBehaviorPreserved: "Derived values keep the same visible meaning.",
      typeBoundary: "Cross-store reads need explicit imports and return types.",
      evidence: "models/piniaAdvancedMigrationModel.ts",
      failureSignal: "A derived value reads from the wrong namespace.",
      rollbackStrategy: "Move cross-store reads after same-store getters pass.",
    },
    {
      topic: "action",
      legacyPattern: "Action context commit and dispatch",
      modernReplacement: "Pinia action mutates this and calls other actions directly",
      runtimeBehaviorPreserved: "Async workflows still expose the same success and failure states.",
      typeBoundary: "this typing depends on method syntax.",
      evidence: "models/piniaAdvancedMigrationModel.ts",
      failureSignal: "Action loses store context or returns the wrong payload.",
      rollbackStrategy: "Wrap legacy action calls until callers move to the store.",
    },
    {
      topic: "mutation",
      legacyPattern: "Mutation is the only state write path",
      modernReplacement: "Direct assignment or named action based on audit needs",
      runtimeBehaviorPreserved: "State changes stay deliberate and traceable.",
      typeBoundary: "Direct assignment is typed, but audit policy is architectural.",
      evidence: "tests/useProfileStore.test.ts",
      failureSignal: "State writes become scattered and hard to review.",
      rollbackStrategy: "Keep domain actions for important writes.",
    },
    {
      topic: "outside-component",
      legacyPattern: "Store is imported and used before app installation is complete",
      modernReplacement: "Call useStore after Pinia is installed or pass the Pinia instance",
      runtimeBehaviorPreserved: "The same store instance serves runtime code.",
      typeBoundary: "Initialization order is runtime behavior.",
      evidence: "models/piniaAdvancedMigrationModel.ts",
      failureSignal: "Active Pinia is missing during route guard or utility execution.",
      rollbackStrategy: "Move store access into a function called after app setup.",
    },
    {
      topic: "coexistence",
      legacyPattern: "All Vuex modules are replaced in one step",
      modernReplacement: "Vuex and Pinia coexist during staged migration when the app permits it",
      runtimeBehaviorPreserved: "Unmigrated callers keep working while migrated domains gain Pinia typing.",
      typeBoundary: "Boundary adapters must type both legacy and modern contracts.",
      evidence: "models/piniaAdvancedMigrationModel.ts",
      failureSignal: "A broad migration blocks unrelated feature work.",
      rollbackStrategy: "Ship one domain store and leave the rest behind adapters.",
    },
  ];

export function getPiniaMigrationTopic(
  topic: PiniaMigrationTopic,
): PiniaAdvancedMigrationItem {
  const item = piniaAdvancedMigrationItems.find((entry) => entry.topic === topic);

  if (!item) {
    throw new Error(`Missing Pinia migration topic: ${topic}`);
  }

  return item;
}

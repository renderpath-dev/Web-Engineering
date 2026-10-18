export type RemovedApiTopic =
  | "events-api"
  | "$children"
  | "propsData"
  | "$destroy"
  | "$set"
  | "$delete"
  | "filters";

export interface RemovedApiMigrationItem {
  readonly topic: RemovedApiTopic;
  readonly legacyPattern: string;
  readonly modernReplacement: string;
  readonly runtimeBehaviorPreserved: string;
  readonly typeBoundary: string;
  readonly evidence: string;
  readonly failureSignal: string;
  readonly rollbackStrategy: string;
}

export const removedApiMigrationItems: ReadonlyArray<RemovedApiMigrationItem> = [
  {
    topic: "events-api",
    legacyPattern: "$on, $off, and $once on a component instance",
    modernReplacement: "props/emits, provide/inject, a scoped emitter, or a store action",
    runtimeBehaviorPreserved: "Publisher and subscriber still exchange the same domain event.",
    typeBoundary: "External emitters need explicit event maps to stay type-safe.",
    evidence: "legacy-shaped/legacyRemovedApisModel.ts",
    failureSignal: "A hidden subscriber keeps running after the owner is unmounted.",
    rollbackStrategy: "Keep the emitter adapter while moving subscribers by owner.",
  },
  {
    topic: "$children",
    legacyPattern: "Parent reads child instances by implicit render order",
    modernReplacement: "Template refs, explicit child registration, or prop-driven state",
    runtimeBehaviorPreserved: "The parent still reaches the intended child capability.",
    typeBoundary: "TypeScript cannot prove child order in a rendered tree.",
    evidence: "tests/removedApiReplacement.test.ts",
    failureSignal: "The parent calls the wrong child after conditional rendering changes.",
    rollbackStrategy: "Introduce explicit refs before deleting the old lookup.",
  },
  {
    topic: "propsData",
    legacyPattern: "Test mount uses propsData",
    modernReplacement: "Test mount uses props",
    runtimeBehaviorPreserved: "The mounted component receives the same prop values.",
    typeBoundary: "Vue Test Utils prop names are checked against component typing when available.",
    evidence: "tests/removedApiReplacement.test.ts",
    failureSignal: "Tests mount with empty props or stale setup helpers.",
    rollbackStrategy: "Update test factories before changing component internals.",
  },
  {
    topic: "$destroy",
    legacyPattern: "Manual instance destroy controls teardown",
    modernReplacement: "Conditional rendering, app unmount, or effect cleanup",
    runtimeBehaviorPreserved: "Timers, listeners, and DOM integrations still stop at owner teardown.",
    typeBoundary: "Types do not prove cleanup execution.",
    evidence: "modernized/removedApiReplacement.ts",
    failureSignal: "Intervals or external listeners continue after navigation.",
    rollbackStrategy: "Keep a cleanup harness until unmount smoke passes.",
  },
  {
    topic: "$set",
    legacyPattern: "Dynamic object property is added with $set",
    modernReplacement: "Assign to a reactive proxy or replace an immutable object",
    runtimeBehaviorPreserved: "The new property still participates in reactive rendering.",
    typeBoundary: "Dynamic keys need index signatures or explicit records.",
    evidence: "tests/removedApiReplacement.test.ts",
    failureSignal: "A newly added field is invisible to the UI.",
    rollbackStrategy: "Normalize the object shape before removing the helper call.",
  },
  {
    topic: "$delete",
    legacyPattern: "Dynamic object property is removed with $delete",
    modernReplacement: "delete on a reactive proxy or replace the object without the key",
    runtimeBehaviorPreserved: "The removed field disappears from rendered derived state.",
    typeBoundary: "Optional keys need explicit optional field modeling.",
    evidence: "tests/removedApiReplacement.test.ts",
    failureSignal: "A removed field stays visible in derived output.",
    rollbackStrategy: "Move deletion behind a named domain operation first.",
  },
  {
    topic: "filters",
    legacyPattern: "Template filter pipe formats display text",
    modernReplacement: "Computed value, method, or imported pure formatter",
    runtimeBehaviorPreserved: "The user sees the same formatted text.",
    typeBoundary: "Formatter input and output can be unit-tested as plain TypeScript.",
    evidence: "tests/formatProfileValue.test.ts",
    failureSignal: "Visible text changes during migration.",
    rollbackStrategy: "Keep the pure formatter test as the acceptance gate.",
  },
];

export function getRemovedApiMigration(topic: RemovedApiTopic): RemovedApiMigrationItem {
  const item = removedApiMigrationItems.find((entry) => entry.topic === topic);

  if (!item) {
    throw new Error(`Missing removed API migration topic: ${topic}`);
  }

  return item;
}
